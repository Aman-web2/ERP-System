const express = require('express');
const router = express.Router();
const { getReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/:type', protect, authorize('Admin', 'HR', 'Accountant'), getReport);

module.exports = router;

