const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  series: {
    type: String,
    trim: true,
    index: true
  },
  salesPrice: {
    type: Number,
    required: true,
    default: 0
  },
  // Computed fields
  totalSold: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  winRate: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

productSchema.index({ series: 1, salesPrice: -1 });

module.exports = mongoose.model('Product', productSchema);
