const {
  success,
  unknownError,
  serverValidation,
  unauthorized,
  badRequest,

  notFound,
} = require("../../../../globalHelper/response.globalHelper");
const mailSwitchesModel = require("../model/adminMaster/mailSwitches.model.js")
const moment = require("moment");
const cron = require("node-cron");
const processModel = require("../model/process.model");
const externalManagerModel = require('../model/externalManager/externalVendorDynamic.model')
const customerModel = require('../model/customer.model')
const applicantModel = require('../model/applicant.model')
const coApplicantModel = require('../model/co-Applicant.model')
const creditPdModel = require("../model/credit.Pd.model");
const pdModel = require("../model/credit.Pd.model")
const employeeModel = require('../model/adminMaster/employe.model')
const udyamModel = require('../model/udyam.model')
const vendorModel = require('../model/adminMaster/vendor.model')
const guarantorModel = require('../model/guarantorDetail.model')
const electricityModel = require('../model/electricity.models')
const cibilDetailModel = require("../model/cibilDetail.model");
const roleModel = require("../model/adminMaster/role.model")
const designationModel = require("../model/adminMaster/newDesignation.model")
const newBrnachModel = require("../model/adminMaster/newBranch.model")

const cibilModel = require("../model/cibilDetail.model")
const { getAllFormattedDates } = require('../../../../Middelware/timeZone')
const newBranchModel = require("../model/adminMaster/newBranch.model")
const employeModel = require("../model/adminMaster/employe.model")
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { validationResult } = require("express-validator");
const { updateFileFields } = require('./functions.Controller')
const { generateCreditPdPdf } = require('./pdfGenerate.controller')
const { generatePdfWithAllData } = require('./pdAllDataPdf.controller')
const { generatePdfWithoutImage } = require('./pdPdfWithoutImage')
const { creditAndPdGoogleSheet, creditPdAndPdReportGoogleSheet, salesToPdAllFilesDataGoogleSheet, addPdDataToSheet } = require("../controller/googleSheet.controller")
const { PdEmail } = require("../controller/functions.Controller")
const { mailSendCustomerPdDone, pdPendingFilesMailSendFunction, pdNotCompleteFilesMailParticularEmployeeFunction } = require('./MailFunction/salesMail')
const { finalApprovalSheet, fileProcessSheet } = require("../controller/finalSanction/faGoogleSheet.controller")
const { addAutoTask, completeAutoTask } = require("../helper/autoTask.helper.js")
const  finalModel  = require("../model/finalSanction/finalSnction.model.js")

// Calculate total months between formattedStart and formattedEnd
const calculateTotalMonths = (startDate, endDate) => {
  let monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());

  // If the day of the end date is not the last day of the month, consider it as a full month
  if (endDate.getDate() < 1) {
    monthsDiff += 1;
  }
  return monthsDiff;
};



