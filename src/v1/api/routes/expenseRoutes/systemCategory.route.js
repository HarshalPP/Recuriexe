import express from 'express';
const router = express.Router();
import { 
    getSystemCategories, 
    getSystemCategory, 
    getSystemCategoryByCodeName 
} from '../../controllers/expenseControllers/systemCategory.controller.js';
import { IsAuthenticated , verifyEmployeeToken  } from "../../middleware/authicationmiddleware.js";


// System category read-only operations (seeded data)
router.get("/", verifyEmployeeToken, getSystemCategories);
router.get("/:systemCategoryId", verifyEmployeeToken, getSystemCategory);
router.get("/code/:code", verifyEmployeeToken, getSystemCategoryByCodeName);

export default router;
