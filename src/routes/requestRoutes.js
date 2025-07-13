const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { authenticateRequest } = require('../middleware/auth');

// Create a new 811 request
router.post('/', authenticateRequest, requestController.createRequest);

// Get request by ID
router.get('/:requestId', authenticateRequest, requestController.getRequest);

// Update request status
router.put('/:requestId/status', authenticateRequest, requestController.updateRequestStatus);

// Search requests
router.get('/', authenticateRequest, requestController.searchRequests);

// Cancel a request
router.post('/:requestId/cancel', authenticateRequest, requestController.cancelRequest);

// Retry a failed request
router.post('/:requestId/retry', authenticateRequest, requestController.retryRequest);

module.exports = router;