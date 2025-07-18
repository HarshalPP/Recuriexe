import AICreditPlanModel from "../../models/PlanModel/AiCreditPlan.js"
import { success, badRequest, notFound, unknownError } from "../../formatters/globalResponse.js"
import OrganizationAIPlanModel from "../../models/PlanModel/OrganizationAIPlan.js";
import mongoose from "mongoose";
import { ObjectId } from 'mongodb';
import organizationPlanModel from "../../models/PlanModel/organizationPlan.model.js";



export const createAICreditPlan = async (req, res) => {
  try {
    const { name, description, pricePerCredit , PriceofCredit , NumberofCredit} = req.body;

    if (!pricePerCredit) {
      return badRequest(res, "pricePerCredit are required");
    }

    const plan = await AICreditPlanModel.create({
      name,
      description,
      pricePerCredit,
      PriceofCredit,
      NumberofCredit
      
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
    const { name, description, pricePerCredit , PriceofCredit , NumberofCredit } = req.body;

    const plan = await AICreditPlanModel.findById(id);

    if (!plan) {
      return notFound(res, "AI credit plan not found");
    }

    // Only update fields provided
    if (name !== undefined) plan.name = name;
    if (description !== undefined) plan.description = description;
    if (pricePerCredit !== undefined) plan.pricePerCredit = pricePerCredit;
    if(PriceofCredit !==undefined) plan.PriceofCredit = PriceofCredit;
    if(NumberofCredit!==undefined) plan.NumberofCredit=NumberofCredit

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


// Payment //
// export const assignAICreditsToOrganization = async (req, res) => {
//   try {
//     const {  planId, numberOfCredits , Price }  = req.body;

//     const organizationId = req.employee.organizationId;


//     if (!organizationId || !planId || !numberOfCredits || numberOfCredits <= 0) {
//       return badRequest(res, "organizationId, planId, and valid numberOfCredits are required");
//     }

//     const aiCreditPlan = await AICreditPlanModel.findById(planId);
//     if (!aiCreditPlan) {
//       return notFound(res, `AI Credit Plan with ID ${planId} not found`);
//     }

//     const planDetails = await organizationPlanModel.findOne({
//       organizationId: new ObjectId(organizationId)
//     });

//     if (!planDetails) {
//       return badRequest(res, "Plan details not found for the organization");
//     }

    
//     planDetails.addNumberOfAnalizers += numberOfCredits;
//     await planDetails.save();

    
//     const { name: planName, description: planDescription, pricePerCredit } = aiCreditPlan;
//     const totalPrice = Price;
//     const startDate = new Date();
//     const endDate = new Date();
//     endDate.setDate(startDate.getDate() + 30);

//     const existingPlan = await OrganizationAIPlanModel.findOne({
//       organizationId: new ObjectId(organizationId),
//       aiPlanId: new ObjectId(planId),
//       isActive: true,
//       isExpired: false,
//     });

//     if (existingPlan) {
//       const newTotalCredits = existingPlan.remainingCredits + numberOfCredits;

//       existingPlan.totalCredits = newTotalCredits;
//       existingPlan.remainingCredits = newTotalCredits;
//       existingPlan.totalPrice = Price;
//       existingPlan.pricePerCredit = pricePerCredit; // <-- add this
//       existingPlan.startDate = startDate;
//       existingPlan.endDate = endDate;

//       await existingPlan.save();

//       const UpdateOrganizationPlan = await organizationPlanModel.findOneAndUpdate({
//         organizationId:organizationId,
//         addNumberOfAnalizers:remainingCredits
//       })
//       return success(res, "AI Credits updated successfully", existingPlan);
//     }

    



//     const newPlan = await OrganizationAIPlanModel.create({
//       organizationId,
//       aiPlanId: planId,
//       planName,
//       planDescription,
//       totalCredits: numberOfCredits,
//       usedCredits: 0,
//       remainingCredits: numberOfCredits,
//       pricePerCredit,
//       totalPrice,
//       startDate,
//       endDate,
//       isActive: true,
//       isExpired: false,
//     });


//           const UpdateOrganizationPlan = await organizationPlanModel.findOneAndUpdate({
//         organizationId:organizationId,
//         addNumberOfAnalizers:remainingCredits
//       })

//     return success(res, "AI Credits assigned successfully", newPlan);
//   } catch (err) {
//     console.error("Error assigning AI credits:", err.message);
//     return badRequest(res, err.message);
//   }
// };



export const assignAICreditsToOrganization = async (req, res) => {
  try {
    const { planId, numberOfCredits, Price } = req.body;
    const organizationId = req.employee.organizationId;

    if (!organizationId || !planId || !numberOfCredits || numberOfCredits <= 0) {
      return badRequest(res, "organizationId, planId, and valid numberOfCredits are required");
    }

    const aiCreditPlan = await AICreditPlanModel.findById(planId);
    if (!aiCreditPlan) {
      return notFound(res, `AI Credit Plan with ID ${planId} not found`);
    }

    const planDetails = await organizationPlanModel.findOne({ organizationId: new ObjectId(organizationId) });
    if (!planDetails) {
      return badRequest(res, "Plan details not found for the organization");
    }

    const { name: planName, description: planDescription, pricePerCredit } = aiCreditPlan;
    const totalPrice = Price;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30);

    const existingPlan = await OrganizationAIPlanModel.findOne({
      organizationId: new ObjectId(organizationId),
      aiPlanId: new ObjectId(planId),
      isActive: true,
      isExpired: false,
    });

    let updatedPlan;

    if (existingPlan) {
      const newTotalCredits = existingPlan.remainingCredits + numberOfCredits;

      existingPlan.totalCredits = newTotalCredits;
      existingPlan.remainingCredits = newTotalCredits;
      existingPlan.totalPrice = totalPrice;
      existingPlan.pricePerCredit = pricePerCredit;
      existingPlan.startDate = startDate;
      existingPlan.endDate = endDate;

      await existingPlan.save();
      updatedPlan = existingPlan;
    } else {
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
      updatedPlan = newPlan;
    }

    // ✅ Update the analyzers count in organizationPlanModel
    planDetails.addNumberOfAnalizers += numberOfCredits;
    await planDetails.save();

    return success(res, "AI Credits assigned successfully", updatedPlan);
  } catch (err) {
    console.error("Error assigning AI credits:", err.message);
    return badRequest(res, err.message);
  }
};



export const assignAICreditsInternally = async ({ planId, numberOfCredits, Price, organizationId }) => {
  try {
    const aiCreditPlan = await AICreditPlanModel.findById(planId);
    if (!aiCreditPlan) throw new Error("AI Credit Plan not found");

    const planDetails = await organizationPlanModel.findOne({ organizationId: new ObjectId(organizationId) });
    if (!planDetails) throw new Error("Organization plan details not found");

    const { name: planName, description: planDescription, pricePerCredit } = aiCreditPlan;
    const totalPrice = Price;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30);

    const existingPlan = await OrganizationAIPlanModel.findOne({
      organizationId: new ObjectId(organizationId),
      aiPlanId: new ObjectId(planId),
      isActive: true,
      isExpired: false,
    });

    let updatedPlan;

    if (existingPlan) {
      const newTotalCredits = existingPlan.remainingCredits + numberOfCredits;

      existingPlan.totalCredits = newTotalCredits;
      existingPlan.remainingCredits = newTotalCredits;
      existingPlan.totalPrice = totalPrice;
      existingPlan.pricePerCredit = pricePerCredit;
      existingPlan.startDate = startDate;
      existingPlan.endDate = endDate;

      await existingPlan.save();
      updatedPlan = existingPlan;
    } else {
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
      updatedPlan = newPlan;
    }

    console.log("numberOfCredits" , numberOfCredits)

    // ✅ Update organization plan analyzers
    planDetails.addNumberOfAnalizers += numberOfCredits;
    await planDetails.save();

    return updatedPlan;

  } catch (err) {
    console.error("Error assigning AI credits internally:", err.message);
    return { error: err.message };
  }
};

 