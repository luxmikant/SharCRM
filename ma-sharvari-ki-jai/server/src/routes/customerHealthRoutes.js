const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
  getHealthScores,
  getHealthSummary,
  calculateCustomerHealth,
  recalculateAllHealth,
  getAtRiskCustomers
} = require('../controllers/healthController');

const router = express.Router();

// All routes require auth
router.use(requireAuth);

// Get health score summary for dashboard
router.get('/summary', getHealthSummary);

// Get all health scores with filtering
router.get('/', getHealthScores);

// Get at-risk customers
router.get('/at-risk', getAtRiskCustomers);

// Calculate health for specific customer
router.post('/calculate/:customerId', calculateCustomerHealth);

// Batch recalculate all health scores
router.post('/recalculate', recalculateAllHealth);

module.exports = router;
