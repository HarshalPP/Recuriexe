import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
import sgMail from '@sendgrid/mail';

// Set SendGrid API key once at the module level
const SENDGRID_API_KEY = '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';
sgMail.setApiKey(SENDGRID_API_KEY);
import mime from 'mime-types';
import axios from 'axios';


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
export const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.CLIENT_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.Attachments || [],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};



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



import { SendMailClient } from "zeptomail";

// ZeptoMail credentials
const url = "api.zeptomail.in/";
const token = "Zoho-enczapikey PHtE6r1cS+nqizR58hUDtve6EM+tMNkrq7hiK1VPsotLW/YLS01Rr4ojwGW1o0giXfITEvbNnN1rtu7K5e3WdmnvM29OWWqyqK3sx/VYSPOZsbq6x00YtVkYcELcVo/ucNNq0CPfuNaX";

const client = new SendMailClient({ url, token });

// export const sendEmail = async (options) => {
//   try {
//     if (!options.to) {
//       throw new Error("Recipient email is required");
//     }

//     const toRecipients = (Array.isArray(options.to) ? options.to : [options.to]).map((email) => ({
//       email_address: {
//         address: email,
//         name: "", // optional
//       },
//     }));

//     const ccRecipients = options.cc
//       ? (Array.isArray(options.cc) ? options.cc : [options.cc]).map((email) => ({
//           email_address: { address: email, name: "" },
//         }))
//       : [];

//     const bccRecipients = options.bcc
//       ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]).map((email) => ({
//           email_address: { address: email, name: "" },
//         }))
//       : [];

//     const mailData = {
//       from: {
//         address: "noreply@fincooperstech.com",
//         name: "noreply",
//       },
//       to: toRecipients,
//       cc: ccRecipients.length > 0 ? ccRecipients : undefined,
//       bcc: bccRecipients.length > 0 ? bccRecipients : undefined,
//       subject: options.subject || "No Subject",
//       htmlbody: options.html || "<p>No Content</p>",
//       attachments: options.Attachments?.length
//         ? options.Attachments.map((att) => ({
//             content: att.content, // base64 string
//             name: att.filename || "attachment",
//             content_type: att.contentType || "application/octet-stream",
//           }))
//         : undefined,
//     };

//     const response = await client.sendMail(mailData);
//     console.log("ZeptoMail sent:", response.data?.message || "Success");
//     return response.data;
//   } catch (error) {
//     console.error("ZeptoMail error:", error.response?.data || error.message || error);
//     throw new Error("Failed to send email via ZeptoMail");
//   }
// };


export const sendEmail1 = async (options) => {
  try {
    if (!options.to) {
      throw new Error("Recipient email is required");
    }

    const toRecipients = (Array.isArray(options.to) ? options.to : [options.to]).map((email) => ({
      email_address: {
        address: email,
        name: "", // optional
      },
    }));

    const ccRecipients = options.cc
      ? (Array.isArray(options.cc) ? options.cc : [options.cc]).map((email) => ({
          email_address: { address: email, name: "" },
        }))
      : [];

    const bccRecipients = options.bcc
      ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]).map((email) => ({
          email_address: { address: email, name: "" },
        }))
      : [];

    const mailData = {
      from: {
        address: "noreply@fincooperstech.com",
        name: "noreply",
      },
      to: toRecipients,
      cc: ccRecipients.length > 0 ? ccRecipients : undefined,
      bcc: bccRecipients.length > 0 ? bccRecipients : undefined,
      subject: options.subject || "No Subject",
      htmlbody: options.html || "<p>No Content</p>",
      attachments: options.Attachments?.length
        ? options.Attachments.map((att) => ({
            content: att.content, // base64 string
            name: att.filename || "attachment",
            content_type: att.contentType || "application/octet-stream",
          }))
        : undefined,
    };

    const response = await client.sendMail(mailData);
    console.log("ZeptoMail sent:", response.data?.message || "Success");
    return response.data;
  } catch (error) {
    console.error("ZeptoMail error:", error.response?.data || error.message || error);
    throw new Error("Failed to send email via ZeptoMail");
  }
};

// export const sendEmail = async (options) => {
//   try {
//     if (!options.to) {
//       throw new Error('Recipient email is required');
//     }

//     const recipients = Array.isArray(options.to) ? options.to : [options.to];

//     const msg = {
//       from: "support@fincoopers.tech",
//       to: recipients,
//       subject: options.subject || 'No Subject',
//       html: options.html || '',
//     };

//     // Optional: CC
//     if (options.cc) {
//       msg.cc = Array.isArray(options.cc) ? options.cc : [options.cc];
//     }

//     // Optional: BCC
//     if (options.bcc) {
//       msg.bcc = Array.isArray(options.bcc) ? options.bcc : [options.bcc];
//     }

//     // Optional: Attachments
//     if (options.Attachments && options.Attachments.length > 0) {
//       msg.attachments = options.Attachments.map((attachment) => {
//         // Expecting base64 content
//         return {
//           content: attachment.content || '',
//           filename: attachment.filename || 'attachment',
//           type: attachment.contentType || 'application/octet-stream',
//           disposition: 'attachment',
//         };
//       });
//     }

