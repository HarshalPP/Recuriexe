import express from "express";
import * as fieldController from "../../controllers/expense/field.controller.js";
import { IsAuthenticated , verifyEmployeeToken  } from "../../middleware/authicationmiddleware.js";

const fieldRoute = express.Router();

fieldRoute.post("/add",verifyEmployeeToken,fieldController.savefield)

fieldRoute.post("/update",verifyEmployeeToken,fieldController.updateField)

fieldRoute.get("/get/:id",verifyEmployeeToken,fieldController.getField)

fieldRoute.get("/all",verifyEmployeeToken,fieldController.getAllField)

export default fieldRoute;