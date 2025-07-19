const {
    success,
    unknownError,
    serverValidation,
    badRequest,
    notFound
  } = require("../../../../globalHelper/response.globalHelper");
  
  const { validationResult } = require("express-validator");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
  // const externalCustomerModel = require("../model/externalCustomer.model");
  const xlsx = require('xlsx');
  const moment = require('moment');
  const employeModel = require("../model/adminMaster/employe.model")
  const modeOfcollectionModel = require("../model/adminMaster/modeOfCollection.model")
  const {visitGoogleSheet} = require("./visitGoogleSheet.controller")


// -----------------Sheet Upload Api For Excel Sheet--------------------------------
  // async function allCustomerGoogleSheetUpdload(req, res) {
  //   try {
  //     if (!req.file) {
  //       return badRequest(res, 'No file uploaded.');
  //     }
  //     if (req.files) {
  //       if (req.files['sheet']) {
  //         sheetDetail = `/uploads/${req.files['sheet'][0].filename}`;
  //       }
  //     }
  //     const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
  //     const sheetName = workbook.SheetNames[0];
  //     const sheet = workbook.Sheets[sheetName];
  //     const data = xlsx.utils.sheet_to_json(sheet);
  
  //     // Define key mapping
  //     const keyMapping = {
  //       "LD": "ld",
  //       "LOAN NO .": "loanNo",
  //       "BRANCH": "branch",
  //       "CUSTOMER NAME": "customerName",
  //       "FATHER NAME": "fatherName",
  //       "MOBILE": "mobile",
  //       "EMAIL ID": "emailId",
  //       "VILLAGE": "village",
  //       "ADDRESS": "address",
  //       "STATE": "state",
  //       "GENDER": "gender",
  //       "DOB": "dob",
  //       "AGE": "age",
  //       "CIBIL SCORE": "cibilScore",
  //       "Co-borrower1_name": "coBorrower1Name",
  //       "Co-borrower1_mobile": "coBorrower1Mobile",
  //       "Co-borrower1_Email ID": "coBorrower1EmailId",
  //       "Co-borrower1_address": "coBorrower1Address",
  //       "STATE": "coBorrower1State",
  //       "GENDER": "coBorrower1Gender",
  //       "DOB": "coBorrower1Dob",
  //       "AGE": "coBorrower1Age",
  //       "CIBIL SCORE": "coBorrower1CibilScore",
  //       "GTR NAME": "gtrName",
  //       "GTR FATHER NAME": "gtrFatherName",
  //       "GTR MOB NO.": "gtrMobNo",
  //       "GTR ADDRESS": "gtrAddress",
  //       "STATE": "gtrState",
  //       "GENDER": "gtrGender",
  //       "DOB": "gtrDob",
  //       "AGE": "gtrAge",
  //       "CIBIL SCORE": "gtrCibilScore",
  //       "GUARANTOR BANK NAME": "guarantorBankName",
  //       "BANK BRANCH": "bankBranch",
  //       "A/C HOLDER NAME": "accountHolderName",
  //       "A/C NUMBER": "accountNumber",
  //       "IFSC CODE": "ifscCode",
  //       "A/C TYPE": "accountType",
  //       "SALES PERSON": "salesPerson",
  //       "SALES MANAGER": "salesManager",
  //       "CLUSTER MANAGER": "clusterManager",
  //       "PD DONE BY": "pdDoneBy",
  //       "PRODUCT": "product",
  //       "CASE TYPE": "caseType",
  //       "PARTNER NAME": "partnerName",
  //       "LOAN AMOUNT": "loanAmount",
  //       "TENURE": "tenure",
  //       "ROI": "roi",
  //       "EMI": "emi",
  //       "PF CHARGES": "pfCharges",
  //       "DOCUMENT CHARGES": "documentCharges",
  //       "CERSAI CHARGES": "cersaiCharges",
  //       "INSURANCE CHARGES": "insuranceCharges",
  //       "ACTUAL PRE EMI": "actualPreEmi",
  //       "NET DISBURSEMENT AMOUNT": "netDisbursementAmount",
  //       "SANCTION DATE": "sanctionDate",
  //       "DISBURSEMENT DATE": "disbursementDate",
  //       "DISBURSEMENT MONTH": "disbursementMonth",
  //       "CUSTOMER REPAYMENT BANK NAME": "customerRepaymentBankName",
  //       "BANK BRANCH": "customerBankBranch",
  //       "A/C HOLDER NAME": "customerAccountHolderName",
  //       "A/C NUMBER": "customerAccountNumber",
  //       "IFSC CODE": "customerIfscCode",
  //       "A/C TYPE": "customerAccountType",
  //       "NACH DONE BY": "nachDoneBy",
  //       "NACH TOKEN ID": "nachTokenId",
  //       "PROPERTY PAPER TYPE": "propertyPaperType",
  //       "PROPERTY TYPE": "propertyType",
  //       "MARKET VALUE": "marketValue",
  //       "LTV": "ltv",
  //       "LAT": "lat",
  //       "LONG": "long",
  //       "MONTHLY INCOME": "monthlyIncome",
  //       "MONTHLY OBLIGATIONS": "monthlyObligations",
  //       "FOIR": "foir",
  //       "CUSTOMER PROFILE": "customerProfile",
  //       "CUSTOMER SEGMENT": "customerSegment",
  //       "ALLOCATED BRANCH": "allocatedBranch",
  //       "ALLOCATION-1": "allocation1",
  //       "ALLOCATION-2": "allocation2",
  //       "ALLOCATION-3": "allocation3",
  //       "ALLOCATION-4": "allocation4",
  //       "ALLOCATION-5": "allocation5",
  //       "EMI CYCLE": "emiCycle",
  //       "FIRST EMI DATE": "firstEmiDate",
  //       "FIRST EMI MONTH": "firstEmiMonth",
  //       "LAST EMI DATE": "lastEmiDate",
  //       "COLLECTION TYPE": "collectionType",
  //       "LAST EMI RECEIVED DATE": "lastEmiReceivedDate",
  //       "NET DUE": "netDue",
  //       "OLD DUE": "oldDue",
  //       "POS OUTSTANGING": "posOutstanding",
  //       "INTEREST OUTSTANDING": "interestOutstanding"
  //   };
    
  //     const sheetHeaders = Object.keys(data[0]);
  //     console.log("dddd",sheetHeaders)
  //     const missingKeys = Object.keys(keyMapping).filter(key => !sheetHeaders.includes(key));
  
  //     if (missingKeys.length > 0) {
  //       return badRequest(res, `Invalid sheet. Missing keys: ${missingKeys.join(', ')}`);
  //     }
  
  
  //     const transformedData = data.map((item) => {
  //       let newItem = {};
  //       for (const [key, value] of Object.entries(item)) {
  //         const mappedKey = keyMapping[key];
  //         if (mappedKey) {
  //           if (Array.isArray(value)) {
  //             newItem[mappedKey] = value;
  //           } 
  //           // else if (typeof value === 'string') {
  //           //   // Handle fields that are expected to be arrays of numbers
  //           //   if (mappedKey === 'mobile' || mappedKey === 'coBorrower1Mobile' || mappedKey === 'coBorrower2Mobile' || mappedKey === 'gtrMobNo') {
  //           //     newItem[mappedKey] = value.split(',').map(num => parseFloat(num.trim())).filter(num => !isNaN(num));
  //           //   }
  //           //    else {
  //           //     newItem[mappedKey] = value.trim() || "";
  //           //   }
  //           // } else {
  //           //   newItem[mappedKey] = value || "";
  //           // }
  //         }
  //       }
  //       return newItem;
  //     });
  
  //     // Save data to MongoDB
  //     const newData = await externalCustomerModel.insertMany(transformedData);
  
  //     success(res,'File uploaded and data saved.',newData);
  //   } catch (error) {
  //     console.log(error);
  //      unknownError(res, error);
  //   }
  // }

    // ------------------ Get All External Customer---------------------------------------
    // async function getAllExternalCustomer(req, res) {
    //   try {
    //     const errors = validationResult(req);
    //     if (!errors.isEmpty()) {
    //       return res.status(400).json({
    //         errorName: "serverValidation",
    //         errors: errors.array(),
    //       });
    //     }
    //     const customer = await externalCustomerModel.find();
    //     success(res, "Get All External Customer ",customer);
    //   } catch (error) {
    //     console.log(error);
    //     unknownError(res, error);
    //   }
    // };


  module.exports = {
    // allCustomerGoogleSheetUpdload,
    // getAllExternalCustomer
  };