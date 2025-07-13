const axios = require('axios');
const { getAllDistricts } = require('../config/districts');
const { createRequest, getRequestById } = require('../services/database/requestService');
const { submit811Request } = require('../services/submission/submissionOrchestrator');
const logger = require('../utils/logger');

class WebformTestSuite {
  constructor() {
    this.results = {
      total: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };
    this.testData = this.generateTestData();
  }

  generateTestData() {
    return {
      contactName: 'Test User',
      companyName: 'Test Construction Co.',
      phone: '+1-555-123-4567',
      email: 'test@example.com',
      address: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'TX',
        zipCode: '78701',
        country: 'US'
      },
      workType: 'excavation',
      workDescription: 'Test excavation for utility installation. Depth: 3 feet.',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 2,
      depth: 3,
      workArea: {
        length: 20,
        width: 2,
        nearestCrossStreet: 'Test Cross Street',
        markedArea: true,
        markingInstructions: 'White paint marks along proposed route'
      },
      explosivesUsed: false,
      emergencyWork: false,
      permitNumber: 'TEST-2024-001'
    };
  }

  async testDistrict(district) {
    const result = {
      districtId: district.id,
      districtName: district.name,
      state: district.state,
      country: district.country,
      methods: district.methods,
      success: false,
      error: null,
      submissionMethod: null,
      responseTime: null,
      ticketNumber: null
    };

    try {
      logger.info(`Testing district: ${district.name} (${district.id})`);
      
      // Create test request
      const request = await createRequest({
        ...this.testData,
        districtId: district.id,
        districtName: district.name
      });

      const startTime = Date.now();
      
      // Submit request to district
      const submissionResult = await submit811Request(request, district);
      
      result.responseTime = Date.now() - startTime;
      result.submissionMethod = submissionResult.method;
      result.ticketNumber = submissionResult.ticketNumber;
      result.success = submissionResult.success;
      
      if (submissionResult.error) {
        result.error = submissionResult.error;
      }

      logger.info(`✓ ${district.name}: ${result.success ? 'SUCCESS' : 'FAILED'}`);
      
    } catch (error) {
      result.error = error.message;
      logger.error(`✗ ${district.name}: ${error.message}`);
    }

    return result;
  }

  async runTests() {
    const districts = getAllDistricts();
    this.results.total = districts.length;
    
    logger.info(`Starting webform test suite for ${districts.length} districts...`);
    logger.info('='.repeat(80));

    const results = [];
    
    for (const district of districts) {
      const result = await this.testDistrict(district);
      results.push(result);
      
      // Update summary
      if (result.success) {
        this.results.successful++;
      } else if (result.error && result.error.includes('skipped')) {
        this.results.skipped++;
      } else {
        this.results.failed++;
        this.results.errors.push({
          district: district.name,
          error: result.error
        });
      }
      
      // Add delay between tests to avoid overwhelming servers
      await this.delay(1000);
    }

    this.printResults(results);
    return results;
  }

  async runSpecificTests(districtIds) {
    const districts = getAllDistricts();
    const targetDistricts = districts.filter(d => districtIds.includes(d.id));
    
    logger.info(`Running tests for specific districts: ${districtIds.join(', ')}`);
    logger.info('='.repeat(80));

    const results = [];
    
    for (const district of targetDistricts) {
      const result = await this.testDistrict(district);
      results.push(result);
      await this.delay(1000);
    }

    this.printResults(results);
    return results;
  }

  async runMethodTests(method = 'web') {
    const districts = getAllDistricts();
    const targetDistricts = districts.filter(d => d.methods.includes(method));
    
    logger.info(`Running ${method} method tests for ${targetDistricts.length} districts`);
    logger.info('='.repeat(80));

    const results = [];
    
    for (const district of targetDistricts) {
      const result = await this.testDistrict(district);
      results.push(result);
      await this.delay(1000);
    }

    this.printResults(results);
    return results;
  }

  printResults(results) {
    logger.info('\n' + '='.repeat(80));
    logger.info('TEST RESULTS SUMMARY');
    logger.info('='.repeat(80));
    
    logger.info(`Total Districts Tested: ${this.results.total}`);
    logger.info(`Successful Submissions: ${this.results.successful}`);
    logger.info(`Failed Submissions: ${this.results.failed}`);
    logger.info(`Skipped Tests: ${this.results.skipped}`);
    logger.info(`Success Rate: ${((this.results.successful / this.results.total) * 100).toFixed(1)}%`);
    
    if (this.results.errors.length > 0) {
      logger.info('\nFAILED DISTRICTS:');
      this.results.errors.forEach(error => {
        logger.info(`  - ${error.district}: ${error.error}`);
      });
    }

    // Group results by method
    const methodStats = {};
    results.forEach(result => {
      const method = result.submissionMethod || 'unknown';
      if (!methodStats[method]) {
        methodStats[method] = { total: 0, success: 0, failed: 0 };
      }
      methodStats[method].total++;
      if (result.success) {
        methodStats[method].success++;
      } else {
        methodStats[method].failed++;
      }
    });

    logger.info('\nMETHOD BREAKDOWN:');
    Object.entries(methodStats).forEach(([method, stats]) => {
      const successRate = ((stats.success / stats.total) * 100).toFixed(1);
      logger.info(`  ${method.toUpperCase()}: ${stats.success}/${stats.total} (${successRate}%)`);
    });

    // Performance analysis
    const responseTimes = results.filter(r => r.responseTime).map(r => r.responseTime);
    if (responseTimes.length > 0) {
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const minResponseTime = Math.min(...responseTimes);
      const maxResponseTime = Math.max(...responseTimes);
      
      logger.info('\nPERFORMANCE:');
      logger.info(`  Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
      logger.info(`  Min Response Time: ${minResponseTime}ms`);
      logger.info(`  Max Response Time: ${maxResponseTime}ms`);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generate detailed report
  generateReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.results,
      details: results,
      recommendations: this.generateRecommendations(results)
    };

    return report;
  }

  generateRecommendations(results) {
    const recommendations = [];
    
    // Check for common failure patterns
    const webFormFailures = results.filter(r => 
      r.methods.includes('web') && !r.success && r.submissionMethod === 'web'
    );
    
    if (webFormFailures.length > 0) {
      recommendations.push({
        type: 'web_form_issues',
        count: webFormFailures.length,
        message: `${webFormFailures.length} districts have web form submission issues`,
        districts: webFormFailures.map(r => r.districtName)
      });
    }

    // Check for districts with no web forms
    const noWebForm = results.filter(r => !r.methods.includes('web'));
    if (noWebForm.length > 0) {
      recommendations.push({
        type: 'no_web_form',
        count: noWebForm.length,
        message: `${noWebForm.length} districts don't support web forms`,
        districts: noWebForm.map(r => r.districtName)
      });
    }

    // Check for slow response times
    const slowResponses = results.filter(r => r.responseTime && r.responseTime > 10000);
    if (slowResponses.length > 0) {
      recommendations.push({
        type: 'slow_response',
        count: slowResponses.length,
        message: `${slowResponses.length} districts have response times > 10 seconds`,
        districts: slowResponses.map(r => r.districtName)
      });
    }

    return recommendations;
  }
}

