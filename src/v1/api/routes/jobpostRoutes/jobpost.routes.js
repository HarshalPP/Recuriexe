import express from "express";
const router = express.Router();

import {jobPostAdd , getAllJobPost , updateJobPost , getAllJobPostwithoutToken , getPostManDashBoard ,
     jobPostAddDirect  ,
      getDashboardAnalytics,
      assignJobPostIdsToOldPosts,
      getAllJobPostBypermission,
      jobPostapproveAndReject,
      exportJobPostsExcel,
      qualificationDataUpdate,
     } from "../../controllers/jobpostController/jobpost.controller.js"
import {verifyEmployeeToken} from "../../middleware/authicationmiddleware.js"


router.post("/jobPostAdd" ,  verifyEmployeeToken , jobPostAdd)
router.post("/jobPostAddDirect" , verifyEmployeeToken , jobPostAddDirect)
// router.post("/jobPostAddDirect " , getAllJobPostwithoutToken)
router.post("/jobPostapproveAndReject", verifyEmployeeToken , jobPostapproveAndReject)
router.get("/getAllJobPost"   , getAllJobPost)
router.get("/getAllJobPostBypermission"  ,verifyEmployeeToken ,  getAllJobPostBypermission)
router.post("/updatePost/:id" , verifyEmployeeToken , updateJobPost)
router.get("/manDashboard" ,verifyEmployeeToken , getPostManDashBoard)
router.get("/getDashboardAnalytics",verifyEmployeeToken , getDashboardAnalytics)
router.get("/assignJobPostIdsToOldPosts" , verifyEmployeeToken , assignJobPostIdsToOldPosts)
router.post("/exportJobPostsExcel" , verifyEmployeeToken , exportJobPostsExcel)

router.get("/qualificationDataUpdate", qualificationDataUpdate )

 
export default router;   