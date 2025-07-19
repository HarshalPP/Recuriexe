const {
  success,
  unknownError,
  serverValidation,
  badRequest,
} = require("../../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const companyModel = require("../../model/adminMaster/company.model");

// const branchModel = require("../../model/adminMaster/branch.model");
// const workLocationModel = require("../../model/adminMaster/workLocation.model");
// const departmentModel = require("../../model/adminMaster/department.model");
// const designationModel = require("../../model/adminMaster/designation.model");

const branchModel = require("../../model/adminMaster/newBranch.model");
const departmentModel = require("../../model/adminMaster/newDepartment.model");
const designationModel = require("../../model/adminMaster/newDesignation.model");
const workLocationModel = require("../../model/adminMaster/newWorkLocation.model");
const roleModel = require("../../model/adminMaster/role.model");

const costCenterModel = require("../../model/adminMaster/costCenter.model");
const employeeModel = require("../../model/adminMaster/employe.model");
const jobPostModel = require("../../model/hrms/jobPosting.model");
const taskModel = require("../../model/taskManagement/task.model")
// ------------------HRMS  dashboard  employee count ---------------------------------------
async function employeeHierarchy(req, res) {
  try {
    const { employeeId } = req.query;

    if (!employeeId) {
      return badRequest(res, "Employee ID is required");
    }

    // Find the root employee
    const employee = await employeeModel.findById(employeeId).populate("designationId");
    if (!employee) {
      return badRequest(res, "Employee not found");
    }

    // Find employees reporting directly to the given employee
    const directReports = await employeeModel
      .find({ reportingManagerId: employeeId })
      .populate("designationId");

    // Map the direct reports into the desired format
    const children = directReports.map((report) => ({
      Id: report._id,
      name: report.employeName,
      position: report.designationId?.name || "N/A",
    }));

    // Create the final hierarchy object
    const hierarchy = {
      Id: employee._id,
      name: employee.employeName,
      position: employee.designationId?.name || "N/A",
      children,
    };

    success(res, "Direct reports retrieved successfully", hierarchy);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

async function getCeo(req, res) {
  try {
    const ceoRole = await roleModel.findOne({ roleName: "ceo" });
    if (!ceoRole) {
      return badRequest(res, "CEO role not found");
    }

    const ceo = await employeeModel.findOne({ roleId: ceoRole._id }).populate("designationId");
    if (!ceo) {
      return badRequest(res, "CEO not found");
    }

    const hierarchy = {
      Id: ceo._id,
      name: ceo.employeName,
      position: ceo.designationId?.name || "N/A",
    };

    success(res, "CEO details retrieved successfully", hierarchy);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}


// ------------------HRMS  dashboard  employee count ---------------------------------------

async function getAllCountData(req, res) {
  try {
    // Use countDocuments() to directly get the count
    const totalEmployee = await employeeModel.countDocuments({ onboardingStatus: "enrolled"});
    const totalActiveEmployee = await employeeModel.countDocuments({ status: "active" ,onboardingStatus: "enrolled"});
    const totalInactiveEmployee = await employeeModel.countDocuments({ status: "inactive" ,onboardingStatus: "enrolled"});

    const totalBranch = await branchModel.countDocuments({ isActive: true });
    const totalWorkLocation = await workLocationModel.countDocuments({ isActive: true });
    const totalDepartment = await departmentModel.countDocuments({ isActive: true });
    const totalDesignation = await designationModel.countDocuments({ isActive: true });

    success(res, "All Dashboard details", {
      totalEmployee,
      totalActiveEmployee,
      totalInactiveEmployee,
      totalBranch,
      totalWorkLocation,
      totalDepartment,
      totalDesignation
    });
  } catch (error) {
    unknownError(res, error);
  }
}

// ------------------HRMS  dashboard  employee count in branch location and department---------------------------------------
async function getEmployeeCount(req, res) {
  try {
    let query = {};

    if (req.query.branchId) {
      query.branchId = req.query.branchId;
    }
    if (req.query.company) {
      query.company = req.query.company;
    }
    if (req.query.workLocationId) {
      query.workLocationId = req.query.workLocationId;
    }
    if (req.query.departmentId) {
      query.departmentId = req.query.departmentId;
    }
    if (req.query.roleId) {
      query.roleId = req.query.roleId;
    }
    if (req.query.designationId) {
      query.designationId = req.query.designationId;
    }
    if (req.query.reportingManagerId) {
      query.reportingManagerId = req.query.reportingManagerId;
    }
    if (req.query.employementTypeId) {
      query.employementTypeId = req.query.employementTypeId;
    }
    if (req.query.constCenterId) {
      query.constCenterId = req.query.constCenterId;
    }

    // Case-sensitive employeName filter
    if (req.query.employeName) {
      query.employeName = new RegExp(`^${req.query.employeName}`,"i");
    }

    query = { ...query, status: "active", onboardingStatus: "enrolled" };

    const employeeDetails = await employeeModel
      .find(query, { password: 0 })
      .populate({ path: "roleId", select: "_id roleName" })
      .populate({
        path: "reportingManagerId",
        select: "_id userName employeName",
      })
      .populate({ path: "employeeTypeId", select: "_id title" })
      .populate({ path: "employementTypeId", select: "_id title" })
      .populate({ path: "constCenterId", select: "_id title" })
      .populate({ path: "branchId", select: "_id name" })
      .populate({ path: "departmentId", select: "_id name" })
      .populate({ path: "subDepartmentId", select: "_id name" })
      .populate({ path: "designationId", select: "_id name" })
      .populate({ path: "subDepartmentId", select: "_id name" })
      .populate({ path: "workLocationId", select: "_id name" });

    const employeeIds = employeeDetails.map(emp => emp._id.toString());

    // Find all employees who are set as someone’s reportingManagerId
    const managers = await employeeModel.find(
      { reportingManagerId: { $in: employeeIds } },
      { reportingManagerId: 1 }
    );

    const managerIdsSet = new Set(managers.map(m => m.reportingManagerId.toString()));
      // Get pending task counts by employeeId
      const pendingTasks = await taskModel.aggregate([
        {
          $match: {
            employeeId: { $in: employeeDetails.map(emp => emp._id) },
            assignBy: { $in: employeeDetails.map(emp => emp._id) },
            status: "pending"
          }
        },
        {
          $group: {
            _id: "$employeeId",
            count: { $sum: 1 }
          }
        }
      ]);
  
      const taskCountMap = {};
      pendingTasks.forEach(task => {
        taskCountMap[task._id.toString()] = task.count;
      });

      const employeesGroupedByManager = await employeeModel.aggregate([
        {
          $match: {
            reportingManagerId: { $in: employeeIds.map(id => new mongoose.Types.ObjectId(id)) }
          }
        },
        {
          $group: {
            _id: "$reportingManagerId",
            photos: { $push: "$employeePhoto" }
          }
        }
      ]);
  
      const managerPhotosMap = {};
      employeesGroupedByManager.forEach(manager => {
        managerPhotosMap[manager._id.toString()] = manager.photos;
      });

    // Add manager: true/false to each employee
    const updatedEmployeeDetails = employeeDetails.map(emp => {
      const isManager = managerIdsSet.has(emp._id.toString());
      const empObj = emp.toObject(); // ensure plain object
      const empId = empObj._id.toString();
      const task = taskCountMap[empId] || 0;

      const employePhotoDetail = isManager
      ? { employePhotos: managerPhotosMap[empId] || [] }
      : {};
      
      return {
        ...emp.toObject(),
        manager: isManager,
        pendingTask: task,
        employePhotoDetail: employePhotoDetail
      };
    });

    const employeeCount = updatedEmployeeDetails.length;

    success(res, "Employee Count", { employeeCount, employeeDetails: updatedEmployeeDetails });
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}


// async function getEmployeeCount(req, res) {
//   try {
//     let query = {};

//     if (req.query.branchId) {
//       query.branchId = req.query.branchId;
//     }
//     if (req.query.company) {
//       query.company = req.query.company;
//     }
//     if (req.query.workLocationId) {
//       query.workLocationId = req.query.workLocationId;
//     }
//     if (req.query.departmentId) {
//       query.departmentId = req.query.departmentId;
//     }
//     if (req.query.roleId) {
//       query.roleId = req.query.roleId;
//     }
//     if (req.query.designationId) {
//       query.designationId = req.query.designationId;
//     }
//     if (req.query.reportingManagerId) {
//       query.reportingManagerId = req.query.reportingManagerId;
//     }
//     if (req.query.employementTypeId) {
//       query.employementTypeId = req.query.employementTypeId;
//     }
//     if (req.query.constCenterId) {
//       query.constCenterId = req.query.constCenterId;
//     }
//     if (req.query.employeName) {
//       query.employeName = new RegExp(`^${req.query.employeName}$`);
//     }

//      query = { ...query, status: "active",onboardingStatus: "enrolled"  };
//     const employeeDetails = await employeeModel
//       .find(query, { password: 0 })
//       .populate({ path: "roleId", select: "_id roleName" })
//       .populate({
//         path: "reportingManagerId",
//         select: "_id userName employeName",
//       })
//       .populate({ path: "employeeTypeId", select: "_id title" })
//       .populate({ path: "employementTypeId", select: "_id title" })
//       .populate({ path: "constCenterId", select: "_id title" })
//       .populate({ path: "branchId", select: "_id name" })
//       .populate({ path: "departmentId", select: "_id name" })
//       .populate({ path: "subDepartmentId", select: "_id name" })
//       .populate({ path: "designationId", select: "_id name" })
//       .populate({ path: "subDepartmentId", select: "_id name" })
//       .populate({ path: "workLocationId", select: "_id name" });

//     const employeeCount = employeeDetails.length;

//     success(res, "Employee Count ", { employeeCount, employeeDetails });
//   } catch (error) {
//     console.log(error);
//     unknownError(res, error);
//   }
// }



// ------------------HRMS  dashboard  employeecount in a particular branch location or department---------------------------------------

async function dropdownData(req, res) {
  try {
    const { branchId, workLocationId, departmentId } = req.query;

    let result = {};

    const getBranches = async () => {
      const branches = await branchModel.find();
      result.branchCount = branches.length;
      result.branches = branches.map((branch) => ({
        _id: branch._id,
        branch: branch.branch,
      }));
    };

    const getWorkLocations = async (branchId) => {
      const filter = branchId ? { branchId } : {};
      const workLocations = await locationModel.find(filter);
      result.workLocationCount = workLocations.length;
      result.workLocations = workLocations.map((location) => ({
        _id: location._id,
        title: location.title,
      }));
    };

    const getDepartments = async (branchId, workLocationId) => {
      const filter = {
        ...(branchId && { branchId }),
        ...(workLocationId && { workLocationId }),
      };
      const departments = await departmentModel.find(filter);
      result.departmentCount = departments.length;
      result.departments = departments.map((department) => ({
        _id: department._id,
        departmentName: department.departmentName,
      }));
    };

    if (!branchId && !workLocationId && !departmentId) {
      await getBranches();
      // await getWorkLocations();
      // await getDepartments();
    } else if (branchId && !workLocationId && !departmentId) {
      await getBranches();
      await getWorkLocations(branchId);
      // await getDepartments(branchId);
    } else if (branchId && workLocationId && !departmentId) {
      await getBranches();
      await getWorkLocations(branchId);
      await getDepartments(branchId, workLocationId);
    } else if (branchId && workLocationId && departmentId) {
      await getBranches();
      await getWorkLocations(branchId);
      await getDepartments(branchId, workLocationId);
    }

    success(res, "Data fetched successfully", result);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

//------------------------------------demographice data------------------------------------------------------------------
async function demographiceData(req, res) {
  try {
    //total employee count
    let employeeData = await employeeModel.find({
      status: "active",
      onboardingStatus: "enrolled"
    });

    const headCount = employeeData.length;

    //department wise data from employee
    const departmentNames = [
      "sales",
      "back office executive",
      "cops",
      "finance",
      "collection",
    ];

    const departmentEmployeeCounts = await employeeModel.aggregate([
      {
        $lookup: {
          from: "departments", // Collection name for departments
          localField: "departmentId", // Field in employeeModel
          foreignField: "_id", // Field in departments collection
          as: "department", // Alias for the joined data
        },
      },
      {
        $unwind: {
          path: "$department", // Unwind the department array
        },
      },
      {
        $match: {
          "department.departmentName": { $in: departmentNames }, // Match department names in the array
          status: "active", // Match employee status 'active'
          onboardingStatus: "enrolled"
        },
      },
      {
        $group: {
          _id: "$department.departmentName", // Group by department name
          count: { $sum: 1 }, // Count the number of employees per department
        },
      },
      {
        $project: {
          departmentName: "$_id", // Project the department name
          count: 1, // Project the count of employees
          _id: 0, // Exclude the _id field
        },
      },
    ]);

    //calculate year range of employee
    const yearRanges = await employeeModel.aggregate([
      {
        $match: {
          status: "active", // Match employee status 'active'
          onboardingStatus: "enrolled"
        },
      },
      {
        $addFields: {
          yearsOfService: {
            $divide: [
              { $subtract: [new Date(), "$joiningDate"] }, // Difference between current date and joining date
              1000 * 60 * 60 * 24 * 365.25, // Convert milliseconds to years (including leap year adjustment)
            ],
          },
        },
      },
      {
        $bucket: {
          groupBy: "$yearsOfService", // Group based on years of service
          boundaries: [0, 1, 2, 3, 4], // Define the boundaries for the buckets (0-1, 1-2, 2-3, 3-4 years)
          default: "4+", // Label for employees with more than 4 years of service
          output: {
            count: { $sum: 1 }, // Count the number of employees in each range
          },
        },
      },
      {
        $project: {
          _id: 0, // Exclude the _id field
          range: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", 0] }, then: "0-1" },
                { case: { $eq: ["$_id", 1] }, then: "1-2" },
                { case: { $eq: ["$_id", 2] }, then: "2-3" },
                { case: { $eq: ["$_id", 3] }, then: "3-4" },
                { case: { $eq: ["$_id", "4+"] }, then: "4+" },
              ],
              default: "unknown",
            },
          },
          count: 1,
        },
      },
    ]);

    // employment type data
    const title = ["full time", "login", "fix"];

    const employeeTypeCounts = await employeeModel.aggregate([
      {
        $lookup: {
          from: "employeetypes", // Collection name for departments
          localField: "employeeTypeId", // Field in employeeModel
          foreignField: "_id", // Field in departments collection
          as: "employeetypes", // Alias for the joined data
        },
      },
      {
        $unwind: {
          path: "$employeetypes", // Unwind the department array
        },
      },
      {
        $match: {
          "employeetypes.title": { $in: title }, // Match department names in the array
          status: "active", // Match employee status 'active'
          onboardingStatus: "enrolled"
        },
      },
      {
        $group: {
          _id: "$employeetypes.title", // Group by department name
          count: { $sum: 1 }, // Count the number of employees per department
        },
      },
      {
        $replaceRoot: {
          newRoot: { $arrayToObject: [[{ k: "$_id", v: "$count" }]] }, // Transform each document to desired format
        },
      },
    ]);

    const orderedEmployeeTypeCounts = title.map((t) => {
      const found = employeeTypeCounts.find(
        (item) => Object.keys(item)[0] === t
      );
      return found || { [t]: 0 }; // Default to 0 if not found
    });

    success(res, "All Employee details", {
      headCount,
      orderedEmployeeTypeCounts,
      departmentEmployeeCounts,
      yearRanges,
    });
  } catch (error) {
    unknownError(res, error);
  }
}

//---------------------------------------------open position data dashboard----------------------------------------------------
async function openPosition(req, res) {
  try {
    //total employee count
    let jobPost = await jobPostModel.find({
      status: "active",
    });

    const openings = jobPost.length;

    let jobPostList = await jobPostModel.aggregate([
      {
        $match: { status: "active" }, // Match only active status
      },
      {
        $lookup: {
          from: "departments", // Collection name
          localField: "departmentId", // Field in jobPostModel
          foreignField: "_id", // Field in departments collection
          as: "department", // Alias for the joined data
        },
      },
      {
        $unwind: "$department", // Unwind the department array to object
      },

      {
        $group: {
          _id: "$department.departmentName", // Group by department name
          jobCount: { $sum: 1 }, // Count the number of job posts per department
        },
      },
      {
        $sort: { departmentName: 1 }, // Optional: Sort by department name
      },
    ]);

    success(res, "All jobPost details", {
      openings,
      jobPostList,
    });
  } catch (error) {
    unknownError(res, error);
  }
}
//---------------------------------------------open position data dashboard----------------------------------------------------
async function getAllReportingManager(req, res) {
  try {
    
    const managerIds = await employeeModel.distinct("reportingManagerId", {
      reportingManagerId: { $ne: null }, // Exclude null values
      onboardingStatus: "enrolled"
    });

    // Step 2: Retrieve full data of each manager
    const managersData = await employeeModel.find({
      _id: { $in: managerIds },
    }).select(
      "_id employeName status"
    );
    const count = managersData.length;
    success(res, "Successfully retrieved all reporting managers", {
      count,
      managersData,
    });

  } catch (error) {
    unknownError(res, error);
  }
}


module.exports = {
  getAllCountData,
  getEmployeeCount,
  dropdownData,
  demographiceData,
  openPosition,
  getAllReportingManager,
  employeeHierarchy,
  getCeo
};
