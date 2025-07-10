import systemCategoryModel from '../../src/v1/api/models/expenseModels/systemCategory.model.js';
import mongoose from 'mongoose';

// export async function seedSystemCategories() {
//     // Check if already seeded
//     const existingCount = await systemCategoryModel.countDocuments();
//     if (existingCount > 0) {
//         console.log('   📝 System categories already exist, skipping...');
//         return;
//     }
    
//     const systemCategories = [
//         {
//             systemCategoryId: "SC_RECURRING_001",
//             name: "Recurring Expenses",
//             code: "RECURRING",
//             description: "Expenses that occur on a regular basis such as subscriptions, rent, utilities",
//             logicConfig: {
//                 autoCreate: true,
//                 maxAmount: null,
//                 requiresApproval: true,
//                 autoApproveLimit: 5000,
//                 allowRecurring: true,
//                 mandatoryFields: ["frequency", "startDate", "description"],
//                 additionalRules: {
//                     frequencyOptions: ["Weekly", "Monthly", "Quarterly", "Annually"],
//                     maxRecurrenceLimit: 12,
//                     requiresJustification: false
//                 }
//             },
//             isSeeded: true,
//             isActive: true
//         },
//         {
//             systemCategoryId: "SC_ADVANCE_002",
//             name: "Advance Payment",
//             code: "ADVANCE_PAYMENT",
//             description: "Payments made in advance for future expenses, equipment purchases, or project costs",
//             logicConfig: {
//                 autoCreate: false,
//                 maxAmount: 100000,
//                 requiresApproval: true,
//                 autoApproveLimit: null,
//                 allowRecurring: false,
//                 mandatoryFields: ["advanceReason", "expectedUsageDate", "justification"],
//                 additionalRules: {
//                     requiresSettlement: true,
//                     settlementDays: 30,
//                     requiresManagerApproval: true,
//                     requiresFinanceApproval: true
//                 }
//             },
//             isSeeded: true,
//             isActive: true
//         },
//         {
//             systemCategoryId: "SC_TRAVEL_003",
//             name: "Travel Expenses",
//             code: "TRAVEL",
//             description: "Expenses related to business travel including transportation, accommodation, meals",
//             logicConfig: {
//                 autoCreate: false,
//                 maxAmount: null,
//                 requiresApproval: true,
//                 autoApproveLimit: 10000,
//                 allowRecurring: false,
//                 mandatoryFields: ["travelStartDate", "travelEndDate", "destination", "purpose"],
//                 additionalRules: {
//                     requiresItinerary: true,
//                     perDiemApplicable: true,
//                     requiresPreApproval: true,
//                     maxDailyLimit: 5000
//                 }
//             },
//             isSeeded: true,
//             isActive: true
//         },
//         {
//             systemCategoryId: "SC_OPERATIONAL_004",
//             name: "Operational Expenses",
//             code: "OPERATIONAL",
//             description: "Day-to-day operational expenses including office supplies, utilities, maintenance",
//             logicConfig: {
//                 autoCreate: false,
//                 maxAmount: null,
//                 requiresApproval: true,
//                 autoApproveLimit: 2000,
//                 allowRecurring: true,
//                 mandatoryFields: ["description", "vendor"],
//                 additionalRules: {
//                     categoryRequired: true,
//                     requiresReceipt: true,
//                     allowsBulkSubmission: true
//                 }
//             },
//             isSeeded: true,
//             isActive: true
//         },
//         {
//             systemCategoryId: "SC_CAPITAL_005",
//             name: "Capital Expenses",
//             code: "CAPITAL",
//             description: "Capital expenditure and asset purchases including equipment, software licenses, infrastructure",
//             logicConfig: {
//                 autoCreate: false,
//                 maxAmount: null,
//                 requiresApproval: true,
//                 autoApproveLimit: null,
//                 allowRecurring: false,
//                 mandatoryFields: ["assetCategory", "depreciationPeriod", "businessJustification"],
//                 additionalRules: {
//                     requiresBusinessCase: true,
//                     minimumAmount: 50000,
//                     requiresCFOApproval: true,
//                     requiresAssetTag: true
//                 }
//             },
//             isSeeded: true,
//             isActive: true
//         }
//     ];
    
//     await systemCategoryModel.insertMany(systemCategories);
//     console.log(`   ✅ Inserted ${systemCategories.length} system categories`);
// }

