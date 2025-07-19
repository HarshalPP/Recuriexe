const rmPaymentModel = require("../../model/forms/rmPayment.model");
const { returnFormatter } = require("../../formatter/common.formatter");
const employeModel = require("../../model/adminMaster/employe.model");
const { getFormConfigByName } = require("../formConfig.helper")
const CsvParser = require("json2csv").Parser;
const { default: mongoose } = require("mongoose");

// Create a new rmPayment
async function addRmPayment(bodyData, userId) {
    try {
        bodyData.createdBy = userId;
        bodyData.updatedBy = userId;
        const formConfig = await getFormConfigByName('rmPayment')
        bodyData.l1Approver = formConfig.data.defaultL1
        bodyData.l2Approver = formConfig.data.defaultL2
        bodyData.l3Approver = formConfig.data.defaultL3
        const saveData = new rmPaymentModel(bodyData);
        await saveData.save()
        return returnFormatter(true, "FileCharge created", saveData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// Get an rmPayment by rmPaymentId
async function getrmPaymentById(rmPaymentId) {
    try {
        const rmPayment = await rmPaymentModel.findOne({ rmPaymentId });
        if (!rmPayment) {
            return returnFormatter(false, "FileCharge not found");
        }
        return returnFormatter(true, "FileCharge found", rmPayment);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// Get all rmPayments by vendor
async function getrmPaymentsByVendor(vendor) {
    try {
        const rmPayments = await rmPaymentModel.find({ vendor });
        if (rmPayments.length === 0) {
            return returnFormatter(false, "No FileCharge found for the vendor");
        }
        return returnFormatter(true, "FileCharge found", rmPayments);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// Update an rmPayment
async function updatermPayment(rmPaymentId, updateData, userId) {

    try {
        updateData.updatedBy = userId;
        const updatedrmPayment = await rmPaymentModel.findOneAndUpdate(
            { rmPaymentId },
            { $set: updateData },
            { new: true }
        );

        if (!updatedrmPayment) {
            return returnFormatter(false, "FileCharge not found");
        }
        return returnFormatter(true, "FileCharge updated", updatedrmPayment);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// Set isActive to false instead of deleting an rmPayment
async function deactivatermPayment(rmPaymentId) {
    try {
        const deactivatedrmPayment = await rmPaymentModel.findOneAndUpdate(
            { rmPaymentId },
            { isActive: false },
            { new: true }
        );
        if (!deactivatedrmPayment) {
            return returnFormatter(false, "FileCharge not found");
        }
        return returnFormatter(true, "FileCharge deactivated", deactivatedrmPayment);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// Get all active rmPayments
async function getAllActivermPayments() {
    try {
        const rmPayments = await rmPaymentModel.find({ isActive: true });
        if (rmPayments.length === 0) {
            return returnFormatter(false, "No active FileCharge found");
        }
        return returnFormatter(true, "Active FileCharge found", rmPayments);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// async function getrmPaymentStats() {
//     try {
//         // Retrieve all rmPayments with lookup for employee details (creator)
//         const rmPayments = await rmPaymentModel.aggregate([
//             {
//                 $lookup: {
//                     from: 'employees', // Collection name should be 'employees'
//                     localField: 'createdBy',
//                     foreignField: '_id',
//                     as: 'creatorDetails',
//                 },
//             },
//             { $unwind: '$creatorDetails' },
//         ]);

//         if (rmPayments.length === 0) {
//             return returnFormatter(false, 'No rmPayments found');
//         }

//         // Overall stats calculations
//         const overAllStats = rmPayments.reduce(
//             (acc, rmPayment) => {
//                 // Check each status and increment counters based on approval status
//                 const isApproved =
//                     rmPayment.l1Status === 'approved' ||
//                     rmPayment.l2Status === 'approved' ||
//                     rmPayment.l3Status === 'approved';
//                 const isPending =
//                     rmPayment.l1Status === 'pending' ||
//                     rmPayment.l2Status === 'pending' ||
//                     rmPayment.l3Status === 'pending';

//                 acc.totalrmPayments += 1;
//                 if (isApproved) {
//                     acc.rmPaymentsApproved += 1;
//                     acc.amountApproved += rmPayment.purchaseValue || 0;
//                 }
//                 if (isPending) {
//                     acc.rmPaymentsPending += 1;
//                     acc.amountPending += rmPayment.purchaseValue || 0;
//                 }
//                 return acc;
//             },
//             {
//                 totalrmPayments: 0,
//                 rmPaymentsApproved: 0,
//                 rmPaymentsPending: 0,
//                 amountApproved: 0,
//                 amountPending: 0,
//             }
//         );

//         // Branch-wise case count with amount approved and amount pending
//         const branchWiseCases = await rmPaymentModel.aggregate([
//             {
//                 $lookup: {
//                     from: 'employees',
//                     localField: 'createdBy',
//                     foreignField: '_id',
//                     as: 'creatorDetails',
//                 },
//             },
//             { $unwind: '$creatorDetails' },
//             {
//                 $group: {
//                     _id: '$creatorDetails.branchId',
//                     totalrmPayments: { $sum: 1 },
//                     rmPaymentsApproved: {
//                         $sum: {
//                             $cond: [
//                                 {
//                                     $or: [
//                                         { $eq: ['$l1Status', 'approved'] },
//                                         { $eq: ['$l2Status', 'approved'] },
//                                         { $eq: ['$l3Status', 'approved'] },
//                                     ],
//                                 },
//                                 1,
//                                 0,
//                             ],
//                         },
//                     },
//                     rmPaymentsPending: {
//                         $sum: {
//                             $cond: [
//                                 {
//                                     $or: [
//                                         { $eq: ['$l1Status', 'pending'] },
//                                         { $eq: ['$l2Status', 'pending'] },
//                                         { $eq: ['$l3Status', 'pending'] },
//                                     ],
//                                 },
//                                 1,
//                                 0,
//                             ],
//                         },
//                     },
//                     amountApproved: {
//                         $sum: {
//                             $cond: [
//                                 {
//                                     $or: [
//                                         { $eq: ['$l1Status', 'approved'] },
//                                         { $eq: ['$l2Status', 'approved'] },
//                                         { $eq: ['$l3Status', 'approved'] },
//                                     ],
//                                 },
//                                 '$purchaseValue',
//                                 0,
//                             ],
//                         },
//                     },
//                     amountPending: {
//                         $sum: {
//                             $cond: [
//                                 {
//                                     $or: [
//                                         { $eq: ['$l1Status', 'pending'] },
//                                         { $eq: ['$l2Status', 'pending'] },
//                                         { $eq: ['$l3Status', 'pending'] },
//                                     ],
//                                 },
//                                 '$purchaseValue',
//                                 0,
//                             ],
//                         },
//                     },
//                 },
//             },
//             {
//                 $lookup: {
//                     from: 'newbranches', // Branch collection name
//                     localField: '_id',
//                     foreignField: '_id',
//                     as: 'branch',
//                 },
//             },
//             { $unwind: '$branch' },
//             {
//                 $project: {
//                     _id: 0,
//                     branchId: '$branch._id',
//                     branchName: '$branch.name',
//                     totalrmPayments: 1,
//                     rmPaymentsApproved: 1,
//                     rmPaymentsPending: 1,
//                     amountApproved: 1,
//                     amountPending: 1,
//                 },
//             },
//         ]);

//         // Department-wise case count with amount approved and amount pending
//         const departmentWiseCases = await rmPaymentModel.aggregate([
//             {
//                 $lookup: {
//                     from: 'employees',
//                     localField: 'createdBy',
//                     foreignField: '_id',
//                     as: 'creatorDetails',
//                 },
//             },
//             { $unwind: '$creatorDetails' },
//             {
//                 $group: {
//                     _id: '$creatorDetails.departmentId',
//                     totalrmPayments: { $sum: 1 },
//                     rmPaymentsApproved: {
//                         $sum: {
//                             $cond: [
//                                 {
//                                     $or: [
//                                         { $eq: ['$l1Status', 'approved'] },
//                                         { $eq: ['$l2Status', 'approved'] },
//                                         { $eq: ['$l3Status', 'approved'] },
//                                     ],
//                                 },
//                                 1,
//                                 0,
//                             ],
//                         },
//                     },
//                     rmPaymentsPending: {
//                         $sum: {
//                             $cond: [
//                                 {
//                                     $or: [
//                                         { $eq: ['$l1Status', 'pending'] },
//                                         { $eq: ['$l2Status', 'pending'] },
//                                         { $eq: ['$l3Status', 'pending'] },
//                                     ],
//                                 },
//                                 1,
//                                 0,
//                             ],
//                         },
//                     },
//                     amountApproved: {
//                         $sum: {
//                             $cond: [
//                                 {
//                                     $or: [
//                                         { $eq: ['$l1Status', 'approved'] },
//                                         { $eq: ['$l2Status', 'approved'] },
//                                         { $eq: ['$l3Status', 'approved'] },
//                                     ],
//                                 },
//                                 '$purchaseValue',
//                                 0,
//                             ],
//                         },
//                     },
//                     amountPending: {
//                         $sum: {
//                             $cond: [
//                                 {
//                                     $or: [
//                                         { $eq: ['$l1Status', 'pending'] },
//                                         { $eq: ['$l2Status', 'pending'] },
//                                         { $eq: ['$l3Status', 'pending'] },
//                                     ],
//                                 },
//                                 '$purchaseValue',
//                                 0,
//                             ],
//                         },
//                     },
//                 },
//             },
//             {
//                 $lookup: {
//                     from: 'newdepartments', // Department collection name
//                     localField: '_id',
//                     foreignField: '_id',
//                     as: 'department',
//                 },
//             },
//             { $unwind: '$department' },
//             {
//                 $project: {
//                     _id: 0,
//                     departmentId: '$department._id',
//                     departmentName: '$department.name',
//                     totalrmPayments: 1,
//                     rmPaymentsApproved: 1,
//                     rmPaymentsPending: 1,
//                     amountApproved: 1,
//                     amountPending: 1,
//                 },
//             },
//         ]);

//         // Return formatted result
//         return returnFormatter(true, 'rmPayments stats calculated', {
//             overAll: [overAllStats],
//             branchWiseCases,
//             departmentWiseCases,
//         });
//     } catch (error) {
//         return returnFormatter(false, error.message);
//     }
// }


// changed //

async function getrmPaymentStats() {
    try {
        // Retrieve all rmPayments with lookup for employee details (creator)
        const rmPayments = await rmPaymentModel.aggregate([

            {
                $match:{
                    isActive:true
                }
            },


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


        if (rmPayments.length === 0) {
            return returnFormatter(false, 'No rmPayments found');
        }

        // Overall stats calculations
        const overAllStats = rmPayments.reduce(
            (acc, rmPayment) => {


                // Check each status and increment counters based on approval status
                const isApproved =
                    rmPayment.l1Status == 'approved' ||
                    rmPayment.l2Status == 'approved' 
                const isPending =
                    rmPayment.l1Status == 'pending' ||
                    rmPayment.l2Status == 'pending' 

                acc.totalrmPayments += 1;
                if (isApproved) {
                    acc.rmPaymentsApproved += 1;
                }
                if (isPending) {
                    acc.rmPaymentsPending += 1;
                }

                if(rmPayment.l3Status == 'approved' ){
                    acc.amountApproved += rmPayment.entries.reduce((acc, entry) => acc + entry.loan_amount, 0);

                }

                if(rmPayment.l3Status == 'pending'){
                    acc.amountPending += rmPayment.entries.reduce((acc, entry) => acc + entry.loan_amount, 0);

                }


                return acc;
            },
            {
                totalrmPayments: 0,
                rmPaymentsApproved: 0,
                rmPaymentsPending: 0,
                amountApproved: 0,
                amountPending: 0,

            }
        );

        // Branch-wise case count with amount approved and amount pending
        const branchWiseCases = await rmPaymentModel.aggregate([
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
                    totalrmPayments: { $sum: 1 },
                    rmPaymentsApproved: {
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
                    rmPaymentsPending: {
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
                    totalrmPayments: 1,
                    rmPaymentsApproved: 1,
                    rmPaymentsPending: 1,
                    amountApproved: 1,
                    amountPending: 1,
                },
            },
        ]);

        // Department-wise case count with amount approved and amount pending
        const departmentWiseCases = await rmPaymentModel.aggregate([
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
                    totalrmPayments: { $sum: 1 },
                    rmPaymentsApproved: {
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
                    rmPaymentsPending: {
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
                    totalrmPayments: 1,
                    rmPaymentsApproved: 1,
                    rmPaymentsPending: 1,
                    amountApproved: 1,
                    amountPending: 1,
                },
            },
        ]);

        // Return formatted result
        return returnFormatter(true, 'FileCharge stats calculated', {
            overAll: [overAllStats],
            branchWiseCases,
            departmentWiseCases,
        });
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

async function getAllActivermPaymentsOfCreator(userId) {
    try {
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const rmPayments = await rmPaymentModel.aggregate([
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
              localField: "lender",
              foreignField: "_id",
              as: "lenderDetail",
            },
          },
          {
            $lookup: {
              from: "vendors",
              localField: "vendor",
              foreignField: "_id",
              as: "vendorDetail",
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
              path: "$lenderDetail",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $unwind: {
              path: "$vendorDetail",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $sort: { createdAt: -1 },
          },
          // Project with $ifNull to ensure fields are set to null if missing
          {
            $project: {
              // rmPayment fields
              rmPaymentName: 1,
              rmPaymentId: 1,
              claimType: 1,
              entries: 1,
              purchaseValue: 1,
              paymentDetail: 1,
              invoice: 1,
              vendor: 1,
              lender: 1,
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
              rmPaymentId: 1,
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
              lenderName: { $ifNull: ["$lenderDetail.fullName", null] },
              vendorName: { $ifNull: ["$vendorDetail.fullName", null] },
              // Flattened creator name
              createdByName: {
                $ifNull: ["$createdByDetails.employeName", null],
              },
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

        if (rmPayments.length === 0) {
            return returnFormatter(false, "No active rmPayments found");
        }
        return returnFormatter(true, "Active rmPayments found", { rmPayments, config });
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

async function getrmPaymentsReportReport(filter) {
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


        let rmPayments = await rmPaymentModel.aggregate([

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
                    rmPaymentName: 1,
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
                    rmPaymentId: 1,
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
        // if (rmPayments.length === 0) {
        //     return returnFormatter(false, "No active rmPayments found");
        // }

        // Add serial numbers to each rmPayment
        rmPayments = rmPayments.map((rmPayment, index) => ({ ...rmPayment, sno: index + 1 }));

        // Define custom fields with labels and values
        const fields = [
            { label: 'S.No.', value: 'sno' },
            { label: 'rmPayment ID', value: 'rmPaymentId' },
            { label: 'rmPayment Name', value: 'rmPaymentName' },
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
        // Convert rmPayments data to CSV
        const json2csvParser = new CsvParser({ fields });
        const csvData = json2csvParser.parse(rmPayments);
        return returnFormatter(true, "Active rmPayments found", csvData);
    } catch (error) {
        console.log(error);

        return returnFormatter(false, error.message);
    }
}

module.exports = {
    addRmPayment,
    getrmPaymentById,
    getrmPaymentsByVendor,
    updatermPayment,
    deactivatermPayment,
    getAllActivermPayments,
    getAllActivermPaymentsOfCreator,
    getrmPaymentStats,
    getrmPaymentsReportReport
};
