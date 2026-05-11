const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
require('dotenv').config({ path: '.env', override: false });

const User = require('../models/User');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

const users = [
  {
    name: 'Admin User',
    email: 'admin@attyer.com',
    password: 'Admin@1234',
    phone: '9876543210',
    role: 'admin',
    isEmailVerified: true
  },
  {
    name: 'Test Customer',
    email: 'customer@attyer.com',
    password: 'Customer@1234',
    phone: '9123456789',
    role: 'customer',
    isEmailVerified: true
  }
];

const products = [
  {
    name: 'Sanganeri Block Print Kurta',
    description: 'Handcrafted Sanganeri block print kurta in pure cotton. Lightweight and breathable, perfect for summers.',
    price: 1299,
    discountedPrice: 999,
    gstRate: 12,
    category: 'Kurta',
    gender: 'men',
    printType: 'sanganeri',
    fabric: '100% Cotton',
    variants: [
      { size: 'S', stock: 10, sku: 'ATT-KRT-SAN-S' },
      { size: 'M', stock: 15, sku: 'ATT-KRT-SAN-M' },
      { size: 'L', stock: 12, sku: 'ATT-KRT-SAN-L' },
      { size: 'XL', stock: 8, sku: 'ATT-KRT-SAN-XL' }
    ],
    images: [{ url: 'https://placehold.co/600x800?text=Sanganeri+Kurta', public_id: 'attyer/placeholder1' }],
    tags: ['kurta', 'block print', 'sanganeri', 'summer'],
    isFeatured: true
  },
  {
    name: 'Ajrakh Print Saree',
    description: 'Traditional Ajrakh print saree with natural dyes. A timeless piece for festive occasions.',
    price: 3499,
    discountedPrice: 2999,
    gstRate: 12,
    category: 'Saree',
    gender: 'women',
    printType: 'ajrakh',
    fabric: '100% Cotton',
    variants: [
      { size: 'M', stock: 20, sku: 'ATT-SAR-AJR-M' },
      { size: 'L', stock: 15, sku: 'ATT-SAR-AJR-L' }
    ],
    images: [{ url: 'https://placehold.co/600x800?text=Ajrakh+Saree', public_id: 'attyer/placeholder2' }],
    tags: ['saree', 'ajrakh', 'festive', 'natural dye'],
    isFeatured: true
  },
  {
    name: 'Bagru Print Salwar Suit',
    description: 'Elegant Bagru hand block printed salwar suit. Comfortable for daily wear.',
    price: 2199,
    gstRate: 12,
    category: 'Salwar Suit',
    gender: 'women',
    printType: 'bagru',
    fabric: '100% Cotton',
    variants: [
      { size: 'S', stock: 8, sku: 'ATT-SS-BAG-S' },
      { size: 'M', stock: 12, sku: 'ATT-SS-BAG-M' },
      { size: 'L', stock: 10, sku: 'ATT-SS-BAG-L' },
      { size: 'XL', stock: 6, sku: 'ATT-SS-BAG-XL' }
    ],
    images: [{ url: 'https://placehold.co/600x800?text=Bagru+Salwar', public_id: 'attyer/placeholder3' }],
    tags: ['salwar suit', 'bagru', 'daily wear']
  },
  {
    name: 'Kalamkari Kurta',
    description: 'Hand painted Kalamkari kurta with intricate floral motifs. A true artisan piece.',
    price: 1899,
    discountedPrice: 1599,
    gstRate: 12,
    category: 'Kurta',
    gender: 'women',
    printType: 'kalamkari',
    fabric: '100% Cotton',
    variants: [
      { size: 'XS', stock: 5, sku: 'ATT-KRT-KAL-XS' },
      { size: 'S', stock: 10, sku: 'ATT-KRT-KAL-S' },
      { size: 'M', stock: 14, sku: 'ATT-KRT-KAL-M' },
      { size: 'L', stock: 9, sku: 'ATT-KRT-KAL-L' }
    ],
    images: [{ url: 'https://placehold.co/600x800?text=Kalamkari+Kurta', public_id: 'attyer/placeholder4' }],
    tags: ['kurta', 'kalamkari', 'hand painted', 'artisan'],
    isLimitedEdition: true
  },
  {
    name: 'Bandhani Dupatta',
    description: 'Classic Bandhani tie-dye dupatta in vibrant colors. A versatile accessory.',
    price: 799,
    discountedPrice: 649,
    gstRate: 12,
    category: 'Dupatta',
    gender: 'women',
    printType: 'bandhani',
    fabric: '100% Cotton',
    variants: [
      { size: 'M', stock: 25, sku: 'ATT-DUP-BAN-M' }
    ],
    images: [{ url: 'https://placehold.co/600x800?text=Bandhani+Dupatta', public_id: 'attyer/placeholder5' }],
    tags: ['dupatta', 'bandhani', 'tie-dye', 'accessories']
  }
];

const coupons = [
  {
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    minOrderValue: 500,
    maxDiscount: 200,
    maxUses: 100,
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  },
  {
    code: 'FLAT200',
    type: 'fixed',
    value: 200,
    minOrderValue: 1500,
    maxUses: 50,
    expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
  }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    await User.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});
    console.log('Existing data cleared');

    await User.create(users);
    console.log('Users seeded — admin@attyer.com / Admin@1234');

    await Product.create(products);
    console.log('5 products seeded');

    await Coupon.create(coupons);
    console.log('Coupons seeded — WELCOME10, FLAT200');

    console.log('Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
};

seed();