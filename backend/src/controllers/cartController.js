const Cart = require('../models/Cart');
const Product = require('../models/Product');

// GET /api/cart
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price discountedPrice images');
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart
exports.clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      cart.recalculateTotal();
      await cart.save();
    }
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};

// POST /api/cart
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, size, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const price = product.discountedPrice || product.price;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(p => p.product.toString() === productId && p.size === size);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, size, quantity, price });
    }

    cart.recalculateTotal();
    await cart.save();
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

// PUT /api/cart/:itemId
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found in cart' });

    item.quantity = quantity;
    cart.recalculateTotal();
    await cart.save();
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart/:itemId
exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items.pull(req.params.itemId);
    cart.recalculateTotal();
    await cart.save();
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

// PUT /api/cart/item/:productId/:size
exports.updateItemByProductAndSize = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(i => i.product.toString() === req.params.productId && i.size === req.params.size);
    if (!item) return res.status(404).json({ message: 'Item not found in cart' });

    item.quantity = quantity;
    cart.recalculateTotal();
    await cart.save();
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart/item/:productId/:size
exports.removeItemByProductAndSize = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(item => !(item.product.toString() === req.params.productId && item.size === req.params.size));
    
    cart.recalculateTotal();
    await cart.save();
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};