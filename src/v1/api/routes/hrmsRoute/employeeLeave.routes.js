const express = require("express");
const router = express.Router();

const {
    addEmployeeLeave,
    getAllLeave,
    getLeavereportingmanager,
    approvalEmployeeLeave,
    getLeaveForEmployee,
} = require("../../controller/hrms/employeeLeave.controller");

const {

    manageHoliday,
    getAllHolidays,
    getHolidayById,
    deleteHoliday,
    managesunday,
    deletesunday,
    getsundaybyid,
    getsunday,


} = require("../../controller/hrms/holiday.controller");

router.post("/addEmployeeLeave", addEmployeeLeave);
router.get("/getAllLeave", getAllLeave);
router.get("/getLeavereportingmanager", getLeavereportingmanager);
router.post("/approvalEmployeeLeave", approvalEmployeeLeave);
router.get("/getLeaveForEmployee", getLeaveForEmployee);


// ------------------Holiday Routes-------------------
router.post("/AddHoliday", manageHoliday);
router.get("/getAllHolidays", getAllHolidays);
router.get("/getHolidayById", getHolidayById);
router.post("/deleteHoliday", deleteHoliday);


//----------- Manage sunday working ----------------/// 

router.post("/AddSunday" , managesunday)
router.get("/getAllSundays", getsunday);
router.get("/getSundayById", getsundaybyid);
router.post("/deleteSunday", deletesunday);






module.exports = router;
