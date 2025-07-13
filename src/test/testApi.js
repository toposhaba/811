const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';
const AUTH_TOKEN = 'test-token'; // In production, this would be a real JWT

// Test request data
const testRequest = {
  contactName: 'John Doe',
  companyName: 'ABC Construction',
  phone: '+1-555-123-4567',
  email: 'john.doe@abcconstruction.com',
  address: {
    street: '123 Main Street',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    country: 'US'
  },
  workType: 'excavation',
  workDescription: 'Installing new water line connection to building. Excavation depth approximately 4 feet.',
  startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  duration: 3,
  depth: 4,
  workArea: {
    length: 50,
    width: 3,
    nearestCrossStreet: 'Oak Avenue',
    markedArea: true,
    markingInstructions: 'White paint marks along proposed excavation route'
  },
  explosivesUsed: false,
  emergencyWork: false,
  permitNumber: 'COA-2024-1234'
};

// Test the API
async function testAPI() {
  try {
    console.log('Testing 811 Integration API...\n');

    // 1. Create a request
    console.log('1. Creating 811 request...');
    const createResponse = await axios.post(
      `${API_BASE_URL}/requests`,
      testRequest,
      {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const { requestId } = createResponse.data;
    console.log(`✓ Request created successfully. ID: ${requestId}`);
    console.log(`  District: ${createResponse.data.district.name}`);
    console.log(`  Estimated response time: ${createResponse.data.estimatedResponseTime}\n`);

    // 2. Get request details
    console.log('2. Fetching request details...');
    const getResponse = await axios.get(
      `${API_BASE_URL}/requests/${requestId}`,
      {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`
        }
      }
    );

    console.log(`✓ Request retrieved successfully`);
    console.log(`  Status: ${getResponse.data.request.status}`);
    console.log(`  Created: ${getResponse.data.request.createdAt}\n`);

    // 3. Get status updates
    console.log('3. Checking status updates...');
    const statusResponse = await axios.get(
      `${API_BASE_URL}/status/${requestId}`,
      {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`
        }
      }
    );

    console.log(`✓ Found ${statusResponse.data.updates?.length || 0} status update(s)\n`);

    // 4. Test search
    console.log('4. Testing search functionality...');
    const searchResponse = await axios.get(
      `${API_BASE_URL}/requests?districtId=${getResponse.data.request.districtId}&limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`
        }
      }
    );

    console.log(`✓ Search returned ${searchResponse.data.requests?.length || 0} result(s)\n`);

    console.log('All tests completed successfully! ✨');

  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests
testAPI();