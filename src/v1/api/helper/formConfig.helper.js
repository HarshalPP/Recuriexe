const formConfigModel = require("../model/forms/form.config.model");
const { returnFormatter } = require("../formatter/common.formatter");
const { default: mongoose } = require("mongoose");

// Create a new FormConfig
async function addFormConfig(bodyData, userId) {
    try {
        bodyData.createdBy = userId;
        bodyData.updatedBy = userId;

        const saveData = new formConfigModel(bodyData);
        await saveData.save();
        return returnFormatter(true, "FormConfig created", saveData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// Get a FormConfig by formConfigId
async function getFormConfigById(formConfigId) {
    try {
        const formConfig = await formConfigModel.findOne({ formConfigId });
        if (!formConfig) {
            return returnFormatter(false, "FormConfig not found");
        }
        return returnFormatter(true, "FormConfig found", formConfig);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// Get a FormConfig by formConfigId
async function getFormConfigByName(formName) {
    try {
        const formConfig = await formConfigModel.findOne({ formName });
        if (!formConfig) {
            return returnFormatter(false, "FormConfig not found");
        }
        return returnFormatter(true, "FormConfig found", formConfig);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// Get all active FormConfigs
async function getAllActiveFormConfigs() {
    try {
        const formConfigs = await formConfigModel.find({ isActive: true });
        if (formConfigs.length === 0) {
            return returnFormatter(false, "No active FormConfigs found");
        }
        return returnFormatter(true, "Active FormConfigs found", formConfigs);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// Update a FormConfig
async function updateFormConfig(formConfigId, updateData, userId) {
    try {
        updateData.updatedBy = userId;
        const updatedFormConfig = await formConfigModel.findOneAndUpdate(
            { formConfigId },
            updateData,
            { new: true }
        );
        if (!updatedFormConfig) {
            return returnFormatter(false, "FormConfig not found");
        }
        return returnFormatter(true, "FormConfig updated", updatedFormConfig);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// Set isActive to false instead of deleting a FormConfig
async function deactivateFormConfig(formConfigId) {
    try {
        const deactivatedFormConfig = await formConfigModel.findOneAndUpdate(
            { formConfigId },
            { isActive: false },
            { new: true }
        );
        if (!deactivatedFormConfig) {
            return returnFormatter(false, "FormConfig not found");
        }
        return returnFormatter(true, "FormConfig deactivated", deactivatedFormConfig);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// Get all active FormConfigs of a specific creator or management employee
async function getAllActiveFormConfigsOfCreator() {
    try {
        const formConfigs = await formConfigModel.aggregate([
            {
                $match: {
                    isActive: true,
                },
            },
            // Lookups for each role reference
            {
                $lookup: {
                    from: 'employees',
                    localField: 'defaultL1',
                    foreignField: '_id',
                    as: 'defaultL1Details',
                },
            },
            {
                $lookup: {
                    from: 'employees',
                    localField: 'defaultL2',
                    foreignField: '_id',
                    as: 'defaultL2Details',
                },
            },
            {
                $lookup: {
                    from: 'employees',
                    localField: 'defaultL3',
                    foreignField: '_id',
                    as: 'defaultL3Details',
                },
            },
            {
                $lookup: {
                    from: 'employees',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdByDetails',
                },
            },
            {
                $lookup: {
                    from: 'employees',
                    localField: 'managementEmployee',
                    foreignField: '_id',
                    as: 'managementEmployeeDetails',
                },
            },
            {
                $lookup: {
                    from: 'employees',
                    localField: 'viewer',
                    foreignField: '_id',
                    as: 'viewerDetails',
                },
            },
            // Unwinds for flattening single-reference details
            {
                $unwind: {
                    path: '$defaultL1Details',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$defaultL2Details',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$defaultL3Details',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$createdByDetails',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$managementEmployeeDetails',
                    preserveNullAndEmptyArrays: true,
                },
            },
            // Project fields
            {
                $project: {
                    formName: 1,
                    isActive: 1,
                    formConfigId: 1,
                    defaultL1: 1,
                    defaultL2: 1,
                    defaultL3: 1,
                    managementEmployee: 1,
                    createdBy: 1,
                    updatedBy: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    viewer:1,
                    // Flattened names
                    defaultL1Name: { $ifNull: ['$defaultL1Details.employeName', null] },
                    defaultL2Name: { $ifNull: ['$defaultL2Details.employeName', null] },
                    defaultL3Name: { $ifNull: ['$defaultL3Details.employeName', null] },
                    createdByName: { $ifNull: ['$createdByDetails.employeName', null] },
                    managementEmployeeName: { $ifNull: ['$managementEmployeeDetails.employeName', null] },
                    // Preserve viewer details as an array of employee names
                    viewerDetails: { $map: { input: '$viewerDetails', as: 'viewer', in: '$$viewer.employeName' } },
                },
            },
        ]);
        if (formConfigs.length === 0) {
            return returnFormatter(false, "No active FormConfigs found");
        }
        return returnFormatter(true, "Active FormConfigs found", formConfigs);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

module.exports = {
    addFormConfig,
    getFormConfigById,
    getAllActiveFormConfigs,
    updateFormConfig,
    deactivateFormConfig,
    getAllActiveFormConfigsOfCreator,
    getFormConfigByName
};
