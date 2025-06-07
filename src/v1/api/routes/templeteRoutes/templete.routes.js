import express from 'express'
const router = express.Router();


import {getAvailablePlaceholders , createTemplate , listTemplates , getTemplate , generateLinkedInPostAndPdf} from "../../controllers/templeteController/templete.controller.js"
import { verifyEmployeeToken } from '../../middleware/authicationmiddleware.js';



router.get("/getAvailablePlaceholders" , getAvailablePlaceholders)
router.post("/create" , verifyEmployeeToken , createTemplate)
router.get("/listTemplates" , verifyEmployeeToken , listTemplates)
router.get("/getTemplete/:templateId" ,verifyEmployeeToken , getTemplate)
router.post("/generateLinkedInPostAndPdf" , verifyEmployeeToken , generateLinkedInPostAndPdf )


export default router;