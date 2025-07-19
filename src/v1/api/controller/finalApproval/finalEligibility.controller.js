const {
  success,
  unknownError,
  serverValidation,
  badRequest,
  notFound,
  parseJwt,
} = require("../../../../../globalHelper/response.globalHelper");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const finalEligibilityModel = require("../../model/finalApproval/finalEligibility");
const customerModel = require("../../model/customer.model");
const applicantModel = require("../../model/applicant.model.js");
const cibilModel = require("../../model/cibilDetail.model.js");
const coApplicantModel = require("../../model/co-Applicant.model");
const technicalApproveFormModel = require("../../model/branchPendency/approverTechnicalFormModel.js");
const agricultureModel = require("../../model/branchPendency/agricultureIncomeModel.js");
const guarantorModel = require("../../model/guarantorDetail.model");
const milkIncomeModel = require("../../model/branchPendency/milkIncomeModel.js");
const creditPdModel = require("../../model/credit.Pd.model.js");
const legalReportModel = require("../../model/branchPendency/approveLegalForm.model.js");
const tvrModel = require("../../model/fileProcess/tvr.model.js");
const finalSanctionModel = require("../../model/finalSanction/finalSnction.model.js")
const lenderModel = require("../../model/lender.model.js")
const finalModel = require('../../model/finalSanction/finalSnction.model');
const approveTechnicalModel = require('../../model/branchPendency/approverTechnicalFormModel.js')


