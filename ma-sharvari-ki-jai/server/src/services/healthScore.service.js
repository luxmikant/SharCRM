const CustomerHealth = require('../models/CustomerHealth');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Activity = require('../models/Activity');
const logger = require('../utils/logger');

class HealthScoreService {
  /**
   * Calculate health score for a single customer
   */
  async calculateScore(customerId) {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const orders = await Order.find({ customerId }).sort({ createdAt: -1 });
    
    // Get previous health record for trend calculation
    const previousHealth = await CustomerHealth.findOne({ customerId });
    const previousScore = previousHealth?.score || 50;
    
    // Calculate individual factors (each 0-25 points, total max 100)
    const factors = this.calculateFactors(customer, orders);
    const score = factors.recency + factors.frequency + factors.monetary + factors.engagement;
    const clampedScore = Math.max(0, Math.min(100, score));
    
    // Determine risk level
    const riskLevel = this.getRiskLevel(clampedScore);
    
    // Determine trend
    const trend = this.calculateTrend(clampedScore, previousScore);
    
    // Generate alerts if needed
    const alerts = this.generateAlerts(clampedScore, previousScore, factors, customer);
    
    // Upsert health record
    const health = await CustomerHealth.findOneAndUpdate(
      { customerId },
      {
        score: clampedScore,
        factors,
        riskLevel,
        trend,
        previousScore,
        lastCalculated: new Date(),
        $push: { alerts: { $each: alerts } }
      },
      { upsert: true, new: true }
    );
    
    // Log activity if score changed significantly
    if (Math.abs(clampedScore - previousScore) >= 10) {
      await Activity.create({
        customerId,
        type: 'health_score_changed',
        title: `Health score ${trend === 'improving' ? 'improved' : 'declined'}`,
        description: `Score changed from ${previousScore} to ${clampedScore}`,
        metadata: { previousScore, newScore: clampedScore, factors },
        isAutomated: true
      });
    }
    
    return health;
  }

  /**
   * Calculate individual health factors
   */
  calculateFactors(customer, orders) {
    const factors = { engagement: 0, recency: 0, frequency: 0, monetary: 0 };
    
    // Recency Score (0-25 points) - How recently did they interact?
    if (customer.lastOrderDate) {
      const daysSince = (Date.now() - new Date(customer.lastOrderDate)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) factors.recency = 25;
      else if (daysSince < 14) factors.recency = 20;
      else if (daysSince < 30) factors.recency = 15;
      else if (daysSince < 60) factors.recency = 10;
      else if (daysSince < 90) factors.recency = 5;
      else factors.recency = 0;
    }
    
    // Frequency Score (0-25 points) - How often do they visit/order?
    const visitCount = customer.visitCount || 0;
    if (visitCount > 20) factors.frequency = 25;
    else if (visitCount > 15) factors.frequency = 20;
    else if (visitCount > 10) factors.frequency = 15;
    else if (visitCount > 5) factors.frequency = 10;
    else if (visitCount > 2) factors.frequency = 5;
    else factors.frequency = 2;
    
    // Monetary Score (0-25 points) - How much do they spend?
    const totalSpend = customer.totalSpend || 0;
    if (totalSpend > 50000) factors.monetary = 25;
    else if (totalSpend > 25000) factors.monetary = 20;
    else if (totalSpend > 10000) factors.monetary = 15;
    else if (totalSpend > 5000) factors.monetary = 10;
    else if (totalSpend > 1000) factors.monetary = 5;
    else factors.monetary = 2;
    
    // Engagement Score (0-25 points) - Recent activity intensity
    const recentOrders = orders.filter(o => 
      (Date.now() - new Date(o.createdAt)) / (1000 * 60 * 60 * 24) < 90
    );
    const recentCount = recentOrders.length;
    if (recentCount > 5) factors.engagement = 25;
    else if (recentCount > 3) factors.engagement = 20;
    else if (recentCount > 2) factors.engagement = 15;
    else if (recentCount > 1) factors.engagement = 10;
    else if (recentCount === 1) factors.engagement = 5;
    else factors.engagement = 0;
    
    return factors;
  }

