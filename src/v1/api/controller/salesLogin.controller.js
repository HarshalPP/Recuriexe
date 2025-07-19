const {
    success,
    unknownError,
    serverValidation,
    badRequest,
    notFound,
    parseJwt
} = require("../../../../globalHelper/response.globalHelper");
const moment = require('moment');
const cron = require("node-cron");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const customerModel = require("../model/customer.model");
const processModel = require('../model/process.model.js')
const newbranchModel = require("../model/adminMaster/newBranch.model.js")
const { validationResult } = require("express-validator");
const employeeModel = require('../model/adminMaster/employe.model.js')
const customerDocumentModel = require('../model/customerPropertyDetail.model.js')
const customerChargesModel = require('../model/charges.model.js')
const physicalFileCourierModel = require('../model/physicalFileCourier.model.js')
const employeModel = require('../model/adminMaster/employe.model.js')
const leadGenerateModel = require("../model/leadGenerate.model.js")
const applicantModel = require('../model/applicant.model.js')
const coApplicantModel = require('../model/co-Applicant.model.js')
const guarantorModel = require('../model/guarantorDetail.model.js')
const { PdEmail, sendEmailByVendor } = require("../controller/functions.Controller")
const deleteCoApplicantModel = require('../model/deleteCoApplicant.model.js')
const cibilModel = require('../model/cibilDetail.model.js')
const fs = require('fs');
const { calculateTotalMonths } = require("./pd.Controller.js")
const externalManagerModel = require("../model/externalManager/externalVendorDynamic.model.js")
const vendorModel = require("../model/adminMaster/vendor.model.js")
const collectionSheetModel = require("../model/collection/collectionSheet.model.js")

const NodeCache = require('node-cache');
const dashboardCache = new NodeCache({ stdTTL: 300 }); 
const dashboardMonthCountCache = new NodeCache({ stdTTL: 300 }); 


async function salesLoginPropertyForm(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        const tokenId = new ObjectId(req.Id);
        const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");
        const employeeExist = await employeeModel.findOne({ _id: tokenId, status: "active" });

        if (!employeeExist) {
            return badRequest(res, "Employee not found", []);
        }

        const { customerId, propertyDocument, incomeDocument, disbursementDocument, otherDocument } = req.body;

        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return badRequest(res, "Customer Not Found");
        }

        const propertyDetailExist = await customerDocumentModel.findOne({ customerId });
        let propertyDeteail;

        // Function to filter only provided documents for the response
        const filterResponse = (data) => {
            const response = {};
            if (propertyDocument) response.propertyDocument = data.propertyDocument;
            if (incomeDocument) response.incomeDocument = data.incomeDocument;
            if (disbursementDocument) response.disbursementDocument = data.disbursementDocument;
            if (otherDocument) response.otherDocument = data.otherDocument;
            return response;
        };

        if (propertyDetailExist) {
            const updateFields = {
                salesEmployeeId: tokenId,
            };

            if (propertyDocument) {
                updateFields.propertyDocument = {
                    ...propertyDetailExist.propertyDocument,
                    ...propertyDocument,
                };

                const existingSalesEmployeeIds = propertyDetailExist.propertyDocument.salesEmployeeId || [];
                const existingCompleteDates = propertyDetailExist.propertyDocument.completeDate || [];

                if (!existingSalesEmployeeIds.includes(tokenId.toString())) {
                    existingSalesEmployeeIds.push(tokenId);

                    if (!existingCompleteDates.includes(todayDate)) {
                        existingCompleteDates.push(todayDate);
                    }
                } else {
                    console.log('check employee');

                    if (!existingCompleteDates.includes(todayDate)) {
                        existingCompleteDates.push(todayDate);
                    }
                }

                if (updateFields.propertyDocument.salesStatus === 'complete') {
                    await processModel.updateOne(
                        { customerId: customerId }, // Find the customer by customerId
                        {
                            $set: {
                                propertyDocumentFormStart: true,
                                propertyDocumentFormComplete: true,
                            }
                        }
                    );
                } else {
                    await processModel.updateOne(
                        { customerId: customerId }, // Find the customer by customerId
                        {
                            $set: {
                                propertyDocumentFormStart: true,
                                propertyDocumentFormComplete: false,
                            }
                        }
                    );
                }
            }

            if (incomeDocument) {
                updateFields.incomeDocument = {
                    ...propertyDetailExist.incomeDocument,
                    ...incomeDocument,
                };

                const existingSalesEmployeeIds = propertyDetailExist.incomeDocument.salesEmployeeId || [];
                const existingCompleteDates = propertyDetailExist.incomeDocument.completeDate || [];

                if (!existingSalesEmployeeIds.includes(tokenId.toString())) {
                    existingSalesEmployeeIds.push(tokenId);

                    if (!existingCompleteDates.includes(todayDate)) {
                        existingCompleteDates.push(todayDate);
                    }
                } else {
                    console.log('check employee');

                    if (!existingCompleteDates.includes(todayDate)) {
                        existingCompleteDates.push(todayDate);
                    }
                }


                if (updateFields.incomeDocument.salesStatus === 'complete') {
                    await processModel.updateOne(
                        { customerId: customerId }, // Find the customer by customerId
                        {
                            $set: {
                                incomeDocumentFormStart: true,
                                incomeDocumentFormComplete: true,
                            }
                        }
                    );
                } else {
                    await processModel.updateOne(
                        { customerId: customerId }, // Find the customer by customerId
                        {
                            $set: {
                                incomeDocumentFormStart: true,
                                incomeDocumentFormComplete: false,
                            }
                        }
                    );
                }
            }

            if (disbursementDocument) {
                updateFields.disbursementDocument = {
                    ...propertyDetailExist.disbursementDocument,
                    ...disbursementDocument,
                };

                const existingSalesEmployeeIds = propertyDetailExist.disbursementDocument.salesEmployeeId || [];
                const existingCompleteDates = propertyDetailExist.disbursementDocument.completeDate || [];

                if (!existingSalesEmployeeIds.includes(tokenId.toString())) {
                    existingSalesEmployeeIds.push(tokenId);

                    if (!existingCompleteDates.includes(todayDate)) {
                        existingCompleteDates.push(todayDate);
                    }
                } else {
                    console.log('check employee');

                    if (!existingCompleteDates.includes(todayDate)) {
                        existingCompleteDates.push(todayDate);
                    }
                }


                if (updateFields.disbursementDocument.salesStatus === 'complete') {
                    await processModel.updateOne(
                        { customerId: customerId }, // Find the customer by customerId
                        {
                            $set: {
                                disbursementDocumentFormStart: true,
                                disbursementDocumentFormComplete: true,
                            }
                        }
                    );
                } else {
                    await processModel.updateOne(
                        { customerId: customerId }, // Find the customer by customerId
                        {
                            $set: {
                                disbursementDocumentFormStart: true,
                                disbursementDocumentFormComplete: false,
                            }
                        }
                    );
                }

            }

            if (otherDocument) {
                updateFields.otherDocument = {
                    ...propertyDetailExist.otherDocument,
                    ...otherDocument,
                };

                const existingSalesEmployeeIds = propertyDetailExist.otherDocument.salesEmployeeId || [];
                const existingCompleteDates = propertyDetailExist.otherDocument.completeDate || [];

                if (!existingSalesEmployeeIds.includes(tokenId.toString())) {
                    existingSalesEmployeeIds.push(tokenId);

                    if (!existingCompleteDates.includes(todayDate)) {
                        existingCompleteDates.push(todayDate);
                    }
                } else {
                    console.log('check employee');

                    if (!existingCompleteDates.includes(todayDate)) {
                        existingCompleteDates.push(todayDate);
                    }
                }


                if (updateFields.otherDocument.salesStatus === 'complete') {
                    await processModel.updateOne(
                        { customerId: customerId }, // Find the customer by customerId
                        {
                            $set: {
                                otherDocumentFormStart: true,
                                otherDocumentFormComplete: true,
                            }
                        }
                    );
                } else {
                    await processModel.updateOne(
                        { customerId: customerId }, // Find the customer by customerId
                        {
                            $set: {
                                otherDocumentFormStart: true,
                                otherDocumentFormComplete: false,
                            }
                        }
                    );
                }
            }

            propertyDeteail = await customerDocumentModel.findByIdAndUpdate(
                propertyDetailExist._id,
                updateFields,
                { new: true }
            );

            // Filter the response to include only provided fields
            const filteredResponse = filterResponse(propertyDeteail);
            return success(res, "Property Form Submit Successfully", filteredResponse);

        } else {
            // Create a new document if none exists
            let newPropertyDetail = {
                customerId,
                salesEmployeeId: employeeExist._id,
                propertyDocument: propertyDocument ? { ...propertyDocument, salesEmployeeId: tokenId, completeDate: todayDate } : undefined,
                incomeDocument: incomeDocument ? { ...incomeDocument, salesEmployeeId: tokenId, completeDate: todayDate } : undefined,
                disbursementDocument: disbursementDocument
                    ? { ...disbursementDocument, salesEmployeeId: tokenId, completeDate: todayDate }
                    : undefined,
                otherDocument: otherDocument ? { ...otherDocument, salesEmployeeId: tokenId, completeDate: todayDate } : undefined,
            };

            propertyDeteail = await customerDocumentModel.create(newPropertyDetail);

            // Filter the response to include only provided fields
            const filteredResponse = filterResponse(propertyDeteail);
            return success(res, "Property Detail Form Created Successfully", filteredResponse);
        }
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}


async function getSalesLoginProperty(req, res) {
    try {
        const { customerId } = req.query;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return notFound(res, "Customer not found", []);
        }

        const existcustomerProperty = await customerDocumentModel.findOne({ customerId });
        if (!existcustomerProperty) {
            return notFound(res, "customer Document not found", []);
        }
        return success(res, "Customer Document Detail", existcustomerProperty);
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
};


async function cibilByRivertDocuments(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        const tokenId = new ObjectId(req.Id);
        const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");
        const employeeExist = await employeeModel.findOne({ _id: tokenId, status: "active" });

        if (!employeeExist) {
            return badRequest(res, "Employee not found", []);
        }

        const { customerId, propertyDocument, incomeDocument, disbursementDocument, otherDocument } = req.body;

        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return badRequest(res, "Customer Not Found");
        }

        const propertyDetailExist = await customerDocumentModel.findOne({ customerId });
        let propertyDeteail;

        // Function to filter only provided documents for the response
        const filterResponse = (data) => {
            const response = {};
            if (propertyDocument) response.propertyDocument = data.propertyDocument;
            if (incomeDocument) response.incomeDocument = data.incomeDocument;
            if (disbursementDocument) response.disbursementDocument = data.disbursementDocument;
            if (otherDocument) response.otherDocument = data.otherDocument;
            return response;
        };

        if (propertyDetailExist) {
            const updateFields = {
                cibilEmployeId: tokenId,
            };

            if (propertyDocument) {
                updateFields.propertyDocument = {
                    ...propertyDetailExist.propertyDocument,
                    ...propertyDocument,
                };
                // updateFields.propertyDocument.completeDate = todayDate;

                if (updateFields.propertyDocument.cibilStatus === 'approve') {
                    updateFields.propertyDocument.cibilByApproveDate = todayDate;
                    // updateFields.propertyDocument.cibilRemark = cibilRemark;
                } else if (updateFields.propertyDocument.cibilStatus === 'reDocument') {
                    updateFields.propertyDocument.cibilReAssignDate = todayDate;
                    // updateFields.propertyDocument.cibilRemark = cibilRemark;

                    await processModel.updateOne(
                        { customerId: customerId },
                        {
                            $set: {
                                propertyDocumentFormStart: false,
                                propertyDocumentFormComplete: true,
                            }
                        }
                    );
                }
            }

            if (incomeDocument) {
                updateFields.incomeDocument = {
                    ...propertyDetailExist.incomeDocument,
                    ...incomeDocument,
                };
                // updateFields.incomeDocument.completeDate = todayDate;

                if (updateFields.incomeDocument.cibilStatus === 'approve') {
                    updateFields.incomeDocument.cibilByApproveDate = todayDate;
                    // updateFields.incomeDocument.cibilRemark = cibilRemark;
                } else if (updateFields.incomeDocument.cibilStatus === 'reDocument') {
                    updateFields.incomeDocument.cibilReAssignDate = todayDate;
                    // updateFields.incomeDocument.cibilRemark = cibilRemark;
                    await processModel.updateOne(
                        { customerId: customerId }, // Find the customer by customerId
                        {
                            $set: {
                                incomeDocumentFormStart: false,
                                incomeDocumentFormComplete: true,
                            }
                        }
                    );
                }
            }

            if (disbursementDocument) {
                updateFields.disbursementDocument = {
                    ...propertyDetailExist.disbursementDocument,
                    ...disbursementDocument,
                };
                // updateFields.disbursementDocument.completeDate = todayDate;

                if (updateFields.disbursementDocument.cibilStatus === 'approve') {
                    updateFields.disbursementDocument.cibilByApproveDate = todayDate;
                    // updateFields.disbursementDocument.cibilRemark = cibilRemark;
                } else if (updateFields.disbursementDocument.cibilStatus === 'reDocument') {
                    updateFields.disbursementDocument.cibilReAssignDate = todayDate;
                    // updateFields.disbursementDocument.cibilRemark = cibilRemark;
                    await processModel.updateOne(
                        { customerId: customerId }, // Find the customer by customerId
                        {
                            $set: {
                                disbursementDocumentFormStart: false,
                                disbursementDocumentFormComplete: true,
                            }
                        }
                    );
                }

            }

            if (otherDocument) {
                updateFields.otherDocument = {
                    ...propertyDetailExist.otherDocument,
                    ...otherDocument,
                };
                // updateFields.otherDocument.completeDate = todayDate;



                if (updateFields.otherDocument.cibilStatus === 'approve') {
                    updateFields.otherDocument.cibilByApproveDate = todayDate;
                    // updateFields.otherDocument.cibilRemark = cibilRemark;
                } else if (updateFields.otherDocument.cibilStatus === 'reDocument') {
                    updateFields.otherDocument.cibilReAssignDate = todayDate;
                    // updateFields.otherDocument.cibilRemark = cibilRemark;
                    await processModel.updateOne(
                        { customerId: customerId }, // Find the customer by customerId
                        {
                            $set: {
                                otherDocumentFormStart: false,
                                otherDocumentFormComplete: true,
                            }
                        }
                    );
                }
            }

            propertyDeteail = await customerDocumentModel.findByIdAndUpdate(
                propertyDetailExist._id,
                updateFields,
                { new: true }
            );

            // Filter the response to include only provided fields
            const filteredResponse = filterResponse(propertyDeteail);
            return success(res, "Property Detail Form Updated Successfully", filteredResponse);

        } else {
            // Create a new document if none exists
            let newPropertyDetail = {
                customerId,
                salesEmployeeId: employeeExist._id,
                propertyDocument: propertyDocument ? { ...propertyDocument, completeDate: todayDate } : undefined,
                incomeDocument: incomeDocument ? { ...incomeDocument, completeDate: todayDate } : undefined,
                disbursementDocument: disbursementDocument
                    ? { ...disbursementDocument, completeDate: todayDate }
                    : undefined,
                otherDocument: otherDocument ? { ...otherDocument, completeDate: todayDate } : undefined,
            };

            propertyDeteail = await customerDocumentModel.create(newPropertyDetail);

            // Filter the response to include only provided fields
            const filteredResponse = filterResponse(propertyDeteail);
            return success(res, "Property Detail Form Created Successfully", filteredResponse);
        }
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}


async function customerChargesForm(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        const tokenId = new ObjectId(req.Id);
        const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");
        const employeeData = await employeModel.findOne({ _id: tokenId, status: "active" });

        if (!employeeData) {
            return badRequest(res, "Employee not found");
        }

        const { customerId } = req.body;

        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return notFound(res, "customer Not Found");
        }

        const applicantFormFind = await applicantModel.findOne({ customerId });
        const existingCharges = await customerChargesModel.findOne({ customerId });

        let chargesDetail;

        if (existingCharges) {
            let updateData = {}; // Object to hold fields to update

            if (!existingCharges.salesemployeId.includes(tokenId)) {
                updateData.salesemployeId = [...existingCharges.salesemployeId, tokenId];
                updateData.completeDate = [...existingCharges.completeDate, todayDate];
            } else {
                updateData.completeDate = [...existingCharges.completeDate, todayDate];
            }
            chargesDetail = await customerChargesModel.findByIdAndUpdate(
                existingCharges._id,
                {
                    ...req.body,
                    ...updateData
                },
                { new: true }
            );

            await processModel.updateOne(
                { customerId: customerId }, // Find the customer by customerId
                {
                    $set: {
                        chargesFormStart: true,
                        chargesFormComplete: true,
                    }
                }
            );

            success(res, "Charges Updated Successfully", chargesDetail);
            await processModel.findOneAndUpdate(
                { customerId },
                {
                    $set: {
                        disbursementCharge: true
                    }
                },
                { new: true }
            );
            await finalApprovalSheet(customerId)
        } else {
            chargesDetail = await customerChargesModel.create({
                ...req.body,
                salesemployeId: tokenId,
                completeDate: todayDate
            });

            await processModel.updateOne(
                { customerId: customerId }, // Find the customer by customerId
                {
                    $set: {
                        chargesFormStart: true,
                        chargesFormComplete: true,
                    }
                }
            );
            return success(res, "Chaeges add Successfully", chargesDetail);
        }

    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}


