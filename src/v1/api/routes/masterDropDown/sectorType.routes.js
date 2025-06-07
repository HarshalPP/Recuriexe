import express from "express";
import {
  addSectorType,
  getSectorTypeById,
  getSectorTypeList,
  updateSectorTypeById,
  dropdownSectorType,
  activeAndInactiveSectorType,
} from "../../controllers/masterDropDown/sectorType.controller.js";

const router = express.Router();

router.post("/add", addSectorType);
router.get("/detail", getSectorTypeById); // ?id=...
router.get("/list", getSectorTypeList);
router.post("/update", updateSectorTypeById);
router.get("/dropdown", dropdownSectorType);
router.post("/activeAndInactive", activeAndInactiveSectorType)

export default router;
