const express = require('express');
const inventoryController = require('../controllers/inventory.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = express.Router();

// Publicly accessible for pizza builder options
router.get('/public', inventoryController.getPublicInventory);

// Admin-only protected routes
router.use(protect);
router.use(restrictTo('Admin'));

router.get('/', inventoryController.getAllInventory);
router.post('/', inventoryController.createInventoryItem);
router.put('/:id', inventoryController.updateInventoryItem);

module.exports = router;
