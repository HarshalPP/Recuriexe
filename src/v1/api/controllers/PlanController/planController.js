import planModel from "../../models/PlanModel/Plan.model.js"
import cron from "node-cron";
import { formatPlan } from "../../formatters/planFormatter.js"
import { success, badRequest, notFound, unknownError } from "../../formatters/globalResponse.js"
import OrganizationModel from "../../models/organizationModel/organization.model.js";
import organizationPlanModel from "../../models/PlanModel/organizationPlan.model.js";
import Freetrail from "../../models/PlanModel/freetrail.model.js"
import { sendEmail } from "../../Utils/sendEmail.js";

export const createPlan = async (req, res) => {
  try {
    const plan = await planModel.create(req.body);

    return success(res, "Plan created successfully", formatPlan(plan));
  } catch (err) {
    return badRequest(res, err.message);
  }
};

// free trial //
export const createfreetrail = async (req, res) => {
  try {
    const plan = await Freetrail.create(req.body);

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


// free plan //
export const getAllfreeplan = async (req, res) => {
  try {
    const plans = await Freetrail.find().sort({ createdAt: -1 });
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



export const updatefreetrail = async (req, res) => {
  try {
    const plan = await Freetrail.findByIdAndUpdate(req.params.id, req.body, {
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
      planId: plan.id || null,
      planDescription: plan.planDescription,
      planPrice: plan.planPrice,
      planDurationInDays: plan.planDurationInDays,
      planCreditLimit: plan.planCreditLimit,
      isActive: true,
      NumberOfJobPosts: plan.NumberOfJobPosts,
      NumberOfUsers: plan.NumberOfUsers,
      NumberofAnalizers: plan.NumberofAnalizers,
      Numberofdownloads: plan.Numberofdownloads,
      reminderSent:false
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


// Updgrad Plan api //


export const upgradeOrganizationPlan = async (req, res) => {
  try {
    const { planId } = req.body;
    const organizationId = req.employee.organizationId;

    if (!organizationId || !planId) {
      return badRequest(res, "Organization ID and Plan ID are required");
    }

    const organization = await OrganizationModel.findById(organizationId);
    if (!organization) return badRequest(res, "Organization not found");

    const plan = await planModel.findById(planId);
    if (!plan) return badRequest(res, "New Plan not found");

    const planPayload = {
      organizationId,
      planName: plan.planName,
      planId: plan._id,
      planDescription: plan.planDescription,
      planPrice: plan.planPrice,
      planDurationInDays: plan.planDurationInDays,
      planCreditLimit: plan.planCreditLimit,
      isActive: true,
      reminderSent: false, 
      NumberOfJobPosts: plan.NumberOfJobPosts,
      NumberOfUsers: plan.NumberOfUsers,
      NumberofAnalizers: plan.NumberofAnalizers,
      Numberofdownloads: plan.Numberofdownloads,
      createdAt:Date.now()
    };

    let updatedPlan;

    const existing = await organizationPlanModel.findOne({ organizationId });

    if (existing) {
      updatedPlan = await organizationPlanModel.findOneAndUpdate(
        { organizationId },
        planPayload,
        { new: true }
      );
    } else {
      updatedPlan = await organizationPlanModel.create(planPayload);
    }

    // Update ref in Organization (optional)
    organization.PlanId = plan._id;
    await organization.save();

    return success(res, "Organization plan upgraded and reminder marked as sent.", updatedPlan);
  } catch (err) {
    console.error("Error upgrading plan:", err);
    return unknownError(res, err.message);
  }
};




// Updagrade data //




export const upgradenewOrgPlan = async ({ PlanId, organizationId , Amount}) => {
  try {
    if (!organizationId || !PlanId) {
      throw new Error("Organization ID and Plan ID are required");
    }

    const organization = await OrganizationModel.findById(organizationId);
    if (!organization) throw new Error("Organization not found");

    const plan = await planModel.findById(PlanId);
    if (!plan) throw new Error("New Plan not found");

    // const createdAt = new Date(plan.createdAt);
    // const expiryDate = new Date(createdAt.getTime() + plan.planDurationInDays * 24 * 60 * 60 * 1000);

    // const isExpired = new Date() > expiryDate;

    const planPayload = {
      organizationId,
      planName: plan.planName,
      planId: plan._id,
      planDescription: plan.planDescription,
      planPrice: Amount,
      planDurationInDays: plan.planDurationInDays,
      planCreditLimit: plan.planCreditLimit,
      isActive: true,
      reminderSent: false,
      NumberOfJobPosts: plan.NumberOfJobPosts,
      NumberOfUsers: plan.NumberOfUsers,
      NumberofAnalizers: plan.NumberofAnalizers,
      Numberofdownloads: plan.Numberofdownloads,
      createdAt:Date.now()
    };

    let updatedPlan;
    const existing = await organizationPlanModel.findOne({ organizationId });

    if (existing) {
      updatedPlan = await organizationPlanModel.findOneAndUpdate(
        { organizationId },
        planPayload,
        { new: true }
      );
    } else {
      updatedPlan = await organizationPlanModel.create(planPayload);
    }

    // Update the organization model with reference to new PlanId
    organization.PlanId = plan._id;
    await organization.save();

    return {
      success: true,
      message: "Organization plan upgraded successfully.",
      data: updatedPlan,
    };
  } catch (err) {
    console.error("Error upgrading organization plan:", err);
    return {
      success: false,
      message: err.message || "Unknown error occurred",
    };
  }
};


export function schedulePlanExpiryCheck() {
  cron.schedule(
    "* * * * *", // Runs every minute for testing (adjust in prod)
    async () => {
      const now = new Date();
      // console.log("coming inside");
      

      try {
        const plans = await organizationPlanModel.find({
          isActive: true,
          planDurationInDays: { $ne: null }
        });

        for (const plan of plans) {
          const createdAt = new Date(plan.createdAt);
          const expiryDate = new Date(createdAt.getTime() + plan.planDurationInDays * 24 * 60 * 60 * 1000);
          const reminderDate = new Date(expiryDate.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days before

          // Send reminder
          if (!plan.reminderSent && now >= reminderDate && now < expiryDate) {
            const org = await OrganizationModel.findById(plan.organizationId);

            if (org?.contactEmail) {
              const content = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #eaeaea; border-radius: 8px;">
                  <h2 style="color: #333;">⏰ Subscription Plan Expiry Reminder</h2>

                  <p>Hi <strong>${org.name || "User"}</strong>,</p>

                  <p>Your current subscription plan will expire on 
                    <strong style="color: #d9534f;">${expiryDate.toDateString()}</strong>.
                  </p>

                  <p>Please renew your plan before this date to continue enjoying uninterrupted access to our platform.</p>

                  <p style="margin-top: 30px; font-size: 13px; color: #777;">If you've already renewed, you may ignore this email.</p>
                  
                  <p style="font-size: 13px; color: #777;">Need help? Contact us at 
                    <a href="mailto:support@fincoopers.tech">support@fincoopers.tech</a>.
                  </p>

                  <hr style="margin-top: 30px;" />

                  <p style="font-size: 12px; color: #999;">© ${new Date().getFullYear()} Fincoopers Tech. All rights reserved.</p>
                </div>
              `;

               //org.contactEmail
              await sendEmail({
                to: org.contactEmail,
                subject: "⏰ Your Plan is Expiring Soon!",
                html: content
              });

              plan.reminderSent = true;
              await plan.save();

              console.log(`📧 Reminder sent to ${org.contactEmail}`);
            }
          }

          // Expire plan if needed
          if (now >= expiryDate && plan.isActive) {
            plan.isActive = false;
            await plan.save();
            console.log(`❌ Plan deactivated for organization ${plan.organizationId}`);
          }
        }

      } catch (err) {
        console.error("❌ Error in plan reminder/expiry check:", err.message);
      }
    },
    {
      timezone: "Asia/Kolkata"
    }
  );
}