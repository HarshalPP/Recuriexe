const nodemailer = require("nodemailer");
const {
  success,
  unknownError,
  serverValidation,
  badRequest,
  notFound,
} = require("../../../../globalHelper/response.globalHelper");

const EnvConfigModel = require("../model/adminMaster/Env.Model")
// ---------------------------------- This Funtion Use Maltiple Images Function -----------------------------------------------//
function updateFileFields(existingData, newFiles, bodyData) {
  let updatedFiles = [];

  if (bodyData && bodyData != "undefined") {
    updatedFiles = Array.isArray(bodyData)
      ? bodyData
      : bodyData[0] == "["
        ? JSON.parse(bodyData)
        : [bodyData];
  }

  if (newFiles) {
    const newFilePaths = newFiles.map((file) => `/uploads/${file.filename}`);
    updatedFiles = [...updatedFiles, ...newFilePaths];
  }

  return updatedFiles;
}

// ---------------------------------- Send mail Function -----------------------------------------------//
// async function sendEmail(toEmails, ccEmails, subject, html, attachment , vendorType) {



//   try {
//     const transporter = nodemailer.createTransport({
//       host: process.env.EMAIL_HOST_ZOHO,
//       service: "smtppro.zoho.in",
//       port: 465,             // Use 465 for SSL
//       secure: true,          // Set secure to true for port 465
//       auth: {
//         user:process.env.EMAIL_USER_ZOHO, // Full email address
//         pass:process.env.EMAIL_PASSWORD_ZOHO // App-specific password if 2FA is enabled
//       },
//     });




//     // Ensure toEmails and ccEmails are arrays, even if only a single email is provided
//     if (typeof toEmails === "string") {
//       toEmails = [toEmails];
//     }
//     if (ccEmails && typeof ccEmails === "string") {
//       ccEmails = [ccEmails];
//     }


//     const data = await transporter.sendMail({
//       from: process.env.EMAIL_USER_ZOHO, // Sender address
//       to: toEmails.join(","), // Join emails into a comma-separated string
//       cc: ccEmails ? ccEmails.join(",") : undefined, // Handle ccEmails if provided
//       subject: subject,
//       html: html,
//       attachments: attachment,
//     });
//     console.log("MAIL SEND SUSSESFULLY");
//     return true;
//   } catch (error) {
//     console.log(error);
//     console.error('Error sending email:', error.message);
//      return false;
//   }
// }


