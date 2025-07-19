const { badRequest, success, unknownError } = require("../../../../../globalHelper/response.globalHelper");

const {
    addFormConfig,
    getFormConfigById,
    getFormConfigByName,
    getAllActiveFormConfigs,
    updateFormConfig,
    deactivateFormConfig,
    getAllActiveFormConfigsOfCreator
} = require("../../helper/formConfig.helper");

// Create a new FormConfig
async function addFormConfigController(req, res) {
    try {
        const { status, message, data } = await addFormConfig(req.body, req.Id);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Get FormConfig by formConfigId
async function getFormConfigByIdController(req, res) {
    try {
        const { status, message, data } = await getFormConfigById(req.params.formConfigId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Get FormConfig by formName
async function getFormConfigByNameController(req, res) {
    try {
        const { status, message, data } = await getFormConfigByName(req.params.formName);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Get all active FormConfigs
async function getAllActiveFormConfigsController(req, res) {
    try {
        const { status, message, data } = await getAllActiveFormConfigs();
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Update FormConfig by formConfigId
async function updateFormConfigController(req, res) {
    try {
        const { status, message, data } = await updateFormConfig(req.params.formConfigId, req.body, req.Id);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Deactivate FormConfig by formConfigId
async function deactivateFormConfigController(req, res) {
    try {
        const { status, message, data } = await deactivateFormConfig(req.params.formConfigId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Get all active FormConfigs of a specific creator or management employee
async function getAllActiveFormConfigsOfCreatorController(req, res) {
    try {
        const { status, message, data } = await getAllActiveFormConfigsOfCreator();
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

module.exports = {
    addFormConfigController,
    getFormConfigByIdController,
    getFormConfigByNameController,
    getAllActiveFormConfigsController,
    updateFormConfigController,
    deactivateFormConfigController,
    getAllActiveFormConfigsOfCreatorController
};
