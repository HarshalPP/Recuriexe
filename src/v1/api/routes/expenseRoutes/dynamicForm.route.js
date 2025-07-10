import { Router } from 'express';
import { 
    createNewDynamicForm, 
    getDynamicForms, 
    getDynamicForm, 
    updateDynamicForm, 
    deleteDynamicForm,
    previewForm 
} from '../../controllers/expenseControllers/dynamicForm.controller.js';
// import { authenticateEmployeeAdmin, authenticateManager, authenticateEmployee } from '../middleware/authToken.js';
import { authenticateEmployeeAdmin, verifyEmployeeToken  } from "../../middleware/authicationmiddleware.js";

const dynamicFormRouter = Router();

// Dynamic form CRUD operations
dynamicFormRouter.get("/", verifyEmployeeToken, getDynamicForms);
dynamicFormRouter.post("/", authenticateEmployeeAdmin, createNewDynamicForm);
dynamicFormRouter.get("/:id", verifyEmployeeToken, getDynamicForm);
dynamicFormRouter.put("/:id", authenticateEmployeeAdmin, updateDynamicForm);
dynamicFormRouter.delete("/:id", authenticateEmployeeAdmin, deleteDynamicForm);
dynamicFormRouter.post("/:id/preview", verifyEmployeeToken, previewForm);

export default dynamicFormRouter;

