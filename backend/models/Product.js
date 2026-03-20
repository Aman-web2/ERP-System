const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  sku: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  price: {
    type: Number,
    required: true
  },
  costPrice: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  status: {
    type: String,
    enum: ['In Stock', 'Out of Stock', 'Low Stock'],
    default: 'In Stock'
  },
  image: {
    type: String
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Update status before saving
productSchema.pre('save', function() {
  if (this.quantity === 0) {
    this.status = 'Out of Stock';
  } else if (this.quantity <= this.lowStockThreshold) {
    this.status = 'Low Stock';
  } else {
    this.status = 'In Stock';
  }
});

module.exports = mongoose.model('Product', productSchema);

