
const {
    serverValidation,
    success,
    notFound,
    badRequest,
    unknownError } = require('../../../../../globalHelper/response.globalHelper.js');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
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
// -------------------FILE PROCESS ALLOCATION LIST-----------------------------------
async function applicantKycSheet(data) {
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const spreadsheetId = process.env.FINAL_APPROVAL_SHEET;
    const sheetName = process.env.ALL_KYC_FORM;

    console.time("Google Sheet Update");

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:BH`,
    });

    console.timeEnd("Google Sheet Update");

    let rows = response.data.values || [];
    let headers = rows.length > 0 ? rows[0] : [];

    // Define headers if the sheet is empty
    if (rows.length === 0) {
        headers = [
            'LD', 'CUSTOMER NAME',
            'APPLICANT FULL NAME AADHAAR', 'AADHAAR NO', 'FATHER NAME AADHAR', 'DOB AADHAAR',
            'GENDER', 'AGE', 'ADDRESS AS PER AADHAAR', 'APPLICANT FULL NAME PANCARD',
            'PAN CARD NO', 'FATHER NAME PANCARD', 'DOB PANCARD', 'APP FULL NAME VOTER ID',
            'VOTERID NO',
        ];
        rows.push(headers);
    }

    const ldIndex = headers.indexOf('LD');
    if (ldIndex === -1) throw new Error('LD field not found in the sheet.');

    const existingRowIndex = rows.slice(1).findIndex(row => row[ldIndex] === data.LD);
    const dataMappings = {
        'LD': 'LD',
        'CUSTOMER NAME': 'customerName',
        'APPLICANT FULL NAME AADHAAR': 'fullNameAadhaar',
        'AADHAAR NO': 'aadharNo',
        'FATHER NAME AADHAR': 'fatherNameAadhaar',
        'DOB AADHAAR': 'dateOfBirthAadhar',
        'GENDER': 'gender',
        'AGE': 'age',
        'ADDRESS AS PER AADHAAR': 'addressAsPerAadhar',
        'APPLICANT FULL NAME PANCARD': 'fullNamePanCard',
        'PAN CARD NO': 'panCardNo',
        'FATHER NAME PANCARD': 'fatherNamePanCard',
        'DOB PANCARD': 'dateOfBirthPan',
        'APP FULL NAME VOTER ID': 'appFullNameAsPerVoterId',
        'VOTERID NO': 'voterIdNo',
    };

    let rowToUpdate;
    if (existingRowIndex === -1) {
        // New row, initialize with empty values
        rowToUpdate = Array(headers.length).fill('');
    } else {
        // Use the existing row as a base to update
        rowToUpdate = rows[existingRowIndex + 1];
    }

    // Update only the relevant columns with the new data
    headers.forEach((header, index) => {
        if (dataMappings[header] && data[dataMappings[header]] !== undefined) {
            rowToUpdate[index] = data[dataMappings[header]];
        }
    });

    if (existingRowIndex === -1) {
        rows.push(rowToUpdate); // Insert new row
    } else {
        rows[existingRowIndex + 1] = rowToUpdate; // Update existing row
    }

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        resource: { values: rows },
    });

    console.log('Data saved to Google Sheets successfully');
}

async function coApplicantKycSheet(data) {
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const spreadsheetId = process.env.FINAL_APPROVAL_SHEET;
    const sheetName = process.env.ALL_KYC_FORM;

    console.time("Google Sheet Update");

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:BH`,
    });

    console.timeEnd("Google Sheet Update");

    let rows = response.data.values || [];
    let headers = rows.length > 0 ? rows[0] : [];

    if (rows.length === 0) {
        headers = [
            'LD', 'CUSTOMER NAME',
            'COAPP-1 FULL NAME AADHAAR', 'COAPP-1 AADHAAR NO', 'COAPP-1 FATHER NAME AADHAR',
            'COAPP-1 DOB AADHAAR', 'COAPP-1 GENDER', 'COAPP-1 AGE', 'COAPP-1 ADDRESS AS PER AADHAAR',
            'COAPP-1 FULL NAME PANCARD', 'COAPP-1 PAN CARD NO', 'COAPP-1 FATHER NAME PANCARD',
            'COAPP-1 DOB PANCARD', 'COAPP-1 FULL NAME VOTER ID', 'COAPP-1 VOTERID NO',
            'COAPP-2 FULL NAME AADHAAR', 'COAPP-2 AADHAAR NO', 'COAPP-2 FATHER NAME AADHAR',
            'COAPP-2 DOB AADHAAR', 'COAPP-2 GENDER', 'COAPP-2 AGE', 'COAPP-2 ADDRESS AS PER AADHAAR',
            'COAPP-2 FULL NAME PANCARD', 'COAPP-2 PAN CARD NO', 'COAPP-2 FATHER NAME PANCARD',
            'COAPP-2 DOB PANCARD', 'COAPP-2 FULL NAME VOTER ID', 'COAPP-2 VOTERID NO',
        ];
        rows.push(headers);
    }

    const ldIndex = headers.indexOf('LD');
    if (ldIndex === -1) throw new Error('LD field not found in the sheet.');

    const existingRowIndex = rows.slice(1).findIndex(row => row[ldIndex] === data.LD);

    let coAppPrefix = data.coApplicantNo === 1 ? 'COAPP-1' : data.coApplicantNo === 2 ? 'COAPP-2' : null;
    if (!coAppPrefix) throw new Error('Invalid coApplicant value. It must be 1 or 2.');

    const dataMappings = {
        'LD': 'LD',
        'CUSTOMER NAME': 'customerName',
        [`${coAppPrefix} FULL NAME AADHAAR`]: 'fullNameAadhaar',
        [`${coAppPrefix} AADHAAR NO`]: 'aadharNo',
        [`${coAppPrefix} FATHER NAME AADHAR`]: 'fatherNameAadhaar',
        [`${coAppPrefix} DOB AADHAAR`]: 'dateOfBirthAadhar',
        [`${coAppPrefix} GENDER`]: 'gender',
        [`${coAppPrefix} AGE`]: 'age',
        [`${coAppPrefix} ADDRESS AS PER AADHAAR`]: 'addressAsPerAadhar',
        [`${coAppPrefix} FULL NAME PANCARD`]: 'fullNamePanCard',
        [`${coAppPrefix} PAN CARD NO`]: 'panCardNo',
        [`${coAppPrefix} FATHER NAME PANCARD`]: 'fatherNamePanCard',
        [`${coAppPrefix} DOB PANCARD`]: 'dateOfBirthPan',
        [`${coAppPrefix} FULL NAME VOTER ID`]: 'coAppFullNameAsPerVoterId',
        [`${coAppPrefix} VOTERID NO`]: 'voterIdNo',
    };

    let rowToUpdate = existingRowIndex !== -1 
        ? rows[existingRowIndex + 1] 
        : Array(headers.length).fill('');

    headers.forEach((header, index) => {
        if (dataMappings[header] && data[dataMappings[header]] !== undefined) {
            rowToUpdate[index] = data[dataMappings[header]];
        }
    });

    if (existingRowIndex === -1) {
        // Insert new row
        rows.push(rowToUpdate);
    } else {
        // Update existing row
        rows[existingRowIndex + 1] = rowToUpdate;
    }

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        resource: { values: rows },
    });

    console.log('Data saved to Google Sheets successfully');
}

async function gtrKycSheet(data) {
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const spreadsheetId = process.env.FINAL_APPROVAL_SHEET;
    const sheetName = process.env.ALL_KYC_FORM;

    console.time("Google Sheet Update");

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:BH`,
    });

    console.timeEnd("Google Sheet Update");

    let rows = response.data.values || [];
    let headers = rows.length > 0 ? rows[0] : [];

    // Define headers if the sheet is empty
    if (rows.length === 0) {
        headers = [
            'LD', 'CUSTOMER NAME', 'GTR FULL NAME AADHAAR', 'GTR AADHAAR NO',
            'GTR FATHER NAME AADHAR', 'GTR DOB AADHAAR', 'GTR GENDER', 'GTR AGE',
            'GTR ADDRESS AS PER AADHAAR', 'GTR FULL NAME PANCARD', 'GTR PAN CARD NO',
            'GTR FATHER NAME PANCARD', 'GTR DOB PANCARD', 'GTR FULL NAME VOTER ID',
            'GTR VOTERID NO',
        ];
        rows.push(headers);
    }

    const ldIndex = headers.indexOf('LD');
    if (ldIndex === -1) throw new Error('LD field not found in the sheet.');

    const existingRowIndex = rows.slice(1).findIndex(row => row[ldIndex] === data.LD);

    const dataMappings = {
        'LD': 'LD',
        'CUSTOMER NAME': 'customerName',
        'GTR FULL NAME AADHAAR': 'fullNameAadhaar',
        'GTR AADHAAR NO': 'aadharNo',
        'GTR FATHER NAME AADHAR': 'fatherNameAadhaar',
        'GTR DOB AADHAAR': 'dateOfBirthAadhar',
        'GTR GENDER': 'gender',
        'GTR AGE': 'age',
        'GTR ADDRESS AS PER AADHAAR': 'addressAsPerAadhar',
        'GTR FULL NAME PANCARD': 'fullNamePanCard',
        'GTR PAN CARD NO': 'panCardNo',
        'GTR FATHER NAME PANCARD': 'fatherNamePanCard',
        'GTR DOB PANCARD': 'dateOfBirthPan',
        'GTR FULL NAME VOTER ID': 'gtrFullNameAsPerVoterId',
        'GTR VOTERID NO': 'voterIdNo',
    };

    let rowToUpdate;
    if (existingRowIndex === -1) {
        // Initialize a new row with empty values if it doesn't exist
        rowToUpdate = Array(headers.length).fill('');
    } else {
        // Use the existing row as a base for updates
        rowToUpdate = rows[existingRowIndex + 1];
    }

    // Update only the relevant columns with provided data
    headers.forEach((header, index) => {
        if (dataMappings[header] && data[dataMappings[header]] !== undefined) {
            rowToUpdate[index] = data[dataMappings[header]];
        }
    });

    if (existingRowIndex === -1) {
        rows.push(rowToUpdate); // Insert new row
    } else {
        rows[existingRowIndex + 1] = rowToUpdate; // Update existing row
    }

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        resource: { values: rows },
    });

    console.log('Data saved to Google Sheets successfully');
}


async function electricityBillSheet(data) {
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const spreadsheetId = process.env.FINAL_APPROVAL_SHEET;
    const sheetName = process.env.ELECTRICITY_KYC_FORM;

    console.time("Google Sheet Update");

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:BH`,
    });

    console.timeEnd("Google Sheet Update");

    let rows = response.data.values || [];
    let headers = rows.length > 0 ? rows[0] : [];

    // Define headers if the sheet is empty
    if (rows.length === 0) {
        headers = [ 'LD', 'CUSTOMER NAME', 'IVRS NUMBER' , 'CONSUMER NAME' , 'BILL DATE' ];
        rows.push(headers);
    }

    const ldIndex = headers.indexOf('LD');

    if (ldIndex === -1) {
        throw new Error('LD field not found in the sheet.');
    }

    const existingRowIndex = rows.slice(1).findIndex(row => row[ldIndex] === data.LD);

    const dataMappings = {
        'LD': 'LD',
        'CUSTOMER NAME': 'customerName',
        'IVRS NUMBER': 'ivrsNo',
    	'CONSUMER NAME': 'cusumerName',	
        'BILL DATE': 'billDate',
    	
    };

    let rowToUpdate = Array(headers.length).fill('');

    headers.forEach((header, index) => {
        if (dataMappings[header]) {
            let value = data[dataMappings[header]] || '';
            rowToUpdate[index] = value;
        }
    });

    if (existingRowIndex === -1) {
        // Insert new row
        // console.log(`Inserting new row for LD: ${data.LD}`);
        rows.push(rowToUpdate);
    } else {
        // Update existing row
        // console.log(`Updating existing row for LD: ${data.LD}`);
        rows[existingRowIndex + 1] = rowToUpdate;
    }

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

