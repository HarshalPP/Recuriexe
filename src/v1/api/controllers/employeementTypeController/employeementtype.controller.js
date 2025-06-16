import { success, unknownError, serverValidation, badRequest } from "../../formatters/globalResponse.js"
import { validationResult } from "express-validator";
import mongoose from "mongoose";
import employmentTypeModel from "../../models/employeementTypemodel/employeementtype.model.js"
// import { employmentTypeGoogleSheet } from "./masterGoogleSheet.controller.js";
// import { google } from "googleapis";
// import credentials from "../../../../../credential.json" assert { type: "json" };
import employeeModel from "../../models/employeemodel/employee.model.js"
import jobPostModel from "../../models/jobPostModel/jobPost.model.js"


// ------------------Admin Master Add EmploymentType---------------------------------------
export async function employmentTypeAdd(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { title, punchOutsideBranch } = req.body;
    const organizationId = req.employee.organizationId;

    if (!title || title.trim() === "") {
      return badRequest(res, "Title is required and cannot be empty");
    }
    if (!punchOutsideBranch) {
      return badRequest(res, "Punch Outside Branch is required and cannot be empty");
    }

    const existingEmployeType = await employmentTypeModel.findOne({ title, status: "active" , organizationId});
    const validModes = ["allowed", "notAllowed"];
    if (!validModes.includes(punchOutsideBranch)) {
      return badRequest(res, "Punch Outside Branch must be allowed or notAllowed");
    }
    if (existingEmployeType) {
      return badRequest(res, "Employment Type with this name already exists");
    }

        const employmentTypeDetail = await employmentTypeModel.create({
      ...req.body,
      organizationId,
    });
    success(res, "EmploymentType Added Successfully", employmentTypeDetail);
    // await employmentTypeGoogleSheet(employmentTypeDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Admin Master employmentType "active" or "inactive" updated---------------------------------------
export async function employmentTypeActiveOrInactive(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { id, status } = req.body;
    if (!id || id.trim() === "") {
      return badRequest(res, "ID is required and cannot be empty");
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return badRequest(res, "Invalid ID");
    }

    const employee = await employeeModel.find({ employementTypeId: id });
    if (employee.length > 0) {
      return badRequest(res, "Cannot deactivate Employment Type as it has employees");
    }

    if (!["active", "inactive"].includes(status)) {
      return badRequest(res, "Status must be 'active' or 'inactive'");
    }

    const updatedStatus = await employmentTypeModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    success(res, `EmploymentType ${status}`, updatedStatus);
    // await employmentTypeGoogleSheet(updatedStatus);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Admin Master Update Employment Type---------------------------------------
export async function updateEmploymentType(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    let { employementTypeId, ...updateFields } = req.body;
    if (!mongoose.Types.ObjectId.isValid(employementTypeId)) {
      return badRequest(res, "Invalid Employment Type ID");
    }

    const { title, punchOutsideBranch } = req.body;

    if (!title || title.trim() === "") {
      return badRequest(res, "Title is required and cannot be empty");
    }

    if (!punchOutsideBranch) {
      return badRequest(res, "Punch Outside Branch is required and cannot be empty");
    }

    const validModes = ["allowed", "notAllowed"];
    if (!validModes.includes(punchOutsideBranch)) {
      return badRequest(res, "Punch Outside Branch must be allowed or notAllowed");
    }

    const existingEmploymentType = await employmentTypeModel.findById(employementTypeId);
    if (!existingEmploymentType) {
      return badRequest(res, "Employment Type not found");
    }

    if (
      updateFields.title &&
      updateFields.title !== existingEmploymentType.title
    ) {
      const isTitleExists = await employmentTypeModel.findOne({
        title: { $regex: `^${updateFields.title}$`, $options: "i" },
      });

      if (isTitleExists) {
        return badRequest(res, "Title already exists");
      }
    }

    const updateData = await employmentTypeModel.findByIdAndUpdate(
      employementTypeId,
      updateFields,
      { new: true }
    );

    success(res, "Updated EmploymentType", updateData);
    // await employmentTypeGoogleSheet(updateData);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Admin Master Get All EmploymentType---------------------------------------
export async function getAllEmploymentType(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const organizationId = req.query.organizationId
    const employmentTypeDetail = await employmentTypeModel.find({organizationId});
    success(res, "Get All EmploymentTypeDetail", employmentTypeDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}


// ------------------Admin Master Get All EmploymentType---------------------------------------
export async function getAllEmploymentTypeFromJobPost(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const organizationId = req.query.organizationId
    
    const jobPostId =  await jobPostModel.find({organizationId :  new mongoose.Types.ObjectId(organizationId)}).select("_id employmentTypeId");
    
     const employementTypeIds = [...new Set(jobPostId.map(d => d.employmentTypeId).filter(Boolean))];

    const employmentTypeDetail = await employmentTypeModel.find({ _id: { $in: employementTypeIds },});
    success(res, "Get All EmploymentTypeDetail", employmentTypeDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
// ------------------Admin Master Get All EmploymentType---------------------------------------
export async function getAllListEmploymentType(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const organizationId = req.employee.organizationId;
    const employmentTypeDetail = await employmentTypeModel.find({organizationId});
    success(res, "Get All EmploymentTypeDetail", employmentTypeDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
// ------------------Admin Master Get EmploymentType Sheet from Google Sheets---------------------------------------
export async function getAllEmploymentTypeSheet(req, res) {
  try {
    const spreadsheetId = process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE;
    const sheetName = "EMPLOYMENTTYPE DETAILS";

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
        let obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] !== undefined ? row[index] : null;
        });
        return obj;
      });

      success(res, "Get All EMPLOYMENT TYPE", data);
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      return badRequest(res, "Invalid sheet name.");
    } else {
      unknownError(res, error.message);
    }
  }
}

// ------------------Admin Master Delete EmploymentType---------------------------------------
export async function deleteEmploymentType(req, res) {
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

    const employmentTypeData = await employmentTypeModel.findByIdAndDelete(id);
    if (!employmentTypeData) {
      return badRequest(res, "EmploymentType not found");
    }

    success(res, "EmploymentType deleted successfully");
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
