const { default: mongoose } = require("mongoose");
const branchModel = require("../model/adminMaster/newBranch.model");
const companyModel = require("../model/adminMaster/company.model");
const costCenterModel = require("../model/adminMaster/costCenter.model");
const departmentModel = require("../model/adminMaster/department.model");
const designationModel = require("../model/adminMaster/designation.model");
const employeModel = require("../model/adminMaster/employe.model");
const workLocationModel = require("../model/adminMaster/workLocation.model");
const customerModel = require("../model/customer.model");

// Function to get start and end of today in IST
function getStartAndEndOfTodayInIST() {
  const now = new Date();

  // Get the current time in UTC milliseconds
  const utcTimeInMs = now.getTime() + now.getTimezoneOffset() * 60000;

  // IST offset is UTC+5:30
  const istOffsetInMs = 5.5 * 60 * 60 * 1000;

  // Current time in IST
  const istTimeInMs = utcTimeInMs + istOffsetInMs;
  const istDate = new Date(istTimeInMs);

  // Start of the month in IST
  const startOfMonthIST = new Date(istDate);
  startOfMonthIST.setDate(1);
  startOfMonthIST.setHours(0, 0, 0, 0);
  
  
  // End of the month in IST
  const endOfMonthIST = new Date(istDate);
  // Move to the next month and set date to 0 to get the last day of the current month
  endOfMonthIST.setMonth(endOfMonthIST.getMonth() + 1);
  endOfMonthIST.setDate(0);
  endOfMonthIST.setHours(23, 59, 59, 999);
  
  return { startOfMonthIST, endOfMonthIST };
}

// async function salesDashbaordHelper() {
//   try {
//     const employees = await employeModel
//       .find()
//       .select("_id employeName reportingManagerId");
//     const employeeMap = {};
//     // Create a map for quick lookup by _id
//     employees.forEach((employee) => {
//       employeeMap[employee._id.toString()] = {
//         ...employee._doc,
//         subordinates: [],
//       };
//     });

//     // Build the hierarchy
//     const hierarchy = [];
//     employees.forEach((employee) => {
//       if (employee.reportingManagerId) {
//         const manager = employeeMap[employee.reportingManagerId.toString()];
//         if (manager) {
//           manager.subordinates.push(employeeMap[employee._id.toString()]);
//         }
//       } else {
//         // If no reportingManagerId, it's a top-level head
//         hierarchy.push(employeeMap[employee._id.toString()]);
//       }
//     });
//     return hierarchy;
//   } catch (err) {
//     console.log(err);

//     return false;
//   }
// }

async function salesDashbaordHelper() {
  try {
    const roleIds = [
      new mongoose.Types.ObjectId("66a8e17ec3e96f6013b96d6b"),
      new mongoose.Types.ObjectId("66a8eee5c3e96f6013b96eb8"),
      new mongoose.Types.ObjectId("66f518972eb2d5b70e38a573"),
    ];

    // Get start and end of today in IST
    const {  startOfMonthIST, endOfMonthIST } = getStartAndEndOfTodayInIST();

    const employeesByBranch = await employeModel.aggregate([
      // Step 1: Match employees with specific roleIds
      {
        $match: {
          roleId: { $in: roleIds },
        },
      },
      // Step 2: Lookup customerdetails with paymentStatus "success" and today's date
      {
        $lookup: {
          from: "customerdetails",
          let: { empId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$employeId", "$$empId"] },
                    { $eq: ["$paymentStatus", "success"] },
                    { $gte: ["$createdAt", startOfMonthIST] },
                    { $lte: ["$createdAt", endOfMonthIST] },
                  ],
                },
              },
            },
          ],
          as: "loandetail",
        },
      },
      // Step 3: Add loandetailCount field
      {
        $addFields: {
          loandetailCount: { $size: "$loandetail" },
        },
      },
      // Step 4: Lookup reporting manager name
      {
        $lookup: {
          from: "employees", // Adjust the collection name as necessary
          localField: "reportingManagerId",
          foreignField: "_id",
          as: "reportingManager",
        },
      },
      {
        $unwind: {
          path: "$reportingManager",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Step 5: Group by branchId
      {
        $group: {
          _id: "$branchId",
          employees: {
            $push: {
              _id: "$_id",
              employeName: "$employeName",
              reportingManagerId: "$reportingManagerId",
              reportingManagerName: "$reportingManager.employeName",
              loandetailCount: "$loandetailCount",
            },
          },
          totalCases: { $sum: "$loandetailCount" },
        },
      },
      // Step 6: Lookup branch name from newBranch collection
      {
        $lookup: {
          from: "newbranches",
          localField: "_id",
          foreignField: "_id",
          as: "branchInfo",
        },
      },
      {
        $unwind: "$branchInfo",
      },
      // Step 7: Project desired fields
      {
        $project: {
          _id: 1,
          branchName: "$branchInfo.name",
          totalCases: 1,
          employees: 1,
        },
      },
      // Step 8: Sort employees within each branch based on loandetailCount
      {
        $unwind: "$employees",
      },
      {
        $sort: {
          "employees.loandetailCount": -1,
        },
      },
      {
        $group: {
          _id: "$_id",
          branchName: { $first: "$branchName" },
          totalCases: { $first: "$totalCases" },
          employees: { $push: "$employees" },
        },
      },
      {
        $sort: {
          branchName: 1,
        },
      },
    ]);

    return employeesByBranch;
  } catch (err) {
    console.log(err);

    return false;
  }
}

module.exports = { salesDashbaordHelper };
