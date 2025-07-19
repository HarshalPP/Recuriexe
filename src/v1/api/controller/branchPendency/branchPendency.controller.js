
const {
    serverValidation,
    success,
    notFound,
    badRequest,
    unknownError } = require('../../../../../globalHelper/response.globalHelper.js');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { validationResult } = require('express-validator');
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
const credentials = require('../../../../../liveSheet.json');
const baseUrl = process.env.BASE_URL;
const axios = require('axios')
const xlsx = require('xlsx');
const moment = require('moment');
const { callbackify } = require('util');
const employeModel = require('../../model/adminMaster/employe.model.js')
const cibilModel = require("../../model/cibilDetail.model.js")
const customerModel = require("../../model/customer.model.js")
const processModel = require("../../model/process.model.js")
const applicantModel = require("../../model/applicant.model.js")
const coApplicantModel = require("../../model/co-Applicant.model.js")
const guarantorModel = require("../../model/guarantorDetail.model.js")
const externalManagerModel = require('../../model/externalManager/externalVendorDynamic.model.js')
const NewbranchModel = require('../../model/adminMaster/newBranch.model.js')
const creditPdModel = require('../../model/credit.Pd.model.js')

const applicantKycModel = require("../../model/fileProcess/applicantKyc.model.js")
const coApplicantKycModel = require("../../model/fileProcess/coApplicantKyc.model.js")
const gtrKycModel = require("../../model/fileProcess/gtrKyc.model.js")
const cibilReportKycModel = require("../../model/fileProcess/cibilScoreKyc.model.js");

const bankStatementModel = require("../../model/branchPendency/bankStatementKyc.model.js")
const appPdcModel = require("../../model/branchPendency/appPdc.model.js")
const SignKycDetails = require("../../model/branchPendency/signkyc.model.js")
const OtherDocumentDetails = require("../../model/branchPendency/OtherDocument.model.js")
const gtrPdcModel = require("../../model/branchPendency/gtrPdc.model.js")
const propertyPapersKycModel = require("../../model/branchPendency/propertyPaper.model.js")
const nachRegistrationModel = require("../../model/branchPendency/nachRegistration.model.js")
const physicalFileCourierModel = require("../../model/physicalFileCourier.model.js")
const agricultureModel = require("../../model/branchPendency/agricultureIncomeModel.js");
const milkIncomeModel = require("../../model/branchPendency/milkIncomeModel.js");
const salaryAndOtherIncomeModel = require("../../model/branchPendency/salaryAndOtherIncomeModel.js");
const otherBuisnessModel = require("../../model/branchPendency/otherBusinessModel.js")
const rmPaymentUpdateModel = require("../../model/branchPendency/rmPaymentUpdateModel.js")
const incomeDetailModel = require('../../model/branchPendency/incomeDetails.model.js')

const samagraIdKycModel = require("../../model/branchPendency/samagraIdKyc.model.js")
const electricityBillKycModel = require("../../model/branchPendency/electricityKyc.model.js")
const udhyamKycModel = require("../../model/branchPendency/udhyamKyc.model.js")
const esignPhotoModel = require('../../model/branchPendency/esignPhoto.model.js')
const externalVendorModel = require("../../model/externalManager/externalVendorDynamic.model.js")
const vendorModel = require('../../model/adminMaster/employe.model.js')

const { branchPenencyGoogleSheet } = require('../../controller/branchPendency/branchGoogleSheet.controller.js')
const guarantorStatementDetails = require("../../model/branchPendency/gurrantorbankStatment.model.js")

const { salesToPdAllFilesDataGoogleSheet } = require('../../controller/googleSheet.controller.js')
const { bracnhPendencyFormsMailSend } = require('../../controller/MailFunction/salesMail.js')
const { applicantKycSheet, coApplicantKycSheet, gtrKycSheet, electricityBillSheet,
    samagraIdKycSheet, udhyamKycSheet, bankStatementKycSheet, propertyPaperKycSheet,
    appPdcSheet, technicalReportKycSheet, taggingKycSheet, rcuKycSheet, cibilReportKycSheet,
    jainamKycSheet, sentForSanctionKycSheet, postDisbursementKycSheet, sentForDisbursementKycSheet } = require("../../controller/fileProccess/kycFormGoogleSheet.controller.js")


const { cibilReportKycForm, technicalReportKycForm, taggingKycForm, rcuKycForm, jainamKycForm, pdReportKycForm, employeeData,
    sentForSanctionKycForm, postDisbursementKycForm, sentForDisbursementKycForm } = require("../../helper/allKycForm.helper.js");

const productModel = require("../../model/adminMaster/product.model.js")
const {finalApprovalSheet,fileProcessSheet } = require("../../controller/finalSanction/faGoogleSheet.controller.js");
const gurranterBankDetails = require("../../model/branchPendency/gurrantorbankStatment.model.js")


async function checkBranchFromsStatusUpdateOnGoogleSheet(customerId, tokenId, formStatus, formName, fileCompleteTime, FilesDocuments) {
    try {
        // console.log('Checking forms one by one...');

        const customerDetails = await customerModel.findById(customerId);
        if (!customerDetails) {
            console.log(`Customer with ID ${customerId} not found.`);
            return;
        }

        const externalVendorDetails = await externalVendorModel.findOne({ customerId });
        if (!externalVendorDetails || !externalVendorDetails.branchRequiredDocument) {
            console.log(`Branch required documents not found for customer ID ${customerId}.`);
            return;
        }

        const { branchRequiredDocument } = externalVendorDetails;
        const optionalForms = [
            'agricultureIncomeForm',
            'milkIncomeForm',
            'otherBuisnessForm',
            'salaryAndOtherIncomeForm',
        ];

        const sanctionForms = [
            'bankStatementForm',
            'electricityKycForm',
            'propertyPaperKycForm',
            'samagraIdKycForm',
            'udhyamKycForm',
        ];

        const disbursementForms = [
            'rmPaymentUpdateForm',
            'appPdcForm',
            'gtrPdcForm',
            'esignPhotoForm',
            'nachRegistrationKycForm',
            'physicalFileCourierForm',
            'signKycForm',
            'otherDocumentForm'
        ];

        const isFormsValid = (forms, validStatuses) =>
            forms.every(form => validStatuses.includes(branchRequiredDocument[form] || 'WIP'));

        const areOptionalFormsValid = isFormsValid(optionalForms, ['complete', 'notRequired', 'approve', 'notAssigned']);
        const areSanctionFormsValid = isFormsValid(sanctionForms, ['complete', 'approve', 'notAssigned']);
        const areDisbursementFormsValid = isFormsValid(disbursementForms, ['complete', 'approve', 'notAssigned']);

        const sanctionFormsStatusStr = areOptionalFormsValid && areSanctionFormsValid ? 'All Forms Complete' : 'All Not Complete';
        console.log('SANCTION FORM ', sanctionFormsStatusStr)
        const disbursementFormsStatusStr = areDisbursementFormsValid ? 'All Forms Complete' : 'All Not Complete';
        console.log('DISBURE-SEMENT FORM ', disbursementFormsStatusStr)

        const branchPendencyStatusStr = sanctionFormsStatusStr === 'All Forms Complete' && disbursementFormsStatusStr === 'All Forms Complete'
            ? 'complete'
            : 'WIP';

        const salesToPdSheet = {
            customerFinIdStr: customerDetails.customerFinId,
            branchPendencyStatusStr,
            sanctionFormsStatusStr,
            disbursementFormsStatusStr,
        };


        await salesToPdAllFilesDataGoogleSheet(salesToPdSheet);

        const branchPenencyStatusUpdateSheet = {
            sanctionFormsStatusStr: sanctionFormsStatusStr,
            disbursementFormsStatusStr: disbursementFormsStatusStr,
            customerFinIdStr: customerDetails.customerFinId ? customerDetails.customerFinId : ''
        }

        await branchPenencyGoogleSheet(branchPenencyStatusUpdateSheet)
    } catch (error) {
        console.error('Error while checking and updating Google Sheets:', error);
    }
}


async function SortEmployee(employeeId) {
    try {
        console.log("employeeId", employeeId);
        let branchIds = [];
        let employeeIds = [];

        const findEmployeeData = await employeModel.findOne({ _id: employeeId });
        if (!findEmployeeData) {
            console.log("Employee not found");
            return [];
        }

        const Id = "673ef4ef1c600b445add496a";

        if (findEmployeeData.branchId == Id) {
            branchIds.push(new ObjectId(Id));
        }

        console.log("ANIL sir ke branch:", findEmployeeData.branchId);


        const childBranches = await NewbranchModel.find({ regionalBranchId: new ObjectId(Id) }).select("_id");
        const childBranchIds = childBranches.map(branch => branch._id);

        if (findEmployeeData.branchId == Id || childBranchIds.includes(findEmployeeData.branchId)) {
            branchIds.push(...childBranches.map(branch => branch._id));
        }

        console.log("branchIds:", branchIds);

        const employees = await employeModel.find({ branchId: { $in: branchIds } }).select("_id");
        employeeIds = employees.map(emp => emp._id);
        console.log("employeeIds:", employeeIds);
        return employeeIds;
    } catch (error) {
        console.error("Error in SortEmployee:", error);
        throw error;
    }
}


async function SortCustomerInProcess(employeeIdList) {
    let data = await processModel.find({ employeId: { $in: employeeIdList } }).select("customerId").lean()
    let returnData = data.map(emp => emp.customerId);

    return returnData;

}


//Working Properly //
// async function branchVendorFormAssignList(req, res) {
//     try {
//         const employeeId = req.Id;z
//         let { status, page = 1, limit = 500, searchQuery } = req.query;

//         // Convert to integers
//         page = parseInt(page);
//         limit = parseInt(limit);
//         const skip = (page - 1) * limit;
//         let matchQuery = {}

//         // Validate status
//         const SortedEmployeeList = await SortEmployee(req.Id)
//         let sortedCustomerIds = await SortCustomerInProcess(SortedEmployeeList)

//         if (!status) {
//             return badRequest(res, "status is required");
//         }



//         if (status === 'all') {
//             if(sortedCustomerIds.length > 0){
//                 matchQuery.customerId = { $in: sortedCustomerIds };
//                 matchQuery.branchEmployeeId = null;
//                 matchQuery.fileStatus = "active";
//               }else{
//                 matchQuery.branchEmployeeId = null;
//                 matchQuery.fileStatus = "active";
//               }
//         } else {
//             matchQuery = {
//                 branchEmployeeId: new ObjectId(employeeId),
//                 branchStatus: status,
//                 fileStatus: "active",
//             }
//         };

//         // Add search conditions if searchQuery exists
//         if (searchQuery) {
//             matchQuery.$or = [
//                 { "applicantDetails.fullName": { $regex: searchQuery, $options: "i" } },
//                 { "customerdetails.customerFinId": { $regex: searchQuery, $options: "i" } },
//                 { "branchDetails.name": { $regex: searchQuery, $options: "i" } },
//                 { "applicantDetails.permanentAddress.city": { $regex: searchQuery, $options: "i" } }
//             ];
//         }

//         // Get total count for pagination
//         const totalCount = await externalVendorModel.aggregate([
//             {
//                 $lookup: {
//                     from: "customerdetails",
//                     localField: "customerId",
//                     foreignField: "_id",
//                     as: "customerdetails",
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "newbranches",
//                     localField: "customerdetails.branch",
//                     foreignField: "_id",
//                     as: "branchDetails",
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "applicantdetails",
//                     localField: "customerId",
//                     foreignField: "customerId",
//                     as: "applicantDetails",
//                 }
//             },
//             {
//                 $unwind: {
//                     path: "$customerdetails",
//                     preserveNullAndEmptyArrays: true,
//                 }
//             },
//             {
//                 $unwind: {
//                     path: "$branchDetails",
//                     preserveNullAndEmptyArrays: true,
//                 }
//             },
//             {
//                 $unwind: {
//                     path: "$applicantDetails",
//                     preserveNullAndEmptyArrays: true,
//                 }
//             },
//             {
//                 $match: matchQuery
//             },
//             {
//                 $count: "total"
//             }
//         ]);

//         const total = totalCount[0]?.total || 0;
//         const totalPages = Math.ceil(total / limit);

//         // Main query with pagination
//         const assignedDocs = await externalVendorModel.aggregate([
//             {
//                 $lookup: {
//                     from: "customerdetails",
//                     localField: "customerId",
//                     foreignField: "_id",
//                     as: "customerdetails",
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "newbranches",
//                     localField: "customerdetails.branch",
//                     foreignField: "_id",
//                     as: "branchDetails",
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "applicantdetails",
//                     localField: "customerId",
//                     foreignField: "customerId",
//                     as: "applicantDetails",
//                 }
//             },
//             {
//                 $unwind: {
//                     path: "$customerdetails",
//                     preserveNullAndEmptyArrays: true,
//                 }
//             },
//             {
//                 $unwind: {
//                     path: "$branchDetails",
//                     preserveNullAndEmptyArrays: true,
//                 }
//             },
//             {
//                 $unwind: {
//                     path: "$applicantDetails",
//                     preserveNullAndEmptyArrays: true,
//                 }
//             },
//             {
//                 $match: matchQuery
//             },
//             {
//                 $project: {
//                     _id: 1,
//                     remarkForBranch: 1,
//                     customerFinId: { $ifNull: ["$customerdetails.customerFinId", ""] },
//                     customerId: { $ifNull: ["$customerdetails._id", ""] },
//                     branchId: { $ifNull: ["$branchDetails._id", ""] },
//                     branchName: { $ifNull: ["$branchDetails.name", ""] },
//                     applicantEmail: { $ifNull: ["$applicantDetails.email", ""] },
//                     applicantFullName: { $ifNull: ["$applicantDetails.fullName", ""] },
//                     applicantCity: { $ifNull: ["$applicantDetails.permanentAddress.city", ""] },
//                     applicantState: { $ifNull: ["$applicantDetails.permanentAddress.state", ""] },
//                     applicantAddress: {
//                         $concat: [
//                             "$applicantDetails.permanentAddress.addressLine1",
//                             " ",
//                             "$applicantDetails.permanentAddress.addressLine2"
//                         ],
//                     }
//                 }
//             },
//             {
//                 $sort: { _id: -1 }
//             },
//             {
//                 $skip: skip
//             },
//             {
//                 $limit: limit
//             }
//         ]);

//         // return success(res, `${status.charAt(0).toUpperCase() + status.slice(1)} Documents assign List`, {
//         //     items: assignedDocs,
//         //     pagination: {
//         //         currentPage: page,
//         //         totalPages,
//         //         totalItems: total,
//         //         itemsPerPage: limit
//         //     }
//         // });



//         return success(res, `${status.charAt(0).toUpperCase() + status.slice(1)} Documents assign List`, assignedDocs);


//     } catch (error) {
//         console.error(error);
//         return unknownError(res, error);
//     }
// }


