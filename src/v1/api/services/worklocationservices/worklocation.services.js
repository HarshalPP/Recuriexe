import { returnFormatter } from "../../formatters/common.formatter.js"
import { workLocationFormatter } from "../../formatters/workLocation.formatter.js"
import workLocationModel from "../../models/worklocationModel/worklocation.model.js"
import branchModel from "../../models/branchModel/branch.model.js"
import employeeModel from "../../models/employeemodel/employee.model.js"
// import { newWorkLocationGoogleSheet } from "../controller/adminMaster/masterGoogleSheet.controller.js";

// -----------------------Create a new work location-------------------------
export const addWorkLocation = async (bodyData) => {
  try {
    // const existingWorkLocation = await workLocationModel.findOne({ name: bodyData.name });
    // if (existingWorkLocation) {
    //   return returnFormatter(false, "Work Location with the same name already exists.");
    // }

    const formattedData = workLocationFormatter(bodyData);
    const saveData = await workLocationModel.create(formattedData);

    const branch = await branchModel.findById({ _id: saveData.branchId });
    const sheetData = { ...saveData._doc, branch: branch.name };

    // await newWorkLocationGoogleSheet(sheetData);
    return returnFormatter(true, "Work Location created", saveData);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};

//----------------------------Get all active work locations-------------------------
export const getAllWorkLocation = async (req) => {
  try {
     const organizationId = req.employee.organizationId;
       const workLocations = await workLocationModel
      .find({ organizationId}) // ✅ Filter by organization
      .populate("branchId");

    if (!workLocations) {
      return returnFormatter(false, "Work location not found");
    }
    return returnFormatter(true, "Work location found", workLocations);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};

//----------------------------Get all inactive work locations-------------------------
export const getAllInactiveWorkLocation = async () => {
  try {
    const workLocations = await workLocationModel.find({ isActive: false }).populate("branchId");
    if (!workLocations) {
      return returnFormatter(false, "Work location not found");
    }
    return returnFormatter(true, "Work location found", workLocations);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};

//----------------------------Get work location by ID-------------------------
export const getWorkLocationById = async (workLocationId) => {
  try {
    const workLocation = await workLocationModel.findById({ _id: workLocationId }).populate("branchId");
    if (!workLocation) {
      return returnFormatter(false, "Work location not found");
    }
    return returnFormatter(true, "Work location found", workLocation);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};

//----------------------------Get work locations by branch ID-------------------------
export const getWorkLocationByBranchId = async (branchId) => {
  try {
    const workLocations = await workLocationModel.find({ branchId }).populate("branchId");
    if (!workLocations) {
      return returnFormatter(false, "Work location not found");
    }
    return returnFormatter(true, "Work location found", workLocations);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};

//------------------------Update work location-------------------------
export const updateWorkLocation = async (req, workLocationId, bodyData) => {
  try {
    const existWorkLocation = await workLocationModel.findById(workLocationId);
    if (!existWorkLocation) {
      return returnFormatter(false, "Work location does not exist.");
    }

    if (bodyData.location?.coordinates) {
      bodyData.location = {
        type: "Point",
        coordinates: bodyData.location.coordinates,
      };
    }

    // if (bodyData.name && bodyData.name !== existWorkLocation.name) {
    //   const existingWorkLocationWithSameName = await workLocationModel.findOne({
    //     name: bodyData.name,
    //     _id: { $ne: workLocationId },
    //   });
    //   if (existingWorkLocationWithSameName) {
    //     return returnFormatter(false, "Work location with the same name already exists.");
    //   }
    // }

    // bodyData.updatedBy = req.Id;

    const formattedData = workLocationFormatter(bodyData);

    const saveData = await workLocationModel.findOneAndUpdate(
      { _id: workLocationId },
      formattedData,
      { new: true }
    );

    const branch = await branchModel.findById({ _id: saveData.branchId });
    const sheetData = { ...saveData._doc, branch: branch.name };

    // await newWorkLocationGoogleSheet(sheetData);

    return returnFormatter(true, "Work Location updated", saveData);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};

// -----------------------------Deactivate work location-------------------------
export const deactivateWorkLOcation = async (req, workLocationId) => {
  try {
    const employee = await employeeModel.find({ workLocationId });
    if (employee.length > 0) {
      return returnFormatter(false, "Cannot deactivate work location as it has employees");
    }

    const deactivatedWorkLocation = await workLocationModel.findOneAndUpdate(
      { _id: workLocationId },
      { isActive: false, updatedBy: req.Id },
      { new: true }
    );

    if (!deactivatedWorkLocation) {
      return returnFormatter(false, "Work Location not found");
    }

    return returnFormatter(true, "Work Location deactivated", deactivatedWorkLocation);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};