  /**
   * Get risk level based on score
   */
  getRiskLevel(score) {
    if (score >= 70) return 'low';
    if (score >= 50) return 'medium';
    if (score >= 30) return 'high';
    return 'critical';
  }

  /**
   * Calculate trend based on score change
   */
  calculateTrend(currentScore, previousScore) {
    const diff = currentScore - previousScore;
    if (diff > 5) return 'improving';
    if (diff < -5) return 'declining';
    return 'stable';
  }

  /**
   * Generate alerts based on health changes
   */
  generateAlerts(score, previousScore, factors, customer) {
    const alerts = [];
    
    // Critical score alert
    if (score < 30 && previousScore >= 30) {
      alerts.push({
        type: 'critical_health',
        message: `${customer.name}'s health score dropped to critical (${score})`,
        severity: 'critical'
      });
    }
    
    // Significant decline alert
    if (score < previousScore - 15) {
      alerts.push({
        type: 'health_decline',
        message: `Health score declined by ${previousScore - score} points`,
        severity: 'warning'
      });
    }
    
    // Inactivity alert
    if (factors.recency === 0 && factors.engagement === 0) {
      alerts.push({
        type: 'inactivity',
        message: 'No activity in the last 90 days',
        severity: 'warning'
      });
    }
    
    return alerts;
  }

  /**
   * Batch calculate health scores for all customers
   */
  async calculateAllScores(ownerId) {
    const filter = ownerId ? { owner: ownerId } : {};
    const customers = await Customer.find(filter).select('_id');
    
    let processed = 0;
    let errors = 0;
    
    for (const customer of customers) {
      try {
        await this.calculateScore(customer._id);
        processed++;
      } catch (err) {
        errors++;
        logger.error(`Failed to calculate health for ${customer._id}: ${err.message}`);
      }
    }
    
    logger.info(`Health scores calculated: ${processed} success, ${errors} errors`);
    return { processed, errors, total: customers.length };
  }

  /**
   * Get health scores with filters
   */
  async getHealthScores(filters = {}, options = {}) {
    const query = {};
    
    if (filters.riskLevel) query.riskLevel = filters.riskLevel;
    if (filters.trend) query.trend = filters.trend;
    if (filters.minScore) query.score = { $gte: filters.minScore };
    if (filters.maxScore) query.score = { ...query.score, $lte: filters.maxScore };
    
    return CustomerHealth.find(query)
      .populate('customerId', 'name email phone totalSpend lastOrderDate')
      .sort(options.sort || { score: -1 })
      .limit(options.limit || 100)
      .skip(options.skip || 0);
  }

  /**
   * Get health score summary/stats
   */
  async getHealthSummary(ownerId) {
    const customerFilter = ownerId ? { owner: ownerId } : {};
    const customerIds = await Customer.find(customerFilter).distinct('_id');
    
    const stats = await CustomerHealth.aggregate([
      { $match: { customerId: { $in: customerIds } } },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$score' },
          totalCustomers: { $sum: 1 },
          critical: { $sum: { $cond: [{ $eq: ['$riskLevel', 'critical'] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$riskLevel', 'high'] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ['$riskLevel', 'medium'] }, 1, 0] } },
          low: { $sum: { $cond: [{ $eq: ['$riskLevel', 'low'] }, 1, 0] } },
          improving: { $sum: { $cond: [{ $eq: ['$trend', 'improving'] }, 1, 0] } },
          declining: { $sum: { $cond: [{ $eq: ['$trend', 'declining'] }, 1, 0] } },
          stable: { $sum: { $cond: [{ $eq: ['$trend', 'stable'] }, 1, 0] } }
        }
      }
    ]);
    
    return stats[0] || {
      averageScore: 0,
      totalCustomers: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      improving: 0,
      declining: 0,
      stable: 0
    };
  }
}

module.exports = new HealthScoreService();
