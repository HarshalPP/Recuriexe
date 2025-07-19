const {
  success,
  unknownError,
  serverValidation,
  unauthorized,
  badRequest,
  notFound,
} = require("../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const processModel = require("../model/process.model");
const customerModel = require("../model/customer.model");
const extrnalVendorModel = require("../model/externalVendorForm.model");
const vendorModel = require("../model/adminMaster/vendor.model");
const externalVendorFormModel = require("../model/externalVendorForm.model");
const {sendEmail} = require('../controller/functions.Controller');  
const { externalVendorGoogleSheet } = require("./googleSheet.controller");
const externalVendorManualModel = require("../model/externalVendorManualForm.model");


// async function addExternalVendor(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return serverValidation(res, {
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }
//     const tokenId = req.Id
//     const { customerId , rcuVendorId , legalVendorId , technicalVendorId , otherVendorId , branchVendorId , requirement , uploadRcuDocuments , uploadLegalDocuments , uploadTechnicalDocuments , uploadOtherDocuments , uploadBranchDocuments} = req.body;
//     const findCustomer = await customerModel.findById(customerId);
//     if (!findCustomer) {
//       return notFound(res, "Customer Not Found");
//     }

//     const vendorMap = {
//       rcuVendorId: "RCU Vendor",
//       legalVendorId: "Legal Vendor",
//       technicalVendorId: "Technical Vendor",
//       otherVendorId: "Other Vendor",
//       branchVendorId: "Branch Vendor"
//     };
//     // Collect all vendor IDs and their types
//     const vendorIds = [];
//     const vendorTypes = {};
    
//     if (rcuVendorId) {
//       vendorIds.push(rcuVendorId);
//       vendorTypes[rcuVendorId] = vendorMap.rcuVendorId;
//     }
//     if (legalVendorId) {
//       vendorIds.push(legalVendorId);
//       vendorTypes[legalVendorId] = vendorMap.legalVendorId;
//     }
//     if (technicalVendorId) {
//       vendorIds.push(technicalVendorId);
//       vendorTypes[technicalVendorId] = vendorMap.technicalVendorId;
//     }
//     if (otherVendorId) {
//       vendorIds.push(otherVendorId);
//       vendorTypes[otherVendorId] = vendorMap.otherVendorId;
//     }
//     if (branchVendorId) {
//       vendorIds.push(branchVendorId);
//       vendorTypes[branchVendorId] = vendorMap.branchVendorId;
//     }
    
//     // Check if all vendor IDs exist in the database
//     const existingVendors = await vendorModel.find({ _id: { $in: vendorIds } });
    
//     if (existingVendors.length !== vendorIds.length) {
//       // Find missing vendor IDs and their types
//       const missingVendors = vendorIds.filter(id => !existingVendors.some(vendor => vendor._id.toString() === id));
//       const missingVendorMessages = missingVendors.map(id => vendorTypes[id]);
      
//       // Return an error with the names of the missing vendors
//       return badRequest(res, `${missingVendorMessages.join(', ')} not found`);
//     }
  
//     const processDetail =  await processModel.findOne({customerId})
//     // console.log('processDetail',processDetail)
//     let vendorData = { };
    
//     let statusByRCU = processDetail.statusByRCUVender
//     if (rcuVendorId) {
//       statusByRCU = statusByRCU === "pending"?"WIP":statusByRCU
//       vendorData.rcu = { rcuVendorId, uploadRcuDocuments };
//       // vendorData.rcu = { rcuVendorId };
//     }
//     let statusByLegal = processDetail.statusByLegalVender
//     if (legalVendorId) {
//       statusByLegal = statusByLegal === "pending"?"WIP":statusByLegal
//       vendorData.legal = { legalVendorId, uploadLegalDocuments };
//       // vendorData.legal = { legalVendorId };
//     }
//     let statusByTechnical = processDetail.statusByTechnicalVender
//     if (technicalVendorId) {
//       statusByTechnical = statusByTechnical === "pending"?"WIP":statusByTechnical
//       vendorData.technical = { technicalVendorId , uploadTechnicalDocuments };
//       // vendorData.technical = { technicalVendorId};
//     } 
//     let statusByOtherVendor = processDetail.statusByOtherVender
//     if (otherVendorId) {
//       statusByOtherVendor = statusByOtherVendor === "pending"?"WIP":statusByOtherVendor
//       vendorData.otherVendor = { otherVendorId , uploadOtherDocuments };
//       // vendorData.otherVendor = { otherVendorId };
//     }
//     let statusByBranchVendor = processDetail.statusByBranchVendor
//     if (branchVendorId) {
//       statusByBranchVendor = statusByBranchVendor === "pending"?"WIP":statusByBranchVendor
//       vendorData.branchVendor = { branchVendorId , requirement , uploadBranchDocuments };
//     }

