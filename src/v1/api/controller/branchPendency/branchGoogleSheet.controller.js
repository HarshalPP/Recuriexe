
const {
  serverValidation,
  success,
  notFound,
  badRequest,
  unknownError } = require('../../../../../globalHelper/response.globalHelper.js');
const fs = require('fs');
const path = require('path');
const PDFDocument =  require('pdfkit');
const { validationResult } = require('express-validator');
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
const credentials = require('../../../../../liveSheet.json');
const baseUrl = process.env.BASE_URL;
const axios = require('axios')
const xlsx = require('xlsx');
const moment = require('moment');
const { callbackify } = require('util');
const employeModel = require('../../model/adminMaster/employe.model.js')

function handleAxiosError(error) {
  if (error.response) {
    if (error.response.status === 400) {
      console.error("Bad Request (400): ", error.response.data);
    } else {
      console.error(
        `Error Response (${error.response.status}): `,
        error.response.data
      );
    }
  } else if (error.request) {
    console.error("No Response received: ", error.request);
  } else {
    console.error("Error: ", error.message);
  }
}


async function branchPenencyGoogleSheet(data) {
  // console.log('documentPaths--',data.signKycDocumentDataStr)
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient });

  const spreadsheetId = process.env.EXTERNAL_REPORT_SHEET_KEY_LIVE;
  const sheetName = "BRANCH PENDENCY";

  // Fetch existing sheet data
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A1:EZ`,
  });

  let rows = response.data.values || [];
  let headers = rows.length > 0 ? rows[0] : [];

  // Define headers if sheet is empty
  if (rows.length === 0) {
    headers = [
      "FIN NO", "CUSTOMER NAME", "FATHER NAME", "MOBILE NO", "BRANCH","ASSIGN REMARK","FILE STATUS","SANCTION STATUS", "DISBURSEMENT STATUS",
      "INTIATION DATE", "INTIATED TO", "INTIATED BY", "ELECTRICITY DATE",
      "ELECTRICITY BILL DOC", "SAMAGRA DATE", "SAMAGRA ID DOC",
      "UDYAM DATE", "UDYAM CERTIFICATE DOC", "BANK STATEMENT DATE",
      "BANK STATEMENT DOC", "AGRICULTURE DOC DATE", "AGRICULTURE DOC",
      "MILK INCOME DATE", "MILK INCOME", "SALARY AND OTHER DATE", "SALARY AND OTHER",
      "OTHER BUSINESS DATE", "OTHER BUSINESS", "PROPERTY DATE",
      "PROPERTY DOCUMENT", "APP PDC DATE", "APPLICANT PDC DOC",
      "GTR PDC DATE", "GUARANTOR PDC DOC", "ESIGN PHOTO DATE",
      "ESIGN PHOTO", "NACH REGIS DATE", "NACH REGISTRATION SS",
      "PHYSICAL FILE DATE", "PHYSICAL FILE COURIER",
      "RM PAYMENT DATE", "RM PAYMENT UPDATION",
      "SIGN KYC DATE","SIGN KYC",
      "OTHER DOCUMENT DATE","OTHER DOCUMENT","INCOME DETAIL DATE","INCOME DOCUMENT"
    ];
    rows.push(headers);
  }

  const finNoIndex = headers.indexOf('FIN NO');
  if (finNoIndex === -1) {
    throw new Error('FIN NO field not found in the sheet.');
  }

  const existingRowIndex = rows.slice(1).findIndex(row => row[finNoIndex] === data.customerFinIdStr);

  // Get the keys that actually exist in the incoming data
  const transformUrls = (urls) => {
    if (!urls) return '';
    return Array.isArray(urls) 
      ? urls.map(url => `${process.env.BASE_URL}${url}`).join(', ') 
      : `${process.env.BASE_URL}${urls}`;
  };



     data.propertyPapersKycDocumentData = transformUrls(data.propertyPapersKycDocumentData);
     data.nachRegistrationKycDocumentData = transformUrls(data.nachRegistrationKycDocumentData);
     data.esignPhotoDocumentData = transformUrls(data.esignPhotoDocumentData);
     data.applicantPdcDocumentData = transformUrls(data.applicantPdcDocumentData);
     data.guarantorPdcDocumentData = transformUrls(data.guarantorPdcDocumentData);
     data.otherBusinessDocumentData = transformUrls(data.otherBusinessDocumentData);
     data.otherIncomeDocumentData = transformUrls(data.otherIncomeDocumentData);
     data.milkDocumentData = transformUrls(data.milkDocumentData);
     data.agricultureDocumentData = transformUrls(data.agricultureDocumentData);
     data.bankStatementDocumentData = transformUrls(data.bankStatementDocumentData);
     data.electricityKycDocumentData = transformUrls(data.electricityKycDocumentData);
     data.samagraIdDocumentData = transformUrls(data.samagraIdDocumentData);
     data.udhyamKycDocumentData = transformUrls(data.udhyamKycDocumentData);
     data.signKycDocumentDataStr =  transformUrls(data.signKycDocumentDataStr);
     data.otherDocumentDataStr =  transformUrls(data.otherDocumentDataStr);
     data.incomeDetailDocumentData =  transformUrls(data.incomeDetailDocumentData);
  

  // console.log('pdfDta----',pdfDta)
  const dataKeys = Object.keys(data);

  // Mapping of headers to data keys
  const dataMappings = {
    "CUSTOMER NAME": "applicantFullNameStr",
    "FATHER NAME": "applicantFatherNameStr",
    "MOBILE NO": "applicantMobileNoStr",
    "BRANCH": "customerBranchNmaeStr",
    "ASSIGN REMARK":"remarkForBranchData",
    "FILE STATUS":"remarkBranchStatusData",
    "SANCTION STATUS": "sanctionFormsStatusStr",
    "DISBURSEMENT STATUS": "disbursementFormsStatusStr",
    "INTIATION DATE": "branchAssignDateData",
    "INTIATED TO": "branchPendencyNameStr",
    "INTIATED BY": "externalManagerNameStr",
    "ELECTRICITY DATE": "electricityCompleteDate",
    "ELECTRICITY BILL DOC": "electricityKycDocumentData",
    "SAMAGRA DATE": "samagraCompleteDate",
    "SAMAGRA ID DOC": "samagraIdDocumentData",
    "UDYAM DATE": "udhyamCompleteDate",
    "UDYAM CERTIFICATE DOC": "udhyamKycDocumentData",
    "BANK STATEMENT DATE": "bankCompleteDate",
    "BANK STATEMENT DOC": "bankStatementDocumentData",
    "AGRICULTURE DOC DATE": "incomeDoc1",
    "AGRICULTURE DOC": "agricultureDocumentData",
    "MILK INCOME DATE": "incomeCompleteDate2",
    "MILK INCOME": "milkDocumentData",
    "SALARY AND OTHER DATE": "incomeCompleteDate3",
    "SALARY AND OTHER": "otherIncomeDocumentData",
    "OTHER BUSINESS DATE": "otherBusinessDate",
    "OTHER BUSINESS": "otherBusinessDocumentData",
    "PROPERTY DATE": "propertyCompleteDate",
    "PROPERTY DOCUMENT": "propertyPapersKycDocumentData",
    "APP PDC DATE": "appPdcCompleteDate",
    "APPLICANT PDC DOC": "applicantPdcDocumentData",
    "GTR PDC DATE": "gtrCompleteDate",
    "GUARANTOR PDC DOC": "guarantorPdcDocumentData",
    "ESIGN PHOTO DATE": "esignPhotoCompleteDate",
    "ESIGN PHOTO": "esignPhotoDocumentData",
    "NACH REGIS DATE": "nachRegisCompleteDate",
    "NACH REGISTRATION SS": "nachRegistrationKycDocumentData",
    "PHYSICAL FILE DATE": "physicalFileCompleteDate",
    "PHYSICAL FILE COURIER": "physicalFileCourierDocumentData",
    "RM PAYMENT DATE": "rmPaymentDate",
    "RM PAYMENT UPDATION": "rmPaymentDocumentData",
    "SIGN KYC DATE": "signKycCompleteDate",
    "SIGN KYC": "signKycDocumentDataStr",
    "OTHER DOCUMENT DATE": "otherDocumentCompleteDate",
    "OTHER DOCUMENT": "otherDocumentDataStr",
    "INCOME DETAIL DATE": "incomeDetailCompleteDate",
    "INCOME DOCUMENT": "incomeDetailDocumentData",
  };

  // Create a map of which columns need to be updated based on the incoming data
  const columnsToUpdate = {};
  headers.forEach((header, index) => {
    const mappedKey = dataMappings[header];
    if (mappedKey && dataKeys.includes(mappedKey)) {
      columnsToUpdate[index] = mappedKey;
    }
  });

  if (existingRowIndex !== -1) {
    // Update only the columns that have corresponding data in the API response
    Object.entries(columnsToUpdate).forEach(([columnIndex, dataKey]) => {
      let value = data[dataKey];
      value = Array.isArray(value) ? value[value.length - 1] || '' : value || '';
      if (value !== undefined && value !== null && value !== '') {
        rows[existingRowIndex + 1][columnIndex] = value; // Update only if value exists
      }
    });
  } else {
    // If the FIN NO does not exist, create a new row with only the provided data
    let newRow = Array(headers.length).fill('');
    newRow[finNoIndex] = data.customerFinIdStr;
  
    // Fill only the columns that have corresponding data
    Object.entries(columnsToUpdate).forEach(([columnIndex, dataKey]) => {
      let value = data[dataKey];
      value = Array.isArray(value) ? value[value.length - 1] || '' : value || '';
      if (value !== undefined && value !== null && value !== '') {
        newRow[columnIndex] = value;
      }
    });
    rows.push(newRow);
  }
  

  // Write data back to Google Sheets
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: 'RAW',
    resource: {
      values: rows,
    },
  });

  console.log('Data saved to Google Sheets successfully');
}



// async function branchPenencyGoogleSheet(data) {
//   const auth = new google.auth.GoogleAuth({
//     credentials,
//     scopes: ['https://www.googleapis.com/auth/spreadsheets'],
//   });

//   const authClient = await auth.getClient();
//   const sheets = google.sheets({ version: 'v4', auth: authClient });

//   const spreadsheetId = process.env.EXTERNAL_REPORT_SHEET_KEY_LIVE;
//   const sheetName = "BRANCH PENDENCY";

//   // Fetch existing sheet data
//   const response = await sheets.spreadsheets.values.get({
//     spreadsheetId,
//     range: `${sheetName}!A1:EZ`,
//   });

//   let rows = response.data.values || [];
//   let headers = rows.length > 0 ? rows[0] : [];

//   // Define headers if the sheet is empty
//   if (rows.length === 0) {
//     headers = [
//       "FIN NO", "CUSTOMER NAME", "FATHER NAME", "MOBILE NO", "BRANCH", "ASSIGN REMARK", "FILE STATUS", "SANCTION STATUS", "DISBURSEMENT STATUS",
//       "INTIATION DATE", "INTIATED TO", "INTIATED BY", "ELECTRICITY DATE", "ELECTRICITY BILL DOC",
//       "SAMAGRA DATE", "SAMAGRA ID DOC", "UDYAM DATE", "UDYAM CERTIFICATE DOC", "BANK STATEMENT DATE", "BANK STATEMENT DOC",
//       "AGRICULTURE DOC DATE", "AGRICULTURE DOC", "MILK INCOME DATE", "MILK INCOME", "SALARY AND OTHER DATE", "SALARY AND OTHER",
//       "OTHER BUSINESS DATE", "OTHER BUSINESS", "PROPERTY DATE", "PROPERTY DOCUMENT",
//       "APP PDC DATE", "APPLICANT PDC DOC", "GTR PDC DATE", "GUARANTOR PDC DOC",
//       "ESIGN PHOTO DATE", "ESIGN PHOTO", "NACH REGIS DATE", "NACH REGISTRATION SS",
//       "PHYSICAL FILE DATE", "PHYSICAL FILE COURIER", "RM PAYMENT DATE", "RM PAYMENT UPDATION",
//       "SIGN KYC DATE", "SIGN KYC"
//     ];
//     rows.push(headers);
//   }

//   const finNoIndex = headers.indexOf('FIN NO');
//   if (finNoIndex === -1) {
//     throw new Error('FIN NO field not found in the sheet.');
//   }

//   const existingRowIndex = rows.slice(1).findIndex(row => row[finNoIndex] === data.customerFinIdStr);

//   // Transform URLs into absolute paths
//   const transformUrls = (urls) => {
//     if (!urls) return '';
//     return Array.isArray(urls) ? `${process.env.BASE_URL}${urls[urls.length - 1]}` : `${process.env.BASE_URL}${urls}`;
//   };

//   // Set the final values for document-related fields (only the most recent URLs)
//   const documentFields = {
//     electricityKycDocumentData: transformUrls(data.electricityKycDocumentData),
//     samagraIdDocumentData: transformUrls(data.samagraIdDocumentData),
//     udhyamKycDocumentData: transformUrls(data.udhyamKycDocumentData),
//     bankStatementDocumentData: transformUrls(data.bankStatementDocumentData),
//     agricultureDocumentData: transformUrls(data.agricultureDocumentData),
//     milkDocumentData: transformUrls(data.milkDocumentData),
//     otherIncomeDocumentData: transformUrls(data.otherIncomeDocumentData),
//     otherBusinessDocumentData: transformUrls(data.otherBusinessDocumentData),
//     propertyPapersKycDocumentData: transformUrls(data.propertyPapersKycDocumentData),
//     applicantPdcDocumentData: transformUrls(data.applicantPdcDocumentData),
//     guarantorPdcDocumentData: transformUrls(data.guarantorPdcDocumentData),
//     esignPhotoDocumentData: transformUrls(data.esignPhotoDocumentData),
//     nachRegistrationKycDocumentData: transformUrls(data.nachRegistrationKycDocumentData),
//     signKycDocumentDataStr: transformUrls(data.signKycDocumentDataStr),
//   };

//   const dataKeys = Object.keys(documentFields);

//   // Mapping of headers to data keys
//   const dataMappings = {
//          "CUSTOMER NAME": "applicantFullNameStr",
//         "FATHER NAME": "applicantFatherNameStr",
//         "MOBILE NO": "applicantMobileNoStr",
//         "BRANCH": "customerBranchNmaeStr",
//         "ASSIGN REMARK":"remarkForBranchData",
//         "FILE STATUS":"remarkBranchStatusData",
//         "SANCTION STATUS": "sanctionFormsStatusStr",
//         "DISBURSEMENT STATUS": "disbursementFormsStatusStr",
//         "INTIATION DATE": "branchAssignDateData",
//         "INTIATED TO": "branchPendencyNameStr",
//         "INTIATED BY": "externalManagerNameStr",
//         "ELECTRICITY DATE": "electricityCompleteDate",
//         "ELECTRICITY BILL DOC": "electricityKycDocumentData",
//         "SAMAGRA DATE": "samagraCompleteDate",
//         "SAMAGRA ID DOC": "samagraIdDocumentData",
//         "UDYAM DATE": "udhyamCompleteDate",
//         "UDYAM CERTIFICATE DOC": "udhyamKycDocumentData",
//         "BANK STATEMENT DATE": "bankCompleteDate",
//         "BANK STATEMENT DOC": "bankStatementDocumentData",
//         "AGRICULTURE DOC DATE": "incomeDoc1",
//         "AGRICULTURE DOC": "agricultureDocumentData",
//         "MILK INCOME DATE": "incomeCompleteDate2",
//         "MILK INCOME": "milkDocumentData",
//         "SALARY AND OTHER DATE": "incomeCompleteDate3",
//         "SALARY AND OTHER": "otherIncomeDocumentData",
//         "OTHER BUSINESS DATE": "otherBusinessDate",
//         "OTHER BUSINESS": "otherBusinessDocumentData",
//         "PROPERTY DATE": "propertyCompleteDate",
//         "PROPERTY DOCUMENT": "propertyPapersKycDocumentData",
//         "APP PDC DATE": "appPdcCompleteDate",
//         "APPLICANT PDC DOC": "applicantPdcDocumentData",
//         "GTR PDC DATE": "gtrCompleteDate",
//         "GUARANTOR PDC DOC": "guarantorPdcDocumentData",
//         "ESIGN PHOTO DATE": "esignPhotoCompleteDate",
//         "ESIGN PHOTO": "esignPhotoDocumentData",
//         "NACH REGIS DATE": "nachRegisCompleteDate",
//         "NACH REGISTRATION SS": "nachRegistrationKycDocumentData",
//         "PHYSICAL FILE DATE": "physicalFileCompleteDate",
//         "PHYSICAL FILE COURIER": "physicalFileCourierDocumentData",
//         "RM PAYMENT DATE": "rmPaymentDate",
//         "RM PAYMENT UPDATION": "rmPaymentDocumentData",
    
//         "SIGN KYC DATE": "signKycCompleteDate",
//         "SIGN KYC": "signKycDocumentDataStr",
    
//         "OTHER DOCUMENT DATE": "otherDocumentDate",
//         "OTHER DOCUMENT": "otherDocumentData",
    
//         "ENACH LINK DATE": "enachLinkCompleteDate",
//         "ENACH LINK (LINK SHOW)": "enachLinkShow",
//   };

//   // Identify which columns need to be updated
//   const columnsToUpdate = {};
//   headers.forEach((header, index) => {
//     const mappedKey = dataMappings[header];
//     if (mappedKey && dataKeys.includes(mappedKey)) {
//       columnsToUpdate[index] = mappedKey;
//     }
//   });

//   if (existingRowIndex !== -1) {
//     // Update existing row
//     Object.entries(columnsToUpdate).forEach(([columnIndex, dataKey]) => {
//       const value = documentFields[dataKey] || '';
//       rows[existingRowIndex + 1][columnIndex] = value;
//     });
//   } else {
//     // Add a new row
//     let newRow = Array(headers.length).fill('');
//     newRow[finNoIndex] = data.customerFinIdStr;

//     Object.entries(columnsToUpdate).forEach(([columnIndex, dataKey]) => {
//       const value = documentFields[dataKey] || '';
//       newRow[columnIndex] = value;
//     });

//     rows.push(newRow);
//   }

//   // Write the updated rows back to Google Sheets
//   await sheets.spreadsheets.values.update({
//     spreadsheetId,
//     range: `${sheetName}!A1`,
//     valueInputOption: 'RAW',
//     resource: {
//       values: rows,
//     },
//   });

//   console.log('Data saved to Google Sheets successfully');
// }
 





module.exports = {
  branchPenencyGoogleSheet
}