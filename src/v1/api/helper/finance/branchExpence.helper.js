const branchExpenceModel = require('../../model/forms/branchExpence.model');
const { returnFormatter } = require("../../formatter/common.formatter");
const employeModel = require("../../model/adminMaster/employe.model");
const { getFormConfigByName } = require("../formConfig.helper")
const CsvParser = require("json2csv").Parser;
const { default: mongoose } = require("mongoose");



// create the branchExpence //

async function addbranchExpence(bodyData , userId){
    try{
        bodyData.createdBy = userId;
        bodyData.updatedBy = userId;
        const formConfig = await getFormConfigByName('branchExpence');
        bodyData.l1Approver = formConfig.data.defaultL1
        bodyData.l2Approver = formConfig.data.defaultL2
        bodyData.l3Approver = formConfig.data.defaultL3
        const saveData = new branchExpenceModel(bodyData);
        await saveData.save();
        return returnFormatter(true, "Data saved successfully" , saveData);
    }catch(error){
     return returnFormatter(false, error.message);
    }
}


// get branchExpence by branchExpenceId //

async function getbranchExpenceById(branchExpenceId){
    try{
       const branchExpenceData = await branchExpenceModel.findOne({branchExpenceId})
       if(!branchExpenceData){
           return returnFormatter(false, "Data not found");
       }
         return returnFormatter(true, "Data found" , branchExpenceData);
    }catch(error){
        return returnFormatter(false, error.message);
    }
}

// Update the branchExpence //

async function updatebranchExpence(branchExpenceId , updateData , userId){
    try{
        updateData.updatedBy = userId;
        const branchExpenceData = await branchExpenceModel.findOneAndUpdate({branchExpenceId} , updateData , {new: true});
        if(!branchExpenceData){
            return returnFormatter(false, "Data not found");
        }
        return returnFormatter(true, "Data updated successfully" , branchExpenceData);
    }
    catch(error){
        return returnFormatter(false, error.message);
    }
}


// Deactivate the branchExpence //

async function deactivebranchExpence(branchExpenceId){
    try{

        const deactivatebranchExpence = await branchExpenceModel.findOneAndUpdate({branchExpenceId} , {isActive: false} , {new: true});
        if(!deactivatebranchExpence){
            return returnFormatter(false, "Data not found");
        }
        return returnFormatter(true, "deactivebranchExpence deactivated successfully" , deactivatebranchExpence);

    }catch(error){
        return returnFormatter(false, error.message);
    }
}


// get all active branchExpence //

async function getAllActivebranchExpence(){
    try{
        const branchExpenceData = await branchExpenceModel.find({isActive: true}).sort({createdAt: -1});
        if(branchExpenceData.length == 0){
            return returnFormatter(false, "No active branchExpence found");
        }
        return returnFormatter(true, "Data found" , branchExpenceData);
    }catch(error){
        return returnFormatter(false, error.message);
    }
}



