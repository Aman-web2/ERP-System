const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/dashboardController');
const { protect, authorizeModule } = require('../middleware/authMiddleware');

router.get('/summary', protect, authorizeModule('dashboard'), getDashboardSummary);

module.exports = router;

