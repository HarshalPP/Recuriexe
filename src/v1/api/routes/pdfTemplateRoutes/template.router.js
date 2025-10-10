import { Router } from 'express';
const templateRouter = Router();
import * as templateController from "../../controllers/pdfTemplateController/template.controller.js";
import { verifyEmployeeToken } from '../../middleware/authicationmiddleware.js';


templateRouter.post("/add" , verifyEmployeeToken , templateController.saveTemplate)
 
templateRouter.post("/update" , verifyEmployeeToken , templateController.updtaeTemplateInfo)
 
templateRouter.get("/get" , verifyEmployeeToken , templateController.getTemplateInfo)
 
templateRouter.get("/getbyproduct" , verifyEmployeeToken , templateController.getTempByproduct)
 
templateRouter.get("/all" , verifyEmployeeToken , templateController.getAllTemplatesInfo)
 
templateRouter.delete("/remove" , verifyEmployeeToken , templateController.removTemplate);
 
export default templateRouter;