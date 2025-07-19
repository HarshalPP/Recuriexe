const { validationResult } = require("express-validator");
const incomeCatagoryModel = require("../../model/adminMaster/incomeCatagory.model");
const productModel = require('../../model/adminMaster/product.model')
const propertyTypeModel = require("../../model/adminMaster/propertyType.model");  // Adjust the import based on your folder structure
const { success, badRequest, notFound, unknownError } = require("../../../../../globalHelper/response.globalHelper");


async function incomeCatagoryAdd(req, res) {
    try {

        const { name } = req.body;

        const existingCategory = await incomeCatagoryModel.findOne({ name: name.trim() });
        if (existingCategory) {
            return badRequest(res, "Income Category Already Exists.");
        }

        // if (!Array.isArray(propertyTypeIds)) {
        //     return badRequest(res, "Property Type IDs should be an array.");
        // }
        // if (!propertyTypeIds || propertyTypeIds.length === 0) {
        //     return badRequest(res, "Property Type IDs are required.");
        // }

        // const propertyTypesExist = await propertyTypeModel.find({ _id: { $in: propertyTypeIds } });
        // if (propertyTypesExist.length !== propertyTypeIds.length) {
        //     return badRequest(res, "Some Property Types are invalid or do not exist.");
        // }

        if (!name) {
            return badRequest(res, "Income Category Name is required.");
        }
        const newIncomeCategory = new incomeCatagoryModel({
            name: name.trim(),
            // propertyTypeIds,
        });

        const savedIncomeCategory = await newIncomeCategory.save();
        success(res, "Income Category Added Successfully", savedIncomeCategory);
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
}


async function incomeCatagoryUpdate(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        const { incomeCatagoryId, name } = req.body;

        // Check if the income category ID is provided
        if (!incomeCatagoryId) {
            return badRequest(res, "Income Category ID is required.");
        }

        // Check if the income category exists
        const existingCategory = await incomeCatagoryModel.findById(incomeCatagoryId);
        if (!existingCategory) {
            return badRequest(res, "Income Category not found.");
        }

        // Check if the name is provided and make sure it's valid
        if (!name) {
            return badRequest(res, "Income Category Name is required.");
        }

        // // Ensure propertyTypeIds is an array and validate
        // if (!Array.isArray(propertyTypeIds)) {
        //     return badRequest(res, "Property Type IDs should be an array.");
        // }
        // if (!propertyTypeIds || propertyTypeIds.length === 0) {
        //     return badRequest(res, "Property Type IDs are required.");
        // }

        // // Check if all propertyTypeIds exist in the propertyType collection
        // const propertyTypesExist = await propertyTypeModel.find({ _id: { $in: propertyTypeIds } });
        // if (propertyTypesExist.length !== propertyTypeIds.length) {
        //     return badRequest(res, "Some Property Types are invalid or do not exist.");
        // }

        // Update the income category with the new values
        const updatedIncomeCategory = await incomeCatagoryModel.findByIdAndUpdate(
            incomeCatagoryId,
            {
                name: name.trim(),
                // propertyTypeIds,
            },
            { new: true } // Ensure the updated document is returned
        );

        success(res, "Income Category Updated Successfully", updatedIncomeCategory);
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
}


async function getAllincomeCatagorys(req, res) {
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

        const incomeCatagoryDetail = await incomeCatagoryModel.find({ status: "active", ...searchQueryData })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);
        const totalCount = await incomeCatagoryModel.countDocuments({ status: "active", ...searchQueryData });
        
        const totalPages = Math.ceil(totalCount / limitNumber);

        success(res, "Get All Income Catagorys", {
            totalCount,
            incomeCatagoryDetail,
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

async function getIncomeCategoriesByProduct(req, res) {
    try {
        const productId = req.query.productId;

        const productDetail = await productModel.findById(productId).populate({ path: 'incomeCatagoryIds', select: 'name _id' });

        if (!productDetail) {
            return badRequest(res, "Product not found");
        }

        return success(res, "Income categories fetched successfully",
            { incomeCategories: productDetail });
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
}

async function updateincomeCatagory(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        let { incomeCatagoryId, ...updateFields } = req.body;

        if (!incomeCatagoryId) {
            return badRequest(res, "Income Catagory Id")
        }

        if (!name) {
            return badRequest(res, "Name Required")
        }
        const updatedincomeCatagory = await incomeCatagoryModel.findByIdAndUpdate(
            incomeCatagoryId,
            updateFields,
            { new: true }
        );

        // Success response
        success(res, "Updated Income Catagory", updatedincomeCatagory);
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
}

async function incomeCatagoryDetailById(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        const { incomeCatagoryId } = req.query
        if (!incomeCatagoryId) {
            return badRequest(res, "Income Catagory Id")
        }
        const incomeCatagoryDetail = await incomeCatagoryModel.findById(incomeCatagoryId);

        if (!incomeCatagoryDetail) {
            return badRequest(res, "Income Catagory Not Found");
        }

        success(res, "Get Income Catagory Detail", incomeCatagoryDetail);
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
}







module.exports = { incomeCatagoryAdd, getIncomeCategoriesByProduct , incomeCatagoryUpdate , getAllincomeCatagorys }