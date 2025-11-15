require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Section = require('../src/models/Section');

async function bootstrapAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin email and password are provided
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables');
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists');
    } else {
      // Create admin user
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      const admin = new User({
        email: adminEmail,
        passwordHash,
        name: 'Admin',
        role: 'admin'
      });

      await admin.save();
      console.log('Admin user created successfully');
      console.log(`Email: ${adminEmail}`);
    }

    // Create default sections if none exist
    const sectionsCount = await Section.countDocuments();
    if (sectionsCount === 0) {
      const defaultSections = [
        {
          name: 'Production',
          slug: 'production',
          subsections: [
            { name: 'Zippers', slug: 'zippers' },
            { name: 'Metal', slug: 'metal' }
          ]
        },
        {
          name: 'Quality',
          slug: 'quality',
          subsections: [
            { name: 'Daily Report', slug: 'daily-report' },
            { name: 'Inspection', slug: 'inspection' }
          ]
        },
        {
          name: 'General',
          slug: 'general',
          subsections: [
            { name: 'Miscellaneous', slug: 'miscellaneous' }
          ]
        }
      ];

      await Section.insertMany(defaultSections);
      console.log('Default sections created');
    }

    console.log('\nBootstrap completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Bootstrap error:', error);
    process.exit(1);
  }
}

bootstrapAdmin();
