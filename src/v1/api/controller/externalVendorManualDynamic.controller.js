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
const vendorTypeModel = require('../model/adminMaster/vendorType.model')
const externalVendorModel = require("../model/externalVendorForm1.model");
const processModel = require('../model/process.model') 
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

    const tokenId = req.Id;
    const { customerId, vendors, status } = req.body;

    const vendorTypes = vendors.map(v => v.vendorType);
    const duplicateVendorTypes = vendorTypes.filter((type, index) => vendorTypes.indexOf(type) !== index);

    if (duplicateVendorTypes.length > 0) {
      return badRequest(res, `Vendor Of Type ${duplicateVendorTypes[0]} Is Already Assigned`);
    }

    let externalVendorData = await externalVendorModel.findOne({ customerId });

    if (externalVendorData) {
      for (let vendor of vendors) {
        const { vendorId, vendorType, assignDocuments } = vendor;

        let existingVendor = externalVendorData.vendors.find(
          (v) => v.vendorId.toString() === vendorId && v.vendorType === vendorType
        );


        if (existingVendor) {
          console.log('existingVendor',existingVendor)
          // existingVendor.assignDocuments = assignDocuments || existingVendor.assignDocuments;
          // existingVendor.processStatus = "WIP"; 
        } else {
          externalVendorData.vendors.push({
            vendorId,
            vendorType,
            assignDocuments,
            processStatus: "WIP",
          });
        }
      }

      await externalVendorData.save();
      success(res, "External Vendor updated successfully", externalVendorData);
    } else {

      for (const vendor of vendors) {
        const { vendorType, vendorId } = vendor;

        if (!mongoose.Types.ObjectId.isValid(vendorId)) {
          return notFound(res, `${vendorType} has an invalid vendorId`);
        }

        const existingVendor = await vendorModel.findById(vendorId);

        if (!existingVendor) {
          return notFound(res, `${vendorType} Vendor Not Found`);
        }
      }
      // Create a new record
      const newVendorData = {
        customerId,
        externalVendorId: tokenId,
        vendors: vendors.map((vendor) => ({
          ...vendor,
          processStatus: "WIP", // Set status to WIP on creation
        })),
        status: status || "pending",
      };

      externalVendorData = new externalVendorModel(newVendorData);
      
      externalVendorData.externalVendorId = tokenId
      await externalVendorData.save();
      success(res, "External Vendor added successfully", externalVendorData);
    }

    // Send email notifications if needed
    for (let vendor of vendors) {
      const { vendorId, vendorType, assignDocuments } = vendor;

      let existingVendor = externalVendorData.vendors.find(
        (v) => v.vendorId.toString() === vendorId && v.vendorType === vendorType
      );

      console.log('existingVendor',existingVendor ,)

      if(!existingVendor){

      }

      const vendorModelData = await vendorModel.findById(vendorId);

      // if (vendorModelData) {
      //   const toEmails = vendorModelData.communicationToMailId || "";
      //   const ccEmails = vendorModelData.communicationCcMailId || "";
      //   const baseURL = "https://stageapi.fincooper.in";

      //   const attachments = assignDocuments.map((docPath) => ({
      //     path: baseURL + docPath,
      //     filename: docPath.split("/").pop(),
      //     contentType: "application/pdf",
      //   }));

      //   const emailContent = `<p>Assign Documents ${vendorType}</p>`;
      //   sendEmail(toEmails, ccEmails, "Send Mail By External", emailContent, attachments);
      // }
    }

  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

