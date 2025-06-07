import express from "express";
import * as reportController from "../../controllers/expense/report.controller.js";
import { IsAuthenticated , verifyEmployeeToken  } from "../../middleware/authicationmiddleware.js";

const reportRoute = express.Router();

// tripRoute.post("/add",verifyJWT,expenseController.saveExpense)

reportRoute.post("/update",verifyEmployeeToken,reportController.updateReport)

// tripRoute.get("/get/:id",tripController.getTrip)

reportRoute.get("/all",verifyEmployeeToken, reportController.getAllReport)

export default reportRoute;