//     const existingVendor = await extrnalVendorModel.findOne({ customerId });
//     let externalVendorData;
//     if (existingVendor) {
//       externalVendorData = await extrnalVendorModel.findOneAndUpdate({ customerId },
//         { $set: { rcu: vendorData.rcu, legal: vendorData.legal, technical: vendorData.technical , otherVendor : vendorData.otherVendor ,  externalVendorId: tokenId , branchVendor:vendorData.branchVendor } },
//         { upsert: true, new: true });
//     } else {
//       const externalVendor = new extrnalVendorModel({
//         customerId,
//         externalVendorId: tokenId,
//         ...vendorData,
//       });
//       externalVendorData = await externalVendor.save();
//     }
    
//     if (technicalVendorId) {
//       const technicalVendor = await vendorModel.findById({ _id:technicalVendorId})
//       const baseURL = 'https://stageapi.fincooper.in';
//       const documentsArray = externalVendorData.technical.uploadTechnicalDocuments
  
//       const pdf = `
//       <p>This Mail By Vendor Assign Documents</p>
//     `;
      
//   const attachments = documentsArray.map((data) => ({
//     path: baseURL + data,
//     filename: data.split('/').pop(), // Use dynamic filename based on data
//     contentType: 'application/pdf'
//   }));


//       const title = "Send Technical vendor Form Assign"
//       const toEmails = technicalVendor.communicationToMailId?technicalVendor.communicationToMailId :""
//       const ccEmails = technicalVendor.communicationCcMailId?technicalVendor.communicationCcMailId :""
//       sendEmail(toEmails, ccEmails, "Send Mail By External" ,pdf,attachments);
//     }

//     const requiredFields = ['customerId', 'rcuVendorId', 'legalVendorId','technicalVendorId']
//     let allFieldsFilled;
//     allFieldsFilled = requiredFields.every(field => {
//       const value = req.body[field];
//       return value !== undefined && value !== null && value !== "";
//     });
//     if (allFieldsFilled) {
//       console.log('all fields fill',allFieldsFilled)
//       await processModel.updateOne({ customerId }, { $set: { vendorId:req.Id , statusByVendor: "pending" , rcuVendorId: rcuVendorId , statusByRCUVender:statusByRCU , legalVendorId: legalVendorId , statusByLegalVender:statusByLegal , technicalVendorId: technicalVendorId , statusByTechnicalVender :statusByTechnical , otherVendorId:otherVendorId , statusByOtherVender : statusByOtherVendor} });
//     } else {
//       console.log('all fields not fill',allFieldsFilled)
//       await processModel.updateOne({ customerId }, { $set: { vendorId:req.Id , statusByVendor: "pending" , rcuVendorId: rcuVendorId , statusByRCUVender:statusByRCU , legalVendorId: legalVendorId , statusByLegalVender:statusByLegal , technicalVendorId: technicalVendorId , statusByTechnicalVender :statusByTechnical ,  otherVendorId:otherVendorId , statusByOtherVender : statusByOtherVendor} });
//     }
//     if (existingVendor) {
//       success(res, "External Vendor updated successfully", externalVendorData)
//     } else {
//       success(res, "External Vendor added successfully", externalVendorData)
//     }
//   } catch (error) {
//     console.log(error);
//     return unknownError(res, error);
//   }
// }


