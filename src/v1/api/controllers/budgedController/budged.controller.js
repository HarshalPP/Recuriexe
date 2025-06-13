import OrganizationBudget from "../../models/budgedModel/organizationbug.model.js"
import BudgetModel from "../../models/budgedModel/budged.model.js"
import designationModel from "../../models/designationModel/designation.model.js";
import organizationModel from "../../models/organizationModel/organization.model.js";
import departmentModel from "../../models/deparmentModel/deparment.model.js";
import jobPostModel from "../../models/jobPostModel/jobPost.model.js";
import {
  success,
  unknownError,
  serverValidation,
  badRequest,
  notFound
} from "../../formatters/globalResponse.js"
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

// 1. Set organization budget
export const setOrganizationBudget = async (req, res) => {
  try {
    const { company, type, totalBudget } = req.body;
    const organizationId = req.employee.organizationId; // Assuming you have the organization ID from the authenticated user
    const existingBudget = await OrganizationBudget.findOne({ company, organizationId });

    if (existingBudget) {
      return badRequest(res, 'Organization budget already exists for this Organization');
    }

    const organizationBudget = new OrganizationBudget({
      company,
      type,
      totalBudget,
      remainingBudget: totalBudget,
      organizationId: organizationId // Set the organization ID
      // Set initial remaining budget equal to total budget
    });

    await organizationBudget.save();

    return success(res, 'Organization budget created successfully', organizationBudget);
  } catch (error) {
    console.error('Error setting organization budget:', error);
    return unknownError(res, error);
  }
};


// Update Orgainzation  Budeget //
export const UpdateOrganizationBudget = async (req, res) => {
  try {
    const { id, ...updatedData } = req.body;

    if (!id) {
      return badRequest(res, "Please provide the ID");
    }

    if (Object.keys(updatedData).length === 0) {
      return badRequest(res, "Please provide data to update");
    }

    // If totalBudget is being updated, reset remainingBudget to match it
    if (typeof updatedData.totalBudget === 'number') {
      updatedData.remainingBudget = updatedData.totalBudget;
    }

    const updatedBudget = await OrganizationBudget.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );

    if (!updatedBudget) {
      return notFound(res, "Organization budget not found");
    }

    return success(res, "Organization budget updated successfully", updatedBudget);
  } catch (error) {
    console.error("Error updating organization budget:", error);
    return unknownError(res, "Internal Server Error");
  }
};




// Get Orgainzation 

export const getOrganization = async (req, res) => {
  try {
    const organizationId = req.employee.organizationId; // Assuming you have the organization ID from the authenticated user

    const findOrganization = await OrganizationBudget.find({ status: "active", organizationId: organizationId })
      .sort({ createdAt: -1 })

    if (!findOrganization) {
      return success(res, "OrganizationBudged not found", [])
    }
    return success(res, "fetch Organization Successfully", findOrganization)
  } catch (error) {
    return unknownError(res, error)
  }
}


// 2. Allocate budget to a department
export const allocateDepartmentBudget = async (req, res) => {
  try {
    const orgainizationId = req.employee.organizationId; // Assuming you have the organization ID from the authenticated use
    if (!orgainizationId) {
      return badRequest(res, 'Organization ID is required');
    }
    const { departmentId, desingationId, organizationBudgetId, allocatedBudget, numberOfEmployees } = req.body;
    const organizationBudget = await OrganizationBudget.findById(organizationBudgetId);

    if (!organizationBudget) {
      return notFound(res, 'Organization budget not found');
    }

    // Check if the allocated budget exceeds the remaining budget
    if (allocatedBudget > organizationBudget.remainingBudget) {
      return notFound(res, 'Insufficient remaining budget for this allocation');
    }

    // Create a new department budget
    const departmentBudget = new BudgetModel({
      departmentId,
      desingationId,
      organizationBudget: organizationBudgetId,
      allocatedBudget,
      numberOfEmployees,
      organizationId: orgainizationId, // Set the organization ID
    });

    // Save the department budget
    await departmentBudget.save();

    // Update the remaining budget in the organization
    organizationBudget.remainingBudget -= allocatedBudget;
    await organizationBudget.save();

    return success(res, 'Department budget allocated successfully', departmentBudget);
  } catch (error) {
    console.error('Error allocating department budget:', error);
    return unknownError(res, error);
  }
};



// get Budged 