async function branchVendorFormAssignList(req, res) {
    try {
        const employeeId = req.Id;
        const findEmployeeData = await employeModel.findOne({ _id: employeeId });
        // console.log("BranchId", findEmployeeData.branchId)
        const branchId = findEmployeeData.branchId;


        let { status, page = 1, limit = 500, searchQuery } = req.query;

        // Convert to integers
        page = parseInt(page);
        limit = parseInt(limit);
        const skip = (page - 1) * limit;
        // Initialize matchQuery
        let matchQuery = { "customerdetails.branch": new ObjectId(branchId) };

        // Validate status
        const SortedEmployeeList = await SortEmployee(req.Id)
        let sortedCustomerIds = await SortCustomerInProcess(SortedEmployeeList)

        if (!status) {
            return badRequest(res, "status is required");
        }



        if (status === 'all') {
            if (sortedCustomerIds.length > 0) {
                matchQuery.customerId = { $in: sortedCustomerIds };
                // matchQuery.branchEmployeeId = null;
                matchQuery.branchStatus = 'fileAllowed';
                matchQuery.fileStatus = "active";
            } else {
                // matchQuery.branchEmployeeId = null;
                matchQuery.branchStatus = 'fileAllowed';
                matchQuery.fileStatus = "active";
            }
        } else {
            matchQuery = {
                branchEmployeeId: { $in: [new ObjectId(employeeId), null] },
                branchStatus: status,
                fileStatus: "active",

            }
        };

        console.log('matchQuery', matchQuery)

        // Add search conditions if searchQuery exists
        if (searchQuery) {
            matchQuery.$or = [
                { "applicantDetails.fullName": { $regex: searchQuery, $options: "i" } },
                { "customerdetails.customerFinId": { $regex: searchQuery, $options: "i" } },
                { "branchDetails.name": { $regex: searchQuery, $options: "i" } },
                { "applicantDetails.permanentAddress.city": { $regex: searchQuery, $options: "i" } }
            ];
        }

        // Get total count for pagination
        const totalCount = await externalVendorModel.aggregate([
            {
                $lookup: {
                    from: "customerdetails",
                    localField: "customerId",
                    foreignField: "_id",
                    as: "customerdetails",
                }
            },
            {
                $lookup: {
                    from: "newbranches",
                    localField: "customerdetails.branch",
                    foreignField: "_id",
                    as: "branchDetails",
                }
            },
            {
                $lookup: {
                    from: "applicantdetails",
                    localField: "customerId",
                    foreignField: "customerId",
                    as: "applicantDetails",
                }
            },
            {
                $unwind: {
                    path: "$customerdetails",
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $unwind: {
                    path: "$branchDetails",
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $unwind: {
                    path: "$applicantDetails",
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $match: matchQuery
            },
            {
                $count: "total"
            }
        ]);

        const total = totalCount[0]?.total || 0;
        const totalPages = Math.ceil(total / limit);

        // Main query with pagination
        const assignedDocs = await externalVendorModel.aggregate([
            {
                $lookup: {
                    from: "customerdetails",
                    localField: "customerId",
                    foreignField: "_id",
                    as: "customerdetails",
                }
            },
            {
                $lookup: {
                    from: "newbranches",
                    localField: "customerdetails.branch",
                    foreignField: "_id",
                    as: "branchDetails",
                }
            },
            {
                $lookup: {
                    from: "applicantdetails",
                    localField: "customerId",
                    foreignField: "customerId",
                    as: "applicantDetails",
                }
            },
            {
                $unwind: {
                    path: "$customerdetails",
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $unwind: {
                    path: "$branchDetails",
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $unwind: {
                    path: "$applicantDetails",
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $match: matchQuery
            },
            {
                $project: {
                    _id: 1,
                    remarkForBranch: 1,
                    customerFinId: { $ifNull: ["$customerdetails.customerFinId", ""] },
                    customerId: { $ifNull: ["$customerdetails._id", ""] },
                    branchId: { $ifNull: ["$branchDetails._id", ""] },
                    branchName: { $ifNull: ["$branchDetails.name", ""] },
                    applicantEmail: { $ifNull: ["$applicantDetails.email", ""] },
                    applicantFullName: { $ifNull: ["$applicantDetails.fullName", ""] },
                    applicantCity: { $ifNull: ["$applicantDetails.permanentAddress.city", ""] },
                    applicantState: { $ifNull: ["$applicantDetails.permanentAddress.state", ""] },
                    applicantAddress: {
                        $concat: [
                            "$applicantDetails.permanentAddress.addressLine1",
                            " ",
                            "$applicantDetails.permanentAddress.addressLine2"
                        ],
                    }
                }
            },
            {
                $sort: { _id: -1 }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            }
        ]);

        // return success(res, `${status.charAt(0).toUpperCase() + status.slice(1)} Documents assign List`, {
        //     items: assignedDocs,
        //     pagination: {
        //         currentPage: page,
        //         totalPages,
        //         totalItems: total,
        //         itemsPerPage: limit
        //     }
        // });



        return success(res, `${status.charAt(0).toUpperCase() + status.slice(1)} Documents assign List`, assignedDocs);


    } catch (error) {
        console.error(error);
        return unknownError(res, error);
    }
}



async function branchPendencyFileAccept(req, res) {
    try {
        const employeeId = req.Id;
        let { status, customerId } = req.query;

        if (!status) {
            return badRequest(res, "status is required");
        }

        if (!customerId) {
            return badRequest(res, "customerId is required");
        }

        await externalManagerModel.findOneAndUpdate({ customerId }, { branchStatus: 'WIP', branchEmployeeId: employeeId }, { new: true })
        success(res, `File ${status === "WIP" ? "Accept" : status} `, []);


    } catch (error) {
        console.error(error);
        return unknownError(res, error);
    }
}


// async function getAllFormFilesStatus(req, res) {
//     try {
//         const { customerId } = req.query;
//         if (!customerId || customerId.trim() === "") {
//             return badRequest(res, "customerId is required");
//         }

//         // Fetch customer data
//         const customerData = await customerModel.findById(customerId);
//         if (!customerData) {
//             return notFound(res, "Customer is not found", []);
//         }

//         // Fetch product data and permission forms
//         const productData = await productModel
//             .findOne({ _id: customerData.productId })
//             .populate("permissionFormId")
//             .lean();

//         const permissionFormId = productData?.permissionFormId;
//         const branchForms = permissionFormId?.branchForms || {};

//         // Fetch customer document data
//         const customerDocument = await externalManagerModel.findOne({ customerId });
//         if (!customerDocument) {
//             return notFound(res, "Customer document not found", []);
//         }

//         const branchRequiredDocument = customerDocument.branchRequiredDocument || {};

//         // Initialize grouped status
//         const groupedStatus = {
//             notAssign: {},
//             WIP: {},
//             complete: {},
//         };

//         // Process branchRequiredDocument and branchForms
//         const formFields = [
//             'agricultureIncomeForm', 'appPdcForm', 'bankStatementForm', 'electricityKycForm', 'esignPhotoForm',
//             'gtrPdcForm', 'milkIncomeForm', 'nachRegistrationKycForm', 'otherBuisnessForm', 'physicalFileCourierForm',
//             'propertyPaperKycForm', 'rmPaymentUpdateForm', 'salaryAndOtherIncomeForm', 'samagraIdKycForm',
//             'udhyamKycForm', 'otherDocumentForm', 'signKycForm', 'enachLink', 'appEsignLink'
//         ];

//         formFields.forEach((formName) => {
//             const isPermitted = branchForms[formName];
//             const status = branchRequiredDocument[formName] || "WIP";

//             if (isPermitted === false) {
//                 groupedStatus.notAssign[formName] = "notAssigned";
//             } else if (status === "WIP") {
//                 groupedStatus.WIP[formName] = "WIP";
//             } else if (["complete", "approve", "reject", "notRequired"].includes(status)) {
//                 groupedStatus.complete[formName] = status;
//             } else {
//                 // Default to WIP if status is not explicitly handled
//                 groupedStatus.WIP[formName] = "WIP";
//             }

//             // Ensure "WIP" status is added to the document for missing forms
//             if (!branchRequiredDocument[formName] && isPermitted !== false) {
//                 customerDocument.branchRequiredDocument[formName] = "WIP";
//             }
//         });

//         // Save updates to branchRequiredDocument
//         await customerDocument.save();

//         // Return grouped status
//         return success(res, "Branch Required Document Status", groupedStatus);
//     } catch (error) {
//         console.error(error);
//         unknownError(res, error);
//     }
// }



async function getAllFormFilesStatus(req, res) {
    try {
        const { customerId } = req.query;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }

        // Fetch customer data
        const customerData = await customerModel.findById(customerId);
        if (!customerData) {
            return notFound(res, "Customer is not found", []);
        }

        // Fetch product data and permission forms
        const productData = await productModel
            .findOne({ _id: customerData.productId })
            .populate("permissionFormId")
            .lean();

        const permissionFormId = productData?.permissionFormId;
        const branchForms = permissionFormId?.branchForms || {};

        // Fetch customer document data
        const customerDocument = await externalManagerModel.findOne({ customerId });
        if (!customerDocument) {
            return notFound(res, "Customer document not found", []);
        }

        const branchRequiredDocument = customerDocument.branchRequiredDocument || {};

        // Initialize grouped status
        const groupedStatus = {
            notAssign: {},
            WIP: {},
            complete: {},
        };

        // Form fields to process
        const formFields = [
            'agricultureIncomeForm', 'appPdcForm', 'bankStatementForm', 'electricityKycForm', 'esignPhotoForm',
            'gtrPdcForm', 'milkIncomeForm', 'nachRegistrationKycForm', 'otherBuisnessForm', 'physicalFileCourierForm',
            'propertyPaperKycForm', 'rmPaymentUpdateForm', 'salaryAndOtherIncomeForm', 'samagraIdKycForm',
            'udhyamKycForm', 'otherDocumentForm', 'signKycForm', 'enachLink', 'appEsignLink', 'incomeDetailForm'
        ];

        formFields.forEach((formName) => {
            const isPermitted = branchForms[formName]; // Check product permission for the form
            let status = branchRequiredDocument[formName];

            if (isPermitted === false) {
                groupedStatus.notAssign[formName] = "notAssigned";
                branchRequiredDocument[formName] = "notAssigned";
            } else {
                // If permission is true or undefined, check the status
                if (status === "reject") {
                    // If status is "reject", add to WIP but don't update the DB
                    groupedStatus.WIP[formName] = "reject";
                } else if (!status || status === "WIP") {
                    groupedStatus.WIP[formName] = "WIP";
                    branchRequiredDocument[formName] = "WIP";
                } else if (["complete", "approve", "notRequired"].includes(status)) {
                    groupedStatus.complete[formName] = status;
                } else {
                    // Default to WIP if status is not explicitly handled
                    groupedStatus.WIP[formName] = "WIP";
                    branchRequiredDocument[formName] = "WIP";
                }
            }
        });

        // Save updated branchRequiredDocument
        customerDocument.branchRequiredDocument = branchRequiredDocument;
        await customerDocument.save();

        // Return grouped status
        return success(res, "Branch Required Document Status", groupedStatus);
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}


// wrokking data //
// async function bankStatementKycForm(req, res) {
//     try {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({
//                 errorName: "serverValidation",
//                 errors: errors.array(),
//             });
//         }
//         const tokenId = new ObjectId(req.Id);
//         const completeDate = new Date().toString().split(' ').slice(0, 5).join(' ');
//         const vendorData = await vendorModel.findOne({ _id: tokenId, status: "active" });
//         if (!vendorData) {
//             return notFound(res, "Employee not found", []);
//         }
//         const { customerId, formStatus } = req.body;
//         // const { customerId, bankName, acHolderName, accountNumber, ifscCode, branchName, accountType, statementFromDate, statementToDate, } = req.body;

//         if (!customerId || customerId.trim() === "") {
//             return badRequest(res, "customerId is required");
//         }
//         const customerFind = await customerModel.findById(customerId)
//         if (!customerFind) {
//             return notFound(res, "customer Not Found", []);
//         }
//         const applicantFormFind = await applicantModel.findOne({ customerId })

//         const existingBankStatement = await bankStatementModel.findOne({ customerId });

//         let kycFormDetail;

//         if (existingBankStatement) {
//             const updatedEmployeeIds = existingBankStatement.employeeId || [];
//             if (!updatedEmployeeIds.some(id => id.toString() === vendorData._id.toString())) {
//                 updatedEmployeeIds.push(vendorData._id);
//             }
//             kycFormDetail = await bankStatementModel.findByIdAndUpdate(
//                 existingBankStatement._id,
//                 {
//                     ...req.body,
//                     employeeId: updatedEmployeeIds,
//                     customerName: applicantFormFind?.fullName ? applicantFormFind?.fullName : '',
//                     LD: customerFind?.customerFinId ? customerFind?.customerFinId : '',
//                     status: formStatus,
//                     completeDate: completeDate
//                 },
//                 { new: true }
//             );

//             if (formStatus === 'complete') {
//                 const bankStatementStatus = await externalManagerModel.findOneAndUpdate(
//                     { customerId: customerId },
//                     { $set: { "branchRequiredDocument.bankStatementForm": formStatus } },
//                     { new: true }
//                 );
//             }

//             success(res, "Bank Statement Form Updated Successfully", kycFormDetail);
//         } else {
//             kycFormDetail = await bankStatementModel.create({
//                 ...req.body,
//                 employeeId: [vendorData._id],
//                 customerName: applicantFormFind?.fullName ? applicantFormFind?.fullName : '',
//                 LD: customerFind?.customerFinId ? customerFind?.customerFinId : '',
//                 status: formStatus,
//                 completeDate: completeDate
//             });

//             if (formStatus === 'complete') {
//                 const bankStatementStatus = await externalManagerModel.findOneAndUpdate(
//                     { customerId: customerId },
//                     { $set: { "branchRequiredDocument.bankStatementForm": formStatus } },
//                     { new: true }
//                 );
//             }

//             success(res, "Bank Statement Form Created Successfully", kycFormDetail);
//         }

//         await checkBranchFromsStatusUpdateOnGoogleSheet(customerId, tokenId, formStatus, "Bank Statement", kycFormDetail.completeDate, kycFormDetail.bankStatementDocument)

//         const documentPaths = Array.isArray(kycFormDetail.bankStatementDocument)
//             ? kycFormDetail.bankStatementDocument
//             : [];

//         kycFormDetail.bankCompleteDate = kycFormDetail.completeDate
//         kycFormDetail.bankStatementDocumentData = kycFormDetail.bankStatementDocument,
//             kycFormDetail.customerFinIdStr = customerFind.customerFinId ? customerFind.customerFinId : ''
//         await branchPenencyGoogleSheet(kycFormDetail)

//         // kycFormDetail.customerFind = customerFind.customerFinId
//         // kycFormDetail.kycDocument = existingBankStatement.docuemnt
//         // await branchPendencyGoogleSheet(kycFormDetail)


//     } catch (error) {
//         console.error(error);
//         unknownError(res, error);
//     }
// }


async function bankStatementKycForm(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        const tokenId = new ObjectId(req.Id);
        const completeDate = new Date().toISOString();
        const vendorData = await employeModel.findOne({ _id: tokenId, status: "active" });

        if (!vendorData) {
            return badRequest(res, "Employee not found");
        }

        const { customerId, formStatus, bankDetails } = req.body;

        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return notFound(res, "customer Not Found");
        }

        const applicantFormFind = await applicantModel.findOne({ customerId });
        const existingBankStatement = await bankStatementModel.findOne({ customerId });
        // console.log(existingBankStatement,"existingBankStatementexistingBankStatementexistingBankStatement")
        let kycFormDetail;

        if (existingBankStatement) {
            const updatedEmployeeIds = existingBankStatement.employeeId || [];
            if (!updatedEmployeeIds.some(id => id.toString() === vendorData._id.toString())) {
                updatedEmployeeIds.push(vendorData._id);
            }


            kycFormDetail = await bankStatementModel.findByIdAndUpdate(
                existingBankStatement._id,
                {
                    ...req.body,
                    employeeId: updatedEmployeeIds,
                    LD: customerFind?.customerFinId || '',
                    status: formStatus,
                    completeDate: completeDate,
                    bankDetails: bankDetails || existingBankStatement.bankDetails,
                },
                { new: true }
            );
        } else {
            kycFormDetail = await bankStatementModel.create({
                ...req.body,
                employeeId: [vendorData._id],
                LD: customerFind?.customerFinId || '',
                status: formStatus,
                completeDate: completeDate,
                bankDetails: bankDetails || [],
            });
        }

        if (formStatus === 'complete') {
            await externalManagerModel.findOneAndUpdate(
                { customerId },
                { $set: { "branchRequiredDocument.bankStatementForm": formStatus } },
                { new: true }
            );
        }

        updateFields = {}
        const bankStatementDetails = await bankStatementModel.findOne({ customerId });
        // console.log(bankStatementDetails,"bankStatementDetails<><><><><><><>")

        // console.log(bankStatementDetails.bankDetails)
    if (bankStatementDetails?.bankDetails?.length > 0) {
        updateFields.bankDetailsFormStart = true;
        updateFields.bankDetailsFormComplete = true;
    }

    // Update process model if any flags are set
    if (Object.keys(updateFields).length > 0) {
        await processModel.findOneAndUpdate(
            { customerId },
            { $set: updateFields },
            { new: true }
        );
    }


        // await checkBranchFromsStatusUpdateOnGoogleSheet(
        //     customerId,
        //     tokenId,
        //     formStatus,
        //     "Bank Statement",
        //     kycFormDetail.completeDate,
        //     kycFormDetail.bankStatementDocument
        // );

        // await branchPenencyGoogleSheet({
        //     ...kycFormDetail._doc,
        //     bankCompleteDate: kycFormDetail.completeDate,
        //     bankStatementDocumentData: kycFormDetail.bankStatementDocument,
        //     customerFinIdStr: customerFind.customerFinId || '',
        // });

        success(res, "Bank Statement Form Updated Successfully", kycFormDetail);
        await processModel.findOneAndUpdate(
            { customerId },
            { $set: {
                bankDetailApplicant:true,
            } },
            { new: true }
        );
        // await finalApprovalSheet(customerId)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An unexpected error occurred", error });
    }
}


// post api updateGuarantorDetails //
const addOrUpdateGuarantorDetails = async (req, res) => {
    try {
        const { customerId, bankDetails, status,guarantorDetails } = req.body;

        if (!customerId) {
            return res.status(400).json({ message: "Customer ID is required" });
        }

        const customer = await customerModel.findById(customerId);
        if (!customer) {
            return res.status(400).json({ message: "Customer not found" });
        }

        let guarantorRecord = await guarantorStatementDetails.findOne({ customerId });

        if (!guarantorRecord) {
            // Pehla time record create ho raha hai
            guarantorRecord = await guarantorStatementDetails.create({
                customerId,
                guarantorDetails: guarantorDetails || [],
                bankDetails: bankDetails || [],
                employeeId: req.Id,
                status: status || "pending",
            });
        } else {
            guarantorRecord = await guarantorStatementDetails.findOneAndUpdate(
                { customerId },
                {
                    // $push: {
                    //     bankDetails: { $each: bankDetails || [] }
                    // },
                    $set: {
                        employeeId: req.Id,
                        status: status || "pending",
                        guarantorDetails: guarantorDetails || [],
                        bankDetails:bankDetails
                    }
                },
                { new: true }  // To return the updated document
            );            
        }

        let updateFields = {}

        if (guarantorRecord?.guarantorDetails?.length > 0) {
            updateFields.gurantorDetailsFormStart = true;
            updateFields.gurantorDetailsFormComplete = true;
        }

        // Process Model Update
        if (Object.keys(updateFields).length > 0) {
            const updatedProcess = await processModel.findOneAndUpdate(
                { customerId },
                { $set: updateFields },
                { new: true }
            );
            console.log("Process Model Updated:", updatedProcess);
        }

        // Bank Detail Update
        await processModel.findOneAndUpdate(
            { customerId },
            { $set: { bankDetailGtr: true } },
            { new: true }
        );

        return res.status(200).json({ message: "Guarantor details added/updated successfully", data: guarantorRecord });

    } catch (error) {
        console.error("Error in addOrUpdateGuarantorDetails:", error);
        return res.status(500).json({ message: "Internal Server Error", error });
    }
};

//update addTypeKey
const addTypeKey = async (req, res) => {
    try {
        const { customerId, typekeys  } = req.body;

        if (!customerId) {
            return res.status(400).json({ message: "Customer ID is required" });
        }

        const customer = await customerModel.findById(customerId);
        if (!customer) {
            return res.status(400).json({ message: "Customer not found" });
        }

        let guarantorRecord = await guarantorStatementDetails.findOne({ customerId });

            guarantorRecord = await guarantorStatementDetails.findOneAndUpdate(
                { customerId },
                {
                    $set: {
                        typekeys
                    }
                },
                { new: true,upsert:true }  // To return the updated document
            );            
        

        return res.status(200).json({ message: "Guarantor type added/updated successfully",data:guarantorRecord?.typekeys });

    } catch (error) {
        console.error("Error in addOrUpdateGuarantorDetails:", error);
        return res.status(500).json({ message: "Internal Server Error", error });
    }
};
// get api getGuarantorDetails //

const getGuarantorDetails = async (req, res) => {
    try {
        const { customerId, type } = req.query;

        if (!customerId) {
            return badRequest(res,"Customer ID is required")
        }
        
        if (!type) {
            return badRequest(res,"Type is required")
        }

        const customer = await customerModel.findById(customerId);
        if (!customer) {
            return badRequest(res,"Customer not found")
        }

        const guarantorRecord = await guarantorStatementDetails.findOne({ customerId });
        if (!guarantorRecord) {
            return badRequest(res,"Bank record not found")
        }

        console.log(guarantorRecord, "guarantorRecord");

        let filteredData = {};

        if (type === "coApplicant" || type === "guarantor") {
            filteredData.details = guarantorRecord.bankDetails.filter(item => item.Type === type);
        } else {
            return badRequest(res,"Bank record not found")
        }
        return success(res,"Bank details fetched successfully",{data: filteredData} )

    } catch (error) {
        console.error("Error in getGuarantorDetails:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


async function applicantPdcForm(req, res) {
    try {
        // Validate request body for errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        const tokenId = new ObjectId(req.Id);
        const completeDate = new Date().toString().split(' ').slice(0, 5).join(' ');
        const vendorData = await vendorModel.findOne({ _id: tokenId, status: "active" });
        if (!vendorData) {
            return notFound(res, "Employee not found", []);
        }
        const { customerId, formStatus } = req.body;

        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }
        const customerFind = await customerModel.findById(customerId)
        if (!customerFind) {
            return notFound(res, "customer Not Found", []);
        }
        const applicantFormFind = await applicantModel.findOne({ customerId })

        const existingAppPdc = await appPdcModel.findOne({ customerId });

        let pdcDetail;

        if (existingAppPdc) {
            const updatedEmployeeIds = existingAppPdc.employeeId || [];
            if (!updatedEmployeeIds.some(id => id.toString() === vendorData._id.toString())) {
                updatedEmployeeIds.push(vendorData._id);
            }

            pdcDetail = await appPdcModel.findByIdAndUpdate(
                existingAppPdc._id,
                {
                    ...req.body,
                    employeeId: updatedEmployeeIds,
                    customerName: applicantFormFind?.fullName ? applicantFormFind?.fullName : '',
                    LD: customerFind?.customerFinId ? customerFind?.customerFinId : '',
                    status: formStatus,
                    completeDate: completeDate
                },
                { new: true }
            );


            if (formStatus === 'complete') {
                const appPdcFormStatus = await externalManagerModel.findOneAndUpdate(
                    { customerId: customerId },
                    { $set: { "branchRequiredDocument.appPdcForm": formStatus } },
                    { new: true }
                );
            }

            success(res, "Applicant Pdc Form Updated Successfully", pdcDetail);
        } else {
            pdcDetail = await appPdcModel.create({
                ...req.body,
                employeeId: [vendorData._id],
                customerName: applicantFormFind?.fullName ? applicantFormFind?.fullName : '',
                LD: customerFind?.customerFinId ? customerFind?.customerFinId : '',
                status: formStatus,
                completeDate: completeDate
            });

            if (formStatus === 'complete') {
                const appPdcFormStatus = await externalManagerModel.findOneAndUpdate(
                    { customerId: customerId },
                    { $set: { "branchRequiredDocument.appPdcForm": formStatus } },
                    { new: true }
                );
            }

            success(res, "Applicant Pdc Form Created Successfully", pdcDetail);
        }

        await checkBranchFromsStatusUpdateOnGoogleSheet(customerId, tokenId, formStatus, "Applicant Pdc", pdcDetail.completeDate, pdcDetail.applicantPdcDocument)

        const allDocument = [
            ...(pdcDetail?.applicantPdcDocument ?? []),
            ...(pdcDetail?.applicantBsvDocument ?? [])
        ];

        pdcDetail.appPdcCompleteDate = pdcDetail.completeDate
        pdcDetail.applicantPdcDocumentData = allDocument,
            pdcDetail.customerFinIdStr = customerFind.customerFinId ? customerFind.customerFinId : ''
        await branchPenencyGoogleSheet(pdcDetail)

    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}

//   Others Document Form Post // 
async function OtherDocumentForm(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });

        }
        const tokenId = new ObjectId(req.Id);
        const completeDate = new Date().toString().split(' ').slice(0, 5).join(' ');
        const vendorData = await vendorModel.findOne({ _id: tokenId, status: "active" });
        if (!vendorData) {
            return notFound(res, "Employee not found", []);
        }
        const { customerId, formStatus } = req.body;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }

        const customerFind = await customerModel.findById(customerId)
        if (!customerFind) {
            return notFound(res, "customer Not Found", []);
        }

        const applicantFormFind = await applicantModel.findOne({ customerId })
        const existingOtherDocument = await OtherDocumentDetails.findOne({ customerId });
        let otherDocumentDetail;
        if (existingOtherDocument) {
            const updatedEmployeeIds = existingOtherDocument.employeeId || [];
            if (!updatedEmployeeIds.some(id => id.toString() === vendorData._id.toString())) {
                updatedEmployeeIds.push(vendorData._id);
            }
            otherDocumentDetail = await OtherDocumentDetails.findByIdAndUpdate(
                existingOtherDocument._id,
                {
                    ...req.body,
                    employeeId: updatedEmployeeIds,
                    customerName: applicantFormFind?.fullName ? applicantFormFind?.fullName : '',
                    LD: customerFind?.customerFinId ? customerFind?.customerFinId : '',
                    status: formStatus,
                    completeDate: completeDate
                },
                { new: true }
            );

            if (formStatus === 'complete') {
                const otherDocumentStatus = await externalManagerModel.findOneAndUpdate(
                    { customerId: customerId },
                    { $set: { "branchRequiredDocument.otherDocumentForm": formStatus } },
                    { new: true }
                );
            }

            success(res, "Other Document Form Updated Successfully", otherDocumentDetail);

        }
        else {
            otherDocumentDetail = await OtherDocumentDetails.create({
                ...req.body,
                employeeId: [vendorData._id],
                customerName: applicantFormFind?.fullName ? applicantFormFind?.fullName : '',
                LD: customerFind?.customerFinId ? customerFind?.customerFinId : '',
                status: formStatus,
                completeDate: completeDate
            });

            if (formStatus === 'complete') {
                const otherDocumentStatus = await externalManagerModel.findOneAndUpdate(
                    { customerId: customerId },
                    { $set: { "branchRequiredDocument.otherDocumentForm": formStatus } },
                    { new: true }
                );
            }

            success(res, "Other Document Form Created Successfully", otherDocumentDetail);
        }

        const documentData = otherDocumentDetail.AddDocument || [];
        const allUploadDocuments = documentData.flatMap(doc => doc.UploadDocument || []);
        otherDocumentDetail.otherDocumentCompleteDate = otherDocumentDetail.completeDate
        otherDocumentDetail.otherDocumentDataStr = allUploadDocuments,
            otherDocumentDetail.customerFinIdStr = customerFind.customerFinId ? customerFind.customerFinId : ''
        await branchPenencyGoogleSheet(otherDocumentDetail)

    }
    catch (error) {
        console.error(error);
        unknownError(res, error);
    }

}

// Signature Form Post // 
async function SignKycForm(req, res) {
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });

        }
        const tokenId = new ObjectId(req.Id);
        const completeDate = new Date().toString().split(' ').slice(0, 5).join(' ');
        const vendorData = await vendorModel.findOne({ _id: tokenId, status: "active" });
        if (!vendorData) {
            return notFound(res, "Employee not found", []);
        }
        const { customerId, formStatus } = req.body;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }

        const customerFind = await customerModel.findById(customerId)
        if (!customerFind) {
            return notFound(res, "customer Not Found", []);
        }

        const applicantFormFind = await applicantModel.findOne({ customerId })
        const existingSignKyc = await SignKycDetails.findOne({ customerId });
        let signKycDetail;
        if (existingSignKyc) {
            signKycDetail = await SignKycDetails.findByIdAndUpdate(
                existingSignKyc._id,
                {
                    ...req.body,
                    employeeId: vendorData._id,
                    customerName: applicantFormFind?.fullName ? applicantFormFind?.fullName : '',
                    LD: customerFind?.customerFinId ? customerFind?.customerFinId : '',
                    status: formStatus,
                    completeDate: completeDate
                },
                { new: true }
            );

            if (formStatus === 'complete') {
                const signKycStatus = await externalManagerModel.findOneAndUpdate(
                    { customerId: customerId },
                    { $set: { "branchRequiredDocument.signKycForm": formStatus } },
                    { new: true }
                );
            }

            success(res, "Sign Kyc Form Updated Successfully", signKycDetail);

        }
        else {
            signKycDetail = await SignKycDetails.create({
                ...req.body,
                employeeId: vendorData._id,
                customerName: applicantFormFind?.fullName ? applicantFormFind?.fullName : '',
                LD: customerFind?.customerFinId ? customerFind?.customerFinId : '',
                status: formStatus,
                completeDate: completeDate
            });

            if (formStatus === 'complete') {
                const signKycStatus = await externalManagerModel.findOneAndUpdate(
                    { customerId: customerId },
                    { $set: { "branchRequiredDocument.signKycForm": formStatus } },
                    { new: true }
                )
            }
            success(res, "Sign Kyc Form Created Successfully", signKycDetail);

        }
        // await checkBranchFromsStatusUpdateOnGoogleSheet(customerId, tokenId, formStatus, "Sign Kyc", signKycDetail.completeDate,)

        const allFileDoc = [
            ...(Array.isArray(signKycDetail.ApplicantSignDocument) ? signKycDetail.ApplicantSignDocument : []),
            ...(Array.isArray(signKycDetail.coApplicantSignDocument) ? signKycDetail.coApplicantSignDocument : []),
            ...(Array.isArray(signKycDetail.guarantorSignDocument) ? signKycDetail.guarantorSignDocument : [])
        ];
        const documentPaths = Array.isArray(allFileDoc)
            ? allFileDoc
            : [];

        console.log('allFileDoc--', documentPaths)
        signKycDetail.signKycCompleteDate = signKycDetail.completeDate
        signKycDetail.signKycDocumentDataStr = allFileDoc,
            signKycDetail.customerFinIdStr = customerFind.customerFinId ? customerFind.customerFinId : ''

        console.log('signKycDetail.signKycDocumentData--', signKycDetail.signKycDocumentData)
        await branchPenencyGoogleSheet(signKycDetail)

        // const documentPaths = Array.isArray(signKycDetail.signKycDocument)
        // ? signKycDetail.signKycDocument
        // :[];
        // signKycDetail.signKycCompleteDate = signKycDetail.completeDate
        // signKycDetail.signKycDocumentData = documentPaths.map(path => `${process.env.BASE_URL}${path}`),
        // signKycDetail.customerFinIdStr = customerFind.customerFinId ? customerFind.customerFinId : ''
    }
    catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}

