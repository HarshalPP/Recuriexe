import {
    badRequest,
    success,
    unknownError,
    unauthorized,
  } from "../../formatters/globalResponse.js"
  import deparmentModel from "../../models/deparmentModel/deparment.model.js"
  import designationModel from "../../models/designationModel/designation.model.js";
  import mongoose from "mongoose";
  import budgetModel from "../../models/budgedModel/budged.model.js"
  
  import {
    addDesignation,
    getAllDesignation,
    getAllInactiveDesignation,
    updateDesignation,
    getDesignationById,
    deactivateDesignation
  } from "../../services/designationservices/designation.service.js"

  import AIConfigModel from "../../models/AiModel/ai.model.js"


  import employeModel from "../../models/employeemodel/employee.model.js";
  import jobPostModel from "../../models/jobPostModel/jobPost.model.js";
  import JobApplyModel from "../../models/jobformModel/jobform.model.js";
  import DepartmentBudget from "../../models/budgedModel/budged.model.js";



import {generateAIResponse} from "../../services/Geminiservices/gemini.service.js"
import {generateDepartmentPrompt , generateDesignationPrompt} from "../../prompt/resumeprompt.js"

  
  //-----------------------Add new designation ------------------------------
export async function addDesignationController(req, res) {
  try {
    const { status, message, data } = await addDesignation(req.body, req.employee.id , req.employee.organizationId);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

  
  //----------------------------Get all designations ---------------------------------------
  export async function getAllDesignationController(req, res) {
    try {
      const organizationId = req.employee.organizationId;
      const { status, message, data } = await getAllDesignation(organizationId);
      return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  }
  
  //----------------------------Get all inactive designations ---------------------------------------
  export async function getAllInactiveDesignationController(req, res) {
    try {
      const organizationId = req.employee.organizationId;
      const { status, message, data } = await getAllInactiveDesignation(organizationId);
      return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  }
  
  //----------------------------Get designation by ID ---------------------------------------
  export async function getDesignationByIdController(req, res) {
    try {
      const { status, message, data } = await getDesignationById(req.params.designationId);
      return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  }
  
  //-----------------------Update designation ------------------------------
  export async function updateDesignationController(req, res) {
    try {
      const { status, message, data } = await updateDesignation(req, req.body.Id, req.body);
      return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  }
  
  //---------------------------Deactivate designation ---------------------------------------------
  export async function deactivateDesignationByIdController(req, res) {
    try {
      const { status, message, data } = await deactivateDesignation(req, req.params.designationId);
      return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  }


  // get deparment with desination //

  // export const getdeparmentwithdesignation = async (req, res) => {
  //   try {
  //     const departments = await deparmentModel.aggregate([
  //       {
  //         $lookup: {
  //           from: 'newdesignations', 
  //           localField: '_id', 
  //           foreignField: 'departmentId', 
  //           as: 'designations'
  //         }
  //       },
  //       {
  //         $unwind: { path: '$designations', preserveNullAndEmptyArrays: true } // Flatten the designations array
  //       },
  //       {
  //         $lookup: {
  //           from: 'jobdescriptions', 
  //           localField: 'designations._id', 
  //           foreignField: 'designationId', 
  //           as: 'designations.jobDescriptions' 
  //         }
  //       },
  //       {
  //         $group: {
  //           _id: '$_id', 
  //           name: { $first: '$name' }, 
  //           description: { $first: '$description' }, 
  //           designations: { $push: '$designations' } 
  //         }
  //       },
  //       {
  //         $sort: { createdAt: -1 } // Sort by createdAt in descending order
  //       },
  //       {
  //         $project: {
  //           name: 1, 
  //           designations: {
  //             _id: 1,
  //             name: 1, 
  //             status: 1, 
  //             jobDescriptions: {
  //               _id: 1, 
  //               position: 1, 
  //               jobDescription: 1
  //             }
  //           }
  //         }
  //       }
  //     ]);
  
  //     return success(res, 'Departments with designations and job descriptions fetched successfully', departments);
  //   } catch (error) {
  //     console.error('Error fetching departments with designations and job descriptions:', error);
  //     return unknownError(res, error);
  //   }
  // };
  

  export const getdeparmentwithdesignation = async (req, res) => {
  try {
    const organizationId = req.employee.organizationId;

    const departments = await deparmentModel.aggregate([
      {
        $match: { organizationId } // Filter departments by organization
      },
      {
        $lookup: {
          from: 'newdesignations',
          let: { deptId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$departmentId', '$$deptId'] },
                    { $eq: ['$organizationId', organizationId] }
                  ]
                }
              }
            },
            {
              $lookup: {
                from: 'jobdescriptions',
                localField: '_id',
                foreignField: 'designationId',
                as: 'jobDescriptions'
              }
            }
          ],
          as: 'designations'
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $project: {
          name: 1,
          description: 1,
          designations: {
            _id: 1,
            name: 1,
            status: 1,
            jobDescriptions: {
              _id: 1,
              position: 1,
              jobDescription: 1
            }
          }
        }
      }
    ]);

    return success(res, 'Departments with designations and job descriptions fetched successfully', departments);
  } catch (error) {
    console.error('Error fetching departments with designations and job descriptions:', error);
    return unknownError(res, error.message);
  }
};


  // deparmnetwith desingation //

  // First API: Get departments with their designations

// export const getDepartmentsWithDesignations = async (req, res) => {
//   try {
//     const organizationId = new mongoose.Types.ObjectId(req.employee.organizationId); // Convert string to ObjectId

//     const aggregationPipeline = [
//       {
//         $match: {
//           organizationId: organizationId
//         }
//       },
//       {
//         $lookup: {
//           from: 'newdesignations',
//           localField: '_id',
//           foreignField: 'departmentId',
//           as: 'designations'
//         }
//       },
//       {
//         $lookup: {
//           from: 'departmentbudgets',
//           localField: '_id',
//           foreignField: 'departmentId',
//           as: 'budget'
//         }
//       },
//       {
//         $unwind: {
//           path: '$designations',
//           preserveNullAndEmptyArrays: true
//         }
//       },
//       {
//         $group: {
//           _id: '$_id',
//           name: { $first: '$name' },
//           description: { $first: '$description' },
//           designations: { $push: '$designations' },
//           budget: { $first: '$budget' }
//         }
//       },
//       {
//         $sort: { createdAt: -1 }
//       },
//       {
//         $project: {
//           name: 1,
//           designations: {
//             _id: 1,
//             name: 1,
//             status: 1
//           },
//           budget: {
//             _id: 1,
//             allocatedBudget: 1,
//             numberOfEmployees: 1,
//             status: 1
//           }
//         }
//       }
//     ];


//     const departments = await deparmentModel.aggregate(aggregationPipeline);

//     return success(res, 'Departments with designations and budgets fetched successfully', departments);
//   } catch (error) {
//     console.error('Error fetching departments with designations and budgets:', error);
//     return unknownError(res, error);
//   }
// };


export const getDepartmentsWithDesignations = async (req, res) => {
  try {
    const { departmentId, subDepartmentId } = req.query;
    const organizationId = req.employee.organizationId;

    if (!departmentId) {
      return badRequest(res, "departmentId is required");
    }

    if (!subDepartmentId) {
      return badRequest(res, "Sub-department is required");
    }

    const query = {
      departmentId,
      subDepartmentId,
      organizationId,
    };

    // Step 1: Fetch designations
    const designations = await designationModel.find(query)
      .populate({ path: 'departmentId', select: 'name' })
      .populate({ path: 'createdBy', select: 'employeName' })
      .sort({ createdAt: -1 })
      .lean();

    if (!designations.length) {
      return success(res, "No designations found for given department/sub-department", []);
    }

    // Step 2: Fetch department and find matching sub-department
    const department = await deparmentModel.findOne({ _id: departmentId }).lean();

    if (!department) {
      return badRequest(res, "Department not found");
    }

    const subDepartment = department.subDepartments?.find(
      (sub) => sub._id.toString() == subDepartmentId
    );


    // Step 3: Attach subDepartment to each designation
    const enrichedDesignations = designations.map((designation) => ({
      ...designation,
      subDepartment: {
        _id: subDepartment._id || null,
        name: subDepartment.name || "N/A", // Default to "N/A" if sub-department name is not available
      },
    }));

    return success(res, "Designations with sub-department fetched successfully", enrichedDesignations);
  } catch (error) {
    console.error("❌ getDepartmentsWithDesignations error:", error.message);
    return unknownError(res, error.message);
  }
};





  


export const getJobDescriptionsByDesignation = async (req, res) => {
  try {
    const { designationId } = req.params; // Capture designationId from the request parameters
    
  if(!designationId){
    return badRequest(res , "Please Provide designation")
  }

    const designationWithJobDescriptions = await designationModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(designationId) } // Match the specific designation by ID
      },
      {
        $lookup: {
          from: 'jobdescriptions', // Reference to the Job Description model
          localField: '_id', // Designation ID
          foreignField: 'designationId', // Job Description contains designationId
          as: 'jobDescriptions' // The job descriptions related to this designation
        }
      },
      {
        $project: {
          name: 1, // Designation name
          jobDescriptions: {
            _id: 1, 
            position: 1, 
            jobDescription: 1
          }
        }
      }
    ]);

    if (designationWithJobDescriptions.length === 0) {
    return badRequest(res , "jobdescription not found.")
    }

    return success(res, 'Job descriptions fetched successfully', designationWithJobDescriptions[0]);
  } catch (error) {
    console.error('Error fetching job descriptions:', error);
    return unknownError(res, error);
  }
};

