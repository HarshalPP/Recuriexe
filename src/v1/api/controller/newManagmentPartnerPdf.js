const {
    success,
    unknownError,
    serverValidation,
    badRequest,
    notFound,
    parseJwt,
    badRequestwitherror
} = require("../../../../globalHelper/response.globalHelper");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const moment = require("moment-timezone");
const { PDFDocument } = require("pdf-lib");
const employeModel = require("../model/adminMaster/employe.model.js");
const coApplicantModel = require("../model/co-Applicant.model");
const applicantModel = require("../model/applicant.model.js");
const guarantorModel = require("../model/guarantorDetail.model");
const referenceModel = require("../model/reference.model");
const customerModel = require("../model/customer.model");
const bankAccountModel = require("../model/banking.model");
const vendorModel = require("../model/adminMaster/vendor.model.js")
const vendorTypeModel = require("../model/adminMaster/vendorType.model.js")
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
const lendersModel = require("../model/lender.model.js");
const finalModel = require("../model/finalSanction/finalSnction.model.js");
const SignKycModel = require("../model/branchPendency/signkyc.model.js");
const lenderDocumentModel = require("../model/lenderDocument.model.js");
const sanctionPendencyModel = require("../model/finalApproval/sanctionPendency.model.js");
const newfinalSanctionModel = require("../model/finalSanction/finalSnction.model.js");
const internalLegalModel = require("../model/finalApproval/internalLegal.model.js");
const customerDocumentModel = require("../model/customerPropertyDetail.model.js");
const documentQueryModel = require("../model/finalApproval/documentQuery.model.js");
const decisionModel = require("../model/finalApproval/decision.model.js");
const guarantorStatementDetails = require("../model/branchPendency/gurrantorbankStatment.model.js");
const bankDeatilsKycs = require('../model/branchPendency/bankStatementKyc.model');

// const finalScantionModel = require("../model/fileProcess/finalSanction.model");
const queryFormModel = require("../model/queryForm.model.js");
const { sendEmail } = require("../controller/functions.Controller.js");
const uploadToSpaces = require('../services/spaces.service');

const { mailSendPartnerToSanction } = require('../controller/MailFunction/finalApprovalMail.js')

const { sendEmailByVendor } = require("./functions.Controller.js")
const {
    sectionLatter,
} = require("../controller/newRatnaafin/sectionLatter.controller.js");
const {
    applicantLatter,
} = require("../controller/newRatnaafin/newApplicant.controller.js");

const {
    LdAndPdDeed,
} = require("../controller/newRatnaafin/loanDocument.controller.js");


const {
    rcplLoanAgreement,
} = require("../controller/newGrowMoneyPdf/rcplLoanAggrement.js");

const {
    legalPdf,
} = require("../controller/newLegalTechnicalPdfs/legal.controller.js");
const {
    finallegalPdf,
} = require("../controller/newLegalTechnicalPdfs/finalLegal.controller.js");
const {
    vettingPdf,
} = require("../controller/newLegalTechnicalPdfs/vetting.controller.js");
const {
    sevenPagerpdf,
} = require("../controller/newLegalTechnicalPdfs/SevenPagerLegal.controller.js");
const {
    sevenPagervettingPdf,
} = require("../controller/newLegalTechnicalPdfs/sevenPagerVetting.controller.js");
const {
    BtsevenPagerLegalpdf,
} = require("../controller/newLegalTechnicalPdfs/btSevenPagerLegal.controller.js");
const {
    bt7PagervettingPdf,
} = require("../controller/newLegalTechnicalPdfs/bt7pagerVetting.controller.js");
const {
    executedvettingPdf,
} = require("../controller/newLegalTechnicalPdfs/executedVetting.controller.js");
const {
    executedfinallegalPdf,
} = require("../controller/newLegalTechnicalPdfs/executedFinalLegal.controller.js");
const {
    btexecutedvettingPdf,
} = require("../controller/newLegalTechnicalPdfs/btexecutedVetting.controller.js");
const {
    btexecutedfinallegalPdf,
} = require("../controller/newLegalTechnicalPdfs/btexecutedFinalLegal.controller.js");

const {
    namDevApplicantLatter,
} = require("../controller/newNaamDevPdfs/nammDevApplicantLatter.controller.js");

const {
    namdevSectionLatter,
} = require("../controller/newNaamDevPdfs/naamdevSectionLatter.controller.js");




