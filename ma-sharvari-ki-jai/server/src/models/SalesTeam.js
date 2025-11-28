const mongoose = require('mongoose');

const salesTeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  manager: {
    type: String,
    trim: true,
    index: true
  },
  regionalOffice: {
    type: String,
    enum: ['Central', 'East', 'West'],
    index: true
  },
  // Computed performance metrics
  totalDeals: {
    type: Number,
    default: 0
  },
  wonDeals: {
    type: Number,
    default: 0
  },
  lostDeals: {
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
  },
  avgDealSize: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

salesTeamSchema.index({ manager: 1, regionalOffice: 1 });
salesTeamSchema.index({ totalRevenue: -1 });
salesTeamSchema.index({ winRate: -1 });

module.exports = mongoose.model('SalesTeam', salesTeamSchema);
