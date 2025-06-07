// helpers/expenseType.helper.js
import mongoose from "mongoose";
import expenseTypeModel from "../../models/expense/expenesType.model.js";
import expenseRoleAssignmentModel from "../../models/expense/expenseRole.model.js";
import { expenseTypeFormatter } from "../../formatters/expense/expenseType.formatter.js";
import { returnFormatter } from "../../formatters/common.formatter.js";

export async function addExpenseType(requestObject) {
  try {
    const formattedData = expenseTypeFormatter(requestObject);
 const {organizationId} = requestObject.employee
    // if (
    //   !formattedData.categoriesIds ||
    //   formattedData.categoriesIds.length === 0
    // ) {
    //   return returnFormatter(false, "Select The Categories");
    // }

    // if (!formattedData.defaultCategoryId) {
    //     return returnFormatter(false, "Select a default category");
    // }

    // if (
    //     formattedData.defaultCategoryId &&
    //     !formattedData.categoriesIds.includes(formattedData.defaultCategoryId.toString())
    // ) {
    //     return returnFormatter(false, "Default Category Invalid");
    // }

    const expenseData = await expenseTypeModel.findOne({
      name: formattedData.name,organizationId
    });

    if (expenseData) {
      return returnFormatter(false, "Expense name is already exist");
    }

    const newExpenseType = await expenseTypeModel.create({
      ...formattedData,
      createdBy: requestObject.employee ? requestObject.employee.id : null,
    });

    return returnFormatter(
      true,
      "Expense Type created successfully",
      newExpenseType
    );
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

export async function getAllExpenseTypes(requestObject) {
  try {
    const { organizationId } = requestObject.employee;
    // // Get all expense types with populated fields
    // const expenseRoleData = await expenseRoleAssignmentModel.find({organizationId})
    // console.log(expenseRoleData,"expenseRoleData")
    // const expenseTypes = await expenseTypeModel.find({organizationId})
    //     .populate('name')
    //     .populate('categoriesIds', 'name description')
    //     // .populate('defaultCategoryId', 'name description')
    //     .populate('createdBy', 'employeName userName')
    //     .populate('organizationId', 'name')
    //     .sort({ createdAt: -1 });
    // const expenseTypes = await expenseTypeModel.aggregate([
    //   {
    //     $match: { organizationId: new mongoose.Types.ObjectId(organizationId) },
    //   },
    //   {
    //     $lookup: {
    //       from: "expenseroleassignments",
    //       let: { expenseTypeId: "$_id" },
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: {
    //               $and: [
    //                 { $isArray: "$expenseType" },
    //                 { $in: ["$$expenseTypeId", "$expenseType"] },
    //               ],
    //             },
    //           },
    //         },
    //         {
    //           $project: {
    //             fromWhere: 1,
    //             remitter: 1,
    //             approver: 1,
    //           },
    //         },
    //       ],
    //       as: "roleData",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$roleData",
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   {
    //     $addFields: {
    //       fromWhere: "$roleData.fromWhere",
    //       remitter: "$roleData.remitter",
    //       approver: "$roleData.approver",
    //     },
    //   },
    //   {
    //     $project: {
    //       roleData: 0,
    //     },
    //   },
    //   {
    //     $sort: { createdAt: -1 },
    //   },
    // ]);
    const expenseTypes = await expenseTypeModel.aggregate([
      {
        $match: { organizationId: new mongoose.Types.ObjectId(organizationId) },
      },
      {
        $lookup: {
          from: "expenseroleassignments",
          let: { expenseTypeId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $isArray: "$expenseType" },
                    { $in: ["$$expenseTypeId", "$expenseType"] },
                  ],
                },
              },
            },
            {
              $project: {
                fromWhere: 1,
                // Use $ifNull to ensure output exists
                roleApproverL1: { $ifNull: ["$roleApprover.L1", null] },
                roleApproverL2: { $ifNull: ["$roleApprover.L2", null] },
                roleApproverL3: { $ifNull: ["$roleApprover.L3", null] },
                roleRemitterR1: { $ifNull: ["$roleRemitter.R1", null] },
                roleRemitterR2: { $ifNull: ["$roleRemitter.R2", null] },
                roleRemitterR3: { $ifNull: ["$roleRemitter.R3", null] },
              },
            },
          ],
          as: "roleData",
        },
      },
      {
        $unwind: {
          path: "$roleData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          fromWhere: "$roleData.fromWhere",
          approverLevels: {
            $cond: [
              { $gt: [{ $type: "$roleData" }, "missing"] }, // only if roleData exists
              {
                $setUnion: [
                  [],
                  {
                    $cond: [
                      { $ne: ["$roleData.roleApproverL1", null] },
                      ["L1"],
                      [],
                    ],
                  },
                  {
                    $cond: [
                      { $ne: ["$roleData.roleApproverL2", null] },
                      ["L2"],
                      [],
                    ],
                  },
                  {
                    $cond: [
                      { $ne: ["$roleData.roleApproverL3", null] },
                      ["L3"],
                      [],
                    ],
                  },
                ],
              },
              [], // if roleData doesn't exist, return empty
            ],
          },
          remitterLevels: {
            $cond: [
              { $gt: [{ $type: "$roleData" }, "missing"] },
              {
                $setUnion: [
                  [],
                  {
                    $cond: [
                      { $ne: ["$roleData.roleRemitterR1", null] },
                      ["R1"],
                      [],
                    ],
                  },
                  {
                    $cond: [
                      { $ne: ["$roleData.roleRemitterR2", null] },
                      ["R2"],
                      [],
                    ],
                  },
                  {
                    $cond: [
                      { $ne: ["$roleData.roleRemitterR3", null] },
                      ["R3"],
                      [],
                    ],
                  },
                ],
              },
              [],
            ],
          },
        },
      },
      {
        $project: {
          roleData: 0,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    return returnFormatter(
      true,
      "Expense types fetched successfully",
      expenseTypes
    );
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

export async function getExpenseTypeNameList(requestObject) {
  try {
    const { organizationId } = requestObject.employee;
    if (!organizationId) {
      return returnFormatter(false, "organizationId required");
    }
    const expenseTypes = await expenseTypeModel
      .find({ organizationId })
      .select("name")
      .sort({ createdAt: -1 });
    return returnFormatter(
      true,
      "Expense types fetched successfully",
      expenseTypes
    );
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

export async function getExpenseTypeById(requestObject) {
  try {
    const { id } = requestObject.query;

    // Find expense type by ID with populated fields
    const expenseType = await expenseTypeModel
      .findById(id)
      .populate("name")
      .populate("categoriesIds", "name description")
      // .populate('defaultCategoryId', 'name description')
      .populate("createdBy", "fullName userName");

    if (!expenseType) {
      return returnFormatter(false, "Expense type not found");
    }

    return returnFormatter(
      true,
      "Expense type fetched successfully",
      expenseType
    );
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

export async function updateExpenseType(requestObject) {
  try {
    const { id } = requestObject.body;
    if (!id) {
      return returnFormatter(false, "Expense Type ID is required");
    }

    const formattedData = expenseTypeFormatter(requestObject);

    if (
      !formattedData.categoriesIds ||
      formattedData.categoriesIds.length === 0
    ) {
      return returnFormatter(false, "Select The Categories");
    }

    // if (!formattedData.defaultCategoryId) {
    //     return returnFormatter(false, "Select a default category");
    // }

    // if (
    //     formattedData.defaultCategoryId &&
    //     !formattedData.categoriesIds.includes(formattedData.defaultCategoryId.toString())
    // ) {
    //     return returnFormatter(false, "Default Category Invalid");
    // }

    const updatedExpenseType = await expenseTypeModel.findByIdAndUpdate(
      id,
      {
        ...formattedData,
        updatedBy: requestObject.user ? requestObject.user.id : null,
      },
      { new: true }
    );

    if (!updatedExpenseType) {
      return returnFormatter(false, "Expense Type not found");
    }

    return returnFormatter(
      true,
      "Expense Type updated successfully",
      updatedExpenseType
    );
  } catch (error) {
    console.log("updateExpenseType error", error);
    return returnFormatter(false, error.message);
  }
}

//updateExpenseStatus
export async function updateExpenseStatus(requestObject) {
  try {
    const { id, isActive } = requestObject.body;
    console.log(requestObject.body, "requestObject");
    if (!id) {
      return returnFormatter(false, "Expense Type ID is required");
    }

    const updatedExpenseType = await expenseTypeModel.findByIdAndUpdate(
      id,
      {
        isActive,
        updatedBy: requestObject.employee ? requestObject.employee.id : null,
      },
      { new: true }
    );

    if (!updatedExpenseType) {
      return returnFormatter(false, "Expense Type not found");
    }

    return returnFormatter(
      true,
      "Expense Type status updated successfully",
      updatedExpenseType
    );
  } catch (error) {
    console.log("updateExpenseType error", error);
    return returnFormatter(false, error.message);
  }
}

export async function deleteExpenseType(requestObject) {
  try {
    const { id } = requestObject.body;

    if (!id) {
      return returnFormatter(false, "Expense ID is Required");
    }

    const existingExpense = await expenseTypeModel.findById(id);
    if (!existingExpense) {
      return returnFormatter(false, "Expense Not Found");
    }
    // Find and delete expense type
    const deletedExpenseType = await expenseTypeModel.findByIdAndDelete(id);

    if (!deletedExpenseType) {
      return returnFormatter(false, "Expense type not found");
    }

    return returnFormatter(true, "Expense type deleted successfully");
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}