//credit policy
const addFinalEligibility = async (req, res) => {
  try {
    const { policy, partnerId } = req.body;

    const existingDocument = await finalEligibilityModel.findOne({ partnerId });

    // if (existingDocument) {
    //   existingDocument.policy.push(...policy);
    //   await existingDocument.save();
    //   return success(res, "Policy updated successfully", { data: existingDocument });
    // } else {
      const newDocument = await finalEligibilityModel.create({ policy, partnerId });
      return success(res, "FinalEligibility added successfully", { data: newDocument });
    // }
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
};


const finalEligibilityList = async (req, res) => {
  try {
    const { partnerId } = req.query
    const data = await finalEligibilityModel.find({partnerId}).select('name policy valueRange');
    return success(res, "finalEligibility list", {
      data: data,
    });
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
};

// const checkCreditPolicy = async (req, res) => {
//   try {
//       const { customerId } = req.query;

//       // Fetch necessary data from the database
//       const data = await customerModel.findOne({ _id: customerId });
//       const appData = await applicantModel.findOne({ customerId });
//       const cibilData = await cibilModel.findOne({ customerId }).populate("customerId");
//       const tvrData = await tvrModel.findOne({ customerId });
//       const coAppData = await coApplicantModel.find({ customerId });
//       const technicalData = await technicalApproveFormModel.findOne({ customerId });
//       const agricultureData = await agricultureModel.findOne({ customerId });
//       const gtrData = await guarantorModel.findOne({ customerId });
//       const milkIncomeData = await milkIncomeModel.findOne({ customerId });
//       const creditPdData = await creditPdModel.findOne({ customerId });
//       const legalReportDetails = await legalReportModel.findOne({ customerId });
//       const sanctionPendencyDetails = await finalSanctionModel.findOne({ customerId })

//       const responseFileds = {
//           ['Loan Amount']: data?.loanAmount || "",
//           ['Tenure']: data?.tenure || "",
//           ['Age of Applicant']: appData?.age || "",
//           ['Age of Property owner']: appData?.age || "",
//           ['CIBIL Score']: cibilData?.applicantCibilScore || "",
//           ['Minimum  Monthly Family Income']: tvrData?.employmentAndIncomeDetails?.monthlyIncome || "",
//           ['FOIR']: sanctionPendencyDetails?.foir || "",
//           // ['Name of Co-Borrower 1']: coAppData[0]?.fullName || "",
//           ['Age of Co-Borrower 1']: coAppData[0]?.age || "",
//           ['CIBIL Score Co-Borrower 1']: cibilData?.coApplicantData[0]?.coApplicantCibilScore || "",
//           // ['Name of Co-Borrower 2']: coAppData[1]?.fullName || "",
//           ['Age of Co-Borrower 2']: coAppData[1]?.age || "",
//           ['CIBIL Score Co-Borrower 2']: cibilData?.coApplicantData[1]?.coApplicantCibilScore || "",
//           ['Property Area (Sq. Feet)']: technicalData?.totalLandArea || "",
//           ['LTV (%)']: sanctionPendencyDetails?.ltv || "",
//           // ['Legal']: legalReportDetails ? "yes" : "no",
//           // ['Technical']: technicalData ? "yes" : "no",
//           ['Minimum Agriculture Land (Acre)']: agricultureData?.availableLandInAcre || "",
//           // ['Financial Guarantor']: gtrData ? "yes" : "no",
//           ['Income from Milk']: milkIncomeData?.monthlyIncomeMilkBuisness || "",
//           // ['FI/FCU/PD report']: creditPdData?.pdfLink ? "yes" : "no"
//       };

//       // Convert the responseFileds object into an array of key-value pairs
//       const responseFieldsArray = Object.entries(responseFileds).map(([name, actualValue]) => ({ name, actualValue }));

//       // Compare responseFileds with creditPolicy
//       const results = await Promise.all(
//         responseFieldsArray.map(async ({ name, actualValue }) => {
//               // Retrieve the corresponding value from responseFileds
//               const fieldValue = actualValue || "";

//               const matchedData = await finalEligibilityModel.findOne({ name });
//               if (!matchedData) {
//                   return {
//                       name,
//                       actualValue: fieldValue,
//                       "PASS/FAIL": "FAIL",
//                       IsNameMatch: false,
//                   };
//               }

//               const actualValueNumber = parseFloat(fieldValue);
//               const { min, max } = matchedData.valueRange;

//               // Special handling for CIBIL-related names
//               if (name.includes("CIBIL")) {
//                   const isCibilValid =
//                       (actualValueNumber >= -1 && actualValueNumber <= 5) || actualValueNumber > 675;

//                   return {
//                       name,
//                       actualValue: fieldValue,
//                       "PASS/FAIL": isCibilValid ? "PASS" : "FAIL",
//                       IsNameMatch: true,
//                       policy: matchedData.policy,
//                   };
//               }

//               // // If fieldValue is explicitly "No", return FAIL
//               // if (fieldValue === "No" || fieldValue === "no") {
//               //     return {
//               //         name,
//               //         actualValue: fieldValue,
//               //         "PASS/FAIL": "FAIL",
//               //         IsNameMatch: true,
//               //         policy: matchedData.policy,
//               //     };
//               // }

//               // Condition for mandatory fields (Yes/No check)
//               if (min === null && max === null) {
//                   return {
//                       name,
//                       actualValue: fieldValue,
//                       "PASS/FAIL": "",
//                       IsNameMatch: true,
//                       policy: matchedData.policy,
//                   };
//               }

//               // Check for number range validation
//               const isValid =
//                   !isNaN(actualValueNumber) &&
//                   (min === null || actualValueNumber >= min) &&
//                   (max === null || actualValueNumber <= max);

//               return {
//                   name,
//                   actualValue: fieldValue,
//                   "PASS/FAIL": isValid ? "PASS" : "FAIL",
//                   IsNameMatch: true,
//                   policy: matchedData.policy,
//               };
//           })
//       );

//       return success(res, "Credit policy check completed", results);
//   } catch (error) {
//       console.log(error);
//       return unknownError(res, error);
//   }
// };

const formatPolicyValue = (fieldName, policy) => {
  if (!policy) return "N/A";
  const { min, max } = policy;

  switch (fieldName) {
    case "loanAmount":
      return `Rs. ${min} to ${max} lakhs`;
    case "tenure":
      return `${min} to ${max} Months`;
    case "ageOfApplicant":
    case "ageOfCoBorrower":
      return `${min} to ${max} Years`;
    case "ageOfPropertyOwner":
      return `${min} Years to ${max} Years`;
    case "cibilScore":
    case "cibilScoreCoBorrower":
      return `<${min} or >${max}`;
    case "minimumMonthlyFamilyIncome":
      return `Greater than Rs. ${min.toLocaleString()}/-`;
    case "foir":
      return `Up to ${min}%`;
    case "propertyArea":
      return `Greater than ${min} Sq.ft.`;
    case "ltv":
      return `Up to ${min}% of Market Value`;
    case "minimumAgricultureLand":
      return `Greater than ${min} Acre`;
    default:
      return `${min} to ${max}`;
  }
};

const checkCreditPolicy = async (req, res) => {
  try {
    const { customerId } = req.query;

    // Fetch necessary data from the database
    const data = await customerModel.findOne({ _id: customerId });
    if(!data){
      return notFound(res, "customerId Not Found")
    }
    const appData = await applicantModel.findOne({ customerId });
    const cibilData = await cibilModel.findOne({ customerId }).populate("customerId");
    const tvrData = await tvrModel.findOne({ customerId });
    const coAppData = await coApplicantModel.find({ customerId });
    const technicalData = await technicalApproveFormModel.findOne({ customerId });
    const agricultureData = await agricultureModel.findOne({ customerId });
    const milkIncomeData = await milkIncomeModel.findOne({ customerId });
    const creditPdData = await creditPdModel.findOne({ customerId });
    const sanctionPendencyDetails = await finalSanctionModel.findOne({ customerId });
    const finalEligibilityDetails = await finalEligibilityModel.find().populate("partnerId");
    const partnerData = await finalModel.findOne({ customerId }).populate('partnerId');
    const guarantorDetails = await guarantorModel.findOne({ customerId });
    const approveTechnicalDetails = await approveTechnicalModel.findOne({ customerId })
    const lenderData = await lenderModel.find()
    // Log fetched data for debugging
    // console.log("Fetched finalEligibilityDetails:", lenderData);

    let selectionData = partnerData?.pdfSelection || "acg";
    console.log(selectionData)
    let monthlyIncome = ""; // Initialize monthlyIncome
    let aggreLand = 0;
    function getRoundedEMI(emi) {
      if (emi === undefined || emi === null) return ""; // Return empty string for null or undefined
      return Math.round(emi); // Round off the EMI value to the nearest integer
    }
    if (partnerData?.partnerId?.fullName === 'grow money capital pvt ltd' || partnerData?.partnerId?.fullName === 'GROW MONEY CAPITAL PVT LTD') {
      monthlyIncome = getRoundedEMI(partnerData?.totalIncomeMonthlyCalculation?.totalFormula) || "";
     // Safely calculate the total of AreaCultivationAcres
  
     aggreLand = partnerData?.agricultureIncome?.details[0]?.AreaCultivationAcres;
     
  }
     else {
      monthlyIncome = getRoundedEMI(partnerData?.netCalculation?.totalNetMonthlyIncome) || "";
      aggreLand = partnerData?.agricultureRatnaIncome?.details[0]?.AreaCultivationAcres;

    }
    
    if (selectionData == "ac") {
      const responseFields = [];

      // Define the base fields with matching names
      const baseFields = {
        "Loan Amount": { value: partnerData?.finalLoanAmount || "", key: "loanAmount" },
        "Tenure": { value: partnerData?.tenureInMonth || "", key: "tenure" },
        "Age of Applicant": { value: appData?.age || "", key: "ageOfApplicant" },
        "Age of Property owner": { value: appData?.age || "", key: "ageOfPropertyOwner" },
        "CIBIL Score": { value: cibilData?.applicantCibilScore || "", key: "cibilScore" },
        "Minimum Monthly Family Income": { value: monthlyIncome || "", key: "minimumMonthlyFamilyIncome" },
        "FOIR": { value: `${Math.round(partnerData?.foir)}%` || "", key: "foir" },
        "Age of Co-Borrower 1": { value: coAppData[0]?.age || "", key: "ageOfCoBorrower" },
        "CIBIL Score Co-Borrower 1": { value: cibilData?.coApplicantData[0]?.coApplicantCibilScore || "", key: "cibilScoreCoBorrower" },
        "Property Area (Sq. Feet)": { value: technicalData?.totalLandArea || "", key: "propertyArea" },
        "LTV (%)": { value: approveTechnicalDetails?.Ltv || "", key: "ltv" },
        "Minimum Agriculture Land (Acre)": { value: aggreLand || "", key: "minimumAgricultureLand" }
      };
  
      // Iterate over each base field to construct the response
      Object.entries(baseFields).forEach(([displayName, { value, key }]) => {
        const fieldData = {
          [displayName]: value
        };
  
        // Append lender-specific policies for the current field
        lenderData.forEach((lender) => {
          const policyValue = lender.policy[key];
          fieldData[lender.userName] = policyValue ? formatPolicyValue(key, policyValue) : "N/A";
        });
  
        responseFields.push(fieldData);
      });
  
      return success(res, "Credit policy check completed", responseFields);
    }

    if (selectionData == "acc") {
      const responseFields = [];
    
      // Define the base fields with matching names
      const baseFields = {
        "Loan Amount": { value: partnerData?.finalLoanAmount || "", key: "loanAmount" },
        "Tenure": { value: partnerData?.tenureInMonth || "", key: "tenure" },
        "Age of Applicant": { value: appData?.age || "", key: "ageOfApplicant" },
        "Age of Property owner": { value: appData?.age || "", key: "ageOfPropertyOwner" },
        "CIBIL Score": { value: cibilData?.applicantCibilScore || "", key: "cibilScore" },
        "Minimum Monthly Family Income": { value: monthlyIncome || "", key: "minimumMonthlyFamilyIncome" },
        "FOIR": { value: `${Math.round(partnerData?.foir)}%` || "", key: "foir" },
        "Age of Co-Borrower 1": { value: coAppData[0]?.age || "", key: "ageOfCoBorrower" },
        "CIBIL Score Co-Borrower 1": { value: cibilData?.coApplicantData[0]?.coApplicantCibilScore || "", key: "cibilScoreCoBorrower" },
        "Age of Co-Borrower 2": { value: coAppData[1]?.age || "", key: "ageOfCoBorrower" },
        "CIBIL Score Co-Borrower 2": { value: cibilData?.coApplicantData[1]?.coApplicantCibilScore || "", key: "cibilScoreCoBorrower" },
        "Property Area (Sq. Feet)": { value: technicalData?.totalLandArea || "", key: "propertyArea" },
        "LTV (%)": { value: approveTechnicalDetails?.Ltv || "", key: "ltv" },
        "Minimum Agriculture Land (Acre)": { value: aggreLand || "", key: "minimumAgricultureLand" }
      };
    
      // Iterate over each base field to construct the response
      Object.entries(baseFields).forEach(([displayName, { value, key }]) => {
        const fieldData = {
          [displayName]: value
        };
    
        // Append lender-specific policies for the current field
        lenderData.forEach((lender) => {
          const policyValue = lender.policy[key];
          fieldData[lender.userName] = policyValue ? formatPolicyValue(key, policyValue) : "N/A";
        });
    
        responseFields.push(fieldData);
      });
    
      return success(res, "Credit policy check completed", responseFields);
    }

    if (selectionData === "acg") {
      const responseFields = [];
    
      // Define the base fields with matching names
      const baseFields = {
        "Loan Amount": { value: partnerData?.finalLoanAmount || "", key: "loanAmount" },
        "Tenure": { value: partnerData?.tenureInMonth || "", key: "tenure" },
        "Age of Applicant": { value: appData?.age || "", key: "ageOfApplicant" },
        "Age of Property owner": { value: appData?.age || "", key: "ageOfPropertyOwner" },
        "CIBIL Score": { value: cibilData?.applicantCibilScore || "", key: "cibilScore" },
        "Minimum Monthly Family Income": { value: monthlyIncome || "", key: "minimumMonthlyFamilyIncome" },
        "FOIR": { value: `${Math.round(partnerData?.foir)}%` || "", key: "foir" },
        "Age of Co-Borrower 1": { value: coAppData[0]?.age || "", key: "ageOfCoBorrower" },
        "CIBIL Score Co-Borrower 1": { value: cibilData?.coApplicantData[0]?.coApplicantCibilScore || "", key: "cibilScoreCoBorrower" },
        "Age of Guarantor": { value: guarantorDetails?.age || "", key: "ageOfCoBorrower" }, // Using same policy as co-borrower
        "CIBIL Score Guarantor": { value: cibilData?.guarantorCibilScore || "", key: "cibilScoreCoBorrower" }, // Using same policy as co-borrower
        "Property Area (Sq. Feet)": { value: technicalData?.totalLandArea || "", key: "propertyArea" },
        "LTV (%)": { value: approveTechnicalDetails?.Ltv || "", key: "ltv" },
        "Minimum Agriculture Land (Acre)": { value: aggreLand || "", key: "minimumAgricultureLand" }
      };
    
      // Iterate over each base field to construct the response
      Object.entries(baseFields).forEach(([displayName, { value, key }]) => {
        const fieldData = {
          [displayName]: value
        };
    
        // Append lender-specific policies for the current field
        lenderData.forEach((lender) => {
          const policyValue = lender.policy[key];
          fieldData[lender.userName] = policyValue ? formatPolicyValue(key, policyValue) : "N/A";
        });
    
        responseFields.push(fieldData);
      });
    
      return success(res, "Credit policy check completed", responseFields);
    }


    if (selectionData == "accg") {
      const responseFields = [];
    
      // Define the base fields with matching names
      const baseFields = {
        "Loan Amount": { value: partnerData?.finalLoanAmount || "", key: "loanAmount" },
        "Tenure": { value: partnerData?.tenureInMonth || "", key: "tenure" },
        "Age of Applicant": { value: appData?.age || "", key: "ageOfApplicant" },
        "Age of Property owner": { value: appData?.age || "", key: "ageOfPropertyOwner" },
        "CIBIL Score": { value: cibilData?.applicantCibilScore || "", key: "cibilScore" },
        "Minimum Monthly Family Income": { value: monthlyIncome || "", key: "minimumMonthlyFamilyIncome" },
        "FOIR": { value: `${Math.round(partnerData?.foir)}%` || "", key: "foir" },
        "Age of Co-Borrower 1": { value: coAppData[0]?.age || "", key: "ageOfCoBorrower" },
        "CIBIL Score Co-Borrower 1": { value: cibilData?.coApplicantData[0]?.coApplicantCibilScore || "", key: "cibilScoreCoBorrower" },
        "Age of Co-Borrower 2": { value: coAppData[1]?.age || "", key: "ageOfCoBorrower" },
        "CIBIL Score Co-Borrower 2": { value: cibilData?.coApplicantData[1]?.coApplicantCibilScore || "", key: "cibilScoreCoBorrower" },
        "Age of Guarantor": { value: guarantorDetails?.age || "", key: "ageOfCoBorrower" }, // Using same policy as co-borrower
        "CIBIL Score Guarantor": { value: cibilData?.guarantorCibilScore || "", key: "cibilScoreCoBorrower" }, // Using same policy as co-borrower
        "Property Area (Sq. Feet)": { value: technicalData?.totalLandArea || "", key: "propertyArea" },
        "LTV (%)": { value: approveTechnicalDetails?.Ltv || "", key: "ltv" },
        "Minimum Agriculture Land (Acre)": { value: aggreLand || "", key: "minimumAgricultureLand" }
      };
    
      // Iterate over each base field to construct the response
      Object.entries(baseFields).forEach(([displayName, { value, key }]) => {
        const fieldData = {
          [displayName]: value
        };
    
        // Append lender-specific policies for the current field
        lenderData.forEach((lender) => {
          const policyValue = lender.policy[key];
          fieldData[lender.userName] = policyValue ? formatPolicyValue(key, policyValue) : "N/A";
        });
    
        responseFields.push(fieldData);
      });
    
      return success(res, "Credit policy check completed", responseFields);
    }
    
  } catch (error) {
    console.error("Error in checkCreditPolicy:", error);
    return unknownError(res, error.message);
  }
};


const  partnerPolicyCheck = async (req, res) => {
  try {
    const { customerId } = req.query;

    // Fetch necessary data from the database
    const data = await customerModel.findOne({ _id: customerId });
    if(!data){
      return notFound(res, "customerId Not Found")
    }
    const appData = await applicantModel.findOne({ customerId });
    const cibilData = await cibilModel.findOne({ customerId }).populate("customerId");
    const tvrData = await tvrModel.findOne({ customerId });
    const coAppData = await coApplicantModel.find({ customerId });
    const technicalData = await technicalApproveFormModel.findOne({ customerId });
    const agricultureData = await agricultureModel.findOne({ customerId });
    const milkIncomeData = await milkIncomeModel.findOne({ customerId });
    const creditPdData = await creditPdModel.findOne({ customerId });
    const sanctionPendencyDetails = await finalSanctionModel.findOne({ customerId });
    const finalEligibilityDetails = await finalEligibilityModel.find().populate("partnerId");
    const partnerData = await finalModel.findOne({ customerId }).populate('partnerId');
    const guarantorDetails = await guarantorModel.findOne({ customerId });
    const approveTechnicalDetails = await approveTechnicalModel.findOne({ customerId })
    const lenderData = await lenderModel.find()
    // Log fetched data for debuggin  g
    console.log(lenderData ,"Fetched finalEligibilityDetails:");

    let selectionData = partnerData?.pdfSelection || "acg";
    // console.log(selectionData,"selectionData")
    let monthlyIncome = ""; // Initialize monthlyIncome
    let aggreLand = 0;
    function getRoundedEMI(emi) {
      if (emi === undefined || emi === null) return ""; // Return empty string for null or undefined
      return Math.round(emi); // Round off the EMI value to the nearest integer
    }
    if (partnerData?.partnerId?.fullName === 'grow money capital pvt ltd' || partnerData?.partnerId?.fullName === 'GROW MONEY CAPITAL PVT LTD') {
      monthlyIncome = getRoundedEMI(partnerData?.totalIncomeMonthlyCalculation?.totalFormula) || "";
     // Safely calculate the total of AreaCultivationAcres
  
     aggreLand = partnerData?.agricultureIncome?.details[0]?.AreaCultivationAcres;
     
  }
     else {
      monthlyIncome = getRoundedEMI(partnerData?.netCalculation?.totalNetMonthlyIncome) || "";
      aggreLand = partnerData?.agricultureRatnaIncome?.details[0]?.AreaCultivationAcres;

    }
    


    // if (selectionData == "ac") {
      const responseFields = [];

      // Define the base fields with matching names
      const baseFields = {
        "Loan Amount": partnerData?.finalLoanAmount || "",
        "Tenure": partnerData?.tenureInMonth || "",
        "Age of Applicant": appData?.age || "",
        "Age of Property owner": appData?.age || "",
        "CIBIL Score": cibilData?.applicantCibilScore || "",
        "Minimum  Monthly Family Income": monthlyIncome || "",
        "FOIR": partnerData?.foir || "",
        "Age of Co-Borrower 1": coAppData[0]?.age || "",
        "CIBIL Score Co-Borrower 1": cibilData?.coApplicantData[0]?.coApplicantCibilScore || "",
        // "Age of Co-Borrower 2": coAppData[1]?.age || "",
        // "CIBIL Score Co-Borrower 2": cibilData?.coApplicantData[1]?.coApplicantCibilScore || "",
        "Property Area (Sq. Feet)": technicalData?.totalLandArea || "",
        "LTV (%)": approveTechnicalDetails?.Ltv || "",
        "Minimum Agriculture Land (Acre)": aggreLand || "",
        // "Income from Milk": milkIncomeData?.monthlyIncomeMilkBuisness || "",
      };

      // Log baseFields for debugging
      // console.log("Base Fields:", baseFields);

      // Iterate over each base field to construct the response
      function checkCondition(value, policy) {
        if (!policy || value === undefined || value === null || value === "") return false;
      
        // Handle numeric conditions
        const numericValue = parseFloat(value.toString().replace(/[^\d.-]/g, ""));
      
        // 1. Handle "<number or >number" conditions
        const orConditionMatch = policy.match(/<(\d+)\s*or\s*>(=)?\s*(\d+)/i);
        if (orConditionMatch) {
          const min = parseFloat(orConditionMatch[1]);
          const max = parseFloat(orConditionMatch[3]);
          const inclusive = orConditionMatch[2] === "="; // Check for '>=' condition
          return numericValue < min || (inclusive ? numericValue >= max : numericValue > max);
        }
      
        // 2. Handle "Greater than Rs. X" or "Greater than X" conditions
        const greaterThanMatch = policy.match(/greater than\s*(rs\.\s*)?([\d.,]+)/i);
        if (greaterThanMatch) {
          const min = parseFloat(greaterThanMatch[2].replace(/[^\d.-]/g, ""));
          return numericValue > min;
        }
      
        // 3. Handle "Up to X" conditions
        const upToMatch = policy.match(/up to\s*([\d.,]+)/i);
        if (upToMatch) {
          const max = parseFloat(upToMatch[1].replace(/[^\d.-]/g, ""));
          return numericValue <= max;
        }
      
        // 4. Handle ranges like "X to Y"
        const rangeMatch = policy.match(/(\d+)\s*to\s*(\d+)/i);
        if (rangeMatch) {
          const min = parseFloat(rangeMatch[1]);
          const max = parseFloat(rangeMatch[2]);
          return numericValue >= min && numericValue <= max;
        }
      
        // Default: Exact match
        return value.toString().toLowerCase() === policy.toString().toLowerCase();
      }
      

      Object.entries(baseFields).forEach(([fieldName, fieldValue]) => {
        const fieldData = {
          [fieldName]: fieldValue,
        };
      
        // Append partner-specific policies for the current field name
        finalEligibilityDetails.forEach((detail) => {
          if (detail?.partnerId?.fullName === partnerData?.partnerId?.fullName) { // Match partner name
            const matchingPolicy = detail.policy.find((policy) => policy.name === fieldName);
            if (matchingPolicy) {
              fieldData[detail?.partnerId?.fullName] = matchingPolicy.policy || "N/A";
              // Check if the fieldValue meets the policy condition
              fieldData["Match"] = checkCondition(fieldValue, matchingPolicy.policy) ? true : false;
            } else {
              fieldData["Match"] = false; // No matching policy found
            }
          }
        });
      
        responseFields.push(fieldData);
      });

      // Log final response fields
      // console.log("Final Response Fields:", responseFields);

      // Return the structured response
      return success(res, "Credit policy check completed", responseFields);
    // }

    // if (selectionData == "acc") {
    //   const responseFields = [];

    //   // Define the base fields with matching names
    //   const baseFields = {
    //     "Loan Amount": partnerData?.finalLoanAmount || "",
    //     "Tenure": partnerData?.tenureInMonth || "",
    //     "Age of Applicant": appData?.age || "",
    //     "Age of Property owner": appData?.age || "",
    //     "CIBIL Score": cibilData?.applicantCibilScore || "",
    //     "Minimum  Monthly Family Income": monthlyIncome || "",
    //     "FOIR": partnerData?.foir || "",
    //     "Age of Co-Borrower 1": coAppData[0]?.age || "",
    //     "CIBIL Score Co-Borrower 1": cibilData?.coApplicantData[0]?.coApplicantCibilScore || "",
    //     "Age of Co-Borrower 2": coAppData[1]?.age || "",
    //     "CIBIL Score Co-Borrower 2": cibilData?.coApplicantData[1]?.coApplicantCibilScore || "",
    //     "Property Area (Sq. Feet)": technicalData?.totalLandArea || "",
    //     "LTV (%)": approveTechnicalDetails?.Ltv || "",
    //     "Minimum Agriculture Land (Acre)": partnerData?.agricultureRatnaIncome?.details[0]?.AreaCultivationAcres || "",
    //     // "Income from Milk": milkIncomeData?.monthlyIncomeMilkBuisness || "",
    //   };

    //   // Log baseFields for debugging
    //   // console.log("Base Fields:", baseFields);

    //   // Iterate over each base field to construct the response
    //   // Object.entries(baseFields).forEach(([fieldName, fieldValue]) => {
    //   //   const fieldData = {
    //   //     [fieldName]: fieldValue,
    //   //   };

    //   //   // Append partner-specific policies for the current field name
    //   //   finalEligibilityDetails.forEach((detail) => {
    //   //     const matchingPolicy = detail.policy.find((policy) => policy.name === fieldName);
    //   //     fieldData[detail?.partnerId?.fullName] = matchingPolicy?.policy || "N/A";
    //   //   });

    //   //   responseFields.push(fieldData);
    //   // });
    //   function checkCondition(value, policy) {
    //     if (!policy || value === undefined || value === null || value === "") return false;
      
    //     // Handle numeric conditions
    //     const numericValue = parseFloat(value.toString().replace(/[^\d.-]/g, ""));
      
    //     // 1. Handle "<number or >number" conditions
    //     const orConditionMatch = policy.match(/<(\d+)\s*or\s*>(=)?\s*(\d+)/i);
    //     if (orConditionMatch) {
    //       const min = parseFloat(orConditionMatch[1]);
    //       const max = parseFloat(orConditionMatch[3]);
    //       const inclusive = orConditionMatch[2] === "="; // Check for '>=' condition
    //       return numericValue < min || (inclusive ? numericValue >= max : numericValue > max);
    //     }
      
    //     // 2. Handle "Greater than Rs. X" or "Greater than X" conditions
    //     const greaterThanMatch = policy.match(/greater than\s*(rs\.\s*)?([\d.,]+)/i);
    //     if (greaterThanMatch) {
    //       const min = parseFloat(greaterThanMatch[2].replace(/[^\d.-]/g, ""));
    //       return numericValue > min;
    //     }
      
    //     // 3. Handle "Up to X" conditions
    //     const upToMatch = policy.match(/up to\s*([\d.,]+)/i);
    //     if (upToMatch) {
    //       const max = parseFloat(upToMatch[1].replace(/[^\d.-]/g, ""));
    //       return numericValue <= max;
    //     }
      
    //     // 4. Handle ranges like "X to Y"
    //     const rangeMatch = policy.match(/(\d+)\s*to\s*(\d+)/i);
    //     if (rangeMatch) {
    //       const min = parseFloat(rangeMatch[1]);
    //       const max = parseFloat(rangeMatch[2]);
    //       return numericValue >= min && numericValue <= max;
    //     }
      
    //     // Default: Exact match
    //     return value.toString().toLowerCase() === policy.toString().toLowerCase();
    //   }
      

    //   Object.entries(baseFields).forEach(([fieldName, fieldValue]) => {
    //     const fieldData = {
    //       [fieldName]: fieldValue,
    //     };
      
    //     // Append partner-specific policies for the current field name
    //     finalEligibilityDetails.forEach((detail) => {
    //       if (detail?.partnerId?.fullName === partnerData?.partnerId?.fullName) { // Match partner name
    //         const matchingPolicy = detail.policy.find((policy) => policy.name === fieldName);
    //         if (matchingPolicy) {
    //           fieldData[detail?.partnerId?.fullName] = matchingPolicy.policy || "N/A";
    //           // Check if the fieldValue meets the policy condition
    //           fieldData["Match"] = checkCondition(fieldValue, matchingPolicy.policy) ? true : false;
    //         } else {
    //           fieldData["Match"] = false; // No matching policy found
    //         }
    //       }
    //     });
      
    //     responseFields.push(fieldData);
    //   });

    //   // Log final response fields
    //   // console.log("Final Response Fields:", responseFields);

    //   // Return the structured response
    //   return success(res, "Credit policy check completed", responseFields);
    // }

    // if (selectionData === "acg") {
    //   const responseFields = [];
    
    //   // Log fetched guarantor and CIBIL details
    //   // console.log("Guarantor Details:", guarantorDetails);
    //   // console.log("CIBIL Data:", cibilData);
    
    //   // Define the base fields with matching names
    //   const baseFields = {
    //     "Loan Amount": partnerData?.finalLoanAmount || "",
    //     "Tenure": partnerData?.tenureInMonth || "",
    //     "Age of Applicant": appData?.age || "",
    //     "Age of Property owner": appData?.age || "",
    //     "CIBIL Score": cibilData?.applicantCibilScore || "",
    //     "Minimum  Monthly Family Income": monthlyIncome || "",
    //     "FOIR": partnerData?.foir || "",
    //     "Age of Co-Borrower 1": coAppData[0]?.age || "",
    //     "CIBIL Score Co-Borrower 1": cibilData?.coApplicantData[0]?.coApplicantCibilScore || "",
    //     "Age of Guarantor": guarantorDetails?.age || "N/A", // Handle missing data
    //     "CIBIL Score Guarantor": cibilData?.guarantorCibilScore || "N/A", // Handle missing data
    //     "Property Area (Sq. Feet)": technicalData?.totalLandArea || "",
    //     "LTV (%)": approveTechnicalDetails?.Ltv || "",
    //     "Minimum Agriculture Land (Acre)": aggreLand || "",
    //     // "Income from Milk": milkIncomeData?.monthlyIncomeMilkBuisness || "",
    //   };
    
    //   // Log baseFields for debugging
    //   // console.log("Base Fields:", baseFields);
    
    //   // Iterate over each base field to construct the response
    //   function checkCondition(value, policy) {
    //     if (!policy || value === undefined || value === null || value === "") return false;
      
    //     // Handle numeric conditions
    //     const numericValue = parseFloat(value.toString().replace(/[^\d.-]/g, ""));
      
    //     // 1. Handle "<number or >number" conditions
    //     const orConditionMatch = policy.match(/<(\d+)\s*or\s*>(=)?\s*(\d+)/i);
    //     if (orConditionMatch) {
    //       const min = parseFloat(orConditionMatch[1]);
    //       const max = parseFloat(orConditionMatch[3]);
    //       const inclusive = orConditionMatch[2] === "="; // Check for '>=' condition
    //       return numericValue < min || (inclusive ? numericValue >= max : numericValue > max);
    //     }
      
    //     // 2. Handle "Greater than Rs. X" or "Greater than X" conditions
    //     const greaterThanMatch = policy.match(/greater than\s*(rs\.\s*)?([\d.,]+)/i);
    //     if (greaterThanMatch) {
    //       const min = parseFloat(greaterThanMatch[2].replace(/[^\d.-]/g, ""));
    //       return numericValue > min;
    //     }
      
    //     // 3. Handle "Up to X" conditions
    //     const upToMatch = policy.match(/up to\s*([\d.,]+)/i);
    //     if (upToMatch) {
    //       const max = parseFloat(upToMatch[1].replace(/[^\d.-]/g, ""));
    //       return numericValue <= max;
    //     }
      
    //     // 4. Handle ranges like "X to Y"
    //     const rangeMatch = policy.match(/(\d+)\s*to\s*(\d+)/i);
    //     if (rangeMatch) {
    //       const min = parseFloat(rangeMatch[1]);
    //       const max = parseFloat(rangeMatch[2]);
    //       return numericValue >= min && numericValue <= max;
    //     }
      
    //     // Default: Exact match
    //     return value.toString().toLowerCase() === policy.toString().toLowerCase();
    //   }
      

    //   Object.entries(baseFields).forEach(([fieldName, fieldValue]) => {
    //     const fieldData = {
    //       [fieldName]: fieldValue,
    //     };
      
    //     // Append partner-specific policies for the current field name
    //     finalEligibilityDetails.forEach((detail) => {
    //       if (detail?.partnerId?.fullName === partnerData?.partnerId?.fullName) { // Match partner name
    //         const matchingPolicy = detail.policy.find((policy) => policy.name === fieldName);
    //         if (matchingPolicy) {
    //           fieldData[detail?.partnerId?.fullName] = matchingPolicy.policy || "N/A";
    //           // Check if the fieldValue meets the policy condition
    //           fieldData["Match"] = checkCondition(fieldValue, matchingPolicy.policy) ? true : false;
    //         } else {
    //           fieldData["Match"] = false; // No matching policy found
    //         }
    //       }
    //     });
      
    //     responseFields.push(fieldData);
    //   });
    
    //   // Log final response fields
    //   // console.log("Final Response Fields:", responseFields);
    
    //   // Return the structured response
    //   return success(res, "Credit policy check completed", responseFields);
    // }


    // if (selectionData == "accg") {
    //   const responseFields = [];

    //   // Define the base fields with matching names
    //   const baseFields = {
    //     "Loan Amount": partnerData?.finalLoanAmount || "",
    //     "Tenure": partnerData?.tenureInMonth || "",
    //     "Age of Applicant": appData?.age || "",
    //     "Age of Property owner": appData?.age || "",
    //     "CIBIL Score": cibilData?.applicantCibilScore || "",
    //     "Minimum  Monthly Family Income": monthlyIncome || "",
    //     "FOIR": partnerData?.foir || "",
    //     "Age of Co-Borrower 1": coAppData[0]?.age || "",
    //     "CIBIL Score Co-Borrower 1": cibilData?.coApplicantData[0]?.coApplicantCibilScore || "",
    //     "Age of Co-Borrower 2": coAppData[1]?.age || "",
    //     "CIBIL Score Co-Borrower 2": cibilData?.coApplicantData[1]?.coApplicantCibilScore || "",
    //     "Age of Guarantor": guarantorDetails?.age || "N/A", // Handle missing data
    //     "CIBIL Score Guarantor": cibilData?.guarantorCibilScore || "N/A", // Handle missing data
    //     "Property Area (Sq. Feet)": technicalData?.totalLandArea || "",
    //     "LTV (%)": approveTechnicalDetails?.Ltv || "",
    //     "Minimum Agriculture Land (Acre)": aggreLand || "",
    //     // "Income from Milk": milkIncomeData?.monthlyIncomeMilkBuisness || "",
    //   };

    //   // Log baseFields for debugging
    //   // console.log("Base Fields:", baseFields);

    //   // Iterate over each base field to construct the response
    //   function checkCondition(value, policy) {
    //     if (!policy || value === undefined || value === null || value === "") return false;
      
    //     // Handle numeric conditions
    //     const numericValue = parseFloat(value.toString().replace(/[^\d.-]/g, ""));
      
    //     // 1. Handle "<number or >number" conditions
    //     const orConditionMatch = policy.match(/<(\d+)\s*or\s*>(=)?\s*(\d+)/i);
    //     if (orConditionMatch) {
    //       const min = parseFloat(orConditionMatch[1]);
    //       const max = parseFloat(orConditionMatch[3]);
    //       const inclusive = orConditionMatch[2] === "="; // Check for '>=' condition
    //       return numericValue < min || (inclusive ? numericValue >= max : numericValue > max);
    //     }
      
    //     // 2. Handle "Greater than Rs. X" or "Greater than X" conditions
    //     const greaterThanMatch = policy.match(/greater than\s*(rs\.\s*)?([\d.,]+)/i);
    //     if (greaterThanMatch) {
    //       const min = parseFloat(greaterThanMatch[2].replace(/[^\d.-]/g, ""));
    //       return numericValue > min;
    //     }
      
    //     // 3. Handle "Up to X" conditions
    //     const upToMatch = policy.match(/up to\s*([\d.,]+)/i);
    //     if (upToMatch) {
    //       const max = parseFloat(upToMatch[1].replace(/[^\d.-]/g, ""));
    //       return numericValue <= max;
    //     }
      
    //     // 4. Handle ranges like "X to Y"
    //     const rangeMatch = policy.match(/(\d+)\s*to\s*(\d+)/i);
    //     if (rangeMatch) {
    //       const min = parseFloat(rangeMatch[1]);
    //       const max = parseFloat(rangeMatch[2]);
    //       return numericValue >= min && numericValue <= max;
    //     }
      
    //     // Default: Exact match
    //     return value.toString().toLowerCase() === policy.toString().toLowerCase();
    //   }
      

    //   Object.entries(baseFields).forEach(([fieldName, fieldValue]) => {
    //     const fieldData = {
    //       [fieldName]: fieldValue,
    //     };
      
    //     // Append partner-specific policies for the current field name
    //     finalEligibilityDetails.forEach((detail) => {
    //       if (detail?.partnerId?.fullName === partnerData?.partnerId?.fullName) { // Match partner name
    //         const matchingPolicy = detail.policy.find((policy) => policy.name === fieldName);
    //         if (matchingPolicy) {
    //           fieldData[detail?.partnerId?.fullName] = matchingPolicy.policy || "N/A";
    //           // Check if the fieldValue meets the policy condition
    //           fieldData["Match"] = checkCondition(fieldValue, matchingPolicy.policy) ? true : false;
    //         } else {
    //           fieldData["Match"] = false; // No matching policy found
    //         }
    //       }
    //     });
      
    //     responseFields.push(fieldData);
    //   });

    //   // Log final response fields
    //   // console.log("Final Response Fields:", responseFields);

    //   // Return the structured response
    //   return success(res, "Credit policy check completed", responseFields);
    // }
    
  } catch (error) {
    console.error("Error in checkCreditPolicy:", error);
    return unknownError(res, error.message);
  }
};


const getDynamipolicyData = async (req, res) => {
    try {

      const {customerId} = req.query
      
      // Fetch active lenders and select only necessary fields
      const activeLenders = await lenderModel.find(
        { status: "active" },
        { fullName: 1, policy: 1, _id: 0 }
      );
  
      // Initialize a result structure
      const policyFields = [
        "loanAmount", "tenure", "ageOfApplicant", "ageOfPropertyOwner",
        "cibilScore", "minimumMonthlyFamilyIncome", "foir", "ageOfCoBorrower",
        "cibilScoreCoBorrower", "ageOfGuarantor", "cIBILScoreGuarantor",
        "propertyArea", "ltv", "minimumAgricultureLand"
      ];
  
      let formattedResponse = [];
  
      // Iterate through each policy field and structure data
      policyFields.forEach((field) => {
        let entry = {};
  
        // Define readable field names
        const fieldMapping = {
          loanAmount: "Loan Amount",
          tenure: "Tenure",
          ageOfApplicant: "Age of Applicant",
          ageOfPropertyOwner: "Age of Property owner",
          cibilScore: "CIBIL Score",
          minimumMonthlyFamilyIncome: "Minimum Monthly Family Income",
          foir: "FOIR",
          ageOfCoBorrower: "Age of Co-Borrower 1",
          cibilScoreCoBorrower: "CIBIL Score Co-Borrower 1",
          ageOfGuarantor: "Age of Guarantor",
          cIBILScoreGuarantor: "CIBIL Score Guarantor",
          propertyArea: "Property Area (Sq. Feet)",
          ltv: "LTV (%)",
          minimumAgricultureLand: "Minimum Agriculture Land (Acre)"
        };
  
        entry[fieldMapping[field]] = ""; // Placeholder for input values
  
        activeLenders.forEach((lender) => {
          if (lender.policy && lender.policy[field]) {
            let min = lender.policy[field].min || "";
            let max = lender.policy[field].max || "";
  
            entry[lender.fullName] = `${min !== "" ? min : 0} to ${max !== "" ? max : 0}`;
          } else {
            entry[lender.fullName] = "";
          }
        });
  
        formattedResponse.push(entry);
      });
  
      // Return the formatted response
      return success(res ,  "Credit policy check completed", formattedResponse);
    } catch (error) {
      console.error("Error fetching policy data:", error);
      return unknownError(res, error.message);
    }
  }; 



module.exports = {
  addFinalEligibility,
  finalEligibilityList,
  checkCreditPolicy,
  getDynamipolicyData,
  partnerPolicyCheck
};
