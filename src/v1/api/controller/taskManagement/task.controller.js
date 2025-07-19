const {
    success,
    unknownError,
    serverValidation,
    badRequest,
    notFound
  } = require("../../../../../globalHelper/response.globalHelper");
  
  const { validationResult } = require("express-validator");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
  const taskModel = require("../../model/taskManagement/task.model"); 
  const groupTaskModel = require("../../model/taskManagement/groupTask.model")
  const employeModel = require("../../model/adminMaster/employe.model")
  const attendanceModel = require("../../model/adminMaster/attendance.model")
  const moment = require("moment-timezone");
  const { getFullEmployeeHierarchy } = require("../../helper/employee.helper");

//---------------------Task ADD---------------------------------------
async function taskAdd(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { assignBy, employeeId, tasks, description, title } = req.body;

    // Ensure employeeIds is provided as a valid array
    if (!employeeId || !Array.isArray(employeeId) || employeeId.length === 0) {
      return badRequest(res, "Please provide valid employeeIds as a non-empty array");
    }

    // Ensure tasks is an array
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return badRequest(res, "Please provide tasks as a non-empty array");
    }

    // Validate each task object (task and dueDate)
    for (const taskObj of tasks) {
      if (!taskObj.task || taskObj.task.trim() === "") {
        return badRequest(res, "Each task must have a valid task name");
      }
      if (!taskObj.dueDate || taskObj.dueDate.trim() === "") {
        return badRequest(res, "Each task must have a valid dueDate");
      }
    }

    const startDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");

    // Validate employeeIds
    const validEmployees = await employeModel.find({
      _id: { $in: employeeId.map(id => new ObjectId(id)) },
      status: "active",
    });

    if (!validEmployees || validEmployees.length === 0) {
      return badRequest(res, "No valid employees found");
    }

    // Prepare BOD/EOD entries for each employee
    const bodEodEntries = [];
    for (const employee of validEmployees) {
      for (const { task, dueDate } of tasks) {
        bodEodEntries.push({
          employeeId: employee._id,
          assignBy,
          task,
          dueDate,
          description,
          title,
          startDate,
        });
      }
    }

    // Insert all entries
    const data = await taskModel.insertMany(bodEodEntries);

    return success(res, "BOD/EOD entries created successfully", data);
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}


// ---------------self-assigned task Delete Only-----------------------
 async function selfTaskDelete(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const { taskId } = req.query;
    // Find the task by _id
    const task = await taskModel.findById(taskId);

    if (!task) {
      return notFound(res,'Task not found' );
    }

    if (
      // task.employeeId.toString() === task.assignBy.toString() &&
      task.groupId === null
    ) {

      await taskModel.findByIdAndDelete(taskId);
      return success(res, 'Task deleted successfully');
    } else {
      return badRequest(res,'Task does not meet deletion criteria');
    }
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}

// ---------------Self Assign Task Update-------------------------------
async function selfTaskUpdate(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { taskId } = req.body;
    const updateData = req.body; // Data to update the task

    // Find the task by _id
    const task = await taskModel.findById(taskId);

    if (!task) {
      return notFound(res, "Task not found");
    }

    // Check if the task meets the criteria for self-assigned tasks
    if (
      // task.employeeId.toString() === task.assignBy.toString() &&
      task.groupId === null
    ) {
      // Update the task with the provided data
      const updatedTask = await taskModel.findByIdAndUpdate(
        taskId,
        { $set: updateData },
        { new: true } // Return the updated document
      );

      return success(res, "Task updated successfully", updatedTask);
    } else {
      return badRequest(res, "Task does not meet update criteria");
    }
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}


// async function addGroupTask(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }

//     const tokenId = new ObjectId(req.Id); // ID of the user creating the task
//     const { employeeIds, task, dueDate, description, title } = req.body;

//     // Ensure employeeIds is provided as a valid array
//     if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
//       return badRequest(res, "Please provide a valid list of employeeIds");
//     }

//     const startDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");

//     // Generate groupId
//     const lastTaskWithGroupId = await groupTaskModel
//       .findOne({ groupId: { $ne: null } }) // Skip records with groupId: null
//       .sort({ createdAt: -1 })
//       .select("groupId");

//     let nextGroupId = "group01";

//     if (lastTaskWithGroupId && lastTaskWithGroupId.groupId) {
//       const lastGroupNumber = parseInt(lastTaskWithGroupId.groupId.replace("group", ""), 10);
//       const newGroupNumber = lastGroupNumber + 1;
//       nextGroupId = `group${String(newGroupNumber).padStart(2, "0")}`;
//     }

//     // Validate all employeeIds and ensure they are active
//     const validEmployees = await employeModel.find({
//       _id: { $in: employeeIds.map((id) => new ObjectId(id)) },
//       status: "active",
//     });

//     if (validEmployees.length !== employeeIds.length) {
//       return badRequest(res, "One or more employeeIds are invalid or inactive");
//     }

//     // Save the group task in groupTaskModel
//     const groupTask = await groupTaskModel.create({
//       groupId: nextGroupId,
//       createdBy: tokenId,
//       employeeIds: employeeIds.map((id) => new ObjectId(id)),
//     });

//     // Save a single task in taskModel
//     const taskData = {
//       employeeId: tokenId, // Assign to the creator
//       assignBy: tokenId, // The creator
//       task,
//       description,
//       startDate,
//       dueDate,
//       groupId: nextGroupId,
//     };

//     const taskEntry = await taskModel.create(taskData);

//     return success(res, "Group task and task created successfully", {
//       groupTask,
//       task: taskEntry,
//     });
//   } catch (error) {
//     console.error(error);
//     unknownError(res, error);
//   }
// }

// ----------------GET BOD EOD LIST  BY employeeId------------------------
async function getTaskByEmployeeId(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const result = await taskModel.aggregate([
      {
        $match: {
          employeeId: new ObjectId(req.query.employeeId),
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeDetail",
        },
      },
      {
        $unwind: "$employeeDetail",
      },
      {
        $lookup: {
          from: "employees",
          let: { remarkId: "$remark.remarkId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$remarkId"],
                },
              },
            },
            {
              $project: {
                _id: 1,
                employeUniqueId: 1,
                employeName: 1,
              },
            },
          ],
          as: "remarkDetail",
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $group: {
          _id: "$employeeId",
          employeeDetail: { $first: "$employeeDetail" },
          tasks: {
            $push: {
              _id: "$_id",
              employeeId: "$employeeId",
              assignBy: "$assignBy",
              title: "$title",
              task: "$task",
              description: "$description",
              startDate: "$startDate",
              dueDate: "$dueDate",
              endDate: "$endDate",
              status: "$status",
              createdAt: "$createdAt",
              updatedAt: "$updatedAt",
              remark: {
                $map: {
                  input: "$remark",
                  as: "remarkItem",
                  in: {
                    _id: "$$remarkItem._id",
                    remarkId: "$$remarkItem.remarkId",
                    content: "$$remarkItem.content",
                    taskFile: "$$remarkItem.taskFile",
                    time: "$$remarkItem.time",
                    remarkDetail: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$remarkDetail",
                            as: "remarkEmployee",
                            cond: {
                              $eq: ["$$remarkEmployee._id", "$$remarkItem.remarkId"],
                            },
                          },
                        },
                        0,
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          "employeeDetail.password": 0,"employeeDetail.bankDetails": 0,"employeeDetail.emergencyNumber": 0,"employeeDetail.aadhar": 0,
          "employeeDetail.panCard": 0,"employeeDetail.maritalStatus": 0,"employeeDetail.gender": 0,"employeeDetail.bankAccount": 0,
          "employeeDetail.ifscCode": 0,"employeeDetail.employeePhoto": 0,"employeeDetail.currentAddress": 0,"employeeDetail.permanentAddress": 0,
          "employeeDetail.branchId": 0,"employeeDetail.companyId": 0,"employeeDetail.roleId": 0,"employeeDetail.reportingManagerId": 0,
          "employeeDetail.departmentId": 0,"employeeDetail.designationId": 0,"employeeDetail.workLocationId": 0,"employeeDetail.constCenterId": 0,
          "employeeDetail.employementTypeId": 0,"employeeDetail.employeeTypeId": 0,"employeeDetail.status": 0,"employeeDetail.description": 0,
          "employeeDetail.offerLetter": 0,"employeeDetail.package": 0,"employeeDetail.resume": 0,"employeeDetail.salutation": 0,"employeeDetail.createdAt": 0,
          "employeeDetail.updatedAt": 0,"employeeDetail.__v": 0,"employeeDetail.fatherName": 0,"employeeDetail.employeUniqueId": 0,
          "employeeDetail.referedById": 0,"employeeDetail.bankAccountProof": 0,"employeeDetail.bankName": 0,
          "employeeDetail.currentAddressCity": 0,"employeeDetail.currentAddressPincode": 0,"employeeDetail.currentAddressState": 0,
          "employeeDetail.currentCTC": 0,"employeeDetail.currentDesignation": 0,"employeeDetail.educationCertification": 0,
          "employeeDetail.employmentProof": 0,"employeeDetail.endDate": 0,"employeeDetail.experienceLetter": 0,"employeeDetail.familyIncome": 0,
          "employeeDetail.fathersMobileNo": 0,"employeeDetail.fathersOccupation": 0,"employeeDetail.highestQualification": 0,
          "employeeDetail.lastOrganization": 0,"employeeDetail.motherName": 0,"employeeDetail.mothersMobileNo": 0,"employeeDetail.nameAsPerBank": 0,
          "employeeDetail.permanentAddressCity": 0,"employeeDetail.permanentAddressPincode": 0,"employeeDetail.permanentAddressState": 0,
          "employeeDetail.startDate": 0,"employeeDetail.totalExperience": 0,"employeeDetail.university": 0,
          "employeeDetail.identityMark": 0, "employeeDetail.height": 0, "employeeDetail.caste": 0,"employeeDetail.category": 0,
          "employeeDetail.religion": 0,"employeeDetail.bloodGroup": 0,"employeeDetail.homeDistrict": 0,"employeeDetail.homeState": 0,
          "employeeDetail.nearestRailwaySt": 0,"employeeDetail.joiningDate": 0, "employeeDetail.dateOfBirth": 0, "employeeDetail.aadhaarNo": 0,
          "employeeDetail.panNo": 0,  "employeeDetail.location":0,"employeeDetail.nominee":0, "employeeDetail.educationDetails":0,
          _id: 0
        },
      },
    ]);

    success(res, "Get Employee Task Detail", result.length > 0 ? result[0] : {});
  } catch (error) {
    console.error("Error in getTaskByEmployeeId:", error);
    unknownError(res, error);
  }
}

