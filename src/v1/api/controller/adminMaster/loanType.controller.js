const { validationResult } = require("express-validator");
const loanTypeModel = require("../../model/adminMaster/loanType.model");
const { success, badRequest, unknownError } = require("../../../../../globalHelper/response.globalHelper");

// ------------------------Admin Master Add Loan Type---------------------------------------

async function loanTypeAdd(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        const { name , paymentRequired } = req.body
        if (!name) {
            return badRequest(res, "Name Is Required")
        }

        if(!paymentRequired){
            return badRequest(res, "Payment Is Required")
        }
        const existingLoaype = await loanTypeModel.findOne({
            name: name.trim(),
        });
        if (existingLoaype) {
            return badRequest(res, "Loan Type Already Added");
        }

        const newLoanType = await loanTypeModel.create(req.body);

        success(res, "Loan Type Added Successfully", newLoanType);
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
}

async function updateLoanType(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        let { loanTypeId, name , ...updateFields } = req.body;

        if (!loanTypeId) {
            return badRequest(res, "Loan Type Id")
        }

        if (!name) {
            return badRequest(res, "Name Required")
        }
        const updatedLoanType = await loanTypeModel.findByIdAndUpdate(
            loanTypeId,
            updateFields,
            { new: true }
        );

        // Success response
        success(res, "Updated Loan Type", updatedLoanType);
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
}

async function loanTypeDetailById(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        const { loanTypeId } = req.query
        if (!loanTypeId) {
            return badRequest(res, "Loan Type Id")
        }
        const loanTypeDetail = await loanTypeModel.findById(loanTypeId);

        if (!loanTypeDetail) {
            return badRequest(res, "loan Type Not Found");
        }

        success(res, "Get loan Type Detail", loanTypeDetail);
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
}


async function getAllLoanTypes(req, res) {
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

        const loanTypeDetail = await loanTypeModel.find({ status: "active", ...searchQueryData })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);
        const totalCount = await loanTypeModel.countDocuments({ status: "active", ...searchQueryData });

        const totalPages = Math.ceil(totalCount / limitNumber);

        success(res, "Get All Loan Types", {
            totalCount,
            loanTypeDetail,
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


module.exports = { loanTypeAdd, updateLoanType, loanTypeDetailById, getAllLoanTypes }