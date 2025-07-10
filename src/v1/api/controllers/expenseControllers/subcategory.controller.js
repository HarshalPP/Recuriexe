import { 
    createSubcategory, 
    getAllSubcategories, 
    getSubcategoryById, 
    updateSubcategoryData, 
    deleteSubcategoryData 
} from "../../helper/expenseHelper/subcategory.helper.js";
import { success, badRequest, unknownError, created, notFound } from '../../helper/response.helper.js';
// import { parseJwt } from "../../middleware/authToken.js";

export async function createNewSubcategory(req, res) {
    try {
        const token = req.employee;
        const { status, message, data } = await createSubcategory(req.body, token.organizationId,token.Id);
        return status ? created(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function getSubcategories(req, res) {
    try {
        const token = req.employee ;
        const { page = 1, limit = 10, systemCategoryId = '', search = '' } = req.query;
        const { status, message, data } = await getAllSubcategories(
            token.organizationId, 
            { page, limit, systemCategoryId, search }
        );
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function getSubcategory(req, res) {
    try {
        const token = req.employee ;
        const { status, message, data } = await getSubcategoryById(req.params.id, token.organizationId);
        return status ? success(res, message, data) : notFound(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function updateSubcategory(req, res) {
    try {
        const token = req.employee ;
        const { status, message, data } = await updateSubcategoryData(
            req.params.id, 
            req.body, 
            token.organizationId,
            token.id
        );
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

export async function deleteSubcategory(req, res) {
    try {
        const token = req.employee;
        const { status, message } = await deleteSubcategoryData(
            req.params.id, 
            token.organizationId,
            token.userId
        );
        return status ? success(res, message) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}