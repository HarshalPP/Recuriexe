const {
  success,
  unknownError,
  serverValidation,
  unauthorized,
  badRequest,
  notFound,
} = require("../../../../globalHelper/response.globalHelper");
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');
const cron = require("node-cron");
const moment = require("moment");
const { uploadUrlToSpaces } = require('./salesLogin.controller.js')
const { validationResult } = require("express-validator");
const { uploadToSpaces } = require('../services/cibilPdfHandle.js')
const cibilDetailModel = require("../model/cibilDetail.model");
const processModel = require("../model/process.model");
const pdModel = require('../model/credit.Pd.model.js')
const customerModel = require('../model/customer.model.js')
const applicantcustomerModel = require('../model/applicant.model.js')
const externalVendorModel = require("../model/externalManager/externalVendorDynamic.model.js");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const applicantModel = require("../model/applicant.model.js");
const coApplicantModel = require("../model/co-Applicant.model");
const referenceModel = require("../model/reference.model");
const guarantorModel = require("../model/guarantorDetail.model");
const bankAccountModel = require("../model/banking.model");
const salesCaseModel = require("../model/salesCase.model.js");
const employeeModel = require("../model/adminMaster/employe.model.js")
const newBranchModel = require("../model/adminMaster/newBranch.model.js")
const vendorTypeModel = require('../model/adminMaster/vendorType.model.js')
const vendorModel = require('../model/adminMaster/vendor.model.js')
const mailSwitchesModel = require("../model/adminMaster/mailSwitches.model.js")
const externalVendorFormModel = require('../model/externalManager/externalVendorDynamic.model.js')

const { cibilDetailGoogleSheet, externalVendorGoogleSheet, salesToPdAllFilesDataGoogleSheet } = require('./googleSheet.controller.js');
const { fetchCibilScore } = require("../services/kyc.services.js");
const { cibil_pdf_converter } = require("../services/python_service/code_converter_service.js");
const { sendEmail, sendEmailByVendor } = require('./functions.Controller.js')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');


function capitalizeWords(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}



