
const {
  serverValidation,
  success,
  notFound,
  badRequest,
  unknownError } = require('../../../../../globalHelper/response.globalHelper');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { validationResult } = require('express-validator');
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const ExcelJS = require("exceljs");
const { google } = require('googleapis');
const cron = require("node-cron");
const { GoogleAuth } = require('google-auth-library');
const credentials = require('../../../../../credential.json');
const liveCredentials = require('../../../../../liveSheet.json');
const employeModel = require('../../model/adminMaster/employe.model')
const newbranch = require("../../model/adminMaster/newBranch.model")
const collectionModel = require('../../model/collection/collectionSheet.model')
const visitModel = require('../../model/collection/visit.model')
const roleModel = require('../../model/adminMaster/role.model')
const attendenceModel = require("../../model/adminMaster/attendance.model")
const mailSwitchesModel = require("../../model/adminMaster/mailSwitches.model")
const baseUrl = process.env.BASE_URL;

const axios = require('axios')
const xlsx = require('xlsx');
const moment = require('moment');


// Utility: Send Employee Summary Email
async function sendVisitSummaryEmail({ to, name, totalVisits, totalCollections, totalReceivedAmount }) {
    try {
      const todayDate = new Date().toLocaleDateString("en-GB");
  
      const transporter = nodemailer.createTransport({
        host: process.env.COLLECTION_EMAIL_HOST,
        port: 465,
        secure: true,
        auth: {
          user: process.env.COLLECTION_EMAIL_USER,
          pass: process.env.COLLECTION_EMAIL_PASSWORD,
        },
        tls: { rejectUnauthorized: false },
      });
  
      const mailOptions = {
        from: process.env.COLLECTION_EMAIL_USER,
        to,
        cc: process.env.COLLECTION_CC_MAIL,
        subject: `Daily Visit and Collection Summary - ${todayDate}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <p>Dear <strong>${name}</strong>,</p>
            <p>Here is your visit and collection summary for <strong>${todayDate}</strong>:</p>
            
            <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px; width: 100%; margin-top: 15px; margin-bottom: 15px;">
              <thead>
                <tr style="background-color: #007BFF; color: white;">
                  <th>ACTIVITY</th>
                  <th>COUNT/AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total Visits Accepted</td>
                  <td><strong>${totalVisits}</strong></td>
                </tr>
                <tr>
                  <td>Total Collections Accepted</td>
                  <td><strong>${totalCollections}</strong></td>
                </tr>
                <tr>
                  <td>Total Amount Collected</td>
                  <td><strong>₹${totalReceivedAmount}</strong></td>
                </tr>
              </tbody>
            </table>
            
            <p>Keep up the great work!</p>
            <p>Best Regards,<br><strong>Fincoopers Team</strong></p>
          </div>
        `,
      };
  
      await transporter.sendMail(mailOptions);
      // console.log(`✅ Email sent to ${to}`);
      return true;
    } catch (error) {
      console.error("❌ Error sending email:", error);
      return false;
    }
  }

