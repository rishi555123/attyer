const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  sku: {
    type: String,
    trim: true
  }
});

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, required: true }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    index: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: 0
  },
  discountedPrice: {
    type: Number,
    min: 0,
    validate: {
      validator: function(val) {
        return val == null || val < this.price;
      },
      message: 'Discounted price must be less than original price'
    }
  },
  gstRate: {
    type: Number,
    required: true,
    default: 12
  },
  category: {
    type: String,
    required: [true, 'Product category is required']
  },
  gender: {
    type: String,
    enum: ['men', 'women', 'unisex'],
    required: true
  },
  printType: {
    type: String,
    enum: ['sanganeri', 'bagru', 'ajrakh', 'kalamkari', 'bandhani', 'dabu', 'bagh', 'leheriya', 'warli', 'mata-ni-pachedi', 'solid', 'other'],
    default: 'other'
  },
  fabric: {
    type: String,
    required: [true, 'Fabric type is required'],
    default: '100% Cotton'
  },
  images: [imageSchema],
  variants: [variantSchema],
  ratings: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  isFeatured: { type: Boolean, default: false },
  isLimitedEdition: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  tags: [String],
}, {
  timestamps: true
});

productSchema.pre('save', async function() {
  if (!this.isModified('name')) return;

  let slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const existing = await mongoose.model('Product').findOne({ slug, _id: { $ne: this._id } });
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  this.slug = slug;
});

productSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text',
  fabric: 'text',
  printType: 'text'
}, {
  weights: {
    name: 10,
    tags: 5,
    printType: 3,
    fabric: 2,
    description: 1
  }
});

module.exports = mongoose.model('Product', productSchema);

