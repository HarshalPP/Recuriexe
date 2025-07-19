
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
const GoogleSheetCustomerModel = require("../../model/collection/googleSheetCustomer.model")
const modeOfCollectionModel = require('../../model/adminMaster/modeOfCollection.model')
const employeModel = require('../../model/adminMaster/employe.model')
const newbranch = require("../../model/adminMaster/newBranch.model")
const collectionModel = require('../../model/collection/collectionSheet.model')
const visitModel = require('../../model/collection/visit.model')
const okcreditModel = require('../../model/adminMaster/okCredit.model')
const bankNameModel = require('../../model/adminMaster/bank.model')
const lenderModel = require('../../model/lender.model')
const legalNoticeModel = require('../../model/adminMaster/legalNotice.model')
const callDoneModel = require('../../model/collection/callDone.model');
const roleModel = require('../../model/adminMaster/role.model')
const dropDownModel = require('../../model/adminMaster/dropdown.model')
const totalCashModel = require('../../model/collection/totalCashBalance.model')
const attendenceModel = require("../../model/adminMaster/attendance.model")
const baseUrl = process.env.BASE_URL;
const {sendEmail} = require("../functions.Controller")
const axios = require('axios')
const { Buffer } = require('buffer');
const xlsx = require('xlsx');
const moment = require('moment');
const {collectionGoogleSheet,emiRejectGoogleSheet, approvalGoogleSheet} = require("../visitGoogleSheet.controller");
const { callbackify } = require('util');
const stream = require('stream');
const uploadToSpaces = require('../../services/spaces.service'); // Import the upload function
const sgMail  = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const { SendMailClient } = require("zeptomail");

const url = "api.zeptomail.in/";
const token = "Zoho-enczapikey PHtE6r1cS+nqizR58hUDtve6EM+tMNkrq7hiK1VPsotLW/YLS01Rr4ojwGW1o0giXfITEvbNnN1rtu7K5e3WdmnvM29OWWqyqK3sx/VYSPOZsbq6x00YtVkYcELcVo/ucNNq0CPfuNaX"; // use env for security
const mime = require('mime-types'); // Ensure this is installed via npm

const client = new SendMailClient({ url, token });

// Basic email validation
function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


// --------------Pagination Function------------------------------------
async function paginateAggregate(model, pipeline = [], page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;

    // Create count pipeline by taking match stages from original pipeline
    const countPipeline = pipeline.filter(stage => 
      Object.keys(stage)[0] === '$match'
    );
    countPipeline.push({ $count: 'total' });

    // Add pagination to the main pipeline
    const dataPipeline = [...pipeline, { $skip: skip }, { $limit: limit }];

    // Execute both pipelines
    const [countResult, data] = await Promise.all([
      model.aggregate(countPipeline),
      model.aggregate(dataPipeline)
    ]);

    const total = countResult[0]?.total || 0;

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        recordsPerPage: limit
      }
    };
  } catch (error) {
    throw error;
  }
}
// ---------------------Pagination Function End-------------------------------------  


async function sendEmails(ccEmails , userEmail, subject, html, attachment) {
try {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  userEmail = userEmail ? (Array.isArray(userEmail) ? userEmail : [userEmail]) : [];
  ccEmails = ccEmails ? (Array.isArray(ccEmails) ? ccEmails : [ccEmails]) : [];
  
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: userEmail.join(',') , 
    cc: ccEmails ? ccEmails.join(',') : undefined, 
    subject: subject,
    html: html,
    attachments: attachment, 

  });

  return true;
} catch (error) {
  console.log(error);
  console.error('Error sending email:', error.message);
   return false;
}
}

// ---------------------------------EMI PDF CREATE CODE------------------------------------------------
async function createEmiReceiptPdfIndia(data, receiptNo) {
const timestamp = Date.now();
const sanitizedCustomerName = data.customerName.replace(/[^a-zA-Z0-9]/g, '-');
const bucketName = 'finexe';
const pdfFilename = `${process.env.PATH_BUCKET}/LOS/PDF/${sanitizedCustomerName}-${data.LD}-${timestamp}.pdf`;

// Create a buffer stream for the PDF
const bufferStream = new stream.PassThrough();
const doc = new PDFDocument({ margin: 50, size: 'A4' });
doc.pipe(bufferStream);

// Add header
doc.image('src/v1/api/controller/finCooper.png', 50, 45, { width: 100 })
  .fontSize(22).font('Helvetica-Bold').text('FIN COOPERS INDIA PVT. LTD', 160, 50, { align: 'center' })
  .fontSize(16).text('CIN:U74140MP2019PTC048765', 160, 80, { align: 'center' })
  .fontSize(10).font('Helvetica').text('Registered Office: 207-210, Diamond Trade Center, 11 bungalow', 160, 105, { align: 'center' })
  .text('colony, near Hukumchand Ghantaghar marg, Indore', 160, 120, { align: 'center' })
  .text('(M.P.)-452001', 160, 135, { align: 'center' });

// Add EMI Receipt title
doc.fontSize(18).font('Helvetica-Bold').text('EMI Receipt', 50, 180, { align: 'center' });

// Add table
const tableTop = 220;
const tableLeft = 50;
const tableRight = 550;
const rowHeight = 30;
const colWidth = (tableRight - tableLeft) / 2;

const tableData = [
  { label: 'Receipt No.', value: receiptNo },
  { label: 'Collected By', value: data.collectedBy },
  { label: 'LD', value: data.LD },
  { label: 'Customer Name', value: data.customerName },
  { label: 'Mobile No', value: data.mobileNo },
  { label: 'Email', value: data.customerEmail },
  { label: 'Date', value: data.emiReceivedDate },
  { label: 'EMI Amount', value: data.receivedAmount },
  { label: 'Transaction ID', value: data.transactionId },
];

doc.lineWidth(1);
tableData.forEach((row, i) => {
  const y = tableTop + i * rowHeight;

  doc.rect(tableLeft, y, colWidth, rowHeight).stroke();
  doc.rect(tableLeft + colWidth, y, colWidth, rowHeight).stroke();

  doc.fontSize(10).font('Helvetica')
    .text(row.label, tableLeft + 5, y + 10)
    .text(row.value, tableLeft + colWidth + 5, y + 10);
});

// Add note
const noteTop = tableTop + tableData.length * rowHeight + 20;
doc.fontSize(12).font('Helvetica-Bold').text('NOTE', 50, noteTop);
doc.fontSize(10).font('Helvetica')
  .text('1. EMI IS COLLECTED ON BEHALF OF BANK/NBFC', 70, noteTop + 20)
  .text('2. RECEIPT WILL UPDATE TO YOUR LOAN ACCOUNT ONCE EMI RECEIVED IS CONFIRMED', 70, noteTop + 35)
  .text('3. THIS IS SYSTEM GENERATED RECEIPT NO SIGNATURE REQUIRED', 70, noteTop + 50);
doc.end();

// Convert the stream to a buffer
const chunks = [];
for await (const chunk of bufferStream) {
  chunks.push(chunk);
}
const pdfBuffer = Buffer.concat(chunks);

// Upload to DigitalOcean Spaces
const url = await uploadToSpaces(bucketName, pdfFilename, pdfBuffer, 'public-read', 'application/pdf');

const fileUrl = `https://cdn.fincooper.in/${pdfFilename}`
return fileUrl; 
}

async function createEmiReceiptPdfCapital(data, receiptNo) {
  const timestamp = Date.now();
  const sanitizedCustomerName = data.customerName.replace(/[^a-zA-Z0-9]/g, '-');
  const bucketName = 'finexe';
  const pdfFilename = `${process.env.PATH_BUCKET}/LOS/PDF/${sanitizedCustomerName}-${data.LD}-${timestamp}.pdf`;
  
  // Create a buffer stream for the PDF
  const bufferStream = new stream.PassThrough();
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  doc.pipe(bufferStream);
  
  // Add header
 doc.image('src/v1/api/controller/FINCOOPERS_CAPITAL.png', 260, 0, { width: 400, height: 150})
   .fontSize(16).font('Helvetica-Bold').text('FIN COOPERS CAPITAL PVT. LTD', 17, 30)
   .fontSize(11).text('CIN:67120MP1994PTC008686', 17, 50)
   .fontSize(10).font('Helvetica').text('Registered Office: 207-210, Diamond Trade Center, 11', 17, 70)
   .text('Bungalow Colony, Near Hukumchand Ghantaghar Marg,', 17, 85)
   .text('Indore (M.P.)-452001', 17, 100);

// Add EMI Receipt title
doc.fontSize(18).font('Helvetica-Bold').text('EMI Receipt', 0, 180, { align: 'center' });

// Add tabledddddsa 
const tableTop = 220;
const tableLeft = 50;
const tableRight = 550;
const rowHeight = 30;
const colWidth = (tableRight - tableLeft) / 2;
  
  const tableData = [
    { label: 'Receipt No.', value: receiptNo },
    { label: 'Collected By', value: data.collectedBy },
    { label: 'LD', value: data.LD },
    { label: 'Customer Name', value: data.customerName },
    { label: 'Mobile No', value: data.mobileNo },
    { label: 'Email', value: data.customerEmail },
    { label: 'Date', value: data.emiReceivedDate },
    { label: 'EMI Amount', value: data.receivedAmount },
    { label: 'Transaction ID', value: data.transactionId },
  ];
  
  doc.lineWidth(1);
  tableData.forEach((row, i) => {
    const y = tableTop + i * rowHeight;
  
    doc.rect(tableLeft, y, colWidth, rowHeight).stroke();
    doc.rect(tableLeft + colWidth, y, colWidth, rowHeight).stroke();
  
    doc.fontSize(10).font('Helvetica')
      .text(row.label, tableLeft + 5, y + 10)
      .text(row.value, tableLeft + colWidth + 5, y + 10);
  });
  
  // Add note
  const noteTop = tableTop + tableData.length * rowHeight + 20;
  doc.fontSize(12).font('Helvetica-Bold').text('NOTE', 50, noteTop);
  doc.fontSize(10).font('Helvetica')
    .text('1. EMI IS COLLECTED ON BEHALF OF BANK/NBFC', 70, noteTop + 20)
    .text('2. RECEIPT WILL UPDATE TO YOUR LOAN ACCOUNT ONCE EMI RECEIVED IS CONFIRMED', 70, noteTop + 35)
    .text('3. THIS IS SYSTEM GENERATED RECEIPT NO SIGNATURE REQUIRED', 70, noteTop + 50);
  doc.end();
  
  // Convert the stream to a buffer
  const chunks = [];
  for await (const chunk of bufferStream) {
    chunks.push(chunk);
  }
  const pdfBuffer = Buffer.concat(chunks);
  
  // Upload to DigitalOcean Spaces
  const url = await uploadToSpaces(bucketName, pdfFilename, pdfBuffer, 'public-read', 'application/pdf');
  
  const fileUrl = `https://cdn.fincooper.in/${pdfFilename}`
  return fileUrl; 
  }


// async function createEmiReceiptPdf(data, receiptNo) {
//   const timestamp = Date.now();
//   const sanitizedCustomerName = data.customerName.replace(/[^a-zA-Z0-9]/g, '-');
//   const bucketName = 'finexe';
//   const pdfFilename = `${process.env.PATH_BUCKET}/LOS/PDF/${sanitizedCustomerName}-${data.LD}-${timestamp}.pdf`;
//   const bufferStream = new stream.PassThrough();
//   const doc = new PDFDocument({ margin: 50, size: 'A4' });
//   doc.pipe(bufferStream);
//   const pageWidth = doc.page.width;
//   const pageHeight = doc.page.height;
//   // ✅ Single Watermark Centered at 45 Degrees
//   doc.save();
//   doc.fillColor('#e0e0e0')
//      .fontSize(80)
//      .rotate(45, { origin: [pageWidth / 2, pageHeight / 2] })
//      .text('Fin coopers', pageWidth / 2 - 200, pageHeight / 2 - 50, {
//        align: 'center',
//        width: 400,
//      });
//   doc.restore();
//   // ✅ Header section
//   doc.image('src/v1/api/controller/finCooper.png', 50, 45, { width: 100 })
//     .fontSize(22).font('Helvetica-Bold').text('FIN COOPERS INDIA PVT. LTD', 160, 50, { align: 'center' })
//     .fontSize(16).text('CIN: U74140MP2019PTC048765', 160, 80, { align: 'center' })
//     .fontSize(10).font('Helvetica').text('Registered Office: 207-210, Diamond Trade Center, 11 bungalow', 160, 105, { align: 'center' })
//     .text('colony, near Hukumchand Ghantaghar marg, Indore', 160, 120, { align: 'center' })
//     .text('(M.P.)-452001', 160, 135, { align: 'center' });
//   // ✅ EMI Receipt title
//   doc.fontSize(18).font('Helvetica-Bold').text('EMI Receipt', 50, 180, { align: 'center' });
//   // ✅ Table Data
//   const tableTop = 220;
//   const tableLeft = 50;
//   const tableRight = 550;
//   const rowHeight = 30;
//   const colWidth = (tableRight - tableLeft) / 2;
//   const tableData = [
//     { label: 'Receipt No.', value: receiptNo },
//     { label: 'Collected By', value: data.collectedBy },
//     { label: 'LD', value: data.LD },
//     { label: 'Customer Name', value: data.customerName },
//     { label: 'Mobile No', value: data.mobileNo },
//     { label: 'Email', value: data.customerEmail },
//     { label: 'Date', value: data.emiReceivedDate },
//     { label: 'EMI Amount', value: data.receivedAmount },
//     { label: 'Transaction ID', value: data.transactionId },
//   ];
//   // ✅ Grey Logo in Middle of Table
//   doc.save();
//   doc.opacity(0.1);
//   doc.image('src/v1/api/controller/finCooper.png',
//     (pageWidth - 150) / 2,
//     tableTop + 50,
//     { width: 150 }
//   );
//   doc.restore();
//   // ✅ Draw Table
//   doc.lineWidth(1);
//   tableData.forEach((row, i) => {
//     const y = tableTop + i * rowHeight;
//     doc.rect(tableLeft, y, colWidth, rowHeight).stroke();
//     doc.rect(tableLeft + colWidth, y, colWidth, rowHeight).stroke();
//     doc.fontSize(10).font('Helvetica')
//       .text(row.label, tableLeft + 5, y + 10)
//       .text(row.value, tableLeft + colWidth + 5, y + 10);
//   });
//   // ✅ Add Note Section
//   const noteTop = tableTop + tableData.length * rowHeight + 40;
//   doc.fontSize(12).font('Helvetica-Bold').text('NOTE', 50, noteTop);
//   doc.fontSize(10).font('Helvetica')
//     .text('1. EMI IS COLLECTED ON BEHALF OF BANK/NBFC', 70, noteTop + 20)
//     .text('2. RECEIPT WILL UPDATE TO YOUR LOAN ACCOUNT ONCE EMI RECEIVED IS CONFIRMED', 70, noteTop + 35)
//     .text('3. THIS IS SYSTEM GENERATED RECEIPT NO SIGNATURE REQUIRED', 70, noteTop + 50);
//   // ✅ Finalize
//   doc.end();
//   // ✅ Convert to Buffer
//   const chunks = [];
//   for await (const chunk of bufferStream) {
//     chunks.push(chunk);
//   }
//   const pdfBuffer = Buffer.concat(chunks);
//   // ✅ Upload to Spaces
//   const url = await uploadToSpaces(bucketName, pdfFilename, pdfBuffer, 'public-read', 'application/pdf');
//   const fileUrl = `https://cdn.fincooper.in/${pdfFilename}`;
//   return fileUrl;
// }

// -------------Dashboard For Allocation Visit Count --------------------------------------------------

async function getAllocationMobileDashboard(req, res) {
  try {
    const tokenId = new ObjectId(req.Id);

    // Find employee by token ID
    const employeeData = await employeModel.findById(tokenId).select('employeName employeUniqueId employeePhoto mobileNo workEmail branchId location');;
    if (!employeeData) {
      return notFound(res, "Employee not found", []);
    }

    const employeUniqueId = employeeData.employeUniqueId; // Example: "C171"

    if (!employeUniqueId) {
      return notFound(res, "Employee unique ID not found", []);
    }

    // Parse date filters from query parameters
    const { startDate, endDate } = req.query;

    // Set up date range filters
    let startOfDay, endOfDay;

    if (startDate && endDate) {
      // If both dates are provided, use them
      startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
    } else {
      // Default to current day if no date range is specified
      const today = new Date();
      startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      
      endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
    }

    const spreadsheetId = process.env.VISIT_GOOGLE_SHEET_KEY;
    const sheetName = process.env.EMIOVERALL_SHEET;
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return badRequest(res, 'No data found.');
    }

    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      let obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] !== undefined ? row[index] : null;
      });
      return obj;
    });

    const allocationFields = [
      'Allocation 1 emp id',
      'Allocation 2 emp id',
      'Allocation 3 emp id', 
      'Allocation 4 emp id',
    ];

    // Get all data allocated to this employee
     const allAllocatedData = data.filter(row =>
      allocationFields.some(field =>
        row[field] && row[field].match(new RegExp(employeUniqueId, 'i'))
      )
    );

    // Get current month and year (for filtering revisit/ptp)
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // ======== CUSTOMER COUNT CALCULATIONS ========
    
    // 1. pendingCustomerCount - Customers with NET DUE > 0
    const pendingData = allAllocatedData.filter(row => {
      const netDueString = row['NET DUE'] ? row['NET DUE'].replace(/,/g, '').trim() : '0';
      const netDue = parseFloat(netDueString);
      return !isNaN(netDue) && netDue > 0;
    });
    const pendingCustomerCount = pendingData.length;
    
    // 2. noDueCustomerCount - Customers with NET DUE === 0
    const noDueData = allAllocatedData.filter(row =>
        parseFloat(row['NET DUE']) === 0
    );
   
    const noDueCustomerCount = noDueData.length;
    
    // Extract all LDs with NET DUE > 0 for noVisit, revisit, and ptp counts
    const pendingLDs = pendingData
      .map(row => row["LD"])
      .filter(ld => ld !== null && ld !== "");
    
    // 3. noVisitCustomerCount - Following the exact logic from getAllocationGoogleSheet
    // First get all visits and collections for the current month
    const [allMonthVisits, allMonthCollections] = await Promise.all([
      visitModel.find({
        LD: { $in: pendingLDs },
        status: "accept",
        createdAt: {
          $gte: new Date(currentYear, currentMonth, 1),
          $lt: new Date(currentYear, currentMonth + 1, 1)
        }
      }).distinct('LD'),
      
      collectionModel.find({
        LD: { $in: pendingLDs },
        status: "accept",
        createdAt: {
          $gte: new Date(currentYear, currentMonth, 1),
          $lt: new Date(currentYear, currentMonth + 1, 1)
        }
      }).distinct('LD')
    ]);
    
    // Combine LDs from both visits and collections
    const visitedLDs = new Set([...allMonthVisits, ...allMonthCollections]);
    
    // Count LDs that haven't been visited or collected from
    const noVisitLDs = pendingLDs.filter(ld => !visitedLDs.has(ld));
    const noVisitCustomerCount = noVisitLDs.length;
    
  // For ptpData - get only the latest visit document for each LD
const ptpData = await visitModel.aggregate([
  {
    $match: {
      LD: { $in: pendingLDs },
      status: "accept",
      ptpDate: { $exists: true, $ne: "" },
      createdAt: {
        $gte: new Date(currentYear, currentMonth, 1),
        $lt: new Date(currentYear, currentMonth + 1, 1)
      }
    }
  },
  // Sort by LD and createdAt (descending) to get newest first
  { $sort: { LD: 1, createdAt: -1 } },
  // Group by LD and take only the first document for each group
  {
    $group: {
      _id: "$LD",
      document: { $first: "$$ROOT" },
    }
  },
  // Replace the grouped document with its original fields
  { $replaceRoot: { newRoot: "$document" } }
]);

// Proceed with calculating ptpCustomerCount using the latest documents
const ptpLDs = new Set();
ptpData.forEach(visit => {
  if (visit.ptpDate) {
    const ptpDateObj = new Date(visit.ptpDate);
    if (ptpDateObj <= today) {
      ptpLDs.add(visit.LD);
    }
  }
});
const ptpCustomerCount = ptpLDs.size;

// Similarly update the revisitData query
const revisitData = await visitModel.aggregate([
  {
    $match: {
      LD: { $in: pendingLDs },
      status: "accept",
      revisitDate: { $exists: true, $ne: "" },
      createdAt: {
        $gte: new Date(currentYear, currentMonth, 1),
        $lt: new Date(currentYear, currentMonth + 1, 1)
      }
    }
  },
  // Sort by LD and createdAt (descending) to get newest first
  { $sort: { LD: 1, createdAt: -1 } },
  // Group by LD and take only the first document for each group
  {
    $group: {
      _id: "$LD",
      document: { $first: "$$ROOT" },
    }
  },
  // Replace the grouped document with its original fields
  { $replaceRoot: { newRoot: "$document" } }
]);

const revisitLDs = new Set();
revisitData.forEach(visit => {
  if (visit.revisitDate) {
    const revisitDateObj = new Date(visit.revisitDate);
    if (revisitDateObj <= today) {
      revisitLDs.add(visit.LD);
    }
  }
});
const revisitCustomerCount = revisitLDs.size;
    
    // 6. legalCaseCount - Get customers with legal cases
    // Get all legal notice entries
    const legalCases = await legalNoticeModel.find();
    
    // Extract all customerFincNo values from legal cases
    const legalFincNos = legalCases.map(item => item.customerFincNo);
    
    // Count allocated customers whose LD matches legalNoticeModel entries
    const legalCaseCustomers = pendingData.filter(row => 
      row["LD"] && legalFincNos.includes(row["LD"])
    );
    
    const legalCaseCount = legalCaseCustomers.length;
    
    // ======== ORIGINAL DASHBOARD CALCULATIONS ========
    
    // Calculate totalNetDueAmount
    const totalNetDueAmount = pendingData.reduce((sum, row) => {
      const netDueString = row['NET DUE'] ? row['NET DUE'].replace(/,/g, '').trim() : '';
      const netDue = parseFloat(netDueString);
      return !isNaN(netDue) ? sum + netDue : sum;
    }, 0);
    
    // Use date range in database queries
    const [visitPending, visitAccepted, visitRejected] = await Promise.all([
      visitModel.countDocuments({
        visitBy: { $regex: new RegExp(`\\b${employeUniqueId}\\b`, 'i') },
        status: 'pending',
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      }),
      visitModel.countDocuments({
        visitBy: { $regex: new RegExp(`\\b${employeUniqueId}\\b`, 'i') },
        status: 'accept',
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      }),
      visitModel.countDocuments({
        visitBy: { $regex: new RegExp(`\\b${employeUniqueId}\\b`, 'i') },
        status: 'reject',
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      }),
    ]);

    // Get collection count for "accept" status
    const collectionAcceptCount = await collectionModel.countDocuments({
      collectedBy: { $regex: new RegExp(`\\b${employeUniqueId}\\b`, 'i') },
      status: 'accept',
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    // Add collection count for "reject" status (collectionRejectedCount)
    const collectionRejectedCount = await collectionModel.countDocuments({
      collectedBy: { $regex: new RegExp(`\\b${employeUniqueId}\\b`, 'i') },
      status: 'reject',
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    // Update collection aggregations with date range
    const [pendingCollectionSum, acceptedCollectionSum, rejectedCollectionSum] = await Promise.all([
      collectionModel.aggregate([
        {
          $match: {
            collectedBy: { $regex: new RegExp(`\\b${employeUniqueId}\\b`, 'i') },
            status: 'pending',
            createdAt: { $gte: startOfDay, $lte: endOfDay },
          },
        },
        { $group: { _id: null, total: { $sum: "$receivedAmount" } } },
      ]),
      collectionModel.aggregate([
        {
          $match: {
            collectedBy: { $regex: new RegExp(`\\b${employeUniqueId}\\b`, 'i') },
            status: 'accept',
            createdAt: { $gte: startOfDay, $lte: endOfDay },
          },
        },
        { $group: { _id: null, total: { $sum: "$receivedAmount" } } },
      ]),
      collectionModel.aggregate([
        {
          $match: {
            collectedBy: { $regex: new RegExp(`\\b${employeUniqueId}\\b`, 'i') },
            status: 'reject',
            createdAt: { $gte: startOfDay, $lte: endOfDay },
          },
        },
        { $group: { _id: null, total: { $sum: "$receivedAmount" } } },
      ]),
    ]);

    const collectionPendingSum = pendingCollectionSum[0]?.total || 0;
    const collectionAcceptedSum = acceptedCollectionSum[0]?.total || 0;
    const collectionRejectedSum = rejectedCollectionSum[0]?.total || 0;

    // Get total allocation count
    const allCustomerAllocationCount = allAllocatedData.length;

    // Calculate allocatedCompleteCount
    // Get all accepted collections for this employee with LD and receivedAmount
    const acceptedCollections = await collectionModel.find({
  collectedBy: { $regex: new RegExp(`\\b${employeUniqueId}\\b`, 'i') },
  status: 'accept',
  LD: { $exists: true, $ne: "" },
  createdAt: { $gte: startOfDay, $lte: endOfDay } // Added date range filter
}).select('LD receivedAmount');

    // Group collections by LD and sum receivedAmount
    const ldToTotalReceived = {};
    acceptedCollections.forEach(collection => {
      const ld = collection.LD;
      const receivedAmount = collection.receivedAmount || 0;
      
      if (!ldToTotalReceived[ld]) {
        ldToTotalReceived[ld] = 0;
      }
      ldToTotalReceived[ld] += receivedAmount;
    });

    // Count customers where receivedAmount >= EMI AMOUNT
    let allocatedCompleteCount = 0;
    allAllocatedData.forEach(customer => {
      const ld = customer["LD"];
      if (ld && ldToTotalReceived[ld]) {
        // Extract EMI AMOUNT from the Google Sheet
        const emiAmountString = customer['EMI AMOUNT'] ? customer['EMI AMOUNT'].replace(/,/g, '').trim() : '0';
        const emiAmount = parseFloat(emiAmountString);
        
        // Check if received amount is greater than or equal to EMI AMOUNT
        if (!isNaN(emiAmount) && ldToTotalReceived[ld] >= emiAmount) {
          allocatedCompleteCount++;
        }
      }
    });

    // Include all data in response with new customer counts
    return success(res, `Data Retrieved Successfully`, {
      employeeDetail: employeeData,
      allCustomerAllocationCount,
      pendingCustomerCount,
      allocatedCompleteCount,
      noDueCustomerCount,
      noVisitCustomerCount,
      revisitCustomerCount,
      ptpCustomerCount,
      legalCaseCount, 
      visitAndCollectionAllocated: pendingData.length, 
      totalNetDueAmount,
      collectionEmiAmountPendingForApproval: collectionPendingSum,
      collectionAcceptAmount: collectionAcceptedSum,
      collectionAcceptCount: collectionAcceptCount,
      collectionRejectAmount: collectionRejectedSum,
      collectionRejectedCount,    
      totalVisits: pendingData.length, 
      visitPendingForApproval: visitPending,
      visitAccepted: visitAccepted,
      visitRejected: visitRejected,
    });

  } catch (error) {
    if (error.response && error.response.status === 400) {
      return badRequest(res, 'Invalid sheet name.');
    } else {
      unknownError(res, error.message);
    }
  }
}

// --------------Data Get From ALLOCATION overAllEmiData Google Sheet Get Api--------------------------
async function getAllocationGoogleSheet(req, res) {
  try {
    const tokenId = new ObjectId(req.Id);

    // Find employee by token ID
    const employeeData = await employeModel.findById({ _id: tokenId });
    if (!employeeData) return notFound(res, "Employee not found", []);

    const employeUniqueId = employeeData.employeUniqueId;
    if (!employeUniqueId) return notFound(res, "Employee unique ID not found", []);

    const spreadsheetId = process.env.VISIT_GOOGLE_SHEET_KEY;
    const sheetName = process.env.EMIOVERALL_SHEET;

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return badRequest(res, 'No data found.');

    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      let obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] !== undefined ? row[index] : null;
      });
      return obj;
    });

    const allocationFields = [
      'Allocation 1 emp id', 'Allocation 2 emp id',
      'Allocation 3 emp id', 'Allocation 4 emp id',
    ];

    let filteredData = data.filter(row =>
      allocationFields.some(field =>
        row[field] && row[field].match(new RegExp(employeUniqueId, 'i'))
      )
    );

    const status = req.query.status;

