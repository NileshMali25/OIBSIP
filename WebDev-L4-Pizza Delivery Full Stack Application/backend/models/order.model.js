const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  pizza: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pizza',
    required: false
  },
  customPizza: {
    name: { type: String },
    image: { type: String },
    base: { type: String },
    sauce: { type: String },
    cheese: { type: String },
    vegetables: [{ type: String }],
    price: { type: Number }
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  price: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'An order must belong to a user']
  },
  items: [orderItemSchema],
  amount: {
    type: Number,
    required: [true, 'An order must have an amount']
  },
  tax: {
    type: Number,
    default: 0
  },
  deliveryCharge: {
    type: Number,
    default: 0
  },
  couponCode: {
    type: String,
    default: null
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  paymentDetails: {
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String }
  },
  orderStatus: {
    type: String,
    enum: ['Order Received', 'Preparing', 'In Kitchen', 'Out For Delivery', 'Delivered'],
    default: 'Order Received'
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true }
  },
  deliveryTime: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
