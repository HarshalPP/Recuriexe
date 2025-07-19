const { returnFormatter } = require("../formatter/common.formatter");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Assuming you're using JWT for login tokens
const cibilreportKycModel = require("../model/fileProcess/cibilScoreKyc.model")
const technicalReportKycModel = require("../model/fileProcess/technicalReportKyc.model")
const taggingKycModel = require("../model/fileProcess/taggingKyc.model")
const rcuKycModel = require("../model/fileProcess/rcuKyc.model")
const jainamKycModel = require("../model/fileProcess/jainamEntry.model")
const pdReportKycModel = require("../model/fileProcess/pdReportKyc.model")
const sentForSanctionKycModel = require("../model/fileProcess/sentForSanction.model")
const postDisbursementKycModel = require("../model/fileProcess/postDisbursement.model")
const sentForDisbursementModel = require("../model/fileProcess/sentForDisbursement.model")
const {cibilReportKycFormatter , technicalReportKycFormatter , taggingKycFormatter, rcuKycFormatter ,
    jainamKycFormatter,pdReportKycFormatter ,sentForSanctionFormatter ,postDisbursementFormatter ,sentForDisbursementFormatter
} = require("../formatter/allKycForm.formatter");
const employeModel = require("../model/adminMaster/employe.model");


async function employeeData(employeeId) {
    try {
        let returnData = await employeModel.findById(employeeId)
        return returnData ? returnData._id : false
    } catch (error) {
        return false;
    }
}