async function samagraIdKycSheet(data) {
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const spreadsheetId = process.env.FINAL_APPROVAL_SHEET;
    const sheetName = process.env.SAMAGRAID_KYC_FORM;

    console.time("Google Sheet Update");

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:BH`,
    });

    console.timeEnd("Google Sheet Update");

    let rows = response.data.values || [];
    let headers = rows.length > 0 ? rows[0] : [];

    // Define headers if the sheet is empty
    if (rows.length === 0) {
        headers = [ 'LD', 'CUSTOMER NAME',
            "SAMAGRA FAMILY ID" ,	"NAME OF FAMILY HEAD" ,
            "MEMBER SAMAGRA ID-1", "MEMBER NAME-1", "MEMBER RELATION WITH APPLICANT-1", "MEMBER AGE-1", "MEMBER GENDER-1",
            "MEMBER SAMAGRA ID-2", "MEMBER NAME-2", "MEMBER RELATION WITH APPLICANT-2", "MEMBER AGE-2", "MEMBER GENDER-2",
             "MEMBER SAMAGRA ID-3", "MEMBER NAME-3", "MEMBER RELATION WITH APPLICANT-3", "MEMBER AGE-3", "MEMBER GENDER-3",
             "MEMBER SAMAGRA ID-4", "MEMBER NAME-4", "MEMBER RELATION WITH APPLICANT-4", "MEMBER AGE-4", "MEMBER GENDER-4",
             "MEMBER SAMAGRA ID-5", "MEMBER NAME-5", "MEMBER RELATION WITH APPLICANT-5", "MEMBER AGE-5", "MEMBER GENDER-5",
             "MEMBER SAMAGRA ID-6", "MEMBER NAME-6", "MEMBER RELATION WITH APPLICANT-6", "MEMBER AGE-6", "MEMBER GENDER-6",
             "MEMBER SAMAGRA ID-7", "MEMBER NAME-7", "MEMBER RELATION WITH APPLICANT-7", "MEMBER AGE-7", "MEMBER GENDER-7",
             "MEMBER SAMAGRA ID-8", "MEMBER NAME-8", "MEMBER RELATION WITH APPLICANT-8", "MEMBER AGE-8", "MEMBER GENDER-8",
             "MEMBER SAMAGRA ID-9", "MEMBER NAME-9", "MEMBER RELATION WITH APPLICANT-9", "MEMBER AGE-9", "MEMBER GENDER-9",
             "MEMBER SAMAGRA ID-10", "MEMBER NAME-10", "MEMBER RELATION WITH APPLICANT-10", "MEMBER AGE-10", "MEMBER GENDER-10"
             ];
        rows.push(headers);
    }

    const ldIndex = headers.indexOf('LD');

    if (ldIndex === -1) {
        throw new Error('LD field not found in the sheet.');
    }

    const existingRowIndex = rows.slice(1).findIndex(row => row[ldIndex] === data.LD);

    const dataMappings = {
            'LD': 'LD',
            'CUSTOMER NAME': 'customerName',
            "SAMAGRA FAMILY ID": "samagraFamilyId",
            "NAME OF FAMILY HEAD": "samagraFamilyHeadName",
            "MEMBER SAMAGRA ID-1": "samagraMemberId1",
            "MEMBER NAME-1": "samagraMemberName1",
            "MEMBER RELATION WITH APPLICANT-1": "memberRelationWithApplicant1",
            "MEMBER AGE-1": "samagraMemberAge1",
            "MEMBER GENDER-1": "samagraMemberGender1",
            "MEMBER SAMAGRA ID-2": "samagraMemberId2",
            "MEMBER NAME-2": "samagraMemberName2",
            "MEMBER RELATION WITH APPLICANT-2": "memberRelationWithApplicant2",
            "MEMBER AGE-2": "samagraMemberAge2",
            "MEMBER GENDER-2": "samagraMemberGender2",
            "MEMBER SAMAGRA ID-3": "samagraMemberId3",
            "MEMBER NAME-3": "samagraMemberName3",
            "MEMBER RELATION WITH APPLICANT-3": "memberRelationWithApplicant3",
            "MEMBER AGE-3": "samagraMemberAge3",
            "MEMBER GENDER-3": "samagraMemberGender3",
            "MEMBER SAMAGRA ID-4": "samagraMemberId4",
            "MEMBER NAME-4": "samagraMemberName4",
            "MEMBER RELATION WITH APPLICANT-4": "memberRelationWithApplicant4",
            "MEMBER AGE-4": "samagraMemberAge4",
            "MEMBER GENDER-4": "samagraMemberGender4",
            "MEMBER SAMAGRA ID-5": "samagraMemberId5",
            "MEMBER NAME-5": "samagraMemberName5",
            "MEMBER RELATION WITH APPLICANT-5": "memberRelationWithApplicant5",
            "MEMBER AGE-5": "samagraMemberAge5",
            "MEMBER GENDER-5": "samagraMemberGender5",
            "MEMBER SAMAGRA ID-6": "samagraMemberId6",
            "MEMBER NAME-6": "samagraMemberName6",
            "MEMBER RELATION WITH APPLICANT-6": "memberRelationWithApplicant6",
            "MEMBER AGE-6": "samagraMemberAge6",
            "MEMBER GENDER-6": "samagraMemberGender6",
            "MEMBER SAMAGRA ID-7": "samagraMemberId7",
            "MEMBER NAME-7": "samagraMemberName7",
            "MEMBER RELATION WITH APPLICANT-7": "memberRelationWithApplicant7",
            "MEMBER AGE-7": "samagraMemberAge7",
            "MEMBER GENDER-7": "samagraMemberGender7",
            "MEMBER SAMAGRA ID-8": "samagraMemberId8",
            "MEMBER NAME-8": "samagraMemberName8",
            "MEMBER RELATION WITH APPLICANT-8": "memberRelationWithApplicant8",
            "MEMBER AGE-8": "samagraMemberAge8",
            "MEMBER GENDER-8": "samagraMemberGender8",
            "MEMBER SAMAGRA ID-9": "samagraMemberId9",
            "MEMBER NAME-9": "samagraMemberName9",
            "MEMBER RELATION WITH APPLICANT-9": "memberRelationWithApplicant9",
            "MEMBER AGE-9": "samagraMemberAge9",
            "MEMBER GENDER-9": "samagraMemberGender9",
            "MEMBER SAMAGRA ID-10": "samagraMemberId10",
            "MEMBER NAME-10": "samagraMemberName10",
            "MEMBER RELATION WITH APPLICANT-10": "memberRelationWithApplicant10",
            "MEMBER AGE-10": "samagraMemberAge10",
            "MEMBER GENDER-10": "samagraMemberGender10"

    };

    let rowToUpdate = Array(headers.length).fill('');

    headers.forEach((header, index) => {
        if (dataMappings[header]) {
            let value = data[dataMappings[header]] || '';
            rowToUpdate[index] = value;
        }
    });

    if (existingRowIndex === -1) {
        // Insert new row
        // console.log(`Inserting new row for LD: ${data.LD}`);
        rows.push(rowToUpdate);
    } else {
        // Update existing row
        // console.log(`Updating existing row for LD: ${data.LD}`);
        rows[existingRowIndex + 1] = rowToUpdate;
    }

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

async function udhyamKycSheet(data) {
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const spreadsheetId = process.env.FINAL_APPROVAL_SHEET;
    const sheetName = process.env.UDHYAM_KYC_FORM;

    console.time("Google Sheet Update");

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:BH`,
    });

    console.timeEnd("Google Sheet Update");

    let rows = response.data.values || [];
    let headers = rows.length > 0 ? rows[0] : [];

    // Define headers if the sheet is empty
    if (rows.length === 0) {
        headers = [
            "LD", "CUSTOMER NAME",
             "UDHYAM REGISTRATION NUMBER", "DATE OF UDHYAM REGISTRATION", "NAME OF UNIT", "TYPE OF ENTERPRISES", "TYPE OF ORGANISATION", "OWNER NAME", "DATE OF INCORPORATION", "ADDRESS OF ENTERPRISES"
        ];
        rows.push(headers);
    }

    const ldIndex = headers.indexOf('LD');

    if (ldIndex === -1) {
        throw new Error('LD field not found in the sheet.');
    }

    const existingRowIndex = rows.slice(1).findIndex(row => row[ldIndex] === data.LD);

    const dataMappings = {
        'LD':                          "LD",
        'CUSTOMER NAME':               "customerName",
        "UDHYAM REGISTRATION NUMBER":  "udhyamRegistrationNo",
        "DATE OF UDHYAM REGISTRATION": "dateOfUdhyamRegistration" ,
        "NAME OF UNIT" :               "nameOfUnit",
        "TYPE OF ENTERPRISES" :        "typeOfEnterprises",
        "TYPE OF ORGANISATION" :       "typeOfOrganisation",
        "OWNER NAME":                  "ownerName",
        "DATE OF INCORPORATION" :      "dateOfIncorporation",
        "ADDRESS OF ENTERPRISES":      "addressOfEnterprises"
    };

    let rowToUpdate = Array(headers.length).fill('');

    headers.forEach((header, index) => {
        if (dataMappings[header]) {
            let value = data[dataMappings[header]] || '';
            rowToUpdate[index] = value;
        }
    });

    if (existingRowIndex === -1) {
        // Insert new row
        // console.log(`Inserting new row for LD: ${data.LD}`);
        rows.push(rowToUpdate);
    } else {
        // Update existing row
        // console.log(`Updating existing row for LD: ${data.LD}`);
        rows[existingRowIndex + 1] = rowToUpdate;
    }

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

