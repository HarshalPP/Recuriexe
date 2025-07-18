import planModel from "../../models/PlanModel/Plan.model.js"
import cron from "node-cron";
import { formatPlan } from "../../formatters/planFormatter.js"
import { success, badRequest, notFound, unknownError } from "../../formatters/globalResponse.js"
import OrganizationModel from "../../models/organizationModel/organization.model.js";
import organizationPlanModel from "../../models/PlanModel/organizationPlan.model.js";
import Freetrail from "../../models/PlanModel/freetrail.model.js"
import { sendEmail } from "../../Utils/sendEmail.js";
import moment from "moment-timezone";

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
//working //
// export const assignPlanToOrganization = async (req, res) => {
//   try {
//     const { organizationId, planId } = req.body;

//     if (!organizationId || !planId) {
//       return badRequest(res, "Organization ID and Plan ID are required");
//     }

//     const organization = await OrganizationModel.findById(organizationId);
//     if (!organization) return notFound(res, "Organization not found");

//     const plan = await planModel.findById(planId);
//     if (!plan) return notFound(res, "Plan not found");

//     const now = Date.now(); // ✅ always set current time

//     let existingOrgPlan = await organizationPlanModel.findOne({ organizationId });

//     const planPayload = {
//       organizationId,
//       planName: plan.planName,
//       planId: plan.id || null,
//       planDescription: plan.planDescription,
//       planPrice: plan.planPrice,
//       planDurationInDays: plan.planDurationInDays,
//       planCreditLimit: plan.planCreditLimit,
//       isActive: true,
//       NumberOfJobPosts: plan.NumberOfJobPosts,
//       NumberOfUsers: plan.NumberOfUsers,
//       NumberofAnalizers: plan.NumberofAnalizers,
//       Numberofdownloads: plan.Numberofdownloads,
//       reminderSent: false,
//       PlanDate: now, // ✅ update this every time
//     };

//     if (existingOrgPlan) {

//       await organizationPlanModel.updateOne({ organizationId }, planPayload);
//     } else {
//       // Create new plan
//       existingOrgPlan = await organizationPlanModel.create(planPayload);
//     }

//     // Save reference to assigned plan (if needed in org document)
//     organization.PlanId = plan._id;
//     await organization.save();

//     return success(res, "Plan assigned to organization successfully", existingOrgPlan);
//   } catch (err) {
//     console.error("Error in assigning plan:", err);
//     return unknownError(res, err.message);
//   }
// };


