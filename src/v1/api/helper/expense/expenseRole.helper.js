import { returnFormatter } from "../../formatters/common.formatter.js";
import { expenseRoleFormatter } from "../../formatters/expense/expenseRole.formatter.js";
import expenseRoleAssignmentModel from "../../models/expense/expenseRole.model.js";
import employeModel from "../../models/employeemodel/employee.model.js";
import newDepartmentModel from "../../models/deparmentModel/deparment.model.js";
import mongoose from "mongoose";
import expensePreferencessModel from "../../models/expense/expense.model.js";
// -------------------------- update from where -----------------------

// export async function updateFromWheres(requestsObject) {
//   try {
//     const { fromWhere, id, remitterLevel, approverLevel } = requestsObject.body;
//     const { organizationId } = requestsObject.employee;
//     // console.log(
//     //   fromWhere,
//     //   id,
//     //   remitterLevel,
//     //   approverLevel,
//     //   "fromWhere, id, remitterLevels,approverLevels"
//     // );
//     // Validation
//     if (!fromWhere) {
//       return returnFormatter(false, "'fromWhere' is required");
//     }

//     // CREATE flow
//     if (!id) {
//       const alreadyExists = await expenseRoleAssignmentModel.findOne({
//         organizationId,
//       });

//       if (alreadyExists) {
//         return returnFormatter(
//           false,
//           "A record already exists for this organization. You can't add more than one."
//         );
//       }

//       const createdData = await expenseRoleAssignmentModel.create({
//         fromWhere,
//         organizationId,
//         remitterLevel,
//         approverLevel: approverLevel,
//       });
//       return returnFormatter(
//         true,
//         "'fromWhere' created successfully",
//         createdData
//       );
//     }

//     // UPDATE flow
//     const existingData = await expenseRoleAssignmentModel.findById(id);
//     if (!existingData) {
//       return returnFormatter(false, "No data found with the provided ID");
//     }

//     // Prevent duplicate update (no change in fromWhere)
//     if (existingData.fromWhere === fromWhere) {
//       const updatedData = await expenseRoleAssignmentModel.findByIdAndUpdate(
//         id,
//         {
//           remitterLevel,
//           approverLevel: approverLevel,
//         },
//         { new: true }
//       );
//       return returnFormatter(true, "fromwhere data updated", updatedData);
//     }

//     // If 'fromWhere' is changing, reset related fields
//     const updatedData = await expenseRoleAssignmentModel.findByIdAndUpdate(
//       id,
//       {
//         fromWhere,
//         roleSubmitter: {},
//         roleApprover: {
//           L1: null,
//           L2: null,
//           L3: null,
//         },
//         roleRemitter: {
//           R1: null,
//           R2: null,
//           R3: null,
//         },
//         createdBy: null,
//         isExistRecord: false,
//         remitterLevel,
//         approverLevel: approverLevel,
//         expenseType: [],
//       },
//       { new: true }
//     );
//     //  await expensePreferencessModel

//     return returnFormatter(
//       true,
//       "'fromWhere' updated successfully and roles reset.",
//       updatedData
//     );
//   } catch (error) {
//     console.error("Error in updateFromWheres:", error);
//     return returnFormatter(
//       false,
//       "An error occurred while processing 'fromWhere'."
//     );
//   }
// }

