import { returnFormatter } from "../formatters/common.formatter.js";
import { formatePartnerRequest } from "../formatters/partnerRequest/partnerRequest.formatter.js";
import partnerRequestModel from "../models/partnerRequestModel/partnerRequest.model.js";
import companyModel from "../models/companyModel/company.model.js";
import mongoose from "mongoose";
import userProductModel from "../models/userProduct/userProduct.model.js";
import formModel from "../models/formLibraryModel/formLibrary.model.js";
import { getAllUserProduct } from "./userProduct.helper.js";
import { getAllInitFields } from "./initFields.helper.js";
import OrganizationModel from "../models/organizationModel/organization.model.js";
import employeModel from "../models/employeemodel/employee.model.js";
import bcrypt from "bcrypt";
import roleModel from "../models/RoleModel/role.model.js";
import AiScreening from "../models/AiScreeing/AiScreening.model.js";
import PortalModel from "../models/PortalSetUp/portalsetup.js";
import {encryptPassword} from "../Utils/encrypt.js"
//----------------------------   send request ------------------------------

export async function requestSending(requestsObject) {  
    try {
        const formattedData = formatePartnerRequest(requestsObject);
        let senderId = requestsObject.employee.organizationId ;
        let isVendor = requestsObject.user.userType;

        if (isVendor == "client") {
            return returnFormatter(false, "Only vendor can send request");
        }

        // Validate sender and receiver IDs
        if (!senderId || !formattedData.receiverId) {
            return returnFormatter(false, "Please provide a valid ID.");
        }

        // Check for duplicate userProductId
        let isUniqueProduct = requestsObject.body.productForm.some((item, index, arr) =>
            arr.findIndex(prod => prod.userProductId === item.userProductId) !== index
        );

        if (isUniqueProduct) {
            return returnFormatter(false, "No multiple unique product allowed");
        }

        if (senderId === formattedData.receiverId) {
            return returnFormatter(false, "You cannot send a request to yourself.");
        }

        // Check if sender and receiver exist in the database
        const senderExists = await userModel.exists({ _id: senderId });
        const receiverExists = await userModel.exists({ _id: formattedData.receiverId });

        if (!senderExists || !receiverExists) {
            return returnFormatter(false, "Sender or receiver does not exist.");
        }

        // Check if a request already exists in either direction
        const existingRequest = await partnerRequestModel.findOne({
            $or: [
                { senderId: senderId, receiverId: formattedData.receiverId },
                { senderId: formattedData.receiverId, receiverId: senderId }
            ]
        }).lean();

        if (existingRequest) {
            return returnFormatter(false, "Request already sent.");
        }

        // Process all field types and replace with array of ObjectIds
        if (formattedData.productForm) {
            for (const product of formattedData.productForm) {
                const fieldGroups = ['initFields', 'allocationFields', 'agentFields', 'submitFields'];

                for (const group of fieldGroups) {
                    if (product[group]?.fields?.length) {
                        product[group].fields = await Promise.all(
                            product[group].fields.map(async (field) => {
                                if (field.fieldName) {
                                    // Check if a field already exists with same fieldName and dataType
                                    const existingField = await formModel.findOne({
                                        fieldName: field.fieldName,
                                        dataType: field.dataType
                                    }).lean();

                                    if (existingField) {
                                        return existingField._id;
                                    } else {
                                        const newField = await formModel.create({
                                            fieldName: field.fieldName,
                                            dataType: field.dataType
                                        });
                                        return newField._id;
                                    }
                                }

                                // If field is already an ObjectId or string id, use it directly
                                return field?.fieldId || field;
                            })
                        );
                    }
                }
            }
        }

        // Create a new request
        const newRequestData = await partnerRequestModel.create({ ...formattedData, senderId });

        return returnFormatter(true, addParternerRequestSuccessMessage);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}



//----------------------------   update request ------------------------------

export async function updateRequestInfo(requestsObject) {
    try {
        let isRequest = await partnerRequestModel.findById(requestsObject.body.requestId);
        if (!isRequest) {
            return returnFormatter(false, "No request found");
        }

        if (isRequest.status === "accepted") {
            return returnFormatter(false, "You cannot modify request after accepted");
        }

        let isUniqueProduct = requestsObject.body.productForm.some((item, index, arr) =>
            arr.findIndex(prod => prod.userProductId === item.userProductId) !== index
        );

        if (isUniqueProduct) {
            return returnFormatter(false, "No multiple unique product allowed");
        }

        // Process fields in productForm
        if (requestsObject.body.productForm) {
            for (const product of requestsObject.body.productForm) {
                const fieldGroups = ['initFields', 'allocationFields', 'agentFields', 'submitFields'];

                for (const group of fieldGroups) {
                    if (product[group]?.fields?.length) {
                        product[group].fields = await Promise.all(
                            product[group].fields.map(async (field) => {
                                if (field.fieldName) {
                                    const existingField = await formModel.findOne({
                                        fieldName: field.fieldName,
                                        dataType: field.dataType
                                    }).lean();

                                    return existingField
                                        ? existingField._id
                                        : (await formModel.create({
                                            fieldName: field.fieldName,
                                            dataType: field.dataType
                                        }))._id;
                                }

                                return field?.fieldId || field;
                            })
                        );
                    }
                }
            }
        }

        // Update the request with processed body
        await partnerRequestModel.findByIdAndUpdate(
            requestsObject.body.requestId,
            { ...requestsObject.body },
            { new: true }
        );

        return returnFormatter(true, "Request updated successfully");
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}



// ------------------------------- get all send by userId ----------------------

export async function getAllSendedRequests(requestsObject, status) {
    try {
        let query = { senderId: new mongoose.Types.ObjectId(requestsObject.user.serviceId) };
        if (status) {
            query.status = status;
        }

        let processData = await partnerRequestModel.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: "users",
                    localField: "receiverId",
                    foreignField: "_id",
                    as: "partner"
                }
            },
            { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "companies",
                    localField: "partner._id",
                    foreignField: "serviceId",
                    as: "company"
                }
            },
            { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
            {
                $unwind: {
                    path: '$productForm',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'forms',
                    let: {
                        allFields: {
                            $setUnion: [
                                '$productForm.initFields.fields',
                                '$productForm.allocationFields.fields',
                                '$productForm.agentFields.fields',
                                '$productForm.submitFields.fields'
                            ]
                        }
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ['$_id', '$$allFields'] }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                fieldName: 1,
                                dataType: 1
                            }
                        }
                    ],
                    as: 'formFields'
                }
            },
            {
                $addFields: {
                    'productForm.initFields.fields': {
                        $map: {
                            input: '$productForm.initFields.fields',
                            as: 'fieldId',
                            in: {
                                $let: {
                                    vars: {
                                        fieldObj: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$formFields',
                                                        as: 'form',
                                                        cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                    }
                                                }, 0
                                            ]
                                        }
                                    },
                                    in: {
                                        fieldName: '$$fieldObj.fieldName',
                                        dataType: '$$fieldObj.dataType'
                                    }
                                }
                            }
                        }
                    },
                    'productForm.allocationFields.fields': {
                        $map: {
                            input: '$productForm.allocationFields.fields',
                            as: 'fieldId',
                            in: {
                                $let: {
                                    vars: {
                                        fieldObj: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$formFields',
                                                        as: 'form',
                                                        cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                    }
                                                }, 0
                                            ]
                                        }
                                    },
                                    in: {
                                        fieldName: '$$fieldObj.fieldName',
                                        dataType: '$$fieldObj.dataType'
                                    }
                                }
                            }
                        }
                    },
                    'productForm.agentFields.fields': {
                        $map: {
                            input: '$productForm.agentFields.fields',
                            as: 'fieldId',
                            in: {
                                $let: {
                                    vars: {
                                        fieldObj: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$formFields',
                                                        as: 'form',
                                                        cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                    }
                                                }, 0
                                            ]
                                        }
                                    },
                                    in: {
                                        fieldName: '$$fieldObj.fieldName',
                                        dataType: '$$fieldObj.dataType'
                                    }
                                }
                            }
                        }
                    },
                    'productForm.submitFields.fields': {
                        $map: {
                            input: '$productForm.submitFields.fields',
                            as: 'fieldId',
                            in: {
                                $let: {
                                    vars: {
                                        fieldObj: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$formFields',
                                                        as: 'form',
                                                        cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                    }
                                                }, 0
                                            ]
                                        }
                                    },
                                    in: {
                                        fieldName: '$$fieldObj.fieldName',
                                        dataType: '$$fieldObj.dataType'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$_id',
                    doc: { $first: '$$ROOT' },
                    productForms: { $push: '$productForm' }
                }
            },
            {
                $addFields: {
                    'doc.productForm': '$productForms'
                }
            },
            {
                $replaceRoot: {
                    newRoot: '$doc'
                }
            }
        ]).sort({ createdAt: -1 });


        return returnFormatter(true, "Partner request retrieved successfully", processData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}



