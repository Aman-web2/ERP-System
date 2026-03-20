const express = require('express');
const router = express.Router();
const { getNotifications, markNotificationRead, createManualNotification } = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getNotifications)
  .post(protect, authorize('Admin'), createManualNotification);
router.put('/:id/read', protect, markNotificationRead);

module.exports = router;