if (!status || status === "all") {
} else if (status === "legal") {
  // Get all legal notice entries
  const legalCases = await legalNoticeModel.find();

  if (!legalCases.length) {
    return notFound(res, "No Legal Cases Found", []);
  }

  // Extract all customerFincNo values from legal cases
  const legalFincNos = legalCases.map(item => item.customerFincNo);

  // Further filter previously allocated customers whose FINC NO matches legalNoticeModel entries
  filteredData = filteredData.filter(row =>
    legalFincNos.includes(row["LD"])
  );

  if (!filteredData.length) {
    return notFound(res, "No Allocated Legal Cases Found For Employee", []);
  }
} else if (status === "reVisit") {
  // Filter rows with NET DUE > 0
  filteredData = filteredData.filter(row => parseFloat(row["NET DUE"]) > 0);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Debug: Log initial filtered count
  console.log(`Initial pendingData count for revisit: ${filteredData.length}`);
  
  const filteredByRevisit = [];
  
  // Get list of all relevant LDs
  const ldList = filteredData.map(row => row["LD"]).filter(ld => ld);
  console.log(`Number of LDs to check for revisit: ${ldList.length}`);
  
  // First, let's check if there are ANY visits with revisit dates
  const anyVisitsWithRevisitDates = await visitModel.countDocuments({
    status: "accept",
    revisitDate: { $exists: true, $ne: "" }
  });
  console.log(`Total visits with any revisit date: ${anyVisitsWithRevisitDates}`);
  
  // Check how many visits match our specific criteria
  const visitsWithRevisitInCurrentMonth = await visitModel.countDocuments({
    LD: { $in: ldList },
    status: "accept",
    revisitDate: { $exists: true, $ne: "" },
    createdAt: {
      $gte: new Date(currentYear, currentMonth, 1),
      $lt: new Date(currentYear, currentMonth + 1, 1)
    }
  });
  console.log(`Visits with revisit date in current month: ${visitsWithRevisitInCurrentMonth}`);
  
  // Check each LD individually (the original approach, with logging)
  for (const row of filteredData) {
    const ld = row["LD"];
    if (!ld) continue;
    
    // Find visits with any revisit date for this LD
    const allVisitsWithRevisitForLD = await visitModel.countDocuments({
      LD: ld,
      status: "accept",
      revisitDate: { $exists: true, $ne: "" }
    });
    
    if (allVisitsWithRevisitForLD > 0) {
      console.log(`LD ${ld} has ${allVisitsWithRevisitForLD} visits with revisit dates`);
    }

    // Get latest visit with a revisit date
    const latestVisit = await visitModel.findOne({ 
      LD: ld,
      status: "accept",
      revisitDate: { $exists: true, $ne: "" }
    }).sort({ createdAt: -1 });

    if (latestVisit) {
      const revisitDateObj = new Date(latestVisit.revisitDate);
      const visitCreatedDate = latestVisit.createdAt;
      
      console.log(`LD ${ld} - visit created: ${visitCreatedDate}, revisit date: ${revisitDateObj}`);
      console.log(`Visit month: ${visitCreatedDate.getMonth()}, current month: ${currentMonth}`);
      
      // Check if visit is in current month and revisit date is today or earlier
      if (
        visitCreatedDate.getMonth() === currentMonth &&
        visitCreatedDate.getFullYear() === currentYear &&
        revisitDateObj <= today
      ) {
        console.log(`LD ${ld} QUALIFIES for revisit list`);
        filteredByRevisit.push(row);
      } else {
        if (visitCreatedDate.getMonth() !== currentMonth) {
          console.log(`LD ${ld} - Wrong month: ${visitCreatedDate.getMonth()} vs ${currentMonth}`);
        }
        if (revisitDateObj > today) {
          console.log(`LD ${ld} - Future revisit date: ${revisitDateObj} vs today ${today}`);
        }
      }
    }
  }

  console.log(`Final revisit count: ${filteredByRevisit.length}`);
  filteredData = filteredByRevisit;

  if (!filteredData.length) {
    return notFound(res, "No revisit data found", []);
  }
}else if (status === "ptpCase") {
  // Filter rows with NET DUE > 0
  filteredData = filteredData.filter(row => parseFloat(row["NET DUE"]) > 0);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Get all LDs with pending amount
  const pendingLDs = filteredData
    .map(row => row["LD"])
    .filter(ld => ld !== null && ld !== "");

  // Use aggregation to get the latest ptpDate for each LD
  const ptpData = await visitModel.aggregate([
    {
      $match: {
        LD: { $in: pendingLDs },
        status: "accept",
        ptpDate: { $exists: true, $ne: "" },
        createdAt: {
          $gte: new Date(currentYear, currentMonth, 1),
          $lt: new Date(currentYear, currentMonth + 1, 1)
        }
      }
    },
    // Sort by LD and createdAt (descending) to get newest first
    { $sort: { LD: 1, createdAt: -1 } },
    // Group by LD and take only the first document for each group
    {
      $group: {
        _id: "$LD",
        document: { $first: "$$ROOT" },
      }
    },
    // Replace the grouped document with its original fields
    { $replaceRoot: { newRoot: "$document" } }
  ]);

  // Create a set of LDs that have valid PTP dates
  const ptpLDs = new Set();
  ptpData.forEach(visit => {
    if (visit.ptpDate) {
      const ptpDateObj = new Date(visit.ptpDate);
      if (ptpDateObj <= today) {
        ptpLDs.add(visit.LD);
      }
    }
  });

  // Filter data to only include rows with LDs in the ptpLDs set
  filteredData = filteredData.filter(row => row["LD"] && ptpLDs.has(row["LD"]));

  if (!filteredData.length) {
    return notFound(res, "No ptp case data found", []);
  }
}else if (status === "noVisit") {
  // Filter rows with NET DUE > 0
  filteredData = filteredData.filter(row => parseFloat(row["NET DUE"]) > 0);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const filteredNoVisit = [];

  for (const row of filteredData) {
    const ld = row["LD"];
    if (!ld) continue;

    // Check visitModel with 'accept' status in current month
    const visitExist = await visitModel.findOne({
      LD: ld,
      status: "accept",
      createdAt: {
        $gte: new Date(currentYear, currentMonth, 1),
        $lt: new Date(currentYear, currentMonth + 1, 1),
      }
    });

    // Check collectionModel with 'accept' status in current month
    const collectionExist = await collectionModel.findOne({
      LD: ld,
      status: "accept",
      createdAt: {
        $gte: new Date(currentYear, currentMonth, 1),
        $lt: new Date(currentYear, currentMonth + 1, 1),
      }
    });

    // If LD is NOT found in either model for this month with status 'accept'
    if (!visitExist && !collectionExist) {
      filteredNoVisit.push(row);
    }
  }

  filteredData = filteredNoVisit;

  if (!filteredData.length) {
    return notFound(res, "No 'noVisit' data found for current month", []);
  }
}

    if (status === "pending") {
      filteredData = filteredData.filter(row =>
        parseFloat(row['NET DUE']) > 0
      );
    } else if (status === "noDue") {
      filteredData = filteredData.filter(row =>
        parseFloat(row['NET DUE']) === 0
      );
      if (filteredData.length === 0) {
        return notFound(res, 'No customer allocations found for Net Due 0.', []);
      }
    } else {
      // Default to NET DUE not 0
      filteredData = filteredData.filter(row =>
        parseFloat(row['NET DUE']) !== 0
      );
      if (filteredData.length === 0) {
        return notFound(res, "No customer data found allocated to you.", []);
      }
    }

    // Remove null/empty fields
    filteredData = filteredData.map(record =>
      Object.fromEntries(
        Object.entries(record).filter(([_, value]) => value !== null && value !== "")
      )
    );

    success(res, `Data Get From: ${response.data.range}`, filteredData);

  } catch (error) {
    if (error.response && error.response.status === 400) {
      return badRequest(res, 'Invalid sheet name.');
    } else {
      unknownError(res, error.message);
    }
  }
}


// --------------DATA GET FROM EMIOVERALL CASE1 CASE2 FROM GOOGLE SHEET--------------------------------
async function getAllocationCase1Case2(req, res) {
  try {
    const tokenId = new ObjectId(req.Id);
    // console.log("tokenId", tokenId);
  
    // Find employee by token ID
    const employeeData = await employeModel.findById({ _id: tokenId });
    if (!employeeData) {
      return notFound(res, "Employee not found", []);
    }
  
    const employeUniqueId = employeeData.employeUniqueId;
    if (!employeUniqueId) {
      return notFound(res, "Employee unique ID not found", []);
    }
  
    const spreadsheetId = process.env.VISIT_GOOGLE_SHEET_KEY;
    const emiOverallSheet = process.env.EMIOVERALL_SHEET;
    const visitDetailSheet = process.env.VISIT_DETAILS_SHEET;
  
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    console.time("Google Sheets API Call - EMI Overall");
    // Step 1: Fetch data from the emiOverallSheet
    const emiOverallResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: emiOverallSheet,
    });
    console.timeEnd("Google Sheets API Call - EMI Overall");
  
    const emiOverallRows = emiOverallResponse.data.values;
    if (!emiOverallRows || emiOverallRows.length === 0) {
      return badRequest(res, 'No data found in EMI OVERALL.');
    }
    const emiOverallHeaders = emiOverallRows[0];
    const emiOverallData = emiOverallRows.slice(1).map(row => {
      let obj = {};
      emiOverallHeaders.forEach((header, index) => {
        obj[header] = row[index] !== undefined ? row[index] : null;
      });
      return obj;
    });
  
    // Handle the two cases (visit1 and visit2)
    let filteredData;
  
    if (req.query.case === "visit1") {
      // Step 1: Fetch data from the visitDetailSheet
      const visitDetailResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: visitDetailSheet,
      });
    
      const visitDetailRows = visitDetailResponse.data.values;
      if (!visitDetailRows || visitDetailRows.length === 0) {
        return badRequest(res, 'No data found in VISIT DETAILS.');
      }
    
      const visitDetailHeaders = visitDetailRows[0];
      const visitDetailData = visitDetailRows.slice(1).map(row => {
        let obj = {};
        visitDetailHeaders.forEach((header, index) => {
          obj[header] = row[index] !== undefined ? row[index] : null;
        });
        return obj;
      });
    
      // Step 2: Filter data for visit1 case
      const filteredData = emiOverallData.filter(row => {
        // Check if employee matches any allocation and NET DUE is greater than 0
        const allocationMatch = ['Allocation 1 emp id']
          .some(field => row[field] && row[field].match(new RegExp(employeUniqueId, 'i')));
    
        if (!allocationMatch || parseFloat(row['NET DUE']) <= 0) {
          return false;
        }
    
        // Step 3: Check if LD is present in the visitDetailSheet
        const ldMatch = visitDetailData.find(visitRow => visitRow['LD'] === row['LD']);
    
        // If LD number is not present in the visitDetailSheet, include in the result
        if (!ldMatch) {
          return true;
        }
    
        // If LD number is present, include it only if VISIT DATE-1 is empty
        return ldMatch['VISIT DATE-1'] == null || ldMatch['VISIT DATE-1'].trim() === '';
      });
    
      if (filteredData.length === 0) {
        return notFound(res, 'No pending visit data found for VISIT DATE-1.', []);
      }
    
      return success(res, `Pending allocations for VISIT DATE-1`, filteredData);
    }
    
     else if (req.query.case === "visit2") {
      // Step 2: Fetch data from the visitDetailSheet
      const visitDetailResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: visitDetailSheet,
      });
  
      const visitDetailRows = visitDetailResponse.data.values;
      if (!visitDetailRows || visitDetailRows.length === 0) {
        return badRequest(res, 'No data found in VISIT DETAILS.');
      }
  
      const visitDetailHeaders = visitDetailRows[0];
      const visitDetailData = visitDetailRows.slice(1).map(row => {
        let obj = {};
        visitDetailHeaders.forEach((header, index) => {
          obj[header] = row[index] !== undefined ? row[index] : null;
        });
        return obj;
      });
  
      // Step 3: Filter data for visit2 case
      let filteredData = emiOverallData.filter(row => {
        const allocationMatch = ['Allocation 1 emp id']
          .some(field => row[field] && row[field].match(new RegExp(employeUniqueId, 'i')));
  
        if (!allocationMatch || parseFloat(row['NET DUE']) <= 0) {
          return false;
        }
  
         // Check if LD number is present in visitDetailSheet
         const ldMatch = visitDetailData.find(visitRow =>
          visitRow['LD'] === row['LD']
        );
  
        // If LD number is not present, include this row
        if (!ldMatch) {
          return true;
        }
  
        // If LD number is present, check if VISIT DATE-2 is empty
        return ldMatch['VISIT DATE-2'] == null || ldMatch['VISIT DATE-2'].trim() === '';
      
      });
  
      if (filteredData.length === 0) {
        return notFound(res, 'No pending visit data found for VISIT DATE-2.', []);
      }
  
      return success(res, `Pending allocations for VISIT DATE-2`, filteredData);
    }
  
    return badRequest(res, 'Invalid case parameter.');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      return badRequest(res, 'Invalid sheet name.');
    } else {
      unknownError(res, error.message);
    }
  }
  }


// -------------Data Get From Google Sheet CUSTOMERNAME, LAT , LONG-------------------------------
async function getAllCustomerLatLong(req, res) {
  try {
    const spreadsheetId = process.env.VISIT_GOOGLE_SHEET_KEY;
    const sheetName = process.env.EMIOVERALL_SHEET;
    
    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    // Fetch data from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return badRequest(res, 'No data found.');
    }

    const headers = rows[0];
    const customerData = rows.slice(1).map(row => {
      let obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] !== undefined ? row[index] : null;
      });
      return obj;
    });

    // Filter and extract the necessary fields: CUSTOMERNAME, LAT, LONG
    const customerDetail = customerData.map(row => ({
      ['CUSTOMER NAME']: row['CUSTOMER NAME '] || null,
      LAT: row['LAT '] || "0",
      LONG: row['LONG '] || "0",
    }));


 const employeeData = await employeModel.find({}, { employeName: 1, location: 1 }).lean();
 if (!employeeData || employeeData.length === 0) {
   return notFound(res, "No employee data found", []);
 }

 const employeeDetails = employeeData.map(emp => ({
   employeName: emp.employeName,
   LAT: emp.location?.coordinates[1] || "0",
   LONG: emp.location?.coordinates[0] || "0",
 }));


 const branchData = await newbranch.find({}, { branch: 1, location: 1 }).lean();
 if (!branchData || branchData.length === 0) {
   return notFound(res, "No branch data found", []);
 }

 const branchDetails = branchData.map(branch => ({
   branch: branch.branch,
   LAT: branch.location?.coordinates[1] || "0",
   LONG: branch.location?.coordinates[0] || "0",
 }));

 // Structure the response
 const responseData = {
   customerDetail,
   employeeDetail: employeeDetails,
   branchDetail: branchDetails,
 };
    success(res, `Data Get successfully`, responseData);
  } catch (error) {
    if (error.response && error.response.status === 400) {
      return badRequest(res, 'Invalid sheet name.');
    } else {
      unknownError(res, error.message);
    }
  }
}


async function getAllEmployeesLatLog(req, res) {
  try {
    let query = { branchId: { "$exists": true, "$ne": null } };

    if (req.query.filter) {
      try {
        const filter = JSON.parse(req.query.filter);

        if (filter.branches && Array.isArray(filter.branches) && filter.branches.length > 0) {
          query.branchId = { "$in": filter.branches };
        }

        if (filter.employees && Array.isArray(filter.employees) && filter.employees.length > 0) {
          query.reportingManagerId = { "$in": filter.employees };
        }

        if (filter.departments && Array.isArray(filter.departments) && filter.departments.length > 0) {
          query.departmentId = { "$in": filter.departments };
        }
      } catch (parseError) {
        return badRequest(res, `Invalid filter format: ${parseError.message}`);
      }
    }

    // Fetch employee data with the applied filters
    const employeeData = await employeModel.find(query, { 
      employeName: 1, 
      location: 1,
      employeePhoto: 1,
      _id: 1
    }).lean();

    if (!employeeData || employeeData.length === 0) {
      return success(res, "No employee data found", []);
    }

    // Map employee data to the required format and add "randomCount"
    const employeeDetails = employeeData.map(emp => ({
      employeName: emp.employeName || "",
      employeePhoto: emp.employeePhoto || "",
      userId: emp._id.toString(),
      LAT: emp.location?.coordinates?.[1] || "0",
      LONG: emp.location?.coordinates?.[0] || "0",
      randomCount: Math.floor(Math.random() * 30) + 1 // Generates a number between 1 and 30
    }));

    return success(res, `Data retrieved successfully`, employeeDetails);
  } catch (error) {
    console.error("Error in getAllEmployeesLatLog:", error);
    if (error.response && error.response.status === 400) {
      return badRequest(res, 'Invalid sheet name.');
    } else {
      return unknownError(res, error.message);
    }
  }
}


async function getEmployeesForMap(req, res) {
  try {

const filter = req?.query?.filter?JSON.parse(req.query.filter):{}
let query = {}

if (filter.branches && filter.branches[0]) {
  
  query ={...query,
     "branchId": 
      { "$in": filter.branches }
     
  }
}

if (filter.employees && filter.employees[0]) {
  
  query ={...query,
     "reportingManagerId": 
      { "$in": filter.employees }
     
  }
}
if (filter.departments && filter.departments[0]) {
  
  query ={...query,
     "departmentId": 
      { "$in": filter.departments }
     
  }
}

 const employeeData = await employeModel.find(query, { employeName: 1, location: 1,designationId:1 ,employeePhoto:1,_id:1}).populate("designationId").lean();
 if (!employeeData || employeeData.length === 0) {
   return success(res, "No employee data found", []);
 }

 const employeeDetails = employeeData.map(emp => ({
  name: emp.employeName,
  avatar:emp.employeePhoto,
  designation:emp.designationId?.name ?? "No Designation",
phone:emp.mobileNo,
email:emp.workEmail,
   id:emp._id,
   currentLocation:{
     lat: emp.location?.coordinates[1] || "0",
     long: emp.location?.coordinates[0] || "0"
   }
 }));


    success(res, `Data Get successfully`, employeeDetails);
  } catch (error) {
    if (error.response && error.response.status === 400) {
      return badRequest(res, 'Invalid sheet name.');
    } else {
      unknownError(res, error.message);
    }
  }
}


// -----------------Visit Form Add Api--------------------------------
async function visitFormAdd(req, res) {
try {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return serverValidation(res, {
      errorName: "serverValidation",
      errors: errors.array(),
    });
  }
  const tokenId = new ObjectId(req.Id);
  const employeUniqueDetail = await employeModel.findById({ _id: tokenId });
  const name = employeUniqueDetail.employeName + `-`  + employeUniqueDetail.employeUniqueId;
  const { latitude = 0 , longitude = 0 , ...otherData } = req.body;

  const visitDetail = await visitModel.create({
    ...otherData,
    visitBy:name,
    location: {
      coordinates: [longitude, latitude],
    },
  });

  return success(res, "Visit saved successfully.", visitDetail);
} catch (error) {
  console.log(error);
  return unknownError(res, error);
}
}


// -----------------Get All Visit  Api--------------------------------
async function getVisitDetail(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const pipeline = [
      { $match: { status: status } },
      { $sort: { createdAt: -1 } }
    ];

    const result = await paginateAggregate(visitModel, pipeline, page, limit);

    if (!result.data.length) {
      return success(res, "No Record", result);
    }

    success(res, `Visit Detail List For ${status}`, result);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// -------------------Visit Form Update  Api---------------------------
async function visitUpdate(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
  
    const tokenId = new ObjectId(req.Id);
    const { status, visitId, reason } = req.body;
    const employeeData = await employeModel.findOne({ _id: req.Id, status: "active" });
      if (!employeeData) {
          return notFound(res, "Employee not found", []);
      }
    const visitD = await visitModel.findById({ _id: new ObjectId(visitId) });
  
    if (!visitD) {
      return badRequest(res, 'VisitId not found.');
    }
  
    // If status is "reject", update the status in MongoDB and return
    if (status === "reject") {
      visitD.status = status;
      visitD.reason = reason;
      visitD.visitUpdateBy = tokenId;  // Add the tokenId of the user who updates the status
      const detail = await visitD.save();
      return success(res, "Visit rejected successfully.", detail);
    }
  
    const keyMapping = {
      LD: 'LD',
      customerName: 'CUSTOMER NAME',
      visitBy: 'VISITED BY',
      visitDate: 'VISIT DATE',
      ptpDate: 'PTP DATE',
      newContactNumber: 'New Contact Number',
      customerResponse: 'CUSTOMER RESPONSE',
      paymentAmount: 'PAYMENT AMOUNT',
      reasonForNotPay: 'REASON FOR NOT PAY',
      solution: 'SOLUTION',
      reasonForCustomerNotContactable: 'REASON FOR CUSTOMER NOT CONTACTABLE',
      revisitDate: 'VISIT SELFIE'
    };
  
    const { LD, customerName, visitBy, visitDate, revisitDate, newContactNumber, customerResponse, paymentAmount, reasonForNotPay, solution, reasonForCustomerNotContactable, ptpDate } = visitD;
  
    // const visitSelfieValue = visitSelfie ? '' : visitSelfie;
  
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
  
    const spreadsheetId = process.env.VISIT_GOOGLE_SHEET_KEY;
    const sheetName = process.env.VISIT_DETAILS_SHEET;
  
    // console.time("sheet");
  
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName,
    });
  
    // console.timeEnd("sheet");
  
    let rows = response.data.values || [];
    let headers = rows.length > 0 ? rows[0] : [];
  
    if (rows.length === 0) {
      headers = ['LD', 'CUSTOMER NAME', 'VISITED BY-1', 'VISIT DATE-1', 'PTP DATE-1', 'New Contact Number-1', 'CUSTOMER RESPONSE-1', 'PAYMENT AMOUNT-1', 'REASON FOR NOT PAY-1', 'SOLUTION-1', 'REASON FOR CUSTOMER NOT CONTACTABLE-1', 'VISIT SELFIE-1'];
      rows.push(headers);
    }
  
    const data = rows.slice(1);
    const ldIndex = headers.indexOf('LD');
    const customerNameIndex = headers.indexOf('CUSTOMER NAME');
  
    if (ldIndex === -1 || customerNameIndex === -1) {
      return badRequest(res, 'LD or CUSTOMER NAME field not found in the sheet.');
    }
  
    const rowIndex = data.findIndex(row => row[ldIndex] === LD && row[customerNameIndex] === customerName);
  
    if (rowIndex === -1) {
      let newRow = Array(headers.length).fill('');
      newRow[ldIndex] = LD;
      newRow[customerNameIndex] = customerName;
  
      headers.forEach((header, index) => {
        const internalKey = Object.keys(keyMapping).find(key => `${keyMapping[key]}-1` === header);
        if (internalKey && visitD[internalKey] !== undefined) {
          newRow[index] = internalKey === 'visitSelfie' ? visitSelfieValue : visitD[internalKey];
        }
      });
  
      data.push(newRow);
      rows.push(newRow);
  
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        resource: {
          values: [headers, ...data],
        },
      });
  
      visitD.status = status;
      visitD.visitUpdateBy = tokenId;  // Add the tokenId of the user who updates the status
      await visitD.save();
      return success(res, "Visit accepted successfully.", visitD);
  
    } else {
      let lastUsedSuffix = 0;
      for (let suffix = 1; suffix <= 5; suffix++) {
        const visitedByHeader = `VISITED BY-${suffix}`;
        if (headers.includes(visitedByHeader) && data[rowIndex][headers.indexOf(visitedByHeader)]) {
          lastUsedSuffix = suffix;
        } else {
          break;
        }
      }
  
      let updateMapping = {};
  
      if (lastUsedSuffix < 5) {
        const nextSuffix = lastUsedSuffix + 1;
        updateMapping = {
          [`VISITED BY-${nextSuffix}`]: visitBy,
          [`VISIT DATE-${nextSuffix}`]: visitDate,
          [`PTP DATE-${nextSuffix}`]: ptpDate,
          [`New Contact Number-${nextSuffix}`]: newContactNumber,
          [`CUSTOMER RESPONSE-${nextSuffix}`]: customerResponse,
          [`PAYMENT AMOUNT-${nextSuffix}`]: paymentAmount,
          [`REASON FOR NOT PAY-${nextSuffix}`]: reasonForNotPay,
          [`SOLUTION-${nextSuffix}`]: solution,
          [`REASON FOR CUSTOMER NOT CONTACTABLE-${nextSuffix}`]: reasonForCustomerNotContactable,
          [`VISIT SELFIE-${nextSuffix}`]: revisitDate,
        };
      } else {
        updateMapping = {
          'VISITED BY-5': visitBy,
          'VISIT DATE-5': visitDate,
          'PTP DATE-5': ptpDate,
          'New Contact Number-5': newContactNumber,
          'CUSTOMER RESPONSE-5': customerResponse,
          'PAYMENT AMOUNT-5': paymentAmount,
          'REASON FOR NOT PAY-5': reasonForNotPay,
          'SOLUTION-5': solution,
          'REASON FOR CUSTOMER NOT CONTACTABLE-5': reasonForCustomerNotContactable,
          'VISIT SELFIE-5': revisitDate,
        };
      }
  
      Object.keys(updateMapping).forEach(key => {
        if (!headers.includes(key)) {
          headers.push(key);
          data.forEach(row => row.push(''));
        }
      });
  
      headers.forEach((header, index) => {
        if (updateMapping[header] !== undefined) {
          data[rowIndex][index] = updateMapping[header];
        }
      });
  
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        resource: {
          values: [headers, ...data],
        },
      });
  
      visitD.status = status;
      visitD.visitUpdateBy = tokenId;  // Add the tokenId of the user who updates the status
      await visitD.save();
  
      return success(res, "Visit accepted successfully", visitD);
    }
  
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
  }

// ----------------GET VISIT DETAIL BY LD NUMBER------------------------
async function getVisitDetailByLD(req, res) {
try {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return serverValidation(res, {
      errorName: "serverValidation",
      errors: errors.array(),
    });
  }
  
  const { LD } = req.query;
  const employeeData = await employeModel.findOne({ _id: req.Id, status: "active" });
    if (!employeeData) {
        return notFound(res, "Employee not found", []);
    }
  const startOfMonth = moment().startOf('month').toDate();
  const endOfMonth = moment().endOf('month').toDate();
  const visitDetail = await visitModel.find({
    LD: LD,
    createdAt: {
      $gte: startOfMonth,
      $lte: endOfMonth
    }
  });

  if (!visitDetail || visitDetail.length === 0) {
    return success(res, "No Record", visitDetail);
  }
  
  success(res, `Visit Detail For ${LD}`, visitDetail);
} catch (error) {
  console.log(error);
  unknownError(res, error);
}
}

// ----------------GET CUSTOMER VISIT DETAIL BY LD NUMBER------------------------
async function empVisitCollectionByLD(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const {
      LD,
      startDate,
      endDate,
      status,
      type = "all", 
      page = 1,
      limit = 10,
    } = req.query;

    const employeeData = await employeModel.findOne({ _id: req.Id, status: "active" });
    if (!employeeData) {
      return notFound(res, "You Are Not Active Employee", []);
    }

    let dateFilter = {};
    let statusFilter = {};

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter = { createdAt: { $gte: start, $lte: end } };
    }

    if (status && ["accept", "pending", "reject"].includes(status)) {
      statusFilter.status = status;
    }

    const extractUniqueId = str => str?.split("-").pop();

    let visitData = [];
    let collectionData = [];

    // Fetch visits if type is visit or not specified
    if (type === "all" || type === "visit") {
      visitData = await visitModel.find({
        LD,
        ...dateFilter,
        ...statusFilter,
      }).sort({ createdAt: -1 });
    }

    // Fetch collections if type is collection or not specified
    if (type === "all" || type === "collection") {
      collectionData = await collectionModel.find({
        LD,
        ...statusFilter,
      }).sort({ createdAt: -1 });
    }

    const visitByIds = visitData.map(v => extractUniqueId(v.visitBy)).filter(Boolean);
    const collectedByIds = collectionData.map(c => extractUniqueId(c.collectedBy)).filter(Boolean);
    const uniqueEmployeeIds = [...new Set([...visitByIds, ...collectedByIds])];

    const employees = await employeModel.find(
      { employeUniqueId: { $in: uniqueEmployeeIds } },
      { employeName: 1, employeUniqueId: 1, employeePhoto: 1 }
    );

    const employeeMap = {};
    employees.forEach(emp => {
      employeeMap[emp.employeUniqueId] = emp.employeePhoto;
    });

    const visitWithType = visitData.map(item => {
      const obj = item.toObject();
      const uniqueId = extractUniqueId(obj.visitBy);
      return {
        ...obj,
        type: "visit",
        employeePhoto: employeeMap[uniqueId] || null,
      };
    });

    const collectionWithType = collectionData.map(item => {
      const obj = item.toObject();
      const uniqueId = extractUniqueId(obj.collectedBy);
      return {
        ...obj,
        type: "collection",
        employeePhoto: employeeMap[uniqueId] || null,
      };
    });

    const combinedData = [...visitWithType, ...collectionWithType].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Pagination
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    const startIndex = (pageInt - 1) * limitInt;
    const paginatedData = combinedData.slice(startIndex, startIndex + limitInt);

    return success(res, `Page ${pageInt} of Visit and Collection Data for ${LD}`, {
      total: combinedData.length,
      page: pageInt,
      limit: limitInt,
      totalPages: Math.ceil(combinedData.length / limitInt),
      data: paginatedData,
    });

  } catch (error) {
    console.error("Error in empVisitCollectionByLD:", error);
    return unknownError(res, error);
  }
}

// ----------------GET CUSTOMER VISIT DETAIL BY EMPLOYE UNIQUE ID------------------------
async function visitCollectionEmployeId(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const {
      employeeId,
      startDate,
      endDate,
      status,
      type = "all", 
      page = 1,
      limit = 10,
    } = req.query;

    const employeeData = await employeModel.findById({ _id: new ObjectId(employeeId), });
    if (!employeeData) {
      return notFound(res, "EmployeeId NOt Found", []);
    }
    const employeUniqueId = employeeData.employeUniqueId;
    let dateFilter = {};
    let statusFilter = {};
    
    // If both dates are provided, use them
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter = { createdAt: { $gte: start, $lte: end } };
    } else {
      // Default to today's date
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      dateFilter = { createdAt: { $gte: todayStart, $lte: todayEnd } };
    }
    
    if (status && ["accept", "pending", "reject"].includes(status)) {
      statusFilter.status = status;
    }

    // Build regex to match visitBy or collectedBy that ends with employee's unique ID
    const uniqueIdRegex = new RegExp(`${employeUniqueId}$`);

    let visitData = [];
    let collectionData = [];

    if (type === "all" || type === "visit") {
      visitData = await visitModel.find({
        visitBy: { $regex: uniqueIdRegex },
        ...dateFilter,
        ...statusFilter,
      }).sort({ createdAt: -1 });
    }

    if (type === "all" || type === "collection") {
      collectionData = await collectionModel.find({
        collectedBy: { $regex: uniqueIdRegex },
        ...statusFilter,
      }).sort({ createdAt: -1 });
    }

    const extractUniqueId = str => str?.split("-").pop();

    const employeeMap = {
      [employeUniqueId]: employeeData.employeePhoto,
    };

    const visitWithType = visitData.map(item => {
      const obj = item.toObject();
      const uniqueId = extractUniqueId(obj.visitBy);
      return {
        ...obj,
        type: "visit",
        employeePhoto: employeeMap[uniqueId] || null,
      };
    });

    const collectionWithType = collectionData.map(item => {
      const obj = item.toObject();
      const uniqueId = extractUniqueId(obj.collectedBy);
      return {
        ...obj,
        type: "collection",
        employeePhoto: employeeMap[uniqueId] || null,
      };
    });

    const combinedData = [...visitWithType, ...collectionWithType].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Pagination
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    const startIndex = (pageInt - 1) * limitInt;
    const paginatedData = combinedData.slice(startIndex, startIndex + limitInt);

    return success(res, `Page ${pageInt} of Visit and Collection Data for Employee`, {
      total: combinedData.length,
      page: pageInt,
      limit: limitInt,
      totalPages: Math.ceil(combinedData.length / limitInt),
      data: paginatedData,
    });

  } catch (error) {
    console.error("Error in empVisitCollectionByLD:", error);
    return unknownError(res, error);
  }
}



// -----------------Collection EMi Form Add Api--------------------------
async function collectionEmiFormAdd(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const tokenId = new ObjectId(req.Id);
    const employeUniqueDetail = await employeModel.findById({ _id: tokenId });
    const name = employeUniqueDetail.employeName + `-` + employeUniqueDetail.employeUniqueId;

    const {
      LD, customerName,fatherName, mobileNo, emiAmount, receivedAmount,
      transactionId, transactionImage, modeOfCollectionId,
      commonId, customerEmail, emiReceivedDate, emiReceivedTime ,longitude = 0 , latitude = 0
    } = req.body;

    // if (!transactionImage || transactionImage === '') {
    //   return badRequest(res, "Please Upload Transaction Image");
    // }

    // Check if transaction ID is already accepted
    // const transIdDetail = await collectionModel.findOne({
    //   transactionId: transactionId, status: "accept"
    // });
    // if (transIdDetail) {
    //   return badRequest(res, "Transaction ID Already Submitted.");
    // }

    // Fetch modeOfCollection details
    const modeDetail = await modeOfCollectionModel.findById(modeOfCollectionId);
    if (!modeDetail) {
      return badRequest(res, "Invalid modeOfCollectionId.");
    }

    // Set the status based on the modeOfCollection title
    const status = modeDetail.title === "cashCollection" ? "initiate" : "pending";
    // req.body.status = status; 
    // req.body.collectedBy = name;  
    const collectionData = {
      ...req.body,
      status: status,
      collectedBy: name,
      location: {
        type: "Point",
        coordinates: [longitude , latitude]
      }
    }; 

    // Create the collection entry
    const collectionDetail = await collectionModel.create(collectionData);
    success(res, "Collection EMI Added Successfully", collectionDetail);

  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}