export const seedSystemCategoriesold = async (organizationId) => {
  const systemCategories = [
    {
      organizationId,
      systemCategoryId: "SC_RECURRING_001",
      name: "Recurring Expenses",
      code: "RECURRING",
      description: "Expenses that occur on a regular basis such as subscriptions, rent, utilities",
      logicConfig: {
        autoCreate: true,
        maxAmount: null,
        requiresApproval: false,
        autoApproveLimit: 5000,
        allowRecurring: true,
        fundLimitType: "Monthly",
        requireVendorSelection: true,
        requireAutoApproval: true,
        requireReceipt: false,
        mandatoryFields: ["frequency", "startDate", "description"],
        additionalRules: {
          frequencyOptions: ["Weekly", "Monthly", "Quarterly", "Annually"],
          maxRecurrenceLimit: 12
        }
      },
      isSeeded: true,
      isActive: true
    },
    {
      organizationId,
      systemCategoryId: "SC_IMPREST_002",
      name: "Imprest Fund",
      code: "IMPREST",
      description: "Submit expenses from an imprest fund",
      logicConfig: {
        autoCreate: true,
        maxAmount: null,
        requiresApproval: false,
        allowRecurring: false,
        requireReceipt: true,
        replenishmentThreshold: 10000,
        mandatoryFields: ["fundLimit", "accountingCode", "fundCustodian"],
        additionalRules: {
          requiresCustodian: true
        }
      },
      isSeeded: true,
      isActive: true
    },
    {
      organizationId,
      systemCategoryId: "SC_ADVANCE_003",
      name: "Advance Payment",
      code: "ADVANCE_PAYMENT",
      description: "Payments made in advance to be adjusted later",
      logicConfig: {
        autoCreate: false,
        maxAmount: 100000,
        requiresApproval: true,
        allowRecurring: false,
        interestRate: 5,
        adjustmentPeriod: 30,
        autoDeductFromSalary: true,
        requireGuarantor: true,
        mandatoryFields: ["advanceReason", "expectedUsageDate"],
        additionalRules: {
          requiresSettlement: true,
          settlementDays: 30,
          requiresFinanceApproval: true
        }
      },
      isSeeded: true,
      isActive: true
    },
    {
      organizationId,
      systemCategoryId: "SC_EXPENSE_004",
      name: "Expense Claim",
      code: "EXPENSE_CLAIM",
      description: "Submit reimbursement claims for incurred expenses",
      logicConfig: {
        autoCreate: false,
        maxAmount: null,
        requiresApproval: true,
        mileageRate: 10,
        claimPeriodDays: 30,
        requireReceipt: true,
        requireManagerApproval: true,
        mandatoryFields: ["claimDate", "category", "amount"],
        additionalRules: {}
      },
      isSeeded: true,
      isActive: true
    },
    {
      organizationId,
      systemCategoryId: "SC_REIMBURSE_005",
      name: "Reimbursement",
      code: "REIMBURSEMENT",
      description: "Standard expense reimbursements",
      logicConfig: {
        autoCreate: false,
        maxAmount: null,
        requiresApproval: true,
        requireReceipt: true,
        requireBankDetails: true,
        reimbursementMethod: "Bank Transfer",
        mandatoryFields: ["receiptUpload", "bankDetails"],
        additionalRules: {
          reimbursementMethods: ["Bank Transfer", "Cheque"]
        }
      },
      isSeeded: true,
      isActive: true
    },
    {
      organizationId,
      systemCategoryId: "SC_PETTYCASH_006",
      name: "Petty Cash",
      code: "PETTY_CASH",
      description: "Small cash expenses",
      logicConfig: {
        autoCreate: false,
        maxAmount: 5000,
        requiresApproval: true,
        requireReceipt: true,
        replenishmentFrequency: "Monthly",
        mandatoryFields: ["custodian"],
        additionalRules: {
          requiresTracking: true
        }
      },
      isSeeded: true,
      isActive: true
    },
    {
      organizationId,
      systemCategoryId: "SC_TRAVELADV_007",
      name: "Travel Advance",
      code: "TRAVEL_ADVANCE",
      description: "Request travel advances",
      logicConfig: {
        autoCreate: false,
        maxAmount: null,
        requiresApproval: true,
        maxDays: 10,
        accommodationLimit: 2000,
        perDiemRate: 500,
        transportLimit: 1000,
        requireHotelItinerary: true,
        mandatoryFields: ["travelStartDate", "travelEndDate", "destination"],
        additionalRules: {}
      },
      isSeeded: true,
      isActive: true
    },
    {
      organizationId,
      systemCategoryId: "SC_PROJECT_008",
      name: "Project Expense",
      code: "PROJECT_EXPENSE",
      description: "Project specific expenses",
      logicConfig: {
        autoCreate: false,
        maxAmount: 200000,
        requiresApproval: true,
        allowRecurring: false,
        mandatoryFields: ["projectId", "duration", "expenseType"],
        additionalRules: {
          projectTrackingRequired: true
        }
      },
      isSeeded: true,
      isActive: true
    }
  ];

  await systemCategoryModel.insertMany(systemCategories);
  console.log("✅ System categories seeded successfully!");
};

