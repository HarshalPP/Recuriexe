import { returnFormatter } from "../../formatters/common.formatter.js"
import { designationFormatter } from "../../formatters/designation.formatter.js"
import companyModel from "../../models/companyModel/company.model.js"
import designationModel from "../../models/designationModel/designation.model.js"
import newDepartmentModel from "../../models/deparmentModel/deparment.model.js"
import employeeModel from "../../models/employeemodel/employee.model.js"
import budgetModel from '../../models/budgedModel/budged.model.js'; // adjust path if needed
import jobApplyModel from "../../models/jobformModel/jobform.model.js";
import jobPostModel from "../../models/jobPostModel/jobPost.model.js"
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

// import { newDesignationGoogleSheet } from "../controller/adminMaster/masterGoogleSheet.controller.js";

// -----------------------Create a new designation-------------------------
// export const addDesignation = async (bodyData, createdBy , organizationId) => {
//   try {
//     const existingDesignation = await designationModel.findOne({ name: bodyData.name ,  organizationId: organizationId });
//     if (existingDesignation) {
//       return returnFormatter(false, "Designation with the same name already exists.");
//     }

//     const formattedData = {
//       ...designationFormatter(bodyData , organizationId),
//       createdBy: createdBy || null
//     };

//     const saveData = await designationModel.create(formattedData);
//     return returnFormatter(true, "Designation created", saveData);
//   } catch (error) {
//     return returnFormatter(false, error.message);
//   }
// };





