import express from "express";
const router = express.Router()
import { IsAuthenticated , verifyEmployeeToken  } from "../../middleware/authicationmiddleware.js";
import {scheduleHrInterview , UpdateInterviewfeedback , jobApplyFormStatusChange , getRejectedJobForms , rescheduleHrInterview , getAllReportingManager , 
    getAllEmployees , sendPreOfferCandidate , calculateCTCFromLpa , createOfferLetterPDF , createOfferlettertwo , createOfferletter3 , sendOfferLetterCandidate , schudeleInterview , getCandidateDashboard , changeResumeShortlistedStatus}  from "../../controllers/candidateController/candidate.controller.js"


router.post("/scheduleInterview" , verifyEmployeeToken , scheduleHrInterview)
router.post("/feedback" , verifyEmployeeToken , UpdateInterviewfeedback)
router.post("/jobApplyFormStatusChange" , verifyEmployeeToken , jobApplyFormStatusChange)
router.get("/rejectjobforms" , verifyEmployeeToken , getRejectedJobForms)
router.post("/rescheduleInterview" ,verifyEmployeeToken ,  rescheduleHrInterview)
router.get("/reportingManager" , getAllReportingManager)
router.get("/employee" ,verifyEmployeeToken , getAllEmployees)
router.post("/preofferletter" , verifyEmployeeToken , sendPreOfferCandidate)
router.post("/generateofferletter1" , verifyEmployeeToken , createOfferLetterPDF)
router.post("/generateofferletter2" , verifyEmployeeToken , createOfferlettertwo)
router.post("/generateofferletter3" , verifyEmployeeToken , createOfferletter3)
router.post("/sendOfferletter" , verifyEmployeeToken , sendOfferLetterCandidate)
router.get("/checkscheduleInterview" , verifyEmployeeToken , schudeleInterview)
router.get("/getCandidateDashboard" , IsAuthenticated , getCandidateDashboard)
router.post("/resumeShortlisted" ,  verifyEmployeeToken , changeResumeShortlistedStatus)


// calculate pf //

router.post("/calculate" ,  verifyEmployeeToken , calculateCTCFromLpa)

export default router;