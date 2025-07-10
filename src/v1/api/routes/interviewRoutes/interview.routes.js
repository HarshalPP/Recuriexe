import express from "express";
const router = express.Router();
import {
     addInterview, updateInterview, allInterViewDetail, detailInterview, addBulkInterviews, getAllScheduledInterviews, getAllEmploye,
     startAIInterview, interviewTurnHandler, getCallDashboardStats, getInterviewHistory, getInterviewScheduleCalender, hrByApproveAndReject,
     completeInterviewManually , candidateLastRoundReview
} from "../../controllers/interviewController/interview.controller.js"
import { IsAuthenticated, verifyEmployeeToken } from "../../middleware/authicationmiddleware.js";

import { createAuthURLByEmail, oauth2callback } from "../../controllers/interviewController/googleAuth.js"

router.post("/add", verifyEmployeeToken, addInterview);
router.post("/interview/bulkSchedule", verifyEmployeeToken, addBulkInterviews);
router.post("/update", verifyEmployeeToken, updateInterview);
router.get('/getScheduledInterviews', verifyEmployeeToken, getAllScheduledInterviews);
router.get("/getAllEmployee", verifyEmployeeToken, getAllEmploye)


router.get("/detailInterview", verifyEmployeeToken, detailInterview)
router.get('/DashBoard', verifyEmployeeToken, getCallDashboardStats);

router.get('/allInterViewDetail', verifyEmployeeToken, allInterViewDetail)

router.post("/createAuthURLByEmail", verifyEmployeeToken, createAuthURLByEmail)
router.post("/oauth2callback", verifyEmployeeToken, oauth2callback)
router.post("/startAIInterview", verifyEmployeeToken, startAIInterview)
router.post("/interviewTurnHandler", interviewTurnHandler)
router.get("/getInterviewHistory", verifyEmployeeToken, getInterviewHistory)
router.post("/completeInterviewManually", completeInterviewManually)
router.get("/calender", verifyEmployeeToken, getInterviewScheduleCalender)
router.post("/approveByHr", verifyEmployeeToken, hrByApproveAndReject)
router.get("/candidateLastReview" ,verifyEmployeeToken , candidateLastRoundReview)



export default router;