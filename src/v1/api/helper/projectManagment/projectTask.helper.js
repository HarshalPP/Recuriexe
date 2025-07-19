const ProjectTask = require("../../model/projectManagment/projectTask.model");
const { returnFormatter } = require("../../formatter/common.formatter");

// CREATE FUNCTIONS

/**
 * Create a new project task
 * @param {Object} taskData - Task data
 * @returns {Object} Response with created task
 */
async function createProjectTask(taskData) {
    try {
        const task = new ProjectTask(taskData);
        await task.save();
        return returnFormatter(true, "Task created successfully", task);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// READ FUNCTIONS

/**
 * Get all project tasks
 * @returns {Object} Response with array of all tasks
 */
async function getAllProjectTasks() {
    try {
        const tasks = await ProjectTask.find()
            .populate("projectId", "title manager team startDate endDate")
            .populate("frontEndEmployee", "employeName employeePhoto")
            .populate("backendEndEmployee", "employeName employeePhoto")
            .populate("qaEmployee", "employeName employeePhoto");
        
        return returnFormatter(true, "Tasks retrieved successfully", tasks);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Get task by ID
 * @param {String} taskId - Task's ObjectId
 * @returns {Object} Response with task data
 */
async function getTaskById(taskId) {
    try {
        const task = await ProjectTask.findById(taskId)
            .populate("projectId", "title manager team startDate endDate")
            .populate("frontEndEmployee", "employeName employeePhoto")
            .populate("backendEndEmployee", "employeName employeePhoto")
            .populate("qaEmployee", "employeName employeePhoto");
        
        if (!task) {
            return returnFormatter(false, "Task not found");
        }
        
        return returnFormatter(true, "Task found", task);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Get tasks by project ID
 * @param {String} projectId - Project's ObjectId
 * @returns {Object} Response with tasks data
 */
async function getTasksByProject(projectId) {
    try {
        const tasks = await ProjectTask.find({ projectId })
            .populate("projectId", "title manager team startDate endDate")
            .populate("frontEndEmployee", "employeName employeePhoto")
            .populate("backendEndEmployee", "employeName employeePhoto")
            .populate("qaEmployee", "employeName employeePhoto")
            .sort({ startDate: 1 });
        
        return returnFormatter(true, `Retrieved ${tasks.length} tasks for this project`, tasks);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Get tasks assigned to a specific employee (in any role)
 * @param {String} employeeId - Employee's ObjectId
 * @returns {Object} Response with tasks data
 */
async function getTasksByEmployee(employeeId) {
    try {
        const tasks = await ProjectTask.find({
            $or: [
                { frontEndEmployee: employeeId },
                { backendEndEmployee: employeeId },
                { qaEmployee: employeeId }
            ]
        })
            .populate("projectId", "title manager team startDate endDate")
            .populate("frontEndEmployee", "employeName employeePhoto")
            .populate("backendEndEmployee", "employeName employeePhoto")
            .populate("qaEmployee", "employeName employeePhoto")
            .sort({ startDate: 1 });
        
        return returnFormatter(true, `Retrieved ${tasks.length} tasks assigned to this employee`, tasks);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Get tasks by status (for any role)
 * @param {String} status - Status to filter by ('pending', 'inprogress', 'complete')
 * @returns {Object} Response with tasks data
 */
async function getTasksByStatus(status) {
    try {
        const tasks = await ProjectTask.find({
            $or: [
                { frontEndStatus: status },
                { backendEndStatus: status },
                { qaStatus: status }
            ]
        })
            .populate("projectId", "title manager team startDate endDate")
            .populate("frontEndEmployee", "employeName employeePhoto")
            .populate("backendEndEmployee", "employeName employeePhoto")
            .populate("qaEmployee", "employeName employeePhoto");
        
        return returnFormatter(true, `Retrieved ${tasks.length} tasks with status '${status}'`, tasks);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Get tasks by live status
 * @param {String} liveStatus - Live status to filter by ('underDevelopment', 'stage', 'live')
 * @returns {Object} Response with tasks data
 */
async function getTasksByLiveStatus(liveStatus) {
    try {
        const tasks = await ProjectTask.find({ liveStatus })
            .populate("projectId", "title manager team startDate endDate")
            .populate("frontEndEmployee", "employeName employeePhoto")
            .populate("backendEndEmployee", "employeName employeePhoto")
            .populate("qaEmployee", "employeName employeePhoto");
        
        return returnFormatter(true, `Retrieved ${tasks.length} tasks with live status '${liveStatus}'`, tasks);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Get active tasks (current date between start and end date)
 * @returns {Object} Response with active tasks
 */
async function getActiveTasks() {
    try {
        const currentDate = new Date();
        const tasks = await ProjectTask.find({
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate }
        })
            .populate("projectId", "title manager team startDate endDate")
            .populate("frontEndEmployee", "employeName employeePhoto")
            .populate("backendEndEmployee", "employeName employeePhoto")
            .populate("qaEmployee", "employeName employeePhoto");
        
        return returnFormatter(true, `Retrieved ${tasks.length} active tasks`, tasks);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Get upcoming tasks (start date in the future)
 * @returns {Object} Response with upcoming tasks
 */
async function getUpcomingTasks() {
    try {
        const currentDate = new Date();
        const tasks = await ProjectTask.find({
            startDate: { $gt: currentDate }
        })
            .populate("projectId", "title manager team startDate endDate")
            .populate("frontEndEmployee", "employeName employeePhoto")
            .populate("backendEndEmployee", "employeName employeePhoto")
            .populate("qaEmployee", "employeName employeePhoto")
            .sort({ startDate: 1 });
        
        return returnFormatter(true, `Retrieved ${tasks.length} upcoming tasks`, tasks);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Get overdue tasks (end date in the past but not all statuses are 'complete')
 * @returns {Object} Response with overdue tasks
 */
async function getOverdueTasks() {
    try {
        const currentDate = new Date();
        const tasks = await ProjectTask.find({
            endDate: { $lt: currentDate },
            $or: [
                { frontEndStatus: { $ne: 'complete' } },
                { backendEndStatus: { $ne: 'complete' } },
                { qaStatus: { $ne: 'complete' } }
            ]
        })
            .populate("projectId", "title manager team startDate endDate")
            .populate("frontEndEmployee", "employeName employeePhoto")
            .populate("backendEndEmployee", "employeName employeePhoto")
            .populate("qaEmployee", "employeName employeePhoto");
        
        return returnFormatter(true, `Retrieved ${tasks.length} overdue tasks`, tasks);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Get completed tasks (all statuses are 'complete')
 * @returns {Object} Response with completed tasks
 */
async function getCompletedTasks() {
    try {
        const tasks = await ProjectTask.find({
            frontEndStatus: 'complete',
            backendEndStatus: 'complete',
            qaStatus: 'complete'
        })
            .populate("projectId", "title manager team startDate endDate")
            .populate("frontEndEmployee", "employeName employeePhoto")
            .populate("backendEndEmployee", "employeName employeePhoto")
            .populate("qaEmployee", "employeName employeePhoto");
        
        return returnFormatter(true, `Retrieved ${tasks.length} completed tasks`, tasks);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Search tasks by title or details
 * @param {String} searchTerm - Search term
 * @returns {Object} Response with tasks data
 */
async function searchTasks(searchTerm) {
    try {
        const tasks = await ProjectTask.find({
            $or: [
                { title: { $regex: searchTerm, $options: 'i' } },
                { detail: { $regex: searchTerm, $options: 'i' } }
            ]
        })
            .populate("projectId", "title manager team startDate endDate")
            .populate("frontEndEmployee", "employeName employeePhoto")
            .populate("backendEndEmployee", "employeName employeePhoto")
            .populate("qaEmployee", "employeName employeePhoto");
        
        return returnFormatter(true, `Found ${tasks.length} tasks matching the search term`, tasks);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// UPDATE FUNCTIONS

/**
 * Update task by ID
 * @param {String} taskId - Task's ObjectId
 * @param {Object} updateData - Data to update
 * @returns {Object} Response with updated task
 */
async function updateTask(taskId, updateData) {
    try {
        const task = await ProjectTask.findByIdAndUpdate(
            taskId,
            updateData,
            { new: true, runValidators: true }
        )
            .populate("projectId", "title manager team startDate endDate")
            .populate("frontEndEmployee", "employeName employeePhoto")
            .populate("backendEndEmployee", "employeName employeePhoto")
            .populate("qaEmployee", "employeName employeePhoto");
        
        if (!task) {
            return returnFormatter(false, "Task not found");
        }
        
        return returnFormatter(true, "Task updated successfully", task);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Update frontend status
 * @param {String} taskId - Task's ObjectId
 * @param {String} status - New status ('pending', 'inprogress', 'complete')
 * @returns {Object} Response with updated task
 */
async function updateFrontendStatus(taskId, status) {
    try {
        if (!['pending', 'inprogress', 'complete'].includes(status)) {
            return returnFormatter(false, "Invalid status value");
        }
        
        const task = await ProjectTask.findByIdAndUpdate(
            taskId,
            { frontEndStatus: status },
            { new: true, runValidators: true }
        )
            .populate("projectId", "title manager team startDate endDate")
            .populate("frontEndEmployee", "employeName employeePhoto")
            .populate("backendEndEmployee", "employeName employeePhoto")
            .populate("qaEmployee", "employeName employeePhoto");
        
        if (!task) {
            return returnFormatter(false, "Task not found");
        }
        
        return returnFormatter(true, "Frontend status updated successfully", task);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Update backend status
 * @param {String} taskId - Task's ObjectId
 * @param {String} status - New status ('pending', 'inprogress', 'complete')
 * @returns {Object} Response with updated task
 */
async function updateBackendStatus(taskId, status) {
    try {
        if (!['pending', 'inprogress', 'complete'].includes(status)) {
            return returnFormatter(false, "Invalid status value");
        }
        
        const task = await ProjectTask.findByIdAndUpdate(
            taskId,
            { backendEndStatus: status },
            { new: true, runValidators: true }
        )
            .populate("projectId", "title manager team startDate endDate")
            .populate("frontEndEmployee", "employeName employeePhoto")
            .populate("backendEndEmployee", "employeName employeePhoto")
            .populate("qaEmployee", "employeName employeePhoto");
        
        if (!task) {
            return returnFormatter(false, "Task not found");
        }
        
        return returnFormatter(true, "Backend status updated successfully", task);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Update QA status
 * @param {String} taskId - Task's ObjectId
 * @param {String} status - New status ('pending', 'inprogress', 'complete')
 * @returns {Object} Response with updated task
 */
async function updateQaStatus(taskId, status) {
    try {
        if (!['pending', 'inprogress', 'complete'].includes(status)) {
            return returnFormatter(false, "Invalid status value");
        }
        
        const task = await ProjectTask.findByIdAndUpdate(
            taskId,
            { qaStatus: status },
            { new: true, runValidators: true }
        )
            .populate("projectId", "title manager team startDate endDate")
            .populate("frontEndEmployee", "employeName employeePhoto")
            .populate("backendEndEmployee", "employeName employeePhoto")
            .populate("qaEmployee", "employeName employeePhoto");
        
        if (!task) {
            return returnFormatter(false, "Task not found");
        }
        
        return returnFormatter(true, "QA status updated successfully", task);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Update live status
 * @param {String} taskId - Task's ObjectId
 * @param {String} status - New live status ('underDevelopment', 'stage', 'live')
 * @returns {Object} Response with updated task
 */
async function updateLiveStatus(taskId, status) {
    try {
        if (!['underDevelopment', 'stage', 'live'].includes(status)) {
            return returnFormatter(false, "Invalid live status value");
        }
        
        const task = await ProjectTask.findByIdAndUpdate(
            taskId,
            { liveStatus: status },
            { new: true, runValidators: true }
        )
            .populate("projectId", "title manager team startDate endDate")
            .populate("frontEndEmployee", "employeName employeePhoto")
            .populate("backendEndEmployee", "employeName employeePhoto")
            .populate("qaEmployee", "employeName employeePhoto");
        
        if (!task) {
            return returnFormatter(false, "Task not found");
        }
        
        return returnFormatter(true, "Live status updated successfully", task);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Assign frontend employee to task
 * @param {String} taskId - Task's ObjectId
 * @param {String} employeeId - Employee's ObjectId
 * @returns {Object} Response with updated task
 */
async function assignFrontendEmployee(taskId, employeeId) {
    try {
        const task = await ProjectTask.findByIdAndUpdate(
            taskId,
            { 
                frontEndEmployee: employeeId,
                frontEndStatus: 'pending' // Reset status when assigning new employee
            },
            { new: true, runValidators: true }
        )
            .populate("projectId", "title manager team startDate endDate")
            .populate("frontEndEmployee", "employeName employeePhoto")
            .populate("backendEndEmployee", "employeName employeePhoto")
            .populate("qaEmployee", "employeName employeePhoto");
        
        if (!task) {
            return returnFormatter(false, "Task not found");
        }
        
        return returnFormatter(true, "Frontend employee assigned successfully", task);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Assign backend employee to task
 * @param {String} taskId - Task's ObjectId
 * @param {String} employeeId - Employee's ObjectId
 * @returns {Object} Response with updated task
 */
async function assignBackendEmployee(taskId, employeeId) {
    try {
        const task = await ProjectTask.findByIdAndUpdate(
            taskId,
            { 
                backendEndEmployee: employeeId,
                backendEndStatus: 'pending' // Reset status when assigning new employee
            },
            { new: true, runValidators: true }
        )
            .populate("projectId", "title manager team startDate endDate")
            .populate("frontEndEmployee", "employeName employeePhoto")
            .populate("backendEndEmployee", "employeName employeePhoto")
            .populate("qaEmployee", "employeName employeePhoto");
        
        if (!task) {
            return returnFormatter(false, "Task not found");
        }
        
        return returnFormatter(true, "Backend employee assigned successfully", task);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Assign QA employee to task
 * @param {String} taskId - Task's ObjectId
 * @param {String} employeeId - Employee's ObjectId
 * @returns {Object} Response with updated task
 */
async function assignQaEmployee(taskId, employeeId) {
    try {
        const task = await ProjectTask.findByIdAndUpdate(
            taskId,
            { 
                qaEmployee: employeeId,
                qaStatus: 'pending' // Reset status when assigning new employee
            },
            { new: true, runValidators: true }
        )
            .populate("projectId", "title manager team startDate endDate")
            .populate("frontEndEmployee", "employeName employeePhoto")
            .populate("backendEndEmployee", "employeName employeePhoto")
            .populate("qaEmployee", "employeName employeePhoto");
        
        if (!task) {
            return returnFormatter(false, "Task not found");
        }
        
        return returnFormatter(true, "QA employee assigned successfully", task);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// DELETE FUNCTIONS

/**
 * Delete task by ID
 * @param {String} taskId - Task's ObjectId
 * @returns {Object} Response with deleted task
 */
async function deleteTask(taskId) {
    try {
        const task = await ProjectTask.findByIdAndDelete(taskId);
        
        if (!task) {
            return returnFormatter(false, "Task not found");
        }
        
        return returnFormatter(true, "Task deleted successfully", task);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Delete tasks by project ID
 * @param {String} projectId - Project's ObjectId
 * @returns {Object} Response with deletion count
 */
async function deleteTasksByProject(projectId) {
    try {
        const result = await ProjectTask.deleteMany({ projectId });
        
        return returnFormatter(
            true, 
            `${result.deletedCount} tasks deleted for this project`, 
            { deletedCount: result.deletedCount }
        );
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// AGGREGATE FUNCTIONS

/**
 * Get task statistics by project
 * @param {String} projectId - Project's ObjectId (optional - if not provided, stats for all projects)
 * @returns {Object} Response with task statistics
 */
async function getTaskStats(projectId = null) {
    try {
        const matchStage = projectId ? { projectId: mongoose.Types.ObjectId(projectId) } : {};
        
        const stats = await ProjectTask.aggregate([
            { $match: matchStage },
            { 
                $group: {
                    _id: "$projectId",
                    totalTasks: { $sum: 1 },
                    frontendCompletedCount: { 
                        $sum: { $cond: [{ $eq: ["$frontEndStatus", "complete"] }, 1, 0] } 
                    },
                    backendCompletedCount: { 
                        $sum: { $cond: [{ $eq: ["$backendEndStatus", "complete"] }, 1, 0] } 
                    },
                    qaCompletedCount: { 
                        $sum: { $cond: [{ $eq: ["$qaStatus", "complete"] }, 1, 0] } 
                    },
                    underDevelopmentCount: { 
                        $sum: { $cond: [{ $eq: ["$liveStatus", "underDevelopment"] }, 1, 0] } 
                    },
                    stageCount: { 
                        $sum: { $cond: [{ $eq: ["$liveStatus", "stage"] }, 1, 0] } 
                    },
                    liveCount: { 
                        $sum: { $cond: [{ $eq: ["$liveStatus", "live"] }, 1, 0] } 
                    },
                    overdueTasks: {
                        $sum: {
                            $cond: [
                                { 
                                    $and: [
                                        { $lt: ["$endDate", new Date()] },
                                        { 
                                            $or: [
                                                { $ne: ["$frontEndStatus", "complete"] },
                                                { $ne: ["$backendEndStatus", "complete"] },
                                                { $ne: ["$qaStatus", "complete"] }
                                            ] 
                                        }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "projects",
                    localField: "_id",
                    foreignField: "_id",
                    as: "projectInfo"
                }
            },
            {
                $unwind: {
                    path: "$projectInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 0,
                    projectId: "$_id",
                    projectTitle: "$projectInfo.title",
                    totalTasks: 1,
                    frontendCompletedCount: 1,
                    backendCompletedCount: 1,
                    qaCompletedCount: 1,
                    underDevelopmentCount: 1,
                    stageCount: 1,
                    liveCount: 1,
                    overdueTasks: 1,
                    frontendCompletionRate: {
                        $round: [{ $multiply: [{ $divide: ["$frontendCompletedCount", "$totalTasks"] }, 100] }, 1]
                    },
                    backendCompletionRate: {
                        $round: [{ $multiply: [{ $divide: ["$backendCompletedCount", "$totalTasks"] }, 100] }, 1]
                    },
                    qaCompletionRate: {
                        $round: [{ $multiply: [{ $divide: ["$qaCompletedCount", "$totalTasks"] }, 100] }, 1]
                    },
                    overallCompletionRate: {
                        $round: [
                            { 
                                $multiply: [
                                    { 
                                        $divide: [
                                            { $add: ["$frontendCompletedCount", "$backendCompletedCount", "$qaCompletedCount"] },
                                            { $multiply: ["$totalTasks", 3] }
                                        ] 
                                    },
                                    100
                                ] 
                            },
                            1
                        ]
                    }
                }
            }
        ]);
        
        return returnFormatter(true, "Task statistics retrieved successfully", stats);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Get employee task performance statistics
 * @returns {Object} Response with employee statistics
 */
async function getEmployeeTaskStats() {
    try {
        // Frontend employee stats
        const frontendStats = await ProjectTask.aggregate([
            { $match: { frontEndEmployee: { $ne: null } } },
            {
                $group: {
                    _id: "$frontEndEmployee",
                    totalTasks: { $sum: 1 },
                    completedTasks: { 
                        $sum: { $cond: [{ $eq: ["$frontEndStatus", "complete"] }, 1, 0] } 
                    },
                    inProgressTasks: { 
                        $sum: { $cond: [{ $eq: ["$frontEndStatus", "inprogress"] }, 1, 0] } 
                    },
                    pendingTasks: { 
                        $sum: { $cond: [{ $eq: ["$frontEndStatus", "pending"] }, 1, 0] } 
                    },
                    overdueTasks: {
                        $sum: {
                            $cond: [
                                { 
                                    $and: [
                                        { $lt: ["$endDate", new Date()] },
                                        { $ne: ["$frontEndStatus", "complete"] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "employees",
                    localField: "_id",
                    foreignField: "_id",
                    as: "employeeInfo"
                }
            },
            {
                $unwind: {
                    path: "$employeeInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 0,
                    employeeId: "$_id",
                    employeeName: "$employeeInfo.employeName",
                    role: "frontend",
                    totalTasks: 1,
                    completedTasks: 1,
                    inProgressTasks: 1,
                    pendingTasks: 1,
                    overdueTasks: 1,
                    completionRate: {
                        $round: [{ $multiply: [{ $divide: ["$completedTasks", "$totalTasks"] }, 100] }, 1]
                    }
                }
            }
        ]);
        
        // Backend employee stats
        const backendStats = await ProjectTask.aggregate([
            { $match: { backendEndEmployee: { $ne: null } } },
            {
                $group: {
                    _id: "$backendEndEmployee",
                    totalTasks: { $sum: 1 },
                    completedTasks: { 
                        $sum: { $cond: [{ $eq: ["$backendEndStatus", "complete"] }, 1, 0] } 
                    },
                    inProgressTasks: { 
                        $sum: { $cond: [{ $eq: ["$backendEndStatus", "inprogress"] }, 1, 0] } 
                    },
                    pendingTasks: { 
                        $sum: { $cond: [{ $eq: ["$backendEndStatus", "pending"] }, 1, 0] } 
                    },
                    overdueTasks: {
                        $sum: {
                            $cond: [
                                { 
                                    $and: [
                                        { $lt: ["$endDate", new Date()] },
                                        { $ne: ["$backendEndStatus", "complete"] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "employees",
                    localField: "_id",
                    foreignField: "_id",
                    as: "employeeInfo"
                }
            },
            {
                $unwind: {
                    path: "$employeeInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 0,
                    employeeId: "$_id",
                    employeeName: "$employeeInfo.employeName",
                    role: "backend",
                    totalTasks: 1,
                    completedTasks: 1,
                    inProgressTasks: 1,
                    pendingTasks: 1,
                    overdueTasks: 1,
                    completionRate: {
                        $round: [{ $multiply: [{ $divide: ["$completedTasks", "$totalTasks"] }, 100] }, 1]
                    }
                }
            }
        ]);
        
        // QA employee stats
        const qaStats = await ProjectTask.aggregate([
            { $match: { qaEmployee: { $ne: null } } },
            {
                $group: {
                    _id: "$qaEmployee",
                    totalTasks: { $sum: 1 },
                    completedTasks: { 
                        $sum: { $cond: [{ $eq: ["$qaStatus", "complete"] }, 1, 0] } 
                    },
                    inProgressTasks: { 
                        $sum: { $cond: [{ $eq: ["$qaStatus", "inprogress"] }, 1, 0] } 
                    },
                    pendingTasks: { 
                        $sum: { $cond: [{ $eq: ["$qaStatus", "pending"] }, 1, 0] } 
                    },
                    overdueTasks: {
                        $sum: {
                            $cond: [
                                { 
                                    $and: [
                                        { $lt: ["$endDate", new Date()] },
                                        { $ne: ["$qaStatus", "complete"] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "employees",
                    localField: "_id",
                    foreignField: "_id",
                    as: "employeeInfo"
                }
            },
            {
                $unwind: {
                    path: "$employeeInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 0,
                    employeeId: "$_id",
                    employeeName: "$employeeInfo.employeName",
                    role: "qa",
                    totalTasks: 1,
                    completedTasks: 1,
                    inProgressTasks: 1,
                    pendingTasks: 1,
                    overdueTasks: 1,
                    completionRate: {
                        $round: [{ $multiply: [{ $divide: ["$completedTasks", "$totalTasks"] }, 100] }, 1]
                    }
                }
            }
        ]);
        
        // Combine all stats
        const allEmployeeStats = [...frontendStats, ...backendStats, ...qaStats];
        
        return returnFormatter(true, "Employee task statistics retrieved successfully", allEmployeeStats);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Get tasks timeline (tasks grouped by month)
 * @param {Number} year - Year to filter by (optional)
 * @returns {Object} Response with timeline data
 */
async function getTasksTimeline(year = null) {
    try {
        const matchStage = year 
            ? {
                $or: [
                    { startDate: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) } },
                    { endDate: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) } }
                ]
            } 
            : {};
        
        const timeline = await ProjectTask.aggregate([
            { 
                $match: matchStage 
            },
            {
                $project: {
                    title: 1,
                    projectId: 1,
                    startMonth: { $month: "$startDate" },
                    endMonth: { $month: "$endDate" },
                    startYear: { $year: "$startDate" },
                    endYear: { $year: "$endDate" },
                    frontEndStatus: 1,
                    backendEndStatus: 1,
                    qaStatus: 1,
                    liveStatus: 1,
                    duration: {
                        $divide: [
                            { $subtract: ["$endDate", "$startDate"] },
                            1000 * 60 * 60 * 24 // Convert to days
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: {
                        month: "$startMonth",
                        year: "$startYear"
                    },
                    tasks: {
                        $push: {
                            id: "$_id",
                            title: "$title",
                            projectId: "$projectId",
                            duration: { $ceil: "$duration" },
                            frontEndStatus: "$frontEndStatus",
                            backendEndStatus: "$backendEndStatus",
                            qaStatus: "$qaStatus",
                            liveStatus: "$liveStatus"
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1
                }
            },
            {
                $lookup: {
                    from: "projects",
                    localField: "tasks.projectId",
                    foreignField: "_id",
                    as: "projectInfo"
                }
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id.month",
                    year: "$_id.year",
                    monthYear: { 
                        $concat: [
                            { $arrayElemAt: [
                                ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], 
                                { $subtract: ["$_id.month", 1] }
                            ]}, 
                            " ", 
                            { $toString: "$_id.year" }
                        ] 
                    },
                    taskCount: "$count",
                    tasks: 1,
                    projects: "$projectInfo"
                }
            }
        ]);
        
        return returnFormatter(true, "Tasks timeline retrieved successfully", timeline);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Get summary of task statuses by project
 * @returns {Object} Response with project task status summary
 */
async function getTaskStatusSummaryByProject() {
    try {
        const statusSummary = await ProjectTask.aggregate([
            {
                $group: {
                    _id: "$projectId",
                    totalTasks: { $sum: 1 },
                    // Frontend status counts
                    frontendPending: { 
                        $sum: { $cond: [{ $eq: ["$frontEndStatus", "pending"] }, 1, 0] } 
                    },
                    frontendInProgress: { 
                        $sum: { $cond: [{ $eq: ["$frontEndStatus", "inprogress"] }, 1, 0] } 
                    },
                    frontendComplete: { 
                        $sum: { $cond: [{ $eq: ["$frontEndStatus", "complete"] }, 1, 0] } 
                    },
                    // Backend status counts
                    backendPending: { 
                        $sum: { $cond: [{ $eq: ["$backendEndStatus", "pending"] }, 1, 0] } 
                    },
                    backendInProgress: { 
                        $sum: { $cond: [{ $eq: ["$backendEndStatus", "inprogress"] }, 1, 0] } 
                    },
                    backendComplete: { 
                        $sum: { $cond: [{ $eq: ["$backendEndStatus", "complete"] }, 1, 0] } 
                    },
                    // QA status counts
                    qaPending: { 
                        $sum: { $cond: [{ $eq: ["$qaStatus", "pending"] }, 1, 0] } 
                    },
                    qaInProgress: { 
                        $sum: { $cond: [{ $eq: ["$qaStatus", "inprogress"] }, 1, 0] } 
                    },
                    qaComplete: { 
                        $sum: { $cond: [{ $eq: ["$qaStatus", "complete"] }, 1, 0] } 
                    },
                    // Live status counts
                    underDevelopment: { 
                        $sum: { $cond: [{ $eq: ["$liveStatus", "underDevelopment"] }, 1, 0] } 
                    },
                    stage: { 
                        $sum: { $cond: [{ $eq: ["$liveStatus", "stage"] }, 1, 0] } 
                    },
                    live: { 
                        $sum: { $cond: [{ $eq: ["$liveStatus", "live"] }, 1, 0] } 
                    }
                }
            },
            {
                $lookup: {
                    from: "projects",
                    localField: "_id",
                    foreignField: "_id",
                    as: "projectInfo"
                }
            },
            {
                $unwind: {
                    path: "$projectInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 0,
                    projectId: "$_id",
                    projectTitle: "$projectInfo.title",
                    totalTasks: 1,
                    frontend: {
                        pending: "$frontendPending",
                        inProgress: "$frontendInProgress",
                        complete: "$frontendComplete",
                        completionRate: {
                            $round: [{ $multiply: [{ $divide: ["$frontendComplete", "$totalTasks"] }, 100] }, 1]
                        }
                    },
                    backend: {
                        pending: "$backendPending",
                        inProgress: "$backendInProgress",
                        complete: "$backendComplete",
                        completionRate: {
                            $round: [{ $multiply: [{ $divide: ["$backendComplete", "$totalTasks"] }, 100] }, 1]
                        }
                    },
                    qa: {
                        pending: "$qaPending",
                        inProgress: "$qaInProgress",
                        complete: "$qaComplete",
                        completionRate: {
                            $round: [{ $multiply: [{ $divide: ["$qaComplete", "$totalTasks"] }, 100] }, 1]
                        }
                    },
                    liveStatus: {
                        underDevelopment: "$underDevelopment",
                        stage: "$stage",
                        live: "$live",
                        liveRate: {
                            $round: [{ $multiply: [{ $divide: ["$live", "$totalTasks"] }, 100] }, 1]
                        }
                    },
                    overallCompletionRate: {
                        $round: [
                            { 
                                $multiply: [
                                    { 
                                        $divide: [
                                            { $add: ["$frontendComplete", "$backendComplete", "$qaComplete"] },
                                            { $multiply: ["$totalTasks", 3] }
                                        ] 
                                    },
                                    100
                                ] 
                            },
                            1
                        ]
                    }
                }
            },
            {
                $sort: { "projectTitle": 1 }
            }
        ]);
        
        return returnFormatter(true, "Task status summary by project retrieved successfully", statusSummary);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// Export all functions
module.exports = {
    // Create
    createProjectTask,
    
    // Read
    getAllProjectTasks,
    getTaskById,
    getTasksByProject,
    getTasksByEmployee,
    getTasksByStatus,
    getTasksByLiveStatus,
    getActiveTasks,
    getUpcomingTasks,
    getOverdueTasks,
    getCompletedTasks,
    searchTasks,
    
    // Update
    updateTask,
    updateFrontendStatus,
    updateBackendStatus,
    updateQaStatus,
    updateLiveStatus,
    assignFrontendEmployee,
    assignBackendEmployee,
    assignQaEmployee,
    
    // Delete
    deleteTask,
    deleteTasksByProject,
    
    // Aggregate/Stats
    getTaskStats,
    getEmployeeTaskStats,
    getTasksTimeline,
    getTaskStatusSummaryByProject
};