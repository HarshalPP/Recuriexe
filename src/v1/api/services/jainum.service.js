const {
  success,
  unknownError,
  serverValidation,
  badRequest,
  notFound
} = require("../../../../globalHelper/response.globalHelper");

const crypto = require('crypto');
const mongoose = require('mongoose')
const { encryptedData, decryptedData } = require("../../../../Middelware/crypto")
const { encrypt, getChecksumFromString, decrypt, verifyChecksumFromString } = require("../../../../Middelware/jainumConfig")
const { getApplicantData, getCoapplicantData, getPDData,
  formatteLoanData, getFinalSectionData, getGtrData, uploadDocument,
  getCustomerDocuments, getSenctionLetter, getFinalSanctionData, Udhyamdata, getBankStatementData, getInsuranceData , getPropertyDetails , getDisbursementData} = require("../helper/losGlobal.helper")
const jainummodel = require("../model/jainum.model")
const udhyamKycModel = require("../model/branchPendency/udhyamKyc.model.js")
const { validationResult } = require("express-validator");
const axios = require('axios')
const dotenv = require('dotenv')
const moment = require('moment')
dotenv.config()


// // call a Function to get the all formatted dates //
// const date = getAllFormattedDates(new Date())
// console.log('Date:', date)

// Encryption key // 
//UAT//
const encryptionKey = process.env.ENCRYPTIONKEY_env;


//PROD
// const encryptionKey = 'f0673f8b5b5766c305cd34cf9fc70ca4'


const IV = "@@@@&&&&####$$$$"; // Fixed 16-byte IV
// Merchant Details (Use environment variables for security)


//UAT //
const JAINAM_MERCHANT_ID = process.env.JAINAM_MERCHANT_ID_env;
const JAINAM_MERCHANT_KEY = process.env.JAINAM_MERCHANT_KEY_env;

// console.log('JAINAM_MERCHANT_ID:', JAINAM_MERCHANT_ID)
// console.log('JAINAM_MERCHANT_KEY:', JAINAM_MERCHANT_KEY)
// console.log('encryptionKey:', encryptionKey)

//PROD //
// const JAINAM_MERCHANT_ID = "9981a42c691503a4de78c1b6bb13353d";
// const JAINAM_MERCHANT_KEY = "670087929d0036b8a830c83678819a71";



// Encrypt for ID function //
async function encryptforId(value, key) {
  try {
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key, "utf8"), Buffer.from(IV, "utf8"));
    let encrypted = cipher.update(value, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted; // ✅ Returns encrypted data as hex string
  } catch (error) {
    console.error("Encryption error:", error);
    return null; // ✅ Returns null if encryption fails
  }
}


// verifyChecksumFromString function //

async function verifyChecksum(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { encryptedData, checksum } = req.body;

    if (!encryptedData || !checksum) {
      return badRequest(res, 'Invalid Request');
    }

    const isValid = verifyChecksumFromString(encryptedData, JAINAM_MERCHANT_KEY, checksum);
    return success(res, 'Checksum Verification', { isValid });
  } catch (err) {
    console.log('Error in verifyChecksum:', err)
    return unknownError(res, err.message)
  }
}




async function sendLedgerData(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const ledgerData = req.body;
    if (!ledgerData) {
      return badRequest(res, 'Invalid Request');
    }

    const jsonData = JSON.stringify([ledgerData]);
    const encryptedData = encrypt(jsonData, JAINAM_MERCHANT_KEY);
    const checksum = getChecksumFromString(encryptedData, JAINAM_MERCHANT_KEY);

    console.log('Encrypted Data:', encryptedData)
    console.log('Checksum:', checksum)
    console.log('Merchant ID:', JAINAM_MERCHANT_ID)

    const response = await axios.post(
      "https://www.jainamsoftware.com/admin/api/v2/?a=set-ledger",
      encryptedData,
      {
        headers: {
          "X-Checksum": checksum,
          "X-MerchantID": JAINAM_MERCHANT_ID,
          "Content-Type": "text/plain"
        }
      }
    );

    if (response.data.status !== "Success") {
      return badRequest(res, response.data);
    }

    return success(res, "Ledger data submitted successfully", response.data);
  } catch (err) {
    console.error("Error in sendLedgerData:", err);
    return unknownError(res, err);
  }
}

// decrypt function //
async function decryptfunc(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { encryptedResponse } = req.body;

    console.log('Encrypted Response:', encryptedResponse)

    if (!encryptedResponse) {
      return badRequest(res, 'Invalid Request');
    }

    const decryptedResponse = decrypt(encryptedResponse, JAINAM_MERCHANT_KEY);
    const response = JSON.parse(decryptedResponse);
    return success(res, 'eNach Response', response);
  } catch (err) {
    console.log('Error in decryptfunc:', err)
    return unknownError(res, err.message)
  }
}

// encrypt function //
async function encryptFunc(data) {
  try {
    if (!data) {
      throw new Error("Invalid Request: Data is required");
    }

    // Encrypt the data
    const encryptedData = encrypt(data, encryptionKey);

    // Return data inside an object
    return { status: "success", encryptedData };
  } catch (err) {
    console.error("Error in encryptFunc:", err);
    return { status: "error", message: err.message };
  }
}




//  SET LOAN //



// async function setLoan(req, res) {
//   try {
//     // Validate request
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }

//     let loanData = req.body;
//     const { customerId, Type } = req.query

//     if (!customerId) {
//       return badRequest(res, 'Customer not found')
//     }

//     if (!Type) {
//       return badRequest(res, "Please Provide the type -- applicante")
//     }

//     console.log('Loan Data Before Processing:', loanData);

//     // Convert fee_detail and fee_detail_customer to JSON strings if they are objects
//     if (loanData.fee_detail && typeof loanData.fee_detail !== "string") {
//       loanData.fee_detail = JSON.stringify(loanData.fee_detail);
//     }
//     if (loanData.fee_detail_customer && typeof loanData.fee_detail_customer !== "string") {
//       loanData.fee_detail_customer = JSON.stringify(loanData.fee_detail_customer);
//     }



//     // Convert to JSON string (without wrapping in an array)
//     const plainTextData = JSON.stringify([loanData]);



//     // Encrypt the data
//     const encryptedPayload = encrypt(plainTextData, JAINAM_MERCHANT_KEY);
//     const checksum = getChecksumFromString(encryptedPayload, JAINAM_MERCHANT_KEY);

