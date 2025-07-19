const {
  success,
  unknownError,
  serverValidation,
  badRequest,
} = require("../../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const costCenterModel = require("../../model/adminMaster/costCenter.model");
const { costCenterGoogleSheet } = require("./masterGoogleSheet.controller");
const { google } = require("googleapis");
const credentials = require("../../../../../credential.json");
// ------------------Admin Master Add Cost Center---------------------------------------
async function costCenterAdd(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    if (req.body.title) {
      req.body.title = req.body.title;
    }
    // const costCenter = await costCenterModel.findOne({title:req.body.title})
    // if(costCenter){
    //    return badRequest(res, "Cost Center Name Already Added")
    // }
    const costCenterDetail = await costCenterModel.create(req.body);
    success(res, "Cost Center Added Successful", costCenterDetail);
    await costCenterGoogleSheet(costCenterDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Admin Master Cost Center "active" or "inactive" updated---------------------------------------
async function costCenterActiveOrInactive(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    } else {
      const { id } = req.body;
      if (!id || id.trim() === "") {
        return badRequest(res, "ID is required and cannot be empty");
      }
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return badRequest(res, "Invalid ID");
      }
      const status = req.body.status;
      if (status == "active") {
        const costCenterUpdateStatus = await costCenterModel.findByIdAndUpdate(
          { _id: id },
          { status: "active" },
          { new: true }
        );
        success(res, "costCenter Active", costCenterUpdateStatus);
      } else if (status == "inactive") {
        const costCenterUpdateStatus = await costCenterModel.findByIdAndUpdate(
          { _id: id },
          { status: "inactive" },
          { new: true }
        );
        success(res, "costCenter inactive", costCenterUpdateStatus);
      } else {
        return badRequest(res, "Status must be 'active' or 'inactive'");
      }
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Admin Master Update Role Cost Center ---------------------------------------
async function updateCostCenter(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    let { costCenterId, ...updateFields } = req.body;
    if (typeof updateFields.title === "string") {
      updateFields.title = updateFields.title.trim().toLowerCase();
    }
    const updateData = await costCenterModel.findByIdAndUpdate(
      costCenterId,
      updateFields,
      { new: true }
    );
    // console.log(updateData,'update data')
    success(res, "Updated Cost Center ", updateData);
    await costCenterGoogleSheet(updateData);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Admin Master Get All Cost Center---------------------------------------
async function getAllCostCenter(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const costCenterDetail = await costCenterModel.find({ status: "active" });
    success(res, "Get All costCenterDetail", costCenterDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
// ------------------Admin Master Get All Cost Center from sheet---------------------------------------
async function getAllCostCenterSheet(req, res) {
  try {
    const spreadsheetId = process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE;
    const sheetName = "COST CENTER DETAILS";
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

      success(res, "Get All COST CENTER", data);
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      return badRequest(res, "Invalid sheet name.");
    } else {
      unknownError(res, error.message);
    }
  }
}

async function deleteCostCenter(req, res) {
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
    const costCenterData = await costCenterModel.findByIdAndDelete(id);
    if (!costCenterData) {
      return notFound(res, "CostCenter not found");
    }
    success(res, "CostCenter deleted successfully");
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

module.exports = {
  costCenterAdd,
  costCenterActiveOrInactive,
  updateCostCenter,
  getAllCostCenter,
  getAllCostCenterSheet,
  deleteCostCenter,
};
