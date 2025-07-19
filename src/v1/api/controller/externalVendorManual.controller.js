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
const vendorModel = require("../model/adminMaster/vendor.model");
const externalVendorFormModel = require("../model/externalVendorManualForm.model");
const { sendEmail } = require('../controller/functions.Controller')



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
    const { formId, customerFinId, rcuVendorId, legalVendorId, technicalVendorId, otherVendorId, branchVendorId, requirement, uploadRcuDocuments, uploadLegalDocuments, uploadTechnicalDocuments, uploadOtherDocuments, uploadBranchDocuments } = req.body;

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

    const existingVendor = await externalVendorFormModel.findById(formId);
    
    const rcuVendorFound = await externalVendorFormModel.findOne({ 'rcu.rcuVendorId': rcuVendorId, customerFinId: customerFinId });
    const legalVendorFound = await externalVendorFormModel.findOne({ 'legal.legalVendorId': legalVendorId, customerFinId: customerFinId });
    const technicalVendorFound = await externalVendorFormModel.findOne({ 'technical.technicalVendorId': technicalVendorId, customerFinId: customerFinId });
    const otherVendorFound = await externalVendorFormModel.findOne({ 'otherVendor.otherVendorId': otherVendorId, customerFinId: customerFinId });
    const branchVendorFound = await externalVendorFormModel.findOne({ 'branchVendor.branchVendorId': branchVendorId, customerFinId: customerFinId });

    let vendorData = { ...req.body };

    if (rcuVendorId && !rcuVendorFound) {
      // console.log('rcu')
      const statusByRCUVender = "WIP"
      vendorData.rcu = { rcuVendorId, uploadRcuDocuments, statusByRCUVender };
    }
    if (legalVendorId && !legalVendorFound) {
      const statusByLegalVender = "WIP"
      vendorData.legal = { legalVendorId, uploadLegalDocuments, statusByLegalVender };
    }
    if (technicalVendorId && !technicalVendorFound) {
      const statusByTechnicalVender = "WIP"
      vendorData.technical = { technicalVendorId, uploadTechnicalDocuments, statusByTechnicalVender };
    }
    if (otherVendorId && !otherVendorFound) {
      const statusByOtherVender = "WIP"
      vendorData.otherVendor = { otherVendorId, uploadOtherDocuments, statusByOtherVender };
    }
    if (branchVendorId && !branchVendorFound) {
      const statusByBranchVendor = "WIP"
      vendorData.branchVendor = { branchVendorId, requirement, uploadBranchDocuments, statusByBranchVendor };
    }

    let externalVendorData;
    if (existingVendor) {
      externalVendorData = await externalVendorFormModel.findByIdAndUpdate({ _id: formId },
        { $set: { rcu: vendorData.rcu, legal: vendorData.legal, technical: vendorData.technical, otherVendor: vendorData.otherVendor, externalVendorId: tokenId, branchVendor: vendorData.branchVendor } },
        { upsert: true, new: true });
    } else {
      const customerFinFound = await externalVendorFormModel.findOne({customerFinId:customerFinId});
      if(customerFinFound){
        return badRequest(res, "Customer FIN ID Already Exist")
      }
      const externalVendor = new externalVendorFormModel({
        externalVendorId: tokenId,
        ...vendorData,
      });
      externalVendorData = await externalVendor.save();
    }


    if (rcuVendorId && !rcuVendorFound) {
      const rcuVendor = await vendorModel.findById({ _id: rcuVendorId })
      // console.log('rcuVendor', rcuVendor)
      const toEmails = rcuVendor.communicationToMailId ? rcuVendor.communicationToMailId : ""
      const ccEmails = rcuVendor.communicationCcMailId ? rcuVendor.communicationCcMailId : ""

      const documentsArray = externalVendorData.rcu.uploadRcuDocuments
      const baseURL = 'https://stageapi.fincooper.in';
      const pdf = `<p>Assign Documents RCU Vendor</p> `;
      const attachments = documentsArray.map((data) => ({
        path: baseURL + data,
        filename: data.split('/').pop(),
        contentType: 'application/pdf'
      }));
      sendEmail(toEmails, ccEmails, "Send Mail By External", pdf, attachments);
    }
    if (technicalVendorId && !technicalVendorFound) {
      // console.log('technical', technicalVendorId)
      const technicalVendor = await vendorModel.findById({ _id: technicalVendorId })
      const toEmails = technicalVendor.communicationToMailId ? technicalVendor.communicationToMailId : ""
      const ccEmails = technicalVendor.communicationCcMailId ? technicalVendor.communicationCcMailId : ""

      const documentsArray = externalVendorData.technical.uploadTechnicalDocuments
      const baseURL = 'https://stageapi.fincooper.in';
      const pdf = `<p>Assign Documents Technical Vendor</p> `;

      const attachments =
        documentsArray.map((data) => ({
          path: baseURL + data,
          filename: data.split('/').pop(),
          contentType: 'application/pdf'
        }));

      sendEmail(toEmails, ccEmails, "Send Mail By External", pdf, attachments);
    }
    if (legalVendorId && !legalVendorFound) {
      const legalVendor = await vendorModel.findById({ _id: legalVendorId })
      // console.log('legalVendor', legalVendor)
      const toEmails = legalVendor.communicationToMailId ? legalVendor.communicationToMailId : ""
      const ccEmails = legalVendor.communicationCcMailId ? legalVendor.communicationCcMailId : ""

      const documentsArray = externalVendorData.legal.uploadLegalDocuments
      const baseURL = 'https://stageapi.fincooper.in';
      const pdf = `<p>Assign Documents Legal Vendor</p> `;
      const attachments = documentsArray.map((data) => ({
        path: baseURL + data,
        filename: data.split('/').pop(),
        contentType: 'application/pdf'
      }));
      sendEmail(toEmails, ccEmails, "Send Mail By External", pdf, attachments);
    }
    if (otherVendorId && !otherVendorFound) {
      const otherVendor = await vendorModel.findById({ _id: otherVendorId })
      // console.log('otherVendor', otherVendor)
      const toEmails = otherVendor.communicationToMailId ? otherVendor.communicationToMailId : ""
      const ccEmails = otherVendor.communicationCcMailId ? otherVendor.communicationCcMailId : ""

      const documentsArray = externalVendorData.otherVendor.uploadOtherDocuments
      const baseURL = 'https://stageapi.fincooper.in';
      const pdf = `<p>Assign Documents Other Vendor</p> `;
      const attachments = documentsArray.map((data) => ({
        path: baseURL + data,
        filename: data.split('/').pop(),
        contentType: 'application/pdf'
      }));
      sendEmail(toEmails, ccEmails, "Send Mail By External", pdf, attachments);
    }
    if (branchVendorId && !branchVendorFound) {
      const branchVendor = await vendorModel.findById({ _id: branchVendorId })
      // console.log('branchVendor', branchVendor)
      const toEmails = branchVendor.communicationToMailId ? branchVendor.communicationToMailId : ""
      const ccEmails = branchVendor.communicationCcMailId ? branchVendor.communicationCcMailId : ""

      const documentsArray = externalVendorData.branchVendor.uploadBranchDocuments
      const baseURL = 'https://stageapi.fincooper.in';
      const pdf = `<p>Assign Documents Branch Vendor</p> `;
      const attachments = documentsArray.map((data) => ({
        path: baseURL + data,
        filename: data.split('/').pop(),
        contentType: 'application/pdf'
      }));
      sendEmail(toEmails, ccEmails, "Send Mail By External", pdf, attachments);
    }

    if (existingVendor) {
      success(res, "External Vendor updated successfully", externalVendorData)
    } else {
      success(res, "External Vendor added successfully", externalVendorData)
    }
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