//     // console.log("Encrypted Payload:", encryptedPayload);
//     // console.log("Checksum:", checksum);
//     // console.log("Merchant ID:", JAINAM_MERCHANT_ID);

//     // Send encrypted data to external API
//     const response = await axios.post(
//       "https://www.jainamsoftware.com/admin/api/v2/?a=set-loan",
//       // "https://www.dfintech.club/admin/api/v2/?a=set-loan",
//       encryptedPayload,
//       {
//         headers: {
//           "X-Checksum": checksum,
//           "X-MerchantID": JAINAM_MERCHANT_ID,
//           "Content-Type": "text/plain"
//         }
//       }
//     );

//     // Handle response
//     if (response.data.status !== "Success") {
//       return badRequest(res, response.data);
//     }

//     const { loan_id, loan_idcrypt, loan_number, AmountPaid } = response.data;

//     // ✅ Find and update record in jainummodel using Type and customerId
//     const findCid = await jainummodel.findOneAndUpdate(
//       { Type, customerId },  // Use Type and customerId to search
//       {
//         $set: {
//           loan_id,
//           loan_idcrypt,
//           loan_number,
//           AmountPaid,

//         }
//       },
//       { new: true }  // Return the updated record
//     );



//     return success(res, "Loan data submitted successfully", response.data);
//   } catch (err) {
//     console.error("Error in setLoan:", err);
//     return unknownError(res, err);
//   }
// }



async function setLoan(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    let loanData = req.body;
    const { customerId, Type } = req.query;

    if (!customerId) {
      return badRequest(res, "Customer not found");
    }

    if (!Type) {
      return badRequest(res, "Please Provide the type -- applicant");
    }


    // **Step 1: Prepare Loan Creation Data**
    const loanPayload = {
      customer_id: loanData.customer_id,
      customer_idcrypt: loanData.customer_idcrypt,
      merchant_id: loanData.merchant_id,
      principal_amount: loanData.principal_amount,
      product_scheme_code: loanData.product_scheme_code,
      disbursement_date: loanData.disbursement_date,
      installment_start_date: loanData.installment_start_date,
    };

    const encryptedLoanPayload = encrypt(JSON.stringify([loanPayload]), JAINAM_MERCHANT_KEY);
    const loanChecksum = getChecksumFromString(encryptedLoanPayload, JAINAM_MERCHANT_KEY);

    // **Step 2: Send Loan Creation Request**
    console.log("🔹 Sending Loan Creation Request...");
    const loanCreationRequest = process.env.JAINUM_LOAN_CREATE
    const loanResponse = await axios.post(
      loanCreationRequest,
      encryptedLoanPayload,
      {
        headers: {
          "X-Checksum": loanChecksum,
          "X-MerchantID": JAINAM_MERCHANT_ID,
          "Content-Type": "text/plain",
        },
      }
    );

    if (loanResponse.data.status !== "Success") {
      return badRequest(res, loanResponse.data);
    }

    const { loan_id, loan_idcrypt ,loan_number, AmountPaid, } = loanResponse.data;


    // **Update loan details in DB**
    await jainummodel.findOneAndUpdate(
      { Type, customerId },
      { $set: { loan_id, loan_idcrypt , loan_number , AmountPaid , 
        product_scheme_code:loanData.product_scheme_code , 
        installment_start_date:loanData.installment_start_date } },
      { new: true }
    );

    // **Step 3: Send Property Details (if available)**
    if (loanData.propertyDetails && loanData.propertyDetails.length > 0) {
      const collateralData = loanData.propertyDetails.map((property) => ({
        
        loan_id,
        loan_idcrypt,
        ...property,
      }));

      const encryptedCollateralPayload = encrypt(JSON.stringify(collateralData), JAINAM_MERCHANT_KEY);
      const collateralChecksum = getChecksumFromString(encryptedCollateralPayload, JAINAM_MERCHANT_KEY);
      const PrpertycreateReq = process.env.JAINUM_PROPERTY_CREATE
      const collateralResponse = await axios.post(
        PrpertycreateReq,
        encryptedCollateralPayload,
        {
          headers: {
            "X-Checksum": collateralChecksum,
            "X-MerchantID": JAINAM_MERCHANT_ID,
            "Content-Type": "text/plain",
          },
        }
      );


      if (collateralResponse.data.Header[0].Status !== "OK") {
        return badRequest(res, "Collateral data submission failed");
      }

      console.log("✅ Property Details Submitted Successfully");
    }

    return success(res, "Loan and property details processed successfully", { loan_id, loan_idcrypt , loan_number , AmountPaid});
  } catch (err) {
    console.error("❌ Error in setLoan:", err);
    return unknownError(res, err);
  }
}










// Create Ledger Data //

//119530 //
async function Attachments(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const data = req.body;
    const { customerId, Type } = req.query
    const employeeId = req.Id

    if (!customerId) {
      return badRequest(res, "Customer not found")
    }

    const jsonData = JSON.stringify([data]);


    // ✅ Encrypt the data properly
    const encryptedData = encrypt(jsonData, JAINAM_MERCHANT_KEY);
    const checksum = getChecksumFromString(encryptedData, JAINAM_MERCHANT_KEY);

      // "https://www.dfintech.club/admin/api/v2/?a=set-ledger",
      // "https://www.jainamsoftware.com/admin/api/v2/?a=set-ledger"
      const createProfile = process.env.JAINAM_PROFILE_CREATE; 
    console.log("create profile" , createProfile)
    const response = await axios.post(createProfile, encryptedData,
      {
        headers: {
          "X-Checksum": checksum,
          "X-MerchantID": JAINAM_MERCHANT_ID,
          "Content-Type": "text/plain"
        }
      }
    )
    // return success(res , 'Encrypted Payload' , encryptedPayload)
    if (response.data.status !== 'Success') {
      return badRequest(res, response.data)
    }


    const { cid, cid_crypt, file_number, merchant_id } = response.data;

    // if (!cid) {
    //   return badRequest(res, { message: "CID is missing in API response" });
    // }

    // ✅ Use `findOneAndUpdate` with upsert to create or update the record
    if(cid){
    const updatedRecord = await jainummodel.findOneAndUpdate(
      { cid },  // Search by CID
      {
        $set: {
          cid,
          cid_crypt,
          file_number,
          merchant_id,
          customerId,
          employeeId,
          Type
        }
      },
      { new: true, upsert: true } // ✅ Creates new if not found
    );
  }

    return success(res, "Encrypted Payload", response.data)
  } catch (err) {
    console.log('Error in Attachments:', err)
    return unknownError(res, err)
  }
}


