import planModel from "../../models/PlanModel/Plan.model.js"
import cron from "node-cron";
import { formatPlan } from "../../formatters/planFormatter.js"
import { success, badRequest, notFound, unknownError } from "../../formatters/globalResponse.js"
import OrganizationModel from "../../models/organizationModel/organization.model.js";
import organizationPlanModel from "../../models/PlanModel/organizationPlan.model.js";

export const createPlan = async (req, res) => {
  try {
    const plan = await planModel.create(req.body);

    return success(res, "Plan created successfully", formatPlan(plan));
  } catch (err) {
    return badRequest(res, err.message);
  }
};



export const getAllPlans = async (req, res) => {
  try {
    const plans = await planModel.find().sort({ createdAt: -1 });
    return success(res, "Plans retrieved", plans.map(formatPlan));
  } catch (err) {
    return unknownError(res, err.message);
  }
};

export const getPlanById = async (req, res) => {
  try {
    const plan = await planModel.findById(req.params.id);
    if (!plan) return notFound(res, "Plan not found");
    return success(res, "Plan retrieved", formatPlan(plan));
  } catch (err) {
    return badRequest(res, err.message);
  }
};

export const updatePlan = async (req, res) => {
  try {
    const plan = await planModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!plan) return notFound(res, "Plan not found");
    return success(res, "Plan updated", formatPlan(plan));
  } catch (err) {
    return badRequest(res, err.message);
  }
};

export const deletePlan = async (req, res) => {
  try {
    const plan = await planModel.findByIdAndDelete(req.params.id);
    if (!plan) return notFound(res, "Plan not found");
    return success(res, "Plan deleted", formatPlan(plan));
  } catch (err) {
    return unknownError(res, err.message);
  }
};




// export const expirePlansScheduler = () => {
//   // Runs every day at 12:00 AM
//   cron.schedule("0 0 * * *", async () => {
//     try {
//       const today = new Date();

//       const expiredPlans = await planModel.find({
//         isActive: true,
//       });

//       const updates = expiredPlans.map(async (plan) => {
//         const createdAt = new Date(plan.createdAt);
//         const expiryDate = new Date(createdAt.getTime() + plan.planDurationInDays * 24 * 60 * 60 * 1000);

//         if (today > expiryDate) {
//           plan.isActive = false;
//           await plan.save();
//         }
//       });

//       await Promise.all(updates);

//       console.log(`[${new Date().toISOString()}] ✅ Plan expiration check completed.`);
//     } catch (err) {
//       console.error(`[${new Date().toISOString()}] ❌ Error in Plan Expiry Scheduler:`, err.message);
//     }
//   });
// };


// assing planId to organization

export const assignPlanToOrganization = async (req, res) => {
  try {
    const { organizationId, planId } = req.body;

    if (!organizationId || !planId) {
      return badRequest(res, "Organization ID and Plan ID are required");
    }

    const organization = await OrganizationModel.findById(organizationId);
    if (!organization) return notFound(res, "Organization not found");

    const plan = await planModel.findById(planId);
    if (!plan) return notFound(res, "Plan not found");

    let existingOrgPlan = await organizationPlanModel.findOne({ organizationId });

    const planPayload = {
      organizationId,
      planName: plan.planName,
      planDescription: plan.planDescription,
      planPrice: plan.planPrice,
      planDurationInDays: plan.planDurationInDays,
      planCreditLimit: plan.planCreditLimit,
      isActive: true,
      NumberOfJobPosts: plan.NumberOfJobPosts,
      NumberOfUsers: plan.NumberOfUsers,
      NumberofAnalizers: plan.NumberofAnalizers
    };

    if (existingOrgPlan) {

      await organizationPlanModel.updateOne({ organizationId }, planPayload);
    } else {
      // Create new plan
      existingOrgPlan = await organizationPlanModel.create(planPayload);
    }

    // Save reference to assigned plan (if needed in org document)
    organization.PlanId = plan._id;
    await organization.save();

    return success(res, "Plan assigned to organization successfully", existingOrgPlan);
  } catch (err) {
    console.error("Error in assigning plan:", err);
    return unknownError(res, err.message);
  }
};