export const formatPlan = (plan) => {
  if (!plan) return null;

  return {
    id: plan._id,
    planName: plan.planName,
    planDescription: plan.planDescription,
    planPrice: plan.planPrice,
    planDurationInDays: plan.planDurationInDays,
    planCreditLimit: plan.planCreditLimit,
    isActive: plan.isActive,
    NumberOfJobPosts: plan.NumberOfJobPosts,
    NumberOfUsers: plan.NumberOfUsers,
    NumberofAnalizers: plan.NumberofAnalizers,
    fileManagerLimit: plan.fileManagerLimit,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  };
};