async function newcibilAddDetail(req, res) {
  try {
    let tokenId = req.Id;
    const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");

    const { customerId, applicantCibilScore, applicantCibilReport, coApplicantData, guarantorCibilScore, guarantorCibilReport, pendingFormName, finalStatus, finalRemark, cibilRemarkForPd } = req.body;

    // Fetch customer data
    const customerExit = await customerModel.findById(customerId);
    if (!customerExit) {
      return notFound(res, "customer Id Not Found");
    }

    // Update fields based on pending forms
    let updateFields = { cibilId: tokenId, cibilFormStart: true, cibilFormComplete: true, statusByCibil: finalStatus, remarkByCibil: finalRemark };
    if (pendingFormName.includes("applicant")) {
      updateFields.applicantFormStart = false;
      updateFields.cibilFormComplete = false;
    }
    if (pendingFormName.includes("coApplicant")) {
      updateFields.coApplicantFormStart = false;
      updateFields.cibilFormComplete = false;
    }
    if (pendingFormName.includes("guarantor")) {
      updateFields.guarantorFormStart = false;
      updateFields.cibilFormComplete = false;
    }

    // Update process document
    const updatedDocument = await processModel.findOneAndUpdate(
      { customerId },
      { $set: updateFields },
      { new: true }
    );

    // Initialize cibil data
    const cibilData = {
      customerId,
      applicantCibilScore,
      // applicantCibilReport: applicantCibilReport || '',
      applicantFetchHistory: [],
      coApplicantData: coApplicantData.map(coApp => ({
        ...coApp,
        // coApplicantCibilReport: coApp.coApplicantCibilReport || '',
        coApplicantCibilScore: coApp.coApplicantCibilScore,
        coApplicantFetchHistory: []
      })),
      coApplicantFetchHistory: [],
      guarantorCibilScore,
      // guarantorCibilReport: guarantorCibilReport || '',
      guarantorFetchHistory: [],
      cibilFetchDate: todayDate,
      pendingFormName,
      finalRemark,
      finalStatus,
      cibilId: [tokenId],
      cibilRemarkForPd
    };

    let existingCibilData = await cibilDetailModel.findOne({ customerId });



    if (existingCibilData) {

      const existingIds = existingCibilData.cibilId || [];
      if (!existingIds.includes(tokenId)) {
        cibilData.cibilId = [...existingIds, tokenId];
      } else {
        cibilData.cibilId = existingIds;
      }


      // Handle applicant reports
      if (applicantCibilReport && Array.isArray(applicantCibilReport)) {
        applicantCibilReport.forEach(report => {
          const isReportExist = existingCibilData.applicantFetchHistory.some(entry => entry.cibilReport === report);
          if (!isReportExist) {
            existingCibilData.applicantFetchHistory.push({
              cibilEmployeeId: tokenId,
              fetchDate: todayDate,
              cibilReport: report,
              cibilScore: applicantCibilScore,
            });
          }
        });
      }

      // Handle coApplicant reports
      if (coApplicantData && Array.isArray(coApplicantData)) {
        // Initialize coApplicantData array if it doesn't exist
        if (!existingCibilData.coApplicantData) {
          existingCibilData.coApplicantData = [];
        }

        coApplicantData.forEach((coApp, coAppIndex) => {
          // Initialize coApplicantData[coAppIndex] if it doesn't exist
          if (!existingCibilData.coApplicantData[coAppIndex]) {
            existingCibilData.coApplicantData[coAppIndex] = {
              coApplicantFetchHistory: []
            };
          }

          // Ensure coApplicantFetchHistory exists
          if (!existingCibilData.coApplicantData[coAppIndex].coApplicantFetchHistory) {
            existingCibilData.coApplicantData[coAppIndex].coApplicantFetchHistory = [];
          }

          const reports = Array.isArray(coApp.coApplicantCibilReport)
            ? coApp.coApplicantCibilReport
            : [coApp.coApplicantCibilReport].filter(Boolean);

          reports.forEach(report => {
            if (!report || report === '') return;

            // Check if report exists in this co-applicant's history
            const isReportExist = existingCibilData.coApplicantData[coAppIndex].coApplicantFetchHistory.some(
              entry => entry.cibilReport === report
            );

            if (!isReportExist) {
              existingCibilData.coApplicantData[coAppIndex].coApplicantFetchHistory.push({
                cibilEmployeeId: tokenId,
                fetchDate: todayDate,
                cibilReport: report,
                cibilScore: coApplicantData[coAppIndex].coApplicantCibilScore
              });
            }
          });
        });

        // Update cibilData with modified coApplicantData
        cibilData.coApplicantData = existingCibilData.coApplicantData;
      }

      // Handle guarantor reports
      if (guarantorCibilReport && Array.isArray(guarantorCibilReport)) {
        guarantorCibilReport.forEach(report => {
          const isReportExist = existingCibilData.guarantorFetchHistory.some(entry => entry.cibilReport === report);
          if (!isReportExist) {
            existingCibilData.guarantorFetchHistory.push({
              cibilEmployeeId: tokenId,
              fetchDate: todayDate,
              cibilReport: report,
              cibilScore: guarantorCibilScore
            });
          }
        });
      }

      // Update all histories in cibilData
      cibilData.applicantFetchHistory = existingCibilData.applicantFetchHistory;
      cibilData.coApplicantFetchHistory = existingCibilData.coApplicantFetchHistory;
      cibilData.guarantorFetchHistory = existingCibilData.guarantorFetchHistory;

    } else {
      // Handle new data when no existing records
      if (applicantCibilReport && Array.isArray(applicantCibilReport)) {
        applicantCibilReport.forEach(report => {
          cibilData.applicantFetchHistory.push({
            cibilEmployeeId: tokenId,
            fetchDate: todayDate,
            cibilReport: report,
            cibilScore: applicantCibilScore
          });
        });
      }

      if (coApplicantData && Array.isArray(coApplicantData)) {
        // Initialize coApplicantData array if it doesn't exist in cibilData
        if (!cibilData.coApplicantData) {
          cibilData.coApplicantData = [];
        }

        coApplicantData.forEach((coApp, coAppIndex) => {
          // Initialize this coApplicant's data if it doesn't exist
          if (!cibilData.coApplicantData[coAppIndex]) {
            cibilData.coApplicantData[coAppIndex] = {
              coApplicantCibilReport: coApp.coApplicantCibilReport || '',
              coApplicantCibilScore: coApp.coApplicantCibilScore,
              coApplicantFetchHistory: []
            };
          }

          const reports = Array.isArray(coApp.coApplicantCibilReport)
            ? coApp.coApplicantCibilReport
            : [coApp.coApplicantCibilReport].filter(Boolean);

          reports.forEach(report => {
            if (!report || report === '') return;

            cibilData.coApplicantData[coAppIndex].coApplicantFetchHistory.push({
              cibilEmployeeId: tokenId,
              fetchDate: todayDate,
              cibilReport: report,
              cibilScore: coApp.coApplicantCibilScore,
            });
          });
        });
      }

      if (guarantorCibilReport && Array.isArray(guarantorCibilReport)) {
        guarantorCibilReport.forEach(report => {
          cibilData.guarantorFetchHistory.push({
            cibilEmployeeId: tokenId,
            fetchDate: todayDate,
            cibilReport: report,
            cibilScore: guarantorCibilScore
          });
        });
      }

      cibilData.cibilId = [tokenId];
    }


    // Save or update the CIBIL data
    const updatedCibilData = await cibilDetailModel.findOneAndUpdate(
      { customerId: customerId },
      cibilData,
      { new: true, upsert: true }
    ).lean();


    if (finalStatus === "approved") {
      const productId = "6734821148d4dbfbe0c69c7e"
      // this prodcut id is FINSECBT file handle direct inactive
      const customerDetails = await customerModel.findOne({ _id: new ObjectId(customerId) });
      const applicantDetails = await applicantModel.findOne({ customerId: customerId });

      const externalManagerDetails = await externalVendorModel.findOne({ customerId: customerId });

      let fileStatus = "active";
      let statusByCreditPd = "notAssign"
      let creditPdCompleteDate = "";
      // Default value

      const activeVendors = await vendorTypeModel.find({ status: "active" }).select("vendorType");
      const vendorTypes = activeVendors.map(v => v.vendorType); // Extract only vendorType values


      // console.log('vendorTypes---',vendorTypes)
      if (!externalManagerDetails) {

        const vendors = vendorTypes.map(vendorType => ({
          vendorType,
          "vendorId": null,
          "assignDocuments": [],
          "pdfRemark": "",
          "externalVendorRemark": "",
          "uploadProperty": [],
          "finalLegalUpload": [],
          "vettingLegalUpload": [],
          "estimateDocument": [],
          "remarkByVendor": "",
          "sendMail": "mailNotSend",
          "statusByVendor": "notAssign",
          "fileStageStatus": "",
          "vendorStatus": "",
          "reason": "",
          "requirement": [],
          "vendorUploadDate": "",
          "approverRemark": "",
          "assignDate": "",
          "approverEmployeeId": null,
          "assignEmployeeId": null
        }));

        //bt product inactive remove
        if (customerDetails && customerDetails.productId && customerDetails.productId.toString() === productId) {
          statusByCreditPd = "approve";
          creditPdCompleteDate = todayDate;
        }

        // console.log('external manager model create')
        externalRecord = new externalVendorFormModel({
          customerId,
          externalVendorId: null,
          partnerNameId: null,

          creditPdId: null,
          creditPdRejectPhoto: "",
          remarkForCreditPd: "",
          approvalRemarkCreditPd: "",
          pdfCreateByCreditPd: "",
          remarkByCreditPd: "",
          creditPdAssignDate: "",
          statusByCreditPd: statusByCreditPd,
          creditPdSendMail: "mailNotSend",
          creditPdCompleteDate: creditPdCompleteDate,
          creditPdApprovarDate: '',
          pdAssignEmployeeId: null,
          pdApproverEmployeeId: null,
          vendors,

          // vendors: [
          //   {
          //     vendorType: "rcu",
          //     vendorId: null,
          //     assignDocuments: [],
          //     pdfRemark: "",
          //     externalVendorRemark: "",
          //     uploadProperty: [],
          //     remarkByVendor: "",
          //     sendMail: "mailNotSend",
          //     statusByVendor: "notAssign",
          //     receiverName: "",
          //     vendorStatus: "",
          //     reason: "",
          //     requirement: [],
          //     numberOfCattle: "",
          //     cattlesBreed: "",
          //     milkLitPerDay: "",
          //     areaOfLand: "",
          //     areaOfConstruction: "",
          //     fairMarketValue: "",
          //     vendorUploadDate: "",
          //     approverRemark: "",
          //     approverDate: "",
          //     assignDate: "",
          //     assignEmployeeId: null
          //   },
          //   {
          //     vendorType: "technical",
          //     vendorId: null,
          //     assignDocuments: [],
          //     pdfRemark: "",
          //     externalVendorRemark: "",
          //     uploadProperty: [],
          //     remarkByVendor: "",
          //     sendMail: "mailNotSend",
          //     statusByVendor: "notAssign",
          //     receiverName: "",
          //     vendorStatus: "",
          //     reason: "",
          //     requirement: [],
          //     numberOfCattle: "",
          //     cattlesBreed: "",
          //     milkLitPerDay: "",
          //     areaOfLand: "",
          //     areaOfConstruction: "",
          //     fairMarketValue: "",
          //     vendorUploadDate: "",
          //     approverRemark: "",
          //     approverDate: "",
          //     assignDate: "",
          //     assignEmployeeId: null
          //   },
          //   {
          //     vendorType: "legal",
          //     vendorId: null,
          //     assignDocuments: [],
          //     pdfRemark: "",
          //     externalVendorRemark: "",
          //     uploadProperty: [],
          //     remarkByVendor: "",
          //     sendMail: "mailNotSend",
          //     statusByVendor: "notAssign",
          //     receiverName: "",
          //     vendorStatus: "",
          //     reason: "",
          //     requirement: [],
          //     numberOfCattle: "",
          //     cattlesBreed: "",
          //     milkLitPerDay: "",
          //     areaOfLand: "",
          //     areaOfConstruction: "",
          //     fairMarketValue: "",
          //     vendorUploadDate: "",
          //     approverRemark: "",
          //     approverDate: "",
          //     assignDate: "",
          //     assignEmployeeId: null
          //   },
          //   {
          //     vendorType: "other",
          //     vendorId: null,
          //     assignDocuments: [],
          //     pdfRemark: "",
          //     externalVendorRemark: "",
          //     uploadProperty: [],
          //     remarkByVendor: "",
          //     sendMail: "mailNotSend",
          //     statusByVendor: "notAssign",
          //     receiverName: "",
          //     vendorStatus: "",
          //     reason: "",
          //     requirement: [],
          //     numberOfCattle: "",
          //     cattlesBreed: "",
          //     milkLitPerDay: "",
          //     areaOfLand: "",
          //     areaOfConstruction: "",
          //     fairMarketValue: "",
          //     vendorUploadDate: "",
          //     approverRemark: "",
          //     approverDate: "",
          //     assignDate: "",
          //     assignEmployeeId: null
          //   },
          //   {
          //     vendorType: "rm",
          //     vendorId: null,
          //     assignDocuments: [],
          //     pdfRemark: "",
          //     externalVendorRemark: "",
          //     uploadProperty: [],
          //     remarkByVendor: "",
          //     sendMail: "mailNotSend",
          //     statusByVendor: "notAssign",
          //     receiverName: "",
          //     vendorStatus: "",
          //     reason: "",
          //     requirement: [],
          //     numberOfCattle: "",
          //     cattlesBreed: "",
          //     milkLitPerDay: "",
          //     areaOfLand: "",
          //     areaOfConstruction: "",
          //     fairMarketValue: "",
          //     vendorUploadDate: "",
          //     approverRemark: "",
          //     approverDate: "",
          //     assignDate: "",
          //     assignEmployeeId: null
          //   },
          //   {
          //     vendorType: "tagging",
          //     vendorId: null,
          //     assignDocuments: [],
          //     pdfRemark: "",
          //     externalVendorRemark: "",
          //     uploadProperty: [],
          //     remarkByVendor: "",
          //     sendMail: "mailNotSend",
          //     statusByVendor: "notAssign",
          //     receiverName: "",
          //     vendorStatus: "",
          //     reason: "",
          //     requirement: [],
          //     numberOfCattle: "",
          //     cattlesBreed: "",
          //     milkLitPerDay: "",
          //     areaOfLand: "",
          //     areaOfConstruction: "",
          //     fairMarketValue: "",
          //     vendorUploadDate: "",
          //     approverRemark: "",
          //     approverDate: "",
          //     assignDate: "",
          //     assignEmployeeId: null
          //   },
          //   {
          //     vendorType: "fi",
          //     vendorId: null,
          //     assignDocuments: [],
          //     pdfRemark: "",
          //     externalVendorRemark: "",
          //     uploadProperty: [],
          //     remarkByVendor: "",
          //     sendMail: "mailNotSend",
          //     statusByVendor: "notAssign",
          //     receiverName: "",
          //     vendorStatus: "",
          //     reason: "",
          //     requirement: [],
          //     numberOfCattle: "",
          //     cattlesBreed: "",
          //     milkLitPerDay: "",
          //     areaOfLand: "",
          //     areaOfConstruction: "",
          //     fairMarketValue: "",
          //     vendorUploadDate: "",
          //     approverRemark: "",
          //     approverDate: "",
          //     assignDate: "",
          //     assignEmployeeId: null
          //   },
          // ],

          fileRevertStatusByPd: "allDone",
          fileRevertRemarkByPd: "",
          fileRevertStatusBySales: {
            coApplicant: true,
            guarantor: true,
          },
          fileRevertStatusByCibil: true,

          location: {
            type: "Point", coordinates: [0, 0]
          },

          status: "incomplete",
          fileHoldRemark: "",
          fileStatus
        });
        await externalRecord.save();
      }
    }

    success(res, `Form Submited`, updatedCibilData);

    updatedCibilData.customerFinIdStr = customerExit.customerFinId
    updatedCibilData.loginPendenyStatusStr = finalStatus
    updatedCibilData.loginFinalRemarkStr = finalRemark

    const salesToPdSheet = {
      customerFinIdStr: customerExit.customerFinId,
      loginPendenyStatusStr: finalStatus,
      loginFinalRemarkStr: finalRemark,
      pdStatusStr: "notAssign",
      branchPendencyStatusStr: "notAssign",
      rcuStatusStr: "notAssign",
      technicalStatusStr: "notAssign",
      legalStatusStr: "notAssign",
      rmStatusStr: "notAssign",
      taggingStatusStr: "notAssign",

    }
    // console.log('mail funation starts')

    const sendMailByCibil = await mailSwitchesModel.findOne();

    if (sendMailByCibil?.masterMailStatus && sendMailByCibil?.cibilMail && sendMailByCibil?.cibilSubmitTimeMailSend) {
      await sendEmailByCibil(tokenId, updatedCibilData, customerExit);
    }

    await salesToPdAllFilesDataGoogleSheet(salesToPdSheet)


  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
}



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function capitalizeWords(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

async function cibilAddDetail(req, res) {
  try {
    let tokenId = req.Id;
    const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");


    const applicantCibilDetail = typeof req.body.applicantCibilDetail === "string" ? JSON.parse(req.body.applicantCibilDetail) : req.body.applicantCibilDetail;
    // const coApplicantCibilDetail = typeof req.body.coApplicantCibilDetail === "string" ? JSON.parse(req.body.coApplicantCibilDetail) : req.body.coApplicantCibilDetail;
    const coApplicantDataRaw = typeof req.body.coApplicantData === "string" ? JSON.parse(req.body.coApplicantData) : req.body.coApplicantData;
    // console.log('coApplicantDataRaw----- 1 ',coApplicantDataRaw)
    const coApplicantData = coApplicantDataRaw.map(coApplicant => {
      coApplicant.coApplicantCibilDetail = typeof coApplicant.coApplicantCibilDetail === "string" ? JSON.parse(coApplicant.coApplicantCibilDetail) : coApplicant.coApplicantCibilDetail;
      return coApplicant
    })
    const guarantorCibilDetail = typeof req.body.guarantorCibilDetail === "string" ? JSON.parse(req.body.guarantorCibilDetail) : req.body.guarantorCibilDetail;

    const { customerId, applicantCibilScore, applicantTotalEmiAmount, applicantTotalOverDueAmount, guarantorCibilScore,
      guarantorTotalEmiAmount, guarantorTotalOverDueAmount, TotalLoansNumbers, CurrentLoanDetail,
      reasonOfDPD, guarantorCibilRemark, guarantorCibilStatus, applicantCibilRemark, applicantCibilStatus } = req.body;

    const customerExit = await customerModel.findById(customerId)
    if (!customerExit) {
      return notFound(res, "customer Id Not Found")
    }
    const customerFinId = customerExit.customerFinId

    function getOverallCoApplicantStatus(coApplicantData) {
      if (!Array.isArray(coApplicantData) || coApplicantData.length === 0) {
        return 'pending';
      }

      const statuses = coApplicantData.map(applicant => applicant.coApplicantCibilStatus);

      if (statuses.includes('rejected')) {
        return 'rejected';
      } else if (statuses.includes('pending')) {
        return 'pending';
      } else if (statuses.every(status => status === 'approved')) {
        return 'approved';
      } else if (statuses.every(status => status === 'complete')) {
        return 'complete';
      } else {
        return 'pending';
      }
    }

    function getOverallCoApplicantScore(coApplicantData) {
      if (!Array.isArray(coApplicantData) || coApplicantData.length === 0) {
        return 0;
      }

      const relevantApplicant = coApplicantData.find(applicant => applicant.coApplicantCibilStatus);
      return relevantApplicant ? relevantApplicant.coApplicantCibilScore : (coApplicantData[0]?.coApplicantCibilScore || 0);
    }
    function getOverallCoApplicantRemark(coApplicantData) {
      if (!Array.isArray(coApplicantData) || coApplicantData.length === 0) {
        return '';
      }

      return coApplicantData.map((applicant, index) => {
        const prefix = index === 0 ? 'First' :
          index === 1 ? 'Second' :
            index === 2 ? 'Third' :
              `${index + 1}th`;
        return `${prefix}:- ${applicant.coApplicantCibilRemark || ''}`;
      }).join(', ');
    }

    const coApplicantCibilStatus = getOverallCoApplicantStatus(coApplicantData);
    const coApplicantCibilScore = getOverallCoApplicantScore(coApplicantData);
    const coApplicantCibilRemark = getOverallCoApplicantRemark(coApplicantData);

    let formStatus = 'incomplete'
    let remarkMessage = []

    if (applicantCibilStatus === "rejected" || coApplicantCibilStatus === "rejected") {
      formStatus = 'rejected'
    } else if (applicantCibilStatus === "pending" || coApplicantCibilStatus === "pending" || guarantorCibilStatus === "pending" || guarantorCibilStatus === "rejected") {
      formStatus = 'pending'
    }

    if (applicantCibilStatus || coApplicantCibilStatus || guarantorCibilStatus) {

      if (applicantCibilRemark) {
        remarkMessage.push(`Applicant: ${applicantCibilRemark}`);
      }
      if (coApplicantCibilRemark) {
        remarkMessage.push(`Co-Applicant: ${coApplicantCibilRemark}`);
      }
      if (guarantorCibilRemark) {
        remarkMessage.push(`Guarantor: ${guarantorCibilRemark}`);
      }
    }

    let remarkByCibil = remarkMessage.join(' | ');

    const hasEmptyField = (obj) => {
      return Object.values(obj).some(value => value === "");
    };

    // const noneEmptyFields = (arr) => {
    //   return arr.every(obj => !hasEmptyField(obj));
    // };
    // const applicantFieldsFilled = noneEmptyFields(applicantCibilDetail);
    // const coApplicantFieldsFilled = noneEmptyFields(coApplicantData);
    // const guarantorFieldsFilled = noneEmptyFields(guarantorCibilDetail);

    // if (applicantFieldsFilled && coApplicantFieldsFilled && guarantorFieldsFilled && guarantorCibilReport && coApplicantCibilReport && applicantCibilReport && applicantCibilScore > 0 && coApplicantCibilScore > 0 && guarantorCibilScore > 0 && TotalLoansNumbers !== '' && CurrentLoanDetail !== '' && reasonOfDPD !== '') {
    // console.log('formStatus',formStatus)
    var allDone;
    if (applicantCibilScore > -2 && coApplicantCibilScore > -2) {
      if (guarantorCibilStatus !== 'skip') {
        if (guarantorCibilScore > -2) {
          if (applicantCibilStatus === "approved" && coApplicantCibilStatus === "approved" && guarantorCibilStatus === "approved") {
            formStatus = "complete"
            await processModel.findOneAndUpdate({ customerId }, { cibilId: tokenId, cibilFormStart: true, cibilFormComplete: true, statusByCibil: formStatus, remarkByCibil }, { new: true });
            allDone = "Form Approved";
          } else {
            await processModel.findOneAndUpdate({ customerId }, {
              cibilId: tokenId, cibilFormStart: true, cibilFormComplete: false, applicantFormStart: (applicantCibilStatus === 'pending') ? false :
                (applicantCibilStatus === 'reject' ||
                  applicantCibilStatus === '' ||
                  applicantCibilStatus === 'complete' ||
                  applicantCibilStatus === 'approved') ? true : false, coApplicantFormStart: (coApplicantCibilStatus === 'pending') ? false :
                    (coApplicantCibilStatus === 'reject' ||
                      coApplicantCibilStatus === 'complete' ||
                      coApplicantCibilStatus === '' ||
                      coApplicantCibilStatus === 'approved') ? true : false, guarantorFormStart: (guarantorCibilStatus === 'pending') ? false :
                        (guarantorCibilStatus === 'reject' ||
                          guarantorCibilStatus === 'complete' ||
                          guarantorCibilStatus === '' ||
                          guarantorCibilStatus === 'approved') ? true : false, statusByCibil: formStatus, remarkByCibil
            }, { new: true });
            allDone = "Not Approved , guarantor";
          }

        } else {
          await processModel.findOneAndUpdate({ customerId }, { cibilId: tokenId, cibilFormStart: true, cibilFormComplete: false, statusByCibil: formStatus, remarkByCibil }, { new: true });
          allDone = "Please Fill All Fields ";
        }
      } else {
        if (applicantCibilStatus === "approved" && coApplicantCibilStatus === "approved") {
          formStatus = "complete"
          await processModel.findOneAndUpdate({ customerId }, { cibilId: tokenId, cibilFormStart: true, cibilFormComplete: true, statusByCibil: formStatus }, { new: true });
          allDone = "Form Approved";
        } else {
          await processModel.findOneAndUpdate({ customerId }, {
            cibilId: tokenId, cibilFormStart: true, cibilFormComplete: false, applicantFormStart: (applicantCibilStatus === 'pending') ? false :
              (applicantCibilStatus === 'reject' ||
                applicantCibilStatus === 'complete' ||
                applicantCibilStatus === 'approved') ? true : false, coApplicantFormStart: (coApplicantCibilStatus === 'pending') ? false :
                  (coApplicantCibilStatus === 'reject' ||
                    coApplicantCibilStatus === 'complete' ||
                    coApplicantCibilStatus === 'approved') ? true : false, statusByCibil: formStatus, remarkByCibil
          }, { new: true });
          allDone = "Not Approved Your Applicant, coApplicant";
        }
      }
    } else {
      await processModel.findOneAndUpdate({ customerId }, { cibilId: tokenId, cibilFormStart: true, cibilFormComplete: false, statusByCibil: formStatus, remarkByCibil }, { new: true });
      allDone = "Please Fill All Fields ";
    }

    const cibilData = {
      // cibilId: tokenId,
      customerId,
      applicantCibilScore,
      applicantCibilStatus,
      applicantCibilRemark,
      applicantCibilReport: '',
      // applicantFetchHistory:[],
      applicantCibilDetail,
      applicantTotalEmiAmount,
      applicantTotalOverDueAmount,
      // coApplicantData,
      coApplicantData: coApplicantData.map(coApp => ({
        ...coApp,
        coApplicantCibilReport: [],
        coAapplicantFetchDate: []
      })),
      guarantorCibilScore,
      guarantorCibilReport: '',
      guarantorCibilDetail,
      guarantorCibilStatus,
      guarantorCibilRemark,
      guarantorTotalEmiAmount,
      guarantorTotalOverDueAmount,
      TotalLoansNumbers,
      CurrentLoanDetail,
      reasonOfDPD,
      remarkByCibil,
      formStatus,
      cibilFetchDate: todayDate
    };

    let existingCibilData = await cibilDetailModel.findOne({ customerId });
    // Handle CIBIL ID tracking
    if (existingCibilData) {
      // console.log('existingCibilData----',existingCibilData.cibilId , 'existingCibilData.cibilId.includes(tokenId)',existingCibilData.cibilId.includes(tokenId))
      if (!existingCibilData.cibilId.includes(tokenId)) {
        cibilData.cibilId = [...existingCibilData.cibilId, tokenId];
      }
    } else {
      cibilData.cibilId = [tokenId];
    }

    // Handle file uploads and dates
    if (applicantCibilStatus === "approved" || applicantCibilStatus === "rejected" || applicantCibilStatus === "pending") {
      if ((req.files && req.files["applicantCibilReport"]) || (req.body.applicantCibilReport && req.body.applicantCibilReport.startsWith("/uploads/"))) {
        let applicantReportPath = req.files?.["applicantCibilReport"]
          ? `/uploads/${req.files["applicantCibilReport"][0].filename}`
          : req.body.applicantCibilReport;

        const reportExists = existingCibilData?.applicantCibilReport?.includes(applicantReportPath);

        if (!reportExists) {
          cibilData.applicantCibilReport = existingCibilData?.applicantCibilReport
            ? [...existingCibilData.applicantCibilReport, applicantReportPath]
            : [applicantReportPath];

          cibilData.applicantFetchDate = existingCibilData?.applicantFetchDate
            ? [...existingCibilData.applicantFetchDate, todayDate]
            : [todayDate];

          // console.log('applicantReportPath----',applicantReportPath)

          cibilData.applicantFetchHistory = existingCibilData?.applicantFetchHistory
            ? [...existingCibilData.applicantFetchHistory, {
              cibilEmployeeId: tokenId,
              fetchDate: todayDate,
              cibilReport: applicantReportPath
            }]
            : [{
              cibilEmployeeId: tokenId,
              fetchDate: todayDate,
              cibilReport: applicantReportPath
            }];

        } else {
          cibilData.applicantCibilReport = existingCibilData.applicantCibilReport;
          cibilData.applicantFetchDate = existingCibilData.applicantFetchDate;
        }
      }
    }

    // Handle guarantor uploads
    if (guarantorCibilStatus === "approved" || guarantorCibilStatus === "rejected" || guarantorCibilStatus === "pending") {
      if ((req.files && req.files["guarantorCibilReport"]) || (req.body.guarantorCibilReport && req.body.guarantorCibilReport.startsWith("/uploads/"))) {
        let guarantorReportPath = req.files?.["guarantorCibilReport"]
          ? `/uploads/${req.files["guarantorCibilReport"][0].filename}`
          : req.body.guarantorCibilReport;

        const reportExists = existingCibilData?.guarantorCibilReport?.includes(guarantorReportPath);

        if (!reportExists) {
          cibilData.guarantorCibilReport = existingCibilData?.guarantorCibilReport
            ? [...existingCibilData.guarantorCibilReport, guarantorReportPath]
            : [guarantorReportPath];

          cibilData.guarantorFetchDate = existingCibilData?.guarantorFetchDate
            ? [...existingCibilData.guarantorFetchDate, todayDate]
            : [todayDate];

          cibilData.guarantorFetchHistory = existingCibilData?.guarantorFetchHistory
            ? [...existingCibilData.guarantorFetchHistory, {
              cibilEmployeeId: tokenId,
              fetchDate: todayDate,
              cibilReport: guarantorReportPath
            }]
            : [{
              cibilEmployeeId: tokenId,
              fetchDate: todayDate,
              cibilReport: guarantorReportPath
            }];


        } else {
          cibilData.guarantorCibilReport = existingCibilData.guarantorCibilReport;
          cibilData.guarantorFetchDate = existingCibilData.guarantorFetchDate;
        }
      }
    }

    if (coApplicantData.length > 0) {
      cibilData.coApplicantData = coApplicantData.map((coApp, index) => {
        const existingCoApp = existingCibilData?.coApplicantData?.[index];

        let coAppReportPath = null;
        if ((req.files && req.files[`coApplicantCibilReport${index}`]) || (coApp.coApplicantCibilReport)) {
          coAppReportPath = req.files?.[`coApplicantCibilReport${index}`]
            ? `/uploads/${req.files[`coApplicantCibilReport${index}`][0].filename}`
            : coApp.coApplicantCibilReport;

          const reportExists = existingCoApp?.coApplicantCibilReport?.includes(coAppReportPath);

          if (!reportExists) {
            return {
              ...coApp,
              coApplicantCibilReport: existingCoApp?.coApplicantCibilReport
                ? [...existingCoApp.coApplicantCibilReport, coAppReportPath]
                : [coAppReportPath],

              coAapplicantFetchDate: existingCoApp?.coAapplicantFetchDate
                ? [...existingCoApp.coAapplicantFetchDate, todayDate]
                : [todayDate],
              coApplicantFetchHistory: existingCoApp?.coApplicantFetchHistory
                ? [...existingCoApp.coApplicantFetchHistory, {
                  cibilEmployeeId: tokenId,
                  fetchDate: todayDate,
                  cibilReport: coAppReportPath
                }]
                : [{
                  cibilEmployeeId: tokenId,
                  fetchDate: todayDate,
                  cibilReport: coAppReportPath
                }]

            };
          }
        }

        // Return existing data if no new report or if report exists
        return {
          ...coApp,
          coApplicantCibilReport: existingCoApp?.coApplicantCibilReport,
          coAapplicantFetchDate: existingCoApp?.coAapplicantFetchDate,
          coApplicantFetchHistory: existingCoApp?.coApplicantFetchHistory || []
        };
      });
    }


    // if (applicantCibilStatus === "approved" || applicantCibilStatus === "rejected") {
    //   if ((req.files && req.files["applicantCibilReport"]) || (req.body.applicantCibilReport && req.body.applicantCibilReport.startsWith("/uploads/"))) {
    //     if (req.files && req.files["applicantCibilReport"]) {
    //       const filePath = `/uploads/${req.files["applicantCibilReport"][0].filename}`;
    //       cibilData.applicantCibilReport = filePath;
    //     } else {
    //       cibilData.applicantCibilReport = req.body.applicantCibilReport;
    //     }

    //   } else {
    //     return badRequest(res, "Applicant CIBIL Report Required")
    //   }
    // }

    // if (guarantorCibilStatus === "approved" || guarantorCibilStatus === "rejected") {
    //   if ((req.files && req.files["guarantorCibilReport"]) || (req.body.guarantorCibilReport && req.body.guarantorCibilReport.startsWith("/uploads/"))) {
    //     if (req.files && req.files["guarantorCibilReport"]) {
    //       const filePath = `/uploads/${req.files["guarantorCibilReport"][0].filename}`;
    //       cibilData.guarantorCibilReport = filePath;
    //     } else {
    //       cibilData.guarantorCibilReport = req.body.guarantorCibilReport;
    //     }

    //   } else {
    //     return badRequest(res, "Guarantor CIBIL Report Required");
    //   }
    // }


    const updatedCibilData = await cibilDetailModel.findOneAndUpdate(
      { customerId: customerId },
      cibilData,
      { new: true, upsert: true }
    ).lean()

    //     const customerBranch = await newBranchModel.findById(customerExit.branch)

    //     console.log('customerBranch',customerBranch , 'ID', customerBranch._id)

    //     // const vendorByBranch = await vendorModel.findBy 

    //     const assignCreditPdToBranch = async (customerBranch) => {
    //       try {
    //           // First find the vendor type for creditPd
    //           const creditPdType = await vendorTypeModel.findOne({
    //               vendorType: "creditPd",
    //           });

    //           if (!creditPdType) {
    //               throw new Error("Credit PD vendor type not found");
    //           }

    //           // Find an active vendor with creditPd role and matching branch
    //           const creditPdVendor = await vendorModel.findOne({
    //               branchId: new Object(customerBranch._id),
    //               vendorType: new ObjectId(creditPdType._id),
    //               status: "active"
    //           });

    //           if (!creditPdVendor) {
    //               // If no vendor found for specific branch, try finding from regional branch
    //               const regionalCreditPdVendor = await vendorModel.findOne({
    //                   branchId: customerBranch.regionalBranchId,
    //                   vendorType: creditPdType._id,
    //                   status: "active"
    //               });

    //               if (!regionalCreditPdVendor) {
    //                   throw new Error("No Credit PD vendor found for branch or regional branch");
    //               }

    //               return {
    //                   creditPdId: regionalCreditPdVendor._id,
    //                   isRegionalPd: true
    //               };
    //           }

    //           return {
    //               creditPdId: creditPdVendor._id,
    //               isRegionalPd: false
    //           };
    //       } catch (error) {
    //           console.error("Error in assignCreditPdToBranch:", error.message);
    //           throw error;
    //       }
    //   };

    // const funcres = await assignCreditPdToBranch()

    // console.log('funcres--',funcres)

    if ((applicantCibilStatus === "approved" && coApplicantCibilStatus === "approved" && guarantorCibilStatus === "skip") || (applicantCibilStatus === "approved" && coApplicantCibilStatus === "approved" && guarantorCibilStatus === "approved")) {
      const customerDetails = await customerModel.findOne({ _id: customerId });
      const applicantDetails = await applicantModel.findOne({ customerId: customerId });
      const externalManagerDetails = await externalVendorModel.findOne({ customerId: customerId });

      const activeVendors = await vendorTypeModel.find({ status: "active" }).select("vendorType");
      const vendorTypes = activeVendors.map(v => v.vendorType); // Extract only vendorType values


      if (!externalManagerDetails) {
        const vendors = vendorTypes.map(vendorType => ({
          vendorType,
          "vendorId": null,
          "assignDocuments": [],
          "pdfRemark": "",
          "externalVendorRemark": "",
          "uploadProperty": [],
          "finalLegalUpload": [],
          "vettingLegalUpload": [],
          "estimateDocument": [],
          "remarkByVendor": "",
          "sendMail": "mailNotSend",
          "statusByVendor": "notAssign",
          "fileStageStatus": "",
          "vendorStatus": "",
          "reason": "",
          "requirement": [],
          "vendorUploadDate": "",
          "approverRemark": "",
          "assignDate": "",
          "approverEmployeeId": null,
          "assignEmployeeId": null
        }));

        // console.log('external manager model create')
        externalRecord = new externalVendorFormModel({
          customerId,
          externalVendorId: null,
          partnerNameId: null,
          branchEmployeeId: null,
          remarkForBranch: "",
          branchStatus: "notAssign",
          branchByremark: "",
          branchCompleteDate: "",
          branchApproverRemark: "",
          branchApproverDate: "",
          branchAssignDate: "",
          branchVendorSendMail: "mailNotSend",
          branchRequiredDocument: {
            agricultureIncomeForm: "WIP",
            appPdcForm: "WIP",
            bankStatementForm: "WIP",
            electricityKycForm: "WIP",
            esignPhotoForm: "WIP",
            gtrPdcForm: "WIP",
            milkIncomeForm: "WIP",
            nachRegistrationKycForm: "WIP",
            otherBuisnessForm: "WIP",
            physicalFileCourierForm: "WIP",
            propertyPaperKycForm: "WIP",
            rmPaymentUpdateForm: "WIP",
            salaryAndOtherIncomeForm: "WIP",
            samagraIdKycForm: "WIP",
            udhyamKycForm: "WIP",
            appEsignLinkForm: "WIP",
            enachLinkForm: "WIP",
            otherDocumentForm: "WIP",
            signKycForm: "WIP",
            appEsignLink: [],
            enachLink: ""
          },

          creditPdId: null,
          creditPdRejectPhoto: "",
          remarkForCreditPd: "",
          approvalRemarkCreditPd: "",
          pdfCreateByCreditPd: "",
          remarkByCreditPd: "",
          creditPdAssignDate: "",
          statusByCreditPd: "notAssign",
          creditPdSendMail: "mailNotSend",
          creditPdCompleteDate: "",
          creditPdApprovarDate: '',
          pdAssignEmployeeId: null,
          pdApproverEmployeeId: null,

          tlPdId: null,
          rematrkForTlPd: "",
          approvalRemarkTlPd: "",
          pdfCreateByTlPd: "",
          remarkByTlPd: "",
          statusByTlPd: "notAssign",
          tlPdSendMail: "mailNotSend",
          vendors,

          fileRevertStatusByPd: "allDone",
          fileRevertRemarkByPd: "",
          fileRevertStatusBySales: {
            coApplicant: true,
            guarantor: true,
          },
          fileRevertStatusByCibil: true,

          location: {
            type: "Point", coordinates: [0, 0]
          },

          rcuImageUploads: {
            selfiWithLatLongHouseFront: null,
            customerPhotoWithHouseFront: null,
            houseTotalLengthPhoto: null,
            houseTotalWidthPhoto: null,
            houseLeftSidePhoto: null,
            houseRightSidePhoto: null,
            houseApproachRoadPhoto: null,
            kitchenPhotos: null
          },
          status: "incomplete",
          fileHoldRemark: "",
          fileStatus: "active"
        });
        await externalRecord.save();
      }
    }

    success(res, `Form Submited`, updatedCibilData);

    applicantCibilRemark, applicantCibilRemark
    updatedCibilData.customerFinIdStr = customerFinId
    updatedCibilData.loginPendenyStatusStr = overallStatus
    updatedCibilData.loginFinalRemarkStr = formattedRemarks

    const salesToPdSheet = {
      customerFinIdStr: customerFinId,
      loginPendenyStatusStr: overallStatus,
      loginFinalRemarkStr: formattedRemarks,
      pdStatusStr: "notAssign",
      branchPendencyStatusStr: "notAssign",
      rcuStatusStr: "notAssign",
      technicalStatusStr: "notAssign",
      legalStatusStr: "notAssign",
      rmStatusStr: "notAssign",
      taggingStatusStr: "notAssign",

    }
    const sendMailByCibil = await mailSwitchesModel.findOne();

    if (sendMailByCibil?.masterMailStatus && sendMailByCibil?.cibilMail && sendMailByCibil?.cibilSubmitTimeMailSend) {
      await sendEmailByCibil(tokenId, updatedCibilData, customerExit);
    }

    await salesToPdAllFilesDataGoogleSheet(salesToPdSheet)


  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
}


async function sendEmailByCibil(tokenId, updatedCibilData, customerExit) {
  try {


    const cibilDetail = await cibilDetailModel.findOne({ customerId: customerExit._id })
    const processDetail = await processModel.findOne({ customerId: customerExit._id })

    // console.log('customerExit---', cibilDetail)

    const salesEmployeeEmail = await employeeModel.findById(customerExit.employeId);

    let reportingManagerEmail = null;
    if (salesEmployeeEmail?.reportingManagerId) {
      const reportingManager = await employeeModel.findById(salesEmployeeEmail.reportingManagerId);
      reportingManagerEmail = reportingManager?.workEmail || null;
    }


    const applicant = await applicantModel.findOne({ customerId: customerExit._id });
    const applicantEmail = applicant?.email || null;

    const employeeByToken = await employeeModel.findById(tokenId);

    const emails = [
      process.env.CIBIL_MAIL,
      process.env.EMAIL_USER_PD,
      salesEmployeeEmail?.workEmail,
      reportingManagerEmail,
      employeeByToken?.workEmail,
    ].filter(Boolean);


    const applicantCibilReport = updatedCibilData.applicantFetchHistory?.slice(-1)[0]?.cibilReport || "";

    const guarantorCibilReport = updatedCibilData.guarantorFetchHistory?.slice(-1)[0]?.cibilReport || "";

    const lastCoApplicantReports = updatedCibilData.coApplicantData.map(coApplicant =>
      coApplicant.coApplicantFetchHistory?.slice(-1)[0]?.cibilReport || []
    );


    const allDocuments = [
      applicantCibilReport,
      guarantorCibilReport,
      ...lastCoApplicantReports,
    ].filter(Boolean);


    const documentsArray = allDocuments.filter(document => document && document.trim() !== '');

    const toEmails = applicantEmail;
    const ccEmails = emails;

    const pdfContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <div style="border-top: 1px solid #cccccc; padding-top: 10px; margin-top: 10px;">
          <p>Dear ${applicant?.fullName?.toUpperCase() || "Applicant"} JI,</p>
          <p>We hope this email finds you well.</p>
          <p>We are writing to confirm that we have successfully received your loan application. Thank you for choosing Fin Coopers for your financial needs.</p>
          <p>Our team is currently reviewing your application and will get back to you as soon as possible with further details. In the meantime, if you have any questions or need additional information, please feel free to contact us at 9303978297 or reply to this email.</p>
          <br>
          <p><strong>CIBIL REPORT ATTACHED FOR REFERENCE</strong></p>
          <p><strong>Credit Scores:</strong></p>
          
          <table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse;">
            <tbody>
              <tr>
                <td>APPLICANT CIBIL</td>
                <td>${updatedCibilData?.applicantCibilScore ?? ' '}</td>
              </tr>
              <tr>
                <td>GUARANTOR CIBIL</td>
                <td>${updatedCibilData?.guarantorCibilScore ?? " "}</td>
              </tr>
              ${updatedCibilData.coApplicantData.map((coApplicant, index) => `
                <tr>
                  <td>CO-APPLICANT ${index + 1} CIBIL</td>
                  <td>${coApplicant?.coApplicantCibilScore ?? ' '}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <br>
          <p><strong>Please find below remarks for your loan:</strong></p>
          <p>Remark : - ${processDetail?.remarkByCibil ?? 'No Remark'}</p>
          <br><br>
          <p>Best regards,<br>Team Fincoopers<br>For more info visit <a href="https://www.fincoopers.com">www.fincoopers.com</a></p>
            <strong>FINCOOPERS INDIA PVT. LTD.</strong><br>
          CIN: U74140MP2019PTC048765<br>
          Registered Office: 207-210, Diamond Trade Center,<br>
          11 bungalow colony, near Hukamchand Ghantaghar marg, Indore (M.P.) 452001<br>
        </div>

      </div>
    `;



    const BASEURL = process.env.BASE_URL;
    // pdf send
    const attachments = documentsArray.map((data) => ({
      path: data,
      filename: data.split('/').pop(),
      contentType: 'application/pdf'
    }));


    await sendEmailByVendor("cibilEmployee",
      toEmails,
      ccEmails,
      `Fwd: Confirmation of Loan Application Received - ${customerExit.customerFinId || ''} - ${applicant?.fullName?.toUpperCase() || ''} S/O ${applicant?.fatherName?.toUpperCase() || ''}`,
      pdfContent,
      attachments
    );

    // console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending CIBIL email:', error);
    throw error;
  }
}


async function getCibilDetail(req, res) {
  try {
    const { customerId } = req.params;
    if (!ObjectId.isValid(customerId)) {
      return notFound(res, "Invalid Customer ID");
    }
    const cibilDetail = await cibilDetailModel.findOne({ customerId: new ObjectId(customerId) }).populate({ path: "cibilId", select: "userName employeUniqueId employeName" });
    if (!cibilDetail) {
      return notFound(res, "CIBIL details not found");
    }
    const capitalizeFields = [
      'CurrentLoanDetail',
      'applicantCibilRemark',
      'coApplicantCibilRemark',
      'guarantorCibilRemark',
      'reasonOfDPD'
    ];
    for (const field of capitalizeFields) {
      if (cibilDetail[field] && typeof cibilDetail[field] === 'string') {
        cibilDetail[field] = capitalizeWords(cibilDetail[field]);
      }
    }
    const arrayFields = [
      'applicantCibilDetail',
      'coApplicantCibilDetail',
      'guarantorCibilDetail'
    ];
    for (const field of arrayFields) {
      if (Array.isArray(cibilDetail[field])) {
        cibilDetail[field].forEach(item => {
          for (const key in item) {
            if (typeof item[key] === 'string') {
              item[key] = capitalizeWords(item[key]);
            }
          }
        });
      }
    }
    success(res, "CIBIL details successfully", cibilDetail);
  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
}


function removeDuplicateFetchDetails(fetchDetails) {
  const seen = new Set();
  return fetchDetails.filter(({ cibilReport, fetchDate }) => {
    const uniqueKey = `${cibilReport}_${fetchDate}`;
    if (seen.has(uniqueKey)) {
      return false;
    }
    seen.add(uniqueKey);
    return true;
  });
}


async function getCibilDetailSetData(req, res) {
  try {
    const { customerId } = req.query;

    // Fetch the CIBIL detail document with populated references
    const pdDetails = await pdModel.findOne({ customerId });
    const cibilDetail = await cibilDetailModel.findOne({ customerId })
      .populate({ path: "cibilId", select: "employeName" })
      .populate({ path: "applicantFetchHistory.cibilEmployeeId", select: "employeName" })
      .populate({ path: "coApplicantData.coApplicantFetchHistory.cibilEmployeeId", select: "employeName" })
      .populate({ path: "guarantorFetchHistory.cibilEmployeeId", select: "employeName" })
      .exec();

    if (!cibilDetail) {
      return badRequest(res, "CIBIL details not found");
    }

    const processData = await processModel.findOne({ customerId }).select("statusByCibil remarkByCibil");

    // Extract values from processModel
    const finalStatus = processData?.statusByCibil || "";
    const finalRemark = processData?.remarkByCibil || "";

    // Process applicant fetch details
    let applicantFetchDetails = cibilDetail.applicantFetchHistory.map(history => ({
      employeeName: history.cibilEmployeeId?.employeName || "",
      fetchDate: history.fetchDate || "",
      cibilReport: history.cibilReport || "",
    }));

    // Add latest applicant fetch if available
    const latestApplicantFetchDate = cibilDetail.applicantFetchDate.slice(-1)[0] || cibilDetail.cibilFetchDate;
    const latestApplicantReport = cibilDetail.applicantCibilReport.slice(-1)[0];
    if (latestApplicantFetchDate && latestApplicantReport) {
      applicantFetchDetails.push({
        employeeName: cibilDetail.cibilId[0]?.employeName || "",
        fetchDate: latestApplicantFetchDate || "",
        cibilReport: latestApplicantReport || "",
      });
    }

    // Remove duplicate entries from applicant fetch details
    applicantFetchDetails = removeDuplicateFetchDetails(applicantFetchDetails);

    // Process co-applicant fetch details
    const coApplicantFetchDetails = cibilDetail.coApplicantData.map((coApplicant, index) => {
      let fetchDetails = coApplicant?.coApplicantFetchHistory.map(history => ({
        employeeName: history.cibilEmployeeId?.employeName || "",
        fetchDate: history.fetchDate || "",
        cibilReport: history.cibilReport || "",
      }));


      // Add latest co-applicant fetch if available
      const latestCoAppFetchDate = coApplicant?.coAapplicantFetchDate.slice(-1)[0];
      const latestCoAppReport = coApplicant?.coApplicantCibilReport.slice(-1)[0];
      if (latestCoAppFetchDate && latestCoAppReport) {
        fetchDetails.push({
          employeeName: cibilDetail.cibilId[0]?.employeName || "",
          fetchDate: latestCoAppFetchDate || "",
          cibilReport: latestCoAppReport || "",
        });
      }

      // Remove duplicate co-applicant fetch details
      fetchDetails = removeDuplicateFetchDetails(fetchDetails);

      return {
        coApplicantIndex: index + 1,
        coApplicantCibilStatus: coApplicant.coApplicantCibilStatus || "",
        coApplicantCibilScore: coApplicant.coApplicantCibilScore || "",
        coApplicantCibilRemark: coApplicant.coApplicantCibilRemark || "",
        coApplicantCibilDetail: coApplicant.coApplicantCibilDetail || "",
        coApplicantOverdueAccount: coApplicant.coApplicantOverdueAccount || "",
        coApplicantTotalAccount: coApplicant.coApplicantTotalAccount || "",
        coApplicantTotalOverDueAmount: coApplicant.coApplicantTotalOverDueAmount || "",
        coApplicantTotalEmiAmount: coApplicant.coApplicantTotalEmiAmount || "",
        coApplicantFetchDetails: fetchDetails,
      };
    });

    // Process guarantor fetch details
    let guarantorFetchDetails = cibilDetail.guarantorFetchHistory.map(history => ({
      employeeName: history.cibilEmployeeId?.employeName || "",
      fetchDate: history.fetchDate || "",
      cibilReport: history.cibilReport || "",
    }));

    // Add latest guarantor fetch if available
    const latestGuarantorFetchDate = cibilDetail.guarantorFetchDate.slice(-1)[0];
    const latestGuarantorReport = cibilDetail.guarantorCibilReport.slice(-1)[0];
    if (latestGuarantorFetchDate && latestGuarantorReport) {
      guarantorFetchDetails.push({
        employeeName: cibilDetail.cibilId[0]?.employeName || "",
        fetchDate: latestGuarantorFetchDate || "",
        cibilReport: latestGuarantorReport || "",
      });
    }

    // Remove duplicate guarantor fetch details
    guarantorFetchDetails = removeDuplicateFetchDetails(guarantorFetchDetails);

    // Prepare comprehensive response
    const responseData = {
      customerId: cibilDetail.customerId,
      applicantCibilScore: cibilDetail.applicantCibilScore,
      applicantCibilStatus: cibilDetail.applicantCibilStatus,
      applicantCibilRemark: cibilDetail.applicantCibilRemark,
      applicantCibilDetail: cibilDetail.applicantCibilDetail,
      applicantTotalObligation: cibilDetail.applicantTotalObligation,
      applicantTotalOverDueAmount: cibilDetail.applicantTotalOverDueAmount,
      applicantTotalAccount: cibilDetail.applicantTotalAccount,
      applicantOverdueAccount: cibilDetail.applicantOverdueAccount,
      applicantZeroBalanceAccount: cibilDetail.applicantZeroBalanceAccount,
      applicantHighCreditSanctionAmount: cibilDetail.applicantHighCreditSanctionAmount,
      applicantCurrentOutstanding: cibilDetail.applicantcurrentOutstanding,
      applicantNumberOfEnquiry: cibilDetail.applicantNumberOfEnquiry,
      applicantFetchDetails,
      coApplicantData: coApplicantFetchDetails,
      guarantorCibilScore: cibilDetail.guarantorCibilScore,
      guarantorCibilStatus: cibilDetail.guarantorCibilStatus,
      guarantorCibilRemark: cibilDetail.guarantorCibilRemark,
      guarantorCibilDetail: cibilDetail.guarantorCibilDetail,
      guarantorTotalEmiAmount: cibilDetail.guarantorTotalEmiAmount,
      guarantorTotalOverDueAmount: cibilDetail.guarantorTotalOverDueAmount,
      guarantorFetchDetails,
      TotalLoansNumbers: cibilDetail.TotalLoansNumbers,
      CurrentLoanDetail: cibilDetail.CurrentLoanDetail,
      reasonOfDPD: cibilDetail.reasonOfDPD,
      pendingFormName: cibilDetail.pendingFormName,
      cibilRemarkForPd: cibilDetail?.cibilRemarkForPd,
      finalRemark: finalRemark ? finalRemark : cibilDetail.finalRemark,
      finalStatus: finalStatus ? finalStatus : cibilDetail.finalStatus,
      pdReplyToCibilRemarks: pdDetails?.pdReplyToCibilRemarks || "",
    };

    return success(res, "CIBIL Detail Retrieved Successfully", responseData);
  } catch (error) {
    console.error("Error fetching CIBIL details:", error);
    return unknownError(res, error);
  }
}



async function updateCibilData(req, res) {
  try {
    const targetDate = new Date("2024-07-30T11:07:22.872+00:00");
    const customerId = '66a786190aab8b780d00658b'
    const cibilDetails = await cibilDetailModel.find({ customerId: customerId });

    for (let detail of cibilDetails) {
      // console.log('detail-----',detail)
      // Only update if coApplicantData is empty or doesn't exist
      if (!detail.coApplicantData || detail.coApplicantData.length === 0) {
        const coApplicantDataEntry = {
          // Take values from root level fields
          coApplicantCibilReport: detail.coApplicantCibilReport
            ? [detail.coApplicantCibilReport] // Convert string to array if exists
            : [],
          coApplicantCibilScore: detail.coApplicantCibilScore || 0,
          coApplicantCibilStatus: detail.coApplicantCibilStatus || "pending",
          coApplicantCibilRemark: detail.coApplicantCibilRemark || "",
          coAapplicantFetchDate: detail.cibilFetchDate ? [detail.cibilFetchDate] : [],
        };

        // Debug log to see what's being updated
        // console.log('Updating document ID:', detail._id);
        // console.log('Data being set:', JSON.stringify(coApplicantDataEntry, null, 2));

        const updateData = await cibilDetailModel.findByIdAndUpdate(
          detail._id,
          {
            $set: {
              coApplicantData: [coApplicantDataEntry],
              // Optionally clear the root level fields after migration
              coApplicantCibilReport: "",
              coApplicantCibilScore: undefined,
              coApplicantCibilStatus: "pending",
              coApplicantCibilRemark: ""
            }
          },
          { new: true }
        );

        // console.log(`Updated document with ID: ${detail._id}`);
      }
    }

    // console.log("Migration completed successfully.");
    return success(res, "Migration completed successfully");
  } catch (error) {
    console.error("Error migrating data:", error);
    return unknownError(res, error);
  }
}



async function cibilByApproveFileOnExtrenalManager(req, res) {
  try {

    const cibilDetail = await cibilDetailModel.find({
      applicantCibilStatus: "check status ",
      guarantorCibilStatus: { $in: ["skip  ", "check "] },
      // cibilId: new ObjectId('66c9ecbbb65d8c4dd1e2f959'),
      applicantCibilReport: { $regex: '^/uploads' } // regex to check if it starts with "/uploads"
    });


    for (let detail of cibilDetail) {
      const { customerId } = detail;

      // Check if an external vendor record already exists for this customerId
      let externalRecord = await externalVendorFormModel.findOne({ customerId });

      const activeVendors = await vendorTypeModel.find({ status: "active" }).select("vendorType");
      const vendorTypes = activeVendors.map(v => v.vendorType); // Extract only vendorType values


      if (!externalRecord) {
        const constDeatils = await customerModel.findById(customerId)


        // console.log('customerId,--', customerId, constDeatils.customerFinId)

        if (constDeatils) {
          const vendors = vendorTypes.map(vendorType => ({
            vendorType,
            "vendorId": null,
            "assignDocuments": [],
            "pdfRemark": "",
            "externalVendorRemark": "",
            "uploadProperty": [],
            "finalLegalUpload": [],
            "vettingLegalUpload": [],
            "estimateDocument": [],
            "remarkByVendor": "",
            "sendMail": "mailNotSend",
            "statusByVendor": "notAssign",
            "fileStageStatus": "",
            "vendorStatus": "",
            "reason": "",
            "requirement": [],
            "vendorUploadDate": "",
            "approverRemark": "",
            "assignDate": "",
            "approverEmployeeId": null,
            "assignEmployeeId": null
          }));

          externalRecord = new externalVendorFormModel({
            customerId,
            externalVendorId: null,
            partnerNameId: null,
            branchNameId: null,


            creditPdId: null,
            creditPdRejectPhoto: "",
            remarkForCreditPd: "",
            statusByCreditPd: "notAssign",
            remarkByCreditPd: "",
            approvalRemarkCreditPd: "",
            pdfCreateByCreditPd: "",
            creditPdAssignDate: "",
            pdAssignEmployeeId: null,
            pdApproverEmployeeId: null,
            vendors,

            location: {
              type: "Point", coordinates: [0, 0]
            },

            status: "incomplete"
          });
          await externalRecord.save();
        }
      }
    }


    success(res, "CIBIL approve successfully", { count: cibilDetail.length, cibilDetail });

  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
}



async function approvedBTFileDelete(req, res) {
  try {
    const customers = await customerModel.find({
      customerFinId: { $regex: '^FINM1' }
    });

    const customerIds = customers.map((customer) => customer._id);
    const matchedExternalDetails = await externalVendorFormModel.find({
      customerId: { $in: customerIds }
    });
    const matchedCustomerIds = matchedExternalDetails.map(detail => detail.customerId.toString());
    const matchedCustomers = customers.filter(customer =>
      matchedCustomerIds.includes(customer._id.toString())
    );

    const responseData = {
      totalCustomers: customers.length,            // Total customers with matching FIN pattern
      matchedCustomerCount: matchedCustomers.length, // Total customers with matches in externalVendorFormModel
      matchedCustomers,                            // List of matched customers
      matchedExternalDetails                       // List of matched external details
    };

    success(res, "approved successfully", responseData);

  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
}



const countGenderOccurrences = async () => {
  const result = await applicantcustomerModel.aggregate([
    {
      // Group by gender and count occurrences
      $group: {
        _id: "$permanentAddress.state", // Group by gender field
        count: { $sum: 1 } // Count how many times each gender appears
      }
    }
  ]);

  const genderCount = {};
  result.forEach(item => {
    genderCount[item._id] = item.count;
  });

  return genderCount;
};

async function getGenderDistribution(req, res) {
  const genderCounts = await countGenderOccurrences();
  success(res, 'Gender Counts:', genderCounts)
  // console.log('Gender Counts:', genderCounts);
};


function splitAddress(data) {
  // Concatenate addressLine1 and addressLine2
  let fullAddress = data.permanentAddress.addressLine1 + ' ' + data.permanentAddress.addressLine2;

  // Split the address into chunks of 40 characters each
  let maxCharLimit = 40;
  let lines = [];

  while (fullAddress.length > 0) {
    // Get the first 40 characters
    let part = fullAddress.substring(0, maxCharLimit);

    // Find the last space within 40 characters to avoid cutting words
    let lastSpaceIndex = part.lastIndexOf(' ');
    if (lastSpaceIndex !== -1) {
      part = part.substring(0, lastSpaceIndex);
    }

    // Add the part to the lines array and remove it from fullAddress
    lines.push(part.trim());
    fullAddress = fullAddress.substring(part.length).trim();
  }

  // Assign lines to line1, line2, line3, line4, and line5
  return {
    line1: lines[0] || '',
    line2: lines[1] || '',
    line3: lines[2] || '',
    line4: lines[3] || '',
    line5: lines[4] || ''
  };
}

async function getCibilScore(req, res) {
  try {
    const stateCodeMap = {
      "Jammu & Kashmir": 1,
      "J&K": 1,
      "JAMMU AND KASHMIR": 1,
      "Jammu Kashmir": 1,
      "Himachal Pradesh": 2,
      "HP": 2,
      "HIMACHAL PRADESH": 2,
      "HIMACHAL": 2,
      "Punjab": 3,
      "PUNJAB": 3,
      "CHANDIGARH": 4,
      "CHANDIGARH ": 4, // with space
      "Uttarakhand": 5,
      "Uttaranchal": 5, // old name
      "UTTARAKHAND": 5,
      "UK": 5,
      "Haryana": 6,
      "HARYANA": 6,
      "HR": 6,
      "Delhi": 7,
      "DELHI": 7,
      "DL": 7,
      "Rajasthan": 8,
      "RAJASTHAN": 8,
      "RJ": 8,
      "Uttar Pradesh": 9,
      "UP": 9,
      "UTTAR PRADESH": 9,
      "Bihar": 10,
      "BIHAR": 10,
      "Sikkim": 11,
      "SIKKIM": 11,
      "Arunachal Pradesh": 12,
      "ARUNACHAL PRADESH": 12,
      "ARUNACHAL": 12,
      "Nagaland": 13,
      "NAGALAND": 13,
      "Manipur": 14,
      "MANIPUR": 14,
      "Mizoram": 15,
      "MIZORAM": 15,
      "Tripura": 16,
      "TRIPURA": 16,
      "Meghalaya": 17,
      "MEGHALAYA": 17,
      "Assam": 18,
      "ASSAM": 18,
      "West Bengal": 19,
      "WB": 19,
      "WEST BENGAL": 19,
      "Jharkhand": 20,
      "JHARKHAND": 20,
      "ODISHA": 21,
      "ORISSA": 21, // old name
      "ODISHA ": 21, // with space
      "Chhattisgarh": 22,
      "CHHATTISGARH": 22,
      "Madhya Pradesh": 23,
      "M.P.": 23,
      "Mp": 23,
      "MADHYA PRADESH": 23,
      "MADHYA PARDESH": 23,
      "Madhyapradesh": 23,
      "Gujarat": 24,
      "GUJARAT": 24,
      "Daman & Diu": 25,
      "DAMAN AND DIU": 25,
      "DAMAN DIU": 25,
      "Dadra & Nagar Haveli and Daman & Diu": 26,
      "Dadraa Nagar Haveli": 26,
      "DAMAN DIU": 26,
      "Maharashtra": 27,
      "MAHARASHTRA": 27,
      "MH": 27,
      "Andhra Pradesh": 28,
      "AP": 28,
      "ANDHRA PRADESH": 28,
      "Karnataka": 29,
      "KARNATAKA": 29,
      "KA": 29,
      "Goa": 30,
      "GOA": 30,
      "Lakshadweep": 31,
      "LAKSHADWEEP": 31,
      "Kerala": 32,
      "KERALA": 32,
      "Tamil Nadu": 33,
      "TN": 33,
      "TAMIL NADU": 33,
      "Pondicherry": 34,
      "Puducherry": 34, // new name
      "PONDICHERRY": 34,
      "Andaman & Nicobar Islands": 35,
      "ANDAMAN AND NICOBAR ISLANDS": 35,
      "Andaman": 35,
      "Nicobar": 35,
      "Telangana": 36,
      "TS": 36,
      "TELANGANA": 36,
      "Ladakh": 38,
      "LADAKH": 38,
      "APO Address": 99
    };

    const docTypeMap = {
      "panCard": "01",
      "voterId": "03",
      "drivingLicence": "04",
    }

    const genderMap = {
      "Male": 2,
      "MALE": 2,
      "FEMALE": 1,
      "Female": 1,
    }

    const { formId, type, state, fetchByHo } = req.body
    const timestamp = Date.now();
    const cibilEmployeeId = req.Id;
    const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");

    let data
    let employeeBranch
    let cibil_json = {
      idNumber: "",
      idType: "",
      firstName: "",
      birthDate: "",
      gender: "",
      stateCode: "",
      pinCode: "",
      line1: "",
      line2: "",
      line3: "",
      line4: "",
      line5: "",
      telephoneNumber: "",
    }

    function getStateCode(state) {
      // Normalize the input by trimming spaces and converting to uppercase
      const normalizedState = state.trim().toUpperCase();

      // Find the state by comparing the normalized input
      for (const key in stateCodeMap) {
        if (key.toUpperCase() === normalizedState) {
          return stateCodeMap[key];
        }
      }

      // Return a message or code if the state is not found
      return false;
    }
    switch (type) {
      case 'applicant':
        data = await applicantModel.findById(formId)
        cibil_json.idNumber = data.panNo
        cibil_json.idType = "01"
        employeeBranch = await employeeModel.findById(data.employeId).populate({ path: "branchId", select: "state" });

        break;
      case 'coapplicant':
        data = await coApplicantModel.findById(formId)
        cibil_json.idNumber = data.docNo
        cibil_json.idType = docTypeMap[data.docType]
        employeeBranch = await employeeModel.findById(data.employeId).populate({ path: "branchId", select: "state" });
        break;
      case 'guarantor':
        data = await guarantorModel.findById(formId)
        cibil_json.idNumber = data.docNo
        cibil_json.idType = docTypeMap[data.docType]
        employeeBranch = await employeeModel.findById(data.employeId).populate({ path: "branchId", select: "state" });
        break;
    }
    let addressData = splitAddress(data)
    let [year, month, date] = data.dob.split("-")
    cibil_json.firstName = data.fullName.split(" ")[0]
    cibil_json.lastName = data.fullName.split(" ")[data.fullName.split(" ").length - 1]
    cibil_json.birthDate = `${date}${month}${year}`
    cibil_json.gender = cibil_json.gender = data.gender.toLowerCase().startsWith("f") ? 1 : 2;
    cibil_json.stateCode = getStateCode(employeeBranch.branchId.state)
    cibil_json.pinCode = data.permanentAddress.pinCode
    cibil_json.line1 = addressData.line1
    cibil_json.line2 = addressData.line2
    cibil_json.line3 = addressData.line3
    cibil_json.line4 = addressData.line4
    cibil_json.line5 = addressData.line5
    cibil_json.telephoneNumber = data.mobileNo

    if (!cibil_json.stateCode) {
      return badRequest(res, `${type}'s state is not valid`)
    }

    /////////////////////////////////  ----------------------------------------------------//////////////////////////////////////////////


    // let cibil_response = await fetchCibilScore(cibil_json)

    // console.log(cibil_response?.controlData?.errorResponseArray);
    // if (cibil_response?.controlData?.errorResponseArray) {
    //   return badRequest(res, cibil_response?.controlData?.errorResponseArray)
    // }

    // await cibil_pdf_converter(`${data.customerId}_${timestamp}_${type}`, cibil_response)

    // const returnData = { score: cibil_response.consumerCreditData[0].scores[0].score, docPath: `${process.env.BASE_URL}uploads/${data.customerId}_${timestamp}_${type}.pdf`, cibilRawData: { creditData: cibil_response.consumerCreditData, cibilSummary: cibil_response.consumerSummaryData } }

    // success(res, "done", returnData)

    /////////////////////////////////  ----------------------------------------------------//////////////////////////////////////////////

    //       let cibil_response = {.....}
    let cibil_response = await fetchCibilScore(cibil_json)

    // console.log(cibil_response?.controlData?.errorResponseArray);
    if (cibil_response?.controlData?.errorResponseArray) {
      return badRequest(res, cibil_response?.controlData?.errorResponseArray)
    }
    await cibil_pdf_converter(`${data.customerId}_${timestamp}_${type}`, cibil_response)

    let docPath = `/uploads/${data.customerId}_${timestamp}_${type}`;

    // let docPath = `/uploads/test.pdf`;

    //  console.log('docPath---1111',docPath)
    if (docPath.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), docPath);

      //  console.log('filePath-----1.51.51.51.5',filePath)
      //  fs.access(filePath); // Check if file exists

      //  console.log('filePath-----22222',filePath)
      const uploadedUrl = await uploadToSpaces(filePath);

      //  console.log('uploadedUrl-----3333',uploadedUrl)
      if (uploadedUrl) {
        docPath = uploadedUrl;
      }
    }

    //  console.log('final url-----4444',docPath)

    const returnData = { score: cibil_response.consumerCreditData[0].scores[0].score, docPath: docPath, cibilRawData: { creditData: cibil_response.consumerCreditData, cibilSummary: cibil_response.consumerSummaryData } }

    success(res, "done", returnData)


    /////////////////////////////////  ----------------------------------------------------//////////////////////////////////////////////

    if (type === "applicant") {
      const applicantRecord = await applicantModel.findById(formId);

      customerId = applicantRecord.customerId;

      updateFields = {
        $set: {
          applicantCibilScore: returnData.score,
          applicantCibilDetail: returnData.cibilRawData
        },
        $push: {
          // applicantFetchDate: todayDate,
          // applicantCibilReport: returnData.docPath,
          applicantFetchHistory: {
            cibilEmployeeId,
            fetchDate: todayDate,
            cibilReport: returnData.docPath,
            cibilScore: returnData.score,
          },
        },
      };

    } else if (type === "guarantor") {
      const guarantorRecord = await guarantorModel.findById(formId);
      // if (!guarantorRecord) return res.status(404).json({ message: "Guarantor not found" });
      customerId = guarantorRecord.customerId;

      updateFields = {
        $set: {
          guarantorCibilScore: returnData.score,
          guarantorCibilDetail: returnData.cibilRawData
        },
        $push: {
          // guarantorFetchDate: todayDate,
          // guarantorCibilReport: returnData.docPath,
          guarantorFetchHistory: {
            cibilEmployeeId,
            fetchDate: todayDate,
            cibilReport: returnData.docPath,
            cibilScore: returnData.score,
          },
        },
      };

    } else if (type === "coapplicant") {
      const coApplicantFind = await coApplicantModel.findById(formId);


      customerId = coApplicantFind.customerId;

      // Fetch all records for the customerId
      const coApplicantRecords = await coApplicantModel.find({ customerId });

      let targetIndex = 0;

      if (coApplicantRecords.length === 1) {
        // console.log('coAPPLICANT single')
        // Single record scenario: push data to index 0
        targetIndex = 0;
      } else {
        // console.log('multple coApplicant')
        // Multiple records: Find index by formId
        targetIndex = coApplicantRecords.findIndex(record => record._id.toString() === formId);
        // console.log('targetIndex----',targetIndex)
        // if (targetIndex === -1) {
        //   return res.status(404).json({ message: "Form ID not matched in co-applicant records." });
        // }
      }

      // Update fields in coApplicantData
      updateFields = {
        $set: {
          [`coApplicantData.${targetIndex}.coApplicantCibilScore`]: returnData.score,
          [`coApplicantData.${targetIndex}.coApplicantCibilDetail`]: returnData.cibilRawData
        },
        $push: {
          // [`coApplicantData.${targetIndex}.coApplicantCibilReport`]: returnData.docPath,
          // [`coApplicantData.${targetIndex}.coAapplicantFetchDate`]: todayDate,
          [`coApplicantData.${targetIndex}.coApplicantFetchHistory`]: {
            cibilEmployeeId,
            fetchDate: todayDate,
            cibilReport: returnData.docPath,
            cibilScore: returnData.score,
          },
        },
      };


    }

    // Update or create in cibilDetailModel
    let cibilRecord = await cibilDetailModel.findOne({ customerId });

    if (cibilRecord) {
      await cibilDetailModel.updateOne({ customerId }, updateFields);

      // console.log('type  data save on cibil model --------- ', type)
    } else {
      const newCibilData = {
        customerId,
        ...updateFields.$set,
        ...updateFields.$push,
      };

      cibilRecord = new cibilDetailModel(newCibilData);
      await cibilRecord.save();


      // console.log('type  data save on cibil model --------- ', type)
    }

    if (fetchByHo) {
      if (type === "applicant") {
        const applicantRecord = await applicantModel.findById(formId);
        const customerId = applicantRecord.customerId;

        const fileStageForms = await processModel.findOneAndUpdate(
          { customerId },
          { $set: { 'fileStageForms.cibilApplicant': true } },
          { new: true }
        );
      } else if (type === "coapplicant") {
        const coApplicantFind = await coApplicantModel.findById(formId);
        const customerId = coApplicantFind.customerId;

        const processDetails = await processModel.findOneAndUpdate(
          {
            customerId,
            "fileStageForms.coApplicant.coApplicantId": null,
          },
          {
            $set: {
              "fileStageForms.coApplicant.$.coApplicantId": formId,
              "fileStageForms.coApplicant.$.cibilStatus": true,
            },
          },
          { new: true }
        );

        if (!processDetails) {
          const updatedProcess = await processModel.findOneAndUpdate(
            { customerId },
            {
              $push: {
                "fileStageForms.coApplicant": {
                  coApplicantId: formId,
                  cibilStatus: true,
                },
              },
            },
            { new: true }
          );
        }
      } else if (type === "guarantor") {
        const guarantorRecord = await guarantorModel.findById(formId);
        customerId = guarantorRecord.customerId;

        const fileStageForms = await processModel.findOneAndUpdate(
          { customerId },
          { $set: { 'fileStageForms.cibilGuarantor': true } },
          { new: true }
        );
      }
    }

  } catch (error) {
    console.log(error);

    return unknownError(res, error);
  }
}


async function deleteCibilForm(req, res) {
  try {
    const { _id } = req.body;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return badRequest(res, "Invalid ID format");
    }
    const cibilDelete = await cibilDetailModel.findByIdAndDelete(_id);
    if (!cibilDelete) {
      return badRequest(res, "cibil Form not found");
    }
    return success(res, "cibil deleted successfully");
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}







const updateCibilFetchDates = async (req, res) => {
  try {

    const allCibilDetails = await cibilDetailModel.find({});

    if (!allCibilDetails || allCibilDetails.length === 0) {
      return badRequest(res, "No CIBIL Details found");
    }

    // Process each record
    for (const cibilDetail of allCibilDetails) {
      // Fetch the cibilFetchDate for current record
      const fetchDate = cibilDetail.cibilFetchDate;
      if (!fetchDate) {
        continue; // Skip this record if no fetch date
      }


      // Check applicantCibilReport and update applicantFetchDate
      if (cibilDetail.applicantFetchDate == "" || cibilDetail.applicantFetchDate == []) {
        if (
          cibilDetail.applicantCibilReport &&
          cibilDetail.applicantCibilReport !== "" &&
          Array.isArray(cibilDetail.applicantCibilReport) &&
          cibilDetail.applicantCibilReport.length > 0 &&
          cibilDetail.applicantCibilReport.some(report => report !== "")
        ) {
          if (!Array.isArray(cibilDetail.applicantFetchDate)) {
            cibilDetail.applicantFetchDate = [];
          }
          cibilDetail.applicantFetchDate.push(fetchDate);
        } else {
          cibilDetail.applicantFetchDate = [];
        }
      }

      // Check guarantorCibilReport and update guarantorFetchDate
      if (cibilDetail.guarantorFetchDate == "" || cibilDetail.guarantorFetchDate == []) {
        if (
          cibilDetail.guarantorCibilReport &&
          cibilDetail.guarantorCibilReport !== "" &&
          Array.isArray(cibilDetail.guarantorCibilReport) &&
          cibilDetail.guarantorCibilReport.length > 0 &&
          cibilDetail.guarantorCibilReport.some(report => report !== "")
        ) {
          if (!Array.isArray(cibilDetail.guarantorFetchDate)) {
            cibilDetail.guarantorFetchDate = [];
          }
          cibilDetail.guarantorFetchDate.push(fetchDate);
        } else {
          cibilDetail.guarantorFetchDate = [];
        }
      }

      // Handle coApplicant data
      if (cibilDetail.coApplicantData && Array.isArray(cibilDetail.coApplicantData)) {
        // Process each coApplicant
        cibilDetail.coApplicantData.forEach((coApplicant, index) => {
          if (coApplicant.coAapplicantFetchDate == "" || coApplicant.coAapplicantFetchDate == []) {
            if (
              coApplicant.coApplicantCibilReport &&
              coApplicant.coApplicantCibilReport !== "" &&
              Array.isArray(coApplicant.coApplicantCibilReport) &&
              coApplicant.coApplicantCibilReport.length > 0 &&
              coApplicant.coApplicantCibilReport.some(report => report !== "")
            ) {
              if (!Array.isArray(coApplicant.coAapplicantFetchDate)) {
                coApplicant.coAapplicantFetchDate = [];
              }
              coApplicant.coAapplicantFetchDate.push(fetchDate);
            } else {
              coApplicant.coAapplicantFetchDate = [];
            }
          }
        });
      }



      if (cibilDetail.coAapplicantFetchDate == "" || cibilDetail.coAapplicantFetchDate == []) {
        if (
          cibilDetail.coApplicantCibilReport &&
          cibilDetail.coApplicantCibilReport !== "" &&
          Array.isArray(cibilDetail.coApplicantCibilReport) &&
          cibilDetail.coApplicantCibilReport.length > 0 &&
          cibilDetail.coApplicantCibilReport.some(report => report !== "")
        ) {
          if (!Array.isArray(cibilDetail.coAapplicantFetchDate)) {
            cibilDetail.coAapplicantFetchDate = [];
          }
          cibilDetail.coAapplicantFetchDate.push(fetchDate);
        } else {
          cibilDetail.coAapplicantFetchDate = [];
        }
      }

      await cibilDetail.save();
    }

    return success(res, "CIBIL fetch dates updated successfully");
  } catch (error) {
    console.error("Error updating CIBIL fetch dates:", error);
    return unknownError(res, "Failed to update CIBIL fetch dates", error);
  }
};


async function cibilFilesManDashBoard(req, res) {
  try {
    const { regionalbranch, branch, employee, product, status, startDateFilter, endDateFilter, limit = 100000, page = 1, searchQuery } = req.query;
    const employeeId = req.Id;

    const employeeExist = await employeeModel.findOne({ _id: employeeId, status: "active" });
    if (!employeeExist) {
      return badRequest(res, "Employee Not Found");
    }

    let matchConditions = {
      fileStatus: "active",
      customerFormComplete: true,
      "customerDetailData.paymentStatus": "success",
      $or: [
        {
          statusByCibil: { $in: ["query", "notAssign"] },
          cibilId: null,
          customerFormComplete: true,
          applicantFormStart: true,
          applicantFormComplete: true,
          coApplicantFormStart: true,
          coApplicantFormComplete: true,
          guarantorFormStart: true,
          guarantorFormComplete: true,
        },
        {
          statusByCibil: { $in: ["query"] },
          cibilId: { $ne: null },
          $or: [
            { applicantFormStart: false },
            { applicantFormComplete: false },
            { coApplicantFormStart: false },
            { coApplicantFormComplete: false },
            { guarantorFormStart: false },
            { guarantorFormComplete: false },
          ],
        },
        { statusByCibil: "approved" },
        { statusByCibil: "rejected" },
      ],
    };

    const today = new Date();
    const defaultStartDate = new Date(today.setHours(0, 0, 0, 0)); // Default start at 6 AM
    const defaultEndDate = new Date(today.setHours(23, 59, 59, 999)); // Default end at 11:50 PM

    function formatDateToISO(date) {
      return new Date(date).toISOString(); // Convert to ISO format
    }

    // Adjust start and end dates based on filters
    let formattedStart = startDateFilter && startDateFilter !== "all"
      ? new Date(new Date(startDateFilter).setHours(0, 0, 0, 0)) // Set to 6 AM
      : defaultStartDate;

    let formattedEnd = endDateFilter && endDateFilter !== "all"
      ? new Date(new Date(endDateFilter).setHours(23, 59, 59, 999)) // Set to 11:50 PM
      : defaultEndDate;

    // ✅ If startDateFilter and endDateFilter are the same, ensure correct filtering for that day
    if (startDateFilter && endDateFilter && startDateFilter === endDateFilter) {
      formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
      formattedEnd = new Date(new Date(startDateFilter).setHours(23, 59, 59, 999));
    }

    // Convert to ISO for MongoDB query
    formattedStart = formatDateToISO(formattedStart);
    formattedEnd = formatDateToISO(formattedEnd);

    // Add match conditions
    if (startDateFilter && endDateFilter && startDateFilter !== "all" && endDateFilter !== "all") {
      matchConditions["$or"] = [
        {
          "cibilDetailData.cibilFetchDate": {
            $gte: formattedStart,
            $lt: formattedEnd,
          },
        },
      ];
    }


    if (searchQuery) {
      matchConditions.$or = [
        { "applicantDetails.mobileNo": { $regex: searchQuery, $options: "i" } },
        { "applicantDetails.customerFatherName": { $regex: searchQuery, $options: "i" } },
        { "applicantDetails.customerFullName": { $regex: searchQuery, $options: "i" } },
        { "customerDetailData.customerFinId": { $regex: searchQuery, $options: "i" } }
      ];
    }


    if (branch && branch !== "all") {
      const branchArray = Array.isArray(branch) ? branch : branch.split(",");
      matchConditions["branchDetails._id"] = { $in: branchArray.map(id => new ObjectId(id)) };
    }


    if (regionalbranch && regionalbranch !== "all") {
      const regionalbranchArray = Array.isArray(regionalbranch) ? regionalbranch : regionalbranch.split(",");
      matchConditions["regionalBranchDetails._id"] = { $in: regionalbranchArray.map(id => new ObjectId(id)) };
    }

    if (employee && employee !== "all") {
      const employeeArray = Array.isArray(employee) ? employee : employee.split(",");
      matchConditions["cibilDetailData.cibilId"] = { $in: employeeArray.map(id => new ObjectId(id)) };
    }

    if (product && product !== "all") {
      const productArray = Array.isArray(product) ? product : product.split(",");
      matchConditions["customerDetailData.productId"] = { $in: productArray.map(id => new ObjectId(id)) };
    }

    if (status && status !== "all") {
      const statusArray = Array.isArray(status) ? status : status.split(",");

      let orConditions = [];

      if (statusArray.includes("pending")) {
        orConditions.push({
          $and: [
            { statusByCibil: { $in: ["query", "notAssign"] } },
            { customerFormComplete: true },
            { applicantFormStart: true },
            { applicantFormComplete: true },
            { coApplicantFormStart: true },
            { coApplicantFormComplete: true },
            { guarantorFormStart: true },
            { guarantorFormComplete: true },
            { cibilId: null }
          ]
        });
      }

      if (statusArray.includes("query")) {
        orConditions.push({
          $and: [
            { statusByCibil: "query" },
            { cibilId: { $ne: null } }, // cibilId should NOT be null for query status
            {
              $or: [
                { guarantorFormStart: false },
                { coApplicantFormStart: false },
                { applicantFormStart: false }
              ]
            }
          ]
        });
      }

      // Handle other statuses dynamically
      const otherStatuses = statusArray.filter(s => !["pending", "query"].includes(s));
      if (otherStatuses.length > 0) {
        orConditions.push({ statusByCibil: { $in: otherStatuses } });
      }

      if (orConditions.length > 0) {
        matchConditions["$or"] = orConditions;
      }
    }



    const aggregationPipeline = [
      {
        $lookup: {
          from: "customerdetails",
          localField: "customerId",
          foreignField: "_id",
          as: "customerDetailData"
        }
      },
      { $unwind: { path: "$customerDetailData", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "employees",
          localField: "customerDetailData.employeId",
          foreignField: "_id",
          as: "salesPerson"
        }
      },
      { $unwind: { path: "$salesPerson", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "newbranches",
          localField: "customerDetailData.branch",
          foreignField: "_id",
          as: "branchDetails"
        }
      },
      { $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "newbranches",
          localField: "branchDetails.regionalBranchId",
          foreignField: "_id",
          as: "regionalBranchDetails"
        }
      },
      { $unwind: { path: "$regionalBranchDetails", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "employees",
          localField: "salesPerson.reportingManagerId",
          foreignField: "_id",
          as: "firstReportingManager"
        }
      },
      { $unwind: { path: "$firstReportingManager", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "employees",
          localField: "firstReportingManager.reportingManagerId",
          foreignField: "_id",
          as: "secondReportingManager"
        }
      },
      { $unwind: { path: "$secondReportingManager", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "employees",
          localField: "secondReportingManager.reportingManagerId",
          foreignField: "_id",
          as: "thirdReportingManager"
        }
      },
      { $unwind: { path: "$thirdReportingManager", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "employees",
          localField: "thirdReportingManager.reportingManagerId",
          foreignField: "_id",
          as: "forthReportingManager"
        }
      },
      { $unwind: { path: "$forthReportingManager", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "applicantdetails",
          localField: "customerId",
          foreignField: "customerId",
          as: "applicantDetails"
        }
      },
      { $unwind: { path: "$applicantDetails", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "employees",
          localField: "creditPdId",
          foreignField: "_id",
          as: "pdEmployeeDetail"
        }
      },
      { $unwind: { path: "$pdEmployeeDetail", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "cibildetails",
          localField: "customerId",
          foreignField: "customerId",
          as: "cibilDetailData"
        }
      },
      { $unwind: { path: "$cibilDetailData", preserveNullAndEmptyArrays: true } },

      {
        $addFields: {
          loginDate: { $ifNull: ["$customerDetailData.createdAt", ""] },
          customerId: { $ifNull: ["$customerId", ""] },
          customerFinId: { $ifNull: ["$customerDetailData.customerFinId", ""] },
          branchName: { $ifNull: ["$branchDetails.name", ""] },
          branch_id: { $ifNull: ["$branchDetails._id", ""] },
          regionalBranchName: { $ifNull: ["$regionalBranchDetails.name", ""] },
          customerFullName: { $ifNull: ["$applicantDetails.fullName", ""] },
          customerFatherName: { $ifNull: ["$applicantDetails.fatherName", ""] },
          mobileNo: { $ifNull: ["$applicantDetails.mobileNo", ""] },
          salesPersonUniqueId: { $ifNull: ["$salesPerson.employeUniqueId", ""] },
          salesPersonName: { $ifNull: ["$salesPerson.employeName", ""] },
          salesPersonManagerName1: { $ifNull: ["$firstReportingManager.employeName", ""] },
          salesPersonManagerName2: { $ifNull: ["$secondReportingManager.employeName", ""] },
          salesPersonManagerName3: { $ifNull: ["$thirdReportingManager.employeName", ""] },
          salesPersonManagerName4: { $ifNull: ["$forthReportingManager.employeName", ""] },
          paymentId: { $ifNull: ["$customerDetailData.orderId", ""] },
          paymentStatus: { $ifNull: ["$customerDetailData.paymentStatus", ""] },
          amount: { $ifNull: ["$customerDetailData.loginFees", ""] },
          paymentDate: {
            $cond: {
              if: { $eq: ["$customerDetailData.paymentStatus", "success"] }, // Show date only if paymentStatus is success
              then: {
                $cond: {
                  if: {
                    $or: [
                      { $eq: [{ $ifNull: ["$customerdetailData.paymentDate", null] }, ""] },
                      { $eq: [{ $ifNull: ["$customerdetailData.paymentDate", null] }, null] }
                    ]
                  },
                  then: "$customerdetailData.updatedAt",
                  else: "$customerdetailData.paymentDate",
                }
              },
              else: ""
            }
          },
          cibilStatus: {
            $switch: {
              branches: [
                {
                  case: { $in: ["$statusByCibil", ["approved"]] },
                  then: "approved"
                },
                {
                  case: { $in: ["$statusByCibil", ["notAssign"]] },
                  then: "notAssign"
                },
                {
                  case: { $in: ["$statusByCibil", ["query"]] },
                  then: "query"
                },
                {
                  case: { $in: ["$statusByCibil", ["rejected"]] },
                  then: "rejected"
                }
              ],
              default: ""
            }
          },
          cibilEmployeeId: { $ifNull: ["$cibilId", ""] },
          // remarkByCibil: { $ifNull: ["$remarkByCibil", ""] },
          applicantCibilScore: { $ifNull: ["$cibilDetailData.applicantCibilScore", ""] },
          guarantorCibilScore: { $ifNull: ["$cibilDetailData.guarantorCibilScore", ""] },

          "coApplicantCibilScores": {
            "$filter": {
              "input": {
                "$reduce": {
                  "input": {
                    "$concatArrays": [
                      {
                        "$cond": {
                          "if": { "$isArray": "$cibilDetailData.coApplicantCibilScore" },
                          "then": "$cibilDetailData.coApplicantCibilScore",
                          "else": [{ "$ifNull": ["$cibilDetailData.coApplicantCibilScore", null] }]
                        }
                      },
                      {
                        "$map": {
                          "input": "$cibilDetailData.coApplicantData",
                          "as": "coApp",
                          "in": [{ "$ifNull": ["$$coApp.coApplicantCibilScore", null] }]
                        }
                      }
                    ]
                  },
                  "initialValue": [],
                  "in": { "$concatArrays": ["$$value", { "$cond": { "if": { "$isArray": "$$this" }, "then": "$$this", "else": ["$$this"] } }] }
                }
              },
              "as": "score",
              "cond": { "$ne": ["$$score", null] }
            }
          },
          sortedApplicantFetchHistory: {
            $slice: [
              {
                $sortArray: {
                  input: "$cibilDetailData.applicantFetchHistory",
                  sortBy: { fetchDate: -1 } // Sort by fetchDate descending
                }
              },
              -1 // Take the last element after sorting
            ]
          },

          lastApplicantFetchHistory: {
            $arrayElemAt: ["$sortedApplicantFetchHistory", 0]
          },

          applicantCibilReport: {
            $ifNull: ["$lastApplicantFetchHistory.cibilReport", ""]
          },

          sortedGuarantorFetchHistory: {
            $slice: [
              {
                $sortArray: {
                  input: "$cibilDetailData.guarantorFetchHistory",
                  sortBy: { fetchDate: -1 } // Sort by fetchDate descending
                }
              },
              -1 // Take the last element after sorting
            ]
          },

          lastGuarantorFetchHistory: {
            $arrayElemAt: ["$sortedGguarantorFetchHistory", 0]
          },

          guarantorCibilReport: {
            $ifNull: ["$lastGguarantorFetchHistory.cibilReport", ""]
          },
          coApplicantCibilReports: {
            $cond: {
              if: { $gt: [{ $size: { $ifNull: ["$cibilDetailData.coApplicantData", []] } }, 0] }, // Check if coApplicantData exists
              then: {
                $filter: {
                  input: {
                    $map: {
                      input: "$cibilDetailData.coApplicantData",
                      as: "coApplicant",
                      in: {
                        $let: {
                          vars: {
                            lastFetch: {
                              $arrayElemAt: [
                                {
                                  $slice: [
                                    {
                                      $sortArray: {
                                        input: "$$coApplicant.coApplicantFetchHistory",
                                        sortBy: { fetchDate: -1 } // Sort by fetchDate descending
                                      }
                                    },
                                    -1 // Get last entry after sorting
                                  ]
                                },
                                0
                              ]
                            }
                          },
                          in: "$$lastFetch.cibilReport" // Extract only cibilReport as string
                        }
                      }
                    }
                  },
                  as: "report",
                  cond: { $and: [{ $ne: ["$$report", null] }, { $ne: ["$$report", ""] }] } // Remove null and empty values
                }
              },
              else: [] // If coApplicantData does not exist, return an empty array
            }
          },


          // applicantCibilReport: { $ifNull: ["$cibilDetailData.applicantFetchHistory.cibilReport", ""] },
          cibilRejectRemark: {
            $cond: {
              if: { $eq: ["$statusByCibil", "rejected"] },
              then: "$remarkByCibil",
              else: ""
            }
          },

          salesQuery: {
            $cond: {
              if: { $eq: ["$statusByCibil", "query"] },
              then: "$remarkByCibil",
              else: ""
            }
          }
        }
      },


      { $match: matchConditions },
      {
        $group: {
          _id: "$customerId",
          customerId: { $first: "$customerId" },
          customerFinId: { $first: "$customerDetailData.customerFinId" },
          loginDate: { $first: "$customerDetailData.createdAt" },
          branchName: { $first: "$branchDetails.name" },
          branch_id: { $first: "$branchDetails._id" },
          regionalBranchName: { $first: "$regionalBranchDetails.name" },
          salesPersonName: { $first: "$salesPerson.employeName" },
          salesPersonUniqueId: { $first: "$salesPerson.employeUniqueId" },
          salesPersonManagerName1: { $first: "$firstReportingManager.employeName" },
          salesPersonManagerName2: { $first: "$secondReportingManager.employeName" },
          salesPersonManagerName3: { $first: "$thirdReportingManager.employeName" },
          salesPersonManagerName4: { $first: "$forthReportingManager.employeName" },
          customerFullName: { $first: "$applicantDetails.fullName" },
          customerFatherName: { $first: "$applicantDetails.fatherName" },
          mobileNo: { $first: "$applicantDetails.mobileNo" },
          paymentId: { $first: "$customerDetailData.orderId" },
          paymentStatus: { $first: "$customerDetailData.paymentStatus" },
          amount: { $first: "$customerDetailData.loginFees" },
          paymentDate: {
            $first: {
              $cond: {
                if: { $eq: ["$customerDetailData.paymentStatus", ["success","noLoginFees"]] },
                then: {
                  $ifNull: [
                    {
                      $cond: {
                        if: {
                          $or: [
                            { $eq: ["$customerDetailData.paymentDate", ""] },
                            { $eq: ["$customerDetailData.paymentDate", null] }
                          ]
                        },
                        then: "$customerDetailData.updatedAt",
                        else: "$customerDetailData.paymentDate"
                      }
                    },
                    "$customerDetailData.updatedAt"
                  ]
                },
                else: ""
              }
            }
          },

          statusByCibil: { $first: "$statusByCibil" },
          cibilStatus: {
            $first: {
              $switch: {
                branches: [
                  { case: { $in: ["$statusByCibil", ["approved"]] }, then: "approved" },
                  { case: { $in: ["$statusByCibil", ["notAssign"]] }, then: "notAssign" },
                  { case: { $in: ["$statusByCibil", ["query"]] }, then: "query" },
                  { case: { $in: ["$statusByCibil", ["rejected"]] }, then: "rejected" }
                ],
                default: ""
              }
            }
          },
          cibilEmployeeId: { $first: "$cibilId" },
          applicantCibilScore: { $first: "$cibilDetailData.applicantCibilScore" },
          guarantorCibilScore: { $first: "$cibilDetailData.guarantorCibilScore" },
          coApplicantCibilScores: {
            $first: {
              $filter: {
                input: {
                  $reduce: {
                    input: {
                      $concatArrays: [
                        {
                          $cond: {
                            if: { $isArray: "$cibilDetailData.coApplicantCibilScore" },
                            then: "$cibilDetailData.coApplicantCibilScore",
                            else: [{ $ifNull: ["$cibilDetailData.coApplicantCibilScore", null] }]
                          }
                        },
                        {
                          $map: {
                            input: "$cibilDetailData.coApplicantData",
                            as: "coApp",
                            in: { $ifNull: ["$$coApp.coApplicantCibilScore", null] }
                          }
                        }
                      ]
                    },
                    initialValue: [],
                    in: { $concatArrays: ["$$value", { $cond: { if: { $isArray: "$$this" }, then: "$$this", else: ["$$this"] } }] }
                  }
                },
                as: "score",
                cond: { $ne: ["$$score", null] }
              }
            }
          },
          cibilRejectRemark: {
            $first: {
              $cond: {
                if: { $eq: ["$statusByCibil", "rejected"] },
                then: "$remarkByCibil",
                else: ""
              }
            }
          },
          salesQuery: {
            $first: {
              $cond: {
                if: { $eq: ["$statusByCibil", "query"] },
                then: "$remarkByCibil",
                else: ""
              }
            }
          },
          customerFormComplete: { $first: "$customerFormComplete" },
          applicantFormStart: { $first: "$applicantFormStart" },
          applicantFormComplete: { $first: "$applicantFormComplete" },
          coApplicantFormStart: { $first: "$coApplicantFormStart" },
          coApplicantFormComplete: { $first: "$coApplicantFormComplete" },
          guarantorFormStart: { $first: "$guarantorFormStart" },
          guarantorFormComplete: { $first: "$guarantorFormComplete" },
          applicantCibilReport: {
            $first: {
              $arrayElemAt: [
                {
                  $map: {
                    input: {
                      $slice: [
                        {
                          $sortArray: {
                            input: "$cibilDetailData.applicantFetchHistory",
                            sortBy: { fetchDate: -1 } // Sort by fetchDate descending
                          }
                        },
                        -1 // Get last entry after sorting
                      ]
                    },
                    as: "applicant",
                    in: "$$applicant.cibilReport"
                  }
                },
                0
              ]
            }
          },
          guarantorCibilReport: {
            $first: {
              $arrayElemAt: [
                {
                  $map: {
                    input: {
                      $slice: [
                        {
                          $sortArray: {
                            input: "$cibilDetailData.guarantorFetchHistory",
                            sortBy: { fetchDate: -1 } // Sort by fetchDate descending
                          }
                        },
                        -1 // Get last entry after sorting
                      ]
                    },
                    as: "guarantor",
                    in: "$$guarantor.cibilReport"
                  }
                },
                0
              ]
            }
          },

          // Handle multiple coApplicants (return 0, 1, or 2 entries)
          coApplicantCibilReports: { $push: "$coApplicantCibilReports" },
        }
      },
      {
        $facet: {
          totalCases: [{ $count: "total" }],
          "cibilPendingCases": [
            {
              "$match": {
                "statusByCibil": { "$in": ['pending', 'query', 'notAssign', 'incomplete'] },
                "customerFormComplete": true,
                "applicantFormStart": true,
                "applicantFormComplete": true,
                "coApplicantFormStart": true,
                "coApplicantFormComplete": true,
                "guarantorFormStart": true,
                "guarantorFormComplete": true
              }
            },
            { "$count": "notAssign" }
          ],
          "loginQueryCases": [
            {
              "$match": {
                "statusByCibil": { "$in": ["pending", "query"] },
                "customerFormComplete": true,
                "$or": [
                  { "applicantFormStart": false },
                  { "applicantFormComplete": false },
                  { "coApplicantFormStart": false },
                  { "coApplicantFormComplete": false },
                  { "guarantorFormStart": false },
                  { "guarantorFormComplete": false }
                ]
              }
            },
            { "$count": "query" }
          ],
          "approvedCases": [
            { "$match": { "statusByCibil": { "$in": ["approved", "complete",] } } },
            { "$count": "approved" }
          ],
          "rejectedCases": [
            { "$match": { "statusByCibil": "rejected" } },
            { "$count": "rejected" }
          ],
          fileDetails: [
            { $skip: (page - 1) * limit },
            { $limit: parseInt(limit) },
            {
              $project: {
                _id: 0,
                customerId: 1,
                customerFinId: 1,
                loginDate:  { $dateToString: {
                  format: "%Y-%m-%d",
                  date: { $toDate: "$loginDate" }
                }
              },
                branchName: 1,
                branch_id: 1,
                regionalBranchName: 1,
                salesPersonName: 1,
                salesPersonUniqueId: 1,
                salesPersonManagerName1: 1,
                salesPersonManagerName2: 1,
                salesPersonManagerName3: 1,
                salesPersonManagerName4: 1,
                reportingManagerName: 1,
                customerFullName: 1,
                customerFatherName: 1,
                mobileNo: 1,
              //   paymentDate: {  $dateToString: {
              //     format: "%Y-%m-%d",
              //     date: { $toDate: "$paymentDate" }
              //   }
              // },
              paymentDate: {
                $cond: [
                  { $or: [
                    { $eq: ["$paymentDate", ""] },                  // Empty string
                    { $eq: [{ $type: "$paymentDate" }, "missing"] } // Field missing
                  ]},
                  "",  // Then: return empty string
                  {
                    $dateToString: {
                      format: "%Y-%m-%d",
                      date: {
                        $cond: [
                          { $eq: [{ $type: "$paymentDate" }, "date"] },
                          "$paymentDate",                // Already a Date
                          { $toDate: "$paymentDate" }    // Convert from string
                        ]
                      }
                    }
                  }
                ]
              },
              
                paymentStatus: 1,
                paymentId: 1,
                amount: 1,
                cibilStatus: 1,
                cibilEmployeeId: 1,
                cibilRejectRemark: 1,
                salesQuery: 1,
                applicantCibilScore: 1,
                guarantorCibilScore: 1,
                coApplicantCibilScores: 1,
                applicantCibilReport: { $ifNull: ["$applicantCibilReport", ""] },
                guarantorCibilReport: { $ifNull: ["$guarantorCibilReport", ""] },
                coApplicantCibilReports: {
                  $reduce: {
                    input: "$coApplicantCibilReports",
                    initialValue: [],
                    in: { $concatArrays: ["$$value", "$$this"] }
                  }
                },
              }
            }
          ]
        }
      }
    ]

    const result = await processModel.aggregate(aggregationPipeline);


    const response = {
      totalCases: ((result[0].rejectedCases[0]?.rejected || 0) +
        (result[0].approvedCases[0]?.approved || 0) +
        (result[0].loginQueryCases[0]?.query || 0) +
        (result[0].cibilPendingCases[0]?.notAssign || 0)) || 0,

      cibilPendingCases: result[0].cibilPendingCases[0]?.notAssign || 0,
      loginQueryCases: result[0].loginQueryCases[0]?.query || 0,
      approvedCases: result[0].approvedCases[0]?.approved || 0,
      rejectedCases: result[0].rejectedCases[0]?.rejected || 0,
      fileDetails: result[0]?.fileDetails || [],
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(result[0]?.totalCases[0]?.total / limit),
        totalItems: result[0]?.totalCases[0]?.total || 0,
      },
    };

    return success(res, "Cibil Files Dashboard", response);

  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

//dashboardMonthlyCount

async function dashboardMonthlyCount(req, res) {
  try {
    const { regionalbranch, branch, employee, product, status, startDateFilter, endDateFilter, limit = 100000, page = 1, searchQuery, year } = req.query;
    const employeeId = req.Id;
    const employeeExist = await employeeModel.findOne({ _id: employeeId, status: "active" });
    if (!employeeExist) {
      return badRequest(res, "Employee Not Found");
    }

    // Check if specific date filters are provided
    const hasDateRangeFilter = startDateFilter && endDateFilter &&
      startDateFilter !== "all" && endDateFilter !== "all";

    // Default to current year if not specified
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11, so add 1
    const filterYear = year ? parseInt(year) : currentYear;
    
    // Check if we're filtering for the current year
    const isCurrentYear = filterYear === currentYear;

    let matchConditions = {
      fileStatus: "active",
      customerFormComplete: true,
      "customerDetailData.paymentStatus": "success",
      $or: [
        {
          statusByCibil: { $in: ["query", "notAssign"] },
          cibilId: null,
          customerFormComplete: true,
          applicantFormStart: true,
          applicantFormComplete: true,
          coApplicantFormStart: true,
          coApplicantFormComplete: true,
          guarantorFormStart: true,
          guarantorFormComplete: true,
        },
        {
          statusByCibil: { $in: ["query"] },
          cibilId: { $ne: null },
          $or: [
            { applicantFormStart: false },
            { applicantFormComplete: false },
            { coApplicantFormStart: false },
            { coApplicantFormComplete: false },
            { guarantorFormStart: false },
            { guarantorFormComplete: false },
          ],
        },
        { statusByCibil: "approved" },
        { statusByCibil: "rejected" },
      ]
    };

    // Add a condition to ensure cibilDetailData exists and has valid cibilFetchDate
    matchConditions["cibilDetailData"] = { $exists: true };
    matchConditions["cibilDetailData.cibilFetchDate"] = {
      $exists: true,
      $ne: null,
      $ne: ""
    };

    // Apply date filtering logic (year-based or specific date range)
    if (hasDateRangeFilter) {
      try {
        // Extract year from the start date (for display purpose)
        const startDatePart = startDateFilter.split('T')[0];
        const endDatePart = endDateFilter.split('T')[0];

        // Format dates with time to ensure full day coverage
        const startDate = new Date(startDatePart);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(endDatePart);
        endDate.setHours(23, 59, 59, 999);

        console.log("Date filter:", {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        });

        matchConditions.$expr = {
          $and: [
            // Check if cibilFetchDate has valid format and is not empty
            { $ne: [{ $ifNull: ["$cibilDetailData.cibilFetchDate", ""] }, ""] },
            {
              $regexMatch: {
                input: { $ifNull: ["$cibilDetailData.cibilFetchDate", ""] },
                regex: /^\d{4}-\d{2}-\d{2}/
              }
            },
            // Date range comparison
            {
              $gte: [
                {
                  $dateFromString: {
                    dateString: { $substr: ["$cibilDetailData.cibilFetchDate", 0, 10] },
                    format: "%Y-%m-%d",
                    onError: startDate  // Default to startDate on error
                  }
                },
                startDate
              ]
            },
            {
              $lte: [
                {
                  $dateFromString: {
                    dateString: { $substr: ["$cibilDetailData.cibilFetchDate", 0, 10] },
                    format: "%Y-%m-%d",
                    onError: startDate  // Default to startDate on error
                  }
                },
                endDate
              ]
            }
          ]
        };
      } catch (err) {
        console.error("Error parsing date filters:", err);
        // Fallback to year filter
        if (isCurrentYear) {
          // For current year, only get data up to current month
          const endOfCurrentMonth = new Date(currentYear, currentMonth, 0); // Last day of current month
          endOfCurrentMonth.setHours(23, 59, 59, 999);
          
          matchConditions.$expr = {
            $and: [
              // Check if cibilFetchDate has valid format and is not empty
              { $ne: [{ $ifNull: ["$cibilDetailData.cibilFetchDate", ""] }, ""] },
              {
                $regexMatch: {
                  input: { $ifNull: ["$cibilDetailData.cibilFetchDate", ""] },
                  regex: /^\d{4}-\d{2}-\d{2}/
                }
              },
              // Year comparison
              {
                $eq: [
                  {
                    $year: {
                      $dateFromString: {
                        dateString: { $substr: ["$cibilDetailData.cibilFetchDate", 0, 10] },
                        format: "%Y-%m-%d",
                        onError: new Date(`${filterYear}-01-01`)  // Default to Jan 1 of filter year
                      }
                    }
                  },
                  filterYear
                ]
              },
              // Only include data up to current month for current year
              {
                $lte: [
                  {
                    $dateFromString: {
                      dateString: { $substr: ["$cibilDetailData.cibilFetchDate", 0, 10] },
                      format: "%Y-%m-%d",
                      onError: new Date(`${filterYear}-01-01`)
                    }
                  },
                  endOfCurrentMonth
                ]
              }
            ]
          };
        } else {
          // For past years, get all months
          matchConditions.$expr = {
            $and: [
              // Check if cibilFetchDate has valid format and is not empty
              { $ne: [{ $ifNull: ["$cibilDetailData.cibilFetchDate", ""] }, ""] },
              {
                $regexMatch: {
                  input: { $ifNull: ["$cibilDetailData.cibilFetchDate", ""] },
                  regex: /^\d{4}-\d{2}-\d{2}/
                }
              },
              // Year comparison
              {
                $eq: [
                  {
                    $year: {
                      $dateFromString: {
                        dateString: { $substr: ["$cibilDetailData.cibilFetchDate", 0, 10] },
                        format: "%Y-%m-%d",
                        onError: new Date(`${filterYear}-01-01`)  // Default to Jan 1 of filter year
                      }
                    }
                  },
                  filterYear
                ]
              }
            ]
          };
        }
      }
    } else {
      // Year filter with better error handling
      if (isCurrentYear) {
        // For current year, only get data up to current month
        const endOfCurrentMonth = new Date(currentYear, currentMonth, 0); // Last day of current month
        endOfCurrentMonth.setHours(23, 59, 59, 999);
        
        matchConditions.$expr = {
          $and: [
            // Check if cibilFetchDate has valid format and is not empty
            { $ne: [{ $ifNull: ["$cibilDetailData.cibilFetchDate", ""] }, ""] },
            {
              $regexMatch: {
                input: { $ifNull: ["$cibilDetailData.cibilFetchDate", ""] },
                regex: /^\d{4}-\d{2}-\d{2}/
              }
            },
            // Year comparison
            {
              $eq: [
                {
                  $year: {
                    $dateFromString: {
                      dateString: { $substr: ["$cibilDetailData.cibilFetchDate", 0, 10] },
                      format: "%Y-%m-%d",
                      onError: new Date(`${filterYear}-01-01`)  // Default to Jan 1 of filter year
                    }
                  }
                },
                filterYear
              ]
            },
            // Only include data up to current month for current year
            {
              $lte: [
                {
                  $dateFromString: {
                    dateString: { $substr: ["$cibilDetailData.cibilFetchDate", 0, 10] },
                    format: "%Y-%m-%d",
                    onError: new Date(`${filterYear}-01-01`)
                  }
                },
                endOfCurrentMonth
              ]
            }
          ]
        };
      } else {
        // For past years, get all months
        matchConditions.$expr = {
          $and: [
            // Check if cibilFetchDate has valid format and is not empty
            { $ne: [{ $ifNull: ["$cibilDetailData.cibilFetchDate", ""] }, ""] },
            {
              $regexMatch: {
                input: { $ifNull: ["$cibilDetailData.cibilFetchDate", ""] },
                regex: /^\d{4}-\d{2}-\d{2}/
              }
            },
            // Year comparison
            {
              $eq: [
                {
                  $year: {
                    $dateFromString: {
                      dateString: { $substr: ["$cibilDetailData.cibilFetchDate", 0, 10] },
                      format: "%Y-%m-%d",
                      onError: new Date(`${filterYear}-01-01`)  // Default to Jan 1 of filter year
                    }
                  }
                },
                filterYear
              ]
            }
          ]
        };
      }
    }

    if (searchQuery) {
      matchConditions.$or = [
        { "applicantDetails.mobileNo": { $regex: searchQuery, $options: "i" } },
        { "applicantDetails.customerFatherName": { $regex: searchQuery, $options: "i" } },
        { "applicantDetails.customerFullName": { $regex: searchQuery, $options: "i" } },
        { "customerDetailData.customerFinId": { $regex: searchQuery, $options: "i" } }
      ];
    }

    if (branch && branch !== "all") {
      const branchArray = Array.isArray(branch) ? branch : branch.split(",");
      matchConditions["branchDetails._id"] = { $in: branchArray.map(id => new ObjectId(id)) };
    }

    if (regionalbranch && regionalbranch !== "all") {
      const regionalbranchArray = Array.isArray(regionalbranch) ? regionalbranch : regionalbranch.split(",");
      matchConditions["regionalBranchDetails._id"] = { $in: regionalbranchArray.map(id => new ObjectId(id)) };
    }

    if (employee && employee !== "all") {
      const employeeArray = Array.isArray(employee) ? employee : employee.split(",");
      matchConditions["cibilDetailData.cibilId"] = { $in: employeeArray.map(id => new ObjectId(id)) };
    }

    if (product && product !== "all") {
      const productArray = Array.isArray(product) ? product : product.split(",");
      matchConditions["customerDetailData.productId"] = { $in: productArray.map(id => new ObjectId(id)) };
    }

    if (status && status !== "all") {
      const statusArray = Array.isArray(status) ? status : status.split(",");
      let orConditions = [];

      if (statusArray.includes("pending")) {
        orConditions.push({
          $and: [
            { statusByCibil: { $in: ["query", "notAssign"] } },
            { customerFormComplete: true },
            { applicantFormStart: true },
            { applicantFormComplete: true },
            { coApplicantFormStart: true },
            { coApplicantFormComplete: true },
            { guarantorFormStart: true },
            { guarantorFormComplete: true },
            { cibilId: null }
          ]
        });
      }

      if (statusArray.includes("query")) {
        orConditions.push({
          $and: [
            { statusByCibil: "query" },
            { cibilId: { $ne: null } },
            {
              $or: [
                { guarantorFormStart: false },
                { coApplicantFormStart: false },
                { applicantFormStart: false }
              ]
            }
          ]
        });
      }

      const otherStatuses = statusArray.filter(s => !["pending", "query"].includes(s));
      if (otherStatuses.length > 0) {
        orConditions.push({ statusByCibil: { $in: otherStatuses } });
      }

      if (orConditions.length > 0) {
        matchConditions["$or"] = orConditions;
      }
    }

    const aggregationPipeline = [
      {
        $lookup: {
          from: "customerdetails",
          localField: "customerId",
          foreignField: "_id",
          as: "customerDetailData"
        }
      },
      { $unwind: { path: "$customerDetailData", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "employees",
          localField: "customerDetailData.employeId",
          foreignField: "_id",
          as: "salesPerson"
        }
      },
      { $unwind: { path: "$salesPerson", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "newbranches",
          localField: "customerDetailData.branch",
          foreignField: "_id",
          as: "branchDetails"
        }
      },
      { $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "newbranches",
          localField: "branchDetails.regionalBranchId",
          foreignField: "_id",
          as: "regionalBranchDetails"
        }
      },
      { $unwind: { path: "$regionalBranchDetails", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "employees",
          localField: "salesPerson.reportingManagerId",
          foreignField: "_id",
          as: "firstReportingManager"
        }
      },
      { $unwind: { path: "$firstReportingManager", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "employees",
          localField: "firstReportingManager.reportingManagerId",
          foreignField: "_id",
          as: "secondReportingManager"
        }
      },
      { $unwind: { path: "$secondReportingManager", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "employees",
          localField: "secondReportingManager.reportingManagerId",
          foreignField: "_id",
          as: "thirdReportingManager"
        }
      },
      { $unwind: { path: "$thirdReportingManager", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "employees",
          localField: "thirdReportingManager.reportingManagerId",
          foreignField: "_id",
          as: "forthReportingManager"
        }
      },
      { $unwind: { path: "$forthReportingManager", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "applicantdetails",
          localField: "customerId",
          foreignField: "customerId",
          as: "applicantDetails"
        }
      },
      { $unwind: { path: "$applicantDetails", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "employees",
          localField: "creditPdId",
          foreignField: "_id",
          as: "pdEmployeeDetail"
        }
      },
      { $unwind: { path: "$pdEmployeeDetail", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "cibildetails",
          localField: "customerId",
          foreignField: "customerId",
          as: "cibilDetailData"
        }
      },
      { $unwind: { path: "$cibilDetailData", preserveNullAndEmptyArrays: true } },

      {
        $addFields: {
          loginDate: { $ifNull: ["$customerDetailData.createdAt", ""] },
          customerId: { $ifNull: ["$customerId", ""] },
          customerFinId: { $ifNull: ["$customerDetailData.customerFinId", ""] },
          branchName: { $ifNull: ["$branchDetails.name", ""] },
          branch_id: { $ifNull: ["$branchDetails._id", ""] },
          regionalBranchName: { $ifNull: ["$regionalBranchDetails.name", ""] },
          customerFullName: { $ifNull: ["$applicantDetails.fullName", ""] },
          customerFatherName: { $ifNull: ["$applicantDetails.fatherName", ""] },
          mobileNo: { $ifNull: ["$applicantDetails.mobileNo", ""] },
          salesPersonUniqueId: { $ifNull: ["$salesPerson.employeUniqueId", ""] },
          salesPersonName: { $ifNull: ["$salesPerson.employeName", ""] },
          salesPersonManagerName1: { $ifNull: ["$firstReportingManager.employeName", ""] },
          salesPersonManagerName2: { $ifNull: ["$secondReportingManager.employeName", ""] },
          salesPersonManagerName3: { $ifNull: ["$thirdReportingManager.employeName", ""] },
          salesPersonManagerName4: { $ifNull: ["$forthReportingManager.employeName", ""] },
          paymentId: { $ifNull: ["$customerDetailData.orderId", ""] },
          paymentStatus: { $ifNull: ["$customerDetailData.paymentStatus", ""] },
          amount: { $ifNull: ["$customerDetailData.loginFees", ""] },

          // Safely extract and validate the cibilFetchDate
          validCibilFetchDate: {
            $cond: {
              if: {
                $and: [
                  { $ne: [{ $ifNull: ["$cibilDetailData.cibilFetchDate", ""] }, ""] },
                  {
                    $regexMatch: {
                      input: { $ifNull: ["$cibilDetailData.cibilFetchDate", ""] },
                      regex: /^\d{4}-\d{2}-\d{2}/
                    }
                  }
                ]
              },
              then: { $substr: ["$cibilDetailData.cibilFetchDate", 0, 10] },
              else: `${filterYear}-01-01` // Default date if invalid
            }
          },

          // Extract month and year for grouping from the validated date
          cibilFetchMonth: {
            $month: {
              $dateFromString: {
                dateString: {
                  $cond: {
                    if: {
                      $and: [
                        { $ne: [{ $ifNull: ["$cibilDetailData.cibilFetchDate", ""] }, ""] },
                        {
                          $regexMatch: {
                            input: { $ifNull: ["$cibilDetailData.cibilFetchDate", ""] },
                            regex: /^\d{4}-\d{2}-\d{2}/
                          }
                        }
                      ]
                    },
                    then: { $substr: ["$cibilDetailData.cibilFetchDate", 0, 10] },
                    else: `${filterYear}-01-01` // Default date if invalid
                  }
                },
                format: "%Y-%m-%d"
              }
            }
          },
          cibilFetchYear: {
            $year: {
              $dateFromString: {
                dateString: {
                  $cond: {
                    if: {
                      $and: [
                        { $ne: [{ $ifNull: ["$cibilDetailData.cibilFetchDate", ""] }, ""] },
                        {
                          $regexMatch: {
                            input: { $ifNull: ["$cibilDetailData.cibilFetchDate", ""] },
                            regex: /^\d{4}-\d{2}-\d{2}/
                          }
                        }
                      ]
                    },
                    then: { $substr: ["$cibilDetailData.cibilFetchDate", 0, 10] },
                    else: `${filterYear}-01-01` // Default date if invalid
                  }
                },
                format: "%Y-%m-%d"
              }
            }
          },
          cibilStatus: {
            $switch: {
              branches: [
                {
                  case: { $in: ["$statusByCibil", ["approved"]] },
                  then: "approved"
                },
                {
                  case: { $in: ["$statusByCibil", ["notAssign"]] },
                  then: "notAssign"
                },
                {
                  case: { $in: ["$statusByCibil", ["query"]] },
                  then: "query"
                },
                {
                  case: { $in: ["$statusByCibil", ["rejected"]] },
                  then: "rejected"
                }
              ],
              default: ""
            }
          }
        }
      },

      { $match: matchConditions },

      // Group by month and status for count
      {
        $group: {
          _id: {
            month: "$cibilFetchMonth",
            year: "$cibilFetchYear",
            status: "$cibilStatus"
          },
          count: { $sum: 1 }
        }
      },

      // Group again to create the monthly structure
      {
        $group: {
          _id: {
            month: "$_id.month",
            year: "$_id.year"
          },
          totalCount: { $sum: "$count" },
          statusCounts: {
            $push: {
              status: "$_id.status",
              count: "$count"
            }
          }
        }
      },

      // Sort by year and month
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ];

    // console.log("Running query with match conditions:", JSON.stringify(matchConditions, null, 2));
    const result = await processModel.aggregate(aggregationPipeline);
    console.log(`Aggregation returned ${result.length} monthly records`);

    // Define month names for formatting
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const monthAbbr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Format the monthly data to match the desired response structure
    const formattedMonthlyData = [];

    // Calculate the maximum number of months to show
    let maxMonths = 12;
    if (isCurrentYear) {
      maxMonths = currentMonth; // Only show months up to current month
    }

    // If filtering for a specific year, ensure all months are represented
    if (hasDateRangeFilter) {
      const startYear = new Date(startDateFilter.split('T')[0]).getFullYear();
      const endYear = new Date(endDateFilter.split('T')[0]).getFullYear();

      // If date range is within a single year, show all months for that year
      if (startYear === endYear) {
        const year = startYear;
        console.log(`Date range is within a single year (${year}), showing all months`);

        // Determine how many months to show based on whether it's the current year
        const monthsToShow = (year === currentYear) ? currentMonth : 12;

        // Create array with all months for the year
        for (let monthIndex = 0; monthIndex < monthsToShow; monthIndex++) {
          const monthNum = monthIndex + 1;
          const resultForMonth = result.find(item =>
            item._id.year === year && item._id.month === monthNum
          );

          if (resultForMonth) {
            // Month has data, use actual counts
            const approvedCount = resultForMonth.statusCounts.find(s => s.status === "approved")?.count || 0;
            const rejectedCount = resultForMonth.statusCounts.find(s => s.status === "rejected")?.count || 0;
            const notAssignCount = resultForMonth.statusCounts.find(s => s.status === "notAssign")?.count || 0;
            const queryCount = resultForMonth.statusCounts.find(s => s.status === "query")?.count || 0;

            formattedMonthlyData.push({
              month: monthAbbr[monthIndex],
              monthYear: `${monthAbbr[monthIndex]} ${year}`,
              total: resultForMonth.totalCount,
              approved: approvedCount,
              pending: notAssignCount + queryCount,
              reject: rejectedCount,
              rejectBySales: 0,
              leadConvert: 0
            });
          } else {
            // Month has no data, add with zeros
            formattedMonthlyData.push({
              month: monthAbbr[monthIndex],
              monthYear: `${monthAbbr[monthIndex]} ${year}`,
              total: 0,
              approved: 0,
              pending: 0,
              reject: 0,
              rejectBySales: 0,
              leadConvert: 0
            });
          }
        }
      } else {
        // Date range spans multiple years, only include months with data
        formattedMonthlyData.push(...result.map(item => {
          const monthIndex = item._id.month - 1;
          const monthName = monthAbbr[monthIndex];
          const year = item._id.year;

          const approvedCount = item.statusCounts.find(s => s.status === "approved")?.count || 0;
          const rejectedCount = item.statusCounts.find(s => s.status === "rejected")?.count || 0;
          const notAssignCount = item.statusCounts.find(s => s.status === "notAssign")?.count || 0;
          const queryCount = item.statusCounts.find(s => s.status === "query")?.count || 0;

          return {
            month: monthName,
            monthYear: `${monthName} ${year}`,
            total: item.totalCount,
            approved: approvedCount,
            pending: notAssignCount + queryCount,
            reject: rejectedCount,
            rejectBySales: 0,
            leadConvert: 0
          };
        }));
      }
    } else {
      // Year filter - show appropriate months based on whether it's current year
      for (let monthIndex = 0; monthIndex < maxMonths; monthIndex++) {
        const monthNum = monthIndex + 1;
        const resultForMonth = result.find(item =>
          item._id.year === filterYear && item._id.month === monthNum
        );

        if (resultForMonth) {
          // Month has data, use actual counts
          const approvedCount = resultForMonth.statusCounts.find(s => s.status === "approved")?.count || 0;
          const rejectedCount = resultForMonth.statusCounts.find(s => s.status === "rejected")?.count || 0;
          const notAssignCount = resultForMonth.statusCounts.find(s => s.status === "notAssign")?.count || 0;
          const queryCount = resultForMonth.statusCounts.find(s => s.status === "query")?.count || 0;

          formattedMonthlyData.push({
            month: monthAbbr[monthIndex],
            monthYear: `${monthAbbr[monthIndex]} ${filterYear}`,
            total: resultForMonth.totalCount,
            approved: approvedCount,
            pending: notAssignCount + queryCount,
            reject: rejectedCount,
            rejectBySales: 0,
            leadConvert: 0
          });
        } else {
          // Month has no data, add with zeros
          formattedMonthlyData.push({
            month: monthAbbr[monthIndex],
            monthYear: `${monthAbbr[monthIndex]} ${filterYear}`,
            total: 0,
            approved: 0,
            pending: 0,
            reject: 0,
            rejectBySales: 0,
            leadConvert: 0
          });
        }
      }
    }

    // Calculate totals
    const totalCount = formattedMonthlyData.reduce((sum, item) => sum + item.total, 0);
    const totalApproved = formattedMonthlyData.reduce((sum, item) => sum + item.approved, 0);
    const totalPending = formattedMonthlyData.reduce((sum, item) => sum + item.pending, 0);
    const totalReject = formattedMonthlyData.reduce((sum, item) => sum + item.reject, 0);

    // Create the final response format
    const response = {
      total: totalCount,
      approved: totalApproved,
      pending: totalPending,
      reject: totalReject,
      leadConvert: 0,
      rejectBySales: 0,
      monthlyLeadCounts: formattedMonthlyData
    };

    // Determine appropriate message based on filter type
    let message = "Cibil Dashboard";
    if (hasDateRangeFilter) {
      const startFormatted = new Date(startDateFilter.split('T')[0]).toLocaleDateString('en-US', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
      const endFormatted = new Date(endDateFilter.split('T')[0]).toLocaleDateString('en-US', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
      message = `Cibil Dashboard (${startFormatted} to ${endFormatted})`;
    } else if (year) {
      if (isCurrentYear) {
        message = `Cibil Dashboard (${filterYear}) - YTD`;
      } else {
        message = `Cibil Dashboard (${filterYear})`;
      }
    } else {
      message = "Cibil Dashboard";
    }

    return success(res, message, response);

  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


async function cibilDashBoardProductTable(req, res) {
  try {
    const { startDateFilter, endDateFilter } = req.query;
    const employeeId = req.Id;

    const employeeExist = await employeeModel.findOne({ _id: employeeId, status: "active" });
    if (!employeeExist) {
      return badRequest(res, "Employee Not Found");
    }

    // let matchConditions = { fileStatus: "active" };
    let matchConditions = {
      fileStatus: "active",
      customerFormComplete: true,
      $or: [
        {
          statusByCibil: { $in: ["query", "notAssign"] },
          applicantFormStart: true,
          applicantFormComplete: true,
          coApplicantFormStart: true,
          coApplicantFormComplete: true,
          guarantorFormStart: true,
          guarantorFormComplete: true,
        },
        {
          statusByCibil: { $in: ["query"] },
          $or: [
            { applicantFormStart: false },
            { applicantFormComplete: false },
            { coApplicantFormStart: false },
            { coApplicantFormComplete: false },
            { guarantorFormStart: false },
            { guarantorFormComplete: false },
          ],
        },
        { statusByCibil: "approved" },
        { statusByCibil: "rejected" },
      ],
    };

    const today = new Date();
    const defaultStartDate = new Date(today.setHours(0, 0, 0, 0));
    const defaultEndDate = new Date(today.setHours(23, 59, 59, 999));

    function formatDateToISO(date) {
      return new Date(date).toISOString();
    }

    let formattedStart = startDateFilter && startDateFilter !== "all"
      ? new Date(new Date(startDateFilter).setHours(0, 0, 0, 0))
      : defaultStartDate;

    let formattedEnd = endDateFilter && endDateFilter !== "all"
      ? new Date(new Date(endDateFilter).setHours(23, 59, 59, 999))
      : defaultEndDate;

    if (startDateFilter && endDateFilter && startDateFilter === endDateFilter) {
      formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
      formattedEnd = new Date(new Date(startDateFilter).setHours(23, 59, 59, 999));
    }

    formattedStart = formatDateToISO(formattedStart);
    formattedEnd = formatDateToISO(formattedEnd);

    if (startDateFilter && endDateFilter && startDateFilter !== "all" && endDateFilter !== "all") {
      matchConditions["$or"] = [
        {
          "cibilDetailData.updatedAt": {
            $gte: formattedStart,
            $lt: formattedEnd,
          },
        },
      ];
    }


    console.log("Final matchConditions-----", JSON.stringify(matchConditions, null, 2));

    const resultProduct = await processModel.aggregate([
      { $match: matchConditions },

      {
        $lookup: {
          from: "cibildetails",
          localField: "customerId",
          foreignField: "customerId",
          as: "cibilDetailData"
        }
      },
      { $unwind: { path: "$cibilDetailData", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "customerdetails",
          localField: "customerId",
          foreignField: "_id",
          as: "customerdetailData",
        },
      },
      { $unwind: "$customerdetailData" },
      { $match: { "customerdetailData.paymentStatus": "success" } },

      {
        $lookup: {
          from: "products",
          localField: "customerdetailData.productId",
          foreignField: "_id",
          as: "productDetail",
        },
      },
      { $unwind: "$productDetail" },

      {
        $group: {
          _id: "$productDetail._id",
          productName: { $first: "$productDetail.productName" },
          productId: { $first: "$productDetail._id" },
          totalFiles: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$statusByCibil", "query"] },
                    { $eq: ["$statusByCibil", "rejected"] },
                    { $eq: ["$statusByCibil", "approved"] },
                    {
                      $and: [
                        { $eq: ["$statusByCibil", "query"] },
                        {
                          $or: [
                            { $eq: ["$coApplicantFormStart", false] },
                            { $eq: ["$applicantFormStart", false] },
                            { $eq: ["$guarantorFormStart", false] },
                          ],
                        },
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
          pendingFiles: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$statusByCibil", "query"] },
                    {
                      $or: [
                        { $eq: ["$coApplicantFormStart", false] },
                        { $eq: ["$applicantFormStart", false] },
                        { $eq: ["$guarantorFormStart", false] },
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
          queryFiles: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $in: ["$statusByCibil", ["query", "notAssign"]] },
                    { $eq: ["$applicantFormStart", true] },
                    { $eq: ["$applicantFormComplete", true] },
                    { $eq: ["$coApplicantFormStart", true] },
                    { $eq: ["$coApplicantFormComplete", true] },
                    { $eq: ["$guarantorFormStart", true] },
                    { $eq: ["$guarantorFormComplete", true] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          rejectFiles: {
            $sum: {
              $cond: [{ $eq: ["$statusByCibil", "rejected"] }, 1, 0],
            },
          },
          completeFiles: {
            $sum: {
              $cond: [{ $eq: ["$statusByCibil", "approved"] }, 1, 0],
            },
          },
        },
      },

      {
        $project: {
          _id: 0,
          productName: 1,
          productId: 1,
          totalFiles: 1,
          pendingFiles: 1,
          queryFiles: 1,
          rejectFiles: 1,
          completeFiles: 1,
        },
      },
    ]);

    const response = {
      TotalCases: resultProduct.length || 0,
      productDetail: resultProduct,
    };

    return success(res, "Cibil Files Product Table Dashboard", response);

  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

async function cibilDashBoardBranchTable(req, res) {
  try {
    const { startDateFilter, endDateFilter } = req.query;
    const employeeId = req.Id;

    const employeeExist = await employeeModel.findOne({ _id: employeeId, status: "active" });
    if (!employeeExist) {
      return badRequest(res, "Employee Not Found");
    }

    // let matchConditions = { fileStatus: "active" };

    let matchConditions = {
      fileStatus: "active",
      customerFormComplete: true,
      $or: [
        {
          statusByCibil: { $in: ["query", "notAssign"] },
          applicantFormStart: true,
          applicantFormComplete: true,
          coApplicantFormStart: true,
          coApplicantFormComplete: true,
          guarantorFormStart: true,
          guarantorFormComplete: true,
        },
        {
          statusByCibil: { $in: ["query"] },
          $or: [
            { applicantFormStart: false },
            { applicantFormComplete: false },
            { coApplicantFormStart: false },
            { coApplicantFormComplete: false },
            { guarantorFormStart: false },
            { guarantorFormComplete: false },
          ],
        },
        { statusByCibil: "approved" },
        { statusByCibil: "rejected" },
      ],
    };


    const today = new Date();
    const defaultStartDate = new Date(today.setHours(0, 0, 0, 0));
    const defaultEndDate = new Date(today.setHours(23, 59, 59, 999));

    function formatDateToISO(date) {
      return new Date(date).toISOString();
    }

    let formattedStart = startDateFilter && startDateFilter !== "all"
      ? new Date(new Date(startDateFilter).setHours(0, 0, 0, 0))
      : defaultStartDate;

    let formattedEnd = endDateFilter && endDateFilter !== "all"
      ? new Date(new Date(endDateFilter).setHours(23, 59, 59, 999))
      : defaultEndDate;

    if (startDateFilter && endDateFilter && startDateFilter === endDateFilter) {
      formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
      formattedEnd = new Date(new Date(startDateFilter).setHours(23, 59, 59, 999));
    }

    formattedStart = formatDateToISO(formattedStart);
    formattedEnd = formatDateToISO(formattedEnd);

    if (startDateFilter && endDateFilter && startDateFilter !== "all" && endDateFilter !== "all") {
      matchConditions["$or"] = [
        {
          "cibilDetailData.cibilFetchDate": {
            $gte: formattedStart,
            $lt: formattedEnd,
          },
        },
      ];
    }




    const resultBranch = await processModel.aggregate([
      // Lookup employees to get employee details
      { $match: matchConditions },

      {
        $lookup: {
          from: "cibildetails",
          localField: "customerId",
          foreignField: "customerId",
          as: "cibilDetailData"
        }
      },
      { $unwind: { path: "$cibilDetailData", preserveNullAndEmptyArrays: true } },


      {
        $addFields: {
          cibilFetchDate: {
            $cond: {
              if: { $or: [{ $eq: ["$cibilDetailData.cibilFetchDate", ""] }, { $eq: ["$cibilDetailData.cibilFetchDate", null] }] },
              then: "$cibilDetailData.cibilFetchDate",
              else: "",
            },
          },
        },
      },
      {
        $lookup: {
          from: "customerdetails",  // Your employees collection name
          localField: "customerId",
          foreignField: "_id",
          as: "customerdetailData",
        },
      },
      {
        $unwind: "$customerdetailData", // Unwind to access employee details
      },
      { $match: { "customerdetailData.paymentStatus": "success" } },
      {
        $lookup: {
          from: "employees",  // Your employees collection name
          localField: "customerdetailData.employeId",
          foreignField: "_id",
          as: "employeeDetails",
        },
      },
      {
        $unwind: "$employeeDetails", // Unwind to access employee details
      },

      {
        $lookup: {
          from: "newbranches",  // Your employees collection name
          localField: "customerdetailData.branch",
          foreignField: "_id",
          as: "newbrancheDetails",
        },
      },
      {
        $unwind: "$newbrancheDetails", // Unwind to access employee details
      },
      {
        $unwind: "$statusByCibil", // Unwind statusByCreditPd to process each status separately
      },
      {
        $group: {
          _id: "$newbrancheDetails._id",
          branchName: { $first: "$newbrancheDetails.name" },
          branchId: { $first: "$newbrancheDetails._id" },
          totalAssignFiles: { $sum: { $cond: [{ $ne: ["$cibilId", null] }, 1, 0] } },


          totalFiles: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$statusByCibil", "query"] },
                    { $eq: ["$statusByCibil", "rejected"] },
                    { $eq: ["$statusByCibil", "approved"] },
                    {
                      $and: [
                        { $eq: ["$statusByCibil", "query"] },
                        {
                          $or: [
                            { $eq: ["$coApplicantFormStart", false] },
                            { $eq: ["$applicantFormStart", false] },
                            { $eq: ["$guarantorFormStart", false] },
                          ],
                        },
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
          pendingFiles: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$statusByCibil", "query"] },
                    {
                      $or: [
                        { $eq: ["$coApplicantFormStart", false] },
                        { $eq: ["$applicantFormStart", false] },
                        { $eq: ["$guarantorFormStart", false] },
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
          queryFiles: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $in: ["$statusByCibil", ["query", "notAssign"]] },
                    { $eq: ["$applicantFormStart", true] },
                    { $eq: ["$applicantFormComplete", true] },
                    { $eq: ["$coApplicantFormStart", true] },
                    { $eq: ["$coApplicantFormComplete", true] },
                    { $eq: ["$guarantorFormStart", true] },
                    { $eq: ["$guarantorFormComplete", true] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          rejectFiles: {
            $sum: {
              $cond: [{ $eq: ["$statusByCibil", "rejected"] }, 1, 0],
            },
          },
          completeFiles: {
            $sum: {
              $cond: [{ $eq: ["$statusByCibil", "approved"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          branchName: 1,
          branchId: 1,
          totalFiles: 1,
          pendingFiles: 1,
          completeFiles: 1,
          rejectFiles: 1,
          queryFiles: 1
        },
      },
    ]);


    const response = {
      TotalCases: resultBranch.length || 0,
      branchDetail: resultBranch,
    };

    return success(res, "Cibil Files Branch Table Dashboard", response);

  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


async function updateCibilRecords(req, res) {
  try {
    // Fetch all documents
    const targetDate = new Date("2025-01-10T13:19:47.177Z");
    const documents = await cibilDetailModel.find({ createdAt: { $lt: targetDate } });
    if (!documents.length) {
      return res.status(404).json({ message: 'No documents found' });
    }

    const updatedDocs = [];

    for (const doc of documents) {
      const cibilId = doc.cibilId && doc.cibilId.length ? doc.cibilId[0] : null;

      if (!cibilId) {
        updatedDocs.push({
          customerId: doc.customerId,
          status: 'skipped (no cibilId found)',
        });
        continue;
      }

      const coApplicantData = doc.coApplicantData || [];

      for (let i = 0; i < coApplicantData.length; i++) {
        const coApplicant = coApplicantData[i];

        // Check if coApplicantCibilReport exists and has a value for index `i`
        const coApplicantCibilReport = coApplicant.coApplicantCibilReport || [];
        if (!coApplicantCibilReport[i]) continue;

        const fetchHistoryEntry = {
          cibilEmployeeId: cibilId,
          fetchDate: doc.cibilFetchDate || new Date().toISOString(),
          cibilReport: coApplicantCibilReport[i],
        };

        // Update the `coApplicantFetchHistory` array at index `i`
        const updateQuery = {
          [`coApplicantData.${i}.coApplicantFetchHistory`]: {
            $each: [fetchHistoryEntry],
          },
        };

        const updatedDoc = await cibilDetailModel.findByIdAndUpdate({ _id: new ObjectId(doc._id) },
          {
            $push: updateQuery, // Push the new entry into the history array
          },
          { new: true }
        );


      }

      updatedDocs.push({
        customerId: doc.customerId,
        status: 'updated',
      });
    }

    return res.status(200).json({
      success: true,
      message: `${updatedDocs.length} documents updated successfully`,
      updatedDocuments: updatedDocs,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Update failed',
      error: error.message,
    });
  }
}



async function getCibilDetailsLoanDetailsData(req, res) {
  try {
    const { customerId } = req.query;

    const customerDetail = await applicantModel.findOne({ customerId: customerId })
    if (!customerId) {
      return badRequest(res, "Customer Id Required");
    }

    // console.log('-----////---------')

    if (!customerDetail) {
      return notFound(res, "Customer Not Found")
    }

    const cibilDetail = await cibilDetailModel.findOne({ customerId: customerId })
      .select("applicantCibilDetail coApplicantData")
      .lean();

    if (!cibilDetail) {
      return notFound(res, "CIBIL Not Found");
    }


    const ownershipMap = {
      '1': 'INDIVIDUAL',
      '2': 'AUTHORISED USER',
      '3': 'GUARANTOR',
      '4': 'JOINT',
      '5': 'DECEASED'
    };

    const accountTypeMap = {
      '01': 'Auto Loan (Personal)',
      '02': 'HOUSING LOAN',
      '03': 'PROPERTY LOAN',
      '04': 'LOAN AGAINST SHARES/SECURITIES',
      '05': 'PERSONAL LOAN',
      '06': 'CONSUMER LOAN',
      '07': 'GOLD LOAN',
      '08': 'EDUCATION LOAN',
      '09': 'LOAN TO PROFESSIONAL',
      '10': 'CREDIT CARD',
      '11': 'LEASING',
      '12': 'OVERDRAFT',
      '13': 'TWO-WHEELER LOAN',
      '14': 'NON-FUNDED CREDIT FACILITY',
      '15': 'LOAN AGAINST BANK DEPOSITS',
      '16': 'FLEET CARD',
      '17': 'COMMERCIAL VEHICLE LOAN',
      '18': 'TELCO – WIRELESS',
      '19': 'TELCO – BROADBAND',
      '20': 'TELCO – LANDLINE',
      '21': 'SELLER FINANCING',
      '22': 'SELLER FINANCING SOFT',
      '23': 'GECL LOAN SECURED',
      '24': 'GECL LOAN UNSECURED',
      '31': 'SECURED CREDIT CARD',
      '32': 'USED CAR LOAN',
      '33': 'CONSTRUCTION EQUIPMENT LOAN',
      '34': 'TRACTOR LOAN',
      '35': 'CORPORATE CREDIT CARD',
      '36': 'KISAN CREDIT CARD',
      '37': 'LOAN ON CREDIT CARD',
      '38': 'PRIME MINISTER JAAN DHAN YOJANA - OVERDRAFT',
      '39': 'MUDRA LOANS – SHISHU / KISHOR / TARUN',
      '40': 'MICROFINANCE – BUSINESS LOAN',
      '41': 'MICROFINANCE – PERSONAL LOAN',
      '42': 'MICROFINANCE – HOUSING LOAN',
      '43': 'MICROFINANCE – OTHER',
      '44': 'PRADHAN MANTRI AWAS YOJANA - CREDIT LINK SUBSIDY SCHEME MAY CLSS',
      '50': 'BUSINESS LOAN – SECURED',
      '51': 'BUSINESS LOAN – GENERAL',
      '52': 'BUSINESS LOAN – PRIORITY SECTOR – SMALL BUSINESS',
      '53': 'BUSINESS LOAN – PRIORITY SECTOR – AGRICULTURE',
      '54': 'BUSINESS LOAN – PRIORITY SECTOR – OTHERS',
      '55': 'BUSINESS NON-FUNDED CREDIT FACILITY – GENERAL',
      '56': 'BUSINESS NON-FUNDED CREDIT FACILITY – PRIORITY SECTOR – SMALL BUSINESS',
      '57': 'BUSINESS NON-FUNDED CREDIT FACILITY – PRIORITY SECTOR – AGRICULTURE',
      '58': 'BUSINESS NON-FUNDED CREDIT FACILITY – PRIORITY SECTOR-OTHERS',
      '59': 'BUSINESS LOAN AGAINST BANK DEPOSITS',
      '61': 'BUSINESS LOAN - UNSECURED',
      '80': 'MICROFINANCE DETAILED REPORT (APPLICABLE TO ENQUIRY PURPOSE ONLY)',
      '81': 'SUMMARY REPORT (APPLICABLE TO ENQUIRY PURPOSE ONLY)',
      '88': 'LOCATE PLUS FOR INSURANCE (APPLICABLE TO ENQUIRY PURPOSE ONLY)',
      '90': 'ACCOUNT REVIEW (APPLICABLE TO ENQUIRY PURPOSE ONLY)',
      '91': 'RETRO ENQUIRY (APPLICABLE TO ENQUIRY PURPOSE ONLY)',
      '92': 'LOCATE PLUS (APPLICABLE TO ENQUIRY PURPOSE ONLY)',
      '97': 'ADVISER LIABILITY (APPLICABLE TO ENQUIRY PURPOSE ONLY)',
      '00': 'OTHER',
      '98': 'SECURED (ACCOUNT GROUP FOR PORTFOLIO REVIEW RESPONSE)',
      '99': 'UNSECURED (ACCOUNT GROUP FOR PORTFOLIO REVIEW RESPONSE)',
      '45': 'P2P PERSONAL LOAN',
      '46': 'P2P AUTO LOAN',
      '47': 'P2P EDUCATION LOAN',
      '66': 'EXPRESS MATCH - NEW LOAN APPLICATION',
      '69': 'SHORT TERM PERSONAL LOAN',
      '70': 'PRIORITY SECTOR - GOLD LOAN',
      '71': 'TEMPORARY OVERDRAFT',
      '67': 'Buy Now Pay Later'
    };


    function mapCreditData(data) {
      return data?.filter(item => item.actionStatus !== "inactive").map(item => ({
        index: item.index || "",
        loanType: accountTypeMap[item.accountType] || '',
        ownership: ownershipMap[item.ownershipIndicator] || '',
        loanAmount: item.highCreditAmount || 0,
        currentOutstanding: item.currentBalance || 0,
        monthlyEMI: item.emiAmount || 0,
        loanStatus: item.loanStatus || "",
        obligated: item.obligated || "",
        actionStatus: item.actionStatus || "active",
        obligationConsidered: ["yes", "YES", "Yes"].includes(item.obligated) ? item.emiAmount : 0
      })) || [];
    }

    const applicantActiveLoanDetail = cibilDetail.applicantCibilDetail?.[0]?.creditData?.[0]?.accounts || [];

    let activeLoanCount = 0;
    let totalActiveEMI = 0;
    let totalObligations = 0
    let totalLoanCount = 0;
    let totalEMI = 0;
    let applicantTotalEMi = 0
    let coApplicantTotalEMI = 0

    // Mapping applicant's loans
    const mappedLoans = mapCreditData(applicantActiveLoanDetail);
    // console.log(mappedLoans,"mappedLoansmappedLoans")
    // Count the active loans and calculate total EMI

    mappedLoans.forEach(loan => {
      totalLoanCount++;

      // Only count EMI if obligated is "Yes"
      const emi = (loan.obligated === "Yes") ? Number(loan.monthlyEMI) || 0 : 0;

      totalEMI += emi;

      if (loan.actionStatus === 'active') {
        if (loan.obligated === "Yes") {
          activeLoanCount++;
          applicantTotalEMi += emi;
          totalActiveEMI += emi;
          totalObligations += emi;
        }
      }
    });



    // Process coApplicant's loans
    const coApplicantDetailsByID = [];

    cibilDetail.coApplicantData?.forEach(coApplicant => {
      const accounts = coApplicant.coApplicantCibilDetail.flatMap(detail => {
        if (detail?.creditData && Array.isArray(detail?.creditData) && detail?.creditData.length > 0) {
          return mapCreditData(detail.creditData[0]?.accounts || []);
        }
        return [];
      });

      if (accounts.length > 0) {
        coApplicantDetailsByID.push({
          _id: coApplicant._id,
          accounts: accounts
        });

        accounts.forEach(loan => {
          totalLoanCount++;
          totalEMI += Number(loan.monthlyEMI) || 0;  // Convert to number

          if (loan.actionStatus === 'active') {
            activeLoanCount++;
            coApplicantTotalEMI += Number(loan.monthlyEMI) || 0;
            totalActiveEMI += Number(loan.monthlyEMI) || 0;
            // Convert to number
          }

          if (loan.actionStatus === 'active' && loan.obligated === "Yes") {
            totalObligations += Number(loan.monthlyEMI) || 0;
          }
        });
      }
    });



    const responseData = {
      summary: {
        totalLoans: totalLoanCount,
        totalEMI: totalEMI,
        totalActiveLoans: activeLoanCount,
        totalObligations: totalObligations,
        monthlyEmiTotal: totalActiveEMI,
        applicantTotalEMi: applicantTotalEMi,
        coApplicantTotalEMI: coApplicantTotalEMI,
      },
      applicantDetail: mappedLoans,
      coApplicantDetail: coApplicantDetailsByID,
    };

    return success(res, "Loan Type Details Fetched", { data: responseData });
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


async function getCibilDetailsLoanDetailsUpdate(req, res) {
  try {
    const { customerId, formFor, _id, loanDetails, actionStatus, loanAmount, monthlyEMI, currentOutstanding } = req.body;

    if (!customerId) {
      return badRequest(res, "Customer Id Required");
    }
    if (!loanDetails || !Array.isArray(loanDetails) || loanDetails.length === 0) {
      return badRequest(res, "Loan Details are required");
    }

    const cibilDetail = await cibilDetailModel.findOne({ customerId });
    if (!cibilDetail) {
      return notFound(res, "CIBIL Details Not Found");
    }

    let updated = false;

    // Function to update accounts array
    const updateAccounts = (accounts, path) => {
      loanDetails.forEach(({ indexId, loanStatus, obligated, actionStatus, loanAmount, monthlyEMI, currentOutstanding }) => {
        const account = accounts.find((acc) => acc.index === indexId);
        if (account) {
          account.loanStatus = loanStatus;
          account.obligated = obligated;
          account.actionStatus = actionStatus;
          account.emiAmount = monthlyEMI;
          account.currentBalance = currentOutstanding;
          account.highCreditAmount = loanAmount;
          updated = true;
        }
      });

      if (updated) {
        // Mark the accounts array as modified
        cibilDetail.markModified(path);
      }
    };

    if (formFor === "applicant") {
      const applicantAccounts = cibilDetail?.applicantCibilDetail?.[0]?.creditData?.[0]?.accounts;
      if (applicantAccounts) {
        updateAccounts(applicantAccounts, "applicantCibilDetail.0.creditData.0.accounts");
      }
    }

    if (formFor === "coApplicant") {
      cibilDetail.coApplicantData.forEach((coApplicant, index) => {
        if (coApplicant._id.toString() === _id) {
          const coApplicantAccounts = coApplicant?.coApplicantCibilDetail?.[0]?.creditData?.[0]?.accounts;
          if (coApplicantAccounts) {
            updateAccounts(coApplicantAccounts, `coApplicantData.${index}.coApplicantCibilDetail.0.creditData.0.accounts`);
          }
        }
      });
    }

    // if (formFor === "guarantor") {
    //   cibilDetail.guarantorData.forEach((guarantor, index) => {
    //     if (guarantor._id.toString() === _id) {
    //       const guarantorAccounts = guarantor?.guarantorCibilDetail?.[0]?.creditData?.[0]?.accounts;
    //       if (guarantorAccounts) {
    //         updateAccounts(guarantorAccounts, `guarantorData.${index}.guarantorCibilDetail.0.creditData.0.accounts`);
    //       }
    //     }
    //   });
    // }

    if (!updated) {
      return notFound(res, "No matching accounts found to update");
    }

    await cibilDetail.save();

    return success(res, "Loan Details Updated Successfully", { cibilDetail });
  } catch (error) {
    console.error("Error:", error);
    return unknownError(res, error);
  }
}




async function getCibilMultipleScore(req, res) {
  try {
    const { customerId } = req.query;
    // Fetch the CIBIL detail document with populated references
    const pdDetails = await pdModel.findOne({ customerId });
    const cibilDetail = await cibilDetailModel.findOne({ customerId })
      .populate({ path: "cibilId", select: "employeName" })
      .populate({ path: "applicantFetchHistory.cibilEmployeeId", select: "employeName" })
      .populate({ path: "coApplicantData.coApplicantFetchHistory.cibilEmployeeId", select: "employeName" })
      .populate({ path: "guarantorFetchHistory.cibilEmployeeId", select: "employeName" })
      .exec();
    if (!cibilDetail) {
      return badRequest(res, "CIBIL details not found");
    }
    const processData = await processModel.findOne({ customerId }).select("statusByCibil remarkByCibil");
    const finalStatus = processData?.statusByCibil || "";
    const finalRemark = processData?.remarkByCibil || "";

    // Helper function to parse and validate CIBIL scores
    const parseScore = (score) => {
      // Check if score exists and isn't empty string
      if (score === undefined || score === "") {
        return null;
      }

      // Convert to number if it's a string
      const numScore = Number(score);

      // Check if it's a valid number and not NaN
      // We specifically allow 0 as a valid score
      return !isNaN(numScore) ? numScore : null;
    };

    // **Extract applicant CIBIL scores in the correct order**
    let applicantCibilScores = [];

    // First add the current applicantCibilScore if it's a valid value
    const mainScore = parseScore(cibilDetail.applicantCibilScore);
    if (mainScore !== null) {
      applicantCibilScores.push(mainScore);
    }

    // Then add the fetch history scores (filtering out invalid values)
    const historyScores = cibilDetail.applicantFetchHistory
      .map(history => parseScore(history.cibilScore))
      .filter(score => score !== null);

    applicantCibilScores = [...applicantCibilScores, ...historyScores];
    applicantCibilScores = [...new Set(applicantCibilScores)]; // Remove duplicates

    // **Extract co-applicant CIBIL scores in the correct order**
    const coApplicantCibilScores = cibilDetail.coApplicantData.map(coApplicant => {
      let scores = [];

      // First add the current coApplicantCibilScore if it's a valid value
      const mainScore = parseScore(coApplicant.coApplicantCibilScore);
      if (mainScore !== null) {
        scores.push(mainScore);
      }

      // Then add the fetch history scores (filtering out invalid values)
      const historyScores = coApplicant?.coApplicantFetchHistory
        .map(history => parseScore(history.cibilScore))
        .filter(score => score !== null);

      scores = [...scores, ...historyScores];
      return [...new Set(scores)]; // Remove duplicates
    }).filter(scoreArray => scoreArray.length > 0); // Only include co-applicants with valid scores

    // **Extract guarantor CIBIL scores in the correct order**
    let guarantorCibilScores = [];

    // First add the current guarantorCibilScore if it's a valid value
    const guarantorMainScore = parseScore(cibilDetail.guarantorCibilScore);
    if (guarantorMainScore !== null) {
      guarantorCibilScores.push(guarantorMainScore);
    }

    // Then add the fetch history scores (filtering out invalid values)
    const guarantorHistoryScores = cibilDetail.guarantorFetchHistory
      .map(history => parseScore(history.cibilScore))
      .filter(score => score !== null);

    guarantorCibilScores = [...guarantorCibilScores, ...guarantorHistoryScores];
    guarantorCibilScores = [...new Set(guarantorCibilScores)]; // Remove duplicates

    const responseData = {
      customerId: cibilDetail.customerId,
      applicantCibilScore: applicantCibilScores,
      coApplicantCibilScore: coApplicantCibilScores,
      guarantorCibilScore: guarantorCibilScores,
    };
    return success(res, "CIBIL Detail Retrieved Successfully", responseData);
  } catch (error) {
    console.error("Error fetching CIBIL details:", error);
    return unknownError(res, error);
  }
}


// -------------------update data base cibil score------------------
async function updateLastCibilEntry(req, res) {
  try {
    const tokenId = req.Id; // Employee ID from auth middleware
    const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");

    // Find all CIBIL records
    const allRecords = await cibilDetailModel.find({});
    // console.log(`Found ${allRecords.length} CIBIL records to update`);

    let successCount = 0;
    let errorCount = 0;
    const results = [];

    // Process each record
    for (const record of allRecords) {
      try {
        let isUpdated = false;
        const updateObj = {};

        // 1. Update applicant fetch history entries with cibilScore
        if (record.applicantFetchHistory && record.applicantFetchHistory.length > 0 && record.applicantCibilScore) {
          // Make a deep copy of fetch history
          const updatedFetchHistory = JSON.parse(JSON.stringify(record.applicantFetchHistory));

          // Add cibilScore to all entries that don't have it
          for (let i = 0; i < updatedFetchHistory.length; i++) {
            if (!updatedFetchHistory[i].cibilScore || updatedFetchHistory[i].cibilScore === '') {
              updatedFetchHistory[i].cibilScore = record.applicantCibilScore.toString();
            }
          }

          updateObj.applicantFetchHistory = updatedFetchHistory;
          isUpdated = true;
        }

        // 2. Update co-applicant fetch history entries with cibilScore
        if (record.coApplicantData && record.coApplicantData.length > 0) {
          const updatedCoApplicantData = JSON.parse(JSON.stringify(record.coApplicantData));
          let coApplicantUpdated = false;

          // Process each co-applicant
          for (let i = 0; i < updatedCoApplicantData.length; i++) {
            const coApp = updatedCoApplicantData[i];

            // Skip if no score or fetch history
            if (!coApp.coApplicantCibilScore || !coApp.coApplicantFetchHistory || coApp.coApplicantFetchHistory.length === 0) {
              continue;
            }

            // Add cibilScore to all entries that don't have it
            for (let j = 0; j < coApp.coApplicantFetchHistory.length; j++) {
              if (!coApp.coApplicantFetchHistory[j].cibilScore || coApp.coApplicantFetchHistory[j].cibilScore === '') {
                updatedCoApplicantData[i].coApplicantFetchHistory[j].cibilScore = coApp.coApplicantCibilScore.toString();
              }
            }

            coApplicantUpdated = true;
          }

          if (coApplicantUpdated) {
            updateObj.coApplicantData = updatedCoApplicantData;
            isUpdated = true;
          }
        }

        // 3. Update guarantor fetch history entries with cibilScore
        if (record.guarantorFetchHistory && record.guarantorFetchHistory.length > 0 && record.guarantorCibilScore) {
          // Make a deep copy of fetch history
          const updatedFetchHistory = JSON.parse(JSON.stringify(record.guarantorFetchHistory));

          // Add cibilScore to all entries that don't have it
          for (let i = 0; i < updatedFetchHistory.length; i++) {
            if (!updatedFetchHistory[i].cibilScore || updatedFetchHistory[i].cibilScore === '') {
              updatedFetchHistory[i].cibilScore = record.guarantorCibilScore.toString();
            }
          }

          updateObj.guarantorFetchHistory = updatedFetchHistory;
          isUpdated = true;
        }

        // Perform update if needed
        if (isUpdated) {
          await cibilDetailModel.updateOne(
            { _id: record._id },
            { $set: updateObj }
          );

          successCount++;
          results.push({
            customerId: record.customerId,
            status: 'updated'
          });
        } else {
          results.push({
            customerId: record.customerId,
            status: 'skipped',
            reason: 'No updates needed'
          });
        }
      } catch (error) {
        console.error(`Error updating CIBIL record ${record._id}:`, error);
        errorCount++;
        results.push({
          customerId: record.customerId,
          status: 'error',
          error: error.message
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Added cibilScore to fetch history entries for ${successCount} records`,
      totalRecords: allRecords.length,
      successCount,
      errorCount,
      results
    });

  } catch (error) {
    console.error("Error in update operation:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update CIBIL records",
      error: error.message
    });
  }
}



module.exports = {
  updateCibilFetchDates,
  newcibilAddDetail,
  cibilAddDetail,
  getCibilDetailSetData,
  updateCibilData,
  getCibilDetail,
  deleteCibilForm,
  getCibilScore,
  getGenderDistribution,
  cibilByApproveFileOnExtrenalManager,
  approvedBTFileDelete,
  // checkCibilPendingFileMailSend,
  cibilFilesManDashBoard,
  updateCibilRecords,
  // getAllCIiblFileStatusDetails,
  cibilDashBoardProductTable,
  cibilDashBoardBranchTable,
  getCibilDetailsLoanDetailsData,
  getCibilDetailsLoanDetailsUpdate,
  getCibilMultipleScore,
  updateLastCibilEntry,
  dashboardMonthlyCount
};

