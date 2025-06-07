import nodemailer from "nodemailer";

import sgMail from '@sendgrid/mail';
// Set SendGrid API key once at the module level
const SENDGRID_API_KEY = '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';
sgMail.setApiKey(SENDGRID_API_KEY);


// SMTP connection  //
// export async function sendThankuEmail(email, name, position) {
//     try {
//       const todayDate = new Date().toLocaleDateString("en-GB");
  
//       const transporter = nodemailer.createTransport({
//         host: process.env.HRMS_EMAIL_HOST,
//         port: 465,
//         secure: true,
//         auth: {
//           user: process.env.HRMS_EMAIL_USER,
//           pass: process.env.HRMS_EMAIL_PASSWORD,
//         },
//         tls: { rejectUnauthorized: false },
//       });
  
//       const mailOptions = {
//         from: process.env.HRMS_EMAIL_USER,
//         to: email,
//         subject: `Thank You for Applying for the ${position} Position at Fincoopers Capital Private Limited`,
//         html: `
//         <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
//           <p>Dear <strong>${name}</strong>,</p>
          
//           <p>Thank you for applying for the position of <strong>${position}</strong> at <strong>Fincoopers Capital Private Limited</strong>. We have received your application and our team will review your profile shortly.</p>
          
//           <p>We appreciate your interest in joining our team and wish you the best of luck with your application process. If you are shortlisted, we will contact you for further steps.</p>
          
//           <br>
//           <p>Best regards,</p>
//           <p><strong>HR Department</strong></p>
//           <p>Fincoopers Capital Private Limited</p>
//         </div>
//         `,
//       };
  
//       await transporter.sendMail(mailOptions);
//       console.log(`✅ Thank You email sent to ${email}`);
//       return true;
//     } catch (error) {
//       console.error(`❌ Failed to send email to ${email}:`, error);
//       return false;
//     }
//   }



// Send Grid Connection //
export async function sendThankuEmail(email, name, position) {
  try {
    const todayDate = new Date().toLocaleDateString("en-GB");

    const msg = {
      to: email,
      from: "support@fincoopers.tech", // e.g., verified sender like hr@fincoopers.com
      subject: `Thank You for Applying for the ${position} Position at Fincoopers Tech India`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <p>Dear <strong>${name}</strong>,</p>
          
          <p>Thank you for applying for the position of <strong>${position}</strong> at <strong>Fincoopers Tech India</strong>. We have received your application and our team will review your profile shortly.</p>
          
          <p>We appreciate your interest in joining our team and wish you the best of luck with your application process. If you are shortlisted, we will contact you for further steps.</p>
          
          <br>
          <p>Best regards,</p>
          <p><strong>HR Department</strong></p>
          <p>Fincoopers Tech India</p>
        </div>
      `,
    };

    const info = await sgMail.send(msg);
    console.log(`✅ Thank You email sent to ${email}, Message ID:`, info[0]?.headers['x-message-id'] || 'N/A');
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email to ${email}:`, error);
    if (error.response) {
      console.error('SendGrid API error details:', error.response.body);
    }
    return false;
  }
}


// export const hrmsSendEmail = async (toEmails, ccEmails, subject, html, attachment) => {
//   console.log("subject" , subject)
//   console.log("html" , html)
//   console.log("attachment" , attachment)
//   console.log("1")
//   console.log("HOST" , process.env.HRMS_EMAIL_HOST)
//   console.log("USER" , process.env.HRMS_EMAIL_USER)
//   console.log("PASWORD" , process.env.HRMS_EMAIL_PASSWORD)
//   try {
//  const transporter = nodemailer.createTransport({
//   host: process.env.HRMS_EMAIL_HOST,
//   port: 465, // Implicit TLS
//   secure: true, // MUST be true for port 465
//   auth: {
//     user: process.env.HRMS_EMAIL_USER,
//     pass: process.env.HRMS_EMAIL_PASSWORD,
//   }

//     });


//     // Normalize email inputs
//     toEmails = Array.isArray(toEmails) ? toEmails : [toEmails];
//     ccEmails = ccEmails ? (Array.isArray(ccEmails) ? ccEmails : [ccEmails]) : undefined;

//       console.log("toemail" , toEmails)
//   console.log("ccEmails" , ccEmails)

//     const data = await transporter.sendMail({
//       from: process.env.HRMS_EMAIL_USER,
//       to: toEmails.join(","),
//       cc: ccEmails ? ccEmails.join(",") : undefined,
//       subject,
//       html,
//       attachments: attachment,
//     });

//     console.log("MAIL SENT SUCCESSFULLY");
//     return data;
//   } catch (error) {
//     console.error("Error sending email:", error);
//     return false;
//   }
// };


// for temp sendgrid
export const hrmsSendEmail = async (toEmails, ccEmails, subject, html, attachment) => {
  try {

    let to = Array.isArray(toEmails) ? toEmails : [toEmails];
    let cc = ccEmails ? (Array.isArray(ccEmails) ? ccEmails : [ccEmails]) : [];

    cc = cc.filter(email => !to.includes(email));

    const attachments = Array.isArray(attachment)
      ? attachment
      : attachment
      ? [attachment]
      : [];

    const msg = {
      from: "harshal.brilliance@gmail.com",
      to,
      cc: cc.length ? cc : undefined, // only set if not empty
      subject,
      html,
      attachments: attachments.map(att => ({
        content: att.content || '',
        filename: att.filename || 'attachment',
        type: att.contentType || 'application/octet-stream',
        disposition: 'attachment',
      })),
    };

    await sgMail.send(msg);
    console.log("✅ MAIL SENT SUCCESSFULLY");
    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    if (error.response) {
      console.error("SendGrid response error:", error.response.body);
    }
    return false;
  }
};