const express = require("express");
const router = express.Router();

const {
  employeTypeAdd,
  updateEmployeType,
  getAllEmployeeTypeSheet,
  getAllEmployeType,
  employeTypeActiveOrInactive,
  deleteEmployeeType,
} = require("../../controller/adminMaster/employeType.controller");

router.post("/employeTypeAdd", employeTypeAdd);
router.post("/updateEmployeType", updateEmployeType);
router.get("/getAllEmployeType", getAllEmployeType);
router.get("/getAllEmployeeTypeSheet", getAllEmployeeTypeSheet);
// router.post("/delete",deleteEmployeeType)
router.post("/activeOrInactive", employeTypeActiveOrInactive);
module.exports = router;