async function getCustomerCharges(req, res) {
    try {
        const { customerId } = req.query;
        if (!customerId || customerId.trim() === "") {
            return badRequest(res, "customerId is required");
        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return notFound(res, "Customer not found", []);
        }

        const chargesData = await customerChargesModel.findOne({ customerId });
        if (!chargesData) {
            return notFound(res, "Charges Form Not Found", []);
        }

        return success(res, "Charges Details", chargesData);
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
};



async function getAllCharges(req, res) {
    try {
        const {
            status,
            searchQuery,
            page = 1,
            limit = 10000
        } = req.query;

        // Validate the status
        const allowedStatuses = ["complete", "approve", "reAssign"];
        if (!status || !allowedStatuses.includes(status)) {
            return badRequest(
                res,
                `Invalid or missing status. Allowed values are: ${allowedStatuses.join(", ")}`
            );
        }

        // Build the match query for status
        const matchQuery = {};
        if (status === "complete") {
            matchQuery.status = "complete";
            matchQuery.approveStatus = { $in: ["pending", "reAssign"] };
        } else if (status === "approve") {
            matchQuery.status = "complete";
            matchQuery.approveStatus = "approve";
        } else if (status === "reAssign") {
            matchQuery.status = "pending";
            matchQuery.approveStatus = "reAssign";
        }

        // Build the pipeline
        const pipeline = [
            // First lookup applicantDetails to enable searching
            {
                $lookup: {
                    from: "applicantdetails",
                    localField: "customerId",
                    foreignField: "customerId",
                    as: "applicantDetails",
                },
            },

            // Lookup for customerDetails
            {
                $lookup: {
                    from: "customerdetails",
                    localField: "customerId",
                    foreignField: "_id",
                    as: "customerDetails",
                },
            },

            // Match based on status and search criteria
            {
                $match: {
                    ...matchQuery,
                    ...(searchQuery && {
                        $or: [
                            { "applicantDetails.fullName": { $regex: new RegExp(searchQuery, "i") } },
                            { "applicantDetails.fatherName": { $regex: new RegExp(searchQuery, "i") } },
                            { "applicantDetails.mobileNo": { $regex: new RegExp(searchQuery, "i") } },
                            { "customerDetails.customerFinId": { $regex: new RegExp(searchQuery, "i") } }
                        ]
                    })
                }
            },



            // Lookup for employees (salesEmployeeDetails)
            {
                $lookup: {
                    from: "employees",
                    localField: "salesemployeId",
                    foreignField: "_id",
                    as: "salesEmployeeDetails",
                },
            },

            // Lookup for manager details
            {
                $lookup: {
                    from: "employees",
                    localField: "salesEmployeeDetails.reportingManagerId",
                    foreignField: "_id",
                    as: "managerEmployeeDetails",
                },
            },

            // Lookup for branch details
            {
                $lookup: {
                    from: "newbranches",
                    localField: "salesEmployeeDetails.branchId",
                    foreignField: "_id",
                    as: "branchDetails",
                },
            },

            // Add fields to extract necessary details
            {
                $addFields: {
                    customerFinId: { $arrayElemAt: ["$customerDetails.customerFinId", 0] },
                    customerFullName: { $arrayElemAt: ["$applicantDetails.fullName", 0] },
                    customerFatherName: { $arrayElemAt: ["$applicantDetails.fatherName", 0] },
                    customerMobileNo: { $arrayElemAt: ["$applicantDetails.mobileNo", 0] },
                    employeeBranchName: { $arrayElemAt: ["$branchDetails.name", 0] },
                    salesEmployeeName: { $arrayElemAt: ["$salesEmployeeDetails.employeName", 0] },
                    salesEmployeeUserName: { $arrayElemAt: ["$salesEmployeeDetails.userName", 0] },
                    managerEmployeeName: { $arrayElemAt: ["$managerEmployeeDetails.employeName", 0] },
                    managerEmployeeUserName: { $arrayElemAt: ["$managerEmployeeDetails.userName", 0] },
                },
            },

            // Exclude unnecessary fields
            {
                $project: {
                    customerDetails: 0,
                    applicantDetails: 0,
                    salesEmployeeDetails: 0,
                    managerEmployeeDetails: 0,
                    branchDetails: 0,
                },
            },
        ];

        // Get total count for pagination
        const totalCount = await customerChargesModel.aggregate([
            ...pipeline,
            { $count: "total" }
        ]);

        // Add pagination to the main pipeline
        pipeline.push(
            { $skip: (page - 1) * limit },
            { $limit: parseInt(limit) }
        );

        // Execute the main query
        const chargesData = await customerChargesModel.aggregate(pipeline);

        // Return the enriched data with pagination info
        return success(res, `Charges ${status} List`, {
            count: chargesData.length,
            currentPage: parseInt(page),
            totalPages: Math.ceil((totalCount[0]?.total || 0) / limit),
            data: chargesData
        });

    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}

async function chargesDecisionByApprover(req, res) {
    try {
        const { status, customerId, remark } = req.body
        const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");
        const employeeId = req.Id

        const allowedStatuses = ["approve", "reAssign"];

        if (!status || !allowedStatuses.includes(status)) {
            return badRequest(res, `Invalid Status. Allowed To Be : ${allowedStatuses.join(", ")}`);
        }

        if (!customerId) {
            return badRequest(res, "Customer Id Required")
        }

        if (!remark) {
            return badRequest(res, "Remark Required")
        }

        const updateQuery = {
            approveEmployeId: employeeId,
            approveRemark: remark,
            approveStatus: status,
            $push: { approveDate: todayDate },
        };

        if (status === "reAssign") {
            updateQuery.status = "pending";
        }

        const chargesData = await customerChargesModel.findOneAndUpdate(
            { customerId },
            updateQuery,
            { new: true }
        );

        return success(res, `Charges ${status}`, chargesData);

    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
};


async function getAllPhysicalFileCouriers(req, res) {
    try {
        const {
            status,
            searchQuery,
            page = 1,
            limit = 10
        } = req.query;

        // Validate the status
        const allowedStatuses = ["complete", "approve", "reAssign"];
        if (!status || !allowedStatuses.includes(status)) {
            return badRequest(
                res,
                `Invalid or missing status. Allowed values are: ${allowedStatuses.join(", ")}`
            );
        }

        // Build the match query
        const matchQuery = {};
        if (status === "complete") {
            matchQuery.status = "complete";
            matchQuery.approveStatus = { $in: ["pending", "reAssign"] };
        } else if (status === "approve") {
            matchQuery.status = "complete";
            matchQuery.approveStatus = "approve";
        } else if (status === "reAssign") {
            matchQuery.status = "pending";
            matchQuery.approveStatus = "reAssign";
        }

        // Build the pipeline
        const pipeline = [
            // First lookup applicantDetails to enable searching
            {
                $lookup: {
                    from: "applicantdetails",
                    localField: "customerId",
                    foreignField: "customerId",
                    as: "applicantDetails",
                },
            },

            // Match based on status and search criteria
            {
                $match: {
                    ...matchQuery,
                    ...(searchQuery && {
                        $or: [
                            { "applicantDetails.fullName": { $regex: new RegExp(searchQuery, "i") } },
                            { "applicantDetails.fatherName": { $regex: new RegExp(searchQuery, "i") } },
                            { "applicantDetails.mobileNo": { $regex: new RegExp(searchQuery, "i") } }
                        ]
                    })
                }
            },

            // Lookup for customerDetails
            {
                $lookup: {
                    from: "customerdetails",
                    localField: "customerId",
                    foreignField: "_id",
                    as: "customerDetails",
                },
            },

            // Lookup for employees (salesEmployeeDetails)
            {
                $lookup: {
                    from: "employees",
                    localField: "salesemployeId",
                    foreignField: "_id",
                    as: "salesEmployeeDetails",
                },
            },

            // Lookup for manager details
            {
                $lookup: {
                    from: "employees",
                    localField: "salesEmployeeDetails.reportingManagerId",
                    foreignField: "_id",
                    as: "managerEmployeeDetails",
                },
            },

            // Lookup for branch details
            {
                $lookup: {
                    from: "newbranches",
                    localField: "salesEmployeeDetails.branchId",
                    foreignField: "_id",
                    as: "branchDetails",
                },
            },

            // Add fields to extract necessary details
            {
                $addFields: {
                    customerFinId: { $arrayElemAt: ["$customerDetails.customerFinId", 0] },
                    customerFullName: { $arrayElemAt: ["$applicantDetails.fullName", 0] },
                    customerFatherName: { $arrayElemAt: ["$applicantDetails.fatherName", 0] },
                    customerMobileNo: { $arrayElemAt: ["$applicantDetails.mobileNo", 0] },
                    employeeBranchName: { $arrayElemAt: ["$branchDetails.name", 0] },
                    salesEmployeeName: { $arrayElemAt: ["$salesEmployeeDetails.employeName", 0] },
                    salesEmployeeUserName: { $arrayElemAt: ["$salesEmployeeDetails.userName", 0] },
                    managerEmployeeName: { $arrayElemAt: ["$managerEmployeeDetails.employeName", 0] },
                    managerEmployeeUserName: { $arrayElemAt: ["$managerEmployeeDetails.userName", 0] },
                },
            },

            // Exclude unnecessary fields
            {
                $project: {
                    customerDetails: 0,
                    applicantDetails: 0,
                    salesEmployeeDetails: 0,
                    managerEmployeeDetails: 0,
                    branchDetails: 0,
                },
            },
        ];

        // Get total count for pagination
        const totalCount = await physicalFileCourierModel.aggregate([
            ...pipeline,
            { $count: "total" }
        ]);

        // Add pagination to the main pipeline
        pipeline.push(
            { $skip: (page - 1) * limit },
            { $limit: parseInt(limit) }
        );

        // Execute the main query
        const physicalFileData = await physicalFileCourierModel.aggregate(pipeline);

        // Return the enriched data with pagination info
        return success(res, `Physical File Courier ${status} List`, {
            count: physicalFileData.length,
            total: totalCount[0]?.total || 0,
            currentPage: parseInt(page),
            totalPages: Math.ceil((totalCount[0]?.total || 0) / limit),
            data: physicalFileData
        });

    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}

async function physicalFileDecisionByApprover(req, res) {
    try {
        const { status, customerId, remark } = req.body
        const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");
        const employeeId = req.Id

        const allowedStatuses = ["approve", "reAssign"];

        if (!status || !allowedStatuses.includes(status)) {
            return badRequest(res, `Invalid Status. Allowed To Be : ${allowedStatuses.join(", ")}`);
        }

        if (!customerId) {
            return badRequest(res, "Customer Id Required")
        }

        if (!remark) {
            return badRequest(res, "Remark Required")
        }

        const updateQuery = {
            approveEmployeId: employeeId,
            approveRemark: remark,
            approveStatus: status,
            $push: { approveDate: todayDate },
        };

        if (status === "reAssign") {
            updateQuery.status = "pending";
        }

        const physicalFileData = await physicalFileCourierModel.findOneAndUpdate(
            { customerId },
            updateQuery,
            { new: true }
        );

        return success(res, `Physical File Courier ${status}`, physicalFileData);

    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
};



async function allSalesFilesDashBoard(req, res) {
    try {
        const { branch, regionalbranch, employee, product, status, startDateFilter, endDateFilter, limit = 100000, page = 1, searchQuery } = req.query;
        const employeeId = req.Id;

        // Check cache first - this is the biggest performance improvement
        const cacheKey = JSON.stringify(req.query);
        const cachedResult = dashboardCache.get(cacheKey);
        if (cachedResult) {
            return success(res, "Sales Files Dashboard", cachedResult);
        }

        const employeeExist = await employeeModel.findOne(
            { _id: employeeId, status: "active" },
            { _id: 1 } // Only return ID field for efficiency
        );
        
        if (!employeeExist) {
            return badRequest(res, "Employee Not Found");
        }

        // Date handling - keep all your original filter logic intact
        let matchConditions = {};

        if (searchQuery) {
            matchConditions.$or = [
              { "applicantDetailData.mobileNo": { $regex: searchQuery, $options: "i" } },
              { "applicantDetailData.customerFatherName": { $regex: searchQuery, $options: "i" } },
              { "applicantDetailData.customerFullName": { $regex: searchQuery, $options: "i" } },
              { "customerDetailData.customerFinId": { $regex: searchQuery, $options: "i" } }
            ];
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
            matchConditions["salesCompleteDate"] = { $gte: formattedStart, $lt: formattedEnd };
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
            matchConditions["customerDetailData.employeId"] = { $in: employeeArray.map(id => new ObjectId(id)) };
        }

        if (product === "all" || product === '' || !product) {
            const excludedProductIds = ["6734821148d4dbfbe0c69c7e"];
            if (excludedProductIds.length > 0) {
                matchConditions["customerDetailData.productId"] = { $nin: excludedProductIds.map(id => new ObjectId(id)) };
            }
        }else{
            const productArray = Array.isArray(product) ? product : product.split(",");
            matchConditions["customerDetailData.productId"] = {
                $in: productArray.map(id => new ObjectId(id))
            };
        }

        if (status && status !== "all") {
            const statusArray = Array.isArray(status)
                ? status
                : status.split(",").map(s => s.trim());

            matchConditions["$or"] = [];

            if (statusArray.includes("loginDone")) {
                matchConditions["$or"].push({
                    $and: [
                        { statusByCibil: { $in: ["query", "notAssign"] } },
                        { applicantFormStart: true },
                        { applicantFormComplete: true },
                        { coApplicantFormStart: true },
                        { coApplicantFormComplete: true },
                        { guarantorFormStart: true },
                        { guarantorFormComplete: true },
                        { customerFormComplete: true }
                    ]
                });
            }

            if (statusArray.includes("logInPending")) {
                matchConditions["$or"].push({
                    $and: [
                        { statusByCibil: { $in: ["notAssign"] } },
                        {
                            $or: [
                                { applicantFormStart: false },
                                { applicantFormComplete: false },
                                { coApplicantFormStart: false },
                                { coApplicantFormComplete: false },
                                { guarantorFormStart: false },
                                { guarantorFormComplete: false }
                            ]
                        }
                    ]
                });
            }

            if (statusArray.includes("query")) {
                matchConditions["$or"].push({
                    $and: [
                        { statusByCibil: "query" },
                        {
                            $or: [
                                { guarantorFormStart: false },
                                { coApplicantFormStart: false },
                                { applicantFormStart: false }
                            ]
                        }
                    ]
                });
            }

            const otherStatuses = statusArray.filter(s => s !== "pending" && s !== "query");
            if (otherStatuses.length > 0) {
                matchConditions["$or"].push({ statusByCibil: { $in: otherStatuses } });
            }

            if (matchConditions["$or"].length === 0) {
                delete matchConditions["$or"];
            }
        }

        console.log(matchConditions,"matchConditions")
        // console.log('matchConditions----',matchConditions)

        // PERFORMANCE OPTIMIZATION: Split query into two
        // 1. First get counts with minimal data
        // 2. Then get the actual file details with pagination
        
        // Build the common lookup stages for both pipelines
        const commonLookups = [
            {
                $lookup: {
                    from: "customerdetails",
                    let: { customerId: "$customerId" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$customerId"] } } },
                        { $project: { 
                            _id: 1, 
                            employeId: 1, 
                            orderId: 1,
                            paymentStatus: 1,
                            loginFees: 1,
                            branch: 1,
                            customerFinId: 1,
                            createdAt: 1,
                            productId: 1
                        }}
                    ],
                    as: "customerDetailData"
                }
            },
            { $unwind: { path: "$customerDetailData", preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: "newbranches",
                    let: { branchId: "$customerDetailData.branch" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$branchId"] } } },
                        { $project: { _id: 1, name: 1, regionalBranchId: 1 }}
                    ],
                    as: "branchDetails"
                }
            },
            { $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: "newbranches",
                    let: { regionalId: "$branchDetails.regionalBranchId" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$regionalId"] } } },
                        { $project: { _id: 1, name: 1 }}
                    ],
                    as: "regionalBranchDetails"
                }
            },
            { $unwind: { path: "$regionalBranchDetails", preserveNullAndEmptyArrays: true } }
        ];

        // Pipeline for counts only
        const countsPipeline = [
            ...commonLookups,
            { $match: matchConditions },
            {
                $group: {
                    _id: "$customerId",
                    customerFormComplete: { $first: "$customerFormComplete" },
                    applicantFormStart: { $first: "$applicantFormStart" },
                    applicantFormComplete: { $first: "$applicantFormComplete" },
                    coApplicantFormStart: { $first: "$coApplicantFormStart" },
                    coApplicantFormComplete: { $first: "$coApplicantFormComplete" },
                    guarantorFormStart: { $first: "$guarantorFormStart" },
                    guarantorFormComplete: { $first: "$guarantorFormComplete" },
                    statusByCibil: { $first: "$statusByCibil" },
                    paymentStatus: { $first: "$customerDetailData.paymentStatus" }
                }
            },
            {
                $facet: {
                    totalCases: [{ $count: "total" }],
                    "paymentDoneCases": [
                        {
                            "$match": {
                                "customerFormComplete": true,
                                "paymentStatus": "success"
                            }
                        },
                        { "$count": "paymentDone" }
                    ],
                    "loginDoneCases": [
                        {
                            "$match": {
                                "statusByCibil": { $in: ["notAssign", "query"] },
                                "customerFormComplete": true,
                                "applicantFormStart": true,
                                "applicantFormComplete": true,
                                "coApplicantFormStart": true,
                                "coApplicantFormComplete": true,
                                "guarantorFormStart": true,
                                "guarantorFormComplete": true
                            }
                        },
                        { "$count": "loginDone" }
                    ],
                    "loginPendingCases": [
                        {
                            "$match": {
                                "statusByCibil": { $in: ["notAssign"] },
                                "$or": [
                                    { "applicantFormStart": false },
                                    { "applicantFormComplete": false },
                                    { "coApplicantFormStart": false },
                                    { "coApplicantFormComplete": false },
                                    { "guarantorFormStart": false },
                                    { "guarantorFormComplete": false }
                                ]
                            }
                        },
                        { "$count": "loginPending" }
                    ],
                    "loginQueryCases": [
                        {
                            "$match": {
                                "statusByCibil": "query",
                                "$or": [
                                    { "applicantFormStart": false },
                                    { "coApplicantFormStart": false },
                                    { "guarantorFormStart": false }
                                ]
                            }
                        },
                        { "$count": "query" }
                    ],
                    "approvedCases": [
                        { "$match": { "statusByCibil": "approved" } },
                        { "$count": "approved" }
                    ],
                    "rejectedCases": [
                        { "$match": { "statusByCibil": "rejected" } },
                        { "$count": "rejected" }
                    ]
                }
            }
        ];

        // Pipeline for file details with pagination
        const detailsPipeline = [
            ...commonLookups,
            
            // Add additional lookups only for the details pipeline
            {
                $lookup: {
                    from: "employees",
                    let: { empId: "$customerDetailData.employeId" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$empId"] } } },
                        { $project: { _id: 1, employeName: 1, employeUniqueId: 1, reportingManagerId: 1 }}
                    ],
                    as: "salesPerson"
                }
            },
            { $unwind: { path: "$salesPerson", preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: "employees",
                    let: { mgr1Id: "$salesPerson.reportingManagerId" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$mgr1Id"] } } },
                        { $project: { _id: 1, employeName: 1, reportingManagerId: 1 }}
                    ],
                    as: "firstReportingManager"
                }
            },
            { $unwind: { path: "$firstReportingManager", preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: "employees",
                    let: { mgr2Id: "$firstReportingManager.reportingManagerId" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$mgr2Id"] } } },
                        { $project: { _id: 1, employeName: 1, reportingManagerId: 1 }}
                    ],
                    as: "secondReportingManager"
                }
            },
            { $unwind: { path: "$secondReportingManager", preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: "employees",
                    let: { mgr3Id: "$secondReportingManager.reportingManagerId" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$mgr3Id"] } } },
                        { $project: { _id: 1, employeName: 1, reportingManagerId: 1 }}
                    ],
                    as: "thirdReportingManager"
                }
            },
            { $unwind: { path: "$thirdReportingManager", preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: "employees",
                    let: { mgr4Id: "$thirdReportingManager.reportingManagerId" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$mgr4Id"] } } },
                        { $project: { _id: 1, employeName: 1 }}
                    ],
                    as: "forthReportingManager"
                }
            },
            { $unwind: { path: "$forthReportingManager", preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: "applicantdetails",
                    let: { custId: "$customerId" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$customerId", "$$custId"] } } },
                        { $project: { _id: 1, fullName: 1, fatherName: 1, mobileNo: 1 }}
                    ],
                    as: "applicantDetailData"
                }
            },
            { $unwind: { path: "$applicantDetailData", preserveNullAndEmptyArrays: true } },

            // Add calculated fields
            {
                $addFields: {
                    loginDate: { $ifNull: ["$customerDetailData.createdAt", ""] },
                    customerId: { $ifNull: ["$customerId", ""] },
                    customerFinId: { $ifNull: ["$customerDetailData.customerFinId", ""] },
                    branchName: { $ifNull: ["$branchDetails.name", ""] },
                    branch_id: { $ifNull: ["$branchDetails._id", ""] },
                    regionalBranchName: { $ifNull: ["$regionalBranchDetails.name", ""] },
                    customerFullName: { $ifNull: ["$applicantDetailData.fullName", ""] },
                    customerFatherName: { $ifNull: ["$applicantDetailData.fatherName", ""] },
                    mobileNo: { $ifNull: ["$applicantDetailData.mobileNo", ""] },
                    salesPersonUniqueId: { $ifNull: ["$salesPerson.employeUniqueId", ""] },
                    salesPersonName: { $ifNull: ["$salesPerson.employeName", ""] },
                    salesPersonManagerName1: { $ifNull: ["$firstReportingManager.employeName", ""] },
                    salesPersonManagerName2: { $ifNull: ["$secondReportingManager.employeName", ""] },
                    salesPersonManagerName3: { $ifNull: ["$thirdReportingManager.employeName", ""] },
                    salesPersonManagerName4: { $ifNull: ["$forthReportingManager.employeName", ""] },
                    paymentId: { $ifNull: ["$customerDetailData.orderId", ""] },
                    paymentStatus: { $ifNull: ["$customerDetailData.paymentStatus", ""] },
                    amount: { $ifNull: ["$customerDetailData.loginFees", ""] },
                    paymentDate: {
                        $cond: {
                            if: { $eq: ["$customerDetailData.paymentStatus", "success"] },
                            then: {
                                $cond: {
                                    if: {
                                        $or: [
                                            { $eq: [{ $ifNull: ["$customerdetailData.paymentDate", null] }, ""] },
                                            { $eq: [{ $ifNull: ["$customerdetailData.paymentDate", null] }, null] }
                                        ]
                                    },
                                    then: "$updatedAt",
                                    else: "$customerdetailData.paymentDate",
                                }
                            },
                            else: ""
                        }
                    },
                    salesEmployeId: { $ifNull: ["$employeId", ""] },
                }
            },

            // Apply filters
            { $match: matchConditions },

            // Group by customer ID to deduplicate
            {
                $group: {
                    _id: "$customerId",
                    customerId: { $first: "$customerId" },
                    customerFinId: { $first: "$customerFinId" },
                    loginDate: { $first: "$loginDate" },
                    branchName: { $first: "$branchName" },
                    branch_id: { $first: "$branch_id" },
                    regionalBranchName: { $first: "$regionalBranchName" },
                    customerFullName: { $first: "$customerFullName" },
                    customerFatherName: { $first: "$customerFatherName" },
                    mobileNo: { $first: "$mobileNo" },
                    salesPersonUniqueId: { $first: "$salesPersonUniqueId" },
                    salesPersonName: { $first: "$salesPersonName" },
                    salesPersonManagerName1: { $first: "$salesPersonManagerName1" },
                    salesPersonManagerName2: { $first: "$salesPersonManagerName2" },
                    salesPersonManagerName3: { $first: "$salesPersonManagerName3" },
                    salesPersonManagerName4: { $first: "$salesPersonManagerName4" },
                    paymentId: { $first: "$paymentId" },
                    paymentStatus: { $first: "$paymentStatus" },
                    amount: { $first: "$amount" },
                    paymentDate: { $first: "$paymentDate" },
                    salesEmployeId: { $first: "$salesEmployeId" },
                    statusByCibil: { $first: "$statusByCibil" }
                }
            },
            
            // Apply pagination and only retrieve needed fields
            { $sort: { loginDate: -1 } }, // Add sorting
            { $skip: (page - 1) * limit },
            { $limit: parseInt(limit) },
            {
                $project: {
                    _id: 0,
                    customerId: 1,
                    customerFinId: 1,
                    loginDate: {  $dateToString: {
                        format: "%Y-%m-%d",
                        date: { $toDate: "$loginDate" }
                      }
                    },
                    branchName: 1,
                    branch_id: 1,
                    regionalBranchName: 1,
                    salesPersonName: 1,
                    salesPersonUniqueId: 1,
                    salesPersonManagerName1: 1,
                    salesPersonManagerName2: 1,
                    salesPersonManagerName3: 1,
                    salesPersonManagerName4: 1,
                    reportingManagerName: 1,
                    customerFullName: 1,
                    customerFatherName: 1,
                    mobileNo: 1,
                    // paymentDate: 1,
                    paymentDate: {
                        $cond: [
                          { $or: [
                            { $eq: ["$paymentDate", ""] },                  // Empty string
                            { $eq: [{ $type: "$paymentDate" }, "missing"] } // Field missing
                          ]},
                          "",  // Then: return empty string
                          {
                            $dateToString: {
                              format: "%Y-%m-%d",
                              date: {
                                $cond: [
                                  { $eq: [{ $type: "$paymentDate" }, "date"] },
                                  "$paymentDate",                // Already a Date
                                  { $toDate: "$paymentDate" }    // Convert from string
                                ]
                              }
                            }
                          }
                        ]
                      },
                    paymentStatus: 1,
                    paymentId: 1,
                    amount: 1,
                    salesEmployeeId: 1,
                    statusByCibil: 1
                }
            }
        ];

        // Run both queries in parallel
        const [countsResult, detailsResult] = await Promise.all([
            processModel.aggregate(countsPipeline, { allowDiskUse: true }),
            processModel.aggregate(detailsPipeline, { allowDiskUse: true })
        ]);

        const counts = countsResult[0] || {};
        
        const response = {
            totalCases: ((counts.rejectedCases[0]?.rejected || 0) +
                (counts.approvedCases[0]?.approved || 0) +
                (counts.loginQueryCases[0]?.query || 0) +
                (counts.loginPendingCases[0]?.loginPending || 0) +
                (counts.loginDoneCases[0]?.loginDone || 0)),
            paymentDoneCases: counts.paymentDoneCases[0]?.paymentDone || 0,
            loginPendingCases: counts.loginPendingCases[0]?.loginPending || 0,
            loginDoneCases: counts.loginDoneCases[0]?.loginDone || 0,
            loginQueryCases: counts.loginQueryCases[0]?.query || 0,
            approvedCases: counts.approvedCases[0]?.approved || 0,
            rejectedCases: counts.rejectedCases[0]?.rejected || 0,
            fileDetails: detailsResult || [],
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(counts.totalCases[0]?.total / parseInt(limit)),
                totalItems: counts.totalCases[0]?.total || 0,
            },
        };

        // Cache the result for future requests
        dashboardCache.set(cacheKey, response);
        
        return success(res, "Sales Files Dashboard", response);
    } catch (error) {
        console.error(error);
        return unknownError(res, error);
    }
}

//dashboardMonthlyCount

// async function dashboardMonthlyCount(req, res) {
//     try {
//         // console.log("fn 2 call")
//         const { branch, regionalbranch, employee, product, status, startDateFilter, endDateFilter, searchQuery } = req.query;
//         const employeeId = req.Id;

//         // Check cache first - this is the biggest performance improvement
//         const cacheKey = JSON.stringify(req.query);
//         const cachedResult = dashboardMonthCountCache.get(cacheKey);
//         if (cachedResult) {
//             return success(res, "Sales Files Dashboard", cachedResult);
//         }

//         const employeeExist = await employeeModel.findOne(
//             { _id: employeeId, status: "active" },
//             { _id: 1 } // Only return ID field for efficiency
//         );
        
//         if (!employeeExist) {
//             return badRequest(res, "Employee Not Found");
//         }
        
//         // Date handling - keep all your original filter logic intact
//         let matchConditions = {};
        
//         if (searchQuery) {
//             matchConditions.$or = [
//               { "applicantDetailData.mobileNo": { $regex: searchQuery, $options: "i" } },
//               { "applicantDetailData.customerFatherName": { $regex: searchQuery, $options: "i" } },
//               { "applicantDetailData.customerFullName": { $regex: searchQuery, $options: "i" } },
//               { "customerDetailData.customerFinId": { $regex: searchQuery, $options: "i" } }
//             ];
//         }
        
//         const today = new Date();
//         const currentYear = today.getFullYear();
//         const defaultStartDate = new Date(today.setHours(0, 0, 0, 0));
//         const defaultEndDate = new Date(today.setHours(23, 59, 59, 999));

//         function formatDateToISO(date) {
//             return new Date(date).toISOString();
//         }
        
//         // MODIFIED: Better date filter logic
//         let formattedStart, formattedEnd;
        
//         if (startDateFilter && startDateFilter !== "all") {
//             formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
//         } else {
//             // If no start date, default to January 1st of the current year
//             formattedStart = new Date(currentYear, 0, 1, 0, 0, 0, 0);
//         }
            
//         if (endDateFilter && endDateFilter !== "all") {
//             formattedEnd = new Date(new Date(endDateFilter).setHours(23, 59, 59, 999));
//         } else {
//             // If no end date, default to December 31st of the current year
//             formattedEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999);
//         }

//         if (startDateFilter && endDateFilter && startDateFilter === endDateFilter) {
//             formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
//             formattedEnd = new Date(new Date(startDateFilter).setHours(23, 59, 59, 999));
//         }

//         formattedStart = formatDateToISO(formattedStart);
//         formattedEnd = formatDateToISO(formattedEnd);
        
//         // Always apply date filter now
//         matchConditions["salesCompleteDate"] = { $gte: formattedStart, $lt: formattedEnd };
        
//         if (branch && branch !== "all") {
//             const branchArray = Array.isArray(branch) ? branch : branch.split(",");
//             matchConditions["branchDetails._id"] = { $in: branchArray.map(id => new ObjectId(id)) };
//         }
        
//         if (regionalbranch && regionalbranch !== "all") {
//             const regionalbranchArray = Array.isArray(regionalbranch) ? regionalbranch : regionalbranch.split(",");
//             matchConditions["regionalBranchDetails._id"] = { $in: regionalbranchArray.map(id => new ObjectId(id)) };
//         }

//         if (employee && employee !== "all") {
//             const employeeArray = Array.isArray(employee) ? employee : employee.split(",");
//             matchConditions["customerDetailData.employeId"] = { $in: employeeArray.map(id => new ObjectId(id)) };
//         }

//         if (product === "all" || product === '' || !product) {
//             const excludedProductIds = ["6734821148d4dbfbe0c69c7e"];
//             if (excludedProductIds.length > 0) {
//                 matchConditions["customerDetailData.productId"] = { $nin: excludedProductIds.map(id => new ObjectId(id)) };
//             }
//         } else {
//             const productArray = Array.isArray(product) ? product : product.split(",");
//             matchConditions["customerDetailData.productId"] = {
//                 $in: productArray.map(id => new ObjectId(id))
//             };
//         }
        
//         if (status && status !== "all") {
//             // Status filter logic remains unchanged
//             const statusArray = Array.isArray(status)
//                 ? status
//                 : status.split(",").map(s => s.trim());
            
//             matchConditions["$or"] = [];
            
//             if (statusArray.includes("loginDone")) {
//                 matchConditions["$or"].push({
//                     $and: [
//                         { statusByCibil: { $in: ["query", "notAssign"] } },
//                         { applicantFormStart: true },
//                         { applicantFormComplete: true },
//                         { coApplicantFormStart: true },
//                         { coApplicantFormComplete: true },
//                         { guarantorFormStart: true },
//                         { guarantorFormComplete: true },
//                         { customerFormComplete: true }
//                     ]
//                 });
//             }

//             if (statusArray.includes("logInPending")) {
//                 matchConditions["$or"].push({
//                     $and: [
//                         { statusByCibil: { $in: ["notAssign"] } },
//                         {
//                             $or: [
//                                 { applicantFormStart: false },
//                                 { applicantFormComplete: false },
//                                 { coApplicantFormStart: false },
//                                 { coApplicantFormComplete: false },
//                                 { guarantorFormStart: false },
//                                 { guarantorFormComplete: false }
//                             ]
//                         }
//                     ]
//                 });
//             }

//             if (statusArray.includes("query")) {
//                 matchConditions["$or"].push({
//                     $and: [
//                         { statusByCibil: "query" },
//                         {
//                             $or: [
//                                 { guarantorFormStart: false },
//                                 { coApplicantFormStart: false },
//                                 { applicantFormStart: false }
//                             ]
//                         }
//                     ]
//                 });
//             }
            
//             const otherStatuses = statusArray.filter(s => s !== "pending" && s !== "query");
//             if (otherStatuses.length > 0) {
//                 matchConditions["$or"].push({ statusByCibil: { $in: otherStatuses } });
//             }

//             if (matchConditions["$or"].length === 0) {
//                 delete matchConditions["$or"];
//             }
//         }
        
//         // Build the common lookup stages for both pipelines
//         const commonLookups = [
//             {
//                 $lookup: {
//                     from: "customerdetails",
//                     let: { customerId: "$customerId" },
//                     pipeline: [
//                         { $match: { $expr: { $eq: ["$_id", "$$customerId"] } } },
//                         { $project: { 
//                             _id: 1, 
//                             employeId: 1, 
//                             orderId: 1,
//                             paymentStatus: 1,
//                             loginFees: 1,
//                             branch: 1,
//                             customerFinId: 1,
//                             createdAt: 1,
//                             productId: 1
//                         }}
//                     ],
//                     as: "customerDetailData"
//                 }
//             },
//             { $unwind: { path: "$customerDetailData", preserveNullAndEmptyArrays: true } },
            
//             {
//                 $lookup: {
//                     from: "newbranches",
//                     let: { branchId: "$customerDetailData.branch" },
//                     pipeline: [
//                         { $match: { $expr: { $eq: ["$_id", "$$branchId"] } } },
//                         { $project: { _id: 1, name: 1, regionalBranchId: 1 }}
//                     ],
//                     as: "branchDetails"
//                 }
//             },
//             { $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true } },

//             {
//                 $lookup: {
//                     from: "newbranches",
//                     let: { regionalId: "$branchDetails.regionalBranchId" },
//                     pipeline: [
//                         { $match: { $expr: { $eq: ["$_id", "$$regionalId"] } } },
//                         { $project: { _id: 1, name: 1 }}
//                     ],
//                     as: "regionalBranchDetails"
//                 }
//             },
//             { $unwind: { path: "$regionalBranchDetails", preserveNullAndEmptyArrays: true } }
//         ];

//         // MODIFIED: Get monthly ranges for the period between start and end date
//         function getMonthlyDateRangesBetweenDates(startDate, endDate) {
//             const ranges = [];
//             const start = new Date(startDate);
//             const end = new Date(endDate);
            
//             // Set to beginning of the month
//             const currentDate = new Date(start.getFullYear(), start.getMonth(), 1);
            
//             // Iterate through each month in the range
//             while (currentDate <= end) {
//                 const year = currentDate.getFullYear();
//                 const month = currentDate.getMonth();
                
//                 // First day of month
//                 const monthStart = new Date(year, month, 1, 0, 0, 0, 0);
//                 // Last day of month
//                 const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
                
//                 ranges.push({
//                     month: month + 1,
//                     monthName: new Date(year, month).toLocaleString('default', { month: 'short' }),
//                     year: year,
//                     startDate: monthStart.toISOString(),
//                     endDate: monthEnd.toISOString(),
//                     displayLabel: `${new Date(year, month).toLocaleString('default', { month: 'short' })} ${year}`
//                 });
                
//                 // Move to next month
//                 currentDate.setMonth(currentDate.getMonth() + 1);
//             }
            
//             return ranges;
//         }

//         // Use date range between start and end dates
//         let startDateForRange = new Date(currentYear, 0, 1); // Default to Jan 1 of current year
//         let endDateForRange = new Date(currentYear, 11, 31); // Default to Dec 31 of current year
        
//         if (startDateFilter && startDateFilter !== "all") {
//             startDateForRange = new Date(startDateFilter);
//         }
        
//         if (endDateFilter && endDateFilter !== "all") {
//             endDateForRange = new Date(endDateFilter);
//         }
        
//         const monthlyRanges = getMonthlyDateRangesBetweenDates(startDateForRange, endDateForRange);
//         console.log(`API month count between ${startDateForRange.toISOString()} and ${endDateForRange.toISOString()}`);

//         // Pipeline for monthly counts
//         const monthlyCasesPipeline = async () => {
//             const monthlyData = [];
            
//             // Process each month in our date range
//             for (const monthRange of monthlyRanges) {
//                 // Create a copy of matchConditions for this month
//                 const monthMatchConditions = { ...matchConditions };
                
//                 // Override the global date filter with this month's range for monthly breakdown
//                 monthMatchConditions.salesCompleteDate = { 
//                     $gte: monthRange.startDate, 
//                     $lt: monthRange.endDate 
//                 };

//                 const pipeline = [
//                     ...commonLookups,
//                     { $match: monthMatchConditions },
//                     {
//                         $group: {
//                             _id: "$customerId",
//                             customerFormComplete: { $first: "$customerFormComplete" },
//                             applicantFormStart: { $first: "$applicantFormStart" },
//                             applicantFormComplete: { $first: "$applicantFormComplete" },
//                             coApplicantFormStart: { $first: "$coApplicantFormStart" },
//                             coApplicantFormComplete: { $first: "$coApplicantFormComplete" },
//                             guarantorFormStart: { $first: "$guarantorFormStart" },
//                             guarantorFormComplete: { $first: "$guarantorFormComplete" },
//                             statusByCibil: { $first: "$statusByCibil" },
//                             paymentStatus: { $first: "$customerDetailData.paymentStatus" }
//                         }
//                     },
//                     {
//                         $facet: {
//                             totalCases: [{ $count: "total" }],
//                             "paymentDoneCases": [
//                                 {
//                                     "$match": {
//                                         "customerFormComplete": true,
//                                         "paymentStatus": "success"
//                                     }
//                                 },
//                                 { "$count": "paymentDone" }
//                             ],
//                             "loginDoneCases": [
//                                 {
//                                     "$match": {
//                                         "statusByCibil": { $in: ["notAssign", "query"] },
//                                         "customerFormComplete": true,
//                                         "applicantFormStart": true,
//                                         "applicantFormComplete": true,
//                                         "coApplicantFormStart": true,
//                                         "coApplicantFormComplete": true,
//                                         "guarantorFormStart": true,
//                                         "guarantorFormComplete": true
//                                     }
//                                 },
//                                 { "$count": "loginDone" }
//                             ],
//                             "loginPendingCases": [
//                                 {
//                                     "$match": {
//                                         "statusByCibil": { $in: ["notAssign"] },
//                                         "$or": [
//                                             { "applicantFormStart": false },
//                                             { "applicantFormComplete": false },
//                                             { "coApplicantFormStart": false },
//                                             { "coApplicantFormComplete": false },
//                                             { "guarantorFormStart": false },
//                                             { "guarantorFormComplete": false }
//                                         ]
//                                     }
//                                 },
//                                 { "$count": "loginPending" }
//                             ],
//                             "loginQueryCases": [
//                                 {
//                                     "$match": {
//                                         "statusByCibil": "query",
//                                         "$or": [
//                                             { "applicantFormStart": false },
//                                             { "coApplicantFormStart": false },
//                                             { "guarantorFormStart": false }
//                                         ]
//                                     }
//                                 },
//                                 { "$count": "query" }
//                             ],
//                             "approvedCases": [
//                                 { "$match": { "statusByCibil": "approved" } },
//                                 { "$count": "approved" }
//                             ],
//                             "rejectedCases": [
//                                 { "$match": { "statusByCibil": "rejected" } },
//                                 { "$count": "rejected" }
//                             ]
//                         }
//                     }
//                 ];

//                 const result = await processModel.aggregate(pipeline, { allowDiskUse: true });
//                 const counts = result[0] || {};
                
//                 // Calculate total using sum of individual counts
//                 const totalCases = (
//                     (counts.rejectedCases[0]?.rejected || 0) +
//                     (counts.approvedCases[0]?.approved || 0) +
//                     (counts.loginQueryCases[0]?.query || 0) +
//                     (counts.loginPendingCases[0]?.loginPending || 0) +
//                     (counts.loginDoneCases[0]?.loginDone || 0)
//                 );
                
//                 // Only include months that have data
//                 if (totalCases > 0) {
//                     monthlyData.push({
//                         month: monthRange.monthName,
//                         monthYear: monthRange.displayLabel,
//                         total: totalCases,
//                         approved: counts.approvedCases[0]?.approved || 0,
//                         pending: (counts.loginPendingCases[0]?.loginPending || 0) + 
//                                 (counts.loginDoneCases[0]?.loginDone || 0) + 
//                                 (counts.loginQueryCases[0]?.query || 0),
//                         reject: counts.rejectedCases[0]?.rejected || 0,
//                         rejectBySales: 0, // Add this if you have this data
//                         leadConvert: 0,   // Add this if you have this data
                        
//                         // Keep these for compatibility with your original implementation
//                         monthName: monthRange.monthName,
//                         year: monthRange.year,
//                         displayLabel: monthRange.displayLabel,
//                         paymentDoneCases: counts.paymentDoneCases[0]?.paymentDone || 0,
//                         loginPendingCases: counts.loginPendingCases[0]?.loginPending || 0,
//                         loginDoneCases: counts.loginDoneCases[0]?.loginDone || 0,
//                         loginQueryCases: counts.loginQueryCases[0]?.query || 0,
//                         approvedCases: counts.approvedCases[0]?.approved || 0,
//                         rejectedCases: counts.rejectedCases[0]?.rejected || 0,
//                     });
//                 }
//             }
            
//             return monthlyData;
//         };

//         // Pipeline for counts only (overall counts)
//         const countsPipeline = [
//             ...commonLookups,
//             { $match: matchConditions },
//             {
//                 $group: {
//                     _id: "$customerId",
//                     customerFormComplete: { $first: "$customerFormComplete" },
//                     applicantFormStart: { $first: "$applicantFormStart" },
//                     applicantFormComplete: { $first: "$applicantFormComplete" },
//                     coApplicantFormStart: { $first: "$coApplicantFormStart" },
//                     coApplicantFormComplete: { $first: "$coApplicantFormComplete" },
//                     guarantorFormStart: { $first: "$guarantorFormStart" },
//                     guarantorFormComplete: { $first: "$guarantorFormComplete" },
//                     statusByCibil: { $first: "$statusByCibil" },
//                     paymentStatus: { $first: "$customerDetailData.paymentStatus" }
//                 }
//             },
//             {
//                 $facet: {
//                     totalCases: [{ $count: "total" }],
//                     "paymentDoneCases": [
//                         {
//                             "$match": {
//                                 "customerFormComplete": true,
//                                 "paymentStatus": "success"
//                             }
//                         },
//                         { "$count": "paymentDone" }
//                     ],
//                     "loginDoneCases": [
//                         {
//                             "$match": {
//                                 "statusByCibil": { $in: ["notAssign", "query"] },
//                                 "customerFormComplete": true,
//                                 "applicantFormStart": true,
//                                 "applicantFormComplete": true,
//                                 "coApplicantFormStart": true,
//                                 "coApplicantFormComplete": true,
//                                 "guarantorFormStart": true,
//                                 "guarantorFormComplete": true
//                             }
//                         },
//                         { "$count": "loginDone" }
//                     ],
//                     "loginPendingCases": [
//                         {
//                             "$match": {
//                                 "statusByCibil": { $in: ["notAssign"] },
//                                 "$or": [
//                                     { "applicantFormStart": false },
//                                     { "applicantFormComplete": false },
//                                     { "coApplicantFormStart": false },
//                                     { "coApplicantFormComplete": false },
//                                     { "guarantorFormStart": false },
//                                     { "guarantorFormComplete": false }
//                                 ]
//                             }
//                         },
//                         { "$count": "loginPending" }
//                     ],
//                     "loginQueryCases": [
//                         {
//                             "$match": {
//                                 "statusByCibil": "query",
//                                 "$or": [
//                                     { "applicantFormStart": false },
//                                     { "coApplicantFormStart": false },
//                                     { "guarantorFormStart": false }
//                                 ]
//                             }
//                         },
//                         { "$count": "query" }
//                     ],
//                     "approvedCases": [
//                         { "$match": { "statusByCibil": "approved" } },
//                         { "$count": "approved" }
//                     ],
//                     "rejectedCases": [
//                         { "$match": { "statusByCibil": "rejected" } },
//                         { "$count": "rejected" }
//                     ]
//                 }
//             }
//         ];

//         // Run queries in parallel
//         const [countsResult, monthlyData] = await Promise.all([
//             processModel.aggregate(countsPipeline, { allowDiskUse: true }),
//             monthlyCasesPipeline()
//         ]);

//         const counts = countsResult[0] || {};
//         console.log('api test-/-/-/-')
        
//         // Calculate totalCases the same way as in first API
//         const response = {
//             totalCases: ((counts.rejectedCases[0]?.rejected || 0) +
//                 (counts.approvedCases[0]?.approved || 0) +
//                 (counts.loginQueryCases[0]?.query || 0) +
//                 (counts.loginPendingCases[0]?.loginPending || 0) +
//                 (counts.loginDoneCases[0]?.loginDone || 0)),
//             paymentDoneCases: counts.paymentDoneCases[0]?.paymentDone || 0,
//             loginPendingCases: counts.loginPendingCases[0]?.loginPending || 0,
//             loginDoneCases: counts.loginDoneCases[0]?.loginDone || 0,
//             loginQueryCases: counts.loginQueryCases[0]?.query || 0,
//             approvedCases: counts.approvedCases[0]?.approved || 0,
//             rejectedCases: counts.rejectedCases[0]?.rejected || 0,
            
//             // // Use the new format and naming for monthly data
//             // monthlyLeadCounts: monthlyData,
//             monthlyData: monthlyData,
//         };

//         // Add date range information to the response
//         response.startDate = startDateForRange.toISOString().split('T')[0];
//         response.endDate = endDateForRange.toISOString().split('T')[0];
//         response.hasFilters = Boolean(
//             (branch && branch !== "all") || 
//             (regionalbranch && regionalbranch !== "all") || 
//             (employee && employee !== "all") || 
//             (product && product !== "all") || 
//             (status && status !== "all") ||
//             (startDateFilter && startDateFilter !== "all") ||
//             (endDateFilter && endDateFilter !== "all") ||
//             searchQuery
//         );
        
//         // Cache the result for future requests
//         dashboardMonthCountCache.set(cacheKey, response);
        
//         return success(res, "Sales Files Dashboard", response);
//     } catch (error) {
//         console.error(error);
//         return unknownError(res, error);
//     }
// }
async function dashboardMonthlyCount(req, res) {
    try {
        const { branch, regionalbranch, employee, product, status, startDateFilter, endDateFilter, searchQuery } = req.query;
        const employeeId = req.Id;

        // Check cache first - this is the biggest performance improvement
        const cacheKey = JSON.stringify(req.query);
        const cachedResult = dashboardMonthCountCache.get(cacheKey);
        if (cachedResult) {
            return success(res, "Sales Files Dashboard", cachedResult);
        }

        const employeeExist = await employeeModel.findOne(
            { _id: employeeId, status: "active" },
            { _id: 1 }
        );
        
        if (!employeeExist) {
            return badRequest(res, "Employee Not Found");
        }
        
        // Date handling with the three conditions
        let matchConditions = {};
        
        if (searchQuery) {
            matchConditions.$or = [
              { "applicantDetailData.mobileNo": { $regex: searchQuery, $options: "i" } },
              { "applicantDetailData.customerFatherName": { $regex: searchQuery, $options: "i" } },
              { "applicantDetailData.customerFullName": { $regex: searchQuery, $options: "i" } },
              { "customerDetailData.customerFinId": { $regex: searchQuery, $options: "i" } }
            ];
        }
        
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth(); // 0-based (0 = January, 11 = December)
        
        // Process date ranges for the three cases
        let formattedStart, formattedEnd;
        let showOnlyMonthsWithData = false;
        
        if (startDateFilter && startDateFilter !== "all" && endDateFilter && endDateFilter !== "all") {
            // Handle date filter case
            const startYear = new Date(startDateFilter).getFullYear();
            const endYear = new Date(endDateFilter).getFullYear();
            
            // Case 2 & 3: Date filter applied
            if (startYear !== endYear) {
                // Case 3: Cross-year filter (e.g., 2024-2025) - only show months with data
                showOnlyMonthsWithData = true;
            }
            // Otherwise, it's Case 2: Same year filter (e.g., Jan 2024-Oct 2024) - show all months in range
            
            formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
            formattedEnd = new Date(new Date(endDateFilter).setHours(23, 59, 59, 999));
        } else {
            // Case 1: Default - current year to present month
            formattedStart = new Date(currentYear, 0, 1, 0, 0, 0, 0); // January 1st of current year
            formattedEnd = new Date(currentYear, currentMonth, today.getDate(), 23, 59, 59, 999); // Today
        }

        if (startDateFilter && endDateFilter && startDateFilter === endDateFilter) {
            // Same day filter
            formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
            formattedEnd = new Date(new Date(startDateFilter).setHours(23, 59, 59, 999));
            showOnlyMonthsWithData = true; // Only show that specific month if it has data
        }
        
        // Store the dates as strings to avoid MongoDB date parsing issues
        const formattedStartStr = formattedStart.toISOString();
        const formattedEndStr = formattedEnd.toISOString();
        
        console.log(`Date Range: ${formattedStartStr} to ${formattedEndStr}, Show only months with data: ${showOnlyMonthsWithData}`);
        
        // Apply other filters
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
            matchConditions["customerDetailData.employeId"] = { $in: employeeArray.map(id => new ObjectId(id)) };
        }

        if (product === "all" || product === '' || !product) {
            const excludedProductIds = ["6734821148d4dbfbe0c69c7e"];
            if (excludedProductIds.length > 0) {
                matchConditions["customerDetailData.productId"] = { $nin: excludedProductIds.map(id => new ObjectId(id)) };
            }
        } else {
            const productArray = Array.isArray(product) ? product : product.split(",");
            matchConditions["customerDetailData.productId"] = {
                $in: productArray.map(id => new ObjectId(id))
            };
        }
        
        if (status && status !== "all") {
            // Status filter logic remains unchanged
            const statusArray = Array.isArray(status)
                ? status
                : status.split(",").map(s => s.trim());
            
            matchConditions["$or"] = [];
            
            if (statusArray.includes("loginDone")) {
                matchConditions["$or"].push({
                    $and: [
                        { statusByCibil: { $in: ["query", "notAssign"] } },
                        { applicantFormStart: true },
                        { applicantFormComplete: true },
                        { coApplicantFormStart: true },
                        { coApplicantFormComplete: true },
                        { guarantorFormStart: true },
                        { guarantorFormComplete: true },
                        { customerFormComplete: true }
                    ]
                });
            }

            if (statusArray.includes("logInPending")) {
                matchConditions["$or"].push({
                    $and: [
                        { statusByCibil: { $in: ["notAssign"] } },
                        {
                            $or: [
                                { applicantFormStart: false },
                                { applicantFormComplete: false },
                                { coApplicantFormStart: false },
                                { coApplicantFormComplete: false },
                                { guarantorFormStart: false },
                                { guarantorFormComplete: false }
                            ]
                        }
                    ]
                });
            }

            if (statusArray.includes("query")) {
                matchConditions["$or"].push({
                    $and: [
                        { statusByCibil: "query" },
                        {
                            $or: [
                                { guarantorFormStart: false },
                                { coApplicantFormStart: false },
                                { applicantFormStart: false }
                            ]
                        }
                    ]
                });
            }
            
            const otherStatuses = statusArray.filter(s => s !== "pending" && s !== "query");
            if (otherStatuses.length > 0) {
                matchConditions["$or"].push({ statusByCibil: { $in: otherStatuses } });
            }

            if (matchConditions["$or"].length === 0) {
                delete matchConditions["$or"];
            }
        }
        
        // Build the common lookup stages for both pipelines
        const commonLookups = [
            {
                $lookup: {
                    from: "customerdetails",
                    let: { customerId: "$customerId" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$customerId"] } } },
                        { $project: { 
                            _id: 1, 
                            employeId: 1, 
                            orderId: 1,
                            paymentStatus: 1,
                            loginFees: 1,
                            branch: 1,
                            customerFinId: 1,
                            createdAt: 1,
                            productId: 1
                        }}
                    ],
                    as: "customerDetailData"
                }
            },
            { $unwind: { path: "$customerDetailData", preserveNullAndEmptyArrays: true } },
            
            {
                $lookup: {
                    from: "newbranches",
                    let: { branchId: "$customerDetailData.branch" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$branchId"] } } },
                        { $project: { _id: 1, name: 1, regionalBranchId: 1 }}
                    ],
                    as: "branchDetails"
                }
            },
            { $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: "newbranches",
                    let: { regionalId: "$branchDetails.regionalBranchId" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$regionalId"] } } },
                        { $project: { _id: 1, name: 1 }}
                    ],
                    as: "regionalBranchDetails"
                }
            },
            { $unwind: { path: "$regionalBranchDetails", preserveNullAndEmptyArrays: true } }
        ];
        
        // APPROACH: Fetch data with a prefilter query that may match more than needed,
        // then filter and process the date filtering in JavaScript
        // First, get all data within the date range (approximately)
        // We'll do a basic check in MongoDB to reduce the data volume
        
        // Attempt to parse MongoDB's expected date format
        // We'll use a regex pattern to match dates approximately - this is much more forgiving
        const startDateParts = formattedStart.toISOString().split('T')[0].split('-');
        const endDateParts = formattedEnd.toISOString().split('T')[0].split('-');
        
        // Simple pattern matching for date strings, looking for dates like YYYY-MM-DD 
        // This is much less likely to fail than date parsing
        matchConditions["salesCompleteDate"] = { 
            $regex: `^(${startDateParts[0]}|${endDateParts[0]})` // Match either year
        };
        
        // Prefilter pipeline to get approximate data
        const prefilterPipeline = [
            ...commonLookups,
            { $match: matchConditions }
        ];
        
        // New pipeline for getting data by month
        const monthlyCasesPipeline = async () => {
            // Get all data within the approximate date range
            const prefilterData = await processModel.aggregate(prefilterPipeline, { allowDiskUse: true });
            
            // Helper function to parse dates safely
            const parseDate = (dateStr) => {
                try {
                    // Handle special date format with AM/PM
                    if (dateStr.includes(" AM") || dateStr.includes(" PM")) {
                        // Remove the AM/PM part which causes MongoDB parsing errors
                        dateStr = dateStr.replace(/ AM$/, "").replace(/ PM$/, "");
                    }
                    return new Date(dateStr);
                } catch (e) {
                    console.error("Error parsing date:", dateStr, e);
                    return null;
                }
            };
            
            // Filter the data to exact date range in JavaScript
            const filteredData = prefilterData.filter(item => {
                const date = parseDate(item.salesCompleteDate);
                return date && date >= formattedStart && date <= formattedEnd;
            });
            
            // Group data by month
            const monthData = {};
            
            filteredData.forEach(item => {
                const date = parseDate(item.salesCompleteDate);
                if (!date) return;
                
                const month = date.getMonth() + 1; // 1-12
                const year = date.getFullYear();
                const key = `${year}-${month}`;
                
                if (!monthData[key]) {
                    monthData[key] = {
                        month,
                        year,
                        monthName: new Date(year, month - 1).toLocaleString('default', { month: 'short' }),
                        displayLabel: `${new Date(year, month - 1).toLocaleString('default', { month: 'short' })} ${year}`,
                        items: []
                    };
                }
                
                monthData[key].items.push(item);
            });
            
            // Generate all months in the range (for non-cross-year queries)
            const allMonths = [];
            
            // Only generate all months for same-year queries (Case 1 and 2)
            if (!showOnlyMonthsWithData) {
                const startMonth = formattedStart.getMonth() + 1;
                const startYear = formattedStart.getFullYear();
                const endMonth = formattedEnd.getMonth() + 1;
                const endYear = formattedEnd.getFullYear();
                
                // Generate all months in the range
                for (let year = startYear; year <= endYear; year++) {
                    const monthStart = (year === startYear) ? startMonth : 1;
                    const monthEnd = (year === endYear) ? endMonth : 12;
                    
                    for (let month = monthStart; month <= monthEnd; month++) {
                        const key = `${year}-${month}`;
                        
                        if (!monthData[key]) {
                            // Add empty month placeholder
                            monthData[key] = {
                                month,
                                year,
                                monthName: new Date(year, month - 1).toLocaleString('default', { month: 'short' }),
                                displayLabel: `${new Date(year, month - 1).toLocaleString('default', { month: 'short' })} ${year}`,
                                items: []
                            };
                        }
                    }
                }
            }
            
            // Convert to array and sort
            const sortedMonths = Object.values(monthData).sort((a, b) => {
                if (a.year !== b.year) return a.year - b.year;
                return a.month - b.month;
            });
            
            // Calculate metrics for each month
            const monthlyResults = sortedMonths.map(monthInfo => {
                const items = monthInfo.items;
                
                // Skip months with no data if we're in "only show months with data" mode
                if (showOnlyMonthsWithData && items.length === 0) {
                    return null;
                }
                
                // Calculate metrics
                const loginPendingCases = items.filter(item => 
                    item.statusByCibil === "notAssign" && 
                    (!item.applicantFormStart || !item.applicantFormComplete || 
                     !item.coApplicantFormStart || !item.coApplicantFormComplete || 
                     !item.guarantorFormStart || !item.guarantorFormComplete)
                ).length;
                
                const loginDoneCases = items.filter(item => 
                    (item.statusByCibil === "notAssign" || item.statusByCibil === "query") && 
                    item.customerFormComplete && 
                    item.applicantFormStart && item.applicantFormComplete && 
                    item.coApplicantFormStart && item.coApplicantFormComplete && 
                    item.guarantorFormStart && item.guarantorFormComplete
                ).length;
                
                const loginQueryCases = items.filter(item => 
                    item.statusByCibil === "query" && 
                    (!item.applicantFormStart || !item.coApplicantFormStart || !item.guarantorFormStart)
                ).length;
                
                const approvedCases = items.filter(item => item.statusByCibil === "approved").length;
                const rejectedCases = items.filter(item => item.statusByCibil === "rejected").length;
                const paymentDoneCases = items.filter(item => item.customerFormComplete && item.paymentStatus === "success").length;
                
                // Calculate totals
                const totalCases = loginPendingCases + loginDoneCases + loginQueryCases + approvedCases + rejectedCases;
                const pendingCases = loginPendingCases + loginDoneCases + loginQueryCases;
                
                return {
                    month: monthInfo.monthName,
                    monthYear: monthInfo.displayLabel,
                    total: totalCases,
                    approved: approvedCases,
                    pending: pendingCases,
                    reject: rejectedCases,
                    rejectBySales: 0,
                    leadConvert: 0,
                    
                    // Keep these for compatibility
                    monthName: monthInfo.monthName,
                    year: monthInfo.year,
                    displayLabel: monthInfo.displayLabel,
                    paymentDoneCases: paymentDoneCases,
                    loginPendingCases: loginPendingCases,
                    loginDoneCases: loginDoneCases,
                    loginQueryCases: loginQueryCases,
                    approvedCases: approvedCases,
                    rejectedCases: rejectedCases,
                };
            }).filter(Boolean); // Remove null entries (months with no data if we're filtering)
            
            return monthlyResults;
        };
        
        // Pipeline for overall counts
        const countsPipeline = [
            ...commonLookups,
            { $match: matchConditions },
            {
                $group: {
                    _id: "$customerId",
                    salesCompleteDate: { $first: "$salesCompleteDate" },
                    customerFormComplete: { $first: "$customerFormComplete" },
                    applicantFormStart: { $first: "$applicantFormStart" },
                    applicantFormComplete: { $first: "$applicantFormComplete" },
                    coApplicantFormStart: { $first: "$coApplicantFormStart" },
                    coApplicantFormComplete: { $first: "$coApplicantFormComplete" },
                    guarantorFormStart: { $first: "$guarantorFormStart" },
                    guarantorFormComplete: { $first: "$guarantorFormComplete" },
                    statusByCibil: { $first: "$statusByCibil" },
                    paymentStatus: { $first: "$customerDetailData.paymentStatus" }
                }
            }
        ];
        
        // Run queries in parallel
        const [countsResult, monthlyData] = await Promise.all([
            processModel.aggregate(countsPipeline, { allowDiskUse: true }),
            monthlyCasesPipeline()
        ]);
        
        // Helper function to parse dates safely
        const parseDate = (dateStr) => {
            try {
                // Handle special date format with AM/PM
                if (dateStr.includes(" AM") || dateStr.includes(" PM")) {
                    // Remove the AM/PM part which causes MongoDB parsing errors
                    dateStr = dateStr.replace(/ AM$/, "").replace(/ PM$/, "");
                }
                return new Date(dateStr);
            } catch (e) {
                console.error("Error parsing date:", dateStr, e);
                return null;
            }
        };
        
        // Filter counts by date range
        const filteredCounts = countsResult.filter(item => {
            const date = parseDate(item.salesCompleteDate);
            return date && date >= formattedStart && date <= formattedEnd;
        });
        
        // Calculate overall counts
        const loginPendingCases = filteredCounts.filter(item => 
            item.statusByCibil === "notAssign" && 
            (!item.applicantFormStart || !item.applicantFormComplete || 
             !item.coApplicantFormStart || !item.coApplicantFormComplete || 
             !item.guarantorFormStart || !item.guarantorFormComplete)
        ).length;
        
        const loginDoneCases = filteredCounts.filter(item => 
            (item.statusByCibil === "notAssign" || item.statusByCibil === "query") && 
            item.customerFormComplete && 
            item.applicantFormStart && item.applicantFormComplete && 
            item.coApplicantFormStart && item.coApplicantFormComplete && 
            item.guarantorFormStart && item.guarantorFormComplete
        ).length;
        
        const loginQueryCases = filteredCounts.filter(item => 
            item.statusByCibil === "query" && 
            (!item.applicantFormStart || !item.coApplicantFormStart || !item.guarantorFormStart)
        ).length;
        
        const approvedCases = filteredCounts.filter(item => item.statusByCibil === "approved").length;
        const rejectedCases = filteredCounts.filter(item => item.statusByCibil === "rejected").length;
        const paymentDoneCases = filteredCounts.filter(item => item.customerFormComplete && item.paymentStatus === "success").length;
        
        // Calculate total
        const totalCases = loginPendingCases + loginDoneCases + loginQueryCases + approvedCases + rejectedCases;
        
        const response = {
            totalCases: totalCases,
            paymentDoneCases: paymentDoneCases,
            loginPendingCases: loginPendingCases,
            loginDoneCases: loginDoneCases,
            loginQueryCases: loginQueryCases,
            approvedCases: approvedCases,
            rejectedCases: rejectedCases,
            
            // Monthly data
            monthlyData: monthlyData,
        };

        // Add date range information to the response
        response.startDate = formattedStart.toISOString().split('T')[0];
        response.endDate = formattedEnd.toISOString().split('T')[0];
        response.hasFilters = Boolean(
            (branch && branch !== "all") || 
            (regionalbranch && regionalbranch !== "all") || 
            (employee && employee !== "all") || 
            (product && product !== "all") || 
            (status && status !== "all") ||
            (startDateFilter && startDateFilter !== "all") ||
            (endDateFilter && endDateFilter !== "all") ||
            searchQuery
        );
        
        // Cache the result for future requests
        dashboardMonthCountCache.set(cacheKey, response);
        
        return success(res, "Sales Files Dashboard", response);
    } catch (error) {
        console.error(error);
        return unknownError(res, error);
    }
}

const countAvgForMasterDashboard = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonthStr = moment().startOf('month').format('YYYY-MM');
        const todayStr = moment().format('YYYY-MM-DD');
        const fixedLeadStartDate = new Date('2024-09-05T00:00:00');
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const startOfToday = new Date(now.setHours(0, 0, 0, 0));
        const endOfToday = new Date(startOfToday);
        endOfToday.setDate(endOfToday.getDate() + 1);
        const fixedStartDate = new Date('2024-09-01T11:11:39');
        const regexPattern = generateDateRegexPattern(fixedStartDate, now);

        const monthsCount =
            (now.getFullYear() - fixedStartDate.getFullYear()) * 12 +
            (now.getMonth() - fixedStartDate.getMonth()) +
            (now.getDate() >= fixedStartDate.getDate() ? 0 : -1);

        const totalMonths = Math.max(1, monthsCount);

        const [
            totalLeadCount,
            totalSalesCount,
            totalCibilCount,
            totalPdCount,
            activeVendorCount,
            newFileManagmentCount,
            monthCollectionData
        ] = await Promise.all([
            leadGenerateModel.countDocuments({
                createdAt: { $gte: fixedLeadStartDate }
            }),
            processModel.countDocuments({
                customerFormStart: true,
                customerFormComplete: true,
                applicantFormStart: true,
                applicantFormComplete: true,
                coApplicantFormStart: true,
                coApplicantFormComplete: true,
                guarantorFormStart: true,
                guarantorFormComplete: true,
                // salesCompleteDate: { $regex: `^${todayStr}` }
                salesCompleteDate: { $regex: new RegExp(regexPattern) }
            }),
            // Get CIBIL count using dynamic regex pattern
            cibilModel.countDocuments({
                cibilFetchDate: { $regex: new RegExp(regexPattern) }
            }),
            // Get PD count using dynamic regex pattern
            externalManagerModel.countDocuments({
                statusByCreditPd: { $in: ["approve", "reject"] },
                creditPdCompleteDate: { $regex: new RegExp(regexPattern) }
            }),
            vendorModel.countDocuments({ status: "active" }),
            externalManagerModel.countDocuments({
                fileStatus: "active",
                statusByCreditPd: { $in: ["complete", "approve"] }
            }),
            collectionSheetModel.aggregate([
                {
                    $match: {
                        status: "accept",
                        createdAt: {
                            $gte: startOfMonth,
                            $lt: endOfMonth
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalReceivedAmount: { $sum: "$receivedAmount" },
                        totalCount: { $sum: 1 }
                    }
                }
            ])
        ]);

        console.log('totalLeadCount', totalLeadCount, "totalSalesCount", totalSalesCount, "totalPdCount", totalPdCount, "totalCibilCount", totalCibilCount)

        const avgMonthlyCibilCount = totalCibilCount / totalMonths;
        const avgMonthlyPdCount = totalPdCount / totalMonths;
        const avgMonthlySalesComplete = totalSalesCount / totalMonths;
        const avgMonthlyLeadCount = totalLeadCount / totalMonths;

        const response = {
            monthlyLeadCount: Math.round(avgMonthlyLeadCount),
            todaySalesComplete: Math.round(avgMonthlySalesComplete),
            monthCibilCount: Math.round(avgMonthlyCibilCount), // Average CIBIL count per month
            monthPdCount: Math.round(avgMonthlyPdCount),       // Average PD count per month
            activeVendorCount,
            newFileManagmentCount,
            monthCollectionCount: monthCollectionData.length > 0 ? monthCollectionData[0].totalReceivedAmount : 0,
            _debug: {
                totalCibilCount,
                totalPdCount,
                monthsCalculated: totalMonths,
                //   dateRegexPattern: regexPattern
            }
        };

        return success(res, "All counts fetched successfully", response);

    } catch (error) {
        console.error(error);
        return unknownError(res, error);
    }
};

