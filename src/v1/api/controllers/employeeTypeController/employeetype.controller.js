import { validationResult } from "express-validator";
import mongoose from "mongoose";
// import { google } from "googleapis";

import {
  success,
  unknownError,
  serverValidation,
  badRequest,
} from "../../formatters/globalResponse.js"

import employeTypeModel from "../../models/employeeType/employeeType.model.js"
import employeeModel from "../../models/employeemodel/employee.model.js"
// import { employeeTypeGoogleSheet } from "./masterGoogleSheet.controller.js";
// import credentials from "../../../../../credential.json" assert { type: "json" };

// ------------------Admin Master Add EmployeType---------------------------------------
export async function employeTypeAdd(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const organizationId = req.employee.organizationId;

    if (!req.body.title || req.body.title.trim() === "") {
      return badRequest(res, "Title is required and cannot be empty");
    }

    const existingEmployeType = await employeTypeModel.findOne({
      title: req.body.title,
      status: "active",
      organizationId,
    });

    if (existingEmployeType) {
      return badRequest(res, "Employee Type with this name already exists");
    }

    const employeTypeDetail = await employeTypeModel.create({
      ...req.body,
      organizationId,
    });

    success(res, "EmployeeType Added Successfully", employeTypeDetail);
    // await employeeTypeGoogleSheet(employeTypeDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}


// ------------------Admin Master employeType "active" or "inactive" updated---------------------------------------
export async function employeTypeActiveOrInactive(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: 'serverValidation',
        errors: errors.array(),
      });
    }

    const { id, status } = req.body;

    if (!id || id.trim() === '') {
      return badRequest(res, 'ID is required and cannot be empty');
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return badRequest(res, 'Invalid ID format');
    }

    const employees = await employeeModel.find({ employeeTypeId: id });

    if (employees.length > 0 && status === 'inactive') {
      return badRequest(
        res,
        'Cannot deactivate Employee Type as it is assigned to existing employees'
      );
    }

    const allowedStatuses = ['active', 'inactive'];
    if (!allowedStatuses.includes(status)) {
      return badRequest(res, "Status must be either 'active' or 'inactive'");
    }

    const updatedEmployeeType = await employeTypeModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedEmployeeType) {
      return badRequest(res, 'Employee Type not found');
    }

    // Optional: update to Google Sheet
    // await employeeTypeGoogleSheet(updatedEmployeeType);

    return success(res, `Employee Type status updated to '${status}'`, updatedEmployeeType);
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

// ------------------Admin Master Update Role updateEmployeType ---------------------------------------
export async function updateEmployeType(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { employeeTypeId, ...updateFields } = req.body;

    if (!mongoose.Types.ObjectId.isValid(employeeTypeId)) {
      return badRequest(res, "Invalid Employee Type ID");
    }

    const existingEmployeType = await employeTypeModel.findById(employeeTypeId);
    if (!existingEmployeType) {
      return badRequest(res, "Employee Type not found");
    }

    const updateData = await employeTypeModel.findByIdAndUpdate(
      employeeTypeId,
      updateFields,
      { new: true }
    );

    // await employeeTypeGoogleSheet(updateData);
    success(res, "Updated Employee Type", updateData);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Admin Master Get All EmployeType---------------------------------------
export async function getAllEmployeType(req, res) {
  try {
    const organizationId = req.employee.organizationId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const employeTypeDetail = await employeTypeModel
      .find({ organizationId })
      .sort({ createdAt: -1 });
    success(res, "Get All EmployeTypeDetail", employeTypeDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}



// ------------------Admin Master Get All EmployeType from Google Sheet ---------------------------------------
export async function getAllEmployeeTypeSheet(req, res) {
  try {
    const spreadsheetId = process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE;
    const sheetName = "EMPLOYEETYPE DETAILS";
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return badRequest(res, "No data found.");
    } else {
      const headers = rows[0];
      const data = rows.slice(1).map((row) => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] !== undefined ? row[index] : null;
        });
        return obj;
      });

      success(res, "Get All EMPLOYEETYPE", data);
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      return badRequest(res, "Invalid sheet name.");
    } else {
      unknownError(res, error.message);
    }
  }
}

// ------------------Delete Employee Type ---------------------------------------
export async function deleteEmployeeType(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { id } = req.query;
    if (!id) {
      return badRequest(res, "ID is required");
    }
    if (!mongoose.isValidObjectId(id)) {
      return badRequest(res, "Invalid ID");
    }

    const employeeTypeData = await employeTypeModel.findByIdAndDelete(id);
    if (!employeeTypeData) {
      return badRequest(res, "EmployeeType not found");
    }

    success(res, "EmployeeType deleted successfully");
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}




export const uploadEmployeetype = async (req, res) => {
  try {
    const { employeeTypes } = req.body;
    const organizationId = req.employee.organizationId;

    if (!Array.isArray(employeeTypes) || employeeTypes.length === 0) {
      return badRequest(res, "Please provide employment types.");
    }

    const results = [];

    for (const entry of employeeTypes) {
      const { title } = entry;

      if (!title || !title.trim()) {
        results.push({ title, status: "failed", reason: "Title is required" });
        continue;
      }

      const existing = await employeTypeModel.findOne({
        title: title.trim(),
        organizationId,
      });

      if (existing) {
        results.push({ title, status: "skipped", reason: "Already exists" });
        continue;
      }

      const data = new employeTypeModel({
        title: title.trim(),
        organizationId: new mongoose.Types.ObjectId(organizationId),
      });

      await data.save();
      results.push({ title, status: "success", _id: data._id });
    }

    return success(res, "Employee types processed", results);
  } catch (error) {
    console.error("uploadEmploymentTypes error:", error.message);
    return unknownError(res, error.message);
  }
};