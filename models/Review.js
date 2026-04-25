const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    course: { type: String, trim: true },
    isApproved: { type: Boolean, default: false },
    source: {
      type: String,
      enum: ['google', 'trustpilot', 'sitejabber', 'direct'],
      default: 'direct',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