//-------------------* ReAssign Task Api *-----------------------------
async function reAssignTask(req, res) {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { id, assignBy, employeeId } = req.body;

    // Ensure employeeId is provided as a valid array
    if (!Array.isArray(employeeId) || employeeId.length === 0) {
      return badRequest(res, "Please provide a valid employeeId array");
    }

    // Validate employees
    const validEmployees = await employeModel.find({
      _id: { $in: employeeId.map((emp) => new ObjectId(emp)) },
      status: "active",
    });

    if (validEmployees.length === 0) {
      return badRequest(res, "No valid employees found");
    }

    // Find the valid employee IDs (to ensure we only work with valid IDs)
    const validEmployeeIds = validEmployees.map(emp => emp._id.toString());
    
    // Fetch the original task
    const originalTask = await taskModel.findById(id);
    if (!originalTask) {
      return badRequest(res, "Task not found");
    }

    let newTasks = [];

    // Create new tasks for all employees (keep original task untouched)
    const taskData = originalTask.toObject();
    delete taskData._id; // Remove the original _id to allow MongoDB to create new ones
    
    // Create tasks for all employees in the array
    const newTaskPromises = validEmployeeIds.map(empId => {
      const newTask = new taskModel({
        ...taskData,
        employeeId: new ObjectId(empId), // Set employeeId directly
        assignBy: new ObjectId(assignBy),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return newTask.save();
    });
    
    // Wait for all new tasks to be created
    newTasks = await Promise.all(newTaskPromises);

    return success(res, "Task reassigned successfully", newTasks);
  } catch (error) {
    console.error("Error in reAssignTask:", error);
    return unknownError(res, error);
  }
}

//------GET BOD EOD LIST BY TOKEN AND SELFTASK,ASSIGNTASK,RECEIVEDTASK------
async function getTaskById(req, res) {
  try {
    let { employeeId, status,taskStatus,startDate,endDate } = req.query;
    if(taskStatus == "all"){
      taskStatus = {"$in":["pending","WIP","processing","completed"]}
    }
    const employeeDetail = await employeModel.findById({ _id: new ObjectId(employeeId), status: "active" });
    if(!employeeDetail){
      return badRequest(res, "Employee Detail Not Found")
    }

    if (!status || !['selfTask', 'assignedTask', 'receivedTask'].includes(status)) {
      return badRequest(res, "Status must be 'selfTask', 'assignedTask', or 'receivedTask'.");
    }

    let matchCondition = {};

    if (status === "selfTask") {
      matchCondition = {
        employeeId: employeeDetail._id,
        assignBy: employeeDetail._id,
        groupId: null,
        status:taskStatus
      };

    } else if (status === "assignedTask") {
      matchCondition = {
        assignBy: employeeDetail._id,
        employeeId: { $ne: employeeDetail._id },
        groupId: null,
        status:taskStatus

      };
    } else if (status === "receivedTask") {
      matchCondition = {
        employeeId: employeeDetail._id,
        assignBy: { $ne: employeeDetail._id },
        groupId: null,
        status:taskStatus
      };
    }
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    
      matchCondition.createdAt = {
        $gte: start,
        $lte: end
      };
    } else if (startDate) {
      const start = new Date(startDate);
      matchCondition.createdAt = { $gte: start };
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchCondition.createdAt = { $lte: end };
    }

    const result = await taskModel.aggregate([
      { $match: matchCondition },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeDetail"
        }
      },
      { $unwind: "$employeeDetail" },
      {
        $lookup: {
          from: "employees",
          localField: "assignBy",
          foreignField: "_id",
          as: "assignDetail"
        }
      },
      { $unwind: "$assignDetail" },
      { $unwind: { path: "$remark", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "employees",
          let: { remarkId: "$remark.remarkId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$remarkId"] }
              }
            },
            {
              $project: {
                employeName: 1,

                employeUniqueId: 1,
                employeePhoto:1,
                type: {
                  $cond: {
                    if: { $eq: ["$_id", "$$remarkId"] },
                    then: "selfReply",
                    else: "otherReply"
                  }
                }
              }
            }
          ],
          as: "remarkUser"
        }
      },
      { $unwind: { path: "$remarkUser", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$_id",
          employeeId: { $first: "$employeeId" },
          assignBy: { $first: "$assignBy" },
          task: { $first: "$task" },
          title: { $first: "$title" },
          description: { $first: "$description" },
          startDate: { $first: "$startDate" },
          dueDate: { $first: "$dueDate" },
          endDate: { $first: "$endDate" },
          status: { $first: "$status" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          employeeDetail: { $first: "$employeeDetail" },
          assignDetail: { $first: "$assignDetail" },
          taskType: { $first: "$taskType" },
          redirectUrl: { $first: "$redirectUrl" },
          remark: {
            $push: {
              $cond: [
                { $ifNull: ["$remark", false] },
                {
                  _id: "$remark._id",
                  content: "$remark.content",
                  time: "$remark.time",
                  remarkUser: {
                    employeName: "$remarkUser.employeName",
                    employeUniqueId: "$remarkUser.employeUniqueId",
                    employeePhoto: "$remarkUser.employeePhoto",
                    type: {
                      $cond: {
                        if: { $eq: ["$remark.remarkId", "$employeeId"] },
                        then: "selfReply",
                        else: "otherReply"
                      }
                    }
                  }
                },
                "$$REMOVE"
              ]
            }
          }
        }
      },
      {
        $project: {
          task: 1,
          title:1,
          description: 1,
          startDate: 1,
          dueDate: 1,
          endDate: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          taskType:1,
          redirectUrl:1,
          employeeDetail: {
            _id: "$employeeDetail._id",
            employeName: "$employeeDetail.employeName",
            employeUniqueId: "$employeeDetail.employeUniqueId",
            employeePhoto: "$employeeDetail.employeePhoto"
          },
          assignDetail: {
            employeName: "$assignDetail.employeName",
            employeUniqueId: "$assignDetail.employeUniqueId",
            employeePhoto: "$employeeDetail.employeePhoto"
          },
          remark: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    return success(res, "Task details fetched successfully", result);
  } catch (error) {
    console.log(error);
    unknownError(res, error.message);
  }
}

//-----GET TASK OF SELF AND RECEIVED TASK API---------------------------
async function getAllTask(req, res) {
  try {
    let { taskStatus } = req.query;
    const employeeId = new ObjectId(req.Id); // Extracting employeeId from token

    if (taskStatus === "all") {
      taskStatus = { "$in": ["pending", "WIP", "processing", "completed"] };
    }

    const employeeDetail = await employeModel.findById({ _id: new ObjectId(employeeId), status: "active" });
    if (!employeeDetail) {
      return badRequest(res, "Employee Detail Not Found");
    }

    let matchCondition = {
      $or: [
        { employeeId: employeeDetail._id },  // Self Task & Received Task
        { assignBy: employeeDetail._id }     // Assigned Task
      ],
      groupId: null,
      status: taskStatus
    };

    const result = await taskModel.aggregate([
      { $match: matchCondition },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeDetail"
        }
      },
      { $unwind: "$employeeDetail" },
      {
        $lookup: {
          from: "employees",
          localField: "assignBy",
          foreignField: "_id",
          as: "assignDetail"
        }
      },
      { $unwind: "$assignDetail" },
      { $unwind: { path: "$remark", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "employees",
          let: { remarkId: "$remark.remarkId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$remarkId"] }
              }
            },
            {
              $project: {
                employeName: 1,
                employeUniqueId: 1,
                employeePhoto: 1,
                type: {
                  $cond: {
                    if: { $eq: ["$_id", "$$remarkId"] },
                    then: "selfReply",
                    else: "otherReply"
                  }
                }
              }
            }
          ],
          as: "remarkUser"
        }
      },
      { $unwind: { path: "$remarkUser", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$_id",
          employeeId: { $first: "$employeeId" },
          assignBy: { $first: "$assignBy" },
          task: { $first: "$task" },
          title: { $first: "$title" },
          description: { $first: "$description" },
          startDate: { $first: "$startDate" },
          dueDate: { $first: "$dueDate" },
          endDate: { $first: "$endDate" },
          status: { $first: "$status" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          employeeDetail: { $first: "$employeeDetail" },
          assignDetail: { $first: "$assignDetail" },
          remark: {
            $push: {
              $cond: [
                { $ifNull: ["$remark", false] },
                {
                  _id: "$remark._id",
                  content: "$remark.content",
                  time: "$remark.time",
                  remarkUser: {
                    employeName: "$remarkUser.employeName",
                    employeUniqueId: "$remarkUser.employeUniqueId",
                    employeePhoto: "$remarkUser.employeePhoto",
                    type: {
                      $cond: {
                        if: { $eq: ["$remark.remarkId", "$employeeId"] },
                        then: "selfReply",
                        else: "otherReply"
                      }
                    }
                  }
                },
                "$$REMOVE"
              ]
            }
          }
        }
      },
      {
        $project: {
          task: 1,
          title: 1,
          description: 1,
          startDate: 1,
          dueDate: 1,
          endDate: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          employeeDetail: {
            _id: "$employeeDetail._id",
            employeName: "$employeeDetail.employeName",
            employeUniqueId: "$employeeDetail.employeUniqueId",
            employeePhoto: "$employeeDetail.employeePhoto"
          },
          assignDetail: {
            employeName: "$assignDetail.employeName",
            employeUniqueId: "$assignDetail.employeUniqueId",
            employeePhoto: "$employeeDetail.employeePhoto"
          },
          selfTask: { $eq: ["$employeeId", "$assignBy"] },
          remark: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    return success(res, "Task details fetched successfully", result);
  } catch (error) {
    console.log(error);
    unknownError(res, error.message);
  }
}


// -----------------Employee Vice Task Get Api-----------------------------
async function getTaskByParticularId(req, res) {
  try {
    const tokenId = new ObjectId(req.Id);
    let { employeeId, status, taskStatus } = req.query;
    
    // Convert employeeId to ObjectId
    const employeeObjectId = new ObjectId(employeeId);
    
    // Validate task status
    if (taskStatus == "all") {
      taskStatus = { "$in": ["pending", "WIP", "processing", "completed"] };
    }
    
    // Validate employee exists
    const employeeDetail = await employeModel.findById({ 
      _id: employeeObjectId, 
      status: "active" 
    });
    
    if (!employeeDetail) {
      return badRequest(res, "Employee Detail Not Found");
    }
    
    // Validate status parameter
    if (!status || !['selfTask', 'assignedTask', 'receivedTask', 'employeeAndAssignedBy'].includes(status)) {
      return badRequest(res, "Status must be 'selfTask', 'assignedTask', 'receivedTask', or 'employeeAndAssignedBy'.");
    }
    
    let matchCondition = {};
    
    // Set match condition based on status parameter
    if (status === "selfTask") {
      matchCondition = {
        employeeId: employeeObjectId,
        assignBy: employeeObjectId,
        groupId: null,
        status: taskStatus
      };
    } else if (status === "assignedTask") {
      matchCondition = {
        employeeId: employeeObjectId,
        assignBy: tokenId,
        groupId: null,
        status: taskStatus
      };
    } else if (status === "receivedTask") {
      matchCondition = {
        employeeId: tokenId,
        assignBy: employeeObjectId,
        groupId: null,
        status: taskStatus
      };
    } 
    
    // First get count of matching tasks
    const taskCount = await taskModel.countDocuments(matchCondition);
    
    // Then get detailed task list with lookups
    const result = await taskModel.aggregate([
      { $match: matchCondition },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeDetail"
        }
      },
      { $unwind: "$employeeDetail" },
      {
        $lookup: {
          from: "employees",
          localField: "assignBy",
          foreignField: "_id",
          as: "assignDetail"
        }
      },
      { $unwind: "$assignDetail" },
      { $unwind: { path: "$remark", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "employees",
          let: { remarkId: "$remark.remarkId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$remarkId"] }
              }
            },
            {
              $project: {
                employeName: 1,
                employeUniqueId: 1,
                employeePhoto: 1,
                type: {
                  $cond: {
                    if: { $eq: ["$_id", "$$remarkId"] },
                    then: "selfReply",
                    else: "otherReply"
                  }
                }
              }
            }
          ],
          as: "remarkUser"
        }
      },
      { $unwind: { path: "$remarkUser", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$_id",
          employeeId: { $first: "$employeeId" },
          assignBy: { $first: "$assignBy" },
          title: { $first: "$title" },
          task: { $first: "$task" },
          description: { $first: "$description" },
          startDate: { $first: "$startDate" },
          dueDate: { $first: "$dueDate" },
          endDate: { $first: "$endDate" },
          status: { $first: "$status" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          employeeDetail: { $first: "$employeeDetail" },
          assignDetail: { $first: "$assignDetail" },
          remark: {
            $push: {
              $cond: [
                { $ifNull: ["$remark", false] },
                {
                  _id: "$remark._id",
                  content: "$remark.content",
                  time: "$remark.time",
                  remarkUser: {
                    employeName: "$remarkUser.employeName",
                    employeUniqueId: "$remarkUser.employeUniqueId",
                    employeePhoto: "$remarkUser.employeePhoto",
                    type: {
                      $cond: {
                        if: { $eq: ["$remark.remarkId", "$employeeId"] },
                        then: "selfReply",
                        else: "otherReply"
                      }
                    }
                  }
                },
                "$$REMOVE"
              ]
            }
          }
        }
      },
      {
        $project: {
          task: 1,
          description: 1,
          title: 1,
          startDate: 1,
          dueDate: 1,
          endDate: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          employeeDetail: {
            _id: "$employeeDetail._id",
            employeName: "$employeeDetail.employeName",
            employeUniqueId: "$employeeDetail.employeUniqueId",
            employeePhoto: "$employeeDetail.employeePhoto"
          },
          assignDetail: {
            employeName: "$assignDetail.employeName",
            employeUniqueId: "$assignDetail.employeUniqueId",
            employeePhoto: "$assignDetail.employeePhoto"
          },
          remark: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    // Format the response with tasks array
    return success(res, "Task details fetched successfully", result);
  } catch (error) {
    console.log(error);
    return unknownError(res, error.message);
  }
}

// -----------GET SELF TASK AND REcIEVED TASK LIST-------------------------
// async function getTaskEmployeeName(req, res) {
//   try {
//     const tokenId = new ObjectId(req.Id)

//     const employeeDetail = await employeModel.findById(tokenId);
//     if (!employeeDetail) {
//       return res.status(404).json({ message: "Employee not found." });
//     }
//     const {  status } = req.query;
//     // if(taskStatus == "all"){
//     //   taskStatus = {"$in":["pending","WIP","processing","completed"]}
//     // }

//     if (!status || !['selfTask', 'assignedTask', 'receivedTask'].includes(status)) {
//       return badRequest(res, "Status must be 'selfTask', 'assignedTask', or 'receivedTask'.");
//     }


//     let matchCondition = {};
//     if (status === "assignedTask") {

//       matchCondition = {
//         assignBy: employeeDetail._id,
//         employeeId: { $ne: employeeDetail._id },
//         groupId: null,
//         // status: taskStatus,
//       };
//     } else if (status === "receivedTask") {
//       matchCondition = {
//         employeeId: employeeDetail._id,
//         assignBy: { $ne: employeeDetail._id },
//         groupId: null,
//         // status: taskStatus,
//       };
//     } else {
//       return badRequest(res,"Invalid status value." );
//     }
//     const tasks = await taskModel.find(matchCondition);
//     if (!tasks.length) {
//       return notFound(res, "No tasks found.", []);
//     }
//     let employeeIds = [];
//     if (status === "assignedTask") {
//       employeeIds = [...new Set(tasks.map((task) => task.employeeId.toString()))];
//     } else if (status === "receivedTask") {
//       employeeIds = [...new Set(tasks.map((task) => task.assignBy.toString()))];
//     }

//     const employees = await employeModel.find(
//       { _id: { $in: employeeIds } },
//       "_id employeName employeUniqueId employeePhoto"
//     );

//     const formattedTasks = employees.map((emp) => ({
//       employeeId: emp._id,
//       employeName: emp.employeName,
//       employeUniqueId: emp.employeUniqueId,
//       employeePhoto: emp.employeePhoto,
//     }));

//     return success(res, "Task details fetched successfully", formattedTasks);
//   } catch (error) {
//     console.error('Error in getTaskById:', error);
//     return unknownError(res, error.message);
//   }
// }
async function getTaskEmployeeName(req, res) {
  try {
    const tokenId = new ObjectId(req.Id);

    const employeeDetail = await employeModel.findById(tokenId);
    if (!employeeDetail) {
      return notFound(res, "Employee not found.", []);
    }
    
    const { status } = req.query;
    if (!status || !['selfTask', 'assignedTask', 'receivedTask'].includes(status)) {
      return badRequest(res, "Status must be 'selfTask', 'assignedTask', or 'receivedTask'.");
    }

    let matchCondition = {};
    if (status === "assignedTask") {
      matchCondition = {
        assignBy: employeeDetail._id,
        employeeId: { $ne: employeeDetail._id },
        groupId: null,
      };
    } else if (status === "receivedTask") {
      matchCondition = {
        employeeId: employeeDetail._id,
        assignBy: { $ne: employeeDetail._id },
        groupId: null,
      };
    } else {
      return badRequest(res, "Invalid status value.");
    }

    const tasks = await taskModel.find(matchCondition);
    if (!tasks.length) {
      return notFound(res, "No tasks found.", []);
    }
    
    let employeeTaskMap = {};
    tasks.forEach(task => {
      const key = status === "assignedTask" ? task.employeeId.toString() : task.assignBy.toString();
      if (!employeeTaskMap[key]) {
        employeeTaskMap[key] = { count: 0 };
      }
      employeeTaskMap[key].count += 1;
    });

    const employeeIds = Object.keys(employeeTaskMap);
    const employees = await employeModel.find(
      { _id: { $in: employeeIds } },
      "_id employeName employeUniqueId employeePhoto"
    );

    const formattedTasks = employees.map((emp) => ({
      employeeId: emp._id,
      employeName: emp.employeName,
      employeUniqueId: emp.employeUniqueId,
      employeePhoto: emp.employeePhoto,
      taskCount: employeeTaskMap[emp._id.toString()].count,
    }));

    return success(res, "Task details fetched successfully", formattedTasks);
  } catch (error) {
    console.error('Error in getTaskEmployeeName:', error);
    return unknownError(res, error.message);
  }
}


//----------------GET BOD EOD LIST BY REPORTING MANAGER ID----------------
async function getTaskByManagerId(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    // Extract tokenId from request
    const tokenId = req.Id;

    // Find the employee by reportingManagerId
    const employees = await employeModel.find({ reportingManagerId: tokenId });
    const employeeId = employees.map(emp => emp._id);
    console.log("dd",employeeId)
    if (!employeeId.length) {
      return notFound(res, "Employee not found with the provided reportingManagerId.")
   
    }

    // If the employee is found, proceed with the aggregation
    const result = await taskModel.aggregate([
      { $match: { employeeId: { $in: employeeId } } },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeDetail",
        },
      },
      { $unwind: "$employeeDetail" },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$employeeId",
          employeeDetail: { $push: "$employeeDetail" },
          tasks: {
            $push: {
              _id: "$_id",
              employeeId: "$employeeId",
              task: "$task",
              description: "$description",
              startDate: "$startDate",
              endDate: "$endDate",
              managerBodStatus: "$managerBodStatus",
              managerEodStatus: "$managerEodStatus",
              status: "$status",
              createdAt: "$createdAt",
              updatedAt: "$updatedAt",
            },
          },
        },
      },
      {
        $project: {
          "employeeDetail.password": 0,
          "employeeDetail.bankDetails": 0,
          "employeeDetail.emergencyNumber": 0,
          "employeeDetail.aadhar": 0,
          "employeeDetail.panCard": 0,
          "employeeDetail.maritalStatus": 0,
          "employeeDetail.gender": 0,
          "employeeDetail.bankAccount": 0,
          "employeeDetail.ifscCode": 0,
          "employeeDetail.employeePhoto": 0,
          "employeeDetail.currentAddress": 0,
          "employeeDetail.permanentAddress": 0,
          "employeeDetail.branchId": 0,
          "employeeDetail.companyId": 0,
          "employeeDetail.roleId": 0,
          "employeeDetail.reportingManagerId": 0,
          "employeeDetail.departmentId": 0,
          "employeeDetail.designationId": 0,
          "employeeDetail.workLocationId": 0,
          "employeeDetail.constCenterId": 0,
          "employeeDetail.employementTypeId": 0,
          "employeeDetail.employeeTypeId": 0,
          "employeeDetail.status": 0,
          "employeeDetail.description": 0,
          "employeeDetail.offerLetter": 0,
          "employeeDetail.package": 0,
          "employeeDetail.resume": 0,
          "employeeDetail.salutation": 0,
          "employeeDetail.createdAt": 0,
          "employeeDetail.updatedAt": 0,
          "employeeDetail.__v": 0,
          "employeeDetail.fatherName": 0,
          "employeeDetail.employeUniqueId": 0,
          "employeeDetail.referedById": 0,
          "employeeDetail.bankAccountProof": 0,
          "employeeDetail.bankName": 0,
          "employeeDetail.currentAddressCity": 0,
          "employeeDetail.currentAddressPincode": 0,
          "employeeDetail.currentAddressState": 0,
          "employeeDetail.currentCTC": 0,
          "employeeDetail.currentDesignation": 0,
          "employeeDetail.educationCertification": 0,
          "employeeDetail.employmentProof": 0,
          "employeeDetail.endDate": 0,
          "employeeDetail.experienceLetter": 0,
          "employeeDetail.familyIncome": 0,
          "employeeDetail.fathersMobileNo": 0,
          "employeeDetail.fathersOccupation": 0,
          "employeeDetail.highestQualification": 0,
          "employeeDetail.lastOrganization": 0,
          "employeeDetail.motherName": 0,
          "employeeDetail.mothersMobileNo": 0,
          "employeeDetail.nameAsPerBank": 0,
          "employeeDetail.permanentAddressCity": 0,
          "employeeDetail.permanentAddressPincode": 0,
          "employeeDetail.permanentAddressState": 0,
          "employeeDetail.startDate": 0,
          "employeeDetail.totalExperience": 0,
          "employeeDetail.university": 0,
          _id: 0,
        },
      },
    ]).sort({ createdAt: -1 });

    // Send the result as a response
    success(res, "Get Employee Task Detail", result.length > 0 ? result[0] : {});

  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ----------------UPDATE BOD EOD LIST  BY taskId---------------------