export const addDesignation = async (bodyData, createdBy, organizationId) => {
  try {
    const existingDesignation = await designationModel.findOne({
      name: bodyData.name,
      organizationId: organizationId
    });

    if (existingDesignation) {
      return returnFormatter(false, "Designation with the same name already exists.");
    }

    const formattedData = {
      ...designationFormatter(bodyData, organizationId),
      createdBy: createdBy || null
    };

    console.log('organizationId',organizationId)
    if(!organizationId){
      return returnFormatter(false, "organizationIdnot found")
    }
    // Create new Designation
    const newDesignation = await designationModel.create(formattedData);

    // Create new DepartmentBudget entry
    const departmentBudgetData = {
      departmentId: newDesignation.subDepartmentId , // Make sure you pass departmentId in bodyData
      desingationId: newDesignation._id,
      createdBy:createdBy,
      organizationId: organizationId,
      allocatedBudget: 0,  // Optional: set from bodyData or 0
      numberOfEmployees:  0,  // Optional: set from bodyData or 0
      status: "active",
    };

    await budgetModel.create(departmentBudgetData);

    return returnFormatter(true, "Designation created", newDesignation);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};


//--------------------------------Get all active designations-------------------------
// export const getAllDesignation = async (organizationId) => {
//   try {
//     const designation = await designationModel
//       .find({ organizationId })
//       .populate({
//         path: "departmentId",
//         select: "name"
//       })
//       .populate({
//         path: "createdBy",
//         select: "employeName"
//       })
//       .sort({ createdAt: -1 });

//     if (!designation || designation.length === 0) {
//       return returnFormatter(false, "Designation not found");
//     }

//     return returnFormatter(true, "Designation found", designation);
//   } catch (error) {
//     return returnFormatter(false, error.message);
//   }
// };


export const getAllDesignation = async (organizationId) => {
  try {
    const designations = await designationModel
      .find({ organizationId })
      .populate({
        path: "departmentId",
        select: "name"
      })
      .populate({
        path: "createdBy",
        select: "employeName"
      })
      .sort({ createdAt: -1 });

    if (!designations || designations.length === 0) {
      return returnFormatter(false, "Designation not found");
    }

    const enrichedDesignations = await Promise.all(
      designations.map(async (designation) => {
        let subDepartment = null;

        if (designation.subDepartmentId) {
          // Find the department containing the sub-department
          const parentDept = await newDepartmentModel.findOne({
            "subDepartments._id": designation.subDepartmentId
          });

          if (parentDept) {
            const match = parentDept.subDepartments.find(
              (sub) => sub._id.toString() === designation.subDepartmentId.toString()
            );
            if (match) {
              subDepartment = { _id: match._id, name: match.name };
            }
          }
        }

        return {
          ...designation.toObject(),
          subDepartment,
        };
      })
    );

    return returnFormatter(true, "Designation found", enrichedDesignations);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};



export const getDesignationFromJobApply = async (organizationId) => {
  try {
    // 1. Get all designationIds from jobApplyModel
    // console.log("organizationId", organizationId);
    const jobApplies = await jobPostModel.find({ organizationId : new ObjectId(organizationId),totalApplicants: { $gt: 0 } }).select("designationId");
    // console.log("jobApplies", jobApplies);
    const designationIds = [...new Set(jobApplies.map(d => d.designationId).filter(Boolean))];

    // 2. Fetch only matching designations
    const designations = await designationModel
      .find({
        _id: { $in: designationIds },
        organizationId
      })
      .populate({ path: "departmentId", select: "name" })
      .populate({ path: "createdBy", select: "employeName" })
      .sort({ createdAt: -1 });

    // 3. Enrich subDepartment info
    const enrichedDesignations = await Promise.all(
      designations.map(async (designation) => {
        let subDepartment = null;

        if (designation.subDepartmentId) {
          const parentDept = await newDepartmentModel.findOne({
            "subDepartments._id": designation.subDepartmentId
          });

          if (parentDept) {
            const match = parentDept.subDepartments.find(
              (sub) => sub._id.toString() === designation.subDepartmentId.toString()
            );
            if (match) {
              subDepartment = { _id: match._id, name: match.name };
            }
          }
        }

        return {
          ...designation.toObject(),
          subDepartment,
        };
      })
    );

    return returnFormatter(true, "Designation found", enrichedDesignations);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};

//--------------------------------Get all inactive designations-------------------------
export const getAllInactiveDesignation = async (organizationId) => {
  try {
    
    const designation = await designationModel.find({ isActive: false, organizationId }).populate({
      path:"departmentId",
      select:"name"
    })
    .sort({createdAt:-1})



    if (!designation) {
      return returnFormatter(false, "Designation not found");
    }
    return returnFormatter(true, "Designation found", designation);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};

//----------------------------Get designation by ID -----------------------------------
export const getDesignationById = async (designationId) => {
  try {
    const designation = await designationModel
      .findById({ _id: designationId })
      populate({
        path:"departmentId",
        select:"name"
      })
      .populate({ path: "updatedBy", select: "employeName" })
      .populate({ path: "createdBy", select: "employeName" });

    if (!designation) {
      return returnFormatter(false, "Designation not found");
    }

    return returnFormatter(true, "Designation found", designation);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};

//------------------------Update designation ----------------------------------------------
export const updateDesignation = async (req, designationId, bodyData) => {
  console.log("desingation" , designationId)
  try {
    const existDesignation = await designationModel.findById(designationId);

    if (!existDesignation) {
      return returnFormatter(false, "Designation does not exist.");
    }

    if (bodyData.name && bodyData.name !== existDesignation.name) {
      const existingWithSameName = await designationModel.findOne({
        name: bodyData.name,
        _id: { $ne: designationId },
      });

      if (existingWithSameName) {
        return returnFormatter(false, "Designation with the same name already exists.");
      }
    }

    bodyData.updatedBy = req.employee.Id;
    const formattedData = designationFormatter(bodyData);
    console.log("formattedData" , formattedData )

    const saveData = await designationModel.findOneAndUpdate(
      { _id: designationId },
      formattedData,
      { new: true }
    );

    // await newDesignationGoogleSheet(saveData);

    return returnFormatter(true, "Designation updated", saveData);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};

// -----------------------------Deactivate a designation (soft delete)-------------------------
export const deactivateDesignation = async (req, designationId) => {
  try {
    const employee = await employeeModel.find({ designationId });

    if (employee.length > 0) {
      return returnFormatter(false, "Cannot deactivate designation as it has employees");
    }

    const deactivatedDesignation = await designationModel.findOneAndUpdate(
      { _id: designationId },
      {
        isActive: false,
        updatedBy: req.Id,
      },
      { new: true }
    );

    if (!deactivatedDesignation) {
      return returnFormatter(false, "Designation not found");
    }

    return returnFormatter(true, "Designation deactivated", deactivatedDesignation);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};
