const mongoose = require('mongoose');

const designationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

designationSchema.index({ title: 1, department: 1 }, { unique: true });

module.exports = mongoose.model('Designation', designationSchema);

