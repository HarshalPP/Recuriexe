const {
  success,
  unknownError,
  serverValidation,
  badRequest,
  notFound,
} = require("../../../../../globalHelper/response.globalHelper");

const { google } = require("googleapis");
const credentials = require("../../../../../credential.json");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const companyModel = require("../../model/adminMaster/company.model");
const branchModel = require("../../model/adminMaster/newBranch.model");
const employeModel = require("../../model/adminMaster/employe.model");
const departmentModel = require("../../model/adminMaster/department.model");
const workLocationModel = require("../../model/adminMaster/workLocation.model");
const newbranch = require("../../model/adminMaster/newBranch.model")
const Product = require("../../model/adminMaster/product.model")
const customerModel = require("../../model/customer.model");

const {
  branchGoogleSheet,
} = require("../adminMaster/masterGoogleSheet.controller");

// ------------------------Admin Master Add Branch---------------------------------------
async function branchAdd(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    if (req.body.branch) {
      req.body.branch = req.body.branch;
    }
    // const company = await branchModel.findById({companyId:new ObjectId(req.body.companyId)})
    // if(!company){
    //    return badRequest(res, "Company Not Register")
    // }
    const branchDetail = await branchModel.create(req.body);
    // const branchDetail = req.body;
    // console.log(req.body);
    success(res, "branch Added Successful", branchDetail);
    await branchGoogleSheet(req.body);
  } catch (error) {
    // console.log(error.msg);
    unknownError(res, error);
  }
}

