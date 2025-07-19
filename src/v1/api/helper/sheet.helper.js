const sheetModel = require('../model/sheet.model.js');
const sheetCategoryModel = require('../model/sheetCategory.model.js');
const { sheetFormatter, sheetUpdateFormatter } = require('../formatter/sheet.formatter.js');
const { sheetCategoryUpdateFormatter, sheetCategoryFormatter } = require('../formatter/sheetCategory.formatter.js');
const { returnFormatter } = require('../formatter/common.formatter.js');

// ------------------------------------sheet Category------------------------------------ //

async function addSheetCategory(sheetCategoryData) {
    try {
        const sheetFormatterData = sheetCategoryFormatter(sheetCategoryData);
        await sheetCategoryModel.create(sheetFormatterData);
        return returnFormatter(true, "sheet Category added");
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

async function allSheetCategory() {
    try {

        const sheetCategory = await sheetCategoryModel.aggregate([
            {
                $match: {
                    isActive: true
                }
            },
            {
                $lookup: {
                    from: "sheets",
                    localField: "sheetCategoryId",
                    foreignField: "sheetCategoryId",
                    as: "sheetList",
                    pipeline: [
                        {
                            $project: {
                                "_id": 0,
                                "isActive": 0,
                                "__v": 0
                            }
                        }]
                }
            },
            {
                $project: {
                    "_id": 0,
                    "isActive": 0,
                    "__v": 0
                }
            }
        ]);

        return returnFormatter(true, "sheet Category list", sheetCategory);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

async function allUserSheetSheetCategory(creator) {
    try {

        const sheetCategory = await sheetCategoryModel.aggregate([
            {
                $match: {
                    creator,
                    isActive: true
                }
            },
            {
                $lookup: {
                    from: "sheets",
                    localField: "sheetCategoryId",
                    foreignField: "sheetCategoryId",
                    as: "sheetList",
                    pipeline: [
                        {
                            $project: {
                                "_id": 0,
                                "isActive": 0,
                                "__v": 0
                            }
                        }]
                }
            },
            {
                $project: {
                    "_id": 0,
                    "isActive": 0,
                    "__v": 0
                }
            }
        ]);

        return returnFormatter(true, "sheet Category list", sheetCategory);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

async function sheetCategoryById(sheetCategoryId) {
    try {
        const sheetCategory = await sheetCategoryModel.findOne({ sheetCategoryId }).select("-_id -isActive -__v");
        return sheetCategory ? returnFormatter(true, "sheet Category data", sheetCategory) : returnFormatter(false, "sheet Category not found");
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

async function updateSheetCategory(sheetCategoryId, updateData) {
    try {
        const formattedData = sheetCategoryUpdateFormatter(updateData);
        await sheetCategoryModel.findOneAndUpdate({ sheetCategoryId }, formattedData);
        return returnFormatter(true, "sheet Category updated");
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

async function deleteSheetCategory(sheetCategoryId) {
    try {
        await sheetCategoryModel.findOneAndDelete({ sheetCategoryId });
        await sheetModel.deleteMany({ sheetCategoryId });
        return returnFormatter(true, "sheet Category deleted");
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// -----------------------------------------sheet----------------------------------------- //

async function addSheet(sheetData) {
    try {
        const formattedData = sheetFormatter(sheetData);
        await sheetModel.create(formattedData);
        return returnFormatter(true, "sheet added");
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

async function allSheet() {
    try {
        const sheet = await sheetModel.find({ isActive: true }).select("-_id -isActive -__v");
        return returnFormatter(true, "sheet list", sheet);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

async function allAssignedSheet(id) {
    try {
        const sheet = await sheetModel.aggregate([{
            $match: {
                assignedEmployees: id,
                isActive: true
            }
        },
        {
            $group: {
                _id: "$sheetCategoryId",
                sheetList: {
                    $push:
                    {
                        "sheetId": "$$ROOT.sheetId",
                        "sheetCategoryId": "$$ROOT.sheetCategoryId",
                        "sheetName": "$$ROOT.sheetName",
                        "sheetDescription": "$$ROOT.sheetDescription",
                        "sheetLink": "$$ROOT.sheetLink",
                        "assignedEmployees": "$$ROOT.assignedEmployees",
                        "schemaVersion": "$$ROOT.schemaVersion",
                    }
                }
            }
        },
        {
            $lookup: {
                from: "sheetcategories",
                localField: "_id",
                foreignField: "sheetCategoryId",
                as: "sheetCategory",
                pipeline: [
                    {
                        $project: {
                            "_id": 0,
                            "isActive": 0,
                            "__v": 0
                        }
                    }]
            }
        },
        {
            $project: {
                _id: 0, // Optionally exclude the _id field from the result
                sheetCategoryId: "$_id",
                sheetCategoryName: { $arrayElemAt: ["$sheetCategory.sheetCategoryName", 0] },
                custom: { $arrayElemAt: ["$sheetCategory.custom", 0] },
                creator: { $arrayElemAt: ["$sheetCategory.creator", 0] },
                schemaVersion: { $arrayElemAt: ["$sheetCategory.schemaVersion", 0] },
                sheetList: 1 // Include the sheetList array
            }
        }

        ])
        return returnFormatter(true, "sheet list", sheet);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

async function sheetById(sheetId) {
    try {
        const sheet = await sheetModel.findOne({ sheetId }).select("-_id -isActive -__v");
        return returnFormatter(true, "sheet data", sheet);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

async function updateSheet(sheetId, updateData) {
    try {
        const formattedData = sheetUpdateFormatter(updateData);
        await sheetModel.findOneAndUpdate({ sheetId }, formattedData);
        return returnFormatter(true, "sheet updated");
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

async function deleteSheet(sheetId) {
    try {
        await sheetModel.findOneAndDelete({ sheetId });
        return returnFormatter(true, "sheet deleted");
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

module.exports = {
    addSheetCategory,
    allSheetCategory,
    sheetCategoryById,
    updateSheetCategory,
    deleteSheetCategory,
    addSheet,
    allSheet,
    sheetById,
    updateSheet,
    deleteSheet,
    allUserSheetSheetCategory,
    allAssignedSheet
};