export async function updateFromWheres(requestsObject) {
  try {
    const { fromWhere, id, remitterLevel, approverLevel } = requestsObject.body;
    const { organizationId } = requestsObject.employee;

    if (!fromWhere) {
      return returnFormatter(false, "'fromWhere' is required");
    }

    // Helper maps for level ordering
    const approverOrder = { L1: 1, L2: 2, L3: 3 };
    const remitterOrder = { R1: 1, R2: 2, R3: 3 };

    // CREATE flow
    if (!id) {
      const alreadyExists = await expenseRoleAssignmentModel.findOne({
        organizationId,
      });

      if (alreadyExists) {
        return returnFormatter(
          false,
          "A record already exists for this organization. You can't add more than one."
        );
      }

      const createdData = await expenseRoleAssignmentModel.create({
        fromWhere,
        organizationId,
        remitterLevel,
        approverLevel,
      });
      return returnFormatter(
        true,
        "'fromWhere' created successfully",
        createdData
      );
    }

    // UPDATE flow
    const existingData = await expenseRoleAssignmentModel.findById(id);
    if (!existingData) {
      return returnFormatter(false, "No data found with the provided ID");
    }

    // If fromWhere changed, reset roles etc (your original code)
    if (existingData.fromWhere !== fromWhere) {
      const updatedData = await expenseRoleAssignmentModel.findByIdAndUpdate(
        id,
        {
          fromWhere,
          roleSubmitter: {},
          roleApprover: { L1: null, L2: null, L3: null },
          roleRemitter: { R1: null, R2: null, R3: null },
          createdBy: null,
          isExistRecord: false,
          remitterLevel,
          approverLevel,
          expenseType: [],
          departmentId: [],
        },
        { new: true }
      );
      return returnFormatter(
        true,
        "'fromWhere' updated successfully and roles reset.",
        updatedData
      );
    }

    // From here, fromWhere is unchanged, but levels might change
    // Clone existing roleApprover and roleRemitter for modification
    const updatedRoleApprover = { ...existingData.roleApprover };
    const updatedRoleRemitter = { ...existingData.roleRemitter };

    // Remove approver levels greater than new approverLevel
    if (approverLevel && existingData.approverLevel) {
      const newLevelNum = approverOrder[approverLevel];
      const oldLevelNum = approverOrder[existingData.approverLevel];
      if (newLevelNum < oldLevelNum) {
        // Clear all levels greater than newLevelNum
        Object.keys(updatedRoleApprover).forEach((levelKey) => {
          if (approverOrder[levelKey] > newLevelNum) {
            updatedRoleApprover[levelKey] = null;
          }
        });
      }
    }

    // Remove remitter levels greater than new remitterLevel
    if (remitterLevel && existingData.remitterLevel) {
      const newLevelNum = remitterOrder[remitterLevel];
      const oldLevelNum = remitterOrder[existingData.remitterLevel];
      if (newLevelNum < oldLevelNum) {
        Object.keys(updatedRoleRemitter).forEach((levelKey) => {
          if (remitterOrder[levelKey] > newLevelNum) {
            updatedRoleRemitter[levelKey] = null;
          }
        });
      }
    }

    // Update DB with possibly pruned roles and new levels
    const updatedData = await expenseRoleAssignmentModel.findByIdAndUpdate(
      id,
      {
        remitterLevel,
        approverLevel,
        roleApprover: updatedRoleApprover,
        roleRemitter: updatedRoleRemitter,
      },
      { new: true }
    );

    return returnFormatter(
      true,
      "fromWhere data updated with adjusted roles",
      updatedData
    );
  } catch (error) {
    console.error("Error in updateFromWheres:", error);
    return returnFormatter(
      false,
      "An error occurred while processing 'fromWhere'."
    );
  }
}

//---------------------------- config list ----------------------------

