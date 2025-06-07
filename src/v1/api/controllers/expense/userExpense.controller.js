import { 
    created, 
    success, 
    badRequest, 
    notFound, 
    unknownError 
} from "../../helper/response.helper.js";
import { addUserExpenses, updateUserExpenseById, getUserExpenseById, getAllUserExpenses } from "../../helper/expense/userExpense.helper.js"



// -------------------------- create Field -------------------------------


export async function saveUserExpense(req, res) {
    try {
        const { status, message, data } = await addUserExpenses(req)
        return status ? created(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// // // -------------------------- update Field -------------------------------


export async function updateUserExpense(req, res) {
    try {
        const { status, message, data } = await updateUserExpenseById(req?.body?.userExpenseId,req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// // // // -------------------------- get Field -------------------------------


export async function getUserExpense(req, res) {
    try {
        const { status, message, data } = await getUserExpenseById(req.params.id)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

// // // // -------------------------- get All Field -------------------------------


export async function getAllUserExpense(req, res) {
    try {
        const { status, message, data } = await getAllUserExpenses(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}



