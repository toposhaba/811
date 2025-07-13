const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');
const { validateWebhookSignature } = require('../middleware/webhookAuth');

// Receive status updates from 811 districts
router.post('/status/:districtId', validateWebhookSignature, webhookController.handleStatusUpdate);

// Receive email parsing results
router.post('/email/parsed', validateWebhookSignature, webhookController.handleEmailParsed);

// Receive phone call transcription results
router.post('/call/transcribed', validateWebhookSignature, webhookController.handleCallTranscribed);

// Twilio webhook for call status
router.post('/twilio/status', webhookController.handleTwilioStatus);

// Twilio webhook for SMS
router.post('/twilio/sms', webhookController.handleTwilioSMS);

module.exports = router;