async function bankStatementKycSheet(req, data) {
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const spreadsheetId = process.env.FINAL_APPROVAL_SHEET;
    const sheetName = process.env.BANKSTATEMENT_KYC_FORM;

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:BH`,
    });

    let rows = response.data.values || [];
    let headers = rows.length > 0 ? rows[0] : [];

    if (rows.length === 0) {
        headers = [
            "LD", "CUSTOMER NAME",
            "BANK NAME", "AC HOLDER NAME", "AC NUMBER", "IFSC CODE", 
            "BRANCH NAME", "AC TYPE", "STATEMENT FROM DATE", 
            "STATEMENT TO DATE", "BANK STATEMENT DOCUMENT", "FORM STATUS" ,"REMARK BY BRANCH","REMARK BY APPROVER", "COMPLETE DATE" , "APPROVE DATE"
        ];
        rows.push(headers);
    }

    const ldIndex = headers.indexOf('LD');
    if (ldIndex === -1) {
        throw new Error('LD field not found in the sheet.');
    }

    const existingRowIndex = rows.slice(1).findIndex(row => row[ldIndex] === data.LD);

    const dataMappings = {
        'LD':                          "LD",
        'CUSTOMER NAME':               "customerName",
        "BANK NAME":                   "bankName",
        "AC HOLDER NAME":              "acHolderName",
        "AC NUMBER":                   "accountNumber",
        "IFSC CODE":                   "ifscCode",
        "BRANCH NAME":                 "branchName",
        "AC TYPE":                     "accountType",
        "STATEMENT FROM DATE":         "statementFromDate",
        "STATEMENT TO DATE":           "statementToDate",
        "BANK STATEMENT DOCUMENT":     "bankStatementDocument",
        "FORM STATUS" :                 "status",
        "REMARK BY BRANCH":             "remarkByBranchVendor",
        "REMARK BY APPROVER":            "remarkByApproval",
        "COMPLETE DATE" :               "completeDate",
        "APPROVE DATE" :               "approvalDate"
    };

    const baseUrl = req.protocol + '://' + req.get('host'); 
    let rowToUpdate = Array(headers.length).fill('');

    headers.forEach((header, index) => {
        if (dataMappings[header]) {
            let value = data[dataMappings[header]] || '';
            if (header === 'BANK STATEMENT DOCUMENT' && Array.isArray(value) && value.length > 0) {
                value = value.map(filePath => `${baseUrl}${filePath}`).join(', '); // or use '\n' for new lines
            }
            rowToUpdate[index] = value;
        }
    });
    if (existingRowIndex === -1) {
        // Insert a new row
        rows.push(rowToUpdate);
    } else {
        // Update the existing row
        rows[existingRowIndex + 1] = rowToUpdate;
    }

    // Save the data back to Google Sheets
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        resource: {
            values: rows,
        },
    });

    // console.log('Data saved to Google Sheets successfully');
}

async function propertyPaperKycSheet(data) {
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const spreadsheetId = process.env.FINAL_APPROVAL_SHEET;
    const sheetName = process.env.PROPERTY_PAPERS_KYC_FORM;

    console.time("Google Sheet Update");

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:BH`,
    });

    console.timeEnd("Google Sheet Update");

    let rows = response.data.values || [];
    let headers = rows.length > 0 ? rows[0] : [];

    // Define headers if the sheet is empty
    if (rows.length === 0) {
        headers = [
            "LD", "CUSTOMER NAME",
            "PROPERTY OWNER NAME", "RELATION WITH CUSTOMER", "HOUSE NO", "SURVEY NO", "PATWARI HALKA NO", 
            "WARD NO", "VILLAGE NAME", "GRAMPANCHAYAT NAME", "TEHSIL NAME", "DISTRICT NAME", "PINCODE", 
            "STATE NAME", "EAST BOUNDARY", "WEST BOUNDARY", "NORTH BOUNDARY", "SOUTH BOUNDARY", "PLOT LENGTH",
            "PLOT BRIDTH", "TOTAL PLOT AREA", "TOTAL AREA OF CONSTRUCTION", "TYPE OF CONSTRUCTION", 
            "AGE OF PROPERTY", "PATTA NO", "PATTA DATE", "BUILDING PERMISSION NO", "BUILDING PERMISSION DATE",
            "MUTATION CERTIFICATE NO", "MUTATION CERTIFICATE DATE", "OWNER CERTIFICATE NO", "OWNER CERTIFICATE DATE",
            "TAX RECEIPT NO", "TAX RECEIPT DATE", "NOC CERTIFICATE NO", "NOC CERTIFICATE DATE", "CO-OWNERSHIP DEED NO", 
            "CO-OWNERSHIP DEED DATE"


        ];
        rows.push(headers);
    }

    const ldIndex = headers.indexOf('LD');

    if (ldIndex === -1) {
        throw new Error('LD field not found in the sheet.');
    }

    const existingRowIndex = rows.slice(1).findIndex(row => row[ldIndex] === data.LD);

    const dataMappings = {
        'LD':                          "LD",
        'CUSTOMER NAME':               "customerName",
        "PROPERTY OWNER NAME": "propertyOwnerName",
        "RELATION WITH CUSTOMER": "relationWithCustomer",
        "HOUSE NO": "houseNo",
        "SURVEY NO": "surveyNo",
        "PATWARI HALKA NO": "patwariHalkaNo",
        "WARD NO": "wardNo",
        "VILLAGE NAME": "villageName",
        "GRAMPANCHAYAT NAME": "grampanchayatName",
        "TEHSIL NAME": "tehsilName",
        "DISTRICT NAME": "districtName",
        "PINCODE": "pincode",
        "STATE NAME": "stateName",
        "EAST BOUNDARY": "eastBoundary",
        "WEST BOUNDARY": "westBoundary",
        "NORTH BOUNDARY": "northBoundary",
        "SOUTH BOUNDARY": "southBoundary",
        "PLOT LENGTH": "plotLength",
        "PLOT BRIDTH": "plotBridth",
        "TOTAL PLOT AREA": "totalPlotArea",
        "TOTAL AREA OF CONSTRUCTION": "totalAreaOfConstruction",
        "TYPE OF CONSTRUCTION": "typeOfConstruction",
        "AGE OF PROPERTY": "ageOfProperty",
        "PATTA NO": "pattaNo",
        "PATTA DATE": "pattaDate",
        "BUILDING PERMISSION NO": "buildingPermissionNo",
        "BUILDING PERMISSION DATE": "buildingPermissionDate",
        "MUTATION CERTIFICATE NO": "mutationCertificateNo",
        "MUTATION CERTIFICATE DATE": "mutationCertificateDate",
        "OWNER CERTIFICATE NO": "ownerCertificateNo",
        "OWNER CERTIFICATE DATE": "ownerCertificateDate",
        "TAX RECEIPT NO": "taxReceiptNo",
        "TAX RECEIPT DATE": "taxReceiptDate",
        "NOC CERTIFICATE NO": "nocCertificateNo",
        "NOC CERTIFICATE DATE": "nocCertificateDate",
        "CO-OWNERSHIP DEED NO": "coOwnershipDeedNo",
        "CO-OWNERSHIP DEED DATE": "coOwnershipDeedDate"

    };

    let rowToUpdate = Array(headers.length).fill('');

    headers.forEach((header, index) => {
        if (dataMappings[header]) {
            let value = data[dataMappings[header]] || '';
            rowToUpdate[index] = value;
        }
    });

    if (existingRowIndex === -1) {
        // Insert new row
        // console.log(`Inserting new row for LD: ${data.LD}`);
        rows.push(rowToUpdate);
    } else {
        // Update existing row
        // console.log(`Updating existing row for LD: ${data.LD}`);
        rows[existingRowIndex + 1] = rowToUpdate;
    }

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

async function appPdcSheet(data) {
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const spreadsheetId = process.env.FINAL_APPROVAL_SHEET;
    const sheetName = process.env.APP_PDC_KYC_FORM;

    console.time("Google Sheet Update");

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:BH`,
    });

    console.timeEnd("Google Sheet Update");

    let rows = response.data.values || [];
    let headers = rows.length > 0 ? rows[0] : [];

    // Define headers if the sheet is empty
    if (rows.length === 0) {
        headers = [
            "LD", "CUSTOMER NAME",
            "BANK NAME", "AC HOLDER NAME", "AC NUMBER", "IFSC CODE", "BRANCH NAME", "AC TYPE", 
            "TOTAL CHEQUE COUNT", "CHEQUE NO-1", "CHEQUE NO-2", "CHEQUE NO-3", "CHEQUE NO-4", "CHEQUE NO-5", 
            "CHEQUE NO-6", "CHEQUE NO-7", "CHEQUE NO-8", "CHEQUE NO-9", "CHEQUE NO-10", "APPLICANT PDC DOCUMENT", "FORM STATUS" ,"REMARK BY BRANCH","REMARK BY APPROVER", "COMPLETE DATE" , "APPROVE DATE"
        ];
        rows.push(headers);
    }

    const ldIndex = headers.indexOf('LD');

    if (ldIndex === -1) {
        throw new Error('LD field not found in the sheet.');
    }

    const existingRowIndex = rows.slice(1).findIndex(row => row[ldIndex] === data.LD);

    const dataMappings = {
               'LD': 'LD', 
               'CUSTOMER NAME': 'customerName', 
               'BANK NAME': 'bankName', 
               'AC HOLDER NAME': 'acHolderName', 
               'AC NUMBER': 'accountNumber', 
               'IFSC CODE': 'ifscCode', 
               'BRANCH NAME': 'branchName', 
               'AC TYPE': 'accountType', 
               'TOTAL CHEQUE COUNT': 'totalChequeCount', 
               'CHEQUE NO-1': 'chequeNo1', 
               'CHEQUE NO-2': 'chequeNo2', 
               'CHEQUE NO-3': 'chequeNo3', 
               'CHEQUE NO-4': 'chequeNo4', 
               'CHEQUE NO-5': 'chequeNo5', 
               'CHEQUE NO-6': 'chequeNo6', 
               'CHEQUE NO-7': 'chequeNo7', 
               'CHEQUE NO-8': 'chequeNo8', 
               'CHEQUE NO-9': 'chequeNo9', 
               'CHEQUE NO-10': 'chequeNo10',
               "APPLICANT PDC DOCUMENT":     "applicantPdcDocument",
               "FORM STATUS" :                 "status",
               "REMARK BY BRANCH":             "remarkByBranchVendor",
               "REMARK BY APPROVER":            "remarkByApproval",
               "COMPLETE DATE" :               "completeDate",
               "APPROVE DATE" :               "approvalDate"

    };

    let rowToUpdate = Array(headers.length).fill('');

    headers.forEach((header, index) => {
        if (dataMappings[header]) {
            let value = data[dataMappings[header]] || '';
            rowToUpdate[index] = value;
        }
    });

    if (existingRowIndex === -1) {
        // Insert new row
        // console.log(`Inserting new row for LD: ${data.LD}`);
        rows.push(rowToUpdate);
    } else {
        // Update existing row
        // console.log(`Updating existing row for LD: ${data.LD}`);
        rows[existingRowIndex + 1] = rowToUpdate;
    }

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


async function technicalReportKycSheet(data) {
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const spreadsheetId = process.env.FINAL_APPROVAL_SHEET;
    const sheetName = process.env.TECHNICAL_REPORT_KYC_FORM;

    console.time("Google Sheet Update");

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:V`,
    });

    console.timeEnd("Google Sheet Update");

    let rows = response.data.values || [];
    let headers = rows.length > 0 ? rows[0] : [];

    // Define headers if the sheet is empty
    if (rows.length === 0) {
        headers = [
            "LD", "CUSTOMER NAME", "NAME OF THE DOCUMENTS HOLDER", "ADDRESS AS PER INSPECTION",
            "LANDMARK", "TYPE OF LOCALITY", "TYPE OF PROPERTY", "TYPE OF STRUCTURE",
            "AREAR OF PLOT", "TOTAL BUILT UP AREA", "OCCUPATION STATUS", "OCCUPANCY", 
            "AGE OF PROPERTY", "LAND VALUE", "CONSTRUCTION VALUE", 
            "FAIR MARKET VALUE OF LAND", "REALIZABLE VALUE", 
            "LATITUDE", "LONGITUDE", "VALUATION DONE BY"
        ];
        rows.push(headers);
    }

    const ldIndex = headers.indexOf('LD');
    if (ldIndex === -1) {
        throw new Error('LD field not found in the sheet.');
    }

    const existingRowIndex = rows.slice(1).findIndex(row => row[ldIndex] === data.LD);

    const dataMappings = {
        'LD': 'LD',
        'CUSTOMER NAME': 'customerName',
        'NAME OF THE DOCUMENTS HOLDER': 'nameOfDocumentsHolder',
        'ADDRESS AS PER INSPECTION': 'addressAsPerInspection',
        'LANDMARK': 'landmark',
        'TYPE OF LOCALITY': 'typeOfLocality',
        'TYPE OF PROPERTY': 'typeOfProperty',
        'TYPE OF STRUCTURE': 'typeOfStructure',
        'AREAR OF PLOT': 'areaOfPlot',
        'TOTAL BUILT UP AREA': 'totalBuiltUpArea',
        'OCCUPATION STATUS': 'occupationStatus',
        'OCCUPANCY': 'occupancy',
        'AGE OF PROPERTY': 'ageOfProperty',
        'LAND VALUE': 'landValue',
        'CONSTRUCTION VALUE': 'constructionValue',
        'FAIR MARKET VALUE OF LAND': 'fairMarketValueOfLand',
        'REALIZABLE VALUE': 'realizableValue',
        'LATITUDE': 'latitude',
        'LONGITUDE': 'longitude',
        'VALUATION DONE BY': 'valuationDoneBy'
    };

    let rowToUpdate = Array(headers.length).fill('');

    headers.forEach((header, index) => {
        if (dataMappings[header]) {
            let value = data[dataMappings[header]] || '';
            rowToUpdate[index] = value;
        }
    });

    if (existingRowIndex === -1) {
        // Insert new row
        rows.push(rowToUpdate);
    } else {
        // Update existing row
        rows[existingRowIndex + 1] = rowToUpdate;
    }

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

