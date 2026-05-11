const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getAllUsers);

module.exports = router;
