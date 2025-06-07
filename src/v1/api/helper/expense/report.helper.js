import { returnFormatter } from "../../formatters/common.formatter.js";
import { reportFormatter } from "../../formatters/expense/report.formatter.js";
import reportPreferencessModel from "../../models/expense/report.model.js";



//----------------------------   add Role ------------------------------

export async function addTrip(requestsObject) {
    try {
        const formattedData = expenseFormatter(requestsObject);
        const newTripData = await reportPreferencessModel.create({...formattedData,createdBy:requestsObject.employee.id});
        return returnFormatter(true, "Trip created succesfully", newTripData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


// // --------------------- update Field -----------------------

export async function updateReports(reportId,updateData) {
    try {
        const formattedData = reportFormatter(updateData);
        console.log(formattedData,"formattedDataformattedData")
        const updatedfieldData = await reportPreferencessModel.findOneAndUpdate(reportId,formattedData,{new:true, upsert:true}).populate('fields.fieldId')
        return returnFormatter(true, "expense updated succesfully", updatedfieldData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


// // // --------------------- get Field -----------------------

export async function getTripById(tripId) {
    try {
        const tripData = await reportPreferencessModel.findById(tripId).populate('fields.fieldId')  
        return returnFormatter(true, "Trip data",tripData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


// // // --------------------- get all Field -----------------------

export async function getAllReports() {
    try {
        const FieldData = await reportPreferencessModel.find().sort({createdAt:-1}).populate('fields.fieldId');
        return returnFormatter(true, "Field data",FieldData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}
