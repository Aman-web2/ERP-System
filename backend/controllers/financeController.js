const asyncHandler = require('express-async-handler');
const Transaction = require('../models/Transaction');
const Invoice = require('../models/Invoice');
const Payroll = require('../models/Payroll');
const Order = require('../models/Order');
const { validatePayload } = require('../utils/validate');
const { financeSchemas } = require('../validators/schemas');
const { sendPaginatedResponse } = require('../utils/pagination');
const { mapMonthlyTotals } = require('../utils/analytics');
const { buildPdfBuffer } = require('../utils/reportExport');
const { createNotification } = require('../services/notificationService');
const { ROLES } = require('../constants/roles');

const buildInvoiceTotals = (items, taxAmount = 0, discountAmount = 0) => {
  const subtotal = items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.price), 0);
  const totalAmount = subtotal + Number(taxAmount || 0) - Number(discountAmount || 0);
  return { subtotal, totalAmount };
};

const createTransaction = async ({ payload, userId }) => Transaction.create({
  ...payload,
  addedBy: userId,
  date: payload.date || Date.now()
});

const getTransactions = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.type) {
    filter.type = req.query.type;
  }
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const result = await sendPaginatedResponse({
    model: Transaction,
    filter,
    query: req.query,
    populate: { path: 'addedBy', select: 'name' }
  });

  res.json(result);
});

const addTransaction = asyncHandler(async (req, res) => {
  const payload = validatePayload(financeSchemas.transaction, req.body);
  const transaction = await createTransaction({ payload, userId: req.user._id });
  res.status(201).json(transaction);
});

const getSummary = asyncHandler(async (req, res) => {
  const [transactions, invoices, payrolls, orders] = await Promise.all([
    Transaction.find({}),
    Invoice.find({}),
    Payroll.find({}),
    Order.find({ paymentStatus: 'Paid' })
  ]);

  const income = transactions
    .filter((transaction) => transaction.type === 'Income' && transaction.status === 'Completed')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const expense = transactions
    .filter((transaction) => transaction.type === 'Expense' && transaction.status === 'Completed')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const balance = income - expense;
  const unpaidInvoices = invoices.filter((invoice) => invoice.status !== 'Paid').length;
  const pendingPayrolls = payrolls.filter((payroll) => payroll.status === 'Pending').length;
  const monthlyIncome = mapMonthlyTotals({ documents: transactions.filter((item) => item.type === 'Income'), dateField: 'date', amountField: 'amount' });
  const monthlyExpense = mapMonthlyTotals({ documents: transactions.filter((item) => item.type === 'Expense'), dateField: 'date', amountField: 'amount' });
  const sales = mapMonthlyTotals({ documents: orders, dateField: 'createdAt', amountField: 'totalAmount' });

  res.json({
    income,
    expense,
    balance,
    unpaidInvoices,
    pendingPayrolls,
    charts: monthlyIncome.map((item, index) => ({
      name: item.name,
      income: item.value,
      expense: monthlyExpense[index]?.value || 0,
      sales: sales[index]?.value || 0
    }))
  });
});

const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);
  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }

  await transaction.deleteOne();
  res.json({ message: 'Transaction removed' });
});

const getInvoices = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) {
    filter.status = req.query.status;
  }
  if (req.query.customer) {
    filter.customer = req.query.customer;
  }

  const result = await sendPaginatedResponse({
    model: Invoice,
    filter,
    query: req.query,
    populate: [
      { path: 'customer', select: 'name email company' },
      { path: 'generatedBy', select: 'name' },
      { path: 'order', select: 'status totalAmount' }
    ]
  });

  res.json(result);
});

const createInvoice = asyncHandler(async (req, res) => {
  const payload = validatePayload(financeSchemas.invoice, req.body);
  const totals = buildInvoiceTotals(payload.items, payload.taxAmount, payload.discountAmount);

  const invoice = await Invoice.create({
    ...payload,
    ...totals,
    invoiceNumber: `INV-${Date.now()}`,
    generatedBy: req.user._id
  });

  res.status(201).json(invoice);
});

