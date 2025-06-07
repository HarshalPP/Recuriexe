import { returnFormatter } from "../../formatters/common.formatter.js";
import {
  expenseFormatter,
  expenseUpdateFormatter,
} from "../../formatters/expense/expense.formatter.js";
import expensePreferencessModel from "../../models/expense/expense.model.js";
import expenseRoleAssignmentModel from "../../models/expense/expenseRole.model.js";
import employeModel from "../../models/employeemodel/employee.model.js";
import mongoose from "mongoose";

//----------------------------   add Role ------------------------------

export async function saveExpenses(requestsObject) {
  try {
    const { id, organizationId } = requestsObject.employee;
    const formattedData = expenseFormatter(requestsObject);

    const selectedEmployeeFields =
      "employeUniqueId employeName email _id branchId departmentId";

    const employeeData = await employeModel
      .findOne({ _id: id })
      .populate("departmentId");

    const roleAssignments = await expenseRoleAssignmentModel
      .find({ organizationId })
      .populate({
        path: "roleSubmitter.departmentId",
        select: "name",
      })
      .populate({
        path: "roleSubmitter.employeeId",
        select: selectedEmployeeFields,
      });

    let isSubmitter = false;
    let departmentMismatch = false;
    let expenseMismatch = false;

    for (const assignment of roleAssignments) {
      const employeeIds =
        assignment.roleSubmitter?.employeeId?.map((e) => e._id?.toString()) ||
        [];
      const departmentIds =
        assignment.departmentId?.map((d) => d._id?.toString()) || [];
      const allowedExpenseTypes =
        assignment.expenseType?.map((e) => e.toString()) || [];

      const isEmployeeInSubmitter = employeeIds.includes(id.toString());

      if (!isEmployeeInSubmitter) continue;

      isSubmitter = true; // Found matching submitter employee

      // if (assignment.fromWhere === "Department") {
      //   const empDeptId = employeeData.departmentId?._id?.toString();
      //   if (!departmentIds.includes(empDeptId)) {
      //     departmentMismatch = true;
      //     continue;
      //   }
      // }

      // if (assignment.fromWhere === "ExpenseType") {
      //   const allowedExpenseTypes =
      //     assignment.expenseType?.map((e) => e.toString()) || [];

      //   // Extract expenseType values from formattedData array
      //   const expenseTypesInRequest = Array.isArray(formattedData)
      //     ? formattedData.map((item) => item.expenseType?.toString())
      //     : [formattedData.expenseType?.toString()];

      //   // Check if any of the expense types in request match allowed types
      //   const isAnyExpenseTypeAllowed = expenseTypesInRequest.some((type) =>
      //     allowedExpenseTypes.includes(type)
      //   );

      //   if (!isAnyExpenseTypeAllowed) {
      //     expenseMismatch = true;
      //     continue;
      //   }
      // }

      // All checks passed
      const expenseData = await expensePreferencessModel.insertMany(
        formattedData
      );
      return returnFormatter(true, "Expense created successfully", expenseData);
    }

    // // Handle detailed error messages
    // if (!isSubmitter) {
    //   return returnFormatter(
    //     false,
    //     "You are not authorized: submitter role not assigned."
    //   );
    // }

    // if (departmentMismatch) {
    //   return returnFormatter(
    //     false,
    //     "You are not authorized: department mismatch."
    //   );
    // }

    // if (expenseMismatch) {
    //   return returnFormatter(
    //     false,
    //     "You are not authorized: expense type mismatch."
    //   );
    // }

    return returnFormatter(
      false,
      "You are not authorized to submit this expense."
    );
  } catch (error) {
    console.error("Error in saveExpenses:", error);
    return returnFormatter(false, error.message);
  }
}

// // --------------------- update Field -----------------------

