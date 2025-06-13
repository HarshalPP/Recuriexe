import express from "express";
const router = express.Router();

import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from "../../controllers/verificationController/category.controller.js";

import { IsAuthenticated } from "../../middleware/authicationmiddleware.js";


// Category CRUD Routes (RESTful)
router.post("/category/add",IsAuthenticated, createCategory);         // Create category
router.get("/category/list", getAllCategories);        // Get all categories
router.get("/category/detail", getCategoryById);      // Get category by ID
router.post("/category/update", IsAuthenticated, updateCategory);

export default router;