// 



export const generateDesignationFromAI = async (req, res) => {
  try {
    const { departmentId, subDepartmentId } = req.body;

    if (!departmentId) {
      return badRequest(res, "departmentId is required.");
    }

    const findAiEnable = await AIConfigModel.findOne({
      title: "Desingnation Analizer",
      enableAIResumeParsing: true
    });

    if (!findAiEnable) {
      return badRequest(res, "Desingation Analizer is OFF");
    }

    const department = await deparmentModel.findById(departmentId);
    if (!department) {
      return badRequest(res, "Department not found with the given ID.");
    }

    let subDepartmentName = null;

    if (subDepartmentId) {
      const matchedSub = department.subDepartments.find(
        (sub) => sub._id.toString() == subDepartmentId
      );

      if (!matchedSub) {
        return badRequest(res, "Sub-department not found under the given department.");
      }
      subDepartmentName = matchedSub.name;
    }

    // Prepare AI prompt
    const fullPrompt = subDepartmentName
      ? generateDesignationPrompt(`${department.name} - ${subDepartmentName}`)
      : generateDesignationPrompt(department.name);

    const aiResult = await generateAIResponse(fullPrompt);

    if (!Array.isArray(aiResult) || !aiResult[0]?.name) {
      return badRequest(res, "AI did not return a valid list of designations.");
    }

    return success(res, "Designations generated successfully", {
      department: department.name,
      departmentId: department._id,
      ...(subDepartmentName && {
        subDepartment: subDepartmentName,
        subDepartmentId
      }),
      designations: aiResult
    });

  } catch (error) {
    console.error("❌ generateDesignationFromAI Error:", error.message);
    return unknownError(res, "Failed to generate designations.");
  }
};


