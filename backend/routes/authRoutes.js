const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getUserProfile, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/forgotpassword', forgotPassword);
router.post('/resetpassword', resetPassword);
router.get('/profile', protect, getUserProfile);

module.exports = router;

