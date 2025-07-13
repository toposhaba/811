const puppeteer = require('puppeteer');
const logger = require('../../utils/logger');

// Check ticket status on district website
const checkWebStatus = async (district, ticketNumber) => {
  let browser;
  
  try {
    logger.info(`Checking status for ticket ${ticketNumber} on ${district.id}`);
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    
    // District-specific status checking
    let status;
    switch (district.id) {
      case 'CA-USANORTH':
      case 'CA-DIGALERT':
        status = await checkCaliforniaStatus(page, district, ticketNumber);
        break;
        
      case 'FL-SUNSHINE':
        status = await checkFloridaStatus(page, district, ticketNumber);
        break;
        
      default:
        status = await checkGenericStatus(page, district, ticketNumber);
    }
    
    return status;
    
  } catch (error) {
    logger.error('Status check error:', error);
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

// California-specific status check
const checkCaliforniaStatus = async (page, district, ticketNumber) => {
  try {
    // Navigate to status page
    const statusUrl = `${district.webPortal}/status`;
    await page.goto(statusUrl, { waitUntil: 'networkidle2' });
    
    // Enter ticket number
    await page.type('input[name*="ticket"], input[name*="number"]', ticketNumber);
    
    // Submit form
    await page.click('button[type="submit"], input[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    // Extract status information
    const statusInfo = await page.evaluate(() => {
      const statusElement = document.querySelector('.status, [class*="status"]');
      const detailsElement = document.querySelector('.details, [class*="details"]');
      
      return {
        status: statusElement?.textContent?.trim(),
        details: detailsElement?.textContent?.trim()
      };
    });
    
    return {
      status: parseStatus(statusInfo.status),
      details: statusInfo.details,
      lastChecked: new Date().toISOString()
    };
    
  } catch (error) {
    logger.error('California status check failed:', error);
    return null;
  }
};

// Florida-specific status check
const checkFloridaStatus = async (page, district, ticketNumber) => {
  try {
    // Similar implementation for Florida
    const statusUrl = `${district.webPortal}/ticket-search`;
    await page.goto(statusUrl, { waitUntil: 'networkidle2' });
    
    // Implementation would be similar to California
    return null;
    
  } catch (error) {
    logger.error('Florida status check failed:', error);
    return null;
  }
};

// Generic status check using AI
const checkGenericStatus = async (page, district, ticketNumber) => {
  try {
    // Navigate to main page
    await page.goto(district.webPortal, { waitUntil: 'networkidle2' });
    
    // Look for status/search links
    const statusLink = await page.$('a[href*="status"], a[href*="search"], a[href*="track"]');
    
    if (statusLink) {
      await statusLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
    }
    
    // Try to find and fill ticket number field
    const ticketInput = await page.$('input[name*="ticket"], input[name*="number"], input[name*="reference"]');
    
    if (ticketInput) {
      await ticketInput.type(ticketNumber);
      
      // Submit
      const submitButton = await page.$('button[type="submit"], input[type="submit"]');
      if (submitButton) {
        await submitButton.click();
        await page.waitForTimeout(3000);
      }
    }
    
    // Extract any status information
    const pageText = await page.evaluate(() => document.body.innerText);
    
    if (pageText.toLowerCase().includes(ticketNumber.toLowerCase())) {
      return {
        status: 'found',
        details: 'Ticket found in system',
        lastChecked: new Date().toISOString()
      };
    }
    
    return null;
    
  } catch (error) {
    logger.error('Generic status check failed:', error);
    return null;
  }
};

// Parse status text to standard status
const parseStatus = (statusText) => {
  if (!statusText) return 'unknown';
  
  const text = statusText.toLowerCase();
  
  if (text.includes('complete') || text.includes('closed')) {
    return 'completed';
  } else if (text.includes('progress') || text.includes('active')) {
    return 'in_progress';
  } else if (text.includes('pending') || text.includes('submitted')) {
    return 'submitted';
  } else if (text.includes('cancel')) {
    return 'cancelled';
  }
  
  return 'unknown';
};

module.exports = {
  checkWebStatus
};