import { generateUniqueId } from '../common.formatter.js';

export function formatExpenseType(expenseTypeData, organizationId, createdBy) {
    const {
        name,
        systemCategoryId,
        subcategoryId,
        description,
        // config,
        formId,
        workflowId
    } = expenseTypeData;
    
    return {
        expenseTypeId: generateUniqueId('EXPT_'),
        organizationId,
        systemCategoryId,
        subcategoryId: subcategoryId || null,
        name,
        description: description || "",
        // config: {
        //     maxAmount: config?.maxAmount || null,
        //     requiresReceipt: config?.requiresReceipt || false,
        //     autoApproveIfBelowAmount: config?.autoApproveIfBelowAmount || null,
        //     mandatoryFields: config?.mandatoryFields || [],
        //     ...config
        // },
        formId: formId || null,
        workflowId: workflowId || null,
        isPublished: false,
        isActive: true,
        createdBy,
        publishedBy: null,
        publishedAt: null
    };
}

export function formatExpenseTypeForUpdate(updateData) {
    const allowedFields = [
        'name', 'description', 'config', 'formId', 'workflowId'
    ];
    
    const formattedData = {};
    
    Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
            formattedData[key] = updateData[key];
        }
    });
    
    return formattedData;
}

export function formatExpenseTypeConfig(configData) {
    return {
        maxAmount: configData.maxAmount || null,
        requiresReceipt: configData.requiresReceipt || false,
        autoApproveIfBelowAmount: configData.autoApproveIfBelowAmount || null,
        mandatoryFields: configData.mandatoryFields || [],
        travel: configData.travel || null,
        mileage: configData.mileage || null,
        customRules: configData.customRules || {}
    };
}
