const express = require('express');
const router = express.Router();
const { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus } = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, applyLeave)
  .get(protect, authorize('Admin', 'HR'), getAllLeaves);

router.get('/my', protect, getMyLeaves);
router.put('/:id/status', protect, authorize('Admin', 'HR'), updateLeaveStatus);

module.exports = router;