async function replyOnTaskByTaskId(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
  const currentTime = moment().tz("Asia/Kolkata").format("YYYY-MM-DDTh:mm:ss A")
    const { taskId, status, content ,taskFile} = req.body;
    const tokenRemarkId = new ObjectId(req.Id)

    // Validate taskId
    if (!taskId || taskId.trim() === "") {
      return badRequest(res, "Please provide a valid taskId");
    }

    // Case 1: Update status and endDate
    if (status) {
      if (!["pending", "WIP", "processing", "completed"].includes(status)) {
        return badRequest(res, "Invalid status. Allowed values are: pending, WIP, processing, completed");
      }

      const updatedTask = await taskModel.findByIdAndUpdate(taskId,{$set: {status},},{ new: true } );
      if (!updatedTask) {
        return badRequest(res, "Task not found for the given taskId");
      }

      return success(res, "Task status updated successfully", updatedTask);
    }

    // Case 2: Add a new remark
    if (content || taskFile) {
      const newRemark = {
        remarkId: tokenRemarkId ,
        content,
        taskFile,
        time:currentTime,
      };

      const updatedTask = await taskModel.findByIdAndUpdate(
        taskId,
        { $push: { remark: newRemark } }, // Add the new remark to the array
        { new: true } // Return the updated document
      );

      if (!updatedTask) {
        return badRequest(res, "Task not found for the given taskId");
      }

      return success(res, "New remark added successfully", updatedTask);
    }

    // return badRequest(res, "Please provide valid data to update");
  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
}

