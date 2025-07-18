import express from "express"
import { sendMail, getAllUsers, disconnectGoogleAccount,setDefaultEmail,forceSetDefaultEmail } from "../../controllers/gmailController/gmailController.js"
import {verifyEmployeeToken} from '../../middleware/authicationmiddleware.js'
const router = express.Router();

router.post("/send",verifyEmployeeToken,  sendMail)
router.get("/users",verifyEmployeeToken, getAllUsers)
router.put('/disconnect/:userId',verifyEmployeeToken, disconnectGoogleAccount); 
router.patch("/set-default/:emailId", verifyEmployeeToken, setDefaultEmail);
router.patch("/force-default/:emailId", verifyEmployeeToken, forceSetDefaultEmail);


export default router