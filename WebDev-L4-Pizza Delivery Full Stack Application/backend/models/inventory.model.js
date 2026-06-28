const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: [true, 'Please provide the item name'],
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please provide the item category'],
    enum: ['crust', 'sauce', 'cheese', 'vegetable', 'meat', 'beverage'],
    default: 'vegetable'
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide the item quantity'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  minimumQuantity: {
    type: Number,
    required: [true, 'Please provide the minimum warning quantity limit'],
    min: [0, 'Minimum warning limit cannot be negative'],
    default: 10
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
inventorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;
