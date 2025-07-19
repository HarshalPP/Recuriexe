
const {
    serverValidation,
    success,
    notFound,
    badRequest,
    unknownError } = require('../../../../globalHelper/response.globalHelper');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { validationResult } = require('express-validator');
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
 const credentials = require('../../../../credential.json');
const liveCredentials = require('../../../../liveSheet.json');
const employeModel = require('../model/adminMaster/employe.model')
const posCloserModel = require('../model/collection/posCloser.model')
const baseUrl = process.env.BASE_URL;
const axios = require('axios')
const xlsx = require('xlsx');
const moment = require('moment');



async function posCloserApi(req, res) {
    try {
        // Validate request body for errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        // Check if the employee exists and is active
        const employeeData = await employeModel.findOne({ _id: req.Id, status: "active" });
        if (!employeeData) {
            return notFound(res, "Employee not found", []);
        }
        
        const name = employeeData.employeName + `-`  + employeeData.employeUniqueId;
        const {
            LD, customerName , mobileNo , amountToBeReceivedFromCustomer , dateOfDeposit
        } = req.body;

        // Create a new KYC form record in the applicantKycModel
        const posCloserDetail = await posCloserModel.create({
          ...req.body,
          posCloserBy:name, 
      });
        // Send a success response with the newly created KYC form data
        success(res, "Pos Closer Form Submitted Successfully", posCloserDetail);
        
    } catch (error) {
        console.error(error);
        unknownError(res, error); 
    }
}

async function getCloserDetailByLD(req, res) {
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
     
      const CloserDetail = await posCloserModel.find({LD: LD});
  
      if (!CloserDetail || CloserDetail.length === 0) {
        return success(res, "No Record", CloserDetail);
      }
      
      success(res, `Closer Detail For ${LD}`, CloserDetail);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  }

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
  