async function addExternalVendor(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const tokenId = req.Id
    const { customerId , rcuVendorId , legalVendorId , technicalVendorId , otherVendorId , branchVendorId , requirement , uploadRcuDocuments , uploadLegalDocuments , uploadTechnicalDocuments , uploadOtherDocuments , uploadBranchDocuments} = req.body;
    const customerExit = await customerModel.findById(customerId)
    if(!customerExit){
      return notFound(res, "customer Id Not Found")
    }
    const customerFinId = customerExit.customerFinId? customerExit.customerFinId : ' '


    const vendorMap = {
      rcuVendorId: "RCU Vendor",
      legalVendorId: "Legal Vendor",
      technicalVendorId: "Technical Vendor",
      otherVendorId: "Other Vendor",
      branchVendorId: "Branch Vendor"
    };
    // Collect all vendor IDs and their types
    const vendorIds = [];
    const vendorTypes = {};
    
    if (rcuVendorId) {
      vendorIds.push(rcuVendorId);
      vendorTypes[rcuVendorId] = vendorMap.rcuVendorId;
    }
    if (legalVendorId) {
      vendorIds.push(legalVendorId);
      vendorTypes[legalVendorId] = vendorMap.legalVendorId;
    }
    if (technicalVendorId) {
      vendorIds.push(technicalVendorId);
      vendorTypes[technicalVendorId] = vendorMap.technicalVendorId;
    }
    if (otherVendorId) {
      vendorIds.push(otherVendorId);
      vendorTypes[otherVendorId] = vendorMap.otherVendorId;
    }
    if (branchVendorId) {
      vendorIds.push(branchVendorId);
      vendorTypes[branchVendorId] = vendorMap.branchVendorId;
    }
    
    // Check if all vendor IDs exist in the database
    const existingVendors = await vendorModel.find({ _id: { $in: vendorIds } });
    
    if (existingVendors.length !== vendorIds.length) {
      // Find missing vendor IDs and their types
      const missingVendors = vendorIds.filter(id => !existingVendors.some(vendor => vendor._id.toString() === id));
      const missingVendorMessages = missingVendors.map(id => vendorTypes[id]);
      
      // Return an error with the names of the missing vendors
      return badRequest(res, `${missingVendorMessages.join(', ')} not found`);
    }
  
    const processDetail =  await processModel.findOne({customerId})
    // console.log('processDetail',processDetail)
    let vendorData = { };

    const rcuVendorFound = await extrnalVendorModel.findOne({ 'rcu.rcuVendorId':rcuVendorId ,customerId:customerId });
    const legalVendorFound = await extrnalVendorModel.findOne({ 'legal.legalVendorId':legalVendorId ,customerId:customerId });
    const technicalVendorFound = await extrnalVendorModel.findOne({ 'technical.technicalVendorId':technicalVendorId ,customerId:customerId });
    const otherVendorFound = await extrnalVendorModel.findOne({ 'otherVendor.otherVendorId':otherVendorId ,customerId:customerId });
    const branchVendorFound = await extrnalVendorModel.findOne({ 'branchVendor.branchVendorId':branchVendorId ,customerId:customerId });
        
    let statusByRCU = processDetail.statusByRCUVender
    if (rcuVendorId && !rcuVendorFound) {
      // console.log('rcu vendor')
      statusByRCU = statusByRCU === "pending"?"WIP":statusByRCU
      vendorData.rcu = { rcuVendorId, uploadRcuDocuments };
    }
    let statusByLegal = processDetail.statusByLegalVender
    if (legalVendorId && !legalVendorFound) {
      // console.log('legal vendor')
      statusByLegal = statusByLegal === "pending"?"WIP":statusByLegal
      vendorData.legal = { legalVendorId, uploadLegalDocuments };
    }
    let statusByTechnical = processDetail.statusByTechnicalVender
    if (technicalVendorId && !technicalVendorFound) {
      // console.log('technical vendor')
      statusByTechnical = statusByTechnical === "pending"?"WIP":statusByTechnical
      vendorData.technical = { technicalVendorId , uploadTechnicalDocuments };
    } 
    let statusByOtherVendor = processDetail.statusByOtherVender
    if (otherVendorId && !otherVendorFound) {
      // console.log('other vendor')
      statusByOtherVendor = statusByOtherVendor === "pending"?"WIP":statusByOtherVendor
      vendorData.otherVendor = { otherVendorId , uploadOtherDocuments };
    }
    let statusByBranchVendor = processDetail.statusByBranchVendor
    if (branchVendorId && !branchVendorFound) {
      // console.log('branch vendor')
      statusByBranchVendor = statusByBranchVendor === "pending"?"WIP":statusByBranchVendor
      vendorData.branchVendor = { branchVendorId , requirement , uploadBranchDocuments };
    }
    
    const existingVendor = await extrnalVendorModel.findOne({ customerId });
    let externalVendorData;
    if (existingVendor) {
      externalVendorData = await extrnalVendorModel.findOneAndUpdate({ customerId },
        { $set: { rcu: vendorData.rcu, legal: vendorData.legal, technical: vendorData.technical , otherVendor : vendorData.otherVendor ,  externalVendorId: tokenId , branchVendor:vendorData.branchVendor } },
        { upsert: true, new: true });
      } else {
        const externalVendor = new extrnalVendorModel({
        customerId,
        externalVendorId: tokenId,
        ...vendorData,
      });
      externalVendorData = await externalVendor.save();
    }

    if (rcuVendorId && !rcuVendorFound) {
      const rcuVendor = await vendorModel.findById({ _id:rcuVendorId})
      // console.log('rcuVendor',rcuVendor)
      const toEmails = rcuVendor.communicationToMailId?rcuVendor.communicationToMailId :""
      const ccEmails = rcuVendor.communicationCcMailId?rcuVendor.communicationCcMailId :""

      const documentsArray = externalVendorData.rcu.uploadRcuDocuments
      const baseURL = 'https://stageapi.fincooper.in';
      const pdf = `<p>Assign Documents RCU Vendor</p> `;
      const attachments = documentsArray.map((data) => ({
      path: baseURL + data,
      filename: data.split('/').pop(), 
      contentType: 'application/pdf'
      }));
      sendEmail(toEmails, ccEmails, "Send Mail By External" ,pdf,attachments);
    }
    if (technicalVendorId && !technicalVendorFound) {
      const technicalVendor = await vendorModel.findById({ _id:technicalVendorId})
      const toEmails = technicalVendor.communicationToMailId?technicalVendor.communicationToMailId :""
      const ccEmails = technicalVendor.communicationCcMailId?technicalVendor.communicationCcMailId :""

      const documentsArray = externalVendorData.technical.uploadTechnicalDocuments
      const baseURL = 'https://stageapi.fincooper.in';
      const pdf = `<p>Assign Documents Technical Vendor</p> `;

      const attachments = 
        documentsArray.map((data) => ({
        path: baseURL + data,
        filename: data.split('/').pop(),  
        contentType: 'application/pdf'
        }));

      sendEmail(toEmails, ccEmails, "Send Mail By External" ,pdf,attachments);
    }
    if (legalVendorId && !legalVendorFound) {
      const legalVendor = await vendorModel.findById({ _id:legalVendorId})
      // console.log('legalVendor',legalVendor)
      const toEmails = legalVendor.communicationToMailId?legalVendor.communicationToMailId :""
      const ccEmails = legalVendor.communicationCcMailId?legalVendor.communicationCcMailId :""

      const documentsArray = externalVendorData.legal.uploadLegalDocuments
      const baseURL = 'https://stageapi.fincooper.in';
      const pdf = `<p>Assign Documents Legal Vendor</p> `;
      const attachments = documentsArray.map((data) => ({
      path: baseURL + data,
      filename: data.split('/').pop(), 
      contentType: 'application/pdf'
      }));
      sendEmail(toEmails, ccEmails, "Send Mail By External" ,pdf,attachments);
    }
    if (otherVendorId && !otherVendorFound) {
      const otherVendor = await vendorModel.findById({ _id:otherVendorId})
      // console.log('otherVendor',otherVendor)
      const toEmails = otherVendor.communicationToMailId?otherVendor.communicationToMailId :""
      const ccEmails = otherVendor.communicationCcMailId?otherVendor.communicationCcMailId :""

      const documentsArray = externalVendorData.otherVendor.uploadOtherDocuments
      const baseURL = 'https://stageapi.fincooper.in';
      const pdf = `<p>Assign Documents Other Vendor</p> `;
      const attachments = documentsArray.map((data) => ({
      path: baseURL + data,
      filename: data.split('/').pop(), 
      contentType: 'application/pdf'
      }));
      sendEmail(toEmails, ccEmails, "Send Mail By External" ,pdf,attachments);
    }
    if (branchVendorId && !branchVendorFound) {
      const branchVendor = await vendorModel.findById({ _id:branchVendorId})
      // console.log('branchVendor',branchVendor)
      const toEmails = branchVendor.communicationToMailId?branchVendor.communicationToMailId :""
      const ccEmails = branchVendor.communicationCcMailId?branchVendor.communicationCcMailId :""

      const documentsArray = externalVendorData.branchVendor.uploadBranchDocuments
      const baseURL = 'https://stageapi.fincooper.in';
      const pdf = `<p>Assign Documents Branch Vendor</p> `;
      const attachments = documentsArray.map((data) => ({
      path: baseURL + data,
      filename: data.split('/').pop(), 
      contentType: 'application/pdf'
      }));
      sendEmail(toEmails, ccEmails, "Send Mail By External" ,pdf,attachments);
    }


    const requiredFields = ['customerId', 'rcuVendorId', 'legalVendorId','technicalVendorId']
    let allFieldsFilled;
    allFieldsFilled = requiredFields.every(field => {
      const value = req.body[field];
      return value !== undefined && value !== null && value !== "";
    });
    if (allFieldsFilled) {
      // console.log('all fields fill',allFieldsFilled)
      await processModel.updateOne({ customerId }, { $set: { vendorId:req.Id , statusByVendor: "pending" , rcuVendorId: rcuVendorId , statusByRCUVender:statusByRCU , legalVendorId: legalVendorId , statusByLegalVender:statusByLegal , technicalVendorId: technicalVendorId , statusByTechnicalVender :statusByTechnical , otherVendorId:otherVendorId , statusByOtherVender : statusByOtherVendor , statusByBranchVendor , branchVendorId:branchVendorId , statusByBranchVendor:statusByBranchVendor} });
    } else {
      // console.log('all fields not fill',allFieldsFilled)
      await processModel.updateOne({ customerId }, { $set: { vendorId:req.Id , statusByVendor: "pending" , rcuVendorId: rcuVendorId , statusByRCUVender:statusByRCU , legalVendorId: legalVendorId , statusByLegalVender:statusByLegal , technicalVendorId: technicalVendorId , statusByTechnicalVender :statusByTechnical ,  otherVendorId:otherVendorId , statusByOtherVender : statusByOtherVendor , statusByBranchVendor , branchVendorId:branchVendorId , statusByBranchVendor:statusByBranchVendor} });
    }
    if (existingVendor) {
      success(res, "External Vendor updated successfully", externalVendorData)
      // await externalVendorGoogleSheet(externalVendorData , customerFinId)
    } else {
      success(res, "External Vendor added successfully", externalVendorData)
      // console.log('externalVendorData',externalVendorData)
      // await externalVendorGoogleSheet(externalVendorData , customerFinId)
    }
    
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}

