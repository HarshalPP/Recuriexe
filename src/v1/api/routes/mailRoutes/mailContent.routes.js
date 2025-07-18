import express from 'express';
const router = express.Router();

import { addMailContent, getMailContent, sendDynamicMailByTemplateId ,senderMailIds , getMailContentList , updateMailContent } from "../../controllers/mailController/mailContent.controller.js"
import { verifyEmployeeToken } from '../../middleware/authicationmiddleware.js';

import { getEmailPlaceholders } from "../../helper/mail/mailContent.helper.js"

router.post("/add", verifyEmployeeToken, addMailContent)
router.get("/get", verifyEmployeeToken , getMailContent)
router.get('/list', verifyEmployeeToken, getMailContentList)
router.post('/update', verifyEmployeeToken, updateMailContent)
router.get('/getEmailPlaceholders',verifyEmployeeToken,  getEmailPlaceholders)
router.post('/sendMailTemplate', sendDynamicMailByTemplateId)
router.get("/senderMail", verifyEmployeeToken, senderMailIds)

export default router;