const { uploadZip } = require("../controller/adminMaster/server.controller.js");
const btDetailsModel = require("../model/finalApproval/btBankDetail.model");



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
} = require("../controller/newGrowMoneyPdf/pdDeed.contorller.js");
const {
    growSanctionLetterPdf,
} = require("../controller/newGrowMoneyPdf/sanctionLetter.controller.js");
const {
    growApplicantPdf,
} = require("../controller/newGrowMoneyPdf/aplication.controller.js");

const { FincooperPgDeedPdf,} = require("../controller/newFinCoopersPdf/pdDeed.contorller.js");
const { newFincooperApplicantionPdf} = require("./newFinCoopersPdf/aplication.controller.js");
const { FincooperLoanAgreement,} = require("../controller/newFinCoopersPdf/finLoanAggrement.controller.js");
const { FincooperSanctionLetterPdf,} = require("../controller/newFinCoopersPdf/sanctionLetter.controller.js");



const { google } = require("googleapis");
const credentials = require("../../../../liveSheet.json");
const loanDocumentModel = require("../model/finalApproval/allDocument.model.js");
const lenderModel = require("../model/lender.model.js");
const ExcelJS = require("exceljs");
// const {finalApprovalSheet} = require("../controller/googleSheet.controller.js");
require('dotenv').config();

const { finalApprovalSheet, fileProcessSheet } = require("../controller/finalSanction/faGoogleSheet.controller.js");


