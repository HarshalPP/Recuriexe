import { addReportType, getAllReportType, getReporttypeById, removeReportType, updateReportType } from "../../helper/reportType.helper.js";
import { badRequest, created, notFound, success, unknownError } from "../../helper/response.helper.js"



// -------------------------- create Product -------------------------------


export async function saveReportType(req, res) {
    try {
        const { status, message, data } = await addReportType(req)
        return status ? created(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

// --------------------------- update Product ----------------------------------

export async function updateReportTypeInfo(req, res) {
    try {
        const resData = await getReporttypeById(req.body.id);
        
        if(!resData.data){
            return notFound(res,"Product not found")
        }
        const { status, message, data } = await updateReportType(req.body.id,req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// --------------------------- update Product ----------------------------------

export async function deleteRepotType(req, res) {
    try {
        const resData = await getReporttypeById(req.body.productId);
        
        if(!resData.data){
            return notFound(res,"Product not found")
        }
        const { status, message, data } = await removeReportType(req.body.reportTypeId,req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// ---------------------  get Product By Id ----------------------------


export async function getReportTypeInfo(req, res) {
    try {
        const { status, message, data } = await getReporttypeById(req.params.id)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}





// ---------------  getall Product -------------------------

export async function getAllReportTypeInfo(req, res) {
    try {
        const { status, message, data } = await getAllReportType(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}
