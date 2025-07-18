import { 
    createWorkflow, 
    getAllWorkflows, 
    getWorkflowById, 
    updateWorkflowData, 
    deleteWorkflowData,
    getWorkflowTemplates 
} from "../../helper/expenseHelper/workflow.helper.js";
import { success, badRequest, unknownError, created, notFound } from '../../helper/response.helper.js';

export async function createNewWorkflow(req, res) {
    try {
        const token = req.employee;
        console.log
        const { status, message, data } = await createWorkflow(req.body, token.organizationId, token.Id);
        return status ? created(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function getWorkflows(req, res) {
    try {
        const token = req.employee ;
        const { page = 1, limit = 10, type = '' } = req.query;
        const { status, message, data } = await getAllWorkflows(
            token.organizationId, 
            { page, limit, type }
        );
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function getWorkflow(req, res) {
    try {
        const token = req.employee ;
        const { status, message, data } = await getWorkflowById(req.params.id, token.organizationId);
        return status ? success(res, message, data) : notFound(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function updateWorkflow(req, res) {
    try {
        const token = req.employee ;
        const { status, message, data } = await updateWorkflowData(
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

export async function deleteWorkflow(req, res) {
    try {
        const token = req.employee ;
        const { status, message } = await deleteWorkflowData(
            req.params.id, 
            token.organizationId,
            token.Id
        );
        return status ? success(res, message) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function getTemplates(req, res) {
    try {
        const { status, message, data } = await getWorkflowTemplates();
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}