export async function configLists(requestsObject) {
  try {
    const { fromWhere, id } = requestsObject.body;
    const { organizationId } = requestsObject.employee;

    if (!organizationId) {
      return returnFormatter(false, "organizationId is required");
    }

    const newData = await expenseRoleAssignmentModel
      .find({ organizationId })
      .select("fromWhere isExistRecord approverLevel remitterLevel");

    return returnFormatter(true, `config list`, newData);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

//----------------------------   add Role ------------------------------

export async function addExpenseRole(id, requestsObject) {
  try {
    const formattedData = expenseRoleFormatter(requestsObject);
    console.log(formattedData, "formattedData");
    let roleFromData = await expenseRoleAssignmentModel.findOne({ _id: id });
    if (!roleFromData) {
      return returnFormatter(false, "Role data not found for the given ID");
    }

    if (formattedData.roleApprover) {
      const existing = roleFromData.roleApprover || {};

      // Copy existing values to avoid overwriting them unless specified
      const updatedApprover = {
        L1: existing.L1,
        L2: existing.L2,
        L3: existing.L3,
      };

      // If L2 is provided
      if (formattedData.roleApprover.L2) {
        updatedApprover.L2 = formattedData.roleApprover.L2;
        if (existing.L1) {
          updatedApprover.L1 = formattedData.roleApprover.L1 || existing.L1;
        }
      }

      // If L3 is provided
      if (formattedData.roleApprover.L3) {
        updatedApprover.L3 = formattedData.roleApprover.L3;
        if (existing.L2) {
          updatedApprover.L2 = formattedData.roleApprover.L2 || existing.L2;
        }
      }

      // If L1 is provided
      if (formattedData.roleApprover.L1) {
        updatedApprover.L1 = formattedData.roleApprover.L1;
      }

      formattedData.roleApprover = updatedApprover;
    }

    if (formattedData.roleRemitter) {
      const existingRemitter = roleFromData.roleRemitter || {};

      const updatedRemitter = {
        R1: existingRemitter.R1,
        R2: existingRemitter.R2,
        R3: existingRemitter.R3,
      };

      if (formattedData.roleRemitter.R2) {
        updatedRemitter.R2 = formattedData.roleRemitter.R2;
        if (existingRemitter.R1) {
          updatedRemitter.R1 =
            formattedData.roleRemitter.R1 || existingRemitter.R1;
        }
      }

      if (formattedData.roleRemitter.R3) {
        updatedRemitter.R3 = formattedData.roleRemitter.R3;
        if (existingRemitter.R2) {
          updatedRemitter.R2 =
            formattedData.roleRemitter.R2 || existingRemitter.R2;
        }
      }

      if (formattedData.roleRemitter.R1) {
        updatedRemitter.R1 = formattedData.roleRemitter.R1;
      }

      formattedData.roleRemitter = updatedRemitter;
    }
    const newTripData = await expenseRoleAssignmentModel.findOneAndUpdate(
      { _id: id },
      formattedData,
      { new: true }
    );
    return returnFormatter(
      true,
      "role update successfully created succesfully",
      newTripData
    );
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// // --------------------- update Field -----------------------

export async function updateTripValueById(tripValueId, updateData) {
  try {
    const formattedData = tripValueFormatter(updateData);
    console.log(formattedData, "formattedDataformattedData");
    const updatedfieldData = await expenseRoleAssignmentModel.findOneAndUpdate(
      { _id: tripValueId },
      formattedData,
      { new: true, upsert: true }
    );
    return returnFormatter(
      true,
      "trip value updated succesfully",
      updatedfieldData
    );
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// // // --------------------- get Field -----------------------

export async function getExpenseRoleDetailById(expenseValueId) {
  try {
    const selectedEmployeeFields =
      "employeUniqueId employeName email _id branchId departmentId"; // Add more as needed
    const selectedBranchFields = "name city _id"; // Fields from branch
    const selectDepartmentFields = "name";
    const tripData = await expenseRoleAssignmentModel
      .findById(expenseValueId)
      .populate({
        path: "roleSubmitter.employeeId",
        select: selectedEmployeeFields,
        level: "submitter",
        populate: [
          { path: "branchId", select: selectedBranchFields },
          { path: "departmentId", select: selectDepartmentFields },
        ],
      })
      .populate({
        path: "roleApprover.L1.employeeId",
        select: selectedEmployeeFields,
        populate: [
          { path: "branchId", select: selectedBranchFields },
          { path: "departmentId", select: selectDepartmentFields },
        ],
      })
      .populate({
        path: "roleApprover.L2.employeeId",
        select: selectedEmployeeFields,
        populate: [
          { path: "branchId", select: selectedBranchFields },
          { path: "departmentId", select: selectDepartmentFields },
        ],
      })
      .populate({
        path: "roleApprover.L3.employeeId",
        select: selectedEmployeeFields,
        populate: [
          { path: "branchId", select: selectedBranchFields },
          { path: "departmentId", select: selectDepartmentFields },
        ],
      })
      .populate({
        path: "roleRemitter.R1.employeeId",
        select: selectedEmployeeFields,
        populate: [
          { path: "branchId", select: selectedBranchFields },
          { path: "departmentId", select: selectDepartmentFields },
        ],
      })
      .populate({
        path: "roleRemitter.R2.employeeId",
        select: selectedEmployeeFields,
        populate: [
          { path: "branchId", select: selectedBranchFields },
          { path: "departmentId", select: selectDepartmentFields },
        ],
      })
      .populate({
        path: "roleRemitter.R3.employeeId",
        select: selectedEmployeeFields,
        populate: [
          { path: "branchId", select: selectedBranchFields },
          { path: "departmentId", select: selectDepartmentFields },
        ],
      })
      .populate({
        path: "createdBy",
        select: selectedEmployeeFields,
        populate: [
          { path: "branchId", select: selectedBranchFields },
          { path: "departmentId", select: selectDepartmentFields },
        ],
      })
      .populate({
        path: "expenseType",
        select: "name",
      }); //.populate('fields.fieldId')
    return returnFormatter(true, "expense value data", tripData);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// // // --------------------- get all Field -----------------------

export async function getAllExpenseRoles(req) {
  try {
    const { organizationId } = req.employee;

    if (!organizationId) {
      return returnFormatter(false, "organizationId is required");
    }

    const selectedEmployeeFields =
      "employeUniqueId employeName email _id branchId departmentId "; // Add more as needed
    const selectedBranchFields = "name city _id"; // Fields from branch
    const selectDepartmentFields = "name";
    // console.log(selectDepartmentFields, "organizationIdorganizationId");

    const data = await expenseRoleAssignmentModel
      .find({ organizationId })
      .populate({
        path: "roleSubmitter.departmentId",
        select: "name",
      })
      .populate({
        path: "roleSubmitter.employeeId",
        select: selectedEmployeeFields,
        level: "submitter",
        populate: [
          { path: "branchId", select: selectedBranchFields },
          { path: "departmentId", select: selectDepartmentFields },
        ],
      })
      // .populate({
      //   path: "roleApprover.L1.departmentId",
      //   select: "name",
      // })
      .populate({
        path: "roleApprover.L1.employeeId",
        select: selectedEmployeeFields,
        populate: [
          { path: "branchId", select: selectedBranchFields },
          { path: "departmentId", select: selectDepartmentFields },
        ],
      })
      // .populate({
      //   path: "roleApprover.L2.departmentId",
      //   select: "name",
      // })
      .populate({
        path: "roleApprover.L2.employeeId",
        select: selectedEmployeeFields,
        populate: [
          { path: "branchId", select: selectedBranchFields },
          { path: "departmentId", select: selectDepartmentFields },
        ],
      })
      // .populate({
      //   path: "roleApprover.L3.departmentId",
      //   select: "name",
      // })
      .populate({
        path: "roleApprover.L3.employeeId",
        select: selectedEmployeeFields,
        populate: [
          { path: "branchId", select: selectedBranchFields },
          { path: "departmentId", select: selectDepartmentFields },
        ],
      })
      // .populate({
      //   path: "roleRemitter.R1.departmentId",
      //   select: "name",
      // })
      .populate({
        path: "roleRemitter.R1.employeeId",
        select: selectedEmployeeFields,
        populate: [
          { path: "branchId", select: selectedBranchFields },
          { path: "departmentId", select: selectDepartmentFields },
        ],
      })
      // .populate({
      //   path: "roleRemitter.R2.departmentId",
      //   select: "name",
      // })
      .populate({
        path: "roleRemitter.R2.employeeId",
        select: selectedEmployeeFields,
        populate: [
          { path: "branchId", select: selectedBranchFields },
          { path: "departmentId", select: selectDepartmentFields },
        ],
      })
      // .populate({
      //   path: "roleRemitter.R3.departmentId",
      //   select: "name",
      // })
      .populate({
        path: "roleRemitter.R3.employeeId",
        select: selectedEmployeeFields,
        populate: [
          { path: "branchId", select: selectedBranchFields },
          { path: "departmentId", select: selectDepartmentFields },
        ],
      })
      .populate({
        path: "createdBy",
        select: selectedEmployeeFields,
        populate: [
          { path: "branchId", select: selectedBranchFields },
          { path: "departmentId", select: selectDepartmentFields },
        ],
      })
      .populate({
        path: "expenseType",
        select: "name",
      })
      .populate({
        path: "departmentId",
        select: "name",
      });

    return {
      status: true,
      message: "Expense roles fetched successfully",
      data,
    };
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// ------------------ get department wise role ---------------------

export async function departmentEmployeeLists(req) {
  try {
    const { organizationId } = req.employee;
    const { departmentName = [], designationName = [] } = req.query;

    if (!organizationId) {
      return returnFormatter(false, "organizationId is required");
    }

    const expenseRoleData = await expenseRoleAssignmentModel.find({
      organizationId,
    });

    // Collect all employee IDs to be excluded
    const excludedEmployeeIds = new Set();

    expenseRoleData.forEach((role) => {
      if (Array.isArray(role.roleSubmitter?.employeeId)) {
        role.roleSubmitter.employeeId.forEach((id) => {
          if (id) excludedEmployeeIds.add(id.toString());
        });
      }

      ["L1", "L2", "L3"].forEach((level) => {
        const empId = role.roleApprover?.[level]?.employeeId;
        if (empId) excludedEmployeeIds.add(empId.toString());
      });

      ["R1", "R2", "R3"].forEach((level) => {
        const empId = role.roleRemitter?.[level]?.employeeId;
        if (empId) excludedEmployeeIds.add(empId.toString());
      });
    });

    // Convert to array of ObjectIds for $nin filter
    const excludedIdsArray = Array.from(excludedEmployeeIds).map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const departmentNames = Array.isArray(departmentName)
      ? departmentName
      : typeof departmentName === "string"
      ? departmentName.split(",").map((d) => d.trim())
      : [];

    const designationNames = Array.isArray(designationName)
      ? designationName
      : typeof designationName === "string"
      ? designationName.split(",").map((d) => d.trim())
      : [];

    const pipeline = [
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(organizationId),
          // _id: { $nin: excludedIdsArray },
        },
      },
      {
        $lookup: {
          from: "newdepartments",
          localField: "departmentId",
          foreignField: "_id",
          as: "department",
        },
      },
      { $unwind: "$department" },
      // Conditionally add department filter if provided
      ...(departmentNames.length > 0
        ? [{ $match: { "department.name": { $in: departmentNames } } }]
        : []),
      {
        $lookup: {
          from: "organizations",
          localField: "organizationId",
          foreignField: "_id",
          as: "organization",
        },
      },
      { $unwind: "$organization" },
      {
        $lookup: {
          from: "newdesignations",
          localField: "designationId",
          foreignField: "_id",
          as: "newdesignationsData",
        },
      },
      {
        $unwind: {
          path: "$newdesignationsData",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Conditionally filter designation names if provided
      ...(designationNames.length > 0
        ? [
            {
              $match: { "newdesignationsData.name": { $in: designationNames } },
            },
          ]
        : []),
      {
        $project: {
          employeName: 1,
          departmentId: {
            _id: "$department._id",
            name: "$department.name",
          },
          organizationId: {
            _id: "$organization._id",
            name: "$organization.name",
          },
          designationId: {
            _id: "$newdesignationsData._id",
            name: "$newdesignationsData.name",
          },
        },
      },
    ];

    const data = await employeModel.aggregate(pipeline);
    return {
      status: true,
      message: "employee roles fetched successfully",
      data,
    };
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// -------------------------------
export async function departmentLists(req) {
  try {
    const { organizationId } = req.employee;
    console.log(organizationId, "organizationId");
    const departments = await newDepartmentModel.aggregate([
      {
        $match: { organizationId: new mongoose.Types.ObjectId(organizationId) },
      },
      {
        $lookup: {
          from: "newdesignations",
          localField: "_id",
          foreignField: "departmentId",
          as: "designations",
        },
      },
      {
        $lookup: {
          from: "departmentbudgets",
          localField: "_id",
          foreignField: "departmentId",
          as: "budget",
        },
      },
      {
        $unwind: {
          path: "$designations",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          description: { $first: "$description" },
          designations: { $push: "$designations" },
          budget: { $first: "$budget" }, // Assumes one budget per department; modify if multiple
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          name: 1,
          designations: {
            _id: 1,
            name: 1,
            status: 1,
          },
          budget: {
            _id: 1,
            allocatedBudget: 1,
            numberOfEmployees: 1,
            status: 1,
          },
        },
      },
    ]);

    return {
      status: true,
      message: "Departments with designations and budgets fetched successfully",
      data: departments,
    };
  } catch (error) {
    console.error(
      "Error fetching departments with designations and budgets:",
      error
    );
    return unknownError(res, error);
  }
}

//--------------------------- setup config ------------------------

export async function addExpenseConfigs(req) {
  try {
    const { organizationId } = req.employee;
    console.log(organizationId, "organizationId");
    const data = await newDepartmentModel
      .find({ organizationId, isSubDepartment: false })
      .select("name");
    return {
      status: true,
      message: "organizationId fetched successfully",
      data,
    };
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// activeInactiveExpenses
export async function activeInactiveExpenses(requestsObject) {
  try {
    const { id, ...levelStatusUpdate } = requestsObject.body;
    const { organizationId } = requestsObject.employee;

    if (!id) {
      return returnFormatter(false, "Role and permission ID is required");
    }

    const record = await expenseRoleAssignmentModel.findOne({ _id: id });

    if (!record) {
      return returnFormatter(false, "Record is not found");
    }

    const levelKey = Object.keys(levelStatusUpdate)[0];
    const levelData = levelStatusUpdate[levelKey];
    const isDeactivating = levelData?.isActive === false;

    let fieldPath = "";
    let currentLevelValue;

    const approverLevels = ["L1", "L2", "L3"];
    const remitterLevels = ["R1", "R2", "R3"];

    if (approverLevels.includes(levelKey)) {
      currentLevelValue = record.roleApprover?.[levelKey];

      if (currentLevelValue === null || currentLevelValue === undefined) {
        return returnFormatter(false, `${levelKey} level is not configured, so no update performed.`);
      }

      // Prevent deactivation if higher levels are active
      if (isDeactivating) {
        const currentIndex = approverLevels.indexOf(levelKey);
        const higherLevels = approverLevels.slice(currentIndex + 1);

        for (const level of higherLevels) {
          const levelObj = record.roleApprover?.[level];
          if (levelObj && levelObj.isActive) {
            return returnFormatter(false, `You cannot inactivate ${levelKey} because ${level} is already active.`);
          }
        }
      }

      fieldPath = `roleApprover.${levelKey}.isActive`;
    }

    else if (remitterLevels.includes(levelKey)) {
      currentLevelValue = record.roleRemitter?.[levelKey];

      if (currentLevelValue === null || currentLevelValue === undefined) {
        return returnFormatter(false, `${levelKey} level is not configured, so no update performed.`);
      }

      // Prevent deactivation if higher levels are active
      if (isDeactivating) {
        const currentIndex = remitterLevels.indexOf(levelKey);
        const higherLevels = remitterLevels.slice(currentIndex + 1);

        for (const level of higherLevels) {
          const levelObj = record.roleRemitter?.[level];
          if (levelObj && levelObj.isActive) {
            return returnFormatter(false, `You cannot inactivate ${levelKey} because ${level} is already active.`);
          }
        }
      }

      fieldPath = `roleRemitter.${levelKey}.isActive`;
    }

    else {
      return returnFormatter(false, "Invalid level key provided");
    }

    const updateObject = {
      [fieldPath]: levelData.isActive,
    };

    const updatedRecord = await expenseRoleAssignmentModel.findByIdAndUpdate(
      id,
      { $set: updateObject },
      { new: true }
    );

    return returnFormatter(true, "Status updated successfully", updatedRecord);

  } catch (error) {
    console.error("Error in activeInactiveExpenses:", error);
    return returnFormatter(false, "An error occurred while updating level status.");
  }
}

