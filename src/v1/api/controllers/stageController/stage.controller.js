import StageModel from "../../models/StageModel/stage.model.js"
import {
  success,
  badRequest,
  notFound,
  unknownError,
} from "../../formatters/globalResponse.js"


// ✅ CREATE
export const createStage = async (req, res) => {
  try {
    const organizationId = req.employee.organizationId;
    const { stageName, usedBy, status, sequence } = req.body;

    if (!stageName) return badRequest(res, "Stage name is required");

    // ❌ Check if a stage already exists for the organization
    const existingStage = await StageModel.findOne({ organizationId , status:"active" });
    if (existingStage) {
      return badRequest(res, "Stage already exists for this organization");
    }

    // ✅ Create new stage
    const stage = new StageModel({
      organizationId,
      stageName,
      usedBy,
      status,
      sequence,
    });

    const saved = await stage.save();
    return success(res, "Stage created successfully", saved);
  } catch (err) {
    return unknownError(res, err);
  }
};


// ✅ GET ALL
export const getAllStages = async (req, res) => {
  try {
    const organizationId = req.employee.organizationId;
    const stages = await StageModel.find({ status: "active" , organizationId })
      .sort({ sequence: 1 , createdAt: -1 });

    return success(res, "Stages fetched successfully", stages);
  } catch (err) {
    return unknownError(res, err);
  }
};

// ✅ GET BY ID
export const getStageById = async (req, res) => {
  try {
    const { id } = req.params;
    const stage = await StageModel.findById(id).populate("api_connection.api_id", "apiName")
    .populate("Document", "name label");

    if (!stage) return notFound(res, "Stage not found");

    return success(res, "Stage details fetched", stage);
  } catch (err) {
    return unknownError(res, err);
  }
};

// ✅ UPDATE
export const updateStage = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await StageModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) return notFound(res, "Stage not found");
    return success(res, "Stage updated successfully", updated);
  } catch (err) {
    return unknownError(res, err);
  }
};

// ✅ DELETE
export const deleteStage = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await StageModel.findByIdAndDelete(id);
    if (!deleted) return notFound(res, "Stage not found");

    return success(res, "Stage deleted successfully");
  } catch (err) {
    return unknownError(res, err);
  }
};
