const mongoose = require('mongoose');

const pizzaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide the pizza name'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide the pizza description'],
    trim: true
  },
  image: {
    type: String,
    required: [true, 'Please provide the pizza image']
  },
  category: {
    type: String,
    required: [true, 'Please provide the pizza category'],
    enum: ['Veg', 'Non-Veg', 'Custom', 'Beverages'],
    default: 'Veg'
  },
  basePrice: {
    type: Number,
    required: [true, 'Please provide the pizza base price'],
    min: [0, 'Price cannot be negative']
  },
  available: {
    type: Boolean,
    default: true
  },
  ingredients: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Pizza = mongoose.model('Pizza', pizzaSchema);

module.exports = Pizza;
