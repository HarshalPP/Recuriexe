const assetModel = require("../../model/forms/asset.model");
const { returnFormatter } = require("../../formatter/common.formatter");
const employeModel = require("../../model/adminMaster/employe.model");
const { getFormConfigByName } = require("../formConfig.helper")
const CsvParser = require("json2csv").Parser;
const { default: mongoose } = require("mongoose");

// Create a new Asset
async function addAsset(bodyData, userId) {
    try {
        bodyData.createdBy = userId;
        bodyData.updatedBy = userId;
        const formConfig = await getFormConfigByName('asset')
        bodyData.l1Approver = formConfig.data.defaultL1
        bodyData.l2Approver = formConfig.data.defaultL2
        bodyData.l3Approver = formConfig.data.defaultL3
        const saveData = new assetModel(bodyData);
        await saveData.save()
        return returnFormatter(true, "Asset created", saveData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// Get an Asset by assetId
async function getAssetById(assetId) {
    try {
        const asset = await assetModel.findOne({ assetId });
        if (!asset) {
            return returnFormatter(false, "Asset not found");
        }
        return returnFormatter(true, "Asset found", asset);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// Get all assets by vendor
async function getAssetsByVendor(vendor) {
    try {
        const assets = await assetModel.find({ vendor });
        if (assets.length === 0) {
            return returnFormatter(false, "No assets found for the vendor");
        }
        return returnFormatter(true, "Assets found", assets);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// Update an Asset
async function updateAsset(assetId, updateData, userId) {
    try {
        updateData.updatedBy = userId;
        const updatedAsset = await assetModel.findOneAndUpdate(
            { assetId },
            updateData,
            { new: true }
        );
        if (!updatedAsset) {
            return returnFormatter(false, "Asset not found");
        }
        return returnFormatter(true, "Asset updated", updatedAsset);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// Set isActive to false instead of deleting an Asset
async function deactivateAsset(assetId) {
    try {
        const deactivatedAsset = await assetModel.findOneAndUpdate(
            { assetId },
            { isActive: false },
            { new: true }
        );
        if (!deactivatedAsset) {
            return returnFormatter(false, "Asset not found");
        }
        return returnFormatter(true, "Asset deactivated", deactivatedAsset);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// Get all active Assets
async function getAllActiveAssets() {
    try {
        const assets = await assetModel.find({ isActive: true });
        if (assets.length === 0) {
            return returnFormatter(false, "No active assets found");
        }
        return returnFormatter(true, "Active assets found", assets);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

async function getAssetStats() {
    try {
        // Retrieve all assets with lookup for employee details (creator)
        const assets = await assetModel.aggregate([
            {
                $lookup: {
                    from: 'employees', // Collection name should be 'employees'
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'creatorDetails',
                },
            },
            { $unwind: '$creatorDetails' },
        ]);

        if (assets.length === 0) {
            return returnFormatter(false, 'No assets found');
        }

        // Overall stats calculations
        const overAllStats = assets.reduce(
            (acc, asset) => {
                // Check each status and increment counters based on approval status
                const isApproved =
                    asset.l1Status === 'approved' ||
                    asset.l2Status === 'approved' ||
                    asset.l3Status === 'approved';
                const isPending =
                    asset.l1Status === 'pending' ||
                    asset.l2Status === 'pending' ||
                    asset.l3Status === 'pending';

                acc.totalAssets += 1;
                if (isApproved) {
                    acc.assetsApproved += 1;
                    acc.amountApproved += asset.purchaseValue;
                }
                if (isPending) {
                    acc.assetsPending += 1;
                    acc.amountPending += asset.purchaseValue;
                }
                return acc;
            },
            {
                totalAssets: 0,
                assetsApproved: 0,
                assetsPending: 0,
                amountApproved: 0,
                amountPending: 0,
            }
        );

        // Branch-wise case count with amount approved and amount pending
        const branchWiseCases = await assetModel.aggregate([
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
                    totalAssets: { $sum: 1 },
                    assetsApproved: {
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
                    assetsPending: {
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
                    totalAssets: 1,
                    assetsApproved: 1,
                    assetsPending: 1,
                    amountApproved: 1,
                    amountPending: 1,
                },
            },
        ]);

        // Department-wise case count with amount approved and amount pending
        const departmentWiseCases = await assetModel.aggregate([
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
                    totalAssets: { $sum: 1 },
                    assetsApproved: {
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
                    assetsPending: {
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
                    totalAssets: 1,
                    assetsApproved: 1,
                    assetsPending: 1,
                    amountApproved: 1,
                    amountPending: 1,
                },
            },
        ]);

        // Return formatted result
        return returnFormatter(true, 'Assets stats calculated', {
            overAll: [overAllStats],
            branchWiseCases,
            departmentWiseCases,
        });
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

async function getAllActiveAssetsOfCreator(userId) {
    try {
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const assets = await assetModel.aggregate([
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
            // Lookups
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
            // Unwinds
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
                $sort: { createdAt: -1 },
              },
              
            // Project with $ifNull to ensure fields are set to null if missing
            {
                $project: {
                    // Asset fields
                    assetName: 1,
                    purchaseValue: 1,
                    paymentDetail: 1,
                    invoice: 1,
                    vendor: 1,
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
                    updatedBy: 1,
                    assetId: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    l1Permitted: 1,
                    l2Permitted: 1,
                    l3Permitted: 1,
                    // Flattened approver names with $ifNull
                    l1ApproverName: { $ifNull: ['$l1ApproverDetails.employeName', null] },
                    l2ApproverName: { $ifNull: ['$l2ApproverDetails.employeName', null] },
                    l3ApproverName: { $ifNull: ['$l3ApproverDetails.employeName', null] },
                    // Flattened creator name
                    createdByName: { $ifNull: ['$createdByDetails.employeName', null] },
                },
            },
        ]);
        const formConfig = await getFormConfigByName('asset')
        console.log(formConfig.data.managementEmployee == userId);
        console.log(userObjectId);

        const config = {
            canManage: formConfig.data.managementEmployee == userId ? true : false,
            canAdd: formConfig.data.viewer.includes(userId) ? true : false
        }

        if (assets.length === 0) {
            return returnFormatter(false, "No active assets found");
        }
        return returnFormatter(true, "Active assets found", { assets, config });
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

async function getAssetsReportReport(filter) {
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


        let assets = await assetModel.aggregate([

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
                    assetName: 1,
                    purchaseValue: 1,
                    paymentDetail: 1,
                    invoice: 1,
                    vendor: 1,
                    createdByName: { $ifNull: ['$createdByDetails.employeName', null] },
                    departmentName: { $ifNull: ['$department.name', null] },
                    branchName: { $ifNull: ['$branch.name', null] },
                    l1ApproverName: { $ifNull: ['$l1ApproverDetails.employeName', null] },
                    l1Status: 1,
                    l1Remark: 1,
                    l2ApproverName: { $ifNull: ['$l2ApproverDetails.employeName', null] },
                    l2Status: 1,
                    l2Remark: 1,
                    l3ApproverName: { $ifNull: ['$l3ApproverDetails.employeName', null] },
                    l3Status: 1,
                    l3Remark: 1,
                    assetId: 1,
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
        // if (assets.length === 0) {
        //     return returnFormatter(false, "No active assets found");
        // }

        // Add serial numbers to each asset
        assets = assets.map((asset, index) => ({ ...asset, sno: index + 1 }));

        // Define custom fields with labels and values
        const fields = [
            { label: 'S.No.', value: 'sno' },
            { label: 'Asset ID', value: 'assetId' },
            { label: 'Asset Name', value: 'assetName' },
            { label: 'Purchase Value', value: 'purchaseValue' },
            { label: 'Payment Detail', value: 'paymentDetail' },
            { label: 'Invoice', value: 'invoice' },
            { label: 'Vendor', value: 'vendor' },
            { label: 'Created By', value: 'createdByName' },
            { label: 'Department', value: 'departmentName' },
            { label: 'Branch', value: 'branchName' },
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
        // Convert assets data to CSV
        const json2csvParser = new CsvParser({ fields });
        const csvData = json2csvParser.parse(assets);
        return returnFormatter(true, "Active assets found", csvData);
    } catch (error) {
        console.log(error);

        return returnFormatter(false, error.message);
    }
}

module.exports = {
    addAsset,
    getAssetById,
    getAssetsByVendor,
    updateAsset,
    deactivateAsset,
    getAllActiveAssets,
    getAllActiveAssetsOfCreator,
    getAssetStats,
    getAssetsReportReport
};
