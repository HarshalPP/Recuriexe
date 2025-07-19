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
const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
 const credentials = require('../../../../../credential.json');
const modeOfCollectionModel = require('../../model/adminMaster/modeOfCollection.model')
const employeModel = require('../../model/adminMaster/employe.model')
const branchModel = require("../../model/adminMaster/newBranch.model")
const collectionModel = require('../../model/collection/collectionSheet.model')
const okcreditModel = require('../../model/adminMaster/okCredit.model')
const bankNameModel = require('../../model/adminMaster/bank.model')
const visitModel = require('../../model/collection/visit.model')
const lenderModel = require('../../model/lender.model')
const legalNoticeModel = require('../../model/adminMaster/legalNotice.model')
const emiCallTrackingModel = require('../../model/collection/callDone.model');
const roleModel = require('../../model/adminMaster/role.model')
const baseUrl = process.env.BASE_URL;

const axios = require('axios')
const xlsx = require('xlsx');
const moment = require('moment');



// --------------Data Get From CRM PERSON overAllEmiData Google Sheet Get Api--------------------------
// Function to parse 24-hour time string and create a Date object for comparison
function parseTimeToToday(timeStr) {
    if (!timeStr) return null;
  
    const [hours, minutes] = timeStr.split(':').map(Number); // Split and parse the time string
    if (isNaN(hours) || isNaN(minutes)) {
      console.error("Invalid time format:", timeStr);
      return null;
    }
  
    const today = new Date(); // Current date
    today.setHours(hours, minutes, 0, 0); // Set the time to the given hours and minutes in 24-hour format
  
    return today;
  }
  
  // Function to check if reCallTime is less than the current time (24-hour format)
  function isReCallTimeLessThanCurrent(reCallTimeStr) {
    const reCallTime = parseTimeToToday(reCallTimeStr); // Parse reCallTime string
    const currentTime = new Date(); // Get current time
    const istOffset = 5 * 60 * 60 * 1000 + 30 * 60 * 1000; // IST is UTC + 5:30
    const istTime = new Date(currentTime.getTime() + istOffset);
    if (!reCallTime) return false; // Handle invalid reCallTime case
  
    // Compare using getTime()
    return reCallTime.getTime() < istTime.getTime();
  }
  
  // Function to check if reCallTime is greater than the current time (24-hour format)
  function isReCallTimeGreaterThanCurrent(reCallTimeStr) {
    const reCallTime = parseTimeToToday(reCallTimeStr); // Parse reCallTime string

    const currentTime = new Date(); // Get current time
    const istOffset = 5 * 60 * 60 * 1000 + 30 * 60 * 1000; // IST is UTC + 5:30
const istTime = new Date(currentTime.getTime() + istOffset);
    if (!reCallTime) return false; // Handle invalid reCallTime case
  
    // Compare using getTime()
    return reCallTime.getTime() > istTime.getTime();
  }
  

  async function getCrmPersonGoogleSheet(req, res) {
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
  
      const { status } = req.query; // Get the status from query ('pending' or 'done')
      if (!status || !['pending', 'done'].includes(status)) {
        return badRequest(res, "Invalid status. Must be 'pending' or 'done'.");
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
          obj[header] = row[index];
        });
        return obj;
      });
  
      // Filter the data to include only rows where 'CRM PERSON' matches employeUniqueId and 'NET DUE' is not zero
      const filteredData = data.filter(row =>
        row["CRM PERSON"] && row["CRM PERSON"].match(new RegExp(employeUniqueId, 'i')) &&
        row['NET DUE'] && parseFloat(row['NET DUE']) !== 0
      );
  
      if (filteredData.length === 0) {
        return notFound(res, 'No relevant data found.', []);
      }
  
      // Get the LD numbers from filteredData
      const ldNumbers = filteredData.map(row => row['LD']);
  
      // Fetch the latest LD numbers from emiCallTrackingModel sorted by reCallDate and reCallTime
      const callDoneRecords = await emiCallTrackingModel.aggregate([
        {
          $match: { LD: { $in: ldNumbers } , crmType: "HO" }
        },
        {
          $sort: { createdAt: -1} // Sort by reCallDate and reCallTime in descending order
        },
        {
          $group: {
            _id: "$LD", // Group by LD
            latestRecord: { $first: "$$ROOT" } // Get the first (latest) record for each LD
          }
        }
      ]);
      // console.log('done',callDoneRecords);
      
  
      // Get the current date
      const currentDate = new Date();
      const currentDateString = currentDate.toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
  
      let finalData;
      if (status === 'done') {
        finalData = filteredData.filter(row => {
          const doneRecord = callDoneRecords.find(record => record._id === row['LD']);
          if (doneRecord) {
            const reCallDate = new Date(doneRecord.latestRecord.reCallDate);
            const reCallTimeStr = doneRecord.latestRecord.reCallTime;
  
            // Check if reCallDate is greater than current date or same date but greater time
            const isDateGreater = reCallDate > currentDate;
             const isTimeValid = reCallDate.toDateString() === currentDate.toDateString() && isReCallTimeGreaterThanCurrent(reCallTimeStr);
  
            return isDateGreater ||  isTimeValid;
          }
          return false;
        });
      } else if (status === 'pending') {
        finalData = filteredData.filter(row => {
          const doneRecord = callDoneRecords.find(record => record._id === row['LD']);
          if (doneRecord) {
            const reCallDate = new Date(doneRecord.latestRecord.reCallDate);
            const reCallDateString = reCallDate.toISOString().split('T')[0]; // Get only the date part
            const reCallTimeStr = doneRecord.latestRecord.reCallTime;
  
            // Check if the reCallDate is less than the current date
            const isDateLess = reCallDateString < currentDateString;
             const isTimeLess = reCallDate.toDateString() === currentDate.toDateString() && isReCallTimeLessThanCurrent(reCallTimeStr);
  
            return isDateLess || isTimeLess;
          }
          return true; // Mark as 'pending' if no record found
        });
      }
  
      success(res, `Call HO Details : ${status}`, finalData);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  }
  
  
  
