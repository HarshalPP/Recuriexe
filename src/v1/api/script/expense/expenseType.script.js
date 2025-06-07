import expenesTypeModel from '../../models/expense/expenesType.model.js';
import categoryModel from "../../models/expense/expenseCategory.model.js";

// Map of custom expense type names to category names
const expenseTypeData = [
    {
        name: "Travel", // custom name
        description: "Costs for business travel, including flights, accommodation, meals, and ground transportation.",
        categoryName: "Travel & Transportation",
        isDefault: true,
    },
    {
        name: "Office Costs",
        description: "Expenses for office supplies, rent, utilities, software, and equipment.",
        categoryName: "Office Expenses",
        isDefault: true,
    },
    {
        name: "Pro Services",
        description: "Fees for accounting, legal, consulting, and freelance/contractor services.",
        categoryName: "Professional Services",
        isDefault: true,
    },
    {
        name: "Marketing",
        description: "Expenses for advertising, promotional materials, website, and sales commissions.",
        categoryName: "Marketing & Sales",
        isDefault: true,
    },
    {
        name: "HR & Employees",
        description: "Costs related to employee benefits, training, and recruitment.",
        categoryName: "Employee & HR",
        isDefault: true,
    }
];

// const addExpenses = async () => {
//     try {
//         const existingExpenses = await expenesTypeModel.find();
//         if (existingExpenses.length > 0) {
//             console.log("Expenses are already added.");
//             return;
//         }

//         const categoryData = await categoryModel.find();
//         if (!categoryData.length) {
//             console.log("No categories found.");
//             return;
//         }

//         const expenseDataWithCategory = expenseTypeData.map(expenseType => {
//             const matchedCategory = categoryData.find(cat =>
//                 cat.name.toLowerCase() === expenseType.categoryName.toLowerCase()
//             );

//             if (!matchedCategory) {
//                 console.warn(`Category not found for ${expenseType.categoryName}`);
//             }

//             return {
//                 name: expenseType.name, // custom name
//                 description: expenseType.description,
//                 isDefault: expenseType.isDefault,
//                 categoriesIds: matchedCategory ? matchedCategory._id : null,
//                 defaultCategoryId: matchedCategory ? matchedCategory._id : null
//             };
//         });

//         const createdExpenses = await expenesTypeModel.insertMany(expenseDataWithCategory);
//         console.log("Expenses added successfully:", createdExpenses);
//     } catch (error) {
//         console.error("Error adding expenses:", error);
//     }
// };

const addExpenses = async (organizationId) => {
    try {
        // Check if default expenses already exist for this organization
        const existingExpenses = await expenesTypeModel.find({ organizationId, isDefault: true });
        if (existingExpenses.length > 0) {
            // console.log("Default expenses already added for this organization.");
            return;
        }

        // Get categories for this organization
        const categoryData = await categoryModel.find({ organizationId, isDefault: true });
        if (!categoryData.length) {
            console.log("No default categories found for this organization.");
            return;
        }

        // Map and attach matched category + org ID
        const expenseDataWithCategory = expenseTypeData.map(expenseType => {
            const matchedCategory = categoryData.find(cat =>
                cat.name.toLowerCase() === expenseType.categoryName.toLowerCase()
            );

            if (!matchedCategory) {
                console.warn(`Category not found for ${expenseType.categoryName}`);
            }

            return {
                name: expenseType.name,
                description: expenseType.description,
                isDefault: expenseType.isDefault,
                categoriesIds: matchedCategory ? matchedCategory._id : null,
                defaultCategoryId: matchedCategory ? matchedCategory._id : null,
                organizationId, 
            };
        });

        const createdExpenses = await expenesTypeModel.insertMany(expenseDataWithCategory);
        console.log("Default expenses added successfully:", createdExpenses);
    } catch (error) {
        console.error("Error adding expenses:", error);
    }
};

export default addExpenses;