async function taggingKycSheet(data) {
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    const spreadsheetId = process.env.FINAL_APPROVAL_SHEET;
    const sheetName = process.env.TAGGING_KYC_FORM;

    console.time("Google Sheet Update");

    // Fetch the existing data from the sheet
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:ZZZ`,
    });

    console.timeEnd("Google Sheet Update");

    let rows = response.data.values || [];
    let headers = rows.length > 0 ? rows[0] : [];

    // Required static headers
    const staticHeaders = [
        "LD", "CUSTOMER NAME", "FATHER NAME", 
        "ADDRESS OF APPLICANT", "CONTACT NUMBER", "DATE", "PLACE"
    ];

    // Dynamically generate headers based on tagging details
    const dynamicHeaders = [];
    data.taggingDetail.forEach((_, index) => {
        const prefix = `NO-${index + 1}`;
        dynamicHeaders.push(
            `TAG ${prefix}`, `ANIMAL ${prefix}`, `BREED ${prefix}`, 
            `GENDER ${prefix}`, `COLOUR ${prefix}`, `AGE ${prefix}`, 
            `MILK IN LITER/DAY ${prefix}`
        );
    });

    // Combine all headers and ensure uniqueness
    headers = [...new Set([...staticHeaders, ...dynamicHeaders, ...headers])];

    // Ensure headers are set at the top (A1 row)
    if (rows.length === 0 || rows[0].length !== headers.length) {
        rows[0] = headers;
    }

    const ldIndex = headers.indexOf('LD');
    if (ldIndex === -1) throw new Error('LD field is missing from headers.');

    // Check if LD exists in any row (after the header row)
    const existingRowIndex = rows.slice(1).findIndex(row => row[ldIndex] === data.LD);

    // Prepare row data with all cells initialized to empty
    let rowToUpdate = Array(headers.length).fill('');

    // Map basic data into the correct columns
    const basicDataMappings = {
        'LD': 'LD',
        'CUSTOMER NAME': 'customerName',
        'FATHER NAME': 'fatherName',
        'ADDRESS OF APPLICANT': 'addressOfApplicant',
        'CONTACT NUMBER': 'contactNumber',
        'DATE': 'date',
        'PLACE': 'place'
    };

    headers.forEach((header, index) => {
        if (basicDataMappings[header]) {
            rowToUpdate[index] = data[basicDataMappings[header]] || '';
        }
    });

    // Map tagging details into the correct columns
    data.taggingDetail.forEach((tag, tagIndex) => {
        const prefix = `NO-${tagIndex + 1}`;
        const tagMappings = {
            [`TAG ${prefix}`]: 'tagNo',
            [`ANIMAL ${prefix}`]: 'animalNo',
            [`BREED ${prefix}`]: 'breedNo',
            [`GENDER ${prefix}`]: 'genderNo',
            [`COLOUR ${prefix}`]: 'colourNo',
            [`AGE ${prefix}`]: 'ageNo',
            [`MILK IN LITER/DAY ${prefix}`]: 'milkInLiterPerDay'
        };

        headers.forEach((header, index) => {
            if (tagMappings[header]) {
                rowToUpdate[index] = tag[tagMappings[header]] || '';
            }
        });
    });

    if (existingRowIndex === -1) {
        // Add a new row if LD is not found
        rows.push(rowToUpdate);
    } else {
        // Update the existing row if LD is found
        rows[existingRowIndex + 1] = rowToUpdate;
    }

    // Update the sheet with new headers and data
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        resource: {
            values: rows,
        },
    });

    console.log(`Data for LD: ${data.LD} processed successfully.`);
}

async function rcuKycSheet(data) {
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const spreadsheetId = process.env.FINAL_APPROVAL_SHEET;
    const sheetName = process.env.RCU_KYC_FORM;

    console.time("Google Sheet Update");

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:Z`,
    });

    console.timeEnd("Google Sheet Update");

    let rows = response.data.values || [];
    let headers = rows.length > 0 ? rows[0] : [];

    // Define headers if the sheet is empty
    if (rows.length === 0) {
        headers = [
            "LD", 
            "CUSTOMER NAME", 
            "APPLICANT RESIDENTIAL ADDRESS", 
            "APP CONTACT NO", 
            "CO-APP NAME-1", 
            "CO-APP RESIDENTIAL ADDRESS-1", 
            "CO-APP CONTACT NO-11", 
            "CO-APP NAME-2", 
            "CO-APP RESIDENTIAL ADDRESS-2", 
            "CO-APP CONTACT NO-2", 
            "GUARANTOR NAME", 
            "GUARANTOR RESIDENTIAL ADDRESS", 
            "GRT CONTACT NO", 
            "REPORT RECEIVED DATE", 
            "REPORT STATUS"
        ];
        rows.push(headers);
    }

    const ldIndex = headers.indexOf('LD');
    if (ldIndex === -1) {
        throw new Error('LD field not found in the sheet.');
    }

    const existingRowIndex = rows.slice(1).findIndex(row => row[ldIndex] === data.LD);

    const dataMappings = {
        'LD': 'LD',
        'CUSTOMER NAME': 'customerName',
        'APPLICANT RESIDENTIAL ADDRESS': 'applicantResidentialAddress',
        'APP CONTACT NO': 'appContactNo',
        'CO-APP NAME-1': 'coAppName1',
        'CO-APP RESIDENTIAL ADDRESS-1': 'coAppResidentialAddress1',
        'CO-APP CONTACT NO-1': 'coAppContactNo1',
        'CO-APP NAME-2': 'coAppName2',
        'CO-APP RESIDENTIAL ADDRESS-2': 'coAppResidentialAddress2',
        'CO-APP CONTACT NO-2': 'coAppContactNo2',
        'GUARANTOR NAME': 'guarantorName',
        'GUARANTOR RESIDENTIAL ADDRESS': 'guarantorResidentialAddress',
        'GTR CONTACT NO': 'guarantorContactNo',
        'REPORT RECEIVED DATE': 'reportReceivedDate',
        'REPORT STATUS': 'reportStatus'
    };

    let rowToUpdate = Array(headers.length).fill('');

    headers.forEach((header, index) => {
        if (dataMappings[header]) {
            let value = data[dataMappings[header]] || '';
            rowToUpdate[index] = value;
        }
    });

    if (existingRowIndex === -1) {
        rows.push(rowToUpdate); // Insert new row
    } else {
        rows[existingRowIndex + 1] = rowToUpdate; // Update existing row
    }

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


