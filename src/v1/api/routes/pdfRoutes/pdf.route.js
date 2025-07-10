import express from "express";
const pdfRouter = express.Router();
import * as pdfController from "../../controllers/generatePdfController/generatePdf.controller.js";
import { verifyEmployeeToken } from "../../middleware/authicationmiddleware.js";
pdfRouter.post("/generate",verifyEmployeeToken,pdfController.generatePdf)

export default pdfRouter;