const newSendToPartner = async (req, res) => {
    try {
        // const { customerId } = req.query;
        const customerId = req.query.customerId?.trim();




        const partnerData = await finalModel.findOne({ customerId });
        //bankStatementModel

        const applicant = await applicantModel.findOne({ customerId });
        const coapplicant = await coApplicantModel.findOne({ customerId });
        const secondRecord = await coApplicantModel.findOne({ customerId }).sort({ createdAt: 1 }).skip(1);

        const cibilData = await cibilModel.findOne({ customerId });
        const customerDetails = await customerModel.findById({ _id: (customerId) });

        const technicalData = await technicalApproveFormModel.findOne({ customerId });

        const pdformdatasDetail = await creditPdModel.findOne({ customerId });

        console.log(secondRecord, "secondRecord")
        const gauranter = await guarantorModel.findOne({ customerId });

        const bankData = await bankStatementModel.findOne({ customerId });
        //disbursementModel
        const kfsData = await disbursementModel.findOne({ customerId });
        //sanctionPendencyModel
        const sanctionPendencyData = await sanctionPendencyModel.findOne({ customerId });

        const branchUdhyam = await udyamModel.findOne({ customerId });



        if (!partnerData) {
            return badRequest(res, "partner's is required.");
        }

        const partnerModel = await lendersModel.findOne({
            _id: partnerData.partnerId,
        });
        if (!partnerModel) {
            return badRequest(res, "Partner not found.");
        }

        const normalizedPartnerName = (partnerModel.fullName || "")
            .trim()
            .toLowerCase();

        //       console.log("Customer ID:", customerId);
        // console.log("Partner Data:", partnerData);
        // console.log("Partner Model:", partnerModel);
        console.log("Normalized Partner Name:", normalizedPartnerName);

        if (normalizedPartnerName === "ratnaafin capital pvt ltd") {
            let selectionData = partnerData?.pdfSelection || "acg";
            if (!selectionData || typeof selectionData !== "string") {
                selectionData;
            }

            const sectionData = await sectionLatter(customerId);
            if (!sectionData) {
                return badRequest(res, "sectionData not found.");
            }
            const applicantData = await applicantLatter(customerId, selectionData);
            if (!applicantData) {
                return badRequest(res, "applicantData not found.");
            }
            const LdAndPdDeedData = await LdAndPdDeed(customerId, selectionData);
            if (!LdAndPdDeedData) {
                return badRequest(res, "LdAndPdDeedData not found.");
            }

            // const uploadUrl = `${process.env.BASE_URL}v1/formData/ImageUpload`;

            // const processFile = async (filePath) => {
            //   const resolvedPath = path
            //     .resolve(__dirname, `../../../..${filePath}`)
            //     .replace(/\\/g, "/");
            //   const formData = new FormData();
            //   formData.append("image", fs.createReadStream(resolvedPath));
            //   const response = await axios.post(uploadUrl, formData, {
            //     headers: { ...formData.getHeaders() },
            //   });
            //   return response.data?.items;
            // };

            // const uploadedSectionUrl = await processFile(sectionData);
            // const uploadedApplicantUrl = await processFile(applicantData);
            // const uploadedLdAndPdDeedUrl = await processFile(LdAndPdDeedData);

            // const ratnaPdfUrls = {
            //   sectionLatter: `${process.env.BASE_URL}${uploadedSectionUrl.image}`,
            //   LdAndPdDeed: `${process.env.BASE_URL}${uploadedLdAndPdDeedUrl.image}`,
            //   applicantionLatter: `${process.env.BASE_URL}${uploadedApplicantUrl.image}`,
            // };

            // // Save the URLs to the customer model
            // await newfinalSanctionModel.findOneAndUpdate(
            //   { customerId },
            //   { $set: { ratnaPdfUrls: ratnaPdfUrls } },
            //   { new: true, upsert: true }
            // );

            return success(res, "pdf urls are", {
                ...sectionData,
                ...LdAndPdDeedData,
                ...applicantData,
            });
        } else if (normalizedPartnerName === "fin coopers capital pvt ltd") {
            let selectionData = partnerData?.pdfSelection || "acg";
            if (!selectionData || typeof selectionData !== "string") {
              selectionData = selectionData.toLowerCase();
            }

            selectData = selectionData.toLowerCase();


            console.log(selectData, "selectionDataselectionData")
            const partnerLogo = FinpdfLogo;
            partnerName = partnerModel.fullName
            console.log(partnerName, "partnerName")

            const sectionData = await FincooperSanctionLetterPdf(customerId, partnerLogo, partnerName);
            if (!sectionData) {
                return badRequest(res, "sectionData not found.");
            }
            const applicantData = await newFincooperApplicantionPdf(customerId, partnerLogo, partnerName);
            if (!applicantData) {
                return badRequest(res, "applicantData not found.");
            }
            const LdAndPdDeedData = await FincooperLoanAgreement(customerId, partnerLogo, partnerName, selectionData,);
            if (!LdAndPdDeedData) {
                return badRequest(res, "LdAndPdDeedData not found.");
            }
            // const PdDeedData = await FincooperPgDeedPdf(customerId, partnerLogo, partnerName);
            // if (!PdDeedData) {
            //     return badRequest(res, "LdAndPdDeedData not found.");
            // }

            let PdDeedData = {};
            if (selectData === "accg" || selectData === "acg") {
                PdDeedData = await FincooperPgDeedPdf(customerId, partnerLogo, partnerName);
                if (!PdDeedData) return badRequest(res, "PG Deed PDF generation failed.");
            }
            // const pdfFunctions = {
            //   growSanctionLetterPdf,
            //   growApplicantPdf,
            //   growPgDeedPdf,
            //   rcplLoanAgreement,
            // };

            // const pdfData = {};
            // for (const [key, func] of Object.entries(pdfFunctions)) {
            //   const pdfResult = await func(
            //     customerId,
            //     partnerLogo,
            //     partnerModel.fullName,
            //     selectionData
            //   );
            //   pdfData[key] = pdfResult;
            // }

            // const uploadUrl = `${process.env.BASE_URL}v1/formData/ImageUpload`;

            // const processFile = async (filePath) => {
            //   const resolvedPath = path
            //     .resolve(__dirname, `../../../..${filePath}`)
            //     .replace(/\\/g, "/");
            //   const formData = new FormData();
            //   formData.append("image", fs.createReadStream(resolvedPath));
            //   const response = await axios.post(uploadUrl, formData, {
            //     headers: { ...formData.getHeaders() },
            //   });
            //   return response.data?.items;
            // };

            // const uploadedUrls = {};
            // for (const [key, data] of Object.entries(pdfData)) {
            //   const uploadedUrl = await processFile(data);
            //   uploadedUrls[key] = `${process.env.BASE_URL}${uploadedUrl.image}`;
            // }

            // // Save the URLs to the customer model
            // await newfinalSanctionModel.findOneAndUpdate(
            //   { customerId },
            //   { $set: { growMoneyPdfUrls: uploadedUrls } },
            //   { new: true, upsert: true }
            // );

            return success(res, "pdf urls are", {
                ...applicantData,
                ...sectionData,
                ...LdAndPdDeedData,
                ...PdDeedData
            });
        } else if (normalizedPartnerName === "grow money capital pvt ltd") {
            let selectionData = partnerData?.pdfSelection || "acg";
            if (!selectionData || typeof selectionData !== "string") {
           selectionData = selectionData.toLowerCase();
            }

            selectData = selectionData.toLowerCase();


            console.log(selectData, "selectionDataselectionData")

            console.log(selectionData, "selectionDataselectionData")

            const partnerLogo = growPdfLogo;
            partnerName = partnerModel?.fullName
            console.log(partnerName, "partnerName")

            const sectionData = await growSanctionLetterPdf(customerId, partnerLogo, partnerName);
            if (!sectionData) {
                return badRequest(res, "sectionData not found.");
            }
            const applicantData = await growApplicantPdf(customerId, partnerLogo, partnerName);
            if (!applicantData) {
                return badRequest(res, "applicantData not found.");
            }

            const LdAndPdDeedData = await rcplLoanAgreement(customerId, partnerLogo, partnerName, selectionData,);
            if (!LdAndPdDeedData) {
                return badRequest(res, "LdAndPdDeedData not found.");
            }

            let PdDeedData = {};
        if (selectData === "accg" || selectData === "acg") {
            PdDeedData = await growPgDeedPdf(customerId, partnerLogo, partnerName);
            if (!PdDeedData) return badRequest(res, "PG Deed PDF generation failed.");
        }
          //   if(selectionData==="accg"||selectionData==="acg"){
            
          //   const PdDeedData = await growPgDeedPdf(customerId, partnerLogo, partnerName);
          //   if (!PdDeedData) {
          //       return badRequest(res, "LdAndPdDeedData not found.");
          //   }

          // }

            // const pdfFunctions = {
            //   growSanctionLetterPdf,
            //   growApplicantPdf,
            //   growPgDeedPdf,
            //   rcplLoanAgreement,
            // };

            // const pdfData = {};
            // for (const [key, func] of Object.entries(pdfFunctions)) {
            //   const pdfResult = await func(
            //     customerId,
            //     partnerLogo,
            //     partnerModel.fullName,
            //     selectionData
            //   );
            //   pdfData[key] = pdfResult;
            // }

            // const uploadUrl = `${process.env.BASE_URL}v1/formData/ImageUpload`;

            // const processFile = async (filePath) => {
            //   const resolvedPath = path
            //     .resolve(__dirname, `../../../..${filePath}`)
            //     .replace(/\\/g, "/");
            //   const formData = new FormData();
            //   formData.append("image", fs.createReadStream(resolvedPath));
            //   const response = await axios.post(uploadUrl, formData, {
            //     headers: { ...formData.getHeaders() },
            //   });
            //   return response.data?.items;
            // };

            // const uploadedUrls = {};
            // for (const [key, data] of Object.entries(pdfData)) {
            //   const uploadedUrl = await processFile(data);
            //   uploadedUrls[key] = `${process.env.BASE_URL}${uploadedUrl.image}`;
            // }

            // // Save the URLs to the customer model
            // await newfinalSanctionModel.findOneAndUpdate(
            //   { customerId },
            //   { $set: { growMoneyPdfUrls: uploadedUrls } },
            //   { new: true, upsert: true }
            // );

            return success(res, "pdf urls are", {
                ...applicantData,
                ...sectionData,
                ...LdAndPdDeedData,
                ...PdDeedData
            });
        } else if (normalizedPartnerName === "namdev finvest pvt ltd") {
            let selectionData = partnerData?.pdfSelection || "acg";
            if (!selectionData || typeof selectionData !== "string") {
                selectionData;
            }

            selectData = selectionData.toLowerCase();


            console.log(selectData, "selectionDataselectionData")

            // Fetch section letter, applicant letter, and LD/PD deed
            const sectionData = await namdevSectionLatter(customerId);
            if (!sectionData) {
                return badRequest(res, "Section Data not found.");
            }
            const applicantData = await namDevApplicantLatter(
                customerId,
                selectionData
            );
            if (!applicantData) {
                return badRequest(res, "Applicant Data not found.");
            }
            

            // const namdevpdfUrls={
            //   sectionData,
            //   applicantData ,
            // }
            // console.log(namdevpdfUrls,"namdevpdfUrls")
            // const updatedDocument = await newfinalSanctionModel.findOneAndUpdate(
            //   { customerId },
            //   { $set: { "naamDevPdfUrls.sectionData": sectionData, "naamDevPdfUrls.applicantData": applicantData } },        { new: true, upsert: true }
            // );

            // if (!updatedDocument) {
            //   return badRequest(res, "Failed to update Namdev PDF URLs.");
            // }

            // console.log(updatedDocument, "Updated Document");


            return success(res, "PDF URLs are", {
                ...sectionData,
                // ...loanData,
                ...applicantData,
            });
        } else {
            return badRequest(res, `Unsupported partner: ${partnerModel.fullName}`);
        }
    } catch (error) {
        console.error(error);
        return unknownError(res, error);
    }
};



