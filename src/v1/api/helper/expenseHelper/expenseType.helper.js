import expenseTypeModel from "../../models/expenseModels/expenseType.model.js";
import { returnFormatter, generateUniqueId } from "../../formatters/common.formatter.js";
import { formatExpenseType, formatExpenseTypeForUpdate } from "../../formatters/expenseFormatter/expenseType.formatter.js";
import { createAuditLog } from "./auditLog.helper.js";

export async function createExpenseType(expenseTypeData, organizationId, Id) {
    try { 
        const createdBy = Id;
        const formattedData = formatExpenseType(expenseTypeData, organizationId, createdBy);
        const newExpenseType = new expenseTypeModel(formattedData);
        const savedExpenseType = await newExpenseType.save();
        
        // Create audit log
        await createAuditLog({
            organizationId,
            entityType: 'ExpenseType',
            entityId: savedExpenseType.expenseTypeId,
            action: 'Created',
            performedBy: createdBy,
            performedByName: 'System User',
            performedByRole: 'Admin',
            newValues: savedExpenseType
        });
        
        return returnFormatter(true, "Expense type created successfully", savedExpenseType);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function getAllExpenseTypes(organizationId, filters) {
    try {
        const { page, limit, systemCategoryId, subcategoryId, isPublished } = filters;
        const skip = (page - 1) * limit;
        
        let query = { organizationId, isActive: true };
        
        if (systemCategoryId) query.systemCategoryId = systemCategoryId;
        if (subcategoryId) query.subcategoryId = subcategoryId;
        if (isPublished !== '') query.isPublished = isPublished === 'true';
        
        const expenseTypes = await expenseTypeModel
            .find(query)
            .select('-__v')
            .sort({ name: 1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await expenseTypeModel.countDocuments(query);
        
        const result = {
            expenseTypes,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        };
        
        return returnFormatter(true, "Expense types retrieved successfully", result);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function getExpenseTypeById(expenseTypeId, organizationId) {
    try {
        const expenseType = await expenseTypeModel.findOne({ 
            expenseTypeId, 
            organizationId,
            isActive: true 
        }).select('-__v');
        
        if (!expenseType) {
            return returnFormatter(false, "Expense type not found");
        }
        
        return returnFormatter(true, "Expense type retrieved successfully", expenseType);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function updateExpenseTypeData(expenseTypeId, updateData, organizationId, updatedBy) {
    try {
        const existingExpenseType = await expenseTypeModel.findOne({ 
            expenseTypeId, 
            organizationId,
            isActive: true 
        });
        
        if (!existingExpenseType) {
            return returnFormatter(false, "Expense type not found");
        }
        
        const formattedData = formatExpenseTypeForUpdate(updateData);
        const updatedExpenseType = await expenseTypeModel.findOneAndUpdate(
            { expenseTypeId },
            formattedData,
            { new: true }
        ).select('-__v');
        
        // Create audit log
        await createAuditLog({
            organizationId,
            entityType: 'ExpenseType',
            entityId: expenseTypeId,
            action: 'Updated',
            performedBy: updatedBy,
            performedByName: 'System User',
            performedByRole: 'Admin',
            oldValues: existingExpenseType,
            newValues: updatedExpenseType
        });
        
        return returnFormatter(true, "Expense type updated successfully", updatedExpenseType);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function deleteExpenseTypeData(expenseTypeId, organizationId, deletedBy) {
    try {
        const expenseType = await expenseTypeModel.findOne({ 
            expenseTypeId, 
            organizationId,
            isActive: true 
        });
        
        if (!expenseType) {
            return returnFormatter(false, "Expense type not found");
        }
        
        // Soft delete
        await expenseTypeModel.findOneAndUpdate(
            { expenseTypeId },
            { isActive: false }
        );
        
        // Create audit log
        await createAuditLog({
            organizationId,
            entityType: 'ExpenseType',
            entityId: expenseTypeId,
            action: 'Deleted',
            performedBy: deletedBy,
            performedByName: 'System User',
            performedByRole: 'Admin',
            oldValues: expenseType
        });
        
        return returnFormatter(true, "Expense type deleted successfully");
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function publishExpenseType(expenseTypeId, organizationId, publishedBy) {
    try {
        const expenseType = await expenseTypeModel.findOne({ 
            expenseTypeId, 
            organizationId,
            isActive: true 
        });
        
        if (!expenseType) {
            return returnFormatter(false, "Expense type not found");
        }
        
        const updatedExpenseType = await expenseTypeModel.findOneAndUpdate(
            { expenseTypeId },
            { 
                isPublished: true,
                publishedAt: new Date(),
                publishedBy
            },
            { new: true }
        ).select('-__v');
        
        // Create audit log
        await createAuditLog({
            organizationId,
            entityType: 'ExpenseType',
            entityId: expenseTypeId,
            action: 'Published',
            performedBy: publishedBy,
            performedByName: 'System User',
            performedByRole: 'Admin',
            newValues: updatedExpenseType,
            comments: 'Expense type published and available for use'
        });
        
        return returnFormatter(true, "Expense type published successfully", updatedExpenseType);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function getPublishedExpenseTypes(organizationId) {
    try {
        const expenseTypes = await expenseTypeModel
            .find({ 
                organizationId, 
                isActive: true,
                isPublished: true 
            })
            .select('expenseTypeId name description systemCategoryId subcategoryId config')
            .sort({ name: 1 });
        
        return returnFormatter(true, "Published expense types retrieved successfully", expenseTypes);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}
