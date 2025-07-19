
require('dotenv').config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const otherDocumentModel = require('../model/branchPendency/OtherDocument.model');
const agricultureIncomeModel = require('../model/branchPendency/agricultureIncomeModel');
const appPdcModel = require('../model/branchPendency/appPdc.model');
const approveLegalFormModel = require('../model/branchPendency/approveLegalForm.model');
const approverRmFormModel = require('../model/branchPendency/approverRmForm.model');
const approverTaggingFormModel = require('../model/branchPendency/approverTaggingForm.model');
const bankDetailFormModel = require('../model/branchPendency/bankDetailForm');
const bankStatementKycModel = require('../model/branchPendency/bankStatementKyc.model');
const electricityKycModel = require('../model/branchPendency/electricityKyc.model');
const esignPhotoModel = require('../model/branchPendency/esignPhoto.model');
const gurrantorBankStatementModel = require('../model/branchPendency/gurrantorbankStatment.model');
const gtrPdcModel = require('../model/branchPendency/gtrPdc.model');
const incomeDetailsModel = require('../model/branchPendency/incomeDetails.model');
const milkIncomeModel = require('../model/branchPendency/milkIncomeModel');
const nachRegistrationModel = require('../model/branchPendency/nachRegistration.model');
const otherBusinessModel = require('../model/branchPendency/otherBusinessModel');
const physicalFileCourierModel = require('../model/branchPendency/physicalFileCourier.model');
const propertyPaperModel = require('../model/branchPendency/propertyPaper.model');
const rmPaymentUpdateModel = require('../model/branchPendency/rmPaymentUpdateModel');
const salaryAndOtherIncomeModel = require('../model/branchPendency/salaryAndOtherIncomeModel');
const samagraIdKycModel = require('../model/branchPendency/samagraIdKyc.model');
const signKycModel = require('../model/branchPendency/signkyc.model');
const udhyamKycModel = require('../model/branchPendency/udhyamKyc.model');
const CallDone = require("../model/collection/callDone.model");
const CashTransfer = require("../model/collection/cashTransfer.model");
const CollectionSheet = require("../model/collection/collectionSheet.model");
const GoogleSheetCustomer = require("../model/collection/googleSheetCustomer.model");
const PosCloser = require("../model/collection/posCloser.model");
const Visit = require("../model/collection/visit.model");
const TotalCashBalance = require("../model/collection/totalCashBalance.model");

const salesCasesModel = require("../model/queryForm.model")
const propertyPaperKycModel = require("../model/property.model")
const CollectionSheet1 = require("../model/process.model")
const physical = require("../model/physicalFileCourier.model")
const physicallender = require("../model/physicalFileCourierlender")
const panFather = require("../model/panFather.model")
const payment = require("../model/payment.model")
const loginCase = require("../model/loginCashPayment.model")
const leadGenerate = require("../model/leadGenerate.model")
const incomeModel  = require("../model/income.model")
const CollectionSheet1Model = require("../model/customerIncomeDetail.model")
const CollectionSheet2Model = require("../model/customerPropertyDetail.model")

const aadharModel = require("../model/aadhaar.model")
const aadharOcr = require("../model/aadhaarOcr.model")
const bankAcount = require("../model/bankAccount.model")
const bankStatement = require("../model/banking.model")
const bankStatementKyc = require("../model/charges.model")

const Model1 = require("../model/finalApproval/internalLegal.model")
const cashTransferModel1 = require("../model/finalApproval/sanctionPendency.model")
const visitModel1 = require("../model/finalApproval/Insurance.model")
const visitModel2 = require("../model/finalApproval/allDocument.model")
const visitModel3 = require("../model/finalApproval/btBankDetail.model")
const visitModel4 = require("../model/finalApproval/decision.model")
const visitModel5 = require("../model/finalApproval/documentQuery.model")
const collectionSheetModel6 = require("../model/finalApproval/finalEligibility");

const { success, unknownError } = require("../../../../globalHelper/response.globalHelper");
const axios = require("axios");
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const pLimit = require('p-limit'); // Add this package: npm install p-limit

// S3 client setup
const s3Client = new S3Client({
  endpoint: 'https://blr1.digitaloceanspaces.com',
  region: 'blr1',
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
  }
});

// Create concurrency limit for file operations
const downloadLimit = pLimit(10); // Process up to 10 downloads concurrently
const uploadLimit = pLimit(15); // Process up to 15 uploads concurrently
const dbLimit = pLimit(20); // Process up to 20 DB updates concurrently

// Improved download function with retries and timeout
async function downloadFile(url, retries = 3, timeout = 15000) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'arraybuffer',
        timeout: timeout
      });
      
      // Create a unique temp file name
      const tempDir = os.tmpdir();
      const fileName = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 10)}_${path.basename(url)}`;
      const tempFilePath = path.join(tempDir, fileName);
      
      // Save the file
      await fs.writeFile(tempFilePath, response.data);
      return tempFilePath;
    } catch (error) {
      attempt++;
      console.error(`Download attempt ${attempt}/${retries} failed for ${url}:`, error.message);
      if (attempt >= retries) return null;
      // Exponential backoff
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
    }
  }
  return null;
}

// Function to upload file to Spaces
async function uploadToSpaces(filePath, retries = 3) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      // Read the file
      const fileContent = await fs.readFile(filePath);
      const fileName = path.basename(filePath);
      
      // Create new path in bucket
      const filePathInBucket = `${process.env.PATH_BUCKET}/LOS/${Date.now()}_${fileName}`;
      
      // Upload parameters
      const params = {
        Bucket: 'finexe',
        Key: filePathInBucket,
        Body: fileContent,
        ACL: 'public-read',
        ContentType: getContentType(fileName)
      };
      
      // Upload file
      const command = new PutObjectCommand(params);
      await s3Client.send(command);
      
      // Delete temp file if it's in the temp directory
      if (filePath.startsWith(os.tmpdir())) {
        try { await fs.unlink(filePath); } catch (e) { /* ignore deletion errors */ }
      }
      
      return `https://cdn.fincooper.in/${filePathInBucket}`;
    } catch (error) {
      attempt++;
      console.error(`Upload attempt ${attempt}/${retries} failed for ${filePath}:`, error.message);
      if (attempt >= retries) return null;
      // Exponential backoff
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
    }
  }
  return null;
}

