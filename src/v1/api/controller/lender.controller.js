const {
  success,
  unknownError,
  serverValidation,
  notFound,
  badRequest,
} = require("../../../../globalHelper/response.globalHelper");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const lenderModel = require("../model/lender.model");
const bcrypt = require("bcrypt");
const {
  createZipFromUrls,
} = require("../controller/imageUpload.controller.js");
const { uploadZip } = require("../controller/adminMaster/server.controller.js");
const lenderDocumentModel = require("../model/lenderDocument.model");
const { sendEmail } = require("../controller/functions.Controller.js");
const path = require("path");
const finalSnctionModel = require("../model/finalSanction/finalSnction.model.js");
const applicantModel = require("../model/applicant.model.js");
const { timeStamp } = require("console");
const { initESign } = require("../services/legality.services.js");
const finalModel = require("../model/finalSanction/finalSnction.model.js");
const appPdcModel = require("../model/branchPendency/appPdc.model.js");
const gtrPdcModel = require("../model/branchPendency/gtrPdc.model.js");
const guarantorStatementDetails = require("../model/branchPendency/gurrantorbankStatment.model.js");
const disbursementModel = require("../model/fileProcess/disbursement.model.js");
const sanctionPendencyModel = require("../model/finalApproval/sanctionPendency.model.js");
const {calculateAPR} = require("../helper/aprCalculator.helper.js")
const moment = require("moment-timezone");
const lenderProductModel = require('../model/lenderProduct.model.js')
const physicalFileCourierlenderModel = require('../model/physicalFileCourierlender.js')
// const {lenderGoogleSheet} = require('./masterGoogleSheet.controller')

// ------------------------ Add lender---------------------------------------

