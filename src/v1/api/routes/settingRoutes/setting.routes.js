import express from "express"
import {getSettings , updateSettings , candidatesettings , updatecandidatesettings , getJobPostSettings , updateJobPostSettings} from "../../controllers/authController/settingController/setting.controller.js"
import { verifyEmployeeToken } from "../../middleware/authicationmiddleware.js";
const router = express.Router();



router.get("/get" , getSettings)
router.post("/update" , updateSettings)


// candidate setting routes //

router.get("/getcandidate" , candidatesettings)
router.post("/updatesetting" , updatecandidatesettings)


// jOB post setting routes //

router.get("/getJobPostSettings" , verifyEmployeeToken , getJobPostSettings)
router.post("/updateJobPostSettings" , verifyEmployeeToken , updateJobPostSettings)



export default router;