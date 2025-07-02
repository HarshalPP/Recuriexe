import express from "express";
const router = express.Router();
import { addInterview , updateInterview , allInterViewDetail , detailInterview,addBulkInterviews,getAllScheduledInterviews } from "../../controllers/interviewController/interview.controller.js"
import { IsAuthenticated, verifyEmployeeToken } from "../../middleware/authicationmiddleware.js";

import {createAauthURLByEmail , oauth2callback} from "../../controllers/interviewController/googleAuth.js"

router.post("/add", verifyEmployeeToken, addInterview);
router.post("/interview/bulkSchedule", verifyEmployeeToken, addBulkInterviews);
router.post("/update", verifyEmployeeToken, updateInterview);
router.get('/getScheduledInterviews', verifyEmployeeToken, getAllScheduledInterviews);

router.get("/detailInterview" , verifyEmployeeToken , detailInterview)

router.get('/allInterViewDetail' , verifyEmployeeToken ,allInterViewDetail)
router.post("/createAauthURLByEmail",verifyEmployeeToken , createAauthURLByEmail)
router.post("/oauth2callback" , verifyEmployeeToken , oauth2callback)



export default router;