const {
    addDepartment,
    updateDepartment,
    getDepartmentById,
    getAllDepartments,
    deactivateDepartment,
    getSubDepartmentsByDepartmentId,
    getAllMainDepartments
} = require('../../helper/department.helper.js');

const { badRequest, success, unknownError, parseJwt } = require('../../../../../globalHelper/response.globalHelper.js');

// ------------------------------------Department------------------------------------ //

async function addNewDepartment(req, res) {
    try {
        const { status, message, data } = await addDepartment(req.body);
        return status ? success(res, message) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function updateDepartmentData(req, res) {
    try {
        const { status, message, data } = await updateDepartment(req.params.departmentId, req.body);
        return status ? success(res, message) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function getDepartmentList(req, res) {
    try {
        const { status, message, data } = await getAllDepartments();
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function getSubDepartmentList(req, res) {
    try {
        const { status, message, data } = await getSubDepartmentsByDepartmentId(req.params.departmentId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function getMainDepartmentList(req, res) {
    try {
        const { status, message, data } = await getAllMainDepartments();
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function getDepartmentByIdData(req, res) {
    try {
        const { status, message, data } = await getDepartmentById(req.params.departmentId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function deactivateDepartmentById(req, res) {
    try {
        const { status, message, data } = await deactivateDepartment(req.params.departmentId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

module.exports = {
    addNewDepartment,
    updateDepartmentData,
    getDepartmentList,
    getSubDepartmentList,
    getDepartmentByIdData,
    deactivateDepartmentById,
    getMainDepartmentList
};
