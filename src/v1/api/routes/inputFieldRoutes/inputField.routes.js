import { Router } from "express";
import * as inputController from "../../controllers/InputFieldcontroller/inputField.controller.js"
import { verifyEmployeeToken } from "../../middleware/authicationmiddleware.js";

const inputFieldRouter = Router()

inputFieldRouter.post("/add",verifyEmployeeToken,inputController.saveInput)

inputFieldRouter.post("/update",verifyEmployeeToken,inputController.updateInput)

inputFieldRouter.get("/get/:id",verifyEmployeeToken,inputController.getInputById)

inputFieldRouter.get("/delete/:id",verifyEmployeeToken,inputController.deleteInput)

inputFieldRouter.get("/all",verifyEmployeeToken,inputController.getAllnputByOrganizationId)

inputFieldRouter.get("/allbyreport/:reportId",verifyEmployeeToken,inputController.getAllnputByreportId)

export default inputFieldRouter;