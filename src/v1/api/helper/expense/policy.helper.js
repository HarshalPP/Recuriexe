import { returnFormatter } from "../../formatters/common.formatter.js";
import { policyValueFormatter } from "../../formatters/expense/policy.formatter.js";
import policyValueModel from "../../models/expense/policy.model.js";
import employeModel from "../../models/employeemodel/employee.model.js";
import mongoose from "mongoose"


//----------------------------   add Role ------------------------------

export async function addPolicyValues(requestsObject) {
    try {
        const formattedData = policyValueFormatter(requestsObject);
        const data = await policyValueModel.findOne({name: formattedData.name})
        if(data){
            return returnFormatter(false, "policy name is already exist");
        }
        const newTripData = await policyValueModel.create(formattedData);
        return returnFormatter(true, "Policy created succesfully", newTripData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


// // --------------------- update Field -----------------------

export async function updatePolicyById(PolicyId,updateData) {
    try {
        const formattedData = policyValueFormatter(updateData);
        // const data = await policyValueModel.findOne({name: formattedData.name})
        // if(data){
        //     return returnFormatter(false, "policy name is already exist");
        // }
        // console.log(formattedData,"formattedDataformattedData")
        const updatedfieldData = await policyValueModel.findOneAndUpdate(  { _id: PolicyId } ,formattedData,{new:true})
        return returnFormatter(true, "Policy updated succesfully", updatedfieldData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


// // // --------------------- get Field -----------------------

export async function getPolicyById(PolicyId) {
    try {
        const tripData = await policyValueModel.findById(PolicyId) 
        .populate('policyAdmins', 'employeName')
        .populate('createdBy', 'employeName'); 
        return returnFormatter(true, "Policye data",tripData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


// // // --------------------- get all Field -----------------------

export async function getAllPolicies(req) {
    try {
        const id = req.employee.id
        const FieldData = await policyValueModel.find({}).sort({createdAt:-1})
        .populate('policyAdmins', 'employeName')
        .populate('createdBy', 'employeName');
        return returnFormatter(true, "Policy all data",FieldData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}

export async function employeeAllDetails(req) {
    try {
        const FieldData = await employeModel.find({}).sort({createdAt:-1}).select('employeName')
        return returnFormatter(true, "Employee all data",FieldData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}