async function guarantorPdcForm(req, res) {
    try {
        // Validate request body for errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        const tokenId = new ObjectId(req.Id);
        const completeDate = new Date().toString().split(' ').slice(0, 5).join(' ');
        const vendorData = await vendorModel.findOne({ _id: tokenId, status: "active" });
        if (!vendorData) {
            return notFound(res, "Employee not found", []);
        }
        const { customerId, formStatus } = req.body;

        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }
        const customerFind = await customerModel.findById(customerId)
        if (!customerFind) {
            return notFound(res, "customer Not Found", []);
        }
        const applicantFormFind = await applicantModel.findOne({ customerId })

        const existingGtrPdc = await gtrPdcModel.findOne({ customerId });

        let pdcDetail;

        if (existingGtrPdc) {

            const updatedEmployeeIds = existingGtrPdc.employeeId || [];
            if (!updatedEmployeeIds.some(id => id.toString() === vendorData._id.toString())) {
                updatedEmployeeIds.push(vendorData._id);
            }
            pdcDetail = await gtrPdcModel.findByIdAndUpdate(
                existingGtrPdc._id,
                {
                    ...req.body,
                    employeeId: updatedEmployeeIds,
                    customerName: applicantFormFind?.fullName ? applicantFormFind?.fullName : '',
                    LD: customerFind?.customerFinId ? customerFind?.customerFinId : '',
                    status: formStatus,
                    completeDate: completeDate
                },
                { new: true }
            );

            if (formStatus === 'complete') {
                const gtrPdcFormStatus = await externalManagerModel.findOneAndUpdate(
                    { customerId: customerId },
                    { $set: { "branchRequiredDocument.gtrPdcForm": formStatus } },
                    { new: true }
                );
            }
            success(res, "Gtr Pdc Form Updated Successfully", pdcDetail);
        } else {
            pdcDetail = await gtrPdcModel.create({
                ...req.body,
                employeeId: [vendorData._id],
                customerName: applicantFormFind?.fullName ? applicantFormFind?.fullName : '',
                LD: customerFind?.customerFinId ? customerFind?.customerFinId : '',
                status: formStatus,
                completeDate: completeDate
            });

            if (formStatus === 'complete') {
                const gtrPdcFormStatus = await externalManagerModel.findOneAndUpdate(
                    { customerId: customerId },
                    { $set: { "branchRequiredDocument.gtrPdcForm": formStatus } },
                    { new: true }
                );
            }
            success(res, "Gtr Pdc Form Created Successfully", pdcDetail);
        }

        await checkBranchFromsStatusUpdateOnGoogleSheet(customerId, tokenId, formStatus, "Guarantor Pdc", pdcDetail.completeDate, pdcDetail.guarantorPdcDocument)

        const allDocument = [
            ...(pdcDetail?.guarantorPdcDocument ?? []),
            ...(pdcDetail?.guarantorBsvDocument ?? [])
        ];
        pdcDetail.gtrCompleteDate = pdcDetail.completeDate
        pdcDetail.guarantorPdcDocumentData = allDocument,
            pdcDetail.customerFinIdStr = customerFind.customerFinId ? customerFind.customerFinId : ''
        await branchPenencyGoogleSheet(pdcDetail)
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}

