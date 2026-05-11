const crypto = require('crypto');
const { AppError } = require('../middleware/errorHandler');

const verifyRazorpayWebhook = (req, res, next) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const receivedSignature = req.headers['x-razorpay-signature'];

  if (!receivedSignature) {
    return next(new AppError('Missing webhook signature', 400));
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(req.body)
    .digest('hex');

  if (receivedSignature !== expectedSignature) {
    return next(new AppError('Invalid webhook signature', 403));
  }

  next();
};

module.exports = verifyRazorpayWebhook;