async function addByVendor(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const {
      customerId,
      rcuVendorId,
      legalVendorId,
      technicalVendorId,
      otherVendorId,
      branchVendorId,
      uploadProperty,
      uploadDoc,
      status,
      reason,
      // requirement,
    } = req.body;

    const customerExit = await customerModel.findById(customerId)
    if(!customerExit){
      return notFound(res, "customer Id Not Found")
    }
    const customerFinId = customerExit.customerFinId? customerExit.customerFinId : ' '

    let vendorId;
    let vendorRole;
    let vendorType;
    if (rcuVendorId) {
      vendorId = rcuVendorId;
      vendorRole = "RCU Vendor";
      vendorType = "RCU";
    } else if (legalVendorId) {
      vendorId = legalVendorId;
      vendorRole = "Legal Vendor";
      vendorType = "Legal";
    } else if (technicalVendorId) {
      vendorId = technicalVendorId;
      vendorRole = "Technical Vendor";
      vendorType = "Technical";
    }else if (otherVendorId) {
        vendorId = otherVendorId;
        vendorRole = "other Vendor";
        vendorType = "other";
    }else if (branchVendorId) {
          vendorId = branchVendorId;
          vendorRole = "branch Vendor";
          vendorType = "branch";
    } else {
      return badRequest(res, "Vendor ID is required");
    }
    const employee = await vendorModel.findById(vendorId);
    if (!employee) {
      return notFound(res, `${vendorRole} not found`);
    }

    const verifyVendor = await extrnalVendorModel.findOne({ customerId });
    console.log('verifyVendor',verifyVendor)
    if (!verifyVendor) {
      return notFound(res, "Customer not Found");
    }

    const matchedVendor = (
      (rcuVendorId && verifyVendor.rcu.rcuVendorId.equals(rcuVendorId)) ||
      (legalVendorId && verifyVendor.legal.legalVendorId && verifyVendor.legal.legalVendorId.equals(legalVendorId)) ||
      (technicalVendorId && verifyVendor.technical.technicalVendorId && verifyVendor.technical.technicalVendorId.equals(technicalVendorId)) ||
      (otherVendorId && verifyVendor.otherVendor.otherVendorId.equals(otherVendorId)) ||
      (branchVendorId && verifyVendor.branchVendor.branchVendorId.equals(branchVendorId))
    );

    if (!matchedVendor) {
      return badRequest(res,"Invalid vendor");
    }
    
    let updateFields = {};
    if (rcuVendorId) {
      updateFields = {
        "rcu.rcuVendorId": new ObjectId(rcuVendorId),
        "rcu.uploadProperty": uploadProperty,
        "rcu.status": status,
      };
      status === "positive" ? updateFields["rcu.reason"] = "" : updateFields["rcu.reason"] = reason
      status === "positive" ? await processModel.findOneAndUpdate({ customerId }, { $set: { statusByRCUVender: "complete" } }) : await processModel.findOneAndUpdate({ customerId }, { $set: { statusByRCUVender: "complete" } })
    } else if (legalVendorId) {
      updateFields = {
        "legal.legalVendorId": new ObjectId(legalVendorId),
        "legal.uploadProperty": uploadProperty,
        "legal.status": status,
      };
      status === "positive" ? updateFields["legal.reason"] = "" : updateFields["legal.reason"] = reason
      status === "positive" ? await processModel.findOneAndUpdate({ customerId }, { $set: { statusByLegalVender: "complete" } }) : await processModel.findOneAndUpdate({ customerId }, { $set: { statusByLegalVender: "complete" } })
    } else if (technicalVendorId) {
      updateFields = {
        "technical.technicalVendorId": new ObjectId(technicalVendorId),
        // "technical.branch": branch,
        // "technical.partner": partner,
        "technical.uploadProperty": uploadProperty,
        "technical.status": status,
      };
      status === "positive" ? updateFields["technical.reason"] = "" : updateFields["technical.reason"] = reason
      status === "positive" ? await processModel.findOneAndUpdate({ customerId }, { $set: { statusByTechnicalVender: "complete" } }) : await processModel.findOneAndUpdate({ customerId }, { $set: { statusByTechnicalVender: "complete" } })
    }else if (otherVendorId) {
      updateFields = {
        "otherVendor.otherVendorId": new ObjectId(otherVendorId),
        "otherVendor.uploadProperty": uploadProperty,
        "otherVendor.status": status,
      };
      status === "positive" ? updateFields["otherVendor.reason"] = "" : updateFields["otherVendor.reason"] = reason
      status === "positive" ? await processModel.findOneAndUpdate({ customerId }, { $set: { statusByOtherVender: "complete" } }) : await processModel.findOneAndUpdate({ customerId }, { $set: { statusByOtherVender: "complete" } })
    }else if (branchVendorId) {
      updateFields = {
        "branchVendor.branchVendorId": new ObjectId(branchVendorId),
        "branchVendor.uploadDoc": uploadDoc,
        "branchVendor.status": status,
      };
      status === "positive" ? updateFields["branchVendor.reason"] = "" : updateFields["branchVendor.reason"] = reason
      status === "positive" ? await processModel.findOneAndUpdate({ customerId }, { $set: { statusByBranchVendor: "complete" } }) : await processModel.findOneAndUpdate({ customerId }, { $set: { statusByBranchVendor: "complete" } })
    }
    const updatedVendor = await extrnalVendorModel.findOneAndUpdate(
      { customerId },
      { $set: updateFields },
      { new: true }
    );

    success(res, `Form Submited By ${vendorType}`, updatedVendor);
    // await externalVendorGoogleSheet(updatedVendor, customerFinId)

  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}

