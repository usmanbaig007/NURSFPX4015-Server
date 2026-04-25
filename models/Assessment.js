const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    content: { type: String, default: '' },
    degree: { type: String, required: true, trim: true }, // e.g. BSN, MSN, DNP
    className: { type: String, required: true, trim: true }, // e.g. NURS-FPX4015
    fileUrl: { type: String, default: '' },
    filePublicId: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    imagePublicId: { type: String, default: '' },
    isFeatured: { type: Boolean, default: false },
    isNursfpx4015: { type: Boolean, default: false },
    tags: [{ type: String }],
    downloadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

assessmentSchema.index({ title: 'text', description: 'text', className: 'text' });

module.exports = mongoose.model('Assessment', assessmentSchema);
