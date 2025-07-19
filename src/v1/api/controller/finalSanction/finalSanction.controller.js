const {
  success,
  unknownError,
  serverValidation,
  badRequest,
} = require("../../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const customerModel = require("../../model/customer.model.js");
const employeeModel = require("../../model/adminMaster/employe.model");
const applicantModel = require("../../model/applicant.model.js");
const finalModel = require("../../model/finalSanction/finalSnction.model");
const externalBranchModel = require("../../model/adminMaster/newBranch.model");
const externalVendorDynamicModel = require("../../model/externalManager/externalVendorDynamic.model");
const cibilModel = require("../../model/cibilDetail.model.js");
const creditPdModel = require("../../model/credit.Pd.model.js");
const finalEligibilityModel = require("../../model/finalApproval/finalEligibility.js")
const lendersModel = require("../../model/lender.model.js");
const processModel = require("../../model/process.model.js")
const approverFormModel = require("../../model/branchPendency/approverTechnicalFormModel.js");


// async function finalSanctionCreate(req, res) {
//   try {
//     // Validate request and token ID
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errorName: "serverValidation", errors: errors.array() });
//     }
//     if (!req.Id || !mongoose.isValidObjectId(req.Id)) {
//       return badRequest(res, "Invalid or missing token ID");
//     }

//     const tokenId = new ObjectId(req.Id);
//     const vendorData = await employeeModel.findOne({ _id: tokenId, status: "active" });
//     if (!vendorData) return badRequest(res, "Employee not found");

//     // Validate customerId and fetch customer data
//     const { customerId, ...sanctionFields } = req.body;
//     if (!customerId || !mongoose.isValidObjectId(customerId)) {
//       return badRequest(res, "Valid customerId is required");
//     }
//     const customerFind = await customerModel.findById(customerId);
//     if (!customerFind) return badRequest(res, "Customer not found");

//     // Sanction data preparation
//     const completeDate = new Date().toString().split(" ").slice(0, 5).join(" ");
//     const sanctionData = {
//       ...sanctionFields,
//       tenureInMonth: req.body.tenureInMonth, // Ensure tenureInMonth is explicitly included
//       finalSanctionemployeeId: tokenId,
//       completeDate,
//     };
//     const fieldsToCheck = [
//       "finalLoanAmount",
//       "loanAmountInWords",
//       "roi",
//       "tenureInMonth", // Add tenureInMonth to the list of fields to check
//       "emiAmount",
//       "EndUseOfLoan",
//       "customerProfile",
//       "customerSegment",
//     ];

//     // Update process model for form start
//     await processModel.findOneAndUpdate(
//       { customerId },
//       { $set: { finalSanctionDetailsFormStart: true } },
//       { new: true }
//     );

//     // Check if sanction details exist and handle accordingly
//     let sanctionDetail = await finalModel.findOne({ customerId });
//     const updateFields = {};
//     if (sanctionDetail) {
//       // Update existing document
//       sanctionDetail = await finalModel.findByIdAndUpdate(
//         sanctionDetail._id,
//         sanctionData,
//         { new: true }
//       );
//     } else {
//       // Create new document
//       sanctionDetail = await finalModel.create(sanctionData);
//     }

//     // Determine fields filled and update flags
//     const filledFields = fieldsToCheck.filter((field) => sanctionDetail[field]);
//     console.log(filledFields,"filledFields",fieldsToCheck)
//     if (filledFields.length > 0) {
//       updateFields.finalSanctionDetailsFormStart = true;
//     }
//     console.log(filledFields,fieldsToCheck)
//     if (filledFields.length === fieldsToCheck.length) {
//       updateFields.finalSanctionDetailsFormComplete = true;
//     }

//     // Update sanction detail with flags if necessary
//     if (Object.keys(updateFields).length > 0) {
//       sanctionDetail = await finalModel.findByIdAndUpdate(
//         sanctionDetail._id,
//         { $set: updateFields },
//         { new: true }
//       );
//     }

//     // Update the process model to reflect form completeness if all fields are filled
//     if (updateFields.finalSanctionDetailsFormComplete) {
//       await processModel.findOneAndUpdate(
//         { customerId },
//         { $set: { finalSanctionDetailsFormComplete: true } },
//         { new: true }
//       );
//     }

//     const message = updateFields.finalSanctionDetailsFormComplete
//       ? "FinalSanction form completed successfully"
//       : "FinalSanction form updated successfully";
//     return success(res, message, sanctionDetail);
//   } catch (error) {
//     console.error("Error in finalSanctionCreate:", error);
//     return unknownError(res, "An unexpected error occurred", error);
//   }
// }