export const getDepartmentWiseBudgets = async (req, res) => {
  try {
    const organizationId = req.employee.organizationId; // Assuming you have the organization ID from the authenticated user
    const status = "active"
    const departmentBudgets = await BudgetModel.aggregate([

      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(organizationId),
          status: status
        }
      },

      {
        $lookup: {
          from: 'newdepartments', // Ensure this matches your actual department collection name
          localField: 'departmentId',
          foreignField: '_id',
          as: 'department'
        }
      },
      {
        $unwind: '$department'
      },
      {
        $lookup: {
          from: 'newdesignations', // Ensure this matches your actual designation collection name
          localField: 'desingationId',
          foreignField: '_id',
          as: 'designation'
        }
      }, {
        $unwind: '$designation'
      },
      {
        $lookup: {
          from: 'organizationbudgets', // Ensure this matches your organization budget collection name
          localField: 'organizationBudget',
          foreignField: '_id',
          as: 'organizationBudget'
        }
      },
      {
        $unwind: '$organizationBudget'
      },
      {
        $project: {
          _id: 1,
          departmentName: '$department.name',
          designationName: '$designation.name',
          departmentId: '$department._id',
          numberOfEmployees: 1,
          allocatedBudget: 1,
          organizationBudgetType: '$organizationBudget.type',
          organizationCompany: '$organizationBudget.company',
          createdAt: 1
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    return success(res, 'Department-wise budget fetched successfully', departmentBudgets);
  } catch (error) {
    console.error('Error fetching department-wise budget:', error);
    return unknownError(res, error);
  }
};


// Update Budged //

// export const updateDepartmentBudget = async (req, res) => {
//   try {
//     const { budgetId } = req.params;
//     const {
//       departmentId,
//       organizationBudgetId,
//       allocatedBudget,
//       numberOfEmployees,
//       status
//     } = req.body;

//     const departmentBudget = await BudgetModel.findById(budgetId);
//     if (!departmentBudget) {
//       return notFound(res, 'Department budget not found');
//     }

//     const oldOrgBudget = await OrganizationBudget.findById(departmentBudget.organizationBudget);
//     if (!oldOrgBudget) {
//       return notFound(res, 'Original organization budget not found');
//     }

//     const newOrgBudget =
//       organizationBudgetId && organizationBudgetId !== String(departmentBudget.organizationBudget)
//         ? await BudgetModel.findById(organizationBudgetId)
//         : oldOrgBudget;

//     if (!newOrgBudget) {
//       return notFound(res, 'New organization budget not found');
//     }

//     // Refund old budget
//     oldOrgBudget.remainingBudget += departmentBudget.allocatedBudget;

//     // Check if new allocation is possible
//     if (allocatedBudget > newOrgBudget.remainingBudget) {
//       return notFound(res, 'Insufficient remaining budget in new organization allocation');
//     }

//     // Deduct new allocation
//     newOrgBudget.remainingBudget -= allocatedBudget;

//     // Update department budget fields
//     departmentBudget.departmentId = departmentId || departmentBudget.departmentId;
//     departmentBudget.organizationBudget = organizationBudgetId || departmentBudget.organizationBudget;
//     departmentBudget.allocatedBudget = allocatedBudget;
//     departmentBudget.numberOfEmployees = numberOfEmployees || departmentBudget.numberOfEmployees;
//     departmentBudget.status = status || departmentBudget.status

//     // Save changes
//     await departmentBudget.save();
//     await oldOrgBudget.save();
//     if (String(oldOrgBudget._id) !== String(newOrgBudget._id)) {
//       await newOrgBudget.save();
//     }

//     return success(res, 'Department budget updated successfully', departmentBudget);
//   } catch (error) {
//     console.error('Error updating department budget:', error);
//     return unknownError(res, error);
//   }
// };


export const updateDepartmentBudget = async (req, res) => {
  try {
    const { budgetId } = req.params;

    const { allocatedBudget, numberOfEmployees } = req.body;

    const departmentBudget = await BudgetModel.findById(budgetId);
    if (!departmentBudget) {
      return notFound(res, 'Department budget not found');
    }

    // Validate budget values (optional)
    if (allocatedBudget < 0 || numberOfEmployees < 0) {
      return badRequest(res, 'Allocated budget and number of employees must be non-negative');
    }

    // Update fields
    if (allocatedBudget !== undefined) departmentBudget.allocatedBudget = allocatedBudget;
    if (numberOfEmployees !== undefined) departmentBudget.numberOfEmployees = numberOfEmployees;

    await departmentBudget.save();

    return success(res, 'Department budget updated successfully', departmentBudget);
  } catch (error) {
    console.error('Error updating department budget:', error);
    return unknownError(res, error);
  }
};


// get Budget Dashboard //
export const getBudgetDashboard = async (req, res) => {
  try {
    const organizationId = req.employee.organizationId;
    const status = "active";

    // Get organization budget overview
    const organizationBudget = await OrganizationBudget.findOne({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      status: status
    });

    if (!organizationBudget) {
      return badRequest(res, 'No organization budget found');
    }

    // Get department-wise budget allocation with detailed breakdown
    const departmentWiseData = await BudgetModel.aggregate([
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(organizationId),
          status: status
        }
      },
      {
        $lookup: {
          from: 'newdepartments',
          localField: 'departmentId',
          foreignField: '_id',
          as: 'department'
        }
      },
      {
        $unwind: '$department'
      },
      {
        $lookup: {
          from: 'newdesignations',
          localField: 'desingationId',
          foreignField: '_id',
          as: 'designation'
        }
      },
      {
        $unwind: '$designation'
      },
      {
        $group: {
          _id: {
            departmentId: '$department._id',
            departmentName: '$department.name'
          },
          totalAllocated: { $sum: '$allocatedBudget' },
          HoldingBudget: { $sum: '$HoldingBudget' },
          totalEmployees: { $sum: '$numberOfEmployees' },
          designations: {
            $push: {
              designationId: '$designation._id',
              designationName: '$designation.name',
              allocatedBudget: '$allocatedBudget',
              numberOfEmployees: '$numberOfEmployees',
              budgetPerEmployee: { $divide: ['$allocatedBudget', '$numberOfEmployees'] }
            }
          }
        }
      },
      {
        $project: {
          departmentId: '$_id.departmentId',
          departmentName: '$_id.departmentName',
          totalAllocated: 1,
          HoldingBudget: 1,
          totalEmployees: 1,
          averageBudgetPerEmployee: { $divide: ['$totalAllocated', '$totalEmployees'] },
          designations: 1,
          _id: 0
        }
      },
      {
        $sort: { totalAllocated: -1 }
      }
    ]);

    // Get budget summary statistics
    const budgetSummary = await BudgetModel.aggregate([
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(organizationId),
          status: status
        }
      },
      {
        $group: {
          _id: null,
          totalAllocatedBudget: { $sum: '$allocatedBudget' },
          HoldingBudget: { $sum: '$HoldingBudget' },
          totalEmployees: { $sum: '$numberOfEmployees' },
          totalDepartments: { $addToSet: '$departmentId' },
          totalDesignations: { $addToSet: '$desingationId' },
          averageBudgetPerEmployee: { $avg: { $divide: ['$allocatedBudget', '$numberOfEmployees'] } },
          maxBudgetAllocation: { $max: '$allocatedBudget' },
          minBudgetAllocation: { $min: '$allocatedBudget' }
        }
      },
      {
        $project: {
          totalAllocatedBudget: 1,
          HoldingBudget: 1,
          totalEmployees: 1,
          totalDepartments: { $size: '$totalDepartments' },
          totalDesignations: { $size: '$totalDesignations' },
          averageBudgetPerEmployee: { $round: ['$averageBudgetPerEmployee', 2] },
          maxBudgetAllocation: 1,
          minBudgetAllocation: 1,
          _id: 0
        }
      }
    ]);

    // Get top performing departments (by budget allocation)
    const topDepartments = await BudgetModel.aggregate([
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(organizationId),
          status: status
        }
      },
      {
        $lookup: {
          from: 'newdepartments',
          localField: 'departmentId',
          foreignField: '_id',
          as: 'department'
        }
      },
      {
        $unwind: '$department'
      },
      {
        $group: {
          _id: '$department._id',
          departmentName: { $first: '$department.name' },
          totalBudget: { $sum: '$allocatedBudget' },
          HoldingBudget: { $sum: '$HoldingBudget' },
          totalEmployees: { $sum: '$numberOfEmployees' }
        }
      },
      {
        $project: {
          departmentName: 1,
          totalBudget: 1,
          HoldingBudget: 1,
          totalEmployees: 1,
          budgetPerEmployee: { $divide: ['$totalBudget', '$totalEmployees'] }
        }
      },
      {
        $sort: { totalBudget: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Get designation-wise budget distribution
    const designationWiseData = await BudgetModel.aggregate([
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(organizationId),
          status: status
        }
      },
      {
        $lookup: {
          from: 'newdesignations',
          localField: 'desingationId',
          foreignField: '_id',
          as: 'designation'
        }
      },
      {
        $unwind: '$designation'
      },
      {
        $lookup: {
          from: 'newdepartments',
          localField: 'departmentId',
          foreignField: '_id',
          as: 'department'
        }
      },
      {
        $unwind: '$department'
      },
      {
        $group: {
          _id: '$designation._id',
          designationName: { $first: '$designation.name' },
          totalBudget: { $sum: '$allocatedBudget' },
          HoldingBudget: { $sum: '$HoldingBudget' },
          totalEmployees: { $sum: '$numberOfEmployees' },
          departments: {
            $addToSet: {
              departmentName: '$department.name',
              departmentBudget: '$allocatedBudget'
            }
          }
        }
      },
      {
        $project: {
          designationName: 1,
          totalBudget: 1,
          HoldingBudget: 1,
          totalEmployees: 1,
          averageBudgetPerEmployee: { $divide: ['$totalBudget', '$totalEmployees'] },
          departmentCount: { $size: '$departments' },
          departments: 1
        }
      },
      {
        $sort: { totalBudget: -1 }
      }
    ]);

    // Calculate budget utilization percentage and remaining budget breakdown
    const summary = budgetSummary[0] || {};
    const totalAllocated = summary.totalAllocatedBudget || 0;
    const totalHoldingBudget = summary.HoldingBudget || 0;
    const totalBudget = organizationBudget.totalBudget || 0;
    const remainingBudget = organizationBudget.remainingBudget || 0;
    const utilizationPercentage = totalBudget > 0 ? ((totalAllocated / totalBudget) * 100).toFixed(2) : 0;

    // Recent budget allocations (last 10)
    const recentAllocations = await BudgetModel.aggregate([
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(organizationId),
          status: status
        }
      },
      {
        $lookup: {
          from: 'newdepartments',
          localField: 'departmentId',
          foreignField: '_id',
          as: 'department'
        }
      },
      {
        $unwind: '$department'
      },
      {
        $lookup: {
          from: 'newdesignations',
          localField: 'desingationId',
          foreignField: '_id',
          as: 'designation'
        }
      },
      {
        $unwind: '$designation'
      },
      {
        $project: {
          departmentName: '$department.name',
          designationName: '$designation.name',
          allocatedBudget: 1,
          numberOfEmployees: 1,
          createdAt: 1
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Budget efficiency metrics
    const budgetEfficiency = {
      averageBudgetPerDepartment: departmentWiseData.length > 0 ? (totalAllocated / departmentWiseData.length).toFixed(2) : 0,
      averageBudgetPerDesignation: designationWiseData.length > 0 ? (totalAllocated / designationWiseData.length).toFixed(2) : 0,
      budgetConcentrationRatio: topDepartments.length > 0 ? ((topDepartments.slice(0, 3).reduce((sum, dept) => sum + dept.totalBudget, 0) / totalAllocated) * 100).toFixed(2) : 0
    };

    // Prepare dashboard response
    const dashboardData = {
      organizationOverview: {
        company: organizationBudget.company,
        budgetType: organizationBudget.type,
        totalBudget: totalBudget,
        HoldingBudget: totalHoldingBudget,
        totalAllocatedBudget: totalAllocated,
        remainingBudget: remainingBudget,
        utilizationPercentage: parseFloat(utilizationPercentage),
        lastUpdated: organizationBudget.updatedAt
      },

      summary: {
        ...summary,
        budgetEfficiency
      },

      departmentWiseBreakdown: departmentWiseData,

      designationWiseBreakdown: designationWiseData,

      topPerformingDepartments: topDepartments,

      recentBudgetAllocations: recentAllocations,

      budgetDistribution: {
        allocated: totalAllocated,
        remaining: remainingBudget,
        utilizationRate: parseFloat(utilizationPercentage)
      },

      insights: {
        highestBudgetDepartment: topDepartments[0] || null,
        averageBudgetPerEmployee: summary.averageBudgetPerEmployee || 0,
        totalResourcesManaged: {
          departments: summary.totalDepartments || 0,
          designations: summary.totalDesignations || 0,
          employees: summary.totalEmployees || 0
        }
      }
    };

    return success(res, 'Budget dashboard data fetched successfully', dashboardData);

  } catch (error) {
    console.error('Error fetching budget dashboard:', error);
    return unknownError(res, error);
  }
};

