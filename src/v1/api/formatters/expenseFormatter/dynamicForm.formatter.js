import { generateUniqueId } from '../common.formatter.js';

export function formatDynamicForm(formData, organizationId, createdBy) {
    const {
        name,
        expenseTypeId,
        fields,
        validationRules,
        description
    } = formData;
    
    return {
        formId: generateUniqueId('FORM_'),
        organizationId,
        expenseTypeId: expenseTypeId || null,
        name,
        description: description || "",
        fields: fields.map(field => formatFormField(field)),
        validationRules: validationRules || {},
        isActive: true,
        createdBy
    };
}

export function formatDynamicFormForUpdate(updateData) {
    const allowedFields = [
        'name', 'description', 'fields', 'validationRules'
    ];
    
    const formattedData = {};
    
    Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
            if (key === 'fields') {
                formattedData[key] = updateData[key].map(field => formatFormField(field));
            } else {
                formattedData[key] = updateData[key];
            }
        }
    });
    
    return formattedData;
}

export function formatFormField(fieldData) {
    return {
        fieldId:generateUniqueId('FORMFIELD_'),
        fieldName: fieldData.fieldName,
        fieldType: fieldData.fieldType,
        label: fieldData.label,
        required: fieldData.required || false,
        placeholder: fieldData.placeholder || "",
        defaultValue: fieldData.defaultValue || null,
        options: fieldData.options || null, // For select, radio, checkbox
        validation: fieldData.validation || null,
        conditionalLogic: fieldData.conditionalLogic || null,
        displayOrder: fieldData.displayOrder || 0
    };
}

export function formatValidationRules(rules) {
    return {
        globalRules: rules.globalRules || [],
        fieldRules: rules.fieldRules || {},
        customValidators: rules.customValidators || []
    };
}


