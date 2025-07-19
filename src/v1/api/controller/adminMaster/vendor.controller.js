const {
  success,
  unknownError,
  serverValidation,
  badRequest,
  notFound
} = require("../../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const moment = require("moment");
const ObjectId = mongoose.Types.ObjectId;
const vendorTypeModel = require("../../model/adminMaster/vendorType.model");
const vendorModel = require("../../model/adminMaster/vendor.model")
const vendorLogModel = require('../../model/adminMaster/vendorLog.model.js')
const externalVendorManual = require('../../model/externalVendorManualForm.model')
const roleModel = require('../../model/adminMaster/role.model')
const lenderPartnerMdoel = require('../../model/lender.model.js')
const branchModel = require('../../model/adminMaster/newBranch.model.js');      // Adjust the path as per your structure
const employeeModel = require('../../model/adminMaster/employe.model')
const bcrypt = require('bcrypt')
const { vendorGoogleSheet } = require('./masterGoogleSheet.controller');
const { query } = require("express");
const { sendEmailByVendor, vendorClickMail } = require('.././functions.Controller.js')
const externalVendorModel = require('../../model/externalManager/externalVendorDynamic.model')
const vendorInvoiceModel = require('../../model/adminMaster/vendorInvoceManagment.Model.js')
const mailSwitchesModel = require("../../model/adminMaster/mailSwitches.model.js")
// ------------------------Admin Master Add Vendor---------------------------------------



async function employeeDetailByUserName(req, res) {
  const { userName } = req.body;
  try {
    const employeeData = await employeeModel.aggregate([
      {
        $match: { userName: userName }
      },
      {
        $project: {
          employeUniqueId: 1,
          employeName: 1,
          email: 1,
          workEmail: 1,
          mobileNo: 1,
          password: 1,
          branchId: 1,
          companyId: 1,
          address: 1,
          userName: 1
        }
      },
      {
        $lookup: {
          from: 'branches',  // Name of the collection where branch data is stored
          localField: 'branchId', // Field in employeeModel to match with branch _id
          foreignField: '_id',  // Field in branches collection
          as: 'branchDetail'  // The result will be stored in this field
        }
      },
      {
        $unwind: {
          path: '$branchDetail',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'companies',  // Name of the collection where branch data is stored
          localField: 'companyId', // Field in employeeModel to match with branch _id
          foreignField: '_id',  // Field in branches collection
          as: 'companyDetail'  // The result will be stored in this field
        }
      },
      {
        $unwind: {
          path: '$companyDetail',
          preserveNullAndEmptyArrays: true
        }
      }
    ]);

    if (!employeeData || employeeData.length === 0) {
      return notFound(res, 'Employee not found');
    }
    return success(res, 'Employee Details', employeeData[0])
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}


async function vendorAdd(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const { vendorRole } = req.body
    if (vendorRole === 'internalVendor') {

      const existingVendor = await vendorModel.findOne({ userName: req.body.userName });
      if (existingVendor) {
        return badRequest(res, "UserName Already Exists");
      }


      const vendorType = await vendorTypeModel.findById({ _id: req.body.vendorType })
      if (!vendorType) {
        return badRequest(res, "Vendor Type Not Found")
      }
      const newVendor = new vendorModel(req.body);

      console.log('req.hostname', req.hostname)
      if (req.hostname === 'prod.fincooper.in') {
        switch (vendorType.vendorType) {
          case 'rcu':
            newVendor.communicationCcMailId = 'rcu@fincoopers.in';
            break;
          case 'rm':
          case 'legal':
          case 'technical':
          case 'branchPendency':
            newVendor.communicationCcMailId = 'indoreho@fincoopers.in';
            break;
          case 'creditPd':
            newVendor.communicationCcMailId = 'pd@fincoopers.in';
            break;
          default:
            newVendor.communicationCcMailId = ''; // Set to empty or other default if needed
        }
      }
      newVendor.registeredAddress = req.body.address
      await newVendor.save();
      success(res, "Internal Vendor Added Successful", newVendor);

      const branchdetails = await branchModel.findById(req.body.branchId);
      newVendor.branchNameStr = branchdetails?.name
      newVendor.vendorRoleStr = "internalVendor"
      newVendor.vendorTypeStr = vendorType?.vendorType ? vendorType?.vendorType : ''
      await vendorGoogleSheet(newVendor)

    } else {
      let fieldsToProcess = ['fullName', 'userName', 'communicationMailId', 'email', 'communicationToMailId'];
      fieldsToProcess.forEach(field => {
        if (req.body[field]) {
          req.body[field] = req.body[field];
        }
      });
      const vendorDetail = new vendorModel(req.body);
      // console.log('vendorDetail', vendorDetail, 'vendorDetail')
      const existingVendor = await vendorModel.findOne({ userName: vendorDetail.userName });
      if (existingVendor) {
        return badRequest(res, "UserName already exists");
      }

      // const existingemployee = await employeeModel.findOne({ userName: req.body.userName });
      //   if (existingemployee) {
      //     return badRequest(res, "UserName Already Exists In Employee");
      //   }
      if (!req.body.vendorType || req.body.vendorType.trim() === "") {
        return badRequest(res, "Vendor Type is required")
      }
      const vendorType = await vendorTypeModel.findById({ _id: vendorDetail.vendorType })
      if (!vendorType) {
        return badRequest(res, "Vendor Type Not Found")
      }

      const salt = await bcrypt.genSalt(10)
      password = await bcrypt.hash(vendorDetail.password, salt);
      vendorDetail.password = await bcrypt.hash(req.body.password, salt)

      vendorDetail.registeredAddress = req.body.address
      vendorDetail.vendorStatus = 'approve'
      const vendorData = await vendorDetail.save()
      success(res, "External Vendor Added Successful", vendorDetail);

      vendorDetail.vendorRoleStr = "externalVendor"
      vendorDetail.vendorTypeStr = vendorType?.vendorType ? vendorType?.vendorType : ''
      await vendorGoogleSheet(vendorDetail)

    }

  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
};


// ------------------Admin Master Update  vendor ---------------------------------------

// async function allFiledUpdateVendor(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }

//     const { vendorId , password , ...updateFields} = req.body; 

//     if(password){
//       return badRequest(res ,"Not Update Password")
//     }

//     // Check if vendor exists
//     const vendorExist = await vendorModel.findById(vendorId);
//     if (!vendorExist) {
//       return badRequest(res, "Vendor Not Found");
//     }

//     let fieldsToProcess = ["fullName", "email", "communicationToMailId", "communicationCcMailId", "userName"];

//     fieldsToProcess.forEach(field => {
//       if (updateFields[field]) {
//         if (Array.isArray(updateFields[field])) {
//           // If the field is an array, trim each string inside it
//           updateFields[field] = updateFields[field].map(item => (typeof item === "string" ? item.trim() : item));
//         } else if (typeof updateFields[field] === "string") {
//           // If the field is a string, trim normally
//           updateFields[field] = updateFields[field].trim();
//         }
//       }
//     });



//     // Ensure nested fields (soleProprietorship, partnershipFirm) are updated correctly
//     if (req.body.soleProprietorship) {
//       updateFields.soleProprietorship = {
//         ...vendorExist.soleProprietorship, // Keep existing values
//         ...req.body.soleProprietorship // Override with new values
//       };
//     }

//     if (req.body.partnershipFirm) {
//       updateFields.partnershipFirm = {
//         ...vendorExist.partnershipFirm, // Keep existing values
//         ...req.body.partnershipFirm // Override with new values
//       };
//     }

//     // Update Vendor Details (Excluding password & vendorStatus)
//     const updatedVendor = await vendorModel.findByIdAndUpdate(vendorId, updateFields, { new: true });

//     success(res, "Updated Vendor Detail", updatedVendor);

//     // Sync with Google Sheet (if needed)

//   } catch (error) {
//     console.log(error);
//     unknownError(res, error);
//   }
// }


async function allFiledUpdateVendor(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const checkTime = moment().tz("Asia/Kolkata");
    const todayDate = checkTime.format("YYYY-MM-DDThh:mm:ss A");
    const tokenId = req.Id;

    const {
      vendorId,
      password,
      generalRate,
      firstLegalRate,
      finalLegalRate,
      vettingLegalRate,
      newRate,
      ...updateFields
    } = req.body;

    // Password should not be updated from here
    if (password) {
      return badRequest(res, "Password update not allowed through this API.");
    }

    if (!vendorId || vendorId.trim() === "") {
      return badRequest(res, "Vendor ID is required and cannot be empty.");
    }

    const vendorExist = await vendorModel.findById(vendorId).populate('vendorType');

    if (!vendorExist) {
      return badRequest(res, "Vendor Not Found");
    }

    const isLegalVendor = vendorExist.vendorType.some(
      (type) => type.vendorType.toLowerCase() === "legal"
    );

    console.log("isLegalVendor", isLegalVendor)
    // Set rates based on vendor type
    let rateData = {};
    if (isLegalVendor) {
      const missingFields = [];
      if (firstLegalRate == undefined) missingFields.push("firstLegalRate");
      if (finalLegalRate == undefined) missingFields.push("finalLegalRate");
      if (vettingLegalRate == undefined) missingFields.push("vettingLegalRate");

      if (missingFields.length > 0) {
        return badRequest(res, `Missing fields: ${missingFields.join(", ")}`);
      }

      rateData = {
        generalRate: 0,
        legalRates: {
          firstLegalRate,
          finalLegalRate,
          vettingLegalRate
        }
      };
    } else {
      if (generalRate == undefined) {
        return badRequest(res, "General rate is required for non-legal vendors.");
      }

      rateData = {
        generalRate,
        legalRates: {
          firstLegalRate: 0,
          finalLegalRate: 0,
          vettingLegalRate: 0
        }
      };
    }

    // Trim string fields
    const fieldsToProcess = [
      "fullName",
      "email",
      "communicationToMailId",
      "communicationCcMailId",
      "userName"
    ];
    fieldsToProcess.forEach((field) => {
      if (updateFields[field]) {
        if (Array.isArray(updateFields[field])) {
          updateFields[field] = updateFields[field].map((item) =>
            typeof item === "string" ? item.trim() : item
          );
        } else if (typeof updateFields[field] === "string") {
          updateFields[field] = updateFields[field].trim();
        }
      }
    });

    // Merge soleProprietorship and partnershipFirm fields
    if (req.body.soleProprietorship) {
      updateFields.soleProprietorship = {
        ...vendorExist.soleProprietorship,
        ...req.body.soleProprietorship
      };
    }

    if (req.body.partnershipFirm) {
      updateFields.partnershipFirm = {
        ...vendorExist.partnershipFirm,
        ...req.body.partnershipFirm
      };
    }

    // Handle Rate History
    const rateHistory = vendorExist.rateHistory || [];

    if (
      generalRate !== undefined ||
      firstLegalRate !== undefined ||
      finalLegalRate !== undefined ||
      vettingLegalRate !== undefined
    ) {
      const legalRates = {
        firstLegalRate: firstLegalRate || 0,
        finalLegalRate: finalLegalRate || 0,
        vettingLegalRate: vettingLegalRate || 0
      };

      if (newRate === true) {
        // Add new rate entry
        const newRateEntry = {
          startDate: todayDate,
          // generalRate: generalRate || 0,
          // legalRates,
          generalRate: isLegalVendor ? 0 : generalRate || 0, // For legal vendors, set generalRate to 0
    legalRates: isLegalVendor ? {
      firstLegalRate,
      finalLegalRate,
      vettingLegalRate
    } : {
      firstLegalRate: 0, // For non-legal vendors, set all legal rates to 0
      finalLegalRate: 0,
      vettingLegalRate: 0
    },
          updateById: new ObjectId(tokenId)
        };
        rateHistory.push(newRateEntry);
      } else {
        // Update existing rate based on 
        if (!todayDate) {
          return badRequest(res, "Start date is required to update existing rate.");
        }

        const inputDate = moment(todayDate, [
          "YYYY-MM-DD",
          "YYYY-MM-DDTHH:mm:ss",
          "YYYY-MM-DDTHH:mm:ss.SSSZ"
        ]).format("YYYY-MM-DD");

        const existingRateIndex = rateHistory.findIndex(rate =>
          moment(rate.todayDate).format("YYYY-MM-DD") === inputDate
        );

        if (existingRateIndex !== -1) {
          if (generalRate !== undefined) {
            rateHistory[existingRateIndex].generalRate = generalRate;
          }
          rateHistory[existingRateIndex].legalRates = {
            ...rateHistory[existingRateIndex].legalRates,
            ...legalRates
          };
          rateHistory[existingRateIndex].updateById = new ObjectId(tokenId);
        } else {
          return badRequest(res, "No rate found for the provided startDate to update.");
        }
      }

      updateFields.rateHistory = rateHistory;
    }

    // Perform Update
    const updatedVendor = await vendorModel.findByIdAndUpdate(
      vendorId,
      updateFields,
      { new: true }
    );

    success(res, "Vendor updated successfully.", updatedVendor);

  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
}

// ------------------Admin Master Get Vendor By Id---------------------------------------
async function vendorprofileDetails(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const { vendorId } = req.query
    let tokenId
    if (vendorId) {
      tokenId = vendorId
    } else {
      tokenId = req.Id
    }
    const vendorDetail = await vendorModel.aggregate([
      { $match: { _id: new ObjectId(tokenId) } },
      {
        $lookup: {
          from: "vendortypes",
          localField: "vendorType",
          foreignField: "_id",
          as: "vendorTypeDetail"
        }
      },
      {
        $project: {
          "vendorTypeDetail.__v": 0, "vendorTypeDetail.createdAt": 0, "vendorTypeDetail.updatedAt": 0
        }
      }
    ]);

    success(res, "Get Vendor Detail", vendorDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
};


async function getAllVendorByRoleAndBranch(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { branchId, role, searchQuery = '' } = req.query;
    let { limit = 100, page = 1 } = req.query;
    limit = parseInt(limit);
    page = parseInt(page);
    const skip = (page - 1) * limit;

    // Build match conditions
    let matchConditions = { status: "active" };
    if (branchId) {
      matchConditions.branchId = new ObjectId(branchId);
    }

    // Add search conditions if searchQuery exists
    if (searchQuery.trim()) {
      matchConditions.$or = [
        { userName: new RegExp(searchQuery, 'i') },
        { fullName: new RegExp(searchQuery, 'i') },
        { contact: searchQuery.match(/^\d+$/) ? parseInt(searchQuery) : null }
      ].filter(condition => condition.contact !== null); // Remove contact condition if searchQuery isn't a number
    }

    // Create the aggregation pipeline
    const pipeline = [
      { $match: matchConditions },
      {
        $lookup: {
          from: "vendortypes",
          localField: "vendorType",
          foreignField: "_id",
          as: "vendorTypeDetail"
        }
      },
      {
        $lookup: {
          from: "roles",
          localField: "roleId",
          foreignField: "_id",
          as: "roleDetail"
        }
      },
      {
        $project: {
          password: 0,
          "vendorTypeDetail.__v": 0,
          "vendorTypeDetail.createdAt": 0,
          "vendorTypeDetail.updatedAt": 0,
          "roleDetail.__v": 0,
          "roleDetail.createdAt": 0,
          "roleDetail.updatedAt": 0,
        }
      }
    ];

    // Get total count before pagination
    const countPipeline = [...pipeline];
    const [countResult] = await vendorModel.aggregate([
      ...countPipeline,
      { $count: "total" }
    ]);
    let totalCount = countResult ? countResult.total : 0;

    // Add pagination to main pipeline
    pipeline.push(
      { $skip: skip },
      { $limit: limit }
    );

    // Execute main query
    let vendorDetail = await vendorModel.aggregate(pipeline);

    // Filter by vendorType based on role if provided
    if (role) {
      vendorDetail = vendorDetail.filter(vendor =>
        vendor.vendorTypeDetail.some(vendorType =>
          vendorType.vendorType.toLowerCase() === role.toLowerCase()
        )
      );
      // Adjust total count for role filtering
      totalCount = vendorDetail.length;
    }

    // Calculate pagination details
    const totalPages = Math.ceil(totalCount / limit);

    return success(res, "Get All Vendor list", {
      count: vendorDetail.length,
      vendorDetail,
      totalCount,
      totalPages,
      currentPage: page
    });

  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}


// async function getAllVendorByRoleAndBranch(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }

//     const { branchId, role } = req.query;

//     let {limit = 100 , page = 1 , searchQuery = ''} = req.query
//     limit = parseInt(limit)
//     page = parseInt(page)
//     const skip = (page-1)*limit
//     console.log('api test pagincation')

//     // Match active vendors and branch if provided
//     let matchConditions = { status: "active" };
//     if (branchId) {
//       matchConditions.branchId = mongoose.Types.ObjectId(branchId);
//     }

//     let vendorDetail = await vendorModel.aggregate([
//       { $match: matchConditions },
//       {
//         $lookup: {
//           from: "vendortypes",
//           localField: "vendorType",
//           foreignField: "_id",
//           as: "vendorTypeDetail"
//         }
//       },
//       {
//         $lookup: {
//           from: "roles",
//           localField: "roleId",
//           foreignField: "_id",
//           as: "roleDetail"
//         }
//       },
//       {
//         $project: {
//           password: 0,
//           "vendorTypeDetail.__v": 0,
//           "vendorTypeDetail.createdAt": 0,
//           "vendorTypeDetail.updatedAt": 0,
//           "roleDetail.__v": 0,
//           "roleDetail.createdAt": 0,
//           "roleDetail.updatedAt": 0,
//         }
//       },
//       { $skip: skip },
//       { $limit: limit }
//     ]);

//     // Filter by vendorType based on role in query parameters
//     if (role) {
//       vendorDetail = vendorDetail.filter(vendor => 
//         vendor.vendorTypeDetail.some(vendorType => 
//           vendorType.vendorType.toLowerCase() === role.toLowerCase()
//         )
//       );
//     }
//     const totalCount = await vendorModel.countDocuments(matchConditions);
//     // Respond with success message and filtered vendor data
//     return success(res, "Get All Vendor list", { count: vendorDetail.length,    vendorDetail ,    totalCount,
//       totalPages: Math.ceil(totalCount / limit),
//       currentPage: page });

//   } catch (error) {
//     console.log(error);
//     unknownError(res, error);
//   }
// }

async function getAllVendorByType(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { type } = req.query;

    let vendorDetail = await vendorModel.aggregate([
      {
        $lookup: {
          from: "vendortypes",
          localField: "vendorType",
          foreignField: "_id",
          as: "vendorTypeDetail"
        }
      },
      { $match: { ['vendorTypeDetail.vendorType']: type } },
      {
        $project: {
          password: 0,
          "vendorTypeDetail.__v": 0,
          "vendorTypeDetail.createdAt": 0,
          "vendorTypeDetail.updatedAt": 0,
          "roleDetail.__v": 0,
          "roleDetail.createdAt": 0,
          "roleDetail.updatedAt": 0,
        }
      }
    ]);

    // Respond with success message and filtered vendor data
    return success(res, "Get All Vendor list", vendorDetail);

  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}


async function vendorActiveOrInactive(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      serverValidation(res, { errorName: "serverValidation", errors: errors.array() });
    } else {
      const id = req.body.id;
      const status = req.body.status
      if (!id || id.trim() === "") {
        return badRequest(res, "ID is required and cannot be empty");
      }
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return badRequest(res, "Invalid ID");
      }
      if (status == "active") {
        const vendorUpdateStatus = await vendorModel.findByIdAndUpdate({ _id: id }, { status: "active" }, { new: true })
        success(res, "vendor Active", vendorUpdateStatus);
      }
      else if (status == "inactive") {
        const vendorUpdateStatus = await vendorModel.findByIdAndUpdate({ _id: id }, { status: "inactive" }, { new: true })
        success(res, "vendor inactive", vendorUpdateStatus);
      }
      else {
        return badRequest(res, "Status must be 'active' or 'inactive'");
      }

    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}


async function externalManualFormByVendor(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const {
      formId,
      rcuVendorId,
      legalVendorId,
      technicalVendorId,
      otherVendorId,
      branchVendorId,
      uploadProperty,
      uploadDoc,
      status,
      reason
    } = req.body;
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
    } else if (otherVendorId) {
      vendorId = otherVendorId;
      vendorRole = "other Vendor";
      vendorType = "other";
    } else if (branchVendorId) {
      vendorId = branchVendorId;
      vendorRole = "branch Vendor";
      vendorType = "branch";
    } else {
      return badRequest(res, "Vendor ID is required");
    }

    if (!vendorId || vendorId.trim() === "") {
      return badRequest(res, "ID is required");
    }
    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return badRequest(res, "Invalid ID");
    }
    const employee = await vendorModel.findById(vendorId);
    // console.log('employee', employee)
    if (!employee) {
      return notFound(res, `${vendorRole} not found`);
    }

    const verifyVendor = await externalVendorManual.findById(formId);
    // console.log('verifyVendor', verifyVendor)
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
      return badRequest(res, "Invalid vendor");
    }

    let updateFields = {};
    if (rcuVendorId) {
      updateFields = {
        "rcu.rcuVendorId": new ObjectId(rcuVendorId),
        "rcu.uploadProperty": uploadProperty,
        "rcu.status": status,
      };
      status === "positive" ? updateFields["rcu.reason"] = "" : updateFields["rcu.reason"] = reason
      status === "positive" ? await externalVendorManual.findByIdAndUpdate(formId, { $set: { 'rcu.statusByRCUVender': "complete" } }) : await externalVendorManual.findByIdAndUpdate(formId, { $set: { 'rcu.statusByRCUVender': "complete" } })
    } else if (legalVendorId) {
      updateFields = {
        "legal.legalVendorId": new ObjectId(legalVendorId),
        "legal.uploadProperty": uploadProperty,
        "legal.status": status,
      };
      status === "positive" ? updateFields["legal.reason"] = "" : updateFields["legal.reason"] = reason
      status === "positive" ? await externalVendorManual.findByIdAndUpdate(formId, { $set: { 'legal.statusByLegalVender': "complete" } }) : await externalVendorManual.findByIdAndUpdate(formId, { $set: { 'legal.statusByLegalVender': "complete" } })
    } else if (technicalVendorId) {
      updateFields = {
        "technical.technicalVendorId": new ObjectId(technicalVendorId),
        // "technical.branch": branch,
        // "technical.partner": partner,
        "technical.uploadProperty": uploadProperty,
        "technical.status": status,
      };
      status === "positive" ? updateFields["technical.reason"] = "" : updateFields["technical.reason"] = reason
      status === "positive" ? await externalVendorManual.findByIdAndUpdate(formId, { $set: { 'technical.statusByTechnicalVender': "complete" } }) : await externalVendorManual.findByIdAndUpdate(formId, { $set: { 'technical.statusByTechnicalVender': "complete" } })
    } else if (otherVendorId) {
      updateFields = {
        "otherVendor.otherVendorId": new ObjectId(otherVendorId),
        "otherVendor.uploadProperty": uploadProperty,
        "otherVendor.status": status,
      };
      status === "positive" ? updateFields["otherVendor.reason"] = "" : updateFields["otherVendor.reason"] = reason
      status === "positive" ? await externalVendorManual.findByIdAndUpdate(formId, { $set: { 'otherVendor.statusByOtherVender': "complete" } }) : await externalVendorManual.findByIdAndUpdate(formId, { $set: { 'otherVendor.statusByOtherVender': "complete" } })
    } else if (branchVendorId) {
      updateFields = {
        "branchVendor.branchVendorId": new ObjectId(branchVendorId),
        "branchVendor.uploadDoc": uploadDoc,
        "branchVendor.status": status,
      };
      status === "positive" ? updateFields["branchVendor.reason"] = "" : updateFields["branchVendor.reason"] = reason
      status === "positive" ? await externalVendorManual.findByIdAndUpdate(formId, { $set: { 'branchVendor.statusByBranchVendor': "complete" } }) : await externalVendorManual.findByIdAndUpdate(formId, { $set: { 'branchVendor.statusByBranchVendor': "complete" } })
    }
    const updatedVendor = await externalVendorManual.findByIdAndUpdate(
      formId,
      { $set: updateFields },
      { new: true }
    );

    return success(res, `Form Submited By ${vendorType}`, updatedVendor);
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}


