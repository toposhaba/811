const { updateRequestStatus, createStatusUpdate } = require('../database/dynamoService');
const { submitViaWebform } = require('./webformSubmitter');
const { submitViaPhone } = require('./phoneSubmitter');
const { submitViaEmail } = require('./emailSubmitter');
const { submitViaAPI } = require('./apiSubmitter');
const logger = require('../../utils/logger');

// Main function to submit 811 request
const submit811Request = async (request, district) => {
  try {
    logger.info(`Submitting request ${request.requestId} to district ${district.id}`);
    
    // Update status to submitting
    await updateRequestStatus(request.requestId, 'submitting');
    await createStatusUpdate(request.requestId, 'submitting', {
      message: `Submitting request to ${district.name}`,
      method: request.submissionMethod || district.methods[0]
    });
    
    let result;
    const method = request.submissionMethod || district.methods[0];
    
    // Route to appropriate submission method
    switch (method) {
      case 'api':
        if (district.apiAvailable) {
          result = await submitViaAPI(request, district);
        } else {
          throw new Error('API submission not available for this district');
        }
        break;
        
      case 'web':
      case 'webform':
        result = await submitViaWebform(request, district);
        break;
        
      case 'email':
        if (district.emailAvailable) {
          result = await submitViaEmail(request, district);
        } else {
          throw new Error('Email submission not available for this district');
        }
        break;
        
      case 'phone':
        result = await submitViaPhone(request, district);
        break;
        
      default:
        throw new Error(`Unsupported submission method: ${method}`);
    }
    
    // Update request with submission result
    if (result.success) {
      await updateRequestStatus(request.requestId, 'submitted', {
        ticketNumber: result.ticketNumber,
        confirmationNumber: result.confirmationNumber,
        submittedAt: new Date().toISOString(),
        submissionMethod: method,
        responseData: result.data
      });
      
      await createStatusUpdate(request.requestId, 'submitted', {
        message: 'Request successfully submitted',
        ticketNumber: result.ticketNumber,
        confirmationNumber: result.confirmationNumber,
        method: method
      });
      
      logger.info(`Successfully submitted request ${request.requestId}, ticket: ${result.ticketNumber}`);
    } else {
      throw new Error(result.error || 'Submission failed');
    }
    
    return result;
    
  } catch (error) {
    logger.error(`Failed to submit request ${request.requestId}:`, error);
    
    // Update status to failed
    await updateRequestStatus(request.requestId, 'failed', {
      error: error.message,
      failedAt: new Date().toISOString()
    });
    
    await createStatusUpdate(request.requestId, 'failed', {
      message: 'Failed to submit request',
      error: error.message,
      method: request.submissionMethod || district.methods[0]
    });
    
    // Try fallback methods if available
    if (district.methods.length > 1) {
      const currentMethodIndex = district.methods.indexOf(request.submissionMethod || district.methods[0]);
      if (currentMethodIndex < district.methods.length - 1) {
        const fallbackMethod = district.methods[currentMethodIndex + 1];
        logger.info(`Attempting fallback submission method: ${fallbackMethod}`);
        
        // Update submission method and retry
        request.submissionMethod = fallbackMethod;
        return submit811Request(request, district);
      }
    }
    
    throw error;
  }
};

// Check if a submission method is available for a district
const isMethodAvailable = (district, method) => {
  if (!district.methods.includes(method)) {
    return false;
  }
  
  switch (method) {
    case 'api':
      return district.apiAvailable === true;
    case 'email':
      return district.emailAvailable === true;
    case 'web':
    case 'webform':
    case 'phone':
      return true;
    default:
      return false;
  }
};

// Get the best submission method for a district
const getBestSubmissionMethod = (district, preferredMethod = null) => {
  // If preferred method is available, use it
  if (preferredMethod && isMethodAvailable(district, preferredMethod)) {
    return preferredMethod;
  }
  
  // Priority order: API > Webform > Email > Phone
  const priorityOrder = ['api', 'web', 'webform', 'email', 'phone'];
  
  for (const method of priorityOrder) {
    if (isMethodAvailable(district, method)) {
      return method;
    }
  }
  
  // Default to first available method
  return district.methods[0];
};

// Format request data for submission
const formatRequestForSubmission = (request) => {
  return {
    // Contact Information
    contactName: request.contactName,
    companyName: request.companyName || '',
    phone: request.phone,
    email: request.email,
    
    // Location
    address: `${request.address.street}, ${request.address.city}, ${request.address.state} ${request.address.zipCode}`,
    street: request.address.street,
    city: request.address.city,
    state: request.address.state,
    zipCode: request.address.zipCode,
    county: request.address.county || '',
    
    // Work Details
    workType: request.workType,
    workDescription: request.workDescription,
    startDate: request.startDate,
    duration: request.duration || 1,
    depth: request.depth || 'Unknown',
    
    // Work Area
    nearestCrossStreet: request.workArea?.nearestCrossStreet || '',
    workAreaLength: request.workArea?.length || '',
    workAreaWidth: request.workArea?.width || '',
    markedArea: request.workArea?.markedArea || false,
    markingInstructions: request.workArea?.markingInstructions || '',
    
    // Additional Info
    explosivesUsed: request.explosivesUsed || false,
    emergencyWork: request.emergencyWork || false,
    permitNumber: request.permitNumber || '',
    
    // System fields
    requestId: request.requestId,
    createdAt: request.createdAt
  };
};

module.exports = {
  submit811Request,
  isMethodAvailable,
  getBestSubmissionMethod,
  formatRequestForSubmission
};