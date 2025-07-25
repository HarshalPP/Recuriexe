import { badRequest, created, success, unknownError } from "../../helper/response.helper.js"
import { addTemplate, getAllTemplates, gettemplatebyReportId, getTemplateId, removeTemplate, updateTemplateById } from "../../helper/reportHelper/reportTemplate.helper.js";



// -------------------------- create Template -------------------------------


export async function saveTemplate(req, res) {
    try {
        const { status, message, data } = await addTemplate(req)
        return status ? created(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

// --------------------------- update Template ----------------------------------

export async function updtaeTemplateInfo(req, res) {
    try {
        const { status, message, data } = await updateTemplateById(req);
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// ---------------------  get Template By Id ----------------------------


export async function getTemplateInfo(req, res) {
    try {
        const { status, message, data } = await getTemplateId(req.query.TemplateId)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

// ---------------------  get Template By ProductId ----------------------------


export async function getTempByReport(req, res) {
    try {
        const { status, message, data } = await gettemplatebyReportId(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}





// ---------------  getall Template -------------------------

export async function getAllTemplatesInfo(req, res) {
    try {
        const { status, message, data } = await getAllTemplates(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}



// ---------------  remove Template -------------------------

export async function removTemplate(req, res) {
    try {
   
        const { status, message, data } = await removeTemplate(req.query.tempId)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