// Additional helper API for budget analytics
export const getBudgetAnalytics = async (req, res) => {
  try {
    const organizationId = req.employee.organizationId;
    const { timeRange = '30' } = req.query; // days
    const status = "active";

    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - parseInt(timeRange));

    // Budget allocation trends
    const allocationTrends = await BudgetModel.aggregate([
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(organizationId),
          status: status,
          createdAt: { $gte: dateFilter }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          dailyAllocation: { $sum: '$allocatedBudget' },
          employeesAdded: { $sum: '$numberOfEmployees' },
          allocationsCount: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    // Department growth analysis
    const departmentGrowth = await BudgetModel.aggregate([
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(organizationId),
          status: status
        }
      },
      {
        $lookup: {
          from: 'newdepartments',
          localField: 'departmentId',
          foreignField: '_id',
          as: 'department'
        }
      },
      {
        $unwind: '$department'
      },
      {
        $group: {
          _id: '$department.name',
          currentBudget: { $sum: '$allocatedBudget' },
          currentEmployees: { $sum: '$numberOfEmployees' },
          allocationsCount: { $sum: 1 },
          averageAllocationSize: { $avg: '$allocatedBudget' }
        }
      },
      {
        $project: {
          departmentName: '$_id',
          currentBudget: 1,
          currentEmployees: 1,
          allocationsCount: 1,
          averageAllocationSize: { $round: ['$averageAllocationSize', 2] },
          budgetPerEmployee: { $round: [{ $divide: ['$currentBudget', '$currentEmployees'] }, 2] },
          _id: 0
        }
      },
      {
        $sort: { currentBudget: -1 }
      }
    ]);

    const analyticsData = {
      allocationTrends,
      departmentGrowthAnalysis: departmentGrowth,
      timeRange: `${timeRange} days`,
      generatedAt: new Date()
    };

    return success(res, 'Budget analytics data fetched successfully', analyticsData);

  } catch (error) {
    console.error('Error fetching budget analytics:', error);
    return unknownError(res, error);
  }
};


