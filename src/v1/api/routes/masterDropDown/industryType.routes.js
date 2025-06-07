import express from "express";
import {
  createIndustryType,
  listIndustryTypes,
  getIndustryType,
  updateIndustryType,
  dropdownIndustryType,
  activeAndInactiveIndustryType,
} from "../../controllers/masterDropDown/industryType.controller.js";

const router = express.Router();

router.post("/create", createIndustryType);
router.get("/list", listIndustryTypes);
router.get("/detail", getIndustryType);
router.post("/update", updateIndustryType);
router.get("/dropdown", dropdownIndustryType);
router.post("/activeAndInactive", activeAndInactiveIndustryType)

export default router;
