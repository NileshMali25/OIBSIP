const Inventory = require('../models/inventory.model');
const AppError = require('../utils/appError');

// 1) Get All Inventory (Admin Only)
exports.getAllInventory = async (req, res, next) => {
  try {
    const items = await Inventory.find().sort('category itemName');

    res.status(200).json({
      status: 'success',
      results: items.length,
      data: {
        inventory: items
      }
    });
  } catch (error) {
    next(error);
  }
};

// 2) Create Inventory Item (Admin Only)
exports.createInventoryItem = async (req, res, next) => {
  try {
    const { itemName, category, quantity, minimumQuantity } = req.body;

    // Check if item name already exists
    const existing = await Inventory.findOne({ itemName });
    if (existing) {
      return next(new AppError('An inventory item with this name already exists.', 400));
    }

    const newItem = await Inventory.create({
      itemName,
      category,
      quantity: parseInt(quantity, 10),
      minimumQuantity: parseInt(minimumQuantity, 10)
    });

    res.status(201).json({
      status: 'success',
      data: {
        item: newItem
      }
    });
  } catch (error) {
    next(error);
  }
};

// 3) Update Inventory Item (Admin Only)
exports.updateInventoryItem = async (req, res, next) => {
  try {
    const { quantity, minimumQuantity, itemName, category } = req.body;

    const updateData = {};
    if (quantity !== undefined) updateData.quantity = parseInt(quantity, 10);
    if (minimumQuantity !== undefined) updateData.minimumQuantity = parseInt(minimumQuantity, 10);
    if (itemName) updateData.itemName = itemName;
    if (category) updateData.category = category;

    const item = await Inventory.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    if (!item) {
      return next(new AppError('No inventory item found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        item
      }
    });
  } catch (error) {
    next(error);
  }
};

// 4) Get Public Inventory for Custom Pizza Builder (Public)
// Returns list of available crusts, sauces, cheeses, and toppings
exports.getPublicInventory = async (req, res, next) => {
  try {
    // Only return items that are in stock (quantity > 0)
    const items = await Inventory.find({ quantity: { $gt: 0 } }).select('itemName category');

    // Group items by category for easy frontend rendering
    const customOptions = {
      crusts: [],
      sauces: [],
      cheeses: [],
      vegetables: [],
      meats: []
    };

    items.forEach(item => {
      const categoryKey = item.category === 'crust' ? 'crusts' :
                          item.category === 'sauce' ? 'sauces' :
                          item.category === 'cheese' ? 'cheeses' :
                          item.category === 'vegetable' ? 'vegetables' :
                          item.category === 'meat' ? 'meats' : null;
      
      if (categoryKey) {
        customOptions[categoryKey].push(item.itemName);
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        options: customOptions
      }
    });
  } catch (error) {
    next(error);
  }
};
