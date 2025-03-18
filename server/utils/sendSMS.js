const twilio = require('twilio');

/**
 * Send SMS using Twilio
 * @param {Object} options - SMS options
 * @param {string} options.to - Recipient phone number
 * @param {string} options.message - SMS content
 */
const sendSMS = async (options) => {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  await client.messages.create({
    body: options.message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: options.to
  });
};

module.exports = sendSMS;