const updateInvoiceStatus = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id).populate('customer', 'name');

  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  invoice.status = req.body.status || invoice.status;
  await invoice.save();

  if (invoice.status === 'Paid') {
    await createTransaction({
      payload: {
        type: 'Income',
        amount: invoice.totalAmount,
        category: 'Invoice Payment',
        description: `Payment received for ${invoice.invoiceNumber}`,
        referenceId: invoice._id.toString(),
        status: 'Completed'
      },
      userId: req.user._id
    });
  }

  await createNotification({
    title: 'Invoice updated',
    message: `${invoice.invoiceNumber} is now ${invoice.status}.`,
    type: invoice.status === 'Paid' ? 'success' : 'info',
    module: 'finance',
    recipientRoles: [ROLES.ADMIN, ROLES.ACCOUNTANT],
    createdBy: req.user._id,
    actionUrl: '/finance'
  });

  res.json(invoice);
});

const downloadInvoicePdf = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate('customer', 'name email company')
    .populate('generatedBy', 'name');

  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  const rows = [
    {
      invoiceNumber: invoice.invoiceNumber,
      customer: invoice.customer?.name,
      status: invoice.status,
      dueDate: invoice.dueDate.toISOString().split('T')[0],
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      discountAmount: invoice.discountAmount,
      totalAmount: invoice.totalAmount,
      generatedBy: invoice.generatedBy?.name || 'System'
    },
    ...invoice.items.map((item, index) => ({
      line: index + 1,
      item: item.name,
      quantity: item.quantity,
      price: item.price,
      lineTotal: item.quantity * item.price
    }))
  ];

  const buffer = await buildPdfBuffer({
    title: `Invoice ${invoice.invoiceNumber}`,
    rows
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.pdf"`);
  res.send(buffer);
});

const getPayrolls = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) {
    filter.status = req.query.status;
  }
  if (req.query.employee) {
    filter.employee = req.query.employee;
  }

  const result = await sendPaginatedResponse({
    model: Payroll,
    filter,
    query: req.query,
    populate: [
      { path: 'employee', select: 'name employeeId role' },
      { path: 'processedBy', select: 'name' }
    ]
  });

  res.json(result);
});

const createPayroll = asyncHandler(async (req, res) => {
  const payload = validatePayload(financeSchemas.payroll, req.body);
  const netSalary = payload.basicSalary + payload.allowances - payload.deductions;

  const payroll = await Payroll.create({
    ...payload,
    netSalary,
    processedBy: req.user._id,
    paidAt: payload.status === 'Paid' ? new Date() : undefined
  });

  if (payroll.status === 'Paid') {
    await createTransaction({
      payload: {
        type: 'Expense',
        amount: payroll.netSalary,
        category: 'Payroll',
        description: `Salary paid for ${payload.month}/${payload.year}`,
        referenceId: payroll._id.toString(),
        status: 'Completed'
      },
      userId: req.user._id
    });
  }

  res.status(201).json(payroll);
});

const updatePayrollStatus = asyncHandler(async (req, res) => {
  const payroll = await Payroll.findById(req.params.id).populate('employee', 'name');

  if (!payroll) {
    res.status(404);
    throw new Error('Payroll not found');
  }

  payroll.status = req.body.status || payroll.status;
  payroll.paidAt = payroll.status === 'Paid' ? new Date() : payroll.paidAt;
  payroll.processedBy = req.user._id;
  await payroll.save();

  if (payroll.status === 'Paid') {
    await createTransaction({
      payload: {
        type: 'Expense',
        amount: payroll.netSalary,
        category: 'Payroll',
        description: `Salary paid to ${payroll.employee?.name}`,
        referenceId: payroll._id.toString(),
        status: 'Completed'
      },
      userId: req.user._id
    });
  }

  res.json(payroll);
});

module.exports = {
  getTransactions,
  addTransaction,
  getSummary,
  deleteTransaction,
  getInvoices,
  createInvoice,
  updateInvoiceStatus,
  downloadInvoicePdf,
  getPayrolls,
  createPayroll,
  updatePayrollStatus
};