// export const generateDesignationFromAI = async (req, res) => {
//   try {
//     const organizationId = req.employee.organizationId;

//     const findAiEnable = await AIConfigModel.findOne({
//       title: "Desingnation Analizer",
//       enableAIResumeParsing: true
//     });

//     if (!findAiEnable) {
//       return badRequest(res, "Desingation Analizer is OFF");
//     }

//     // Get all departments
//     const departments = await deparmentModel.find({ organizationId });
//     console.log("Departments found:", departments);

//     if (!departments || departments.length === 0) {
//       return badRequest(res, "No departments found for this organization.");
//     }

//     const results = [];

//     for (const dept of departments) {
//       const basePrompt = dept.name;

//       // If subDepartments exist
//       if (dept.subDepartments && dept.subDepartments.length > 0) {
//         for (const sub of dept.subDepartments) {
//           const prompt = generateDesignationPrompt(`${basePrompt} - ${sub.name}`);
//           const aiResult = await generateAIResponse(prompt);

//           if (Array.isArray(aiResult) && aiResult[0]?.name) {
//             results.push({
//               departmentId: dept._id,
//               department: basePrompt,
//               subDepartmentId: sub._id,
//               subDepartment: sub.name,
//               designations: aiResult
//             });
//           }
//         }
//       } else {
//         // No sub-departments
//         const prompt = generateDesignationPrompt(basePrompt);
//         const aiResult = await generateAIResponse(prompt);