// ------------------Admin Master Branch "active" or "inactive" updated---------------------------------------
async function branchActiveOrInactive(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    } else {
      const id = req.body.id;
      if (!id || id.trim() === "") {
        return badRequest(res, "ID is required and cannot be empty");
      }
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return badRequest(res, "Invalid ID");
      }
      const status = req.body.status;
      if (status == "active") {
        const branchStatusUpdate = await branchModel.findByIdAndUpdate(
          { _id: id },
          { status: "active" },
          { new: true }
        );
        success(res, "Branch Active", branchStatusUpdate);
      } else if (status == "inactive") {
        const branchStatusUpdate = await branchModel.findByIdAndUpdate(
          { _id: id },
          { status: "inactive" },
          { new: true }
        );
        success(res, "Branch inactive", branchStatusUpdate);
      } else {
        return badRequest(res, "Status must be 'active' or 'inactive'");
      }
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Admin Master Update  Branch ---------------------------------------
async function updateBranch(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    let { branchId, ...updateFields } = req.body;
    if (typeof updateFields.branch === "string") {
      updateFields.branch = updateFields.branch.trim().toLowerCase();
    }
    const updateData = await branchModel.findByIdAndUpdate(
      branchId,
      updateFields,
      { new: true }
    );
    success(res, "Updated Branch", updateData);
    await branchGoogleSheet(updateData);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Admin Master Get Branch Detail By CompanyId---------------------------------------
async function branchDetailByCompanyId(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    console.log("s", req.params.companyId);

    const branchDetail = await branchModel.aggregate([
      {
        $match: {
          companyId: new ObjectId(req.params.companyId),
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
    ]);
    console.log("data branch ", branchDetail);

    success(res, "Get Branch Detail", branchDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}


// -----Update branch for payment gateway----------------

async function updateBranchPaymentGateway(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { branchIds, PaymentGateway } = req.body;

    if (!branchIds || !Array.isArray(branchIds) || branchIds.length === 0) {
      return res.status(400).json({
        errorName: "invalidRequest",
        message: "Branch IDs are required and must be an array.",
      });
    }

    if (!PaymentGateway) {
      return res.status(400).json({
        errorName: "invalidRequest",
        message: "Payment Gateway is required.",
      });
    }

    let updatedBranches = [];

    for (let BranchId of branchIds) {
      const branchDetail = await newbranch.findByIdAndUpdate(
        BranchId,
        { PaymentGateway },
        { new: true }
      );

      if (!branchDetail) {
        return notFound(res, `Branch not found for ID: ${BranchId}`);
      }

      updatedBranches.push(branchDetail);
    }

    const productDetails = await Product.find({ branchIds: { $in: branchIds } });

    if (productDetails.length > 0) {
      for (let product of productDetails) {
        const customers = await customerModel.find({
          productId: product._id,
          branch: { $in: branchIds },
        });

        for (let customer of customers) {
          await customerModel.updateOne(
            { _id: customer._id },
            { $set: { PaymentGateway } }
          );
        }
      }
    }



    success(res, "Payment Gateway Updated", {
      updatedBranches,
      message: "Payment Gateway has been updated for branches and customers.",
    });
  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
}

// async function updateBranchPaymentGateway(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }

//     const { branchIds, PaymentGateway } = req.body;

//     // Validate branchIds and PaymentGateway
//     if (!branchIds || !Array.isArray(branchIds) || branchIds.length === 0) {
//       return res.status(400).json({
//         errorName: "invalidRequest",
//         message: "Branch IDs are required and must be an array.",
//       });
//     }

//     if (!PaymentGateway) {
//       return res.status(400).json({
//         errorName: "invalidRequest",
//         message: "Payment Gateway is required.",
//       });
//     }

//     let updatedBranches = [];

//     // Update Payment Gateway for the provided branch IDs
//     for (let BranchId of branchIds) {
//       const branchDetail = await newbranch.findByIdAndUpdate(
//         BranchId,
//         { PaymentGateway },
//         { new: true }
//       );

//       if (!branchDetail) {
//         return notFound(res, `Branch not found for ID: ${BranchId}`);
//       }

//       updatedBranches.push(branchDetail);
//     }

//     // Update Payment Gateway directly for customers related to the branch IDs
//     await customerModel.updateMany(
//       { branch: { $in: branchIds } },
//       { $set: { PaymentGateway } }
//     );

//     // Respond with the updated branches
//     success(res, "Payment Gateway Updated", {
//       updatedBranches,
//       message: "Payment Gateway has been updated for branches and customers.",
//     });
//   } catch (error) {
//     console.error(error);
//     unknownError(res, error);
//   }
// }





// ------------------Admin Master Get All branch---------------------------------------
// async function getAllBranch(req, res) {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({
//           errorName: "serverValidation",
//           errors: errors.array(),
//         });
//       }
//       const branchDetail = await branchModel.aggregate([
//         {$match:{status:"active"} },
//         {
//             $lookup: {
//                 from : "companies",
//                 localField:"companyId",
//                 foreignField:"_id",
//                 as:"companyDetail"
//             }
//         },
//         {
//             $project:{
//                  "companyDetail.__v":0, "companyDetail.createdAt":0,"companyDetail.updatedAt":0
//             }
//         }
//       ]);
//       console.log("dd",branchDetail);

//       success(res, "Get All Branch",branchDetail);
//     } catch (error) {
//       console.log(error);
//       unknownError(res, error);
//     }
//   };
//-----------------working previous branch get code---------------------
async function getAllBranch(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const branchDetail = await branchModel.aggregate([
      {
        $match: { status: "active" },
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
          branch: { $toUpper: "$branch" }, // Capitalize branch
          companyDetail: 1, // Keep company details
          status: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      {
        $sort: { branch: 1 }, // Sort branches alphabetically (A-Z)
      },
    ]);

    // console.log("Branch Details:", branchDetail);

    success(res, "Get All Branch", branchDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}


// I 

//-----------------------------Google sheet get branch---------------------------------
async function getAllBranchSheet(req, res) {
  try {
    const spreadsheetId = process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE;
    const sheetName = "BRANCH DETAILS";
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

      success(res, "Get All Branch", data);
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      return badRequest(res, "Invalid sheet name.");
    } else {
      unknownError(res, error.message);
    }
  }
}


//----------------------------------------getRegionalBranch-------------------------------------------
async function getRegionalBranch(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    } else {

     const {branchId } = req.query

     if(!branchId){
      return badRequest(res , "branch id required")
     }

     const branchDetail = await branchModel.find({status :"active",regionalBranchId:new ObjectId(branchId)}).select("name _id")
        success(res, "get Regional Branch", branchDetail);
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

//-------------------Admin master delete Branch ---------------------------------
async function deleteBranch(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const id = req.body.branchId;
    if (!id) {
      return badRequest(res, "ID is required");
    }
    if (!mongoose.isValidObjectId(id)) {
      return badRequest(res, "Invalid ID");
    }

    const employee = await employeModel.find({ branchId: id });
    const department = await departmentModel.find({ branchId: id });
    const workLocation = await workLocationModel.find({ branchId: id });

    // Check if any of the collections have records associated with the branch
    if (employee.length > 0) {
      return badRequest(res, "Cannot delete branch as it has employees");
    } else if (department.length > 0) {
      return badRequest(res, "Cannot delete branch as it has departments");
    } else if (workLocation.length > 0) {
      return badRequest(res, "Cannot delete branch as it has work locations");
    } else {
      // If no employees, departments, or work locations are found, proceed with deleting the branch
      const branchData = await branchModel.findByIdAndDelete(id);

      if (!branchData) {
        return notFound(res, "Branch not found");
      }

      return success(res, "Branch deleted successfully");
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

module.exports = {
  branchAdd,
  branchActiveOrInactive,
  updateBranch,
  branchDetailByCompanyId,
  getAllBranch,
  getAllBranchSheet,
  deleteBranch,
  updateBranchPaymentGateway,
  getRegionalBranch,
};