async function sendEmailByVendor(vendorType, toEmails, ccEmails, subject, html, attachment) {


  console.log("vendorType-----", toEmails, vendorType);
  let emailHost, emailUser, emailPassword;

  switch (vendorType) {
    case "sendLegalEmail":
    case "sendTechnicalEmail":
    case "sendTaggingEmail":
    case "sendFIEmail":
    case "sendRCUEmail":
      // console.log('vendor Right')
      // case "sendTechnicalEmail":
      emailHost = process.env.EMAIL_HOST_LEGAL_TECHNICAL_TAGGING;
      emailUser = process.env.EMAIL_USER_LEGAL_TECHNICAL_TAGGING;
      emailPassword = process.env.EMAIL_PASSWORD_LEGAL_TECHNICAL_TAGGING;
      break;
    case "sendRMEmail":
      emailHost = process.env.EMAIL_HOST_RM;
      emailUser = process.env.EMAIL_USER_RM;
      emailPassword = process.env.EMAIL_PASSWORD_RM;
      break;
    case "creditPd":
    case "autoMail":
      console.log('pd mail trark ')
      emailHost = process.env.EMAIL_HOST_PD;
      emailUser = process.env.EMAIL_USER_PD;
      emailPassword = process.env.EMAIL_PASSWORD_PD;
      break;
    case "BranchPendency":
      emailHost = process.env.EMAIL_HOST_BRANCHPENDENCY;
      emailUser = process.env.EMAIL_USER_BRANCHPENDENCY;
      emailPassword = process.env.EMAIL_PASSWORD_BRANCHPENDENCY;
      break;
    case "cibilEmployee":
      // console.log('start funtion cibil by mail ')
      emailHost = process.env.EMAIL_HOST_CIBIL;
      emailUser = process.env.EMAIL_USER_CIBIL;
      emailPassword = process.env.EMAIL_PASSWORD_CIBIL;
      break;
    case "cibilPendingFile":
      emailHost = process.env.EMAIL_HOST;
      emailUser = process.env.EMAIL_USER;
      emailPassword = process.env.EMAIL_PASSWORD;
      break;
      case "pendingMailSend":
        emailHost = process.env.EMAIL_PENDING_MAIL_HOST;
        emailUser = process.env.EMAIL_PENDING_MAIL_USER;
        emailPassword = process.env.EMAIL_PENDING_MAIL_USER_PASSWORD;
        break;
        case "finalApproverQuery":
        case "sanctionSubmission":
          emailHost = process.env.FINALAPPROVER_QUERY_HOST;
          emailUser = process.env.FINALAPPROVER_QUERY_USER;
          emailPassword = process.env.FINALAPPROVER_QUERY_PASSWORD;
          break;
    default:
  }


  try {
    const transporter = nodemailer.createTransport({
      host: emailHost,
      port: 465,  // SSL port
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
      debug: true,
    });

    // Ensure toEmails and ccEmails are arrays, even if only a single email is provided
    if (typeof toEmails === "string") {
      toEmails = [toEmails];
    }
    if (ccEmails && typeof ccEmails === "string") {
      ccEmails = [ccEmails];
    }

    // console.log('tomail --', toEmails, ' and ', ccEmails)
    const data = await transporter.sendMail({
      from: emailUser, // Sender address
      to: toEmails.join(","),
      cc: ccEmails ? ccEmails.join(",") : undefined,
      subject: subject,
      html: html,
      // attachments: attachment,
      attachments: attachment?.length ? attachment : undefined,
    });
    console.log("MAIL SENT SUCCESSFULLY", data);
    return true;
  } catch (error) {
    console.error("Error sending email:", error.message);
    return false;
  }
}


async function sendEmail(toEmails, ccEmails, subject, html, attachment) {


  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 465,
      secure: true,
      // service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // console.log('toEmails-/-/-/-/-/-/-', process.env.EMAIL_HOST, process.env.EMAIL_USER, process.env.EMAIL_PASSWORD)

    // Ensure toEmails and ccEmails are arrays, even if only a single email is provided
    if (typeof toEmails === "string") {
      toEmails = [toEmails];
    }
    if (ccEmails && typeof ccEmails === "string") {
      ccEmails = [ccEmails];
    }


    const data = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toEmails.join(","), // Join emails into a comma-separated string
      // to: toEmails,
      cc: ccEmails ? ccEmails.join(",") : undefined, // Handle ccEmails if provided
      subject: subject,
      html: html,
      attachments: attachment,
    });
    console.log("MAIL SEND SUSSESFULLY");
    return true;
  } catch (error) {
    console.log(error);
    console.error('Error sending email:', error.message);
    return false;
  }
}

async function leadMailFunction(toEmails, ccEmails, subject, html) {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.in',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
   
    // Handle the case where toEmails is an object containing all email details
    let finalTo, finalCc, finalSubject, finalHtml;
   
    if (typeof toEmails === 'object' && toEmails !== null && !Array.isArray(toEmails)) {
      // Extract values from the object
      finalTo = toEmails.to;
      finalCc = toEmails.cc;
      finalSubject = toEmails.subject;
      finalHtml = toEmails.html;
    } else {
      // Use the separate parameters
      finalTo = toEmails;
      finalCc = ccEmails;
      finalSubject = subject;
      finalHtml = html;
    }
   
    // Validate that we have recipients
    if (!finalTo) {
      throw new Error("No recipients provided");
    }
   
    // Create mail options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: finalTo,
      subject: finalSubject,
      html: finalHtml,
    };
   
    // Only add CC if it's not empty and not an array
    if (finalCc) {
      if (Array.isArray(finalCc)) {
        if (finalCc.length > 0) {
          mailOptions.cc = finalCc.join(',');
        }
      } else if (typeof finalCc === 'string' && finalCc.trim() !== '') {
        mailOptions.cc = finalCc;
      }
    }
   
    const data = await transporter.sendMail(mailOptions);
    console.log("MAIL SENT SUCCESSFULLY");
    return true;
  } catch (error) {
    console.error("Error sending email:", error.message);
    return false;
  }
}
// E_nach Email //