const newAllLegalPdfs = async (req, res) => {
  try {
    // let { customerId,loanType,propertyType,LegalType } = req.body;

    const {
      customerId
      // loanType,
      // LegalType,
      // propertyType
      // propertyPaperType,
      // selectedBuyer,
      // selectedSeller,
      // btBankName,
      // propertyOwnerName,
      // propertyOwnerFatherName,
      // tableRows,
      // newLegalLink,
      // finalLegalLink,
      // vettingReportLink,
      // sellerFatherName,
      // sealandSignedBy,
    } = req.body;

    // Fetch the existing record
    const existingData = await internalLegalModel.findOne({ customerId });

    // Construct updated data dynamically
    // const legalData = {
    //   sellerFatherName:
    //     sellerFatherName || existingData?.sellerFatherName || null,
    //   // SealandSignedBy: sealandSignedBy|| existingData?.SealandSignedBy?.signedBy || null,
    //   LoanType: loanType || existingData?.LoanType || null,
    //   LegalType: LegalType || existingData?.LegalType || null,
    //   propertyPaperType:
    //     propertyPaperType || existingData?.propertyPaperType || null,
    //   buyerName: selectedBuyer || existingData?.buyerName || null,
    //   sellerName: selectedSeller || existingData?.sellerName || null,
    //   BT_BANK_NAME: btBankName || existingData?.BT_BANK_NAME || null,
    //   PropertyOwnerName:
    //     propertyOwnerName || existingData?.PropertyOwnerName || null,
    //   PropertyOwnerFatherName:
    //     propertyOwnerFatherName ||
    //     existingData?.PropertyOwnerFatherName ||
    //     null,
    //   // pramanPatra: {
    //   //   no:
    //   //     tableRows?.find((row) => row.particular === "PRAMAN PATRA")?.number ||
    //   //     existingData?.pramanPatra?.no ||
    //   //     null,
    //   //   date:
    //   //     tableRows?.find((row) => row.particular === "PRAMAN PATRA")?.date ||
    //   //     existingData?.pramanPatra?.date ||
    //   //     null,
    //   // },
    //   // taxReceipt: {
    //   //   no:
    //   //     tableRows?.find((row) => row.particular === "TAX RECEIPT")?.number ||
    //   //     existingData?.taxReceipt?.no ||
    //   //     null,
    //   //   date:
    //   //     tableRows?.find((row) => row.particular === "TAX RECEIPT")?.date ||
    //   //     existingData?.taxReceipt?.date ||
    //   //     null,
    //   // },
    //   // co_ownership_deed: {
    //   //   no:
    //   //     tableRows?.find((row) => row.particular === "CO-OWNERSHIP DEED")
    //   //       ?.number ||
    //   //     existingData?.co_ownership_deed?.no ||
    //   //     null,
    //   //   date:
    //   //     tableRows?.find((row) => row.particular === "CO-OWNERSHIP DEED")
    //   //       ?.date ||
    //   //     existingData?.co_ownership_deed?.date ||
    //   //     null,
    //   // },
    //   // EM_DEED: {
    //   //   no:
    //   //     tableRows?.find((row) => row.particular === "EM DEED")?.number ||
    //   //     existingData?.EM_DEED?.no ||
    //   //     null,
    //   //   date:
    //   //     tableRows?.find((row) => row.particular === "EM DEED")?.date ||
    //   //     existingData?.EM_DEED?.date ||
    //   //     null,
    //   // },
    //   // gramPanchayat: {
    //   //   no:
    //   //     tableRows?.find((row) => row.particular === "GRAM PANCHAYAT PATTA")
    //   //       ?.number ||
    //   //     existingData?.gramPanchayat?.no ||
    //   //     null,
    //   //   date:
    //   //     tableRows?.find((row) => row.particular === "GRAM PANCHAYAT PATTA")
    //   //       ?.date ||
    //   //     existingData?.gramPanchayat?.date ||
    //   //     null,
    //   // },
    //   // Noc_certificate: {
    //   //   no:
    //   //     tableRows?.find((row) => row.particular === "NOC CERTIFICATE")
    //   //       ?.number ||
    //   //     existingData?.Noc_certificate?.no ||
    //   //     null,
    //   //   date:
    //   //     tableRows?.find((row) => row.particular === "NOC CERTIFICATE")
    //   //       ?.date ||
    //   //     existingData?.Noc_certificate?.date ||
    //   //     null,
    //   // },
    //   // Buliding_Permission_Certificate: {
    //   //   no:
    //   //     tableRows?.find(
    //   //       (row) => row.particular === "BUILDING PERMISSION CERTIFICATE"
    //   //     )?.number ||
    //   //     existingData?.Buliding_Permission_Certificate?.no ||
    //   //     null,
    //   //   date:
    //   //     tableRows?.find(
    //   //       (row) => row.particular === "BUILDING PERMISSION CERTIFICATE"
    //   //     )?.date ||
    //   //     existingData?.Buliding_Permission_Certificate?.date ||
    //   //     null,
    //   // },
    //   // Mutation_Certificate: {
    //   //   no:
    //   //     tableRows?.find((row) => row.particular === "MUTATION CERTIFICATE")
    //   //       ?.number ||
    //   //     existingData?.Mutation_Certificate?.no ||
    //   //     null,
    //   //   date:
    //   //     tableRows?.find((row) => row.particular === "MUTATION CERTIFICATE")
    //   //       ?.date ||
    //   //     existingData?.Mutation_Certificate?.date ||
    //   //     null,
    //   // },
    //   // Owner_Certificate: {
    //   //   no:
    //   //     tableRows?.find((row) => row.particular === "OWNER CERTIFICATE")
    //   //       ?.number ||
    //   //     existingData?.Owner_Certificate?.no ||
    //   //     null,
    //   //   date:
    //   //     tableRows?.find((row) => row.particular === "OWNER CERTIFICATE")
    //   //       ?.date ||
    //   //     existingData?.Owner_Certificate?.date ||
    //   //     null,
    //   // },
    //   // Property_Tax_Reciept: {
    //   //   no:
    //   //     tableRows?.find((row) => row.particular === "PROPERTY TAX RECEIPT")
    //   //       ?.number ||
    //   //     existingData?.Property_Tax_Reciept?.no ||
    //   //     null,
    //   //   date:
    //   //     tableRows?.find((row) => row.particular === "PROPERTY TAX RECEIPT")
    //   //       ?.date ||
    //   //     existingData?.Property_Tax_Reciept?.date ||
    //   //     null,
    //   // },
    //   RM_DEED: {
    //     no:
    //       tableRows?.find((row) => row.particular === "RM DEED")?.number ||
    //       existingData?.RM_DEED?.no ||
    //       null,
    //     date:
    //       tableRows?.find((row) => row.particular === "RM DEED")?.date ||
    //       existingData?.RM_DEED?.date ||
    //       null,
    //   },
    //   Generate_new_legal_link:
    //     newLegalLink || existingData?.Generate_new_legal_link || null,
    //   Generate_final_legal_link:
    //     finalLegalLink || existingData?.Generate_final_legal_link || null,
    //   Generate_vetting_Report_link:
    //     vettingReportLink || existingData?.Generate_vetting_Report_link || null,
    // };

    // if (!legalData.SealandSignedBy) {
    //   legalData.SealandSignedBy = {
    //     no: null,
    //     date: null,
    //     signedBy: null,
    //     file: null
    //   };
    // }
    // legalData.SealandSignedBy.signedBy = sealandSignedBy || existingData?.SealandSignedBy?.signedBy || null;
    // Save data to the database
  //   const savedLegalData = await internalLegalModel.findOneAndUpdate(
  //     { customerId }, // Query condition
  //     legalData, // Data to update or insert
  //     { upsert: true, new: false } // Options
  //   );

  //   const fileStageForms = await processModel.findOneAndUpdate(
  //     { customerId: req.body.customerId },  
  //     { $set: { 'fileStageForms.internalLegal': true } },
  //     { new: true }  
  // );
    // if (!savedLegalData) {
    //   return res
    //     .status(400)
    //     .json({ message: "Failed to save data to the database." });
    // }

    const loanType =existingData?.LoanType;

    const propertyType =existingData?.propertyPaperType;
 
   const  LegalType = existingData?.LegalType;

    if (
      loanType === "NEW" &&
      propertyType === "newCoownership" &&
      LegalType === "NewLegal"
    ) {
      const sectionData = await legalPdf(customerId);

      // const uploadUrl = `${process.env.BASE_URL}v1/formData/ImageUpload`;

      // const processFile = async (filePath) => {
      //   let resolvedPath = path
      //     .resolve(__dirname, `../../../..${filePath}`)
      //     .replace(/\\/g, "/");
      //   const formData = new FormData();
      //   formData.append("image", fs.createReadStream(resolvedPath));
      //   const response = await axios.post(uploadUrl, formData, {
      //     headers: { ...formData.getHeaders() },
      //   });
      //   return response.data?.items;
      // };

      // const uploadedincomeSectionUrl = await processFile(sectionData);

      // const legalPdfUrl = `${process.env.BASE_URL}${uploadedincomeSectionUrl.image}`;

      // Update the database
      // await internalLegalModel.findOneAndUpdate(
      //   { customerId }, // Query to find the specific customer document
      //   {
      //     Generate_new_legal: "true",
      //     Generate_new_legal_link: legalPdfUrl,
      //   },
      //   { new: true, upsert: false } // Options: Return the updated document, don't create a new one
      // );

      return success(res, "PDF generated  successfully.",sectionData); 
      //   {
      //   legalPdf: legalPdfUrl,
      // });
    } else if (
      loanType === "NEW" &&
      propertyType === "newCoownership" &&
      LegalType === "FinalLegal"
    ) {
      const sectionData = await finallegalPdf(customerId);

     


     

      return success(res, "pdf generated successfully.",sectionData);
      //    {
      //   finalLegalPdf: finalLegalPdfUrl,
      // });
    } else if (
      loanType === "NEW" &&
      propertyType === "newCoownership" &&
      LegalType === "Vetting"
    ) {
      const sectionData = await vettingPdf(customerId);

    
      return success(res, "pdf generated successfully.",sectionData);
      //    {
      //   vettingPdf: vettingPdfUrl,
      // });
    } else if (
      loanType === "NEW" &&
      propertyType === "7PagerPatta" &&
      LegalType === "FinalLegal"
    ) {
      const sectionData = await sevenPagerpdf(customerId);

    
      return success(res, "pdf generated successfully.",sectionData)
      //  {
      //   SevenPagerLegalPdf: SevenPagerLegalPdfUrl,
      // });
    } else if (
      loanType === "NEW" &&
      propertyType === "7PagerPatta" &&
      LegalType === "Vetting"
    ) {
      const sectionData = await sevenPagervettingPdf(customerId);

      return success(res, "pdf generated successfully.",sectionData)
      //  {
      //   sevenPagervettingPdf: sevenPagervettingPdfUrl,
      // });
    } else if (
      loanType === "BT" &&
      propertyType === "7PagerPatta" &&
      LegalType === "FinalLegal"
    ) {
      const sectionData = await BtsevenPagerLegalpdf(customerId);

      

      

      return success(res, "pdf generated successfully.",sectionData)
      //  {
      //   BtsevenPagerLegalpdf: BtSevenPagerLegalPdfUrl,
      // });
    } else if (
      loanType === "BT" &&
      propertyType === "7PagerPatta" &&
      LegalType === "Vetting"
    ) {
      const sectionData = await bt7PagervettingPdf(customerId);

      

      
      return success(res, "pdf generated successfully.",sectionData);
      //  {
      //   bt7Pagervetting: BtsevenPagervettingPdfUrl,
      // });
    } else if (
      loanType === "NEW" &&
      propertyType === "executedCoownership" &&
      LegalType === "FinalLegal"
    ) {
      const sectionData = await executedfinallegalPdf(customerId);

     

      return success(res, "pdf generated successfully.",sectionData)
      //   {
      //   newexecutedfinallegal: newexecutedfinallegalUrl,
      // });
    } else if (
      loanType === "NEW" &&
      propertyType === "executedCoownership" &&
      LegalType === "Vetting"
    ) {
      const sectionData = await executedvettingPdf(customerId);

      

      return success(res, "pdf generated successfully.",sectionData)
      //    {
      //   newexecutedvetting: newexecutedvettingUrl,
      // });
    } else if (
      loanType === "BT" &&
      propertyType === "executedCoownership" &&
      LegalType === "FinalLegal"
    ) {
      const sectionData = await btexecutedfinallegalPdf(customerId);

      
       

      

      return success(res, "pdf generated successfully.",sectionData)
      //  {
      //   btexecutedfinallegal: BtwexecutedfinallegalUrl, 
      // });
    } else if (
      loanType === "BT" &&
      propertyType === "executedCoownership" &&
      LegalType === "Vetting"
    ) {
      const sectionData = await btexecutedvettingPdf(customerId);

      
        

      return success(res, "pdf generated successfully.",sectionData)
      //  {
      //   btexecutedvetting: BtexecutedvettingUrl,
      // });
    }
    // construction 
    else if (
      loanType === "CONSTRUCTION" &&
      propertyType === "newCoownership" &&
      LegalType === "NewLegal"
    ) {
      const sectionData = await legalPdf(customerId);

      // const uploadUrl = `${process.env.BASE_URL}v1/formData/ImageUpload`;

      // const processFile = async (filePath) => {
      //   let resolvedPath = path
      //     .resolve(__dirname, `../../../..${filePath}`)
      //     .replace(/\\/g, "/");
      //   const formData = new FormData();
      //   formData.append("image", fs.createReadStream(resolvedPath));
      //   const response = await axios.post(uploadUrl, formData, {
      //     headers: { ...formData.getHeaders() },
      //   });
      //   return response.data?.items;
      // };

      // const uploadedincomeSectionUrl = await processFile(sectionData);

      // const legalPdfUrl = `${process.env.BASE_URL}${uploadedincomeSectionUrl.image}`;

      // Update the database
      // await internalLegalModel.findOneAndUpdate(
      //   { customerId }, // Query to find the specific customer document
      //   {
      //     Generate_new_legal: "true",
      //     Generate_new_legal_link: legalPdfUrl,
      //   },
      //   { new: true, upsert: false } // Options: Return the updated document, don't create a new one
      // );

      return success(res, "PDF generated  successfully.",sectionData); 
      //   {
      //   legalPdf: legalPdfUrl,
      // });
    } else if (
      loanType === "CONSTRUCTION" &&
      propertyType === "newCoownership" &&
      LegalType === "FinalLegal"
    ) {
      const sectionData = await finallegalPdf(customerId);

     


     

      return success(res, "pdf generated successfully.",sectionData);
      //    {
      //   finalLegalPdf: finalLegalPdfUrl,
      // });
    } else if (
      loanType === "CONSTRUCTION" &&
      propertyType === "newCoownership" &&
      LegalType === "Vetting"
    ) {
      const sectionData = await vettingPdf(customerId);

    
      return success(res, "pdf generated successfully.",sectionData);
      //    {
      //   vettingPdf: vettingPdfUrl,
      // });
    } else if (
      loanType === "CONSTRUCTION" &&
      propertyType === "7PagerPatta" &&
      LegalType === "FinalLegal"
    ) {
      const sectionData = await sevenPagerpdf(customerId);

    
      return success(res, "pdf generated successfully.",sectionData)
      //  {
      //   SevenPagerLegalPdf: SevenPagerLegalPdfUrl,
      // });
    } else if (
      loanType === "CONSTRUCTION" &&
      propertyType === "7PagerPatta" &&
      LegalType === "Vetting"
    ) {
      const sectionData = await sevenPagervettingPdf(customerId);

      return success(res, "pdf generated successfully.",sectionData)
      //  {
      //   sevenPagervettingPdf: sevenPagervettingPdfUrl,
      // });
    } else if (
      loanType === "CONSTRUCTION" &&
      propertyType === "executedCoownership" &&
      LegalType === "FinalLegal"
    ) {
      const sectionData = await executedfinallegalPdf(customerId);

     

      return success(res, "pdf generated successfully.",sectionData)
      //   {
      //   newexecutedfinallegal: newexecutedfinallegalUrl,
      // });
    } else if (
      loanType === "CONSTRUCTION" &&
      propertyType === "executedCoownership" &&
      LegalType === "Vetting"
    ) {
      const sectionData = await executedvettingPdf(customerId);

      

      return success(res, "pdf generated successfully.",sectionData)
      //    {
      //   newexecutedvetting: newexecutedvettingUrl,
      // });
    } 

    //--------------------------new top u--------------p

    //-----------------7pagerpatta bt top up --------------------
    else if (
      loanType === "BT-TOPUP" &&
      propertyType === "7PagerPatta" &&
      LegalType === "FinalLegal"
    ) {
      const sectionData = await BtsevenPagerLegalpdf(customerId);

      return success(res, "pdf generated successfully.",sectionData)
      //  {
      //   BtsevenPagerLegalpdf: BtSevenPagerLegalPdfUrl,
      // });
    } else if (
      loanType === "BT-TOPUP" &&
      propertyType === "7PagerPatta" &&
      LegalType === "Vetting"
    ) {
      const sectionData = await bt7PagervettingPdf(customerId);

      

      
      return success(res, "pdf generated successfully.",sectionData);
      //  {
      //   bt7Pagervetting: BtsevenPagervettingPdfUrl,
      // });
    } else if (
      loanType === "BT-TOPUP" &&
      propertyType === "executedCoownership" &&
      LegalType === "FinalLegal"
    ) {
      const sectionData = await btexecutedfinallegalPdf(customerId);

      
       

      

      return success(res, "pdf generated successfully.",sectionData)
      //  {
      //   btexecutedfinallegal: BtwexecutedfinallegalUrl, 
      // });
    } else if (
      loanType === "BT-TOPUP" &&
      propertyType === "executedCoownership" &&
      LegalType === "Vetting"
    ) {
      const sectionData = await btexecutedvettingPdf(customerId);

      
        

      return success(res, "pdf generated successfully.",sectionData)
      //  {
      //   btexecutedvetting: BtexecutedvettingUrl,
      // });
    }
    
     else {
      return badRequest(
        res,
        `Unsupported  legal types:please send correct types`
      );
    }
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
};



module.exports = { newSendToPartner  , newAllLegalPdfs}
