const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.route('/')
  .get(productController.getAllProducts)
  .post(protect, adminOnly, productController.createProduct);

router.route('/import')
  .post(protect, adminOnly, upload.single('file'), productController.importProductsCSV);

// Admin routes using :id
router.route('/id/:id')
  .put(protect, adminOnly, productController.updateProduct)
  .patch(protect, adminOnly, productController.updateProduct)
  .delete(protect, adminOnly, productController.deleteProduct);

// Public route using :slug
router.route('/:slug')
  .get(productController.getProductBySlug);

module.exports = router;