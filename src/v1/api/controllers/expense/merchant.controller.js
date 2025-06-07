import { 
    created, 
    success, 
    badRequest, 
    notFound, 
    unknownError 
} from "../../helper/response.helper.js";
import { saveMerchants, updateMerchantById, getMerchantById, getAllMerchants  } from "../../helper/expense/merchant.helper.js"



// -------------------------- create Field -------------------------------


export async function saveMerchant(req, res) {
    try {
        const { status, message, data } = await saveMerchants(req)
        return status ? created(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// // // -------------------------- update Field -------------------------------


export async function updateMerchant(req, res) {
    try {
        const { status, message, data } = await updateMerchantById(req?.body?.merchantId,req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// // // // -------------------------- get Field -------------------------------


export async function getMerchant(req, res) {
    try {
        const { status, message, data } = await getMerchantById(req.params.id)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

// // // // -------------------------- get All Field -------------------------------


export async function getAllMerchant(req, res) {
    try {
        const { status, message, data } = await getAllMerchants(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}



