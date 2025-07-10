import { Router } from "express";
import * as emailTempalteController from "../../controllers/emialtemplatecontroller/pdfTemplate.controller.js";
import { verifyEmployeeToken } from "../../middleware/authicationmiddleware.js";

const emailtemplateRouter = Router();

emailtemplateRouter.post("/add",verifyEmployeeToken,emailTempalteController.saveTemplate)

emailtemplateRouter.post("/update",verifyEmployeeToken,emailTempalteController.updtaeTemplateInfo)

emailtemplateRouter.get("/get",verifyEmployeeToken,emailTempalteController.getTemplateInfo)

emailtemplateRouter.get("/all",verifyEmployeeToken,emailTempalteController.getAllTemplatesInfo)


export default emailtemplateRouter;


