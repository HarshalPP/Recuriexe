const { badRequest, success, unknownError } = require("../../../../globalHelper/response.globalHelper");

const {
    addAsset,
    getAssetById,
    getAssetsByVendor,
    updateAsset,
    deactivateAsset,
    getAllActiveAssets,
    getAllActiveAssetsOfCreator,
    getAssetStats,
    getAssetsReportReport
} = require("../helper/asset.helper");

// Create a new Asset
async function addAssetController(req, res) {
    try {
        const { status, message, data } = await addAsset(req.body, req.Id);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Get Asset by assetId
async function getAssetByIdController(req, res) {
    try {
        const { status, message, data } = await getAssetById(req.params.assetId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Get all Assets by vendor
async function getAssetsByVendorController(req, res) {
    try {
        const { status, message, data } = await getAssetsByVendor(req.params.vendor);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Get  Assets Stat
async function getAssetsStatController(req, res) {
    try {
        const { status, message, data } = await getAssetStats();
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Update Asset by assetId
async function updateAssetController(req, res) {
    try {

        const { status, message, data } = await updateAsset(req.params.assetId, req.body, req.Id);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Deactivate Asset by assetId
async function deactivateAssetController(req, res) {
    try {
        const { status, message, data } = await deactivateAsset(req.params.assetId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Get all active Assets
async function getAllActiveAssetsController(req, res) {
    try {
        const { status, message, data } = await getAllActiveAssets();
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function getAllActiveAssetsByCreatorController(req, res) {
    try {
        const { status, message, data } = await getAllActiveAssetsOfCreator(req.Id);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function getAssetsReportController(req, res) {
    try {
        const { status, message, data } = await getAssetsReportReport(req.body);
        res.header('Content-Type', 'text/csv');
        res.attachment('assets_report.csv');
        return res.send(data);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}



module.exports = {
    addAssetController,
    getAssetByIdController,
    getAssetsByVendorController,
    updateAssetController,
    deactivateAssetController,
    getAllActiveAssetsController,
    getAllActiveAssetsByCreatorController,
    getAssetsStatController,
    getAssetsReportController
};