async function eNachEmail(toEmails, ccEmails, subject, html, attachment) {


  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 465,
      secure: true,
      // service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });


    // Ensure toEmails and ccEmails are arrays, even if only a single email is provided
    if (typeof toEmails === "string") {
      toEmails = [toEmails];
    }
    if (ccEmails && typeof ccEmails === "string") {
      ccEmails = [ccEmails];
    }


    const data = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toEmails.join(","), // Join emails into a comma-separated string
      cc: ccEmails ? ccEmails.join(",") : undefined, // Handle ccEmails if provided
      subject: subject,
      html: html,
      attachments: attachment,
    });
    console.log("MAIL SEND SUSSESFULLY");
    return true;
  } catch (error) {
    console.log(error);
    console.error('Error sending email:', error.message);
    return false;
  }
}


// ---------------------------------- HRMS Send mail Function -----------------------------------------------//
async function hrmsSendEmail(toEmails, ccEmails, subject, html, attachment) {
  try {

    const transporter = nodemailer.createTransport({
      host: process.env.HRMS_EMAIL_HOST,
      port: 465,
      secure: true,
      // service: "gmail",
      auth: {
        user: process.env.HRMS_EMAIL_USER,
        pass: process.env.HRMS_EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Ensure toEmails and ccEmails are arrays, even if only a single email is provided
    if (typeof toEmails === "string") {
      toEmails = [toEmails];
    }
    if (ccEmails && typeof ccEmails === "string") {
      ccEmails = [ccEmails];
    }

    const data = await transporter.sendMail({
      from: process.env.HRMS_EMAIL_USER,
      to: toEmails.join(","), // Join emails into a comma-separated string
      cc: ccEmails ? ccEmails.join(",") : undefined, // Handle ccEmails if provided
      subject: subject,
      html: html,
      attachments: attachment,
    });
    console.log("MAIL SEND SUSSESFULLY");
    return true;
  } catch (error) {
    console.log(error);
    console.error('Error sending email:', error.message);
    return false;
  }
}

// make a function to send Email to Pd team

async function PdEmail(toEmails, ccEmails, subject, html) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST_PD,
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER_PD,
        pass: process.env.EMAIL_PASSWORD_PD,
      }
    });

    // Ensure toEmails and ccEmails are arrays, even if only a single email is provided
    if (typeof toEmails === "string") {
      toEmails = [toEmails];
    }
    if (ccEmails && typeof ccEmails === "string") {
      ccEmails = [ccEmails];
    }

    const data = await transporter.sendMail({
      from: process.env.EMAIL_USER_PD,
      to: toEmails.join(","), // Join emails into a comma-separated string
      cc: ccEmails ? ccEmails.join(",") : undefined, // Handle ccEmails if provided
      subject: subject,
      html: html
    });
    console.log("MAIL SEND SUSSESFULLY", toEmails , "-----", "ccEmails",ccEmails );
    return true;
  } catch (error) {
    console.log(error);
    console.error('Error sending email:', error.message);
    return false;
  }
}

