import express from "express"
const router = express.Router();


import {manageHoliday , checkOrListHolidays , deleteHoliday , holidayDashboard } from "../../controllers/calenderController/holidayController/holiday.controller.js"
import {manageSunday , getSunday , getSundayById , deleteSunday , sundayDashboard} from "../../controllers/calenderController/sundayController/sunday.controller.js"
import { IsAuthenticated , verifyEmployeeToken  } from "../../middleware/authicationmiddleware.js";

// Holiday Routes //
router.post("/addholiday" , verifyEmployeeToken , manageHoliday)
router.get('/holidays/check-or-list' ,verifyEmployeeToken ,  checkOrListHolidays)
router.post("/holidays/deleteHoliday/:id" , verifyEmployeeToken , deleteHoliday)
router.get("/holidays-dashboard" , verifyEmployeeToken , holidayDashboard)



// Sunday Workking Routes //

router.post("/addSundayWorking" ,  verifyEmployeeToken , manageSunday)
router.get("/getSunday" ,  verifyEmployeeToken , getSunday)
router.get("/getSundayById" ,  verifyEmployeeToken , getSundayById)
router.post("/deleteSunday" ,  verifyEmployeeToken , deleteSunday)
router.get("/sunday_dashboard" , verifyEmployeeToken , sundayDashboard)

export default router;