async function getCrmBranchGoogleSheet(req, res) {
    try {
      const tokenId = new ObjectId(req.Id);
      console.log("tokenId", tokenId);
  
      // Find employee by token ID
      const employeeData = await employeModel.findById({ _id: tokenId });
      if (!employeeData) {
        return notFound(res, "Employee not found", []);
      }
  
      const employeUniqueId = employeeData.employeUniqueId;
      if (!employeUniqueId) {
        return notFound(res, "Employee unique ID not found", []);
      }
  
      const { status } = req.query; // Get the status from query ('pending' or 'done')
      if (!status || !['pending', 'done'].includes(status)) {
        return badRequest(res, "Invalid status. Must be 'pending' or 'done'.");
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
          obj[header] = row[index];
        });
        return obj;
      });
  
      // Filter the data to include only rows where 'CRM PERSON' matches employeUniqueId and 'NET DUE' is not zero
      const filteredData = data.filter(row =>
        row["CRM BRANCH"] && row["CRM BRANCH"].match(new RegExp(employeUniqueId, 'i')) &&
        row['NET DUE'] && parseFloat(row['NET DUE']) !== 0
      );
  
      if (filteredData.length === 0) {
        return notFound(res, 'No relevant data found.', []);
      }
  
      // Get the LD numbers from filteredData
      const ldNumbers = filteredData.map(row => row['LD']);
  
      // Fetch the latest LD numbers from emiCallTrackingModel sorted by reCallDate and reCallTime
      const callDoneRecords = await emiCallTrackingModel.aggregate([
        {
          $match: { LD: { $in: ldNumbers } , crmType: "BRANCH" }
        },
        {
          $sort: { createdAt: -1} // Sort by reCallDate and reCallTime in descending order
        },
        {
          $group: {
            _id: "$LD", // Group by LD
            latestRecord: { $first: "$$ROOT" } // Get the first (latest) record for each LD
          }
        }
      ]);
      // console.log('done',callDoneRecords);
      
  
      // Get the current date
      const currentDate = new Date();
      const currentDateString = currentDate.toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
  
      let finalData;
      if (status === 'done') {
        finalData = filteredData.filter(row => {
          const doneRecord = callDoneRecords.find(record => record._id === row['LD']);
          if (doneRecord) {
            const reCallDate = new Date(doneRecord.latestRecord.reCallDate);
            const reCallTimeStr = doneRecord.latestRecord.reCallTime;
              //  console.log("data",reCallTimeStr);
              //  console.log("reCallDate",reCallDate);
            // Check if reCallDate is greater than current date or same date but greater time
            const isDateGreater = reCallDate > currentDate;
            const isTimeValid = reCallDate.toDateString() === currentDate.toDateString() && isReCallTimeGreaterThanCurrent(reCallTimeStr);
  
            return isDateGreater || isTimeValid ;
          }
          return false;
        });
      } else if (status === 'pending') {
        finalData = filteredData.filter(row => {
          const doneRecord = callDoneRecords.find(record => record._id === row['LD']);
          if (doneRecord) {
            const reCallDate = new Date(doneRecord.latestRecord.reCallDate);
            const reCallDateString = reCallDate.toISOString().split('T')[0]; // Get only the date part
            const reCallTimeStr = doneRecord.latestRecord.reCallTime;
  
            // Check if the reCallDate is less than the current date
            const isDateLess = reCallDateString < currentDateString;
            const isTimeLess = reCallDate.toDateString() === currentDate.toDateString() && isReCallTimeLessThanCurrent(reCallTimeStr);
  
            return isDateLess || isTimeLess;
          }
          return true; // Mark as 'pending' if no record found
        });
      }
  
      success(res, `Call Branch Details : ${status}`, finalData);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  }
  
  // --------------CRM Person HO  Form Fill Add------------------------------
  async function crmFormAdd(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return serverValidation(res, {
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
  
      // Fetch the employee details
      const tokenId = new ObjectId(req.Id);
      const employeUniqueDetail = await employeModel.findById({ _id: tokenId });
  
      // Construct the name to be saved in callBy
      const name = employeUniqueDetail.employeName + `-`  + employeUniqueDetail.employeUniqueId;
      const crm = "HO"  
      const keyMapping = {
        LD: 'LD',
        customerName: 'CUSTOMER NAME',
        callBy: 'CALL BY',
        date: 'DATE',
        callStatus: 'CALL STATUS',
        callRemark: 'CALL REMARK',
        reCallDate: 'RE CALL DATE',
        customerResponse: 'CUSTOMER RESPONSE',
        paymentAmount: 'PAYMENT AMOUNT',
        reasonForNotPay: 'REASON FOR NOT PAY',
        solution: 'SOLUTION',
        reasonForCustomerNotContactable: 'REASON FOR CUSTOMER NOT CONTACTABLE',
        newContactNumber: 'NEW CONTACT NUMBER'
      };
  
      // Destructure from req.body
      const { 
        LD, customerName, date, callStatus, callRemark, reCallDate, reCallTime, customerResponse,
        paymentAmount, reasonForNotPay, solution, reasonForCustomerNotContactable, newContactNumber: providedNewContactNumber 
      } = req.body;
  
      // Determine the value of newContactNumber based on callStatus
      const newContactNumber = callStatus === "Call Received" ? false : true;
  
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      const authClient = await auth.getClient();
      const sheets = google.sheets({ version: 'v4', auth: authClient });
  
      const spreadsheetId = process.env.VISIT_GOOGLE_SHEET_KEY;
      const sheetName = process.env.CALL_DETAILS_SHEET;
  
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: sheetName,
      });
  
      let rows = response.data.values || [];
      let headers;
      if (rows.length === 0) {
        headers = ['LD', 'CUSTOMER NAME', 'CALL BY-1', 'DATE-1', 'CALL STATUS-1', 'CALL REMARK-1', 'RE CALL DATE-1', 'CUSTOMER RESPONSE-1', 'PAYMENT AMOUNT-1', 'REASON FOR NOT PAY-1', 'SOLUTION-1', 'REASON FOR CUSTOMER NOT CONTACTABLE-1', 'NEW CONTACT NUMBER-1'];
        rows.push(headers);
      } else {
        headers = rows[0];
      }
  
      const data = rows.slice(1);
      const ldIndex = headers.indexOf('LD');
      const customerNameIndex = headers.indexOf('CUSTOMER NAME');
  
      if (ldIndex === -1 || customerNameIndex === -1) {
        return badRequest(res, 'LD or CUSTOMER NAME field not found in the sheet.');
      }
  
      const rowIndex = data.findIndex(row => row[ldIndex] === LD && row[customerNameIndex] === customerName);
  
      if (rowIndex === -1) {
        // If LD and CUSTOMER NAME are not found, create a new row with the data
        let newRow = Array(headers.length).fill('');
        newRow[ldIndex] = LD;
        newRow[customerNameIndex] = customerName;
        headers.forEach((header, index) => {
          const internalKey = Object.keys(keyMapping).find(key => `${keyMapping[key]}-1` === header);
          if (internalKey && req.body[internalKey] !== undefined) {
            newRow[index] = req.body[internalKey];
          }
        });
        newRow[headers.indexOf('CALL BY-1')] = name; // Set the callBy field with the employee name
        newRow[headers.indexOf('NEW CONTACT NUMBER-1')] = newContactNumber; // Set the newContactNumber
        data.push(newRow);
        rows.push(newRow);
      } else {
        // Handle updating existing rows with new suffixes if needed
        let maxSuffix = 1;
        headers.forEach(header => {
          const match = header.match(/-(\d+)$/);
          if (match && parseInt(match[1]) > maxSuffix) {
            maxSuffix = parseInt(match[1]);
          }
        });
  
        let lastUsedSuffix = 0;
        for (let suffix = 1; suffix <= maxSuffix; suffix++) {
          const callHeader = `CALL BY-${suffix}`;
          if (headers.includes(callHeader) && data[rowIndex][headers.indexOf(callHeader)]) {
            lastUsedSuffix = suffix;
          } else {
            break;
          }
        }
  
        const nextSuffix = lastUsedSuffix + 1;
        const updateMapping = {
          [`CALL BY-${nextSuffix}`]: name, // Use the name instead of callBy
          [`DATE-${nextSuffix}`]: date,
          [`CALL STATUS-${nextSuffix}`]: callStatus,
          [`CALL REMARK-${nextSuffix}`]: callRemark,
          [`RE CALL DATE-${nextSuffix}`]: reCallDate,
          [`CUSTOMER RESPONSE-${nextSuffix}`]: customerResponse,
          [`PAYMENT AMOUNT-${nextSuffix}`]: paymentAmount,
          [`REASON FOR NOT PAY-${nextSuffix}`]: reasonForNotPay,
          [`SOLUTION-${nextSuffix}`]: solution,
          [`REASON FOR CUSTOMER NOT CONTACTABLE-${nextSuffix}`]: reasonForCustomerNotContactable,
          [`NEW CONTACT NUMBER-${nextSuffix}`]: newContactNumber // Set the newContactNumber
        };
  
        Object.keys(updateMapping).forEach(key => {
          if (!headers.includes(key)) {
            headers.push(key);
            data.forEach(row => row.push(''));
          }
        });
  
        headers.forEach((header, index) => {
          const internalKey = Object.keys(updateMapping).find(key => key === header);
          if (internalKey && updateMapping[internalKey] !== undefined) {
            data[rowIndex][index] = updateMapping[internalKey];
          }
        });
      }
  
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        resource: {
          values: [headers, ...data],
        },
      });
  
      // Save to database as a new document
      const callDetail = new emiCallTrackingModel({
        LD, customerName, callBy: name, crmType:crm , date, callStatus, callRemark, reCallDate,reCallTime, customerResponse, 
        paymentAmount, reasonForNotPay, solution, reasonForCustomerNotContactable, newContactNumber
      });
  
      await callDetail.save();
  
      return success(res, "Call Details Submitted Successfully", callDetail);
    } catch (error) {
      console.log(error);
      return unknownError(res, error);
    }
  }

    // --------------CRM BRANCH Person  Form Fill Add------------------------------
    async function crmBranchFormAdd(req, res) {
        try {
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            return serverValidation(res, {
              errorName: "serverValidation",
              errors: errors.array(),
            });
          }
      
          // Fetch the employee details
          const tokenId = new ObjectId(req.Id);
          const employeUniqueDetail = await employeModel.findById({ _id: tokenId });
      
          // Construct the name to be saved in callBy
          const name = employeUniqueDetail.employeName + `-`  + employeUniqueDetail.employeUniqueId;
          const crm = "BRANCH"

          const keyMapping = {
            LD: 'LD',
            customerName: 'CUSTOMER NAME',
            callBy: 'CALL BY',
            date: 'DATE',
            callStatus: 'CALL STATUS',
            callRemark: 'CALL REMARK',
            reCallDate: 'RE CALL DATE',
            customerResponse: 'CUSTOMER RESPONSE',
            paymentAmount: 'PAYMENT AMOUNT',
            reasonForNotPay: 'REASON FOR NOT PAY',
            solution: 'SOLUTION',
            reasonForCustomerNotContactable: 'REASON FOR CUSTOMER NOT CONTACTABLE',
            newContactNumber: 'NEW CONTACT NUMBER'
          };
      
          // Destructure from req.body
          const { 
            LD, customerName, date, callStatus, callRemark, reCallDate, reCallTime, customerResponse,
            paymentAmount, reasonForNotPay, solution, reasonForCustomerNotContactable, newContactNumber: providedNewContactNumber 
          } = req.body;
      
          // Determine the value of newContactNumber based on callStatus
          const newContactNumber = callStatus === "Call Received" ? false : true;
      
          const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
          });
          const authClient = await auth.getClient();
          const sheets = google.sheets({ version: 'v4', auth: authClient });
      
          const spreadsheetId = process.env.CRM_HO_AND_BRANCH_GOOGLE_SHEET;
          const sheetName = process.env.CRM_BRANCH_SHEET;
          const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: sheetName,
          });
      
          let rows = response.data.values || [];
          let headers;
          if (rows.length === 0) {
            headers = ['LD', 'CUSTOMER NAME', 'CALL BY-1', 'DATE-1', 'CALL STATUS-1', 'CALL REMARK-1', 'RE CALL DATE-1', 'CUSTOMER RESPONSE-1', 'PAYMENT AMOUNT-1', 'REASON FOR NOT PAY-1', 'SOLUTION-1', 'REASON FOR CUSTOMER NOT CONTACTABLE-1', 'NEW CONTACT NUMBER-1'];
            rows.push(headers);
          } else {
            headers = rows[0];
          }
      
          const data = rows.slice(1);
          const ldIndex = headers.indexOf('LD');
          const customerNameIndex = headers.indexOf('CUSTOMER NAME');
      
          if (ldIndex === -1 || customerNameIndex === -1) {
            return badRequest(res, 'LD or CUSTOMER NAME field not found in the sheet.');
          }
      
          const rowIndex = data.findIndex(row => row[ldIndex] === LD && row[customerNameIndex] === customerName);
      
          if (rowIndex === -1) {
            // If LD and CUSTOMER NAME are not found, create a new row with the data
            let newRow = Array(headers.length).fill('');
            newRow[ldIndex] = LD;
            newRow[customerNameIndex] = customerName;
            headers.forEach((header, index) => {
              const internalKey = Object.keys(keyMapping).find(key => `${keyMapping[key]}-1` === header);
              if (internalKey && req.body[internalKey] !== undefined) {
                newRow[index] = req.body[internalKey];
              }
            });
            newRow[headers.indexOf('CALL BY-1')] = name; // Set the callBy field with the employee name
            newRow[headers.indexOf('NEW CONTACT NUMBER-1')] = newContactNumber; // Set the newContactNumber
            data.push(newRow);
            rows.push(newRow);
          } else {
            // Handle updating existing rows with new suffixes if needed
            let maxSuffix = 1;
            headers.forEach(header => {
              const match = header.match(/-(\d+)$/);
              if (match && parseInt(match[1]) > maxSuffix) {
                maxSuffix = parseInt(match[1]);
              }
            });
      
            let lastUsedSuffix = 0;
            for (let suffix = 1; suffix <= maxSuffix; suffix++) {
              const callHeader = `CALL BY-${suffix}`;
              if (headers.includes(callHeader) && data[rowIndex][headers.indexOf(callHeader)]) {
                lastUsedSuffix = suffix;
              } else {
                break;
              }
            }
      
            const nextSuffix = lastUsedSuffix + 1;
            const updateMapping = {
              [`CALL BY-${nextSuffix}`]: name, // Use the name instead of callBy
              [`DATE-${nextSuffix}`]: date,
              [`CALL STATUS-${nextSuffix}`]: callStatus,
              [`CALL REMARK-${nextSuffix}`]: callRemark,
              [`RE CALL DATE-${nextSuffix}`]: reCallDate,
              [`CUSTOMER RESPONSE-${nextSuffix}`]: customerResponse,
              [`PAYMENT AMOUNT-${nextSuffix}`]: paymentAmount,
              [`REASON FOR NOT PAY-${nextSuffix}`]: reasonForNotPay,
              [`SOLUTION-${nextSuffix}`]: solution,
              [`REASON FOR CUSTOMER NOT CONTACTABLE-${nextSuffix}`]: reasonForCustomerNotContactable,
              [`NEW CONTACT NUMBER-${nextSuffix}`]: newContactNumber // Set the newContactNumber
            };
      
            Object.keys(updateMapping).forEach(key => {
              if (!headers.includes(key)) {
                headers.push(key);
                data.forEach(row => row.push(''));
              }
            });
      
            headers.forEach((header, index) => {
              const internalKey = Object.keys(updateMapping).find(key => key === header);
              if (internalKey && updateMapping[internalKey] !== undefined) {
                data[rowIndex][index] = updateMapping[internalKey];
              }
            });
          }
      
          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!A1`,
            valueInputOption: 'RAW',
            resource: {
              values: [headers, ...data],
            },
          });
      

          // Save to database as a new document
          const callDetail = new emiCallTrackingModel({
            LD, customerName, callBy: name, crmType:crm, date, callStatus, callRemark, reCallDate,reCallTime, customerResponse, 
            paymentAmount, reasonForNotPay, solution, reasonForCustomerNotContactable, newContactNumber
          });
      
        const data1 =  await callDetail.save();
          
          return success(res, "Call Details Submitted Successfully", data1);
        } catch (error) {
          console.log(error);
          return unknownError(res, error);
        }
      }
  
  // -----------------Get All CRM Call Detail Api--------------------------------
  async function getCrmDetail(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return serverValidation(res, {
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
  
       const crmDetail = await emiCallTrackingModel.find({}).sort({ createdAt: -1 });
      success(res, `Crm Detail List For`, crmDetail);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  }
  
  // ------------CRN PERSON Call DONE LIST------------------------------
  async function getCallDoneByLD(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return serverValidation(res, {
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      
      const { LD } = req.query;
      const startOfMonth = moment().startOf('month').toDate();
      const endOfMonth = moment().endOf('month').toDate();
      const callDoneDetail = await emiCallTrackingModel.find({
        LD: LD,
        createdAt: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      });
  
      if (!callDoneDetail || callDoneDetail.length === 0) {
        return success(res, "No Record", callDoneDetail);
      }
      
      success(res, `Call Done Detail For ${LD}`, callDoneDetail);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  }

  
module.exports = {

    getCrmPersonGoogleSheet, 
    getCrmBranchGoogleSheet,
    crmFormAdd,
    crmBranchFormAdd,
    getCrmDetail,
    getCallDoneByLD,
   
  }
  