// Function to sort RelationId //

const RelationID = {
  "495": "Mother in Law",
  "494": "Father in Law",
  "280": "Other",
  "279": "Friend",
  "278": "Grand Mother",
  "277": "Grand Father",
  "276": "Sister",
  "275": "Brother",
  "274": "Daughter",
  "273": "Son",
  "272": "Spouse",
  "271": "Mother",
  "270": "Father",
  "272": "Wife",
  "272": "Husband",
};

function getRelationID(relationName) {
  console.log('Relation Name:', relationName);
  
  for (const [id, name] of Object.entries(RelationID)) {
    if (name.toLowerCase().replace(/\s/g, '') == relationName.toLowerCase().replace(/\s/g, '')) {
      return id;
    }
  }
  
  return '280'; // Return 'Other' if the relation is not found
}



// Marital status //

function StateCode(stateName) {
  if (!stateName || typeof stateName !== "string") {
      console.error("Invalid state name provided:", stateName);
      return ""; // Return empty string for invalid input
  }

  const states = {
      "Madhya Pradesh": "23",
      "Gujarat": "24" // Corrected spelling of "Gujrat" to "Gujarat"
  };

  // Normalize input: Convert first letter of each word to uppercase
  const formattedName = stateName
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return states[formattedName] || "";
}



// get buffer valuse of Image // 

async function getBase64FromUrl(imageUrl) {

  if (!imageUrl) {
      return ""; // Return empty string if imageUrl
  }
  try {
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      return Buffer.from(response.data, 'binary').toString('base64');
  } catch (error) {
      console.error("Error fetching image:", error);
      return ""; // Return empty string on error
  }
}


// console.log('Relation ID:', getRelationID('Mother in Law'))

// create Ledger Data  from LOS //

async function getsendLedgerData(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }



    if (!req.body.customerId) {
      return badRequest(res, 'Customer ID is required')
    }

    // Fetch all required data
    const { status: applicantStatus, message: applicantMessage, data: applicantDetail } = await getApplicantData(req.body.customerId);
    const { status: coApplicantStatus, message: coApplicantMessage, data: coApplicants } = await getCoapplicantData(req.body.customerId);
    const { status: gtrStatus, message: gtrMessage, data: gtrDetail } = await getGtrData(req.body.customerId);
    const { status: pdStatus, message: pdMessage, data: pdDetail } = await getPDData(req.body.customerId);
    const { status: finalSectionStatus, message: finalSectionMessage, data: finalSectionDetail } = await getFinalSectionData(req.body.customerId);
    const { status: getCustomerDocumentStatus, message: getCustomerDocumentMessage, data: getCustomerDocument } = await getCustomerDocuments(req.body.customerId);
    const { status: getSenctionLetterStatus, message: getSenctionLetterMessage, data: getSenctionLetters } = await getSenctionLetter(req.body.customerId);
    const { status: getFinalSanctionDataStatus, message: getFinalSanctionDataMessage, data: getFinalSanction } = await getFinalSanctionData(req.body.customerId);
    const { status: UdhyamdataStatus, message: UdhyamdataMessage, data: Udhyam } = await Udhyamdata(req.body.customerId);
    const { status: getBankStatementDataStatus, message: getBankStatementDataMessage, data: getBankStatement } = await getBankStatementData(req.body.customerId);
    const { status: getInsuranceDataStatus, message: getInsuranceDataMessage, data: getInsurance } = await getInsuranceData(req.body.customerId);
    const { status: getPropertyDetailsStatus, message: getPropertyDetailsMessage, data: getPropertyDetailsData } = await getPropertyDetails(req.body.customerId);


    // console.log('Applicant Data:', applicantDetail);
    // console.log('Co-Applicants Data:', coApplicants);
    // console.log('GTR Data:', gtrDetail);


    // console.log('coApplicants Data:', coApplicants[0]);

// Ensure getBankStatement and bankDetails exist before filtering
const eNachBankDetails = getBankStatement?.bankDetails?.filter(
  (bankDetail) => bankDetail?.E_Nach_Remarks == "true"
) || [];

