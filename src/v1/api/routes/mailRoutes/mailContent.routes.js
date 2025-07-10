import express from 'express';
const router = express.Router();

import { addMailContent, getMailContent, sendDynamicMailByTemplateId } from "../../controllers/mailController/mailContent.controller.js"
import { verifyEmployeeToken } from '../../middleware/authicationmiddleware.js';

import { getEmailPlaceholders } from "../../helper/mail/mailContent.helper.js"

router.post("/add", verifyEmployeeToken, addMailContent)
router.get("/get", getMailContent)
router.get('/getEmailPlaceholders',verifyEmployeeToken,  getEmailPlaceholders)
router.get('/sendMailTemplate', sendDynamicMailByTemplateId)

export default router;
