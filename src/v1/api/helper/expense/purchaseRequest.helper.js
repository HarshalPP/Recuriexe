import { returnFormatter } from "../../formatters/common.formatter.js";
import { purchaseFormatter } from "../../formatters/expense/purchaseRequest.formatter.js";
import purchaseRequestModel from "../../models/expense/purchaseRequest.model.js";


//----------------------------   add Role ------------------------------

export async function addTrip(requestsObject) {
    try {
        const formattedData = expenseFormatter(requestsObject);
        const newTripData = await expensePreferencessModel.create({...formattedData,createdBy:requestsObject.employee.id});
        return returnFormatter(true, "Trip created succesfully", newTripData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


// // --------------------- update Field -----------------------

export async function updatePurchaseRequest(purchaseId,updateData) {
    try {
        const formattedData = purchaseFormatter(updateData);
        console.log(formattedData,"formattedDataformattedData")
        const updatedfieldData = await purchaseRequestModel.findOneAndUpdate(purchaseId,formattedData,{new:true, upsert:true}).populate('fields.fieldId')
        return returnFormatter(true, "purchase updated succesfully", updatedfieldData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


// // // --------------------- get Field -----------------------

export async function getTripById(tripId) {
    try {
        const tripData = await purchaseRequestModel.findById(tripId).populate('fields.fieldId')  
        return returnFormatter(true, "Trip data",tripData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


// // // --------------------- get all Field -----------------------

export async function getAllPurchases() {
    try {
        const FieldData = await purchaseRequestModel.find().sort({createdAt:-1}).populate('fields.fieldId');
        return returnFormatter(true, "purchase data",FieldData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}