// ---------------Customer Detail By LD Number  given api function call in below api "getEmiCollection" Api-------------
async function getGoogleSheetData() {
  try {
    const spreadsheetId = process.env.VISIT_GOOGLE_SHEET_KEY;
    const sheetName = process.env.EMIOVERALL_SHEET;
    const auth = new google.auth.GoogleAuth({
      credentials,  // Add your Google credentials here
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error('No data found.');
    } else {
      const headers = rows[0];
      const data = rows.slice(1).map(row => {
        let obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] !== undefined ? row[index] : null;
        });
        return obj;
      });

      return data;  // Returning the processed Google Sheet data
    }
  } catch (error) {
    console.error('Error fetching Google Sheet data:', error.message);
    throw error;  // Re-throw the error for handling in the calling function
  }
}



async function getGoogleEmil() {
  try {
    const spreadsheetId = process.env.BBPS_GOOGLE_SHEET_KEY;
    const sheetName = process.env.BBPS_EMI_SHEET;
    const auth = new google.auth.GoogleAuth({
      credentials,  // Add your Google credentials here
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error('No data found.');
    } else {
      const headers = rows[0];
      const data = rows.slice(1).map(row => {
        let obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] !== undefined ? row[index] : null;
        });
        return obj;
      });

      return data;  // Returning the processed Google Sheet data
    }
  } catch (error) {
    console.error('Error fetching Google Sheet data:', error.message);
    throw error;  // Re-throw the error for handling in the calling function
  }
}


// --------------STATUS : pending , accept , reject api Add On Approval DashBoard------------
async function getEmiCollectionDetail(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const googleSheetData = await getGoogleSheetData(); 

    const { status, page = 1, LD, date } = req.query; // Add LD and date from query
    const limit = 20; 
    const skip = (page - 1) * limit;

    // Build dynamic filter conditions
    const filterConditions = { status };
    if (LD) filterConditions.LD = LD;

    // Handle date filtering
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0); // Start of the day in UTC
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999); // End of the day in UTC

      filterConditions.createdAt = {
        $gte: startOfDay,
        $lt: endOfDay
      };
    }

    // Count total records matching the filters
    const totalRecords = await collectionModel.countDocuments(filterConditions);

    const emiStatus = await collectionModel.aggregate([
      { $match: filterConditions },
      {
        $lookup: {
          from: "modelofcollections",
          localField: "modeOfCollectionId",
          foreignField: "_id",
          as: "modeOfCollectionDetail"
        }
      },
      {
        $lookup: {
          from: "banknames",
          localField: "commonId",
          foreignField: "_id",
          as: "bankNameDetail"
        }
      },
      {
        $lookup: {
          from: "okcredits",
          localField: "commonId",
          foreignField: "_id",
          as: "okCreditDetail"
        }
      },
      {
        $lookup: {
          from: "employees",
          localField: "okCreditDetail.employeeId",
          foreignField: "_id",
          as: "employeDetail"
        }
      },
      {
        $addFields: {
          employeDetail: {
            $map: {
              input: "$employeDetail",
              as: "employee",
              in: {
                _id: "$$employee._id",
                employeName: "$$employee.employeName",
                email: "$$employee.email",
                workEmail: "$$employee.workEmail",
                mobileNo: "$$employee.mobileNo",
                employeePhoto: { $ifNull: ["$$employee.employeePhoto", ""] }
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: "lenders",
          localField: "commonId",
          foreignField: "_id",
          as: "partnerDetail"
        }
      },
      {
        $project: {
          "modeOfCollectionDetail.__v": 0,
          "bankNameDetail.__v": 0,
          "okCreditDetail.__V": 0,
          "partnerDetail.__v": 0
        }
      }
    ])
      .sort({ createdAt: -1 })
      .skip(skip) // Skip records for pagination
      .limit(limit); // Limit records per page
    
    // Filter MongoDB records where LD from Google Sheets matches commonId in the MongoDB result
    const matchedData = emiStatus.filter(emi => {
      const matchingLDData = googleSheetData.find(sheetRow => sheetRow['LD'] === emi.LD);
      if (matchingLDData) {
        emi.googleSheetDetail = matchingLDData;
        return true;
      }
      return false;
    });

    if (matchedData.length === 0) {
      return notFound(res, 'No Matching Data Found From The Google Sheet', []);
    }

    success(res, `Emi Collection List For ${status}`, {
      data: matchedData,
      currentPage: Number(page),
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
    });
  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
}
  

// -----------------Get All Collection EMi Api------------------------------------------------
async function getEmiCollection(req, res) {
try {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return serverValidation(res, {
      errorName: "serverValidation",
      errors: errors.array(),
    });
  }
   const {status} = req.query;
  const emiStatus = await collectionModel.aggregate([
    {$match:{status:status} },
    {
      $lookup: {
          from : "modelofcollections",
          localField:"modeOfCollectionId",
          foreignField:"_id",
          as:"modeOfCollectionDetail"
      }
  },
  {
      $project:{
           "modeOfCollectionDetail.__v":0, "modeOfCollectionDetail.createdAt":0,"modeOfCollectionDetail.updatedAt":0
      }
  },
    {
        $lookup: {
            from : "banknames",
            localField:"commonId",
            foreignField:"_id",
            as:"bankNameDetail"
        }
    },
    {
        $project:{
             "bankNameDetail.__v":0, "bankNameDetail.createdAt":0,"bankNameDetail.updatedAt":0
        }
    },
    {
      $lookup: {
          from : "okcredits",
          localField:"commonId",
          foreignField:"_id",
          as:"okCreditDetail"
      }
  },
  {
    $project:{
         "okCreditDetail.__V":0
    }
  },
    {
      $lookup: {
          from : "employees",
          localField:"okCreditDetail.employeeId",
          foreignField:"_id",
          as:"employeDetail"
      }
  },
  {
    $project:{
         "employeDetail.__V":0
    }
  },
  {
    $lookup: {
        from : "lenders",
        localField:"commonId",
        foreignField:"_id",
        as:"partnerDetail"
    }
},
{
    $project:{
         "partnerDetail.__v":0, "partnerDetail.createdAt":0,"partnerDetail.updatedAt":0
    }
},

  ]).sort({ createdAt: -1 });
  success(res, `Emi Collection List For ${status}`, emiStatus);
} catch (error) {
  console.log(error);
  unknownError(res, error);
}
}

// --------Collection Form Fill Then SHow Manager For Update Status accept Or reject-----------
// async function emiStatusUpdate(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return serverValidation(res, {
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }
  
//     const tokenId = new ObjectId(req.Id);
//     const approvalDetail = await employeModel.findById({ _id: tokenId });
//     const name = approvalDetail.employeName;
//     const { emiId, status, reason } = req.body;
//     let emiData = await collectionModel.findById(emiId);
//     if (!emiData) {
//       return notFound(res, "EMI not found");
//     }
  
//     let emiDetail = await collectionModel.findOne({ _id: new ObjectId(emiId), status: "accept" });
//     if (emiDetail) {
//       return badRequest(res, "Emi Already Paid");
//     }
  
//     let emiRejectDetail = await collectionModel.findOne({ _id: new ObjectId(emiId), status: "reject" });
//     if (emiRejectDetail) {
//       return badRequest(res, "Emi Already Reject");
//     }
//     const modeOfCollection = await modeOfCollectionModel.findById({ _id: new ObjectId(emiData.modeOfCollectionId) });
//     const mode = modeOfCollection && modeOfCollection.title ? modeOfCollection.title : null;
//     const bankNameDetail = await bankNameModel.findById({ _id: new ObjectId(emiData.commonId) });
//     const bankName = bankNameDetail && bankNameDetail.title ? bankNameDetail.title : null;
//     const okCreditDetail = await okcreditModel.findById({ _id: new ObjectId(emiData.commonId) });
//     const credit = okCreditDetail && okCreditDetail._id ? okCreditDetail._id : null;
//     let okCreditIn = null;
//     if (credit) {
//       const employeDetail = await employeModel.findById({ _id: new ObjectId(okCreditDetail.employeeId) });
//       okCreditIn = employeDetail && employeDetail.employeName ? employeDetail.employeName : null;
//     }
  
//     if (status === "accept" && emiData.status === "pending") {
//       emiData.status = "accept";
//       emiData.reason = reason;
//       emiData.emiUpdateBy = tokenId; // Add the tokenId of the user who updates the status
//       data = await emiData.save();
  
//       const lastReceipt = await collectionModel.findOne({}).sort({ receiptNo: -1 });
//       let receiptNo = 1001;
//       if (lastReceipt && lastReceipt.receiptNo) {
//         receiptNo = lastReceipt.receiptNo + 1;
//       }
  
//       const pdfRelativePath = await createEmiReceiptPdfIndia(data, receiptNo);
  
//       await collectionModel.findByIdAndUpdate({ _id: emiId }, { pdf: pdfRelativePath, receiptNo: receiptNo });
//       success(res, "EMI Collection Status Accepted Successfully", { data, pdfRelativePath });
//       await collectionGoogleSheet(data, mode, bankName, okCreditIn);
//       await approvalGoogleSheet(data, name);
  
//       const pdfEmailContent =  `
//         <p>Hello ${data.customerName},</p>
//         <p>Thank you for paying EMI</p>
//         ` ;
      
//       const baseURL = process.env.BASE_URL;
//       const ccEmails = [process.env.PDF_CCEMAIL1, process.env.PDF_CCEMAIL2];
//       console.log("ccEmails", ccEmails);
      
//       const attachments = [{
//         path: pdfRelativePath,
//         filename: 'file.pdf',
//         contentType: 'application/pdf'
//       }];
//       if(data.customerEmail && data.customerEmail.trim().toLowerCase() !== "null") {
//         sendEmails(ccEmails, data.customerEmail,` The ${emiData.LD} EMI Collection Reciept.`, pdfEmailContent, attachments);
//       } else if (data.customerEmail === null) {
//         console.log("email null ", data.customerEmail)
//         sendEmails(ccEmails, null, `The ${emiData.LD} EMI Collection Receipt.`, pdfEmailContent, attachments);
//       }
       
  
//     } else if (status === "reject" && emiData.status === "pending") {
//       emiData.status = "reject";
//       emiData.reason = reason;
//       emiData.remarkByManager = "payment Not Received";
//       emiData.emiUpdateBy = tokenId; // Add the tokenId of the user who updates the status
//       data = await emiData.save();
//       if (mode === "cashCollection") {
//         const totalCashBalance = await totalCashModel.findOne({ employeeId: okCreditDetail.employeeId });
//         if (totalCashBalance) {
//           totalCashBalance.creditAmount -= emiData.receivedAmount; 
//           await totalCashBalance.save();
//         }
//       }
//       success(res, "EMI Collection Status Rejected Successfully", data);
//       await emiRejectGoogleSheet(data, mode, bankName, okCreditIn)
//     }
  
//   } catch (error) {
//     console.log(error);
//     unknownError(res, error);
//   }
//   }


// Helper function to download file from URL
async function downloadFileFromUrl(url, timeout = 30000) {
  try {
    console.log('Downloading file from URL:', url);
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'arraybuffer',
      timeout: timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log('File downloaded successfully, size:', response.data.length, 'bytes');
    return Buffer.from(response.data);
  } catch (error) {
    console.error('Error downloading file from URL:', error.message);
    throw error;
  }
}

// Helper function to read local file
async function readLocalFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

// Helper function to prepare attachments for SendGrid
async function prepareAttachments(attachmentPaths) {
  if (!attachmentPaths || attachmentPaths.length === 0) {
    console.log('No attachments to prepare');
    return [];
  }
 
  const attachments = Array.isArray(attachmentPaths) ? attachmentPaths : [attachmentPaths];
  const preparedAttachments = [];
 
  for (const attPath of attachments) {
    try {
      const filePath = attPath.path || attPath;
      console.log('Processing attachment:', filePath);
      
      let fileContent;
      let fileName = attPath.filename || 'attachment.pdf';
      
      // Check if it's a URL or local file path
      if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        console.log('Detected URL, downloading file...');
        try {
          fileContent = await downloadFileFromUrl(filePath);
          // Extract filename from URL if not provided
          if (!attPath.filename) {
            const urlParts = filePath.split('/');
            fileName = urlParts[urlParts.length - 1] || 'downloaded_file.pdf';
          }
        } catch (downloadError) {
          console.error('Failed to download file from URL:', downloadError.message);
          continue;
        }
      } else {
        console.log('Detected local file path, reading file...');
        const resolvedPath = path.resolve(filePath);
        
        // Check if file exists
        try {
          fs.accessSync(resolvedPath);
          console.log('Local file exists and is accessible');
        } catch (accessError) {
          console.error('Local file not accessible:', resolvedPath, accessError.message);
          continue;
        }
        
        try {
          fileContent = await readLocalFile(resolvedPath);
          console.log('Local file read successfully, size:', fileContent.length, 'bytes');
          if (!attPath.filename) {
            fileName = path.basename(resolvedPath);
          }
        } catch (readError) {
          console.error('Error reading local file:', readError.message);
          continue;
        }
      }
      
      if (!fileContent) {
        console.error('No file content available');
        continue;
      }
      
      const base64Content = fileContent.toString('base64');
      
      // Check file size (SendGrid limit is 30MB)
      const fileSizeInMB = fileContent.length / (1024 * 1024);
      if (fileSizeInMB > 25) {
        console.error('File too large:', fileName, 'Size:', fileSizeInMB.toFixed(2), 'MB');
        continue;
      }
      
      preparedAttachments.push({
        content: base64Content,
        filename: fileName,
        type: attPath.contentType || 'application/pdf',
        disposition: 'attachment',
      });
      
      console.log('✅ Attachment prepared successfully:', {
        filename: fileName,
        size: fileSizeInMB.toFixed(2) + 'MB',
        type: attPath.contentType || 'application/pdf',
        base64Length: base64Content.length
      });
      
    } catch (error) {
      console.error('❌ Error preparing attachment:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
  
  console.log('Total attachments prepared:', preparedAttachments.length);
  return preparedAttachments;
}

// Enhanced SendGrid email function with better error handling
// async function sendEmailWithSendGrid(toEmails, ccEmails, subject, htmlContent, attachments = []) {
//   try {

//     // Validate SendGrid API key
//     if (!process.env.SENDGRID_API_KEY) {
//       throw new Error('SENDGRID_API_KEY environment variable is not set');
//     }
    
//     // Validate sender email
//     if (!process.env.SENDGRID_FROM_EMAIL) {
//       throw new Error('FROM_EMAIL environment variable is not set');
//     }
    
//     if (!isValidEmail(process.env.SENDGRID_FROM_EMAIL)) {
//       throw new Error('FROM_EMAIL is not a valid email address');
//     }
    
//     const preparedAttachments = await prepareAttachments(attachments);
//     console.log('Prepared attachments count:', preparedAttachments.length);
    
//     // Process recipients
//     const toArray = Array.isArray(toEmails) ? toEmails : toEmails ? [toEmails] : [];
//     const ccArray = Array.isArray(ccEmails) ? ccEmails : ccEmails ? [ccEmails] : [];
    
//     // Validate emails
//     const validTo = toArray.filter(email => isValidEmail(email));
//     const validCc = ccArray.filter(email => isValidEmail(email));
    
//     if (validTo.length === 0 && validCc.length === 0) {
//       throw new Error('No valid email recipients found');
//     }
    
//     // Prepare SendGrid message
//     const msg = {
//       from: {
//         email: process.env.SENDGRID_FROM_EMAIL
//       },
//       subject: subject.trim(),
//       html: htmlContent,
//       attachments: preparedAttachments
//     };
    
//     // Set recipients
//     if (validTo.length > 0) {
//       msg.to = validTo.map(email => ({ email: email.trim() }));
//     }
    
//     if (validCc.length > 0) {
//       msg.cc = validCc.map(email => ({ email: email.trim() }));
//     }
    
//     // If no TO recipients, use first CC as TO
//     if (validTo.length === 0 && validCc.length > 0) {
//       msg.to = [{ email: validCc[0].trim() }];
//       if (validCc.length > 1) {
//         msg.cc = validCc.slice(1).map(email => ({ email: email.trim() }));
//       }
//     }
    
//     console.log('Final SendGrid message structure:', {
//       from: msg.from,
//       to: msg.to,
//       cc: msg.cc,
//       subject: msg.subject,
//       attachmentCount: preparedAttachments.length,
//       htmlLength: htmlContent.length
//     });
    
//     // Send email
//     console.log('Sending email via SendGrid...');
//     const response = await sgMail.send(msg);
    
//     console.log('SendGrid Response:', {
//       statusCode: response[0].statusCode,
//       headers: response[0].headers,
//       body: response[0].body
//     });
    
//     // Check response status
//     if (response[0].statusCode >= 200 && response[0].statusCode < 300) {
//       console.log('✅ Email sent successfully!');
//       console.log('=== EMAIL SENDING DEBUG END ===');
//       return { success: true, statusCode: response[0].statusCode, messageId: response[0].headers['x-message-id'] };
//     } else {
//       throw new Error(`SendGrid returned status code: ${response[0].statusCode}`);
//     }
    
//   } catch (error) {
//     console.error('❌ SendGrid email error:', error);
    
//     if (error.response) {
//       console.error('SendGrid Error Response:', {
//         statusCode: error.response.status,
//         body: error.response.body,
//         headers: error.response.headers
//       });
      
//       // Check for specific SendGrid errors
//       if (error.response.body && error.response.body.errors) {
//         console.error('SendGrid Error Details:', error.response.body.errors);
//       }
//     }
    
//     console.log('=== EMAIL SENDING DEBUG END ===');
//     return { success: false, error: error.message, details: error.response?.body };
//   }
// }




function sendEmailWithSendGrid(toEmails, ccEmails, subject, htmlContent, attachments) {
  attachments = attachments || [];
  console.log("attachments", attachments);

  if (!token) throw new Error("ZEPTO_API_KEY not set");
  const fromEmail = "noreply@fincooperstech.com";
  const fromName = "Fincoopers";

  const formattedAttachments = attachments.map(function (att) {
    return {
      url: att.path,
      name: att.filename,
      mime_type: att.contentType
    };
  });

  return prepareAttachmentsForZepto(formattedAttachments).then(function (preparedAttachments) {
    const toArray = Array.isArray(toEmails) ? toEmails : toEmails ? [toEmails] : [];
    const ccArray = Array.isArray(ccEmails) ? ccEmails : ccEmails ? [ccEmails] : [];

    const validTo = toArray.filter(isValidEmail);
    const validCc = ccArray.filter(isValidEmail);

    if (validTo.length === 0 && validCc.length === 0) {
      throw new Error("No valid recipients found.");
    }

    const payload = {
      from: {
        address: fromEmail,
        name: fromName
      },
      to: validTo.map(function (email) {
        return { email_address: { address: email } };
      }),
      cc: validCc.length > 0 ? validCc.map(function (email) {
        return { email_address: { address: email } };
      }) : undefined,
      subject: subject.trim(),
      htmlbody: htmlContent,
      attachments: preparedAttachments
    };

    return client.sendMail(payload)
      .then(function (response) {
        console.log("✅ ZeptoMail Sent Successfully:", response.data);
        return { success: true, messageId: response.data.request_id };
      })
      .catch(function (error) {
        console.error("❌ ZeptoMail Error:", error?.response?.data || error.message);
        return { success: false, error: error.message, details: error.response?.data };
      });
  });
}

function prepareAttachmentsForZepto(attachments) {
  if (!Array.isArray(attachments) || attachments.length === 0) {
    return Promise.resolve([]);
  }

  return Promise.all(
    attachments.map(function (attachment) {
      if (!attachment.url) {
        console.warn('Skipping attachment: missing URL');
        return null;
      }

      return axios
        .get(attachment.url, { responseType: 'arraybuffer' })
        .then(function (response) {
          const base64Content = Buffer.from(response.data).toString('base64');
          const name = attachment.name || path.basename(attachment.url);
          const mimeType = attachment.mime_type || mime.lookup(name) || 'application/octet-stream';

          return {
            content: base64Content,
            name: name,
            mime_type: mimeType
          };
        })
        .catch(function (err) {
          console.error('Error fetching attachment from URL:', attachment.url);
          console.error(err.message);
          return null;
        });
    })
  ).then(function (results) {
    return results.filter(Boolean);
  });
}
// Test email function to verify SendGrid setup
async function testSendGridSetup() {
  try {
    console.log('Testing SendGrid setup...');
    const testResult = await sendEmailWithSendGrid(
      process.env.PDF_CCEMAIL1, // Send to first CC email for testing
      null,
      'SendGrid Test Email',
      '<h1>Test Email</h1><p>If you receive this, SendGrid is working correctly!</p>',
      []
    );
    console.log('Test email result:', testResult);
    return testResult;
  } catch (error) {
    console.error('Test email failed:', error);
    return { success: false, error: error.message };
  }
}

async function emiStatusUpdate(req, res) {
  let data;
  
  try {
    console.log('EMI Status Update started');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const tokenId = new ObjectId(req.Id);
    const approvalDetail = await employeModel.findById({ _id: tokenId });
    const name = approvalDetail ? approvalDetail.employeName : 'Unknown';
    const { emiId, status, reason } = req.body;

    console.log('Processing EMI ID:', emiId, 'Status:', status);

    let emiData = await collectionModel.findById(emiId);
    if (!emiData) {
      console.log('EMI not found');
      return notFound(res, "EMI not found");
    }

    let emiDetail = await collectionModel.findOne({ _id: new ObjectId(emiId), status: "accept" });
    if (emiDetail) {
      console.log('EMI already paid');
      return badRequest(res, "Emi Already Paid");
    }

    let emiRejectDetail = await collectionModel.findOne({ _id: new ObjectId(emiId), status: "reject" });
    if (emiRejectDetail) {
      console.log('EMI already rejected');
      return badRequest(res, "Emi Already Reject");
    }

    // Fetch related data
    const modeOfCollection = await modeOfCollectionModel.findById({ _id: new ObjectId(emiData.modeOfCollectionId) });
    const mode = modeOfCollection && modeOfCollection.title ? modeOfCollection.title : null;
    
    const bankNameDetail = await bankNameModel.findById({ _id: new ObjectId(emiData.commonId) });
    const bankName = bankNameDetail && bankNameDetail.title ? bankNameDetail.title : null;
    
    const okCreditDetail = await okcreditModel.findById({ _id: new ObjectId(emiData.commonId) });
    const credit = okCreditDetail && okCreditDetail._id ? okCreditDetail._id : null;
    
    let okCreditIn = null;
    if (credit) {
      const employeDetail = await employeModel.findById({ _id: new ObjectId(okCreditDetail.employeeId) });
      okCreditIn = employeDetail && employeDetail.employeName ? employeDetail.employeName : null;
    }

    if (status === "accept" && emiData.status === "pending") {
      console.log('Processing EMI acceptance...');
      
      emiData.status = "accept";
      emiData.reason = reason;
      emiData.emiUpdateBy = tokenId;
      data = await emiData.save();
      
      console.log('EMI data saved, generating receipt...');
      
      const lastReceipt = await collectionModel.findOne({}).sort({ receiptNo: -1 });
      let receiptNo = 1001;
      if (lastReceipt && lastReceipt.receiptNo) {
        receiptNo = lastReceipt.receiptNo + 1;
      }
      
      console.log('Creating PDF receipt with receipt number:', receiptNo);
      
      const partner = emiData.partner;
      let pdfRelativePath;

      try {
        if (partner === "UGRO" || partner === "AMBIT" || partner === "AU") {
          pdfRelativePath = await createEmiReceiptPdfIndia(data, receiptNo);
        } else {
          pdfRelativePath = await createEmiReceiptPdfCapital(data, receiptNo);
        }
        console.log('PDF created at:', pdfRelativePath);
      } catch (pdfError) {
        console.error('PDF creation error:', pdfError);
        return unknownError(res, 'PDF creation failed: ' + pdfError.message);
      }

      await collectionModel.findByIdAndUpdate({ _id: emiId }, { pdf: pdfRelativePath, receiptNo: receiptNo });
      
      console.log('Updating Google Sheets...');
      
      try {
        await Promise.all([
          collectionGoogleSheet(data, mode, bankName, okCreditIn),
          approvalGoogleSheet(data, name)
        ]);
        console.log('Google Sheets updated successfully');
      } catch (sheetError) {
        console.error('Google Sheets update error (non-blocking):', sheetError);
      }

      // Prepare email content
      const pdfEmailContent = `
       <p>Hello ${data.customerName},</p>
        <p>Thank you for paying EMI</p>
      `;

      const ccEmails = [process.env.PDF_CCEMAIL1, process.env.PDF_CCEMAIL2].filter(email => email);
      console.log("CC Emails:", ccEmails);

      const attachments = [{
        path: pdfRelativePath,
        filename: `EMI_Receipt_${receiptNo}.pdf`,
        contentType: 'application/pdf'
      }];

      // Send response first
      console.log('Sending success response...');
      success(res, "EMI Collection Status Accepted Successfully", { data, pdfRelativePath });

      // Send email in background with detailed logging
      console.log('Starting email sending process...');
      const emailPromise = (async () => {
        try {
          let emailResult;
          
          if (data.customerEmail && isValidEmail(data.customerEmail)) {
            console.log("Sending email to customer:", data.customerEmail);
            emailResult = await sendEmailWithSendGrid(
              data.customerEmail, 
              ccEmails, 
              `EMI Collection Receipt - ${data.LD}`, 
              pdfEmailContent, 
              attachments
            );
          } else {
            console.log("No valid customer email, sending to CC only");
            emailResult = await sendEmailWithSendGrid(
              null, 
              ccEmails, 
              `EMI Collection Receipt - ${data.LD}`, 
              pdfEmailContent, 
              attachments
            );
          }
          
          console.log('Final email result:', emailResult);
          
          if (!emailResult.success) {
            console.error('Email sending failed with details:', emailResult);
            // Optionally, you could save this failure to database for retry later
          }
          
        } catch (emailError) {
          console.error("Email sending process failed:", emailError);
        }
      })();

      emailPromise.catch(err => console.error('Background email error:', err));

    } else if (status === "reject" && emiData.status === "pending") {
      console.log('Processing EMI rejection...');
      
      emiData.status = "reject";
      emiData.reason = reason;
      emiData.remarkByManager = "payment Not Received";
      emiData.emiUpdateBy = tokenId;
      data = await emiData.save();
      
      if (mode === "cashCollection" && okCreditDetail) {
        const totalCashBalance = await totalCashModel.findOne({ employeeId: okCreditDetail.employeeId });
        if (totalCashBalance) {
          totalCashBalance.creditAmount -= emiData.receivedAmount; 
          await totalCashBalance.save();
        }
      }
      
      console.log('Sending rejection success response...');
      success(res, "EMI Collection Status Rejected Successfully", data);
      
      emiRejectGoogleSheet(data, mode, bankName, okCreditIn)
        .catch(err => console.error('Rejection sheet update error:', err));
        
    } else {
      console.log('Invalid status or EMI state');
      return badRequest(res, "Invalid status or EMI is not in pending state");
    }

  } catch (error) {
    console.error("EMI Status Update Error:", error);
    return unknownError(res, error);
  }
}


// -----------------Collection EMi Add Then  Only Email update By Approval Api-------------------
async function emiEmailUpdate(req, res) {
try {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return serverValidation(res, {
      errorName: "serverValidation",
      errors: errors.array(),
    });
  }

  const { emiId, customerEmail } = req.body;
  if (!emiId || emiId.trim() === "") {
    return badRequest(res, "Please select a valid emiId.");
  }
  if (!customerEmail || customerEmail.trim() === "") {
    return badRequest(res, "Please provide a valid customer email.");
  }

  const emiDetail = await collectionModel.findById(emiId);
  if (!emiDetail) {
    return badRequest(res, "EMI not found.");
  }

  // Update the email
  const collectionDetail = await collectionModel.findByIdAndUpdate(
    emiId,
    { $set: { customerEmail: customerEmail } },
    { new: true }
  );

  if (!collectionDetail) {
    return badRequest(res, "EMI Collection Detail Not Found");
  }

  success(res, "Email updated successfully", collectionDetail);

} catch (error) {
  console.log(error);
  unknownError(res, error);
}
}

async function getCollectionDetailByLD(req, res) {
try {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return serverValidation(res, {
      errorName: "serverValidation",
      errors: errors.array(),
    });
  }
  
  const { LD } = req.query;
  const collectionDetail = await collectionModel.aggregate([
    {$match:{LD:LD} },
    {
      $lookup: {
          from : "modelofcollections",
          localField:"modeOfCollectionId",
          foreignField:"_id",
          as:"modeOfCollectionDetail"
      }
  },
  {
      $project:{
           "modeOfCollectionDetail.__v":0, "modeOfCollectionDetail.createdAt":0,"modeOfCollectionDetail.updatedAt":0
      }
  },
    {
        $lookup: {
            from : "banknames",
            localField:"commonId",
            foreignField:"_id",
            as:"bankNameDetail"
        }
    },
    {
        $project:{
             "bankNameDetail.__v":0, "bankNameDetail.createdAt":0,"bankNameDetail.updatedAt":0
        }
    },
    {
      $lookup: {
          from : "okcredits",
          localField:"commonId",
          foreignField:"_id",
          as:"okCreditDetail"
      }
  },
  {
    $project:{
         "okCreditDetail.__V":0
    }
  },
    {
      $lookup: {
          from : "employees",
          localField:"okCreditDetail.employeeId",
          foreignField:"_id",
          as:"employeDetail"
      }
  },
  {
    $project:{
         "employeDetail.__V":0
    }
  },
  {
    $lookup: {
        from : "lenders",
        localField:"commonId",
        foreignField:"_id",
        as:"partnerDetail"
    }
},
{
    $project:{
         "partnerDetail.__v":0, "partnerDetail.createdAt":0,"partnerDetail.updatedAt":0
    }
},

  ]).sort({ createdAt: -1 });
  success(res, `Collection Detail For ${LD}`, collectionDetail);
} catch (error) {
  console.log(error);
  unknownError(res, error);
}
}

// -------------Legal Notice data get By LD Id------------------------
async function getLegalNoticeByLD(req, res) {
try {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return serverValidation(res, {
      errorName: "serverValidation",
      errors: errors.array(),
    });
  }
  
  const { LD } = req.query;

  const legalDetail = await legalNoticeModel.aggregate([
    {$match:{ customerFincNo: LD , status:"active"} },
    {
        $lookup: {
            from : "noticetypes",
            localField:"noticeTypeId",
            foreignField:"_id",
            as:"noticeTypeDetail"
        }
    },
    {
        $project:{
             "noticeTypeDetail.__v":0, 
        }
    },
    {
      $unwind: "$noticeTypeDetail"
  }
  ]);
  if (!legalDetail || legalDetail.length === 0) {
    return notFound(res, `No Legal Notice By Given CustomerFincId ${LD}`,[]);
  }
  
  success(res, `Legal Notice By Given CustomerFincId ${LD}`, legalDetail);
} catch (error) {
  console.log(error);
  unknownError(res, error);
}
}

