import { 
    created, 
    success, 
    badRequest, 
    notFound, 
    unknownError 
} from "../../helper/response.helper.js";
import {  updateReports, getAllReports } from "../../helper/expense/report.helper.js"




// -------------------------- create Field -------------------------------


export async function saveTrip(req, res) {
    try {
        const { status, message, data } = await addTrip(req)
        return status ? created(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// // // -------------------------- update Field -------------------------------


export async function updateReport(req, res) {
    try {
        const { status, message, data } = await updateReports(req?.body?.id,req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// // // // -------------------------- get Field -------------------------------

export async function getTrip(req, res) {
    try {
        const { status, message, data } = await getTripById(req.params.id)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

// // // // -------------------------- get All Field -------------------------------


export async function getAllReport(req, res) {
    try {
        const { status, message, data } = await getAllReports()
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

