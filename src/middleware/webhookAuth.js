const crypto = require('crypto');
const logger = require('../utils/logger');

// Validate webhook signatures
const validateWebhookSignature = (req, res, next) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    
    // Check if webhook validation is enabled
    if (process.env.WEBHOOK_SECRET) {
      if (!signature || !timestamp) {
        return res.status(401).json({ 
          error: 'Missing webhook signature or timestamp' 
        });
      }
      
      // Check timestamp to prevent replay attacks (5 minute window)
      const currentTime = Date.now();
      const webhookTime = parseInt(timestamp);
      
      if (Math.abs(currentTime - webhookTime) > 300000) {
        return res.status(401).json({ 
          error: 'Webhook timestamp too old' 
        });
      }
      
      // Validate signature
      const payload = timestamp + '.' + JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', process.env.WEBHOOK_SECRET)
        .update(payload)
        .digest('hex');
      
      if (signature !== expectedSignature) {
        return res.status(401).json({ 
          error: 'Invalid webhook signature' 
        });
      }
    }
    
    logger.debug('Webhook signature validated');
    next();
    
  } catch (error) {
    logger.error('Webhook validation error:', error);
    return res.status(500).json({ 
      error: 'Webhook validation failed' 
    });
  }
};

// Generate webhook signature for outgoing webhooks
const generateWebhookSignature = (payload, secret) => {
  const timestamp = Date.now();
  const signaturePayload = timestamp + '.' + JSON.stringify(payload);
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signaturePayload)
    .digest('hex');
  
  return {
    signature,
    timestamp
  };
};

module.exports = {
  validateWebhookSignature,
  generateWebhookSignature
};