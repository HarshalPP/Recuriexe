import { Router } from "express";
import * as inputController from "../../controllers/careerDynamicForm/input.controller.js"
import { verifyEmployeeToken } from "../../middleware/authicationmiddleware.js";

const inputRouter = Router()

inputRouter.post("/add",verifyEmployeeToken,inputController.saveInput)

inputRouter.post("/update",verifyEmployeeToken,inputController.updateInput)

inputRouter.get("/get/:id",verifyEmployeeToken,inputController.getInputById)

inputRouter.get("/delete/:id",verifyEmployeeToken,inputController.deleteInput)

inputRouter.get("/all",verifyEmployeeToken,inputController.getAllnputById)

export default inputRouter;