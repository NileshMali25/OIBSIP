const express = require('express');
const orderController = require('../controllers/order.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = express.Router();

// All order routes are protected
router.use(protect);

router.post('/', orderController.createOrder);
router.post('/verify', orderController.verifyPayment);
router.get('/my-orders', orderController.getMyOrders);
router.get('/:id', orderController.getOrder);
router.get('/:id/invoice', orderController.downloadInvoice);

// Admin-only order management routes
router.get('/analytics/stats', restrictTo('Admin'), orderController.getAdminAnalytics);
router.get('/', restrictTo('Admin'), orderController.getAllOrders);
router.patch('/:id/status', restrictTo('Admin'), orderController.updateOrderStatus);

module.exports = router;