// --------------GET API TO CHECK EMPLOYEE DONE BOD OR EOD----------------
async function getbodEodVerify(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
   const tokenId = new ObjectId(req.Id)
   const currentDate = new Date();
    const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));
    
    // Query the database
    const result = await taskModel.findOne({
      employeeId: tokenId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ createdAt: -1 });

    console.log("Query Result:", result);
    if (result) {
      return success(res,"Get BOD / EOD Verify", {data: true} )
    } else {
      return success(res,"Get BOD / EOD Verify", {data: false });
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------Update Eod Bod By Manager----------------------------------
async function taskUpdateByManager(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const tokenId = new ObjectId(req.Id); 
  
    const { employeeId, remarkBodByManager, managerBodStatus, remarkEodByManager, managerEodStatus } = req.body;

    // Validate employeeId
    if (!employeeId || employeeId.trim() === "") {
      return badRequest(res, "Please select a valid employeeId");
    }

    // Check if the employee exists and is active
    const employeDetail = await employeModel.findById({
      _id: new ObjectId(employeeId),
      status: "active",
    });

    if (!employeDetail) {
      return badRequest(res, "Invalid employee details");
    }

    // Build the update object dynamically based on the provided fields
    const updateFields = {};
    if (remarkBodByManager) {
      updateFields.remarkBodByManager = remarkBodByManager;
      updateFields.managerBodStatus = managerBodStatus;
    
      // Set status based on managerBodStatus
      if (managerBodStatus === "accept") {
        updateFields.status = "processing";
        console.log("dd",managerBodStatus ,  updateFields.status)
      } else if (managerBodStatus === "reject") {
        updateFields.status = "pending";
      }
    }
    
    // Update fields for remarkEodByManager
    if (remarkEodByManager) {
      updateFields.remarkEodByManager = remarkEodByManager;
      updateFields.managerEodStatus = managerEodStatus;
    
      // Set status based on managerEodStatus
      if (managerEodStatus === "accept") {
        updateFields.status = "completed";
      } else if (managerEodStatus === "incomplete") {
        updateFields.status = "processing";
      }
    }
    
    const updatedData = await taskModel.findOneAndUpdate({ employeeId: new ObjectId(employeeId)},
    { $set: updateFields ,updateBy: tokenId},
    { new: true } // Return the updated document
  );
 
    return success(res, "BOD/EOD entry updated successfully", updatedData);

  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
}

// ---------------GROUP TASK GET BY EMPLOYEEID------------------------------
async function getGroupTaskByToken(req, res) {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const tokenId = new ObjectId(req.Id);
    const result = await taskModel.aggregate([
      {
        $lookup: {
          from: "grouptasks",
          let: { taskGroupId: "$groupId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$groupId", "$$taskGroupId"] },
                $or: [
                  { employeeIds: tokenId },
                  { createdBy: tokenId }
                ]
              }
            },
            {
              $project: {
                employeeIds: 1,
                createdBy: 1
              }
            }
          ],
          as: "groupTaskDetails"
        }
      },
      {
        $match: {
          groupId: { $ne: null },
          groupTaskDetails: { $ne: [] } // Only keep tasks where groupTask matches token conditions
        }
      },
      {
        $addFields: {
          unseenMessageCount: {
            $reduce: {
              input: "$remark",
              initialValue: 0,
              in: {
                $cond: [
                  {
                    $and: [
                      { $ne: ["$$this.remarkId", tokenId] }, // Check tokenId not in remarkId
                      { $not: { $in: [tokenId, "$$this.seenBy.employeeId"] } } // Check tokenId not in seenBy
                    ]
                  },
                  { $add: ["$$value", 1] }, // Increment count if unseen
                  "$$value" // Else keep the current count
                ]
              }
            }
          }
        }
      },
      // Get employee details
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "_id",
          as: "groupCreatedBy"
        }
      },
      {
        $unwind: "$groupCreatedBy"
      },
      {
        $unwind: "$groupTaskDetails"
      },
      // Get all employee details including createdBy
      {
        $lookup: {
          from: "employees",
          let: { 
            empIds: "$groupTaskDetails.employeeIds",
            createdById: "$groupTaskDetails.createdBy"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $in: ["$_id", "$$empIds"] },
                    { $eq: ["$_id", "$$createdById"] }
                  ]
                }
              }
            },
            {
              $project: {
                _id: 1,
                employeUniqueId: 1,
                employeePhoto: 1,
                employeName: 1,
                mobileNo: 1,
                groupId: 1
              }
            }
          ],
          as: "groupEmployees"
        }
      },
      {
        $project: {
          _id: 1,
          employeeId: 1,
          groupId: 1,
          task: 1,
          status: 1,
          startDate: 1,
          dueDate: 1,
          endDate: 1,
          createdAt: 1,
          unseenMessageCount: 1, // Include unseenMessageCount in output
          groupCreatedBy: {
            _id: 1,
            employeUniqueId: 1,
            employeePhoto: 1,
            employeName: 1,
            mobileNo: 1,
            groupId: 1
          },
          groupEmployees: 1
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    // Return success response
    success(res, "Get Employee Task Detail", result);

  } catch (error) {
    console.error("Error in getGroupTaskByToken:", error);
    unknownError(res, error);
  }
}

