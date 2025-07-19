const {
  serverValidation,
  success,
  notFound,
  badRequest,
  unknownError,
} = require("../../../../../globalHelper/response.globalHelper.js");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");
const credentials = require("../../../../../liveSheet.json");
const baseUrl = process.env.BASE_URL;
const axios = require("axios");
const xlsx = require("xlsx");
const moment = require("moment");
const { callbackify } = require("util");
const employeModel = require("../../model/adminMaster/employe.model.js");
// const fileProcessModel = require("../../model/fileProcess/fileProcess.model.js");
const cibilModel = require("../../model/cibilDetail.model.js");
const customerModel = require("../../model/customer.model.js");
const processModel = require("../../model/process.model.js");
const applicantModel = require("../../model/applicant.model.js");
const coApplicantModel = require("../../model/co-Applicant.model.js");
const guarantorModel = require("../../model/guarantorDetail.model.js");
const finalSanctionModel = require("../../model/finalSanction/finalSnction.model.js");
const { paginationData } = require("../../helper/pagination.helper.js");
const loanDocumentModel = require("../../model/finalApproval/allDocument.model.js");
const gtrPdcModel = require("../../model/branchPendency/gtrPdc.model.js");
const appPdcModel = require("../../model/branchPendency/appPdc.model.js");
const newBranchModel = require("../../model/adminMaster/newBranch.model");
const finalModel = require("../../model/finalSanction/finalSnction.model.js");
const SignKycModel = require("../../model/branchPendency/signkyc.model.js");
const customerDocumentModel = require("../../model/customerPropertyDetail.model.js");
const finalSanctionDetail = require("../../model/finalSanction/finalSnction.model.js");
const externalManagerModel = require("../../model/externalManager/externalVendorDynamic.model");
const {fileProcessSheet} = require("../../controller/finalSanction/faGoogleSheet.controller.js");
const {sendEmailByVendor} = require("../functions.Controller.js")
const mailSwitchesModel = require("../../model/adminMaster/mailSwitches.model.js")
// -------------------FILE PROCESS ALLOCATION LIST-----------------------------------

async function getFileProcessAllocation(req, res) {
  try {
    const tokenId = new ObjectId(req.Id);

    // Find employee by token ID
    const employeeData = await employeModel.findById({
      _id: tokenId,
      status: "active",
    });
    if (!employeeData) {
      return notFound(res, "Employee not found", []);
    }

    const employeUniqueId = employeeData.employeUniqueId;
    // Check if employeUniqueId is empty
    if (!employeUniqueId) {
      return notFound(res, "Employee unique ID not found", []);
    }

    const spreadsheetId = process.env.FILE_PROCESS_GOOGLE_SHEET;
    const sheetName = process.env.DATA_SHEET;
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
      return badRequest(res, "No data found.");
    } else {
      const headers = rows[0];
      const data = rows.slice(1).map((row) => {
        let obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] !== undefined ? row[index] : null;
        });
        return obj;
      });

      // Allocation fields and their corresponding rules
      const allocationFields = [
        "ALLOCATION-1",
        "ALLOCATION-2",
        "ALLOCATION-3",
        "ALLOCATION-4",
        "ALLOCATION-5",
        "ALLOCATION-6",
      ];
      const ruleFields = [
        "COMPLETED-1",
        "COMPLETED-2",
        "COMPLETED-3",
        "COMPLETED-4",
        "COMPLETED-5",
        "COMPLETED-6",
      ];

      // New case-based filtering
      const caseType = req.query.case || "all"; // Get case from query parameter, default to 'all'
      const ldNumber = req.query.LD;
      let filteredData;

      if (caseType === "LD" && ldNumber) {
        filteredData = data.filter((row) => row["LD NO."] === ldNumber);
      } else {
        filteredData = data.filter((row) => {
          // First, check if the row is allocated to the employee
          const isAllocated = allocationFields.some(
            (field, index) =>
              row[field] &&
              row[field].match(new RegExp(employeUniqueId, "i")) &&
              row[ruleFields[index]] !== "COMPLETED"
          );

          if (!isAllocated) return false;

          // Then, apply case-specific filtering
          switch (caseType.toLowerCase()) {
            case "branch":
              return row["COMPLETED-1"] == "YES";
              break;
            case "sanction":
              return row["COMPLETED-2"] == "YES";
              break;
            case "disbursement":
              return row["COMPLETED-3"] == "YES";
              break;
            case "rm":
              return row["COMPLETED -4"] == "YES";
              break;
            case "all":
            default:
              return true;
          }
        });
      }
      if (filteredData.length === 0) {
        return notFound(
          res,
          `Employee not assigned data for employeUniqueId: ${employeUniqueId}`,
          []
        );
      }
      success(
        res,
        `Data Get From employeUniqueId: ${employeUniqueId}`,
        filteredData
      );
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      return badRequest(res, "Invalid sheet name.");
    } else {
      unknownError(res, error);
    }
  }
}



