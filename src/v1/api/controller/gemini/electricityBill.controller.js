const { generateAIResponse, generateAIResponseWithBase64, generateAIResponseWithImageUrl } = require("../../services/geminiService.js");
const cibilModel = require("../../model/cibilDetail.model.js")

const mongoose = require("mongoose");
const {
  success,
  badRequest,
  unknownError,
} = require("../../../../../globalHelper/response.globalHelper.js");



// Get Prompt for cibil credit report //

const { electricityBillPrompt, shopIncomePrompt, udhyamPrompt, properPaperPrompt, generatePanVerificationPrompt, generateAadharVerificationPrompt, coOwnershipDeedPrompt,
  propertyDetailPrompt
} = require("../../prompt/electricityBillDoc.prompt.js");
const { fetchFileAsBase64 } = require("../../../api/services/geminiService.js")



// Genertate AI with Image URL //
const electricityBillDocAi = async (req, res) => {
  try {
    const { prompt: userPrompt, imageUrl } = req.body;

    if (!imageUrl) {
      return badRequest(res, "Image URL not provided");
    }

    // Generate system prompt using the reusable function
    const finalPrompt = electricityBillPrompt(userPrompt);
    const aiResponse = await generateAIResponseWithImageUrl(finalPrompt, imageUrl);
    return success(res, `Electricity Bill Detail`, aiResponse);
  } catch (error) {
    console.error("Error:", error);
    return unknownError(res, "Internal server error");
  }
};

//---------------Shop Income  Management---------------------------
const shopIncomeAi = async (req, res) => {
  try {
    const { prompt: userPrompt, shopName, incomeDetail } = req.body;

    if (!shopName) {
      return badRequest(res, "shopName not provided");
    }

    // Generate system prompt using the reusable function
    const finalPrompt = shopIncomePrompt(userPrompt, shopName, incomeDetail);
    const aiResponse = await generateAIResponse(finalPrompt);
    return success(res, `${shopName} Income  Detail`, aiResponse);
  } catch (error) {
    console.error("Error:", error);
    return unknownError(res, "Internal server error");
  }
};


// Genertate AI with Image URL //
const udhyamDocAi = async (req, res) => {
  try {
    const { prompt: userPrompt, imageUrl } = req.body;

    if (!imageUrl) {
      return badRequest(res, "Image URL not provided");
    }

    // Generate system prompt using the reusable function
    const finalPrompt = udhyamPrompt(userPrompt);
    const aiResponse = await generateAIResponseWithImageUrl(finalPrompt, imageUrl);
    // console.log("ss",aiResponse)
    if (!aiResponse.status) {

      return badRequest(res, "Please upload correct udyam PDF")
    }
    return success(res, `Udyam Fetch Detail From Document`, aiResponse);
  } catch (error) {
    console.error("Error:", error);
    return unknownError(res, "Internal server error");
  }
};

// ----------------Property paper Document Doc-----------------------
const propertyPaperDocAi = async (req, res) => {
  try {
    const { prompt: userPrompt, imageUrl } = req.body;

    if (!imageUrl) {
      return badRequest(res, "Image URL not provided");
    }

    // Generate system prompt using the reusable function
    const finalPrompt = properPaperPrompt(userPrompt);
    const aiResponse = await generateAIResponseWithImageUrl(finalPrompt, imageUrl);

    return success(res, `Property Paper Fetch Detail From Document`, aiResponse);
  } catch (error) {
    console.error("Error:", error);
    return unknownError(res, "Internal server error");
  }
};



