const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const { buildWorkbookBuffer, buildPdfBuffer } = require('../utils/reportExport');

const reportBuilders = {
  employees: async () => User.find({ role: { $ne: 'Admin' } }).populate('department', 'name').populate('designation', 'title'),
  inventory: async () => Product.find({}).populate('category', 'name').populate('supplier', 'name'),
  sales: async () => Order.find({}).populate('customer', 'name company'),
  finance: async () => Transaction.find({})
};

const normalizeRows = (type, documents) => {
  if (type === 'employees') {
    return documents.map((item) => ({
      employeeId: item.employeeId,
      name: item.name,
      email: item.email,
      role: item.role,
      department: item.department?.name || 'Unassigned',
      designation: item.designation?.title || 'Unassigned',
      salary: item.salary,
      status: item.isActive ? 'Active' : 'Inactive'
    }));
  }

  if (type === 'inventory') {
    return documents.map((item) => ({
      name: item.name,
      sku: item.sku,
      category: item.category?.name || 'Uncategorized',
      supplier: item.supplier?.name || 'Not assigned',
      quantity: item.quantity,
      status: item.status,
      price: item.price
    }));
  }

  if (type === 'sales') {
    return documents.map((item) => ({
      orderId: item._id.toString(),
      customer: item.customer?.name || 'Unknown',
      status: item.status,
      paymentStatus: item.paymentStatus,
      totalAmount: item.totalAmount,
      createdAt: item.createdAt.toISOString()
    }));
  }

  return documents.map((item) => ({
    type: item.type,
    category: item.category,
    description: item.description,
    amount: item.amount,
    status: item.status,
    date: item.date.toISOString()
  }));
};

const getReport = asyncHandler(async (req, res) => {
  const type = req.params.type;
  if (!reportBuilders[type]) {
    res.status(404);
    throw new Error('Report type not found');
  }

  const documents = await reportBuilders[type]();
  const rows = normalizeRows(type, documents);

  if (req.query.format === 'xlsx') {
    const buffer = buildWorkbookBuffer(type, rows);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-report.xlsx"`);
    return res.send(buffer);
  }

  if (req.query.format === 'pdf') {
    const buffer = await buildPdfBuffer({ title: `${type.toUpperCase()} Report`, rows });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-report.pdf"`);
    return res.send(buffer);
  }

  res.json({ type, rows });
});

module.exports = {
  getReport
};

