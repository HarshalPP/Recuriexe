const {
  success,
  unknownError,
  serverValidation,
  badRequest,
} = require("../../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const incomeTypeModel = require("../../model/adminMaster/incomeTypeMechanism");

// ------------------Loan Calculator---------------------------------------
const addIncomeType = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const newIncomeType = await incomeTypeModel(req.body);
    const newData = await newIncomeType.save();
    success(res, "Added IncomeTypes", newData);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
};

const deleteIncomeType = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const { incomeTypeId } = req.params;
    const deleteData = await incomeTypeModel.findByIdAndDelete(incomeTypeId);
    success(res, "Deleted IncomeTypes" ,deleteData );
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
};

const updateIncomeType = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const { incomeTypeId } = req.params;
    // console.log(incomeTypeId,'id')
    const updateData = await incomeTypeModel.findByIdAndUpdate(incomeTypeId, req.body, {new :true});
    // console.log(updateData,'update data')
    success(res, "Updated IncomeTypes",updateData);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
};

const allIncomeType = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const allData = await incomeTypeModel.find();
    success(res, "All IncomeTypes",allData);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
};

// async function deleteIncomeType(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }  
//     const { id } = req.query;
//     if (!id) {
//       return badRequest(res , "ID is required");
//     }
//     if (!mongoose.isValidObjectId(id)) {
//       return badRequest(res , "Invalid ID");
//     }
//     const incomeTypeData = await incomeTypeModel.findByIdAndDelete(id);
//     if (!incomeTypeData) {
//       return notFound(res, "IncomeType not found");
//     }
//     success(res, "IncomeType deleted successfully");
//   } catch (error) {
//     console.log(error);
//     unknownError(res, error);
//   }
// }

module.exports = {
  addIncomeType,
  deleteIncomeType,
  updateIncomeType,
  allIncomeType,
  deleteIncomeType
};
