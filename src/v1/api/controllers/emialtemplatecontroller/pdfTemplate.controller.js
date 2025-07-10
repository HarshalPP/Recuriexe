import { addEmailTemplate, getAllEmailTemplates, getEmailTemplateId, updateEmailTemplateById } from "../../helper/pdftemplate.helper.js";
import { badRequest, created, success, unknownError } from "../../helper/response.helper.js"



// -------------------------- create Template -------------------------------


export async function saveTemplate(req, res) {
    try {
        const { status, message, data } = await addEmailTemplate(req)
        return status ? created(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

// --------------------------- update Template ----------------------------------

export async function updtaeTemplateInfo(req, res) {
    try {
        const { status, message, data } = await updateEmailTemplateById(req);
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// ---------------------  get Template By Id ----------------------------


export async function getTemplateInfo(req, res) {
    try {
        const { status, message, data } = await getEmailTemplateId(req.query.TemplateId)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}






// ---------------  getall Template -------------------------

export async function getAllTemplatesInfo(req, res) {
    try {
        const { status, message, data } = await getAllEmailTemplates(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}



// // ---------------  remove Template -------------------------

// export async function removTemplate(req, res) {
//     try {
   
//         const { status, message, data } = await re(req.query.tempId)
//         return status ? success(res, message, data) : badRequest(res, message)
//     } catch (error) {
//         return unknownError(res, error.message)
//     }
// }