async function getManualFormList(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const tokenId = req.Id
    const roleName = req.roleName;
    const { status, searchData } = req.query;

    let query = {};

    if (roleName === "rcu") {
      query = {
        "rcu.rcuVendorId": tokenId,
        "rcu.statusByRCUVender": status,
      };
    } else if (roleName === "technical") {
      query = {
        "technical.technicalVendorId": tokenId,
        "technical.statusByTechnicalVender": status,
      };
    } else if (roleName === "legal") {
      query = {
        "legal.legalVendorId": tokenId,
        "legal.statusByLegalVender": status,
      };
    } else if (roleName === "othervendor") {
      query = {
        "otherVendor.otherVendorId": tokenId,
        "otherVendor.statusByOtherVender": status,
      }
    } else if (roleName === "branch") {
      query = {
        "branchVendor.branchVendorId": tokenId,
        "branchVendor.statusByBranchVendor": status,
      };
    } else if (roleName === "extrnal vendor") {
      query = {
        $or: [
          { externalVendorId: tokenId },
          { externalVendorId: null }
        ]
      };
    } else if (roleName === "admin") {
      query = {};
    } else {
      return notFound(res, 'invalid role')
    }
    const formFound = await externalVendorManual.find(query)

    let formSearchResult = formFound
    const searchDataRegex = new RegExp(searchData, "i");
    if (searchData) {
      formSearchResult = formFound.filter(detail =>
        searchDataRegex.test(detail.customerFinId) || searchDataRegex.test(detail.applicantFullName)
      );
    }

    success(res, "Vendor list successfully", formSearchResult);
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}