async function allCustomersByStatus(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const { status } = req.body
    // console.log(status)
    let allFormsStatus;
    if (status === "all") {
      // allFormsStatus = await extrnalVendorModel.find()
      allFormsStatus = await extrnalVendorModel.find({
        rcu: { $elemMatch: { rcuVendorId: new ObjectId(rcuVendorId) } },
        vendorId: new ObjectId(vendorId)
      });
      // }else if(status === "pending"){

      // }
      const data = { count: allFormsStatus.length, list: allFormsStatus }
      success(res, "all  Customers Data", data)
    }
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}

async function vendorFormGet(req, res){
  try {
      const { customerId, rcuVendorId, legalVendorId, technicalVendorId, otherVendorId , branchVendorId } = req.query;
  
      if (!customerId) {
        return badRequest(res, "Customer ID is required");
      }
  
      const verifyVendor = await extrnalVendorModel.findOne({ customerId });
      if (!verifyVendor) {
        return notFound(res, "Customer not Found");
      }
  
      let vendorData;
      if (rcuVendorId) {
        if (verifyVendor.rcu.rcuVendorId && verifyVendor.rcu.rcuVendorId.equals(rcuVendorId)) {
          vendorData = verifyVendor.rcu;
        } else {
          return badRequest(res, "Invalid RCU Vendor ID");
        }
      } else if (legalVendorId) {
        if (verifyVendor.legal.legalVendorId && verifyVendor.legal.legalVendorId.equals(legalVendorId)) {
          vendorData = verifyVendor.legal;
        } else {
          return badRequest(res, "Invalid Legal Vendor ID");
        }
      } else if (technicalVendorId) {
        if (verifyVendor.technical.technicalVendorId && verifyVendor.technical.technicalVendorId.equals(technicalVendorId)) {
          vendorData = verifyVendor.technical;
        } else {
          return badRequest(res, "Invalid Technical Vendor ID");
        }
      } else if (otherVendorId) {
        if (verifyVendor.otherVendor.otherVendorId && verifyVendor.otherVendor.otherVendorId.equals(otherVendorId)) {
          vendorData = verifyVendor.otherVendor;
        }else{
          return badRequest(res, "Invalid Other Vendor ID");
        }
      }  else if (branchVendorId) {
          if (verifyVendor.branchVendor.branchVendorId && verifyVendor.branchVendor.branchVendorId.equals(branchVendorId)) {
            vendorData = verifyVendor.branchVendor;
          }else {
          return badRequest(res, "Invalid branch Vendor ID");
        }
      } else {
        return badRequest(res, "Vendor ID is required");
      }
  
      return success(res, "Vendor data get successfully", vendorData);
    } catch (error) {
      console.log(error);
      return unknownError(res, error);
    }
}