export const manBudgetDashboardApi = async (req, res) => {
  try {
    const { departmentId, desingationId, search } = req.query;

    const organizationId = req.employee.organizationId
    const filter = {};

    if (departmentId) {
      const departmentIdsArray = departmentId.split(',').map(id => new mongoose.Types.ObjectId(id));
      filter.departmentId = { $in: departmentIdsArray };
    }

    if (desingationId) {
      const desingationIdsArray = desingationId.split(',').map(id => new mongoose.Types.ObjectId(id));
      filter.desingationId = { $in: desingationIdsArray };
    }

    if (organizationId) {
      filter.organizationId = new mongoose.Types.ObjectId(organizationId);
    }
    const data = await BudgetModel.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'newdepartments',
          let: { subDeptId: '$departmentId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $gt: [
                    {
                      $size: {
                        $filter: {
                          input: '$subDepartments',
                          as: 'sub',
                          cond: { $eq: ['$$sub._id', '$$subDeptId'] }
                        }
                      }
                    },
                    0
                  ]
                }
              }
            }
          ],
          as: 'department'
        }
      },
      { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },

      // Find matching subDepartment inside the department
      {
        $addFields: {
          subDepartment: {
            $first: {
              $filter: {
                input: "$department.subDepartments",
                as: "sub",
                cond: { $eq: ["$$sub._id", "$departmentId"] }
              }
            }
          }
        }
      },

      // Lookup designation
      {
        $lookup: {
          from: 'newdesignations',
          localField: 'desingationId',
          foreignField: '_id',
          as: 'designation',
        }
      },
      { $unwind: { path: "$designation", preserveNullAndEmptyArrays: true } },

      ...(search
        ? [{
          $match: {
            $or: [
              { "department.name": { $regex: search, $options: 'i' } },
              { "subDepartment.name": { $regex: search, $options: 'i' } },
              { "designation.name": { $regex: search, $options: 'i' } }
            ]
          }
        }]
        : []),

      {
        $addFields: {
          departmentName: { $ifNull: ["$department.name", ""] },
          subDepartmentName: { $ifNull: ["$subDepartment.name", ""] },
          departmentId: "$departmentId",
          desingationName: { $ifNull: ["$designation.name", ""] },
          desingationId: "$desingationId",
          numberOfEmployees: { $ifNull: ["$numberOfEmployees", 0] },
          allocatedBudget: { $ifNull: ["$allocatedBudget", 0] },
          // perEmployeeLPA: {
          //   $cond: [
          //     { $eq: ["$numberOfEmployees", 0] },
          //     0,
          //     { $divide: ["$allocatedBudget", "$numberOfEmployees"] }
          //   ]
          // },
          perEmployeeLPA: {
            $cond: [
              { $eq: ["$numberOfEmployees", 0] },
              0,
              {
                $divide: [
                  { $divide: ["$allocatedBudget", "$numberOfEmployees"] },
                  100000
                ]
              }
            ]
          }
        }
      },

      {
        $group: {
          _id: null,
          totalSubDepartments: { $addToSet: "$departmentId" },
          totalEmployees: { $sum: "$numberOfEmployees" },
          totalAllocatedBudget: { $sum: "$allocatedBudget" },
          records: {
            $push: {
              _id: "$_id",
              departmentName: "$departmentName",
              subDepartmentName: "$subDepartmentName",
              desingationName: "$desingationName",
              departmentId: "$departmentId",
              desingationId: "$desingationId",
              numberOfEmployees: "$numberOfEmployees",
              allocatedBudget: "$allocatedBudget",
              perEmployeeLPA: "$perEmployeeLPA",
            }
          }
        }
      },

      {
        $addFields: {
          totalDepartments: { $size: "$totalSubDepartments" },
          averageAllocatedBudget: {
            $cond: [
              { $eq: [{ $size: "$totalSubDepartments" }, 0] },
              0,
              { $divide: ["$totalAllocatedBudget", { $size: "$totalSubDepartments" }] }
            ]
          }
        }
      },

      {
        $project: {
          totalDepartments: 1,
          totalEmployees: 1,
          totalAllocatedBudget: 1,
          averageAllocatedBudget: 1,
          records: 1
        }
      }
    ]);

    return success(res, "Budget Dashboard List", {
      data: data[0] || {
        totalDepartments: 0,
        totalEmployees: 0,
        totalAllocatedBudget: 0,
        averageAllocatedBudget: 0,
        records: []
      }
    });

  } catch (error) {
    console.error("Error in department dashboard API:", error);
    return unknownError(res, error);
  }
};



