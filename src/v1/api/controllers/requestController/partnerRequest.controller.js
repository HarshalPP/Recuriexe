import {  createClient, getAllPartners, getAllPartnersByAllocation, getAllReceivedRequest, getAllSendedRequests, getAllUsersForPartners, getInactiveProduct, getPartnersDetailsById, getProductFormByProduct, getUncheckedUserProduct, requestSending, updatePartDetails, updatePartenerData, updatePartenerProduct, updateRequestInfo, updateStatus } from "../../helper/partnerRequest.helper.js"
import { badRequest, created, notFound, success, unknownError } from "../../helper/response.helper.js"



// -------------------------- generate request -------------------------------


export async function sentRequest(req, res) {
    try {
        const { status, message, data } = await requestSending(req)
        return status ? created(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// -------------------------- edit request -------------------------------


export async function editRequest(req, res) {
    try {
        const { status, message, data } = await updateRequestInfo(req)
        return status ? created(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

// ---------------------------- get send request ------------------


export async function getSentRequest(req, res) {
    try {
        
        const { status, message, data } = await getAllSendedRequests(req,req.query.status);
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// ---------------------------- get received request ------------------


export async function getReceivedRequest(req, res) {
    try {
        const { status, message, data } = await getAllReceivedRequest(req,req.query.status);
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// ---------------------------- get my Partners ------------------


export async function getMyPartners(req, res) {
    try {
        const { status, message, data } = await getAllPartners(req);
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}



// ---------------------------- get my Partners by allocation------------------


export async function getMyAllocatedPartner(req, res) {
    try {
        const { status, message, data } = await getAllPartnersByAllocation(req);
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// ---------------------------- get my Partners Data By Id ------------------


export async function getMyPartnersDetails(req, res) {
    try {
        const { status, message, data } = await getPartnersDetailsById(req);
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}



// ---------------------------- get product form by available product ------------------


export async function getFormByAvailableProducts(req, res) {
    try {
        const { status, message, data } = await getProductFormByProduct(req);
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}



// ---------------------------- get User for  Partners ------------------


export async function getUsersForPartnership(req, res) {
    try {
        const { status, message, data } = await getAllUsersForPartners(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// ---------------------------- get UserProducts for  Partners ------------------


export async function getUNexistingUserProduct(req, res) {
    try {
        const { status, message, data } = await getUncheckedUserProduct(req.query.id,req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}



// ---------------------------- get Inactive Product for  Partners ------------------


export async function getInactive(req, res) {
    try {
        const { status, message, data } = await getInactiveProduct(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}




// ---------------------------- create clinet ------------------


export async function saveClient(req, res) {
    try {
        const { status, message, data } = await createClient(req)
        return status ? created(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}



// ---------------------------- update request ------------------


export async function updateRequest(req, res) {
    try {
        
        
        const { status, message, data } = await updateStatus(req.body.id,req.body.status);
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}



// ---------------------------- update partner data ------------------


export async function updatePartner(req, res) {
    try {
        const { status, message, data } = await updatePartDetails(req.body.id,req);
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}







// ---------------------------- update partner data ------------------


export async function updatePartnerFormsData(req, res) {
    try {
        const { status, message, data } = await updatePartenerData(req.body.id,req);
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// ---------------------------- update partner product ------------------


export async function updatePartnerProductsData(req, res) {
    try {
        const { status, message, data } = await updatePartenerProduct(req.body.id,req);
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}