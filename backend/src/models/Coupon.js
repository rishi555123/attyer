const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: [1, 'Coupon value must be at least 1'],
    validate: {
      validator: function(val) {
        if (this.type === 'percentage') return val <= 100;
        return true;
      },
      message: 'Percentage discount cannot exceed 100%'
    }
  },
  minOrderValue: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: null },
  maxUses: { type: Number, default: null },
  usedCount: { type: Number, default: 0 },
  usedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  expiryDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Coupon', couponSchema);