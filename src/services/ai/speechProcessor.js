const OpenAI = require('openai');
const axios = require('axios');
const logger = require('../../utils/logger');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Transcribe phone call recording
const transcribeCall = async (recordingUrl) => {
  try {
    logger.info('Starting call transcription');
    
    // Download recording from URL
    const audioBuffer = await downloadRecording(recordingUrl);
    
    // Use OpenAI Whisper for transcription
    const transcription = await openai.audio.transcriptions.create({
      file: audioBuffer,
      model: 'whisper-1',
      language: 'en'
    });
    
    logger.info('Call transcribed successfully');
    return transcription.text;
    
  } catch (error) {
    logger.error('Transcription error:', error);
    
    // Fallback to basic transcription
    return 'Transcription failed - recording available at: ' + recordingUrl;
  }
};

// Download recording from URL
const downloadRecording = async (url) => {
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'arraybuffer',
      headers: {
        'Accept': 'audio/*'
      }
    });
    
    return Buffer.from(response.data);
  } catch (error) {
    logger.error('Failed to download recording:', error);
    throw error;
  }
};

// Extract key information from transcription
const extractInfoFromTranscription = async (transcription) => {
  try {
    const prompt = `
Extract the following information from this phone call transcription:

Transcription:
${transcription}

Extract:
1. Ticket/confirmation number (if mentioned)
2. Status of the request
3. Any important dates or deadlines
4. Special instructions or requirements
5. Contact information provided

Format as JSON.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const content = response.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch {
      return { raw: content };
    }

  } catch (error) {
    logger.error('Failed to extract info from transcription:', error);
    return null;
  }
};

module.exports = {
  transcribeCall,
  extractInfoFromTranscription
};