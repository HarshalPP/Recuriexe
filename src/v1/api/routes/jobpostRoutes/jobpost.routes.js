import express from "express";
const router = express.Router();

import {jobPostAdd , getAllJobPost , updateJobPost , getAllJobPostwithoutToken , getPostDashBoard , jobPostAddDirect } from "../../controllers/jobpostController/jobpost.controller.js"
import {verifyEmployeeToken} from "../../middleware/authicationmiddleware.js"


router.post("/jobPostAdd" ,  verifyEmployeeToken , jobPostAdd)
router.post("/jobPostAddDirect" , verifyEmployeeToken , jobPostAddDirect)
// router.post("/jobPostAddDirect " , getAllJobPostwithoutToken)
router.get("/getAllJobPost"  , getAllJobPost)
router.post("/updatePost/:id" , verifyEmployeeToken , updateJobPost)
router.get("/dashboard" , getPostDashBoard)

 
export default router;