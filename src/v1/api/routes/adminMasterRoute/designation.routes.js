const express = require("express");
const router = express.Router();

const {
  designationAdd,
  updateDesignation,
  designationByDepartmentId,
  getAllDesignation,
  deleteDesignation,
  designationActiveOrInactive,
  getAllDesignationSheet,
} = require("../../controller/adminMaster/designation.controller");

router.post("/designationAdd", designationAdd);
router.post("/updateDesignation", updateDesignation);
router.get("/getAllDesignation", getAllDesignation);
router.get("/getAllDesignationSheet", getAllDesignationSheet);
router.get("/detailBy/:departmentId", designationByDepartmentId);
router.post("/activeOrInactive", designationActiveOrInactive);
// router.post("/delete",deleteDesignation)

module.exports = router;
