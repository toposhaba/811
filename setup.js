#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 811 Integration API Setup\n');

const envExample = path.join(__dirname, '.env.example');
const envFile = path.join(__dirname, '.env');

// Check if .env already exists
if (fs.existsSync(envFile)) {
  console.log('⚠️  .env file already exists. Please edit it manually or delete it to run setup again.');
  process.exit(0);
}

// Copy .env.example to .env
try {
  fs.copyFileSync(envExample, envFile);
  console.log('✅ Created .env file from .env.example\n');
} catch (error) {
  console.error('❌ Failed to create .env file:', error.message);
  process.exit(1);
}

console.log('📋 Next steps:\n');
console.log('1. Edit the .env file with your actual configuration values:');
console.log('   - AWS credentials and region');
console.log('   - Twilio account credentials');
console.log('   - OpenAI API key');
console.log('   - Email configuration');
console.log('   - Salesforce credentials');
console.log('   - JWT secret key\n');

console.log('2. Install dependencies:');
console.log('   npm install\n');

console.log('3. Initialize AWS resources (DynamoDB tables will be created automatically)\n');

console.log('4. Start the development server:');
console.log('   npm run dev\n');

console.log('5. Test the API:');
console.log('   node src/test/testApi.js\n');

console.log('📚 Documentation:');
console.log('   - API endpoints are documented in the README.md');
console.log('   - District information is in src/config/districts.js');
console.log('   - Logs will be stored in the logs/ directory');
console.log('   - Screenshots (for debugging) will be in screenshots/\n');

console.log('💡 Tips:');
console.log('   - Use ngrok or similar for webhook testing in development');
console.log('   - Monitor logs for submission status and errors');
console.log('   - The email listener requires IMAP access enabled\n');

rl.close();