//         if (Array.isArray(aiResult) && aiResult[0]?.name) {
//           results.push({
//             departmentId: dept._id,
//             department: basePrompt,
//             designations: aiResult
//           });
//         }
//       }
//     }

//     if (results.length === 0) {
//       return badRequest(res, "AI did not generate any designations.");
//     }

//     return success(res, "Designations generated successfully", results);

//   } catch (error) {
//     console.error("❌ generateAllDesignationsFromAI Error:", error.message);
//     return unknownError(res, "Failed to generate designations.");
//   }
// };




// create bulk desingation //
// export const createBulkDesignations = async (req, res) => {
//   try {
//     const { departmentId, subDepartmentId, designations } = req.body;
//     const organizationId = req.employee.organizationId;

//     // ✅ Validate input
//     if (!departmentId || !Array.isArray(designations) || designations.length === 0) {
//       return badRequest(res, "departmentId and non-empty designations array are required.");
//     }

//     // ✅ Validate department
//     const department = await deparmentModel.findById(departmentId);
//     if (!department) {
//       return badRequest(res, "Department not found.");
//     }

//     // ✅ Normalize input names and remove duplicates
//     const inputNames = [...new Set(designations.map(d => d.name.trim()))];

//     // ✅ Check existing designations
//     const existing = await designationModel.find({
//       departmentId,
//       name: { $in: inputNames }
//     }).select("name");

//     const existingNames = new Set(existing.map(e => e.name));

//     // ✅ Prepare new designations with createdBy
//     const newDesignations = inputNames
//       .filter(name => !existingNames.has(name))
//       .map(name => ({
//         name,
//         departmentId,
//         organizationId,
//         createdBy: req.employee?.id || null
//       }));

//     if (newDesignations.length === 0) {
//       return badRequest(res, "All provided designations already exist.");
//     }

//     // ✅ Insert into DB
//     const inserted = await designationModel.insertMany(newDesignations);

//     return success(res, "Designations added successfully", inserted);
//   } catch (error) {
//     console.error("❌ Error in createBulkDesignations:", error.message);
//     return unknownError(res, "Failed to add designations.");
//   }
// };


