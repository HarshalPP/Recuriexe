import { 
    createExpenseSubmission, 
    getAllExpenseSubmissions, 
    getExpenseSubmissionById, 
    updateExpenseSubmissionData, 
    deleteExpenseSubmissionData,
    approveExpenseSubmission,
    withdrawExpenseSubmission,
    getSubmissionsByUser,
    getSubmissionsForApproval,
    getSubmissionHistory,
    bulkApproveSubmissions,
    exportSubmissions,
    getDashboardData,
    getAllemployeeExpenseSubmissions
} from "../../helper/expenseHelper/expenseSubmission.helper.js";
import { success, badRequest, unknownError, created, notFound } from '../../helper/response.helper.js';

export async function createNewSubmission(req, res) {
    try {
        const token = req.employee;
        const submissionData = {
            ...req.body,
            submittedBy: token.Id,
            organizationId: token.organizationId
        };
        const { status, message, data } = await createExpenseSubmission(submissionData);
        return status ? created(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function getAllSubmissions1(req, res) {
    try {
        const token = req.employee;
        const { 
            page = 1, 
            limit = 10, 
            status = '', 
            expenseTypeId = '', 
            submittedBy = '',
            startDate = '',
            endDate = ''
        } = req.query;
        
        const { status: responseStatus, message, data } = await getAllExpenseSubmissions(
            token.organizationId, 
            { page, limit, status, expenseTypeId, submittedBy, startDate, endDate }
        );
        return responseStatus ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}
export async function getAllSubmissions(req, res) {
    try {
        const token = req.employee;
        const { 
            page = 1, 
            limit = 10, 
            status = '', 
            expenseTypeId = '', 
            submittedBy = '',
            startDate = '',
            endDate = ''
        } = req.query;
        
        const { status: responseStatus, message, data } = await getAllExpenseSubmissions(
            token.organizationId,
            token.Id,
            { page, limit, status, expenseTypeId, submittedBy, startDate, endDate }
        );
        return responseStatus ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function getAllemployeeSubmissions(req, res) {
    try {
        const token = req.employee;
        const { 
            page = 1, 
            limit = 10, 
            status = '', 
            expenseTypeId = '', 
            submittedBy = '',
            startDate = '',
            endDate = ''
        } = req.query;
        
        const { status: responseStatus, message, data } = await getAllemployeeExpenseSubmissions(
            token.organizationId,
            token.Id,
            { page, limit, status, expenseTypeId, submittedBy, startDate, endDate }
        );
        return responseStatus ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function getSubmissionById(req, res) {
    try {
        const token = req.employee;
        const { status, message, data } = await getExpenseSubmissionById(
            req.params.submissionId, 
            token.organizationId
        );
        return status ? success(res, message, data) : notFound(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function updateSubmission(req, res) {
    try {
        const token = req.employee;
        const { status, message, data } = await updateExpenseSubmissionData(
            req.params.submissionId, 
            req.body, 
            token.organizationId,
            token.Id
        );
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function deleteSubmission(req, res) {
    try {
        const token = req.employee;
        const { status, message } = await deleteExpenseSubmissionData(
            req.params.submissionId, 
            token.organizationId,
            token.Id
        );
        return status ? success(res, message) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}



export async function approveSubmission(req, res) {
    try {
        const token = req.employee;
        const { status, message, data } = await approveExpenseSubmission(
            req.params.submissionId,
            req.body.comments,
            req.body.approvedAmount,
            token.organizationId,
            token.Id,
            req.body.status, // Default to 'Approved' if not provided
             req.body.rejectionReason || "",
        );
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}


export async function withdrawSubmission(req, res) {
    try {
        const token = req.employee;
        const { status, message, data } = await withdrawExpenseSubmission(
            req.params.submissionId, 
            token.organizationId,
            token.Id
        );
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function getUserSubmissions(req, res) {
    try {
        const token = req.employee;
        const { page = 1, limit = 10, status = '' } = req.query;
        const { status: responseStatus, message, data } = await getSubmissionsByUser(
            token.Id, 
            token.organizationId,
            { page, limit, status }
        );
        return responseStatus ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function getApprovalQueue(req, res) {
    try {
        const token = req.employee;
        const { page = 1, limit = 10, priority = '' } = req.query;
        const { status, message, data } = await getSubmissionsForApproval(
            token.Id, 
            token.organizationId,
            { page, limit, priority }
        );
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function getHistory(req, res) {
    try {
        const token = req.employee;
        const { status, message, data } = await getSubmissionHistory(
            req.params.submissionId, 
            token.organizationId
        );
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function bulkApprove(req, res) {
    try {
        const token = req.employee;
        const { status, message, data } = await bulkApproveSubmissions(
            req.body.submissionIds, 
            req.body.comments,
            token.organizationId,
            token.Id
        );
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function exportData(req, res) {
    try {
        const token = req.employee;
        const { format = 'csv', startDate, endDate, status } = req.query;
        const { status: responseStatus, message, data } = await exportSubmissions(
            token.organizationId,
            { format, startDate, endDate, status }
        );
        
        if (responseStatus) {
            res.setHeader('Content-Disposition', `attachment; filename=expenses.${format}`);
            res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
            return res.send(data);
        } else {
            return badRequest(res, message);
        }
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function getFinalDashBoard(req, res) {
    try {
        const token = req.employee;
         const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
        const { status, message, data } = await getDashboardData(
            token.organizationId,
            page,
            limit
        );
        return status ? success(res, message, data) : notFound(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}