//     const info = await sgMail.send(msg);
//     console.log('Email sent with SendGrid, messageId:', info[0]?.headers['x-message-id'] || 'N/A');
//     return info;
//   } catch (error) {

//     if (error.response) {
//       console.error('SendGrid API error details:', {
//         status: error.response.status,
//         body: error.response.body,
//       });
//     }
//     throw new Error('Failed to send email');
//   }
// };

// export const sendEmail1 = async (options) => {
//   try {
//     if (!options.to) {
//       throw new Error('Recipient email is required');
//     }

//     const recipients = Array.isArray(options.to) ? options.to : [options.to];

//     const msg = {
//       from: "support@fincoopers.tech", // must be verified in SendGrid
//       to: recipients,
//       subject: options.subject || 'No Subject',
//       html: options.html || '',
//     };

//     if (options.cc) msg.cc = [].concat(options.cc);
//     if (options.bcc) msg.bcc = [].concat(options.bcc);

//     if (options.Attachments?.length) {
//       msg.attachments = options.Attachments.map(att => ({
//         content: att.content || '',
//         filename: att.filename || 'attachment',
//         type: att.contentType || 'application/octet-stream',
//         disposition: 'attachment',
//       }));
//     }

//     const info = await sgMail.send(msg);
//     console.log('Email sent with SendGrid, messageId:', info[0]?.headers['x-message-id'] || 'N/A');
//     return info;
//   } catch (error) {


//     if (error.response) {
//       console.error('SendGrid API error details:', {
//         status: error.response.status,
//         body: error.response.body,
//       });
//       const errorMessage = error.response.body?.errors?.[0]?.message || 'Unknown error';
//       throw new Error(`SendGrid Error: ${errorMessage}`);
//     }

//     throw new Error('Failed to send email');
//   }
// };



export const sendEmailWithZepto = async (req, res) => {
  try {
    const {
      toEmails,
      ccEmails,
      subject,
      htmlContent,
      attachments = []
    } = req.body;
const token = "Zoho-enczapikey PHtE6r1cS+nqizR58hUDtve6EM+tMNkrq7hiK1VPsotLW/YLS01Rr4ojwGW1o0giXfITEvbNnN1rtu7K5e3WdmnvM29OWWqyqK3sx/VYSPOZsbq6x00YtVkYcELcVo/ucNNq0CPfuNaX";


    const fromEmail = process.env.ZEPTO_FROM_EMAIL || "noreply@fincooperstech.com";
    const fromName = process.env.ZEPTO_FROM_NAME || "Fincoopers Tech";

    const toArray = Array.isArray(toEmails) ? toEmails : toEmails ? [toEmails] : [];
    const ccArray = Array.isArray(ccEmails) ? ccEmails : ccEmails ? [ccEmails] : [];

    const validTo = toArray.filter(isValidEmail);
    const validCc = ccArray.filter(isValidEmail);

    if (validTo.length === 0 && validCc.length === 0) {
      return res.status(400).json({ success: false, error: "No valid recipients found" });
    }

    const preparedAttachments = await prepareAttachmentsForZepto({ attachments });

    const payload = {
      from: {
        address: fromEmail,
        name: fromName
      },
      to: validTo.map(email => ({ email_address: { address: email } })),
      cc: validCc.length > 0 ? validCc.map(email => ({ email_address: { address: email } })) : undefined,
      subject: subject.trim(),
      htmlbody: htmlContent,
      attachments: preparedAttachments.length > 0 ? preparedAttachments : undefined
    };

    const response = await client.sendMail(payload);

    console.log("✅ ZeptoMail sent successfully:", response.data);
    return res.status(200).json({ success: true, messageId: response.data.request_id });

  } catch (error) {
    console.error("❌ ZeptoMail Error:", error?.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data || null
    });
  }
};

// Helper: Validate email format
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Helper: Prepare attachments from dynamic URLs or base64 body
export const prepareAttachmentsForZepto = async (payload = {}) => {
  const { attachments = [] } = payload;

  if (!Array.isArray(attachments) || attachments.length === 0) {
    return [];
  }

  const prepared = await Promise.all(
    attachments.map(async (attachment) => {
      try {
        // If it's a base64 attachment
        if (attachment.content && attachment.name) {
          return {
            content: attachment.content,
            name: attachment.name,
            mime_type: attachment.mime_type || mime.lookup(attachment.name) || 'application/octet-stream',
          };
        }

        // If it's a URL-based attachment
        if (attachment.url) {
          const response = await axios.get(attachment.url, { responseType: 'arraybuffer' });
          const base64Content = Buffer.from(response.data).toString('base64');
          const name = attachment.name || path.basename(attachment.url);
          const mimeType = attachment.mime_type || mime.lookup(name) || 'application/octet-stream';

          return {
            content: base64Content,
            name,
            mime_type: mimeType
          };
        }

        return null;
      } catch (err) {
        console.error('❌ Failed to fetch/process attachment:', attachment.url || attachment.name, err.message);
        return null;
      }
    })
  );

  return prepared.filter(Boolean);
};