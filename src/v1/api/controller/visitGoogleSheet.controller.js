const credentials = require('../../../../credential.json');
const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
const { validationResult } = require("express-validator");
const { badRequest,notFound ,success,unknownError,serverValidation} = require('../../../../globalHelper/response.globalHelper');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { ExceededMaxLengthError } = require('pdf-lib');
const employeModel = require("../model/adminMaster/employe.model")

function handleAxiosError(error) {
  if (error.response) {
    if (error.response.status === 400) {
      console.error('Bad Request (400): ', error.response.data);
    } else {
      console.error(`Error Response (${error.response.status}): `, error.response.data);
    }
  } else if (error.request) {
    console.error('No Response received: ', error.request);
  } else {
    console.error('Error: ', error.message);
  }
}

const collectionHeaders = [
  'LD', 'CUSTOMER NAME',
  'COLLECTED BY-1', 'CUSTOMER EMAIL-1', 'EMI RECEIVED DATE-1',  'RECEIVED AMOUNT-1', 'MODE OF COLLECTION-1', 'bankName-1', 'OK CREDIT IN-1', 'TRANSACTION ID-1', 'TRANSACTION IMAGE-1', 'REMARK BY COLLECTION-1',
  'COLLECTED BY-2', 'CUSTOMER EMAIL-2', 'EMI RECEIVED DATE-2',  'RECEIVED AMOUNT-2', 'MODE OF COLLECTION-2', 'bankName-2', 'OK CREDIT IN-2', 'TRANSACTION ID-2', 'TRANSACTION IMAGE-2', 'REMARK BY COLLECTION-2',
  'COLLECTED BY-3', 'CUSTOMER EMAIL-3', 'EMI RECEIVED DATE-3',  'RECEIVED AMOUNT-3', 'MODE OF COLLECTION-3', 'bankName-3', 'OK CREDIT IN-3', 'TRANSACTION ID-3', 'TRANSACTION IMAGE-3', 'REMARK BY COLLECTION-3',
  'COLLECTED BY-4', 'CUSTOMER EMAIL-4', 'EMI RECEIVED DATE-4',  'RECEIVED AMOUNT-4', 'MODE OF COLLECTION-4', 'bankName-4', 'OK CREDIT IN-4', 'TRANSACTION ID-4', 'TRANSACTION IMAGE-4', 'REMARK BY COLLECTION-4',
  'COLLECTED BY-5', 'CUSTOMER EMAIL-5', 'EMI RECEIVED DATE-5',  'RECEIVED AMOUNT-5', 'MODE OF COLLECTION-5', 'bankName-5', 'OK CREDIT IN-5', 'TRANSACTION ID-5', 'TRANSACTION IMAGE-5', 'REMARK BY COLLECTION-5',
  'COLLECTED BY-6', 'CUSTOMER EMAIL-6', 'EMI RECEIVED DATE-6',  'RECEIVED AMOUNT-6', 'MODE OF COLLECTION-6', 'bankName-6', 'OK CREDIT IN-6', 'TRANSACTION ID-6', 'TRANSACTION IMAGE-6', 'REMARK BY COLLECTION-6',
  'COLLECTED BY-7', 'CUSTOMER EMAIL-7', 'EMI RECEIVED DATE-7',  'RECEIVED AMOUNT-7', 'MODE OF COLLECTION-7', 'bankName-7', 'OK CREDIT IN-7', 'TRANSACTION ID-7', 'TRANSACTION IMAGE-7', 'REMARK BY COLLECTION-7',
  'COLLECTED BY-8', 'CUSTOMER EMAIL-8', 'EMI RECEIVED DATE-8',  'RECEIVED AMOUNT-8', 'MODE OF COLLECTION-8', 'bankName-8', 'OK CREDIT IN-8', 'TRANSACTION ID-8', 'TRANSACTION IMAGE-8', 'REMARK BY COLLECTION-8',
  'COLLECTED BY-9', 'CUSTOMER EMAIL-9', 'EMI RECEIVED DATE-9',  'RECEIVED AMOUNT-9', 'MODE OF COLLECTION-9', 'bankName-9', 'OK CREDIT IN-9', 'TRANSACTION ID-9', 'TRANSACTION IMAGE-9', 'REMARK BY COLLECTION-9',
  'COLLECTED BY-10', 'CUSTOMER EMAIL-10','EMI RECEIVED DATE-10','RECEIVED AMOUNT-10','MODE OF COLLECTION-10','bankName-10','OK CREDIT IN-10', 'TRANSACTION ID-10', 'TRANSACTION IMAGE-10', 'REMARK BY COLLECTION10'
];

let collectionHeadersWritten = false;