function generateDateRegexPattern(startDate, endDate) {
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth() + 1;
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth() + 1;

    let patterns = [];

    if (startYear === endYear) {
        const monthsPattern = Array.from(
            { length: endMonth - startMonth + 1 },
            (_, i) => String(startMonth + i).padStart(2, '0')
        ).join('|');
        patterns.push(`${startYear}-(${monthsPattern})`);
    } else {
        // Handle months in start year
        const startYearMonths = Array.from(
            { length: 12 - startMonth + 1 },
            (_, i) => String(startMonth + i).padStart(2, '0')
        ).join('|');
        patterns.push(`${startYear}-(${startYearMonths})`);

        // Handle all intermediate years (if any)
        for (let year = startYear + 1; year < endYear; year++) {
            patterns.push(`${year}-.*`);
        }

        // Handle months in end year
        if (endYear > startYear) {
            const endYearMonths = Array.from(
                { length: endMonth },
                (_, i) => String(i + 1).padStart(2, '0')
            ).join('|');
            patterns.push(`${endYear}-(${endYearMonths})`);
        }
    }

    // Join all patterns with OR operator and add start of string anchor
    return `^(${patterns.join('|')})`;
}


// async function salesDashBoardProductTable(req, res) {
//     try {
//         const { startDateFilter, endDateFilter } = req.query;
//         const employeeId = req.Id;

