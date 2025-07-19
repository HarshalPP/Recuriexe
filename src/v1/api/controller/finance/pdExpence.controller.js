const { badRequest, success, unknownError } = require("../../../../../globalHelper/response.globalHelper");

const {
    addPdExpence,
    getPdExpenceById,
    updatePdExpence,
    deactivePdExpence,
    getAllActivePdExpence,
    getAllActivePdExpencesOfCreator,
    getPdExpenceStats
} = require("../../helper/finance/pdExpence.helper");


// Create a new pdExpence

async function addPdExpenceController(req, res) {
    try {
        const { status, message, data } = await addPdExpence(req.body, req.Id);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Get pdExpence by pdExpenceId

async function getPdExpenceByIdController(req, res) {
    try {
        const { status, message, data } = await getPdExpenceById(req.params.pdExpenceId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// update pdExpence by pdExpenceId


async function updatePdExpenceController(req, res) {
    try {

        const { status, message, data } = await updatePdExpence(req.params.pdExpenceId, req.body, req.Id);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}


// Deactivate pdExpence by pdExpenceId

async function deactivePdExpenceController(req, res) {
    try {
        const { status, message, data } = await deactivePdExpence(req.params.pdExpenceId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Get all active pdExpence

async function getAllActivePdExpenceController(req, res) {
    try {
        const { status, message, data } = await getAllActivePdExpence();
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}


// Get all active pdExpence of creator

async function getAllActivePdExpencesOfCreatorController(req, res) {    
    try {
        const { status, message, data } = await getAllActivePdExpencesOfCreator(req.Id);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}


// Get pdExpence stats //

async function getPdExpenceStatsController(req, res) {
    try {
        const { status, message, data } = await getPdExpenceStats();
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}



module.exports = {
    addPdExpenceController,
    getPdExpenceByIdController,
    updatePdExpenceController,
    deactivePdExpenceController,
    getAllActivePdExpenceController,
    getAllActivePdExpencesOfCreatorController,
    getPdExpenceStatsController
}