// ------------------------------- Get all partners by userId ----------------------

export async function getAllPartners(requestsObject) {
    try {

        const serviceId = new mongoose.Types.ObjectId(requestsObject.employee.organizationId);

        // Helper function to fetch partners based on role (sender or receiver)
        async function fetchPartners(query, partnerField) {
            return await partnerRequestModel.aggregate([
                { $match: query },
                {
                    $lookup: {
                        from: "organizations",
                        localField: partnerField,
                        foreignField: "_id",
                        as: "partner"
                    }
                },
                { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
         
     {
  $lookup: {
    from: "employees",
    localField: "partner._id",
    foreignField: "organizationId",
    as: "employee"
  }
},
{ $unwind: { path: "$employee", preserveNullAndEmptyArrays: true } },


            ]).sort({ createdAt: -1 });
        }

        // Fetch sent and received partner requests
        const sentPartners = await fetchPartners({ senderId: serviceId, status: "accepted" }, "receiverId");
        const receivedPartners = await fetchPartners({ receiverId: serviceId, status: "accepted" }, "senderId");

        // Normalize the data structure for both
        const formatPartners = (partners, isSent) =>
            partners.map(partner => ({
                ...partner,
                partnerId: isSent ? partner.receiverId : partner.senderId // Ensure uniform field naming
            }));

        const allPartners = [...formatPartners(sentPartners, true), ...formatPartners(receivedPartners, false)];

        return returnFormatter(true, "Accepted partners retrieved successfully", allPartners);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// ------------------------------- Get all partners by allocation Id ----------------------

export async function getAllPartnersByAllocation(requestsObject) {
    try {

        const serviceId = new mongoose.Types.ObjectId(requestsObject.user.serviceId);

        // Helper function to fetch partners based on role (sender or receiver)
        async function fetchPartners(query, partnerField) {
            return await partnerRequestModel.aggregate([
                { $match: query },
                {
                    $lookup: {
                        from: "users",
                        localField: partnerField,
                        foreignField: "_id",
                        as: "partner"
                    }
                },
                { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "companies",
                        localField: "partner._id",
                        foreignField: "serviceId",
                        as: "company"
                    }
                },
                { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
                {
                    $match: {
                        allocationId: { $in: [new mongoose.Types.ObjectId(requestsObject.user.empId)] }
                    }
                },
                { $sort: { createdAt: -1 } }
            ]);
        }


        // Fetch sent and received partner requests
        const sentPartners = await fetchPartners({ senderId: serviceId, status: "accepted" }, "receiverId");
        const receivedPartners = await fetchPartners({ receiverId: serviceId, status: "accepted" }, "senderId");

        // Normalize the data structure for both
        const formatPartners = (partners, isSent) =>
            partners.map(partner => ({
                ...partner,
                partnerId: isSent ? partner.receiverId : partner.senderId // Ensure uniform field naming
            }));

        const allPartners = [...formatPartners(sentPartners, true), ...formatPartners(receivedPartners, false)];

        return returnFormatter(true, "Accepted partners retrieved successfully", allPartners);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}


// ------------------------------- Get partners details by Id ----------------------

export async function getPartnersDetailsById(requestsObject) {
    try {


        let partnerData = await partnerRequestModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(requestsObject.query.requestId)
                }
            },
            {
                $lookup: {
                    from: "organizations",
                    localField: "receiverId",
                    foreignField: "_id",
                    as: "partner"
                }
            },
            { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
{ $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
 {
  $lookup: {
    from: "employees",
    localField: "partner._id",
    foreignField: "organizationId",
    as: "employee"
  }
},
{ $unwind: { path: "$employee", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    productForm: {
                        $filter: {
                            input: '$productForm',
                            as: 'form',
                            cond: { $eq: ['$$form.isChecked', true] }
                        }
                    }
                }
            },
            {
                $unwind: {
                    path: '$productForm',
                    preserveNullAndEmptyArrays: true   // Allow documents even if productForm is empty
                }
            },
            {
                $lookup: {
                    from: 'userproducts',
                    localField: 'productForm.userProductId',
                    foreignField: '_id',
                    as: 'userProduct'
                }
            },
            {
                $unwind: {
                    path: '$userProduct',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    'productForm.userProduct': '$userProduct'
                }
            },
            {
                $project: {
                    userProduct: 0
                }
            },
            {
                $lookup: {
                    from: 'form-libraries',
                    let: {
                        allFields: {
                            $cond: [
                                { $isArray: '$productForm.initFields.fields' },
                                {
                                    $setUnion: [
                                        '$productForm.initFields.fields',
                                        '$productForm.allocationFields.fields',
                                        '$productForm.agentFields.fields',
                                        '$productForm.submitFields.fields'
                                    ]
                                },
                                []
                            ]
                        }
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ['$_id', '$$allFields'] }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                fieldName: 1,
                                dataType: 1
                            }
                        }
                    ],
                    as: 'formFields'
                }
            },
            {
                $addFields: {
                    'productForm.initFields.fields': {
                        $cond: [
                            { $isArray: '$productForm.initFields.fields' },
                            {
                                $map: {
                                    input: '$productForm.initFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            },
                            []
                        ]
                    },
                    'productForm.allocationFields.fields': {
                        $cond: [
                            { $isArray: '$productForm.allocationFields.fields' },
                            {
                                $map: {
                                    input: '$productForm.allocationFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            },
                            []
                        ]
                    },
                    'productForm.agentFields.fields': {
                        $cond: [
                            { $isArray: '$productForm.agentFields.fields' },
                            {
                                $map: {
                                    input: '$productForm.agentFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            },
                            []
                        ]
                    },
                    'productForm.submitFields.fields': {
                        $cond: [
                            { $isArray: '$productForm.submitFields.fields' },
                            {
                                $map: {
                                    input: '$productForm.submitFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            },
                            []
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: '$_id',
                    doc: { $first: '$$ROOT' },
                    productForms: { $push: '$productForm' }
                }
            },
            {
                $addFields: {
                    'doc.productForm': {
                        $filter: {
                            input: '$productForms',
                            as: 'form',
                            cond: { $ne: ['$$form', null] }
                        }
                    }
                }
            },
            {
                $replaceRoot: {
                    newRoot: '$doc'
                }
            }
        ]).sort({ createdAt: -1 });


        return returnFormatter(true, "Accepted partners retrieved successfully", partnerData[0]);
    } catch (error) {

        return returnFormatter(false, error.message);
    }
}



// --------------------------------------form by product--------------

export async function getProductFormByProduct(requestsObject) {
      try {
        // Retrieve initFields and product data
        let initFields = await getAllInitFields(requestsObject);
        let productData = await getAllUserProduct(requestsObject);

        // Fetch partner data with enhanced aggregation
        let partnerData = await partnerRequestModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(requestsObject.query.requestId)
                }
            },
            {
                $lookup: {
                    from: "organizations",
                    localField: "receiverId",
                    foreignField: "_id",
                    as: "partner"
                }
            },
            { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    productForm: {
                        $filter: {
                            input: "$productForm",
                            as: "form",
                            cond: { $eq: ["$$form.isChecked", true] }
                        }
                    }
                }
            },
            { $unwind: { path: "$productForm", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "userproducts",
                    localField: "productForm.userProductId",
                    foreignField: "_id",
                    as: "userProduct"
                }
            },
            { $unwind: { path: "$userProduct", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    "productForm.userProduct": "$userProduct"
                }
            },
            // 🟢 START: Populate submitFields.fields with field details
            { $unwind: { path: "$productForm.submitFields.fields", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "form-libraries", // your collection with field details
                    localField: "productForm.submitFields.fields.fieldId",
                    foreignField: "_id",
                    as: "fieldDetails"
                }
            },
            { $unwind: { path: "$fieldDetails", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    "productForm.submitFields.fields.fieldName": "$fieldDetails.fieldName",
                    "productForm.submitFields.fields.dataType": "$fieldDetails.dataType",
                    "productForm.submitFields.fields.isRequired": "$fieldDetails.isRequired"
                }
            },
            {
                $project: {
                    "productForm.submitFields.fields.fieldId": 0,
                    "fieldDetails": 0
                }
            },
            {
                $group: {
                    _id: {
                        requestId: "$_id",
                        productFormId: "$productForm._id"
                    },
                    doc: { $first: "$$ROOT" },
                    fields: { $push: "$productForm.submitFields.fields" }
                }
            },
            {
                $addFields: {
                    "doc.productForm.submitFields.fields": {
                        $filter: {
                            input: "$fields",
                            as: "field",
                            cond: { $ne: ["$$field", {}] }
                        }
                    }
                }
            },
            { $replaceRoot: { newRoot: "$doc" } },
            // 🟢 END: submitFields.fields enriched
            {
                $group: {
                    _id: "$_id",
                    doc: { $first: "$$ROOT" },
                    productForms: { $push: "$productForm" }
                }
            },
            {
                $addFields: {
                    "doc.productForm": {
                        $filter: {
                            input: "$productForms",
                            as: "form",
                            cond: { $ne: ["$$form", null] }
                        }
                    }
                }
            },
            { $replaceRoot: { newRoot: "$doc" } }
        ]).sort({ createdAt: -1 });

    
        if (partnerData.length > 0 && Array.isArray(partnerData[0].productForm)) {
            // 🟢 Replace initFields in forms with dynamic data
            partnerData[0].productForm.forEach(form => {
                if (form.initFields) {
                    form.initFields.fields = initFields.data.map(field => ({
                        fieldName: field.fieldName,
                        dataType: field.dataType,
                        isRequired: field.isRequired
                    }));
                }
            });

            const existingForms = partnerData[0].productForm.filter(form =>
                productData.data.some(product =>
                    product._id.toString() === form.userProductId?.toString()
                )
            );

            const existingIds = existingForms.map(form => form.userProductId?.toString());

            const missingForms = productData.data
                .filter(product => !existingIds.includes(product._id.toString()))
                .map(product => {
                    const formEntry = {
                        userProductId: product._id.toString(),
                        productName: product.productName
                    };

                    formEntry.initFields = {
                        fields: initFields.data.map(field => ({
                            fieldName: field.fieldName,
                            dataType: field.dataType,
                            isRequired: field.isRequired
                        })),
                        isActive: true
                    };

 
                        formEntry.submitFields = { fields: [], isActive: true };
                    

                    return formEntry;
                });

            partnerData[0].productForm = [...existingForms, ...missingForms];

            // 🟢 Added: set formFields structure
            partnerData[0].formFields = initFields.data.map(field => ({
                fieldName: field.fieldName,
                dataType: field.dataType,
                isRequired: field.isRequired
            }));
        }

        return returnFormatter(true, "Accepted partners retrieved successfully", partnerData[0]);
    } 
     catch (error) {
        console.error(error);
        return returnFormatter(false, error.message);
    }
}

// ------------------------------- Get inactive product field by Id ----------------------

export async function getInactiveProduct(requestsObject) {
    try {


        let partnerData = await partnerRequestModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(requestsObject.query.requestId)
                }
            },
            {
                $addFields: {
                    productForm: {
                        $filter: {
                            input: '$productForm',
                            as: 'form',
                            cond: {
                                $and: [
                                    { $eq: ['$$form.isChecked', false] },
                                    { $eq: ['$$form.userProductId', new mongoose.Types.ObjectId(requestsObject.query.userProductId)] }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $unwind: {
                    path: '$productForm',
                    preserveNullAndEmptyArrays: false  // forcefully remove empty docs
                }
            },
            {
                $lookup: {
                    from: 'forms',
                    let: {
                        allFields: {
                            $setUnion: [
                                '$productForm.initFields.fields',
                                '$productForm.allocationFields.fields',
                                '$productForm.agentFields.fields',
                                '$productForm.submitFields.fields'
                            ]
                        }
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ['$_id', '$$allFields'] }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                fieldName: 1,
                                dataType: 1
                            }
                        }
                    ],
                    as: 'formFields'
                }
            },
            {
                $addFields: {
                    'productForm.initFields.fields': {
                        $map: {
                            input: '$productForm.initFields.fields',
                            as: 'fieldId',
                            in: {
                                $let: {
                                    vars: {
                                        fieldObj: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$formFields',
                                                        as: 'form',
                                                        cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                    }
                                                }, 0
                                            ]
                                        }
                                    },
                                    in: {
                                        fieldName: '$$fieldObj.fieldName',
                                        dataType: '$$fieldObj.dataType'
                                    }
                                }
                            }
                        }
                    },
                    'productForm.allocationFields.fields': {
                        $map: {
                            input: '$productForm.allocationFields.fields',
                            as: 'fieldId',
                            in: {
                                $let: {
                                    vars: {
                                        fieldObj: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$formFields',
                                                        as: 'form',
                                                        cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                    }
                                                }, 0
                                            ]
                                        }
                                    },
                                    in: {
                                        fieldName: '$$fieldObj.fieldName',
                                        dataType: '$$fieldObj.dataType'
                                    }
                                }
                            }
                        }
                    },
                    'productForm.agentFields.fields': {
                        $map: {
                            input: '$productForm.agentFields.fields',
                            as: 'fieldId',
                            in: {
                                $let: {
                                    vars: {
                                        fieldObj: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$formFields',
                                                        as: 'form',
                                                        cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                    }
                                                }, 0
                                            ]
                                        }
                                    },
                                    in: {
                                        fieldName: '$$fieldObj.fieldName',
                                        dataType: '$$fieldObj.dataType'
                                    }
                                }
                            }
                        }
                    },
                    'productForm.submitFields.fields': {
                        $map: {
                            input: '$productForm.submitFields.fields',
                            as: 'fieldId',
                            in: {
                                $let: {
                                    vars: {
                                        fieldObj: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$formFields',
                                                        as: 'form',
                                                        cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                    }
                                                }, 0
                                            ]
                                        }
                                    },
                                    in: {
                                        fieldName: '$$fieldObj.fieldName',
                                        dataType: '$$fieldObj.dataType'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$_id',
                    doc: { $first: '$$ROOT' },
                    productForms: { $push: '$productForm' }
                }
            },
            {
                $addFields: {
                    'doc.productForm': '$productForms'
                }
            },
            {
                $replaceRoot: {
                    newRoot: '$doc'
                }
            }
        ]).sort({ createdAt: -1 });

        return returnFormatter(true, "Accepted form data retrieved successfully", partnerData[0] ? partnerData[0].productForm[0] : null);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}





