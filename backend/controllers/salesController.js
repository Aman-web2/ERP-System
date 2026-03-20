const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Invoice = require('../models/Invoice');
const Transaction = require('../models/Transaction');
const StockMovement = require('../models/StockMovement');
const { validatePayload } = require('../utils/validate');
const { salesSchemas } = require('../validators/schemas');
const { sendPaginatedResponse } = require('../utils/pagination');
const { mapMonthlyTotals } = require('../utils/analytics');
const { createNotification } = require('../services/notificationService');
const { ROLES } = require('../constants/roles');

const createInvoiceForOrder = async ({ order, userId }) => Invoice.create({
  invoiceNumber: `INV-${Date.now()}`,
  customer: order.customer,
  order: order._id,
  items: order.orderItems.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    price: item.price
  })),
  subtotal: order.orderItems.reduce((sum, item) => sum + item.quantity * item.price, 0),
  taxAmount: order.taxAmount,
  discountAmount: order.discountAmount,
  totalAmount: order.totalAmount,
  dueDate: order.estimatedDelivery || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  status: order.paymentStatus === 'Paid' ? 'Paid' : 'Unpaid',
  generatedBy: userId
});

const createOrder = asyncHandler(async (req, res) => {
  const payload = validatePayload(salesSchemas.order, req.body);

  for (const item of payload.orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product ${item.name} not found`);
    }
    if (product.quantity < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}`);
    }
  }

  const subtotal = payload.orderItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const totalAmount = subtotal + payload.taxAmount - payload.discountAmount;

  const order = await Order.create({
    ...payload,
    totalAmount,
    createdBy: req.user._id
  });

  for (const item of payload.orderItems) {
    const product = await Product.findById(item.product);
    product.quantity -= item.quantity;
    await product.save();
    await StockMovement.create({
      product: product._id,
      type: 'OUT',
      quantity: item.quantity,
      remarks: `Order ${order._id}`,
      performedBy: req.user._id,
      reference: order._id.toString()
    });
  }

  const invoice = await createInvoiceForOrder({ order, userId: req.user._id });
  order.invoice = invoice._id;
  await order.save();

  if (order.paymentStatus === 'Paid') {
    await Transaction.create({
      type: 'Income',
      amount: order.totalAmount,
      category: 'Sales',
      description: `Order payment for ${order._id}`,
      referenceId: order._id.toString(),
      status: 'Completed',
      addedBy: req.user._id
    });
  }

  await createNotification({
    title: 'New order created',
    message: `Order ${order._id.toString().slice(-6).toUpperCase()} was created successfully.`,
    type: 'success',
    module: 'sales',
    recipientRoles: [ROLES.ADMIN, ROLES.ACCOUNTANT],
    createdBy: req.user._id,
    actionUrl: '/sales'
  });

  res.status(201).json(await Order.findById(order._id)
    .populate('customer', 'name email company')
    .populate('invoice'));
});

const getOrders = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) {
    filter.status = req.query.status;
  }
  if (req.query.paymentStatus) {
    filter.paymentStatus = req.query.paymentStatus;
  }
  if (req.query.customer) {
    filter.customer = req.query.customer;
  }

  const result = await sendPaginatedResponse({
    model: Order,
    filter,
    query: req.query,
    populate: [
      { path: 'customer', select: 'name email company' },
      { path: 'createdBy', select: 'name' },
      { path: 'invoice', select: 'invoiceNumber status totalAmount' }
    ]
  });

  res.json(result);
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'name email company phone address')
    .populate('createdBy', 'name')
    .populate('invoice');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.json(order);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const payload = validatePayload(salesSchemas.updateStatus, req.body);
  const order = await Order.findById(req.params.id).populate('invoice');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (payload.status) {
    order.status = payload.status;
  }
  if (payload.paymentStatus) {
    order.paymentStatus = payload.paymentStatus;
  }
  await order.save();

  if (order.invoice) {
    order.invoice.status = order.paymentStatus === 'Paid' ? 'Paid' : order.invoice.status;
    await order.invoice.save();
  }

  if (payload.paymentStatus === 'Paid') {
    await Transaction.create({
      type: 'Income',
      amount: order.totalAmount,
      category: 'Sales',
      description: `Order payment for ${order._id}`,
      referenceId: order._id.toString(),
      status: 'Completed',
      addedBy: req.user._id
    });
  }

  res.json(order);
});

const getSalesAnalytics = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('customer', 'name');
  const totalRevenue = orders.filter((order) => order.paymentStatus === 'Paid').reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter((order) => order.status === 'Delivered').length;
  const pendingOrders = orders.filter((order) => order.status !== 'Delivered').length;
  const chart = mapMonthlyTotals({ documents: orders, dateField: 'createdAt', amountField: 'totalAmount' });

  res.json({
    totalRevenue,
    totalOrders,
    deliveredOrders,
    pendingOrders,
    chart
  });
});

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getSalesAnalytics
};