// -------------GROUP TASK  DETAIL REPLY DETAIL GET BY TASKID---------------
async function getGroupTaskByTaskId(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const tokenId = new ObjectId(req.Id); // Current user's ID
    const taskId = new ObjectId(req.query.taskId); // Task ID from params
    const task = await taskModel.findOne({ _id: taskId });

    if (!task) {
      return notFound(res, "Task not found");
    }
    task.remark = task.remark.map((remarkItem) => {
      const alreadySeen = remarkItem.seenBy.some(
        (seenEntry) => seenEntry.employeeId.toString() === tokenId.toString()
      );

      if (!alreadySeen && remarkItem.remarkId.toString() !== tokenId.toString()) {
        remarkItem.seenBy.push({
          employeeId: tokenId,
          seenTime: moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A"),
        });
      }

      return remarkItem;
    });

    // Save the updated task with modified `seenBy`
    await task.save();

    const result = await taskModel.aggregate([
      {
        $match: {
          _id: taskId
        },
      },
      // Get employee details of task assignee
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeDetail",
        },
      },
      {
        $unwind: "$employeeDetail",
      },
      // Get remark employee details
      {
        $lookup: {
          from: "employees",
          let: { remarkId: "$remark.remarkId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$remarkId"],
                },
              },
            },
            {
              $project: {
                _id: 1,
                employeUniqueId: 1,
                employeName: 1,
                employeePhoto: 1,
              },
            },
          ],
          as: "remarkDetail",
        },
      },
      {
        $project: {
          _id: 1,
          employeeId: 1,
          assignBy: 1,
          groupId: 1,
          task: 1,
          description: 1,
          startDate: 1,
          dueDate: 1,
          endDate: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          employeeDetail: {
            _id: 1,
            employeName: 1,
            mobileNo: 1,
            email: 1
          },
          remark: {
            $map: {
              input: "$remark",
              as: "remarkItem",
              in: {
                _id: "$$remarkItem._id",
                remarkId: "$$remarkItem.remarkId",
                content: "$$remarkItem.content",
                taskFile: "$$remarkItem.taskFile",
                time: "$$remarkItem.time",
                seenBy:"$$remarkItem.seenBy",
                replyType: {
                  $cond: {
                    if: { $eq: ["$$remarkItem.remarkId", tokenId] },
                    then: "selfReply",
                    else: "otherReply"
                  }
                },
                remarkDetail: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$remarkDetail",
                        as: "remarkEmployee",
                        cond: {
                          $eq: ["$$remarkEmployee._id", "$$remarkItem.remarkId"],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
            },
          },
        },
      },
    ]);

    success(res, "Get Task Detail", result.length > 0 ? result[0] : {});
  } catch (error) {
    console.error("Error", error);
    unknownError(res, error);
  }
}


