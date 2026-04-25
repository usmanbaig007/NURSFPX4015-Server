const mongoose = require('mongoose');

const tutorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    credentials: { type: String, required: true, trim: true }, // e.g. DNP, FNP-C
    specialty: { type: String, trim: true },
    bio: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    imagePublicId: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tutor', tutorSchema);
