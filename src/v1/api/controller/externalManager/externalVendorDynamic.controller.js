const {
  success,
  unknownError,
  serverValidation,
  unauthorized,
  badRequest,
  notFound,
} = require("../../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const moment = require('moment');
const ObjectId = mongoose.Types.ObjectId;
const newBranchModel = require('../../model/adminMaster/newBranch.model')
const customerModel = require('../../model/customer.model')
const applicantModel = require('../../model/applicant.model')
const coapplicantModel = require('../../model/co-Applicant.model')
const guarantorModel = require('../../model/guarantorDetail.model')
const vendorModel = require("../../model/adminMaster/vendor.model");
const { paginationData } = require("../../helper/pagination.helper.js");
const vendorInvoiceModel = require("../../model/adminMaster/vendorInvoceManagment.Model.js")

const { mailSendCustomerPdDone } = require('../../controller/MailFunction/salesMail.js')
// const {vendorsPendingFileMailSend} = require("../MailFunction/salesMail.js");
const employeeModel = require('../../model/adminMaster/employe.model')
const vendorTypeModel = require('../../model/adminMaster/vendorType.model')
const mailSwitchesModel = require("../../model/adminMaster/mailSwitches.model.js")
const externalVendorModel = require("../../model/externalManager/externalVendorDynamic.model");
const externalBranchModel = require('../../model/adminMaster/newBranch.model.js')
const lendersModel = require('../../model/lender.model.js')
const pdModel = require('../../model/credit.Pd.model')
const processModel = require('../../model/process.model')
const { sendEmail, sendEmailByVendor } = require('../functions.Controller')
const { externalVendorGoogleSheet, creditPdAndPdReportGoogleSheet, salesToPdAllFilesDataGoogleSheet,
  rcuDataGoogleSheet, taggingDataGoogleSheet, rmDataGoogleSheet, technicalDataGoogleSheet, legalDataGoogleSheet, RcuGoogleSheet, addPdDataToSheet } = require('../googleSheet.controller');
const { branchPenencyGoogleSheet } = require('../branchPendency/branchGoogleSheet.controller.js')
const { setDefaultVendors } = require("../../helper/externalVendor.helper");
const technicalRequiredModel = require("../../model/branchPendency/approverTechnicalFormModel.js")
const finalSanctionModel = require("../../model/finalSanction/finalSnction.model.js")

// all branch pendency foms models
const bankStatementModel = require("../../model/branchPendency/bankStatementKyc.model.js");
const appPdcModel = require("../../model/branchPendency/appPdc.model.js");
const gtrPdcModel = require("../../model/branchPendency/gtrPdc.model.js");
const propertyPapersKycModel = require("../../model/branchPendency/propertyPaper.model.js");
const nachRegistrationModel = require("../../model/branchPendency/nachRegistration.model.js");
const physicalFileCourierModel = require("../../model/physicalFileCourier.model.js");
const agricultureModel = require("../../model/branchPendency/agricultureIncomeModel.js");
const milkIncomeModel = require("../../model/branchPendency/milkIncomeModel.js");
const salaryAndOtherIncomeModel = require("../../model/branchPendency/salaryAndOtherIncomeModel.js");
const otherBuisnessModel = require("../../model/branchPendency/otherBusinessModel.js");
const rmPaymentUpdateModel = require("../../model/branchPendency/rmPaymentUpdateModel.js");
const esignPhotoModel = require("../../model/branchPendency/esignPhoto.model.js");
const NewbranchModel = require("../../model/adminMaster/newBranch.model.js");
const signKycModel = require("../../model/branchPendency/signkyc.model.js");
const otherDocumentModel = require("../../model/branchPendency/OtherDocument.model.js");
const { finalApprovalSheet } = require("../../controller/finalSanction/faGoogleSheet.controller.js")
const { addAutoTask, deleteAutoTask, completeAutoTask } = require("../../helper/autoTask.helper.js")


const fileStatusRevertByVendor = async (req, res) => {
  try {
    const { _id, status, remarkByPd, customerId, rejectPhoto, reasonForReject } = req.query;
    const employeeId = req.Id
    const employeeDetail = await employeeModel.findById(employeeId)
    if (!employeeDetail) {
      return notFound(res, "employee not found");
    }
    // console.log('rejectPhoto', rejectPhoto)
    const formCompleteDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");
    if (status === 'reject') {
      if (!customerId) {
        return badRequest(res, "customerId Required", [])
      }
      if (!rejectPhoto) {
        return badRequest(res, "reject Image Required", [])
      }
    }
    let role = "creditPd";
    let document;
    let customerData
    if (customerId) {
      document = await externalVendorModel.findOne({ customerId })
    } else {
      document = await externalVendorModel.findById(_id);
      customerData = await customerModel.findById(document.customerId)
    }

    if (!document) {
      return notFound(res, "Document not found");
    }

    switch (role) {
      case "creditPd":
        document.statusByCreditPd = status;
        console.log('employeeId', employeeId)
        if (status === "accept") {
          document.creditPdId = employeeId;
          document.creditPdAssignDate = formCompleteDate;
          document.hoStatus = 'notAssign'

        const startDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");

        const parameters = {
          employeeId : employeeId || "",
          assignBy : employeeId || "",
          title : `Customer pd`,
          task: `Customer pd task created successfull customerFinID: ${customerData?.customerFinId}`,
          dueDate : "",
          description:"",
          startDate,
          redirectUrl : `/pd-list/myFiles/?customerId=${document?.customerId}`,
          taskType : "pd",
          customerId: document?.customerId || null
        }
         await addAutoTask(parameters) 

        }
        document.remarkByCreditPd = remarkByPd;
        document.reasonForReject = reasonForReject;
        if (status === "reject") {
          document.creditPdCompleteDate = formCompleteDate;
          const rejectPhotoArray = rejectPhoto.split(',').map(photo => photo.trim());
          if (!Array.isArray(document.creditPdRejectPhoto)) {
            document.creditPdRejectPhoto = [];
          }
          document.creditPdRejectPhoto.push(...rejectPhotoArray);
             const mailSwitchConfig = await mailSwitchesModel.findOne();
              if ( mailSwitchConfig?.masterMailStatus &&
                mailSwitchConfig?.mailSendCustomerPdDone ){ 
                  mailSendCustomerPdDone(customerId, req, status, remarkByPd)
                }
          const parameters = {
            taskType : "pd",
            customerId: customerId || null,
            status:"completed",
            endDate: formCompleteDate
          }
          await completeAutoTask(parameters) 
        }
        // notAssign used for leave 
        if (status === "notAssign") {
          if (!customerId) {
            return badRequest(res, "customerId Required", [])
          }

          const externalManager = await externalVendorModel.findOne({ creditPdId: new ObjectId(employeeId), customerId: customerId });
          // console.log('----externalManager----',externalManager)
          if (externalManager) {
            const pdRecord = await pdModel.findOne({ pdId: externalManager.creditPdId, customerId: customerId });

            // console.log('pdRecord---',pdRecord)
            // If no record found, mark the file as leave
            if (!pdRecord) {
              console.log('run this ')
              document.creditPdId = null;
              document.statusByCreditPd = "notAssign";
            } else {
              return badRequest(res, "Can not 'leave' Pd Form");
            }
           await  deleteAutoTask({taskType:"pd",employeeId,customerId})
          }
        }
        break;
      default:
        return badRequest(res, "Invalid role for this operation");
    }

    await document.save();

    if (status === "reject") {
      await pdModel.findOneAndUpdate(
        { customerId },
        { status: status, remarkByPd: remarkByPd, bdCompleteDate: formCompleteDate, reasonForReject: reasonForReject },
        { new: true }
      );
    }

     const mailSwitchConfig = await mailSwitchesModel.findOne();
    if ( mailSwitchConfig?.masterMailStatus &&   mailSwitchConfig?.mailSendCustomerPdDone && (status === "reject")) {
      mailSendCustomerPdDone(customerId, req, status, remarkByPd)
    }

    success(res, `${role} File ${status === "notAssign" ? "leave" : status} successfully`)
    // await addPdDataToSheet(document.customerId)
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
};

async function getCustoemrDetail(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    } else {
      const { customerId } = req.query;
      const role = req.roleName;
      let matchQuery = { customerId: new ObjectId(customerId) };

      const formDetail = await processModel.aggregate([
        {
          $match: matchQuery,
        },
        {
          $lookup: {
            from: "customerdetails",
            localField: "customerId",
            foreignField: "_id",
            as: "customerDetail",
          },
        },
        {
          $lookup: {
            from: "applicantdetails",
            localField: "customerDetail._id",
            foreignField: "customerId",
            as: "applicantDetail",
          },
        },
        {
          $lookup: {
            from: "coapplicantdetails",
            localField: "customerDetail._id",
            foreignField: "customerId",
            as: "coapplicantdetail",
          },
        },
        {
          $lookup: {
            from: "guarantordetails",
            localField: "customerDetail._id",
            foreignField: "customerId",
            as: "guarantordetail",
          },
        },
        {
          $lookup: {
            from: "externalvendordynamics",
            localField: "customerDetail._id",
            foreignField: "customerId",
            as: "externalvendorDetail",
          },
        },
      ]);

      const transformedResponse = formDetail.map((item) => {
        return {
          customerDetail:
            item.customerDetail.length > 0
              ? {
                _id: item.customerDetail[0]._id,
                customerFinId: item.customerDetail[0].customerFinId,
                executiveName: item.customerDetail[0].executiveName,
                loanAmount: item.customerDetail[0].loanAmount,
                mobileNo: item.customerDetail[0].mobileNo,
              }
              : {},

          applicantDetail:
            item.applicantDetail.length > 0
              ? {
                fullName: item.applicantDetail[0].fullName,
                fatherName: item.applicantDetail[0].fatherName,
                mobileNo: item.applicantDetail[0].mobileNo,
                localAddress: item.applicantDetail[0].localAddress,
                permanentAddress: item.applicantDetail[0].permanentAddress,
              }
              : {},

          coapplicantdetail:
            item.coapplicantdetail.length > 0
              ? item.coapplicantdetail.map((coapplicant) => {
                return {
                  fullName: coapplicant.fullName,
                  mobileNo: coapplicant.mobileNo,
                  localAddress: coapplicant.localAddress,
                  permanentAddress: coapplicant.permanentAddress,
                };
              })
              : [],

          guarantordetail:
            item.guarantordetail.length > 0
              ? {
                fullName: item.guarantordetail[0].fullName,
                mobileNo: item.guarantordetail[0].mobileNo,
                localAddress: item.guarantordetail[0].localAddress,
                permanentAddress: item.guarantordetail[0].permanentAddress,
              }
              : {},

          externalvendorDetail:
            item.externalvendorDetail.length > 0
              ? {
                _id: item.externalvendorDetail[0]._id,
                externalVendorId:
                  item.externalvendorDetail[0].externalVendorId,
                vendors: item.externalvendorDetail[0].vendors,
              }
              : {},
        };
      });

      return success(res, "Customer detail", transformedResponse);
    }
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}

async function addByAllVendors(req, res) {
  const {
    uploadProperty,
    requirement,
    reason,
    statusByVendor,
    areaOfLand,
    areaOfConstruction,
    fairMarketValue,
    customerId,
    vendorStatus,
    remarkByVendor,
    cattlesBreed,
    milkLitPerDay,
    numberOfCattle,
    receiverName,
    vendorRole,
    location,
    rcuImageUploads,
    estimateDocument,
  } = req.body;

  const vendorId = req.Id;
  let checkTime = moment().tz("Asia/Kolkata");
  const todayTime = checkTime.format("YYYY-MM-DDThh:mm:ss A");
  const vendorUploadDate = todayTime;
  try {
    if (!customerId) {
      return badRequest(res, "customerId is required");
    }

    const customerDetail = await customerModel.findById(customerId);
    if (!customerDetail) {
      return notFound(res, "Customer not found");
    }

    const applicantDetail = await applicantModel.findOne({ customerId });

    const externalVendorForm = await externalVendorModel.findOne({
      customerId,
    });
    if (!externalVendorForm) {
      return notFound(res, "Vendor form not found");
    }

    const externalManagerEmployee = await employeeModel.findById(
      externalVendorForm?.externalVendorId
    );

    const vendorDetail = await vendorModel.findById(vendorId);
    if (!vendorDetail) {
      return notFound(res, "Vendor not found");
    }

    const vendor = externalVendorForm.vendors.find(
      (v) => v.vendorType === vendorRole && v.vendorId.toString() === vendorId
    );

    if (!vendor) {
      return notFound(res, "File Not Assign For Vendor");
    }

    // check in this lines technical assign form complete or not 

    if (vendorRole === "technical") {
      const technicalRequiredCheck = await technicalRequiredModel.findOne({ customerId, vendorStatus: "complete" })
      if (!technicalRequiredCheck) {
        return badRequest(res, "Complete Technical Assign Form First.");
      }
    }

    if (vendorRole === "legal") {

      const fileStageStatus = vendor.fileStageStatus || "";

      if (!["firstLegal", "finalLegal", "vettingLegal", ""].includes(fileStageStatus)) {
        return badRequest(res, `Invalid file Status for legal vendor.`);
      }

      // Assign files based on fileStageStatus
      if (fileStageStatus === "firstLegal" || fileStageStatus === "") {
        vendor.uploadProperty = uploadProperty || [];
      } else if (fileStageStatus === "finalLegal") {
        vendor.finalLegalUpload = uploadProperty || [];
      } else if (fileStageStatus === "vettingLegal") {
        vendor.vettingLegalUpload = uploadProperty || [];
      }
    } else {
      if (uploadProperty?.length) vendor.uploadProperty = uploadProperty;
    }

    if (requirement?.length) vendor.requirement = requirement;
    // if (statusByVendor) vendor.statusByVendor = statusByVendor;
    if (statusByVendor === 'complete') {
      vendor.statusByVendor = 'approve';
    } else {
      vendor.statusByVendor = statusByVendor;
    }
    if (uploadProperty) vendor.estimateDocument = estimateDocument;
    if (remarkByVendor) vendor.remarkByVendor = remarkByVendor;
    if (vendorStatus) vendor.vendorStatus = vendorStatus;
    if (reason) vendor.reason = reason;
    if (vendorUploadDate) vendor.vendorUploadDate = vendorUploadDate;

    if (
      areaOfLand ||
      areaOfConstruction ||
      fairMarketValue ||
      milkLitPerDay ||
      numberOfCattle ||
      cattlesBreed ||
      receiverName
    ) {
      Object.assign(vendor, {
        ...(areaOfLand && { areaOfLand }),
        ...(areaOfConstruction && { areaOfConstruction }),
        ...(fairMarketValue && { fairMarketValue }),
        ...(cattlesBreed && { cattlesBreed }),
        ...(milkLitPerDay && { milkLitPerDay }),
        ...(numberOfCattle && { numberOfCattle }),
        ...(receiverName && { receiverName }),
      });
    }

    if (location) {
      externalVendorForm.location = {
        type: location.type || "Point",
        coordinates: location.coordinates,
      };
    }

    // Update rcuImageUploads if provided
    if (rcuImageUploads) {
      externalVendorForm.rcuImageUploads = {
        selfiWithLatLongHouseFront:
          rcuImageUploads.selfiWithLatLongHouseFront || null,
        customerPhotoWithHouseFront:
          rcuImageUploads.customerPhotoWithHouseFront || null,
        houseTotalLengthPhoto: rcuImageUploads.houseTotalLengthPhoto || null,
        houseTotalWidthPhoto: rcuImageUploads.houseTotalWidthPhoto || null,
        houseLeftSidePhoto: rcuImageUploads.houseLeftSidePhoto || null,
        houseRightSidePhoto: rcuImageUploads.houseRightSidePhoto || null,
        houseApproachRoadPhoto: rcuImageUploads.houseApproachRoadPhoto || null,
        kitchenPhotos: rcuImageUploads.kitchenPhotos || null,
      };
    }

    // Save the updated document
    await externalVendorForm.save();

    // Structure the response with updated vendors
    const updatedVendor = externalVendorForm.vendors.find(
      (v) => v.vendorType === vendorRole && v.vendorId.toString() === vendorId
    );

    const vendorInvoivePending = await vendorInvoiceModel.find({ vendorId, customerId, status: "WIP" });
    if (vendorInvoivePending.length > 0) {
      // Update the first entry with status "complete" and paymentStatus "due"
      const modelToUpdate = vendorInvoivePending[0];
      modelToUpdate.status = "complete";
      modelToUpdate.paymentStatus = "due";
      modelToUpdate.completeDate = todayTime;
      modelToUpdate.uploadProperty = uploadProperty;
      modelToUpdate.vendorStatus = vendorStatus;
      await modelToUpdate.save();
    }

    success(res, "Form updated successfully", updatedVendor);
    externalVendorForm.customerFinIdStr = customerDetail.customerFinId;
    externalVendorForm.applicantFullNameStr = applicantDetail.fullName
      ? applicantDetail.fullName
      : "";
    externalVendorForm.applicantFatherNameStr = applicantDetail.fatherName
      ? applicantDetail.fatherName
      : "";
    externalVendorForm.applicantMobileNoStr = applicantDetail.mobileNo
      ? applicantDetail.mobileNo
      : "";
    externalVendorForm.externalManagerNameStr =
      externalManagerEmployee.employeName
        ? externalManagerEmployee.employeName
        : "";

    await externalVendorGoogleSheet(externalVendorForm);
    // console.log("Idttttttttttttttttttt--", externalVendorForm.customerId);

    await RcuGoogleSheet(externalVendorForm.customerId, vendorRole);
    await finalApprovalSheet(externalVendorForm.customerId)

    const externalManagerDetails = await employeeModel.findById(
      externalVendorForm.externalVendorId
    );
    const allData = {
      vendorNameStr: vendorDetail.fullName,
      fileAssignRemarkStr: vendor.externalVendorRemark,
      vendorAssignDateStr: vendor.assignDate,
      customerFinIdStr: customerDetail.customerFinId,
      applicantFullNameStr: customerDetail.fullName,
      applicantFatherNameStr: customerDetail.fatherName,
      applicantMobileNoStr: customerDetail.mobileNo,
      externalManagerNameStr: externalManagerDetails?.employeName,
      vendorFormStatusStr: vendor.vendorStatus,
      vendorStatusStr: vendor.statusByVendor,
      vendorUploadPropertyStr: vendor.uploadProperty
        ? `${process.env.BASE_URL}${vendor.uploadProperty.join(", ")}`
        : "",
      vendorCompleteDateStr: todayTime,
      reasonStr: vendor.reason,
    };

    const newFileSheetUpdate = {
      customerFinIdStr: customerDetail.customerFinId,
    };
    // Role-based Google Sheets logic
    if (vendorRole === "rcu") {
      await rcuVendorByCompleteSendEmail(
        vendorId,
        uploadProperty,
        vendorStatus,
        applicantDetail.fullName,
        customerDetail.customerFinId,
        allData.reasonStr,
        req
      );
      await rcuDataGoogleSheet(allData);
      newFileSheetUpdate.rcuStatusStr = vendor.statusByVendor;
      await salesToPdAllFilesDataGoogleSheet(newFileSheetUpdate);
    } else if (vendorRole === "legal") {
      await legalDataGoogleSheet(allData);
      newFileSheetUpdate.legalStatusStr = vendor.statusByVendor;
      await salesToPdAllFilesDataGoogleSheet(newFileSheetUpdate);
    } else if (vendorRole === "technical") {
      Object.assign(allData, {
        areaOfLandStr: vendor.areaOfLand || "",
        areaOfConstructionStr: vendor.areaOfConstruction || "",
        fairMarketValueStr: vendor.fairMarketValue || "",
        receiverNameStr: vendor.receiverName || "",
        numberOfCattleStr: vendor.numberOfCattle || "",
        cattlesBreedStr: vendor.cattlesBreed || "",
        milkLitPerDayStr: vendor.milkLitPerDay || "",
      });
      await technicalDataGoogleSheet(allData);
      updatedVendor.customerFinIdStr = customerDetail.customerFinId;
      newFileSheetUpdate.technicalStatusStr = vendor.statusByVendor;
      await salesToPdAllFilesDataGoogleSheet(newFileSheetUpdate);
    } else if (vendorRole === "rm") {
      await rmDataGoogleSheet(allData);
      newFileSheetUpdate.rmStatusStr = vendor.statusByVendor;
      await salesToPdAllFilesDataGoogleSheet(newFileSheetUpdate);
    } else if (vendorRole === "tagging") {
      await taggingDataGoogleSheet(allData);
      newFileSheetUpdate.taggingStatusStr = vendor.statusByVendor;
      await salesToPdAllFilesDataGoogleSheet(newFileSheetUpdate);
    }
  } catch (error) {
    console.error("error.message", error.message, "error", error);
    return unknownError(res, error);
  }
}


async function rcuVendorByCompleteSendEmail(
  tokenId,
  uploadProperty,
  vendorStatus,
  customerName,
  customerFinId,
  reason,
  req
) {
  try {
    let toEmails = [];
    let ccEmails = [];
    const vendorDetail = await vendorModel.findOne({ _id: tokenId });
    const BASE_URL = process.env.BASE_URL;
    console.log('req.hostname', req.hostname)
    if (req.hostname === 'prod.fincooper.in') {
      if (["negative", "credit refer"].includes(vendorStatus)) {
        toEmails = ['poojatrivedi@fincoopers.in'];
        ccEmails = ['Ketav@fincoopers.com', 'shubhamdhakad@fincoopers.in'];
      }
    } else if (req.hostname === 'stageapi.fincooper.in' || req.hostname === 'localhost') {
      console.log('functions starts', vendorStatus)
      if (["negative"].includes(vendorStatus)) {
        toEmails = [];
      }
    }

    const vendorName = vendorDetail?.fullName || "";
    const pdfContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <p>Dear Sir,</p>
      <p>The RCU report for <strong>RCU</strong> is <strong>${vendorStatus.toUpperCase()}</strong>.</p>
      <p>Your immediate attention is required.</p>
      <p>Regards,</p>
      <p>Team FinCoopers</p>
      <p>${reason ? reason : ''}</p>
      </div>
    `;

    let subject = `RCU ${vendorStatus.toUpperCase()} - ${customerFinId}`;
    subject = `⚠️ ATTENTION: ${subject}`;

    const attachments = [
      {
        filename: `RCU_Reject_${customerFinId}.pdf`,
        path: `${BASE_URL}${uploadProperty}`,
      },
    ];

    await sendEmail(
      toEmails,
      ccEmails,
      subject,
      pdfContent,
      attachments
    );
    console.log(`Email sent successfully for status: ${vendorStatus}`);
  } catch (error) {
    console.error("Error sending RCU email:", error);
    throw error;
  }
}



const getBranchNameByCustomerId = async (customerId) => {
  try {
    const branchData = await customerModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(customerId) },
      },
      {
        $lookup: {
          from: "employees",
          localField: "employeId", // Field in customerModel
          foreignField: "_id", // Field in employees collection
          as: "employeeDetails",
        },
      },
      {
        $unwind: "$employeeDetails",
      },
      {
        $lookup: {
          from: "newbranches",
          localField: "branch", // Field in employees
          foreignField: "_id", // Field in newbranches collection
          as: "branchDetails",
        },
      },
      {
        $unwind: "$branchDetails",
      },
      {
        $project: {
          _id: 0,
          branchName: "$branchDetails.name", // Assume branch name is stored as `name` in newbranches
        },
      },
    ]);

    return branchData.length > 0 ? branchData[0].branchName : null;
  } catch (error) {
    console.error("Error fetching branch name:", error);
    throw error;
  }
};


// Helper function to create vendor invoice entries
async function createVendorInvoiceEntries(vendors, customerId, formAssignDate, tokenId) {
  for (const vendor of vendors) {
    if (vendor.statusByVendor === "WIP" && vendor.vendorId) {
      // Get vendor details including rate history
      const vendorDetails = await vendorModel.findById(vendor.vendorId);
      if (!vendorDetails) {
        console.error(`Vendor not found for ID: ${vendor.vendorId}`);
        continue;
      }

      // Determine service type and get appropriate rate
      let serviceType = "";
      let fileRate = 0;

      // For legal vendors, check the fileStageStatus to determine service type
      if (vendor.vendorType === "legal") {
        if (["firstLegal", "finalLegal", "vettingLegal"].includes(vendor.fileStageStatus)) {
          serviceType = vendor.fileStageStatus;
        } else {
          console.error(`Invalid fileStageStatus for legal vendor: ${vendor.fileStageStatus}`);
          continue;
        }
      }


      if (vendorDetails.rateHistory && vendorDetails.rateHistory.length > 0) {
        // Sort rateHistory by startDate in descending order
        const sortedRateHistory = [...vendorDetails.rateHistory].sort(
          (a, b) => new Date(b.startDate) - new Date(a.startDate) // Sorting by date
        );
      
        // Get the last rate entry in the sorted array (oldest rate)
        const lastRate = sortedRateHistory[sortedRateHistory.length - 1];
      
        // You can now access the rate data based on the serviceType
        if (lastRate) {
          if (serviceType === "firstLegal") {
            fileRate = lastRate.legalRates.firstLegalRate || 0;
          } else if (serviceType === "finalLegal") {
            fileRate = lastRate.legalRates.finalLegalRate || 0;
          } else if (serviceType === "vettingLegal") {
            fileRate = lastRate.legalRates.vettingLegalRate || 0;
          } else if (["new", "revise", ""].includes(serviceType)) {
            fileRate = lastRate.generalRate || 0;
          }
        }
      }
      

      // Create a new vendor invoice entry
      const vendorInvoice = new vendorInvoiceModel({
        customerId: customerId,
        assignDate: formAssignDate,
        assignById: tokenId,
        vendorId: vendor.vendorId,
        serviceType: serviceType,
        fileRate: fileRate,
        status: "WIP", 
        paymentStatus: "due"
      });

      // Save the invoice
      await vendorInvoice.save();
      // console.log(`Invoice created for customer ${customerId}, vendor ${vendor.vendorId}, service type ${serviceType}, rate ${fileRate}`);
    }
  }
}


async function assignFilesAllVendors(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const tokenId = req.Id;

    const externalManagerDetail = await employeeModel.findById(req.Id);
    if (!externalManagerDetail) {
      return notFound(res, "Employee Not Found");
    }
    let checkTime = moment().tz("Asia/Kolkata");
    const formAssignDate = checkTime.format("YYYY-MM-DDThh:mm:ss A");
    const {
      customerId,
      partnerNameId,
      branchNameId,
      // tlPdId,
      creditPdId,
      branchEmployeeId,
      remarkForBranch,
      branchStatus,
      branchRequiredDocument,
      branchVendorSendMail,
      statusByTlPd,
      statusByCreditPd,
      rematrkForTlPd,
      remarkForCreditPd,
      remarkForHo,
      hoEmployeeId,
      hoStatus,
    } = req.body;

    const vendors = req.body.vendors || [];

    const partnerFullName = await finalSanctionModel.findOne({customerId:customerId}).populate("partnerId")

    const existingVendorData = await externalVendorModel.findOne({ customerId });


for (const vendor of vendors) {

  if (vendor.vendorType === "technical") {
    const technicalRequiredCheck = await technicalRequiredModel.findOne({ customerId });
    if (!technicalRequiredCheck) {
      return badRequest(res, "Please Complete the Initiation Form Before Assign Technical");
        }
    const existingTechnicalVendor = existingVendorData.vendors.find(v => v.vendorType === 'technical');

    if (existingTechnicalVendor) {

      if (existingTechnicalVendor.vendorId && vendor?.vendorId && existingTechnicalVendor.vendorId.toString() === vendor.vendorId.toString()) {
        await technicalRequiredModel.updateOne(
          { customerId },
          {
            $set: {
              propertyLandmark: "",
              latitude: "",
              longitude: "",
              propertyType: "",
              constructionType: "",
              constructionQuality: "",
              propertyAge: "",
              landValue: "",
              constructionValue: "",
              fairMarketValueOfLand: "",
              realizableValue: "",
              surveyNo: "",
              totalBuiltUpArea: "",
              vendorStatus: "pending"
            }
          }
        );
        console.log("Vendor IDs match, updated  same vendor ", customerId);
      } else {
        await technicalRequiredModel.updateOne(
          { customerId },
          {
            $set: { vendorStatus: "pending" }
          }
        );
        console.log("Vendor IDs do not match, New vendor File Assign", customerId);
      }
    } else {
      // If no existing technical vendor found, set vendorStatus to "pending"
      await technicalRequiredModel.updateOne(
        { customerId },
        {
          $set: { vendorStatus: "pending" }
        }
      );
      console.log("No existing technical vendor set to pending for customerId:", customerId);
    }
  }

  // For legal vendor status check
  if (vendor.statusByVendor === "WIP" && vendor.vendorType === "legal" &&
    !["firstLegal", "finalLegal", "vettingLegal"].includes(vendor.fileStageStatus)
  ) {
    return badRequest(res, "Legal assign allowed only for firstLegal, finalLegal, or vettingLegal file stage.");
  }
}

    let partnerName = "";
    let branchName = "";
    let tlPdName = "";
    let creditPdName = "";
    if (partnerNameId) {
      const partner = await lendersModel
        .findById(partnerNameId)
        .select("partnerName")
        .lean();
      partnerName = partner ? partner.fullName : "";
    }

    if (branchNameId) {
      const branch = await newBranchModel
        .findById(branchNameId)
        .select("branch")
        .lean();
      branchName = branch ? branch.branch : "";
    }

    if (creditPdId) {
      const creditPd = await employeeModel
        .findById(creditPdId)
        .select("userName")
        .lean();
      creditPdName = creditPd ? creditPd.userName : "";
    }

    let status = req.body.status ? req.body.status : "incomplete";
    const customer = await processModel.findOne({ customerId });

    const customerDetails = await customerModel.findById(customerId);
    if (!customerDetails) {
      return notFound(res, "Customer Not Found");
    }

    const customerBranch = await newBranchModel.findById(
      customerDetails.branch
    );
    // console.log('customerBranch--',customerBranch)
    const applicantDetails = await applicantModel.findOne({
      customerId: customerId,
    });

    const coApplicantDetails = await coapplicantModel.findOne({
      customerId: customerId,
    });
    const guarantorDetails = await guarantorModel.findOne({
      customerId: customerId,
    });

    if (customer) {
      let updateFields = {
        statusByExternalManager: status,
      };

      if (creditPdId) {
        updateFields.creditPdId = creditPdId;
        updateFields.statusByCreditPd = statusByCreditPd;
        updateFields.remarkByCreditPd = remarkForCreditPd;
      } else if (!creditPdId) {
        updateFields.creditPdId = null;
        updateFields.statusByCreditPd = statusByCreditPd;
        updateFields.remarkByCreditPd = remarkForCreditPd;
      }

      if (Object.keys(updateFields).length > 0) {
        await processModel.findOneAndUpdate(
          { customerId },
          { $set: updateFields },
          { new: true }
        );
      }
    }

    const externalManagerFound = await employeeModel.findById(tokenId);
    if (!externalManagerFound) {
      return notFound(res, "External manager not found");
    }


    let externalVendorData;

    if (!existingVendorData) {
      const validVendors = vendors.filter((vendor) => {
        return (
          (vendor.vendorType &&
            vendor.vendorId &&
            vendor.statusByVendor === "WIP") ||
          (vendor.vendorType && vendor.statusByVendor === "notRequired")
        );
      });

      const newVendorData = {
        customerId,
        externalVendorId: tokenId,
        vendors: validVendors.map((vendor) => ({
          ...vendor,
          sendMail: "mailNotSend",
          assignDate: vendor.statusByVendor === "WIP" ? formAssignDate : "",
        })),
        partnerNameId,
        branchNameId,
        creditPdId,
        remarkForCreditPd,
        branchEmployeeId,
        remarkForBranch,
        branchStatus,
        // branchVendorSendMail: (branchStatus === "notRequired" || branchStatus === "notAssign")
        // ? "mailNotSend"
        // : branchVendorSendMail,
        branchVendorSendMail,
        branchRequiredDocument,
        remarkForHo,
        hoEmployeeId,
        hoStatus,
        // tlPdId,
        status,
        location: {
          type: "Point",
          coordinates: [0, 0],
        },
      };

      let creditPdIdFinId;
      let creditPdEmployeeName;
      if (creditPdId) {
        newVendorData.statusByCreditPd = statusByCreditPd;
        newVendorData.creditPdAssignDate = statusByCreditPd === "WIP" ? formAssignDate : '';
        let creditPdIdEmployeeDetails = await employeeModel.findById(
          creditPdId
        );
        creditPdIdFinId = creditPdIdEmployeeDetails.employeUniqueId || "";
        creditPdEmployeeName = creditPdIdEmployeeDetails.employeName || "";
      }

      externalVendorData = new externalVendorModel(newVendorData);
      await externalVendorData.save();
      await createVendorInvoiceEntries(vendors, customerId, formAssignDate, tokenId);
      success(res, "External Vendor added successfully", externalVendorData);
    } else {
      const existingVendors = existingVendorData?.vendors || [];

      // console.log('existingVendors',existingVendors)

      const existingVendorMap = existingVendors.reduce((map, vendor) => {
        map[vendor.vendorType] = vendor;
        return map;
      }, {});

      // Update or add vendors based on user-provided data
      const updatedVendorList = vendors.map((data) => {
        const currentVendor = existingVendorMap[data.vendorType] || null;
        // console.log("currentVendor", currentVendor);

        if (currentVendor) {
          // Check for `notRequired` or `notAssign` status

          if (data.fileStageStatus === "revise") {
            return {
              vendorId: data.vendorId,
              vendorType: data.vendorType,
              externalVendorRemark: data.externalVendorRemark || "",
              assignDocuments: data.assignDocuments,
              pdfRemark: data.pdfRemark || "",
              uploadProperty: [],
              remarkByVendor: "",
              statusByVendor: data.statusByVendor,
              fileStageStatus: data.fileStageStatus,
              assignDate: data.statusByVendor === "WIP" ? formAssignDate : "",
              reason: "",
              vendorUploadDate: "",
            };
          }

          if (data.statusByVendor === "notRequired" || data.statusByVendor === "notAssign") {
            return {
              ...currentVendor.toObject(),
              vendorId: null,
              assignDocuments: [],
              uploadProperty: [],
              vettingLegalUpload: [],
              finalLegalUpload: [],
              pdfRemark: "",
              externalVendorRemark: "",
              assignDate: "",
              sendMail: "mailNotSend",
              vendorStatus: "",
              reason: "",
              requirement: "",
              vendorUploadDate: "",
              statusByVendor: data.statusByVendor,
              fileStageStatus: data.fileStageStatus,
              approverRemark: "",
              approverDate: "",
              approverEmployeeId: null,
            };
          }

          // Update the existing vendor data
          return {
            ...currentVendor.toObject(),
            vendorId: data.vendorId ?? currentVendor.vendorId,
            assignDocuments: Array.isArray(data.assignDocuments)
              ? data.assignDocuments
              : currentVendor.assignDocuments,
            statusByVendor: data.statusByVendor ?? currentVendor.statusByVendor,
            pdfRemark: data.pdfRemark ?? currentVendor.pdfRemark,
            externalVendorRemark:
              data.externalVendorRemark ?? currentVendor.externalVendorRemark,
            assignDate: data.statusByVendor === "WIP" ? formAssignDate : currentVendor.assignDate,
            // vendorUploadDate: data.statusByVendor === "WIP" ? "" : currentVendor.vendorUploadDate,
            fileStageStatus: data.fileStageStatus ?? currentVendor.fileStageStatus,
            ...(data.statusByVendor === "WIP"
              ? {
                assignEmployeeId: tokenId,
              }
              : {}),
          };
        } else {

          if (data.fileStageStatus === "revise") {
            return {
              vendorId: data.vendorId,
              vendorType: data.vendorType,
              externalVendorRemark: data.externalVendorRemark || "",
              assignDocuments: data.assignDocuments,
              pdfRemark: data.pdfRemark || "",
              uploadProperty: [],
              remarkByVendor: "",
              statusByVendor: data.statusByVendor,
              assignDate: data.statusByVendor === "WIP" ? formAssignDate : "",
              fileStageStatus: data.fileStageStatus,
              reason: "",
              vendorUploadDate: "",
            };
          }

          // Handle new vendor addition
          if (data.statusByVendor === "notRequired" || data.statusByVendor === "notAssign") {
            return {
              vendorType: data.vendorType,
              vendorId: null,
              assignDocuments: [],
              pdfRemark: "",
              externalVendorRemark: "",
              uploadProperty: [],
              vettingLegalUpload: [],
              finalLegalUpload: [],
              remarkByVendor: "",
              sendMail: "mailNotSend",
              assignDate: "",
              statusByVendor: data.statusByVendor,
              fileStageStatus: data.fileStageStatus,
              reason: "",
              requirement: [],
              vendorUploadDate: "",
            };
          }

          // Add a new vendor with provided data
          return {
            vendorType: data.vendorType,
            vendorId: data.vendorId || null,
            assignDocuments: data.assignDocuments || [],
            pdfRemark: data.pdfRemark || "",
            externalVendorRemark: data.externalVendorRemark || "",
            uploadProperty: [],
            remarkByVendor: "",
            sendMail: "mailNotSend",
            assignDate: data.statusByVendor === "WIP" ? formAssignDate : "",
            vendorUploadDate: data.statusByVendor === "WIP" ?? "",
            fileStageStatus: data.fileStageStatus || "",
            statusByVendor: data.statusByVendor || "notAssign",
            reason: data.reason || "",
            requirement: data.requirement || [],
          };
        }
      });

      // want to console current vendor

      // Retain vendors that are not mentioned in the user request
      const unchangedVendors = existingVendors.filter(
        (vendor) =>
          !vendors.some((data) => data.vendorType === vendor.vendorType)
      );

      // Combine updated vendors with unchanged ones
      const finalVendorList = [...updatedVendorList, ...unchangedVendors];

      // Define default branch and creditPd data
      const defaultBranchData = {
        branchEmployeeId: null,
        remarkForBranch: "",
        branchStatus: "notAssign",
        branchByremark: "",
        branchCompleteDate: "",
        branchApproverRemark: "",
        branchApproverDate: "",
        branchAssignDate: "",
        branchVendorSendMail: "mailNotSend",
        branchApproverEmployeeId: null,
      };

      const defaultCreditPdData = {
        creditPdId: null,
        pdfCreateByCreditPd: "",
        remarkForCreditPd: "",
        remarkByCreditPd: "",
        creditPdCompleteDate: "",
        creditPdAssignDate: "",
        creditPdApprovarDate: "",
        approvalRemarkCreditPd: "",
        pdApproverEmployeeId: null,
        creditPdSendMail: "mailNotSend",
        statusByCreditPd: "notAssign",
      };

      // Conditionally set default data based on branchStatus and statusByCreditPd
      const updateVendorData = {
        customerId,
        externalVendorId: tokenId,
        vendors: finalVendorList,
        partnerNameId,
        branchNameId,
        // Branch-related data
        ...(branchStatus === "notAssign" || branchStatus === "notRequired"
          ? defaultBranchData
          : {
            branchEmployeeId,
            remarkForBranch,
            branchStatus,
            branchRequiredDocument,
            branchVendorSendMail,
            ...(branchStatus === "WIP"
              ? {
                branchAssignEmployeeId: tokenId,
                branchAssignDate: formAssignDate,
              }
              : {}),
            ...(branchStatus === "fileAllowed"
              ? {
                branchAssignDate: formAssignDate,
              }
              : {}),
          }),

        // CreditPd-related data
        ...(statusByCreditPd === "notAssign" ||
          statusByCreditPd === "notRequired"
          ? defaultCreditPdData
          : {
            creditPdId,
            creditPdAssignDate:
              statusByCreditPd === "WIP"
                ? formAssignDate
                : updatedVendorList.creditPdAssignDate,
            statusByCreditPd,
            remarkForCreditPd,
            ...(statusByCreditPd === "WIP"
              ? {
                pdAssignEmployeeId: tokenId,
              }
              : {}),
          }),

        // Additional data
        // tlPdId,
        status,
        remarkForHo,
        hoEmployeeId,
        hoStatus,
      };

      let updateFields = {};

      if (existingVendorData) {
        updateFields = {
          ...updateVendorData,
        };
      }
      externalVendorData = await externalVendorModel.findOneAndUpdate(
        { customerId },
        { $set: updateVendorData },
        { new: true, upsert: true }
      );
      await createVendorInvoiceEntries(vendors, customerId, formAssignDate, tokenId);

      const branchEmployeeDetail = await employeeModel.findById(
        externalVendorData.branchEmployeeId
      );
      const branchAssignEmpoyeeDetail = await employeeModel.findById(
        externalVendorData.branchAssignEmployeeId
      );
      

      // console.log('branchEmployeeDetail',branchAssignEmpoyeeDetail)
      success(res, "External Vendor Update successfully", externalVendorData);

      const getVendorDetails = async (externalVendorData) => {
        try {
          const { partnerNameId, customerId } = externalVendorData;

          const partner = await lendersModel
            .findById(partnerNameId)
            .exec();
          return {
            externalVendorData,
            partnerDetails: {
              _id: partner?._id,
              partnerName: partner?.fullName,
            },
          };
        } catch (error) {
          console.error("Error fetching vendor details:", error);
          // throw error;
        }
      };

      const result = await getVendorDetails(externalVendorData);

      const GetBranchName = await getBranchNameByCustomerId(customerId);

      if (req.body.vendors) {
        for (const vendor of req.body.vendors) {
          const { vendorId, vendorType, externalVendorRemark, statusByVendor } = vendor;
          await sendVendorEmails(
            vendor,
            customerId,
            customerDetails,
            applicantDetails,
            coApplicantDetails,
            guarantorDetails,
            GetBranchName,
            result,
            partnerFullName?.partnerId?.fullName || "",
            externalManagerFound
          );
        }
      }

      let creditPdIdFinId;
      let creditPdEmployeeName;

      if (creditPdId) {
        let creditPdDetails = await employeeModel.findById(creditPdId);
        creditPdIdFinId = creditPdDetails?.employeUniqueId
          ? creditPdDetails?.employeUniqueId
          : "";
        creditPdEmployeeName = creditPdDetails?.employeName
          ? creditPdDetails?.employeName
          : "";
      }

      externalVendorData.customerFinIdStr = customerDetails.customerFinId
        ? customerDetails.customerFinId
        : "";
      externalVendorData.applicantFullNameStr = applicantDetails?.fullName
        ? applicantDetails?.fullName
        : "";
      externalVendorData.applicantFatherNameStr = applicantDetails?.fatherName
        ? applicantDetails?.fatherName
        : "";
      externalVendorData.applicantMobileNoStr = applicantDetails?.mobileNo
        ? applicantDetails?.mobileNo
        : "";
      // externalVendorData.externalManagerNameStr = externalManagerDetail.employeName ? externalManagerDetail.employeName : ''

      externalVendorData.externalManagerNameStr =
        externalManagerDetail.employeName
          ? externalManagerDetail.employeName
          : "";
      externalVendorData.creditPdEmployeeName = creditPdEmployeeName;

      // console.log("CustomerId" , req.body.customerId)
      // console.log('updatedVendorList', updatedVendorList[0].vendorType)


      await externalVendorGoogleSheet(externalVendorData);


      if (
        externalVendorData.branchStatus === "WIP" ||
        externalVendorData.branchStatus === "notRequired" ||
        externalVendorData.branchStatus === "notAssign" || externalVendorData.branchStatus === "fileAllowed"
      ) {
        const branchPendencyGoogleSheet = {
          customerFinIdStr: customerDetails.customerFinId,
          applicantFullNameStr: applicantDetails?.fullName
            ? applicantDetails?.fullName
            : "",
          applicantFatherNameStr: applicantDetails?.fatherName
            ? applicantDetails?.fatherName
            : "",
          applicantMobileNoStr: applicantDetails?.mobileNo
            ? applicantDetails?.mobileNo
            : "",
          customerBranchNmaeStr: GetBranchName ? GetBranchName : "",
          branchAssignDateData: externalVendorData.branchAssignDate
            ? externalVendorData.branchAssignDate
            : "",
          remarkForBranchData: externalVendorData.remarkForBranch
            ? externalVendorData.remarkForBranch
            : "",
          remarkBranchStatusData: externalVendorData.branchStatus
            ? externalVendorData.branchStatus
            : "",
          branchPendencyNameStr: branchEmployeeDetail?.employeName
            ? branchEmployeeDetail?.employeName
            : "",
          externalManagerNameStr: branchAssignEmpoyeeDetail?.employeName
            ? branchAssignEmpoyeeDetail?.employeName
            : "",
        };
        await branchPenencyGoogleSheet(branchPendencyGoogleSheet);
      }

      if (creditPdId && statusByCreditPd === "WIP") {
        externalVendorData.statusByCreditPdStr = statusByCreditPd;
        // await creditPdAndPdReportGoogleSheet(externalVendorData);
      }

      const statusMapping = {
        rcu: "rcuStatusStr",
        technical: "technicalStatusStr",
        rm: "rmStatusStr",
        legal: "legalStatusStr",
        tagging: "taggingStatusStr",
      };

      externalVendorData.vendors.forEach((vendor) => {
        const statusKey = statusMapping[vendor.vendorType];
        if (statusKey) {
          externalVendorData[statusKey] = vendor.statusByVendor;
        }
      });

      // console.log('branchEmployeeDetail',branchEmployeeDetail)

      externalVendorData.customerFinIdStr = customerDetails.customerFinId;
      externalVendorData.pdStatusStr = externalVendorData.statusByCreditPd;
      externalVendorData.pdAssignEmployeeName = creditPdId ? creditPdName : "";
      externalVendorData.branchPendencyEmployeeNameStr =
        branchEmployeeDetail?.employeName || "";
      externalVendorData.branchPendencyStatusStr =
        externalVendorData.branchStatus;

      // console.log('externalVendorData--',externalVendorData.statusByCreditPd)

      // await salesToPdAllFilesDataGoogleSheet(externalVendorData)

      if (creditPdId) {
        // await addPdDataToSheet(externalVendorData.customerId);
      }


      // const GetBranchName = await getBranchNameByCustomerId(customerId);

      // console.log('partnerDetails', result?.partnerDetails?.partnerName, 'branch', GetBranchName)
      if (req.body.vendors) {
        for (const vendor of req.body.vendors) {
          const { vendorId, vendorType, externalVendorRemark, statusByVendor } =
            vendor;

          let checkTime = moment().tz("Asia/Kolkata");
          const todayTime = checkTime.format("YYYY-MM-DDThh:mm:ss A");
          if (statusByVendor === "WIP") {
            const vendorFind = await vendorModel.findById(vendorId);

            const allData = {
              customerFinIdStr: customerDetails.customerFinId,
              customerFullNameStr: coApplicantDetails?.fullName,
              customerFatherNameStr: coApplicantDetails?.fatherName,
              customerMobileNoStr: coApplicantDetails?.mobileNo,
              fileAssignRemarkStr: externalVendorRemark,
              vendorStatusStr: statusByVendor,
              externalManagerNameStr: externalManagerFound?.employeName,
              vendorAssignDateStr: todayTime,
              vendorNameStr: vendorId ? vendorFind.fullName : "",
            };

            if (vendorType === "rcu" && statusByVendor === "WIP") {
              await rcuDataGoogleSheet(allData);
            } else if (vendorType === "legal" && statusByVendor === "WIP") {
              await legalDataGoogleSheet(allData);
              console.log('sheet check 1')
            } else if (vendorType === "technical" && statusByVendor === "WIP") {
              console.log('sheet check 3')
              await technicalDataGoogleSheet(allData);
            } else if (vendorType === "rm" && statusByVendor === "WIP") {
              await rmDataGoogleSheet(allData);
            } else if (vendorType === "tagging" && statusByVendor === "WIP") {
              await taggingDataGoogleSheet(allData);
            }


          }
        }
      }

      if (updatedVendorList && updatedVendorList[0]) {
        console.log('updatedVendorList[0].vendorType', updatedVendorList[0].vendorType)
        await RcuGoogleSheet(
          req.body.customerId,
          updatedVendorList[0].vendorType
        );
      }


      if (updatedVendorList && updatedVendorList[0]) {
        // await finalApprovalSheet(req.body.customerId)
      }



      // if (
      //   branchEmployeeId &&
      //   branchStatus == "WIP" &&
      //   externalVendorData.branchVendorSendMail == "mailNotSend"
      // ) {
      //   // console.log('branch mail functions  start ')
      //   await sendEmailForBranchVendor(
      //     branchEmployeeId,
      //     customerId,
      //     customerDetails,
      //     applicantDetails,
      //     coApplicantDetails,
      //     guarantorDetails,
      //     GetBranchName,
      //     externalManagerFound
      //   );
      // }

      // if ( creditPdId && statusByCreditPd == "WIP" && externalVendorData.creditPdSendMail == "mailNotSend" ) {
      //   // console.log('credit pd vendor functions start')
      //   await sendEmailForCreditPdVendor(
      //     creditPdId,
      //     customerId,
      //     customerDetails,
      //     applicantDetails,
      //     coApplicantDetails,
      //     guarantorDetails,
      //     GetBranchName,
      //     externalManagerFound
      //   );
      // }

    }
  } catch (error) {
    console.error(error);
    return unknownError(res, error.message);
  }
}

// async function getDetailsByCustomerId(req, res) {
//   try {
//     const { customerId } = req.query;

//     // Fetch customer details & populate vendor info
//     const fileDetails = await externalVendorModel.findOne({ customerId })
//       .populate({
//         path: "vendors.vendorId",
//         select: "fullName userName",
//       });

//     if (!fileDetails) {
//       return notFound(res, "Customer not found");
//     }

//     return success(res, "Vendor details", fileDetails);

//   } catch (error) {
//     console.log(error);
//     return unknownError(res, error);
//   }
// }


async function getDetailsByCustomerId(req, res) {
  try {
    const { customerId } = req.query;

    // Fetch customer details & populate vendor info
    const fileDetails = await externalVendorModel.findOne({ customerId })
      .populate({
        path: "vendors.vendorId",
        select: "fullName userName",
      });

    if (!fileDetails) {
      return notFound(res, "Customer not found");
    }

    // Function to create a default vendor object while preserving vendorType
    const getDefaultVendor = (vendorType) => ({
      vendorType: vendorType || "",  // Preserve existing vendorType
      vendorId: null,
      assignDocuments: [],
      pdfRemark: "",
      externalVendorRemark: "",
      uploadProperty: [],
      finalLegalUpload: [],
      vettingLegalUpload: [],
      estimateDocument: [],
      remarkByVendor: "",
      sendMail: "mailNotSend",
      statusByVendor: "notAssign",
      fileStageStatus: "",
    });

    // Replace vendors where vendorId is null and statusByVendor is "WIP", "approve", or "reject"
    if (!fileDetails.vendors || fileDetails.vendors.length === 0) {
      fileDetails.vendors = [getDefaultVendor("")]; // No vendorType available
    } else {
      fileDetails.vendors = fileDetails.vendors.map(vendor => {
        if (
          vendor.vendorId === null &&
          ["WIP", "approve", "reject"].includes(vendor.statusByVendor)
        ) {
          return getDefaultVendor(vendor.vendorType); // Preserve vendorType
        }
        return vendor; // Keep existing vendor
      });
    }

    return success(res, "Vendor details", fileDetails);
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}




async function sendVendorEmails(vendor, customerId, customerDetails, applicantDetails, coApplicantDetails, guarantorDetails, GetBranchName, result,partnerName, externalManagerFound) {
  const { vendorId, vendorType, assignDocuments, requirement, sendMail , pdfRemark , externalVendorRemark } = vendor;
  // console.log('second mail check ',vendorType)
  // console.log('sendMail',sendMail, 'check mail ',(!['mailNotSend', 'mailAgainSend'].includes(sendMail)))
  // if (!['mailNotSend', 'mailAgainSend'].includes(sendMail)) return;

  try {
    const externalVendor = await externalVendorModel.findOne({
      'vendors.vendorId': vendorId,
      'vendors.vendorType': vendorType,
      'vendors.sendMail': { $in: ['mailAgainSend', 'mailNotSend'] },
      customerId: customerId
    });

    // console.log('externalVendor---',externalVendor)
    if (!externalVendor) return;

    const vendorFind = await vendorModel.findById(vendorId);
    if (!vendorFind) return;

    const toEmails = vendorFind.communicationToMailId || "";
    const ccEmails = vendorFind.communicationCcMailId || "";
    console.log('toEmails', toEmails, 'ccEmails', ccEmails)
    // const documentsArray = assignDocuments.map(doc => process.env.BASE_URL + doc);
    // switch (vendorType) {
    //   case 'legal':
    //     // console.log('legal')
    //     await sendLegalEmail(toEmails, ccEmails, vendor, customerDetails, applicantDetails, coApplicantDetails, guarantorDetails, GetBranchName, result , partnerName, externalManagerFound);
    //     break;
    //   case 'technical':
    //     // console.log('technical')
    //     await sendTechnicalEmail(toEmails, ccEmails, vendor, customerDetails, applicantDetails, coApplicantDetails, guarantorDetails, GetBranchName, result , partnerName, externalManagerFound);
    //     break;
    //   case 'rcu':
    //     // console.log('rcu')
    //     await sendRCUEmail(toEmails, ccEmails, vendor, customerDetails, applicantDetails, coApplicantDetails, guarantorDetails, GetBranchName, result , partnerName, externalManagerFound);
    //     break;
    //   case 'tagging':
    //     // console.log('tagging')
    //     await sendTaggingEmail(toEmails, ccEmails, vendor, customerDetails, applicantDetails, coApplicantDetails, guarantorDetails, GetBranchName, result , partnerName, externalManagerFound);
    //     break;
    //   case 'rm':
    //     // console.log('rm')
    //     await sendRMEmail(toEmails, ccEmails, vendor, customerDetails, applicantDetails, coApplicantDetails, guarantorDetails, GetBranchName, result , partnerName, externalManagerFound);
    //     break;
    //     case 'fi':
    //     // console.log('fi')
    //     await sendFIEmail(toEmails, ccEmails, vendor, customerDetails, applicantDetails, coApplicantDetails, guarantorDetails, GetBranchName, result , partnerName, externalManagerFound , pdfRemark , externalVendorRemark);
    //     break;
    //   default:
    //     console.error(`Invalid vendor type: ${vendorType}`);
    // }

    const mailSettings = await mailSwitchesModel.findOne();

if (!mailSettings?.masterMailStatus && mailSettings?.vendorMail) {
  console.log("Master mail switch is off, skipping email.");
  return;
}

switch (vendorType) {
  case 'legal':
    if (mailSettings.legalAssignMail) {
      await sendLegalEmail(toEmails, ccEmails, vendor, customerDetails, applicantDetails, coApplicantDetails, guarantorDetails, GetBranchName, result, partnerName, externalManagerFound);
    }
    break;

  case 'technical':
    if (mailSettings.technicalAssignMail) {
      await sendTechnicalEmail(toEmails, ccEmails, vendor, customerDetails, applicantDetails, coApplicantDetails, guarantorDetails, GetBranchName, result, partnerName, externalManagerFound);
    }
    break;

  case 'rcu':
    if (mailSettings.rcuAssignMail) {
      await sendRCUEmail(toEmails, ccEmails, vendor, customerDetails, applicantDetails, coApplicantDetails, guarantorDetails, GetBranchName, result, partnerName, externalManagerFound);
    }
    break;

  case 'tagging':
    if (mailSettings.rmTaggingAssignMail) {
      await sendTaggingEmail(toEmails, ccEmails, vendor, customerDetails, applicantDetails, coApplicantDetails, guarantorDetails, GetBranchName, result, partnerName, externalManagerFound);
    }
    break;

  case 'rm':
    if (mailSettings.rmTaggingAssignMail) { // You might want a separate key like `rmAssignMail`
      await sendRMEmail(toEmails, ccEmails, vendor, customerDetails, applicantDetails, coApplicantDetails, guarantorDetails, GetBranchName, result, partnerName, externalManagerFound);
    }
    break;

  case 'fi':
    if (mailSettings.legalFiAssignMail) {
      await sendFIEmail(toEmails, ccEmails, vendor, customerDetails, applicantDetails, coApplicantDetails, guarantorDetails, GetBranchName, result, partnerName, externalManagerFound, pdfRemark, externalVendorRemark);
    }
    break;

  default:
    console.error(`Invalid vendor type: ${vendorType}`);
}


    await externalVendorModel.updateOne(
      { customerId: customerId, 'vendors.vendorId': vendorId, 'vendors.vendorType': vendorType },
      { $set: { 'vendors.$.sendMail': 'mailSend' } }
    );

  } catch (error) {
    console.error(`Error processing vendor ID: ${vendorId}`, error);
  }
}

// Function to send Legal email

async function sendLegalEmail(toEmails, ccEmails, vendor, customerDetails, applicantDetails, coApplicantDetails, guarantorDetails, GetBranchName, result , partnerName, externalManagerFound) {

  const pdfContent = `
  <html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
      }
      h2 {
        color: #4CAF50;
      }
      p {
        font-size: 14px;
        color: #333;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }
      table, th, td {
        border: 1px solid #ddd;
        padding: 8px;
      }
      th {
        background-color: #f2f2f2;
        text-align: left;
      }
      .footer {
        margin-top: 20px;
        font-size: 12px;
        color: #888;
      }
    </style>
  </head>
  <body>
    <p>Dear Team,</p>
    <p>Please provide Legal Report of Caption Case.</p>
    <table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse;">
      <tbody>
        <tr>
          <td>FILE NO</td>
          <td>${customerDetails?.customerFinId ? customerDetails.customerFinId.toUpperCase() : " "}</td>
        </tr>
        <tr>
          <td>BRANCH</td>
          <td>${GetBranchName ? GetBranchName.toUpperCase() : "No Branch"}</td>
        </tr>
        <tr>
          <td>PARTNER NAME</td>
          <td>${partnerName?partnerName.toUpperCase() : " "}</td>
        </tr>
        <tr>
          <td>CUSTOMER NAME</td>
          <td>${applicantDetails?.fullName ? applicantDetails.fullName.toUpperCase() : " "}</td>
        </tr>
            <tr>
          <td>CUSTOMER FATHER NAME</td>
          <td>${applicantDetails?.fatherName ? applicantDetails.fatherName.toUpperCase() : " "}</td>
        </tr>
        <tr>
          <td>CUSTOMER NUMBER</td>
          <td>${applicantDetails?.mobileNo ? applicantDetails.mobileNo : " "}</td>
        </tr>
               <tr>
          <td>CUSTOMER ADDRESS</td>
          <td>${applicantDetails?.permanentAddress?.addressLine1 ? applicantDetails.permanentAddress.addressLine1.toUpperCase() : " "}</td>
        </tr>

        <tr>
          <td>CO-APPLICANT NAME</td>
          <td>${coApplicantDetails?.fullName ? coApplicantDetails.fullName.toUpperCase() : " "}</td>
        </tr>
             <tr>
          <td>CO-APPLICANT FATHER NAME</td>
          <td>${coApplicantDetails?.fatherName ? coApplicantDetails.fatherName.toUpperCase() : " "}</td>
        </tr>
            <tr>
          <td>CUSTOMER NUMBER</td>
          <td>${coApplicantDetails?.mobileNo ? coApplicantDetails.mobileNo : " "}</td>
        </tr>
               <tr>
          <td>CUSTOMER ADDRESS</td>
          <td>${coApplicantDetails?.permanentAddress?.addressLine1 ? coApplicantDetails.permanentAddress.addressLine1.toUpperCase() : " "}</td>
        </tr>
      </tbody>
    </table>
    <div class="footer">
      <p>Best Regards</p>
      <p>Team Fin coopers</p>
    </div>
  </body>
  </html>
  `;


  // const attachments = documentsArray.map((docPath) => ({
  //   path: docPath,
  //   filename: docPath.split('/').pop(),
  //   contentType: 'application/pdf'
  // }));

  await sendEmailByVendor("sendLegalEmail", toEmails, ccEmails, `${customerDetails?.customerFinId ? customerDetails.customerFinId : " "} ${applicantDetails?.fullName ? applicantDetails.fullName.toUpperCase() : " "} S/O ${applicantDetails?.fatherName ? applicantDetails.fatherName.toUpperCase() : " "} - LEGAL INITIATION`, pdfContent);
}

// Function to send Technical email
async function sendTechnicalEmail(toEmails, ccEmails, vendor, customerDetails, applicantDetails, coApplicantDetails, guarantorDetails, GetBranchName, result ,partnerName, externalManagerFound) {
  const pdfContent = `
  <html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
      }
      h2 {
        color: #4CAF50;
      }
      p {
        font-size: 14px;
        color: #333;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }
      table, th, td {
        border: 1px solid #ddd;
        padding: 8px;
      }
      th {
        background-color: #f2f2f2;
        text-align: left;
      }
      .footer {
        margin-top: 20px;
        font-size: 12px;
        color: #888;
      }
    </style>
  </head>
  <body>
    <p>Dear Sir,</p>
      <p>I hope this message finds you well. We kindly request you to provide the technical valuation for the following case:	</p>
    <table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse;">
      <tbody>
        <tr>
          <td>FILE NO</td>
          <td>${customerDetails?.customerFinId ? customerDetails.customerFinId.toUpperCase() : " "}</td>
        </tr>
        <tr>
          <td>BRANCH</td>
          <td>${GetBranchName ? GetBranchName.toUpperCase() : "No Branch"}</td>
        </tr>
        <tr>
          <td>PARTNER NAME</td>
          <td>${partnerName?partnerName.toUpperCase() : " "}</td>
        </tr>
        <tr>
          <td>CUSTOMER NAME</td>
          <td>${applicantDetails?.fullName ? applicantDetails.fullName.toUpperCase() : " "}</td>
        </tr>
            <tr>
          <td>CUSTOMER FATHER NAME</td>
          <td>${applicantDetails?.fatherName ? applicantDetails.fatherName.toUpperCase() : " "}</td>
        </tr>
        <tr>
          <td>CUSTOMER NUMBER</td>
          <td>${applicantDetails?.mobileNo ? applicantDetails.mobileNo : " "}</td>
        </tr>
               <tr>
          <td>CUSTOMER ADDRESS</td>
          <td>${applicantDetails?.permanentAddress?.addressLine1 ? applicantDetails.permanentAddress.addressLine1.toUpperCase() : " "}</td>
        </tr>

        <tr>
          <td>CO-APPLICANT NAME</td>
          <td>${coApplicantDetails?.fullName ? coApplicantDetails.fullName.toUpperCase() : " "}</td>
        </tr>
             <tr>
          <td>CO-APPLICANT FATHER NAME</td>
          <td>${coApplicantDetails?.fatherName ? coApplicantDetails.fatherName.toUpperCase() : " "}</td>
        </tr>
            <tr>
          <td>CUSTOMER NUMBER</td>
          <td>${coApplicantDetails?.mobileNo ? coApplicantDetails.mobileNo : " "}</td>
        </tr>
               <tr>
          <td>CUSTOMER ADDRESS</td>
          <td>${coApplicantDetails?.permanentAddress?.addressLine1 ? coApplicantDetails.permanentAddress.addressLine1.toUpperCase() : " "}</td>
        </tr>
      </tbody>
    </table>
    <div class="footer">
      <p>To complete this report, please log in to your vendor ID in FINEXE.</p>			
			
<p>If you have any questions or need assistance, feel free to reach out.</p>	
			
<p>Thank you for your prompt attention to this matter.</p>
      <p>Thanks and Regard</p>
      <p>FINEXE</p>
    </div>
  </body>
  </html>
  `;
  // const attachments = documentsArray.map((docPath) => ({
  //   path: docPath,
  //   filename: docPath.split('/').pop(),
  //   contentType: 'application/pdf'
  // }));
  await sendEmailByVendor("sendTechnicalEmail", toEmails, ccEmails, `TECHNICAL INITIATION ${customerDetails?.customerFinId ? customerDetails.customerFinId : " "} ${applicantDetails?.fullName ? applicantDetails.fullName.toUpperCase() : " "} S/O ${applicantDetails?.fatherName ? applicantDetails.fatherName.toUpperCase() : " "} - FINCOOPERS`, pdfContent);
}

// Function to send RCU email
async function sendRCUEmail(toEmails, ccEmails, vendor, customerDetails, applicantDetails, coApplicantDetails, guarantorDetails, GetBranchName, result , partnerName, externalManagerFound) {
  const pdfContent = `
  <html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
      }
      h2 {
        color: #4CAF50;
      }
      p {
        font-size: 14px;
        color: #333;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }
      table, th, td {
        border: 1px solid #ddd;
        padding: 8px;
      }
      th {
        background-color: #f2f2f2;
        text-align: left;
      }
      .footer {
        margin-top: 20px;
        font-size: 12px;
        color: #888;
      }
    </style>
  </head>
  <body>
    <p>Dear Team,</p>
    <p>Please Initiate RCU Of Caption Case.</p>
    <table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse;">
      <tbody>
        <tr>
          <td>FILE NO</td>
          <td>${customerDetails?.customerFinId ? customerDetails.customerFinId.toUpperCase() : " "}</td>
        </tr>
        <tr>
          <td>BRANCH</td>
          <td>${GetBranchName ? GetBranchName.toUpperCase() : "No Branch"}</td>
        </tr>
        <tr>
          <td>PARTNER NAME</td>
          <td>${partnerName?partnerName.toUpperCase() : " "}</td>
        </tr>
        <tr>
          <td>CUSTOMER NAME</td>
          <td>${applicantDetails?.fullName ? applicantDetails.fullName.toUpperCase() : " "}</td>
        </tr>
            <tr>
          <td>CUSTOMER FATHER NAME</td>
          <td>${applicantDetails?.fatherName ? applicantDetails.fatherName.toUpperCase() : " "}</td>
        </tr>
        <tr>
          <td>CUSTOMER NUMBER</td>
          <td>${applicantDetails?.mobileNo ? applicantDetails.mobileNo : " "}</td>
        </tr>
               <tr>
          <td>CUSTOMER ADDRESS</td>
          <td>${applicantDetails?.permanentAddress?.addressLine1 ? applicantDetails.permanentAddress.addressLine1.toUpperCase() : " "}</td>
        </tr>

        <tr>
          <td>CO-APPLICANT NAME</td>
          <td>${coApplicantDetails?.fullName ? coApplicantDetails.fullName.toUpperCase() : " "}</td>
        </tr>
             <tr>
          <td>CO-APPLICANT FATHER NAME</td>
          <td>${coApplicantDetails?.fatherName ? coApplicantDetails.fatherName.toUpperCase() : " "}</td>
        </tr>
            <tr>
          <td>CUSTOMER NUMBER</td>
          <td>${coApplicantDetails?.mobileNo ? coApplicantDetails.mobileNo : " "}</td>
        </tr>
               <tr>
          <td>CUSTOMER ADDRESS</td>
          <td>${coApplicantDetails?.permanentAddress?.addressLine1 ? coApplicantDetails.permanentAddress.addressLine1.toUpperCase() : " "}</td>
        </tr>

                <tr>
          <td>GURANTOR NAME</td>
          <td>${guarantorDetails?.fullName ? guarantorDetails.fullName.toUpperCase() : " "}</td>
        </tr>
             <tr>
          <td>GURANTOR FATHER NAME</td>
          <td>${guarantorDetails?.fatherName ? guarantorDetails.fatherName.toUpperCase() : " "}</td>
        </tr>
            <tr>
          <td>GURANTOR NUMBER</td>
          <td>${guarantorDetails?.mobileNo ? guarantorDetails.mobileNo : " "}</td>
        </tr>
               <tr>
          <td>GURANTOR ADDRESS</td>
          <td>${guarantorDetails?.permanentAddress?.addressLine1 ? guarantorDetails.permanentAddress.addressLine1.toUpperCase() : " "}</td>
        </tr>
      </tbody>
    </table>
    <div class="footer">
      <p>Best Regards,</p>
      <p>Team Fin coopers</p>
    </div>
  </body>
  </html>
  `;
  // const attachments = documentsArray.map((docPath) => ({
  //   path: docPath,
  //   filename: docPath.split('/').pop(),
  //   contentType: 'application/pdf'
  // }));
  await sendEmailByVendor("sendRCUEmail", toEmails, ccEmails, `${customerDetails?.customerFinId ? customerDetails.customerFinId : " "} ${applicantDetails?.fullName ? applicantDetails.fullName.toUpperCase() : " "} S/O ${applicantDetails?.fatherName ? applicantDetails.fatherName.toUpperCase() : " "} - RCU INITIATION `, pdfContent);
  // console.log('rcu mail send')
}

// Function to send RM email
async function sendRMEmail(toEmails, ccEmails, vendor, customerDetails, applicantDetails, coApplicantDetails, guarantorDetails, GetBranchName, result , partnerName , externalManagerFound) {
  const pdfContent = `
  <html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
      }
      h2 {
        color: #4CAF50;
      }
      p {
        font-size: 14px;
        color: #333;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }
      table, th, td {
        border: 1px solid #ddd;
        padding: 8px;
      }
      th {
        background-color: #f2f2f2;
        text-align: left;
      }
      .footer {
        margin-top: 20px;
        font-size: 12px;
        color: #888;
      }
    </style>
  </head>
  <body>
    <p>Dear Team,</p>
    <p>Please Initiate RM Of Caption Case.</p>
    <table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse;">
      <tbody>
        <tr>
          <td>FILE NO</td>
          <td>${customerDetails?.customerFinId ? customerDetails.customerFinId.toUpperCase() : " "}</td>
        </tr>
        <tr>
          <td>BRANCH</td>
          <td>${GetBranchName ? GetBranchName.toUpperCase() : "No Branch"}</td>
        </tr>
        <tr>
          <td>PARTNER NAME</td>
          <td>${partnerName ?partnerName.toUpperCase() : " "}</td>
        </tr>
        <tr>
          <td>CUSTOMER NAME</td>
          <td>${applicantDetails?.fullName ? applicantDetails.fullName.toUpperCase() : " "}</td>
        </tr>
            <tr>
          <td>CUSTOMER FATHER NAME</td>
          <td>${applicantDetails?.fatherName ? applicantDetails.fatherName.toUpperCase() : " "}</td>
        </tr>
        <tr>
          <td>CUSTOMER NUMBER</td>
          <td>${applicantDetails?.mobileNo ? applicantDetails.mobileNo : " "}</td>
        </tr>
               <tr>
          <td>CUSTOMER ADDRESS</td>
          <td>${applicantDetails?.permanentAddress?.addressLine1 ? applicantDetails.permanentAddress.addressLine1.toUpperCase() : " "}</td>
        </tr>

        <tr>
          <td>CO-APPLICANT NAME</td>
          <td>${coApplicantDetails?.fullName ? coApplicantDetails.fullName.toUpperCase() : " "}</td>
        </tr>
             <tr>
          <td>CO-APPLICANT FATHER NAME</td>
          <td>${coApplicantDetails?.fatherName ? coApplicantDetails.fatherName.toUpperCase() : " "}</td>
        </tr>
            <tr>
          <td>CUSTOMER NUMBER</td>
          <td>${coApplicantDetails?.mobileNo ? coApplicantDetails.mobileNo : " "}</td>
        </tr>
               <tr>
          <td>CUSTOMER ADDRESS</td>
          <td>${coApplicantDetails?.permanentAddress?.addressLine1 ? coApplicantDetails.permanentAddress.addressLine1.toUpperCase() : " "}</td>
        </tr>
      </tbody>
    </table>
    <div class="footer">
       <p>Best Regards,</p>
      <p>Team Fin coopers</p>
    </div>
  </body>
  </html>
  `;
  // const attachments = documentsArray.map((docPath) => ({
  //   path: docPath,
  //   filename: docPath.split('/').pop(),
  //   contentType: 'application/pdf'
  // }));
  await sendEmailByVendor("sendRMEmail", toEmails, ccEmails, `${customerDetails?.customerFinId ? customerDetails.customerFinId : " "} ${applicantDetails?.fullName ? applicantDetails.fullName.toUpperCase() : " "} S/O ${applicantDetails?.fatherName ? applicantDetails.fatherName.toUpperCase() : " "} - RM INITIATION`, pdfContent);
}

// Function to send Tagging email
async function sendTaggingEmail(toEmails, ccEmails, vendor, customerDetails, applicantDetails, coApplicantDetails, guarantorDetails, GetBranchName, result ,partnerName, externalManagerFound) {
  const pdfContent = `
  <html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
      }
      h2 {
        color: #4CAF50;
      }
      p {
        font-size: 14px;
        color: #333;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }
      table, th, td {
        border: 1px solid #ddd;
        padding: 8px;
      }
      th {
        background-color: #f2f2f2;
        text-align: left;
      }
      .footer {
        margin-top: 20px;
        font-size: 12px;
        color: #888;
      }
    </style>
  </head>
  <body>
    <p>Dear Team,</p>
    <p>Please Initiate TAGGING Of Caption Case.</p>
    <table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse;">
      <tbody>
        <tr>
          <td>FILE NO</td>
          <td>${customerDetails?.customerFinId ? customerDetails.customerFinId.toUpperCase() : " "}</td>
        </tr>
        <tr>
          <td>BRANCH</td>
          <td>${GetBranchName ? GetBranchName.toUpperCase() : "No Branch"}</td>
        </tr>
        <tr>
          <td>PARTNER NAME</td>
          <td>${partnerName ? partnerName.toUpperCase() : " "}</td>
        </tr>
        <tr>
          <td>CUSTOMER NAME</td>
          <td>${applicantDetails?.fullName ? applicantDetails.fullName.toUpperCase() : " "}</td>
        </tr>
            <tr>
          <td>CUSTOMER FATHER NAME</td>
          <td>${applicantDetails?.fatherName ? applicantDetails.fatherName.toUpperCase() : " "}</td>
        </tr>
        <tr>
          <td>CUSTOMER NUMBER</td>
          <td>${applicantDetails?.mobileNo ? applicantDetails.mobileNo : " "}</td>
        </tr>
               <tr>
          <td>CUSTOMER ADDRESS</td>
          <td>${applicantDetails?.permanentAddress?.addressLine1 ? applicantDetails.permanentAddress.addressLine1.toUpperCase() : " "}</td>
        </tr>

        <tr>
          <td>CO-APPLICANT NAME</td>
          <td>${coApplicantDetails?.fullName ? coApplicantDetails.fullName.toUpperCase() : " "}</td>
        </tr>
             <tr>
          <td>CO-APPLICANT FATHER NAME</td>
          <td>${coApplicantDetails?.fatherName ? coApplicantDetails.fatherName.toUpperCase() : " "}</td>
        </tr>
            <tr>
          <td>CUSTOMER NUMBER</td>
          <td>${coApplicantDetails?.mobileNo ? coApplicantDetails.mobileNo : " "}</td>
        </tr>
               <tr>
          <td>CUSTOMER ADDRESS</td>
          <td>${coApplicantDetails?.permanentAddress?.addressLine1 ? coApplicantDetails.permanentAddress.addressLine1.toUpperCase() : " "}</td>
        </tr>
      </tbody>
    </table>
    <div class="footer">
       <p>Best Regards,</p>
      <p>Team Fin coopers</p>
    </div>
  </body>
  </html>
  `;
  // const attachments = documentsArray.map((docPath) => ({
  //   path: docPath,
  //   filename: docPath.split('/').pop(),
  //   contentType: 'application/pdf'
  // }));
  await sendEmailByVendor("sendTaggingEmail", toEmails, ccEmails, `${customerDetails?.customerFinId ? customerDetails.customerFinId : " "} ${applicantDetails?.fullName ? applicantDetails.fullName.toUpperCase() : " "} S/O ${applicantDetails?.fatherName ? applicantDetails.fatherName.toUpperCase() : " "} - TAGGING INITIATION`, pdfContent);
}

// Function to send FI email
async function sendFIEmail(toEmails, ccEmails, vendor, customerDetails, applicantDetails, coApplicantDetails, guarantorDetails, GetBranchName, result , partnerName , externalManagerFound , pdfRemark , externalVendorRemark) {
  const pdfContent = `
  <html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
      }
      h2 {
        color: #4CAF50;
      }
      p {
        font-size: 14px;
        color: #333;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }
      table, th, td {
        border: 1px solid #ddd;
        padding: 8px;
      }
      th {
        background-color: #f2f2f2;
        text-align: left;
      }
      .footer {
        margin-top: 20px;
        font-size: 12px;
        color: #888;
      }
    </style>
  </head>
  <body>
    <p>Dear Team,</p>
    <p>Please Initiate FI Of Caption Case.</p>
    <table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse;">
      <tbody>
        <tr>
          <td>FILE NO</td>
          <td>${customerDetails?.customerFinId ? customerDetails.customerFinId.toUpperCase() : " "}</td>
        </tr>
        <tr>
          <td>BRANCH</td>
          <td>${GetBranchName ? GetBranchName.toUpperCase() : "No Branch"}</td>
        </tr>
        <tr>
          <td>PARTNER NAME</td>
          <td>${partnerName ?partnerName.toUpperCase() : " "}</td>
        </tr>
        <tr>
          <tr>
          <td>TRIGGER POINTS</td>
          <td>${pdfRemark ?pdfRemark.toUpperCase() : "No Branch"}</td>
        </tr>
        <tr>
          <td>INITIATOR REMARK</td>
          <td>${externalVendorRemark?externalVendorRemark.toUpperCase() : " "}</td>
        </tr>
        <tr>
          <td>CUSTOMER NAME</td>
          <td>${applicantDetails?.fullName ? applicantDetails.fullName.toUpperCase() : " "}</td>
        </tr>
            <tr>
          <td>CUSTOMER FATHER NAME</td>
          <td>${applicantDetails?.fatherName ? applicantDetails.fatherName.toUpperCase() : " "}</td>
        </tr>
        <tr>
          <td>CUSTOMER NUMBER</td>
          <td>${applicantDetails?.mobileNo ? applicantDetails.mobileNo : " "}</td>
        </tr>
               <tr>
          <td>CUSTOMER ADDRESS</td>
          <td>${applicantDetails?.permanentAddress?.addressLine1 ? applicantDetails.permanentAddress.addressLine1.toUpperCase() : " "}</td>
        </tr>

        <tr>
          <td>CO-APPLICANT NAME</td>
          <td>${coApplicantDetails?.fullName ? coApplicantDetails.fullName.toUpperCase() : " "}</td>
        </tr>
             <tr>
          <td>CO-APPLICANT FATHER NAME</td>
          <td>${coApplicantDetails?.fatherName ? coApplicantDetails.fatherName.toUpperCase() : " "}</td>
        </tr>
            <tr>
          <td>CUSTOMER NUMBER</td>
          <td>${coApplicantDetails?.mobileNo ? coApplicantDetails.mobileNo : " "}</td>
        </tr>
               <tr>
          <td>CUSTOMER ADDRESS</td>
          <td>${coApplicantDetails?.permanentAddress?.addressLine1 ? coApplicantDetails.permanentAddress.addressLine1.toUpperCase() : " "}</td>
        </tr>
      </tbody>
    </table>
    <div class="footer">
       <p>Best Regards,</p>
      <p>Team Fin coopers</p>
    </div>
  </body>
  </html>
  `;
  
  await sendEmailByVendor("sendFIEmail", toEmails, ccEmails, `${customerDetails?.customerFinId ? customerDetails.customerFinId : " "} ${applicantDetails?.fullName ? applicantDetails.fullName.toUpperCase() : " "} S/O ${applicantDetails?.fatherName ? applicantDetails.fatherName.toUpperCase() : " "} - FI INITIATION`, pdfContent);
}



async function getBranchEmployeeAssignData(req, res) {
  try {
    const employeeId = req.Id;
    let { status } = req.query;

    const assignedDocs = await externalVendorModel.aggregate([
      {
        $match: {
          branchEmployeeId: new ObjectId(employeeId),
          branchStatus: status,
          // $or: [
          //   { "branchRequiredDocument.incomeDocument1": { $in: status } }, // Match specific document statuses
          //   { "branchRequiredDocument.agriIncomePavtiAndBill": { $in: status } },
          //   { "branchRequiredDocument.incomeDocument2": { $in: status } },
          //   { "branchRequiredDocument.bankStatment": { $in: status } },
          //   { "branchRequiredDocument.propertyDocument": { $in: status } }
          // ],
        },
      },
      {
        $lookup: {
          from: "customerdetails",
          localField: "customerId",
          foreignField: "_id",
          as: "customerdetails",
        },
      },
      {
        $unwind: {
          path: "$customerdetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "branches",
          localField: "customerdetails.branch",
          foreignField: "_id",
          as: "branchDetails",
        },
      },
      {
        $unwind: {
          path: "$branchDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "applicantdetails",
          localField: "customerId",
          foreignField: "customerId",
          as: "applicantDetails",
        },
      },
      {
        $unwind: {
          path: "$applicantDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          branchUploadDocument: {
            bankStatment: 1,
            incomeDocument1: 1,
            incomeDocument2: 1,
            agriIncomePavtiAndBill: 1,
            propertyDocument: 1,
          },
          branchRequiredDocument: 1,
          branchStatus: 1,
          branchCompleteDate: 1,
          remarkForBranch: 1,
          branchByremark: 1,
          branchApproverDate: 1,
          branchApproverRemark: 1,
          "customerdetails._id": 1,
          "customerdetails.customerFinId": 1,
          "branchDetails._id": 1,
          "branchDetails.name": 1,
          "applicantDetails._id": 1,
          "applicantDetails.email": 1,
          "applicantDetails.fullName": 1,
        },
      },
      {
        $match: {
          branchStatus: { $ne: 'revert' } // Exclude documents with 'revert' status
        }
      }
    ]);

    return success(res, "Documents assign List", assignedDocs);
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}



async function updateBranchEmployeeData(req, res) {
  try {
    const employeeId = req.Id;
    const { _id, branchByremark, branchUploadDocument, branchRequiredDocument, branchStatus } = req.body;

    const vendorDocument = await externalVendorModel.findById(_id);
    if (!vendorDocument) {
      return notFound(res, "Form Not Found");
    }

    const updatedBranchRequiredDocument = {
      ...vendorDocument.branchRequiredDocument, // Existing document data
      ...branchRequiredDocument // New data from the request body
    };

    const updatedBranchUploadDocument = {
      ...vendorDocument.branchUploadDocument,
      ...branchUploadDocument
    };

    const todayDate = new Date().toString().split(' ').slice(0, 5).join(' ');

    // Check document statuses
    // const statusesToCheck = Object.values(updatedBranchRequiredDocument);
    // const allDocumentsAccepted = statusesToCheck.every(status => status !== 'reject' && status !== 'WIP');

    // Set branchStatus based on document checks
    // const branchStatus = allDocumentsAccepted ? 'complete' : vendorDocument.branchStatus; // Default to existing status if not complete

    const updateData = {
      branchByremark,
      branchCompleteDate: todayDate,
      branchUploadDocument: updatedBranchUploadDocument,
      branchRequiredDocument: updatedBranchRequiredDocument,
      branchStatus,
    };

    const updatedDocument = await externalVendorModel.findOneAndUpdate(
      {
        _id: new ObjectId(_id),
        branchEmployeeId: new ObjectId(employeeId),
      },
      {
        $set: updateData,
      },
      { new: true }
    );

    if (!updatedDocument) {
      return notFound(res, "No This Form Assign");
    }

    const responseData = {
      branchEmployeeId: updatedDocument.branchEmployeeId,
      branchStatus: updatedDocument.branchStatus,
      remarkForBranch: updatedDocument.remarkForBranch,
      branchByremark: updatedDocument.branchByremark,
      branchCompleteDate: updatedDocument.branchCompleteDate,
      branchUploadDocument: updatedDocument.branchUploadDocument,
      branchRequiredDocument: updatedDocument.branchRequiredDocument,
      _id: updatedDocument._id,
      customerId: updatedDocument.customerId,
      externalVendorId: updatedDocument.externalVendorId,
    };

    return success(res, "Document updated successfully", responseData);
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


async function getHOEmployeeAssignData(req, res) {
  try {
    const employeeId = req.Id;
    const { status } = req.query;

    const assignedDocs = await externalVendorModel.aggregate([
      {
        $match: {
          hoEmployeeId: new ObjectId(employeeId),
          hoStatus: status, // Match based on branchStatus and branchEmployeeId
        },
      },
      {
        $lookup: {
          from: "customerdetails", // Join with customerdetails collection
          localField: "customerId", // Match externalVendorModel's customerId
          foreignField: "_id", // with customerdetails _id
          as: "customerdetails", // Output the results in the customerdetails field
        },
      },
      {
        $unwind: {
          path: "$customerdetails",
          preserveNullAndEmptyArrays: true, // Preserve document even if no customerdetails found
        },
      },
      {
        $lookup: {
          from: "branches", // Join with branches collection
          localField: "customerdetails.branch", // Match customerdetails branch field
          foreignField: "_id", // with branches _id
          as: "branchDetails", // Output the results in the branchDetails field
        },
      },
      {
        $unwind: {
          path: "$branchDetails",
          preserveNullAndEmptyArrays: true, // Preserve document even if no branchDetails found
        },
      },
      {
        $lookup: {
          from: "applicantdetails", // Join with applicantdetails collection
          localField: "customerId", // Match externalVendorModel's customerId
          foreignField: "customerId", // with applicantdetails customerId
          as: "applicantDetails", // Output the results in the applicantDetails field
        },
      },
      {
        $unwind: {
          path: "$applicantDetails",
          preserveNullAndEmptyArrays: true, // Preserve document even if no applicantDetails found
        },
      },
      {
        $project: {
          _id: 1, // Include only relevant fields in the final result
          hoUploadDocument: {
            tvr: 1,
            camReport: 1,
            sentForSanction: 1,
            jainumEntry: 1,
            enachLink: 1,
            otherDisbursement: 1,
            sentForDisbursement: 1,
            eSign: 1,
            disbursementUtr: 1,
            fileInventory: 1,
            chequeInventory: 1,
            loanNo: 1
          },
          hoRequiredDocument: 1,
          remarkByHo: 1,
          hoCompleteDate: 1,
          hoApproverRemark: 1,
          hoApproverDate: 1,
          hoEmployeeId: 1,
          remarkForHo: 1,
          hoStatus: 1,
          "customerdetails._id": 1,
          "customerdetails.customerFinId": 1,
          "branchDetails._id": 1,
          "branchDetails.name": 1,
          "applicantDetails._id": 1,
          "applicantDetails.email": 1,
          "applicantDetails.fullName": 1,
        },
      },
    ]);


    return success(res, "HO Documents assign List", assignedDocs);
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


async function updateHOVendorData(req, res) {
  try {
    const employeeId = req.Id;
    const { _id, branchUploadDocument, remarkByHo, hoStatus } = req.body;


    const todayDate = new Date().toString().split(' ').slice(0, 5).join(' ');

    const vendorDocument = await externalVendorModel.findById(_id);
    if (!vendorDocument) {
      return notFound(res, "Form Not Found");
    }

    const updatedBranchUploadDocument = {
      ...vendorDocument.branchUploadDocument,
      ...branchUploadDocument
    };


    // Prepare the updated data
    const updateData = {
      branchUploadDocument: updatedBranchUploadDocument,
      hoCompleteDate: todayDate, // Set the completion date for HO vendor
      remarkByHo, // Add the remark by HO vendor
      hoStatus,
    };

    // Perform the update based on _id and HO employee's ID
    const updatedDocument = await externalVendorModel.findOneAndUpdate(
      {
        _id: new ObjectId(_id), // Match the form _id
        hoEmployeeId: new ObjectId(employeeId), // Match the HO employee ID
      },
      {
        $set: updateData, // Update with new HO vendor data
      },
      { new: true } // Return the updated document
    );

    // Check if the update was successful
    if (!updatedDocument) {
      return notFound(res, "No This Form Assigned to You");
    }

    // Prepare the response data with updated fields
    const responseData = {
      hoEmployeeId: updatedDocument.hoEmployeeId,
      hoCompleteDate: updatedDocument.hoCompleteDate,
      remarkByHo: updatedDocument.remarkByHo,
      hoStatus: updatedDocument.hoStatus,
      branchUploadDocument: updatedDocument.branchUploadDocument,
      branchRequiredDocument: updatedDocument.branchRequiredDocument,
      _id: updatedDocument._id,
      customerId: updatedDocument.customerId,
      externalVendorId: updatedDocument.externalVendorId,
    };

    // Send a success response with the updated data
    return success(res, "Document updated successfully", responseData);
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


async function vendorAssignFormDetails(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }


    const allVendor = await vendorTypeModel.find();
    const dynamicRoles = allVendor.filter(vendor => vendor.status === 'active').map(vendor => vendor.vendorType);
    const additionalRoles = ["admin"];
    const allowedRoles = [...dynamicRoles, ...additionalRoles];

    const { customerId, vendorId } = req.query;
    let role = req.roleName;

    const vendorType = req.vendorType;
    if ((role === 'vendor' || role === 'internalVendor' || role === 'externalVendor') && vendorType) {
      role = vendorType; // Set role to vendorType (e.g., 'rcu', 'legal', 'technical', 'branch')
    } else if ((req.roleName[0] === 'externalVendor')) {
      role = req.roleName[1];
    } else if (role.includes('And')) {
      const splitRole = role.split('And');
      if (splitRole.length > 1) {
        role = splitRole[1];
      }
    }

    let tokenId;


    if (role === 'admin') {
      // if (vendorId) {
      //   const vendorExists = await vendorModel.findById(vendorId);
      //   if (!vendorExists) {
      //     return notFound(res, "Vendor not found");
      //   }
      // } else {
      //   return badRequest(res, "Vendor ID is required for admin access");
      // }
      tokenId = undefined
    } else {
      // if (!allowedRoles.includes(role)) {
      //   return notFound(res, "Role not authorized to update vendor");
      // }
      if (req.Id) {
        const vendorExists = await vendorModel.findById(req.Id);
        if (!vendorExists) {
          return notFound(res, "Vendor not found");
        }
      } else {
        return badRequest(res, "Vendor ID is required");
      }
      tokenId = req.Id
    }

    const customerFind = await customerModel.findById(customerId);
    if (!customerFind) {
      return notFound(res, "Customer Not Found");
    }
    const query = tokenId ? {
      customerId: customerId, // Match the customerId
      "vendors.vendorId": tokenId, // Check if the vendorId exists inside vendors array
    } : {
      customerId: customerId, // Match the customerId
    }

    const formAgginToVendor = await externalVendorModel.findOne(query);
    if (!formAgginToVendor) {
      return notFound(res, "Customer Form not assign");
    }


    const formDetails = await externalVendorModel.aggregate([
      {
        $match: {
          customerId: new ObjectId(customerId)  // Match the customerId in externalVendorModel
        },
      },
      {
        $lookup: {
          from: "customerdetails", // Name of the applicant model collection
          localField: "customerId", // Field in externalVendorModel
          foreignField: "_id", // Field in applicantModel
          as: "customerdetails", // Output array field
        },
      },
      {
        $lookup: {
          from: "applicantdetails", // Name of the applicant model collection
          localField: "customerId", // Field in externalVendorModel
          foreignField: "customerId", // Field in applicantModel
          as: "applicantDetails", // Output array field
        },
      },
      {
        $lookup: {
          from: "coapplicantdetails", // Name of the co-applicant model collection
          localField: "customerId",
          foreignField: "customerId",
          as: "coApplicantDetails",
        },
      },
      {
        $lookup: {
          from: "guarantordetails", // Name of the guarantor model collection
          localField: "customerId",
          foreignField: "customerId",
          as: "guarantorDetails",
        },
      },
      {
        $lookup: {
          from: "lender partners", // Name of the partner collection (Note: collection names are usually lowercase and pluralized)
          localField: "partnerNameId", // Field in externalVendorModel
          foreignField: "_id", // Field in lender partner
          as: "partnerDetails", // Output array field
        },
      },
      {
        $unwind: {
          path: "$partnerDetails", // Unwind the array to an object
          preserveNullAndEmptyArrays: true, // Keep the document even if no partnerDetails exist
        },
      },
      // Add lookup for Branch Name
      {
        $lookup: {
          from: "newbranches", // Name of the branch collection
          localField: "customerdetails.branch", // Field in externalVendorModel
          foreignField: "_id", // Field in external Branch
          as: "branchDetails", // Output array field
        },
      },
      {
        $unwind: {
          path: "$branchDetails", // Unwind the array to an object
          preserveNullAndEmptyArrays: true, // Keep the document even if no branchDetails exist
        },
      },
      {
        $lookup: {
          from: "finalsanctiondetaails",
          let: { customerId: "$customerId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$customerId", "$$customerId"] }
              }
            },
            {
              $lookup: {
                from: "lenders",
                localField: "partnerId",
                foreignField: "_id",
                as: "lenderInfo"
              }
            },
            { $unwind: "$lenderInfo" },
            {
              $project: {
                partnerId: 1,
                partnerName: "$lenderInfo.fullName",  // assuming name field exists in lender collection
                // add other fields you need from finalsanctiondetaails
              }
            }
          ],
          as: "finalSanctionPartnerDetails"
        }
      },
      {
        $unwind: {
          path: "$finalSanctionPartnerDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          customerId: 1,
          externalVendorId: 1,
          creditPdId: 1,
          statusByCreditPd: 1,
          remarkByCreditPd: 1,
          branchDetails: 1,
          statusByTlPd: 1,
          remarkByTlPd: 1,
          vendors: {
            vendorType: 1,
            vendorId: 1,
            externalVendorRemark: 1,
            pdfRemark: 1,
            assignDocuments: 1, // Include assignDocuments field
            uploadProperty: 1, // Include uploadProperty field
            remarkByVendor: 1,
            sendMail: 1,
            statusByVendor: 1,
            receiverName: 1,
            vendorStatus: 1,
            reason: 1,
            remarkByVendor: 1,
            requirement: 1,
            numberOfCattle: 1,
            cattlesBreed: 1,
            milkLitPerDay: 1,
            areaOfLand: 1,
            areaOfConstruction: 1,
            fairMarketValue: 1,
            vendorUploadDate: 1,
            approverRemark: 1,
            approverDate: 1,
          },
          customerdetails: 1,
          applicantDetails: 1, // Include all fields from applicantModel
          coApplicantDetails: 1, // Include all fields from coApplicantModel
          guarantorDetails: 1, // Include all fields from guarantorModel
          partnerDetails: 1, // Include the partner details
          branchDetails: 1, // Include the branch details
          finalSanctionPartnerDetails: 1
        },
      },
    ]);

    //     const vendorDetails = await externalVendorModel
    //     .find({ customerId: customerId })
    //     .populate('partnerNameId', '_id partnerName status createdAt updatedAt') // Specify the fields for partnerNameId
    //     .populate('branchNameId', '_id branchName status createdAt updatedAt')   // Specify the fields for branchNameId
    //     .select('partnerNameId branchNameId') // Only select partnerNameId and branchNameId from the externalVendorModel
    //     .exec();

    // // Return the filtered response with only the required fields
    // const response = vendorDetails.map(item => ({
    //     partnerNameId: item.partnerNameId,
    //     branchNameId: item.branchNameId
    // }));

    // formDetails.response
    return success(res, "Customer details", formDetails);
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


async function externalManagerFormDetail(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    } else {
      const { customerId } = req.query;
      const customerFind = await customerModel.findById(customerId)
      if (!customerFind) {
        return notFound(res, "Customer Not Found")
      }
      const role = req.roleName;

      const formDetail = await externalVendorModel.findOne({ customerId }).lean()
      if (!formDetail) {
        return notFound(res, "form not found")
      }
      formDetail.vendors = setDefaultVendors(formDetail.vendors)
      return success(res, "Customer detail", formDetail);
    }
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }

}


async function getCustomreFileDetail(req, res) {
  try {
    const { customerId } = req.query;

    if (!customerId) {
      return badRequest(res, "CustomerId is required");
    }

    const fileCheck = await externalVendorModel.findOne({ customerId: customerId })
    if (!fileCheck) {
      return notFound(res, "Cibil Not Approved")
    }
    const pipeline = [
      {
        $match: {
          customerId: new mongoose.Types.ObjectId(customerId),
          fileStatus: "active"
        }
      },
      {
        $lookup: {
          from: "customerdetails",
          localField: "customerId",
          foreignField: "_id",
          as: "customerdetails"
        }
      },
      {
        $lookup: {
          from: "employees",
          localField: "customerdetails.employeId",
          foreignField: "_id",
          as: "employeeDetails"
        }
      },
      {
        $lookup: {
          from: "newbranches",
          localField: "employeeDetails.branchId",
          foreignField: "_id",
          as: "branchDetails"
        }
      },
      {
        $lookup: {
          from: "cibildetails",
          localField: "customerId",
          foreignField: "customerId",
          as: "customerCibildetails"
        }
      },
      {
        $lookup: {
          from: "applicantdetails",
          localField: "customerId",
          foreignField: "customerId",
          as: "applicantDetails"
        }
      },
      {
        $unwind: {
          path: "$customerCibildetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$branchDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$applicantDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$customerdetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          customerId: 1,
          externalVendorId: 1,
          creditPdId: 1,
          statusByCreditPd: 1,
          tlPdId: 1,
          statusByTlPd: 1,
          partnerNameId: 1,
          remarkForBranch: 1,
          branchStatus: 1,
          branchEmployeeId: 1,
          vendors: {
            $map: {
              input: "$vendors",
              as: "vendor",
              in: {
                vendorId: "$$vendor.vendorId",
                vendorType: "$$vendor.vendorType",
                statusByVendor: "$$vendor.statusByVendor",
                approverRemark: "$$vendor.approverRemark",
                remarkByVendor: "$$vendor.remarkByVendor",
                approverDate: "$$vendor.approverDate",
                reason: "$$vendor.reason",
                assignDate: "$$vendor.assignDate",
                vendorUploadDate: "$$vendor.vendorUploadDate",
                vendorStatus: "$$vendor.vendorStatus"
              }
            }
          },
          remarkForHo: 1,
          hoEmployeeId: 1,
          hoStatus: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          customerdetails: {
            _id: "$customerdetails._id",
            customerFinId: "$customerdetails.customerFinId"
          },
          employeeDetails: {
            $map: {
              input: "$employeeDetails",
              as: "emp",
              in: {
                employeName: "$$emp.employeName",
                userName: "$$emp.userName",
                branchId: "$$emp.branchId"
              }
            }
          },
          branchDetails: {
            _id: "$branchDetails._id",
            name: "$branchDetails.name"
          },
          customerCibildetails: {
            applicantPdf: { $ifNull: ["$customerCibildetails.applicantCibilReport", ""] },
            coApplicantPdf: {
              $cond: {
                if: { $isArray: "$customerCibildetails.coApplicantData" },
                then: {
                  $filter: {
                    input: {
                      $concatArrays: [
                        {
                          $map: {
                            input: "$customerCibildetails.coApplicantData",
                            as: "coApplicant",
                            in: { $ifNull: ["$$coApplicant.coApplicantCibilReport", ""] }
                          }
                        },
                        [{ $ifNull: ["$customerCibildetails.coApplicantCibilReport", ""] }]
                      ]
                    },
                    as: "report",
                    cond: { $ne: ["$$report", ""] }
                  }
                },
                else: {
                  $filter: {
                    input: [{ $ifNull: ["$customerCibildetails.coApplicantCibilReport", ""] }],
                    as: "report",
                    cond: { $ne: ["$$report", ""] }
                  }
                }
              }
            },
            guarantorPdf: { $ifNull: ["$customerCibildetails.guarantorCibilReport", ""] }
          },
          applicantDetails: {
            customerId: "$applicantDetails.customerId",
            fullName: "$applicantDetails.fullName",
            fatherName: "$applicantDetails.fatherName",
            mobileNo: "$applicantDetails.mobileNo"
          }
        }
      }
    ];

    const result = await externalVendorModel.aggregate(pipeline);
    return success(res, "Customer Details", result[0]);

  } catch (error) {
    console.error("Error", error);
    return unknownError(res, error);
  }
}




async function externalVendorList(req, res) {
  try {
    const { Id: tokenId, roleName: role } = req;
    const { externalVendorId } = req.query;

    let formData;
    if (role === 'admin') {
      formData = externalVendorId ? await externalVendorModel.find({ externalVendorId }) : await externalVendorModel.find({});
    } else {
      formData = await externalVendorModel.find({ externalVendorId: tokenId });
    }

    success(res, `Form List`, formData);



  } catch (err) {
    console.error('Error in externalVendorList:', err);
    return unknownError(res, err);
  }
}


async function vendorShowList(req, res) {
  try {
    const tokenId = req.Id;
    let role = req.roleName;
    const vendorType = req.vendorType;
    if ((role === 'vendor' || role === 'internalVendor' || role === 'externalVendor') && vendorType) {
      role = vendorType; // Set role to vendorType (e.g., 'rcu', 'legal', 'technical', 'branch')
    } else if ((req.roleName[0] === 'externalVendor')) {
      role = req.roleName[1];
    } else if (role.includes('And')) {
      const splitRole = role.split('And');
      if (splitRole.length > 1) {
        role = splitRole[1];
      }
    }
    // console.log('tokenId', tokenId, req.roleName);

    if (role === 'admin') {
    }
    const assignedForms = await externalVendorModel.find({
      vendors: {
        $elemMatch: {
          vendorId: new mongoose.Types.ObjectId(tokenId),
        },
      },
    });

    if (!assignedForms || assignedForms.length === 0) {
      return notFound(res, "No forms found assigned to this vendor");
    }

    const filteredForms = assignedForms.map(form => {
      const matchingVendors = form.vendors.filter(vendor =>
        vendor.vendorId.toString() === tokenId
      );

      return {
        _id: form._id,
        customerId: form.customerId,
        externalVendorId: form.externalVendorId,
        vendors: matchingVendors,
      };
    }).filter(form => form.vendors.length > 0);

    if (filteredForms.length === 0) {
      return notFound(res, "No forms found assigned to this vendor");
    }

    return success(res, `${req.roleName === 'admin' ? '' : req.vendorType} Forms Assigned List`, filteredForms);

  } catch (err) {
    console.error(err);
    return unknownError(res, err);
  }
}


async function getCustomerList(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    } else {
      // const { searchData } = req.query;
      const status = req.query.status;
      let role = req.roleName;
      const vendorType = req.vendorType;
      if ((role === 'vendor' || role === 'internalVendor' || role === 'externalVendor') && vendorType) {
        role = vendorType; // Set role to vendorType (e.g., 'rcu', 'legal', 'technical', 'branch')
      } else if (req.roleName[0] === 'externalVendor') {
        role = req.roleName[1];
      } else if (role.includes('And')) {
        const splitRole = role.split('And');
        if (splitRole.length > 1) {
          role = splitRole[1];
        }
      }
      let matchQuery = {};
      switch (role) {
        case "external vendor":
          if (status === "pending") {
            matchQuery = {
              // statusByCibil: "approved",
              // statusByPd: "pending"

            }
          } else if (status === "complete") {
            matchQuery = {
              statusByCibil: "approved",
              statusByPd: "pending",
              vendorId: new ObjectId(req.Id)
            }
          } else if (status === "rcu") {
            matchQuery = {
              // statusByRCUVender: "approved",
            };
          } else if (status === "legal") {
            matchQuery = {
              // statusByLegalVender: "approved",
            };
          } else if (status === "technical") {
            matchQuery = {
              // statusByTechnicalVender: "approved",
            };
          }
          break;
        case "technical":
          // matchQuery = { technicalVendorId: new ObjectId(req.Id) };
          break;
        case "rcu":
          // matchQuery = { rcuVendorId: new ObjectId(req.Id) };
          break;
        case "legal":
          // matchQuery = { legalVendorId: new ObjectId(req.Id) };
          break;
        case "othervendor":
          // matchQuery = { otherVendorId: new ObjectId(req.Id) };
          break;
        case "branch":
          // matchQuery = { branchVendorId: new ObjectId(req.Id) };
          break;
        case "admin":
          break;
      }
      if (role == "admin") {
        if (status && ["incomplete", "pending", "rejected", "approved"].includes(status)) {
          // matchQuery.statusByPd = status;
          matchQuery.statusByVendor = status;
        } else {
          matchQuery.statusByVendor = { $in: ["incomplete", "pending", "rejected", "approved"] };
        }
      }
      else {
        if (role == "external vendor") {
          if (status && ["incomplete", "pending", "rejected", "approved"].includes(status)) {
            // matchQuery.statusByRCUVender = status;
            // matchQuery.statusByLegalVender = status;
            // matchQuery.statusByTechnicalVender = status;
            // matchQuery.statusByOtherVender = status;
            // matchQuery.statusByBranchVendor = status;
            // console.log("RCU Vendor Status:", matchQuery.statusByRCUVender);
            // console.log("Legal Vendor Status:", matchQuery.statusByLegalVender);
            // console.log("Technical Vendor Status:", matchQuery.statusByTechnicalVender);
          } else if (status === "complete") {
            if (rucValue) {
              // matchQuery.statusByRCUVender = status
            }
            if (legalValue) {
              // matchQuery.statusByLegalVender = status
            }
            if (technicalValue) {
              // matchQuery.statusByTechnicalVender = status
            }
            if (otherVendorValue) {
              // matchQuery.statusByOtherVender = status
            }
          } else {
            matchQuery.statusByRCUVender = {
              $in: ["incomplete", "pending", "rejected", "approved", "complete"],
            };
            matchQuery.statusByLegalVender = {
              $in: ["incomplete", "pending", "rejected", "approved", "complete"],
            };
            matchQuery.statusByTechnicalVender = {
              $in: ["incomplete", "pending", "rejected", "approved", "complete"],
            };
            matchQuery.statusByOtherVender = {
              $in: ["incomplete", "pending", "rejected", "approved", "complete"],
            };
          }
        } else if (role == "technical") {
          if (status && ["WIP", "complete"].includes(status)) {
            // matchQuery.statusByPd = status;
            matchQuery.statusByTechnicalVender = status;
          } else {
            matchQuery.statusByTechnicalVender = { $in: ["pending", "WIP"] };
          }
        } else if (role == "rcu") {
          if (status && ["WIP", "complete"].includes(status)) {
            // matchQuery.statusByPd = status;
            matchQuery.statusByRCUVender = status;
          } else {
            matchQuery.statusByRCUVender = { $in: ["pending", "WIP"] };
          }
        } else if (role == "legal") {
          if (status && ["WIP", "complete"].includes(status)) {
            // matchQuery.statusByPd = status;
            matchQuery.statusByLegalVender = status;

          } else {
            matchQuery.statusByLegalVender = { $in: ["pending", "WIP"] };
          }
        } else if (role == "othervendor") {
          if (status && ["WIP", "complete"].includes(status)) {
            // matchQuery.statusByPd = status;
            matchQuery.statusByOtherVender = status;
          } else {
            matchQuery.statusByOtherVender = { $in: ["pending", "WIP"] };
          }
        } else if (role == "branch") {
          if (status && ["WIP", "complete"].includes(status)) {
            // matchQuery.statusByPd = status;
            matchQuery.statusByBranchVendor = status;
          } else {
            matchQuery.statusByBranchVendor = { $in: ["pending", "WIP"] };
          }
        }
      }

      const formDetail = await processModel.aggregate([
        {
          $match: matchQuery,
        },
        {
          $lookup: {
            from: "customerdetails",
            localField: "customerId",
            foreignField: "_id",
            as: "customerDetail",
          },
        },
        {
          $lookup: {
            from: "applicantdetails",
            localField: "customerDetail._id",
            foreignField: "customerId",
            as: "applicantDetail",
          },
        },
        {
          $lookup: {
            from: "coapplicantdetails",
            localField: "customerDetail._id",
            foreignField: "customerId",
            as: "coapplicantdetail",
          },
        },
        {
          $lookup: {
            from: "guarantordetails",
            localField: "customerDetail._id",
            foreignField: "customerId",
            as: "guarantordetail",
          },
        },
        {
          $lookup: {
            from: "externalvendordynamics",
            localField: "customerDetail._id",
            foreignField: "customerId",
            as: "externalvendorDetail",
          },
        },
      ]);

      const transformedResponse = formDetail.map((item) => {
        return {
          customerDetail: item.customerDetail.length > 0 ? {
            _id: item.customerDetail[0]._id,
            customerFinId: item.customerDetail[0].customerFinId,
            executiveName: item.customerDetail[0].executiveName,
            loanAmount: item.customerDetail[0].loanAmount,
            mobileNo: item.customerDetail[0].mobileNo,
          } : {}, // Return an empty object if customerDetail is empty

          applicantDetail: item.applicantDetail.length > 0 ? {
            fullName: item.applicantDetail[0].fullName,
            fatherName: item.applicantDetail[0].fatherName,
            mobileNo: item.applicantDetail[0].mobileNo,
            localAddress: item.applicantDetail[0].localAddress,
            permanentAddress: item.applicantDetail[0].permanentAddress,
          } : {}, // Return an empty object if applicantDetail is empty

          coapplicantdetail: item.coapplicantdetail.length > 0 ? item.coapplicantdetail.map((coapplicant) => {
            return {
              fullName: coapplicant.fullName,
              mobileNo: coapplicant.mobileNo,
              localAddress: coapplicant.localAddress,
              permanentAddress: coapplicant.permanentAddress,
            };
          }) : [], // Return an empty array if coapplicantdetail is empty

          guarantordetail: item.guarantordetail.length > 0 ? {
            fullName: item.guarantordetail[0].fullName,
            mobileNo: item.guarantordetail[0].mobileNo,
            localAddress: item.guarantordetail[0].localAddress,
            permanentAddress: item.guarantordetail[0].permanentAddress,
          } : {}, // Return an empty object if guarantordetail is empty

          externalvendorDetail: item.externalvendorDetail.length > 0 ? {
            _id: item.externalvendorDetail[0]._id,
            externalVendorId: item.externalvendorDetail[0].externalVendorId,
            vendors: item.externalvendorDetail[0].vendors,
          } : {} // Return an empty object if externalvendorDetail is empty
        };
      });

      return success(res, "Customer Proccess list", transformedResponse);
    }
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}


// async function externalManagerDashboard(req, res) {
//   try {
//     const { filterType, filterStatus, showRejected, searchQuery = "" } = req.query;
//     let { page, limit } = req.query;
//     page = parseInt(page) || 1;
//     limit = parseInt(limit) || 50;

//     const skip = (page - 1) * limit;
//     const tab = showRejected ? JSON.parse(showRejected) : false;



//     const pipeline = [
//       {
//         $match: {
//           fileStatus: "active",
//           $expr: {
//             $and: [
//               {
//                 $cond: {
//                   if: {
//                     $and: [
//                       { $ne: [filterType, null] },
//                       { $ne: [filterType, ""] },
//                       { $ne: [filterStatus, null] },
//                       { $ne: [filterStatus, ""] }
//                     ]
//                   },
//                   then: {
//                     $anyElementTrue: {
//                       $map: {
//                         input: "$vendors",
//                         as: "vendor",
//                         in: {
//                           $and: [
//                             { $eq: ["$$vendor.vendorType", filterType] },
//                             { $eq: ["$$vendor.statusByVendor", filterStatus] }
//                           ]
//                         }
//                       }
//                     }
//                   },
//                   else: true
//                 }
//               },
//               {
//                 $cond: {
//                   if: { $eq: [tab, true] },
//                   then: {
//                     $anyElementTrue: {
//                       $map: {
//                         input: "$vendors",
//                         as: "vendor",
//                         in: { $eq: ["$$vendor.statusByVendor", "reject"] }
//                       }
//                     }
//                   },
//                   else: {
//                     $not: {
//                       $anyElementTrue: {
//                         $map: {
//                           input: "$vendors",
//                           as: "vendor",
//                           in: { $eq: ["$$vendor.statusByVendor", "reject"] }
//                         }
//                       }
//                     }
//                   }
//                 }
//               }
//             ]
//           }
//         }
//       },
//       {
//         $facet: {
//           totalCases: [{ $count: "count" }],
//           vendorStats: [
//             { $unwind: "$vendors" },
//             { $match: { "vendors.vendorId": { $ne: null } } },
//             {
//               $group: {
//                 _id: {
//                   type: { $toLower: "$vendors.vendorType" },
//                   status: "$vendors.statusByVendor"
//                 },
//                 count: { $sum: 1 }
//               }
//             }
//           ],
//           creditPdStats: [
//             { $match: { creditPdId: { $ne: null } } },
//             { $group: { _id: "$statusByCreditPd", count: { $sum: 1 } } }
//           ],
//           tlPdStats: [
//             { $match: { tlPdId: { $ne: null } } },
//             { $group: { _id: "$statusByTlPd", count: { $sum: 1 } } }
//           ],
//           branchStatus: [
//             { $match: { tlPdId: { $ne: null } } },
//             { $group: { _id: "$branchEmployeeId", count: { $sum: 1 } } }
//           ],
//           allData: [
//             {
//               $lookup: {
//                 from: "customerdetails",
//                 localField: "customerId",
//                 foreignField: "_id",
//                 as: "customerdetails"
//               }
//             },
//             {
//               $lookup: {
//                 from: "employees",
//                 localField: "customerdetails.employeId",
//                 foreignField: "_id",
//                 as: "employeeDetails"
//               }
//             },
//             {
//               $lookup: {
//                 from: "newbranches",
//                 localField: "employeeDetails.branchId",
//                 foreignField: "_id",
//                 as: "branchDetails"
//               }
//             },
//             {
//               $lookup: {
//                 from: "cibildetails",
//                 localField: "customerId",
//                 foreignField: "customerId",
//                 as: "customerCibildetails"
//               }
//             },
//             {
//               $lookup: {
//                 from: "applicantdetails",
//                 localField: "customerId",
//                 foreignField: "customerId",
//                 as: "applicantDetails"
//               }
//             },
//             {
//               $unwind: {
//                 path: "$customerCibildetails",
//                 preserveNullAndEmptyArrays: true
//               }
//             },
//             {
//               $unwind: {
//                 path: "$branchDetails",
//                 preserveNullAndEmptyArrays: true
//               }
//             },
//             {
//               $unwind: {
//                 path: "$applicantDetails",
//                 preserveNullAndEmptyArrays: true
//               }
//             },
//             {
//               $unwind: {
//                 path: "$customerdetails",
//                 preserveNullAndEmptyArrays: true
//               }
//             },
//             {
//               $project: {
//                 _id: 1,
//                 externalVendorId: 1,
//                 creditPdId: 1,
//                 statusByCreditPd: 1,
//                 tlPdId: 1,
//                 statusByTlPd: 1,
//                 partnerNameId: 1,
//                 remarkForBranch: 1,
//                 branchStatus: 1,
//                 branchEmployeeId: 1,
//                 vendors: {
//                   vendorId: 1,
//                   vendorType: 1,
//                   statusByVendor: 1,
//                   approverRemark: 1,
//                   remarkByVendor: 1,
//                   approverDate: 1,
//                   reason: 1
//                 },
//                 remarkForHo: 1,
//                 hoEmployeeId: 1,
//                 hoStatus: 1,
//                 status: 1,
//                 createdAt: 1,
//                 updatedAt: 1,
//                 customerdetails: {
//                   _id: "$customerdetails._id",
//                   customerFinId: "$customerdetails.customerFinId"
//                 },
//                 employeeDetails: {
//                   $map: {
//                     input: "$employeeDetails",
//                     as: "emp",
//                     in: {
//                       employeName: "$$emp.employeName",
//                       userName: "$$emp.userName",
//                       branchId: "$$emp.branchId"
//                     }
//                   }
//                 },
//                 branchDetails: {
//                   _id: "$branchDetails._id",
//                   name: "$branchDetails.name"
//                 },
//                 customerCibildetails: {
//                   applicantPdf: { $ifNull: ["$customerCibildetails.applicantCibilReport", ""] },
//                   coApplicantPdf: {
//                     $cond: {
//                       if: { $isArray: "$customerCibildetails.coApplicantData" },
//                       then: {
//                         $filter: {
//                           input: {
//                             $concatArrays: [
//                               {
//                                 $map: {
//                                   input: "$customerCibildetails.coApplicantData",
//                                   as: "coApplicant",
//                                   in: { $ifNull: ["$$coApplicant.coApplicantCibilReport", ""] }
//                                 }
//                               },
//                               [{ $ifNull: ["$customerCibildetails.coApplicantCibilReport", ""] }]
//                             ]
//                           },
//                           as: "report",
//                           cond: { $ne: ["$$report", ""] }
//                         }
//                       },
//                       else: {
//                         $filter: {
//                           input: [{ $ifNull: ["$customerCibildetails.coApplicantCibilReport", ""] }],
//                           as: "report",
//                           cond: { $ne: ["$$report", ""] }
//                         }
//                       }
//                     }
//                   },
//                   guarantorPdf: { $ifNull: ["$customerCibildetails.guarantorCibilReport", ""] }
//                 },
//                 applicantDetails: {
//                   customerId: "$applicantDetails.customerId",
//                   fullName: "$applicantDetails.fullName",
//                   fatherName: "$applicantDetails.fatherName",
//                   mobileNo: "$applicantDetails.mobileNo"
//                 }
//               }
//             },
//             {
//               $match: searchQuery ? {
//                 $or: [
//                   { "customerdetails.customerFinId": { $regex: searchQuery, $options: "i" } },
//                   { "applicantDetails.fullName": { $regex: searchQuery, $options: "i" } },
//                   { "applicantDetails.fatherName": { $regex: searchQuery, $options: "i" } },
//                   { "branchDetails.name": { $regex: searchQuery, $options: "i" } },
//                   { "applicantDetails.mobileNo": searchQuery ? parseInt(searchQuery) || searchQuery : null }
//                 ]
//               } : {}
//             },
//             { $sort: { createdAt: -1 } },
//             { $skip: skip },
//             { $limit: parseInt(limit) }
//           ],
//           totalPages: [
//             { $count: "count" },
//             {
//               $project: {
//                 pages: {
//                   $ceil: {
//                     $divide: ["$count", { $toDouble: limit }]
//                   }
//                 }
//               }
//             }
//           ]
//         }
//       }
//     ];

//     const pipeline1 = [
//       {
//         $match: {
//           fileStatus: "active",
//           $expr: {
//             $and: [
//               {
//                 $cond: {
//                   if: {
//                     $and: [
//                       { $ne: [filterType, null] },
//                       { $ne: [filterType, ""] },
//                       { $ne: [filterStatus, null] },
//                       { $ne: [filterStatus, ""] }
//                     ]
//                   },
//                   then: {
//                     $cond: {
//                       if: { $eq: [filterType, "branchpendency"] },
//                       then: { $eq: ["$branchStatus", filterStatus] },
//                       else: {
//                         $cond: {
//                           if: { $eq: [filterType, "creditPd"] },
//                           then: { $eq: ["$statusByCreditPd", filterStatus] },
//                           else: true
//                         }
//                       }
//                     }
//                   },
//                   else: true
//                 }
//               },
//               {
//                 $cond: {
//                   if: { $eq: [tab, true] },
//                   then: {
//                     $anyElementTrue: {
//                       $map: {
//                         input: "$vendors",
//                         as: "vendor",
//                         in: { $eq: ["$$vendor.statusByVendor", "reject"] }
//                       }
//                     }
//                   },
//                   else: {
//                     $not: {
//                       $anyElementTrue: {
//                         $map: {
//                           input: "$vendors",
//                           as: "vendor",
//                           in: { $eq: ["$$vendor.statusByVendor", "reject"] }
//                         }
//                       }
//                     }
//                   }
//                 }
//               }
//             ]
//           }
//         },
//       },
//       {
//         $facet: {
//           totalCases: [{ $count: "count" }],
//           vendorStats: [
//             { $unwind: "$vendors" },
//             { $match: { "vendors.vendorId": { $ne: null } } },
//             {
//               $group: {
//                 _id: {
//                   type: { $toLower: "$vendors.vendorType" },
//                   status: "$vendors.statusByVendor"
//                 },
//                 count: { $sum: 1 }
//               }
//             }
//           ],
//           creditPdStats: [
//             { $match: { creditPdId: { $ne: null } } },
//             { $group: { _id: "$statusByCreditPd", count: { $sum: 1 } } }
//           ],
//           tlPdStats: [
//             { $match: { tlPdId: { $ne: null } } },
//             { $group: { _id: "$statusByTlPd", count: { $sum: 1 } } }
//           ],
//           branchStatus: [
//             { $match: { tlPdId: { $ne: null } } },
//             { $group: { _id: "$branchEmployeeId", count: { $sum: 1 } } }
//           ],
//           allData: [
//             {
//               $lookup: {
//                 from: "customerdetails",
//                 localField: "customerId",
//                 foreignField: "_id",
//                 as: "customerdetails"
//               }
//             },
//             {
//               $lookup: {
//                 from: "employees",
//                 localField: "customerdetails.employeId",
//                 foreignField: "_id",
//                 as: "employeeDetails"
//               }
//             },
//             {
//               $lookup: {
//                 from: "newbranches",
//                 localField: "employeeDetails.branchId",
//                 foreignField: "_id",
//                 as: "branchDetails"
//               }
//             },
//             {
//               $lookup: {
//                 from: "cibildetails",
//                 localField: "customerId",
//                 foreignField: "customerId",
//                 as: "customerCibildetails"
//               }
//             },
//             {
//               $lookup: {
//                 from: "applicantdetails",
//                 localField: "customerId",
//                 foreignField: "customerId",
//                 as: "applicantDetails"
//               }
//             },
//             {
//               $unwind: {
//                 path: "$customerCibildetails",
//                 preserveNullAndEmptyArrays: true
//               }
//             },
//             {
//               $unwind: {
//                 path: "$branchDetails",
//                 preserveNullAndEmptyArrays: true
//               }
//             },
//             {
//               $unwind: {
//                 path: "$applicantDetails",
//                 preserveNullAndEmptyArrays: true
//               }
//             },
//             {
//               $unwind: {
//                 path: "$customerdetails",
//                 preserveNullAndEmptyArrays: true
//               }
//             },
//             {
//               $project: {
//                 _id: 1,
//                 externalVendorId: 1,
//                 creditPdId: 1,
//                 statusByCreditPd: 1,
//                 tlPdId: 1,
//                 statusByTlPd: 1,
//                 partnerNameId: 1,
//                 remarkForBranch: 1,
//                 branchStatus: 1,
//                 branchEmployeeId: 1,
//                 vendors: {
//                   vendorId: 1,
//                   vendorType: 1,
//                   statusByVendor: 1,
//                   approverRemark: 1,
//                   remarkByVendor: 1,
//                   approverDate: 1,
//                   reason: 1
//                 },
//                 remarkForHo: 1,
//                 hoEmployeeId: 1,
//                 hoStatus: 1,
//                 status: 1,
//                 createdAt: 1,
//                 updatedAt: 1,
//                 customerdetails: {
//                   _id: "$customerdetails._id",
//                   customerFinId: "$customerdetails.customerFinId"
//                 },
//                 employeeDetails: {
//                   $map: {
//                     input: "$employeeDetails",
//                     as: "emp",
//                     in: {
//                       employeName: "$$emp.employeName",
//                       userName: "$$emp.userName",
//                       branchId: "$$emp.branchId"
//                     }
//                   }
//                 },
//                 branchDetails: {
//                   _id: "$branchDetails._id",
//                   name: "$branchDetails.name"
//                 },
//                 customerCibildetails: {
//                   applicantPdf: { $ifNull: ["$customerCibildetails.applicantCibilReport", ""] },
//                   coApplicantPdf: {
//                     $cond: {
//                       if: { $isArray: "$customerCibildetails.coApplicantData" },
//                       then: {
//                         $filter: {
//                           input: {
//                             $concatArrays: [
//                               {
//                                 $map: {
//                                   input: "$customerCibildetails.coApplicantData",
//                                   as: "coApplicant",
//                                   in: { $ifNull: ["$$coApplicant.coApplicantCibilReport", ""] }
//                                 }
//                               },
//                               [{ $ifNull: ["$customerCibildetails.coApplicantCibilReport", ""] }]
//                             ]
//                           },
//                           as: "report",
//                           cond: { $ne: ["$$report", ""] }
//                         }
//                       },
//                       else: {
//                         $filter: {
//                           input: [{ $ifNull: ["$customerCibildetails.coApplicantCibilReport", ""] }],
//                           as: "report",
//                           cond: { $ne: ["$$report", ""] }
//                         }
//                       }
//                     }
//                   },
//                   guarantorPdf: { $ifNull: ["$customerCibildetails.guarantorCibilReport", ""] }
//                 },
//                 applicantDetails: {
//                   customerId: "$applicantDetails.customerId",
//                   fullName: "$applicantDetails.fullName",
//                   fatherName: "$applicantDetails.fatherName",
//                   mobileNo: "$applicantDetails.mobileNo"
//                 }
//               }
//             },
//             {
//               $match: searchQuery ? {
//                 $or: [
//                   { "customerdetails.customerFinId": { $regex: searchQuery, $options: "i" } },
//                   { "applicantDetails.fullName": { $regex: searchQuery, $options: "i" } },
//                   { "applicantDetails.fatherName": { $regex: searchQuery, $options: "i" } },
//                   { "branchDetails.name": { $regex: searchQuery, $options: "i" } },
//                   { "applicantDetails.mobileNo": searchQuery ? parseInt(searchQuery) || searchQuery : null }
//                 ]
//               } : {}
//             },
//             { $skip: skip },
//             { $limit: parseInt(limit) }
//           ],
//           totalPages: [
//             { $count: "count" },
//             {
//               $project: {
//                 pages: {
//                   $ceil: {
//                     $divide: ["$count", { $toDouble: limit }]
//                   }
//                 }
//               }
//             }
//           ]
//         }
//       }
//     ];

// const selectedPipeline = (filterType === 'branchpendency' || filterType === 'creditPd') ? pipeline1 : pipeline;
// // Use the selected pipeline for aggregation
// const result = await externalVendorModel.aggregate(selectedPipeline);

//     const items = {
//       totalCases: result[0].totalCases[0]?.count || 0,
//       total_rcu: 0,
//       total_technical: 0,
//       total_legal: 0,
//       total_rm: 0,
//       total_branch: 0,
//       total_tagging: 0,
//       total_other: 0,
//       total_CREDITPD: 0,
//       total_TLPD: 0,
//       RCU: initStatusCounts(),
//       TECHNICAL: initStatusCounts(),
//       LEGAL: initStatusCounts(),
//       OTHER: initStatusCounts(),
//       RM: initStatusCounts(),
//       TAGGING: initStatusCounts(),

//       BRANCH: initStatusCountsWithIncomplete(),
//       CREDITPD: initStatusCountsWithIncomplete(),
//       TLPD: initStatusCountsWithIncomplete()
//     };

//     result[0].vendorStats.forEach(stat => {
//       const type = stat._id.type?.toUpperCase();
//       const status = stat._id.status;
//       const count = stat.count;

//       if (type && items[type]) {
//         items[`total_${type.toLowerCase()}`] += count;
//         if (items[type][status] !== undefined) {
//           items[type][status] = count;
//         }
//       }
//     });

//     processPdStats(result[0].creditPdStats, items.CREDITPD, 'total_CREDITPD', items);
//     processPdStats(result[0].branchStatus, items.BRANCH, 'total_branch', items);
//     processPdStats(result[0].tlPdStats, items.TLPD, 'total_TLPD', items);

//     return success(res, "all data", {
//       ...items,
//       allData: result[0].allData,
//       pagination: {
//         currentPage: parseInt(page),
//         totalPages: result[0].totalPages[0]?.pages || 0,
//         totalRecords: result[0].totalCases[0]?.count || 0,
//         limit: parseInt(limit)
//       }
//     });
//   } catch (err) {
//     console.error(err);
//     return unknownError(res, err);
//   }
// }

// make a function to get the brachIds and employeeIds

// async function SortEmployee(employeeId) {
//   try {
//     let branchIds = [];
//     let employeeIds = [];

//     const findEmployeeData = await employeeModel.findOne({ _id: employeeId });
//     if (!findEmployeeData) {
//       return [];
//     }

//     const Id = "673ef4ef1c600b445add496a";

//     if (findEmployeeData.branchId == Id) {
//       branchIds.push(new ObjectId(Id));
//     }



//     const childBranches = await NewbranchModel.find({ regionalBranchId: new ObjectId(Id) }).select("_id");
//     const childBranchIds = childBranches.map(branch => branch._id);

//     if (findEmployeeData.branchId == Id || childBranchIds.includes(findEmployeeData.branchId)) {
//       branchIds.push(...childBranches.map(branch => branch._id));
//     }


//     const employees = await employeeModel.find({ branchId: { $in: branchIds } }).select("_id");
//     employeeIds = employees.map(emp => emp._id);
//     return employeeIds;
//   } catch (error) {
//     console.error("Error in SortEmployee:", error);
//     throw error;
//   }
// }

async function SortEmployee(employeeId) {
  try {
    let branchIds = [];
    let employeeIds = [];

    const findEmployeeData = await employeeModel.findOne({ _id: employeeId });
    if (!findEmployeeData) {
      return [];
    }

    const Id = "673ef4ef1c600b445add496a";

    if (findEmployeeData.branchId == Id) {
      branchIds.push(new ObjectId(Id));
    }



    const childBranches = await NewbranchModel.find({ regionalBranchId: new ObjectId(Id) }).select("_id");
    const childBranchIds = childBranches.map(branch => branch._id);

    if (
      findEmployeeData.branchId.toString() == Id ||
      childBranchIds.some(branchId => branchId.toString() == findEmployeeData.branchId.toString())
    ) {
      console.log("2");
      branchIds.push(...childBranches.map(branch => branch._id));
    }

    console.log("branchIds", branchIds);



    const employees = await employeeModel.find({ branchId: { $in: branchIds } }).select("_id");
    employeeIds = employees.map(emp => emp._id);
    return employeeIds;
  } catch (error) {
    console.error("Error in SortEmployee:", error);
    throw error;
  }
}


async function SortCustomerInProcess(employeeIdList) {
  let data = await processModel.find({ employeId: { $in: employeeIdList } }).select("customerId").lean()
  let returnData = data.map(emp => emp.customerId);

  return returnData;

}



async function externalManagerDashboard(req, res) {
  try {
    const { filterType, filterStatus, showRejected, searchQuery = "" } = req.query;
    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 50;

    const skip = (page - 1) * limit;
    let tab = showRejected ? JSON.parse(showRejected) : false;

    const EmployeeeIdeity = req.Id
    // console.log("EmployeeeIdeity", EmployeeeIdeity)
    const SortedEmployeeList = await SortEmployee(req.Id)
    let sortedCustomerIds = await SortCustomerInProcess(SortedEmployeeList)
    // console.log("ExternalVenderaaaaList", a)


    const matchConditions = {
      fileStatus: tab ? { $in: ["active", "inactive"] } : "active",
      $expr: {
        $and: [
          {
            $cond: {
              if: {
                $and: [
                  { $ne: [filterType, null] },
                  { $ne: [filterType, ""] },
                  { $ne: [filterStatus, null] },
                  { $ne: [filterStatus, ""] }
                ]
              },
              then: {
                $anyElementTrue: {
                  $map: {
                    input: "$vendors",
                    as: "vendor",
                    in: {
                      $and: [
                        { $eq: ["$$vendor.vendorType", filterType] },
                        { $eq: ["$$vendor.statusByVendor", filterStatus] }
                      ]
                    }
                  }
                }
              },
              else: true
            }
          },
          {
            $cond: {
              if: { $eq: [tab, true] },
              then: {
                $anyElementTrue: {
                  $map: {
                    input: "$vendors",
                    as: "vendor",
                    in: { $eq: ["$$vendor.statusByVendor", "reject"] }
                  }
                }
              },
              else: {
                $not: {
                  $anyElementTrue: {
                    $map: {
                      input: "$vendors",
                      as: "vendor",
                      in: { $eq: ["$$vendor.statusByVendor", "reject"] }
                    }
                  }
                }
              }
            }
          }
        ]
      }
    };


    // Conditionally add `externalVendorId` to the match conditions
    if (SortedEmployeeList && SortedEmployeeList.length > 0) {
      matchConditions.customerId = { $in: sortedCustomerIds };
    }



    const pipeline = [
      {
        $match: matchConditions
      },
      {
        $facet: {
          totalCases: [{ $count: "count" }],
          vendorStats: [
            { $unwind: "$vendors" },
            { $match: { "vendors.vendorId": { $ne: null } } },
            {
              $group: {
                _id: {
                  type: { $toLower: "$vendors.vendorType" },
                  status: "$vendors.statusByVendor"
                },
                count: { $sum: 1 }
              }
            }
          ],
          creditPdStats: [
            { $match: { creditPdId: { $ne: null } } },
            { $group: { _id: "$statusByCreditPd", count: { $sum: 1 } } }
          ],
          tlPdStats: [
            { $match: { tlPdId: { $ne: null } } },
            { $group: { _id: "$statusByTlPd", count: { $sum: 1 } } }
          ],
          branchStatus: [
            { $match: { tlPdId: { $ne: null } } },
            { $group: { _id: "$branchEmployeeId", count: { $sum: 1 } } }
          ],
          allData: [
            {
              $lookup: {
                from: "customerdetails",
                localField: "customerId",
                foreignField: "_id",
                as: "customerdetails"
              }
            },
            {
              $lookup: {
                from: "employees",
                localField: "customerdetails.employeId",
                foreignField: "_id",
                as: "employeeDetails"
              }
            },
            {
              $lookup: {
                from: "newbranches",
                localField: "employeeDetails.branchId",
                foreignField: "_id",
                as: "branchDetails"
              }
            },
            {
              $lookup: {
                from: "cibildetails",
                localField: "customerId",
                foreignField: "customerId",
                as: "customerCibildetails"
              }
            },
            {
              $lookup: {
                from: "applicantdetails",
                localField: "customerId",
                foreignField: "customerId",
                as: "applicantDetails"
              }
            },
            {
              $unwind: {
                path: "$customerCibildetails",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $unwind: {
                path: "$branchDetails",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $unwind: {
                path: "$applicantDetails",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $unwind: {
                path: "$customerdetails",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                _id: 1,
                externalVendorId: 1,
                creditPdId: 1,
                statusByCreditPd: 1,
                tlPdId: 1,
                statusByTlPd: 1,
                partnerNameId: 1,
                remarkForBranch: 1,
                branchStatus: 1,
                branchEmployeeId: 1,
                vendors: {
                  vendorId: 1,
                  vendorType: 1,
                  statusByVendor: 1,
                  approverRemark: 1,
                  remarkByVendor: 1,
                  approverDate: 1,
                  reason: 1
                },
                remarkForHo: 1,
                hoEmployeeId: 1,
                hoStatus: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
                customerdetails: {
                  _id: "$customerdetails._id",
                  customerFinId: "$customerdetails.customerFinId"
                },
                employeeDetails: {
                  $map: {
                    input: "$employeeDetails",
                    as: "emp",
                    in: {
                      employeName: "$$emp.employeName",
                      userName: "$$emp.userName",
                      branchId: "$$emp.branchId"
                    }
                  }
                },
                branchDetails: {
                  _id: "$branchDetails._id",
                  name: "$branchDetails.name"
                },
                customerCibildetails: {
                  applicantPdf: { $ifNull: ["$customerCibildetails.applicantCibilReport", ""] },
                  coApplicantPdf: {
                    $cond: {
                      if: { $isArray: "$customerCibildetails.coApplicantData" },
                      then: {
                        $filter: {
                          input: {
                            $concatArrays: [
                              {
                                $map: {
                                  input: "$customerCibildetails.coApplicantData",
                                  as: "coApplicant",
                                  in: { $ifNull: ["$$coApplicant.coApplicantCibilReport", ""] }
                                }
                              },
                              [{ $ifNull: ["$customerCibildetails.coApplicantCibilReport", ""] }]
                            ]
                          },
                          as: "report",
                          cond: { $ne: ["$$report", ""] }
                        }
                      },
                      else: {
                        $filter: {
                          input: [{ $ifNull: ["$customerCibildetails.coApplicantCibilReport", ""] }],
                          as: "report",
                          cond: { $ne: ["$$report", ""] }
                        }
                      }
                    }
                  },
                  guarantorPdf: { $ifNull: ["$customerCibildetails.guarantorCibilReport", ""] }
                },
                applicantDetails: {
                  customerId: "$applicantDetails.customerId",
                  fullName: "$applicantDetails.fullName",
                  fatherName: "$applicantDetails.fatherName",
                  mobileNo: "$applicantDetails.mobileNo"
                }
              }
            },
            {
              $match: searchQuery ? {
                $or: [
                  { "customerdetails.customerFinId": { $regex: searchQuery, $options: "i" } },
                  { "applicantDetails.fullName": { $regex: searchQuery, $options: "i" } },
                  { "applicantDetails.fatherName": { $regex: searchQuery, $options: "i" } },
                  { "branchDetails.name": { $regex: searchQuery, $options: "i" } },
                  { "applicantDetails.mobileNo": searchQuery ? parseInt(searchQuery) || searchQuery : null }
                ]
              } : {}
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit) }
          ],
          totalPages: [
            { $count: "count" },
            {
              $project: {
                pages: {
                  $ceil: {
                    $divide: ["$count", { $toDouble: limit }]
                  }
                }
              }
            }
          ]
        }
      }
    ];

    const pipeline1 = [
      {
        $match: matchConditions
      },
      {
        $facet: {
          totalCases: [{ $count: "count" }],
          vendorStats: [
            { $unwind: "$vendors" },
            { $match: { "vendors.vendorId": { $ne: null } } },
            {
              $group: {
                _id: {
                  type: { $toLower: "$vendors.vendorType" },
                  status: "$vendors.statusByVendor"
                },
                count: { $sum: 1 }
              }
            }
          ],
          creditPdStats: [
            { $match: { creditPdId: { $ne: null } } },
            { $group: { _id: "$statusByCreditPd", count: { $sum: 1 } } }
          ],
          tlPdStats: [
            { $match: { tlPdId: { $ne: null } } },
            { $group: { _id: "$statusByTlPd", count: { $sum: 1 } } }
          ],
          branchStatus: [
            { $match: { tlPdId: { $ne: null } } },
            { $group: { _id: "$branchEmployeeId", count: { $sum: 1 } } }
          ],
          allData: [
            {
              $lookup: {
                from: "customerdetails",
                localField: "customerId",
                foreignField: "_id",
                as: "customerdetails"
              }
            },
            {
              $lookup: {
                from: "employees",
                localField: "customerdetails.employeId",
                foreignField: "_id",
                as: "employeeDetails"
              }
            },
            {
              $lookup: {
                from: "newbranches",
                localField: "employeeDetails.branchId",
                foreignField: "_id",
                as: "branchDetails"
              }
            },
            {
              $lookup: {
                from: "cibildetails",
                localField: "customerId",
                foreignField: "customerId",
                as: "customerCibildetails"
              }
            },
            {
              $lookup: {
                from: "applicantdetails",
                localField: "customerId",
                foreignField: "customerId",
                as: "applicantDetails"
              }
            },
            {
              $unwind: {
                path: "$customerCibildetails",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $unwind: {
                path: "$branchDetails",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $unwind: {
                path: "$applicantDetails",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $unwind: {
                path: "$customerdetails",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                _id: 1,
                externalVendorId: 1,
                creditPdId: 1,
                statusByCreditPd: 1,
                tlPdId: 1,
                statusByTlPd: 1,
                partnerNameId: 1,
                remarkForBranch: 1,
                branchStatus: 1,
                branchEmployeeId: 1,
                vendors: {
                  vendorId: 1,
                  vendorType: 1,
                  statusByVendor: 1,
                  approverRemark: 1,
                  remarkByVendor: 1,
                  approverDate: 1,
                  reason: 1
                },
                remarkForHo: 1,
                hoEmployeeId: 1,
                hoStatus: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
                customerdetails: {
                  _id: "$customerdetails._id",
                  customerFinId: "$customerdetails.customerFinId"
                },
                employeeDetails: {
                  $map: {
                    input: "$employeeDetails",
                    as: "emp",
                    in: {
                      employeName: "$$emp.employeName",
                      userName: "$$emp.userName",
                      branchId: "$$emp.branchId"
                    }
                  }
                },
                branchDetails: {
                  _id: "$branchDetails._id",
                  name: "$branchDetails.name"
                },
                customerCibildetails: {
                  applicantPdf: { $ifNull: ["$customerCibildetails.applicantCibilReport", ""] },
                  coApplicantPdf: {
                    $cond: {
                      if: { $isArray: "$customerCibildetails.coApplicantData" },
                      then: {
                        $filter: {
                          input: {
                            $concatArrays: [
                              {
                                $map: {
                                  input: "$customerCibildetails.coApplicantData",
                                  as: "coApplicant",
                                  in: { $ifNull: ["$$coApplicant.coApplicantCibilReport", ""] }
                                }
                              },
                              [{ $ifNull: ["$customerCibildetails.coApplicantCibilReport", ""] }]
                            ]
                          },
                          as: "report",
                          cond: { $ne: ["$$report", ""] }
                        }
                      },
                      else: {
                        $filter: {
                          input: [{ $ifNull: ["$customerCibildetails.coApplicantCibilReport", ""] }],
                          as: "report",
                          cond: { $ne: ["$$report", ""] }
                        }
                      }
                    }
                  },
                  guarantorPdf: { $ifNull: ["$customerCibildetails.guarantorCibilReport", ""] }
                },
                applicantDetails: {
                  customerId: "$applicantDetails.customerId",
                  fullName: "$applicantDetails.fullName",
                  fatherName: "$applicantDetails.fatherName",
                  mobileNo: "$applicantDetails.mobileNo"
                }
              }
            },
            {
              $match: searchQuery ? {
                $or: [
                  { "customerdetails.customerFinId": { $regex: searchQuery, $options: "i" } },
                  { "applicantDetails.fullName": { $regex: searchQuery, $options: "i" } },
                  { "applicantDetails.fatherName": { $regex: searchQuery, $options: "i" } },
                  { "branchDetails.name": { $regex: searchQuery, $options: "i" } },
                  { "applicantDetails.mobileNo": searchQuery ? parseInt(searchQuery) || searchQuery : null }
                ]
              } : {}
            },
            { $skip: skip },
            { $limit: parseInt(limit) }
          ],
          totalPages: [
            { $count: "count" },
            {
              $project: {
                pages: {
                  $ceil: {
                    $divide: ["$count", { $toDouble: limit }]
                  }
                }
              }
            }
          ]
        }
      }
    ];

    const selectedPipeline = (filterType === 'branchpendency' || filterType === 'creditPd') ? pipeline1 : pipeline;
    // Use the selected pipeline for aggregation
    const result = await externalVendorModel.aggregate(selectedPipeline);


    const items = {
      totalCases: result[0].totalCases[0]?.count || 0,
      total_rcu: 0,
      total_technical: 0,
      total_legal: 0,
      total_rm: 0,
      total_branch: 0,
      total_tagging: 0,
      total_other: 0,
      total_CREDITPD: 0,
      total_TLPD: 0,
      RCU: initStatusCounts(),
      TECHNICAL: initStatusCounts(),
      LEGAL: initStatusCounts(),
      OTHER: initStatusCounts(),
      RM: initStatusCounts(),
      TAGGING: initStatusCounts(),

      BRANCH: initStatusCountsWithIncomplete(),
      CREDITPD: initStatusCountsWithIncomplete(),
      TLPD: initStatusCountsWithIncomplete()
    };


    result[0].vendorStats.forEach(stat => {
      const type = stat._id.type?.toUpperCase();
      const status = stat._id.status;
      const count = stat.count;

      if (type && items[type]) {
        items[`total_${type.toLowerCase()}`] += count;
        if (items[type][status] !== undefined) {
          items[type][status] = count;
        }
      }
    });

    processPdStats(result[0].creditPdStats, items.CREDITPD, 'total_CREDITPD', items);
    processPdStats(result[0].branchStatus, items.BRANCH, 'total_branch', items);
    processPdStats(result[0].tlPdStats, items.TLPD, 'total_TLPD', items);

    return success(res, "all data", {
      ...items,
      allData: result[0].allData,
      pagination: {
        currentPage: parseInt(page),
        totalPages: result[0].totalPages[0]?.pages || 0,
        totalRecords: result[0].totalCases[0]?.count || 0,
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error(err);
    return unknownError(res, err);
  }
}
async function externalManagerHistory(req, res) {
  try {
    // 1. Get page & limit from query params (or set defaults)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 2. Define your main pipeline (up to the projection stage)
    const pipeline = [
      // 1) Unwind the 'vendors' array
      { $unwind: "$vendors" },

      // 2) Match documents where statusByVendor = "approve" or "complete"
      {
        $match: {
          "vendors.statusByVendor": { $in: ["approve", "complete"] },
        },
      },

      // 3) Lookup (populate) vendor details from the vendor collection
      {
        $lookup: {
          from: "vendors", // the actual collection name for your vendor documents
          localField: "vendors.vendorId",
          foreignField: "_id",
          as: "vendorInfo",
          pipeline: [
            {
              $project: {
                _id: 1,
                fullName: 1,
                contact: 1,
                email: 1,
                rate: 1
              }
            }
          ]
        },
      },

      // 4) Unwind 'vendorInfo'
      {
        $unwind: {
          path: "$vendorInfo",
          preserveNullAndEmptyArrays: true
        },
      },

      // 5) Project fields you want
      {
        $project: {
          _id: 1,
          customerId: 1,
          vendorData: "$vendors",
          vendorInfo: 1,
        },
      },
    ];

    // 3. Apply a $facet stage for pagination and total count
    const facetPipeline = [
      ...pipeline,
      {
        $facet: {
          // Stage A: Count how many documents remain after the pipeline above
          metadata: [
            { $count: "total" },
          ],
          // Stage B: Paginate (skip & limit)
          data: [
            { $skip: skip },
            { $limit: limit },
          ],
        },
      },
    ];

    // 4. Execute the aggregation
    const [facetResult] = await externalVendorModel.aggregate(facetPipeline);

    // facetResult looks like:
    // [
    //   {
    //     metadata: [ { total: 123 } ],
    //     data: [ ...paginatedDocs... ]
    //   }
    // ]

    // 5. Extract pagination info & data
    const totalDocs = facetResult.metadata?.[0]?.total || 0;
    const totalPages = Math.ceil(totalDocs / limit);
    const data = facetResult.data || [];

    // 6. Return the result with pagination info
    return success(res, "all data", {
      page,
      limit,
      totalDocs,
      totalPages,
      data,
    });
  } catch (err) {
    console.error(err);
    return unknownError(res, err);
  }
}




function initStatusCounts() {
  return {
    complete: 0,
    pending: 0,
    reject: 0,
    approve: 0,
    WIP: 0,
    notRequired: 0,
    notAssign: 0
  };
}

function initStatusCountsWithIncomplete() {
  return {
    ...initStatusCounts(),
    incomplete: 0
  };
}

function processPdStats(stats, target, totalKey, items) {
  stats.forEach(stat => {
    if (stat._id && target[stat._id] !== undefined) {
      target[stat._id] = stat.count;
      items[totalKey] += stat.count;
    }
  });
}









// async function externalManagerDashboardTest(req, res) {
//   try {
//     const { filterType, filterStatus, showRejected ,page = 1, limit = 50  } = req.query;
//     const tab = showRejected ? JSON.parse(showRejected) : false;

//     const matchConditions = {
//       fileStatus: "active",
//       $expr: {
//         $and: [
//           {
//             $cond: {
//               if: { $and: [{ $ne: [filterType, null] }, { $ne: [filterType, ""] }, { $ne: [filterStatus, null] }, { $ne: [filterStatus, ""] }] },
//               then: {
//                 $anyElementTrue: {
//                   $map: {
//                     input: "$vendors",
//                     as: "vendor",
//                     in: {
//                       $and: [
//                         { $eq: ["$$vendor.vendorType", filterType] },
//                         { $eq: ["$$vendor.statusByVendor", filterStatus] }
//                       ]
//                     }
//                   }
//                 }
//               },
//               else: true
//             }
//           },
//           {
//             $cond: {
//               if: { $eq: [tab, true] },
//               then: {
//                 $anyElementTrue: {
//                   $map: {
//                     input: "$vendors",
//                     as: "vendor",
//                     in: { $eq: ["$$vendor.statusByVendor", "reject"] }
//                   }
//                 }
//               },
//               else: {
//                 $not: {
//                   $anyElementTrue: {
//                     $map: {
//                       input: "$vendors",
//                       as: "vendor",
//                       in: { $eq: ["$$vendor.statusByVendor", "reject"] }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         ]
//       }
//     };

//     const skip = (page - 1) * limit;

//     const allData2 = await externalVendorModel.aggregate([
//       { $match: matchConditions },
//       {
//         $lookup: {
//           from: "customerdetails", // Name of the customerdetails collection
//           localField: "customerId", // Field in externalVendorModel
//           foreignField: "_id", // Field in customerdetails
//           as: "customerdetails", // Output array field
//         },
//       },
//       {
//         $lookup: {
//           from: "employees", // Name of the branches collection
//           localField: "customerdetails.employeId", // Field in customerdetails collection
//           foreignField: "_id", // Field in branches collection
//           as: "employeeDetails", // Output array field
//         },
//       },
//       {
//         $lookup: {
//           from: "newbranches", // Name of the branches collection
//           localField: "employeeDetails.branchId", // Field in customerdetails collection
//           foreignField: "_id", // Field in branches collection
//           as: "branchDetails", // Output array field
//         },
//       },
//       {
//         $lookup: {
//           from: "cibildetails", // Name of the customerdetails collection
//           localField: "customerId", // Field in externalVendorModel
//           foreignField: "customerId", // Field in customerdetails
//           as: "customerCibildetails", // Output array field
//         },
//       },
//       {
//         $unwind: {
//           path: "$customerCibildetails",
//           preserveNullAndEmptyArrays: true, // Preserve document if there's no matching branchDetails
//         },
//       },
//       {
//         $unwind: {
//           path: "$branchDetails",
//           preserveNullAndEmptyArrays: true, // Preserve document if there's no matching branchDetails
//         },
//       },
//       {
//         $lookup: {
//           from: "applicantdetails", // Name of the applicantdetails collection
//           localField: "customerId", // Field in externalVendorModel
//           foreignField: "customerId", // Field in applicantdetails
//           as: "applicantDetails", // Output array field
//         },
//       },
//       {
//         $unwind: {
//           path: "$applicantDetails",
//           preserveNullAndEmptyArrays: true, // Preserve document if there's no matching applicantDetails
//         },
//       },
//       {
//         $unwind: {
//           path: "$customerdetails",
//           preserveNullAndEmptyArrays: true, // Preserve document if there's no matching customerdetails
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           externalVendorId: 1,
//           creditPdId: 1,
//           statusByCreditPd: 1,
//           tlPdId: 1,
//           statusByTlPd: 1,
//           partnerNameId: 1,
//           // branchNameId: 1,
//           remarkForBranch: 1,
//           branchStatus: 1,
//           branchEmployeeId: 1,
//           vendors: {
//             vendorId: 1,
//             vendorType: 1,
//             statusByVendor: 1,
//             approverRemark: 1,
//             statusByVendor: 1,
//             remarkByVendor: 1,
//             approverDate: 1,
//             reason: 1,
//           },
//           remarkForHo: 1,
//           hoEmployeeId: 1,
//           hoStatus: 1,
//           status: 1,
//           createdAt: 1,
//           updatedAt: 1,
//           "branchDetails._id": 1,
//           // "branchDetails.branch": 1
//           "branchDetails.name": 1,
//           "employeeDetails.branchId": 1,
//           "employeeDetails.userName": 1,
//           "employeeDetails.employeName": 1,
//           "customerdetails.customerFinId": 1, // Include only customerFinId from customerdetails
//           "customerdetails._id": 1,
//           "applicantDetails.mobileNo": 1, // Include selected fields from applicantDetails
//           "applicantDetails.fullName": 1,
//           "applicantDetails.fatherName": 1,
//           "applicantDetails.customerId": 1,
//           customerCibildetails: {
//             applicantPdf: { $ifNull: ["$customerCibildetails.applicantCibilReport", ""] },
//             coApplicantPdf: {
//               $cond: {
//                 if: { $isArray: "$customerCibildetails.coApplicantData" }, // Check if coApplicantData is an array
//                 then: {
//                   $filter: {
//                     input: {
//                       $concatArrays: [
//                         {
//                           $map: {
//                             input: "$customerCibildetails.coApplicantData", // Input array
//                             as: "coApplicant", // Alias each element as coApplicant
//                             in: { $ifNull: ["$$coApplicant.coApplicantCibilReport", ""] } // Extract coApplicantCibilReport or return empty string
//                           }
//                         },
//                         [
//                           { $ifNull: ["$customerCibildetails.coApplicantCibilReport", ""] }
//                         ]
//                       ]
//                     },
//                     as: "report",
//                     cond: { $ne: ["$$report", ""] } // Filter out empty strings
//                   }
//                 },
//                 else: {
//                   $filter: {
//                     input: [
//                       { $ifNull: ["$customerCibildetails.coApplicantCibilReport", ""] }
//                     ],
//                     as: "report",
//                     cond: { $ne: ["$$report", ""] } // Filter out empty strings
//                   }
//                 }
//               }
//             },
//             guarantorPdf: { $ifNull: ["$customerCibildetails.guarantorCibilReport", ""] }
//           }
//         }
//       },
//       { $skip: skip },
//       { $limit: parseInt(limit)}
//     ]);
//     const totalCases = await externalVendorModel.countDocuments({ fileStatus: "active" });
//     const totalPages = Math.ceil(totalCases / limit);

//     return success(res, "all data", { totalCases, totalPages, currentPage: parseInt(page), allData: allData2 });
//   } catch (err) {
//     console.error(err);
//     return unknownError(res, err);
//   }
// }





async function allVendorCasesList(req, res) {
  try {
    const { vendorType, vendorId, pdType } = req.query;

    if (!vendorType && !vendorId) {
      return res.status(400).json({
        status: false,
        message: 'Either vendorType or vendorId is required',
      });
    }

    let vendorList = [];

    if (vendorType) {
      // Case 1: If vendorType is provided, fetch the vendor data based on vendorType
      vendorList = await vendorModel.aggregate([
        {
          $lookup: {
            from: "vendortypes",
            localField: "vendorType",
            foreignField: "_id",
            as: "vendorTypeDetail"
          }
        },
        { $unwind: "$vendorTypeDetail" },
        {
          $match: {
            "vendorTypeDetail.vendorType": vendorType
          }
        },
        {
          $lookup: {
            from: "externalvendordynamics",
            localField: "_id",
            foreignField: "vendors.vendorId",
            as: "assignedForms"
          }
        },
        {
          $addFields: {
            totalForm: { $size: "$assignedForms" },
          }
        },
        {
          $project: {
            _id: 1,
            fullName: 1,
            vendorTypeDetail: {
              vendorType: "$vendorTypeDetail.vendorType"
            },
            totalForm: 1,
          }
        }
      ]);

      return success(res, `All vendors by vendorType`, vendorList);
    } else if (vendorId) {
      // Case 2: If vendorId is provided, fetch vendor data by vendorId and count forms by status
      vendorList = await externalVendorModel.aggregate([
        {
          $match: {
            "vendors.vendorId": new mongoose.Types.ObjectId(vendorId) // Match specific vendorId
          }
        },
        {
          $unwind: "$vendors" // Unwind the vendors array
        },
        {
          $match: {
            "vendors.vendorId": new mongoose.Types.ObjectId(vendorId) // Filter again after unwinding
          }
        },
        {
          $group: {
            _id: "$vendors.vendorId",
            totalForms: { $sum: 1 },
            complete: {
              $sum: {
                $cond: [{ $eq: ["$vendors.statusByVendor", "complete"] }, 1, 0]
              }
            },
            wip: {
              $sum: {
                $cond: [{ $eq: ["$vendors.statusByVendor", "WIP"] }, 1, 0]
              }
            },
            pending: {
              $sum: {
                $cond: [{ $eq: ["$vendors.statusByVendor", "pending"] }, 1, 0]
              }
            },
            reject: {
              $sum: {
                $cond: [{ $eq: ["$vendors.statusByVendor", "reject"] }, 1, 0]
              }
            }
          }
        },
        {
          $project: {
            vendorId: "$_id",
            totalForms: 1,
            complete: 1,
            wip: 1,
            pending: 1,
            reject: 1,
          }
        }
      ]);

      return success(res, `Vendor counts by vendorId`, vendorList);
    } else if (pdType) {

      // Case 1: If pdType is provided, fetch the pd data based on pdType
      vendorList = await employeeModel.aggregate([
        {
          $lookup: {
            from: "roles",
            localField: "roleId",
            foreignField: "_id",
            as: "roleDetails"
          }
        },
        { $unwind: "$vendorTypeDetail" },
        {
          $match: {
            "vendorTypeDetail.vendorType": vendorType
          }
        },
        {
          $lookup: {
            from: "externalvendordynamics",
            localField: "_id",
            foreignField: "vendors.vendorId",
            as: "assignedForms"
          }
        },
        {
          $addFields: {
            totalForm: { $size: "$assignedForms" },
          }
        },
        {
          $project: {
            _id: 1,
            fullName: 1,
            vendorTypeDetail: {
              vendorType: "$vendorTypeDetail.vendorType"
            },
            totalForm: 1,
          }
        }
      ]);

      return success(res, `All vendors by vendorType`, vendorList);
    }
  } catch (err) {
    console.error(err);
    return unknownError(res, err);
  }
}


// async function AllVendorsFormShowList(req, res) {
//   try {
//     const vendorId = req.Id;
//     const { status, employeeRole } = req.query;

//     if (!status) {
//       return badRequest(res, "status is required");
//     }

//     if (!employeeRole) {
//       return badRequest(res, "vendor role  is required");
//     }
//     if (!["pending", "WIP", "complete", "reject", "approve"].includes(status)) {
//       return badRequest(res, "not a valid status");
//     }

//     let statusQuery;
//     if (status === 'complete') {
//       // If the status is 'complete', allow multiple status values
//       statusQuery = { $in: ["approve", "complete", "reject"] };
//     } else {
//       // Otherwise, just match the exact status
//       statusQuery = status;
//     }

//     // Fetch vendors based on vendorId and status
//     const vendorsList = await externalVendorModel
//       .find({
//         fileStatus: "active",
//         "vendors": {
//           $elemMatch: {
//             "vendorId": vendorId,
//             "vendorType": employeeRole,
//             "statusByVendor": statusQuery,
//           },
//         },
//       })
//       .populate('vendors.vendorId', "_id userName fullName") // Populate vendor details
//       .populate('partnerNameId branchNameId') // Populate partner and branch details
//       .exec();

//     // Loop through vendorsList to fetch related customer and applicant details
//     const results = await Promise.all(
//       vendorsList.map(async (vendor) => {
//         const customerId = vendor.customerId; // Assuming customerId is in the vendor document

//         // Fetch customer data from customerModel
//         const customerData = await customerModel.findById(customerId).select('_id customerFinId branch'); // Select the required fields from customer
//         // const getBranch = await externalBranchModel.findById(customerData.branch)
//         // console.log('customerData',customerData)

//         // Fetch applicant details from applicantModel
//         const applicantData = await applicantModel.findOne({ customerId }).select('_id applicantPhoto fullName email fatherName mobileNo permanentAddress '); // Select applicant's name and image
//         const coApplicantData = await coapplicantModel.findOne({ customerId }).select('_id fullName email fatherName mobileNo permanentAddress ');
//         const guarantorData = await guarantorModel.findOne({ customerId }).select('_id fullName email fatherName mobileNo permanentAddress ');

//         return {
//           ...vendor._doc, // Spread vendor data
//           // customerData,   // Attach customer data
//           customerFinId: customerData?.customerFinId ? customerData?.customerFinId : '',
//           applicantName: applicantData?.fullName ? applicantData?.fullName : '',
//           applicantEmail: applicantData?.email ? applicantData?.email : '',
//           applicantImage: applicantData?.applicantPhoto ? applicantData.applicantPhoto : '',
//           applicantFatherName: applicantData?.fatherName ? applicantData.fatherName : '',
//           applicantMobileNo: applicantData?.mobileNo ? applicantData.mobileNo : '',
//           applicantPermanentAddress: applicantData?.permanentAddress ? applicantData.permanentAddress : '',

//           coApplicantName: coApplicantData?.fullName ? coApplicantData?.fullName : '',
//           coApplicantEmail: coApplicantData?.email ? coApplicantData?.email : '',
//           coApplicantFatherName: coApplicantData?.fatherName ? coApplicantData.fatherName : '',
//           coApplicantMobileNo: coApplicantData?.mobileNo ? coApplicantData.mobileNo : '',
//           coApplicantPermanentAddress: coApplicantData?.permanentAddress ? coApplicantData.permanentAddress : '',

//           guarantorName: guarantorData?.fullName ? guarantorData?.fullName : '',
//           guarantorEmail: guarantorData?.email ? guarantorData?.email : '',
//           guarantorFatherName: guarantorData?.fatherName ? guarantorData.fatherName : '',
//           guarantorMobileNo: guarantorData?.mobileNo ? guarantorData.mobileNo : '',
//           guarantorPermanentAddress: guarantorData?.permanentAddress ? guarantorData.permanentAddress : '',

//           // customerBranch :getBranch?.branch?getBranch?.branch:'',
//           // Attach applicant data
//         };
//       })
//     );

//     // Return the result with both vendor and customer/applicant data
//     return success(res, `Vendors Form Assign In ${status}`, results);

//   } catch (error) {
//     console.error(error);
//     return unknownError(res, error);
//   }
// }


async function AllVendorsFormShowList(req, res) {
  try {
    const vendorId = req.Id;
    const { status, employeeRole, page = 1, limit = 500, searchQuery } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Validation checks
    if (!status) {
      return badRequest(res, "status is required");
    }
    if (!employeeRole) {
      return badRequest(res, "vendor role is required");
    }
    if (!["pending", "WIP", "complete", "reject", "approve"].includes(status)) {
      return badRequest(res, "not a valid status");
    }

    let statusQuery;
    if (status === 'complete') {
      statusQuery = { $in: ["approve", "complete", "reject"] };
    } else {
      statusQuery = status;
    }

    // Base query
    let baseQuery = {
      fileStatus: "active",
      "vendors": {
        $elemMatch: {
          "vendorId": vendorId,
          "vendorType": employeeRole,
          "statusByVendor": statusQuery,
        },
      },
    };

    // Get total count first
    const totalCount = await externalVendorModel.countDocuments(baseQuery);

    // Fetch vendors with pagination
    const vendorsList = await externalVendorModel
      .find(baseQuery)
      .populate('vendors.vendorId', "_id userName fullName")
      .populate('partnerNameId branchNameId')
      .skip(skip)
      .limit(parseInt(limit))
      .exec();

    // Process results with search
    let results = await Promise.all(
      vendorsList.map(async (vendor) => {
        const customerId = vendor.customerId;

        const customerData = await customerModel.findById(customerId).select('_id customerFinId branch');

        const applicantData = await applicantModel.findOne({ customerId }).select('_id applicantPhoto fullName email fatherName mobileNo permanentAddress');
        const coApplicantData = await coapplicantModel.findOne({ customerId }).select('_id fullName email fatherName mobileNo permanentAddress');
        const guarantorData = await guarantorModel.findOne({ customerId }).select('_id fullName email fatherName mobileNo permanentAddress');

        return {
          ...vendor._doc,
          customerFinId: customerData?.customerFinId || '',
          applicantName: applicantData?.fullName || '',
          applicantEmail: applicantData?.email || '',
          applicantImage: applicantData?.applicantPhoto || '',
          applicantFatherName: applicantData?.fatherName || '',
          applicantMobileNo: applicantData?.mobileNo || '',
          applicantPermanentAddress: applicantData?.permanentAddress || '',
          coApplicantName: coApplicantData?.fullName || '',
          coApplicantEmail: coApplicantData?.email || '',
          coApplicantFatherName: coApplicantData?.fatherName || '',
          coApplicantMobileNo: coApplicantData?.mobileNo || '',
          coApplicantPermanentAddress: coApplicantData?.permanentAddress || '',
          guarantorName: guarantorData?.fullName || '',
          guarantorEmail: guarantorData?.email || '',
          guarantorFatherName: guarantorData?.fatherName || '',
          guarantorMobileNo: guarantorData?.mobileNo || '',
          guarantorPermanentAddress: guarantorData?.permanentAddress || '',
        };
      })
    );

    // Apply search filter if searchQuery exists
    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, 'i');
      results = results.filter(item =>
        (item.customerFinId && item.customerFinId.match(searchRegex)) ||
        (item.applicantName && item.applicantName.match(searchRegex)) ||
        (item.applicantMobileNo && item.applicantMobileNo.toString().match(searchRegex))
      );
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    // return success(res, `Vendors Form Assign In ${status}`, {
    //   items: results,
    //   pagination: {
    //     currentPage: parseInt(page),
    //     totalPages,
    //     totalItems: totalCount,
    //     itemsPerPage: parseInt(limit)
    //   }
    // });

    return success(res, `Vendors Form Assign List`, results)
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


async function SortCustomer(employeeId) {
  let branchIds = [];
  let employeeIds = [];
  const findEmployeeData = await employeeModel.find({ _id: employeeId });
  const Id = '673ef4ef1c600b445add496a'
  if (findEmployeeData[0]?.branchId == Id) {
    branchIds.push(new ObjectId(Id));
  }


  const childBranches = await NewbranchModel.find({ regionalBranchId: new ObjectId(Id) })
    .select('_id');
  branchIds.push(...childBranches.filter(branch => findEmployeeData[0]?.branchId == branch.id));

  const employee = await employeeModel.find({ branchId: { $in: branchIds } }).select('_id');
  employeeIds = employee.map(emp => emp._id);

  const customers = await customerModel.find({ employeId: { $in: employeeIds } }).select('_id');
  const customerIds = customers.map(customer => customer._id);
  return customerIds;

}


async function SortCustomerInProcess(employeeIdList) {
  let data = await processModel.find({ employeId: { $in: employeeIdList } }).select("customerId").lean()
  let returnData = data.map(emp => emp.customerId);

  return returnData;

}



async function AllFileApproveRejectList(req, res) {
  try {
    const { status, page = 1, limit = 50, vendorType = 'all', customerId, searchQuery = '' } = req.query;

    if (!status) {
      return badRequest(res, "status is required");
    }

    const validStatuses = ["WIP", "approve", "complete", "reject"];
    if (!validStatuses.includes(status)) {
      return badRequest(res, "not a valid status");
    }

    const SortedEmployeeList = await SortEmployee(req.Id);
    let sortedCustomerIds = await SortCustomerInProcess(SortedEmployeeList);

    let matchCondition = {};

    if (vendorType === 'all') {
      matchCondition.$or = [
        { "vendors.statusByVendor": status === 'approve' ? { $in: ['complete', 'approve'] } : status },
        {
          "statusByCreditPd": status === 'reject'
            ? { $in: ['reject', 'rejectByApprover'] }
            : status === 'approve'
              ? { $in: ['approve', 'complete'] }
              : status
        },
      ];
    } else if (vendorType === 'creditPd') {
      matchCondition.statusByCreditPd = status === 'reject'
        ? { $in: ['reject', 'rejectByApprover'] }
        : status;
    } else {
      matchCondition.$and = [
        { "vendors.vendorType": vendorType },
        { "vendors.statusByVendor": status }
      ];
    }

    if (customerId) {
      matchCondition._id = customerId;
    } else if (sortedCustomerIds.length > 0) {
      matchCondition.customerId = { $in: sortedCustomerIds };
    }

    const pipeline = [
      { $match: matchCondition },
      {
        $lookup: {
          from: 'employees',
          let: { creditPdId: '$creditPdId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$creditPdId'] }
              }
            },
            {
              $project: {
                _id: 1,
                employeName: 1,
                userName: 1
              }
            }
          ],
          as: 'employeeData'
        }
      },
      {
        $lookup: {
          from: 'customerdetails',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customerData'
        }
      },
      {
        $lookup: {
          from: 'applicantdetails',
          localField: 'customerId',
          foreignField: 'customerId',
          as: 'applicantData'
        }
      },
      {
        $lookup: {
          from: 'vendors',
          localField: 'vendors.vendorId',
          foreignField: '_id',
          as: 'vendorDetails'
        }
      },
      {
        $lookup: {
          from: 'lender partners',
          localField: 'partnerNameId',
          foreignField: '_id',
          as: 'partnerData'
        }
      },
      {
        $lookup: {
          from: 'newbranches',
          localField: 'branchNameId',
          foreignField: '_id',
          as: 'branchData'
        }
      }
    ];

    if (searchQuery) {
      pipeline.push({
        $match: {
          $or: [
            { 'customerData.customerFinId': { $regex: searchQuery, $options: 'i' } },
            { 'applicantData.fullName': { $regex: searchQuery, $options: 'i' } },
            { 'branchData.name': { $regex: searchQuery, $options: 'i' } }
          ]
        }
      });
    }
    // Get all results without pagination first
    const results = await externalVendorModel.aggregate(pipeline);

    // Transform all results
    const allTransformedResults = await Promise.all(
      results.map(async (vendor) => {
        const customerData = vendor?.customerData?.[0] || {};
        const applicantData = vendor?.applicantData?.[0] || {};

        const baseResult = {
          _id: vendor._id,
          customerId: vendor.customerId,
          partnerNameId: {
            partnerName: vendor.partnerData?.[0]?.partnerName || '',
          },
          branchNameId: {
            name: vendor.branchData?.[0]?.name || ''
          },
          customerFinId: customerData?.customerFinId || '',
          applicantName: applicantData?.fullName || '',
          applicantEmail: applicantData?.email || '',
          applicantImage: applicantData?.applicantPhoto || ''
        };

        const resultArray = [];

        // Handle regular vendors
        if (vendor.vendors && (vendorType === 'all' || vendorType !== 'creditPd')) {
          vendor.vendors
            .filter(v => {
              if (vendorType === 'all') {
                return v.statusByVendor === status;
              }
              return v.statusByVendor === status && v.vendorType === vendorType;
            })
            .forEach(vendorItem => {
              const vendorDetail = vendor.vendorDetails?.find(
                v => v?._id?.toString() === vendorItem?.vendorId?.toString()
              ) || {};

              resultArray.push({
                ...baseResult,
                ...vendorItem,
                vendorId: vendorDetail ? {
                  _id: vendorDetail._id || '',
                  userName: vendorDetail.userName || '',
                  fullName: vendorDetail.fullName || ''
                } : {}
              });
            });
        }

        // Handle creditPd type
        if (
          vendor.creditPdId &&
          vendor.statusByCreditPd === status &&
          (vendorType === 'all' || vendorType === 'creditPd')
        ) {
          const employeeDetail = vendor.employeeData?.[0] || {};
          const pdDetail = await pdModel.findOne({ customerId: vendor.customerId });

          resultArray.push({
            ...baseResult,
            vendorType: "creditPd",
            vendorId: {
              _id: employeeDetail._id || '',
              employeName: employeeDetail.employeName || '',
              userName: employeeDetail.userName || ''
            },
            approverRemark: vendor.approvalRemarkcreditPd || '',
            videoUpload: pdDetail?.videoUpload || '',
            approverDate: vendor.creditPdApprovarDate || '',
            uploadProperty: vendor.pdfCreateByCreditPd || [],
            remarkByVendor: vendor.remarkByCreditPd || '',
            vendorStatus: vendor.statusByCreditPd || ''
          });
        }

        return resultArray;
      })
    );

    const flattenedResults = allTransformedResults.flat();

    // Apply pagination to transformed results
    const totalRecords = flattenedResults.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedResults = flattenedResults.slice(startIndex, endIndex);
    const totalPages = Math.ceil(totalRecords / limit);

    return success(res, `File ${status} List`, {
      results: paginatedResults,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalRecords,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}



async function fileApprovedReject(req, res) {
  try {
    // console.log('fileApprovedReject')
    const { customerId, vendorId, status, approverRemark, vendorType, documentName } = req.query;
    const approverDate = new Date().toString().split(' ').slice(0, 5).join(' ');

    const tokenId = new ObjectId(req.Id)
    if (!customerId) {
      return badRequest(res, "Customer ID is required");
    }

    const customerDetail = await customerModel.findById(customerId)
    if (!["approve", "reject"].includes(status)) {
      return badRequest(res, "Not a valid status. Only 'approve' or 'reject' allowed");
    }

    if (vendorType === 'branchPendency' && !documentName) {
      return badRequest(res, "Document Name Required");
    }

    const vendorData = await externalVendorModel.findOne({ customerId });
    if (!vendorData) {
      return notFound(res, "Form Not Found for the given Customer ID");
    }

    if (["rcu", "legal", "rm", "tagging", "other", "technical"].includes(vendorType)) {
      const updatedVendors = vendorData.vendors.map(vendor => {
        if (vendor.vendorType && vendor.vendorType.toString() === vendorType) {
          vendor.statusByVendor = status;
          vendor.approverRemark = approverRemark;
          vendor.approverDate = approverDate;
          vendor.approverEmployeeId = tokenId
        }
        return vendor;
      });

      vendorData.vendors = updatedVendors;
      await vendorData.save();

      const updatedVendor = updatedVendors.find(v => v.vendorType && v.vendorType.toString() === vendorType);

      if (!updatedVendor) {
        return notFound(res, "Vendor with the specified ID was not found after update.");
      }

      const response = {
        customerId: vendorData.customerId,
        partnerNameId: vendorData.partnerNameId,
        branchNameId: vendorData.branchNameId,
        pdfRemark: updatedVendor.pdfRemark,
        externalVendorRemark: updatedVendor.externalVendorRemark,
        vendorType: updatedVendor.vendorType,
        vendorId: updatedVendor.vendorId,
        assignDocuments: updatedVendor.assignDocuments,
        uploadProperty: updatedVendor.uploadProperty,
        remarkByVendor: updatedVendor.remarkByVendor,
        statusByVendor: updatedVendor.statusByVendor,
        reason: updatedVendor.reason,
        approverRemark: updatedVendor.approverRemark,
        approverDate: updatedVendor.approverDate,
        vendorUploadDate: updatedVendor.vendorUploadDate,
        vendorStatus: updatedVendor.vendorStatus,
      };

      success(res, `${vendorType} File ${status} Succeesfully`);
      return await RcuGoogleSheet(vendorData.customerId, vendorType)

    } else if (vendorType === "branchPendency") {
      const { branchRequiredDocument } = vendorData;
      let updatedDocumentStatus = null;
      switch (documentName) {
        case "bankStatment":
          branchRequiredDocument.bankStatment = status;
          updatedDocumentStatus = branchRequiredDocument.bankStatment;
          break;
        case "incomeDocument1":
          branchRequiredDocument.incomeDocument1 = status;
          updatedDocumentStatus = branchRequiredDocument.incomeDocument1;
          break;
        case "incomeDocument2":
          branchRequiredDocument.incomeDocument2 = status;
          updatedDocumentStatus = branchRequiredDocument.incomeDocument2;
          break;
        case "agriIncomePavtiAndBill":
          branchRequiredDocument.agriIncomePavtiAndBill = status;
          updatedDocumentStatus = branchRequiredDocument.agriIncomePavtiAndBill;
          break;
        case "propertyDocument":
          branchRequiredDocument.propertyDocument = status;
          updatedDocumentStatus = branchRequiredDocument.propertyDocument;
          break;
        default:
          return error(res, "Invalid document name provided");
      }

      vendorData.branchApproverRemark = approverRemark;
      await vendorData.save();
      const response = {
        customerId: vendorData.customerId,
        partnerNameId: vendorData.partnerNameId,
        [documentName]: updatedDocumentStatus,
      };

      // return success(res, `${documentName}  Document ${status}`);
      success(res, `${vendorType} File ${status} Succeesfully `);
    } else if (vendorType === "creditPd") {

      vendorData.statusByCreditPd = status === "approve" ? "approve" : "rejectByApprover",
        vendorData.approvalRemarkCreditPd = approverRemark
      vendorData.creditPdApprovarDate = approverDate
      vendorData.pdApproverEmployeeId = tokenId
      await vendorData.save();
      const pdFormUpdate = await pdModel.updateOne(
        { customerId },
        { $set: { status: status === "approve" ? "approve" : "rejectByApprover", approvalRemarkCreditPd: approverRemark } }
      );
      // console.log('vendorData-----',vendorData)
      success(res, `${vendorType} File ${status} Succeesfully `);
      // await addPdDataToSheet(vendorData.customerId)
    }
    vendorData.customerFinIdStr = customerDetail.customerFinId ? customerDetail.customerFinId : ''
    await externalVendorGoogleSheet(vendorData)


    if (vendorType === "rcu") {
      vendorData.rcuStatusStr = status
    } else if (vendorType === "legal") {
      vendorData.legalStatusStr = status
    } else if (vendorType === "technical") {
      vendorData.technicalStatusStr = status
    } else if (vendorType === "rm") {
      vendorData.rmStatusStr = status
    } else if (vendorType === "creditPd") {
      vendorData.pdStatusStr = status
    }
    await salesToPdAllFilesDataGoogleSheet(vendorData)

  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


// const externalVendorDynamic = require("../model/externalManager/externalVendorDynamic.model");

// const initializeMonthData = () => ({
//   reject: 0,
//   approve: 0,
//   wip: 0,
//   complete: 0,
//   rivert: 0,
// });

// // Helper function to process status into the appropriate count
// const updateStatusCount = (monthData, status) => {
//   switch (status.toLowerCase()) {
//     case 'reject':
//       monthData.reject++;
//       break;
//     case 'approve':
//       monthData.approve++;
//       break;
//     case 'wip':
//       monthData.wip++;
//       break;
//     case 'complete':
//       monthData.complete++;
//       break;
//     case 'rivert':
//       monthData.rivert++;
//       break;
//     default:
//       break;
//   }
// };

// async function intenalVendorDashboard(req, res) {
//   try {
//     const { vendorId, year } = req.query;

//     if (!vendorId || !year) {
//       // return res.status(400).send('vendorId and year are required.');
//       return badRequest(res, "vendorId and year are required.");

//     }

//     // Fetch the collection from DB based on vendorId
//     const data = await externalVendorModel.find({
//       'vendors.vendorId':new mongoose.Types.ObjectId(vendorId),
//     });

//     // Initialize response structure for months Jan to Dec
//     const months = {
//       jan: initializeMonthData(),
//       feb: initializeMonthData(),
//       mar: initializeMonthData(),
//       apr: initializeMonthData(),
//       may: initializeMonthData(),
//       jun: initializeMonthData(),
//       jul: initializeMonthData(),
//       aug: initializeMonthData(),
//       sep: initializeMonthData(),
//       oct: initializeMonthData(),
//       nov: initializeMonthData(),
//       dec: initializeMonthData(),
//     };

//     // Iterate over each document to count statuses per month
//     data.forEach((doc) => {
//       doc.vendors.forEach((vendor) => {
//         if (
//           vendor.vendorId &&
//           vendor.vendorId.toString() === vendorId &&
//           vendor.vendorUploadDate
//         ) {
//           const vendorDate = new Date(vendor.vendorUploadDate);
//           const vendorYear = vendorDate.getFullYear();

//           if (vendorYear === parseInt(year)) {
//             const month = vendorDate.getMonth(); // 0 = Jan, 11 = Dec
//             const status = vendor.statusByVendor;

//             switch (month) {
//               case 0:
//                 updateStatusCount(months.jan, status);
//                 break;
//               case 1:
//                 updateStatusCount(months.feb, status);
//                 break;
//               case 2:
//                 updateStatusCount(months.mar, status);
//                 break;
//               case 3:
//                 updateStatusCount(months.apr, status);
//                 break;
//               case 4:
//                 updateStatusCount(months.may, status);
//                 break;
//               case 5:
//                 updateStatusCount(months.jun, status);
//                 break;
//               case 6:
//                 updateStatusCount(months.jul, status);
//                 break;
//               case 7:
//                 updateStatusCount(months.aug, status);
//                 break;
//               case 8:
//                 updateStatusCount(months.sep, status);
//                 break;
//               case 9:
//                 updateStatusCount(months.oct, status);
//                 break;
//               case 10:
//                 updateStatusCount(months.nov, status);
//                 break;
//               case 11:
//                 updateStatusCount(months.dec, status);
//                 break;
//               default:
//                 break;
//             }
//           }
//         }
//       });
//     });

//     // Calculate the total counts for the year
//     const total = Object.values(months).reduce(
//       (acc, month) => {
//         acc.reject += month.reject;
//         acc.approve += month.approve;
//         acc.wip += month.wip;
//         acc.complete += month.complete;
//         acc.rivert += month.rivert;
//         return acc;
//       },
//       initializeMonthData()
//     );

//     const totalCount =
//       total.reject + total.approve + total.wip + total.complete + total.rivert;

//     success(res, "Here are your StatusByVendor details", {
//       months,
//       year_total: {
//         year: year,
//         data: total,
//         total: totalCount, // Added totalCount here

//       },
//     });
//   } catch (error) {
//     console.log(error);
//     return unknownError(res, error);
//   }
// };


const initializeMonthData = () => ({
  reject: 0,
  approve: 0,
  wip: 0,
  complete: 0,
  rivert: 0,
});

const updateStatusCount = (monthData, status) => {
  switch (status) {
    case 'reject':
      monthData.reject++;
      break;
    case 'approve':
      monthData.approve++;
      break;
    case 'WIP':
      monthData.wip++;
      break;
    case 'complete':

      monthData.complete++;   // Counts approve
      // monthData.reject+approve+complete++;  // Counts complete
      // monthData.complete ++;// For 'complete' itself
      // monthData.complete += monthData.approve; // Adding approve count
      //   monthData.complete += monthData.reject; 

      // monthData.complete += (+monthData.approve + monthData.reject); 
      //       console.log("www", monthData.complete);
      //       console.log("sagar",monthData.approve );
      //       console.log("samediya", monthData.reject);

      //        monthData.complete = (parseInt(monthData.complete) + parseInt(monthData.approve) + parseInt(monthData.reject)); 
      // console.log("ssd",monthData.complete)

      // monthData.reject++;    // Counts reject as well

      break;
    case 'rivert':
      monthData.rivert++;
      break;
    default:
      break;
  }
};

async function intenalVendorDashboard(req, res) {
  try {
    const { vendorId, year } = req.query;

    if (!vendorId || !year) {
      return res.status(400).json({ message: "vendorId and year are required." });
    }

    const data = await externalVendorModel.find({
      'vendors.vendorId': new mongoose.Types.ObjectId(vendorId),
    });

    const months = {
      jan: initializeMonthData(),
      feb: initializeMonthData(),
      mar: initializeMonthData(),
      apr: initializeMonthData(),
      may: initializeMonthData(),
      jun: initializeMonthData(),
      jul: initializeMonthData(),
      aug: initializeMonthData(),
      sep: initializeMonthData(),
      oct: initializeMonthData(),
      nov: initializeMonthData(),
      dec: initializeMonthData(),
    };

    data.forEach((doc) => {
      doc.vendors.forEach((vendor) => {
        if (vendor.vendorId && vendor.vendorId.toString() === vendorId) {
          let dateField;
          let status = vendor.statusByVendor;

          // if (status === 'WIP' && vendor.assignDate) {
          //   dateField = new Date(vendor.assignDate);
          if (status === 'WIP' && vendor.assignDate) {
            dateField = new Date(vendor.assignDate);
          } else if (status === 'complete' && vendor.vendorUploadDate) {
            dateField = new Date(vendor.vendorUploadDate);
          } else if ((status === 'approve' || status === 'reject') && vendor.approverDate) {
            dateField = new Date(vendor.approverDate);
          }

          if (dateField && dateField.getFullYear() === parseInt(year)) {
            const month = dateField.getMonth();

            switch (month) {
              case 0: updateStatusCount(months.jan, status); break;
              case 1: updateStatusCount(months.feb, status); break;
              case 2: updateStatusCount(months.mar, status); break;
              case 3: updateStatusCount(months.apr, status); break;
              case 4: updateStatusCount(months.may, status); break;
              case 5: updateStatusCount(months.jun, status); break;
              case 6: updateStatusCount(months.jul, status); break;
              case 7: updateStatusCount(months.aug, status); break;
              case 8: updateStatusCount(months.sep, status); break;
              case 9: updateStatusCount(months.oct, status); break;
              case 10: updateStatusCount(months.nov, status); break;
              case 11: updateStatusCount(months.dec, status); break;
              default: break;
            }
          }
        }
      });
    });
    // Correctly calculate 'complete' status as the sum of itself, approve, and reject for each month
    Object.values(months).forEach((monthData) => {
      monthData.complete = monthData.complete + monthData.approve + monthData.reject;
    });



    const total = Object.values(months).reduce(
      (acc, month) => {
        acc.reject += month.reject;
        acc.approve += month.approve;
        acc.wip += month.wip;
        acc.complete += month.complete;
        acc.rivert += month.rivert;
        return acc;
      },
      initializeMonthData()
    );

    const totalCount = total.reject + total.approve + total.wip + total.complete + total.rivert;

    res.status(200).json({
      message: "Here are your StatusByVendor details",
      data: {
        months,
        year_total: {
          year: year,
          data: total,
          total: totalCount,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An unknown error occurred", error });
  }
}


// Function to get vendor data by customerId
async function getVendorDataByCustomerId(req, res) {
  try {
    // Step 1: Find external vendor data by customerId
    const externalVendorData = await externalVendorModel.findOne({
      customerId: req.query.customerId,
    });

    if (!externalVendorData) {
      return badRequest(res, 'No matching entry found for the given customerId');
    }

    // Extract creditPdId and vendors from the external data
    const { creditPdId, branchEmployeeId, vendors } = externalVendorData;

    // Extract all vendor IDs from the vendors array
    const vendorIds = vendors.map((vendor) => vendor.vendorId).filter(Boolean);

    // Step 2: Fetch creditPdId details from vendorModel (if present)
    const creditPdDetail = creditPdId
      ? await employeeModel.findById(creditPdId)
      : null;
    const branchVendorDetail = branchEmployeeId
      ? await employeeModel.findById(branchEmployeeId)
      : null;

    let vendorDetails = [];
    if (vendorIds.length > 0) {
      vendorDetails = await vendorModel.find({ _id: { $in: vendorIds } });
    }

    // Step 4: Create a mapping of vendorId to its details
    const vendorIdToDetails = vendorDetails.reduce((acc, vendor) => {
      acc[vendor._id] = vendor;
      return acc;
    }, {});

    // Step 5: Organize response with vendor types and detailed mapping
    const data = {
      creditPdDetail: {
        _id: creditPdDetail?._id ? creditPdDetail?._id : "",
        userName: creditPdDetail?.userName ? creditPdDetail?.userName : "",
        employeName: creditPdDetail?.employeName ? creditPdDetail?.employeName : "",
        employeUniqueId: creditPdDetail?.employeUniqueId ? creditPdDetail?.employeUniqueId : "",
      },
      branchEmployeeId: {
        _id: branchVendorDetail?._id ? branchVendorDetail?._id : "",
        userName: branchVendorDetail?.userName ? branchVendorDetail?.userName : "",
        employeName: branchVendorDetail?.employeName ? branchVendorDetail?.employeName : "",
        employeUniqueId: branchVendorDetail?.employeUniqueId ? branchVendorDetail?.employeUniqueId : "",
      },
      vendors: vendors.map((vendor) => ({
        vendorType: vendor.vendorType,
        vendorId: vendor.vendorId,
        vendorDetail: vendorIdToDetails[vendor.vendorId] || null,
      })),
    };

    // Send a successful response
    return success(res, 'Vendor Details Retrieved Successfully', data);
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


async function fileHoldList(req, res) {
  try {
    const { status } = req.query;

    if (!status || (status !== "active" && status !== "inactive")) {
      return badRequest(res, "Invalid status. Only 'active' or 'inactive' are allowed.");
    }
    const allFileData = await externalVendorModel.aggregate([
      {
        $match: {
          fileStatus: status,
        },
      },
      {
        $lookup: {
          from: "customerdetails",
          localField: "customerId",
          foreignField: "_id",
          as: "customerdetails",
        },
      },
      {
        $lookup: {
          from: "applicantdetails",
          localField: "customerId",
          foreignField: "customerId",
          as: "applicantdetails",
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "customerdetails.employeId",
          foreignField: "_id",
          as: "employeeDetails",
        },
      },
      {
        $lookup: {
          from: "newbranches",
          localField: "employeeDetails.branchId",
          foreignField: "_id",
          as: "branchDetails",
        },
      },
      {
        $unwind: {
          path: "$branchDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$applicantdetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$customerdetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          fileHoldRemark: 1,
          "branchDetails._id": 1,
          "branchDetails.name": 1,
          "customerdetails.customerFinId": 1,
          "customerdetails._id": 1,
          "applicantdetails.mobileNo": 1,
          "applicantdetails.fullName": 1,
          "applicantdetails.fatherName": 1,
          "applicantdetails.customerId": 1,
        },
      },
    ]);
    return success(res, `File ${status.charAt(0).toUpperCase() + status.slice(1)} List`, { count: allFileData.length, list: allFileData });
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


// Working //
// async function fileHoldByCustomerId(req, res) {
//   try {
//     const { status, customerId, holdRemark } = req.query;

//     if (!status || (status !== "active" && status !== "inactive")) {
//       return badRequest(res, "Invalid status. Only 'active' or 'inactive' are allowed.");
//     }

//     if (!customerId) {
//       return badRequest(res, "Customer ID is required.");
//     }

//     // Models to update
//     const modelMap = {
//       bankStatement: bankStatementModel,
//       applicantPdc: appPdcModel,
//       guarantorPdc: gtrPdcModel,
//       propertyPapersKyc: propertyPapersKycModel,
//       nachRegistration: nachRegistrationModel,
//       physicalFileCourier: physicalFileCourierModel,
//       agricultureBusiness: agricultureModel,
//       milkIncomeBusiness: milkIncomeModel,
//       salaryAndOtherIncomeBusiness: salaryAndOtherIncomeModel,
//       otherBuisness: otherBuisnessModel,
//       rmPaymentUpdate: rmPaymentUpdateModel,
//       esignPhoto: esignPhotoModel,
//     };

//     // Update main process and external vendor models
//     const processUpdate = await processModel.updateOne(
//       { customerId },
//       { $set: { fileStatus: status, fileHoldRemark: holdRemark } }
//     );

//     const externalVendorUpdate = await externalVendorModel.updateOne(
//       { customerId },
//       { $set: { fileStatus: status, fileHoldRemark: holdRemark } }
//     );

//     // Update all models in modelMap
//     await Promise.all(
//       Object.values(modelMap).map((model) =>
//         model.updateOne(
//           { customerId },
//           { $set: { fileStatus: status } }
//         )
//       )
//     );

//     return success(res, `File ${status.charAt(0).toUpperCase() + status.slice(1)} Successfully`);
//   } catch (error) {
//     console.error(error);
//     return unknownError(res, error);
//   }
// }

async function fileHoldByCustomerId(req, res) {
  try {
    const { status, customerId, holdRemark } = req.query;
    const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");
    const tokenId = req.Id

    if (!status || (status !== "active" && status !== "inactive")) {
      return badRequest(res, "Invalid status. Only 'active' or 'inactive' are allowed.");
    }

    if (!customerId) {
      return badRequest(res, "Customer ID is required.");
    }

    const customerIds = Array.isArray(customerId)
      ? customerId
      : customerId.split(",").map((id) => id.trim());


    const validCustomerIds = customerIds.filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (validCustomerIds.length !== customerIds.length) {
      return badRequest(res, "Some customer IDs are invalid.");
    }

    console.log('')

    await applicantModel.updateMany(
      { customerId: { $in: validCustomerIds } },
      { $set: { fileStatus: status } }
    );
    await coapplicantModel.updateMany(
      { customerId: { $in: validCustomerIds } },
      { $set: { fileStatus: status } }
    );
    await guarantorModel.updateMany(
      { customerId: { $in: validCustomerIds } },
      { $set: { fileStatus: status } }
    );
    await customerModel.updateMany(
      { _id: { $in: validCustomerIds } },
      { $set: { status: status } }
    );

    const processUpdate = await processModel.updateMany(
      { customerId: { $in: validCustomerIds } },
      { $set: { fileStatus: status, fileHoldRemark: holdRemark, fileHoldEmployeeId: tokenId, holdDate: todayDate, } }
    );


    const externalVendorUpdate = await externalVendorModel.updateMany(
      { customerId: { $in: validCustomerIds } },
      { $set: { fileStatus: status, fileHoldRemark: holdRemark } }
    );

    // const modelMap = {
    //   bankStatement: bankStatementModel,
    //   applicantPdc: appPdcModel,
    //   guarantorPdc: gtrPdcModel,
    //   propertyPapersKyc: propertyPapersKycModel,
    //   nachRegistration: nachRegistrationModel,
    //   physicalFileCourier: physicalFileCourierModel,
    //   agricultureBusiness: agricultureModel,
    //   milkIncomeBusiness: milkIncomeModel,
    //   salaryAndOtherIncomeBusiness: salaryAndOtherIncomeModel,
    //   otherBuisness: otherBuisnessModel,
    //   rmPaymentUpdate: rmPaymentUpdateModel,
    //   esignPhoto: esignPhotoModel,
    //   signKyc: signKycModel,
    //   otherDocument: otherDocumentModel
    // };

    // await Promise.all(
    //   Object.values(modelMap).map((model) =>
    //     model.updateMany(
    //       { customerId: { $in: validCustomerIds } },
    //       { $set: { fileStatus: status } }
    //     )
    //   )
    // );

    return success(res, `File ${status.charAt(0).toUpperCase() + status.slice(1)} Successfully`);
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}





async function updateAllPdDataToSheetTest(req, res) {
  try {
    // Find all records where `statusByCreditPd` is not `notRequired`
    const externalVendors = await externalVendorModel.find({
      statusByCreditPd: { $nin: ["incomplete", "WIP", "complete", "pending", "approve", "reject", "rivert", "accept"], },
    });

    if (externalVendors.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No eligible records found to update.',
      });
    }

    console.log(`Found ${externalVendors.length} records to process.`);

    // Process each record one by one
    for (const vendor of externalVendors) {
      const { customerId } = vendor;

      try {
        console.log(`Processing customerId: ${customerId}`);
        // await addPdDataToSheet(customerId);
        console.log(`Successfully updated customerId: ${customerId}`);
      } catch (error) {
        console.error(`Error updating customerId: ${customerId}`, error.message);
        // Optionally log the error in the database or send an alert
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully processed ${externalVendors.length} records.`,
    });
  } catch (error) {
    console.error('Failed to update sheet:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}



// async function perticulerVendorsDashBoard(req, res) {
//   try {
//     const vendorId = req.Id;
//     const { status, vendorRole, page = 1, limit = 10, search, startDateFilter, endDateFilter } = req.query;
//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     if (!vendorRole) {
//       return badRequest(res, "Vendor role is required");
//     }

//     // Define status query logic
//     let statusQuery = {};
//     if (status !== "all") {
//       if (status === "complete" || status === "approve") {
//         statusQuery = { "vendors.statusByVendor": { $in: ["approve", "complete", "reject"] } };
//       } else {
//         statusQuery = { "vendors.statusByVendor": status };
//       }
//     }

//     const today = new Date();
//     const defaultStartDate = new Date(today.setHours(0, 0, 0, 0));
//     const defaultEndDate = new Date(today.setHours(23, 59, 59, 999));

//     function formatDateToISO(date) {
//       // Ensure date is a valid date before calling toISOString
//       return date instanceof Date && !isNaN(date) ? date.toISOString() : null;
//     }

//     let formattedStart = startDateFilter && startDateFilter !== "all"
//       ? new Date(new Date(startDateFilter).setHours(0, 0, 0, 0))
//       : null;  // Set to null if "all" or empty

//     let formattedEnd = endDateFilter && endDateFilter !== "all"
//       ? new Date(new Date(endDateFilter).setHours(23, 59, 59, 999))
//       : null;  // Set to null if "all" or empty

//     if (startDateFilter && endDateFilter && startDateFilter === endDateFilter) {
//       formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
//       formattedEnd = new Date(new Date(startDateFilter).setHours(23, 59, 59, 999));
//     }

//     // Format date to ISO if they are valid
//     formattedStart = formatDateToISO(formattedStart);
//     formattedEnd = formatDateToISO(formattedEnd);

//     // Search filter
//     let searchFilter = {};
//     if (search) {
//       const searchRegex = new RegExp(search, "i");
//       searchFilter = {
//         $or: [
//           { "customerDetailsData.customerFinId": searchRegex },
//           { "applicantsDetails.fullName": searchRegex },
//           { "applicantsDetails.fatherName": searchRegex },
//           { "applicantsDetails.mobileNo": searchRegex },
//         ],
//       };
//     }

//     // Aggregation Pipeline
//     const results = await externalVendorModel.aggregate([
//       {
//         $match: {
//           fileStatus: "active",
//           vendors: {
//             $elemMatch: {
//               vendorId: new ObjectId(vendorId),
//               vendorType: vendorRole,
//             },
//           },
//         },
//       },
//       { $unwind: "$vendors" },
//       {
//         $match: {
//           "vendors.vendorId": new ObjectId(vendorId),
//           "vendors.vendorType": vendorRole,
//           ...statusQuery,
//           // Only add date filter if startDate and endDate are not null
//           ...(formattedStart && formattedEnd && {
//             "vendors.assignDate": { $gte: formattedStart, $lte: formattedEnd }
//           }),
//         },
//       },
//       {
//         $lookup: {
//           from: "customerdetails",
//           localField: "customerId",
//           foreignField: "_id",
//           as: "customerDetailsData",
//         },
//       },
//       { $unwind: { path: "$customerDetailsData", preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: "applicantdetails",
//           localField: "customerId",
//           foreignField: "customerId",
//           as: "applicantsDetails",
//         },
//       },
//       { $unwind: { path: "$applicantsDetails", preserveNullAndEmptyArrays: true } },
//       { $match: searchFilter }, // Apply search filter after lookup
//       {
//         $facet: {
//           metadata: [{ $count: "totalItems" }], // Total count for pagination
//           wipFiles: [
//             { $match: { "vendors.statusByVendor": "WIP" } },
//             { $count: "count" },
//           ],
//           completeFiles: [
//             { $match: { "vendors.statusByVendor": { $in: ["approve", "complete", "reject"] } } },
//             { $count: "count" },
//           ],
//           vendorDetails: [
//             {
//               $project: {
//                 _id: 0,
//                 customerId: "$customerId",
//                 customerFinId: "$customerDetailsData.customerFinId",
//                 fullName: "$applicantsDetails.fullName",
//                 fatherName: "$applicantsDetails.fatherName",
//                 mobileNo: "$applicantsDetails.mobileNo",
//                 address: {
//                   addressLine1: "$applicantsDetails.permanentAddress.addressLine1",
//                   addressLine2: "$applicantsDetails.permanentAddress.addressLine2",
//                 },
//                 assignDate: "$vendors.assignDate",
//                 completeDate: "$vendors.vendorUploadDate",
//                 uploadProperty: "$vendors.uploadProperty",
//                 statusByVendor: "$vendors.statusByVendor",
//               },
//             },
//             { $skip: skip },
//             { $limit: parseInt(limit) },
//           ],
//         },
//       },
//     ]);

//     // Extract counts safely
//     const totalItems = results[0].metadata.length > 0 ? results[0].metadata[0].totalItems : 0;
//     const totalPages = Math.ceil(totalItems / parseInt(limit));
//     const wipFiles = results[0].wipFiles.length > 0 ? results[0].wipFiles[0].count : 0;
//     const completeFiles = results[0].completeFiles.length > 0 ? results[0].completeFiles[0].count : 0;

//     return success(res, "Vendor Dashboard", {
//       totalFiles: totalItems,
//       wipFiles,
//       completeFiles,
//       details: results[0].vendorDetails,
//       currentPage: parseInt(page),
//       totalPages,
//       totalItems,
//       limit: parseInt(limit),
//     });
//   } catch (error) {
//     console.error(error);
//     return unknownError(res, error);
//   }
// }





// async function allVendorsDashBoard(req, res) {
//   try {
//     const {
//       status,
//       vendorRole,
//       vendorId,
//       branch,
//       product,
//       page = 1,
//       limit = 10000,
//       search,
//       dateFilterApply,
//       startDateFilter,
//       endDateFilter,
//     } = req.query;
//     const skip = (parseInt(page) - 1) * parseInt(limit);


//     let statusQuery = {};

//     if (vendorRole && vendorRole !== "all") {
//       const vendorTypeArray = Array.isArray(vendorRole) ? vendorRole : vendorRole.split(",");
//       statusQuery = { "vendors.vendorType": { $in: vendorTypeArray.map(id => id) }};
//     }

//     if (status && status !== "all") {
//       if (status === "complete" || status === "approve") {
//         statusQuery = { "vendors.statusByVendor": { $in: ["approve", "complete", "reject"] } };
//       } else if (status === 'positive') {
//         statusQuery = { "vendors.vendorStatus": status };
//       } else if (status === 'negative') {
//         statusQuery = { "vendors.vendorStatus": status };
//       } else if (status === 'credit refer') {
//         statusQuery = { "vendors.vendorStatus": status };
//       } else {
//         statusQuery = { "vendors.statusByVendor": status };
//       }
//     }

//     if (vendorId && vendorId !== "all") {
//       const vendorIdArray = Array.isArray(vendorId) ? vendorId : vendorId.split(",");
//       statusQuery = { "vendors.vendorId": { $in: vendorIdArray.map(id => new ObjectId(id)) }};
//     }

//     let branchQuery = {};
//     if (branch && branch !== "all") {
//       const branchArray = Array.isArray(branch) ? branch : branch.split(",");
//       branchQuery["salesPerson.branchId"] = { $in: branchArray.map(id => new ObjectId(id)) };
//     }


//     let productQuery = {};
//     if (product && product !== "all") {
//       const productArray = Array.isArray(product) ? product : product.split(",");
//       productQuery["customerDetailsData.productId"] = { $in: productArray.map(id => new ObjectId(id)) };
//     }

//     const today = new Date();
//     const defaultStartDate = new Date(today.setHours(0, 0, 0, 0));
//     const defaultEndDate = new Date(today.setHours(23, 59, 59, 999));

//     function formatDateToISO(date) {
//       // Ensure date is a valid date before calling toISOString
//       return date instanceof Date && !isNaN(date) ? date.toISOString() : null;
//     }

//     let formattedStart = startDateFilter && startDateFilter !== "all"
//       ? new Date(new Date(startDateFilter).setHours(0, 0, 0, 0))
//       : null;

//     let formattedEnd = endDateFilter && endDateFilter !== "all"
//       ? new Date(new Date(endDateFilter).setHours(23, 59, 59, 999))
//       : null;

//     if (startDateFilter && endDateFilter && startDateFilter === endDateFilter) {
//       formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
//       formattedEnd = new Date(new Date(startDateFilter).setHours(23, 59, 59, 999));
//     }

//     // Format date to ISO if they are valid
//     formattedStart = formatDateToISO(formattedStart);
//     formattedEnd = formatDateToISO(formattedEnd);

//     // Search filter
//     let searchFilter = {};
//     if (search) {
//       const searchRegex = new RegExp(search, "i");
//       searchFilter = {
//         $or: [
//           { "customerDetailsData.customerFinId": searchRegex },
//           { "applicantsDetails.fullName": searchRegex },
//           { "applicantsDetails.fatherName": searchRegex },
//           { "applicantsDetails.mobileNo": searchRegex },
//         ],
//       };
//     }

//     const results = await externalVendorModel.aggregate([
//       {
//         $match: {
//           fileStatus: "active",
//           statusByCreditPd : { $in: ["approve","complete"]},
//           // vendors: {
//           //   $elemMatch: {
//           //     vendorType: vendorRole,
//           //   },
//           // },
//         },
//       },
//       { $unwind: "$vendors" },
//       {
//         $match: {
//           // "vendors.vendorType": vendorRole,
//           ...statusQuery,
//           // ...(formattedStart && formattedEnd && {
//           //   "vendors.assignDate": { $gte: formattedStart, $lte: formattedEnd },
//           // }),
//           ...(formattedStart && formattedEnd && {
//             [dateFilterApply == "assign" ? "vendors.assignDate" : "vendors.vendorUploadDate"]: {
//               $gte: formattedStart,
//               $lte: formattedEnd,
//             },
//           }),
//         },
//       },
//       {
//         $lookup: {
//           from: "customerdetails",
//           localField: "customerId",
//           foreignField: "_id",
//           as: "customerDetailsData",
//         },
//       },
//       { $unwind: { path: "$customerDetailsData", preserveNullAndEmptyArrays: true } },
//       { $match: productQuery },
//       {
//         $lookup: {
//           from: "employees",
//           localField: "customerDetailsData.employeId",
//           foreignField: "_id",
//           as: "salesPerson",
//         },
//       },
//       { $unwind: { path: "$salesPerson", preserveNullAndEmptyArrays: true } },
//       { $match: branchQuery },
//       {
//         $lookup: {
//           from: "newbranches",
//           localField: "salesPerson.branchId",
//           foreignField: "_id",
//           as: "branchDetails",
//         },
//       },
//       { $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: "applicantdetails",
//           localField: "customerId",
//           foreignField: "customerId",
//           as: "applicantsDetails",
//         },
//       },
//       { $unwind: { path: "$applicantsDetails", preserveNullAndEmptyArrays: true } },
//       { $match: searchFilter }, // Apply search filter after lookup
//       {
//         $facet: {
//           metadata: [{ $count: "totalItems" }], // Total count for pagination
//           notAssignFiles: [
//             { $match: { "vendors.statusByVendor": "notAssign" } },
//             { $count: "count" },
//           ],
//           wipFiles: [
//             { $match: { "vendors.statusByVendor": "WIP" } },
//             { $count: "count" },
//           ],
//           completeFiles: [
//             { $match: { "vendors.statusByVendor": { $in: ["approve", "complete"] } } },
//             { $count: "count" },
//           ],
//           rejectFiles: [
//             { $match: { "vendors.statusByVendor": "reject" } },
//             { $count: "count" },
//           ],
//           notRequiredFiles: [
//             { $match: { "vendors.statusByVendor": "notRequired" } },
//             { $count: "count" },
//           ],
//           creditReferFiles: [
//             { $match: { "vendors.vendorStatus": "credit refer" } },
//             { $count: "count" },
//           ],
//           positiveFiles: [
//             { $match: { "vendors.vendorStatus": "positive" } },
//             { $count: "count" },
//           ],
//           negativeFiles: [
//             { $match: { "vendors.vendorStatus": "negative" } },
//             { $count: "count" },
//           ],
//           vendorDetails: [
//             {
//               $project: {
//                 _id: "$vendors._id",
//                 customerId: "$customerId",
//                 customerFinId: "$customerDetailsData.customerFinId",
//                 fullName: "$applicantsDetails.fullName",
//                 fatherName: "$applicantsDetails.fatherName",
//                 mobileNo: "$applicantsDetails.mobileNo",
//                 address: {
//                   addressLine1: "$applicantsDetails.permanentAddress.addressLine1",
//                   addressLine2: "$applicantsDetails.permanentAddress.addressLine2",
//                 },
//                 initiationDate: "$vendors.assignDate",
//                 completeDate: "$vendors.vendorUploadDate",
//                 branchName: "$branchDetails.name",
//                 branchId: "$branchDetails._id",
//                 productId: "$customerDetailsData.productId",
//                 vendorId: "$vendors.vendorId",
//                 vendorType: "$vendors.vendorType",
//                 assignDocuments: "$vendors.assignDocuments",
//                 uploadDocuments: "$vendors.uploadProperty",
//                 fileStatus: "$vendors.statusByVendor",
//                 vendorByStatus: "$vendors.vendorStatus", // positive negative 
//               },
//             },
//             { $skip: skip },
//             { $limit: parseInt(limit) },
//           ],
//         },
//       },
//     ]);

//     const totalItems = results[0].metadata.length > 0 ? results[0].metadata[0].totalItems : 0;
//     const totalPages = Math.ceil(totalItems / parseInt(limit));
//     const wipFiles = results[0].wipFiles.length > 0 ? results[0].wipFiles[0].count : 0;
//     const notAssignFiles = results[0].notAssignFiles.length > 0 ? results[0].notAssignFiles[0].count : 0;
//     const completeFiles = results[0].completeFiles.length > 0 ? results[0].completeFiles[0].count : 0;
//     const notRequiredFiles = results[0].notRequiredFiles.length > 0 ? results[0].notRequiredFiles[0].count : 0;
//     const rejectFiles = results[0].rejectFiles.length > 0 ? results[0].rejectFiles[0].count : 0;

//     const negativeFiles = results[0].negativeFiles.length > 0 ? results[0].negativeFiles[0].count : 0;
//     const positiveFiles = results[0].positiveFiles.length > 0 ? results[0].positiveFiles[0].count : 0;
//     const creditReferFiles = results[0].creditReferFiles.length > 0 ? results[0].creditReferFiles[0].count : 0;

//     return success(res, "Vendor Dashboard For Admin", {
//       totalFiles: totalItems,
//       notAssignFiles,
//       wipFiles,
//       completeFiles,
//       notRequiredFiles,
//       rejectFiles,
//       positiveFiles,
//       creditReferFiles,
//       negativeFiles,
//       details: results[0].vendorDetails,
//       currentPage: parseInt(page),
//       totalPages,
//       totalItems,
//       limit: parseInt(limit),
//     });
//   } catch (error) {
//     console.error(error);
//     return unknownError(res, error);
//   }
// }


async function perticulerVendorsDashBoard(req, res) {
  try {
    const userId = req.Id;
    const vendorId = req.Id
    const { status, vendorRole, page = 1, limit = 10, search, startDateFilter, endDateFilter  , queryVendorId} = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (!vendorRole) {
      return badRequest(res, "Vendor role is required");
    }

    // Define status query logic
    let statusQuery = {};
    if (status !== "all") {
      if (status === "complete" || status === "approve") {
        statusQuery = { "vendors.statusByVendor": { $in: ["approve", "complete", "reject"] } };
      } else {
        statusQuery = { "vendors.statusByVendor": status };
      }
    }

let finalVendorIds = [];  
let matchAllVendors = false;

const employee = await employeeModel.findById(userId).populate("roleId");

// console.log('-----employee',employee)
if (employee) {
  const isAdmin = Array.isArray(employee.roleId) && employee.roleId.some(role => role.roleName === "admin");

  if (isAdmin) {
    if (!queryVendorId || queryVendorId === "all") {
      matchAllVendors = true; // Show all vendors
    } else {
      // Split comma-separated IDs and validate as ObjectIds
      finalVendorIds = queryVendorId.split(",").map(id => new ObjectId(id.trim()));
    }
  } else{
    finalVendorIds = [new ObjectId(userId)];
  }
} else {
    finalVendorIds = [new ObjectId(userId)];
}

    const today = new Date();
    const defaultStartDate = new Date(today.setHours(0, 0, 0, 0));
    const defaultEndDate = new Date(today.setHours(23, 59, 59, 999));

    function formatDateToISO(date) {
      // Ensure date is a valid date before calling toISOString
      return date instanceof Date && !isNaN(date) ? date.toISOString() : null;
    }

    let formattedStart = startDateFilter && startDateFilter !== "all"
      ? new Date(new Date(startDateFilter).setHours(0, 0, 0, 0))
      : null;  // Set to null if "all" or empty

    let formattedEnd = endDateFilter && endDateFilter !== "all"
      ? new Date(new Date(endDateFilter).setHours(23, 59, 59, 999))
      : null;  // Set to null if "all" or empty

    if (startDateFilter && endDateFilter && startDateFilter === endDateFilter) {
      formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
      formattedEnd = new Date(new Date(startDateFilter).setHours(23, 59, 59, 999));
    }

    // Format date to ISO if they are valid
    formattedStart = formatDateToISO(formattedStart);
    formattedEnd = formatDateToISO(formattedEnd);

    // Search filter
    let searchFilter = {};
    if (search) {
      const searchRegex = new RegExp(search, "i");
      searchFilter = {
        $or: [
          { "customerDetailsData.customerFinId": searchRegex },
          { "applicantsDetails.fullName": searchRegex },
          { "applicantsDetails.fatherName": searchRegex },
          { "applicantsDetails.mobileNo": searchRegex },
        ],
      };
    }

    const vendorMatch = matchAllVendors
  ? { vendorType: vendorRole }
  : {
      vendorId: { $in: finalVendorIds },
      vendorType: vendorRole,
    };

    // console.log('vendorMatch-----',vendorMatch)
    // Aggregation Pipeline
    const results = await externalVendorModel.aggregate([
      {
        $match: {
          fileStatus: "active",
          vendors: { $elemMatch: vendorMatch },
          // vendors: {
          //   $elemMatch: {
          //     vendorId: new ObjectId(vendorId),
          //     // vendorType: { $in: matchAllVendors ? finalVendorIds : [new ObjectId(userId)] },
          //     vendorType: vendorRole,
          //   },
          // },
        },
      },
      { $unwind: "$vendors" },
      {
        $match: {
          ...(vendorMatch.vendorId && { "vendors.vendorId": vendorMatch.vendorId }),
          ...(vendorMatch.vendorType && { "vendors.vendorType": vendorMatch.vendorType }),
          // "vendors.vendorId": new ObjectId(vendorId),
          // "vendors.vendorId": { $in: matchAllVendors ? finalVendorIds : [new ObjectId(userId)] },
          // "vendors.vendorType": vendorRole,
          // ...vendorMatch,
          ...statusQuery,
          // Only add date filter if startDate and endDate are not null
          ...(formattedStart && formattedEnd && {
            "vendors.assignDate": { $gte: formattedStart, $lte: formattedEnd }
          }),
        },
      },
      {
        $lookup: {
          from: "customerdetails",
          localField: "customerId",
          foreignField: "_id",
          as: "customerDetailsData",
        },
      },
      { $unwind: { path: "$customerDetailsData", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "applicantdetails",
          localField: "customerId",
          foreignField: "customerId",
          as: "applicantsDetails",
        },
      },
      { $unwind: { path: "$applicantsDetails", preserveNullAndEmptyArrays: true } },
      { $match: searchFilter }, // Apply search filter after lookup
      {
        $facet: {
          metadata: [{ $count: "totalItems" }],
          wipFiles: [
            { $match: { "vendors.statusByVendor": "WIP" } },
            { $count: "count" },
          ],
          completeFiles: [
            { $match: { "vendors.statusByVendor": { $in: ["approve", "complete", "reject"] } } },
            { $count: "count" },
          ],
          creditReferFiles: [
            { $match: { "vendors.vendorStatus": "credit refer" } },
            { $count: "count" },
          ],
          positiveFiles: [
            { $match: { "vendors.vendorStatus": "positive" } },
            { $count: "count" },
          ],
          negativeFiles: [
            { $match: { "vendors.vendorStatus": "negative" } },
            { $count: "count" },
          ],

          vendorDetails: [
            {
              $project: {
                _id: 0,
                customerId: "$customerId",
                customerFinId: "$customerDetailsData.customerFinId",
                fullName: "$applicantsDetails.fullName",
                fatherName: "$applicantsDetails.fatherName",
                mobileNo: "$applicantsDetails.mobileNo",
                address: {
                  // addressLine1: "$applicantsDetails.permanentAddress.addressLine1",
                  // addressLine2: "$applicantsDetails.permanentAddress.addressLine2",
                  addressLine1: {
                    $concat: [
                      { $ifNull: ["$applicantsDetails.permanentAddress.addressLine1", ""] },
                      " ",
                      { $ifNull: ["$applicantsDetails.permanentAddress.addressLine2", ""] },
                      " ",
                      { $ifNull: ["$applicantsDetails.permanentAddress.city", ""] },
                      " ",
                      { $ifNull: ["$applicantsDetails.permanentAddress.state", ""] },
                      " ",
                      { $ifNull: ["$applicantsDetails.permanentAddress.district", ""] },
                      " ",
                      { $ifNull: ["$applicantsDetails.permanentAddress.pinCode", ""] },
                    ],
                  }
                },
                assignDate: "$vendors.assignDate",
                completeDate: "$vendors.vendorUploadDate",
                uploadProperty: "$vendors.uploadProperty",
                statusByVendor: "$vendors.statusByVendor",
                TAT: {
                  $let: {
                    vars: {
                      startDate: {
                        $dateFromString: {
                          dateString: {
                            $replaceAll: {
                              input: {
                                $replaceAll: {
                                  input: "$vendors.assignDate",
                                  find: " AM",
                                  replacement: ""
                                }
                              },
                              find: " PM",
                              replacement: ""
                            }
                          },
                          format: "%Y-%m-%dT%H:%M:%S",
                          onError: "$$NOW"
                        }
                      },
                      endDate: {
                        $cond: {
                          if: { $in: ["$vendors.statusByVendor", ["approve", "complete", "reject"]] },
                          then: {
                            $dateFromString: {
                              dateString: {
                                $replaceAll: {
                                  input: {
                                    $replaceAll: {
                                      input: "$vendors.vendorUploadDate",
                                      find: " AM",
                                      replacement: ""
                                    }
                                  },
                                  find: " PM",
                                  replacement: ""
                                }
                              },
                              format: "%Y-%m-%dT%H:%M:%S",
                              onError: "$$NOW"
                            }
                          },
                          else: "$$NOW"
                        }
                      }
                    },
                    in: {
                      $abs: {  // Add $abs to ensure positive value
                        $ceil: {
                          $divide: [
                            { $subtract: ["$$endDate", "$$startDate"] },
                            86400000  // milliseconds in a day
                          ]
                        }
                      }
                    }
                  }
                }
              }
            },
            { $skip: skip },
            { $limit: parseInt(limit) },
          ],
        },
      }
    ]);

    // Extract counts safely
    const totalItems = results[0].metadata.length > 0 ? results[0].metadata[0].totalItems : 0;
    const totalPages = Math.ceil(totalItems / parseInt(limit));
    const wipFiles = results[0].wipFiles.length > 0 ? results[0].wipFiles[0].count : 0;
    const completeFiles = results[0].completeFiles.length > 0 ? results[0].completeFiles[0].count : 0;

    const negativeFiles = results[0].negativeFiles.length > 0 ? results[0].negativeFiles[0].count : 0;
    const positiveFiles = results[0].positiveFiles.length > 0 ? results[0].positiveFiles[0].count : 0;
    const creditReferFiles = results[0].creditReferFiles.length > 0 ? results[0].creditReferFiles[0].count : 0;


    return success(res, "Vendor Dashboard", {
      totalFiles: totalItems,
      wipFiles,
      completeFiles,
      negativeFiles,
      creditReferFiles,
      positiveFiles,
      details: results[0].vendorDetails,
      currentPage: parseInt(page),
      totalPages,
      totalItems,
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}



// async function allVendorsDashBoard(req, res) {
//   try {
//     const {
//       status,
//       vendorRole,
//       vendorId,
//       branch,
//       product,
//       page = 1,
//       limit = 10000,
//       search,
//       dateFilterApply,
//       startDateFilter,
//       endDateFilter,
//     } = req.query;
//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const dynamicVendors = ['rcu', 'legal', 'technical', 'rm', 'tagging'];

//     let statusQuery = {};
//     let vendorRoleMatch = {};

//     // Handle vendorRole filter
//     if (vendorRole && vendorRole !== "all") {
//       const vendorTypeArray = Array.isArray(vendorRole) ? vendorRole : vendorRole.split(",");
//       statusQuery = { "vendors.vendorType": { $in: vendorTypeArray } };
//     } else if (vendorRole === "all") {
//       vendorRoleMatch = { "vendors.vendorType": { $in: dynamicVendors } };
//     }

//     // Handle status filter
//     if (status && status !== "all") {
//       if (status === "complete" || status === "approve") {
//         statusQuery = { "vendors.statusByVendor": { $in: ["approve", "complete", "reject"] } };
//       } else if (["positive", "negative", "credit refer"].includes(status)) {
//         statusQuery = { "vendors.vendorStatus": status };
//       } else {
//         statusQuery = { "vendors.statusByVendor": status };
//       }
//     }

//     // Handle vendorId filter
//     if (vendorId && vendorId !== "all") {
//       const vendorIdArray = Array.isArray(vendorId) ? vendorId : vendorId.split(",");
//       statusQuery = { "vendors.vendorId": { $in: vendorIdArray.map(id => new ObjectId(id)) } };
//     }

//     // Handle branch filter
//     let branchQuery = {};
//     if (branch && branch !== "all") {
//       const branchArray = Array.isArray(branch) ? branch : branch.split(",");
//       branchQuery["salesPerson.branchId"] = { $in: branchArray.map(id => new ObjectId(id)) };
//     }

//     // Handle product filter
//     let productQuery = {};
//     if (product && product !== "all") {
//       const productArray = Array.isArray(product) ? product : product.split(",");
//       productQuery["customerDetailsData.productId"] = { $in: productArray.map(id => new ObjectId(id)) };
//     }

//     // Date handling functions
//     function formatDateToISO(date) {
//       return date instanceof Date && !isNaN(date) ? date.toISOString() : null;
//     }

//     let formattedStart = startDateFilter && startDateFilter !== "all"
//       ? new Date(new Date(startDateFilter).setHours(0, 0, 0, 0))
//       : null;

//     let formattedEnd = endDateFilter && endDateFilter !== "all"
//       ? new Date(new Date(endDateFilter).setHours(23, 59, 59, 999))
//       : null;

//     if (startDateFilter && endDateFilter && startDateFilter === endDateFilter) {
//       formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
//       formattedEnd = new Date(new Date(startDateFilter).setHours(23, 59, 59, 999));
//     }

//     formattedStart = formatDateToISO(formattedStart);
//     formattedEnd = formatDateToISO(formattedEnd);

//     // Search filter
//     let searchFilter = {};
//     if (search) {
//       const searchRegex = new RegExp(search, "i");
//       searchFilter = {
//         $or: [
//           { "customerDetailsData.customerFinId": searchRegex },
//           { "applicantsDetails.fullName": searchRegex },
//           { "applicantsDetails.fatherName": searchRegex },
//           { "applicantsDetails.mobileNo": searchRegex },
//         ],
//       };
//     }

//     // Build the aggregation pipeline
//     const aggregationPipeline = [
//       {
//         $match: {
//           fileStatus: "active",
//         },
//       },
//       { $unwind: "$vendors" },
//       {
//         $match: {
//           ...statusQuery,
//           ...vendorRoleMatch,
//           ...(formattedStart && formattedEnd && {
//             [dateFilterApply == "assign" ? "vendors.assignDate" : "vendors.vendorUploadDate"]: {
//               $gte: formattedStart,
//               $lte: formattedEnd,
//             },
//           }),
//         },
//       },
//       {
//         $lookup: {
//           from: "customerdetails",
//           localField: "customerId",
//           foreignField: "_id",
//           as: "customerDetailsData",
//         },
//       },
//       { $unwind: { path: "$customerDetailsData", preserveNullAndEmptyArrays: true } },
//       { $match: productQuery },
//       {
//         $lookup: {
//           from: "employees",
//           localField: "customerDetailsData.employeId",
//           foreignField: "_id",
//           as: "salesPerson",
//         },
//       },
//       { $unwind: { path: "$salesPerson", preserveNullAndEmptyArrays: true } },
//       { $match: branchQuery },
//       {
//         $lookup: {
//           from: "newbranches",
//           localField: "salesPerson.branchId",
//           foreignField: "_id",
//           as: "branchDetails",
//         },
//       },
//       { $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: "applicantdetails",
//           localField: "customerId",
//           foreignField: "customerId",
//           as: "applicantsDetails",
//         },
//       },
//       { $unwind: { path: "$applicantsDetails", preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: "vendors",
//           localField: "vendors.vendorId",
//           foreignField: "_id",
//           as: "vendorDetails",
//         },
//       },
//       { $unwind: { path: "$vendorDetails", preserveNullAndEmptyArrays: true } },
//       { $match: searchFilter },
//     ];

//     // Add facet stage based on vendorRole
//     const facetStage = {
//       metadata: [{ $count: "totalItems" }],
//       vendorDetails: [
//         {
//           $group: {
//             _id: "$customerId",
//             customerId: { $first: "$customerId" },
//             customerFinId: { $first: "$customerDetailsData.customerFinId" },
//             fullName: { $first: "$applicantsDetails.fullName" },
//             fatherName: { $first: "$applicantsDetails.fatherName" },
//             mobileNo: { $first: "$applicantsDetails.mobileNo" },
//             address: {
//               $first: {
//                 addressLine1: "$applicantsDetails.permanentAddress.addressLine1",
//                 addressLine2: "$applicantsDetails.permanentAddress.addressLine2",
//               }
//             },
//             branchName: { $first: "$branchDetails.name" },
//             branchId: { $first: "$branchDetails._id" },
//             productId: { $first: "$customerDetailsData.productId" },
//             vendors: {
//               $push: {
//                 initiationDate: { $ifNull: ["$vendors.assignDate", ""] },
//                 completeDate: { $ifNull: ["$vendors.vendorUploadDate", ""] },
//                 vendorId: { $ifNull: ["$vendors.vendorId", null] },
//                 vendorFullName: { $ifNull: ["$vendorDetails.fullName", ""] },
//                 vendorType: { $ifNull: ["$vendors.vendorType", ""] },
//                 assignDocuments: { $ifNull: ["$vendors.assignDocuments", []] },
//                 uploadDocuments: { $ifNull: ["$vendors.uploadProperty", []] },
//                 fileStatus: { $ifNull: ["$vendors.statusByVendor", "notAssign"] },
//                 vendorStatus: { $ifNull: ["$vendors.vendorStatus", ""] },
//                 approverDate: { $ifNull: ["$vendors.approverDate", null] },
//                 TAT: {
//                   $let: {
//                     vars: {
//                       startDate: {
//                         $dateFromString: {
//                           dateString: {
//                             $replaceAll: {
//                               input: {
//                                 $replaceAll: {
//                                   input: "$vendors.assignDate",
//                                   find: " AM",
//                                   replacement: ""
//                                 }
//                               },
//                               find: " PM",
//                               replacement: ""
//                             }
//                           },
//                           format: "%Y-%m-%dT%H:%M:%S",
//                           onError: "$$NOW"
//                         }
//                       },
//                       endDate: {
//                         $cond: {
//                           if: { $in: ["$vendors.statusByVendor", ["approve", "complete", "reject"]] },
//                           then: {
//                             $dateFromString: {
//                               dateString: {
//                                 $replaceAll: {
//                                   input: {
//                                     $replaceAll: {
//                                       input: "$vendors.vendorUploadDate",
//                                       find: " AM",
//                                       replacement: ""
//                                     }
//                                   },
//                                   find: " PM",
//                                   replacement: ""
//                                 }
//                               },
//                               format: "%Y-%m-%dT%H:%M:%S",
//                               onError: "$$NOW"
//                             }
//                           },
//                           else: "$$NOW"
//                         }
//                       }
//                     },
//                     in: {
//                       $cond: {
//                         if: { $eq: ["$vendors.assignDate", ""] },
//                         then: 0,
//                         else: {
//                           $abs: {
//                             $ceil: {
//                               $divide: [
//                                 { $subtract: ["$$endDate", "$$startDate"] },
//                                 86400000  // milliseconds in a day
//                               ]
//                             }
//                           }
//                         }
//                       }
//                     }
//                   }
//                 }

//               }
//             }
//           }
//         },
//         { $sort: { customerFinId: 1 } },
//         { $skip: skip },
//         { $limit: parseInt(limit) }
//       ]
//     };

//     // Add status counts only when vendorRole is not "all"
//     if (vendorRole !== "all") {
//       facetStage.notAssignFiles = [
//         { $match: { "vendors.statusByVendor": "notAssign" } },
//         { $count: "count" },
//       ];
//       facetStage.wipFiles = [
//         { $match: { "vendors.statusByVendor": "WIP" } },
//         { $count: "count" },
//       ];
//       facetStage.completeFiles = [
//         { $match: { "vendors.statusByVendor": { $in: ["approve", "complete"] } } },
//         { $count: "count" },
//       ];
//       facetStage.rejectFiles = [
//         { $match: { "vendors.statusByVendor": "reject" } },
//         { $count: "count" },
//       ];
//       facetStage.notRequiredFiles = [
//         { $match: { "vendors.statusByVendor": "notRequired" } },
//         { $count: "count" },
//       ];
//       facetStage.creditReferFiles = [
//         { $match: { "vendors.vendorStatus": "credit refer" } },
//         { $count: "count" },
//       ];
//       facetStage.positiveFiles = [
//         { $match: { "vendors.vendorStatus": "positive" } },
//         { $count: "count" },
//       ];
//       facetStage.negativeFiles = [
//         { $match: { "vendors.vendorStatus": "negative" } },
//         { $count: "count" },
//       ];
//     } else {
//       // Add vendor type counts when vendorRole is "all"
//       dynamicVendors.forEach(vendorType => {
//         facetStage[`${vendorType}`] = [
//           {
//             $match: {
//               "vendors.vendorType": vendorType,
//               "vendors.statusByVendor": { $in: ["approve", "complete"] }
//             }
//           },
//           { $count: "count" }
//         ];
//       });
//     }

//     aggregationPipeline.push({ $facet: facetStage });

//     const results = await externalVendorModel.aggregate(aggregationPipeline);

//     // Calculate response data
//     const totalItems = results[0].metadata.length > 0 ? results[0].metadata[0].totalItems : 0;
//     const totalPages = Math.ceil(totalItems / parseInt(limit));

//     const response = {
//       totalFiles: totalItems,
//       details: results[0].vendorDetails,
//       currentPage: parseInt(page),
//       totalPages,
//       totalItems,
//       limit: parseInt(limit),
//     };

//     // Add status counts for non-all vendorRole

//     if (vendorRole !== "all") {
//       response.notAssignFiles = results[0].notAssignFiles.length > 0 ? results[0].notAssignFiles[0].count : 0;
//       response.wipFiles = results[0].wipFiles.length > 0 ? results[0].wipFiles[0].count : 0;
//       response.completeFiles = results[0].completeFiles.length > 0 ? results[0].completeFiles[0].count : 0;
//       response.notRequiredFiles = results[0].notRequiredFiles.length > 0 ? results[0].notRequiredFiles[0].count : 0;
//       response.rejectFiles = results[0].rejectFiles.length > 0 ? results[0].rejectFiles[0].count : 0;
//       response.negativeFiles = results[0].negativeFiles.length > 0 ? results[0].negativeFiles[0].count : 0;
//       response.positiveFiles = results[0].positiveFiles.length > 0 ? results[0].positiveFiles[0].count : 0;
//       response.creditReferFiles = results[0].creditReferFiles.length > 0 ? results[0].creditReferFiles[0].count : 0;
//     } else {
//       // Add vendor type counts for all vendorRole
//       dynamicVendors.forEach(vendorType => {
//         response[`${vendorType}`] = results[0][`${vendorType}`].length > 0
//           ? results[0][`${vendorType}`][0].count
//           : 0;
//       });
//     }

//     return success(res, "Vendor Dashboard For Admin", response);
//   } catch (error) {
//     console.error(error);
//     return unknownError(res, error);
//   }
// }






// async function allVendorsDashBoard(req, res) {
//   try {
//     const {
//       status,
//       vendorRole,
//       vendorId,
//       branch,
//       product,
//       page = 1,
//       limit = 10000,
//       search,
//       dateFilterApply,
//       startDateFilter,
//       endDateFilter,
//     } = req.query;
//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const dynamicVendors = ['rcu', 'legal', 'technical', 'rm', 'tagging','fi'];

//     let statusQuery = {};
//     let vendorRoleMatch = {};

//     if (vendorRole && vendorRole !== "all") {
//       vendorRoleMatch = { "vendors.vendorType": vendorRole };
//     }

//     // Handle status filter
//     // if (status && status !== "all") {
//     //   if (status === "complete" || status === "approve") {
//     //     statusQuery = { "vendors.statusByVendor": { $in: ["approve", "complete", "reject"] } };
//     //   } else if (["positive", "negative", "credit refer"].includes(status)) {
//     //     statusQuery = { "vendors.vendorStatus": status };
//     //   }else if (status === "notAssign") {
//     //     statusQuery = {
//     //       $or: [
//     //         { "vendors.statusByVendor": "notAssign" },
//     //         {
//     //           $and: [
//     //             { "vendors.statusByVendor": "WIP" },
//     //             { "vendors.vendorId": null }
//     //           ]
//     //         }
//     //       ]
//     //     }
//     //    } else {
//     //     statusQuery = { "vendors.statusByVendor": status };
//     //   }
//     // }
    
    
//     if (status && status !== "all") {
//       if (status === "complete" || status === "approve") {
//         statusQuery = { 
//           "vendors.statusByVendor": { $in: ["approve", "complete", "reject"] },
//           "vendors.vendorId": { $ne: null } 
//         };
//       } else if (["positive", "negative", "credit refer"].includes(status)) {
//         statusQuery = { 
//           "vendors.vendorStatus": status,
//           "vendors.vendorId": { $ne: null } 
//         };
//       } else if (status === "notAssign") {
//         statusQuery = {
//           $or: [
//             { "vendors.statusByVendor": "notAssign" },
//             {
//               $and: [
//                 { "vendors.statusByVendor": { $in: ["WIP", "approve", "complete", "reject"] } },
//                 { "vendors.vendorId": null }
//               ]
//             }
//           ]
//         };
//       } else if (status === "WIP") {
//         statusQuery = { 
//           "vendors.statusByVendor": "WIP",
//           "vendors.vendorId": { $ne: null } 
//         };
//       } 
//     }


//     // Handle vendorId filter
//     if (vendorId && vendorId !== "all") {
//       const vendorIdArray = Array.isArray(vendorId) ? vendorId : vendorId.split(",");
//       statusQuery = { "vendors.vendorId": { $in: vendorIdArray.map(id => new ObjectId(id)) } };
//     }

//     // Handle branch filter
//     let branchQuery = {};
//     if (branch && branch !== "all") {
//       const branchArray = Array.isArray(branch) ? branch : branch.split(",");
//       branchQuery["salesPerson.branchId"] = { $in: branchArray.map(id => new ObjectId(id)) };
//     }

//     // Handle product filter
//     let productQuery = {};
//     if (product && product !== "all") {
//       const productArray = Array.isArray(product) ? product : product.split(",");
//       productQuery["customerDetailsData.productId"] = { $in: productArray.map(id => new ObjectId(id)) };
//     }

//     // Date handling functions
//     function formatDateToISO(date) {
//       return date instanceof Date && !isNaN(date) ? date.toISOString() : null;
//     }

//     let formattedStart = startDateFilter && startDateFilter !== "all"
//       ? new Date(new Date(startDateFilter).setHours(0, 0, 0, 0))
//       : null;

//     let formattedEnd = endDateFilter && endDateFilter !== "all"
//       ? new Date(new Date(endDateFilter).setHours(23, 59, 59, 999))
//       : null;

//     if (startDateFilter && endDateFilter && startDateFilter === endDateFilter) {
//       formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
//       formattedEnd = new Date(new Date(startDateFilter).setHours(23, 59, 59, 999));
//     }

//     formattedStart = formatDateToISO(formattedStart);
//     formattedEnd = formatDateToISO(formattedEnd);

//     // Search filter
//     let searchFilter = {};
//     if (search) {
//       const searchRegex = new RegExp(search, "i");
//       searchFilter = {
//         $or: [
//           { "customerDetailsData.customerFinId": searchRegex },
//           { "applicantsDetails.fullName": searchRegex },
//           { "applicantsDetails.fatherName": searchRegex },
//           { "applicantsDetails.mobileNo": searchRegex },
//         ],
//       };
//     }

//     // console.log('statusQuery----',statusQuery)

//     // Build the aggregation pipeline
//     const aggregationPipeline = [
//       {
//         $match: {
//           fileStatus: "active",
//         },
//       },
//       { $unwind: "$vendors" },
//       {
//         $match: {
//           ...statusQuery,
//           ...vendorRoleMatch,
//           ...(formattedStart && formattedEnd && {
//             [dateFilterApply == "assign" ? "vendors.assignDate" : "vendors.vendorUploadDate"]: {
//               $gte: formattedStart,
//               $lte: formattedEnd,
//             },
//           }),
//         },
//       },
//       {
//         $lookup: {
//           from: "customerdetails",
//           localField: "customerId",
//           foreignField: "_id",
//           as: "customerDetailsData",
//         },
//       },
//       { $unwind: { path: "$customerDetailsData", preserveNullAndEmptyArrays: true } },
//       { $match: productQuery },
//       {
//         $lookup: {
//           from: "employees",
//           localField: "customerDetailsData.employeId",
//           foreignField: "_id",
//           as: "salesPerson",
//         },
//       },
//       { $unwind: { path: "$salesPerson", preserveNullAndEmptyArrays: true } },
//       { $match: branchQuery },
//       {
//         $lookup: {
//           from: "newbranches",
//           localField: "customerDetailsData.branch",
//           foreignField: "_id",
//           as: "branchDetails",
//         },
//       },
//       { $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: "applicantdetails",
//           localField: "customerId",
//           foreignField: "customerId",
//           as: "applicantsDetails",
//         },
//       },
//       { $unwind: { path: "$applicantsDetails", preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: "vendors",
//           localField: "vendors.vendorId",
//           foreignField: "_id",
//           as: "vendorDetails",
//         },
//       },
//       { $unwind: { path: "$vendorDetails", preserveNullAndEmptyArrays: true } },
//       { $match: searchFilter },
//     ];

//     // Add facet stage based on vendorRole
//     const facetStage = {
//       metadata: [{ $count: "totalItems" }],
//       vendorDetails: [
//         {
//           $group: {
//             _id: "$customerId",
//             customerId: { $first: "$customerId" },
//             customerFinId: { $first: "$customerDetailsData.customerFinId" },
//             fullName: { $first: "$applicantsDetails.fullName" },
//             fatherName: { $first: "$applicantsDetails.fatherName" },
//             mobileNo: { $first: "$applicantsDetails.mobileNo" },
//             address: {
//               $first: {
//                 addressLine1: "$applicantsDetails.permanentAddress.addressLine1",
//                 addressLine2: "$applicantsDetails.permanentAddress.addressLine2",
//               }
//             },
//             branchName: { $first: "$branchDetails.name" },
//             branchId: { $first: "$branchDetails._id" },
//             productId: { $first: "$customerDetailsData.productId" },
//             vendors: {
//               $push: {
//                 initiationDate: { $ifNull: ["$vendors.assignDate", ""] },
//                 completeDate: { $ifNull: ["$vendors.vendorUploadDate", ""] },
//                 vendorId: { $ifNull: ["$vendors.vendorId", null] },
//                 vendorFullName: { $ifNull: ["$vendorDetails.fullName", ""] },
//                 vendorType: { $ifNull: ["$vendors.vendorType", ""] },
//                 assignDocuments: { $ifNull: ["$vendors.assignDocuments", []] },
//                 uploadDocuments: { $ifNull: ["$vendors.uploadProperty", []] },
//                 fileStatus: { $ifNull: ["$vendors.statusByVendor", "notAssign"] },
//                 vendorStatus: { $ifNull: ["$vendors.vendorStatus", ""] },
//                 approverDate: { $ifNull: ["$vendors.approverDate", null] },
//                 TAT: {
//                   $let: {
//                     vars: {
//                       startDate: {
//                         $dateFromString: {
//                           dateString: {
//                             $replaceAll: {
//                               input: {
//                                 $replaceAll: {
//                                   input: "$vendors.assignDate",
//                                   find: " AM",
//                                   replacement: ""
//                                 }
//                               },
//                               find: " PM",
//                               replacement: ""
//                             }
//                           },
//                           format: "%Y-%m-%dT%H:%M:%S",
//                           onError: "$$NOW"
//                         }
//                       },
//                       endDate: {
//                         $cond: {
//                           if: { $in: ["$vendors.statusByVendor", ["approve", "complete", "reject"]] },
//                           then: {
//                             $dateFromString: {
//                               dateString: {
//                                 $replaceAll: {
//                                   input: {
//                                     $replaceAll: {
//                                       input: "$vendors.vendorUploadDate",
//                                       find: " AM",
//                                       replacement: ""
//                                     }
//                                   },
//                                   find: " PM",
//                                   replacement: ""
//                                 }
//                               },
//                               format: "%Y-%m-%dT%H:%M:%S",
//                               onError: "$$NOW"
//                             }
//                           },
//                           else: "$$NOW"
//                         }
//                       }
//                     },
//                     in: {
//                       $cond: {
//                         if: { $eq: ["$vendors.assignDate", ""] },
//                         then: 0,
//                         else: {
//                           $abs: {
//                             $ceil: {
//                               $divide: [
//                                 { $subtract: ["$$endDate", "$$startDate"] },
//                                 86400000  // milliseconds in a day
//                               ]
//                             }
//                           }
//                         }
//                       }
//                     }
//                   }
//                 }

//               }
//             }
//           }
//         },
//         { $sort: { customerFinId: 1 } },
//         { $skip: skip },
//         { $limit: parseInt(limit) }
//       ]
//     };

//     // Add status counts only when vendorRole is not "all"
//     // if (vendorRole !== "all") {
//     //   facetStage.notAssignFiles = [
//     //     { $match: { "vendors.statusByVendor": "notAssign" } },
//     //     { $count: "count" },
//     //   ];
//     //   facetStage.wipFiles = [
//     //     { $match: { "vendors.statusByVendor": "WIP" } },
//     //     { $count: "count" },
//     //   ];
//     //   facetStage.completeFiles = [
//     //     { $match: { "vendors.statusByVendor": { $in: ["approve", "complete"] } } },
//     //     { $count: "count" },
//     //   ];
//     //   facetStage.rejectFiles = [
//     //     { $match: { "vendors.statusByVendor": "reject" } },
//     //     { $count: "count" },
//     //   ];
//     //   facetStage.notRequiredFiles = [
//     //     { $match: { "vendors.statusByVendor": "notRequired" } },
//     //     { $count: "count" },
//     //   ];
//     //   facetStage.creditReferFiles = [
//     //     { $match: { "vendors.vendorStatus": "credit refer" } },
//     //     { $count: "count" },
//     //   ];
//     //   facetStage.positiveFiles = [
//     //     { $match: { "vendors.vendorStatus": "positive" } },
//     //     { $count: "count" },
//     //   ];
//     //   facetStage.negativeFiles = [
//     //     { $match: { "vendors.vendorStatus": "negative" } },
//     //     { $count: "count" },
//     //   ];
//     // } else {
//     //   // Add vendor type counts when vendorRole is "all"
//     //   dynamicVendors.forEach(vendorType => {
//     //     facetStage[`${vendorType}`] = [
//     //       {
//     //         $match: {
//     //           "vendors.vendorType": vendorType,
//     //           "vendors.statusByVendor": { $in: ["approve", "complete"] }
//     //         }
//     //       },
//     //       { $count: "count" }
//     //     ];
//     //   });
//     // }


//     if (vendorRole !== "all") {
//       facetStage.notAssignFiles = [
//         { $match: { 
//           $or: [
//             { "vendors.statusByVendor": "notAssign" }, // Case 1: Only check statusByVendor
//             { 
//                 "vendors.statusByVendor": { $in: ["WIP", "approve", "complete", "reject"] }, 
//                 "vendors.vendorId": { $ne: null }  // Case 2: Check vendorId when status is not "notAssign"
//             }
//         ]

//         }
//       },
//         { $count: "count" },
//       ];
      
//       facetStage.wipFiles = [
//         { $match: { 
//           "vendors.statusByVendor": "WIP",
//           "vendors.vendorId": { $ne: null }
//         }},
//         { $count: "count" },
//       ];
      
//       facetStage.completeFiles = [
//         { $match: { 
//           "vendors.statusByVendor": { $in: ["approve", "complete"] },
//           "vendors.vendorId": { $ne: null }
//         }},
//         { $count: "count" },
//       ];
      
//       facetStage.rejectFiles = [
//         { $match: { 
//           "vendors.statusByVendor": "reject",
//           "vendors.vendorId": { $ne: null }
//         }},
//         { $count: "count" },
//       ];
      
//       facetStage.notRequiredFiles = [
//         { $match: { 
//           "vendors.statusByVendor": "notRequired",
//           "vendors.vendorId": { $ne: null }
//         }},
//         { $count: "count" },
//       ];
      
//       facetStage.creditReferFiles = [
//         { $match: { 
//           "vendors.vendorStatus": "credit refer",
//           "vendors.vendorId": { $ne: null },
//           "vendors.statusByVendor": { $in: ["approve", "complete"] },
//         }},
//         { $count: "count" },
//       ];
      
//       facetStage.positiveFiles = [
//         { $match: { 
//           "vendors.vendorStatus": "positive",
//           "vendors.vendorId": { $ne: null },
//           "vendors.statusByVendor": { $in: ["approve", "complete"] },
//         }},
//         { $count: "count" },
//       ];
      
//       facetStage.negativeFiles = [
//         { $match: { 
//           "vendors.vendorStatus": "negative",
//           "vendors.vendorId": { $ne: null },
//           "vendors.statusByVendor": { $in: ["approve", "complete"] },
//         }},
//         { $count: "count" },
//       ];
    
//     }

//     aggregationPipeline.push({ $facet: facetStage });

//     const results = await externalVendorModel.aggregate(aggregationPipeline);

//     // Calculate response data
//     const totalItems = results[0].metadata.length > 0 ? results[0].metadata[0].totalItems : 0;
//     const totalPages = Math.ceil(totalItems / parseInt(limit));

//     const response = {
//       totalFiles: totalItems,
//       details: results[0].vendorDetails,
//       currentPage: parseInt(page),
//       totalPages,
//       totalItems,
//       limit: parseInt(limit),
//     };

//     // Add status counts for non-all vendorRole

//     if (vendorRole !== "all") {
//       response.notAssignFiles = results[0].notAssignFiles.length > 0 ? results[0].notAssignFiles[0].count : 0;
//       response.wipFiles = results[0].wipFiles.length > 0 ? results[0].wipFiles[0].count : 0;
//       response.completeFiles = results[0].completeFiles.length > 0 ? results[0].completeFiles[0].count : 0;
//       response.notRequiredFiles = results[0].notRequiredFiles.length > 0 ? results[0].notRequiredFiles[0].count : 0;
//       response.rejectFiles = results[0].rejectFiles.length > 0 ? results[0].rejectFiles[0].count : 0;
//       response.negativeFiles = results[0].negativeFiles.length > 0 ? results[0].negativeFiles[0].count : 0;
//       response.positiveFiles = results[0].positiveFiles.length > 0 ? results[0].positiveFiles[0].count : 0;
//       response.creditReferFiles = results[0].creditReferFiles.length > 0 ? results[0].creditReferFiles[0].count : 0;
//     }

//     return success(res, "Vendor Dashboard For Admin", response);
//   } catch (error) {
//     console.error(error);
//     return unknownError(res, error);
//   }
// }


async function allVendorsDashBoard(req, res) {
  try {
    const {
      status,
      vendorRole,
      vendorId,
      branch,
      product,
      page = 1,
      limit = 10000,
      search,
      dateFilterApply,
      startDateFilter,
      endDateFilter,
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const dynamicVendors = ['rcu', 'legal', 'technical', 'rm', 'tagging','fi'];

    let statusQuery = {};
    let vendorRoleMatch = {};

    if (vendorRole && vendorRole !== "all") {
      vendorRoleMatch = { "vendors.vendorType": vendorRole };
    }

    // Handle status filter
    if (status && status !== "all") {
      if (status === "complete" || status === "approve") {
        statusQuery = { 
          "vendors.statusByVendor": { $in: ["approve", "complete", "reject"] },
          "vendors.vendorId": { $ne: null } 
        };
      } else if (["positive", "negative", "credit refer"].includes(status)) {
        statusQuery = { 
          "vendors.vendorStatus": status,
          "vendors.vendorId": { $ne: null } 
        };
      } else if (status === "notAssign") {
        statusQuery = {
          $or: [
            { "vendors.statusByVendor": "notAssign" },
            {
              $and: [
                { "vendors.statusByVendor": { $in: ["WIP", "approve", "complete", "reject"] } },
                { "vendors.vendorId": null }
              ]
            }
          ]
        };
      } else if (status === "WIP") {
        statusQuery = { 
          "vendors.statusByVendor": "WIP",
          "vendors.vendorId": { $ne: null } 
        };
      } else {
        statusQuery = { 
          "vendors.statusByVendor": status,
          "vendors.vendorId": { $ne: null } 
        };
      }
    }

    // Handle vendorId filter
    if (vendorId && vendorId !== "all") {
      const vendorIdArray = Array.isArray(vendorId) ? vendorId : vendorId.split(",");
      // statusQuery = { "vendors.vendorId": { $in: vendorIdArray.map(id => new ObjectId(id)) } };
      statusQuery = {
        ...statusQuery, // Preserve existing status conditions
        "vendors.vendorId": { $in: vendorIdArray.map(id => new ObjectId(id)) }
      };
    }

    // Handle branch filter
    let branchQuery = {};
    if (branch && branch !== "all") {
      const branchArray = Array.isArray(branch) ? branch : branch.split(",");
      branchQuery["salesPerson.branchId"] = { $in: branchArray.map(id => new ObjectId(id)) };
    }

    // Handle product filter
    let productQuery = {};
    if (product && product !== "all") {
      const productArray = Array.isArray(product) ? product : product.split(",");
      productQuery["customerDetailsData.productId"] = { $in: productArray.map(id => new ObjectId(id)) };
    }

    // Date handling functions
    function formatDateToISO(date) {
      return date instanceof Date && !isNaN(date) ? date.toISOString() : null;
    }

    let formattedStart = startDateFilter && startDateFilter !== "all"
      ? new Date(new Date(startDateFilter).setHours(0, 0, 0, 0))
      : null;

    let formattedEnd = endDateFilter && endDateFilter !== "all"
      ? new Date(new Date(endDateFilter).setHours(23, 59, 59, 999))
      : null;

    if (startDateFilter && endDateFilter && startDateFilter === endDateFilter) {
      formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
      formattedEnd = new Date(new Date(startDateFilter).setHours(23, 59, 59, 999));
    }

    formattedStart = formatDateToISO(formattedStart);
    formattedEnd = formatDateToISO(formattedEnd);

    // Search filter
    let searchFilter = {};
    if (search) {
      const searchRegex = new RegExp(search, "i");
      searchFilter = {
        $or: [
          { "customerDetailsData.customerFinId": searchRegex },
          { "applicantsDetails.fullName": searchRegex },
          { "applicantsDetails.fatherName": searchRegex },
          { "applicantsDetails.mobileNo": searchRegex },
        ],
      };
    }

    // Build the aggregation pipeline
    const aggregationPipeline = [
      {
        $match: {
          fileStatus: "active",
        },
      },
      { $unwind: "$vendors" },
      {
        $match: {
          ...statusQuery,
          ...vendorRoleMatch,
          ...(formattedStart && formattedEnd && {
            [dateFilterApply == "assign" ? "vendors.assignDate" : "vendors.vendorUploadDate"]: {
              $gte: formattedStart,
              $lte: formattedEnd,
            },
          }),
        },
      },
      {
        $lookup: {
          from: "customerdetails",
          localField: "customerId",
          foreignField: "_id",
          as: "customerDetailsData",
        },
      },
      { $unwind: { path: "$customerDetailsData", preserveNullAndEmptyArrays: true } },
      { $match: productQuery },
      {
        $lookup: {
          from: "employees",
          localField: "customerDetailsData.employeId",
          foreignField: "_id",
          as: "salesPerson",
        },
      },
      { $unwind: { path: "$salesPerson", preserveNullAndEmptyArrays: true } },
      { $match: branchQuery },
      {
        $lookup: {
          from: "newbranches",
          localField: "customerDetailsData.branch",
          foreignField: "_id",
          as: "branchDetails",
        },
      },
      { $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "applicantdetails",
          localField: "customerId",
          foreignField: "customerId",
          as: "applicantsDetails",
        },
      },
      { $unwind: { path: "$applicantsDetails", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "vendors",
          localField: "vendors.vendorId",
          foreignField: "_id",
          as: "vendorDetails",
        },
      },
      { $unwind: { path: "$vendorDetails", preserveNullAndEmptyArrays: true } },
      { $match: searchFilter },
    ];

    // Add facet stage based on vendorRole
    const facetStage = {
      metadata: [{ $count: "totalItems" }],
      vendorDetails: [
        {
          $group: {
            _id: "$customerId",
            customerId: { $first: "$customerId" },
            customerFinId: { $first: "$customerDetailsData.customerFinId" },
            fullName: { $first: "$applicantsDetails.fullName" },
            fatherName: { $first: "$applicantsDetails.fatherName" },
            mobileNo: { $first: "$applicantsDetails.mobileNo" },
            address: {
              $first: {
                addressLine1: "$applicantsDetails.permanentAddress.addressLine1",
                addressLine2: "$applicantsDetails.permanentAddress.addressLine2",
              }
            },
            branchName: { $first: "$branchDetails.name" },
            branchId: { $first: "$branchDetails._id" },
            productId: { $first: "$customerDetailsData.productId" },
            vendors: {
              $push: {
                initiationDate: { $ifNull: ["$vendors.assignDate", ""] },
                completeDate: { $ifNull: ["$vendors.vendorUploadDate", ""] },
                vendorId: { $ifNull: ["$vendors.vendorId", null] },
                vendorFullName: { $ifNull: ["$vendorDetails.fullName", ""] },
                vendorType: { $ifNull: ["$vendors.vendorType", ""] },
                assignDocuments: { $ifNull: ["$vendors.assignDocuments", []] },
                uploadDocuments: { $ifNull: ["$vendors.uploadProperty", []] },
                // fileStatus: { $ifNull: ["$vendors.statusByVendor", "notAssign"] },
                fileStatus :  {
                  $cond: {
                    if: { $eq: ["$vendors.vendorId", null] },
                    then: "notAssign",  // If vendorId is null, show as "notAssign" regardless of actual status
                    else: { $ifNull: ["$vendors.statusByVendor", "notAssign"] }  // Otherwise use actual status
                  }
                },
                vendorStatus: { $ifNull: ["$vendors.vendorStatus", ""] },
                approverDate: { $ifNull: ["$vendors.approverDate", null] },
                TAT: {
                  $let: {
                    vars: {
                      startDate: {
                        $dateFromString: {
                          dateString: {
                            $replaceAll: {
                              input: {
                                $replaceAll: {
                                  input: "$vendors.assignDate",
                                  find: " AM",
                                  replacement: ""
                                }
                              },
                              find: " PM",
                              replacement: ""
                            }
                          },
                          format: "%Y-%m-%dT%H:%M:%S",
                          onError: "$$NOW"
                        }
                      },
                      endDate: {
                        $cond: {
                          if: { $in: ["$vendors.statusByVendor", ["approve", "complete", "reject"]] },
                          then: {
                            $dateFromString: {
                              dateString: {
                                $replaceAll: {
                                  input: {
                                    $replaceAll: {
                                      input: "$vendors.vendorUploadDate",
                                      find: " AM",
                                      replacement: ""
                                    }
                                  },
                                  find: " PM",
                                  replacement: ""
                                }
                              },
                              format: "%Y-%m-%dT%H:%M:%S",
                              onError: "$$NOW"
                            }
                          },
                          else: "$$NOW"
                        }
                      }
                    },
                    in: {
                      $cond: {
                        if: { $eq: ["$vendors.assignDate", ""] },
                        then: 0,
                        else: {
                          $abs: {
                            $ceil: {
                              $divide: [
                                { $subtract: ["$$endDate", "$$startDate"] },
                                86400000  // milliseconds in a day
                              ]
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        { $sort: { customerFinId: 1 } },
        { $skip: skip },
        { $limit: parseInt(limit) }
      ]
    };

    // Add status counts for all vendorRole scenarios
    if (vendorRole !== "all") {
      // Refactor notAssignFiles to include WIP with null vendorId
      facetStage.notAssignFiles = [
        { 
          $match: { 
            $or: [
              { "vendors.statusByVendor": "notAssign" },
              {
                $and: [
                  { "vendors.statusByVendor": { $in: ["WIP", "approve", "complete", "reject"] } },
                  { "vendors.vendorId": null }
                ]
              }
            ]
          }
        },
        { $count: "count" },
      ];
      
      // Only count WIP with non-null vendorId
      facetStage.wipFiles = [
        { 
          $match: { 
            "vendors.statusByVendor": "WIP",
            "vendors.vendorId": { $ne: null }
          }
        },
        { $count: "count" },
      ];
      
      // Count complete/approve with non-null vendorId
      facetStage.completeFiles = [
        { 
          $match: { 
            "vendors.statusByVendor": { $in: ["approve", "complete"] },
            "vendors.vendorId": { $ne: null }
          }
        },
        { $count: "count" },
      ];
      
      // Count reject with non-null vendorId
      facetStage.rejectFiles = [
        { 
          $match: { 
            "vendors.statusByVendor": "reject",
            "vendors.vendorId": { $ne: null }
          }
        },
        { $count: "count" },
      ];
      
      // Count notRequired with non-null vendorId
      facetStage.notRequiredFiles = [
        { 
          $match: { 
            "vendors.statusByVendor": "notRequired",
            "vendors.vendorId": { $ne: null }
          }
        },
        { $count: "count" },
      ];
      
      // Add the status count for credit refer, positive, negative statuses
      facetStage.creditReferFiles = [
        { 
          $match: { 
            "vendors.vendorStatus": "credit refer",
            "vendors.vendorId": { $ne: null },
            "vendors.statusByVendor": { $in: ["approve", "complete"] }
          }
        },
        { $count: "count" },
      ];
      
      facetStage.positiveFiles = [
        { 
          $match: { 
            "vendors.vendorStatus": "positive",
            "vendors.vendorId": { $ne: null },
            "vendors.statusByVendor": { $in: ["approve", "complete"] }
          }
        },
        { $count: "count" },
      ];
      
      facetStage.negativeFiles = [
        { 
          $match: { 
            "vendors.vendorStatus": "negative",
            "vendors.vendorId": { $ne: null },
            "vendors.statusByVendor": { $in: ["approve", "complete"] }
          }
        },
        { $count: "count" },
      ];
    } else {
      // For "all" status, still correctly count the statuses by the same rules
      facetStage.notAssignFiles = [
        { 
          $match: { 
            $or: [
              { "vendors.statusByVendor": "notAssign" },
              {
                $and: [
                  { "vendors.statusByVendor": { $in: ["WIP", "approve", "complete", "reject"] } },
                  { "vendors.vendorId": null }
                ]
              }
            ]
          }
        },
        { $count: "count" },
      ];
      
      facetStage.wipFiles = [
        { 
          $match: { 
            "vendors.statusByVendor": "WIP",
            "vendors.vendorId": { $ne: null }
          }
        },
        { $count: "count" },
      ];
      
      facetStage.completeFiles = [
        { 
          $match: { 
            "vendors.statusByVendor": { $in: ["approve", "complete"] },
            "vendors.vendorId": { $ne: null }
          }
        },
        { $count: "count" },
      ];
      
      facetStage.rejectFiles = [
        { 
          $match: { 
            "vendors.statusByVendor": "reject",
            "vendors.vendorId": { $ne: null }
          }
        },
        { $count: "count" },
      ];
      
      facetStage.notRequiredFiles = [
        { 
          $match: { 
            "vendors.statusByVendor": "notRequired",
            "vendors.vendorId": { $ne: null }
          }
        },
        { $count: "count" },
      ];
      
      // Also add the vendor type counts when status is "all"
      dynamicVendors.forEach(vendorType => {
        facetStage[`${vendorType}`] = [
          {
            $match: {
              "vendors.vendorType": vendorType,
              "vendors.statusByVendor": { $in: ["approve", "complete"] },
              "vendors.vendorId": { $ne: null }
            }
          },
          { $count: "count" }
        ];
      });
    }

    aggregationPipeline.push({ $facet: facetStage });

    const results = await externalVendorModel.aggregate(aggregationPipeline);

    // Calculate response data
    const totalItems = results[0].metadata.length > 0 ? results[0].metadata[0].totalItems : 0;
    const totalPages = Math.ceil(totalItems / parseInt(limit));

    const response = {
      totalFiles: totalItems,
      details: results[0].vendorDetails,
      currentPage: parseInt(page),
      totalPages,
      totalItems,
      limit: parseInt(limit),
    };

    // Add status counts for all vendorRole scenarios
    // Only add the standard status counts regardless of vendorRole value
    response.notAssignFiles = results[0].notAssignFiles.length > 0 ? results[0].notAssignFiles[0].count : 0;
    response.wipFiles = results[0].wipFiles.length > 0 ? results[0].wipFiles[0].count : 0;
    response.completeFiles = results[0].completeFiles.length > 0 ? results[0].completeFiles[0].count : 0;
    response.notRequiredFiles = results[0].notRequiredFiles.length > 0 ? results[0].notRequiredFiles[0].count : 0;
    response.rejectFiles = results[0].rejectFiles.length > 0 ? results[0].rejectFiles[0].count : 0;

    // Add these status counts when applicable
    if (status == "approve") {
      response.negativeFiles = results[0].negativeFiles.length > 0 ? results[0].negativeFiles[0].count : 0;
      response.positiveFiles = results[0].positiveFiles.length > 0 ? results[0].positiveFiles[0].count : 0;
      response.creditReferFiles = results[0].creditReferFiles.length > 0 ? results[0].creditReferFiles[0].count : 0;
    } else {
      response.negativeFiles =  0;
      response.positiveFiles =  0;
      response.creditReferFiles =  0;
    }

    return success(res, "Vendor Dashboard For Admin", response);
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

//monthlyDashbordCount

async function monthlyDashbordCount(req, res) {
  try {
    const {
      status,
      vendorRole,
      vendorId,
      branch,
      product,
      page = 1,
      limit = 10000,
      search,
      dateFilterApply = "assign",
      startDateFilter,
      endDateFilter,
      year = new Date().getFullYear(),
      month,
    } = req.query;
    
    const dynamicVendors = ['rcu', 'legal', 'technical', 'rm', 'tagging', 'fi'];

    let statusQuery = {};
    let vendorRoleMatch = {};

    if (vendorRole && vendorRole !== "all") {
      vendorRoleMatch = { "vendors.vendorType": vendorRole };
    }

    // Handle status filter
    if (status && status !== "all") {
      if (status === "complete" || status === "approve") {
        statusQuery = { 
          "vendors.statusByVendor": { $in: ["approve", "complete", "reject"] },
          "vendors.vendorId": { $ne: null } 
        };
      } else if (["positive", "negative", "credit refer"].includes(status)) {
        statusQuery = { 
          "vendors.vendorStatus": status,
          "vendors.vendorId": { $ne: null } 
        };
      } else if (status === "notAssign") {
        statusQuery = {
          $or: [
            { "vendors.statusByVendor": "notAssign" },
            {
              $and: [
                { "vendors.statusByVendor": { $in: ["WIP", "approve", "complete", "reject"] } },
                { "vendors.vendorId": null }
              ]
            }
          ]
        };
      } else if (status === "WIP") {
        statusQuery = { 
          "vendors.statusByVendor": "WIP",
          "vendors.vendorId": { $ne: null } 
        };
      } else {
        statusQuery = { 
          "vendors.statusByVendor": status,
          "vendors.vendorId": { $ne: null } 
        };
      }
    }

    // Handle vendorId filter
    if (vendorId && vendorId !== "all") {
      const vendorIdArray = Array.isArray(vendorId) ? vendorId : vendorId.split(",");
      statusQuery = {
        ...statusQuery,
        "vendors.vendorId": { $in: vendorIdArray.map(id => new ObjectId(id)) }
      };
    }

    // Handle branch filter
    let branchQuery = {};
    if (branch && branch !== "all") {
      const branchArray = Array.isArray(branch) ? branch : branch.split(",");
      branchQuery["salesPerson.branchId"] = { $in: branchArray.map(id => new ObjectId(id)) };
    }

    // Handle product filter
    let productQuery = {};
    if (product && product !== "all") {
      const productArray = Array.isArray(product) ? product : product.split(",");
      productQuery["customerDetailsData.productId"] = { $in: productArray.map(id => new ObjectId(id)) };
    }

    // Date handling functions
    function formatDateToISO(date) {
      return date instanceof Date && !isNaN(date) ? date.toISOString() : null;
    }

    // Parse and set date range based on filters
    let formattedStart, formattedEnd;
    let specificYear = null;
    let isExactYearFilter = false;
    
    if (startDateFilter && endDateFilter && startDateFilter !== "all" && endDateFilter !== "all") {
      // Use provided date range
      formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
      formattedEnd = new Date(new Date(endDateFilter).setHours(23, 59, 59, 999));
      
      // Check if it's a full year filter (e.g., 2024-01-01 to 2024-12-31)
      const startYear = formattedStart.getFullYear();
      const endYear = formattedEnd.getFullYear();
      const startMonth = formattedStart.getMonth();
      const endMonth = formattedEnd.getMonth();
      const endDay = formattedEnd.getDate();
      
      if (startYear === endYear && startMonth === 0 && endMonth === 11 && endDay >= 30) {
        specificYear = startYear;
        isExactYearFilter = true;
      }
      
      if (startDateFilter === endDateFilter) {
        formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
        formattedEnd = new Date(new Date(startDateFilter).setHours(23, 59, 59, 999));
      }
    } else {
      // Default to current year
      if (month) {
        // If month is specified, filter for that month in the given year
        formattedStart = new Date(year, parseInt(month) - 1, 1, 0, 0, 0);
        formattedEnd = new Date(year, parseInt(month), 0, 23, 59, 59, 999);
      } else {
        // Otherwise filter for the entire year
        formattedStart = new Date(year, 0, 1, 0, 0, 0); // Jan 1st of year
        formattedEnd = new Date(year, 11, 31, 23, 59, 59, 999); // Dec 31st of year
        specificYear = parseInt(year);
        isExactYearFilter = true;
      }
    }
    
    formattedStart = formatDateToISO(formattedStart);
    formattedEnd = formatDateToISO(formattedEnd);

    // Search filter
    let searchFilter = {};
    if (search) {
      const searchRegex = new RegExp(search, "i");
      searchFilter = {
        $or: [
          { "customerDetailsData.customerFinId": searchRegex },
          { "applicantsDetails.fullName": searchRegex },
          { "applicantsDetails.fatherName": searchRegex },
          { "applicantsDetails.mobileNo": searchRegex },
        ],
      };
    }

    // Build the aggregation pipeline
    const aggregationPipeline = [
      {
        $match: {
          fileStatus: "active",
        },
      },
      { $unwind: "$vendors" },
      {
        $match: {
          ...statusQuery,
          ...vendorRoleMatch,
          ...(formattedStart && formattedEnd && {
            [dateFilterApply == "assign" ? "vendors.assignDate" : "vendors.vendorUploadDate"]: {
              $gte: formattedStart,
              $lte: formattedEnd,
            },
          }),
        },
      },
      {
        $lookup: {
          from: "customerdetails",
          localField: "customerId",
          foreignField: "_id",
          as: "customerDetailsData",
        },
      },
      { $unwind: { path: "$customerDetailsData", preserveNullAndEmptyArrays: true } },
      { $match: productQuery },
      {
        $lookup: {
          from: "employees",
          localField: "customerDetailsData.employeId",
          foreignField: "_id",
          as: "salesPerson",
        },
      },
      { $unwind: { path: "$salesPerson", preserveNullAndEmptyArrays: true } },
      { $match: branchQuery },
      {
        $lookup: {
          from: "newbranches",
          localField: "customerDetailsData.branch",
          foreignField: "_id",
          as: "branchDetails",
        },
      },
      { $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "applicantdetails",
          localField: "customerId",
          foreignField: "customerId",
          as: "applicantsDetails",
        },
      },
      { $unwind: { path: "$applicantsDetails", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "vendors",
          localField: "vendors.vendorId",
          foreignField: "_id",
          as: "vendorDetails",
        },
      },
      { $unwind: { path: "$vendorDetails", preserveNullAndEmptyArrays: true } },
      { $match: searchFilter },
    ];

    // Define the facet stage
    const facetStage = {
      metadata: [{ $count: "totalItems" }],
      notAssignFiles: [
        { 
          $match: { 
            $or: [
              { "vendors.statusByVendor": "notAssign" },
              {
                $and: [
                  { "vendors.statusByVendor": { $in: ["WIP", "approve", "complete", "reject"] } },
                  { "vendors.vendorId": null }
                ]
              }
            ]
          }
        },
        { $count: "count" },
      ],
      selfAssignFiles: [
        { 
          $match: { 
            "vendors.vendorId": { $ne: null }
          }
        },
        { $count: "count" },
      ],
      wipFiles: [
        { 
          $match: { 
            "vendors.statusByVendor": "WIP",
            "vendors.vendorId": { $ne: null }
          }
        },
        { $count: "count" },
      ],
      completeFiles: [
        { 
          $match: { 
            "vendors.statusByVendor": { $in: ["approve", "complete"] },
            "vendors.vendorId": { $ne: null }
          }
        },
        { $count: "count" },
      ],
      rejectFiles: [
        { 
          $match: { 
            "vendors.statusByVendor": "reject",
            "vendors.vendorId": { $ne: null }
          }
        },
        { $count: "count" },
      ],
      notRequiredFiles: [
        { 
          $match: { 
            "vendors.statusByVendor": "notRequired",
            "vendors.vendorId": { $ne: null }
          }
        },
        { $count: "count" },
      ],
      incomeSanctionFiles: [
        { 
          $match: { 
            "vendors.statusByVendor": "incomeSanction",
            "vendors.vendorId": { $ne: null }
          }
        },
        { $count: "count" },
      ],
      fileProcessRejectFiles: [
        { 
          $match: { 
            "vendors.statusByVendor": "fileProcessReject",
            "vendors.vendorId": { $ne: null }
          }
        },
        { $count: "count" },
      ],
      sendToPartnerPostDisbursedFiles: [
        { 
          $match: { 
            "vendors.statusByVendor": "sendToPartnerPostDisbursed",
            "vendors.vendorId": { $ne: null }
          }
        },
        { $count: "count" },
      ],
      sendToPartnerPreDisbursedFiles: [
        { 
          $match: { 
            "vendors.statusByVendor": "sendToPartnerPreDisbursed",
            "vendors.vendorId": { $ne: null }
          }
        },
        { $count: "count" },
      ],
      sendToPartnerSanctionFiles: [
        { 
          $match: { 
            "vendors.statusByVendor": "sendToPartnerSanction",
            "vendors.vendorId": { $ne: null }
          }
        },
        { $count: "count" },
      ]
    };

    // Add the facet stage to the pipeline
    const mainAggregationPipeline = [...aggregationPipeline, { $facet: facetStage }];

    // Monthly aggregation pipeline
    const monthlyAggregationPipeline = [
      ...aggregationPipeline,
      {
        $group: {
          _id: {
            year: { $year: { $dateFromString: { dateString: "$vendors.assignDate", onError: new Date() } } },
            month: { $month: { $dateFromString: { dateString: "$vendors.assignDate", onError: new Date() } } }
          },
          totalCount: { $sum: 1 },
          notAssignCount: {
            $sum: {
              $cond: [
                { $or: [
                  { $eq: ["$vendors.statusByVendor", "notAssign"] },
                  {
                    $and: [
                      { $in: ["$vendors.statusByVendor", ["WIP", "approve", "complete", "reject"]] },
                      { $eq: ["$vendors.vendorId", null] }
                    ]
                  }
                ]},
                1,
                0
              ]
            }
          },
          selfAssignCount: {
            $sum: {
              $cond: [
                { $ne: ["$vendors.vendorId", null] },
                1,
                0
              ]
            }
          },
          incomeSanctionCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ["$vendors.statusByVendor", "incomeSanction"] },
                  { $ne: ["$vendors.vendorId", null] }
                ]},
                1,
                0
              ]
            }
          },
          fileProcessRejectCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ["$vendors.statusByVendor", "fileProcessReject"] },
                  { $ne: ["$vendors.vendorId", null] }
                ]},
                1,
                0
              ]
            }
          },
          sendToPartnerPostDisbursedCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ["$vendors.statusByVendor", "sendToPartnerPostDisbursed"] },
                  { $ne: ["$vendors.vendorId", null] }
                ]},
                1,
                0
              ]
            }
          },
          sendToPartnerPreDisbursedCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ["$vendors.statusByVendor", "sendToPartnerPreDisbursed"] },
                  { $ne: ["$vendors.vendorId", null] }
                ]},
                1,
                0
              ]
            }
          },
          sendToPartnerSanctionCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ["$vendors.statusByVendor", "sendToPartnerSanction"] },
                  { $ne: ["$vendors.vendorId", null] }
                ]},
                1,
                0
              ]
            }
          },
          vendorTypeCounts: {
            $push: {
              vendorType: "$vendors.vendorType",
              status: "$vendors.statusByVendor",
              hasVendorId: { $cond: [{ $ne: ["$vendors.vendorId", null] }, true, false] }
            }
          }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ];

    // Execute the aggregation pipelines
    const [results, monthlyResults] = await Promise.all([
      externalVendorModel.aggregate(mainAggregationPipeline),
      externalVendorModel.aggregate(monthlyAggregationPipeline)
    ]);

    // Helper function to get month name
    function getMonthName(monthNum) {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return months[monthNum - 1];
    }

    // Helper function to create empty vendor type stats
    function createEmptyVendorTypeStats(vendorTypes) {
      const stats = {};
      vendorTypes.forEach(type => {
        stats[type] = {
          total: 0,
          complete: 0,
          wip: 0,
          reject: 0
        };
      });
      return stats;
    }

    // Helper function to update vendor type statistics - FIX: Added null checks
    function updateVendorTypeStats(targetData, vendorCounts, dynamicVendors) {
      // Fix: Make sure targetData and targetData.byVendorType exist
      if (!targetData || !targetData.byVendorType) {
        console.error("Error: targetData or targetData.byVendorType is undefined");
        return;
      }
      
      if (vendorCounts && Array.isArray(vendorCounts)) {
        // Group by vendor type and calculate stats
        const vendorTypeCounts = {};
        
        // Initialize for all vendor types
        dynamicVendors.forEach(vType => {
          vendorTypeCounts[vType] = { total: 0, complete: 0, wip: 0, reject: 0 };
        });
        
        // Count by vendor type
        vendorCounts.forEach(record => {
          const vType = record.vendorType;
          if (vType && dynamicVendors.includes(vType)) {
            // Increment total count
            vendorTypeCounts[vType].total++;
            
            // Count by status if vendor is assigned
            if (record.hasVendorId) {
              if (record.status === "WIP") {
                vendorTypeCounts[vType].wip++;
              } else if (record.status === "reject") {
                vendorTypeCounts[vType].reject++;
              } else if (["approve", "complete"].includes(record.status)) {
                vendorTypeCounts[vType].complete++;
              }
            }
          }
        });
        
        // Update the target data with calculated stats
        Object.keys(vendorTypeCounts).forEach(vType => {
          // Fix: Make sure the property exists before updating
          if (targetData.byVendorType[vType]) {
            targetData.byVendorType[vType] = vendorTypeCounts[vType];
          }
        });
      }
    }

    // Process monthly data based on filter criteria
    let monthlyData = [];
    
    if (isExactYearFilter && specificYear) {
      // For specific year filters, show all months of that year with zeros
      for (let monthNum = 1; monthNum <= 12; monthNum++) {
        // Create vendor type stats for each month
        const vendorTypeStats = createEmptyVendorTypeStats(dynamicVendors);
        
        // Add a month entry with zero counts
        monthlyData.push({
          month: `${getMonthName(monthNum)} ${specificYear}`,
          totalCount: 0,
          notAssignCount: 0,
          selfAssignCount: 0,
          incomeSanctionStatus: 0,
          fileProcessRejectStatus: 0,
          sendToPartnerPostDisbursedStatus: 0,
          sendToPartnerPreDisbursedStatus: 0,
          sendToPartnerSanctionStatus: 0,
          byVendorType: vendorTypeStats
        });
      }
      
      // Update months that have data
      monthlyResults.forEach(item => {
        if (item._id && item._id.year && item._id.month) {
          const yearVal = item._id.year;
          const monthNum = item._id.month;
          
          // Only process data for the specified year
          if (yearVal === specificYear) {
            // Find the index of this month in our array (0-based index for Jan)
            const monthIndex = monthNum - 1;
            
            if (monthIndex >= 0 && monthIndex < monthlyData.length) {
              // Update counts for this month
              monthlyData[monthIndex].totalCount = item.totalCount || 0;
              monthlyData[monthIndex].notAssignCount = item.notAssignCount || 0;
              monthlyData[monthIndex].selfAssignCount = item.selfAssignCount || 0;
              monthlyData[monthIndex].incomeSanctionStatus = item.incomeSanctionCount || 0;
              monthlyData[monthIndex].fileProcessRejectStatus = item.fileProcessRejectCount || 0;
              monthlyData[monthIndex].sendToPartnerPostDisbursedStatus = item.sendToPartnerPostDisbursedCount || 0;
              monthlyData[monthIndex].sendToPartnerPreDisbursedStatus = item.sendToPartnerPreDisbursedCount || 0;
              monthlyData[monthIndex].sendToPartnerSanctionStatus = item.sendToPartnerSanctionCount || 0;
              
              // Update vendor type statistics - make sure monthlyData[monthIndex] exists
              if (monthlyData[monthIndex]) {
                updateVendorTypeStats(monthlyData[monthIndex], item.vendorTypeCounts, dynamicVendors);
              }
            }
          }
        }
      });
    } else {
      // For date range filters, only include months that have data
      let hasDataForAnyMonth = false;
      
      monthlyResults.forEach(item => {
        if (item._id && item._id.year && item._id.month) {
          const year = item._id.year;
          const monthNum = item._id.month;
          
          // Create vendor type stats for this month
          const vendorTypeStats = createEmptyVendorTypeStats(dynamicVendors);
          
          // Create month data object
          const monthData = {
            month: `${getMonthName(monthNum)} ${year}`,
            totalCount: item.totalCount || 0,
            notAssignCount: item.notAssignCount || 0,
            selfAssignCount: item.selfAssignCount || 0,
            incomeSanctionStatus: item.incomeSanctionCount || 0,
            fileProcessRejectStatus: item.fileProcessRejectCount || 0,
            sendToPartnerPostDisbursedStatus: item.sendToPartnerPostDisbursedCount || 0,
            sendToPartnerPreDisbursedStatus: item.sendToPartnerPreDisbursedCount || 0,
            sendToPartnerSanctionStatus: item.sendToPartnerSanctionCount || 0,
            byVendorType: vendorTypeStats
          };
          
          // Update vendor type statistics
          if (item.vendorTypeCounts && Array.isArray(item.vendorTypeCounts)) {
            // Count by vendor type
            item.vendorTypeCounts.forEach(record => {
              const vType = record.vendorType;
              if (vType && dynamicVendors.includes(vType)) {
                // Increment total count
                monthData.byVendorType[vType].total++;
                
                // Count by status if vendor is assigned
                if (record.hasVendorId) {
                  if (record.status === "WIP") {
                    monthData.byVendorType[vType].wip++;
                  } else if (record.status === "reject") {
                    monthData.byVendorType[vType].reject++;
                  } else if (["approve", "complete"].includes(record.status)) {
                    monthData.byVendorType[vType].complete++;
                  }
                }
              }
            });
          }
          
          // Only add months that have data
          if (item.totalCount > 0) {
            monthlyData.push(monthData);
            hasDataForAnyMonth = true;
          }
        }
      });
      
      // If no months have data but we're in a date range filter, show current year months
      if (!hasDataForAnyMonth) {
        const defaultYear = new Date().getFullYear();
        
        for (let monthNum = 1; monthNum <= 12; monthNum++) {
          // Create vendor type stats for each month
          const vendorTypeStats = createEmptyVendorTypeStats(dynamicVendors);
          
          // Add a month entry with zero counts
          monthlyData.push({
            month: `${getMonthName(monthNum)} ${defaultYear}`,
            totalCount: 0,
            notAssignCount: 0,
            selfAssignCount: 0,
            incomeSanctionStatus: 0,
            fileProcessRejectStatus: 0,
            sendToPartnerPostDisbursedStatus: 0,
            sendToPartnerPreDisbursedStatus: 0,
            sendToPartnerSanctionStatus: 0,
            byVendorType: vendorTypeStats
          });
        }
      }
      
      // Sort by year and month
      monthlyData.sort((a, b) => {
        const [aMonth, aYear] = a.month.split(' ');
        const [bMonth, bYear] = b.month.split(' ');
        
        if (aYear !== bYear) {
          return parseInt(aYear) - parseInt(bYear); // Sort by year
        }
        
        const months = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        return months.indexOf(aMonth) - months.indexOf(bMonth); // Sort by month
      });
    }

    // Get the total counts
    const totalCount = results[0]?.metadata?.length > 0 ? results[0].metadata[0].totalItems : 0;
    const notAssignCount = results[0]?.notAssignFiles?.length > 0 ? results[0].notAssignFiles[0].count : 0;
    const selfAssignCount = results[0]?.selfAssignFiles?.length > 0 ? results[0].selfAssignFiles[0].count : 0;
    const incomeSanctionStatus = results[0]?.incomeSanctionFiles?.length > 0 ? 
      results[0].incomeSanctionFiles[0].count : 0;
    const fileProcessRejectStatus = results[0]?.fileProcessRejectFiles?.length > 0 ? 
      results[0].fileProcessRejectFiles[0].count : 0;
    const sendToPartnerPostDisbursedStatus = results[0]?.sendToPartnerPostDisbursedFiles?.length > 0 ? 
      results[0].sendToPartnerPostDisbursedFiles[0].count : 0;
    const sendToPartnerPreDisbursedStatus = results[0]?.sendToPartnerPreDisbursedFiles?.length > 0 ? 
      results[0].sendToPartnerPreDisbursedFiles[0].count : 0;
    const sendToPartnerSanctionStatus = results[0]?.sendToPartnerSanctionFiles?.length > 0 ? 
      results[0].sendToPartnerSanctionFiles[0].count : 0;

    // Build the response format
    const items = {
      totalCount,
      notAssignCount,
      selfAssignCount,
      incomeSanctionStatus,
      fileProcessRejectStatus,
      sendToPartnerPostDisbursedStatus,
      sendToPartnerPreDisbursedStatus,
      sendToPartnerSanctionStatus,
      monthlyData,
      fileCount: totalCount
    };

    // Include date range info in response
    const dateRange = {
      start: formattedStart,
      end: formattedEnd,
      year: specificYear || (formattedStart ? new Date(formattedStart).getFullYear() : new Date().getFullYear()),
      month: month ? parseInt(month) : null
    };

    // Return the final response
    return success(res, "Vendor Dashboard For Admin", items);
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


