const {
  success,
  unknownError,
  serverValidation,
  badRequest,
} = require("../../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const employmentTypeModel = require("../../model/adminMaster/employmentType.model");
const { employmentTypeGoogleSheet } = require("./masterGoogleSheet.controller");
const { google } = require("googleapis");
const credentials = require("../../../../../credential.json");
const employeeModel = require("../../model/adminMaster/employe.model");

// ------------------Admin Master Add EmployementType---------------------------------------
async function employmentTypeAdd(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    if (!req.body.title || req.body.title.trim() === "") {
      return badRequest(res, "Title is required and cannot be empty");
    }
    if (!req.body.punchOutsideBranch ) {
      return badRequest(res, "Punch Outside Branch is required and cannot be empty");
    }
    const existingEmployeType = await employmentTypeModel.findOne({
      title: req.body.title,
      status: "active",
    });
    const validModes = ["allowed", "notAllowed"];
    if (!validModes.includes(req.body.punchOutsideBranch)) {
      return badRequest(res, "Punch Outside Branch must be allowed or notAllowed");
    }
    if (existingEmployeType) {
      return badRequest(res, "Employment Type with this name already exists");
    }
    const employmentTypeDetail = await employmentTypeModel.create(req.body);
    success(res, "EmploymentType Added Successfully", employmentTypeDetail);
    await employmentTypeGoogleSheet(employmentTypeDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Admin Master employementType "active" or "inactive" updated---------------------------------------
async function employmentTypeActiveOrInactive(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    } else {
      const id = req.body.id;
      const status = req.body.status;
      if (!id || id.trim() === "") {
        return badRequest(res, "ID is required and cannot be empty");
      }
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return badRequest(res, "Invalid ID");
      }
      const employee = await employeeModel.find({ employementTypeId: id });
      if (employee.length > 0) {
        return badRequest(res, "Cannot deactive Employement Type as it has employees");
      } 
      if (status == "active") {
        const employmentTypeUpdateStatus =
          await employmentTypeModel.findByIdAndUpdate(
            { _id: id },
            { status: "active" },
            { new: true }
          );
        success(res, "EmploymentType Active", employmentTypeUpdateStatus);
        await employmentTypeGoogleSheet(employmentTypeUpdateStatus);
      } else if (status == "inactive") {
        const employmentTypeUpdateStatus =
          await employmentTypeModel.findByIdAndUpdate(
            { _id: id },
            { status: "inactive" },
            { new: true }
          );
        success(res, "EmploymentType inactive", employmentTypeUpdateStatus);
        await employmentTypeGoogleSheet(employmentTypeUpdateStatus);
      } else {
        return badRequest(res, "Status must be 'active' or 'inactive'");
      }
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Admin Master Update Role updateEmployment ---------------------------------------
async function updateEmploymentType(req, res) {
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
      return badRequest(res, "Invalid Employement Type ID");
    }
    if (!req.body.title || req.body.title.trim() === "") {
      return badRequest(res, "Title is required and cannot be empty");
    }
    if (!req.body.punchOutsideBranch ) {
      return badRequest(res, "Punch Outside Branch is required and cannot be empty");
    }
    const validModes = ["allowed", "notAllowed"];
    if (!validModes.includes(req.body.punchOutsideBranch)) {
      return badRequest(res, "Punch Outside Branch must be allowed or notAllowed");
    }
    // Fetch the current employee type data
    const existingEmploymentType = await employmentTypeModel.findById(
      employementTypeId
    );
    if (!existingEmploymentType) {
      return badRequest(res, "Employment Type not found");
    }

    if (
      updateFields.title &&
      updateFields.title !== existingEmploymentType.title
    ) {
      const isTitleExists = await employmentTypeModel.findOne({
        title: { $regex: `^${updateFields.title}$`, $options: "i" }, // Case-insensitive check
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
    // console.log(updateData,'update data')
    success(res, "Updated EmploymentType", updateData);
    await employmentTypeGoogleSheet(updateData);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Admin Master Get All EmploymentType---------------------------------------
async function getAllEmploymentType(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const employmentTypeDetail = await employmentTypeModel.find({
      status: "active",
    });
    success(res, "Get All EmploymentTypeDetail", employmentTypeDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
// ------------------Admin Master Get All EmploymentType sheet ---------------------------------------
async function getAllEmploymentTypeSheet(req, res) {
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
          // Ensure that even empty fields are included
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

async function deleteEmploymentType(req, res) {
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
      return notFound(res, "EmploymentType not found");
    }
    success(res, "EmploymentType deleted successfully");
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

module.exports = {
  employmentTypeAdd,
  employmentTypeActiveOrInactive,
  updateEmploymentType,
  getAllEmploymentType,
  getAllEmploymentTypeSheet,
  deleteEmploymentType,
};