const verifyAadharAndPan = async (req, res) => {
  try {
    const { documentType, expectedNumber, imageUrl } = req.body;

    if (!documentType || !expectedNumber || !imageUrl) {
      return badRequest(res, "documentType, expectedNumber, and imageUrl are required.");
    }

    let prompt;
    if (documentType.toLowerCase() === "aadhar") {
      prompt = generateAadharVerificationPrompt(expectedNumber);
    } else if (documentType.toLowerCase() === "pan") {
      prompt = generatePanVerificationPrompt(expectedNumber);
    } else {
      return badRequest(res, "Invalid document type. Only 'aadhar' and 'pan' are supported.");
    }

    const aiResponse = await generateAIResponseWithImageUrl(prompt, imageUrl);

    const extractedNumber = aiResponse?.extractedNumber || "";

    const normalizedExtracted = extractedNumber.replace(/\s+/g, "").toLowerCase();
    const normalizedExpected = expectedNumber.replace(/\s+/g, "").toLowerCase();
    const isMatch = normalizedExtracted === normalizedExpected;

    const result = {
      status: isMatch ? "matched" : "notMatched",
      documentType,
      extractedNumber,
      expectedNumber,
      isValid: isMatch,
      message: isMatch ?
        "Document verification successful. The number matches the expected value." :
        "Document verification failed. The extracted number does not match the expected value."
    };

    if (aiResponse.name) result.name = aiResponse.name;
    if (aiResponse.dob) result.dob = aiResponse.dob;
    if (aiResponse.gender) result.gender = aiResponse.gender;
    if (aiResponse.address) result.address = aiResponse.address;

    return success(res, `${documentType} verification result`, result);
  } catch (error) {
    console.error("verifyAadharAndPan Error:", error);
    return unknownError(res, "Failed to verify document: " + error.message);
  }
};


const coOwnershipDeedDocAi = async (req, res) => {
  try {
    const { prompt: userPrompt, imageUrl, documentType } = req.body;

    if (!imageUrl) {
      return badRequest(res, "Image URL not provided");
    }

    // Generate system prompt using the reusable function
    const finalPrompt = coOwnershipDeedPrompt(userPrompt, documentType);
    const aiResponse = await generateAIResponseWithImageUrl(finalPrompt, imageUrl);

    return success(res, `Property Paper Fetch Detail From Document`, aiResponse);
  } catch (error) {
    console.error("Error:", error);
    return unknownError(res, "Internal server error");
  }
};


const propertyDetailDocAi = async (req, res) => {
  try {
    const { prompt: userPrompt, imageUrl, documentType } = req.body;

    if (!imageUrl) {
      return badRequest(res, "Image URL not provided");
    }

    // Generate system prompt using the reusable function
    const finalPrompt = propertyDetailPrompt(userPrompt, documentType);
    const aiResponse = await generateAIResponseWithImageUrl(finalPrompt, imageUrl);

    return success(res, `Property Paper Fetch Detail From Document`, aiResponse);
  } catch (error) {
    console.error("Error:", error);
    return unknownError(res, "Internal server error");
  }
};

//------------------------------------------------------------------------------------/-/-----------------------------------------------

// const extractCibilDataFromPdf = async (req, res) => {
//   try {
//     const { customerId , type , id } = req.body;

//     const cibilDetail = await cibilModel.findOne(customerId)

//     if(!customerId){
//       return badRequest(res, "customer Id is required");
//     }
//     if(["applicant","coApplicant"].includes(type)){
//       return badRequest(res, `type to be "applicant" and "coApplicant"`);
//     }
//     // Generate AI prompt for CIBIL data extraction
//     const prompt = generateCibilExtractionPrompt();

//     // Get AI response with PDF analysis
//     const aiResponse = await generateAIResponseWithImageUrl(prompt, pdfUrl);

//     // Process and validate the extracted data
//     const processedData = processCibilData(aiResponse);

//     return success(res, "CIBIL data extraction completed", processedData);
//   } catch (error) {
//     console.error("Error:", error);
//     return unknownError(res, "Failed to extract CIBIL data: " + error.message);
//   }
// };


