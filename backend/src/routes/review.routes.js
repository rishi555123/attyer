const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access productId from parent router if needed
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.route('/:productId')
  .get(reviewController.getProductReviews)
  .post(protect, reviewController.createReview);

module.exports = router;
