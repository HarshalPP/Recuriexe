import express from 'express';
const router = express.Router();
import { addBudgetFavoriteDashboard , removeBudgetFavoriteDashboard , getEmployeeBudgetFavorites } from '../../controllers/dashboardFavoriteController/favorite.controller.js';
import {  verifyEmployeeToken  } from "../../middleware/authicationmiddleware.js";



router.post("/budget/add", verifyEmployeeToken, addBudgetFavoriteDashboard);
router.get("/budget/list", verifyEmployeeToken, getEmployeeBudgetFavorites);
router.post("/budget/remove", verifyEmployeeToken, removeBudgetFavoriteDashboard);

export default router;