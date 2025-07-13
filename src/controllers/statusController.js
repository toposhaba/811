const { getStatusUpdates, createStatusUpdate } = require('../services/database/dynamoService');
const logger = require('../utils/logger');

// Get status updates for a request
const getStatusUpdatesHandler = async (req, res) => {
  try {
    const { requestId } = req.params;
    const updates = await getStatusUpdates(requestId);
    
    res.json({
      success: true,
      requestId,
      updates
    });
  } catch (error) {
    logger.error('Error fetching status updates:', error);
    res.status(500).json({
      error: 'Failed to fetch status updates'
    });
  }
};

// Create status update (internal use)
const createStatusUpdateHandler = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, details } = req.body;
    
    const update = await createStatusUpdate(requestId, status, details);
    
    res.json({
      success: true,
      update
    });
  } catch (error) {
    logger.error('Error creating status update:', error);
    res.status(500).json({
      error: 'Failed to create status update'
    });
  }
};

// Get latest status
const getLatestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const updates = await getStatusUpdates(requestId);
    
    const latest = updates[0] || null;
    
    res.json({
      success: true,
      requestId,
      latestStatus: latest
    });
  } catch (error) {
    logger.error('Error fetching latest status:', error);
    res.status(500).json({
      error: 'Failed to fetch latest status'
    });
  }
};

// Bulk status check
const bulkStatusCheck = async (req, res) => {
  try {
    const { requestIds } = req.body;
    
    if (!Array.isArray(requestIds)) {
      return res.status(400).json({
        error: 'requestIds must be an array'
      });
    }
    
    const results = {};
    
    for (const requestId of requestIds) {
      try {
        const updates = await getStatusUpdates(requestId);
        results[requestId] = updates[0] || null;
      } catch (error) {
        results[requestId] = { error: 'Failed to fetch status' };
      }
    }
    
    res.json({
      success: true,
      results
    });
  } catch (error) {
    logger.error('Error in bulk status check:', error);
    res.status(500).json({
      error: 'Failed to perform bulk status check'
    });
  }
};

module.exports = {
  getStatusUpdates: getStatusUpdatesHandler,
  createStatusUpdate: createStatusUpdateHandler,
  getLatestStatus,
  bulkStatusCheck
};