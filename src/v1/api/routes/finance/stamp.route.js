const express = require("express");
const router = express.Router();

const {
    addStampRequestController,
    getStampRequestByIdController,
    updateStampRequestController,
    deactivateStampRequestController,
    getAllActiveStampRequestsController,
    getStampRequestsStatController,
    getAllActiveStampRequestsOfCreatorController,
    getstampRequestReportController
}
    = require("../../controller/finance/stampRequest.helper");

router.post("/add", addStampRequestController);
router.get("/getById/:stampRequestId", getStampRequestByIdController);
router.get("/assigned", getAllActiveStampRequestsOfCreatorController);
router.post("/update/:stampRequestId", updateStampRequestController);
router.post("/deactivate/:stampRequestId", deactivateStampRequestController);
router.get("/getAllActive", getAllActiveStampRequestsController);
router.get("/stat", getStampRequestsStatController);
router.post("/report", getstampRequestReportController);

module.exports = router;