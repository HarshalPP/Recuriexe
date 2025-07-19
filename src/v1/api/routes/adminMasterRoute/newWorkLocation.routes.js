const express = require("express");
const router = express.Router();
// const { upload } = require("../../../Middelware/multer");
const {
  addWorkLocationController,
  getAllWorkLocationController,
  getWorkLocationByIdController,
  getWorkLocationByBranchIdController,
  updateWorkLocationController,
  deactivateWorkLocationByIdController,
  getAllInactiveWorkLocationController
} = require("../../controller/adminMaster/newWorkLocation.controller");

// const path = require("path");

router.post("/add", addWorkLocationController);
router.get("/getAll", getAllWorkLocationController);
router.get("/getById/:workLocationId", getWorkLocationByIdController);
router.get("/getByBranchId/:branchId", getWorkLocationByBranchIdController);
router.post("/delete/:workLocationId", deactivateWorkLocationByIdController);
router.post("/update", updateWorkLocationController);
router.get("/getAllInactive", getAllInactiveWorkLocationController);

module.exports = router;
