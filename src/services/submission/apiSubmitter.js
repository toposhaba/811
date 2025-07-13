const axios = require('axios');
const { formatRequestForSubmission } = require('./submissionOrchestrator');
const logger = require('../../utils/logger');

// Submit request via API
const submitViaAPI = async (request, district) => {
  try {
    logger.info(`Starting API submission for district ${district.id}`);
    
    // Format request data
    const formData = formatRequestForSubmission(request);
    
    // Get API configuration for district
    const apiConfig = getDistrictAPIConfig(district.id);
    
    if (!apiConfig) {
      throw new Error(`No API configuration found for district ${district.id}`);
    }
    
    // Prepare API request
    const apiData = transformDataForAPI(formData, apiConfig);
    
    // Make API call
    const response = await axios({
      method: apiConfig.method || 'POST',
      url: apiConfig.endpoint,
      headers: {
        ...apiConfig.headers,
        'Content-Type': 'application/json',
        'User-Agent': '811-Integration-API/1.0'
      },
      data: apiData,
      timeout: 30000
    });
    
    // Extract ticket number from response
    const ticketNumber = extractTicketNumber(response.data, apiConfig);
    
    logger.info(`API submission successful, ticket: ${ticketNumber}`);
    
    return {
      success: true,
      ticketNumber,
      confirmationNumber: ticketNumber,
      data: {
        responseData: response.data,
        submittedAt: new Date().toISOString()
      }
    };
    
  } catch (error) {
    logger.error('API submission error:', error);
    
    if (error.response) {
      throw new Error(`API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    
    throw error;
  }
};

// Get API configuration for specific districts
const getDistrictAPIConfig = (districtId) => {
  const configs = {
    'CA-USANORTH': {
      endpoint: 'https://api.usanorth.org/tickets',
      method: 'POST',
      headers: {
        'X-API-Key': process.env.USANORTH_API_KEY || ''
      },
      fields: {
        contactName: 'contact.name',
        phone: 'contact.phone',
        email: 'contact.email',
        address: 'location.address',
        city: 'location.city',
        state: 'location.state',
        zipCode: 'location.zip',
        workType: 'work.type',
        workDescription: 'work.description',
        startDate: 'work.startDate',
        depth: 'work.depth'
      },
      responseTicketField: 'ticketNumber'
    },
    'CA-DIGALERT': {
      endpoint: 'https://api.digalert.org/v2/tickets',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DIGALERT_API_TOKEN || ''}`
      },
      fields: {
        contactName: 'requester.name',
        phone: 'requester.phone',
        email: 'requester.email',
        address: 'site.streetAddress',
        city: 'site.city',
        state: 'site.state',
        zipCode: 'site.postalCode',
        workType: 'excavation.type',
        workDescription: 'excavation.description',
        startDate: 'excavation.startDate'
      },
      responseTicketField: 'data.ticketId'
    }
  };
  
  return configs[districtId] || null;
};

// Transform data to match district API requirements
const transformDataForAPI = (formData, apiConfig) => {
  const transformed = {};
  
  // Map fields according to district configuration
  Object.entries(apiConfig.fields).forEach(([ourField, apiField]) => {
    const value = formData[ourField];
    if (value !== undefined) {
      // Handle nested field paths
      const parts = apiField.split('.');
      let current = transformed;
      
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }
      
      current[parts[parts.length - 1]] = value;
    }
  });
  
  // Add any required default fields
  if (apiConfig.defaults) {
    Object.assign(transformed, apiConfig.defaults);
  }
  
  return transformed;
};

// Extract ticket number from API response
const extractTicketNumber = (responseData, apiConfig) => {
  // Use configured response field path
  if (apiConfig.responseTicketField) {
    const parts = apiConfig.responseTicketField.split('.');
    let value = responseData;
    
    for (const part of parts) {
      value = value?.[part];
    }
    
    if (value) {
      return value.toString();
    }
  }
  
  // Fallback: Try common field names
  const commonFields = ['ticketNumber', 'ticketId', 'confirmationNumber', 'id', 'referenceNumber'];
  
  for (const field of commonFields) {
    if (responseData[field]) {
      return responseData[field].toString();
    }
  }
  
  // If no ticket number found, generate temporary one
  return `API-${Date.now()}`;
};

module.exports = {
  submitViaAPI
};