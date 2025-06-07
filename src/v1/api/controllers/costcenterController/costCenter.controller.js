import { validationResult } from "express-validator";
import mongoose from "mongoose";
// import { google } from "googleapis";
// import credentials from "../../../../../credential.json" assert { type: "json" };

import {
  success,
  unknownError,
  serverValidation,
  badRequest,
  notFound,
} from "../../formatters/globalResponse.js"

import costCenterModel from "../../models/costcenterModel/costcenter.model.js"
// import { costCenterGoogleSheet } from "./masterGoogleSheet.controller.js";

// ------------------Admin Master Add Cost Center---------------------------------------
export const costCenterAdd = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const costCenterDetail = await costCenterModel.create(req.body);
    success(res, "Cost Center Added Successful", costCenterDetail);
    // await costCenterGoogleSheet(costCenterDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
};

// ------------------Admin Master Cost Center "active" or "inactive" updated---------------------------------------
export const costCenterActiveOrInactive = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { id, status } = req.body;

    if (!id?.trim()) return badRequest(res, "ID is required and cannot be empty");
    if (!mongoose.Types.ObjectId.isValid(id)) return badRequest(res, "Invalid ID");

    if (!["active", "inactive"].includes(status)) {
      return badRequest(res, "Status must be 'active' or 'inactive'");
    }

    const costCenterUpdateStatus = await costCenterModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    success(res, `CostCenter ${status}`, costCenterUpdateStatus);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
};

// ------------------Admin Master Update Cost Center ---------------------------------------
export const updateCostCenter = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { costCenterId, ...updateFields } = req.body;

    if (typeof updateFields.title === "string") {
      updateFields.title = updateFields.title.trim().toLowerCase();
    }

    const updateData = await costCenterModel.findByIdAndUpdate(
      costCenterId,
      updateFields,
      { new: true }
    );

    success(res, "Updated Cost Center", updateData);
    // await costCenterGoogleSheet(updateData);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
};

// ------------------Admin Master Get All Cost Center---------------------------------------
export const getAllCostCenter = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const costCenterDetail = await costCenterModel.find({ status: "active" });
    success(res, "Get All Cost Centers", costCenterDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
};

// ------------------Admin Master Get All Cost Center from sheet---------------------------------------
export const getAllCostCenterSheet = async (req, res) => {
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
    }

    const headers = rows[0];
    const data = rows.slice(1).map((row) => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] !== undefined ? row[index] : null;
      });
      return obj;
    });

    success(res, "Get All COST CENTER", data);
  } catch (error) {
    if (error.response?.status === 400) {
      return badRequest(res, "Invalid sheet name.");
    }
    unknownError(res, error.message);
  }
};

// ------------------Admin Master Delete Cost Center---------------------------------------
export const deleteCostCenter = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { id } = req.query;

    if (!id) return badRequest(res, "ID is required");
    if (!mongoose.isValidObjectId(id)) return badRequest(res, "Invalid ID");

    const costCenterData = await costCenterModel.findByIdAndDelete(id);
    if (!costCenterData) return notFound(res, "CostCenter not found");

    success(res, "CostCenter deleted successfully");
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
};