//         const employeeExist = await employeeModel.findOne({ _id: employeeId, status: "active" });
//         if (!employeeExist) {
//             return badRequest(res, "Employee Not Found");
//         }

//         // let matchConditions = { fileStatus: "active" };
//         let matchConditions = {
//             // fileStatus: "active",
//         };



//         const today = new Date();
//         const defaultStartDate = new Date(today.setHours(0, 0, 0, 0)); // Default start at 6 AM
//         const defaultEndDate = new Date(today.setHours(23, 59, 59, 999)); // Default end at 11:50 PM

//         function formatDateToISO(date) {
//             return new Date(date).toISOString(); // Convert to ISO format
//         }

//         // Adjust start and end dates based on filters
//         let formattedStart = startDateFilter && startDateFilter !== "all"
//             ? new Date(new Date(startDateFilter).setHours(0, 0, 0, 0)) // Set to 6 AM
//             : defaultStartDate;

//         let formattedEnd = endDateFilter && endDateFilter !== "all"
//             ? new Date(new Date(endDateFilter).setHours(23, 59, 59, 999)) // Set to 11:50 PM
//             : defaultEndDate;

//         // ✅ If startDateFilter and endDateFilter are the same, ensure correct filtering for that day
//         if (startDateFilter && endDateFilter && startDateFilter === endDateFilter) {
//             formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
//             formattedEnd = new Date(new Date(startDateFilter).setHours(23, 59, 59, 999));
//         }

