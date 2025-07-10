import { 
    createExpenseType, 
    getAllExpenseTypes, 
    getExpenseTypeById, 
    updateExpenseTypeData, 
    deleteExpenseTypeData,
    publishExpenseType 
} from "../../helper/expenseHelper/expenseType.helper.js";
import { success, badRequest, unknownError, created, notFound } from '../../helper/response.helper.js';
// import { parseJwt } from "../middleware/authToken.js";

export async function createNewExpenseType(req, res) {
    try {
        const token = req.employee;
        const { status, message, data } = await createExpenseType(req.body, token.organizationId, token.Id);
        return status ? created(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function getExpenseTypes(req, res) {
    try {
        const token = req.employee;
        const { page = 1, limit = 10, systemCategoryId = '', subcategoryId = '', isPublished = '' } = req.query;
        const { status, message, data } = await getAllExpenseTypes(
            token.organizationId, 
            { page, limit, systemCategoryId, subcategoryId, isPublished }
        );
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function getExpenseType(req, res) {
    try {
        const token = req.employee;
        const { status, message, data } = await getExpenseTypeById(req.params.id, token.organizationId);
        return status ? success(res, message, data) : notFound(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function updateExpenseType(req, res) {
    try {
        const token = req.employee;
        const { status, message, data } = await updateExpenseTypeData(
            req.params.id, 
            req.body, 
            token.organizationId,
            token.Id
        );
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function deleteExpenseType(req, res) {
    try {
        const token = req.employee;
        const { status, message } = await deleteExpenseTypeData(
            req.params.id, 
            token.organizationId,
            token.Id
        );
        return status ? success(res, message) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function publishExpenseTypeController(req, res) {
    try {
        const token = req.employee;
        const { status, message, data } = await publishExpenseType(
            req.params.id, 
            token.organizationId,
            token.Id
        );
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}
