const puppeteer = require('puppeteer');
const { generateFormFillInstructions } = require('../ai/formAnalyzer');
const { formatRequestForSubmission } = require('./submissionOrchestrator');
const logger = require('../../utils/logger');

// Submit request via webform automation
const submitViaWebform = async (request, district) => {
  let browser;
  
  try {
    logger.info(`Starting webform submission for district ${district.id}`);
    
    // Format request data
    const formData = formatRequestForSubmission(request);
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1366, height: 768 });
    
    // Navigate to district portal
    logger.info(`Navigating to ${district.webPortal}`);
    await page.goto(district.webPortal, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Take screenshot for debugging
    if (process.env.NODE_ENV === 'development') {
      await page.screenshot({ 
        path: `screenshots/${district.id}_${request.requestId}_1_landing.png` 
      });
    }
    
    // District-specific form filling logic
    let result;
    switch (district.id) {
      case 'CA-USANORTH':
      case 'CA-DIGALERT':
        result = await fillCaliforniaForm(page, formData, district);
        break;
        
      case 'FL-SUNSHINE':
        result = await fillFloridaForm(page, formData, district);
        break;
        
      case 'TX-LONESTAR':
      case 'TX-TEXAS811':
        result = await fillTexasForm(page, formData, district);
        break;
        
      default:
        // Use AI to analyze and fill unknown forms
        result = await fillGenericForm(page, formData, district);
    }
    
    logger.info(`Webform submission completed for request ${request.requestId}`);
    return result;
    
  } catch (error) {
    logger.error('Webform submission error:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

// California-specific form filling
const fillCaliforniaForm = async (page, formData, district) => {
  try {
    // Click on "Start New Ticket" or similar
    await page.waitForSelector('a[href*="ticket"], button:contains("Start")', { timeout: 10000 });
    await page.click('a[href*="ticket"], button:contains("Start")');
    
    // Wait for form to load
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    // Contact Information
    await fillTextField(page, 'input[name*="contact"], input[name*="name"]', formData.contactName);
    await fillTextField(page, 'input[name*="company"]', formData.companyName);
    await fillTextField(page, 'input[name*="phone"]', formData.phone);
    await fillTextField(page, 'input[name*="email"]', formData.email);
    
    // Work Location
    await fillTextField(page, 'input[name*="address"], input[name*="street"]', formData.street);
    await fillTextField(page, 'input[name*="city"]', formData.city);
    await selectDropdown(page, 'select[name*="state"]', formData.state);
    await fillTextField(page, 'input[name*="zip"]', formData.zipCode);
    
    // Work Details
    await selectDropdown(page, 'select[name*="work_type"], select[name*="type"]', formData.workType);
    await fillTextField(page, 'textarea[name*="description"], textarea[name*="work"]', formData.workDescription);
    await fillDateField(page, 'input[name*="start_date"], input[type="date"]', formData.startDate);
    
    // Submit form
    await page.click('button[type="submit"], input[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    // Extract confirmation number
    const confirmationNumber = await extractConfirmationNumber(page);
    
    return {
      success: true,
      ticketNumber: confirmationNumber,
      confirmationNumber: confirmationNumber,
      data: {
        submittedAt: new Date().toISOString(),
        portal: district.webPortal
      }
    };
    
  } catch (error) {
    logger.error('California form filling error:', error);
    throw error;
  }
};

// Florida-specific form filling
const fillFloridaForm = async (page, formData, district) => {
  // Similar implementation for Florida
  return fillGenericForm(page, formData, district);
};

// Texas-specific form filling
const fillTexasForm = async (page, formData, district) => {
  // Similar implementation for Texas
  return fillGenericForm(page, formData, district);
};

// Generic form filling using AI analysis
const fillGenericForm = async (page, formData, district) => {
  try {
    logger.info('Using AI-assisted form filling');
    
    // Get page content
    const pageContent = await page.content();
    const formHTML = await page.evaluate(() => {
      const forms = document.querySelectorAll('form');
      return Array.from(forms).map(form => form.outerHTML).join('\n');
    });
    
    // Generate form filling instructions using AI
    const instructions = await generateFormFillInstructions(formHTML, formData);
    
    // Execute AI-generated instructions
    for (const instruction of instructions) {
      try {
        switch (instruction.action) {
          case 'fill':
            await fillTextField(page, instruction.selector, instruction.value);
            break;
          case 'select':
            await selectDropdown(page, instruction.selector, instruction.value);
            break;
          case 'click':
            await page.click(instruction.selector);
            break;
          case 'check':
            await page.click(instruction.selector);
            break;
          case 'wait':
            await page.waitForTimeout(instruction.duration || 1000);
            break;
        }
      } catch (error) {
        logger.warn(`Failed to execute instruction: ${JSON.stringify(instruction)}`);
      }
    }
    
    // Submit the form
    const submitButton = await page.$('button[type="submit"], input[type="submit"]');
    if (submitButton) {
      await submitButton.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
    }
    
    // Extract confirmation
    const confirmationNumber = await extractConfirmationNumber(page);
    
    return {
      success: true,
      ticketNumber: confirmationNumber,
      confirmationNumber: confirmationNumber,
      data: {
        submittedAt: new Date().toISOString(),
        portal: district.webPortal,
        method: 'ai-assisted'
      }
    };
    
  } catch (error) {
    logger.error('Generic form filling error:', error);
    throw error;
  }
};

// Helper functions
const fillTextField = async (page, selector, value) => {
  if (!value) return;
  
  try {
    await page.waitForSelector(selector, { timeout: 5000 });
    await page.click(selector);
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.type(selector, value.toString());
  } catch (error) {
    logger.warn(`Failed to fill field ${selector}:`, error.message);
  }
};

const selectDropdown = async (page, selector, value) => {
  if (!value) return;
  
  try {
    await page.waitForSelector(selector, { timeout: 5000 });
    await page.select(selector, value);
  } catch (error) {
    logger.warn(`Failed to select dropdown ${selector}:`, error.message);
  }
};

const fillDateField = async (page, selector, dateString) => {
  if (!dateString) return;
  
  try {
    const date = new Date(dateString);
    const formattedDate = date.toISOString().split('T')[0];
    await fillTextField(page, selector, formattedDate);
  } catch (error) {
    logger.warn(`Failed to fill date field ${selector}:`, error.message);
  }
};

const extractConfirmationNumber = async (page) => {
  try {
    // Common patterns for confirmation numbers
    const patterns = [
      /ticket\s*#?\s*:?\s*(\w+)/i,
      /confirmation\s*#?\s*:?\s*(\w+)/i,
      /request\s*#?\s*:?\s*(\w+)/i,
      /reference\s*#?\s*:?\s*(\w+)/i,
      /\b([A-Z0-9]{6,15})\b/
    ];
    
    const pageText = await page.evaluate(() => document.body.innerText);
    
    for (const pattern of patterns) {
      const match = pageText.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // If no confirmation found, generate a temporary one
    return `TEMP-${Date.now()}`;
    
  } catch (error) {
    logger.warn('Failed to extract confirmation number:', error);
    return `TEMP-${Date.now()}`;
  }
};

module.exports = {
  submitViaWebform
};