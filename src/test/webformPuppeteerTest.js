const puppeteer = require('puppeteer');
const { getAllDistricts } = require('../config/districts');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

class WebformPuppeteerTest {
  constructor() {
    this.browser = null;
    this.results = {
      total: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };
    this.screenshotsDir = path.join(__dirname, '../../screenshots');
  }

  async initialize() {
    try {
      // Create screenshots directory if it doesn't exist
      await fs.mkdir(this.screenshotsDir, { recursive: true });
      
      // Launch browser
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      
      logger.info('Browser initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize browser:', error);
      throw error;
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      logger.info('Browser closed');
    }
  }

  generateTestData(district) {
    // Generate location-appropriate test data based on district
    const testData = {
      contactName: 'Test User',
      companyName: 'Test Construction Co.',
      phone: '+1-555-123-4567',
      email: 'test@example.com',
      address: {
        street: '123 Test Street',
        city: 'Test City',
        state: district.state,
        zipCode: this.getTestZipCode(district.state),
        country: district.country
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

    return testData;
  }

  getTestZipCode(state) {
    // Return appropriate test zip codes for each state
    const zipCodes = {
      'AL': '35201', 'AK': '99501', 'AZ': '85001', 'AR': '72201',
      'CA': '90210', 'CO': '80201', 'CT': '06101', 'DE': '19901',
      'FL': '33101', 'GA': '30301', 'HI': '96801', 'ID': '83701',
      'IL': '60601', 'IN': '46201', 'IA': '50301', 'KS': '66101',
      'KY': '40201', 'LA': '70101', 'ME': '04101', 'MD': '21201',
      'MA': '02101', 'MI': '48201', 'MN': '55401', 'MS': '39201',
      'MO': '63101', 'MT': '59101', 'NE': '68101', 'NV': '89101',
      'NH': '03101', 'NJ': '07101', 'NM': '87101', 'NY': '10001',
      'NC': '27601', 'ND': '58101', 'OH': '43201', 'OK': '73101',
      'OR': '97201', 'PA': '19101', 'RI': '02901', 'SC': '29201',
      'SD': '57101', 'TN': '37201', 'TX': '78701', 'UT': '84101',
      'VT': '05401', 'VA': '23201', 'WA': '98101', 'WV': '25301',
      'WI': '53201', 'WY': '82001'
    };
    return zipCodes[state] || '12345';
  }

  async testWebform(district) {
    const result = {
      districtId: district.id,
      districtName: district.name,
      state: district.state,
      country: district.country,
      webPortal: district.webPortal,
      success: false,
      error: null,
      screenshotPath: null,
      responseTime: null,
      ticketNumber: null,
      formFields: []
    };

    if (!district.webPortal) {
      result.error = 'No web portal available';
      result.skipped = true;
      return result;
    }

    const page = await this.browser.newPage();
    
    try {
      logger.info(`Testing webform for: ${district.name} (${district.webPortal})`);
      
      // Set viewport
      await page.setViewport({ width: 1280, height: 720 });
      
      // Set user agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      const startTime = Date.now();
      
      // Navigate to the web portal
      await page.goto(district.webPortal, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // Take initial screenshot
      const screenshotPath = path.join(this.screenshotsDir, `${district.id}_initial.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      result.screenshotPath = screenshotPath;
      
      // Look for common form elements
      const formElements = await this.findFormElements(page);
      result.formFields = formElements;
      
      // Try to fill the form if we found relevant fields
      if (formElements.length > 0) {
        const testData = this.generateTestData(district);
        await this.fillForm(page, formElements, testData);
        
        // Take screenshot after form filling
        const filledScreenshotPath = path.join(this.screenshotsDir, `${district.id}_filled.png`);
        await page.screenshot({ path: filledScreenshotPath, fullPage: true });
        
        // Try to submit the form
        const submissionResult = await this.submitForm(page, district);
        result.success = submissionResult.success;
        result.ticketNumber = submissionResult.ticketNumber;
        result.error = submissionResult.error;
        
        // Take final screenshot
        const finalScreenshotPath = path.join(this.screenshotsDir, `${district.id}_final.png`);
        await page.screenshot({ path: finalScreenshotPath, fullPage: true });
      } else {
        result.error = 'No form elements found';
      }
      
      result.responseTime = Date.now() - startTime;
      
      logger.info(`✓ ${district.name}: ${result.success ? 'SUCCESS' : 'FAILED'}`);
      
    } catch (error) {
      result.error = error.message;
      logger.error(`✗ ${district.name}: ${error.message}`);
      
      // Take error screenshot
      const errorScreenshotPath = path.join(this.screenshotsDir, `${district.id}_error.png`);
      await page.screenshot({ path: errorScreenshotPath, fullPage: true });
    } finally {
      await page.close();
    }

    return result;
  }

  async findFormElements(page) {
    const formElements = [];
    
    // Common field selectors
    const fieldSelectors = {
      name: ['input[name*="name" i]', 'input[id*="name" i]', 'input[placeholder*="name" i]'],
      company: ['input[name*="company" i]', 'input[id*="company" i]', 'input[placeholder*="company" i]'],
      phone: ['input[name*="phone" i]', 'input[id*="phone" i]', 'input[type="tel"]'],
      email: ['input[name*="email" i]', 'input[id*="email" i]', 'input[type="email"]'],
      address: ['input[name*="address" i]', 'input[id*="address" i]', 'textarea[name*="address" i]'],
      city: ['input[name*="city" i]', 'input[id*="city" i]'],
      state: ['select[name*="state" i]', 'input[name*="state" i]'],
      zip: ['input[name*="zip" i]', 'input[name*="postal" i]', 'input[id*="zip" i]'],
      workType: ['select[name*="work" i]', 'input[name*="work" i]', 'textarea[name*="work" i]'],
      description: ['textarea[name*="description" i]', 'textarea[id*="description" i]'],
      startDate: ['input[name*="date" i]', 'input[type="date"]', 'input[id*="date" i]']
    };

    for (const [fieldType, selectors] of Object.entries(fieldSelectors)) {
      for (const selector of selectors) {
        try {
          const elements = await page.$$(selector);
          if (elements.length > 0) {
            formElements.push({
              type: fieldType,
              selector: selector,
              count: elements.length
            });
            break; // Found at least one element for this field type
          }
        } catch (error) {
          // Continue to next selector
        }
      }
    }

    return formElements;
  }

  async fillForm(page, formElements, testData) {
    for (const element of formElements) {
      try {
        switch (element.type) {
          case 'name':
            await page.type(element.selector, testData.contactName);
            break;
          case 'company':
            await page.type(element.selector, testData.companyName);
            break;
          case 'phone':
            await page.type(element.selector, testData.phone);
            break;
          case 'email':
            await page.type(element.selector, testData.email);
            break;
          case 'address':
            await page.type(element.selector, testData.address.street);
            break;
          case 'city':
            await page.type(element.selector, testData.address.city);
            break;
          case 'state':
            // Try to select the state from dropdown
            try {
              await page.select(element.selector, testData.address.state);
            } catch {
              // If dropdown selection fails, try typing
              await page.type(element.selector, testData.address.state);
            }
            break;
          case 'zip':
            await page.type(element.selector, testData.address.zipCode);
            break;
          case 'workType':
            await page.type(element.selector, testData.workType);
            break;
          case 'description':
            await page.type(element.selector, testData.workDescription);
            break;
          case 'startDate':
            await page.type(element.selector, testData.startDate.split('T')[0]);
            break;
        }
        
        // Small delay between fields
        await page.waitForTimeout(100);
      } catch (error) {
        logger.warn(`Failed to fill field ${element.type}: ${error.message}`);
      }
    }
  }

  async submitForm(page, district) {
    const result = {
      success: false,
      ticketNumber: null,
      error: null
    };

    try {
      // Look for submit buttons
      const submitSelectors = [
        'input[type="submit"]',
        'button[type="submit"]',
        'button:contains("Submit")',
        'button:contains("Send")',
        'input[value*="submit" i]',
        'button:contains("Request")',
        'a:contains("Submit")'
      ];

      let submitButton = null;
      for (const selector of submitSelectors) {
        try {
          submitButton = await page.$(selector);
          if (submitButton) break;
        } catch (error) {
          // Continue to next selector
        }
      }

      if (submitButton) {
        // Click submit button
        await submitButton.click();
        
        // Wait for response
        await page.waitForTimeout(3000);
        
        // Check for success indicators
        const successIndicators = [
          'text="success"',
          'text="submitted"',
          'text="ticket"',
          'text="confirmation"',
          'text="thank you"'
        ];

        const pageContent = await page.content();
        const hasSuccessIndicator = successIndicators.some(indicator => 
          pageContent.toLowerCase().includes(indicator.toLowerCase())
        );

        if (hasSuccessIndicator) {
          result.success = true;
          
          // Try to extract ticket number
          const ticketMatch = pageContent.match(/(?:ticket|request|number)[\s:]*([A-Z0-9-]+)/i);
          if (ticketMatch) {
            result.ticketNumber = ticketMatch[1];
          }
        } else {
          result.error = 'No success indicators found after submission';
        }
      } else {
        result.error = 'No submit button found';
      }
    } catch (error) {
      result.error = error.message;
    }

    return result;
  }

  async runTests() {
    const districts = getAllDistricts();
    const webFormDistricts = districts.filter(d => d.methods.includes('web'));
    
    this.results.total = webFormDistricts.length;
    
    logger.info(`Starting webform Puppeteer test suite for ${webFormDistricts.length} districts...`);
    logger.info('='.repeat(80));

    await this.initialize();
    
    const results = [];
    
    try {
      for (const district of webFormDistricts) {
        const result = await this.testWebform(district);
        results.push(result);
        
        // Update summary
        if (result.success) {
          this.results.successful++;
        } else if (result.skipped) {
          this.results.skipped++;
        } else {
          this.results.failed++;
          this.results.errors.push({
            district: district.name,
            error: result.error
          });
        }
        
        // Add delay between tests
        await this.delay(2000);
      }
    } finally {
      await this.cleanup();
    }

    this.printResults(results);
    return results;
  }

  async runSpecificTests(districtIds) {
    const districts = getAllDistricts();
    const targetDistricts = districts.filter(d => 
      districtIds.includes(d.id) && d.methods.includes('web')
    );
    
    logger.info(`Running webform tests for specific districts: ${districtIds.join(', ')}`);
    logger.info('='.repeat(80));

    await this.initialize();
    
    const results = [];
    
    try {
      for (const district of targetDistricts) {
        const result = await this.testWebform(district);
        results.push(result);
        await this.delay(2000);
      }
    } finally {
      await this.cleanup();
    }

    this.printResults(results);
    return results;
  }

  printResults(results) {
    logger.info('\n' + '='.repeat(80));
    logger.info('WEBFORM TEST RESULTS SUMMARY');
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

    // Form field analysis
    const fieldStats = {};
    results.forEach(result => {
      result.formFields.forEach(field => {
        if (!fieldStats[field.type]) {
          fieldStats[field.type] = 0;
        }
        fieldStats[field.type]++;
      });
    });

    logger.info('\nFORM FIELD ANALYSIS:');
    Object.entries(fieldStats).forEach(([fieldType, count]) => {
      const percentage = ((count / this.results.total) * 100).toFixed(1);
      logger.info(`  ${fieldType}: ${count} districts (${percentage}%)`);
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

    logger.info(`\nScreenshots saved to: ${this.screenshotsDir}`);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export for use in other test files
module.exports = WebformPuppeteerTest;

// CLI usage
if (require.main === module) {
  const testSuite = new WebformPuppeteerTest();
  
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Run all webform tests
    testSuite.runTests().then(results => {
      process.exit(testSuite.results.failed > 0 ? 1 : 0);
    }).catch(error => {
      logger.error('Test suite failed:', error);
      process.exit(1);
    });
  } else if (args[0] === '--districts') {
    // Run tests for specific districts
    const districtIds = args.slice(1);
    testSuite.runSpecificTests(districtIds).then(results => {
      process.exit(testSuite.results.failed > 0 ? 1 : 0);
    }).catch(error => {
      logger.error('Test suite failed:', error);
      process.exit(1);
    });
  } else {
    console.log('Usage:');
    console.log('  node webformPuppeteerTest.js                    # Run all webform tests');
    console.log('  node webformPuppeteerTest.js --districts AL811 TX-LONESTAR  # Test specific districts');
  }
}