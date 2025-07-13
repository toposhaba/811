const nodemailer = require('nodemailer');
const { formatRequestForSubmission } = require('./submissionOrchestrator');
const logger = require('../../utils/logger');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Submit request via email
const submitViaEmail = async (request, district) => {
  try {
    logger.info(`Starting email submission for district ${district.id}`);
    
    // Format request data
    const formData = formatRequestForSubmission(request);
    
    // Generate email content
    const emailContent = generateEmailContent(formData, request);
    
    // Create transporter
    const transporter = createTransporter();
    
    // Send email
    const info = await transporter.sendMail({
      from: `"811 Integration System" <${process.env.EMAIL_USER}>`,
      to: district.email || 'support@' + district.webPortal.replace('https://', ''),
      subject: `811 Locate Request - ${formData.address}`,
      text: emailContent.text,
      html: emailContent.html,
      headers: {
        'X-Request-ID': request.requestId
      }
    });
    
    logger.info(`Email sent: ${info.messageId}`);
    
    return {
      success: true,
      ticketNumber: `EMAIL-${Date.now()}`,
      confirmationNumber: info.messageId,
      data: {
        messageId: info.messageId,
        submittedAt: new Date().toISOString()
      }
    };
    
  } catch (error) {
    logger.error('Email submission error:', error);
    throw error;
  }
};

// Generate email content
const generateEmailContent = (formData, request) => {
  const text = `
811 LOCATE REQUEST

Request ID: ${request.requestId}
Date: ${new Date().toLocaleString()}

CONTACT INFORMATION:
Name: ${formData.contactName}
Company: ${formData.companyName || 'N/A'}
Phone: ${formData.phone}
Email: ${formData.email}

WORK LOCATION:
Address: ${formData.address}
City: ${formData.city}
State: ${formData.state}
ZIP: ${formData.zipCode}
County: ${formData.county || 'N/A'}
Nearest Cross Street: ${formData.nearestCrossStreet || 'N/A'}

WORK DETAILS:
Type of Work: ${formData.workType}
Description: ${formData.workDescription}
Start Date: ${formData.startDate}
Duration: ${formData.duration} day(s)
Depth: ${formData.depth} feet
Work Area: ${formData.workAreaLength}ft x ${formData.workAreaWidth}ft

ADDITIONAL INFORMATION:
Explosives Used: ${formData.explosivesUsed ? 'YES' : 'NO'}
Emergency Work: ${formData.emergencyWork ? 'YES - EMERGENCY' : 'NO'}
Permit Number: ${formData.permitNumber || 'N/A'}
Area Marked: ${formData.markedArea ? 'YES' : 'NO'}
Marking Instructions: ${formData.markingInstructions || 'N/A'}

This request was submitted via the 811 Integration API.
Please respond to this email with the ticket number for tracking.
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .header { background-color: #f4f4f4; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .section { margin-bottom: 20px; }
    .section h3 { color: #333; border-bottom: 2px solid #e0e0e0; padding-bottom: 5px; }
    .field { margin: 10px 0; }
    .field-label { font-weight: bold; }
    .emergency { color: red; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>811 Locate Request</h1>
    <p>Request ID: ${request.requestId}</p>
    <p>Date: ${new Date().toLocaleString()}</p>
  </div>
  
  <div class="content">
    <div class="section">
      <h3>Contact Information</h3>
      <div class="field"><span class="field-label">Name:</span> ${formData.contactName}</div>
      <div class="field"><span class="field-label">Company:</span> ${formData.companyName || 'N/A'}</div>
      <div class="field"><span class="field-label">Phone:</span> ${formData.phone}</div>
      <div class="field"><span class="field-label">Email:</span> ${formData.email}</div>
    </div>
    
    <div class="section">
      <h3>Work Location</h3>
      <div class="field"><span class="field-label">Address:</span> ${formData.address}</div>
      <div class="field"><span class="field-label">City:</span> ${formData.city}</div>
      <div class="field"><span class="field-label">State:</span> ${formData.state}</div>
      <div class="field"><span class="field-label">ZIP:</span> ${formData.zipCode}</div>
      <div class="field"><span class="field-label">County:</span> ${formData.county || 'N/A'}</div>
      <div class="field"><span class="field-label">Nearest Cross Street:</span> ${formData.nearestCrossStreet || 'N/A'}</div>
    </div>
    
    <div class="section">
      <h3>Work Details</h3>
      <div class="field"><span class="field-label">Type of Work:</span> ${formData.workType}</div>
      <div class="field"><span class="field-label">Description:</span> ${formData.workDescription}</div>
      <div class="field"><span class="field-label">Start Date:</span> ${formData.startDate}</div>
      <div class="field"><span class="field-label">Duration:</span> ${formData.duration} day(s)</div>
      <div class="field"><span class="field-label">Depth:</span> ${formData.depth} feet</div>
      <div class="field"><span class="field-label">Work Area:</span> ${formData.workAreaLength}ft x ${formData.workAreaWidth}ft</div>
    </div>
    
    <div class="section">
      <h3>Additional Information</h3>
      <div class="field"><span class="field-label">Explosives Used:</span> ${formData.explosivesUsed ? 'YES' : 'NO'}</div>
      <div class="field ${formData.emergencyWork ? 'emergency' : ''}"><span class="field-label">Emergency Work:</span> ${formData.emergencyWork ? 'YES - EMERGENCY' : 'NO'}</div>
      <div class="field"><span class="field-label">Permit Number:</span> ${formData.permitNumber || 'N/A'}</div>
      <div class="field"><span class="field-label">Area Marked:</span> ${formData.markedArea ? 'YES' : 'NO'}</div>
      <div class="field"><span class="field-label">Marking Instructions:</span> ${formData.markingInstructions || 'N/A'}</div>
    </div>
    
    <p><em>This request was submitted via the 811 Integration API. Please respond to this email with the ticket number for tracking.</em></p>
  </div>
</body>
</html>
`;

  return { text, html };
};

module.exports = {
  submitViaEmail
};