async function propertyPapersKycForm(req, res) {
    try {
        // Validate request body for errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }


        const tokenId = new ObjectId(req.Id);
        console.log('tokenId--', tokenId)
        const completeDate = new Date().toString().split(' ').slice(0, 5).join(' ');
        const vendorData = await vendorModel.findOne({ _id: tokenId });
        // console.log('670d05d6da45c1ee46247454',vendorData)
        if (!vendorData) {
            return notFound(res, "Employee not found", []);
        }
        const { customerId, formStatus } = req.body;

        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }
        const customerFind = await customerModel.findById(customerId)
        if (!customerFind) {
            return notFound(res, "customer Not Found", []);
        }
        const applicantFormFind = await applicantModel.findOne({ customerId })

        const existingPropertyData = await propertyPapersKycModel.findOne({ customerId });

        let pdcDetail;

        if (existingPropertyData) {
            const updatedEmployeeIds = existingPropertyData.employeeId || [];
            if (!updatedEmployeeIds.some(id => id.toString() === vendorData._id.toString())) {
                updatedEmployeeIds.push(vendorData._id);
            }

            pdcDetail = await propertyPapersKycModel.findByIdAndUpdate(
                existingPropertyData._id,
                {
                    ...req.body,
                    employeeId: updatedEmployeeIds,
                    customerName: applicantFormFind?.fullName ? applicantFormFind?.fullName : '',
                    LD: customerFind?.customerFinId ? customerFind?.customerFinId : '',
                    status: formStatus,
                    completeDate: completeDate
                },
                { new: true }
            );

            if (formStatus === 'complete') {
                const propertyPaperKycFormStatus = await externalManagerModel.findOneAndUpdate(
                    { customerId: customerId },
                    { $set: { "branchRequiredDocument.propertyPaperKycForm": formStatus } },
                    { new: true }
                );
            }

            success(res, "Property Papers Form Updated Successfully", pdcDetail);
        } else {
            pdcDetail = await propertyPapersKycModel.create({
                ...req.body,
                employeeId: [vendorData._id],
                customerName: applicantFormFind?.fullName ? applicantFormFind?.fullName : '',
                LD: customerFind?.customerFinId ? customerFind?.customerFinId : '',
                status: formStatus,
                completeDate: completeDate
            });


            if (formStatus === 'complete') {
                const propertyPaperKycFormStatus = await externalManagerModel.findOneAndUpdate(
                    { customerId: customerId },
                    { $set: { "branchRequiredDocument.propertyPaperKycForm": formStatus } },
                    { new: true }
                );
            }

            success(res, "Property Papers Form Created Successfully", pdcDetail);
        }

        await checkBranchFromsStatusUpdateOnGoogleSheet(customerId, tokenId, formStatus, "Property Paper Kyc", pdcDetail.completeDate, pdcDetail.propertyPapersKycDocument)

        const documentPaths = Array.isArray(pdcDetail.propertyPapersKycDocument)
            ? pdcDetail.propertyPapersKycDocument
            : [];

        pdcDetail.propertyCompleteDate = pdcDetail.completeDate
        pdcDetail.propertyPapersKycDocumentData = pdcDetail.propertyPapersKycDocument,
            pdcDetail.customerFinIdStr = customerFind.customerFinId ? customerFind.customerFinId : ''
        await branchPenencyGoogleSheet(pdcDetail)

    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}

async function nachRegistrationKycForm(req, res) {
    try {
        // Validate request body for errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }
        const tokenId = new ObjectId(req.Id);
        const completeDate = new Date().toString().split(' ').slice(0, 5).join(' ');
        const vendorData = await vendorModel.findOne({ _id: tokenId, status: "active" });
        if (!vendorData) {
            return notFound(res, "Employee not found", []);
        }
        const { customerId, formStatus } = req.body;

        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }
        const customerFind = await customerModel.findById(customerId)
        if (!customerFind) {
            return notFound(res, "customer Not Found", []);
        }
        const applicantFormFind = await applicantModel.findOne({ customerId })

        const existingNachData = await nachRegistrationModel.findOne({ customerId });

        let pdcDetail;

        if (existingNachData) {
            const updatedEmployeeIds = existingNachData.employeeId || [];
            if (!updatedEmployeeIds.some(id => id.toString() === vendorData._id.toString())) {
                updatedEmployeeIds.push(vendorData._id);
            }
            pdcDetail = await nachRegistrationModel.findByIdAndUpdate(
                existingNachData._id,
                {
                    ...req.body,
                    employeeId: updatedEmployeeIds,
                    customerName: applicantFormFind?.fullName ? applicantFormFind?.fullName : '',
                    LD: customerFind?.customerFinId ? customerFind?.customerFinId : '',
                    status: formStatus,
                    completeDate: completeDate
                },
                { new: true }
            );


            if (formStatus === 'complete') {
                const nachRegistrationKycFormStatus = await externalManagerModel.findOneAndUpdate(
                    { customerId: customerId },
                    { $set: { "branchRequiredDocument.nachRegistrationKycForm": formStatus } },
                    { new: true }
                );
            }

            success(res, "Nach Registration Form Updated Successfully", pdcDetail);
        } else {
            pdcDetail = await nachRegistrationModel.create({
                ...req.body,
                employeeId: [vendorData._id],
                customerName: applicantFormFind?.fullName ? applicantFormFind?.fullName : '',
                LD: customerFind?.customerFinId ? customerFind?.customerFinId : '',
                status: formStatus,
                completeDate: completeDate
            });

            if (formStatus === 'complete') {
                const nachRegistrationKycFormStatus = await externalManagerModel.findOneAndUpdate(
                    { customerId: customerId },
                    { $set: { "branchRequiredDocument.nachRegistrationKycForm": formStatus } },
                    { new: true }
                );
            }

            success(res, "Nach Registration Form Created Successfully", pdcDetail);
        }

        await checkBranchFromsStatusUpdateOnGoogleSheet(customerId, tokenId, formStatus, "Nach Registration Kyc", pdcDetail.completeDate, pdcDetail.nachRegistrationKycDocument)

        const documentPaths = Array.isArray(pdcDetail.nachRegistrationKycDocument)
            ? pdcDetail.nachRegistrationKycDocument
            : [];

        pdcDetail.nachRegisCompleteDate = pdcDetail.completeDate
        pdcDetail.nachRegistrationKycDocumentData = pdcDetail.nachRegistrationKycDocument,
            pdcDetail.customerFinIdStr = customerFind.customerFinId ? customerFind.customerFinId : ''
        await branchPenencyGoogleSheet(pdcDetail)

    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}


async function agricultureForm(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        const tokenId = new ObjectId(req.Id);
        const completeDate = new Date().toString().split(' ').slice(0, 5).join(' ');
        const vendorData = await vendorModel.findOne({ _id: tokenId, status: "active" });
        if (!vendorData) {
            return badRequest(res, "Employee not found", []);

        }

        const { customerId, formStatus } = req.body;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");

        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return badRequest(res, "Customer Not Found");

        }

        const existingAgriDetail = await agricultureModel.findOne({ customerId });
        let agriDetail;

        if (existingAgriDetail) {
            const updatedEmployeeIds = existingAgriDetail.employeeId || [];
            if (!updatedEmployeeIds.some(id => id.toString() === vendorData._id.toString())) {
                updatedEmployeeIds.push(vendorData._id);
            }
            agriDetail = await agricultureModel.findByIdAndUpdate(
                existingAgriDetail._id,
                {
                    ...req.body,
                    employeeId: updatedEmployeeIds,
                    customerName: customerFind.fullName || '',
                    LD: customerFind.customerFinId || '',
                    status: formStatus || 'pending',
                    completeDate: completeDate
                },
                { new: true }
            );

            if (formStatus === 'complete') {
                await externalManagerModel.findOneAndUpdate(
                    { customerId: customerId },
                    { $set: { "branchRequiredDocument.agricultureIncomeForm": formStatus } },
                    { new: true }
                );
            }
            success(res, "Agriculture Income Form Update Successfully", agriDetail);

        } else {
            agriDetail = await agricultureModel.create({
                ...req.body,
                employeeId: [vendorData._id],
                customerName: customerFind.fullName || '',
                LD: customerFind.customerFinId || '',
                status: formStatus || 'pending',
                completeDate: completeDate
            });

            if (formStatus === 'complete') {
                await externalManagerModel.findOneAndUpdate(
                    { customerId: customerId },
                    { $set: { "branchRequiredDocument.agricultureIncomeForm": formStatus } },
                    { new: true }
                );
            }
            success(res, "Agriculture Income Form Created Successfully", agriDetail);
        }

        await checkBranchFromsStatusUpdateOnGoogleSheet(customerId, tokenId, formStatus, "Agriculture Income", agriDetail.completeDate, agriDetail.agricultureDocument)

        const documentPaths = Array.isArray(agriDetail.agricultureDocument)
            ? agriDetail.agricultureDocument
            : [];
        agriDetail.incomeCompleteDate1 = agriDetail.completeDate
        agriDetail.agricultureDocumentData = agriDetail.agricultureDocument,
            agriDetail.customerFinIdStr = customerFind.customerFinId ? customerFind.customerFinId : ''
        await branchPenencyGoogleSheet(agriDetail)
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}

