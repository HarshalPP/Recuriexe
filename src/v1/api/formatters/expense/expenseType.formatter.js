export function expenseTypeFormatter(data) {
    const {
        name,
        categoriesIds,
        defaultCategoryId ,
        description,
        level,
        remitter,
        organizationId = data.employee.organizationId
    } = data.body;

    return {
        name,
        categoriesIds,
        defaultCategoryId,
        description,
         level,
        remitter,
        organizationId
    };
}