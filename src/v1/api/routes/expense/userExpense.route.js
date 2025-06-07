import express from "express";
import * as userExpenseController from "../../controllers/expense/userExpense.controller.js";
import { IsAuthenticated , verifyEmployeeToken  } from "../../middleware/authicationmiddleware.js";


const userExpenseRoute = express.Router();

userExpenseRoute.post("/add",verifyEmployeeToken,userExpenseController.saveUserExpense)

userExpenseRoute.post("/update",verifyEmployeeToken,userExpenseController.updateUserExpense)

userExpenseRoute.get("/get/:id",verifyEmployeeToken,userExpenseController.getUserExpense)

userExpenseRoute.get("/all",verifyEmployeeToken,userExpenseController.getAllUserExpense)

export default userExpenseRoute;