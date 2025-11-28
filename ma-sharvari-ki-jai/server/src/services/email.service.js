const sgMail = require('@sendgrid/mail');
const logger = require('../utils/logger');

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

class EmailService {
  constructor() {
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@sharcrm.com';
    this.fromName = process.env.SENDGRID_FROM_NAME || 'SharCRM';
  }

  /**
   * Send a single email
   */
  async sendEmail({ to, subject, text, html, templateId, dynamicData }) {
    if (!process.env.SENDGRID_API_KEY) {
      logger.warn('SendGrid API key not configured, skipping email');
      return { success: false, error: 'Email service not configured' };
    }

    const msg = {
      to,
      from: {
        email: this.fromEmail,
        name: this.fromName
      },
      subject,
      ...(text && { text }),
      ...(html && { html }),
      ...(templateId && { templateId }),
      ...(dynamicData && { dynamicTemplateData: dynamicData })
    };

    try {
      const [response] = await sgMail.send(msg);
      logger.info(`Email sent to ${to}, statusCode: ${response.statusCode}`);
      return { success: true, statusCode: response.statusCode };
    } catch (error) {
      logger.error(`Failed to send email to ${to}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send bulk emails (for campaigns)
   */
  async sendBulkEmail(recipients, { subject, text, html, templateId, dynamicData }) {
    if (!process.env.SENDGRID_API_KEY) {
      logger.warn('SendGrid API key not configured, skipping bulk email');
      return { success: false, sent: 0, failed: recipients.length };
    }

    const results = { success: true, sent: 0, failed: 0, errors: [] };

    // SendGrid allows up to 1000 recipients per API call
    const batches = this.chunkArray(recipients, 1000);

    for (const batch of batches) {
      const messages = batch.map(recipient => ({
        to: recipient.email,
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        subject: this.personalizeSubject(subject, recipient),
        ...(text && { text: this.personalizeContent(text, recipient) }),
        ...(html && { html: this.personalizeContent(html, recipient) }),
        ...(templateId && { templateId }),
        ...(dynamicData && { 
          dynamicTemplateData: { ...dynamicData, ...recipient } 
        })
      }));

      try {
        await sgMail.send(messages);
        results.sent += batch.length;
        logger.info(`Bulk email batch sent: ${batch.length} recipients`);
      } catch (error) {
        results.failed += batch.length;
        results.errors.push(error.message);
        logger.error(`Bulk email batch failed: ${error.message}`);
      }
    }

    results.success = results.failed === 0;
    return results;
  }

  /**
   * Send campaign email to a segment
   */
  async sendCampaignEmail(campaign, customers) {
    const recipients = customers.map(c => ({
      email: c.email,
      name: c.name,
      customerId: c._id.toString()
    }));

    return this.sendBulkEmail(recipients, {
      subject: campaign.subject,
      html: campaign.htmlContent || this.textToHtml(campaign.message),
      text: campaign.message
    });
  }

  /**
   * Personalize subject with customer data
   */
  personalizeSubject(subject, recipient) {
    return subject
      .replace(/{{name}}/gi, recipient.name || 'Valued Customer')
      .replace(/{{email}}/gi, recipient.email || '');
  }

  /**
   * Personalize content with customer data
   */
  personalizeContent(content, recipient) {
    return content
      .replace(/{{name}}/gi, recipient.name || 'Valued Customer')
      .replace(/{{email}}/gi, recipient.email || '')
      .replace(/{{first_name}}/gi, (recipient.name || '').split(' ')[0] || 'Friend');
  }

  /**
   * Convert plain text to HTML email
   */
  textToHtml(text) {
    const escapedText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #666; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; }
    a { color: #667eea; }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0; font-size: 24px;">SharCRM</h1>
  </div>
  <div class="content">
    ${escapedText}
  </div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} SharCRM. All rights reserved.</p>
    <p><a href="{{unsubscribe_url}}">Unsubscribe</a></p>
  </div>
</body>
</html>`;
  }

  /**
   * Split array into chunks
   */
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(user) {
    return this.sendEmail({
      to: user.email,
      subject: 'Welcome to SharCRM! 🎉',
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 12px 12px 0 0; }
    .content { background: #fff; padding: 40px; border: 1px solid #e0e0e0; }
    .button { display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .features { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .feature { display: flex; align-items: center; margin: 10px 0; }
    .check { color: #10b981; margin-right: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">Welcome to SharCRM! 🎉</h1>
      <p style="margin: 10px 0 0; opacity: 0.9;">Your journey to better customer relationships starts here</p>
    </div>
    <div class="content">
      <p>Hi ${user.name || 'there'},</p>
      <p>Thank you for joining SharCRM! We're excited to help you manage your customer relationships more effectively.</p>
      
      <div class="features">
        <h3 style="margin-top: 0;">Here's what you can do:</h3>
        <div class="feature"><span class="check">✓</span> Manage customers & segments</div>
        <div class="feature"><span class="check">✓</span> Create targeted campaigns</div>
        <div class="feature"><span class="check">✓</span> Track customer health scores</div>
        <div class="feature"><span class="check">✓</span> AI-powered insights & suggestions</div>
      </div>
      
      <p style="text-align: center; margin-top: 30px;">
        <a href="${process.env.FRONTEND_ORIGIN || 'http://localhost:5173'}/dashboard" class="button">
          Go to Dashboard →
        </a>
      </p>
      
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        If you have any questions, just reply to this email. We're here to help!
      </p>
    </div>
  </div>
</body>
</html>`
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_ORIGIN || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    return this.sendEmail({
      to: user.email,
      subject: 'Reset Your Password - SharCRM',
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Password Reset Request</h2>
    <p>Hi ${user.name || 'there'},</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </p>
    <p style="color: #666; font-size: 14px;">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
  </div>
</body>
</html>`
    });
  }
}

module.exports = new EmailService();
