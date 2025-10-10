import express from "express"
import { sendMail, getAllUsers, disconnectGoogleAccount,setDefaultEmail } from "../../controllers/gmailController/gmailController.js"
import {verifyEmployeeToken} from '../../middleware/authicationmiddleware.js'
const router = express.Router();

router.post("/send",verifyEmployeeToken,  sendMail)
router.get("/users",verifyEmployeeToken, getAllUsers)
router.put('/disconnect/:userId',verifyEmployeeToken, disconnectGoogleAccount); 
router.post("/set-default/:emailId", verifyEmployeeToken, setDefaultEmail);


export default router