//         // Convert to ISO for MongoDB query
//         formattedStart = formatDateToISO(formattedStart);
//         formattedEnd = formatDateToISO(formattedEnd);

//         // Add match conditions
//         if (startDateFilter && endDateFilter && startDateFilter !== "all" && endDateFilter !== "all") {
//             matchConditions["salesCompleteDate"] = { $gte: formattedStart, $lt: formattedEnd, }
//         }



//         const resultProduct = await processModel.aggregate([
//             { $match: matchConditions },
//             {
//                 $lookup: {
//                     from: "customerdetails",
//                     localField: "customerId",
//                     foreignField: "_id",
//                     as: "customerdetailData",
//                 },
//             },
//             { $unwind: "$customerdetailData" },

//             {
//                 $lookup: {
//                     from: "products",
//                     localField: "customerdetailData.productId",
//                     foreignField: "_id",
//                     as: "productDetail",
//                 },
//             },
//             { $unwind: "$productDetail" },

//             {
//                 $group: {
//                     _id: "$productDetail._id",
//                     productName: { $first: "$productDetail.productName" },
//                     productId: { $first: "$productDetail._id" },
//                     logInQueryFiles: {
//                         $sum: {
//                             $cond: [
//                                 {
//                                     $and: [
//                                         { $eq: ["$statusByCibil", "query"] },
//                                         {
//                                             $or: [
//                                                 { $eq: ["$coApplicantFormStart", false] },
//                                                 { $eq: ["$applicantFormStart", false] },
//                                                 { $eq: ["$guarantorFormStart", false] },
//                                             ],
//                                         },
//                                     ],
//                                 },
//                                 1,
//                                 0,
//                             ],
//                         },
//                     },
//                     logInCompleteFiles: {
//                         $sum: {
//                             $cond: [
//                                 {
//                                     $and: [
//                                         { $in: ["$statusByCibil", ["query", "notAssign"]] },
//                                         { $eq: ["$customerFormComplete", true] },
//                                         { $eq: ["$applicantFormStart", true] },
//                                         { $eq: ["$applicantFormComplete", true] },
//                                         { $eq: ["$coApplicantFormStart", true] },
//                                         { $eq: ["$coApplicantFormComplete", true] },
//                                         { $eq: ["$guarantorFormStart", true] },
//                                         { $eq: ["$guarantorFormComplete", true] },
//                                     ],
//                                 },
//                                 1,
//                                 0,
//                             ],
//                         },
//                     },
//                     logInPendingFiles: {
//                         $sum: {
//                             $cond: [
//                                 {
//                                     $and: [
//                                         { $eq: ["$statusByCibil", "notAssign"] },
//                                         {
//                                             $or: [
//                                                 { $eq: ["$applicantFormStart", false] },
//                                                 { $eq: ["$applicantFormComplete", false] },
//                                                 { $eq: ["$coApplicantFormStart", false] },
//                                                 { $eq: ["$coApplicantFormComplete", false] },
//                                                 { $eq: ["$guarantorFormStart", false] },
//                                                 { $eq: ["$guarantorFormComplete", false] }
//                                             ]
//                                         }
//                                     ]
//                                 },
//                                 1,
//                                 0
//                             ]
//                         }
//                     },
//                     rejectedFiles: {
//                         $sum: {
//                             $cond: [{ $eq: ["$statusByCibil", "rejected"] }, 1, 0],
//                         },
//                     },
//                     approvedFiles: {
//                         $sum: {
//                             $cond: [{ $eq: ["$statusByCibil", "approved"] }, 1, 0],
//                         },
//                     },
//                 },
//             },

//             {
//                 $project: {
//                     _id: 0,
//                     productName: 1,
//                     productId: 1,
//                     logInQueryFiles: 1,
//                     logInPendingFiles: 1,
//                     logInCompleteFiles: 1,
//                     rejectedFiles: 1,
//                     approvedFiles: 1,
//                     totalFiles: {
//                         $add: [
//                             "$logInQueryFiles",
//                             "$logInPendingFiles",
//                             "$logInCompleteFiles",
//                             "$rejectedFiles",
//                             "$approvedFiles"
//                         ],
//                     },
//                 },
//             },
//         ]);

//         const response = {
//             TotalCases: resultProduct.length || 0,
//             productDetail: resultProduct,
//         };

//         return success(res, "Sales Files Product Table Dashboard", response);

//     } catch (error) {
//         console.error(error);
//         return unknownError(res, error);
//     }
// }

// async function salesDashBoardBranchTable(req, res) {
//     try {
//         const { startDateFilter, endDateFilter } = req.query;
//         const employeeId = req.Id;

//         const employeeExist = await employeeModel.findOne({ _id: employeeId, status: "active" });
//         if (!employeeExist) {
//             return badRequest(res, "Employee Not Found");
//         }

//         let matchConditions = {
//             // fileStatus: "active"
//         };


//         const today = new Date();
//         const defaultStartDate = new Date(today.setHours(0, 0, 0, 0)); // Default start at 6 AM
//         const defaultEndDate = new Date(today.setHours(23, 59, 59, 999)); // Default end at 11:50 PM

//         function formatDateToISO(date) {
//             return new Date(date).toISOString(); // Convert to ISO format
//         }

//         // Adjust start and end dates based on filters
//         let formattedStart = startDateFilter && startDateFilter !== "all"
//             ? new Date(new Date(startDateFilter).setHours(0, 0, 0, 0)) // Set to 6 AM
//             : defaultStartDate;

//         let formattedEnd = endDateFilter && endDateFilter !== "all"
//             ? new Date(new Date(endDateFilter).setHours(23, 59, 59, 999)) // Set to 11:50 PM
//             : defaultEndDate;

//         // ✅ If startDateFilter and endDateFilter are the same, ensure correct filtering for that day
//         if (startDateFilter && endDateFilter && startDateFilter === endDateFilter) {
//             formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
//             formattedEnd = new Date(new Date(startDateFilter).setHours(23, 59, 59, 999));
//         }

//         // Convert to ISO for MongoDB query
//         formattedStart = formatDateToISO(formattedStart);
//         formattedEnd = formatDateToISO(formattedEnd);

//         // Add match conditions
//         if (startDateFilter && endDateFilter && startDateFilter !== "all" && endDateFilter !== "all") {
//             matchConditions["salesCompleteDate"] = { $gte: formattedStart, $lte: formattedEnd, }
//         }


//         const resultBranch = await processModel.aggregate([

//             { $match: matchConditions },
//             {
//                 $addFields: {
//                     // cibilFetchDate: {
//                     //   $cond: {
//                     //     if: { $or: [{ $eq: ["$cibilDetailData.cibilFetchDate", ""] }, { $eq: ["$cibilDetailData.cibilFetchDate", null] }] },
//                     //     then: "$cibilDetailData.cibilFetchDate",
//                     //     else: "",
//                     //   },
//                     // },
//                 },
//             },
//             {
//                 $lookup: {
//                     from: "customerdetails",  // Your employees collection name
//                     localField: "customerId",
//                     foreignField: "_id",
//                     as: "customerdetailData",
//                 },
//             },
//             {
//                 $unwind: "$customerdetailData", // Unwind to access employee details
//             },
//             {
//                 $lookup: {
//                     from: "employees",  // Your employees collection name
//                     localField: "customerdetailData.employeId",
//                     foreignField: "_id",
//                     as: "employeeDetails",
//                 },
//             },
//             {
//                 $unwind: "$employeeDetails", // Unwind to access employee details
//             },

//             {
//                 $lookup: {
//                     from: "newbranches",  // Your employees collection name
//                     localField: "customerdetailData.branch",
//                     foreignField: "_id",
//                     as: "newbrancheDetails",
//                 },
//             },
//             {
//                 $unwind: "$newbrancheDetails", // Unwind to access employee details
//             },
//             {
//                 $unwind: "$statusByCibil", // Unwind statusByCreditPd to process each status separately
//             },
//             {
//                 $group: {
//                     _id: "$newbrancheDetails._id",
//                     branchName: { $first: "$newbrancheDetails.name" },
//                     branchId: { $first: "$newbrancheDetails._id" },
//                     totalFiles: { $sum: 1 },
//                     logInQueryFiles: {
//                         $sum: {
//                             $cond: [
//                                 {
//                                     $and: [
//                                         { $eq: ["$statusByCibil", "query"] },
//                                         {
//                                             $or: [
//                                                 { $eq: ["$coApplicantFormStart", false] },
//                                                 { $eq: ["$applicantFormStart", false] },
//                                                 { $eq: ["$guarantorFormStart", false] },
//                                             ],
//                                         },
//                                     ],
//                                 },
//                                 1,
//                                 0,
//                             ],
//                         },
//                     },
//                     logInPendingFiles: {
//                         $sum: {
//                             $cond: [
//                                 {
//                                     $and: [
//                                         { $eq: ["$statusByCibil", "notAssign"] },
//                                         {
//                                             $or: [
//                                                 { $eq: ["$applicantFormStart", false] },
//                                                 { $eq: ["$applicantFormComplete", false] },
//                                                 { $eq: ["$coApplicantFormStart", false] },
//                                                 { $eq: ["$coApplicantFormComplete", false] },
//                                                 { $eq: ["$guarantorFormStart", false] },
//                                                 { $eq: ["$guarantorFormComplete", false] }
//                                             ]
//                                         }
//                                     ]
//                                 },
//                                 1,
//                                 0
//                             ]
//                         }
//                     },
//                     loginCompleteFiles: {
//                         $sum: {
//                             $cond: [
//                                 {
//                                     $and: [
//                                         { $in: ["$statusByCibil", ["query", "notAssign"]] },
//                                         { $eq: ["$customerFormComplete", true] },
//                                         { $eq: ["$applicantFormStart", true] },
//                                         { $eq: ["$applicantFormComplete", true] },
//                                         { $eq: ["$coApplicantFormStart", true] },
//                                         { $eq: ["$coApplicantFormComplete", true] },
//                                         { $eq: ["$guarantorFormStart", true] },
//                                         { $eq: ["$guarantorFormComplete", true] },
//                                     ],
//                                 },
//                                 1,
//                                 0,
//                             ],
//                         },
//                     },
//                     rejectedFiles: {
//                         $sum: {
//                             $cond: [{ $eq: ["$statusByCibil", "rejected"] }, 1, 0],
//                         },
//                     },
//                     approvedFiles: {
//                         $sum: {
//                             $cond: [{ $eq: ["$statusByCibil", "approved"] }, 1, 0],
//                         },
//                     },
//                 },
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     branchName: 1,
//                     branchId: 1,
//                     logInQueryFiles: 1,
//                     logInPendingFiles: 1,
//                     loginCompleteFiles: 1,
//                     rejectedFiles: 1,
//                     approvedFiles: 1,
//                     totalFiles: 1
//                 },
//             },
//         ]);


//         const response = {
//             TotalCases: resultBranch.length || 0,
//             branchDetail: resultBranch,
//         };

//         return success(res, "Sales Files Branch Table Dashboard", response);

//     } catch (error) {
//         console.error(error);
//         return unknownError(res, error);
//     }
// }

// async function salesDashBoardEmployeeTable(req, res) {
//     try {
//         const { startDateFilter, endDateFilter } = req.query;
//         const employeeId = req.Id;

//         const employeeExist = await employeeModel.findOne({ _id: employeeId, status: "active" });
//         if (!employeeExist) {
//             return badRequest(res, "Employee Not Found");
//         }

//         let matchConditions = {
//             //  fileStatus: "active"
//         };

//         const today = new Date();
//         const defaultStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
//         const defaultEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

//         function formatDateToISO(date) {
//             return new Date(date).toISOString();
//         }

//         let formattedStart = startDateFilter && startDateFilter !== "all"
//             ? new Date(new Date(startDateFilter).setHours(0, 0, 0, 0))
//             : new Date("2024-11-01");

//         let formattedEnd = endDateFilter && endDateFilter !== "all"
//             ? new Date(new Date(endDateFilter).setHours(23, 59, 59, 999))
//             : today;

//         if (startDateFilter && endDateFilter && startDateFilter === endDateFilter) {
//             formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
//             formattedEnd = new Date(new Date(startDateFilter).setHours(23, 59, 59, 999));
//         }

//         formattedStart = formatDateToISO(formattedStart);
//         formattedEnd = formatDateToISO(formattedEnd);

//         const resultEmployee = await processModel.aggregate([
//             { $match: matchConditions },
//             {
//                 $lookup: {
//                     from: "employees",
//                     localField: "employeId",
//                     foreignField: "_id",
//                     as: "employeeDetails",
//                 },
//             },
//             { $unwind: "$employeeDetails" },
//             { $unwind: "$statusByCibil" },
//             {
//                 $group: {
//                     _id: "$employeId",
//                     employeeName: { $first: "$employeeDetails.employeName" },
//                     employeeId: { $first: "$employeeDetails._id" },

