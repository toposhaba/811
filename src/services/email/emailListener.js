const Imap = require('imap');
const { simpleParser } = require('mailparser');
const { createStatusUpdate } = require('../database/dynamoService');
const { processEmailResponse } = require('./emailProcessor');
const logger = require('../../utils/logger');

let imapConnection = null;

// Start email listener
const startEmailListener = () => {
  try {
    const config = {
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASSWORD,
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false }
    };

    imapConnection = new Imap(config);

    imapConnection.once('ready', () => {
      logger.info('Email listener connected and ready');
      openInbox();
    });

    imapConnection.once('error', (err) => {
      logger.error('Email listener error:', err);
    });

    imapConnection.once('end', () => {
      logger.info('Email listener connection ended');
      // Reconnect after 30 seconds
      setTimeout(startEmailListener, 30000);
    });

    imapConnection.connect();

  } catch (error) {
    logger.error('Failed to start email listener:', error);
  }
};

// Open inbox and monitor for new emails
const openInbox = () => {
  imapConnection.openBox('INBOX', false, (err, box) => {
    if (err) {
      logger.error('Failed to open inbox:', err);
      return;
    }

    logger.info('Inbox opened, monitoring for new emails');

    // Listen for new emails
    imapConnection.on('mail', (numNewMail) => {
      logger.info(`${numNewMail} new email(s) received`);
      fetchUnseenEmails();
    });

    // Initial fetch of unseen emails
    fetchUnseenEmails();
  });
};

// Fetch and process unseen emails
const fetchUnseenEmails = () => {
  imapConnection.search(['UNSEEN'], (err, results) => {
    if (err) {
      logger.error('Email search error:', err);
      return;
    }

    if (results.length === 0) {
      logger.debug('No unseen emails');
      return;
    }

    logger.info(`Found ${results.length} unseen email(s)`);

    const fetch = imapConnection.fetch(results, {
      bodies: '',
      markSeen: true
    });

    fetch.on('message', (msg, seqno) => {
      msg.on('body', (stream, info) => {
        simpleParser(stream, async (err, parsed) => {
          if (err) {
            logger.error('Email parsing error:', err);
            return;
          }

          // Process the email
          await processEmail(parsed);
        });
      });
    });

    fetch.once('error', (err) => {
      logger.error('Fetch error:', err);
    });

    fetch.once('end', () => {
      logger.debug('Finished fetching emails');
    });
  });
};

// Process individual email
const processEmail = async (email) => {
  try {
    logger.info(`Processing email from: ${email.from?.text}, subject: ${email.subject}`);

    // Check if this is an 811-related email
    if (!is811Email(email)) {
      logger.debug('Email is not 811-related, skipping');
      return;
    }

    // Extract ticket information
    const ticketInfo = await processEmailResponse(email);

    if (ticketInfo && ticketInfo.requestId) {
      // Update request status
      await createStatusUpdate(ticketInfo.requestId, 'email_received', {
        from: email.from?.text,
        subject: email.subject,
        ticketNumber: ticketInfo.ticketNumber,
        status: ticketInfo.status,
        message: ticketInfo.message,
        receivedAt: email.date
      });

      logger.info(`Processed 811 response for request ${ticketInfo.requestId}`);
    } else {
      logger.warn('Could not extract request information from email');
    }

  } catch (error) {
    logger.error('Email processing error:', error);
  }
};

// Check if email is 811-related
const is811Email = (email) => {
  const subject = email.subject?.toLowerCase() || '';
  const from = email.from?.text?.toLowerCase() || '';
  const body = email.text?.toLowerCase() || '';

  // Check for 811-related keywords
  const keywords = [
    '811',
    'dig safe',
    'dig ticket',
    'locate request',
    'ticket number',
    'confirmation',
    'one call',
    'excavation',
    'utility locate'
  ];

  return keywords.some(keyword => 
    subject.includes(keyword) || 
    from.includes(keyword) || 
    body.includes(keyword)
  );
};

// Stop email listener
const stopEmailListener = () => {
  if (imapConnection) {
    imapConnection.end();
    imapConnection = null;
    logger.info('Email listener stopped');
  }
};

// Check connection status
const isConnected = () => {
  return imapConnection && imapConnection.state === 'authenticated';
};

module.exports = {
  startEmailListener,
  stopEmailListener,
  isConnected
};