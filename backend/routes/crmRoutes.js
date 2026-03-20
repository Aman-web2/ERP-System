const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  addCustomerFeedback,
  deleteCustomer
} = require('../controllers/crmController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/customers')
  .get(protect, getCustomers)
  .post(protect, authorize('Admin', 'Accountant'), createCustomer);
router.route('/customers/:id')
  .get(protect, getCustomerById)
  .put(protect, authorize('Admin', 'Accountant'), updateCustomer)
  .delete(protect, authorize('Admin'), deleteCustomer);
router.post('/customers/:id/feedback', protect, addCustomerFeedback);

module.exports = router;

