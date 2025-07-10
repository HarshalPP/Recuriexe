import { initFileFormmater } from "../formatters/initFormatter/init.formatter.js";
import companyModel from "../models/companyModel/company.model.js";
import initModel from "../models/initModel/init.model.js";
import { returnFormatter } from "../formatters/common.formatter.js"; // assuming this exists
import mongoose from "mongoose";
import partnerRequestModel from "../models/partnerRequestModel/partnerRequest.model.js";
import jobModel from "../models/jobModel/job.model.js"
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url'; // if you're using ES modules
import { dirname } from 'path';      // if you're using ES modules
import { getAllInitFields } from "./initFields.helper.js";
import { addVariableAuto } from "./variable.helper.js";
import roleModel from "../models/RoleModel/role.model.js";

// --------------------- Add Init -----------------------

export async function addInit(requestsObject) {
    try {

        const formattedData = initFileFormmater(requestsObject);
        
        
        let requestData = await partnerRequestModel.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: new mongoose.Types.ObjectId(formattedData.partnerId), receiverId: new mongoose.Types.ObjectId(requestsObject.employee.organizationId) },
                        { senderId: new mongoose.Types.ObjectId(requestsObject.employee.organizationId), receiverId: new mongoose.Types.ObjectId(formattedData.partnerId) }
                    ]
                }
            }])

        const newInitData = await initModel.create({
            ...formattedData,
            organizationId: new mongoose.Types.ObjectId(requestsObject.employee.organizationId),
            doneBy: new mongoose.Types.ObjectId(requestsObject.employee.id),
            allocatedOfficeEmp: requestData[0].allocationId[0]
        });
        return returnFormatter(true, "Init created successfully", newInitData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// --------------------- Update Init by ID -----------------------

export async function updateInitById(initId, updateData) {
    try {

        const existingInit = await initModel.findById(initId);
        if (!existingInit) {
            return returnFormatter(false, "No Init entry found");
        }

        const formattedData = initFileFormmater(updateData);
        const diffInMs = new Date() - existingInit.createdAt;
        const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24)); // Round up to full days

        const updatedInitData = await initModel.findByIdAndUpdate(
            initId,
            { ...formattedData, reportTAT: diffInDays }, // Just the number
            { new: true }
        );

        return returnFormatter(true, "Init updated successfully", updatedInitData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}


// --------------------- allocate Init by ID -----------------------

export async function allocateInitById(reqObj) {
    try {
        const updatedInitDataArray = await Promise.all(
            reqObj.body.initId.map(async (id) => {
                return await initModel.findByIdAndUpdate(
                    id,
                    { allocatedEmp: reqObj.body.allocatedEmp, allocatedDate: new Date() },
                    { new: true }
                );
            })
        );

        return returnFormatter(true, "Init allocated successfully");
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}


// --------------------- Get Init by ID -----------------------

export async function getInitById(initId) {
    try {
        const initData = await initModel.findById(initId);
        return returnFormatter(true, "Init data retrieved", initData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}


// ------------------------------------ get all ad cases by filter --------------------
export async function getAlladdCases(reqObj) {
    try {
        const { status, partnerId, dateRange, startDate, endDate } = reqObj.query || {};
        const serviceId = new mongoose.Types.ObjectId(reqObj.user.serviceId);

        const query = { serviceId };

        // Add partnerId if provided
        if (partnerId) {
            query.partnerId = partnerId;
        }

        // Handle date range filtering
        if (dateRange) {
            const now = new Date();
            const todayStart = new Date(now.setHours(0, 0, 0, 0));
            const todayEnd = new Date(now.setHours(23, 59, 59, 999));

            if (dateRange === "today") {
                query.createdAt = { $gte: todayStart, $lte: todayEnd };

            } else if (dateRange === "thisWeek") {
                const weekStart = new Date();
                weekStart.setDate(now.getDate() - now.getDay()); // Sunday
                weekStart.setHours(0, 0, 0, 0);

                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                weekEnd.setHours(23, 59, 59, 999);

                query.createdAt = { $gte: weekStart, $lte: weekEnd };

            } else if (dateRange === "thisMonth") {
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                query.createdAt = { $gte: monthStart, $lte: monthEnd };

            } else if (dateRange === "custom") {
                if (startDate || endDate) {
                    query.createdAt = {};
                    if (startDate) {
                        query.createdAt.$gte = new Date(startDate);
                    }
                    if (endDate) {
                        query.createdAt.$lte = new Date(endDate);
                    }
                }
            } else {
                return returnFormatter(false, "Invalid date range value");
            }
        }

        // Apply status-based filters
        if (status === "unAllocated") {
            query.isJobCreated = false;
            query.allocatedEmp = { $eq: null };
        } else if (status === "allocated") {
            // query.isJobCreated = false;
            query.allocatedEmp = { $ne: null };
        } else if (status !== "all") {
            return returnFormatter(false, "Invalid status value");
        }

        // Fetch init data
        const initData = await initModel.find(query)
            .populate({ path: "partnerId", model: "user", options: { strictPopulate: false } })
            .populate({ path: "doneBy", model: "employee", options: { strictPopulate: false } })
            .populate({ path: "allocatedEmp", model: "employee", options: { strictPopulate: false } })
            .sort({ createdAt: -1 });

        // Fetch company info
        const company = await companyModel.findOne({ serviceId });

        // Merge company data
        const mergedData = initData.map(init => ({
            ...init.toObject(),
            company
        }));

        const message = status === "unAllocated"
            ? "Unallocated init data with company retrieved"
            : "Init data with company retrieved";

        return returnFormatter(true, message, mergedData);

    } catch (error) {
        return returnFormatter(false, error.message);
    }
}


// --------------------- Get All unallocated Inits -----------------------

export async function getAllUnAllocatedInits(reqObj) {
    try {

        const query = {
            serviceId: new mongoose.Types.ObjectId(reqObj.user.serviceId),
            isJobCreated: false,
            allocatedEmp: { $eq: null }
        };
        // If a partnerId is provided, include it in the query
        if (reqObj.query.partnerId) {
            query.partnerId = reqObj?.query.partnerId;
        }

        // Get init data with populated partner
        const initData = await initModel.find(query)
            .populate({
                path: "partnerId",
                model: "user",
                options: { strictPopulate: false }
            }).populate({
                path: "doneBy",
                model: "employee",
                options: { strictPopulate: false }
            })
            .sort({ createdAt: -1 });

        // Get company info
        const company = await companyModel.findOne({ serviceId: new mongoose.Types.ObjectId(reqObj.user.serviceId) });

        // Merge company into each init
        const mergedData = initData.map(init => ({
            ...init.toObject(),
            company
        }));


        return returnFormatter(true, "Un Alloacted Init data with company retrieved", mergedData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// --------------------- Get All allocated Inits -----------------------

export async function getAllAllocatedInits(reqObj) {
    try {
        const query = {
            serviceId: new mongoose.Types.ObjectId(reqObj.user.serviceId),
            // isJobCreated: false,
            allocatedEmp: { $ne: null }
        };
        // If a partnerId is provided, include it in the query
        if (reqObj.query && reqObj.query.partnerId) {
            query.partnerId = reqObj.query.partnerId;
        }

        // Get init data with populated partner
        const initData = await initModel.find(query)
            .populate({
                path: "partnerId",
                model: "user",
                options: { strictPopulate: false }
            }).populate({
                path: "doneBy",
                model: "employee",
                options: { strictPopulate: false }
            }).populate({
                path: "allocatedEmp",
                model: "employee",
                options: { strictPopulate: false }
            })
            .sort({ createdAt: -1 });

        // Get company info
        const company = await companyModel.findOne({ serviceId: new mongoose.Types.ObjectId(reqObj.user.serviceId) });

        // Merge company into each init
        const mergedData = initData.map(init => ({
            ...init.toObject(),
            company
        }));


        return returnFormatter(true, "Init data with company retrieved", mergedData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// --------------------- Get All  Inits -----------------------

export async function getAllAllInits(reqObj) {
    try {
        const query = {
            serviceId: new mongoose.Types.ObjectId(reqObj.user.serviceId),
        };
        // If a partnerId is provided, include it in the query
        if (reqObj.query && reqObj.query.partnerId) {
            query.partnerId = reqObj.query.partnerId;
        }

        // Get init data with populated partner
        const initData = await initModel.find(query)
            .populate({
                path: "partnerId",
                model: "user",
                options: { strictPopulate: false }
            }).populate({
                path: "doneBy",
                model: "employee",
                options: { strictPopulate: false }
            }).populate({
                path: "allocatedEmp",
                model: "employee",
                options: { strictPopulate: false }
            })
            .sort({ createdAt: -1 });

        // Get company info
        const company = await companyModel.findOne({ serviceId: new mongoose.Types.ObjectId(reqObj.user.serviceId) });

        // Merge company into each init
        const mergedData = initData.map(init => ({
            ...init.toObject(),
            company
        }));


        return returnFormatter(true, "Init data with company retrieved", mergedData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// --------------------- Get All  dashboard count -----------------------

export async function getAllDatCount(reqObj) {
    try {

        let unAllocated;
        let allocated = await getAllIniatedData(reqObj);
        let All = await getAllIniatedData(reqObj);

        let data = {
            unAllocated: 0,
            allocated: allocated?.data?.length ?? 0,
            all: All?.data?.length ?? 0,
        };


        return returnFormatter(true, "Init data count", data);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}



// --------------------- Get All Inits -----------------------

export async function getAllCompleteInits(reqObj) {
    try {
        const query = {
            serviceId: new mongoose.Types.ObjectId(reqObj.user.serviceId),
            isJobCreated: false,
        };
        // If a partnerId is provided, include it in the query
        if (reqObj.query && reqObj.query.partnerId) {
            query.partnerId = reqObj.query.partnerId;
        }

        // Get init data with populated partner
        const initData = await initModel.find(query)
            .populate({
                path: "partnerId",
                model: "user",
                options: { strictPopulate: false }
            }).populate({
                path: "doneBy",
                model: "employee",
                options: { strictPopulate: false }
            })
            .sort({ createdAt: -1 });

        // Get company info
        const company = await companyModel.findOne({ serviceId: new mongoose.Types.ObjectId(reqObj.user.serviceId) });

        // Merge company into each init
        const mergedData = initData.map(init => ({
            ...init.toObject(),
            company
        }));

        return returnFormatter(true, "Init data with company retrieved", mergedData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}


//----------------------------------- all filtered initaed-----------------------------

function getDateRange(filter) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday as start
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    switch (filter) {
        case 'today':
            return { $gte: startOfToday };
        case 'thisweek':
            return { $gte: startOfWeek };
        case 'thismonth':
            return { $gte: startOfMonth };
        default:
            return null;
    }
}

export async function getAllInitatedFilters(reqObj) {
    try {
        const status = reqObj.query.status;
        const dateFilter = reqObj.query.dateFilter?.toLowerCase();
        const fromDate = reqObj.query.startDate;
        const toDate = reqObj.query.endDate;

        let baseQuery = {
            serviceId: new mongoose.Types.ObjectId(reqObj.user.serviceId),
        };

        if (status === "unAllocated") {
            baseQuery.isJobCreated = false;
        } else if (status === "allocated") {
            baseQuery.isJobCreated = true;
        }

        if (reqObj.query?.partnerId) {
            baseQuery.partnerId = reqObj.query.partnerId;
        }

        // Date filter
        if (dateFilter === "today" || dateFilter === "thisweek" || dateFilter === "thismonth") {
            const dateRange = getDateRange(dateFilter);
            if (dateRange) baseQuery.createdAt = dateRange;
        } else if (dateFilter === "custom" && fromDate && toDate) {
            const from = new Date(fromDate);
            const to = new Date(toDate);
            to.setHours(23, 59, 59, 999);
            baseQuery.createdAt = { $gte: from, $lte: to };
        }

        const initData = await initModel.find(baseQuery)
            .populate({ path: "partnerId", model: "user", options: { strictPopulate: false } })
            .populate({ path: "doneBy", model: "employee", options: { strictPopulate: false } })
            .populate({ path: "allocatedEmp", model: "employee", options: { strictPopulate: false } })
            .populate({ path: "allocatedBackOfficeEmp", model: "employee", options: { strictPopulate: false } })
            .populate({ path: "referSeviceId", model: "service", options: { strictPopulate: false } })
            .sort({ createdAt: -1 });

        if (!initData.length) {
            return returnFormatter(true, "No init data found", []);
        }

        const company = await companyModel.findOne({ serviceId: new mongoose.Types.ObjectId(reqObj.user.serviceId) });

        const partnerId = initData[0]?.partnerId?._id || initData[0]?.partnerId;
        const serviceId = new mongoose.Types.ObjectId(reqObj.user.serviceId);

        const requestData = await partnerRequestModel.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: partnerId, receiverId: serviceId },
                        { senderId: serviceId, receiverId: partnerId }
                    ]
                }
            },
            { $sort: { createdAt: -1 } },

            // Unwind productForm to flatten array
            { $unwind: "$productForm" },

            // Lookup userProduct using userProductId
            {
                $lookup: {
                    from: "userproducts",
                    localField: "productForm.userProductId",
                    foreignField: "_id",
                    as: "productForm.userProduct"
                }
            },

            // Convert userProduct from array to single object
            {
                $addFields: {
                    "productForm.userProduct": { $arrayElemAt: ["$productForm.userProduct", 0] }
                }
            },

            // Lookup service from services using referId
            {
                $lookup: {
                    from: "services",
                    localField: "productForm.userProduct.referId",
                    foreignField: "_id",
                    as: "productForm.userProduct.referService"
                }
            },

            // Convert referService from array to single object
            {
                $addFields: {
                    "productForm.userProduct.referService": {
                        $arrayElemAt: ["$productForm.userProduct.referService", 0]
                    }
                }
            }
        ]);


        const mergedData = initData.map(init => ({
            ...init.toObject(),
            company,
            requestData: requestData[0] || null,

        }));



        // if (status === "unAllocated") {
        //     const mergedData = initData.map(init => ({
        //         ...init.toObject(),
        //         company,
        //         requestData: requestData[0] || null,

        //     }));
        //     return returnFormatter(true, "Unallocated init data retrieved", mergedData);
        // }

        // const enrichedInits = await Promise.all(
        //     initData.map(async (init) => {
        //         let jobDetails = [];

        //         if (init.jobId) {
        //             jobDetails = await jobModel.aggregate([
        //                 { $match: { _id: init.jobId } },
        //                 {
        //                     $lookup: {
        //                         from: "users",
        //                         localField: "creatorId",
        //                         foreignField: "_id",
        //                         as: "creatorId",
        //                     },
        //                 },
        //                 { $unwind: { path: "$creatorId", preserveNullAndEmptyArrays: true } },
        //                 {
        //                     $lookup: {
        //                         from: "users",
        //                         localField: "partnerId",
        //                         foreignField: "_id",
        //                         as: "partnerId",
        //                     },
        //                 },
        //                 { $unwind: { path: "$partnerId", preserveNullAndEmptyArrays: true } },
        //                 {
        //                     $lookup: {
        //                         from: "jobproducts",
        //                         localField: "_id",
        //                         foreignField: "jobId",
        //                         as: "allJobProducts",
        //                     },
        //                 },
        //                 {
        //                     $lookup: {
        //                         from: "employees",
        //                         localField: "allocationId",
        //                         foreignField: "_id",
        //                         as: "allocatedBackOfficeEmp",
        //                     },
        //                 },
        //                 { $unwind: { path: "$allocatedBackOfficeEmp", preserveNullAndEmptyArrays: true } },
        //                 {
        //                     $addFields: {
        //                         filteredJobProducts: {
        //                             $filter: {
        //                                 input: "$allJobProducts",
        //                                 as: "jp",
        //                                 cond: {
        //                                     $in: ["$$jp.jobStatus", ["pending", "allocated", "completed"]]
        //                                 }
        //                             }
        //                         }
        //                     }
        //                 },
        //                 { $match: { "filteredJobProducts.0": { $exists: true } } },
        //                 {
        //                     $lookup: {
        //                         from: "userproducts",
        //                         localField: "filteredJobProducts.userProductId",
        //                         foreignField: "_id",
        //                         as: "allUserProducts",
        //                     },
        //                 },
        //                 {
        //                     $lookup: {
        //                         from: "products",
        //                         localField: "allUserProducts.productId",
        //                         foreignField: "_id",
        //                         as: "allProducts",
        //                     },
        //                 },
        //                 {
        //                     $addFields: {
        //                         jobproducts: {
        //                             $map: {
        //                                 input: "$filteredJobProducts",
        //                                 as: "jobproduct",
        //                                 in: {
        //                                     $mergeObjects: [
        //                                         "$$jobproduct",
        //                                         {
        //                                             userProduct: {
        //                                                 $arrayElemAt: [
        //                                                     {
        //                                                         $filter: {
        //                                                             input: "$allUserProducts",
        //                                                             as: "userProduct",
        //                                                             cond: { $eq: ["$$userProduct._id", "$$jobproduct.userProductId"] }
        //                                                         }
        //                                                     },
        //                                                     0
        //                                                 ]
        //                                             },
        //                                             product: {
        //                                                 $arrayElemAt: [
        //                                                     {
        //                                                         $filter: {
        //                                                             input: "$allProducts",
        //                                                             as: "product",
        //                                                             cond: {
        //                                                                 $eq: [
        //                                                                     "$$product._id",
        //                                                                     {
        //                                                                         $arrayElemAt: [
        //                                                                             {
        //                                                                                 $map: {
        //                                                                                     input: {
        //                                                                                         $filter: {
        //                                                                                             input: "$allUserProducts",
        //                                                                                             as: "up",
        //                                                                                             cond: { $eq: ["$$up._id", "$$jobproduct.userProductId"] }
        //                                                                                         }
        //                                                                                     },
        //                                                                                     as: "userProduct",
        //                                                                                     in: "$$userProduct.productId"
        //                                                                                 }
        //                                                                             },
        //                                                                             0
        //                                                                         ]
        //                                                                     }
        //                                                                 ]
        //                                                             }
        //                                                         }
        //                                                     },
        //                                                     0
        //                                                 ]
        //                                             }
        //                                         }
        //                                     ]
        //                                 }
        //                             }
        //                         }
        //                     }
        //                 },
        //                 {
        //                     $project: {
        //                         allJobProducts: 0,
        //                         filteredJobProducts: 0,
        //                         allUserProducts: 0,
        //                         allProducts: 0
        //                     }
        //                 }
        //             ]);
        //         }

        //         return {
        //             ...init.toObject(),
        //             jobDetails: jobDetails[0] || null
        //         };
        //     })
        // );

        // const mergedData = enrichedInits.map(init => ({
        //     ...init,
        //     company,
        //     requestData: requestData[0] || null
        // }));

        return returnFormatter(true, "Allocated/all init data retrieved", mergedData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}


// --------------------- Get All  Inits job not created-----------------------

export async function getAllInitsByEmpId(reqObj) {
    try {
        const query = {
            serviceId: new mongoose.Types.ObjectId(reqObj.employee.organizationId),
            allocatedOfficeEmp: new mongoose.Types.ObjectId(reqObj.employee.id),
        };

        if (reqObj.query?.partnerId) {
            query.partnerId = reqObj.query.partnerId;
        }

        // Date filter handling
        if (reqObj.query?.dateFilter) {
            const now = new Date();
            let startDate, endDate;

            switch (reqObj.query.dateFilter) {
                case "today":
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    endDate = new Date(now.setHours(23, 59, 59, 999));
                    break;
                case "thisWeek":
                    const firstDayOfWeek = new Date(now);
                    firstDayOfWeek.setDate(now.getDate() - now.getDay());
                    firstDayOfWeek.setHours(0, 0, 0, 0);
                    startDate = firstDayOfWeek;
                    endDate = new Date(); // now
                    break;
                case "thisMonth":
                    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    startDate = firstDayOfMonth;
                    endDate = new Date(); // now
                    break;
                case "custom":
                    if (reqObj.query.startDate && reqObj.query.endDate) {
                        startDate = new Date(reqObj.query.startDate);
                        endDate = new Date(reqObj.query.endDate);
                        endDate.setHours(23, 59, 59, 999);
                    }
                    break;
            }

            if (startDate && endDate) {
                query.createdAt = {
                    $gte: startDate,
                    $lte: endDate
                };
            }
        }

        const initData = await initModel.find(query)
            .populate({ path: "partnerId", model: "Organization", options: { strictPopulate: false } })
            .populate({ path: "doneBy", model: "employee", options: { strictPopulate: false } })
            .populate({ path: "allocatedOfficeEmp", model: "employee", options: { strictPopulate: false } })
            .sort({ createdAt: -1 });

        if (!initData.length) {
            return returnFormatter(true, "No init data found", []);
        }

        const company = await companyModel.findOne({ serviceId: new mongoose.Types.ObjectId(reqObj.user.serviceId) });

        const partnerId = initData[0]?.partnerId?._id || initData[0]?.partnerId;
        const serviceId = new mongoose.Types.ObjectId(reqObj.user.serviceId);

        const requestData = await partnerRequestModel.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: partnerId, receiverId: serviceId },
                        { senderId: serviceId, receiverId: partnerId }
                    ]
                }
            }
        ]).sort({ createdAt: -1 });

        const mergedData = initData.map(init => ({
            ...init.toObject(),
            company,
            requestData: requestData[0] || null
        }));

        return returnFormatter(true, "Init data with emp retrieved", mergedData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// --------------------- Get All  Inits job  created-----------------------
export async function getAllInitsByEmpIdJobCreated(reqObj) {
    try {
        const query = {
            serviceId: new mongoose.Types.ObjectId(reqObj.user.serviceId),
            allocatedEmp: new mongoose.Types.ObjectId(reqObj.user.empId),
            isJobCreated: true
        };

        if (reqObj.query?.partnerId) {
            query.partnerId = reqObj.query.partnerId;
        }

        // Add date filtering
        if (reqObj.query?.dateFilter) {
            const now = new Date();
            let startDate, endDate;

            switch (reqObj.query.dateFilter) {
                case "today":
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    endDate = new Date(now.setHours(23, 59, 59, 999));
                    break;
                case "thisWeek":
                    const firstDayOfWeek = new Date(now);
                    firstDayOfWeek.setDate(now.getDate() - now.getDay());
                    firstDayOfWeek.setHours(0, 0, 0, 0);
                    startDate = firstDayOfWeek;
                    endDate = new Date(); // now
                    break;
                case "thisMonth":
                    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    startDate = firstDayOfMonth;
                    endDate = new Date(); // now
                    break;
                case "custom":
                    if (reqObj.query.startDate && reqObj.query.endDate) {
                        startDate = new Date(reqObj.query.startDate);
                        endDate = new Date(reqObj.query.endDate);
                        endDate.setHours(23, 59, 59, 999);
                    }
                    break;
            }

            if (startDate && endDate) {
                query.createdAt = {
                    $gte: startDate,
                    $lte: endDate
                };
            }
        }

        const initData = await initModel.find(query)
            .populate({ path: "partnerId", model: "user", options: { strictPopulate: false } })
            .populate({ path: "doneBy", model: "employee", options: { strictPopulate: false } })
            .populate({ path: "allocatedEmp", model: "employee", options: { strictPopulate: false } })
            .sort({ createdAt: -1 });

        if (!initData.length) {
            return returnFormatter(true, "No init data found", []);
        }

        const enrichedInits = await Promise.all(
            initData.map(async (init) => {
                let jobDetails = [];

                if (init.jobId) {
                    jobDetails = await jobModel.aggregate([
                        { $match: { _id: init.jobId } },
                        {
                            $lookup: {
                                from: "users",
                                localField: "creatorId",
                                foreignField: "_id",
                                as: "creatorId",
                            },
                        },
                        { $unwind: { path: "$creatorId", preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: {
                                from: "users",
                                localField: "partnerId",
                                foreignField: "_id",
                                as: "partnerId",
                            },
                        },
                        { $unwind: { path: "$partnerId", preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: {
                                from: "jobproducts",
                                localField: "_id",
                                foreignField: "jobId",
                                as: "allJobProducts",
                            },
                        },
                        {
                            $lookup: {
                                from: "employees",
                                localField: "allocationId",
                                foreignField: "_id",
                                as: "allocatedBackOfficeEmp",
                            },
                        },
                        { $unwind: { path: "$allocatedBackOfficeEmp", preserveNullAndEmptyArrays: true } },
                        {
                            $addFields: {
                                filteredJobProducts: {
                                    $filter: {
                                        input: "$allJobProducts",
                                        as: "jp",
                                        cond: {
                                            $in: ["$$jp.jobStatus", ["pending", "allocated", "completed"]]
                                        }
                                    }
                                }
                            }
                        },
                        { $match: { "filteredJobProducts.0": { $exists: true } } },
                        {
                            $lookup: {
                                from: "userproducts",
                                localField: "filteredJobProducts.userProductId",
                                foreignField: "_id",
                                as: "allUserProducts",
                            },
                        },
                        {
                            $lookup: {
                                from: "products",
                                localField: "allUserProducts.productId",
                                foreignField: "_id",
                                as: "allProducts",
                            },
                        },
                        {
                            $addFields: {
                                jobproducts: {
                                    $map: {
                                        input: "$filteredJobProducts",
                                        as: "jobproduct",
                                        in: {
                                            $mergeObjects: [
                                                "$$jobproduct",
                                                {
                                                    userProduct: {
                                                        $arrayElemAt: [
                                                            {
                                                                $filter: {
                                                                    input: "$allUserProducts",
                                                                    as: "userProduct",
                                                                    cond: { $eq: ["$$userProduct._id", "$$jobproduct.userProductId"] }
                                                                }
                                                            },
                                                            0
                                                        ]
                                                    },
                                                    product: {
                                                        $arrayElemAt: [
                                                            {
                                                                $filter: {
                                                                    input: "$allProducts",
                                                                    as: "product",
                                                                    cond: {
                                                                        $eq: [
                                                                            "$$product._id",
                                                                            {
                                                                                $arrayElemAt: [
                                                                                    {
                                                                                        $map: {
                                                                                            input: {
                                                                                                $filter: {
                                                                                                    input: "$allUserProducts",
                                                                                                    as: "up",
                                                                                                    cond: { $eq: ["$$up._id", "$$jobproduct.userProductId"] }
                                                                                                }
                                                                                            },
                                                                                            as: "userProduct",
                                                                                            in: "$$userProduct.productId"
                                                                                        }
                                                                                    },
                                                                                    0
                                                                                ]
                                                                            }
                                                                        ]
                                                                    }
                                                                }
                                                            },
                                                            0
                                                        ]
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        },
                        {
                            $project: {
                                allJobProducts: 0,
                                filteredJobProducts: 0,
                                allUserProducts: 0,
                                allProducts: 0
                            }
                        }
                    ]);
                }

                return {
                    ...init.toObject(),
                    jobDetails: jobDetails[0] || null
                };
            })
        );

        const company = await companyModel.findOne({ serviceId: new mongoose.Types.ObjectId(reqObj.user.serviceId) });

        const partnerId = initData[0]?.partnerId?._id || initData[0]?.partnerId;
        const serviceId = new mongoose.Types.ObjectId(reqObj.user.serviceId);

        const requestData = await partnerRequestModel.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: partnerId, receiverId: serviceId },
                        { senderId: serviceId, receiverId: partnerId }
                    ]
                }
            }
        ]).sort({ createdAt: -1 });

        const mergedData = enrichedInits.map(init => ({
            ...init,
            company,
            requestData: requestData[0] || null
        }));

        return returnFormatter(true, "Init data with emp retrieved", mergedData);
    } catch (error) {
        console.error("Error in getAllInitsByEmpIdJobCreated:", error);
        return returnFormatter(false, error.message);
    }
}

// --------------------- Get All  Unfiltered-----------------------
export async function getAllInitForInitiationUnfiltered(reqObj) {
    try {
        const query = {
            serviceId: new mongoose.Types.ObjectId(reqObj.user.serviceId),
            allocatedEmp: new mongoose.Types.ObjectId(reqObj.user.empId),
        };

        if (reqObj.query?.partnerId) {
            query.partnerId = reqObj.query.partnerId;
        }

        // Handle date filters
        if (reqObj.query?.dateFilter) {
            const now = new Date();
            let startDate, endDate;

            switch (reqObj.query.dateFilter) {
                case "today":
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    endDate = new Date(now.setHours(23, 59, 59, 999));
                    break;
                case "thisWeek":
                    const firstDayOfWeek = new Date(now);
                    firstDayOfWeek.setDate(now.getDate() - now.getDay());
                    firstDayOfWeek.setHours(0, 0, 0, 0);
                    startDate = firstDayOfWeek;
                    endDate = new Date(); // now
                    break;
                case "thisMonth":
                    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    startDate = firstDayOfMonth;
                    endDate = new Date(); // now
                    break;
                case "custom":
                    if (reqObj.query.startDate && reqObj.query.endDate) {
                        startDate = new Date(reqObj.query.startDate);
                        endDate = new Date(reqObj.query.endDate);
                        endDate.setHours(23, 59, 59, 999);
                    }
                    break;
            }

            if (startDate && endDate) {
                query.createdAt = {
                    $gte: startDate,
                    $lte: endDate,
                };
            }
        }

        const initData = await initModel.find(query)
            .populate({ path: "partnerId", model: "user", options: { strictPopulate: false } })
            .populate({ path: "doneBy", model: "employee", options: { strictPopulate: false } })
            .populate({ path: "allocatedEmp", model: "employee", options: { strictPopulate: false } })
            .sort({ createdAt: -1 });

        if (!initData.length) {
            return returnFormatter(true, "No init data found", []);
        }

        const enrichedInits = await Promise.all(
            initData.map(async (init) => {
                let jobDetails = [];

                if (init.jobId) {
                    jobDetails = await jobModel.aggregate([
                        { $match: { _id: init.jobId } },
                        {
                            $lookup: {
                                from: "users",
                                localField: "creatorId",
                                foreignField: "_id",
                                as: "creatorId",
                            },
                        },
                        { $unwind: { path: "$creatorId", preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: {
                                from: "users",
                                localField: "partnerId",
                                foreignField: "_id",
                                as: "partnerId",
                            },
                        },
                        { $unwind: { path: "$partnerId", preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: {
                                from: "jobproducts",
                                localField: "_id",
                                foreignField: "jobId",
                                as: "allJobProducts",
                            },
                        },
                        {
                            $lookup: {
                                from: "employees",
                                localField: "allocationId",
                                foreignField: "_id",
                                as: "allocatedBackOfficeEmp",
                            },
                        },
                        { $unwind: { path: "$allocatedBackOfficeEmp", preserveNullAndEmptyArrays: true } },
                        {
                            $addFields: {
                                filteredJobProducts: {
                                    $filter: {
                                        input: "$allJobProducts",
                                        as: "jp",
                                        cond: {
                                            $in: ["$$jp.jobStatus", ["pending", "allocated", "completed"]]
                                        }
                                    }
                                }
                            }
                        },
                        { $match: { "filteredJobProducts.0": { $exists: true } } },
                        {
                            $lookup: {
                                from: "userproducts",
                                localField: "filteredJobProducts.userProductId",
                                foreignField: "_id",
                                as: "allUserProducts",
                            },
                        },
                        {
                            $lookup: {
                                from: "products",
                                localField: "allUserProducts.productId",
                                foreignField: "_id",
                                as: "allProducts",
                            },
                        },
                        {
                            $addFields: {
                                jobproducts: {
                                    $map: {
                                        input: "$filteredJobProducts",
                                        as: "jobproduct",
                                        in: {
                                            $mergeObjects: [
                                                "$$jobproduct",
                                                {
                                                    userProduct: {
                                                        $arrayElemAt: [
                                                            {
                                                                $filter: {
                                                                    input: "$allUserProducts",
                                                                    as: "userProduct",
                                                                    cond: { $eq: ["$$userProduct._id", "$$jobproduct.userProductId"] }
                                                                }
                                                            },
                                                            0
                                                        ]
                                                    },
                                                    product: {
                                                        $arrayElemAt: [
                                                            {
                                                                $filter: {
                                                                    input: "$allProducts",
                                                                    as: "product",
                                                                    cond: {
                                                                        $eq: [
                                                                            "$$product._id",
                                                                            {
                                                                                $arrayElemAt: [
                                                                                    {
                                                                                        $map: {
                                                                                            input: {
                                                                                                $filter: {
                                                                                                    input: "$allUserProducts",
                                                                                                    as: "up",
                                                                                                    cond: { $eq: ["$$up._id", "$$jobproduct.userProductId"] }
                                                                                                }
                                                                                            },
                                                                                            as: "userProduct",
                                                                                            in: "$$userProduct.productId"
                                                                                        }
                                                                                    },
                                                                                    0
                                                                                ]
                                                                            }
                                                                        ]
                                                                    }
                                                                }
                                                            },
                                                            0
                                                        ]
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        },
                        {
                            $project: {
                                allJobProducts: 0,
                                filteredJobProducts: 0,
                                allUserProducts: 0,
                                allProducts: 0
                            }
                        }
                    ]);
                }

                return {
                    ...init.toObject(),
                    jobDetails: jobDetails[0] || null
                };
            })
        );

        const company = await companyModel.findOne({ serviceId: new mongoose.Types.ObjectId(reqObj.user.serviceId) });

        const partnerId = initData[0]?.partnerId?._id || initData[0]?.partnerId;
        const serviceId = new mongoose.Types.ObjectId(reqObj.user.serviceId);

        const requestData = await partnerRequestModel.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: partnerId, receiverId: serviceId },
                        { senderId: serviceId, receiverId: partnerId }
                    ]
                }
            }
        ]).sort({ createdAt: -1 });

        const mergedData = enrichedInits.map(init => ({
            ...init,
            company,
            requestData: requestData[0] || null
        }));

        return returnFormatter(true, "Init data with emp retrieved", mergedData);
    } catch (error) {
        console.error("Error in getAllInitsByEmpIdJobCreated:", error);
        return returnFormatter(false, error.message);
    }
}



// -------------------------   initiation dashboard ---------------------

export async function getInitiationDashboard(reqObj) {
    try {
        const query = {
            organizationId: new mongoose.Types.ObjectId(reqObj.employee.organizationId),
        };

         let role = await roleModel.findById(reqObj.employee.roleId);
       
        if (role.roleName=="SuperAdmin") {
            query.allocatedOfficeEmp = new mongoose.Types.ObjectId(reqObj.employee.id);
        }


        let pending = await initModel.countDocuments({ ...query, reportStatus: "pending" })
        let wip = await initModel.countDocuments({ ...query, reportStatus: "wip" })
        let generated = await initModel.countDocuments({ ...query, reportStatus: "generated" })
        let all = pending + wip + generated;

        let data = {
            pending,
            generated,
            wip, all
        }

        return returnFormatter(true, "Initiation dashboard count", data);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}




// --------------------- Get All Inits by Service ID -----------------------

export async function getAllInitsByServiceId(requestsObject) {
    try {
        const initData = await initModel
            .find({ serviceid: requestsObject.user.serviceId })
            .populate({
                path: "partnerId",
                model: "user",
                options: { strictPopulate: false }
            })
            .sort({ createdAt: -1 });
        const company = await companyModel.findOne({ serviceId: reqObj.user.serviceId });

        // Merge company into each init
        const mergedData = initData.map(init => ({
            ...init.toObject(),  // convert Mongoose doc to plain object
            company
        }));
        return returnFormatter(true, "Init data retrieved by serviceId", initData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}



// -------------------------------------create excel---------------------------------------



export async function createExcelForInit(requestObject) {
    try {
        const workbook = new ExcelJS.Workbook();

        // Create worksheet
        const initExcelSheet = workbook.addWorksheet("initSheet");

        let defautData = await getAllInitFields(requestObject)

        if (defautData.status == false) {
            return returnFormatter(false, defautData.message)
        }

        initExcelSheet.columns = defautData.data.map(item => ({
            header: item.fieldName,
            key: toCamelCase(item.fieldName),
            width: getColumnWidth(item.fieldName)
        }));

        // Helper to convert field name to camelCase key
        function toCamelCase(str) {
            return str
                .toLowerCase()
                .replace(/[^a-zA-Z0-9 ]/g, '') // remove special characters
                .replace(/ (.)/g, (_, group1) => group1.toUpperCase());
        }
        // You would fetch or receive your data array here
        const initData = await initModel.find({
            serviceId: requestObject.employee.organizationId,
            isJobCreated: false,
        });
        function getColumnWidth(fieldName) {
            return Math.max(20, fieldName.length + 10);
        }

        // Ensure the /sheet directory exists
        const dirPath = path.join(".", "sheet");
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }

        // Save the file
        const filePath = `./sheet/${requestObject.employee.organizationId}_data_sheet.xlsx`;
        await workbook.xlsx.writeFile(filePath);

        const correctedUrl = filePath.replace("./sheet", "/sheet");
        const downloadUrl = `https://fintech-api.fincooper.in${correctedUrl}`;

        return returnFormatter(true, "Excel sheet created successfully", downloadUrl);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}


//---------------------------------- read excel and create inits ------------------------




function getColumnWidth(fieldName) {
    return Math.max(20, fieldName.length + 10);
}



export async function readExcelForInit(reqObj) {
    try {
        const filePath = reqObj.file.path;

        if (!fs.existsSync(filePath)) {
            return returnFormatter(false, "Excel sheet not found.");
        }
        let requestData = await partnerRequestModel.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: new mongoose.Types.ObjectId(reqObj.query.partnerId), receiverId: new mongoose.Types.ObjectId(reqObj.employee.organizationId) },
                        { senderId: new mongoose.Types.ObjectId(reqObj.employee.organizationId), receiverId: new mongoose.Types.ObjectId(reqObj.query.partnerId) }
                    ]
                }
            }])
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);

        const sheet = workbook.getWorksheet("initSheet");
        if (!sheet) {
            return returnFormatter(false, "Sheet 'initSheet' not found.");
        }

        const defautData = await getAllInitFields(reqObj); // assuming this returns { data: [...] }

        // Build expected headers from default data
        const expectedHeaders = defautData.data.map((item) => ({
            header: item.fieldName,
            key: toCamelCase(item.fieldName),
        }));


        const headerRow = sheet.getRow(1);
        const columnMap = {};

        headerRow.eachCell((cell, colNumber) => {
            const match = expectedHeaders.find(
                (h) =>
                    h.header.trim().toLowerCase() ===
                    String(cell.value).trim().toLowerCase()
            );
            if (match) {
                columnMap[match.key] = colNumber;
            }
        });

        const jobsArray = [];

        let errorObject = {
            hasError:false,
            fieldMissing:[]
        }
        if (sheet.actualRowCount<2) {
                 return returnFormatter(
                        false,
                        `Sheet is empty`
                    );
        }
        sheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // skip header

            const jobData = {
                organizationId: reqObj.employee.organizationId,
                partnerId: reqObj.query.partnerId,
                referServiceId: reqObj.query.serviceId,
                doneBy: reqObj.employee.id,
                allocatedOfficeEmp: requestData[0].allocationId[0],
                initFields: [],
            };

            defautData.data.forEach((field) => {
                const key = toCamelCase(field.fieldName);
                const colIndex = columnMap[key];
                let value = colIndex ? row.getCell(colIndex).value : null;

                // Handle rich text / complex cell objects
                if (value && typeof value === "object" && value.text) {
                    value = value.text;
                }
                
                // Check required fields
                if (field.isRequired && (value == null || value == "")) {
                    errorObject.hasError=true
                    errorObject.fieldMissing.push(field.fieldName)
                    // return returnFormatter(
                    //     false,
                    //     `Missing required field "${field.fieldName}" at row ${rowNumber}`
                    // );
                }

                jobData.initFields.push({
                    fieldName: field.fieldName,
                    dataType: field.dataType,
                    value: value,
                });
            });

            

            jobsArray.push(jobData);
        });
        if (errorObject.hasError) {
            return returnFormatter(
                                false,
                                `Missing required field "${errorObject.fieldMissing.toString()}"`
                            );
        }
        // Save jobs (optionally bulk insert)
        for (const jobData of jobsArray) {
            await initModel.create(jobData);
        }

        return returnFormatter(
            true,
            "Jobs created successfully from Excel",
            jobsArray
        );
    } catch (error) {
        
        return returnFormatter(false, error.message);
    }
}

// Helper toCamelCase function
function toCamelCase(str) {
    return str
        .replace(/([-_ ][a-z])/gi, ($1) => {
            return $1.toUpperCase().replace(/[-_ ]/g, "");
        })
        .replace(/^(.)/, ($1) => $1.toLowerCase());
}





//----------------------------------- all iniated according to ketav sir-----------------------------



export async function getAllIniatedData(reqObj) {
    try {
        const dateFilter = reqObj.query.dateFilter?.toLowerCase();
        const fromDate = reqObj.query.startDate;
        const toDate = reqObj.query.endDate;

        let baseQuery = {
            organizationId: new mongoose.Types.ObjectId(reqObj.employee.organizationId),
        };
       let role = await roleModel.findById(reqObj.employee.roleId);
       
        if (role.roleName=="SuperAdmin") {
            // No changes; serviceId is already set
        } else {
            // Add `doneBy` conditionally
            baseQuery.doneBy = new mongoose.Types.ObjectId(reqObj.employee.id);
        }


        if (reqObj.query?.partnerId) {
            baseQuery.partnerId = reqObj.query.partnerId;
        }

        if (reqObj.query?.serviceId) {
            baseQuery.referServiceId = reqObj.query.serviceId;
        }

        // Date filter
        if (dateFilter === "today" || dateFilter === "thisweek" || dateFilter === "thismonth") {
            const dateRange = getDateRange(dateFilter);
            if (dateRange) baseQuery.createdAt = dateRange;
        } else if (dateFilter === "custom" && fromDate && toDate) {
            const from = new Date(fromDate);
            const to = new Date(toDate);
            to.setHours(23, 59, 59, 999);
            baseQuery.createdAt = { $gte: from, $lte: to };
        }

        const initData = await initModel.find(baseQuery)
            .populate({ path: "partnerId", model: "Organization", options: { strictPopulate: false } })
            .populate({ path: "doneBy", model: "employee", options: { strictPopulate: false } })
            .populate({ path: "allocatedOfficeEmp", model: "employee", options: { strictPopulate: false } })
            .populate({ path: "referServiceId", model: "service", options: { strictPopulate: false } })
            .populate({ path: "reportType", model: "userProduct", options: { strictPopulate: false } })
            .sort({ createdAt: -1 });

        if (!initData.length) {
            return returnFormatter(true, "No init data found", []);
        }

        const company = await companyModel.findOne({ serviceId: new mongoose.Types.ObjectId(reqObj.employee.organizationId) });

        const partnerId = initData[0]?.partnerId?._id || initData[0]?.partnerId;
        const serviceId = new mongoose.Types.ObjectId(reqObj.employee.organizationId);

        const requestData = await partnerRequestModel.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: partnerId, receiverId: serviceId },
                        { senderId: serviceId, receiverId: partnerId }
                    ]
                }
            },
            { $sort: { createdAt: -1 } },

            // Unwind productForm to flatten array
            { $unwind: "$productForm" },

            // Lookup userProduct using userProductId
            {
                $lookup: {
                    from: "userproducts",
                    localField: "productForm.userProductId",
                    foreignField: "_id",
                    as: "productForm.userProduct"
                }
            },

            // Convert userProduct from array to single object
            {
                $addFields: {
                    "productForm.userProduct": { $arrayElemAt: ["$productForm.userProduct", 0] }
                }
            },

            // Lookup service from services using referId
            {
                $lookup: {
                    from: "services",
                    localField: "productForm.userProduct.referId",
                    foreignField: "_id",
                    as: "productForm.userProduct.referService"
                }
            },

            // Convert referService from array to single object
            {
                $addFields: {
                    "productForm.userProduct.referService": {
                        $arrayElemAt: ["$productForm.userProduct.referService", 0]
                    }
                }
            }
        ]);


        const mergedData = initData.map(init => ({
            ...init.toObject(),
            company,
            requestData: requestData[0] || null,

        }));

        await addVariableAuto(reqObj);



        return returnFormatter(true, "Allocated/all init data retrieved", mergedData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}


//--------------------------------------------  get backoffice according to sir -----------------------------------------


export async function getAllForBackOffice(reqObj) {
    try {

        const query = {
            organizationId: new mongoose.Types.ObjectId(reqObj.employee.organizationId),
        };

       let role = await roleModel.findById(reqObj.employee.roleId);
       
        if (role.roleName=="SuperAdmin") {
            // No changes; serviceId is already set
            query.allocatedOfficeEmp = new mongoose.Types.ObjectId(reqObj.employee.id);
        }


        if (reqObj.query?.partnerId) {
            query.partnerId = reqObj.query.partnerId;
        }

        if (reqObj.query?.serviceId) {
            query.referServiceId = reqObj.query.serviceId;
        }

        // Date filter handling
        if (reqObj.query?.dateFilter) {
            const now = new Date();
            let startDate, endDate;

            switch (reqObj.query.dateFilter) {
                case "today":
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    endDate = new Date(now.setHours(23, 59, 59, 999));
                    break;
                case "thisWeek":
                    const firstDayOfWeek = new Date(now);
                    firstDayOfWeek.setDate(now.getDate() - now.getDay());
                    firstDayOfWeek.setHours(0, 0, 0, 0);
                    startDate = firstDayOfWeek;
                    endDate = new Date(); // now
                    break;
                case "thisMonth":
                    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    startDate = firstDayOfMonth;
                    endDate = new Date(); // now
                    break;
                case "custom":
                    if (reqObj.query.startDate && reqObj.query.endDate) {
                        startDate = new Date(reqObj.query.startDate);
                        endDate = new Date(reqObj.query.endDate);
                        endDate.setHours(23, 59, 59, 999);
                    }
                    break;
            }

            if (startDate && endDate) {
                query.createdAt = {
                    $gte: startDate,
                    $lte: endDate
                };
            }
        }

        const initData = await initModel.find(query)
            .populate({ path: "partnerId", model: "Organization", options: { strictPopulate: false } })
            .populate({ path: "doneBy", model: "employee", options: { strictPopulate: false } })
            .populate({ path: "allocatedOfficeEmp", model: "employee", options: { strictPopulate: false } })
            .populate({ path: "referServiceId", model: "service", options: { strictPopulate: false } })
            .populate({ path: "reportType", model: "userProduct", options: { strictPopulate: false } })

            .sort({ createdAt: -1 });

        if (!initData.length) {
            return returnFormatter(true, "No init data found", []);
        }

        const company = await companyModel.findOne({ serviceId: new mongoose.Types.ObjectId(reqObj.employee.organizationId) });

        const partnerId = initData[0]?.partnerId?._id || initData[0]?.partnerId;
        const serviceId = new mongoose.Types.ObjectId(reqObj.employee.organizationId);

        const requestData = await partnerRequestModel.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: partnerId, receiverId: serviceId },
                        { senderId: serviceId, receiverId: partnerId }
                    ]
                }
            }
        ]).sort({ createdAt: -1 });

        const mergedData = initData.map(init => ({
            ...init.toObject(),
            company,
            requestData: requestData[0] || null
        }));

        await addVariableAuto(reqObj);


        return returnFormatter(true, "Init data with emp retrieved", mergedData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}








