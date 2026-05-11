const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
require('dotenv').config({ path: '.env', override: false });

const logger = require('./src/config/logger');
const { errorHandler } = require('./src/middleware/errorHandler');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', 
  credentials: true 
}));
app.use(cookieParser());
app.use(compression());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Razorpay Webhook (Needs raw body)
app.post('/api/webhook/razorpay', express.raw({ type: 'application/json' }), require('./src/controllers/paymentController').razorpayWebhook);

// Body Parser
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/products', require('./src/routes/product.routes'));
app.use('/api/orders', require('./src/routes/order.routes'));
app.use('/api/cart', require('./src/routes/cart.routes'));
app.use('/api/wishlist', require('./src/routes/wishlist.routes'));
app.use('/api/users', require('./src/routes/user.routes'));
app.use('/api/reviews', require('./src/routes/review.routes'));
app.use('/api/coupons', require('./src/routes/coupon.routes'));
app.use('/api/admin', require('./src/routes/admin.routes'));
app.use('/api/payments', require('./src/routes/payment.routes'));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: Math.floor(process.uptime()),
    env: process.env.NODE_ENV || 'development',
  });
});

// Basic Route
app.get('/', (req, res) => {
  res.send('ATTYER API is running...');
});

// Test API Route
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API working' });
});

// Error Handling Middleware
app.use(errorHandler);

// Database Connection & Server Start
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info('MongoDB Connected');
    app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error(`Database connection error: ${err.message}`);
    process.exit(1);
  });