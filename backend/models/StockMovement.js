const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  type: {
    type: String,
    enum: ['IN', 'OUT', 'ADJUSTMENT'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  remarks: {
    type: String,
    default: ''
  },
  reference: {
    type: String,
    default: ''
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StockMovement', stockMovementSchema);