// Ensure getInsurance exists before accessing nominees
const coApplicateData = getInsurance || {}; // Default to an empty object if undefined
const firstNominee = coApplicateData?.nominees?.[0] || "";




    // ------------------------- Business Logic ------------------------- //
    // Helper function to sanitize strings
    function sanitizeString(input) {
      return input ? input.replace(/[^a-zA-Z0-9\s,.-]/g, "").trim() : "";
    }


    // Function to split full name
    function splitFullName(fullName) {
      const nameParts = fullName ? fullName.trim().split(" ") : ["", "", ""];
      console.log('Name Parts:', nameParts)
      return {
        firstName: nameParts[0] || "",
        middleName: nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "",
        lastName: nameParts.length > 1 ? nameParts[nameParts.length - 1] : ""
      };
    }

    // Ensure applicantDetail has fullName before using splitFullName
    const { firstName, middleName, lastName } = applicantDetail?.fullName ? splitFullName(applicantDetail.fullName) : { firstName: "", middleName: "", lastName: "" };
    const { gtrfirstName, gtrmiddleName, gtrlastName } = gtrDetail?.fullName ? splitFullName(gtrDetail.fullName) : { gtrfirstName: "", gtrmiddleName: "", gtrlastName: "" };
    const enctptpId = await encryptforId(req.body.customerId, JAINAM_MERCHANT_KEY);
    console.log('Encrypted ID:', enctptpId)

    // Process co-applicants
    const coApplicantMode = await Promise.all(
      (coApplicants || []).map(async (coApplicant, index) => {
        const { firstName, middleName, lastName } = splitFullName(coApplicant.fullName || "");
    
        // Extract houseLandMark for the current co-applicant
        const coApplicantDetails = pdDetail?.co_Applicant || [];
        const houseLandMark = Array.isArray(coApplicantDetails) && coApplicantDetails[index]?.houseLandMark
          ? (Array.isArray(coApplicantDetails[index].houseLandMark)
            ? coApplicantDetails[index].houseLandMark[index]
            : coApplicantDetails[index].houseLandMark) || ""
          : "";
    
        const imageBase64 = await getBase64FromUrl(coApplicant?.coApplicantPhoto) || "";
    
        return {
          ledger_type: "Co-Applicant",
          ledger_parent_id: req.body.customerId,
          ledger_parent_idcrypt: enctptpId,
          merchant_id: coApplicant?._id || "",
          first_name: firstName,
          middle_name: middleName,
          last_name: lastName,
          gender: coApplicant?.gender || "",
          dob: coApplicant?.dob || "",
          father_name: coApplicant?.fatherName || "",
          mother_name: coApplicant?.motherName || "",
          product_scheme_code: "TEST01",
          spouse_name: coApplicant?.spouseName || "",
          marital_status: coApplicant?.maritalStatus || "",
          permanent_address: {
            address_type: "PERMANENT",
            address: (coApplicant?.permanentAddress?.addressLine1 || "").toUpperCase(),
            area: (coApplicant?.permanentAddress?.district || "").toUpperCase(),
            taluka:"",
            district: (coApplicant?.permanentAddress?.district || "").toUpperCase(),
            landmark: coApplicant?.houseLandMark || "",
            city: (coApplicant?.permanentAddress?.city || "").toUpperCase(),
            pincode: (coApplicant?.permanentAddress?.pinCode || "").toUpperCase(),
            state: (coApplicant?.permanentAddress?.state || "").toUpperCase(),
            statecode: StateCode(coApplicant?.permanentAddress?.state) || "",
            country: "INDIA",
          },
          is_permanent_address_different_than_communication_address: " ",
          communication_address: {
            address_type: "CURRENT",
            area: (coApplicant?.permanentAddress?.district || "").toUpperCase(),
            taluka:"",
            district: (coApplicant?.permanentAddress?.district || "").toUpperCase(),
            landmark: coApplicant?.houseLandMark || "",
            address: (coApplicant?.permanentAddress?.addressLine1 || "").toUpperCase(),
            city: (coApplicant?.permanentAddress?.city || "").toUpperCase(),
            pincode: (coApplicant?.permanentAddress?.pinCode || "").toUpperCase(),
            state: (coApplicant?.permanentAddress?.state || "").toUpperCase(),
            statecode: StateCode(coApplicant?.permanentAddress?.state) || "",
            country: "INDIA",
          },
          "income":{
            "income":"",
        "expenses":"",
        "education_id":"",
        "min_amount":"",
        "max_amount":"",
        "provident_fund_balance":"",
        "severance_balance":"",
        "guarantor_severance_balance":"",
        "income_indicator_net_gross":"",
        "income_indicator_monthly_annual":""
        },
          details: [
            {
              entity_type: "pan",
              entity_number: coApplicant?.docType == "panCard" ? coApplicant?.docNo || "" : "",
            },

            {
              entity_type: "voter_id",
              entity_number: coApplicant?.docType == "voterId" ? coApplicant?.docNo || "" : "",
           },

            { entity_type: "aadhar", entity_number: coApplicant?.aadharNo || "" },
            { entity_type: "mobile_1", entity_number: coApplicant?.mobileNo || "" },
            {
              entity_type:"grp_id",
              entity_number:""
            },
            { entity_type: "email", entity_number: coApplicant?.email || "" },
            { entity_type: "image_ext", entity_number: "jpg" },
            { entity_type: "image", entity_number: imageBase64 },
            { test_image: coApplicant?.coApplicantPhoto }
          ]
        };
      })
    );


    

    // Define Ledger Data
    let LedgerData = {
      applicant: {
        "ledger_type": "Customer",
        "ledger_parent_id": req.body.customerId,
        "ledger_parent_idcrypt": enctptpId,
        "merchant_id": applicantDetail?._id || "",
        "first_name": firstName,
        "middle_name": middleName,
        "last_name": lastName,
        "gender": sanitizeString(applicantDetail?.gender) || "",
        "dob": applicantDetail?.dob || "",
        "father_name": applicantDetail?.fatherName || "",
        "mother_name": applicantDetail?.motherName || "",
        "number_of_dependent_count": applicantDetail.noOfDependentWithCustomer || "",
        "spouse_name": applicantDetail?.spouseName || "",
        "marital_status":applicantDetail?.maritalStatus || "",
        "employment_type": finalSectionDetail?.customerProfile || "Salaried",
        "loan_amount": finalSectionDetail?.finalLoanAmount || "",
        "product_scheme_code": "TEST01",
        "permanent_address": {
          "address_type": "PERMANENT",
          "address": (applicantDetail?.permanentAddress?.addressLine1 || "").toUpperCase(),
          "area": (applicantDetail?.permanentAddress?.district || "").toUpperCase(),
          "taluka":(getPropertyDetailsData?.tehsil || "").toUpperCase(),
          "district": (applicantDetail?.permanentAddress?.district || "").toUpperCase(),
          "landmark": (applicantDetail?.houseLandMark || "").toUpperCase(),
          "city": (applicantDetail?.permanentAddress?.city || "").toUpperCase(),
          "pincode": (applicantDetail?.permanentAddress?.pinCode || "").toUpperCase(),
          "state": (applicantDetail?.permanentAddress?.state || "").toUpperCase(),
          "statecode": StateCode(applicantDetail?.permanentAddress?.state) || "",
          "country": "INDIA",
          "geo_location": ""
        },
        "is_permanent_address_different_than_communication_address": "",
        "communication_address": {
          "address_type": "CURRENT",
          "address": (applicantDetail?.permanentAddress?.addressLine1 || "").toUpperCase(),
          "area": (applicantDetail?.permanentAddress?.district || "").toUpperCase(),
          "taluka":(getPropertyDetailsData?.tehsil || "").toUpperCase(),
          "district": (applicantDetail?.permanentAddress?.district || "").toUpperCase(),
          "landmark": (applicantDetail?.houseLandMark || "").toUpperCase(),
          "city": sanitizeString(applicantDetail?.permanentAddress?.city || "").toUpperCase(),
          "pincode": (applicantDetail?.permanentAddress?.pinCode || "").toUpperCase(),
          "state": sanitizeString(applicantDetail?.permanentAddress?.state || "").toUpperCase(),
          "statecode": StateCode(applicantDetail?.permanentAddress?.state) || "",
          "country": "INDIA",
          "geo_location": ""
        },
        // "nominee_detail": {
        //   "Name": firstNominee.fullName || "",
        //   "RelationID": getRelationID(firstNominee.relationshipWithMember) || "",
        //   "NomineePercentage": "100",
        //   "Mobile": applicantDetail?.mobileNo.toString() || "",
        //   "dob": firstNominee.ageDob || "",
        //   "StartDate": "",
        //   "EndDate": ""
        // },


        "nominee_detail": {
          "name": coApplicants[0].fullName || "",
          "relation_id": getRelationID(coApplicants[0].relationWithApplicant) || "",
          "nominee_percentage": "100",
          "mobile": coApplicants[0].mobileNo || "",
          "dob": coApplicants[0].dob || "",
          "start_date": "",
          "end_date": ""
        },
        "income":{
          "income":"",
      "expenses":"",
      "education_id":"",
      "min_amount":"",
      "max_amount":"",
      "provident_fund_balance":"",
      "severance_balance":"",
      "guarantor_severance_balance":"",
      "income_indicator_net_gross":"",
      "income_indicator_monthly_annual":""
      },
        "bank_account_detail": {
          "account_number": eNachBankDetails[0]?.accountNumber || "",
          "ifsc": eNachBankDetails[0]?.ifscCode || "",
          "bank_name": eNachBankDetails[0]?.bankName || "",
          "bank_branch": eNachBankDetails[0]?.branchName || "",
          "accoun_type": eNachBankDetails[0]?.accountType == "Savings" ? "SavingsAccount" : "CurrentAccount"
        },
        "business_address": {
          "address_type": "BUSINESS",
          "address": (Udhyam?.AddressOfFirm?.fullAddress || "").toUpperCase(),
          "area": (Udhyam?.AddressOfFirm?.landmark || "").toUpperCase(),
          "taluka":(Udhyam?.AddressOfFirm?.districtName || "").toUpperCase(),
          "district": (Udhyam?.AddressOfFirm?.districtName || "").toUpperCase(),
          "landmark": (Udhyam?.AddressOfFirm?.landmark || "").toUpperCase(),
          "city": (Udhyam?.AddressOfFirm?.city || "").toUpperCase(),
          "pincode": (Udhyam?.AddressOfFirm?.pinCode || "").toUpperCase(),
          "state": (Udhyam?.AddressOfFirm?.state || "").toUpperCase(),
          "statecode": StateCode(Udhyam?.AddressOfFirm?.state) || "",
          "date_of_incorporation": Udhyam?.udyamDetails?.dateOfIncorporation || "",
          "country": "INDIA",
          "geo_location": ""
        },
        "business_name": Udhyam?.OrganisationName || "",
        "registration_number": Udhyam?.udhyamRegistrationNo || "",
        "branch_name": Udhyam?.udyamDetails?.officialAddressOfEnterprise?.VillageTown || "",
        "details": [
          {
            "entity_type": "pan",
            "entity_number": applicantDetail?.panNo || ""
          },
          {
            "entity_type": "aadhar",
            "entity_number": applicantDetail?.aadharNo || ""
          },
          {
            "entity_type": "mobile_1",
            "entity_number": applicantDetail?.mobileNo || ""
          },

          {
            entity_type:"grp_id",
            entity_number:""
          },

          {
            "entity_type": "email",
            "entity_number": applicantDetail?.email || ""
          },
          {
            "entity_type": "image_ext",
            "entity_number": "jpg"
          },
          {
             "entity_type": "image",
             entity_number: await getBase64FromUrl(applicantDetail?.applicantPhoto) || ""
          },
          {
            "test_image": applicantDetail?.applicantPhoto || ""
          }
        ],  

      },
      coApplicants: coApplicantMode || [],
      gurrantor: {
        "ledger_type": "Guarantor",
        "ledger_parent_id": req.body.customerId,
        "ledger_parent_idcrypt": enctptpId,
        "merchant_id": gtrDetail?._id || "",
        "first_name": gtrDetail?.fullName || "",
        "middle_name": "",
        "last_name": "",
        "gender": gtrDetail?.gender || "",
        "dob": gtrDetail?.dob || "",
        "father_name": gtrDetail?.fatherName || "",
        "mother_name": gtrDetail?.motherName || "",
        "spouse_name": gtrDetail?.spouseName || "",
        "marital_status": gtrDetail?.maritalStatus || "",
        // "employment_type": gtrDetail?.employmentType || "Salaried",
        // "loan_amount": getFinalSanctionData?.finalLoanAmount || "",
        "product_scheme_code": "TEST01",
        "permanent_address": {
          "address_type": "PERMANENT",
          "address": (gtrDetail?.permanentAddress?.addressLine1 || "").toUpperCase(),
          "area": (gtrDetail?.permanentAddress?.district || "").toUpperCase(),
          "taluka":"",
          "district": (gtrDetail?.permanentAddress?.district || "").toUpperCase(),
          "landmark": (gtrDetail?.houseLandMark || "").toUpperCase(),
          "city": (gtrDetail?.permanentAddress?.city || "").toUpperCase(),
          "pincode": (gtrDetail?.permanentAddress?.pinCode || "").toUpperCase(),
          "state": (gtrDetail?.permanentAddress?.state || "").toUpperCase(),
          "statecode": StateCode(gtrDetail?.permanentAddress?.state) || "",
          "country": "INDIA",
          "geo_location": ""
        },
        "is_permanent_address_different_than_communication_address": "",
        "communication_address": {
          "address_type": "COMMUNICATION",
          "address": (gtrDetail?.permanentAddress?.addressLine1 || "").toUpperCase(),
          "area": (gtrDetail?.permanentAddress?.district || "").toUpperCase(),
          "taluka":"",
          "district": (gtrDetail?.permanentAddress?.district || "").toUpperCase(),
          "landmark": (pdDetail?.applicant?.houseLandMark || "").toUpperCase(),
          "city": (gtrDetail?.permanentAddress?.city || "").toUpperCase(),
          "pincode": (gtrDetail?.permanentAddress?.pinCode || "").toUpperCase(),
          "state": (gtrDetail?.permanentAddress?.state || "").toUpperCase(),
          "statecode": StateCode(gtrDetail?.permanentAddress?.state) || "",
          "country": "INDIA",
          "geo_location": ""
        },
        "income":{
          "income":"",
      "expenses":"",
      "education_id":"",
      "min_amount":"",
      "max_amount":"",
      "provident_fund_balance":"",
      "severance_balance":"",
      "guarantor_severance_balance":"",
      "income_indicator_net_gross":"",
      "income_indicator_monthly_annual":""
      },
        // "business_address": {
        //   "address_type": "BUSINESS",
        //   "address": (Udhyam?.udyamDetails?.enterpriseName || "").toUpperCase(),
        //   "area": "",
        //   "landmark": (Udhyam?.udyamDetails?.officialAddressOfEnterprise?.RoadStreetLane || "").toUpperCase(),
        //   "city": (Udhyam?.udyamDetails?.officialAddressOfEnterprise?.city || "").toUpperCase(),
        //   "pincode": (Udhyam?.udyamDetails?.officialAddressOfEnterprise.pin || "").toUpperCase(),
        //   "state": (Udhyam?.udyamDetails?.officialAddressOfEnterprise?.state || "").toUpperCase(),
        //   "country": "INDIA",
        //   "geo_location": ""
        // },
        // "business_name": Udhyam?.udyamDetails?.enterpriseName || "",
        // "registration_number": Udhyam?.udhyamRegistrationNo || "",
        //  "branch_name": Udhyam?.MSME-DFO || "",
        "details": [
          {
            "entity_type": "pan",
            "entity_number": gtrDetail?.docType == "panCard" ? gtrDetail?.docNo || "" : "",
          },

          {
            "entity_type": "voter_id",
            "entity_number": gtrDetail?.docType == "voterId" ? gtrDetail?.docNo || "" : "",
        },
          {
            "entity_type": "aadhar",
            "entity_number": gtrDetail?.aadharNo || ""
          },
          {
            "entity_type": "mobile_1",
            "entity_number": gtrDetail?.mobileNo || ""
          },
          {
            entity_type:"grp_id",
            entity_number:""
          },     
          {
            "entity_type": "email",
            "entity_number": gtrDetail?.email || ""
          },
          {
            "entity_type": "image_ext",
            "entity_number": "jpg"
         },{
            "entity_type": "image",
            "entity_number": await getBase64FromUrl(gtrDetail?.guarantorPhoto) || ""
         },{
            "test_image": gtrDetail?.guarantorPhoto
          }
  
        ],
      }
    };

    console.log('Ledger Data:', gtrDetail?.gtrPhoto);

    // Send response (if required)
    return success(res, "Ledger Data", LedgerData);

  } catch (err) {
    console.error("Error in sendLedgerData:", err);
    return unknownError(res, err);
  }
}


