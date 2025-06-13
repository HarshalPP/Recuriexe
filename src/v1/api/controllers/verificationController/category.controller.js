import apiCategory from "../../models/verificationModel/apiCategory.model.js";
import {
  success,
  created,
  notFound,
  badRequest,
  unknownError,
} from "../../formatters/globalResponse.js";

// ✅ Create Category
export const createCategory = async (req, res) => {
  try {
    const { name, status } = req.body;
    if (!name) return badRequest(res, "Category name is required");

    const exists = await apiCategory.findOne({ name: name.trim() });
    if (exists) return badRequest(res, "Category with this name already exists");

    // createdBy ko token se set karo
    const createdBy = req.user?._id;

    const category = await apiCategory.create({ name: name.trim(), status, createdBy });
    return created(res, "Category created successfully", category);
  } catch (err) {
    return unknownError(res, err.message || "Failed to create category");
  }
};

// ✅ Get All Categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await apiCategory.find().sort({ name: 1 });
    return success(res, "Category list fetched successfully", categories);
  } catch (err) {
    return unknownError(res, err.message || "Failed to fetch categories");
  }
};

// ✅ Get Category by ID
export const getCategoryById = async (req, res) => {
  try {
    const category = await apiCategory.findById(req.params.id);
    if (!category) return notFound(res, "Category not found");
    return success(res, "Category fetched successfully", category);
  } catch (err) {
    return unknownError(res, err.message || "Failed to fetch category");
  }
};

// ✅ Update Category
// export const updateCategory = async (req, res) => {
//   try {
//     const { name, status, updatedBy } = req.body;
//     const updateObj = {};
//     if (name) updateObj.name = name.trim();
//     if (status) updateObj.status = status;
//     if (updatedBy) updateObj.updatedBy = updatedBy;

//     const updated = await apiCategory.findByIdAndUpdate(
//       req.params.id,
//       updateObj,
//       { new: true }
//     );
//     if (!updated) return notFound(res, "Category not found");
//     return success(res, "Category updated successfully", updated);
//   } catch (err) {
//     return unknownError(res, err.message || "Failed to update category");
//   }
// };
export const updateCategory = async (req, res) => {
  try {
    const { name, status } = req.body;
    const updateObj = {};
    if (name) updateObj.name = name.trim();
    if (status) updateObj.status = status;

    // updatedBy ko token se set karo
    updateObj.updatedBy = req.user?._id;

    const updated = await apiCategory.findByIdAndUpdate(
      req.params.id,
      updateObj,
      { new: true }
    );
    if (!updated) return notFound(res, "Category not found");
    return success(res, "Category updated successfully", updated);
  } catch (err) {
    return unknownError(res, err.message || "Failed to update category");
  }
};