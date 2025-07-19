const { badRequest, success, unknownError } = require("../../../../../globalHelper/response.globalHelper");

const {
    addRmPayment,
    getrmPaymentById,
    getrmPaymentsByVendor,
    updatermPayment,
    deactivatermPayment,
    getAllActivermPayments,
    getAllActivermPaymentsOfCreator,
    getrmPaymentStats,
    getrmPaymentsReportReport
} = require("../../helper/finance/rmPayment.helper");

// Create a new rmPayment
async function addrmPaymentController(req, res) {
    try {
        const { status, message, data } = await addRmPayment(req.body, req.Id);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Get rmPayment by rmPaymentId
async function getrmPaymentByIdController(req, res) {
    try {
        const { status, message, data } = await getrmPaymentById(req.params.rmPaymentId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Get all rmPayments by vendor
async function getrmPaymentsByVendorController(req, res) {
    try {
        const { status, message, data } = await getrmPaymentsByVendor(req.params.vendor);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Get  rmPayments Stat
async function getrmPaymentsStatController(req, res) {
    try {
        const { status, message, data } = await getrmPaymentStats();
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Update rmPayment by rmPaymentId
async function updatermPaymentController(req, res) {
    try {

        const { status, message, data } = await updatermPayment(req.params.rmPaymentId, req.body, req.Id);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Deactivate rmPayment by rmPaymentId
async function deactivatermPaymentController(req, res) {
    try {
        const { status, message, data } = await deactivatermPayment(req.params.rmPaymentId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Get all active rmPayments
async function getAllActivermPaymentsController(req, res) {
    try {
        const { status, message, data } = await getAllActivermPayments();
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function getAllActivermPaymentsByCreatorController(req, res) {
    try {
        const { status, message, data } = await getAllActivermPaymentsOfCreator(req.Id);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function getrmPaymentsReportController(req, res) {
    try {
        const { status, message, data } = await getrmPaymentsReportReport(req.body);
        res.header('Content-Type', 'text/csv');
        res.attachment('rmPayments_report.csv');
        return res.send(data);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}



module.exports = {
    addrmPaymentController,
    getrmPaymentByIdController,
    getrmPaymentsByVendorController,
    updatermPaymentController,
    deactivatermPaymentController,
    getAllActivermPaymentsController,
    getAllActivermPaymentsByCreatorController,
    getrmPaymentsStatController,
    getrmPaymentsReportController
};
