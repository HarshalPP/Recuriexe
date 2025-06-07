import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
import sgMail from '@sendgrid/mail';

// Set SendGrid API key once at the module level
const SENDGRID_API_KEY = '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';
sgMail.setApiKey(SENDGRID_API_KEY);

import {
  success,
  created,
  notFound,
  badRequest,
  unauthorized,
  forbidden,
  serverValidation,
  unknownError,
  validation,
  alreadyExist,
  sendResponse,
  invalid,
  onError
} from "../../../../src/v1/api/formatters/globalResponse.js";

// Nodemailer transporter setup for Gmail
const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL/TLS
  auth: {
    user: process.env.CLIENT_EMAIL,
    pass: process.env.CLIENT_EMAIL_PASSWORD,
  },
});


//old email //
// export const sendEmail = async (options) => {
//   try {
//     const mailOptions = {
//       from: process.env.CLIENT_EMAIL,
//       to: options.to,
//       subject: options.subject,
//       html: options.html,
//       attachments: options.Attachments || [],
//     };

//     const info = await transporter.sendMail(mailOptions);
//     console.log('Email sent: %s', info.messageId);
//     return info;
//   } catch (error) {
//     console.error('Error sending email:', error);
//     throw new Error('Failed to send email');
//   }
// };



// for temp sendgrid //
// export const sendEmail = async (options) => {
//   try {
//     // Basic validation
//     if (!options.to) {
//       throw new Error('Recipient email is required');
//     }

//     // Format recipients
//     const recipients = Array.isArray(options.to) ? options.to : [options.to];
    
//     // Create the email message
//     const msg = {
//       from:"harshal.brilliance@gmail.com",
//       to: "harshal.brilliance@gmail.com",
//       subject: options.subject || 'No Subject',
//       html: options.html || '',
//     };

//     // Add attachments if provided
//     if (options.Attachments && options.Attachments.length > 0) {
//       msg.attachments = options.Attachments.map(attachment => {
//         // If attachment is already properly formatted for SendGrid
//         if (attachment.content && attachment.filename) {
//           return attachment;
//         }

//         // Convert from nodemailer format to SendGrid format if needed
//         return {
//           content: attachment.content || attachment.path || '',
//           filename: attachment.filename || 'attachment',
//           type: attachment.contentType || 'application/octet-stream',
//           disposition: 'attachment'
//         };
//       });
//     }
    
//     // Send the email
//     const info = await sgMail.send(msg);
    
//     console.log('Email sent with SendGrid, messageId:', info[0]?.messageId);
//     return info;   
//   } catch (error) {
//     console.error('Error sending email:', error);
    
//     // Provide more detailed error info
//     if (error.response) {
//       console.error('SendGrid API error details:', {
//         status: error.response.status,
//         body: error.response.body
//       });
//     }
    
//     throw new Error('Failed to send email');
//   }
// };

export const sendEmail = async (options) => {
  try {
    if (!options.to) {
      throw new Error('Recipient email is required');
    }

    const recipients = Array.isArray(options.to) ? options.to : [options.to];

    const msg = {
      from: "support@fincoopers.tech",
      to: recipients,
      subject: options.subject || 'No Subject',
      html: options.html || '',
    };

    // Optional: CC
    if (options.cc) {
      msg.cc = Array.isArray(options.cc) ? options.cc : [options.cc];
    }

    // Optional: BCC
    if (options.bcc) {
      msg.bcc = Array.isArray(options.bcc) ? options.bcc : [options.bcc];
    }

    // Optional: Attachments
    if (options.Attachments && options.Attachments.length > 0) {
      msg.attachments = options.Attachments.map((attachment) => {
        // Expecting base64 content
        return {
          content: attachment.content || '',
          filename: attachment.filename || 'attachment',
          type: attachment.contentType || 'application/octet-stream',
          disposition: 'attachment',
        };
      });
    }

    const info = await sgMail.send(msg);
    console.log('Email sent with SendGrid, messageId:', info[0]?.headers['x-message-id'] || 'N/A');
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error('SendGrid API error details:', {
        status: error.response.status,
        body: error.response.body,
      });
    }
    throw new Error('Failed to send email');
  }
};