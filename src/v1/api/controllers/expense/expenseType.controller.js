import { 
    addExpenseType, 
    getAllExpenseTypes, 
    getExpenseTypeById, 
    updateExpenseType,
    deleteExpenseType,
    updateExpenseStatus,
    getExpenseTypeNameList
} from "../../helper/expense/expensesType.helper.js";
import { 
    created, 
    success, 
    badRequest, 
    notFound, 
    unknownError 
} from "../../helper/response.helper.js";

/**
 * Create a new expense type
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */ 
export async function saveExpenseType(req, res) {
    try {
        const { status, message, data } = await addExpenseType(req);
        return status ? created(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Get all expense types
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function getExpenseTypes(req, res) {
    try {
        const { status, message, data } = await getAllExpenseTypes(req);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function expenseTypeNameList(req, res) {
    try {
        const { status, message, data } = await getExpenseTypeNameList(req);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Get expense type by ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function getExpenseType(req, res) {
    try {
        const { status, message, data } = await getExpenseTypeById(req);
        return status ? success(res, message, data) : notFound(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Update expense type
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function updateExpenseTypeById(req, res) {
    try {
        console.log("updateExpenseTypeById", req.body);
        const { status, message, data } = await updateExpenseType(req);
        return status ? success(res, message, data) : notFound(res, message);
    } catch (error) {
        console.log("updateExpenseTypeById error", error);
        return unknownError(res, error.message);
    }
}


//updateExpenseTypeStatus
export async function updateExpenseTypeStatus(req, res) {
    try {
        const { status, message, data } = await updateExpenseStatus(req);
        return status ? success(res, message, data) : notFound(res, message);
    } catch (error) {
        console.log("updateExpenseTypeById error", error);
        return unknownError(res, error.message);
    }
}

/**
 * Delete expense type
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function deleteExpenseTypeById(req, res) {
    try {
        const { status, message, data } = await deleteExpenseType(req);
        return status ? success(res, message, data) : notFound(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}
