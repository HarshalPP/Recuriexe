
const {
    success,
    unknownError,
    serverValidation,
    badRequest,
    notFound,
    parseJwt
} = require("../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const coApplicantModel = require("../model/co-Applicant.model");
const applicantModel = require("../model/applicant.model.js");
const guarantorModel = require("../model/guarantorDetail.model");
const referenceModel = require("../model/reference.model");
const bankAccountModel = require("../model/banking.model");
const cibilModel = require("../model/cibilDetail.model.js");
const salesCaseModel = require("../model/salesCase.model.js");

const customerModel = require("../model/customer.model");
const bankModel = require('../model/bankAccount.model.js')
const productModel = require("../model/adminMaster/product.model");
const processModel = require("../model/process.model.js");
const { createOrder } = require("../services/razorpay.js");
const { updateFileFields } = require('./functions.Controller.js')
const employeModel = require('../model/adminMaster/employe.model.js')
const aadharModel = require('../model/aadhaar.model.js')
const aadharOcrModel = require('../model/aadhaarOcr.model.js')
const panFatherModel = require('../model/panFather.model.js')
const panComprehensiveModel = require('../model/panComprehensive.model.js')
const permissionModel = require('../model/adminMaster/permissionForm.model.js')
const leadGenerateModel = require('../model/leadGenerate.model.js')
const employeeModel = require('../model/adminMaster/employe.model.js')


const { applicantGoogleSheetList, coApplicantGoogleSheetList,
    guarantorGoogleSheetList, referenceGoogleSheetList,
    bankDetailGoogleSheetList, salesCaseDetailGoogleSheetList } = require("../controller/googleSheet.controller.js")



async function applicantList(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return serverValidation(res, {
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }
        const customerId = '6697ba1fdea34ac072366fee'
        let applicantDetail = await applicantModel.find()
        .populate({ path: "customerId", select: "customerFinId _id" });
        success(res, "Applicant List", applicantDetail);
        await applicantGoogleSheetList(applicantDetail)
    } catch (error) {
        console.log(error);
        return unknownError(res, error);
    }
}

async function coApplicantList(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return serverValidation(res, {
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }
        let applicantDetail = await coApplicantModel.find().lean();
        return success(res, "Applicant List", applicantDetail);

    } catch (error) {
        console.log(error);
        return unknownError(res, error);
    }
}

async function guarantorList(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return serverValidation(res, {
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }
        const guarantorDetail = await guarantorModel.find().lean()
        return success(res, "guarantor List", guarantorDetail);
    } catch (error) {
        console.log(error);
        return unknownError(res, error);
    }
}

async function referenceList(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return serverValidation(res, {
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }
        const referenceDetail = await referenceModel.find()
        return success(res, "reference List", referenceDetail);
    } catch (error) {
        console.log(error);
        return unknownError(res, error);
    }
}

async function bankList(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return serverValidation(res, {
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }
        const bankDetail = await bankAccountModel.find()
        return success(res, "bank Form List", bankDetail);
    } catch (error) {
        console.log(error);
        return unknownError(res, error);
    }
}

async function SalesCaseList(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: false,
                subCode: 400,
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }
        const salesCaseDetail = await salesCaseModel.find();
        return badRequest(res, "Sales Case List", salesCaseDetail);
    } catch (error) {
        console.log(error);
        return unknownError(res, error);
    }
}

module.exports = {
    applicantList,
    coApplicantList,
    guarantorList,
    referenceList,
    bankList,
    SalesCaseList,
};