async function getManualFormDetail(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const formId = req.query.id
    const formFound = await externalVendorManual.findById(formId).populate({ path: "rcu.rcuVendorId", select: "fullName userName _id" })
      .populate({ path: "legal.legalVendorId", select: "fullName userName _id" })
      .populate({ path: "technical.technicalVendorId", select: "fullName userName _id" })
      .populate({ path: "otherVendor.otherVendorId", select: "fullName userName _id" })
      .populate({ path: "branchVendor.branchVendorId", select: "fullName userName _id" });
    // .populate("rcu.rcuVendorId").populate("legal.legalVendorId").populate("technical.technicalVendorId").populate("otherVendor.otherVendorId").populate("branchVendor.branchVendorId");;
    success(res, `detail successfully`, formFound);
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}


async function multiplVendorTypeShowList(req, res) {
  try {
    const { vendorRole } = req.query;

    let matchQuery = { status: "active" }; // Vendors must be active
    let vendorTypeIds = [];

    if (vendorRole && vendorRole !== "all") {
      const vendorTypeArray = vendorRole.split(",").map(type => type.trim()); // Ensure it's an array

      // Find active vendor type IDs matching vendorRole
      const activeVendorTypes = await vendorTypeModel.find(
        { vendorType: { $in: vendorTypeArray }, status: "active" },
        { _id: 1 }
      );

      vendorTypeIds = activeVendorTypes.map(type => type._id);

      if (vendorTypeIds.length > 0) {
        matchQuery["vendorType"] = { $in: vendorTypeIds };
      }
    }

    const vendors = await vendorModel.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: "vendortypes",
          localField: "vendorType",
          foreignField: "_id",
          as: "vendorTypeDetails",
        },
      },
      { $unwind: "$vendorTypeDetails" },
      { $match: { "vendorTypeDetails.status": "active" } },
      {
        $group: {
          _id: "$_id",
          fullName: { $first: "$fullName" },
          vendorType: { $addToSet: "$vendorTypeDetails.vendorType" },
          vendorTypeIds: { $addToSet: "$vendorTypeDetails._id" },
        },
      },
      // Only match vendors that have at least one matching vendorTypeId
      vendorTypeIds.length > 0
        ? { $match: { $expr: { $gt: [{ $size: { $setIntersection: ["$vendorTypeIds", vendorTypeIds] } }, 0] } } }
        : { $match: {} },
      {
        $project: {
          _id: 1,
          fullName: 1,
          vendorType: 1,
        },
      },
    ]);

    return success(res, "Vendor list", { count: vendors.length, data: vendors });
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