async function milkIncomeForm(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        const tokenId = new ObjectId(req.Id);
        const completeDate = new Date().toString().split(' ').slice(0, 5).join(' ');
        const vendorData = await vendorModel.findOne({ _id: tokenId, status: "active" });
        if (!vendorData) {
            return badRequest(res, "Employee not found", []);

        }

        const { customerId, formStatus } = req.body;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");

        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return badRequest(res, "Customer Not Found");

        }

        const existingAgriDetail = await milkIncomeModel.findOne({ customerId });
        let MilkDetail;

        if (existingAgriDetail) {

            const updatedEmployeeIds = existingAgriDetail.employeeId || [];
            if (!updatedEmployeeIds.some(id => id.toString() === vendorData._id.toString())) {
                updatedEmployeeIds.push(vendorData._id);
            }
            MilkDetail = await milkIncomeModel.findByIdAndUpdate(
                existingAgriDetail._id,
                {
                    ...req.body,
                    employeeId: updatedEmployeeIds,
                    customerName: customerFind.fullName || '',
                    LD: customerFind.customerFinId || '',
                    status: formStatus || 'pending',
                    completeDate: completeDate
                },
                { new: true }
            );

            if (formStatus === 'complete') {
                await externalManagerModel.findOneAndUpdate(
                    { customerId: customerId },
                    { $set: { "branchRequiredDocument.milkIncomeForm": formStatus } },
                    { new: true }
                );
            }

            success(res, "Milk Income Form Update Successfully", MilkDetail);

        } else {
            MilkDetail = await milkIncomeModel.create({
                ...req.body,
                employeeId: [vendorData._id],
                customerName: customerFind.fullName || '',
                LD: customerFind.customerFinId || '',
                status: formStatus || 'pending',
                completeDate: completeDate
            });

            if (formStatus === 'complete') {
                await externalManagerModel.findOneAndUpdate(
                    { customerId: customerId },
                    { $set: { "branchRequiredDocument.milkIncomeForm": formStatus } },
                    { new: true }
                );
            }

            success(res, "Milk Income Form Created Successfully", MilkDetail);

        }

        await checkBranchFromsStatusUpdateOnGoogleSheet(customerId, tokenId, formStatus, "Milk Income", MilkDetail.completeDate, MilkDetail.milkDocument)

        const documentPaths = Array.isArray(MilkDetail.milkDocument)
            ? MilkDetail.milkDocument
            : [];
        MilkDetail.incomeCompleteDate2 = MilkDetail.completeDate
        MilkDetail.milkDocumentData = MilkDetail.milkDocument,
            MilkDetail.customerFinIdStr = customerFind.customerFinId ? customerFind.customerFinId : ''
        await branchPenencyGoogleSheet(MilkDetail)
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}

async function salaryAndOtherIncomeForm(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        const tokenId = new ObjectId(req.Id);
        const completeDate = new Date().toString().split(' ').slice(0, 5).join(' ');
        const vendorData = await vendorModel.findOne({ _id: tokenId, status: "active" });
        if (!vendorData) {
            return badRequest(res, "Employee not found", []);

        }

        const { customerId, formStatus } = req.body;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");

        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return badRequest(res, "Customer Not Found");

        }

        const existingsalaryDetail = await salaryAndOtherIncomeModel.findOne({ customerId });
        let salaryDetail;

        if (existingsalaryDetail) {
            const updatedEmployeeIds = existingsalaryDetail.employeeId || [];
            if (!updatedEmployeeIds.some(id => id.toString() === vendorData._id.toString())) {
                updatedEmployeeIds.push(vendorData._id);
            }
            salaryDetail = await salaryAndOtherIncomeModel.findByIdAndUpdate(
                existingsalaryDetail._id,
                {
                    ...req.body,
                    employeeId: updatedEmployeeIds,
                    customerName: customerFind.fullName || '',
                    LD: customerFind.customerFinId || '',
                    status: formStatus || 'pending',
                    completeDate: completeDate
                },
                { new: true }
            );

            if (formStatus === 'complete') {
                await externalManagerModel.findOneAndUpdate(
                    { customerId: customerId },
                    { $set: { "branchRequiredDocument.salaryAndOtherIncomeForm": formStatus } },
                    { new: true }
                );
            }
            success(res, "Salary & other income Form Update Successfully", salaryDetail);

        } else {
            salaryDetail = await salaryAndOtherIncomeModel.create({
                ...req.body,
                employeeId: [vendorData._id],
                customerName: customerFind.fullName || '',
                LD: customerFind.customerFinId || '',
                status: formStatus || 'pending',
                completeDate: completeDate
            });
            if (formStatus === 'complete') {
                await externalManagerModel.findOneAndUpdate(
                    { customerId: customerId },
                    { $set: { "branchRequiredDocument.salaryAndOtherIncomeForm": formStatus } },
                    { new: true }
                );
            }

            success(res, "Salary & other income Form Created Successfully", salaryDetail);

        }

        await checkBranchFromsStatusUpdateOnGoogleSheet(customerId, tokenId, formStatus, "Salary And Other Income", salaryDetail.completeDate, salaryDetail.salaryOtherIncomeSource)

        const documentPaths = Array.isArray(salaryDetail.salaryOtherIncomeSource)
            ? salaryDetail.salaryOtherIncomeSource
            : [];
        salaryDetail.incomeCompleteDate3 = salaryDetail.completeDate
        salaryDetail.salaryOtherIncomeSourceData = salaryDetail.salaryOtherIncomeSource,
            salaryDetail.customerFinIdStr = customerFind.customerFinId ? customerFind.customerFinId : ''
        await branchPenencyGoogleSheet(salaryDetail)
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}

async function otherBuisnessModelForm(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        const tokenId = new ObjectId(req.Id);
        const completeDate = new Date().toString().split(' ').slice(0, 5).join(' ');
        const vendorData = await vendorModel.findOne({ _id: tokenId, status: "active" });
        if (!vendorData) {
            return badRequest(res, "Employee not found", []);

        }

        const { customerId, formStatus } = req.body;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");

        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return badRequest(res, "Customer Not Found");

        }

        const existingotherBuisnessDetail = await otherBuisnessModel.findOne({ customerId });
        let salaryDetail;

        if (existingotherBuisnessDetail) {
            const updatedEmployeeIds = existingotherBuisnessDetail.employeeId || [];
            if (!updatedEmployeeIds.some(id => id.toString() === vendorData._id.toString())) {
                updatedEmployeeIds.push(vendorData._id);
            }
            salaryDetail = await otherBuisnessModel.findByIdAndUpdate(
                existingotherBuisnessDetail._id,
                {
                    ...req.body,
                    employeeId: updatedEmployeeIds,
                    customerName: customerFind.fullName || '',
                    LD: customerFind.customerFinId || '',
                    status: formStatus || 'pending',
                    completeDate: completeDate
                },
                { new: true }
            );

            if (formStatus === 'complete') {
                await externalManagerModel.findOneAndUpdate(
                    { customerId: customerId },
                    { $set: { "branchRequiredDocument.otherBuisnessForm": formStatus } },
                    { new: true }
                );
            }
            success(res, "Other Buisness Form Update Successfully", salaryDetail);

        } else {
            salaryDetail = await otherBuisnessModel.create({
                ...req.body,
                employeeId: [vendorData._id],
                customerName: customerFind.fullName || '',
                LD: customerFind.customerFinId || '',
                status: formStatus || 'pending',
                completeDate: completeDate
            });

            if (formStatus === 'complete') {
                await externalManagerModel.findOneAndUpdate(
                    { customerId: customerId },
                    { $set: { "branchRequiredDocument.otherBuisnessForm": formStatus } },
                    { new: true }
                );
            }

            success(res, "Other Buisness Form Created Successfully", salaryDetail);
        }

        await checkBranchFromsStatusUpdateOnGoogleSheet(customerId, tokenId, formStatus, "Other Buisness", salaryDetail.completeDate, salaryDetail.otherBusinessDocument)

        const documentPaths = Array.isArray(salaryDetail.otherBusinessDocument)
            ? salaryDetail.otherBusinessDocument
            : [];
        salaryDetail.otherBusinessDate = salaryDetail.completeDate
        salaryDetail.otherBusinessDocumentData = salaryDetail.otherBusinessDocument,
            salaryDetail.customerFinIdStr = customerFind.customerFinId ? customerFind.customerFinId : ''
        await branchPenencyGoogleSheet(salaryDetail)
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}

async function rmPaymentUpdateForm(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        const tokenId = new ObjectId(req.Id);
        const completeDate = new Date().toString().split(' ').slice(0, 5).join(' ');
        const vendorData = await vendorModel.findOne({ _id: tokenId, status: "active" });
        if (!vendorData) {
            return badRequest(res, "Employee not found", []);

        }

        const { customerId, formStatus } = req.body;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");

        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return badRequest(res, "Customer Not Found");

        }

        const rmPaymentUpdateDetails = await rmPaymentUpdateModel.findOne({ customerId });
        let salaryDetail;

        if (rmPaymentUpdateDetails) {

            const updatedEmployeeIds = rmPaymentUpdateDetails.employeeId || [];
            if (!updatedEmployeeIds.some(id => id.toString() === vendorData._id.toString())) {
                updatedEmployeeIds.push(vendorData._id);
            }
            salaryDetail = await rmPaymentUpdateModel.findByIdAndUpdate(
                rmPaymentUpdateDetails._id,
                {
                    ...req.body,
                    employeeId: updatedEmployeeIds,
                    customerName: customerFind.fullName || '',
                    LD: customerFind.customerFinId || '',
                    status: formStatus || 'pending',
                    completeDate: completeDate
                },
                { new: true }
            );

            if (formStatus === 'complete') {
                await externalManagerModel.findOneAndUpdate(
                    { customerId: customerId },
                    { $set: { "branchRequiredDocument.rmPaymentUpdateForm": formStatus } },
                    { new: true }
                );
            }
            success(res, "rm Payment Form Update Successfully", salaryDetail);

        } else {
            salaryDetail = await rmPaymentUpdateModel.create({
                ...req.body,
                employeeId: [vendorData._id],
                customerName: customerFind.fullName || '',
                LD: customerFind.customerFinId || '',
                status: formStatus || 'pending',
                completeDate: completeDate
            });
            if (formStatus === 'complete') {
                await externalManagerModel.findOneAndUpdate(
                    { customerId: customerId },
                    { $set: { "branchRequiredDocument.rmPaymentUpdateForm": formStatus } },
                    { new: true }
                );
            }

            success(res, "rm Payment Form Created Successfully", salaryDetail);

        }

        await checkBranchFromsStatusUpdateOnGoogleSheet(customerId, tokenId, formStatus, "Rm Payment", salaryDetail.completeDate, salaryDetail.rmPaymentDocument)
        const documentPaths = Array.isArray(salaryDetail.rmPaymentDocument)
            ? salaryDetail.rmPaymentDocument
            : [];
        salaryDetail.rmPaymentDate = salaryDetail.completeDate
        salaryDetail.rmPaymentDocumentData = salaryDetail.rmPaymentDocument,
            salaryDetail.customerFinIdStr = customerFind.customerFinId ? customerFind.customerFinId : ''
        await branchPenencyGoogleSheet(salaryDetail)
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}


async function electricityBillKycForm(req, res) {
    try {
        // Validate request body for errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }
        const tokenId = new ObjectId(req.Id);
        const completeDate = new Date().toString().split(' ').slice(0, 5).join(' ');
        const vendorData = await vendorModel.findOne({ _id: tokenId, status: "active" });
        if (!vendorData) {
            return notFound(res, "Employee not found", []);
        }

        const { customerId, formStatus, electricityBillUpload, meterPhoto, gasDiaryPhoto } = req.body;

        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }
        const customerFind = await customerModel.findById(customerId)
        if (!customerFind) {
            return notFound(res, "customer Not Found", []);
        }
        const applicantFormFind = await applicantModel.findOne({ customerId })

        const electricityBillKyc = await electricityBillKycModel.findOne({ customerId });

        let kycFormDetail;

        if (electricityBillKyc) {
            const updatedEmployeeIds = electricityBillKyc.employeeId || [];
            if (!updatedEmployeeIds.some(id => id.toString() === vendorData._id.toString())) {
                updatedEmployeeIds.push(vendorData._id);
            }

            kycFormDetail = await electricityBillKycModel.findByIdAndUpdate(
                electricityBillKyc._id,
                {
                    ...req.body,
                    employeeId: updatedEmployeeIds,
                    LD: customerFind?.customerFinId ? customerFind?.customerFinId : '',
                    status: formStatus,
                    completeDate: completeDate
                },
                { new: true }
            );

            if (formStatus === 'complete') {
                await externalManagerModel.findOneAndUpdate(
                    { customerId: customerId },
                    { $set: { "branchRequiredDocument.electricityKycForm": formStatus } },
                    { new: true }
                );
            }
        } else {
            kycFormDetail = await electricityBillKycModel.create({
                ...req.body,
                employeeId: [vendorData._id],
                LD: customerFind?.customerFinId ? customerFind?.customerFinId : '',
                status: formStatus,
                completeDate: completeDate
            });

            if (formStatus === 'complete') {
                await externalManagerModel.findOneAndUpdate(
                    { customerId: customerId },
                    { $set: { "branchRequiredDocument.electricityKycForm": formStatus } },
                    { new: true }
                );
            }
        }

        const creditPdUpdateData = {};
        if (electricityBillUpload) creditPdUpdateData.electricityBillPhoto = electricityBillUpload;
        if (meterPhoto) creditPdUpdateData.meterPhoto = meterPhoto;
        if (gasDiaryPhoto) creditPdUpdateData.gasDiaryPhoto = gasDiaryPhoto;

        let creditPdDetail;
        if (Object.keys(creditPdUpdateData).length > 0) {
            creditPdDetail = await creditPdModel.findOneAndUpdate(
                { customerId: customerId },
                { $set: creditPdUpdateData },
                { new: true, upsert: true }
            );
        }



        // Prepare the response object with all required data
        const responseData = {
            ...kycFormDetail.toObject(),
            // electricityCompleteDate: kycFormDetail.completeDate,
            // electricityKycDocumentData: documentPaths.map(path => `${process.env.BASE_URL}${path}`),
            // customerFinIdStr: customerFind.customerFinId ? customerFind.customerFinId : '',
            // Add the requested photo fields from creditPdDetail
            electricityBillPhoto: creditPdDetail?.electricityBillPhoto || null,
            meterPhoto: creditPdDetail?.meterPhoto || null,
            gasDiaryPhoto: creditPdDetail?.gasDiaryPhoto || null
        };

        success(res, kycFormDetail ? "electricity BillKyc Form Updated Successfully" : "electricity BillKyc Form Created Successfully", responseData);

        await checkBranchFromsStatusUpdateOnGoogleSheet(customerId, tokenId, formStatus, "Electricity Kyc", kycFormDetail.completeDate, kycFormDetail.electricityKycDocument)
        // await branchPenencyGoogleSheet(responseData);
        // const documentPaths = Array.isArray(kycFormDetail.electricityKycDocument)
        //     ? kycFormDetail.electricityKycDocument
        //     : [];

        const electricityKycDocument = [
            electricityBillUpload,
            meterPhoto,
            gasDiaryPhoto
        ];
        console.log('electricityKycDocument', electricityKycDocument)

        const electricityBillKycData = await electricityBillKycModel.findOne({ customerId });
        console.log(electricityBillKycData,"electricityBillKycData<><><><><><><><>")
        const updateFields = {};
        const fieldsToCheck = [
            "ivrsNo",
            "customerName" ,
            "consumerName" ,
            "relationWithApplicant",
            "billDate",
            // "electricityBoard" ,
            // "InterServiceNumber" ,
            // "addressOfConsumer",
            // "billAmount",
            // "cashDueDate",
            // "chequeDueDate",
            // "nameOfConsumer",
            // "serviceNo",
            // "consumerNo",
            // "nameOfElectricityBillOwner",
        ];
    
                // Determine filled fields in the updated/created document
                const filledFields = fieldsToCheck.filter((field) => electricityBillKycData[field]);
                // console.log(filledFields, "filledFields", fieldsToCheck);
                console.log(filledFields,"filledFields<><><>",fieldsToCheck)
                // Update flags based on filled fields
                if (filledFields.length > 0) {
                  updateFields.electricityDetailsFormStart = true;
                }
                if (filledFields.length === fieldsToCheck.length) {
                  updateFields.electricityDetailsFormComplete = true;
                }
    
                // Update process model if any flags are set
                if (Object.keys(updateFields).length > 0) {
                  await processModel.findOneAndUpdate(
                    { customerId },
                    { $set: updateFields },
                    { new: true }
                  );
                }

        kycFormDetail.electricityCompleteDate = kycFormDetail.completeDate
        kycFormDetail.electricityKycDocumentData = electricityKycDocument,
            kycFormDetail.customerFinIdStr = customerFind.customerFinId ? customerFind.customerFinId : ''
        await branchPenencyGoogleSheet(kycFormDetail)


    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}


