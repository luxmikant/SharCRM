const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer', 
    required: true,
    index: true
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    index: true
  },
  type: { 
    type: String, 
    enum: [
      'email_sent',
      'email_opened',
      'email_clicked',
      'call_made',
      'call_received',
      'meeting_scheduled',
      'meeting_completed',
      'note_added',
      'order_placed',
      'order_cancelled',
      'segment_added',
      'segment_removed',
      'tag_added',
      'tag_removed',
      'profile_updated',
      'campaign_received',
      'whatsapp_sent',
      'whatsapp_received',
      'health_score_changed',
      'custom'
    ],
    required: true,
    index: true
  },
  title: { type: String, required: true },
  description: String,
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // For linking to related entities
  relatedType: String, // 'Order', 'Campaign', 'Segment', etc.
  relatedId: mongoose.Schema.Types.ObjectId,
  // Visibility
  isInternal: { type: Boolean, default: false }, // Internal notes not visible to customer
  isAutomated: { type: Boolean, default: false } // System-generated vs user-created
}, { timestamps: true });

// Compound index for customer timeline queries
activitySchema.index({ customerId: 1, createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