const extractCibilDataFromPdf = async (req, res) => {
  try {
    const { customerId, type, id } = req.body;
    
    // Validate customerId
    if (!customerId) {
      return badRequest(res, "customer Id is required");
    }
    
    // Validate type
    if (!["applicant", "coApplicant"].includes(type)) {
      return badRequest(res, `type should be "applicant" or "coApplicant"`);
    }
    
    // Find the customer CIBIL detail
    const cibilDetail = await cibilModel.findOne({ customerId });
    
    if (!cibilDetail) {
      return badRequest(res, "CIBIL details not found for this customer");
    }
    
    let pdfUrl = "";
    
    // Get the appropriate CIBIL report based on type
    if (type === "applicant") {
      // Check if applicant has fetch history
      if (!cibilDetail.applicantFetchHistory || cibilDetail.applicantFetchHistory.length === 0) {
        return badRequest(res, "No CIBIL report found for applicant");
      }
      
      // Get the last CIBIL report from applicant fetch history
      const lastIndex = cibilDetail.applicantFetchHistory.length - 1;
      pdfUrl = cibilDetail.applicantFetchHistory[lastIndex].cibilReport;
      
    } else if (type === "coApplicant") {
      // Validate id for coApplicant
      if (!id) {
        return badRequest(res, "Co-applicant ID is required");
      }
      
      // Find the co-applicant by id
      const coApplicant = cibilDetail.coApplicantData.find(
        (item) => item._id.toString() === id
      );
      
      if (!coApplicant) {
        return badRequest(res, "Co-applicant not found");
      }
      
      // Check if co-applicant has fetch history
      if (!coApplicant.coApplicantFetchHistory || coApplicant.coApplicantFetchHistory.length === 0) {
        return badRequest(res, "No CIBIL report found for co-applicant");
      }
      
      // Get the last CIBIL report from co-applicant fetch history
      const lastIndex = coApplicant.coApplicantFetchHistory.length - 1;
      pdfUrl = coApplicant.coApplicantFetchHistory[lastIndex].cibilReport;
    }
    
    if (!pdfUrl) {
      return badRequest(res, "CIBIL report URL not found");
    }

    // Generate AI prompt for CIBIL data extraction
    const prompt = generateCibilExtractionPrompt();
    
    // Get AI response with PDF analysis
    const aiResponse = await generateAIResponseWithImageUrl(prompt, pdfUrl);
    
    // Process and validate the extracted data
    const processedData = processCibilData(aiResponse);
    
    // Update the CIBIL detail with processed data
    if (type === "applicant") {
      // Update applicant CIBIL detail
      await cibilModel.findOneAndUpdate(
        { customerId },
        { $set: { applicantCibilDetail: processedData } }
      );
    } else if (type === "coApplicant") {
      // Update co-applicant CIBIL detail
      await cibilModel.findOneAndUpdate(
        { customerId, "coApplicantData._id": id },
        { $set: { "coApplicantData.$.coApplicantCibilDetail": processedData } }
      );
    }
    
    return success(res, "CIBIL data extraction completed", processedData);
  } catch (error) {
    console.error("Error:", error);
    return unknownError(res, "Failed to extract CIBIL data: " + error.message);
  }
};



const generateCibilExtractionPrompt = () => {
  return `
    You are an intelligent CIBIL report extraction system. Extract all relevant data from this CIBIL report PDF and organize it into a structured JSON format.
    
    1. Extract the header information (member reference number, date processed, etc.)
    2. Extract personal information (name, birth date, gender)
    3. Extract ID information (PAN, Voter ID, Aadhaar, etc.)
    4. Extract contact information (telephone numbers)
    5. Extract addresses
    6. Extract credit score information
    7. Extract account details for all accounts (both active and closed)
    8. Extract enquiry history
    9. Generate summary statistics
    
    ONLY PROVIDE DATA IN THE SPECIFIED JSON FORMAT BELOW. DO NOT INCLUDE ANY EXPLANATIONS OR MARKDOWN.
    
    Required JSON format:
    {
      "creditData": [
        {
          "tuefHeader": {
            "headerType": "TUEF",
            "version": "12",
            "memberRefNo": "",
            "enquiryMemberUserId": "",
            "subjectReturnCode": 1,
            "enquiryControlNumber": "",
            "dateProcessed": "",
            "timeProcessed": ""
          },
          "names": [
            {
              "index": "N01",
              "name": "",
              "birthDate": "",
              "gender": ""
            }
          ],
          "ids": [
            {
              "index": "I01",
              "idType": "01",
              "idNumber": ""
            }
          ],
          "telephones": [
            {
              "index": "T01",
              "telephoneNumber": "",
              "telephoneType": "01"
            }
          ],
          "scores": [
            {
              "scoreName": "CIBILTUSC3",
              "scoreCardName": "",
              "scoreCardVersion": "",
              "scoreDate": "",
              "score": ""
            }
          ],
          "addresses": [
            {
              "index": "A01",
              "line1": "",
              "line2": "",
              "line3": "",
              "stateCode": "",
              "pinCode": "",
              "addressCategory": "",
              "residenceCode": "",
              "dateReported": ""
            }
          ],
          "accounts": [
            {
              "index": "T001",
              "memberShortName": "",
              "accountType": "",
              "ownershipIndicator": 0,
              "dateOpened": "",
              "dateReported": "",
              "highCreditAmount": 0,
              "currentBalance": 0,
              "paymentHistory": "",
              "paymentStartDate": "",
              "paymentEndDate": "",
              "loanStatus": "",
              "obligated": "",
              "actionStatus": "",
              "collateralType": "",
              "emiAmount": 0
            }
          ],
          "enquiries": [
            {
              "index": "I001",
              "enquiryDate": "",
              "memberShortName": "",
              "enquiryPurpose": "",
              "enquiryAmount": 0
            }
          ]
        }
      ],
      "cibilSummary": {
        "accountSummary": {
          "totalAccounts": 0,
          "overdueAccounts": 0,
          "zeroBalanceAccounts": 0,
          "highCreditAmount": 0,
          "currentBalance": 0,
          "overdueBalance": 0,
          "recentDateOpened": "",
          "oldestDateOpened": ""
        },
        "inquirySummary": {
          "totalInquiry": 0,
          "inquiryPast30Days": 0,
          "inquiryPast12Months": 0,
          "inquiryPast24Months": 0,
          "recentInquiryDate": ""
        }
      }
    }
  `;
};