async function finalSanctionCreate(req, res) {
  try {
    // Validate request and token ID
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errorName: "serverValidation", errors: errors.array() });
    }
    const { customerId, emiAmount,EndUseOfLoan,finalLoanAmount,loanAmountInWords,roi,foir,
      tenureInMonth,customerProfile,customerSegment,emiCycle } = req.body;
    if (!customerId || !mongoose.isValidObjectId(customerId)) {
      return badRequest(res, "Valid customerId is required");
    }

    const customerFind = await customerModel.findById(customerId);
    if (!customerFind) return badRequest(res, "Customer not found");

    // Prepare sanction data
    const completeDate = new Date().toString().split(" ").slice(0, 5).join(" ");

    const sanctionDetail = await finalModel.findOneAndUpdate(
      { customerId },
      { $set: {
        emiAmount,EndUseOfLoan,finalLoanAmount,loanAmountInWords,roi,foir,tenureInMonth,customerProfile,customerSegment,completeDate,emiCycle
      } },
      { new: true, upsert: true }
    );

    if (!sanctionDetail) {
      return badRequest(res, "Failed to update sanction details");
    }

    const fieldsToCheck = [
      "finalLoanAmount",
      "loanAmountInWords",
      "roi",
      "tenureInMonth",
      "emiAmount",
      "EndUseOfLoan",
      "customerProfile",
      "customerSegment",
    ];

    // Update process model for form start
    await processModel.findOneAndUpdate(
      { customerId },
      { $set: { finalSanctionDetailsFormStart: true } },
      { new: true, }
    );

      let updateFields = { }
    // Determine fields filled and update flags
    const filledFields = fieldsToCheck.filter((field) => sanctionDetail[field]);
    if (filledFields.length > 0) {
      updateFields.finalSanctionDetailsFormStart = true;
    }
    if (filledFields.length === fieldsToCheck.length) {
      updateFields.finalSanctionDetailsFormComplete = true;
    }

    // Update the process model to reflect form completeness if all fields are filled
    // if (updateFields.finalSanctionDetailsFormComplete) {
      await processModel.findOneAndUpdate(
        { customerId },
        { $set: { finalSanctionDetailsFormComplete: true,
          finalSanctionDetails:true
         } },
        { new: true }
      );
    // }
  const message = "FinalSanction form completed successfully"
  success(res, message, sanctionDetail);
  // await finalApprovalSheet(customerId)
  } catch (error) {
    console.error("Error in finalSanctionCreate:", error);
    return unknownError(res, "An unexpected error occurred", error);
  }
}


async function finalSanctionGET(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const tokenId = new ObjectId(req.Id);
    const completeDate = new Date().toString().split(" ").slice(0, 5).join(" ");
    const vendorData = await employeeModel.findOne({
      _id: tokenId,
      status: "active",
    });
    if (!vendorData) {
      return badRequest(res, "employee not found");
    }

    const { customerId } = req.query;
    if (!customerId.trim() === "") {
      return badRequest(res, "customerId is required");
    }

    // const customerFind = await customerModel.findById(customerId);
    // if (!customerFind) {
    //   return badRequest(res, "Customer Not Found");
    // }

    const existingfinal = await finalModel.findOne({ customerId });
    const data = await disbursementModel.findOne({ customerId });
    const approverData = await approverFormModel.findOne({
      customerId: new ObjectId(customerId),
    });
    const responseData = {
      chargesDetails: {
        processingFees: data?.kfsDetails?.processingFees || "",
        documentsCharges: data?.kfsDetails?.documentsCharges || "",
        insuranceCharges: data?.kfsDetails?.insuranceCharges || "",
        cersaiCharges: data?.kfsDetails?.cersaiCharges || "",
        preEmiinterest: data?.kfsDetails?.preEmiInterest || "",
      },
      kfsDetails: {
        benchmarkinterestRate: data?.kfsDetails?.benchmarkinterestRate || "",
        spreadInterestRate: data?.kfsDetails?.SpreadInterestRate || "",
        annualPercentageRateAprPercentage:
          data?.kfsDetails?.annualPercentageRateAprPercentage || "",
        epi: data?.kfsDetails?.epi || "",
        noOfEpi: data?.kfsDetails?.noOfEpi || "",
      },
      fairMarketValueOfLand: approverData?.fairMarketValueOfLand || "",
      
    };
    console.log(approverData?.Ltv,"approverData?.LtvapproverData?.Ltv")
    // existingfinalDetail.Ltv = approverData?.Ltv || "";

    let existingfinalDetail
    if (existingfinal) {
      existingfinalDetail = existingfinal.toObject(); // Convert to plain object
      existingfinalDetail.ltv = approverData?.Ltv || ""; // Add new key
      // console.log(updatedDetail);
  }

    const responsedetail = {
      existingfinalDetail,
      responseData,
    };
    success(res, "finalSanction Form get Successfully", responsedetail);
  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
}