export const getSetBudgetDesingation = async (req, res) => {
  try {
    const { organizationId, subDepartmentId, desingationId } = req.body; // or use req.query / req.params

    if (!desingationId) {
      return badRequest(res, "Desingation Id Required.");
    }

    const designationDetail = await designationModel.findById(desingationId)
    if (!designationDetail) {
      return notFound(res, "designation Not Found");
    }

    if (!subDepartmentId) {
      return badRequest(res, "Sub Department Id Required.");
    }


    const subDepartmentDetail = await departmentModel.findOne({
      subDepartments: {
        $elemMatch: { _id: new mongoose.Types.ObjectId(subDepartmentId) }
      }
    });

    if (!subDepartmentDetail) {
      return notFound(res, "Sub Department Not Found");
    }

    if (!organizationId) {
      return badRequest(res, "Organization Id Required.");
    }
    const organizationDetail = await organizationModel.findById(organizationId)
    if (!organizationDetail) {
      return notFound(res, "organization Not Found");
    }


    const budget = await BudgetModel.findOne({
      organizationId,
      departmentId: subDepartmentId,
      desingationId
    });
    return success(res, "Budget Detail", { data: budget });

  } catch (error) {
    console.error("Error fetching budget:", error);
    return unknownError(res, "error ", { error: error.message });
  }
};