async function cibilReportKycSheet(data) {
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const spreadsheetId = process.env.FINAL_APPROVAL_SHEET;
    const sheetName = process.env.CIBIL_REPORT_KYC_FORM;

    console.time("Google Sheet Update");

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:BM`,
    });

    console.timeEnd("Google Sheet Update");

    let rows = response.data.values || [];
    let headers = rows.length > 0 ? rows[0] : [];

    // Define headers if the sheet is empty
    if (rows.length === 0) {
        headers = [
            "LD", "CUSTOMER NAME", "APPLICANT CIBIL SCORE", "TOTAL ACCOUNTS", "OVERDUE ACCOUNT",
            "ZERO BALANCE ACCOUNT", "HIGH CREDIT/SANCTION AMOUNT", "TOTAL CURRENT OUTSTANDING",
            "TOTAL OVERDUE AMOUNT", "TOTAL NUMBER OF ENQUIRY",
            "EXISTING LOAN RUNNING LOAN TYPE-1", "EXISTING LOAN RUNNING OWNERSHIP-1",
            "EXISTING LOAN RUNNING SANTIONED AMOUNT-1", "EXISTING LOAN RUNNING CURRENT BALANCE-1",
            "EXISTING LOAN RUNNING ROI-1", "EXISTING LOAN RUNNING EMI-1",
            "EXISTING LOAN RUNNING TOTAL TENURE-1", "EXISTING LOAN RUNNING BALANCE TENURE-1",
            "EXISTING LOAN RUNNING LOAN STATUS-1", "EXISTING LOAN RUNNING LOAN OBLIGATED (Y/N)-1",
            "EXISTING LOAN RUNNING OBLIGATION CONSIDERED (AMOUNT)-1",
            "EXISTING LOAN RUNNING LOAN TYPE-2", "EXISTING LOAN RUNNING OWNERSHIP-2",
            "EXISTING LOAN RUNNING SANTIONED AMOUNT-2", "EXISTING LOAN RUNNING CURRENT BALANCE-2",
            "EXISTING LOAN RUNNING ROI-2", "EXISTING LOAN RUNNING EMI-2",
            "EXISTING LOAN RUNNING TOTAL TENURE-2", "EXISTING LOAN RUNNING BALANCE TENURE-2",
            "EXISTING LOAN RUNNING LOAN STATUS-2", "EXISTING LOAN RUNNING LOAN OBLIGATED (Y/N)-2",
            "EXISTING LOAN RUNNING OBLIGATION CONSIDERED (AMOUNT)-2",
            "CO-APPLICANT NAME", "CO-APPLICANT CIBIL SCORE", "CO-APP TOTAL ACCOUNTS",
            "CO-APP OVERDUE ACCOUNT", "CO-APP ZERO BALANCE ACCOUNT",
            "CO-APP HIGH CREDIT/SANCTION AMOUNT", "CO-APP TOTAL CURRENT OUTSTANDING",
            "CO-APP TOTAL OVERDUE AMOUNT",
            "CO-APP EXISTING LOAN RUNNING LOAN TYPE-1", "CO-APP EXISTING LOAN RUNNING OWNERSHIP-1",
            "CO-APP EXISTING LOAN RUNNING SANTIONED AMOUNT-1", "CO-APP EXISTING LOAN RUNNING CURRENT BALANCE-1",
            "CO-APP EXISTING LOAN RUNNING ROI-1", "CO-APP EXISTING LOAN RUNNING EMI-1",
            "CO-APP EXISTING LOAN RUNNING TOTAL TENURE-1", "CO-APP EXISTING LOAN RUNNING BALANCE TENURE-1",
            "CO-APP EXISTING LOAN RUNNING LOAN STATUS-1", "CO-APP EXISTING LOAN RUNNING LOAN OBLIGATED (Y/N)-1",
            "CO-APP EXISTING LOAN RUNNING OBLIGATION CONSIDERED (AMOUNT)-1",
            "CO-APP EXISTING LOAN RUNNING LOAN TYPE-2", "CO-APP EXISTING LOAN RUNNING OWNERSHIP-2",
            "CO-APP EXISTING LOAN RUNNING SANTIONED AMOUNT-2", "CO-APP EXISTING LOAN RUNNING CURRENT BALANCE-2",
            "CO-APP EXISTING LOAN RUNNING ROI-2", "CO-APP EXISTING LOAN RUNNING EMI-2",
            "CO-APP EXISTING LOAN RUNNING TOTAL TENURE-2", "CO-APP EXISTING LOAN RUNNING BALANCE TENURE-2",
            "CO-APP EXISTING LOAN RUNNING LOAN STATUS-2", "CO-APP EXISTING LOAN RUNNING LOAN OBLIGATED (Y/N)-2",
            "CO-APP EXISTING LOAN RUNNING OBLIGATION CONSIDERED (AMOUNT)-2",
            "GUARANTOR NAME", "GUARANTOR CIBIL SCORE"
        ];
        rows.push(headers);
    }

    const ldIndex = headers.indexOf('LD');
    if (ldIndex === -1) {
        throw new Error('LD field not found in the sheet.');
    }

    const existingRowIndex = rows.slice(1).findIndex(row => row[ldIndex] === data.LD);

    const dataMappings = {
        'LD': 'LD',
        'CUSTOMER NAME': 'customerName',
        'APPLICANT CIBIL SCORE': 'applicantCibilScore',
        'TOTAL ACCOUNTS': 'totalAccounts',
        'OVERDUE ACCOUNT': 'overdueAccount',
        'ZERO BALANCE ACCOUNT': 'zeroBalanceAccount',
        'HIGH CREDIT/SANCTION AMOUNT': 'highCreditSanctionAmount',
        'TOTAL CURRENT OUTSTANDING': 'totalCurrentOutstanding',
        'TOTAL OVERDUE AMOUNT': 'totalOverdueAmount',
        'TOTAL NUMBER OF ENQUIRY': 'totalNumberOfEnquiry',
        'EXISTING LOAN RUNNING LOAN TYPE-1': 'existingLoanRunningLoanType1',
        'EXISTING LOAN RUNNING OWNERSHIP-1': 'existingLoanRunningOwnership1',
        'EXISTING LOAN RUNNING SANTIONED AMOUNT-1': 'existingLoanRunningSanctionedAmount1',
        'EXISTING LOAN RUNNING CURRENT BALANCE-1': 'existingLoanRunningCurrentBalance1',
        'EXISTING LOAN RUNNING ROI-1': 'existingLoanRunningRoi1',
        'EXISTING LOAN RUNNING EMI-1': 'existingLoanRunningEmi1',
        'EXISTING LOAN RUNNING TOTAL TENURE-1': 'existingLoanRunningTotalTenure1',
        'EXISTING LOAN RUNNING BALANCE TENURE-1': 'existingLoanRunningBalanceTenure1',
        'EXISTING LOAN RUNNING LOAN STATUS-1': 'existingLoanRunningLoanStatus1',
        'EXISTING LOAN RUNNING LOAN OBLIGATED (Y/N)-1': 'existingLoanRunningLoanObligated1',
        'EXISTING LOAN RUNNING OBLIGATION CONSIDERED (AMOUNT)-1': 'existingLoanRunningObligationConsideredAmount1',
        'EXISTING LOAN RUNNING LOAN TYPE-2': 'existingLoanRunningLoanType2',
        'EXISTING LOAN RUNNING OWNERSHIP-2': 'existingLoanRunningOwnership2',
        'EXISTING LOAN RUNNING SANTIONED AMOUNT-2': 'existingLoanRunningSanctionedAmount2',
        'EXISTING LOAN RUNNING CURRENT BALANCE-2': 'existingLoanRunningCurrentBalance2',
        'EXISTING LOAN RUNNING ROI-2': 'existingLoanRunningRoi2',
        'EXISTING LOAN RUNNING EMI-2': 'existingLoanRunningEmi2',
        'EXISTING LOAN RUNNING TOTAL TENURE-2': 'existingLoanRunningTotalTenure2',
        'EXISTING LOAN RUNNING BALANCE TENURE-2': 'existingLoanRunningBalanceTenure2',
        'EXISTING LOAN RUNNING LOAN STATUS-2': 'existingLoanRunningLoanStatus2',
        'EXISTING LOAN RUNNING LOAN OBLIGATED (Y/N)-2': 'existingLoanRunningLoanObligated2',
        'EXISTING LOAN RUNNING OBLIGATION CONSIDERED (AMOUNT)-2': 'existingLoanRunningObligationConsideredAmount2',
        'CO-APPLICANT NAME': 'coAppName',
        'CO-APPLICANT CIBIL SCORE': 'coAppCibilScore',
        'CO-APP TOTAL ACCOUNTS': 'coAppTotalAccounts',
        'CO-APP OVERDUE ACCOUNT': 'coAppOverdueAccount',
        'CO-APP ZERO BALANCE ACCOUNT': 'coAppZeroBalanceAccount',
        'CO-APP HIGH CREDIT/SANCTION AMOUNT': 'coAppHighCreditSanctionAmount',
        'CO-APP TOTAL CURRENT OUTSTANDING': 'coAppTotalCurrentOutstanding',
        'CO-APP TOTAL OVERDUE AMOUNT': 'coAppTotalOverdueAmount',
        'CO-APP EXISTING LOAN RUNNING LOAN TYPE-1': 'coAppExistingLoanRunningLoanType1',
        'CO-APP EXISTING LOAN RUNNING OWNERSHIP-1': 'coAppExistingLoanRunningOwnership1',
        'CO-APP EXISTING LOAN RUNNING SANTIONED AMOUNT-1': 'coAppExistingLoanRunningSanctionedAmount1',
        'CO-APP EXISTING LOAN RUNNING CURRENT BALANCE-1': 'coAppExistingLoanRunningCurrentBalance1',
        'CO-APP EXISTING LOAN RUNNING ROI-1': 'coAppExistingLoanRunningRoi1',
        'CO-APP EXISTING LOAN RUNNING EMI-1': 'coAppExistingLoanRunningEmi1',
        'CO-APP EXISTING LOAN RUNNING TOTAL TENURE-1': 'coAppExistingLoanRunningTotalTenure1',
        'CO-APP EXISTING LOAN RUNNING BALANCE TENURE-1': 'coAppExistingLoanRunningBalanceTenure1',
        'CO-APP EXISTING LOAN RUNNING LOAN STATUS-1': 'coAppExistingLoanRunningLoanStatus1',
        'CO-APP EXISTING LOAN RUNNING LOAN OBLIGATED (Y/N)-1': 'coAppExistingLoanRunningLoanObligated1',
        'CO-APP EXISTING LOAN RUNNING OBLIGATION CONSIDERED (AMOUNT)-1': 'coAppExistingLoanRunningObligationConsideredAmount1',
        'CO-APP EXISTING LOAN RUNNING LOAN TYPE-2': 'coAppExistingLoanRunningLoanType2',
        'CO-APP EXISTING LOAN RUNNING OWNERSHIP-2': 'coAppExistingLoanRunningOwnership2',
        'CO-APP EXISTING LOAN RUNNING SANTIONED AMOUNT-2': 'coAppExistingLoanRunningSanctionedAmount2',
        'CO-APP EXISTING LOAN RUNNING CURRENT BALANCE-2': 'coAppExistingLoanRunningCurrentBalance2',
        'CO-APP EXISTING LOAN RUNNING ROI-2': 'coAppExistingLoanRunningRoi2',
        'CO-APP EXISTING LOAN RUNNING EMI-2': 'coAppExistingLoanRunningEmi2',
        'CO-APP EXISTING LOAN RUNNING TOTAL TENURE-2': 'coAppExistingLoanRunningTotalTenure2',
        'CO-APP EXISTING LOAN RUNNING BALANCE TENURE-2': 'coAppExistingLoanRunningBalanceTenure2',
        'CO-APP EXISTING LOAN RUNNING LOAN STATUS-2': 'coAppExistingLoanRunningLoanStatus2',
        'CO-APP EXISTING LOAN RUNNING LOAN OBLIGATED (Y/N)-2': 'coAppExistingLoanRunningLoanObligated2',
        'CO-APP EXISTING LOAN RUNNING OBLIGATION CONSIDERED (AMOUNT)-2': 'coAppExistingLoanRunningObligationConsideredAmount2',
        'GUARANTOR NAME': 'gtrName',
        'GUARANTOR CIBIL SCORE': 'gtrCibilScore'
    };

    let rowToUpdate = Array(headers.length).fill('');

    headers.forEach((header, index) => {
        if (dataMappings[header]) {
            let value = data[dataMappings[header]] || '';
            rowToUpdate[index] = value;
        }
    });

    if (existingRowIndex === -1) {
        rows.push(rowToUpdate); // Insert new row
    } else {
        rows[existingRowIndex + 1] = rowToUpdate; // Update existing row
    }

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

async function coAppPdcSheet(coAppData) {
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const spreadsheetId = process.env.FINAL_APPROVAL_SHEET;
    const sheetName = process.env.COAPP_PDC_FORM;

    console.time("Google Sheet Update");

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:P`,
    });

    console.timeEnd("Google Sheet Update");

    let rows = response.data.values || [];
    let headers = rows.length > 0 ? rows[0] : [];

    // Define headers if the sheet is empty
    if (rows.length === 0) {
        headers = [
            "LD", "CUSTOMER NAME", "CO-APPLICANT NAME", "BANK NAME", "A/C HOLDER NAME", 
            "A/C NUMBER", "IFSC CODE", "BRANCH NAME", "A/C TYPE", "TOTAL CHEQUE COUNT",
            "CHEQUE NO.1", "CHEQUE NO.2", "CHEQUE NO.3", "CHEQUE NO.4", "CHEQUE NO.5"
        ];
        rows.push(headers);
    }

    const ldIndex = headers.indexOf('LD');
    if (ldIndex === -1) {
        throw new Error('LD field not found in the sheet.');
    }

    const existingRowIndex = rows.slice(1).findIndex(row => row[ldIndex] === coAppData.LD);

    const dataMappings = {
        'LD': 'LD',
        'CUSTOMER NAME': 'customerName',
        'CO-APPLICANT NAME': 'customerName', // Assuming this is the co-applicant name
        'BANK NAME': 'bankName',
        'A/C HOLDER NAME': 'acHolderName',
        'A/C NUMBER': 'accountNumber',
        'IFSC CODE': 'ifscCode',
        'BRANCH NAME': 'branchName',
        'A/C TYPE': 'accountType',
        'TOTAL CHEQUE COUNT': 'totalChequeCount',
        'CHEQUE NO.1': 'chequeNo1',
        'CHEQUE NO.2': 'chequeNo2',
        'CHEQUE NO.3': 'chequeNo3',
        'CHEQUE NO.4': 'chequeNo4',
        'CHEQUE NO.5': 'chequeNo5'
    };

    let rowToUpdate = Array(headers.length).fill('');

    headers.forEach((header, index) => {
        if (dataMappings[header]) {
            let value = coAppData[dataMappings[header]] || '';
            rowToUpdate[index] = value;
        }
    });

    if (existingRowIndex === -1) {
        rows.push(rowToUpdate); // Insert new row
    } else {
        rows[existingRowIndex + 1] = rowToUpdate; // Update existing row
    }

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

