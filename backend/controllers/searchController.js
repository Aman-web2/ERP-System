const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const ProjectTask = require('../models/ProjectTask');

const getGlobalSearch = asyncHandler(async (req, res) => {
  const query = String(req.query.q || '').trim();
  if (!query) {
    return res.json({ employees: [], products: [], customers: [], orders: [], tasks: [] });
  }

  const regex = new RegExp(query, 'i');
  const [employees, products, customers, orders, tasks] = await Promise.all([
    User.find({ $or: [{ name: regex }, { email: regex }, { employeeId: regex }] }).limit(5).select('name email employeeId role'),
    Product.find({ $or: [{ name: regex }, { sku: regex }] }).limit(5).select('name sku status quantity'),
    Customer.find({ $or: [{ name: regex }, { email: regex }, { company: regex }] }).limit(5).select('name email company status'),
    Order.find({}).sort('-createdAt').limit(10).select('status paymentStatus totalAmount createdAt').populate('customer', 'name'),
    ProjectTask.find({ $or: [{ title: regex }, { description: regex }] }).limit(5).select('title status priority dueDate')
  ]);

  res.json({
    employees,
    products,
    customers,
    orders: orders.filter((order) => order.customer?.name?.match(regex) || order._id.toString().match(regex)),
    tasks
  });
});

module.exports = {
  getGlobalSearch
};

