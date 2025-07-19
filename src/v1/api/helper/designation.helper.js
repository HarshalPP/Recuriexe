const { returnFormatter } = require("../formatter/common.formatter");
const { designationFormatter } = require("../formatter/designation.formatter");
const companyModel = require("../model/adminMaster/company.model");
const designationModel = require("../model/adminMaster/newDesignation.model");
const employeeModel = require("../model/adminMaster/employe.model");

const {
  newDesignationGoogleSheet,
} = require("../controller/adminMaster/masterGoogleSheet.controller");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // Assuming you're using JWT for login tokens

// -----------------------Create a new designation-------------------------
async function addDesignation(bodyData) {
  try {
    const existingDesignation = await designationModel.findOne({
      name: bodyData.name,
    });
    if (existingDesignation) {
      return returnFormatter(
        false,
        "Designation with the same name already exists."
      );
    }
    // const company = await companyModel.find();
    // bodyData.companyId = company[0];

    const formattedData = designationFormatter(bodyData);
    const saveData = await designationModel.create(formattedData);
    await newDesignationGoogleSheet(saveData);

    return returnFormatter(true, "Designation created", saveData);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}
//--------------------------------get all designation-------------------------
async function getAllDesignation() {
  try {
    const designation = await designationModel.find({
      isActive: true,
    });
    if (!designation) {
      return returnFormatter(false, "Designation not found");
    }
    return returnFormatter(true, "Designation found", designation);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}
//--------------------------------get all designation-------------------------
async function getAllInactiveDesignation() {
  try {
    const designation = await designationModel.find({
      isActive: false,
    });
    if (!designation) {
      return returnFormatter(false, "Designation not found");
    }
    return returnFormatter(true, "Designation found", designation);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}
//----------------------------get designation by id -----------------------------------
async function getDesignationById(designationId) {
  try {
    // console.log(branchId);
    const designation = await designationModel
      .findById({
        _id: designationId,
      })
      .populate({ path: "updatedBy", select: " employeName" })
      .populate({ path: "createdBy", select: " employeName" });
    if (!designation) {
      return returnFormatter(false, "designation not found");
    }
    return returnFormatter(true, "designation found", designation);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}
//------------------------update designation ----------------------------------------------
async function updateDesignation(req, designationId, bodyData) {
  try {
    // Find the existing branch by ID
    const existDesignation = await designationModel.findById(designationId);

    if (!existDesignation) {
      return returnFormatter(false, "Designation does not exist.");
    }

    if (bodyData.name && bodyData.name !== existDesignation.name) {
      const existingdesignationWithSameName = await designationModel.findOne({
        name: bodyData.name,
        _id: { $ne: designationId }, // Ensure it is not the same designation being updated
      });
      if (existingdesignationWithSameName) {
        return returnFormatter(
          false,
          "Designation with the same name already exists."
        );
      }
    }

    bodyData.updatedBy = req.Id;

    // Format the data
    const formattedData = designationFormatter(bodyData);

    // Update the designation
    const saveData = await designationModel.findOneAndUpdate(
      { _id: designationId },
      formattedData,
      { new: true }
    );
    await newDesignationGoogleSheet(saveData);

    return returnFormatter(true, "designation updated", saveData);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}
// -----------------------------Deactivate a designation (soft delete)------------------------------------------------------
async function deactivateDesignation(req, designationId) {
  try {
    const employee = await employeeModel.find({ designationId: designationId });

    // Check if any of the collections have records associated with the branch
    if (employee.length > 0) {
      return returnFormatter(
        false,
        "Cannot deactive designation as it has employees"
      );
    } else {

      const deactivatedDesignation = await designationModel.findOneAndUpdate(
        { _id: designationId },
        {
          isActive: false,
          updatedBy:req.Id
        },
        { new: true }
      );
      if (!deactivatedDesignation) {
        return returnFormatter(false, "Designation not found");
      }
      return returnFormatter(
        true,
        "Designation deactivated",
        deactivatedDesignation
      );
    }
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}
module.exports = {
  addDesignation,
  getAllDesignation,
  getAllInactiveDesignation,
  updateDesignation,
  getDesignationById,
  deactivateDesignation,
};
