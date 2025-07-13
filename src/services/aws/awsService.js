const AWS = require('aws-sdk');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { S3Client } = require('@aws-sdk/client-s3');
const { SQSClient } = require('@aws-sdk/client-sqs');
const { SNSClient } = require('@aws-sdk/client-sns');
const { LambdaClient } = require('@aws-sdk/client-lambda');
const logger = require('../../utils/logger');

let dynamoClient;
let s3Client;
let sqsClient;
let snsClient;
let lambdaClient;

const initializeAWS = async () => {
  const config = {
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  };

  // Initialize DynamoDB
  const dynamoDBClient = new DynamoDBClient(config);
  dynamoClient = DynamoDBDocumentClient.from(dynamoDBClient);

  // Initialize S3
  s3Client = new S3Client(config);

  // Initialize SQS
  sqsClient = new SQSClient(config);

  // Initialize SNS
  snsClient = new SNSClient(config);

  // Initialize Lambda
  lambdaClient = new LambdaClient(config);

  console.log('AWS services initialized successfully');
};

const getAWSClients = () => {
  if (!dynamoClient || !s3Client || !sqsClient || !snsClient || !lambdaClient) {
    throw new Error('AWS services not initialized. Call initializeAWS() first.');
  }

  return {
    dynamoClient,
    s3Client,
    sqsClient,
    snsClient,
    lambdaClient
  };
};

module.exports = {
  initializeAWS,
  getAWSClients
};