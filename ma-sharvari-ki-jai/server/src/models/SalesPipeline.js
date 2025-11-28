const mongoose = require('mongoose');

const salesPipelineSchema = new mongoose.Schema({
  opportunityId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  salesAgent: {
    type: String,
    required: true,
    index: true
  },
  product: {
    type: String,
    required: true,
    index: true
  },
  account: {
    type: String,
    trim: true,
    index: true,
    default: null
  },
  dealStage: {
    type: String,
    enum: ['Prospecting', 'Engaging', 'Won', 'Lost'],
    default: 'Prospecting',
    index: true
  },
  engageDate: {
    type: Date,
    default: null
  },
  closeDate: {
    type: Date,
    default: null,
    index: true
  },
  closeValue: {
    type: Number,
    default: 0
  },
  // Computed fields
  daysToClose: {
    type: Number,
    default: null
  },
  quarter: {
    type: String, // e.g., "2017-Q1"
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for common queries
salesPipelineSchema.index({ dealStage: 1, closeDate: -1 });
salesPipelineSchema.index({ salesAgent: 1, dealStage: 1 });
salesPipelineSchema.index({ product: 1, dealStage: 1 });
salesPipelineSchema.index({ account: 1, closeDate: -1 });

// Pre-save hook to calculate derived fields
salesPipelineSchema.pre('save', function(next) {
  // Calculate days to close
  if (this.engageDate && this.closeDate) {
    const diffTime = Math.abs(this.closeDate - this.engageDate);
    this.daysToClose = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  // Set quarter based on close date
  if (this.closeDate) {
    const year = this.closeDate.getFullYear();
    const month = this.closeDate.getMonth();
    const quarter = Math.floor(month / 3) + 1;
    this.quarter = `${year}-Q${quarter}`;
  }
  
  next();
});

module.exports = mongoose.model('SalesPipeline', salesPipelineSchema);
