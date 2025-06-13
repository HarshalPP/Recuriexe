import {
  success,
  unknownError,
  serverValidation,
  badRequest,
} from "../../formatters/globalResponse.js";
import { validationResult } from "express-validator";
import mongoose from "mongoose";
import roleModel from "../../models/RoleModel/role.model.js";
import employeeModel from "../../models/employeemodel/employee.model.js";
// import { roleGoogleSheet } from "./masterGoogleSheet.controller.js";

const ObjectId = mongoose.Types.ObjectId;

// ------------------Admin Master Add Role---------------------------------------
// export async function roleAdd(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }

//     const { id,  organizationId } = req.employee;
//     if (req.body.roleName) {
//       req.body.roleName = req.body.roleName;
//     }

//     const data = await roleModel.findOne({ roleName: req.body.roleName });
//     if (data) {
//       return badRequest(res, "Role name is already exist");
//     }
//     const roleDetail = await roleModel.create({ ...req.body, organizationId, createdBy: id });
//     return success(res, "Role Added Successful", roleDetail);
//     // await roleGoogleSheet(roleDetail);
//   } catch (error) {
//     console.log(error);
//     unknownError(res, error);
//   }
// }


export async function roleAdd(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { id, organizationId } = req.employee;

    if (req.body.roleName) {
      req.body.roleName = req.body.roleName.trim();
    }

    const existing = await roleModel.findOne({ roleName: req.body.roleName ,organizationId});
    if (existing) {
      return badRequest(res, "Role name already exists");
    }

    // If admin role, set all booleans (including nested) to true
    // if (req.body.roleName?.toLowerCase() === "admin") {
    const role = req.body.roleName?.toLowerCase();
if (role === "admin" || role === "productowner"){
      const roleDefaults = new roleModel(); // create a new empty instance to inspect all keys
      const allKeys = Object.keys(roleDefaults.toObject());

      allKeys.forEach(key => {
        const value = roleDefaults[key];
        if (typeof value === "boolean") {
          req.body[key] = true;
        } else if (typeof value === "object" && value !== null) {
          // check nested objects like jobPostDashboard, jobApplications
          const nested = {};
          Object.keys(value).forEach(subKey => {
            if (typeof value[subKey] === "boolean") {
              nested[subKey] = true;
            }
          });
          if (Object.keys(nested).length > 0) {
            req.body[key] = nested;
          }
        }
      });
    }

    const roleDetail = await roleModel.create({
      ...req.body,
      organizationId,
      createdBy: id,
    });

    return success(res, "Role Added Successful", roleDetail);
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}

// ------------------Admin Master Role "active" or "inactive" updated---------------------------------------

// export async function roleActiveOrInactive(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return serverValidation(res, {
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }

//     const id = req.body.id;
//     const status = req.body.status;

//     if (!id || id.trim() === "") {
//       return badRequest(res, "ID is required and cannot be empty");
//     }

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return badRequest(res, "Invalid ID");
//     }

//     // Fetch the role by ID
//     const role = await roleModel.findById(id);
//     if (!role) {
//       return badRequest(res, "Role not found");
//     }

//    // Check if any employee in the same organization is using this role
//     const isRoleAssigned = await employeeModel.exists({
//       organizationId,
//       roleId: id,
//     });



//     const protectedRoles = ["superadmin", "admin", "user"];
//     const roleName = role.roleName?.toLowerCase();

//     // Prevent inactivating protected roles
//     if (status === "inactive" && protectedRoles.includes(roleName)) {
//       return badRequest(res, `Cannot inactivate '${role.roleName}' role`);
//     }

//     if (status === "active" || status === "inactive") {
//       const roleUpdateStatus = await roleModel.findByIdAndUpdate(
//         { _id: id },
//         { status: status },
//         { new: true }
//       );
//       success(
//         res,
//         `Role ${status.charAt(0).toUpperCase() + status.slice(1)}`,
//         roleUpdateStatus
//       );
//     } else {
//       return badRequest(res, "Status must be 'active' or 'inactive'");
//     }
//   } catch (error) {
//     console.log(error);
//     unknownError(res, error);
//   }
// }

