const {
    addSheet,
    allSheet,
    updateSheet,
    sheetById,
    addSheetCategory,
    allSheetCategory,
    sheetCategoryById,
    deleteSheetCategory,
    updateSheetCategory,
    deleteSheet,
    allUserSheetSheetCategory,
    allAssignedSheet
} = require('../helper/sheet.helper.js');
const { badRequest, success, unknownError, parseJwt } = require('../../../../globalHelper/response.globalHelper.js');

// ------------------------------------sheet Category------------------------------------ //

async function addNewSheetCategory(req, res) {
    try {
        const token = parseJwt(req.headers.token)
        req.body.custom = token.roleName == 'admin' ? false : true
        req.body.creator = token.Id
        const { status, message, data } = await addSheetCategory(req.body);
        return status ? success(res, message) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function updateSheetCategoryData(req, res) {
    try {
        const { status, message, data } = await updateSheetCategory(req.params.sheetCategoryId, req.body);
        return status ? success(res, message) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function getSheetCategoryList(req, res) {
    try {
        const { status, message, data } = await allSheetCategory();
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function getAssignedSheetCategoryList(req, res) {
    try {
        const token = parseJwt(req.headers.token)
        let creator = token.Id
        const { status, message, data } = await allUserSheetSheetCategory(creator);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function getSheetCategoryById(req, res) {
    try {
        const { status, message, data } = await sheetCategoryById(req.params.sheetCategoryId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function deleteSheetCategoryById(req, res) {
    try {
        const { status, message, data } = await deleteSheetCategory(req.params.sheetCategoryId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// -----------------------------------------sheet----------------------------------------- //

async function addNewSheet(req, res) {
    try {
        const sheetCategoryCheck = await sheetCategoryById(req.body.sheetCategoryId);
        if (!sheetCategoryCheck.status) {
            return badRequest(res, sheetCategoryCheck.message);
        }
        const { status, message, data } = await addSheet(req.body);
        return status ? success(res, message) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function updateSheetData(req, res) {
    try {
        const { status, message, data } = await updateSheet(req.params.sheetId, req.body);
        return status ? success(res, message) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function deleteSheetData(req, res) {
    try {
        const { status, message, data } = await deleteSheet(req.params.sheetId, req.body);
        return status ? success(res, message) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function getSheetList(req, res) {
    try {
        const { status, message, data } = await allSheet();
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function getAssignedSheetList(req, res) {
    try {
        const token = parseJwt(req.headers.token)
        let id = token.Id
        const { status, message, data } = await allAssignedSheet(id);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function getSheetById(req, res) {
    try {
        const { status, message, data } = await sheetById(req.params.sheetId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function deleteSheetById(req, res) {
    try {
        const { status, message, data } = await deleteSheet(req.params.sheetId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

module.exports = {
    addNewSheetCategory,
    updateSheetCategoryData,
    getSheetCategoryList,
    getSheetCategoryById,
    deleteSheetCategoryById,
    addNewSheet,
    updateSheetData,
    deleteSheetData,
    getSheetList,
    getSheetById,
    deleteSheetById,
    getAssignedSheetCategoryList,
    getAssignedSheetList
};
