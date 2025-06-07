import express from "express";
import * as advanceController from "../../controllers/expense/advance.controller.js";
import { IsAuthenticated , verifyEmployeeToken  } from "../../middleware/authicationmiddleware.js";

const advanceRoute = express.Router();

// tripRoute.post("/add",verifyJWT,expenseController.saveExpense)

advanceRoute.post("/update",verifyEmployeeToken,advanceController.updateAdvanceFeature)

// tripRoute.get("/get/:id",tripController.getTrip)

advanceRoute.get("/all",verifyEmployeeToken, advanceController.getAllAdvance)

export default advanceRoute;