async function vendorFormGet(req, res) {
  try {
    const { customerId, rcuVendorId, legalVendorId, technicalVendorId, otherVendorId, branchVendorId } = req.query;

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
      } else {
        return badRequest(res, "Invalid Other Vendor ID");
      }
    } else if (branchVendorId) {
      if (verifyVendor.branchVendor.branchVendorId && verifyVendor.branchVendor.branchVendorId.equals(branchVendorId)) {
        vendorData = verifyVendor.branchVendor;
      } else {
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
    const { formId } = req.query;
    if (!formId || formId.trim() === "") {
      return badRequest(res, "ID is required");
    }
    if (!mongoose.Types.ObjectId.isValid(formId)) {
      return badRequest(res, "Invalid ID");
    }
    const formFound = await externalVendorFormModel.findById(formId).populate("rcu.rcuVendorId").populate("legal.legalVendorId").populate("technical.technicalVendorId").populate("otherVendor.otherVendorId").populate("branchVendor.branchVendorId");
    if (!formFound) {
      return notFound(res, "form Not Found");
    }
    success(res, "External Vendor detail successfully", formFound)
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}

async function getListExternalVendor(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
  
    const tokenId = req.Id;

   const  employeeRoleCheck = Array.isArray(req.roleName) ? req.roleName : [req.roleName];
    // employeeRole.includes('admin')

    // console.log(tokenId, req.roleName)
    
    const { searchData } = req.query;

    let formFound;

    if (employeeRoleCheck.includes('admin')) {
      // Admin role: show all data
      formFound = await externalVendorFormModel.find({})
        .populate("rcu.rcuVendorId")
        .populate("legal.legalVendorId")
        .populate("technical.technicalVendorId")
        .populate("otherVendor.otherVendorId")
        .populate("branchVendor.branchVendorId");
    } else {
      // Other roles: filter based on externalVendorId or null
      formFound = await externalVendorFormModel.find({
        $or: [
          { externalVendorId: tokenId },
          { externalVendorId: null }
        ]
      })
        .populate("rcu.rcuVendorId")
        .populate("legal.legalVendorId")
        .populate("technical.technicalVendorId")
        .populate("otherVendor.otherVendorId")
        .populate("branchVendor.branchVendorId");
    }

    let formDataByRole = formFound
    const searchDataRegex = new RegExp(searchData, "i");
    if (searchData) {
      formDataByRole = formFound.filter(detail => 
        searchDataRegex.test(detail.customerFinId) || searchDataRegex.test(detail.applicantFullName)
      );
    }
    success(res, "External Vendor list successfully", {count:formDataByRole.length , formDataByRole})
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}


async function extrenalVendorManualViewReport(req, res){
  try {
      const vendorRole = req.query.vendorRole;
      const formId = req.query.formId
      
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
      const formData = await externalVendorFormModel.findById(formId, projection).exec();
      success(res, `${vendorRole} detail`, formData)
  } catch (error) {
    return unknownError(res, error);
  }
}


module.exports = { addExternalVendor, getDetailExternalVendor, getListExternalVendor , extrenalVendorManualViewReport };
