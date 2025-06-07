import express from "express";
const router = express.Router();

import { jobSaveAddRemove, getJobSaveList } from "../../controllers/jobpostController/jobSave.controller.js"
import { verifyEmployeeToken , IsAuthenticated  } from "../../middleware/authicationmiddleware.js"


router.post("/addAndRemove", IsAuthenticated, jobSaveAddRemove)
router.get("/get", IsAuthenticated, getJobSaveList)


export default router;