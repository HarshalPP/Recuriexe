
import {
  addDepartment,
  updateDepartment,
  getDepartmentById,
  getAllDepartments,
  deactivateDepartment,
  getSubDepartmentsByDepartmentId,
  getAllMainDepartments,
  Activeeparment,
  getDepartmentCandidantSides,
  getnewdepartment,
  getnewdepartmentByToken,
  departmentDropDown,
  getDepartmentFromJobApply,
} from "../../services/departmentservices/department.services.js";


import newdesingationModel from "../../models/designationModel/designation.model.js";4
import employeModel from "../../models/employeemodel/employee.model.js";
import jobPostModel from "../../models/jobPostModel/jobPost.model.js";
import JobApplyModel from "../../models/jobformModel/jobform.model.js";
import DepartmentBudget from "../../models/budgedModel/budged.model.js";
import oganizationPlan from "../../models/PlanModel/organizationPlan.model.js";
import AICreditRule from "../../models/AiModel/AICreditRuleModel .js"

// Import Gemini //


import {generateAIResponse} from "../../services/Geminiservices/gemini.service.js"
import {generateDepartmentPrompt} from "../../prompt/resumeprompt.js"

import AIConfigModel from "../../models/AiModel/ai.model.js"

import newDepartmentModel from "../../models/deparmentModel/deparment.model.js";
import OrganizationModel from "../../models/organizationModel/organization.model.js";
import {
  badRequest,
  success,
  unknownError
} from "../../formatters/globalResponse.js";
import { populate } from "dotenv";

// ------------------------- Formatters ------------------------- //

export const formatDepartmentDataForAdd = (bodyData) => {
  const { name, subDepartments = [] , isSubDepartment , createdBy , organizationId } = bodyData;

  const formattedSubDepartments = subDepartments.map((subDept) => ({
    name: subDept.name?.trim(),
    isActive: subDept.isActive !== false,
    isSubDepartment,
    createdBy,
    organizationId,
  }));

  return {
    name: name?.trim(),
    subDepartments: formattedSubDepartments,
    isSubDepartment: true, 
    createdBy,
    organizationId,
     organizationId,
  };
};

// bulk  Create //
export const formatDepartmentDataForAddBulk = (bodyData) => {
  const { name, subDepartments = [], isSubDepartment, createdBy } = bodyData;

  const formattedSubDepartments = subDepartments.map((subDept) => ({
    name: subDept.name?.trim(),
    isActive: subDept.isActive !== false
  }));

  return {
    name: name?.trim(),
    isSubDepartment: !!isSubDepartment,
    subDepartments: formattedSubDepartments,
    isActive: bodyData.isActive !== false,
    createdBy
  };
};


export const formatDepartmentDataForUpdate = (bodyData) => {
  console.log(bodyData , "bodydata")
  const { name, subDepartments = [] , isActive } = bodyData;

  const formattedSubDepartments = subDepartments.map((subDept) => ({
    name: subDept.name?.trim(),
    isActive: subDept.isActive !== false,
  }));

  return {
    ...(name && { name: name.trim() }),
    isActive,
    ...(subDepartments.length > 0 && { subDepartments: formattedSubDepartments })
  };
};

// ------------------------- Controllers ------------------------- //

