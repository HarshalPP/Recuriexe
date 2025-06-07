import categoryModel from "../../models/expense/expenseCategory.model.js";

const categoryData = [
    {
        "name": "Travel & Transportation",
        "description": "Costs for business travel, including flights, accommodation, meals, and ground transportation.",
        "accountCode": "6100",
        "isDefault":true
    },
    {
        "name": "Office Expenses",
        "description": "Expenses for office supplies, rent, utilities, software, and equipment.",
        "accountCode": "6200",
         "isDefault":true
    },
    {
        "name": "Professional Services",
        "description": "Fees for accounting, legal, consulting, and freelance/contractor services.",
        "accountCode": "6300",
         "isDefault":true
    },
    {
        "name": "Marketing & Sales",
        "description": "Expenses for advertising, promotional materials, website, and sales commissions.",
        "accountCode": "6400",
         "isDefault":true
    },
    {
        "name": "Employee & HR",
        "description": "Costs related to employee benefits, training, and recruitment.",
        "accountCode": "6500",
         "isDefault":true
    }
];


// const addCategories = async () => {
//     try {
//         const data = await categoryModel.find();
//         if (data.length > 0) { 
//             console.log("Categories are already added");
//             return; 
//         }
//         // Use insertMany to efficiently add multiple categories
//         const createdData = await categoryModel.insertMany(categoryData);
//         console.log("Categories added successfully:", createdData);
//     } catch (error) {
//         console.error("Error adding categories:", error)
//     }
// };

const addCategories = async (organizationId) => {
    try {
        const existing = await categoryModel.findOne({ organizationId, isDefault: true });
        if (existing) {
            // console.log(`Default categories already exist for org: ${organizationId}`);
            return;
        }

        const categories = categoryData.map(cat => ({
            ...cat,
            organizationId
        }));

        await categoryModel.insertMany(categories);
        console.log(`Default categories created for org: ${organizationId}`);
    } catch (error) {
        console.error("Error adding default categories:", error);
    }
};

// Execute the function

export default  addCategories