//                     logInQueryFiles: {
//                         $sum: {
//                             $cond: [
//                                 {
//                                     $and: [
//                                         { $eq: ["$statusByCibil", "query"] },
//                                         {
//                                             $or: [
//                                                 { $eq: ["$coApplicantFormStart", false] },
//                                                 { $eq: ["$applicantFormStart", false] },
//                                                 { $eq: ["$guarantorFormStart", false] },
//                                             ],
//                                         },
//                                     ],
//                                 },
//                                 1,
//                                 0,
//                             ],
//                         },
//                     },
//                     logInPendingFiles: {
//                         $sum: {
//                             $cond: [
//                                 {
//                                     $and: [
//                                         { $eq: ["$statusByCibil", "notAssign"] },
//                                         {
//                                             $or: [
//                                                 { $eq: ["$applicantFormStart", false] },
//                                                 { $eq: ["$applicantFormComplete", false] },
//                                                 { $eq: ["$coApplicantFormStart", false] },
//                                                 { $eq: ["$coApplicantFormComplete", false] },
//                                                 { $eq: ["$guarantorFormStart", false] },
//                                                 { $eq: ["$guarantorFormComplete", false] }
//                                             ]
//                                         }
//                                     ]
//                                 },
//                                 1,
//                                 0
//                             ]
//                         }
//                     },
//                     loginCompleteFiles: {
//                         $sum: {
//                             $cond: [
//                                 {
//                                     $and: [
//                                         { $in: ["$statusByCibil", ["query", "notAssign"]] },
//                                         { $eq: ["$customerFormComplete", true] },
//                                         { $eq: ["$applicantFormStart", true] },
//                                         { $eq: ["$applicantFormComplete", true] },
//                                         { $eq: ["$coApplicantFormStart", true] },
//                                         { $eq: ["$coApplicantFormComplete", true] },
//                                         { $eq: ["$guarantorFormStart", true] },
//                                         { $eq: ["$guarantorFormComplete", true] },
//                                     ],
//                                 },
//                                 1,
//                                 0,
//                             ],
//                         },
//                     },
//                     rejectedFiles: {
//                         $sum: {
//                             $cond: [{ $eq: ["$statusByCibil", "rejected"] }, 1, 0],
//                         },
//                     },
//                     approvedFiles: {
//                         $sum: {
//                             $cond: [{ $eq: ["$statusByCibil", "approved"] }, 1, 0],
//                         },
//                     },
//                     totalFiles: { $sum: 1 },
//                     employeeTarget: { $first: "$employeeDetails.employeeTarget" },
//                 },
//             },
//             { $sort: { totalFiles: -1, loginCompleteFiles: -1 } },
//         ]);

//         // **Check Employee Target for 'sales' and Multiply by Month Difference**
//         resultEmployee.forEach((employee) => {
//             const salesTarget = employee.employeeTarget?.find((target) => target.title === "sales");

//             if (salesTarget && salesTarget.value) {
//                 const targetValue = parseInt(salesTarget.value, 10);

//                 // Calculate the number of months
//                 const startDate = new Date(formattedStart);
//                 const endDate = new Date(formattedEnd);
//                 const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());

//                 // Include the current month
//                 // const totalMonths = monthsDiff + 1;
//                 const totalMonths = calculateTotalMonths(startDate, endDate) + 1;
//                 employee.salesTargetValue = targetValue * totalMonths;
//             } else {
//                 employee.salesTargetValue = 0;
//             }

//             // Check if `loginCompleteFiles` meets or exceeds the target
//             if (employee.salesTargetValue > 0 && employee.loginCompleteFiles >= employee.salesTargetValue) {
//                 employee.achieveStatus = true;
//             } else {
//                 employee.achieveStatus = false;
//             }
//             delete employee.employeeTarget;
//         });

//         const response = {
//             TotalCases: resultEmployee.length || 0,
//             // totalmonths: ((new Date(formattedEnd).getFullYear() - new Date(formattedStart).getFullYear()) * 12) + (new Date(formattedEnd).getMonth() - new Date(formattedStart).getMonth()) + 1,
//             totalmonths: calculateTotalMonths(new Date(formattedStart), new Date(formattedEnd)) + 1,
//             Detail: resultEmployee,
//         };
//         return success(res, "Sales Files Employee Table Dashboard", response);

//     } catch (error) {
//         console.error(error);
//         return unknownError(res, error);
//     }
// }


async function salesDashBoardProductTable(req, res) {
    try {
        const { startDateFilter, endDateFilter } = req.query;
        const employeeId = req.Id;

        const employeeExist = await employeeModel.findOne({ _id: employeeId, status: "active" });
        if (!employeeExist) {
            return badRequest(res, "Employee Not Found");
        }

        let matchConditions = {
            // fileStatus: "active",
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
            matchConditions["salesCompleteDate"] = { $gte: formattedStart, $lt: formattedEnd, }
        }

        const resultProduct = await processModel.aggregate([
            { $match: matchConditions },
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

            {
                $group: {
                    _id: "$productDetail._id",
                    productName: { $first: "$productDetail.productName" },
                    productId: { $first: "$productDetail._id" },
                    logInQueryFiles: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$statusByCibil", "query"] },
                                        {
                                            $or: [
                                                { $eq: ["$coApplicantFormStart", false] },
                                                { $eq: ["$applicantFormStart", false] },
                                                { $eq: ["$guarantorFormStart", false] },
                                            ],
                                        },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    logInCompleteFiles: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $in: ["$statusByCibil", ["query", "notAssign"]] },
                                        { $eq: ["$customerFormComplete", true] },
                                        { $eq: ["$applicantFormStart", true] },
                                        { $eq: ["$applicantFormComplete", true] },
                                        { $eq: ["$coApplicantFormStart", true] },
                                        { $eq: ["$coApplicantFormComplete", true] },
                                        { $eq: ["$guarantorFormStart", true] },
                                        { $eq: ["$guarantorFormComplete", true] },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    logInPendingFiles: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$statusByCibil", "notAssign"] },
                                        {
                                            $or: [
                                                { $eq: ["$applicantFormStart", false] },
                                                { $eq: ["$applicantFormComplete", false] },
                                                { $eq: ["$coApplicantFormStart", false] },
                                                { $eq: ["$coApplicantFormComplete", false] },
                                                { $eq: ["$guarantorFormStart", false] },
                                                { $eq: ["$guarantorFormComplete", false] }
                                            ]
                                        }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    rejectedFiles: {
                        $sum: {
                            $cond: [{ $eq: ["$statusByCibil", "rejected"] }, 1, 0],
                        },
                    },
                    approvedFiles: {
                        $sum: {
                            $cond: [{ $eq: ["$statusByCibil", "approved"] }, 1, 0],
                        },
                    },
                },
            },

            {
                $project: {
                    _id: 0,
                    productName: 1,
                    productId: 1,
                    logInQueryFiles: 1,
                    logInPendingFiles: 1,
                    logInCompleteFiles: 1,
                    rejectedFiles: 1,
                    approvedFiles: 1,
                    totalFiles: {
                        $add: [
                            "$logInQueryFiles",
                            "$logInPendingFiles",
                            "$logInCompleteFiles",
                            "$rejectedFiles",
                            "$approvedFiles"
                        ],
                    },
                },
            },
        ]);

        // ✨ Calculate totals across all products
        let totals = {
            totalLogInQueryFiles: 0,
            totalLogInPendingFiles: 0,
            totalLoginCompleteFiles: 0,
            totalRejectedFiles: 0,
            totalApprovedFiles: 0,
            grandTotalFiles: 0
        };

        resultProduct.forEach(product => {
            totals.totalLogInQueryFiles += product.logInQueryFiles;
            totals.totalLogInPendingFiles += product.logInPendingFiles;
            totals.totalLoginCompleteFiles += product.logInCompleteFiles;
            totals.totalRejectedFiles += product.rejectedFiles;
            totals.totalApprovedFiles += product.approvedFiles;
            totals.grandTotalFiles += product.totalFiles;
        });

        const response = {
            TotalCases: resultProduct.length || 0,
            // ✨ Add totals to response
            ...totals,
            productDetail: resultProduct,
        };

        return success(res, "Sales Files Product Table Dashboard", response);

    } catch (error) {
        console.error(error);
        return unknownError(res, error);
    }
}

async function salesDashBoardBranchTable(req, res) {
    try {
        const { startDateFilter, endDateFilter } = req.query;
        const employeeId = req.Id;

        const employeeExist = await employeeModel.findOne({ _id: employeeId, status: "active" });
        if (!employeeExist) {
            return badRequest(res, "Employee Not Found");
        }

        let matchConditions = {
            // fileStatus: "active"
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
            matchConditions["salesCompleteDate"] = { $gte: formattedStart, $lte: formattedEnd, }
        }

        const resultBranch = await processModel.aggregate([
            { $match: matchConditions },
            {
                $addFields: {
                    // cibilFetchDate: {
                    //   $cond: {
                    //     if: { $or: [{ $eq: ["$cibilDetailData.cibilFetchDate", ""] }, { $eq: ["$cibilDetailData.cibilFetchDate", null] }] },
                    //     then: "$cibilDetailData.cibilFetchDate",
                    //     else: "",
                    //   },
                    // },
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
                    localField: "customerdetailData.branch",
                    foreignField: "_id",
                    as: "newbrancheDetails",
                },
            },
            {
                $unwind: "$newbrancheDetails", // Unwind to access employee details
            },
            {
                $unwind: "$statusByCibil",
            },
            {
                $group: {
                    _id: "$newbrancheDetails._id",
                    branchName: { $first: "$newbrancheDetails.name" },
                    branchId: { $first: "$newbrancheDetails._id" },
                    totalFiles: { $sum: 1 },
                    logInQueryFiles: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$statusByCibil", "query"] },
                                        {
                                            $or: [
                                                { $eq: ["$coApplicantFormStart", false] },
                                                { $eq: ["$applicantFormStart", false] },
                                                { $eq: ["$guarantorFormStart", false] },
                                            ],
                                        },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    logInPendingFiles: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$statusByCibil", "notAssign"] },
                                        {
                                            $or: [
                                                { $eq: ["$applicantFormStart", false] },
                                                { $eq: ["$applicantFormComplete", false] },
                                                { $eq: ["$coApplicantFormStart", false] },
                                                { $eq: ["$coApplicantFormComplete", false] },
                                                { $eq: ["$guarantorFormStart", false] },
                                                { $eq: ["$guarantorFormComplete", false] }
                                            ]
                                        }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    loginCompleteFiles: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $in: ["$statusByCibil", ["query", "notAssign"]] },
                                        { $eq: ["$customerFormComplete", true] },
                                        { $eq: ["$applicantFormStart", true] },
                                        { $eq: ["$applicantFormComplete", true] },
                                        { $eq: ["$coApplicantFormStart", true] },
                                        { $eq: ["$coApplicantFormComplete", true] },
                                        { $eq: ["$guarantorFormStart", true] },
                                        { $eq: ["$guarantorFormComplete", true] },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    rejectedFiles: {
                        $sum: {
                            $cond: [{ $eq: ["$statusByCibil", "rejected"] }, 1, 0],
                        },
                    },
                    approvedFiles: {
                        $sum: {
                            $cond: [{ $eq: ["$statusByCibil", "approved"] }, 1, 0],
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    branchName: 1,
                    branchId: 1,
                    logInQueryFiles: 1,
                    logInPendingFiles: 1,
                    loginCompleteFiles: 1,
                    rejectedFiles: 1,
                    approvedFiles: 1,
                    totalFiles: 1
                },
            },
        ]);

        // ✨ Calculate totals across all branches
        let totals = {
            totalLogInQueryFiles: 0,
            totalLogInPendingFiles: 0,
            totalLoginCompleteFiles: 0,
            totalRejectedFiles: 0,
            totalApprovedFiles: 0,
            grandTotalFiles: 0
        };

        resultBranch.forEach(branch => {
            totals.totalLogInQueryFiles += branch.logInQueryFiles;
            totals.totalLogInPendingFiles += branch.logInPendingFiles;
            totals.totalLoginCompleteFiles += branch.loginCompleteFiles;
            totals.totalRejectedFiles += branch.rejectedFiles;
            totals.totalApprovedFiles += branch.approvedFiles;
            totals.grandTotalFiles += branch.totalFiles;
        });

        const response = {
            TotalCases: resultBranch.length || 0,
            // ✨ Add totals to response
            ...totals,
            branchDetail: resultBranch,
        };

        return success(res, "Sales Files Branch Table Dashboard", response);

    } catch (error) {
        console.error(error);
        return unknownError(res, error);
    }
}

async function salesDashBoardEmployeeTable(req, res) {
    try {
        const { startDateFilter, endDateFilter } = req.query;
        const employeeId = req.Id;

        const employeeExist = await employeeModel.findOne({ _id: employeeId, status: "active" });
        if (!employeeExist) {
            return badRequest(res, "Employee Not Found");
        }

        let matchConditions = {
            //  fileStatus: "active"
        };

        const today = new Date();
        const defaultStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
        const defaultEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

        function formatDateToISO(date) {
            return new Date(date).toISOString();
        }

        let formattedStart = startDateFilter && startDateFilter !== "all"
            ? new Date(new Date(startDateFilter).setHours(0, 0, 0, 0))
            : new Date("2024-11-01");

        let formattedEnd = endDateFilter && endDateFilter !== "all"
            ? new Date(new Date(endDateFilter).setHours(23, 59, 59, 999))
            : today;

        if (startDateFilter && endDateFilter && startDateFilter === endDateFilter) {
            formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
            formattedEnd = new Date(new Date(startDateFilter).setHours(23, 59, 59, 999));
        }

        formattedStart = formatDateToISO(formattedStart);
        formattedEnd = formatDateToISO(formattedEnd);

        const resultEmployee = await processModel.aggregate([
            { $match: matchConditions },
            {
                $lookup: {
                    from: "employees",
                    localField: "employeId",
                    foreignField: "_id",
                    as: "employeeDetails",
                },
            },
            { $unwind: "$employeeDetails" },
            { $unwind: "$statusByCibil" },
            {
                $group: {
                    _id: "$employeId",
                    employeeName: { $first: "$employeeDetails.employeName" },
                    employeeId: { $first: "$employeeDetails._id" },

                    logInQueryFiles: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$statusByCibil", "query"] },
                                        {
                                            $or: [
                                                { $eq: ["$coApplicantFormStart", false] },
                                                { $eq: ["$applicantFormStart", false] },
                                                { $eq: ["$guarantorFormStart", false] },
                                            ],
                                        },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    logInPendingFiles: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$statusByCibil", "notAssign"] },
                                        {
                                            $or: [
                                                { $eq: ["$applicantFormStart", false] },
                                                { $eq: ["$applicantFormComplete", false] },
                                                { $eq: ["$coApplicantFormStart", false] },
                                                { $eq: ["$coApplicantFormComplete", false] },
                                                { $eq: ["$guarantorFormStart", false] },
                                                { $eq: ["$guarantorFormComplete", false] }
                                            ]
                                        }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    loginCompleteFiles: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $in: ["$statusByCibil", ["query", "notAssign"]] },
                                        { $eq: ["$customerFormComplete", true] },
                                        { $eq: ["$applicantFormStart", true] },
                                        { $eq: ["$applicantFormComplete", true] },
                                        { $eq: ["$coApplicantFormStart", true] },
                                        { $eq: ["$coApplicantFormComplete", true] },
                                        { $eq: ["$guarantorFormStart", true] },
                                        { $eq: ["$guarantorFormComplete", true] },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    rejectedFiles: {
                        $sum: {
                            $cond: [{ $eq: ["$statusByCibil", "rejected"] }, 1, 0],
                        },
                    },
                    approvedFiles: {
                        $sum: {
                            $cond: [{ $eq: ["$statusByCibil", "approved"] }, 1, 0],
                        },
                    },
                    totalFiles: { $sum: 1 },
                    employeeTarget: { $first: "$employeeDetails.employeeTarget" },
                },
            },
            { $sort: { totalFiles: -1, loginCompleteFiles: -1 } },
        ]);

        // ✨ Calculate totals across all employees
        let totals = {
            totalLogInQueryFiles: 0,
            totalLogInPendingFiles: 0,
            totalLoginCompleteFiles: 0,
            totalRejectedFiles: 0,
            totalApprovedFiles: 0,
            grandTotalFiles: 0
        };

        // **Check Employee Target for 'sales' and Multiply by Month Difference**
        resultEmployee.forEach((employee) => {
            // Add to totals
            totals.totalLogInQueryFiles += employee.logInQueryFiles;
            totals.totalLogInPendingFiles += employee.logInPendingFiles;
            totals.totalLoginCompleteFiles += employee.loginCompleteFiles;
            totals.totalRejectedFiles += employee.rejectedFiles;
            totals.totalApprovedFiles += employee.approvedFiles;
            totals.grandTotalFiles += employee.totalFiles;

            const salesTarget = employee.employeeTarget?.find((target) => target.title === "sales");

            if (salesTarget && salesTarget.value) {
                const targetValue = parseInt(salesTarget.value, 10);

                // Calculate the number of months
                const startDate = new Date(formattedStart);
                const endDate = new Date(formattedEnd);
                const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());

                // Include the current month
                // const totalMonths = monthsDiff + 1;
                const totalMonths = calculateTotalMonths(startDate, endDate) + 1;
                employee.salesTargetValue = targetValue * totalMonths;
            } else {
                employee.salesTargetValue = 0;
            }

            // Check if `loginCompleteFiles` meets or exceeds the target
            if (employee.salesTargetValue > 0 && employee.loginCompleteFiles >= employee.salesTargetValue) {
                employee.achieveStatus = true;
            } else {
                employee.achieveStatus = false;
            }
            delete employee.employeeTarget;
        });

        const response = {
            TotalCases: resultEmployee.length || 0,
            // totalmonths: ((new Date(formattedEnd).getFullYear() - new Date(formattedStart).getFullYear()) * 12) + (new Date(formattedEnd).getMonth() - new Date(formattedStart).getMonth()) + 1,
            totalmonths: calculateTotalMonths(new Date(formattedStart), new Date(formattedEnd)) + 1,
            // ✨ Add totals to response
            ...totals,
            Detail: resultEmployee,
        };
        return success(res, "Sales Files Employee Table Dashboard", response);

    } catch (error) {
        console.error(error);
        return unknownError(res, error);
    }
}



