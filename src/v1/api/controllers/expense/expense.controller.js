import { 
    created, 
    success, 
    badRequest, 
    notFound, 
    unknownError 
} from "../../helper/response.helper.js";
import { saveExpenses, updateExpenses,getAllExpenses,getExpenseByIds, approveExpenses, approverDashbords, getAllExpensesById,
    remitterDashbords, adminDashbords
 } from "../../helper/expense/expense.helper.js"


// -------------------------- create Field -------------------------------


export async function saveExpense(req, res) {
    try {
        const { status, message, data } = await saveExpenses(req)
        return status ? created(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// // // -------------------------- update Field -------------------------------


export async function updateExpense(req, res) {
    try {
        const { status, message, data } = await updateExpenses(req?.body?.id,req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// // // // -------------------------- get Field -------------------------------


export async function getExpenseById(req, res) {
    try {
        const { status, message, data } = await getExpenseByIds(req.params.id)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

// // // // -------------------------- get All Field -------------------------------


export async function getAllExpense(req, res) {
    try {
        const { status, message, data } = await getAllExpenses(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

//---------------------get all expense getAllExpenseById --------------------

export async function getAllExpenseById(req, res) {
    try {
        const { status, message, data } = await getAllExpensesById(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


export async function approveExpense(req, res) {
    try {
        const { status, message, data } = await approveExpenses(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


export async function approverDashbord(req, res) {
    try {
        const { status, message, data } = await approverDashbords(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

//remitterDashbord
export async function remitterDashbord(req, res) {
    try {
        const { status, message, data } = await remitterDashbords(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

//adminDashbord
export async function adminDashbord(req, res) {
    try {
        const { status, message, data } = await adminDashbords(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}