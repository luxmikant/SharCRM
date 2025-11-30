/**
 * SharCRM Telegram Routes
 * 
 * API endpoints for Telegram bot management and statistics.
 * 
 * @version 2.0.0
 * @license MIT
 */
const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const telegramService = require('../services/telegram.service');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/telegram/stats
 * Get Telegram subscriber statistics
 */
router.get('/stats', requireAuth, asyncHandler(async (req, res) => {
  const stats = await telegramService.getStats();
  res.json(stats);
}));

/**
 * GET /api/telegram/status
 * Check if the Telegram bot is active
 */
router.get('/status', asyncHandler(async (req, res) => {
  const isReady = telegramService.isReady();
  const stats = await telegramService.getStats();
  
  res.json({
    active: isReady,
    botUsername: stats.botUsername,
    message: isReady ? 'Telegram bot is active and ready' : 'Telegram bot is not configured'
  });
}));

/**
 * POST /api/telegram/test
 * Send a test message to a specific chat ID (admin only)
 */
router.post('/test', requireAuth, asyncHandler(async (req, res) => {
  const { chatId, message } = req.body;
  
  if (!chatId || !message) {
    return res.status(400).json({ error: 'chatId and message are required' });
  }

  try {
    const result = await telegramService.sendTestMessage(chatId, message);
    res.json({ 
      success: true, 
      messageId: result.message_id,
      chatId: result.chat.id 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}));

/**
 * POST /api/telegram/broadcast-preview
 * Preview how many customers would receive a Telegram broadcast
 */
router.post('/broadcast-preview', requireAuth, asyncHandler(async (req, res) => {
  const { segmentId } = req.body;
  const Customer = require('../models/Customer');
  const Segment = require('../models/Segment');
  const { buildFilter } = require('../controllers/segmentController');

  if (!segmentId) {
    return res.status(400).json({ error: 'segmentId is required' });
  }

  const owner = req.user?._id || req.user?.sub;
  const segment = await Segment.findOne({ 
    _id: segmentId, 
    ...(owner ? { createdBy: owner } : {}) 
  });

  if (!segment) {
    return res.status(404).json({ error: 'Segment not found' });
  }

  const baseFilter = buildFilter(segment.rules);
  const filter = owner ? { ...baseFilter, createdBy: owner } : baseFilter;

  // Count total customers in segment
  const totalInSegment = await Customer.countDocuments(filter);

  // Count customers with verified Telegram
  const withTelegram = await Customer.countDocuments({
    ...filter,
    'channels.telegram.verified': true
  });

  res.json({
    segmentName: segment.name,
    totalCustomers: totalInSegment,
    telegramSubscribers: withTelegram,
    reachRate: totalInSegment > 0 ? ((withTelegram / totalInSegment) * 100).toFixed(1) + '%' : '0%'
  });
}));

module.exports = router;