async function getAllActiveBranchExpencesOfCreator(userId) {
    try {
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const branchExpences = await branchExpenceModel.aggregate([
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
                $sort: { createdAt: -1 },
            },
            // Project with $ifNull to ensure fields are set to null if missing
            {
                $project: {
                    branchExpenceId: 1,
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
                    // Flattened creator name
                    createdByName: {
                        $ifNull: ["$createdByDetails.employeName", null],
                    },
                },
            },
        ]);

        const formConfig = await getFormConfigByName('branchExpence');
        const config = {
            canManage: formConfig.data.managementEmployee == userId ? true : false,
            canAdd: formConfig.data.viewer.includes(userId) ? true : false,
        };

        if (branchExpences.length === 0) {
            return returnFormatter(false, "No active branchExpences found");
        }

        return returnFormatter(true, "Active branchExpences found", { branchExpences, config });
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

async function getBranchExpenceStats() {
    try {
        // Fetch branch expenses with employee details (createdBy)
        const branchExpenceStats = await branchExpenceModel.aggregate([
            {
                $lookup: {
                    from: "employees",
                    localField: "createdBy",
                    foreignField: "_id",
                    as: "creatorDetails"
                }
            },
            { $unwind: '$creatorDetails' }
        ]);

        // Check if no data is returned
        if (branchExpenceStats.length === 0) {
            return returnFormatter(false, "No branchExpence found");
        }

        // Overall stats calculation
        const overAllStats = branchExpenceStats.reduce((acc, branchExpence) => {

            // Check for approval and pending statuses
            const isApproved =
                branchExpence.l1Status === 'approved' ||
                branchExpence.l2Status === 'approved' 

            const isPending =
                branchExpence.l1Status === 'pending' ||
                branchExpence.l2Status === 'pending' 

            acc.totalBranchExpence += 1;

            if (isApproved) {
                acc.branchExpenceApproved += 1;

            }

            if (isPending) {
                acc.branchExpencePending += 1;
            }

            if(branchExpence.l3Status == "approved"){
                acc.amountApproved += branchExpence.entries.reduce((acc, entry) => acc + entry.Amount, 0);
            }

            if(branchExpence.l3Status == "pending"){
                acc.amountPending += branchExpence.entries.reduce((acc, entry) => acc + entry.Amount, 0);
            }

            return acc;
        }, {
            totalBranchExpence: 0,
            branchExpenceApproved: 0,
            branchExpencePending: 0,
            amountApproved: 0,
            amountPending: 0
        });

        // Branch-wise stats calculation
        const branchWiseStats = await branchExpenceModel.aggregate([
            {
                $lookup: {
                    from: "employees",
                    localField: "createdBy",
                    foreignField: "_id",
                    as: "creatorDetails"
                }
            },
            { $unwind: '$creatorDetails' },
            {
                $group: {
                    _id: '$creatorDetails.branchId',  // Group by branchId
                    totalBranchExpence: { $sum: 1 },
                    branchExpenceApproved: {
                        $sum: {
                            $cond: [
                                {
                                    $or: [
                                        { $eq: ['$l1Status', 'approved'] },
                                        { $eq: ['$l2Status', 'approved'] },
                                        { $eq: ['$l3Status', 'approved'] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    branchExpencePending: {
                        $sum: {
                            $cond: [
                                {
                                    $or: [
                                        { $eq: ['$l1Status', 'pending'] },
                                        { $eq: ['$l2Status', 'pending'] },
                                        { $eq: ['$l3Status', 'pending'] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    amountApproved: {
                        $sum: {
                            $cond: [
                                {
                                    $or: [
                                        { $eq: ['$l1Status', 'approved'] },
                                        { $eq: ['$l2Status', 'approved'] },
                                        { $eq: ['$l3Status', 'approved'] }
                                    ]
                                },
                                '$purchaseValue',
                                0
                            ]
                        }
                    },
                    amountPending: {
                        $sum: {
                            $cond: [
                                {
                                    $or: [
                                        { $eq: ['$l1Status', 'pending'] },
                                        { $eq: ['$l2Status', 'pending'] },
                                        { $eq: ['$l3Status', 'pending'] }
                                    ]
                                },
                                '$purchaseValue',
                                0
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'newbranches',  // Join with branch collection
                    localField: '_id',
                    foreignField: '_id',
                    as: 'branch'
                }
            },
            { $unwind: '$branch' },
            {
                $project: {
                    _id: 0,
                    branchId: '$branch._id',
                    branchName: '$branch.name',
                    totalBranchExpence: 1,
                    branchExpenceApproved: 1,
                    branchExpencePending: 1,
                    amountApproved: 1,
                    amountPending: 1
                }
            }
        ]);

        // Return the formatted result
        return returnFormatter(true, 'Branch expense stats calculated', {
            overAll: [overAllStats],
            branchWiseStats
        });
    } catch (error) {
        // Return error message if something goes wrong
        return returnFormatter(false, error.message);
    }
}




module.exports = {
    addbranchExpence,
    getbranchExpenceById,
    updatebranchExpence,
    deactivebranchExpence,
    getAllActivebranchExpence,
    getAllActiveBranchExpencesOfCreator,
    getBranchExpenceStats
}