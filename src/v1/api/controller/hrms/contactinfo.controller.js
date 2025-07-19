const ContactDetails = require("../../model/hrms/contact.model")
const { validationResult } = require('express-validator');
const { success, unknownError, serverValidation, badRequest } = require("../../../../../globalHelper/response.globalHelper");

async function addContactInfo(req, res){
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return serverValidation(res, errors.array());
        }
        const {
            NameOfOwner,
            ContactDetail,
            ResidentialAddress,
            AccountDetail,
            NameAsPerAccount,
            AccountNumber,
            IFSCCode,
            BankName,
            PmRent,
            AdvanceDepositedAmt,
            DateOfTransfer,
            UTRDetail,
            AgrrementUpload,
            DocumentsUpload,
            BranchFront,
            BranchInside1,
            BranchInside2,
            ApproachRoad
        } = req.body;

        const newContactInfo = new ContactDetails({
            NameOfOwner,
            ContactDetail,
            ResidentialAddress,
            AccountDetail,
            NameAsPerAccount,
            AccountNumber,
            IFSCCode,
            BankName,
            PmRent,
            AdvanceDepositedAmt,
            DateOfTransfer,
            UTRDetail,
            AgrrementUpload,
            DocumentsUpload,
            BranchFront,
            BranchInside1,
            BranchInside2,
            ApproachRoad
        });

        await newContactInfo.save();
        return success(res, "Contact Info added successfully", newContactInfo);
    } catch (error) {
        return unknownError(res, error.message);
    }
};


async function getAllContactInfo(req, res){
    try {
        const contacts = await ContactDetails.find()
        .sort({createdAt: -1});
        return success(res, "Contact Info retrieved successfully", contacts);
    } catch (error) {
        return unknownError(res, error.message);
    }
};


module.exports = {addContactInfo,getAllContactInfo};