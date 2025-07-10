import { Router } from 'express';
const formRouter = Router();
import * as formController from "../../controllers/formLibraryController/formLibrary.controller.js"
import { verifyEmployeeToken } from '../../middleware/authicationmiddleware.js';

formRouter.post("/add",verifyEmployeeToken,formController.saveForm)

formRouter.post("/update",verifyEmployeeToken,formController.updtaeFormInfo)

formRouter.get("/get",verifyEmployeeToken,formController.getFormInfo)

formRouter.get("/all",verifyEmployeeToken,formController.getAllFormInfo)

formRouter.get("/remove",verifyEmployeeToken,formController.removeFormData);

export default formRouter;