// Fetch Ledger data with c_id //

async function getLedger(req, res) {
  try {
    const { customerId, search, page = 1, limit = 100 } = req.query; // Add default pagination values

    if (!customerId) {
      return badRequest(res, "CustomerId is not Found");
    }

    const matchStage = {
      $match: {
        customerId: new mongoose.Types.ObjectId(customerId), // ✅ Convert to ObjectId
      }
    };

    if (search) {
      matchStage.$match.$or = [
        { cid: { $regex: search, $options: "i" } }, // Case-insensitive search in `cid`
        { file_number: { $regex: search, $options: "i" } }, // Search in `file_number`
        { merchant_id: { $regex: search, $options: "i" } }, // Search in `merchant_id`
        { loan_id: { $regex: search, $options: "i" } },
        { AmountPaid: { $regex: search, $options: "i" } },
        { Type: { $eq: search } } // Exact match for `Type`
      ];
    }

    // Perform the aggregate query to search and filter data
    const findCid = await jainummodel.aggregate([
      matchStage,
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeData"
        }
      },
      { $unwind: { path: "$employeeData", preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } }, // Sort results by latest
      {
        $project: {
          _id: 1,
          customerId: 1,
          cid: 1,
          cid_crypt: 1,
          file_number: 1,
          merchant_id: 1,
          loan_id: 1,
          loan_idcrypt: 1,
          loan_number: 1,
          AmountPaid: 1,
          installment_start_date:1,
          product_scheme_code:1,
          "employeeData._id": 1,
          "employeeData.employeName": 1,
          Type: 1,
          createdAt: 1,
        }
      }
    ]);
    

    // Models connection //

    const { status: disbutmentStatus, message: disbusmentinfo, data: getDisbusmentdata } = await getDisbursementData(customerId);
    const { status: finalSectionStatus, message: finalSectionMessage, data: finalSectionDetail } = await getFinalSectionData(customerId);
    const {status: getPropertyStatus, message: properymsg, data:getPropertyDetail} = await getPropertyDetails(customerId);



    // console.log("finalSectionDetail" , finalSectionDetail)

    // console.log("Disbursement" , getDisbusmentdata)

    const DisbusmentDate = moment(getDisbusmentdata?.postDisbursement?.dateOfDisbursement).format('YYYY-MM-DD');
    const prinicipalAmount = finalSectionDetail?.finalLoanAmount
    // Find the record where Type is "applicant"
    const applicantRecord = findCid.find(item => item.Type == "applicant");

    const applicante_loan_details = {
      customer_id: applicantRecord?.cid || '',
      customer_idcrypt: applicantRecord?.cid_crypt || '',
      merchant_id: applicantRecord?.merchant_id || '',
      principal_amount:prinicipalAmount || '',
      product_scheme_code:'',
      disbursement_date:DisbusmentDate || '',
      installment_start_date:'',
      propertyDetails:[{
        "CollateralType":'property',
        "PlotNumber": getPropertyDetail.houseNo || '',
        "PlotAddress": getPropertyDetail.fullAddressOfProperty || '',
        "PlotVillage": getPropertyDetail.villageName || '',
        "PlotTehsil": getPropertyDetail.gramPanchayat || '',
        "PlotDistrict":getPropertyDetail.district || '',
        "PlotPinCode": getPropertyDetail.pinCode || '',
        "PlotState": getPropertyDetail.state || '',
        "PlotArea": Number(getPropertyDetail.totalLandArea) || 0,
        "ExtraPlotArea": 0,
        "BuiltUpArea": Number(getPropertyDetail.totalBuiltUpArea) || '',
        "SuperBuiltUpArea":0,
        "TotalConstructionArea":0,
        "Rate":0,
        "Amount":0,
        "ExtraAmount":0,
        "Total":0,
        "BookingNumber":"N/A",
        "SurveyNumber":"N/A",
        "SurveyNumberArea":0,
        "ConstructionPermissionNumber":"N/A",
        "NonAgriculturePermissionNumber":"N/A",
        "RegistrationNumber":"N/A",
        "AgreementNumber":"N/A",
        "SaleDeedNumber":"N/A",
        "InvoiceNumber":"N/A",
        "RegistrationDate":"",
        "BookingDate": "",
        "ConstructionPermissionDate": "",
        "NonAgriculturePermissionDate": "",
        "AgreementDate": "",
        "SaleDeedDate": "",
        "InvoiceDate": "",
        "MarketRate": 0,
        "MarketValuation": 0,
        "AgentName": "N/A",
        "ExecutiveName": "N/A",
        "Discount": 0,
        "DownPayment": 0,
        "FinanceAmount": 0,
        "Balance": 0,
        "ServiceCharge": 0,
        "IsRegistrationUpdated": false,
        "IsInsuranceUpdated": false,
        "IsNOCUpdated": false,
        "OwnerCount": 0,
        "PlotLength": 0,
        "PlotWidth": 0,
        "PreviousOwnerName": "N/A",
        "PreviousOwnerNumber": "N/A",
        "PreviousOwnerPurchase": "",
        "PreviousOwnerVasikaNumber": "N/A",
        "TypeID":"662"
      }]
    }



   

    // If no records found after search
    if (!findCid.length) {
      return badRequest(res, "No ledger records found for the given CustomerId");
    }

    // Apply pagination
    const totalResults = findCid.length;
    const totalPages = Math.ceil(totalResults / limit);
    const skip = (page - 1) * limit;

    // Paginate the results by skipping and limiting
    const paginatedResults = findCid.slice(skip, skip + limit);

    return success(res, "Fetched the Ledger", {
      totalResults,
      totalPages,
      currentPage: page,
      data: paginatedResults,
      applicante_loan_create: applicante_loan_details
    });
  } catch (error) {
    console.log("Error in getLedger:", error);
    return unknownError(res, 'Internal Server Error');
  }
}
















