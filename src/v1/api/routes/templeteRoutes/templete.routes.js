import express from 'express'
const router = express.Router();


import {getAvailablePlaceholders , createTemplate , listTemplates , getTemplate , generateLinkedInPostAndPdf ,
     generateLinkedInPostAndPdfDynamic , createTemplateTest , updateTemplate , deleteTemplate } from "../../controllers/templeteController/templete.controller.js"
import { verifyEmployeeToken } from '../../middleware/authicationmiddleware.js';


router.get("/getAvailablePlaceholders" , getAvailablePlaceholders)
router.post("/create" , verifyEmployeeToken , createTemplateTest)
router.get("/listTemplates" , verifyEmployeeToken , listTemplates)
router.get("/getTemplete/:templateId" ,verifyEmployeeToken , getTemplate)
router.post('/update',verifyEmployeeToken , updateTemplate)
router.post("/generateLinkedInPostAndPdf" , verifyEmployeeToken , generateLinkedInPostAndPdfDynamic)
router.post("/deleteTemplate" , verifyEmployeeToken , deleteTemplate)

export default router;
 
