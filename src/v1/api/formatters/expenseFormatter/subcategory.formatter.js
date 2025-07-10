import { generateUniqueId } from '../common.formatter.js';

export function formatSubcategory(subcategoryData, organizationId,createdBy) {
    const {
        name,
        systemCategoryId,
        description,
        displayOrder,
        icon,
        color
    } = subcategoryData;
    
    return {
        subcategoryId: generateUniqueId('SUBCAT_'),
        organizationId,
        systemCategoryId,
        name,
        description: description || "",
        displayOrder: displayOrder || 0,
        isActive: true,
        createdBy,
        icon,
        color
    };
}

export function formatSubcategoryForUpdate(updateData) {
    const allowedFields = [
        'name', 'description', 'displayOrder'
    ];
    
    const formattedData = {};
    
    Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
            formattedData[key] = updateData[key];
        }
    });
    
    return formattedData;
}

export function formatSubcategoryResponse(subcategory) {
    return {
        subcategoryId: subcategory.subcategoryId,
        systemCategoryId: subcategory.systemCategoryId,
        name: subcategory.name,
        description: subcategory.description,
        displayOrder: subcategory.displayOrder,
        icon:subcategory.icon,
        color:subcategory.color,
        isActive: subcategory.isActive,
        createdAt: subcategory.createdAt,
        updatedAt: subcategory.updatedAt
    };
}