async function getCustoemrDetail(req, res){
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    } else {
      const { customerId } = req.query;
      const role = req.roleName;
      let matchQuery = {customerId : new ObjectId(customerId)};

      const formDetail = await processModel.aggregate([
        {
          $match: matchQuery,
        },
        {
          $lookup: {
            from: "customerdetails",
            localField: "customerId",
            foreignField: "_id",
            as: "customerDetail",
          },
        },
        {
          $lookup: {
            from: "applicantdetails",
            localField: "customerDetail._id",
            foreignField: "customerId",
            as: "applicantDetail",
          },
        },
        {
          $lookup: {
            from: "coapplicantdetails",
            localField: "customerDetail._id",
            foreignField: "customerId",
            as: "coapplicantdetail",
          },
        },
        {
          $lookup: {
            from: "guarantordetails",
            localField: "customerDetail._id",
            foreignField: "customerId",
            as: "guarantordetail",
          },
        },
        {
          $lookup: {
            from: "externalvendordynamics",
            localField: "customerDetail._id",
            foreignField: "customerId",
            as: "externalvendorDetail",
          },
        },
      ]);

      const transformedResponse = formDetail.map((item) => {
        return {
          customerDetail: item.customerDetail.length > 0 ? {
            _id: item.customerDetail[0]._id,
            customerFinId: item.customerDetail[0].customerFinId,
            executiveName: item.customerDetail[0].executiveName,
            loanAmount: item.customerDetail[0].loanAmount,
            mobileNo: item.customerDetail[0].mobileNo,
          } : {},
      
          applicantDetail: item.applicantDetail.length > 0 ? {
            fullName: item.applicantDetail[0].fullName,
            fatherName: item.applicantDetail[0].fatherName,
            mobileNo: item.applicantDetail[0].mobileNo,
            localAddress: item.applicantDetail[0].localAddress,
            permanentAddress: item.applicantDetail[0].permanentAddress,
          } : {},
      
          coapplicantdetail: item.coapplicantdetail.length > 0 ? item.coapplicantdetail.map((coapplicant) => {
            return {
              fullName: coapplicant.fullName,
              mobileNo: coapplicant.mobileNo,
              localAddress: coapplicant.localAddress,
              permanentAddress: coapplicant.permanentAddress,
            };
          }) : [], 
      
          guarantordetail: item.guarantordetail.length > 0 ? {
            fullName: item.guarantordetail[0].fullName,
            mobileNo: item.guarantordetail[0].mobileNo,
            localAddress: item.guarantordetail[0].localAddress,
            permanentAddress: item.guarantordetail[0].permanentAddress,
          } : {},
      
          externalvendorDetail: item.externalvendorDetail.length > 0 ? {
            _id: item.externalvendorDetail[0]._id,
            externalVendorId: item.externalvendorDetail[0].externalVendorId,
            vendors: item.externalvendorDetail[0].vendors,
          } : {} 
        };
      });
      
      return success(res, "Customer Proccess detail", transformedResponse);
    }
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }

}

