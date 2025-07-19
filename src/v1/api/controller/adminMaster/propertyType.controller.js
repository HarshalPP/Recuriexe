const { validationResult } = require("express-validator");
const customerModel = require("../../model/customer.model");
const propertyTypeModel = require("../../model/adminMaster/propertyType.model");  // Adjust the import based on your folder structure
const productModel = require('../../model/adminMaster/product.model')
const { success, badRequest, notFound, unknownError } = require("../../../../../globalHelper/response.globalHelper");

// ------------------------Admin Master Add Income Catagory---------------------------------------

async function PropertyTypeAdd(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        const { name  , documentsName} = req.body
        if (!name) {
            return badRequest(res, "Name Is Required")
        }
        const existingpropertyType = await propertyTypeModel.findOne({
            name: name.trim(),
        });
        if (existingpropertyType) {
            return badRequest(res, "Property Type Already Added");
        }
        
        if(!documentsName){
            return badRequest(res, "Documents Name Required");
        }
        const newPropertyType = await propertyTypeModel.create(req.body);

        success(res, "Property Type Added Successfully", newPropertyType);
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
}

async function PropertyTypeUpdate(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        const { name , propertyId , documentsName } = req.body
        if(!propertyId){
            return  badRequest(res, "property Is Required")
        }
        if (!name) {
            return badRequest(res, "Name Is Required")
        }
  
        if(!documentsName){
            return badRequest(res, "Documents Name Required");
        }
        const updatedPropertyType = await propertyTypeModel.findByIdAndUpdate(
            propertyId,
            { name: name.trim(),
                ...req.body
             },
            { new: true }
        );


        success(res, "Property Type Update Successfully", updatedPropertyType);
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
}

async function getAllPropertyType(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        const { page = 1, limit = 20, searchQuery = "" } = req.query;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        const searchQueryData = searchQuery ? { name: { $regex: searchQuery, $options: "i" } } : {};

        const propertyTypeDetail = await propertyTypeModel.find({ status: "active", ...searchQueryData })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);
        const totalCount = await propertyTypeModel.countDocuments({ status: "active", ...searchQueryData });

        const totalPages = Math.ceil(totalCount / limitNumber);

        success(res, "Get All property Types", {
            totalCount,
            Data:propertyTypeDetail,
            pagination: {
                totalPages,
                currentPage: pageNumber,
                pageSize: limitNumber
            }
        });
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
}

async function getPropertyTypeByProductId(req, res) {
    try {
        const productId = req.query.productId;

        if(!productId){
            return badRequest(res, "product id require");
        }
        const productDetail = await productModel.findById(productId).populate({ path: 'propertyTypeIds',select: 'name _id' });

        if (!productDetail) {
            return badRequest(res, "Property Type not found");
        }

        return success(res, "Property List successfully",
            { data: productDetail });
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
}


async function whichDocumentRequiredGetBycutomerId(req, res) {
    try {
        const {customerId} = req.query;

        if(!customerId){
            return badRequest(res, "Cutomer Is Required");
        }
        const customerDetail = await customerModel.findById(customerId).populate({ path: 'propertyTypeId',select: 'name _id documentsName' });

        if (!customerDetail) {
            return badRequest(res, "customer Not Found");
        }

        if (!customerDetail.propertyTypeId) {
            return badRequest(res, "Property Type Is Not Selected In This File");
        }

        return success(res, "required Document List", customerDetail );
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
}




module.exports = { PropertyTypeAdd , getPropertyTypeByProductId , PropertyTypeUpdate , getAllPropertyType , whichDocumentRequiredGetBycutomerId }