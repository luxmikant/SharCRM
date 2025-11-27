const mongoose = require('mongoose');

const customerHealthSchema = new mongoose.Schema({
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer', 
    required: true, 
    unique: true,
    index: true
  },
  score: { 
    type: Number, 
    min: 0, 
    max: 100, 
    required: true,
    index: true
  },
  factors: {
    engagement: { type: Number, default: 0 },
    recency: { type: Number, default: 0 },
    frequency: { type: Number, default: 0 },
    monetary: { type: Number, default: 0 }
  },
  trend: { 
    type: String, 
    enum: ['improving', 'declining', 'stable'], 
    default: 'stable' 
  },
  riskLevel: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    index: true
  },
  previousScore: Number,
  lastCalculated: { type: Date, default: Date.now },
  alerts: [{
    type: { type: String },
    message: String,
    severity: { type: String, enum: ['info', 'warning', 'critical'] },
    date: { type: Date, default: Date.now },
    dismissed: { type: Boolean, default: false }
  }]
}, { timestamps: true });

// Index for finding at-risk customers
customerHealthSchema.index({ riskLevel: 1, score: -1 });
customerHealthSchema.index({ trend: 1 });

module.exports = mongoose.model('CustomerHealth', customerHealthSchema);
