import express from "express"
const router = express.Router()

import { verifyEmployeeToken } from "../../middleware/authicationmiddleware.js";

import {createQualification , getAllQualifications  , getQualificationById , updateQualification , deleteQualification} from "../../controllers/QualificationController/Qualifincation.controller.js"


router.post("/createQualification" ,verifyEmployeeToken ,  createQualification)
router.get("/getAllQualifications" ,verifyEmployeeToken,  getAllQualifications)
router.post("/updateQualification/:id" , updateQualification)
router.post("/deleteQualification/:id" , deleteQualification)


export default router;