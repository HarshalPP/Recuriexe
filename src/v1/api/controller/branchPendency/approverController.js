const {
    serverValidation,
    success,
    notFound,
    badRequest,
    unknownError } = require('../../../../../globalHelper/response.globalHelper.js');
const { validationResult } = require("express-validator");


const approverFormModel = require('../../model/branchPendency/approverTechnicalFormModel.js')
const employeeModel = require('../../model/adminMaster/employe.model')
const customerModel = require('../../model/customer.model')
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const externalManagerModel = require('../../model/externalManager/externalVendorDynamic.model.js')
// all branch forms models
const agricultureModel = require("../../model/branchPendency/agricultureIncomeModel.js");
const appPdcModel = require("../../model/branchPendency/appPdc.model.js")
const bankStatementModel = require("../../model/branchPendency/bankStatementKyc.model.js")
const electricityKycModel = require('../../model/branchPendency/electricityKyc.model.js')
const esignPhotoModel = require('../../model/branchPendency/esignPhoto.model.js')
const gtrPdcModel = require("../../model/branchPendency/gtrPdc.model.js")
const milkIncomeModel = require("../../model/branchPendency/milkIncomeModel.js");
const nachRegistrationModel = require("../../model/branchPendency/nachRegistration.model.js")
const otherBuisnessModel = require("../../model/branchPendency/otherBusinessModel.js")
const physicalFileCourierModel = require("../../model/physicalFileCourier.model.js")
const propertyPapersKycModel = require("../../model/branchPendency/propertyPaper.model.js")
const rmPaymentUpdateModel = require("../../model/branchPendency/rmPaymentUpdateModel.js")
const salaryAndOtherIncomeModel = require("../../model/branchPendency/salaryAndOtherIncomeModel.js");
const udyamKycModel = require('../../model/branchPendency/udhyamKyc.model.js')
const samagraKycModel = require('../../model/branchPendency/samagraIdKyc.model.js')
const incomeDetailModel = require('../../model/branchPendency/incomeDetails.model.js')
const applicantModel = require("../../model/applicant.model.js");
const legalReportdetail = require("../../model/branchPendency/approveLegalForm.model.js");
const approverRmModel = require('../../model/branchPendency/approverRmForm.model.js')
const approverTaggingModel = require('../../model/branchPendency/approverTaggingForm.model.js')
const vendorModel = require('../../model/adminMaster/vendor.model.js')
const NewbranchModel = require('../../model/adminMaster/newBranch.model.js')
const SignKycModel = require("../../model/branchPendency/signkyc.model.js")
const OtherDocumentModel = require("../../model/branchPendency/OtherDocument.model.js")



const modelMap = {
    agricultureBusiness: agricultureModel,
    applicantPdc: appPdcModel,
    bankStatement: bankStatementModel,
    electricityKyc: electricityKycModel,
    esignPhoto: esignPhotoModel,
    guarantorPdc: gtrPdcModel,
    milkIncomeBusiness: milkIncomeModel,
    nachRegistration: nachRegistrationModel,
    otherBuisness: otherBuisnessModel,
    physicalFileCourier: physicalFileCourierModel,
    propertyPapersKyc: propertyPapersKycModel,
    rmPaymentUpdate: rmPaymentUpdateModel,
    salaryAndOtherIncomeBusiness: salaryAndOtherIncomeModel,
    samagraKyc: samagraKycModel,
    udyamKyc: udyamKycModel,
    otherDocument: OtherDocumentModel,
    signKyc: SignKycModel,
    incomeDetail: incomeDetailModel,
};


// async function approverTechnicalForm(req, res) {
//     try {

//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({
//                 errorName: "serverValidation",
//                 errors: errors.array(),
//             });
//         }
//         const tokenId = new ObjectId(req.Id); // Convert req.Id to ObjectId
//         const completeDate = new Date().toISOString().split('T')[0]; // Get the complete date (YYYY-MM-DD format)

//         // Find active employee
//         const employeeData = await employeeModel.findOne({ _id: tokenId, status: "active" });
//         if (!employeeData) {
//             return badRequest(res, "employee not found");
//         }

//         const { customerId, formStatus ,latitude = 0 , longitude = 0 ,} = req.body;



//         // Ensure customerId is present and valid
//         if (!customerId || !ObjectId.isValid(customerId)) {
//             return badRequest(res, "Valid customerId is required");
//         }

