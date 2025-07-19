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
const designationModel = require("../../model/adminMaster/designation.model");
const departmentModel = require("../../model/adminMaster/department.model");
const { designationGoogleSheet } = require("./masterGoogleSheet.controller");
const { google } = require("googleapis");
const credentials = require("../../../../../credential.json");
// ------------------Admin Master Add Designation---------------------------------------
async function designationAdd(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    if (req.body.designationName) {
      req.body.designationName = req.body.designationName;
    }
    const companyExists = await departmentModel.findOne({
      companyId: new ObjectId(req.body.companyId),
    });

    if (!companyExists) {
      return notFound(res, "Invalid companyId provided.");
    }

    const branchExists = await departmentModel.findOne({
      companyId: new ObjectId(req.body.companyId),
      branchId: new ObjectId(req.body.branchId),
    });
    if (!branchExists) {
      return notFound(
        res,
        "Invalid branchId provided for the given companyId."
      );
    }
    const workLocationExists = await departmentModel.findOne({
      companyId: new ObjectId(req.body.companyId),
      branchId: new ObjectId(req.body.branchId),
      workLocationId: new ObjectId(req.body.workLocationId),
    });

    if (!workLocationExists) {
      return notFound(
        res,
        "Invalid WorkLoactionId provided for the given BranchId."
      );
    }
    const departmentExists = await departmentModel.findOne({
      companyId: new ObjectId(req.body.companyId),
      branchId: new ObjectId(req.body.branchId),
      workLocationId: new ObjectId(req.body.workLocationId),
      _id: new ObjectId(req.body.departmentId),
    });

    if (!departmentExists) {
      return notFound(
        res,
        "Invalid departmentId provided for the given WorkLocationId."
      );
    }
    const designation = await designationModel.findOne({
      designationName: req.body.designationName,
      departmentId: new ObjectId(req.body.departmentId),
    });
    if (designation) {
      return badRequest(res, "Designation Already Exist With Department");
    }
    const designationDetail = await designationModel.create(req.body);
    success(res, "Designation Added Successful", designationDetail);
    await designationGoogleSheet(designationDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Admin Master Designation "active" or "inactive" updated---------------------------------------
async function designationActiveOrInactive(req, res) {
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
        const designationStatusUpdate =
          await designationModel.findByIdAndUpdate(
            { _id: id },
            { status: "active" },
            { new: true }
          );
        success(res, "Designation Active", designationStatusUpdate);
      } else if (status == "inactive") {
        const designationStatusUpdate =
          await designationModel.findByIdAndUpdate(
            { _id: id },
            { status: "inactive" },
            { new: true }
          );
        success(res, "Designation inactive", designationStatusUpdate);
      } else {
        return badRequest(res, "Status must be 'active' or 'inactive'");
      }
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Admin Master Update  Designation Title ---------------------------------------
async function updateDesignation(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    let { designationId, ...updateFields } = req.body;
    if (typeof updateFields.designationName === "string") {
      updateFields.designationName = updateFields.designationName
        .trim()
        .toLowerCase();
    }

    if (!designationId || designationId.trim() === "") {
      return badRequest(res, "Please Select designationId");
    }

    const designationDetail = await designationModel.findById({
      _id: new ObjectId(designationId),
    });
    if (!designationDetail) {
      return badRequest(res, "designationId  Not Found");
    }

    const updateData = await designationModel.findByIdAndUpdate(
      designationId,
      updateFields,
      { new: true }
    );
    success(res, "Updated Designation", updateData);
    await designationGoogleSheet(updateData);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Admin Master Get All Designation By Department Id---------------------------------------
async function designationByDepartmentId(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const designationtDetail = await designationModel.aggregate([
      {
        $match: {
          departmentId: new ObjectId(req.params.departmentId),
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
          from: "departments",
          localField: "departmentId",
          foreignField: "_id",
          as: "departmentDetail",
        },
      },
      {
        $project: {
          "departmentDetail.__v": 0,
          "departmentDetail.createdAt": 0,
          "departmentDetail.updatedAt": 0,
          "departmentDetail.workLocationId": 0,
          "departmentDetail.companyId": 0,
          "departmentDetail.branchId": 0,
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

    success(res, "Get Designation Detail", designationtDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Admin Master Get All Designation---------------------------------------
// async function getAllDesignation(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }
//     const designationtDetail = await designationModel.aggregate([
//       {
//           $lookup: {
//               from : "companies",
//               localField:"companyId",
//               foreignField:"_id",
//               as:"companyDetail"
//           }
//       },
//       {
//           $project:{
//                "companyDetail.__v":0, "companyDetail.createdAt":0,"companyDetail.updatedAt":0
//           }
//       },
//       {
//         $lookup: {
//             from : "branches",
//             localField:"branchId",
//             foreignField:"_id",
//             as:"branchDetail"
//         }
//     },
//     {
//         $project:{
//              "branchDetail.__v":0, "branchDetail.createdAt":0,"branchDetail.updatedAt":0,
//              "branchDetail.companyId":0,"branchDetail.branchId":0
//         }
//     },
//     {
//       $lookup: {
//           from : "departments",
//           localField:"departmentId",
//           foreignField:"_id",
//           as:"departmentDetail"
//       }
//   },
//   {
//       $project:{
//            "departmentDetail.__v":0, "departmentDetail.createdAt":0,"departmentDetail.updatedAt":0,
//            "departmentDetail.workLocationId":0,"departmentDetail.companyId":0,"departmentDetail.branchId":0
//       }
//   },
//     {
//       $lookup: {
//           from : "worklocations",
//           localField:"workLocationId",
//           foreignField:"_id",
//           as:"worklocationDetail"
//       }
//   },
//   {
//       $project:{
//            "worklocationDetail.__v":0, "worklocationDetail.createdAt":0,"worklocationDetail.updatedAt":0,
//            "worklocationDetail.companyId":0,"worklocationDetail.branchId":0
//       }
//   }
//     ]);

//     success(res, "Get All Designation",designationtDetail);
//   } catch (error) {
//     console.log(error);
//     unknownError(res, error);
//   }
// };

//--------------------------Designation from model---------------------------------------------
async function getAllDesignation(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const designationDetail = await designationModel.aggregate([
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
          from: "departments",
          localField: "departmentId",
          foreignField: "_id",
          as: "departmentDetail",
        },
      },
      {
        $project: {
          "departmentDetail.__v": 0,
          "departmentDetail.createdAt": 0,
          "departmentDetail.updatedAt": 0,
          "departmentDetail.workLocationId": 0,
          "departmentDetail.companyId": 0,
          "departmentDetail.branchId": 0,
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
      {
        $addFields: {
          designationName: { $toUpper: "$designationName" },
          companyDetail: {
            $map: {
              input: "$companyDetail",
              as: "company",
              in: {
                _id: "$$company._id",
                companyName: { $toUpper: "$$company.companyName" },
              },
            },
          },
          branchDetail: {
            $map: {
              input: "$branchDetail",
              as: "branch",
              in: {
                _id: "$$branch._id",
                branch: { $toUpper: "$$branch.branch" },
              },
            },
          },
          departmentDetail: {
            $map: {
              input: "$departmentDetail",
              as: "department",
              in: {
                _id: "$$department._id",
                departmentName: { $toUpper: "$$department.departmentName" },
              },
            },
          },
          worklocationDetail: {
            $map: {
              input: "$worklocationDetail",
              as: "worklocation",
              in: {
                _id: "$$worklocation._id",
                title: { $toUpper: "$$worklocation.title" },
              },
            },
          },
        },
      },
    ]);

    success(res, "Get All Designation", designationDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

//----------------------------------designation  from google sheet------------------------------------------------

async function getAllDesignationSheet(req, res) {
  try {
    const spreadsheetId = process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE;
    const sheetName = "DESIGNATION DETAILS";
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

      success(res, "Get All Designations", data);
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      return badRequest(res, "Invalid sheet name.");
    } else {
      unknownError(res, error.message);
    }
  }
}

//------------------------------delete designation--------------------------------------------------------
async function deleteDesignation(req, res) {
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
    const designationData = await designationModel.findByIdAndDelete(id);
    if (!designationData) {
      return notFound(res, "Designation not found");
    }
    success(res, "Designation deleted successfully");
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

module.exports = {
  designationAdd,
  designationActiveOrInactive,
  updateDesignation,
  designationByDepartmentId,
  getAllDesignation,
  getAllDesignationSheet,
  deleteDesignation,
};