const checkWrongBranchFilesAndUpdate = async (req, res) => {
    try {
      const [customers, branches] = await Promise.all([
        customerModel.find({}, { customerFinId: 1, branch: 1, employeId: 1 }),
        newbranchModel.find({}, { _id: 1 }),
      ]);
      
      const validBranchIds = new Set(branches.map(b => b._id.toString()));
      const invalidCustomers = []; // Store customer details
      const updatedCustomers = [];
      
      // Track unique employee IDs with issues
      const uniqueEmployeeIssues = new Map(); // Map to track unique employee issues
      
      for (const customer of customers) {
        const branchId = customer.branch?.toString();
        
        if (branchId && !validBranchIds.has(branchId)) {
          // Branch is invalid - need to update from employee's branch
          if (customer.employeId) {
            try {
              // Get employee details with employeUniqueId and branchId
              const employee = await employeeModel.findById(customer.employeId).select('employeUniqueId branchId');
              
              if (employee) {
                if (employee.branchId) {
                  // Convert to string for comparison
                  const employeeBranchIdStr = employee.branchId.toString();
                  
                  // Check if the employee's branchId is valid
                  if (validBranchIds.has(employeeBranchIdStr)) {
                    // Update customer's branch with employee's branch
                    await customerModel.updateOne(
                      { _id: customer._id },
                      { $set: { branch: employee.branchId } }
                    );
                    
                    updatedCustomers.push({
                      customerFinId: customer.customerFinId,
                      oldBranch: branchId,
                      newBranch: employeeBranchIdStr
                    });
                    
                    console.log(`Updated branch for customerFinId ${customer.customerFinId} to branch ${employeeBranchIdStr}`);
                  } else {
                    // Employee's branch is also invalid
                    invalidCustomers.push({
                      customerFinId: customer.customerFinId,
                      reason: "Employee's branch is invalid"
                    });
                    
                    // Track unique employee with invalid branch
                    if (employee.employeUniqueId) {
                      if (!uniqueEmployeeIssues.has(employee.employeUniqueId)) {
                        uniqueEmployeeIssues.set(employee.employeUniqueId, {
                          employeUniqueId: employee.employeUniqueId,
                          reason: "Employee's branch is invalid",
                          customerCount: 1
                        });
                      } else {
                        const record = uniqueEmployeeIssues.get(employee.employeUniqueId);
                        record.customerCount++;
                      }
                    }
                    
                    console.log(`Both customer branch and employee branch are invalid for: ${customer.customerFinId}`);
                  }
                } else {
                  // Employee doesn't have a branch
                  invalidCustomers.push({
                    customerFinId: customer.customerFinId,
                    reason: "Employee has no branch"
                  });
                  
                  // Track unique employee with no branch
                  if (employee.employeUniqueId) {
                    if (!uniqueEmployeeIssues.has(employee.employeUniqueId)) {
                      uniqueEmployeeIssues.set(employee.employeUniqueId, {
                        employeUniqueId: employee.employeUniqueId,
                        reason: "Employee has no branch",
                        customerCount: 1
                      });
                    } else {
                      const record = uniqueEmployeeIssues.get(employee.employeUniqueId);
                      record.customerCount++;
                    }
                  }
                  
                  console.log(`Employee has no branch for customer: ${customer.customerFinId}`);
                }
              } else {
                // Employee not found
                invalidCustomers.push({
                  customerFinId: customer.customerFinId,
                  reason: "Employee record not found"
                });
                
                console.log(`Employee not found for customer: ${customer.customerFinId}`);
              }
            } catch (err) {
              console.error(`Error processing customer ${customer.customerFinId}:`, err);
              invalidCustomers.push({
                customerFinId: customer.customerFinId,
                reason: `Error: ${err.message}`
              });
            }
          } else {
            // No employee ID associated
            invalidCustomers.push({
              customerFinId: customer.customerFinId,
              reason: "No employee associated"
            });
            
            console.log(`Invalid branch and no employeId for: ${customer.customerFinId}`);
          }
        }
      }
      
      // Convert Map to array for response
      const employeesWithIssues = Array.from(uniqueEmployeeIssues.values());
      
      return res.status(200).json({
        message: 'Checked and updated invalid branch IDs',
        updatedCount: updatedCustomers.length,
        updatedCustomers,
        invalidCount: invalidCustomers.length,
        invalidCustomers,
        // Include unique employee IDs with issues
        employeesWithIssues: employeesWithIssues,
        employeesWithIssuesCount: employeesWithIssues.length
      });
    } catch (error) {
      console.error('Error checking/updating branch IDs:', error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  };  



const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const axios = require('axios');
require('dotenv').config();
const path = require('path');
const s3Client = new S3Client({
    endpoint: 'https://blr1.digitaloceanspaces.com',
    region: 'blr1',
    credentials: {
        accessKeyId: process.env.DO_SPACES_KEY,
        secretAccessKey: process.env.DO_SPACES_SECRET,
    }
});




// Function to upload file from URL to Spaces
async function uploadUrlToSpaces(fileUrl) {
    try {
        // Download the file

        //  let fileData = fs.readFileSync(fileUrl)


        const rootDir = path.resolve(__dirname, '../../..'); // Adjust the number of '../' based on your directory structure

        // Try multiple possible upload paths
        const possiblePaths = [
            path.join(rootDir, 'uploads', fileUrl),
            path.join(rootDir, 'public', 'uploads', fileUrl),
            path.join(__dirname, 'uploads', fileUrl),
            path.join(process.cwd(), 'uploads', fileUrl)
        ];

        let fileData;
        let usedPath;

        // Try each path until we find the file
        for (const tryPath of possiblePaths) {
            console.log('Trying path:', tryPath);
            if (fs.existsSync(tryPath)) {
                fileData = fs.readFileSync(tryPath);
                usedPath = tryPath;
                console.log('File found at:', tryPath);
                break;
            }
        }

        const originalFileName = path.basename(fileUrl);
        console.log('Original file name:', originalFileName);

        //  const response = await axios({
        //  method: 'get',
        //  url: fileUrl,
        //  responseType: 'arraybuffer'
        //  });
        //  // Extract filename from URL
        //  const urlParts = fileUrl.split('/');
        //  console.log('urlParts',urlParts)
        //  const originalFileName = urlParts[urlParts.length - 1];
        // Create new path in bucket
        const filePathInBucket = `${process.env.PATH_BUCKET}/LOS/PDF/${Date.now()}_${originalFileName}`;
        console.log('filePathInBucket', filePathInBucket)
        // Get content type
        const contentType = 'application/pdf';
        // Upload parameters
        const params = {
            Bucket: 'finexe',
            Key: filePathInBucket,
            Body: fileData,
            ACL: 'public-read',
            ContentType: contentType
        };
        // Upload file
        const command = new PutObjectCommand(params);
        await s3Client.send(command);

        // Return the new URL
        return `https://cdn.fincooper.in/${filePathInBucket}`;
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
}








// Example usage in an Express route handler
async function handleUrlUpload(req, res) {
    try {
        const { fileUrl } = req.body; // URL from the request body
        const newUrl = await uploadUrlToSpaces(fileUrl);

        return res.json({
            success: true,
            message: "File uploaded successfully",
            url: newUrl
        });
    } catch (error) {
        console.error("Upload failed:", error);
        return res.status(500).json({
            success: false,
            message: "Upload failed",
            error: error.message
        });
    }
}




async function branchWiseTotalLogIn(req, res) {
    try {
        const loginCompleteDateStart = moment().tz("Asia/Kolkata").startOf("day").toISOString();
        const loginCompleteDateEnd = moment().tz("Asia/Kolkata").endOf("day").toISOString();
        const monthStart = moment().startOf('month').toISOString();
        const yearStart = moment().startOf('year').toISOString();

        await customerModel.createIndexes({ branch: 1 });
        await newbranchModel.createIndexes({ _id: 1 });
        await processModel.createIndexes({ customerId: 1, salesCompleteDate: 1 });

        const branchLoginData = await customerModel.aggregate([
            {
                $lookup: {
                    from: "newbranches",
                    localField: "branch",
                    foreignField: "_id",
                    as: "newBranchDetails",
                    pipeline: [{ $project: { name: 1 } }]
                }
            },
            { $unwind: { path: "$newBranchDetails", preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: "processes",
                    let: { customer_id: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$customerId", "$$customer_id"] },
                                salesCompleteDate: { $gte: yearStart }
                            }
                        }
                    ],
                    as: "processData"
                }
            },
            { $unwind: { path: "$processData", preserveNullAndEmptyArrays: true } },

            {
                $group: {
                    _id: "$branch",
                    branchName: { $first: "$newBranchDetails.name" },
                    todayLogins: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $gte: ["$processData.salesCompleteDate", loginCompleteDateStart] },
                                        { $lte: ["$processData.salesCompleteDate", loginCompleteDateEnd] }
                                    ]
                                }, 1, 0
                            ]
                        }
                    },
                    MTDLogins: {
                        $sum: {
                            $cond: [
                                { $gte: ["$processData.salesCompleteDate", monthStart] }, 1, 0
                            ]
                        }
                    },
                    YTDLogins: {
                        $sum: {
                            $cond: [
                                { $gte: ["$processData.salesCompleteDate", yearStart] }, 1, 0
                            ]
                        }
                    }
                }
            },

            {
                $project: {
                    branchName: 1,
                    todayLogins: 1,
                    MTDLogins: 1,
                    YTDLogins: 1
                }
            },

            {
                $sort: {
                    todayLogins: -1,
                    MTDLogins: -1,
                    YTDLogins: -1
                }
            }
        ]);

        if (!branchLoginData || branchLoginData.length === 0) {
            return notFound(res, "No data found for branch logins");
        }

        return success(res, "Total Login By Branch", { totalBranch: branchLoginData.length, data: branchLoginData });
    } catch (error) {
        console.error(error);
        return unknownError(res, error);
    }
}



async function salespersonWithZeroLogin(req, res) {
    try {
        const loginCompleteDateStart = moment().tz("Asia/Kolkata").startOf("day").toISOString();
        const loginCompleteDateEnd = moment().tz("Asia/Kolkata").endOf("day").toISOString();
        const monthStart = moment().startOf('month').toISOString();
        const yearStart = moment().startOf('year').toISOString();

        const salesData = await customerModel.aggregate([
            {
                $lookup: {
                    from: "processes",
                    localField: "_id",
                    foreignField: "customerId",
                    as: "processData"
                }
            },
            { $unwind: { path: "$processData", preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: "employees",
                    localField: "employeId",
                    foreignField: "_id",
                    as: "employeeInfo"
                }
            },
            { $unwind: { path: "$employeeInfo", preserveNullAndEmptyArrays: true } },


            {
                $lookup: {
                    from: "roles",
                    localField: "employeeInfo.roleId",
                    foreignField: "_id",
                    as: "roleInfo"
                }
            },
            { $unwind: { path: "$roleInfo", preserveNullAndEmptyArrays: true } },

            {
                $match: {
                    "roleInfo.roleName": "sales",
                    "roleInfo.status": "active",
                    "employeeInfo.status": "active"
                }
            },

            {
                $lookup: {
                    from: "newbranches",
                    localField: "branch",
                    foreignField: "_id",
                    as: "branchInfo"
                }
            },
            { $unwind: { path: "$branchInfo", preserveNullAndEmptyArrays: true } },

            {
                $group: {
                    _id: "$employeeInfo._id",
                    branchName: { $first: "$branchInfo.name" },
                    salesPersonName: { $first: "$employeeInfo.employeName" },
                    salesPersonCode: { $first: "$employeeInfo.employeUniqueId" },
                    todayLogins: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $gte: ["$processData.salesCompleteDate", loginCompleteDateStart] },
                                        { $lte: ["$processData.salesCompleteDate", loginCompleteDateEnd] }
                                    ]
                                }, 1, 0
                            ]
                        }
                    },
                    MTDLogins: {
                        $sum: {
                            $cond: [{ $gte: ["$processData.salesCompleteDate", monthStart] }, 1, 0]
                        }
                    },
                    YTDLogins: {
                        $sum: {
                            $cond: [{ $gte: ["$processData.salesCompleteDate", yearStart] }, 1, 0]
                        }
                    }
                }
            },

            {
                $match: {
                    todayLogins: 0,
                }
            },

            {
                $project: {
                    branchName: 1,
                    salesPersonName: 1,
                    salesPersonCode: 1,
                    todayLogins: 1,
                    MTDLogins: 1,
                    YTDLogins: 1
                }
            },

            {
                $sort: {
                    MTDLogins: -1,
                    YTDLogins: -1,
                }
            }
        ]);

        return success(res, "Salespersons with 0 Logins by Branch", { data: salesData });

    } catch (error) {
        console.error("Error fetching sales data:", error);
        return unknownError(res, error);
    }
}




async function salespersonWithZeroLoginStateWiseCheck(req, res) {
    try {
        // Define date ranges
        const today = moment().tz("Asia/Kolkata");
        const loginCompleteDateStart = today.clone().startOf("day").toISOString();
        const loginCompleteDateEnd = today.clone().endOf("day").toISOString();
        const monthStart = today.clone().startOf("month").toISOString();
        const yearStart = today.clone().startOf("year").toISOString();

        const salesData = await employeeModel.aggregate([
            // Step 1: Join with branches collection
            {
                $lookup: {
                    from: 'newbranches',
                    localField: 'branchId',
                    foreignField: '_id',
                    as: 'branchDetails',
                },
            },
            { $unwind: '$branchDetails' },

            // Step 2: Join with roles collection
            {
                $lookup: {
                    from: 'roles',
                    localField: 'roleId',
                    foreignField: '_id',
                    as: 'roleDetails',
                },
            },
            { $unwind: '$roleDetails' },

            // Step 3: Filter for sales role only
            {
                $match: {
                    'roleDetails.roleName': 'sales',
                },
            },



            // Step 4: Join with newdesignation collection to get designation name
            {
                $lookup: {
                    from: 'newdesignation',
                    localField: 'designationId',
                    foreignField: '_id',
                    as: 'designationDetails',
                },
            },
            { $unwind: { path: '$designationDetails', preserveNullAndEmptyArrays: true } },

            // Step 5: Exclude employees who have the designation "Manager"
            {
                $match: {
                    'designationDetails.name': { $ne: 'MANAGER' },
                },
            },


            // Step 5: Join with processes collection
            {
                $lookup: {
                    from: 'processes',
                    let: { employeeId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$employeId', '$$employeeId'] },
                                // Check for all your form conditions
                                customerFormStart: true,
                                customerFormComplete: true,
                                applicantFormStart: true,
                                applicantFormComplete: true,
                                coApplicantFormStart: true,
                                coApplicantFormComplete: true,
                                guarantorFormStart: true,
                                guarantorFormComplete: true,
                                salesCompleteDate: {
                                    $gte: loginCompleteDateStart,
                                    $lte: loginCompleteDateEnd
                                }
                            }
                        }
                    ],
                    as: 'todayProcesses',
                },
            },

            // Step 6: Calculate MTD and YTD logins
            {
                $lookup: {
                    from: 'processes',
                    let: { employeeId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$employeId', '$$employeeId'] },
                                salesCompleteDate: {
                                    $gte: monthStart,
                                    $lte: loginCompleteDateEnd
                                }
                            }
                        },
                        {
                            $count: 'mtdCount'
                        }
                    ],
                    as: 'mtdLogins',
                },
            },
            {
                $lookup: {
                    from: 'processes',
                    let: { employeeId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$employeId', '$$employeeId'] },
                                salesCompleteDate: {
                                    $gte: yearStart,
                                    $lte: loginCompleteDateEnd
                                }
                            }
                        },
                        {
                            $count: 'ytdCount'
                        }
                    ],
                    as: 'ytdLogins',
                },
            },

            // Step 7: Filter employees with zero logins today
            {
                $match: {
                    'todayProcesses': { $size: 0 }
                },
            },

            // Step 8: Project only the required fields
            {
                $project: {
                    _id: 1,
                    employeName: 1,
                    roleId: 1,
                    roleName: '$roleDetails.roleName',
                    branchId: 1,
                    state: '$branchDetails.state',
                    branchName: '$branchDetails.name',
                    mtdLogins: {
                        $ifNull: [
                            { $arrayElemAt: ['$mtdLogins.mtdCount', 0] },
                            0
                        ]
                    },
                    ytdLogins: {
                        $ifNull: [
                            { $arrayElemAt: ['$ytdLogins.ytdCount', 0] },
                            0
                        ]
                    }
                }
            },

            // Step 9: Sort by state and employee name
            {
                $sort: {
                    'state': 1,
                    'employeName': 1
                }
            }
        ]);

        // Group data state-wise
        const groupedData = salesData.reduce((acc, emp) => {
            if (!acc[emp.state]) {
                acc[emp.state] = [];
            }
            acc[emp.state].push(emp);
            return acc;
        }, {});



        // const managerMailsByState = await newbranchModel.aggregate([
        //     // Step 1: Group branches by state
        //     {
        //         $group: {
        //             _id: "$state",  // Group by state
        //             branchIds: { $push: "$_id" }  // Collect all branch _ids for each state
        //         }
        //     },

        //     // Step 2: Lookup employees who belong to these branches
        //     {
        //         $lookup: {
        //             from: "employees",
        //             localField: "branchIds",
        //             foreignField: "branchId",
        //             as: "employeesDetail"
        //         }
        //     },

        //     // Step 3: Unwind employees to process each separately
        //     { $unwind: "$employeesDetail" },

        //     // Step 4: Lookup designation details for employees
        //     {
        //         $lookup: {
        //             from: "newdesignations",
        //             localField: "employeesDetail.designationId",
        //             foreignField: "_id",
        //             as: "designationDetails"
        //         }
        //     },

        //     // Step 5: Unwind designation details
        //     { $unwind: "$designationDetails" },

        //     // Step 6: Filter only employees with designation name "MANAGER"
        //     {
        //         $match: {
        //             "designationDetails.name": { $regex: /^MANAGER$/i } // Case-insensitive match for "MANAGER"
        //         }
        //     },

        //     // Step 7: Group back by state and collect manager emails
        //     {
        //         $group: {
        //             _id: "$_id",
        //             ccMail: { $addToSet: "$employeesDetail.workEmail" } // Collect unique work emails in an array
        //         }
        //     }
        // ]);

        // // Reformat the result as you require
        // const stateCcMails = managerMailsByState.map(state => {
        //     return {
        //         [state._id]: state.ccMail
        //     };
        // });


        const managerMailsByState = await newbranchModel.aggregate([
            {
                $group: {
                    _id: "$state",
                    branchIds: { $push: "$_id" }
                }
            },
            {
                $lookup: {
                    from: "employees",
                    localField: "branchIds",
                    foreignField: "branchId",
                    as: "employeesDetail"
                }
            },
            { $unwind: "$employeesDetail" },
            {
                $lookup: {
                    from: "newdesignations",
                    localField: "employeesDetail.designationId",
                    foreignField: "_id",
                    as: "designationDetails"
                }
            },
            { $unwind: "$designationDetails" },
            {
                $match: {
                    "designationDetails.name": { $regex: /^MANAGER$/i }
                }
            },
            {
                $group: {
                    _id: "$_id",
                    ccMail: { $addToSet: "$employeesDetail.workEmail" }
                }
            }
        ]);

        // Convert manager emails into a dictionary by state
        const stateCcMails = {};
        managerMailsByState.forEach(state => {
            stateCcMails[state._id] = state.ccMail;
        });

        // Iterate over each state and send emails
        for (const [state, salesPersons] of Object.entries(groupedData)) {
            let toEmails = 'darshanrajput@fincoopers.in'; // Default recipient
            let ccMails = stateCcMails[state] || []; // Get manager emails for that state

            if (!salesPersons.length) continue; // Skip if no salespersons in state

            let title = "I wanted to bring to your attention an important issue regarding our active salespersons. The recent analysis indicates that several sales team members across different branches have not logged in to the system for an extended period. Specifically, the following branches have salespersons with 0 recorded logins:";
            let subject = "Urgent: Action Required for Active Salespersons with 0 Logins by Branch";
            let footerText = "The lack of login activity may hinder their performance and our overall sales objectives. It is vital that we address this issue promptly to ensure that our team is engaged and equipped with the necessary tools and resources.";
            let footerText2 = "I recommend reaching out to the respective salespersons to understand any challenges they may be facing and provide them with the support needed to re-engage with the system."
            // Create the dynamic table rows
            const branchInfo = salesPersons.map((data) => `
                <tr>
                    <td>${data.branchName}</td>
                    <td>${data.employeName}</td>
                    <td>${data.mtdLogins}</td>
                    <td>${data.ytdLogins}</td>
                </tr>
            `).join('');

            // HTML email body
            const html = `
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; }
                        h2 { color: #4CAF50; }
                        p { font-size: 14px; color: #333; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        table, th, td { border: 1px solid #ddd; padding: 8px; }
                        th { background-color: #f2f2f2; text-align: left; }
                        .footer { margin-top: 20px; font-size: 12px; color: #888; }
                    </style>
                </head>
                <body>
                    <p>Dear State Head,</p>
                    <p>${title}</p>

                    <table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse; width: 100%;">
                        <thead>
                            <tr>
                                <th>Branch Name</th>
                                <th>Sales Person Name</th>
                                <th>MTD Logins</th>
                                <th>YTD Logins</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${branchInfo}
                        </tbody>
                    </table>

                    <p>${footerText}</p>
                    <p>${footerText2}</p>

                    <div class="footer">
                        <p>Best regards,</p>
                        <p>Team Fin Coopers</p>
                    </div>
                </body>
                </html>
            `;


            await sendEmailByVendor('creditPd',
                toEmails,
                ccMails,
                subject,
                html
            );
        }




        return success(res, "Salespersons with 0 Logins Today by State", { stateCcMails: stateCcMails, data: salesData });
    } catch (error) {
        console.error("Error fetching sales data:", error);
        return unknownError(res, error);
    }
}




