#!/usr/bin/env node

const WebformTestSuite = require('./webformTestSuite');
const WebformPuppeteerTest = require('./webformPuppeteerTest');
const { getAllDistricts } = require('../config/districts');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

class WebformTestRunner {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      summary: {
        total: 0,
        successful: 0,
        failed: 0,
        skipped: 0
      },
      details: [],
      recommendations: []
    };
  }

  async runFullTestSuite(options = {}) {
    const {
      includePuppeteer = true,
      includeApiTests = true,
      maxDistricts = null,
      specificDistricts = null,
      method = null,
      outputFile = null
    } = options;

    logger.info('🚀 Starting 811 Webform Test Suite');
    logger.info('='.repeat(80));

    const districts = getAllDistricts();
    let targetDistricts = districts;

    // Filter districts based on options
    if (specificDistricts) {
      targetDistricts = districts.filter(d => specificDistricts.includes(d.id));
      logger.info(`Testing specific districts: ${specificDistricts.join(', ')}`);
    } else if (method) {
      targetDistricts = districts.filter(d => d.methods.includes(method));
      logger.info(`Testing districts with ${method} method: ${targetDistricts.length} districts`);
    } else if (maxDistricts) {
      targetDistricts = districts.slice(0, maxDistricts);
      logger.info(`Testing first ${maxDistricts} districts`);
    }

    this.results.summary.total = targetDistricts.length;
    logger.info(`Total districts to test: ${targetDistricts.length}`);

    // Run API-based tests
    if (includeApiTests) {
      logger.info('\n📡 Running API-based tests...');
      const apiTestSuite = new WebformTestSuite();
      const apiResults = await apiTestSuite.runSpecificTests(
        targetDistricts.map(d => d.id)
      );
      
      this.results.details.push({
        type: 'api',
        results: apiResults
      });
    }

    // Run Puppeteer-based tests
    if (includePuppeteer) {
      logger.info('\n🌐 Running Puppeteer-based webform tests...');
      const puppeteerTestSuite = new WebformPuppeteerTest();
      const puppeteerResults = await puppeteerTestSuite.runSpecificTests(
        targetDistricts.map(d => d.id)
      );
      
      this.results.details.push({
        type: 'puppeteer',
        results: puppeteerResults
      });
    }

    // Generate summary
    this.generateSummary();
    
    // Generate recommendations
    this.generateRecommendations();

    // Print results
    this.printResults();

    // Save results to file if specified
    if (outputFile) {
      await this.saveResults(outputFile);
    }

    return this.results;
  }

  generateSummary() {
    let totalSuccessful = 0;
    let totalFailed = 0;
    let totalSkipped = 0;

    this.results.details.forEach(detail => {
      detail.results.forEach(result => {
        if (result.success) {
          totalSuccessful++;
        } else if (result.skipped) {
          totalSkipped++;
        } else {
          totalFailed++;
        }
      });
    });

    this.results.summary.successful = totalSuccessful;
    this.results.summary.failed = totalFailed;
    this.results.summary.skipped = totalSkipped;
  }

  generateRecommendations() {
    const recommendations = [];

    // Analyze API test results
    const apiDetails = this.results.details.find(d => d.type === 'api');
    if (apiDetails) {
      const apiFailures = apiDetails.results.filter(r => !r.success && !r.skipped);
      if (apiFailures.length > 0) {
        recommendations.push({
          type: 'api_failures',
          count: apiFailures.length,
          message: `${apiFailures.length} districts failed API-based tests`,
          districts: apiFailures.map(r => r.districtName)
        });
      }
    }

    // Analyze Puppeteer test results
    const puppeteerDetails = this.results.details.find(d => d.type === 'puppeteer');
    if (puppeteerDetails) {
      const puppeteerFailures = puppeteerDetails.results.filter(r => !r.success && !r.skipped);
      if (puppeteerFailures.length > 0) {
        recommendations.push({
          type: 'webform_failures',
          count: puppeteerFailures.length,
          message: `${puppeteerFailures.length} districts failed webform tests`,
          districts: puppeteerFailures.map(r => r.districtName)
        });
      }

      // Check for form field issues
      const formFieldIssues = puppeteerDetails.results.filter(r => 
        r.formFields && r.formFields.length === 0 && !r.skipped
      );
      if (formFieldIssues.length > 0) {
        recommendations.push({
          type: 'form_field_issues',
          count: formFieldIssues.length,
          message: `${formFieldIssues.length} districts have form field detection issues`,
          districts: formFieldIssues.map(r => r.districtName)
        });
      }
    }

    // Performance recommendations
    const allResults = this.results.details.flatMap(d => d.results);
    const slowResponses = allResults.filter(r => r.responseTime && r.responseTime > 10000);
    if (slowResponses.length > 0) {
      recommendations.push({
        type: 'performance_issues',
        count: slowResponses.length,
        message: `${slowResponses.length} districts have response times > 10 seconds`,
        districts: slowResponses.map(r => r.districtName)
      });
    }

    this.results.recommendations = recommendations;
  }

  printResults() {
    logger.info('\n' + '='.repeat(80));
    logger.info('📊 TEST SUITE RESULTS SUMMARY');
    logger.info('='.repeat(80));
    
    logger.info(`Total Districts Tested: ${this.results.summary.total}`);
    logger.info(`Successful Tests: ${this.results.summary.successful}`);
    logger.info(`Failed Tests: ${this.results.summary.failed}`);
    logger.info(`Skipped Tests: ${this.results.summary.skipped}`);
    
    const successRate = this.results.summary.total > 0 
      ? ((this.results.summary.successful / this.results.summary.total) * 100).toFixed(1)
      : 0;
    logger.info(`Success Rate: ${successRate}%`);

    // Method breakdown
    this.results.details.forEach(detail => {
      logger.info(`\n${detail.type.toUpperCase()} TESTS:`);
      const results = detail.results;
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success && !r.skipped).length;
      const skipped = results.filter(r => r.skipped).length;
      
      logger.info(`  Successful: ${successful}`);
      logger.info(`  Failed: ${failed}`);
      logger.info(`  Skipped: ${skipped}`);
      
      if (detail.type === 'puppeteer') {
        const avgResponseTime = results
          .filter(r => r.responseTime)
          .reduce((sum, r) => sum + r.responseTime, 0) / results.filter(r => r.responseTime).length;
        if (!isNaN(avgResponseTime)) {
          logger.info(`  Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
        }
      }
    });

    // Recommendations
    if (this.results.recommendations.length > 0) {
      logger.info('\n🔧 RECOMMENDATIONS:');
      this.results.recommendations.forEach(rec => {
        logger.info(`  - ${rec.message}`);
        if (rec.districts && rec.districts.length > 0) {
          logger.info(`    Affected districts: ${rec.districts.join(', ')}`);
        }
      });
    }

    logger.info('\n' + '='.repeat(80));
  }

  async saveResults(outputFile) {
    try {
      const outputPath = path.resolve(outputFile);
      await fs.writeFile(outputPath, JSON.stringify(this.results, null, 2));
      logger.info(`Results saved to: ${outputPath}`);
    } catch (error) {
      logger.error('Failed to save results:', error);
    }
  }

  async runQuickTest() {
    logger.info('🚀 Running Quick Test (first 5 districts)...');
    return this.runFullTestSuite({
      maxDistricts: 5,
      includePuppeteer: true,
      includeApiTests: true
    });
  }

  async runWebformOnlyTest() {
    logger.info('🌐 Running Webform-Only Test...');
    return this.runFullTestSuite({
      includePuppeteer: true,
      includeApiTests: false
    });
  }

  async runApiOnlyTest() {
    logger.info('📡 Running API-Only Test...');
    return this.runFullTestSuite({
      includePuppeteer: false,
      includeApiTests: true
    });
  }
}

// CLI usage
if (require.main === module) {
  const runner = new WebformTestRunner();
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  const options = {
    includePuppeteer: !args.includes('--no-puppeteer'),
    includeApiTests: !args.includes('--no-api'),
    maxDistricts: args.includes('--max') ? parseInt(args[args.indexOf('--max') + 1]) : null,
    specificDistricts: args.includes('--districts') ? args.slice(args.indexOf('--districts') + 1) : null,
    method: args.includes('--method') ? args[args.indexOf('--method') + 1] : null,
    outputFile: args.includes('--output') ? args[args.indexOf('--output') + 1] : null
  };

  const runTest = async () => {
    try {
      switch (command) {
        case 'quick':
          await runner.runQuickTest();
          break;
        case 'webform':
          await runner.runWebformOnlyTest();
          break;
        case 'api':
          await runner.runApiOnlyTest();
          break;
        case 'full':
        default:
          await runner.runFullTestSuite(options);
          break;
      }
      
      process.exit(0);
    } catch (error) {
      logger.error('Test suite failed:', error);
      process.exit(1);
    }
  };

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
811 Webform Test Suite Runner

Usage:
  node runWebformTests.js [command] [options]

Commands:
  quick     Run quick test (first 5 districts)
  webform   Run webform-only tests
  api       Run API-only tests
  full      Run full test suite (default)

Options:
  --districts <ids>     Test specific districts (comma-separated)
  --method <method>     Test districts with specific method (web, phone, api)
  --max <number>        Limit number of districts to test
  --no-puppeteer        Skip Puppeteer-based tests
  --no-api              Skip API-based tests
  --output <file>       Save results to JSON file
  --help, -h            Show this help

Examples:
  node runWebformTests.js quick
  node runWebformTests.js --districts AL811 TX-LONESTAR
  node runWebformTests.js --method web --max 10
  node runWebformTests.js full --output results.json
    `);
  } else {
    runTest();
  }
}

module.exports = WebformTestRunner;