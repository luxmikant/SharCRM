const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const {
  importData,
  getPipelineStats,
  getTeamLeaderboard,
  getProductAnalytics,
  getAccountDetails,
  getAccounts,
  getDeals
} = require('../controllers/salesController');

// Import data (admin only in production)
router.post('/import', requireAuth, importData);

// Pipeline statistics
router.get('/pipeline/stats', requireAuth, getPipelineStats);

// Team leaderboard
router.get('/team/leaderboard', requireAuth, getTeamLeaderboard);

// Product analytics
router.get('/products/analytics', requireAuth, getProductAnalytics);

// Accounts
router.get('/accounts', requireAuth, getAccounts);
router.get('/accounts/:name', requireAuth, getAccountDetails);

// Deals
router.get('/deals', requireAuth, getDeals);

module.exports = router;