// Get Loan Summnary // 

const getLoanSummary = async (req, res) => {
  try {
    // ✅ Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    // ✅ Structure request payload correctly
    const inputData = [
      {
        customer_login_id: req.body.customer_login_id,
        customer_login_idcrypt: req.body.customer_login_idcrypt,
        loan_id: req.body.loan_id,
        loan_idcrypt: req.body.loan_idcrypt,
      },
    ];

    console.log("Request Payload:", inputData);

    // ✅ Encrypt data
    const jsonData = JSON.stringify(inputData);
    const encryptedData = encrypt(jsonData, JAINAM_MERCHANT_KEY);
    const checksum = getChecksumFromString(encryptedData, JAINAM_MERCHANT_KEY);

    console.log("Encrypted Data:", encryptedData);
    console.log("Checksum:", checksum);

    // ✅ API request
    const apiURL = "https://www.dfintech.club/admin/api/v2/?a=get-loan-summary";

    const response = await axios.post(apiURL, encryptedData, {
      headers: {
        "X-Checksum": checksum,
        "X-MerchantID": JAINAM_MERCHANT_ID,
        "Content-Type": "text/plain",
      },
    });

    console.log("Raw API Response:", response.data);

    // ✅ Validate API response
    // if (!response.data || !response.data.Body || response.data.Body.length === 0) {
    //  return badRequest(res , 'Invalid Response')
    // }

    // ✅ Send response
    return success(res, 'Loan Summary', response.data)

  } catch (err) {
    console.error("Error in getLoanSummary:", err);
    return unknownError(res, err);
  }
};