// ---------------Search APi WIth EmployeeName And UniqueId in visit and collection Model-----------
async function getEmployeesNotInVisitOrCollection(req, res) {
  try {
    const queryDate = req.query.date ? new Date(req.query.date) : new Date();
    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Step 1: Fetch the collection role
    const collectionRole = await roleModel.findOne({ roleName: "collection" });
    if (!collectionRole) {
      return notFound(res, "Collection role not found");
    }
    
    // Step 2: Get active employees with collection role
    const employees = await employeModel.find(
      { 
        status: "active",
        roleId: { $in: [collectionRole._id] }
      },
      { 
        _id: 1, 
        employeUniqueId: 1, 
        employeName: 1, 
        email: 1, 
        workEmail: 1, 
        mobileNo: 1,
        reportingManagerId: 1
      }
    ).lean();
    
    if (!employees.length) {
      return success(res, "No active collection employees found", []);
    }
    
    // Step 3: Find employees who haven't done any visits or collections today
    const absentEmployees = [];
    
    for (const employee of employees) {
      // Create possible formats for employee identifiers based on your sample data
      const employeeIdentifier = `${employee.employeName}-${employee.employeUniqueId}`;
      const collectionIdentifier = `${employee.employeName}-${employee.employeUniqueId}`;
      
      // console.log("Checking employee:", employeeIdentifier);
      
      // Check if employee has any visits today (using both formats)
      const visitCount = await visitModel.countDocuments({
        $or: [
          { visitBy: employeeIdentifier, createdAt: { $gte: startOfDay, $lte: endOfDay } },
          { visitBy: collectionIdentifier, createdAt: { $gte: startOfDay, $lte: endOfDay } }
        ]
      });
      
      // console.log("visitCount", visitCount);
      
      // Check if employee has any collections today (using both formats)
      const collectionCount = await collectionModel.countDocuments({
        $or: [
          { collectedBy: employeeIdentifier, createdAt: { $gte: startOfDay, $lte: endOfDay } },
          { collectedBy: collectionIdentifier, createdAt: { $gte: startOfDay, $lte: endOfDay } }
        ]
      });
      
      // console.log("collectionCount", collectionCount);
      
      // If employee has no activity today, add to inactive list
      if (visitCount === 0 && collectionCount === 0) {
        absentEmployees.push({
          ...employee,
          todayVisit: 0,
          todayCollection: 0
        });
      }
    }
    
    return success(res, `Found ${absentEmployees.length} Absent Collection Employees`, absentEmployees);
  } catch (error) {
    console.error("Error in getEmployeesNotInVisitOrCollection:", error);
    return unknownError(res, error.message);
  }
}


// ------------visit and collection Gallery Api---------------------------
// async function collectionGalleryAPi(req, res) {
// try {
//   const page = parseInt(req.query.page, 10) || 1;
//   const limit = parseInt(req.query.limit, 10) || 10;
//   const skip = (page - 1) * limit;
//   const { startDate, endDate, filterBy } = req.query;

//   let transactionQuery = {};
//   let visitQuery = {};

//   const extractEmployeeId = (identifier) => {
//     const match = identifier.match(/([A-Za-z]+[-]?\d+)/);
//     return match ? match[1].toUpperCase() : null;
//   };

//   // Set default dates to today if not provided
//   const today = new Date();
//   const defaultStartDate = new Date(today.setHours(0, 0, 0, 0));
//   const defaultEndDate = new Date(today.setHours(23, 59, 59, 999));

//   const start = startDate ? new Date(startDate) : defaultStartDate;
//   const end = endDate ? new Date(endDate) : defaultEndDate;

//   start.setHours(0, 0, 0, 0);
//   end.setHours(23, 59, 59, 999);

//   // Always apply date range
//   transactionQuery.createdAt = { $gte: start, $lte: end };
//   visitQuery.createdAt = { $gte: start, $lte: end };

//   if (filterBy) {
//     transactionQuery.collectedBy = { $regex: new RegExp(filterBy, 'i') };
//     visitQuery.visitBy = { $regex: new RegExp(filterBy, 'i') };
//   }
//   // Fetch transactions and visits
//   const transactions = await collectionModel.find(transactionQuery)
//     .select('LD customerName collectedBy transactionImage remarkByCollection receivedAmount status location createdAt')
//     .sort({ createdAt: -1 });

//   const visits = await visitModel.find(visitQuery)
//     .select('LD customerName visitBy visitSelfie customerResponse reasonForNotPay solution reasonForCustomerNotContactable status location createdAt')
//     .sort({ createdAt: -1 });

//   const groupedData = {};

//   // Group transaction images
//   transactions.forEach((transaction) => {
//     const visitAndEmiBy = extractEmployeeId(transaction.collectedBy);
//     if (!visitAndEmiBy) return;

//     if (!groupedData[visitAndEmiBy]) {
//       groupedData[visitAndEmiBy] = { transactionImages: [], visitSelfies: [] };
//     }
//     groupedData[visitAndEmiBy].transactionImages.push({
//       transactionImage: transaction.transactionImage,
//       LD: transaction.LD,
//       customerName: transaction.customerName,
//       remarkByCollection: transaction.remarkByCollection,
//       receivedAmount: transaction.receivedAmount,
//       status: transaction.status,
//       location: transaction.location,
//       createdAt: transaction.createdAt,
//     });
//   });

//   // Group visit selfies
//   visits.forEach((visit) => {
//     const visitAndEmiBy = extractEmployeeId(visit.visitBy);
//     if (!visitAndEmiBy) return;

//     if (!groupedData[visitAndEmiBy]) {
//       groupedData[visitAndEmiBy] = { transactionImages: [], visitSelfies: [] };
//     }
//     groupedData[visitAndEmiBy].visitSelfies.push({
//       visitSelfie: visit.visitSelfie,
//       LD: visit.LD,
//       customerName: visit.customerName,
//       customerResponse: visit.customerResponse,
//       reasonForNotPay: visit.reasonForNotPay,
//       solution: visit.solution,
//       reasonForCustomerNotContactable: visit.reasonForCustomerNotContactable,
//       status: visit.status,
//       location: visit.location,
//       createdAt: visit.createdAt,
//     });
//   });

//   const groupedArray = Object.entries(groupedData).map(([employeeId, data]) => ({
//     visitAndEmiBy: employeeId,
//     ...data,
//   }));

//   const totalRecords = groupedArray.length;
//   const paginatedData = groupedArray.slice(skip, skip + limit);
  
//   const employeeIds = paginatedData.map((item) => item.visitAndEmiBy);

//   const employees = await employeModel
//     .find({ employeUniqueId: { $in: employeeIds } })
//     .select('employeUniqueId employeName mobileNo workEmail employeePhoto  fatherName joiningDate');
    
//   const employeeMap = employees.reduce((map, employee) => {
//     map[employee.employeUniqueId] = employee;
//     return map;
//   }, {});

//   // const roleIds = [...new Set(employees.map((emp) => emp.roleId).filter(Boolean))];

//   // const roles = await roleModel
//   //   .find({ _id: { $in: roleIds } })
//   //   .select('_id roleName');

//   // const roleMap = roles.reduce((map, role) => {
//   //   map[role._id] = role.roleName;
//   //   return map;
//   // }, {});

//   const result = employeeIds.map((employeeId) => ({
//     visitAndEmiBy: employeeId,
//     transactionImages: groupedData[employeeId].transactionImages,
//     visitSelfies: groupedData[employeeId].visitSelfies,
//     employeeDetail: employeeMap[employeeId] || null,
//     // roleName: roleMap[employeeMap[employeeId]?.roleId] || null,
//   }));

//   const totalTransactions = await collectionModel.aggregate([
//     {
//       $match: {
//         ...transactionQuery,
//         status: "accept",
//       },
//     },
//     {
//       $group: {
//         _id: null,
//         totalReceivedEmiAmount:{ $sum: "$receivedAmount" },
//       },
//     },
//   ]);
  
//   const totalReceivedEmiAmount = totalTransactions.length
//     ? totalTransactions[0].totalReceivedEmiAmount
//     : 0;

//   const totalVisits = await visitModel.countDocuments({
//     ...visitQuery,
//     status: "accept",
//   });

//   const pagination = {
//     currentPage: page,
//     pageSize: limit,
//     totalPages: Math.ceil(totalRecords / limit),
//     totalRecords,
//   };

//   success(res, "Grouped Visit and Transaction Data", { result, pagination, totalVisits, totalReceivedEmiAmount });
// } catch (error) {
//   console.log(error);
//   unknownError(res, error);
// }
// }

async function collectionGalleryAPi(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const { startDate, endDate, filterBy, branchId } = req.query;

    let transactionQuery = {};
    let visitQuery = {};

    const extractEmployeeId = (identifier) => {
      const match = identifier.match(/([A-Za-z]+[-]?\d+)/);
      return match ? match[1].toUpperCase() : null;
    };

    // Set default dates to today if not provided
    const today = new Date();
    const defaultStartDate = new Date(today.setHours(0, 0, 0, 0));
    const defaultEndDate = new Date(today.setHours(23, 59, 59, 999));

    const start = startDate ? new Date(startDate) : defaultStartDate;
    const end = endDate ? new Date(endDate) : defaultEndDate;

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Always apply date range
    transactionQuery.createdAt = { $gte: start, $lte: end };
    visitQuery.createdAt = { $gte: start, $lte: end };

    if (filterBy) {
      transactionQuery.collectedBy = { $regex: new RegExp(filterBy, 'i') };
      visitQuery.visitBy = { $regex: new RegExp(filterBy, 'i') };
    }

    // Branch filtering - only apply if a specific branchId is provided AND not "all"
    let branchEmployeeIds = [];
    if (branchId && branchId !== "all") {
      // Get employees from the specified branch
      const branchEmployees = await employeModel
        .find({ branchId })
        .select('employeUniqueId');
      
      branchEmployeeIds = branchEmployees.map(emp => emp.employeUniqueId);
      
      // Filter transactions and visits based on employees from the branch
      if (branchEmployeeIds.length > 0) {
        // Create exact match patterns for employee IDs
        const exactMatchConditions = branchEmployeeIds.map(id => {
          // Escape special regex characters to ensure exact matching
          const escapedId = id.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          return new RegExp(`\\b${escapedId}\\b`, 'i');
        });
        
        // Store the original filterBy condition if it exists
        const originalTransactionFilterBy = transactionQuery.collectedBy;
        const originalVisitFilterBy = visitQuery.visitBy;
        
        // Remove existing collectedBy/visitBy filters
        if (originalTransactionFilterBy) delete transactionQuery.collectedBy;
        if (originalVisitFilterBy) delete visitQuery.visitBy;
        
        // Combine conditions properly
        transactionQuery = { 
          $and: [
            transactionQuery, // Keep date range and any other conditions
            { collectedBy: { $in: exactMatchConditions } } // Exact match for employee IDs
          ]
        };
        
        visitQuery = { 
          $and: [
            visitQuery, // Keep date range and any other conditions
            { visitBy: { $in: exactMatchConditions } } // Exact match for employee IDs
          ]
        };
        
        // If we also had filterBy, add it back with $and
        if (originalTransactionFilterBy) {
          transactionQuery.$and.push({ collectedBy: originalTransactionFilterBy });
        }
        
        if (originalVisitFilterBy) {
          visitQuery.$and.push({ visitBy: originalVisitFilterBy });
        }
      } else {
        // No employees found in the branch - return empty results
        return success(res, "Grouped Visit and Transaction Data", { 
          result: [], 
          pagination: { currentPage: page, pageSize: limit, totalPages: 0, totalRecords: 0 },
          totalVisits: 0,
          totalReceivedEmiAmount: 0
        });
      }
    }

    // Fetch transactions and visits
    const transactions = await collectionModel.find(transactionQuery)
      .select('LD customerName collectedBy transactionImage remarkByCollection receivedAmount status location createdAt')
      .sort({ createdAt: -1 });

    const visits = await visitModel.find(visitQuery)
      .select('LD customerName visitBy visitSelfie customerResponse reasonForNotPay solution reasonForCustomerNotContactable status location createdAt')
      .sort({ createdAt: -1 });

    const groupedData = {};

    // Group transaction images
    transactions.forEach((transaction) => {
      const visitAndEmiBy = extractEmployeeId(transaction.collectedBy);
      if (!visitAndEmiBy) return;

      if (!groupedData[visitAndEmiBy]) {
        groupedData[visitAndEmiBy] = { transactionImages: [], visitSelfies: [] };
      }
      groupedData[visitAndEmiBy].transactionImages.push({
        transactionImage: transaction.transactionImage,
        LD: transaction.LD,
        customerName: transaction.customerName,
        remarkByCollection: transaction.remarkByCollection,
        receivedAmount: transaction.receivedAmount,
        status: transaction.status,
        location: transaction.location,
        createdAt: transaction.createdAt,
      });
    });

    // Group visit selfies
    visits.forEach((visit) => {
      const visitAndEmiBy = extractEmployeeId(visit.visitBy);
      if (!visitAndEmiBy) return;

      if (!groupedData[visitAndEmiBy]) {
        groupedData[visitAndEmiBy] = { transactionImages: [], visitSelfies: [] };
      }
      groupedData[visitAndEmiBy].visitSelfies.push({
        visitSelfie: visit.visitSelfie,
        LD: visit.LD,
        customerName: visit.customerName,
        customerResponse: visit.customerResponse,
        reasonForNotPay: visit.reasonForNotPay,
        solution: visit.solution,
        reasonForCustomerNotContactable: visit.reasonForCustomerNotContactable,
        status: visit.status,
        location: visit.location,
        createdAt: visit.createdAt,
      });
    });

    // Convert grouped data to array format
    let groupedArray = Object.entries(groupedData).map(([employeeId, data]) => ({
      visitAndEmiBy: employeeId,
      ...data,
    }));

    // Apply branch filtering if needed
    if (branchId && branchId !== "all") {
      groupedArray = groupedArray.filter(item => 
        branchEmployeeIds.includes(item.visitAndEmiBy));
    }

    // Get total count AFTER filtering but BEFORE pagination
    const totalFilteredRecords = groupedArray.length;

    // Calculate pagination
    const totalPages = Math.ceil(totalFilteredRecords / limit);
    
    // Apply pagination
    const paginatedData = groupedArray.slice(skip, skip + limit);
    
    // Extract employee IDs from paginated data
    const employeeIds = paginatedData.map(item => item.visitAndEmiBy);

    // Fetch employee details for the paginated results
    const employees = await employeModel
      .find({ employeUniqueId: { $in: employeeIds } })
      .select('employeUniqueId employeName mobileNo branchId workEmail employeePhoto fatherName joiningDate');
      
    // Create map for easy lookup
    const employeeMap = employees.reduce((map, employee) => {
      map[employee.employeUniqueId] = employee;
      return map;
    }, {});

    // Build the final result array
    const result = paginatedData.map(groupedItem => ({
      visitAndEmiBy: groupedItem.visitAndEmiBy,
      transactionImages: groupedItem.transactionImages,
      visitSelfies: groupedItem.visitSelfies,
      employeeDetail: employeeMap[groupedItem.visitAndEmiBy] || null,
    }));

    // Calculate total visits and total received amount
    const totalTransactions = await collectionModel.aggregate([
      {
        $match: {
          ...transactionQuery,
          status: "accept",
        },
      },
      {
        $group: {
          _id: null,
          totalReceivedEmiAmount: { $sum: "$receivedAmount" },
        },
      },
    ]);
    
    const totalReceivedEmiAmount = totalTransactions.length
      ? totalTransactions[0].totalReceivedEmiAmount
      : 0;

    const totalVisits = await visitModel.countDocuments({
      ...visitQuery,
      status: "accept",
    });

    // Create pagination object
    const pagination = {
      currentPage: page,
      pageSize: limit,
      totalPages: totalPages,
      totalRecords: totalFilteredRecords,
    };

    // Return success response
    success(res, "Grouped Visit and Transaction Data", { 
      result, 
      pagination, 
      totalVisits, 
      totalReceivedEmiAmount 
    });
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

async function newCollectionGalleryAPi(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const { startDate, endDate, filterBy, branchId, regionalBranchId } = req.query; // Added regionalBranchId

    let transactionQuery = {};
    let visitQuery = {};

    const extractEmployeeId = (identifier) => {
      const match = identifier.match(/([A-Za-z]+[-]?\d+)/);
      return match ? match[1].toUpperCase() : null;
    };

    // Set default dates to today if not provided
    const today = new Date();
    const defaultStartDate = new Date(today.setHours(0, 0, 0, 0));
    const defaultEndDate = new Date(today.setHours(23, 59, 59, 999));

    const start = startDate ? new Date(startDate) : defaultStartDate;
    const end = endDate ? new Date(endDate) : defaultEndDate;

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Always apply date range
    transactionQuery.createdAt = { $gte: start, $lte: end };
    visitQuery.createdAt = { $gte: start, $lte: end };

    if (filterBy) {
      transactionQuery.collectedBy = { $regex: new RegExp(filterBy, 'i') };
      visitQuery.visitBy = { $regex: new RegExp(filterBy, 'i') };
    }

    // Handle the regional branch filter first if provided and not "all"
    let filteredBranchIds = [];
    if (regionalBranchId && regionalBranchId !== "all") {
      // Get branches that belong to the specified regional branch
      const regionalBranches = await newbranch.find({ regionalBranchId: regionalBranchId }).select('_id');
      
      filteredBranchIds = regionalBranches.map(branch => branch._id.toString());
      
      if (filteredBranchIds.length === 0) {
        // No branches found in this regional branch - return empty results
        return success(res, "Grouped Visit and Transaction Data", { 
          result: [], 
          pagination: { currentPage: page, pageSize: limit, totalPages: 0, totalRecords: 0 },
          totalVisits: 0,
          totalReceivedEmiAmount: 0
        });
      }
    }

    // Branch filtering - only apply if a specific branchId is provided AND not "all"
    let branchEmployeeIds = [];
    // If branchId is provided, use it directly (this takes precedence)
    if (branchId && branchId !== "all") {
      // Get employees from the specified branch
      const branchEmployees = await employeModel
        .find({ branchId })
        .select('employeUniqueId');
      
      branchEmployeeIds = branchEmployees.map(emp => emp.employeUniqueId);
    } 
    // If regionalBranchId filter was applied and branchId wasn't specified
    else if (filteredBranchIds.length > 0) {
      // Get employees from all branches in the regional branch
      const branchEmployees = await employeModel
        .find({ branchId: { $in: filteredBranchIds } })
        .select('employeUniqueId');
      
      branchEmployeeIds = branchEmployees.map(emp => emp.employeUniqueId);
    }
    
    // Apply employee filtering if we have branch employees to filter by
    if (branchEmployeeIds.length > 0) {
      // Create exact match patterns for employee IDs
      const exactMatchConditions = branchEmployeeIds.map(id => {
        // Escape special regex characters to ensure exact matching
        const escapedId = id.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        return new RegExp(`\\b${escapedId}\\b`, 'i');
      });
      
      // Store the original filterBy condition if it exists
      const originalTransactionFilterBy = transactionQuery.collectedBy;
      const originalVisitFilterBy = visitQuery.visitBy;
      
      // Remove existing collectedBy/visitBy filters
      if (originalTransactionFilterBy) delete transactionQuery.collectedBy;
      if (originalVisitFilterBy) delete visitQuery.visitBy;
      
      // Combine conditions properly
      transactionQuery = { 
        $and: [
          transactionQuery, // Keep date range and any other conditions
          { collectedBy: { $in: exactMatchConditions } } // Exact match for employee IDs
        ]
      };
      
      visitQuery = { 
        $and: [
          visitQuery, // Keep date range and any other conditions
          { visitBy: { $in: exactMatchConditions } } // Exact match for employee IDs
        ]
      };
      
      // If we also had filterBy, add it back with $and
      if (originalTransactionFilterBy) {
        transactionQuery.$and.push({ collectedBy: originalTransactionFilterBy });
      }
      
      if (originalVisitFilterBy) {
        visitQuery.$and.push({ visitBy: originalVisitFilterBy });
      }
    } else if ((branchId && branchId !== "all") || (regionalBranchId && regionalBranchId !== "all" && filteredBranchIds.length === 0)) {
      // Branch or regional branch was specified but no employees found - return empty results
      return success(res, "Grouped Visit and Transaction Data", { 
        result: [], 
        pagination: { currentPage: page, pageSize: limit, totalPages: 0, totalRecords: 0 },
        totalVisits: 0,
        totalReceivedEmiAmount: 0
      });
    }

    // Fetch transactions and visits
    const transactions = await collectionModel.find(transactionQuery)
      .select('LD customerName collectedBy transactionImage remarkByCollection receivedAmount status location createdAt')
      .sort({ createdAt: -1 });

    const visits = await visitModel.find(visitQuery)
      .select('LD customerName visitBy visitSelfie customerResponse reasonForNotPay solution reasonForCustomerNotContactable status location createdAt')
      .sort({ createdAt: -1 });

    const groupedData = {};

    // Group transaction images
    transactions.forEach((transaction) => {
      const visitAndEmiBy = extractEmployeeId(transaction.collectedBy);
      if (!visitAndEmiBy) return;

      if (!groupedData[visitAndEmiBy]) {
        groupedData[visitAndEmiBy] = { transactionImages: [], visitSelfies: [] };
      }
      groupedData[visitAndEmiBy].transactionImages.push({
        transactionImage: transaction.transactionImage,
        LD: transaction.LD,
        customerName: transaction.customerName,
        remarkByCollection: transaction.remarkByCollection,
        receivedAmount: transaction.receivedAmount,
        status: transaction.status,
        location: transaction.location,
        createdAt: transaction.createdAt,
      });
    });

    // Group visit selfies
    visits.forEach((visit) => {
      const visitAndEmiBy = extractEmployeeId(visit.visitBy);
      if (!visitAndEmiBy) return;

      if (!groupedData[visitAndEmiBy]) {
        groupedData[visitAndEmiBy] = { transactionImages: [], visitSelfies: [] };
      }
      groupedData[visitAndEmiBy].visitSelfies.push({
        visitSelfie: visit.visitSelfie,
        LD: visit.LD,
        customerName: visit.customerName,
        customerResponse: visit.customerResponse,
        reasonForNotPay: visit.reasonForNotPay,
        solution: visit.solution,
        reasonForCustomerNotContactable: visit.reasonForCustomerNotContactable,
        status: visit.status,
        location: visit.location,
        createdAt: visit.createdAt,
      });
    });

    // Convert grouped data to array format with the new structure
    let groupedArray = Object.entries(groupedData).map(([employeeId, data]) => {
      // Create a combined history array
      const history = [
        // Add collection transactions with type field
        ...data.transactionImages.map(transaction => ({
          ...transaction,
          type: "collection"
        })),
        
        // Add visits with type field
        ...data.visitSelfies.map(visit => ({
          ...visit,
          type: "visit"
        }))
      ];
      
      // Sort combined history by createdAt in descending order (newest first)
      history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      return {
        visitAndEmiBy: employeeId,
        history: history
        // No need to include transactionImages and visitSelfies separately anymore
      };
    });

    // Apply branch filtering if needed
    if (branchId && branchId !== "all") {
      groupedArray = groupedArray.filter(item => 
        branchEmployeeIds.includes(item.visitAndEmiBy));
    }

    // Get total count AFTER filtering but BEFORE pagination
    const totalFilteredRecords = groupedArray.length;

    // Calculate pagination
    const totalPages = Math.ceil(totalFilteredRecords / limit);
    
    // Apply pagination
    const paginatedData = groupedArray.slice(skip, skip + limit);
    
    // Extract employee IDs from paginated data
    const employeeIds = paginatedData.map(item => item.visitAndEmiBy);

    // Fetch employee details for the paginated results
    const employees = await employeModel
      .find({ employeUniqueId: { $in: employeeIds } })
      .select('employeUniqueId employeName mobileNo branchId workEmail employeePhoto fatherName joiningDate');
    
    // Extract unique branch IDs from employees
    const branchIds = [...new Set(employees.map(emp => emp.branchId))];
    
    // Fetch branch details for the employee branch IDs
    const branches = await newbranch.find({ _id: { $in: branchIds } }).select('_id name');
    
    // Create a map of branch IDs to branch names for easy lookup
    const branchMap = branches.reduce((map, branch) => {
      map[branch._id.toString()] = branch.name;
      return map;
    }, {});
      
    // Create map for employee lookup, including branch name from branchMap
    const employeeMap = employees.reduce((map, employee) => {
      // Get the branch name using the branchId
      const branchName = branchMap[employee.branchId.toString()] || 'Unknown Branch';
      
      // Create a modified employee object with the branch name
      map[employee.employeUniqueId] = {
        ...employee.toObject(), // Convert Mongoose document to plain object
        branchName: branchName // Add the branch name
      };
      
      return map;
    }, {});

    // Build the final result array with the new format
    const result = paginatedData.map(groupedItem => ({
      visitAndEmiBy: groupedItem.visitAndEmiBy,
      history: groupedItem.history,
      employeeDetail: employeeMap[groupedItem.visitAndEmiBy] || null,
    }));

    // Calculate total visits and total received amount
    const totalTransactions = await collectionModel.aggregate([
      {
        $match: {
          ...transactionQuery,
          status: "accept",
        },
      },
      {
        $group: {
          _id: null,
          totalReceivedEmiAmount: { $sum: "$receivedAmount" },
        },
      },
    ]);
    
    const totalReceivedEmiAmount = totalTransactions.length
      ? totalTransactions[0].totalReceivedEmiAmount
      : 0;

    const totalVisits = await visitModel.countDocuments({
      ...visitQuery,
      status: "accept",
    });

    // Create pagination object
    const pagination = {
      currentPage: page,
      pageSize: limit,
      totalPages: totalPages,
      totalRecords: totalFilteredRecords,
    };

    // Return success response
    success(res, "Grouped Visit and Transaction Data", { 
      result, 
      pagination, 
      totalVisits, 
      totalReceivedEmiAmount 
    });
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// -----------COLLECTION GALLERY LIST GET BY REPORINGmANAGERID BY TOKEN----------
async function collectionGalleryManagerAPi(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const { startDate, endDate, filterBy } = req.query;
    const tokenId = new ObjectId(req.Id);

    // Find collection role
    const collectionRole = await roleModel.findOne({ roleName: "collection" });
    if (!collectionRole) {
      return notFound(res, "Collection role not found");
    }

    // Parse dates
    // Set default dates to today if not provided
    const today = new Date();
    const defaultStartDate = new Date(today.setHours(0, 0, 0, 0));
    const defaultEndDate = new Date(today.setHours(23, 59, 59, 999));

    const start = startDate ? new Date(startDate) : defaultStartDate;
    const end = endDate ? new Date(endDate) : defaultEndDate;

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Get the token employee
    const tokenEmployee = await employeModel.findById(tokenId);
    if (!tokenEmployee) {
      return notFound(res, "Employee not found");
    }

    // Get direct subordinates
    const directSubordinates = await employeModel.find({
      reportingManagerId: tokenId,
      status: "active"
    });

    // Get all subordinates in the hierarchy under direct subordinates
    const allSubordinates = await getAllSubordinates(directSubordinates.map(emp => emp._id));

    // Combine all employees in hierarchy
    const allEmployees = [tokenEmployee, ...directSubordinates, ...allSubordinates];

    // Filter collection employees
    const collectionEmployees = allEmployees.filter(emp => {
      if (!emp.roleId) return false;
      
      // Handle roleId as array or single value
      if (Array.isArray(emp.roleId)) {
        return emp.roleId.some(role => role.toString() === collectionRole._id.toString());
      } else {
        return emp.roleId.toString() === collectionRole._id.toString();
      }
    });

    if (!collectionEmployees.length) {
      return notFound(res, "No employees found with the collection role in your hierarchy");
    }

    // Extract employee IDs and names for pattern matching
    const employeeIds = collectionEmployees.map(emp => emp.employeUniqueId);
    const employeeNames = collectionEmployees.map(emp => emp.employeName);

    // Create patterns for filtering by employee IDs
    const employeePatterns = [];
    employeeIds.forEach(id => {
      if (id) employeePatterns.push(new RegExp(id, 'i'));
      // Add patterns for employeeName-employeId format
      employeeNames.forEach(name => {
        if (name && id) employeePatterns.push(new RegExp(`${name}-${id}`, 'i'));
      });
    });

    // Create query objects
    let transactionQuery = {
      createdAt: { $gte: start, $lte: end }
    };
    
    let visitQuery = {
      createdAt: { $gte: start, $lte: end }
    };

    const extractEmployeeId = (identifier) => {
      const match = identifier.match(/([A-Za-z]+[-]?\d+)/);
      return match ? match[1].toUpperCase() : null;
    };

    if (filterBy) {
      transactionQuery.collectedBy = { $regex: new RegExp(filterBy, 'i') };
      visitQuery.visitBy = { $regex: new RegExp(filterBy, 'i') };
    } else {
      // Only get transactions/visits from employees under this manager
      transactionQuery.collectedBy = { $in: employeePatterns };
      visitQuery.visitBy = { $in: employeePatterns };
    }

    // Fetch transactions and visits
    const transactions = await collectionModel.find(transactionQuery)
      .select('LD customerName collectedBy transactionImage remarkByCollection receivedAmount status location createdAt')
      .sort({ createdAt: -1 });

    const visits = await visitModel.find(visitQuery)
      .select('LD customerName visitBy visitSelfie customerResponse reasonForNotPay solution reasonForCustomerNotContactable status location createdAt')
      .sort({ createdAt: -1 });

    const groupedData = {};

    // Group transaction images
    transactions.forEach((transaction) => {
      const visitAndEmiBy = extractEmployeeId(transaction.collectedBy);
      if (!visitAndEmiBy) return;

      if (!groupedData[visitAndEmiBy]) {
        groupedData[visitAndEmiBy] = { transactionImages: [], visitSelfies: [] };
      }
      groupedData[visitAndEmiBy].transactionImages.push({
        transactionImage: transaction.transactionImage,
        LD: transaction.LD,
        customerName: transaction.customerName,
        remarkByCollection: transaction.remarkByCollection,
        receivedAmount: transaction.receivedAmount,
        status: transaction.status,
        location: transaction.location,
        createdAt: transaction.createdAt,
      });
    });

    // Group visit selfies
    visits.forEach((visit) => {
      const visitAndEmiBy = extractEmployeeId(visit.visitBy);
      if (!visitAndEmiBy) return;

      if (!groupedData[visitAndEmiBy]) {
        groupedData[visitAndEmiBy] = { transactionImages: [], visitSelfies: [] };
      }
      groupedData[visitAndEmiBy].visitSelfies.push({
        visitSelfie: visit.visitSelfie,
        LD: visit.LD,
        customerName: visit.customerName,
        customerResponse: visit.customerResponse,
        reasonForNotPay: visit.reasonForNotPay,
        solution: visit.solution,
        reasonForCustomerNotContactable: visit.reasonForCustomerNotContactable,
        status: visit.status,
        location: visit.location,
        createdAt: visit.createdAt,
      });
    });

    const groupedArray = Object.entries(groupedData).map(([employeeId, data]) => ({
      visitAndEmiBy: employeeId,
      ...data,
    }));

    const totalRecords = groupedArray.length;
    const paginatedData = groupedArray.slice(skip, skip + limit);
    
    const employeeIdsFromData = paginatedData.map((item) => item.visitAndEmiBy);

    const employeeDetails = await employeModel
      .find({ employeUniqueId: { $in: employeeIdsFromData } })
      .select('employeUniqueId employeName mobileNo workEmail employeePhoto fatherName joiningDate');
      
    const employeeMap = employeeDetails.reduce((map, employee) => {
      map[employee.employeUniqueId] = employee;
      return map;
    }, {});

    const result = employeeIdsFromData.map((employeeId) => ({
      visitAndEmiBy: employeeId,
      transactionImages: groupedData[employeeId].transactionImages,
      visitSelfies: groupedData[employeeId].visitSelfies,
      employeeDetail: employeeMap[employeeId] || null,
    }));

    const totalTransactions = await collectionModel.aggregate([
      {
        $match: {
          ...transactionQuery,
          status: "accept",
        },
      },
      {
        $group: {
          _id: null,
          totalReceivedEmiAmount:{ $sum: "$receivedAmount" },
        },
      },
    ]);
    
    const totalReceivedEmiAmount = totalTransactions.length
      ? totalTransactions[0].totalReceivedEmiAmount
      : 0;

    const totalVisits = await visitModel.countDocuments({
      ...visitQuery,
      status: "accept",
    });

    const pagination = {
      currentPage: page,
      pageSize: limit,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
    };

    // Return the response with exactly the same structure as requested
    success(res, "Grouped Visit and Transaction Data", { 
      result, 
      pagination, 
      totalVisits, 
      totalReceivedEmiAmount
    });
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// Helper function to get all subordinates in a flat list using a single database query
async function getAllSubordinates(rootIds) {
  try {
    // Start with an empty result array
    let allSubordinates = [];
    
    // Keep track of IDs we need to query for
    let idsToQuery = [...rootIds.map(id => id.toString())];
    
    // Keep fetching until we have no more IDs to query
    while (idsToQuery.length > 0) {
      // Query for employees that report to any of these managers
      const subordinates = await employeModel.find({
        reportingManagerId: { $in: idsToQuery },
        status: "active"
      });
      
      // No more subordinates found, we're done
      if (subordinates.length === 0) {
        break;
      }
      
      // Add these subordinates to our result
      allSubordinates = [...allSubordinates, ...subordinates];
      
      // Get the IDs of these subordinates to find their subordinates in the next iteration
      idsToQuery = subordinates.map(emp => emp._id.toString());
    }
    
    return allSubordinates;
  } catch (error) {
    console.log("Error in getAllSubordinates:", error);
    throw error;
  }
}

// -------------COLLECTION AND VISIT DATA BY EMPLOYEEID--------------------
async function getCollAndVisitByEmployeeId(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const { filterBy, branchId, employeeId } = req.query;

    // Check if employeeId exists and get employee details
    let employeeUniqueId;
    if (employeeId) {
      const employee = await employeModel.findById(employeeId)
        .select('employeUniqueId')
        .lean();
      
      if (!employee) {
        return failure(res, "Employee not found");
      }
      
      employeeUniqueId = employee.employeUniqueId;
    }

    // Prepare queries without date restrictions
    let transactionQuery = {};
    let visitQuery = {};

    if (filterBy) {
      transactionQuery.collectedBy = { $regex: new RegExp(filterBy, 'i') };
      visitQuery.visitBy = { $regex: new RegExp(filterBy, 'i') };
    }

    // Add employee filter if employeeId was provided
    if (employeeUniqueId) {
      transactionQuery.collectedBy = { $regex: new RegExp(employeeUniqueId, 'i') };
      visitQuery.visitBy = { $regex: new RegExp(employeeUniqueId, 'i') };
    }

    // Execute all database queries in parallel
    const [transactions, visits] = await Promise.all([
      collectionModel.find(transactionQuery)
        .select('LD collectedBy transactionImage remarkByCollection receivedAmount status createdAt')
        .sort({ createdAt: -1 })
        .lean(), // Use lean() for better performance

      visitModel.find(visitQuery)
        .select('LD visitBy visitSelfie customerResponse reasonForNotPay solution reasonForCustomerNotContactable status location createdAt')
        .sort({ createdAt: -1 })
        .lean() // Use lean() for better performance
    ]);

    // Extract unique LD numbers for customer details lookup
    const ldNumbers = [...new Set([...transactions.map(t => t.LD), ...visits.map(v => v.LD)])];
    
    // Get customer details in parallel with total visits count
    const [disbursedData, totalVisits] = await Promise.all([
      disbursedCustomerModel.find({ LD: { $in: ldNumbers } })
        .select('LD customerDetail.customerName')
        .lean(),
      
    visitModel.countDocuments({ ...visitQuery, status: "accept" })
    ]);

    // Create customer map for faster lookups
    const customerMap = disbursedData.reduce((map, item) => {
      map[item.LD] = item.customerDetail.customerName;
      return map;
    }, {});

    // Helper function to extract employee ID
    const extractEmployeeId = (identifier) => {
      const match = identifier.match(/([A-Za-z]+[-]?\d+)/);
      return match ? match[1].toUpperCase() : null;
    };

    // Group data by employee ID (more efficient algorithm)
    const groupedData = {};
    
    // Process transactions
    for (const transaction of transactions) {
      const visitAndEmiBy = extractEmployeeId(transaction.collectedBy);
      if (!visitAndEmiBy) continue;

      if (!groupedData[visitAndEmiBy]) {
        groupedData[visitAndEmiBy] = { transactionImages: [], visitSelfies: [] };
      }
      
      groupedData[visitAndEmiBy].transactionImages.push({
        transactionImage: transaction.transactionImage,
        LD: transaction.LD,
        customerName: customerMap[transaction.LD] || "",
        remarkByCollection: transaction.remarkByCollection,
        receivedAmount: transaction.receivedAmount,
        status: transaction.status,
        createdAt: transaction.createdAt,
      });
    }

    // Process visits
    for (const visit of visits) {
      const visitAndEmiBy = extractEmployeeId(visit.visitBy);
      if (!visitAndEmiBy) continue;

      if (!groupedData[visitAndEmiBy]) {
        groupedData[visitAndEmiBy] = { transactionImages: [], visitSelfies: [] };
      }
      
      groupedData[visitAndEmiBy].visitSelfies.push({
        visitSelfie: visit.visitSelfie,
        LD: visit.LD,
        customerName: customerMap[visit.LD] || "",
        customerResponse: visit.customerResponse,
        reasonForNotPay: visit.reasonForNotPay,
        solution: visit.solution,
        reasonForCustomerNotContactable: visit.reasonForCustomerNotContactable,
        status: visit.status,
        location: visit.location,
        createdAt: visit.createdAt,
      });
    }

    // Apply branch filtering if needed
    let filteredGroupedArray;
    let branchEmployeeIds = [];
    
    if (branchId) {
      // Get all employees from the specified branch
      const branchEmployees = await employeeModel.find({ branchId: branchId })
        .select('employeUniqueId')
        .lean();
      
      branchEmployeeIds = branchEmployees.map(emp => emp.employeUniqueId);
    }

    // Convert to array 
    let groupedArray = Object.entries(groupedData).map(([employeeId, data]) => ({
      visitAndEmiBy: employeeId,
      ...data,
    }));

    // Apply branch filter if provided
    if (branchId && branchEmployeeIds.length > 0) {
      groupedArray = groupedArray.filter(item => 
        branchEmployeeIds.includes(item.visitAndEmiBy)
      );
    }

    // Calculate pagination values
    const totalRecords = groupedArray.length;
    const paginatedData = groupedArray.slice(skip, skip + limit);
    const employeeIds = paginatedData.map(item => item.visitAndEmiBy);

    // Get employee details
    const employees = await employeeModel.find({ employeUniqueId: { $in: employeeIds } })
      .select('employeUniqueId employeName mobileNo workEmail employeePhoto fatherName joiningDate branchId')
      .lean();
    
    // Extract all branch IDs from employees
    const branchIds = employees.map(emp => emp.branchId).filter(Boolean);
    
    // Fetch branch details in parallel
    const branches = await branchModel.find({ _id: { $in: branchIds } })
      .select('_id name')
      .lean();
    
    // Create branch map for faster lookups
    const branchMap = branches.reduce((map, branch) => {
      map[branch._id.toString()] = branch.name;
      return map;
    }, {});
    
    const employeeDet = employees.reduce((map, employee) => {
      map[employee.employeUniqueId] = `${employee.employeName} (${employee.employeUniqueId})`;
      return map;
    }, {});

    // Create employee map with branch name included
    const employeeMap = employees.reduce((map, employee) => {
      // Add branch name to employee object if branchId exists
      const employeeWithBranch = { ...employee };
      if (employee.branchId) {
        const branchIdStr = employee.branchId.toString();
        employeeWithBranch.branchName = branchMap[branchIdStr] || "Unknown Branch";
      } else {
        employeeWithBranch.branchName = "No Branch Assigned";
      }
      
      map[employee.employeUniqueId] = employeeWithBranch;
      return map;
    }, {});

    // Format final result
    const result = employeeIds.map((employeeId) => ({
      visitAndEmiBy:     employeeDet[employeeId] || employeeId,
      transactionImages: groupedData[employeeId].transactionImages,
      visitSelfies:      groupedData[employeeId].visitSelfies,
      employeeDetail:    employeeMap[employeeId] || null,
    }));

    // Prepare pagination data
    const pagination = {
      currentPage: page,
      pageSize: limit,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
    };

    success(res, "Grouped Visit and Transaction Data", { result, pagination });
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// -----------Visit Detail Get Dashboard-------------------------------
async function getVisitDetailsByCustomerId(req, res) {
try {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const { startDate, endDate, filterBy } = req.query;

  let visitQuery = {};

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Ensure the date range covers the full day
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    visitQuery.createdAt = { $gte: start, $lte: end };
  }

  if (filterBy) {
    visitQuery.visitBy = { $regex: new RegExp(filterBy, "i") };
  }

  const visits = await visitModel
    .find(visitQuery)
    .select(
      "LD customerName visitBy visitSelfie customerResponse reasonForNotPay solution reasonForCustomerNotContactable status createdAt"
    )
    .sort({ createdAt: -1 });

  // Calculate totals
  const totalOverallVisit = visits.length;

  const totalOverallVisitImage = visits.map((visit) => ({
    LD: visit.LD,
    customerName: visit.customerName,
    visitSelfie: visit.visitSelfie,
  }));
console.log("ds",totalOverallVisitImage.length)
  // Categorize visits
  const acceptVisit = visits.filter((visit) => visit.status === "accept").length;
  const notApproveVisit = visits.filter((visit) => visit.status === "pending").length;
  const rejectVisit = visits.filter((visit) => visit.status === "reject").length;

  // Paginate overall visit images
  const paginatedVisitImages = totalOverallVisitImage.slice(skip, skip + limit);

  // Prepare response
  const response = {
    totalVisit: totalOverallVisit,
    acceptVisit: acceptVisit || 0,
    notApproveVisit: notApproveVisit || 0,
    rejectVisit: rejectVisit || 0,
    totalOverallVisitImage: paginatedVisitImages,
    pagination: {
      currentPage: page,
      pageSize: limit,
      totalPages: Math.ceil(totalOverallVisit / limit),
      totalRecords: totalOverallVisit,
    },
  };

  success(res, "Visit details fetched successfully", response);
} catch (error) {
  console.error(error);
  unknownError(res, error);
}
}

// ---------------------LEGAL NOTICE SEND------------------------------
async function LegalNotice(req, res) {
try {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errorName: "serverValidation",
      errors: errors.array(),
    });
  }

  // Fetch all active legal notices
  const legalNoticeDetail = await legalNoticeModel.aggregate([
    { $match: { status: "active" } },
    {
      $lookup: {
        from: "noticetypes",
        localField: "noticeTypeId",
        foreignField: "_id",
        as: "noticeTypeDetail"
      }
    },
    {
      $project: {
        "noticeTypeDetail.__v": 0
      }
    },
    {
      $unwind: "$noticeTypeDetail"
    },
    {
      $lookup: {
        from: "employees",
        localField: "employeeId",
        foreignField: "_id",
        as: "employeeDetail"
      }
    },
    {
      $project: {
        "employeeDetail.__v": 0
      }
    },
    {
      $unwind: "$employeeDetail"
    }
  ]).sort({ createdAt: -1 });

  // Authorize Google Sheets API
  const auth = new google.auth.GoogleAuth({
    liveCredentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient });

  const spreadsheetId = process.env.CRM_LEGAL_NOTICE_GOOGLE_SHEET_KEY;
  const sheetName = process.env.LEGAL_NOTICE_SHEET;


  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: sheetName,
  });


  let rows = response.data.values || [];
  let headers = rows.length > 0 ? rows[0] : [];

  // If no rows exist, initialize headers
  if (rows.length === 0) {
    headers = ['LD', 'NOTICE SEND BY-1', 'NOTICE TYPE-1', 'DATE-1'];
    rows.push(headers);
  }

  const data = rows.slice(1);
  const ldIndex = headers.indexOf('LD');

  if (ldIndex === -1) {
    return badRequest(res, 'LD field not found in the sheet.');
  }

  for (const notice of legalNoticeDetail) {
    const { employeeDetail, customerFincNo: LD, noticeTypeDetail, createdAt } = notice;

    // Check if LD already exists in the sheet
    const rowIndex = data.findIndex(row => row[ldIndex] === LD);

    if (rowIndex === -1) {
      // If LD is not found, create a new row
      let newRow = Array(headers.length).fill('');
      newRow[ldIndex] = LD;
      newRow[headers.indexOf('NOTICE SEND BY-1')] = `${employeeDetail.employeName} - ${employeeDetail.employeUniqueId}`;
      newRow[headers.indexOf('NOTICE TYPE-1')] = noticeTypeDetail.title;
      newRow[headers.indexOf('DATE-1')] = new Date(createdAt).toISOString().split('T')[0];

      data.push(newRow);
      rows.push(newRow);

    } else {
      // If LD is found, find the next available slot to add the new notice
      let lastUsedSuffix = 0;
      for (let suffix = 1; suffix <= 10; suffix++) {
        const noticeByHeader = `NOTICE SEND BY-${suffix}`;
        if (headers.includes(noticeByHeader) && data[rowIndex][headers.indexOf(noticeByHeader)]) {
          lastUsedSuffix = suffix;
        } else {
          break;
        }
      }

      if (lastUsedSuffix < 10) {
        const nextSuffix = lastUsedSuffix + 1;

        // Add new notice details
        const updateMapping = {
          [`NOTICE SEND BY-${nextSuffix}`]: `${employeeDetail.employeName} - ${employeeDetail.employeUniqueId}`,
          [`NOTICE TYPE-${nextSuffix}`]: noticeTypeDetail.title,
          [`DATE-${nextSuffix}`]: new Date(createdAt).toISOString().split('T')[0],
        };

        // Add new headers if necessary
        Object.keys(updateMapping).forEach(key => {
          if (!headers.includes(key)) {
            headers.push(key);
            data.forEach(row => row.push(''));
          }
        });

        // Update the row with the new notice data
        headers.forEach((header, index) => {
          if (updateMapping[header] !== undefined) {
            data[rowIndex][index] = updateMapping[header];
          }
        });
      }
    }
  }

  // Update the sheet with the new data
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: 'RAW',
    resource: {
      values: [headers, ...data],
    },
  });

  success(res, "Get All Legal Notice Detail", legalNoticeDetail);

} catch (error) {
  console.log(error);
  unknownError(res, error);
}
}