async function vendorClickMail(toEmails, ccEmails, subject, html) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_PENDING_MAIL_HOST, // smtppro.zoho.in
      port: 587, // 587 requires STARTTLS
      secure: false, // Set to false for STARTTLS (Use true only for port 465)
      auth: {
        user: process.env.EMAIL_PENDING_MAIL_USER,
        pass: process.env.EMAIL_PENDING_MAIL_USER_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // Ignore self-signed cert errors (useful for testing)
        minVersion: "TLSv1.2", // Force at least TLS 1.2
      },
    });

    if (typeof toEmails === "string") {
      toEmails = [toEmails];
    }
    if (ccEmails && typeof ccEmails === "string") {
      ccEmails = [ccEmails];
    }

    const data = await transporter.sendMail({
      from: process.env.EMAIL_PENDING_MAIL_USER,
      to: toEmails.join(","), 
      cc: ccEmails ? ccEmails.join(",") : undefined, 
      subject: subject,
      html: html
    });
    console.log("MAIL SEND SUSSESFULLY Vendor ", toEmails , "-----", "ccEmails",ccEmails );
    return true;
  } catch (error) {
    console.log(error);
    console.error('Error sending email:', error.message);
    return false;
  }
}

// ---------------------------------------- Final approval send to sanction mail ----------------------------------------------------

async function finalApprovalSendPartnerSanction(toEmails, ccEmails, subject, html, attachment) {
  try {
    // console.log(
    //   toEmails, ccEmails, subject, attachment,"in partner tab"
    // )

    const emailConfig = await EnvConfigModel.findOne({ keyName: "SANCTION", status: "active" });
    
    if (!emailConfig) {
      console.error("Error: No active SANCTION email configuration found in DB.");
      return false;
    }

    // Extract values from DB
    const { host, user, password } = emailConfig;

    console.log('key sanction ---',host, user, password)
    // Validate required fields
    if (!host || !user || !password) {
      console.error("Error: Missing required email configuration in DB.");
      return false;
    }


    if (!toEmails || toEmails.length === 0) {
      console.error("Error: No recipient email provided.");
      return false;
    }

    const transporter = nodemailer.createTransport({
      // host: "smtp.gmail.com",
      // host : process.env.SANCTION_MAIL_HOST,
      host: host,

      port: 465, // Change to 587 if using STARTTLS
      secure: true, // Use false for STARTTLS (port 587)
      auth: {
        // user: `finexe@fincoopers.com`,//"finexe@fincoopers.com",
        // pass: "", // Make sure this is an App Password
          //  user: process.env.SANCTION_MAIL_USER,//"finexe@fincoopers.com",
        // pass:  process.env.SANCTION_MAIL_USER_PASSWORD, // Make sure this is an App Password
        user: user,
        pass: password,
      },
    });

    // Ensure emails are arrays
    if (typeof toEmails === "string") toEmails = [toEmails];
    if (ccEmails && typeof ccEmails === "string") ccEmails = [ccEmails];

    // Fix attachments
    const attachments = attachment?.length
      ? [{ filename: "sanctionDocument.zip", path: attachment[0] }]
      : [];

      try {
        const data = await transporter.sendMail({
          // from: `"FINCOOPERS" ${process.env.SANCTION_MAIL_USER}`,
          from: `"FINCOOPERS" <${user}>`,
          to: toEmails.join(","),
          cc: ccEmails?.length ? ccEmails.join(",") : undefined,
          subject: subject,
          html: html,
          attachments: attachments.length ? attachments : []
        });
      
        // console.log("DATA:", data); // Ensure this logs
        console.log("MAIL SENT SUCCESSFULLY to:", toEmails, "CC:", ccEmails);
        return true;
      } catch (error) {
        console.error("Error sending email:", error);
        return false;
      }
      
    return true;
  } catch (error) {
    console.error("Error sending email:", error.message);
    return false;
  }
}