async function appendHeadersIfNeeded(sheets, spreadsheetId, sheetName, headers, headersWritten) {
  if (!headersWritten) {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:A1`,
    });

    if (!response.data.values || response.data.values.length === 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        resource: { values: [headers] },
      });
    }

    headersWritten = true;
  }
  return headersWritten;
}

async function updateOrAppendToSheet(sheets, spreadsheetId, sheetName, values) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}`,
    });

    const rows = response.data.values || [];
    const ldIndex = collectionHeaders.indexOf('LD');
    let rowIndex = -1;
    let nextAvailableIndex = 1;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i][ldIndex] == values[0][0]) {
        rowIndex = i + 1; // 1-based index
        for (let j = 2; j < collectionHeaders.length; j += 10) {
          if (!rows[i][j]) {
            nextAvailableIndex = j;
            break;
          }
        }
        break;
      }
    }

    const updatedValues = values[0].slice(2); // Skip LD, COLLECTED BY, CUSTOMER EMAIL

    if (rowIndex > -1) {
      // Update the existing row with the new EMI details
      for (let i = 0; i < updatedValues.length; i++) {
        rows[rowIndex - 1][nextAvailableIndex + i] = updatedValues[i];
      }

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A${rowIndex}:ZZ${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [rows[rowIndex - 1]] },
      });
    } else {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:A`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: { values },
      });
    }
  } catch (error) {
    console.error(error);
  }
}

async function collectionGoogleSheet(data,mode,bankName,okCreditIn) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    collectionHeadersWritten = await appendHeadersIfNeeded(sheets, process.env.VISIT_GOOGLE_SHEET_KEY, process.env.EMI_COLLECT_DETAILS_SHEET, collectionHeaders, collectionHeadersWritten);

    const transactionImage = Array.isArray(data.transactionImage) ? data.transactionImage.join(', ') : data.transactionImage;
    const baseUrl = process.env.BASE_URL;

    const values = [
      [
        data.LD,
        data.customerName,
        data.collectedBy,
        data.customerEmail,
        data.emiReceivedDate,
        data.receivedAmount,
        mode,
        bankName,
        okCreditIn,
        data.transactionId,
        baseUrl + transactionImage,
        data.remarkByCollection
      ]
    ];

    await updateOrAppendToSheet(sheets, process.env.VISIT_GOOGLE_SHEET_KEY, process.env.EMI_COLLECT_DETAILS_SHEET, values);
  } catch (error) {
    console.error(error);
  }
}


// ------------------ Approval Emi Amount Sheet----------------------------------

const approvalHeaders = ['LD', 'APPROVED BY', 'RECEIVED AMOUNT','DATE'];
const emiRejectHeaders = ['LD',	'CUSTOMER NAME','COLLECTED BY',	'CUSTOMER EMAIL',
  	                      'EMI RECEIVED DATE',	'RECEIVED AMOUNT',	'MODE OF COLLECTION',
                          'bankName',	'OK CREDIT IN',	'TRANSACTION ID',	'TRANSACTION IMAGE',
                          'REMARK BY COLLECTION' , 'REMARK BY MANAGER']


let approvalHeadersWritten = false;
let emiRejectHeadersWritten = false;

async function appendHeadersIfNeeded(sheets, spreadsheetId, sheetName, headers, headersWritten) {
      if (!headersWritten) {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `${sheetName}!A1:A1`,
        });
    
        if (!response.data.values || response.data.values.length === 0) {
          await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${sheetName}!A1`,
            valueInputOption: 'RAW',
            resource: { values: [headers] },
          });
        }
    
        headersWritten = true;
      }
      return headersWritten;
    }
    
    async function appendToSheet(sheets, spreadsheetId, sheetName, values) {
      const resource = { values };
    
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:A`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource,
      });
    }
    
    async function approvalGoogleSheet(data,name) {
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
    
      const authClient = await auth.getClient();
      const sheets = google.sheets({ version: 'v4', auth: authClient });
    
      approvalHeadersWritten = await appendHeadersIfNeeded(sheets, process.env.VISIT_GOOGLE_SHEET_KEY, process.env.APPROVAL_SHEET, approvalHeaders, approvalHeadersWritten);
     
      const values = [
        [
             data.LD,
             name,
             data.receivedAmount,
             data.emiReceivedDate   
        ],
      ];
    
      await appendToSheet(sheets, process.env.VISIT_GOOGLE_SHEET_KEY, process.env.APPROVAL_SHEET, values);
    }

    async function emiRejectGoogleSheet(data ,mode, bankName, okCreditIn) {
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
    
      const authClient = await auth.getClient();
      const sheets = google.sheets({ version: 'v4', auth: authClient });
    
      emiRejectHeadersWritten = await appendHeadersIfNeeded(sheets, process.env.VISIT_GOOGLE_SHEET_KEY, process.env.EMI_REJECTED_SHEET, emiRejectHeaders, emiRejectHeadersWritten);
      const values = [
        [
             data.LD,
             data.customerName,
             data.collectedBy,
             data.customerEmail,   
             data.emiReceivedDate,
             data.receivedAmount,
             mode,  
             bankName,
             okCreditIn,
             data.transactionId,
             data.transactionImage,
             data.remarkByCollection,
             data.remarkByManager,

        ],
      ];
    
      await appendToSheet(sheets, process.env.VISIT_GOOGLE_SHEET_KEY, process.env.EMI_REJECTED_SHEET, values);
    }

  module.exports = {
    collectionGoogleSheet,
    approvalGoogleSheet,
    emiRejectGoogleSheet
  };