async function collectionEmiOkCreditAdd(req, res) {
try {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return serverValidation(res, {
      errorName: "serverValidation",
      errors: errors.array(),
    });
  }

  const tokenId = new ObjectId(req.Id);
  const employeUniqueDetail = await employeModel.findById({ _id: tokenId });
  const name = 
    employeUniqueDetail.employeName + `-` + employeUniqueDetail.employeUniqueId;

  const {
    LD, customerName, mobileNo, emiAmount, receivedAmount,
    transactionId, transactionImage, modeOfCollectionId,
    commonId, customerEmail, emiReceivedDate, emiReceivedTime
  } = req.body;

  // Check if transaction ID is already accepted
  const transIdDetail = await collectionModel.findOne({
    transactionId: transactionId, status: "accept"
  });
  if (transIdDetail) {
    return badRequest(res, "Transaction ID Already Submitted.");
  }

  // Fetch modeOfCollection details
  const modeDetail = await modeOfCollectionModel.findById(modeOfCollectionId);
  if (!modeDetail) {
    return badRequest(res, "Invalid modeOfCollectionId.");
  }

  // Set the status based on the modeOfCollection
  const status = modeDetail.title === "okcredit" ? "initiate" : "pending";
  req.body.status = status;  // Assign status to request body
  req.body.collectedBy = name;  // Assign collectedBy to request body

  // Create the collection entry
  const collectionDetail = await collectionModel.create(req.body);
  return success(res, "Collection EMI Added Successfully", collectionDetail);

} catch (error) {
  console.log(error);
  return unknownError(res, error);
}
}

async function emiEmiOkCreditUpdate(req, res) {
try {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return serverValidation(res, {
      errorName: "serverValidation",
      errors: errors.array(),
    });
  }

  const tokenId = new ObjectId(req.Id);
  const approvalDetail = await employeModel.findById({ _id: tokenId });
  const name = approvalDetail.employeName;

  const { emiId, status, reason } = req.body;

  // Find the EMI by ID
  let emiData = await collectionModel.findById(emiId);
  if (!emiData) {
    return notFound(res, "EMI not found");
  }

  // Handle status transitions: initiate -> pending / reject
  if (status === "pending") {
    if (emiData.status !== "initiate") {
      return badRequest(res, "Status can only be updated from 'initiate' to 'pending'.");
    }
    emiData.status = "pending";
    emiData.reason = reason;

    // Update or create total cash details
    const totalCashDetail = await totalCashModel.findOne({
      employeeId: approvalDetail._id,
    });

    if (totalCashDetail) {
      // Update pending amount for the existing employeeId
      const newPendingAmount =
        parseInt(totalCashDetail.creditAmount) + parseInt(emiData.receivedAmount);
      await totalCashModel.updateOne(
        { employeeId: approvalDetail._id },
        { creditAmount: newPendingAmount }
      );
    } else {
      // Create a new entry if employeeId is not present
      await totalCashModel.create({
        employeeId: approvalDetail._id,
        creditAmount: emiData.receivedAmount,
      });
    }

    const updatedEmi = await emiData.save();
    return success(res, "EMI status updated to 'pending'.", updatedEmi);

  } else if (status === "reject") {
    if (emiData.status === "initiate") {
      emiData.status = "reject";
      emiData.reason = reason;
      const updatedEmi = await emiData.save();
      return success(res, "EMI status updated to 'reject'.", updatedEmi);

  } else if (emiData.status === "pending") {
      emiData.status = "reject";
      emiData.reason = reason;
  
      const totalCashBalance = await totalCashModel.findOne({ employeeId: approvalDetail._id });
      if (totalCashBalance) {
          totalCashBalance.creditAmount -= emiData.receivedAmount; 
          await totalCashBalance.save();
      }
      return success(res, "EMI status updated to 'reject'.", updatedEmi);
  }
    
   
  } else {
    return badRequest(res, "Invalid status update. Only 'pending' or 'reject' are allowed.");
  }

} catch (error) {
  console.log(error);
  return unknownError(res, error);
}
}

// ------------Automatic Email Send To Collection Person With LD number NET DUE Amount----------
async function getAllocationDetailsAndSendEmail(value) {
try {
  // Fetching collection roles
  const collectionRoles = await roleModel.find({ roleName: "collection" });
  const collectionRoleIds = collectionRoles.map((role) => role._id);

  // Fetching active employees with roles related to collection
  const employees = await employeModel.find({
    roleId: { $in: collectionRoleIds },
    status: "active",
  });

  // Google Sheets API setup
  const spreadsheetId = process.env.VISIT_GOOGLE_SHEET_KEY;
  const sheetName = process.env.EMIOVERALL_SHEET;
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: authClient });

  // Fetching data from the Google Sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: sheetName,
  });

  const rows = response.data.values;
  const headers = rows[0];
  const data = rows.slice(1).map((row) => {
    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] !== undefined ? row[index] : null;
    });
    return obj;
  });

  // Defining the allocation fields
  const allocationFields = [
    "Allocation 1 emp id",
    "Allocation 2 emp id",
    "Allocation 3 emp id",
    "Allocation 4 emp id",
    "Allocation 5 emp id",
    "Allocation 6 emp id",
    "Allocation 7 emp id",
    "Allocation 8 emp id",
  ];

  // Iterate over each employee
  for (const employee of employees) {
    // Skip employee if 'employeUniqueId' is empty or invalid
    if (!employee.employeUniqueId || employee.employeUniqueId.trim() === "") {
      // console.log(`Skipping employee with invalid or empty employeUniqueId: ${employee.employeName}`);
      continue;
    }

    // Get employee ID
    const employeeId = Array.isArray(employee.employeUniqueId) 
      ? employee.employeUniqueId[0].trim() 
      : employee.employeUniqueId.trim();

    // Filter rows based on allocation fields and matching 'NET DUE' > 0
    const filteredData = data.filter((row) =>
      allocationFields.some((field) => {
        if (!row[field]) return false; // Skip if the field is empty

        // Check if the allocation field contains the employee ID
        const allocationValue = row[field].toString().trim();
        return (
          allocationValue.toLowerCase().includes(employeeId.toLowerCase()) && 
          parseFloat(row["NET DUE"]) > 0
        );
      })
    );

    // If no filtered data, skip the email for this employee
    if (filteredData.length === 0) {
      // console.log(`No allocation data found for employee: ${employee.employeName} (${employeeId})`);
      continue;
    }

    // Skip email sending if the employee doesn't have a work email
    if (!employee.workEmail) {
      // console.warn(`No work email found for employee: ${employee.employeName}`);
      continue;
    }

    // Compile email body with details for the employee
    let emailBody = `
      <p>Dear ${employee.employeName} (${employeeId}),</p>
      <p>I hope this email finds you well. As part of our ongoing efforts to manage and streamline EMI collections, we are reaching out to provide you with the relevant data regarding your allocated collection accounts.:</p>
      <table border="1" cellpadding="5" cellspacing="0">
        <thead>
          <tr>
            <th>LD</th>
            <th>CUSTOMER NAME</th>
            <th>BRANCH</th>
            <th>VILLAGE</th>
            <th>MOBILE</th>
            <th>EMI AMOUNT</th>
            <th>OLD DUE</th>
            <th>NET DUE</th>
          </tr>
        </thead>
        <tbody>
    `;

    filteredData.forEach((row) => {
      emailBody += `
        <tr>
          <td>${row["LD"] || "N/A"}</td>
          <td>${row["CUSTOMER NAME "] || "N/A"}</td>
          <td>${row["BRANCH"] || "N/A"}</td>
          <td>${row["VILLAGE"] || "N/A"}</td>
          <td>${row["MOBILE"] || "N/A"}</td>
          <td>${row["EMI AMOUNT "] || "N/A"}</td>
          <td>${row["OLD DUE "] || "N/A"}</td>
          <td>${row["NET DUE"] || "N/A"}</td>
        </tr>
      `;
    });

    emailBody += `
        </tbody>
      </table>
      <p>You need to collect this asap.</p>
      <p>Thank you.</p>
    `;

    // Send email to the employee
    const subject = "EMI Due Data Allocation";
    const isEmailSent = await sendEmail(
      value?employee.workEmail:'',
      "",
      subject,
      emailBody,
      null
    );

    if (!isEmailSent) {
      console.error(`Failed to send email to ${employee.workEmail}`);
      continue;
    }


  }

  // success(res, "Emails sent successfully to all relevant employees.");
  console.log("Emails sent successfully to all relevant employees")
} catch (error) {
  console.error('Error in getAllocationDetailsAndSendEmail:', error);
  if (error.response && error.response.status === 400) {
    return badRequest(res, "Invalid sheet name.");
  } else {
    unknownError(res, error.message);
  }
}
}


cron.schedule("00 9 * * *", async() => {
if (process.env.BASE_URL === "https://prod.fincooper.in/") {
   await getAllocationDetailsAndSendEmail(true);
  }else if(process.env.BASE_URL === "https://stageapi.fincooper.in/" || process.env.BASE_URL === "http://localhost:5500/"){
    // await getAllocationDetailsAndSendEmail(false);
  }
// console.log("Cibil Pending Mail Send  at 9:30 AM.");
});

// -------------Data Get From Google Sheet CUSTOMERNAME, LAT , LONG-------------------------------
async function googleSheetCustomerLatLong(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Default to 10 if not provided
    const spreadsheetId = process.env.CUSTOMER_LAT_LONG_SHEET;
    const sheetName = process.env.CUSTOMER_LAT_LONG_DETAIL;
    const auth = new google.auth.GoogleAuth({
      credentials, // Add your Google credentials here
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error('No data found.');
    }

    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      let obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] !== undefined ? row[index] : null;
      });
      return obj;
    });

    // Implement pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedData = data.slice(startIndex, endIndex);
    const currentPageCount = paginatedData.length;

    return success(res, "Customer Lat Long Detail", {
      totalRecords: data.length,
      totalPages: Math.ceil(data.length / limit),
      currentPage: page,
      currentPageCount: currentPageCount,
      data: paginatedData,
    });
  } catch (error) {
    console.error('Error fetching Google Sheet data:', error.message);
    throw error; // Re-throw the error for handling in the calling function
  }
}

async function googleSheetLatLongWithoutPagination(req, res) {
  try {
    const spreadsheetId = process.env.CUSTOMER_LAT_LONG_SHEET;
    const sheetName = process.env.CUSTOMER_LAT_LONG_DETAIL;
    const { branchName } = req.query; // Get branchName from query params (optional)

    const auth = new google.auth.GoogleAuth({
      credentials, // Add your Google credentials here
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return badRequest(res, "No data found.");
    }

    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      let obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] !== undefined ? row[index] : null;
      });
      return obj;
    });

    // Count customers branch-wise
    const branchCounts = data.reduce((acc, row) => {
      if (row["BRANCH"]) {
        const branch = row["BRANCH"].trim().toLowerCase();
        acc[branch] = (acc[branch] || 0) + 1;
      }
      return acc;
    }, {});

    let filteredData, customerCount;
    
    if (branchName) {
      // If branchName is provided, filter data and return only that branch's count
      const branchKey = branchName.trim().toLowerCase();
      filteredData = data.filter(row => row["BRANCH"] && row["BRANCH"].trim().toLowerCase() === branchKey);
      customerCount = branchCounts || 0;
    } else {
      // If no branchName, return all branch-wise customer counts
      filteredData = data;
      customerCount = branchCounts; // Return all branch counts
    }

    return success(res, "Customer Lat Long Detail", { 
      data: filteredData, 
      customerCount 
    });
  } catch (error) {
    console.error("Error fetching Google Sheet data:", error.message);
    return unknownError(res, error.message);
  }
}


// ----------Tabl View Total Count Of Visit And Collection Amount---------------
async function tableViewData(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const { startDate, endDate, employeUniqueId, branchId } = req.query;

    // Get current date in UTC
    const today = new Date();
    const defaultStartDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));
    const defaultEndDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59, 999));

    // Parse startDate and endDate, ensuring they are valid UTC dates
    const start = startDate ? new Date(`${startDate}T00:00:00.000Z`) : defaultStartDate;
    const end = endDate ? new Date(`${endDate}T23:59:59.999Z`) : defaultEndDate;

    if (isNaN(start) || isNaN(end)) {
      return badRequest(res, "Invalid date format. Use YYYY-MM-DD.");
    }

    // Fetch role ID for "collection"
    const collectionRole = await roleModel.findOne({ roleName: "collection" }).select("_id");
    if (!collectionRole) return badRequest(res, "Collection role not found");

    let employeeFilter = { roleId: collectionRole._id };
    if (employeUniqueId) employeeFilter.employeUniqueId = employeUniqueId;
    if (branchId) employeeFilter.branchId = branchId;

    // Get total count before applying pagination
    const totalRecords = await employeModel.countDocuments({ ...employeeFilter, status: "active" });

    // Fetch paginated employees
    const employees = await employeModel
      .find({ ...employeeFilter, status: "active" })
      .select("employeName employeUniqueId branchId")
      .skip(skip)
      .limit(limit);

    if (!employees.length) return badRequest(res, "No employees found with collection role");

    const employeeIds = employees.map(emp => emp.employeUniqueId);
    const branchIds = [...new Set(employees.map(emp => emp.branchId).filter(Boolean))]; // Unique branch IDs

    // Fetch branch names
    const branches = await newbranch.find({ _id: { $in: branchIds } }).select("_id name");
    const branchMap = Object.fromEntries(branches.map(branch => [branch._id.toString(), branch.name]));

    // Fetch visits with proper date filtering
    const visits = await visitModel.aggregate([
      {
        $match: {
          status: "accept",
          createdAt: { $gte: start, $lte: end }, // Correct UTC date filtering
        },
      },
      {
        $addFields: {
          extractedUniqueId: { $arrayElemAt: [{ $split: ["$visitBy", "-"] }, 1] }
        },
      },
      {
        $match: {
          extractedUniqueId: { $in: employeeIds },
        },
      },
      {
        $group: {
          _id: "$extractedUniqueId",
          visitCount: { $sum: 1 },
        },
      },
    ]);

    // Fetch collection amounts with proper date filtering
    const collections = await collectionModel.aggregate([
      {
        $match: {
          status: "accept",
          createdAt: { $gte: start, $lte: end }, // Correct UTC date filtering
        },
      },
      {
        $addFields: {
          extractedUniqueId: { $arrayElemAt: [{ $split: ["$collectedBy", "-"] }, 1] }
        },
      },
      {
        $match: {
          extractedUniqueId: { $in: employeeIds },
        },
      },
      {
        $group: {
          _id: "$extractedUniqueId",
          totalEmiAmount: { $sum: "$receivedAmount" },
        },
      },
    ]);
    // console.log("sss",collections)
    // Map visit counts and collections to employees
    const visitMap = Object.fromEntries(visits.map(v => [v._id, v.visitCount]));
    const collectionMap = Object.fromEntries(collections.map(c => [c._id, c.totalEmiAmount]));

    // Construct paginated response
    const result = employees
  .map(emp => {
    const visitCount = visitMap[emp.employeUniqueId] || 0;
    const collectionAmount = collectionMap[emp.employeUniqueId] || 0;

    return {
      employeName: emp.employeName,
      employeUniqueId: emp.employeUniqueId,
      employeeBranch: branchMap[emp.branchId?.toString()] || "",
      visit: visitCount,
      collectionAmount: collectionAmount,
    };
  })
  // .filter(emp => emp.visit > 0 || emp.collectionAmount > 0); // Exclude employees with zero visits and zero collections


    const totalPages = Math.ceil(totalRecords / limit);

    success(res, "Get Data", {
      data: result,
      totalRecords,
      totalPages,
      currentPage: page,
      limit
    });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return unknownError(res, error.message);
  }
}


