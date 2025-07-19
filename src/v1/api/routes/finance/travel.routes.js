const express = require("express");
const router = express.Router();
const {addTravelController , getTravelByIdController, updateTravelController , deactivateTravelController , getAllActiveTravelsController , getTravelStatsController , getAllActiveTravelOfCreatorController , getTravelReportController} = require("../../controller/finance/travel.controller");
const {createState , getAllStates , getCitiesByStateId} = require("../../helper/finance/state.helper")


router.post("/add", addTravelController);
router.get("/getById/:travelId", getTravelByIdController);
router.post("/update/:travelId", updateTravelController);
router.post("/deactivate/:travelId", deactivateTravelController);
router.get("/getAllActive", getAllActiveTravelsController);
router.get("/stat", getTravelStatsController);
router.get("/assigned", getAllActiveTravelOfCreatorController);
router.get("/report", getTravelReportController);


// state routes

router.post("/state/create", createState);
router.get("/state/getAll", getAllStates);
router.get("/city", getCitiesByStateId);


module.exports = router;