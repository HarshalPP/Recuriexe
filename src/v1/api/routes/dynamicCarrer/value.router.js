import { Router } from "express";
import * as valueController from "../../controllers/careerDynamicForm/value.controller.js";
import { verifyEmployeeToken } from "../../middleware/authicationmiddleware.js";

const valueRouter = Router();

valueRouter.post("/add", verifyEmployeeToken, valueController.saveValue);
valueRouter.post("/update", verifyEmployeeToken, valueController.updateValue);
valueRouter.post("/update-status", verifyEmployeeToken, valueController.updateStatusValue);
valueRouter.get("/get/:id", verifyEmployeeToken, valueController.getValueByIdHandler);
valueRouter.get("/delete/:id", verifyEmployeeToken, valueController.deleteValue);
valueRouter.get("/all", verifyEmployeeToken, valueController.getAllValuesHandler);
valueRouter.get("/count", verifyEmployeeToken, valueController.dashbordCount);

export default valueRouter;