async function getAllCreditPpAssignFiles(req, res) {
  try {
    const employeeId = req.Id;
    const { status, page = 1, limit = 500, searchQuery, branchId, product } = req.query;
    const skip = (page - 1) * limit;


    let matchQuery = {};

    const employeeDetail = await employeeModel.findById(employeeId)
    const employeeBranch = await newBranchModel.findById(employeeDetail.branchId).select("_id")
    if (!employeeDetail) {
      return badRequest(res, "employee Not Found")
    }


    if (status === "allCases") {
      let branchFilter = {};

      if (branchId === "all") {
        branchFilter = {};
      } else if (!branchId) {
        branchFilter = { "branchDetails._id": new ObjectId(employeeBranch._id) };
      } else {
        branchFilter = { "branchDetails._id": new ObjectId(branchId) };
      }

      matchQuery = {
        // statusByCreditPd: { $in: ['notRequired', 'notAssign', 'WIP'] },
        creditPdId: null,
        fileStatus: "active",
        ...branchFilter,
      };
    } else if (status === "WIP") {
      matchQuery = {
        creditPdId: new ObjectId(employeeId),
        hoStatus: { $in: ['notAssign', 'notComplete', 'complete'] },
        statusByCreditPd: { $in: ['incomplete', 'WIP', 'accept', 'rivert', 'notAssign'] },
        fileStatus: "active",
      };
    } else if (status === "correction") {
      matchQuery = {
        creditPdId: new ObjectId(employeeId),
        hoStatus: "correction",
        statusByCreditPd: { $in: ['incomplete', 'WIP'] },
        fileStatus: "active",
      }
    } else if (status === "complete") {
      matchQuery = {
        creditPdId: new ObjectId(employeeId),
        hoStatus: { $in: ["complete", "notComplete", "notAssign"] },
        statusByCreditPd: { $in: ["approve", "complete", "reject", "rejectByApprover"] },
        fileStatus: "active",
      }
    } else {
      return badRequest(res, "statu must be `complete`, `correction` , `WIP` ,`allCases`")
    };

    if (status === "allCases") {
      if (product && product !== "all") {
        const productArray = Array.isArray(product) ? product : product.split(",");
        matchQuery["customerDetailsData.productId"] = { $in: productArray.map(id => new ObjectId(id)) };
      }


      if (product == "all" || product == '' || !product) {
        const excludedProductIds = ["6734821148d4dbfbe0c69c7e"];
        if (excludedProductIds.length > 0) {
          matchQuery["customerDetailsData.productId"] = { $nin: excludedProductIds.map(id => new ObjectId(id)) };
        }
      }
    }


    console.log('matchQuery-------', matchQuery)

    // SearchQuery conditions
    if (searchQuery) {
      matchQuery.$or = [
        { "customerDetailsData.customerFinId": { $regex: searchQuery, $options: "i" } },
        { "applicantDetails.fullName": { $regex: searchQuery, $options: "i" } },
        { "branchDetails.name": { $regex: searchQuery, $options: "i" } },
        { "customerFatherName": { $regex: searchQuery, $options: "i" } }
      ];
    }




    const totalDocs = await externalManagerModel.aggregate([
      {
        $lookup: {
          from: "customerdetails",
          localField: "customerId",
          foreignField: "_id",
          as: "customerDetailsData"
        }
      },
      {
        $lookup: {
          from: "newbranches",
          localField: "customerDetailsData.branch",
          foreignField: "_id",
          as: "branchDetails"
        }
      },
      {
        $lookup: {
          from: "applicantdetails",
          localField: "customerId",
          foreignField: "customerId",
          as: "applicantDetails"
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "customerDetailsData.productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      {
        $match: matchQuery
      },
      {
        $group: {
          _id: "$_id" // Group by unique ID to remove duplicates
        }
      },
      {
        $count: "total"
      }
    ]);


    const total = totalDocs[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);


    const allFiles = await externalManagerModel.aggregate([
      {
        $lookup: {
          from: "customerdetails",
          localField: "customerId",
          foreignField: "_id",
          as: "customerDetailsData"
        }
      },
      {
        $lookup: {
          from: "newbranches",
          localField: "customerDetailsData.branch",
          foreignField: "_id",
          as: "branchDetails"
        }
      },
      {
        $lookup: {
          from: "applicantdetails",
          localField: "customerId",
          foreignField: "customerId",
          as: "applicantDetails"
        }
      },
      {
        $lookup: {
          from: "cibildetails",
          localField: "customerId",
          foreignField: "customerId",
          as: "cibilDetailsData"
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "customerDetailsData.productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      {
        $lookup: {
          from: "pdformdatas",
          localField: "customerId",
          foreignField: "customerId",
          as: "pdDetails"
        }
      },
      {
        $addFields: {
          customerDetailsData: { $arrayElemAt: ["$customerDetailsData", 0] },
          branchDetails: { $arrayElemAt: ["$branchDetails", 0] },
          applicantDetails: { $arrayElemAt: ["$applicantDetails", 0] },
          cibilDetailsData: { $arrayElemAt: ["$cibilDetailsData", 0] },
          pdDetails: { $arrayElemAt: ["$pdDetails", 0] },
          productDetails: { $arrayElemAt: ["$productDetails", 0] }
        }
      },
      {
        $match: matchQuery
      },
      {
        $group: {
          _id: "$_id",
          customerId: { $first: "$customerId" },
          externalVendorId: { $first: "$externalVendorId" },
          partnerNameId: { $first: "$partnerNameId" },
          creditPdId: { $first: "$creditPdId" },
          statusByCreditPd: { $first: "$statusByCreditPd" },
          creditPdRejectPhoto: { $first: "$creditPdRejectPhoto" },
          remarkForCreditPd: { $first: "$remarkForCreditPd" },
          pdfCreateByCreditPd: { $first: "$pdfCreateByCreditPd" },
          correctionRemark: { $first: { $ifNull: ["$pdDetails.correctionRemark", ""] } },
          reasonForReject: { $first: "$reasonForReject" },
          remarkByCreditPd: { $first: "$remarkByCreditPd" },
          customerFinId: { $first: "$customerDetailsData.customerFinId" },
          customerName: { $first: "$applicantDetails.fullName" },
          customerMobileNo: { $first: "$applicantDetails.mobileNo" },
          customerFatherName: { $first: "$applicantDetails.fatherName" },
          customerPhoto: { $first: "$applicantDetails.applicantPhoto" },
          product: { $first: "$productDetails.productName" },
          productId: { $first: "$productDetails._id" },
          cibilRemarkForPd: { $first: { $ifNull: ["$cibilDetailsData.cibilRemarkForPd", ""] } },
          customerAddress: {
            $first: {
              $concat: [
                "$applicantDetails.permanentAddress.addressLine1",
                " ",
                "$applicantDetails.permanentAddress.addressLine2"
              ]
            }
          },
          branchDetails: { $first: "$branchDetails" },
          applicantDetails: { $first: "$applicantDetails" }
        }
      },
      {
        $sort: { _id: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: parseInt(limit)
      }
    ]);


    // console.log('matchQuery---//---',matchQuery)

    return success(res, "PD Documents Assign List",
      {
        count: total,
        items: allFiles,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      });

  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


async function employeePdFileCounts(req, res) {
  try {
    const employeeId = req.Id;

    const result = await externalManagerModel.aggregate([
      {
        $facet: {
          WIP: [
            {
              $match: {
                creditPdId: new ObjectId(employeeId),
                hoStatus: { $in: ['notAssign', 'notComplete', 'complete'] },
                statusByCreditPd: { $in: ['incomplete', 'WIP', 'accept', 'rivert', 'notAssign'] },
                fileStatus: "active"
              }
            },
            { $count: "count" }
          ],
          correction: [
            {
              $match: {
                creditPdId: new ObjectId(employeeId),
                hoStatus: "correction",
                statusByCreditPd: { $in: ['incomplete', 'WIP'] },
                fileStatus: "active"
              }
            },
            { $count: "count" }
          ],
          complete: [
            {
              $match: {
                creditPdId: new ObjectId(employeeId),
                hoStatus: { $in: ["complete", "notComplete", "notAssign"] },
                statusByCreditPd: { $in: ["approve", "complete", "reject", "rejectByApprover"] },
                fileStatus: "active"
              }
            },
            { $count: "count" }
          ]
        }
      },
      {
        $project: {
          WIP: { $ifNull: [{ $arrayElemAt: ["$WIP.count", 0] }, 0] },
          correction: { $ifNull: [{ $arrayElemAt: ["$correction.count", 0] }, 0] },
          complete: { $ifNull: [{ $arrayElemAt: ["$complete.count", 0] }, 0] }
        }
      }
    ])
    return success(res, "Pd Files Count", result)
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

async function getAllPdFileAdminDashboard(req, res) {
  try {
    const tokenId = req.Id;
    const { pdEmployeeId, pdCompleteDate, pdCompleteDateSelect, hoRePdDate, hoRePdDateSelect, hoApproveDate, hoApproveDateSelect, status, page = 1, limit = 500, searchQuery, branchId } = req.query;
    const skip = (page - 1) * limit;

    let matchQuery = {};

    const employeeDetail = await employeeModel.findById(tokenId)
    if (!employeeDetail) {
      return badRequest(res, "employee Not Found")
    }

    if (pdEmployeeId) {
      matchQuery = {
        creditPdId: new ObjectId(pdEmployeeId),
      };
    }
    if (branchId) {
      matchQuery = {
        "branchDetails._id": new ObjectId(branchId)
      };
    }
    if (status) {
      if (status === "allCases") {
        matchQuery = {
          statusByCreditPd: { $in: ['notRequired', 'notAssign'] },
          creditPdId: null,
          fileStatus: "active",
        };
      } else if (status === "WIP") {
        matchQuery = {
          hoStatus: { $in: ['notComplete', 'notAssign'] },
          statusByCreditPd: { $in: ['incomplete', 'pending', 'WIP', 'accept'] },
          fileStatus: "active",
        };
      } else if (status === "RePd") {
        matchQuery = {
          hoStatus: { $in: ['rePd'] },
          statusByCreditPd: { $in: ["WIP", "notAssign"] },
          fileStatus: "active",
        };
      } else if (status === "correction") {
        matchQuery = {
          hoStatus: { $in: ['correction'] },
          statusByCreditPd: { $in: ["WIP"] },
          fileStatus: "active",
        };
      } else if (status === "complete") {
        matchQuery = {
          hoStatus: { $in: ["notAssign", "complete", "notComplete"] },
          statusByCreditPd: { $in: ["approve", "complete", "reject", "rejectByApprover"] },
          fileStatus: "active",
        };
      } else {
        return badRequest(res, "statu must be `complete`, `RePd` ,correction`, `WIP` ,`allCases`")
      };
    }
    if (pdCompleteDate) {
      matchQuery = {
        creditPdCompleteDate: pdCompleteDate,
      };
    };
    if (hoRePdDate) {
      matchQuery = {
        hoRePdDate: hoRePdDate,
      };
    };
    if (hoApproveDate) {
      matchQuery = {
        hoCompleteDate: hoApproveDate,
      };
    };

    if (searchQuery) {
      matchQuery.$or = [
        { "customerdetails.customerFinId": { $regex: searchQuery, $options: "i" } },
        { "applicantDetails.fullName": { $regex: searchQuery, $options: "i" } },
        { "branchDetails.name": { $regex: searchQuery, $options: "i" } },
        { "customerFatherName": { $regex: searchQuery, $options: "i" } }
      ];
    }

    // console.log('matchQuery----', matchQuery)

    const totalDocs = await externalManagerModel.aggregate([
      {
        $lookup: {
          from: "customerdetails",
          localField: "customerId",
          foreignField: "_id",
          as: "customerdetails"
        }
      },
      {
        $lookup: {
          from: "newbranches",
          localField: "customerdetails.branch",
          foreignField: "_id",
          as: "branchDetails"
        }
      },
      {
        $lookup: {
          from: "applicantdetails",
          localField: "customerId",
          foreignField: "customerId",
          as: "applicantDetails"
        }
      },
      {
        $unwind: {
          path: "$customerdetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$branchDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$applicantDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: matchQuery
      },
      {
        $count: "total"
      }
    ]);

    const total = totalDocs[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    // Main query with pagination
    const allFilesData = await externalManagerModel.aggregate([
      {
        $lookup: {
          from: "customerdetails",
          localField: "customerId",
          foreignField: "_id",
          as: "customerdetails"
        }
      },
      {
        $lookup: {
          from: "newbranches",
          localField: "customerdetails.branch",
          foreignField: "_id",
          as: "branchDetails"
        }
      },
      {
        $lookup: {
          from: "applicantdetails",
          localField: "customerId",
          foreignField: "customerId",
          as: "applicantDetails"
        }
      },
      {
        $unwind: {
          path: "$customerdetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$branchDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$applicantDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: matchQuery
      },
      {
        $project: {
          _id: 1,
          customerId: 1,
          externalVendorId: 1,
          partnerNameId: 1,
          creditPdId: 1,
          statusByCreditPd: 1,
          creditPdRejectPhoto: 1,
          remarkForCreditPd: 1,
          pdfCreateByCreditPd: 1,
          reasonForReject: 1,
          remarkByCreditPd: 1,
          hoStatus: 1,
          customerFinId: "$customerdetails.customerFinId",
          customerName: "$applicantDetails.fullName",
          customerMobileNo: "$applicantDetails.mobileNo",
          customerFatherName: "$applicantDetails.fatherName",
          customerPhoto: "$applicantDetails.applicantPhoto",
          customerAddress: {
            $concat: [
              "$applicantDetails.permanentAddress.addressLine1",
              " ",
              "$applicantDetails.permanentAddress.addressLine2"
            ]
          },
          "branchDetails._id": 1,
          "branchDetails.name": 1,
          "applicantDetails._id": 1,
          "applicantDetails.email": 1,
          "applicantDetails.fullName": 1
        }
      },
      {
        $sort: { _id: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: parseInt(limit)
      }
    ]);


    return success(res, "PD Files", {
      count: allFilesData.length, data: allFilesData, pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    }
    )
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

async function fileRevertByPd(req, res) {
  // console.log('api run ')
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    // Validate customerId in the request
    const { customerId, statusByPd, remarkByPd, requiredDocument } = req.query;

    if (!customerId) {
      return badRequest(res, "customerId is required");
    }

    // Fetch the coApplicant count
    const coApplicantCheck = await coApplicantModel.find({ customerId: customerId });
    const coApplicantCount = coApplicantCheck.length + 1; // Calculate dynamically based on the retrieved data
    // console.log('-coApplicantCount', coApplicantCount)
    // Initialize update fields
    let updateFields = {};

    if (statusByPd) {
      updateFields['fileRevertStatusByPd'] = statusByPd;
    }
    if (remarkByPd) {
      updateFields['fileRevertRemarkByPd'] = remarkByPd;
    }

    // Update fields based on requiredDocument value
    if (requiredDocument === 'coApplicant') {
      updateFields['fileRevertStatusBySales.coApplicantCount'] = coApplicantCount;
      updateFields['fileRevertStatusBySales.coApplicant'] = false;
      updateFields['fileRevertStatusByCibil'] = false;
    }

    if (requiredDocument === 'guarantor') {
      updateFields['fileRevertStatusBySales.guarantor'] = false;
      updateFields['fileRevertStatusByCibil'] = false;
    }

    // Update processModel and externalManagerModel
    const processModelUpdate = await processModel.findOneAndUpdate(
      { customerId },
      { $set: updateFields },
      { new: true }
    );

    const externalManagerModelUpdate = await externalManagerModel.findOneAndUpdate(
      { customerId },
      { $set: updateFields },
      { new: true }
    );

    // Return success response
    return success(res, "File Revert Successfully", {
      processModel: processModelUpdate,
      externalManagerModel: externalManagerModelUpdate
    });

  } catch (error) {
    console.error("Error in fileRevertByPd:", error);
    unknownError(res, error);
  }
}


async function updateBdCompleteDate(req, res) {
  try {
    const { id } = req.params;

    const record = await pdModel.findById(id);
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    if (!record.bdCompleteDate || record.bdCompleteDate.trim() === '') {
      const formattedDates = getAllFormattedDates(record.updatedAt);
      record.bdCompleteDate = formattedDates.iso;
    }

    // Save the updated record
    await record.save();

    res.status(200).json({ message: 'bdCompleteDate updated successfully', data: record });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

async function addCreditPdReportJsonForm(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const { customerId, formUpdate, residentType, residentCurrentSince, statusByPd, remarkByPd, rejectReason, pendingReason, videoUpload, pdType, latitude, longitude } = req.body;
    const formCompleteDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");
    const currentTime = moment().tz('Asia/Kolkata');
    const pdCompleteDate = currentTime.format("YYYY-MM-DD");
    const pdCompleteTime = currentTime.format("hh:mm A");
    let role = pdType
    let tokenId = new ObjectId(req.Id)

    const employeeFind = await employeeModel.findById(tokenId);
    if (!employeeFind) {
      return badRequest(res, "Employee not found");
    }


    const customerDetails = await customerModel.findById(customerId);
    if (!customerDetails) {
      return notFound(res, "Customer not found");
    }

    const branchName = await newBranchModel.findById(employeeFind.branchId);
    if (!branchName) {
      return badRequest(res, "Employe Branch not found");
    }

    const customerFormDetail = await customerModel.findById(customerId).populate({ path: "branch", select: "branch _id" })
    const applicantFormDetail = await applicantModel.findOne({ customerId: customerId })

    const { landmarkPhoto,
      latLongPhoto,
      fourBoundaryPhotos,
      workPhotos,
      houseInsidePhoto,
      propertyOtherPhotos,
      selfiWithCustomer,
      photoWithLatLong,
      front,
      leftSide,
      rightSide,
      approachRoad,
      mainRoad,
      interiorRoad,
      selfieWithProperty,
      propertyPhoto,
      gasDiaryPhoto,
      SSSMPhoto,
      familyMemberPhotos,
      otherDocUpload,
      electricityBillPhoto,
      udyamCertificate,
      meterPhoto,
      coApplicantImage, guarantorImage,
      applicantImage, familyMember, cibilAnalysis, policeStation, incomeSource,
      assetDetails, property, total, bankDetail, applicant, co_Applicant, guarantor,
      referenceDetails, approveLoanDetails, totalIncomeDetails, samagraDetail,
      pdReplyToCibilRemarks,
    } = req.body



    // Update Applicant with merge logic
    if (req.body.applicant) {
      // First get the existing applicant data
      const existingApplicant = await applicantModel.findOne({ customerId: customerId });

      if (existingApplicant) {
        // Merge existing data with new data (keep existing fields if new ones aren't provided)
        const mergedApplicantData = { ...existingApplicant.toObject(), ...req.body.applicant };

        // Update with merged data
        await applicantModel.findOneAndUpdate(
          { customerId: customerId },
          { $set: mergedApplicantData },
          { new: true }
        );
        // } else {
        //   // If no existing record, create a new one
        //   await applicantModel.create({
        //     customerId: customerId,
        //     ...req.body.applicant
        //   });
      }
    }

    // Update Co-Applicants with merge logic
    if (Array.isArray(req.body.co_Applicant) && req.body.co_Applicant.length > 0) {
      const existingCoApplicants = await coApplicantModel
        .find({ customerId })
        .sort({ createdAt: 1 }); // Sort by createdAt in ascending order (oldest first)

      for (let i = 0; i < req.body.co_Applicant.length; i++) {
        const inputCoApplicant = req.body.co_Applicant[i];

        if (existingCoApplicants[i]) {
          // Convert Mongoose document to plain object
          const existingData = existingCoApplicants[i].toObject();

          // Create a clean copy of the input data without _id
          const { _id, ...cleanInputData } = inputCoApplicant;

          // Merge existing data with new data (existing data will be preserved if new data doesn't include those fields)
          const mergedData = { ...existingData, ...cleanInputData };

          // Remove _id from merged data to prevent MongoDB errors
          delete mergedData._id;

          // Update with merged data
          await coApplicantModel.findByIdAndUpdate(
            existingCoApplicants[i]._id,
            { $set: mergedData },
            { new: true }
          );
          // } else {
          //   // Create a clean copy without _id
          //   const { _id, ...cleanInputData } = inputCoApplicant;

          //   // Create a new co-applicant if it doesn't exist in the database
          //   await coApplicantModel.create({
          //     customerId: customerId,
          //     ...cleanInputData
          //   });
        }
      }
    }

    // Update Guarantor with merge logic
    if (req.body.guarantor) {
      // First get the existing guarantor data
      const existingGuarantor = await guarantorModel.findOne({ customerId: customerId });

      if (existingGuarantor) {
        // Merge existing data with new data (keep existing fields if new ones aren't provided)
        const mergedGuarantorData = { ...existingGuarantor.toObject(), ...req.body.guarantor };

        // Update with merged data
        await guarantorModel.findOneAndUpdate(
          { customerId: customerId },
          { $set: mergedGuarantorData },
          { new: true }
        );
        // } else {
        //   // If no existing record, create a new one
        //   await guarantorModel.create({
        //     customerId: customerId,
        //     ...req.body.guarantor
        //   });
      }
    }

    if (applicant) {
      if (applicant.alternateMobileNo == applicantFormDetail?.mobileNo) {
        return badRequest(res, "Applicant Alternate Mobile to be Unique")
      }
    }

    function checkAllFields(obj) {
      for (let key in obj) {
        if (obj[key] === '' || obj[key] === null || obj[key] === undefined) {
          return false;
        }
        if (typeof obj[key] === 'object') {
          if (!checkAllFields(obj[key])) {
            return false;
          }
        }
      }
      return true;
    }

    let cibilAnalysisFieldsFilled = checkAllFields(cibilAnalysis);
    let policeStationFieldsFilled = checkAllFields(policeStation);
    let totalFieldsFilled = checkAllFields(total);
    let approveLoanFieldsFilled = checkAllFields(approveLoanDetails);

    let propertyDocumentrequire;
    let propertyFieldsFilled;

    const checkFiledsAllowed = await customerModel.findById(customerId)
      .populate({
        path: 'productId',
        populate: {
          path: 'permissionFormId',
          model: 'permissionForm'
        }
      });
    propertyDocumentrequire = checkFiledsAllowed?.productId?.permissionFormId?.pdReportProperty;
    if (propertyDocumentrequire == "true") {
      propertyFieldsFilled = checkAllFields(property);
    } else {
      propertyFieldsFilled = true;
    }

    // console.log('propertyFieldsFilled',propertyFieldsFilled)

    let allFieldsFilledOverall = true;

    if (!Array.isArray(req.body.incomeSource)) {
      req.body.incomeSource = req.body.incomeSource ? req.body.incomeSource : []
    } else {
      for (let i = 0; i < incomeSource.length; i++) {

        const findValue = incomeSource[i].incomeSourceType;
        let incomeData = incomeSource[i].data
        incomeSource[i][findValue] = incomeData
        const allObj = incomeSource[i][findValue];
        let allFieldsFilled = checkAllFields(allObj);
        // console.log(allFieldsFilled ? `${findValue}: All fields are filled` : `${findValue}: Some fields are empty`);
        if (!allFieldsFilled) {
          allFieldsFilledOverall = false;
        }
      }
    }
    if (!Array.isArray(req.body.familyMember)) {
      req.body.familyMember = req.body.familyMember ? req.body.familyMember : []
    } else {
      for (let i = 0; i < familyMember.length; i++) {
        let familyMemberFieldsFilled = checkAllFields(familyMember[i]);
        if (!familyMemberFieldsFilled) {
          allFieldsFilledOverall = false;
        }
      }
    }

    if (!Array.isArray(req.body.assetDetails)) {
      req.body.assetDetails = req.body.assetDetails ? req.body.assetDetails : []
    } else {
      for (let i = 0; i < assetDetails.length; i++) {
        let assetDetailsFieldsFilled = checkAllFields(assetDetails[i]);
        if (!assetDetailsFieldsFilled) {
          allFieldsFilledOverall = false;
        }
      }
    }

    const creditPdData = {
      customerId,
      pdType,
      videoUpload,
      rejectReason,
      pendingReason,
      applicantImage,
      coApplicantImage,
      guarantorImage,
      applicant: applicant,
      co_Applicant: co_Applicant,
      guarantor: guarantor,
      policeStation,
      familyMember,
      cibilAnalysis,
      incomeSource,
      property,
      bankDetail,
      referenceDetails,
      landmarkPhoto,
      latLongPhoto,
      workPhotos,
      houseInsidePhoto,
      propertyOtherPhotos,
      selfiWithCustomer,
      photoWithLatLong,
      front,
      leftSide,
      rightSide,
      approachRoad,
      mainRoad,
      interiorRoad,
      selfieWithProperty,
      propertyPhoto,
      assetDetails,
      total,
      totalIncomeDetails,
      approveLoanDetails,
      samagraDetail,
      gasDiaryPhoto,
      SSSMPhoto,
      familyMemberPhotos,
      otherDocUpload,
      meterPhoto,
      electricityBillPhoto,
      udyamCertificate,
      residentType,
      residentCurrentSince,
      remarkByPd,
      fourBoundaryPhotos,
      pdReplyToCibilRemarks,
    };

    let existingCreditPd = await creditPdModel.findOne({ customerId });


    if (existingCreditPd) {
      if (latitude !== undefined && longitude !== undefined) {
        creditPdData.location = {
          type: "Point",
          coordinates: [longitude, latitude],
        };
      } else if (existingCreditPd.location) {
        creditPdData.location = existingCreditPd.location;
      }
    } else {
      creditPdData.location = {
        type: "Point",
        coordinates: latitude !== undefined && longitude !== undefined ? [longitude, latitude] : [0, 0],
      };
    }

    if (formUpdate === 'HO') {
      creditPdData.hoId = tokenId;
      creditPdData.hoUpdateDate = formCompleteDate;
    } else {
      creditPdData.bdCompleteDate = formCompleteDate,
        creditPdData.pdId = tokenId;
    }


    let result;
    if (existingCreditPd) {
      creditPdData.status = statusByPd === 'approve' ? 'approve' :
        statusByPd === 'complete' ? 'complete' :
          statusByPd === 'reject' ? 'reject' : 'WIP';

      result = await creditPdModel.findOneAndUpdate(
        { customerId },
        { $set: creditPdData },
        { new: true }
      );
    } else {
      creditPdData.customerId = customerId;
      creditPdData.status = statusByPd === 'approve' ? 'approve' :
        statusByPd === 'complete' ? 'complete' :
          statusByPd === 'reject' ? 'reject' : 'WIP';
      const newCreditPd = new creditPdModel(creditPdData);
      result = await newCreditPd.save();
    }

    // Handle PDF generation if status is complete, reject, or approve
    if (["complete", "reject", "approve"].includes(creditPdData.status)) {
      const pdReport = await generateCreditPdPdf(res, customerId);
      const pdReportLink = typeof pdReport === "string" ? pdReport : pdReport?.pdReport;
      if (!pdReportLink) return badRequest(res, "PDF generation failed, no valid report link found.");

      try {
        await pdModel.findOneAndUpdate(
          { customerId },
          { pdfLink: pdReportLink },
          { new: true }
        );
        const parameters = {
          taskType: "pd",
          customerId: customerId || null,
          status: "completed",
          endDate: formCompleteDate
        }
        await completeAutoTask(parameters)
      } catch (dbError) {
        console.error("Database Update Error:", dbError);
        return badRequest(res, `PDF generated but database update failed: ${dbError.message}`);
      }
    }


    if (statusByPd == 'complete' || statusByPd == 'approve' && formUpdate !== 'HO') {

      await finalModel.findOneAndUpdate(
        { customerId },
        {
          $set: {
            fileStatus: "PD Done",
            responsibility: "Branch"
          }
        },
        {
          upsert: true,
          new: true
        }
      );
    }
    
    const updateData = {
      statusByCreditPd: creditPdData.status || "WIP",
      remarkByCreditPd: remarkByPd
    };
    
    if (creditPdData.status === 'complete' || creditPdData.status === 'reject' || creditPdData.status === 'approve') {
      updateData.hoStatus = 'complete'
    }
    
    if((statusByPd == 'complete' || statusByPd == 'approve' || statusByPd === 'reject') && formUpdate !== 'HO') {
      updateData.creditPdCompleteDate = formCompleteDate;
    }
    
    await externalManagerModel.findOneAndUpdate(
      { customerId },
      updateData,
      { new: true }
    );
    
    success(res, `${role} Form ${existingCreditPd ? "Update" : "Add"} Successful`, result);
    const mailSwitchConfig = await mailSwitchesModel.findOne();
    if (mailSwitchConfig?.masterMailStatus &&
      mailSwitchConfig?.mailSendCustomerPdDone && (creditPdData.status === 'complete' || creditPdData.status === 'reject' || creditPdData.status === 'approve' && formUpdate !== 'HO')) {
      mailSendCustomerPdDone(customerId, req, statusByPd, remarkByPd)
      // console.log('mail function--------')
    }
    if (creditPdData.status === 'complete' || creditPdData.status === 'approve' && formUpdate !== 'HO') {
      await fileProcessSheet(customerId)

    }
    const salesToPd = {
      customerFinIdStr: customerFormDetail?.customerFinId,
      pdRemarkStr: remarkByPd,
      pdStatusStr: statusByPd,
      pdCompleteDateStr: pdCompleteDate,
      pdCompleteTimeStr: pdCompleteTime
    }


    if (creditPdData.status == 'complete' || creditPdData.status == 'approve' || creditPdData.status === 'reject') {
      // console.log('complete ------------ ')
      await finalApprovalSheet(customerId)
    }


    // await addPdDataToSheet(customerId)

    await salesToPdAllFilesDataGoogleSheet(salesToPd)

  } catch (error) {
    console.error("error", error.message);
    unknownError(res, error.message);
  }
}


const checkAllFields = (obj) => {
  if (!obj || typeof obj !== 'object') return false;
  return Object.values(obj).every(value =>
    value !== '' && value !== null && value !== undefined &&
    (typeof value !== 'object' || checkAllFields(value))
  );
};


function capitalizeWords(str) {
  return str.replace(/\b\w/g, function (char) {
    return char.toUpperCase();
  });
}



async function creditPdGet(req, res) {
  try {
    const role = req.roleName;
    // console.log('token', role);
    const { customerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return badRequest(res, "Invalid Customer ID");
    }

    const cibilDetail = await cibilModel.findOne({ customerId }).select("cibilRemarkForPd");
    const creditPd = await creditPdModel.findOne({ customerId });
    if (!creditPd) {
      return success(res, 'PD form details', { cibilRemarkForPd: cibilDetail?.cibilRemarkForPd || "" });
    }

    const coApplicants = await coApplicantModel.find({ customerId }).sort({ createdAt: 1 });

    // Transform coApplicants into the required structure
    const coApplicantResponse = coApplicants.map((coApplicant, index) => ({
      _id: coApplicant._id,
      coApplicantType: coApplicant.coApplicantType || "",
      businessType: coApplicant.businessType || "",
      occupation: coApplicant.occupation || "",
      DOB: coApplicant.dob || "",
      emailId: coApplicant.email || "",
      houseLandMark: coApplicant.houseLandMark || "",
      alternateMobileNo: coApplicant.alternateMobileNo || "",
      noOfyearsAtCurrentAddress: coApplicant.noOfyearsAtCurrentAddress || "",
      gender: coApplicant.gender || "",
      religion: coApplicant.religion || "",
      nationality: coApplicant.nationality || "",
      category: coApplicant.category || "",
      caste: coApplicant.caste || "",
      maritalStatus: coApplicant.maritalStatus || "",
      educationalDetails: coApplicant.educationalDetails || "",
      residenceType: coApplicant.residenceType || "",
      fullName: coApplicant.fullName || ""
    }));

    const applicant = await applicantModel.findOne({ customerId });


    const applicantResponse = {
      applicantType: applicant?.applicantType || "",
      businessType: applicant?.businessType || "",
      occupation: applicant?.occupation || "",
      DOB: applicant?.dob || "",
      email: applicant?.email || "",
      houseLandMark: applicant?.houseLandMark || "",
      alternateMobileNo: applicant?.alternateMobileNo || "",
      noOfyearsAtCurrentAddress: applicant?.noOfyearsAtCurrentAddress || "",
      gender: applicant?.gender || "",
      religion: applicant?.religion || "",
      nationality: applicant?.nationality || "",
      category: applicant?.category || "",
      caste: applicant?.caste || "",
      maritalStatus: applicant?.maritalStatus || "",
      noOfDependentWithCustomer: applicant?.noOfDependentWithCustomer || "",
      educationalDetails: applicant?.educationalDetails || "",
      residenceType: applicant?.residenceType || ""
    };

    // Fetch guarantor details
    const guarantor = await guarantorModel.findOne({ customerId });

    const guarantorResponse = {
      guarantorType: guarantor?.guarantorType || "",
      businessType: guarantor?.businessType || "",
      occupation: guarantor?.occupation || "",
      residenceType: guarantor?.residenceType || "",
      DOB: guarantor?.dob || "",
      emailId: guarantor?.email || "",
      houseLandMark: guarantor?.houseLandMark || "",
      alternateMobileNo: guarantor?.alternateMobileNo || "",
      noOfyearsAtCurrentAddress: guarantor?.noOfyearsAtCurrentAddress || "",
      gender: guarantor?.gender || "",
      religion: guarantor?.religion || "",
      nationality: guarantor?.nationality || "",
      category: guarantor?.category || "",
      caste: guarantor?.caste || "",
      maritalStatus: guarantor?.maritalStatus || "",
      educationalDetails: guarantor?.educationalDetails || ""
    };

    const defaultReference = { name: "", address: "", relation: "", mobileNumber: "" };

    const referenceDetails = creditPd?.referenceDetails && Array.isArray(creditPd.referenceDetails)
      ? creditPd.referenceDetails.map(ref => ({
        name: ref.name || "",
        address: ref.address || "",
        relation: ref.relation || "",
        mobileNumber: ref.mobileNumber || ""
      }))
      : [];

    // Ensure at least two entries
    while (referenceDetails.length < 2) {
      referenceDetails.push({ ...defaultReference });
    }
    const responseData = {
      ...creditPd.toObject(), // Convert Mongoose document to a plain object
      cibilRemarkForPd: cibilDetail?.cibilRemarkForPd || "",
      co_Applicant: coApplicantResponse,
      applicant: applicantResponse,
      guarantor: guarantorResponse,
      referenceDetails: referenceDetails,
    };

    return success(res, 'PD form details', responseData);
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}



async function creditPdGetForApp(req, res) {
  try {
    const role = req.roleName;
    const { customerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return badRequest(res, "Invalid Customer ID");
    }

    const customerDetail = await customerModel.findById(customerId).select('pdPaymentStatus pdPaymentDate pdPaymentGateway')
    const cibilDetail = await cibilModel.findOne({ customerId }).select("cibilRemarkForPd");
    const creditPd = await creditPdModel.findOne({ customerId: customerId });

    const transformedIncomeSource = {
      agricultureBusiness: creditPd?.incomeSource.find(
        source => source.incomeSourceType === "agricultureBusiness"
      )?.agricultureBusiness || {},

      milkBusiness: creditPd?.incomeSource.find(
        source => source.incomeSourceType === "milkBusiness"
      )?.milkBusiness || {},

      salaryIncome: creditPd?.incomeSource.find(
        source => source.incomeSourceType === "salaryIncome"
      )?.salaryIncome || {},

      other: creditPd?.incomeSource.find(
        source => source.incomeSourceType === "other"
      )?.other || {}
    };

    // Fetch coApplicant details
    const coApplicants = await coApplicantModel.find({ customerId }).sort({ createdAt: 1 });

    // Transform coApplicants into the required structure
    const coApplicantResponse = coApplicants.map((coApplicant, index) => ({
      _id: coApplicant._id,
      coApplicantType: coApplicant.coApplicantType,
      businessType: coApplicant.businessType || "",
      occupation: coApplicant.occupation || "",
      DOB: coApplicant.dob || "",
      emailId: coApplicant.email || "",
      houseLandMark: coApplicant.houseLandMark || "",
      alternateMobileNo: coApplicant.alternateMobileNo || "",
      noOfyearsAtCurrentAddress: coApplicant.noOfyearsAtCurrentAddress || "",
      gender: coApplicant.gender || "",
      religion: coApplicant.religion || "",
      nationality: coApplicant.nationality || "",
      category: coApplicant.category || "",
      caste: coApplicant.caste || "",
      maritalStatus: coApplicant.maritalStatus || "",
      educationalDetails: coApplicant.educationalDetails || "",
      residenceType: coApplicant.residenceType || "",
      fullName: coApplicant.fullName || ""
    }));

    const applicant = await applicantModel.findOne({ customerId });


    const applicantResponse = {
      applicantType: applicant?.applicantType || "",
      businessType: applicant?.businessType || "",
      occupation: applicant?.occupation || "",
      DOB: applicant?.dob || "",
      email: applicant?.email || "",
      houseLandMark: applicant?.houseLandMark || "",
      alternateMobileNo: applicant?.alternateMobileNo || "",
      noOfyearsAtCurrentAddress: applicant?.noOfyearsAtCurrentAddress || "",
      gender: applicant?.gender || "",
      religion: applicant?.religion || "",
      nationality: applicant?.nationality || "",
      category: applicant?.category || "",
      caste: applicant?.caste || "",
      maritalStatus: applicant?.maritalStatus || "",
      noOfDependentWithCustomer: applicant?.noOfDependentWithCustomer || "",
      educationalDetails: applicant?.educationalDetails || "",
      residenceType: applicant?.residenceType || ""
    };

    // Fetch guarantor details
    const guarantor = await guarantorModel.findOne({ customerId });

    const guarantorResponse = {
      guarantorType: guarantor?.guarantorType || "",
      businessType: guarantor?.businessType || "",
      occupation: guarantor?.occupation || "",
      residenceType: guarantor?.residenceType || "",
      DOB: guarantor?.dob || "",
      emailId: guarantor?.email || "",
      houseLandMark: guarantor?.houseLandMark || "",
      alternateMobileNo: guarantor?.alternateMobileNo || "",
      noOfyearsAtCurrentAddress: guarantor?.noOfyearsAtCurrentAddress || "",
      gender: guarantor?.gender || "",
      religion: guarantor?.religion || "",
      nationality: guarantor?.nationality || "",
      category: guarantor?.category || "",
      caste: guarantor?.caste || "",
      maritalStatus: guarantor?.maritalStatus || "",
      educationalDetails: guarantor?.educationalDetails || ""
    };



    // Modified response with coApplicant data
    const modifiedResponse = {
      ...creditPd?.toObject(),
      incomeSource: transformedIncomeSource,
      cibilRemarkForPd: cibilDetail?.cibilRemarkForPd || "",
      co_Applicant: coApplicantResponse,
      applicant: applicantResponse,
      guarantor: guarantorResponse,
      pdPaymentDetail:customerDetail,
    };

    return success(res, "PD form details", modifiedResponse);
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


async function creditPdFormImagesGet(req, res) {
  try {
    const role = req.roleName;
    const { customerId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return badRequest(res, "Invalid Customer ID");
    }

    const creditPd = await creditPdModel.findOne({ customerId: customerId });
    if (!creditPd) {
      return notFound(res, 'form not found');
    }

    // Transform income source data
    const transformedIncomeSource = {
      agricultureBusiness: creditPd.incomeSource.find(
        source => source.incomeSourceType === 'agricultureBusiness'
      )?.agricultureBusiness || {},
      milkBusiness: creditPd.incomeSource.find(
        source => source.incomeSourceType === 'milkBusiness'
      )?.milkBusiness || {},
      salaryIncome: creditPd.incomeSource.find(
        source => source.incomeSourceType === 'salaryIncome'
      )?.salaryIncome || {},
      other: creditPd.incomeSource.find(
        source => source.incomeSourceType === 'other'
      )?.other || {}
    };

    const pdData = {
      ...creditPd.toObject(),
      incomeSource: transformedIncomeSource
    };

    // Function to check if a file is a media file
    const isMediaFile = (path) => {
      if (!path) return false;
      const fileExtension = path.split('.').pop().toLowerCase();
      return ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'mp4', 'mov', 'avi'].includes(fileExtension);
    };

    // Function to collect all media fields with their paths
    const collectMediaFields = (obj, parentKey = '') => {
      const mediaFields = {};

      const processValue = (value, key) => {
        const fullPath = parentKey ? `${parentKey}.${key}` : key;

        if (Array.isArray(value)) {
          const mediaFiles = value.filter(item => {
            if (typeof item === 'string') {
              return isMediaFile(item);
            }
            return false;
          });

          if (mediaFiles.length > 0) {
            mediaFields[fullPath] = mediaFiles;
          }

          // Process objects within arrays
          value.forEach((item, index) => {
            if (typeof item === 'object' && item !== null) {
              Object.assign(mediaFields, collectMediaFields(item, `${fullPath}[${index}]`));
            }
          });
        } else if (typeof value === 'string' && isMediaFile(value)) {
          mediaFields[fullPath] = value;
        } else if (typeof value === 'object' && value !== null) {
          Object.assign(mediaFields, collectMediaFields(value, fullPath));
        }
      };

      for (const [key, value] of Object.entries(obj)) {
        processValue(value, key);
      }

      return mediaFields;
    };

    // Collect all media fields
    const mediaFields = collectMediaFields(pdData);

    const organizedMedia = {
      applicantImage: pdData.applicantImage || null,
      coApplicantImage: pdData.coApplicantImage || [],
      guarantorImage: pdData.guarantorImage || null,
      landmarkPhoto: pdData.landmarkPhoto || null,
      latLongPhoto: pdData.latLongPhoto || null,
      selfiWithCustomer: pdData.selfiWithCustomer || null,
      photoWithLatLong: pdData.photoWithLatLong || null,
      front: pdData.front || null,
      leftSide: pdData.leftSide || null,
      rightSide: pdData.rightSide || null,
      approachRoad: pdData.approachRoad || null,
      mainRoad: pdData.mainRoad || null,
      interiorRoad: pdData.interiorRoad || null,
      selfieWithProperty: pdData.selfieWithProperty || null,
      propertyPhoto: pdData.propertyPhoto || null,
      gasDiaryPhoto: pdData.gasDiaryPhoto || null,
      meterPhoto: pdData.meterPhoto || null,
      electricityBillPhoto: pdData.electricityBillPhoto || null,
      udyamCertificate: pdData.udyamCertificate || null,
      SSSMPhoto: pdData.SSSMPhoto || null,
      otherDocUpload: pdData.otherDocUpload || null,
      fourBoundaryPhotos: pdData.fourBoundaryPhotos || [],
      workPhotos: pdData.workPhotos || [],
      houseInsidePhoto: pdData.houseInsidePhoto || [],
      propertyOtherPhotos: pdData.propertyOtherPhotos || [],
      familyMemberPhotos: pdData.familyMemberPhotos || [],
      agriculture: transformedIncomeSource.agricultureBusiness?.agriculturePhotos || [],
      milk: {
        milkPhotos: transformedIncomeSource.milkBusiness?.milkPhotos || [],
        animalPhotos: transformedIncomeSource.milkBusiness?.animalPhotos || [],
      },
      salary: {
        salarySlips: transformedIncomeSource.salaryIncome?.last3MonthSalarySlipPhotos || [],
        bankStatement: transformedIncomeSource.salaryIncome?.bankStatementPhoto || null,
        salaryPhotos: transformedIncomeSource.salaryIncome?.salaryPhotos || [],
      },
      incomeOtherImages: transformedIncomeSource.other?.incomeOtherImages || [],
    };

    return success(res, `Pd Form Media Content`, organizedMedia);
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

async function PdFormsAssignList(req, res) {
  try {
    let tokenId;
    const role = req.roleName
    if (role === 'tlPd' || role === 'creditPd') {
      tokenId = req.Id
    } else if (role === 'admin') {
      const { pdId } = req.query
      if (!pdId) {
        return badRequest(res, "Missing required parameter: pdId");
      }
      tokenId = pdId
    } else {
      return badRequest(res, "Not authorized role");
    }

    const findPdEmployee = await employeeModel.findById(tokenId);
    if (!findPdEmployee) {
      return badRequest(res, "Employee not found");
    }
    const employeeRole = await roleModel.findById(findPdEmployee.roleId);
    if (!employeeRole) {
      return badRequest(res, "Role not found");
    }
    let pdType;
    if (employeeRole.roleName === 'tlPd') {
      pdType = 'tlPd';
    } else if (employeeRole.roleName === 'creditPd') {
      pdType = 'creditPd';
    } else {
      return badRequest(res, "Role must be 'tlPd' or 'creditPd'");
    }


    let pdEmployeeFindData;
    if (pdType === 'tlPd') {
      pdEmployeeFindData = await externalManagerModel.findOne({ tlPdId: tokenId })
    } else {
      pdEmployeeFindData = await externalManagerModel.findOne({ creditPdId: tokenId })
    }

    success(res, `${pdType} Form Assign List`, pdEmployeeFindData)
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

function capitalizeObject(obj) {
  // List of fields not to capitalize
  const fieldsToExcludeFromCapitalization = ['incomeSourceType', 'occupationType', 'status', 'residentType'];

  // Iterate through each property of the object
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Check if the property value is a string and not in the exclusion list
      if (typeof obj[key] === "string" && !fieldsToExcludeFromCapitalization.includes(key)) {
        // Capitalize the first letter of each word
        obj[key] = capitalizeWords(obj[key]);
      } else if (Array.isArray(obj[key])) {
        // If property value is an array, recursively capitalize strings in each element
        obj[key] = obj[key].map(item => (typeof item === "string" ? capitalizeWords(item) : capitalizeObject(item)));
      } else if (typeof obj[key] === "object") {
        // If property value is an object, recursively capitalize strings
        obj[key] = capitalizeObject(obj[key]);
      }
    }
  }
  return obj;
}

async function deletePdForm(req, res) {
  try {
    const { _id } = req.body;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return badRequest(res, "Invalid ID format");
    }
    const PdDelete = await creditPdModel.findByIdAndDelete(_id);
    if (!PdDelete) {
      return badRequest(res, "PD Form not found");
    }
    return success(res, "PD deleted successfully");
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

async function getAllPdEmploye(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    } else {
      const pdRole = await roleModel.findOne({ roleName: "pd" });
      if (pdRole) {
        const pdEmployes = await employeModel.find({ roleId: pdRole._id, status: "active" });
        success(res, "Get All PD Employees", pdEmployes);
      } else {
        notFound(res, "Role 'Pd' not found");
      }
    }
  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
}

async function customerPdDetails(req, res) {
  try {
    const { customerId } = req.query
    const pdType = 'tlPd'
    creditPd = await creditPdModel.findOne({ customerId: customerId });

    success(res, `Property Detaild PD Form`, creditPd)
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

// Function to format date as 'YYYY-MM-DD hh:mm:ss A'
function formatToCustomDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = d.getHours() % 12 || 12; // Convert to 12-hour format
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  const ampm = d.getHours() >= 12 ? "PM" : "AM";

  return `${year}-${month}-${day}T${String(hours).padStart(2, "0")}:${minutes}:${seconds} ${ampm}`;
}

async function hoByRePdAndGeneratePdReport(req, res) {
  try {

    console.log('check api ---')

    const { customerId, status, remarkByHo, correctionRemark, pdEmployeeId, } = req.query;
    const employeeId = req.Id;
    const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");

    if (!customerId) {
      return badRequest(res, "Customer ID is required");
    }

    const customerDetail = await customerModel.findById(customerId);
    if (!customerDetail) {
      return badRequest(res, "Customer not found");
    }

    const pdDetail = await pdModel.findOne({ customerId });
    // if (!pdDetail) {
    //   return badRequest(res, "pd Form not found");
    // }
    if (!status) {
      return badRequest(res, "Status must be 'rePd' ,'complete' or 'newAssignPd' ")
    }

    if (status === 'complete') {
      const pdReport = await generateCreditPdPdf(res, customerId);

      const pdReportLink = typeof pdReport === 'string' ? pdReport : pdReport?.pdReport;
      if (!pdReportLink) {
        return badRequest(res, "PDF generation failed, no valid report link found.");
      }

      try {
        const [externalResult, pdResult] = await Promise.all([
          externalManagerModel.findOneAndUpdate(
            { customerId },
            {
              pdfCreateByCreditPd: pdReportLink,
              remarkByHo: remarkByHo,
              hoEmployeeId: employeeId,
              hoStatus: status,
              statusByCreditPd: "approve",
              hoCompleteDate: todayDate,
            },
            { new: true }
          ),
          pdModel.findOneAndUpdate(
            { customerId },
            { pdfLink: pdReportLink }, // Use the string value
            { new: true }
          )
        ]);
      } catch (dbError) {
        console.error('Database Update Error:', dbError);
        return badRequest(res, `PDF generated but database update failed: ${dbError.message}`);
      }
      return success(res, "PD Report generated successfully", pdReportLink);
    } else if (status === 'rePd') {


      async function keepOnlySpecificFields(customerId) {
        try {
          // Step 1: Find the document and retrieve only the fields you want to keep
          const fieldsToKeep = await pdModel.findOne(
            { customerId },
            {
              applicantImage: 1,
              guarantorImage: 1,
              coApplicantImage: 1,
              applicant: 1,
              co_Applicant: 1,
              guarantor: 1,
              policeStation: 1,
              samagraIdDetail: 1,
              rasanCardDetail: 1,
              familyDetailType: 1,
              electricityBillPhoto: 1,
              department_info: 1,
              videoUpload: 1,
              customerBillId: 1,
              addressAsPerElectricityBill: 1,
              customerNameAsPerElectricityBill: 1,
              landmarkPhoto: 1,
              latLongPhoto: 1,
              fourBoundaryPhotos: 1,
              workPhotos: 1,
              houseInsidePhoto: 1,
              propertyOtherPhotos: 1,
              selfiWithCustomer: 1,
              photoWithLatLong: 1,
              front: 1,
              leftSide: 1,
              rightSide: 1,
              approachRoad: 1,
              mainRoad: 1,
              interiorRoad: 1,
              selfieWithProperty: 1,
              propertyPhoto: 1,
              gasDiaryPhoto: 1,
              meterPhoto: 1,
              electricityBillPhoto: 1,
              SSSMPhoto: 1,
              udyamCertificate: 1,
              familyMemberPhotos: 1,
              otherDocUpload: 1,
              _id: 1, // Always include the _id
              customerId: 1 // Keep the customerId for the query
            }
          );

          if (!fieldsToKeep) {
            return null; // Document not found
          }

          // Step 2: Replace the entire document with only the fields you want to keep
          const result = await pdModel.replaceOne(
            { customerId },
            fieldsToKeep
          );

          return result;
        } catch (error) {
          console.error("Error in keepOnlySpecificFields:", error);
          throw error;
        }
      }

      // Usage
      await keepOnlySpecificFields(customerId);

      await externalManagerModel.findOneAndUpdate(
        { customerId },
        {
          hoEmployeeId: employeeId,
          hoStatus: "notAssign",
          creditPdId: null,
          statusByCreditPd: "notAssign",
          remarkByHo: '',
          hoRePdDate: '',
          creditPdRejectPhoto :[],
          creditPdAssignDate: todayDate,
          creditPdCompleteDate:"",
        },
        { new: true }
      );
      return success(res, "PD BACK For RePd");
    } else if (status === 'newAssignPd') {

      await externalManagerModel.findOneAndUpdate(
        { customerId },
        {
          hoEmployeeId: employeeId,
          statusByCreditPd: 'notAssign',
          creditPdAssignDate: todayDate,
          creditPdId: null,
        },
        { new: true }
      );

      await pdModel.findOneAndUpdate({ customerId }, { pdFormDelete: true }, { new: true })
      return success(res, "PD Again Assign");
    } else if (status === 'correction') {

      const externalManagerData = await externalManagerModel.findOne({ customerId });
      if (!externalManagerData) {
        return badRequest(res, "External Manager data not found.");
      }
      if (externalManagerData.statusByCreditPd === 'WIP' && externalManagerData.hoStatus === 'correction') {
        return badRequest(res, "Correction Cannot Be Done More Than Once");
      }

      await externalManagerModel.findOneAndUpdate(
        { customerId },
        {
          hoEmployeeId: employeeId,
          statusByCreditPd: 'WIP',
          hoStatus: status,
          creditPdCompleteDate:"",
          creditPdAssignDate: todayDate,
        },
        { new: true }
      );

      await pdModel.findOneAndUpdate(
        { customerId },
        { $set: { correctionRemark: correctionRemark } },
        { new: true }
      );

      return success(res, "PD Sent For Correction");
    }
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

async function allFilesPdDashBoard(req, res) {
  try {
    const { branch, regionalbranch, employee, product, status, startDateFilter, endDateFilter, limit = 10000, page = 1, searchQuery } = req.query;
    const employeeId = req.Id;

    const employeeExist = await employeeModel.findOne({ _id: employeeId, status: "active" });
    if (!employeeExist) {
      return badRequest(res, "Employee Not Found");
    }

    let matchConditions = {
      fileStatus: "active"
    };

    if (searchQuery) {
      matchConditions.$or = [
        { "applicantDetails.mobileNo": { $regex: searchQuery, $options: "i" } },
        { "applicantDetails.customerFatherName": { $regex: searchQuery, $options: "i" } },
        { "applicantDetails.customerFullName": { $regex: searchQuery, $options: "i" } },
        { "customerDetailData.customerFinId": { $regex: searchQuery, $options: "i" } }
      ];
    }

    if (branch && branch !== "all") {
      const branchArray = Array.isArray(branch) ? branch : branch.split(",");
      matchConditions["branchDetails._id"] = { $in: branchArray.map(id => new ObjectId(id)) };
    }

    if (regionalbranch && regionalbranch !== "all") {
      const regionalbranchArray = Array.isArray(regionalbranch) ? regionalbranch : regionalbranch.split(",");
      matchConditions["regionalBranchDetails._id"] = { $in: regionalbranchArray.map(id => new ObjectId(id)) };
    }

    if (employee && employee !== "all") {
      const employeeArray = Array.isArray(employee) ? employee : employee.split(",");
      matchConditions["pdEmployeeDetail._id"] = { $in: employeeArray.map(id => new ObjectId(id)) };
    }

    // if (product && product !== "all") {
    //   const productArray = Array.isArray(product) ? product : product.split(",");
    //   matchConditions["customerDetailData.productId"] = { $in: productArray.map(id => new ObjectId(id)) };
    // }

    if (product == "all" || product == '' || !product) {
      const excludedProductIds = ["6734821148d4dbfbe0c69c7e"]; // Hardcoded for now, make it dynamic if needed
      if (excludedProductIds.length > 0) {
        matchConditions["customerDetailData.productId"] = { $nin: excludedProductIds.map(id => new ObjectId(id)) };
      }
    }

    if (status && status !== "all") {
      const statusArray = Array.isArray(status) ? status : status.split(",");
      matchConditions["statusByCreditPd"] = { $in: statusArray };
    }

    const today = new Date();
    const defaultStartDate = new Date(today.setHours(0, 0, 0, 0));
    const defaultEndDate = new Date(today.setHours(23, 59, 59, 999));

    function formatDateToISO(date) {
      return new Date(date).toISOString();
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

    if (startDateFilter && endDateFilter && startDateFilter !== "all" && endDateFilter !== "all") {
      matchConditions["$or"] = [
        {
          creditPdCompleteDate: {
            $gte: formattedStart,
            $lt: formattedEnd,
          },
        },
        {
          creditPdCompleteDate: { $in: ["", null] },
          "latestPdForm.bdCompleteDate": {
            $gte: formattedStart,
            $lt: formattedEnd,
          },
        },
      ];
    }

    const aggregationPipeline = [
      // Initial lookups
      {
        $lookup: {
          from: "customerdetails",
          localField: "customerId",
          foreignField: "_id",
          as: "customerDetailData"
        }
      },
      { $unwind: { path: "$customerDetailData", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "employees",
          localField: "customerDetailData.employeId",
          foreignField: "_id",
          as: "salesPerson"
        }
      },
      { $unwind: { path: "$salesPerson", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "newbranches",
          localField: "salesPerson.branchId",
          foreignField: "_id",
          as: "branchDetails"
        }
      },
      { $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "newbranches",
          localField: "branchDetails.regionalBranchId",
          foreignField: "_id",
          as: "regionalBranchDetails"
        }
      },
      { $unwind: { path: "$regionalBranchDetails", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "employees",
          localField: "salesPerson.reportingManagerId",
          foreignField: "_id",
          as: "reportingManager"
        }
      },
      { $unwind: { path: "$reportingManager", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "applicantdetails",
          localField: "customerId",
          foreignField: "customerId",
          as: "applicantDetails"
        }
      },
      { $unwind: { path: "$applicantDetails", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "employees",
          localField: "creditPdId",
          foreignField: "_id",
          as: "pdEmployeeDetail"
        }
      },
      { $unwind: { path: "$pdEmployeeDetail", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "cibildetails",
          localField: "customerId",
          foreignField: "customerId",
          as: "cibilDetailsData"
        }
      },
      { $unwind: { path: "$cibilDetailsData", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "pdformdatas",
          localField: "customerId",
          foreignField: "customerId",
          as: "latestPdForm"
        }
      },

      {
        $lookup: {
          from: "products",
          localField: "customerDetailData.productId",
          foreignField: "_id",
          as: "productDetailData"
        }
      },
      { $unwind: { path: "$productDetailData", preserveNullAndEmptyArrays: true } },

      // Sort pdformdatas to get the latest one
      {
        $addFields: {
          latestPdForm: {
            $arrayElemAt: [
              { $sortArray: { input: "$latestPdForm", sortBy: { _id: -1 } } },
              0
            ]
          }
        }
      },

      // Helper function to clean date strings that might have AM/PM
      {
        $addFields: {
          cleanedCreditPdCompleteDate: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$creditPdCompleteDate", ""] },
                  { $ne: ["$creditPdCompleteDate", null] },
                  { $eq: [{ $type: "$creditPdCompleteDate" }, "string"] }
                ]
              },
              then: {
                $cond: {
                  if: { $regexMatch: { input: "$creditPdCompleteDate", regex: " AM| PM" } },
                  then: {
                    $cond: {
                      if: { $regexMatch: { input: "$creditPdCompleteDate", regex: " AM" } },
                      then: { $substr: ["$creditPdCompleteDate", 0, { $subtract: [{ $strLenCP: "$creditPdCompleteDate" }, 3] }] },
                      else: { $substr: ["$creditPdCompleteDate", 0, { $subtract: [{ $strLenCP: "$creditPdCompleteDate" }, 3] }] }
                    }
                  },
                  else: "$creditPdCompleteDate"
                }
              },
              else: "$creditPdCompleteDate"
            }
          },
          cleanedBdCompleteDate: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$latestPdForm.bdCompleteDate", ""] },
                  { $ne: ["$latestPdForm.bdCompleteDate", null] },
                  { $eq: [{ $type: "$latestPdForm.bdCompleteDate" }, "string"] }
                ]
              },
              then: {
                $cond: {
                  if: { $regexMatch: { input: "$latestPdForm.bdCompleteDate", regex: " AM| PM" } },
                  then: {
                    $cond: {
                      if: { $regexMatch: { input: "$latestPdForm.bdCompleteDate", regex: " AM" } },
                      then: { $substr: ["$latestPdForm.bdCompleteDate", 0, { $subtract: [{ $strLenCP: "$latestPdForm.bdCompleteDate" }, 3] }] },
                      else: { $substr: ["$latestPdForm.bdCompleteDate", 0, { $subtract: [{ $strLenCP: "$latestPdForm.bdCompleteDate" }, 3] }] }
                    }
                  },
                  else: "$latestPdForm.bdCompleteDate"
                }
              },
              else: "$latestPdForm.bdCompleteDate"
            }
          }
        }
      },

      // Add computed fields
      {
        $addFields: {
          customerFinId: { $ifNull: ["$customerDetailData.customerFinId", ""] },
          customerId: { $ifNull: ["$customerDetailData._id", ""] },
          loginStartDate: { $ifNull: ["$customerDetailData.createdAt", ""] },
          productId: { $ifNull: ["$productDetailData._id", ""] },
          productName: { $ifNull: ["$productDetailData.productName", ""] },
          customerFullName: { $ifNull: ["$applicantDetails.fullName", ""] },
          customerFatherName: { $ifNull: ["$applicantDetails.fatherName", ""] },

          // Handle loginDate converting to Date safely
          // loginDate: { 
          //   $cond: {
          //     if: { 
          //       $and: [
          //         { $ne: ["$customerDetailData.createdAt", ""] },
          //         { $ne: ["$customerDetailData.createdAt", null] }
          //       ]
          //     },
          //     then: {
          //       $cond: {
          //         if: { $eq: [{ $type: "$customerDetailData.createdAt" }, "date"] },
          //         then: "$customerDetailData.createdAt",
          //         else: { $toDate: "$customerDetailData.createdAt" }
          //       }
          //     },
          //     else: null
          //   }
          // },

          loginDate: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$createdAt", ""] },
                  { $ne: ["$createdAt", null] }
                ]
              },
              then: {
                $cond: {
                  if: { $eq: [{ $type: "$createdAt" }, "date"] },
                  then: "$createdAt",
                  else: { $toDate: "$createdAt" }
                }
              },
              else: null
            }
          },
          branchName: { $ifNull: ["$branchDetails.name", ""] },
          regionalBranchName: { $ifNull: ["$regionalBranchDetails.name", ""] },
          branch_id: { $ifNull: ["$branchDetails._id", ""] },
          mobileNo: { $ifNull: ["$applicantDetails.mobileNo", ""] },
          salesPersonName: { $ifNull: ["$salesPerson.employeName", ""] },
          salesPersonManagerName: { $ifNull: ["$reportingManager.employeName", ""] },
          pdPersonName: { $ifNull: ["$pdEmployeeDetail.employeName", ""] },
          pdPerson_id: { $ifNull: ["$pdEmployeeDetail._id", ""] },
          pdRejectRemark: { $ifNull: ["$latestPdForm.remarkByPd", ""] },
          cibilRemarkForPd: { $ifNull: ["$cibilDetailsData.cibilRemarkForPd", ""] },
          pdfLink: { $ifNull: ["$latestPdForm.pdfLink", ""] },
          pdRejectPhoto: { $ifNull: ["$creditPdRejectPhoto", ""] },
          reasonForReject: { $ifNull: ["$latestPdForm.reasonForReject", ""] },
          pdReplyToCibilRemarks: { $ifNull: ["$latestPdForm.pdReplyToCibilRemarks", ""] },

          // Use cleaned date fields
          creditPdCompleteDateRaw: {
            $cond: {
              if: { $or: [{ $eq: ["$cleanedCreditPdCompleteDate", ""] }, { $eq: ["$cleanedCreditPdCompleteDate", null] }] },
              then: "$cleanedBdCompleteDate",
              else: "$cleanedCreditPdCompleteDate"
            }
          },

          statusByCreditPd: {
            $cond: {
              if: { $in: ["$statusByCreditPd", ["reject", "rejectByApprover"]] },
              then: "reject",
              else: {
                $cond: {
                  if: { $in: ["$statusByCreditPd", ["approve", "complete"]] },
                  then: "approve",
                  else: {
                    $cond: {
                      if: { $in: ["$statusByCreditPd", ["accept", "incomplete", "WIP"]] },
                      then: "WIP",
                      else: {
                        $cond: {
                          if: { $in: ["$statusByCreditPd", ["notAssign"]] },
                          then: "notAssign",
                          else: ""
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },

      // Convert creditPdCompleteDate to a proper Date object for all cases
      {
        $addFields: {
          formattedPdDate: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$creditPdCompleteDateRaw", ""] },
                  { $ne: ["$creditPdCompleteDateRaw", null] }
                ]
              },
              then: {
                $cond: {
                  if: { $eq: [{ $type: "$creditPdCompleteDateRaw" }, "date"] },
                  then: "$creditPdCompleteDateRaw",
                  else: {
                    $cond: {
                      if: { $eq: [{ $type: "$creditPdCompleteDateRaw" }, "string"] },
                      then: { $toDate: "$creditPdCompleteDateRaw" },
                      else: null
                    }
                  }
                }
              },
              else: null
            }
          },
          // Store original value for display
          creditPdCompleteDate: "$creditPdCompleteDateRaw"
        }
      },

      // Now calculate days difference with proper Date objects and a fail-safe approach
      {
        $addFields: {
          daysDifference: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$formattedPdDate", null] },
                  { $ne: ["$loginDate", null] },
                  { $eq: [{ $type: "$formattedPdDate" }, "date"] },
                  { $eq: [{ $type: "$loginDate" }, "date"] }
                ]
              },
              then: {
                $round: [
                  {
                    $divide: [
                      { $subtract: ["$formattedPdDate", "$loginDate"] },
                      1000 * 60 * 60 * 24
                    ]
                  }
                ]
              },
              else: null
            }
          }
        }
      },

      // Apply match conditions
      { $match: matchConditions },

      // Group by customerId to ensure uniqueness
      {
        $group: {
          _id: "$customerId",
          customerFinId: { $first: "$customerFinId" },
          customerId: { $first: "$customerId" },
          loginDate: { $first: "$loginStartDate" },
          branchName: { $first: "$branchName" },
          branch_id: { $first: "$branch_id" },
          productId: { $first: "$productId" },
          productName: { $first: "$productName" },
          regionalBranchName: { $first: "$regionalBranchName" },
          salesPersonName: { $first: "$salesPersonName" },
          customerFullName: { $first: "$customerFullName" },
          customerFatherName: { $first: "$customerFatherName" },
          mobileNo: { $first: "$mobileNo" },
          salesPersonManagerName: { $first: "$salesPersonManagerName" },
          pdPersonName: { $first: "$pdPersonName" },
          pdPerson_id: { $first: "$pdPerson_id" },
          pdRejectRemark: { $first: "$latestPdForm.remarkByPd" },
          creditPdCompleteDate: { $first: "$creditPdCompleteDate" },
          statusByCreditPd: { $first: "$statusByCreditPd" },
          creditPdId: { $first: "$creditPdId" },
          daysDifference: { $first: "$daysDifference" },
          cibilRemarkForPd: { $first: "$cibilRemarkForPd" },
          pdfLink: { $first: "$pdfLink" },
          pdRejectPhoto: { $first: "$pdRejectPhoto" },
          reasonForReject: { $first: "$reasonForReject" },
          pdReplyToCibilRemarks: { $first: "$pdReplyToCibilRemarks" },
          cibilDate : { $first: "$createdAt" },
        }
      },

      // Facet for counts and pagination
      {
        $facet: {
          totalCases: [{ $count: "total" }],
          pendingCases: [{ $match: { creditPdId: null, statusByCreditPd: { $in: ["notAssign", null, ""] } } }, { $count: "pending" }],
          wipCases: [{
            $match: {
              creditPdId: { $ne: null },
              statusByCreditPd: { $in: ["accept", "incomplete", "WIP"] }
            }
          }, { $count: "wip" }],
          approvedCases: [{
            $match: {
              creditPdId: { $ne: null },
              statusByCreditPd: { $in: ["approve", "complete"] }
            }
          }, { $count: "approved" }],
          rejectedCases: [{
            $match: {
              creditPdId: { $ne: null },
              statusByCreditPd: { $in: ["reject", "rejectByApprover"] }
            }
          }, { $count: "rejected" }],
          fileDetails: [
            { $skip: (page - 1) * limit },
            { $limit: parseInt(limit) },
            {
              $project: {
                _id: 0,
                customerFinId: 1,
                customerId: 1,
                loginDate:  { $dateToString: {
                  format: "%Y-%m-%d",
                  date: { $toDate: "$loginDate" }
                }
              },
                branchName: 1,
                branch_id: 1,
                productName: 1,
                productId: 1,
                regionalBranchName: 1,
                salesPersonName: 1,
                customerFullName: 1,
                customerFatherName: 1,
                mobileNo: 1,
                salesPersonManagerName: 1,
                pdPersonName: 1,
                pdPerson_id: 1,
                pdRejectRemark: 1,
                creditPdCompleteDate:  {   $dateToString: {
                  format: "%Y-%m-%d",
                  date: { $toDate: "$creditPdCompleteDate" }
                }
              },
                statusByCreditPd: 1,
                cibilRemarkForPd: 1,
                daysDifference: 1,
                pdfLink: 1,
                reasonForReject: 1,
                pdRejectPhoto: 1,
                pdReplyToCibilRemarks: 1,
                cibilDate: { $dateToString: { format: "%Y-%m-%d", date: "$cibilDate" } },
              }
            }
          ]
        }
      }
    ];

    const result = await externalManagerModel.aggregate(aggregationPipeline);

    const response = {
      totalCases: result[0]?.totalCases[0]?.total || 0,
      pendingCases: result[0]?.pendingCases[0]?.pending || 0,
      wipCases: result[0]?.wipCases[0]?.wip || 0,
      approvedCases: result[0]?.approvedCases[0]?.approved || 0,
      rejectedCases: result[0]?.rejectedCases[0]?.rejected || 0,
      fileDetails: result[0]?.fileDetails || [],
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(result[0]?.totalCases[0]?.total / limit),
        totalItems: result[0]?.totalCases[0]?.total || 0,
      },
    };

    return success(res, "PD Files Dashboard", response);

  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

//pdFilesDashBoardMonthlyCount

// async function pdFilesDashBoardMonthlyCount(req, res) {
//   try {
//     const { branch, regionalbranch, employee, product, status, 
//       startDateFilter, endDateFilter, 
//       month, year, // New parameters for month/year filtering
//       limit = 10000, page = 1, searchQuery } = req.query;

//     const employeeId = req.Id;

//     const employeeExist = await employeeModel.findOne({ _id: employeeId, status: "active" });
//     if (!employeeExist) {
//       return badRequest(res, "Employee Not Found");
//     }

//     // Determine date range for filtering and month-wise aggregation
//     const determineFilterDates = () => {
//       const currentDate = new Date();
//       const currentYear = currentDate.getFullYear();

//       let filterStart, filterEnd;

//       // If month and year are provided, use them for specific month filtering
//       if (month && year) {
//         // Month is 1-12 based, but JavaScript Date uses 0-11
//         const monthIndex = parseInt(month) - 1;
//         const yearValue = parseInt(year);

//         // Set to first day of the specified month/year
//         filterStart = new Date(yearValue, monthIndex, 1, 0, 0, 0, 0);

//         // Set to last day of the specified month/year
//         // Get the first day of next month and subtract 1 millisecond
//         const nextMonth = monthIndex === 11 ? 0 : monthIndex + 1;
//         const nextYear = monthIndex === 11 ? yearValue + 1 : yearValue;
//         filterEnd = new Date(nextYear, nextMonth, 1, 0, 0, 0, 0);
//         filterEnd.setMilliseconds(-1);
//       }
//       // Otherwise use the date range filters if provided
//       else if (startDateFilter && startDateFilter !== "all") {
//         filterStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));

//         if (endDateFilter && endDateFilter !== "all") {
//           filterEnd = new Date(new Date(endDateFilter).setHours(23, 59, 59, 999));
//         } else {
//           // Default to end of current year if only start date is provided
//           filterEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999);
//         }
//       } 
//       else {
//         // Default to current year if no filters provided
//         filterStart = new Date(currentYear, 0, 1, 0, 0, 0, 0);
//         filterEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999);
//       }

//       return { filterStart, filterEnd };
//     };

//     const { filterStart, filterEnd } = determineFilterDates();

//     // Determine if we're looking at a single year or multiple years
//     const isSingleYearRange = filterStart.getFullYear() === filterEnd.getFullYear();

//     let matchConditions = { 
//       fileStatus: "active"
//     };

//     if (searchQuery) {
//       matchConditions.$or = [
//         { "applicantDetails.mobileNo": { $regex: searchQuery, $options: "i" } },
//         { "applicantDetails.customerFatherName": { $regex: searchQuery, $options: "i" } },
//         { "applicantDetails.customerFullName": { $regex: searchQuery, $options: "i" } },
//         { "customerDetailData.customerFinId": { $regex: searchQuery, $options: "i" } }
//       ];
//     }

//     if (branch && branch !== "all") {
//       const branchArray = Array.isArray(branch) ? branch : branch.split(",");
//       matchConditions["branchDetails._id"] = { $in: branchArray.map(id => new ObjectId(id)) };
//     }

//     if (regionalbranch && regionalbranch !== "all") {
//       const regionalbranchArray = Array.isArray(regionalbranch) ? regionalbranch : regionalbranch.split(",");
//       matchConditions["regionalBranchDetails._id"] = { $in: regionalbranchArray.map(id => new ObjectId(id)) };
//     }

//     if (employee && employee !== "all") {
//       const employeeArray = Array.isArray(employee) ? employee : employee.split(",");
//       matchConditions["pdEmployeeDetail._id"] = { $in: employeeArray.map(id => new ObjectId(id)) };
//     }

//     if (product == "all" || product == '' || !product) {
//       const excludedProductIds = ["6734821148d4dbfbe0c69c7e"]; // Hardcoded for now, make it dynamic if needed
//       if (excludedProductIds.length > 0) {
//         matchConditions["customerDetailData.productId"] = { $nin: excludedProductIds.map(id => new ObjectId(id)) };
//       }
//     }

//     if (status && status !== "all") {
//       const statusArray = Array.isArray(status) ? status : status.split(",");
//       matchConditions["statusByCreditPd"] = { $in: statusArray };
//     }

//     // Convert filterStart and filterEnd to ISO strings for date comparison
//     const formattedStart = formatDateToISO(filterStart);
//     const formattedEnd = formatDateToISO(filterEnd);

//     function formatDateToISO(date) {
//       return new Date(date).toISOString();
//     }

//     // Add date filtering conditions (either by month/year or full date range)
//     // We'll handle this in the aggregation pipeline to ensure compatibility with both date fields

//     const aggregationPipeline = [
//       // Initial lookups and data processing - unchanged from previous version
//       {
//         $lookup: {
//           from: "customerdetails",
//           localField: "customerId",
//           foreignField: "_id",
//           as: "customerDetailData"
//         }
//       },
//       { $unwind: { path: "$customerDetailData", preserveNullAndEmptyArrays: true } },

//       {
//         $lookup: {
//           from: "employees",
//           localField: "customerDetailData.employeId",
//           foreignField: "_id",
//           as: "salesPerson"
//         }
//       },
//       { $unwind: { path: "$salesPerson", preserveNullAndEmptyArrays: true } },

//       {
//         $lookup: {
//           from: "newbranches",
//           localField: "salesPerson.branchId",
//           foreignField: "_id",
//           as: "branchDetails"
//         }
//       },
//       { $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true } },

//       {
//         $lookup: {
//           from: "newbranches",
//           localField: "branchDetails.regionalBranchId",
//           foreignField: "_id",
//           as: "regionalBranchDetails"
//         }
//       },
//       { $unwind: { path: "$regionalBranchDetails", preserveNullAndEmptyArrays: true } },

//       {
//         $lookup: {
//           from: "employees",
//           localField: "salesPerson.reportingManagerId",
//           foreignField: "_id",
//           as: "reportingManager"
//         }
//       },
//       { $unwind: { path: "$reportingManager", preserveNullAndEmptyArrays: true } },

//       {
//         $lookup: {
//           from: "applicantdetails",
//           localField: "customerId",
//           foreignField: "customerId",
//           as: "applicantDetails"
//         }
//       },
//       { $unwind: { path: "$applicantDetails", preserveNullAndEmptyArrays: true } },

//       {
//         $lookup: {
//           from: "employees",
//           localField: "creditPdId",
//           foreignField: "_id",
//           as: "pdEmployeeDetail"
//         }
//       },
//       { $unwind: { path: "$pdEmployeeDetail", preserveNullAndEmptyArrays: true } },

//       {
//         $lookup: {
//           from: "cibildetails",
//           localField: "customerId",
//           foreignField: "customerId",
//           as: "cibilDetailsData"
//         }
//       },
//       { $unwind: { path: "$cibilDetailsData", preserveNullAndEmptyArrays: true } },

//       {
//         $lookup: {
//           from: "pdformdatas",
//           localField: "customerId",
//           foreignField: "customerId",
//           as: "latestPdForm"
//         }
//       },

//       {
//         $lookup: {
//           from: "products",
//           localField: "customerDetailData.productId",
//           foreignField: "_id",
//           as: "productDetailData"
//         }
//       },
//       { $unwind: { path: "$productDetailData", preserveNullAndEmptyArrays: true } },

//       // Sort pdformdatas to get the latest one
//       {
//         $addFields: {
//           latestPdForm: {
//             $arrayElemAt: [
//               { $sortArray: { input: "$latestPdForm", sortBy: { _id: -1 } } },
//               0
//             ]
//           }
//         }
//       },

//       // Helper function to clean date strings that might have AM/PM
//       {
//         $addFields: {
//           cleanedCreditPdCompleteDate: {
//             $cond: {
//               if: { 
//                 $and: [
//                   { $ne: ["$creditPdCompleteDate", ""] },
//                   { $ne: ["$creditPdCompleteDate", null] },
//                   { $eq: [{ $type: "$creditPdCompleteDate" }, "string"] }
//                 ]
//               },
//               then: {
//                 $cond: {
//                   if: { $regexMatch: { input: "$creditPdCompleteDate", regex: " AM| PM" } },
//                   then: {
//                     $cond: {
//                       if: { $regexMatch: { input: "$creditPdCompleteDate", regex: " AM" } },
//                       then: { $substr: ["$creditPdCompleteDate", 0, { $subtract: [{ $strLenCP: "$creditPdCompleteDate" }, 3] }] },
//                       else: { $substr: ["$creditPdCompleteDate", 0, { $subtract: [{ $strLenCP: "$creditPdCompleteDate" }, 3] }] }
//                     }
//                   },
//                   else: "$creditPdCompleteDate"
//                 }
//               },
//               else: "$creditPdCompleteDate"
//             }
//           },
//           cleanedBdCompleteDate: {
//             $cond: {
//               if: { 
//                 $and: [
//                   { $ne: ["$latestPdForm.bdCompleteDate", ""] },
//                   { $ne: ["$latestPdForm.bdCompleteDate", null] },
//                   { $eq: [{ $type: "$latestPdForm.bdCompleteDate" }, "string"] }
//                 ]
//               },
//               then: {
//                 $cond: {
//                   if: { $regexMatch: { input: "$latestPdForm.bdCompleteDate", regex: " AM| PM" } },
//                   then: {
//                     $cond: {
//                       if: { $regexMatch: { input: "$latestPdForm.bdCompleteDate", regex: " AM" } },
//                       then: { $substr: ["$latestPdForm.bdCompleteDate", 0, { $subtract: [{ $strLenCP: "$latestPdForm.bdCompleteDate" }, 3] }] },
//                       else: { $substr: ["$latestPdForm.bdCompleteDate", 0, { $subtract: [{ $strLenCP: "$latestPdForm.bdCompleteDate" }, 3] }] }
//                     }
//                   },
//                   else: "$latestPdForm.bdCompleteDate"
//                 }
//               },
//               else: "$latestPdForm.bdCompleteDate"
//             }
//           }
//         }
//       },

//       // Add computed fields
//       {
//         $addFields: {
//           customerFinId: { $ifNull: ["$customerDetailData.customerFinId", ""] },
//           customerId: { $ifNull: ["$customerDetailData._id", ""] },
//           productId: { $ifNull: ["$productDetailData._id", ""] },
//           productName: { $ifNull: ["$productDetailData.productName", ""] },
//           customerFullName: { $ifNull: ["$applicantDetails.fullName", ""] },
//           customerFatherName: { $ifNull: ["$applicantDetails.fatherName", ""] },

//           // Handle loginDate converting to Date safely
//           loginDate: { 
//             $cond: {
//               if: { 
//                 $and: [
//                   { $ne: ["$customerDetailData.createdAt", ""] },
//                   { $ne: ["$customerDetailData.createdAt", null] }
//                 ]
//               },
//               then: {
//                 $cond: {
//                   if: { $eq: [{ $type: "$customerDetailData.createdAt" }, "date"] },
//                   then: "$customerDetailData.createdAt",
//                   else: { $toDate: "$customerDetailData.createdAt" }
//                 }
//               },
//               else: null
//             }
//           },

//           branchName: { $ifNull: ["$branchDetails.name", ""] },
//           regionalBranchName: { $ifNull: ["$regionalBranchDetails.name", ""] },
//           branch_id: { $ifNull: ["$branchDetails._id", ""] },
//           mobileNo: { $ifNull: ["$applicantDetails.mobileNo", ""] },
//           salesPersonName: { $ifNull: ["$salesPerson.employeName", ""] },
//           salesPersonManagerName: { $ifNull: ["$reportingManager.employeName", ""] },
//           pdPersonName: { $ifNull: ["$pdEmployeeDetail.employeName", ""] },
//           pdPerson_id: { $ifNull: ["$pdEmployeeDetail._id", ""] },
//           pdRejectRemark: { $ifNull: ["$latestPdForm.remarkByPd", ""] },
//           cibilRemarkForPd: { $ifNull: ["$cibilDetailsData.cibilRemarkForPd", ""] },
//           pdfLink: { $ifNull: ["$latestPdForm.pdfLink", ""] },
//           pdRejectPhoto: { $ifNull: ["$creditPdRejectPhoto", ""] },
//           reasonForReject: { $ifNull: ["$latestPdForm.reasonForReject", ""] },
//           pdReplyToCibilRemarks: { $ifNull: ["$latestPdForm.pdReplyToCibilRemarks", ""] },

//           // Use cleaned date fields with priority to bdCompleteDate
//           creditPdCompleteDateRaw: {
//             $cond: {
//               if: { $or: [{ $eq: ["$cleanedCreditPdCompleteDate", ""] }, { $eq: ["$cleanedCreditPdCompleteDate", null] }] },
//               then: "$cleanedBdCompleteDate",
//               else: "$cleanedCreditPdCompleteDate"
//             }
//           },

//           // Store bdCompleteDate explicitly for month-wise queries
//           bdCompleteDateRaw: "$cleanedBdCompleteDate",

//           statusByCreditPd: {
//             $cond: {
//               if: { $in: ["$statusByCreditPd", ["reject", "rejectByApprover"]] },
//               then: "reject",
//               else: {
//                 $cond: {
//                   if: { $in: ["$statusByCreditPd", ["approve", "complete"]] },
//                   then: "approve",
//                   else: {
//                     $cond: {
//                       if: { $in: ["$statusByCreditPd", ["accept", "incomplete", "WIP"]] },
//                       then: "WIP",
//                       else: {
//                         $cond: {
//                           if: { $in: ["$statusByCreditPd", ["notAssign"]] },
//                           then: "notAssign",
//                           else: ""
//                         }
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },

//       // Convert creditPdCompleteDate to a proper Date object for all cases
//       {
//         $addFields: {
//           formattedPdDate: {
//             $cond: {
//               if: {
//                 $and: [
//                   { $ne: ["$creditPdCompleteDateRaw", ""] },
//                   { $ne: ["$creditPdCompleteDateRaw", null] }
//                 ]
//               },
//               then: {
//                 $cond: {
//                   if: { $eq: [{ $type: "$creditPdCompleteDateRaw" }, "date"] },
//                   then: "$creditPdCompleteDateRaw",
//                   else: {
//                     $cond: {
//                       if: { $eq: [{ $type: "$creditPdCompleteDateRaw" }, "string"] },
//                       then: { $toDate: "$creditPdCompleteDateRaw" },
//                       else: null
//                     }
//                   }
//                 }
//               },
//               else: null
//             }
//           },
//           // Convert bdCompleteDate to a proper Date object for month-wise aggregation
//           formattedBdDate: {
//             $cond: {
//               if: {
//                 $and: [
//                   { $ne: ["$bdCompleteDateRaw", ""] },
//                   { $ne: ["$bdCompleteDateRaw", null] }
//                 ]
//               },
//               then: {
//                 $cond: {
//                   if: { $eq: [{ $type: "$bdCompleteDateRaw" }, "date"] },
//                   then: "$bdCompleteDateRaw",
//                   else: {
//                     $cond: {
//                       if: { $eq: [{ $type: "$bdCompleteDateRaw" }, "string"] },
//                       then: { $toDate: "$bdCompleteDateRaw" },
//                       else: null
//                     }
//                   }
//                 }
//               },
//               else: null
//             }
//           },
//           // Store original value for display
//           creditPdCompleteDate: "$creditPdCompleteDateRaw",
//           bdCompleteDate: "$bdCompleteDateRaw"
//         }
//       },

//       // Now calculate days difference with proper Date objects and a fail-safe approach
//       {
//         $addFields: {
//           daysDifference: {
//             $cond: {
//               if: { 
//                 $and: [
//                   { $ne: ["$formattedPdDate", null] },
//                   { $ne: ["$loginDate", null] },
//                   { $eq: [{ $type: "$formattedPdDate" }, "date"] },
//                   { $eq: [{ $type: "$loginDate" }, "date"] }
//                 ]
//               },
//               then: {
//                 $round: [
//                   {
//                     $divide: [
//                       { $subtract: ["$formattedPdDate", "$loginDate"] },
//                       1000 * 60 * 60 * 24
//                     ]
//                   }
//                 ]
//               },
//               else: null
//             }
//           }
//         }
//       },

//       // Apply standard match conditions
//       { $match: matchConditions },

//       // Apply date filtering here - this is more effective than in matchConditions
//       // because we've already processed all the date fields
//       {
//         $match: {
//           $or: [
//             // Match records with formattedPdDate in the specified range
//             {
//               formattedPdDate: {
//                 $gte: filterStart,
//                 $lte: filterEnd
//               }
//             },
//             // Match records with formattedBdDate in the specified range
//             {
//               formattedBdDate: {
//                 $gte: filterStart,
//                 $lte: filterEnd
//               }
//             }
//           ]
//         }
//       },

//       // Group by customerId to ensure uniqueness
//       {
//         $group: {
//           _id: "$customerId",
//           customerFinId: { $first: "$customerFinId" },
//           customerId: { $first: "$customerId" },
//           loginDate: { $first: "$loginDate" },
//           branchName: { $first: "$branchName" },
//           branch_id: { $first: "$branch_id" },
//           productId: { $first: "$productId" },
//           productName: { $first: "$productName" },
//           regionalBranchName:{ $first: "$regionalBranchName" },
//           salesPersonName: { $first: "$salesPersonName" },
//           customerFullName: { $first: "$customerFullName" },
//           customerFatherName: { $first: "$customerFatherName" },
//           mobileNo: { $first: "$mobileNo" },
//           salesPersonManagerName: { $first: "$salesPersonManagerName" },
//           pdPersonName: { $first: "$pdPersonName" },
//           pdPerson_id: { $first: "$pdPerson_id" },
//           pdRejectRemark: { $first:"$latestPdForm.remarkByPd"},
//           creditPdCompleteDate: { $first: "$creditPdCompleteDate" },
//           bdCompleteDate: { $first: "$bdCompleteDate" },
//           formattedPdDate: { $first: "$formattedPdDate" },
//           formattedBdDate: { $first: "$formattedBdDate" },
//           statusByCreditPd: { $first: "$statusByCreditPd" },
//           creditPdId: { $first: "$creditPdId" },
//           daysDifference: { $first: "$daysDifference" },
//           cibilRemarkForPd: { $first: "$cibilRemarkForPd" },
//           pdfLink: { $first: "$pdfLink" },
//           pdRejectPhoto: { $first: "$pdRejectPhoto" },
//           reasonForReject: { $first: "$reasonForReject" },
//           pdReplyToCibilRemarks: { $first: "$pdReplyToCibilRemarks" },
//         }
//       },

//       // Facet for counts and pagination
//       {
//         $facet: {
//           totalCases: [{ $count: "total" }],
//           pendingCases: [{ $match: { creditPdId: null, statusByCreditPd: { $in: ["notAssign", null, ""] } } }, { $count: "pending" }],
//           wipCases: [{
//             $match: {
//               creditPdId: { $ne: null },
//               statusByCreditPd: { $in: ["accept", "incomplete", "WIP"] }
//             }
//           }, { $count: "wip" }],
//           approvedCases: [{
//             $match: {
//               creditPdId: { $ne: null },
//               statusByCreditPd: { $in: ["approve", "complete"] }
//             }
//           }, { $count: "approved" }],
//           rejectedCases: [{
//             $match: {
//               creditPdId: { $ne: null },
//               statusByCreditPd: { $in: ["reject", "rejectByApprover"] }
//             }
//           }, { $count: "rejected" }],
//           // Month-wise aggregation - this will only include data for the month/year range specified
//           monthlyData: [
//             {
//               $group: {
//                 _id: { 
//                   year: { 
//                     $cond: [
//                       { $ne: ["$formattedPdDate", null] },
//                       { $year: "$formattedPdDate" },
//                       { $year: "$formattedBdDate" }
//                     ]
//                   },
//                   month: { 
//                     $cond: [
//                       { $ne: ["$formattedPdDate", null] },
//                       { $month: "$formattedPdDate" },
//                       { $month: "$formattedBdDate" }
//                     ]
//                   }
//                 },
//                 count: { $sum: 1 },
//                 approved: {
//                   $sum: {
//                     $cond: [
//                       { $in: ["$statusByCreditPd", ["approve", "complete"]] },
//                       1,
//                       0
//                     ]
//                   }
//                 },
//                 rejected: {
//                   $sum: {
//                     $cond: [
//                       { $in: ["$statusByCreditPd", ["reject", "rejectByApprover"]] },
//                       1,
//                       0
//                     ]
//                   }
//                 },
//                 wip: {
//                   $sum: {
//                     $cond: [
//                       { $in: ["$statusByCreditPd", ["accept", "incomplete", "WIP"]] },
//                       1,
//                       0
//                     ]
//                   }
//                 },
//                 notAssigned: {
//                   $sum: {
//                     $cond: [
//                       { $in: ["$statusByCreditPd", ["notAssign", "", null]] },
//                       1,
//                       0
//                     ]
//                   }
//                 }
//               }
//             },
//             {
//               $project: {
//                 _id: 0,
//                 year: "$_id.year",
//                 month: "$_id.month",
//                 monthName: {
//                   $switch: {
//                     branches: [
//                       { case: { $eq: ["$_id.month", 1] }, then: "January" },
//                       { case: { $eq: ["$_id.month", 2] }, then: "February" },
//                       { case: { $eq: ["$_id.month", 3] }, then: "March" },
//                       { case: { $eq: ["$_id.month", 4] }, then: "April" },
//                       { case: { $eq: ["$_id.month", 5] }, then: "May" },
//                       { case: { $eq: ["$_id.month", 6] }, then: "June" },
//                       { case: { $eq: ["$_id.month", 7] }, then: "July" },
//                       { case: { $eq: ["$_id.month", 8] }, then: "August" },
//                       { case: { $eq: ["$_id.month", 9] }, then: "September" },
//                       { case: { $eq: ["$_id.month", 10] }, then: "October" },
//                       { case: { $eq: ["$_id.month", 11] }, then: "November" },
//                       { case: { $eq: ["$_id.month", 12] }, then: "December" }
//                     ],
//                     default: "Unknown"
//                   }
//                 },
//                 yearMonth: { 
//                   $concat: [
//                     { $toString: "$_id.year" }, 
//                     "-", 
//                     {
//                       $cond: [
//                         { $lt: ["$_id.month", 10] },
//                         { $concat: ["0", { $toString: "$_id.month" }] },
//                         { $toString: "$_id.month" }
//                       ]
//                     }
//                   ] 
//                 },
//                 totalCount: "$count",
//                 approved: "$approved",
//                 rejected: "$rejected",
//                 wip: "$wip",
//                 notAssigned: "$notAssigned"
//               }
//             },
//             // Sort by year and then by month
//             { $sort: { year: 1, month: 1 } }
//           ],
//           fileDetails: [
//             { $skip: (page - 1) * limit },
//             { $limit: parseInt(limit) },
//             {
//               $project: {
//                 _id: 0,
//                 customerFinId: 1,
//                 customerId: 1,
//                 loginDate: 1,
//                 branchName: 1,
//                 branch_id: 1,
//                 productName:1,
//                 productId:1,
//                 regionalBranchName:1,
//                 salesPersonName: 1,
//                 customerFullName: 1,
//                 customerFatherName: 1,
//                 mobileNo: 1,
//                 salesPersonManagerName: 1,
//                 pdPersonName: 1,
//                 pdPerson_id: 1,
//                 pdRejectRemark:1,
//                 creditPdCompleteDate: 1,
//                 bdCompleteDate: 1,
//                 statusByCreditPd: 1,
//                 cibilRemarkForPd:1,
//                 daysDifference: 1,
//                 pdfLink:1,
//                 reasonForReject:1,
//                 pdRejectPhoto:1,
//                 pdReplyToCibilRemarks:1,
//               }
//             }
//           ]
//         }
//       }
//     ];

//     const result = await externalManagerModel.aggregate(aggregationPipeline);

//     // Get the raw monthly data from the aggregation
//     const actualMonthlyData = result[0]?.monthlyData || [];

//     // Function to create empty month data for a full year
//     function getFullYearMonths(year) {
//       const months = [];
//       const monthNames = [
//         "January", "February", "March", "April", "May", "June", 
//         "July", "August", "September", "October", "November", "December"
//       ];

//       for (let month = 1; month <= 12; month++) {
//         const monthName = monthNames[month - 1];
//         const yearMonth = `${year}-${month < 10 ? '0' + month : month}`;

//         months.push({
//           year: year,
//           month: month,
//           monthName: monthName,
//           yearMonth: yearMonth,
//           totalCount: 0,
//           approved: 0,
//           rejected: 0,
//           wip: 0,
//           notAssigned: 0
//         });
//       }

//       return months;
//     }

//     // Function to fill in actual data into empty month templates
//     function mergeMonthlyData(emptyMonths, actualData) {
//       actualData.forEach(monthData => {
//         const matchingMonth = emptyMonths.find(m => 
//           m.year === monthData.year && m.month === monthData.month
//         );

//         if (matchingMonth) {
//           // Copy all properties from actual data
//           Object.assign(matchingMonth, monthData);
//         }
//       });

//       return emptyMonths;
//     }

//     // Decide which monthly data to use based on date range
//     let finalMonthlyData;

//     if (month && year) {
//       // For specific month/year query, just return the actual data
//       finalMonthlyData = actualMonthlyData;
//     }
//     else if (isSingleYearRange) {
//       // For single year, show all months (Jan-Dec) with actual data filled in
//       const emptyMonths = getFullYearMonths(filterStart.getFullYear());
//       finalMonthlyData = mergeMonthlyData(emptyMonths, actualMonthlyData);
//     }
//     else {
//       // For multi-year ranges, only show months with actual data
//       finalMonthlyData = actualMonthlyData.filter(month => month.totalCount > 0);
//     }

//     const response = {
//       totalCases: result[0]?.totalCases[0]?.total || 0,
//       pendingCases: result[0]?.pendingCases[0]?.pending || 0,
//       wipCases: result[0]?.wipCases[0]?.wip || 0,
//       approvedCases: result[0]?.approvedCases[0]?.approved || 0,
//       rejectedCases: result[0]?.rejectedCases[0]?.rejected || 0,
//       monthlyData: finalMonthlyData,
//       // Include filter information for debugging/reference
//       filterInfo: {
//         month: month ? parseInt(month) : null,
//         year: year ? parseInt(year) : null,
//         filterStart: filterStart.toISOString(),
//         filterEnd: filterEnd.toISOString(),
//         isSingleYearRange: isSingleYearRange
//       }
//     };

//     return success(res, "PD Files Dashboard", response);

//   } catch (error) {
//     console.error(error);
//     return unknownError(res, error);
//   }
// }

async function pdFilesDashBoardMonthlyCount(req, res) {
  try {
    const { branch, regionalbranch, employee, product, status,
      startDateFilter, endDateFilter,
      month, year, // New parameters for month/year filtering
      limit = 10000, page = 1, searchQuery } = req.query;

    const employeeId = req.Id;

    const employeeExist = await employeeModel.findById(employeeId,{ status: "active" });
    if (!employeeExist) {
      return badRequest(res, "Employee Not Found");
    }

    // Determine date range for filtering and month-wise aggregation
    const determineFilterDates = () => {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();

      let filterStart, filterEnd;

      // If month and year are provided, use them for specific month filtering
      if (month && year) {
        // Month is 1-12 based, but JavaScript Date uses 0-11
        const monthIndex = parseInt(month) - 1;
        const yearValue = parseInt(year);

        // Set to first day of the specified month/year
        filterStart = new Date(yearValue, monthIndex, 1, 0, 0, 0, 0);

        // Set to last day of the specified month/year
        // Get the first day of next month and subtract 1 millisecond
        const nextMonth = monthIndex === 11 ? 0 : monthIndex + 1;
        const nextYear = monthIndex === 11 ? yearValue + 1 : yearValue;
        filterEnd = new Date(nextYear, nextMonth, 1, 0, 0, 0, 0);
        filterEnd.setMilliseconds(-1);
      }
      // Otherwise use the date range filters if provided
      else if (startDateFilter && startDateFilter !== "all") {
        filterStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));

        if (endDateFilter && endDateFilter !== "all") {
          filterEnd = new Date(new Date(endDateFilter).setHours(23, 59, 59, 999));
        } else {
          // Default to end of current year if only start date is provided
          filterEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999);
        }
      }
      else {
        // Default to current year if no filters provided
        filterStart = new Date(currentYear, 0, 1, 0, 0, 0, 0);
        filterEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999);
      }

      return { filterStart, filterEnd };
    };

    const { filterStart, filterEnd } = determineFilterDates();

    // Determine if we're looking at a single year or multiple years
    const startYear = filterStart.getFullYear();
    const endYear = filterEnd.getFullYear();
    const isSingleYearRange = startYear === endYear;

    let matchConditions = {
      fileStatus: "active"
    };

    if (searchQuery) {
      matchConditions.$or = [
        { "applicantDetails.mobileNo": { $regex: searchQuery, $options: "i" } },
        { "applicantDetails.customerFatherName": { $regex: searchQuery, $options: "i" } },
        { "applicantDetails.customerFullName": { $regex: searchQuery, $options: "i" } },
        { "customerDetailData.customerFinId": { $regex: searchQuery, $options: "i" } }
      ];
    }

    if (branch && branch !== "all") {
      const branchArray = Array.isArray(branch) ? branch : branch.split(",");
      matchConditions["branchDetails._id"] = { $in: branchArray.map(id => new ObjectId(id)) };
    }

    if (regionalbranch && regionalbranch !== "all") {
      const regionalbranchArray = Array.isArray(regionalbranch) ? regionalbranch : regionalbranch.split(",");
      matchConditions["regionalBranchDetails._id"] = { $in: regionalbranchArray.map(id => new ObjectId(id)) };
    }

    if (employee && employee !== "all") {
      const employeeArray = Array.isArray(employee) ? employee : employee.split(",");
      matchConditions["pdEmployeeDetail._id"] = { $in: employeeArray.map(id => new ObjectId(id)) };
    }

    if (product == "all" || product == '' || !product) {
      const excludedProductIds = ["6734821148d4dbfbe0c69c7e"]; // Hardcoded for now, make it dynamic if needed
      if (excludedProductIds.length > 0) {
        matchConditions["customerDetailData.productId"] = { $nin: excludedProductIds.map(id => new ObjectId(id)) };
      }
    }

    if (status && status !== "all") {
      const statusArray = Array.isArray(status) ? status : status.split(",");
      matchConditions["statusByCreditPd"] = { $in: statusArray };
    }

    // Convert filterStart and filterEnd to ISO strings for date comparison
    const formattedStart = formatDateToISO(filterStart);
    const formattedEnd = formatDateToISO(filterEnd);

    function formatDateToISO(date) {
      return new Date(date).toISOString();
    }

    // Rest of the aggregation pipeline remains the same...
    const aggregationPipeline = [
      // Initial lookups and data processing - unchanged from previous version
      {
        $lookup: {
          from: "customerdetails",
          localField: "customerId",
          foreignField: "_id",
          as: "customerDetailData"
        }
      },
      { $unwind: { path: "$customerDetailData", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "employees",
          localField: "customerDetailData.employeId",
          foreignField: "_id",
          as: "salesPerson"
        }
      },
      { $unwind: { path: "$salesPerson", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "newbranches",
          localField: "salesPerson.branchId",
          foreignField: "_id",
          as: "branchDetails"
        }
      },
      { $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "newbranches",
          localField: "branchDetails.regionalBranchId",
          foreignField: "_id",
          as: "regionalBranchDetails"
        }
      },
      { $unwind: { path: "$regionalBranchDetails", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "employees",
          localField: "salesPerson.reportingManagerId",
          foreignField: "_id",
          as: "reportingManager"
        }
      },
      { $unwind: { path: "$reportingManager", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "applicantdetails",
          localField: "customerId",
          foreignField: "customerId",
          as: "applicantDetails"
        }
      },
      { $unwind: { path: "$applicantDetails", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "employees",
          localField: "creditPdId",
          foreignField: "_id",
          as: "pdEmployeeDetail"
        }
      },
      { $unwind: { path: "$pdEmployeeDetail", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "cibildetails",
          localField: "customerId",
          foreignField: "customerId",
          as: "cibilDetailsData"
        }
      },
      { $unwind: { path: "$cibilDetailsData", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "pdformdatas",
          localField: "customerId",
          foreignField: "customerId",
          as: "latestPdForm"
        }
      },

      {
        $lookup: {
          from: "products",
          localField: "customerDetailData.productId",
          foreignField: "_id",
          as: "productDetailData"
        }
      },
      { $unwind: { path: "$productDetailData", preserveNullAndEmptyArrays: true } },

      // Sort pdformdatas to get the latest one
      {
        $addFields: {
          latestPdForm: {
            $arrayElemAt: [
              { $sortArray: { input: "$latestPdForm", sortBy: { _id: -1 } } },
              0
            ]
          }
        }
      },

      // Helper function to clean date strings that might have AM/PM
      {
        $addFields: {
          cleanedCreditPdCompleteDate: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$creditPdCompleteDate", ""] },
                  { $ne: ["$creditPdCompleteDate", null] },
                  { $eq: [{ $type: "$creditPdCompleteDate" }, "string"] }
                ]
              },
              then: {
                $cond: {
                  if: { $regexMatch: { input: "$creditPdCompleteDate", regex: " AM| PM" } },
                  then: {
                    $cond: {
                      if: { $regexMatch: { input: "$creditPdCompleteDate", regex: " AM" } },
                      then: { $substr: ["$creditPdCompleteDate", 0, { $subtract: [{ $strLenCP: "$creditPdCompleteDate" }, 3] }] },
                      else: { $substr: ["$creditPdCompleteDate", 0, { $subtract: [{ $strLenCP: "$creditPdCompleteDate" }, 3] }] }
                    }
                  },
                  else: "$creditPdCompleteDate"
                }
              },
              else: "$creditPdCompleteDate"
            }
          },
          cleanedBdCompleteDate: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$latestPdForm.bdCompleteDate", ""] },
                  { $ne: ["$latestPdForm.bdCompleteDate", null] },
                  { $eq: [{ $type: "$latestPdForm.bdCompleteDate" }, "string"] }
                ]
              },
              then: {
                $cond: {
                  if: { $regexMatch: { input: "$latestPdForm.bdCompleteDate", regex: " AM| PM" } },
                  then: {
                    $cond: {
                      if: { $regexMatch: { input: "$latestPdForm.bdCompleteDate", regex: " AM" } },
                      then: { $substr: ["$latestPdForm.bdCompleteDate", 0, { $subtract: [{ $strLenCP: "$latestPdForm.bdCompleteDate" }, 3] }] },
                      else: { $substr: ["$latestPdForm.bdCompleteDate", 0, { $subtract: [{ $strLenCP: "$latestPdForm.bdCompleteDate" }, 3] }] }
                    }
                  },
                  else: "$latestPdForm.bdCompleteDate"
                }
              },
              else: "$latestPdForm.bdCompleteDate"
            }
          }
        }
      },

      // Add computed fields
      {
        $addFields: {
          customerFinId: { $ifNull: ["$customerDetailData.customerFinId", ""] },
          customerId: { $ifNull: ["$customerDetailData._id", ""] },
          productId: { $ifNull: ["$productDetailData._id", ""] },
          productName: { $ifNull: ["$productDetailData.productName", ""] },
          customerFullName: { $ifNull: ["$applicantDetails.fullName", ""] },
          customerFatherName: { $ifNull: ["$applicantDetails.fatherName", ""] },

          // Handle loginDate converting to Date safely
          loginDate: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$customerDetailData.createdAt", ""] },
                  { $ne: ["$customerDetailData.createdAt", null] }
                ]
              },
              then: {
                $cond: {
                  if: { $eq: [{ $type: "$customerDetailData.createdAt" }, "date"] },
                  then: "$customerDetailData.createdAt",
                  else: { $toDate: "$customerDetailData.createdAt" }
                }
              },
              else: null
            }
          },

          branchName: { $ifNull: ["$branchDetails.name", ""] },
          regionalBranchName: { $ifNull: ["$regionalBranchDetails.name", ""] },
          branch_id: { $ifNull: ["$branchDetails._id", ""] },
          mobileNo: { $ifNull: ["$applicantDetails.mobileNo", ""] },
          salesPersonName: { $ifNull: ["$salesPerson.employeName", ""] },
          salesPersonManagerName: { $ifNull: ["$reportingManager.employeName", ""] },
          pdPersonName: { $ifNull: ["$pdEmployeeDetail.employeName", ""] },
          pdPerson_id: { $ifNull: ["$pdEmployeeDetail._id", ""] },
          pdRejectRemark: { $ifNull: ["$latestPdForm.remarkByPd", ""] },
          cibilRemarkForPd: { $ifNull: ["$cibilDetailsData.cibilRemarkForPd", ""] },
          pdfLink: { $ifNull: ["$latestPdForm.pdfLink", ""] },
          pdRejectPhoto: { $ifNull: ["$creditPdRejectPhoto", ""] },
          reasonForReject: { $ifNull: ["$latestPdForm.reasonForReject", ""] },
          pdReplyToCibilRemarks: { $ifNull: ["$latestPdForm.pdReplyToCibilRemarks", ""] },

          // Use cleaned date fields with priority to bdCompleteDate
          creditPdCompleteDateRaw: {
            $cond: {
              if: { $or: [{ $eq: ["$cleanedCreditPdCompleteDate", ""] }, { $eq: ["$cleanedCreditPdCompleteDate", null] }] },
              then: "$cleanedBdCompleteDate",
              else: "$cleanedCreditPdCompleteDate"
            }
          },

          // Store bdCompleteDate explicitly for month-wise queries
          bdCompleteDateRaw: "$cleanedBdCompleteDate",

          statusByCreditPd: {
            $cond: {
              if: { $in: ["$statusByCreditPd", ["reject", "rejectByApprover"]] },
              then: "reject",
              else: {
                $cond: {
                  if: { $in: ["$statusByCreditPd", ["approve", "complete"]] },
                  then: "approve",
                  else: {
                    $cond: {
                      if: { $in: ["$statusByCreditPd", ["accept", "incomplete", "WIP"]] },
                      then: "WIP",
                      else: {
                        $cond: {
                          if: { $in: ["$statusByCreditPd", ["notAssign"]] },
                          then: "notAssign",
                          else: ""
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },

      // Convert creditPdCompleteDate to a proper Date object for all cases
      {
        $addFields: {
          formattedPdDate: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$creditPdCompleteDateRaw", ""] },
                  { $ne: ["$creditPdCompleteDateRaw", null] }
                ]
              },
              then: {
                $cond: {
                  if: { $eq: [{ $type: "$creditPdCompleteDateRaw" }, "date"] },
                  then: "$creditPdCompleteDateRaw",
                  else: {
                    $cond: {
                      if: { $eq: [{ $type: "$creditPdCompleteDateRaw" }, "string"] },
                      then: { $toDate: "$creditPdCompleteDateRaw" },
                      else: null
                    }
                  }
                }
              },
              else: null
            }
          },
          // Convert bdCompleteDate to a proper Date object for month-wise aggregation
          formattedBdDate: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$bdCompleteDateRaw", ""] },
                  { $ne: ["$bdCompleteDateRaw", null] }
                ]
              },
              then: {
                $cond: {
                  if: { $eq: [{ $type: "$bdCompleteDateRaw" }, "date"] },
                  then: "$bdCompleteDateRaw",
                  else: {
                    $cond: {
                      if: { $eq: [{ $type: "$bdCompleteDateRaw" }, "string"] },
                      then: { $toDate: "$bdCompleteDateRaw" },
                      else: null
                    }
                  }
                }
              },
              else: null
            }
          },
          // Store original value for display
          creditPdCompleteDate: "$creditPdCompleteDateRaw",
          bdCompleteDate: "$bdCompleteDateRaw"
        }
      },

      // Now calculate days difference with proper Date objects and a fail-safe approach
      {
        $addFields: {
          daysDifference: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$formattedPdDate", null] },
                  { $ne: ["$loginDate", null] },
                  { $eq: [{ $type: "$formattedPdDate" }, "date"] },
                  { $eq: [{ $type: "$loginDate" }, "date"] }
                ]
              },
              then: {
                $round: [
                  {
                    $divide: [
                      { $subtract: ["$formattedPdDate", "$loginDate"] },
                      1000 * 60 * 60 * 24
                    ]
                  }
                ]
              },
              else: null
            }
          }
        }
      },

      // Apply standard match conditions
      { $match: matchConditions },

      // Apply date filtering here - this is more effective than in matchConditions
      // because we've already processed all the date fields
      {
        $match: {
          $or: [
            // Match records with formattedPdDate in the specified range
            {
              formattedPdDate: {
                $gte: filterStart,
                $lte: filterEnd
              }
            },
            // Match records with formattedBdDate in the specified range
            {
              formattedBdDate: {
                $gte: filterStart,
                $lte: filterEnd
              }
            }
          ]
        }
      },

      // Group by customerId to ensure uniqueness
      {
        $group: {
          _id: "$customerId",
          customerFinId: { $first: "$customerFinId" },
          customerId: { $first: "$customerId" },
          loginDate: { $first: "$loginDate" },
          branchName: { $first: "$branchName" },
          branch_id: { $first: "$branch_id" },
          productId: { $first: "$productId" },
          productName: { $first: "$productName" },
          regionalBranchName: { $first: "$regionalBranchName" },
          salesPersonName: { $first: "$salesPersonName" },
          customerFullName: { $first: "$customerFullName" },
          customerFatherName: { $first: "$customerFatherName" },
          mobileNo: { $first: "$mobileNo" },
          salesPersonManagerName: { $first: "$salesPersonManagerName" },
          pdPersonName: { $first: "$pdPersonName" },
          pdPerson_id: { $first: "$pdPerson_id" },
          pdRejectRemark: { $first: "$latestPdForm.remarkByPd" },
          creditPdCompleteDate: { $first: "$creditPdCompleteDate" },
          bdCompleteDate: { $first: "$bdCompleteDate" },
          formattedPdDate: { $first: "$formattedPdDate" },
          formattedBdDate: { $first: "$formattedBdDate" },
          statusByCreditPd: { $first: "$statusByCreditPd" },
          creditPdId: { $first: "$creditPdId" },
          daysDifference: { $first: "$daysDifference" },
          cibilRemarkForPd: { $first: "$cibilRemarkForPd" },
          pdfLink: { $first: "$pdfLink" },
          pdRejectPhoto: { $first: "$pdRejectPhoto" },
          reasonForReject: { $first: "$reasonForReject" },
          pdReplyToCibilRemarks: { $first: "$pdReplyToCibilRemarks" },
        }
      },

      // Facet for counts and pagination
      {
        $facet: {
          totalCases: [{ $count: "total" }],
          pendingCases: [{ $match: { creditPdId: null, statusByCreditPd: { $in: ["notAssign", null, ""] } } }, { $count: "pending" }],
          wipCases: [{
            $match: {
              creditPdId: { $ne: null },
              statusByCreditPd: { $in: ["accept", "incomplete", "WIP"] }
            }
          }, { $count: "wip" }],
          approvedCases: [{
            $match: {
              creditPdId: { $ne: null },
              statusByCreditPd: { $in: ["approve", "complete"] }
            }
          }, { $count: "approved" }],
          rejectedCases: [{
            $match: {
              creditPdId: { $ne: null },
              statusByCreditPd: { $in: ["reject", "rejectByApprover"] }
            }
          }, { $count: "rejected" }],
          // Month-wise aggregation - this will only include data for the month/year range specified
          monthlyData: [
            {
              $group: {
                _id: {
                  year: {
                    $cond: [
                      { $ne: ["$formattedPdDate", null] },
                      { $year: "$formattedPdDate" },
                      { $year: "$formattedBdDate" }
                    ]
                  },
                  month: {
                    $cond: [
                      { $ne: ["$formattedPdDate", null] },
                      { $month: "$formattedPdDate" },
                      { $month: "$formattedBdDate" }
                    ]
                  }
                },
                count: { $sum: 1 },
                approved: {
                  $sum: {
                    $cond: [
                      { $in: ["$statusByCreditPd", ["approve", "complete"]] },
                      1,
                      0
                    ]
                  }
                },
                rejected: {
                  $sum: {
                    $cond: [
                      { $in: ["$statusByCreditPd", ["reject", "rejectByApprover"]] },
                      1,
                      0
                    ]
                  }
                },
                wip: {
                  $sum: {
                    $cond: [
                      { $in: ["$statusByCreditPd", ["accept", "incomplete", "WIP"]] },
                      1,
                      0
                    ]
                  }
                },
                notAssigned: {
                  $sum: {
                    $cond: [
                      { $in: ["$statusByCreditPd", ["notAssign", "", null]] },
                      1,
                      0
                    ]
                  }
                }
              }
            },
            {
              $project: {
                _id: 0,
                year: "$_id.year",
                month: "$_id.month",
                monthName: {
                  $switch: {
                    branches: [
                      { case: { $eq: ["$_id.month", 1] }, then: "January" },
                      { case: { $eq: ["$_id.month", 2] }, then: "February" },
                      { case: { $eq: ["$_id.month", 3] }, then: "March" },
                      { case: { $eq: ["$_id.month", 4] }, then: "April" },
                      { case: { $eq: ["$_id.month", 5] }, then: "May" },
                      { case: { $eq: ["$_id.month", 6] }, then: "June" },
                      { case: { $eq: ["$_id.month", 7] }, then: "July" },
                      { case: { $eq: ["$_id.month", 8] }, then: "August" },
                      { case: { $eq: ["$_id.month", 9] }, then: "September" },
                      { case: { $eq: ["$_id.month", 10] }, then: "October" },
                      { case: { $eq: ["$_id.month", 11] }, then: "November" },
                      { case: { $eq: ["$_id.month", 12] }, then: "December" }
                    ],
                    default: "Unknown"
                  }
                },
                yearMonth: {
                  $concat: [
                    { $toString: "$_id.year" },
                    "-",
                    {
                      $cond: [
                        { $lt: ["$_id.month", 10] },
                        { $concat: ["0", { $toString: "$_id.month" }] },
                        { $toString: "$_id.month" }
                      ]
                    }
                  ]
                },
                totalCount: "$count",
                approved: "$approved",
                rejected: "$rejected",
                wip: "$wip",
                notAssigned: "$notAssigned"
              }
            },
            // Sort by year and then by month
            { $sort: { year: 1, month: 1 } }
          ],
          fileDetails: [
            { $skip: (page - 1) * limit },
            { $limit: parseInt(limit) },
            {
              $project: {
                _id: 0,
                customerFinId: 1,
                customerId: 1,
                loginDate: 1,
                branchName: 1,
                branch_id: 1,
                productName: 1,
                productId: 1,
                regionalBranchName: 1,
                salesPersonName: 1,
                customerFullName: 1,
                customerFatherName: 1,
                mobileNo: 1,
                salesPersonManagerName: 1,
                pdPersonName: 1,
                pdPerson_id: 1,
                pdRejectRemark: 1,
                creditPdCompleteDate: 1,
                bdCompleteDate: 1,
                statusByCreditPd: 1,
                cibilRemarkForPd: 1,
                daysDifference: 1,
                pdfLink: 1,
                reasonForReject: 1,
                pdRejectPhoto: 1,
                pdReplyToCibilRemarks: 1,
              }
            }
          ]
        }
      }
    ];

    const result = await externalManagerModel.aggregate(aggregationPipeline);

    // Get the raw monthly data from the aggregation
    const actualMonthlyData = result[0]?.monthlyData || [];

    // Function to create empty month data for a specific year
    function getFullYearMonths(year) {
      const months = [];
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];

      for (let month = 1; month <= 12; month++) {
        const monthName = monthNames[month - 1];
        const yearMonth = `${year}-${month < 10 ? '0' + month : month}`;

        months.push({
          year: year,
          month: month,
          monthName: monthName,
          yearMonth: yearMonth,
          totalCount: 0,
          approved: 0,
          rejected: 0,
          wip: 0,
          notAssigned: 0
        });
      }

      return months;
    }

    // Generate empty month templates for all years in the date range
    function getAllYearsMonths(startYear, endYear) {
      let allMonths = [];

      for (let year = startYear; year <= endYear; year++) {
        const yearMonths = getFullYearMonths(year);
        allMonths = [...allMonths, ...yearMonths];
      }

      return allMonths;
    }

    // Function to merge actual data into the empty month templates
    function mergeMonthlyData(emptyMonths, actualData) {
      actualData.forEach(monthData => {
        const matchingMonth = emptyMonths.find(m =>
          m.year === monthData.year && m.month === monthData.month
        );

        if (matchingMonth) {
          // Copy all properties from actual data
          Object.assign(matchingMonth, monthData);
        }
      });

      return emptyMonths;
    }

    // Decide which monthly data to use based on date range
    let finalMonthlyData;

    if (month && year) {
      // For specific month/year query, just return the actual data
      finalMonthlyData = actualMonthlyData;
    }
    else if (isSingleYearRange) {
      // For single year range, show all months (Jan-Dec) with actual data filled in
      const emptyMonths = getFullYearMonths(startYear);
      finalMonthlyData = mergeMonthlyData(emptyMonths, actualMonthlyData);
    }
    else {
      // For multi-year ranges, only show months with actual data
      finalMonthlyData = actualMonthlyData.filter(month => month.totalCount > 0);
    }

    const response = {
      totalCases: result[0]?.totalCases[0]?.total || 0,
      pendingCases: result[0]?.pendingCases[0]?.pending || 0,
      wipCases: result[0]?.wipCases[0]?.wip || 0,
      approvedCases: result[0]?.approvedCases[0]?.approved || 0,
      rejectedCases: result[0]?.rejectedCases[0]?.rejected || 0,
      monthlyData: finalMonthlyData,
    };

    return success(res, "PD Files Dashboard", response);

  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