//--------------------------------------------  get backoffice for invoice according to sir -----------------------------------------


export async function getAllInvoicedata(reqObj) {
    try {
        const query = {
            organizationId: new mongoose.Types.ObjectId(reqObj.employee.organizationId),
            workStatus: "reportgenerated",
            // allocatedOfficeEmp: new mongoose.Types.ObjectId(reqObj.user.empId),
            paymentStatus:reqObj.query.paymentStatus
        };


        if (reqObj.query?.partnerId) {
            query.partnerId = reqObj.query.partnerId;
        }


        if (reqObj.query?.serviceId) {
            query.referServiceId = reqObj.query.serviceId;
        }

        // Date filter handling
        if (reqObj.query?.dateFilter) {
            const now = new Date();
            let startDate, endDate;

            switch (reqObj.query.dateFilter) {
                case "today":
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    endDate = new Date(now.setHours(23, 59, 59, 999));
                    break;
                case "thisWeek":
                    const firstDayOfWeek = new Date(now);
                    firstDayOfWeek.setDate(now.getDate() - now.getDay());
                    firstDayOfWeek.setHours(0, 0, 0, 0);
                    startDate = firstDayOfWeek;
                    endDate = new Date(); // now
                    break;
                case "thisMonth":
                    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    startDate = firstDayOfMonth;
                    endDate = new Date(); // now
                    break;
                case "custom":
                    if (reqObj.query.startDate && reqObj.query.endDate) {
                        startDate = new Date(reqObj.query.startDate);
                        endDate = new Date(reqObj.query.endDate);
                        endDate.setHours(23, 59, 59, 999);
                    }
                    break;
            }

            if (startDate && endDate) {
                query.createdAt = {
                    $gte: startDate,
                    $lte: endDate
                };
            }
        }

        const initData = await initModel.find(query)
            .populate({ path: "partnerId", model: "Organization", options: { strictPopulate: false } })
            .populate({ path: "doneBy", model: "employee", options: { strictPopulate: false } })
            .populate({ path: "allocatedOfficeEmp", model: "employee", options: { strictPopulate: false } })
            .populate({ path: "referServiceId", model: "service", options: { strictPopulate: false } })
            .populate({ path: "reportType", model: "userProduct", options: { strictPopulate: false } })

            .sort({ createdAt: -1 });

        if (!initData.length) {
            return returnFormatter(true, "No init data found", []);
        }

        const company = await companyModel.findOne({ organizationId: new mongoose.Types.ObjectId(reqObj.employee.organizationId) });

        const partnerId = initData[0]?.partnerId?._id || initData[0]?.partnerId;
        const serviceId = new mongoose.Types.ObjectId(reqObj.employee.organizationId);

        const requestData = await partnerRequestModel.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: partnerId, receiverId: serviceId },
                        { senderId: serviceId, receiverId: partnerId }
                    ]
                }
            }
        ]).sort({ createdAt: -1 });

        const mergedData = initData.map(init => ({
            ...init.toObject(),
            company,
            requestData: requestData[0] || null
        }));

        return returnFormatter(true, "Init data with emp retrieved", mergedData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}


