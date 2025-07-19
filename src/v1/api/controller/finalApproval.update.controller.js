const {
  success,
  unknownError,
  serverValidation,
  badRequest,
  notFound,
  parseJwt,
} = require("../../../../globalHelper/response.globalHelper");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const moment = require("moment");
const ObjectId = mongoose.Types.ObjectId;
const employeModel = require("../model/adminMaster/employe.model.js");
const coApplicantModel = require("../model/co-Applicant.model");
const applicantModel = require("../model/applicant.model.js");
const guarantorModel = require("../model/guarantorDetail.model");
const referenceModel = require("../model/reference.model");
const customerModel = require("../model/customer.model");
const bankAccountModel = require("../model/banking.model");
const bankModel = require("../model/bankAccount.model.js");
const productModel = require("../model/adminMaster/product.model");
const processModel = require("../model/process.model.js");
const cibilModel = require("../model/cibilDetail.model.js");
const { createOrder } = require("../services/razorpay.js");
const salesCaseModel = require("../model/salesCase.model.js");
const { updateFileFields } = require("./functions.Controller.js");
const aadharModel = require("../model/aadhaar.model.js");
const aadharOcrModel = require("../model/aadhaarOcr.model.js");
const panFatherModel = require("../model/panFather.model.js");
const panComprehensiveModel = require("../model/panComprehensive.model.js");
const permissionModel = require("../model/adminMaster/permissionForm.model.js");
const leadGenerateModel = require("../model/leadGenerate.model.js");
const employeeModel = require("../model/adminMaster/employe.model.js");
// const branchModel = require("../model/adminMaster/branch.model.js");
const newBranchModel = require("../model/adminMaster/newBranch.model.js");
const creditPdModel = require("../model/credit.Pd.model.js");
const { paginationData } = require("../helper/pagination.helper.js");
const udyamModel = require("../model/branchPendency/udhyamKyc.model.js");
const gtrPdcModel = require("../model/branchPendency/gtrPdc.model.js");
const appPdcModel = require("../model/branchPendency/appPdc.model.js");
const approverFormModel = require("../model/branchPendency/approverTechnicalFormModel.js");
const electricityKycModel = require("../model/branchPendency/electricityKyc.model.js");
const samagraIdModel = require("../model/branchPendency/samagraIdKyc.model.js");
const udhyamKycModel = require("../model/branchPendency/udhyamKyc.model.js");
const bankStatementModel = require("../model/branchPendency/bankStatementKyc.model.js");
const salaryAndOtherIncomeModel = require("../model/branchPendency/salaryAndOtherIncomeModel.js");
const milkIncomeModel = require("../model/branchPendency/milkIncomeModel.js");
const otherBuisnessModel = require("../model/branchPendency/otherBusinessModel.js");
const propertyPaperKycModel = require("../model/branchPendency/propertyPaper.model.js");
const nachRegistrationKyModel = require("../model/branchPendency/nachRegistration.model.js");
const physicalFileCourierModel = require("../model/physicalFileCourier.model.js");
const rmPaymentUpdateModel = require("../model/branchPendency/rmPaymentUpdateModel.js");
const agricultureModel = require("../model/branchPendency/agricultureIncomeModel.js");
const externalVendorFormModel = require("../model/externalManager/externalVendorDynamic.model.js");
const technicalApproveFormModel = require("../model/branchPendency/approverTechnicalFormModel.js");
const tvrModel = require("../model/fileProcess/tvr.model.js");
// const finalSanctionModel = require("../model/fileProcess/finalSanction.model.js");
const final = require("../model/finalSanction/finalSnction.model.js");
const legalReportModel = require("../model/branchPendency/approveLegalForm.model.js");
const esignPhotoModel = require("../model/branchPendency/esignPhoto.model.js");
const disbursementModel = require("../model/fileProcess/disbursement.model.js");
const jinamEntryModel = require("../model/fileProcess/jinamEntry.model.js");
const fileEnventoryModel = require("../model/fileProcess/fileEnventory.model.js");
const camReportModel = require("../model/fileProcess/camReport.model.js");
const cibilkycModel = require("../model/fileProcess/cibilScoreKyc.model.js");
const rcuKycModel = require("../model/fileProcess/rcuKyc.model.js");
const pincodeModel = require("../model/pincode/pincode.model.js")
const vendorModel = require("../model/adminMaster/vendor.model.js");
const {finalApprovalSheet} = require("../controller/finalSanction/faGoogleSheet.controller.js")

const { sendEmail } = require("../controller/functions.Controller.js");
const {
  sectionLatter,
} = require("../controller/ratnaaFin/sectionLatter.controller.js");
const {
  applicantLatter,
} = require("../controller/ratnaaFin/newApplicant.controller.js");
const {
  rcplLoanAgreement,
} = require("../controller/growMoneyPdf/rcplLoanAggrement.js");
const {
  LdAndPdDeed,
} = require("../controller/ratnaaFin/loanDocument.controller.js");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const FormData = require("form-data");
const { initESign } = require("../services/legality.services.js");
const FinpdfLogo = path.join(
  __dirname,
  "../../../../assets/image/FINCOOPERSLOGO.png"
);
const RatnapdfLogo = path.join(
  __dirname,
  "../../../../assets/image/image_1727359738344.file_1727075312891.ratnaafin (1).png"
);
const growPdfLogo = path.join(
  __dirname,
  "../../../../assets/image/gmcpl logo.png"
);
const {
  growPgDeedPdf,
} = require("../controller/growMoneyPdf/pdDeed.contorller.js");
const {
  growSanctionLetterPdf,
} = require("../controller/growMoneyPdf/sanctionLetter.controller.js");
const {
  growApplicantPdf,
} = require("../controller/growMoneyPdf/aplication.controller.js");
const { google } = require("googleapis");
const credentials = require("../../../../credential.json");
const loanDocumentModel = require("../model/finalApproval/allDocument.model.js");
// const disbursementModel = require("../model/fileProcess/disbursement.model.js");

//all finalApproval updates apis

