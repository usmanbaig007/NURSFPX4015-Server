/**
 * One-time migration script.
 * Removes deprecated `description` fields from Assessment documents.
 *
 * Run from the server directory:
 *   node scripts/removeAssessmentDescriptionField.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Assessment = require('../models/Assessment');

const FILTER = { description: { $exists: true } };

const runMigration = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set in server/.env');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const beforeCount = await Assessment.countDocuments(FILTER);
  if (beforeCount === 0) {
    console.log('No Assessment documents contain the description field. No changes made.');
    return;
  }

  console.log(`Found ${beforeCount} Assessment document(s) with description.`);

  const result = await Assessment.updateMany(FILTER, {
    $unset: { description: '' },
  });

  const remainingCount = await Assessment.countDocuments(FILTER);

  console.log('Migration complete.');
  console.log(`Matched documents : ${result.matchedCount}`);
  console.log(`Modified documents: ${result.modifiedCount}`);
  console.log(`Remaining docs with description: ${remainingCount}`);
};

(async () => {
  try {
    await runMigration();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  }
})();
