const { badRequest, success, unknownError } = require("../../../../../globalHelper/response.globalHelper");
const {
    addStampRequest,
    getStampRequestById,
    updateStampRequest,
    deactiveStampRequest,
    getAllActiveStampRequest,
    getAllActiveStampRequestsOfCreator,
    getStampRequestStats,
    getstampRequestReport
} = require("../../helper/finance/stamRequest.helper");


// Create a new stampRequest

async function addStampRequestController(req, res) {
    try {
        const { status, message, data } = await addStampRequest(req.body, req.Id);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Get stampRequest by stampRequestId

async function getStampRequestByIdController(req, res) {
    try {
        const { status, message, data } = await getStampRequestById(req.params.stampRequestId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Get all stampRequests by creator

async function getAllActiveStampRequestsOfCreatorController(req, res){
    try {
        const { status, message, data } = await getAllActiveStampRequestsOfCreator(req.Id);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}


// Get stampRequests statistics //

async function getStampRequestsStatController(req, res) {
    try {
        const { status, message, data } = await getStampRequestStats();
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Update stampRequest by stampRequestId
async function updateStampRequestController(req, res) {
    try {
        const { status, message, data } = await updateStampRequest(req.params.stampRequestId, req.body, req.Id);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Deactivate stampRequest by stampRequestId

async function deactivateStampRequestController(req, res) {
    try {
        const { status, message, data } = await deactiveStampRequest(req.params.stampRequestId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Get all active stampRequests

async function getAllActiveStampRequestsController(req, res) {
    try {
        const { status, message, data } = await getAllActiveStampRequest();
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function getstampRequestReportController(req, res) {
    try {
        const { status, message, data } = await getstampRequestReport(req.body);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

module.exports = {
    addStampRequestController,
    getStampRequestByIdController,
    updateStampRequestController,
    deactivateStampRequestController,
    getAllActiveStampRequestsController,
    getStampRequestsStatController,
    getAllActiveStampRequestsOfCreatorController,
    getstampRequestReportController
}