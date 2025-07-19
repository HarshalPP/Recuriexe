const { badRequest, parseJwt, success, unknownError, unauthorized } = require("../../../../globalHelper/response.globalHelper");

const {
    addLoanSathi,
    getLoanSathiById,
    getLoanSathiBySalesPerson,
    updateLoanSathi,
    deactivateLoanSathi,
    loginLoanSathi,
    changeLoanSathiPassword,
    salePersonByFinId
} = require("../helper/loanSathi.helper");

async function addLoanSathiController(req, res) {
    try {
        const salePersonData = await salePersonByFinId(req.body.ref)
        if (!salePersonData) {
            return unauthorized(res, "You don't have enough permissions")
        }
        const { status, message, data } = await addLoanSathi(req.body,salePersonData);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function getLoanSathiByIdController(req, res) {
    try {
        const { status, message, data } = await getLoanSathiById(req.params.loanSathiId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function getLoanSathiBySalesPersonController(req, res) {
    try {
        const { status, message, data } = await getLoanSathiBySalesPerson(req.params.salesPersonId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function updateLoanSathiController(req, res) {
    try {
        const { status, message, data } = await updateLoanSathi(req.params.loanSathiId, req.body);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function deactivateLoanSathiController(req, res) {
    try {
        const { status, message, data } = await deactivateLoanSathi(req.params.loanSathiId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function loginLoanSathiController(req, res) {
    try {
        const { status, message, data } = await loginLoanSathi(req.body.userName, req.body.password);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function changeLoanSathiPasswordController(req, res) {
    try {
        const { status, message, data } = await changeLoanSathiPassword(req.body.loanSathiId, req.body.oldPassword, req.body.newPassword);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}


module.exports = {
    addLoanSathiController,
    getLoanSathiByIdController,
    getLoanSathiBySalesPersonController,
    updateLoanSathiController,
    deactivateLoanSathiController,
    loginLoanSathiController,
    changeLoanSathiPasswordController
}