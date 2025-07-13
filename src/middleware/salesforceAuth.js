const logger = require('../utils/logger');

// Authenticate Salesforce requests
const authenticateSalesforce = (req, res, next) => {
  try {
    // Check for Salesforce session ID or OAuth token
    const sessionId = req.headers['x-sfdc-session'];
    const oauthToken = req.headers['authorization'];
    
    if (!sessionId && !oauthToken) {
      return res.status(401).json({ 
        error: 'No Salesforce authentication provided' 
      });
    }
    
    // In production, validate the session/token with Salesforce
    // For now, we'll do basic validation
    if (sessionId) {
      // Session ID should match pattern
      if (!/^[a-zA-Z0-9!\.]+$/.test(sessionId)) {
        return res.status(401).json({ 
          error: 'Invalid Salesforce session ID format' 
        });
      }
      req.salesforce = { sessionId };
    } else if (oauthToken) {
      // OAuth token validation
      if (!oauthToken.startsWith('Bearer ')) {
        return res.status(401).json({ 
          error: 'Invalid OAuth token format' 
        });
      }
      req.salesforce = { 
        accessToken: oauthToken.substring(7) 
      };
    }
    
    logger.debug('Salesforce request authenticated');
    next();
    
  } catch (error) {
    logger.error('Salesforce authentication error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed' 
    });
  }
};

module.exports = {
  authenticateSalesforce
};