//         // Find customer by ID
//         const customerFind = await customerModel.findById(customerId);
//         if (!customerFind) {
//             return badRequest(res, "Customer Not Found");
//         }

//         // Find existing approver form for this customer
//         const approverFormDetail = await approverFormModel.findOne({ customerId });

//         let salaryDetail;
//         if (approverFormDetail) {
//             // Update existing form
//             salaryDetail = await approverFormModel.findByIdAndUpdate(
//                 approverFormDetail._id,
//                 {
//                     ...req.body,
//                     employeeId: new ObjectId(tokenId), // Set employeeId
//                     location: {
//                         coordinates: [longitude, latitude],
//                       },
//                     LD: customerFind.customerFinId || '',
//                     status: formStatus || 'pending',
//                     completeDate
//                 },
//                 { new: true }
//             );
//             return success(res, "Technical form updated successfully", salaryDetail);

//         } else {
//             // Create new approver form
//             salaryDetail = await approverFormModel.create({
//                 ...req.body,
//                 employeeId: new ObjectId(tokenId), // Set employeeId
//                 location: {
//                     coordinates: [longitude, latitude],
//                   },
//                 LD: customerFind.customerFinId || '',
//                 status: formStatus || 'pending',
//                 completeDate
//             });
//             return success(res, "Technical form created successfully", salaryDetail);
//         }

//     } catch (error) {
//         console.error(error);
//         return unknownError(res, error);
//     }
// }


async function approverTechnicalForm(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        const { customerId, formStatus, ...formData } = req.body;


        const tokenId = new ObjectId(req.Id);
        const completeDate = new Date().toISOString().split("T")[0];

        const employeeData = await employeeModel.findOne({ _id: tokenId, status: "active" });
        // console.log("Token ID:", tokenId);
        // console.log("Employee Data:", employeeData);

        if (!employeeData) {
            return badRequest(res, "Employee not found");
        }


        if (!customerId || !ObjectId.isValid(customerId)) {
            return badRequest(res, "Valid customerId is required");
        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return badRequest(res, "Customer Not Found");
        }

        const approverFormDetail = await approverFormModel.findOne({ customerId });

        // const locationData = {
        //   type: "Point",
        //   coordinates: [longitude, latitude] 
        // };

        const approverFormData = {
            ...formData,
            //   "propertyAddressAndLandmark.location": locationData,
            employeeId: tokenId,
            customerId: customerFind._id,
            LD: customerFind.customerFinId || "",
            status: formStatus || "pending",
            completeDate
        };

        let salaryDetail;
        if (approverFormDetail) {
            salaryDetail = await approverFormModel.findByIdAndUpdate(
                approverFormDetail._id,
                approverFormData,
                { new: true }
            );
            return success(res, "Technical form updated successfully", salaryDetail);
        } else {
            salaryDetail = await approverFormModel.create(approverFormData);
            return success(res, "Technical form created successfully", salaryDetail);
        }
    } catch (error) {
        console.error(error);
        return unknownError(res, error);
    }
}

async function legalreport(req, res) {
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

        const employeeData = await employeeModel.findOne({ _id: tokenId, status: "active" });
        if (!employeeData) {
            return badRequest(res, "Employee not found");
        }


        const { customerId, formStatus, ...otherData } = req.body;
        console.log("Request Body:", req.body);

        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");

        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return badRequest(res, "Customer Not Found");

        }

        // const { customerId, formStatus, longitude, latitude } = req.body;


        const existingLegalReport = await legalReportdetail.findOne({ customerId });
        let legalReportDetail;

        if (existingLegalReport) {

            legalReportDetail = await legalReportdetail.findByIdAndUpdate(
                existingLegalReport._id,
                {
                    ...otherData,
                    employeeId: employeeData._id,
                    customerId: customerFind._id,
                    customerName: customerFind.fullName || '',
                    LD: customerFind.customerFinId || '',
                    status: formStatus || 'pending',
                    completeDate: completeDate,
                    // documentDetails: documentDetails
                },
                { new: true }
            );
            success(res, "Legal Report Form Created Successfully", legalReportDetail);
        } else {
            // Create new legal report
            legalReportDetail = await legalReportdetail.create({
                ...otherData,
                employeeId: employeeData._id,
                customerId: customerFind,
                // customerName: customerFind.fullName || '',
                LD: customerFind.customerFinId._id || '',
                status: formStatus || 'pending',
                completeDate: completeDate,
                // documentDetails: documentDetails
            });
            success(res, "Legal Report Form Created Successfully", legalReportDetail);
        }
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}

