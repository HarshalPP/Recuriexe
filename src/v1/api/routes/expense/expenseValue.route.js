import express from "express";
import * as expenseValueController from "../../controllers/expense/expenseValue.controller.js";
import { IsAuthenticated , verifyEmployeeToken  } from "../../middleware/authicationmiddleware.js";


const expenseValueRoute = express.Router();

expenseValueRoute.post("/add",verifyEmployeeToken,expenseValueController.saveExpenseValue)

// expenseValueRoute.post("/update",verifyEmployeeToken,tripValueController.updateTripValue)

// expenseValueRoute.get("/get/:id",verifyEmployeeToken,tripValueController.getTripValue)

// expenseValueRoute.get("/all",verifyEmployeeToken,tripValueController.getAllTripValue)

export default expenseValueRoute;