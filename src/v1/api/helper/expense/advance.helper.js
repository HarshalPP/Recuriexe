import { returnFormatter } from "../../formatters/common.formatter.js";
import { advanceFormatter } from "../../formatters/expense/advance.formatter.js";
import advancesPreferencesModel from "../../models/expense/advance.model.js";


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

export async function updateAdvanceFeatures(reportId,updateData) {
    try {
        const formattedData = advanceFormatter(updateData);
        console.log(formattedData,"formattedDataformattedData")
        const updatedfieldData = await advancesPreferencesModel.findOneAndUpdate(reportId,formattedData,{new:true, upsert:true}).populate('fields.fieldId')
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

export async function getAllAdvances() {
    try {
        const FieldData = await advancesPreferencesModel.find().sort({createdAt:-1}).populate('fields.fieldId');
        return returnFormatter(true, "Field data",FieldData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}