export const createBulkDesignations = async (req, res) => {
  try {
    const { departmentId, subDepartmentId, designations } = req.body;
    const organizationId = req.employee.organizationId;

    if (!departmentId || !Array.isArray(designations) || designations.length === 0) {
      return badRequest(res, "departmentId and non-empty designations array are required.");
    }

    const department = await deparmentModel.findById(departmentId);
    if (!department) {
      return badRequest(res, "Department not found.");
    }


    if (subDepartmentId) {
      const subDeptMatch = department.subDepartments.find(
        (sub) => sub._id.toString() == subDepartmentId
      );

      if (!subDeptMatch) {
        return badRequest(res, "Sub-department not found under the given department.");
      }
    }

    const inputNames = [...new Set(designations.map(d => d.name.trim()))];

    const existing = await designationModel.find({
      departmentId,
      subDepartmentId: subDepartmentId || null,
      name: { $in: inputNames }
    }).select("name");

    const existingNames = new Set(existing.map(e => e.name));

    const newDesignations = inputNames
      .filter(name => !existingNames.has(name))
      .map(name => ({
        name,
        departmentId,
        subDepartmentId: subDepartmentId || null,
        organizationId,
        createdBy: req.employee?.id || null
      }));

    if (newDesignations.length === 0) {
      return badRequest(res, "All provided designations already exist.");
    }

    // ✅ Insert into DB
    const inserted = await designationModel.insertMany(newDesignations);

    const budgetEntries = inserted.map(designation => ({
      // departmentId,
      desingationId: designation._id,
      departmentId: subDepartmentId,
      organizationId,
      createdBy :createdBy ||null,
      allocatedBudget: 0,
      numberOfEmployees: 0,
      status: "active"
    }));
    
    await budgetModel.insertMany(budgetEntries);
    
    return success(res, "Designations added successfully", inserted);

  } catch (error) {
    console.error("❌ Error in createBulkDesignations:", error.message);
    return unknownError(res, "Failed to add designations.");
  }
};

  
  export const createMissingBudgetsForDesignations = async (req, res) => {
  try {
    const organizationId = req.employee.organizationId;
    const createdBy = req.employee.id;

    if(!organizationId){
      console.log('router')
    }
    // 1. Get all designations for this organization
    const allDesignations = await designationModel.find({ organizationId });

    if (!allDesignations.length) {
      return success(res, "No designations found to process.");
    }

    // 2. Loop through each designation and check if corresponding budget entry exists
    const newBudgetEntries = [];

    for (const designation of allDesignations) {
      const existingBudget = await budgetModel.findOne({
        // departmentId: designation.departmentId,
        desingationId: designation._id,
        departmentId: designation.subDepartmentId || null,
        organizationId
      });

      if (!existingBudget) {
        newBudgetEntries.push({
          // departmentId: designation.departmentId,
          desingationId: designation._id,
          departmentId: designation.subDepartmentId || null,
          organizationId,
          createdBy,
          allocatedBudget: 3,
          numberOfEmployees: 1200000,
          status: "active"
        });
      }
    }

    // 3. Insert new budgets if needed
    if (newBudgetEntries.length > 0) {
      await budgetModel.insertMany(newBudgetEntries);
    }

    return success(res, `${newBudgetEntries.length} missing budget entries created successfully.`);
  } catch (error) {
    console.error("❌ Error in createMissingBudgetsForDesignations:", error.message);
    return unknownError(res, "Failed to create missing budget entries.");
  }
};





export const deleteDesignations = async (req, res) => {
  try {
    const { designationIds } = req.body;

    if (!Array.isArray(designationIds) || designationIds.length === 0) {
      return badRequest(res, "Please provide designationIds as a non-empty array.");
    }

    const undeletableDesignations = [];

    for (const id of designationIds) {
      const designation = await designationModel.findById(id);
      if (!designation) {
        undeletableDesignations.push({ designationId: id, reason: "Designation not found" });
        continue;
      }

      const usedIn = [];

      const isUsedInJobPosts = await jobPostModel.findOne({ designationId: id, status: "active" });
      if (isUsedInJobPosts) usedIn.push("job posts");

      const isUsedInJobApply = await JobApplyModel.findOne({ position: id.name, status: "active" });
      if (isUsedInJobApply) usedIn.push("job applications");

      const isUsedInBudgets = await budgetModel.findOne({ desingationId: id, status: "active" });
      if (isUsedInBudgets) usedIn.push("budget");

      const isUsedInEmployees = await employeModel.findOne({ designationId: id, status: "active" });
      if (isUsedInEmployees) usedIn.push("Users");

      if (usedIn.length > 0) {
        undeletableDesignations.push({
          designationId: id,
          designationName: designation.name,
          reason: `Linked to ${usedIn.join(", ")}`
        });
        continue;
      }

      // Safe to delete
      await designationModel.findByIdAndDelete(id);
    }

    const deletedCount = designationIds.length - undeletableDesignations.length;

    return success(res, {
      message: `${deletedCount} designation(s) deleted successfully.`,
      notDeleted: undeletableDesignations
    });
  } catch (error) {
    console.error("Error deleting designations:", error.message);
    return unknownError(res, error.message);
  }
};
