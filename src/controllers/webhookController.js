const { createStatusUpdate } = require('../services/database/dynamoService');
const logger = require('../utils/logger');

// Handle status updates from 811 districts
const handleStatusUpdate = async (req, res) => {
  try {
    const { districtId } = req.params;
    const { requestId, ticketNumber, status, message } = req.body;
    
    logger.info(`Received status update from district ${districtId} for request ${requestId}`);
    
    await createStatusUpdate(requestId, 'district_update', {
      districtId,
      ticketNumber,
      status,
      message,
      receivedAt: new Date().toISOString()
    });
    
    res.json({ success: true });
  } catch (error) {
    logger.error('Error handling status update webhook:', error);
    res.status(500).json({ error: 'Failed to process status update' });
  }
};

// Handle parsed email results
const handleEmailParsed = async (req, res) => {
  try {
    const { requestId, ticketNumber, content, extractedData } = req.body;
    
    logger.info(`Received parsed email for request ${requestId}`);
    
    await createStatusUpdate(requestId, 'email_parsed', {
      ticketNumber,
      content,
      extractedData,
      parsedAt: new Date().toISOString()
    });
    
    res.json({ success: true });
  } catch (error) {
    logger.error('Error handling email parsed webhook:', error);
    res.status(500).json({ error: 'Failed to process email data' });
  }
};

// Handle call transcription results
const handleCallTranscribed = async (req, res) => {
  try {
    const { requestId, callSid, transcription, ticketNumber } = req.body;
    
    logger.info(`Received call transcription for request ${requestId}`);
    
    await createStatusUpdate(requestId, 'call_transcribed', {
      callSid,
      transcription,
      ticketNumber,
      transcribedAt: new Date().toISOString()
    });
    
    res.json({ success: true });
  } catch (error) {
    logger.error('Error handling call transcription webhook:', error);
    res.status(500).json({ error: 'Failed to process transcription' });
  }
};

// Handle Twilio status callbacks
const handleTwilioStatus = async (req, res) => {
  try {
    const { CallSid, CallStatus, CallDuration, RecordingUrl } = req.body;
    
    logger.info(`Twilio call status: ${CallStatus} for ${CallSid}`);
    
    // Store call status information
    if (global.callStatusUpdates) {
      global.callStatusUpdates[CallSid] = {
        status: CallStatus,
        duration: CallDuration,
        recordingUrl: RecordingUrl,
        updatedAt: new Date().toISOString()
      };
    }
    
    res.type('text/xml').send('<Response></Response>');
  } catch (error) {
    logger.error('Error handling Twilio status webhook:', error);
    res.status(500).send('<Response></Response>');
  }
};

// Handle Twilio SMS webhooks
const handleTwilioSMS = async (req, res) => {
  try {
    const { From, To, Body, MessageSid } = req.body;
    
    logger.info(`Received SMS from ${From}: ${Body}`);
    
    // Process SMS for ticket numbers or status updates
    const ticketNumberMatch = Body.match(/ticket.*?([A-Z0-9]{6,15})/i);
    
    if (ticketNumberMatch) {
      logger.info(`Extracted ticket number from SMS: ${ticketNumberMatch[1]}`);
      // TODO: Match to request and update status
    }
    
    res.type('text/xml').send('<Response></Response>');
  } catch (error) {
    logger.error('Error handling Twilio SMS webhook:', error);
    res.status(500).send('<Response></Response>');
  }
};

module.exports = {
  handleStatusUpdate,
  handleEmailParsed,
  handleCallTranscribed,
  handleTwilioStatus,
  handleTwilioSMS
};