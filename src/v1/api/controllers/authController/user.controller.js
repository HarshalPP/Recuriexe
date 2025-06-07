import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import {
  success,
  badRequest,
  serverValidation,
  unknownError,
  unauthorized,
} from "../../formatters/globalResponse.js";
import employeModel from "../../models/employeemodel/employee.model.js";
import departmentModel from "../../models/deparmentModel/deparment.model.js";
import designationModel from "../../models/designationModel/designation.model.js";
import workLocationModel from "../../models/worklocationModel/worklocation.model.js";
import costCenterModel from "../../models/costcenterModel/costcenter.model.js";
import employmentTypeModel from "../../models/employeementTypemodel/employeementtype.model.js";
import employeTypeModel from "../../models/employeeType/employeeType.model.js";
import roleModel from "../../models/RoleModel/role.model.js";
import branchModel from "../../models/branchModel/branch.model.js";
import taskModel from "../../models/taskManagement/task.model.js";
import mongoose from "mongoose";

export const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { userName, password, roleId } = req.body;

    // Validate if all required fields are present
    if (!userName || !password || !roleId) {
      return badRequest(res, "Username, password and roleId are required.");
    }

    // Check if the role is "user"
    const role = await roleModel.findById(roleId);
    if (!role) {
      return badRequest(res, "Role does not exist.");
    }

    if (role.roleName.toLowerCase() !== "user") {
      return badRequest(res, "Role must be 'user'.");
    }

    // Check if user already exists
    const existingUser = await employeModel.findOne({ userName });
    if (existingUser) {
      return badRequest(res, "Username already exists.");
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Replace password in the body with hashed password
    req.body.password = hashedPassword;

    // Create employee
    const newEmployee = await employeModel.create(req.body);

    return success(res, "Employee created successfully", newEmployee);
  } catch (error) {
    console.error("Employee register error:", error);
    return unknownError(res, error);
  }
};
