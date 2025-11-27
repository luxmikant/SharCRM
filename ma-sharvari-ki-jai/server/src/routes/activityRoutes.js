const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
  getCustomerActivities,
  createActivity,
  getRecentActivities,
  deleteActivity,
  getActivityStats
} = require('../controllers/activityController');

const router = express.Router();

// All routes require auth
router.use(requireAuth);

// Get recent activities (dashboard)
router.get('/recent', getRecentActivities);

// Get activity statistics
router.get('/stats', getActivityStats);

// Customer-specific activities
router.get('/customer/:customerId', getCustomerActivities);
router.post('/customer/:customerId', createActivity);

// Delete activity
router.delete('/:activityId', deleteActivity);

module.exports = router;
