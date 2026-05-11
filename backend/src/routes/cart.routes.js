const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(cartController.getCart)
  .post(cartController.addToCart);

router.route('/:itemId')
  .put(cartController.updateCartItem)
  .delete(cartController.removeFromCart);

module.exports = router;
