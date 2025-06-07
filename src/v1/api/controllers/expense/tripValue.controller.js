import { 
    created, 
    success, 
    badRequest, 
    notFound, 
    unknownError 
} from "../../helper/response.helper.js";
import { addTripValues, getAllTripsValues, updateTripValueById, getTripValueById } from "../../helper/expense/tripValue.helper.js"



// -------------------------- create Field -------------------------------


export async function saveTripValue(req, res) {
    try {
        const { status, message, data } = await addTripValues(req)
        return status ? created(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// // // -------------------------- update Field -------------------------------


export async function updateTripValue(req, res) {
    try {
        const { status, message, data } = await updateTripValueById(req?.body?.tripValueId,req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// // // // -------------------------- get Field -------------------------------


export async function getTripValue(req, res) {
    try {
        const { status, message, data } = await getTripValueById(req.params.id)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

// // // // -------------------------- get All Field -------------------------------


export async function getAllTripValue(req, res) {
    try {
        const { status, message, data } = await getAllTripsValues(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}