async function saveToGoogleSheet(data) {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: authClient });

  const spreadsheetId = process.env.FILE_PROCESS_GOOGLE_SHEET;
  const sheetName = process.env.DATA_FROM_FINEXE;
  const baseUrl = process.env.BASE_URL;

  // Fetch existing sheet data
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A1:DE`,
  });

  let rows = response.data.values || [];
  let headers = rows.length > 0 ? rows[0] : [];

  // Define headers if sheet is empty
  if (rows.length === 0) {
    headers = [
      "LD",
      "CUSTOMER NAME",
      "DONE BY-1",
      "APPLICANT KYC",
      "APPLICANT DATE",
      "CO APPLICANT KYC",
      "CO APPLICANT DATE",
      "GAURANTOR KYC",
      "GAURANTOR DATE",
      "ELECTRICITY BILL",
      "ELECTRICITY DATE",
      "SAMAGRA ID",
      "SAMAGRA DATE",
      "UDYAM CERTIFICATE",
      "UDYAM CERTIFICATE DATE",
      "BANK STATEMENT",
      "BANK STATEMENT DATE",
      "INCOME DOCUMENT",
      "INCOME DATE",
      "PROPERTY PAPERS",
      "PROPERTY PAPERS DATE",
      "APPLICANT PDC",
      "APPLICANT PDC DATE",
      "GAURANTOR PDC",
      "GAURANTOR PDC DATE",
      "ESIGN PHOTO",
      "ESIGN PHOTOS DATE",
      "NACH REGISTRATION",
      "NACH REGISTRATION DATE",
      "E-NACH LINK",
      "E-NACH LINK DATE",
      "APP ESIGN LINK",
      "APP ESIGN DATE",
      "CO APP ESIGN LINK",
      "CO APP ESIGN DATE",
      "GTR ESIGN LINK",
      "GTR ESIGN DATE",
      "PHYSICAL FILE COURIER",
      "PHYSICAL FILE DATE",
      "ADDITIONAL-1",
      "ADDITIONAL DATE-1",
      "ADDITIONAL-2",
      "ADDITIONAL DATE-2",
      "ADDITIONAL-3",
      "ADDITIONAL DATE-3",
      "ADDITIONAL-4",
      "ADDITIONAL DATE-4",
      "DONE BY-2",
      "GOOGLE FORM",
      "GOOGLE FORM DATE",
      "APP-CIBIL REPORT",
      "APP-CIBIL REPORT DATE",
      "CO-APP CIBIL REPORT",
      "CO-APP CIBIL REPORT DATE",
      "GTR CIBIL REPORT",
      "GTR CIBIL REPORT DATE",
      "PD REPORT KYC",
      "PD REPORT DATE",
      "CAM REPORT",
      "CAM DATE",
      "TVR",
      "TVR DATE",
      "LEGAL",
      "LEGAL DATE",
      "TECHNICAL",
      "TECHNICAL DATE",
      "FC",
      "FC DATE",
      "SOA",
      "SOA DATE",
      "LOD",
      "LOD DATE",
      "SENT FOR SANCTION",
      "SANCTION DATE",
      "SANCTION FROM PARTNER",
      "SANCTION FROM PARTNER DATE",
      "DONE BY-3",
      "RM PAYMENT",
      "RM PAYMENT DATE",
      "RM BOOKED",
      "RM BOOKED DATE",
      "RM RECEIVED",
      "RM RECEIVED DATE",
      "DONE BY-4",
      "RCU REPORT",
      "RCU DATE",
      "ESIGN",
      "ESIGN DATE",
      "OTHER DISBURSEMENT",
      "OTHER DISBURSEMENT DATE",
      "SENT FOR DISBURSEMENT",
      "DISBURSEMENT DATE",
      "DISBURSEMENT UTR",
      "DISBURSEMENT UTR DATE",
      "JAINUM ENTRY",
      "JAINUM ENTRY DATE",
      "MIS UPDATION",
      "MIS UPDATION DATE",
      "DONE BY-5",
      "PROPERTY PAPER PARTNER",
      "PROPERTY PAPER PARTNER DATE",
      "NOC PARTNER",
      "NOC PARTNER DATE",
      "FILE INVENTORY",
      "FILE INVENTORY DATE",
      "CHEQUE INVENTORY",
      "CHEQUE INVENTORY DATE",
      "LOAN NO",
      "LOAN NO DATE",
      "TAGGING",
      "TAGGING DATE",
    ];
    rows.push(headers);
  }

  const ldIndex = headers.indexOf("LD");
  if (ldIndex === -1) {
    throw new Error("LD field not found in the sheet.");
  }

  const existingRowIndex = rows
    .slice(1)
    .findIndex((row) => row[ldIndex] === data.LD);

  const dataMappings = {
    LD: "LD",
    "CUSTOMER NAME": "customerName",
    "DONE BY-1": "employeeId1",
    "APPLICANT KYC": "applicantKyc",
    "APPLICANT DATE": "applicantKycDate",
    "CO APPLICANT KYC": "coApplicantKyc",
    "CO APPLICANT DATE": "coApplicantKycDate",
    "GAURANTOR KYC": "gaurantorKyc",
    "GAURANTOR DATE": "gaurantorKycDate",
    "ELECTRICITY BILL": "electricityBill",
    "ELECTRICITY DATE": "elctricityBillDate",
    "SAMAGRA ID": "samagraId",
    "SAMAGRA DATE": "samagraIdDate",
    "UDYAM CERTIFICATE": "udyamCertificate",
    "UDYAM CERTIFICATE DATE": "udyamCertificateDate",
    "BANK STATEMENT": "bankStatement",
    "BANK STATEMENT DATE": "bankStatementDate",
    "INCOME DOCUMENT": "incomeDocument",
    "INCOME DATE": "incomeDocumentDate",
    "PROPERTY PAPERS": "propertyPapers",
    "PROPERTY PAPERS DATE": "propertyPapersDate",
    "APPLICANT PDC": "applicantPdc",
    "APPLICANT PDC DATE": "applicantPdcDate",
    "GAURANTOR PDC": "gaurantorPdc",
    "GAURANTOR PDC DATE": "gaurantorPdcDate",
    "ESIGN PHOTO": "esignPhoto",
    "ESIGN PHOTOS DATE": "esignPhotoDate",
    "NACH REGISTRATION": "nachRegistration",
    "NACH REGISTRATION DATE": "nachRegistrationDate",
    "E-NACH LINK": "enachLink",
    "E-NACH LINK DATE": "enachLinkDate",
    "APP ESIGN LINK": "appEsignLink",
    "APP ESIGN DATE": "appEsignLinkDate",
    "CO APP ESIGN LINK": "coAppEsignLink",
    "CO APP ESIGN DATE": "coAppEsignLinkDate",
    "GTR ESIGN LINK": "gtrEsignLink",
    "GTR ESIGN DATE": "gtrEsignLinkDate",
    "PHYSICAL FILE COURIER": "physicalFileCourier",
    "PHYSICAL FILE DATE": "physicalFileCourierDate",
    "ADDITIONAL-1": "additional1",
    "ADDITIONAL DATE-1": "additional1Date",
    "ADDITIONAL-2": "additional2",
    "ADDITIONAL DATE-2": "additional2Date",
    "ADDITIONAL-3": "additional3",
    "ADDITIONAL DATE-3": "additional3Date",
    "ADDITIONAL-4": "additional4",
    "ADDITIONAL DATE-4": "additional4Date",
    "DONE BY-2": "employeeId2",
    "GOOGLE FORM": "googleForm",
    "GOOGLE FORM DATE": "googleFormDate",
    "APP-CIBIL REPORT": "appCibilReport",
    "APP-CIBIL REPORT DATE": "appCibilReportDate",
    "CO-APP CIBIL REPORT": "coAppCibilReport",
    "CO-APP CIBIL REPORT DATE": "coAppCibilReportDate",
    "GTR CIBIL REPORT": "gtrCibilReport",
    "GTR CIBIL REPORT DATE": "gtrCibilReportDate",
    "PD REPORT KYC": "pdReportKyc",
    "PD REPORT DATE": "pdReportKycDate",
    "CAM REPORT": "camReport",
    "CAM DATE": "camReportDate",
    TVR: "tvr",
    "TVR DATE": "tvrDate",
    LEGAL: "legal",
    "LEGAL DATE": "legalDate",
    TECHNICAL: "technical",
    "TECHNICAL DATE": "technicalDate",
    FC: "fc",
    "FC DATE": "fcDate",
    SOA: "soa",
    "SOA DATE": "soaDate",
    LOD: "lod",
    "LOD DATE": "lodDate",
    "SENT FOR SANCTION": "sentForSanction",
    "SANCTION DATE": "sentForSanctionDate",
    "SANCTION FROM PARTNER": "sanctionFromPartner",
    "SANCTION FROM PARTNER DATE": "sanctionFromPartnerDate",
    "DONE BY-3": "employeeId3",
    "RM PAYMENT": "rmPayment",
    "RM PAYMENT DATE": "rmPaymentDate",
    "RM BOOKED": "rmBooked",
    "RM BOOKED DATE": "rmBookedDate",
    "RM RECEIVED": "rmReceived",
    "RM RECEIVED DATE": "rmReceivedDate",
    "DONE BY-4": "employeeId4",
    "RCU REPORT": "rcuReport",
    "RCU DATE": "rcuReportDate",
    ESIGN: "esign",
    "ESIGN DATE": "esignDate",
    "OTHER DISBURSEMENT": "otherDisbursement",
    "OTHER DISBURSEMENT DATE": "otherDisbursementDate",
    "SENT FOR DISBURSEMENT": "sentForDisbursement",
    "DISBURSEMENT DATE": "sentForDisbursementDate",
    "DISBURSEMENT UTR": "disbursementUTR",
    "DISBURSEMENT UTR DATE": "disbursementUTRDate",
    "JAINUM ENTRY": "jainumEntry",
    "JAINUM ENTRY DATE": "jainumEntryDate",
    "MIS UPDATION": "misUpdation",
    "MIS UPDATION DATE": "misUpdationDate",
    "DONE BY-5": "employeeId5",
    "PROPERTY PAPER PARTNER": "propertyPaperPartner",
    "PROPERTY PAPER PARTNER DATE": "propertyPaperPartnerDate",
    "NOC PARTNER": "nocPartner",
    "NOC PARTNER DATE": "nocPartnerDate",
    "FILE INVENTORY": "fileInventory",
    "FILE INVENTORY DATE": "fileInventoryDate",
    "CHEQUE INVENTORY": "chequeInventory",
    "CHEQUE INVENTORY DATE": "chequeInventoryDate",
    "LOAN NO": "loanNo",
    "LOAN NO DATE": "loanNoDate",
    TAGGING: "tagging",
    "TAGGING DATE": "taggingDate",
  };

  // Fields that should save as 'YES' if the array has values, otherwise 'NO'
  const fieldsWithBaseUrl = [
    "applicantKyc",
    "coApplicantKyc",
    "gaurantorKyc",
    "electricityBill",
    "samagraId",
    "udyamCertificate",
    "bankStatement",
    "incomeDocument",
    "propertyPapers",
    "applicantPdc",
    "gaurantorPdc",
    "esignPhoto",
    "nachRegistration",
    "enachLink",
    "physicalFileCourier",
    "additional1",
    "additional2",
    "additional3",
    "additional4",
    "appCibilReport",
    "coAppCibilReport",
    "gtrCibilReport",
    "pdReportKyc",
    "camReport",
    "tvr",
    "legal",
    "technical",
    "fc",
    "soa",
    "lod",
    "sentForSanction",
    "otherDisbursement",
    "sanctionFromPartner",
    "rmPayment",
    "rmBooked",
    "rmReceived",
    "rcuReport",
    "esign",
    "otherDisbursement",
    "sentForDisbursement",
    "disbursementUTR",
    "propertyPaperPartner",
    "nocPartner",
    "fileInventory",
    "chequeInventory",
    "loanNo",
    "tagging",
  ];
  const dateFields = [
    "applicantKycDate",
    "coApplicantKycDate",
    "gaurantorKycDate",
    "elctricityBillDate",
    "samagraIdDate",
    "udyamCertificateDate",
    "bankStatementDate",
    "incomeDocumentDate",
    "propertyPapersDate",
    "applicantPdcDate",
    "gaurantorPdcDate",
    "esignPhotoDate",
    "nachRegistrationDate",
    "enachLinkDate",
    "appEsignDate",
    "coAppEsignDate",
    "gtrEsignDate",
    "physicalFileCourierDate",
    "additional1Date",
    "additional2Date",
    "additional3Date",
    "additional4Date",
    "googleFormDate",
    "appCibilReportDate",
    "coAppCibilReportDate",
    "gtrCibilReportDate",
    "pdReportKycDate",
    "camReportDate",
    "tvrDate",
    "legalDate",
    "technicalDate",
    "fcDate",
    "soaDate",
    "lodDate",
    "sentForSanctionDate",
    "sanctionFromPartnerDate",
    "rmPaymentDate",
    "rmBookedDate",
    "rmReceivedDate",
    "rcuDate",
    "esignDate",
    "otherDisbursementDate",
    "disbursementDate",
    "disbursementUTRDate",
    "jainumEntryDate",
    "misUpdationDate",
    "propertyPaperPartnerDate",
    "nocPartnerDate",
    "fileInventoryDate",
    "chequeInventoryDate",
    "loanNoDate",
    "taggingDate",
  ];

  // Fetch employee data for all employeeIds
  const employeeIds = [
    "employeeId1",
    "employeeId2",
    "employeeId3",
    "employeeId4",
    "employeeId5",
  ];
  const employeeData = {};
  for (const employeeIdField of employeeIds) {
    if (data[employeeIdField]) {
      const employee = await employeModel.findById(data[employeeIdField]);
      if (employee) {
        employeeData[
          employeeIdField
        ] = `${employee.employeName}-${employee.employeUniqueId}`;
      }
    }
  }

  let rowToUpdate = Array(headers.length).fill("");

  headers.forEach((header, index) => {
    if (dataMappings[header]) {
      let value = data[dataMappings[header]];
      if (header.startsWith("DONE BY-")) {
        const employeeIdField = dataMappings[header];
        value = employeeData[employeeIdField] || "";
      } else if (fieldsWithBaseUrl.includes(dataMappings[header])) {
        value = Array.isArray(value) && value.length > 0 ? "YES" : "NO";
      } else if (dateFields.includes(dataMappings[header])) {
        if (Array.isArray(value) && value.length > 0) {
          // Find the latest date
          const latestDate = value.reduce((latest, current) => {
            return new Date(current) > new Date(latest) ? current : latest;
          });
          value = latestDate;
        } else {
          value = "";
        }
      } else {
        // For non-special fields, use the last value if it's an array
        value = Array.isArray(value)
          ? value[value.length - 1] || ""
          : value || "";
      }
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
  // Write data back to Google Sheets
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: "RAW",
    resource: {
      values: rows,
    },
  });

  console.log("Data saved to Google Sheets successfully");
}

// -----------------------ADD FILE PROCESS FORM---------------------------------
async function addFileProcessForm(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const tokenId = new ObjectId(req.Id);
    // Fetch employee data based on token
    const employeeData = await employeModel.findOne({
      _id: tokenId,
      status: "active",
    });
    if (!employeeData) {
      return notFound(res, "Employee not found", []);
    }

    // Destructure fields from req.body, including all fields from the model
    const {
      formType,
      LD,
      customerName,
      applicantKyc,
      applicantKycDate,
      coApplicantKyc,
      coApplicantKycDate,
      gaurantorKyc,
      gaurantorKycDate,
      electricityBill,
      elctricityBillDate,
      samagraId,
      samagraIdDate,
      udyamCertificate,
      udyamCertificateDate,
      bankStatement,
      bankStatementDate,
      incomeDocument,
      incomeDocumentDate,
      propertyPapers,
      propertyPapersDate,
      applicantPdc,
      applicantPdcDate,
      gurantorPdc,
      gurantorPdcDate,
      esignPhoto,
      esignPhotoDate,
      nachRegistration,
      nachRegistrationDate,
      enachLink,
      enachLinkDate,
      appEsignLink,
      appEsignLinkDate,
      coAppEsignLink,
      coAppEsignLinkDate,
      gtrEsignLink,
      gtrEsignLinkDate,
      physicalFileCourier,
      physicalFileCourierDate,
      additional1,
      additional1Date,
      additional2,
      additional2Date,
      additional3,
      additional3Date,
      additional4,
      additional4Date,
      appCibilReport,
      appCibilReportDate,
      coAppCibilReport,
      coAppCibilReportDate,
      gtrCibilReport,
      gtrCibilReportDate,
      pdReportKyc,
      pdReportKycDate,
      camReport,
      camReportDate,
      tvr,
      tvrDate,
      legal,
      legalDate,
      fc,
      fcDate,
      soa,
      soaDate,
      lod,
      lodDate,
      technical,
      technicalDate,
      rcuReport,
      rcuReportDate,
      googleForm,
      googleFormDate,
      sentForSanction,
      sentForSanctionDate,
      sanctionFromPartner,
      sanctionFromPartnerDate,
      rmPayment,
      rmPaymentDate,
      rmBooked,
      rmBookedDate,
      rmReceived,
      rmReceivedDate,
      sanctionDate,
      esign,
      esignDate,
      otherDisbursement,
      otherDisbursementDate,
      sentForDisbursement,
      sentForDisbursementDate,
      disbursementUTR,
      disbursementUTRDate,
      jainumEntry,
      jainumEntryDate,
      misUpdation,
      misUpdationDate,
      propertyPaperPartner,
      propertyPaperPartnerDate,
      nocPartner,
      nocPartnerDate,
      fileInventory,
      fileInventoryDate,
      chequeInventory,
      chequeInventoryDate,
      loanNo,
      loanNoDate,
      tagging,
      taggingDate,
    } = req.body;

    // Determine which employeeId field to set based on formType
    let employeeIdField;
    switch (formType) {
      case 1:
        employeeIdField = "employeeId1";
        break;
      case 2:
        employeeIdField = "employeeId2";
        break;
      case 3:
        employeeIdField = "employeeId3";
        break;
      case 4:
        employeeIdField = "employeeId4";
        break;
      case 5:
        employeeIdField = "employeeId5";
        break;
      case 6:
        employeeIdField = "employeeId6";
        break;
      default:
        return badRequest(res, "Invalid form type provided.");
    }

    // Check if a record with the given LD number exists
    let fileProcessDetail = await fileProcessModel.findOne({ LD: LD });
    if (fileProcessDetail) {
      // Append new data to existing array fields instead of replacing them
      if (customerName !== undefined)
        fileProcessDetail.customerName = customerName;
      if (applicantKyc !== undefined)
        fileProcessDetail.applicantKyc = [
          ...(fileProcessDetail.applicantKyc || []),
          applicantKyc,
        ];
      if (applicantKycDate !== undefined)
        fileProcessDetail.applicantKycDate = [
          ...(fileProcessDetail.applicantKycDate || []),
          applicantKycDate,
        ];
      if (coApplicantKyc !== undefined)
        fileProcessDetail.coApplicantKyc = [
          ...(fileProcessDetail.coApplicantKyc || []),
          coApplicantKyc,
        ];
      if (coApplicantKycDate !== undefined)
        fileProcessDetail.coApplicantKycDate = [
          ...(fileProcessDetail.coApplicantKycDate || []),
          coApplicantKycDate,
        ];
      if (gaurantorKyc !== undefined)
        fileProcessDetail.gaurantorKyc = [
          ...(fileProcessDetail.gaurantorKyc || []),
          gaurantorKyc,
        ];
      if (gaurantorKycDate !== undefined)
        fileProcessDetail.gaurantorKycDate = [
          ...(fileProcessDetail.gaurantorKycDate || []),
          gaurantorKycDate,
        ];
      if (electricityBill !== undefined)
        fileProcessDetail.electricityBill = [
          ...(fileProcessDetail.electricityBill || []),
          electricityBill,
        ];
      if (elctricityBillDate !== undefined)
        fileProcessDetail.elctricityBillDate = [
          ...(fileProcessDetail.elctricityBillDate || []),
          elctricityBillDate,
        ];
      if (samagraId !== undefined)
        fileProcessDetail.samagraId = [
          ...(fileProcessDetail.samagraId || []),
          samagraId,
        ];
      if (samagraIdDate !== undefined)
        fileProcessDetail.samagraIdDate = [
          ...(fileProcessDetail.samagraIdDate || []),
          samagraIdDate,
        ];
      if (udyamCertificate !== undefined)
        fileProcessDetail.udyamCertificate = [
          ...(fileProcessDetail.udyamCertificate || []),
          udyamCertificate,
        ];
      if (udyamCertificateDate !== undefined)
        fileProcessDetail.udyamCertificateDate = [
          ...(fileProcessDetail.udyamCertificateDate || []),
          udyamCertificateDate,
        ];
      if (bankStatement !== undefined)
        fileProcessDetail.bankStatement = [
          ...(fileProcessDetail.bankStatement || []),
          bankStatement,
        ];
      if (bankStatementDate !== undefined)
        fileProcessDetail.bankStatementDate = [
          ...(fileProcessDetail.bankStatementDate || []),
          bankStatementDate,
        ];
      if (incomeDocument !== undefined)
        fileProcessDetail.incomeDocument = [
          ...(fileProcessDetail.incomeDocument || []),
          incomeDocument,
        ];
      if (incomeDocumentDate !== undefined)
        fileProcessDetail.incomeDocumentDate = [
          ...(fileProcessDetail.incomeDocumentDate || []),
          incomeDocumentDate,
        ];
      if (propertyPapers !== undefined)
        fileProcessDetail.propertyPapers = [
          ...(fileProcessDetail.propertyPapers || []),
          propertyPapers,
        ];
      if (propertyPapersDate !== undefined)
        fileProcessDetail.propertyPapersDate = [
          ...(fileProcessDetail.propertyPapersDate || []),
          propertyPapersDate,
        ];
      if (applicantPdc !== undefined)
        fileProcessDetail.applicantPdc = [
          ...(fileProcessDetail.applicantPdc || []),
          applicantPdc,
        ];
      if (applicantPdcDate !== undefined)
        fileProcessDetail.applicantPdcDate = [
          ...(fileProcessDetail.applicantPdcDate || []),
          applicantPdcDate,
        ];
      if (gurantorPdc !== undefined)
        fileProcessDetail.gurantorPdc = [
          ...(fileProcessDetail.gurantorPdc || []),
          gurantorPdc,
        ];
      if (gurantorPdcDate !== undefined)
        fileProcessDetail.gurantorPdcDate = [
          ...(fileProcessDetail.gurantorPdcDate || []),
          gurantorPdcDate,
        ];
      if (esignPhoto !== undefined)
        fileProcessDetail.esignPhoto = [
          ...(fileProcessDetail.esignPhoto || []),
          esignPhoto,
        ];
      if (esignPhotoDate !== undefined)
        fileProcessDetail.esignPhotoDate = [
          ...(fileProcessDetail.esignPhotoDate || []),
          esignPhotoDate,
        ];
      if (nachRegistration !== undefined)
        fileProcessDetail.nachRegistration = [
          ...(fileProcessDetail.nachRegistration || []),
          nachRegistration,
        ];
      if (nachRegistrationDate !== undefined)
        fileProcessDetail.nachRegistrationDate = [
          ...(fileProcessDetail.nachRegistrationDate || []),
          nachRegistrationDate,
        ];
      if (enachLink !== undefined)
        fileProcessDetail.enachLink = [
          ...(fileProcessDetail.enachLink || []),
          enachLink,
        ];
      if (enachLinkDate !== undefined)
        fileProcessDetail.enachLinkDate = [
          ...(fileProcessDetail.enachLinkDate || []),
          enachLinkDate,
        ];
      if (appEsignLink !== undefined)
        fileProcessDetail.appEsignLink = [
          ...(fileProcessDetail.appEsignLink || []),
          appEsignLink,
        ];
      if (appEsignLinkDate !== undefined)
        fileProcessDetail.appEsignLinkDate = [
          ...(fileProcessDetail.appEsignLinkDate || []),
          appEsignLinkDate,
        ];
      if (coAppEsignLink !== undefined)
        fileProcessDetail.coAppEsignLink = [
          ...(fileProcessDetail.coAppEsignLink || []),
          coAppEsignLink,
        ];
      if (coAppEsignLinkDate !== undefined)
        fileProcessDetail.coAppEsignLinkDate = [
          ...(fileProcessDetail.coAppEsignLinkDate || []),
          coAppEsignLinkDate,
        ];
      if (gtrEsignLink !== undefined)
        fileProcessDetail.gtrEsignLink = [
          ...(fileProcessDetail.gtrEsignLink || []),
          gtrEsignLink,
        ];
      if (gtrEsignLinkDate !== undefined)
        fileProcessDetail.gtrEsignLinkDate = [
          ...(fileProcessDetail.gtrEsignLinkDate || []),
          gtrEsignLinkDate,
        ];
      if (physicalFileCourier !== undefined)
        fileProcessDetail.physicalFileCourier = [
          ...(fileProcessDetail.physicalFileCourier || []),
          physicalFileCourier,
        ];
      if (physicalFileCourierDate !== undefined)
        fileProcessDetail.physicalFileCourierDate = [
          ...(fileProcessDetail.physicalFileCourierDate || []),
          physicalFileCourierDate,
        ];
      if (additional1 !== undefined)
        fileProcessDetail.additional1 = [
          ...(fileProcessDetail.additional1 || []),
          additional1,
        ];
      if (additional1Date !== undefined)
        fileProcessDetail.additional1Date = [
          ...(fileProcessDetail.additional1Date || []),
          additional1Date,
        ];
      if (additional2 !== undefined)
        fileProcessDetail.additional2 = [
          ...(fileProcessDetail.additional2 || []),
          additional2,
        ];
      if (additional2Date !== undefined)
        fileProcessDetail.additional2Date = [
          ...(fileProcessDetail.additional2Date || []),
          additional2Date,
        ];
      if (additional3 !== undefined)
        fileProcessDetail.additional3 = [
          ...(fileProcessDetail.additional3 || []),
          additional3,
        ];
      if (additional3Date !== undefined)
        fileProcessDetail.additional3Date = [
          ...(fileProcessDetail.additional3Date || []),
          additional3Date,
        ];
      if (additional4 !== undefined)
        fileProcessDetail.additional4 = [
          ...(fileProcessDetail.additional4 || []),
          additional4,
        ];
      if (additional4Date !== undefined)
        fileProcessDetail.additional4Date = [
          ...(fileProcessDetail.additional4Date || []),
          additional4Date,
        ];
      if (googleForm !== undefined)
        fileProcessDetail.googleForm = [
          ...(fileProcessDetail.googleForm || []),
          googleForm,
        ];
      if (googleFormDate !== undefined)
        fileProcessDetail.googleFormDate = [
          ...(fileProcessDetail.googleFormDate || []),
          googleFormDate,
        ];
      if (appCibilReport !== undefined)
        fileProcessDetail.appCibilReport = [
          ...(fileProcessDetail.appCibilReport || []),
          appCibilReport,
        ];
      if (appCibilReportDate !== undefined)
        fileProcessDetail.appCibilReportDate = [
          ...(fileProcessDetail.appCibilReportDate || []),
          appCibilReportDate,
        ];
      if (coAppCibilReport !== undefined)
        fileProcessDetail.coAppCibilReport = [
          ...(fileProcessDetail.coAppCibilReport || []),
          coAppCibilReport,
        ];
      if (coAppCibilReportDate !== undefined)
        fileProcessDetail.coAppCibilReportDate = [
          ...(fileProcessDetail.coAppCibilReportDate || []),
          coAppCibilReportDate,
        ];
      if (gtrCibilReport !== undefined)
        fileProcessDetail.gtrCibilReport = [
          ...(fileProcessDetail.gtrCibilReport || []),
          gtrCibilReport,
        ];
      if (gtrCibilReportDate !== undefined)
        fileProcessDetail.gtrCibilReportDate = [
          ...(fileProcessDetail.gtrCibilReportDate || []),
          gtrCibilReportDate,
        ];
      if (pdReportKyc !== undefined)
        fileProcessDetail.pdReportKyc = [
          ...(fileProcessDetail.pdReportKyc || []),
          pdReportKyc,
        ];
      if (pdReportKycDate !== undefined)
        fileProcessDetail.pdReportKycDate = [
          ...(fileProcessDetail.pdReportKycDate || []),
          pdReportKycDate,
        ];
      if (camReport !== undefined)
        fileProcessDetail.camReport = [
          ...(fileProcessDetail.camReport || []),
          camReport,
        ];
      if (camReportDate !== undefined)
        fileProcessDetail.camReportDate = [
          ...(fileProcessDetail.camReportDate || []),
          camReportDate,
        ];
      if (tvr !== undefined)
        fileProcessDetail.tvr = [...(fileProcessDetail.tvr || []), tvr];
      if (tvrDate !== undefined)
        fileProcessDetail.tvrDate = [
          ...(fileProcessDetail.tvrDate || []),
          tvrDate,
        ];
      if (legal !== undefined)
        fileProcessDetail.legal = [...(fileProcessDetail.legal || []), legal];
      if (legalDate !== undefined)
        fileProcessDetail.legalDate = [
          ...(fileProcessDetail.legalDate || []),
          legalDate,
        ];
      if (technical !== undefined)
        fileProcessDetail.technical = [
          ...(fileProcessDetail.technical || []),
          technical,
        ];
      if (technicalDate !== undefined)
        fileProcessDetail.technicalDate = [
          ...(fileProcessDetail.technicalDate || []),
          technicalDate,
        ];
      if (fc !== undefined)
        fileProcessDetail.fc = [...(fileProcessDetail.fc || []), fc];
      if (fcDate !== undefined)
        fileProcessDetail.fcDate = [
          ...(fileProcessDetail.fcDate || []),
          fcDate,
        ];
      if (soa !== undefined)
        fileProcessDetail.soa = [...(fileProcessDetail.soa || []), soa];
      if (soaDate !== undefined)
        fileProcessDetail.soaDate = [
          ...(fileProcessDetail.soaDate || []),
          soaDate,
        ];
      if (lod !== undefined)
        fileProcessDetail.lod = [...(fileProcessDetail.lod || []), lod];
      if (lodDate !== undefined)
        fileProcessDetail.lodDate = [
          ...(fileProcessDetail.lodDate || []),
          lodDate,
        ];
      if (sentForSanction !== undefined)
        fileProcessDetail.sentForSanction = [
          ...(fileProcessDetail.sentForSanction || []),
          sentForSanction,
        ];
      if (sentForSanctionDate !== undefined)
        fileProcessDetail.sentForSanctionDate = [
          ...(fileProcessDetail.sentForSanctionDate || []),
          sentForSanctionDate,
        ];
      if (sanctionFromPartner !== undefined)
        fileProcessDetail.sanctionFromPartner = [
          ...(fileProcessDetail.sanctionFromPartner || []),
          sanctionFromPartner,
        ];
      if (sanctionFromPartnerDate !== undefined)
        fileProcessDetail.sanctionFromPartnerDate = [
          ...(fileProcessDetail.sanctionFromPartnerDate || []),
          sanctionFromPartnerDate,
        ];
      // FORM 3
      if (rmPayment !== undefined)
        fileProcessDetail.rmPayment = [
          ...(fileProcessDetail.rmPayment || []),
          rmPayment,
        ];
      if (rmPaymentDate !== undefined)
        fileProcessDetail.rmPaymentDate = [
          ...(fileProcessDetail.rmPaymentDate || []),
          rmPaymentDate,
        ];
      if (rmBooked !== undefined)
        fileProcessDetail.rmBooked = [
          ...(fileProcessDetail.rmBooked || []),
          rmBooked,
        ];
      if (rmBookedDate !== undefined)
        fileProcessDetail.rmBookedDate = [
          ...(fileProcessDetail.rmBookedDate || []),
          rmBookedDate,
        ];
      if (rmReceived !== undefined)
        fileProcessDetail.rmReceived = [
          ...(fileProcessDetail.rmReceived || []),
          rmReceived,
        ];
      if (rmReceivedDate !== undefined)
        fileProcessDetail.rmReceivedDate = [
          ...(fileProcessDetail.rmReceivedDate || []),
          rmReceivedDate,
        ];
      // FORM 4
      if (rcuReport !== undefined)
        fileProcessDetail.rcuReport = [
          ...(fileProcessDetail.rcuReport || []),
          rcuReport,
        ];
      if (rcuReportDate !== undefined)
        fileProcessDetail.rcuReportDate = [
          ...(fileProcessDetail.rcuReportDate || []),
          rcuReportDate,
        ];
      if (esign !== undefined)
        fileProcessDetail.esign = [...(fileProcessDetail.esign || []), esign];
      if (esignDate !== undefined)
        fileProcessDetail.esignDate = [
          ...(fileProcessDetail.esignDate || []),
          esignDate,
        ];
      if (otherDisbursement !== undefined)
        fileProcessDetail.otherDisbursement = [
          ...(fileProcessDetail.otherDisbursement || []),
          otherDisbursement,
        ];
      if (otherDisbursementDate !== undefined)
        fileProcessDetail.otherDisbursementDate = [
          ...(fileProcessDetail.otherDisbursementDate || []),
          otherDisbursementDate,
        ];
      if (sentForDisbursement !== undefined)
        fileProcessDetail.sentForDisbursement = [
          ...(fileProcessDetail.sentForDisbursement || []),
          sentForDisbursement,
        ];
      if (sentForDisbursementDate !== undefined)
        fileProcessDetail.sentForDisbursementDate = [
          ...(fileProcessDetail.sentForDisbursementDate || []),
          sentForDisbursementDate,
        ];
      if (disbursementUTR !== undefined)
        fileProcessDetail.disbursementUTR = [
          ...(fileProcessDetail.disbursementUTR || []),
          disbursementUTR,
        ];
      if (disbursementUTRDate !== undefined)
        fileProcessDetail.disbursementUTRDate = [
          ...(fileProcessDetail.disbursementUTRDate || []),
          disbursementUTRDate,
        ];
      if (jainumEntry !== undefined)
        fileProcessDetail.jainumEntry = [
          ...(fileProcessDetail.jainumEntry || []),
          jainumEntry,
        ];
      if (jainumEntryDate !== undefined)
        fileProcessDetail.jainumEntryDate = [
          ...(fileProcessDetail.jainumEntryDate || []),
          jainumEntryDate,
        ];
      if (misUpdation !== undefined)
        fileProcessDetail.misUpdation = [
          ...(fileProcessDetail.misUpdation || []),
          misUpdation,
        ];
      if (misUpdationDate !== undefined)
        fileProcessDetail.misUpdationDate = [
          ...(fileProcessDetail.misUpdationDate || []),
          misUpdationDate,
        ];
      // FORM 5
      if (propertyPaperPartner !== undefined)
        fileProcessDetail.propertyPaperPartner = [
          ...(fileProcessDetail.propertyPaperPartner || []),
          propertyPaperPartner,
        ];
      if (propertyPaperPartnerDate !== undefined)
        fileProcessDetail.propertyPaperPartnerDate = [
          ...(fileProcessDetail.propertyPaperPartnerDate || []),
          propertyPaperPartnerDate,
        ];
      if (nocPartner !== undefined)
        fileProcessDetail.nocPartner = [
          ...(fileProcessDetail.nocPartner || []),
          nocPartner,
        ];
      if (nocPartnerDate !== undefined)
        fileProcessDetail.nocPartnerDate = [
          ...(fileProcessDetail.nocPartnerDate || []),
          nocPartnerDate,
        ];
      if (fileInventory !== undefined)
        fileProcessDetail.fileInventory = [
          ...(fileProcessDetail.fileInventory || []),
          fileInventory,
        ];
      if (fileInventoryDate !== undefined)
        fileProcessDetail.fileInventoryDate = [
          ...(fileProcessDetail.fileInventoryDate || []),
          fileInventoryDate,
        ];
      if (chequeInventory !== undefined)
        fileProcessDetail.chequeInventory = [
          ...(fileProcessDetail.chequeInventory || []),
          chequeInventory,
        ];
      if (chequeInventoryDate !== undefined)
        fileProcessDetail.chequeInventoryDate = [
          ...(fileProcessDetail.chequeInventoryDate || []),
          chequeInventoryDate,
        ];
      if (loanNo !== undefined)
        fileProcessDetail.loanNo = [
          ...(fileProcessDetail.loanNo || []),
          loanNo,
        ];
      if (loanNoDate !== undefined)
        fileProcessDetail.loanNoDate = [
          ...(fileProcessDetail.loanNoDate || []),
          loanNoDate,
        ];
      if (tagging !== undefined)
        fileProcessDetail.tagging = [
          ...(fileProcessDetail.tagging || []),
          tagging,
        ];
      if (taggingDate !== undefined)
        fileProcessDetail.taggingDate = [
          ...(fileProcessDetail.taggingDate || []),
          loanNoDate,
        ];

      // Update other fields as needed...
      fileProcessDetail[employeeIdField] = req.Id;

      const fileProcess = await fileProcessDetail.save();
      await saveToGoogleSheet(fileProcess);
      success(res, "File Process updated successfully", fileProcess);
    } else {
      // Create a new record with provided data
      let newFileProcess = new fileProcessModel({
        formType,
        LD,
        customerName,
        applicantKyc,
        applicantKycDate,
        coApplicantKyc,
        coApplicantKycDate,
        gaurantorKyc,
        gaurantorKycDate,
        electricityBill,
        elctricityBillDate,
        samagraId,
        samagraIdDate,
        udyamCertificate,
        udyamCertificateDate,
        bankStatement,
        bankStatementDate,
        incomeDocument,
        incomeDocumentDate,
        propertyPapers,
        propertyPapersDate,
        applicantPdc,
        applicantPdcDate,
        gurantorPdc,
        gurantorPdcDate,
        esignPhoto,
        esignPhotoDate,
        nachRegistration,
        nachRegistrationDate,
        enachLink,
        enachLinkDate,
        appEsignLink,
        appEsignLinkDate,
        coAppEsignLink,
        coAppEsignLinkDate,
        gtrEsignLink,
        gtrEsignLinkDate,
        physicalFileCourier,
        physicalFileCourierDate,
        additional1,
        additional1Date,
        additional2,
        additional2Date,
        additional3,
        additional3Date,
        additional4,
        additional4Date,
        appCibilReport,
        appCibilReportDate,
        coAppCibilReport,
        coAppCibilReportDate,
        gtrCibilReport,
        gtrCibilReportDate,
        pdReportKyc,
        pdReportKycDate,
        camReport,
        camReportDate,
        tvr,
        tvrDate,
        legal,
        legalDate,
        fc,
        fcDate,
        soa,
        soaDate,
        lod,
        lodDate,
        technical,
        technicalDate,
        rcuReport,
        rcuReportDate,
        googleForm,
        googleFormDate,
        sentForSanction,
        sentForSanctionDate,
        sanctionFromPartner,
        sanctionFromPartnerDate,
        rmPayment,
        rmPaymentDate,
        rmBooked,
        rmBookedDate,
        rmReceived,
        rmReceivedDate,
        sanctionDate,
        esign,
        esignDate,
        otherDisbursement,
        otherDisbursementDate,
        sentForDisbursement,
        sentForDisbursementDate,
        disbursementUTR,
        disbursementUTRDate,
        jainumEntry,
        jainumEntryDate,
        misUpdation,
        misUpdationDate,
        propertyPaperPartner,
        propertyPaperPartnerDate,
        nocPartner,
        nocPartnerDate,
        fileInventory,
        fileInventoryDate,
        chequeInventory,
        chequeInventoryDate,
        loanNo,
        loanNoDate,
        tagging,
        taggingDate,
      });

      const fileProcess = await newFileProcess.save();
      await saveToGoogleSheet(fileProcess);
      success(res, "New File Process added successfully", fileProcess);
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ---------------GET FILE PROCESS DETAIL WITH LD NUMBER------------------------
async function getFileProcessDetail(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const fileDetail = await fileProcessModel.aggregate([
      {
        $match: { LD: req.query.LD },
      },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId1",
          foreignField: "_id",
          as: "employeDetail1",
        },
      },
      {
        $project: {
          "employeDetail1.__v": 0,
          "employeDetail1.createdAt": 0,
          "employeDetail1.updatedAt": 0,
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId2",
          foreignField: "_id",
          as: "employeDetail2",
        },
      },
      {
        $project: {
          "employeDetail2.__v": 0,
          "employeDetail2.createdAt": 0,
          "employeDetail2.updatedAt": 0,
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId3",
          foreignField: "_id",
          as: "employeDetail3",
        },
      },
      {
        $project: {
          "employeDetail3.__v": 0,
          "employeDetail3.createdAt": 0,
          "employeDetail3.updatedAt": 0,
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId4",
          foreignField: "_id",
          as: "employeDetail4",
        },
      },
      {
        $project: {
          "employeDetail4.__v": 0,
          "employeDetail4.createdAt": 0,
          "employeDetail4.updatedAt": 0,
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId5",
          foreignField: "_id",
          as: "employeDetail5",
        },
      },
      {
        $project: {
          "employeDetail5.__v": 0,
          "employeDetail5.createdAt": 0,
          "employeDetail5.updatedAt": 0,
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId6",
          foreignField: "_id",
          as: "employeDetail6",
        },
      },
      {
        $project: {
          "employeDetail6.__v": 0,
          "employeDetail6.createdAt": 0,
          "employeDetail6.updatedAt": 0,
        },
      },
    ]);

    success(res, "Get File Process Detail", fileDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// --------------- update status for the file process ---------------------------

async function checkStatusDetail(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const {
      finalSanction,
      disbursement,
      finalDisbursement,
      reject,
      customerId,
      rejectRemark,
    } = req.query;
    const fileProcessData = await processModel.findOne({ customerId });
    const appPdcData = await appPdcModel.findOne({ customerId });
    const gtrPdcData = await gtrPdcModel.findOne({ customerId });
    const loanDocumentData = await loanDocumentModel.findOne({ customerId });

    const partnerCheck = await finalModel.findOne({ customerId });
    const coApplicantData = await coApplicantModel.find({ customerId });
    const applicantData = await applicantModel.findOne({ customerId });
    const guarantorData = await guarantorModel.findOne({ customerId });
    const cibilData = await cibilModel.findOne({ customerId });
    const SignKycDetails = await SignKycModel.findOne({ customerId });
    const customerDocumentDetails = await customerDocumentModel.findOne({
      customerId,
    });
    const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");

    // console.log(fileProcessData, "fileProcessData");

    let sanctionCompleted = false;
    let disbursementCompleted = false;
    let rejectCompleted = false;
    let finalDisbursementCompleted = false;
  
    console.log(fileProcessData.dependedDetailFormComplete, fileProcessData.bankDetailsFormComplete,
      fileProcessData.propertyPaperDetailFormComplete,fileProcessData.finalSanctionDetailsFormComplete,
      applicantData.kycUpload, Object.keys(applicantData.kycUpload).length,coApplicantData.length,
      Object.keys(coApplicantData[0].kycUpload).length,guarantorData.kycUpload,
      Object.keys(guarantorData.kycUpload).length ,
      cibilData?.applicantFetchHistory.length > 0 &&
      cibilData?.coApplicantData[0].coApplicantFetchHistory?.length > 0 &&
      customerDocumentDetails.signApplicantKyc.length,
      customerDocumentDetails.signCoApplicantKyc.length,
      customerDocumentDetails.signGurantorKyc.length,
      customerDocumentDetails.incomeDocument.utilityBillDocument?.length,
      customerDocumentDetails.incomeDocument.familyCardDocument?.length,
      customerDocumentDetails.incomeDocument.udyamCertificateDocument?.length,
      customerDocumentDetails.incomeDocument.bankStatementDocument?.length,
      customerDocumentDetails.incomeDocument.incomeStatemenDocument?.length,
      customerDocumentDetails.propertyDocuments.propertyDocument.length 
    )
    if (
      finalSanction === "finalSanction" &&
      fileProcessData.dependedDetailFormComplete === true &&
      // fileProcessData.udyamDetailsFormComplete === true &&
      // fileProcessData.electricityDetailsFormComplete === true &&
      fileProcessData.bankDetailsFormComplete === true &&
      // fileProcessData.propertyPaperDetailFormComplete === true &&
      // fileProcessData.cibilDetailFormComplete === true &&
      fileProcessData.finalSanctionDetailsFormComplete === true &&
      applicantData.kycUpload &&
      Object.keys(applicantData.kycUpload).length > 0 &&
      coApplicantData.length > 0 &&
      coApplicantData[0].kycUpload &&
      Object.keys(coApplicantData[0].kycUpload).length > 0 &&
      // coApplicantData.length > 0 && coApplicantData[1]?.kycUpload && Object.keys(coApplicantData[0]?.kycUpload).length > 0 &&
      // guarantorData.kycUpload &&
      // Object.keys(guarantorData.kycUpload).length > 0 &&
      cibilData?.applicantFetchHistory.length > 0 &&
      cibilData?.coApplicantData[0]?.coApplicantFetchHistory?.length > 0 &&
      // cibilData?.coApplicantData[1].coApplicantCibilReport?.length > 0 &&
      // cibilData?.guarantorFetchHistory.length > 0 &&
      customerDocumentDetails.signApplicantKyc.length > 0 &&
      customerDocumentDetails.signCoApplicantKyc.length > 0 &&
      customerDocumentDetails.signGurantorKyc.length > 0 &&
      customerDocumentDetails.incomeDocument.utilityBillDocument?.length > 0 &&
      customerDocumentDetails.incomeDocument.familyCardDocument?.length > 0 &&
      customerDocumentDetails.incomeDocument.udyamCertificateDocument?.length >
        0 &&
      customerDocumentDetails.incomeDocument.bankStatementDocument?.length >
        0 &&
      customerDocumentDetails.incomeDocument.incomeStatemenDocument?.length >
        0 &&
      customerDocumentDetails.propertyDocuments.propertyDocument.length > 0
    ) {
      const data = await finalSanctionModel.findOneAndUpdate(
        { customerId },
        { $set: { fileProcessSanctionStatus: "complete",
          fileProcessSanctionDate:todayDate
         } },
        { new: true, upsert: true }
      );
      sanctionCompleted = true;
    }

    // const loanDocumentData = await loanDocumentModel.findOne({ customerId });
    // Check for disbursement conditions

    if (
      finalDisbursement === "finalDisbursement" &&
      loanDocumentData.coOwnershipDeed.length > 0 &&
      loanDocumentData?.emOrRmDeed.length > 0
    ) {
      const data = await finalSanctionModel.findOneAndUpdate(
        { customerId },
        { $set: { fileProcessFinalDisbursementStatus: "complete",
          fileProcessFinalDisbursementDate:todayDate
         } },
        { new: true, upsert: true }
      );
      finalDisbursementCompleted = true;
    }

    // Check for final disbursement conditions
    if (
      disbursement === "disbursement" &&
      fileProcessData.pdcDetailsFormComplete === true &&
      fileProcessData.gurantorDetailsFormComplete === true &&
      loanDocumentData.applicantBSV.length > 0 &&
      loanDocumentData.guarantorBSV.length > 0 &&
      appPdcData.applicantPdcDocument.length > 0 &&
      gtrPdcData.guarantorPdcDocument.length > 0
    ) {
      const data = await finalSanctionModel.findOneAndUpdate(
        { customerId },
        { $set: { fileProcessDisbursementStatus: "complete",
          fileProcessDisbursementDate:todayDate
         } },
        { new: true, upsert: true }
      );
      disbursementCompleted = true;
    }
    //check for reject
    if (reject === "reject") {
      const data = await finalSanctionModel.findOneAndUpdate(
        { customerId },
        {
          $set: {
            fileProcessRejectStatus: "complete",
            fileProcessRejectRemark: rejectRemark,
            fileProcessRejectDate:todayDate
          },
        },
        { new: true, upsert: true }
      );
      rejectCompleted = true;
    }
    // Send response based on which conditions were met
    if (
      sanctionCompleted &&
      disbursementCompleted &&
      rejectCompleted &&
      finalDisbursementCompleted
    ) {
      success(res, "Sanction and disbursement completed successfully");
    } else if (sanctionCompleted) {
      success(res, "Sanction completed successfully");
    } else if (disbursementCompleted) {
      success(res, "Disbursement completed successfully");
    } else if (rejectCompleted) {
      success(res, "file rejetcted successfully");
    } else if (finalDisbursementCompleted) {
      success(res, " final disbursement completed successfully");
    } else {
      badRequest(res, "details are not completed successfully");
    }
         await fileProcessSheet(customerId)
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}


const customerListFileProcess = async (req, res) => {
  try {
    const employeeId = req.Id;
    const { pageLimit, pageNumber, search, status, branchId } = req.query;
    const { offset, limit } = paginationData(
      Number(pageLimit),
      Number(pageNumber)
    );

    // Fetch employee details and branch ID in parallel
    const [employeeDetail] = await Promise.all([
      employeModel.findById(employeeId).select("branchId"),
    ]);

    if (!employeeDetail) return badRequest(res, "Employee Not Found");

    let branchFilter = {};
    if (branchId !== "all")
      branchFilter = { branch: new mongoose.Types.ObjectId(branchId) };
    // if (!branchId && branchId !== "all") branchFilter = { branch: employeeDetail.branchId };
    console.log(branchFilter, "branchFilter<><><><><>");
    const searchFilter = {};
    if (search && search.trim() !== "") {
      searchFilter.$or = [
        { "branchDetail.name": { $regex: search, $options: "i" } },
        { "applicantDetail.fullName": { $regex: search, $options: "i" } },
        { customerFinId: { $regex: search, $options: "i" } },
        {
          $expr: {
            $regexMatch: {
              input: { $toString: "$mobileNo" },
              regex: search,
              options: "i",
            },
          },
        },
      ];
    }
    console.time("API Execution Time");
    console.log(searchFilter, "searchsearchsearchsearchsearchsearch");
    const aggregationPipeline = [
      { $match: branchFilter }, // Apply branch filter first
      {
        $lookup: {
          from: "externalvendordynamics",
          localField: "_id",
          foreignField: "customerId",
          pipeline: [
            {
              $match: {
                statusByCreditPd: { $in: ["complete", "approve"] },
                fileStatus: "active",
              },
            },
            { $project: { _id: 0 } },
          ],
          as: "externalVenderData",
        },
      },
      { $match: { externalVenderData: { $exists: true, $ne: [] } } },
      {
        $lookup: {
          from: "pdformdatas",
          localField: "_id",
          foreignField: "customerId",
          pipeline: [
            // { $match: { fileProcessStatus: { $in: [true, "true"] } } },
            { $match: { status: { $in: ["complete", "approve"] } } },
            { $project: { status: 1, bdCompleteDate: 1, pdId: 1 } },
          ],
          as: "pdData",
        },
      },
      { $match: { pdData: { $exists: true, $ne: [] } } },
      {
        $lookup: {
          from: "employees",
          localField: "pdData.pdId",
          foreignField: "_id",
          pipeline: [{ $project: { employeName: 1 } }],
          as: "pdCompleteDetails",
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "employeId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                employeName: 1,
                userName: 1,
                employeUniqueId: 1,
                reportingManagerId: 1,
                branchId: 1,
              },
            },
          ],
          as: "employeeDetail",
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "employeeDetail.reportingManagerId",
          foreignField: "_id",
          pipeline: [
            { $project: { employeName: 1, employeUniqueId: 1, userName: 1 } },
          ],
          as: "salesManagerDetails",
        },
      },
      {
        $lookup: {
          from: "newbranches",
          localField: "employeeDetail.branchId",
          foreignField: "_id",
          pipeline: [{ $project: { name: 1 } }],
          as: "branchDetail",
        },
      },
      {
        $lookup: {
          from: "applicantdetails",
          localField: "_id",
          foreignField: "customerId",
          pipeline: [
            {
              $project: {
                fullName: 1,
                fatherName: 1,
                mobileNo: 1,
                applicantPhoto: 1,
              },
            },
          ],
          as: "applicantDetail",
        },
      },
      {
        $lookup: {
          from: "finalsanctiondetaails",
          localField: "_id",
          foreignField: "customerId",
          pipeline: [
            {
              $lookup: {
                from: "lenders",
                localField: "partnerId",
                foreignField: "_id",
                as: "lendersData",
              },
            },
            {
              $project: {
                fileProcessSanctionStatus: 1,
                fileProcessDisbursementStatus: 1,
                fileProcessFinalDisbursementStatus: 1,
                fileProcessSendToSanctionStatus: 1,
                fileProcessSendDisbursementStatus: 1,
                fileProcessRejectRemark: 1,
                "lendersData.fullName": 1,
              },
            },
          ],
          as: "finalSanctionData",
        },
      },
      {
        $project: {
          _id: 1,
          employeId: 1,
          customerFinId: 1,
          mobileNo: 1,
          branch: 1,
          createdAt: 1,
          "pdData.status": 1,
          "pdData.bdCompleteDate": 1,
          "pdCompleteDetails.employeName": 1,
          "employeeDetail.employeName": {
            $arrayElemAt: ["$employeeDetail.employeName", 0],
          },
          "salesManagerDetails.employeName": {
            $arrayElemAt: ["$salesManagerDetails.employeName", 0],
          },
          "salesManagerDetails.employeUniqueId": {
            $arrayElemAt: ["$salesManagerDetails.employeUniqueId", 0],
          },
          "salesManagerDetails.userName": {
            $arrayElemAt: ["$salesManagerDetails.userName", 0],
          },
          "branchDetail.name": { $arrayElemAt: ["$branchDetail.name", 0] },
          "applicantDetail.fullName": {
            $arrayElemAt: ["$applicantDetail.fullName", 0],
          },
          "applicantDetail.fatherName": {
            $arrayElemAt: ["$applicantDetail.fatherName", 0],
          },
          "applicantDetail.mobileNo": {
            $arrayElemAt: ["$applicantDetail.mobileNo", 0],
          },

          TAT: {
            $cond: {
              if: { $gt: [{ $size: "$pdData.bdCompleteDate" }, 0] }, // Check if bdCompleteDate exists
              then: {
                $let: {
                  vars: {
                    cleanedDate: {
                      $dateFromString: {
                        dateString: {
                          $trim: {
                            input: {
                              $replaceAll: {
                                input: {
                                  $replaceAll: {
                                    input: {
                                      $arrayElemAt: [
                                        "$pdData.bdCompleteDate",
                                        0,
                                      ],
                                    },
                                    find: " PM",
                                    replacement: "",
                                  },
                                },
                                find: " AM",
                                replacement: "",
                              },
                            },
                          },
                        },
                        format: "%Y-%m-%dT%H:%M:%S", // Corrected format
                        onError: null, // Avoid errors for incorrect formats
                      },
                    },
                    today: "$$NOW",
                  },
                  in: {
                    $cond: {
                      if: { $ne: ["$$cleanedDate", null] },
                      then: {
                        $dateDiff: {
                          startDate: "$$cleanedDate",
                          endDate: "$$today",
                          unit: "day",
                        },
                      },
                      else: null,
                    },
                  },
                },
              },
              else: null,
            },
          }, //
          finalSanctionData: {
            _id: { $arrayElemAt: ["$finalSanctionData._id", 0] },
            lenderFullName: {
              $ifNull: [
                {
                  $arrayElemAt: [
                    {
                      $arrayElemAt: [
                        "$finalSanctionData.lendersData.fullName",
                        0,
                      ],
                    },
                    0,
                  ],
                },
                "",
              ],
            },
            fileProcessSanctionStatus: {
              $arrayElemAt: ["$finalSanctionData.fileProcessSanctionStatus", 0],
            },
            fileProcessDisbursementStatus: {
              $arrayElemAt: [
                "$finalSanctionData.fileProcessDisbursementStatus",
                0,
              ],
            },
            fileProcessFinalDisbursementStatus: {
              $arrayElemAt: [
                "$finalSanctionData.fileProcessFinalDisbursementStatus",
                0,
              ],
            },
            fileProcessSendToSanctionStatus: {
              $arrayElemAt: [
                "$finalSanctionData.fileProcessSendToSanctionStatus",
                0,
              ],
            },
            fileProcessSendDisbursementStatus: {
              $arrayElemAt: [
                "$finalSanctionData.fileProcessSendDisbursementStatus",
                0,
              ],
            },
            fileProcessRejectRemark: {
              $arrayElemAt: ["$finalSanctionData.fileProcessRejectRemark", 0],
            },
            fileProcess: {
              $switch: {
                branches: [
                  {
                    case: {
                      $and: [
                        {
                          $eq: [
                            {
                              $arrayElemAt: [
                                "$finalSanctionData.fileProcessSanctionStatus",
                                0,
                              ],
                            },
                            "pending",
                          ],
                        },
                        {
                          $eq: [
                            {
                              $arrayElemAt: [
                                "$finalSanctionData.fileProcessDisbursementStatus",
                                0,
                              ],
                            },
                            "pending",
                          ],
                        },
                        {
                          $eq: [
                            {
                              $arrayElemAt: [
                                "$finalSanctionData.fileProcessFinalDisbursementStatus",
                                0,
                              ],
                            },
                            "pending",
                          ],
                        },
                      ],
                    },
                    then: "",
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [
                            {
                              $arrayElemAt: [
                                "$finalSanctionData.fileProcessSanctionStatus",
                                0,
                              ],
                            },
                            "complete",
                          ],
                        },
                        {
                          $eq: [
                            {
                              $arrayElemAt: [
                                "$finalSanctionData.fileProcessDisbursementStatus",
                                0,
                              ],
                            },
                            "pending",
                          ],
                        },
                        {
                          $eq: [
                            {
                              $arrayElemAt: [
                                "$finalSanctionData.fileProcessFinalDisbursementStatus",
                                0,
                              ],
                            },
                            "pending",
                          ],
                        },
                      ],
                    },
                    then: "send for Sanction",
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [
                            {
                              $arrayElemAt: [
                                "$finalSanctionData.fileProcessSanctionStatus",
                                0,
                              ],
                            },
                            "complete",
                          ],
                        },
                        {
                          $eq: [
                            {
                              $arrayElemAt: [
                                "$finalSanctionData.fileProcessDisbursementStatus",
                                0,
                              ],
                            },
                            "complete",
                          ],
                        },
                        {
                          $eq: [
                            {
                              $arrayElemAt: [
                                "$finalSanctionData.fileProcessFinalDisbursementStatus",
                                0,
                              ],
                            },
                            "pending",
                          ],
                        },
                      ],
                    },
                    then: "send for Disbursement",
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [
                            {
                              $arrayElemAt: [
                                "$finalSanctionData.fileProcessSanctionStatus",
                                0,
                              ],
                            },
                            "complete",
                          ],
                        },
                        {
                          $eq: [
                            {
                              $arrayElemAt: [
                                "$finalSanctionData.fileProcessDisbursementStatus",
                                0,
                              ],
                            },
                            "complete",
                          ],
                        },
                        {
                          $eq: [
                            {
                              $arrayElemAt: [
                                "$finalSanctionData.fileProcessFinalDisbursementStatus",
                                0,
                              ],
                            },
                            "complete",
                          ],
                        },
                      ],
                    },
                    then: "send for FinalDisbursement",
                  },
                ],
                default: "",
              },
            },
            hoStatus: {
              $switch: {
                branches: [
                  {
                    case: {
                      $and: [
                        {
                          $eq: [
                            {
                              $arrayElemAt: [
                                "$finalSanctionData.fileProcessSendToSanctionStatus",
                                0,
                              ],
                            },
                            "pending",
                          ],
                        },
                        {
                          $eq: [
                            {
                              $arrayElemAt: [
                                "$finalSanctionData.fileProcessSendDisbursementStatus",
                                0,
                              ],
                            },
                            "pending",
                          ],
                        },
                      ],
                    },
                    then: "",
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [
                            {
                              $arrayElemAt: [
                                "$finalSanctionData.fileProcessSendToSanctionStatus",
                                0,
                              ],
                            },
                            "complete",
                          ],
                        },
                        {
                          $eq: [
                            {
                              $arrayElemAt: [
                                "$finalSanctionData.fileProcessSendDisbursementStatus",
                                0,
                              ],
                            },
                            "pending",
                          ],
                        },
                      ],
                    },
                    then: "send for Sanction",
                  },
                  {
                    case: {
                      $and: [
                        {
                          $eq: [
                            {
                              $arrayElemAt: [
                                "$finalSanctionData.fileProcessSendToSanctionStatus",
                                0,
                              ],
                            },
                            "complete",
                          ],
                        },
                        {
                          $eq: [
                            {
                              $arrayElemAt: [
                                "$finalSanctionData.fileProcessSendDisbursementStatus",
                                0,
                              ],
                            },
                            "complete",
                          ],
                        },
                      ],
                    },
                    then: "send for Disbursement",
                  },
                ],
                default: "",
              },
            },
          },
        },
      },
      { $match: searchFilter },
      { $skip: offset },
      { $limit: limit },
    ];

    const countAggregation = [
      { $match: branchFilter }, // Apply branch filter first
      {
        $lookup: {
          from: "externalvendordynamics",
          localField: "_id",
          foreignField: "customerId",
          pipeline: [
            {
              $match: {
                statusByCreditPd: { $in: ["complete", "approve"] },
                fileStatus: "active",
              },
            },
            { $project: { _id: 0 } },
          ],
          as: "externalVenderData",
        },
      },
      { $match: { externalVenderData: { $exists: true, $ne: [] } } },
      {
        $lookup: {
          from: "pdformdatas",
          localField: "_id",
          foreignField: "customerId",
          pipeline: [
            // { $match: { fileProcessStatus: { $in: [true, "true"] } } },
            // { $match: { status: { $in: ["complete", "approve"] } } },
            { $project: { status: 1, bdCompleteDate: 1, pdId: 1 } },
          ],
          as: "pdData",
        },
      },
      { $match: { pdData: { $exists: true, $ne: [] } } },
      {
        $lookup: {
          from: "employees",
          localField: "pdData.pdId",
          foreignField: "_id",
          pipeline: [{ $project: { employeName: 1 } }],
          as: "pdCompleteDetails",
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "employeId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                employeName: 1,
                userName: 1,
                employeUniqueId: 1,
                reportingManagerId: 1,
                branchId: 1,
              },
            },
          ],
          as: "employeeDetail",
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "employeeDetail.reportingManagerId",
          foreignField: "_id",
          pipeline: [
            { $project: { employeName: 1, employeUniqueId: 1, userName: 1 } },
          ],
          as: "salesManagerDetails",
        },
      },
      {
        $lookup: {
          from: "newbranches",
          localField: "employeeDetail.branchId",
          foreignField: "_id",
          pipeline: [{ $project: { name: 1 } }],
          as: "branchDetail",
        },
      },
      {
        $lookup: {
          from: "applicantdetails",
          localField: "_id",
          foreignField: "customerId",
          pipeline: [
            {
              $project: {
                fullName: 1,
                fatherName: 1,
                mobileNo: 1,
                applicantPhoto: 1,
              },
            },
          ],
          as: "applicantDetail",
        },
      },
      {
        $lookup: {
          from: "finalsanctiondetaails",
          localField: "_id",
          foreignField: "customerId",
          pipeline: [
            {
              $lookup: {
                from: "lenders",
                localField: "partnerId",
                foreignField: "_id",
                as: "lendersData",
              },
            },
            {
              $project: {
                fileProcessSanctionStatus: 1,
                fileProcessDisbursementStatus: 1,
                fileProcessFinalDisbursementStatus: 1,
                fileProcessSendToSanctionStatus: 1,
                fileProcessSendDisbursementStatus: 1,
                fileProcessRejectRemark: 1,
                "lendersData.fullName": 1,
              },
            },
          ],
          as: "finalSanctionData",
        },
      },
      { $match: searchFilter },
    ];
    const results = await customerModel.aggregate(aggregationPipeline);
    const result = await customerModel.aggregate(countAggregation);

    console.timeEnd("API Execution Time");

    return success(res, "customerDetails", {
      totalCount: result.length,
      userDataLength: results.length,
      userData: results,
    });
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
};

const addSelfAssign = async (req, res) => {
  try {
    const empId = req.Id; // Employee ID from the request
    const { customerId, fileProcessSelfAssign } = req.query;
    console.log(customerId, fileProcessSelfAssign, empId);

    const partnerCheck = await finalSanctionModel.findOne({ customerId });

    if (!partnerCheck && !fileProcessSelfAssign) {
      return success(res, "self assigned details", {
        fileProcessSelfAssign: false,
      });
    }

    if (partnerCheck && !fileProcessSelfAssign) {
      return success(res, "self assigned details", {
        fileProcessSelfAssign: partnerCheck?.fileProcessSelfAssign,
      });
    }
    let updateData;
    if (customerId && fileProcessSelfAssign == "true") {
      // Check if customerId is provided
      updateData = {
        customerId,
        fileProcessEmployeeId: empId,
        fileProcessSelfAssign: fileProcessSelfAssign, // Default to false if not provided
      };
    }
    if (customerId && fileProcessSelfAssign == "false") {
      // Check if customerId is provided
      updateData = {
        customerId,
        fileProcessEmployeeId: null,
        fileProcessSelfAssign: fileProcessSelfAssign, // Default to false if not provided
      };
    }
    const partnerData = await finalSanctionModel.findOneAndUpdate(
      { customerId }, // Match by customerId
      { $set: updateData }, // Update or set the fields
      { new: true, upsert: true } // Create a new document if none exists
    );

    return success(res, "Self-assigned successfully", {
      fileProcessSelfAssign: partnerData.fileProcessSelfAssign,
    });
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
};

const selfAssignList = async (req, res) => {
  try {
    const empId = new mongoose.Types.ObjectId(req.Id);
    const { pageLimit, pageNumber, search } = req.query;
    const { offset, limit } = paginationData(pageLimit, pageNumber);
    console.log(empId, "empId");
    // console.log(empId,'empId')
    // Build search filter
    const searchFilter = {};
    if (search) {
      searchFilter.$or = [
        { "nearestBranchData.name": { $regex: search, $options: "i" } }, // Branch name (case-insensitive)
        { "applicantDetail.fullName": { $regex: search, $options: "i" } }, // Applicant name (case-insensitive)
        { customerFinId: { $regex: search, $options: "i" } },
        {
          $expr: {
            $regexMatch: {
              input: { $toString: "$mobileNo" }, // Convert numeric field to string
              regex: search,
              options: "i",
            },
          },
        }, // Mobile number as string (case-insensitive)
      ];
    }

    const userData = await customerModel.aggregate([
      // Lookup pdData with filtered pipeline
      {
        $lookup: {
          from: "externalvendordynamics",
          let: { customerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$customerId", "$$customerId"] },
                statusByCreditPd: { $in: ["complete", "approve"] },
                fileStatus: { $in: ["active"] },
              },
            },
            {
              $project: {
                customerId: 1,
                statusByCreditPd: 1,
                fileStatus: 1,
              },
            },
          ],
          as: "externalVenderData",
        },
      },
      { $match: { externalVenderData: { $ne: [] } } },
      {
        $lookup: {
          from: "pdformdatas",
          let: { customerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$customerId", "$$customerId"] }, // Match customerId
                    // { $eq: ["$defaultStatus", true] },       // Match defaultStatus as true
                    {
                      $or: [
                        { $eq: ["$fileProcessStatus", true] }, // Match status "approve"
                      ],
                    },
                  ],
                },
              },
            },
            {
              $project: {
                status: 1,
                bdCompleteDate: 1,
                pdId: 1,
                hoStatus: 1,
                hoRemark: 1,
              },
            },
          ],
          as: "pdData",
        },
      },
      // Match customers with pdData
      { $match: { pdData: { $ne: [] } } },
      {
        $lookup: {
          from: "employees",
          let: { pdId: { $arrayElemAt: ["$pdData.pdId", 0] } }, // Lookup using the first pdId
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$pdId"] } } },
            { $project: { employeName: 1 } },
          ],
          as: "pdCompleteDetails",
        },
      },
      // Lookup employeeDetail and branchDetail in one go
      {
        $lookup: {
          from: "employees",
          let: { employeeId: "$employeId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$employeeId"] } } },
            {
              $project: {
                employeName: 1,
                userName: 1,
                employeUniqueId: 1,
                reportingManagerId: 1,
                branchId: 1,
              },
            },
          ],
          as: "employeeDetail",
        },
      },
      // Lookup salesManagerDetails
      {
        $lookup: {
          from: "employees",
          let: {
            reportingManagerId: {
              $arrayElemAt: ["$employeeDetail.reportingManagerId", 0],
            },
          },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$reportingManagerId"] } } },
            { $project: { employeName: 1, employeUniqueId: 1, userName: 1 } },
          ],
          as: "salesManagerDetails",
        },
      },
      // Lookup branchDetail
      {
        $lookup: {
          from: "newbranches",
          let: { branchId: { $arrayElemAt: ["$employeeDetail.branchId", 0] } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$branchId"] } } },
            { $project: { name: 1 } },
          ],
          as: "branchDetail",
        },
      },
      // Lookup applicantDetail
      {
        $lookup: {
          from: "applicantdetails",
          localField: "_id",
          foreignField: "customerId",
          pipeline: [
            {
              $project: {
                fullName: 1,
                fatherName: 1,
                mobileNo: 1,
                applicantPhoto: 1,
                applicantAddress: "$permanentAddress.addressLine1",
              },
            },
          ],
          as: "applicantDetail",
        },
      },
      // Lookup cibildetailDetail
      {
        $lookup: {
          from: "cibildetails",
          localField: "_id",
          foreignField: "customerId",
          pipeline: [{ $project: { applicantCibilScore: 1 } }],
          as: "cibildetailDetail",
        },
      },
      // Lookup finalSanctionData with nested employee details
      {
        $lookup: {
          from: "finalsanctiondetaails",
          localField: "_id",
          foreignField: "customerId",
          pipeline: [
            {
              $match: {
                $and: [
                  { fileProcessEmployeeId: { $exists: true, $ne: null } },
                  { fileProcessSelfAssign: { $exists: true, $eq: true } },
                  { fileProcessEmployeeId: empId },
                ],
              },
            },
            {
              $lookup: {
                from: "employees",
                localField: "employeeId",
                foreignField: "_id",
                as: "employeeDetail",
              },
            },
            {
              $addFields: {
                isEmployeeIdMissing: {
                  $not: { $ifNull: ["$employeeId", false] },
                },
                esignLinkStatus: {
                  $cond: [
                    {
                      $and: [
                        { $eq: [{ $type: "$esignLink" }, "array"] },
                        {
                          $gt: [{ $size: { $ifNull: ["$esignLink", []] } }, 0],
                        },
                      ],
                    },
                    "Yes",
                    "No",
                  ],
                },
              },
            },
          ],
          as: "finalSanctionData",
        },
      },
      {
        $lookup: {
          from: "bankstatementkycs",
          localField: "_id",
          foreignField: "customerId",
          pipeline: [
            { $match: { Nachlink: { $nin: ["", null] } } }, // Filter out empty/null Nachlink earlier
            { $project: { Nachlink: 1 } },
          ],
          as: "bankStatementKycDetail",
        },
      },

      // Add field to check if Nachlink exists
      {
        $addFields: {
          hasNachLink: {
            $cond: {
              if: { $gt: [{ $size: "$bankStatementKycDetail" }, 0] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $lookup: {
          from: "externalvendordynamics",
          localField: "_id",
          foreignField: "customerId",
          as: "externalVendorDetail",
          pipeline: [
            {
              $project: {
                vendors: {
                  $map: {
                    input: "$vendors",
                    as: "vendor",
                    in: {
                      vendorType: "$$vendor.vendorType",
                      statusByVendor: "$$vendor.statusByVendor",
                    },
                  },
                },
              },
            },
          ],
        },
      },
      // Final Projection
      {
        $project: {
          _id: 1,
          employeId: 1,
          productId: 1,
          customerFinId: 1,
          mobileNo: 1,
          executiveName: 1,
          "finalSanctionData.fileProcessEmployeeId": 1,
          "externalVenderData.customerId": 1,
          "externalVenderData.statusByCreditPd": 1,
          "externalVenderData.fileStatus": 1,
          "pdData.status": 1,
          "pdData.bdCompleteDate": 1,
          "pdCompleteDetails.employeName": 1,
          "pdData.hoStatus": 1,
          "pdData.hoRemark": 1,
          "employeeDetail.employeName": {
            $arrayElemAt: ["$employeeDetail.employeName", 0],
          },
          "employeeDetail.userName": {
            $arrayElemAt: ["$employeeDetail.userName", 0],
          },
          "employeeDetail.employeUniqueId": {
            $arrayElemAt: ["$employeeDetail.employeUniqueId", 0],
          },
          "salesManagerDetails.employeName": {
            $arrayElemAt: ["$salesManagerDetails.employeName", 0],
          },
          "salesManagerDetails.employeUniqueId": {
            $arrayElemAt: ["$salesManagerDetails.employeUniqueId", 0],
          },
          "salesManagerDetails.userName": {
            $arrayElemAt: ["$salesManagerDetails.userName", 0],
          },
          "branchDetail.name": { $arrayElemAt: ["$branchDetail.name", 0] },
          "applicantDetail.fullName": {
            $arrayElemAt: ["$applicantDetail.fullName", 0],
          },
          "applicantDetail.fatherName": {
            $arrayElemAt: ["$applicantDetail.fatherName", 0],
          },
          "applicantDetail.mobileNo": {
            $arrayElemAt: ["$applicantDetail.mobileNo", 0],
          },
          "applicantDetail.applicantPhoto": {
            $arrayElemAt: ["$applicantDetail.applicantPhoto", 0],
          },
          "applicantDetail.applicantAddress": {
            $arrayElemAt: ["$applicantDetail.applicantAddress", 0],
          },
          "cibildetailDetail.applicantCibilScore": {
            $arrayElemAt: ["$cibildetailDetail.applicantCibilScore", 0],
          },
          finalSanctionData: {
            _id: { $arrayElemAt: ["$finalSanctionData._id", 0] },
            status: { $arrayElemAt: ["$finalSanctionData.status", 0] },
            employeeId: { $arrayElemAt: ["$finalSanctionData.employeeId", 0] },
            employeeDetail: {
              employeName: {
                $arrayElemAt: [
                  {
                    $arrayElemAt: [
                      "$finalSanctionData.employeeDetail.employeName",
                      0,
                    ],
                  },
                  0,
                ],
              },
            },
            finalLoanAmount: {
              $arrayElemAt: ["$finalSanctionData.finalLoanAmount", 0],
            },
            roi: { $arrayElemAt: ["$finalSanctionData.roi", 0] },
            tenureInMonth: {
              $arrayElemAt: ["$finalSanctionData.tenureInMonth", 0],
            },
            selfAssignStatus: {
              $cond: {
                if: {
                  $gt: [
                    { $arrayElemAt: ["$finalSanctionData.employeeId", 0] },
                    null,
                  ],
                },
                then: true,
                else: false,
              },
            },
            esignLinkStatus: {
              $cond: {
                if: {
                  $and: [
                    {
                      $eq: [
                        {
                          $type: {
                            $arrayElemAt: ["$finalSanctionData.esignLink", 0],
                          },
                        },
                        "array",
                      ],
                    },
                    {
                      $gt: [
                        {
                          $size: {
                            $ifNull: [
                              {
                                $arrayElemAt: [
                                  "$finalSanctionData.esignLink",
                                  0,
                                ],
                              },
                              [],
                            ],
                          },
                        },
                        0,
                      ],
                    },
                  ],
                },
                then: "Yes",
                else: "No",
              },
            },
          },
          hasNachLink: 1,
          externalVendorDetail: {
            $arrayElemAt: ["$externalVendorDetail.vendors", 0],
          },
        },
      },
      { $match: searchFilter },
      {
        $skip: offset,
      },
      {
        $limit: limit,
      },
    ]);

    // Fetch total count without pagination for accurate results
    const totalCount = await customerModel.aggregate([
      {
        $lookup: {
          from: "newbranches",
          localField: "nearestBranchId",
          foreignField: "_id",
          as: "nearestBranchData",
        },
      },
      {
        $lookup: {
          from: "applicantdetails",
          localField: "_id",
          foreignField: "customerId",
          as: "applicantDetail",
        },
      },
      {
        $unwind: {
          path: "$applicantDetail",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "cibildetails",
          localField: "_id",
          foreignField: "customerId",
          as: "cibildetailDetail",
        },
      },
      {
        $unwind: {
          path: "$cibildetailDetail",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "pdformdatas",
          localField: "_id",
          foreignField: "customerId",
          as: "pdData",
        },
      },
      {
        $unwind: {
          path: "$pdData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "finalsanctiondetaails",
          localField: "_id",
          foreignField: "customerId",
          as: "finalSanctionData",
        },
      },
      {
        $unwind: {
          path: "$finalSanctionData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          $and: [
            {
              $or: [
                { "pdData.status": "complete" },
                { "pdData.status": "approve" },
              ],
            },
            {
              $and: [
                { "finalSanctionData.fileProcessSelfAssign": true },
                { "finalSanctionData.fileProcessEmployeeId": empId },
              ],
            },
          ],
        },
      },
      {
        $project: {
          "nearestBranchData.name": 1,
          "applicantDetail.fullName": 1,
          mobileNo: 1,
        },
      },
      // Match filter for total count
      { $match: searchFilter },
    ]);

    return success(res, "All file process self assign customer details List", {
      totalCount: totalCount.length,
      userDataLength: userData.length,
      userData,
    });
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
};

const fileProcessStatus = async (req, res) => {
  try {
    const empId = req.Id; // Employee ID from the request
    const { customerId } = req.query;
    // console.log(customerId,"customerId")
    const partnerCheck = await finalSanctionModel.findOne({ customerId });
    // console.log(partnerCheck,"partnerCheck")
     success(res, "data fetched  successfully", {
      fileProcessSanctionStatus: partnerCheck?.fileProcessSanctionStatus || "",
      fileProcessDisbursementStatus:
        partnerCheck?.fileProcessDisbursementStatus || "",
      fileProcessFinalDisbursementStatus:
        partnerCheck?.fileProcessFinalDisbursementStatus || "",
      fileProcessRejectStatus: partnerCheck?.fileProcessRejectStatus || "",
    });

  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
};
// send to Ho
const updateStatus = async (req, res) => {
  try {
    const { customerId, type, status, remark } = req.query;

    if (!customerId || !type) {
      return badRequest(res, "Missing required fields: customerId or type");
    }

            
    const customerDetails = await customerModel.findById(customerId);
    if (!customerDetails) {
      return badRequest(res, "Customer not found");
    }

    const processDetails = await processModel.findOne({ customerId });
    const finalData = await finalModel.findOne({ customerId });
    const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");

    // console.log(finalData.disbursementZipUrl.length,"documentData?.sanctionZipUrl")
    if (type === "disbursement") {
      if (finalData.fileProcessDisbursementStatus == "complete") {
        await finalModel.findOneAndUpdate(
          { customerId },
          { $set: { fileProcessSendDisbursementStatus: "complete",
            fileProcessSendDisbursementDate:todayDate
           } }
        );
        return success(res, "Pre disbursement successfully completed");
      } else {
        return badRequest(res, "Please complete  disbursement details");
      }
    }
    if (type === "finalSanction") {
      if (finalData.fileProcessSanctionStatus == "complete") {
        await finalModel.findOneAndUpdate(
          { customerId },
          { $set: { fileProcessSendToSanctionStatus: "complete",
            fileProcessFinalDisbursementDate:todayDate
           } }
        );



    const { employeId, customerFinId } = customerDetails;


    const toEmails = [];
    const ccEmails = [];

    if (req.headers.host.includes("prod.fincooper.in")) {
      ccEmails.push("finexe@fincoopers.com");
      // toEmails.push("")
    } else {
      toEmails.push("");
      // ccEmails.push('')
    }

    const applicantDetails = await applicantModel.findOne({ customerId });
    if (!applicantDetails) {
      return badRequest(res, "Applicant details not found");
    }

    const fullName = applicantDetails.fullName?.toUpperCase() || "";

        const subject = `Submission of File for Sanction // ${customerFinId} // ${fullName}`;

        const pdfContent = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <div style="border-top: 1px solid #cccccc; padding-top: 10px; margin-top: 10px;">
              <p>Dear Team,</p>
              <p>We have submitted the necessary documents and details in Finexe for your review and sanction.</p>
              
              <p>We kindly request your prompt review of the files and proceeding with the sanctioning process.</p>
        
              <p>Should you need any additional information or have further questions, please feel free to reach out.</p>
          
              <p>Best regards,</p>
              <p>Team Fin Coopers</p>
            </div>
          </div>
        `;

        const sanctionSubmission = await mailSwitchesModel.findOne()
        if(sanctionSubmission.masterMailStatus && sanctionSubmission.newFileManagementMail && sanctionSubmission.sanctionSubmissionMail){
          await sendEmailByVendor("sanctionSubmission", toEmails, ccEmails, subject, pdfContent);
        }

        return success(res, "Sanction successfully completed");
      } else {
        return badRequest(res, "Please complete sanction details");
      }
    }
    if (type === "reject") {
      if (finalData.fileProcessSanctionStatus == "complete") {
        await finalModel.findOneAndUpdate(
          { customerId },
          {
            $set: {
              fileProcessRejectStatus: "complete",
              fileProcessRejectRemark: remark,
              fileProcessRejectDate:todayDate
            },
          }
        );
         success(res, "rejected successfully ");
         await fileProcessSheet(customerId)
      } else {
        return badRequest(res, "Not rejected");
      }
    }
    return badRequest(res, "Invalid type provided");
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
};

async function allFinalSanctionDashboard(req, res) {
  try {
    // Extract query parameters with defaults
    const {
      startDateFilter,
      endDateFilter,
      fileProcessSanctionStatus,
      fileProcessSendDisbursementStatus,
      fileProcessSendToSanctionStatus,
      fileProcessDisbursementStatus,
      fileProcessFinalDisbursementStatus,
      fileProcessRejectStatus,
      branchList,
      employeeList,
      productList,
      partnerId,
      status,
      limit = 10000,
      page = 1,
      searchQuery,
    } = req.query;

    // Build dynamic match conditions
    let matchConditions = {};

    // Apply date filtering only if both dates are provided and not set to "all"
    if (
      startDateFilter &&
      endDateFilter &&
      startDateFilter !== "all" &&
      endDateFilter !== "all"
    ) {
      const formattedStart = new Date(
        new Date(startDateFilter).setHours(0, 0, 0, 0)
      );
      const formattedEnd = new Date(
        new Date(endDateFilter).setHours(23, 59, 59, 999)
      );
      matchConditions.createdAt = { $gte: formattedStart, $lt: formattedEnd };
    }

    // Apply filters for each status field if provided (assumes comma-separated values)
    if (fileProcessSanctionStatus && fileProcessSanctionStatus !== "all") {
      matchConditions.fileProcessSanctionStatus = {
        $in: fileProcessSanctionStatus.split(","),
      };
    }
    if (
      fileProcessSendDisbursementStatus &&
      fileProcessSendDisbursementStatus !== "all"
    ) {
      matchConditions.fileProcessSendDisbursementStatus = {
        $in: fileProcessSendDisbursementStatus.split(","),
      };
    }
    if (
      fileProcessSendToSanctionStatus &&
      fileProcessSendToSanctionStatus !== "all"
    ) {
      matchConditions.fileProcessSendToSanctionStatus = {
        $in: fileProcessSendToSanctionStatus.split(","),
      };
    }
    if (
      fileProcessDisbursementStatus &&
      fileProcessDisbursementStatus !== "all"
    ) {
      matchConditions.fileProcessDisbursementStatus = {
        $in: fileProcessDisbursementStatus.split(","),
      };
    }
    if (
      fileProcessFinalDisbursementStatus &&
      fileProcessFinalDisbursementStatus !== "all"
    ) {
      matchConditions.fileProcessFinalDisbursementStatus = {
        $in: fileProcessFinalDisbursementStatus.split(","),
      };
    }
    if (fileProcessRejectStatus && fileProcessRejectStatus !== "all") {
      matchConditions.fileProcessRejectStatus = {
        $in: fileProcessRejectStatus.split(","),
      };
    }
    if (status && status !== "all") {
      matchConditions.status = { $in: status.split(",") };
    }

    // Apply partnerId filter if provided
    if (partnerId && partnerId !== "all") {
      matchConditions.partnerId = partnerId; // Add partnerId to match conditions
    }

    // Optionally add a search query (for example, on applicantName or contact)
    if (searchQuery) {
      matchConditions.$or = [
        { applicantName: { $regex: searchQuery, $options: "i" } },
        { contact: { $regex: searchQuery, $options: "i" } },
      ];
    }

    const aggregationPipeline = [
      // Match based on dynamic filters (startDate, endDate, status, etc.)
      { $match: matchConditions },

      // Lookup externalVenderData
      {
        $lookup: {
          from: "externalvendordynamics",
          localField: "_id",
          foreignField: "customerId",
          pipeline: [
            {
              $match: {
                statusByCreditPd: { $in: ["complete", "approve"] },
                fileStatus: "active",
              },
            },
            { $project: { _id: 0 } },
          ],
          as: "externalVenderData",
        },
      },

      // // Ensure the externalVenderData array is non-empty
      // { $match: { externalVenderData: { $exists: true, $not: { $size: 0 } } } },

      // Lookup pdData
      // {
      //   $lookup: {
      //     from: "pdformdatas",
      //     localField: "_id",
      //     foreignField: "customerId",
      //     pipeline: [
      //       { $match: { status: { $in: ["complete", "approve"] } } },
      //       { $project: { status: 1, bdCompleteDate: 1, pdId: 1 } }
      //     ],
      //     as: "pdData",
      //   },
      // },

      // Ensure the pdData array is non-empty
      // { $match: { pdData: { $exists: true, $not: { $size: 0 } } } },

      // Apply dynamic filters for branchList, employeeList, productList here, outside the $facet
      {
        $match: {
          ...(branchList &&
            branchList !== "all" && { branch: new ObjectId(branchList) }),
          ...(employeeList &&
            employeeList !== "all" && {
              employeeId: new ObjectId(employeeList),
            }),
          ...(productList &&
            productList !== "all" && { productId: new ObjectId(productList) }),
        },
      },

      // Facet aggregation for multiple counts and details
      {
        $facet: {
          totalCases: [{ $count: "total" }],
          sanctionComplete: [
            { $match: { fileProcessSanctionStatus: "complete" } },
            { $count: "count" },
          ],
          sendToSanctionComplete: [
            { $match: { fileProcessSendToSanctionStatus: "complete" } },
            { $count: "count" },
          ],

          status: [{ $match: { status: "pending" } }, { $count: "count" }],
          disbursementComplete: [
            { $match: { fileProcessDisbursementStatus: "complete" } },
            { $count: "count" },
          ],
          sendDisbursementComplete: [
            { $match: { fileProcessSendDisbursementStatus: "complete" } },
            { $count: "count" },
          ],
          finalDisbursementComplete: [
            { $match: { fileProcessFinalDisbursementStatus: "complete" } },
            { $count: "count" },
          ],
          rejectCases: [
            { $match: { fileProcessRejectStatus: "reject" } },
            { $count: "count" },
          ],
          overallStatusComplete: [
            { $match: { status: "complete" } },
            { $count: "count" },
          ],
          fileDetails: [
            { $sort: { createdAt: -1 } }, // Sorting fileDetails by createdAt
            { $skip: (page - 1) * parseInt(limit) },
            { $limit: parseInt(limit) },
          ],
        },
      },

      // Sorting fileDetails globally (if needed)
      { $sort: { createdAt: -1 } },
    ];

    const aggregationPipelins = [
      {
        $lookup: {
          from: "externalvendordynamics",
          localField: "_id",
          foreignField: "customerId",
          pipeline: [
            {
              $match: {
                statusByCreditPd: { $in: ["complete", "approve"] },
                fileStatus: "active",
              },
            },
            { $project: { _id: 0 } }, // Exclude _id
          ],
          as: "externalVenderData",
        },
      },
      {
        $match: {
          externalVenderData: { $exists: true, $not: { $size: 0 } }, // Ensure the array is non-empty
        },
      },
      {
        $lookup: {
          from: "pdformdatas",
          localField: "_id",
          foreignField: "customerId",
          pipeline: [
            { $match: { status: { $in: ["complete", "approve"] } } },
            { $project: { status: 1, bdCompleteDate: 1, pdId: 1 } },
          ],
          as: "pdData",
        },
      },
      {
        $match: {
          // Directly match without using $in
          ...(branchList &&
            branchList !== "all" && {
              branch: new ObjectId(branchList), // Convert to ObjectId for a single value
            }),
          ...(employeeList &&
            employeeList !== "all" && {
              employeId: new ObjectId(employeeList), // Convert to ObjectId for a single value
            }),
          ...(productList &&
            productList !== "all" && {
              productId: new ObjectId(productList), // Convert to ObjectId for a single value
            }),
        },
      },

      { $sort: { createdAt: -1 } }, // Sort by createdAt in descending order
    ];

    // console.log("aggregationPipelins:", JSON.stringify(aggregationPipeline, null, 2));

    const results = await customerModel.aggregate(aggregationPipelins);
    // console.log("Final Sanction Dashboard Results:", results);

    // Run the aggregation
    const result = await finalSanctionDetail.aggregate(aggregationPipeline);

    // console.log("Final Sanction Dashboard Results:", result);

    // console.log("Final Sanction Dashboard Results:", result);

    // Get total cases count
    const totalCases = results.length;

    // Build the response
    const response = {
      totalCases,
      sanctionComplete: result[0]?.sanctionComplete[0]?.count || 0,
      sendToSanctionComplete: result[0]?.sendToSanctionComplete[0]?.count || 0,
      disbursementComplete: result[0]?.disbursementComplete[0]?.count || 0,
      sendDisbursementComplete:
        result[0]?.sendDisbursementComplete[0]?.count || 0,
      finalDisbursementComplete:
        result[0]?.finalDisbursementComplete[0]?.count || 0,
      rejectCases: result[0]?.rejectCases[0]?.count || 0,
      overallStatusComplete: result[0]?.overallStatusComplete[0]?.count || 0,
      status: result[0]?.status[0]?.count || 0,
      fileDetails: result[0]?.fileDetails || [],
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCases / parseInt(limit)),
        totalItems: totalCases,
      },
    };

    return res.status(200).json({
      message: "Final Sanction Dashboard",
      data: response,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.toString() });
  }
}

const fileProcessDashbord = async (req, res) => {
  try {
    const {
      branch,
      employee,
      product,
      fileProcessStatus,
      finalApprovalStatus,
      startDateFilter: startDate,
      endDateFilter: endDate,
      pageLimit = 10000,
      pageNumber = 1,
      searchQuery,
      regionalbranch
    } = req.query;
    const { offset, limit } = paginationData(
      Number(pageLimit),
      Number(pageNumber)
    );
    const employeeId = req.Id;
    console.time("test1")
    // Early employee validation with lean() for better performance
    const employeeExist = await employeModel
      .findOne({ _id: employeeId, status: "active" }, { _id: 1 })
      .lean();

    if (!employeeExist) {
      return badRequest(res, "Employee Not Found");
    }

    // Build initial match conditions
    let matchConditions = {};
  
    if (branch && branch !== "all") {
      matchConditions.branch = {
        $in: (Array.isArray(branch) ? branch : branch.split(",")).map(
          (id) => new ObjectId(id)
        ),
      };
    }

    if (employee && employee !== "all") {
      matchConditions["employeeDetail._id"] = {
        $in: (Array.isArray(employee) ? employee : employee.split(",")).map(
          (id) => new ObjectId(id)
        ),
      };
    }

    if (product && product !== "all") {
      matchConditions.productId = { $in: (Array.isArray(product) ? product : product.split(",")).map(
          (id) => new ObjectId(id)
        ),
      };
    }

  //   if(product == "all" || product == '' || !product){
  //   const excludedProductIds = ["6734821148d4dbfbe0c69c7e"];
  //   if (excludedProductIds.length > 0) {
  //     console.log("Excluding Product IDs:", excludedProductIds);
  //     matchConditions.productId = { $nin: excludedProductIds.map((id) => new ObjectId(id)) };
  //   }
  // }
    
    // if (regionalbranch && regionalbranch !== "all") {
    //   matchConditions["employeeDetail.branch.regionalBranchId"] = {
    //     $in: (Array.isArray(regionalbranch) ? regionalbranch : regionalbranch.split(",")).map(
    //       (id) => new ObjectId(id)
    //     ),
    //   };
    // }

    console.log( matchConditions," matchConditions matchConditions")
   let  aggregationPipeline = [
      // Initial match to filter documents early
      {
        $match: matchConditions,
      },
      // Combine related lookups and add early filtering
      {
        $lookup: {
          from: "externalvendordynamics",
          let: { customerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$customerId", "$$customerId"] },
                    { $in: ["$statusByCreditPd", ["complete", "approve"]] },
                    { $eq: ["$fileStatus", "active"] },
                  ],
                },
              },
              
            },
            { $limit: 1 }, // We only need to know if it exists
            { $project: { creditPdCompleteDate: 1 } },
          ],
          as: "externalVenderData",
        },
      },
      { $match: { "externalVenderData.0": { $exists: true } } }, // More efficient than checking array length
      // Combine employee and related lookups
      {
        $lookup: {
          from: "employees",
          let: { employeId: "$employeId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$employeId"] } } },
            // First lookup for manager
            {
              $lookup: {
                from: "employees",
                let: { reportingManagerId: "$reportingManagerId" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$reportingManagerId"] },
                    },
                  },
                  {
                    $project: {
                      employeName: 1,
                      employeUniqueId: 1,
                      userName: 1,
                    },
                  },
                ],
                as: "manager",
              },
            },
            // REPLACE THIS ENTIRE BRANCH LOOKUP with the new one
            {
              $lookup: {
                from: "newbranches",
                let: { branchId: "$branchId" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$branchId"] } } },
                  {
                    $lookup: {
                      from: "newbranches",
                      let: { regionalBranchId: "$regionalBranchId" },
                      pipeline: [
                        { 
                          $match: { 
                            $expr: { $eq: ["$_id", "$$regionalBranchId"] }
                          }
                        },
                        { $project: { name: 1 } }
                      ],
                      as: "regionalBranch"
                    }
                  },
                  { 
                    $project: { 
                      name: 1,
                      regional: 1,
                      regionalBranchId: 1,
                      regionalBranchName: { $arrayElemAt: ["$regionalBranch.name", 0] }
                    } 
                  }
                ],
                as: "branch"
              }
            },
            // Keep the final project stage
            {
              $project: {
                employeName: 1,
                userName: 1,
                employeUniqueId: 1,
                manager: { $arrayElemAt: ["$manager", 0] },
                branch: { $arrayElemAt: ["$branch", 0] },
              },
            },
          ],
          as: "employeeDetail",
        },
      },
      ...(regionalbranch && regionalbranch !== "all" ? [{
        $match: {
          "employeeDetail.branch.regionalBranchId": {
            $in: (Array.isArray(regionalbranch) ? regionalbranch : regionalbranch.split(",")).map(
              (id) => new ObjectId(id)
            )
          }
        }
      }] : []),
      // Optimize applicant details lookup
      {
        $lookup: {
          from: "applicantdetails",
          let: { customerId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$customerId", "$$customerId"] } } },
            {
              $project: {
                fullName: 1,
                fatherName: 1,
                mobileNo: 1,
                applicantPhoto: 1,
              },
            },
            { $limit: 1 },
          ],
          as: "applicantDetail",
        },
      },
      ...(searchQuery ? [{
        $match: {
          $or: [
            { 
              "applicantDetail.mobileNo": {
                $in: [
                  searchQuery,
                  parseInt(searchQuery),
                  parseFloat(searchQuery)
                ]
              }
            },
            { "applicantDetail.fatherName": { $regex: searchQuery, $options: "i" } },
            { "applicantDetail.fullName": { $regex: searchQuery, $options: "i" } },
            { customerFinId: { $regex: searchQuery, $options: "i" } }
          ]
        }
      }] : []),

      // Optimize final sanction lookup
      {
        $lookup: {
          from: "finalsanctiondetaails",
          let: { customerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$customerId", "$$customerId"] }, // Apply filter here
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "lenders",
                let: { partnerId: "$partnerId" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$partnerId"] } } },
                  { $project: { fullName: 1 } },
                  { $limit: 1 },
                ],
                as: "lendersData",
              },
            },
            {
              $project: {
                createdAt: 1,
                fileProcessSanctionStatus: 1,
                fileProcessDisbursementStatus: 1,
                fileProcessFinalDisbursementStatus: 1,
                fileProcessSendToSanctionStatus: 1,
                fileProcessSendDisbursementStatus: 1,
                fileProcessRejectRemark: 1,
                incomeSanctionStatus:1,
                sendToPartnerSanctionStatus:1,
                sendToPartnerPreDisbursedStatus:1,
                sendToPartnerPostDisbursedStatus:1,
                lenderFullName: { $arrayElemAt: ["$lendersData.fullName", 0] },
              },
            },
            { $limit: 1 },
          ],
          as: "finalSanctionData",
        },
      },
      ...(startDate || endDate ? [{
        $match: {
          "finalSanctionData.createdAt": {
            $exists: true,
            ...(startDate && { $gte: moment(startDate).startOf('day').toDate() }),
            ...(endDate && { $lte: moment(endDate).endOf('day').toDate() })
          }
        }
       }] : []),
      {
        $match: {
          $or:
            fileProcessStatus && fileProcessStatus !== "all"
              ? (typeof fileProcessStatus === "string"
                  ? fileProcessStatus.split(",").map((s) => s.trim())
                  : fileProcessStatus
                ).map((status) => {
                  switch (status) {
                    case "sentForSanction":
                    case "sendForSanction": // Adding support for both versions
                      return {
                        "finalSanctionData.fileProcessSanctionStatus":
                          "complete",
                      };
                    case "sentForDisbursement":
                      return {
                        "finalSanctionData.fileProcessDisbursementStatus":
                          "complete",
                      };
                    case "finalDisbursement":
                      return {
                        "finalSanctionData.fileProcessFinalDisbursementStatus":
                          "complete",
                      };
                    case "pending":
                      return {
                        $or: [
                          { finalSanctionData: { $size: 0 } },
                          {
                            $and: [
                              { finalSanctionData: { $ne: [] } },
                              {
                                $or: [
                                  {
                                    "finalSanctionData.fileProcessSanctionStatus":
                                      { $ne: "complete" },
                                  },
                                  {
                                    "finalSanctionData.fileProcessDisbursementStatus":
                                      { $ne: "complete" },
                                  },
                                  {
                                    "finalSanctionData.fileProcessFinalDisbursementStatus":
                                      { $ne: "complete" },
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      };
                    default:
                      return {};
                  }
                })
              : [{}],
        },
      },
      {
        $match: {
          $or:
            finalApprovalStatus && finalApprovalStatus !== "all"
              ? (typeof finalApprovalStatus === "string"
                  ? finalApprovalStatus.split(",").map((s) => s.trim())
                  : finalApprovalStatus
                ).map((status) => {
                  switch (status) {
                    case "incomeSanction":
                    case "incomeSanction": // Adding support for both versions
                      return {
                        "finalSanctionData.incomeSanctionStatus": "complete",
                      };
                    case "sendToPartnerSanction":
                      return {
                        "finalSanctionData.sendToPartnerSanctionStatus":
                          "complete",
                      };
                    case "sendToPartnerDisbursed":
                      return {
                        "finalSanctionData.sendToPartnerPreDisbursedStatus":
                          "complete",
                      };
                    case "disbursed":
                      return {
                        "finalSanctionData.sendToPartnerPostDisbursedStatus":
                          "complete",
                      };
                    case "pending":
                      return {
                        $or: [
                          { finalSanctionData: { $size: 0 } },
                          {
                            $and: [
                              { finalSanctionData: { $ne: [] } },
                              {
                                $or: [
                                  {
                                    "finalSanctionData.incomeSanctionStatus": {
                                      $ne: "complete",
                                    },
                                  },
                                  {
                                    "finalSanctionData.sendToPartnerSanctionStatus":
                                      { $ne: "complete" },
                                  },
                                  {
                                    "finalSanctionData.sendToPartnerPreDisbursedStatus":
                                      { $ne: "complete" },
                                  },
                                  {
                                    "finalSanctionData.sendToPartnerPostDisbursedStatus":
                                      { $ne: "complete" },
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      };
                    default:
                      return {};
                  }
                })
              : [{}],
        },
      },
      // Optimize facet operation
      {
        $facet: {
          metaData: [
            {
              $group: {
                _id: null,
                totalCases: { $sum: 1 },
                finalDisbursement: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          {
                            $eq: [
                              {
                                $arrayElemAt: [
                                  "$finalSanctionData.fileProcessSanctionStatus",
                                  0,
                                ],
                              },
                              "complete",
                            ],
                          },
                          {
                            $eq: [
                              {
                                $arrayElemAt: [
                                  "$finalSanctionData.fileProcessDisbursementStatus",
                                  0,
                                ],
                              },
                              "complete",
                            ],
                          },
                          {
                            $eq: [
                              {
                                $arrayElemAt: [
                                  "$finalSanctionData.fileProcessFinalDisbursementStatus",
                                  0,
                                ],
                              },
                              "complete",
                            ],
                          },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                sentForDisbursement: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          {
                            $eq: [
                              {
                                $arrayElemAt: [
                                  "$finalSanctionData.fileProcessSanctionStatus",
                                  0,
                                ],
                              },
                              "complete",
                            ],
                          },
                          {
                            $eq: [
                              {
                                $arrayElemAt: [
                                  "$finalSanctionData.fileProcessDisbursementStatus",
                                  0,
                                ],
                              },
                              "complete",
                            ],
                          },
                          {
                            $ne: [
                              {
                                $arrayElemAt: [
                                  "$finalSanctionData.fileProcessFinalDisbursementStatus",
                                  0,
                                ],
                              },
                              "complete",
                            ],
                          },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                sendForSanction: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          {
                            $eq: [
                              {
                                $arrayElemAt: [
                                  "$finalSanctionData.fileProcessSanctionStatus",
                                  0,
                                ],
                              },
                              "complete",
                            ],
                          },
                          {
                            $ne: [
                              {
                                $arrayElemAt: [
                                  "$finalSanctionData.fileProcessDisbursementStatus",
                                  0,
                                ],
                              },
                              "complete",
                            ],
                          },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                reject: {
                  $sum: {
                    $cond: [
                      {
                        $eq: [
                          {
                            $arrayElemAt: [
                              "$finalSanctionData.fileProcessRejectStatus",
                              0,
                            ],
                          },
                          "complete",
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
          data: [
            { $skip: offset },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                createdAt:1,
                employeId: 1,
                customerFinId: 1,
                mobileNo: 1,
                branch: 1,
                // createdAt: 1,
                productId: 1,
                externalVenderData: 1,
                pdData: { $arrayElemAt: ["$pdData", 0] },
                employeeDetail: {
                  $let: {
                    vars: { emp: { $arrayElemAt: ["$employeeDetail", 0] } },
                    in: {
                      _id: "$$emp._id",
                      employeName: "$$emp.employeName",
                      managerName: "$$emp.manager.employeName",
                      managerUniqueId: "$$emp.manager.employeUniqueId",
                      managerUserName: "$$emp.manager.userName",
                      branchId: "$$emp.branch._id",
                      branchName: "$$emp.branch.name",
                      regionalBranchId: "$$emp.branch.regionalBranchId",
                      regionalBranchName: "$$emp.branch.regionalBranchName",
                      isRegionalBranch: "$$emp.branch.regional"
                    },
                  },
                },
                applicantDetail: { $arrayElemAt: ["$applicantDetail", 0] },
                
                TAT: {
                  $let: {
                    vars: {
                      bdDate: {
                        $arrayElemAt: ["$externalVenderData.creditPdCompleteDate", 0]
                      }
                    },
                    in: {
                      $cond: {
                        if: {
                          $or: [
                            { $eq: ["$$bdDate", null] },
                            { $eq: ["$$bdDate", ""] },
                            { $eq: ["$$bdDate", undefined] }
                          ]
                        },
                        then: null,
                        else: {
                          $let: {
                            vars: {
                              cleanDate: {
                                $trim: {
                                  input: {
                                    $replaceAll: {
                                      input: {
                                        $replaceAll: {
                                          input: "$$bdDate",
                                          find: " AM",
                                          replacement: ""
                                        }
                                      },
                                      find: " PM",
                                      replacement: ""
                                    }
                                  }
                                }
                              }
                            },
                            in: {
                              $ceil: {
                                $divide: [
                                  {
                                    $subtract: [
                                      {
                                        $dateTrunc: {
                                          date: "$$NOW",
                                          unit: "day"
                                        }
                                      },
                                      {
                                        $dateTrunc: {
                                          date: {
                                            $dateFromString: {
                                              dateString: "$$cleanDate",
                                              timezone: "+05:30"  // IST timezone
                                            }
                                          },
                                          unit: "day"
                                        }
                                      }
                                    ]
                                  },
                                  86400000  // milliseconds in a day
                                ]
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },               

                finalSanctionData: {
                  $let: {
                    vars: {
                      fs: { $arrayElemAt: ["$finalSanctionData", 0] }
                    },
                    in: {
                      _id: "$$fs._id",
                      lenderFullName: "$$fs.lenderFullName",
                      fileProcessRejectRemark: "$$fs.fileProcessRejectRemark",
                      createdAt: "$$fs.createdAt",
                      fileProcessStatus: {
                        $switch: {
                          branches: [
                            {
                              case: {
                                $and: [
                                  { $eq: ["$$fs.fileProcessSanctionStatus", "complete"] },
                                  { $eq: ["$$fs.fileProcessDisbursementStatus", "complete"] },
                                  { $eq: ["$$fs.fileProcessFinalDisbursementStatus", "complete"] }
                                ]
                              },
                              then: "Final Disbursement"
                            },
                            {
                              case: {
                                $and: [
                                  { $eq: ["$$fs.fileProcessSanctionStatus", "complete"] },
                                  { $eq: ["$$fs.fileProcessDisbursementStatus", "complete"] }
                                ]
                              },
                              then: "send for Disbursement"
                            },
                            {
                              case: {
                                $and: [
                                  { $eq: ["$$fs.fileProcessSanctionStatus", "complete"] },
                                ]
                              },
                              then: "send for sanction"
                            }
                          ],
                          default: ""
                        }
                      },
                      hoStatus: {                           // Added field name here
                        $switch: {
                          branches: [
                            {
                              case: {
                                $and: [
                                  { $eq: ["$$fs.incomeSanctionStatus", "complete"] },
                                  { $eq: ["$$fs.sendToPartnerSanctionStatus", "complete"] },
                                  { $eq: ["$$fs.sendToPartnerPreDisbursedStatus", "complete"] },
                                  { $eq: ["$$fs.sendToPartnerPostDisbursedStatus", "complete"] }
                                ]
                              },
                              then: "DISBURSED"
                            },
                            {
                              case: {
                                $and: [
                                  { $eq: ["$$fs.incomeSanctionStatus", "complete"] },
                                  { $eq: ["$$fs.sendToPartnerSanctionStatus", "complete"] },
                                  { $eq: ["$$fs.sendToPartnerPreDisbursedStatus", "complete"] }
                                ]
                              },
                              then: "Send for partner disbursement"
                            },
                            {
                              case: {
                                $and: [
                                  { $eq: ["$$fs.incomeSanctionStatus", "complete"] },
                                  { $eq: ["$$fs.sendToPartnerSanctionStatus", "complete"] }
                                ]
                              },
                              then: "Send for partner sanction"
                            },
                            {
                              case: {
                                $and: [
                                  { $eq: ["$$fs.incomeSanctionStatus", "complete"] }
                                ]
                              },
                              then: "Income sanction"
                            }
                          ],
                          default: "PENDING"
                        }
                      }
                    }
                  }
                },
              },
            },
          ],
        },
      },
    ];

    const aggregationCountPipeline = [
      {
        $match: matchConditions,
      },
      {
        $lookup: {
          from: "externalvendordynamics",
          let: { customerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$customerId", "$$customerId"] },
                    { $in: ["$statusByCreditPd", ["complete", "approve"]] },
                    { $eq: ["$fileStatus", "active"] },
                  ],
                },
              },
            },
            { $limit: 1 }, // We only need to know if it exists
          ],
          as: "externalVenderData",
        },
      },
      { $match: { "externalVenderData.0": { $exists: true } } }, // More efficient than checking array length
    ];

    const results = await customerModel
      .aggregate(aggregationPipeline)
      .allowDiskUse(true);

      const total = await customerModel
      .aggregate(aggregationCountPipeline)
      .allowDiskUse(true);
    console.timeEnd("test1");

    return success(res, "customerDetails", {
      totalCount: total.length,
      userDataLength: results[0].data.length,
      userData: results,
    });
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
};

const fileProcessBranchList = async (req, res) => {
  try {
    const { startDateFilter, endDateFilter } = req.query;
    const employeeId = req.Id;

    const employeeExist = await employeModel.findOne({
      _id: employeeId,
      status: "active",
    });
    if (!employeeExist) {
      return badRequest(res, "Employee Not Found");
    }

    const formattedStart = new Date(
      new Date(startDateFilter).setHours(0, 0, 0, 0)
    );
    const formattedEnd = new Date(
      new Date(endDateFilter).setHours(23, 59, 59, 999)
    );
    let dateFilter = {};
    if (startDateFilter && endDateFilter) {
      dateFilter["createdAt"] = {
        // Correct way to assign a filter condition
        $gte: formattedStart,
        $lt: formattedEnd,
      };
    }
    console.log(dateFilter, "dateFilter");
    const data = await customerModel.aggregate([
      {
        $lookup: {
          from: "externalvendordynamics",
          let: { customerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$customerId", "$$customerId"] },
                statusByCreditPd: { $in: ["complete", "approve"] },
                fileStatus: "active",
              },
            },
          ],
          as: "externalVenderData",
        },
      },
      {
        $match: { "externalVenderData.0": { $exists: true } },
      },
      {
        $lookup: {
          from: "pdformdatas",
          let: { customerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$customerId", "$$customerId"] },
                status: { $in: ["complete", "approve"] },
              },
            },
          ],
          as: "pdData",
        },
      },
      {
        $match: { "pdData.0": { $exists: true } },
      },
      {
        $lookup: {
          from: "newbranches",
          let: { branchId: "$branch" },
          pipeline: [
            {
              $match: { $expr: { $eq: ["$_id", "$$branchId"] } },
            },
          ],
          as: "branchData",
        },
      },
      {
        $unwind: {
          path: "$branchData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "finalsanctiondetaails",
          let: { customerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$customerId", "$$customerId"] },
                ...dateFilter, // Applying date filter here
              },
            },
            {
              $project: {
                createdAt: 1,
                fileProcessSanctionStatus: 1,
                fileProcessDisbursementStatus: 1,
                fileProcessFinalDisbursementStatus: 1,
              },
            },
          ],
          as: "finalSanctionData",
        },
      },
      {
        $group: {
          _id: "$branch",
          branchName: { $first: "$branchData.name" },
          branchCode: { $first: "$branchData.branchCode" },
          totalDocuments: { $sum: 1 },
          finalSanctionData: { $push: "$finalSanctionData" },
        },
      },
      {
        $project: {
          _id: 1,
          branchName: 1,
          branchCode: 1,
          totalDocuments: 1,
          metaData: {
            totalCases: { $size: "$finalSanctionData" },
            finalDisbursement: {
              $size: {
                $filter: {
                  input: "$finalSanctionData",
                  as: "fsd",
                  cond: {
                    $and: [
                      {
                        $eq: [
                          {
                            $arrayElemAt: [
                              "$$fsd.fileProcessSanctionStatus",
                              0,
                            ],
                          },
                          "complete",
                        ],
                      },
                      {
                        $eq: [
                          {
                            $arrayElemAt: [
                              "$$fsd.fileProcessDisbursementStatus",
                              0,
                            ],
                          },
                          "complete",
                        ],
                      },
                      {
                        $eq: [
                          {
                            $arrayElemAt: [
                              "$$fsd.fileProcessFinalDisbursementStatus",
                              0,
                            ],
                          },
                          "complete",
                        ],
                      },
                    ],
                  },
                },
              },
            },
            sentForDisbursement: {
              $size: {
                $filter: {
                  input: "$finalSanctionData",
                  as: "fsd",
                  cond: {
                    $and: [
                      {
                        $eq: [
                          {
                            $arrayElemAt: [
                              "$$fsd.fileProcessSanctionStatus",
                              0,
                            ],
                          },
                          "complete",
                        ],
                      },
                      {
                        $eq: [
                          {
                            $arrayElemAt: [
                              "$$fsd.fileProcessDisbursementStatus",
                              0,
                            ],
                          },
                          "complete",
                        ],
                      },
                      {
                        $ne: [
                          {
                            $arrayElemAt: [
                              "$$fsd.fileProcessFinalDisbursementStatus",
                              0,
                            ],
                          },
                          "complete",
                        ],
                      },
                    ],
                  },
                },
              },
            },
            sendForSanction: {
              $size: {
                $filter: {
                  input: "$finalSanctionData",
                  as: "fsd",
                  cond: {
                    $and: [
                      {
                        $eq: [
                          {
                            $arrayElemAt: [
                              "$$fsd.fileProcessSanctionStatus",
                              0,
                            ],
                          },
                          "complete",
                        ],
                      },
                      {
                        $ne: [
                          {
                            $arrayElemAt: [
                              "$$fsd.fileProcessDisbursementStatus",
                              0,
                            ],
                          },
                          "complete",
                        ],
                      },
                    ],
                  },
                },
              },
            },
            pending: {
              $size: {
                $filter: {
                  input: "$finalSanctionData",
                  as: "fsd",
                  cond: {
                    $and: [
                      {
                        $ne: [
                          {
                            $arrayElemAt: [
                              "$$fsd.fileProcessSanctionStatus",
                              0,
                            ],
                          },
                          "complete",
                        ],
                      },
                      {
                        $ne: [
                          {
                            $arrayElemAt: [
                              "$$fsd.fileProcessDisbursementStatus",
                              0,
                            ],
                          },
                          "complete",
                        ],
                      },
                      {
                        $ne: [
                          {
                            $arrayElemAt: [
                              "$$fsd.fileProcessFinalDisbursementStatus",
                              0,
                            ],
                          },
                          "complete",
                        ],
                      },
                    ],
                  },
                },
              },
            },
            total: {
              $add: [
                "$metaData.finalDisbursement",
                "$metaData.sentForDisbursement",
                "$metaData.sendForSanction",
                "$metaData.pending",
              ],
            },
          },
        },
      },
    ]);

    return success(res, "PD Files Branch Table Dashboard", {
      status: true,
      message: "Table Dashboard",
      data,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.toString() });
  }
};

const List = async (req, res) => {
  try {
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
};


const getDashboardData = async (req, res) => {
  try {
    const { startDateFilter, endDateFilter } = req.query;

    const formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
    const formattedEnd = new Date(new Date(endDateFilter).setHours(23, 59, 59, 999));

    let dateFilter = {};
    if (startDateFilter && endDateFilter) {
      dateFilter["createdAt"] = { $gte: formattedStart, $lt: formattedEnd };
    }

    const results = await finalSanctionModel.aggregate([
      {
        $match: {
          employeeId: { $exists: true, $ne: null },
          ...dateFilter,
        },
      },
      {
        $lookup: {
          from: "externalvendordynamics",
          localField: "customerId",
          foreignField: "customerId",
          as: "externalVendorData",
        },
      },
      {
        $match: {
          "externalVendorData": { $ne: [] },
          "externalVendorData.statusByCreditPd": { $in: ["complete", "approve"] },
          "externalVendorData.fileStatus": "active",
        },
      },
      {
        $group: {
          _id: "$employeeId",
          sendForSanction: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$fileProcessSanctionStatus", "complete"] },
                    { $ne: ["$fileProcessDisbursementStatus", "complete"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          sentForDisbursement: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$fileProcessSanctionStatus", "complete"] },
                    { $eq: ["$fileProcessDisbursementStatus", "complete"] },
                    { $ne: ["$fileProcessFinalDisbursementStatus", "complete"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          finalDisbursement: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$fileProcessSanctionStatus", "complete"] },
                    { $eq: ["$fileProcessDisbursementStatus", "complete"] },
                    { $eq: ["$fileProcessFinalDisbursementStatus", "complete"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          pending: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$fileProcessSanctionStatus", "complete"] },
                    { $ne: ["$fileProcessDisbursementStatus", "complete"] },
                    { $ne: ["$fileProcessFinalDisbursementStatus", "complete"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $addFields: {
          total: {
            $add: [
              "$sendForSanction",
              "$sentForDisbursement",
              "$finalDisbursement",
              "$pending",
            ],
          },
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "_id",
          foreignField: "_id",
          as: "employeeInfo",
        },
      },
      {
        $unwind: {
          path: "$employeeInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          employeeName: "$employeeInfo.employeName",
          sendForSanction: 1,
          sentForDisbursement: 1,
          finalDisbursement: 1,
          pending: 1,
          total: 1,
        },
      },
      {
        $group: {
          _id: null,
          totalSendToSanctionComplete: { $sum: "$sendForSanction" },
          totalSendDisbursementComplete: { $sum: "$sentForDisbursement" },
          totalFinalDisbursementComplete: { $sum: "$finalDisbursement" },
          totalPendingCases: { $sum: "$pending" },
          totalCases: { $sum: "$total" },
          employees: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          grandTotal: {
            sendToSanctionComplete: "$totalSendToSanctionComplete",
            sendDisbursementComplete: "$totalSendDisbursementComplete",
            finalDisbursementComplete: "$totalFinalDisbursementComplete",
            pendingCases: "$totalPendingCases",
            totalCases: "$totalCases",
          },
          items: "$employees",
        },
      },
    ]);

    return success(res, "Dashboard data retrieved successfully", results[0] || { grandTotal: {}, items: [] });
  } catch (error) {
    console.error("Error in getDashboardData:", error);
    return unknownError(res, error);
  }
};


const getDashboardDataByProduct1 = async (req, res) => {
  try {
    const { startDateFilter, endDateFilter } = req.query;

    const formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
    const formattedEnd = new Date(new Date(endDateFilter).setHours(23, 59, 59, 999));

    let dateFilter = {};
    if (startDateFilter && endDateFilter) {
      dateFilter["createdAt"] = { $gte: formattedStart, $lt: formattedEnd };
    }

    const results = await finalSanctionModel.aggregate([
      {
        $match: {
          customerId: { $exists: true, $ne: null },
          ...dateFilter,
        },
      },
      {
        $lookup: {
          from: "externalvendordynamics",
          localField: "customerId",
          foreignField: "customerId",
          as: "externalVendorData",
        },
      },
      {
        $match: {
          "externalVendorData": { $ne: [] },
          "externalVendorData.statusByCreditPd": { $in: ["complete", "approve"] },
          "externalVendorData.fileStatus": "active",
        },
      },
      {
        $group: {
          _id: "$customerId",
          sendForSanction: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$fileProcessSanctionStatus", "complete"] },
                    { $ne: ["$fileProcessDisbursementStatus", "complete"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          sentForDisbursement: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$fileProcessSanctionStatus", "complete"] },
                    { $eq: ["$fileProcessDisbursementStatus", "complete"] },
                    { $ne: ["$fileProcessFinalDisbursementStatus", "complete"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          finalDisbursement: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$fileProcessSanctionStatus", "complete"] },
                    { $eq: ["$fileProcessDisbursementStatus", "complete"] },
                    { $eq: ["$fileProcessFinalDisbursementStatus", "complete"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          pending: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$fileProcessSanctionStatus", "complete"] },
                    { $ne: ["$fileProcessDisbursementStatus", "complete"] },
                    { $ne: ["$fileProcessFinalDisbursementStatus", "complete"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $addFields: {
          total: {
            $add: [
              "$sendForSanction",
              "$sentForDisbursement",
              "$finalDisbursement",
              "$pending",
            ],
          },
        },
      },
      // {
      //   $lookup: {
      //     from: "employees",
      //     localField: "_id",
      //     foreignField: "_id",
      //     as: "employeeInfo",
      //   },
      // },
      // {
      //   $unwind: {
      //     path: "$employeeInfo",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
      {
        $lookup: {
          from: "customerdetails",
          localField: "customerId",
          foreignField: "_id",
          as: "customerInfo",
        },
      },
      {
        $unwind: {
          path: "$customerInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "customerInfo.productId",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      {
        $unwind: {
          path: "$productInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          productName: "$productInfo.productName",
          sendForSanction: 1,
          sentForDisbursement: 1,
          finalDisbursement: 1,
          pending: 1,
          total: 1,
        },
      },
      {
        $group: {
          _id: null,
          totalSendToSanctionComplete: { $sum: "$sendForSanction" },
          totalSendDisbursementComplete: { $sum: "$sentForDisbursement" },
          totalFinalDisbursementComplete: { $sum: "$finalDisbursement" },
          totalPendingCases: { $sum: "$pending" },
          totalCases: { $sum: "$total" },
          employees: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          grandTotal: {
            sendToSanctionComplete: "$totalSendToSanctionComplete",
            sendDisbursementComplete: "$totalSendDisbursementComplete",
            finalDisbursementComplete: "$totalFinalDisbursementComplete",
            pendingCases: "$totalPendingCases",
            totalCases: "$totalCases",
          },
          items: "$employees",
        },
      },
    ]);

    return success(res, "Dashboard data retrieved successfully", results[0] || { grandTotal: {}, items: [] });
  } catch (error) {
    console.error("Error in getDashboardData:", error);
    return unknownError(res, error);
  }
};

const getDashboardDataByProduct = async (req, res) => {
  try {
    const { startDateFilter, endDateFilter } = req.query;

    const formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
    const formattedEnd = new Date(new Date(endDateFilter).setHours(23, 59, 59, 999));

    let dateFilter = {};
    if (startDateFilter && endDateFilter) {
      dateFilter["createdAt"] = { $gte: formattedStart, $lt: formattedEnd };
    }

    const results = await finalSanctionModel.aggregate([
      {
        $match: {
          employeeId: { $exists: true, $ne: null },
          ...dateFilter,
        },
      },
      {
        $lookup: {
          from: "externalvendordynamics",
          localField: "customerId",
          foreignField: "customerId",
          as: "externalVendorData",
        },
      },
      {
        $match: {
          "externalVendorData": { $ne: [] },
          "externalVendorData.statusByCreditPd": { $in: ["complete", "approve"] },
          "externalVendorData.fileStatus": "active",
        },
      },
      {
        $group: {
          _id: "$employeeId",
          sendForSanction: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$fileProcessSanctionStatus", "complete"] },
                    { $ne: ["$fileProcessDisbursementStatus", "complete"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          sentForDisbursement: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$fileProcessSanctionStatus", "complete"] },
                    { $eq: ["$fileProcessDisbursementStatus", "complete"] },
                    { $ne: ["$fileProcessFinalDisbursementStatus", "complete"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          finalDisbursement: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$fileProcessSanctionStatus", "complete"] },
                    { $eq: ["$fileProcessDisbursementStatus", "complete"] },
                    { $eq: ["$fileProcessFinalDisbursementStatus", "complete"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          pending: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$fileProcessSanctionStatus", "complete"] },
                    { $ne: ["$fileProcessDisbursementStatus", "complete"] },
                    { $ne: ["$fileProcessFinalDisbursementStatus", "complete"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $addFields: {
          total: {
            $add: [
              "$sendForSanction",
              "$sentForDisbursement",
              "$finalDisbursement",
              "$pending",
            ],
          },
        },
      },
      // {
      //   $lookup: {
      //     from: "employees",
      //     localField: "_id",
      //     foreignField: "_id",
      //     as: "employeeInfo",
      //   },
      // },
      // {
      //   $unwind: {
      //     path: "$employeeInfo",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
      {
        $lookup: {
          from: "customerdetails",
          localField: "_id",
          foreignField: "employeId",
          as: "customerInfo",
        },
      },
      {
        $unwind: {
          path: "$customerInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "customerInfo.productId",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      {
        $unwind: {
          path: "$productInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          productName: "$productInfo.productName",
          sendForSanction: 1,
          sentForDisbursement: 1,
          finalDisbursement: 1,
          pending: 1,
          total: 1,
        },
      },
      {
        $group: {
          _id: null,
          totalSendToSanctionComplete: { $sum: "$sendForSanction" },
          totalSendDisbursementComplete: { $sum: "$sentForDisbursement" },
          totalFinalDisbursementComplete: { $sum: "$finalDisbursement" },
          totalPendingCases: { $sum: "$pending" },
          totalCases: { $sum: "$total" },
          employees: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          grandTotal: {
            sendToSanctionComplete: "$totalSendToSanctionComplete",
            sendDisbursementComplete: "$totalSendDisbursementComplete",
            finalDisbursementComplete: "$totalFinalDisbursementComplete",
            pendingCases: "$totalPendingCases",
            totalCases: "$totalCases",
          },
          items: "$employees",
        },
      },
    ]);

    return success(res, "Dashboard data retrieved successfully", results[0] || { grandTotal: {}, items: [] });
  } catch (error) {
    console.error("Error in getDashboardData:", error);
    return unknownError(res, error);
  }
};

const newFileProcessDashbord = async (req,res) =>{
  try{
    const {
      branch,
      employee,
      product,
      fileProcessStatus,
      finalApprovalStatus,
      startDateFilter: startDate,
      endDateFilter: endDate,
      pageLimit = 10000,
      pageNumber = 1,
      searchQuery,
      regionalbranch
    } = req.query;
    const { offset, limit } = paginationData(
      Number(pageLimit),
      Number(pageNumber)
    );
    // const employeeId = req.Id;
    console.time("test1")

    let searchMatchCondition = {};
    if (searchQuery) {
      searchMatchCondition = {
        $or: [
          { "applicantdetailData.fullName": { $regex: searchQuery, $options: "i" } },
          { "applicantdetailData.fatherName": { $regex: searchQuery, $options: "i" } },
          { "applicantdetailData.mobileNo": { $regex: searchQuery, $options: "i" } },
          { "customerDetailData.customerFinId": { $regex: searchQuery, $options: "i" } }
        ]
      };
    }
    // // Early employee validation with lean() for better performance
    // const employeeExist = await employeModel
    //   .findOne({ _id: employeeId, status: "active" }, { _id: 1 })
    //   .lean();

    // if (!employeeExist) {
    //   return badRequest(res, "Employee Not Found");
    // }

    // Build initial match conditions
    let matchConditions = {};
  
    let branchMatch = {};
    if (branch && branch !== "all") {
      const branchIds = (Array.isArray(branch) ? branch : branch.split(",")).map(
        (id) => new ObjectId(id)
      );
      branchMatch = { "customerDetailData.branch": { $in: branchIds } };
    }
    console.log(branchMatch,"branchMatch")

    let employeeMatch = {};
    if (employee && employee !== "all") {
      const employeeIds = (Array.isArray(employee) ? employee : employee.split(",")).map(
        (id) => new ObjectId(id)
      );
      employeeMatch = { "customerDetailData.employeId": { $in: employeeIds } };
    }

    let productMatch = {};
    if (product && product !== "all") {
      const productIds = (Array.isArray(product) ? product : product.split(",")).map(
        (id) => new ObjectId(id)
      );
      productMatch = { "customerDetailData.productId": { $in: productIds } };
    }

    let dateMatch = {};
    if (startDate && endDate) {
      dateMatch = {
        creditPdCompleteDate: {
          $exists: true,
          $ne: "",
          // Since your dates are in consistent format, we can use string comparison
          $gte: new Date(startDate).toISOString().split('.')[0] + " AM",
          $lte: new Date(endDate).toISOString().split('.')[0] + " PM"
        }
      };
    }

    let fileProcessStatusMatch = {};
    if (fileProcessStatus && fileProcessStatus !== "all") {
      // Normalize input to array and validate
      const statusArray = (Array.isArray(fileProcessStatus) ? fileProcessStatus : fileProcessStatus.split(","))
        .map(s => s.trim().toLowerCase())
        .filter(s => s); // Remove empty strings
    
      // Simplified status conditions map
      const statusConditions = {
        sentforsanction: {
          "finalsanctionData.fileProcessSanctionStatus": "complete"
        },
        sendforsanction: {
          "finalsanctionData.fileProcessSanctionStatus": "complete"
        },
        sentfordisbursement: {
          "finalsanctionData.fileProcessDisbursementStatus": "complete"
        },
        finaldisbursement: {
          "finalsanctionData.fileProcessFinalDisbursementStatus": "complete"
        },
        pending: {
          $or: [
            { finalsanctionData: { $size: 0 } },
            {
              "finalsanctionData.0": { $exists: true },
              $or: [
                { "finalsanctionData.fileProcessSanctionStatus": { $ne: "complete" } },
                { "finalsanctionData.fileProcessDisbursementStatus": { $ne: "complete" } },
                { "finalsanctionData.fileProcessFinalDisbursementStatus": { $ne: "complete" } }
              ]
            }
          ]
        }
      };
    
      // Build conditions array with error handling
      const orConditions = statusArray
        .map(status => statusConditions[status])
        .filter(Boolean);
    
      if (orConditions.length > 0) {
        fileProcessStatusMatch = orConditions.length === 1 
          ? orConditions[0]  // If single condition, don't wrap in $or
          : { $or: orConditions };
      }
    }

    let finalApprovalStatusMatch = {};
    if (finalApprovalStatus && finalApprovalStatus !== "all") {
      // Normalize input to array and validate
      const statusArray = (Array.isArray(finalApprovalStatus) ? finalApprovalStatus : finalApprovalStatus.split(","))
        .map(s => s.trim().toLowerCase())
        .filter(s => s); // Remove empty strings

      // Status conditions map
      const approvalStatusConditions = {
        incomesanction: {
          "finalsanctionData.incomeSanctionStatus": "complete"
        },
        sendtopartnersanction: {
          "finalsanctionData.sendToPartnerSanctionStatus": "complete"
        },
        sendtopartnerdisbursed: {
          "finalsanctionData.sendToPartnerPreDisbursedStatus": "complete"
        },
        disbursed: {
          "finalsanctionData.sendToPartnerPostDisbursedStatus": "complete"
        },
        pending: {
          $or: [
            { finalsanctionData: { $size: 0 } },
            {
              "finalsanctionData.0": { $exists: true },
              $or: [
                { "finalsanctionData.incomeSanctionStatus": { $ne: "complete" } },
                { "finalsanctionData.sendToPartnerSanctionStatus": { $ne: "complete" } },
                { "finalsanctionData.sendToPartnerPreDisbursedStatus": { $ne: "complete" } },
                { "finalsanctionData.sendToPartnerPostDisbursedStatus": { $ne: "complete" } }
              ]
            }
          ]
        }
      };

      // Build conditions array with error handling
      const orConditions = statusArray
        .map(status => approvalStatusConditions[status])
        .filter(Boolean);

      if (orConditions.length > 0) {
        finalApprovalStatusMatch = orConditions.length === 1 
          ? orConditions[0]  // If single condition, don't wrap in $or
          : { $or: orConditions };
      }
    }
  //   if(product == "all" || product == '' || !product){
  //   const excludedProductIds = ["6734821148d4dbfbe0c69c7e"];
  //   if (excludedProductIds.length > 0) {
  //     console.log("Excluding Product IDs:", excludedProductIds);
  //     matchConditions.productId = { $nin: excludedProductIds.map((id) => new ObjectId(id)) };
  //   }
  // }
    
    // if (regionalbranch && regionalbranch !== "all") {
    //   matchConditions["employeeDetail.branch.regionalBranchId"] = {
    //     $in: (Array.isArray(regionalbranch) ? regionalbranch : regionalbranch.split(",")).map(
    //       (id) => new ObjectId(id)
    //     ),
    //   };
    // }

    let regionalBranchMatch = {};
    if (regionalbranch && regionalbranch !== "all") {
      const regionalBranchIds = (Array.isArray(regionalbranch) ? regionalbranch : regionalbranch.split(","))
        .map(id => new ObjectId(id));
      regionalBranchMatch = {
        "newbranchesData.regionalBranchId": { $in: regionalBranchIds }
      };
    }
    // console.log( matchConditions," matchConditions matchConditions")

    const data = await externalManagerModel.aggregate([
      {
        $match: {
          fileStatus: "active",
          statusByCreditPd: { $in: ["complete", "approve"] }
        }
      },
      {
        $match: startDate && endDate ? dateMatch : {}
      },
      {
        $lookup: {
          from: "customerdetails",
          localField: "customerId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id:1,
                employeId: 1,
                productId: 1,
                customerFinId: 1,
                branch: 1,
                createdAt: 1
              }
            }
          ],
          as: "customerDetailData"
        }
      },
      {
        $match: finalApprovalStatus && finalApprovalStatus !== "all" ? finalApprovalStatusMatch : {}
      },
      {
        $match: fileProcessStatus && fileProcessStatus !== "all" ? fileProcessStatusMatch : {}
      },
      {
        $match: product && product !== "all" ? productMatch : {}
      },
      {
        $match: employee && employee !== "all" ? employeeMatch : {}
      },
      {
        $match: branch && branch !== "all" ? branchMatch : {}
      },
      {
        $lookup: {
          from: "newbranches",
          localField: "customerDetailData.branch",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id:1,
                name: 1,
                regionalBranchId:1
              }
            }
          ],
          as: "newbranchesData"
        }
      },
      {
        $match: regionalbranch && regionalbranch !== "all" ? regionalBranchMatch : {}
      },
      {
        $lookup: {
          from: "employees",
          localField: "customerDetailData.employeId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id:1,
                employeName: 1,
                employeUniqueId: 1,
                reportingManagerId: 1
              }
            },
            {
              $lookup: {
                from: "employees",
                localField: "reportingManagerId",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: {
                      managerName: "$employeName"
                    }
                  }
                ],
                as: "managerData"
              }
            }
          ],
          as: "employeesData"
        }
      },
      {
        $lookup: {
          from: "applicantdetails",
          localField: "customerId",
          foreignField: "customerId",
          pipeline: [
            {
              $project: {
                fullName: 1,
                fatherName: 1,
                mobileNo: 1,
              }
            }
          ],
          as: "applicantdetailData"
        }
      },
      {
        $match: searchQuery ? searchMatchCondition : {}
      },
      {
        $lookup: {
          from: "finalsanctiondetaails",
          localField: "customerId",
          foreignField: "customerId",
          pipeline: [
            {
              $project: {
                partnerId:1,
                fileProcessRejectRemark:1,
                fileProcessRejectStatus:1,
                fileProcessSanctionStatus: 1,
                fileProcessDisbursementStatus: 1,
                fileProcessFinalDisbursementStatus: 1,
                incomeSanctionStatus: 1,
                sendToPartnerSanctionStatus: 1,
                sendToPartnerPreDisbursedStatus: 1,
                sendToPartnerPostDisbursedStatus: 1
              }
            },
            {
              $lookup: {
                from: "lenders",
                localField: "partnerId",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: {
                      fullName: "$fullName"
                    }
                  }
                ],
                as: "lenderData"
              }
            }
          ],
          as: "finalsanctionData"
        }
      },
      { $skip: offset },
      { $limit: limit },
      {
        $project: {
          creditPdCompleteDate: 1,
          customerId: { $arrayElemAt: ["$customerDetailData._id", 0] },
          customerFinId: { $arrayElemAt: ["$customerDetailData.customerFinId", 0] },
          createdAt: { $arrayElemAt: ["$customerDetailData.createdAt", 0] },
          productId: { $arrayElemAt: ["$customerDetailData.productId", 0] },
          branchId: { $arrayElemAt: ["$newbranchesData._id", 0] },//regionalBranchId
          regionalBranchId: { $arrayElemAt: ["$newbranchesData.regionalBranchId", 0] },
          branchName: { $arrayElemAt: ["$newbranchesData.name", 0] },
          employeId: { $arrayElemAt: ["$employeesData._id", 0] },
          employeName: { $arrayElemAt: ["$employeesData.employeName", 0] },
          reportingManagerName: { $arrayElemAt: ["$employeesData.managerData.managerName", 0] },
          mobileNo: { $arrayElemAt: ["$applicantdetailData.mobileNo", 0] },
          fullName: { $arrayElemAt: ["$applicantdetailData.fullName", 0] },
          fatherName: { $arrayElemAt: ["$applicantdetailData.fatherName", 0] },
          fileProcessRejectRemark: { $arrayElemAt: ["$finalsanctionData.fileProcessRejectRemark", 0] },
          fileProcessRejectStatus : { $arrayElemAt: ["$finalsanctionData.fileProcessRejectStatus", 0] },
          partnerName: { $arrayElemAt: ["$finalsanctionData.lenderData.fullName", 0] },
          TaT: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$creditPdCompleteDate", null] },
                  { $ne: ["$creditPdCompleteDate", ""] }
                ]
              },
              then: {
                $round: [
                  {
                    $divide: [
                      {
                        $subtract: [
                          "$$NOW",
                          {
                            $dateFromString: {
                              dateString: {
                                $substr: ["$creditPdCompleteDate", 0, 19]
                              }
                            }
                          }
                        ]
                      },
                      86400000  // Convert to days
                    ]
                  },
                  0
                ]
              },
              else: null  // Return null for empty/null dates
            }
          },
          finalSanctionData: {
            $let: {
              vars: {
                fs: { $arrayElemAt: ["$finalsanctionData", 0] }
              },
              in: {
                _id: "$$fs._id",
                lenderFullName: "$$fs.lenderFullName",
                fileProcessRejectRemark: "$$fs.fileProcessRejectRemark",
                createdAt: "$$fs.createdAt",
                fileProcessStatus: {
                  $switch: {
                    branches: [
                      {
                        case: {
                          $and: [
                            { $eq: ["$$fs.fileProcessSanctionStatus", "complete"] },
                            { $eq: ["$$fs.fileProcessDisbursementStatus", "complete"] },
                            { $eq: ["$$fs.fileProcessFinalDisbursementStatus", "complete"] }
                          ]
                        },
                        then: "Final Disbursement"
                      },
                      {
                        case: {
                          $and: [
                            { $eq: ["$$fs.fileProcessSanctionStatus", "complete"] },
                            { $eq: ["$$fs.fileProcessDisbursementStatus", "complete"] }
                          ]
                        },
                        then: "send for Disbursement"
                      },
                      {
                        case: {
                          $and: [
                            { $eq: ["$$fs.fileProcessSanctionStatus", "complete"] }
                          ]
                        },
                        then: "send for sanction"
                      }
                    ],
                    default: ""
                  }
                },
                hoStatus: {
                  $switch: {
                    branches: [
                      {
                        case: {
                          $and: [
                            { $eq: ["$$fs.incomeSanctionStatus", "complete"] },
                            { $eq: ["$$fs.sendToPartnerSanctionStatus", "complete"] },
                            { $eq: ["$$fs.sendToPartnerPreDisbursedStatus", "complete"] },
                            { $eq: ["$$fs.sendToPartnerPostDisbursedStatus", "complete"] }
                          ]
                        },
                        then: "DISBURSED"
                      },
                      {
                        case: {
                          $and: [
                            { $eq: ["$$fs.incomeSanctionStatus", "complete"] },
                            { $eq: ["$$fs.sendToPartnerSanctionStatus", "complete"] },
                            { $eq: ["$$fs.sendToPartnerPreDisbursedStatus", "complete"] }
                          ]
                        },
                        then: "Send for partner disbursement"
                      },
                      {
                        case: {
                          $and: [
                            { $eq: ["$$fs.incomeSanctionStatus", "complete"] },
                            { $eq: ["$$fs.sendToPartnerSanctionStatus", "complete"] }
                          ]
                        },
                        then: "Send for partner sanction"
                      },
                      {
                        case: {
                          $and: [
                            { $eq: ["$$fs.incomeSanctionStatus", "complete"] }
                          ]
                        },
                        then: "Income sanction"
                      }
                    ],
                    default: "PENDING"
                  }
                }
              }
            }
          }
        }
      }
    ]);

    const dataCount = await externalManagerModel.aggregate([
      {
        $match: {
          fileStatus: "active",
          statusByCreditPd: { $in: ["complete", "approve"] }
        }
      },
      {
        $match: startDate && endDate ? dateMatch : {}
      },
      {
        $lookup: {
          from: "customerdetails",
          localField: "customerId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                customerFinId: 1,
                branch: 1,
                employeId: 1,
                productId: 1
              }
            }
          ],
          as: "customerDetailData"
        }
      },
      // Add newbranches lookup here
      {
        $lookup: {
          from: "newbranches",
          localField: "customerDetailData.branch",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                regionalBranchId: 1
              }
            }
          ],
          as: "newbranchesData"
        }
      },
      // Add regional branch match
      {
        $match: regionalbranch && regionalbranch !== "all" ? regionalBranchMatch : {}
      },
      {
        $match: finalApprovalStatus && finalApprovalStatus !== "all" ? finalApprovalStatusMatch : {}
      },
      {
        $match: fileProcessStatus && fileProcessStatus !== "all" ? fileProcessStatusMatch : {}
      },
      {
        $match: product && product !== "all" ? {
          "customerDetailData.productId": {
            $in: (Array.isArray(product) ? product : product.split(",")).map(
              (id) => new ObjectId(id)
            )
          }
        } : {}
      },
      {
        $match: employee && employee !== "all" ? {
          "customerDetailData.employeId": {
            $in: (Array.isArray(employee) ? employee : employee.split(",")).map(
              (id) => new ObjectId(id)
            )
          }
        } : {}
      },
      {
        $match: branch && branch !== "all" ? branchMatch : {}
      },
      {
        $lookup: {
          from: "applicantdetails",
          localField: "customerId",
          foreignField: "customerId",
          pipeline: [
            {
              $project: {
                fullName: 1,
                fatherName: 1,
                mobileNo: 1,
              }
            }
          ],
          as: "applicantdetailData"
        }
      },
      {
        $match: searchQuery ? searchMatchCondition : {}
      },
      {
        $project: {
          creditPdCompleteDate: 1
        }
      }
    ]);

    console.timeEnd("test1");
    return success(res, "customerDetails", {
      totalCount: dataCount.length,
      userDataLength: data.length,
      userData: data,
    });

  }catch (error) {
    console.error("Error in getDashboardData:", error);
    return unknownError(res, error);
  }
}

module.exports = {
  getFileProcessAllocation,
  addFileProcessForm,
  getFileProcessDetail,
  checkStatusDetail,
  customerListFileProcess,
  addSelfAssign,
  selfAssignList,
  fileProcessStatus,
  updateStatus,
  allFinalSanctionDashboard,
  fileProcessDashbord,
  fileProcessBranchList,
  List,
  getDashboardData,
  getDashboardDataByProduct,
  newFileProcessDashbord
};
