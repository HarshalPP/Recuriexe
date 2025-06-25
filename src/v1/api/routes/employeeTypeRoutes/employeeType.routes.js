import express from "express";
const router = express.Router();

import {
  employeTypeAdd,
  updateEmployeType,
  getAllEmployeeTypeSheet,
  getAllEmployeType,
  employeTypeActiveOrInactive,
  deleteEmployeeType,
  uploadEmployeetype
} from "../../controllers/employeeTypeController/employeetype.controller.js"

import {verifyEmployeeToken} from "../../middleware/authicationmiddleware.js";

router.post("/employeTypeAdd",  verifyEmployeeToken , employeTypeAdd);
router.post("/updateEmployeType", verifyEmployeeToken , updateEmployeType);
router.get("/getAllEmployeType", verifyEmployeeToken , getAllEmployeType);
router.get("/getAllEmployeeTypeSheet", verifyEmployeeToken , getAllEmployeeTypeSheet);
// router.post("/delete", deleteEmployeeType);
router.post("/activeOrInactive", verifyEmployeeToken , employeTypeActiveOrInactive);
router.post("/uploadEmployeetype" , verifyEmployeeToken , uploadEmployeetype)

export default router;