async function pdDashBoardEmployeeTable(req, res) {
  try {
    const { startDateFilter, endDateFilter } = req.query;
    const employeeId = req.Id;

    const employeeExist = await employeeModel.findOne({ _id: employeeId, status: "active" });
    if (!employeeExist) {
      return badRequest(res, "Employee Not Found");
    }

    let matchConditions = {
      fileStatus: "active"
    };

    const today = new Date();
    const defaultStartDate = new Date(today.getFullYear(), today.getMonth(), 1); // Start of month
    const defaultEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999); // End of month

    function formatDateToISO(date) {
      return new Date(date).toISOString();
    }

    let formattedStart = startDateFilter && startDateFilter !== "all"
      ? new Date(new Date(startDateFilter).setHours(0, 0, 0, 0))
      : new Date("2024-11-01"); // Default to 2024-11-01 if no start date

    let formattedEnd = endDateFilter && endDateFilter !== "all"
      ? new Date(new Date(endDateFilter).setHours(23, 59, 59, 999))
      : today; // Default to today's date if no end date

    if (startDateFilter && endDateFilter && startDateFilter === endDateFilter) {
      formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
      formattedEnd = new Date(new Date(startDateFilter).setHours(23, 59, 59, 999));
    }

    formattedStart = formatDateToISO(formattedStart);
    formattedEnd = formatDateToISO(formattedEnd);

    if (startDateFilter && endDateFilter && startDateFilter !== "all" && endDateFilter !== "all") {
      matchConditions["$or"] = [
        {
          creditPdCompleteDate: { $gte: formattedStart, $lt: formattedEnd },
        },
        {
          creditPdCompleteDate: { $in: ["", null] },
          "latestPdForm.bdCompleteDate": { $gte: formattedStart, $lt: formattedEnd },
        },
      ];
    }

    const resultEmployee = await externalManagerModel.aggregate([
      { $match: matchConditions },

      {
        $lookup: {
          from: "pdformdatas",
          localField: "customerId",
          foreignField: "customerId",
          as: "latestPdForm",
        },
      },
      {
        $unwind: {
          path: "$latestPdForm",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $sort: { "latestPdForm._id": -1 } },

      {
        $addFields: {
          creditPdCompleteDate: {
            $cond: {
              if: { $or: [{ $eq: ["$creditPdCompleteDate", ""] }, { $eq: ["$creditPdCompleteDate", null] }] },
              then: "$latestPdForm.bdCompleteDate",
              else: "$creditPdCompleteDate",
            },
          },
        },
      },

      {
        $lookup: {
          from: "employees",
          localField: "creditPdId",
          foreignField: "_id",
          as: "employeeDetails",
        },
      },
      {
        $unwind: "$employeeDetails",
      },
      {
        $unwind: "$statusByCreditPd",
      },
      {
        $group: {
          _id: "$creditPdId",
          employeeName: { $first: "$employeeDetails.employeName" },
          employeeId: { $first: "$employeeDetails._id" },
          totalAssignFiles: { $sum: 1 },
          WIPFiles: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$statusByCreditPd", "incomplete"] },
                    { $eq: ["$statusByCreditPd", "accept"] },
                    { $eq: ["$statusByCreditPd", "WIP"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          rejectFiles: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$statusByCreditPd", "reject"] },
                    { $eq: ["$statusByCreditPd", "rejectByApprover"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          completeFiles: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$statusByCreditPd", "complete"] },
                    { $eq: ["$statusByCreditPd", "approve"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          employeeTarget: { $first: "$employeeDetails.employeeTarget" },
        },
      },
      {
        $sort: { totalAssignFiles: -1, completeFiles: -1 }, // Sort by totalAssignFiles, then by completeFiles
      },
    ]);

    // **Check Employee Target for 'pd' and Multiply by Month Difference**
    resultEmployee.forEach((employee) => {
      // Find target with title "pd"
      const pdTarget = employee.employeeTarget?.find((target) => target.title === "PD");

      // If title is "pd", calculate target value
      if (pdTarget && pdTarget.value) {
        const targetValue = parseInt(pdTarget.value, 10);

        // Calculate the number of months between startDateFilter and endDateFilter
        const startDate = new Date(formattedStart);
        const endDate = new Date(formattedEnd);
        const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());

        // Calculate total months including partial months
        const totalMonths = calculateTotalMonths(startDate, endDate) + 1; // Add 1 to count the current month
        employee.pdTargetValue = targetValue * totalMonths;
      } else {
        // If no valid target, set to 0
        employee.pdTargetValue = 0;
      }

      // Sum of completeFiles and rejectFiles
      const totalCompletedAndRejected = employee.completeFiles + employee.rejectFiles;

      // Check if the total completed/rejected files is greater than or equal to pdTargetValue
      if (employee.pdTargetValue > 0 && totalCompletedAndRejected >= employee.pdTargetValue) {
        employee.achieveStatus = true;
      } else {
        employee.achieveStatus = false;
      }
      delete employee.employeeTarget
    });


    const response = {
      TotalCases: resultEmployee.length || 0,
      totalmonths: calculateTotalMonths(new Date(formattedStart), new Date(formattedEnd)) + 1, // Add total months to the response
      Detail: resultEmployee,
    };

    return success(res, "PD Files Employee Table Dashboard", response);
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


async function pdDashBoardProductTable(req, res) {
  try {
    const { startDateFilter, endDateFilter } = req.query;
    const employeeId = req.Id;

    const employeeExist = await employeeModel.findOne({ _id: employeeId, status: "active" });
    if (!employeeExist) {
      return badRequest(res, "Employee Not Found");
    }

    let matchConditions = {
      fileStatus: "active"

    };

    const today = new Date();
    const defaultStartDate = new Date(today.setHours(0, 0, 0, 0)); // Default start at 6 AM
    const defaultEndDate = new Date(today.setHours(23, 59, 59, 999)); // Default end at 11:50 PM

    function formatDateToISO(date) {
      return new Date(date).toISOString(); // Convert to ISO format
    }

    // Adjust start and end dates based on filters
    let formattedStart = startDateFilter && startDateFilter !== "all"
      ? new Date(new Date(startDateFilter).setHours(0, 0, 0, 0)) // Set to 6 AM
      : defaultStartDate;

    let formattedEnd = endDateFilter && endDateFilter !== "all"
      ? new Date(new Date(endDateFilter).setHours(23, 59, 59, 999)) // Set to 11:50 PM
      : defaultEndDate;

    // ✅ If startDateFilter and endDateFilter are the same, ensure correct filtering for that day
    if (startDateFilter && endDateFilter && startDateFilter === endDateFilter) {
      formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
      formattedEnd = new Date(new Date(startDateFilter).setHours(23, 59, 59, 999));
    }

    // Convert to ISO for MongoDB query
    formattedStart = formatDateToISO(formattedStart);
    formattedEnd = formatDateToISO(formattedEnd);

    // Add match conditions
    if (startDateFilter && endDateFilter && startDateFilter !== "all" && endDateFilter !== "all") {
      matchConditions["$or"] = [
        {
          creditPdCompleteDate: {
            $gte: formattedStart,
            $lt: formattedEnd,
          },
        },
        {
          creditPdCompleteDate: { $in: ["", null] }, // If empty or null
          "latestPdForm.bdCompleteDate": {
            $gte: formattedStart,
            $lt: formattedEnd,
          },
        },
      ];
    }

    const resultProduct = await externalManagerModel.aggregate([
      { $match: matchConditions },

      {
        $lookup: {
          from: "pdformdatas",
          localField: "customerId",
          foreignField: "customerId",
          as: "latestPdForm",
        },
      },
      { $unwind: { path: "$latestPdForm", preserveNullAndEmptyArrays: true } },
      { $sort: { "latestPdForm._id": -1 } },

      {
        $addFields: {
          creditPdCompleteDate: {
            $cond: {
              if: { $or: [{ $eq: ["$creditPdCompleteDate", ""] }, { $eq: ["$creditPdCompleteDate", null] }] },
              then: "$latestPdForm.bdCompleteDate",
              else: "$creditPdCompleteDate",
            },
          },
        },
      },
      {
        $lookup: {
          from: "customerdetails",
          localField: "customerId",
          foreignField: "_id",
          as: "customerdetailData",
        },
      },
      { $unwind: "$customerdetailData" },

      {
        $lookup: {
          from: "products",
          localField: "customerdetailData.productId",
          foreignField: "_id",
          as: "productDetail",
        },
      },
      { $unwind: "$productDetail" },

      // Ensure only active products are included
      // { $match: { "productDetail.status": "active" } },

      { $unwind: "$statusByCreditPd" },

      {
        $group: {
          _id: "$productDetail._id",
          productName: { $first: "$productDetail.productName" },
          productId: { $first: "$productDetail._id" },
          totalAssignFiles: { $sum: { $cond: [{ $ne: ["$creditPdId", null] }, 1, 0] } },
          totalNotAssignFiles: { $sum: { $cond: [{ $eq: ["$creditPdId", null] }, 1, 0] } },
          WIPFiles: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$statusByCreditPd", "incomplete"] },
                    { $eq: ["$statusByCreditPd", "accept"] },
                    { $eq: ["$statusByCreditPd", "WIP"] }
                  ],
                }, 1, 0
              ],
            },
          },
          rejectFiles: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$statusByCreditPd", "reject"] },
                    { $eq: ["$statusByCreditPd", "rejectByApprover"] },
                  ],
                }, 1, 0
              ],
            },
          },
          completeFiles: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$statusByCreditPd", "complete"] },
                    { $eq: ["$statusByCreditPd", "approve"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },

      {
        $project: {
          _id: 0,
          productName: 1,
          productId: 1,
          totalAssignFiles: 1,
          totalNotAssignFiles: 1,
          WIPFiles: 1,
          rejectFiles: 1,
          completeFiles: 1,
        },
      },
    ]);

    const response = {
      TotalCases: resultProduct.length || 0,
      productDetail: resultProduct,
    };

    return success(res, "PD Files Product Table Dashboard", response);

  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


async function pdDashBoardBranchTable(req, res) {
  try {
    const { startDateFilter, endDateFilter } = req.query;
    const employeeId = req.Id;

    const employeeExist = await employeeModel.findOne({ _id: employeeId, status: "active" });
    if (!employeeExist) {
      return badRequest(res, "Employee Not Found");
    }

    let matchConditions = {
      fileStatus: "active"
    };


    const today = new Date();
    const defaultStartDate = new Date(today.setHours(0, 0, 0, 0)); // Default start at 6 AM
    const defaultEndDate = new Date(today.setHours(23, 59, 59, 999)); // Default end at 11:50 PM

    function formatDateToISO(date) {
      return new Date(date).toISOString(); // Convert to ISO format
    }

    // Adjust start and end dates based on filters
    let formattedStart = startDateFilter && startDateFilter !== "all"
      ? new Date(new Date(startDateFilter).setHours(0, 0, 0, 0)) // Set to 6 AM
      : defaultStartDate;

    let formattedEnd = endDateFilter && endDateFilter !== "all"
      ? new Date(new Date(endDateFilter).setHours(23, 59, 59, 999)) // Set to 11:50 PM
      : defaultEndDate;

    // ✅ If startDateFilter and endDateFilter are the same, ensure correct filtering for that day
    if (startDateFilter && endDateFilter && startDateFilter === endDateFilter) {
      formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
      formattedEnd = new Date(new Date(startDateFilter).setHours(23, 59, 59, 999));
    }

    // Convert to ISO for MongoDB query
    formattedStart = formatDateToISO(formattedStart);
    formattedEnd = formatDateToISO(formattedEnd);

    // Add match conditions
    if (startDateFilter && endDateFilter && startDateFilter !== "all" && endDateFilter !== "all") {
      matchConditions["$or"] = [
        {
          creditPdCompleteDate: {
            $gte: formattedStart,
            $lt: formattedEnd,
          },
        },
        {
          creditPdCompleteDate: { $in: ["", null] }, // If empty or null
          "latestPdForm.bdCompleteDate": {
            $gte: formattedStart,
            $lt: formattedEnd,
          },
        },
      ];
    }


    const resultBranch = await externalManagerModel.aggregate([
      // Lookup employees to get employee details
      { $match: matchConditions },

      // Lookup pdformdatas to get the latest PD form details
      {
        $lookup: {
          from: "pdformdatas",
          localField: "customerId",
          foreignField: "customerId",
          as: "latestPdForm",
        },
      },
      {
        $unwind: {
          path: "$latestPdForm",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: { "latestPdForm._id": -1 }, // Get the latest entry
      },

      {
        $addFields: {
          creditPdCompleteDate: {
            $cond: {
              if: { $or: [{ $eq: ["$creditPdCompleteDate", ""] }, { $eq: ["$creditPdCompleteDate", null] }] },
              then: "$latestPdForm.bdCompleteDate",
              else: "$creditPdCompleteDate",
            },
          },
        },
      },
      {
        $lookup: {
          from: "customerdetails",  // Your employees collection name
          localField: "customerId",
          foreignField: "_id",
          as: "customerdetailData",
        },
      },
      {
        $unwind: "$customerdetailData", // Unwind to access employee details
      },
      {
        $lookup: {
          from: "employees",  // Your employees collection name
          localField: "customerdetailData.employeId",
          foreignField: "_id",
          as: "employeeDetails",
        },
      },
      {
        $unwind: "$employeeDetails", // Unwind to access employee details
      },

      {
        $lookup: {
          from: "newbranches",  // Your employees collection name
          localField: "employeeDetails.branchId",
          foreignField: "_id",
          as: "newbrancheDetails",
        },
      },
      {
        $unwind: "$newbrancheDetails", // Unwind to access employee details
      },
      {
        $unwind: "$statusByCreditPd", // Unwind statusByCreditPd to process each status separately
      },
      {
        $group: {
          _id: "$newbrancheDetails._id",
          branchName: { $first: "$newbrancheDetails.name" },
          branchId: { $first: "$newbrancheDetails._id" },
          // totalAssignFiles: { $sum: 1 },
          totalAssignFiles: {
            $sum: {
              $cond: [{ $ne: ["$creditPdId", null] }, 1, 0] // Count only assigned files
            }
          },

          totalNotAssignFiles: {
            $sum: {
              $cond: [{ $eq: ["$creditPdId", null] }, 1, 0]
            }
          },
          WIPFiles: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$statusByCreditPd", "incomplete"] },
                    { $eq: ["$statusByCreditPd", "accept"] },
                    { $eq: ["$statusByCreditPd", "WIP"] }
                  ],
                }, 1, 0
              ],
            },
          },
          rejectFiles: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$statusByCreditPd", "reject"] },
                    { $eq: ["$statusByCreditPd", "rejectByApprover"] },
                  ],
                }, 1, 0
              ],
            },
          },
          completeFiles: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$statusByCreditPd", "complete"] },
                    { $eq: ["$statusByCreditPd", "approve"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          branchName: 1,
          branchId: 1,
          totalAssignFiles: 1,
          totalNotAssignFiles: 1,
          WIPFiles: 1,
          rejectFiles: 1,
          completeFiles: 1,
        },
      },
    ]);


    const response = {
      TotalCases: resultBranch.length || 0,
      branchDetail: resultBranch,
    };

    return success(res, "PD Files Branch Table Dashboard", response);

  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


