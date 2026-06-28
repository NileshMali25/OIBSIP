const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const OTP = require('../models/otp.model');
const AppError = require('../utils/appError');
const emailService = require('../services/email.service');

// Helper to sign JWT Token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Helper to create and send token response
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// 1) Register User
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email address is already in use.', 400));
    }

    // Create user (verified: false by default)
    const newUser = await User.create({
      name,
      email,
      password,
      phone
    });

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in database
    await OTP.create({
      email,
      otp: otpCode
    });

    // Send OTP verification email
    await emailService.sendOtpEmail(email, otpCode);

    res.status(201).json({
      status: 'success',
      message: 'Registration successful! An OTP code has been sent to your email.'
    });
  } catch (error) {
    next(error);
  }
};

// 2) Verify OTP
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Find the OTP document
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return next(new AppError('Invalid or expired OTP code.', 400));
    }

    // Find user and mark as verified
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    user.verified = true;
    await user.save({ validateBeforeSave: false });

    // Delete the verified OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    // Send welcome email
    await emailService.sendWelcomeEmail(email, user.name);

    // Return JWT token and user info
    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// 3) Resend OTP
exports.resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('User not found with this email address.', 404));
    }

    if (user.verified) {
      return next(new AppError('This user account is already verified.', 400));
    }

    // Delete any old OTP for this email
    await OTP.deleteMany({ email });

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in DB
    await OTP.create({
      email,
      otp: otpCode
    });

    // Send OTP email
    await emailService.sendOtpEmail(email, otpCode);

    res.status(200).json({
      status: 'success',
      message: 'A new OTP verification code has been sent to your email.'
    });
  } catch (error) {
    next(error);
  }
};

// 4) Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly select password field
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password.', 401));
    }

    // Check if verified
    if (!user.verified) {
      return res.status(403).json({
        status: 'fail',
        errorType: 'EMAIL_NOT_VERIFIED',
        message: 'Your email address is not verified. Please verify your email first.',
        email: user.email
      });
    }

    // Create and return token
    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// 5) Forgot Password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('There is no user registered with this email address.', 404));
    }

    // Delete any existing OTP for this email
    await OTP.deleteMany({ email });

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in DB
    await OTP.create({
      email,
      otp: otpCode
    });

    // Send reset email
    await emailService.sendResetPasswordEmail(email, otpCode);

    res.status(200).json({
      status: 'success',
      message: 'A password reset OTP verification code has been sent to your email.'
    });
  } catch (error) {
    next(error);
  }
};

// 6) Reset Password
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;

    // Find OTP record
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return next(new AppError('Invalid or expired password reset OTP.', 400));
    }

    // Find User
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    // Update password (will trigger pre-save hashing)
    user.password = password;
    await user.save();

    // Delete OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({
      status: 'success',
      message: 'Your password has been successfully reset. You can now log in.'
    });
  } catch (error) {
    next(error);
  }
};

// Helper for verifying token session (Auto-Login check)
exports.getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      status: 'success',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};
