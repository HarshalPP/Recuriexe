import fs from 'fs';
import axios from 'axios';
import path from 'path';
import { google } from 'googleapis';

// export const sendGmail = async (accessToken, to, subject, message, filePath = null) => {
//   const oAuth2Client = new google.auth.OAuth2();
//   oAuth2Client.setCredentials({ access_token: accessToken });
//   const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

//   // If no attachment, send plain email
//   if (!filePath) {
//     const emailContent = [
//       `To: ${to}`,
//       `Subject: ${subject}`,
//       '',
//       message
//     ].join('\n');

//     const encodedMessage = Buffer.from(emailContent)
//       .toString('base64')
//       .replace(/\+/g, '-')
//       .replace(/\//g, '_')
//       .replace(/=+$/, '');

//     await gmail.users.messages.send({
//       userId: 'me',
//       requestBody: { raw: encodedMessage }
//     });

//     return;
//   }

//   // Determine filename
//   const fileName = path.basename(filePath);

//   // Read file (from URL or local)
//   let fileContentBase64;

//   if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
//     // Download file from URL
//     const response = await axios.get(filePath, { responseType: 'arraybuffer' });
//     fileContentBase64 = Buffer.from(response.data).toString('base64');
//   } else {
//     // Read from local file
//     const fileContent = fs.readFileSync(filePath);
//     fileContentBase64 = fileContent.toString('base64');
//   }

//   // Email with attachment
//   const boundary = '__my_boundary__';
//   const emailParts = [
//     `To: ${to}`,
//     `Subject: ${subject}`,
//     'MIME-Version: 1.0',
//     `Content-Type: multipart/mixed; boundary="${boundary}"`,
//     '',
//     `--${boundary}`,
//     'Content-Type: text/plain; charset="UTF-8"',
//     '',
//     message,
//     '',
//     `--${boundary}`,
//     'Content-Type: application/octet-stream',
//     `Content-Disposition: attachment; filename="${fileName}"`,
//     'Content-Transfer-Encoding: base64',
//     '',
//     fileContentBase64,
//     `--${boundary}--`
//   ];

//   const rawMessage = Buffer.from(emailParts.join('\n'))
//     .toString('base64')
//     .replace(/\+/g, '-')
//     .replace(/\//g, '_')
//     .replace(/=+$/, '');

//   await gmail.users.messages.send({
//     userId: 'me',
//     requestBody: { raw: rawMessage }
//   });
// };

export const sendGmail = async (accessToken, to, subject, message, filePath = null) => {
  const oAuth2Client = new google.auth.OAuth2();
  
  // ✅ Set required scope explicitly
  oAuth2Client.scopes = ["https://www.googleapis.com/auth/gmail.send "];
  oAuth2Client.setCredentials({ access_token: accessToken });
  
  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  // Use CRLF line endings for MIME compliance
  const CRLF = '\r\n';

  // If no attachment, send HTML email
  if (!filePath) {
    const emailContent = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8', // ✅ HTML content type
      '',
      message
    ].join(CRLF);

    const encodedMessage = Buffer.from(emailContent)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage }
    });
    return;
  }

  // Handle attachments
  const boundary = '__my_boundary__';
  const fileName = path.basename(filePath);

  // Read file content
  let fileContentBase64;
  if (filePath.startsWith('http')) {
    const response = await axios.get(filePath, { responseType: 'arraybuffer' });
    fileContentBase64 = Buffer.from(response.data).toString('base64');
  } else {
    fileContentBase64 = fs.readFileSync(filePath).toString('base64');
  }

  // ✅ Use HTML MIME type in multipart message
  const emailParts = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"', // ✅ HTML content type
    '',
    message,
    '',
    `--${boundary}`,
    'Content-Type: application/octet-stream',
    `Content-Disposition: attachment; filename="${fileName}"`,
    'Content-Transfer-Encoding: base64',
    '',
    fileContentBase64,
    `--${boundary}--`
  ];

  const rawMessage = Buffer.from(emailParts.join(CRLF))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: rawMessage }
  });
};