///------------------------------------------------------------------------------------------------------

// Get Budget Analytics Overview
// export const manBudgetDashboard = async (req, res) => {
//   try {
//     const { year = new Date().getFullYear(), period = 7, organizationId } = req.query;

//     const periodInDays = parseInt(period);
//     if (isNaN(periodInDays) || periodInDays <= 0) {
//       return badRequest(res, "Invalid period value. Must be a positive number.");
//     }

//     const endDate = new Date();
//     const startDate = new Date();
//     startDate.setDate(endDate.getDate() - periodInDays);

//     // Build match criteria
//     const matchCriteria = {
//       status: "active",
//       createdAt: { $gte: startDate, $lte: endDate }
//     };

//     if (organizationId) {
//       matchCriteria.organizationId = organizationId;
//     }

//     // Get budget analytics using aggregation
//     const analytics = await BudgetModel.aggregate([
//       { $match: matchCriteria },
//       {
//         $group: {
//           _id: null,
//           totalAllocatedBudget: { $sum: "$allocatedBudget" },
//           totalUsedBudget: { $sum: "$usedBudget" },
//           totalEmployees: { $sum: "$numberOfEmployees" },
//           departmentCount: { $sum: 1 },
//           avgAllocatedBudget: { $avg: "$allocatedBudget" },
//           avgUsedBudget: { $avg: "$usedBudget" }
//         }
//       }
//     ]);

//     const data = analytics[0] || {
//       totalAllocatedBudget: 0,
//       totalUsedBudget: 0,
//       totalEmployees: 0,
//       departmentCount: 0,
//       avgAllocatedBudget: 0,
//       avgUsedBudget: 0
//     };

//     // Calculate derived metrics
//     const budgetRemaining = data.totalAllocatedBudget - data.totalUsedBudget;
//     const avgPayPerEmployee = data.totalEmployees > 0 
//       ? (data.totalUsedBudget / data.totalEmployees).toFixed(2)
//       : 0;

//     const result = {
//       annualAllocation: data.totalAllocatedBudget,
//       budgetUtilized: data.totalUsedBudget,
//       budgetRemaining,
//       totalEmployees: data.totalEmployees,
//       avgPayPerEmployee: parseFloat(avgPayPerEmployee),
//       departmentCount: data.departmentCount,
//       period: periodInDays,
//       year: parseInt(year)
//     };

//     return success(res, "Budget DashBoard", result);
//   } catch (error) {
//     console.error('Error in :', error);
//     return unknownError(res, "Error ",error);
//   }
// };

