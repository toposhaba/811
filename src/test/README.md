# 811 Webform Test Suite

This test suite is designed to test all 811 webforms across the United States and Canada to verify that they can be submitted successfully. The suite includes both API-based tests and Puppeteer-based webform automation tests.

## Overview

The test suite covers approximately 50+ 811 districts across the US and Canada, testing their webform submission capabilities through multiple methods:

- **API Tests**: Tests the internal API submission logic
- **Puppeteer Tests**: Automated browser testing of actual web forms
- **Form Field Detection**: Identifies and maps form fields across different districts
- **Performance Monitoring**: Tracks response times and success rates

## Test Components

### 1. WebformTestSuite (`webformTestSuite.js`)
General-purpose test suite that tests the API submission logic for all districts.

### 2. WebformPuppeteerTest (`webformPuppeteerTest.js`)
Specialized test suite that uses Puppeteer to automate browser testing of actual web forms.

### 3. Test Runner (`runWebformTests.js`)
Comprehensive test runner that can execute various test scenarios with detailed reporting.

### 4. Jest Tests (`webformTestSuite.test.js`)
Unit and integration tests that can be run with `npm test`.

## Quick Start

### Run All Tests
```bash
# Run the full test suite
node src/test/runWebformTests.js

# Run a quick test (first 5 districts)
node src/test/runWebformTests.js quick

# Run webform-only tests
node src/test/runWebformTests.js webform

# Run API-only tests
node src/test/runWebformTests.js api
```

### Test Specific Districts
```bash
# Test specific districts
node src/test/runWebformTests.js --districts AL811 TX-LONESTAR

# Test districts with web forms only
node src/test/runWebformTests.js --method web

# Limit number of districts to test
node src/test/runWebformTests.js --max 10
```

### Save Results
```bash
# Save results to JSON file
node src/test/runWebformTests.js --output results.json

# Run quick test and save results
node src/test/runWebformTests.js quick --output quick-results.json
```

## Individual Test Files

### Run Specific Test Files
```bash
# Run general test suite
node src/test/webformTestSuite.js

# Run Puppeteer tests only
node src/test/webformPuppeteerTest.js

# Test specific districts with Puppeteer
node src/test/webformPuppeteerTest.js --districts AL811 TX-LONESTAR
```

### Run Jest Tests
```bash
# Run all Jest tests
npm test

# Run specific test file
npm test -- src/test/webformTestSuite.test.js
```

## Test Data

The test suite generates appropriate test data for each district:

- **Contact Information**: Test user with valid phone and email
- **Address**: Location-appropriate addresses with correct state/zip codes
- **Work Details**: Standard excavation work with safety information
- **Dates**: Future dates (7+ days from test date)

## Screenshots and Debugging

The Puppeteer tests automatically capture screenshots for debugging:

- **Initial Screenshots**: `screenshots/{district_id}_initial.png`
- **Filled Form Screenshots**: `screenshots/{district_id}_filled.png`
- **Final Screenshots**: `screenshots/{district_id}_final.png`
- **Error Screenshots**: `screenshots/{district_id}_error.png`

## Test Results

### Summary Metrics
- **Total Districts Tested**: Number of districts in test run
- **Successful Submissions**: Districts where submission succeeded
- **Failed Submissions**: Districts where submission failed
- **Skipped Tests**: Districts that couldn't be tested (e.g., no web portal)
- **Success Rate**: Percentage of successful submissions

### Method Breakdown
- **API Tests**: Tests using internal API submission logic
- **Puppeteer Tests**: Tests using automated browser automation
- **Performance Metrics**: Average response times and performance analysis

### Recommendations
The test suite automatically generates recommendations based on test results:

- **Web Form Issues**: Districts with webform submission problems
- **Form Field Issues**: Districts where form field detection failed
- **Performance Issues**: Districts with slow response times
- **API Failures**: Districts with API submission issues

## Configuration

### District Configuration
Districts are configured in `src/config/districts.js` with the following properties:

```javascript
{
  id: 'AL811',
  name: 'Alabama 811',
  state: 'AL',
  country: 'US',
  methods: ['phone', 'web'],
  webPortal: 'https://al811.com',
  apiAvailable: false,
  emailAvailable: false
}
```

### Test Configuration
You can modify test behavior by editing the test files:

- **Delays**: Adjust delays between tests to avoid overwhelming servers
- **Timeouts**: Modify timeout values for slow-loading sites
- **Field Selectors**: Update form field detection patterns
- **Test Data**: Customize test data generation

## Troubleshooting

### Common Issues

1. **Browser Launch Failures**
   - Ensure Puppeteer is properly installed
   - Check system dependencies for Chrome/Chromium
   - Try running with `--no-sandbox` flag

2. **Form Detection Issues**
   - Review screenshots to see what the form looks like
   - Update field selectors in `findFormElements()` method
   - Check for dynamic content loading

3. **Timeout Issues**
   - Increase timeout values for slow-loading sites
   - Add longer delays between tests
   - Check network connectivity

4. **Rate Limiting**
   - Increase delays between tests
   - Run tests in smaller batches
   - Use different IP addresses if needed

### Debug Mode
To run tests with more verbose output:

```bash
# Enable debug logging
DEBUG=* node src/test/runWebformTests.js

# Run with headful browser (see what's happening)
# Edit webformPuppeteerTest.js and change headless: false
```

## Performance Considerations

### Test Execution Time
- **Full Suite**: ~2-4 hours for all districts
- **Quick Test**: ~10-15 minutes for 5 districts
- **Webform Only**: ~1-2 hours for web-enabled districts

### Resource Usage
- **Memory**: ~200-500MB per browser instance
- **CPU**: Moderate usage during form automation
- **Network**: Varies based on site complexity

### Optimization Tips
- Run tests during off-peak hours
- Use smaller batches for large test runs
- Monitor system resources during execution
- Consider running tests in parallel (with caution)

## Contributing

### Adding New Districts
1. Add district configuration to `src/config/districts.js`
2. Test the district manually first
3. Run the test suite to verify it works
4. Update documentation if needed

### Improving Form Detection
1. Analyze screenshots of failed tests
2. Identify new field patterns
3. Add new selectors to `findFormElements()`
4. Test with affected districts

### Reporting Issues
When reporting issues, please include:
- District ID and name
- Screenshots from the test run
- Error messages and stack traces
- Steps to reproduce the issue

## License

This test suite is part of the 811 Integration API project. All rights reserved.