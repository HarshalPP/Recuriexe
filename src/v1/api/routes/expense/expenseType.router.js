import { IsAuthenticated , verifyEmployeeToken  } from "../../middleware/authicationmiddleware.js";
import {
    saveExpenseType,
    getExpenseTypes,
    getExpenseType,
    updateExpenseTypeById,
    deleteExpenseTypeById,
    updateExpenseTypeStatus,
    expenseTypeNameList
} from '../../controllers/expense/expenseType.controller.js';

import express from "express";
const expenesTypeRoute = express.Router();

expenesTypeRoute.post("/add", verifyEmployeeToken, saveExpenseType);
expenesTypeRoute.get("/getDetail", verifyEmployeeToken, getExpenseType);
expenesTypeRoute.get("/all", verifyEmployeeToken, getExpenseTypes);
expenesTypeRoute.get("/nameList", verifyEmployeeToken, expenseTypeNameList);
expenesTypeRoute.post("/update", verifyEmployeeToken, updateExpenseTypeById);


//update status
expenesTypeRoute.post("/updateStatus", verifyEmployeeToken, updateExpenseTypeStatus);


expenesTypeRoute.post("/delete", verifyEmployeeToken, deleteExpenseTypeById);

export default expenesTypeRoute;