// ------------GET EMPLOYEE LIST MESSAGE SEEN OR UNSEEN---------------------
async function seenAndUnseenMessageByMessageId(req, res) {
  try {
    const messageId = new ObjectId(req.query.messageId);

    // Find the task with the message
    const task = await taskModel.findOne({ "remark._id": messageId });
    if (!task) {
      return notFound(res, "Task not found");
    }

    // Find specific remark
    const remarkItem = task.remark.find(item => item._id.toString() === messageId.toString());
    if (!remarkItem) {
      return notFound(res, "Remark not found");
    }

    // Get group details
    const group = await groupTaskModel.findOne({ groupId: task.groupId });
    if (!group) {
      return notFound(res, "Group not found");
    }

    // Get seen employee details
    const seenEmployeesDetails = await Promise.all(
      remarkItem.seenBy.map(async (seenEntry) => {
        const employee = await employeModel.findById(seenEntry.employeeId, {
          employeePhoto: 1,
          employeName: 1,
          employeUniqueId: 1,
          workEmail: 1,
          mobileNo: 1,
        });
        return {
          employeeId: seenEntry.employeeId,
          seenTime: seenEntry.seenTime,
          employeeDetails: employee,
        };
      })
    );

    // Convert seenBy IDs to strings for comparison
    const seenEmployeeIds = remarkItem.seenBy.map(seen => seen.employeeId.toString());

    // Check if remarkId exists and is not in seenBy
    const isRemarkIdNotSeen = remarkItem.remarkId && 
      !seenEmployeeIds.includes(remarkItem.remarkId.toString());

    // Get all unseen employee IDs
    const unseenEmployeeIds = group.employeeIds.filter(employeeId => {
      const empIdStr = employeeId.toString();
      return !seenEmployeeIds.includes(empIdStr) && 
             (!isRemarkIdNotSeen || empIdStr !== remarkItem.remarkId.toString());
    });

    // Get unseen employee details
    const unseenEmployees = await employeModel.find(
      { _id: { $in: unseenEmployeeIds } },
      { 
        employeePhoto: 1, 
        employeName: 1, 
        employeUniqueId: 1, 
        workEmail: 1, 
        mobileNo: 1 
      }
    );

    const result = {
      taskDetails: task,
      seenEmployees: seenEmployeesDetails,
      unseenEmployees,
    };

    success(res, "Task details fetched successfully", result);
  } catch (error) {
    console.error("Error", error);
    unknownError(res, error);
  }
}


// ------------GET GROUP MESSAGE COUNT OF ALL GROUP OF PARTICULAR USER--------
async function getGroupUnseenMessageCount(req, res) {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    // Convert the tokenId to ObjectId
    const tokenId = new ObjectId(req.Id);

    // Execute the aggregation pipeline
    const result = await taskModel.aggregate([
      {
        $lookup: {
          from: "grouptasks",
          let: { taskGroupId: "$groupId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$groupId", "$$taskGroupId"] },
                $or: [
                  { employeeIds: tokenId },
                  { createdBy: tokenId }
                ]
              }
            }
          ],
          as: "groupTaskDetails"
        }
      },
      {
        $match: {
          groupId: { $ne: null },
          groupTaskDetails: { $ne: [] } // Only keep tasks where groupTask matches token conditions
        }
      },
      {
        $addFields: {
          unseenMessageCount: {
            $reduce: {
              input: "$remark",
              initialValue: 0,
              in: {
                $cond: [
                  {
                    $and: [
                      { $ne: ["$$this.remarkId", tokenId] }, // Check tokenId not in remarkId
                      { $not: { $in: [tokenId, "$$this.seenBy.employeeId"] } } // Check tokenId not in seenBy
                    ]
                  },
                  { $add: ["$$value", 1] }, // Increment count if unseen
                  "$$value" // Else keep the current count
                ]
              }
            }
          }
        }
      },
      {
        $group: {
          _id: null, // Group all tasks to calculate total unseen message count
          totalUnseenMessageCount: { $sum: "$unseenMessageCount" }
        }
      }
    ]);

    // Extract the total count from the aggregation result
    const totalCount = result.length > 0 ? result[0].totalUnseenMessageCount : 0;

    // Return success response
    success(res, "Total Unseen Message Count",  { totalUnseenMessageCount: totalCount } );
  } catch (error) {
    console.error("Error in getGroupUnseenMessageCount:", error);
    unknownError(res, error);
  }
}

// ---------GET TASK COUNT API-----------------------------------------------
async function countTaskStatusApi(req, res) {
  try {
      // Validation check
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({
              errorName: "serverValidation",
              errors: errors.array()
          });
      }

      // Validate and convert ID
      if (!req.Id) {
          return badRequest(res, "Employee ID is required");
      }
      const tokenId = new ObjectId(req.Id);

      // Get employee details with proper error handling
      const employeeDetail = await employeModel.findById(tokenId)
          .select('employeUniqueId employeName mobileNo workEmail')
          .lean();

      if (!employeeDetail) {
          return badRequest(res, "Employee not found");
      }

      // Get task counts using aggregation
      const taskCounts = await taskModel.aggregate([
          {
              $match: {
                  employeeId: tokenId,
                  status: { $in: ['pending', 'completed'] }  // Only match these statuses
              }
          },
          {
              $group: {
                  _id: '$status',
                  count: { $sum: 1 }
              }
          }
      ]);

      // Initialize task status counts
      const taskStatus = {
          pending: 0,
          completed: 0,
          total: 0
      };

      // Calculate counts
      taskCounts.forEach(status => {
          if (status._id === 'pending' || status._id === 'completed') {
              taskStatus[status._id] = status.count;
              taskStatus.total += status.count;
          }
      });

      // Format and return response
      return success(res, "Task count details retrieved successfully", {
          employeeDetail: {
              _id: employeeDetail._id,
              employeUniqueId: employeeDetail.employeUniqueId,
              employeName: employeeDetail.employeName,
              mobileNo: employeeDetail.mobileNo,
              workEmail: employeeDetail.workEmail
          },
          taskCounts: {
              pending: taskStatus.pending,
              complete: taskStatus.completed,
              total: taskStatus.total
          }
      });

  } catch (error) {
      console.error('Error in countTaskStatusApi:', error);
      
      if (error.name === 'CastError') {
          return badRequest(res, "Invalid employee ID format");
      }
      
      return unknownError(res, "Failed to fetch task counts");
  }
}


// ------------------------------GET API FOR EMPLOYEE  Hierarchy--------------
async function getManagerEmployeeHierarchy(req, res) {
  try {
    const  employeeId  = new ObjectId(req.Id);

    // Validate input
    if (!employeeId) {
      return badRequest(res, "Valid Employee ID is required");
    }

    // Verify the manager exists
    const manager = await employeModel.findById(employeeId, {
      _id: 1,
      employeName: 1,
      employeUniqueId: 1,
      currentDesignation: 1
    }).lean();

    if (!manager) {
      return notFound(res, "Manager not found");
    }

    // Find all direct reporting employees
    const directReportingEmployees = await employeModel.find(
      { 
        reportingManagerId: employeeId 
      }, 
      {
        _id: 1,
        employeName: 1,
        employeUniqueId: 1,
        currentDesignation: 1,
        department: 1,
        branch: 1,
        email: 1,
        phoneNumber: 1,
        dateOfJoining: 1,
        employeeStatus: 1
      }
    ).lean();

    // Prepare response data
    const responseData = {
      managerDetails: {
        _id: manager._id,
        employeName: manager.employeName,
        employeeUniqueId: manager.employeUniqueId
      },
      directReportingEmployees: directReportingEmployees.map(employee => ({
        _id: employee._id,
        employeName: employee.employeName,
        employeeUniqueId: employee.employeUniqueId,
      })),
      totalDirectReportingEmployees: directReportingEmployees.length
    };

    // Return response
    if (directReportingEmployees.length === 0) {
      return success(res, "No employees directly reporting to this manager", responseData);
    }

    return success(res, "Direct reporting employees retrieved successfully", responseData);
  } catch (error) {
    console.error("Error in getDirectReportingEmployees:", error);
    return unknownError(res, error);
  }
}

