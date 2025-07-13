const OpenAI = require('openai');
const logger = require('../../utils/logger');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Generate form filling instructions based on HTML analysis
const generateFormFillInstructions = async (formHTML, formData) => {
  try {
    const prompt = `
You are an expert at analyzing HTML forms and generating precise instructions for filling them out.

Given the following HTML form and data to fill, generate a JSON array of instructions for automating the form fill process.

Form HTML:
${formHTML.substring(0, 5000)} // Limit to prevent token overflow

Data to fill:
${JSON.stringify(formData, null, 2)}

Generate instructions in the following format:
[
  {
    "action": "fill|select|click|check|wait",
    "selector": "CSS selector for the element",
    "value": "value to enter (for fill/select actions)",
    "description": "what this field is for"
  }
]

Focus on:
1. Contact information fields (name, company, phone, email)
2. Address/location fields
3. Work type and description
4. Start date
5. Any required checkboxes or agreements
6. Submit button

Make selectors as specific as possible but also flexible enough to work if IDs change.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at web form automation and HTML analysis.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const content = response.choices[0].message.content;
    
    // Parse JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const instructions = JSON.parse(jsonMatch[0]);
      logger.info(`Generated ${instructions.length} form filling instructions`);
      return instructions;
    }

    throw new Error('Failed to parse instructions from AI response');

  } catch (error) {
    logger.error('Form analysis error:', error);
    
    // Return basic fallback instructions
    return [
      {
        action: 'fill',
        selector: 'input[name*="name"], input[name*="contact"]',
        value: formData.contactName,
        description: 'Contact name'
      },
      {
        action: 'fill',
        selector: 'input[name*="company"]',
        value: formData.companyName,
        description: 'Company name'
      },
      {
        action: 'fill',
        selector: 'input[name*="phone"], input[type="tel"]',
        value: formData.phone,
        description: 'Phone number'
      },
      {
        action: 'fill',
        selector: 'input[name*="email"], input[type="email"]',
        value: formData.email,
        description: 'Email address'
      },
      {
        action: 'fill',
        selector: 'input[name*="address"], input[name*="street"]',
        value: formData.street,
        description: 'Street address'
      },
      {
        action: 'fill',
        selector: 'input[name*="city"]',
        value: formData.city,
        description: 'City'
      },
      {
        action: 'fill',
        selector: 'input[name*="zip"], input[name*="postal"]',
        value: formData.zipCode,
        description: 'ZIP code'
      },
      {
        action: 'fill',
        selector: 'textarea[name*="description"], textarea[name*="work"]',
        value: formData.workDescription,
        description: 'Work description'
      },
      {
        action: 'click',
        selector: 'button[type="submit"], input[type="submit"]',
        description: 'Submit button'
      }
    ];
  }
};

// Analyze form structure and identify field mappings
const analyzeFormStructure = async (formHTML) => {
  try {
    const prompt = `
Analyze this HTML form and identify all input fields, their purposes, and any validation requirements.

Form HTML:
${formHTML.substring(0, 3000)}

Provide a structured analysis including:
1. Field name/id and its purpose
2. Field type (text, email, tel, select, etc.)
3. Whether it's required
4. Any validation patterns
5. Related labels or help text
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
      max_tokens: 1500
    });

    return response.choices[0].message.content;

  } catch (error) {
    logger.error('Form structure analysis error:', error);
    return null;
  }
};

// Extract text content from complex forms (useful for understanding form flow)
const extractFormText = async (pageContent) => {
  try {
    const prompt = `
Extract all visible text labels, headings, and instructions from this web page that relate to submitting an 811 dig request.

Page content:
${pageContent.substring(0, 3000)}

Focus on:
- Form field labels
- Required field indicators
- Instructions or help text
- Error messages
- Navigation elements

Format as a simple list.
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
      max_tokens: 1000
    });

    return response.choices[0].message.content;

  } catch (error) {
    logger.error('Form text extraction error:', error);
    return null;
  }
};

module.exports = {
  generateFormFillInstructions,
  analyzeFormStructure,
  extractFormText
};