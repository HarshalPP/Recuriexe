
import categoryModel from "../../models/expense/expenseCategory.model.js";
import { categoryFormatter } from "../../formatters/expense/expenseCategory.formatter.js";
import { returnFormatter } from "../../formatters/common.formatter.js";

export async function addCategory(requestsObject) {
    try {
         const { organizationId } = requestsObject.employee;
        if (!organizationId) {
              return returnFormatter(false, "organizationId is required");
            }
        const formattedData = categoryFormatter(requestsObject);
        const nameExist = await categoryModel.findOne({ name: formattedData.name, organizationId });
        if (nameExist) {
            return returnFormatter(false, "Category Name Already Exists");
        }
        // if (formattedData.isSubCategory && !formattedData.parentCategoryId) {
        //     return returnFormatter(false, "Parent Category Is Required");
        // }
        const newCategoryData = await categoryModel.create({
            ...formattedData,
            createdById: requestsObject?.employee?.id,
        });
        return returnFormatter(true, "Category Created Successfully", newCategoryData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}


export async function allCategory(req) {
    try {
        const {organizationId} = req.employee
        // Get all expense types with populated fields
        const expenseTypes = await categoryModel.find({organizationId})
            .populate('createdById', 'fullName userName')
            .populate('parentCategoryId', 'name description')
            .populate('expenseTypeId', 'name description')
            .populate('organizationId', 'name')
            .sort({ createdAt: -1 });

        return returnFormatter(true, "category types fetched successfully", expenseTypes);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}


export async function getCategoryDropdown() {
    try {
        // Get only parent categories (isSubCategory: false)
        const parentCategories = await categoryModel.find(
            { isSubCategory: false },
            {
                _id: 1,
                name: 1,
                description: 1,
                acountCode: 1
            }
        ).lean();

        return returnFormatter(true, "Parent categories fetched successfully", parentCategories);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}


export async function updateCategory(requestsObject) {
    try {
        const formattedData = categoryFormatter(requestsObject);
        const categoryId = requestsObject.body.id;

        if (!categoryId) {
            return returnFormatter(false, "Category ID is required for update");
        }

        const existingCategory = await categoryModel.findById(categoryId);
        console.log(existingCategory,"existingCategory")
        if (!existingCategory) {
            return returnFormatter(false, "Category not found");
        }

        // Check if name already exists for another category
        const duplicateName = await categoryModel.findOne({
            name: formattedData.name.trim(),
            _id: { $ne: categoryId }
        });

        if (duplicateName) {
            return returnFormatter(false, "Category Name Already Exists");
        }

        // Validate parent category if it's a subcategory
        if (formattedData.isSubCategory && !formattedData.parentCategoryId) {
            return returnFormatter(false, "Parent Category is required for a subcategory");
        }

        const updatedCategory = await categoryModel.findByIdAndUpdate(
            categoryId,
            { ...formattedData ,
                createdById: requestsObject.user?.id
            },
            { new: true }
        );

        return returnFormatter(true, "Category Updated Successfully", updatedCategory);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function getCategoryById(requestsObject) {
    try {
        const categoryId = requestsObject.query.id;
        if (!categoryId) {
            return returnFormatter(false, "Category ID is Required");
        }

        const existingCategory = await categoryModel.findById(categoryId);
        if (!existingCategory) {
            return returnFormatter(false, "Category Not Found");
        }

        const categoryDetails = await categoryModel.findById(categoryId)
            .populate('createdById', 'fullName userName')
            .populate('parentCategoryId', 'name description')
            .populate('expenseTypeId', 'name description')
            .populate('organizationId', 'name')

        return returnFormatter(true, "Category Details Fetched Successfully", categoryDetails);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function deleteCategory(requestsObject) {
    try {
        const categoryId = requestsObject.body.id;
        if (!categoryId) {
            return returnFormatter(false, "Category ID is Required");
        }

        const existingCategory = await categoryModel.findById(categoryId);
        if (!existingCategory) {
            return returnFormatter(false, "Category Not Found");
        }
        const expenseTypes = await categoryModel.findByIdAndDelete(categoryId)

        return returnFormatter(true, "Category Delete Successfully");
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}
