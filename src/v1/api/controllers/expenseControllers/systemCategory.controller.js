import { 
    getAllSystemCategories, 
    getSystemCategoryById,
    getSystemCategoryByCode 
} from "../../helper/expenseHelper/systemCategory.helper.js";
import { success, badRequest, unknownError, notFound } from '../../helper/response.helper.js';

// controllers/systemCategoryController.js
import systemCategoryModel from "../../models/expenseModels/systemCategory.model.js"

export const updateOverrideConfig = async (req, res) => {
  try {
    const { systemCategoryId } = req.params;
    const { overRideConfig } = req.body;

    if (!Array.isArray(overRideConfig)) {
      return res.status(400).json({ message: "overRideConfig must be an array" });
    }

    const category = await systemCategoryModel.findOneAndUpdate(
      { systemCategoryId },
      { $set: { overRideConfig } },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: "System category not found" });
    }

    return res.status(200).json({
      message: "Override config updated successfully",
      data: category
    });
  } catch (error) {
    console.error("Update OverrideConfig Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export async function getSystemCategories(req, res) {
    try {
        const { status, message, data } = await getAllSystemCategories();
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);``
    }
}

export async function getSystemCategory(req, res) {
    try {
        const { status, message, data } = await getSystemCategoryById(req.params.systemCategoryId);
        return status ? success(res, message, data) : notFound(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function getSystemCategoryByCodeName(req, res) {
    try {
        const { status, message, data } = await getSystemCategoryByCode(req.params.code);
        return status ? success(res, message, data) : notFound(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}
