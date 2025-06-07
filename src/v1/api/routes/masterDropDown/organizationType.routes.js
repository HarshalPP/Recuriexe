import express from "express";
import {
  createOrganizationType,
  listOrganizationTypes,
  getOrganizationType,
  updateOrganizationTypeById,
  dropdownOrganizationType,
  activeAndInactiveOrganizationType,
} from "../../controllers/masterDropDown/organizationType.controller.js";

const router = express.Router();

router.post("/create", createOrganizationType);
router.get("/list", listOrganizationTypes);
router.get("/detail", getOrganizationType);
router.post("/update", updateOrganizationTypeById);
router.get("/dropdown", dropdownOrganizationType);
router.post("/activeAndInactive", activeAndInactiveOrganizationType)

export default router;
