const express = require("express");
const router = express.Router();
const {addLeaveType , getAllLeaveType} = require("../../controller/hrms/leaveType.controller");



// ------------------Leave Type Routes-------------------
router.post("/addLeaveType", addLeaveType);
router.get("/getAllLeaveType", getAllLeaveType);


module.exports = router;