async function vendorTableByBranch(req, res) {
  try {
    const {
      vendorRole,
      page = 1,
      limit = 10000,
      dateFilterApply,
      startDateFilter,
      endDateFilter,
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);


    let statusQuery = {};

    if (vendorRole && vendorRole !== "all") {
      const vendorTypeArray = Array.isArray(vendorRole) ? vendorRole : vendorRole.split(",");
      statusQuery = { "vendors.vendorType": { $in: vendorTypeArray.map(id => id) } };
    }

    const today = new Date();
    const defaultStartDate = new Date(today.setHours(0, 0, 0, 0));
    const defaultEndDate = new Date(today.setHours(23, 59, 59, 999));

    function formatDateToISO(date) {
      // Ensure date is a valid date before calling toISOString
      return date instanceof Date && !isNaN(date) ? date.toISOString() : null;
    }

    let formattedStart = startDateFilter && startDateFilter !== "all"
      ? new Date(new Date(startDateFilter).setHours(0, 0, 0, 0))
      : null;

    let formattedEnd = endDateFilter && endDateFilter !== "all"
      ? new Date(new Date(endDateFilter).setHours(23, 59, 59, 999))
      : null;

    if (startDateFilter && endDateFilter && startDateFilter === endDateFilter) {
      formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
      formattedEnd = new Date(new Date(startDateFilter).setHours(23, 59, 59, 999));
    }

    // Format date to ISO if they are valid
    formattedStart = formatDateToISO(formattedStart);
    formattedEnd = formatDateToISO(formattedEnd);

    // Search filter
    let searchFilter = {};

    const results = await externalVendorModel.aggregate([
      {
        $match: {
          fileStatus: "active",
        },
      },
      { $unwind: "$vendors" },
      {
        $match: {
          ...statusQuery,
          ...(formattedStart && formattedEnd && {
            [dateFilterApply == "assign" ? "vendors.assignDate" : "vendors.vendorUploadDate"]: {
              $gte: formattedStart,
              $lte: formattedEnd,
            },
          }),
        },
      },
      {
        $lookup: {
          from: "customerdetails",
          localField: "customerId",
          foreignField: "_id",
          as: "customerDetailsData",
        },
      },
      { $unwind: { path: "$customerDetailsData", preserveNullAndEmptyArrays: true } },
      // { $match: productQuery },
      {
        $lookup: {
          from: "employees",
          localField: "customerDetailsData.employeId",
          foreignField: "_id",
          as: "salesPerson",
        },
      },
      { $unwind: { path: "$salesPerson", preserveNullAndEmptyArrays: true } },
      // { $match: branchQuery },
      {
        $lookup: {
          from: "newbranches",
          localField: "salesPerson.branchId",
          foreignField: "_id",
          as: "branchDetails",
        },
      },
      { $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true } },

      // **GROUPING BY BRANCH**
      // {
      //   $group: {
      //     _id: "$branchDetails._id", // Group by branchId
      //     branchName: { $first: "$branchDetails.name" },
      //     totalFiles: { $sum: 1 },
      //     notAssignFiles: {
      //       $sum: { $cond: [{ $eq: ["$vendors.statusByVendor", "notAssign"] }, 1, 0] },
      //     },
      //     wipFiles: {
      //       $sum: { $cond: [{ $eq: ["$vendors.statusByVendor", "WIP"] }, 1, 0] },
      //     },
      //     completeFiles: {
      //       $sum: {
      //         $cond: [{ $in: ["$vendors.statusByVendor", ["approve", "complete"]] }, 1, 0],
      //       },
      //     },
      //     rejectFiles: {
      //       $sum: { $cond: [{ $eq: ["$vendors.statusByVendor", "reject"] }, 1, 0] },
      //     },
      //     notRequiredFiles: {
      //       $sum: { $cond: [{ $eq: ["$vendors.statusByVendor", "notRequired"] }, 1, 0] },
      //     },
      //     creditReferFiles: {
      //       $sum: { $cond: [{ $eq: ["$vendors.vendorStatus", "credit refer"] }, 1, 0] },
      //     },
      //     positiveFiles: {
      //       $sum: { $cond: [{ $eq: ["$vendors.vendorStatus", "positive"] }, 1, 0] },
      //     },
      //     negativeFiles: {
      //       $sum: { $cond: [{ $eq: ["$vendors.vendorStatus", "negative"] }, 1, 0] },
      //     },
      //   },
      // },

      {
        $group: {
          _id: "$branchDetails._id", // Group by branchId
          branchName: { $first: "$branchDetails.name" },
          totalFiles: { $sum: 1 },
          
          notAssignFiles: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$vendors.statusByVendor", "notAssign"] }, 
                    { 
                      $and: [
                        { $eq: ["$vendors.statusByVendor", "WIP"] },
                        { $eq: ["$vendors.vendorId", null] } // If WIP and vendorId is null, count as notAssign
                      ]
                    }
                  ]
                },
                1, 0
              ]
            }
          },
      
          wipFiles: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ["$vendors.statusByVendor", "WIP"] },
                    { $ne: ["$vendors.vendorId", null] } // Only count WIP if vendorId is NOT null
                  ] 
                },
                1, 0
              ]
            }
          },
      
          completeFiles: {
            $sum: {
              $cond: [{ $in: ["$vendors.statusByVendor", ["approve", "complete"]] }, 1, 0],
            },
          },
      
          rejectFiles: {
            $sum: { $cond: [{ $eq: ["$vendors.statusByVendor", "reject"] }, 1, 0] },
          },
      
          notRequiredFiles: {
            $sum: { $cond: [{ $eq: ["$vendors.statusByVendor", "notRequired"] }, 1, 0] },
          },
      
          creditReferFiles: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$vendors.statusByVendor", "approve"] }, // Only count if statusByVendor is "approve"
                    { $eq: ["$vendors.vendorId", null] },
                    { $eq: ["$vendors.vendorStatus", "credit refer"] }
                  ]
                },
                1, 0
              ]
            }
          },
      
          positiveFiles: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$vendors.statusByVendor", "approve"] },
                    { $eq: ["$vendors.vendorId", null] },
                    { $eq: ["$vendors.vendorStatus", "positive"] }
                  ]
                },
                1, 0
              ]
            }
          },
      
          negativeFiles: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$vendors.statusByVendor", "approve"] },
                    { $eq: ["$vendors.vendorId", null] },
                    { $eq: ["$vendors.vendorStatus", "negative"] }
                  ]
                },
                1, 0
              ]
            }
          }
        }
      },

      
      {
        $match: {
          _id: { $ne: null },
        },
      },

      { $sort: { branchName: 1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
    ]);

    return success(res, `${vendorRole} Vendor Table`, {
      totalBranches: results.length,
      branches: results,
      currentPage: parseInt(page),
      totalPages: Math.ceil(results.length / parseInt(limit)),
      limit: parseInt(limit),
    });

  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


