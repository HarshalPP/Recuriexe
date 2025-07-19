const { returnFormatter } = require("../formatter/common.formatter");
const {
  workLocationFormatter,
} = require("../formatter/workLocation.formatter");
const companyModel = require("../model/adminMaster/company.model");
const workLocationModel = require("../model/adminMaster/newWorkLocation.model");
const branchModel = require("../model/adminMaster/newBranch.model");
const employeeModel = require("../model/adminMaster/employe.model");

const {
  newWorkLocationGoogleSheet,
} = require("../controller/adminMaster/masterGoogleSheet.controller");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // Assuming you're using JWT for login tokens

// -----------------------Create a new work location-------------------------
async function addWorkLocation(bodyData) {
  try {
    const existingWorkLocation = await workLocationModel.findOne({
      name: bodyData.name,
    });
    if (existingWorkLocation) {
      return returnFormatter(
        false,
        "Work Location with the same name already exists."
      );
    }
    // const company = await companyModel.find();
    // bodyData.companyId = company[0];

    const formattedData = workLocationFormatter(bodyData);
    const saveData = await workLocationModel.create(formattedData);
    const branch = await branchModel.findById({
      _id: saveData.branchId,
    });
    // saveData.regionalBranchId = regionalBranch.name;

    const sheetData = { ...saveData._doc, branch: branch.name };

    await newWorkLocationGoogleSheet(sheetData);

    return returnFormatter(true, "Work Location created", saveData);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}
//----------------------------get all work location ---------------------------------------
async function getAllWorkLocation() {
  try {
    const branch = await workLocationModel
      .find({
        isActive: true,
      })
      .populate("branchId");
    if (!branch) {
      return returnFormatter(false, "Work location not found");
    }
    return returnFormatter(true, "work location found", branch);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}
//----------------------------get all work location ---------------------------------------
async function getAllInactiveWorkLocation() {
  try {
    const branch = await workLocationModel
      .find({
        isActive: false,
      })
      .populate("branchId");
    if (!branch) {
      return returnFormatter(false, "Work location not found");
    }
    return returnFormatter(true, "work location found", branch);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}
//----------------------------get work location by id ---------------------------------------
async function getWorkLocationById(workLocationId) {
  try {
    const workLocation = await workLocationModel
      .findById({
        _id: workLocationId,
      })
      .populate("branchId");
    if (!workLocation) {
      return returnFormatter(false, "Work location not found");
    }
    return returnFormatter(true, "work location found", workLocation);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}
//----------------------------get work location by branch id ---------------------------------------
async function getWorkLocationByBranchId(branchId) {
  try {
    const workLocation = await workLocationModel
      .find({
        branchId: branchId,
      })
      .populate("branchId");
    if (!workLocation) {
      return returnFormatter(false, "Work location not found");
    }
    return returnFormatter(true, "work location found", workLocation);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}
//------------------------update designation ----------------------------------------------
async function updateWorkLocation(req, workLocationId, bodyData) {
  try {
    // Find the existing branch by ID
    const existWorkLocation = await workLocationModel.findById(workLocationId);

    if (!existWorkLocation) {
      return returnFormatter(false, "Work location does not exist.");
    }

    // Validate and format location to GeoJSON if provided
    if (bodyData.location && bodyData.location.coordinates) {
      bodyData.location = {
        type: "Point",
        coordinates: bodyData.location.coordinates, // Ensure it's in [longitude, latitude] format
      };
    }

    if (bodyData.name && bodyData.name !== existWorkLocation.name) {
      const existingWorkLocationWithSameName = await workLocationModel.findOne({
        name: bodyData.name,
        _id: { $ne: workLocationId }, // Ensure it is not the same WorkLocation being updated
      });
      if (existingWorkLocationWithSameName) {
        return returnFormatter(
          false,
          "Work location with the same name already exists."
        );
      }
    }

    bodyData.updatedBy = req.Id;

    // Format the data
    const formattedData = workLocationFormatter(bodyData);

    // Update the designation
    const saveData = await workLocationModel.findOneAndUpdate(
      { _id: workLocationId },
      formattedData,
      { new: true }
    );
    const branch = await branchModel.findById({
      _id: saveData.branchId,
    });
    // saveData.regionalBranchId = regionalBranch.name;

    const sheetData = { ...saveData._doc, branch: branch.name };
    await newWorkLocationGoogleSheet(saveData);

    return returnFormatter(true, "Work Location updated", saveData);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}
// -----------------------------Deactivate a designation (soft delete)------------------------------------------------------
async function deactivateWorkLOcation(req, workLocationId) {
  try {
    const employee = await employeeModel.find({
      workLocationId: workLocationId,
    });

    // Check if any of the collections have records associated with the branch
    if (employee.length > 0) {
      return returnFormatter(
        false,
        "Cannot deactive work location as it has employees"
      );
    } else {
      const deactivatedWorkLocation = await workLocationModel.findOneAndUpdate(
        { _id: workLocationId },
        { isActive: false, updatedBy: req.Id },
        { new: true }
      );
      if (!deactivatedWorkLocation) {
        return returnFormatter(false, "Work Location not found");
      }
      return returnFormatter(
        true,
        "Work Location deactivated",
        deactivatedWorkLocation
      );
    }
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}
module.exports = {
  addWorkLocation,
  getAllWorkLocation,
  getWorkLocationById,
  getAllInactiveWorkLocation,
  getWorkLocationByBranchId,
  updateWorkLocation,
  deactivateWorkLOcation,
};
