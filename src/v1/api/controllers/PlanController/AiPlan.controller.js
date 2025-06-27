import AICreditPlanModel from "../../models/PlanModel/AiCreditPlan.js"
import { success, badRequest, notFound, unknownError } from "../../formatters/globalResponse.js"
import OrganizationAIPlanModel from "../../models/PlanModel/OrganizationAIPlan.js";
import mongoose from "mongoose";
import { ObjectId } from 'mongodb';



export const createAICreditPlan = async (req, res) => {
  try {
    const { name, description, pricePerCredit } = req.body;

    if (!pricePerCredit) {
      return badRequest(res, "pricePerCredit are required");
    }

    const plan = await AICreditPlanModel.create({
      name,
      description,
      pricePerCredit,
    });

    return success(res, "AI credit plan created successfully", plan);
  } catch (err) {
    return unknownError(res, err);
  }
};

export const getAllAICreditPlans = async (req, res) => {
  try {
    const plans = await AICreditPlanModel.find();

    return success(res, "All AI credit plans fetched successfully", plans);
  } catch (err) {
    return unknownError(res, err.message);
  }
};

export const getAICreditPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await AICreditPlanModel.findById(id);

    if (!plan) {
      return notFound(res, "AI credit plan not found");
    }

    return success(res, "AI credit plan fetched successfully", plan);
  } catch (err) {
    return unknownError(res, err.message);
  }
};

export const updateAICreditPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, pricePerCredit} = req.body;

    const plan = await AICreditPlanModel.findById(id);

    if (!plan) {
      return notFound(res, "AI credit plan not found");
    }

    // Only update fields provided
    if (name !== undefined) plan.name = name;
    if (description !== undefined) plan.description = description;
    if (pricePerCredit !== undefined) plan.pricePerCredit = pricePerCredit;

    await plan.save(); // This will trigger the pre-save hook

    return success(res, "AI credit plan updated successfully", plan);
  } catch (err) {
    return unknownError(res, err.message);
  }
};

export const deleteAICreditPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await AICreditPlanModel.findByIdAndDelete(id);

    if (!plan) {
      return notFound(res, "AI credit plan not found");
    }

    return success(res, "AI credit plan deleted successfully", {});
  } catch (err) {
    return unknownError(res, err.message);
  }
};

export const assignAICreditsToOrganization = async (req, res) => {
  try {
    const { organizationId, planId, numberOfCredits } = req.body;

    if (!organizationId || !planId || !numberOfCredits || numberOfCredits <= 0) {
      return badRequest(res, "organizationId, planId, and valid numberOfCredits are required");
    }

    const aiCreditPlan = await AICreditPlanModel.findById(planId);
    if (!aiCreditPlan) {
      return notFound(res, `AI Credit Plan with ID ${planId} not found`);
    }
    console.log(aiCreditPlan);
    

    const { name: planName, description: planDescription, pricePerCredit } = aiCreditPlan;
    const totalPrice = numberOfCredits * pricePerCredit;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30);

    const existingPlan = await OrganizationAIPlanModel.findOne({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      aiPlanId: new mongoose.Types.ObjectId(planId),
      isActive: true,
      isExpired: false,
    });

    if (existingPlan) {
      const newTotalCredits = existingPlan.remainingCredits + numberOfCredits;

      existingPlan.totalCredits = newTotalCredits;
      existingPlan.remainingCredits = newTotalCredits;
      existingPlan.totalPrice = totalPrice;
      existingPlan.pricePerCredit = pricePerCredit; // <-- add this
      existingPlan.startDate = startDate;
      existingPlan.endDate = endDate;

      await existingPlan.save();
      return success(res, "AI Credits updated successfully", existingPlan);
    }

    const newPlan = await OrganizationAIPlanModel.create({
      organizationId,
      aiPlanId: planId,
      planName,
      planDescription,
      totalCredits: numberOfCredits,
      usedCredits: 0,
      remainingCredits: numberOfCredits,
      pricePerCredit,
      totalPrice,
      startDate,
      endDate,
      isActive: true,
      isExpired: false,
    });

    return success(res, "AI Credits assigned successfully", newPlan);
  } catch (err) {
    console.error("Error assigning AI credits:", err.message);
    return badRequest(res, err.message);
  }
};

