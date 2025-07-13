const cron = require('node-cron');
const { getRequest, createStatusUpdate } = require('../database/dynamoService');
const { getAllDistricts } = require('../../config/districts');
const { checkWebStatus } = require('./webStatusChecker');
const logger = require('../../utils/logger');

let pollingJob = null;

// Start the status polling service
const startStatusPoller = () => {
  // Run every 30 minutes
  pollingJob = cron.schedule('*/30 * * * *', async () => {
    logger.info('Starting status polling cycle');
    await pollAllActiveRequests();
  });

  // Also run an initial check after 5 minutes
  setTimeout(async () => {
    logger.info('Running initial status check');
    await pollAllActiveRequests();
  }, 5 * 60 * 1000);

  logger.info('Status poller started - checking every 30 minutes');
};

// Stop the status polling service
const stopStatusPoller = () => {
  if (pollingJob) {
    pollingJob.stop();
    pollingJob = null;
    logger.info('Status poller stopped');
  }
};

// Poll all active requests
const pollAllActiveRequests = async () => {
  try {
    // In a real implementation, we'd query for all active requests
    // For now, this is a placeholder
    const activeStatuses = ['submitted', 'in_progress'];
    
    // This would be replaced with a proper query
    logger.info('Polling active requests for status updates');
    
    // Group requests by district for efficient checking
    const requestsByDistrict = {};
    
    // Process each district's requests
    for (const [districtId, requests] of Object.entries(requestsByDistrict)) {
      await checkDistrictRequests(districtId, requests);
    }
    
  } catch (error) {
    logger.error('Status polling error:', error);
  }
};

// Check status for a specific district's requests
const checkDistrictRequests = async (districtId, requests) => {
  const district = getAllDistricts().find(d => d.id === districtId);
  
  if (!district) {
    logger.warn(`District ${districtId} not found`);
    return;
  }
  
  // If district has web portal, try web scraping
  if (district.webPortal && district.methods.includes('web')) {
    for (const request of requests) {
      try {
        if (request.ticketNumber) {
          const status = await checkWebStatus(district, request.ticketNumber);
          
          if (status && status.status !== request.status) {
            // Status changed, update it
            await createStatusUpdate(request.requestId, 'status_changed', {
              previousStatus: request.status,
              newStatus: status.status,
              details: status.details,
              checkedAt: new Date().toISOString()
            });
            
            logger.info(`Status updated for request ${request.requestId}: ${status.status}`);
          }
        }
      } catch (error) {
        logger.error(`Failed to check status for request ${request.requestId}:`, error);
      }
      
      // Add delay between checks to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

// Check single request status on demand
const checkRequestStatus = async (requestId) => {
  try {
    const request = await getRequest(requestId);
    
    if (!request) {
      throw new Error('Request not found');
    }
    
    if (!request.ticketNumber) {
      throw new Error('No ticket number available for status check');
    }
    
    const district = getAllDistricts().find(d => d.id === request.districtId);
    
    if (!district) {
      throw new Error('District not found');
    }
    
    // Try to get status update
    const status = await checkWebStatus(district, request.ticketNumber);
    
    if (status) {
      await createStatusUpdate(request.requestId, 'manual_check', {
        status: status.status,
        details: status.details,
        checkedAt: new Date().toISOString()
      });
      
      return status;
    }
    
    return null;
    
  } catch (error) {
    logger.error(`Failed to check status for request ${requestId}:`, error);
    throw error;
  }
};

// Get polling status
const getPollingStatus = () => {
  return {
    active: pollingJob !== null,
    nextRun: pollingJob?.nextDates(1)[0] || null
  };
};

module.exports = {
  startStatusPoller,
  stopStatusPoller,
  checkRequestStatus,
  getPollingStatus
};