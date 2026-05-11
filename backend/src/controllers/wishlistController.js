const Wishlist = require('../models/Wishlist');

// GET /api/wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products', 'name price images discountPrice');
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }
    res.json({ success: true, data: wishlist });
  } catch (error) {
    next(error);
  }
};

// POST /api/wishlist/:productId
exports.toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    const index = wishlist.products.indexOf(productId);
    if (index > -1) {
      wishlist.products.splice(index, 1); // remove
    } else {
      wishlist.products.push(productId); // add
    }

    await wishlist.save();
    res.json({ success: true, data: wishlist });
  } catch (error) {
    next(error);
  }
};
