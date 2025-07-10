import dynamicFormModel from "../../models/expenseModels/dynamicForm.model.js";
import { returnFormatter, generateUniqueId } from "../../formatters/common.formatter.js";
import { formatDynamicForm, formatDynamicFormForUpdate } from "../../formatters/expenseFormatter/dynamicForm.formatter.js";
import { createAuditLog } from "../../helper/expenseHelper/auditLog.helper.js";

export async function createDynamicForm(formData, organizationId, createdBy) {
    try {
        const formattedData = formatDynamicForm(formData, organizationId, createdBy);
        const newForm = new dynamicFormModel(formattedData);
        const savedForm = await newForm.save();
        
        // Create audit log
        await createAuditLog({
            organizationId,
            entityType: 'DynamicForm',
            entityId: savedForm.formId,
            action: 'Created',
            performedBy: createdBy,
            performedByName: 'System User',
            performedByRole: 'Admin',
            newValues: savedForm
        });
        
        return returnFormatter(true, "Dynamic form created successfully", savedForm);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function getAllDynamicForms(organizationId, filters) {
    try {
        const { page, limit, expenseTypeId } = filters;
        const skip = (page - 1) * limit;
        
        let query = { organizationId, isActive: true };
        if (expenseTypeId) query.expenseTypeId = expenseTypeId;
        
        const forms = await dynamicFormModel
            .find(query)
            .select('-__v')
            .sort({ name: 1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await dynamicFormModel.countDocuments(query);
        
        const result = {
            forms,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        };
        
        return returnFormatter(true, "Dynamic forms retrieved successfully", result);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function getDynamicFormById(formId, organizationId) {
    try {
        const form = await dynamicFormModel.findOne({ 
            formId, 
            organizationId,
            isActive: true 
        }).select('-__v');
        
        if (!form) {
            return returnFormatter(false, "Dynamic form not found");
        }
        
        return returnFormatter(true, "Dynamic form retrieved successfully", form);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function updateDynamicFormData(formId, updateData, organizationId, updatedBy) {
    try {
        const existingForm = await dynamicFormModel.findOne({ 
            formId, 
            organizationId,
            isActive: true 
        });
        
        if (!existingForm) {
            return returnFormatter(false, "Dynamic form not found");
        }
        
        const formattedData = formatDynamicFormForUpdate(updateData);
        const updatedForm = await dynamicFormModel.findOneAndUpdate(
            { formId },
            formattedData,
            { new: true }
        ).select('-__v');
        
        // Create audit log
        await createAuditLog({
            organizationId,
            entityType: 'DynamicForm',
            entityId: formId,
            action: 'Updated',
            performedBy: updatedBy,
            performedByName: 'System User',
            performedByRole: 'Admin',
            oldValues: existingForm,
            newValues: updatedForm
        });
        
        return returnFormatter(true, "Dynamic form updated successfully", updatedForm);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function deleteDynamicFormData(formId, organizationId, deletedBy) {
    try {
        const form = await dynamicFormModel.findOne({ 
            formId, 
            organizationId,
            isActive: true 
        });
        
        if (!form) {
            return returnFormatter(false, "Dynamic form not found");
        }
        
        // Soft delete
        await dynamicFormModel.findOneAndUpdate(
            { formId },
            { isActive: false }
        );
        
        // Create audit log
        await createAuditLog({
            organizationId,
            entityType: 'DynamicForm',
            entityId: formId,
            action: 'Deleted',
            performedBy: deletedBy,
            performedByName: 'System User',
            performedByRole: 'Admin',
            oldValues: form
        });
        
        return returnFormatter(true, "Dynamic form deleted successfully");
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function previewDynamicForm(formId, organizationId) {
    try {
        const form = await dynamicFormModel.findOne({ 
            formId, 
            organizationId,
            isActive: true 
        }).select('formId name fields validationRules');
        
        if (!form) {
            return returnFormatter(false, "Dynamic form not found");
        }
        
        // Generate preview data structure
        const preview = {
            formId: form.formId,
            name: form.name,
            fields: form.fields.map(field => ({
                name: field.name,
                type: field.type,
                label: field.label,
                required: field.required,
                options: field.options || null,
                validation: field.validation || null
            })),
            validationRules: form.validationRules
        };
        
        return returnFormatter(true, "Form preview generated successfully", preview);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function validateFormData(formId, submissionData, organizationId) {
    try {
        const form = await dynamicFormModel.findOne({ 
            formId, 
            organizationId,
            isActive: true 
        });
        
        if (!form) {
            return returnFormatter(false, "Form not found");
        }
        
        const validationErrors = [];
        
        // Validate each field
        form.fields.forEach(field => {
            const value = submissionData[field.name];
            
            // Check required fields
            if (field.required && (!value || value === '')) {
                validationErrors.push(`${field.label} is required`);
            }
            
            // Type validation
            if (value && field.validation) {
                const validation = field.validation;
                
                if (field.type === 'number') {
                    const numValue = parseFloat(value);
                    if (validation.min && numValue < validation.min) {
                        validationErrors.push(`${field.label} must be at least ${validation.min}`);
                    }
                    if (validation.max && numValue > validation.max) {
                        validationErrors.push(`${field.label} must not exceed ${validation.max}`);
                    }
                }
                
                if (field.type === 'text' && validation.pattern) {
                    const regex = new RegExp(validation.pattern);
                    if (!regex.test(value)) {
                        validationErrors.push(`${field.label} format is invalid`);
                    }
                }
            }
        });
        
        if (validationErrors.length > 0) {
            return returnFormatter(false, "Validation failed", { errors: validationErrors });
        }
        
        return returnFormatter(true, "Validation passed", { isValid: true });
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}
