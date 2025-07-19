const express = require("express");
const router = express.Router();

const {
    addPdExpenceController,
    getPdExpenceByIdController,
    updatePdExpenceController,
    deactivePdExpenceController,
    getAllActivePdExpenceController,
    getAllActivePdExpencesOfCreatorController,
    getPdExpenceStatsController
} = require("../../controller/finance/pdExpence.controller");

router.post("/add", addPdExpenceController);
router.get("/getById/:pdExpenceId", getPdExpenceByIdController);
router.post("/update/:pdExpenceId", updatePdExpenceController);
router.post("/deactivate/:pdExpenceId", deactivePdExpenceController);
router.get("/getAllActive", getAllActivePdExpenceController);
router.get("/assigned", getAllActivePdExpencesOfCreatorController);
router.get("/stat", getPdExpenceStatsController);


module.exports = router;