async function getActiveSalespersonsPerformance(req, res) {
    try {
        const loginCompleteDateStart = moment().tz("Asia/Kolkata").startOf("day").toISOString();
        const loginCompleteDateEnd = moment().tz("Asia/Kolkata").endOf("day").toISOString();
        const monthStart = moment().startOf('month').toISOString();
        const yearStart = moment().startOf('year').toISOString();

        const salesData = await customerModel.aggregate([
            {
                $lookup: {
                    from: "processes",
                    localField: "_id",
                    foreignField: "customerId",
                    as: "processData"
                }
            },
            { $unwind: { path: "$processData", preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: "employees",
                    localField: "employeId",
                    foreignField: "_id",
                    as: "employeeInfo"
                }
            },
            { $unwind: { path: "$employeeInfo", preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: "roles",
                    localField: "employeeInfo.roleId",
                    foreignField: "_id",
                    as: "roleInfo"
                }
            },
            { $unwind: { path: "$roleInfo", preserveNullAndEmptyArrays: true } },

            {
                $match: {
                    "roleInfo.roleName": "sales",
                    "employeeInfo.status": "active"
                }
            },

            {
                $lookup: {
                    from: "newbranches",
                    localField: "branch",
                    foreignField: "_id",
                    as: "branchInfo"
                }
            },
            { $unwind: { path: "$branchInfo", preserveNullAndEmptyArrays: true } },

            {
                $group: {
                    _id: "$employeeInfo._id",
                    branchName: { $first: "$branchInfo.name" },
                    salesPersonName: { $first: "$employeeInfo.employeName" },
                    salesPersonCode: { $first: "$employeeInfo.employeUniqueId" },
                    employeeTarget: { $first: "$employeeInfo.employeeTarget" },
                    todayLogins: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $gte: ["$processData.salesCompleteDate", loginCompleteDateStart] },
                                        { $lte: ["$processData.salesCompleteDate", loginCompleteDateEnd] }
                                    ]
                                }, 1, 0
                            ]
                        }
                    },
                    MTDLogins: {
                        $sum: {
                            $cond: [{ $gte: ["$processData.salesCompleteDate", monthStart] }, 1, 0]
                        }
                    },
                    YTDLogins: {
                        $sum: {
                            $cond: [{ $gte: ["$processData.salesCompleteDate", yearStart] }, 1, 0]
                        }
                    }
                }
            },
        ]);

        // Process MonthlyLoginTarget and AchievementRate in JavaScript after fetching data
        const processedData = salesData.map(item => {
            let MonthlyLoginTarget = 0;

            // Find sales target in employee target array
            if (item.employeeTarget && Array.isArray(item.employeeTarget)) {
                const salesTargetObj = item.employeeTarget.find(t => t.title === "sales");
                if (salesTargetObj && salesTargetObj.value) {
                    MonthlyLoginTarget = parseFloat(salesTargetObj.value) || 0;
                }
            }

            // Calculate achievement rate
            let AchievementRate = 0;
            if (MonthlyLoginTarget > 0) {
                AchievementRate = (item.MTDLogins / MonthlyLoginTarget) * 100;
            }

            return {
                ...item,
                _id: undefined, // Remove _id field
                MonthlyLoginTarget,
                AchievementRate: Math.round(AchievementRate * 100) / 100 // Round to 2 decimal places
            };
        });

        // Sort by achievement rate in descending order
        processedData.sort((a, b) => b.AchievementRate - a.AchievementRate);

        return success(res, "Salespersons Performance", { totalEmployee: processedData.length, data: processedData });

    } catch (error) {
        console.error("Error fetching sales data:", error);
        return unknownError(res, error);
    }
}




async function reasonalBranchWiseLogin(req, res) {
    try {

        const { startDate, endDate } = req.query;


        const leadStart = moment.tz(startDate, "Asia/Kolkata").startOf("day").toDate();
        const leadEnd = moment.tz(endDate, "Asia/Kolkata").endOf("day").toDate();


        const loginStart = moment(startDate).tz("Asia/Kolkata").startOf("day").toISOString();
        const loginEnd = moment(endDate).tz("Asia/Kolkata").endOf("day").toISOString();



        // Step 1: Run the existing employee aggregation
        const rootEmployee = await employeeModel
            .aggregate([
                // Stage 1: Match only active employees
                {
                    $match: {
                        status: "active"
                    }
                },

                // Stage 2: Look up branch information
                {
                    $lookup: {
                        from: "newbranches",
                        localField: "branchId",
                        foreignField: "_id",
                        as: "branchDetails"
                    }
                },

                // Stage 3: Unwind branch details
                {
                    $unwind: {
                        path: "$branchDetails",
                        preserveNullAndEmptyArrays: true
                    }
                },

                {
                    $lookup: {
                        from: "newbranches",
                        localField: "branchDetails.regionalBranchId",
                        foreignField: "_id",
                        as: "regionalBranchDetails"
                    }
                },

                // Stage 3: Unwind branch details
                {
                    $unwind: {
                        path: "$regionalBranchDetails",
                        preserveNullAndEmptyArrays: true
                    }
                },

                // Stage 4: Project required fields
                {
                    $project: {
                        _id: 1,
                        employeeName: "$employeName",
                        employeeId: "$_id",
                        reportingManagerId: 1,
                        branchId: 1,
                        branchName: { $ifNull: ["$branchDetails.name", "No Branch"] },
                        regionalBranchName: { $ifNull: ["$regionalBranchDetails.name", "No Branch"] }

                    }
                },

                // Stage 5: Group employees by their reporting manager and branch
                {
                    $group: {
                        _id: {
                            branchId: "$branchId",
                            managerId: "$reportingManagerId"
                        },
                        branchName: { $first: "$branchName" },
                        regionalBranchName: { $first: "$regionalBranchName" },
                        totalEmployees: { $sum: 1 },
                        employeeIds: { $push: "$employeeId" }
                    }
                },

                // Stage 6: Look up manager information
                {
                    $lookup: {
                        from: "employees",
                        localField: "_id.managerId",
                        foreignField: "_id",
                        as: "managerInfo"
                    }
                },

                // Stage 7: Unwind manager info (if exists)
                {
                    $unwind: {
                        path: "$managerInfo",
                        preserveNullAndEmptyArrays: true
                    }
                },

                // Stage 8: Restructure to intermediate format
                {
                    $project: {
                        _id: 0,
                        branchId: "$_id.branchId",
                        branchName: "$branchName",
                        regionalBranchName: "$regionalBranchName",
                        manager: { $ifNull: ["$managerInfo.employeName", "No Manager"] },
                        managerId: "$_id.managerId", // Include manager ID for hierarchy building
                        totalEmployeeUnderManager: "$totalEmployees",
                        employeeIdList: "$employeeIds"
                    }
                },

                // Stage 9: Group by branch to organize managers under branches
                {
                    $group: {
                        _id: {
                            branchId: "$branchId",
                            branchName: "$branchName",
                            regionalBranchName: "$regionalBranchName"
                        },
                        managers: {
                            $push: {
                                manager: "$manager",
                                managerId: "$managerId",
                                totalEmployeeUnderManager: "$totalEmployeeUnderManager",
                                employeeIdList: "$employeeIdList"
                            }
                        },
                        totalBranchEmployees: { $sum: "$totalEmployeeUnderManager" }
                    }
                },

                // Stage 10: Final projection
                {
                    $project: {
                        _id: 0,
                        branchId: "$_id.branchId",
                        branch: "$_id.branchName",
                        regionalBranchName: "$_id.regionalBranchName",
                        totalBranchEmployees: 1,
                        managers: 1
                    }
                },

                // Stage 11: Sort by branch name
                {
                    $sort: { branch: 1 }
                }
            ]);

        // Step 2: Get login data from processModel
        const allEmployeeIds = rootEmployee.flatMap(branch =>
            branch.managers.flatMap(manager => manager.employeeIdList)
        );

        // Step 3: Fetch employee login data
        const loginData = await processModel.aggregate([
            {
                $match: {
                    employeId: { $in: allEmployeeIds },
                    salesCompleteDate: { $gte: loginStart, $lte: loginEnd }
                }
            },
            {
                $group: {
                    _id: "$employeId",
                    loginDoneCount: { $sum: 1 } // Count login occurrences
                }
            }
        ]);

        // Step 4: Fetch employee lead generation count
        const leadData = await leadGenerateModel.aggregate([
            {
                $match: {
                    employeeGenerateId: { $in: allEmployeeIds },
                    createdAt: { $gte: leadStart, $lte: leadEnd }
                }
            },
            {
                $group: {
                    _id: "$employeeGenerateId",
                    leadGenerateCount: { $sum: 1 }
                }
            }
        ]);

        // Step 5: Fetch employee details & sales target
        const allEmployees = await employeeModel.find(
            { _id: { $in: allEmployeeIds } },
            { _id: 1, employeName: 1, employeeTarget: 1 }
        ).lean();

        const employeeMap = {};
        allEmployees.forEach(emp => {
            let salesTarget = 0;
            if (emp.employeeTarget) {
                const salesTargetEntry = emp.employeeTarget.find(target => target.title === "sales");
                if (salesTargetEntry) salesTarget = parseInt(salesTargetEntry.value) || 0;
            }
            employeeMap[emp._id.toString()] = { name: emp.employeName, target: salesTarget };
        });

        // Step 6: Map login and lead data
        const employeeLoginMap = {};
        loginData.forEach(entry => {
            employeeLoginMap[entry._id.toString()] = entry.loginDoneCount;
        });

        const employeeLeadMap = {};
        leadData.forEach(entry => {
            employeeLeadMap[entry._id.toString()] = entry.leadGenerateCount;
        });

        // Step 7: Process each branch and manager
        rootEmployee.forEach(branch => {
            let branchTarget = 0;
            let branchLoginDone = 0;
            let branchLeadGenerated = 0;

            branch.teamLoginSummary = [];
            branch.managers.forEach(manager => {
                let teamTarget = 0;
                let teamLoginDone = 0;
                let teamLeadGenerated = 0;

                let employeeDetails = [];
                let notLoggedInEmployeeIds = [];

                manager.employeeIdList.forEach(empId => {
                    const loginCount = employeeLoginMap[empId] || 0;
                    const leadCount = employeeLeadMap[empId] || 0;
                    const target = employeeMap[empId]?.target || 0;

                    const achievementRate = target > 0
                        ? ((loginCount + leadCount) / target) * 100
                        : 0;

                    if (loginCount === 0) {
                        notLoggedInEmployeeIds.push(empId);
                    }

                    employeeDetails.push({
                        employeeId: empId,
                        employeName: employeeMap[empId]?.name || "Unknown",
                        loginDoneCount: loginCount,
                        leadGenerateCount: leadCount,
                        employeeTarget: target,
                        achievementRate: achievementRate.toFixed(2) + "%"
                    });

                    // Team-level calculations
                    teamTarget += target;
                    teamLoginDone += loginCount;
                    teamLeadGenerated += leadCount;
                });

                const teamAchievementRate = teamTarget > 0
                    ? ((teamLoginDone + teamLeadGenerated) / teamTarget) * 100
                    : 0;

                manager.totalEmployeeUnderManager = manager.employeeIdList.length;
                manager.loggedInEmployees = teamLoginDone;
                manager.notLoggedInEmployees = manager.totalEmployeeUnderManager - teamLoginDone;
                manager.notLoggedInEmployeeIds = notLoggedInEmployeeIds;
                manager.employeeLoginDetails = employeeDetails;
                manager.employeeTarget = teamTarget;
                manager.achievementRate = teamAchievementRate.toFixed(2) + "%";

                // Branch-level calculations
                branchTarget += teamTarget;
                branchLoginDone += teamLoginDone;
                branchLeadGenerated += teamLeadGenerated;

                branch.teamLoginSummary.push({
                    manager: manager.manager,
                    managerId: manager.managerId,
                    totalEmployees: manager.totalEmployeeUnderManager,
                    totalEmployeeTarget: teamTarget,
                    loggedInEmployees: teamLoginDone,
                    leadGenerateCount: teamLeadGenerated,
                    achievementRate: teamAchievementRate.toFixed(2) + "%"
                });
            });

            const branchAchievementRate = branchTarget > 0
                ? ((branchLoginDone + branchLeadGenerated) / branchTarget) * 100
                : 0;

            branch.totalBranchEmployees = branch.managers.reduce(
                (sum, manager) => sum + manager.totalEmployeeUnderManager,
                0
            );
            branch.totalBranchTarget = branchTarget;
            branch.totalLoggedInEmployees = branchLoginDone;
            branch.totalLeadGenerated = branchLeadGenerated;
            branch.achievementRate = branchAchievementRate.toFixed(2) + "%";
        });

        return success(res, "Employee login & achievement data retrieved successfully", rootEmployee);
    } catch (error) {
        console.error("Error fetching login data:", error);
        return unknownError(res, error);
    }
}



async function coapplicantDeleteByCustomerId(req, res) {
    const { customerId, coApplicantIdsToDelete } = req.body;

    if (!customerId || !Array.isArray(coApplicantIdsToDelete) || coApplicantIdsToDelete.length === 0) {
        return badRequest(res, "Invalid input. Please provide a valid customerId and an array of coApplicantIdsToDelete.")
    }

    try {
        // Step 1: Fetch customer details from customerModel
        const customerDetail = await customerModel.findById(customerId);
        if (!customerDetail) {
            return badRequest(res, "Customer not found");
        }

        const coApplicantDetails = await coApplicantModel.find({
            customerId: customerId,
            _id: { $in: coApplicantIdsToDelete } // Check if _id exists in coApplicantIdsToDelete array
        });

        if (coApplicantDetails.length !== coApplicantIdsToDelete.length) {
            return badRequest(res, "One or more co-applicants not found for the given customerId.");
        }

        // Step 2: Loop through each co-applicant ID to delete
        for (let coApplicantIdToDelete of coApplicantIdsToDelete) {
            // Step 3: Fetch the co-applicant records by customerId
            const coApplicantRecords = await coApplicantModel.find({ customerId });

            // Step 4: Find the index of the co-applicant that needs to be deleted
            let targetIndex = coApplicantRecords.findIndex(record => record._id.toString() === coApplicantIdToDelete);

            if (targetIndex === -1) {
                console.log(`Co-Applicant with ID ${coApplicantIdToDelete} not found for this customer`);
                continue;
            }

            const coApplicant = coApplicantRecords[targetIndex];
            console.log(`Co-Applicant found at index ${targetIndex}`);

            // return 
            // Step 5: Fetch CIBIL details related to the customerId
            const customerCibilData = await cibilModel.findOne({ customerId });
            let cibilDetailsToSave = null;

            if (customerCibilData) {
                // Step 6: Handle deletion by index
                if (customerCibilData.coApplicantData.length > targetIndex) {
                    // Extract the co-applicant CIBIL data at the index
                    cibilDetailsToSave = customerCibilData.coApplicantData[targetIndex];
                    console.log(`Found CIBIL data for co-applicant at index ${targetIndex} for customerId ${customerId}`);

                    // Step 7: Delete the CIBIL data at the target index
                    customerCibilData.coApplicantData.splice(targetIndex, 1); // Remove the CIBIL data at the index
                    console.log(`Removed CIBIL data at index ${targetIndex} for customerId ${customerId}`);

                    await customerCibilData.save(); // Save the updated CIBIL data
                } else {
                    console.log(`No CIBIL data found at index ${targetIndex} for customerId ${customerId}`);
                }
            } else {
                console.log(`No CIBIL data found for customerId ${customerId}`);
            }

            // Step 8: Prepare the data to save to the deleteCoApplicant model
            const deleteData = {
                customerId,
                coApplicant: [
                    {
                        coApplicantId: coApplicant._id, // Co-Applicant ID
                        coApplicantDetail: coApplicant, // Save the co-applicant details
                        coApplicantCibilDetail: cibilDetailsToSave || {} // Save CIBIL details if found, otherwise empty object
                    }
                ]
            };

            // Step 9: Check if the customer already has deletion data saved
            const existingDeleteData = await deleteCoApplicantModel.findOne({ customerId });

            if (existingDeleteData) {
                // If the document exists, append the new co-applicant deletion data at the end of the coApplicant array
                existingDeleteData.coApplicant.push(deleteData.coApplicant[0]);
                await existingDeleteData.save(); // Save the updated delete document
                console.log(`Updated delete data for customerId ${customerId}`);
            } else {
                // If the document doesn't exist, create a new one and save it
                const newDeleteData = new deleteCoApplicantModel(deleteData);
                await newDeleteData.save();
                console.log(`Created new delete entry for customerId ${customerId}`);
            }

            // Step 10: Delete the co-applicant from the coApplicantModel
            await coApplicantModel.deleteOne({ _id: coApplicantIdToDelete });
            console.log(`Co-Applicant with ID ${coApplicantIdToDelete} deleted successfully from coApplicantModel`);
        }

        // After all deletions are done
        return success(res, "Co-Applicants deleted successfully");

    } catch (error) {
        console.error(error);
        return unknownError(res, error);
    }
}

async function customerIdByCoapplicantDeleteList(req, res) {
    const { customerId } = req.query;
    try {

        if (!customerId) {
            return badRequest(res, "customer i required")
        }
        const newDeleteDataList = await deleteCoApplicantModel.findOne({ customerId: customerId });

        if (!newDeleteDataList) {
            return success(res, "Co-Applicants List", {});
        }
        return success(res, "Co-Applicants List", newDeleteDataList);

    } catch (error) {
        console.error(error);
        return unknownError(res, error);
    }
}


async function addDeleteCoapplicantData(req, res) {
    try {

        const { customerId, coApplicantId } = req.query

        const customerDetail = await customerModel.findById(customerId)
        if (!customerDetail) {
            return notFound(res, "Customr Not Found")
        }

        // Find the deleteCoApplicant entry with the given customerId and coApplicantId
        const deletedCoApplicant = await deleteCoApplicantModel.findOne({
            customerId: customerId,
            "coApplicant.coApplicantId": coApplicantId,
        });

        if (!deletedCoApplicant) {
            return notFound(res, "Exist Co Applicant Not Found")
        }


        // Extract the matching coApplicantDetail
        const coApplicant = deletedCoApplicant.coApplicant.find(
            (item) => item.coApplicantId.toString() === coApplicantId
        );

        if (!coApplicant || !coApplicant.coApplicantDetail) {
            return notFound(res, "No valid coApplicantDetail found.");
        }

        // Check if coApplicantDetail already exists
        let existingCoApplicant = await coApplicantModel.findOne({ _id: coApplicantId });

        let newCoApplicantData = {
            ...coApplicant.coApplicantDetail, // Copy all details
            createdAt: new Date(),
            updatedAt: new Date(),
        };


        // If not found, create a new entry with a new _id
        newCoApplicantData._id = new mongoose.Types.ObjectId();
        const newCoApplicant = new coApplicantModel(newCoApplicantData);
        await newCoApplicant.save();
        console.log("New co-applicant added:", newCoApplicant._id);


        // Remove the added coApplicant from deleteCoApplicantModel
        await deleteCoApplicantModel.updateOne(
            { customerId: deletedCoApplicant.customerId },
            { $pull: { coApplicant: { coApplicantId: coApplicantId } } }
        );

        const updatedDoc = await deleteCoApplicantModel.findOne({
            customerId: deletedCoApplicant.customerId,
        });

        if (updatedDoc && updatedDoc.coApplicant.length === 0) {
            // If no coApplicants are left, delete the entire document
            await deleteCoApplicantModel.deleteOne({ customerId: deletedCoApplicant.customerId });
            console.log("Deleted entire deleteCoApplicantModel for customerId:", deletedCoApplicant.customerId);
        } else {
            console.log("Deleted co-applicant from deleteCoApplicantModel:", coApplicantId);
        }


        return success(res, "Deleted co-applicant from deleteCoApplicantModel:", coApplicantId);

    } catch (error) {
        console.error(error);
        return unknownError(res, error);
    }
};


//fin id by get witch employee login create 
async function finIdByEmployeeDetail(req, res) {
    try {

        const input = `FINSECBT1619`
        const customerFinIds = input.trim().split('\n').map(id => id.trim())

        const result = [];

        for (const finId of customerFinIds) {
            const customer = await customerModel.findOne({ customerFinId: finId });

            if (customer) {
                const employee = await employeeModel.findById(customer.employeId);
                if (employee) {

                    result.push({
                        customerFinId: finId,
                        employeeUserName: employee?.userName || "",
                        employeeemployeName: employee?.employeName || "",
                        employeeemployeUniqueId: employee?.employeUniqueId || "",
                        employeeId: customer.employeId || ""
                    });
                } else {
                    console.log('employee not maTCH--------')
                }
            }
        }
        return success(res, "employee Detail ", result)
    } catch (error) {
        console.error(error);
        return unknownError(res, error);
    }
};





module.exports = {
    handleUrlUpload, uploadUrlToSpaces, salesLoginPropertyForm, getSalesLoginProperty, customerChargesForm, getCustomerCharges, getAllCharges,
    chargesDecisionByApprover, getAllPhysicalFileCouriers, physicalFileDecisionByApprover, cibilByRivertDocuments, allSalesFilesDashBoard,
    salesDashBoardProductTable, salesDashBoardBranchTable, salesDashBoardEmployeeTable, branchWiseTotalLogIn, salespersonWithZeroLogin,
    getActiveSalespersonsPerformance, reasonalBranchWiseLogin, salespersonWithZeroLoginStateWiseCheck, coapplicantDeleteByCustomerId, customerIdByCoapplicantDeleteList,
    addDeleteCoapplicantData, finIdByEmployeeDetail, countAvgForMasterDashboard,dashboardMonthlyCount
}