async function samagraIdForm(req, res) {
    try {
        const {
            customerId,
            samagraIdDocument,
            samagraData,
            remarkByBranchVendor,
            samagraFamilyId,
            samagraFamilyHeadName,
            formStatus
        } = req.body;

        // Validate customerId
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }

        const tokenId = new ObjectId(req.Id);
        const completeDate = new Date().toString().split(' ').slice(0, 5).join(' ');

        // Validate vendor
        const vendorData = await vendorModel.findOne({ _id: tokenId, status: "active" });
        if (!vendorData) {
            return notFound(res, "Employee not found", []);
        }

        // Find customer
        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return notFound(res, "Customer not found", []);
        }

        // Fetch existing data from creditPdModel
        const creditPdData = await creditPdModel.findOne(
            { customerId },
            "familyMember samagraDetail SSSMPhoto"
        );

        // Merge `familyMember` data
        const existingFamilyMembers = creditPdData?.familyMember || [];
        const updatedFamilyMembers = samagraData
            ? samagraData.map((data, index) => {
                const existingMember = existingFamilyMembers[index] || {};
                return {
                    samagraMemberId: data.samagraMemberId || existingMember.samagraMemberId || "",
                    name: data.samagraMemberName || existingMember.name || "",
                    age: data.samagraMemberAge || existingMember.age || 0,
                    gender: data.samagraMemberGender || existingMember.gender || "",
                    relation: data.memberRelationWithApplicant || existingMember.relation || "",
                    dependent: data.dependent || existingMember.dependent || "",
                    occupationType: data.occupationType || existingMember.occupationType || "",
                    occupationTypeDetails: {
                        institutionName: data.occupationTypeDetails?.institutionName || existingMember.occupationTypeDetails?.institutionName || "",
                        nameOfOrganization: data.occupationTypeDetails?.nameOfOrganization || existingMember.occupationTypeDetails?.nameOfOrganization || "",
                        designation: data.occupationTypeDetails?.designation || existingMember.occupationTypeDetails?.designation || "",
                        dateOfJoining: data.occupationTypeDetails?.dateOfJoining || existingMember.occupationTypeDetails?.dateOfJoining || "",
                    }
                };
            })
            : existingFamilyMembers;

        // Merge `samagraDetail`
        const updatedSamagraDetail = {
            samagraFamilyIdNo: samagraFamilyId || creditPdData?.samagraDetail?.samagraFamilyIdNo || "",
            samagraIdHeadName: samagraFamilyHeadName || creditPdData?.samagraDetail?.samagraIdHeadName || ""
        };

        // const sssPhotos = {
        // samagraIdDocument: samagraIdDocument || creditPdData?.SSSMPhoto  };

        // Update or create `samagraIdKycModel`
        // let samagraKycFormDetail = await samagraIdKycModel.findOneAndUpdate(
        //     { customerId },
        //     {

        //         completeDate,
        //         customerId,
        //         samagraIdDocument,
        //         remarkByBranchVendor,
        //         formStatus,
        //     },
        //     { new: true, upsert: true }
        // );

        // Update or create `samagraIdKycModel` and include employeeId array
        let samagraKycFormDetail = await samagraIdKycModel.findOne({ customerId });

        if (samagraKycFormDetail) {
            // Check if employeeId array exists, otherwise initialize it
            samagraKycFormDetail.employeeId = samagraKycFormDetail.employeeId || [];
            if (!samagraKycFormDetail.employeeId.includes(tokenId.toString())) {
                samagraKycFormDetail.employeeId.push(tokenId.toString());
            }
            samagraKycFormDetail.completeDate = completeDate;
            samagraKycFormDetail.samagraIdDocument = samagraIdDocument;
            samagraKycFormDetail.remarkByBranchVendor = remarkByBranchVendor;
            samagraKycFormDetail.formStatus = formStatus;
            await samagraKycFormDetail.save();
        } else {
            // If document doesn't exist, create a new one
            samagraKycFormDetail = new samagraIdKycModel({
                customerId,
                completeDate,
                samagraIdDocument,
                remarkByBranchVendor,
                formStatus,
                employeeId: [tokenId.toString()], // Initialize with the current employeeId
            });
            await samagraKycFormDetail.save();
        }


        // Update `creditPdModel`
        const updateData = {
            familyMember: updatedFamilyMembers,
            samagraDetail: updatedSamagraDetail,
            SSSMPhoto: samagraIdDocument.length > 0 ? samagraIdDocument[0] : "",
        };

        await creditPdModel.findOneAndUpdate(
            { customerId },
            { $set: updateData },
            { new: true, upsert: true }
        );

        // Handle additional updates if formStatus is complete
        if (formStatus === "complete") {
            await externalManagerModel.findOneAndUpdate(
                { customerId },
                { $set: { "branchRequiredDocument.samagraIdKycForm": formStatus } },
                { new: true }
            );
        }

        // Include merged data in the response
        success(res, "Samagra Form submitted successfully", {
            ...samagraKycFormDetail.toObject(),
            samagraFamilyId: updatedSamagraDetail.samagraFamilyIdNo,
            samagraFamilyHeadName: updatedSamagraDetail.samagraIdHeadName,
            samagraData: samagraData
        });

        // Update Google Sheets and document paths
        await checkBranchFromsStatusUpdateOnGoogleSheet(customerId, tokenId, formStatus, "Samagra Kyc", samagraKycFormDetail.completeDate, samagraKycFormDetail.samagraIdDocument);

        const documentPaths = Array.isArray(samagraKycFormDetail.samagraIdDocument)
            ? samagraKycFormDetail.samagraIdDocument
            : [];
        samagraKycFormDetail.samagraCompleteDate = samagraKycFormDetail.completeDate;
        samagraKycFormDetail.samagraIdDocumentData = samagraIdDocument;
        samagraKycFormDetail.customerFinIdStr = customerFind.customerFinId || '';
        await branchPenencyGoogleSheet(samagraKycFormDetail);

    } catch (error) {
        console.error(error);
        return unknownError(res, error);
    }
}

async function udhyamKycForm(req, res) {
    try {
        // Validate request body for errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        const tokenId = new ObjectId(req.Id);
        const completeDate = new Date().toString().split(' ').slice(0, 5).join(' ');
        const vendorData = await vendorModel.findOne({ _id: tokenId, status: "active" });
        if (!vendorData) {
            return badRequest(res, "Employee not found", []);

        }

        const { customerId, formStatus } = req.body;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");

        }
        // console.log(req.body.udhyamKycDocument,"req.body<<>><<>><<>>")

        // if(!req.body.udhyamKycDocument || req.body.udhyamKycDocument.length == 0){
        //     return badRequest(res, "udhyamKycDocument is required");
        // }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return badRequest(res, "Customer Not Found");

        }

        const udhyamKycDetail = await udhyamKycModel.findOne({ customerId });
        let udhyamDetail;

        if (udhyamKycDetail) {
            const updatedEmployeeIds = udhyamKycDetail.employeeId || [];
            if (!updatedEmployeeIds.some(id => id.toString() === vendorData._id.toString())) {
                updatedEmployeeIds.push(vendorData._id);
            }
            udhyamDetail = await udhyamKycModel.findByIdAndUpdate(
                udhyamKycDetail._id,
                {
                    ...req.body,
                    employeeId: updatedEmployeeIds,
                    LD: customerFind.customerFinId || '',
                    status: formStatus || 'pending',
                    completeDate: completeDate
                },
                { new: true }
            );

            if (formStatus === 'complete') {
                await externalManagerModel.findOneAndUpdate(
                    { customerId: customerId },
                    { $set: { "branchRequiredDocument.udhyamKycForm": formStatus } },
                    { new: true }
                );
            }
            success(res, "Udhyam Kyc Form Update Successfully", udhyamDetail);

        } else {
            udhyamDetail = await udhyamKycModel.create({
                ...req.body,
                employeeId: [vendorData._id],
                LD: customerFind.customerFinId || '',
                status: formStatus || 'pending',
                completeDate: completeDate
            });

            if (formStatus === 'complete') {
                await externalManagerModel.findOneAndUpdate(
                    { customerId: customerId },
                    { $set: { "branchRequiredDocument.udhyamKycForm": formStatus } },
                    { new: true }
                );
            }
            success(res, "Udhyam Kyc Form Created Successfully", udhyamDetail);
        }

        const udhyamKycData = await udhyamKycModel.findOne({ customerId });
        const updateFields = {};
        
        // console.log(udhyamKycData, "udhyamKycData");
        
        // Validate udyamRegistrationNo directly from the main document
        const udyamRegistrationNo = udhyamKycData?.udyamRegistrationNo || "";
        // console.log(udyamRegistrationNo, "udyamRegistrationNo Value");
        
        if (udyamRegistrationNo && udyamRegistrationNo !== "N/A") {
          console.log("udyamRegistrationNo is valid and not empty!");
        } else {
          console.log("udyamRegistrationNo is either empty, 'N/A', or undefined!");
        }
        
        // Define the fields to validate
        const fieldsToCheck = [
          "udyamDetails.udyamRegistrationNo",
          "udyamDetails.organisationType",
          "udyamDetails.socialCategory",
          "udyamDetails.dateofIncorporation",
          "udyamDetails.majorActivity",
          "udyamDetails.DateofCommencementofProductionBusiness",
          "udyamDetails.enterpriseType",
          "udyamDetails.enterpriseName",
          "udyamDetails.classificationDate",
          "udyamDetails.classificationYear",
          "udyamDetails.officialAddressOfEnterprise.FlatDoorBlockNo",
          "udyamDetails.officialAddressOfEnterprise.VillageTown",
          "udyamDetails.officialAddressOfEnterprise.RoadStreetLane",
          "udyamDetails.officialAddressOfEnterprise.state",
          "udyamDetails.officialAddressOfEnterprise.mobile",
          "udyamDetails.officialAddressOfEnterprise.nameofPremisesBuilding",
          "udyamDetails.officialAddressOfEnterprise.block",
          "udyamDetails.officialAddressOfEnterprise.city",
          "udyamDetails.officialAddressOfEnterprise.district",
          "udyamDetails.officialAddressOfEnterprise.pin",
          "udyamDetails.nationalIndustryClassificationCode.activity",
          "udyamDetails.nationalIndustryClassificationCode.date",
          "udyamDetails.nationalIndustryClassificationCode.nic2Digit",
          "udyamDetails.nationalIndustryClassificationCode.nic4Digit",
          "udyamDetails.nationalIndustryClassificationCode.nic5Digit",
          "udyamDetails.nationalIndustryClassificationCode.dicName",
          "udyamDetails.nationalIndustryClassificationCode.msmeDFO",
          "udyamDetails.nationalIndustryClassificationCode.DateofUdyamRegistration",
          "udyamDetails.unitsDetails.unitName",
          "udyamDetails.unitsDetails.flat",
          "udyamDetails.unitsDetails.building",
          "udyamDetails.unitsDetails.VillageTown",
          "udyamDetails.unitsDetails.block",
          "udyamDetails.unitsDetails.road",
          "udyamDetails.unitsDetails.city",
          "udyamDetails.unitsDetails.pin",
          "udyamDetails.unitsDetails.state",
          "udyamDetails.unitsDetails.district",
        ];
        
        // Helper function to retrieve nested values
        function getFieldValue(data, path) {
          return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), data);
        }
        
        // Filter fields that are filled
        const filledFields = fieldsToCheck.filter((field) => {
          const value = getFieldValue(udhyamKycData, field);
        //   console.log(field, value, "Field and Value");
          return value ;
        });
        
        // console.log(filledFields, "Filled Fields List");
        
        // Set flags based on filled fields
        // if (filledFields.includes("udyamDetails.udyamRegistrationNo")) {
        //   console.log("udyamRegistrationNo is filled!");
          updateFields.udyamDetailsFormStart = true;
        // }
        
        // if (filledFields.length === fieldsToCheck.length) {
          updateFields.udyamDetailsFormComplete = true;
        // }
        
        // console.log(updateFields, "Update Fields");
        
        // Update the process model if necessary
        if (Object.keys(updateFields).length > 0) {
          const updatedProcess = await processModel.findOneAndUpdate(
            { customerId },
            { $set: updateFields },
            { new: true }
          );
        //   console.log(updatedProcess, "Updated Process Model");
        } else {
          console.log("No updates required for process model.");
        }
        

        await checkBranchFromsStatusUpdateOnGoogleSheet(customerId, tokenId, formStatus, "Udhyam Kyc", udhyamDetail.completeDate, udhyamDetail.udhyamKycDocument)
        const documentPaths = Array.isArray(udhyamDetail.udhyamKycDocument)
            ? udhyamDetail.udhyamKycDocument
            : [];
        udhyamDetail.udhyamCompleteDate = udhyamDetail.completeDate
        udhyamDetail.udhyamKycDocumentData = udhyamDetail.udhyamKycDocument,
            udhyamDetail.customerFinIdStr = customerFind.customerFinId ? customerFind.customerFinId : ''
        await branchPenencyGoogleSheet(udhyamDetail)

    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}


