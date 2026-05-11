const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend/.env.development
dotenv.config({ path: path.resolve(__dirname, '../.env.development') });

// Require User model
const User = require('../src/models/User');

const makeAdmin = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI not found in .env.development');
    }

    // Connect to MongoDB
    await mongoose.connect(uri);
    console.log('Connected to MongoDB.');

    const targetEmail = 'attyer.store@gmail.com';
    let user = await User.findOne({ email: targetEmail });
    
    if (!user) {
      console.log('User not found. Creating a new user...');
      user = new User({
        name: 'Attyer Admin',
        email: targetEmail,
      });
    }

    // Update role and password
    user.role = 'admin';
    user.password = 'Attyer2025'; // The Mongoose pre-save hook will handle bcrypt hashing automatically
    
    // Save user
    await user.save();
    console.log(`Success! User ${targetEmail} has been set to role "admin".`);

    // Disconnect
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('Error in makeAdmin script:', error);
    process.exit(1);
  }
};

makeAdmin();
