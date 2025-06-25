import { Router } from 'express';
const varibleRouter = Router();
import * as varibleController from "../../controllers/pdfTemplateController/variableSetUpController.js";
import { verifyEmployeeToken } from '../../middleware/authicationmiddleware.js';

varibleRouter.post("/add" , verifyEmployeeToken , varibleController.saveVariable)
 
varibleRouter.get("/addautovariable" , verifyEmployeeToken , varibleController.saveVariableAutomatically)
 
varibleRouter.post("/update" , verifyEmployeeToken , varibleController.updtaeVariableInfo)
 
varibleRouter.get("/get" , verifyEmployeeToken , varibleController.getVariableInfo)
 
varibleRouter.get("/all" , verifyEmployeeToken , varibleController.getAllVariablesInfo)
 
varibleRouter.get("/remove" , verifyEmployeeToken , varibleController.removVariable);
 
export default varibleRouter;