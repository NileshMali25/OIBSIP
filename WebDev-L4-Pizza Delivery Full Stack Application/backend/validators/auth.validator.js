const { check, validationResult } = require('express-validator');
const AppError = require('../utils/appError');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().map(err => err.msg).join('. ');
    return next(new AppError(errorMsg, 400));
  }
  next();
};

exports.registerValidator = [
  check('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim(),
  check('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  check('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  check('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please enter a valid phone number'),
  handleValidationErrors
];

exports.loginValidator = [
  check('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  check('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

exports.verifyOtpValidator = [
  check('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  check('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits'),
  handleValidationErrors
];

exports.forgotPasswordValidator = [
  check('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  handleValidationErrors
];

exports.resetPasswordValidator = [
  check('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  check('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits'),
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  check('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  handleValidationErrors
];
