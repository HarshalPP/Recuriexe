// import {
//     addDepartment,
//     updateDepartment,
//     getDepartmentById,
//     getAllDepartments,
//     deactivateDepartment,
//     getSubDepartmentsByDepartmentId,
//     getAllMainDepartments
//   } from "../../services/departmentservices/department.services.js"
  
//   import { badRequest, success, unknownError } from "../../formatters/globalResponse.js"
  
//   // ------------------------------------Department------------------------------------ //
  
//   export const addNewDepartment = async (req, res) => {
//     try {
//       const { status, message, data } = await addDepartment(req.body);
//       return status ? success(res, message) : badRequest(res, message);
//     } catch (error) {
//       return unknownError(res, error.message);
//     }
//   };
  
//   export const updateDepartmentData = async (req, res) => {
//     try {
//       const { status, message, data } = await updateDepartment(req.params.departmentId, req.body);
//       return status ? success(res, message) : badRequest(res, message);
//     } catch (error) {
//       return unknownError(res, error.message);
//     }
//   };
  
//   export const getDepartmentList = async (req, res) => {
//     try {
//       const { status, message, data } = await getAllDepartments();
//       return status ? success(res, message, data) : badRequest(res, message);
//     } catch (error) {
//       return unknownError(res, error.message);
//     }
//   };
  
//   export const getSubDepartmentList = async (req, res) => {
//     try {
//       const { status, message, data } = await getSubDepartmentsByDepartmentId(req.params.departmentId);
//       return status ? success(res, message, data) : badRequest(res, message);
//     } catch (error) {
//       return unknownError(res, error.message);
//     }
//   };
  
//   export const getMainDepartmentList = async (req, res) => {
//     try {
//       const { status, message, data } = await getAllMainDepartments();
//       return status ? success(res, message, data) : badRequest(res, message);
//     } catch (error) {
//       return unknownError(res, error.message);
//     }
//   };
  
//   export const getDepartmentByIdData = async (req, res) => {
//     try {
//       const { status, message, data } = await getDepartmentById(req.params.departmentId);
//       return status ? success(res, message, data) : badRequest(res, message);
//     } catch (error) {
//       return unknownError(res, error.message);
//     }
//   };
  
//   export const deactivateDepartmentById = async (req, res) => {
//     try {
//       const { status, message, data } = await deactivateDepartment(req.params.departmentId);
//       return status ? success(res, message, data) : badRequest(res, message);
//     } catch (error) {
//       return unknownError(res, error.message);
//     }
//   };



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
  departmentDropDown,
} from "../../services/departmentservices/department.services.js";


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

    return success(res, "Department structure generated successfully", aiResult);

  } catch (error) {
    console.error("❌ DeparmentGemini Error:", error.message);
    return unknownError(res, "Failed to generate department structure.");
  }
};

  

// Bulk create //
// export const addDepartmentsBulk = async (req, res) => {
//   try {
//     const departments = req.body.departments;

//     if (!Array.isArray(departments) || departments.length === 0) {
//       return badRequest(res, "No department data provided.");
//     }

//     const createdBy = req.employee?.id;

//     const formattedDepartments = departments.map((dept) => formatDepartmentDataForAdd({ ...dept, createdBy }));

//     const result = await newDepartmentModel.insertMany(formattedDepartments);

//     return success(res, "Departments created successfully", result);
//   } catch (error) {
//     console.error("Bulk Create Error:", error);
//     return unknownError(res, error.message);
//   }
// };



// export const addDepartmentsBulk = async (req, res) => {
//   try {
//     const departments = req.body.departments;
//      const organizationId = req.employee.organizationId || null


//     if (!Array.isArray(departments) || departments.length === 0) {
//       return badRequest(res, "No department data provided.");
//     }

//     const createdBy = req.employee?.id;

//     // Normalize input names for comparison
//     const departmentNames = departments.map(dept => dept.name.trim().toLowerCase());

//     // Fetch existing department names from DB
//     const existingDepartments = await newDepartmentModel.find({
//       name: { $in: departmentNames.map(name => new RegExp(`^${name}$`, 'i')) },
//       organizationId: organizationId
//     });

//     const existingNames = new Set(existingDepartments.map(dept => dept.name.toLowerCase()));

//     // Filter out departments that already exist
//     const newDepartments = departments.filter(dept =>
//       !existingNames.has(dept.name.trim().toLowerCase())
//     );

//     // if (newDepartments.length === 0) {
//     //   return success(res, "All departments already exist. Nothing to insert.", []);
//     // }

//     const formattedDepartments = newDepartments.map(dept =>
//       formatDepartmentDataForAdd({ ...dept, createdBy , organizationId })
//     );


//     const result = await newDepartmentModel.insertMany(formattedDepartments);

//     return success(res, "Departments created successfully", result);
//   } catch (error) {
//     console.error("Bulk Create Error:", error);
//     return unknownError(res, error.message);
//   }
// };


// export const addDepartmentsBulk = async (req, res) => {
//   try {
//     const departments = req.body.departments;
//     const organizationId = req.employee.organizationId || null;

//     if (!Array.isArray(departments) || departments.length === 0) {
//       return badRequest(res, "No department data provided.");
//     }

//     const createdBy = req.employee?.id;

//     const formattedDepartments = departments.map(dept =>
//       formatDepartmentDataForAdd({ ...dept, createdBy, organizationId })
//     );

//     // Attempt to insert all, let Mongo handle duplicates (via unique index)
//     const result = await newDepartmentModel.insertMany(formattedDepartments, { ordered: false });

//     return success(res, "Departments created successfully", result);
//   } catch (error) {
//     console.error("Bulk Create Error:", error);
//     return unknownError(res, error.message);
//   }
// };

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

    return success(res, "Departments processed successfully", results);
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
