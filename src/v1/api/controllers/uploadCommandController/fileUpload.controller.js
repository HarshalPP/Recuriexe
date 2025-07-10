import { badRequest, created, unknownError } from "../../helper/response.helper.js"
import { uploadFileDoc, uploadMultipleFilesDoc } from "../../helper/uploadDocument.helper.js"



// -------------------------- single upload -------------------------------


export async function uploadFile(req, res) {
    try {
        
        const { status, message, data } = await uploadFileDoc(req)
        return status ? created(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}




// -------------------------- multi upload -------------------------------


export async function uploadMultipleFile(req, res) {
    try {
        
        const { status, message, data } = await uploadMultipleFilesDoc(req)
        return status ? created(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}