async function getDetailExternalVendor(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const tokenId = req.Id
    // console.log('tokenID', tokenId)
    const { customerId } = req.query;
    if (!customerId || customerId.trim() === "") {
      return badRequest(res , "ID is required");
  }
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    return badRequest(res , "Invalid ID");
  }
    const formFound = await extrnalVendorModel.findOne({customerId:customerId}).populate("rcu.rcuVendorId").populate("legal.legalVendorId").populate("technical.technicalVendorId").populate("otherVendor.otherVendorId").populate("branchVendor.branchVendorId");
    if (!formFound) {
      return notFound(res, "form Not Found");
    }
      success(res, "External Vendor detail successfully", formFound)
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}

async function extrenalVendorViewReport(req, res){
    try {
        const vendorRole = req.query.vendorRole;
        const customerId = req.query.customerId
        
        // Define projection based on role
        let projection = {};

        switch (vendorRole) {
            case 'rcu':
                // Only show rcu related fields
                projection = {
                    rcu: 1,
                    _id: 1, // always include _id
                };
                break;
            case 'technical':
                // Only show technical related fields
                projection = {
                    technical: 1,
                    _id: 1,
                };
                break;
            case 'legal':
                // Only show legal related fields
                projection = {
                    legal: 1,
                    _id: 1,
                };
                break;
            case 'other':
                // Only show otherVendor related fields
                projection = {
                    otherVendor: 1,
                    _id: 1,
                };
                break;
            case 'branch':
                // Only show branchVendor related fields
                projection = {
                    branchVendor: 1,
                    _id: 1,
                };
                break;
            default:
                return notFound(res , "Invalid role");
        }

        // Fetch data with the specified projection
        const formData = await extrnalVendorModel.findOne({customerId:customerId}, projection).exec();
        success(res, `${vendorRole} detail`, formData)
    } catch (error) {
      return unknownError(res, error);
    }
}


module.exports = { addExternalVendor, addByVendor, allCustomersByStatus , vendorFormGet , getDetailExternalVendor ,  extrenalVendorViewReport };