async function vendorTableByBranch(req, res) {
  try {
    const {
      vendorRole,
      page = 1,
      limit = 10000,
      dateFilterApply = 'assign',
      startDateFilter,
      endDateFilter,
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);


    let statusQuery = {};

    const vendorTypeDetail = await vendorTypeModel.find({status :"active"}).lean().select("_id vendorType");
    const vendorTypeArray = vendorTypeDetail.map(vendor => vendor.vendorType)
    
    if (vendorRole && vendorTypeArray.includes(vendorRole)) {
      statusQuery = { "vendors.vendorType": vendorRole };
    }else {
      return notFound(res, "Vendor Type not found");
    }

    const today = new Date();
    const defaultStartDate = new Date(today.setHours(0, 0, 0, 0));
    const defaultEndDate = new Date(today.setHours(23, 59, 59, 999));

    function formatDateToISO(date) {
      // Ensure date is a valid date before calling toISOString
      return date instanceof Date && !isNaN(date) ? date.toISOString() : null;
    }

    let formattedStart = startDateFilter && startDateFilter !== "all"
      ? new Date(new Date(startDateFilter).setHours(0, 0, 0, 0))
      : null;

    let formattedEnd = endDateFilter && endDateFilter !== "all"
      ? new Date(new Date(endDateFilter).setHours(23, 59, 59, 999))
      : null;

    if (startDateFilter && endDateFilter && startDateFilter === endDateFilter) {
      formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
      formattedEnd = new Date(new Date(startDateFilter).setHours(23, 59, 59, 999));
    }

    // Format date to ISO if they are valid
    formattedStart = formatDateToISO(formattedStart);
    formattedEnd = formatDateToISO(formattedEnd);

    // Search filter
    let searchFilter = {};

    const results = await externalVendorModel.aggregate([
      {
        $match: {
          fileStatus: "active",
        },
      },
      { $unwind: "$vendors" },
      {
        $match: {
          ...statusQuery,
          ...(formattedStart && formattedEnd && {
            [dateFilterApply == "assign" ? "vendors.assignDate" : "vendors.vendorUploadDate"]: {
              $gte: formattedStart,
              $lte: formattedEnd,
            },
          }),
        },
      },
      {
        $lookup: {
          from: "customerdetails",
          localField: "customerId",
          foreignField: "_id",
          as: "customerDetailsData",
        },
      },
      { $unwind: { path: "$customerDetailsData", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "employees",
          localField: "customerDetailsData.employeId",
          foreignField: "_id",
          as: "salesPerson",
        },
      },
      { $unwind: { path: "$salesPerson", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "newbranches",
          localField: "salesPerson.branchId",
          foreignField: "_id",
          as: "branchDetails",
        },
      },
      { $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true } },

      // **GROUPING BY BRANCH**
      {
        $group: {
          _id: "$branchDetails._id", // Group by branchId
          branchName: { $first: "$branchDetails.name" },
          totalFiles: { $sum: 1 },

          notAssignFiles: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$vendors.statusByVendor", "notAssign"] }, 
                    { 
                      $and: [
                        { $eq: ["$vendors.statusByVendor", "WIP"] },
                        { $eq: ["$vendors.vendorId", null] } // If WIP and vendorId is null, count as notAssign
                      ]
                    }
                  ]
                },
                1, 0
              ]
            }
          },
      
          wipFiles: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ["$vendors.statusByVendor", "WIP"] },
                    { $ne: ["$vendors.vendorId", null] } // Only count WIP if vendorId is NOT null
                  ] 
                },
                1, 0
              ]
            }
          },
      
          completeFiles: {
            $sum: {
              $cond: [{ $in: ["$vendors.statusByVendor", ["approve", "complete"]] }, 1, 0],
            },
          },
      
          rejectFiles: {
            $sum: { $cond: [{ $eq: ["$vendors.statusByVendor", "reject"] }, 1, 0] },
          },
      
          notRequiredFiles: {
            $sum: { $cond: [{ $eq: ["$vendors.statusByVendor", "notRequired"] }, 1, 0] },
          },
      
          creditReferFiles: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$vendors.statusByVendor", "approve"] },
                    { $eq: ["$vendors.vendorId", null] },  // Only count if statusByVendor is "approve"
                    { $eq: ["$vendors.vendorStatus", "credit refer"] }
                  ]
                },
                1, 0
              ]
            }
          },
      
          positiveFiles: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$vendors.statusByVendor", "approve"] },
                    { $eq: ["$vendors.vendorId", null] },
                    { $eq: ["$vendors.vendorStatus", "positive"] }
                  ]
                },
                1, 0
              ]
            }
          },
      
          negativeFiles: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$vendors.statusByVendor", "approve"] },
                    { $eq: ["$vendors.vendorId", null] },
                    { $eq: ["$vendors.vendorStatus", "negative"] }
                  ]
                },
                1, 0
              ]
            }
          },

          // notAssignFiles: {
          //   $sum: { $cond: [{ $eq: ["$vendors.statusByVendor", "notAssign"] }, 1, 0] },
          // },
          // wipFiles: {
          //   $sum: { $cond: [{ $eq: ["$vendors.statusByVendor", "WIP"] }, 1, 0] },
          // },
          // completeFiles: {
          //   $sum: {
          //     $cond: [{ $in: ["$vendors.statusByVendor", ["approve", "complete"]] }, 1, 0],
          //   },
          // },
          // rejectFiles: {
          //   $sum: { $cond: [{ $eq: ["$vendors.statusByVendor", "reject"] }, 1, 0] },
          // },
          // notRequiredFiles: {
          //   $sum: { $cond: [{ $eq: ["$vendors.statusByVendor", "notRequired"] }, 1, 0] },
          // },
          // creditReferFiles: {
          //   $sum: { $cond: [{ $eq: ["$vendors.vendorStatus", "credit refer"] }, 1, 0] },
          // },
          // positiveFiles: {
          //   $sum: { $cond: [{ $eq: ["$vendors.vendorStatus", "positive"] }, 1, 0] },
          // },
          // negativeFiles: {
          //   $sum: { $cond: [{ $eq: ["$vendors.vendorStatus", "negative"] }, 1, 0] },
          // },
        },
      },

      {
        $match: {
          _id: { $ne: null },
        },
      },

      { $sort: { branchName: 1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
    ]);

    return success(res, `${vendorRole} Vendor Table`, {
      totalBranches: results.length,
      branches: results,
      currentPage: parseInt(page),
      totalPages: Math.ceil(results.length / parseInt(limit)),
      limit: parseInt(limit),
    });

  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

