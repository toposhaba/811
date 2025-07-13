const { putItem, getItem, updateItem, queryItems, scanItems, TABLES } = require('./dynamoService');
const { v4: uuidv4 } = require('uuid');
const logger = require('../../utils/logger');

// Create a new request
async function createRequest(requestData) {
  try {
    const item = {
      ...requestData,
      requestId: requestData.requestId || uuidv4(),
      createdAt: requestData.createdAt || new Date().toISOString(),
      updatedAt: requestData.updatedAt || new Date().toISOString()
    };
    
    await putItem(TABLES.REQUESTS, item);
    logger.info(`Created request ${item.requestId}`);
    return item;
  } catch (error) {
    logger.error('Error creating request:', error);
    throw error;
  }
}

// Get a request by ID
async function getRequest(requestId) {
  try {
    const request = await getItem(TABLES.REQUESTS, { requestId });
    return request;
  } catch (error) {
    logger.error(`Error getting request ${requestId}:`, error);
    throw error;
  }
}

// Update a request
async function updateRequest(requestId, updates) {
  try {
    // Add updated timestamp
    updates.updatedAt = new Date().toISOString();
    
    const updatedRequest = await updateItem(
      TABLES.REQUESTS,
      { requestId },
      updates
    );
    
    logger.info(`Updated request ${requestId}`);
    return updatedRequest;
  } catch (error) {
    logger.error(`Error updating request ${requestId}:`, error);
    throw error;
  }
}

// Get requests by Salesforce record ID
async function getRequestsBySalesforceId(salesforceRecordId) {
  try {
    const keyConditions = {
      expression: '#sfId = :sfId',
      names: { '#sfId': 'salesforceRecordId' },
      values: { ':sfId': salesforceRecordId }
    };
    
    const requests = await queryItems(
      TABLES.REQUESTS,
      'salesforceRecordId-index',
      keyConditions
    );
    
    return requests;
  } catch (error) {
    logger.error(`Error getting requests for Salesforce ID ${salesforceRecordId}:`, error);
    throw error;
  }
}

// Get requests by status
async function getRequestsByStatus(status) {
  try {
    const filterExpression = {
      expression: '#status = :status',
      names: { '#status': 'status' },
      values: { ':status': status }
    };
    
    const requests = await scanItems(TABLES.REQUESTS, filterExpression);
    return requests;
  } catch (error) {
    logger.error(`Error getting requests with status ${status}:`, error);
    throw error;
  }
}

// Get recent requests
async function getRecentRequests(limit = 50) {
  try {
    const requests = await scanItems(TABLES.REQUESTS, null, {
      Limit: limit,
      ScanIndexForward: false
    });
    
    // Sort by createdAt descending
    requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return requests;
  } catch (error) {
    logger.error('Error getting recent requests:', error);
    throw error;
  }
}

// Add status update
async function addStatusUpdate(requestId, statusUpdate) {
  try {
    const statusId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const item = {
      statusId,
      requestId,
      timestamp,
      ...statusUpdate
    };
    
    await putItem(TABLES.STATUS, item);
    
    // Update the main request with latest status
    await updateRequest(requestId, {
      status: statusUpdate.status,
      lastStatusUpdate: timestamp,
      ticketNumber: statusUpdate.ticketNumber || undefined,
      confirmationNumber: statusUpdate.confirmationNumber || undefined
    });
    
    logger.info(`Added status update for request ${requestId}`);
    return item;
  } catch (error) {
    logger.error(`Error adding status update for request ${requestId}:`, error);
    throw error;
  }
}

// Get status updates for a request
async function getStatusUpdates(requestId) {
  try {
    const keyConditions = {
      expression: '#requestId = :requestId',
      names: { '#requestId': 'requestId' },
      values: { ':requestId': requestId }
    };
    
    const updates = await queryItems(
      TABLES.STATUS,
      'requestId-timestamp-index',
      keyConditions,
      { ScanIndexForward: false } // Most recent first
    );
    
    return updates;
  } catch (error) {
    logger.error(`Error getting status updates for request ${requestId}:`, error);
    throw error;
  }
}

// Get pending requests that need processing
async function getPendingRequests() {
  try {
    const statuses = ['pending', 'processing', 'submitted'];
    const allRequests = [];
    
    for (const status of statuses) {
      const requests = await getRequestsByStatus(status);
      allRequests.push(...requests);
    }
    
    return allRequests;
  } catch (error) {
    logger.error('Error getting pending requests:', error);
    throw error;
  }
}

module.exports = {
  createRequest,
  getRequest,
  updateRequest,
  getRequestsBySalesforceId,
  getRequestsByStatus,
  getRecentRequests,
  addStatusUpdate,
  getStatusUpdates,
  getPendingRequests
};