//--------------------------------------------  get file manger according to sir -----------------------------------------


export async function getfiles(reqObj) {
  try {
    const { serviceId, empId } = reqObj.user;
    const { partnerId, serviceId: referServiceId, dateFilter, startDate, endDate } = reqObj.query;

    // Base query
    const query = {
      serviceId: new mongoose.Types.ObjectId(serviceId),
      workStatus: "reportgenerated"
    };

    if (partnerId) query.partnerId = partnerId;
    if (referServiceId) query.referServiceId = referServiceId;

    // Date filter logic
    if (dateFilter) {
      const now = new Date();
      let start, end;

      switch (dateFilter) {
        case "today":
          start = new Date(now.setHours(0, 0, 0, 0));
          end = new Date(now.setHours(23, 59, 59, 999));
          break;
        case "thisWeek":
          const firstDayOfWeek = new Date(now);
          firstDayOfWeek.setDate(now.getDate() - now.getDay());
          firstDayOfWeek.setHours(0, 0, 0, 0);
          start = firstDayOfWeek;
          end = new Date();
          break;
        case "thisMonth":
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date();
          break;
        case "custom":
          if (startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
          }
          break;
      }

      if (start && end) {
        query.createdAt = { $gte: start, $lte: end };
      }
    }

    // Fetch init data
    const initData = await initModel.find(query)
      .populate({ path: "partnerId", model: "user", options: { strictPopulate: false } })
      .populate({ path: "doneBy", model: "employee", options: { strictPopulate: false } })
      .populate({ path: "allocatedOfficeEmp", model: "employee", options: { strictPopulate: false } })
      .populate({ path: "referServiceId", model: "service", options: { strictPopulate: false } })
      .populate({ path: "reportType", model: "userProduct", options: { strictPopulate: false } })
      .sort({ createdAt: -1 });

    if (!initData.length) {
      return returnFormatter(true, "No data found", []);
    }

  

    return returnFormatter(true, "Files fetched successfully", {
      partnerWiseData: formattedPartnerData,
      totalPartners: formattedPartnerData.length,
      company
    });

  } catch (error) {
    console.error("Error in getfiles:", error);
    return returnFormatter(false, error.message);
  }
}

