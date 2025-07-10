import { 
    getAllSystemCategories, 
    getSystemCategoryById,
    getSystemCategoryByCode 
} from "../../helper/expenseHelper/systemCategory.helper.js";
import { success, badRequest, unknownError, notFound } from '../../helper/response.helper.js';

export async function getSystemCategories(req, res) {
    try {
        const { status, message, data } = await getAllSystemCategories();
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);``
    }
}

export async function getSystemCategory(req, res) {
    try {
        const { status, message, data } = await getSystemCategoryById(req.params.systemCategoryId);
        return status ? success(res, message, data) : notFound(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function getSystemCategoryByCodeName(req, res) {
    try {
        const { status, message, data } = await getSystemCategoryByCode(req.params.code);
        return status ? success(res, message, data) : notFound(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}