// Optional: If you want to include a method to get reporting employees recursively
async function getAllReportingEmployeesRecursive(employeeId, depth = 0, maxDepth = 20) {
  if (depth >= maxDepth) return [];

  const directReportees = await employeModel.find(
    { reportingManagerId: employeeId },
    { _id: 1 }
  ).lean();

  let allReportees = [...directReportees];

  // Recursively get reportees of direct reportees
  for (const reportee of directReportees) {
    const nestedReportees = await getAllReportingEmployeesRecursive(
      reportee._id, 
      depth + 1, 
      maxDepth
    );
    allReportees = allReportees.concat(nestedReportees);
  }

  return allReportees;
}

// -----------------** Task Clender APi **---------------------
async function getTaskCalenderApi(req, res) {
  try {
    const { employeeId, month } = req.query;

    // Validate Employee
    const employeeDetail = await employeModel.findById({ _id: new ObjectId(employeeId) });
    if (!employeeDetail) {
      return notFound(res, "EmployeeId Not Found", []);
    }

    if (!month || isNaN(month) || month < 1 || month > 12) {
      return notFound(res, "Invalid month. Use 1-12.", []);
    }

    const currentYear = moment().year(); // Current year
    const currentMonth = moment().month() + 1; // Get current month (1-based)
    const today = moment().format("YYYY-MM-DD"); // Get today's date

    // Ensure zero-padded month
    const formattedMonth = String(month).padStart(2, "0");

    // Define full date range (00:00:00 to 23:59:59)
    const startDate = moment.utc(`${currentYear}-${formattedMonth}-01`).startOf("day").toDate();
    let endDate = moment.utc(startDate).endOf("month").endOf("day").toDate();

    // If querying current month, restrict endDate to today
    if (parseInt(month) === currentMonth) {
      endDate = moment.utc(today).endOf("day").toDate();
    }

    // Generate all unique dates in the period
    let dateArray = [];
    let currentDate = moment.utc(startDate);
    while (currentDate.isSameOrBefore(endDate, "day")) {
      dateArray.push(currentDate.format("YYYY-MM-DD"));
      currentDate.add(1, "days");
    }

    // Sort dates in descending order (latest first)
    dateArray.sort((a, b) => moment(b).diff(moment(a)));

    // Fetch attendance and task records for the full date range
    const attendanceRecords = await attendanceModel.find({
      employeeId,
      createdAt: { $gte: startDate, $lt: moment(endDate).add(1, "days").startOf("day").toDate() },
    });

    const taskRecords = await taskModel.find({
      employeeId,
      createdAt: { $gte: startDate, $lt: moment(endDate).add(1, "days").startOf("day").toDate() },
    });

    // Convert records to date sets for quick lookup
    const attendanceDates = new Set(attendanceRecords.map((a) => moment.utc(a.createdAt).format("YYYY-MM-DD")));
    const taskDates = new Set(taskRecords.map((t) => moment.utc(t.createdAt).format("YYYY-MM-DD")));

    // Construct response
    const calendar = dateArray.map((date) => ({
      date,
      attendance: attendanceDates.has(date),
      task: taskDates.has(date),
    }));

    success(res, "GET CALENDAR TASK", calendar);
  } catch (error) {
    console.error("Error in getTaskCalenderApi:", error);
    unknownError(res, error);
  }
}


