import { 
    createDynamicForm, 
    getAllDynamicForms, 
    getDynamicFormById, 
    updateDynamicFormData, 
    deleteDynamicFormData,
    previewDynamicForm 
} from "../../helper/expenseHelper/dynamicForm.helper.js";
import { success, badRequest, unknownError, created, notFound } from '../../helper/response.helper.js';
// import { parseJwt } from "../middleware/authToken.js";

export async function createNewDynamicForm(req, res) {
    try {
        const token = req.employee;
        const { status, message, data } = await createDynamicForm(req.body, token.organizationId, token.Id);
        return status ? created(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function getDynamicForms(req, res) {
    try {
        const token = req.employee;
        const { page = 1, limit = 10, expenseTypeId = '' } = req.query;
        const { status, message, data } = await getAllDynamicForms(
            token.organizationId, 
            { page, limit, expenseTypeId }
        );
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function getDynamicForm(req, res) {
    try {
        const token = req.employee;
        const { status, message, data } = await getDynamicFormById(req.params.id, token.organizationId);
        return status ? success(res, message, data) : notFound(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function updateDynamicForm(req, res) {
    try {
        const token = req.employee;
        const { status, message, data } = await updateDynamicFormData(
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

export async function deleteDynamicForm(req, res) {
    try {
        const token = req.employee;
        const { status, message } = await deleteDynamicFormData(
            req.params.id, 
            token.organizationId,
            token.Id
        );
        return status ? success(res, message) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function previewForm(req, res) {
    try {
        const token = req.employee;
        const { status, message, data } = await previewDynamicForm(req.params.id, token.organizationId);
        return status ? success(res, message, data) : notFound(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}
