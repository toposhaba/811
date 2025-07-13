const express = require('express');
const router = express.Router();
const statusController = require('../controllers/statusController');
const { authenticateRequest } = require('../middleware/auth');

// Get status updates for a request
router.get('/:requestId', authenticateRequest, statusController.getStatusUpdates);

// Create a status update (internal use)
router.post('/:requestId', authenticateRequest, statusController.createStatusUpdate);

// Get latest status for a request
router.get('/:requestId/latest', authenticateRequest, statusController.getLatestStatus);

// Bulk status check
router.post('/bulk', authenticateRequest, statusController.bulkStatusCheck);

module.exports = router;