const Coupon = require('../models/Coupon');

// GET /api/coupons (Admin)
exports.getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find();
    res.json({ success: true, data: coupons });
  } catch (error) {
    next(error);
  }
};

// POST /api/coupons (Admin)
exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    next(error);
  }
};

// POST /api/coupons/validate (Customer)
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, orderValue } = req.body;
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or expired coupon code' });
    }
    
    if (new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }
    
    if (orderValue < coupon.minOrderValue) {
      return res.status(400).json({ message: `Minimum order value for this coupon is ₹${coupon.minOrderValue}` });
    }
    
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }
    
    res.json({ success: true, data: coupon });
  } catch (error) {
    next(error);
  }
};
