import apiCategory from "../../models/verificationModel/apiCategory.model.js";
import {
  success,
  created,
  notFound,
  badRequest,
  unknownError,
} from "../../formatters/globalResponse.js";
import ApiRegistry from "../../models/verificationModel/apiRegistry.model.js";

export const createApiReport = async (req, res) => {
  try {
    const { name, description, userId, apis, createdBy } = req.body;

    if (!name || !userId) {
      return badRequest(res, "Report name and userId are required");
    }

    const existing = await ApiReport.findOne({ name: name.trim() });
    if (existing) {
      return badRequest(res, "Report with this name already exists");
    }

       if (!Array.isArray(apis) || apis.length === 0) {
      return badRequest(res, "At least one API must be selected");
    }

       const validApis = await ApiRegistry.find({ _id: { $in: apis }, status: "active" });
    if (validApis.length !== apis.length) {
      return badRequest(res, "Some selected APIs are invalid or inactive");
    }

    const newReport = await ApiReport.create({
      name: name.trim(),
      description,
      userId,
      apis,
      createdBy,
    });

    return created(res, "API Report created successfully", newReport);
  } catch (err) {
    return unknownError(res, err.message || "Failed to create API report");
  }
};


export const getAllApiReports = async (req, res) => {
  try {
    const reports = await ApiReport.find()
      .populate("userId", "userName email")
      .populate("apis", "apiName serviceName servicePath")
      .sort({ createdAt: -1 });

    return success(res, "API Reports fetched successfully", reports);
  } catch (err) {
    return unknownError(res, err.message || "Failed to fetch API reports");
  }
};


export const getApiReportById = async (req, res) => {
  try {
    const report = await ApiReport.findById(req.params.id)
      .populate("userId", "userName email")
      .populate("apis", "apiName serviceName servicePath");

    if (!report) return notFound(res, "API Report not found");
    return success(res, "API Report fetched successfully", report);
  } catch (err) {
    return unknownError(res, err.message || "Failed to fetch API report");
  }
};