async function vendorByCompleteFilesDetails(req, res) {
  try {
    const { customerId, vendorType } = req.query;

    const uploadsFilesDetails = await externalVendorModel.findOne({ customerId, "vendors.vendorId": new ObjectId(req.Id), "vendors.vendorType": vendorType }, { "vendors.$": 1 })

    if (!uploadsFilesDetails) {
      return notFound(res, "Files Not found");
    }

    return success(res, "Files Details", uploadsFilesDetails);

  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}



async function vendorCreateCredential(req, res) {
  try {
    const { userName, password, email, fullName, vendorType } = req.body;
    const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");

    const vendorTypeArray = Array.isArray(vendorType) ? vendorType : [vendorType];

    if (!userName || !password || !fullName || !email || vendorTypeArray.length === 0) {
      return badRequest(res, "All fields are required, including at least one vendorType!");
    }

    const role = "newVendor";
    const venroRoleGet = await roleModel.findOne({ roleName: role, status: "active" }).lean();
    if (!venroRoleGet) {
      return notFound(res, "New Vendor Role Not Found!");
    }


    const [existingEmail, existingUserName] = await Promise.all([
      vendorModel.findOne({ email }).lean(),
      vendorModel.findOne({ userName }).lean(),
    ]);

    if (existingEmail) return badRequest(res, "Email already exists!");
    if (existingUserName) return badRequest(res, "Username already exists!");


    const vendorTypesExist = await vendorTypeModel.find({
      _id: { $in: vendorTypeArray },
      status: "active",
    }).lean();

    if (vendorTypesExist.length !== vendorTypeArray.length) {
      return badRequest(res, "One or more vendor types not found or inactive!");
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    const newVendor = new vendorModel({
      userName,
      password: hashedPassword,
      email,
      fullName,
      vendorType: vendorTypesExist.map(type => type._id),
      roleId: venroRoleGet._id,
      vendorStatus: "incomplete",
      status: "new",
    });

    await newVendor.save();

    await vendorLogModel.create({
      createdById: req.Id,
      vendorId: newVendor._id,
      createDate: todayDate,
    });
    const vendorDetails = {
      password,
      userName,
      fullName,
      email,
      vendorType: vendorTypesExist.map(type => type.vendorType),
    };


    success(res, "Vendor registered successfully!");

      const loginCredential = await mailSwitchesModel.findOne();
        if (loginCredential?.masterMailStatus && loginCredential?.vendorMail && loginCredential?.mailSendVendorLoginCredentials) {
         await sendMailVendorLoginCredential(vendorDetails);
        }
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

async function sendMailVendorLoginCredential(vendorDetails) {
  try {
    const toEmails = vendorDetails.email;
    const ccmails = [];

    const subject = "Welcome to Finexe - Onboarding Credentials and Application Link";

    const html = `
      <html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    h2 { color: #4CAF50; }
    p { font-size: 14px; }
    .container { padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
    .highlight { font-weight: bold; color: #4CAF50; }
    .footer { margin-top: 20px; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <p>Dear <strong>${vendorDetails.fullName}</strong>,</p>

    <p>Welcome aboard! We are excited to have you as part of our vendor network.</p>

    <p>Please find below your <strong>Finexe</strong> login credentials and application link to facilitate a smooth onboarding process:</p>

    <p><strong>Finexe Credentials:</strong></p>
    <p>&bull; <strong>Username:</strong> ${vendorDetails.userName}</p>
    <p>&bull; <strong>Password:</strong> ${vendorDetails.password}</p>

    <p><strong>Finexe Application Link:</strong></p>
    <p><a href="https://finexe.fincooper.in/login/" target="_blank">https://finexe.fincooper.in/login</a></p>

    <p>We kindly ask you to complete your onboarding process in Finexe at your earliest convenience. Should you have any questions or require assistance during the onboarding process, please do not hesitate to reach out to us.</p>

    <p>Thank you for your collaboration, and we look forward to a successful partnership!</p>

    <div class="footer">
    
    <p><strong>Best regards,</strong></p>
    <p><strong>Fin Coopers Team</strong></p>    
    <p><strong>📞 8770572720</strong></p>
    </div>
  </div>
</body>
</html>
`;

    // await sendEmailByVendor("pendingMailSend", toEmails, ccmails, subject, html);
    await vendorClickMail(toEmails, ccmails, subject, html);
    console.log("Email sent successfully.");
  } catch (error) {
    console.error("Error in sending email:", error);
  }
}



async function vendorSubmitVendorForm(req, res) {
  try {
    const vendorId = req.Id;
    const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");

    const updatevendor = await vendorModel.findById(vendorId);
    if (!updatevendor) {
      return notFound(res, "Vendor not found!");
    }

    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === "object" && req.body[key] !== null) {
        updatevendor[key] = { ...updatevendor[key], ...req.body[key] };
      } else {
        updatevendor[key] = req.body[key];
      }
    });

    updatevendor.vendorStatus = "pending";
    const vendor = await updatevendor.save();
    await vendorLogModel.findOneAndUpdate(
      { vendorId: vendorId },
      { completeDate: todayDate },
      { new: true }
    );

    const vendorApproveForLogin = await mailSwitchesModel.findOne();
      if (vendorApproveForLogin?.masterMailStatus && vendorApproveForLogin?.vendorMail && vendorApproveForLogin?.vendorApproveForLoginMail) {
    await sendMailHoForApprove(req, vendor)
      }

    return success(res, "Vendor form submitted!", vendor);
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


async function sendMailHoForApprove(req, vendorDetails) {
  try {

    let toEmails;
    let ccmails;
    const stageHosts = ["localhost", "stageapi.fincooper.in"];
    const prodHost = "prod.fincooper.in";
    console.log('req.hostName-------//--------------/////-----', req.hostname)
    if (stageHosts.includes(req.hostname)) {
      console.log('req.hostName-------//-----', req.hostname)
      toEmails = "";
      ccmails = []
    } else if (req.hostname === prodHost) {
      toEmails = "Ho@fincoopers.in";
      ccmails = ["finexe@fincoopers.com"]
    }
    console.log('req name ', req.hostname)


    let vendorTypeName = "";
    if (vendorDetails.vendorType) {
      const vendorTypeDetails = await vendorTypeModel.findById(vendorDetails.vendorType);
      if (vendorTypeDetails) {
        vendorTypeName = vendorTypeDetails.vendorType;
      }
    }


    const subject = "Request for Approval of New Vendor Onboarding in Finexe" + vendorDetails.fullName;

    const html = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        h2 { color: #4CAF50; }
        p { font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #f2f2f2; width: 30%; }
        .footer { margin-top: 20px; font-size: 12px; color: #888; }
      </style>
    </head>
    <body>
      <p>Dear Team,</p>

      <p>We would like to inform you that the vendor has successfully onboarded onto the <strong>Finexe</strong> application. We now require your approval to proceed with the next steps.</p>

      <table>
        <tr>
          <th>User Name</th>
          <td>${vendorDetails.userName}</td>
        </tr>
        <tr>
          <th>Full Name</th>
          <td>${vendorDetails.fullName}</td>
        </tr>
        <tr>
          <th>Mobile No</th>
          <td class="highlight" >${vendorDetails.contact}</td>
        </tr>
        <tr>
          <th>Email</th>
          <td>${vendorDetails.email}</td>
        </tr>
        <tr>
          <th>Vendor Type</th>
          <td class="highlight" >${vendorTypeName}</td>
        </tr>
      </table>

      <p>Please review the details related to the vendor onboarding. If you have any questions or need further information, feel free to reach out.</p>

      <div class="footer">
        <p>Best regards,</p>
        <p><strong>Fin Coopers Team</strong></p>
      </div>
    </body>
    </html>
  `;

    // await sendEmailByVendor("pendingMailSend", toEmails, ccmails, subject, html);
    await vendorClickMail(toEmails, ccmails, subject, html);
    console.log("Email sent successfully.");
  } catch (error) {
    console.error("Error in EmailsendPd:", error);
  }
};

// async function multipleStatusReportList(req, res) {
//   try {
//     const { status, vendorStage, search, page = 1, limit = 1000 } = req.query;

//     const validStatuses = ["incomplete", "pending", "approve", "reject", "all"];
//     if (!vendorStage) {
//       return badRequest(res, "Vendor Status Is Required");
//     }

//     if (!validStatuses.includes(vendorStage)) {
//       return badRequest(res, "Invalid Vendor Status");
//     }

//     const query = {
//       // status: status === "all" ? { $in: ["inactive", "new","active"] } : status === "inactive" ? "inactive" :"active",
//       // status: vendorStage === "pending" ? "new" : status === "all" ? { $in: ["inactive", "new", "active"] } : status === "inactive"? "inactive" : "active",
//       vendorStatus: vendorStage ==="all"? {$in:["incomplete", "pending", "approve", "reject"]}:vendorStage,
//     };

//     // Apply search filter if provided
//     if (search) {
//       query.$or = [
//         { email: { $regex: search, $options: "i" } },
//         { userName: { $regex: search, $options: "i" } },
//         { fullName: { $regex: search, $options: "i" } },
//         { ownerName: { $regex: search, $options: "i" } },
//       ];
//     }

//     // Pagination settings
//     const skip = (parseInt(page) - 1) * parseInt(limit);
//     const pageLimit = parseInt(limit);

//     // Aggregate Query
//     const vendorDetails = await vendorModel.aggregate([
//       { $match: query },
//       {
//         $lookup: {
//           from: "newbranches",
//           localField: "branchId",
//           foreignField: "_id",
//           as: "branchDetails",
//         },
//       },
//       { $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: "roles",
//           localField: "roleId",
//           foreignField: "_id",
//           as: "roleDetails",
//         },
//       },
//       { $unwind: { path: "$roleDetails", preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: "vendortypes",
//           localField: "vendorType",
//           foreignField: "_id",
//           as: "vendorTypeDetails",
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           userName: 1,
//           email: 1,
//           contact: 1,
//           fullName: 1,
//           ownerName: 1,
//           status: 1,
//           vendorStatus: 1,
//           registeredAddress: 1,
//           companyName: 1,
//           rate: 1,
//           communicationToMailId: 1,
//           communicationCcMailId: 1,
//           corporateAddress: 1,
//           CINNumber: 1,
//           GSTNumber: 1,
//           serviceAgreement: 1,
//           panCard: 1,
//           aadharCard: 1,
//           idProof: 1,
//           addressProof: 1,
//           kycDirectors: 1,
//           gstCertificate: 1,
//           vendorPhoto: 1,
//           agencyDetails: 1,
//           bankDetails: 1,
//           briefProfile: 1,
//           soleProprietorship: 1,
//           partnershipFirm: 1,
//           branchId: "$branchDetails._id",
//           branchName: "$branchDetails.name",
//           roleId: "$roleDetails._id",
//           roleName: "$roleDetails.roleName",
//             vendorTypeDetails: {
//               vendorType: { $arrayElemAt: ["$vendorTypeDetails.vendorType", 0] },
//               vendorTypeId: { $arrayElemAt: ["$vendorTypeDetails._id", 0] } 
//             }
//           }
//       },
//       { $skip: skip },
//       { $limit: pageLimit },
//     ]);

//     // Get total count for pagination
//     const totalCount = await vendorModel.countDocuments(query);
//     const totalPages = Math.ceil(totalCount / pageLimit);

//     return success(res, "Vendors list!", {
//       totalCount,
//       totalPages,
//       currentPage: parseInt(page),
//       perPage: pageLimit,
//       vendorDetails,
//     });
//   } catch (error) {
//     console.error(error);
//     return unknownError(res, error);
//   }
// }



async function multipleStatusReportList(req, res) {
  try {
    const { status, vendorStage, search, page = 1, limit = 1000 } = req.query;

    const validStatuses = ["incomplete", "pending", "approve", "reject", "all"];
    if (!vendorStage) {
      return badRequest(res, "Vendor Status Is Required");
    }

    if (!validStatuses.includes(vendorStage)) {
      return badRequest(res, "Invalid Vendor Status");
    }

    const query = {
      vendorStatus: vendorStage === "all" ? { $in: ["incomplete", "pending", "approve", "reject"] } : vendorStage,
    };

    if (vendorStage === "approve") {
      if (!status) {
        return badRequest(res, "Status required");
      }
      query.status = status
    }

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { userName: { $regex: search, $options: "i" } },
        { fullName: { $regex: search, $options: "i" } },
        { ownerName: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const pageLimit = parseInt(limit);

    const vendorDetails = await vendorModel.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "newbranches",
          localField: "branchId",
          foreignField: "_id",
          as: "branchDetails",
        },
      },
      {
        $lookup: {
          from: "roles",
          localField: "roleId",
          foreignField: "_id",
          as: "roleDetails",
        },
      },
      {
        $lookup: {
          from: "vendortypes",
          localField: "vendorType",
          foreignField: "_id",
          as: "vendorTypeDetails",
        },
      },
      {
        $lookup: {
          from: "lenders",
          localField: "partnerId",
          foreignField: "_id",
          as: "partnerDetails",
        },
      },
      { $unwind: { path: "$partnerDetails", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$vendorTypeDetails", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$_id",
          userName: { $first: "$userName" },
          email: { $first: "$email" },
          contact: { $first: "$contact" },
          fullName: { $first: "$fullName" },
          ownerName: { $first: "$ownerName" },
          status: { $first: "$status" },
          vendorStatus: { $first: "$vendorStatus" },
          registeredAddress: { $first: "$registeredAddress" },
          companyName: { $first: "$companyName" },
          rate: { $first: "$rate" },
          communicationToMailId: { $first: "$communicationToMailId" },
          communicationCcMailId: { $first: "$communicationCcMailId" },
          corporateAddress: { $first: "$corporateAddress" },
          CINNumber: { $first: "$CINNumber" },
          GSTNumber: { $first: "$GSTNumber" },
          serviceAgreement: { $first: "$serviceAgreement" },
          panCard: { $first: "$panCard" },
          aadharCard: { $first: "$aadharCard" },
          idProof: { $first: "$idProof" },
          addressProof: { $first: "$addressProof" },
          kycDirectors: { $first: "$kycDirectors" },
          gstCertificate: { $first: "$gstCertificate" },
          vendorPhoto: { $first: "$vendorPhoto" },
          agencyDetails: { $first: "$agencyDetails" },
          bankDetails: { $first: "$bankDetails" },
          briefProfile: { $first: "$briefProfile" },
          soleProprietorship: { $first: "$soleProprietorship" },
          partnershipFirm: { $first: "$partnershipFirm" },
          branchDetails: {
            $addToSet: {
              branchId: "$branchDetails._id",
              branchName: "$branchDetails.name",
            },
          },
          partnerDetails: {
            $addToSet: {
              partnerId: "$partnerDetails._id",
              partnerName: "$partnerDetails.fullName",
            },
          },
          vendorTypeDetails: {
            $addToSet: {
              vendorTypeId: "$vendorTypeDetails._id",
              vendorType: "$vendorTypeDetails.vendorType",
            },
          },
        },
      },
      { $skip: skip },
      { $limit: pageLimit },
    ]);

    const totalCount = await vendorModel.countDocuments(query);
    const totalPages = Math.ceil(totalCount / pageLimit);

    return success(res, "Vendors list!", {
      totalCount,
      totalPages,
      currentPage: parseInt(page),
      perPage: pageLimit,
      vendorDetails,
    });
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}





async function vendorApproveForLogin(req, res) {
  try {
    const { status, vendorId, branchId, partnerId, communicationCcMailId, remark } = req.body;
    const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");

    const validStatuses = ["approve", "reject"];

    if (!status) {
      return badRequest(res, "Vendor Status Is Required");
    }
    if (!validStatuses.includes(status)) {
      return badRequest(res, "Invalid Vendor Status");
    }
    if (!vendorId) {
      return badRequest(res, "Vendor Id Is Required");
    }

    // Check if vendorId exists
    const vendorDetails = await vendorModel.findById(vendorId);
    if (!vendorDetails) {
      return badRequest(res, "Vendor Not Found");
    }

    if (status === "approve") {
      if (!branchId || !partnerId || !communicationCcMailId) {
        return badRequest(res, "Branch ID, Partner ID, and Communication CC Required");
      }

      // ✅ Convert `partnerId` to an array (handles single & multiple IDs)
      const partnerIdsArray = Array.isArray(partnerId) ? partnerId : partnerId.split(",");

      // Validate partner IDs
      const validPartners = await lenderPartnerMdoel.find({ _id: { $in: partnerIdsArray } });
      if (validPartners.length !== partnerIdsArray.length) {
        return badRequest(res, "One or more Partner IDs are Invalid");
      }

      // ✅ Convert `branchId` to an array (handles single & multiple IDs)
      const branchIdsArray = Array.isArray(branchId) ? branchId : branchId.split(",");

      // Validate branch IDs
      const validBranches = await branchModel.find({ _id: { $in: branchIdsArray } });
      if (validBranches.length !== branchIdsArray.length) {
        return badRequest(res, "One or more Branch IDs are Invalid");
      }

      // ✅ Fetch the `externalVendor` role
      const newRole = await roleModel.findOne({ roleName: "externalVendor", status: "active" });
      if (!newRole) {
        return badRequest(res, "externalVendor role not found");
      }

      // ✅ Update vendor details with multiple `partnerId` and `branchId`
      const vendorDetail = await vendorModel.findByIdAndUpdate(
        vendorId,
        {
          branchId: branchIdsArray,
          partnerId: partnerIdsArray, // ✅ Store as an array
          roleId: new ObjectId(newRole._id),
          status: "active",
          vendorStatus: status,
          communicationCcMailId,
        },
        { new: true }
      );

      // ✅ Update vendor logs
      await vendorLogModel.findOneAndUpdate(
        { vendorId },
        {
          approverId: req.Id,
          approvalRemark: remark || "",
          approveDate: todayDate,
        },
        { new: true }
      );

      return success(res, "Vendor approved successfully", vendorDetail);
    }

    if (status === "reject") {
      if (!remark) {
        return badRequest(res, "Reject Remark is required");
      }

      const vendorDetail = await vendorModel.findByIdAndUpdate(
        vendorId,
        {
          status: "new",
          vendorStatus: status,
        },
        { new: true }
      );

      await vendorLogModel.findOneAndUpdate(
        { vendorId },
        {
          approverId: req.Id,
          approvalRemark: remark || "",
          approveDate: todayDate,
        },
        { new: true }
      );

      return success(res, "Vendor rejected successfully", vendorDetail);
    }
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


async function vendorInvoiceDashboard(req, res) {
  try {
    const { startDateFilter, endDateFilter, vendorRole, vendorId , paymentStatus , serviceType , assignById , vendorType , search } = req.query;
    const tokenId = req.Id;
    const today = new Date();
    const defaultStartDate = new Date(today.setHours(0, 0, 0, 0));
    const defaultEndDate = new Date(today.setHours(23, 59, 59, 999));

    function formatDateToISO(date) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate)) {
        return null;
      }
      return parsedDate.toISOString();
    }

    let formattedStart = startDateFilter && startDateFilter !== "all"
      ? new Date(new Date(startDateFilter).setHours(0, 0, 0, 0))
      : defaultStartDate;

    let formattedEnd = endDateFilter && endDateFilter !== "all"
      ? new Date(new Date(endDateFilter).setHours(23, 59, 59, 999))
      : defaultEndDate;

    if (startDateFilter && endDateFilter && startDateFilter === endDateFilter) {
      formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
      formattedEnd = new Date(new Date(startDateFilter).setHours(23, 59, 59, 999));
    }

    formattedStart = formatDateToISO(formattedStart);
    formattedEnd = formatDateToISO(formattedEnd);

    const matchConditions = {
      status: "complete",
    };

    if (paymentStatus && paymentStatus !== "all") {
      matchConditions.paymentStatus = paymentStatus;
    }

    if (serviceType && serviceType !== "all") {
      matchConditions.serviceType = serviceType;
    }

    if (assignById && assignById !== "all") {
      const assignByIdArray = Array.isArray(assignById) ? assignById : assignById.split(",");
      matchConditions.assignByIdArray = { $in: assignByIdArray.map(id => new ObjectId(id)) };
    }

    if (startDateFilter && endDateFilter && startDateFilter !== "all" && endDateFilter !== "all") {
      matchConditions.completeDate = {
        $gte: formattedStart,
        $lt: formattedEnd,
      };
    }

    if (vendorRole === "vendor") {
      matchConditions.vendorId = new ObjectId(tokenId);
    } else if (vendorRole !== "all") {
      if (!vendorId) {
        return badRequest(res, "VendorId is required when vendorRole is not 'vendor' or 'all'");
      }
      if (vendorId && vendorId !== "all") {
        const vendorIdArray = Array.isArray(vendorId) ? vendorId : vendorId.split(",");
        matchConditions.vendorId = { $in: vendorIdArray.map(id => new ObjectId(id)) };
      }
    }
    
    const aggregationPipeline = [
      { $match: matchConditions },
      {
        $lookup: {
          from: "customerdetails",
          let: { customerId: "$customerId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$customerId"] } } },
            { $project: { customerFinId: 1 } }
          ],
          as: "customerDetail"
        }
      },
      {
        $lookup: {
          from: "applicantdetails",
          let: { customerId: "$customerId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$customerId", "$$customerId"] } } },
            { $project: { fullName: 1 } }
          ],
          as: "applicantDetail"
        }
      },
      {
        $lookup: {
          from: "employees",
          let: { assignById: "$assignById" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$assignById"] } } },
            { $project: { employeName: 1, userName: 1, employeUniqueId: 1 } }
          ],
          as: "assignByEmployee"
        }
      },
      {
        $lookup: {
          from: "vendors",
          let: { vendorId: "$vendorId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$vendorId"] } } },
            { $project: { fullName: 1, userName: 1 ,vendorType:1  } }
          ],
          as: "assignToVendor"
        }
      },
      {
        $lookup: {
          from: "vendors",
          let: { vendorId: "$vendorId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$vendorId"] }
              }
            },
            {
              $lookup: {
                from: "vendortypes",
                let: { vendorTypeIds: "$vendorType" },  // assuming vendorType field inside vendor is an array of ObjectId
                pipeline: [
                  {
                    $match: {
                      $expr: { $in: ["$_id", { $ifNull: ["$$vendorTypeIds", []] }] }
                    }
                  },
                  {
                    $project: { vendorType: 1 } // Only bring vendorType field
                  }
                ],
                as: "vendorTypeDetail"
              }
            },
            {
              $project: {
                fullName: 1,
                userName: 1,
                vendorTypeDetail: 1
              }
            }
          ],
          as: "assignToVendor"
        }
      },
      
      {
        $project: {
          _id: 1,
          customerId: 1,
          assignDate: 1,
          assignById: 1,
          vendorId: 1,
          completeDate: 1,
          serviceType: 1,
          fileRate: 1,
          status: 1,
          paymentStatus: 1,
          customerFinId: { $arrayElemAt: ["$customerDetail.customerFinId", 0] },
          customerfullName: { $arrayElemAt: ["$applicantDetail.fullName", 0] },
          assignByEmployeeDetail: {
            employeName: { $arrayElemAt: ["$assignByEmployee.employeName", 0] },
            userName: { $arrayElemAt: ["$assignByEmployee.userName", 0] },
            employeUniqueId: { $arrayElemAt: ["$assignByEmployee.employeUniqueId", 0] }
          },
          assignedVendorDetail: {
            fullName: { $arrayElemAt: ["$assignToVendor.fullName", 0] },
            userName: { $arrayElemAt: ["$assignToVendor.userName", 0] },
            vendorTypeDetail: { $arrayElemAt: ["$assignToVendor.vendorTypeDetail", 0] } 
          }
        }
      },
    ];

       // If vendorType filter is provided, add a filter for it
       if (vendorType && vendorType !== "all") {
        const vendorTypeArray = Array.isArray(vendorType) ? vendorType : vendorType.split(",");
        
        // Add a filter to match documents where the vendor has the specified type
        aggregationPipeline.push({
          $match: {
            "assignedVendorDetail.vendorTypeDetail.vendorType": { 
              $in: vendorTypeArray.map(type => type.trim().toLowerCase())
            }
          }
        });
      }

    if (search && search.trim() !== "") {
      aggregationPipeline.push({
        $match: {
          $or: [
            { customerFinId: { $regex: search.trim(), $options: "i" } },   // case-insensitive
            { customerfullName: { $regex: search.trim(), $options: "i" } }
          ]
        }
      });
    }

    aggregationPipeline.push({
      $group: {
        _id: null,
        totalPayment: { $sum: "$fileRate" },
        totalCount: { $sum: 1 },
        data: { $push: "$$ROOT" }
      }
    });
    
    const result = await vendorInvoiceModel.aggregate(aggregationPipeline);
    if (result.length === 0) {
     return success(res, "Vendor invoice dashboard",{
        totalPayment:0,
        totalCount:0,
        data:[]
      });
    }

    const { totalPayment, totalCount, data } = result[0];
    return success(res,"Vendor invoice dashboard", {
      totalPayment,
      totalCount,
      data
    })

  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


async function vendorInvoicePaymentsUpdate(req, res) {
  try {
    const paymentUpdateDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");
    const { ids , paymentStatus} = req.body;
    const tokenId = req.Id;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return badRequest(res, "Please provide a valid array of _ids to update.");
    }

    if (!paymentStatus) {
      return badRequest(res, "Payment status is required.");
    }
    const validStatuses = ["due", "paid", "onHold"];
    if (!validStatuses.includes(paymentStatus)) {
      return badRequest(res, "Invalid payment status. Valid options are: due, paid, onHold.");
    }

    const validIds = ids.map(id => new ObjectId(id));

    const existingDocs = await vendorInvoiceModel.find({ _id: { $in: validIds } });

    const existingIds = existingDocs.map(doc => doc._id.toString());

    const notMatchedIds = ids.filter(id => !existingIds.includes(id));

    const alreadyPaidIds = [];
    const toBeUpdatedIds = [];

    existingDocs.forEach(doc => {
      if (doc.paymentStatus === "paid" && paymentStatus === "paid") {
        alreadyPaidIds.push(doc._id.toString());
      } else {
        toBeUpdatedIds.push(doc._id);
      }
    });

    let updateResult = { matchedCount: 0, modifiedCount: 0 };

    if (toBeUpdatedIds.length > 0) {
      const updateFields = {
        paymentStatus: paymentStatus,
        paymentUpdateById: new ObjectId(tokenId),
        paymentUpdateDate: paymentUpdateDate
      };
      updateResult = await vendorInvoiceModel.updateMany(
        { _id: { $in: toBeUpdatedIds } },
        { $set: updateFields }
      );
    }

    return success(res, `Payment Status ${paymentStatus} Update`, {
      matchedCount: updateResult.matchedCount,
      modifiedCount: updateResult.modifiedCount,
      notMatchedIds: notMatchedIds,
      alreadyPaidIds: alreadyPaidIds
    });

  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


module.exports = {
  employeeDetailByUserName,
  vendorAdd,
  allFiledUpdateVendor,
  vendorprofileDetails,
  getAllVendorByRoleAndBranch,
  vendorActiveOrInactive,
  externalManualFormByVendor,
  getManualFormList,
  getManualFormDetail,
  getAllVendorByType,
  multiplVendorTypeShowList,
  vendorCreateCredential,
  vendorSubmitVendorForm,
  multipleStatusReportList,
  vendorApproveForLogin,
  vendorByCompleteFilesDetails,
  vendorInvoiceDashboard,
  vendorInvoicePaymentsUpdate
};
