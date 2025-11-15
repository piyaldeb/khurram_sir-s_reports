require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Section = require('../src/models/Section');
const SheetConfig = require('../src/models/SheetConfig');

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

    // Create default sheet configurations if none exist
    const sheetConfigCount = await SheetConfig.countDocuments();
    if (sheetConfigCount === 0) {
      const defaultSheetConfigs = [
        {
          reportKey: 'budget_vs_achievement',
          reportName: 'Monthly Budget vs Achievement',
          sheetId: '1WIJOkAHouWkXVXhsa04dCvHkG6ESrqI91If7OkQbAXw',
          sheetUrl: 'https://docs.google.com/spreadsheets/d/1WIJOkAHouWkXVXhsa04dCvHkG6ESrqI91If7OkQbAXw/',
          tabName: 'Nov- Automation',
          range: 'B:K50',
          isActive: true
        },
        {
          reportKey: 'stock_180',
          reportName: '180 Days + Stock',
          sheetId: '1j37Y6g3pnMWtwe2fjTe1JTT32aRLS0Z1YPjl3v657Cc',
          sheetUrl: 'https://docs.google.com/spreadsheets/d/1j37Y6g3pnMWtwe2fjTe1JTT32aRLS0Z1YPjl3v657Cc/',
          tabName: 'dashboard',
          range: 'B2:B24',
          isActive: true
        },
        {
          reportKey: 'ot_report',
          reportName: 'OT Report',
          sheetId: '1SVGTDzzEPd2q9JgU_l9NI7PQVbf3bv5bCNvR8e2Oyho',
          sheetUrl: 'https://docs.google.com/spreadsheets/d/1SVGTDzzEPd2q9JgU_l9NI7PQVbf3bv5bCNvR8e2Oyho/',
          tabName: '26-Oct to 25-Nov',
          range: 'B5:K50',
          isActive: true
        },
        {
          reportKey: 'standard_stock',
          reportName: 'Standard Item Stock',
          sheetId: '1fnOSIWQa_mbfMHdgPatjYEIhG3kQlzPy0djHG8TOszk',
          sheetUrl: 'https://docs.google.com/spreadsheets/d/1fnOSIWQa_mbfMHdgPatjYEIhG3kQlzPy0djHG8TOszk/',
          tabName: 'dashbord',
          range: 'A:H30',
          isActive: true
        }
      ];

      await SheetConfig.insertMany(defaultSheetConfigs);
      console.log('Default sheet configurations created');
    }

    console.log('\nBootstrap completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Bootstrap error:', error);
    process.exit(1);
  }
}

bootstrapAdmin();
