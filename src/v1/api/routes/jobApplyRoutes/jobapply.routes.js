import express from "express";
const router = express.Router();
import{jobApplyFormAdd , getAllJobApplied ,getJobAppliedDetail, getMyAppliedJobs , jobApplySendToManager , getJobFormSendManagerReview , RecruitmentPipeline , getDashboardSummary , getDashboardMetrics}  from "../../controllers/jobApplyformController/jobapplyform.controller.js"
import { IsAuthenticated , verifyEmployeeToken  } from "../../middleware/authicationmiddleware.js";



router.post("/jobapply" ,  IsAuthenticated , jobApplyFormAdd)
router.get("/getAll" , verifyEmployeeToken , getAllJobApplied)
router.get("/detail" , verifyEmployeeToken , getJobAppliedDetail)
router.get("/myAppliedJobs" , IsAuthenticated ,getMyAppliedJobs)
router.post("/sendmanagerreview" , verifyEmployeeToken , jobApplySendToManager)
router.get("/viewprofilemanager" , verifyEmployeeToken , getJobFormSendManagerReview)
router.get("/RecruitmentPipeline" , verifyEmployeeToken ,  RecruitmentPipeline)
router.get("/getDashboardSummary"  , getDashboardSummary)
router.get("/getDashboardMetrics" , getDashboardMetrics)


export default router;