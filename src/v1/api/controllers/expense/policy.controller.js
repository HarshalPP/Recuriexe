import { 
    created, 
    success, 
    badRequest, 
    notFound, 
    unknownError 
} from "../../helper/response.helper.js";
import { addPolicyValues, updatePolicyById, getPolicyById, getAllPolicies, employeeAllDetails } from "../../helper/expense/policy.helper.js"



// -------------------------- create Field -------------------------------


export async function addPolicyValue(req, res) {
    try {
        const { status, message, data } = await addPolicyValues(req)
        return status ? created(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// // // -------------------------- update Field -------------------------------


export async function updatePolicy(req, res) {
    try {
        const { status, message, data } = await updatePolicyById(req?.body?.policyId,req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// // // // -------------------------- get Field -------------------------------


export async function getPolicy(req, res) {
    try {
        const { status, message, data } = await getPolicyById(req.params.id)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

// // // // -------------------------- get All Field -------------------------------


export async function getAllPolicy(req, res) {
    try {
        const { status, message, data } = await getAllPolicies(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


export async function employeeDetails(req, res) {
    try {
        const { status, message, data } = await employeeAllDetails(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}



