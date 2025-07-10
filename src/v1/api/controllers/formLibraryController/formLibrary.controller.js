import { addFormadta, getAllForm, getFormById, removeForm, updateFormById } from "../../helper/formLibrary.helper.js"
import { badRequest, created, success, unknownError } from "../../helper/response.helper.js"



// -------------------------- create form -------------------------------


export async function saveForm(req, res) {
    try {
        const { status, message, data } = await addFormadta(req)
        return status ? created(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}





// // --------------------------- update form ----------------------------------

export async function updtaeFormInfo(req, res) {
    try {
        const { status, message, data } = await updateFormById(req);
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// // ---------------------  get Variable By Id ----------------------------


export async function getFormInfo(req, res) {
    try {
        const { status, message, data } = await getFormById(req.query.formId);
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}





// // ---------------  getall forms -------------------------

export async function getAllFormInfo(req, res) {
    try {
        const { status, message, data } = await getAllForm(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}



// // ---------------  remove form -------------------------

export async function removeFormData(req, res) {
    try {
   
        const { status, message, data } = await removeForm(req.query.formId);
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


