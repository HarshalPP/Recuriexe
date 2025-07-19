const EmployeeModel = require("../model/adminMaster/employe.model");
const { returnFormatter } = require("../formatter/common.formatter");
const { default: mongoose } = require("mongoose");
const processModel = require("../model/process.model");


async function getFullEmployeeHierarchy(employeeId) {
    try {
        // Initialize a Set to store unique employee IDs (avoid duplicates)
     
        const employeeIds = new Set();
        
        // Add the initial employee ID
        employeeIds.add(employeeId.toString());
        
        // Check if the employee exists
        const rootEmployee = await EmployeeModel.findById(employeeId);
       
        if (!rootEmployee) {
            return returnFormatter(false, "Employee not found");
        }
        
        // Process the hierarchy level by level
        let currentLevelIds = [employeeId];
        
        while (currentLevelIds.length > 0) {
            // Find all employees reporting to the current level IDs
            const nextLevelEmployees = await EmployeeModel.find(
                { reportingManagerId: { $in: currentLevelIds } },
                { _id: 1 } // Only fetch the IDs
            );
            
            // If no more reportees are found, break the loop
            if (nextLevelEmployees.length === 0) {
                break;
            }
            
            // Extract IDs for the next level
            const nextLevelIds = nextLevelEmployees.map(emp => emp._id.toString());
            
            // Add new IDs to the Set
            nextLevelIds.forEach(id => employeeIds.add(id));
            
            // Update current level for the next iteration
            currentLevelIds = nextLevelIds;
        }
        
        // Convert the Set to an Array for the response
        const hierarchyIds = Array.from(employeeIds);
        
        return returnFormatter(true, "Employee hierarchy IDs retrieved successfully", hierarchyIds);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}


async function getEmployeeHierarchyByBranch() {
  try {
      // Step 1: Run your existing aggregation
      const rootEmployee = await EmployeeModel
      .aggregate([
          // Stage 1: Match only active employees
          {
            $match: { 
              status: "active" 
            }
          },
          
          // Stage 2: Look up branch information
          {
            $lookup: {
              from: "newbranches",
              localField: "branchId",
              foreignField: "_id",
              as: "branchDetails"
            }
          },
          
          // Stage 3: Unwind branch details
          {
            $unwind: {
              path: "$branchDetails",
              preserveNullAndEmptyArrays: true
            }
          },
          
          // Stage 4: Project required fields
          {
            $project: {
              _id: 1,
              employeeName: "$employeName",
              employeeId: "$_id",
              reportingManagerId: 1,
              branchId: 1,
              branchName: { $ifNull: ["$branchDetails.name", "No Branch"] }
            }
          },
          
          // Stage 5: Group employees by their reporting manager and branch
          {
            $group: {
              _id: {
                branchId: "$branchId",
                managerId: "$reportingManagerId"
              },
              branchName: { $first: "$branchName" },
              totalEmployees: { $sum: 1 },
              employeeIds: { $push: "$employeeId" }
            }
          },
          
          // Stage 6: Look up manager information
          {
            $lookup: {
              from: "employees",
              localField: "_id.managerId",
              foreignField: "_id",
              as: "managerInfo"
            }
          },
          
          // Stage 7: Unwind manager info (if exists)
          {
            $unwind: {
              path: "$managerInfo",
              preserveNullAndEmptyArrays: true
            }
          },
          
          // Stage 8: Restructure to intermediate format
          {
            $project: {
              _id: 0,
              branchId: "$_id.branchId",
              branchName: "$branchName",
              manager: { $ifNull: ["$managerInfo.employeName", "No Manager"] },
              managerId: "$_id.managerId", // Include manager ID for hierarchy building
              totalEmployeeUnderManager: "$totalEmployees",
              employeeIdList: "$employeeIds"
            }
          },
          
          // Stage 9: Group by branch to organize managers under branches
          {
            $group: {
              _id: {
                branchId: "$branchId",
                branchName: "$branchName"
              },
              managers: {
                $push: {
                  manager: "$manager",
                  managerId: "$managerId",
                  totalEmployeeUnderManager: "$totalEmployeeUnderManager",
                  employeeIdList: "$employeeIdList"
                }
              },
              totalBranchEmployees: { $sum: "$totalEmployeeUnderManager" }
            }
          },
          
          // Stage 10: Final projection
          {
            $project: {
              _id: 0,
              branchId: "$_id.branchId",
              branch: "$_id.branchName",
              totalBranchEmployees: 1,
              managers: 1
            }
          },
          
          // Stage 11: Sort by branch name
          {
            $sort: { branch: 1 }
          }
        ]);
      
      // Step 2: Get the manager-employee relationship
      const allEmployees = await EmployeeModel.find(
          { status: "active" },
          { _id: 1, employeName: 1, reportingManagerId: 1 }
      ).lean();
      
      // Create maps for lookups
      const employeeIdToName = {};
      const employeeNameToId = {};
      
      allEmployees.forEach(emp => {
          employeeIdToName[emp._id.toString()] = emp.employeName;
          employeeNameToId[emp.employeName] = emp._id.toString();
      });
      
      // Process each branch
      for (const branch of rootEmployee) {
          // Create a map of manager name to their information
          const managerNameToInfo = {};
          branch.managers.forEach(managerInfo => {
              managerNameToInfo[managerInfo.manager] = managerInfo;
          });
          
          // Find manager-subordinate relationships within this branch
          for (const emp of allEmployees) {
              if (!emp.reportingManagerId) continue;
              
              const managerName = employeeIdToName[emp.reportingManagerId.toString()];
              
              // If this employee is a manager and their manager is also in this branch
              if (managerNameToInfo[emp.employeName] && managerNameToInfo[managerName]) {
                  const manager = managerNameToInfo[managerName];
                  const subordinateManager = managerNameToInfo[emp.employeName];
                  
                  // Add the subordinate manager's employees to the manager's list
                  manager.employeeIdList = [
                      ...manager.employeeIdList,
                      ...subordinateManager.employeeIdList
                  ];
                  
                  // Remove duplicates
                  manager.employeeIdList = [...new Set(manager.employeeIdList.map(id => id.toString()))];
                  manager.totalEmployeeUnderManager = manager.employeeIdList.length;
              }
          }
          
          // Cleanup: remove managerId from output since it wasn't in original structure
          branch.managers.forEach(manager => {
              delete manager.managerId;
          });
          
          // Recalculate total branch employees (to avoid double counting)
          const uniqueEmployees = new Set();
          branch.managers.forEach(manager => {
              manager.employeeIdList.forEach(empId => {
                  uniqueEmployees.add(empId.toString());
              });
          });
          branch.totalBranchEmployees = uniqueEmployees.size;
      }
      
      return returnFormatter(true, "Employee hierarchy IDs retrieved successfully", rootEmployee);
  } catch (error) {
      return returnFormatter(false, error.message);
  }
}

// async function getEmployeeHierarchyWithProcessCount(startDate = null, endDate = null) {
//   try {
//       // Set default dates if not provided
//       const today = new Date();
//       let startDateObj, endDateObj;
      
//       if (!startDate) {
//           // Start of today
//           startDateObj = new Date(today);
//           startDateObj.setHours(0, 0, 0, 0);
//           startDate = startDateObj.toISOString().split('T')[0]; // Format: YYYY-MM-DD
//       } else {
//           startDateObj = new Date(startDate);
//           startDate = startDateObj.toISOString().split('T')[0];
//       }
      
//       if (!endDate) {
//           // End of today
//           endDateObj = new Date(today);
//           endDateObj.setHours(23, 59, 59, 999);
//           endDate = endDateObj.toISOString().split('T')[0]; // Format: YYYY-MM-DD
//       } else {
//           endDateObj = new Date(endDate);
//           endDateObj.setHours(23, 59, 59, 999);
//           endDate = endDateObj.toISOString().split('T')[0];
//       }
      
//       // Get employee hierarchy first
//       const hierarchyResult = await getEmployeeHierarchyByBranch();
      
//       if (!hierarchyResult.status) {
//           return hierarchyResult; // Return error if hierarchy fetch failed
//       }
      
//       const employeeHierarchy = hierarchyResult.data;
      
//       // For each branch in the hierarchy
//       for (const branch of employeeHierarchy) {
//           // For each manager in the branch
//           for (const manager of branch.managers) {
//               // Get the count of processes for all employees under this manager
//               const employeeIds = manager.employeeIdList.map(id => 
//                   typeof id === 'object' ? id : new mongoose.Types.ObjectId(id)
//               );
              
//               // Query for manager process count (using distinct to avoid duplicates)
//               const managerProcesses = await processModel.distinct("_id", {
//                   employeId: { $in: employeeIds },
//                   // All these form conditions must be true
//                   customerFormStart: true,
//                   customerFormComplete: true,
//                   applicantFormStart: true,
//                   applicantFormComplete: true,
//                   coApplicantFormStart: true,
//                   coApplicantFormComplete: true,
//                   guarantorFormStart: true,
//                   guarantorFormComplete: true,
//                   // Date filter
//                   salesCompleteDate: {
//                       $gte: startDate,
//                       $lte: endDate
//                   }
//               });
              
//               // Add process count to manager info
//               manager.processCount = managerProcesses.length;
//           }
          
//           // Calculate total unique process count for the branch
//           // Get all employee IDs for this branch
//           const allBranchEmployeeIds = [];
//           branch.managers.forEach(manager => {
//               manager.employeeIdList.forEach(id => {
//                   allBranchEmployeeIds.push(
//                       typeof id === 'object' ? id : new mongoose.Types.ObjectId(id)
//                   );
//               });
//           });
          
//           // Query for total branch process count (distinct to avoid duplicates)
//           const branchProcesses = await processModel.distinct("_id", {
//               employeId: { $in: allBranchEmployeeIds },
//               customerFormStart: true,
//               customerFormComplete: true,
//               applicantFormStart: true,
//               applicantFormComplete: true,
//               coApplicantFormStart: true,
//               coApplicantFormComplete: true,
//               guarantorFormStart: true,
//               guarantorFormComplete: true,
//               salesCompleteDate: {
//                   $gte: startDate,
//                   $lte: endDate
//               }
//           });
          
//           branch.totalProcessCount = branchProcesses.length;
//       }
      
//       return returnFormatter(true, "Employee hierarchy with process counts retrieved successfully", employeeHierarchy);
//   } catch (error) {
//       return returnFormatter(false, error.message);
//   }
// }


async function getEmployeeHierarchyWithProcessCount(startDate = null, endDate = null) {
  try {
      // Set default dates if not provided
      const today = new Date();
      let startDateObj, endDateObj;
      
      if (!startDate) {
          // Start of today
          startDateObj = new Date(today);
          startDateObj.setHours(0, 0, 0, 0);
          startDate = startDateObj.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      } else {
          startDateObj = new Date(startDate);
          startDate = startDateObj.toISOString().split('T')[0];
      }
      
      if (!endDate) {
          // End of today
          endDateObj = new Date(today);
          endDateObj.setHours(23, 59, 59, 999);
          endDate = endDateObj.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      } else {
          endDateObj = new Date(endDate);
          endDateObj.setHours(23, 59, 59, 999);
          endDate = endDateObj.toISOString().split('T')[0];
      }
      
      // Step 1: Get all active employees with their hierarchy info
      const allEmployees = await EmployeeModel
      .aggregate([
          // Match only active employees
          { $match: { status: "active" } },
          
          // Look up branch information
          {
            $lookup: {
              from: "newbranches",
              localField: "branchId",
              foreignField: "_id",
              as: "branchDetails"
            }
          },
          
          // Unwind branch details
          {
            $unwind: {
              path: "$branchDetails",
              preserveNullAndEmptyArrays: true
            }
          },
          
          // Project required fields
          {
            $project: {
              _id: 1,
              employeeName: "$employeName",
              employeeId: "$_id",
              reportingManagerId: 1,
              branchId: 1,
              branchName: { $ifNull: ["$branchDetails.name", "No Branch"] }
            }
          }
      ]);
      
      // Step 2: Get process counts for all employees in a single query
      const processConditions = {
          customerFormStart: true,
          customerFormComplete: true,
          applicantFormStart: true,
          applicantFormComplete: true,
          coApplicantFormStart: true,
          coApplicantFormComplete: true,
          guarantorFormStart: true,
          guarantorFormComplete: true,
          salesCompleteDate: {
              $gte: startDate,
              $lte: endDate
          }
      };
      
      // Get all process counts in one aggregation
      const processCounts = await processModel.aggregate([
          { $match: processConditions },
          {
              $group: {
                  _id: "$employeId",
                  count: { $sum: 1 }
              }
          }
      ]);
      
      // Create a map for quick lookup
      const employeeProcessCountMap = {};
      processCounts.forEach(item => {
          if (item._id) {
              employeeProcessCountMap[item._id.toString()] = item.count;
          }
      });
      
      // Step 3: Build employee maps for hierarchy building
      const employeeMap = {};
      const employeesByManager = {};
      const employeesByBranch = {};
      
      allEmployees.forEach(emp => {
          const empId = emp.employeeId.toString();
          
          // Store employee in map with process count
          employeeMap[empId] = {
              ...emp,
              processCount: employeeProcessCountMap[empId] || 0
          };
          
          // Group by manager
          if (emp.reportingManagerId) {
              const managerId = emp.reportingManagerId.toString();
              if (!employeesByManager[managerId]) {
                  employeesByManager[managerId] = [];
              }
              employeesByManager[managerId].push(empId);
          }
          
          // Group by branch
          if (emp.branchId) {
              const branchId = emp.branchId.toString();
              if (!employeesByBranch[branchId]) {
                  employeesByBranch[branchId] = {
                      branchId: emp.branchId,
                      branch: emp.branchName,
                      employees: [],
                      managers: []
                  };
              }
              employeesByBranch[branchId].employees.push(empId);
          }
      });
      
      // Identify all managers (employees who have direct reports)
      Object.keys(employeesByManager).forEach(managerId => {
          const manager = employeeMap[managerId];
          if (manager && manager.branchId) {
              const branchId = manager.branchId.toString();
              if (employeesByBranch[branchId]) {
                  employeesByBranch[branchId].managers.push(managerId);
              }
          }
      });
      
      // Step 4: Build the complete hierarchy with process counts
      const result = [];
      
      // Function to get all direct subordinates (just one level)
      function getDirectSubordinates(managerId) {
          return employeesByManager[managerId] || [];
      }
      
      // Process each branch
      Object.values(employeesByBranch).forEach(branch => {
          const branchManagers = [];
          
          // Include ALL managers in the branch, regardless of hierarchy
          branch.managers.forEach(managerId => {
              const manager = employeeMap[managerId];
              
              // Get direct subordinates only
              const directSubordinateIds = getDirectSubordinates(managerId);
              
              // Get employee details
              const employeeDetails = directSubordinateIds.map(empId => ({
                  employeeId: employeeMap[empId].employeeId,
                  employeeName: employeeMap[empId].employeeName,
                  processCount: employeeMap[empId].processCount || 0
              }));
              
              // Calculate total process count for direct reports
              const totalDirectReportsProcessCount = employeeDetails.reduce(
                  (sum, emp) => sum + emp.processCount, 0
              );
              
              // Create the manager entry
              const managerEntry = {
                  manager: manager.employeeName,
                  managerId: manager.employeeId,
                  processCount: totalDirectReportsProcessCount,
                  totalEmployeeUnderManager: directSubordinateIds.length,
                  employeeIdList: directSubordinateIds,
                  employees: employeeDetails
              };
              
              branchManagers.push(managerEntry);
          });
          
          // Calculate total process count for the branch
          const totalProcessCount = branch.employees.reduce((sum, empId) => {
              return sum + (employeeMap[empId].processCount || 0);
          }, 0);
          
          // Add branch to results
          result.push({
              branchId: branch.branchId,
              branch: branch.branch,
              totalBranchEmployees: branch.employees.length,
              totalProcessCount,
              managers: branchManagers
          });
      });
      
      // Sort branches by name
      result.sort((a, b) => a.branch.localeCompare(b.branch));
      
      return returnFormatter(true, "Employee hierarchy with process counts retrieved successfully", result);
  } catch (error) {
      return returnFormatter(false, error.message);
  }
}

// Use the function like this:
// With default dates (today):
// const result = await getEmployeeHierarchyWithProcessCount();
// 
// With specific date range:
// const result = await getEmployeeHierarchyWithProcessCount('2023-01-01', '2023-01-31');

module.exports = {
    getFullEmployeeHierarchy,
    getEmployeeHierarchyByBranch,
    getEmployeeHierarchyWithProcessCount
};