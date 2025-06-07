import { 
    addCategory, 
    allCategory,
    getCategoryById,
    updateCategory,
    deleteCategory,
    getCategoryDropdown,
} from "../../helper/expense/expensesCategory.helper.js";
import { 
    created, 
    success, 
    badRequest, 
    notFound, 
    unknownError 
} from "../../helper/response.helper.js";

export async function saveCategory(req, res) {
    try {
        const { status, message, data } = await addCategory(req);
        return status ? created(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function getCategory(req, res) {
    try {
        const { status, message, data } = await allCategory(req);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function updateCategoryById(req, res) {
    try {
        const { status, message, data } = await updateCategory(req);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function getCategoryDetail(req, res) {
    try {
        const { status, message, data } = await getCategoryById(req);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function deleteCategoryById(req, res) {
    try {
        const { status, message, data } = await deleteCategory(req);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}


export async function categoryDropdown(req, res) {
    try {

        const { status, message, data } = await getCategoryDropdown(req);
        // console.log(data,"data")
        return status ? success(res, message, data) : badRequest(res, message);

    } catch (error) {
        console.log(error,"error")
        return unknownError(res, error.message);
    }
}
