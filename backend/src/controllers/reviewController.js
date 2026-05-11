const Review = require('../models/Review');
const Order = require('../models/Order');

// GET /api/reviews/:productId
exports.getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate('user', 'name');
    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

// POST /api/reviews/:productId
exports.createReview = async (req, res, next) => {
  try {
    const { rating, title, comment } = req.body;
    const productId = req.params.productId;

    // Check if user has already reviewed
    const existingReview = await Review.findOne({ user: req.user._id, product: productId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Check if verified purchase
    const orders = await Order.find({ user: req.user._id, 'orderItems.product': productId, orderStatus: 'Delivered' });
    const isVerifiedPurchase = orders.length > 0;

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating,
      title,
      comment,
      isVerifiedPurchase
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};