async function getCustomerList(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    } else {
      // const { searchData } = req.query;
      const status = req.query.status;
      const role = req.roleName;
      console.log('external vendor', role)
      let matchQuery = {};
      switch (role) {
        case "external vendor":
          if (status === "pending") {
            matchQuery = {
              // statusByCibil: "approved",
              // statusByPd: "pending"

            }
            }else  if (status === "complete") {
              matchQuery = {
                statusByCibil: "approved",
                statusByPd: "pending",
                vendorId: new ObjectId(req.Id) 
              }
            } else if (status === "rcu") {
            console.log('rcu')
            matchQuery = {
              // statusByRCUVender: "approved",
            };
          } else if (status === "legal") {
            matchQuery = {
              // statusByLegalVender: "approved",
            };
          } else if (status === "technical") {
            matchQuery = {
              // statusByTechnicalVender: "approved",
            };
          }
          break;
        case "technical":
          // matchQuery = { technicalVendorId: new ObjectId(req.Id) };
          break;
        case "rcu":
          // matchQuery = { rcuVendorId: new ObjectId(req.Id) };
          break;
        case "legal":
          // matchQuery = { legalVendorId: new ObjectId(req.Id) };
          break;
        case "othervendor":
          // matchQuery = { otherVendorId: new ObjectId(req.Id) };
          break;
        case "branch":
            // matchQuery = { branchVendorId: new ObjectId(req.Id) };
            break;
        case "admin":
          break;
      }
      if (role == "admin") {
        if (status && ["incomplete", "pending", "rejected", "approved"].includes(status)) {
          // matchQuery.statusByPd = status;
          matchQuery.statusByVendor = status;
        } else {
          matchQuery.statusByVendor = { $in: ["incomplete", "pending", "rejected", "approved"] };
        }
      }
      else {
        if (role == "external vendor") {
          console.log("srole", role);
          if (status && ["incomplete", "pending", "rejected", "approved"].includes(status)) {
            // matchQuery.statusByRCUVender = status;
            // matchQuery.statusByLegalVender = status;
            // matchQuery.statusByTechnicalVender = status;
            // matchQuery.statusByOtherVender = status;
            // matchQuery.statusByBranchVendor = status;
            // console.log("RCU Vendor Status:", matchQuery.statusByRCUVender);
            // console.log("Legal Vendor Status:", matchQuery.statusByLegalVender);
            // console.log("Technical Vendor Status:", matchQuery.statusByTechnicalVender);
          } else if (status === "complete") {
            if (rucValue) {
                // matchQuery.statusByRCUVender = status
            }
            if (legalValue) {
                // matchQuery.statusByLegalVender = status
            }
            if (technicalValue) {
                // matchQuery.statusByTechnicalVender = status
            }
            if (otherVendorValue) {
                // matchQuery.statusByOtherVender = status
            } 
          }else {
            matchQuery.statusByRCUVender = {
              $in: ["incomplete", "pending", "rejected", "approved" ,"complete"],
            };
            matchQuery.statusByLegalVender = {
              $in: ["incomplete", "pending", "rejected", "approved" ,"complete"],
            };
            matchQuery.statusByTechnicalVender = {
              $in: ["incomplete", "pending", "rejected", "approved" ,"complete"],
            };
            matchQuery.statusByOtherVender = {
              $in: ["incomplete", "pending", "rejected", "approved" ,"complete"],
            };
          }
        } else if (role == "technical") {
          if (status && ["WIP","complete"].includes(status)) {
            // matchQuery.statusByPd = status;
            matchQuery.statusByTechnicalVender = status;
          } else {
            matchQuery.statusByTechnicalVender = { $in: ["pending","WIP"] };
          }
        } else if (role == "rcu") {
          if (status && ["WIP","complete"].includes(status)) {
            // matchQuery.statusByPd = status;
            matchQuery.statusByRCUVender = status;
          } else {
            matchQuery.statusByRCUVender = { $in: ["pending","WIP"] };
          }
        } else if (role == "legal") {
          if (status && ["WIP","complete"].includes(status)) {
            // matchQuery.statusByPd = status;
            matchQuery.statusByLegalVender = status;
            console.log("legLDr",matchQuery.statusByLegalVender);
            
          } else {
            matchQuery.statusByLegalVender = { $in: ["pending","WIP"] };
          }
        } else if (role == "othervendor") {
          if (status && ["WIP","complete"].includes(status)) {
            // matchQuery.statusByPd = status;
            matchQuery.statusByOtherVender = status;
          } else {
            matchQuery.statusByOtherVender = { $in: ["pending","WIP"] };
          }
        } else if (role == "branch") {
          if (status && ["WIP","complete"].includes(status)) {
            // matchQuery.statusByPd = status;
            matchQuery.statusByBranchVendor = status;
          } else {
            matchQuery.statusByBranchVendor = { $in: ["pending","WIP"] };
          }
        }
      }

      const formDetail = await processModel.aggregate([
        {
          $match: matchQuery,
        },
        {
          $lookup: {
            from: "customerdetails",
            localField: "customerId",
            foreignField: "_id",
            as: "customerDetail",
          },
        },
        {
          $lookup: {
            from: "applicantdetails",
            localField: "customerDetail._id",
            foreignField: "customerId",
            as: "applicantDetail",
          },
        },
        {
          $lookup: {
            from: "coapplicantdetails",
            localField: "customerDetail._id",
            foreignField: "customerId",
            as: "coapplicantdetail",
          },
        },
        {
          $lookup: {
            from: "guarantordetails",
            localField: "customerDetail._id",
            foreignField: "customerId",
            as: "guarantordetail",
          },
        },
        {
          $lookup: {
            from: "externalvendordynamics",
            localField: "customerDetail._id",
            foreignField: "customerId",
            as: "externalvendorDetail",
          },
        },
      ]);

      const transformedResponse = formDetail.map((item) => {
        return {
          customerDetail: item.customerDetail.length > 0 ? {
            _id: item.customerDetail[0]._id,
            customerFinId: item.customerDetail[0].customerFinId,
            executiveName: item.customerDetail[0].executiveName,
            loanAmount: item.customerDetail[0].loanAmount,
            mobileNo: item.customerDetail[0].mobileNo,
          } : {}, // Return an empty object if customerDetail is empty
      
          applicantDetail: item.applicantDetail.length > 0 ? {
            fullName: item.applicantDetail[0].fullName,
            fatherName: item.applicantDetail[0].fatherName,
            mobileNo: item.applicantDetail[0].mobileNo,
            localAddress: item.applicantDetail[0].localAddress,
            permanentAddress: item.applicantDetail[0].permanentAddress,
          } : {}, // Return an empty object if applicantDetail is empty
      
          coapplicantdetail: item.coapplicantdetail.length > 0 ? item.coapplicantdetail.map((coapplicant) => {
            return {
              fullName: coapplicant.fullName,
              mobileNo: coapplicant.mobileNo,
              localAddress: coapplicant.localAddress,
              permanentAddress: coapplicant.permanentAddress,
            };
          }) : [], // Return an empty array if coapplicantdetail is empty
      
          guarantordetail: item.guarantordetail.length > 0 ? {
            fullName: item.guarantordetail[0].fullName,
            mobileNo: item.guarantordetail[0].mobileNo,
            localAddress: item.guarantordetail[0].localAddress,
            permanentAddress: item.guarantordetail[0].permanentAddress,
          } : {}, // Return an empty object if guarantordetail is empty
      
          externalvendorDetail: item.externalvendorDetail.length > 0 ? {
            _id: item.externalvendorDetail[0]._id,
            externalVendorId: item.externalvendorDetail[0].externalVendorId,
            vendors: item.externalvendorDetail[0].vendors,
          } : {} // Return an empty object if externalvendorDetail is empty
        };
      });
      
      return success(res, "Customer Proccess list", transformedResponse);
    }
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}

