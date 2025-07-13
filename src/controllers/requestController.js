const { 
  createRequest: dbCreateRequest,
  getRequest: dbGetRequest,
  updateRequestStatus: dbUpdateRequestStatus,
  getRequestsByDistrict
} = require('../services/database/dynamoService');
const { findDistrictByLocation, getDistrictById } = require('../config/districts');
const { validateCreateRequest, validateGetRequest, validateSearchRequests } = require('../validators/requestValidator');
const { submit811Request } = require('../services/submission/submissionOrchestrator');
const logger = require('../utils/logger');

// Create a new 811 request
const createRequest = async (req, res) => {
  try {
    // Validate request data
    const validatedData = validateCreateRequest(req.body);
    
    // Find the appropriate district based on location
    let district;
    if (validatedData.districtId) {
      district = getDistrictById(validatedData.districtId);
      if (!district) {
        return res.status(400).json({
          error: 'Invalid district ID provided'
        });
      }
    } else {
      const districts = findDistrictByLocation(
        validatedData.address.state,
        validatedData.address.country
      );
      
      if (districts.length === 0) {
        return res.status(400).json({
          error: 'No 811 district found for the specified location'
        });
      }
      
      // If multiple districts, use the first one (could be enhanced with better logic)
      district = districts[0];
    }
    
    // Create request record in database
    const requestData = {
      ...validatedData,
      districtId: district.id,
      districtName: district.name,
      submissionMethod: district.methods[0], // Default to first available method
      userId: req.user.userId
    };
    
    const createdRequest = await dbCreateRequest(requestData);
    
    // Submit the request to the district asynchronously
    submit811Request(createdRequest, district).catch(error => {
      logger.error(`Failed to submit request ${createdRequest.requestId}:`, error);
    });
    
    res.status(201).json({
      success: true,
      requestId: createdRequest.requestId,
      district: {
        id: district.id,
        name: district.name,
        methods: district.methods
      },
      estimatedResponseTime: '2-4 business days',
      request: createdRequest
    });
    
  } catch (error) {
    logger.error('Error creating 811 request:', error);
    
    if (error.statusCode === 400) {
      return res.status(400).json(error);
    }
    
    res.status(500).json({
      error: 'Failed to create request',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get request by ID
const getRequest = async (req, res) => {
  try {
    const { requestId } = validateGetRequest(req.params);
    
    const request = await dbGetRequest(requestId);
    
    if (!request) {
      return res.status(404).json({
        error: 'Request not found'
      });
    }
    
    // Check if user has permission to view this request
    if (request.userId !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Permission denied'
      });
    }
    
    res.json({
      success: true,
      request
    });
    
  } catch (error) {
    logger.error('Error fetching request:', error);
    
    if (error.statusCode === 400) {
      return res.status(400).json(error);
    }
    
    res.status(500).json({
      error: 'Failed to fetch request'
    });
  }
};

// Update request status
const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, ticketNumber, notes } = req.body;
    
    const request = await dbGetRequest(requestId);
    
    if (!request) {
      return res.status(404).json({
        error: 'Request not found'
      });
    }
    
    // Check permissions
    if (request.userId !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Permission denied'
      });
    }
    
    await dbUpdateRequestStatus(requestId, status, {
      ticketNumber,
      notes,
      updatedBy: req.user.userId
    });
    
    res.json({
      success: true,
      message: 'Request status updated successfully'
    });
    
  } catch (error) {
    logger.error('Error updating request status:', error);
    res.status(500).json({
      error: 'Failed to update request status'
    });
  }
};

// Search requests
const searchRequests = async (req, res) => {
  try {
    const searchParams = validateSearchRequests(req.query);
    
    // For now, implement district-based search
    if (searchParams.districtId) {
      const requests = await getRequestsByDistrict(
        searchParams.districtId,
        searchParams.limit
      );
      
      return res.json({
        success: true,
        requests,
        total: requests.length
      });
    }
    
    // TODO: Implement more sophisticated search
    res.json({
      success: true,
      requests: [],
      total: 0,
      message: 'Search functionality is limited. Please specify a districtId.'
    });
    
  } catch (error) {
    logger.error('Error searching requests:', error);
    
    if (error.statusCode === 400) {
      return res.status(400).json(error);
    }
    
    res.status(500).json({
      error: 'Failed to search requests'
    });
  }
};

// Cancel a request
const cancelRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;
    
    const request = await dbGetRequest(requestId);
    
    if (!request) {
      return res.status(404).json({
        error: 'Request not found'
      });
    }
    
    // Check permissions
    if (request.userId !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Permission denied'
      });
    }
    
    // Check if request can be cancelled
    if (['completed', 'cancelled'].includes(request.status)) {
      return res.status(400).json({
        error: `Cannot cancel request in ${request.status} status`
      });
    }
    
    await dbUpdateRequestStatus(requestId, 'cancelled', {
      cancellationReason: reason,
      cancelledBy: req.user.userId,
      cancelledAt: new Date().toISOString()
    });
    
    // TODO: Send cancellation to district if already submitted
    
    res.json({
      success: true,
      message: 'Request cancelled successfully'
    });
    
  } catch (error) {
    logger.error('Error cancelling request:', error);
    res.status(500).json({
      error: 'Failed to cancel request'
    });
  }
};

// Retry a failed request
const retryRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const request = await dbGetRequest(requestId);
    
    if (!request) {
      return res.status(404).json({
        error: 'Request not found'
      });
    }
    
    // Check permissions
    if (request.userId !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Permission denied'
      });
    }
    
    // Check if request can be retried
    if (request.status !== 'failed') {
      return res.status(400).json({
        error: 'Only failed requests can be retried'
      });
    }
    
    // Update status to pending
    await dbUpdateRequestStatus(requestId, 'pending', {
      retryCount: (request.retryCount || 0) + 1,
      retriedBy: req.user.userId,
      retriedAt: new Date().toISOString()
    });
    
    // Get district and resubmit
    const district = getDistrictById(request.districtId);
    submit811Request(request, district).catch(error => {
      logger.error(`Failed to retry request ${requestId}:`, error);
    });
    
    res.json({
      success: true,
      message: 'Request queued for retry'
    });
    
  } catch (error) {
    logger.error('Error retrying request:', error);
    res.status(500).json({
      error: 'Failed to retry request'
    });
  }
};

module.exports = {
  createRequest,
  getRequest,
  updateRequestStatus,
  searchRequests,
  cancelRequest,
  retryRequest
};