async function vendorTableByvendor(req, res) {
  try {
    const {
      vendorRole,
      page = 1,
      limit = 10000,
      dateFilterApply = 'assign',
      startDateFilter,
      endDateFilter,
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);


    let statusQuery = {};

    const vendorTypeDetail = await vendorTypeModel.find({status :"active"}).lean().select("_id vendorType");
    const vendorTypeArray = vendorTypeDetail.map(vendor => vendor.vendorType)
    
    if (vendorRole && vendorTypeArray.includes(vendorRole)) {
      statusQuery = { "vendors.vendorType": vendorRole };
    }else {
      return notFound(res, "Vendor Type not found");
    }

    const today = new Date();
    const defaultStartDate = new Date(today.setHours(0, 0, 0, 0));
    const defaultEndDate = new Date(today.setHours(23, 59, 59, 999));

    function formatDateToISO(date) {
      // Ensure date is a valid date before calling toISOString
      return date instanceof Date && !isNaN(date) ? date.toISOString() : null;
    }

    let formattedStart = startDateFilter && startDateFilter !== "all"
      ? new Date(new Date(startDateFilter).setHours(0, 0, 0, 0))
      : null;

    let formattedEnd = endDateFilter && endDateFilter !== "all"
      ? new Date(new Date(endDateFilter).setHours(23, 59, 59, 999))
      : null;

    if (startDateFilter && endDateFilter && startDateFilter === endDateFilter) {
      formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
      formattedEnd = new Date(new Date(startDateFilter).setHours(23, 59, 59, 999));
    }

    // Format date to ISO if they are valid
    formattedStart = formatDateToISO(formattedStart);
    formattedEnd = formatDateToISO(formattedEnd);

    // Search filter
    let searchFilter = {};

    const results = await externalVendorModel.aggregate([
      {
        $match: {
          fileStatus: "active",
        },
      },
      { $unwind: "$vendors" },
      {
        $match: {
          ...statusQuery,
          ...(formattedStart && formattedEnd && {
            [dateFilterApply == "assign" ? "vendors.assignDate" : "vendors.vendorUploadDate"]: {
              $gte: formattedStart,
              $lte: formattedEnd,
            },
          }),
        },
      },

      {
        $lookup: {
          from: "vendors",
          localField: "vendors.vendorId",
          foreignField: "_id",
          as: "vendorDetails",
        },
      },
      { $unwind: { path: "$vendorDetails", preserveNullAndEmptyArrays: true } },
      {
        $match: {
          "vendorDetails.status": "active",
        },
      },

      {
        $lookup: {
          from: "vendortypes",
          localField: "vendorDetails.vendorType",
          foreignField: "_id",
          as: "vendortypeDetails",
        },
      },
      { $unwind: { path: "$vendortypeDetails", preserveNullAndEmptyArrays: true } },
      {
        $match: {
          "vendortypeDetails.status": "active",
        },
      },
      // **GROUPING BY BRANCH**
      {
        $group: {
          _id: "$vendorDetails._id", // Group by branchId
          vendorName: { $first: "$vendorDetails.fullName" },
          vendorTypes: { $addToSet: "$vendortypeDetails.vendorType" },
          totalFiles: { $sum: 1 },
          notAssignFiles: {
            $sum: { $cond: [{ $eq: ["$vendors.statusByVendor", "notAssign"] }, 1, 0] },
          },
          wipFiles: {
            $sum: { $cond: [{ $eq: ["$vendors.statusByVendor", "WIP"] }, 1, 0] },
          },
          completeFiles: {
            $sum: {
              $cond: [{ $in: ["$vendors.statusByVendor", ["approve", "complete"]] }, 1, 0],
            },
          },
          rejectFiles: {
            $sum: { $cond: [{ $eq: ["$vendors.statusByVendor", "reject"] }, 1, 0] },
          },
          notRequiredFiles: {
            $sum: { $cond: [{ $eq: ["$vendors.statusByVendor", "notRequired"] }, 1, 0] },
          },
          creditReferFiles: {
            $sum: { $cond: [{ $eq: ["$vendors.vendorStatus", "credit refer"] }, 1, 0] },
          },
          positiveFiles: {
            $sum: { $cond: [{ $eq: ["$vendors.vendorStatus", "positive"] }, 1, 0] },
          },
          negativeFiles: {
            $sum: { $cond: [{ $eq: ["$vendors.vendorStatus", "negative"] }, 1, 0] },
          },
        },
      },

      {
        $match: {
          _id: { $ne: null },
        },
      },

      { $sort: { branchName: 1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
    ]);

    return success(res, `${vendorRole} Vendor Table`, {
      totalVendor: results.length,
      vendorDetails: results,
      currentPage: parseInt(page),
      totalPages: Math.ceil(results.length / parseInt(limit)),
      limit: parseInt(limit),
    });

  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


async function perticulerVendorsPriceCalculate(req, res) {
  try {
    const { vendorId, startDateFilter = "all", endDateFilter = "all" } = req.query;

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

    // Initial match conditions
    const matchConditions = {
      "vendors.vendorId": new ObjectId(vendorId),
      "vendors.statusByVendor": { $in: ["complete", "approve"] }
    };

    // Add date filter if dates are provided
    if (startDateFilter && endDateFilter && startDateFilter !== "all" && endDateFilter !== "all") {
      matchConditions["vendors.vendorUploadDate"] = {
        $gte: formattedStart,
        $lt: formattedEnd,
      };
    }


    const result = await externalVendorModel.aggregate([
      { $unwind: "$vendors" },
      {
        $match: matchConditions
      },
      {
        $lookup: {
          from: "vendors",
          let: { vendorId: "$vendors.vendorId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$vendorId"] }
              }
            },
            {
              $project: {
                rate: 1
              }
            }
          ],
          as: "vendorDetails"
        }
      },
      { $unwind: "$vendorDetails" },

      // Lookup customer details
      {
        $lookup: {
          from: "customerdetails",
          let: { customerId: "$customerId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$customerId"] }
              }
            },
            {
              $project: {
                customerFinId: 1
              }
            }
          ],
          as: "customerDetailData"
        }
      },
      { $unwind: "$customerDetailData" },

      // Lookup applicant details
      {
        $lookup: {
          from: "applicantdetails",
          let: { customerId: "$customerId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$customerId", "$$customerId"] }
              }
            },
            {
              $project: {
                fullName: 1
              }
            }
          ],
          as: "applicantDetailData"
        }
      },
      { $unwind: "$applicantDetailData" },

      // Group for final result
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: { $multiply: ["$vendorDetails.rate", 1] }
          },
          files: {
            $push: {
              customerId: "$customerId",
              customerFinId: "$customerDetailData.customerFinId",
              customerName: "$applicantDetailData.fullName",
              vendorUploadDate: "$vendors.vendorUploadDate",
              assignDate: "$vendors.assignDate"
            }
          }
        }
      },

      // Final projection
      {
        $project: {
          _id: 0,
          totalAmount: 1,
          files: 1
        }
      }
    ]);

    // Format response
    const response = result.length > 0 ? result[0] : {
      totalAmount: 0,
      files: []
    };

    return success(res, "customerDetails", response);

  } catch (error) {
    console.error('Error in perticulerVendorsPriceCalculate:', error);
    return unknownError(res, "Internal Server Error", error);
  }
}