async function addByAllVendors(req, res) {
  const { uploadProperty , requirement , reason , statusByVendor , customerId , vendorId } = req.body;
  const tokenId = req.Id;
  const role = req.roleName;
  // console.log('tokenId',tokenId,role,)

  const allVendor = await vendorTypeModel.find() 
  const dynamicRoles = allVendor.filter(vendor => vendor.status === 'active').map(vendor => vendor.vendorType);           

  const additionalRoles = ["admin"];
  const allowedRoles = [...dynamicRoles, ...additionalRoles];

  try {
    if (!allowedRoles.includes(role)) {
      return notFound(res, "Role not authorized to update vendor");
    }

    const externalVendorForm = await externalVendorModel.findOne({customerId});
    if (!externalVendorForm) {
      return notFound(res, "Form not found");
    }

    let vendor;

    if (role === "admin") {
      vendor = externalVendorForm.vendors.find(
        (v) => v.vendorId.toString() === vendorId
      );
    } else {
      vendor = externalVendorForm.vendors.find(
        (v) => v.vendorId.toString() === tokenId
      );
      if (vendor && (vendor.vendorType !== role || vendor.vendorId.toString() !== tokenId)) {
        return notFound(res, "Unauthorized vendor access");
      }
    }

        if (!vendor) {
      return notFound(res, "Vendor not found");
    }
        // Update fields if they are provided in the request
    if (uploadProperty) {
      vendor.uploadProperty = uploadProperty;
    }
    if(requirement){
      vendor.requirement = requirement;
    }
    if (statusByVendor) {
      vendor.statusByVendor = statusByVendor;
    }
    if(statusByVendor === 'positive'){
      vendor.reason = ""
    }else{
      vendor.reason = reason
    }

    // Set processStatus to "complete" if both fields are present
    if (vendor.uploadProperty && vendor.statusByVendor) {
      vendor.processStatus = "complete";
    }
        // Save the updated document
    await externalVendorForm.save();

    // Return success response
        return success(res ,"Vendor updated successfully", vendor);

  } catch (error) {
    return unknownError(res, error);
  }
}



async function externalVendorDetail(req, res) {
  try {
    const { customerId } = req.query; 
    const customerData = await externalVendorModel.findOne({ customerId: customerId });
    return success(res, `customer Detail`, customerData);
  } catch (err) {
    console.error('Error in externalVendorList:', err);
    return unknownError(res, err);
  }
}

async function externalVendorList(req, res) {
  try {
    const { Id: tokenId, roleName: role } = req; 
    const { externalVendorId } = req.query; 
    
    let formData;
    if (role === 'admin') {
      formData = externalVendorId ? await externalVendorModel.find({externalVendorId}) : await externalVendorModel.find({});
    } else {
      formData = await externalVendorModel.find({ externalVendorId: tokenId });
    }

    return success(res, `Form List`, formData);

  } catch (err) {
    console.error('Error in externalVendorList:', err);
    return unknownError(res, err);
  }
}