async function lenderAdd(req, res) {
  try {
    // Validate input fields
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const {
      fullName,
      email,
      phoneNumber,
      userName,
      password,
      corporateAddress,
      registerAddress,
      sanctionEmailTo,
      sanctionEmailCc,
      disbursementEmailTo,
      disbursementEmailCc,
      cinNo,
      gstNo,
      venders,
      addSanction,
      addDisbursement,
      commercial,
      charges,
      loginChecklist,
      sanctionChecklist,
      preDisbursementChecklist,
      postDisbursementChecklist,
      policy,
      partnerUniqueId,
      branchId,
      productId,
      employeeId,
      physicalFileSendTo,
      physicalFileAddress,
      nachMode,
      sopDetails,
      reportingDetails,
      shortName,
      sanctionLatterUrl,
      aggrementUrl,
      logoUrl,
      legalDetails,
      partnerProduct
    } = req.body;
    // console.log(req.body,"<><><>")
    const fileData = req.files;

    // Parse and validate `venders`
    // const parsedVenders = venders ? JSON.parse(venders) : [];
    // const validVenders = parsedVenders.map((vendorId) => {
    //   return new mongoose.Types.ObjectId.isValid(vendorId)
    //     ? new mongoose.Types.ObjectId(vendorId)
    //     : null;
    // }).filter(Boolean); // Remove invalid `ObjectId`s

    // Check for duplicate userName
    const existingLender = await lenderModel.findOne({ userName });
    if (existingLender) {
      return res.status(400).json({ message: "UserName already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(hashedPassword,"hashedPasswordhashedPasswordhashedPassword")
    // Prepare file paths for uploaded files
    const logoPath = fileData.logo
      ? `uploads/${fileData.logo[0].filename}`
      : "";
    const sanctionLatterPath = fileData.sanctionLatter
      ? `uploads/${fileData.sanctionLatter[0].filename}`
      : "";
    const aggrementPath = fileData.aggrement
      ? `uploads/${fileData.aggrement[0].filename}`
      : "";

    // Create a new lender
    const lenderDetail = new lenderModel({
      fullName,
      email,
      phoneNumber,
      userName,
      password: hashedPassword,
      corporateAddress,
      registerAddress,
      physicalFileSendTo,
      physicalFileAddress,
      nachMode,
      shortName,//partnerProduct
      partnerProduct: partnerProduct ? JSON.parse(partnerProduct) : [],
      legalDetails: legalDetails ? JSON.parse(legalDetails) : [],
      sopDetails: sopDetails ? JSON.parse(sopDetails) : [],
      sanctionEmailTo: sanctionEmailTo ? JSON.parse(sanctionEmailTo) : [],
      sanctionEmailCc: sanctionEmailCc ? JSON.parse(sanctionEmailCc) : [],
      disbursementEmailTo: disbursementEmailTo
        ? JSON.parse(disbursementEmailTo)
        : [],
      disbursementEmailCc: disbursementEmailCc
        ? JSON.parse(disbursementEmailCc)
        : [],
      cinNo,
      gstNo,
      venders: venders ? JSON.parse(venders) : [],
      addSanction: addSanction ? JSON.parse(addSanction) : [],
      addDisbursement: addDisbursement ? JSON.parse(addDisbursement) : [],
      commercial: commercial ? JSON.parse(commercial) : [],
      charges: charges ? JSON.parse(charges) : [],
      policy: policy ? JSON.parse(policy) : [],
      branchId: branchId ? JSON.parse(branchId) : [],
      productId: productId ? JSON.parse(productId) : [],//employeeId
      employeeId: employeeId ? JSON.parse(employeeId) : [],
      reportingDetails: reportingDetails ? JSON.parse(reportingDetails) : [],
      loginChecklist: loginChecklist
        ? (() => {
            try {
              return JSON.parse(loginChecklist);
            } catch (error) {
              console.error("Error parsing loginChecklist:", error);
              return {};
            }
          })()
        : {},
      sanctionChecklist: sanctionChecklist
        ? (() => {
            try {
              return JSON.parse(sanctionChecklist);
            } catch (error) {
              console.error("Error parsing sanctionChecklist:", error);
              return {};
            }
          })()
        : {},
      preDisbursementChecklist: preDisbursementChecklist
        ? (() => {
            try {
              return JSON.parse(preDisbursementChecklist);
            } catch (error) {
              console.error("Error parsing preDisbursementChecklist:", error);
              return {};
            }
          })()
        : {},
      postDisbursementChecklist: postDisbursementChecklist
        ? (() => {
            try {
              return JSON.parse(postDisbursementChecklist);
            } catch (error) {
              console.error("Error parsing postDisbursementChecklist:", error);
              return {};
            }
          })()
        : {},
      logo: logoUrl,
      sanctionLatter: sanctionLatterUrl,
      aggrement: aggrementUrl,
      partnerUniqueId,
      // sanctionLatter,
      // aggrement,
      // logo
    });

    // Save the lender to the database
    const lenderData = await lenderDetail.save();

    return res.status(200).json({
      message: "Lender added successfully",
      lender: lenderData,
    });
  } catch (error) {
    console.error("Error in lenderAdd:", error);
    return res.status(500).json({
      errorName: "unknownError",
      error: error.message,
    });
  }
}

// ------------------ Update lender ---------------------------------------
// async function lenderUpdate(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }
//     const { lenderId, ...updateFields } = req.body;
//     const lenderExist = await lenderModel.findById(lenderId);
//     if (!lenderExist) {
//       return badRequest(res, "lender Not Found");
//     }
//     let fieldsToProcess = ["fullName", "userName", "email"];
//     fieldsToProcess.forEach((field) => {
//       if (req.body[field]) {
//         updateFields[field] = req.body[field].toLowerCase().trim();
//       }
//     });
//     const updateData = await lenderModel.findByIdAndUpdate(
//       lenderId,
//       updateFields,
//       { new: true }
//     );
//     success(res, "Updated lender Detail", updateData);
//     // await lenderGoogleSheet(updateData)
//   } catch (error) {
//     console.log(error);
//     unknownError(res, error);
//   }
// }

// ------------------ Get lender detail---------------------------------------
async function lenderById(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const lenderDetail = await lenderModel
      .findById(req.params.lenderId)
      .populate("venders", "fullName");
    delete lenderDetail.password;
    success(res, "Get lender Detail", lenderDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

//  --------------- get lender details by partnerUniqueId And CustomerId ---------------------


const getLenderByPartnerUniqueIdAndCustomerId = async (req, res) => {
  try {
    const { partnerId, customerId } = req.query;

    if (!partnerId || !customerId) {
      return badRequest(res, "Partner ID and Customer ID are required");
    }

    // Find lender details
    const lenderDetail = await lenderModel
      .findOne({ _id: partnerId })
      .select("charges commercial ");
    // console.log(lenderDetail, "lenderDetail<><><><>");
    if (!lenderDetail) {
      return badRequest(res, "Lender not found");
    }

    // console.log("lenderDetail",lenderDetail)

    // Find disbursement details
    const disbursement = await finalModel
      .findOne({ customerId })
      .select("finalLoanAmount roi tenureInMonth");
    // console.log(disbursement, "disbursementdisbursement");
    if (!disbursement) {
      return badRequest(res, "Disbursement details not found");
    }

    const data = await disbursementModel.findOne({ customerId });

    // console.log("disbusment<<>><<>><<>>",data?.kfsDetails)

    const finalLoanAmount = parseFloat(disbursement.finalLoanAmount);
    if (isNaN(finalLoanAmount)) {
      return badRequest(res, "Invalid finalLoanAmount");
    }

    // Helper function to parse percentage strings
    const parsePercentage = (str) => {
      const match = str.match(/(\d+(\.\d+)?)%/);
      return match ? parseFloat(match[1]) / 100 : 0;
    };

    // Extract and parse processing fees and documentation charges
    const processingFeesStr =
      lenderDetail.charges.processingFeesInclusiveOfGst || "0%";
    const documentationChargesStr =
      lenderDetail.charges.documentationChargesInclusiveOfGst || "0%";
    const insuranceChargesStr =
      lenderDetail.charges.insurancePremiumInRs || "0";
    const cersaiChargesStr = lenderDetail.charges.cersaiChargesInRs || "0";
    const preEmiInterestStr = lenderDetail.charges.preEmiInterestInRs || "0";
    const annualPercentageRate =
      lenderDetail.charges.annualPercentageRate || "0";
    const benchmarkInterestRate =
      lenderDetail.charges.benchmarkIntrestRate || "0";
    const spreadInterestRate =
      Number(disbursement?.roi) -
        Number(lenderDetail?.charges?.benchmarkIntrestRate) || 0;
    const epiRate = Number(disbursement?.tenureInMonth) + 1;
    console.log(epiRate, "epiRateepiRateepiRate");
    const processingFeesRate = parsePercentage(processingFeesStr);
    const documentationChargesRate = parsePercentage(documentationChargesStr);
    const insuranceCharges = parseFloat(insuranceChargesStr);
    const cersaiCharges = parseFloat(cersaiChargesStr);
    const preEmiInterest = parseFloat(preEmiInterestStr);
    // const annualPercentageRatePercentage = parseFloat(annualPercentageRate);
    const benchmarkInterestRatePercentage = parseFloat(benchmarkInterestRate);
    const spreadInterestRatePercentage = parseFloat(spreadInterestRate).toFixed(2);

    // Calculate fees //
    const processingFees = finalLoanAmount * processingFeesRate;
    const documentationCharges = finalLoanAmount * documentationChargesRate;
    // const insuranceChargeswithFinal = (finalLoanAmount * insuranceCharges) / 100;
    //   const cersaiChargeswithFinal = (finalLoanAmount * cersaiCharges) / 100;
    //   const preEmiInterestwithFinal = (finalLoanAmount * preEmiInterest) / 100;
    //  const annualPercentageRateAprPercentageFinal = (finalLoanAmount * annualPercentageRatePercentage) / 100;
    //   const benchmarkInterestRatePercentageFinal = (finalLoanAmount * benchmarkInterestRatePercentage) / 100;
    //   const spreadInterestRatePercentageFinal = (finalLoanAmount * spreadInterestRatePercentage) / 100;

    // Assuming GST is 18%
    const GST_RATE = 0.18;
    // Add
    const processingFeesGST = processingFees * GST_RATE;
    const documentationChargesGST = documentationCharges * GST_RATE;
    
    // console.log(processingFeesGST,documentationChargesGST,"documentationChargesGSTdocumentationChargesGST")
    
    const totalProcessingFees = processingFees + processingFeesGST;
    const totalDocumentationCharges =
      documentationCharges + documentationChargesGST;
    // const totalInsuranceCharges = insuranceChargeswithFinal;
    // const totalCersaiCharges = cersaiChargeswithFinal;
    // const totalPreEmiInterest = preEmiInterestwithFinal;
    // const totalAnnualPercentageRate = annualPercentageRateAprPercentageFinal;
    // const totalBenchmarkInterestRate = benchmarkInterestRatePercentageFinal;
    // const totalSpreadInterestRate = spreadInterestRatePercentageFinal;

    //calculate epi in amount
    function calculateEMI(principal, annualRate, tenureMonths) {
      let monthlyRate = annualRate / 12 / 100; // Convert annual rate to monthly rate
      let emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
      return Math.round(emi); // Round to the nearest whole number
  }
  
  // Example Usage:
    let loanAmount = disbursement?.finalLoanAmount || 0; // ₹5,00,000
    let interestRate = disbursement?.roi || 0; // 10% annual interest
    let newInterestRate = (Number(disbursement?.roi) || 0) + 0.25;
    // console.log(newInterestRate, "newInterestRatenewInterestRatenewInterestRate");
    let tenure = disbursement?.tenureInMonth || 0; // 60 months (5 years)

    const emiCalculation = calculateEMI(loanAmount, newInterestRate, tenure)
    // let newInterestRate = (Number(interestRate)) ;
    let newEpiInAmount = emiCalculation;
    // console.log("EMI: ₹<<<<<<<<<<<>>>>>>>>>>>>>",emiCalculation,"emiCalculation",newEpiInAmount );

    // const loanParameters = {
    //   loanTenure: 84 || 0, // 5 years
    //   loanAmount: 650000 || 0,
    //   rateOfInterest: (22/100) || 0, // 26%
    //   processingFees: 15340 || 0,
    //   documentationCharges: 15340 || 0,
    //   insuranceFees: 0 || 0,
    //   valuationFees:  0,
    //   otherCharges: 1650 || 0,
    //   securityDeposit: 0,
    //   advanceEMI: 0,
    //   subvention: 0
    // };
    // console.log(disbursement?.tenureInMonth,disbursement?.finalLoanAmount,disbursement?.roi,
    //   data?.kfsDetails?.processingFees,data?.kfsDetails?.documentsCharges,data?.kfsDetails?.insuranceCharges,data?.kfsDetails?.cersaiCharges
    // )

    const loanParameters = {
      loanTenure: Number(disbursement?.tenureInMonth) || 0, // 5 years
      loanAmount: Number(disbursement?.finalLoanAmount) || 0,
      rateOfInterest: (Number(disbursement?.roi)/100) || 0, // 26%
      processingFees: Number(data?.kfsDetails?.processingFees) || parseFloat(totalProcessingFees.toFixed(2)) || 0,
      documentationCharges: Number(data?.kfsDetails?.documentsCharges) || parseFloat(totalDocumentationCharges.toFixed(2)) || 0,
      insuranceFees: Number(data?.kfsDetails?.insuranceCharges)  ||  Number(insuranceCharges) || 0,
      valuationFees:  0,
      otherCharges: Number(data?.kfsDetails?.cersaiCharges) || Number(cersaiCharges) || 0,
      securityDeposit: 0,
      advanceEMI: 0,
      subvention: 0
    };
    // console.log(loanParameters,"loanParametersloanParameters")
    // console.log((Number(disbursement?.roi)/100),"(Number(disbursement?.roi)/100)(Number(disbursement?.roi)/100)")
    // calling function with calculate apr
    const AprDetails = calculateAPR(loanParameters)
    const aprCalculation = (AprDetails?.apr * 100).toFixed(2)

    // console.log(AprDetails.apr * 100,"AprDetailsAprDetailsAprDetails")
    return success(res, "Lender details retrieved successfully", {
      lenderDetail,
      disbursement,
      // calculations: {
      //   finalLoanAmount,
      //   processingFees: processingFees.toFixed(2),
      //   // processingFeesGST: processingFeesGST.toFixed(2),
      //   totalProcessingFees: totalProcessingFees.toFixed(2),
      //   documentationCharges: documentationCharges.toFixed(2),
      //   // documentationChargesGST: documentationChargesGST.toFixed(2),
      //   totalDocumentationCharges: totalDocumentationCharges.toFixed(2),
      // },

      // chargesDetails: {
      //   finalLoanAmount,
      //   processingFees:
      //     parseFloat(data?.kfsDetails?.processingFees) ||
      //     parseFloat(totalProcessingFees.toFixed(2)),
      //   documentsCharges:
      //     parseFloat(data?.kfsDetails?.documentsCharges) ||
      //     parseFloat(totalDocumentationCharges.toFixed(2)),
      //   cersaiCharges:
      //     parseFloat(data?.kfsDetails?.cersaiCharges) || cersaiCharges,
      //   insuranceCharges:
      //   (parseFloat(data?.kfsDetails?.insuranceCharges) || data?.kfsDetails?.insuranceCharges === '0') 
      //   ? parseFloat(data?.kfsDetails?.insuranceCharges) 
      //   : insuranceCharges,
      //   preEmiInterest:
      //     parseFloat(data?.kfsDetails?.preEmiInterest) || preEmiInterest,
      // },
      chargesDetails: {
        finalLoanAmount,
        processingFees:
          data?.kfsDetails?.processingFees != null && data?.kfsDetails?.processingFees !== ""
            ? data?.kfsDetails?.processingFees
            : parseFloat(totalProcessingFees.toFixed(2)),
      
        documentsCharges:
          data?.kfsDetails?.documentsCharges != null && data?.kfsDetails?.documentsCharges !== ""
            ? data?.kfsDetails?.documentsCharges
            : parseFloat(totalDocumentationCharges.toFixed(2)),
      
        cersaiCharges:
          data?.kfsDetails?.cersaiCharges != null && data?.kfsDetails?.cersaiCharges !== ""
            ? data?.kfsDetails?.cersaiCharges
            : cersaiCharges,
      
        insuranceCharges:
          (parseFloat(data?.kfsDetails?.insuranceCharges) || data?.kfsDetails?.insuranceCharges === "0") &&
          data?.kfsDetails?.insuranceCharges !== ""
            ? parseFloat(data?.kfsDetails?.insuranceCharges)
            : insuranceCharges,
      
        preEmiInterest:
          data?.kfsDetails?.preEmiInterest != null && data?.kfsDetails?.preEmiInterest !== ""
            ? data?.kfsDetails?.preEmiInterest
            : preEmiInterest,
      },
      
      kfsDetails: {
        benchmarkinterestRate:
          data?.kfsDetails?.benchmarkinterestRate != null && data?.kfsDetails?.benchmarkinterestRate !== ""
            ? parseFloat(data.kfsDetails.benchmarkinterestRate)
            : benchmarkInterestRatePercentage,
      
        SpreadInterestRate:
          data?.kfsDetails?.SpreadInterestRate != null && data?.kfsDetails?.SpreadInterestRate !== ""
            ? parseFloat(data.kfsDetails.SpreadInterestRate)
            : spreadInterestRatePercentage,
      
        annualPercentageRateAprPercentage: 
          data?.kfsDetails?.annualPercentageRateAprPercentage != null && data?.kfsDetails?.annualPercentageRateAprPercentage !== ""
            ? aprCalculation
            : aprCalculation,
      
        epi:
          data?.kfsDetails?.epi != null && data?.kfsDetails?.epi !== ""
            ? parseFloat(data?.kfsDetails?.epi)
            : newEpiInAmount,
      
        noOfEpi:
          data?.kfsDetails?.noOfEpi != null && data?.kfsDetails?.noOfEpi !== ""
            ? parseFloat(data?.kfsDetails?.noOfEpi)
            : epiRate,
      },
      
    });
  } catch (error) {
    console.error("Error retrieving lender details:", error);
    // Send error response
    return badRequest(res, error.message);
  }
};

// ----------------- Get All lender Detail---------------------------------------

async function getAllLender(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    let lenderDetail = await lenderModel
      .find()
      .populate("branchId", "name") // Only select name and location fields
      .populate("productId", "productName")
      .populate("employeeId", "employeName") // Only select name and price fields
      .populate({
        path: "venders",
        populate: [
          {
            path: "branch",
            model: "newbranch",
            select: "name",
          },
          {
            path: "vender",
            model: "vendor",
            select: "fullName",
          },
        ],
      })
      .populate({
        path: "sopDetails",
        populate: [
          {
            path: "name",
            model: "employee",
            select: "employeName",
          }
        ],
      })
      .populate({
        path: "policy",
        populate: [
          {
            path: "productId",
            model: "lenderProduct",
            select: "name",
          }
        ],
      })

      

    const lenderData = { count: lenderDetail.length, list: lenderDetail };
    return success(res, "Get All lender list", lenderData);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

//lenderDetail

async function lenderDetail(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const { lenderId } = req.query
    let lenderDetail = await lenderModel
      .find({_id: lenderId})
      .populate("branchId", "name") // Only select name and location fields
      .populate("productId", "productName")
      .populate("employeeId", "employeName") // Only select name and price fields
      // .populate({
      //   path: "venders",
      //   populate: [
      //     {
      //       path: "branch",
      //       model: "newbranch",
      //       select: "name",
      //     },
      //     {
      //       path: "vender",
      //       model: "vendor",
      //       select: "fullName",
      //     },
      //   ],
      // })
      // .populate({
      //   path: "sopDetails",
      //   populate: [
      //     {
      //       path: "name",
      //       model: "employee",
      //       select: "employeName",
      //     }
      //   ],
      // })
      // .populate({
      //   path: "policy",
      //   populate: [
      //     {
      //       path: "productId",
      //       model: "lenderProduct",
      //       select: "name",
      //     }
      //   ],
      // })

    const lenderData = { count: lenderDetail.length, list: lenderDetail };
    return success(res, "Get All lender list", lenderData);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
async function alllenderList(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const { status } = req.query;
    if (!status) {
      return badRequest(res, "status is required");
    }
    let lenderList = await lenderModel
      .find({ status: status })
      .select("fullName _id");

    const lenderData = { list: lenderList };
    return success(res, `Get All ${status} lender list`, lenderData);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

async function lenderActiveOrInactive(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    } else {
      const id = req.body.partnerId;
      const status = req.body.status;
      if (!id || id.trim() === "") {
        return badRequest(res, "ID is required and cannot be empty");
      }
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return badRequest(res, "Invalid ID");
      }
      if (status == "active") {
        const lenderUpdateStatus = await lenderModel.findByIdAndUpdate(
          { _id: id },
          { status: "active" },
          { new: true }
        );
        success(res, "lender Active", lenderUpdateStatus);
      } else if (status == "inactive") {
        const lenderUpdateStatus = await lenderModel.findByIdAndUpdate(
          { _id: id },
          { status: "inactive" },
          { new: true }
        );
        success(res, "lender inactive", lenderUpdateStatus);
      } else {
        return badRequest(res, "Status must be 'active' or 'inactive'");
      }
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

//deleteLender
async function deleteLender(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    } else {
      const id = req.body.partnerId;
      if (!id || id.trim() === "") {
        return badRequest(res, "ID is required and cannot be empty");
      }
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return badRequest(res, "Invalid ID");
      }

      const lenderUpdateStatus = await lenderModel.findByIdAndDelete({
        _id: id,
      });
      success(res, "lender deleted succssfully");
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// lender  document and chanrges
const requireLenderDocument = async (req, res) => {
  try {
    const {
      lenderId,
      commercial,
      charges,
      loginChecklist,
      sanctionChecklist,
      preDisbursementChecklist,
      postDisbursementChecklist,
    } = req.body;

    if (!lenderId) {
      return res.status(400).json({ message: "Lender ID is required." });
    }

    // Prepare the update object dynamically
    const update = {};
    if (commercial) update.commercial = commercial;
    if (charges) update.charges = charges;
    if (loginChecklist) update.loginChecklist = loginChecklist;
    if (sanctionChecklist) update.sanctionChecklist = sanctionChecklist;
    if (preDisbursementChecklist)
      update.preDisbursementChecklist = preDisbursementChecklist;
    if (postDisbursementChecklist)
      update.postDisbursementChecklist = postDisbursementChecklist;

    const data = await lenderModel.findOneAndUpdate(
      { _id: lenderId },
      { $set: update },
      { new: true } // Return the updated document
    );

    if (!data) {
      return res.status(404).json({ message: "Lender not found." });
    }

    return res
      .status(200)
      .json({ message: "Document checklist added/updated successfully", data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

// ------------------- update all fields ---------------------------

async function lenderUpdate(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { lenderId } = req.params;
    const {
      fullName,
      userName,
      email,
      phoneNumber,
      corporateAddress,
      registerAddress,
      sanctionEmailTo,
      sanctionEmailCc,
      disbursementEmailTo,
      disbursementEmailCc,
      cinNo,
      gstNo,
      venders,
      addSanction,
      addDisbursement,
      commercial,
      charges,
      loginChecklist,
      sanctionChecklist,
      preDisbursementChecklist,
      postDisbursementChecklist,
      policy,
      // charges data
      processingFeesInclusiveOfGst,
      documentationChargesInclusiveOfGst,
      insurancePremiumInRs,
      cersaiChargesInRs,
      preEmiInterestInRs,
      benchmarkIntrestRate,
      spreadIntrestRate,
      annualPercentageRate,
      physicalFileSendTo,
      physicalFileAddress,
      nachMode,
      sopDetails,
      loanDocument,
      branchId,
      productId,
      employeeId,
      reportingDetails,
      shortName,
      sanctionLetterUrl,
      agreementUrl,
      logoUrl,
      legalDetails,
      partnerProduct
    } = req.body;
    // console.log(req.body, "lenderIdlenderIdlenderIdlenderId", lenderId);
    if (!lenderId) {
      return res
        .status(400)
        .json({ errorName: "badRequest", message: "Lender ID is required" });
    }

    const existingLender = await lenderModel.findById({
      _id: new mongoose.Types.ObjectId(lenderId),
    });

    if (!existingLender) {
      return res
        .status(404)
        .json({ errorName: "notFound", message: "Lender not found" });
    }

    const fileData = req.files;

    // Fields to be updated independently
    const updateFields = {
      ...(fullName && { fullName }),
      ...(userName && { userName }),
      ...(email && { email }),
      ...(phoneNumber && { phoneNumber }),
      ...(corporateAddress && { corporateAddress }),
      ...(registerAddress && { registerAddress }),
      ...(nachMode && { nachMode }),
      ...(corporateAddress && { corporateAddress }),
      ...(registerAddress && { registerAddress }),
      ...(nachMode && { nachMode }),
      // loanDocument,shortName
      ...(shortName && { shortName }),
      ...(loanDocument && { loanDocument }),
      ...(physicalFileSendTo && { physicalFileSendTo }),//physicalFileAddress
      ...(physicalFileAddress && { physicalFileAddress }),
      ...(logoUrl ? { logo: logoUrl } : {}),
      ...(agreementUrl ? { aggrement: agreementUrl } : {}),
      ...(sanctionLetterUrl && { sanctionLatter: sanctionLetterUrl }),
      ...(partnerProduct && { partnerProduct: JSON.parse(partnerProduct) }),
      ...(legalDetails && { legalDetails: JSON.parse(legalDetails) }),
      ...(reportingDetails && { reportingDetails: JSON.parse(reportingDetails) }),
      ...(sopDetails && { sopDetails: JSON.parse(sopDetails) }),
      ...(sanctionEmailTo && { sanctionEmailTo: JSON.parse(sanctionEmailTo) }),
      ...(disbursementEmailTo && {
        disbursementEmailTo: JSON.parse(disbursementEmailTo),
      }),
      ...(sanctionEmailCc && { sanctionEmailCc: JSON.parse(sanctionEmailCc) }),
      ...(employeeId && { employeeId: JSON.parse(employeeId) }),
      ...(branchId && { branchId: JSON.parse(branchId) }),
      ...(productId && { productId: JSON.parse(productId) }),
      ...(disbursementEmailCc && {
        disbursementEmailCc: JSON.parse(disbursementEmailCc),
      }),
      ...(addSanction && { addSanction: JSON.parse(addSanction) }),
      ...(addDisbursement && { addDisbursement: JSON.parse(addDisbursement) }),
      ...(venders && { venders: JSON.parse(venders) }),
      ...(charges && { charges: JSON.parse(charges) }),
      ...(commercial && { commercial: JSON.parse(commercial) }),
      ...(loginChecklist && { loginChecklist: JSON.parse(loginChecklist) }),
      ...(sanctionChecklist && {
        sanctionChecklist: JSON.parse(sanctionChecklist),
      }),
      ...(preDisbursementChecklist && {
        preDisbursementChecklist: JSON.parse(preDisbursementChecklist),
      }),
      ...(postDisbursementChecklist && {
        postDisbursementChecklist: JSON.parse(postDisbursementChecklist),
      }),
      ...(cinNo && { cinNo }),
      ...(gstNo && { gstNo }),
      ...(fileData?.logo && { logo: `uploads/${fileData.logo[0].filename}` }),
      ...(fileData?.sanctionLatter && {
        sanctionLatter: `uploads/${fileData.sanctionLatter[0].filename}`,
      }),
      ...(fileData?.aggrement && {
        aggrement: `uploads/${fileData.aggrement[0].filename}`,
      }),
      ...(policy && { policy: JSON.parse(policy) }),

      //charges data
      ...(processingFeesInclusiveOfGst && {
        "charges.processingFeesInclusiveOfGst": processingFeesInclusiveOfGst,
      }),
      ...(documentationChargesInclusiveOfGst && {
        "charges.documentationChargesInclusiveOfGst":
          documentationChargesInclusiveOfGst,
      }),
      ...(insurancePremiumInRs && {
        "charges.insurancePremiumInRs": insurancePremiumInRs,
      }),
      ...(cersaiChargesInRs && {
        "charges.cersaiChargesInRs": cersaiChargesInRs,
      }),
      ...(preEmiInterestInRs && {
        "charges.preEmiInterestInRs": preEmiInterestInRs,
      }),
      ...(benchmarkIntrestRate && {
        "charges.benchmarkIntrestRate": benchmarkIntrestRate,
      }),
      ...(spreadIntrestRate && {
        "charges.spreadIntrestRate": spreadIntrestRate,
      }),
      ...(annualPercentageRate && {
        "charges.annualPercentageRate": annualPercentageRate,
      }),
    };

    // Fields to be pushed into arrays
    // const pushFields = {
    //   ...(sanctionEmailCc && { sanctionEmailCc: { $each: Array.isArray(sanctionEmailCc) ? sanctionEmailCc : [sanctionEmailCc] } }),
    //   ...(disbursementEmailCc && { disbursementEmailCc: { $each: Array.isArray(disbursementEmailCc) ? disbursementEmailCc : [disbursementEmailCc] } }),
    //   ...(addSanction && { addSanction: { $each: Array.isArray(addSanction) ? addSanction : [addSanction] } }),
    //   ...(addDisbursement && { addDisbursement: { $each: Array.isArray(addDisbursement) ? addDisbursement : [addDisbursement] } }),
    //   ...(venders && { venders: { $each: Array.isArray(venders) ? venders : [venders] } }),
    // };

    const updatedLender = await lenderModel.findByIdAndUpdate(
      lenderId,
      {
        ...(Object.keys(updateFields).length && { $set: updateFields }),
        // ...(Object.keys(pushFields).length && { $push: pushFields }),
      },
      { new: true, runValidators: true }
    );
    return res.status(200).json({
      message: "Lender updated successfully",
      lender: updatedLender,
    });
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

//------------------------------- add lender document and send email ----------------------------------------

// const addDocumentTolender = async (req, res) => {
//   try {
//     const tokenId = new ObjectId(req.Id); // Extract the tokenId
//     const { type, customerId, lenderId, documents } = req.body;

//     // Validate the request body
//     if (!type || !["sanctionDocument", "esignDocument", "disbursementDocument"].includes(type)) {
//       return badRequest(res, "Invalid type. Must be 'sanctionDocument', 'esignDocument', or 'disbursementDocument'.");
//     }

//     if (!customerId) {
//       return badRequest(res, "CustomerId is required.");
//     }

//     if (!documents || !Array.isArray(documents) || documents.length === 0) {
//       return badRequest(res, "Documents must be a non-empty array.");
//     }

//     // Fetch existing documents for the customer and lender
//     let existingDocument = await lenderDocumentModel.findOne({ customerId, lenderId });

//     // Process documents
//     const processedDocuments = documents.map((doc) => {
//       if (!doc.documentName || !Array.isArray(doc.url)) {
//         throw new Error("Each document must have a documentName and an array of URLs.");
//       }

//       if (type === "esignDocument" && typeof doc.serialNo !== "number") {
//         throw new Error("Each eSign document must have a serialNo.");
//       }

//       // Check if the document already exists in the existing data
//       const existingDoc = existingDocument?.[type]?.find((d) => d.documentName === doc.documentName);

//       if (existingDoc) {
//         // Replace old URLs with new URLs
//         existingDoc.url = doc.url;

//         // Update serialNo if it's an eSign document
//         if (type === "esignDocument" && doc.serialNo) {
//           existingDoc.serialNo = doc.serialNo;
//         }

//         return null; // Skip adding this document to $push (it's just updated)
//       }

//       // If documentName does not exist, add the document with new URLs
//       return {
//         ...(type === "esignDocument" ? { serialNo: doc.serialNo } : {}),
//         documentName: doc.documentName,
//         url: doc.url.map((url) => {
//           if (typeof url !== "string") {
//             throw new Error("Each 'url' must be a string.");
//           }
//           return url;
//         }),
//       };
//     });

//     // Filter out null values (documents that were updated instead of added)
//     const newDocuments = processedDocuments.filter((doc) => doc !== null);

//     // Add new documents to the database if any new documents
//     if (newDocuments.length > 0) {
//       const updateQuery = {
//         $push: {
//           [type]: { $each: newDocuments },
//         },
//         filledBy: tokenId, // Save the tokenId in filledBy
//       };

//       existingDocument = await lenderDocumentModel.findOneAndUpdate(
//         { customerId, lenderId },
//         updateQuery,
//         { new: true, upsert: true }
//       );
//     }

//     // Save updated URLs and serialNo to the database for existing documents
//     if (existingDocument && existingDocument[type]) {
//       for (const doc of documents) {
//         const existingDoc = existingDocument[type].find((d) => d.documentName === doc.documentName);
//         if (existingDoc) {
//           // Replace old URLs with new URLs
//           existingDoc.url = doc.url;

//           // Update serialNo if it's an eSign document
//           if (type === "esignDocument" && doc.serialNo) {
//             existingDoc.serialNo = doc.serialNo;
//           }
//         }
//       }

//       // Save changes to the database if there were any modifications
//       existingDocument.filledBy = tokenId; // Ensure filledBy is updated
//       await existingDocument.save();
//     }

//     // Email logic
//     if (customerId && !lenderId) {
//       // When only customerId is provided, do NOT send an email
//       return success(res, "Documents added/updated successfully.", existingDocument);
//     }

//     if (customerId && lenderId) {
//       // When both customerId and lenderId are provided, send an email to the lender
//       const partnerModel = await lenderModel.findOne({ _id: lenderId });
//       if (!partnerModel) {
//         return notFound(res, "Lender not found.");
//       }

//       // const emailContent = `
//       //   <div style="font-family: Arial, sans-serif; line-height: 1.6;">
//       //     <p>Dear Sir/Madam,</p>
//       //     <p>Please find the final documents for your review.</p>
//       //     <p>Need your immediate action in this case.</p>
//       //     <p>Regards,</p>
//       //     <p>Team FinCoopers</p>
//       //   </div>
//       // `;

//       // const attachments = documents.flatMap((doc) =>
//       //   doc.url.map((url) => ({
//       //     filename: `${doc.documentName || "document"}.png`,
//       //     path: url,
//       //   }))
//       // );

//       // await sendEmail(
//       //   [partnerModel.sanctionEmailTo],
//       //   [],
//       //   `Documents for review`,
//       //   emailContent,
//       //   attachments
//       // );

//       return success(res, "Documents added/updated", existingDocument);
//     }

//     return success(res, "Documents added/updated successfully.", existingDocument);
//   } catch (error) {
//     console.error(error);
//     return unknownError(res, error);
//   }
// };

// const addDocumentTolender = async (req, res) => {
//   try {
//     const { type, customerId, lenderId, documents } = req.body;
//     const tokenId = new ObjectId(req.Id);
//     const baseUrl = process.env.BASE_URL;

//     // Validate request data first before any DB operations
//     if (!type || !["sanctionDocument", "esignDocument", "disbursementDocument"].includes(type)) {
//       return badRequest(res, "Invalid type. Must be 'sanctionDocument', 'esignDocument', or 'disbursementDocument'.");
//     }
//     if (!customerId) return badRequest(res, "CustomerId is required.");
//     if (!documents?.length) {
//       return badRequest(res, "Documents must be a non-empty array.");
//     }

//     // Parallel DB queries using Promise.all
//     const [customerDetail, existingDocument] = await Promise.all([
//       applicantModel.findOne({ customerId }, { fullName: 1 }), // Only fetch required fields
//       // lenderDocumentModel.findOne({ customerId, lenderId })
//     ]);

//     // if (!customerDetail) {
//     //   return notFound(res, "customerId Not Found");
//     // }

//     // Helper function to process URLs
//     const processUrls = (urls) => {
//       return urls.map(url => {
//         // If URL already starts with http/https, return as is
//         if (url.startsWith('http://') || url.startsWith('https://')) {
//           return url;
//         }
//         // Otherwise, prepend BASE_URL
//         return `${baseUrl}${url}`;
//       });
//     };

//     // Process documents in a more efficient way
//     const processedDocuments = documents.reduce((acc, doc) => {
//       if (!doc.documentName || !Array.isArray(doc.url)) {
//         throw new Error("Each document must have a documentName and an array of URLs.");
//       }
//       if (type === "esignDocument" && typeof doc.serialNo !== "number") {
//         throw new Error("Each eSign document must have a serialNo.");
//       }

//       const processedUrls = processUrls(doc.url.filter(url => typeof url === "string"));

//       const existingDoc = existingDocument?.[type]?.find(d => d.documentName === doc.documentName);
//       if (existingDoc) {
//         existingDoc.url = processedUrls;
//         if (type === "esignDocument") existingDoc.serialNo = doc.serialNo;
//         return acc;
//       }

//       acc.push({
//         ...(type === "esignDocument" ? { serialNo: doc.serialNo } : {}),
//         documentName: doc.documentName,
//         url: processedUrls
//       });
//       return acc;
//     }, []);

//     // Update document in a single operation
//     let updatedDocument;
//     if (processedDocuments.length > 0 || (existingDocument && existingDocument[type])) {
//       const updateQuery = {
//         $set: { filledBy: tokenId },
//         ...(processedDocuments.length > 0 && {
//           $push: { [type]: { $each: processedDocuments } }
//         })
//       };

//       updatedDocument = await lenderDocumentModel.findOneAndUpdate(
//         { customerId, lenderId },
//         updateQuery,
//         { new: true, upsert: true }
//       );
//     }

//     // Create ZIP file asynchronously if needed
//     let zipFilePath = null;
//     if (["sanctionDocument", "disbursementDocument"].includes(type)) {
//       const timestamp = Date.now();
//       const allFiles = documents.flatMap(doc =>
//         doc.url.map((url, index) => ({
//           url: url.startsWith('http') ? url : `${baseUrl}${url}`,
//           name: `${doc.documentName}_file${index + 1}${timestamp}${getFileExtension(url)}`
//         }))
//       );

//       const zipFileName = `${updatedDocument.fullName}_${timestamp}_${type}_documents.zip`;

//       zipFilePath = await uploadZip(allFiles, zipFileName);
//     }
//   let dataUpdated
//     if(type == "sanctionDocument"){
//       dataUpdated= await finalModel.findOneAndUpdate(
//         { customerId },
//         {$set: {
//           sanctionZipUrl:zipFilePath
//         }},
//         { new: true, upsert: true }
//       );
//     }else {
//       dataUpdated = await finalModel.findOneAndUpdate(
//         { customerId },
//         {$set: {
//           disbursementZipUrl:zipFilePath
//         }},
//         { new: true, upsert: true }
//       );
//     }

//     return success(res, "Documents added/updated successfully.", {
//       updatedDocument,
//       ...(zipFilePath && { zipFilePath })
//     });

//   } catch (error) {
//     console.error(error);
//     return unknownError(res, error);
//   }
// };

const esignDocumentTolender = async (req, res) => {
  try {
    const { documents } = req.body;

    // Extract only the 'url' fields from the documents
    const urls = documents
      .filter((doc) => Array.isArray(doc.url) && doc.url.length > 0) // Ensure 'url' is an array and not empty
      .flatMap((doc) => doc.url); // Flatten the array of arrays into a single array

    console.log(urls, "Extracted URLs");

    // Call the initESign function with the extracted URLs
    const data = await initESign(urls);
    console.log(data, "Response from initESign");

    // Transform the response into the desired format
    const transformSignUrls = (response) => {
      const keys = ["applicant", "coapplicant", "guarantor"];
      return keys.reduce((acc, key, index) => {
        if (response[index]) {
          acc[key] = response[index].signUrl; // Assign signUrl to the respective key
        }
        return acc;
      }, {});
    };

    const transformedData = transformSignUrls(data);

    console.log(transformedData, "Transformed Data");

    return success(
      res,
      "Documents added/updated successfully.",
      transformedData
    );
  } catch (error) {
    console.error("Error in esignDocumentToLender API:", error.message);
    return unknownError(res, error);
  }
};

// Optimized getFileExtension function
const getFileExtension = (() => {
  const extensionRegex = /\.(jpg|jpeg|png|gif|pdf)$/i;
  return (url) => {
    const match = url.match(extensionRegex);
    return match ? `.${match[1].toLowerCase()}` : ".png";
  };
})();

const lenderCustomerList = async (req, res) => {
  try {
    const data = await finalSnctionModel.aggregate([]);
    return success(
      res,
      "Documents added/updated successfully.",
      existingDocument
    );
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
};

// const addDocumentTolender = async (req, res) => {
//   try {
//     const { type, customerId, lenderId, documents } = req.body;
//     const tokenId = new ObjectId(req.Id);

//     // Validate request data
//     if (!type || !["sanctionDocument", "esignDocument", "disbursementDocument"].includes(type)) {
//       return badRequest(res, "Invalid type. Must be 'sanctionDocument', 'esignDocument', or 'disbursementDocument'.");
//     }
//     if (!customerId) return badRequest(res, "CustomerId is required.");
//     if (!documents?.length) {
//       return badRequest(res, "Documents must be a non-empty array.");
//     }

//     // Validate document structure
//     for (const doc of documents) {
//       if (!doc.documentName || !Array.isArray(doc.url) || doc.url.length === 0) {
//         return badRequest(res, "Each document must have a documentName and a non-empty url array.");
//       }
//       if (type === "esignDocument" && typeof doc.serialNo !== "number") {
//         return badRequest(res, "Each eSign document must have a serialNo.");
//       }
//     }

//     // Parallel DB queries
//     const [customerDetail, existingDocument] = await Promise.all([
//       applicantModel.findOne({ customerId }, { fullName: 1 }),
//       lenderDocumentModel.findOne({ customerId, lenderId })
//     ]);

//     if (!customerDetail) {
//       return notFound(res, "Customer not found");
//     }

//     // Process document URLs
//     const processedDocuments = documents.map(doc => ({
//       documentName: doc.documentName,
//       url: doc.url.map(url => url.startsWith('http') ? url : `${url}`),
//       ...(type === "esignDocument" && { serialNo: doc.serialNo })
//     }));

//     // Prepare update query based on document type
//     let updateQuery;
//     if (type === "esignDocument") {
//       // For esignDocument, replace the entire array
//       updateQuery = {
//         $set: {
//           filledBy: tokenId,
//           esignDocument: processedDocuments
//         }
//       };
//     } else {
//       // For other document types, append to the array
//       updateQuery = {
//         $set: { filledBy: tokenId },
//         $push: { [type]: { $each: processedDocuments } }
//       };
//     }

//     const updatedDocument = await lenderDocumentModel.findOneAndUpdate(
//       { customerId, lenderId },
//       updateQuery,
//       { new: true, upsert: true }
//     );

//     // Create ZIP if needed
//     let zipFilePath = null;
//     if (["sanctionDocument", "disbursementDocument"].includes(type)) {
//       const timestamp = Date.now();
//       const appPdcData = await appPdcModel.findOne({ customerId });
//       const gtrPdcData = await gtrPdcModel.findOne({ customerId });
//       let guarantorRecord = await guarantorStatementDetails.findOne({ customerId });
//       console.log(appPdcData,"appPdcData",gtrPdcData,"gtrPdcData",guarantorRecord,"guarantorRecord")
//       const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");

//       if( type == "disbursementDocument"){
//         if (!appPdcData || !gtrPdcData || !guarantorRecord) {
//           return badRequest(res, "Missing required PDC or guarantor records");
//         }

//         if (
//           (!appPdcData.applicantPdcDocument || appPdcData.applicantPdcDocument.length < 5) &&
//           (!gtrPdcData.guarantorPdcDocument || gtrPdcData.guarantorPdcDocument.length < 2) &&
//           (!guarantorRecord.guarantorDetails || guarantorRecord.guarantorDetails.length === 0)
//         ) {
//           return badRequest(res, "Please fill PDC or guarantor bank details");
//         }

//         await finalModel.findOneAndUpdate(
//           { customerId },
//           { $set: { sendToPartnerPreDisbursedStatus: "complete",
//             sendToPartnerPreDisbursedDate:todayDate
//            } },
//           {new: true, upsert:true}
//         );

//       }
//       // Prepare files for zip
//       const filesToZip = documents.map((doc, index) => ({
//         url: doc.url[0], // Take first URL from each document
//         name: `${doc.documentName.replace(/[^a-zA-Z0-9-_]/g, '_')}_${index + 1}.pdf`
//       }));

//       const zipFileName = `${customerId}_${timestamp}_${type}_documents.zip`;
//       zipFilePath = await uploadZip(filesToZip, zipFileName);
//       console.log(zipFilePath,"zipFilePathzipFilePath")
//       // Update final model with ZIP URL
//       const updateField = type === "sanctionDocument"
//         ? { sanctionZipUrl: zipFilePath }
//         : { disbursementZipUrl: zipFilePath };

//       await finalModel.findOneAndUpdate(
//         { customerId },
//         { $set: updateField },
//         { new: true, upsert: true }
//       );
//     }

//     return success(res, "Documents processed successfully", {
//       updatedDocument,
//       ...(zipFilePath && { zipFilePath })
//     });

//   } catch (error) {
//     console.error('Error in addDocumentToLender:', error);
//     return unknownError(res, error);
//   }
// };

const addDocumentTolender = async (req, res) => {
  try {
    const { type, customerId, lenderId, documents } = req.body;
    const tokenId = new ObjectId(req.Id);

    // Validate request data
    if (
      !type ||
      !["sanctionDocument", "esignDocument", "disbursementDocument"].includes(
        type
      )
    ) {
      return badRequest(
        res,
        "Invalid type. Must be 'sanctionDocument', 'esignDocument', or 'disbursementDocument'."
      );
    }
    if (!customerId) return badRequest(res, "CustomerId is required.");
    if (!documents?.length) {
      return badRequest(res, "Documents must be a non-empty array.");
    }

    // Validate document structure
    for (const doc of documents) {
      if (
        !doc.documentName ||
        !Array.isArray(doc.url) ||
        doc.url.length === 0
      ) {
        return badRequest(
          res,
          "Each document must have a documentName and a non-empty url array."
        );
      }
      if (type === "esignDocument" && typeof doc.serialNo !== "number") {
        return badRequest(res, "Each eSign document must have a serialNo.");
      }
    }

    // Parallel DB queries
    const [customerDetail, existingDocument] = await Promise.all([
      applicantModel.findOne({ customerId }, { fullName: 1 }),
      lenderDocumentModel.findOne({ customerId, lenderId }),
    ]);

    if (!customerDetail) {
      return notFound(res, "Customer not found");
    }

    // Process document URLs
    const processedDocuments = documents.map((doc) => ({
      documentName: doc.documentName,
      url: doc.url.map((url) => (url.startsWith("http") ? url : `${url}`)),
      ...(type === "esignDocument" && { serialNo: doc.serialNo }),
    }));

    // Prepare update query based on document type
    let updateQuery;
    if (type === "esignDocument") {
      // For esignDocument, replace the entire array
      updateQuery = {
        $set: {
          filledBy: tokenId,
          esignDocument: processedDocuments,
        },
      };
    } else {
      // For other document types, append to the array
      updateQuery = {
        $set: { filledBy: tokenId },
        $push: { [type]: { $each: processedDocuments } },
      };
    }

    const updatedDocument = await lenderDocumentModel.findOneAndUpdate(
      { customerId, lenderId },
      updateQuery,
      { new: true, upsert: true }
    );

    // Create ZIP if needed
    let zipFilePath = null;
    if (["sanctionDocument", "disbursementDocument"].includes(type)) {
      const timestamp = Date.now();
      const appPdcData = await appPdcModel.findOne({ customerId });
      const gtrPdcData = await gtrPdcModel.findOne({ customerId });
      let guarantorRecord = await guarantorStatementDetails.findOne({
        customerId,
      });
      console.log(
        appPdcData,
        "appPdcData",
        gtrPdcData,
        "gtrPdcData",
        guarantorRecord,
        "guarantorRecord"
      );
      const todayDate = moment()
        .tz("Asia/Kolkata")
        .format("YYYY-MM-DDThh:mm:ss A");

      if (type == "disbursementDocument") {
        if (!appPdcData || !gtrPdcData || !guarantorRecord) {
          return badRequest(res, "Missing required PDC or guarantor records");
        }

        if (
          (!appPdcData.applicantPdcDocument ||
            appPdcData.applicantPdcDocument.length < 5) &&
          (!gtrPdcData.guarantorPdcDocument ||
            gtrPdcData.guarantorPdcDocument.length < 2) &&
          (!guarantorRecord.guarantorDetails ||
            guarantorRecord.guarantorDetails.length === 0)
        ) {
          return badRequest(res, "Please fill PDC or guarantor bank details");
        }

        await finalModel.findOneAndUpdate(
          { customerId },
          {
            $set: {
              sendToPartnerPreDisbursedStatus: "complete",
              sendToPartnerPreDisbursedDate: todayDate,
            },
          },
          { new: true, upsert: true }
        );
      }

      try {
        // Prepare files for zip - include ALL URLs from each document
        const filesToZip = [];

        for (let i = 0; i < documents.length; i++) {
          const doc = documents[i];
          if (doc.url && doc.url.length > 0) {
            // Process all URLs in the array
            doc.url.forEach((url, urlIndex) => {
              if (url && url.trim() !== "") {
                // Extract file extension from URL
                const fileExtension =
                  url.split(".").pop().toLowerCase() || "pdf";

                filesToZip.push({
                  url: url,
                  name: `${doc.documentName.replace(/[^a-zA-Z0-9-_]/g, "_")}_${
                    i + 1
                  }_${urlIndex + 1}.${fileExtension}`,
                });
              }
            });
          }
        }

        console.log(`Preparing to zip ${filesToZip.length} files`);

        if (filesToZip.length > 0) {
          const zipFileName = `${customerId}_${timestamp}_${type}_documents.zip`;
          zipFilePath = await uploadZip(filesToZip, zipFileName);
          console.log("ZIP file created successfully:", zipFilePath);

          // Update final model with ZIP URL
          if (zipFilePath) {
            const updateField =
              type === "sanctionDocument"
                ? { sanctionZipUrl: zipFilePath }
                : { disbursementZipUrl: zipFilePath };

            await finalModel.findOneAndUpdate(
              { customerId },
              { $set: updateField },
              { new: true, upsert: true }
            );
          }
        } else {
          console.log("No valid files to zip");
        }
      } catch (zipError) {
        console.error("Error creating ZIP file:", zipError);
        // Continue execution even if ZIP creation fails
      }
    }

    return success(res, "Documents processed successfully", {
      updatedDocument,
      ...(zipFilePath && { zipFilePath }),
    });
  } catch (error) {
    console.error("Error in addDocumentToLender:", error);
    return unknownError(res, error);
  }
};

const venderDelete = async (req, res) => {
  try {
    const { lenderId, venderId } = req.body;

    if (!lenderId || !venderId) {
      return badRequest(res, "lenderId and venderId are required");
    }

    // Use $pull to remove the vendor object with the matching _id
    const updatedLender = await lenderModel.findByIdAndUpdate(
      lenderId,
      {
        $pull: {
          venders: { _id: venderId },
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedLender) {
      return badRequest(res, "lender not found");
    }

    return success(res, "Vendor deleted successfully", {
      data: updatedLender,
    });
  } catch (error) {
    console.error("Error in venderDelete:", error);
    return unknownError(res, error);
  }
};

//lenderProductModel
const addProduct = async (req, res) => {
  try {
    const { lenderId,name } = req.body;

    if (!lenderId) {
      return badRequest(res, "lenderId required");
    }

    // Use $pull to remove the vendor object with the matching _id
    const updatedLender = await lenderProductModel.create({lenderId,name})

    if (!updatedLender) {
      return badRequest(res, "lender not found");
    }

    return success(res, "product created successfully");
  } catch (error) {
    console.error("Error in venderDelete:", error);
    return unknownError(res, error);
  }
};

const productDetails = async (req, res) => {
  try {
    const { lenderId } = req.query;
    console.log(lenderId,"lenderId" )
    if (!lenderId) {
      return badRequest(res, "lenderId required");
    }

    // Use $pull to remove the vendor object with the matching _id
    const updatedLender = await lenderProductModel.find({lenderId: lenderId})
    console.log(updatedLender,"updatedLenderupdatedLender")
    if (!updatedLender) {
      return badRequest(res, "lender not found");
    }

    return success(res, "product details", {
      data: updatedLender,
    });
  } catch (error) {
    console.error("Error in venderDelete:", error);
    return unknownError(res, error);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return badRequest(res, "productId required");
    }

    await lenderProductModel.deleteOne({_id: productId})

    return success(res, "product delete successfully");
  } catch (error) {
    console.error("Error in venderDelete:", error);
    return unknownError(res, error);
  }
};



const getPhysicalFileCourierByCustomerIdToLender = async (req, res) => {
  try {
    const { customerId } = req.query;

    if (!customerId) {
      return notFound(res ,'customerId is required' );
    }

    // Find the PhysicalFileCourier document by customerId
    const courier = await physicalFileCourierlenderModel.findOne({ customerId })
      .populate('customerId', 'name email');  // Optionally populate customerId with details like name, email, etc.


    return success(res , "Physical File Courier Details ", { data: courier });
  } catch (error) {
    console.error("Error in :", error);
    return unknownError(res, error);
  }
};



const addPhysicalFileCourierToLender = async (req, res) => {
  try {
    const { customerId, courierDate, courierCompany, podNo, receipt } = req.body;

    if (!customerId) {
      return notFound(res, "customerId is required");
    }

    // Find and update if the record exists, otherwise create a new one
    const updatedCourier = await physicalFileCourierlenderModel.findOneAndUpdate(
      { customerId }, // Condition to find existing record
      {
        courierDate,
        courierCompany,
        podNo,
        receipt,
      },
      { new: true, upsert: true } // new: return updated document, upsert: create if not found
    );

    return success(res, "PhysicalFileCourier added/updated successfully", {
      data: updatedCourier,
    });
  } catch (error) {
    console.error("Error in addPhysicalFileCourier:", error);
    return unknownError(res, error);
  }
};


module.exports = {
  lenderAdd,
  lenderUpdate,
  lenderById,
  getAllLender,
  alllenderList,
  lenderActiveOrInactive,
  requireLenderDocument,
  addDocumentTolender,
  lenderCustomerList,
  esignDocumentTolender,
  getLenderByPartnerUniqueIdAndCustomerId,
  deleteLender,
  venderDelete,
  productDetails,
  addProduct,
  lenderDetail,
  deleteProduct,
  addPhysicalFileCourierToLender,
  getPhysicalFileCourierByCustomerIdToLender,
};
