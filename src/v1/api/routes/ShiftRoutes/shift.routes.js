import express from "express";
import {createShift , getAllShifts , updateShift , deleteShift , assignDepartmentsAndBranches}  from "../../controllers/shiftController/shift.controller.js"
import {verifyEmployeeToken} from "../../middleware/authicationmiddleware.js"
const router = express.Router();


router.post("/addShift" , verifyEmployeeToken , createShift)
router.get("/getShfit" , verifyEmployeeToken , getAllShifts)
router.post("/updateShift/:id" , verifyEmployeeToken , updateShift)
router.post("/deleteShift/:id" , verifyEmployeeToken , deleteShift)
router.post("/assignDepartmentsAndBranches/:shiftId" , verifyEmployeeToken , assignDepartmentsAndBranches)
export default router;