//--------------------------------------------  get  invoice dashboard according to sir -----------------------------------------


export async function getInvoiceDashboard(reqObj) {
    try {
        const baseQuery = {
            organizationId: new mongoose.Types.ObjectId(reqObj.employee.organizationId),
            workStatus: "reportgenerated",
        };

        if (reqObj.query?.partnerId) {
            baseQuery.partnerId = reqObj.query.partnerId;
        }

        // Date filter handling
        if (reqObj.query?.dateFilter) {
            const now = new Date();
            let startDate, endDate;

            switch (reqObj.query.dateFilter) {
                case "today":
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    endDate = new Date(now.setHours(23, 59, 59, 999));
                    break;
                case "thisWeek":
                    const firstDayOfWeek = new Date(now);
                    firstDayOfWeek.setDate(now.getDate() - now.getDay());
                    firstDayOfWeek.setHours(0, 0, 0, 0);
                    startDate = firstDayOfWeek;
                    endDate = new Date();
                    break;
                case "thisMonth":
                    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    startDate = firstDayOfMonth;
                    endDate = new Date();
                    break;
                case "custom":
                    if (reqObj.query.startDate && reqObj.query.endDate) {
                        startDate = new Date(reqObj.query.startDate);
                        endDate = new Date(reqObj.query.endDate);
                        endDate.setHours(23, 59, 59, 999);
                    }
                    break;
            }

            if (startDate && endDate) {
                baseQuery.createdAt = {
                    $gte: startDate,
                    $lte: endDate
                };
            }
        }

        // Aggregate pipeline to get counts
        const counts = await initModel.aggregate([
            { $match: baseQuery },
            {
                $group: {
                    _id: "$paymentStatus",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Initialize counts
        let paidCount = 0;
        let unpaidCount = 0;

        counts.forEach(item => {
            if (item._id === "paid") paidCount = item.count;
            if (item._id === "unpaid") unpaidCount = item.count;
        });

        const totalCount = paidCount + unpaidCount;

        return returnFormatter(true, "Invoice counts retrieved successfully", {
            paidCount,
            unpaidCount,
            totalCount
        });
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}