async function vendorShowList(req, res) {
  try {
    const tokenId = req.Id; 
    const role = req.roleName
    console.log('tokenId', tokenId , req.roleName) ;

    if(role === 'admin'){
    }
    const assignedForms = await externalVendorModel.find({
      vendors: {
        $elemMatch: {
          vendorId: new mongoose.Types.ObjectId(tokenId),
        },
      },
    });

    if (!assignedForms || assignedForms.length === 0) {
      return notFound(res, "No forms found assigned to this vendor");
    }

    const filteredForms = assignedForms.map(form => {
      const matchingVendors = form.vendors.filter(vendor => 
        vendor.vendorId.toString() === tokenId
      );

      return {
        _id: form._id,
        customerId: form.customerId,
        externalVendorId: form.externalVendorId,
        vendors: matchingVendors,
      };
    }).filter(form => form.vendors.length > 0);

    if (filteredForms.length === 0) {
      return notFound(res, "No forms found assigned to this vendor");
    }

    return success(res, `${req.roleName === 'admin'?'':req.roleName} Forms Assigned List`, filteredForms);

  } catch (err) {
    console.error(err);
    return unknownError(res, err);
  }
}

async function getCustomerList(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    } else {
      // const { searchData } = req.query;
      const status = req.query.status;
      const role = req.roleName;
      console.log('external vendor', role)
      let matchQuery = {};
      switch (role) {
        case "external vendor":
          if (status === "pending") {
            matchQuery = {
              // statusByCibil: "approved",
              // statusByPd: "pending"

            }
            }else  if (status === "complete") {
              matchQuery = {
                statusByCibil: "approved",
                statusByPd: "pending",
                vendorId: new ObjectId(req.Id) 
              }
            } else if (status === "rcu") {
            console.log('rcu')
            matchQuery = {
              // statusByRCUVender: "approved",
            };
          } else if (status === "legal") {
            matchQuery = {
              // statusByLegalVender: "approved",
            };
          } else if (status === "technical") {
            matchQuery = {
              // statusByTechnicalVender: "approved",
            };
          }
          break;
        case "technical":
          // matchQuery = { technicalVendorId: new ObjectId(req.Id) };
          break;
        case "rcu":
          // matchQuery = { rcuVendorId: new ObjectId(req.Id) };
          break;
        case "legal":
          // matchQuery = { legalVendorId: new ObjectId(req.Id) };
          break;
        case "othervendor":
          // matchQuery = { otherVendorId: new ObjectId(req.Id) };
          break;
        case "branch":
            // matchQuery = { branchVendorId: new ObjectId(req.Id) };
            break;
        case "admin":
          break;
      }
      if (role == "admin") {
        if (status && ["incomplete", "pending", "rejected", "approved"].includes(status)) {
          // matchQuery.statusByPd = status;
          matchQuery.statusByVendor = status;
        } else {
          matchQuery.statusByVendor = { $in: ["incomplete", "pending", "rejected", "approved"] };
        }
      }
      else {
        if (role == "external vendor") {
          console.log("srole", role);
          if (status && ["incomplete", "pending", "rejected", "approved"].includes(status)) {
            // matchQuery.statusByRCUVender = status;
            // matchQuery.statusByLegalVender = status;
            // matchQuery.statusByTechnicalVender = status;
            // matchQuery.statusByOtherVender = status;
            // matchQuery.statusByBranchVendor = status;
            // console.log("RCU Vendor Status:", matchQuery.statusByRCUVender);
            // console.log("Legal Vendor Status:", matchQuery.statusByLegalVender);
            // console.log("Technical Vendor Status:", matchQuery.statusByTechnicalVender);
          } else if (status === "complete") {
            if (rucValue) {
                // matchQuery.statusByRCUVender = status
            }
            if (legalValue) {
                // matchQuery.statusByLegalVender = status
            }
            if (technicalValue) {
                // matchQuery.statusByTechnicalVender = status
            }
            if (otherVendorValue) {
                // matchQuery.statusByOtherVender = status
            } 
          }else {
            matchQuery.statusByRCUVender = {
              $in: ["incomplete", "pending", "rejected", "approved" ,"complete"],
            };
            matchQuery.statusByLegalVender = {
              $in: ["incomplete", "pending", "rejected", "approved" ,"complete"],
            };
            matchQuery.statusByTechnicalVender = {
              $in: ["incomplete", "pending", "rejected", "approved" ,"complete"],
            };
            matchQuery.statusByOtherVender = {
              $in: ["incomplete", "pending", "rejected", "approved" ,"complete"],
            };
          }
        } else if (role == "technical") {
          if (status && ["WIP","complete"].includes(status)) {
            // matchQuery.statusByPd = status;
            matchQuery.statusByTechnicalVender = status;
          } else {
            matchQuery.statusByTechnicalVender = { $in: ["pending","WIP"] };
          }
        } else if (role == "rcu") {
          if (status && ["WIP","complete"].includes(status)) {
            // matchQuery.statusByPd = status;
            matchQuery.statusByRCUVender = status;
          } else {
            matchQuery.statusByRCUVender = { $in: ["pending","WIP"] };
          }
        } else if (role == "legal") {
          if (status && ["WIP","complete"].includes(status)) {
            // matchQuery.statusByPd = status;
            matchQuery.statusByLegalVender = status;
            console.log("legLDr",matchQuery.statusByLegalVender);
            
          } else {
            matchQuery.statusByLegalVender = { $in: ["pending","WIP"] };
          }
        } else if (role == "othervendor") {
          if (status && ["WIP","complete"].includes(status)) {
            // matchQuery.statusByPd = status;
            matchQuery.statusByOtherVender = status;
          } else {
            matchQuery.statusByOtherVender = { $in: ["pending","WIP"] };
          }
        } else if (role == "branch") {
          if (status && ["WIP","complete"].includes(status)) {
            // matchQuery.statusByPd = status;
            matchQuery.statusByBranchVendor = status;
          } else {
            matchQuery.statusByBranchVendor = { $in: ["pending","WIP"] };
          }
        }
      }

      const formDetail = await processModel.aggregate([
        {
          $match: matchQuery,
        },
        {
          $lookup: {
            from: "customerdetails",
            localField: "customerId",
            foreignField: "_id",
            as: "customerDetail",
          },
        },
        {
          $lookup: {
            from: "applicantdetails",
            localField: "customerDetail._id",
            foreignField: "customerId",
            as: "applicantDetail",
          },
        },
        {
          $lookup: {
            from: "coapplicantdetails",
            localField: "customerDetail._id",
            foreignField: "customerId",
            as: "coapplicantdetail",
          },
        },
        {
          $lookup: {
            from: "guarantordetails",
            localField: "customerDetail._id",
            foreignField: "customerId",
            as: "guarantordetail",
          },
        },
        {
          $lookup: {
            from: "externalvendordynamics",
            localField: "customerDetail._id",
            foreignField: "customerId",
            as: "externalvendorDetail",
          },
        },
      ]);

      const transformedResponse = formDetail.map((item) => {
        return {
          customerDetail: item.customerDetail.length > 0 ? {
            _id: item.customerDetail[0]._id,
            customerFinId: item.customerDetail[0].customerFinId,
            executiveName: item.customerDetail[0].executiveName,
            loanAmount: item.customerDetail[0].loanAmount,
            mobileNo: item.customerDetail[0].mobileNo,
          } : {}, // Return an empty object if customerDetail is empty
      
          applicantDetail: item.applicantDetail.length > 0 ? {
            fullName: item.applicantDetail[0].fullName,
            fatherName: item.applicantDetail[0].fatherName,
            mobileNo: item.applicantDetail[0].mobileNo,
            localAddress: item.applicantDetail[0].localAddress,
            permanentAddress: item.applicantDetail[0].permanentAddress,
          } : {}, // Return an empty object if applicantDetail is empty
      
          coapplicantdetail: item.coapplicantdetail.length > 0 ? item.coapplicantdetail.map((coapplicant) => {
            return {
              fullName: coapplicant.fullName,
              mobileNo: coapplicant.mobileNo,
              localAddress: coapplicant.localAddress,
              permanentAddress: coapplicant.permanentAddress,
            };
          }) : [], // Return an empty array if coapplicantdetail is empty
      
          guarantordetail: item.guarantordetail.length > 0 ? {
            fullName: item.guarantordetail[0].fullName,
            mobileNo: item.guarantordetail[0].mobileNo,
            localAddress: item.guarantordetail[0].localAddress,
            permanentAddress: item.guarantordetail[0].permanentAddress,
          } : {}, // Return an empty object if guarantordetail is empty
      
          externalvendorDetail: item.externalvendorDetail.length > 0 ? {
            _id: item.externalvendorDetail[0]._id,
            externalVendorId: item.externalvendorDetail[0].externalVendorId,
            vendors: item.externalvendorDetail[0].vendors,
          } : {} // Return an empty object if externalvendorDetail is empty
        };
      });
      
      return success(res, "Customer Proccess list", transformedResponse);
    }
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}


module.exports = { addExternalVendor , externalVendorDetail , getCustomerList , getCustoemrDetail , externalVendorList ,  addByAllVendors , vendorShowList };
