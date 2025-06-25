import express from "express";
const router = express.Router();
import{jobApplyFormAdd , getAllJobApplied ,getJobAppliedDetail, getMyAppliedJobs , jobApplySendToManager , getJobFormSendManagerReview ,
     RecruitmentPipeline , getDashboardSummary , getDashboardMetrics , DeepAnalize , AnalizedCandidate , getDashboardOverview ,
      getScreeningAnalytics , getJobAppliedById , getJobApplyFields , getAllDeepAnalyses , calculatexcelcount , exportJobApplicationsExcel ,
       assignCandidateUniqueIds , convertBranchIdToArray , bulkJobApplyWithResumeExtraction , pincodeByLatitudeAndLongitude}  from "../../controllers/jobApplyformController/jobapplyform.controller.js"
import { IsAuthenticated , verifyEmployeeToken  } from "../../middleware/authicationmiddleware.js";



router.post("/jobapply"  , jobApplyFormAdd)
router.get("/getAll" , verifyEmployeeToken , getAllJobApplied)
router.get("/detail" , verifyEmployeeToken , getJobAppliedDetail)
router.get("/myAppliedJobs" , IsAuthenticated ,getMyAppliedJobs)
router.post("/sendmanagerreview" , verifyEmployeeToken , jobApplySendToManager)
router.get("/viewprofilemanager" , verifyEmployeeToken , getJobFormSendManagerReview)
router.get("/RecruitmentPipeline" , verifyEmployeeToken ,  RecruitmentPipeline)
router.get("/getDashboardSummary"  ,  verifyEmployeeToken ,getDashboardSummary)
router.get("/getDashboardMetrics" ,  verifyEmployeeToken , getDashboardMetrics)
router.get("/getJobAppliedById/:id" , verifyEmployeeToken , getJobAppliedById)
router.get("/getJobApplyFields" , verifyEmployeeToken , getJobApplyFields)
router.post("/calculatexcelcount" , verifyEmployeeToken , calculatexcelcount)
router.post("/exportJobApplicationsExcel" , verifyEmployeeToken , exportJobApplicationsExcel)
router.get("/assignCandidateUniqueIds" , verifyEmployeeToken , assignCandidateUniqueIds)


// AI Analizer //
router.get("/analizedCandidate" , verifyEmployeeToken , AnalizedCandidate)
router.get("/viewAnalizedata/:id" , verifyEmployeeToken  , DeepAnalize)
router.get("/getAllDeepAnalyses" , verifyEmployeeToken , getAllDeepAnalyses)
router.get("/AIDashboard" ,verifyEmployeeToken , getDashboardOverview )
router.get("/getScreeningAnalytics" , verifyEmployeeToken , getScreeningAnalytics)

// data update 
router.get("/convertBranchIdToArray",convertBranchIdToArray)
router.post("/bulkJobApplyWithResumeExtraction" , verifyEmployeeToken , bulkJobApplyWithResumeExtraction)

router.post("/pincodeByLatitudeAndLongitude" , pincodeByLatitudeAndLongitude)

export default router;