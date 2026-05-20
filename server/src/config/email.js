const nodemailer = require('nodemailer');
const logger = require('./logger');

const sendEmail = async (options) => {
  try {
    let transporter;

    // Use production SMTP if configured, otherwise fall back to a safe simulated log transporter
    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    ) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      logger.info('📧 Nodemailer production SMTP transporter initialized.');
    } else {
      // Safe development/simulation transport
      transporter = nodemailer.createTransport({
        jsonTransport: true // Returns logs instead of attempting external network connections
      });
      logger.info('📧 Nodemailer running in simulated JSON transport mode (no credentials required).');
    }

    const mailOptions = {
      from: `"Food Rescue Connect" <${process.env.FROM_EMAIL || 'noreply@foodrescueconnect.org'}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);

    if (process.env.SMTP_HOST) {
      logger.info(`📧 Transactional email successfully sent to ${options.email}. MessageId: ${info.messageId}`);
    } else {
      // Log details of the simulated email locally for debugging
      logger.info(`📧 [Simulated Email] Sent to: ${options.email} | Subject: "${options.subject}"`);
      logger.debug(`📧 Email Payload: ${JSON.stringify(info.message, null, 2)}`);
    }

    return info;
  } catch (error) {
    logger.error('❌ Failed to dispatch transactional email', error);
    // Don't crash the request cycle if email dispatch fails, just log the error
    return null;
  }
};

module.exports = sendEmail;
