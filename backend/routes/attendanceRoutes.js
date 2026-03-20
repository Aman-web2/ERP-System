const express = require('express');
const router = express.Router();
const { clockIn, clockOut, getAllAttendance, getMyAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/clock-in', protect, clockIn);
router.post('/clock-out', protect, clockOut);
router.get('/my', protect, getMyAttendance);
router.get('/', protect, authorize('Admin', 'HR'), getAllAttendance);

module.exports = router;

