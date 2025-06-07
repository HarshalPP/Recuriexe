import express from 'express';
const router = express.Router();
import { saveCategory, getCategory, updateCategoryById, deleteCategoryById, getCategoryDetail, categoryDropdown } from '../../controllers/expense/expenseCategory.controller.js';
// import { verifyJWT } from '../middlewares/verifyToken.js';
import { IsAuthenticated , verifyEmployeeToken  } from "../../middleware/authicationmiddleware.js";



router.post("/add", verifyEmployeeToken,saveCategory)
router.get("/getDetail", verifyEmployeeToken, getCategoryDetail)
router.get("/all", verifyEmployeeToken, getCategory)
router.post("/update", verifyEmployeeToken, updateCategoryById)
router.post("/delete", verifyEmployeeToken, deleteCategoryById)
router.get("/categoryDropdown",  categoryDropdown)


export default router;