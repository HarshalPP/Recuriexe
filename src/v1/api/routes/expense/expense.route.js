import express from "express";
import * as expenseController from "../../controllers/expense/expense.controller.js";
import { IsAuthenticated , verifyEmployeeToken  } from "../../middleware/authicationmiddleware.js";


const reportRoute = express.Router();

reportRoute.post("/add",verifyEmployeeToken,expenseController.saveExpense)

reportRoute.post("/update",verifyEmployeeToken, expenseController.updateExpense)

reportRoute.get("/get/:id",verifyEmployeeToken,expenseController.getExpenseById)

reportRoute.get("/all", verifyEmployeeToken, expenseController.getAllExpense)

reportRoute.get("/allExpenseById", verifyEmployeeToken, expenseController.getAllExpenseById)

reportRoute.post("/approve", verifyEmployeeToken, expenseController.approveExpense)

reportRoute.get("/approverDashbord", verifyEmployeeToken, expenseController.approverDashbord)

reportRoute.get("/remitterDashbord", verifyEmployeeToken, expenseController.remitterDashbord)

reportRoute.get("/adminDashbord", verifyEmployeeToken, expenseController.adminDashbord)


export default reportRoute;