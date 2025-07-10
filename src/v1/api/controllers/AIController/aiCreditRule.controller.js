import AICreditRuleModel from "../../models/AiModel/AICreditRuleModel .js"
import PlanModel from "../../models/PlanModel/Plan.model.js"
import {
  success,
  badRequest,
  notFound,
  unknownError,
} from "../../formatters/globalResponse.js"

// CREATE a new rule
export const createCreditRule = async (req, res) => {
  try {
    const { actionType, creditsRequired, description , planId} = req.body;

    if (!actionType || !creditsRequired) {
      return badRequest(res, "actionType and creditsRequired are required");
    }

    // const findPlan = await PlanModel.findById(planId);
    // if (!findPlan) {
    //   return badRequest(res, "Plan not found");
    // }

    const existing = await AICreditRuleModel.findOne({ actionType });
    if (existing) return badRequest(res, "Rule for this actionType already exists");

    const rule = await AICreditRuleModel.create({ actionType, creditsRequired, description });
    return success(res, "Credit rule created successfully", rule);
  } catch (err) {
    console.log(err)
    return unknownError(res, err.message);
  }
};

// GET all rules
export const getAllCreditRules = async (req, res) => {
  try {
    const rules = await AICreditRuleModel.find().sort({ createdAt: -1 });
    return success(res, "Fetched credit rules", rules);
  } catch (err) {
    return unknownError(res, err.message);
  }
};

// UPDATE a rule
export const updateCreditRule = async (req, res) => {
  try {
    const { id } = req.params;
    const { actionType, creditsRequired, description } = req.body;

    const updated = await AICreditRuleModel.findByIdAndUpdate(
      id,
      { actionType, creditsRequired, description },
      { new: true }
    );

    if (!updated) return badRequest(res, "Rule not found");

    return success(res, "Credit rule updated", updated);
  } catch (err) {
    return unknownError(res, err.message);
  }
};

// DELETE a rule
export const deleteCreditRule = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await AICreditRuleModel.findByIdAndDelete(id);
    if (!deleted) return badRequest(res, "Rule not found");

    return success(res, "Credit rule deleted");
  } catch (err) {
    return unknownError(res, err.message);
  }
};
