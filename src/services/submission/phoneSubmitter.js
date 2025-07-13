const twilio = require('twilio');
const { generateCallScript } = require('../ai/callScriptGenerator');
const { transcribeCall } = require('../ai/speechProcessor');
const { formatRequestForSubmission } = require('./submissionOrchestrator');
const logger = require('../../utils/logger');

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Submit request via phone call
const submitViaPhone = async (request, district) => {
  try {
    logger.info(`Starting phone submission for district ${district.id}`);
    
    // Format request data
    const formData = formatRequestForSubmission(request);
    
    // Generate AI call script
    const callScript = await generateCallScript(formData, district);
    
    // Create TwiML for the call
    const twiml = generateTwiML(callScript, request.requestId);
    
    // Store TwiML for webhook access
    await storeTwiML(request.requestId, twiml);
    
    // Make the call
    const call = await twilioClient.calls.create({
      to: district.phone,
      from: process.env.TWILIO_PHONE_NUMBER,
      url: `${process.env.WEBHOOK_BASE_URL}/api/webhooks/twilio/twiml/${request.requestId}`,
      statusCallback: `${process.env.WEBHOOK_BASE_URL}/api/webhooks/twilio/status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      statusCallbackMethod: 'POST',
      record: true,
      recordingStatusCallback: `${process.env.WEBHOOK_BASE_URL}/api/webhooks/twilio/recording`,
      timeout: 600, // 10 minutes
      machineDetection: 'Enable',
      machineDetectionTimeout: 5000
    });
    
    logger.info(`Phone call initiated: ${call.sid}`);
    
    // Wait for call to complete (with timeout)
    const result = await waitForCallCompletion(call.sid, 600000); // 10 min timeout
    
    // Process recording and extract ticket number
    if (result.recordingUrl) {
      const transcription = await transcribeCall(result.recordingUrl);
      const ticketNumber = extractTicketNumber(transcription);
      
      return {
        success: true,
        ticketNumber: ticketNumber || `PHONE-${Date.now()}`,
        confirmationNumber: ticketNumber || call.sid,
        data: {
          callSid: call.sid,
          duration: result.duration,
          transcription: transcription,
          submittedAt: new Date().toISOString()
        }
      };
    }
    
    throw new Error('Call completed but no recording available');
    
  } catch (error) {
    logger.error('Phone submission error:', error);
    throw error;
  }
};

// Generate TwiML for the call
const generateTwiML = (callScript, requestId) => {
  const twiml = new twilio.twiml.VoiceResponse();
  
  // Initial greeting pause
  twiml.pause({ length: 2 });
  
  // Process each script segment
  callScript.segments.forEach(segment => {
    switch (segment.type) {
      case 'speak':
        twiml.say({
          voice: 'alice',
          language: 'en-US'
        }, segment.text);
        break;
        
      case 'gather':
        const gather = twiml.gather({
          input: ['speech', 'dtmf'],
          timeout: segment.timeout || 5,
          speechTimeout: 'auto',
          action: `${process.env.WEBHOOK_BASE_URL}/api/webhooks/twilio/gather/${requestId}/${segment.id}`,
          method: 'POST'
        });
        
        gather.say({
          voice: 'alice',
          language: 'en-US'
        }, segment.prompt);
        break;
        
      case 'pause':
        twiml.pause({ length: segment.duration || 1 });
        break;
    }
  });
  
  // End of call
  twiml.say({
    voice: 'alice',
    language: 'en-US'
  }, 'Thank you for processing our request. Have a great day. Goodbye.');
  
  return twiml.toString();
};

// Store TwiML for webhook access
const storeTwiML = async (requestId, twiml) => {
  // In production, store in Redis or DynamoDB
  // For now, use in-memory storage
  global.twimlStorage = global.twimlStorage || {};
  global.twimlStorage[requestId] = twiml;
};

// Wait for call completion
const waitForCallCompletion = async (callSid, timeout) => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      const call = await twilioClient.calls(callSid).fetch();
      
      if (call.status === 'completed' || call.status === 'failed') {
        // Get recordings
        const recordings = await twilioClient.recordings.list({
          callSid: callSid,
          limit: 1
        });
        
        return {
          status: call.status,
          duration: call.duration,
          recordingUrl: recordings[0]?.mediaUrl,
          recordingSid: recordings[0]?.sid
        };
      }
      
      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, 5000));
      
    } catch (error) {
      logger.error('Error checking call status:', error);
    }
  }
  
  throw new Error('Call timeout - took too long to complete');
};

// Extract ticket number from transcription
const extractTicketNumber = (transcription) => {
  if (!transcription) return null;
  
  // Common patterns for ticket numbers in speech
  const patterns = [
    /ticket\s+number\s+is\s+([A-Z0-9]+)/i,
    /confirmation\s+number\s+([A-Z0-9]+)/i,
    /reference\s+number\s+([A-Z0-9]+)/i,
    /your\s+number\s+is\s+([A-Z0-9]+)/i,
    /\b([A-Z]{2,4}[\s-]?\d{4,10})\b/
  ];
  
  for (const pattern of patterns) {
    const match = transcription.match(pattern);
    if (match && match[1]) {
      return match[1].replace(/\s/g, '');
    }
  }
  
  return null;
};

// Handle interactive voice response
const handleIVR = async (digits, requestId, segmentId) => {
  // Retrieve stored call context
  const context = global.callContexts?.[requestId];
  if (!context) {
    throw new Error('Call context not found');
  }
  
  // Process based on segment
  const response = new twilio.twiml.VoiceResponse();
  
  // Continue with next segment
  const nextSegment = context.script.segments.find(s => s.id === segmentId + 1);
  if (nextSegment) {
    // Process next segment
    response.redirect(`${process.env.WEBHOOK_BASE_URL}/api/webhooks/twilio/twiml/${requestId}?segment=${nextSegment.id}`);
  } else {
    // End call
    response.say('Thank you. Your request has been submitted.');
    response.hangup();
  }
  
  return response.toString();
};

module.exports = {
  submitViaPhone,
  handleIVR,
  extractTicketNumber
};