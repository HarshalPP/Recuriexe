import express from "express";
const router = express.Router();

import {
  costCenterAdd,
  updateCostCenter,
  getAllCostCenter,
  getAllCostCenterSheet,
  deleteCostCenter,
  costCenterActiveOrInactive,
} from "../../controllers/costcenterController/costCenter.controller.js"

router.post("/costCenterAdd", costCenterAdd);
router.post("/updateCostCenter", updateCostCenter);
router.get("/getAllCostCenter", getAllCostCenter);
router.get("/getAllCostCenterSheet", getAllCostCenterSheet);
router.post("/activeOrInactive", costCenterActiveOrInactive);
router.post("/delete", deleteCostCenter);

export default router;
