import express from 'express'
const router = express.Router();
import {addJobDescription , getJobdescription , updateJobDes , generateFormattedJobDescription , AIgeneratedJd , generateLinkedInPost} from "../../controllers/jobdescriptionController/jobdescription.controller.js"
import {verifyEmployeeToken} from "../../middleware/authicationmiddleware.js"


router.post("/Add" ,  verifyEmployeeToken , addJobDescription)
router.get("/getAll"  , verifyEmployeeToken , getJobdescription)
router.post("/update" , verifyEmployeeToken , updateJobDes)
router.post("/generateFormattedJobDescription" , verifyEmployeeToken , generateFormattedJobDescription)
router.post("/AIgeneratedJd" , verifyEmployeeToken , AIgeneratedJd)
router.post("/generateLinkedInPost" , verifyEmployeeToken , generateLinkedInPost)

export default router;