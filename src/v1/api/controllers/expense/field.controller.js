import { 
    created, 
    success, 
    badRequest, 
    notFound, 
    unknownError 
} from "../../helper/response.helper.js";
import { addField, getAllFields, getFieldById, updateFieldById } from "../../helper/expense/field.helper.js"



// -------------------------- create Field -------------------------------


export async function savefield(req, res) {
    try {
        const { status, message, data } = await addField(req)
        return status ? created(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// // // -------------------------- update Field -------------------------------


export async function updateField(req, res) {
    try {
        const { status, message, data } = await updateFieldById(req.body.id,req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// // // -------------------------- get Field -------------------------------


export async function getField(req, res) {
    try {
        const { status, message, data } = await getFieldById(req.params.id)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

// // // -------------------------- get All Field -------------------------------


export async function getAllField(req, res) {
    try {
        const { status, message, data } = await getAllFields(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}



