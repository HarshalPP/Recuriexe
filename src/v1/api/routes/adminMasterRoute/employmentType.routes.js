const express = require("express");
const router = express.Router();

const {
  employmentTypeAdd,
  updateEmploymentType,
  getAllEmploymentType,
  getAllEmploymentTypeSheet,
  employmentTypeActiveOrInactive,
  deleteEmploymentType,
} = require("../../controller/adminMaster/employmentType.controller");

router.post("/employmentTypeAdd", employmentTypeAdd);
router.post("/updateEmploymentType", updateEmploymentType);
router.get("/getAllEmploymentType", getAllEmploymentType);
router.get("/getAllEmploymentTypeSheet", getAllEmploymentTypeSheet);
// router.post("/delete",deleteEmploymentType)
router.post("/activeOrInactive", employmentTypeActiveOrInactive);

module.exports = router;
