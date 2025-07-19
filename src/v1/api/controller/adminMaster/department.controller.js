const {
  success,
  unknownError,
  serverValidation,
  notFound,
  badRequest,
} = require("../../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const departmentModel = require("../../model/adminMaster/department.model");
const workLocationModel = require("../../model/adminMaster/workLocation.model");
const { departmentGoogleSheet } = require("./masterGoogleSheet.controller");
const { google } = require("googleapis");
const credentials = require("../../../../../credential.json");

// ------------------Admin Master Add Department---------------------------------------
// async function departmentAdd(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }
//     if (req.body.departmentName) {
//       req.body.departmentName = req.body.departmentName;
//     }
//     const companyExists = await workLocationModel.findOne({
//       companyId: new ObjectId(req.body.companyId),
//     });

//     if (!companyExists) {
//       return notFound(res, "Invalid companyId provided.");
//     }

//     const branchExists = await workLocationModel.findOne({
//       companyId: new ObjectId(req.body.companyId),
//       branchId: new ObjectId(req.body.branchId),
//     });

//     if (!branchExists) {
//       return notFound(
//         res,
//         "Invalid branchId provided for the given companyId."
//       );
//     }
//     const workLocationExists = await workLocationModel.findOne({
//       companyId: new ObjectId(req.body.companyId),
//       branchId: new ObjectId(req.body.branchId),
//       _id: new ObjectId(req.body.workLocationId),
//     });

//     if (!workLocationExists) {
//       return notFound(
//         res,
//         "Invalid WorkLoactionId provided for the given BranchId."
//       );
//     }

//     const department = await departmentModel.findOne({
//       departmentName: req.body.departmentName,
//       workLocationId: new ObjectId(req.body.workLocationId),
//     });
//     if (department) {
//       return badRequest(res, "Department Already Exist With WorkLocation");
//     }
//     const departmentDetail = await departmentModel.create(req.body);
//     success(res, "Department Added Successful", departmentDetail);
//     await departmentGoogleSheet(departmentDetail);
//   } catch (error) {
//     console.log(error);
//     unknownError(res, error);
//   }
// }

async function departmentAdd(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    if (req.body.departmentName) {
      req.body.departmentName = req.body.departmentName;
    }

    const department = await departmentModel.findOne({
      departmentName: req.body.departmentName,
    });
    if (department) {
      return badRequest(res, "Department Already Exist With Same Name");
    }
    const departmentDetail = await departmentModel.create(req.body);
    success(res, "Department Added Successful", departmentDetail);
    await departmentGoogleSheet(req.body);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
// ------------------Admin Master Department "active" or "inactive" updated---------------------------------------
async function departmentActiveOrInactive(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    } else {
      const { id } = req.body;
      const status = req.body.status;
      if (!id || id.trim() === "") {
        return badRequest(res, "ID is required and cannot be empty");
      }
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return badRequest(res, "Invalid ID");
      }
      if (status == "active") {
        const departmentStatusUpdate = await departmentModel.findByIdAndUpdate(
          { _id: id },
          { status: "active" },
          { new: true }
        );
        success(res, "Department Active", departmentStatusUpdate);
      } else if (status == "inactive") {
        const departmentStatusUpdate = await departmentModel.findByIdAndUpdate(
          { _id: id },
          { status: "inactive" },
          { new: true }
        );
        success(res, "Department inactive", departmentStatusUpdate);
      } else {
        return badRequest(res, "Status must be 'active' or 'inactive'");
      }
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Admin Master Update  DepartmentName ---------------------------------------
async function updateDepartment(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    let { departmentId, ...updateFields } = req.body;
    if (typeof updateFields.departmentName === "string") {
      updateFields.departmentName = updateFields.departmentName
        .trim()
        .toLowerCase();
    }
    if (!departmentId || departmentId.trim() === "") {
      return badRequest(res, "Please Select departmentId");
    }

    const departmentDetail = await departmentModel.findById({
      _id: new ObjectId(departmentId),
    });
    if (!departmentDetail) {
      return badRequest(res, "departmentId  Not Found");
    }

    const updateData = await departmentModel.findByIdAndUpdate(
      departmentId,
      updateFields,
      { new: true }
    );
    //  console.log('update data',req.body)
    success(res, "Updated Department", updateData);
    await departmentGoogleSheet(updateData);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Admin Master Get All Department By Work Location Id---------------------------------------
async function departmentByworkLocationId(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const departmentDetail = await departmentModel.aggregate([
      {
        $match: {
          workLocationId: new ObjectId(req.params.workLocationId),
          status: "active",
        },
      },
      {
        $lookup: {
          from: "companies",
          localField: "companyId",
          foreignField: "_id",
          as: "companyDetail",
        },
      },
      {
        $project: {
          "companyDetail.__v": 0,
          "companyDetail.createdAt": 0,
          "companyDetail.updatedAt": 0,
        },
      },
      {
        $lookup: {
          from: "branches",
          localField: "branchId",
          foreignField: "_id",
          as: "branchDetail",
        },
      },
      {
        $project: {
          "branchDetail.__v": 0,
          "branchDetail.createdAt": 0,
          "branchDetail.updatedAt": 0,
          "branchDetail.companyId": 0,
          "branchDetail.branchId": 0,
        },
      },
      {
        $lookup: {
          from: "worklocations",
          localField: "workLocationId",
          foreignField: "_id",
          as: "worklocationDetail",
        },
      },
      {
        $project: {
          "worklocationDetail.__v": 0,
          "worklocationDetail.createdAt": 0,
          "worklocationDetail.updatedAt": 0,
          "worklocationDetail.companyId": 0,
          "worklocationDetail.branchId": 0,
        },
      },
    ]);

    success(res, "Get All Department", departmentDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Admin Master Get All Department---------------------------------------
async function getAllDepartment(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const departmentDetail = await departmentModel.aggregate([
      { $match: { status: "active" } },
      {
        $lookup: {
          from: "companies",
          localField: "companyId",
          foreignField: "_id",
          as: "companyDetail",
        },
      },
      {
        $project: {
          "companyDetail.__v": 0,
          "companyDetail.createdAt": 0,
          "companyDetail.updatedAt": 0,
        },
      },
      {
        $lookup: {
          from: "branches",
          localField: "branchId",
          foreignField: "_id",
          as: "branchDetail",
        },
      },
      {
        $project: {
          "branchDetail.__v": 0,
          "branchDetail.createdAt": 0,
          "branchDetail.updatedAt": 0,
          "branchDetail.companyId": 0,
          "branchDetail.branchId": 0,
        },
      },
      {
        $lookup: {
          from: "worklocations",
          localField: "workLocationId",
          foreignField: "_id",
          as: "worklocationDetail",
        },
      },
      {
        $project: {
          "worklocationDetail.__v": 0,
          "worklocationDetail.createdAt": 0,
          "worklocationDetail.updatedAt": 0,
          "worklocationDetail.companyId": 0,
          "worklocationDetail.branchId": 0,
        },
      },
    ]);

    success(res, "Get All Department", departmentDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
//-----------------------Delete department-----------------------------

async function getAllDepartmentSheet(req, res) {
  try {
    const spreadsheetId = process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE;
    const sheetName = "DEPARTMENT DETAILS";
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

      success(res, "Get All Department", data);
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      return badRequest(res, "Invalid sheet name.");
    } else {
      unknownError(res, error.message);
    }
  }
}

//-----------------------Delete department-----------------------------
async function deleteDepartment(req, res) {
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
    const departmentData = await departmentModel.findByIdAndDelete(id);
    if (!departmentData) {
      return notFound(res, "Department not found");
    }
    success(res, "Department deleted successfully");
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

module.exports = {
  departmentAdd,
  departmentActiveOrInactive,
  updateDepartment,
  departmentByworkLocationId,
  getAllDepartment,
  getAllDepartmentSheet,
  deleteDepartment,
};