async function addBranchPendencyQuery(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { customerId, query } = req.body;

    if (!customerId || !query) {
      return res.status(400).json({
        errorName: "missingFields",
        message: "customerId and query are required.",
      });
    }

    const updatedDetail = await finalModel.findOneAndUpdate(
      { customerId }, // Find the document by customerId
      { $push: { "branchPendencyQuery.query": query } }, // Push the query to the nested array
      { new: true, upsert: true } // Return updated document, create if not exists
    );

    return success(
      res,
      "Branch pendency query updated successfully",
      updatedDetail?.branchPendencyQuery
    );
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

async function addBranchConditionQuery(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { customerId, query } = req.body;

    if (!customerId || !query) {
      return res.status(400).json({
        errorName: "missingFields",
        message: "customerId and query are required.",
      });
    }

    const updatedDetail = await finalModel.findOneAndUpdate(
      { customerId }, // Find the document by customerId
      { $push: { "sanctionConditionQuery.query": query } }, // Push the query to the nested array
      { new: true, upsert: true } // Return updated document, create if not exists
    );

    return success(
      res,
      "Branch condition  query updated successfully",
      updatedDetail?.sanctionConditionQuery
    );
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

async function deleteBranchConditionQuery(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { customerId, query } = req.body;

    if (!customerId || !Array.isArray(query) || query.length === 0) {
      return res.status(400).json({
        errorName: "missingFields",
        message: "customerId and a non-empty query array are required.",
      });
    }

    const updatedDetail = await finalModel.findOneAndUpdate(
      { customerId }, // Find the document by customerId
      { $pull: { "sanctionConditionQuery.query": { $in: query } } }, // Remove all matching queries
      { new: true } // Return the updated document
    );

    if (!updatedDetail) {
      return res.status(404).json({
        errorName: "notFound",
        message: "Customer not found or queries do not exist.",
      });
    }

    return success(
      res,
      "Branch condition queries deleted successfully",
      updatedDetail?.sanctionConditionQuery
    );
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}



async function addBranchDeviation(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { customerId, query } = req.body;

    if (!customerId || !query) {
      return res.status(400).json({
        errorName: "missingFields",
        message: "customerId and query are required.",
      });
    }

    const updatedDetail = await finalModel.findOneAndUpdate(
      { customerId }, // Find the document by customerId
      { $push: { "deviation.query": query } }, // Push the query to the nested array
      { new: true, upsert: true } // Return updated document, create if not exists
    );

    return success(
      res,
      "Branch deviation updated successfully",
      updatedDetail?.deviation
    );
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

async function deleteBranchDeviation(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { customerId, query } = req.query;

    if (!customerId || !query) {
      return res.status(400).json({
        errorName: "missingFields",
        message: "customerId and query are required.",
      });
    }

    // Find and update the document by removing the specified query from the nested array
    const updatedDetail = await finalModel.findOneAndUpdate(
      { customerId }, // Find the document by customerId
      { $pull: { "deviation.query": query } }, // Remove the query from the nested array
      { new: true } // Return the updated document
    );

    if (!updatedDetail) {
      return res.status(404).json({
        errorName: "notFound",
        message: "No document found for the provided customerId.",
      });
    }

    return success(
      res,
      "Branch deviation deleted successfully",
    );
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


async function addMitigates(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { customerId, query } = req.body;

    if (!customerId || !query) {
      return res.status(400).json({
        errorName: "missingFields",
        message: "customerId and query are required.",
      });
    }

    const updatedDetail = await finalModel.findOneAndUpdate(
      { customerId }, // Find the document by customerId
      { $push: { "mitigate.query": query } }, // Push the query to the nested array
      { new: true, upsert: true } // Return updated document, create if not exists
    );

    return success(
      res,
      "Branch mitigate updated successfully",
      updatedDetail?.mitigate
    );
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

// delete mitigates

async function deleteMitigates(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { customerId, query } = req.body;

    if (!customerId || !query) {
      return res.status(400).json({
        errorName: "missingFields",
        message: "customerId and query are required.",
      });
    }

    // Find and update the document by removing the specified query from the nested array
    const updatedDetail = await finalModel.findOneAndUpdate(
      { customerId }, // Find the document by customerId
      { $pull: { "mitigate.query": query } }, // Remove the query from the nested array
      { new: true } // Return the updated document
    );

    if (!updatedDetail) {
      return res.status(404).json({
        errorName: "notFound",
        message: "No document found for the provided customerId.",
      });
    }

    return success(
      res,
      "Branch mitigate deleted successfully",
    );
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

async function branchQueryList(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        const { customerId } = req.query;

    if (!customerId) {
      return res.status(400).json({
        errorName: "missingFields",
        message: "customerId and query are required.",
      });
    }

    const updatedDetail = await finalModel.findOne({ customerId }).populate('partnerId');
    const cibilData = await cibilModel.findOne({ customerId });
    const creditPdData = await creditPdModel.findOne({ customerId });

    // console.log(updatedDetail,"updatedDetail<><><>")

    const responseData = {
      sanctionConditionQuery: updatedDetail?.sanctionConditionQuery || [],
      branchPendencyQuery: updatedDetail?.branchPendencyQuery || [],
      deviation: updatedDetail?.deviation || [],
      mitigate: updatedDetail?.mitigate || [],
      department_info: updatedDetail?.department_info || [],
      cibilDetails: cibilData?.applicantCibilDetail || [],
      applicantTotalObligation: cibilData?.applicantTotalObligation || 0,
      applicantTotalObligationMonthly: cibilData?.applicantTotalObligationMonthly || 0,
      agricultureIncome: updatedDetail?.agricultureIncome || {},
      milkIncomeCalculation: updatedDetail?.milkIncomeCalculation || {},
      otherIncomeCalculation: updatedDetail?.otherIncomeCalculation || {},
      totalIncomeMonthlyCalculation: updatedDetail?.totalIncomeMonthlyCalculation || {},
      department_info: creditPdData?.department_info || [],
      agricultureRatnaIncome: updatedDetail?.agricultureRatnaIncome || {},
      milkRatnaIncomeCalculation: updatedDetail?.milkRatnaIncomeCalculation || {},
      otherBusinessIncomeCalculation: updatedDetail?.otherBusinessIncomeCalculation || {},
      expensesDetails: updatedDetail?.expensesDetails || {},
      grossCalculation: updatedDetail?.grossCalculation || {},
      netCalculation: updatedDetail?.netCalculation || {},
      agricultureIncome: updatedDetail?.agricultureIncome || {},
      milkIncomeCalculation: updatedDetail?.milkIncomeCalculation || {},
      otherIncomeCalculation: updatedDetail?.otherIncomeCalculation || {},
      totalIncomeMonthlyCalculation: updatedDetail?.totalIncomeMonthlyCalculation || {},
      Allow_Permission: updatedDetail?.Allow_Permission || true,  // Default to true
  };
  
  // Log the response data
  // console.log("Response Data:", responseData);
  // console.log("MilkincomeCalculation:", updatedDetail?.milkIncomeCalculation.details.map((item) => item));
  // console.log("totalIncomeMonthlyCalculation:", updatedDetail?.totalIncomeMonthlyCalculation.details.map((item) => item));
  // console.log("agricultureRatnaIncome:", updatedDetail?.agricultureRatnaIncome.details.map((item) => item));

   // Perform necessary checks for Allow_Permission
  // Perform necessary checks for Allow_Permission
  let Allow_Permission = true;

  // Check if cibilDetails is valid
  if (
    responseData.cibilDetails.some(
      (item) => !item.loanType || !item.loanAmount || !item.outstandingAmount || !item.emiMonthly || !item.emiAnnual
    )
  ) {
    Allow_Permission = false;
  }
  if(updatedDetail?.partnerId?.fullName == "grow money capital pvt ltd" && updatedDetail?.partnerId?.fullName == "GROW MONEY CAPITAL PVT LTD")
    {
      console.log("inside if block")
      if (!responseData.agricultureIncome.totalFormula) {
        Allow_Permission = false;
      }
    
      if (
        responseData.agricultureIncome.details &&
        responseData.agricultureIncome.details.length > 0
      ) {
        responseData.agricultureIncome.details.forEach((item) => {
          if (
            !item.district ||
            !item.season ||
            !item.AreaCultivationAcres ||
            !item.crop ||
            !item.netIncome 
          ) {
            Allow_Permission = false;
          }
        });
      }
    
      // Check if milkRatnaIncomeCalculation has required values
      if (
        !responseData.milkIncomeCalculation.calculation.averageSaleOfMilk ||
        !responseData.milkIncomeCalculation.calculation.ConsiderableMilkIncomePercentage
      ) {
        Allow_Permission = false;
      }
    
      if (
        responseData.milkIncomeCalculation.details &&
        responseData.milkIncomeCalculation.details.length > 0
      ) {
        responseData.milkIncomeCalculation.details.forEach((item) => {
          if (
            !item.months ||
            !item.saleOfMilk 
          ) {
            Allow_Permission = false;
          }
        });
      }
  
      // Check if otherBusinessIncomeCalculation has required values
      // if (
      //   !responseData.otherIncomeCalculation.grossIncome ||
      //   !responseData.otherIncomeCalculation.netIncome
      // ) {
      //   Allow_Permission = false;
      // }
    
      // Check if grossCalculation has required values
      if (
        !responseData.grossCalculation.totalAnnualIncome ||
        !responseData.grossCalculation.agricultureIncome ||
        !responseData.grossCalculation.incomeFromMilk ||
        !responseData.grossCalculation.incomeFromOtherSource
      ) {
        Allow_Permission = false;
      }
    
      // Check if netCalculation has required values
      if (
        // !responseData.netCalculation.totalNetAnnualIncome ||
        !responseData.netCalculation.grossIncome ||
        !responseData.netCalculation.netIncome 
      ) {
        Allow_Permission = false;
      }
    
    
      if(!responseData.totalIncomeMonthlyCalculation.totalFormula){
        Allow_Permission = false;
      }

      if (
        responseData.totalIncomeMonthlyCalculation.details &&
        responseData.totalIncomeMonthlyCalculation.details.length > 0
      ) {
        responseData.totalIncomeMonthlyCalculation.details.forEach((item) => {
          if (
            !item.name ||
            !item.source ||
            !item.amount 
          ) {
            Allow_Permission = false;
          }
        });
      }
    
      // Set the Allow_Permission key in responseData
      responseData.Allow_Permission = Allow_Permission;
    
      // Log Allow_Permission value
      // console.log("Allow_Permission:", Allow_Permission);
      }else {
 // Check if agricultureRatnaIncome has data
 if (!responseData.agricultureRatnaIncome.grossYearlyIncome && !responseData.agricultureRatnaIncome.grossMonthlyIncome) {
  Allow_Permission = false;
}

if (
  responseData.agricultureRatnaIncome.details &&
  responseData.agricultureRatnaIncome.details.length > 0
) {
  responseData.agricultureRatnaIncome.details.forEach((item) => {
    if (
      !item.district ||
      !item.season ||
      !item.AreaCultivationAcres ||
      !item.crop ||
      !item.netIncome
    ) {
      Allow_Permission = false;
    }
  });
}

// Check if milkRatnaIncomeCalculation has required values
if (
  !responseData.milkRatnaIncomeCalculation.grossYearlyIncome ||
  !responseData.milkRatnaIncomeCalculation.grossMonthlyIncome ||
  !responseData.milkRatnaIncomeCalculation.totalNoOfMilkGivingCatel ||
  !responseData.milkRatnaIncomeCalculation.incomeConsideredPerMilkGivingCatel
) {
  Allow_Permission = false;
}

// Check if otherBusinessIncomeCalculation has required values
// if (
//   !responseData.otherBusinessIncomeCalculation.grossBusinessYearlyIncome ||
//   !responseData.otherBusinessIncomeCalculation.grossBusinessMonthlyIncome
// ) {
//   Allow_Permission = false;
// }

// Check if grossCalculation has required values
if (
  !responseData.grossCalculation.totalAnnualIncome ||
  !responseData.grossCalculation.agricultureIncome ||
  !responseData.grossCalculation.incomeFromMilk
  // !responseData.grossCalculation.incomeFromOtherSource
) {
  Allow_Permission = false;
}

// Check if netCalculation has required values
if (
  // !responseData.netCalculation.totalNetAnnualIncome ||
  !responseData.netCalculation.totalNetAnnualExpenses ||
  !responseData.netCalculation.totalNetMonthlyIncome ||
  !responseData.netCalculation.totalNetAnnualIncome
) {
  Allow_Permission = false;
}


// if(!responseData.expensesDetails.grossExpensesFromExisting){
//   Allow_Permission = false;
// }

// Set the Allow_Permission key in responseData
responseData.Allow_Permission = Allow_Permission;

// Log Allow_Permission value
// console.log("Allow_Permission:", Allow_Permission);
      }

    return success(res, "Branch query fetch successfully", {
      sanctionConditionQuery: updatedDetail?.sanctionConditionQuery || [],
      branchPendencyQuery: updatedDetail?.branchPendencyQuery || [],
      deviation: updatedDetail?.deviation || [],
      mitigate: updatedDetail?.mitigate || [],
      department_info: updatedDetail?.department_info || [],
      cibilDetails: cibilData?.applicantCibilDetail || [],
      applicantTotalObligation: cibilData?.applicantTotalObligation || 0,
      applicantTotalObligationMonthly: cibilData?.applicantTotalObligationMonthly || 0,
      agricultureIncome: updatedDetail?.agricultureIncome || {},
      milkIncomeCalculation: updatedDetail?.milkIncomeCalculation || {},
      otherIncomeCalculation: updatedDetail?.otherIncomeCalculation || {},
      totalIncomeMonthlyCalculation: updatedDetail?.totalIncomeMonthlyCalculation || {},
      department_info: creditPdData?.department_info || [],
      agricultureRatnaIncome: updatedDetail?.agricultureRatnaIncome || {},
      milkRatnaIncomeCalculation: updatedDetail?.milkRatnaIncomeCalculation || {},
      otherBusinessIncomeCalculation: updatedDetail?.otherBusinessIncomeCalculation || {},
      expensesDetails: updatedDetail?.expensesDetails || {},
      grossCalculation: updatedDetail?.grossCalculation || {},
      netCalculation: updatedDetail?.netCalculation || {},
      agricultureIncome: updatedDetail?.agricultureIncome || {},
      milkIncomeCalculation: updatedDetail?.milkIncomeCalculation || {},
      otherIncomeCalculation: updatedDetail?.otherIncomeCalculation || {},
      totalIncomeMonthlyCalculation: updatedDetail?.totalIncomeMonthlyCalculation || {},
      Allow_Permission: Allow_Permission,  // Default to true
    });

  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

// async function departmentInfo(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return badRequest(res, errors.array());
//     }

//     const { customerId, department_info } = req.body;
//     const { departmentIds } = req.query; // Get departmentIds from query params (comma-separated)

//     if (!department_info) {
//       return badRequest(res, "customerId and department_info are required.");
//     }

//     // Validate departmentIds if provided
//     const departmentIdArray = departmentIds ? departmentIds.split(",") : null;

//     // Find the existing customer document
//     let customer = await finalModel.findOne({ customerId });

//     if (!customer) {
//       // Create a new customer document if not found
//       customer = await finalModel.create({
//         customerId,
//         department_info,
//       });
//       return success(
//         res,
//         "Department info added successfully",
//         customer.department_info
//       );
//     }

//     if (departmentIdArray && departmentIdArray.length > 0) {
//       // Update multiple departments if departmentIds are provided
//       let departmentsUpdated = false;

//       departmentIdArray.forEach((deptId) => {
//         customer.department_info.forEach((existingDept) => {
//           if (existingDept._id.toString() === deptId) {
//             console.log("Updating existing department info with id: " + deptId);

//             // Find corresponding update data for this department
//             const updateData = department_info.find(
//               (dept) => dept._id && dept._id.toString() === deptId
//             );

//             if (updateData) {
//               existingDept.dependent_Name =
//                 updateData.dependent_Name || existingDept.dependent_Name;
//               existingDept.age = updateData.age || existingDept.age;
//               existingDept.Relationship =
//                 updateData.Relationship || existingDept.Relationship;
//               existingDept.Annual_Income =
//                 updateData.Annual_Income || existingDept.Annual_Income;
//               existingDept.Occupation =
//                 updateData.Occupation || existingDept.Occupation;
//               existingDept.Institution_of_studen =
//                 updateData.Institution_of_studen ||
//                 existingDept.Institution_of_studen;
//               existingDept.Name_of_Organization =
//                 updateData.Name_of_Organization ||
//                 existingDept.Name_of_Organization;
//               existingDept.Designation =
//                 updateData.Designation || existingDept.Designation;
//               existingDept.Date_of_joining =
//                 updateData.Date_of_joining || existingDept.Date_of_joining;

//               departmentsUpdated = true;
//             }
//           }
//         });
//       });

//       if (!departmentsUpdated) {
//         return badRequest(
//           res,
//           "No matching department info found for the provided departmentIds"
//         );
//       }
//     } else {
//       // Add new department info if departmentIds are not provided
//       console.log("Adding new department info");
//       department_info.forEach((newDept) => {
//         customer.department_info.push(newDept);
//       });
//     }

//     // Save the updated customer document
//     const updatedCustomer = await customer.save();

//     return success(
//       res,
//       "Department info updated successfully",
//       updatedCustomer.department_info
//     );
//   } catch (error) {
//     console.error(error);
//     return unknownError(res, error);
//   }
// }


// async function departmentInfo(req, res) {
//     try {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return badRequest(res, errors.array());
//         }

//         const { customerId, familyMember } = req.body;

//         if (!customerId || !familyMember) {
//             return badRequest(res, "customerId and familyMember are required.");
//         }

//         let customer = await creditPdModel.findOne({ customerId });

//         if (!customer) {
//             console.log("Creating new customer document");

//             customer = await creditPdModel.create({
//                 customerId,
//                 familyMember
//             });
//             return success(res, "Family member info created successfully", customer.familyMember);
//         }

//         // Process each family member
//         for (const member of familyMember) {
//             // If _id is empty, omit it completely or set it to null for new data
//             if (member._id === "") {
//                 // Omitting _id so MongoDB generates one automatically
//                 const newMember = { ...member };
//                 delete newMember._id;  // Remove _id to ensure it is treated as a new document
//                 customer.familyMember.push(newMember);
//             } else {
//                 // Find the existing family member by _id
//                 const existingMember = customer.familyMember.find(
//                     (existing) => existing._id.toString() === member._id.toString()  // Compare _id as string
//                 );

//                 if (existingMember) {
//                     // Update the existing family member info if it exists
//                     existingMember.name = member.name || existingMember.name;
//                     existingMember.samagraMemberId = member.samagraMemberId || existingMember.samagraMemberId;
//                     existingMember.age = member.age || existingMember.age;
//                     existingMember.gender = member.gender || existingMember.gender;
//                     existingMember.relation = member.relation || existingMember.relation;
//                     existingMember.dependent = member.dependent || existingMember.dependent;
//                     existingMember.occupationType = member.occupationType || existingMember.occupationType;
                    
//                     // Handle nested occupationTypeDetails
//                     existingMember.occupationTypeDetails.institutionName = member.occupationTypeDetails.institutionName || existingMember.occupationTypeDetails.institutionName;
//                     existingMember.occupationTypeDetails.nameOfOrganization = member.occupationTypeDetails.nameOfOrganization || existingMember.occupationTypeDetails.nameOfOrganization;
//                     existingMember.occupationTypeDetails.designation = member.occupationTypeDetails.designation || existingMember.occupationTypeDetails.designation;
//                     existingMember.occupationTypeDetails.dateOfJoining = member.occupationTypeDetails.dateOfJoining || existingMember.occupationTypeDetails.dateOfJoining;
//                 } else {
//                     // If no existing member, push it as new
//                     customer.familyMember.push(member);
//                 }
//             }
//         }

//         // Save the updated customer document
//         const updatedCustomer = await customer.save();

//         return success(res, "Family member info updated/added successfully", updatedCustomer.familyMember);
//     } catch (error) {
//         console.error(error);
//         return unknownError(res, error);
//     }
// }


// async function departmentInfo(req, res) {
//   try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//           return badRequest(res, errors.array());
//       }

//       const { customerId, department_info } = req.body;

//       if (!customerId || !Array.isArray(department_info)) {
//           return badRequest(res, "Valid customerId and department_info array are required.");
//       }

//       let customer = await creditPdModel.findOne({ customerId });

//       if (!customer) {
//           console.log("Creating new customer document");

//           customer = await creditPdModel.create({
//               customerId,
//               department_info
//           });

//           return success(res, "Department info created successfully", customer.department_info);
//       }

//       // Process department_info array
//       for (const info of department_info) {
//           if (!info._id || info._id === "") {
//               // Add new entry
//               const newInfo = { ...info };
//               delete newInfo._id;
//               customer.department_info.push(newInfo);
//           } else {
//               // Find existing entry by _id
//               const existingInfo = customer.department_info.find(
//                   (existing) => existing._id.toString() === info._id.toString()
//               );

//               if (existingInfo) {
//                   // Update fields
//                   Object.assign(existingInfo, {
//                       department_Name: info.department_Name || existingInfo.department_Name,
//                       age: info.age || existingInfo.age,
//                       Relationship: info.Relationship || existingInfo.Relationship,
//                       Annual_Income: info.Annual_Income || existingInfo.Annual_Income,
//                       Occupation: info.Occupation || existingInfo.Occupation,
//                       Institution_of_studen: info.Institution_of_studen || existingInfo.Institution_of_studen,
//                       Name_of_Organization: info.Name_of_Organization || existingInfo.Name_of_Organization,
//                       Designation: info.Designation || existingInfo.Designation,
//                       Date_of_Joining: info.Date_of_Joining || existingInfo.Date_of_Joining,
//                   });
//               } else {
//                   // If no existing entry, add as new
//                   customer.department_info.push(info);
//               }
//           }
//       }

//       // Save updated customer document
//       const updatedCustomer = await customer.save();

//       return success(res, "Department info updated/added successfully", updatedCustomer.department_info);
//   } catch (error) {
//       console.error("Error managing department info:", error);
//       return unknownError(res, error);
//   }
// }


// ----- Department Info Deletion -----
async function departmentInfo(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return badRequest(res, errors.array());
    }

    const { customerId, department_info } = req.body;

    if (!customerId || !Array.isArray(department_info)) {
      return badRequest(res, "Valid customerId and department_info array are required.");
    }



    let customer = await creditPdModel.findOne({ customerId });
    if (!customer) {
      return badRequest(res, "Customer not found.");
    }

    // Update the data //

    const updatedata = await creditPdModel.findOneAndUpdate({
      customerId,
    }, {
      $set: {
        department_info
      }
    }, {
      new: true
    })

       if (updatedata?.department_info?.length > 0) {
        await processModel.findOneAndUpdate(
          { customerId },
          { $set: {
            dependedDetailFormStart: true,
            dependedDetailFormComplete: true
          }
           },
          { new: true }
        );
       }

    return success(res, "Department info updated successfully", updatedata.department_info);

  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}


async function deleteDepartmentInfo(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return badRequest(res, errors.array());
        }

        const { customerId } = req.body;
        const { departmentIds } = req.query; // Get departmentIds from query params (comma-separated)

        // Validate inputs
        if (!customerId) {
            return badRequest(res, "customerId is required.");
        }
        if (!departmentIds) {
            return badRequest(res, "departmentIds are required in the query.");
        }

        // Split the departmentIds into an array
        const departmentIdArray = departmentIds.split(",");

        // Find the existing customer document
        let customer = await creditPdModel.findOne({ customerId });

        if (!customer) {
            return badRequest(res, "Customer not found.");
        }

        // Filter out departments that match the provided departmentIds
        const originalLength = customer.department_info.length;
        customer.department_info = customer.department_info.filter(
            (dept) => !departmentIdArray.includes(dept._id.toString())
        );

        // Check if any department was removed
        if (originalLength === customer.department_info.length) {
            return badRequest(res, "No matching dependents found for the provided dependentsIds.");
        }

        // Save the updated customer document
        await customer.save();

        return success(res, "Dependent info deleted successfully");
    } catch (error) {
        console.error(error);
        return unknownError(res, error);
    }
}

// total income
const incomeDetailsUpdate = async (req, res) => {
  try {
    const {
      customerId,
      agricultureIncome,
      milkIncomeCalculation,
      otherIncomeCalculation,
      totalIncomeMonthlyCalculation,
      foir
    } = req.body;
    const finalData = await finalModel.findOneAndUpdate(
      {
        customerId,
      },
      {
        $set: {
          agricultureIncome,
          milkIncomeCalculation,
          otherIncomeCalculation,
          totalIncomeMonthlyCalculation,
          foir
        },
      },
      {
        new: true,
      }
    );

    success(res, "Income details updated successfully", {
      data: finalData,
    });
    await processModel.findOneAndUpdate(
      { customerId },
      { $set: {
        camDetail:true
      } },
      { new: true }
  );
  await finalApprovalSheet(customerId)
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
};

const partnerPolicyList = async (req,res) => {
  try{
     const { customerId } = req.query
    const data = await finalModel.findOne({customerId})
     const policyData = await finalEligibilityModel.findOne({ partnerId : data?.partnerId})
     return success(res, "Income details updated successfully", {
      data: policyData,
    });
  }catch(error){
    console.log(error);
    return unknownError(res, error);
  }
}

const queryCheckForSanction = async (req,res) => {
  try{
    const { customerId } = req.query
    const partnerSanctionData = await finalModel.findOne({ customerId }) 
    console.log(partnerSanctionData,"partnerSanctionData")
    if(!partnerSanctionData.partnerId) {
       return badRequest(res, "Please select partner")
    }
    const sanctionQuery = await lendersModel.findOne({_id: partnerSanctionData.partnerId})
    success(res, "Partner sanction Detail Retrieved", sanctionQuery?.addSanction || []);
  } catch (error) {
      console.log(error);
      unknownError(res, error);
  }
}

const addSanctionQuery = async (req,res) => {
  try{
    const { customerId, partnerSanctionQuery } = req.query
    const partnerSanctionData = await finalModel.findOne({ customerId }) 
    console.log(partnerSanctionData,"partnerSanctionData")

    if(!partnerSanctionData) {
       return badRequest(res, "customerID not found")
    }

    if(customerId && partnerSanctionQuery){
      const sanctionData = await finalModel.findOneAndUpdate(
        {customerId},
        {
        $set:{
          partnerSanctionQuery: JSON.parse(partnerSanctionQuery)
        }
       },
       {
        new: true
       }
      )
      success(res, "partner sanction query updated", sanctionData?.partnerSanctionQuery || []);
    }
    else{
    success(res, "Partner sanction Detail Retrieved", partnerSanctionData?.partnerSanctionQuery || []);
     
    }
  } catch (error) {
      console.log(error);
      unknownError(res, error);
  }
}

const disbursementQuery = async (req,res) => {
  try{
    const { customerId } = req.query
    const partnerSanctionData = await finalModel.findOne({ customerId }) 
    console.log(partnerSanctionData,"partnerSanctionData")
    if(!partnerSanctionData.partnerId) {
       return badRequest(res, "Please select partner")
    }
    const sanctionQuery = await lendersModel.findOne({_id: partnerSanctionData.partnerId})
    success(res, "Partner disbursement Detail Retrieved", sanctionQuery?.addDisbursement || []);
  } catch (error) {
      console.log(error);
      unknownError(res, error);
  }
}

const partnerDisbursementQuery = async (req,res) => {
  try{
    const { customerId, partnerDisbursementQuery } = req.query
    const partnerDisbursementData = await finalModel.findOne({ customerId }) 
    console.log(partnerDisbursementData,"partnerDisbursementData")

    if(!partnerDisbursementData) {
       return badRequest(res, "customerID not found")
    }

    if(customerId && partnerDisbursementQuery){
      const DisbursementData = await finalModel.findOneAndUpdate(
        {customerId},
        {
        $set:{
          partnerDisbursementQuery: JSON.parse(partnerDisbursementQuery)
        }
       },
       {
        new: true
       }
      )
      success(res, "partner Disbursement query updated", DisbursementData?.partnerDisbursementQuery || []);
    }
    else{
    success(res, "Partner Disbursement Detail Retrieved", partnerDisbursementData?.partnerDisbursementQuery || []);
     
    }
  } catch (error) {
      console.log(error);
      unknownError(res, error);
  }
}

const addCamDetails = async (req,res) => {
  try{
    const { customerId, agricultureRatnaIncome,milkRatnaIncomeCalculation,otherBusinessIncomeCalculation,expensesDetails,grossCalculation,netCalculation,foir,
      agricultureIncomeNew,milkIncomeCalculationNew,otherBusinessIncomeCalculationNew
     } = req.body
   
    console.log(req.body,"req.body")
    const partnerDisbursementData = await finalModel.findOne({ customerId }) 

    if(!partnerDisbursementData) {
       return badRequest(res, "customerID not found")
    }
      const camData = await finalModel.findOneAndUpdate(
        {customerId},
        {
        $set:{
          agricultureRatnaIncome,
          milkRatnaIncomeCalculation,
          otherBusinessIncomeCalculation,
          expensesDetails,
          grossCalculation,
          netCalculation,
          foir,
          // agricultureIncomeNew,
          milkIncomeCalculationNew ,
          // otherBusinessIncomeCalculationNew
        }
       },
       {
        new: true
       }
      )
      success(res, "cam report details added successfully", camData || {});

      const fileStageForms = await processModel.findOneAndUpdate(
        { customerId: req.body.customerId },  
        { $set: { 'fileStageForms.camDetail': true } },
        { new: true }  
    );
  } catch (error) {
      console.log(error);
      unknownError(res, error);
  }
}

module.exports = {
  finalSanctionCreate,
  finalSanctionGET,
  addBranchPendencyQuery,
  addBranchConditionQuery,
  branchQueryList,
  addBranchDeviation,
  addMitigates,
  departmentInfo,
  deleteDepartmentInfo,
  incomeDetailsUpdate,
  partnerPolicyList,
  deleteBranchDeviation,
  deleteMitigates,
  queryCheckForSanction,
  addSanctionQuery,
  disbursementQuery,
  partnerDisbursementQuery,
  addCamDetails,
  deleteBranchConditionQuery
};
