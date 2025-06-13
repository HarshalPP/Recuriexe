import express from "express";
const router = express.Router();

import {
  employmentTypeAdd,
  updateEmploymentType,
  getAllEmploymentType,
  getAllListEmploymentType,
  getAllEmploymentTypeSheet,
  employmentTypeActiveOrInactive,
  deleteEmploymentType,
} from "../../controllers/employeementTypeController/employeementtype.controller.js"
import { verifyEmployeeToken } from "../../middleware/authicationmiddleware.js";

router.post("/employmentTypeAdd", verifyEmployeeToken, employmentTypeAdd);
router.post("/updateEmploymentType", verifyEmployeeToken, updateEmploymentType);
router.get("/getAllEmploymentType", getAllEmploymentType);
router.get("/getAllListEmploymentType",verifyEmployeeToken, getAllListEmploymentType);
router.get("/getAllEmploymentTypeSheet", getAllEmploymentTypeSheet);
router.post("/activeOrInactive", verifyEmployeeToken ,employmentTypeActiveOrInactive);
// Uncomment if you want to use delete route
// router.delete("/deleteEmploymentType", deleteEmploymentType);

export default router;
