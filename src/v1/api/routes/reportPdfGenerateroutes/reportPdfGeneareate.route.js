
const reportPdfRouter = Router()
import * as generatePdf from "../../controllers/reportGeneratePdfController/generatePdf.controlletr.js"
import { Router } from "express";
import { verifyEmployeeToken } from "../../middleware/authicationmiddleware.js";
reportPdfRouter.post("/generate",verifyEmployeeToken,generatePdf.generatePdf)

export default reportPdfRouter;