const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrderById, updateOrderStatus, getSalesAnalytics } = require('../controllers/salesController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/orders')
  .post(protect, authorize('Admin', 'Accountant'), createOrder)
  .get(protect, getOrders);
router.get('/analytics', protect, authorize('Admin', 'Accountant'), getSalesAnalytics);
router.get('/orders/:id', protect, getOrderById);
router.put('/orders/:id/status', protect, authorize('Admin', 'Accountant'), updateOrderStatus);

module.exports = router;

