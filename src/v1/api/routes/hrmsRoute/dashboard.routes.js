const express = require("express");
const router = express.Router();

const {
  getAllCountData,
  getEmployeeCount,
  dropdownData,
  demographiceData,
  openPosition,
  getAllReportingManager,
  employeeHierarchy,
  getCeo
} = require("../../controller/hrms/dashboard.controller");

router.get("/getAllCountData", getAllCountData);
router.get("/getEmployeeCount", getEmployeeCount);
router.get("/dropdownData", dropdownData);
router.get("/demographiceData", demographiceData);
router.get("/openPosition", openPosition);
router.get("/getAllReportingManager", getAllReportingManager);
router.get("/employeeHierarchy", employeeHierarchy);
router.get("/getCeo", getCeo);

module.exports = router;
