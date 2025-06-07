import express from "express";
const router = express.Router();
import{jobApplyFormAdd , getAllJobApplied ,getJobAppliedDetail, getMyAppliedJobs , jobApplySendToManager , getJobFormSendManagerReview , RecruitmentPipeline , getDashboardSummary , getDashboardMetrics , DeepAnalize , AnalizedCandidate , getDashboardOverview , getScreeningAnalytics }  from "../../controllers/jobApplyformController/jobapplyform.controller.js"
import { IsAuthenticated , verifyEmployeeToken  } from "../../middleware/authicationmiddleware.js";



router.post("/jobapply"  , jobApplyFormAdd)
router.get("/getAll" , verifyEmployeeToken , getAllJobApplied)
router.get("/detail" , verifyEmployeeToken , getJobAppliedDetail)
router.get("/myAppliedJobs" , IsAuthenticated ,getMyAppliedJobs)
router.post("/sendmanagerreview" , verifyEmployeeToken , jobApplySendToManager)
router.get("/viewprofilemanager" , verifyEmployeeToken , getJobFormSendManagerReview)
router.get("/RecruitmentPipeline" , verifyEmployeeToken ,  RecruitmentPipeline)
router.get("/getDashboardSummary"  , getDashboardSummary)
router.get("/getDashboardMetrics" , getDashboardMetrics)


// AI Analizer //
router.get("/analizedCandidate" , verifyEmployeeToken , AnalizedCandidate)
router.get("/viewAnalizedata/:id" , verifyEmployeeToken  , DeepAnalize)
router.get("/AIDashboard" ,verifyEmployeeToken , getDashboardOverview )
router.get("/getScreeningAnalytics" , verifyEmployeeToken , getScreeningAnalytics)


export default router;