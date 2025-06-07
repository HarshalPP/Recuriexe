import { returnFormatter } from "../../formatters/common.formatter.js";
import { expenseValueFormatter } from "../../formatters/expense/expenseValue.formatter.js";
import expenseValueModel from "../../models/expense/expenseValue.model.js";


//----------------------------   add Role ------------------------------

export async function saveExpenseValues(requestsObject) {
    try {
        const formattedData = expenseValueFormatter(requestsObject);
        const newTripData = await expenseValueModel.create(formattedData);
        return returnFormatter(true, "Trip created succesfully", newTripData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


// // --------------------- update Field -----------------------

export async function updateTripValueById(tripValueId,updateData) {
    try {
        const formattedData = expenseValueFormatter(updateData);
        console.log(formattedData,"formattedDataformattedData")
        const updatedfieldData = await expenseValueModel.findOneAndUpdate( { _id: tripValueId },formattedData,{new:true, upsert:true})
        return returnFormatter(true, "trip value updated succesfully", updatedfieldData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


// // // --------------------- get Field -----------------------

export async function getTripValueById(tripValueId) {
    try {
        const tripData = await TripsValueModel.findById(tripValueId)//.populate('fields.fieldId')  
        return returnFormatter(true, "Trip value data",tripData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


// // // --------------------- get all Field -----------------------

export async function getAllTripsValues(req) {
    try {
        const id = req.employee.id
        const FieldData = await TripsValueModel.find({employeeId:id}).sort({createdAt:-1})
        return returnFormatter(true, "trip value all data",FieldData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}
