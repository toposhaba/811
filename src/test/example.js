#!/usr/bin/env node

/**
 * Example script demonstrating how to use the 811 Webform Test Suite
 * 
 * This script shows different ways to run tests and analyze results.
 */

const WebformTestRunner = require('./runWebformTests');
const WebformTestSuite = require('./webformTestSuite');
const WebformPuppeteerTest = require('./webformPuppeteerTest');
const { getAllDistricts } = require('../config/districts');
const logger = require('../utils/logger');

async function runExamples() {
  logger.info('🚀 811 Webform Test Suite Examples');
  logger.info('='.repeat(60));

  // Example 1: Quick test with the test runner
  logger.info('\n📋 Example 1: Running a quick test');
  const runner = new WebformTestRunner();
  const quickResults = await runner.runQuickTest();
  
  logger.info(`Quick test completed: ${quickResults.summary.successful}/${quickResults.summary.total} successful`);

  // Example 2: Test specific districts
  logger.info('\n📋 Example 2: Testing specific districts');
  const specificResults = await runner.runFullTestSuite({
    specificDistricts: ['AL811', 'TX-LONESTAR'],
    includePuppeteer: true,
    includeApiTests: true
  });
  
  logger.info(`Specific districts test completed: ${specificResults.summary.successful}/${specificResults.summary.total} successful`);

  // Example 3: Using individual test suites
  logger.info('\n📋 Example 3: Using individual test suites');
  const testSuite = new WebformTestSuite();
  const districts = getAllDistricts().slice(0, 3); // First 3 districts
  const apiResults = await testSuite.runSpecificTests(districts.map(d => d.id));
  
  logger.info(`API test results: ${apiResults.filter(r => r.success).length}/${apiResults.length} successful`);

  // Example 4: Puppeteer tests for web-enabled districts
  logger.info('\n📋 Example 4: Puppeteer tests for web districts');
  const webDistricts = getAllDistricts().filter(d => d.methods.includes('web')).slice(0, 2);
  
  if (webDistricts.length > 0) {
    const puppeteerTest = new WebformPuppeteerTest();
    await puppeteerTest.initialize();
    
    try {
      for (const district of webDistricts) {
        const result = await puppeteerTest.testWebform(district);
        logger.info(`${district.name}: ${result.success ? 'SUCCESS' : 'FAILED'}`);
        
        if (result.formFields.length > 0) {
          logger.info(`  Found ${result.formFields.length} form fields`);
        }
      }
    } finally {
      await puppeteerTest.cleanup();
    }
  }

  // Example 5: Analyze district configuration
  logger.info('\n📋 Example 5: Analyzing district configuration');
  const allDistricts = getAllDistricts();
  
  const stats = {
    total: allDistricts.length,
    webEnabled: allDistricts.filter(d => d.methods.includes('web')).length,
    phoneEnabled: allDistricts.filter(d => d.methods.includes('phone')).length,
    apiEnabled: allDistricts.filter(d => d.apiAvailable).length,
    emailEnabled: allDistricts.filter(d => d.emailAvailable).length
  };
  
  logger.info('District Statistics:');
  logger.info(`  Total Districts: ${stats.total}`);
  logger.info(`  Web-Enabled: ${stats.webEnabled} (${((stats.webEnabled/stats.total)*100).toFixed(1)}%)`);
  logger.info(`  Phone-Enabled: ${stats.phoneEnabled} (${((stats.phoneEnabled/stats.total)*100).toFixed(1)}%)`);
  logger.info(`  API-Enabled: ${stats.apiEnabled} (${((stats.apiEnabled/stats.total)*100).toFixed(1)}%)`);
  logger.info(`  Email-Enabled: ${stats.emailEnabled} (${((stats.emailEnabled/stats.total)*100).toFixed(1)}%)`);

  // Example 6: Generate test data for different districts
  logger.info('\n📋 Example 6: Generating test data for different districts');
  const testDistricts = allDistricts.slice(0, 3);
  
  testDistricts.forEach(district => {
    const testData = testSuite.generateTestData();
    logger.info(`${district.name} (${district.state}):`);
    logger.info(`  Address: ${testData.address.street}, ${testData.address.city}, ${testData.address.state} ${testData.address.zipCode}`);
    logger.info(`  Work: ${testData.workType} - ${testData.workDescription.substring(0, 50)}...`);
  });

  // Example 7: Save results to file
  logger.info('\n📋 Example 7: Saving results to file');
  const finalResults = await runner.runFullTestSuite({
    maxDistricts: 3,
    includePuppeteer: true,
    includeApiTests: true,
    outputFile: 'example-results.json'
  });
  
  logger.info(`Results saved to example-results.json`);
  logger.info(`Final summary: ${finalResults.summary.successful}/${finalResults.summary.total} successful`);

  logger.info('\n✅ All examples completed successfully!');
}

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples().catch(error => {
    logger.error('Example script failed:', error);
    process.exit(1);
  });
}

module.exports = { runExamples };