async function approverLegalFormGet(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }
        const { customerId } = req.query;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }
        const legalFormDetail = await legalReportdetail.findOne({ customerId });
        success(res, "approver Legal Form Details", legalFormDetail);
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}

async function approverTechnicalFormGet(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }
        const { customerId } = req.query;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }
        const approverFormDetail = await approverFormModel.findOne({ customerId });
        success(res, "approver Form Details Successfully", approverFormDetail);
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}


async function approverRmFormPost(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        const { customerId, formStatus, ...formData } = req.body;


        const tokenId = new ObjectId(req.Id);
        const completeDate = new Date().toISOString().split("T")[0];

        const employeeData = await employeeModel.findOne({ _id: tokenId, status: "active" });

        if (!employeeData) {
            return badRequest(res, "Employee not found");
        }


        if (!customerId || !ObjectId.isValid(customerId)) {
            return badRequest(res, "Valid customerId is required");
        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return badRequest(res, "Customer Not Found");
        }

        const existingLegalReport = await approverRmModel.findOne({ customerId });

        const approverRmData = {
            ...formData,
            employeeId: tokenId,
            customerId: customerFind._id,
            LD: customerFind.customerFinId || "",
            status: formStatus || "pending",
            completeDate
        };

        let rmDetail;
        if (existingLegalReport) {
            rmDetail = await approverRmModel.findByIdAndUpdate(
                existingLegalReport._id,
                approverRmData,
                { new: true }
            );
            return success(res, "RM form updated successfully", rmDetail);
        } else {
            rmDetail = await approverRmModel.create(approverRmData);
            return success(res, "RM form created successfully", rmDetail);
        }
    } catch (error) {
        console.error(error);
        return unknownError(res, error);
    }
}

async function approverTaggingFormPost(req, res) {
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

        const employeeData = await employeeModel.findOne({ _id: tokenId, status: "active" });
        if (!employeeData) {
            return badRequest(res, "Employee not found");
        }


        const { customerId, formStatus, ...otherData } = req.body;
        console.log("Request Body:", req.body);

        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");

        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return badRequest(res, "Customer Not Found");

        }

        // const { customerId, formStatus, longitude, latitude } = req.body;


        const existingTaggingReport = await approverTaggingModel.findOne({ customerId });
        let legalTaggingDetail;

        if (existingTaggingReport) {

            legalTaggingDetail = await approverTaggingModel.findByIdAndUpdate(
                existingTaggingReport._id,
                {
                    ...otherData,
                    employeeId: employeeData._id,
                    customerId: customerFind._id,
                    customerName: customerFind.fullName || '',
                    LD: customerFind.customerFinId || '',
                    status: formStatus || 'pending',
                    completeDate: completeDate,
                    // documentDetails: documentDetails
                },
                { new: true }
            );
            success(res, "Tagging Report Form Update Successfully", legalTaggingDetail);
        } else {
            // Create new legal report
            legalTaggingDetail = await approverTaggingModel.create({
                ...otherData,
                employeeId: employeeData._id,
                customerId: customerFind,
                // customerName: customerFind.fullName || '',
                LD: customerFind.customerFinId || '',
                status: formStatus || 'pending',
                completeDate: completeDate,
                // documentDetails: documentDetails
            });
            success(res, "Tagging Report Form Created Successfully", legalTaggingDetail);
        }
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}

async function approverRmFormGet(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }
        const { customerId } = req.query;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }
        const rmDetail = await approverRmModel.findOne({ customerId });
        success(res, "approver RM Form Details", rmDetail);
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}

async function approverTaggingFormGet(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }
        const { customerId } = req.query;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }
        const approverTaggingDetail = await approverTaggingModel.findOne({ customerId });
        success(res, "approver Tagging Form Details Successfully", approverTaggingDetail);
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}


// async function approverFormGet(req, res) {
//     try {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({
//                 errorName: "serverValidation",
//                 errors: errors.array(),
//             });
//         }
//         const { formName } = req.query;
//         if (!customerId || customerId.trim() === "") {
//             return badRequest(res, "customerId is required");
//         }
//         const approverFormDetail = await approverFormModel.findOne({ customerId });
//         success(res, "approver Form Details Successfully", approverFormDetail);
//     } catch (error) {
//         console.error(error);
//         unknownError(res, error);
//     }
// }