async function topPdCompleteEmployees(req, res) {
  try {
    const { startDateFilter, endDateFilter } = req.query;
    const employeeId = req.Id;

    const employeeExist = await employeeModel.findOne({ _id: employeeId, status: "active" });
    if (!employeeExist) {
      return badRequest(res, "Employee Not Found");
    }

    let matchConditions = {
      fileStatus: "active"
    };

    const today = new Date();
    const defaultStartDate = new Date(today.setHours(0, 0, 0, 0));
    const defaultEndDate = new Date(today.setHours(23, 59, 59, 999));

    function formatDateToISO(date) {
      return new Date(date).toISOString();
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

    if (startDateFilter && endDateFilter && startDateFilter !== "all" && endDateFilter !== "all") {
      matchConditions["$or"] = [
        {
          creditPdCompleteDate: {
            $gte: formattedStart,
            $lt: formattedEnd,
          },
        },
        {
          creditPdCompleteDate: { $in: ["", null] },
          "latestPdForm.bdCompleteDate": {
            $gte: formattedStart,
            $lt: formattedEnd,
          },
        },
      ];
    }

    const resultEmployee = await externalManagerModel.aggregate([
      { $match: matchConditions },

      {
        $addFields: {
          creditPdCompleteDate: {
            $cond: {
              if: { $or: [{ $eq: ["$creditPdCompleteDate", ""] }, { $eq: ["$creditPdCompleteDate", null] }] },
              then: "$latestPdForm.bdCompleteDate",
              else: "$creditPdCompleteDate",
            },
          },
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "creditPdId",
          foreignField: "_id",
          as: "employeeDetails",
        },
      },
      { $unwind: "$employeeDetails" },
      { $unwind: "$statusByCreditPd" },
      {
        $group: {
          _id: "$creditPdId",
          employeeName: { $first: "$employeeDetails.employeName" },
          employeeId: { $first: "$employeeDetails._id" },
          completeFiles: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$statusByCreditPd", "complete"] },
                    { $eq: ["$statusByCreditPd", "approve"] },
                    { $eq: ["$statusByCreditPd", "rejectByApprover"] },
                    { $eq: ["$statusByCreditPd", "reject"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { completeFiles: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          employeeName: 1,
          employeeId: 1,
          completeFiles: 1,
        },
      },
    ]);

    const response = {
      TotalCases: resultEmployee.length || 0,
      Detail: resultEmployee,
    };

    return success(res, "✅ Top 10 PD Employees", response);
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}



async function fileInctiveBYProductId(req, res) {
  try {
    // const productId = "6734821148d4dbfbe0c69c7e"
    const externalVendorRecords = await externalManagerModel.find({
      // creditPdId: null,
      fileStatus: "active"
    });

    console.log('External Vendor Records:', externalVendorRecords);


    for (const record of externalVendorRecords) {
      const customerId = record.customerId;

      const customer = await customerModel.findOne({
        _id: new ObjectId(customerId),
        productId: new ObjectId(productId)
      });

      console.log('Customer found: ', customer);

      if (customer) {

        const result = await externalManagerModel.updateOne(
          { _id: record._id },
          { $set: { fileStatus: "inactive" } }
        );

        console.log(`Document with customerId ${customerId} updated to inactive.`);
      }
    }

    console.log("Process completed.");
    return success(res, "All files set to inactive");
  } catch (error) {
    console.error("Error in fileInctiveBYProductId:", error);
    unknownError(res, error);
  }
}

// ------------create or update rasanCard or samagraId  detail update-------------
async function familyDetailUpdate(req, res) {
  try {
    const { customerId, familyDetailType, rasanCardDetail, samagraIdDetail } = req.body;

    if (!customerId) {
      return badRequest(res, "customerId is required");
    }

    const existingData = await pdModel.findOne({ customerId: customerId });

    let updateFields = {};

    // Dynamic update building - only process fields that are provided
    if (familyDetailType === "rasanCard" && rasanCardDetail) {
      for (const key in rasanCardDetail) {
        updateFields[`rasanCardDetail.${key}`] = rasanCardDetail[key];
      }
    } else if (familyDetailType === "samagraId" && samagraIdDetail) {
      for (const key in samagraIdDetail) {
        if (key === 'address') {
          for (const addrKey in samagraIdDetail.address) {
            updateFields[`samagraIdDetail.address.${addrKey}`] = samagraIdDetail.address[addrKey];
          }
        } else {
          updateFields[`samagraIdDetail.${key}`] = samagraIdDetail[key];
        }
      }
    }

    if (familyDetailType) {
      updateFields.familyDetailType = familyDetailType;
    }

    if (existingData) {
      await pdModel.updateOne({ customerId }, { $set: updateFields });
    } else {
      const newData = new pdModel({
        customerId,
        familyDetailType,
        rasanCardDetail: familyDetailType === "rasanCard" ? rasanCardDetail : undefined,
        samagraIdDetail: familyDetailType === "samagraId" ? samagraIdDetail : undefined
      });
      await newData.save();
    }

    // Fetch updated document to construct response
    const updatedDoc = await pdModel.findOne({ customerId }).lean();

    let responseData = { customerId, familyDetailType };

    if (familyDetailType === "rasanCard" && updatedDoc.rasanCardDetail) {
      responseData.rasanCardDetail = updatedDoc.rasanCardDetail;
    } else if (familyDetailType === "samagraId" && updatedDoc.samagraIdDetail) {
      responseData.samagraIdDetail = updatedDoc.samagraIdDetail;
    }

    success(res, "Family details updated successfully", responseData);
    const fileStageForms = await processModel.findOneAndUpdate(
      { customerId: req.body.customerId },
      { $set: { 'fileStageForms.familyDetail': true, 'fileStageForms.familyDetailDoc': true } },
      { new: true }
    );
    await finalApprovalSheet(customerId)
  } catch (error) {
    console.error("Error in familyDetailUpdate:", error);
    return unknownError(res, error);
  }
}

async function getFamilyDetail(req, res) {
  try {
    const { customerId } = req.query;

    if (!customerId) {
      return badRequest(res, "customerId is required");
    }

    const existingData = await pdModel.findOne({ customerId });

    if (!existingData) {
      // No data found — return success with empty items
      return success(res, "No data found for given customerId", {});
    }

    let responseData = {
      customerId,
      familyDetailType: existingData.familyDetailType
    };

    if (existingData.familyDetailType === "rasanCard") {
      responseData.rasanCardDetail = existingData.rasanCardDetail || {};
    } else if (existingData.familyDetailType === "samagraId") {
      responseData.samagraIdDetail = existingData.samagraIdDetail || {};
    } else {
      // if familyDetailType is somehow invalid (this should not normally happen)
      return badRequest(res, "Please Upload familyDetailType 'rasanCard' or 'samagraId'");
    }

    return success(res, "Family details fetched successfully", responseData);

  } catch (error) {
    console.error("Error in getFamilyDetail:", error);
    return unknownError(res, error);
  }
}

// ------------Create Or Update Electricity Bill Detail ---------------------------
async function electricityBillSaveOrUpdate(req, res) {
  try {
    const {
      customerId,
      electricityBillPhoto,
      customerNameAsPerElectricityBill,
      customerBillId,
      addressAsPerElectricityBill,
      billType,
      personType,
      personName
    } = req.body;

    if (!customerId) {
      return badRequest(res, "customerId is required");
    }

    // Prepare the direct update data (no nested object)
    const updateData = {
      customerId,
      electricityBillPhoto,
      customerNameAsPerElectricityBill,
      customerBillId,
      addressAsPerElectricityBill,
      billType,
      personType,
      personName
    };

    // Upsert directly into the model (create if not exists, update if exists)
    const updatedDoc = await pdModel.findOneAndUpdate(
      { customerId },
      { $set: updateData },
      { upsert: true, new: true, lean: true }
    );

    // Send only saved data from DB as response
    success(res, "Electricity bill details updated successfully", updatedDoc);

  } catch (error) {
    console.error("Error in electricityBillSaveOrUpdate:", error);
    return unknownError(res, error);
  }
}

// ----------Electricity Bill Detail Get-------------------------------------------
async function getElectricityDetail(req, res) {
  try {
    const { customerId } = req.query;

    if (!customerId) {
      return badRequest(res, "customerId is required");
    }

    const existingData = await pdModel.findOne({ customerId });

    if (!existingData) {
      // No data found — return success with empty items
      return success(res, "No data found for given customerId", {});
    }

    let responseData = {
      customerId,
      electricityBillPhoto: existingData.electricityBillPhoto,
      customerNameAsPerElectricityBill: existingData.customerNameAsPerElectricityBill,
      customerBillId: existingData.customerBillId,
      addressAsPerElectricityBill: existingData.addressAsPerElectricityBill,
      billType: existingData.billType,
      personType: existingData.personType,
      personName: existingData.personName,

    };


    return success(res, " Details Fetched Successfully", responseData);

  } catch (error) {
    console.error("Error => :", error);
    return unknownError(res, error);
  }
}


async function withAllDataGeneratePdReport(req, res) {
  try {

    console.log('check api ---')

    const { customerId, status, remarkByHo, remarkForPd, pdEmployeeId, } = req.query;
    const employeeId = req.Id;
    const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");

    if (!customerId) {
      return badRequest(res, "Customer ID is required");
    }

    const customerDetail = await customerModel.findById(customerId);
    if (!customerDetail) {
      return badRequest(res, "Customer not found");
    }

    const pdDetail = await pdModel.findOne({ customerId });
    // if (!pdDetail) {
    //   return badRequest(res, "pd Form not found");
    // }
    if (!status) {
      return badRequest(res, "Status must be 'rePd' ,'complete' or 'newAssignPd' ")
    }

    if (status === 'complete') {
      const pdReport = await generatePdfWithAllData(res, customerId);

      const pdReportLink = typeof pdReport === 'string' ? pdReport : pdReport?.pdReport;
      if (!pdReportLink) {
        return badRequest(res, "PDF generation failed, no valid report link found.");
      }

      try {
        const [externalResult, pdResult] = await Promise.all([
          // externalManagerModel.findOneAndUpdate(
          //   { customerId },
          //   {
          //     pdfCreateByCreditPd: pdReportLink,
          //     remarkByHo: remarkByHo,
          //     hoEmployeeId: employeeId,
          //     hoStatus: status,
          //     statusByCreditPd: "approve",
          //     hoCompleteDate: todayDate,
          //   },
          //   { new: true }
          // ),
          pdModel.findOneAndUpdate(
            { customerId },
            { pdfWithAllData: pdReportLink },
            { new: true }
          )
        ]);
      } catch (dbError) {
        console.error('Database Update Error:', dbError);
        return badRequest(res, `PDF generated but database update failed: ${dbError.message}`);
      }
      return success(res, "PD Report generated successfully", pdReportLink);
    }
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

async function generatePdfWithoutImageReport(req, res) {
  try {

    console.log('check api ---')

    const { customerId, status } = req.query;
    const employeeId = req.Id;
    const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");

    if (!customerId) {
      return badRequest(res, "Customer ID is required");
    }

    const customerDetail = await customerModel.findById(customerId);
    if (!customerDetail) {
      return badRequest(res, "Customer not found");
    }

    const pdDetail = await pdModel.findOne({ customerId });
    if (!pdDetail) {
      return badRequest(res, "pd Form not found");
    }
    if (!status) {
      return badRequest(res, "Status must be 'complete'")
    }

    if (status === 'complete') {
      const pdReport = await generatePdfWithoutImage(res, customerId);

      const pdReportLink = typeof pdReport === 'string' ? pdReport : pdReport?.pdReport;
      if (!pdReportLink) {
        return badRequest(res, "PDF generation failed, no valid report link found.");
      }

      try {
        const [externalResult, pdResult] = await Promise.all([
          // externalManagerModel.findOneAndUpdate(
          //   { customerId },
          //   {
          //     pdfCreateByCreditPd: pdReportLink,
          //     remarkByHo: remarkByHo,
          //     hoEmployeeId: employeeId,
          //     hoStatus: status,
          //     statusByCreditPd: "approve",
          //     hoCompleteDate: todayDate,
          //   },
          //   { new: true }
          // ),
          pdModel.findOneAndUpdate(
            { customerId },
            { pdfWithoutImage: pdReportLink },
            { new: true }
          )
        ]);
      } catch (dbError) {
        console.error('Database Update Error:', dbError);
        return badRequest(res, `PDF generated but database update failed: ${dbError.message}`);
      }
      return success(res, "PD Report generated successfully", pdReportLink);
    } else {
      return badRequest(res, "Status must be 'complete'")
    }
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}



async function getCustomerDatesDetail(req, res) {
  try {
    const { customerId } = req.query;
    if (!customerId) {
      return badRequest(res, "customerId is required");
    }

    const customerDetail = await customerModel.findById(customerId)
    if (!customerDetail) {
      return badRequest(res, "customer details not found");
    }
    // Fetch loginDate from processModel
    const processData = await processModel.findOne({ customerId }).lean();
    const loginDate = processData?.salesCompleteDate || "";
    // Fetch cibilDate from cibilModel
    const cibilData = await cibilModel.findOne({ customerId }).lean();

    let cibilDate = null;
    if (cibilData && cibilData?.applicantFetchHistory && cibilData?.applicantFetchHistory.length > 0) {
      const lastFetch = cibilData?.applicantFetchHistory[cibilData?.applicantFetchHistory.length - 1];
      cibilDate = lastFetch.fetchDate || "";
    }
    // Fetch pdDate from externalManagerModel
    const vendorData = await externalManagerModel.findOne({ customerId }).lean();
    const pdDate = vendorData?.creditPdCompleteDate || null;
    const employeeData = await employeeModel.findById(vendorData?.creditPdId);
    const designationDetail = await designationModel.findById(employeeData?.designationId)
    const customerBranch = await newBrnachModel.findById(employeeData?.branchId).select('name');
    const formattedDate = moment(customerDetail.createdAt).format('YYYY-MM-DDTHH:mm:ss A');
   const  cibilApproveDate = moment(vendorData.createdAt).format('YYYY-MM-DDTHH:mm:ss A');
    // Final response
    const response = {
      customerId,
      customerFinId: customerDetail?.customerFinId,
      createDate: formattedDate,
      loginDate,
      lastCibilFetchDate:cibilDate,
      cibilDate :cibilApproveDate,
      pdDate,
      designation: designationDetail?.name || '',
      employeeCode: employeeData?.employeUniqueId || '',
      branchName: customerBranch?.name.toUpperCase() || '',
      pdDoneBy: employeeData?.employeName.toUpperCase() || '',
    };
    return success(res, "Customer dates fetched successfully", response);
  } catch (error) {
    console.error('Error fetching customer dates:', error);
    return unknownError(res, error);
  }
}

//get all pd details base on the empId
const getAllPdDetails = async (req, res) => {
  try {
    const { employeeId, startDateFilter, endDateFilter, limit = 1000, page = 1 } = req.query;

    if (!employeeId) {
      return badRequest(res, "empId is required");
    }

    const employeeExist = await employeeModel.findOne({ _id: employeeId, status: "active" });
    if (!employeeExist) {
      return badRequest(res, "Employee Not Found");
    }

    const query = { pdId: new ObjectId(employeeId), status: "approve" };

    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0]; // Gets "YYYY-MM-DD"

    if (startDateFilter === "all" || endDateFilter === "all") {
      // No date filter needed
    }
    else if (!startDateFilter && endDateFilter) {
      query.bdCompleteDate = { $lte: endDateFilter + 'T23:59:59' };
    }
    else if (startDateFilter && !endDateFilter) {
      query.bdCompleteDate = { $gte: startDateFilter };
    }
    else if (startDateFilter && endDateFilter && startDateFilter === endDateFilter) {
      const datePrefix = startDateFilter.split('T')[0]; // Gets just "YYYY-MM-DD"
      query.bdCompleteDate = { $regex: `^${datePrefix}` };
    }
    else if (startDateFilter && endDateFilter) {
      query.bdCompleteDate = {
        $gte: startDateFilter,
        $lte: endDateFilter + 'T23:59:59'
      };
      // } else {
      // Match records for today
      // query.bdCompleteDate = { $regex: `^${todayFormatted}` };
    }

    // console.log('query----',query) 
    const skip = (parseInt(page) - 1) * parseInt(limit);




    const allPdData = await pdModel.aggregate([
      { $match: query },

      // Convert string to ObjectId if needed
      {
        $addFields: {
          customerObjectId: {
            $cond: [
              { $eq: [{ $type: "$customerId" }, "string"] },
              { $toObjectId: "$customerId" },
              "$customerId"
            ]
          }
        }
      },

      {
        $lookup: {
          from: "applicantdetails",
          localField: "customerObjectId", // converted customerId
          foreignField: "customerId",      // should also be ObjectId in applicantdetails
          as: "applicantdetailsData"
        }
      },
      {
        $unwind: {
          path: "$applicantdetailsData",
          preserveNullAndEmptyArrays: true
        }
      },
      { $sort: { bdCompleteDate: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    const totalCount = await pdModel.countDocuments(query);

    return success(res, "pd data retrieved successfully", {
      dataLength: allPdData.length,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      data: allPdData
    });

  } catch (error) {
    console.error('Error fetching PD data:', error);
    return unknownError(res, error);
  }
};



module.exports = {
  // mailFuntionsCHeck,
  getAllPdEmploye,
  PdFormsAssignList,
  creditPdGet,
  deletePdForm,
  getAllCreditPpAssignFiles,
  addCreditPdReportJsonForm,
  fileRevertByPd,
  creditPdGetForApp,
  creditPdFormImagesGet,
  // setdateINPdModel,
  hoByRePdAndGeneratePdReport,
  getAllPdFileAdminDashboard,
  allFilesPdDashBoard,
  pdDashBoardProductTable,
  pdDashBoardBranchTable,
  pdDashBoardEmployeeTable,
  fileInctiveBYProductId,
  topPdCompleteEmployees,
  familyDetailUpdate,
  getFamilyDetail,
  electricityBillSaveOrUpdate,
  getElectricityDetail,
  withAllDataGeneratePdReport,
  generatePdfWithoutImageReport,
  getCustomerDatesDetail,
  calculateTotalMonths,
  getAllPdDetails,
  employeePdFileCounts,
  pdFilesDashBoardMonthlyCount
};
