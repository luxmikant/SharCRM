const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  sector: {
    type: String,
    trim: true,
    index: true
  },
  yearEstablished: {
    type: Number
  },
  revenue: {
    type: Number, // in millions USD
    default: 0
  },
  employees: {
    type: Number,
    default: 0
  },
  officeLocation: {
    type: String,
    trim: true
  },
  subsidiaryOf: {
    type: String,
    trim: true,
    default: null
  },
  // Computed fields
  totalDeals: {
    type: Number,
    default: 0
  },
  wonDeals: {
    type: Number,
    default: 0
  },
  lifetimeValue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

accountSchema.index({ sector: 1, revenue: -1 });
accountSchema.index({ officeLocation: 1 });
accountSchema.index({ lifetimeValue: -1 });

module.exports = mongoose.model('Account', accountSchema);