async function jainamKycSheet(data) {
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    const spreadsheetId = process.env.FINAL_APPROVAL_SHEET;
    const sheetName = process.env.JAINAM_KYC_FORM;
    console.time("Google Sheet Update");
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:M`,
    });
    console.timeEnd("Google Sheet Update");
    let rows = response.data.values || [];
    let headers = rows.length > 0 ? rows[0] : [];
    // Define headers if the sheet is empty
    if (rows.length === 0) {
        headers = [
            "LD",
            "CUSTOMER NAME",
            "PARTNER NAME",
            "BRANCH NAME",
            "APPLICANT JAINAM PROFILE NO",
            "CO-APPLICANT NAME",
            "CO-APPLICANT JAINAM PROFILE NO",
            "CO-APPLICANT 2 NAME",
            "CO-APPLICANT 2 JAINAM PROFILE NO",
            "GUARANTOR NAME",
            "GUARANTOR JAINAM PROFILE NO",
            "JAINAM LOAN NUMBER",
            "CASE DISBURSED IN JAINAM"
        ];
        rows.push(headers);
    }
    const ldIndex = headers.indexOf('LD');
    if (ldIndex === -1) {
        throw new Error('LD field not found in the sheet.');
    }
    const existingRowIndex = rows.slice(1).findIndex(row => row[ldIndex] === data.LD);
    const dataMappings = {
        'LD': 'LD',
        'CUSTOMER NAME': 'customerName',
        'PARTNER NAME': 'partnerName',
        'BRANCH NAME': 'branchName',
        'APPLICANT JAINAM PROFILE NO': 'applicantJainamProfileNo',
        'CO-APPLICANT NAME': 'coApplicantName',
        'CO-APPLICANT JAINAM PROFILE NO': 'coApplicantJainamProfileNo',
        'CO-APPLICANT 2 NAME': 'coApplicant2Name',
        'CO-APPLICANT 2 JAINAM PROFILE NO': 'coApplicant2JainamProfileNo',
        'GUARANTOR NAME': 'guarantorName',
        'GUARANTOR JAINAM PROFILE NO': 'guarantorJainamProfileNo',
        'JAINAM LOAN NUMBER': 'jainamLoanNumber',
        'CASE DISBURSED IN JAINAM': 'caseDisbursedInJainam'
    };
    let rowToUpdate = Array(headers.length).fill('');
    headers.forEach((header, index) => {
        if (dataMappings[header]) {
            let value = data[dataMappings[header]] || '';
            rowToUpdate[index] = value;
        }
    });
    if (existingRowIndex === -1) {
        rows.push(rowToUpdate); // Insert new row
    } else {
        rows[existingRowIndex + 1] = rowToUpdate; // Update existing row
    }
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


async function pdReportKycSheet(data) {
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    const spreadsheetId = process.env.FINAL_APPROVAL_SHEET;
    const sheetName = process.env.JAINAM_KYC_FORM;
    console.time("Google Sheet Update");
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:M`,
    });
    console.timeEnd("Google Sheet Update");
    let rows = response.data.values || [];
    let headers = rows.length > 0 ? rows[0] : [];
    // Define headers if the sheet is empty
    if (rows.length === 0) {
        headers = [
                "LD", 
                "CUSTOMER NAME", 
                "EMPLOYEE EMAIL ID", 
                "BRANCH NAME", 
                "CUSTOMER FATHER NAME", 
                "CUSTOMER MOTHER NAME", 
                "CUSTOMER SPOUSE/WIFE NAME", 
                "CUSTOMER DATE OF BIRTH (DOB)", 
                "CUSTOMER HIGHER EDUCATION", 
                "CUSTOMER MOBILE NUMBER", 
                "CUSTOMER MARRIAGE STATUS", 
                "NUMBER OF DEPENDANT ON CUSTOMERS", 
                "CUSTOMER PHOTO", 
                "CUSTOMER KYC PHOTO", 
                "CO-APPLICANT NAME", 
                "CO-APPLICANT FATHER NAME", 
                "CO-APPLICANT MOTHER NAME", 
                "CO-APPLICANT SPOUSE/WIFE NAME", 
                "CO-APPLICANT RELATION WITH APPLICANT", 
                "CO-APPLICANT DATE OF BIRTH (DOB)", 
                "CO-APPLICANT TYPE (MALE/FEMALE)", 
                "CO-APPLICANT HIGHER EDUCATION", 
                "CO-APPLICANT MOBILE NUMBER", 
                "CO-APPLICANT MARRIAGE STATUS", 
                "CO-APPLICANT PHOTO", 
                "ADDITIONAL CO-APPLICANT DETAILS", 
                "CO-APPLICANT 2 NAME", 
                "CO-APPLICANT 2 FATHER NAME", 
                "CO-APPLICANT 2 MOTHER NAME", 
                "CO-APPLICANT 2 SPOUSE/WIFE NAME", 
                "CO-APPLICANT 2 RELATION WITH APPLICANT", 
                "CO-APPLICANT 2 DATE OF BIRTH (DOB)", 
                "CO-APPLICANT 2 TYPE (MALE/FEMALE)", 
                "CO-APPLICANT 2 HIGHER EDUCATION", 
                "CO-APPLICANT 2 MOBILE NUMBER", 
                "ADDRESS AS PER AADHAR COPY", 
                "CO-APPLICANT 2 MARRIAGE STATUS", 
                "CO-APPLICANT 2 PAN NUMBER", 
                "CO-APPLICANT 2 AADHAR NUMBER", 
                "CO-APPLICANT 2 DRIVING LICENCE NUMBER", 
                "CO-APPLICANT 2 VOTER ID NUMBER", 
                "CO-APPLICANT 2 PHOTO", 
                "CO-APPLICANT 2 KYC PHOTO", 
                "GUARANTOR DETAILS", 
                "GUARANTOR NAME", 
                "GUARANTOR FATHER NAME", 
                "GUARANTOR MOTHER NAME", 
                "GUARANTOR SPOUSE/WIFE NAME", 
                "GUARANTOR RELATION WITH APPLICANT", 
                "GUARANTOR TYPE (MALE/FEMALE)", 
                "GUARANTOR DATE OF BIRTH (DOB)", 
                "GUARANTOR HIGHER EDUCATION", 
                "GUARANTOR MOBILE NUMBER", 
                "ADDRESS AS PER AADHAR COPY", 
                "GUARANTOR MARRIAGE STATUS", 
                "GUARANTOR PAN NUMBER", 
                "GUARANTOR AADHAR NUMBER", 
                "GUARANTOR VOTER ID NUMBER", 
                "GUARANTOR DRIVING LICENCE NUMBER", 
                "GUARANTOR PHOTO", 
                "GUARANTOR KYC PHOTO", 
                "AGRI LAND DETAILS", 
                "NAME OF AGRI OWNER", 
                "AGRI OWNER RELATION WITH APPLICANT", 
                "AGRI LAND IN BIGHA", 
                "AGRI LAND SURVEY / KHASRA NUMBER", 
                "VILLAGE NAME", 
                "WHICH CROP IS PLANTED", 
                "HOW MUCH IN RUPEES SOLD FOR LAST CROP", 
                "FERTILIZER SHOP OWNER NAME", 
                "FERTILIZER SHOP OWNER CONTACT NUMBER", 
                "AGRI LAND PAVATI", 
                "INCOME FROM DAIRY BUSINESS", 
                "NUMBER OF CATTLE AVAILABLE", 
                "NUMBER OF MILK GIVING CATTLES", 
                "TOTAL MILK SUPPLY PER DAY", 
                "NAME OF DAIRY OWNER", 
                "MOBILE NUMBER OF DAIRY OWNER", 
                "MILK SUPPLYING FROM SINCE YEAR", 
                "MONTHLY EXPENSES ON MILK BUSINESS", 
                "MONTHLY INCOME FROM MILK BUSINESS", 
                "MILK BOOK DIARY PHOTO", 
                "CATTLE PHOTO", 
                "OTHER SOURCE OF INCOME", 
                "BUSINESS NAME", 
                "BUSINESS OWNER NAME", 
                "RELATION WITH APPLICANT", 
                "NATURE OF BUSINESS", 
                "BUSINESS BOARD SEEN", 
                "BUSINESS DOING FROM NUMBER OF YEARS", 
                "BUSINESS MONTHLY INCOME", 
                "SHOP PHOTO ALONG WITH CUSTOMER AND SUPPORTINGS", 
                "SALARY INCOME", 
                "SALARY EARNING MEMBER NAME", 
                "SALARY - RELATION WITH APPLICANT", 
                "SALARY INCOME FROM", 
                "ADDRESS OF SALARY PROVIDER", 
                "MOBILE NUMBER OF SALARY PROVIDER", 
                "DOING FROM NUMBER OF YEARS", 
                "SALARY PAID THROUGH", 
                "MONTHLY SALARY", 
                "SALARY CERTIFICATE / DECLARATION LETTER", 
                "PROPERTY DETAILS", 
                "NAME OF PROPERTY OWNER", 
                "RELATION WITH APPLICANT", 
                "RESIDENCE TYPE", 
                "AREA OF CONSTRUCTION IN SQ FT", 
                "HOUSE CONSTRUCTION STATUS", 
                "NUMBER OF ROOMS", 
                "COMPLETE CONSTRUCTION DETAILS", 
                "EAST BOUNDARY", 
                "WEST BOUNDARY", 
                "NORTH BOUNDARY", 
                "SOUTH BOUNDARY", 
                "PATTA AVAILABLE WITH CUSTOMER", 
                "FOUR BOUNDARIES MATCHING WITH PATTA/PROPERTY DOCS", 
                "AGE OF HOUSE", 
                "LANDMARK", 
                "ASSETS SEEN AT RESIDENCE", 
                "EAST BOUNDARY", 
                "WEST BOUNDARY", 
                "NORTH BOUNDARY", 
                "SOUTH BOUNDARY", 
                "PROPERTY DOCS PHOTO", 
                "OVERALL HOUSE PHOTO", 
                "HOUSE PHOTO FROM OUTSIDE ALONG WITH CUSTOMER SELFIE", 
                "EXISTING LOAN DETAILS", 
                "LOAN TYPE", 
                "EXISTING MONTHLY EMI", 
                "EXISTING OUTSTANDING LOAN", 
                "LOAN TYPE 2", 
                "EXISTING MONTHLY EMI 2", 
                "EXISTING OUTSTANDING LOAN 2", 
                "LOAN REQUIREMENT DETAILS", 
                "LOAN AMOUNT DEMAND BY CUSTOMER", 
                "END USE OF LOAN", 
                "IF CATTLE PURCHASE THEN NUMBER TO BE PURCHASED", 
                "EMI COMFORT AMOUNT", 
                "EXPECTED LOAN TENURE IN MONTHS", 
                "REFERENCE DETAILS", 
                "REFERENCE / NEIGHBOUR NAME - 1", 
                "REFERENCE / NEIGHBOUR RELATION WITH APPLICANT", 
                "REFERENCE / NEIGHBOUR ADDRESS", 
                "REFERENCE / NEIGHBOUR MOBILE NUMBER", 
                "REFERENCE / NEIGHBOUR NAME - 2", 
                "REFERENCE / NEIGHBOUR RELATION WITH APPLICANT - 2", 
                "REFERENCE / NEIGHBOUR ADDRESS - 2", 
                "REFERENCE / NEIGHBOUR MOBILE NUMBER - 2", 
                "OVERALL NEIGHBOUR FEEDBACK", 
                "GEO PHOTO WITH OTHER SOURCE", 
                "NET MONTHLY INCOME", 
                "ESTIMATED ELIGIBLE LOAN AMOUNT", 
                "FINAL DECISION", 
                "FINAL REMARKS", 
                "HO CREDIT DESK"
      
        ];
        rows.push(headers);
    }
    const ldIndex = headers.indexOf('LD');
    if (ldIndex === -1) {
        throw new Error('LD field not found in the sheet.');
    }
    const existingRowIndex = rows.slice(1).findIndex(row => row[ldIndex] === data.LD);
    const dataMappings = {
            'LD': 'LD',
            'CUSTOMER NAME': 'customerName',
            'EMPLOYEE EMAIL ID': 'employeeEmailId',
            'BRANCH NAME': 'branchName',
            'CUSTOMER FATHER NAME': 'customerFatherName',
            'CUSTOMER MOTHER NAME': 'customerMotherName',
            'CUSTOMER SPOUSE/WIFE NAME': 'customerSpouseWifeName',
            'CUSTOMER DATE OF BIRTH (DOB)': 'customerDob',
            'CUSTOMER HIGHER EDUCATION': 'customerHigherEducation',
            'CUSTOMER MOBILE NUMBER': 'customerMobileNumber',
            'CUSTOMER MARRIAGE STATUS': 'customerMarriageStatus',
            'NUMBER OF DEPENDANT ON CUSTOMERS': 'numberOfDependantOnCustomers',
            'CUSTOMER PHOTO': 'customerPhoto',
            'CUSTOMER KYC PHOTO': 'customerKycPhoto',
            'CO-APPLICANT NAME': 'coApplicantName',
            'CO-APPLICANT FATHER NAME': 'coApplicantFatherName',
            'CO-APPLICANT MOTHER NAME': 'coApplicantMotherName',
            'CO-APPLICANT SPOUSE/WIFE NAME': 'coApplicantSpouseWifeName',
            'CO-APPLICANT RELATION WITH APPLICANT': 'coApplicantRelationWithApplicant',
            'CO-APPLICANT DATE OF BIRTH (DOB)': 'coApplicantDob',
            'CO-APPLICANT TYPE (MALE/FEMALE)': 'coApplicantType',
            'CO-APPLICANT HIGHER EDUCATION': 'coApplicantHigherEducation',
            'CO-APPLICANT MOBILE NUMBER': 'coApplicantMobileNumber',
            'CO-APPLICANT MARRIAGE STATUS': 'coApplicantMarriageStatus',
            'CO-APPLICANT PHOTO': 'coApplicantPhoto',
            'ADDITIONAL CO-APPLICANT DETAILS': 'additionalCoApplicantDetails',
            'CO-APPLICANT 2 NAME': 'coApplicant2Name',
            'CO-APPLICANT 2 FATHER NAME': 'coApplicant2FatherName',
            'CO-APPLICANT 2 MOTHER NAME': 'coApplicant2MotherName',
            'CO-APPLICANT 2 SPOUSE/WIFE NAME': 'coApplicant2SpouseWifeName',
            'CO-APPLICANT 2 RELATION WITH APPLICANT': 'coApplicant2RelationWithApplicant',
            'CO-APPLICANT 2 DATE OF BIRTH (DOB)': 'coApplicant2Dob',
            'CO-APPLICANT 2 TYPE (MALE/FEMALE)': 'coApplicant2Type',
            'CO-APPLICANT 2 HIGHER EDUCATION': 'coApplicant2HigherEducation',
            'CO-APPLICANT 2 MOBILE NUMBER': 'coApplicant2MobileNumber',
            'ADDRESS AS PER AADHAR COPY': 'addressAsPerAadharCopy',
            'CO-APPLICANT 2 MARRIAGE STATUS': 'coApplicant2MarriageStatus',
            'CO-APPLICANT 2 PAN NUMBER': 'coApplicant2PanNumber',
            'CO-APPLICANT 2 AADHAR NUMBER': 'coApplicant2AadharNumber',
            'CO-APPLICANT 2 DRIVING LICENCE NUMBER': 'coApplicant2DrivingLicenceNumber',
            'CO-APPLICANT 2 VOTER ID NUMBER': 'coApplicant2VoterIdNumber',
            'CO-APPLICANT 2 PHOTO': 'coApplicant2Photo',
            'CO-APPLICANT 2 KYC PHOTO': 'coApplicant2KycPhoto',
            'GUARANTOR DETAILS': 'guarantorDetails',
            'GUARANTOR NAME': 'guarantorName',
            'GUARANTOR FATHER NAME': 'guarantorFatherName',
            'GUARANTOR MOTHER NAME': 'guarantorMotherName',
            'GUARANTOR SPOUSE/WIFE NAME': 'guarantorSpouseWifeName',
            'GUARANTOR RELATION WITH APPLICANT': 'guarantorRelationWithApplicant',
            'GUARANTOR TYPE (MALE/FEMALE)': 'guarantorType',
            'GUARANTOR DATE OF BIRTH (DOB)': 'guarantorDob',
            'GUARANTOR HIGHER EDUCATION': 'guarantorHigherEducation',
            'GUARANTOR MOBILE NUMBER': 'guarantorMobileNumber',
            'GUARANTOR MARRIAGE STATUS': 'guarantorMarriageStatus',
            'GUARANTOR PAN NUMBER': 'guarantorPanNumber',
            'GUARANTOR AADHAR NUMBER': 'guarantorAadharNumber',
            'GUARANTOR VOTER ID NUMBER': 'guarantorVoterIdNumber',
            'GUARANTOR DRIVING LICENCE NUMBER': 'guarantorDrivingLicenceNumber',
            'GUARANTOR PHOTO': 'guarantorPhoto',
            'GUARANTOR KYC PHOTO': 'guarantorKycPhoto',
            'AGRI LAND DETAILS': 'agriLandDetails',
            'NAME OF AGRI OWNER': 'nameOfAgriOwner',
            'AGRI OWNER RELATION WITH APPLICANT': 'agriOwnerRelationWithApplicant',
            'AGRI LAND IN BIGHA': 'agriLandInBigha',
            'AGRI LAND SURVEY / KHASRA NUMBER': 'agriLandSurveyKhasraNumber',
            'VILLAGE NAME': 'villageName',
            'WHICH CROP IS PLANTED': 'whichCropIsPlanted',
            'HOW MUCH IN RUPEES SOLD FOR LAST CROP': 'howMuchSoldForLastCrop',
            'FERTILIZER SHOP ONWER NAME': 'fertilizerShopOwnerName',
            'FERTILIZER SHOP OWNER CONTACT NUMBER': 'fertilizerShopOwnerContactNumber',
            'AGRI LAND PAVATI': 'agriLandPavati',
            'INCOME FROM DAIRY BUSINESS': 'incomeFromDairyBusiness',
            'NUMBER OF CATTLE AVAILABLE': 'numberOfCattleAvailable',
            'NUMBER OF MILK GIVING CATTLES': 'numberOfMilkGivingCattles',
            'TOTAL MILK SUPPLY PER DAY': 'totalMilkSupplyPerDay',
            'NAME OF DAIRY OWNER': 'nameOfDairyOwner',
            'MOBILE NUMBER OF DAIRY OWNER': 'mobileNumberOfDairyOwner',
            'MILK SUPPLYING FROM SINCE YEAR': 'milkSupplyingFromSinceYear',
            'MONTHLY EXPENSES ON MILK BUSINESS': 'monthlyExpensesOnMilkBusiness',
            'MONTHLY INCOME FROM MILK BUSINESS': 'monthlyIncomeFromMilkBusiness',
            'MILK BOOK DIARY PHOTO': 'milkBookDiaryPhoto',
            'CATTLE PHOTO': 'cattlePhoto',
            'OTHER SOURCE OF INCOME': 'otherSourceOfIncome',
            'BUSINESS NAME': 'businessName',
            'BUSINESS OWNER NAME': 'businessOwnerName',
            'RELATION WITH APPLICANT': 'relationWithApplicant',
            'NATURE OF BUSINESS': 'natureOfBusiness',
            'BUSINESS BOARD SEEN': 'businessBoardSeen',
            'BUSINESS DOING FROM NUMBER OF YEARS': 'businessDoingFromNumberOfYears',
            "BUSINESS MONTHLY INCOME":"", 
                "SHOP PHOTO ALONG WITH CUSTOMER AND SUPPORTINGS":"", 
                "SALARY INCOME":"", 
                "SALARY EARNING MEMBER NAME":"", 
                "SALARY - RELATION WITH APPLICANT":"", 
                "SALARY INCOME FROM":"", 
                "ADDRESS OF SALARY PROVIDER":"", 
                "MOBILE NUMBER OF SALARY PROVIDER":"", 
                "DOING FROM NUMBER OF YEARS":"", 
                "SALARY PAID THROUGH":"", 
                "MONTHLY SALARY":"", 
                "SALARY CERTIFICATE / DECLARATION LETTER":"", 
                "PROPERTY DETAILS":"", 
                "NAME OF PROPERTY OWNER":"", 
                "RELATION WITH APPLICANT":"", 
                "RESIDENCE TYPE":"", 
                "AREA OF CONSTRUCTION IN SQ FT":"", 
                "HOUSE CONSTRUCTION STATUS":"", 
                "NUMBER OF ROOMS":"", 
                "COMPLETE CONSTRUCTION DETAILS":"", 
                "EAST BOUNDARY":"", 
                "WEST BOUNDARY":"", 
                "NORTH BOUNDARY":"", 
                "SOUTH BOUNDARY":"", 
                "PATTA AVAILABLE WITH CUSTOMER":"", 
                "FOUR BOUNDARIES MATCHING WITH PATTA/PROPERTY DOCS":"", 
                "AGE OF HOUSE":"", 
                "LANDMARK":"", 
                "ASSETS SEEN AT RESIDENCE":"", 
                "EAST BOUNDARY":"", 
                "WEST BOUNDARY":"", 
                "NORTH BOUNDARY":"", 
                "SOUTH BOUNDARY":"", 
                "PROPERTY DOCS PHOTO":"", 
                "OVERALL HOUSE PHOTO":"", 
                "HOUSE PHOTO FROM OUTSIDE ALONG WITH CUSTOMER SELFIE":"", 
                "EXISTING LOAN DETAILS":"", 
                "LOAN TYPE":"", 
                "EXISTING MONTHLY EMI":"", 
                "EXISTING OUTSTANDING LOAN":"", 
                "LOAN TYPE 2":"", 
                "EXISTING MONTHLY EMI 2":"", 
                "EXISTING OUTSTANDING LOAN 2":"", 
                "LOAN REQUIREMENT DETAILS":"", 
                "LOAN AMOUNT DEMAND BY CUSTOMER":"", 
                "END USE OF LOAN":"", 
                "IF CATTLE PURCHASE THEN NUMBER TO BE PURCHASED":"", 
                "EMI COMFORT AMOUNT":"", 
                "EXPECTED LOAN TENURE IN MONTHS":"", 
                "REFERENCE DETAILS":"", 
                "REFERENCE / NEIGHBOUR NAME - 1":"", 
                "REFERENCE / NEIGHBOUR RELATION WITH APPLICANT":"", 
                "REFERENCE / NEIGHBOUR ADDRESS":"", 
                "REFERENCE / NEIGHBOUR MOBILE NUMBER":"", 
                "REFERENCE / NEIGHBOUR NAME - 2":"", 
                "REFERENCE / NEIGHBOUR RELATION WITH APPLICANT - 2":"", 
                "REFERENCE / NEIGHBOUR ADDRESS - 2":"", 
                "REFERENCE / NEIGHBOUR MOBILE NUMBER - 2":"", 
                "OVERALL NEIGHBOUR FEEDBACK":"", 
                "GEO PHOTO WITH OTHER SOURCE":"", 
                "NET MONTHLY INCOME":"", 
                "ESTIMATED ELIGIBLE LOAN AMOUNT":"", 
                "FINAL DECISION":"", 
                "FINAL REMARKS":"", 
                "HO CREDIT DESK":""
    };
    let rowToUpdate = Array(headers.length).fill('');
    headers.forEach((header, index) => {
        if (dataMappings[header]) {
            let value = data[dataMappings[header]] || '';
            rowToUpdate[index] = value;
        }
    });
    if (existingRowIndex === -1) {
        rows.push(rowToUpdate); // Insert new row
    } else {
        rows[existingRowIndex + 1] = rowToUpdate; // Update existing row
    }
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

