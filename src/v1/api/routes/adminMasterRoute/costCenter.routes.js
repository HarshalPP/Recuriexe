const express = require("express");
const router = express.Router();

const {
  costCenterAdd,
  updateCostCenter,
  getAllCostCenter,
  getAllCostCenterSheet,
  deleteCostCenter,
  costCenterActiveOrInactive,
} = require("../../controller/adminMaster/costCenter.controller");

router.post("/costCenterAdd", costCenterAdd);
router.post("/updateCostCenter", updateCostCenter);
router.get("/getAllCostCenter", getAllCostCenter);
router.get("/getAllCostCenterSheet", getAllCostCenterSheet);
router.post("/activeOrInactive", costCenterActiveOrInactive);
// router.post("/delete",deleteCostCenter)

module.exports = router;
