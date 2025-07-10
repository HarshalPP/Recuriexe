import { badRequest, created, notFound, success, unknownError } from "../../helper/response.helper.js"
import { addUserProduct, getAllNotExist, getAllUserProduct, getAllUserProductByservices, getUnselectedProduct, getUserProductById, removeUserProduct, updateUserProductId } from "../../helper/userProduct.helper.js";



// -------------------------- create Product -------------------------------


export async function saveUserProduct(req, res) {
    try {
        const { status, message, data } = await addUserProduct(req)
        return status ? created(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

// --------------------------- update Product ----------------------------------

export async function updateUserProductInfo(req, res) {
    try {
        const resData = await getUserProductById(req.body.prId);
        
        if(!resData.data){
            return notFound(res,"Product not found")
        }
        const { status, message, data } = await updateUserProductId(req.body.prId,req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// --------------------------- update Product ----------------------------------

export async function deleteUserProduct(req, res) {
    try {
        const resData = await getUserProductById(req.body.productId);
        
        if(!resData.data){
            return notFound(res,"Product not found")
        }
        const { status, message, data } = await removeUserProduct(req.body.productId,req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// ---------------------  get Product By Id ----------------------------


export async function getUserProductInfo(req, res) {
    try {
        const { status, message, data } = await getUserProductById(req.params.productId)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}





// ---------------  getall Product -------------------------

export async function getAllUserProductInfo(req, res) {
    try {
        const { status, message, data } = await getAllUserProduct(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// ---------------  getall Product by service refer id-------------------------

export async function getAllUserProductInfoByServiceRef(req, res) {
    try {
        const { status, message, data } = await getAllUserProductByservices(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}





// ---------------  get unselected Product -------------------------

export async function getAllUserUnselectedInfo(req, res) {
    try {
        const { status, message, data } = await getUnselectedProduct(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}




// ---------------  getall Product not in emp -------------------------

export async function getAllProductNotInEmp(req, res) {
    try {
        const { status, message, data } = await getAllNotExist(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

