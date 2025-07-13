const { 
  PutCommand, 
  GetCommand, 
  UpdateCommand, 
  QueryCommand,
  ScanCommand,
  DeleteCommand
} = require('@aws-sdk/lib-dynamodb');
const { CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const { getAWSClients } = require('../aws/awsService');
const { v4: uuidv4 } = require('uuid');

const TABLES = {
  REQUESTS: process.env.DYNAMODB_REQUESTS_TABLE || '811-requests',
  DISTRICTS: process.env.DYNAMODB_DISTRICTS_TABLE || '811-districts',
  STATUS: process.env.DYNAMODB_STATUS_TABLE || '811-status-updates'
};

// Initialize database tables
const initializeDatabase = async () => {
  const { dynamoClient } = getAWSClients();
  
  // Define table schemas
  const tableSchemas = [
    {
      TableName: TABLES.REQUESTS,
      KeySchema: [
        { AttributeName: 'requestId', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'requestId', AttributeType: 'S' },
        { AttributeName: 'districtId', AttributeType: 'S' },
        { AttributeName: 'createdAt', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'districtId-index',
          KeySchema: [
            { AttributeName: 'districtId', KeyType: 'HASH' },
            { AttributeName: 'createdAt', KeyType: 'RANGE' }
          ],
          Projection: { ProjectionType: 'ALL' },
          ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
        }
      ],
      ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
    },
    {
      TableName: TABLES.DISTRICTS,
      KeySchema: [
        { AttributeName: 'districtId', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'districtId', AttributeType: 'S' }
      ],
      ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
    },
    {
      TableName: TABLES.STATUS,
      KeySchema: [
        { AttributeName: 'statusId', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'statusId', AttributeType: 'S' },
        { AttributeName: 'requestId', AttributeType: 'S' },
        { AttributeName: 'timestamp', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'requestId-index',
          KeySchema: [
            { AttributeName: 'requestId', KeyType: 'HASH' },
            { AttributeName: 'timestamp', KeyType: 'RANGE' }
          ],
          Projection: { ProjectionType: 'ALL' },
          ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
        }
      ],
      ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
    }
  ];

  // Check and create tables if they don't exist
  for (const schema of tableSchemas) {
    try {
      await dynamoClient.send(new DescribeTableCommand({ TableName: schema.TableName }));
      console.log(`Table ${schema.TableName} already exists`);
    } catch (error) {
      if (error.name === 'ResourceNotFoundException') {
        console.log(`Creating table ${schema.TableName}...`);
        await dynamoClient.send(new CreateTableCommand(schema));
        console.log(`Table ${schema.TableName} created successfully`);
      } else {
        throw error;
      }
    }
  }
};

// Create a new 811 request
const createRequest = async (requestData) => {
  const { dynamoClient } = getAWSClients();
  const requestId = uuidv4();
  const timestamp = new Date().toISOString();

  const item = {
    requestId,
    ...requestData,
    status: 'pending',
    createdAt: timestamp,
    updatedAt: timestamp
  };

  await dynamoClient.send(new PutCommand({
    TableName: TABLES.REQUESTS,
    Item: item
  }));

  return item;
};

// Get request by ID
const getRequest = async (requestId) => {
  const { dynamoClient } = getAWSClients();

  const result = await dynamoClient.send(new GetCommand({
    TableName: TABLES.REQUESTS,
    Key: { requestId }
  }));

  return result.Item;
};

// Update request status
const updateRequestStatus = async (requestId, status, additionalData = {}) => {
  const { dynamoClient } = getAWSClients();
  const timestamp = new Date().toISOString();

  let updateExpression = 'SET #status = :status, updatedAt = :updatedAt';
  const expressionAttributeNames = {
    '#status': 'status'
  };
  const expressionAttributeValues = {
    ':status': status,
    ':updatedAt': timestamp
  };

  // Add additional fields if provided
  Object.keys(additionalData).forEach((key, index) => {
    updateExpression += `, #attr${index} = :val${index}`;
    expressionAttributeNames[`#attr${index}`] = key;
    expressionAttributeValues[`:val${index}`] = additionalData[key];
  });

  await dynamoClient.send(new UpdateCommand({
    TableName: TABLES.REQUESTS,
    Key: { requestId },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues
  }));
};

// Get all requests for a district
const getRequestsByDistrict = async (districtId, limit = 100) => {
  const { dynamoClient } = getAWSClients();

  const result = await dynamoClient.send(new QueryCommand({
    TableName: TABLES.REQUESTS,
    IndexName: 'districtId-index',
    KeyConditionExpression: 'districtId = :districtId',
    ExpressionAttributeValues: {
      ':districtId': districtId
    },
    Limit: limit,
    ScanIndexForward: false // Sort by newest first
  }));

  return result.Items || [];
};

// Save district information
const saveDistrict = async (districtData) => {
  const { dynamoClient } = getAWSClients();

  await dynamoClient.send(new PutCommand({
    TableName: TABLES.DISTRICTS,
    Item: districtData
  }));
};

// Get district by ID
const getDistrict = async (districtId) => {
  const { dynamoClient } = getAWSClients();

  const result = await dynamoClient.send(new GetCommand({
    TableName: TABLES.DISTRICTS,
    Key: { districtId }
  }));

  return result.Item;
};

// Create status update
const createStatusUpdate = async (requestId, status, details = {}) => {
  const { dynamoClient } = getAWSClients();
  const statusId = uuidv4();
  const timestamp = new Date().toISOString();

  const item = {
    statusId,
    requestId,
    status,
    details,
    timestamp
  };

  await dynamoClient.send(new PutCommand({
    TableName: TABLES.STATUS,
    Item: item
  }));

  return item;
};

// Get status updates for a request
const getStatusUpdates = async (requestId) => {
  const { dynamoClient } = getAWSClients();

  const result = await dynamoClient.send(new QueryCommand({
    TableName: TABLES.STATUS,
    IndexName: 'requestId-index',
    KeyConditionExpression: 'requestId = :requestId',
    ExpressionAttributeValues: {
      ':requestId': requestId
    },
    ScanIndexForward: false // Sort by newest first
  }));

  return result.Items || [];
};

module.exports = {
  initializeDatabase,
  createRequest,
  getRequest,
  updateRequestStatus,
  getRequestsByDistrict,
  saveDistrict,
  getDistrict,
  createStatusUpdate,
  getStatusUpdates,
  TABLES
};