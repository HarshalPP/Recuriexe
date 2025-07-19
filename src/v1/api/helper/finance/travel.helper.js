const travelDetails = require("../../model/forms/travel.model");
const { returnFormatter } = require("../../formatter/common.formatter");
const employeModel = require("../../model/adminMaster/employe.model");
const { getFormConfigByName } = require("../formConfig.helper")
const CsvParser = require("json2csv").Parser;
const { default: mongoose } = require("mongoose");


// Create a new Travel

async function addTravel(bodyData, userId) {
    try {
        bodyData.createdBy = userId;
        bodyData.updatedBy = userId;
        const formConfig = await getFormConfigByName('travel')
        bodyData.l1Approver = formConfig.data.defaultL1
        bodyData.l2Approver = formConfig.data.defaultL2
        bodyData.l3Approver = formConfig.data.defaultL3
        const saveData = new travelDetails(bodyData);
        await saveData.save()
        return returnFormatter(true, "travel created", saveData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

//  Get a Travel by travelId 

async function getTravelById(travelId) {
    try{

        const travel = await travelDetails.findOne({_id:travelId});
        if(!travel){
            return returnFormatter(false, "Travel not found");
        }

        return returnFormatter(true, "Travel found", travel);

    }catch(error){
        return returnFormatter(false, error.message);
    }
}

// update an travel//

async function updateTravel(travelId, updateData, userId) {
    try{

    updateData.updatedBy = userId;
    const updatetravelPayment = await travelDetails.findOneAndUpdate({travelId}, updateData, {new:true});
    if(!updatetravelPayment){
        return returnFormatter(false, "Travel not found");
    }
    return returnFormatter(true, "Travel updated", updatetravelPayment);

    }catch(error){
        return returnFormatter(false, error.message);
    }
}


// set isActive to false instead of deleting the an travel //

async function deactivateTravel(travelId, userId) {
    try{

        const travel = await travelDetails.findOneAndUpdate({travelId} , {isActive:false}, {new:true});
        if(!travel){
            return returnFormatter(false, "Travel not found");
        }
        return returnFormatter(true, "Travel deactivated", travel);

    }catch(error){
        return returnFormatter(false, error.message);
    }
}

// get all active travels

async function getAllActiveTravels() {
    try{
        const travels = await travelDetails.find({isActive:true})
        .populate({
            path: "travel_along_with",
            select: "employeName"
        })
        .sort({createdAt:-1});
        return returnFormatter(true, "Travels found", travels);
    }catch(error){
        return returnFormatter(false, error.message);
    }
}


// Export all functions

async function getTravelStats() {
    try {
        // Step 1: Fetch travel data with employee details
        const travels = await travelDetails.aggregate([
            {
                $lookup: {
                    from: 'employees', // Collection name for employees
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'creatorDetails',
                },
            },
            { $unwind: '$creatorDetails' },
        ]);

        if (travels.length === 0) {
            return returnFormatter(false, "No travels found");
        }

        // Step 2: Overall statistics calculation
        const overAllStats = travels.reduce(
            (acc, travel) => {


                const isApproved =
                    travel.l1Status === "approved" ||
                    travel.l2Status === "approved" 

                const isPending =
                    travel.l1Status === "pending" ||
                    travel.l2Status === "pending" 

                acc.totalTravels += 1;

                if (isApproved) {
                    acc.approvedTravels += 1;
          
                }

                if (isPending) {
                    acc.pendingTravels += 1;
                }

                if(travel.l3Status === "approved"){
    
                    acc.amountApproved += travel.entries.reduce((acc , entry) => acc + entry.amount, 0);
                }

                if(travel.l3Status === "pending"){
                    acc.amountPending += travel.entries.reduce((acc , entry) => acc + entry.amount, 0);
                }

                return acc;
            },
            {
                totalTravels: 0,
                approvedTravels: 0,
                pendingTravels: 0,
                amountApproved: 0,
                amountPending: 0,
            }
        );

        // Step 3: Branch-Wise Stats
        const branchWiseStats = await travelDetails.aggregate([
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
                    totalTravels: { $sum: 1 },
                    approvedTravels: {
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
                    pendingTravels: {
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
                    amountApproved:{
                        $sum:{
                            $cond:[
                                {
                                    $or:[
                                        { $eq: ['$l1Status', 'approved'] },
                                        { $eq: ['$l2Status', 'approved'] },
                                        { $eq: ['$l3Status', 'approved'] },
                                    ],
                                },
                                '$purchaseValue',
                                0
                            ]
                        }
                    },

                    amountPending:{
                        $sum:{
                            $cond:[
                                {
                                    $or:[
                                        { $eq: ['$l1Status', 'pending'] },
                                        { $eq: ['$l2Status', 'pending'] },
                                        { $eq: ['$l3Status', 'pending'] },
                                    ],
                                },
                                '$purchaseValue',
                                0
                            ]
                        }
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
                    branchId: '$branch._id',
                    branchName: '$branch.name',
                    totalTravels: 1,
                    approvedTravels: 1,
                    pendingTravels: 1,
                    amountApproved: 1,
                    amountPending: 1,
                },
            },
        ]);

        // Step 4: Department-Wise Stats
        const departmentWiseStats = await travelDetails.aggregate([
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
                    totalTravels: { $sum: 1 },
                    approvedTravels: {
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
                    pendingTravels: {
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
                    departmentId: '$department._id',
                    departmentName: '$department.name',
                    totalTravels: 1,
                    approvedTravels: 1,
                    pendingTravels: 1,
                    amountApproved: 1,
                    amountPending: 1,
                },
            },
        ]);

        // Step 5: Return formatted response
        return returnFormatter(true, "Travel stats calculated", {
            overAll: [overAllStats],
            branchWiseStats,
            departmentWiseStats,
        });
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

async function getAllActiveTravelOfCreator(userId) {
    try {
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const travelDetail = await travelDetails.aggregate([
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
            // {
            //     $lookup: {
            //         from: "employees",
            //         localField: "travel_along_with",
            //         foreignField: "_id",
            //         as: "travelAlongWithDetails",
            //     },
            // },

            {
                $lookup: {
                    from: "employees",
                    let: { travelAlongWith: { $ifNull: ["$travel_along_with", []] } }, // Ensure it's an array
                    pipeline: [
                        { $match: { $expr: { $in: ["$_id", "$$travelAlongWith"] } } },
                        { $project: { employeName: 1, _id: 0 } },
                    ],
                    as: "travelAlongWithDetails",
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
                $sort:{
                    createdAt:-1
                }
            },
            // Project with fields
            {
                $project: {
                    travelId: 1,
                    to:1,
                    from:1,
                    start_travel_date: 1,
                    end_travel_date: 1,
                    check:1,
                    purpose_of_travel: 1,
                    travel_mode: 1,
                    entries: 1,
                    Own_car_details:1,
                    public_transport_details:1,   
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
                    createdBy: 1,
                    l1Permitted: 1,
                    l2Permitted: 1,
                    l3Permitted: 1,
                    travelAlongWithDetails: 1,
                    l1ApproverName: { $ifNull: ["$l1ApproverDetails.employeName", null] },
                    l2ApproverName: { $ifNull: ["$l2ApproverDetails.employeName", null] },
                    l3ApproverName: { $ifNull: ["$l3ApproverDetails.employeName", null] },
                    createdByName: { $ifNull: ["$createdByDetails.employeName", null] },
                },
            },
        ]);

        const formConfig = await getFormConfigByName('travel');
        const config = {
            canManage: formConfig.data.managementEmployee == userId,
            canAdd: formConfig.data.viewer.includes(userId),
        };

        if (travelDetail.length === 0) {
            return returnFormatter(false, "No active travel records found");
        }

        return returnFormatter(true, "Active travel records found", { travelDetail, config });
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}


async function getTravelReport(filter) {
    try {
        // const matchConditions = {}; // Initialize an empty object for match conditions
        const matchConditions = await travelDetails.findOne({isActive:true}) // Initialize an empty object for match conditions

        // Filter by date range
        if (filter.startDate && filter.endDate) {
            matchConditions.createdAt = {
                $gte: new Date(filter.startDate),
                $lte: new Date(filter.endDate),
            };
        }

        if (filter.travelMode) {
            matchConditions.travel_mode = filter.travelMode;
        }

        // Filter by approver status
        if (filter.statuses && filter.statuses.length > 0) {
            if (filter.statuses.includes("approved")) {
                matchConditions.l1Status = "approved";
                matchConditions.l2Status = "approved";
                matchConditions.l3Status = "approved";
            } else {
                matchConditions["$or"] = [
                    { l1Status: { $in: filter.statuses } },
                    { l2Status: { $in: filter.statuses } },
                    { l3Status: { $in: filter.statuses } },
                ];
            }
        }

        // Aggregate travel data
        const travelReports = await travelDetails.aggregate([
            { $match: matchConditions }, // First match condition
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
                    localField: "travel_along_with",
                    foreignField: "_id",
                    as: "travelAlongWithDetails",
                },
            },
            {
                $lookup: {
                    from: "employees",
                    localField: "viewer",
                    foreignField: "_id",
                    as: "viewerDetails",
                },
            },
            {
                $project: {
                    travelId: 1,
                    to:1,
                    from:1,
                    check:1,
                    start_travel_date: 1,
                    end_travel_date: 1,
                    purpose_of_travel: 1,
                    travel_mode: 1,
                    entries: 1,
                    Own_car_details:1,
                    public_transport_details:1, 
                    l1Status: 1,
                    l2Status: 1,
                    l3Status: 1,
                    l1Remark: 1,
                    l2Remark: 1,
                    l3Remark: 1,
                    createdBy: { $arrayElemAt: ["$createdByDetails.employeName", 0] },
                    l1Approver: { $arrayElemAt: ["$l1ApproverDetails.employeName", 0] },
                    l2Approver: { $arrayElemAt: ["$l2ApproverDetails.employeName", 0] },
                    l3Approver: { $arrayElemAt: ["$l3ApproverDetails.employeName", 0] },
                    travelAlongWith: "$travelAlongWithDetails.employeName",
                    viewers: "$viewerDetails.employeName",
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

        const formattedReports = travelReports.map((report, index) => ({
            ...report,
            sno: index + 1,
            // Flatten the 'entries' field
            entries: report.entries
                .map((entry) => `Type: ${entry.expense_type}, Amount: ${entry.amount}, Upload: ${entry.upload}`)
                .join("; "), 
            viewers: report.viewers.join(", "),  // Join array into a comma-separated string
            // Correctly flatten 'TravelAlongWith' field
            travelAlongWith: report.travelAlongWith.join(", "),  // Join array into a string
        }));


        const fields = [
            { label: "SNo", value: "sno" },
            { label: "TravelID", value: "travelId" },
            { label: "StartDate", value: "start_travel_date" },
            { label: "EndDate", value: "end_travel_date" },
            { label: "Purpose", value: "purpose_of_travel" },
            { label: "Mode", value: "travel_mode" },
            { label: "L1Approver", value: "l1Approver" },
            { label: "L1Status", value: "l1Status" },
            { label: "L2Approver", value: "l2Approver" },
            { label: "L2Status", value: "l2Status" },
            { label: "L3Approver", value: "l3Approver" },
            { label: "L3Status", value: "l3Status" },
            { label: "CreatedBy", value: "createdBy" },
            { label: "CreatedAt", value: "createdAt" },
            { label: "Expenses", value: "entries" },
            { label: "TravelAlongWith", value: "travelAlongWith" },
            { label: "Viewers", value: "viewers" },
        ];
        
        // Convert reports to CSV
        const json2csvParser = new CsvParser({ fields });
        const csvData = json2csvParser.parse(formattedReports);

        // Convert reports to CSV
        // const csvData = parse(formattedReports, { fields });
        return returnFormatter(true, "Travel report generated", csvData);

    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: error.message,
        };
    }
}

  
    






module.exports = {
    addTravel,
    getTravelById,
    updateTravel,
    deactivateTravel,
    getAllActiveTravels,
    getTravelStats,
    getAllActiveTravelOfCreator,
    getTravelReport
}