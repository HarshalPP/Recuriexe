import {  getAdCases, getallCount, getAllForBackOfficeData, getBackOfficeCompletedCount, getBackOfficeCount, getBackOfficeWipCount, getClientCount, getEmpCount, getTaskCountByEmp, getTaskCountByPartners, getTaskCountByService} from "../../helper/dashboard.helper.js"
import { badRequest, success, unknownError } from "../../helper/response.helper.js"





// -------------------------- get all count  -------------------------------



export async function getAllcasescount(req, res) {
    try {
        const { status, message, data } = await getallCount(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}




// -------------------------- get ad cases count  -------------------------------



export async function getAdCasesData(req, res) {
    try {
        const { status, message, data } = await getAdCases(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// -------------------------- get beckoffice completed count  -------------------------------



export async function getBackofficeCountInfo(req, res) {
    try {
        const { status, message, data } = await getBackOfficeCount(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}



// -------------------------- get beckoffice data  -------------------------------



export async function getBackofficeDataFroReport(req, res) {
    try {
        const { status, message, data } = await getAllForBackOfficeData(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// -------------------------- get agent recieved count  -------------------------------



export async function getBackOfficeCompleteCount(req, res) {
    try {
        const { status, message, data } = await getBackOfficeCompletedCount(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// -------------------------- get agent recieved count  -------------------------------



export async function getBackOfficeWinPCount(req, res) {
    try {
        const { status, message, data } = await getBackOfficeWipCount(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}



// -------------------------- get client count  -------------------------------



export async function getClientCountInfo(req, res) {
    try {
        const { status, message, data } = await getClientCount(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}



// -------------------------- get employee count  -------------------------------



export async function getTaskCountByEmpInfo(req, res) {
    try {
        const { status, message, data } = await getTaskCountByEmp(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// -------------------------- get services count  -------------------------------



export async function getTaskCountByServicesInfo(req, res) {
    try {
        const { status, message, data } = await getTaskCountByService(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// -------------------------- get partner count  -------------------------------



export async function getTaskCountByPartnerInfo(req, res) {
    try {
        const { status, message, data } = await getTaskCountByPartners(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}



// -------------------------- get employee count  -------------------------------



export async function empCountData(req, res) {
    try {
        const { status, message, data } = await getEmpCount(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}
