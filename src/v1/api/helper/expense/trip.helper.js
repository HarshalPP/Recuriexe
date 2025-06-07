import { returnFormatter } from "../../formatters/common.formatter.js";
import { tripFormatter } from "../../formatters/expense/trip.formatter.js";
import TripsPreferencesModel from "../../models/expense/trip.model.js";


//----------------------------   add Role ------------------------------

export async function addTrip(requestsObject) {
    try {
        const formattedData = tripFormatter(requestsObject);
        const newTripData = await TripsPreferencesModel.create({...formattedData,createdBy:requestsObject.employee.id});
        return returnFormatter(true, "Trip created succesfully", newTripData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


// // --------------------- update Field -----------------------

export async function updateFieldById(fieldId,updateData) {
    try {
        const formattedData = tripFormatter(updateData);
        console.log(formattedData,"formattedDataformattedData")
        const updatedfieldData = await TripsPreferencesModel.findOneAndUpdate(fieldId,formattedData,{new:true, upsert:true}).populate('fields.fieldId')
        return returnFormatter(true, "field updated succesfully", updatedfieldData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


// // // --------------------- get Field -----------------------

export async function getTripById(tripId) {
    try {
        const tripData = await TripsPreferencesModel.findById(tripId).populate('fields.fieldId')  
        return returnFormatter(true, "Trip data",tripData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


// // // --------------------- get all Field -----------------------

export async function getAllTrips() {
    try {
        const FieldData = await TripsPreferencesModel.find().sort({createdAt:-1}).populate('fields.fieldId');
        return returnFormatter(true, "Field data",FieldData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}