const updateCustomerDetails = async (req, res) => {
  try {
    const { customerId } = req.body; // Customer ID from the request params
    const updateData = req.body; // Data to update from request body

    if (!customerId) {
      return badRequest(res, "Customer ID is required");
    }

    // Update `customerModel`
    const customerUpdate = {
      ...(updateData.customerFinId && {
        customerFinId: updateData.customerFinId,
      }),
      ...(updateData.mobileNo && { mobileNo: updateData.mobileNo }),
      ...(updateData.loanAmount && { loanAmount: updateData.loanAmount }),
      ...(updateData.roi && { roi: updateData.roi }),
      ...(updateData.tenure && { tenure: updateData.tenure }),
      ...(updateData.emi && { emi: updateData.emi }),
      ...(updateData.executiveName && {
        executiveName: updateData.executiveName,
      }),
    };

    const updatedCustomer = await customerModel.findOneAndUpdate(
      { _id: customerId },
      { $set: customerUpdate },
      { new: true }
    );

    if (!updatedCustomer) {
      return notFound(res, "Customer not found");
    }

    const applicantDetail = await applicantModel.findOneAndUpdate(
      { customerId },
      { $set: updateData.applicantDetail },
      { new: true }
    );

    // Update `tvrDetails`
    const tvrDetails = await tvrModel.findOneAndUpdate(
      { customerId },
      { $set: updateData.tvrDetails },
      { new: true }
    );

    // Update `cibildetailDetail`
    const cibildetailDetail = await cibilModel.findOneAndUpdate(
      { customerId },
      { $set: updateData.cibildetailDetail },
      { new: true }
    );

    // Update `newbranchDetails`
    const newbranchDetails = await newBranchModel.findOneAndUpdate(
      { customerId },
      { $set: updateData.newbranchDetails },
      { new: true }
    );

    const response = {
      ...updatedCustomer._doc,
      applicantDetail,
      tvrDetails,
      cibildetailDetail,
      newbranchDetails,
    };

    return success(res, "Customer details updated successfully", response);
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
};

const updateCustomerApplicantDetail = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    let { customerId } = req.body;
    const tokenId = req.Id
    const {
      ApplicantDetails,
      kycDetailsOf,
      contactInformation,
      persnalDetails,
      permanentInformation,
      presentInformation,
      basicInformation,
      financialOverview,
      accountSummary,
      applicantData,
      referenceDetails,
      bankApplicantDetails,
      kycUpload
    } = req.body;
    // console.log(req.body,"req.body<><><?<?<<<>>>><<>>")
    if (!customerId) {
      return badRequest(res, "Customer ID is required.");
    }


    
    const customerDetails = await customerModel.findById(customerId)

    if (!customerDetails) {
      return badRequest(res , "Customer Not Found");
    }

    customerId = new mongoose.Types.ObjectId(customerId);

    // Update in applicantModel
    const data = await applicantModel.findOneAndUpdate(
      { customerId },
      {
        $set: {
          employeId:customerDetails.employeId,
          formUpdatedEmployeeId : tokenId,
          fullName: ApplicantDetails?.fullName,
          fatherName: ApplicantDetails?.fatherName,
          motherName: ApplicantDetails?.motherName,
          spouseName: ApplicantDetails?.spouseName,
          dob: ApplicantDetails?.dob,
          age: ApplicantDetails?.age,
          gender: ApplicantDetails?.gender,
          caste: ApplicantDetails?.caste,
          maritalStatus: ApplicantDetails?.maritalStatus,
          education: ApplicantDetails?.educationalDetails,
          religion: ApplicantDetails?.religion,
          category: ApplicantDetails?.category,

        applicantType: ApplicantDetails?.ApplicantType,
        businessType: ApplicantDetails?.bussinessType,
        nationality: persnalDetails?.nationality,
        houseLandMark: presentInformation?.landmark,
        alternateMobileNo: contactInformation?.mobileNoTwo,
        noOfyearsAtCurrentAddress:   presentInformation?.noOfyearsAtCurrentAddress,
        noOfDependentWithCustomer: ApplicantDetails?.noOfDependentWithCustomer,
        occupation:  ApplicantDetails?.occupation,
        residenceType: ApplicantDetails?.residenceType,

          permanentAddress: {
            addressLine2: presentInformation?.addressLine2,
            addressLine1: presentInformation?.addressAsPerAdhar,
            city: presentInformation?.city,
            state: presentInformation?.state,
            district:presentInformation?.district,
            pinCode: presentInformation?.pinCode,
          },
          kycUpload: {
            aadharFrontImage:kycUpload?.aadharFrontImage || "",
            aadharBackImage: kycUpload?.aadharBackImage || "",
            panFrontImage: kycUpload?.panFrontImage || "",
            drivingLicenceImage: kycUpload?.drivingLicenceImage || "",
            voterIdImage: kycUpload?.voterIdImage || "",
          },
          localAddress: {
            addressLine1: presentInformation?.addressAsPerAdhar,
            addressLine2: presentInformation?.addressLine2,
            city: presentInformation?.city,
            state: presentInformation?.state,
            district: presentInformation?.district,
            pinCode: presentInformation?.pinCode,
          },
          panNo: kycDetailsOf?.panNo,
          aadharNo: kycDetailsOf?.aadharNo,
          voterIdNo: kycDetailsOf?.voterIdNo,
          mobileNo: contactInformation?.mobileNo,
          email: contactInformation?.email,
        },
      },
      {
        new: true,
      }
    );
    // console.log(data, "datadatadata");
    // Update in creditPdModel

    const creditPdData = await creditPdModel.findOne({ customerId });

    if (!creditPdData) {
      // If customerId doesn't exist, create a new document
      await creditPdModel.create({
        customerId,
        applicant: {
          applicantType: ApplicantDetails?.ApplicantType,
          businessType: ApplicantDetails?.bussinessType,
          nationality: persnalDetails?.nationality,
          caste: ApplicantDetails?.caste,
          religion: persnalDetails?.religion,
          houseLandMark: presentInformation?.landmark,
          alternateMobileNo: contactInformation?.mobileNoTwo,
          noOfyearsAtCurrentAddress: presentInformation?.noOfyearsAtCurrentAddress,
          noOfDependentWithCustomer: ApplicantDetails?.noOfDependentWithCustomer,
          occupation: ApplicantDetails?.occupation,
          residenceType: ApplicantDetails?.residenceType,
        },
      });
    } else {
      // If customerId exists, update the existing document
      await creditPdModel.findOneAndUpdate(
        { customerId },
        {
          $set: {
            "applicant.applicantType": ApplicantDetails?.ApplicantType,
            "applicant.businessType": ApplicantDetails?.bussinessType,
            "applicant.nationality": persnalDetails?.nationality,
            "applicant.caste": ApplicantDetails?.caste,
            "applicant.religion": persnalDetails?.religion,
            "applicant.houseLandMark": presentInformation?.landmark,
            "applicant.alternateMobileNo": contactInformation?.mobileNoTwo,
            "applicant.noOfyearsAtCurrentAddress": presentInformation?.noOfyearsAtCurrentAddress,
            "applicant.noOfDependentWithCustomer": ApplicantDetails?.noOfDependentWithCustomer,
            "applicant.occupation": ApplicantDetails?.occupation,
            "applicant.residenceType": ApplicantDetails?.residenceType,
          },
        },
        { new: true }
      );
    }
    

    // Update in udyamModel
    const udyamdatasDetail = await udyamModel.findOneAndUpdate(
      { customerId },
      {
        $set: {
          udhyamRegistrationNo: kycDetailsOf?.udyamRegistrationNo,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );
    // console.log(
    //   udyamdatasDetail,
    //   "udyamdatasDetailudyamdatasDetailudyamdatasDetail"
    // );
    // Update in cibilModel
    // const civilDetails = await cibilModel.findOneAndUpdate(
    //   { customerId },
    //   {
    //     $set: {
    //       applicantCibilScore: parseInt(applicantData?.applicantCibilScore),
    //       applicantTotalAccount: applicantData?.totalAccounts,
    //       applicantOverdueAccount: applicantData?.overdueAccount,
    //       applicantZeroBalanceAccount: applicantData?.zeroBalanceAccount,
    //       applicantHighCreditSanctionAmount:
    //         applicantData?.appFinancialOverview?.HighCreditAndSanctionAmount,
    //       // applicantcurrentOutstanding: parseInt(
    //       //   applicantData?.appFinancialOverview?.TotalCurrentOutstanding
    //       // ),
    //       applicantTotalOverDueAmount:
    //         applicantData?.appFinancialOverview?.TotalOverdueAmount,
    //       applicantNumberOfEnquiry:
    //         applicantData?.appFinancialOverview?.TotalNumberOfEnquiry,
    //     },
    //   },
    //   {
    //     new: true,
    //   }
    // );

    // const referenceData = await creditPdModel.findOneAndUpdate(
    //   { customerId },
    //   { $set: { referenceDetails } },
    //   { new: true } // To return the updated document
    // );

    // const reference =
    //   Array.isArray(referenceData?.referenceDetails) &&
    //   referenceData?.referenceDetails.length > 0
    //     ? referenceData?.referenceDetails.map((value) => ({
    //         name: value.name || " ",
    //         address: value.address || " ",
    //         relation: value.relation || " ",
    //         mobileNumber: value.mobileNumber || " ",
    //       }))
    //     : [
    //         {
    //           name: " ",
    //           address: " ",
    //           relation: " ",
    //           mobileNumber: " ",
    //         },
    //       ];

    // const appPdcData = await appPdcModel.findOneAndUpdate(
    //   { customerId },
    //   {
    //     $set: {
    //       acHolderName: bankApplicantDetails.acHolderName,
    //       branchName: bankApplicantDetails.bankBranch,
    //       accountNumber: bankApplicantDetails.accountNumber,
    //       accountType: bankApplicantDetails.accountType,
    //       ifscCode: bankApplicantDetails.ifscCode,
    //       bankName: bankApplicantDetails.bankName,
    //     },
    //   },
    //   {
    //     new: true,
    //   }
    // );

    const responseData = {
      ApplicantDetails: {
        ApplicantType: data?.applicantType || "",
        bussinessType: data?.businessType || " ",
        applicantPhoto: data?.applicantPhoto || "",
        fullName: data?.fullName || "",
        fatherName: data?.fatherName || "",
        motherName: data?.motherName || "",
        spouseName: data?.spouseName || "",
        dob: data?.dob || "",
        age: data?.age || "",
        gender: data?.gender || "",
        caste: data?.caste || "",
        maritalStatus: data?.maritalStatus || "",
        educationalDetails: data?.education || "",
        religion: data?.religion || "",
        nationality: "India" || "",
        caste: data?.caste || "",
        category: data?.category || "",
        noOfDependentWithCustomer:
          data?.noOfDependentWithCustomer || "",
        occupation: data?.occupation || "",
        residenceType: data?.residenceType || ""
      },
      kycDetailsOf: {
        panNo: data?.panNo || "",
        aadharNo: data?.aadharNo || "",
        voterIdNo: data?.voterIdNo || "",
        udyamRegistrationNo: udyamdatasDetail?.udhyamRegistrationNo || "",
      },
      kycUpload: {
        aadharFrontImage:data?.kycUpload?.aadharFrontImage || "",
        aadharBackImage: data?.kycUpload?.aadharBackImage || "",
        panFrontImage: data?.kycUpload?.panFrontImage || "",
        drivingLicenceImage: data?.kycUpload?.drivingLicenceImage || "",
        voterIdImage: data?.kycUpload?.voterIdImage || "",
      },
      contactInformation: {
        mobileNo: data?.mobileNo || "",
        mobileNoTwo: data?.alternateMobileNo || "",
        email: data?.email || "",
      },
      persnalDetails: {
        religion: data?.religion || "",
        nationality: data?.nationality || "india",
        category: data?.category || "",
      },
      presentInformation: {
        addressAsPerAdhar: data?.permanentAddress?.addressLine1 || "",
        addressLine2: data?.permanentAddress?.addressLine2 || "",
        // landmark: data?.houseLandMark || "",
        city: data?.permanentAddress?.city || "",
        state: data?.permanentAddress?.state || "",
        district: data?.permanentAddress?.district || "",
        pinCode: data?.permanentAddress?.pinCode || "",
        // noOfyearsAtCurrentAddress:
        //   data?.noOfyearsAtCurrentAddress || "",
        country: "India",
      },
      presentInformation: {
        addressAsPerAdhar: data?.localAddress?.addressLine1 || "",
        addressLine2: data?.localAddress?.addressLine2 || "",
        landmark: data?.houseLandMark || "",
        city: data?.localAddress?.city || "",
        state: data?.localAddress?.state || "",
        district: data?.localAddress?.district || "",
        pinCode: data?.localAddress?.pinCode || "",
        noOfyearsAtCurrentAddress:
          data?.noOfyearsAtCurrentAddress || "",
        country: "India",
        residenceType: data?.residenceType || "",
      },
      // applicantData: {
      //   applicantCibilScore: civilDetails?.applicantCibilScore || "",
      //   totalAccounts: civilDetails?.applicantTotalAccount || "",
      //   overdueAccount: civilDetails?.applicantOverdueAccount || "",
      //   zeroBalanceAccount: civilDetails?.applicantZeroBalanceAccount || "",
      //   appFinancialOverview: {
      //     HighCreditAndSanctionAmount:
      //       civilDetails?.applicantHighCreditSanctionAmount || "",
      //     TotalCurrentOutstanding:
      //       civilDetails?.applicantcurrentOutstanding || "",
      //     TotalOverdueAmount: civilDetails?.applicantTotalOverDueAmount || "",
      //     TotalNumberOfEnquiry: civilDetails?.applicantNumberOfEnquiry || "",
      //   },
      // },
      // data: reference,
      // bankApplicantDetails: {
      //   acHolderName: appPdcData?.acHolderName,
      //   bankBranch: appPdcData?.branchName,
      //   accountNumber: appPdcData?.accountNumber,
      //   accountType: appPdcData?.accountType,
      //   ifscCode: appPdcData?.ifscCode,
      //   bankName: appPdcData?.bankName,
      // },
    };

     success(res, "Customer applicant details updated successfully", {
      data: responseData,
    });
    const fileStageForms = await processModel.findOneAndUpdate(
      { customerId: req.body.customerId },  
      { $set: { 'fileStageForms.dealSummaryApplicant': true } },
      { new: true }  
  );
  await finalApprovalSheet(customerId)
  
  } catch (error) {
    console.log(error);
    return unknownError(res, error.message);
  }
};

const updateGuarantorDetails = async (req, res) => {
  try {
    const {
      customerId,
      guarantorInformation,
      kycDetails,
      contactInformation,
      permanentAddressInformation,
      presentAddressInformation,
      persnalDetails,
      guarantorRepaymentDetails,
      guarantorData,
      kycUpload
    } = req.body;

    const tokenId = req.Id
    
    console.log('tokenId----',tokenId , req.Id)
    const customerDetails = await customerModel.findById(customerId)

    if (!customerDetails) {
      return badRequest(res , "Customer Not Found");
    }

    // Update guarantor information
    const guarantorDatas = await guarantorModel.findOneAndUpdate(
      { customerId },
      {
        $set: {
          employeId : customerDetails.employeId,
          formUpdatedEmployeeId : tokenId,
          fullName: guarantorInformation?.name || "",
          fatherName: guarantorInformation?.fatherName || "",
          motherName: guarantorInformation?.motherName || "",
          relationWithApplicant:
            guarantorInformation?.relationWithApplicant || "",
          dob: guarantorInformation?.dob || "",
          age: guarantorInformation?.age || "",
          gender: guarantorInformation?.gender || "",
          caste: guarantorInformation?.caste || "",
          maritalStatus: guarantorInformation?.maritalStatus || "",
          education: guarantorInformation?.educationalDetails || "",
          religion: guarantorInformation?.religion || "",
          category: guarantorInformation?.category || "",
          panNo: kycDetails?.panNumber || "",
          aadharNo: kycDetails?.adharNumber || "",
          docType: kycDetails?.docType || "",
          docNo: kycDetails?.docNo || "",
          mobileNo: parseInt(contactInformation?.mobileNo, 10) || 0,
          email: contactInformation?.email || "",

          guarantorType: guarantorInformation?.GuarantorType,
          businessType : guarantorInformation?.businessType,
          alternateMobileNo : contactInformation?.MobileNoTwo,
          nationality : guarantorInformation?.nationality,
          noOfyearsAtCurrentAddress :presentAddressInformation?.noOfyearsAtCurrentAddress,
          houseLandMark : presentAddressInformation?.landmark,
          occupation : guarantorInformation?.occupation,
          residenceType :presentAddressInformation?.residenceType,

          permanentAddress: {
            addressLine1: presentAddressInformation?.presentAddressAsPerAdhar || "",
            addressLine2: presentAddressInformation?.addressLine2 || "",
            city: presentAddressInformation?.city || "",
            state: presentAddressInformation?.state || "",
            district: presentAddressInformation?.district || "",
            pinCode: presentAddressInformation?.pinCode || "",
            noOfyearsAtCurrentAddress:
            presentAddressInformation?.noOfyearsAtCurrentAddress || "",
            country: "India",
          },
          kycUpload: {
            aadharFrontImage:kycUpload?.aadharFrontImage || "",
            aadharBackImage: kycUpload?.aadharBackImage || "",
            docImage: kycUpload?.docImage || "",
          },
          localAddress: {
            addressLine1:
              presentAddressInformation?.presentAddressAsPerAdhar || "",
            addressLine2: presentAddressInformation?.addressLine2 || "",
            city: presentAddressInformation?.city || "",
            state: presentAddressInformation?.state || "",
            district: presentAddressInformation?.district || "",
            pinCode: presentAddressInformation?.pinCode || "",
            noOfyearsAtCurrentAddress:
              presentAddressInformation?.noOfyearsAtCurrentAddress || "",
            country: "India",
            residenceType: presentAddressInformation?.residenceType || "",
          },
        },
      },
      { new: true, upsert: true }
    );

    //  console.log(guarantorDatas,"guarantorDatasguarantorDatas")
    // Update guarantor details in PD form
    
const creditPdData = await creditPdModel.findOne({ customerId });

if (!creditPdData) {
  // If customerId doesn't exist, create a new document
  await creditPdModel.create({
    customerId,
    guarantor: {
      guarantorType: guarantorInformation?.GuarantorType,
      businessType: guarantorInformation?.businessType,
      religion: guarantorInformation?.religion,
      alternateMobileNo: contactInformation?.MobileNoTwo,
      nationality: guarantorInformation?.nationality,
      caste: guarantorInformation?.caste,
      category: guarantorInformation?.category,
      noOfyearsAtCurrentAddress: presentAddressInformation?.noOfyearsAtCurrentAddress,
      houseLandMark: presentAddressInformation?.landmark,
      occupation: guarantorInformation?.occupation,
      residenceType: presentAddressInformation?.residenceType,
    },
  });
} else {
  // If customerId exists, update the existing document
  await creditPdModel.findOneAndUpdate(
    { customerId },
    {
      $set: {
        "guarantor.guarantorType": guarantorInformation?.GuarantorType,
        "guarantor.businessType": guarantorInformation?.businessType,
        "guarantor.religion": guarantorInformation?.religion,
        "guarantor.alternateMobileNo": contactInformation?.MobileNoTwo,
        "guarantor.nationality": guarantorInformation?.nationality,
        "guarantor.caste": guarantorInformation?.caste,
        "guarantor.category": guarantorInformation?.category,
        "guarantor.noOfyearsAtCurrentAddress": presentAddressInformation?.noOfyearsAtCurrentAddress,
        "guarantor.houseLandMark": presentAddressInformation?.landmark,
        "guarantor.occupation": guarantorInformation?.occupation,
        "guarantor.residenceType": presentAddressInformation?.residenceType,
      },
    },
    { new: true }
  );
}


    // console.log(creditPdData, "creditPdData");
    const cibil = await cibilModel.updateOne(
      { customerId },
      {
        $set: {
          // guarantorCibilScore: guarantorData?.guarantorCibilScore,
          guarantorCibilScore: guarantorData?.guarantorCibilScore,
        },
      }
    );

if(guarantorRepaymentDetails){

  await gtrPdcModel.findOneAndUpdate(
    { customerId },
    {
      $set: {
        acHolderName: guarantorRepaymentDetails.acHolderName,
        branchName: guarantorRepaymentDetails.bankBranch,
        accountNumber: guarantorRepaymentDetails.accountNumber,
        accountType: guarantorRepaymentDetails.accountType,
        ifscCode: guarantorRepaymentDetails.ifscCode,
        bankName: guarantorRepaymentDetails.bankName,
      },
    },
    {
      new: true,
    }
  );
}

    const data = await guarantorModel.findOne({ customerId });
    const pdformdatasDetail = await creditPdModel.findOne({ customerId });
    const camReportDetails = await camReportModel.findOne({ customerId });
    const gtrPdcData = await gtrPdcModel.findOne({ customerId });

    const responseData = {
      guarantorInformation: {
        name: guarantorDatas?.fullName,
        fatherName: guarantorDatas?.fatherName || "",
        motherName: guarantorDatas?.motherName || "",
        guarantorPhoto: guarantorDatas?.guarantorPhoto || "",
        relationWithApplicant: guarantorDatas?.relationWithApplicant || "",
        GuarantorType: creditPdData?.guarantor?.guarantorType || "",
        businessType: creditPdData?.guarantor?.businessType || "",
        dob: guarantorDatas?.dob || "",
        age: guarantorDatas?.age || "",
        gender: guarantorDatas?.gender || "",
        caste: guarantorDatas?.caste || "",
        maritalStatus: guarantorDatas?.maritalStatus || "",
        educationalDetails: guarantorDatas?.education || "",
        religion: guarantorDatas?.religion || "",
        nationality: guarantorDatas?.nationality || "india",
        caste: guarantorDatas?.caste || "",
        category: guarantorDatas?.category || "",
        occupation: guarantorDatas?.occupation || "",
        residenceType: guarantorDatas?.residenceType || "",
      },
      kycDetails: {
        // panNumber: guarantorDatas?.aadharNo || "",
        adharNumber: guarantorDatas?.aadharNo || "",
        docType: guarantorDatas?.docType || "", //base on the type
        docNo: guarantorDatas?.docNo || "",
      },
      kycUpload: {
        aadharFrontImage:guarantorDatas?.kycUpload?.aadharFrontImage || "",
        aadharBackImage: guarantorDatas?.kycUpload?.aadharBackImage || "",
        docImage: guarantorDatas?.kycUpload?.docImage || "",
      },
      contactInformation: {
        mobileNo: guarantorDatas?.mobileNo || 0,
        MobileNoTwo: guarantorDatas?.alternateMobileNo || "",
        email: guarantorDatas?.email || "",
      },
      // permanentAddressInformation: {
      //   addressAsPerAdhar: guarantorDatas?.permanentAddress?.addressLine1 || "",
      //   presentAddress: guarantorDatas?.localAddress?.addressLine1 || "",
      //   // landmark: guarantorDatas?.permanentAddress?.houseLandMark || "",
      //   city: guarantorDatas?.permanentAddress?.city || "",
      //   state: guarantorDatas?.permanentAddress?.state || "",
      //   district: guarantorDatas?.permanentAddress?.district || "",
      //   pinCode: guarantorDatas?.permanentAddress?.pinCode || "",
      //   // noOfyearsAtCurrentAddress:
      //   //   pdformdatasDetail?.guarantor?.noOfyearsAtCurrentAddress || "",
      //   country: "India",
      // },
      presentAddressInformation: {
        addressLine2: data?.localAddress?.addressLine2 || "",
        presentAddressAsPerAdhar:
          guarantorDatas?.localAddress?.addressLine1 || "",
        landmark: creditPdData?.guarantor?.houseLandMark || "",
        city: guarantorDatas?.localAddress?.city || "",
        state: guarantorDatas?.localAddress?.state || "",
        district: guarantorDatas?.localAddress?.district || "",
        pinCode: guarantorDatas?.localAddress?.pinCode || "",
        noOfyearsAtCurrentAddress:
          guarantorDatas?.noOfyearsAtCurrentAddress || "",
        country: "India",
        residenceType: guarantorDatas?.residenceType || "",
      },
      guarantorRepaymentDetails: {
        acHolderName: gtrPdcData?.acHolderName || "",
        bankBranch: gtrPdcData?.branchName || "",
        accountNumber: gtrPdcData?.accountNumber || "",
        accountType: gtrPdcData?.accountType || "",
        ifscCode: gtrPdcData?.ifscCode || "",
        bankName: gtrPdcData?.bankName || "",
      },
    };

     success(res, "Customer guarantor details updated successfully", {
      data: responseData,
    });
    const fileStageForms = await processModel.findOneAndUpdate(
      { customerId: req.body.customerId },  
      { $set: { 'fileStageForms.dealSummaryGuarantor': true } },
      { new: true }  
  );
  } catch (error) {
    console.error("Error updating guarantor details:", error);
    return unknownError(res, error);
  }
};

const customerUpdateReferenceDetail = async (req, res) => {
  try {
    const { customerId, data } = req.body;

    // Ensure that data is an array of reference details
    if (!Array.isArray(data)) {
      return res
        .status(400)
        .json({ message: "Invalid data format. 'data' should be an array." });
    }

    // Update the referenceDetails array for the given customerId
    const updatedData = await creditPdModel.findOneAndUpdate(
      { customerId },
      { $set: { referenceDetails: data } },
      { new: true }
    );

    return success(res, "Customer reference details updated successfully", {
      data: updatedData.referenceDetails,
    });
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
};

const riskReportPd = async (req, res) => {
  try {
    let { customerId } = req.body;

    // let {
    //   customerDemandLoanAmount,
    //   approvedAmount,
    //   roi,
    //   loanTenure,
    //   emi,
    //   endUseOfLoan,
    //   finalDecision,
    //   //rcu
    //   reportReceive,
    //   ReportStatus
    //  } = req.body;
    const { LoanDetail, rcuReport } = req.body;

    if (!customerId) {
      return error(res, "Customer ID is required.");
    }

    customerId = new mongoose.Types.ObjectId(customerId);

    const datad = await customerModel.findOne({ _id: customerId });
    if (!datad) {
      return error(res, "Customer is not present in customer data.");
    }

    const updatedDocument = await creditPdModel.findOneAndUpdate(
      { customerId: new mongoose.Types.ObjectId(customerId) },
      {
        $set: {
          "approveLoanDetails.approvedAmount": LoanDetail.approvedAmount,
          "approveLoanDetails.ROI": LoanDetail.roi,
          "approveLoanDetails.Tenure": LoanDetail.tenure,
          "approveLoanDetails.EMI": LoanDetail.emi,
          "approveLoanDetails.demandLoanAmountByCustomer":
            LoanDetail.customerDemandLoanAmount,
          "approveLoanDetails.finalDecision": LoanDetail.finalDecision,
          "approveLoanDetails.endUseOfLoan": LoanDetail.endUseOfLoan,
        },
      },
      {
        new: true,
      }
    );

    // const updatedVendor = await externalVendorFormModel.findOneAndUpdate(
    //   {
    //     customerId: customerId,
    //     "vendors.vendorType": "rcu", // Match the RCU vendor
    //   },
    //   {
    //     $set: {
    //       "vendors.$.assignDate": rcuReport.reportRecievedDate || "", // Update assign date
    //       "vendors.$.statusByVendor": rcuReport.reportStatus || "",  // Update status
    //     },
    //   },
    //   { new: true } // Return the updated document
    // );

    // if (!updatedVendor) {

    //   return badRequest(res, "RCU vendor not found with the given customer ID.");
    // }
    // const rcuVendor = updatedVendor.vendors.find(vendor => vendor.vendorType === "rcu");

    // if (!rcuVendor) {
    //   return badRequest(res, "RCU vendor not found after update.");
    // }
    console.log(updatedDocument, "updatedDocumentupdatedDocument");
    let response = {
      LoanDetail: {
        customerDemandLoanAmount:
          updatedDocument?.approveLoanDetails?.demandLoanAmountByCustomer || "",
        approvedAmount:
          updatedDocument?.approveLoanDetails?.approvedAmount || "",
        roi: updatedDocument?.approveLoanDetails?.ROI || "",
        tenure: updatedDocument?.approveLoanDetails?.Tenure || "",
        emi: updatedDocument?.approveLoanDetails?.EMI || "",
        finalDecision: updatedDocument?.approveLoanDetails?.finalDecision || "",
        endUseOfLoan: updatedDocument?.approveLoanDetails?.endUseOfLoan || "",
      },
      // rcuReport: {
      //   reportRecievedDate: rcuVendor.assignDate || "",
      //   reportStatus: rcuVendor.statusByVendor || ""
      // }
    };

    return success(res, "loan type details", response);
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
};

//   async function approverTechnicalForm(req, res) {
//     try {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({
//                 errorName: "serverValidation",
//                 errors: errors.array(),
//             });
//         }

//         const { customerId, formStatus,
//           nameOfDocumentHolder,
//           fatherName,
//           relationWithApplicant,
//           houseNo,
//           surveyNo,
//           patwariHalkaNo,
//           wardNo,
//           villageName,
//           gramPanchayat,
//           tehsil,
//           district,
//           state,
//           propertyLandmark,
//           fullAddressOfProperty,
//           typeOfProperty,
//           totalLandArea,
//           totalBuiltUpArea,
//           typeOfConstruction,
//           qualityOfConstruction,
//           ageOfProperty,
//           eastBoundary,
//           westBoundary,
//           northBoundary,
//           southBoundary,
//           developmentPercentage,
//           areaOfProperty,
//           landValue,
//           constructionValue,
//           fairMarketValueOfLand,
//           realizableValue,
//           latitude,
//           longitude,
//           valuationDoneBy,
//           //legal report
//           documentType
//         } = req.body;

//         const tokenId = new ObjectId(req.Id);
//         const completeDate = new Date().toISOString().split("T")[0];

//         const employeeData = await employeeModel.findOne({ _id: tokenId, status: "active" });
//         // console.log("Token ID:", tokenId);
//         // console.log("Employee Data:", employeeData);

//         if (!employeeData) {
//             return badRequest(res, "Employee not found");
//         }

//         if (!customerId || !ObjectId.isValid(customerId)) {
//             return badRequest(res, "Valid customerId is required");
//         }

//         const customerFind = await customerModel.findById(customerId);
//         if (!customerFind) {
//             return badRequest(res, "Customer Not Found");
//         }

//         const approverFormDetail = await approverFormModel.findOne({ customerId });

//         const approverFormData = {
//             ...formData,
//             employeeId: tokenId,
//             customerId: customerFind._id,
//             LD: customerFind.customerFinId || "",
//             status: formStatus || "pending",
//             completeDate
//         };

//         let salaryDetail;
//         if (approverFormDetail) {
//             salaryDetail = await approverFormModel.findByIdAndUpdate(
//                 approverFormDetail._id,
//                 approverFormData,
//                 { new: true }
//             );
//             return success(res, "Technical form updated successfully", salaryDetail);
//         }
//     } catch (error) {
//         console.error(error);
//         return unknownError(res, error);
//     }
// }

async function approverpropertyDetailsForm(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const {
      customerId,
      sellerBuyerInformation,
      propertyHolderInformation,
      PropertyLocationDetails,
      propertyAddressAndLandmark,
      propertySpecifications,
      PropertyBoundaries,
      PropertyValuation,
      rcuReport,
      technicalReport,
      legalReport,
    } = req.body;

    console.log(sellerBuyerInformation,"sellerBuyerInformation")
    const tokenId = new ObjectId(req.Id);
    const completeDate = new Date().toISOString().split("T")[0];

    const findEmi = await final.findOne({
      customerId,
    })

    // Extract the EMI amount (convert to a number if it's a string)
    const EMI = findEmi?.emiAmount ? parseFloat(findEmi.emiAmount) : 0;
    // console.log("EMI", EMI)
    const LoanAmount = findEmi?.finalLoanAmount ? parseFloat(findEmi.finalLoanAmount) : 0;
    // console.log("LoanAmount", LoanAmount)
    const employeeId = new ObjectId(req.Id);


    const employeeData = await employeeModel.findOne({
      _id: tokenId,
      status: "active",
    });
    if (!employeeData) {
      return badRequest(res, "Employee not found");
    }

    if (!customerId || !ObjectId.isValid(customerId)) {
      return badRequest(res, "Valid customerId is required");
    }
    const customerFind = await customerModel.findById(customerId);
    // if (!customerFind) {
    //   return badRequest(res, "Customer Not Found");
    // }

    const approverFormDetail = await approverFormModel.findOne({ customerId });

    const approverFormData = {
      nameOfDocumentHolder:
        propertyHolderInformation.nameOfDocumentHolder || "",
      fatherName: propertyHolderInformation.fatherName || "",
      relationWithApplicant:
        propertyHolderInformation.relationWithApplicant || "",
      houseNo: PropertyLocationDetails.houseNo || "",
      surveyNo: PropertyLocationDetails.surveyNo || "",
      patwariHalkaNo: PropertyLocationDetails.patwariHalkaNo || "",
      wardNo: PropertyLocationDetails.wardNo || "",
      villageName: PropertyLocationDetails.villageName || "",
      gramPanchayat: PropertyLocationDetails.gramPanchayat || "",
      tehsil: PropertyLocationDetails.tehsil || "",
      district: PropertyLocationDetails.district || "",
      state: PropertyLocationDetails.state || "",
      pinCode: PropertyLocationDetails.pinCode || "",
      fullAddressOfProperty: ` House No. ${PropertyLocationDetails.houseNo}, Survey No. ${PropertyLocationDetails.surveyNo}, Patwari Halka No. ${PropertyLocationDetails.patwariHalkaNo}, Ward No. ${PropertyLocationDetails.wardNo}, Village Name. ${PropertyLocationDetails.villageName}, Gram Panchayat. ${PropertyLocationDetails.gramPanchayat}, Tehsil. ${PropertyLocationDetails.tehsil}, District. ${PropertyLocationDetails.district}, State. ${PropertyLocationDetails.state}, pincode. ${PropertyLocationDetails.pinCode}` ||
        PropertyLocationDetails.fullAddressOfProperty || "",
      propertyLandmark: propertyAddressAndLandmark.propertyLandMark || "",
      latitude: propertyAddressAndLandmark.latitude || "",
      longitude: propertyAddressAndLandmark.longitude || "",
      propertyType: propertySpecifications.typeOfProperty || "",
      totalLandArea: propertySpecifications.totalLandAreaInSqFt || "",
      totalBuiltUpArea: propertySpecifications.totalBuiltUpAreaInSqFt || "",
      constructionType: propertySpecifications.typeOfConstruction || "",
      constructionQuality: propertySpecifications.qualityOfConstruction || "",
      propertyAge: propertySpecifications.ageOfProperty || "",
      eastBoundary: PropertyBoundaries.eastBoundary || "",
      westBoundary: PropertyBoundaries.westBoundary || "",
      northBoundary: PropertyBoundaries.northBoundary || "",
      southBoundary: PropertyBoundaries.southBoundary || "",
      landValue: PropertyValuation.landValue || "",
      Ltv: PropertyValuation.Ltv || "",
      // Ltv: LoanAmount && EMI ? `${((LoanAmount / EMI) * 100).toFixed(2)}%` : "",
      constructionValue: PropertyValuation.constructionValue || "",
      fairMarketValueOfLand: PropertyValuation.fairMarketValueOfLand || "",
      realizableValue: PropertyValuation.realizableValue || "",
      employeeId,
      sellerName: sellerBuyerInformation.sellerName || "",
      sellerFatherName: sellerBuyerInformation.sellerFatherName || "",
      buyerName: sellerBuyerInformation.buyerName || "",
      buyerFatherName: sellerBuyerInformation.buyerFatherName || "",
      // relationWithApplicant: sellerBuyerInformation.relationWithApplicant || ""
    };

    let approverData;
    if (approverFormDetail) {
      approverData = await approverFormModel.findByIdAndUpdate(
        approverFormDetail._id,
        { $set: approverFormData },
        { new: true }
      );
    } else {
      approverData = await approverFormModel.create({
        customerId,
        ...approverFormData,
      });
    }

    let legalReportDetails;
    if (legalReport) {
      legalReportDetails = await legalReportModel.findOneAndUpdate(
        { customerId: customerId },
        {
          $set: {
            documentDetails: legalReport.documentDetails,
          },
        },
        { new: true, upsert: true }
      );
    }
    const updateFields = {};
    const fieldsToCheck = [
      "nameOfDocumentHolder",
      "fatherName",
      "relationWithApplicant",
      "houseNo", // Add tenureInMonth to the list of fields to check
      "patwariHalkaNo",
      "wardNo",
      "pinCode",
      "villageName",
      "gramPanchayat",
      "tehsil",
      "district",
      "state",
      "eastBoundary",
      "westBoundary",
      "northBoundary",
      "southBoundary",
      "totalLandArea",
      "fullAddressOfProperty"
    ];

            // Determine filled fields in the updated/created document
            const filledFields = fieldsToCheck.filter((field) => approverData[field]);
            // console.log(filledFields, "filledFields", fieldsToCheck);
          //  console.log(filledFields,fieldsToCheck)
            // Update flags based on filled fields
            if (filledFields.length > 0) {
              updateFields.propertyPaperDetailFormStart = true;
              
            }
            // if (filledFields.length === fieldsToCheck.length) {
              updateFields.propertyPaperDetailFormComplete = true;
            // }

            // Update process model if any flags are set
            if (Object.keys(updateFields).length > 0) {
              await processModel.findOneAndUpdate(
                { customerId },
                { $set: updateFields },
                { new: true }
              );
            }

            // Log success message based on the flags
            if (updateFields.propertyPaperDetailFormComplete) {
              console.log("Property Paper Detail Form is complete.");
            } else if (updateFields.propertyPaperDetailFormStart) {
              console.log("Property Paper Detail Form has been started.");
            }
   

    const responseData = {
      propertyHolderInformation: {
        nameOfDocumentHolder: approverData?.nameOfDocumentHolder || "",
        fatherName: approverData?.fatherName || "",
        relationWithApplicant: approverData?.relationWithApplicant || "",
        employeeId: approverData?.employeeId || "",
      },
      PropertyLocationDetails: {
        houseNo: approverData?.houseNo || "",
        surveyNo: approverData?.surveyNo || "",
        patwariHalkaNo: approverData?.patwariHalkaNo || "",
        wardNo: approverData?.wardNo || "",
        villageName: approverData?.villageName || "",
        gramPanchayat: approverData?.gramPanchayat || "",
        tehsil: approverData?.tehsil || "",
        district: approverData?.district || "",
        state: approverData?.state || "",
        pinCode: approverData?.pinCode || "",
        fullAddressOfProperty: approverData?.fullAddressOfProperty || "",
      },
      propertyAddressAndLandmark: {
        propertyLandMark: approverData?.propertyLandmark || "",
        fullAddressOfProperty: approverData?.fullAddressOfProperty || "",
        latitude: approverData?.latitude || "",
        longitude: approverData?.longitude || "",
      },
      propertySpecifications: {
        typeOfProperty: approverData?.propertyType || "",
        totalLandAreaInSqFt: approverData?.totalLandArea || "",
        totalBuiltUpAreaInSqFt: approverData?.totalBuiltUpArea || "",
        typeOfConstruction: approverData?.constructionType || "",
        qualityOfConstruction: approverData?.constructionQuality || "",
        ageOfProperty: approverData?.propertyAge || "",
      },
      PropertyBoundaries: {
        eastBoundary: approverData?.eastBoundary || "",
        westBoundary: approverData?.westBoundary || "",
        northBoundary: approverData?.northBoundary || "",
        southBoundary: approverData?.southBoundary || "",
      },
      PropertyValuation: {
        landValue: approverData?.landValue || "",
        constructionValue: approverData?.constructionValue || "",
        fairMarketValueOfLand: approverData?.fairMarketValueOfLand || "",
        realizableValue: approverData?.realizableValue || "",
        Ltv: approverData?.Ltv || "",
      },
      legalReport: {
        documentDetails: legalReportDetails?.documentDetails || "",
      },
      sellerBuyerInformation:{
        sellerName: approverData?.sellerName || "",
        sellerFatherName: approverData?.sellerFatherName || "",
        buyerName:  approverData?.buyerName || "",
        buyerFatherName: approverData?.buyerFatherName || "",
      }
    };

    return success(res, "Forms updated successfully", {
      approverForm: responseData,
    });
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


async function technicalVendorFormSubmit(req, res) {

  const { customerId } = req.body;
   const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");
  if (!customerId) {
    return badRequest(res, "Customer Id Required")
  }

  const tokenId = req.Id

  const vendorFind = await vendorModel.findById(tokenId, {status:"active"})
  if(!vendorFind){
    return notFound(res, "Vendor Not Found")
  }

  const findEmi = await final.findOne({
    customerId,
  })
 

  // Extract the EMI amount (convert to a number if it's a string)
  const EMI = findEmi?.emiAmount ? parseFloat(findEmi?.emiAmount) : 0;
  console.log("EMI", EMI)
  const LoanAmount = findEmi?.finalLoanAmount ? parseFloat(findEmi.finalLoanAmount) : 0;
  console.log("LoanAmount", LoanAmount)

  try {
    const updateData = {
      // propertyLandmark: req.body.propertyLandmark,
      // latitude: req.body.latitude,
      // longitude: req.body.longitude,
      // propertyType: req.body.propertyType,
      // totalLandArea: req.body.totalLandArea,
      // totalBuiltUpArea: req.body.totalBuiltUpArea,
      // constructionType: req.body.constructionType,
      // constructionQuality: req.body.constructionQuality,
      // propertyAge: req.body.propertyAge,
      // landValue: req.body.landValue,
      // constructionValue: req.body.constructionValue,
      // realizableValue: req.body.realizableValue,
      ...req.body,
      vendorId :tokenId,
      vendorByCompleteDate : todayDate,
      fairMarketValueOfLand: req.body.fairMarketValueOfLand,
      Ltv: req.body.fairMarketValueOfLand && LoanAmount ? `${((LoanAmount / req.body.fairMarketValueOfLand) * 100).toFixed(2)}%` : "",
    };

    const updatedOrCreatedForm = await approverFormModel.findOneAndUpdate(
      { customerId },
      { $set: updateData },
      { new: true, runValidators: true, upsert: true }
    );

    // if (!updatedForm) {
    //   return success(res , "Technical form not found for the given customerId");
    // }

    return success(res , "Technical form Submit successfully",updatedOrCreatedForm);
  } catch (error) {
    console.error("Error updating technical form:", error);
    return unknownError(res, error);
  }
};


async function technicalVendorGetForm(req, res) {
  try {
  const { customerId } = req.query;
  if (!customerId) {
    return badRequest(res, "Customer Id Required")
  }

    const formData = await approverFormModel.findOne({customerId})

    return success(res , "Technical Form Get Detail",formData);
  } catch (error) {
    console.error("Error updating technical form", error);
    return unknownError(res, error);
  }
};


async function pincodedelete(req, res) {
  try {
    const allowedStates = ["GUJARAT", "MADHYA PRADESH", "RAJASTHAN"];
    const deleteResult = await pincodeModel.deleteMany({
      stateName: { $nin: allowedStates },
    });
    res.status(200).json({
      message: "Records deleted successfully",
      deletedCount: deleteResult.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting records:", error);
    res.status(500).json({
      message: "Error deleting records",
      error: error.message,
    });
  }
}


// fetch data via pincode //

async function fetchPincodeData(req, res) {
  try {
    const { pincode } = req.query;
    if (!pincode) {
      return badRequest(res, "Pincode is required");
    }
    const pincodeData = await pincodeModel.findOne({ pincode: Number(pincode) });
    if (!pincodeData) {
      return badRequest(res, "Pincode data not found");
    }
    return success(res, "Pincode data found", pincodeData);
  } catch (error) {
    console.error("Error fetching pincode data:", error);
    return unknownError(res, error);
  }
}

async function financeDetailsForm(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { customerId, formStatus } = req.body;

    const tokenId = new ObjectId(req.Id);
    const completeDate = new Date().toISOString().split("T")[0];

    const employeeData = await employeeModel.findOne({
      _id: tokenId,
      status: "active",
    });
    if (!employeeData) {
      return badRequest(res, "Employee not found");
    }

    if (!customerId || !ObjectId.isValid(customerId)) {
      return badRequest(res, "Valid customerId is required");
    }
    const customerFind = await customerModel.findById(customerId);
    if (!customerFind) {
      return badRequest(res, "Customer Not Found");
    }
    const salaryAndOtherIncomeData = await salaryAndOtherIncomeModel.findOne({
      customerId,
    });
    const milkIncomeData = await milkIncomeModel.findOne({ customerId });
    const otherBuisnessData = await otherBuisnessModel.findOne({ customerId });
    const agricultureData = await agricultureModel.findOne({ customerId });

    const pdformdatasDetail = await creditPdModel.findOne({ customerId });

    const aggriculture = {
      agricultureDocument: req.body.agricultureDocument || "",
      LD: req.body.LD || "",
      incomeType: req.body.incomeType || "",
      agriDetails: req.body.agriDetails || "",
      agriIncome: req.body.agriIncome || "",
      agriLandAddressAsPerPavati: req.body.agriLandAddressAsPerPavati || "",
      agriLandSurveyNo: req.body.agriLandSurveyNo || "",
      LandOwnerName: req.body.LandOwnerName || "",
      relationWithApplicant: req.body.relationWithApplicant || "",
      cropCultivated: req.body.cropCultivated || "",

      agriDoingFromOfYears: req.body.yearOfExprienceinAgri || "",
      monthlyIncome: "",
      monthlyExpence: "",
      NoOfAgricultureOwner: "",
    };
    const aggricultureCpd = {
      agriIncomeYearly: req.body.agriIncomeYearly || "",
      agriLandInBigha: req.body.TotalNoOfAGRILand || "",
    };

    const MilkBusiness = {
      milkDocument: req.body.milkDocument || "",
      noOfYears: req.body.yearOfExperience || "",
      NoOfCattles: req.body.NoOfCattles || "",
      MilkGivingCattle: req.body.MilkGivingCattle || "",
      averageDailyMilkQuantity: req.body.averageDailyMilkQuantity || "",
      NameOfDairy: req.body.NameOfDairy || "",
      adressOfDairy: req.body.adressOfDairy || "",
      contactDetailsOfDairyOwnerIfAvailable:
        req.body.contactDetailsOfDairyOwnerIfAvailable || "",
      milkProvingToDairy: req.body.yearsmilkProvingToDairy || "",
      monthlyIncomeMilkBuisness: req.body.monthlyIncomeMilkBuisness || "",

      annualIncome: "",
      expensesAtMilkBuisness: req.body.monthlymilkExpense || "",
    };

    const SalaryIncome = {
      otherIncomeDocument: req.body.otherIncomeDocument || "",
      LD: req.body.LD || "",
      incomeType3: req.body.incomeType3 || "",
      salaryOtherIncomeSource: req.body.salaryOtherIncomeSource || "",
      companyName: req.body.companyName || "",
      adressOfSalaryProvider: req.body.adressOfSalaryProvider || "",
      mobNoOfSalaryProvider: req.body.mobNoOfSalaryProvider || "",
      doingFromNoYears: req.body.doingFromNoYears || "",
      monthlyIncomeEarned: req.body.monthlyIncomeEarned || "",

      monthlyExpense: "",
      annualIncome: "",
    };

    const OthersBusinessIncome = {
      //legal
      otherBusinessDocument: req.body.otherBusinessDocument || "",
      doingFromNoOfYears: req.body.YearOfExperience || "",
      natureOfBuisness: req.body.NatureOfBusiness || "",
      nameOfBuisness: req.body.NameOfBusines || "",
      monthlyIncomeEarned: req.body.MonthlyIncome || "",
    };

    let otherbuisnessForm;
    if (otherBuisnessData) {
      otherbuisnessForm = await otherBuisnessModel.findByIdAndUpdate(
        otherBuisnessData._id,
        { $set: OthersBusinessIncome },
        { new: true }
      );
    }

    let salaryForm;
    if (salaryAndOtherIncomeData) {
      salaryForm = await salaryAndOtherIncomeModel.findByIdAndUpdate(
        salaryAndOtherIncomeData._id,
        { $set: SalaryIncome },
        { new: true }
      );
    }

    let updatedForm;
    if (milkIncomeData) {
      updatedForm = await milkIncomeModel.findByIdAndUpdate(
        milkIncomeData._id,
        { $set: MilkBusiness },
        { new: true }
      );
    }

    let updatedagriForm;
    if (agricultureData) {
      updatedagriForm = await agricultureModel.findByIdAndUpdate(
        agricultureData._id,
        { $set: aggriculture },
        { new: true }
      );
    }

    // let updatedagriCpdForm;;
    // if (pdformdatasDetail) {
    //   updatedagriCpdForm = await creditPdModel.findByIdAndUpdate(
    //     pdformdatasDetail._id,
    //         { $set: aggricultureCpd },
    //         { new: true,} // Options: return updated doc, create if not exists
    //            );
    // }
    let updatedagriCpdForm;
    if (pdformdatasDetail) {
      updatedagriCpdForm = await creditPdModel.findOneAndUpdate(
        {
          _id: pdformdatasDetail._id,
          "incomeSource.incomeSourceType": "agricultureBusiness", // Match the specific array element
        },
        {
          $set: {
            "incomeSource.$.agricultureBusiness.agriLandInBigha":
              aggricultureCpd.agriLandInBigha,
            "incomeSource.$.agricultureBusiness.agriIncomeYearly":
              aggricultureCpd.agriIncomeYearly,
          },
        },
        { new: true }
      );
    }

    const agricpd = {
      agriLandInBigha: updatedagriCpdForm?.incomeSource?.find(
        (item) => item.incomeSourceType === "agricultureBusiness"
      )?.agricultureBusiness?.agriLandInBigha,
      agriIncomeYearly: updatedagriCpdForm?.incomeSource?.find(
        (item) => item.incomeSourceType === "agricultureBusiness"
      )?.agricultureBusiness?.agriIncomeYearly,
    };

    let agri = {
      updatedagriForm,
      agricpd,
    };

    return success(res, "Financial Forms updated successfully", {
      MilkIncome: updatedForm,
      Salary: salaryForm,
      otherBuisness: otherbuisnessForm,
      Agriculture: agri,
    });
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

const dealDSummary = async (req, res) => {
  try {
    let { customerId, data } = req.body;

    if (!customerId) {
      return error(res, "Customer ID is required.");
    }

    customerId = new mongoose.Types.ObjectId(customerId);

    const datad = await customerModel.findOne({ _id: customerId });
    if (!customerId) {
      return error(res, "Customer is not present in customer data.");
    }

    const updatedDocument = await creditPdModel.findOneAndUpdate(
      { customerId: new mongoose.Types.ObjectId(customerId) },
      {
        $set: {
          "approveLoanDetails.loanType": data?.LoanType,
          "approveLoanDetails.ROI": data?.roi,
          "approveLoanDetails.Tenure": data?.LoanTenureRequested,
          "approveLoanDetails.EMI": data?.emi,
          "approveLoanDetails.demandLoanAmountByCustomer":
            data?.LoanAmountRequested,
          "approveLoanDetails.endUseOfLoan": data?.LoanPurpose,
        },
      },
      {
        new: true,
      }
    );

    const creditPdData = await creditPdModel.findOneAndUpdate({ customerId });

    let response = {
      data: {
        LoanAmountRequested:
          creditPdData?.approveLoanDetails?.demandLoanAmountByCustomer || "",
        LoanTenureRequested: creditPdData?.approveLoanDetails?.Tenure || "",
        LoanPurpose: creditPdData?.approveLoanDetails?.endUseOfLoan || "",
        LoanType: creditPdData?.approveLoanDetails?.loanType || "",
        roi: creditPdData?.approveLoanDetails?.ROI || "",
        emi: creditPdData?.approveLoanDetails?.EMI || "",
      },
    };

    return success(res, "dealSummary details", response);
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
};

// const updateCustomerCoApplicantDetail = async (req, res) => {
//   try {
//     let { customerId } = req.body;
//     const {
//       coApplicantDetails_1,
//       contactInformation,
//       kycDetails,
//       permanentAddressInformation,
//       presentAddressInformation,
//       employeDetails,

//     } = req.body;

//     if (!customerId) {
//       return error(res, "Customer ID is required.");
//     }

//     customerId = new mongoose.Types.ObjectId(customerId);
//     const coapplicant = await coApplicantModel.updateOne(
//       { customerId });
//       const pdformdatasDetail = await creditPdModel.updateOne({ customerId });
//     const udyamdatasDetail = await udyamModel.updateOne({ customerId });
//     const camReportDetails = await camReportModel.updateOne({ customerId });

//     const coApplicantDetailsArray = (pdformdatasDetail?.co_Applicant &&
//       pdformdatasDetail.co_Applicant.length > 0
//         ? pdformdatasDetail.co_Applicant
//         : [{}]
//       ).map((value = {}, index) => {
//         return {
//           [`coApplicantDetails_${index + 1}`]: {
//             ApplicantType: value.coApplicantType || "",
//             bussinessType: value.businessType || "",
//             coApplicantPhoto: data?.[index]?.coApplicantPhoto || "",
//             fullName: data?.[index]?.fullName || "",
//             fatherName: data?.[index]?.fatherName || "",
//             motherName: data?.[index]?.motherName || "",
//             dob: data?.[index]?.dob || "",
//             age: data?.[index]?.age || "",
//             gender: data?.[index]?.gender || "",
//             maritalStatus: data?.[index]?.maritalStatus || "",
//             educationDetails: data?.[index]?.education || "",
//             relationWithApplicant: data?.[index]?.relationWithApplicant || "",
//             religion: data?.[index]?.religion || "",
//             nationality: value.nationality || "",
//             category: value.category || "",
//             caste: value.caste || "",

//             contactInformation: {
//               mobileNo: data?.[index]?.mobileNo || "",
//               mobileNoTwo: value.alternateMobileNo || "",
//               email: data?.[index]?.email || "",
//             },

//             kycDetails: {
//               udyamRegistrationNo: "",
//               docType: data?.[index]?.docType || "",
//               aadharNo: data?.[index]?.aadharNo || "",
//               docNo: data?.[index]?.docNo || "",
//             },

//             permanentAddressInformation: {
//               presentAddress:
//                 data?.[index]?.permanentAddress?.addressLine1 || "",
//               landmark: value.houseLandMark || "",
//               nameOfCity: data?.[index]?.permanentAddress?.city || "",
//               city: data?.[index]?.permanentAddress?.city || "",
//               state: data?.[index]?.permanentAddress?.state || "",
//               districtName: data?.[index]?.permanentAddress?.district || "",
//               pinCode: data?.[index]?.permanentAddress?.pinCode || "",
//               noOfyearsAtCurrentAddress: value.noOfyearsAtCurrentAddress || "",
//               country: "India",
//               residenceType: value.residenceType || "",
//             },

//             presentAddressInformation: {
//               AddressAsPerAdhar: data?.[index]?.localAddress?.addressLine1 || "",
//               fullAddress: data?.[index]?.localAddress?.addressLine2 || "",
//               landmark: value.houseLandMark || "",
//               nameOfCity: data?.[index]?.localAddress?.city || "",
//               addressLine1: data?.[index]?.localAddress?.addressLine1 || "",
//               addressLine2: data?.[index]?.localAddress?.addressLine2 || "",
//               city: data?.[index]?.localAddress?.city || "",
//               state: data?.[index]?.localAddress?.state || "",
//               districtName: data?.[index]?.localAddress?.district || "",
//               pinCode: data?.[index]?.localAddress?.pinCode || "",
//               noOfyearsAtCurrentAddress: value.noOfyearsAtCurrentAddress || "",
//               country: "India",
//             },

//             employeDetails: {
//               education: data?.[index]?.education || "",
//               occupation:
//                 camReportDetails?.coApplicationInformation?.[index]?.occupation ||
//                 "",
//               monthlyIncome:
//                 camReportDetails?.coApplicationInformation?.[index]
//                   ?.monthlyIncome || "",
//               otherMonthlyIncome:
//                 camReportDetails?.coApplicationInformation?.[index]
//                   ?.otherMonthlyIncome || "",
//               sourceOfOtherIncome:
//                 camReportDetails?.coApplicationInformation?.[index]
//                   ?.sourceOfOtherIncome || "",
//               annualIncome:
//                 camReportDetails?.coApplicationInformation?.[index]
//                   ?.annualIncome || "",
//               totalHouseHoldExpenses:
//                 camReportDetails?.coApplicationInformation?.[index]
//                   ?.totalHouseHoldExpenses || "",
//             },
//           },
//         };
//       });

//       // Combine array into an object
//       const responseData = coApplicantDetailsArray.reduce(
//         (acc, curr) => Object.assign(acc, curr),
//         {}
//       );

//       if (!Object.keys(responseData).length) {
//         responseData[`coApplicantDetails_1`] = {
//           ApplicantType: "",
//           bussinessType: "",
//           fullName: "",
//           fatherName: "",
//           motherName: "",
//           dob: "",
//           age: "",
//           gender: "",
//           maritalStatus: "",
//           educationDetails: "",
//           relationWithApplicant: "",
//           religion: "",
//           nationality: "",
//           category: "",
//           caste: "",

//           contactInformation: {
//             mobileNo: "",
//             mobileNoTwo: "",
//             email: "",
//           },

//           kycDetails: {
//             udyamRegistrationNo: "",
//             docType: "",
//             aadharNo: "",
//             docNo: "",
//           },

//           permanentAddressInformation: {
//             AddressAsPerAdhar: "",
//             landmark: "",
//             nameOfCity: "",
//             city: "",
//             state: "",
//             districtName: "",
//             pinCode: "",
//             noOfyearsAtCurrentAddress: "",
//             country: "India",
//             residenceType: "",
//           },

//           presentAddressInformation: {
//             presentAddress: "",
//             fullAddress: "",
//             landmark: "",
//             nameOfCity: "",
//             addressLine1: "",
//             addressLine2: "",
//             city: "",
//             state: "",
//             districtName: "",
//             pinCode: "",
//             noOfyearsAtCurrentAddress: "",
//             country: "India",
//           },

//           employeDetails: {
//             education: "",
//             occupation: "",
//             monthlyIncome: "",
//             otherMonthlyIncome: "",
//             sourceOfOtherIncome: "",
//             annualIncome: "",
//             totalHouseHoldExpenses: "",
//           },
//         };
//       }

//     ({ customerId });
//     const updatedCibilKyc = await cibilkycModel.findOne({ customerId });
//     // const updatedCam = await camReportModel.findOne({ customerId });

//     const response = {
//       Coapplicant: updatedApplicant,

//     };

//     return success(res, "Customer applicant details updated successfully",response);
//   } catch (error) {
//     console.log(error);
//     return unknownError(res, error);
//   }
// };

const updateCustomerCoApplicantDetail = async (req, res) => {
  try {
    let {
      customerId,
      coApplicantDetails_1,
      kycDetailsOf,
      contactInformation,
      permanentInformation,
      presentInformation,
      basicInformation,
      accountSummary,
      financialOverview,
      referenceDetails,
      bankDetail,
      kycUpload,
      index,
    } = req.body;
    console.log(coApplicantDetails_1, "coApplicantDetails_1<><>>>>>>>>>>>>>>>>>>>>>>>>")
    if (!customerId) {
      return error(res, "Customer ID is required.");
    }

    customerId = new mongoose.Types.ObjectId(customerId);

    // Fetch all documents related to the customer ID
    const kycs = await coApplicantModel
      .find({ customerId })
      .sort({ createdAt: 1 });

      // const custoerDetails = await customerModel
      // .find({ customerId })

      const customers = await customerModel.findOne({_id:customerId });
      const employeeId=customers?.employeId
      console.log("employeeId",employeeId)

      

      // console.log(custoerDetails,"custoerDetails")

    // Select the first document (index 0) or prepare a new document ID
    const firstDocId = kycs[0]?._id || new mongoose.Types.ObjectId();

    // Update or create the document
    const updatedKYC = await coApplicantModel.findByIdAndUpdate(
      firstDocId,
      {
        $set: {
          customerId,
          employeId:`${employeeId}`,
          aadharNo: coApplicantDetails_1?.kycDetailsOf?.aadharNo,
          docType: coApplicantDetails_1?.kycDetailsOf?.docType,
          docNo: coApplicantDetails_1?.kycDetailsOf?.docNo,
          fullName: coApplicantDetails_1?.fullName,
          fatherName: coApplicantDetails_1?.fatherName,
          motherName: coApplicantDetails_1?.motherName,
          spouseName: coApplicantDetails_1?.spouseName,
          relationWithApplicant: coApplicantDetails_1?.relationWithApplicant,
          email: coApplicantDetails_1?.contactInformation?.email,
          dob: coApplicantDetails_1?.dob,
          age: coApplicantDetails_1?.age,
          category: coApplicantDetails_1?.category,
          gender: coApplicantDetails_1?.gender,
          maritalStatus: coApplicantDetails_1?.maritalStatus,
          education: coApplicantDetails_1?.educationDetails,
          religion: coApplicantDetails_1?.religion,
          mobileNo: coApplicantDetails_1?.contactInformation?.mobileNo,

        
            coApplicantType: coApplicantDetails_1?.ApplicantType,
            businessType: coApplicantDetails_1?.bussinessType,
            occupation: coApplicantDetails_1?.occupation,
            houseLandMark: coApplicantDetails_1?.presentAddressInformation?.landmark,
            alternateMobileNo: coApplicantDetails_1?.contactInformation?.mobileNoTwo,
            noOfyearsAtCurrentAddress:coApplicantDetails_1?.presentAddressInformation.noOfyearsAtCurrentAddress,
            nationality: coApplicantDetails_1?.nationality,
            educationalDetails: coApplicantDetails_1?.educationDetails,
            residenceType: coApplicantDetails_1?.presentAddressInformation?.residenceType,



          permanentAddress: {
            addressLine1:
            coApplicantDetails_1?.presentAddressInformation?.AddressAsPerAdhar,
              addressLine2:coApplicantDetails_1?.presentAddressInformation?.addressLine2,
            city:  coApplicantDetails_1?.presentAddressInformation?.city,
            state: coApplicantDetails_1?.presentAddressInformation?.state,
            district:coApplicantDetails_1?.presentAddressInformation?.districtName,
            pinCode:coApplicantDetails_1?.presentAddressInformation?.pinCode,
          },
          kycUpload: {
            aadharFrontImage:coApplicantDetails_1?.kycUpload?.aadharFrontImage || "",
            aadharBackImage: coApplicantDetails_1?.kycUpload?.aadharBackImage || "",
            docImage: coApplicantDetails_1?.kycUpload?.docImage || "",
          },
          localAddress: {
            addressLine1:
              coApplicantDetails_1?.presentAddressInformation
                ?.AddressAsPerAdhar,
            addressLine2:
              coApplicantDetails_1?.presentAddressInformation?.addressLine2,
            city: coApplicantDetails_1?.presentAddressInformation?.city,
            state: coApplicantDetails_1?.presentAddressInformation?.state,
            district:
              coApplicantDetails_1?.presentAddressInformation?.districtName,
            pinCode: coApplicantDetails_1?.presentAddressInformation?.pinCode,
          },
        },
      },
      {
        new: true,
        upsert: true, // Ensures a new record is created if not found
        setDefaultsOnInsert: true, // Apply default values from the schema if inserting a new record
      }
    );
    // console.log(updatedKYC,"updatedKYCupdatedKYCupdatedKYC")
    // Retrieve the updated document for response
    const updatedApplicant = await coApplicantModel.findById(firstDocId);
    const response = {
      CoApplicant: updatedApplicant,
    };

    // Update or create credit PD data
    const pdData = await creditPdModel.updateOne(
      { customerId },
      {
        $set:
         {
          co_Applicant: [
            {

        coApplicantType: coApplicantDetails_1?.ApplicantType,
         businessType: coApplicantDetails_1?.bussinessType,
         nationality: coApplicantDetails_1?.nationality,
         caste: coApplicantDetails_1?.caste,
         noOfyearsAtCurrentAddress:
            coApplicantDetails_1?.noOfyearsAtCurrentAddress,
          houseLandMark:
            coApplicantDetails_1?.presentAddressInformation?.landmark,
         alternateMobileNo:
            coApplicantDetails_1?.contactInformation?.mobileNoTwo,
          noOfyearsAtCurrentAddress:
            coApplicantDetails_1?.presentAddressInformation
              ?.noOfyearsAtCurrentAddress,
         residenceType:
            coApplicantDetails_1?.presentAddressInformation?.residenceType,
          occupation:
            coApplicantDetails_1?.occupation,
          // "co_Applicant.0.residenceType":
          // coApplicantDetails_1?.residenceType,
         },
        ]
        },
      },
      {
        new: true,
        upsert: true,
      }
    );
    console.log(pdData, "pdDatapdDatapdData")
    // Update or create CIBIL data
    await cibilModel.updateOne(
      { customerId },
      {
        $set: {
          "coApplicantData.0.coApplicantCibilScore":
            coApplicantDetails_1?.coApplicantOne?.coApplicantCibilScore,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    // Update or create CIBIL KYC data
    await cibilModel.updateOne(
      { customerId },
      {
        $set: {
          "coApplicantData.0.coApplicantTotalAccount":
            coApplicantDetails_1?.coApplicantOne?.totalAccount,
          "coApplicantData.0.coApplicantOverdueAccount":
            coApplicantDetails_1?.coApplicantOne?.overdueAccount,
          "coApplicantData.0.coApplicantZeroBalanceAccount":
            coApplicantDetails_1?.coApplicantOne?.zeroBalanceAccount,
          "coApplicantData.0.coApplicantHighCreditSanctionAmount":
            coApplicantDetails_1?.coApplicantOne?.appFinancialOverview
              ?.HighCreditAndSanctionAmount,
          "coApplicantData.0.coApplicantcurrentOutstanding":
            coApplicantDetails_1?.coApplicantOne?.appFinancialOverview
              ?.TotalCurrentOutstanding,
          "coApplicantData.0.coApplicantTotalOverDueAmount":
            coApplicantDetails_1?.coApplicantOne?.appFinancialOverview
              ?.TotalOverdueAmount,
          "coApplicantData.0.coApplicantNumberOfEnquiry":
            coApplicantDetails_1?.coApplicantOne?.appFinancialOverview
              ?.TotalNumberOfEnquiry,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    const data = await coApplicantModel.find({ customerId });
    const pdformdatasDetail = await creditPdModel.findOne({ customerId });
    const cibilDetail = await cibilModel.findOne({ customerId });
    const cibilKycDetails = await cibilkycModel.findOne({ customerId });
    // const coApplicantIndex = parseInt(index)||0; // Default to 0 if index not provided
    // // console.log(data,"data<><><><><><><>")
    // const value = pdformdatasDetail?.co_Applicant || {};

    const coApplicantIndex = parseInt(index) || 0; // Default to 0 if index not provided

// const value = Array.isArray(pdformdatasDetail?.co_Applicant) 
//   ? pdformdatasDetail?.co_Applicant[0] 
//   : {}; 

const value = Array.isArray(pdformdatasDetail?.co_Applicant)
  ? pdformdatasDetail?.co_Applicant[coApplicantIndex] 
  : Object.values(pdformdatasDetail?.co_Applicant || {})[coApplicantIndex] || {};

  console.log(value,"value")
    const coApplicantData = {
      employeId: `${employeeId}`,
      ApplicantType: value?.coApplicantType || "",
      bussinessType: value.businessType || "",
      coApplicantPhoto: data?.[coApplicantIndex]?.coApplicantPhoto || "",
      fullName: data?.[coApplicantIndex]?.fullName || "",
      fatherName: data?.[coApplicantIndex]?.fatherName || "",
      motherName: data?.[coApplicantIndex]?.motherName || "",
      dob: data?.[coApplicantIndex]?.dob || "",
      age: data?.[coApplicantIndex]?.age || "",
      gender: data?.[coApplicantIndex]?.gender || "",
      maritalStatus: data?.[coApplicantIndex]?.maritalStatus || "",
      educationDetails: data?.[coApplicantIndex]?.education || "",
      relationWithApplicant:
        data?.[coApplicantIndex]?.relationWithApplicant || "",
      religion: data?.[coApplicantIndex]?.religion || "",
      nationality: value.nationality || "",
      caste: value.caste || "",
      category: data?.[coApplicantIndex]?.category || "",
      occupation: value?.occupation || "",
      residenceType: value?.residenceType || "",

      contactInformation: {
        mobileNo: data?.[coApplicantIndex]?.mobileNo || "",
        mobileNoTwo: value.alternateMobileNo || "",
        email: data?.[coApplicantIndex]?.email || "",
      },

      kycDetails: {
        udyamRegistrationNo: "",
        docType: data?.[coApplicantIndex]?.docType || "",
        aadharNo: data?.[coApplicantIndex]?.aadharNo || "",
        docNo: data?.[coApplicantIndex]?.docNo || "",
      },
      kycUpload: {
        aadharFrontImage:data?.[coApplicantIndex]?.kycUpload?.aadharFrontImage || "",
        aadharBackImage: data?.[coApplicantIndex]?.kycUpload?.aadharBackImage || "",
        docImage: data?.[coApplicantIndex]?.kycUpload?.docImage || "",
      },

      // permanentAddressInformation: {
      //   presentAddress:
      //     data?.[coApplicantIndex]?.permanentAddress?.addressLine1 || "",
      //   // landmark: value.houseLandMark || "",
      //   nameOfCity: data?.[coApplicantIndex]?.permanentAddress?.city || "",
      //   city: data?.[coApplicantIndex]?.permanentAddress?.city || "",
      //   state: data?.[coApplicantIndex]?.permanentAddress?.state || "",
      //   districtName:
      //     data?.[coApplicantIndex]?.permanentAddress?.district || "",
      //   pinCode: data?.[coApplicantIndex]?.permanentAddress?.pinCode || "",
      //   noOfyearsAtCurrentAddress: value.noOfyearsAtCurrentAddress || "",
      //   country: "India",
      //   residenceType: value.residenceType || "",
      // },

      presentAddressInformation: {
        AddressAsPerAdhar:
          data?.[coApplicantIndex]?.localAddress?.addressLine1 || "",
        addressLine2: updatedKYC?.localAddress?.addressLine2 || "",
        // fullAddress: data?.[coApplicantIndex]?.permanentAddress?.addressLine2 || "",
        landmark: value?.houseLandMark || "",
        nameOfCity: data?.[coApplicantIndex]?.localAddress?.city || "",
        // addressLine1:
        //   data?.[coApplicantIndex]?.permanentAddress?.addressLine1 || "",
        // addressLine2:
        //   data?.[coApplicantIndex]?.permanentAddress?.addressLine2 || "",
        city: data?.[coApplicantIndex]?.localAddress?.city || "",
        state: data?.[coApplicantIndex]?.localAddress?.state || "",
        districtName: data?.[coApplicantIndex]?.localAddress?.district || "",
        pinCode: data?.[coApplicantIndex]?.localAddress?.pinCode || "",
        noOfyearsAtCurrentAddress: value.noOfyearsAtCurrentAddress || "",
        country: "India",
      },
      coApplicantOne: {
        coApplicantCibilScore:
          cibilDetail?.coApplicantData?.[coApplicantIndex]
            ?.coApplicantCibilScore || "",
        // },

        // accountSummary: {
        totalAccount:
          cibilDetail?.coApplicantData?.[coApplicantIndex]
            ?.coApplicantTotalAccount || "",
        overdueAccount:
          cibilDetail?.coApplicantData?.[coApplicantIndex]
            ?.coApplicantOverdueAccount || "",
        zeroBalanceAccount:
          cibilDetail?.coApplicantData?.[coApplicantIndex]
            ?.coApplicantZeroBalanceAccount || "",
        // },
        appFinancialOverview: {
          HighCreditAndSanctionAmount:
            cibilDetail?.coApplicantData?.[coApplicantIndex]
              ?.coApplicantHighCreditSanctionAmount || "",
          TotalCurrentOutstanding:
            cibilDetail?.coApplicantData?.[coApplicantIndex]
              ?.coApplicantcurrentOutstanding || "",
          TotalOverdueAmount:
            cibilDetail?.coApplicantData?.[coApplicantIndex]
              ?.coApplicantTotalOverDueAmount || "",
          TotalNumberOfEnquiry:
            cibilDetail?.coApplicantData?.[coApplicantIndex]
              ?.coApplicantNumberOfEnquiry || "",
        },
      },
    };

    return success(res, "Customer co-applicant details", {
      data: { coApplicantDetails_1: coApplicantData },
    });

    // return success(
    //   res,
    //   "Customer co-applicant details updated successfully",
    //   coApplicantDetails_2
    // );
  } catch (err) {
    console.log(err);
    return unknownError(res, err);
  }
};

const updateCustomerCoApplicantDetailtwo = async (req, res) => {
  try {
    let {
      customerId,
      coApplicantDetails_2,
      kycDetailsOf,
      contactInformation,
      permanentInformation,
      presentInformation,
      basicInformation,
      accountSummary,
      financialOverview,
      referenceDetails,
      bankDetail,
      kycUpload,
      index,
    } = req.body;

    if (!customerId) {
      return error(res, "Customer ID is required.");
    }


    
    const customerDetails = await customerModel.findById(customerId)

    if (!customerDetails) {
      return badRequest(res , "Customer Not Found");
    }


    customerId = new mongoose.Types.ObjectId(customerId);

    // Fetch all documents related to the customer ID
    const kycs = await coApplicantModel
      .find({ customerId })
      .sort({ createdAt: 1 });
    console.log(kycs, "kycs data", kycs[1]?._id);

    // Select the 2nd document or prepare for new document creation
    const secondDocId = kycs[1]?._id || new mongoose.Types.ObjectId();
    console.log(secondDocId, "secondDocId");

    // Function to handle updates with upsert logic
    const updateOrCreate = async (
      model,
      filter,
      update,
      options = { new: true, upsert: true, setDefaultsOnInsert: true }
    ) => {
      return await model.updateOne(filter, { $set: update }, options);
    };

    // Update or create the 2nd KYC document
    const updatedKYC = await coApplicantModel.findByIdAndUpdate(
      secondDocId,
      {
        customerId,
        employeId:`{customerDetails.employeId}`,
        aadharNo: coApplicantDetails_2?.kycDetailsOf?.aadharNo,
        docType: coApplicantDetails_2?.kycDetailsOf?.docType,
        docNo: coApplicantDetails_2?.kycDetailsOf?.docNo,
        fullName: coApplicantDetails_2?.fullName,
        fatherName: coApplicantDetails_2?.fatherName,
        motherName: coApplicantDetails_2?.motherName,
        spouseName: coApplicantDetails_2?.spouseName,
        relationWithApplicant: coApplicantDetails_2?.relationWithApplicant,
        email: coApplicantDetails_2?.contactInformation?.email,
        dob: coApplicantDetails_2?.dob,
        age: coApplicantDetails_2?.age,
        category: coApplicantDetails_2?.category,
        gender: coApplicantDetails_2?.gender,
        maritalStatus: coApplicantDetails_2?.maritalStatus,
        education: coApplicantDetails_2?.educationDetails,
        religion: coApplicantDetails_2?.religion,
        mobileNo: coApplicantDetails_2?.contactInformation?.mobileNo,

        coApplicantType: coApplicantDetails_2?.ApplicantType,
        businessType: coApplicantDetails_2?.bussinessType,
        occupation: coApplicantDetails_2?.occupation,
        houseLandMark: coApplicantDetails_2?.presentAddressInformation?.landmark,
        alternateMobileNo: coApplicantDetails_2?.contactInformation?.mobileNoTwo,
        noOfyearsAtCurrentAddress:coApplicantDetails_2?.presentAddressInformation.noOfyearsAtCurrentAddress,
        nationality: coApplicantDetails_2?.nationality,
        educationalDetails: coApplicantDetails_2?.educationDetails,
        residenceType: coApplicantDetails_2?.presentAddressInformation?.residenceType,


        permanentAddress: {
          addressLine1:
          coApplicantDetails_2?.presentAddressInformation?.AddressAsPerAdhar,
          addressLine2:
          coApplicantDetails_2?.presentAddressInformation?.addressLine2,
          city: coApplicantDetails_2?.presentAddressInformation?.city,
          state: coApplicantDetails_2?.presentAddressInformation?.state,
          district:
          coApplicantDetails_2?.presentAddressInformation?.districtName,
          pinCode:  coApplicantDetails_2?.presentAddressInformation?.pinCode,
        },
        kycUpload: {
          aadharFrontImage:coApplicantDetails_2?.kycUpload?.aadharFrontImage || "",
          aadharBackImage: coApplicantDetails_2?.kycUpload?.aadharBackImage || "",
          docImage: coApplicantDetails_2?.kycUpload?.docImage || "",
        },
        localAddress: {
          addressLine1:
            coApplicantDetails_2?.presentAddressInformation?.AddressAsPerAdhar,
          addressLine2:
            coApplicantDetails_2?.presentAddressInformation?.addressLine2,
          city: coApplicantDetails_2?.presentAddressInformation?.city,
          state: coApplicantDetails_2?.presentAddressInformation?.state,
          district:
            coApplicantDetails_2?.presentAddressInformation?.districtName,
          pinCode: coApplicantDetails_2?.presentAddressInformation?.pinCode,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const updatedApplicant = await coApplicantModel.findById(secondDocId);

    // Credit PD Update
    await updateOrCreate(
      creditPdModel,
      { customerId },
      {
        customerId,
        "co_Applicant.1.coApplicantType": coApplicantDetails_2?.ApplicantType,
        "co_Applicant.1.businessType": coApplicantDetails_2?.bussinessType,
        "co_Applicant.1.nationality": coApplicantDetails_2?.nationality,
        "co_Applicant.1.caste": coApplicantDetails_2?.caste,
        "co_Applicant.1.noOfDependentWithCustomer": coApplicantDetails_2?.noOfDependentWithCustomer,
        "co_Applicant.1.houseLandMark":coApplicantDetails_2?.presentAddressInformation?.landmark,
        "co_Applicant.1.alternateMobileNo":coApplicantDetails_2?.contactInformation?.mobileNoTwo,
        "co_Applicant.1.noOfyearsAtCurrentAddress":coApplicantDetails_2?.presentAddressInformation?.noOfyearsAtCurrentAddress,
        "co_Applicant.1.residenceType":coApplicantDetails_2?.presentAddressInformation?.residenceType,
        "co_Applicant.1.occupation":coApplicantDetails_2?.occupation,
        // "co_Applicant.1.residenceType":
        // coApplicantDetails_2?.residenceType,
      }
    );

    // CIBIL Update
    await updateOrCreate(
      cibilModel,
      { customerId },
      {
        "coApplicantData.1.coApplicantCibilScore":
          coApplicantDetails_2?.coApplicantTwo?.coApplicantCibilScore,
      }
    );

    // CIBIL KYC Update
    await updateOrCreate(
      cibilModel,
      { customerId },
      {
        "coApplicantData.1.coApplicantTotalAccount": coApplicantDetails_2?.coApplicantTwo?.totalAccount,
        "coApplicantData.1.coApplicantOverdueAccount": coApplicantDetails_2?.coApplicantTwo?.overdueAccount,
        "coApplicantData.1.coApplicantZeroBalanceAccount": coApplicantDetails_2?.coApplicantTwo?.zeroBalanceAccount,
        "coApplicantData.1.coApplicantHighCreditSanctionAmount":coApplicantDetails_2?.coApplicantTwo?.appFinancialOverview?.HighCreditAndSanctionAmount,
        "coApplicantData.1.coApplicantcurrentOutstanding":
          coApplicantDetails_2?.coApplicantTwo?.appFinancialOverview
            ?.TotalCurrentOutstanding,
        "coApplicantData.1.coApplicantTotalOverDueAmount":
          coApplicantDetails_2?.coApplicantTwo?.appFinancialOverview
            ?.TotalOverdueAmount,
        "coApplicantData.1.coApplicantNumberOfEnquiry":
          coApplicantDetails_2?.coApplicantTwo?.appFinancialOverview
            ?.TotalNumberOfEnquiry,
      }
    );

    const data = await coApplicantModel.find({ customerId });
    const pdformdatasDetail = await creditPdModel.findOne({ customerId });
    const cibilDetail = await cibilModel.findOne({ customerId });
    const cibilKycDetails = await cibilkycModel.findOne({ customerId });
    const coApplicantIndex = parseInt(index) || 1; // Default to 0 if index not provided

    const value = pdformdatasDetail?.co_Applicant?.[coApplicantIndex] || {};
    const coApplicantData = {
      employeId: `${customerDetails.employeId}`,
      ApplicantType: value.coApplicantType || "",
      bussinessType: value.businessType || "",
      coApplicantPhoto: data?.[coApplicantIndex]?.coApplicantPhoto || "",
      fullName: data?.[coApplicantIndex]?.fullName || "",
      fatherName: data?.[coApplicantIndex]?.fatherName || "",
      motherName: data?.[coApplicantIndex]?.motherName || "",
      dob: data?.[coApplicantIndex]?.dob || "",
      age: data?.[coApplicantIndex]?.age || "",
      gender: data?.[coApplicantIndex]?.gender || "",
      maritalStatus: data?.[coApplicantIndex]?.maritalStatus || "",
      educationDetails: data?.[coApplicantIndex]?.education || "",
      relationWithApplicant:
        data?.[coApplicantIndex]?.relationWithApplicant || "",
      religion: data?.[coApplicantIndex]?.religion || "",
      nationality: value.nationality || "",
      caste: value.caste || "",
      category: data?.[coApplicantIndex]?.category || "",
      occupation: value?.occupation || "",
      residenceType: value?.residenceType || "",

      contactInformation: {
        mobileNo: data?.[coApplicantIndex]?.mobileNo || "",
        mobileNoTwo: value.alternateMobileNo || "",
        email: data?.[coApplicantIndex]?.email || "",
      },

      kycDetails: {
        udyamRegistrationNo: "",
        docType: data?.[coApplicantIndex]?.docType || "",
        aadharNo: data?.[coApplicantIndex]?.aadharNo || "",
        docNo: data?.[coApplicantIndex]?.docNo || "",
      },
      kycUpload: {
        aadharFrontImage:data?.[coApplicantIndex]?.kycUpload?.aadharFrontImage || "",
        aadharBackImage: data?.[coApplicantIndex]?.kycUpload?.aadharBackImage || "",
        docImage: data?.[coApplicantIndex]?.kycUpload?.docImage || "",
      },

      // permanentAddressInformation: {
      //   presentAddress:
      //     data?.[coApplicantIndex]?.permanentAddress?.addressLine1 || "",
      //   // landmark: value.houseLandMark || "",
      //   nameOfCity: data?.[coApplicantIndex]?.permanentAddress?.city || "",
      //   city: data?.[coApplicantIndex]?.permanentAddress?.city || "",
      //   state: data?.[coApplicantIndex]?.permanentAddress?.state || "",
      //   districtName:
      //     data?.[coApplicantIndex]?.permanentAddress?.district || "",
      //   pinCode: data?.[coApplicantIndex]?.permanentAddress?.pinCode || "",
      //   // noOfyearsAtCurrentAddress: value.noOfyearsAtCurrentAddress || "",
      //   country: "India",
      //   residenceType: value.residenceType || "",
      // },

      presentAddressInformation: {
        AddressAsPerAdhar:
          data?.[coApplicantIndex]?.localAddress?.addressLine1 || "",
        addressLine2:
          data?.[coApplicantIndex]?.localAddress?.addressLine2 || "",
        // fullAddress: data?.[coApplicantIndex]?.permanentAddress?.addressLine2 || "",
        landmark: value.houseLandMark || "",
        nameOfCity: data?.[coApplicantIndex]?.localAddress?.city || "",
        // addressLine1:
        //   data?.[coApplicantIndex]?.permanentAddress?.addressLine1 || "",
        city: data?.[coApplicantIndex]?.localAddress?.city || "",
        state: data?.[coApplicantIndex]?.localAddress?.state || "",
        districtName: data?.[coApplicantIndex]?.localAddress?.district || "",
        pinCode: data?.[coApplicantIndex]?.localAddress?.pinCode || "",
        noOfyearsAtCurrentAddress: value.noOfyearsAtCurrentAddress || "",
        country: "India",
      },

      coApplicantTwo: {
        coApplicantCibilScore:
          cibilDetail?.coApplicantData?.[coApplicantIndex]
            ?.coApplicantCibilScore || "",
        // },

        // accountSummary: {
        totalAccount:
          cibilDetail?.coApplicantData?.[coApplicantIndex]
            ?.coApplicantTotalAccount || "",
        overdueAccount:
          cibilDetail?.coApplicantData?.[coApplicantIndex]
            ?.coApplicantOverdueAccount || "",
        zeroBalanceAccount:
          cibilDetail?.coApplicantData?.[coApplicantIndex]
            ?.coApplicantZeroBalanceAccount || "",
        // },
        appFinancialOverview: {
          HighCreditAndSanctionAmount:
            cibilDetail?.coApplicantData?.[coApplicantIndex]
              ?.coApplicantHighCreditSanctionAmount || "",
          TotalCurrentOutstanding:
            cibilDetail?.coApplicantData?.[coApplicantIndex]
              ?.coApplicantcurrentOutstanding || "",
          TotalOverdueAmount:
            cibilDetail?.coApplicantData?.[coApplicantIndex]
              ?.coApplicantTotalOverDueAmount || "",
          TotalNumberOfEnquiry:
            cibilDetail?.coApplicantData?.[coApplicantIndex]
              ?.coApplicantNumberOfEnquiry || "",
        },
      },
    };

    return success(res, "Customer co-applicant details", {
      data: { coApplicantDetails_2: coApplicantData },
    });

    // return success(
    //   res,
    //   "Customer co-applicant details updated successfully",
    //   coApplicantDetails
    // );
  } catch (err) {
    console.log(err);
    return unknownError(res, err);
  }
};



const updateProfile = async (req, res) => {
  try {
    const { customerId, applicantProfile, guarantorProfile, coApplicantProfile, coApplicantProfileTwo , coApplicantProfileThree} = req.body;
    // const fileData = req.files;

    // Initialize update results
    let applicantData, guarantorData, coApplicantData, coApplicantDataTwo , coApplicantDataThree;

  //   { name: "applicantProfile", maxCount: 1 },
  //   { name: "guarantorProfile", maxCount: 1 },
  //   { name: "coApplicantProfile", maxCount: 1 },
  //   { name: "coApplicantProfileTwo", maxCount: 1 },

    // Update applicant profile
    if (applicantProfile) {
      try {
        applicantData = await applicantModel.findOneAndUpdate(
          { customerId },
          { $set: { applicantPhoto: applicantProfile } },
          { new: true }
        );
      } catch (err) {
        console.error("Error updating applicant profile:", err);
      }
    }

    // Handle guarantor profile independently
    try {
      if (guarantorProfile) {
        const gtrData = await guarantorModel.findOne({ customerId });

        if (!gtrData) {
          return badRequest(res, "gtr not found");
        }
        guarantorData = await guarantorModel.findOneAndUpdate(
          { customerId },
          { $set: { guarantorPhoto: guarantorProfile } },
          { new: true }
        );
      }
    } catch (err) {
      console.error("Error updating guarantor profile:", err);
    }

    // Handle co-applicant logic separately
    try {
      // Update first co-applicant profile
      if (coApplicantProfile) {
        const coAppData = await coApplicantModel.find({ customerId });

        if (!coAppData || coAppData.length === 0) {
          return badRequest(res, "co-app not found");
        }
        coApplicantData = await coApplicantModel.findOneAndUpdate(
          { _id: coAppData[0]._id },
          { $set: { coApplicantPhoto: coApplicantProfile } },
          { new: true }
        );
      }

      // Update second co-applicant profile if a second record exists
      if (coApplicantProfileTwo) {
        const coAppData = await coApplicantModel.find({ customerId });

        if (!coAppData || coAppData.length === 0 || !(coAppData.length > 1)) {
          return badRequest(res, "co-app two not found");
        }
        coApplicantDataTwo = await coApplicantModel.findOneAndUpdate(
          { _id: coAppData[1]._id },
          { $set: { coApplicantPhoto: coApplicantProfileTwo } },
          { new: true }
        );
      }

      if (coApplicantProfileThree) {
        const coAppData = await coApplicantModel.find({ customerId });

        if (!coAppData || coAppData.length === 0 || !(coAppData.length > 2)) {
          return badRequest(res, "co-app Three not found");
        }
        coApplicantDataThree = await coApplicantModel.findOneAndUpdate(
          { _id: coAppData[2]._id },
          { $set: { coApplicantPhoto: coApplicantProfileThree } },
          { new: true }
        );
      }

    } catch (err) {
      console.error("Error updating co-applicant profile:", err);
    }

    // Success response with updated data
    return success(res, "Customer profile updated successfully", {
      applicantDetails: applicantData?.applicantPhoto,
      guarantorInformation: guarantorData?.guarantorPhoto,
      coApplicantDetails: coApplicantData?.coApplicantPhoto,
      coApplicantDetailsTwo: coApplicantDataTwo?.coApplicantPhoto,
      coApplicantProfileThree: coApplicantDataThree?.coApplicantPhoto,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return unknownError(res, err);
  }
};

const finacialDetails = async (req, res) => {
  try {
    const {
      agriculture,
      MilkBusiness,
      SalaryIncome,
      OthersBusinessIncome,
      customerId,
    } = req.body;

    const agricultureData = await agricultureModel.findOneAndUpdate(
      { customerId },
      {
        $set: {
          agricultureDocument: agriculture?.agricultureDocument || [],
          LD: agriculture?.LD || "",
          incomeType: agriculture?.incomeType || "",
          agriDetails: agriculture?.agriDetails || "",
          agriIncomeYearly: agriculture?.yearlyIncome || "",
          availableLandInAcre: agriculture?.availableLand || "",
          agriLandAddressAsPerPavati:
            agriculture?.agriLandAddressAsPerPavati || "",
          agriLandSurveyNo: agriculture?.agriLandSurveyNo || "",
          LandOwnerName: agriculture?.LandOwnerName || "",
          relationWithApplicant: agriculture?.relationWithApplicant || "",
          cropCultivated: agriculture?.cropCultivated || "",
          NoOfAgricultureOwner: agriculture?.NoOfAgricultureOwner || "",
          monthlyExpence: agriculture?.monthlyExpence || "",
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    const milkIncomeData = await milkIncomeModel.findOneAndUpdate(
      { customerId },
      {
        $set: {
          milkDocument: MilkBusiness?.milkDocument || [],
          noOfYears: MilkBusiness?.yearOfExperience || "",
          NoOfCattles: MilkBusiness?.TotalCattle || "",
          NoOfMilkGivingCattles: MilkBusiness?.MilkGivingCattle || "",
          averageDailyMilkQuantity:
            MilkBusiness?.AverageDailyMilkQuantitIinLitters || "",
          NameOfDairy: MilkBusiness?.DairyName || "",
          adressOfDairy: MilkBusiness?.DairyAddress || "",
          contactDetailsOfDairyOwnerIfAvailable:
            MilkBusiness?.DairyOwnerContact || "",
          noOfYears: MilkBusiness?.YearProvdingToDairy || "",
          expensesOfMilkBuisness: MilkBusiness?.Expenses || "",
          monthlyIncomeMilkBuisness: MilkBusiness?.MonthlyIncome || "",
          expensesAtMilkBuisness: MilkBusiness?.monthlyExpence || "",
          milkProvidingToAboveDairy:
            MilkBusiness?.milkProvidingToAboveDairy || "",
          yearlyIncomeMilkBuisness: MilkBusiness?.annualIncome || "",
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    const salaryAndOtherIncomeData =
      await salaryAndOtherIncomeModel.findOneAndUpdate(
        {
          customerId,
        },
        {
          $set: {
            otherIncomeDocument: SalaryIncome?.otherIncomeDocument || [],
            LD: SalaryIncome?.LD || "",
            incomeType3: SalaryIncome?.incomeType3 || "",
            salaryOtherIncomeSource:
              SalaryIncome?.salaryOtherIncomeSource || "",
            companyName: SalaryIncome?.companyName || "",
            adressOfSalaryProvider: SalaryIncome?.adressOfSalaryProvider || "",
            mobNoOfSalaryProvider: SalaryIncome?.mobNoOfSalaryProvider || "",
            doingFromNoYears: SalaryIncome?.doingFromNoYears || "", //
            monthlyIncomeEarned: SalaryIncome?.monthlyIncomeEarned || "",
            monthlyExpences: SalaryIncome?.monthlyExpences || "",
          },
        },
        {
          new: true,
          upsert: true,
        }
      );

    const otherBuisnessData = await otherBuisnessModel.findOneAndUpdate(
      { customerId },
      {
        $set: {
          otherBusinessDocument:
            OthersBusinessIncome?.otherBusinessDocument || [],
          doingFromNoOfYears: OthersBusinessIncome?.YearOfExperience || "",
          natureOfBuisness: OthersBusinessIncome?.NatureOfBusiness || "",
          nameOfBuisness: OthersBusinessIncome?.NameOfBusines || "",
          monthlyIncomeEarned: OthersBusinessIncome?.MonthlyIncome || "",
          monthlyexpences: OthersBusinessIncome?.Monthlyexpences || "",
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    const pdformdatasDetail = await creditPdModel.findOneAndUpdate(
      {
        customerId,
        "incomeSource.incomeSourceType": "agricultureBusiness", // Match the type
      },
      {
        $set: {
          "incomeSource.$.agricultureBusiness.agriLandInBigha":
            agriculture?.TotalNoOfAGRILand || "",
          "incomeSource.$.agricultureBusiness.agriIncomeYearly":
            agriculture?.yearlyIncome || "",
          "incomeSource.$.agricultureBusiness.agriDoingFromNoOfYears":
            agriculture?.TotalNoOfAGRILand || "", //monthlyNetSalary // Update only the matching array element
          "incomeSource.$.salaryIncome.monthlyNetSalary":
            SalaryIncome?.monthlyIncome || "",
          "incomeSource.$.other.yearlyIncome":
            OthersBusinessIncome?.AnnualIncome || "",
        },
      },
      {
        new: true,
        upsert: true, // Return the updated document
      }
    );

    const yearlyIncome =
      pdformdatasDetail?.incomeSource?.[0]?.agricultureBusiness
        ?.agriIncomeYearly || "";
    const MonthlyIncome = salaryAndOtherIncomeData?.monthlyIncomeEarned || "";
    // console.log(pdformdatasDetail,"pdformdatasDetail",MonthlyIncome)

    let responseData = {
      agriculture: {
        // agricultureDocument: agricultureData?.agricultureDocument || [],
        // LD: agricultureData?.LD || "",
        // incomeType: agricultureData?.incomeType || "",
        // agriDetails: agricultureData?.agriDetails || "",
        monthlyIncome: yearlyIncome ? yearlyIncome / 12 : 0,
        yearlyIncome:
          pdformdatasDetail?.incomeSource[0]?.agricultureBusiness
            ?.agriIncomeYearly || "",
        availableLand: agricultureData?.availableLandInAcre || "",
        // agriLandAddressAsPerPavati:
        //   agricultureData?.agriLandAddressAsPerPavati || "",
        agriLandSurveyNo: agricultureData?.agriLandSurveyNo || "",
        LandOwnerName: agricultureData?.LandOwnerName || "",
        // relationWithApplicant: agricultureData?.relationWithApplicant || "",
        cropCultivated: agricultureData?.cropCultivated || "",
        TotalNoOfAGRILand:
          pdformdatasDetail?.incomeSource[0]?.agricultureBusiness
            ?.agriLandInBigha || "",
        NoOfAgricultureOwner: agricultureData?.NoOfAgricultureOwner || "",
        monthlyExpence: agricultureData?.monthlyExpence || "",
        agriDoingFromNoOfYears:
          pdformdatasDetail?.incomeSource[0]?.agricultureBusiness
            ?.agriDoingFromNoOfYears || "",
      },
      MilkBusiness: {
        // milkDocument: milkIncomeData?.milkDocument || [],
        yearOfExperience: milkIncomeData?.noOfYears || "",
        TotalCattle: milkIncomeData?.NoOfCattles || "",
        MilkGivingCattle: milkIncomeData?.NoOfMilkGivingCattles || "",
        AverageDailyMilkQuantitIinLitters:
          milkIncomeData?.averageDailyMilkQuantity || "",
        DairyName: milkIncomeData?.NameOfDairy || "",
        DairyAddress: milkIncomeData?.adressOfDairy || "",
        DairyOwnerContact:
          milkIncomeData?.contactDetailsOfDairyOwnerIfAvailable || "",
        YearProvdingToDairy: milkIncomeData?.noOfYears || "",
        Expenses: milkIncomeData?.expensesOfMilkBuisness || "",
        MonthlyIncome: milkIncomeData?.monthlyIncomeMilkBuisness || "",
        annualIncome: milkIncomeData?.yearlyIncomeMilkBuisness || "",
        monthlyExpence: milkIncomeData?.expensesAtMilkBuisness || "",
        milkProvidingToAboveDairy:
          milkIncomeData?.milkProvidingToAboveDairy || "",
      },
      SalaryIncome: {
        // otherIncomeDocument:
        //   salaryAndOtherIncomeData?.otherIncomeDocument || [],
        // LD: salaryAndOtherIncomeData?.LD || "",
        // incomeType3: salaryAndOtherIncomeData?.incomeType3 || "",
        // salaryOtherIncomeSource:
        //   salaryAndOtherIncomeData?.salaryOtherIncomeSource || "",
        // companyName: salaryAndOtherIncomeData?.companyName || "",
        // adressOfSalaryProvider:
        //   salaryAndOtherIncomeData?.adressOfSalaryProvider || "",
        // mobNoOfSalaryProvider:
        //   salaryAndOtherIncomeData?.mobNoOfSalaryProvider || "",
        doingFromNoYears: salaryAndOtherIncomeData?.doingFromNoYears || "",
        monthlyIncomeEarned:
          salaryAndOtherIncomeData?.monthlyIncomeEarned || "",
        monthlyExpences: salaryAndOtherIncomeData?.monthlyExpences || "",
        yearlyIncome: MonthlyIncome ? MonthlyIncome * 12 : 0,
      },
      OthersBusinessIncome: {
        // otherBusinessDocument: otherBuisnessData?.otherBusinessDocument || [],
        YearOfExperience: otherBuisnessData?.doingFromNoOfYears || "",
        NatureOfBusiness: otherBuisnessData?.natureOfBuisness || "",
        // NameOfBusines: otherBuisnessData?.nameOfBuisness || "",
        MonthlyIncome: otherBuisnessData?.monthlyIncomeEarned || "",
        Monthlyexpences: otherBuisnessData?.monthlyexpences || "",
        AnnualIncome:
          pdformdatasDetail?.incomeSource[0]?.other?.yearlyIncome || "",
      },
    };

    return success(res, "finacial updated successfully", {
      data: responseData,
    });
  } catch (err) {
    console.error(err);
    return unknownError(res, err);
  }
};

const updateChargeDetails = async (req, res) => {
  try {
    const {
      customerId,
      processingFees,
      documentsCharges,
      insuranceCharges,
      cersaiCharges,
      benchmarkinterestRate,
      SpreadInterestRate,
      annualPercentageRateAprPercentage,
      epi,
      noOfEpi,
    } = req.body;
    const data = await disbursementModel.findOne({ customerId });
    const updatedData = await disbursementModel.findOneAndUpdate(
      {
        customerId,
      },
      {
        $set: {
          kfsDetails: {
            processingFees,
            documentsCharges,
            insuranceCharges,
            cersaiCharges,
            // preEmiInterest,
            benchmarkinterestRate,
            SpreadInterestRate,
            annualPercentageRateAprPercentage,
            epi,
            noOfEpi,
          },
        },
      },
      {
        new: true,
        upsert: true,
      }
    );
    // console.log(updatedData);

    // const updateFields = {};
    // const fieldsToCheck = [
    //   "kfsDetails.processingFees",
    //   "kfsDetails.documentsCharges",
    //   "kfsDetails.insuranceCharges",
    //   "kfsDetails.cersaiCharges",
    //   "kfsDetails.preEmiInterest",
    //   "kfsDetails.benchmarkinterestRate",
    //   "kfsDetails.SpreadInterestRate",
    //   "kfsDetails.annualPercentageRateAprPercentage",
    //   "kfsDetails.epi",
    //   "kfsDetails.noOfEpi",
    // ];
  
    // // Helper function to safely access nested fields
    // const getFieldValue = (obj, field) => {
    //   return field.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
    // };
  
    // // Determine filled fields in the updated/created document
    // const filledFields = fieldsToCheck.filter((field) => getFieldValue(updatedData, field));
  
    // console.log("Filled Fields:", filledFields);
  
    // // Update flags based on filled fields
    // if (filledFields.length > 0) {
    //   updateFields.chargesDetailsFormStart = true;
    // }
    // if (filledFields.length === fieldsToCheck.length) {
    //   updateFields.chargesDetailsFormComplete = true;
    // }
  
    // // Update process model if any flags are set
    // if (Object.keys(updateFields).length > 0) {
    //   const updatedProcess = await processModel.findOneAndUpdate(
    //     { customerId },
    //     { $set: updateFields },
    //     { new: true }
    //   );
    //   console.log("Process Model Updated:", updatedProcess);
    // }

    // Success response with updated data
     success(res, "Charges details updated successfully", {
      data: updatedData?.kfsDetails || {},
    });
  
  } catch (err) {
    console.error(err);
    return unknownError(res, err);
  }
};

// const updateCustomerCoApplicantDetailtwo = async (req, res) => {
//   try {
//     let { customerId } = req.body;
//     const {
//       coApplicantDetails,
//       kycDetailsOf,
//       contactInformation,
//       permanentInformation,
//       presentInformation,
//       basicInformation,
//       accountSummary,
//       financialOverview,
//       referenceDetails,
//       bankDetail,
//     } = req.body;

//     if (!customerId) {
//       return error(res, "Customer ID is required.");
//     }

//     customerId = new mongoose.Types.ObjectId(customerId);

//   const kycs = await coApplicantModel.find({ customerId }).sort({ createdAt: 1 });

//     if (kycs.length < 2) {
//       console.log('Only one or no documents found for this customerId');
//       return;
//     }

//     // Step 2: Select the 2nd document (index 1)
//     const secondDocId = kycs[1]._id;

//     // Step 3: Update the 2nd document
//     const updatedKYC = await coApplicantModel.findByIdAndUpdate(
//       secondDocId,
//       {
//       $set: {
//         aadharNo:coApplicantDetails?.aadharNo,
//         docType:coApplicantDetails?.docType,
//         docNo:coApplicantDetails?.docNo,
//         fullName: coApplicantDetails?.fullName,
//         fatherName: coApplicantDetails?.fatherName,
//         motherName: coApplicantDetails?.motherName,
//         spouseName: coApplicantDetails?.spouseName,
//         relationWithApplicant:coApplicantDetails?.relationWithApplicant,
//         email:coApplicantDetails?.email,
//         dob: coApplicantDetails?.dob,
//         age: coApplicantDetails?.age,
//         caste:coApplicantDetails?.caste,
//         gender: coApplicantDetails?.gender,
//         maritalStatus: coApplicantDetails?.maritalStatus,
//         education: coApplicantDetails?.education,
//         religion: coApplicantDetails?.religion,
//         mobileNo:coApplicantDetails?.mobileNo,
//         permanentAddress: {
//           "permanentAddress.addressLine1": coApplicantDetails?.permanentAddress?.fullAddress,
//           "permanentAddress.city": coApplicantDetails?.permanentAddress?.city,
//           "permanentAddress.state": coApplicantDetails?.permanentAddress?.state,
//           "permanentAddress.district": coApplicantDetails?.permanentAddress?.district,
//           "permanentAddress.pinCode": coApplicantDetails?.permanentAddress?.pinCode,
//         },
//         localAddress: {
//           "localAddress.addressLine1": coApplicantDetails?.localAddress?.addressAsPerAdhar,
//           "localAddress.city": coApplicantDetails?.localAddress?.city,
//           "localAddress.state": coApplicantDetails?.localAddress?.state,
//           "localAddress.district": coApplicantDetails?.localAddress?.district,
//           "localAddress.pinCode": coApplicantDetails?.localAddress?.pinCode,
//         },
//       },
//       },
//       { new: true }   // Return updated document
//     );
//     // res.status(200).json({ message: "First document updated successfully", data: coapplicant });

//     // Update in creditPdModel

//     const updatedApplicant = await coApplicantModel
//     .find({_id:secondDocId }); // Filter condition
//     console.log(updatedApplicant,"updatedApplicant")
//     const updatedCredit = await creditPdModel.findOne({ customerId });
//     const updatedUdhyam = await udyamModel.findOne({ customerId });
//     const updatedCibil = await cibilModel.findOne({ customerId });
//     const updatedCibilKyc = await cibilkycModel.findOne({ customerId });
//     // const updatedCam = await camReportModel.findOne({ customerId });

//     const response = {
//       Coapplicant: updatedApplicant,
//       // credit: updatedCredit,
//       // credit:updatedCredit.applicant,
//       // udyamRegistrationNo: updatedUdhyam?.udyamDetails?.udyamRegistrationNo,
//       // applicantCibilScore: updatedCibil?.applicantCibilScore,
//       // cibilKyc: updatedCibilKyc,
//       // reference,
//       // bankDetail
//       // cam: updatedCam,
//     };

//     return success(res, "Customer applicant details updated successfully",response);
//   } catch (error) {
//     console.log(error);
//     return unknownError(res, error);
//   }
// };

const uploadStempDocuments = async (req, res) => {
  try {
    const { customerId } = req.body;
    const fileData = req.file;
    const data = await loanDocumentModel.findOneAndUpdate(
      {
        customerId,
      },
      {
        $set: {
          stampPdf: `/uploads/${fileData?.filename}`,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );
    return success(res, "updated successfully", {
      data: data?.stampPdf || "",
    });
  } catch (error) {
    console.error(err);
    return unknownError(res, err);
  }
};

const deleteStempDocuments = async (req, res) => {
  try {
    const { customerId } = req.query;
    const data = await loanDocumentModel.findOneAndUpdate(
      {
        customerId,
      },
      {
        $set: {
          stampPdf: [],
        },
      },
      {
        new: true,
        upsert: true,
      }
    );
    return success(res, "deleted successfully");
  } catch (error) {
    console.error(err);
    return unknownError(res, err);
  }
};

const updatePostDisbustment = async (req, res) => {
  try {
    const {
      customerId,
      loanNumber,
      actualPreEmi,
      dateOfDisbursement,
      dateOfFirstEmi,
      utrNumberOne,
      utrNumberTwo,
      disbursementDoneBy,
      applicantName,
    } = req.body;
    const updatedData = await disbursementModel.findOneAndUpdate(
      {
        customerId,
      },
      {
        $set: {
          postDisbursementDetails: {
            loanNumber,
            actualPreEmi,
            dateOfDisbursement,
            dateOfFirstEmi,
            utrNumberOne,
            utrNumberTwo,
            disbursementDoneBy
          },
        },
      },
      {
        new: true,
        upsert: true,
      }
    );
    console.log(updatedData);
    // Success response with updated data
    return success(res, "postDisbursementDetails updated successfully", {
      data: updatedData?.postDisbursementDetails || {},
    });
  } catch (err) {
    console.error(err);
    return unknownError(res, err);
  }
};

const updateDisbursementApplicant = async (req, res) => {
  try {
    const {
      customerId,
      bankName,
      AccountHolderName,
      AccountNumber,
      IFSCCode,
      accountType,
      branchName,
      remark,
      disbursementDoneBy,
      totalChequeCount,
      chequeOne,
      chequeTwo,
      chequeThree,
      chequeFour,
      chequeFive,
      chequeSix,
      chequeSeven,
      chequeEight,
      chequeNine,
      chequeTen
    } = req.body;
    const updatedData = await disbursementModel.findOneAndUpdate(
      {
        customerId,
      },
      {
        $set: {
          applicantForm: {
            bankName,
            AccountHolderName,
            AccountNumber,
            IFSCCode,
            accountType,
            branchName,
            remark,
            disbursementDoneBy,
            totalChequeCount,
            chequeOne,
            chequeTwo,
            chequeThree,
            chequeFour,
            chequeFive,
            chequeSix,
            chequeSeven,
            chequeEight,
            chequeNine,
            chequeTen
          },
        },
      },
      {
        new: true,
        upsert: true,
      }
    );
    console.log(updatedData);
    // Success response with updated data
    return success(res, "postDisbursement applicant updated successfully", {
      data: updatedData?.applicantForm || {},
    });
  } catch (err) {
    console.error(err);
    return unknownError(res, err);
  }
}

const updateDisbursementGuarantor = async (req, res) => {
  try {
    const {
      customerId,
      guarantorName,
      bankName,
      AccountHolderName,
      AccountNumber,
      IFSCCode,
      accountType,
      branchName,
      remark,
      disbursementDoneBy,
      totalChequeCount,
      chequeOne,
      chequeTwo,
      chequeThree,
      chequeFour,
      chequeFive,
      chequeSix,
      chequeSeven,
      chequeEight,
      chequeNine,
      chequeTen
    } = req.body;
    const updatedData = await disbursementModel.findOneAndUpdate(
      {
        customerId,
      },
      {
        $set: {
          guarantorForm: {
            bankName,
            guarantorName,
            AccountHolderName,
            AccountNumber,
            IFSCCode,
            accountType,
            branchName,
            remark,
            disbursementDoneBy,
            totalChequeCount,
            chequeOne,
            chequeTwo,
            chequeThree,
            chequeFour,
            chequeFive,
            chequeSix,
            chequeSeven,
            chequeEight,
            chequeNine,
            chequeTen
          },
        },
      },
      {
        new: true,
        upsert: true,
      }
    );
    // console.log(updatedData);
    // Success response with updated data
    return success(res, "postDisbursement applicant updated successfully", {
      data: updatedData?.guarantorForm || {},
    });
  } catch (err) {
    console.error(err);
    return unknownError(res, err);
  }
}


const updateCoApplianMultiple = async(req , res) =>{
    try {
      let { customerId, _id, coApplicantDetails } = req.body;
      const tokenId = req.Id
      const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");

      const coApplicantDetails_1 = coApplicantDetails
  
      if (!customerId) {
        return badRequest(res , "Customer ID is Required");
      }

      const customerDetails = await customerModel.findById(customerId)

      if (!customerDetails) {
        return badRequest(res , "Customer Not Found");
      }
  
      customerId = new mongoose.Types.ObjectId(customerId);
  
      const coApplicants = await coApplicantModel.find({ customerId }).sort({ createdAt: 1 });

      if (_id) {
        
        const processDetails = await processModel.findOneAndUpdate(
          {
            customerId,
            "fileStageForms.coApplicant.coApplicantId": null, 
          },
          {
            $set: {
              "fileStageForms.coApplicant.$.coApplicantId": _id, 
              "fileStageForms.coApplicant.$.dealSummaryStatus": true, 
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
                  coApplicantId: _id,
                  dealSummaryStatus: true,
                },
              },
            },
            { new: true }
          );
        
        }
        

        const selectedIndex = coApplicants.findIndex((item) => item._id.toString() === _id);
        if (selectedIndex === -1) {
          return notFound(res ,  "Invalid co-applicant ID.");
        }
  
        const selectedCoApplicant = coApplicants[selectedIndex];
  
        // **Update coApplicantModel**
      const updateData =   await coApplicantModel.findByIdAndUpdate(
          selectedCoApplicant._id,
          {
            $set: {
              customerId,
              employeId: customerDetails.employeId,
              formUpdatedEmployeeId : tokenId,
              aadharNo: coApplicantDetails_1?.kycDetails?.aadharNo,
              docType: coApplicantDetails_1?.kycDetails?.docType,
              docNo: coApplicantDetails_1?.kycDetails?.docNo,
              fullName: coApplicantDetails_1?.fullName,
              fatherName: coApplicantDetails_1?.fatherName,
              motherName: coApplicantDetails_1?.motherName,
              spouseName: coApplicantDetails_1?.spouseName,
              relationWithApplicant: coApplicantDetails_1?.relationWithApplicant,
              email: coApplicantDetails_1?.contactInformation?.email,
              dob: coApplicantDetails_1?.dob,
              age: coApplicantDetails_1?.age,
              category: coApplicantDetails_1?.category,
              caste: coApplicantDetails_1?.caste,
              gender: coApplicantDetails_1?.gender,
              maritalStatus: coApplicantDetails_1?.maritalStatus,
              education: coApplicantDetails_1?.educationDetails,
              religion: coApplicantDetails_1?.religion,
              mobileNo: coApplicantDetails_1?.contactInformation?.mobileNo,

              coApplicantType: coApplicantDetails_1?.ApplicantType,
              businessType: coApplicantDetails_1?.bussinessType,
              nationality: coApplicantDetails_1?.nationality,
              noOfyearsAtCurrentAddress: coApplicantDetails_1?.presentAddressInformation?.noOfyearsAtCurrentAddress,
              houseLandMark: coApplicantDetails_1?.presentAddressInformation?.landmark,
              alternateMobileNo: coApplicantDetails_1?.contactInformation?.mobileNoTwo,
              residenceType: coApplicantDetails_1?.presentAddressInformation?.residenceType,
              occupation: coApplicantDetails_1?.occupation,

              permanentAddress: coApplicantDetails_1?.presentAddressInformation
                ? {
                    addressLine1: coApplicantDetails_1.presentAddressInformation.AddressAsPerAdhar,
                    addressLine2: coApplicantDetails_1.presentAddressInformation.addressLine2,
                    city: coApplicantDetails_1.presentAddressInformation.city,
                    state: coApplicantDetails_1.presentAddressInformation.state,
                    district: coApplicantDetails_1.presentAddressInformation.districtName,
                    pinCode: coApplicantDetails_1.presentAddressInformation.pinCode,
                  }
                : {},
                localAddress: coApplicantDetails_1?.presentAddressInformation
                ? {
                    addressLine1: coApplicantDetails_1.presentAddressInformation.AddressAsPerAdhar,
                    addressLine2: coApplicantDetails_1.presentAddressInformation.addressLine2,
                    city: coApplicantDetails_1.presentAddressInformation.city,
                    state: coApplicantDetails_1.presentAddressInformation.state,
                    district: coApplicantDetails_1.presentAddressInformation.districtName,
                    pinCode: coApplicantDetails_1.presentAddressInformation.pinCode,
                  }
                : {},
              kycUpload: {
                aadharFrontImage: coApplicantDetails_1?.kycUpload?.aadharFrontImage || "",
                aadharBackImage: coApplicantDetails_1?.kycUpload?.aadharBackImage || "",
                docImage: coApplicantDetails_1?.kycUpload?.docImage || "",
              },
            },
          },
          { new: true }
        );
  
        // **Update creditPdModel at the same index**
        const creditPdData = await creditPdModel.findOne({ customerId });
  
        // if (!creditPdData || !Array.isArray(creditPdData.co_Applicant) || selectedIndex >= creditPdData.co_Applicant.length) {
        //   return notFound(res , "Invalid index in credit PD model." );
        // }
        let coApplicantArray = creditPdData?.co_Applicant ? [...creditPdData.co_Applicant] : [];
        coApplicantArray[selectedIndex] = {
          coApplcantId: _id,
          coApplicantType: coApplicantDetails_1?.ApplicantType,
          businessType: coApplicantDetails_1?.bussinessType,
          nationality: coApplicantDetails_1?.nationality,
          caste: coApplicantDetails_1?.caste,
          category: coApplicantDetails_1?.category,
          maritalStatus: coApplicantDetails_1?.maritalStatus,
          noOfyearsAtCurrentAddress: coApplicantDetails_1?.presentAddressInformation?.noOfyearsAtCurrentAddress,
          houseLandMark: coApplicantDetails_1?.presentAddressInformation?.landmark,
          alternateMobileNo: coApplicantDetails_1?.contactInformation?.mobileNoTwo,
          residenceType: coApplicantDetails_1?.presentAddressInformation?.residenceType,
          occupation: coApplicantDetails_1?.occupation,
        };
        if (creditPdData) {
          await creditPdModel.updateOne({ customerId }, { $set: { co_Applicant: coApplicantArray } });
        } else {
          await creditPdModel.create({ customerId, co_Applicant: coApplicantArray });
        }      
  
        await processModel.findOneAndUpdate(
          {
            customerId,
            "fileStageForms.coApplicant.coApplicantId": _id 
          },
          {
            $set: {
              "fileStageForms.coApplicant.$.dealSummaryStatus": true 
            }
          },
          { new: true }
        );

         success(res , "Co-applicant updated successfully", {data: updateData});
       return  await finalApprovalSheet(customerId)
      } else {

        if (coApplicants.length >= 3) {
          return badRequest(res, "Not Allowed to Add More than 3 Co-Applicants");
      }
        // **2️⃣ CREATE LOGIC**: Create a new co-applicant and update the credit PD model
        const newCoApplicant = new coApplicantModel({
          customerId,
          employeId : customerDetails.employeId,
          aadharNo: coApplicantDetails_1?.kycDetails?.aadharNo,
          docType: coApplicantDetails_1?.kycDetails?.docType,
          docNo: coApplicantDetails_1?.kycDetails?.docNo,
          fullName: coApplicantDetails_1?.fullName,
          fatherName: coApplicantDetails_1?.fatherName,
          motherName: coApplicantDetails_1?.motherName,
          spouseName: coApplicantDetails_1?.spouseName,
          relationWithApplicant: coApplicantDetails_1?.relationWithApplicant,
          email: coApplicantDetails_1?.contactInformation?.email,
          dob: coApplicantDetails_1?.dob,
          age: coApplicantDetails_1?.age,
          category: coApplicantDetails_1?.category,
          caste: coApplicantDetails_1?.caste,
          gender: coApplicantDetails_1?.gender,
          maritalStatus: coApplicantDetails_1?.maritalStatus,
          education: coApplicantDetails_1?.educationDetails,
          religion: coApplicantDetails_1?.religion,
          mobileNo: coApplicantDetails_1?.contactInformation?.mobileNo,
          permanentAddress: coApplicantDetails_1?.presentAddressInformation
            ? {
                addressLine1: coApplicantDetails_1.presentAddressInformation.AddressAsPerAdhar,
                addressLine2: coApplicantDetails_1.presentAddressInformation.addressLine2,
                city: coApplicantDetails_1.presentAddressInformation.city,
                state: coApplicantDetails_1.presentAddressInformation.state,
                district: coApplicantDetails_1.presentAddressInformation.districtName,
                pinCode: coApplicantDetails_1.presentAddressInformation.pinCode,
              }
            : {},

            localAddress : coApplicantDetails_1?.presentAddressInformation ? {
              addressLine1: coApplicantDetails_1.presentAddressInformation.AddressAsPerAdhar,
              addressLine2: coApplicantDetails_1.presentAddressInformation.addressLine2,
              city: coApplicantDetails_1.presentAddressInformation.city,
              state: coApplicantDetails_1.presentAddressInformation.state,
              district: coApplicantDetails_1.presentAddressInformation.districtName,
              pinCode: coApplicantDetails_1.presentAddressInformation.pinCode,
            }:{},
          kycUpload: {
            aadharFrontImage: coApplicantDetails_1?.kycUpload?.aadharFrontImage || "",
            aadharBackImage: coApplicantDetails_1?.kycUpload?.aadharBackImage || "",
            docImage: coApplicantDetails_1?.kycUpload?.docImage || "",
          },
          formCompleteDate :  todayDate
        });
  
        await newCoApplicant.save();
  
        // **Check if creditPdModel exists; if not, create a new entry**
        let creditPdData = await creditPdModel.findOne({ customerId });
  
        if (!creditPdData) {
          creditPdData = new creditPdModel({
            customerId,
            co_Applicant: [],
          });
        }

        await processModel.findOneAndUpdate(
          { customerId },
          {
              coApplicantFormStart: true,
              coApplicantFormComplete: true,
              $push: {
                  'fileStageForms.coApplicant': {
                      coApplicantId: newCoApplicant._id,
                      status: true
                  }
              }
          },
          { new: true }
      );
  
        creditPdData.co_Applicant.push({
          coApplcantId:customerId._id,
          coApplicantType: coApplicantDetails_1?.ApplicantType,
          businessType: coApplicantDetails_1?.bussinessType,
          nationality: coApplicantDetails_1?.nationality,
          caste: coApplicantDetails_1?.caste,
          noOfyearsAtCurrentAddress: coApplicantDetails_1?.presentAddressInformation?.noOfyearsAtCurrentAddress,
          houseLandMark: coApplicantDetails_1?.presentAddressInformation?.landmark,
          alternateMobileNo: coApplicantDetails_1?.contactInformation?.mobileNoTwo,
          residenceType: coApplicantDetails_1?.presentAddressInformation?.residenceType,
          occupation: coApplicantDetails_1?.occupation,
        });

       const newcooApplicant =  await creditPdData.save();

       const processDetails = await processModel.findOneAndUpdate(
        {
          customerId,
          "fileStageForms.coApplicant.coApplicantId": null, 
        },
        {
          $set: {
            "fileStageForms.coApplicant.$.coApplicantId": newCoApplicant._id, 
            "fileStageForms.coApplicant.$.dealSummaryStatus": true, 
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
                coApplicantId: newCoApplicant._id,
                status: true,
              },
            },
          },
          { new: true }
        );
      
      }
      
         success(res , "New co-applicant added successfully",{  data: newCoApplicant});
       return  await finalApprovalSheet(customerId)
      }
    } catch (error) {
      console.error(error);
    return unknownError(res, error);
    }
  };
  


module.exports = {
  updateCustomerDetails,
  updateCustomerApplicantDetail,
  updateGuarantorDetails,
  customerUpdateReferenceDetail,
  riskReportPd,
  approverpropertyDetailsForm,
  technicalVendorFormSubmit,
  technicalVendorGetForm,
  financeDetailsForm,
  dealDSummary,
  updateCustomerCoApplicantDetail,
  updateCustomerCoApplicantDetailtwo,
  updateProfile,
  finacialDetails,
  updateChargeDetails,
  uploadStempDocuments,
  updatePostDisbustment,
  updateDisbursementApplicant,
  updateDisbursementGuarantor,
  deleteStempDocuments,
  pincodedelete,
  fetchPincodeData,
  updateCoApplianMultiple
};
