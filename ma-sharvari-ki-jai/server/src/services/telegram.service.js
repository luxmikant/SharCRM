/**
 * SharCRM Telegram Bot Service
 * 
 * Handles Telegram bot integration for campaign notifications.
 * Customers can link their Telegram accounts via email verification.
 * 
 * @version 2.0.0
 * @license MIT
 */
const TelegramBot = require('node-telegram-bot-api');
const Customer = require('../models/Customer');
const logger = require('../utils/logger');

// Store pending verifications (email -> { chatId, username, expiresAt })
const pendingVerifications = new Map();

let bot = null;
let botInfo = null;

/**
 * Initialize the Telegram bot
 * Uses polling mode for development, webhook for production
 */
function initBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!token) {
    logger.warn('[Telegram] No TELEGRAM_BOT_TOKEN found. Telegram integration disabled.');
    return null;
  }

  try {
    // Use polling for development (simpler setup)
    bot = new TelegramBot(token, { polling: true });
    
    // Get bot info
    bot.getMe().then((info) => {
      botInfo = info;
      logger.info(`[Telegram] Bot initialized: @${info.username}`);
    }).catch((err) => {
      logger.error('[Telegram] Failed to get bot info:', err.message);
    });

    // Handle /start command
    bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const username = msg.from?.username || 'User';
      
      await bot.sendMessage(chatId, 
        `👋 Welcome to *SharCRM Notifications*, ${username}!\n\n` +
        `To receive campaign notifications, please link your account:\n\n` +
        `1️⃣ Enter your email: \`/link your@email.com\`\n` +
        `2️⃣ You'll receive a verification code\n` +
        `3️⃣ Enter the code: \`/verify CODE\`\n\n` +
        `Once linked, you'll receive marketing updates and offers! 🎉`,
        { parse_mode: 'Markdown' }
      );
    });

    // Handle /link command
    bot.onText(/\/link\s+(.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const email = match[1].trim().toLowerCase();
      const username = msg.from?.username;

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        await bot.sendMessage(chatId, '❌ Invalid email format. Please try again.');
        return;
      }

      // Check if customer exists with this email
      const customer = await Customer.findOne({ email });
      if (!customer) {
        await bot.sendMessage(chatId, 
          '❌ No account found with this email.\n\n' +
          'Please make sure you\'re using the same email registered with the store.'
        );
        return;
      }

      // Check if already linked
      if (customer.channels?.telegram?.verified) {
        await bot.sendMessage(chatId, 
          '✅ This email is already linked to a Telegram account.\n\n' +
          'Use /unlink to disconnect first if you want to link a different account.'
        );
        return;
      }

      // Generate verification code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Store pending verification (expires in 10 minutes)
      pendingVerifications.set(email, {
        chatId,
        username,
        code,
        expiresAt: Date.now() + 10 * 60 * 1000
      });

      await bot.sendMessage(chatId, 
        `📧 Verification code for *${email}*:\n\n` +
        `\`${code}\`\n\n` +
        `Enter this code using: \`/verify ${code}\`\n\n` +
        `_Code expires in 10 minutes._`,
        { parse_mode: 'Markdown' }
      );
    });

    // Handle /verify command
    bot.onText(/\/verify\s+(.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const inputCode = match[1].trim().toUpperCase();

      // Find matching verification
      let foundEmail = null;
      for (const [email, data] of pendingVerifications.entries()) {
        if (data.chatId === chatId && data.code === inputCode) {
          if (Date.now() > data.expiresAt) {
            pendingVerifications.delete(email);
            await bot.sendMessage(chatId, '❌ Verification code expired. Please use /link again.');
            return;
          }
          foundEmail = email;
          break;
        }
      }

      if (!foundEmail) {
        await bot.sendMessage(chatId, '❌ Invalid verification code. Please check and try again.');
        return;
      }

      const verificationData = pendingVerifications.get(foundEmail);

      // Update customer with Telegram info
      await Customer.updateOne(
        { email: foundEmail },
        {
          $set: {
            'channels.telegram': {
              chatId: chatId.toString(),
              username: verificationData.username,
              verified: true,
              subscribedAt: new Date()
            }
          }
        }
      );

      pendingVerifications.delete(foundEmail);

      await bot.sendMessage(chatId, 
        '🎉 *Account linked successfully!*\n\n' +
        'You will now receive campaign notifications via Telegram.\n\n' +
        'Commands:\n' +
        '• /status - Check subscription status\n' +
        '• /unlink - Unsubscribe from notifications',
        { parse_mode: 'Markdown' }
      );
    });

    // Handle /status command
    bot.onText(/\/status/, async (msg) => {
      const chatId = msg.chat.id;
      
      const customer = await Customer.findOne({ 'channels.telegram.chatId': chatId.toString() });
      
      if (!customer) {
        await bot.sendMessage(chatId, 
          '❌ No linked account found.\n\nUse /link your@email.com to connect.'
        );
        return;
      }

      await bot.sendMessage(chatId, 
        `✅ *Account Status*\n\n` +
        `📧 Email: ${customer.email}\n` +
        `👤 Name: ${customer.name}\n` +
        `📅 Linked: ${customer.channels.telegram.subscribedAt?.toLocaleDateString() || 'Unknown'}\n\n` +
        `You're receiving campaign notifications.`,
        { parse_mode: 'Markdown' }
      );
    });

    // Handle /unlink command
    bot.onText(/\/unlink/, async (msg) => {
      const chatId = msg.chat.id;
      
      const result = await Customer.updateOne(
        { 'channels.telegram.chatId': chatId.toString() },
        { $unset: { 'channels.telegram': 1 } }
      );

      if (result.modifiedCount === 0) {
        await bot.sendMessage(chatId, '❌ No linked account found.');
        return;
      }

      await bot.sendMessage(chatId, 
        '✅ Account unlinked successfully.\n\n' +
        'You will no longer receive campaign notifications.\n' +
        'Use /link to reconnect anytime.'
      );
    });

    // Handle errors
    bot.on('polling_error', (error) => {
      logger.error('[Telegram] Polling error:', error.message);
    });

    return bot;
  } catch (error) {
    logger.error('[Telegram] Failed to initialize bot:', error.message);
    return null;
  }
}

