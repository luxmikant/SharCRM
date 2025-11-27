const healthScoreService = require('../services/healthScore.service');
const asyncHandler = require('../utils/asyncHandler');

// Get health scores with filtering
exports.getHealthScores = asyncHandler(async (req, res) => {
  const { riskLevel, trend, minScore, maxScore, limit, skip } = req.query;
  
  const filters = {};
  if (riskLevel) filters.riskLevel = riskLevel;
  if (trend) filters.trend = trend;
  if (minScore) filters.minScore = parseInt(minScore);
  if (maxScore) filters.maxScore = parseInt(maxScore);
  
  const options = {
    limit: parseInt(limit) || 50,
    skip: parseInt(skip) || 0
  };
  
  const healthScores = await healthScoreService.getHealthScores(filters, options);
  res.json({ healthScores });
});

// Get health summary/dashboard stats
exports.getHealthSummary = asyncHandler(async (req, res) => {
  const summary = await healthScoreService.getHealthSummary(req.user._id);
  res.json({ summary });
});

// Calculate health score for a specific customer
exports.calculateCustomerHealth = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  const health = await healthScoreService.calculateScore(customerId);
  res.json({ health });
});

// Batch recalculate all health scores
exports.recalculateAllHealth = asyncHandler(async (req, res) => {
  const results = await healthScoreService.calculateAllScores(req.user._id);
  res.json({ 
    message: 'Health scores recalculated',
    ...results
  });
});

// Get at-risk customers
exports.getAtRiskCustomers = asyncHandler(async (req, res) => {
  const healthScores = await healthScoreService.getHealthScores(
    { riskLevel: { $in: ['high', 'critical'] } },
    { limit: 20, sort: { score: 1 } }
  );
  res.json({ atRiskCustomers: healthScores });
});
