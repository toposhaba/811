const express = require('express');
const router = express.Router();
const salesforceController = require('../controllers/salesforceController');
const { authenticateSalesforce } = require('../middleware/salesforceAuth');

// Sync request status to Salesforce
router.post('/sync/:requestId', authenticateSalesforce, salesforceController.syncRequestStatus);

// Get request by Salesforce record ID
router.get('/record/:recordId', authenticateSalesforce, salesforceController.getRequestBySalesforceId);

// Bulk sync multiple requests
router.post('/bulk-sync', authenticateSalesforce, salesforceController.bulkSync);

// Create request from Salesforce flow
router.post('/flow/create', authenticateSalesforce, salesforceController.createFromFlow);

// Update request from Salesforce
router.put('/flow/update/:requestId', authenticateSalesforce, salesforceController.updateFromFlow);

module.exports = router;