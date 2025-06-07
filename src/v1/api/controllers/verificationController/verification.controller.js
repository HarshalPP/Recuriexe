import VerificationModel from "../../models/verificationModel/verification.model.js"
import {
  success,
  badRequest,
  notFound,
  unknownError,
} from "../../formatters/globalResponse.js"



// ✅ CREATE
export const createVerificationAPI = async (req, res) => {
  try {
    const { apiName, apiLogo, status = "active" } = req.body;

    if (!apiName) return badRequest(res, "API name is required");

    const existing = await VerificationModel.findOne({ apiName });
    if (existing) return badRequest(res, "API with this name already exists");

    const newAPI = new VerificationModel({ apiName, apiLogo, status });
    const saved = await newAPI.save();

    return success(res, "Verification API created successfully", saved);
  } catch (err) {
    return unknownError(res, err);
  }
};

// ✅ GET ALL
export const getAllVerificationAPIs = async (req, res) => {
  try {
    const list = await VerificationModel.find({status:"active"}).sort({ createdAt: -1 });
    return success(res, "Verification APIs fetched successfully", list);
  } catch (err) {
    return unknownError(res, err);
  }
};

// ✅ GET ONE
export const getVerificationAPIById = async (req, res) => {
  try {
    const { id } = req.params;
    const api = await VerificationModel.findById(id);
    if (!api) return notFound(res, "API not found");

    return success(res, "Verification API found", api);
  } catch (err) {
    return unknownError(res, err);
  }
};

// ✅ UPDATE
export const updateVerificationAPI = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await VerificationModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) return notFound(res, "API not found");
    return success(res, "Verification API updated", updated);
  } catch (err) {
    return unknownError(res, err);
  }
};

// ✅ DELETE
export const deleteVerificationAPI = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await VerificationModel.findByIdAndDelete(id);
    if (!deleted) return notFound(res, "API not found");

    return success(res, "Verification API deleted");
  } catch (err) {
    return unknownError(res, err);
  }
};
