const express = require("express");
const router = express.Router();
// const { upload } = require("../../../Middelware/multer");
const {
  addDesignationController,
  getAllDesignationController,
  getAllInactiveDesignationController,
  updateDesignationController,
  getDesignationByIdController,
  deactivateDesignationByIdController
} = require("../../controller/adminMaster/newDesignation.controller");

// const path = require("path");

router.post("/add", addDesignationController);
router.get("/getAll", getAllDesignationController);
router.get("/getAllInactive", getAllInactiveDesignationController);
router.get("/getDesignationById/:designationId", getDesignationByIdController);
router.post("/delete/:designationId", deactivateDesignationByIdController);
router.post("/update", updateDesignationController);

module.exports = router;
