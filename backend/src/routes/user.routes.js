const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/profile')
  .get(userController.getUserProfile)
  .put(userController.updateUserProfile);

router.route('/addresses')
  .post(userController.addAddress);

module.exports = router;
