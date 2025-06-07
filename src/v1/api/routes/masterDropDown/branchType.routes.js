import express from "express";
import {
  createBranchType,
  listBranchTypes,
  getBranchType,
  updateBranchType,
  dropdownBranchType,
  activeAndInactiveBranchType,dataAddOnModel
} from "../../controllers/masterDropDown/branchType.controller.js";

const router = express.Router();

router.post("/create", createBranchType);
router.get("/list", listBranchTypes);
router.get("/detail", getBranchType);
router.post("/update", updateBranchType);
router.get("/dropdown", dropdownBranchType);
router.post("/activeAndInactive", activeAndInactiveBranchType)

router.post("/addData", dataAddOnModel)

export default router;
