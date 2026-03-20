const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/financeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/transactions')
  .get(protect, authorize('Admin', 'Accountant'), getTransactions)
  .post(protect, authorize('Admin', 'Accountant'), addTransaction);
router.get('/summary', protect, authorize('Admin', 'Accountant'), getSummary);
router.delete('/transactions/:id', protect, authorize('Admin', 'Accountant'), deleteTransaction);

router.route('/invoices')
  .get(protect, authorize('Admin', 'Accountant'), getInvoices)
  .post(protect, authorize('Admin', 'Accountant'), createInvoice);
router.put('/invoices/:id/status', protect, authorize('Admin', 'Accountant'), updateInvoiceStatus);
router.get('/invoices/:id/pdf', protect, authorize('Admin', 'Accountant'), downloadInvoicePdf);

router.route('/payrolls')
  .get(protect, authorize('Admin', 'Accountant'), getPayrolls)
  .post(protect, authorize('Admin', 'Accountant'), createPayroll);
router.put('/payrolls/:id/status', protect, authorize('Admin', 'Accountant'), updatePayrollStatus);

module.exports = router;

