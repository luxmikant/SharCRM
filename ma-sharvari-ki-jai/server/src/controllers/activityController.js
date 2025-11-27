const Activity = require('../models/Activity');
const asyncHandler = require('../utils/asyncHandler');

// Get activities for a customer (timeline)
exports.getCustomerActivities = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  const { type, limit = 50, skip = 0 } = req.query;
  
  const query = { customerId };
  if (type) query.type = type;
  
  const activities = await Activity.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .populate('userId', 'name picture');
  
  const total = await Activity.countDocuments(query);
  
  res.json({ activities, total });
});

// Create a new activity (note, call log, etc.)
exports.createActivity = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  const { type, title, description, metadata, isInternal } = req.body;
  
  const activity = await Activity.create({
    customerId,
    userId: req.user._id,
    type,
    title,
    description,
    metadata,
    isInternal: isInternal || false,
    isAutomated: false
  });
  
  await activity.populate('userId', 'name picture');
  
  res.status(201).json({ activity });
});

// Get recent activities across all customers (for dashboard)
exports.getRecentActivities = asyncHandler(async (req, res) => {
  const { limit = 20, type } = req.query;
  
  const query = {};
  if (type) query.type = type;
  
  const activities = await Activity.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .populate('customerId', 'name email')
    .populate('userId', 'name picture');
  
  res.json({ activities });
});

// Delete an activity
exports.deleteActivity = asyncHandler(async (req, res) => {
  const { activityId } = req.params;
  
  const activity = await Activity.findById(activityId);
  if (!activity) {
    res.status(404);
    throw new Error('Activity not found');
  }
  
  // Only allow deletion by creator or automated activities by admins
  if (activity.userId?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this activity');
  }
  
  await activity.deleteOne();
  res.json({ message: 'Activity deleted' });
});

// Get activity statistics
exports.getActivityStats = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));
  
  const stats = await Activity.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  const dailyStats = await Activity.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  res.json({ byType: stats, daily: dailyStats });
});
