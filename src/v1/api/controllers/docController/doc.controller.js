import { addDoc, deleteDocById, getallDocList } from "../../helper/doc.helper.js"
import { created, success, unknownError } from "../../helper/response.helper.js"




// -------------------------- add -------------------------------




export async function addDocInfo(req, res) {
    try {
        const { status, message, data } = await addDoc(req)
        return status ? created(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}



// -------------------------- remove data  -------------------------------




export async function removeInfo(req, res) {
    try {
        const { status, message, data } = await deleteDocById(req.query.id)
        
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// -------------------------- get data  -------------------------------




export async function getDocInfo(req, res) {
    try {
        const { status, message, data } = await getallDocList(req)
        
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}