export async function roleActiveOrInactive(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const id = req.body.id;
    const status = req.body.status;

    if (!id || id.trim() === "") {
      return badRequest(res, "ID is required and cannot be empty");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return badRequest(res, "Invalid ID");
    }

    // Fetch the role by ID
    const role = await roleModel.findById(id);
    if (!role) {
      return badRequest(res, "Role not found");
    }

    const { organizationId } = req.employee;

    // Check if any employee in the same organization is using this role
    const isRoleAssigned = await employeeModel.exists({
      organizationId,
      roleId: id,
    });

    if (status === "inactive") {
      const protectedRoles = ["superadmin", "admin", "user"];
      const roleName = role.roleName?.toLowerCase();

      if (protectedRoles.includes(roleName)) {
        return badRequest(res, `Cannot inactivate '${role.roleName}' role`);
      }

      if (isRoleAssigned) {
        return badRequest(res, "Cannot inactivate this role as it is assigned to one or more employees");
      }
    }

    if (status === "active" || status === "inactive") {
      const roleUpdateStatus = await roleModel.findByIdAndUpdate(
        { _id: id },
        { status: status },
        { new: true }
      );
      success(
        res,
        `Role ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        roleUpdateStatus
      );
    } else {
      return badRequest(res, "Status must be 'active' or 'inactive'");
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}


// ------------------Admin Master Update Role Name Role ---------------------------------------

export async function updateRole(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    let { roleId, ...updateFields } = req.body;

    // Check if the role being updated is SuperAdmin
    const existingRole = await roleModel.findById(roleId);
    if (!existingRole) {
      return badRequest(res ,"Role not found" );
    }

    if (existingRole.roleName.toLowerCase() === "superadmin") {
      return badRequest(res , "Cannot update the SuperAdmin role" );
    } 
    // Clean and format the roleName if present
    if (typeof updateFields.roleName === "string") {
      updateFields.roleName = updateFields.roleName.trim();
      const duplicateRole = await roleModel.findOne({
        _id: { $ne: roleId },
        roleName: updateFields.roleName,
        organizationId: existingRole.organizationId
      });

      if (duplicateRole) {
        return badRequest(res, "Role Name Already");
      }
    }
    updateFields.updateBy = req.employee.id

    const updateData = await roleModel
      .findByIdAndUpdate(roleId, updateFields, { new: true })
      .populate("permissions");
   return success(res, "Updated Role", updateData);
    // await roleGoogleSheet(updateData);
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}

// ------------------Admin Master Get All Role---------------------------------------
export async function getAllRole(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const { id,  organizationId } = req.employee;

    const roleDetail = await roleModel
      .find({ organizationId })
      .collation({ locale: "en", strength: 3 })
      .sort({ roleName: 1 })
      .populate("permissions")
      .populate("organizationId","name");
    success(res, "All Roles", roleDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}


//---------------------- role drop donw-----------------------------------------
export async function getRoleDropDown(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const {  organizationId } = req.employee;

    const {status} = req.query

    const roleList = await roleModel.find({ organizationId : new mongoose.Types.ObjectId(organizationId) , status:status?status:'active' }).select('roleName status')

    return success(res, "Role List", roleList);
  } catch (error) {
    console.log(error);
   return unknownError(res, error);
  }
}
// ------------------Admin Master Get Role By Type---------------------------------------
export async function getAllRoleByType(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { roleType } = req.query;
    const roleDetail = await roleModel.find({
      status: "active",
      roleName: roleType,
    });
    success(res, `${roleType} List`, roleDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// -----------------GET ROLE :- "visit" , "collection" List Employee List----------------
export async function getCollectionRoleEmploye(req, res) {
  try {
    const targetRoles = await roleModel.find(
      { roleName: { $in: ["visit", "collection"] } },
      { _id: 1, roleName: 1 }
    );

    if (!targetRoles.length) {
      return badRequest(res, "No matching roles found");
    }

    const roleIds = targetRoles.map((role) => role._id);

    const employees = await employeeModel.find(
      { roleId: { $in: roleIds }, status: "active" },
      { _id: 1, employeName: 1, employeUniqueId: 1 }
    );

    if (!employees.length) {
      return badRequest(res, "No employees found with these roles");
    }

    const response = {
      totalCount: employees.length,
      employees: employees.map((emp) => ({
        _id: emp._id,
        employeeName: emp.employeName,
        employeeUniqueId: emp.employeUniqueId,
      })),
    };

    return success(res, "Employees fetched successfully", response);
  } catch (error) {
    console.error("Error in getEmployeesByRole:", error);
    return unknownError(res, error);
  }
}


export async function roleDetail(req, res) {
  try {

    const { roleId } = req.query;
    if(!roleId){
      return badRequest(res , "role Id required")
    }
    const roleDetail = await roleModel.findById(roleId)
    
   return success(res, `Role Detail`, roleDetail);
  } catch (error) {
    // console.log(error);
   return unknownError(res, error);
  }
}

export async function roleAssignToEmployee(req, res) {
    try {
        const { employeeId } = req.query;
        const { roleId } = req.query;
        // Validate input
        if (!roleId) {
            return badRequest(res, "Role ID is required.");
        }
        const employee = await employeeModel.findById(employeeId);
        if (!employee) {
            return notFound(res, "Employee not found.");
        }
        // Check if the role exists
        const role = await roleModel.findById(roleId);
        if (!role) {
            return notFound(res, "Role not found.");
        }
        employee.roleId = roleId; // Assign the role
        await employee.save();
        return success(res,  "Role assigned successfully.", employee);
    } catch (error) {
        console.error("Error assigning role:", error);
        return unknownError(res, error);
    }
}