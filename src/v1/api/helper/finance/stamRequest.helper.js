const stampRequestModel = require('../../model/forms/StampRequest.model');
const { returnFormatter } = require("../../formatter/common.formatter");
const employeModel = require("../../model/adminMaster/employe.model");
const { getFormConfigByName } = require("../formConfig.helper")
const CsvParser = require("json2csv").Parser;
const { default: mongoose } = require("mongoose");


// Create a new StampRequest

async function addStampRequest(bodyData, userId) {
    try {
        bodyData.createdBy = userId;
        bodyData.updatedBy = userId;
        const formConfig = await getFormConfigByName("stampRequest");
        bodyData.l1Approver = formConfig.data.defaultL1
        bodyData.l2Approver = formConfig.data.defaultL2
        bodyData.l3Approver = formConfig.data.defaultL3
        const saveData = new stampRequestModel(bodyData);
        await saveData.save();
        return returnFormatter(true, "StampRequest created", saveData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// get an StampRequest by rmPaymentId

async function getStampRequestById(stampRequestId) {
    try {
        const stampRequest = await stampRequestModel.findOne({stampRequestId});
        if (!stampRequest) {
            return returnFormatter(false, "StampRequest not found");
        }
        return returnFormatter(true, "StampRequest found", stampRequest);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}


// get all StampRequest by vendorId

// async function getStampRequestByVendorId(vendorId) {
//    try{

//    }catch(error){
//        return returnFormatter(false, error.message);
//    }
// }

// Update a StampRequest 

async function updateStampRequest(stampRequestId, updateData, userId) {
   try{
     updateData.updatedBy = userId;
     const updatedStampRequest = await stampRequestModel.findOneAndUpdate({stampRequestId}, updateData, {new: true});
        if(!updatedStampRequest){
            return returnFormatter(false, "StampRequest not found");
        }
        return returnFormatter(true, "StampRequest updated", updatedStampRequest);
   }catch(error){
       return returnFormatter(false, error.message);
   }
    
}


// set isActive to false for a StampRequest


async function deactiveStampRequest(stampRequestId) {
   try{

    const deactivatedStampRequest = await stampRequestModel.findOneAndUpdate({stampRequestId}, {isActive: false}, {new: true});
    if(!deactivatedStampRequest){
        return returnFormatter(false, "StampRequest not found");
    }
    return returnFormatter(true, "StampRequest deactivated", deactivatedStampRequest);

   }catch(error){
       return returnFormatter(false, error.message);
   }
}


// get all active StampRequest

async function getAllActiveStampRequest() {
    try{
        const stampRequest = await stampRequestModel.find({isActive: true});
        if(stampRequest.length === 0){
            return returnFormatter(false, "No active StampRequest found");
        }
        return returnFormatter(true, "Active StampRequest found", stampRequest);
    }

    catch(error){
        return returnFormatter(false, error.message);
    }
}

// get all  stampRequest by vendor // 
async function getStampRequestByVendor(vendorId) {
    try {
        if (!mongoose.Types.ObjectId.isValid(vendorId)) {
            return returnFormatter(false, "Invalid vendor ID");
        }

        const stampRequests = await stampRequestModel.aggregate([
            { $match: { "entries.vendor": mongoose.Types.ObjectId(vendorId) } },
            {
                $lookup: {
                    from: "vendors", 
                    localField: "entries.vendor",
                    foreignField: "_id",
                    as: "vendorDetails",
                },
            },
            {
                $unwind: "$vendorDetails",
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
                $unwind: {
                    path: "$createdByDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    stampRequestId: 1,
                    entries: 1,
                    formConfigId: 1,
                    approvalRequired: 1,
                    l1Status: 1,
                    l2Status: 1,
                    l3Status: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    vendorDetails: { name: 1, contact: 1 }, // Add fields specific to the vendor
                    createdByDetails: { name: 1, email: 1 }, // Add fields specific to the employee
                },
            },
        ]);

        if (!stampRequests.length) {
            return returnFormatter(false, "No StampRequest found for the given vendor");
        }

        return returnFormatter(true, "StampRequests found", stampRequests);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}


// getstampRequest//

async function getStampRequestStats() {
    try {
        // Retrieve all stampRequests with lookup for employee details (creator)
        const stampRequests = await stampRequestModel.aggregate([
            {
                $lookup: {
                    from: 'employees', // Collection name for employees
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'creatorDetails',
                },
            },{
                $unwind: '$creatorDetails'
            },
        ]);


        if (stampRequests.length === 0) {
            return returnFormatter(false, 'No stampRequests found');
        }

        // Overall stats calculations
        const overAllStats = stampRequests.reduce(
            (acc, stampRequest) => {
                // Check each status and increment counters based on approval status
                const isApproved =
                    stampRequest.l1Status === 'approved' ||
                    stampRequest.l2Status === 'approved' ||
                    stampRequest.l3Status === 'approved';
                const isPending =
                    stampRequest.l1Status === 'pending' ||
                    stampRequest.l2Status === 'pending' ||
                    stampRequest.l3Status === 'pending';

                acc.totalStampRequests += 1;
                if (isApproved) {
                    acc.stampRequestsApproved += 1;
                    acc.amountApproved += stampRequest.purchaseValue || 0;
                }
                if (isPending) {
                    acc.stampRequestsPending += 1;
                    acc.amountPending += stampRequest.purchaseValue || 0;
                }
                return acc;
            },
            {
                totalStampRequests: 0,
                stampRequestsApproved: 0,
                stampRequestsPending: 0,
                amountApproved: 0,
                amountPending: 0,
            }
        );

        // Branch-wise stats
        const branchWiseStats = await stampRequestModel.aggregate([
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
                    totalStampRequests: { $sum: 1 },
                    stampRequestsApproved: {
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
                    stampRequestsPending: {
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
                    }
                },
            },
            {
                $lookup: {
                    from: 'newbranches', // Branch collection
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
                    totalStampRequests: 1,
                    stampRequestsApproved: 1,
                    stampRequestsPending: 1,
                    amountApproved: 1,
                    amountPending: 1,
                },
            },
        ]);

        // Department-wise stats
        const departmentWiseStats = await stampRequestModel.aggregate([
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
                    totalStampRequests: { $sum: 1 },
                    stampRequestsApproved: {
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
                    stampRequestsPending: {
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
                    from: 'newdepartments', // Department collection
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
                    totalStampRequests: 1,
                    stampRequestsApproved: 1,
                    stampRequestsPending: 1,
                    amountApproved: 1,
                    amountPending: 1,
                },
            },
        ]);

        // Return formatted result
        return returnFormatter(true, 'StampRequest stats calculated', {
            overAll: [overAllStats],
            branchWiseStats,
            departmentWiseStats,
        });
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}


// get all active StampRequest //

/**
 * 
async function getAllActiveStampRequestsOfCreator(userId) {
    try {
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const stampRequests = await stampRequestModel.aggregate([
            {
                $match: {
                    isActive: true,
                    $or: [
                        { createdBy: userObjectId },
                        { l1Approver: userObjectId },
                        { l2Approver: userObjectId },
                        { l3Approver: userObjectId },
                        { viewer: userObjectId },
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
            // Lookups for related collections
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
                $unwind: {
                    path: "$entries",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "lenders",
                    localField: "entries.lender",
                    foreignField: "_id",
                    as: "lenderDetails",
                },
            },
            {
                $lookup: {
                    from: "vendors",
                    localField: "entries.vendor",
                    foreignField: "_id",
                    as: "vendorDetails",
                },
            },
            // Unwind additional details arrays
            {
                $unwind: {
                    path: "$lenderDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: "$vendorDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
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
            // Group back entries into the original stamp request
            {
                $group: {
                    _id: "$_id",
                    entries: { $push: "$entries" },
                    approvalRequired: { $first: "$approvalRequired" },
                    l1Approver: { $first: "$l1Approver" },
                    l1Status: { $first: "$l1Status" },
                    l1Remark: { $first: "$l1Remark" },
                    l2Approver: { $first: "$l2Approver" },
                    l2Status: { $first: "$l2Status" },
                    l2Remark: { $first: "$l2Remark" },
                    l3Approver: { $first: "$l3Approver" },
                    l3Status: { $first: "$l3Status" },
                    l3Remark: { $first: "$l3Remark" },
                    viewer: { $first: "$viewer" },
                    isActive: { $first: "$isActive" },
                    createdBy: { $first: "$createdBy" },
                    createdAt: { $first: "$createdAt" },
                    updatedAt: { $first: "$updatedAt" },
                    l1Permitted: { $first: "$l1Permitted" },
                    l2Permitted: { $first: "$l2Permitted" },
                    l3Permitted: { $first: "$l3Permitted" },
                    l1ApproverName: { $first: "$l1ApproverDetails.employeName" },
                    l2ApproverName: { $first: "$l2ApproverDetails.employeName" },
                    l3ApproverName: { $first: "$l3ApproverDetails.employeName" },
                    createdByName: { $first: "$createdByDetails.employeName" },
                    lenderNames: { $first: "$lenderDetails.fullName" },
                    vendorNames: { $first: "$vendorDetails.fullName" },
                },
            },
            // Project with formatted output
            {
                $project: {
                    stampRequestId: 1,
                    entries: 1,
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
                    viewer: 1,
                    isActive: 1,
                    createdBy: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    l1Permitted: 1,
                    l2Permitted: 1,
                    l3Permitted: 1,
                    l1ApproverName: 1,
                    l2ApproverName: 1,
                    l3ApproverName: 1,
                    createdByName: 1,
                    lenderNames: 1,
                    vendorNames: 1,
                },
            },
        ]);

        const formConfig = await getFormConfigByName('rmPayment');
        const config = {
            canManage: formConfig.data.managementEmployee == userId ? true : false,
            canAdd: formConfig.data.viewer.includes(userId) ? true : false,
        };

        if (stampRequests.length === 0) {
            return returnFormatter(false, "No active stamp requests found");
        }

        return returnFormatter(true, "Active stamp requests found", { stampRequests, config });
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

 */

async function getAllActiveStampRequestsOfCreator(userId) {
    try {
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const stampRequests = await stampRequestModel.aggregate([
            {
                $match: {
                    isActive: true,
                    $or: [
                        { createdBy: userObjectId },
                        { l1Approver: userObjectId },
                        { l2Approver: userObjectId },
                        { l3Approver: userObjectId },
                        { viewer: userObjectId },
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
            // Lookups for related collections
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
                    from: "lenders",
                    localField: "entries.lender",
                    foreignField: "_id",
                    as: "lenderDetails",
                },
            },
            {
                $lookup: {
                    from: "vendors",
                    localField: "entries.vendor",
                    foreignField: "_id",
                    as: "vendorDetails",
                },
            },
            // Unwind arrays
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
                    path: "$lenderDetails",
                    preserveNullAndEmptyArrays: true,
                }
            },{

                $unwind: {
                    path: "$vendorDetails",
                    preserveNullAndEmptyArrays: true,
                }

            },

            // len
            // Project with formatted output
            {
                $project: {
                    stampRequestId: 1,
                    entries: 1,
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
                    viewer: 1,
                    isActive: 1,
                    createdBy: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    l1Permitted: 1,
                    l2Permitted: 1,
                    l3Permitted: 1,
                    l1ApproverName: { $ifNull: ["$l1ApproverDetails.employeName", null] },
                    l2ApproverName: { $ifNull: ["$l2ApproverDetails.employeName", null] },
                    l3ApproverName: { $ifNull: ["$l3ApproverDetails.employeName", null] },
                    createdByName: { $ifNull: ["$createdByDetails.employeName", null] },
                    lenderNames: "$lenderDetails.fullName",
                    vendorNames: "$vendorDetails.fullName",
                },
            },
        ]);


        const formConfig = await getFormConfigByName('rmPayment')
        console.log(formConfig.data.managementEmployee == userId);
        console.log(userObjectId);

        const config = {
            canManage: formConfig.data.managementEmployee == userId ? true : false,
            canAdd: formConfig.data.viewer.includes(userId) ? true : false
        }


        if (stampRequests.length === 0) {
            return returnFormatter(false, "No active stamp requests found");
        }

        return returnFormatter(true, "Active stamp requests found", { stampRequests, config });
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// Generate a CSV report of branchRequests based on filters
async function getstampRequestReport(filter) {
    try {
        const matchConditions = { isActive: true };

        if (filter.lenderId) {
            matchConditions['entries.lender'] = new mongoose.Types.ObjectId(filter.lenderId);
        }

        if (filter.vendorId) {
            matchConditions['entries.vendor'] = new mongoose.Types.ObjectId(filter.vendorId);
        }

      
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

        let stampRequests = await stampRequestModel.aggregate([
            {
                $unwind: {
                    path: '$entries',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'lenders',
                    localField: 'entries.lender',
                    foreignField: '_id',
                    as: 'lenderDetails',
                },
            },
            {
                $lookup: {
                    from: 'vendors',
                    localField: 'entries.vendor',
                    foreignField: '_id',
                    as: 'vendorDetails',
                },
            },
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
                $project: {
                    _id: 0,
                    stampRequestId: 1,
                    lenderName: { $ifNull: ['$lenderDetails.fullName', null] },
                    vendorName: { $ifNull: ['$vendorDetails.fullName', null] },
                    ldNo: '$entries.ldNo',
                    Denominatior: '$entries.Denominatior',
                    Quantity: '$entries.Quantity',
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
                    createdAt: {
                        $dateToString: {
                            format: "%d-%m-%Y",
                            date: "$createdAt",
                            timezone: "Asia/Kolkata",
                        },
                    },
                },
            },
        ]);
        console.log("stamp" , stampRequests);

        // Add serial numbers to each stampRequest
        stampRequests = stampRequests.map((stampRequest, index) => ({ ...stampRequest, sno: index + 1 }));

        // Define custom fields with labels and values
        const fields = [
            { label: 'S.No.', value: 'sno' },
            { label: 'Stamp Request ID', value: 'stampRequestId' },
            { label: 'Lender Name', value: 'lenderName' },
            { label: 'Vendor Name', value: 'vendorName' },
            { label: 'LD No.', value: 'ldNo' },
            { label: 'Denominator', value: 'Denominatior' },
            { label: 'Quantity', value: 'Quantity' },
            { label: 'L1 Approver', value: 'l1ApproverName' },
            { label: 'L1 Status', value: 'l1Status' },
            { label: 'L1 Remark', value: 'l1Remark' },
            { label: 'L2 Approver', value: 'l2ApproverName' },
            { label: 'L2 Status', value: 'l2Status' },
            { label: 'L2 Remark', value: 'l2Remark' },
            { label: 'L3 Approver', value: 'l3ApproverName' },
            { label: 'L3 Status', value: 'l3Status' },
            { label: 'L3 Remark', value: 'l3Remark' },
            { label: 'Created By', value: 'createdByName' },
            { label: 'Created At', value: 'createdAt' },
        ];

        // Convert stampRequests data to CSV
        const json2csvParser = new CsvParser({ fields });
        const csvData = json2csvParser.parse(stampRequests);
        return returnFormatter(true, 'Stamp requests found', csvData);
    } catch (error) {
        console.log(error);
        return returnFormatter(false, error.message);
    }
}








 


module.exports = {addStampRequest , getStampRequestById , updateStampRequest , deactiveStampRequest , getStampRequestByVendor , getAllActiveStampRequest , getStampRequestStats , getAllActiveStampRequestsOfCreator , getstampRequestReport};