// -------------* Google Sheet Customer Data Save In Db *----------------------
async function googleSheetCustomerSave(req, res) { 
  try { 
    const spreadsheetId = process.env.CUSTOMER_LAT_LONG_SHEET; 
    const sheetName = process.env.CUSTOMER_LAT_LONG_DETAIL; 
 
    const auth = new google.auth.GoogleAuth({ 
      credentials, // Add your Google credentials here 
      scopes: ['https://www.googleapis.com/auth/spreadsheets'], 
    }); 
 
    const authClient = await auth.getClient(); 
    const sheets = google.sheets({ version: 'v4', auth: authClient }); 
 
    const response = await sheets.spreadsheets.values.get({ 
      spreadsheetId, 
      range: sheetName, 
    }); 
 
    const rows = response.data.values; 
    if (!rows || rows.length === 0) { 
      return badRequest(res, "No data found."); 
    } 
 
    const headers = rows[0]; 
    const data = rows.slice(1).map(row => { 
      let obj = {}; 
      headers.forEach((header, index) => { 
        obj[header] = row[index] !== undefined ? row[index] : null; 
      }); 
      return obj; 
    }); 

    // First, collect all unique branch names to fetch in a single batch
    const uniqueBranchNames = new Set();
    const uniqueAllocatedBranchNames = new Set();
    const salesPersonUniqueIds = new Set();
    
    data.forEach(customer => {
      if (customer["BRANCH"]) {
        uniqueBranchNames.add(customer["BRANCH"].trim());
      }
      if (customer["ALLOCATED BRANCH"]) {
        uniqueAllocatedBranchNames.add(customer["ALLOCATED BRANCH"].trim());
      }
      if (customer["SALES PERSON"]) {
        // Extract employee unique ID with multiple formats:
        // F1161, S168, S-81, etc.
        const match = customer["SALES PERSON"].match(/[A-Z]-?\d+/);
        if (match) {
          salesPersonUniqueIds.add(match[0]);
        }
      }
    });
    
    // Fetch all branches at once
    const branchesQuery = Array.from(uniqueBranchNames).map(name => 
      new RegExp('^' + name + '$', 'i')
    );
    
    const allocatedBranchesQuery = Array.from(uniqueAllocatedBranchNames).map(name => 
      new RegExp('^' + name + '$', 'i')
    );
    
    const branches = branchesQuery.length > 0 ? 
      await newbranch.find({ name: { $in: branchesQuery } }, { _id: 1, name: 1 }).lean() : 
      [];
      
    const allocatedBranches = allocatedBranchesQuery.length > 0 ? 
      await newbranch.find({ name: { $in: allocatedBranchesQuery } }, { _id: 1, name: 1 }).lean() : 
      [];
    
    // Fetch all sales persons at once
    const salesPersons = salesPersonUniqueIds.size > 0 ?
      await employeModel.find({ employeUniqueId: { $in: Array.from(salesPersonUniqueIds) } }, { _id: 1, employeUniqueId: 1 }).lean() :
      [];
    
    // Create lookup maps for quick access
    const branchMap = new Map();
    branches.forEach(branch => {
      // Store lowercase branch name -> branch._id mapping
      branchMap.set(branch.name.toLowerCase(), branch._id);
    });
    
    const allocatedBranchMap = new Map();
    allocatedBranches.forEach(branch => {
      // Store lowercase branch name -> branch._id mapping
      allocatedBranchMap.set(branch.name.toLowerCase(), branch._id);
    });
    
    const salesPersonMap = new Map();
    salesPersons.forEach(employee => {
      salesPersonMap.set(employee.employeUniqueId, employee._id);
    });
    
    // Prepare bulk operations for direct save
    const bulkOps = [];
    
    data.forEach(customer => {
      // Skip if no LD (required field)
      if (!customer["LD"]) return;
      
      // Get branch IDs from maps
      let branchId = null;
      if (customer["BRANCH"]) {
        branchId = branchMap.get(customer["BRANCH"].trim().toLowerCase());
      }
        
      let allocatedBranchId = null;
      if (customer["ALLOCATED BRANCH"]) {
        allocatedBranchId = allocatedBranchMap.get(customer["ALLOCATED BRANCH"].trim().toLowerCase());
      }
      
      // Extract employee unique ID and get employee _id
      let salesPersonId = null;
      if (customer["SALES PERSON"]) {
        const match = customer["SALES PERSON"].match(/[A-Z]-?\d+/);
        if (match) {
          salesPersonId = salesPersonMap.get(match[0]) || null;
        }
      }
      
      // Map Google Sheet data to model fields
      const customerData = {
        LD: customer["LD"] || "",
        loanNo: customer["LOAN NO"] || "",
        branchId: branchId,
        customerName: customer["CUSTOMER NAME"] || "",
        fatherName: customer["FATHER NAME"] || "",
        mobile: customer["MOBILE"] || "",
        salesPerson: salesPersonId,
        allocatedBranch: allocatedBranchId,
        village: customer["VILLAGE"] || "",
        address: customer["ADDRESS"] || "",
        partner: customer["PARTNER"] || "",
        mode: customer["MODE"] || "",
        emiAmount: parseFloat(customer["EMI AMOUNT"]) || 0,
        oldDue: parseFloat(customer["OLD DUE"]) || 0,
        netDue: parseFloat(customer["NET DUE"]) || 0,
        collectionType: customer["COLLECTION TYPE"] || "",
        loanAmount: parseFloat(customer["LOAN AMOUNT"]) || 0,
        tenure: parseInt(customer["TENURE"]) || 0,
        roi: parseFloat(customer["ROI"]) || 0,
        partnerName: customer["PARTNER NAME"] || "",
        lat: parseFloat(customer["LAT"]) || 0,
        long: parseFloat(customer["LONG"]) || 0
      };
      
      // Create update operation for bulkWrite
      bulkOps.push({
        updateOne: {
          filter: { LD: customerData.LD },
          update: { $set: customerData },
          upsert: true
        }
      });
    });
    
    // Execute bulk operation if there's data to process
    let result = { matchedCount: 0, modifiedCount: 0, upsertedCount: 0, upsertedIds: [] };
    let errors = [];
    
    if (bulkOps.length > 0) {
      try {
        // Process in smaller chunks to avoid hitting MongoDB document size limits
        const CHUNK_SIZE = 500;
        
        for (let i = 0; i < bulkOps.length; i += CHUNK_SIZE) {
          const chunk = bulkOps.slice(i, i + CHUNK_SIZE);
          const chunkResult = await GoogleSheetCustomerModel.bulkWrite(chunk, { ordered: false });
          
          // Aggregate results
          result.matchedCount += chunkResult.matchedCount || 0;
          result.modifiedCount += chunkResult.modifiedCount || 0;
          result.upsertedCount += chunkResult.upsertedCount || 0;
          
          if (chunkResult.upsertedIds) {
            Object.keys(chunkResult.upsertedIds).forEach(key => {
              result.upsertedIds.push(chunkResult.upsertedIds[key]);
            });
          }
        }
      } catch (bulkError) {
        console.error("Bulk write error:", bulkError);
        
        // Even with errors, MongoDB might have processed some documents
        if (bulkError.result) {
          result = bulkError.result;
        }
        
        if (bulkError.writeErrors) {
          errors = bulkError.writeErrors.map(err => ({
            index: err.index,
            code: err.code,
            message: err.errmsg || err.message,
            document: err.op ? err.op.updateOne.filter.LD : "Unknown"
          }));
        } else {
          errors.push({
            message: bulkError.message
          });
        }
      }
    }

    return success(res, "Customer data processed and saved", {  
      totalProcessed: data.length,
      salesPersonsFound: salesPersonMap.size,
      savedCount: result.matchedCount + result.upsertedCount,
      updatedCount: result.modifiedCount,
      newRecords: result.upsertedCount,
      errorCount: errors.length,
      errors: errors.length > 0 ? errors : undefined
    }); 
  } catch (error) { 
    console.error("Error in googleSheetCustomerSave:", error.message); 
    return unknownError(res, error.message); 
  } 
}

// ------------** Get All Customer Lat Long Detail googleSheetCustomer **---------
async function getAllGoogleCustomer(req, res) {
  try {
    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 20;
    const skip = (page - 1) * limit;

    // const query = req.query.ids ? req.query.ids.split(",") : [];

    const filterParam = req.query.filter ? JSON.parse(req.query.filter) : {};
    const query = filterParam.branches || [];

    // Fetch data with pagination
    // const customers = await GoogleSheetCustomerModel.find().skip(skip).limit(limit).lean();
    const filter = query.length > 0 ? { branchId: { $in: query } } : {}; 

    const customers = await GoogleSheetCustomerModel.find(filter).skip(skip).limit(limit).lean();

const getData = await GoogleSheetCustomerModel.find({})

console.log('getData----',getData)
    
    // Get all unique branch IDs
    const branchIds = [
      ...new Set(customers.flatMap((c) => [c.branchId])),
    ].filter(Boolean);

    const allocatedBranchIds = [
      ...new Set(customers.flatMap((c) => [c.allocatedBranch])),
    ].filter(Boolean);

    // Get all unique salesPersonIds
    const salesPersonIds = [];
    
    customers.forEach(customer => {
      // Handle both ObjectId and string formats for salesPerson field
      if (customer.salesPersonId) {
        salesPersonIds.push(customer.salesPersonId);
      } else if (customer.salesPerson && mongoose.Types.ObjectId.isValid(customer.salesPerson)) {
        // If salesPerson is stored as a string representation of ObjectId
        salesPersonIds.push(customer.salesPerson);
      }
    });

    // Fetch branch details
    const branches = await newbranch.find({ _id: { $in: branchIds } }).select("name").lean();
    const branchMap = Object.fromEntries(branches.map((b) => [b._id.toString(), b.name]));

    
    
    // Fetch allocated branch details
    const allocatedBranches = await newbranch.find({ _id: { $in: allocatedBranchIds } }).select("name").lean();
    const allocatedBranchMap = Object.fromEntries(allocatedBranches.map((b) => [b._id.toString(), b.name]));

    // Fetch employee details directly using salesPersonId
    const employees = await employeModel.find({ 
      _id: { $in: salesPersonIds } 
    }).select("employeName employeUniqueId reportingManagerId").lean();

    // Create a map of employees by their _id
    const employeeMap = Object.fromEntries(
      employees.map((e) => [e._id.toString(), { 
        employeName: e.employeName, 
        employeUniqueId: e.employeUniqueId, 
        reportingManagerId: e.reportingManagerId 
      }])
    );

    // Extract unique reportingManagerIds to find saleManagers
    const reportingManagerIds = [...new Set(employees.map(e => e.reportingManagerId).filter(Boolean))];

    // Fetch saleManager details
    const saleManagers = await employeModel.find({ _id: { $in: reportingManagerIds } })
      .select("employeName employeUniqueId")
      .lean();

    // Create a map of saleManagers
    const saleManagerMap = Object.fromEntries(
      saleManagers.map((m) => [m._id.toString(), { 
        saleManagerName: m.employeName, 
        saleManagerUniqueId: m.employeUniqueId 
      }])
    );

    // Format customer data with branch, salesPerson, and saleManager details
    const formattedCustomers = customers.map((c) => {
      // Get employee details from the map using salesPersonId or salesPerson if it's an ObjectId
      let salesPerson = null;
      
      if (c.salesPersonId) {
        salesPerson = employeeMap[c.salesPersonId.toString()] || null;
      } else if (c.salesPerson && mongoose.Types.ObjectId.isValid(c.salesPerson)) {
        // If salesPerson is stored as a string representation of ObjectId
        salesPerson = employeeMap[c.salesPerson.toString()] || null;
      }
      
      // Get sale manager details if reporting manager exists
      const saleManager = salesPerson && salesPerson.reportingManagerId 
        ? saleManagerMap[salesPerson.reportingManagerId.toString()] || null 
        : null;

      return {
        _id: c._id,
        LD: c.LD,
        address: c.address,
        allocatedBranch: allocatedBranchMap[c.allocatedBranch?.toString()] || null,
        branchId: branchMap[c.branchId?.toString()] || null,
        collectionType: c.collectionType,
        createdAt: c.createdAt,
        customerName: c.customerName,
        emiAmount: c.emiAmount,
        fatherName: c.fatherName,
        lat: c.lat,
        loanAmount: c.loanAmount,
        loanNo: c.loanNo,
        long: c.long,
        mobile: c.mobile,
        mode: c.mode,
        netDue: c.netDue,
        oldDue: c.oldDue,
        partner: c.partner,
        partnerName: c.partnerName,
        roi: c.roi,
        salesPerson: c.salesPerson,
        employeeDetails: salesPerson ? {
          employeName: salesPerson.employeName,
          employeUniqueId: salesPerson.employeUniqueId
        } : null,
        saleManager: saleManager || null,
        tenure: c.tenure,
        updatedAt: c.updatedAt,
        village: c.village,
      };
    });

    // Get total count for pagination
    const total = await GoogleSheetCustomerModel.countDocuments();

    const newDetail = {
      data: formattedCustomers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    success(res, "Get All Data", newDetail);
  } catch (error) {
    console.error("Error fetching Google Sheet data:", error.message);
    return unknownError(res, error.message);
  }
}

// -------------VISIT DASHBOARD BY REPORTING MANAGER BY TOKEN--------------------
async function visitCustomerGoogleSheet(page, limit, branchFilter = null, minNetDue = null, maxNetDue = null, filterByLD = '') {
  try {
    const spreadsheetId = process.env.VISIT_GOOGLE_SHEET_KEY;
    const sheetName = process.env.EMIOVERALL_SHEET;
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error('No data found.');
    }

    const headers = rows[0];
    let data = rows.slice(1).map((row) => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] !== undefined ? row[index] : null;
      });
      return obj;
    });

    // 🔍 Apply branch filtering only if branchFilter is set and not "all"
    if (branchFilter && branchFilter.toLowerCase() !== 'all') {
      data = data.filter(
        (row) => row.BRANCH?.toLowerCase() === branchFilter.toLowerCase()
      );
    }

    // 🔍 Apply NET DUE range filtering ONLY if both parameters are explicitly provided
    if (minNetDue !== null || maxNetDue !== null) {
      data = data.filter((row) => {
        // Handle cases where NET DUE might be undefined or empty
        if (!row["NET DUE"]) {
          // If minNetDue is specified and non-zero, empty NET DUE values should be excluded
          return minNetDue === null || parseFloat(minNetDue) <= 0;
        }
        
        // Parse the NET DUE value, handling comma-formatted numbers like "12,946"
        const netDueStr = row["NET DUE"];
        const netDueValue = parseFloat(netDueStr.replace(/,/g, ""));
        
        // Check if value is within the specified range
        if (minNetDue !== null && netDueValue < parseFloat(minNetDue)) {
          return false;
        }
        if (maxNetDue !== null && netDueValue > parseFloat(maxNetDue)) {
          return false;
        }
        
        return true;
      });
    }

    // 🔍 Apply LD filtering if filterByLD is provided and not empty
    if (filterByLD) {
      data = data.filter(
        (row) => row.LD && row.LD.toString().toLowerCase() === filterByLD.toLowerCase()
      );
    }

    const total = data.length;
    const skip = (page - 1) * limit;
    const paginatedData = data.slice(skip, skip + limit);

    return {
      data: paginatedData,
      total,
    };
  } catch (error) {
    console.error('Error fetching Google Sheet data:', error.message);
    throw error;
  }
}


// -----------------**ALL CUSTOMER DASHBOARD WITH VISIT AND COLLECTION COUNT **----------------------------
// async function allCustomerDashboard(req, res) {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 20;
//     const { startDate, endDate, branch } = req.query;
//     // const tokenId = new ObjectId(req.Id); // Make sure your middleware adds token user ID to req.userId

//     const fromDate = startDate
//       ? moment(startDate).startOf('day').toDate()
//       : moment().startOf('day').toDate();
//     const toDate = endDate
//       ? moment(endDate).endOf('day').toDate()
//       : moment().endOf('day').toDate();

//     // 👇 Role-based filtering logic start
//     // Get collection role
// const collectionRole = await roleModel.findOne({ roleName: "collection" });
// if (!collectionRole) return notFound(res, "Collection role not found");

// // Find employees under this manager
// const collectionEmployees = await employeModel.find({
//   reportingManagerId: tokenId,
//   $or: [
//     { roleId: collectionRole._id },
//     { roleId: { $in: [collectionRole._id] } }
//   ]
// });

// if (collectionEmployees.length === 0) {
//   return badRequest(res, "Access denied: No collection employees found with this reporting manager");
// }

// // Get list of "Visit By" names in visitModel
// const employeeVisitByCodes = collectionEmployees.map(e => `${e.employeName}-${e.employeUniqueId}`);
// // Step 1: Get LDs from visitModel done by these employees
// const employeeVisitLDs = await visitModel.find({
//   visitBy: { $in: employeeVisitByCodes }
// });

// const { data: sheetData, total } = await visitCustomerGoogleSheet(page , limit , branch );
// // // Step 2: Filter sheetData to include only rows where LD exists in above LDs
// const employeeLDs = employeeVisitLDs.map(visit => visit.LD); // just the LD values

// const filteredSheetData = sheetData.filter(row => employeeLDs.includes(row.LD));
// // Step 3: Enrich and count visits
// const enrichedData = await Promise.all(
//   filteredSheetData.map(async (item) => {
//     const LD = item.LD;

//     if (!LD) {
//       return {
//         ...item,
//         visitDone: 0
//       };
//     }

//     const visitDone = await visitModel.countDocuments({
//       LD,
//       visitBy: { $in: employeeVisitByCodes },
//       createdAt: { $gte: fromDate, $lte: toDate },
//       status: { $in: ["accept", "pending"] }
//     });

//     return {
//       ...item,
//       visitDone
//     };
//   })
// );

// // Sort
// const sortedData = enrichedData.sort((a, b) => b.visitDone - a.visitDone);

// // Respond
// return success(res, 'success', {
//   page,
//   limit,
//   total,
//   sortedData
// });
// } catch (error) {
//       console.log(error);
//       return unknownError(res, error.message);
//     }
//   }

async function allCustomerDashboard(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { startDate, endDate, branch, minNetDue, maxNetDue, filterByLD } = req.query;
    const fromDate = startDate
      ? moment(startDate).startOf("day").toDate()
      : moment().startOf("day").toDate();
    const toDate = endDate
      ? moment(endDate).endOf("day").toDate()
      : moment().endOf("day").toDate();
    
    // Pass the NET DUE filter parameters and filterByLD to the Google Sheet function
    const { data: sheetData, total } = await visitCustomerGoogleSheet(
      page, 
      limit, 
      branch, 
      minNetDue, 
      maxNetDue,
      filterByLD || '' // Pass empty string if not provided
    );
    
    // Enrich only paginated records
    const enrichedData = await Promise.all(
      sheetData.map(async (item) => {
        const LD = item.LD;
        let visitDone = 0;
        let emiAcceptCount = 0;
        let emiReceived = 0;
        if (LD) {
          visitDone = await visitModel.countDocuments({
            LD,
            status: "accept" ,
            createdAt: { $gte: fromDate, $lte: toDate },
          });
          const acceptEmis = await collectionModel.find({
            LD,
            status: "accept",
            createdAt: { $gte: fromDate, $lte: toDate },
          });
          emiAcceptCount = acceptEmis.length;
          emiReceived = acceptEmis.reduce((sum, doc) => {
            return sum + (Number(doc.receivedAmount) || 0);
          }, 0);    
        }
        return {
          ...item,
          visitDone,
          emiAcceptCount,
          emiReceived,
        };
      })
    );
    
    // Sort within the page
    const sortedData = enrichedData.sort((a, b) => {
      const totalA = (a.visitDone || 0) + (a.emiAcceptCount || 0);
      const totalB = (b.visitDone || 0) + (b.emiAcceptCount || 0);
      return totalB - totalA; // Descending order
    });
   
    return success(res, "Success", {
      page,
      limit,
      total,
      sortedData,
    });
  } catch (error) {
    console.error("Error in allCustomerDashboard:", error);
    return unknownError(res, error.message);
  }
}

// ---------- Dashboard API for charts and analytics------------------
// async function piChartDashboardApi(req, res) {
//   try {
//     const { branchId, regionalBranchId, startDate, endDate, status } = req.query;
    
//     // Create proper date objects
//     const fromDate = startDate
//       ? moment(startDate).startOf('day').toDate()
//       : moment().startOf('day').toDate();
//     const toDate = endDate
//       ? moment(endDate).endOf('day').toDate()
//       : moment().endOf('day').toDate();
    
//     // First, get customer data from Google Sheets
//     const googleSheetData = await getGoogleSheetData();
    
//     // Filter customers by branch or regional branch
//     let filteredCustomers = googleSheetData || [];
//     let filteredLDs = [];
//     let branchName = "";
//     let branchNames = [];
    
//     // Check if regionalBranchId is provided and not "all"
//     if (regionalBranchId && regionalBranchId !== "all" && googleSheetData && googleSheetData.length > 0) {
//       // Get all branches that belong to this regional branch
//       const branches = await newbranch.find({ regionalBranchId: new ObjectId(regionalBranchId) });
      
//       if (branches && branches.length > 0) {
//         // Extract all branch names
//         branchNames = branches.map(branch => branch.name);
        
//         // Filter customers by any of these branch names
//         filteredCustomers = googleSheetData.filter(customer => 
//           customer.BRANCH && 
//           branchNames.some(name => 
//             customer.BRANCH.toString().toLowerCase() === name.toLowerCase() || 
//             customer.BRANCH.toString().includes(name)
//           )
//         );
//       }
//     }
//     // If branchId is provided instead (existing functionality)
//     else if (branchId && branchId !== "all" && googleSheetData && googleSheetData.length > 0) {
//       // Get branch name
//       const branch = await newbranch.findOne({ _id: new ObjectId(branchId) });
//       branchName = branch ? branch.name : "";
      
//       // Filter customers by branch name
//       filteredCustomers = googleSheetData.filter(customer => 
//         customer.BRANCH && 
//         (customer.BRANCH.toString().toLowerCase() === branchName.toLowerCase() || 
//          customer.BRANCH.toString().includes(branchName))
//       );
//     }
    
//     // Extract LD numbers from filtered customers
//     filteredLDs = filteredCustomers
//       .filter(customer => customer.LD)
//       .map(customer => customer.LD);
    
//     // If no filters applied or no results, use all LDs
//     if (filteredLDs.length === 0 && (!branchId || branchId === "all") && (!regionalBranchId || regionalBranchId === "all")) {
//       filteredLDs = googleSheetData
//         .filter(customer => customer.LD)
//         .map(customer => customer.LD);
//     }
    
//     // Create base match conditions
//     const visitMatchCondition = {
//       LD: { $in: filteredLDs },
//       createdAt: { $gte: fromDate, $lte: toDate }
//     };
 
//     const collectionMatchCondition = {
//       LD: { $in: filteredLDs },
//       createdAt: { $gte: fromDate, $lte: toDate }
//     };
    
//     // Add status filtering if provided
//     if (status && status !== "all") {
//       visitMatchCondition.status = status;
//       collectionMatchCondition.status = status;
//     }
    
//     // Run visit and collection queries in parallel
//     const [visitStats, collectionStats] = await Promise.all([
//       // Get visit statistics for filtered customers
//       getVisitStatistics(visitMatchCondition),
      
//       // Get collection statistics for filtered customers
//       getCollectionStatistics(collectionMatchCondition)
//     ]);
    
//     // Format the response
//     const result = {
//       counts: {
//         // Visit counts
//         approvalPendingVisits: visitStats.pendingCount || 0,
//         acceptVisit: visitStats.acceptCount || 0,
//         rejectVisit: visitStats.rejectCount || 0,
//         totalVisits: visitStats.totalVisit || 0,
        
//         // Collection counts
//         approvalPendingEmiAmount: collectionStats.pendingAmount || 0,
//         receivedEmiAmount: collectionStats.acceptAmount || 0,
//         rejectEmiAmount: collectionStats.rejectAmount || 0,
//         totalEmiAmount: (collectionStats.pendingAmount || 0) + 
//                         (collectionStats.acceptAmount || 0) + 
//                         (collectionStats.rejectAmount || 0),
        
//         // Customer count
//         customerCount: filteredCustomers.length
//       }
//     };
    
//     return success(res, "Dashboard counts retrieved successfully", result);
//   } catch (error) {
//     console.error(error);
//     return unknownError(res, error);
//   }
// }

// async function getVisitStatistics(matchCondition) {
//   try {
//     // Get visit counts by status with proper status values
//     const statusCounts = await visitModel.aggregate([
//       { $match: matchCondition },
//       {
//         $group: {
//           _id: "$status",
//           count: { $sum: 1 }
//         }
//       }
//     ]);
    
//     // Initialize counts
//     let pendingCount = 0;
//     let acceptCount = 0;
//     let rejectCount = 0;
//     let totalVisit = 0;
    
//     // Process status counts - handle case variations
//     statusCounts.forEach(item => {
//       const status = item._id ? item._id.toString().toLowerCase() : "";
//       const count = item.count || 0;
      
//       if (status === "pending") {
//         pendingCount = count;
//       } else if (status === "accept" || status === "accepted") {
//         acceptCount = count;
//       } else if (status === "reject" || status === "rejected") {
//         rejectCount = count;
//       }
      
//       totalVisit += count;
//     });
    
//     return {
//       totalVisit,
//       pendingCount,
//       acceptCount,
//       rejectCount
//     };
//   } catch (error) {
//     console.error("Error getting visit statistics:", error);
//     return {
//       totalVisit: 0,
//       pendingCount: 0,
//       acceptCount: 0,
//       rejectCount: 0
//     };
//   }
// }

// async function getCollectionStatistics(matchCondition) {
//   try {
//     // Get collection counts and amounts by status
//     const statusAmounts = await collectionModel.aggregate([
//       { $match: matchCondition },
//       {
//         $group: {
//           _id: "$status",
//           count: { $sum: 1 },
//           amount: { $sum: "$receivedAmount" }
//         }
//       }
//     ]);
    
//     // Initialize variables
//     let pendingAmount = 0;
//     let acceptAmount = 0;
//     let rejectAmount = 0;
//     let pendingCount = 0;
//     let acceptCount = 0;
//     let rejectCount = 0;
//     let totalCount = 0;
    
//     // Process status amounts - handle case variations
//     statusAmounts.forEach(item => {
//       const status = item._id ? item._id.toString().toLowerCase() : "";
//       const count = item.count || 0;
//       const amount = item.amount || 0;
      
//       if (status === "pending") {
//         pendingAmount = amount;
//         pendingCount = count;
//       } else if (status === "accept" || status === "accepted") {
//         acceptAmount = amount;
//         acceptCount = count;
//       } else if (status === "reject" || status === "rejected") {
//         rejectAmount = amount;
//         rejectCount = count;
//       }
      
//       totalCount += count;
//     });
    
//     return {
//       totalCount,
//       pendingCount,
//       acceptCount,
//       rejectCount,
//       pendingAmount,
//       acceptAmount,
//       rejectAmount
//     };
//   } catch (error) {
//     console.error("Error getting collection statistics:", error);
//     return {
//       totalCount: 0,
//       pendingCount: 0,
//       acceptCount: 0,
//       rejectCount: 0,
//       pendingAmount: 0,
//       acceptAmount: 0,
//       rejectAmount: 0
//     };
//   }
// }

