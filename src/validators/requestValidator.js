const Joi = require('joi');

// Schema for creating a new 811 request
const createRequestSchema = Joi.object({
  // Contact Information
  contactName: Joi.string().required().min(2).max(100),
  companyName: Joi.string().allow('').max(100),
  phone: Joi.string().required().pattern(/^[\d\s\-\(\)\+]+$/),
  email: Joi.string().email().required(),
  
  // Work Location
  address: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required().length(2).uppercase(),
    zipCode: Joi.string().required().pattern(/^\d{5}(-\d{4})?$/),
    county: Joi.string().allow(''),
    country: Joi.string().default('US').valid('US', 'CA')
  }).required(),
  
  // Work Details
  workType: Joi.string().required().valid(
    'excavation',
    'demolition',
    'drilling',
    'grading',
    'trenching',
    'landscaping',
    'fence_installation',
    'foundation_work',
    'utility_installation',
    'other'
  ),
  workDescription: Joi.string().required().min(10).max(500),
  startDate: Joi.date().required().min('now'),
  duration: Joi.number().integer().min(1).max(365),
  depth: Joi.number().min(0).max(100),
  
  // Area of Work
  workArea: Joi.object({
    length: Joi.number().min(0),
    width: Joi.number().min(0),
    nearestCrossStreet: Joi.string().allow(''),
    markedArea: Joi.boolean().default(false),
    markingInstructions: Joi.string().max(500).allow('')
  }),
  
  // Additional Options
  explosivesUsed: Joi.boolean().default(false),
  emergencyWork: Joi.boolean().default(false),
  permitNumber: Joi.string().allow(''),
  
  // Override District Selection (optional)
  districtId: Joi.string().allow(''),
  
  // Salesforce Integration
  salesforceRecordId: Joi.string().allow(''),
  salesforceCallbackUrl: Joi.string().uri().allow('')
});

// Schema for updating request status
const updateStatusSchema = Joi.object({
  status: Joi.string().required().valid(
    'pending',
    'submitted',
    'in_progress',
    'completed',
    'cancelled',
    'failed'
  ),
  ticketNumber: Joi.string().allow(''),
  notes: Joi.string().allow(''),
  responseData: Joi.object().allow(null)
});

// Schema for getting request by ID
const getRequestSchema = Joi.object({
  requestId: Joi.string().required().guid({
    version: ['uuidv4']
  })
});

// Schema for searching requests
const searchRequestsSchema = Joi.object({
  districtId: Joi.string(),
  status: Joi.string().valid(
    'pending',
    'submitted',
    'in_progress',
    'completed',
    'cancelled',
    'failed'
  ),
  startDate: Joi.date(),
  endDate: Joi.date(),
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0)
});

// Validate create request data
const validateCreateRequest = (data) => {
  const { error, value } = createRequestSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    throw { statusCode: 400, message: 'Validation failed', errors };
  }
  
  return value;
};

// Validate update status data
const validateUpdateStatus = (data) => {
  const { error, value } = updateStatusSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    throw { statusCode: 400, message: 'Validation failed', errors };
  }
  
  return value;
};

// Validate get request parameters
const validateGetRequest = (params) => {
  const { error, value } = getRequestSchema.validate(params);
  
  if (error) {
    throw { statusCode: 400, message: 'Invalid request ID format' };
  }
  
  return value;
};

// Validate search parameters
const validateSearchRequests = (query) => {
  const { error, value } = searchRequestsSchema.validate(query, {
    stripUnknown: true
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    throw { statusCode: 400, message: 'Invalid search parameters', errors };
  }
  
  return value;
};

module.exports = {
  validateCreateRequest,
  validateUpdateStatus,
  validateGetRequest,
  validateSearchRequests
};