// Utility: Send Manager Report Email with HTML Table
async function sendManagerReportEmail(managerEmail, employeeList = []) {
    try {
      const todayDate = new Date().toLocaleDateString("en-GB");
    
      const transporter = nodemailer.createTransport({
        host: process.env.COLLECTION_EMAIL_HOST,
        port: 465,
        secure: true,
        auth: {
          user: process.env.COLLECTION_EMAIL_USER,
          pass: process.env.COLLECTION_EMAIL_PASSWORD,
        },
        tls: { rejectUnauthorized: false },
      });
    
      // Build HTML table with specific headers and blue background
      const tableHeaders = [
        "EMPLOYEE NAME", 
        "EMPLOYEE UNIQUE ID", 
        "TODAY VISIT", 
        "TODAY COLLECTION", 
        "TOTAL RECEIVED AMOUNT"
      ];
      
      const tableKeys = [
        "employeName", 
        "employeUniqueId", 
        "todayVisit", 
        "todayCollection", 
        "totalReceivedAmount"
      ];
      
      // Separate employees with zero activity
      const activeEmployees = [];
      const zeroActivityEmployees = [];
      
      employeeList.forEach(employee => {
        if ((employee.todayVisit || 0) + (employee.todayCollection || 0) === 0) {
          zeroActivityEmployees.push(employee);
        } else {
          activeEmployees.push(employee);
        }
      });
      
      // Main table for active employees
      const mainTable = `
        <h3>Team Activity Summary</h3>
        <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px; width: 100%;">
          <thead>
            <tr style="background-color: #007BFF; color: white;">
              ${tableHeaders.map(header => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${activeEmployees.length > 0 ? 
              activeEmployees.map(employee => `
                <tr>
                  <td>${employee.employeName || ''}</td>
                  <td>${employee.employeUniqueId || ''}</td>
                  <td>${employee.todayVisit || 0}</td>
                  <td>${employee.todayCollection || 0}</td>
                  <td>₹${employee.totalReceivedAmount || 0}</td>
                </tr>
              `).join('') : 
              `<tr><td colspan="5" style="text-align: center;">NO VISIT AND EMI RECEIVED TODAY</td></tr>`
            }
          </tbody>
        </table>
      `;
      
      // Zero activity table
      const zeroActivityTable = zeroActivityEmployees.length > 0 ? `
        <h3>Employees with No Activity Today</h3>
        <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px; width: 100%; margin-top: 20px;">
          <thead>
            <tr style="background-color: #FF4500; color: white;">
              <th>EMPLOYEE NAME</th>
              <th>EMPLOYEE UNIQUE ID</th>
              <th>TODAY VISIT</th>
              <th>TODAY COLLECTION</th>
              <th>TOTAL RECEIVED AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            ${zeroActivityEmployees.map(employee => `
              <tr>
                <td>${employee.employeName || ''}</td>
                <td>${employee.employeUniqueId || ''}</td>
                <td>${employee.todayVisit || 0}</td>
                  <td>${employee.todayCollection || 0}</td>
                  <td>₹${employee.totalReceivedAmount || 0}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '';
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <p>Dear Manager,</p>
          <p>Sharing your team's visit and collection report as of <strong>${todayDate}</strong>.</p>
          <p>Please review the details below:</p>
          ${mainTable}
          ${zeroActivityTable}
          <br/>
          <p>Thank you for your continued support.<br/>Best Regards,<br/><strong>Fincoopers Team</strong></p>
        </div>
      `;
    
      const mailOptions = {
        from: process.env.COLLECTION_EMAIL_USER,
        to: managerEmail,
        cc: process.env.COLLECTION_CC_MAIL,
        subject: `Team Visit And Collection Summary Report - ${todayDate}`,
        html: htmlContent,
      };
    
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("❌ Error sending manager email:", error);
      return false;
    }
  }
  

//  Schedule for 6:00 PM IST (12:30 PM UTC)
  cron.schedule("30 12 * * *", async () => {
    const visitCollection = await mailSwitchesModel.findOne()
    if(visitCollection.masterMailStatus && visitCollection.collectionMail  && visitCollection.collectionVisitMailEvening){
      await visitAndCollectionMailSend();
    }
  });

  async function visitAndCollectionMailSend() {
    try {
      const todayStart = new Date().setHours(0, 0, 0, 0);
      const todayEnd = new Date().setHours(23, 59, 59, 999);
  
      const collectionRole = await roleModel.findOne({ roleName: "collection" });
      if (!collectionRole) return 
  
      const employees = await employeModel.find({
        status: "active",
        roleId: { $in: [collectionRole._id] },
      });
  
      if (employees.length === 0) {
        return 
      }
  
      const managerMap = {};
  
      for (const employee of employees) {
        const manager = await employeModel.findById(employee.reportingManagerId);
  
        // Group employees under each manager
        if (manager?.workEmail) {
          if (!managerMap[manager.workEmail]) {
            managerMap[manager.workEmail] = [];
          }
        }
  
        // Count visits
        const visitCount = await visitModel.countDocuments({
          visitBy: `${employee.employeName}-${employee.employeUniqueId}`,
          status: "accept",
          createdAt: { $gte: todayStart, $lte: todayEnd },
        });
  
        // Count collections
        const collectionCount = await collectionModel.countDocuments({
          collectedBy: `${employee.employeName}-${employee.employeUniqueId}`,
          status: "accept",
          createdAt: { $gte: todayStart, $lte: todayEnd },
        });
  
        // Sum amount
        const collectionSumResult = await collectionModel.aggregate([
          {
            $match: {
              collectedBy: `${employee.employeName}-${employee.employeUniqueId}`,
              status: "accept",
              createdAt: { $gte: new Date(todayStart), $lte: new Date(todayEnd) },
            },
          },
          {
            $group: {
              _id: null,
              totalReceivedAmount: { $sum: "$receivedAmount" },
            },
          },
        ]);
  
        const receivedAmount = collectionSumResult[0]?.totalReceivedAmount || 0;
        
        // Store the employee data with visit and collection info
        const enrichedEmployeeData = {
          employeName: employee.employeName,
          employeUniqueId: employee.employeUniqueId,
          todayVisit: visitCount,
          todayCollection: collectionCount,
          totalReceivedAmount: receivedAmount
        };
        
        // Add enriched employee data to manager's list
        if (manager?.workEmail) {
          managerMap[manager.workEmail].push(enrichedEmployeeData);
        }
  
        // Send mail to employee (no CC to manager)
        await sendVisitSummaryEmail({
          to: employee.workEmail,
          name: employee.employeName,
          totalVisits: visitCount,
          totalCollections: collectionCount,
          totalReceivedAmount: receivedAmount,
        });
      }
  
      // Send email to each manager with their team's data
      for (const [managerEmail, empList] of Object.entries(managerMap)) {
        if (empList.length > 0) {
          await sendManagerReportEmail(managerEmail, empList);
        }
      }
  console.log("mail sent------")
      // success(res, "All collection emails sent successfully");
    } catch (error) {
      console.error("❌ Error in visitAndCollectionMailSend:", error.message);
      return 
    }
  }

// ---------SEND MAIL WHEN TODAYS 5 COUNT TARGET NOT COMPLETE-------------------
async function sendTargetNotMetEmail({ to, name, visitCount, collectionCount }) {
    try {
      const todayDate = new Date().toLocaleDateString("en-GB");
  
      const transporter = nodemailer.createTransport({
        host: process.env.COLLECTION_EMAIL_HOST,
        port: 465,
        secure: true,
        auth: {
          user: process.env.COLLECTION_EMAIL_USER,
          pass: process.env.COLLECTION_EMAIL_PASSWORD,
        },
        tls: { rejectUnauthorized: false },
      });
  
      // Create HTML table with blue header
      const targetTable = `
        <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px; width: 100%; margin-top: 15px; margin-bottom: 15px;">
          <thead>
            <tr style="background-color: #007BFF; color: white;">
              <th>ACTIVITY</th>
              <th>COUNT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Total Visits Done</td>
              <td><strong>${visitCount}</strong></td>
            </tr>
            <tr>
              <td>Total Collections Done</td>
              <td><strong>${collectionCount}</strong></td>
            </tr>
            <tr style="background-color: #f2f2f2;">
              <td><strong>Total (Visits + Collections)</strong></td>
              <td><strong>${visitCount + collectionCount}</strong></td>
            </tr>
          </tbody>
        </table>
      `;
  
      const mailOptions = {
        from: process.env.COLLECTION_EMAIL_USER,
        to,
        cc: process.env.COLLECTION_CC_MAIL,
        subject: `⚠️ Reminder: Today's Target Not Completed - ${todayDate}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <p>Hi <strong>${name}</strong>,</p>
            <p>This is a reminder that you haven't completed your target for today [${todayDate}].</p>
            
            ${targetTable}
            
            <p>You need to complete at least <strong>5</strong> visits or collections in total.</p>
            <p>Please try to finish your work for the day.</p>
            <p>Best Regards,<br><strong>Fincoopers Team</strong></p>
          </div>
        `,
      };
  
      await transporter.sendMail(mailOptions);
      // console.log(`⚠️ Target not met email sent to ${to}`);
      return true;
    } catch (error) {
      console.error("❌ Error sending target email:", error.message);
      return false;
    }
  }

  //  Schedule for 6:00 PM IST (12:30 PM UTC)
  cron.schedule("30 12 * * *", async () => {
    const sendTargetNotCompleted = await mailSwitchesModel.findOne()
    if(sendTargetNotCompleted.masterMailStatus && sendTargetNotCompleted.collectionMail  && sendTargetNotCompleted.collectionTargetIncompleteMailEvening){
      await sendTargetNotCompletedMails();
    }
  });



async function sendTargetNotCompletedMails() {
  try {

    const todayStart = new Date().setHours(0, 0, 0, 0);
    const todayEnd = new Date().setHours(23, 59, 59, 999);

    const collectionRole = await roleModel.findOne({ roleName: "collection" });
    if (!collectionRole) return 

    const employees = await employeModel.find({
      status: "active",
      roleId: { $in: [collectionRole._id] },
    });

    if (employees.length === 0) {
      return 
    }

    for (const employee of employees) {
      const identifier = `${employee.employeName}-${employee.employeUniqueId}`;

      const visitCount = await visitModel.countDocuments({
        visitBy: identifier,
        status: "accept",
        createdAt: { $gte: todayStart, $lte: todayEnd },
      });

      const collectionCount = await collectionModel.countDocuments({
        collectedBy: identifier,
        status: "accept",
        createdAt: { $gte: todayStart, $lte: todayEnd },
      });

      const total = visitCount + collectionCount;

      if (total < 5) {
        await sendTargetNotMetEmail({
          to: employee.workEmail,
          name: employee.employeName,
          visitCount,
          collectionCount,
        });
      }
    }

    // return success(res, "Target not met emails sent successfully");
  } catch (error) {
    console.error("❌ Error in sendTargetNotCompletedMails:", error.message);
    // return unknownError(res, error.message);
  }
}

// ----------SEND WARNING MAIL WHEN LAST 3DAYS 0 VISIT AND 0 COLLECTION---------------
async function sendWarningEmail({ to, name }) {
    try {
      const todayDate = new Date().toLocaleDateString("en-GB");
  
      const transporter = nodemailer.createTransport({
        host: process.env.COLLECTION_EMAIL_HOST,
        port: 465,
        secure: true,
        auth: {
          user: process.env.COLLECTION_EMAIL_USER,
          pass: process.env.COLLECTION_EMAIL_PASSWORD,
        },
        tls: { rejectUnauthorized: false },
      });
  
      const mailOptions = {
        from: process.env.COLLECTION_EMAIL_USER,
        to,
        cc: process.env.COLLECTION_CC_MAIL,
        subject: `⚠️ WARNING: No Collection Activity in Last 3 Days - ${todayDate}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <p>Hi <strong>${name}</strong>,</p>
            <p><strong>This is a warning!</strong> You have not performed any visit or collection activity in the last <strong>3 days</strong>.</p>
            <p><strong>Please ensure you complete your EMI collections and visit tasks immediately.</strong></p>
            <p>If no action is taken, further steps may be considered against you.</p>
            <p>Best Regards,<br><strong>Fincoopers Team</strong></p>
          </div>
        `,
      };
  
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("❌ Error sending warning email:", error.message);
    }
  }

  //  Schedule for 6:00 PM IST (12:30 PM UTC)
  cron.schedule("30 12 * * *", async () => {
    const zeroVisitZeroEmi = await mailSwitchesModel.findOne()
    if(zeroVisitZeroEmi.masterMailStatus && zeroVisitZeroEmi.collectionMail  && zeroVisitZeroEmi.collectionZeroVisitEmiWarningsMailEvening){
      await zeroVisitZeroEmiWarningMail();
    }
  });

  //  Schedule for 11:00 PM IST 
  cron.schedule("30 05 * * *", async () => {
    const zeroVisitZeroEmi = await mailSwitchesModel.findOne()
    if(zeroVisitZeroEmi.masterMailStatus && zeroVisitZeroEmi.collectionMail  && zeroVisitZeroEmi.collectionZeroVisitEmiWarningsMailMorning){
      await zeroVisitZeroEmiWarningMail();
    }
  });

  async function zeroVisitZeroEmiWarningMail() {
    try {
      console.log('mail run')
      const today = new Date();
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(today.getDate() - 2); // includes today, so 3-day range
  
      const start = new Date(threeDaysAgo.setHours(0, 0, 0, 0));
      const end = new Date(today.setHours(23, 59, 59, 999));
  
      const collectionRole = await roleModel.findOne({ roleName: "collection" });
      if (!collectionRole) return 
  
      const employees = await employeModel.find({
        status: "active",
        roleId: { $in: [collectionRole._id] },
      });
  
      if (employees.length === 0) {
        return 
      }
  
      for (const employee of employees) {
        const identifier = `${employee.employeName}-${employee.employeUniqueId}`;
  
        const visitCount = await visitModel.countDocuments({
          visitBy: identifier,
          status: "accept",
          createdAt: { $gte: start, $lte: end },
        });
  
        const collectionCount = await collectionModel.countDocuments({
          collectedBy: identifier,
          status: "accept",
          createdAt: { $gte: start, $lte: end },
        });
  
        if (visitCount === 0 && collectionCount === 0) {
          await sendWarningEmail({
            to: employee.workEmail,
            name: employee.employeName,
          });
        }
      }
  
      // return success(res, "Warning emails sent successfully for 0 activity in last 3 days");
    } catch (error) {
      console.error("❌ Error in sendTargetNotCompletedMails:", error.message);
      // return unknownError(res, error.message);
    }
  }
  

// ----------------** REVISIT MAIL SEND TO EMPLOYEE **--------------------
async function getGoogleSheetData() {
    try {
      const spreadsheetId = process.env.VISIT_GOOGLE_SHEET_KEY;
      const sheetName = process.env.EMIOVERALL_SHEET;
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });
      const authClient = await auth.getClient();
      const sheets = google.sheets({ version: "v4", auth: authClient });
  
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: sheetName,
      });
  
      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        throw new Error("No data found.");
      }
  
      const headers = rows[0];
      const data = rows.slice(1).map((row) => {
        let obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] !== undefined ? row[index] : null;
        });
        return obj;
      });
  
      return data;
    } catch (error) {
      console.error("Error fetching Google Sheet data:", error.message);
      throw error;
    }
  }
  
  function buildHtmlTable(data) {
    let html = `
      <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif;">
        <thead>
          <tr style="background-color: #007BFF; color: white;">
            <th style="padding: 8px; border: 1px solid #ccc;">LD</th>
            <th style="padding: 8px; border: 1px solid #ccc;">CUSTOMER NAME</th>
            <th style="padding: 8px; border: 1px solid #ccc;">MOBILE</th>
          </tr>
        </thead>
        <tbody>
    `;
  
    data.forEach(row => {
      html += `
        <tr>
          <td style="padding: 8px; border: 1px solid #ccc;">${row.LD}</td>
          <td style="padding: 8px; border: 1px solid #ccc;">${row.customerName}</td>
          <td style="padding: 8px; border: 1px solid #ccc;">${row.mobile}</td>
        </tr>
      `;
    });
  
    html += `
        </tbody>
      </table>
    `;
  
    return html;
  }
  
  async function sendRevisitMail({ to, name, customerTable }) {
    try {
      const todayDate = new Date().toLocaleDateString("en-GB");
  
      const transporter = nodemailer.createTransport({
        host: process.env.COLLECTION_EMAIL_HOST,
        port: 465,
        secure: true,
        auth: {
          user: process.env.COLLECTION_EMAIL_USER,
          pass: process.env.COLLECTION_EMAIL_PASSWORD,
        },
        tls: { rejectUnauthorized: false },
      });
  
      const mailOptions = {
        from: process.env.COLLECTION_EMAIL_USER,
        to,
        cc: process.env.COLLECTION_CC_MAIL,
        subject: `🚨 Revisit Reminder - Customers with NET DUE - ${todayDate}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Please revisit the following customers today as per your revisit schedule. They have pending NET DUE amounts:</p>
            ${customerTable}
            <p>Kindly take appropriate follow-up and update the records.</p>
            <p>Regards,<br><strong>Fincoopers Team</strong></p>
          </div>
        `,
      };
  
      await transporter.sendMail(mailOptions);
      console.log(`📧 Revisit reminder sent to ${to}`);
    } catch (error) {
      console.error("❌ Error sending revisit reminder:", error.message);
    }
  }
  


  cron.schedule("30 12 * * *", async () => {
    const sendRevisitReminder = await mailSwitchesModel.findOne()
    if(sendRevisitReminder.masterMailStatus && sendRevisitReminder.collectionMail  && sendRevisitReminder.collectionRevisitRemindersMailEvening){
      await sendRevisitReminderMails();
    }
  });


  async function sendRevisitReminderMails() {
    try {
      const today = new Date().toISOString().split("T")[0];
  
      const visits = await visitModel.find({ revisitDate: today });
      if (!visits.length) {
        return
        // success(res, "No revisit records for today");
      }
  
      const sheetData = await getGoogleSheetData();
      const employeeMap = {};
  
      for (const visit of visits) {
        const ld = visit.LD;
        const customer = sheetData.find(
          (row) => row["LD"] === ld && parseFloat(row["NET DUE"]) > 0
        );
  
        if (customer) {
          const [employeName, employeUniqueId] = visit.visitBy.split("-");
          const key = `${employeName}-${employeUniqueId}`;
          const mobile = customer["MOBILE"] || visit.newContactNumber || "N/A";
  
          if (!employeeMap[key]) {
            employeeMap[key] = {
              name: employeName,
              ldList: [],
              email: null,
            };
  
            const employee = await employeModel.findOne({
              employeName,
              employeUniqueId,
            });
  
            if (employee && employee.workEmail) {
              employeeMap[key].email = employee.workEmail;
            }
          }
  
          employeeMap[key].ldList.push({
            LD: ld,
            customerName: customer["CUSTOMER NAME"] || visit.customerName,
            mobile,
          });
        }
      }
  
      for (const key in employeeMap) {
        const { name, email, ldList } = employeeMap[key];
        if (email && ldList.length > 0) {
          const customerTable = buildHtmlTable(ldList);
          await sendRevisitMail({ to: email, name, customerTable });
        }
      }
  console.log("mail sent------")
      
     // return success(res, "Revisit reminder emails sent successfully");
    } catch (error) {
      console.error("❌ Error in sendRevisitReminderMails:", error.message);
      // return unknownError(res, error.message);
    }
  }
  

  //-----------PARTNER WISE TOTAL COLLECTION COUNT FOR PENDING-------------------
  async function sendPartnerWiseCollectionSummary() {
    try {
      console.log("Starting partner-wise collection summary generation...");
  
      // 1. Retrieve data from Google Sheet
      const sheetData = await getGoogleSheetData();
      console.log(`Retrieved ${sheetData.length} rows from Google Sheet`);
  
      // 2. Identify the correct allocation and partner field names
      const allocationField = identifyFieldName(sheetData[0], ["Allocation 1 emp id"]);
      const partnerField = identifyFieldName(sheetData[0], ["PATNER", "PARTNER", "PATNER NAME", "PARTNER NAME"]);
  
      if (!allocationField || !partnerField) {
        console.error("Required fields not found in the sheet data.");
        return;
      }
  
      // 3. Fetch all active employees with the 'collection' role
      const collectionRole = await roleModel.findOne({ roleName: "collection" });
      if (!collectionRole) {
        console.log("No collection role found");
        return;
      }
  
      const collectionEmployees = await employeModel.find({
        roleId: { $in: [collectionRole._id] },
        status: "active",
      });
  
      if (collectionEmployees.length === 0) {
        console.log("No active employees with collection role found");
        return;
      }
  
      // 4. Create a map of employee unique IDs to their names and emails
      const employeeMap = {};
      collectionEmployees.forEach((emp) => {
        employeeMap[emp.employeUniqueId] = {
          name: emp.employeName,
          email: emp.email,
          employeUniqueId: emp.employeUniqueId,
        };
      });
  
      // 5. Aggregate partner-wise data for each employee, ensuring unique LD per emp-partner
      const employeePartnerData = {};
      const processedLDs = {}; // To track unique LDs per emp-partner
  
      for (const emp of collectionEmployees) {
        const { employeUniqueId } = emp;
  
        const filteredData = sheetData.filter(row => {
          const netDue = parseFloat(String(row["NET DUE"] || "0").replace(/,/g, ""));
          const allocationValue = row[allocationField];
          const matches = allocationValue && new RegExp(employeUniqueId, 'i').test(allocationValue);
          return matches && netDue > 0;
        });
  
        filteredData.forEach(row => {
          const netDue = parseFloat(String(row["NET DUE"] || "0").replace(/,/g, ""));
          const ld = row["LD"];
          const partnerName = row[partnerField] || "NO PARTNER NAME";
  
          if (!ld) return;
  
          if (!processedLDs[employeUniqueId]) processedLDs[employeUniqueId] = {};
          if (!processedLDs[employeUniqueId][partnerName]) processedLDs[employeUniqueId][partnerName] = new Set();
  
          if (processedLDs[employeUniqueId][partnerName].has(ld)) return;
          processedLDs[employeUniqueId][partnerName].add(ld);
  
          if (!employeePartnerData[employeUniqueId]) employeePartnerData[employeUniqueId] = {};
          if (!employeePartnerData[employeUniqueId][partnerName]) {
            employeePartnerData[employeUniqueId][partnerName] = {
              customerCount: 0,
              totalNetDue: 0,
            };
          }
  
          employeePartnerData[employeUniqueId][partnerName].customerCount += 1;
          employeePartnerData[employeUniqueId][partnerName].totalNetDue += netDue;
        });
      }
  
      // 6. Send personalized emails to each employee
      for (const [empId, partnerData] of Object.entries(employeePartnerData)) {
        const { name, email, employeUniqueId } = employeeMap[empId];
        const fullName = `Hii ${name}-${employeUniqueId}`;
        const emailContent = buildPartnerWiseCollectionTable(partnerData, fullName);
        await partnerWiseMail(email, fullName, emailContent);
        console.log(`Email sent to ${fullName} (${email})`);
      }
  
      return true;
    } catch (error) {
      console.error("Error in sendPartnerWiseCollectionSummary:", error);
    }
  }
  
  function identifyFieldName(row, possibleFields) {
    const keys = Object.keys(row);
    for (const field of possibleFields) {
      const foundKey = keys.find(
        (key) => key.toLowerCase() === field.toLowerCase()
      );
      if (foundKey) return foundKey;
    }
    return null;
  }
  
  
  function buildPartnerWiseCollectionTable(partnerData, employeeFullName) {
    let html = `
      <p>${employeeFullName},</p>
      <p>Here is your partner-wise collection summary:</p>
      <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #007BFF; color: white; text-align: center;">
            <th colspan="3" style="padding: 12px; border: 1px solid #ccc; font-size: 16px;">
              Pending Collection Amount
            </th>
          </tr>
          <tr style="background-color: #0056b3; color: white;">
            <th style="padding: 8px; border: 1px solid #ccc;">Partner</th>
            <th style="padding: 8px; border: 1px solid #ccc;">Customer Count</th>
            <th style="padding: 8px; border: 1px solid #ccc;">Total Net Due</th>
          </tr>
        </thead>
        <tbody>
    `;
  
    let totalCustomers = 0;
    let grandTotalNetDue = 0;
  
    for (const [partnerName, data] of Object.entries(partnerData)) {
      totalCustomers += data.customerCount;
      grandTotalNetDue += data.totalNetDue;
  
      html += `
        <tr>
          <td style="padding: 8px; border: 1px solid #ccc; font-weight: bold;">${partnerName}</td>
          <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${data.customerCount}</td>
          <td style="padding: 8px; border: 1px solid #ccc; text-align: right; font-weight: bold;">₹${data.totalNetDue.toFixed(2)}</td>
        </tr>
      `;
    }
  
    html += `
        <tr style="background-color: #f2f2f2;">
          <td style="padding: 8px; border: 1px solid #ccc; font-weight: bold;">TOTAL</td>
          <td style="padding: 8px; border: 1px solid #ccc; text-align: center; font-weight: bold;">${totalCustomers}</td>
          <td style="padding: 8px; border: 1px solid #ccc; text-align: right; font-weight: bold;">₹${grandTotalNetDue.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
    <p>Please ensure timely follow-up with all partners for collections.</p>
    <p>Regards,<br><strong>Fincoopers Team</strong></p>
    `;
  
    return html;
  }
  
  async function partnerWiseMail(to, employeeFullName, htmlContent) {
    const transporter = nodemailer.createTransport({
      host: process.env.COLLECTION_EMAIL_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.COLLECTION_EMAIL_USER,
        pass: process.env.COLLECTION_EMAIL_PASSWORD,
      },
      tls: { rejectUnauthorized: false },
    });
  
    const todayDate = new Date().toLocaleDateString("en-GB");
  
    const mailOptions = {
      from: process.env.COLLECTION_EMAIL_USER,
      to,
      subject: `🔔 Partner-Wise Collection Summary - ${todayDate}`,
      html: htmlContent,
    };
  
    await transporter.sendMail(mailOptions);
  }
  

  cron.schedule("30 12 * * *", async () => {
    const mailDetail = await mailSwitchesModel.findOne()
    if(mailDetail.masterMailStatus && mailDetail.collectionMail  && mailDetail.collectionPatnerWiseMailEvening){
      await sendPartnerWiseCollectionSummary();
    }
  });
  

module.exports = {
    visitAndCollectionMailSend,
    sendTargetNotCompletedMails,
    zeroVisitZeroEmiWarningMail,
    sendRevisitReminderMails,
    sendPartnerWiseCollectionSummary
    }