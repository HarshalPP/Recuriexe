const {
  success,
  unknownError,
  serverValidation,
  badRequest,
} = require("../../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const employeTypeModel = require("../../model/adminMaster/employeType.model");
const { employeeTypeGoogleSheet } = require("./masterGoogleSheet.controller");
const { google } = require("googleapis");
const credentials = require("../../../../../credential.json");
const employeeModel = require("../../model/adminMaster/employe.model");

// ------------------Admin Master Add EmployeType---------------------------------------
async function employeTypeAdd(req, res) {
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
    const existingEmployeType = await employeTypeModel.findOne({
      title: req.body.title,
      status: "active",
    });

    if (existingEmployeType) {
      return badRequest(res, "Employee Type with this name already exists");
    }

    const employeTypeDetail = await employeTypeModel.create(req.body);
    success(res, "EmployeeType Added Successfully", employeTypeDetail);
    await employeeTypeGoogleSheet(employeTypeDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Admin Master employeType "active" or "inactive" updated---------------------------------------
async function employeTypeActiveOrInactive(req, res) {
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

      const employee = await employeeModel.find({ employeeTypeId: id });
      if (employee.length > 0) {
        return badRequest(res, "Cannot deactive Employee Type as it has employees");
      } 

      if (status == "active") {
        const employeTypeUpdateStatus =
          await employeTypeModel.findByIdAndUpdate(
            { _id: id },
            { status: "active" },
            { new: true }
          );
        await employeeTypeGoogleSheet(employeTypeUpdateStatus);

        success(res, "EmployeeType Active", employeTypeUpdateStatus);
      } else if (status == "inactive") {
        const employeTypeUpdateStatus =
          await employeTypeModel.findByIdAndUpdate(
            { _id: id },
            { status: "inactive" },
            { new: true }
          );
        await employeeTypeGoogleSheet(employeTypeUpdateStatus);

        success(res, "EmployeeType inactive", employeTypeUpdateStatus);
      } else {
        return badRequest(res, "Status must be 'active' or 'inactive'");
      }
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Admin Master Update Role updateEmployeType ---------------------------------------
async function updateEmployeType(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    let { employeeTypeId, ...updateFields } = req.body;

    if (!mongoose.Types.ObjectId.isValid(employeeTypeId)) {
      return badRequest(res, "Invalid Employee Type ID");
    }

    // Fetch the current employee type data
    const existingEmployeType = await employeTypeModel.findById(employeeTypeId);
    if (!existingEmployeType) {
      return badRequest(res, "Employee Type not found");
    }

    // Check if the title is being updated and is already in use (case-insensitively)
    if (
      updateFields.title &&
      updateFields.title !== existingEmployeType.title
    ) {
      const isTitleExists = await employeTypeModel.findOne({
        title: { $regex: `^${updateFields.title}$`, $options: "i" }, // Case-insensitive check
      });

      if (isTitleExists) {
        return badRequest(res, "Title already exists");
      }
    }

    // Update the data if validations pass
    const updateData = await employeTypeModel.findByIdAndUpdate(
      employeeTypeId,
      updateFields,
      { new: true }
    );

    await employeeTypeGoogleSheet(updateData);

    success(res, "Updated Employee Type", updateData);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Admin Master Get All EmployeType---------------------------------------
async function getAllEmployeType(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const employeTypeDetail = await employeTypeModel
      .find({ status: "active" })
      .sort({ createdAt: -1 });
    success(res, "Get All EmployeTypeDetail", employeTypeDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Admin Master Get All EmployeType---------------------------------------
async function getAllEmployeeTypeSheet(req, res) {
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
        let obj = {};
        headers.forEach((header, index) => {
          // Ensure that even empty fields are included
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

async function deleteEmployeeType(req, res) {
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
      return notFound(res, "EmployeeType not found");
    }
    success(res, "EmployeeType deleted successfully");
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

module.exports = {
  employeTypeAdd,
  employeTypeActiveOrInactive,
  updateEmployeType,
  getAllEmployeType,
  getAllEmployeeTypeSheet,
  deleteEmployeeType,
};
