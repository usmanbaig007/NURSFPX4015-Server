/**
 * One-time admin creation script.
 * Run from the server directory:  node scripts/createAdmin.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

(async () => {
  if (!process.env.MONGODB_URI) {
    console.error('ERROR: MONGODB_URI is not set in server/.env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const username = 'margetbrinkley';
  const password = 'Usman3785312';

  const existing = await Admin.findOne({ username });
  if (existing) {
    console.log(`Admin "${username}" already exists. No changes made.`);
    await mongoose.disconnect();
    process.exit(0);
  }

  // Password is hashed automatically by the pre-save hook in Admin.js (bcrypt, cost 12)
  const admin = await Admin.create({ username, password });
  console.log(`Admin created successfully.`);
  console.log(`  Username : ${admin.username}`);
  console.log(`  Password : (hashed with bcrypt, cost 12)`);
  console.log(`  ID       : ${admin._id}`);

  await mongoose.disconnect();
  process.exit(0);
})().catch((err) => {
  console.error('Script failed:', err.message);
  process.exit(1);
});
