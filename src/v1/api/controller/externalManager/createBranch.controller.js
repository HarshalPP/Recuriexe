const {
    success,
    unknownError,
    serverValidation,
    badRequest,
    notFound,
} = require("../../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const externalBranchModel = require('../../model/externalManager/createBranch.mode')

// ------------------------External Manager Add Branch---------------------------------------
async function addBranch(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }
        if (req.body.branchName) {
            req.body.branchName = req.body.branchName.toLowerCase().trim();
            const branchFind = await externalBranchModel.findOne({branchName:req.body.branchName})
            if(branchFind){
                return badRequest(res ,"Branch Already Created")
            }
        }

        const branchDetail = await externalBranchModel.create(req.body);
        success(res, "branch Added Successful", branchDetail);
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
};

// ------------------ External Manager Branch "active" or "inactive" updated---------------------------------------
async function branchActiveOrInactive(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            serverValidation(res, { errorName: "serverValidation", errors: errors.array() });
        } else {
            const id = req.body.id;
            if (!id || id.trim() === "") {
                return badRequest(res, "ID is required and cannot be empty");
            }
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return badRequest(res, "Invalid ID");
            }
            const status = req.body.status
            if (status == "active") {
                const branchStatusUpdate = await externalBranchModel.findByIdAndUpdate({ _id: id }, { status: "active" }, { new: true })
                success(res, "Branch Active", branchStatusUpdate);
            }
            else if (status == "inactive") {
                const branchStatusUpdate = await externalBranchModel.findByIdAndUpdate({ _id: id }, { status: "inactive" }, { new: true })
                success(res, "Branch inactive", branchStatusUpdate);
            }
            else {
                return badRequest(res, "Status must be 'active' or 'inactive'");
            }
        }
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
}

// ------------------ External Manager Update  Branch ---------------------------------------

async function updateBranch(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }
        let { branchId} = req.query;
        if (typeof req.body.branchName === 'string') {
            req.body.branchName = req.body.branchName.trim().toLowerCase();
        }
        const updateData = await externalBranchModel.findByIdAndUpdate(branchId, req.body, { new: true });
        success(res, "Updated Branch", updateData);
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
};

// ------------------External Manager Get Branch Detai ---------------------------------------
async function branchDetail(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }
        const branchDetail = await externalBranchModel.findById(req.query.branchId)
        success(res, "Get Branch Detail", branchDetail);
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
};

// ------------------External Manager Get All branch---------------------------------------

async function getAllBranch(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }
        const branchList = await externalBranchModel.find({status:'active'})
        success(res, "Get All Branch", branchList);
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
};


module.exports = {
    addBranch,
    branchActiveOrInactive,
    updateBranch,
    branchDetail,
    getAllBranch,
};
