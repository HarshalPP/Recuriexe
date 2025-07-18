import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import initModel from '../models/init.model.js';
import partnerRequestModel from '../models/partnerRequest.model.js';
import companyModel from '../models/company.model.js';
import templateModel from '../models/template.model.js';
import mongoose from 'mongoose';
import emailTemplateModel from '../models/pdfTemplate.model.js';


dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const emailService = {
//   sendPurchaseInvoiceEmail: async function(email, userName, invoiceData, pdfAttachment) {
//     try {
//       // Create plain text version
//       const plainText = `Thank you for your purchase, ${userName}. Your invoice #${invoiceData.invoiceNumber} dated ${invoiceData.date} for Rs. ${invoiceData.amount.toFixed(2)} has been generated. Please find the attached PDF invoice for your records.`;
      
//       // Email content
//       const msg = {
//         to: email,
//         from: {
//           email: process.env.SENDGRID_FROM_EMAIL,
//           name: 'Document Parser App'
//         },
//         subject: `Your Invoice #${invoiceData.invoiceNumber} from DocExe`,
//         text: plainText,
//         html: `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="utf-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1">
//       <title>Your Invoice</title>
//       <style>
//         @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
//       </style>
//     </head>
//     <body style="margin: 0; padding: 0; font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f9fc;">
//       <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 650px; margin: 0 auto; padding: 40px 20px;">
//         <tr>
//           <td>
//             <!-- Main Container -->
//             <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08);">
              
//               <!-- Sleek Top Border -->
//               <tr>
//                 <td style="height: 8px; background-image: linear-gradient(to right, #6e48aa, #9d50bb, #5c67e0, #3494e6); padding: 0;"></td>
//               </tr>
              
//               <!-- Logo & Brand Section -->
//               <tr>
//                 <td style="padding: 40px 40px 30px; text-align: center;">
//                   <!-- Logo Placeholder (replace with your actual logo) -->
//                   <div style="display: inline-block; width: 80px; height: 80px; background-image: linear-gradient(45deg, #6e48aa, #9d50bb); border-radius: 20px; margin-bottom: 20px; position: relative; box-shadow: 0 8px 16px rgba(110, 72, 170, 0.2);">
//                     <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 36px; font-weight: 700;">DP</div>
//                   </div>
//                   <h1 style="margin: 0; color: #32325d; font-weight: 700; font-size: 28px; letter-spacing: -0.5px;">Your Invoice</h1>
//                   <p style="margin: 10px 0 0; font-size: 16px; color: #8898aa; font-weight: 400;">Document Parser Application</p>
//                 </td>
//               </tr>
              
//               <!-- Main content with curved background -->
//               <tr>
//                 <td style="padding: 0 40px 40px;">
//                   <div style="background-color: #f9fafc; border-radius: 12px; padding: 35px; position: relative;">
//                     <!-- Decorative Elements -->
//                     <div style="position: absolute; top: 20px; right: 20px; width: 20px; height: 20px; border-radius: 50%; background: linear-gradient(45deg, #5c67e0, #3494e6); opacity: 0.1;"></div>
//                     <div style="position: absolute; bottom: 20px; left: 20px; width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(45deg, #6e48aa, #9d50bb); opacity: 0.1;"></div>
                    
//                     <!-- Welcome Text -->
//                     <p style="font-size: 16px; line-height: 1.8; color: #525f7f; margin-top: 0; font-weight: 400;">
//                       Dear ${userName},
//                     </p>
//                     <p style="font-size: 16px; line-height: 1.8; color: #525f7f; margin-top: 10px; font-weight: 400;">
//                       Thank you for your purchase! We've attached your invoice #${invoiceData.invoiceNumber} dated ${invoiceData.date} to this email.
//                     </p>
                    
//                     <!-- Invoice Summary Box -->
//                     <div style="background: linear-gradient(135deg, #ffffff, #f5f8ff); border-radius: 12px; padding: 30px; margin: 30px 0; text-align: left; box-shadow: 0 8px 20px rgba(0,0,0,0.04); border: 1px solid rgba(156, 175, 255, 0.15);">
//                       <h3 style="margin-top: 0; color: #32325d; font-weight: 600;">Invoice Summary</h3>
                      
//                       <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
//                         <tr>
//                           <td style="padding: 10px 0; border-bottom: 1px solid #e6ebf1; color: #6b7c93; font-weight: 500;">Invoice Number:</td>
//                           <td style="padding: 10px 0; border-bottom: 1px solid #e6ebf1; text-align: right; font-weight: 600; color: #32325d;">${invoiceData.invoiceNumber}</td>
//                         </tr>
//                         <tr>
//                           <td style="padding: 10px 0; border-bottom: 1px solid #e6ebf1; color: #6b7c93; font-weight: 500;">Date:</td>
//                           <td style="padding: 10px 0; border-bottom: 1px solid #e6ebf1; text-align: right; font-weight: 600; color: #32325d;">${invoiceData.date}</td>
//                         </tr>
//                         <tr>
//                           <td style="padding: 10px 0; border-bottom: 1px solid #e6ebf1; color: #6b7c93; font-weight: 500;">Plan:</td>
//                           <td style="padding: 10px 0; border-bottom: 1px solid #e6ebf1; text-align: right; font-weight: 600; color: #32325d;">DOCEXE GROWTH PLAN</td>
//                         </tr>
//                         <tr>
//                           <td style="padding: 15px 0; color: #6b7c93; font-weight: 700;">Total Amount:</td>
//                           <td style="padding: 15px 0; text-align: right; font-weight: 700; color: #6e48aa; font-size: 18px;">Rs. ${invoiceData.amount.toFixed(2)}</td>
//                         </tr>
//                       </table>
//                     </div>
                    
//                     <!-- Note -->
//                     <p style="font-size: 15px; line-height: 1.8; color: #525f7f; margin-bottom: 0; background-color: #ffffff; border-radius: 8px; padding: 15px; border-left: 4px solid #3494e6;">
//                       <strong style="color: #32325d;">Note:</strong> This is an official receipt for your purchase. Please keep it for your records.
//                     </p>
//                   </div>
                  
//                   <!-- Call to Action -->
//                   <div style="text-align: center; margin-top: 35px;">
//                     <a href="https://fincooperstech.com/login" style="display: inline-block; padding: 14px 40px; background-image: linear-gradient(to right, #6e48aa, #5c67e0); color: white; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 15px; box-shadow: 0 6px 16px rgba(108, 74, 189, 0.3);">Login to Your Account</a>
//                   </div>
                  
//                   <!-- Support section -->
//                   <div style="margin-top: 35px; text-align: center;">
//                     <p style="font-size: 14px; color: #8898aa; line-height: 1.7; margin-bottom: 0;">
//                       Need help? Our support team is available 24/7<br>
//                       <a href="mailto:support@fincooperstech.com" style="color: #6e48aa; text-decoration: none; font-weight: 500;">support@fincooperstech.com</a>
//                     </p>
//                   </div>
//                 </td>
//               </tr>
              
//               <!-- Footer -->
//               <tr>
//                 <td style="background-color: #f8fafc; padding: 25px 40px; border-top: 1px solid #e6ebf1; text-align: center;">
//                   <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
//                     <tr>
//                       <td>
//                         <p style="font-size: 13px; color: #8898aa; margin: 0 0 5px; font-weight: 400;">
//                           &copy; ${new Date().getFullYear()} Document Parser Application by FinCoopersTech
//                         </p>
//                         <p style="font-size: 13px; color: #8898aa; margin: 0 0 5px;">
//                           <a href="https://fincooperstech.com" style="color: #6e48aa; text-decoration: none; font-weight: 500;">fincooperstech.com</a>
//                         </p>
//                         <p style="font-size: 13px; color: #8898aa; margin: 15px 0 0; padding-top: 15px; border-top: 1px solid #e6ebf1;">
//                           <a href="https://fincooperstech.com/privacy" style="color: #8898aa; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
//                           <a href="https://fincooperstech.com/terms" style="color: #8898aa; text-decoration: none; margin: 0 10px;">Terms of Service</a>
//                           <a href="https://fincooperstech.com/unsubscribe?email=${encodeURIComponent(email)}" style="color: #8898aa; text-decoration: none; margin: 0 10px;">Unsubscribe</a>
//                         </p>
//                       </td>
//                     </tr>
//                   </table>
//                 </td>
//               </tr>
//             </table>
//           </td>
//         </tr>
//       </table>
//     </body>
//     </html>
//   `,
//         attachments: [
//           {
//             content: pdfAttachment,
//             filename: `Invoice_${invoiceData.invoiceNumber}.pdf`,
//             type: 'application/pdf',
//             disposition: 'attachment'
//           }
//         ]
//       };

//       await sgMail.send(msg);
//       console.log('Invoice email sent successfully via SendGrid');
      
//       return true;
//     } catch (error) {
//       console.error('Error sending invoice email with SendGrid:', error);
//       throw error;
//     }
//   },
  
  sendAllEmail: async function(subject,to, initId,tempId,req) {
    try {

           const template = await emailTemplateModel.findById(tempId);
            if (!template) {
              return returnFormatter(false, "Template not found");
            }
        
            // 2️⃣ Fetch init data
            const initData = await initModel.find({ _id: initId })
              .populate({ path: "partnerId", model: "user", options: { strictPopulate: false } })
              .populate({ path: "doneBy", model: "employee", options: { strictPopulate: false } })
              .populate({ path: "allocatedOfficeEmp", model: "employee", options: { strictPopulate: false } })
              .populate({ path: "referServiceId", model: "service", options: { strictPopulate: false } })
              .populate({ path: "reportType", model: "userProduct", options: { strictPopulate: false } })
              .sort({ createdAt: -1 });
        
            if (!initData.length) {
              return returnFormatter(true, "No init data found", []);
            }
        
            const jobInit = initData[0];
            const partnerId = jobInit.partnerId?._id || jobInit.partnerId;
            const serviceId = new mongoose.Types.ObjectId(req.user.serviceId);
        
            // 3️⃣ Fetch partner request data
            const requestData = await partnerRequestModel.aggregate([
              {
                $match: {
                  $or: [
                    { senderId: partnerId, receiverId: serviceId },
                    { senderId: serviceId, receiverId: partnerId }
                  ]
                }
              }
            ]).sort({ createdAt: -1 });
        
            // 4️⃣ Fetch company data
            const companyData = await companyModel.findOne({ serviceId: serviceId });
        
            // 5️⃣ Merge all relevant data
            const mergedJobData = {
              ...jobInit.toObject(),
              company: companyData,
              requestData: requestData[0] || null
            };
        
            // 6️⃣ Build placeholders
            const placeholders = {};
            const fieldCategories = [
              { fields: jobInit.initFields || [] },
              { fields: jobInit.allocationFields || [] },
              { fields: jobInit.agentFields || [] },
              { fields: jobInit.submitFields || [] }
            ];
        
            fieldCategories.forEach(category => {
              category.fields.forEach(field => {
                if (field?.fieldName) {
                  const placeholderKey = `{${field.fieldName}}`;
                  const placeholderValue = field.value !== undefined && field.value !== null ? field.value : "N/A";
                  placeholders[placeholderKey] = placeholderValue;
                }
              });
            });
        
            // 7️⃣ Replace placeholders in template
            let html = template.htmlContent;
            for (const [placeholder, value] of Object.entries(placeholders)) {
        
              let processedValue = value;
              if (typeof value === "string" && value.includes("\n")) {
                processedValue = value.split("\n").map(line => line.trim()).filter(Boolean).join("<br/>");
              }
              html = html.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), processedValue);
            }
        
            // 8️⃣ Format allocated and completed dates
            const formatDate = (date) => {
              if (!date) return '';
              const d = new Date(date);
              const day = String(d.getDate()).padStart(2, '0');
              const month = String(d.getMonth() + 1).padStart(2, '0');
              const year = d.getFullYear();
              return `${day}/${month}/${year}`;
            };
        
            const formattedAllocatedDate = formatDate(jobInit.allocatedDate);
            const formattedCompletedDate = formatDate(jobInit.completedDate);
        
            // 9️⃣ Replace additional placeholders
            html = html.replace(/{allocatedOfficeEmp}/g, jobInit?.allocatedOfficeEmp?.basicDetails?.fullName || '');
            html = html.replace(/{doneBy}/g, jobInit?.doneBy?.basicDetails?.fullName || '');
            html = html.replace(/{serviceName}/g, jobInit?.referServiceId?.serviceName || '');
            html = html.replace(/{reportType}/g, jobInit?.reportType?.productName || '');
            html = html.replace(/{partnerName}/g, jobInit?.partnerId?.fullName || '');
            html = html.replace(/{allocatedDate}/g, formattedAllocatedDate || '');
            html = html.replace(/{completedDate}/g, formattedCompletedDate || '');
            html = html.replace(/{charge}/g, jobInit?.charge || '');

      // Create plain text version
      const plainText =subject;
      
      // Email content
      const msg = {
        to: to,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL,
          name: 'Document Parser App' // Adding a sender name helps legitimacy
        },
        subject: subject,
        // text: plainText,
        html: html
      };

      await sgMail.send(msg);
      console.log('Email sent successfully via SendGrid');
      
      return true;
    } catch (error) {
      throw error;
    }
  }
};

export default emailService;