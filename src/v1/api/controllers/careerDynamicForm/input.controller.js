import { addField, deleteFieldById, getAllFields, getFieldById, updateFieldById } from "../../helper/inputField.helper.js"
import { badRequest, created, notFound, success, unknownError } from "../../helper/response.helper.js"



// -------------------------- create input -------------------------------


export async function saveInput(req, res) {
    try {
        const { status, message, data } = await addField(req)
        return status ? created(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

// -------------------------- update input -------------------------------


export async function updateInput(req, res) {
    try {
        const { status, message, data } = await updateFieldById(req.body.id,req.body)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// -------------------------- delete input -------------------------------


export async function deleteInput(req, res) {
    try {
        const { status, message, data } = await deleteFieldById(req.params.id)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// -------------------------- get input -------------------------------


export async function getInputById(req, res) {
    try {
        const { status, message, data } = await getFieldById(req.params.id)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// -------------------------- get all -------------------------------


export async function getAllnputById(req, res) {
    try {
        const { status, message, data } = await getAllFields(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}