export const seedSystemCategories = async (organizationId) => {
  const systemCategories = [
    {
      organizationId,
      systemCategoryId: "SC_RECURRING_001",
      name: "Recurring Expenses",
      code: "RECURRING",
      description: "Auto-scheduled recurring expenses",
      logicConfig: {
        // autoCreate: true,
        // allowRecurring: true,
        defaultFrequency: "Monthly",
        autoApproveLimit: 5000,
        requireVendorSelection: true,
        requireAutoApproval: true,
        mandatoryFields: ["frequency", "startDate", "description"],
        additionalRules: {
          frequencyOptions: ["Daily","Weekly", "Monthly", "Quarterly", "Annually"],
          // maxRecurrenceLimit: 12
        }
      },
      isSeeded: true,
      isActive: true
    },
    {
      organizationId,
      systemCategoryId: "SC_IMPREST_002",
      name: "Imprest Fund",
      code: "IMPREST",
      description: "Submit expenses from an imprest fund",
      logicConfig: {
        fundLimit:50000,
        requireReceipt: true,
        replenishmentThreshold: 10000,
        fundCustodian: "John Doe",
        accountingCode: "IMP001",
        mandatoryFields: ["fundLimit", "accountingCode", "fundCustodian"],
      },
      isSeeded: true,
      isActive: true
    },
    {
      organizationId,
      systemCategoryId: "SC_ADVANCE_003",
      name: "Advance Payment",
      code: "ADVANCE_PAYMENT",
      description: "Request an advance to be adjusted later",
      logicConfig: {
        maxAmount: 100000,
        interestRate: 5,
        adjustmentPeriod: 30,
        autoDeductFromSalary: true,
        requireGuarantor: true,
        mandatoryFields: ["advanceReason", "expectedUsageDate"],
        additionalRules: {}

      },
      isSeeded: true,
      isActive: true
    },
    {
      organizationId,
      systemCategoryId: "SC_EXPENSE_004",
      name: "Expense Claim",
      code: "EXPENSE_CLAIM",
      description: "Submit reimbursement claims",
      logicConfig: {
        mileageRate: 10,
        claimPeriodDays: 30,
        requireReceipt: true,
        requireManagerApproval: true,
        mandatoryFields: ["claimDate", "category", "amount"],
        additionalRules: {}

      },
      isSeeded: true,
      isActive: true
    },
    {
      organizationId,
      systemCategoryId: "SC_REIMBURSE_005",
      name: "Reimbursement",
      code: "REIMBURSEMENT",
      description: "Standard expense reimbursements",
      logicConfig: {
        reimbursementMethod: "Bank Transfer",
        requireReceipt: true,
        requireBankDetails: true,
        mandatoryFields: ["receiptUpload", "bankDetails"],
        additionalRules: {}

      },
      isSeeded: true,
      isActive: true
    },
    {
      organizationId,
      systemCategoryId: "SC_PETTYCASH_006",
      name: "Petty Cash",
      code: "PETTY_CASH",
      description: "Small cash expenses",
      logicConfig: {
        Custodian:"petty doe",
        maxAmount: 5000,
        replenishmentFrequency: "Monthly",
        requireReceipt: true,
        mandatoryFields: ["custodian"],
        additionalRules: {}

      },
      isSeeded: true,
      isActive: true
    },
    {
      organizationId,
      systemCategoryId: "SC_TRAVELADV_007",
      name: "Travel Advance",
      code: "TRAVEL_ADVANCE",
      description: "Request travel advances",
      logicConfig: {
        maxDays: 10,
        accommodationLimit: 2000,
        perDiemRate: 500,
        transportLimit: 1000,
        requireHotelItinerary: true,
        mandatoryFields: ["travelStartDate", "travelEndDate", "destination"]
      },
      isSeeded: true,
      isActive: true
    },
    {
      organizationId,
      systemCategoryId: "SC_PROJECT_008",
      name: "Project Expense",
      code: "PROJECT_EXPENSE",
      description: "Project specific expenses",
      logicConfig: {
        maxAmount: 200000,
        durationInDays: 30,
        projectCodeReq: true,             
        linkBudget: true, 
        mandatoryFields: ["projectId", "duration", "expenseType"]
      },
      isSeeded: true,
      isActive: true
    }
  ];

  await systemCategoryModel.insertMany(systemCategories);
  console.log("✅ System categories seeded successfully!");
};



