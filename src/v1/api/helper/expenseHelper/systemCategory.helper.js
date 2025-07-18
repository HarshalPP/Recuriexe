import systemCategoryModel from "../../models/expenseModels/systemCategory.model.js"
import { returnFormatter } from "../../formatters/common.formatter.js";




export async function getAllSystemCategories() {
    try {
        const categories = await systemCategoryModel
            .find({ isActive: true })
            .select('-__v')
            .sort({ name: 1 });
        
        return returnFormatter(true, "System categories retrieved successfully", categories);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function getSystemCategoryById(systemCategoryId) {
    try {
        const category = await systemCategoryModel.findOne({ 
            systemCategoryId, 
            isActive: true 
        }).select('-__v');
        
        if (!category) {
            return returnFormatter(false, "System category not found");
        }
        
        return returnFormatter(true, "System category retrieved successfully", category);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function getSystemCategoryByCode(code) {
    try {
        const category = await systemCategoryModel.findOne({ 
            code: code.toUpperCase(), 
            isActive: true 
        }).select('-__v');
        
        if (!category) {
            return returnFormatter(false, "System category not found");
        }
        
        return returnFormatter(true, "System category retrieved successfully", category);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function validateSystemCategoryLogic(systemCategoryId, expenseData) {
    try {
        const category = await systemCategoryModel.findOne({ 
            systemCategoryId, 
            isActive: true 
        });
        
        if (!category) {
            return returnFormatter(false, "System category not found");
        }
        
        const { logicConfig } = category;
        const validationErrors = [];
        
        // Check max amount limit
        if (logicConfig.maxAmount && expenseData.totalAmount > logicConfig.maxAmount) {
            validationErrors.push(`Amount exceeds maximum limit of ${logicConfig.maxAmount}`);
        }
        
        // Check mandatory fields
        if (logicConfig.mandatoryFields && logicConfig.mandatoryFields.length > 0) {
            for (const field of logicConfig.mandatoryFields) {
                if (!expenseData.formData[field]) {
                    validationErrors.push(`${field} is mandatory for ${category.name}`);
                }
            }
        }
        
        // Check additional rules based on category code
        switch (category.code) {
            case 'RECURRING':
                if (!expenseData.formData.frequency) {
                    validationErrors.push("Frequency is required for recurring expenses");
                }
                break;
                
            case 'ADVANCE_PAYMENT':
                if (!expenseData.formData.advanceReason) {
                    validationErrors.push("Advance reason is required");
                }
                break;
                
            case 'TRAVEL':
                if (!expenseData.formData.travelStartDate || !expenseData.formData.travelEndDate) {
                    validationErrors.push("Travel dates are required");
                }
                break;
        }
        
        if (validationErrors.length > 0) {
            return returnFormatter(false, "Validation failed", { errors: validationErrors });
        }
        
        return returnFormatter(true, "Validation passed", { 
            autoApprove: logicConfig.autoApproveLimit && expenseData.totalAmount <= logicConfig.autoApproveLimit,
            category 
        });
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function seedSystemCategories() {
    try {
        const existingCount = await systemCategoryModel.countDocuments();
        
        if (existingCount > 0) {
            return returnFormatter(true, "System categories already seeded");
        }
        
        const systemCategories = [
            {
                systemCategoryId: "SC_RECURRING_001",
                name: "Recurring Expenses",
                code: "RECURRING",
                description: "Expenses that occur on a regular basis",
                logicConfig: {
                    autoCreate: true,
                    maxAmount: null,
                    requiresApproval: true,
                    autoApproveLimit: 5000,
                    allowRecurring: true,
                    mandatoryFields: ["frequency", "startDate"],
                    additionalRules: {
                        frequencyOptions: ["Monthly", "Quarterly", "Annually"],
                        maxRecurrenceLimit: 12,
                    }
                },
                isSeeded: true
            },
            {
                systemCategoryId: "SC_ADVANCE_002",
                name: "Advance Payment",
                code: "ADVANCE_PAYMENT",
                description: "Payments made in advance for future expenses",
                logicConfig: {
                    autoCreate: false,
                    maxAmount: 100000,
                    requiresApproval: true,
                    autoApproveLimit: null,
                    allowRecurring: false,
                    mandatoryFields: ["advanceReason", "expectedUsageDate"],
                    additionalRules: {
                        requiresSettlement: true,
                        settlementDays: 30
                    }
                },
                isSeeded: true
            },
            {
                systemCategoryId: "SC_TRAVEL_003",
                name: "Travel Expenses",
                code: "TRAVEL",
                description: "Expenses related to business travel",
                logicConfig: {
                    autoCreate: false,
                    maxAmount: null,
                    requiresApproval: true,
                    autoApproveLimit: 10000,
                    allowRecurring: false,
                    mandatoryFields: ["travelStartDate", "travelEndDate", "destination"],
                    additionalRules: {
                        requiresItinerary: true,
                        perDiemApplicable: true
                    }
                },
                isSeeded: true
            },
            {
                systemCategoryId: "SC_OPERATIONAL_004",
                name: "Operational Expenses",
                code: "OPERATIONAL",
                description: "Day-to-day operational expenses",
                logicConfig: {
                    autoCreate: false,
                    maxAmount: null,
                    requiresApproval: true,
                    autoApproveLimit: 2000,
                    allowRecurring: true,
                    mandatoryFields: ["description"],
                    additionalRules: {
                        categoryRequired: true
                    }
                },
                isSeeded: true
            },
            {
                systemCategoryId: "SC_CAPITAL_005",
                name: "Capital Expenses",
                code: "CAPITAL",
                description: "Capital expenditure and asset purchases",
                logicConfig: {
                    autoCreate: false,
                    maxAmount: null,
                    requiresApproval: true,
                    autoApproveLimit: null,
                    allowRecurring: false,
                    mandatoryFields: ["assetCategory", "depreciationPeriod"],
                    additionalRules: {
                        requiresBusinessCase: true,
                        minimumAmount: 50000
                    }
                },
                isSeeded: true
            }
        ];
        
        await systemCategoryModel.insertMany(systemCategories);
        
        return returnFormatter(true, "System categories seeded successfully", systemCategories);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}
