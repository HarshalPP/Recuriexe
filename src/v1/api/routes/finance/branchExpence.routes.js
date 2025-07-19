const express = require("express");
const router = express.Router();

const {
    addbranchExpenceController,
    getbranchExpenceByIdController,
    updatebranchExpenceController,
    deactivebranchExpenceController,
    getAllActivebranchExpenceController,
    getAllActiveBranchExpencesOfCreatorController,
    getBranchExpenceStatsController
} = require("../../controller/finance/branchExpence.controller");

router.post("/add", addbranchExpenceController);
router.get("/getById/:branchExpenceId", getbranchExpenceByIdController);
router.get("/assigned", getAllActiveBranchExpencesOfCreatorController);
router.post("/update/:branchExpenceId", updatebranchExpenceController);
router.post("/deactivate/:branchExpenceId", deactivebranchExpenceController);
router.get("/getAllActive", getAllActivebranchExpenceController);
router.get("/stat", getBranchExpenceStatsController);



module.exports = router;