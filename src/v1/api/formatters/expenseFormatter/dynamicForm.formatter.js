import { generateUniqueId } from '../common.formatter.js';

export function formatDynamicForm(formData, organizationId, createdBy) {
    const {
        name,
        expenseTypeId,
        fields,
        validationRules,
        description
    } = formData;

    const amountCount = fields.filter(f => f.fieldName === 'amount').length;
if (amountCount > 1) {
   throw new Error("Only one 'amount' field is allowed.");
}

    
    
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

// export function formatDynamicFormForUpdate1(updateData) {
//     const allowedFields = [
//         'name', 'description', 'fields', 'validationRules'
//     ];
    
//     const formattedData = {};
    
//     Object.keys(updateData).forEach(key => {
//         if (allowedFields.includes(key)) {
//             if (key === 'fields') {
//                 formattedData[key] = updateData[key].map(field => formatFormField(field));
//             } else {
//                 formattedData[key] = updateData[key];
//             }
//         }
//     });
    
//     return formattedData;
// }

export function formatDynamicFormForUpdate(updateData) {
    const allowedFields = ['name', 'description', 'fields'];
    const formattedData = {};

    allowedFields.forEach((key) => {
        if (key === 'fields' && Array.isArray(updateData.fields)) {
            const existingFields = updateData.existingFields || [];
            const existingFieldsMap = new Map();
            existingFields.forEach(field => {
                existingFieldsMap.set(field.fieldId, field);
            });

            const incomingFieldsMap = new Map();
            const mergedFields = [];

            updateData.fields.forEach(incomingField => {
                // If fieldId is missing => generate new
                const fieldId = incomingField.fieldId || generateUniqueId('FORMFIELD_');
                incomingField.fieldId = fieldId;

                incomingFieldsMap.set(fieldId, true);

                const existingField = existingFieldsMap.get(fieldId) || {};
                const isEdited = incomingField.fieldName === 'amount' ? false : true;

                // Merge existing + incoming field (with nested validation/logic)
                mergedFields.push({
                    ...existingField,
                    ...incomingField,
                    isEdited,
                    validation: {
                        ...((existingField.validation || {})),
                        ...(incomingField.validation || {})
                    },
                    conditionalLogic: {
                        ...((existingField.conditionalLogic || {})),
                        ...(incomingField.conditionalLogic || {})
                    }
                });
            });

            // Add untouched existing fields not included in update
            existingFields.forEach(field => {
                if (!incomingFieldsMap.has(field.fieldId)) {
                    mergedFields.push(field);
                }
            });

            formattedData.fields = mergedFields;
        } else if (updateData[key] !== undefined) {
            formattedData[key] = updateData[key];
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
        displayOrder: fieldData.displayOrder || 0,
       isEdited: fieldData.fieldName === 'amount' ? false : true
    };
}

export function formatValidationRules(rules) {
    return {
        globalRules: rules.globalRules || [],
        fieldRules: rules.fieldRules || {},
        customValidators: rules.customValidators || []
    };
}


