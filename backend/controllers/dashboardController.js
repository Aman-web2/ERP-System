const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const ProjectTask = require('../models/ProjectTask');
const Notification = require('../models/Notification');
const Product = require('../models/Product');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const { mapMonthlyTotals } = require('../utils/analytics');

const getDashboardSummary = asyncHandler(async (req, res) => {
  const [
    employees,
    transactions,
    tasks,
    notifications,
    orders,
    recentOrders,
    lowStockProducts,
    pendingLeaves,
    attendanceToday
  ] = await Promise.all([
    User.find({ role: { $ne: 'Admin' } }).populate('department', 'name'),
    Transaction.find({ status: 'Completed' }),
    ProjectTask.find({}).populate('assignee', 'name'),
    Notification.find({}).sort('-createdAt').limit(5),
    Order.find({}).populate('customer', 'name'),
    Order.find({}).populate('customer', 'name').sort('-createdAt').limit(5),
    Product.find({ status: { $in: ['Low Stock', 'Out of Stock'] } }).select('name quantity status'),
    Leave.find({ status: 'Pending' }).populate('employee', 'name').limit(5),
    Attendance.find({
      date: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    })
  ]);

  const revenue = transactions.filter((item) => item.type === 'Income').reduce((sum, item) => sum + item.amount, 0);
  const expense = transactions.filter((item) => item.type === 'Expense').reduce((sum, item) => sum + item.amount, 0);
  const taskStats = {
    total: tasks.length,
    pending: tasks.filter((task) => task.status !== 'Done').length,
    completed: tasks.filter((task) => task.status === 'Done').length
  };

  const revenueData = mapMonthlyTotals({ documents: orders, amountField: 'totalAmount' }).map((item) => ({
    name: item.name,
    revenue: item.value,
    orders: item.count
  }));

  const departmentBreakdownMap = employees.reduce((accumulator, employee) => {
    const key = employee.department?.name || 'Unassigned';
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

  const recentActivities = [
    ...recentOrders.map((order) => ({
      id: order._id,
      type: 'order',
      title: `Order ${order._id.toString().slice(-6).toUpperCase()} created`,
      description: order.customer?.name || 'Customer order',
      createdAt: order.createdAt
    })),
    ...notifications.map((notification) => ({
      id: notification._id,
      type: 'notification',
      title: notification.title,
      description: notification.message,
      createdAt: notification.createdAt
    }))
  ]
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .slice(0, 8);

  res.json({
    stats: {
      totalEmployees: employees.length,
      revenue,
      expense,
      balance: revenue - expense,
      totalOrders: orders.length,
      pendingTasks: taskStats.pending,
      notifications: notifications.length,
      lowStock: lowStockProducts.length,
      pendingLeaves: pendingLeaves.length,
      attendanceToday: attendanceToday.length
    },
    revenueData,
    departmentBreakdown: Object.entries(departmentBreakdownMap).map(([name, value]) => ({ name, value })),
    taskBreakdown: [
      { name: 'Pending', value: taskStats.pending },
      { name: 'Completed', value: taskStats.completed }
    ],
    alerts: {
      lowStockProducts,
      pendingLeaves
    },
    recentActivities
  });
});

module.exports = {
  getDashboardSummary
};

