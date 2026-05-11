const Product = require('../models/Product');
const logger = require('../config/logger');
const fs = require('fs');
const csv = require('csv-parser');

// GET /api/products
exports.getAllProducts = async (req, res, next) => {
  try {
    const { keyword, search, category, gender, printType, minPrice, maxPrice, size, sort, page = 1, limit = 12 } = req.query;
    
    let query = { isActive: true };

    const searchTerm = search || keyword;
    if (searchTerm) {
      query.$text = { $search: searchTerm };
    }
    if (category) query.category = category;
    if (gender) query.gender = gender;
    if (printType) query.printType = printType;
    if (size) query['variants.size'] = size;
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = {};
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };
    else if (sort === 'rating') sortOption = { ratings: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .populate('category', 'name slug');

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      count: products.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: products
    });
  } catch (error) {
    logger.error('Error fetching products:', error);
    next(error);
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

exports.getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ 
      slug: req.params.slug,
      isActive: true 
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// POST /api/products (Admin)
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// PUT /api/products/:id (Admin)
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/products/:id (Admin - Soft Delete)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    product.isActive = false;
    await product.save();
    res.json({ success: true, message: 'Product deactivated' });
  } catch (error) {
    next(error);
  }
};

// POST /api/products/import (Admin) - Bulk CSV Upload
exports.importProductsCSV = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a CSV file' });
  }

  const results = [];
  try {
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          // Format data to match schema (simplified for stub)
          const formattedProducts = results.map(row => ({
            name: row.name,
            description: row.description,
            price: Number(row.price),
            category: row.categoryId, // assuming CSV has categoryId
            gender: row.gender,
            fabric: row.fabric,
            variants: [
              { size: 'S', stock: Number(row.stock_S || 0) },
              { size: 'M', stock: Number(row.stock_M || 0) },
              { size: 'L', stock: Number(row.stock_L || 0) }
            ],
            images: [{ url: row.image_url || 'https://via.placeholder.com/150', public_id: 'placeholder' }]
          }));

          await Product.insertMany(formattedProducts);
          fs.unlinkSync(req.file.path); // remove temp file

          res.json({ success: true, message: `${formattedProducts.length} products imported` });
        } catch (dbErr) {
          logger.error('Database error during CSV import:', dbErr);
          fs.unlinkSync(req.file.path);
          return res.status(500).json({ message: 'Error importing data into database' });
        }
      });
  } catch (error) {
    logger.error('Error parsing CSV:', error);
    next(error);
  }
};
