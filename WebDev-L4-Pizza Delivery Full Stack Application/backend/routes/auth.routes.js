const express = require('express');
const authController = require('../controllers/auth.controller');
const authValidator = require('../validators/auth.validator');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', authValidator.registerValidator, authController.register);
router.post('/verify-otp', authValidator.verifyOtpValidator, authController.verifyOtp);
router.post('/resend-otp', authValidator.forgotPasswordValidator, authController.resendOtp);
router.post('/login', authValidator.loginValidator, authController.login);
router.post('/forgot-password', authValidator.forgotPasswordValidator, authController.forgotPassword);
router.post('/reset-password', authValidator.resetPasswordValidator, authController.resetPassword);

// Get currently logged-in user profile (for auto-login checks)
router.get('/me', protect, authController.getMe);

module.exports = router;