/**
 * Send a campaign message to a customer via Telegram
 * @param {string} chatId - Telegram chat ID
 * @param {object} options - Message options
 * @returns {Promise<object>} Send result
 */
async function sendCampaignMessage(chatId, { template, campaignName, subject }) {
  if (!bot) {
    throw new Error('Telegram bot not initialized');
  }

  try {
    // Format the message
    const message = formatCampaignMessage(template, { campaignName, subject });
    
    const result = await bot.sendMessage(chatId, message, { 
      parse_mode: 'Markdown',
      disable_web_page_preview: false 
    });

    return {
      success: true,
      messageId: result.message_id,
      chatId: result.chat.id
    };
  } catch (error) {
    logger.error(`[Telegram] Failed to send to ${chatId}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Format campaign template for Telegram
 * Converts HTML-like templates to Markdown
 */
function formatCampaignMessage(template, { campaignName, subject }) {
  let message = template;
  
  // Basic HTML to Markdown conversion
  message = message.replace(/<b>(.*?)<\/b>/gi, '*$1*');
  message = message.replace(/<strong>(.*?)<\/strong>/gi, '*$1*');
  message = message.replace(/<i>(.*?)<\/i>/gi, '_$1_');
  message = message.replace(/<em>(.*?)<\/em>/gi, '_$1_');
  message = message.replace(/<code>(.*?)<\/code>/gi, '`$1`');
  message = message.replace(/<br\s*\/?>/gi, '\n');
  message = message.replace(/<p>/gi, '');
  message = message.replace(/<\/p>/gi, '\n\n');
  message = message.replace(/<[^>]*>/g, ''); // Remove remaining HTML tags
  
  // Add header if subject exists
  if (subject) {
    message = `📢 *${subject}*\n\n${message}`;
  }

  // Add footer
  message += '\n\n---\n_Sent via SharCRM_';

  return message;
}

/**
 * Broadcast campaign to all verified Telegram subscribers in a segment
 * @param {string} campaignId - Campaign ID
 * @param {array} customers - Array of customers to message
 * @param {object} template - Message template and subject
 */
async function broadcastCampaign(campaignId, customers, { template, subject, campaignName }) {
  if (!bot) {
    logger.warn('[Telegram] Bot not initialized, skipping broadcast');
    return { sent: 0, failed: 0, skipped: 0 };
  }

  const results = { sent: 0, failed: 0, skipped: 0 };
  
  for (const customer of customers) {
    const chatId = customer.channels?.telegram?.chatId;
    
    if (!chatId || !customer.channels?.telegram?.verified) {
      results.skipped++;
      continue;
    }

    const result = await sendCampaignMessage(chatId, { template, subject, campaignName });
    
    if (result.success) {
      results.sent++;
    } else {
      results.failed++;
    }

    // Rate limiting: Telegram allows ~30 messages/second
    await new Promise(resolve => setTimeout(resolve, 35));
  }

  logger.info(`[Telegram] Campaign ${campaignId} broadcast: ${results.sent} sent, ${results.failed} failed, ${results.skipped} skipped`);
  return results;
}

/**
 * Get statistics about Telegram subscribers
 */
async function getStats() {
  const total = await Customer.countDocuments({ 'channels.telegram.verified': true });
  const recent = await Customer.countDocuments({
    'channels.telegram.verified': true,
    'channels.telegram.subscribedAt': { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  });

  return {
    totalSubscribers: total,
    newThisWeek: recent,
    botActive: !!bot,
    botUsername: botInfo?.username || null
  };
}

/**
 * Test send a message (for debugging)
 */
async function sendTestMessage(chatId, message) {
  if (!bot) {
    throw new Error('Telegram bot not initialized');
  }

  return bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
}

/**
 * Get bot instance
 */
function getBot() {
  return bot;
}

/**
 * Check if bot is ready
 */
function isReady() {
  return !!bot && !!botInfo;
}

module.exports = {
  initBot,
  getBot,
  isReady,
  sendCampaignMessage,
  broadcastCampaign,
  getStats,
  sendTestMessage
};