export async function updateExpenses(expensesId, updateData) {
  try {
    const formattedData = expenseUpdateFormatter(updateData);
    // console.log(formattedData,"formattedDataformattedData")
    const updatedfieldData = await expensePreferencessModel
      .findByIdAndUpdate(expensesId, formattedData, { new: true })
      .populate("expenseType", "name");
    return returnFormatter(
      true,
      "expense updated succesfully",
      updatedfieldData
    );
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// // // --------------------- get Field -----------------------

export async function getExpenseByIds(expenseId) {
  try {
    const FieldData = await expensePreferencessModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(expenseId),
        },
      },
      {
        $lookup: {
          from: "expenseroleassignments",
          let: { expenseTypeId: "$expenseType" },
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
                remitter: 1,
                approver: 1,
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
          remitter: "$roleData.remitter",
          approver: "$roleData.approver",
          approverLevel: {
            $cond: {
              if: { $isArray: "$roleData.approver" },
              then: {
                $arrayToObject: {
                  $map: {
                    input: "$roleData.approver",
                    as: "lvl",
                    in: {
                      k: { $toString: "$$lvl" },
                      v: { status: "pending" },
                    },
                  },
                },
              },
              else: {},
            },
          },
          remitterLevel: {
            $cond: {
              if: { $isArray: "$roleData.remitter" },
              then: {
                $arrayToObject: {
                  $map: {
                    input: "$roleData.remitter",
                    as: "lvl",
                    in: {
                      k: { $toString: "$$lvl" },
                      v: { status: "pending" },
                    },
                  },
                },
              },
              else: {},
            },
          },
        },
      },
      {
        $addFields: {
          expenseType: { $toObjectId: "$expenseType" },
        },
      },
      {
        $lookup: {
          from: "expenestypes",
          localField: "expenseType",
          foreignField: "_id",
          as: "expenseTypeData",
        },
      },
      {
        $unwind: {
          path: "$expenseTypeData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          approverLevel: 1,
          remitterLevel: 1,
          fromWhere: 1,
          approver: 1,
          remitter: 1,
          expenseType: 1,
          "expenseTypeData.name": 1,
        },
      },
      {
        $group: {
          _id: "$_id",
          doc: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$doc" },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
    return returnFormatter(true, "expense data", FieldData);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// // // --------------------- get all Field -----------------------

export async function getAllExpenses(req) {
  try {
    const { organizationId } = req.employee;

    //     const FieldData = await expensePreferencessModel.aggregate([
    //       {
    //         $match: {
    //           organizationId: new mongoose.Types.ObjectId(organizationId),
    //         },
    //       },
    //      {
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
    //             // Use $ifNull to ensure output exists
    //             roleApproverL1: { $ifNull: ["$roleApprover.L1", null] },
    //             roleApproverL2: { $ifNull: ["$roleApprover.L2", null] },
    //             roleApproverL3: { $ifNull: ["$roleApprover.L3", null] },
    //             roleRemitterR1: { $ifNull: ["$roleRemitter.R1", null] },
    //             roleRemitterR2: { $ifNull: ["$roleRemitter.R2", null] },
    //             roleRemitterR3: { $ifNull: ["$roleRemitter.R3", null] },
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
    //       approverLevels: {
    //         L1: "$roleData.roleApproverL1",
    //         L2: "$roleData.roleApproverL2",
    //         L3: "$roleData.roleApproverL3",
    //       },
    //       remitterLevels: {
    //         R1: "$roleData.roleRemitterR1",
    //         R2: "$roleData.roleRemitterR2",
    //         R3: "$roleData.roleRemitterR3",
    //       },
    //     },
    //   },
    //       {
    //         $lookup: {
    //           from: "expenestypes",
    //           localField: "expenseType",
    //           foreignField: "_id",
    //           as: "expenseTypeData",
    //         },
    //       },
    //       {
    //         $unwind: {
    //           path: "$expenseTypeData",
    //           preserveNullAndEmptyArrays: true,
    //         },
    //       },
    //       {
    //         $project: {
    //           approverLevels: 1,
    //           remitterLevels: 1,
    //           fromWhere: 1,
    //           "expenseTypeData.name": 1,
    //         },
    //       },
    //       {
    //         $group: {
    //           _id: "$_id",
    //           doc: { $first: "$$ROOT" },
    //         },
    //       },
    //       {
    //         $replaceRoot: { newRoot: "$doc" },
    //       },
    //       {
    //         $sort: { createdAt: -1 },
    //       },
    //     ]);

    // const FieldData = await expensePreferencessModel.aggregate([
    //   {
    //     $match: {
    //       organizationId: new mongoose.Types.ObjectId(organizationId),
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "expenseroleassignments",
    //       let: { expenseTypeId: "$expenseType" },
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
    //             roleApproverL1: {
    //               employeeId: "$roleApprover.L1.employeeId",
    //               departmentId: "$roleApprover.L1.departmentId",
    //               level: "$roleApprover.L1.level",
    //             },
    //             roleApproverL2: {
    //               employeeId: "$roleApprover.L2.employeeId",
    //               departmentId: "$roleApprover.L2.departmentId",
    //               level: "$roleApprover.L2.level",
    //             },
    //             roleApproverL3: {
    //               employeeId: "$roleApprover.L3.employeeId",
    //               departmentId: "$roleApprover.L3.departmentId",
    //               level: "$roleApprover.L3.level",
    //             },
    //             roleRemitterR1: {
    //               employeeId: "$roleRemitter.R1.employeeId",
    //               departmentId: "$roleRemitter.R1.departmentId",
    //               level: "$roleRemitter.R1.level",
    //             },
    //             roleRemitterR2: {
    //               employeeId: "$roleRemitter.R2.employeeId",
    //               departmentId: "$roleRemitter.R2.departmentId",
    //               level: "$roleRemitter.R2.level",
    //             },
    //             roleRemitterR3: {
    //               employeeId: "$roleRemitter.R3.employeeId",
    //               departmentId: "$roleRemitter.R3.departmentId",
    //               level: "$roleRemitter.R3.level",
    //             },
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
    //       approverLevels: {
    //         L1: "$roleData.roleApproverL1",
    //         L2: "$roleData.roleApproverL2",
    //         L3: "$roleData.roleApproverL3",
    //       },
    //       remitterLevels: {
    //         R1: "$roleData.roleRemitterR1",
    //         R2: "$roleData.roleRemitterR2",
    //         R3: "$roleData.roleRemitterR3",
    //       },
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "expenestypes", // Double-check spelling of this collection
    //       localField: "expenseType",
    //       foreignField: "_id",
    //       as: "expenseTypeData",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$expenseTypeData",
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   {
    //     $project: {
    //       approverLevels: 1,
    //       remitterLevels: 1,
    //       fromWhere: 1,
    //       "expenseTypeData.name": 1,
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$_id",
    //       doc: { $first: "$$ROOT" },
    //     },
    //   },
    //   {
    //     $replaceRoot: { newRoot: "$doc" },
    //   },
    //   {
    //     $sort: { createdAt: -1 },
    //   },
    // ]);

    const FieldData = await expensePreferencessModel.aggregate([
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(organizationId),
        },
      },
      {
        $lookup: {
          from: "expenseroleassignments",
          let: { expenseTypeId: "$expenseType", orgId: "$organizationId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $or: [
                        {
                          $and: [
                            { $eq: ["$fromWhere", "ExpenseType"] },
                            { $isArray: "$expenseType" },
                            { $in: ["$$expenseTypeId", "$expenseType"] },
                          ],
                        },
                        {
                          $and: [
                            { $ne: ["$fromWhere", "ExpenseType"] },
                            { $eq: ["$organizationId", "$$orgId"] },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            },
            {
              $project: {
                fromWhere: 1,
                roleApprover: 1,
                roleRemitter: 1,
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
          approverLevels: "$roleData.roleApprover",
          remitterLevels: "$roleData.roleRemitter",
          allEmployeeIds: {
            $setUnion: [
              ["$roleData.roleApprover.L1.employeeId"],
              ["$roleData.roleApprover.L2.employeeId"],
              ["$roleData.roleApprover.L3.employeeId"],
              ["$roleData.roleRemitter.R1.employeeId"],
              ["$roleData.roleRemitter.R2.employeeId"],
              ["$roleData.roleRemitter.R3.employeeId"],
            ],
          },
        },
      },
      {
        $addFields: {
          allEmployeeIds: {
            $filter: {
              input: "$allEmployeeIds",
              as: "empId",
              cond: { $ne: ["$$empId", null] },
            },
          },
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "allEmployeeIds",
          foreignField: "_id",
          as: "employeeDetails",
        },
      },
      {
        $addFields: {
          "approverLevels.L1.employee": {
            $getField: {
              field: "employeName",
              input: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$employeeDetails",
                      as: "emp",
                      cond: {
                        $eq: [
                          "$$emp._id",
                          { $toObjectId: "$approverLevels.L1.employeeId" },
                        ],
                      },
                    },
                  },
                  0,
                ],
              },
            },
          },
          "approverLevels.L2.employee": {
            $getField: {
              field: "employeName",
              input: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$employeeDetails",
                      as: "emp",
                      cond: {
                        $eq: [
                          "$$emp._id",
                          { $toObjectId: "$approverLevels.L2.employeeId" },
                        ],
                      },
                    },
                  },
                  0,
                ],
              },
            },
          },
          "approverLevels.L3.employee": {
            $getField: {
              field: "employeName",
              input: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$employeeDetails",
                      as: "emp",
                      cond: {
                        $eq: [
                          "$$emp._id",
                          { $toObjectId: "$approverLevels.L3.employeeId" },
                        ],
                      },
                    },
                  },
                  0,
                ],
              },
            },
          },
          "remitterLevels.R1.employee": {
            $getField: {
              field: "employeName",
              input: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$employeeDetails",
                      as: "emp",
                      cond: {
                        $eq: [
                          "$$emp._id",
                          { $toObjectId: "$remitterLevels.R1.employeeId" },
                        ],
                      },
                    },
                  },
                  0,
                ],
              },
            },
          },
          "remitterLevels.R2.employee": {
            $getField: {
              field: "employeName",
              input: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$employeeDetails",
                      as: "emp",
                      cond: {
                        $eq: [
                          "$$emp._id",
                          { $toObjectId: "$remitterLevels.R2.employeeId" },
                        ],
                      },
                    },
                  },
                  0,
                ],
              },
            },
          },
          "remitterLevels.R3.employee": {
            $getField: {
              field: "employeName",
              input: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$employeeDetails",
                      as: "emp",
                      cond: {
                        $eq: [
                          "$$emp._id",
                          { $toObjectId: "$remitterLevels.R3.employeeId" },
                        ],
                      },
                    },
                  },
                  0,
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          approverLevel: {
            $mergeObjects: [
              {},
              {
                $cond: [
                  { $ne: ["$approverLevels.L1", {}] },
                  { L1: { status: "$approverLevel.L1.status" } },
                  {},
                ],
              },
              {
                $cond: [
                  { $ne: ["$approverLevels.L2", {}] },
                  { L2: { status: "$approverLevel.L2.status" } },
                  {},
                ],
              },
              {
                $cond: [
                  { $ne: ["$approverLevels.L3", {}] },
                  { L3: { status: "$approverLevel.L3.status" } },
                  {},
                ],
              },
            ],
          },
          remitterLevel: {
            $mergeObjects: [
              {},
              {
                $cond: [
                  { $ne: ["$remitterLevels.R1", {}] },
                  { R1: { status: "$remitterLevel.R1.status" } },
                  {},
                ],
              },
              {
                $cond: [
                  { $ne: ["$remitterLevels.R2", {}] },
                  { R2: { status: "$remitterLevel.R2.status" } },
                  {},
                ],
              },
              {
                $cond: [
                  { $ne: ["$remitterLevels.R3", {}] },
                  { R3: { status: "$remitterLevel.R3.status" } },
                  {},
                ],
              },
            ],
          },
        },
      },
      {
        $lookup: {
          from: "expenestypes",
          localField: "expenseType",
          foreignField: "_id",
          as: "expenseTypeData",
        },
      },
      {
        $unwind: {
          path: "$expenseTypeData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "expenseTypeData.categoriesIds",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      {
        $unwind: {
          path: "$categoryData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          approverLevels: 1,
          remitterLevels: 1,
          price: 1,
          expenseBillname: 1,
          image: 1,
          approverLevel: 1,
          remitterLevel: 1,
          "expenseTypeData.name": 1,
          "expenseTypeData._id": 1,
          "categoryData.name": 1,
          "categoryData._id": 1,
           createdAt: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    const expenseStatusCounts = await expensePreferencessModel.aggregate([
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(organizationId),
        },
      },
      {
        $lookup: {
          from: "expenseroleassignments",
          let: { expenseTypeId: "$expenseType", orgId: "$organizationId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $or: [
                        {
                          $and: [
                            { $eq: ["$fromWhere", "ExpenseType"] },
                            { $isArray: "$expenseType" },
                            { $in: ["$$expenseTypeId", "$expenseType"] },
                          ],
                        },
                        {
                          $and: [
                            { $ne: ["$fromWhere", "ExpenseType"] },
                            { $eq: ["$organizationId", "$$orgId"] },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            },
            {
              $project: {
                fromWhere: 1,
                roleApprover: 1,
                roleRemitter: 1,
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
          approverLevels: "$roleData.roleApprover",
          remitterLevels: "$roleData.roleRemitter",
          allEmployeeIds: {
            $setUnion: [
              ["$roleData.roleApprover.L1.employeeId"],
              ["$roleData.roleApprover.L2.employeeId"],
              ["$roleData.roleApprover.L3.employeeId"],
              ["$roleData.roleRemitter.R1.employeeId"],
              ["$roleData.roleRemitter.R2.employeeId"],
              ["$roleData.roleRemitter.R3.employeeId"],
            ],
          },
        },
      },
      {
        $addFields: {
          approverLevel: {
            $mergeObjects: [
              {},
              {
                $cond: [
                  { $ne: ["$approverLevels.L1", {}] },
                  { L1: { status: "pending" } },
                  {},
                ],
              },
              {
                $cond: [
                  { $ne: ["$approverLevels.L2", {}] },
                  { L2: { status: "pending" } },
                  {},
                ],
              },
              {
                $cond: [
                  { $ne: ["$approverLevels.L3", {}] },
                  { L3: { status: "pending" } },
                  {},
                ],
              },
            ],
          },
          remitterLevel: {
            $mergeObjects: [
              {},
              {
                $cond: [
                  { $ne: ["$remitterLevels.R1", {}] },
                  { R1: { status: "pending" } },
                  {},
                ],
              },
              {
                $cond: [
                  { $ne: ["$remitterLevels.R2", {}] },
                  { R2: { status: "pending" } },
                  {},
                ],
              },
              {
                $cond: [
                  { $ne: ["$remitterLevels.R3", {}] },
                  { R3: { status: "pending" } },
                  {},
                ],
              },
            ],
          },
        },
      },
      {
        $addFields: {
          status: {
            $cond: [
              {
                $or: [
                  { $ne: ["$approverLevel.L1.status", "pending"] },
                  { $ne: ["$approverLevel.L2.status", "pending"] },
                  { $ne: ["$approverLevel.L3.status", "pending"] },
                  { $ne: ["$remitterLevel.R1.status", "pending"] },
                  { $ne: ["$remitterLevel.R2.status", "pending"] },
                  { $ne: ["$remitterLevel.R3.status", "pending"] },
                ],
              },
              "approve", // Example logic; adjust as needed
              "pending",
            ],
          },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          counts: {
            $push: { k: "$_id", v: "$count" },
          },
          totalExpense: { $sum: "$count" },
        },
      },
      {
        $replaceWith: {
          $mergeObjects: [
            {
              totalExpense: "$totalExpense",
            },
            {
              $arrayToObject: "$counts",
            },
          ],
        },
      },
      {
        $addFields: {
          approved: { $ifNull: ["$approve", 0] },
          pending: { $ifNull: ["$pending", 0] },
          rejected: { $ifNull: ["$rejected", 0] },
        },
      },
    ]);

    return returnFormatter(true, "Field data", {
      expenseStatusCounts: expenseStatusCounts,
      FieldData: FieldData,
    });
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

//---------------------get all expenses by id getAllExpenseById ----------------------

export async function getAllExpensesById(req) {
  try {
    const { organizationId, id } = req.employee;
    const FieldData = await expensePreferencessModel.aggregate([
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(organizationId),
          createdBy: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "expenseroleassignments",
          let: { expenseTypeId: "$expenseType", orgId: "$organizationId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $or: [
                        {
                          $and: [
                            { $eq: ["$fromWhere", "ExpenseType"] },
                            { $isArray: "$expenseType" },
                            { $in: ["$$expenseTypeId", "$expenseType"] },
                          ],
                        },
                        {
                          $and: [
                            { $ne: ["$fromWhere", "ExpenseType"] },
                            { $eq: ["$organizationId", "$$orgId"] },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            },
            {
              $project: {
                fromWhere: 1,
                roleApprover: 1,
                roleRemitter: 1,
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
          approverLevels: "$roleData.roleApprover",
          remitterLevels: "$roleData.roleRemitter",
          allEmployeeIds: {
            $setUnion: [
              ["$roleData.roleApprover.L1.employeeId"],
              ["$roleData.roleApprover.L2.employeeId"],
              ["$roleData.roleApprover.L3.employeeId"],
              ["$roleData.roleRemitter.R1.employeeId"],
              ["$roleData.roleRemitter.R2.employeeId"],
              ["$roleData.roleRemitter.R3.employeeId"],
            ],
          },
        },
      },
      {
        $addFields: {
          allEmployeeIds: {
            $filter: {
              input: "$allEmployeeIds",
              as: "empId",
              cond: { $ne: ["$$empId", null] },
            },
          },
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "allEmployeeIds",
          foreignField: "_id",
          as: "employeeDetails",
        },
      },
      {
        $addFields: {
          "approverLevels.L1.employee": {
            $getField: {
              field: "employeName",
              input: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$employeeDetails",
                      as: "emp",
                      cond: {
                        $eq: [
                          "$$emp._id",
                          { $toObjectId: "$approverLevels.L1.employeeId" },
                        ],
                      },
                    },
                  },
                  0,
                ],
              },
            },
          },
          "approverLevels.L2.employee": {
            $getField: {
              field: "employeName",
              input: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$employeeDetails",
                      as: "emp",
                      cond: {
                        $eq: [
                          "$$emp._id",
                          { $toObjectId: "$approverLevels.L2.employeeId" },
                        ],
                      },
                    },
                  },
                  0,
                ],
              },
            },
          },
          "approverLevels.L3.employee": {
            $getField: {
              field: "employeName",
              input: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$employeeDetails",
                      as: "emp",
                      cond: {
                        $eq: [
                          "$$emp._id",
                          { $toObjectId: "$approverLevels.L3.employeeId" },
                        ],
                      },
                    },
                  },
                  0,
                ],
              },
            },
          },
          "remitterLevels.R1.employee": {
            $getField: {
              field: "employeName",
              input: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$employeeDetails",
                      as: "emp",
                      cond: {
                        $eq: [
                          "$$emp._id",
                          { $toObjectId: "$remitterLevels.R1.employeeId" },
                        ],
                      },
                    },
                  },
                  0,
                ],
              },
            },
          },
          "remitterLevels.R2.employee": {
            $getField: {
              field: "employeName",
              input: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$employeeDetails",
                      as: "emp",
                      cond: {
                        $eq: [
                          "$$emp._id",
                          { $toObjectId: "$remitterLevels.R2.employeeId" },
                        ],
                      },
                    },
                  },
                  0,
                ],
              },
            },
          },
          "remitterLevels.R3.employee": {
            $getField: {
              field: "employeName",
              input: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$employeeDetails",
                      as: "emp",
                      cond: {
                        $eq: [
                          "$$emp._id",
                          { $toObjectId: "$remitterLevels.R3.employeeId" },
                        ],
                      },
                    },
                  },
                  0,
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          approverLevel: {
            $mergeObjects: [
              {},
              {
                $cond: [
                  { $ne: ["$approverLevels.L1", {}] },
                  { L1: { status: "$approverLevel.L1.status" } },
                  {},
                ],
              },
              {
                $cond: [
                  { $ne: ["$approverLevels.L2", {}] },
                  { L2: { status: "$approverLevel.L2.status" } },
                  {},
                ],
              },
              {
                $cond: [
                  { $ne: ["$approverLevels.L3", {}] },
                  { L3: { status: "$approverLevel.L3.status" } },
                  {},
                ],
              },
            ],
          },
          remitterLevel: {
            $mergeObjects: [
              {},
              {
                $cond: [
                  { $ne: ["$remitterLevels.R1", {}] },
                  { R1: { status: "$remitterLevel.R1.status" } },
                  {},
                ],
              },
              {
                $cond: [
                  { $ne: ["$remitterLevels.R2", {}] },
                  { R2: { status: "$remitterLevel.R2.status" } },
                  {},
                ],
              },
              {
                $cond: [
                  { $ne: ["$remitterLevels.R3", {}] },
                  { R3: { status: "$remitterLevel.R3.status" } },
                  {},
                ],
              },
            ],
          },
        },
      },
      {
        $lookup: {
          from: "expenestypes",
          localField: "expenseType",
          foreignField: "_id",
          as: "expenseTypeData",
        },
      },
      {
        $unwind: {
          path: "$expenseTypeData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "expenseTypeData.categoriesIds",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      {
        $unwind: {
          path: "$categoryData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          approverLevels: 1,
          remitterLevels: 1,
          price: 1,
          expenseBillname: 1,
          image: 1,
          approverLevel: 1,
          remitterLevel: 1,
          "expenseTypeData.name": 1,
          "expenseTypeData._id": 1,
          "categoryData.name": 1,
          "categoryData._id": 1,
          createdAt:1
        },
      },
        {
        $sort: { createdAt: -1 },
      },
    ]);

    const expenseStatusCounts = await expensePreferencessModel.aggregate([
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(organizationId),
          createdBy: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "expenseroleassignments",
          let: { expenseTypeId: "$expenseType", orgId: "$organizationId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $or: [
                        {
                          $and: [
                            { $eq: ["$fromWhere", "ExpenseType"] },
                            { $isArray: "$expenseType" },
                            { $in: ["$$expenseTypeId", "$expenseType"] },
                          ],
                        },
                        {
                          $and: [
                            { $ne: ["$fromWhere", "ExpenseType"] },
                            { $eq: ["$organizationId", "$$orgId"] },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            },
            {
              $project: {
                fromWhere: 1,
                roleApprover: 1,
                roleRemitter: 1,
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
          approverLevels: "$roleData.roleApprover",
          remitterLevels: "$roleData.roleRemitter",
          allEmployeeIds: {
            $setUnion: [
              ["$roleData.roleApprover.L1.employeeId"],
              ["$roleData.roleApprover.L2.employeeId"],
              ["$roleData.roleApprover.L3.employeeId"],
              ["$roleData.roleRemitter.R1.employeeId"],
              ["$roleData.roleRemitter.R2.employeeId"],
              ["$roleData.roleRemitter.R3.employeeId"],
            ],
          },
        },
      },
      {
        $addFields: {
          approverLevel: {
            $mergeObjects: [
              {},
              {
                $cond: [
                  { $ne: ["$approverLevels.L1", {}] },
                  { L1: { status: "pending" } },
                  {},
                ],
              },
              {
                $cond: [
                  { $ne: ["$approverLevels.L2", {}] },
                  { L2: { status: "pending" } },
                  {},
                ],
              },
              {
                $cond: [
                  { $ne: ["$approverLevels.L3", {}] },
                  { L3: { status: "pending" } },
                  {},
                ],
              },
            ],
          },
          remitterLevel: {
            $mergeObjects: [
              {},
              {
                $cond: [
                  { $ne: ["$remitterLevels.R1", {}] },
                  { R1: { status: "pending" } },
                  {},
                ],
              },
              {
                $cond: [
                  { $ne: ["$remitterLevels.R2", {}] },
                  { R2: { status: "pending" } },
                  {},
                ],
              },
              {
                $cond: [
                  { $ne: ["$remitterLevels.R3", {}] },
                  { R3: { status: "pending" } },
                  {},
                ],
              },
            ],
          },
        },
      },
      {
        $addFields: {
          status: {
            $cond: [
              {
                $or: [
                  { $ne: ["$approverLevel.L1.status", "pending"] },
                  { $ne: ["$approverLevel.L2.status", "pending"] },
                  { $ne: ["$approverLevel.L3.status", "pending"] },
                  { $ne: ["$remitterLevel.R1.status", "pending"] },
                  { $ne: ["$remitterLevel.R2.status", "pending"] },
                  { $ne: ["$remitterLevel.R3.status", "pending"] },
                ],
              },
              "approve", // Example logic; adjust as needed
              "pending",
            ],
          },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          counts: {
            $push: { k: "$_id", v: "$count" },
          },
          totalExpense: { $sum: "$count" },
        },
      },
      {
        $replaceWith: {
          $mergeObjects: [
            {
              totalExpense: "$totalExpense",
            },
            {
              $arrayToObject: "$counts",
            },
          ],
        },
      },
      {
        $addFields: {
          approved: { $ifNull: ["$approve", 0] },
          pending: { $ifNull: ["$pending", 0] },
          rejected: { $ifNull: ["$rejected", 0] },
        },
      },
    ]);

    return returnFormatter(true, "Field data", {
      expenseStatusCounts: expenseStatusCounts,
      FieldData: FieldData,
    });
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// -------------------- approve expense --------------------

export async function approveExpenses(req, res) {
  try {
    const { organizationId, id: employeeId } = req.employee;
    const { expenseId, ...levelsFromRequest } = req.body;
    // console.log(expenseId, ...levelsFromRequest, "expenseId, ...levelsFromRequest")
    const empData = await employeModel.findOne({ _id: employeeId });
    // .populate("departmentId");
    const roleData = await expenseRoleAssignmentModel.findOne({
      organizationId,
    });
    // .populate("departmentId");
    const approvalData = await expensePreferencessModel.findOne({
      expenseType: expenseId,
    });

    // console.log(approvalData,"approvalDataapprovalData")

    if (!approvalData) {
      return returnFormatter(false, "Expense data not found");
    }

    // console.log(roleData,"roleData.departmentIdroleData.departmentId")
    // Check department match
    if (roleData.fromWhere === "Department") {
      const employeeDepartments = empData.departmentId
        ? [empData.departmentId.toString()]
        : [];

      const roleDepartments = Array.isArray(roleData.departmentId)
        ? roleData.departmentId.map((d) => d.toString())
        : [roleData.departmentId?.toString()].filter(Boolean);

      // console.log(
      //   roleDepartments,
      //   "roleDepartmentsroleDepartments",
      //   employeeDepartments
      // );

      const isDepartmentMatched = roleDepartments.some((deptId) =>
        employeeDepartments.includes(deptId)
      );

      if (!isDepartmentMatched) {
        return returnFormatter(
          false,
          "You are not authorized for this department"
        );
      }
    }

    //  Check expenseType match
    if (roleData.fromWhere === "ExpenseType") {
      const isExpenseMatched = roleData.expenseType?.some(
        (etype) => etype.toString() === expenseId
      );

      if (!isExpenseMatched) {
        return returnFormatter(
          false,
          "You are not authorized for this expense type"
        );
      }
    }

    let isMatched = false;
    let matchedLevelKey = null;
    let matchedType = null; // approverLevel or remitterLevel

    //  Check roleApprover
    if (roleData?.roleApprover) {
      for (const [levelKey, levelObj] of Object.entries(
        roleData.roleApprover
      )) {
        if (
          levelObj?.employeeId?.toString() === employeeId &&
          levelsFromRequest[levelKey]
        ) {
          isMatched = true;
          matchedLevelKey = levelKey;
          matchedType = "approverLevel";
          break;
        }
      }
    }

    //  Check roleRemitter
    if (!isMatched && roleData?.roleRemitter) {
      for (const [levelKey, levelObj] of Object.entries(
        roleData.roleRemitter
      )) {
        if (
          levelObj?.employeeId?.toString() === employeeId &&
          levelsFromRequest[levelKey]
        ) {
          isMatched = true;
          matchedLevelKey = levelKey;
          matchedType = "remitterLevel";
          break;
        }
      }
    }

    //  Level order validation
    const levelSequence = ["L1", "L2", "L3", "R1", "R2", "R3"];
    const currentLevelIndex = levelSequence.indexOf(matchedLevelKey);

    if (isMatched && currentLevelIndex > 0) {
      for (let i = 0; i < currentLevelIndex; i++) {
        const previousLevel = levelSequence[i];
        const previousType = i <= 2 ? "approverLevel" : "remitterLevel";

        const previousStatus =
          approvalData?.[previousType]?.[previousLevel]?.status?.toLowerCase();

        if (previousStatus === "rejected") {
          return returnFormatter(
            false,
            `Cannot approve ${matchedLevelKey} because ${previousLevel} was rejected`
          );
        }

        if (previousStatus !== "approved") {
          return returnFormatter(
            false,
            `Please approve previous levels before approving ${matchedLevelKey}`
          );
        }
      }
    }

    //  Update logic
    if (isMatched) {
      const levelStatus = levelsFromRequest[matchedLevelKey]?.status;
      const remarks = levelsFromRequest[matchedLevelKey]?.remarks || "";
      const currentDate = new Date();

      const updatePath = `${matchedType}.${matchedLevelKey}`;
      const updateObj = {
        $set: {
          [`${updatePath}.status`]: levelStatus,
          [`${updatePath}.date`]: currentDate,
          [`${updatePath}.remarks`]: remarks,
        },
      };

      const updatedData = await expensePreferencessModel.findOneAndUpdate(
        { expenseType: expenseId },
        updateObj,
        { new: true }
      );

      return returnFormatter(true, "Role and level approved successfully", {
        updatedData,
      });
    } else {
      return returnFormatter(
        false,
        "You are not authorized for this level or it was not requested"
      );
    }
  } catch (error) {
    console.error("❌ Error in approveExpenses:", error);
    return returnFormatter(false, error.message);
  }
}

//approverDashbords

export async function approverDashbords(req) {
  try {
    const { organizationId, id: employeeId } = req.employee;

    console.log(organizationId, employeeId, "employeeIdemployeeId");

    const FieldData = await expensePreferencessModel.aggregate([
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(organizationId),
        },
      },
      {
        $lookup: {
          from: "expenseroleassignments",
          let: { expenseTypeId: "$expenseType", orgId: "$organizationId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $or: [
                        {
                          $and: [
                            { $eq: ["$fromWhere", "ExpenseType"] },
                            { $isArray: "$expenseType" },
                            { $in: ["$$expenseTypeId", "$expenseType"] },
                          ],
                        },
                        {
                          $and: [
                            { $ne: ["$fromWhere", "ExpenseType"] },
                            { $eq: ["$organizationId", "$$orgId"] },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            },
            {
              $project: {
                fromWhere: 1,
                roleApprover: 1,
                roleRemitter: 1,
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
        $match: {
          $or: [
            {
              "roleData.roleApprover.L1.employeeId":
                new mongoose.Types.ObjectId(employeeId),
            },
            {
              "roleData.roleApprover.L2.employeeId":
                new mongoose.Types.ObjectId(employeeId),
            },
            {
              "roleData.roleApprover.L3.employeeId":
                new mongoose.Types.ObjectId(employeeId),
            },
          ],
        },
      },
      {
        $addFields: {
          approverLevels: "$roleData.roleApprover",
          remitterLevels: "$roleData.roleRemitter",
          allEmployeeIds: {
            $setUnion: [
              ["$roleData.roleApprover.L1.employeeId"],
              ["$roleData.roleApprover.L2.employeeId"],
              ["$roleData.roleApprover.L3.employeeId"],
              // ["$roleData.roleRemitter.R1.employeeId"],
              // ["$roleData.roleRemitter.R2.employeeId"],
              // ["$roleData.roleRemitter.R3.employeeId"],
            ],
          },
        },
      },
      {
        $addFields: {
          allEmployeeIds: {
            $filter: {
              input: "$allEmployeeIds",
              as: "empId",
              cond: { $ne: ["$$empId", null] },
            },
          },
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "allEmployeeIds",
          foreignField: "_id",
          as: "employeeDetails",
        },
      },
      {
        $addFields: {
          "approverLevels.L1.employee": {
            $let: {
              vars: {
                emp: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$employeeDetails",
                        as: "e",
                        cond: {
                          $eq: [
                            "$$e._id",
                            { $toObjectId: "$approverLevels.L1.employeeId" },
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
              in: {
                employeName: "$$emp.employeName",
                employeUniqueId: "$$emp.employeUniqueId",
              },
            },
          },
          "approverLevels.L2.employee": {
            $let: {
              vars: {
                emp: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$employeeDetails",
                        as: "e",
                        cond: {
                          $eq: [
                            "$$e._id",
                            { $toObjectId: "$approverLevels.L2.employeeId" },
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
              in: {
                employeName: "$$emp.employeName",
                employeUniqueId: "$$emp.employeUniqueId",
              },
            },
          },
          "approverLevels.L3.employee": {
            $let: {
              vars: {
                emp: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$employeeDetails",
                        as: "e",
                        cond: {
                          $eq: [
                            "$$e._id",
                            { $toObjectId: "$approverLevels.L3.employeeId" },
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
              in: {
                employeName: "$$emp.employeName",
                employeUniqueId: "$$emp.employeUniqueId",
              },
            },
          },
          "remitterLevels.R1.employee": {
            $let: {
              vars: {
                emp: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$employeeDetails",
                        as: "e",
                        cond: {
                          $eq: [
                            "$$e._id",
                            { $toObjectId: "$remitterLevels.R1.employeeId" },
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
              in: {
                employeName: "$$emp.employeName",
                employeUniqueId: "$$emp.employeUniqueId",
              },
            },
          },
          "remitterLevels.R2.employee": {
            $let: {
              vars: {
                emp: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$employeeDetails",
                        as: "e",
                        cond: {
                          $eq: [
                            "$$e._id",
                            { $toObjectId: "$remitterLevels.R2.employeeId" },
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
              in: {
                employeName: "$$emp.employeName",
                employeUniqueId: "$$emp.employeUniqueId",
              },
            },
          },
          "remitterLevels.R3.employee": {
            $let: {
              vars: {
                emp: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$employeeDetails",
                        as: "e",
                        cond: {
                          $eq: [
                            "$$e._id",
                            { $toObjectId: "$remitterLevels.R3.employeeId" },
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
              in: {
                employeName: "$$emp.employeName",
                employeUniqueId: "$$emp.employeUniqueId",
              },
            },
          },
        },
      },
      {
        $addFields: {
          approverLevels: {
            $cond: [
              {
                $eq: [
                  "$roleData.roleApprover.L1.employeeId",
                  new mongoose.Types.ObjectId(employeeId),
                ],
              },
              { L1: "$approverLevels.L1" },
              {
                $cond: [
                  {
                    $eq: [
                      "$roleData.roleApprover.L2.employeeId",
                      new mongoose.Types.ObjectId(employeeId),
                    ],
                  },
                  {
                    L1: "$approverLevels.L1",
                    L2: "$approverLevels.L2",
                  },
                  {
                    $cond: [
                      {
                        $eq: [
                          "$roleData.roleApprover.L3.employeeId",
                          new mongoose.Types.ObjectId(employeeId),
                        ],
                      },
                      {
                        L1: "$approverLevels.L1",
                        L2: "$approverLevels.L2",
                        L3: "$approverLevels.L3",
                      },
                      {},
                    ],
                  },
                ],
              },
            ],
          },
          approverLevel: {
            $cond: [
              {
                $eq: [
                  "$roleData.roleApprover.L1.employeeId",
                  new mongoose.Types.ObjectId(employeeId),
                ],
              },
              { L1: "$approverLevel.L1" },
              {
                $cond: [
                  {
                    $eq: [
                      "$roleData.roleApprover.L2.employeeId",
                      new mongoose.Types.ObjectId(employeeId),
                    ],
                  },
                  {
                    L1: "$approverLevel.L1",
                    L2: "$approverLevel.L2",
                  },
                  {
                    $cond: [
                      {
                        $eq: [
                          "$roleData.roleApprover.L3.employeeId",
                          new mongoose.Types.ObjectId(employeeId),
                        ],
                      },
                      {
                        L1: "$approverLevel.L1",
                        L2: "$approverLevel.L2",
                        L3: "$approverLevel.L3",
                      },
                      {},
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
      {
        $lookup: {
          from: "expenestypes",
          localField: "expenseType",
          foreignField: "_id",
          as: "expenseTypeData",
        },
      },
      {
        $unwind: {
          path: "$expenseTypeData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "expenseTypeData.categoriesIds",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      {
        $unwind: {
          path: "$categoryData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          employeName: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      "$roleData.roleApprover.L1.employeeId",
                      new mongoose.Types.ObjectId(employeeId),
                    ],
                  },
                  then: "$approverLevels.L1.employee.employeName",
                },
                {
                  case: {
                    $eq: [
                      "$roleData.roleApprover.L2.employeeId",
                      new mongoose.Types.ObjectId(employeeId),
                    ],
                  },
                  then: "$approverLevels.L2.employee.employeName",
                },
                {
                  case: {
                    $eq: [
                      "$roleData.roleApprover.L3.employeeId",
                      new mongoose.Types.ObjectId(employeeId),
                    ],
                  },
                  then: "$approverLevels.L3.employee.employeName",
                },
              ],
              default: null,
            },
          },
          employeUniqueId: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      "$roleData.roleApprover.L1.employeeId",
                      new mongoose.Types.ObjectId(employeeId),
                    ],
                  },
                  then: "$approverLevels.L1.employee.employeUniqueId",
                },
                {
                  case: {
                    $eq: [
                      "$roleData.roleApprover.L2.employeeId",
                      new mongoose.Types.ObjectId(employeeId),
                    ],
                  },
                  then: "$approverLevels.L2.employee.employeUniqueId",
                },
                {
                  case: {
                    $eq: [
                      "$roleData.roleApprover.L3.employeeId",
                      new mongoose.Types.ObjectId(employeeId),
                    ],
                  },
                  then: "$approverLevels.L3.employee.employeUniqueId",
                },
              ],
              default: null,
            },
          },
        },
      },
      {
        $project: {
          approverLevels: 1,
          // remitterLevels: 1,
          price: 1,
          expenseBillname: 1,
          image: 1,
          approverLevel: 1,
          // remitterLevel: 1,
          "expenseTypeData.name": 1,
          "expenseTypeData._id": 1,
          "categoryData.name": 1,
          "categoryData._id": 1,
          employeName: 1, // Add this line
          employeUniqueId: 1,
        },
      },
    ]);
    return returnFormatter(true, "approval expense list", FieldData);
  } catch (error) {
    console.error("❌ Error in approveExpenses:", error);
    return returnFormatter(false, error.message);
  }
}

//remitterDashbords
export async function remitterDashbords(req) {
  try {
    const { organizationId, id: employeeId } = req.employee;

    console.log(organizationId, employeeId, "employeeIdemployeeId");

    const FieldData = await expensePreferencessModel.aggregate([
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(organizationId),
        },
      },
      {
        $lookup: {
          from: "expenseroleassignments",
          let: { expenseTypeId: "$expenseType", orgId: "$organizationId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $or: [
                        {
                          $and: [
                            { $eq: ["$fromWhere", "ExpenseType"] },
                            { $isArray: "$expenseType" },
                            { $in: ["$$expenseTypeId", "$expenseType"] },
                          ],
                        },
                        {
                          $and: [
                            { $ne: ["$fromWhere", "ExpenseType"] },
                            { $eq: ["$organizationId", "$$orgId"] },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            },
            {
              $project: {
                fromWhere: 1,
                roleApprover: 1,
                roleRemitter: 1,
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
        $match: {
          $or: [
            {
              "roleData.roleApprover.L1.employeeId":
                new mongoose.Types.ObjectId(employeeId),
            },
            {
              "roleData.roleApprover.L2.employeeId":
                new mongoose.Types.ObjectId(employeeId),
            },
            {
              "roleData.roleApprover.L3.employeeId":
                new mongoose.Types.ObjectId(employeeId),
            },
          ],
        },
      },
      {
        $addFields: {
          approverLevels: "$roleData.roleApprover",
          remitterLevels: "$roleData.roleRemitter",
          allEmployeeIds: {
            $setUnion: [
              // ["$roleData.roleApprover.L1.employeeId"],
              // ["$roleData.roleApprover.L2.employeeId"],
              // ["$roleData.roleApprover.L3.employeeId"],
              ["$roleData.roleRemitter.R1.employeeId"],
              ["$roleData.roleRemitter.R2.employeeId"],
              ["$roleData.roleRemitter.R3.employeeId"],
            ],
          },
        },
      },
      {
        $addFields: {
          allEmployeeIds: {
            $filter: {
              input: "$allEmployeeIds",
              as: "empId",
              cond: { $ne: ["$$empId", null] },
            },
          },
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "allEmployeeIds",
          foreignField: "_id",
          as: "employeeDetails",
        },
      },
      {
        $addFields: {
          "approverLevels.L1.employee": {
            $let: {
              vars: {
                emp: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$employeeDetails",
                        as: "e",
                        cond: {
                          $eq: [
                            "$$e._id",
                            { $toObjectId: "$approverLevels.L1.employeeId" },
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
              in: {
                employeName: "$$emp.employeName",
                employeUniqueId: "$$emp.employeUniqueId",
              },
            },
          },
          "approverLevels.L2.employee": {
            $let: {
              vars: {
                emp: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$employeeDetails",
                        as: "e",
                        cond: {
                          $eq: [
                            "$$e._id",
                            { $toObjectId: "$approverLevels.L2.employeeId" },
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
              in: {
                employeName: "$$emp.employeName",
                employeUniqueId: "$$emp.employeUniqueId",
              },
            },
          },
          "approverLevels.L3.employee": {
            $let: {
              vars: {
                emp: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$employeeDetails",
                        as: "e",
                        cond: {
                          $eq: [
                            "$$e._id",
                            { $toObjectId: "$approverLevels.L3.employeeId" },
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
              in: {
                employeName: "$$emp.employeName",
                employeUniqueId: "$$emp.employeUniqueId",
              },
            },
          },
          "remitterLevels.R1.employee": {
            $let: {
              vars: {
                emp: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$employeeDetails",
                        as: "e",
                        cond: {
                          $eq: [
                            "$$e._id",
                            { $toObjectId: "$remitterLevels.R1.employeeId" },
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
              in: {
                employeName: "$$emp.employeName",
                employeUniqueId: "$$emp.employeUniqueId",
              },
            },
          },
          "remitterLevels.R2.employee": {
            $let: {
              vars: {
                emp: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$employeeDetails",
                        as: "e",
                        cond: {
                          $eq: [
                            "$$e._id",
                            { $toObjectId: "$remitterLevels.R2.employeeId" },
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
              in: {
                employeName: "$$emp.employeName",
                employeUniqueId: "$$emp.employeUniqueId",
              },
            },
          },
          "remitterLevels.R3.employee": {
            $let: {
              vars: {
                emp: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$employeeDetails",
                        as: "e",
                        cond: {
                          $eq: [
                            "$$e._id",
                            { $toObjectId: "$remitterLevels.R3.employeeId" },
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
              in: {
                employeName: "$$emp.employeName",
                employeUniqueId: "$$emp.employeUniqueId",
              },
            },
          },
        },
      },
      {
        $addFields: {
          remitterLevels: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      "$roleData.roleRemitter.R1.employeeId",
                      new mongoose.Types.ObjectId(employeeId),
                    ],
                  },
                  then: {
                    R1: "$remitterLevels.R1",
                  },
                },
                {
                  case: {
                    $eq: [
                      "$roleData.roleRemitter.R2.employeeId",
                      new mongoose.Types.ObjectId(employeeId),
                    ],
                  },
                  then: {
                    R1: "$remitterLevels.R1",
                    R2: "$remitterLevels.R2",
                  },
                },
                {
                  case: {
                    $eq: [
                      "$roleData.roleRemitter.R3.employeeId",
                      new mongoose.Types.ObjectId(employeeId),
                    ],
                  },
                  then: {
                    R1: "$remitterLevels.R1",
                    R2: "$remitterLevels.R2",
                    R3: "$remitterLevels.R3",
                  },
                },
              ],
              default: {},
            },
          },
          remitterLevel: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      "$roleData.roleRemitter.R1.employeeId",
                      new mongoose.Types.ObjectId(employeeId),
                    ],
                  },
                  then: { R1: "$remitterLevel.R1" },
                },
                {
                  case: {
                    $eq: [
                      "$roleData.roleRemitter.R2.employeeId",
                      new mongoose.Types.ObjectId(employeeId),
                    ],
                  },
                  then: {
                    R1: "$remitterLevel.R1",
                    R2: "$remitterLevel.R2",
                  },
                },
                {
                  case: {
                    $eq: [
                      "$roleData.roleRemitter.R3.employeeId",
                      new mongoose.Types.ObjectId(employeeId),
                    ],
                  },
                  then: {
                    R1: "$remitterLevel.R1",
                    R2: "$remitterLevel.R2",
                    R3: "$remitterLevel.R3",
                  },
                },
              ],
              default: {},
            },
          },
        },
      },
      {
        $lookup: {
          from: "expenestypes",
          localField: "expenseType",
          foreignField: "_id",
          as: "expenseTypeData",
        },
      },
      {
        $unwind: {
          path: "$expenseTypeData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "expenseTypeData.categoriesIds",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      {
        $unwind: {
          path: "$categoryData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          employeName: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      "$roleData.roleApprover.L1.employeeId",
                      new mongoose.Types.ObjectId(employeeId),
                    ],
                  },
                  then: "$approverLevels.L1.employee.employeName",
                },
                {
                  case: {
                    $eq: [
                      "$roleData.roleApprover.L2.employeeId",
                      new mongoose.Types.ObjectId(employeeId),
                    ],
                  },
                  then: "$approverLevels.L2.employee.employeName",
                },
                {
                  case: {
                    $eq: [
                      "$roleData.roleApprover.L3.employeeId",
                      new mongoose.Types.ObjectId(employeeId),
                    ],
                  },
                  then: "$approverLevels.L3.employee.employeName",
                },
              ],
              default: null,
            },
          },
          employeUniqueId: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      "$roleData.roleApprover.L1.employeeId",
                      new mongoose.Types.ObjectId(employeeId),
                    ],
                  },
                  then: "$approverLevels.L1.employee.employeUniqueId",
                },
                {
                  case: {
                    $eq: [
                      "$roleData.roleApprover.L2.employeeId",
                      new mongoose.Types.ObjectId(employeeId),
                    ],
                  },
                  then: "$approverLevels.L2.employee.employeUniqueId",
                },
                {
                  case: {
                    $eq: [
                      "$roleData.roleApprover.L3.employeeId",
                      new mongoose.Types.ObjectId(employeeId),
                    ],
                  },
                  then: "$approverLevels.L3.employee.employeUniqueId",
                },
              ],
              default: null,
            },
          },
        },
      },
      {
        $project: {
          // approverLevels: 1,
          remitterLevels: 1,
          price: 1,
          expenseBillname: 1,
          image: 1,
          // approverLevel: 1,
          remitterLevel: 1,
          "expenseTypeData.name": 1,
          "expenseTypeData._id": 1,
          "categoryData.name": 1,
          "categoryData._id": 1,
          employeName: 1, // Add this line
          employeUniqueId: 1,
        },
      },
    ]);

    return returnFormatter(true, "remitter expense list", FieldData);
  } catch (error) {
    console.error("❌ Error in approveExpenses:", error);
    return returnFormatter(false, error.message);
  }
}

//adminDashbords
export async function adminDashbords(req) {
  try {
    const { organizationId, id: employeeId } = req.employee;

    console.log(organizationId, employeeId, "employeeIdemployeeId");

    const FieldData = await expensePreferencessModel.aggregate([
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(organizationId),
        },
      },
      {
        $lookup: {
          from: "expenseroleassignments",
          let: { expenseTypeId: "$expenseType", orgId: "$organizationId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $or: [
                        {
                          $and: [
                            { $eq: ["$fromWhere", "ExpenseType"] },
                            { $isArray: "$expenseType" },
                            { $in: ["$$expenseTypeId", "$expenseType"] },
                          ],
                        },
                        {
                          $and: [
                            { $ne: ["$fromWhere", "ExpenseType"] },
                            { $eq: ["$organizationId", "$$orgId"] },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            },
            {
              $project: {
                fromWhere: 1,
                roleApprover: 1,
                roleRemitter: 1,
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
        $match: {
          $or: [
            {
              "roleData.roleApprover.L1.employeeId":
                new mongoose.Types.ObjectId(employeeId),
            },
            {
              "roleData.roleApprover.L2.employeeId":
                new mongoose.Types.ObjectId(employeeId),
            },
            {
              "roleData.roleApprover.L3.employeeId":
                new mongoose.Types.ObjectId(employeeId),
            },
          ],
        },
      },
      {
        $addFields: {
          approverLevels: "$roleData.roleApprover",
          remitterLevels: "$roleData.roleRemitter",
          allEmployeeIds: {
            $setUnion: [
              ["$roleData.roleApprover.L1.employeeId"],
              ["$roleData.roleApprover.L2.employeeId"],
              ["$roleData.roleApprover.L3.employeeId"],
              ["$roleData.roleRemitter.R1.employeeId"],
              ["$roleData.roleRemitter.R2.employeeId"],
              ["$roleData.roleRemitter.R3.employeeId"],
            ],
          },
        },
      },
      {
        $addFields: {
          allEmployeeIds: {
            $filter: {
              input: "$allEmployeeIds",
              as: "empId",
              cond: { $ne: ["$$empId", null] },
            },
          },
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "allEmployeeIds",
          foreignField: "_id",
          as: "employeeDetails",
        },
      },
      {
        $addFields: {
          "approverLevels.L1.employee": {
            $let: {
              vars: {
                emp: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$employeeDetails",
                        as: "e",
                        cond: {
                          $eq: [
                            "$$e._id",
                            { $toObjectId: "$approverLevels.L1.employeeId" },
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
              in: {
                employeName: "$$emp.employeName",
                employeUniqueId: "$$emp.employeUniqueId",
              },
            },
          },
          "approverLevels.L2.employee": {
            $let: {
              vars: {
                emp: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$employeeDetails",
                        as: "e",
                        cond: {
                          $eq: [
                            "$$e._id",
                            { $toObjectId: "$approverLevels.L2.employeeId" },
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
              in: {
                employeName: "$$emp.employeName",
                employeUniqueId: "$$emp.employeUniqueId",
              },
            },
          },
          "approverLevels.L3.employee": {
            $let: {
              vars: {
                emp: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$employeeDetails",
                        as: "e",
                        cond: {
                          $eq: [
                            "$$e._id",
                            { $toObjectId: "$approverLevels.L3.employeeId" },
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
              in: {
                employeName: "$$emp.employeName",
                employeUniqueId: "$$emp.employeUniqueId",
              },
            },
          },
          "remitterLevels.R1.employee": {
            $let: {
              vars: {
                emp: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$employeeDetails",
                        as: "e",
                        cond: {
                          $eq: [
                            "$$e._id",
                            { $toObjectId: "$remitterLevels.R1.employeeId" },
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
              in: {
                employeName: "$$emp.employeName",
                employeUniqueId: "$$emp.employeUniqueId",
              },
            },
          },
          "remitterLevels.R2.employee": {
            $let: {
              vars: {
                emp: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$employeeDetails",
                        as: "e",
                        cond: {
                          $eq: [
                            "$$e._id",
                            { $toObjectId: "$remitterLevels.R2.employeeId" },
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
              in: {
                employeName: "$$emp.employeName",
                employeUniqueId: "$$emp.employeUniqueId",
              },
            },
          },
          "remitterLevels.R3.employee": {
            $let: {
              vars: {
                emp: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$employeeDetails",
                        as: "e",
                        cond: {
                          $eq: [
                            "$$e._id",
                            { $toObjectId: "$remitterLevels.R3.employeeId" },
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
              in: {
                employeName: "$$emp.employeName",
                employeUniqueId: "$$emp.employeUniqueId",
              },
            },
          },
        },
      },
      {
        $addFields: {
          approverLevel: {
            $let: {
              vars: {
                approverLevelArray: { $objectToArray: "$approverLevel" },
                approverLevelsObj: "$approverLevels",
              },
              in: {
                $arrayToObject: {
                  $filter: {
                    input: "$$approverLevelArray",
                    as: "item",
                    cond: {
                      $gt: [
                        {
                          $size: {
                            $objectToArray: {
                              $ifNull: [
                                {
                                  $getField: {
                                    field: "employee",
                                    input: {
                                      $getField: {
                                        field: "$$item.k",
                                        input: "$$approverLevelsObj",
                                      },
                                    },
                                  },
                                },
                                {},
                              ],
                            },
                          },
                        },
                        0,
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "expenestypes",
          localField: "expenseType",
          foreignField: "_id",
          as: "expenseTypeData",
        },
      },
      {
        $unwind: {
          path: "$expenseTypeData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "expenseTypeData.categoriesIds",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      {
        $unwind: {
          path: "$categoryData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          employeName: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      "$roleData.roleApprover.L1.employeeId",
                      new mongoose.Types.ObjectId(employeeId),
                    ],
                  },
                  then: "$approverLevels.L1.employee.employeName",
                },
                {
                  case: {
                    $eq: [
                      "$roleData.roleApprover.L2.employeeId",
                      new mongoose.Types.ObjectId(employeeId),
                    ],
                  },
                  then: "$approverLevels.L2.employee.employeName",
                },
                {
                  case: {
                    $eq: [
                      "$roleData.roleApprover.L3.employeeId",
                      new mongoose.Types.ObjectId(employeeId),
                    ],
                  },
                  then: "$approverLevels.L3.employee.employeName",
                },
                {
                  case: {
                    $eq: [
                      "$roleData.roleRemitter.R1.employeeId",
                      new mongoose.Types.ObjectId(employeeId),
                    ],
                  },
                  then: "$remitterLevels.R1.employee.employeName",
                },
                {
                  case: {
                    $eq: [
                      "$roleData.roleRemitter.R2.employeeId",
                      new mongoose.Types.ObjectId(employeeId),
                    ],
                  },
                  then: "$remitterLevels.R2.employee.employeName",
                },
                {
                  case: {
                    $eq: [
                      "$roleData.roleRemitter.R3.employeeId",
                      new mongoose.Types.ObjectId(employeeId),
                    ],
                  },
                  then: "$remitterLevels.R3.employee.employeName",
                },
              ],
              default: null,
            },
          },
          employeUniqueId: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      "$roleData.roleApprover.L1.employeeId",
                      new mongoose.Types.ObjectId(employeeId),
                    ],
                  },
                  then: "$approverLevels.L1.employee.employeUniqueId",
                },
                {
                  case: {
                    $eq: [
                      "$roleData.roleApprover.L2.employeeId",
                      new mongoose.Types.ObjectId(employeeId),
                    ],
                  },
                  then: "$approverLevels.L2.employee.employeUniqueId",
                },
                {
                  case: {
                    $eq: [
                      "$roleData.roleApprover.L3.employeeId",
                      new mongoose.Types.ObjectId(employeeId),
                    ],
                  },
                  then: "$approverLevels.L3.employee.employeUniqueId",
                },
                {
                  case: {
                    $eq: [
                      "$roleData.roleRemitter.R1.employeeId",
                      new mongoose.Types.ObjectId(employeeId),
                    ],
                  },
                  then: "$remitterLevels.R1.employee.employeUniqueId",
                },
                {
                  case: {
                    $eq: [
                      "$roleData.roleRemitter.R2.employeeId",
                      new mongoose.Types.ObjectId(employeeId),
                    ],
                  },
                  then: "$remitterLevels.R2.employee.employeUniqueId",
                },
                {
                  case: {
                    $eq: [
                      "$roleData.roleRemitter.R3.employeeId",
                      new mongoose.Types.ObjectId(employeeId),
                    ],
                  },
                  then: "$remitterLevels.R3.employee.employeUniqueId",
                },
              ],
              default: null,
            },
          },
        },
      },
      {
        $project: {
          approverLevels: 1,
          remitterLevels: 1,
          price: 1,
          expenseBillname: 1,
          image: 1,
          approverLevel: 1,
          remitterLevel: 1,
          "expenseTypeData.name": 1,
          "expenseTypeData._id": 1,
          "categoryData.name": 1,
          "categoryData._id": 1,
          employeName: 1, // Add this line
          employeUniqueId: 1,
        },
      },
    ]);

    return returnFormatter(true, "remitter expense list", FieldData);
  } catch (error) {
    console.error("❌ Error in approveExpenses:", error);
    return returnFormatter(false, error.message);
  }
}
