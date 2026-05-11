const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(cartController.getCart)
  .post(cartController.addToCart)
  .delete(cartController.clearCart);

router.route('/:itemId')
  .put(cartController.updateCartItem)
  .delete(cartController.removeFromCart);

router.route('/item/:productId/:size')
  .put(cartController.updateItemByProductAndSize)
  .delete(cartController.removeItemByProductAndSize);

module.exports = router;