async function piChartDashboardApi(req, res) {
  try {
    const { branchId, regionalBranchId, startDate, endDate, status, page = 1, limit = 20 } = req.query;
    
    // Convert pagination parameters to numbers
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    
    // Create proper date objects
    const fromDate = startDate
      ? moment(startDate).startOf('day').toDate()
      : moment().startOf('day').toDate();
    const toDate = endDate
      ? moment(endDate).endOf('day').toDate()
      : moment().endOf('day').toDate();
    
    // First, get customer data from Google Sheets
    const googleSheetData = await getGoogleSheetData();
    
    // Filter customers by branch or regional branch
    let filteredCustomers = googleSheetData || [];
    let filteredLDs = [];
    let branchName = "";
    let branchNames = [];
    
    // Check if regionalBranchId is provided and not "all"
    if (regionalBranchId && regionalBranchId !== "all" && googleSheetData && googleSheetData.length > 0) {
      // Get all branches that belong to this regional branch
      const branches = await newbranch.find({ regionalBranchId: new ObjectId(regionalBranchId) });
      
      if (branches && branches.length > 0) {
        // Extract all branch names
        branchNames = branches.map(branch => branch.name);
        
        // Filter customers by any of these branch names
        filteredCustomers = googleSheetData.filter(customer => 
          customer.BRANCH && 
          branchNames.some(name => 
            customer.BRANCH.toString().toLowerCase() === name.toLowerCase() || 
            customer.BRANCH.toString().includes(name)
          )
        );
      }
    }
    // If branchId is provided instead (existing functionality)
    else if (branchId && branchId !== "all" && googleSheetData && googleSheetData.length > 0) {
      // Get branch name
      const branch = await newbranch.findOne({ _id: new ObjectId(branchId) });
      branchName = branch ? branch.name : "";
      
      // Filter customers by branch name
      filteredCustomers = googleSheetData.filter(customer => 
        customer.BRANCH && 
        (customer.BRANCH.toString().toLowerCase() === branchName.toLowerCase() || 
         customer.BRANCH.toString().includes(branchName))
      );
    }
    
    // Extract LD numbers from filtered customers
    filteredLDs = filteredCustomers
      .filter(customer => customer.LD)
      .map(customer => customer.LD);
    
    // If no filters applied or no results, use all LDs
    if (filteredLDs.length === 0 && (!branchId || branchId === "all") && (!regionalBranchId || regionalBranchId === "all")) {
      filteredLDs = googleSheetData
        .filter(customer => customer.LD)
        .map(customer => customer.LD);
    }
    
    // Create base match conditions
    const visitMatchCondition = {
      LD: { $in: filteredLDs },
      createdAt: { $gte: fromDate, $lte: toDate }
    };
 
    const collectionMatchCondition = {
      LD: { $in: filteredLDs },
      createdAt: { $gte: fromDate, $lte: toDate }
    };
    
    // Add status filtering if provided
    if (status && status !== "all") {
      visitMatchCondition.status = status;
      collectionMatchCondition.status = status;
    }
    
    // Get today's date range for activity check
    const today = moment().startOf('day').toDate();
    const endOfToday = moment().endOf('day').toDate();
    
    // Run all queries in parallel for performance
    const [visitStats, collectionStats, todayVisits, todayCollections] = await Promise.all([
      // Get visit statistics for filtered customers
      getVisitStatistics(visitMatchCondition),
      
      // Get collection statistics for filtered customers
      getCollectionStatistics(collectionMatchCondition),
      
      // Get today's visit data for all customers
      visitModel.aggregate([
        {
          $match: {
            LD: { $in: filteredLDs },
            createdAt: { $gte: today, $lte: endOfToday }
          }
        },
        {
          $group: {
            _id: "$LD",
            visitDone: { $sum: 1 }
          }
        }
      ]),
      
      // Get today's collection data for all customers
      collectionModel.aggregate([
        {
          $match: {
            LD: { $in: filteredLDs },
            createdAt: { $gte: today, $lte: endOfToday }
          }
        },
        {
          $group: {
            _id: "$LD",
            emiAcceptCount: { $sum: 1 },
            emiReceived: { $sum: "$receivedAmount" }
          }
        }
      ])
    ]);
    
    // Convert today's activity data to maps for fast lookup
    const visitMap = new Map(todayVisits.map(item => [item._id, item.visitDone]));
    const collectionMap = new Map(todayCollections.map(item => [item._id, {
      emiAcceptCount: item.emiAcceptCount,
      emiReceived: item.emiReceived
    }]));
    
    // Enhance customers with visit and collection data
    const enhancedCustomers = filteredCustomers.map(customer => {
      const visitDone = visitMap.get(customer.LD) || 0;
      const collectionData = collectionMap.get(customer.LD) || { emiAcceptCount: 0, emiReceived: 0 };
      
      return {
        ...customer,
        visitDone: visitDone,
        emiAcceptCount: collectionData.emiAcceptCount,
        emiReceived: collectionData.emiReceived,
        hasActivity: visitDone > 0 || collectionData.emiAcceptCount > 0
      };
    });
    
    // Sort customers: those with today's activity first
    const sortedCustomers = enhancedCustomers.sort((a, b) => {
      // If one has activity today and the other doesn't, prioritize the active one
      if (a.hasActivity && !b.hasActivity) return -1;
      if (!a.hasActivity && b.hasActivity) return 1;
      
      // If both have activity or both don't, maintain original order
      return 0;
    });
    
    // Calculate pagination
    const totalCustomers = sortedCustomers.length;
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedCustomers = sortedCustomers.slice(startIndex, endIndex);
    const totalPages = Math.ceil(totalCustomers / pageSize);
    
    // Format the response
    const result = {
      counts: {
        // Visit counts
        approvalPendingVisits: visitStats.pendingCount || 0,
        acceptVisit: visitStats.acceptCount || 0,
        rejectVisit: visitStats.rejectCount || 0,
        totalVisits: visitStats.totalVisit || 0,
        
        // Collection counts
        approvalPendingEmiAmount: collectionStats.pendingAmount || 0,
        receivedEmiAmount: collectionStats.acceptAmount || 0,
        rejectEmiAmount: collectionStats.rejectAmount || 0,
        totalEmiAmount: (collectionStats.pendingAmount || 0) + 
                        (collectionStats.acceptAmount || 0) + 
                        (collectionStats.rejectAmount || 0),
        
        // Customer count
        customerCount: totalCustomers
      },
      // Add paginated customers array with enhanced data
      customers: paginatedCustomers,
      // Add pagination metadata
      pagination: {
        currentPage: pageNumber,
        pageSize: pageSize,
        totalCustomers: totalCustomers,
        totalPages: totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1
      }
    };
    
    return success(res, "Dashboard data retrieved successfully", result);
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

async function getVisitStatistics(matchCondition) {
  try {
    // Get visit counts by status with proper status values
    const statusCounts = await visitModel.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Initialize counts
    let pendingCount = 0;
    let acceptCount = 0;
    let rejectCount = 0;
    let totalVisit = 0;
    
    // Process status counts - handle case variations
    statusCounts.forEach(item => {
      const status = item._id ? item._id.toString().toLowerCase() : "";
      const count = item.count || 0;
      
      if (status === "pending") {
        pendingCount = count;
      } else if (status === "accept" || status === "accepted") {
        acceptCount = count;
      } else if (status === "reject" || status === "rejected") {
        rejectCount = count;
      }
      
      totalVisit += count;
    });
    
    return {
      totalVisit,
      pendingCount,
      acceptCount,
      rejectCount
    };
  } catch (error) {
    console.error("Error getting visit statistics:", error);
    return {
      totalVisit: 0,
      pendingCount: 0,
      acceptCount: 0,
      rejectCount: 0
    };
  }
}

async function getCollectionStatistics(matchCondition) {
  try {
    // Get collection counts and amounts by status
    const statusAmounts = await collectionModel.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          amount: { $sum: "$receivedAmount" }
        }
      }
    ]);
    
    // Initialize variables
    let pendingAmount = 0;
    let acceptAmount = 0;
    let rejectAmount = 0;
    let pendingCount = 0;
    let acceptCount = 0;
    let rejectCount = 0;
    let totalCount = 0;
    
    // Process status amounts - handle case variations
    statusAmounts.forEach(item => {
      const status = item._id ? item._id.toString().toLowerCase() : "";
      const count = item.count || 0;
      const amount = item.amount || 0;
      
      if (status === "pending") {
        pendingAmount = amount;
        pendingCount = count;
      } else if (status === "accept" || status === "accepted") {
        acceptAmount = amount;
        acceptCount = count;
      } else if (status === "reject" || status === "rejected") {
        rejectAmount = amount;
        rejectCount = count;
      }
      
      totalCount += count;
    });
    
    return {
      totalCount,
      pendingCount,
      acceptCount,
      rejectCount,
      pendingAmount,
      acceptAmount,
      rejectAmount
    };
  } catch (error) {
    console.error("Error getting collection statistics:", error);
    return {
      totalCount: 0,
      pendingCount: 0,
      acceptCount: 0,
      rejectCount: 0,
      pendingAmount: 0,
      acceptAmount: 0,
      rejectAmount: 0
    };
  }
}

// -----------------BRANCH WISE DASHBOARD DATA---------------------------
async function branchWiseVisitAndCollTable(req, res) {
  try {
    let { startDate, endDate, page = 1, limit = 20 } = req.query;
    const tokenId = new ObjectId(req.Id);

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Normalize or default to today
    if (startDate && endDate) {
      startDate = moment(startDate).startOf('day').toISOString();
      endDate = moment(endDate).endOf('day').toISOString();
    } else {
      startDate = moment().startOf('day').toISOString();
      endDate = moment().endOf('day').toISOString();
    }

    const employeeData = await employeModel.findOne({ _id: tokenId }, { _id: 1 }).lean();
    if (!employeeData) return notFound(res, "Employee not found");

    // Fetch data
    const [googleCustomers, visits, collections] = await Promise.all([
      getGoogleSheetData(),
      visitModel.find({
        status: { $in: ["accept", "reject"] },
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }).lean(),
      collectionModel.find({
        status: { $in: ["accept", "reject"] },
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }).lean()
    ]);

    // 1. Build LD → BranchName map and count customers per branch
    const ldToBranchMap = new Map();
    const branchMap = new Map();

    googleCustomers.forEach((cust) => {
      const ld = cust["LD"];
      const branchName = cust["BRANCH"]?.trim() || "UNKNOWN";

      if (!ld) return;

      ldToBranchMap.set(ld, branchName);

      if (!branchMap.has(branchName)) {
        branchMap.set(branchName, {
          branchName,
          customerCount: 0,
          visitDone: 0,
          visitReject: 0,
          emiReceived: 0,
          emiReject: 0,
          emiReceivedCount: 0, // Added new field for count of accepted collections
        });
      }

      branchMap.get(branchName).customerCount += 1;
    });

    // 2. Count visits by branch via LD
    visits.forEach((visit) => {
      const branchName = ldToBranchMap.get(visit.LD);
      if (!branchName) return;

      const summary = branchMap.get(branchName);
      if (!summary) return;

      if (visit.status === "accept") summary.visitDone += 1;
      else if (visit.status === "reject") summary.visitReject += 1;
    });

    // 3. Sum EMI from collections by branch via LD
    collections.forEach((col) => {
      const branchName = ldToBranchMap.get(col.LD);
      if (!branchName) return;

      const summary = branchMap.get(branchName);
      if (!summary) return;

      if (col.status === "accept") {
        const amount = parseFloat(col.receivedAmount) || 0;
        summary.emiReceived += amount;
        summary.emiReceivedCount += 1; // Increment count for accepted collections
      } else if (col.status === "reject") {
        summary.emiReject += 1; // count the number of rejected collections
      }
    });

    // 4. Convert to array, sort, paginate
    const allSummaries = Array.from(branchMap.values()).sort(
      (a, b) => b.customerCount - a.customerCount
    );

    // Calculate summary totals across all branches
    const summaryTotalCount = {
      totalCustomerCount: allSummaries.reduce((sum, branch) => sum + branch.customerCount, 0),
      totalVisitCount: allSummaries.reduce((sum, branch) => sum + branch.visitDone, 0),
      totalVisitReject: allSummaries.reduce((sum, branch) => sum + branch.visitReject, 0),
      totalEmiReceivedSum: allSummaries.reduce((sum, branch) => sum + branch.emiReceived, 0),
      totalEmiReject: allSummaries.reduce((sum, branch) => sum + branch.emiReject, 0),
      totalEmiReceivedCount: allSummaries.reduce((sum, branch) => sum + branch.emiReceivedCount, 0), // Added total count
    };

    const totalRecords = allSummaries.length;
    const skip = (pageNum - 1) * limitNum;
    const paginatedSummaries = allSummaries.slice(skip, skip + limitNum);

    const pagination = {
      currentPage: pageNum,
      totalPages: Math.ceil(totalRecords / limitNum),
      totalRecords,
      recordsPerPage: limitNum,
    };

    return success(res, "Branch summary retrieved successfully", {
      branches: paginatedSummaries,
      summaryTotalCount,
      pagination
    });
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

// -----------** REPORTING MANAGER WISE DASHBOARD DATA **----------------
async function managerWiseVisitAndCollTable(req, res) {
  try {
    const startDateParam = req.query.startDate;
    const endDateParam = req.query.endDate;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    let startDate, endDate;

    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
      endDate.setHours(23, 59, 59, 999); // make sure endDate includes full day
    } else {
      const today = new Date();
      startDate = new Date(today.setHours(0, 0, 0, 0));
      endDate = new Date(today.setHours(23, 59, 59, 999));
    }

    const collectionRole = await roleModel.findOne({ roleName: "collection" });
    if (!collectionRole) {
      return notFound(res, "Collection role not found");
    }

    const employees = await employeModel.find({
      roleId: collectionRole._id,
      status: "active",
    });

    if (!employees.length) {
      return notFound(res, "No employees found with the collection role");
    }

    // Manager-Teams Mapping
    const managerTeams = {};

    for (const emp of employees) {
      if (!emp.reportingManagerId) continue;

      const managerId = emp.reportingManagerId.toString();

      if (!managerTeams[managerId]) {
        managerTeams[managerId] = {
          managerObjectId: emp.reportingManagerId,
          employees: [],
        };
      }
      managerTeams[managerId].employees.push(emp);
    }

    const uniqueManagerIds = Object.keys(managerTeams);
    const totalManagers = uniqueManagerIds.length;
    const totalPages = Math.ceil(totalManagers / limit);
    const startIndex = (page - 1) * limit;
    const paginatedManagerIds = uniqueManagerIds.slice(startIndex, startIndex + limit);

    // 🔥 Step 1: Calculate overall summaryCounts for ALL managers (before pagination)
    const summaryCounts = await Promise.all(
      uniqueManagerIds.map(async (managerId) => {
        const managerTeam = managerTeams[managerId];
        if (!managerTeam) return { visitCount: 0, emiAcceptCount: 0, totalReceivedAmount: 0 };

        const teamEmployeeIds = managerTeam.employees.map((emp) => emp._id.toString());
        const teamEmployeUniqueIds = managerTeam.employees.map((emp) => emp.employeUniqueId);

        const formattedIds = managerTeam.employees.map((emp) => {
          if (emp.employeName && emp.employeUniqueId) {
            return `${emp.employeName}-${emp.employeUniqueId}`;
          }
          return emp.employeUniqueId;
        });

        const allPossibleIds = [...teamEmployeeIds, ...teamEmployeUniqueIds, ...formattedIds].filter(Boolean);

        const visitCount = await visitModel.countDocuments({
          visitBy: { $in: allPossibleIds },
          status: "accept",
          createdAt: { $gte: startDate, $lte: endDate },
        });

        const collectionData = await collectionModel.aggregate([
          {
            $match: {
              collectedBy: { $in: allPossibleIds },
              status: "accept",
              createdAt: { $gte: startDate, $lte: endDate },
            }
          },
          {
            $group: {
              _id: null,
              totalReceivedAmount: { $sum: "$receivedAmount" },
              emiAcceptCount: { $sum: 1 },
            }
          }
        ]);

        const totalReceivedAmount = collectionData.length ? collectionData[0].totalReceivedAmount : 0;
        const emiAcceptCount = collectionData.length ? collectionData[0].emiAcceptCount : 0;

        return {
          visitCount,
          emiAcceptCount,
          totalReceivedAmount,
        };
      })
    );

    // 🔥 Step 2: Build summaryTotalCount
    const summaryTotalCount = {
      totalVisitCount: summaryCounts.reduce((sum, item) => sum + item.visitCount, 0),
      totalEmiReceivedCount: summaryCounts.reduce((sum, item) => sum + item.emiAcceptCount, 0),
      totalEmiReceivedSum: summaryCounts.reduce((sum, item) => sum + item.totalReceivedAmount, 0),
    };

    // 🔥 Step 3: Fetch paginated managers' data
    const finalData = await Promise.all(
      paginatedManagerIds.map(async (managerId) => {
        const managerTeam = managerTeams[managerId];

        const manager = await employeModel.findById(managerTeam.managerObjectId);
        if (!manager) return null;

        const teamEmployeeIds = managerTeam.employees.map((emp) => emp._id.toString());
        const teamEmployeUniqueIds = managerTeam.employees.map((emp) => emp.employeUniqueId);

        const formattedIds = managerTeam.employees.map((emp) => {
          if (emp.employeName && emp.employeUniqueId) {
            return `${emp.employeName}-${emp.employeUniqueId}`;
          }
          return emp.employeUniqueId;
        });

        const allPossibleIds = [...teamEmployeeIds, ...teamEmployeUniqueIds, ...formattedIds].filter(Boolean);

        // Visit Count (using createdAt)
        const visitCount = await visitModel.countDocuments({
          visitBy: { $in: allPossibleIds },
          status: "accept",
          createdAt: { $gte: startDate, $lte: endDate },
        });

        // Collection Count and Amount (using createdAt)
        const collectionData = await collectionModel.aggregate([
          {
            $match: {
              collectedBy: { $in: allPossibleIds },
              status: "accept",
              createdAt: { $gte: startDate, $lte: endDate },
            }
          },
          {
            $group: {
              _id: null,
              totalReceivedAmount: { $sum: "$receivedAmount" },
              emiAcceptCount: { $sum: 1 },
            }
          }
        ]);

        const totalReceivedAmount = collectionData.length ? collectionData[0].totalReceivedAmount : 0;
        const emiAcceptCount = collectionData.length ? collectionData[0].emiAcceptCount : 0;

        // Get branch name
        let branchName = "";
        if (manager.branchId) {
          const branch = await newbranch.findById(manager.branchId);
          if (branch?.name) {
            branchName = branch.name;
          }
        }

        return {
          managerName: manager.employeName || "",
          employeUniqueId: manager.employeUniqueId || "",
          employeePhoto: manager.employeePhoto || "",
          managerEmployeeId: manager._id.toString(),
          branchId: manager.branchId ? manager.branchId.toString() : null,
          branchName,
          teamSize: managerTeam.employees.length,
          visitAcceptCount: visitCount,
          emiAcceptCount,
          emiReceivedSum: totalReceivedAmount,
        };
      })
    );

    const filteredData = finalData.filter(Boolean);

    return success(res, "Manager Wise Count", {
      data: filteredData,
      summaryTotalCount,
      page,
      limit,
      totalManagers,
      totalPages,
    });

  } catch (error) {
    console.error("Error in managerWiseVisitAndCollTable:", error);
    return unknownError(res, error.message);
  }
}


// -----------** EMPLOYEE WISE VISIT AND EMI COLLECTION COUNT **-------------
// async function employeeWiseVisitAndCollTable(req, res) {
//   try {
//     // Parse query parameters
//     let { startDate, endDate, visitCount, collectionCount, employeeId } = req.query;

//     const visitCountFilter = visitCount ? parseInt(visitCount, 10) : null;
//     const collectionCountFilter = collectionCount ? parseInt(collectionCount, 10) : null;
//     // Add employeeId filter
//     const employeeIdFilter = employeeId || null;
    
//     // If no dates are provided, default to current date
//     if (!startDate || !endDate) {
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
//       const endOfToday = new Date(today);
//       endOfToday.setHours(23, 59, 59, 999);

//       startDate = today;
//       endDate = endOfToday;
//     } else {
//       startDate = new Date(startDate);
//       startDate.setHours(0, 0, 0, 0);
//       endDate = new Date(endDate);
//       endDate.setHours(23, 59, 59, 999);
//     }

//     const dateFilter = { createdAt: { $gte: startDate, $lte: endDate } };

//     // Get pagination parameters
//     const page = parseInt(req.query.page, 10) || 1;
//     const limit = parseInt(req.query.limit, 10) || 10;

//     // Get collection role ID
//     const collectionRole = await roleModel.findOne({ roleName: "collection" });
//     if (!collectionRole) {
//       return notFound(res, "Collection role not found");
//     }

//     // Prepare the employee query
//     const employeeQuery = {
//       roleId: { $in: [collectionRole._id] },
//       status: "active"
//     };
    
//     // Add employeeId filter if provided and not "all"
//     if (employeeIdFilter && employeeIdFilter !== "all") {
//       try {
//         employeeQuery._id = new ObjectId(employeeIdFilter);
//       } catch (err) {
//         return badRequest(res, "Invalid employee ID format");
//       }
//     }
//     // If employeeId is "all" or null, don't add any filter (return all)

//     // Get collection employees
//     const collectionEmployees = await employeModel.find(
//       employeeQuery,
//       {
//         _id: 1,
//         employeName: 1,
//         employeUniqueId: 1,
//         employeePhoto: 1,
//         branchId: 1
//       }
//     ).lean();

//     if (!collectionEmployees.length) {
//       return notFound(res, "No collection employees found", []);
//     }

//     // Extract employee IDs
//     const employeeIds = collectionEmployees
//       .filter(emp => emp.employeUniqueId)
//       .map(emp => emp.employeUniqueId);

//     // Extract branchIds
//     const branchIds = collectionEmployees.map(emp => emp.branchId).filter(Boolean);

//     // Fetch branch names
//     const branchMap = {};
//     if (branchIds.length) {
//       const branches = await newbranch.find({ _id: { $in: branchIds } }, { _id: 1, name: 1 });
//       branches.forEach(branch => {
//         branchMap[branch._id.toString()] = branch.name;
//       });
//     }

//     // Aggregate data
//     const [allVisitCounts, allCollectionSums, allEmiReceiveCounts] = await Promise.all([
//       visitModel.aggregate([
//         {
//           $match: {
//             visitBy: { $regex: new RegExp(`\\b(${employeeIds.join('|')})\\b`, 'i') },
//             status: "accept",
//             ...dateFilter
//           }
//         },
//         {
//           $group: {
//             _id: {
//               $regexFind: {
//                 input: "$visitBy",
//                 regex: new RegExp(`\\b(${employeeIds.join('|')})\\b`, 'i')
//               }
//             },
//             count: { $sum: 1 }
//           }
//         },
//         {
//           $project: {
//             employeeId: { $toUpper: { $arrayElemAt: ["$_id.captures", 0] } },
//             count: 1,
//             _id: 0
//           }
//         }
//       ]),

//       collectionModel.aggregate([
//         {
//           $match: {
//             collectedBy: { $regex: new RegExp(`\\b(${employeeIds.join('|')})\\b`, 'i') },
//             status: "accept",
//             ...dateFilter
//           }
//         },
//         {
//           $group: {
//             _id: {
//               $regexFind: {
//                 input: "$collectedBy",
//                 regex: new RegExp(`\\b(${employeeIds.join('|')})\\b`, 'i')
//               }
//             },
//             totalReceived: { $sum: "$receivedAmount" }
//           }
//         },
//         {
//           $project: {
//             employeeId: { $toUpper: { $arrayElemAt: ["$_id.captures", 0] } },
//             totalReceived: 1,
//             _id: 0
//           }
//         }
//       ]),

//       collectionModel.aggregate([
//         {
//           $match: {
//             collectedBy: { $regex: new RegExp(`\\b(${employeeIds.join('|')})\\b`, 'i') },
//             status: "accept",
//             ...dateFilter
//           }
//         },
//         {
//           $group: {
//             _id: {
//               $regexFind: {
//                 input: "$collectedBy",
//                 regex: new RegExp(`\\b(${employeeIds.join('|')})\\b`, 'i')
//               }
//             },
//             count: { $sum: 1 }
//           }
//         },
//         {
//           $project: {
//             employeeId: { $toUpper: { $arrayElemAt: ["$_id.captures", 0] } },
//             count: 1,
//             _id: 0
//           }
//         }
//       ])
//     ]);

//     // Prepare data maps
//     const visitCountMap = {};
//     const collectionSumMap = {};
//     const emiReceiveCountMap = {};

//     allVisitCounts.forEach(item => {
//       visitCountMap[item.employeeId] = item.count;
//     });

//     allCollectionSums.forEach(item => {
//       collectionSumMap[item.employeeId] = item.totalReceived;
//     });

//     allEmiReceiveCounts.forEach(item => {
//       emiReceiveCountMap[item.employeeId] = item.count;
//     });

//     // Map employees with stats
//     let allEmployeesWithStats = collectionEmployees.map(employee => {
//       const empId = employee.employeUniqueId ? employee.employeUniqueId.toUpperCase() : "";
      
//       return {
//         _id: employee._id,
//         employeName: employee.employeName || "Unknown", // Fallback to "Unknown"
//         employeUniqueId: employee.employeUniqueId || "",
//         employeePhoto:employee.employeePhoto || "",
//         employeBranch: branchMap[employee.branchId?.toString()] || "",
//         visitAcceptCount: visitCountMap[empId] || 0,
//         emiReceivedSum: collectionSumMap[empId] || 0,
//         emiReceiveCount: emiReceiveCountMap[empId] || 0,
//       };
//     });

//     // Apply filters if provided
//     if (visitCountFilter !== null) {
//       allEmployeesWithStats = allEmployeesWithStats.filter(emp => emp.visitAcceptCount === visitCountFilter);
//     }

//     if (collectionCountFilter !== null) {
//       allEmployeesWithStats = allEmployeesWithStats.filter(emp => emp.emiReceiveCount === collectionCountFilter);
//     }

//     // Sort by amount collected
//     allEmployeesWithStats.sort((a, b) => b.emiReceivedSum - a.emiReceivedSum);

//     // Pagination and summary
//     const total = allEmployeesWithStats.length;
//     const skip = (page - 1) * limit;
//     const employeesWithStats = allEmployeesWithStats.slice(skip, skip + limit);

//     const summaryTotalCount = {
//       totalVisitCount: allEmployeesWithStats.reduce((sum, emp) => sum + emp.visitAcceptCount, 0),
//       totalEmiReceivedCount: allEmployeesWithStats.reduce((sum, emp) => sum + emp.emiReceiveCount, 0),
//       totalEmiReceivedSum: allEmployeesWithStats.reduce((sum, emp) => sum + emp.emiReceivedSum, 0)
//     };

//     const pagination = {
//       currentPage: page,
//       totalPages: Math.ceil(total / limit),
//       totalRecords: total,
//       recordsPerPage: limit
//     };

//     return success(res, "Collection employees retrieved successfully", {
//       data: employeesWithStats,
//       summaryTotalCount,
//       pagination,
//     });
//   } catch (error) {
//     console.error(error);
//     return unknownError(res, error);
//   }
// }
async function employeeWiseVisitAndCollTable(req, res) {
  try {
    // Parse query parameters
    let { startDate, endDate, visitCount, collectionCount, employeeId ,reportingManagerId } = req.query;

    const visitCountFilter = visitCount ? parseInt(visitCount, 10) : null;
    const collectionCountFilter = collectionCount ? parseInt(collectionCount, 10) : null;
    // Add employeeId filter
    const employeeIdFilter = employeeId || null;
    const reportingManagerFilter = reportingManagerId || "all";
    
    // If no dates are provided, default to current date
    if (!startDate || !endDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);

      startDate = today;
      endDate = endOfToday;
    } else {
      startDate = new Date(startDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(endDate);
      endDate.setHours(23, 59, 59, 999);
    }

    const dateFilter = { createdAt: { $gte: startDate, $lte: endDate } };

    // Get pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    // Get collection role ID
    const collectionRole = await roleModel.findOne({ roleName: "collection" });
    if (!collectionRole) {
      return notFound(res, "Collection role not found");
    }

    // Prepare the employee query
    const employeeQuery = {
      roleId: { $in: [collectionRole._id] },
      status: "active"
    };
    
    // Add employeeId filter if provided and not "all"
    if (employeeIdFilter && employeeIdFilter !== "all") {
      try {
        employeeQuery._id = new ObjectId(employeeIdFilter);
      } catch (err) {
        return badRequest(res, "Invalid employee ID format");
      }
    }

    if (reportingManagerFilter !== "all") {
  try {
    employeeQuery.reportingManagerId = new ObjectId(reportingManagerFilter);
  } catch (err) {
    return badRequest(res, "Invalid reportingManagerId format");
  }
}

    // Get collection employees
    const collectionEmployees = await employeModel.find(
      employeeQuery,
      {
        _id: 1,
        employeName: 1,
        employeUniqueId: 1,
        employeePhoto: 1,
        branchId: 1,
        reportingManagerId:1
      }
    ).lean();

    if (!collectionEmployees.length) {
      return notFound(res, "No collection employees found", []);
    }

    // Extract employee IDs
    const employeeIds = collectionEmployees
      .filter(emp => emp.employeUniqueId)
      .map(emp => emp.employeUniqueId);

    // Extract branchIds
    const branchIds = collectionEmployees.map(emp => emp.branchId).filter(Boolean);

    // Fetch branch names
    const branchMap = {};
    if (branchIds.length) {
      const branches = await newbranch.find({ _id: { $in: branchIds } }, { _id: 1, name: 1 });
      branches.forEach(branch => {
        branchMap[branch._id.toString()] = branch.name;
      });
    }

    // Aggregate data
    const [allVisitCounts, allCollectionSums, allEmiReceiveCounts] = await Promise.all([
      visitModel.aggregate([
        {
          $match: {
            visitBy: { $regex: new RegExp(`\\b(${employeeIds.join('|')})\\b`, 'i') },
            status: "accept",
            ...dateFilter
          }
        },
        {
          $group: {
            _id: {
              $regexFind: {
                input: "$visitBy",
                regex: new RegExp(`\\b(${employeeIds.join('|')})\\b`, 'i')
              }
            },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            employeeId: { $toUpper: { $arrayElemAt: ["$_id.captures", 0] } },
            count: 1,
            _id: 0
          }
        }
      ]),

      collectionModel.aggregate([
        {
          $match: {
            collectedBy: { $regex: new RegExp(`\\b(${employeeIds.join('|')})\\b`, 'i') },
            status: "accept",
            ...dateFilter
          }
        },
        {
          $group: {
            _id: {
              $regexFind: {
                input: "$collectedBy",
                regex: new RegExp(`\\b(${employeeIds.join('|')})\\b`, 'i')
              }
            },
            totalReceived: { $sum: "$receivedAmount" }
          }
        },
        {
          $project: {
            employeeId: { $toUpper: { $arrayElemAt: ["$_id.captures", 0] } },
            totalReceived: 1,
            _id: 0
          }
        }
      ]),

      collectionModel.aggregate([
        {
          $match: {
            collectedBy: { $regex: new RegExp(`\\b(${employeeIds.join('|')})\\b`, 'i') },
            status: "accept",
            ...dateFilter
          }
        },
        {
          $group: {
            _id: {
              $regexFind: {
                input: "$collectedBy",
                regex: new RegExp(`\\b(${employeeIds.join('|')})\\b`, 'i')
              }
            },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            employeeId: { $toUpper: { $arrayElemAt: ["$_id.captures", 0] } },
            count: 1,
            _id: 0
          }
        }
      ])
    ]);

    // Prepare data maps
    const visitCountMap = {};
    const collectionSumMap = {};
    const emiReceiveCountMap = {};

    allVisitCounts.forEach(item => {
      visitCountMap[item.employeeId] = item.count;
    });

    allCollectionSums.forEach(item => {
      collectionSumMap[item.employeeId] = item.totalReceived;
    });

    allEmiReceiveCounts.forEach(item => {
      emiReceiveCountMap[item.employeeId] = item.count;
    });

    // Get customer allocations from Google Sheets for all employees
    const customerAllocationCounts = await getCustomerAllocationsForEmployees(employeeIds);

    // Map employees with stats
    let allEmployeesWithStats = collectionEmployees.map(employee => {
      const empId = employee.employeUniqueId ? employee.employeUniqueId.toUpperCase() : "";
      
      return {
        _id: employee._id,
        employeName: employee.employeName || "", // Fallback to "Unknown"
        employeUniqueId: employee.employeUniqueId || "",
        employeePhoto: employee.employeePhoto || "",
        employeBranch: branchMap[employee.branchId?.toString()] || "",
        reportingManagerId:employee.reportingManagerId,
        visitAcceptCount: visitCountMap[empId] || 0,
        emiReceivedSum: collectionSumMap[empId] || 0,
        emiReceiveCount: emiReceiveCountMap[empId] || 0,
        customerCount: customerAllocationCounts[empId] || 0 // Add customer count from Google Sheet
      };
    });

    // Apply filters if provided
    if (visitCountFilter !== null) {
      allEmployeesWithStats = allEmployeesWithStats.filter(emp => emp.visitAcceptCount === visitCountFilter);
    }

    if (collectionCountFilter !== null) {
      allEmployeesWithStats = allEmployeesWithStats.filter(emp => emp.emiReceiveCount === collectionCountFilter);
    }

    // Sort by amount collected
    allEmployeesWithStats.sort((a, b) => b.emiReceivedSum - a.emiReceivedSum);

    // Pagination and summary
    const total = allEmployeesWithStats.length;
    const skip = (page - 1) * limit;
    const employeesWithStats = allEmployeesWithStats.slice(skip, skip + limit);

    const summaryTotalCount = {
      totalVisitCount: allEmployeesWithStats.reduce((sum, emp) => sum + emp.visitAcceptCount, 0),
      totalEmiReceivedCount: allEmployeesWithStats.reduce((sum, emp) => sum + emp.emiReceiveCount, 0),
      totalEmiReceivedSum: allEmployeesWithStats.reduce((sum, emp) => sum + emp.emiReceivedSum, 0),
      totalCustomerCount: allEmployeesWithStats.reduce((sum, emp) => sum + emp.customerCount, 0) // Add total customer count
    };

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      recordsPerPage: limit
    };

    return success(res, "Collection employees retrieved successfully", {
      data: employeesWithStats,
      summaryTotalCount,
      pagination,
    });
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

async function getCustomerAllocationsForEmployees(employeeIds) {
  try {
    const spreadsheetId = process.env.VISIT_GOOGLE_SHEET_KEY;
    const sheetName = process.env.EMIOVERALL_SHEET;
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found in Google Sheet.');
      return {};
    }

    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      let obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] !== undefined ? row[index] : null;
      });
      return obj;
    });

    const allocationFields = [
      'Allocation 1 emp id',
      'Allocation 2 emp id',
      'Allocation 3 emp id',
      'Allocation 4 emp id',
    ];

    // Count customers for each employee
    const customerCounts = {};
    
    // Initialize counts for all employees with zero
    employeeIds.forEach(empId => {
      customerCounts[empId.toUpperCase()] = 0;
    });

    // Count the allocations
    data.forEach(row => {
      // Only count rows with positive NET DUE (unless it's non-numeric)
      const netDue = parseFloat(row['NET DUE'] || 0);
      if (isNaN(netDue) || netDue > 0) {
        allocationFields.forEach(field => {
          if (row[field]) {
            // Clean up and normalize the employee ID for comparison
            const allocEmpId = row[field].trim().toUpperCase();
            
            // Check if this ID matches any of our employees
            employeeIds.forEach(empId => {
              const normalizedEmpId = empId.toUpperCase();
              if (allocEmpId === normalizedEmpId || allocEmpId.includes(normalizedEmpId)) {
                customerCounts[normalizedEmpId] = (customerCounts[normalizedEmpId] || 0) + 1;
              }
            });
          }
        });
      }
    });

    return customerCounts;
  } catch (error) {
    console.error("Error fetching customer allocations:", error.message);
    return {}; // Return empty object if there's an error
  }
}

