import express from "express";
import * as expenseRoleController from "../../controllers/expense/expenseRole.controller.js";
import { IsAuthenticated , verifyEmployeeToken  } from "../../middleware/authicationmiddleware.js";


const expenseRoleRoute = express.Router();

expenseRoleRoute.post("/fromWhere",verifyEmployeeToken,expenseRoleController.updateFromWhere)

expenseRoleRoute.get("/configList",verifyEmployeeToken,expenseRoleController.configList)

expenseRoleRoute.post("/update",verifyEmployeeToken,expenseRoleController.saveExpenseRole)

expenseRoleRoute.get("/get/:id",verifyEmployeeToken,expenseRoleController.getExpenseRoleDetail)

expenseRoleRoute.get("/all",verifyEmployeeToken,expenseRoleController.getAllExpenseRole)

expenseRoleRoute.get("/employeeList",verifyEmployeeToken,expenseRoleController.departmentEmployeeList)

expenseRoleRoute.get("/departmentList",verifyEmployeeToken,expenseRoleController.departmentListList)

//configuration
expenseRoleRoute.get("/config",verifyEmployeeToken,expenseRoleController.addExpenseConfig)

expenseRoleRoute.get("/activeInactive",verifyEmployeeToken,expenseRoleController.activeInactiveExpense)


export default expenseRoleRoute;