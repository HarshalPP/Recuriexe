import express from "express"
import {getSettings , updateSettings , candidatesettings , updatecandidatesettings} from "../../controllers/authController/settingController/setting.controller.js"
const router = express.Router();



router.get("/get" , getSettings)
router.post("/update" , updateSettings)


// candidate setting routes //

router.get("/getcandidate" , candidatesettings)
router.post("/updatesetting" , updatecandidatesettings)


export default router;