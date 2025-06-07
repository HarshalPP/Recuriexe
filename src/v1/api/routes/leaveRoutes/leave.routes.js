import express from "express";
const router = express.Router();
import {verifyEmployeeToken} from "../../middleware/authicationmiddleware.js"
import {addLeaveType , getAllLeaveType , UpdateLeaveType , addEmployeeLeave , getAllLeave , getLeaveForEmployee , getLeaveReportingManager , approvalEmployeeLeave} from "../../controllers/leaveController/leave.controller.js"


router.post("/add" , verifyEmployeeToken ,  addLeaveType)
router.get("/get" , verifyEmployeeToken , getAllLeaveType )
router.post("/update" , verifyEmployeeToken , UpdateLeaveType)



// Apply for leavev //

router.post("/applyleave" , verifyEmployeeToken , addEmployeeLeave)
router.get("/getAllLeave" , verifyEmployeeToken ,  getAllLeave)
router.get("/getLeaveForEmployee" , verifyEmployeeToken , getLeaveForEmployee)
router.get("/getLeaveReportingManager" , verifyEmployeeToken , getLeaveReportingManager)
router.post("/approvalEmployeeLeave" , verifyEmployeeToken , approvalEmployeeLeave)



export default router;