// Send email to employees
async function sendEmployeeEmail(email, name) {
  try {
    const todayDate = new Date().toLocaleDateString("en-GB");

    const transporter = nodemailer.createTransport({
      host: process.env.HRMS_EMAIL_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.HRMS_EMAIL_USER,
        pass: process.env.HRMS_EMAIL_PASSWORD,
      },
      tls: { rejectUnauthorized: false },
    });

    const mailOptions = {
      from: process.env.HRMS_EMAIL_USER,
      to: email,
      subject: `🚨 Reminder: Missing Punch-Out Record for ${todayDate}`,
      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p>Dear <strong>${name}</strong>,</p>
        
        <p>Our records show that you have not punched out for today (<strong>${todayDate}</strong>) in the attendance system.</p>
        
        <p>Please ensure to punch in to maintain accurate attendance records.</p>
        
        <p>
          For any queries, please reach out to 
          <a href="mailto:hr@fincoopers.com" style="color: #007bff; text-decoration: none;">hr@fincoopers.com</a>.
        </p>
        
        <p style="color: #d9534f;">
          <strong>Note:</strong> This is an automated notification. No reply is required.
        </p>
        
        <br>
        <p>Best regards,</p>
        <p><strong>HR Department</strong></p>
        <p>Fincoopers Capital Private Limited</p>
      </div>
    `
    
    };


    await transporter.sendMail(mailOptions);
    return true; // Success
  } catch (error) {
    console.error(`❌ Failed to send email to ${email}:`, error);
    return false; // Failure
  }
}


// Send Thanku Email // 
async function sendThankuEmail(email, name, position) {
  try {
    const todayDate = new Date().toLocaleDateString("en-GB");

    const transporter = nodemailer.createTransport({
      host: process.env.HRMS_EMAIL_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.HRMS_EMAIL_USER,
        pass: process.env.HRMS_EMAIL_PASSWORD,
      },
      tls: { rejectUnauthorized: false },
    });

    const mailOptions = {
      from: process.env.HRMS_EMAIL_USER,
      to: email,
      subject: `Thank You for Applying for the ${position} Position at Fincoopers Capital Private Limited`,
      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p>Dear <strong>${name}</strong>,</p>
        
        <p>Thank you for applying for the position of <strong>${position}</strong> at <strong>Fincoopers Capital Private Limited</strong>. We have received your application and our team will review your profile shortly.</p>
        
        <p>We appreciate your interest in joining our team and wish you the best of luck with your application process. If you are shortlisted, we will contact you for further steps.</p>
        
        <br>
        <p>Best regards,</p>
        <p><strong>HR Department</strong></p>
        <p>Fincoopers Capital Private Limited</p>
      </div>
    `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Thank You email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email to ${email}:`, error);
    return false;
  }
}






// Send email to managers with Excel attachment
async function sendManagerEmail(managerEmail, excelBuffer , managerName) {
  // Get today's date in DD-MM-YYYY format
  const todayDate = new Date().toLocaleDateString("en-GB");

  const transporter = nodemailer.createTransport({
    host: process.env.HRMS_EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.HRMS_EMAIL_USER,
      pass: process.env.HRMS_EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: process.env.HRMS_EMAIL_USER,
    to: managerEmail,
    subject: `🚨 Auto Notification: Missing Punch-Out Records - ${todayDate}`,
    html: `
      <p>Dear <strong>${managerName}</strong>,</p>
      <p>Please be informed that the following employees have not recorded their punch-out in the system on <strong>${todayDate}</strong>. Kindly review the attached report and take necessary action.</p>
      <p>This is an automated notification from the attendance management system.</p>
      <p>For any discrepancies, kindly reach out to HR.</p>
      <br>
      <p>Best regards,</p>
      <p><strong>HR Department</strong></p>
      <p>Fincoopers Capital Private Limited</p>
    `,
    attachments: [
      {
        filename: `Unpunched_Report_${todayDate}.xlsx`,
        content: excelBuffer,
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    ],
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { updateFileFields, sendEmail, hrmsSendEmail, sendEmailByVendor, PdEmail, eNachEmail , vendorClickMail,
finalApprovalSendPartnerSanction , sendEmployeeEmail , sendManagerEmail , sendThankuEmail , leadMailFunction};
