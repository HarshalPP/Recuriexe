export function categoryFormatter(data) {
    const {
        name,
        description,
        isSubCategory,
        expenseTypeId,
        accountCode,
        parentCategoryId,
        isActive = true,
        organizationId = data.employee.organizationId
    } = data.body;

    return {
        name: name?.trim(),
        description,
        isSubCategory,
        expenseTypeId,
        parentCategoryId,
        accountCode,
        isActive,
        organizationId
    };
}