async function esignPhotoForm(req, res) {
    try {
        // Validate request body for errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }


        const tokenId = new ObjectId(req.Id);
        const completeDate = new Date().toString().split(' ').slice(0, 5).join(' ');
        const vendorData = await vendorModel.findOne({ _id: tokenId, status: "active" });
        if (!vendorData) {
            return badRequest(res, "Employee not found", []);

        }

        const { customerId, formStatus } = req.body;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");

        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return badRequest(res, "Customer Not Found");

        }

        const udhyamKycDetail = await esignPhotoModel.findOne({ customerId });
        let esignPhotoDetail;

        if (udhyamKycDetail) {
            const updatedEmployeeIds = udhyamKycDetail.employeeId || [];
            if (!updatedEmployeeIds.some(id => id.toString() === vendorData._id.toString())) {
                updatedEmployeeIds.push(vendorData._id);
            }
            esignPhotoDetail = await esignPhotoModel.findByIdAndUpdate(
                udhyamKycDetail._id,
                {
                    ...req.body,
                    employeeId: updatedEmployeeIds,
                    LD: customerFind.customerFinId || '',
                    status: formStatus || 'pending',
                    completeDate: completeDate
                },
                { new: true }
            );

            if (formStatus === 'complete') {
                await externalManagerModel.findOneAndUpdate(
                    { customerId: customerId },
                    { $set: { "branchRequiredDocument.esignPhotoForm": formStatus } },
                    { new: true }
                );
            }

            success(res, "esign Photo Form Update Successfully", esignPhotoDetail);

        } else {
            esignPhotoDetail = await esignPhotoModel.create({
                ...req.body,
                employeeId: [vendorData._id],
                LD: customerFind.customerFinId || '',
                status: formStatus || 'pending',
                completeDate: completeDate
            });

            if (formStatus === 'complete') {
                await externalManagerModel.findOneAndUpdate(
                    { customerId: customerId },
                    { $set: { "branchRequiredDocument.esignPhotoForm": formStatus } },
                    { new: true }
                );
            }

            success(res, "esign Photo Form Created Successfully", esignPhotoDetail);
        }

        await checkBranchFromsStatusUpdateOnGoogleSheet(customerId, tokenId, formStatus, "Esign Photo", esignPhotoDetail.completeDate, esignPhotoDetail.esignPhotoDocument)
        const documentPaths = Array.isArray(esignPhotoDetail.esignPhotoDocument)
            ? esignPhotoDetail.esignPhotoDocument
            : [];
        esignPhotoDetail.esignPhotoCompleteDate = esignPhotoDetail.completeDate
        esignPhotoDetail.esignPhotoDocumentData = esignPhotoDetail.esignPhotoDocument,
            esignPhotoDetail.customerFinIdStr = customerFind.customerFinId ? customerFind.customerFinId : ''
        await branchPenencyGoogleSheet(esignPhotoDetail)

    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}

async function incomeDetailForm(req, res) {
    try {
        // Validate request body for errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }


        const tokenId = new ObjectId(req.Id);
        const completeDate = new Date().toString().split(' ').slice(0, 5).join(' ');
        const vendorData = await vendorModel.findOne({ _id: tokenId, status: "active" });
        if (!vendorData) {
            return badRequest(res, "Employee not found", []);

        }

        const { customerId, formStatus } = req.body;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");

        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return badRequest(res, "Customer Not Found");

        }

        const incomeDetail = await incomeDetailModel.findOne({ customerId });
        let incomeDetailData;

        if (incomeDetail) {
            const updatedEmployeeIds = incomeDetail.employeeId || [];
            if (!updatedEmployeeIds.some(id => id.toString() === vendorData._id.toString())) {
                updatedEmployeeIds.push(vendorData._id);
            }
            incomeDetailData = await incomeDetailModel.findByIdAndUpdate(
                incomeDetail._id,
                {
                    ...req.body,
                    employeeId: updatedEmployeeIds,
                    LD: customerFind.customerFinId || '',
                    status: formStatus || 'pending',
                    completeDate: completeDate
                },
                { new: true }
            );

            if (formStatus === 'complete') {
                await externalManagerModel.findOneAndUpdate(
                    { customerId: customerId },
                    { $set: { "branchRequiredDocument.incomeDetailForm": formStatus } },
                    { new: true }
                );
            }

            success(res, "Income Detail Form Update Successfully", incomeDetailData);

        } else {
            incomeDetailData = await incomeDetailModel.create({
                ...req.body,
                employeeId: [vendorData._id],
                LD: customerFind.customerFinId || '',
                status: formStatus || 'pending',
                completeDate: completeDate
            });

            if (formStatus === 'complete') {
                await externalManagerModel.findOneAndUpdate(
                    { customerId: customerId },
                    { $set: { "branchRequiredDocument.incomeDetailForm": formStatus } },
                    { new: true }
                );
            }

            success(res, "Income Detail Form Created Successfully", incomeDetailData);
        }

        await checkBranchFromsStatusUpdateOnGoogleSheet(customerId, tokenId, formStatus, "income Detail", incomeDetailData.completeDate, incomeDetailData.incomeDetailDocument)
        const documentPaths = Array.isArray(incomeDetailData.incomeDetailDocument)
            ? incomeDetailData.incomeDetailDocument
            : [];
        incomeDetailData.incomeDetailCompleteDate = incomeDetailData.completeDate
        incomeDetailData.incomeDetailDocumentData = incomeDetailData.incomeDetailDocument,
            incomeDetailData.customerFinIdStr = customerFind.customerFinId ? customerFind.customerFinId : ''
        await branchPenencyGoogleSheet(incomeDetailData)

    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}


async function getBankStatementKycForm(req, res) {
    try {
        const { customerId } = req.query;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return notFound(res, "Customer not found", []);
        }

        const existingBankStatement = await bankStatementModel.findOne({ customerId });
        if (!existingBankStatement) {
            return notFound(res, "Bank Statement Form not found for this customer", []);
        }

        let allowPermission = true;

        for (const bankDetail of existingBankStatement.bankDetails) {
            const {
                bankName,
                acHolderName,
                accountNumber,
                ifscCode,
                branchName,
                accountType,
                e_Nachamount,
                mandate_end_date,
                E_Nach_Remarks
            } = bankDetail;
        
            if (
                !bankName ||
                !acHolderName ||
                !accountNumber ||
                !ifscCode ||
                !branchName ||
                !accountType
            ) {
                allowPermission = false;
                break;
            }
        
            if (E_Nach_Remarks !== "false" && (!e_Nachamount || !mandate_end_date)) {
                allowPermission = false;
                break;
            }
        }
        
        // Update Allow_Permission in the document
        existingBankStatement.Allow_Permission = allowPermission;
        await existingBankStatement.save();
        

        success(res, "Bank Statement Details", existingBankStatement);
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}

async function addNachLinkApplicant(req, res) {
    try {
        const { customerId, nachLink } = req.body;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }
        console.log(req.body)
        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return notFound(res, "Customer not found", []);
        }

        const existingBankStatement = await bankStatementModel.findOneAndUpdate(
            { customerId },
            {
                $set:{
                    pasteNachlink: nachLink
                }
            },
            {
                new:true
            }
        );
        return success(res, "nach link submitted successfully",existingBankStatement);
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
};

async function getAppPdcForm(req, res) {
    try {
        const { customerId } = req.query;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return notFound(res, "Customer not found", []);
        }

        const existingAppPdc = await appPdcModel.findOne({ customerId });
        if (!existingAppPdc) {
            return notFound(res, "App PDC Form not found for this customer", []);
        }

        success(res, "App PDC Details", existingAppPdc);

    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}

// Get Others PDC Form //

async function getOthersForm(req, res) {
    try {
        const { customerId } = req.query;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return notFound(res, "Customer not found", []);
        }

        const existingOthersPdc = await OtherDocumentDetails.findOne({ customerId });
        if (!existingOthersPdc) {
            return notFound(res, "Others PDC Form not found for this customer", []);
        }

        success(res, "Others Details", existingOthersPdc);

    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}

// Get Kyc Form //


async function getKycForm(req, res) {
    try {
        const { customerId } = req.query;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return notFound(res, "Customer not found", []);
        }

        const existingKyc = await SignKycDetails.findOne({ customerId });
        if (!existingKyc) {
            return notFound(res, "Kyc Form not found for this customer", []);
        }

        success(res, "Kyc Details", existingKyc);

    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}

async function getGtrPdcForm(req, res) {
    try {
        const { customerId } = req.query;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return notFound(res, "Customer not found", []);
        }

        const existingGtrPdc = await gtrPdcModel.findOne({ customerId });
        if (!existingGtrPdc) {
            return notFound(res, "GTR PDC Form not found for this customer", []);
        }

        success(res, "GTR PDC Details", existingGtrPdc);

    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}

async function getPropertyPapersKycForm(req, res) {
    try {
        const { customerId } = req.query;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return notFound(res, "Customer not found", []);
        }

        const existingPropertyPapers = await propertyPapersKycModel.findOne({ customerId });
        if (!existingPropertyPapers) {
            return notFound(res, "Property Papers KYC not found for this customer", []);
        }

        return success(res, "Property Papers KYC Details", existingPropertyPapers);
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}

async function getNachRegistrationForm(req, res) {
    try {
        const { customerId } = req.query;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return notFound(res, "Customer not found", []);
        }

        const existingNachRegistration = await nachRegistrationModel.findOne({ customerId });
        if (!existingNachRegistration) {
            return notFound(res, "NACH Registration not found for this customer", []);
        }

        return success(res, "NACH Registration Details", existingNachRegistration);
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}


async function getUdhyamKycDetailForm(req, res) {
    try {
        const { customerId } = req.query;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return notFound(res, "Customer not found", []);
        }

        const existingUdhyamKyc = await udhyamKycModel.findOne({ customerId })


        if (!existingUdhyamKyc) {
            return badRequest(res, "udhyam Kyc not found for this customer", []);
        }

        let Allow_Permission = true;

        if (existingUdhyamKyc.udyamDetails) {
            const {
                enterpriseName,
                udyamRegistrationNo,
                organisationType,
                socialCategory,
                dateofIncorporation,
                majorActivity,
                DateofCommencementofProductionBusiness,
                enterpriseType,
                classificationDate,
                classificationYear,
                officialAddressOfEnterprise: { 
                    FlatDoorBlockNo, VillageTown, RoadStreetLane, state, mobile, nameofPremisesBuilding, block, city, district, pin 
                },
                nationalIndustryClassificationCode: { activity, date, nic2Digit, nic4Digit, nic5Digit, dicName, msmeDFO, DateofUdyamRegistration },
                unitsDetails: { unitName, flat, building }
            } = existingUdhyamKyc.udyamDetails;

            // Check if any required field is missing
            const isAnyFieldMissing = [
                enterpriseName, udyamRegistrationNo, organisationType, socialCategory, dateofIncorporation, majorActivity,
                DateofCommencementofProductionBusiness, enterpriseType, classificationDate, classificationYear, 
                FlatDoorBlockNo, VillageTown, RoadStreetLane, state, mobile, nameofPremisesBuilding, block, city, district, pin,
                activity, date, nic2Digit, nic4Digit, nic5Digit, dicName, msmeDFO, DateofUdyamRegistration,
                unitName, flat, building
            ].some(field => !field);

            Allow_Permission = !isAnyFieldMissing; 
            // await udhyamKycModel.findOneAndUpdate({ customerId }, { $set: { Allow_Permission } });
        }

        const response = {
            ...existingUdhyamKyc.toObject(),
            Allow_Permission
        }

        return success(res, "udhyam Kyc Details", response);
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}

// async function getSamagraIdDetailForm(req, res) {
//     try {
//         const { customerId } = req.query;
//         if (!customerId || customerId.trim() === "") {
//             return badRequest(res, "customerId is required");
//         }

//         const customerFind = await customerModel.findById(customerId);
//         if (!customerFind) {
//             return notFound(res, "Customer not found", []);
//         }

//         const existingSamagraData = await samagraIdKycModel.findOne({ customerId });
//         if (!existingSamagraData) {
//             return notFound(res, "Samagra Detail not found for this customer", []);
//         }

//         return success(res, "Samagra Details", existingSamagraData);
//     } catch (error) {
//         console.error(error);
//         unknownError(res, error);
//     }
// };


async function getSamagraIdDetailForm(req, res) {
    try {
        const { customerId } = req.query;

        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return notFound(res, "Customer not found", []);
        }

        const existingSamagra = await samagraIdKycModel.findOne({ customerId });
        const creditPdData = await creditPdModel.findOne(
            { customerId },
            "familyMember samagraDetail SSSMPhoto"
        );


        const familyMember = creditPdData?.familyMember || [];
        const SSSMPhoto = creditPdData?.SSSMPhoto || "";
        const samagraDetail = creditPdData?.samagraDetail || {
            samagraFamilyIdNo: "",
            samagraIdHeadName: "",
        };

        // console.log('samagraDetail', samagraDetail)
        const samagraData = familyMember.map((member) => ({
            samagraMemberId: member.samagraMemberId || "",
            samagraMemberName: member.name || "",
            samagraMemberAge: member.age || 0,
            samagraMemberGender: member.gender || "",
            memberRelationWithApplicant: member.relation || "",
            dependent: member.dependent || "",
            occupationType: member.occupationType || "",
            occupationTypeDetails: member.occupationTypeDetails || { dateOfJoining: "", designation: "", nameOfOrganization: "", institutionName: "" },
        }));


        const responseData = {
            ...existingSamagra?.toObject(),
            samagraIdDocument: [SSSMPhoto],
            samagraFamilyHeadName: samagraDetail.samagraIdHeadName || '',
            samagraFamilyId: samagraDetail.samagraFamilyIdNo || '',
            samagraData,
        };

        return success(res, "Samagra Form Details", responseData);
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}


async function getSalaryAndOtherIncomeDetailForm(req, res) {
    try {
        const { customerId } = req.query;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return notFound(res, "Customer not found", []);
        }

        const existingSalaryAndOtherIncome = await salaryAndOtherIncomeModel.findOne({ customerId });
        if (!existingSalaryAndOtherIncome) {
            return notFound(res, "Salary And Other Income not found for this customer", []);
        }

        return success(res, "Salary And Other Income Details", existingSalaryAndOtherIncome);
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}