async function sentForSanctionKycSheet(data) {
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    const spreadsheetId = process.env.FINAL_APPROVAL_SHEET;
    const sheetName = process.env.SENT_FOR_SANCTION;

    console.time("Google Sheet Update");
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:O`,
    });
    console.timeEnd("Google Sheet Update");

    let rows = response.data.values || [];
    let headers = rows.length > 0 ? rows[0] : [];

    // Define headers if the sheet is empty
    if (rows.length === 0) {
        headers = [
            "LD",
            "CUSTOMER NAME",
            "PARTNER NAME",
            "CASE TYPE",
            "BRANCH NAME",
            "FATHER NAME",
            "CONTACT NO.",
            "LOAN AMOUNT",
            "LOAN AMOUNT IN WORDS",
            "PRINCIPAL AMOUNT",
            "INTEREST AMOUNT",
            "TOTAL AMOUNT",
            "ROI",
            "TENURE",
            "EMI AMOUNT"
        ];
        rows.push(headers);
    }

    const ldIndex = headers.indexOf('LD');
    if (ldIndex === -1) {
        throw new Error('LD field not found in the sheet.');
    }

    const existingRowIndex = rows.slice(1).findIndex(row => row[ldIndex] === data.LD);

    // Data mappings between headers and incoming JSON fields
    const dataMappings = {
        'LD': 'LD',
        'CUSTOMER NAME': 'customerName',
        'PARTNER NAME': 'partnerName',
        'CASE TYPE': 'caseType',
        'BRANCH NAME': 'branchName',
        'FATHER NAME': 'fatherName',
        'CONTACT NO.': 'contactNo',
        'LOAN AMOUNT': 'loanAmount',
        'LOAN AMOUNT IN WORDS': 'loanAmountInWords',
        'PRINCIPAL AMOUNT': 'principalAmount',
        'INTEREST AMOUNT': 'interestAmount',
        'TOTAL AMOUNT': 'totalAmount',
        'ROI': 'roi',
        'TENURE': 'tenure',
        'EMI AMOUNT': 'emiAmount'
    };

    let rowToUpdate = Array(headers.length).fill('');

    // Map values from incoming data to the correct headers
    headers.forEach((header, index) => {
        if (dataMappings[header]) {
            let value = data[dataMappings[header]] || '';
            rowToUpdate[index] = value;
        }
    });

    if (existingRowIndex === -1) {
        rows.push(rowToUpdate); // Insert new row
    } else {
        rows[existingRowIndex + 1] = rowToUpdate; // Update existing row
    }

    // Update the Google Sheet with the new or updated data
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


async function postDisbursementKycSheet(data) {
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    const spreadsheetId = process.env.FINAL_APPROVAL_SHEET;
    const sheetName = process.env.POST_DISBURSEMENT;

    console.time("Google Sheet Update");
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:M`,
    });
    console.timeEnd("Google Sheet Update");

    let rows = response.data.values || [];
    let headers = rows.length > 0 ? rows[0] : [];

    // Define headers if the sheet is empty
    if (rows.length === 0) {
        headers = [
            "LD",
            "CUSTOMER NAME",
            "FATHER NAME",
            "LOAN NUMBER",
            "ACTUAL PRE EMI",
            "DATE OF DISBURSEMENT",
            "DATE OF FIRST EMI",
            "UTR NUMBER-1",
            "UTR NUMBER-2",
            "DISBURSEMENT DONE BY"
        ];
        rows.push(headers);
    }

    const ldIndex = headers.indexOf('LD');
    if (ldIndex === -1) {
        throw new Error('LD field not found in the sheet.');
    }

    const existingRowIndex = rows.slice(1).findIndex(row => row[ldIndex] === data.LD);

    // Data mappings between headers and incoming JSON fields
    const dataMappings = {
        'LD': 'LD',
        'CUSTOMER NAME': 'customerName',
        'FATHER NAME': 'fatherName',
        'LOAN NUMBER': 'loanNumber',
        'ACTUAL PRE EMI': 'actualPreEmi',
        'DATE OF DISBURSEMENT': 'dateOfDisbursement',
        'DATE OF FIRST EMI': 'dateOfFirstEmi',
        'UTR NUMBER-1': 'utrNumber1',
        'UTR NUMBER-2': 'utrNumber2',
        'DISBURSEMENT DONE BY': 'disbursementDoneBy'
    };

    let rowToUpdate = Array(headers.length).fill('');

    // Map values from incoming data to the correct headers
    headers.forEach((header, index) => {
        if (dataMappings[header]) {
            let value = data[dataMappings[header]] || '';
            rowToUpdate[index] = value;
        }
    });

    if (existingRowIndex === -1) {
        rows.push(rowToUpdate); // Insert new row
    } else {
        rows[existingRowIndex + 1] = rowToUpdate; // Update existing row
    }

    // Update the Google Sheet with the new or updated data
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


