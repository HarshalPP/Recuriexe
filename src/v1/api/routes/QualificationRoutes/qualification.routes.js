import express from "express"
const router = express.Router()


import {createQualification , getAllQualifications  , getQualificationById , updateQualification , deleteQualification} from "../../controllers/QualificationController/Qualifincation.controller.js"


router.post("/createQualification" , createQualification)
router.get("/getAllQualifications" , getAllQualifications)
router.post("/updateQualification/:id" , updateQualification)
router.post("/deleteQualification/:id" , deleteQualification)


export default router;