// new one //
export const assignPlanToOrganization = async (req, res) => {
  try {
    const { organizationId, planId } = req.body;

    if (!organizationId || !planId) {
      return badRequest(res, "Organization ID and Plan ID are required");
    }

    const organization = await OrganizationModel.findById(organizationId);
    if (!organization) return badRequest(res, "Organization not found");

    const newPlan = await planModel.findById(planId);
    if (!newPlan) return badRequest(res, "Plan not found");

    const now = new Date();
    let usedJobPosts = 0;
    let usedUsers = 0;

    let existingOrgPlan = await organizationPlanModel.findOne({ organizationId: organization._id });

    if (existingOrgPlan) {
      const isSamePlan = existingOrgPlan.planId?.toString() === planId;

      if (isSamePlan) {
        console.log("same" )
        // Reassigning same plan — just reset dates, preserve counters
        existingOrgPlan.PlanDate = now;
        existingOrgPlan.planDurationInDays = newPlan.planDurationInDays;
        existingOrgPlan.reminderSent = false;
        existingOrgPlan.isActive = true;
        await existingOrgPlan.save();
        return success(res, "Plan duration updated (same plan)", existingOrgPlan);
      }

      const oldPlan = await planModel.findById(existingOrgPlan.planId);

      // 👇 Fallback to oldPlan count if orgPlan = 0
      usedJobPosts =
        existingOrgPlan.NumberOfJobPosts == 0
          ? oldPlan?.NumberOfJobPosts || 0
          : (oldPlan?.NumberOfJobPosts || 0) - existingOrgPlan.NumberOfJobPosts;

      usedUsers =
        existingOrgPlan.NumberOfUsers === 0
          ? oldPlan?.NumberOfUsers || 0
          : (oldPlan?.NumberOfUsers || 0) - existingOrgPlan.NumberOfUsers;

      if (
        usedJobPosts > newPlan.NumberOfJobPosts ||
        usedUsers > newPlan.NumberOfUsers
      ) {
        return badRequest(
          res,
          `Cannot downgrade. Current usage (Users: ${usedUsers}, JobPosts: ${usedJobPosts}) exceeds new plan limits (Users: ${newPlan.NumberOfUsers}, JobPosts: ${newPlan.NumberOfJobPosts}).`
        );
      }

      // ✅ Update Plan with adjusted counters
      existingOrgPlan.planName = newPlan.planName;
      existingOrgPlan.planId = newPlan._id;
      existingOrgPlan.planDescription = newPlan.planDescription;
      existingOrgPlan.planPrice = newPlan.planPrice;
      existingOrgPlan.planDurationInDays = newPlan.planDurationInDays;
      existingOrgPlan.planCreditLimit = newPlan.planCreditLimit;
      existingOrgPlan.NumberOfJobPosts = newPlan.NumberOfJobPosts - usedJobPosts;
      existingOrgPlan.NumberOfUsers = newPlan.NumberOfUsers - usedUsers;
      existingOrgPlan.NumberofAnalizers = newPlan.NumberofAnalizers;
      existingOrgPlan.Numberofdownloads = newPlan.Numberofdownloads;
      existingOrgPlan.fileManagerLimit = newPlan.fileManagerLimit;


      existingOrgPlan.PlanDate = now;
      existingOrgPlan.reminderSent = false;

      await existingOrgPlan.save();
      organization.PlanId = newPlan._id;
      await organization.save();

      return success(res, "Plan updated successfully", existingOrgPlan);
    }

    // 🔃 First-time assignment
    const newOrgPlan = await organizationPlanModel.create({
      organizationId,
      planName: newPlan.planName,
      planId: newPlan._id,
      planDescription: newPlan.planDescription,
      planPrice: newPlan.planPrice,
      planDurationInDays: newPlan.planDurationInDays,
      planCreditLimit: newPlan.planCreditLimit,
      isActive: true,
      NumberOfJobPosts: newPlan.NumberOfJobPosts,
      NumberOfUsers: newPlan.NumberOfUsers,
      NumberofAnalizers: newPlan.NumberofAnalizers,
      Numberofdownloads: newPlan.Numberofdownloads,
      fileManagerLimit: newPlan.fileManagerLimit,


      reminderSent: false,
      PlanDate: now,
    });

    organization.PlanId = newPlan._id;
    await organization.save();

    return success(res, "Plan assigned successfully", newOrgPlan);
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
      PlanDate: Date.now()
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



// working //
// export const upgradenewOrgPlan = async ({ PlanId, organizationId, Amount }) => {
//   try {
//     if (!organizationId || !PlanId) {
//       throw new Error("Organization ID and Plan ID are required");
//     }

//     const organization = await OrganizationModel.findById(organizationId);
//     if (!organization) throw new Error("Organization not found");

//     const plan = await planModel.findById(PlanId);
//     if (!plan) throw new Error("New Plan not found");

//     // const createdAt = new Date(plan.createdAt);
//     // const expiryDate = new Date(createdAt.getTime() + plan.planDurationInDays * 24 * 60 * 60 * 1000);

//     // const isExpired = new Date() > expiryDate;

//     const planPayload = {
//       organizationId,
//       planName: plan.planName,
//       planId: plan._id,
//       planDescription: plan.planDescription,
//       planPrice: Amount,
//       planDurationInDays: plan.planDurationInDays,
//       planCreditLimit: plan.planCreditLimit,
//       isActive: true,
//       reminderSent: false,
//       NumberOfJobPosts: plan.NumberOfJobPosts,
//       NumberOfUsers: plan.NumberOfUsers,
//       NumberofAnalizers: plan.NumberofAnalizers,
//       Numberofdownloads: plan.Numberofdownloads,
//       PlanDate: Date.now()
//     };

//     let updatedPlan;
//     const existing = await organizationPlanModel.findOne({ organizationId });

//     if (existing) {
//       updatedPlan = await organizationPlanModel.findOneAndUpdate(
//         { organizationId },
//         planPayload,
//         { new: true }
//       );
//     } else {
//       updatedPlan = await organizationPlanModel.create(planPayload);
//     }

//     // Update the organization model with reference to new PlanId
//     organization.PlanId = plan._id;
//     await organization.save();

//     return {
//       success: true,
//       message: "Organization plan upgraded successfully.",
//       data: updatedPlan,
//     };
//   } catch (err) {
//     console.error("Error upgrading organization plan:", err);
//     return {
//       success: false,
//       message: err.message || "Unknown error occurred",
//     };
//   }
// };

// new one //
export const upgradenewOrgPlan = async ({ PlanId, organizationId, Amount }) => {
  try {
    if (!organizationId || !PlanId) {
      throw new Error("Organization ID and Plan ID are required");
    }

    const organization = await OrganizationModel.findById(organizationId);
    if (!organization) throw new Error("Organization not found");

    const plan = await planModel.findById(PlanId);
    if (!plan) throw new Error("New Plan not found");

    const now = new Date();
    let usedJobPosts = 0;
    let usedUsers = 0;

    const existingPlan = await organizationPlanModel.findOne({ organizationId });

    if (existingPlan) {
      const isSamePlan = existingPlan.planId?.toString() === PlanId;

      if (isSamePlan) {
        // ✅ Reassigning same plan — only reset duration
        existingPlan.PlanDate = now;
        existingPlan.planDurationInDays = plan.planDurationInDays;
        existingPlan.planPrice = Amount;
        existingPlan.reminderSent = false;

        await existingPlan.save();

        organization.PlanId = plan._id;
        await organization.save();

        return {
          success: true,
          message: "Same plan reassigned — duration updated.",
          data: existingPlan,
        };
      }

      // 👇 Different plan upgrade — calculate usage
      const oldPlan = await planModel.findById(existingPlan.planId);

      usedJobPosts =
        existingPlan.NumberOfJobPosts === 0
          ? oldPlan?.NumberOfJobPosts || 0
          : (oldPlan?.NumberOfJobPosts || 0) - existingPlan.NumberOfJobPosts;

      usedUsers =
        existingPlan.NumberOfUsers === 0
          ? oldPlan?.NumberOfUsers || 0
          : (oldPlan?.NumberOfUsers || 0) - existingPlan.NumberOfUsers;

      if (
        usedJobPosts > plan.NumberOfJobPosts ||
        usedUsers > plan.NumberOfUsers
      ) {
        return {
          success: false,
          message: `❌ Cannot downgrade plan. Current usage — Users: ${usedUsers}, Job Posts: ${usedJobPosts}. New plan limits — Users: ${plan.NumberOfUsers}, Job Posts: ${plan.NumberOfJobPosts}`,
        };
      }

      // ✅ Update plan in place with new plan data and remaining limits
      const updatedPlan = await organizationPlanModel.findOneAndUpdate(
        { organizationId },
        {
          organizationId,
          planName: plan.planName,
          planId: plan._id,
          planDescription: plan.planDescription,
          planPrice: Amount,
          planDurationInDays: plan.planDurationInDays,
          planCreditLimit: plan.planCreditLimit,
          isActive: true,
          reminderSent: false,
          NumberOfJobPosts: plan.NumberOfJobPosts - usedJobPosts,
          NumberOfUsers: plan.NumberOfUsers - usedUsers,
          NumberofAnalizers: plan.NumberofAnalizers,
          Numberofdownloads: plan.Numberofdownloads,
          fileManagerLimit: plan.fileManagerLimit,
          PlanDate: now,
        },
        { new: true }
      );

      organization.PlanId = plan._id;
      await organization.save();

      return {
        success: true,
        message: "✅ Plan upgraded successfully.",
        data: updatedPlan,
      };
    }

    // First-time plan assignment
    const newPlanPayload = await organizationPlanModel.create({
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
      fileManagerLimit: plan.fileManagerLimit,
      PlanDate: now,
    });

    organization.PlanId = plan._id;
    await organization.save();

    return {
      success: true,
      message: "✅ Plan assigned successfully.",
      data: newPlanPayload,
    };
  } catch (err) {
    console.error("❌ Error upgrading organization plan:", err);
    return {
      success: false,
      message: err.message || "Unknown error occurred",
    };
  }
};



export async function schedulePlanExpiryCheck() {
  cron.schedule(
    "* * * * *", // Run every minute (testing)
    async () => {
      try {
        const nowIST = moment.tz("Asia/Kolkata").toDate(); // Ensure Indian time

        const plans = await organizationPlanModel.find({
          isActive: true,
          planDurationInDays: { $ne: null },
          PlanDate: { $ne: null }
        });

        for (const plan of plans) {
          const createdAt = moment.tz(plan.PlanDate, "Asia/Kolkata");
          const expiryDate = createdAt.clone().add(plan.planDurationInDays, "days").toDate();
          const reminderDate = moment(expiryDate).subtract(2, "days").toDate();

          // Send reminder email
          if (!plan.reminderSent && nowIST >= reminderDate && nowIST < expiryDate) {
            const org = await OrganizationModel.findById(plan.organizationId);
            console.log("called")

            if (org?.contactEmail) {
              const content = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #eaeaea; border-radius: 8px;">
                  <h2 style="color: #333;">⏰ Subscription Plan Expiry Reminder</h2>
                  <p>Hi <strong>${org.name || "User"}</strong>,</p>
                  <p>Your current subscription plan will expire on 
                    <strong style="color: #d9534f;">${moment(expiryDate).format("DD MMM YYYY")}</strong>.
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

              await sendEmail({
                to: org.contactEmail,
                subject: "⏰ Your Plan is Expiring Soon!",
                html: content
              });

              await organizationPlanModel.findByIdAndUpdate(plan._id, {
                $set: { reminderSent: true }
              });

              console.log("called mail")
            }
          }

          // Expire plan if time passed
          if (nowIST >= expiryDate && plan.isActive == true) {
            await organizationPlanModel.findByIdAndUpdate(plan._id, {
              $set: { isActive: false }
            });

            console.log(`❌ Plan deactivated for organization ${plan.organizationId}`);
          }
        }
      } catch (err) {
        console.error("❌ Error in plan reminder/expiry check:", err.message);
      }
    },
    {
      timezone: "Asia/Kolkata" // Ensure cron runs in IST
    }
  );
}