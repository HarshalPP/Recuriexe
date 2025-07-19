const express = require("express");
const router = express.Router();

const {
  departmentAdd,
  updateDepartment,
  departmentByworkLocationId,
  departmentActiveOrInactive,
  getAllDepartment,
  getAllDepartmentSheet,
  deleteDepartment,
} = require("../../controller/adminMaster/department.controller");

router.post("/departmentAdd", departmentAdd);
router.post("/updateDepartment", updateDepartment);
router.get("/getAllDepartment", getAllDepartment);
router.get("/getAllDepartmentSheet", getAllDepartmentSheet);
router.get("/detailBy/:workLocationId", departmentByworkLocationId);
router.post("/delete", deleteDepartment);
router.post("/activeOrInactive", departmentActiveOrInactive);

module.exports = router;
