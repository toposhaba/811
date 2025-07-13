const OpenAI = require('openai');
const logger = require('../../utils/logger');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Generate a call script for phone submission
const generateCallScript = async (formData, district) => {
  try {
    const prompt = `
Generate a professional phone call script for submitting an 811 dig safe request to ${district.name}.

Request details:
- Contact: ${formData.contactName} from ${formData.companyName || 'private individual'}
- Phone: ${formData.phone}
- Email: ${formData.email}
- Work location: ${formData.address}
- Work type: ${formData.workType}
- Work description: ${formData.workDescription}
- Start date: ${formData.startDate}
- Emergency: ${formData.emergencyWork ? 'YES' : 'NO'}

Create a structured script with segments that include:
1. Professional greeting and introduction
2. Statement of purpose (submitting an 811 request)
3. Providing all necessary information clearly
4. Asking for confirmation/ticket number
5. Professional closing

Format the response as a JSON object with this structure:
{
  "segments": [
    {
      "id": 1,
      "type": "speak|gather|pause",
      "text": "what to say (for speak segments)",
      "prompt": "question to ask (for gather segments)",
      "timeout": 5,
      "duration": 1
    }
  ]
}

Important:
- Be concise but complete
- Speak slowly and clearly
- Spell out complex words or numbers
- Be prepared for IVR systems
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at creating professional phone scripts for business calls.'
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
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const script = JSON.parse(jsonMatch[0]);
      logger.info(`Generated call script with ${script.segments.length} segments`);
      return script;
    }

    throw new Error('Failed to parse script from AI response');

  } catch (error) {
    logger.error('Call script generation error:', error);
    
    // Return fallback script
    return {
      segments: [
        {
          id: 1,
          type: 'pause',
          duration: 2
        },
        {
          id: 2,
          type: 'speak',
          text: `Hello, this is ${formData.contactName} from ${formData.companyName || 'a private residence'}. I need to submit an 811 dig safe request.`
        },
        {
          id: 3,
          type: 'pause',
          duration: 2
        },
        {
          id: 4,
          type: 'speak',
          text: `The work location is ${formData.address}.`
        },
        {
          id: 5,
          type: 'pause',
          duration: 1
        },
        {
          id: 6,
          type: 'speak',
          text: `We will be performing ${formData.workType} work. ${formData.workDescription}`
        },
        {
          id: 7,
          type: 'pause',
          duration: 1
        },
        {
          id: 8,
          type: 'speak',
          text: `The work is scheduled to start on ${new Date(formData.startDate).toLocaleDateString()}.`
        },
        {
          id: 9,
          type: 'pause',
          duration: 1
        },
        {
          id: 10,
          type: 'speak',
          text: `My callback number is ${formData.phone.split('').join(' ')}. My email is ${formData.email}.`
        },
        {
          id: 11,
          type: 'pause',
          duration: 3
        },
        {
          id: 12,
          type: 'speak',
          text: 'Could you please provide me with the ticket number for this request?'
        },
        {
          id: 13,
          type: 'pause',
          duration: 5
        }
      ]
    };
  }
};

// Generate IVR navigation script
const generateIVRScript = async (menuOptions) => {
  try {
    const prompt = `
Given these IVR menu options, generate the optimal sequence of key presses to reach an 811 dig safe request submission:

Menu options:
${menuOptions}

Goal: Submit a new 811 dig safe / locate request

Return a JSON array of actions like:
[
  {"action": "press", "key": "1", "wait": 2},
  {"action": "press", "key": "3", "wait": 2}
]
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
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return [];

  } catch (error) {
    logger.error('IVR script generation error:', error);
    return [];
  }
};

// Enhance script with district-specific information
const enhanceScriptForDistrict = async (baseScript, district) => {
  // Add district-specific greetings or requirements
  const enhancedScript = { ...baseScript };
  
  // Some districts may have specific requirements
  if (district.notes && district.notes.includes('pre-marking required')) {
    enhancedScript.segments.splice(2, 0, {
      id: 2.5,
      type: 'speak',
      text: 'Please note that pre-marking has been completed at the work site as required.'
    });
  }
  
  return enhancedScript;
};

module.exports = {
  generateCallScript,
  generateIVRScript,
  enhanceScriptForDistrict
};