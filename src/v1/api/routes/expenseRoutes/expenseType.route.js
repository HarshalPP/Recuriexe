import { Router } from 'express';
import { 
    createNewExpenseType, 
    getExpenseTypes, 
    getExpenseType, 
    updateExpenseType, 
    deleteExpenseType,
    publishExpenseTypeController 
} from '../../controllers/expenseControllers/expenseType.controller.js';
// import { authenticateAdmin, authenticateManager, authenticateEmployee } from '../middleware/authToken.js';
import { authenticateEmployeeAdmin, verifyEmployeeToken  } from "../../middleware/authicationmiddleware.js";


const expenseTypeRouter = Router();

// Expense type CRUD operations
expenseTypeRouter.get("/", verifyEmployeeToken, getExpenseTypes);
expenseTypeRouter.post("/", authenticateEmployeeAdmin, createNewExpenseType);
expenseTypeRouter.get("/:id", verifyEmployeeToken, getExpenseType);
expenseTypeRouter.put("/:id", authenticateEmployeeAdmin, updateExpenseType);
expenseTypeRouter.delete("/:id", authenticateEmployeeAdmin, deleteExpenseType);
expenseTypeRouter.post("/:id/publish", authenticateEmployeeAdmin, publishExpenseTypeController);

export default expenseTypeRouter;
