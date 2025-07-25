import { Router } from 'express';
const reportvariableRouter = Router();
import * as varibleController from "../../controllers/reportvaribelController/reportVariable.controller.js";
import { verifyEmployeeToken } from '../../middleware/authicationmiddleware.js';


reportvariableRouter.post("/add",verifyEmployeeToken,varibleController.saveVariable)

reportvariableRouter.get("/addautovariable",verifyEmployeeToken,varibleController.saveVariableAutomatically)

reportvariableRouter.post("/update",verifyEmployeeToken,varibleController.updtaeVariableInfo)

reportvariableRouter.get("/get",verifyEmployeeToken,varibleController.getVariableInfo)

reportvariableRouter.get("/all",verifyEmployeeToken,varibleController.getAllVariablesInfo)

reportvariableRouter.get("/remove",verifyEmployeeToken,varibleController.removVariable);

export default reportvariableRouter;