// Get content type based on file extension
function getContentType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };
  return types[ext] || 'application/octet-stream';
}

// Extract URLs recursively from an object
function extractUrls(obj, urls = []) {
  for (const key in obj) {
    if (typeof obj[key] === "string" && obj[key].includes("https://prod.fincooper.in/uploads")) { // https://prod.fincooper.in/https://cdn.fincooper.in/PROD/LOS/IMAGE",
      urls.push({
        path: [key],
        url: obj[key],
        parent: obj
      });
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      extractUrls(obj[key], urls).forEach(item => {
        item.path.unshift(key);
        return item;
      });
    }
  }
//   console.log("--////////////////////////////------------------------------///////////////////////////---",urls)
  return urls;
}

// Process documents in batches
async function updateApplicantStorage(req, res) {
  try {
    // Define batch size
    const BATCH_SIZE = 50;
    
    // Get total count
    const totalCount = await CollectionSheet.countDocuments({});
    let processedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Process in batches to avoid memory issues
    for (let offset = 0; offset < totalCount; offset += BATCH_SIZE) {
      console.log(`Processing batch ${Math.floor(offset/BATCH_SIZE) + 1}/${Math.ceil(totalCount/BATCH_SIZE)}`);
      
      // Get batch of documents
      const documents = await CollectionSheet
        .find({})
        .skip(offset)
        .limit(BATCH_SIZE)
        .lean(); // Use lean() to get plain JavaScript objects instead of Mongoose documents
      
      const batchPromises = documents.map(async (doc) => {
        try {
          // Extract all URLs that need to be processed
          const urlsToProcess = extractUrls(doc);
          
          if (urlsToProcess.length === 0) {
            processedCount++;
            return { docId: doc._id, updated: false };
          }
          
          // Process all URLs concurrently with limits
          const urlPromises = urlsToProcess.map(item => 
            downloadLimit(async () => {
              try {
                const tempFilePath = await downloadFile(item.url);
                if (!tempFilePath) {
                  errors.push({ docId: doc._id, path: item.path.join('.'), error: "Failed to download file" });
                  return { ...item, success: false };
                }
                
                const newUrl = await uploadLimit(async () => await uploadToSpaces(tempFilePath));
                if (!newUrl) {
                  errors.push({ docId: doc._id, path: item.path.join('.'), error: "Failed to upload file" });
                  return { ...item, success: false };
                }
                
                // Set the new URL
                let target = item.parent;
                target[item.path[item.path.length - 1]] = newUrl;
                
                return { ...item, success: true, newUrl };
              } catch (err) {
                console.error(`Error processing URL: ${item.url}`, err);
                errors.push({ docId: doc._id, path: item.path.join('.'), error: err.message });
                return { ...item, success: false };
              }
            })
          );
          
          const results = await Promise.all(urlPromises);
          const successCount = results.filter(r => r.success).length;
          
          if (successCount > 0) {
            // Update the document in the database
            await dbLimit(async () => {
              await CollectionSheet.updateOne(
                { _id: doc._id },
                { $set: doc }
              );
            });
            
            updatedCount++;
          }
          
          processedCount++;
          return { docId: doc._id, updated: successCount > 0 };
        } catch (docError) {
          console.error(`Error processing document ${doc._id}:`, docError);
          errors.push({ docId: doc._id, error: docError.message });
          errorCount++;
          processedCount++;
          return { docId: doc._id, error: docError.message };
        }
      });
      
      // Wait for all documents in the current batch to be processed
      await Promise.all(batchPromises);
      
      // Provide progress report after each batch
      console.log(`Progress: ${processedCount}/${totalCount} documents (${Math.round(processedCount/totalCount*100)}%)`);
    }
    
    return success(res, "Storage migration completed", {
      totalProcessed: processedCount,
      updatedCount,
      errorCount,
      errors: errors.length > 100 ? errors.slice(0, 100) : errors // Limit errors in response
    });
    
  } catch (error) {
    console.error("Migration failed:", error);
    return unknownError(res, error.message);
  }
}


// async function getDetailAllFiles(req , res){
//     try {
//         const data = await propertyPaperKycModel.find({});
//         return success(res, "Data found", data);
//     }catch(error){
//         console.error("Error in getDetailAllFiles:", error);
//         return unknownError(res, error.message);
//     }
// }

async function getDetailAllFiles(req, res) {
  try {
    const [
      aadharModelData,
      aadharOcrData,
      bankAcountData,
      bankStatementData,
      bankStatementKycData
    ] = await Promise.all([
      aadharModel.find({}),
      aadharOcr.find({}),
      bankAcount.find({}),
      bankStatement.find({}),
      bankStatementKyc.find({})
    ]);

    return success(res, "All data fetched", {
      aadharModelData,
      aadharOcrData,
      bankAcountData,
      bankStatementData,
      bankStatementKycData
    });

  } catch (error) {
    console.error("Error in getDetailAllFiles:", error);
    return unknownError(res, error.message);
  }
}



  

module.exports = {
    getDetailAllFiles,
  uploadToSpaces,
  updateApplicantStorage
};