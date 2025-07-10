import { Router } from 'express';
import { 
    createNewSubcategory, 
    getSubcategories, 
    getSubcategory, 
    updateSubcategory, 
    deleteSubcategory 
} from '../../controllers/expenseControllers/subcategory.controller.js';
// import { authenticateAdmin, authenticateManager, verifyEmployeeToken } from '../middleware/authToken.js';
import { authenticateEmployeeAdmin, verifyEmployeeToken  } from "../../middleware/authicationmiddleware.js";


const subcategoryRouter = Router();

// Subcategory CRUD operations
subcategoryRouter.get("/", verifyEmployeeToken, getSubcategories);
subcategoryRouter.post("/", authenticateEmployeeAdmin, createNewSubcategory);
subcategoryRouter.get("/:id", verifyEmployeeToken, getSubcategory);
subcategoryRouter.put("/:id", authenticateEmployeeAdmin, updateSubcategory);
subcategoryRouter.delete("/:id", authenticateEmployeeAdmin, deleteSubcategory);

export default subcategoryRouter;
