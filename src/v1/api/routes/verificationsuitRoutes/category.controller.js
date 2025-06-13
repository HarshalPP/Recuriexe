import express from "express";
const router = express.Router();

import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from "../../controllers/authcontrollers/category.controller.js";

import { IsAuthenticated } from "../../middlewares/authicationmiddleware.js";


// Category CRUD Routes (RESTful)
router.post("/",IsAuthenticated, createCategory);         // Create category
router.get("/", getAllCategories);        // Get all categories
router.get("/:id", getCategoryById);      // Get category by ID
// router.put("/:id", updateCategory);       // Update category
router.post("/:id", IsAuthenticated, updateCategory);
router.delete("/:id",IsAuthenticated, deleteCategory);    // Soft delete category (status: inactive)

export default router;