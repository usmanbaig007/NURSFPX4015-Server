const mongoose = require('mongoose');

const PageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    default: '',
  },
  parent: {
    type: String,
    default: 'custom',
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Page', PageSchema);