// ------------------------------- get all recieved by userId ----------------------

export async function getAllReceivedRequest(requestsObject, status) {
    try {
        let query = { receiverId: new mongoose.Types.ObjectId(requestsObject.user.serviceId) };
        if (status) {
            query.status = status;
        }

        let processData = await partnerRequestModel.aggregate([
            {
                '$match': query
            },
            {
                '$lookup': {
                    'from': 'users',
                    'localField': 'senderId',
                    'foreignField': '_id',
                    'as': 'sender'
                }
            },
            {
                '$unwind': {
                    'path': '$sender',
                    'preserveNullAndEmptyArrays': true
                }
            },
            {
                '$lookup': {
                    'from': 'companies',
                    'localField': 'sender._id',
                    'foreignField': 'serviceId',
                    'as': 'company'
                }
            },
            {
                '$unwind': {
                    'path': '$company',
                    'preserveNullAndEmptyArrays': true
                }
            },
            {
                '$lookup': {

                    'from': 'userProducts',
                    'localField': 'allProducts.userProductId',
                    'foreignField': '_id',
                    'as': 'userProductId'
                }
            },
            {
                '$unwind': {
                    'path': '$userProductId',
                    'preserveNullAndEmptyArrays': true
                }
            },

        ])
            .sort({ createdAt: -1 });





        return returnFormatter(true, "Received partner requests retrieved successfully", processData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}



// ------------------------------- update request status by reques Id ----------------------

export async function updateStatus(reqId, status) {
    try {

        const matchedData = await partnerRequestModel.findById(reqId, status);
        if (!matchedData) {
            return returnFormatter(false, ParternerRequestJobErrorMessage)
        }
        const updatedData = await partnerRequestModel.findByIdAndUpdate(reqId, { status: status }, { new: true });
        return returnFormatter(true, ParternerRequestUpdateSuccessMessage)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


//============================================ update partner forms =========================



export async function updatePartenerData(reqId, updateData) {
    try {
        if (!mongoose.Types.ObjectId.isValid(reqId)) {
            return returnFormatter(false, "Invalid request ID.");
        }

        const existingRequest = await partnerRequestModel.findById(reqId);
        if (!existingRequest) {
            return returnFormatter(false, "data not found");
        }

        const defaultData = await getAllInitFields(updateData);
        const defaultFields = defaultData.data || [];

        if (updateData.body.productForm && Array.isArray(updateData.body.productForm)) {
            for (const product of updateData.body.productForm) {
                if (!product.initFields) {
                    product.initFields = { fields: [] };
                }
                product.initFields.fields = [...defaultFields];

                const fieldGroups = ["initFields", "allocationFields", "agentFields", "submitFields"];

                for (const group of fieldGroups) {
                    if (product[group]?.fields?.length) {
                        const updatedFields = await Promise.all(
                            product[group].fields.map(async (field) => {
                                // Common extract
                                const fieldName = field.fieldName || field.fieldId;
                                const dataType = field.dataType || "string";
                                const isRequired = typeof field.isRequired === "boolean" ? field.isRequired : true;

                                // For submitFields (can contain complex objects)
                                if (group === "submitFields") {
                                    if (field.fieldName && field.dataType) {
                                        const existingForm = await formModel.findOne({
                                            fieldName: field.fieldName,
                                            dataType: field.dataType,
                                            isRequired
                                        }).lean();

                                        const formId = existingForm
                                            ? existingForm._id
                                            : (await formModel.create({
                                                fieldName: field.fieldName,
                                                dataType: field.dataType,
                                                isRequired
                                            }))._id;

                                        return {
                                            ...field,
                                            fieldId: formId,
                                            fieldName: undefined,
                                            dataType: undefined
                                        };
                                    }

                                    if (field.fieldId && mongoose.Types.ObjectId.isValid(field.fieldId)) {
                                        return field;
                                    }

                                    if (field.fieldId) {
                                        const existingForm = await formModel.findOne({
                                            fieldName,
                                            dataType,
                                            isRequired
                                        }).lean();

                                        const formId = existingForm
                                            ? existingForm._id
                                            : (await formModel.create({
                                                fieldName,
                                                dataType,
                                                isRequired
                                            }))._id;

                                        return { ...field, fieldId: formId };
                                    }
                                }

                                // Other groups: initFields, allocationFields, agentFields
                                if (field.fieldName && field.dataType) {
                                    const existingForm = await formModel.findOne({
                                        fieldName: field.fieldName,
                                        dataType: field.dataType,
                                        isRequired
                                    }).lean();

                                    return existingForm
                                        ? existingForm._id
                                        : (await formModel.create({
                                            fieldName: field.fieldName,
                                            dataType: field.dataType,
                                            isRequired
                                        }))._id;
                                }

                                return field?.fieldId || field;
                            })
                        );

                        product[group].fields = updatedFields;
                    }
                }
            }
        }

        const updatedRequest = await partnerRequestModel.findByIdAndUpdate(
            reqId,
            { ...updateData.body },
            { new: true }
        );

        return returnFormatter(true, "Data updated succesfully", updatedRequest);
    } catch (error) {
        console.error("Error in updatePartenerData:", error);
        return returnFormatter(false, error.message);
    }
}


//============================================ update partner forms =========================

export async function updatePartenerProduct(reqId, updateData) {
    try {
        const matchedData = await partnerRequestModel.findById(reqId);
        if (!matchedData) {
            return returnFormatter(false, "Data not found");
        }

        // Process productForm field groups like in other handlers
        if (updateData.body.productForm) {
            for (const product of updateData.body.productForm) {
                const { productName } = product.productDetails;
                const createdProduct = await userProductModel.findByIdAndUpdate(new mongoose.Types.ObjectId(product.userProductId), { productName: productName })
                // const fieldGroups = ['initFields', 'allocationFields', 'agentFields', 'submitFields'];

                // for (const group of fieldGroups) {
                //     if (product[group]?.fields?.length) {
                //         product[group].fields = await Promise.all(
                //             product[group].fields.map(async (field) => {
                //                 if (field.fieldName) {
                //                     const existingField = await formModel.findOne({
                //                         fieldName: field.fieldName,
                //                         dataType: field.dataType
                //                     }).lean();

                //                     return existingField
                //                         ? existingField._id
                //                         : (await formModel.create({
                //                             fieldName: field.fieldName,
                //                             dataType: field.dataType
                //                         }))._id;
                //                 }

                //                 return field?.fieldId || field;
                //             })
                //         );
                //     }
                // }
            }
        }

        return returnFormatter(true, "partner product updated succesfully");
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}



//============================================ update partner details =========================

export async function updatePartDetails(partnerId, updateData) {
    try {
        const user = await employeModel.findOne({organizationId:new mongoose.Types.ObjectId(partnerId)});

        if (!user) {
            return returnFormatter(false, "No user found");
        }


        const { userName, email, password, companyName } = updateData.body;

        // Check if password has changed
        if (password === user.password) {
            await employeModel.findByIdAndUpdate(user._id, {
                ...updateData.body
            });
        } else {
            const encryptedPassword = encryptPassword(password);
            await userModel.findByIdAndUpdate(user._id, {
                userName,
                email,
                password: encryptedPassword
            });
        }

        await OrganizationModel.findOneAndUpdate(
            { organizationId:user.organizationId },
            { ...updateData.body }
        );

        return returnFormatter(true, "Updated succesfully");
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}





//============================================ unchecked user product =========================
export async function getUncheckedUserProduct(reqId, updateData) {
    try {
        const matchedData = await partnerRequestModel.findById(reqId);
        if (!matchedData) {
            return returnFormatter(false, "Partner request not found");
        }

        const checkedProductIds = new Set(
            matchedData.productForm
                .filter(item => item.isChecked)
                .map(item => item.userProductId.toString())
        );

        // Fetch user products based on serviceId
        let productData = await userProductModel.find({ organizationId: updateData.user.serviceId, isActive: true })
            .populate({
                path: "productId",
                model: "product",
                options: { strictPopulate: false }
            })
            .sort({ createdAt: -1 });

        // Filter out products that are already checked
        let filteredProducts = productData.filter(product => !checkedProductIds.has(product._id.toString()));

        return returnFormatter(true, "User product data", filteredProducts);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}



// ------------------------------- Get all users for partners ----------------------

export async function getAllUsersForPartners(requestsObject) {
    try {
        // Fetch all users except the current user
        let allUsers
        allUsers = await userModel.find({
            _id: { $ne: requestsObject.user.serviceId },
            demoAccount: false
        });


        let isDemoUser = await userModel.findById(requestsObject.user.serviceId);
        if (isDemoUser.demoAccount) {
            allUsers = await userModel.find({
                _id: { $ne: requestsObject.user.serviceId },
                demoAccount: true
            });
        }

        // Fetch company data and check partnership requests
        let filteredUsers = await Promise.all(
            allUsers.map(async (user) => {
                let companyData = await companyModel.findOne({ serviceId: user._id });

                // If user has no company, exclude them
                if (!companyData) return null;

                // Check if a partnership request exists
                let isExist = await partnerRequestModel.findOne({
                    senderId: requestsObject.user.serviceId,
                    receiverId: user._id
                });

                // If a partnership request exists, exclude this user
                if (isExist) return null;

                return {
                    ...user.toObject(),
                    companyData,
                };
            })
        );

        // Remove null values (users with existing partnership requests or without companies)
        filteredUsers = filteredUsers.filter(user => user !== null);

        return returnFormatter(true, "Partners retrieved successfully", filteredUsers);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}


// -------------------------------  create client ---------------------------------



// Helper function to get or create form field
async function getOrCreateFormField(field) {
    const { fieldName, dataType, isRequired = true } = field;

    const existingField = await formModel.findOne({
        fieldName,
        dataType,
        isRequired
    }).lean();

    if (existingField) return existingField._id;

    const createdField = await formModel.create({ fieldName, dataType, isRequired });
    return createdField._id;
}

// -------------------------------------------  create client -------------------------------------

export async function createClient(requestObject) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      userName,
      email,
      employeName,
      password,
      OrganizationModule,
      companyName,
      companyLogo,
      registeredAddress,
      corporateAddress,
      mobileNo,
      cinNumber,
      reportingCommunication,
      invoiceCommunication,
      physicalReportCommunication,
      invoiceCycle,
      invoiceRaise,
      invoiceStartDate,
      invoiceEndDate,
      gstin,
      enach,
      sign,
      productForm,
      allocationId
    } = requestObject.body;

    // Check if user already exists
    const existingUser = await employeModel.findOne({
      $or: [
        { email },
        { userName }
      ]
    }).session(session);

    if (existingUser) {
      return returnFormatter(false,"Email or username already exists.");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create organization
    const newOrganization = await new OrganizationModel({
      name: companyName,
      logo: companyLogo,
      registeredAddress,
      corporateAddress,
      contactNumber : mobileNo,
      cinNumber,
      reportingCommunication: {
        communicationTo: reportingCommunication?.reportingCommunicationTo,
        communicationCC: reportingCommunication?.reportingCommunicationCC
      },
      invoiceCommunication: {
        communicationTo: invoiceCommunication?.invoiceCommunicationTo,
        communicationCC: invoiceCommunication?.invoiceCommunicationCC
      },
      physicalReportCommunication: {
        communicationTo: physicalReportCommunication?.physicalReportCommunicationTo,
        communicationCC: physicalReportCommunication?.physicalReportCommunicationCC
      },
      invoiceCycle,
      invoiceRaise,
      invoiceStartDate,
      invoiceEndDate,
      gstin,
      enach,
      sign
    }).save({ session });

    // Create admin role with all boolean values true
    const adminRole = new roleModel({
      roleName: "ClientAdmin",
      status: "active",
      organizationId: newOrganization._id
    });

    const allKeys = Object.keys(adminRole.toObject());
    allKeys.forEach(key => {
      const value = adminRole[key];
      if (typeof value === "boolean") {
        adminRole[key] = true;
      } else if (typeof value === "object" && value !== null) {
        Object.keys(value).forEach(subKey => {
          if (typeof value[subKey] === "boolean") {
            value[subKey] = true;
          }
        });
      }
    });

    await adminRole.save({ session });

    // Create employee
    const newEmployee = await new employeModel({
      userName,
      email,
      employeName,
      password: hashedPassword,
      UserType: "Client",
      mobileNo,
      roleId: adminRole._id,
      status: 'active',
      organizationId: newOrganization._id,
      OrganizationModule
    }).save({ session });

    // Update organization with userId and carrierlink
    newOrganization.userId = newEmployee._id;
    newOrganization.carrierlink = `${process.env.PORTAL_PAGE}/${newOrganization._id}`;
    await newOrganization.save({ session });

    // Create AI screening config
    const defaultAiScreening = new AiScreening({
      organizationId: newOrganization._id,
      name: "AI Configuration & Settings",
      description: "Configure AI model parameters, screening criteria, and automation settings",
      coreSettings: {
        qualificationThreshold: 50,
        automaticScreening: true
      },
      screeningCriteria: [
        { name: "Skills", weight: 20, description: "Check relevant technical skills match" },
        { name: "Experience", weight: 20, description: "Evaluate professional experience for the job" },
        { name: "Education", weight: 20, description: "Validate minimum education requirement" },
        { name: "Certifications", weight: 20, description: "Check for relevant certifications" },
        { name: "Project Exposure", weight: 0, description: "Assess involvement in relevant projects" },
        { name: "Leadership_Initiative", weight: 0, description: "Assess leadership or initiative traits" },
        { name: "Cultural_Fit", weight: 0, description: "Evaluate alignment with company values" },
        { name: "Communication_Skills", weight: 20, description: "Assess clarity and professionalism in communication" },
        { name: "Learning_Ability", weight: 0, description: "Evaluate continuous learning and adaptability" }
      ],
      createdBy: newEmployee._id,
      isActive: true
    });
    await defaultAiScreening.save({ session });

    // Create portal
    await new PortalModel({
      organizationId: newOrganization._id,
      bannerPhoto: "https://cdn.fincooper.in/STAGE/HRMS/IMAGE/1750155569228_Banner.png"
    }).save({ session });

    // Create company
    if (!companyName) throw new Error("Please provide a company name");

 

    // Product setup
    if (productForm) {
      for (const product of productForm) {
        const { productName, moduleId } = product.productDetails;
        const createdProduct = await userProductModel.create([{
          productName,
          moduleId,
          organizationId: requestObject.employee.organizationId
        }], { session });

        product.userProductId = createdProduct[0]._id;

        const fieldGroups = ['initFields', 'allocationFields', 'agentFields', 'submitFields'];
        for (const group of fieldGroups) {
          if (product[group]?.fields?.length) {
            const updatedFields = await Promise.all(
              product[group].fields.map(async (field) =>
                (typeof field === 'object' && field.fieldName)
                  ? getOrCreateFormField(field)
                  : (field?.fieldId || field)
              )
            );
            product[group].fields = updatedFields;
          }
        }
      }
    }

    // Partner request
    const reqData = await partnerRequestModel.create([{
      senderId: requestObject.employee.organizationId,
      receiverId: newOrganization._id,
      status: "accepted",
      productForm,
      allocationId
    }], { session });

    // ✅ COMMIT
    await session.commitTransaction();
    session.endSession();

    return returnFormatter(true, "Client added successfully", reqData[0]);

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return returnFormatter(false, error.message);
  }
}


