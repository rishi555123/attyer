const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/validate', protect, couponController.validateCoupon);

router.route('/')
  .get(protect, adminOnly, couponController.getAllCoupons)
  .post(protect, adminOnly, couponController.createCoupon);

module.exports = router;
