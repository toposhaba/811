const WebformTestSuite = require('./webformTestSuite');
const WebformPuppeteerTest = require('./webformPuppeteerTest');
const { getAllDistricts } = require('../config/districts');

describe('811 Webform Test Suite', () => {
  let testSuite;
  let puppeteerTest;

  beforeAll(() => {
    testSuite = new WebformTestSuite();
    puppeteerTest = new WebformPuppeteerTest();
  });

  describe('District Configuration Tests', () => {
    test('should load all districts from configuration', () => {
      const districts = getAllDistricts();
      expect(districts).toBeDefined();
      expect(Array.isArray(districts)).toBe(true);
      expect(districts.length).toBeGreaterThan(0);
    });

    test('should have required properties for each district', () => {
      const districts = getAllDistricts();
      districts.forEach(district => {
        expect(district).toHaveProperty('id');
        expect(district).toHaveProperty('name');
        expect(district).toHaveProperty('state');
        expect(district).toHaveProperty('country');
        expect(district).toHaveProperty('methods');
        expect(Array.isArray(district.methods)).toBe(true);
      });
    });

    test('should have web portal for districts with web method', () => {
      const districts = getAllDistricts();
      const webDistricts = districts.filter(d => d.methods.includes('web'));
      
      webDistricts.forEach(district => {
        expect(district).toHaveProperty('webPortal');
        expect(district.webPortal).toBeTruthy();
        expect(district.webPortal).toMatch(/^https?:\/\//);
      });
    });
  });

  describe('Test Data Generation', () => {
    test('should generate valid test data', () => {
      const testData = testSuite.generateTestData();
      
      expect(testData).toHaveProperty('contactName');
      expect(testData).toHaveProperty('companyName');
      expect(testData).toHaveProperty('phone');
      expect(testData).toHaveProperty('email');
      expect(testData).toHaveProperty('address');
      expect(testData.address).toHaveProperty('street');
      expect(testData.address).toHaveProperty('city');
      expect(testData.address).toHaveProperty('state');
      expect(testData.address).toHaveProperty('zipCode');
      expect(testData).toHaveProperty('workType');
      expect(testData).toHaveProperty('workDescription');
      expect(testData).toHaveProperty('startDate');
    });

    test('should generate location-appropriate test data', () => {
      const districts = getAllDistricts();
      const testDistrict = districts[0];
      
      const testData = puppeteerTest.generateTestData(testDistrict);
      
      expect(testData.address.state).toBe(testDistrict.state);
      expect(testData.address.country).toBe(testDistrict.country);
      expect(testData.address.zipCode).toBeDefined();
    });
  });

  describe('Webform Puppeteer Tests', () => {
    // These tests require a browser and may take time
    // They're marked as slow tests
    test('should initialize browser successfully', async () => {
      await puppeteerTest.initialize();
      expect(puppeteerTest.browser).toBeDefined();
      await puppeteerTest.cleanup();
    }, 30000);

    test('should test a specific district webform', async () => {
      const districts = getAllDistricts();
      const webDistricts = districts.filter(d => d.methods.includes('web'));
      
      if (webDistricts.length === 0) {
        console.log('No web districts available for testing');
        return;
      }

      await puppeteerTest.initialize();
      
      try {
        const testDistrict = webDistricts[0];
        const result = await puppeteerTest.testWebform(testDistrict);
        
        expect(result).toHaveProperty('districtId');
        expect(result).toHaveProperty('districtName');
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('error');
        expect(result).toHaveProperty('formFields');
        expect(Array.isArray(result.formFields)).toBe(true);
        
        // Should have screenshot path if not skipped
        if (!result.skipped) {
          expect(result).toHaveProperty('screenshotPath');
        }
      } finally {
        await puppeteerTest.cleanup();
      }
    }, 60000);
  });

  describe('Test Suite Results', () => {
    test('should track test results correctly', () => {
      expect(testSuite.results).toHaveProperty('total');
      expect(testSuite.results).toHaveProperty('successful');
      expect(testSuite.results).toHaveProperty('failed');
      expect(testSuite.results).toHaveProperty('skipped');
      expect(testSuite.results).toHaveProperty('errors');
      expect(Array.isArray(testSuite.results.errors)).toBe(true);
    });

    test('should generate recommendations', () => {
      const mockResults = [
        {
          districtName: 'Test District',
          methods: ['web'],
          success: false,
          submissionMethod: 'web',
          responseTime: 15000
        }
      ];

      const recommendations = testSuite.generateRecommendations(mockResults);
      expect(Array.isArray(recommendations)).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    test('should handle delays correctly', async () => {
      const startTime = Date.now();
      await testSuite.delay(100);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeGreaterThanOrEqual(95);
    });

    test('should generate appropriate zip codes for states', () => {
      const testStates = ['TX', 'CA', 'NY', 'FL'];
      
      testStates.forEach(state => {
        const zipCode = puppeteerTest.getTestZipCode(state);
        expect(zipCode).toBeDefined();
        expect(zipCode).toMatch(/^\d{5}$/);
      });
    });
  });

  describe('Form Field Detection', () => {
    test('should have valid field selectors', () => {
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

      Object.entries(fieldSelectors).forEach(([fieldType, selectors]) => {
        expect(Array.isArray(selectors)).toBe(true);
        expect(selectors.length).toBeGreaterThan(0);
        
        selectors.forEach(selector => {
          expect(typeof selector).toBe('string');
          expect(selector.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle missing web portal gracefully', async () => {
      const mockDistrict = {
        id: 'TEST-DISTRICT',
        name: 'Test District',
        state: 'TX',
        country: 'US',
        methods: ['web'],
        webPortal: null
      };

      await puppeteerTest.initialize();
      
      try {
        const result = await puppeteerTest.testWebform(mockDistrict);
        
        expect(result.success).toBe(false);
        expect(result.skipped).toBe(true);
        expect(result.error).toBe('No web portal available');
      } finally {
        await puppeteerTest.cleanup();
      }
    }, 30000);
  });

  describe('Method-specific Tests', () => {
    test('should filter districts by method correctly', () => {
      const districts = getAllDistricts();
      const webDistricts = districts.filter(d => d.methods.includes('web'));
      const phoneDistricts = districts.filter(d => d.methods.includes('phone'));
      
      expect(webDistricts.length).toBeGreaterThan(0);
      expect(phoneDistricts.length).toBeGreaterThan(0);
      
      // All web districts should have web portal
      webDistricts.forEach(district => {
        expect(district.webPortal).toBeDefined();
      });
    });

    test('should identify districts with API support', () => {
      const districts = getAllDistricts();
      const apiDistricts = districts.filter(d => d.apiAvailable === true);
      
      apiDistricts.forEach(district => {
        expect(district.apiAvailable).toBe(true);
      });
    });
  });
});

// Integration test for running a small subset of tests
describe('Integration Tests', () => {
  test('should run tests for a small subset of districts', async () => {
    const districts = getAllDistricts();
    const testDistricts = districts.slice(0, 3); // Test first 3 districts
    
    if (testDistricts.length === 0) {
      console.log('No districts available for testing');
      return;
    }

    const districtIds = testDistricts.map(d => d.id);
    const results = await testSuite.runSpecificTests(districtIds);
    
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeLessThanOrEqual(3);
    
    results.forEach(result => {
      expect(result).toHaveProperty('districtId');
      expect(result).toHaveProperty('districtName');
      expect(result).toHaveProperty('success');
    });
  }, 120000); // 2 minutes timeout for integration test
});