// Expense ERP Models - Index File
// Import all expense models for easy access

// Core Models
export { default as systemCategoryModel } from './systemCategory.model.js';
export { default as subcategoryModel } from './subcategory.model.js';
export { default as expenseTypeModel } from './expenseType.model.js';
export { default as dynamicFormModel } from './dynamicForm.model.js';
export { default as workflowModel } from './workflow.model.js';
export { default as expenseSubmissionModel } from './expenseSubmission.model.js';

// Organization & User Management
export { default as organizationModel } from './organization.model.js';
export { default as userRoleModel } from './userRole.model.js';

// Budget & Financial
export { default as budgetModel } from './budget.model.js';

// System & Audit
export { default as auditLogModel } from './auditLog.model.js';
export { default as notificationModel } from './notification.model.js';

// Templates & Reporting
export { default as templateModel } from './template.model.js';
export { default as reportConfigModel } from './reportConfig.model.js';

// Model Categories for easy reference
export const coreModels = {
    systemCategoryModel,
    subcategoryModel,
    expenseTypeModel,
    dynamicFormModel,
    workflowModel,
    expenseSubmissionModel
};

export const organizationModels = {
    organizationModel,
    userRoleModel
};

export const financialModels = {
    budgetModel
};

export const systemModels = {
    auditLogModel,
    notificationModel
};

export const utilityModels = {
    templateModel,
    reportConfigModel
};

// All models combined
export const allExpenseModels = {
    ...coreModels,
    ...organizationModels,
    ...financialModels,
    ...systemModels,
    ...utilityModels
};