async function sentForDisbursementKycSheet(data) {
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    const spreadsheetId = process.env.FINAL_APPROVAL_SHEET;
    const sheetName = process.env.SENT_FOR_DISBURSEMENT;

    console.time("Google Sheet Update");
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:O`,
    });
    console.timeEnd("Google Sheet Update");

    let rows = response.data.values || [];
    let headers = rows.length > 0 ? rows[0] : [];

    // Define headers if the sheet is empty
    if (rows.length === 0) {
        headers = [
            "LD",
            "CUSTOMER NAME",
            "FATHER NAME",
            "CONTACT NO.",
            "BRANCH NAME",
            "PARTNER NAME",
            "LOAN NUMBER",
            "LOAN AMOUNT",
            "EMI AMOUNT",
            "ROI",
            "PROCESSING FEES",
            "DOCUMENTS CHARGES",
            "CERSAI CHARGES",
            "PRE EMI INTEREST",
            "NET DISBURSEMENT AMOUNT"
        ];
        rows.push(headers);
    }

    const ldIndex = headers.indexOf('LD');
    if (ldIndex === -1) {
        throw new Error('LD field not found in the sheet.');
    }

    const existingRowIndex = rows.slice(1).findIndex(row => row[ldIndex] === data.LD);

    // Data mappings between headers and incoming JSON fields
    const dataMappings = {
        'LD': 'LD',
        'CUSTOMER NAME': 'customerName',
        'FATHER NAME': 'fatherName',
        'CONTACT NO.': 'contactNo',
        'BRANCH NAME': 'branchName',
        'PARTNER NAME': 'partnerName',
        'LOAN NUMBER': 'loanNumber',
        'LOAN AMOUNT': 'loanAmount',
        'EMI AMOUNT': 'emiAmount',
        'ROI': 'roi',
        'PROCESSING FEES': 'processingFees',
        'DOCUMENTS CHARGES': 'documentsCharges',
        'CERSAI CHARGES': 'cersaiCharges',
        'PRE EMI INTEREST': 'preEmiInterest',
        'NET DISBURSEMENT AMOUNT': 'netDisbursementAmount'
    };

    let rowToUpdate = Array(headers.length).fill('');

    // Map values from incoming data to the correct headers
    headers.forEach((header, index) => {
        if (dataMappings[header]) {
            let value = data[dataMappings[header]] || '';
            rowToUpdate[index] = value;
        }
    });

    if (existingRowIndex === -1) {
        rows.push(rowToUpdate); // Insert new row
    } else {
        rows[existingRowIndex + 1] = rowToUpdate; // Update existing row
    }

    // Update the Google Sheet with the new or updated data
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


  module.exports = {
    applicantKycSheet,
    coApplicantKycSheet,
    gtrKycSheet,
    electricityBillSheet,
    samagraIdKycSheet,
    udhyamKycSheet,
    bankStatementKycSheet,
    propertyPaperKycSheet,
    appPdcSheet,
    coAppPdcSheet,
    technicalReportKycSheet,
    taggingKycSheet,
    rcuKycSheet,
    cibilReportKycSheet,
    jainamKycSheet,
    pdReportKycSheet,
    sentForSanctionKycSheet,
    postDisbursementKycSheet,
    sentForDisbursementKycSheet
  }