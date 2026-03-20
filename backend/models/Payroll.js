const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  basicSalary: {
    type: Number,
    required: true
  },
  allowances: {
    type: Number,
    default: 0
  },
  deductions: {
    type: Number,
    default: 0
  },
  netSalary: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid'],
    default: 'Pending'
  },
  paidAt: {
    type: Date
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);

