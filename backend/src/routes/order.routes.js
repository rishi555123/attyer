const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/')
  .get(protect, adminOnly, orderController.getAllOrders)
  .post(protect, orderController.placeOrder);

router.route('/myorders')
  .get(protect, orderController.getMyOrders);

router.route('/:id')
  .get(protect, orderController.getOrderById);

router.route('/:id/cancel')
  .put(protect, orderController.cancelOrder);

router.route('/:id/status')
  .put(protect, adminOnly, orderController.updateOrderStatus);

module.exports = router;