// 3.	Get Loan setLoanSubscriptionPlan  //

const setLoanSubscriptionPlan = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const data = req.body;

    console.log("Data Before Encryption:", data);

    // ✅ Ensure correct request format
    const jsonData = JSON.stringify([data]);

    console.log("Final Payload Before Encryption:", jsonData);

    // ✅ Encrypt the data properly
    const encryptedData = encrypt(jsonData, JAINAM_MERCHANT_KEY);
    const checksum = getChecksumFromString(encryptedData, JAINAM_MERCHANT_KEY);

    console.log("Encrypted Data:", encryptedData);
    console.log("Checksum:", checksum);
    console.log("Merchant ID:", JAINAM_MERCHANT_ID);

    // ✅ Send request with proper headers
    const response = await axios.post(
      "https://www.dfintech.club/admin/api/v2/?a=set-loan-subscription-plan",
      encryptedData,
      {
        headers: {
          "X-Checksum": checksum,
          "X-MerchantID": JAINAM_MERCHANT_ID,
          "Content-Type": "text/plain",
        },
      }
    );

    console.log("Raw API Response:", response.data);

    // ✅ Check if the response is valid
    if (!response.data || response.data.Status !== "OK") {
      return badRequest(res, {
        message: response.data.Message || "Subscription failed",
        rawResponse: response.data,
      });
    }

    return success(res, "Loan Subscription Plan Set Successfully", response.data);
  } catch (err) {
    console.error("Error in setLoanSubscriptionPlan:", err);
    return unknownError(res, err);
  }
};


// Set Product Scheme //

const ProductSchema = async (req, res) => {
  try {

    // ✅ Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    // ✅ Structure request payload correctly
    const jsonData = req.body

    const inputData = JSON.stringify([jsonData])
    const encryptedData = encrypt(inputData, JAINAM_MERCHANT_KEY);
    const checksum = getChecksumFromString(encryptedData, JAINAM_MERCHANT_KEY);


    console.log("Encrypted Data:", encryptedData);
    console.log("Checksum:", checksum);

    // ✅ API request
    const apiURL = "https://www.dfintech.club/admin/api/v2/?a=set-product-scheme";

    const response = await axios.post(apiURL, encryptedData, {
      headers: {
        "X-Checksum": checksum,
        "X-MerchantID": JAINAM_MERCHANT_ID,
        "Content-Type": "text/plain",
      }
    }
    )

    console.log("Raw API Response:", response.data);
    // ✅ Send response
    return success(res, 'Loan Summary', response.data)


  } catch (error) {
    return unknownError(res, 'Internal Server Error')
  }
}

// 4.	Get Loan Repayment Schedule //

const getLoanRepaymentSchedule = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const data = req.body;
    const jsonData = JSON.stringify(data);

    const encryptedData = encrypt(jsonData, JAINAM_MERCHANT_KEY);
    const checksum = getChecksumFromString(encryptedData, JAINAM_MERCHANT_KEY);

    console.log("Encrypted Data:", encryptedData);
    console.log("Checksum:", checksum);
    console.log("Merchant ID:", JAINAM_MERCHANT_ID);

    const response = await axios.post(
      'https://www.jainamsoftware.com/admin/api/v2/?a=get-loan-repayment-schedule',
      encryptedData,
      {
        headers: {
          'X-Checksum': checksum,
          'X-MerchantID': JAINAM_MERCHANT_ID,
          'Content-Type': 'text/plain'
        }
      }
    );

    if (response.data.Header[0].Status !== 'OK') {
      return badRequest(res, response.data);
    }

    // ✅ Parse the "Body" field before returning the response
    const parsedBody = JSON.parse(response.data.Body);

    return success(res, 'Loan Repayment Schedule', {
      Header: response.data.Header[0], // Extracted header
      Body: parsedBody // Parsed loan schedule array
    });

  } catch (err) {
    console.error('Error in getLoanRepaymentSchedule:', err);
    return unknownError(res, err);
  }
};



