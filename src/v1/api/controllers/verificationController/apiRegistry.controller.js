import ApiRegistry from "../../models/verificationModel/apiRegistry.model.js"
import ApiUsageLog from "../../models/verificationModel/apiUsageLog.model.js"
import {
  success,
  created,
  notFound,
  badRequest,
  serverValidation,
  unknownError,
} from "../../../../../src/v1/api/formatters/globalResponse.js";

const getNextApiId = async () => {
  const latest = await ApiRegistry.findOne().sort({ apiId: -1 });
  return latest ? latest.apiId + 1 : 101; // Starting from 101
};

// ✅ Create new API registry entry
export const createApiRegistry = async (req, res) => {
  try {
    const { apiName, description, defaultLimit , serviceName , servicePath , apiCategoryId } = req.body;

    if (!apiName) return badRequest(res, "apiName is required");

    if (!apiCategoryId) return badRequest(res, "api Category Id is required");

    const existing = await ApiRegistry.findOne({ apiName });
    if (existing) return badRequest(res, "API with this name already exists");

    const apiId = await getNextApiId();

    const api = await ApiRegistry.create({
      apiId,
      apiName,
      description,
      defaultLimit,
      serviceName,
      servicePath,
      apiCategoryId
    });

    return created(res, "API registered successfully", api);
  } catch (err) {
    console.error("Create API Error:", err);
    return unknownError(res, "Failed to create API entry");
  }
};

// ✅ Get all API entries
export const getAllApis = async (req, res) => {
    try {
      const apis = await ApiRegistry.find({ status: "active" }).sort({ apiId: 1 });
  
      if (!apis.length) {
        return success(res, "No active APIs found", []);
      }
  
      return success(res, "API list fetched successfully", apis);
    } catch (err) {
      console.error("getAllApis Error:", err.message);
      return unknownError(res, "Failed to fetch API list");
    }
  };


  // ✅ Get all API entries
export const getAllApisByCategory = async (req, res) => {
  try {

    const apis = await ApiRegistry.aggregate([
      {
        $match: { status: "active" }
      },
      {
        $lookup: {
          from: "apicategories", // should match your collection name (lowercase pluralized by default)
          localField: "apiCategoryId",
          foreignField: "_id",
          as: "category"
        }
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: "$apiCategoryId",
          category: { $first: "$category" },
          apis: {
            $push: {
              _id: "$_id",
              apiId: "$apiId",
              apiName: "$apiName",
              description: "$description",
              defaultLimit: "$defaultLimit",
              servicePath: "$servicePath",
              serviceName: "$serviceName",
              requiredFields: "$requiredFields",
              status: "$status"
            }
          }
        }
      },
      {
        $sort: {
          "category.name": 1 // sort categories alphabetically
        }
      }
    ]);

    return success(res, "APIs lIST", apis);
  } catch (err) {
    console.error("getAllApisByCategory Error:", err.message);
    return unknownError(res, "Failed to fetch grouped APIs");
  }
};

// ✅ Get API by apiId
export const getApiById = async (req, res) => {
  try {
    const api = await ApiRegistry.findOne({ apiId: req.params.apiId }).populate("apiCategoryId", "name");

    if (!api) return notFound(res, "API not found");

    return success(res, "API fetched successfully", api);
  } catch (err) {
    return unknownError(res, "Error fetching API");
  }
};

// ✅ Update API entry
export const updateApiRegistry = async (req, res) => {
  try {
    const { apiId } = req.params;
    const updates = req.body;

    const updated = await ApiRegistry.findOneAndUpdate({ apiId }, updates, { new: true });

    if (!updated) return notFound(res, "API not found");

    return success(res, "API updated successfully", updated);
  } catch (err) {
    return unknownError(res, "Failed to update API");
  }
};

// ✅ Delete API entry
export const deleteApiRegistry = async (req, res) => {
  try {
    const updated = await ApiRegistry.findOneAndUpdate(
      { apiId: req.params.apiId },
      { status: "Inactive" },
      { new: true }
    );

    if (!updated) return notFound(res, "API not found");

    return success(res, "API deactivated successfully", updated);
  } catch (err) {
    console.error("deleteApiRegistry Error:", err.message);
    return unknownError(res, "Failed to deactivate API");
  }
};



export const increaseApiLimit = async (req, res) => {
    try {
      const { userId, apiId, incrementBy } = req.body;
  
      if (!userId || typeof apiId !== "number" || typeof incrementBy !== "number") {
        return badRequest(res, "userId, apiId, and incrementBy are required and must be valid.");
      }
  
      const apiExists = await ApiRegistry.findOne({ apiId });
      if (!apiExists) return notFound(res, "API not found in registry");
  
      let usageLog = await ApiUsageLog.findOne({ userId, apiId });
  
      if (!usageLog) {
        return notFound(res, "Usage log not found for this user and API");
      }
  
      usageLog.limit = (usageLog.limit || apiExists.defaultLimit) + incrementBy;
      await usageLog.save();
  
      return success(res, "API limit increased successfully", {
        userId,
        apiId,
        newLimit: usageLog.limit,
      });
  
    } catch (err) {
      console.error("Increase API Limit Error:", err.message);
      return unknownError(res, "Failed to increase API limit");
    }
  };