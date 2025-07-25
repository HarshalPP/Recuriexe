import { Router } from "express";
import * as formController from "../../controllers/reportFormcontroller/reportForm.controller.js";
import { verifyEmployeeToken } from "../../middleware/authicationmiddleware.js";

const reportFormRouter = Router();

reportFormRouter.post("/add", verifyEmployeeToken, formController.saveForm);
reportFormRouter.post("/update", verifyEmployeeToken, formController.updateForm);
reportFormRouter.get("/get/:id", verifyEmployeeToken, formController.getFormByIdHandler);
reportFormRouter.get("/delete/:id", verifyEmployeeToken, formController.deleteForm);
reportFormRouter.get("/all", verifyEmployeeToken, formController.getAllFormsHandler);
reportFormRouter.get("/allbyreportId", verifyEmployeeToken, formController.getAllFormsByReportId);

export default reportFormRouter;