//------GET AUTO TASK------
async function getAutoTaskList(req, res) {
  try {
    let employeeId = req.Id;

    const employeeDetail = await employeModel.findById({ _id: new ObjectId(employeeId), status: "active" });
    if(!employeeDetail){
      return badRequest(res, "Employee Detail Not Found")
    }

    let matchCondition = {};

      matchCondition = {
        employeeId: employeeDetail._id,
        assignBy: employeeDetail._id,
        groupId: null,
        taskType: {$ne:"bod"}
      };

    const result = await taskModel.aggregate([
      { $match: matchCondition },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeDetail"
        }
      },
      { $unwind: "$employeeDetail" },
      {
        $lookup: {
          from: "employees",
          localField: "assignBy",
          foreignField: "_id",
          as: "assignDetail"
        }
      },
      { $unwind: "$assignDetail" },
      { $unwind: { path: "$remark", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "employees",
          let: { remarkId: "$remark.remarkId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$remarkId"] }
              }
            },
            {
              $project: {
                employeName: 1,

                employeUniqueId: 1,
                employeePhoto:1,
                type: {
                  $cond: {
                    if: { $eq: ["$_id", "$$remarkId"] },
                    then: "selfReply",
                    else: "otherReply"
                  }
                }
              }
            }
          ],
          as: "remarkUser"
        }
      },
      { $unwind: { path: "$remarkUser", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$_id",
          employeeId: { $first: "$employeeId" },
          assignBy: { $first: "$assignBy" },
          task: { $first: "$task" },
          title: { $first: "$title" },
          description: { $first: "$description" },
          startDate: { $first: "$startDate" },
          dueDate: { $first: "$dueDate" },
          endDate: { $first: "$endDate" },
          status: { $first: "$status" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          employeeDetail: { $first: "$employeeDetail" },
          assignDetail: { $first: "$assignDetail" },
          taskType: { $first: "$taskType" },
          redirectUrl: { $first: "$redirectUrl" },
          remark: {
            $push: {
              $cond: [
                { $ifNull: ["$remark", false] },
                {
                  _id: "$remark._id",
                  content: "$remark.content",
                  time: "$remark.time",
                  remarkUser: {
                    employeName: "$remarkUser.employeName",
                    employeUniqueId: "$remarkUser.employeUniqueId",
                    employeePhoto: "$remarkUser.employeePhoto",
                    type: {
                      $cond: {
                        if: { $eq: ["$remark.remarkId", "$employeeId"] },
                        then: "selfReply",
                        else: "otherReply"
                      }
                    }
                  }
                },
                "$$REMOVE"
              ]
            }
          }
        }
      },
      {
        $project: {
          task: 1,
          title:1,
          description: 1,
          startDate: 1,
          dueDate: 1,
          endDate: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          taskType:1,
          redirectUrl:1,
          employeeDetail: {
            _id: "$employeeDetail._id",
            employeName: "$employeeDetail.employeName",
            employeUniqueId: "$employeeDetail.employeUniqueId",
            employeePhoto: "$employeeDetail.employeePhoto"
          },
          assignDetail: {
            employeName: "$assignDetail.employeName",
            employeUniqueId: "$assignDetail.employeUniqueId",
            employeePhoto: "$employeeDetail.employeePhoto"
          },
          remark: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    return success(res, "Task details fetched successfully", result);
  } catch (error) {
    console.log(error);
    unknownError(res, error.message);
  }
}


async function getAutoTaskListByEmpId(req, res) {
  try {
    let { employeeId, startDate, endDate, search, pageNumber, pageLimit } = req.query;
    const userId = req.Id;
    // const userId = new ObjectId("67666e30d246f23d1fbd8516");

    pageNumber = parseInt(pageNumber) || 1;
    pageLimit = parseInt(pageLimit) || 100;

    const skipCount = (pageNumber - 1) * pageLimit;

    const employeeList = await getFullEmployeeHierarchy(userId);
    const employeeIds = employeeList?.data?.map(id => new ObjectId(id));

    // console.log(employeeIds.length,"employeeIdsemployeeIds",employeeIds)

   // ✅ Check if the user has any hierarchy at all
   if (!employeeIds || employeeIds.length <= 1) {
      const data = await employeModel.findOne({
        _id: new ObjectId(userId),
        status: "active"
      });
      if (data.reportingManagerId) {
        return badRequest(res, "You are not a reporting manager.");
      }
  }
  
    let matchCondition = {
      taskType: { $ne: "bod" },
      groupId: null,
    };


    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    
      matchCondition.createdAt = {
        $gte: start,
        $lte: end
      };
    } else if (startDate) {
      const start = new Date(startDate);
      matchCondition.createdAt = { $gte: start };
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchCondition.createdAt = { $lte: end };
    }

    // If employeeId is provided, check hierarchy
    if (employeeId) {
      const employeeObjId = new ObjectId(employeeId);
      // Check if employeeId is in the employee hierarchy
      const isUnderUser = employeeIds.some(id => id.equals(employeeObjId));
      if (!isUnderUser) {
        return badRequest(res, "This employee is not under your reporting structure.");
      }

      matchCondition.employeeId = employeeObjId;
    } else {
      // If employeeId is NOT provided, show all employees' data in the hierarchy
      matchCondition.employeeId = { $in: employeeIds };
    }

    const result = await taskModel.aggregate([
      { $match: matchCondition },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeDetail"
        }
      },
      { $unwind: "$employeeDetail" },
      {
        $lookup: {
          from: "employees",
          localField: "assignBy",
          foreignField: "_id",
          as: "assignDetail"
        }
      },
      { $unwind: "$assignDetail" },
      { $unwind: { path: "$remark", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "customerdetails",
          localField: "customerId",
          foreignField: "_id",
          as: "customerDetail"
        }
      },
      { $unwind: "$customerDetail" },
      ...(search
        ? [{
            $match: {
              $or: [
                { "employeeDetail.employeName": { $regex: search, $options: "i" } },
                { "customerDetail.customerFinId": { $regex: search, $options: "i" } }
              ]
            }
          }]
        : []),
      {
        $lookup: {
          from: "employees",
          let: { remarkId: "$remark.remarkId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$remarkId"] }
              }
            },
            {
              $project: {
                employeName: 1,

                employeUniqueId: 1,
                employeePhoto:1,
                type: {
                  $cond: {
                    if: { $eq: ["$_id", "$$remarkId"] },
                    then: "selfReply",
                    else: "otherReply"
                  }
                }
              }
            }
          ],
          as: "remarkUser"
        }
      },
      { $unwind: { path: "$remarkUser", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$_id",
          employeeId: { $first: "$employeeId" },
          assignBy: { $first: "$assignBy" },
          task: { $first: "$task" },
          title: { $first: "$title" },
          description: { $first: "$description" },
          startDate: { $first: "$startDate" },
          dueDate: { $first: "$dueDate" },
          endDate: { $first: "$endDate" },
          status: { $first: "$status" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          employeeDetail: { $first: "$employeeDetail" },
          assignDetail: { $first: "$assignDetail" },
          customerDetail: { $first: "$customerDetail" },
          taskType: { $first: "$taskType" },
          redirectUrl: { $first: "$redirectUrl" },
          customerId: { $first: "$customerId" },
          remark: {
            $push: {
              $cond: [
                { $ifNull: ["$remark", false] },
                {
                  _id: "$remark._id",
                  content: "$remark.content",
                  time: "$remark.time",
                  remarkUser: {
                    employeName: "$remarkUser.employeName",
                    employeUniqueId: "$remarkUser.employeUniqueId",
                    employeePhoto: "$remarkUser.employeePhoto",
                    type: {
                      $cond: {
                        if: { $eq: ["$remark.remarkId", "$employeeId"] },
                        then: "selfReply",
                        else: "otherReply"
                      }
                    }
                  }
                },
                "$$REMOVE"
              ]
            }
          }
        }
      },
      {
        $project: {
          task: 1,
          title:1,
          description: 1,
          startDate: 1,
          dueDate: 1,
          endDate: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          taskType:1,
          redirectUrl:1,
          customerId: 1,
          employeeDetail: {
            _id: "$employeeDetail._id",
            employeName: "$employeeDetail.employeName",
            employeUniqueId: "$employeeDetail.employeUniqueId",
            employeePhoto: "$employeeDetail.employeePhoto"
          },
          assignDetail: {
            employeName: "$assignDetail.employeName",
            employeUniqueId: "$assignDetail.employeUniqueId",
            employeePhoto: "$employeeDetail.employeePhoto"
          },
          customerDetail: {
            customerFinId: "$customerDetail.customerFinId",
          },
          remark: 1
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skipCount },
      { $limit: pageLimit }
    ]);

    const totalCount = await taskModel.countDocuments(matchCondition);

    return success(res, "Task details fetched successfully", {
      totalCount,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / pageLimit),
      tasks: result});
  } catch (error) {
    console.log(error);
    unknownError(res, error.message);
  }
}

async function autoTaskListApi(req, res) {
  try {
    let matchCondition = {};

      matchCondition = {
        // employeeId: employeeDetail._id,
        // assignBy: employeeDetail._id,
        // groupId: null,
        taskType: {$ne:"bod"}
      };

    const result = await taskModel.aggregate([
      { $match: matchCondition },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeDetail"
        }
      },
      { $unwind: "$employeeDetail" },
      {
        $lookup: {
          from: "employees",
          localField: "assignBy",
          foreignField: "_id",
          as: "assignDetail"
        }
      },
      { $unwind: "$assignDetail" },
      { $unwind: { path: "$remark", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "employees",
          let: { remarkId: "$remark.remarkId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$remarkId"] }
              }
            },
            {
              $project: {
                employeName: 1,

                employeUniqueId: 1,
                employeePhoto:1,
                type: {
                  $cond: {
                    if: { $eq: ["$_id", "$$remarkId"] },
                    then: "selfReply",
                    else: "otherReply"
                  }
                }
              }
            }
          ],
          as: "remarkUser"
        }
      },
      { $unwind: { path: "$remarkUser", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$_id",
          employeeId: { $first: "$employeeId" },
          assignBy: { $first: "$assignBy" },
          task: { $first: "$task" },
          title: { $first: "$title" },
          description: { $first: "$description" },
          startDate: { $first: "$startDate" },
          dueDate: { $first: "$dueDate" },
          endDate: { $first: "$endDate" },
          status: { $first: "$status" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          employeeDetail: { $first: "$employeeDetail" },
          assignDetail: { $first: "$assignDetail" },
          taskType: { $first: "$taskType" },
          redirectUrl: { $first: "$redirectUrl" },
          remark: {
            $push: {
              $cond: [
                { $ifNull: ["$remark", false] },
                {
                  _id: "$remark._id",
                  content: "$remark.content",
                  time: "$remark.time",
                  remarkUser: {
                    employeName: "$remarkUser.employeName",
                    employeUniqueId: "$remarkUser.employeUniqueId",
                    employeePhoto: "$remarkUser.employeePhoto",
                    type: {
                      $cond: {
                        if: { $eq: ["$remark.remarkId", "$employeeId"] },
                        then: "selfReply",
                        else: "otherReply"
                      }
                    }
                  }
                },
                "$$REMOVE"
              ]
            }
          }
        }
      },
      {
        $project: {
          task: 1,
          title:1,
          description: 1,
          startDate: 1,
          dueDate: 1,
          endDate: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          taskType:1,
          redirectUrl:1,
          employeeDetail: {
            _id: "$employeeDetail._id",
            employeName: "$employeeDetail.employeName",
            employeUniqueId: "$employeeDetail.employeUniqueId",
            employeePhoto: "$employeeDetail.employeePhoto"
          },
          assignDetail: {
            customerFinId: "$customerDetail.employeName",
            employeUniqueId: "$customerDetail.employeUniqueId",
            employeePhoto: "$customerDetail.employeePhoto"
          },
          remark: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    return success(res, "Task details fetched successfully", result);
  } catch (error) {
    console.log(error);
    unknownError(res, error.message);
  }
}


module.exports = {
  taskAdd,
  selfTaskDelete,
  selfTaskUpdate,
  // addGroupTask,
  getTaskByEmployeeId,
  getTaskById,
  getAllTask,
  getTaskByParticularId,
  getTaskEmployeeName,
  getTaskByManagerId,
  replyOnTaskByTaskId,
  getbodEodVerify,
  taskUpdateByManager,
  reAssignTask,
  getGroupTaskByToken,
  getGroupTaskByTaskId,
  seenAndUnseenMessageByMessageId,
  getGroupUnseenMessageCount,
  countTaskStatusApi,
  getManagerEmployeeHierarchy,
  getTaskCalenderApi,
  getAutoTaskList,
  getAutoTaskListByEmpId,
  autoTaskListApi
};
