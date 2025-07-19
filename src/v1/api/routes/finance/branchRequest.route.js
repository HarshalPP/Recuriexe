const express = require("express");
const router = express.Router();

const {
    addBranchRequestController,
    getBranchRequestByIdController,
    getBranchRequestsByLenderController,
    updateBranchRequestController,
    deactivateBranchRequestController,
    getAllActiveBranchRequestsController,
    getAllActiveBranchRequestsByCreatorController,
    getBranchRequestsStatController,
    getBranchRequestsReportController
} = require("../../controller/finance/branchRequest.helper");

router.post("/add", addBranchRequestController);
router.get("/getById/:branchRequestId", getBranchRequestByIdController);
router.get("/assigned", getAllActiveBranchRequestsByCreatorController);
router.post("/update/:branchRequestId", updateBranchRequestController);
router.post("/deactivate/:branchRequestId", deactivateBranchRequestController);
router.get("/getAllActive", getAllActiveBranchRequestsController);
router.get("/stat", getBranchRequestsStatController);
router.post("/report", getBranchRequestsReportController);

module.exports = router;
