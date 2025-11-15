require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

async function createUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'ranak@texzipperbd.com';
    const password = 'RknHG78hQ*';
    const name = 'Ranak';
    const role = 'admin';

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists. Updating password...');
      const passwordHash = await bcrypt.hash(password, 10);
      existingUser.passwordHash = passwordHash;
      existingUser.role = role;
      await existingUser.save();
      console.log('User updated successfully');
      console.log(`Email: ${email}`);
      console.log(`Role: ${role}`);
    } else {
      // Create user
      const passwordHash = await bcrypt.hash(password, 10);
      const user = new User({
        email,
        passwordHash,
        name,
        role
      });

      await user.save();
      console.log('User created successfully');
      console.log(`Email: ${email}`);
      console.log(`Name: ${name}`);
      console.log(`Role: ${role}`);
    }

    console.log('\nUser setup completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createUser();