// Add New Department
export const addNewDepartment = async (req, res) => {
  try {
    const formattedData = formatDepartmentDataForAdd(req.body);
    formattedData.createdBy=req.employee.id;
    formattedData.organizationId=req.employee.organizationId;
    const { status, message, data } = await addDepartment(formattedData);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
};

// Update Department
export const updateDepartmentData = async (req, res) => {
  try {
    const formattedData = formatDepartmentDataForUpdate(req.body);
    console.log("formattedData" , formattedData)
    const { status, message, data } = await updateDepartment(req.params.departmentId, formattedData);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
};

// Get All Departments
export const getDepartmentList = async (req, res) => {
  try {
    const { status, message, data } = await getAllDepartments(req)
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
};


export const getDepartmentDropDown = async (req, res) => {
  try {
    const { status, message, data } = await departmentDropDown(req)
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
};



// Get All Departments for Candidate Side
export const getDepartmentListForCandidate = async (req, res) => {
  try {
    const { status, message, data } = await getnewdepartment(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}


// Get All Departments for Candidate Side
export const getDepartmentJobApply = async (req, res) => {
  try {
    const { status, message, data } = await getDepartmentFromJobApply(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// Get All Departments for Candidate Side
export const getDepartmentListByToken = async (req, res) => {
  try {
    const { status, message, data } = await getnewdepartmentByToken(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// Get All Departments
export const getactivelist = async (req, res) => {
  try {
    const { status, message, data } = await Activeeparment();
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
};

// Get Sub-Departments by Department ID
export const getSubDepartmentList = async (req, res) => {
  try {
    const { status, message, data } = await getSubDepartmentsByDepartmentId(req.params.departmentId);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
};

// Get Main Departments Only
export const getMainDepartmentList = async (req, res) => {
  try {
    const { status, message, data } = await getAllMainDepartments();
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
};

// Get Department by ID
export const getDepartmentByIdData = async (req, res) => {
  try {
    const { status, message, data } = await getDepartmentById(req.params.departmentId);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
};

// Deactivate Department
export const deactivateDepartmentById = async (req, res) => {
  try {
    const { status, message, data } = await deactivateDepartment(req.params.departmentId);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
};


export const DeparmentGemini = async (req, res) => {
  try {
    const orgainizationId = req.employee.organizationId;

    const activePlan = await oganizationPlan.findOne({organizationId: orgainizationId , isActive:true}).lean();
        if(!activePlan){
          return badRequest(res, "no active plan found for this Analizer.");
        }

    const findOrganization = await OrganizationModel.findById(orgainizationId)
      .populate({ path: 'typeOfIndustry', select: 'name' })
      .populate({ path: 'typeOfSector', select: 'name' })
      .select('typeOfIndustry typeOfSector');

    if (!findOrganization || !findOrganization.typeOfIndustry || !findOrganization.typeOfSector) {
      return badRequest(res, "Missing industry or sector data for the organization");
    }

    const industryName = findOrganization.typeOfIndustry.name;
    const sectorName = findOrganization.typeOfSector.name;

    const checkAnalizercheck = await AIConfigModel.findOne({
      title: "Department Analizer",
      enableAIResumeParsing: true
    });

    if (!checkAnalizercheck) {
      return badRequest(res, "Deparment Analizer is OFF");
    }

    // 🔹 Dynamic Input Prompt based on Organization
    const inputText = `
The company operates in the "${industryName}" industry and focuses on the "${sectorName}" sector.

Based on this context, generate a structured list of major departments and their respective sub-departments typically found in such organizations. Ensure the department names are clear and sub-departments are logically grouped. The output should be suitable for organizational structuring and HRMS system setup.
`;


    const prompt = generateDepartmentPrompt(inputText);
    const aiResult = await generateAIResponse(prompt);

    if (!Array.isArray(aiResult) || aiResult.length === 0 || !aiResult[0]?.name) {
      return badRequest(res, "Invalid or empty department structure received from AI.");
    }

    const CreditRules = await AICreditRule.findOne({ actionType: "DESIGNATION_AI" });

    // if (!CreditRules) {
    //   return badRequest(res, "No credit rule found for DESIGNATION_AI");
    // }

    const creditsNeeded = CreditRules.creditsRequired || 1;
    
    success(res, "Department structure generated successfully", aiResult);


            // Update candidate with AI screening result
        if(activePlan.NumberofAnalizers > 0){
          const Updateservice = await oganizationPlan.findOneAndUpdate(
            { organizationId: orgainizationId },
            { $inc: { NumberofAnalizers: -creditsNeeded } }, // Decrement the count
            { new: true }
          );
        }
    
        // If main is 0, try to decrement from addNumberOfAnalizers
      else if (activePlan.addNumberOfAnalizers > 0) {
      await oganizationPlan.findOneAndUpdate(
        { organizationId: orgainizationId },
        { $inc: { addNumberOfAnalizers: -creditsNeeded } },
        { new: true }
      );
     } 
    
    else {
      return badRequest(res , "AI limit reached for this organization. Please upgrade your plan.");
    }

  } catch (error) {
    console.error("❌ DeparmentGemini Error:", error.message);
    return unknownError(res, "Failed to generate department structure.");
  }
};

  


export const addDepartmentsBulk = async (req, res) => {
  try {
    const departments = req.body.departments;
    const organizationId = req.employee.organizationId || null;

    if (!Array.isArray(departments) || departments.length === 0) {
      return badRequest(res, "No department data provided.");
    }


    const createdBy = req.employee?.id;
    const results = [];

    for (const dept of departments) {
      const { name, subDepartments = [] } = dept;

      const existingDepartment = await newDepartmentModel.findOne({
        name: name.trim(),
        organizationId,
      });

      if (existingDepartment) {
        // Merge new subDepartments, avoid duplicates by name
        const existingSubNames = new Set(
          (existingDepartment.subDepartments || []).map((sub) =>
            sub.name.toLowerCase()
          )
        );

        const newSubs = subDepartments.filter(
          (sub) => !existingSubNames.has(sub.name.toLowerCase())
        );

        if (newSubs.length > 0) {
          existingDepartment.subDepartments.push(
            ...newSubs.map((s) => ({
              name: s.name,
              isActive: true,
              createdBy,
            }))
          );
          await existingDepartment.save();
          results.push({ action: "updated", department: existingDepartment.name });
        } else {
          results.push({
            action: "skipped",
            department: existingDepartment.name,
            reason: "All sub-departments already exist",
          });
        }
      } else {
        const newDept = new newDepartmentModel({
          name: name.trim(),
          subDepartments: subDepartments.map((s) => ({
            name: s.name,
            isActive: true,
            createdBy,
          })),
          createdBy,
          organizationId,
          isActive: true,
        });
        await newDept.save();
        results.push({ action: "created", department: newDept.name });
      }
    }

      success(res, "Departments processed successfully", results);


  } catch (error) {
    console.error("Bulk Create/Update Error:", error);
    return unknownError(res, error.message);
  }
};




// Get All Departments candidate side
export const getDepartmentCandidantSide = async (req, res) => {
  try {
    const { status, message, data } = await getDepartmentCandidantSides(req)
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
};




export const toggleSubDepartmentStatus = async (req, res) => {
  try {
    const { departmentId, subDepartmentId, isActive } = req.query;

    // if (typeof isActive !== 'boolean') {
    // return badRequest(res, "isActive must be a boolean value");
    // }

    const department = await newDepartmentModel.findOneAndUpdate(
      {
        _id: departmentId,
        "subDepartments._id": subDepartmentId
      },
      {
        $set: { "subDepartments.$.isActive": isActive }
      },
      { new: true }
    );

    if (!department) {
      return badRequest(res, "Department or sub-department not found");
    }

   return success(res, "Sub-department status updated successfully", department);

  } catch (err) {
   return unknownError(res, err.message);
  }
};



// Delete Department but we have condiftion not include in desingtion / job apply / job post // employee  //


export const deleteDepartment = async (req, res) => {
  try {
    const { departmentIds } = req.body; // Expecting an array of department IDs

    if (!Array.isArray(departmentIds) || departmentIds.length === 0) {
      return badRequest(res, "Please provide valid departmentIds as an array.");
    }

    const undeletedDepartments = [];

    for (const deptId of departmentIds) {
      const department = await newDepartmentModel.findById(deptId);
      if (!department) {
        undeletedDepartments.push({
          departmentId: deptId,
          reason: "Department not found"
        });
        continue;
      }

      const issues = [];

      const isUsedInJobPosts = await newdesingationModel.findOne({ departmentId: deptId, isActive: true });
      if (isUsedInJobPosts) issues.push("linked to active designations");

      const isUsedInEmployees = await employeModel.findOne({ departmentId: deptId, status: "active" });
      if (isUsedInEmployees) issues.push("linked to active employees");

      const isUsedInJobApplications = await jobPostModel.findOne({ departmentId: deptId, status: "active" });
      if (isUsedInJobApplications) issues.push("linked to active job posts");

      const isUsedInJobForms = await JobApplyModel.findOne({ departmentId: deptId, status: "active" });
      if (isUsedInJobForms) issues.push("linked to active job applications");

      const isUsedInBudgets = await DepartmentBudget.findOne({ departmentId: deptId, status: "active" });
      if (isUsedInBudgets) issues.push("linked to active department budgets");

      if (issues.length > 0) {
        undeletedDepartments.push({
          departmentId: deptId,
          departmentName: department.name,
          reason: `Cannot delete - ${issues.join(", ")}`
        });
        continue;
      }

      // Safe to delete
      await newDepartmentModel.findByIdAndDelete(deptId);
    }

    const deletedCount = departmentIds.length - undeletedDepartments.length;

    return success(res, {
      message: `${deletedCount} department(s) deleted successfully`,
      notDeleted: undeletedDepartments
    });

  } catch (error) {
    return unknownError(res, error.message);
  }
};





export const deleteSubdepartment = async (req, res) => {
  try {
    const { departmentIds, subDepartmentId } = req.body;

    if (!Array.isArray(departmentIds) || departmentIds.length === 0) {
      return badRequest(res, "Please provide valid departmentIds as an array.");
    }

    const undeletedDepartments = [];
    const modifiedSubDepartments = [];

    for (const deptId of departmentIds) {
      const department = await newDepartmentModel.findById(deptId);
      if (!department) {
        undeletedDepartments.push({
          departmentId: deptId,
          reason: "Department not found"
        });
        continue;
      }

      // If subDepartmentId is provided, set isActive: false instead of removing
      if (subDepartmentId) {
        const subDeptIndex = department.subDepartments.findIndex(
          (sub) => sub._id.toString() === subDepartmentId
        );

        if (subDeptIndex === -1) {
          undeletedDepartments.push({
            departmentId: deptId,
            subDepartmentId,
            reason: "Sub-department not found in department"
          });
          continue;
        }

        department.subDepartments[subDeptIndex].isActive = false;
        await department.save();

        modifiedSubDepartments.push({
          departmentId: deptId,
          subDepartmentId,
          message: "Sub-department deactivated successfully"
        });

        continue; // Skip full department deletion logic
      }

      // Department-level usage checks
      const issues = [];

      const isUsedInJobPosts = await newdesingationModel.findOne({ departmentId: deptId, isActive: true });
      if (isUsedInJobPosts) issues.push("linked to active designations");

      const isUsedInEmployees = await employeModel.findOne({ departmentId: deptId, status: "active" });
      if (isUsedInEmployees) issues.push("linked to active employees");

      const isUsedInJobApplications = await jobPostModel.findOne({ departmentId: deptId, status: "active" });
      if (isUsedInJobApplications) issues.push("linked to active job posts");

      const isUsedInJobForms = await JobApplyModel.findOne({ departmentId: deptId, status: "active" });
      if (isUsedInJobForms) issues.push("linked to active job applications");

      const isUsedInBudgets = await DepartmentBudget.findOne({ departmentId: deptId, status: "active" });
      if (isUsedInBudgets) issues.push("linked to active department budgets");

      if (issues.length > 0) {
        undeletedDepartments.push({
          departmentId: deptId,
          departmentName: department.name,
          reason: `Cannot delete - ${issues.join(", ")}`
        });
        continue;
      }

      // Safe to delete entire department
      await newDepartmentModel.findByIdAndDelete(deptId);
    }

    const deletedCount = subDepartmentId
      ? 0
      : departmentIds.length - undeletedDepartments.length;

    return success(res, {
      message: subDepartmentId
        ? `${modifiedSubDepartments.length} sub-department(s) deactivated successfully`
        : `${deletedCount} department(s) deleted successfully`,
      modifiedSubDepartments,
      notDeleted: undeletedDepartments
    });

  } catch (error) {
    return unknownError(res, error.message);
  }
};



export const deleteDepartmentOrSubdepartment = async (req, res) => {
  try {
    const { departmentIds, subDepartmentId } = req.body;
    const orgainizationId=req.employee.organizationId


    if (!Array.isArray(departmentIds) || departmentIds.length === 0) {
      return badRequest(res, "Please provide valid departmentIds as an array.");
    }

    const undeletedDepartments = [];
    const modifiedSubDepartments = [];

    for (const deptId of departmentIds) {
      const department = await newDepartmentModel.findById(deptId);
      if (!department) {
        undeletedDepartments.push({
          departmentId: deptId,
          reason: "Department not found"
        });
        continue;
      }

      if (subDepartmentId) {
        // Handle sub-department deactivation
        const subDeptIndex = department.subDepartments.findIndex(
          (sub) => sub._id.toString() === subDepartmentId
        );

        if (subDeptIndex === -1) {
          undeletedDepartments.push({
            departmentId: deptId,
            subDepartmentId,
            reason: "Sub-department not found in department"
          });
          continue;
        }

        department.subDepartments[subDeptIndex].isActive = false;
        await department.save();

        modifiedSubDepartments.push({
          departmentId: deptId,
          subDepartmentId,
          message: "Sub-department deactivated successfully"
        });

        continue; // Skip department deletion
      }

      // Department-level usage checks
      const issues = [];

      const isUsedInJobPosts = await newdesingationModel.findOne({ departmentId: deptId, isActive: true });
      if (isUsedInJobPosts) issues.push("linked to active designations");

      const isUsedInEmployees = await employeModel.findOne({ departmentId: deptId, status: "active" });
      if (isUsedInEmployees) issues.push("linked to active employees");

      const isUsedInJobApplications = await jobPostModel.findOne({ departmentId: deptId, status: "active" });
      if (isUsedInJobApplications) issues.push("linked to active job posts");

      const isUsedInJobForms = await JobApplyModel.findOne({ departmentId: deptId, status: "active" });
      if (isUsedInJobForms) issues.push("linked to active job applications");

      // const isUsedInBudgets = await DepartmentBudget.findOne({ departmentId: deptId, status: "active" });
      // if (isUsedInBudgets) issues.push("linked to active department budgets");

      if (issues.length > 0) {
        undeletedDepartments.push({
          departmentId: deptId,
          departmentName: department.name,
          reason: `Cannot delete - ${issues.join(", ")}`
        });
        continue;
      }

      // Safe to delete department
      await newDepartmentModel.findByIdAndDelete(deptId);
    }

    const deletedCount = subDepartmentId
      ? 0
      : departmentIds.length - undeletedDepartments.length;

    return success(res, {
      message: subDepartmentId
        ? `${modifiedSubDepartments.length} sub-department(s) deactivated successfully`
        : `${deletedCount} department(s) deleted successfully`,
      modifiedSubDepartments,
      notDeleted: undeletedDepartments
    });

  } catch (error) {
    return unknownError(res, error.message);
  }
};


//Update Department //


// export const updateDepartmentOrSubdepartment = async (req, res) => {
//   try {
//     const { departmentId, name, subDepartmentId, subDepartmentName } = req.body;

//     if (!departmentId) {
//       return badRequest(res, "Department ID is required.");
//     }

//     const department = await newDepartmentModel.findById(departmentId);
//     if (!department) {
//       return notFound(res, "Department not found.");
//     }

//     const responseData = {};

//     // Update department name if provided
//     if (name && typeof name === "string") {
//       department.name = name.trim();
//       responseData.updatedDepartment = {
//         _id: departmentId,
//         name: department.name,
//       };
//     }

//     // Update sub-department if both ID and name are provided
//     if (subDepartmentId && subDepartmentName && typeof subDepartmentName === "string") {
//       const subDeptIndex = department.subDepartments.findIndex(
//         (sub) => sub._id.toString() === subDepartmentId
//       );

//       if (subDeptIndex === -1) {
//         return badRequest(res, "Sub-department not found.");
//       }

//       department.subDepartments[subDeptIndex].name = subDepartmentName.trim();

//       responseData.updatedSubDepartment = {
//         _id: subDepartmentId,
//         name: department.subDepartments[subDeptIndex].name,
//       };
//     }

//     await department.save();

//     if (!responseData.updatedDepartment && !responseData.updatedSubDepartment) {
//       return badRequest(res, "No valid update fields provided.");
//     }

//     return success(res, {
//       message: "Update successful",
//       ...responseData,
//     });

//   } catch (error) {
//     console.log(error);
//     return unknownError(res, error.message);
//   }
// };

export const updateDepartmentOrSubdepartment = async (req, res) => {
  try {
    const {
      departmentId,
      name,
      subDepartmentId,
      subDepartmentName,
      newSubDepartments = [],
    } = req.body;

    if (!departmentId) {
      return badRequest(res, "Department ID is required.");
    }

    const department = await newDepartmentModel.findById(departmentId);
    if (!department) {
      return notFound(res, "Department not found.");
    }

    const responseData = {};

    // Update department name
    if (name && typeof name === "string") {
      department.name = name.trim();
      responseData.updatedDepartment = {
        _id: departmentId,
        name: department.name,
      };
    }

    // Update sub-department name by ID
    if (subDepartmentId && subDepartmentName && typeof subDepartmentName === "string") {
      const subDeptIndex = department.subDepartments.findIndex(
        (sub) => sub._id.toString() === subDepartmentId
      );

      if (subDeptIndex === -1) {
        return badRequest(res, "Sub-department not found.");
      }

      department.subDepartments[subDeptIndex].name = subDepartmentName.trim();

      responseData.updatedSubDepartment = {
        _id: subDepartmentId,
        name: department.subDepartments[subDeptIndex].name,
      };
    }

    // Add new sub-departments
    if (Array.isArray(newSubDepartments) && newSubDepartments.length > 0) {
      const formattedSubs = newSubDepartments
        .filter((s) => s.name && typeof s.name === "string")
        .map((s) => ({
          name: s.name.trim(),
          isActive: s.isActive !== false, // default to true if not set
        }));

      department.subDepartments.push(...formattedSubs);
      responseData.addedSubDepartments = formattedSubs;
    }

    await department.save();

    if (!Object.keys(responseData).length) {
      return badRequest(res, "No valid update fields provided.");
    }

    return success(res, {
      message: "Update successful",
      ...responseData,
    });

  } catch (error) {
    console.log(error);
    return unknownError(res, error.message);
  }
};







