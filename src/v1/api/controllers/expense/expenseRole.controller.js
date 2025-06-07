import { 
    created, 
    success, 
    badRequest, 
    notFound, 
    unknownError 
} from "../../helper/response.helper.js";
import { addExpenseRole, updateFromWheres, getAllExpenseRoles, getExpenseRoleDetailById, departmentEmployeeLists, departmentLists,
    addExpenseConfigs, configLists, activeInactiveExpenses
 } from "../../helper/expense/expenseRole.helper.js"
 


// -------------------------- update from where -------------------------

export async function updateFromWhere(req, res) {
    try {
        console.log(req.body)
        const { status, message, data } = await updateFromWheres(req)
        return status ? created(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

//----------------------------- config list ------------------------

export async function configList(req, res) {
    try {
        console.log(req.body)
        const { status, message, data } = await configLists(req)
        return status ? created(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

// -------------------------- create Field -------------------------------


export async function saveExpenseRole(req, res) {
    try {
        const { status, message, data } = await addExpenseRole(req.body.id,req)
        return status ? created(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// // // -------------------------- update Field -------------------------------


export async function updateTripValue(req, res) {
    try {
        const { status, message, data } = await updateTripValueById(req?.body?.tripValueId,req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// // // // -------------------------- get Field -------------------------------


export async function getExpenseRoleDetail(req, res) {
    try {
        const { status, message, data } = await getExpenseRoleDetailById(req.params.id)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

// // // // -------------------------- get All Field -------------------------------


export async function getAllExpenseRole(req, res) {
    try {
        const { status, message, data } = await getAllExpenseRoles(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


export async function departmentEmployeeList(req, res) {
    try {
        const { status, message, data } = await departmentEmployeeLists(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


export async function departmentListList(req, res) {
    try {
        const { status, message, data } = await departmentLists(req)
        console.log(data,"data?????")
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


export async function addExpenseConfig(req, res) {
    try {
        const { status, message, data } = await addExpenseConfigs(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


//activeInactiveExpense
export async function activeInactiveExpense(req, res) {
    try {
        const { status, message, data } = await activeInactiveExpenses(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}