async function SortEmployee(employeeId) {
    // console.log("employeeId", employeeId)
    let branchIds = [];
    let employeeIds = [];
    const findEmployeeData = await employeeModel.find({ _id: employeeId });
    const Id = '673ef4ef1c600b445add496a'
    if (findEmployeeData[0]?.branchId == Id) {
        branchIds.push(new ObjectId(Id));
    }


    const childBranches = await NewbranchModel.find({ regionalBranchId: new ObjectId(Id) })
        .select('_id');
    // console.log("childBranches", childBranches)
    branchIds.push(...childBranches.filter(branch => findEmployeeData[0]?.branchId == branch.id));
    // console.log("branchIds", branchIds)

    const employee = await employeeModel.find({ branchId: { $in: branchIds } }).select('_id');
    employeeIds = employee.map(emp => emp._id);
    // console.log("EmployeeIds" , employeeIds)

    const customers = await customerModel.find({ employeId: { $in: employeeIds } }).select('_id');
    const customerIds = customers.map(customer => customer._id);
    return customerIds;

}


async function approverBranchFormsList(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        const { status, filesStatus, customerId, searchQuery = '' } = req.query;
        let { page, limit } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 50;

        const allFormDetails = [];
        const CoustomerList = await SortEmployee(new ObjectId(req.Id));

        let matchData;
        if (customerId) {
            matchData = { fileStatus: filesStatus || "active", customerId: new ObjectId(customerId) };
        } else if (CoustomerList.length > 0) {
            matchData = { fileStatus: filesStatus || "active", customerId: { $in: CoustomerList } };
        } else {
            matchData = { fileStatus: filesStatus || "active" };
        }

        // Collect all results first
        for (const [formName, model] of Object.entries(modelMap)) {
            const searchMatch = searchQuery
                ? {
                    $or: [
                        { "customerDetail.customerFinId": { $regex: searchQuery, $options: "i" } },
                        { "applicantDetail.fullName": { $regex: searchQuery, $options: "i" } },
                        { "applicantDetail.fatherName": { $regex: searchQuery, $options: "i" } },
                        {
                            "applicantDetail.mobileNo": isNaN(parseInt(searchQuery))
                                ? searchQuery
                                : parseInt(searchQuery),
                        },
                    ],
                }
                : {};

            const formDetail = await model.aggregate([
                { $match: matchData },
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
                        localField: "customerId",
                        foreignField: "customerId",
                        as: "applicantDetail",
                    },
                },
                {
                    $unwind: {
                        path: "$customerDetail",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                { $match: searchMatch },
                {
                    $project: {
                        customerFinId: "$customerDetail.customerFinId",
                        customerId: {
                            $cond: {
                                if: { $gt: [{ $size: "$applicantDetail" }, 0] },
                                then: { $first: "$applicantDetail.customerId" },
                                else: "",
                            },
                        },
                        applicantName: {
                            $cond: {
                                if: { $gt: [{ $size: "$applicantDetail" }, 0] },
                                then: { $first: "$applicantDetail.fullName" },
                                else: "",
                            },
                        },
                        applicantFatherName: {
                            $cond: {
                                if: { $gt: [{ $size: "$applicantDetail" }, 0] },
                                then: { $first: "$applicantDetail.fatherName" },
                                else: "",
                            },
                        },
                        applicantMobileNo: {
                            $cond: {
                                if: { $gt: [{ $size: "$applicantDetail" }, 0] },
                                then: { $first: "$applicantDetail.mobileNo" },
                                else: "",
                            },
                        },
                        remarkByApproval: 1,
                        completeDate: 1,
                        employeeId: 1,
                        documentType: formName,
                    },
                },
            ]);

            allFormDetails.push(...formDetail);
        }

        // Apply pagination to combined results
        const totalRecords = allFormDetails.length;
        const totalPages = Math.ceil(totalRecords / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedResults = allFormDetails.slice(startIndex, endIndex);
        if (customerId) {
            return success(res, `File ${status} List`, paginatedResults);
        } else {
            return success(res, `File ${status} List`, {
                forms: paginatedResults,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalRecords,
                    limit
                }
            });
        }

    } catch (error) {
        console.error(error);
        return unknownError(res, error);
    }
}


