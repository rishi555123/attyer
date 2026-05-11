const mongoose = require('mongoose');

const returnRequestSchema = new mongoose.Schema({
  order: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order', 
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  orderItem: {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    size: String,
    quantity: Number
  },
  reason: { 
    type: String, 
    required: true,
    enum: [
      'Size Issue',
      'Defective Product',
      'Different from Description',
      'Late Delivery',
      'Other'
    ]
  },
  comments: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Pickup Scheduled', 'Completed'],
    default: 'Pending'
  },
  images: [{
    url: String,
    public_id: String
  }],
  adminNotes: {
    type: String
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('ReturnRequest', returnRequestSchema);
