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
//   const groupMemberHistoryModel = require("../../model/taskManagement/groupHistory.model")
  const employeModel = require("../../model/adminMaster/employe.model")
  const moment = require("moment-timezone");
  const startDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");


//---------------------Group Task ADD---------------------------------------
async function addGroupTask(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array()
            });
        }

        const tokenId = new ObjectId(req.Id);
        const { employeeIds, groupTask, dueDate, groupName } = req.body;

        // Validate employee IDs
        if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
            return badRequest(res, "Please provide a valid list of employeeIds");
        }

        const startDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");

        // Generate next group ID
        const lastGroup = await groupTaskModel
            .findOne()
            .sort({ createdAt: -1 })
            .select('groupId');

        let nextGroupId = "group01";
        if (lastGroup && lastGroup.groupId) {
            const lastNumber = parseInt(lastGroup.groupId.replace("group", ""), 10);
            nextGroupId = `group${String(lastNumber + 1).padStart(2, "0")}`;
        }

        // Validate all employeeIds and ensure they are active
        const validEmployees = await employeModel.find({
            _id: { $in: employeeIds.map(id => new ObjectId(id)) },
            status: "active"
        });

        if (validEmployees.length !== employeeIds.length) {
            return badRequest(res, "One or more employeeIds are invalid or inactive");
        }

        // Prepare members array with creator as admin and others as members
        const members = [
            {
                employeeId: tokenId,
                role: 'admin',
                joinedAt: startDate,
                isActive: true
            },
            ...employeeIds
                .filter(id => id.toString() !== tokenId.toString())
                .map(id => ({
                    employeeId: new ObjectId(id),
                    role: 'member',
                    joinedAt: startDate,
                    isActive: true
                }))
        ];

        // Create group task with proper members structure
        const groupTaskDetail = await groupTaskModel.create({
            groupTask:groupTask,
            groupName: groupName,
            groupId: nextGroupId,
            createdBy: tokenId,
            members: members,
            isActive: true
        });

        // Create initial task document for chat
        const taskData = {
            employeeId: tokenId,
            assignBy: tokenId,
            groupId: nextGroupId,
            task: null ,
            startDate: startDate,
            dueDate: dueDate,
            remark: [{
                remarkId: tokenId, // Using new ObjectId instead of tokenId
                content: "Group created",
                seenBy: [{
                    employeeId: tokenId,
                    seenTime: startDate
                }],
                time: startDate
            }]
        };

        const taskEntry = await taskModel.create(taskData);

        // Add task creation message if task and description provided
        if (groupTask) {
            const chatMessage = {
                remarkId: tokenId, // Using new ObjectId instead of tokenId
                content: `New Group T ask : ${groupTask}`,
                seenBy: [{
                    employeeId: tokenId,
                    seenTime: startDate
                }],
                time: startDate
            };

            await taskModel.findByIdAndUpdate(
                taskEntry._id,
                { $push: { remark: chatMessage } }
            );
        }

        return success(res, "Group task created successfully", {
            groupTaskDetail,
            task: taskEntry
        });

    } catch (error) {
        console.error('Error in addGroupTask:', error);
        return unknownError(res, error);
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
                "members": {
                  $elemMatch: {
                    $or: [
                      { "employeeId": tokenId, "isActive": true },
                      { "createdBy": tokenId }
                    ]
                  }
                }
              }
            },
            {
              $project: {
                groupName: 1,
                groupTask: 1,
                members: 1,
                createdBy: 1,
                startDate:1
              }
            }
          ],
          as: "groupTaskDetails"
        }
      },
      {
        $match: {
          groupId: { $ne: null },
          groupTaskDetails: { $ne: [] } // Only keep tasks where user is a member or creator
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
                      { $ne: ["$$this.remarkId", tokenId] },
                      {
                        $not: {
                          $in: [tokenId, {
                            $map: {
                              input: "$$this.seenBy",
                              as: "seen",
                              in: "$$seen.employeeId"
                            }
                          }]
                        }
                      }
                    ]
                  },
                  { $add: ["$$value", 1] },
                  "$$value"
                ]
              }
            }
          }
        }
      },
      // Get task creator details
      {
        $lookup: {
          from: "employees",
          localField: "assignBy",
          foreignField: "_id",
          as: "taskCreatedBy"
        }
      },
      {
        $unwind: "$taskCreatedBy"
      },
      {
        $unwind: "$groupTaskDetails"
      },
      // Get all group member details
      {
        $lookup: {
          from: "employees",
          let: { 
            members: "$groupTaskDetails.members.employeeId",
            createdBy: "$groupTaskDetails.createdBy"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $in: ["$_id", "$$members"] },
                    { $eq: ["$_id", "$$createdBy"] }
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
                mobileNo: 1
              }
            }
          ],
          as: "groupMembers"
        }
      },
      {
        $project: {
          _id: 1,
          employeeId: 1,
          assignBy: 1,
          groupId: 1,
          task: 1,
          description: 1,
          status: 1,
          startDate: 1,
          dueDate: 1,
          endDate: 1,
          createdAt: 1,
          unseenMessageCount: 1,
          taskCreatedBy: {
            _id: 1,
            employeUniqueId: 1,
            employeePhoto: 1,
            employeName: 1,
            mobileNo: 1
          },
          groupDetails: {
            groupName: "$groupTaskDetails.groupName",
            groupTask: "$groupTaskDetails.groupTask",
            createdBy: "$groupTaskDetails.createdBy",
            startDate: "$groupTaskDetails.startDate"
          },
          groupMembers: 1
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


module.exports = {
  addGroupTask,
  getGroupTaskByToken,
  getGroupTaskByTaskId,
  getGroupUnseenMessageCount
};