function createDefaultStructure() {
  return {
    creditData: [
      {
        tuefHeader: {},
        names: [],
        ids: [],
        telephones: [],
        scores: [],
        addresses: [],
        accounts: [],
        enquiries: []
      }
    ],
    cibilSummary: {
      accountSummary: {},
      inquirySummary: {}
    }
  };
}

function processCibilData(extractedData) {
  try {
    // If extractedData is empty or invalid, return default structure
    if (!extractedData || typeof extractedData !== 'object') {
      return createDefaultStructure();
    }

    const processedData = {
      creditData: [],
      cibilSummary: {
        accountSummary: {},
        inquirySummary: {}
      }
    };

    // Process credit data
    if (extractedData.creditData && Array.isArray(extractedData.creditData)) {
      extractedData.creditData.forEach(creditRecord => {
        const processedRecord = {
          tuefHeader: processObjectData(creditRecord.tuefHeader),
          names: processArrayData(creditRecord.names),
          ids: processArrayData(creditRecord.ids),
          telephones: processArrayData(creditRecord.telephones),
          scores: processArrayData(creditRecord.scores),
          addresses: processArrayData(creditRecord.addresses),
          accounts: processArrayData(creditRecord.accounts),
          enquiries: processArrayData(creditRecord.enquiries)
        };

        processedData.creditData.push(processedRecord);
      });
    } else {
      // Add empty credit data if not present
      processedData.creditData.push({
        tuefHeader: {},
        names: [],
        ids: [],
        telephones: [],
        scores: [],
        addresses: [],
        accounts: [],
        enquiries: []
      });
    }

    // Process summary
    if (extractedData.cibilSummary) {
      if (extractedData.cibilSummary.accountSummary) {
        processedData.cibilSummary.accountSummary = processObjectData(extractedData.cibilSummary.accountSummary);
      }

      if (extractedData.cibilSummary.inquirySummary) {
        processedData.cibilSummary.inquirySummary = processObjectData(extractedData.cibilSummary.inquirySummary);
      }
    }

    return processedData;
  } catch (error) {
    console.error("Data processing error:", error);
    return createDefaultStructure(); // Return default structure on error
  }
}

function processObjectData(obj) {
  if (!obj || typeof obj !== 'object') return {};

  const processedObj = {};

  // Process each field
  for (const [key, value] of Object.entries(obj)) {
    // Convert string numbers to actual numbers
    if (typeof value === 'string' && !isNaN(value) && !isNaN(parseFloat(value))) {
      // Check if it should be an integer
      if (/^\d+$/.test(value)) {
        processedObj[key] = parseInt(value, 10);
      } else {
        processedObj[key] = parseFloat(value);
      }
    } else {
      processedObj[key] = value;
    }
  }

  return processedObj;
}

function processArrayData(arr) {
  if (!arr || !Array.isArray(arr)) return [];

  return arr.map(item => {
    if (typeof item === 'object') {
      return processObjectData(item);
    }
    return item;
  });
}


//
module.exports = {
  electricityBillDocAi,
  shopIncomeAi,
  udhyamDocAi,
  propertyPaperDocAi,
  verifyAadharAndPan,
  coOwnershipDeedDocAi,
  propertyDetailDocAi,
  extractCibilDataFromPdf,
}