// make a api to fetch the data from the ledger data //


// async function featchBranch(req, res){
//   try{ 

//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }

//     const data = req.body;
//     const jsonData = JSON.stringify([data]);

//     const encryptedData = encrypt(jsonData, JAINAM_MERCHANT_KEY);
//     const checksum = getChecksumFromString(encryptedData, JAINAM_MERCHANT_KEY);

    
//     console.log("Encrypted Data:", encryptedData);
//     console.log("Checksum:", checksum);
//     console.log("Merchant ID:", JAINAM_MERCHANT_ID);

//     const response = await axios.post(
//       'https://www.jainamsoftware.com/admin/api/v2/?a=get-report',
//       encryptedData,
//       {
//         headers: {
//           'X-Checksum': checksum,
//           'X-MerchantID': JAINAM_MERCHANT_ID,
//           'Content-Type': 'text/plain'
//         }
//       }
//     );

//     // ✅ Parse the "Body" field before returning the response
//     const parsedBody = JSON.parse(response.data.Body);

//     return success(res, 'Ledger Data', {
//       Header: response.data.Header[0], // Extracted header
//       Body: parsedBody // Parsed loan schedule
//     });
    
// }
// catch(err){
//   console.error('Error in featchBranch:', err);
//   return unknownError(res, err);
// }
// }



async function featchBranch(req, res) {
  try {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return res.status(400).json({
    //     errorName: "serverValidation",
    //     errors: errors.array(),
    //   });
    // }

    const data = req.body;


    const jsonData = JSON.stringify([data]);

    const encryptedData = encrypt(jsonData, "670087929d0036b8a830c83678819a71");
    const checksum = getChecksumFromString(encryptedData, "670087929d0036b8a830c83678819a71");

    console.log("Encrypted Data:", encryptedData);
    console.log("Checksum:", checksum);
    console.log("Merchant ID:", JAINAM_MERCHANT_ID);

    //    "https://www.jainamsoftware.com/admin/api/v2/?a=get-report", //

    const response = await axios.post(
      "https://www.dfintech.club/admin/api/v2/?a=get-report",
      encryptedData,
      {
        headers: {
          "X-Checksum": checksum,
          "X-MerchantID": "9981a42c691503a4de78c1b6bb13353d",
          "Content-Type": "text/plain",
        },
      }
    );


    // ✅ Ensure "Body" exists and is a valid JSON string
    if (!response.data || !response.data.Body) {
      console.error("Missing or invalid Body in response:", response.data);
      return badRequest(res, { message: "Invalid response from API" });
    }

    let parsedBody;
    try {
      parsedBody = JSON.parse(response.data.Body);
    } catch (jsonError) {
      console.error("JSON Parsing Error:", jsonError);
      console.error("Raw Body Data:", response.data.Body);
      return badRequest(res, { message: "Invalid JSON format in API response" });
    }

    return success(res, "Ledger Data", {
      Header: response.data.Header ? response.data.Header[0] : {}, // Handle missing header
      Body: parsedBody,
    });
  } catch (err) {
    console.error("Error in featchBranch:", err);
    return unknownError(res, err);
  }
}



async function fetchCustomerData(req, res) {
  try {
    const data = req.body;

    console.log("Data Before Encryption:", data);

    const jsonData = JSON.stringify([data]);
    console.log("JSON Data:", jsonData);

    const encryptedData = encrypt(jsonData, "670087929d0036b8a830c83678819a71");
    const checksum = getChecksumFromString(encryptedData, "670087929d0036b8a830c83678819a71");
    const response = await axios.post(
      "https://www.dfintech.club/admin/api/v2/?a=get-report",
      encryptedData,
      {
        headers: {
          "X-Checksum": checksum,
          "X-MerchantID": "9981a42c691503a4de78c1b6bb13353d",
          "Content-Type": "text/plain",
        },
      }
    );

    console.log("API Response with:", response);

    if (!response.data || !response.data.Body) {
      console.error("Missing or invalid Body in response:", response.data);
      return badRequest(res, { message: "Invalid response from API" });
    }

    let parsedBody;
    try {
      parsedBody = JSON.parse(response.data.Body);
    } catch (jsonError) {
      console.error("JSON Parsing Error:", jsonError);
      console.error("Raw Body Data:", response.data.Body);
      return badRequest(res, { message: "Invalid JSON format in API response" });
    }

    return success(res, "Customer Data", {
      Header: response.data.Header ? response.data.Header[0] : {}, // Handle missing header
      Body: parsedBody,
    });
  } catch (err) {
    console.error("Error in fetchCustomerData:", err);
    return unknownError(res, err);
  }
}

// Set loan collateral details to Jainam API // 
async function setLoanCollateral(req, res) {
  try {
    const { collateralData } = req.body;

    if (!collateralData || !Array.isArray(collateralData)) {
      return badRequest(res, "Invalid collateral data format. Expected an array.");
    }

    console.log("Collateral Data Before Encryption:", collateralData);

    // Encrypt collateral data
    const encryptedCollateralPayload = encrypt(JSON.stringify(collateralData), JAINAM_MERCHANT_KEY);
    const collateralChecksum = getChecksumFromString(encryptedCollateralPayload, JAINAM_MERCHANT_KEY);

    // Send encrypted collateral details
    const response = await axios.post(
      "https://www.jainamsoftware.com/admin/api/v2/?a=set-loan-collateral-detail",
      encryptedCollateralPayload,
      {
        headers: {
          "X-Checksum": collateralChecksum,
          "X-MerchantID": JAINAM_MERCHANT_ID,
          "Content-Type": "text/plain",
        },
      }
    );

    // Handle response

    console.log("API Response with:", response.data);

    if (response.data.Header[0].Status !== "OK") {
      return badRequest(res, "Collateral data submission failed");
    }

    return success(res, "Collateral details submitted successfully", response.data);
  } catch (err) {
    console.error("Error in setLoanCollateral:", err);
    return unknownError(res, err);
  }
}











module.exports = { Attachments, setLoan, getLoanSummary, getLoanRepaymentSchedule, sendLedgerData, decryptfunc, verifyChecksum, setLoanSubscriptionPlan, getsendLedgerData, getLedger, ProductSchema , featchBranch , fetchCustomerData  , setLoanCollateral}


