const { getRequest, createRequest, updateRequestStatus } = require('../services/database/dynamoService');
const { validateCreateRequest } = require('../validators/requestValidator');
const { findDistrictByLocation } = require('../config/districts');
const logger = require('../utils/logger');

// Sync request status to Salesforce
const syncRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const request = await getRequest(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // In production, this would sync to Salesforce
    logger.info(`Syncing request ${requestId} to Salesforce`);
    
    res.json({
      success: true,
      message: 'Status synced to Salesforce',
      request: {
        requestId: request.requestId,
        status: request.status,
        ticketNumber: request.ticketNumber
      }
    });
  } catch (error) {
    logger.error('Error syncing to Salesforce:', error);
    res.status(500).json({ error: 'Failed to sync status' });
  }
};

// Get request by Salesforce record ID
const getRequestBySalesforceId = async (req, res) => {
  try {
    const { recordId } = req.params;
    
    // In production, query by Salesforce record ID
    // For now, this is a placeholder
    res.json({
      success: true,
      message: 'Feature not yet implemented',
      recordId
    });
  } catch (error) {
    logger.error('Error fetching by Salesforce ID:', error);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
};

// Bulk sync multiple requests
const bulkSync = async (req, res) => {
  try {
    const { requestIds } = req.body;
    
    if (!Array.isArray(requestIds)) {
      return res.status(400).json({ error: 'requestIds must be an array' });
    }
    
    const results = {
      success: [],
      failed: []
    };
    
    for (const requestId of requestIds) {
      try {
        const request = await getRequest(requestId);
        if (request) {
          results.success.push(requestId);
        } else {
          results.failed.push({ requestId, error: 'Not found' });
        }
      } catch (error) {
        results.failed.push({ requestId, error: error.message });
      }
    }
    
    res.json({
      success: true,
      results
    });
  } catch (error) {
    logger.error('Error in bulk sync:', error);
    res.status(500).json({ error: 'Bulk sync failed' });
  }
};

// Create request from Salesforce flow
const createFromFlow = async (req, res) => {
  try {
    // Transform Salesforce flow data to our format
    const flowData = {
      contactName: req.body.ContactName,
      companyName: req.body.CompanyName,
      phone: req.body.Phone,
      email: req.body.Email,
      address: {
        street: req.body.Street,
        city: req.body.City,
        state: req.body.State,
        zipCode: req.body.ZipCode,
        country: req.body.Country || 'US'
      },
      workType: req.body.WorkType,
      workDescription: req.body.WorkDescription,
      startDate: req.body.StartDate,
      duration: req.body.Duration || 1,
      depth: req.body.Depth,
      workArea: {
        length: req.body.WorkAreaLength,
        width: req.body.WorkAreaWidth,
        nearestCrossStreet: req.body.NearestCrossStreet,
        markedArea: req.body.MarkedArea || false,
        markingInstructions: req.body.MarkingInstructions
      },
      explosivesUsed: req.body.ExplosivesUsed || false,
      emergencyWork: req.body.EmergencyWork || false,
      permitNumber: req.body.PermitNumber,
      salesforceRecordId: req.body.RecordId,
      salesforceCallbackUrl: req.body.CallbackUrl
    };
    
    // Validate the data
    const validatedData = validateCreateRequest(flowData);
    
    // Find district
    const districts = findDistrictByLocation(
      validatedData.address.state,
      validatedData.address.country
    );
    
    if (districts.length === 0) {
      return res.status(400).json({
        error: 'No 811 district found for location'
      });
    }
    
    // Create the request
    const createdRequest = await createRequest({
      ...validatedData,
      districtId: districts[0].id,
      districtName: districts[0].name,
      submissionMethod: districts[0].methods[0],
      createdVia: 'salesforce_flow'
    });
    
    res.json({
      success: true,
      requestId: createdRequest.requestId,
      district: districts[0].name,
      status: createdRequest.status
    });
    
  } catch (error) {
    logger.error('Error creating from Salesforce flow:', error);
    
    if (error.statusCode === 400) {
      return res.status(400).json(error);
    }
    
    res.status(500).json({ error: 'Failed to create request' });
  }
};

// Update request from Salesforce
const updateFromFlow = async (req, res) => {
  try {
    const { requestId } = req.params;
    const updates = req.body;
    
    await updateRequestStatus(requestId, updates.Status, {
      updatedVia: 'salesforce_flow',
      salesforceUpdates: updates
    });
    
    res.json({
      success: true,
      message: 'Request updated successfully'
    });
  } catch (error) {
    logger.error('Error updating from Salesforce:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
};

module.exports = {
  syncRequestStatus,
  getRequestBySalesforceId,
  bulkSync,
  createFromFlow,
  updateFromFlow
};