export const manBudgetDashboard = async (req, res) => {
  try {
    const { year = new Date().getFullYear(), period = 7, } = req.query;
    const periodInDays = parseInt(period);

const organizationId = req.employee.organizationId

    if(!organizationId){
      return badRequest(res , "invalid token organizationId not found")
    }
    if (isNaN(periodInDays) || periodInDays <= 0) {
      return badRequest(res, "Invalid period value. Must be a positive number.");
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - periodInDays);

    // Build match criteria
    const matchCriteria = {
      status: "active",
      createdAt: { $gte: startDate, $lte: endDate }
    };

    if (organizationId) {
      matchCriteria.organizationId = new ObjectId(organizationId)
    }

    // Get overall budget analytics
    const analytics = await BudgetModel.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: null,
          totalAllocatedBudget: { $sum: "$allocatedBudget" },
          totalUsedBudget: { $sum: "$usedBudget" },
          totalEmployees: { $sum: "$numberOfEmployees" },
          departmentCount: { $sum: 1 },
          avgAllocatedBudget: { $avg: "$allocatedBudget" },
          avgUsedBudget: { $avg: "$usedBudget" }
        }
      }
    ]);

    const data = analytics[0] || {
      totalAllocatedBudget: 0,
      totalUsedBudget: 0,
      totalEmployees: 0,
      departmentCount: 0,
      avgAllocatedBudget: 0,
      avgUsedBudget: 0
    };

    // Get Budget Overdrawn Departments (usedBudget > allocatedBudget)
    let overdrawnDepartments = [];

    overdrawnDepartments = await BudgetModel.aggregate([
      {
        $match: {
          ...matchCriteria,
          $expr: {
            $and: [
              { $gt: ["$usedBudget", "$allocatedBudget"] },
              { $gt: ["$allocatedBudget", 0] }
            ]
          }
        }
      },
      {
        $lookup: {
          from: "newdesignations",
          localField: "desingationId",
          foreignField: "_id",
          as: "designation"
        }
      },
      {
        $lookup: {
          from: "newdepartments",
          localField: "designation.departmentId",
          foreignField: "_id",
          as: "departmentDetail"
        }
      },
      {
  $lookup: {
    from: "newdepartments",
    let: {
      subDeptId: { $arrayElemAt: ["$designation.subDepartmentId", 0] }
    },
    pipeline: [
      { $unwind: "$subDepartments" },
      {
        $match: {
          $expr: {
            $eq: ["$subDepartments._id", "$$subDeptId"]
          }
        }
      },
      {
        $project: {
          _id: "$subDepartments._id",
          name: "$subDepartments.name"
        }
      }
    ],
    as: "subDepartment"
  }
},
      { $unwind: { path: "$subDepartment", preserveNullAndEmptyArrays: true } },

      //  {
      //       $lookup: {
      //         from: 'newdepartments',
      //         let: { subDeptId: '$designation.subDepartmentId' },
      //         pipeline: [
      //           {
      //             $match: {
      //               $expr: {
      //                 $gt: [
      //                   {
      //                     $size: {
      //                       $filter: {
      //                         input: '$subDepartments',
      //                         as: 'sub',
      //                         cond: { $eq: ['$$sub._id', '$$subDeptId'] }
      //                       }
      //                     }
      //                   },
      //                   0
      //                 ]
      //               }
      //             }
      //           }
      //         ],
      //         as: 'sunDepartmentDetail'
      //       }
      //     },

      {
        $addFields: {
          budgetOverdraw: { $subtract: ["$usedBudget", "$allocatedBudget"] },
          overdrawPercentage: {
            $cond: {
              if: { $gt: ["$allocatedBudget", 0] },
              then: {
                $round: [
                  {
                    $multiply: [
                      {
                        $divide: [
                          { $subtract: ["$usedBudget", "$allocatedBudget"] },
                          "$allocatedBudget"
                        ]
                      },
                      100
                    ]
                  },
                  2
                ]
              },
              else: 0
            }
          }
        }
      },
      // {
      //     $addFields: {
      //       subDepartment: {
      //         $first: {
      //           $filter: {
      //             input: "$sunDepartmentDetail.subDepartments",
      //             as: "sub",
      //             cond: { $eq: ["$$sub._id", "$departmentId"] }
      //           }
      //         }
      //       }
      //     }
      //   },
      {
        $project: {
          designationName: { $arrayElemAt: ["$designation.name", 0] },
          departmentName: { $arrayElemAt: ["$departmentDetail.name", 0] },
          // subDepartmentName: { $arrayElemAt: ["$sunDepartmentDetail.name", 0] },
          //  subDepartmentName: "$subDepartmentName.name",
          subDepartmentName: "$subDepartment.name",
          isSubDepartment: {
            $cond: {
              if: {
                $and: [
                  { $gt: [{ $size: { $ifNull: ["$department.subDepartments", []] } }, 0] },
                  { $ne: [{ $arrayElemAt: ["$department.subDepartments.subDepartmentName", 0] }, null] }
                ]
              },
              then: true,
              else: false
            }
          },
          numberOfEmployees: 1,
          usedBudget: 1,
          allocatedBudget: 1,
          budgetOverdraw: 1,
          overdrawPercentage: 1
        }
      },
      {
        $addFields: {
          displayName: {
            $cond: {
              if: "$isSubDepartment",
              then: "$subDepartmentName",
              else: "$departmentName"
            }
          }
        }
      },
      { $sort: { budgetOverdraw: -1 } }
    ]);

    // Get Budget Under-utilized Departments (usedBudget < allocatedBudget)
    const underUtilizedDepartments = await BudgetModel.aggregate([
      {
        $match: {
          ...matchCriteria,
          $expr: { $lt: ["$usedBudget", "$allocatedBudget"] }
        }
      },
      {
        $lookup: {
          from: "newdesignations",
          localField: "desingationId",
          foreignField: "_id",
          as: "designation"
        }
      },
      {
        $lookup: {
          from: "newdepartments",
          localField: "designation.departmentId",
          foreignField: "_id",
          as: "department"
        }
      },
{
  $lookup: {
    from: "newdepartments",
    let: {
      subDeptId: { $arrayElemAt: ["$designation.subDepartmentId", 0] }
    },
    pipeline: [
      { $unwind: "$subDepartments" },
      {
        $match: {
          $expr: {
            $eq: ["$subDepartments._id", "$$subDeptId"]
          }
        }
      },
      {
        $project: {
          _id: "$subDepartments._id",
          name: "$subDepartments.name"
        }
      }
    ],
    as: "subDepartment"
  }
},
      { $unwind: { path: "$subDepartment", preserveNullAndEmptyArrays: true } },


      {
        $addFields: {
          budgetUnderUtilized: { $subtract: ["$allocatedBudget", "$usedBudget"] },
          utilizationPercentage: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$usedBudget", "$allocatedBudget"] },
                  100
                ]
              },
              2
            ]
          }
        }
      },
      {
        $project: {
          designationName: { $arrayElemAt: ["$designation.name", 0] },
          departmentName: { $arrayElemAt: ["$department.name", 0] },
subDepartmentName: "$subDepartment.name",
          numberOfEmployees: 1,
          usedBudget: 1,
          allocatedBudget: 1,
          budgetUnderUtilized: 1,
          utilizationPercentage: 1
        }
      },
      {
        $addFields: {
          displayName: {
            $cond: {
              if: "$isSubDepartment",
              then: "$subDepartmentName",
              else: "$departmentName"
            }
          }
        }
      },
      { $sort: { budgetUnderUtilized: -1 } }
    ]);

    // Calculate derived metrics
    const budgetRemaining = data.totalAllocatedBudget - data.totalUsedBudget;
    const avgPayPerEmployee = data.totalEmployees > 0
      ? (data.totalUsedBudget / data.totalEmployees).toFixed(2)
      : 0;


    const result = {
      // Overall Statistics
      annualAllocation: data.totalAllocatedBudget,
      budgetUtilized: data.totalUsedBudget,
      budgetRemaining,
      totalEmployees: data.totalEmployees,
      avgPayPerEmployee: parseFloat(avgPayPerEmployee),
      departmentCount: data.departmentCount,
      period: periodInDays,
      year: parseInt(year),

      // Budget Analysis Lists
      budgetOverdrawn: {
        count: overdrawnDepartments.length,
        totalOverdraw: overdrawnDepartments.reduce((sum, dept) => sum + (dept.budgetOverdraw || 0), 0),
        
        departments: overdrawnDepartments.map(dept => ({
          designationName: dept.designationName || "",
          departmentName: dept.departmentName || "",
          subDepartmentName: dept.subDepartmentName || "",
          // departmentDisplayName: dept.displayName || dept.departmentName || "N/A",
          // isSubDepartment: dept.isSubDepartment || false,
          numberOfEmployees: dept.numberOfEmployees || 0,
          usedBudget: dept.usedBudget || 0,
          allocatedBudget: dept.allocatedBudget || 0,
          budgetOverdraw: dept.budgetOverdraw || 0,
          overdrawPercentage: dept.overdrawPercentage || 0
        }))
      },

      budgetUnderUtilized: {
        count: underUtilizedDepartments.length,
        totalUnderUtilized: underUtilizedDepartments.reduce((sum, dept) => sum + (dept.budgetUnderUtilized || 0), 0),
        departments: underUtilizedDepartments.map(dept => ({
          designationName: dept.designationName || "",
          departmentName: dept.departmentName || "",
          subDepartmentName: dept.subDepartmentName || "",
          // departmentDisplayName: dept.displayName || dept.departmentName || "N/A",
          // isSubDepartment: dept.isSubDepartment || false,
          numberOfEmployees: dept.numberOfEmployees || 0,
          usedBudget: dept.usedBudget || 0,
          allocatedBudget: dept.allocatedBudget || 0,
          budgetUnderUtilized: dept.budgetUnderUtilized || 0,
          utilizationPercentage: dept.utilizationPercentage || 0
        }))
      }
    };

    return success(res, "Budget Dashboard", result);

  } catch (error) {
    console.error('Error in manBudgetDashboard:', error);
    return unknownError(res, "Error in budget dashboard", error);
  }
};

