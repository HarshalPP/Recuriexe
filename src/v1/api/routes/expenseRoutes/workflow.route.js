import { Router } from 'express';
import { 
    createNewWorkflow, 
    getWorkflows, 
    getWorkflow, 
    updateWorkflow, 
    deleteWorkflow,
    getTemplates 
} from '../../controllers/expenseControllers/workflow.controller.js';
import { authenticateEmployeeAdmin , verifyEmployeeToken  } from "../../middleware/authicationmiddleware.js";

const workflowRouter = Router();

// Workflow CRUD operations 
workflowRouter.get("/all", verifyEmployeeToken, getWorkflows);
workflowRouter.post("/", authenticateEmployeeAdmin, createNewWorkflow);
workflowRouter.get("/templates", verifyEmployeeToken, getTemplates);
workflowRouter.get("/:id", verifyEmployeeToken, getWorkflow);
workflowRouter.put("/:id", authenticateEmployeeAdmin, updateWorkflow);
workflowRouter.delete("/:id", authenticateEmployeeAdmin, deleteWorkflow);

export default workflowRouter;
