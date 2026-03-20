const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Income', 'Expense'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  referenceId: {
    type: String // Optional: linking to orderId or other entities
  },
  status: {
    type: String,
    enum: ['Completed', 'Pending', 'Failed'],
    default: 'Completed'
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);

