const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  module: {
    type: String,
    default: 'general'
  },
  linkedEntity: {
    type: String,
    default: ''
  },
  format: {
    type: String,
    default: ''
  },
  size: {
    type: Number,
    default: 0
  },
  storageProvider: {
    type: String,
    enum: ['cloudinary', 'local'],
    default: 'local'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);