// --------CUSTOMER LIST HAVE NOT VISIT OR COLLECTION---------------
async function customerListNotVisitOrCollection(req, res) {
  try {
    // Parse query parameters
    let { startDate, endDate, employeeId } = req.query;
    
    // Set date range (default to today if not provided)
    const today = new Date();
    if (!startDate || !endDate) {
      startDate = new Date(today.setHours(0, 0, 0, 0));
      endDate = new Date(today.setHours(23, 59, 59, 999));
    } else {
      startDate = new Date(startDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(endDate);
      endDate.setHours(23, 59, 59, 999);
    }

    console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

    // Get pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    // Get collection employee by ID
    const employee = await employeModel.findById(
      employeeId,
      { _id: 1, employeName: 1, employeUniqueId: 1, employeePhoto: 1, branchId: 1 }
    ).lean();

    if (!employee) return notFound(res, "Employee not found.", []);
    if (!employee.employeUniqueId) return notFound(res, "Employee has no unique ID.", []);

    // Use the single employee's unique ID
    const employeeUniqueId = employee.employeUniqueId;
    
    // Get branch info if branchId exists
    let branchName = '';
    if (employee.branchId) {
      const branch = await newbranch.findById(
        employee.branchId, 
        { _id: 1, name: 1 }
      ).lean();
      if (branch) branchName = branch.name;
    }

    // IMPORTANT: Get LDs visited or collected for the specified date range
    const dateFilter = { 
      createdAt: { $gte: startDate, $lte: endDate },
      status: "accept" // Only include status "accept"

    };

    // Get all LD numbers from visits and collections within the date range
    const [visitedLDNumbers, collectedLDNumbers] = await Promise.all([
      visitModel.distinct("LD", dateFilter),  // Only get LDs for the date range
      collectionModel.distinct("LD", dateFilter)  // Only get LDs for the date range
    ]);

    // Create processed set of LDs that have been processed in the date range
    const processedSet = new Set([...visitedLDNumbers, ...collectedLDNumbers].map(ld => 
      ld ? ld.toString().trim().toLowerCase() : ''
    ).filter(ld => ld));

    // For debugging
    // console.log(`Total visited LD numbers in date range: ${visitedLDNumbers.length}`);
    // console.log(`Total collected LD numbers in date range: ${collectedLDNumbers.length}`);
    // console.log(`Total processed LD numbers in date range: ${processedSet.size}`);
    
    // Prepare result structure for this employee
    const employeeResult = {
      _id: employee._id,
      employeName: employee.employeName,
      employeUniqueId: employee.employeUniqueId,
      employeePhoto: employee.employeePhoto,
      branchId: employee.branchId,
      branchName: branchName,
      unprocessedCustomers: []
    };

    // Get customer data from Google Sheet
    const spreadsheetId = process.env.VISIT_GOOGLE_SHEET_KEY;
    const sheetName = process.env.EMIOVERALL_SHEET;
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
    const response = await sheets.spreadsheets.values.get({ spreadsheetId, range: sheetName });

    if (!response.data.values || response.data.values.length === 0) {
      employeeResult.unprocessedCustomerCount = 0;
      return success(res, "No customer data found in Google Sheet", { 
        data: [employeeResult], 
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalRecords: 1,
          recordsPerPage: limit
        }
      });
    }

    // Process Google Sheet data
    const headers = response.data.values[0];
    const headerIndices = {};
    
    // Map column indices
    headers.forEach((header, index) => {
      headerIndices[header] = index;
    });

    // Define allocation fields
    const allocationFields = ['Allocation 1 emp id', 'Allocation 2 emp id'];
    const empIdUpper = employeeUniqueId.toUpperCase();

    // Process each row in the Google Sheet to find unprocessed customers
    const data = response.data.values.slice(1);
    for (const row of data) {
      // Get LD number and net due - skip early if possible
      const ldNoIdx = headerIndices['LD'];
      const netDueIdx = headerIndices['NET DUE'];
      
      if (ldNoIdx === undefined || netDueIdx === undefined || !row[ldNoIdx]) continue;
      
      const ldNo = row[ldNoIdx];
      const netDueStr = row[netDueIdx] || '0';
      const netDue = parseFloat(netDueStr.replace(/,/g, ''));
    
      
      // Skip if no amount due
      if (netDue <= 0) continue;
      
      // Check if this LD exists in visitModel or collectionModel within date range
      if (processedSet.has(ldNo.toString().trim().toLowerCase())) {
        console.log(`Skipping LD ${ldNo} as it has been visited or collected within date range`);
        continue;
      }

      // Check if this employee is allocated to this customer
      let isAllocated = false;
      for (const field of allocationFields) {
        const fieldIdx = headerIndices[field];
        if (fieldIdx === undefined || !row[fieldIdx]) continue;
        
        const allocEmpId = row[fieldIdx].trim().toUpperCase();
        if (allocEmpId === empIdUpper || allocEmpId.includes(empIdUpper)) {
          isAllocated = true;
          break;
        }
      }
      
      // If not allocated to this employee, skip
      if (!isAllocated) continue;
      
      // Helper function to safely get column value
      const getValue = (columnName) => {
        const idx = headerIndices[columnName];
        return idx !== undefined && row[idx] !== undefined ? row[idx] : '';
      };
      
      // Add to unprocessed customers
      employeeResult.unprocessedCustomers.push({
        'LD': ldNo,
        'branch': getValue('BRANCH'),
        'customerName': getValue('CUSTOMER NAME') || getValue('CUSTOMER NAME ') || '',
        'fatherName': getValue('FATHER NAME') || getValue('FATHER NAME ') || '',
        'mobile': getValue('MOBILE') || '',
        'village': getValue('VILLAGE') || '',
        'address': getValue('ADDRESS') || '',
        'patner': getValue('PATNER') || '',
        'mode': getValue('MODE') || '',
        'emiAmount': parseFloat(getValue(('EMI AMOUNT ') || 0).replace(/,/g, '')),
        'oldDue': parseFloat(getValue(('OLD DUE ') || 0).replace(/,/g, '')),
        'netDue': netDue,
        'collectionType': getValue('COLLECTION TYPE') || '',
        'lat': getValue('LAT') || getValue('LAT ') || '',
        'long': getValue('LONG') || getValue('LONG ') || ''
      });
    }

    // Count unprocessed customers
    employeeResult.unprocessedCustomerCount = employeeResult.unprocessedCustomers.length;
    
    // Return result with the employee
    return success(res, "Unprocessed customers retrieved for employee", {
      data: [employeeResult],
      pagination: {
        currentPage: page,
        totalPages: 1,
        totalRecords: 1,
        recordsPerPage: limit
      }
    });
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

// -------------HIERARACHY VIEW TABLE DATA SHOW -------------------
async function reportingDashBoardVisit(req, res) {
  try {
    const { employeeId, startDate, endDate } = req.query;
    
    // Find the employee
    const employee = await employeModel.findOne({ _id: new ObjectId(employeeId) });
    
    if (!employee) {
      return notFound(res, 'Employee not found', []);
    }
    
    // Parse the date parameters or use current date if not provided
    let parsedStartDate = null;
    let parsedEndDate = null;
    
    if (startDate) {
      parsedStartDate = new Date(startDate);
      // Ensure start of day
      parsedStartDate.setHours(0, 0, 0, 0);
    } else {
      // Default to current day's start
      parsedStartDate = new Date();
      parsedStartDate.setHours(0, 0, 0, 0);
    }
    
    if (endDate) {
      parsedEndDate = new Date(endDate);
      // Ensure end of day
      parsedEndDate.setHours(23, 59, 59, 999);
    } else {
      // Default to current day's end
      parsedEndDate = new Date();
      parsedEndDate.setHours(23, 59, 59, 999);
    }
    
    // Log date range for debugging
    // console.log(`Date Range: ${parsedStartDate.toISOString()} to ${parsedEndDate.toISOString()}`);
    
    // Get optimized hierarchy data with efficient statistics calculation
    const hierarchyData = await buildOptimizedHierarchy(
      employee._id, 
      parsedStartDate, 
      parsedEndDate
    );
    
    return success(res, "success", {
      data: hierarchyData
    });
  } catch (error) {
    console.log(error);
    return unknownError(res, error.message);
  }
}

// New optimized function with better performance and accurate visit counting
async function buildOptimizedHierarchy(employeeId, startDate, endDate) {
  try {
    // Get the main employee
    const mainEmployee = await employeModel.findById(employeeId);
    if (!mainEmployee) {
      return null;
    }
    
    // Get all direct subordinates of this employee
    const directSubordinates = await employeModel.find({ 
      reportingManagerId: employeeId,
      status: "active"
    });
    
    // Get all direct subordinate IDs
    const directSubordinateIds = directSubordinates.map(emp => emp._id);
    
    // Get all employees in the hierarchy under directSubordinates in a single query
    // This avoids recursive DB queries and gets the full hierarchy at once
    const allSubordinates = await getAllSubordinatesFlat(directSubordinateIds);
    
    // Get all employees in a single array
    const allEmployees = [mainEmployee, ...directSubordinates, ...allSubordinates];
    
    // Process all roles in a single query
    const allRoleIds = [];
    allEmployees.forEach(emp => {
      if (emp.roleId && Array.isArray(emp.roleId)) {
        emp.roleId.forEach(id => allRoleIds.push(id));
      }
    });
    
    const allRoles = await roleModel.find({ _id: { $in: allRoleIds } });
    
    // Create role map for quick lookups
    const roleMap = {};
    allRoles.forEach(role => {
      roleMap[role._id.toString()] = role;
    });
    
    // Collect all branch IDs to fetch branch names in a single query
    const allBranchIds = [];
    allEmployees.forEach(emp => {
      if (emp.branchId) {
        allBranchIds.push(emp.branchId);
      }
    });
    
    // Fetch all branches in a single query
    const allBranches = await newbranch.find({ _id: { $in: allBranchIds } });
    
    // Create branch map for quick lookups
    const branchMap = {};
    allBranches.forEach(branch => {
      branchMap[branch._id.toString()] = branch.name || "";
    });
    
    // Identify collectors and create employee to visitKey mapping
    const employeeToVisitKeyMap = new Map();
    const collectorIds = [];
    
    allEmployees.forEach(emp => {
      const isCollector = emp.roleId && Array.isArray(emp.roleId) && emp.roleId.some(roleId => {
        const role = roleMap[roleId.toString()];
        return role && role.roleName && role.roleName.toLowerCase().includes('collection');
      });
      
      if (isCollector) {
        const visitKey = `${emp.employeName}-${emp.employeUniqueId}`;
        employeeToVisitKeyMap.set(emp._id.toString(), visitKey);
        collectorIds.push(visitKey);
      }
    });
    
    // Get all visit stats in a single query with explicit date filtering
    // Ensure we're using proper date objects for the query
    const visitQuery = {
      visitBy: { $in: collectorIds }
    };
    
    // Add date range filter if valid dates are provided
    if (startDate instanceof Date && !isNaN(startDate.getTime()) &&
        endDate instanceof Date && !isNaN(endDate.getTime())) {
      visitQuery.createdAt = { 
        $gte: startDate, 
        $lte: endDate 
      };
    }
    
    const allVisits = await visitModel.find(visitQuery);
    
    // Create a map to store visit counts per collector
    const visitCountMap = new Map();
    collectorIds.forEach(id => {
      visitCountMap.set(id, { accepted: 0, rejected: 0 });
    });
    
    // Count visits for each collector
    allVisits.forEach(visit => {
      const visitBy = visit.visitBy;
      if (!visitCountMap.has(visitBy)) {
        visitCountMap.set(visitBy, { accepted: 0, rejected: 0 });
      }
      
      const stats = visitCountMap.get(visitBy);
      if (visit.status === 'accept') {
        stats.accepted++;
      } else if (visit.status === 'reject') {
        stats.rejected++;
      }
    });
    
    // Get all collections in a single query with the same date filtering
    const collectionQuery = {};
    
    // Add date range filter if valid dates are provided
    if (startDate instanceof Date && !isNaN(startDate.getTime()) &&
        endDate instanceof Date && !isNaN(endDate.getTime())) {
      collectionQuery.createdAt = { 
        $gte: startDate, 
        $lte: endDate 
      };
    }
    
    const allCollections = await collectionModel.find(collectionQuery);
    
    // Create a map to store collection counts per collector
    const collectionStatsMap = new Map();
    collectorIds.forEach(id => {
      collectionStatsMap.set(id, { 
        emiAcceptCount: 0, 
        emiReceivedSum: 0 
      });
    });
    
    // Process collections for each collector
    allCollections.forEach(collection => {
      if (collection.status === 'accept') {
        const collectedBy = collection.collectedBy;
        
        // Check if collectedBy matches any of our known collectors
        if (collectionStatsMap.has(collectedBy)) {
          const stats = collectionStatsMap.get(collectedBy);
          
          // Increment the count
          stats.emiAcceptCount++;
          
          // Add the EMI amount if it exists
          if (collection.receivedAmount && !isNaN(Number(collection.receivedAmount))) {
            stats.emiReceivedSum
             += Number(collection.receivedAmount);
          }
        }
      }
    });
    
    // Debug log to verify counts
    console.log(`Found ${allVisits.length} total visits for ${collectorIds.length} collectors`);
    console.log(`Found ${allCollections.length} total collections`);
    
    // Function to get stats for an employee (including their own stats only)
    function getEmployeeStats(empId) {
      const visitKey = employeeToVisitKeyMap.get(empId);
      if (!visitKey) return { accepted: 0, rejected: 0 };
      
      return visitCountMap.get(visitKey) || { accepted: 0, rejected: 0 };
    }
    
    // Function to get collection stats for an employee
    function getEmployeeCollectionStats(empId) {
      const visitKey = employeeToVisitKeyMap.get(empId);
      if (!visitKey) return { emiAcceptCount: 0, emiReceivedSum: 0 };
      
      return collectionStatsMap.get(visitKey) || { emiAcceptCount: 0, emiReceivedSum: 0 };
    }
    
    // Function to calculate the total stats for an employee and all their descendants
    function calculateTotalStats(empId, descendants = []) {
      // Start with the employee's own stats
      const ownStats = getEmployeeStats(empId);
      const totalStats = { ...ownStats };
      
      // Add stats from all descendants
      for (const desc of descendants) {
        const descStats = getEmployeeStats(desc._id.toString());
        totalStats.accepted += descStats.accepted;
        totalStats.rejected += descStats.rejected;
      }
      
      return totalStats;
    }
    
    // Function to calculate the total collection stats for an employee and all descendants
    function calculateTotalCollectionStats(empId, descendants = []) {
      // Start with the employee's own collection stats
      const ownStats = getEmployeeCollectionStats(empId);
      const totalStats = { ...ownStats };
      
      // Add collection stats from all descendants
      for (const desc of descendants) {
        const descStats = getEmployeeCollectionStats(desc._id.toString());
        totalStats.emiAcceptCount += descStats.emiAcceptCount;
        totalStats.emiReceivedSum += descStats.emiReceivedSum;
      }
      
      return totalStats;
    }
    
    // Calculate stats for each direct subordinate (including their descendants)
    const directSubordinateStatsMap = new Map();
    const directSubordinateCollectionStatsMap = new Map();
    
    for (const sub of directSubordinates) {
      const subId = sub._id.toString();
      const descendants = getDescendantsFromList(subId, allSubordinates);
      const totalStats = calculateTotalStats(subId, descendants);
      const totalCollectionStats = calculateTotalCollectionStats(subId, descendants);
      
      directSubordinateStatsMap.set(subId, totalStats);
      directSubordinateCollectionStatsMap.set(subId, totalCollectionStats);
    }
    
    // Build main employee node
    const isMainCollector = mainEmployee.roleId && Array.isArray(mainEmployee.roleId) && 
      mainEmployee.roleId.some(roleId => {
        const role = roleMap[roleId.toString()];
        return role && role.roleName && role.roleName.toLowerCase().includes('collection');
      });
    
    // Get branch name for main employee
    const mainEmployeeBranchName = mainEmployee.branchId ? 
      branchMap[mainEmployee.branchId.toString()] || "" : 
      "No Branch Assigned";
    
    // Calculate main employee's complete stats (including all descendants)
    const allDescendants = [...directSubordinates, ...allSubordinates];
    const mainEmployeeStats = calculateTotalStats(mainEmployee._id.toString(), allDescendants);
    const mainEmployeeCollectionStats = calculateTotalCollectionStats(mainEmployee._id.toString(), allDescendants);
    
    const mainNode = {
      id: mainEmployee._id,
      employeUniqueId: mainEmployee.employeUniqueId,
      employeName: mainEmployee.employeName,
      employeeBranch: mainEmployee.branchId || null,
      employeeBranchName: mainEmployeeBranchName,
      mobileNo: mainEmployee.mobileNo,
      isCollector: isMainCollector,
      visitStats: mainEmployeeStats,
      emiAcceptCount: mainEmployeeCollectionStats.emiAcceptCount,
      emiReceivedSum: mainEmployeeCollectionStats.emiReceivedSum,
      children: []
    };
    
    // Build children nodes (only direct subordinates) with aggregated stats
    for (const sub of directSubordinates) {
      const subId = sub._id.toString();
      const isCollector = sub.roleId && Array.isArray(sub.roleId) && sub.roleId.some(roleId => {
        const role = roleMap[roleId.toString()];
        return role && role.roleName && role.roleName.toLowerCase().includes('collection');
      });
      
      // Check if this employee has any subordinates
      const hasSubordinates = allSubordinates.some(emp => 
        emp.reportingManagerId && emp.reportingManagerId.toString() === subId
      );
      
      // Get branch name for this subordinate
      const subBranchName = sub.branchId ? 
        branchMap[sub.branchId.toString()] || "" : 
        "No Branch Assigned";
      
      // Get aggregated stats for this subordinate
      const subStats = directSubordinateStatsMap.get(subId) || { accepted: 0, rejected: 0 };
      const subCollectionStats = directSubordinateCollectionStatsMap.get(subId) || { 
        emiAcceptCount: 0, 
        emiReceivedSum: 0 
      };
      
      // Create child node with aggregated stats
      const childNode = {
        id: sub._id,
        employeUniqueId: sub.employeUniqueId,
        employeName: sub.employeName,
        employeeBranch: sub.branchId || null,
        employeeBranchName: subBranchName,
        mobileNo: sub.mobileNo,
        isCollector: isCollector,
        visitStats: subStats,
        emiAcceptCount: subCollectionStats.emiAcceptCount,
        emiReceivedSum: subCollectionStats.emiReceivedSum,
        hasChildren: hasSubordinates
      };
      
      // Add child to main node's children array
      mainNode.children.push(childNode);
    }
    
    // Sort children by accepted count in descending order (max to min)
    mainNode.children.sort((a, b) => b.visitStats.accepted - a.visitStats.accepted);
    
    return mainNode;
  } catch (error) {
    console.log("Error in buildOptimizedHierarchy:", error);
    throw error;
  }
}

// Helper function to get all subordinates in a flat list using a single database query
async function getAllSubordinatesFlat(rootIds) {
  try {
    // Start with an empty result array
    let allSubordinates = [];
    
    // Keep track of IDs we need to query for
    let idsToQuery = [...rootIds.map(id => id.toString())];
    
    // Keep fetching until we have no more IDs to query
    while (idsToQuery.length > 0) {
      // Query for employees that report to any of these managers
      const subordinates = await employeModel.find({
        reportingManagerId: { $in: idsToQuery },
        status: "active"
      });
      
      // No more subordinates found, we're done
      if (subordinates.length === 0) {
        break;
      }
      
      // Add these subordinates to our result
      allSubordinates = [...allSubordinates, ...subordinates];
      
      // Get the IDs of these subordinates to find their subordinates in the next iteration
      idsToQuery = subordinates.map(emp => emp._id.toString());
    }
    
    return allSubordinates;
  } catch (error) {
    console.log("Error in getAllSubordinatesFlat:", error);
    throw error;
  }
}

// Helper function to extract descendants from a flat list of employees
function getDescendantsFromList(employeeId, allEmployees) {
  // Start with direct descendants
  const directDescendants = allEmployees.filter(emp => 
    emp.reportingManagerId && emp.reportingManagerId.toString() === employeeId
  );
  
  // Initialize result with direct descendants
  const allDescendants = [...directDescendants];
  
  // For each direct descendant, add its descendants recursively
  for (const desc of directDescendants) {
    const moreDescendants = getDescendantsFromList(desc._id.toString(), allEmployees);
    allDescendants.push(...moreDescendants);
  }
  
  return allDescendants;
}

// --------------COLECTION ROLE 0 VISIT AND 0 COLLECTION EMPLOYEE LIST------------
async function zeroVisitOrCollection(req, res) {
  try {
    // Get date parameters or default to current date
    const { startDate, endDate } = req.query;
    
    // Set default start date to today's start if not provided
    const today = new Date();
    
    let queryStartDate = startDate ? new Date(startDate) : new Date(today);
    queryStartDate.setHours(0, 0, 0, 0);
    
    // Set default end date to today's end if not provided
    let queryEndDate = endDate ? new Date(endDate) : new Date(today);
    queryEndDate.setHours(23, 59, 59, 999);
    
    // Get the token employee ID
    const tokenId = new ObjectId(req.Id);

    // Step 1: Execute these queries in parallel to save time
    const [collectionRole, tokenEmployee, allEmployees, todayCollections, todayVisits] = await Promise.all([
      // Get collection role
      roleModel.findOne({ roleName: "collection" }).lean(),
      
      // Get token employee
      employeModel.findById(tokenId).lean(),
      
      // Get all active employees with minimal fields
      employeModel.find(
        { status: "active" },
        { 
          _id: 1, 
          employeUniqueId: 1, 
          employeName: 1, 
          mobileNo: 1,
          email: 1, 
          workEmail: 1, 
          reportingManagerId: 1,
          roleId: 1,
          branchId: 1
        }
      ).lean(),
      
      // Get collections within date range (only collectedBy field)
      collectionModel.find(
        { createdAt: { $gte: queryStartDate, $lte: queryEndDate } },
        { collectedBy: 1 }
      ).lean(),
      
      // Get visits within date range (only visitBy field)
      visitModel.find(
        { createdAt: { $gte: queryStartDate, $lte: queryEndDate } },
        { visitBy: 1 }
      ).lean()
    ]);
    
    if (!collectionRole) {
      return notFound(res, "Collection role not found");
    }
    
    if (!tokenEmployee) {
      return notFound(res, "Employee not found");
    }
    
    // Collection role ID as string for safe comparison
    const collectionRoleIdStr = collectionRole._id.toString();
    
    // Step 2: Process employees and build hierarchy maps (in memory)
    const employeeMap = {};
    const employeeIdMap = {}; // Map employeUniqueId to employee
    
    // First pass: Create basic employee objects
    allEmployees.forEach(emp => {
      // Safe check for collection role
      let isCollectionRole = false;
      
      if (emp.roleId) {
        if (Array.isArray(emp.roleId)) {
          isCollectionRole = emp.roleId.some(role => 
            role && role.toString() === collectionRoleIdStr
          );
        } else {
          isCollectionRole = emp.roleId.toString() === collectionRoleIdStr;
        }
      }
      
      const empObj = {
        ...emp,
        isCollectionRole,
        subordinates: []
      };
      
      employeeMap[emp._id.toString()] = empObj;
      
      // Also map by employeUniqueId for faster lookup
      if (emp.employeUniqueId) {
        employeeIdMap[emp.employeUniqueId] = empObj;
      }
    });
    
    // Second pass: Build hierarchy
    allEmployees.forEach(emp => {
      if (emp.reportingManagerId) {
        const managerId = emp.reportingManagerId.toString();
        if (employeeMap[managerId]) {
          employeeMap[managerId].subordinates.push(emp._id.toString());
        }
      }
    });
    
    // Step 3: Process visit and collection data (in memory)
    const visitEmployeeSet = new Set();
    const collectionEmployeeSet = new Set();
    
    // Extract unique IDs efficiently
    function extractEmployeeId(identifier) {
      if (!identifier) return null;
      const match = identifier.match(/([A-Za-z]+[-]?\d+)$/);
      return match ? match[1].toUpperCase() : null;
    }
    
    // Process all collections in one loop
    todayCollections.forEach(collection => {
      if (collection && collection.collectedBy) {
        const extractedId = extractEmployeeId(collection.collectedBy);
        if (extractedId) {
          collectionEmployeeSet.add(extractedId);
        }
      }
    });
    
    // Process all visits in one loop
    todayVisits.forEach(visit => {
      if (visit && visit.visitBy) {
        const extractedId = extractEmployeeId(visit.visitBy);
        if (extractedId) {
          visitEmployeeSet.add(extractedId);
        }
      }
    });
    
    // Step 4: Get all subordinates of the token employee efficiently
    function getAllSubordinatesFlat(managerId) {
      const result = [];
      const stack = [managerId.toString()];
      const visited = new Set(); // Prevent infinite loops
      
      while (stack.length > 0) {
        const currentId = stack.pop();
        
        if (visited.has(currentId)) continue;
        visited.add(currentId);
        
        const manager = employeeMap[currentId];
        if (!manager) continue;
        
        for (const subId of manager.subordinates) {
          const subordinate = employeeMap[subId];
          if (subordinate) {
            result.push(subordinate);
            stack.push(subId);
          }
        }
      }
      
      return result;
    }
    
    // Get all subordinates and include the token employee
    const allSubordinates = getAllSubordinatesFlat(tokenId.toString());
    const tokenEmployeeObj = employeeMap[tokenId.toString()];
    if (tokenEmployeeObj) {
      allSubordinates.push(tokenEmployeeObj);
    }
    
    // Step 5: Filter only collection role employees
    const collectionEmployees = allSubordinates.filter(emp => emp.isCollectionRole);
    
    // Step 6: Create the absent employee lists directly
    const noVisitEmployees = [];
    const noCollectionEmployees = [];
    
    // Get branch IDs for batch lookup
    const branchIds = collectionEmployees
      .filter(emp => emp.branchId)
      .map(emp => emp.branchId);
    
    // Get branch information in a single query
    const branches = await newbranch.find(
      { _id: { $in: branchIds } },
      { _id: 1, name: 1 }
    ).lean();
    
    // Create branch map for quick lookups
    const branchMap = {};
    branches.forEach(branch => {
      if (branch && branch._id) {
        branchMap[branch._id.toString()] = branch.name || "Unknown Branch";
      }
    });
    
    // Process each collection employee to check if they're absent
    for (const emp of collectionEmployees) {
      if (!emp.employeUniqueId) continue;
      
      // Get branch name
      const branchName = (emp.branchId && branchMap[emp.branchId.toString()]) 
                        ? branchMap[emp.branchId.toString()] 
                        : "No Branch Assigned";
      
      const hasVisitToday = visitEmployeeSet.has(emp.employeUniqueId);
      const hasCollectionToday = collectionEmployeeSet.has(emp.employeUniqueId);
      
      const employeeInfo = {
        id: emp._id,
        employeUniqueId: emp.employeUniqueId,
        employeName: emp.employeName || "Unknown Name",
        mobileNo: emp.mobileNo || "",
        email: emp.email || emp.workEmail || "",
        branchName: branchName
      };
      
      if (!hasVisitToday) {
        noVisitEmployees.push(employeeInfo);
      }
      
      if (!hasCollectionToday) {
        noCollectionEmployees.push(employeeInfo);
      }
    }
    
    // Format date strings for response
    const formattedStartDate = queryStartDate.toISOString().split('T')[0];
    const formattedEndDate = queryEndDate.toISOString().split('T')[0];
    
    return success(res, "Absent Collection Employees", {
     
      managerInfo: {
        id: tokenEmployee._id,
        employeUniqueId: tokenEmployee.employeUniqueId || "",
        employeName: tokenEmployee.employeName || "",
        totalCollectionEmployees: collectionEmployees.length
      },
      absentEmployees: {
        noVisit: noVisitEmployees,
        noCollection: noCollectionEmployees
      },
      summary: {
        totalCollectionEmployees: collectionEmployees.length,
        totalNoVisit: noVisitEmployees.length,
        totalNoCollection: noCollectionEmployees.length
      }
    });
  } catch (error) {
    console.error("Error in zeroVisitOrCollection:", error);
    return unknownError(res, error.message);
  }
}



module.exports = {
getAllocationMobileDashboard,
getAllocationGoogleSheet,
getAllocationCase1Case2,
getAllCustomerLatLong,
visitFormAdd,
getVisitDetail,
visitUpdate,
collectionEmiFormAdd,
getEmiCollectionDetail,
getEmiCollection,
emiStatusUpdate ,
emiEmailUpdate,
getCollectionDetailByLD,
getVisitDetailByLD,
empVisitCollectionByLD,
visitCollectionEmployeId,
getLegalNoticeByLD,
collectionGalleryAPi,
newCollectionGalleryAPi,
collectionGalleryManagerAPi,
getVisitDetailsByCustomerId,
getEmployeesNotInVisitOrCollection,
LegalNotice,
collectionEmiOkCreditAdd,
emiEmiOkCreditUpdate,
getAllEmployeesLatLog,
getAllocationDetailsAndSendEmail,
getGoogleEmil,
googleSheetCustomerLatLong,
googleSheetLatLongWithoutPagination,
tableViewData,
googleSheetCustomerSave,
getEmployeesForMap,
getAllGoogleCustomer,
allCustomerDashboard,
piChartDashboardApi,
branchWiseVisitAndCollTable,
managerWiseVisitAndCollTable,
employeeWiseVisitAndCollTable,
customerListNotVisitOrCollection,
reportingDashBoardVisit,
zeroVisitOrCollection,
}

