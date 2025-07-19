const branchRequestModel = require("../../model/forms/branchRequest.model");
const { returnFormatter } = require("../../formatter/common.formatter");
const employeeModel = require("../../model/adminMaster/employe.model");
const { getFormConfigByName } = require("../formConfig.helper");
const CsvParser = require("json2csv").Parser;
const mongoose = require("mongoose");

// Create a new branchRequest
async function addBranchRequest(bodyData, userId) {
    try {
        bodyData.createdBy = userId;
        bodyData.updatedBy = userId;
        const formConfig = await getFormConfigByName('branchRequest');
        bodyData.l1Approver = formConfig.data.defaultL1;
        bodyData.l2Approver = formConfig.data.defaultL2;
        bodyData.l3Approver = formConfig.data.defaultL3;
        bodyData.location = {
            type:"Point",
            coordinates:[parseFloat(bodyData.branchLatitude),parseFloat(bodyData.branchLongitude)]
        }
        const saveData = new branchRequestModel(bodyData);
        await saveData.save();
        return returnFormatter(true, "Branch request created", saveData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// Get a branchRequest by branchRequestId
async function getBranchRequestById(branchRequestId) {
    try {
        const branchRequest = await branchRequestModel.findOne({ branchRequestId });
        if (!branchRequest) {
            return returnFormatter(false, "Branch request not found");
        }
        return returnFormatter(true, "Branch request found", branchRequest);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}



// Update a branchRequest
async function updateBranchRequest(branchRequestId, updateData, userId) {
    try {
        updateData.updatedBy = userId;
        const updatedBranchRequest = await branchRequestModel.findOneAndUpdate(
            { branchRequestId },
            updateData,
            { new: true }
        );
        if (!updatedBranchRequest) {
            return returnFormatter(false, "Branch request not found");
        }
        return returnFormatter(true, "Branch request updated", updatedBranchRequest);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// Deactivate a branchRequest (set isActive to false)
async function deactivateBranchRequest(branchRequestId) {
    try {
        const deactivatedBranchRequest = await branchRequestModel.findOneAndUpdate(
            { branchRequestId },
            { isActive: false },
            { new: true }
        );
        if (!deactivatedBranchRequest) {
            return returnFormatter(false, "Branch request not found");
        }
        return returnFormatter(true, "Branch request deactivated", deactivatedBranchRequest);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// Get all active branchRequests
async function getAllActiveBranchRequests() {
    try {
        const branchRequests = await branchRequestModel.find({ isActive: true });
        if (branchRequests.length === 0) {
            return returnFormatter(false, "No active branch requests found");
        }
        return returnFormatter(true, "Active branch requests found", branchRequests);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// Get branchRequest statistics
async function getBranchRequestStats() {
    try {
        // Retrieve all branchRequests with lookup for employee details (creator)
        const branchRequests = await branchRequestModel.aggregate([
            {
                $lookup: {
                    from: 'employees',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'creatorDetails',
                },
            },
            { $unwind: '$creatorDetails' },
        ]);

        if (branchRequests.length === 0) {
            return returnFormatter(false, 'No branch requests found');
        }

        // Overall stats calculations
        const overAllStats = branchRequests.reduce(
            (acc, branchRequest) => {
                // Check each status and increment counters based on approval status
                const isApproved =
                    branchRequest.l1Status === 'approved' ||
                    branchRequest.l2Status === 'approved' 
                const isPending =
                    branchRequest.l1Status === 'pending' ||
                    branchRequest.l2Status === 'pending' 

                acc.totalBranchRequests += 1;
                if (isApproved) {
                    acc.branchRequestsApproved += 1;
                    acc.amountApproved += branchRequest.purchaseValue || 0;
                    
                }
                if (isPending) {
                    acc.branchRequestsPending += 1;
                    acc.amountPending += branchRequest.purchaseValue || 0;
                }
                return acc;
            },
            {
                totalBranchRequests: 0,
                branchRequestsApproved: 0,
                branchRequestsPending: 0,
                amountApproved: 0,
                amountPending: 0,
            }
        );

        // Branch-wise case count
        const branchWiseCases = await branchRequestModel.aggregate([
            {
                $lookup: {
                    from: 'employees',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'creatorDetails',
                },
            },
            { $unwind: '$creatorDetails' },
            {
                $group: {
                    _id: '$creatorDetails.branchId',
                    totalBranchRequests: { $sum: 1 },
                    branchRequestsApproved: {
                        $sum: {
                            $cond: [
                                {
                                    $or: [
                                        { $eq: ['$l1Status', 'approved'] },
                                        { $eq: ['$l2Status', 'approved'] },
                                        { $eq: ['$l3Status', 'approved'] },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    branchRequestsPending: {
                        $sum: {
                            $cond: [
                                {
                                    $or: [
                                        { $eq: ['$l1Status', 'pending'] },
                                        { $eq: ['$l2Status', 'pending'] },
                                        { $eq: ['$l3Status', 'pending'] },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    amountApproved: {
                        $sum: {
                            $cond: [
                                {
                                    $or: [
                                        { $eq: ['$l1Status', 'approved'] },
                                        { $eq: ['$l2Status', 'approved'] },
                                        { $eq: ['$l3Status', 'approved'] },
                                    ],
                                },
                                '$purchaseValue',
                                0,
                            ],
                        },
                    },
                    amountPending: {
                        $sum: {
                            $cond: [
                                {
                                    $or: [
                                        { $eq: ['$l1Status', 'pending'] },
                                        { $eq: ['$l2Status', 'pending'] },
                                        { $eq: ['$l3Status', 'pending'] },
                                    ],
                                },
                                '$purchaseValue',
                                0,
                            ],
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: 'newbranches', // Branch collection name
                    localField: '_id',
                    foreignField: '_id',
                    as: 'branch',
                },
            },
            { $unwind: '$branch' },
            {
                $project: {
                    _id: 0,
                    branchId: '$branch._id',
                    branchName: '$branch.name',
                    totalBranchRequests: 1,
                    branchRequestsApproved: 1,
                    branchRequestsPending: 1,
                },
            },
        ]);

        // Department-wise case count
        const departmentWiseCases = await branchRequestModel.aggregate([
            {
                $lookup: {
                    from: 'employees',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'creatorDetails',
                },
            },
            { $unwind: '$creatorDetails' },
            {
                $group: {
                    _id: '$creatorDetails.departmentId',
                    totalBranchRequests: { $sum: 1 },
                    branchRequestsApproved: {
                        $sum: {
                            $cond: [
                                {
                                    $or: [
                                        { $eq: ['$l1Status', 'approved'] },
                                        { $eq: ['$l2Status', 'approved'] },
                                        { $eq: ['$l3Status', 'approved'] },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    branchRequestsPending: {
                        $sum: {
                            $cond: [
                                {
                                    $or: [
                                        { $eq: ['$l1Status', 'pending'] },
                                        { $eq: ['$l2Status', 'pending'] },
                                        { $eq: ['$l3Status', 'pending'] },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    amountApproved: {
                        $sum: {
                            $cond: [
                                {
                                    $or: [
                                        { $eq: ['$l1Status', 'approved'] },
                                        { $eq: ['$l2Status', 'approved'] },
                                        { $eq: ['$l3Status', 'approved'] },
                                    ],
                                },
                                '$purchaseValue',
                                0,
                            ],
                        },
                    },
                    amountPending: {
                        $sum: {
                            $cond: [
                                {
                                    $or: [
                                        { $eq: ['$l1Status', 'pending'] },
                                        { $eq: ['$l2Status', 'pending'] },
                                        { $eq: ['$l3Status', 'pending'] },
                                    ],
                                },
                                '$purchaseValue',
                                0,
                            ],
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: 'newdepartments', // Department collection name
                    localField: '_id',
                    foreignField: '_id',
                    as: 'department',
                },
            },
            { $unwind: '$department' },
            {
                $project: {
                    _id: 0,
                    departmentId: '$department._id',
                    departmentName: '$department.name',
                    totalBranchRequests: 1,
                    branchRequestsApproved: 1,
                    branchRequestsPending: 1,
                    amountApproved: 1,
                    amountPending: 1,
                },
            },
        ]);

        // Return formatted result
        return returnFormatter(true, 'Branch request stats calculated', {
            overAll: [overAllStats],
            branchWiseCases,
            departmentWiseCases,
        });
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// Get all active branchRequests accessible by the creator or approvers
async function getAllActiveBranchRequestsOfCreator(userId) {
    try {
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const branchRequests = await branchRequestModel.aggregate([
            {
                $match: {
                    isActive: true,
                    $or: [
                        { createdBy: userObjectId },
                        { l1Approver: userObjectId },
                        { l2Approver: userObjectId },
                        { l3Approver: userObjectId },
                    ],
                },
            },
            {
                $addFields: {
                    l1Permitted: { $eq: ["$l1Approver", userObjectId] },
                    l2Permitted: { $eq: ["$l2Approver", userObjectId] },
                    l3Permitted: { $eq: ["$l3Approver", userObjectId] },
                },
            },
            // Lookups
            {
                $lookup: {
                    from: "employees",
                    localField: "l1Approver",
                    foreignField: "_id",
                    as: "l1ApproverDetails",
                },
            },
            {
                $lookup: {
                    from: "employees",
                    localField: "l2Approver",
                    foreignField: "_id",
                    as: "l2ApproverDetails",
                },
            },
            {
                $lookup: {
                    from: "employees",
                    localField: "l3Approver",
                    foreignField: "_id",
                    as: "l3ApproverDetails",
                },
            },
            {
                $lookup: {
                    from: "employees",
                    localField: "createdBy",
                    foreignField: "_id",
                    as: "createdByDetails",
                },
            },

            {
                $lookup: {
                    from: "newbranches",
                    localField: "clusterOffice",
                    foreignField: "_id",
                    as: "clusterOfficeDetail",
                },
            },
            // Unwinds
            {
                $unwind: {
                    path: "$l1ApproverDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: "$l2ApproverDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: "$l3ApproverDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: "$createdByDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },

            {
                $unwind: {
                    path: "$clusterOfficeDetail",
                    preserveNullAndEmptyArrays: true,
                },
            },
            // Project with $ifNull to ensure fields are set to null if missing
            {
                $project: {
                    // branchRequest fields
                    branchRequestId: 1,
                    branchName: 1,
                    ownerName: 1,
                    contact: 1,
                    branchAddress: 1,
                    residentialAddress: 1,
                    accountDetails: 1,
                    brokerAccountDetails:1,
                    pmRent: 1,
                    advanceAmount: 1,
                    rentDate: 1,
                    rentBrokerExpenses: 1,
                    documents: 1,
                    clusterOffice:1,
                    approvalRequired: 1,
                    l1Approver: 1,
                    l1Status: 1,
                    l1Remark: 1,
                    l2Approver: 1,
                    l2Status: 1,
                    l2Remark: 1,
                    l3Approver: 1,
                    l3Status: 1,
                    l3Remark: 1,
                    isActive: 1,
                    createdBy: 1,
                    updatedBy: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    l1Permitted: 1,
                    l2Permitted: 1,
                    l3Permitted: 1,
                    // Flattened approver names with $ifNull
                    l1ApproverName: {
                        $ifNull: ["$l1ApproverDetails.employeName", null],
                    },
                    l2ApproverName: {
                        $ifNull: ["$l2ApproverDetails.employeName", null],
                    },
                    l3ApproverName: {
                        $ifNull: ["$l3ApproverDetails.employeName", null],
                    },
                    clusterOfficeName: { $ifNull: ["$clusterOfficeDetail.name", null] },
                    // Flattened creator name
                    createdByName: {
                        $ifNull: ["$createdByDetails.employeName", null],
                    },
                },
            },
        ]);
        const formConfig = await getFormConfigByName('branchRequest');
        const config = {
            canManage: formConfig.data.managementEmployee == userId ? true : false,
            canAdd: formConfig.data.viewer.includes(userId) ? true : false,
        };

        if (branchRequests.length === 0) {
            return returnFormatter(false, "No active branch requests found");
        }
        return returnFormatter(true, "Active branch requests found", { branchRequests, config });
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// Generate a CSV report of branchRequests based on filters
async function getBranchRequestsReport(filter) {
    try {
        const matchConditions = { isActive: true };

        // Apply branch filter if provided
        if (filter.branchId) {
            matchConditions['createdByDetails.branchId'] = new mongoose.Types.ObjectId(filter.branchId);
        }

        // Apply department filter if provided
        if (filter.departmentId) {
            matchConditions['createdByDetails.departmentId'] = new mongoose.Types.ObjectId(filter.departmentId);
        }

        // Apply status filters if provided
        if (filter.statuses && filter.statuses.length > 0) {
            if (filter.statuses.length === 1 && filter.statuses[0] === 'approved') {
                // If only 'approved' is selected, all levels must be 'approved'
                matchConditions['l1Status'] = 'approved';
                matchConditions['l2Status'] = 'approved';
                matchConditions['l3Status'] = 'approved';
            } else {
                // If 'pending' or 'rejected' is included, any level can match
                matchConditions['$or'] = [
                    { 'l1Status': { $in: filter.statuses } },
                    { 'l2Status': { $in: filter.statuses } },
                    { 'l3Status': { $in: filter.statuses } },
                ];
            }
        }

        let branchRequests = await branchRequestModel.aggregate([
            {
                $lookup: {
                    from: 'employees',
                    localField: 'l1Approver',
                    foreignField: '_id',
                    as: 'l1ApproverDetails',
                },
            },
            {
                $lookup: {
                    from: 'employees',
                    localField: 'l2Approver',
                    foreignField: '_id',
                    as: 'l2ApproverDetails',
                },
            },
            {
                $lookup: {
                    from: 'employees',
                    localField: 'l3Approver',
                    foreignField: '_id',
                    as: 'l3ApproverDetails',
                },
            },
            {
                $lookup: {
                    from: 'employees',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdByDetails',
                },
            },
            {
                $match: matchConditions,
            },
            {
                $unwind: {
                    path: '$l1ApproverDetails',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$l2ApproverDetails',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$l3ApproverDetails',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$createdByDetails',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'newdepartments',
                    localField: 'createdByDetails.departmentId',
                    foreignField: '_id',
                    as: 'department',
                },
            },
            { $unwind: '$department' },
            {
                $lookup: {
                    from: 'newbranches',
                    localField: 'createdByDetails.branchId',
                    foreignField: '_id',
                    as: 'branch',
                },
            },
            { $unwind: '$branch' },
            {
                $project: {
                    _id: 0,
                    branchRequestId: 1,
                    branchName: 1,
                    ownerName: 1,
                    contact: 1,
                    branchAddress: 1,
                    residentialAddress: 1,
                    pmRent: 1,
                    advanceAmount: 1,
                    rentDate: 1,
                    rentBrokerExpenses: 1,
                    l1ApproverName: { $ifNull: ['$l1ApproverDetails.employeName', null] },
                    l1Status: 1,
                    l1Remark: 1,
                    l2ApproverName: { $ifNull: ['$l2ApproverDetails.employeName', null] },
                    l2Status: 1,
                    l2Remark: 1,
                    l3ApproverName: { $ifNull: ['$l3ApproverDetails.employeName', null] },
                    l3Status: 1,
                    l3Remark: 1,
                    createdByName: { $ifNull: ['$createdByDetails.employeName', null] },
                    departmentName: { $ifNull: ['$department.name', null] },
                    branchNameCreator: { $ifNull: ['$branch.name', null] },
                    createdAt: {
                        $dateToString: {
                            format: "%d-%m-%Y",
                            date: "$createdAt",
                            timezone: "Asia/Kolkata"
                        }
                    }
                },
            },
        ]);

        // Add serial numbers to each branchRequest
        branchRequests = branchRequests.map((branchRequest, index) => ({ ...branchRequest, sno: index + 1 }));

        // Define custom fields with labels and values
        const fields = [
            { label: 'S.No.', value: 'sno' },
            { label: 'Branch Request ID', value: 'branchRequestId' },
            { label: 'Branch Name', value: 'branchName' },
            { label: 'Owner Name', value: 'ownerName' },
            { label: 'Contact', value: 'contact' },
            { label: 'Branch Address', value: 'branchAddress' },
            { label: 'Residential Address', value: 'residentialAddress' },
            { label: 'Per Month Rent', value: 'pmRent' },
            { label: 'Advance Amount', value: 'advanceAmount' },
            { label: 'Rent Date', value: 'rentDate' },
            { label: 'Rent Broker Expenses', value: 'rentBrokerExpenses' },
            { label: 'Created By', value: 'createdByName' },
            { label: 'Department', value: 'departmentName' },
            { label: 'Branch', value: 'branchNameCreator' },
            { label: 'L1 Approver', value: 'l1ApproverName' },
            { label: 'L1 Status', value: 'l1Status' },
            { label: 'L1 Remark', value: 'l1Remark' },
            { label: 'L2 Approver', value: 'l2ApproverName' },
            { label: 'L2 Status', value: 'l2Status' },
            { label: 'L2 Remark', value: 'l2Remark' },
            { label: 'L3 Approver', value: 'l3ApproverName' },
            { label: 'L3 Status', value: 'l3Status' },
            { label: 'L3 Remark', value: 'l3Remark' },
            { label: 'Created At', value: 'createdAt' },
        ];
        // Convert branchRequests data to CSV
        const json2csvParser = new CsvParser({ fields });
        const csvData = json2csvParser.parse(branchRequests);
        return returnFormatter(true, "Active branch requests found", csvData);
    } catch (error) {
        console.log(error);
        return returnFormatter(false, error.message);
    }
}

module.exports = {
    addBranchRequest,
    getBranchRequestById,
    updateBranchRequest,
    deactivateBranchRequest,
    getAllActiveBranchRequests,
    getAllActiveBranchRequestsOfCreator,
    getBranchRequestStats,
    getBranchRequestsReport
};
