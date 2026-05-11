const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const logger = require('../config/logger');

// POST /api/payments/create-order
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    logger.error('Error creating Razorpay order:', error);
    next(error);
  }
};

// POST /api/payments/verify
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Payment is authentic, update order status
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentInfo = {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          status: 'paid'
        };
        order.orderStatus = 'Confirmed';
        await order.save();
        return res.json({ success: true, message: 'Payment verified successfully' });
      }
      return res.status(404).json({ message: 'Order not found' });
    } else {
      return res.status(400).json({ message: 'Invalid signature sent!' });
    }
  } catch (error) {
    logger.error('Error verifying payment:', error);
    next(error);
  }
};

// Webhook handler (must use raw body)
exports.razorpayWebhook = async (req, res, next) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET; // Ensure webhook secret is set in razorpay dashboard
    const signature = req.headers['x-razorpay-signature'];

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(req.body) // req.body here is the raw buffer
      .digest('hex');

    if (expectedSignature === signature) {
      const event = JSON.parse(req.body).event;
      const payload = JSON.parse(req.body).payload;

      logger.info(`Webhook event received: ${event}`);

      if (event === 'payment.captured') {
        const orderId = payload.payment.entity.notes?.orderId; // Make sure to pass orderId in notes during order creation
        if (orderId) {
           await Order.findByIdAndUpdate(orderId, { 'paymentInfo.status': 'paid', orderStatus: 'Confirmed' });
        }
      } else if (event === 'payment.failed') {
         const orderId = payload.payment.entity.notes?.orderId;
         if (orderId) {
           await Order.findByIdAndUpdate(orderId, { 'paymentInfo.status': 'failed' });
         }
      }

      res.status(200).send('OK');
    } else {
      res.status(400).send('Invalid signature');
    }
  } catch (error) {
    logger.error('Webhook Error:', error);
    res.status(500).send('Webhook Error');
  }
};

// POST /api/payments/refund (Admin)
exports.processRefund = async (req, res, next) => {
  try {
    const { paymentId, amount } = req.body;
    
    // Process refund via razorpay
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount ? Math.round(amount * 100) : undefined // undefined refunds full amount
    });
    
    res.json({ success: true, refund });
  } catch (error) {
    logger.error('Refund Error:', error);
    next(error);
  }
};
