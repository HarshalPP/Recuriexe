import { addCase, getAllCases, getCaseById, getCasesCount, updateCase } from "../../helper/reportHelper/reportInit.helper.js"
import { badRequest, created, notFound, success, unknownError } from "../../helper/response.helper.js"



// -------------------------- create case -------------------------------


export async function savecase(req, res) {
    try {
        const { status, message, data } = await addCase(req)
        return status ? created(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


//---------------------------- update case -------------------------------


export async function updatecaseData(req, res) {
    try {
        const { status, message, data } = await updateCase(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

//---------------------------- get case -------------------------------


export async function getCaseDataById(req, res) {
    try {
        const { status, message, data } = await getCaseById(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

//---------------------------- get all case -------------------------------


export async function getAllCasesData(req, res) {
    try {
        const { status, message, data } = await getAllCases(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


//------------------------------- cases count ----------------------------


export async function casesCount(req, res) {
    try {
        const { status, message, data } = await getCasesCount(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}