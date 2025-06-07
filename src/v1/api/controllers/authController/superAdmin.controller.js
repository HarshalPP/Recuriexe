import SuperAdminModel from "../../models/AuthModel/superadmin.model.js";
import Rolemodel from "../../models/RoleModel/role.model.js"
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import bcrypt from "bcrypt"
import {
    success,
    created,
    notFound,
    badRequest,
    unauthorized,
    forbidden,
    serverValidation,
    unknownError,
    validation,
    alreadyExist,
    sendResponse,
    invalid,
    onError
} from "../../../../../src/v1/api/formatters/globalResponse.js"
import mongoose from "mongoose"




// Register the Super Admin //
export const registerSuperAdmin = async (req, res) => {
  try {
    const { userName, email, password, roleId } = req.body;

    if (!userName) return badRequest(res, "Username is required");
    if (!email) return badRequest(res, "Email is required");
    if (!password) return badRequest(res, "Password is required");
    if (!roleId) return badRequest(res, "Role ID is required");


    const existingAdmin = await SuperAdminModel.findOne({ email });
    if (existingAdmin) return badRequest(res, "Email already exists");

    const role = await Rolemodel.findById(roleId);
    if (!role) return badRequest(res, "Role not found");

    // Create new Super Admin
    const newAdmin = new SuperAdminModel({
      userName,
      email,
      password,
      roleId: [role._id], // Stored as ObjectId
    });

    const savedAdmin = await newAdmin.save();

    // Use roleName in token
    const tokenPayload = {
      id: savedAdmin._id,
      role: role.roleName, // from role document
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SUPERADMIN_TOKEN);

    return success(res, {
      message: "Super Admin registered successfully",
      token,
      superAdmin: {
        id: savedAdmin._id,
        userName: savedAdmin.userName,
        email: savedAdmin.email,
        role: role.roleName,
      },
    });
  } catch (error) {
    console.error("Super Admin Registration Error:", error);
   return unknownError(res , error)
  }
};



// Login //
export const loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) return badRequest(res, "Email is required");
    if (!password) return badRequest(res, "Password is required");

    const admin = await SuperAdminModel.findOne({ email }).select("+password");
    if (!admin) return badRequest(res, "Invalid email or password");


    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return badRequest(res, "Invalid email or password");

    // Get role name
    const role = await Rolemodel.findById(admin.roleId[0]);
    const roleName = role?.roleName

    // Create token payload
    const tokenPayload = {
      id: admin._id,
      role: roleName,
    };
    const token = jwt.sign(tokenPayload, process.env.JWT_SUPERADMIN_TOKEN); // No expiration

    return success(res, {
      message: "Login successful",
      token,
      superAdmin: {
        id: admin._id,
        userName: admin.userName,
        email: admin.email,
        role: roleName,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



