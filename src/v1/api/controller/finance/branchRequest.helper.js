const { badRequest, success, unknownError } = require("../../../../../globalHelper/response.globalHelper");

const {
    addBranchRequest,
    getBranchRequestById,
    updateBranchRequest,
    deactivateBranchRequest,
    getAllActiveBranchRequests,
    getAllActiveBranchRequestsOfCreator,
    getBranchRequestStats,
    getBranchRequestsReport
} = require("../../helper/finance/branchRequest.helper");

// Create a new branchRequest
async function addBranchRequestController(req, res) {
    try {
        const { status, message, data } = await addBranchRequest(req.body, req.Id);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Get branchRequest by branchRequestId
async function getBranchRequestByIdController(req, res) {
    try {
        const { status, message, data } = await getBranchRequestById(req.params.branchRequestId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}



// Get branchRequests statistics
async function getBranchRequestsStatController(req, res) {
    try {
        const { status, message, data } = await getBranchRequestStats();
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Update branchRequest by branchRequestId
async function updateBranchRequestController(req, res) {
    try {
        const { status, message, data } = await updateBranchRequest(req.params.branchRequestId, req.body, req.Id);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Deactivate branchRequest by branchRequestId
async function deactivateBranchRequestController(req, res) {
    try {
        const { status, message, data } = await deactivateBranchRequest(req.params.branchRequestId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Get all active branchRequests
async function getAllActiveBranchRequestsController(req, res) {
    try {
        const { status, message, data } = await getAllActiveBranchRequests();
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Get all active branchRequests by creator or approver
async function getAllActiveBranchRequestsByCreatorController(req, res) {
    try {
        const { status, message, data } = await getAllActiveBranchRequestsOfCreator(req.Id);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Get branchRequests report
async function getBranchRequestsReportController(req, res) {
    try {
        const { status, message, data } = await getBranchRequestsReport(req.body);
        res.header('Content-Type', 'text/csv');
        res.attachment('branchRequests_report.csv');
        return res.send(data);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

module.exports = {
    addBranchRequestController,
    getBranchRequestByIdController,
    updateBranchRequestController,
    deactivateBranchRequestController,
    getAllActiveBranchRequestsController,
    getAllActiveBranchRequestsByCreatorController,
    getBranchRequestsStatController,
    getBranchRequestsReportController
};
