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
export async function sendThankuEmail(email, name, position , organizationName) {
  try {
    console.log('email run ')
    const todayDate = new Date().toLocaleDateString("en-GB");

    const msg = {
      from: "support@fincoopers.tech", 
      cc: email,
      to:"career@fincoopers.in",
      // e.g., verified sender like hr@fincoopers.com
      subject: `Thank You for Applying for the ${position} Position at ${organizationName}`,
      html: `
  <div>
    
    <!-- Main Content -->
    <div style="padding: 25px 20px;">
      
      <!-- Greeting -->
      <div style="margin-bottom: 20px;">
        <h2 style="color:rgb(61, 63, 65); font-size: 22px; font-weight: 600; margin: 0 0 8px 0;">
          Dear <span"><strong>${name}</strong> </span>,
        </h2>
        <div style="width: 40px; height: 3px; background: linear-gradient(90deg, #4f46e5, #7c3aed); border-radius: 2px;"></div>
      </div>

      <!-- Main Message -->
      <div style="background: #f8fafc; padding: 18px; border-radius: 8px;  margin-bottom: 20px;">
        <h3 style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 0 0 10px 0;">
          Application Received: Recruiter Position!
        </h3>
        <p style="color: #374151; margin: 0; font-size: 16px; line-height: 1.6;">
        Thank you for applying for the Recruiter <strong>${position}</strong> at <strong>${organizationName}</strong>!  We've successfully received your submission and appreciate your interest in our team.
        </p>
      </div>

      <!-- AI Screening Section -->
      <div style="margin-bottom: 20px;">
        <h3 style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 0 0 10px 0;">Your Application & Our AI Screening Process</h3>

        
        
        <p style="color: #374151; margin: 0 0 12px 0; font-size: 16px; line-height: 1.6;">
        To ensure an efficient and fair evaluation, your application will undergo an AI screening process as part of our initial assessment. Our advanced AI recruitment system will:
        </p>
        
        <div style="background:rgb(229, 220, 244); border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px;">
        
          <ul style="color: #374151; margin: 0; padding-left: 18px; font-size: 15px; line-height: 1.6;">
            <li style="margin-bottom: 6px;">Analyze your skills and qualifications against job requirements</li>
            <li style="margin-bottom: 6px;">Match your experience with our position criteria</li>
            <li style="margin-bottom: 0;">Ensure fair and consistent candidate evaluation</li>
          </ul>
        </div>
          <p style="color: #374151; margin: 0 0 12px 0; font-size: 16px; line-height: 1.6;">
          You'll be informed of the results of this AI assessment shortly, which will then determine the next steps in your application journey.
        </p>
      </div>

      <!-- Process Timeline -->
      <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
        <h3 style="color: #1f2937; font-size: 25px; font-weight: 600; margin: 0 0 12px 0;">
          What Happens Next
        </h3>
        <div style="color: #374151; font-size: 15px; line-height: 1.5;">
          <p style="margin: 0 0 8px 0;"><strong>1. AI Screening:</strong> Your resume is currently being automatically reviewed (expected completion within <strong>24-48 hours)</strong></p>
          <p style="margin: 0 0 8px 0;"><strong>2. Profile Prioritization:</strong> Qualified candidates will be sorted and prioritized based on the AI assessment.</p>
          <p style="margin: 0;"><strong>3. HR Contact:</strong>If shortlisted, our HR team will contact you for the next stages of the hiring process.</p>
        </div>
      </div>


      <!-- Closing Message -->
      <div style="border-top: 2px solid #e5e7eb; padding-top: 16px; margin-bottom: 16px;">
        <p style="color: #374151; margin: 0 0 16px 0; font-size: 16px; line-height: 1.5;">
        We wish you the best of luck with your application and appreciate your patience as our AI-powered system ensures every submission receives thorough consideration.
        </p>
        
        <p style="color: #1f2937; margin: 12px 0 4px 0; font-size: 16px; font-weight: 600;">Best regards,</p>
        <p style="color: #4f46e5; margin: 0; font-size: 17px; font-weight: 700;">HR Department</p>
        <p style="color: #6b7280; margin: 2px 0 0 0; font-size: 14px;">${organizationName}</p>
      </div>

            <!-- Important Note -->
      <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 6px; padding: 12px; margin-bottom: 20px;">
        <p style="color: #92400e; margin: 0; font-size: 15px; line-height: 1.5;">
          <strong>Important:</strong> Please keep an eye on your email (including spam folder) for updates. We will contact you within <strong>5-7 business days</strong> if your profile matches our requirements.
        </p>
      </div>
    </div>
  </div>
`
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