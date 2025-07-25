import { Router } from 'express';
const reportTemplateRouter = Router();
import * as templateController from "../../controllers/reportTemplateController/reportTemplate.controller.js";
import { verifyEmployeeToken } from '../../middleware/authicationmiddleware.js';


reportTemplateRouter.post("/add",verifyEmployeeToken,templateController.saveTemplate)

reportTemplateRouter.post("/update",verifyEmployeeToken,templateController.updtaeTemplateInfo)

reportTemplateRouter.get("/get",verifyEmployeeToken,templateController.getTemplateInfo)

reportTemplateRouter.get("/getbyreport",verifyEmployeeToken,templateController.getTempByReport)

reportTemplateRouter.get("/all",verifyEmployeeToken,templateController.getAllTemplatesInfo)

reportTemplateRouter.delete("/remove",verifyEmployeeToken,templateController.removTemplate);

export default reportTemplateRouter;