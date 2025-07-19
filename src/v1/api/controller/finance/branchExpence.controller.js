const { badRequest, success, unknownError } = require("../../../../../globalHelper/response.globalHelper");

const {
    addbranchExpence,
    getbranchExpenceById,
    updatebranchExpence,
    deactivebranchExpence,
    getAllActivebranchExpence,
    getAllActiveBranchExpencesOfCreator,
    getBranchExpenceStats
} = require("../../helper/finance/branchExpence.helper");


// Create a new branchExpence

async function addbranchExpenceController(req, res) {
    try {
        const { status, message, data } = await addbranchExpence(req.body, req.Id);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Get branchExpence by branchExpenceId

async function getbranchExpenceByIdController(req, res) {
    try {
        const { status, message, data } = await getbranchExpenceById(req.params.branchExpenceId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// get all active branchExpence//

async function getAllActivebranchExpenceController(req, res) {
    try {
        const { status, message, data } = await getAllActivebranchExpence();
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}


// update branchExpence by branchExpenceId

async function updatebranchExpenceController(req, res) {
    try {

        const { status, message, data } = await updatebranchExpence(req.params.branchExpenceId, req.body, req.Id);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}


// Deactivate branchExpence by branchExpenceId

async function deactivebranchExpenceController(req, res) {
    try {
        const { status, message, data } = await deactivebranchExpence(req.params.branchExpenceId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}


// Get all active branchExpence of creator

async function getAllActiveBranchExpencesOfCreatorController(req, res) {
    try {
        const { status, message, data } = await getAllActiveBranchExpencesOfCreator(req.Id);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}


// Get branchExpence stat

async function getBranchExpenceStatsController(req, res) {
    try {
        const { status, message, data } = await getBranchExpenceStats();
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}


module.exports = {
    addbranchExpenceController,
    getbranchExpenceByIdController,
    updatebranchExpenceController,
    deactivebranchExpenceController,
    getAllActivebranchExpenceController,
    getAllActiveBranchExpencesOfCreatorController,
    getBranchExpenceStatsController
}

