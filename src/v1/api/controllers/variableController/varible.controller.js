import { badRequest, created, success, unknownError } from "../../helper/response.helper.js"
import { addVariable, addVariableAuto, getAllVarible, getVaribleById, removeVaribale, updateVaribleById } from "../../helper/variable.helper.js";



// -------------------------- create Variable -------------------------------


export async function saveVariable(req, res) {
    try {
        const { status, message, data } = await addVariable(req)
        return status ? created(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}



// -------------------------- create Variable auto -------------------------------


export async function saveVariableAutomatically(req, res) {
    try {
        const { status, message, data } = await addVariableAuto(req)
        return status ? created(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

// --------------------------- update Variable ----------------------------------

export async function updtaeVariableInfo(req, res) {
    try {
        const { status, message, data } = await updateVaribleById(req);
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// ---------------------  get Variable By Id ----------------------------


export async function getVariableInfo(req, res) {
    try {
        const { status, message, data } = await getVaribleById(req.query.varId);
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}





// ---------------  getall Variable -------------------------

export async function getAllVariablesInfo(req, res) {
    try {
        const { status, message, data } = await getAllVarible(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}



// ---------------  remove Variable -------------------------

export async function removVariable(req, res) {
    try {
   
        const { status, message, data } = await removeVaribale(req.query.varId);
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


