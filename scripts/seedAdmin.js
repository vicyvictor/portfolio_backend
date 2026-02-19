/**
 * Run once to create the admin account in MongoDB:
 *   node scripts/seedAdmin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Admin    = require('../models/Admin');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const existing = await Admin.findOne({ username: process.env.ADMIN_USERNAME });
  if (existing) {
    console.log(`Admin "${process.env.ADMIN_USERNAME}" already exists. Skipping.`);
    process.exit(0);
  }

  const admin = new Admin({
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,   // will be hashed by model pre-save hook
  });
  await admin.save();

  console.log(`✅ Admin created: ${admin.username}`);
  console.log('You can now log in at POST /api/admin/login');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