async function getposCloserDetail(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return serverValidation(res, {
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      const {status} = req.query;
      const employeeData = await employeModel.findOne({ _id: req.Id, status: "active" });
      if (!employeeData) {
          return notFound(res, "Employee not found", []);
      }
      const closerDetail = await posCloserModel.find({status:status}).sort({ createdAt: -1 });;
   
     // Fetch data from Google Sheet
    const googleSheetData = await getGoogleSheetData();

    // Cross-reference data using LD number
    const matchedData = closerDetail.map((detail) => {
      const matchedSheetData = googleSheetData.find(
        (sheetRow) => sheetRow['LD'] === detail.LD
      );
      return matchedSheetData ? { ...detail.toObject(), ...matchedSheetData } : null;
    }).filter(Boolean); // Filter out null values

    if (matchedData.length === 0) {
      return success(res, 'No matching data found in Google Sheet', []);
    }
      success(res, `Pos Closer Detail List For ${status}`, matchedData);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  }


  async function posCloserUpdate(req, res) {
    try {
      // Validate request input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return serverValidation(res, {
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
  
      const {closerId , status ,settlementAmountByApproval} = req.body;
  
      // Find active employee
      const employeeData = await employeModel.findOne({ _id: req.Id, status: "active" });
      if (!employeeData) {
        return notFound(res, "Employee not found", []);
      }
  
      // Find the posCloser entry by closerId
      const closerDetail = await posCloserModel.findById({ _id: new ObjectId(closerId) });
      if (!closerDetail) {
        return badRequest(res, "closerId not found.");
      }
  
      // Handle 'reject' status
      if (status === "reject") {
        closerDetail.status = status;
        // closerDetail.reason = reason;
        const detail = await closerDetail.save();
        return success(res, "Pos Closer rejected successfully.", detail);
      }
  
      // Data from posCloser
      const keyMapping = {
        LD: 'LD',
        customerName: 'CUSTOMER NAME',
        posCloserBy: 'POS CLOSER BY',
        amountToBeReceivedFromCustomer: 'AMOUNT TO BE RECEIVED FROM CUSTOMER',
        dateOfDeposit: 'DATE OF DEPOSIT',
        settlementForReason: 'SETTLEMENT FOR REASON',
        settlementAmountByApproval: 'SETTLEMENT AMOUNT BY APPROVAL',
      };
  
      const {
        LD, customerName, posCloserBy, amountToBeReceivedFromCustomer, dateOfDeposit, settlementForReason,
      } = closerDetail;
  
      // Initialize Google Sheets API
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      const authClient = await auth.getClient();
      const sheets = google.sheets({ version: 'v4', auth: authClient });
  
      const spreadsheetId = process.env.VISIT_GOOGLE_SHEET_KEY;
      const sheetName = process.env.POS_CLOSER_DETAILS_SHEET;
  
      // Fetch the existing data from Google Sheets
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: sheetName,
      });
  
      let rows = response.data.values || [];
      let headers = rows.length > 0 ? rows[0] : [];
  
      if (rows.length === 0) {
        // Initialize headers if sheet is empty
        headers = ['LD', 'CUSTOMER NAME', 'POS CLOSER BY', 'AMOUNT TO BE RECEIVED FROM CUSTOMER', 'DATE OF DEPOSIT', 'SETTLEMENT FOR REASON', 'SETTLEMENT AMOUNT BY APPROVAL'];
        rows.push(headers);
      }
  
      const data = rows.slice(1);
      const ldIndex = headers.indexOf('LD');
      const customerNameIndex = headers.indexOf('CUSTOMER NAME');
  
      if (ldIndex === -1 || customerNameIndex === -1) {
        return badRequest(res, 'LD or CUSTOMER NAME field not found in the sheet.');
      }
  
      // Check if the LD and CUSTOMER NAME already exist
      const rowIndex = data.findIndex(row => row[ldIndex] === LD && row[customerNameIndex] === customerName);
  
      if (rowIndex === -1) {
        // If not found, create a new row
        let newRow = Array(headers.length).fill('');
        newRow[ldIndex] = LD;
        newRow[customerNameIndex] = customerName;
  
        headers.forEach((header, index) => {
          const internalKey = Object.keys(keyMapping).find(key => keyMapping[key] === header);
          if (internalKey && closerDetail[internalKey] !== undefined) {
            newRow[index] = closerDetail[internalKey];
          }
        });
        newRow[headers.indexOf('SETTLEMENT AMOUNT BY APPROVAL')] = settlementAmountByApproval; // Include settlementAmountByApproval

        data.push(newRow);
        rows.push(newRow);
  
        // Update Google Sheets with the new data
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetName}!A1`,
          valueInputOption: 'RAW',
          resource: {
            values: [headers, ...data],
          },
        });
  
        // Update the status in MongoDB
        closerDetail.status = status;
        closerDetail.settlementAmountByApproval = settlementAmountByApproval;
        await closerDetail.save();
  
        return success(res, "Pos Closer accepted successfully.", closerDetail);
  
      } else {
        // If found, update the existing row
        let updateMapping = {
          'POS CLOSER BY': posCloserBy,
          'AMOUNT TO BE RECEIVED FROM CUSTOMER': amountToBeReceivedFromCustomer,
          'DATE OF DEPOSIT': dateOfDeposit,
          'SETTLEMENT FOR REASON': settlementForReason,
          'SETTLEMENT AMOUNT BY APPROVAL':settlementAmountByApproval
        };
  
        headers.forEach((header, index) => {
          if (updateMapping[header] !== undefined) {
            data[rowIndex][index] = updateMapping[header];
          }
        });
  
        // Update Google Sheets with the updated data
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetName}!A1`,
          valueInputOption: 'RAW',
          resource: {
            values: [headers, ...data],
          },
        });
  
        // Update the status in MongoDB
        closerDetail.status = status;
        closerDetail.settlementAmountByApproval = settlementAmountByApproval;
        await closerDetail.save();
  
        return success(res, "Pos Closer accepted successfully.", closerDetail);
      }
  
    } catch (error) {
      console.log(error);
      return unknownError(res, error);
    }
  }
  


module.exports = {
    posCloserApi ,
    getCloserDetailByLD,
    getposCloserDetail,
    posCloserUpdate
}