async function cibilReportKycForm(bodyData,employeeId) {
    try {

        const formattedData = cibilReportKycFormatter(bodyData,employeeId);
        const data = await cibilreportKycModel.findOne({LD:formattedData.LD})
        let saveData
       if(data){
        saveData = await cibilreportKycModel.findOneAndUpdate({ LD:data.LD }, formattedData, { new: true });
        return returnFormatter(true, "Cibil Report Kyc Form Updated Successfully", saveData);
       }
         saveData = await cibilreportKycModel.create(formattedData);
        return returnFormatter(true, "Cibil Report Kyc Form Submitted Sucessfully", saveData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}


async function technicalReportKycForm(bodyData,employeeId) {
    try {

        const formattedData = technicalReportKycFormatter(bodyData,employeeId);
        const data = await technicalReportKycModel.findOne({LD:formattedData.LD})
        let saveData
       if(data){
        saveData = await technicalReportKycModel.findOneAndUpdate({ LD:data.LD }, formattedData, { new: true });
        return returnFormatter(true, "Technical Report Kyc Form Updated Successfully", saveData);
       }
         saveData = await technicalReportKycModel.create(formattedData);
        return returnFormatter(true, "Technical Report Kyc Form Submitted Sucessfully", saveData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

async function taggingKycForm(bodyData,employeeId) {
    try {

        const formattedData = taggingKycFormatter(bodyData,employeeId);
        const data = await taggingKycModel.findOne({LD:formattedData.LD})
        let saveData
       if(data){
        saveData = await taggingKycModel.findOneAndUpdate({ LD:data.LD }, formattedData, { new: true });
        return returnFormatter(true, "Tagging Kyc Form Updated Successfully", saveData);
       }
         saveData = await taggingKycModel.create(formattedData);
        return returnFormatter(true, "Tagging Kyc Form Submitted Sucessfully", saveData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

async function rcuKycForm(bodyData,employeeId) {
    try {

        const formattedData = rcuKycFormatter(bodyData,employeeId);
        const data = await rcuKycModel.findOne({LD:formattedData.LD})
        let saveData
       if(data){
        saveData = await rcuKycModel.findOneAndUpdate({ LD:data.LD }, formattedData, { new: true });
        return returnFormatter(true, "RCU Kyc Form Updated Successfully", saveData);
       }
         saveData = await rcuKycModel.create(formattedData);
        return returnFormatter(true, "RCU Kyc Form Submitted Sucessfully", saveData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

async function jainamKycForm(bodyData,employeeId) {
    try {

        const formattedData = jainamKycFormatter(bodyData,employeeId);
        const data = await jainamKycModel.findOne({LD:formattedData.LD})
        let saveData
       if(data){
        saveData = await jainamKycModel.findOneAndUpdate({ LD:data.LD }, formattedData, { new: true });
        return returnFormatter(true, "Jainam Kyc Form Updated Successfully", saveData);
       }
         saveData = await jainamKycModel.create(formattedData);
        return returnFormatter(true, "Jainam Kyc Form Submitted Sucessfully", saveData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

async function pdReportKycForm(bodyData,employeeId) {
    try {

        const formattedData = pdReportKycFormatter(bodyData,employeeId);
        const data = await pdReportKycModel.findOne({LD:formattedData.LD})
        let saveData
       if(data){
        saveData = await pdReportKycModel.findOneAndUpdate({ LD:data.LD }, formattedData, { new: true });
        return returnFormatter(true, "PD Report Kyc Form Updated Successfully", saveData);
       }
         saveData = await pdReportKycModel.create(formattedData);
        return returnFormatter(true, "PD Report Kyc Form Submitted Sucessfully", saveData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

async function sentForSanctionKycForm(bodyData, employeeId) {
    try {
        const formattedData = sentForSanctionFormatter(bodyData, employeeId);
        const existingData = await sentForSanctionKycModel.findOne({ LD: formattedData.LD });

        let saveData;
        if (existingData) {
            saveData = await sentForSanctionKycModel.findOneAndUpdate(
                { LD: existingData.LD },
                formattedData,
                { new: true }
            );
            return { status: true, message: "Sent For Sanction Form Updated Successfully", data: saveData };
        }

        saveData = await sentForSanctionKycModel.create(formattedData);
        return { status: true, message: "Sent For Sanction Form Submitted Successfully", data: saveData };
    } catch (error) {
        return { status: false, message: error.message };
    }
}

async function postDisbursementKycForm(bodyData, employeeId) {
    try {
        const formattedData = postDisbursementFormatter(bodyData, employeeId);
        
        const existingData = await sentForDisbursementModel.findOne({ LD: formattedData.LD });
        
        let saveData;
        if (existingData) {
            saveData = await sentForDisbursementModel.findOneAndUpdate(
                { LD: existingData.LD },
                formattedData,
                { new: true }
            );
            return { status: true, message: "Post Disbursement KYC Form Updated Successfully", data: saveData };
        }
        
        saveData = await sentForDisbursementModel.create(formattedData);
        return { status: true, message: "Post Disbursement KYC Form Submitted Successfully", data: saveData };
    } catch (error) {
        return { status: false, message: error.message };
    }
}

async function sentForDisbursementKycForm(bodyData, employeeId) {
    try {
        const formattedData = sentForDisbursementFormatter(bodyData, employeeId);
        
        const existingData = await sentForDisbursementModel.findOne({ LD: formattedData.LD });
        
        let saveData;
        if (existingData) {
            saveData = await sentForDisbursementModel.findOneAndUpdate(
                { LD: existingData.LD },
                formattedData,
                { new: true }
            );
            return { status: true, message: "Sent For Disbursement KYC Form Updated Successfully", data: saveData };
        }
        
        saveData = await sentForDisbursementModel.create(formattedData);
        return { status: true, message: "Sent For Disbursement KYC Form Submitted Successfully", data: saveData };
    } catch (error) {
        return { status: false, message: error.message };
    }
}

module.exports = {
    employeeData,
    cibilReportKycForm,
    technicalReportKycForm,
    taggingKycForm,
    rcuKycForm,
    jainamKycForm,
    pdReportKycForm,
    sentForSanctionKycForm,
    postDisbursementKycForm,
    sentForDisbursementKycForm
};
