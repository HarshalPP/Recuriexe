import subcategoryModel from "../../models/expenseModels/subcategory.model.js";
import { returnFormatter, generateUniqueId } from "../../formatters/common.formatter.js";
import { formatSubcategory, formatSubcategoryForUpdate } from "../../formatters/expenseFormatter/subcategory.formatter.js";
import { createAuditLog } from "../../helper/expenseHelper/auditLog.helper.js";

export async function createSubcategory(subcategoryData, organizationId, Id) {
    try {
         const createdBy = Id;
        console.log("id",createdBy);    
          const formattedData = formatSubcategory(subcategoryData, organizationId, createdBy);
        const newSubcategory = new subcategoryModel(formattedData);
        const savedSubcategory = await newSubcategory.save();
        
        // Create audit log
        await createAuditLog({
            organizationId,
            entityType: 'Subcategory',
            entityId: savedSubcategory.subcategoryId,
            action: 'Created',
            performedBy: createdBy,
            performedByName: 'System User',
            performedByRole: 'Admin',
            newValues: savedSubcategory
        });
        
        return returnFormatter(true, "Subcategory created successfully", savedSubcategory);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function getAllSubcategories(organizationId, filters) {
    try {
        const { page, limit, systemCategoryId, search } = filters;
        const skip = (page - 1) * limit;
        
        let query = { organizationId, isActive: true };
        
        if (systemCategoryId) query.systemCategoryId = systemCategoryId;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        const subcategories = await subcategoryModel
            .find(query)
            .select('-__v')
            .sort({ name: 1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await subcategoryModel.countDocuments(query);
        
        const result = {
            subcategories,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        };
        
        return returnFormatter(true, "Subcategories retrieved successfully", result);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function getSubcategoryById(subcategoryId, organizationId) {
    try {
        const subcategory = await subcategoryModel.findOne({ 
            subcategoryId, 
            organizationId,
            isActive: true 
        }).select('-__v');
        
        if (!subcategory) {
            return returnFormatter(false, "Subcategory not found");
        }
        
        return returnFormatter(true, "Subcategory retrieved successfully", subcategory);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function updateSubcategoryData(subcategoryId, updateData, organizationId, updatedBy) {
    try {
        const existingSubcategory = await subcategoryModel.findOne({ 
            subcategoryId, 
            organizationId,
            isActive: true 
        });
        
        if (!existingSubcategory) {
            return returnFormatter(false, "Subcategory not found");
        }
        
        const formattedData = formatSubcategoryForUpdate(updateData);
        const updatedSubcategory = await subcategoryModel.findOneAndUpdate(
            { subcategoryId },
            formattedData,
            { new: true }
        ).select('-__v');
        
        // Create audit log
        await createAuditLog({
            organizationId,
            entityType: 'Subcategory',
            entityId: subcategoryId,
            action: 'Updated',
            performedBy: updatedBy,
            performedByName: 'System User',
            performedByRole: 'Admin',
            oldValues: existingSubcategory,
            newValues: updatedSubcategory
        });
        
        return returnFormatter(true, "Subcategory updated successfully", updatedSubcategory);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function deleteSubcategoryData(subcategoryId, organizationId, deletedBy) {
    try {
        const subcategory = await subcategoryModel.findOne({ 
            subcategoryId, 
            organizationId,
            isActive: true 
        });
        
        if (!subcategory) {
            return returnFormatter(false, "Subcategory not found");
        }
        
        // Soft delete
        await subcategoryModel.findOneAndUpdate(
            { subcategoryId },
            { isActive: false }
        );
        
        // Create audit log
        await createAuditLog({
            organizationId,
            entityType: 'Subcategory',
            entityId: subcategoryId,
            action: 'Deleted',
            performedBy: deletedBy,
            performedByName: 'System User',
            performedByRole: 'Admin',
            oldValues: subcategory
        });
        
        return returnFormatter(true, "Subcategory deleted successfully");
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function getSubcategoriesBySystemCategory(systemCategoryId, organizationId) {
    try {
        const subcategories = await subcategoryModel
            .find({ 
                systemCategoryId, 
                organizationId,
                isActive: true 
            })
            .select('subcategoryId name description')
            .sort({ name: 1 });
        
        return returnFormatter(true, "Subcategories by system category retrieved successfully", subcategories);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}
