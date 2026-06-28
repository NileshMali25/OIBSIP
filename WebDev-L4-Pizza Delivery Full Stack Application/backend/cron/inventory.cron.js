const cron = require('node-cron');
const Inventory = require('../models/inventory.model');
const emailService = require('../services/email.service');

// Run every hour: '0 * * * *'
// For development testing/verification we can also export a manual trigger function
const checkInventoryLevels = async () => {
  try {
    console.log('[CRON JOB] - Checking inventory levels...');
    
    // Find all inventory items where current quantity is less than minimum warning threshold
    const lowStockItems = await Inventory.find({
      $expr: { $lt: ['$quantity', '$minimumQuantity'] }
    });

    if (lowStockItems.length > 0) {
      console.log(`[CRON JOB] - Warning: Found ${lowStockItems.length} low stock items. Sending alert to admin.`);
      
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@pizzadelivery.com';
      await emailService.sendLowStockAlertEmail(adminEmail, lowStockItems);
    } else {
      console.log('[CRON JOB] - All inventory levels are healthy.');
    }
  } catch (error) {
    console.error('[CRON JOB] - Error during inventory check:', error.message);
  }
};

const initInventoryCron = () => {
  // '0 * * * *' runs at minute 0 of every hour
  cron.schedule('0 * * * *', () => {
    checkInventoryLevels();
  });
  console.log('[CRON JOB] - Hourly low stock inventory cron monitor initialized.');
};

module.exports = {
  initInventoryCron,
  checkInventoryLevels // Exported for manual testing
};