// Export for use in other test files
module.exports = WebformTestSuite;

// CLI usage
if (require.main === module) {
  const testSuite = new WebformTestSuite();
  
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Run all tests
    testSuite.runTests().then(results => {
      const report = testSuite.generateReport(results);
      console.log(JSON.stringify(report, null, 2));
      process.exit(testSuite.results.failed > 0 ? 1 : 0);
    });
  } else if (args[0] === '--method') {
    // Run tests for specific method
    const method = args[1] || 'web';
    testSuite.runMethodTests(method).then(results => {
      const report = testSuite.generateReport(results);
      console.log(JSON.stringify(report, null, 2));
      process.exit(testSuite.results.failed > 0 ? 1 : 0);
    });
  } else if (args[0] === '--districts') {
    // Run tests for specific districts
    const districtIds = args.slice(1);
    testSuite.runSpecificTests(districtIds).then(results => {
      const report = testSuite.generateReport(results);
      console.log(JSON.stringify(report, null, 2));
      process.exit(testSuite.results.failed > 0 ? 1 : 0);
    });
  } else {
    console.log('Usage:');
    console.log('  node webformTestSuite.js                    # Run all tests');
    console.log('  node webformTestSuite.js --method web      # Test web forms only');
    console.log('  node webformTestSuite.js --districts AL811 TX-LONESTAR  # Test specific districts');
  }
}