export const budgetVerify = async (req, res) => {
  try {
    const organizationId = req.employee.organizationId;
    const { subDepartmentId, desingationId } = req.query

    if (!subDepartmentId) {
      return badRequest(res, "sub Department Id Is Required");
    }

    if (!desingationId) {
      return badRequest(res, "desingation Id Is Required");
    }

    if (!organizationId) {
      return badRequest(res, "organization Id Is Required Invalid Token");
    }

    const findBudget = await BudgetModel.findOne({
      // departmentId: subDepartmentId,
      organizationId: organizationId,
      desingationId: desingationId
    });

    if (!findBudget || findBudget.allocatedBudget === 0 || findBudget.numberOfEmployees === 0) {
      return badRequest(res, "Please set budget first");
    }

    const budgetData = {
      allocatedBudget: findBudget.allocatedBudget,
      usedBudget: findBudget.usedBudget,
      allocatedBudgetLPA: (findBudget.allocatedBudget / 100000).toFixed(2),
      usedBudgetLPA: (findBudget.usedBudget / 100000).toFixed(2),
      numberOfEmployees: findBudget.numberOfEmployees,
    };

    return success(res, "budget Detail", budgetData)
  } catch (error) {
    console.error("Error adding job post:", error);
    return unknownError(res, error);
  }
}