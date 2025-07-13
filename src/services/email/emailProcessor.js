const OpenAI = require('openai');
const logger = require('../../utils/logger');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Process email response from 811 district
const processEmailResponse = async (email) => {
  try {
    // Extract ticket information using AI
    const extractedInfo = await extractTicketInfo(email);
    
    // Try to match to a request
    const requestId = await matchEmailToRequest(email, extractedInfo);
    
    return {
      requestId,
      ticketNumber: extractedInfo.ticketNumber,
      status: extractedInfo.status || 'confirmed',
      message: extractedInfo.message,
      extractedData: extractedInfo
    };
    
  } catch (error) {
    logger.error('Email processing error:', error);
    return null;
  }
};

// Extract ticket information from email using AI
const extractTicketInfo = async (email) => {
  try {
    const emailContent = `
From: ${email.from?.text}
Subject: ${email.subject}
Date: ${email.date}

Body:
${email.text || email.html}
`;

    const prompt = `
Extract 811 ticket information from this email:

${emailContent}

Extract:
1. Ticket/confirmation number
2. Status of the request
3. Work location mentioned
4. Any deadlines or important dates
5. Special instructions
6. District/organization name

Return as JSON with these fields:
{
  "ticketNumber": "",
  "status": "",
  "location": "",
  "deadlines": [],
  "instructions": "",
  "district": "",
  "message": ""
}
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
      // Try to extract ticket number manually
      const ticketMatch = emailContent.match(/ticket.*?#?\s*:?\s*([A-Z0-9]{6,15})/i);
      return {
        ticketNumber: ticketMatch?.[1] || null,
        message: content
      };
    }

  } catch (error) {
    logger.error('Failed to extract ticket info:', error);
    return {};
  }
};

// Match email to a request
const matchEmailToRequest = async (email, extractedInfo) => {
  // Check email headers for request ID
  const requestIdHeader = email.headers?.['x-request-id'];
  if (requestIdHeader) {
    return requestIdHeader;
  }
  
  // Check if email is a reply to our email
  const inReplyTo = email.headers?.['in-reply-to'];
  if (inReplyTo && global.emailToRequestMap?.[inReplyTo]) {
    return global.emailToRequestMap[inReplyTo];
  }
  
  // Try to match by location and recent requests
  // This would require querying the database
  // For now, return null
  return null;
};

// Parse specific district email formats
const parseDistrictEmail = (email, districtId) => {
  // District-specific parsing logic
  const parsers = {
    'FL-SUNSHINE': parseSunshineEmail,
    'TX-LONESTAR': parseLonestarEmail,
    'CA-USANORTH': parseUSANorthEmail
  };
  
  const parser = parsers[districtId];
  if (parser) {
    return parser(email);
  }
  
  // Default parsing
  return null;
};

// Florida Sunshine specific parser
const parseSunshineEmail = (email) => {
  const body = email.text || '';
  const ticketMatch = body.match(/Ticket\s+Number:\s*([0-9]{10,})/i);
  
  return {
    ticketNumber: ticketMatch?.[1],
    status: 'confirmed'
  };
};

// Texas Lonestar specific parser
const parseLonestarEmail = (email) => {
  const body = email.text || '';
  const ticketMatch = body.match(/Reference\s+#:\s*([A-Z0-9]+)/i);
  
  return {
    ticketNumber: ticketMatch?.[1],
    status: 'confirmed'
  };
};

// California USA North specific parser
const parseUSANorthEmail = (email) => {
  const body = email.text || '';
  const ticketMatch = body.match(/Ticket:\s*([A-Z0-9-]+)/i);
  
  return {
    ticketNumber: ticketMatch?.[1],
    status: 'confirmed'
  };
};

module.exports = {
  processEmailResponse,
  extractTicketInfo,
  parseDistrictEmail
};