async function getSpecificBranchForms(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        const { documentType, _id } = req.query;

        console.log('documentType, customerId', documentType, _id)

        if (!documentType || !_id) {
            return badRequest(res, "documentType and _id are required");
        }

        const model = modelMap[documentType]; // Get the model based on documentType
        console.log('model', model)

        if (!model) {
            return badRequest(res, "Document type not found");
        }

        const formDetail = await model.findById(_id)


        return success(res, `${documentType} Details`, formDetail);

    } catch (error) {
        console.error(error);
        return unknownError(res, error);
    }
}

// async function specificBranchFormsApprove(req, res) {
//     try {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({
//                 errorName: "serverValidation",
//                 errors: errors.array(),
//             });
//         }

//         const { status, documentType, _id, remark } = req.query;
//         const tokenId = new ObjectId(req.Id)
//         const todayDate = new Date().toString().split(' ').slice(0, 5).join(' ');
//         // console.log('documentType', documentType)

//         if (!documentType || !_id) {
//             return badRequest(res, "documentType and _id are required");
//         }

//         const model = modelMap[documentType]; // Get the model based on documentType
//         // console.log('model', model)

//         if (!model) {
//             return badRequest(res, "Document type not found");
//         }

//         const formDetail = await model.findByIdAndUpdate(
//             _id,
//             { status: status, approvalDate: todayDate, approvalEmployeeId: tokenId, remarkByApproval: remark },
//             { new: true, runValidators: true }
//         );

//          success(res, `File ${status.charAt(0).toUpperCase() + status.slice(1)} Successfully`, formDetail);


//     } catch (error) {
//         console.error(error);
//         return unknownError(res, error);
//     }
// }


async function specificBranchFormsApprove(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        const { status, documentType, _id, remark, customerId } = req.query;

        console.log('---', status, documentType, _id, remark, customerId)

        const tokenId = new ObjectId(req.Id);
        const todayDate = new Date().toString().split(' ').slice(0, 5).join(' ');

        if (!documentType || !_id || !customerId) {
            return badRequest(res, "documentType, _id, and customerId are required");
        }

        const model = modelMap[documentType]; // Get the model based on documentType
        if (!model) {
            return badRequest(res, "Document type not found");
        }

        // Update the form's status in the corresponding model
        const formDetail = await model.findByIdAndUpdate(
            _id,
            { status: status, approvalDate: todayDate, approvalEmployeeId: tokenId, remarkByApproval: remark },
            { new: true, runValidators: true }
        );

        // console.log('formDetail',formDetail)

        if (!formDetail) {
            return notFound(res, "Form not found");
        }

        const branchFieldMap = {
            agricultureBusiness: "agricultureIncomeForm",
            applicantPdc: "appPdcForm",
            bankStatement: "bankStatementForm",
            electricityKyc: "electricityKycForm",
            esignPhoto: "esignPhotoForm",
            guarantorPdc: "gtrPdcForm",
            milkIncomeBusiness: "milkIncomeForm",
            nachRegistration: "nachRegistrationKycForm",
            otherBuisness: "otherBuisnessForm",
            physicalFileCourier: "physicalFileCourierForm",
            propertyPapersKyc: "propertyPaperKycForm",
            rmPaymentUpdate: "rmPaymentUpdateForm",
            salaryAndOtherIncomeBusiness: "salaryAndOtherIncomeForm",
            samagraKyc: "samagraIdKycForm",
            udyamKyc: "udhyamKycForm",
            otherDocument: "otherDocumentForm",
            signKyc: "signKycForm",
            incomeDetail: "incomeDetailForm",
        };

        const branchFieldKey = branchFieldMap[documentType];

        // Update the specific key in branchRequiredDocument
        const updatedManager = await externalManagerModel.findOneAndUpdate(
            { customerId: customerId },
            { $set: { [`branchRequiredDocument.${branchFieldKey}`]: status } },
            { new: true }
        );

        success(res, `File ${status.charAt(0).toUpperCase() + status.slice(1)} Successfully`, formDetail);

    } catch (error) {
        console.error(error);
        return unknownError(res, error);
    }
}


module.exports = {
    approverTechnicalForm, approverTechnicalFormGet, approverBranchFormsList, getSpecificBranchForms, specificBranchFormsApprove,
    legalreport, approverLegalFormGet, approverTaggingFormGet, approverRmFormGet, approverTaggingFormPost, approverRmFormPost
}