async function newVendorCreateFoModel(req, res) {
  try {
    const { vendorType } = req.query;

    if (!vendorType) {
      return badRequest(res, "Vendor Type Required");
    }

    const vendorCheck = await vendorTypeModel.findOne({ vendorType: vendorType, status: "active" });

    if (!vendorCheck) {
      return notFound(res, "Vendor Type Not Found");
    }

    const allDocuments = await externalVendorModel.find({});

    let vendorAdded = false;

    for (let doc of allDocuments) {
      const vendorExists = doc.vendors.some(vendor => vendor.vendorType === vendorType);

      if (vendorExists) {
        // console.log('vendor Find -----')
        continue;
      }
      // console.log('vendor Not Find ////---////')
      await externalVendorModel.findByIdAndUpdate(doc._id, {
        $push: {
          vendors: {
            vendorType,
            vendorId: null,
            assignDocuments: [],
            pdfRemark: "",
            externalVendorRemark: "",
            uploadProperty: [],
            finalLegalUpload: [],
            vettingLegalUpload: [],
            estimateDocument: [],
            remarkByVendor: "",
            sendMail: "mailNotSend",
            statusByVendor: "notAssign",
            fileStageStatus: "",
            vendorStatus: "",
            reason: "",
            requirement: [],
            vendorUploadDate: "",
            approverRemark: "",
            assignDate: "",
            approverEmployeeId: null,
            assignEmployeeId: null
          }
        }
      });

      vendorAdded = true;
    }

    if (vendorAdded) {
      return success(res, "Vendor added successfully to an available document");
    } else {
      return badRequest(res, "Vendor Type already exists in all documents, no changes made");
    }

  } catch (error) {
    console.error('Error in newVendorCreateFoModel:', error);
    return unknownError(res, "Internal Server Error", error);
  }
}




module.exports = {
  fileStatusRevertByVendor,
  // addExternalVendor,
  getDetailsByCustomerId,
  assignFilesAllVendors,
  externalManagerFormDetail,
  getCustomerList,
  getCustoemrDetail,
  externalVendorList,
  addByAllVendors,
  AllVendorsFormShowList,
  vendorShowList,
  vendorAssignFormDetails,
  externalManagerDashboard,
  allVendorCasesList,
  AllFileApproveRejectList,
  fileApprovedReject,
  getBranchEmployeeAssignData,
  updateBranchEmployeeData,
  getHOEmployeeAssignData,
  updateHOVendorData,
  intenalVendorDashboard,
  getVendorDataByCustomerId,
  fileHoldList,
  fileHoldByCustomerId,
  getCustomreFileDetail,
  externalManagerHistory,
  // externalManagerDashboardTest
  updateAllPdDataToSheetTest,
  perticulerVendorsDashBoard,
  allVendorsDashBoard,
  vendorTableByBranch,
  vendorTableByvendor,
  perticulerVendorsPriceCalculate,
  newVendorCreateFoModel,
  monthlyDashbordCount
};
