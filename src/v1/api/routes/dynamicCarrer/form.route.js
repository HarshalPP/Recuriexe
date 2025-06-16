import { Router } from "express";
import * as formController from "../../controllers/careerDynamicForm/form.controller.js";
import { verifyEmployeeToken } from "../../middleware/authicationmiddleware.js";

const formRouter = Router();

formRouter.post("/add", verifyEmployeeToken, formController.saveForm);
formRouter.post("/update", verifyEmployeeToken, formController.updateForm);
formRouter.get("/get/:id", verifyEmployeeToken, formController.getFormByIdHandler);
formRouter.get("/delete/:id", verifyEmployeeToken, formController.deleteForm);
formRouter.get("/all", verifyEmployeeToken, formController.getAllFormsHandler);

export default formRouter;
