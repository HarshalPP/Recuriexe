const express = require("express");
const router = express.Router();

const {
    addAssetController,
    getAssetByIdController,
    getAssetsByVendorController,
    updateAssetController,
    deactivateAssetController,
    getAllActiveAssetsController,
    getAllActiveAssetsByCreatorController,
    getAssetsStatController,
    getAssetsReportController
} = require("../../controller/finance/asset.controller");

router.post("/add", addAssetController);
router.get("/getById/:assetId", getAssetByIdController);
router.get("/assigned", getAllActiveAssetsByCreatorController);
router.get("/getByVendor/:vendor", getAssetsByVendorController);
router.post("/update/:assetId", updateAssetController);
router.post("/deactivate/:assetId", deactivateAssetController);
router.get("/getAllActive", getAllActiveAssetsController);
router.get("/stat", getAssetsStatController);
router.post("/report", getAssetsReportController);


module.exports = router;