async function getRmPaymentDetailForm(req, res) {
    try {
        const { customerId } = req.query;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return notFound(res, "Customer not found", []);
        }

        const existingRmPaymentDetail = await rmPaymentUpdateModel.findOne({ customerId });
        if (!existingRmPaymentDetail) {
            return notFound(res, "Rm Payment Detail not found for this customer", []);
        }

        return success(res, "Rm Payment Details", existingRmPaymentDetail);
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
};


async function getMilkIncomeDetailForm(req, res) {
    try {
        const { customerId } = req.query;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return notFound(res, "Customer not found", []);
        }

        const existingMilkIncome = await milkIncomeModel.findOne({ customerId });
        if (!existingMilkIncome) {
            return notFound(res, "Milk Income not found for this customer", []);
        }

        return success(res, "Milk Income Details", existingMilkIncome);
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}

async function getESignDetailForm(req, res) {
    try {
        const { customerId } = req.query;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return notFound(res, "Customer not found", []);
        }

        const existingESign = await esignPhotoModel.findOne({ customerId });
        if (!existingESign) {
            return notFound(res, "eSign not found for this customer", []);
        }

        return success(res, "eSign Details", existingESign);
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
};



// async function getElectricityDetailForm(req, res) {
//     try {
//         const { customerId } = req.query;
//         if (!customerId || customerId.trim() === "") {
//             return badRequest(res, "customerId is required");
//         }

//         const customerFind = await customerModel.findById(customerId);
//         if (!customerFind) {
//             return notFound(res, "Customer not found", []);
//         }

//         const existingElectricity = await electricityBillKycModel.findOne({ customerId });
//         if (!existingElectricity) {
//             return notFound(res, "electricity Bill Kyc not found for this customer", []);
//         }

//         return success(res, "electricity Bill Kyc Details", existingElectricity);
//     } catch (error) {
//         console.error(error);
//         unknownError(res, error);
//     }
// }


async function getElectricityDetailForm(req, res) {
    try {
        const { customerId } = req.query;

        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return notFound(res, "Customer not found", []);
        }

        const existingElectricity = await electricityBillKycModel.findOne({ customerId });
        // if (!existingElectricity) {
        //     return notFound(res, "Electricity Bill KYC not found for this customer", []);
        // }

        // Get additional photos from creditPdModel
        const creditPdData = await creditPdModel.findOne(
            { customerId },
            "electricityBillPhoto meterPhoto gasDiaryPhoto" // Select only the required fields
        );

        // if (!creditPdData) {
        //     return notFound(res, "Pd Form Not Found", []);
        // }

        // Combine results
        const responseData = {
            ...existingElectricity?.toObject(), // Convert Mongoose document to plain object
            electricityBillUpload: creditPdData?.electricityBillPhoto ? creditPdData.electricityBillPhoto : '',
            meterPhoto: creditPdData?.meterPhoto ? creditPdData.meterPhoto : '',
            gasDiaryPhoto: creditPdData?.gasDiaryPhoto ? creditPdData.gasDiaryPhoto : '',
        };

        // Respond with success
        return success(res, "Electricity Bill KYC Details", responseData);
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}


async function getAgricultureIncomDetailForm(req, res) {
    try {
        const { customerId } = req.query;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return notFound(res, "Customer not found", []);
        }

        const existingAgricultureIncom = await agricultureModel.findOne({ customerId });
        if (!existingAgricultureIncom) {
            return notFound(res, "Agriculture Incom not found for this customer", []);
        }

        return success(res, "Agriculture Incom Details", existingAgricultureIncom);
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
};


async function getOtherBusinessDetailForm(req, res) {
    try {
        const { customerId } = req.query;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return notFound(res, "Customer not found", []);
        }

        const existingOtherBusiness = await otherBuisnessModel.findOne({ customerId });
        if (!existingOtherBusiness) {
            return notFound(res, "Other Business not found for this customer", []);
        }

        return success(res, "Other Business Details", existingOtherBusiness);
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
};

async function getIncomeDetailForm(req, res) {
    try {
        const { customerId } = req.query;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return notFound(res, "Customer not found", []);
        }

        const existingIncomeDetail = await incomeDetailModel.findOne({ customerId });
        if (!existingIncomeDetail) {
            return notFound(res, "Income Detail not found for this customer", []);
        }

        return success(res, "Income Details", existingIncomeDetail);
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
};

async function formNotRequired(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }



        const { customerId, formName } = req.body;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }
        if (!formName || formName.trim() === "") {
            return badRequest(res, "formName is required");
        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return badRequest(res, "Customer Not Found");
        }

        const existingFormDetail = await externalVendorModel.findOne({ customerId });
        if (!existingFormDetail) {
            return badRequest(res, "Form not found");
        }

        if (existingFormDetail.branchRequiredDocument.hasOwnProperty(formName)) {
            const updateField = `branchRequiredDocument.${formName}`;
            const formDetail = await externalVendorModel.findByIdAndUpdate(
                existingFormDetail._id,
                { [updateField]: "notRequired" },
                { new: true }
            );



            return success(res, "Form field set to notRequired successfully", formDetail);
        } else {
            return badRequest(res, "Invalid formName specified");
        }
    } catch (error) {
        console.error(error);
        return unknownError(res, error);
    }
}


async function branchSanctionAndDisbursementFormMail(req, res) {
    try {
        const { customerId, formName } = req.query;
        if (!formName) {
            return badRequest(res, "Form Name Required")
        } else if ((!formName === 'disbursement') || (!formName === 'sanction')) {
            return badReqeuset(res, `Form Name To Be "sanction" and "disbursement"`)
        }
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return notFound(res, "Customer not found", []);
        }

        await bracnhPendencyFormsMailSend(req, formName, customerId)

    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
};


async function physicalFileCourierForm(req, res) {
    try {
        // Validate request body for errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }


        const tokenId = new ObjectId(req.Id);
        const completeDate  = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");
        const employeeDetails = await vendorModel.findOne({ _id: tokenId, status: "active" });
        if (!employeeDetails) {
            return notFound(res, "Employee not found", []);
        }
        const { customerId } = req.body;

        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }
        const customerFind = await customerModel.findById(customerId)
        if (!customerFind) {
            return notFound(res, "customer Not Found", []);
        }
        // const applicantFormFind = await applicantModel.findOne({ customerId })

        const physicalFileDetail = await physicalFileCourierModel.findOne({ customerId });

        let pdcDetail;

        if (physicalFileDetail) {
            let updateData = {}; // Object to hold fields to update

            if (!physicalFileDetail.salesemployeId.includes(tokenId)) {
                // If tokenId (employee) is not in salesemployeId, push new employee and completeDate
                updateData.salesemployeId = [...physicalFileDetail.salesemployeId, tokenId];
                updateData.completeDate = [...physicalFileDetail.completeDate, completeDate];
            } else {
                // If tokenId (employee) exists, only update the completeDate
                updateData.completeDate = [...physicalFileDetail.completeDate, completeDate];
            }

            // Perform the update
            pdcDetail = await physicalFileCourierModel.findByIdAndUpdate(
                physicalFileDetail._id,
                {
                    ...req.body, // Include other request body fields
                    ...updateData, // Include the updates for salesemployeId and completeDate
                },
                { new: true } // Return the updated document
            );
            await processModel.updateOne(
                { customerId: customerId }, // Find the customer by customerId
                {
                    $set: {
                        physicalFileCourierFormStart: true,
                        physicalFileCourierFormComplete: true,
                    }
                }
            );
            success(res, "physical File Form Updated Successfully", pdcDetail);
        } else {
            pdcDetail = await physicalFileCourierModel.create({
                ...req.body,
                salesemployeId: employeeDetails._id,
                completeDate: completeDate
            });

            await processModel.updateOne(
                { customerId: customerId }, // Find the customer by customerId
                {
                    $set: {
                        physicalFileCourierFormStart: true,
                        physicalFileCourierFormComplete: true,
                    }
                }
            );
            success(res, "physical File Form Created Successfully", pdcDetail);
        }

    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}

async function getPhysicalFileCourierForm(req, res) {
    try {
        const { customerId } = req.query;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return notFound(res, "Customer not found", []);
        }

        const existingPhysicalFileCourier = await physicalFileCourierModel.findOne({ customerId });

        if (!existingPhysicalFileCourier) {
            return notFound(res, "Physical File Courier not found for this customer", []);
        }

        return success(res, "Physical File Courier Details", existingPhysicalFileCourier);
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
};


const BASE_URL = "https://stageapi.fincooper.in";

const updateImagePathsInApplicants = async (req, res) => {
    try {
        const applicants = await applicantModel.find();

        for (const applicant of applicants) {
            let updateNeeded = false;

            const imageFields = ["ocrAadharFrontImage", "ocrAadharBackImage", "applicantPhoto"];
            for (const field of imageFields) {
                if (applicant[field] && !applicant[field].startsWith(BASE_URL)) {
                    applicant[field] = `${BASE_URL}${applicant[field]}`;
                    updateNeeded = true;
                }
            }

            const kycFields = [
                "aadharFrontImage",
                "aadharBackImage",
                "panFrontImage",
                "drivingLicenceImage",
                "voterIdImage",
            ];
            for (const field of kycFields) {
                if (applicant.kycUpload[field] && !applicant.kycUpload[field].startsWith(BASE_URL)) {
                    applicant.kycUpload[field] = `${BASE_URL}${applicant.kycUpload[field]}`;
                    updateNeeded = true;
                }
            }

            if (updateNeeded) {
                await applicant.save();
                console.log(`Updated applicant ID: ${applicant._id}`);
            }
        }

        console.log("Image paths updated successfully");
    } catch (error) {
        console.error("Error updating image paths:", error);
    }
};

const addInventryDetails = async (req, res) => {
    try {
        const { appInventryDetails, customerId, gtrInventryDetails } = req.body;
        console.log(req.body, "<><><><><><><><><>");

        if (!customerId) {
            return badRequest(res, "Customer ID is required");
        }

        let bankStatement = null;
        let gtrBankStatement = null;

        if (appInventryDetails) {
            bankStatement = await bankStatementModel.findOneAndUpdate(
                { customerId },
                { $set: { inventryDetails: appInventryDetails } },
                { new: true }
            );
        }

        if (gtrInventryDetails) {
            gtrBankStatement = await gurranterBankDetails.findOneAndUpdate(
                { customerId },
                { $set: { gtrInventryDetails: gtrInventryDetails } },
                { new: true }
            );
        }

        let filteredBankDetails = await bankStatementModel.findOne(
            { customerId },
            { bankDetails: 1, inventryDetails: 1 }
        );

        let chequeDetailsAfterFive = [];
        if (filteredBankDetails?.bankDetails?.length) {
            let applicantCheckDetails = filteredBankDetails.bankDetails.find(
                (item) => item.E_Nach_Remarks === "true"
            );

            if (applicantCheckDetails?.chequeDetail?.length > 5) {
                chequeDetailsAfterFive = applicantCheckDetails.chequeDetail.slice(5);
            }
        }

        const gtrBank = await gurranterBankDetails.findOne({ customerId });

        let chequeDetailsAfterFiveGtr = [];
        if (gtrBank) {
            const firstGuarantor = gtrBank.guarantorDetails?.find(detail => detail.Type === "guarantor");

            if (firstGuarantor?.chequeDetail?.length > 5) {
                chequeDetailsAfterFiveGtr = firstGuarantor.chequeDetail.slice(5);
            }
        }

        return success(res, "Inventory details updated successfully", {
            applicantCheckDetails: chequeDetailsAfterFive,
            applicantInventryCheckDetails: bankStatement?.inventryDetails || [],
            gtrBankCheckDetails: chequeDetailsAfterFiveGtr,
            gtrInventryCheckDetails: gtrBankStatement?.gtrInventryDetails || []
        });
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
};

const inventryDetailsList = async (req, res) =>{
    try{
        const {customerId} = req.query

        let bankStatement = null;
        let gtrBankStatement = null;

        let filteredBankDetails = await bankStatementModel.findOne(
            { customerId },
            { bankDetails: 1, inventryDetails: 1 }
        );

        let chequeDetailsAfterFive = [];
        if (filteredBankDetails?.bankDetails?.length) {
            let applicantCheckDetails = filteredBankDetails.bankDetails.find(
                (item) => item.E_Nach_Remarks === "true"
            );

            if (applicantCheckDetails?.chequeDetail?.length > 5) {
                chequeDetailsAfterFive = applicantCheckDetails.chequeDetail.slice(5);
            }
        }

        const gtrBank = await gurranterBankDetails.findOne({ customerId });

        let chequeDetailsAfterFiveGtr = [];
        if (gtrBank) {
            const firstGuarantor = gtrBank.bankDetails?.find(detail => detail.Type === "guarantor");

            if (firstGuarantor?.chequeDetail?.length > 5) {
                chequeDetailsAfterFiveGtr = firstGuarantor.chequeDetail.slice(5);
            }
        }


        return success(res, "Inventory details updated successfully", {
            applicantCheckDetails: chequeDetailsAfterFive,
            applicantInventryCheckDetails: filteredBankDetails?.inventryDetails || [],
            gtrBankCheckDetails: chequeDetailsAfterFiveGtr,
            gtrInventryCheckDetails: gtrBank?.gtrInventryDetails || []
        });

    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}

module.exports = {
    physicalFileCourierForm,
    getPhysicalFileCourierForm,
    getAllFormFilesStatus,
    branchVendorFormAssignList,
    bankStatementKycForm,
    getBankStatementKycForm,
    applicantPdcForm,
    guarantorPdcForm,
    propertyPapersKycForm,
    nachRegistrationKycForm,
    agricultureForm,
    milkIncomeForm,
    salaryAndOtherIncomeForm,
    otherBuisnessModelForm,
    OtherDocumentForm,
    rmPaymentUpdateForm,
    udhyamKycForm,
    samagraIdForm,
    electricityBillKycForm,
    esignPhotoForm,
    formNotRequired,
    getBankStatementKycForm,
    getGuarantorDetails,
    addOrUpdateGuarantorDetails,
    getAppPdcForm,
    getGtrPdcForm,
    getPropertyPapersKycForm,
    getNachRegistrationForm,
    getUdhyamKycDetailForm,
    getSamagraIdDetailForm,
    getSalaryAndOtherIncomeDetailForm,
    getRmPaymentDetailForm,
    getMilkIncomeDetailForm,
    getESignDetailForm,
    getElectricityDetailForm,
    getAgricultureIncomDetailForm,
    getOtherBusinessDetailForm,
    branchPendencyFileAccept,
    getOthersForm,
    SignKycForm,
    getKycForm,
    branchSanctionAndDisbursementFormMail, getIncomeDetailForm, incomeDetailForm,
    updateImagePathsInApplicants,
    addNachLinkApplicant,
    addTypeKey,
    addInventryDetails,
    inventryDetailsList
}