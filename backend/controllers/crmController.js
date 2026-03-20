const asyncHandler = require('express-async-handler');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const { validatePayload } = require('../utils/validate');
const { customerSchemas } = require('../validators/schemas');
const { buildListOptions, sendPaginatedResponse } = require('../utils/pagination');

const getCustomers = asyncHandler(async (req, res) => {
  const { search } = buildListOptions(req.query);
  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } }
    ];
  }

  const result = await sendPaginatedResponse({
    model: Customer,
    filter,
    query: req.query
  });

  res.json(result);
});

const getCustomerById = asyncHandler(async (req, res) => {
  const [customer, orders] = await Promise.all([
    Customer.findById(req.params.id),
    Order.find({ customer: req.params.id }).sort('-createdAt')
  ]);

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  res.json({
    ...customer.toObject(),
    purchaseHistory: orders,
    totalSpent: orders.filter((order) => order.paymentStatus === 'Paid').reduce((sum, order) => sum + order.totalAmount, 0)
  });
});

const createCustomer = asyncHandler(async (req, res) => {
  const payload = validatePayload(customerSchemas.create, req.body);
  const customerExists = await Customer.findOne({ email: payload.email });

  if (customerExists) {
    res.status(400);
    throw new Error('Customer with this email already exists');
  }

  const customer = await Customer.create(payload);
  res.status(201).json(customer);
});

const updateCustomer = asyncHandler(async (req, res) => {
  const payload = validatePayload(customerSchemas.update, req.body);
  const customer = await Customer.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  res.json(customer);
});

const addCustomerFeedback = asyncHandler(async (req, res) => {
  const payload = validatePayload(customerSchemas.feedback, req.body);
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  customer.feedback.push({
    ...payload,
    createdBy: req.user._id
  });
  await customer.save();

  res.status(201).json(customer.feedback[customer.feedback.length - 1]);
});

const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  await customer.deleteOne();
  res.json({ message: 'Customer removed' });
});

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  addCustomerFeedback,
  deleteCustomer
};

