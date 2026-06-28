const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email for OTP verification'],
    trim: true,
    lowercase: true
  },
  otp: {
    type: String,
    required: [true, 'Please provide the OTP code']
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry
  }
});

// Create a TTL index so MongoDB automatically deletes documents when they expire
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
