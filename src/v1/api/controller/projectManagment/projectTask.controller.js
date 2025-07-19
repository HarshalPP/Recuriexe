const { badRequest, success, unknownError } = require("../../../../../globalHelper/response.globalHelper");


const {
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
} = require("../../helper/projectManagment/projectTask.helper");


// CREATE CONTROLLERS

/**
 * Controller to create a new project task
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function createProjectTaskController(req, res) {
    try {
        const { status: status, message, data } = await createProjectTask(req.body);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// READ CONTROLLERS

/**
 * Controller to get all project tasks
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getAllProjectTasksController(req, res) {
    try {
        const { status: status, message, data } = await getAllProjectTasks();
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to get task by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getTaskByIdController(req, res) {
    try {
        const { taskId } = req.params;
        const { status: status, message, data } = await getTaskById(taskId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to get tasks by project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getTasksByProjectController(req, res) {
    try {
        const { projectId } = req.params;
        const { status: status, message, data } = await getTasksByProject(projectId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to get tasks by employee
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getTasksByEmployeeController(req, res) {
    try {
        const { employeeId } = req.params;
        const { status: status, message, data } = await getTasksByEmployee(employeeId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to get tasks by status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getTasksByStatusController(req, res) {
    try {
        const { status } = req.params;
        
        if (!['pending', 'inprogress', 'complete'].includes(status)) {
            return badRequest(res, "Invalid status value. Must be 'pending', 'inprogress', or 'complete'");
        }
        
        const { status: apiStatus, message, data } = await getTasksByStatus(status);
        return apiStatus ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to get tasks by live status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getTasksByLiveStatusController(req, res) {
    try {
        const { liveStatus } = req.params;
        
        if (!['underDevelopment', 'stage', 'live'].includes(liveStatus)) {
            return badRequest(res, "Invalid live status value. Must be 'underDevelopment', 'stage', or 'live'");
        }
        
        const { status: status, message, data } = await getTasksByLiveStatus(liveStatus);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to get active tasks
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getActiveTasksController(req, res) {
    try {
        const { status: status, message, data } = await getActiveTasks();
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to get upcoming tasks
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getUpcomingTasksController(req, res) {
    try {
        const { status: status, message, data } = await getUpcomingTasks();
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to get overdue tasks
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getOverdueTasksController(req, res) {
    try {
        const { status: status, message, data } = await getOverdueTasks();
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to get completed tasks
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getCompletedTasksController(req, res) {
    try {
        const { status: status, message, data } = await getCompletedTasks();
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to search tasks
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function searchTasksController(req, res) {
    try {
        const { searchTerm } = req.query;
        
        if (!searchTerm) {
            return badRequest(res, "Search term is required");
        }
        
        const { status: status, message, data } = await searchTasks(searchTerm);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// UPDATE CONTROLLERS

/**
 * Controller to update task
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateTaskController(req, res) {
    try {
        const { taskId } = req.params;
        const { status: status, message, data } = await updateTask(taskId, req.body);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to update frontend status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateFrontendStatusController(req, res) {
    try {
        const { taskId } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return badRequest(res, "Status is required");
        }
        
        if (!['pending', 'inprogress', 'complete'].includes(status)) {
            return badRequest(res, "Invalid status value. Must be 'pending', 'inprogress', or 'complete'");
        }
        
        const { status: apiStatus, message, data } = await updateFrontendStatus(taskId, status);
        return apiStatus ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to update backend status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateBackendStatusController(req, res) {
    try {
        const { taskId } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return badRequest(res, "Status is required");
        }
        
        if (!['pending', 'inprogress', 'complete'].includes(status)) {
            return badRequest(res, "Invalid status value. Must be 'pending', 'inprogress', or 'complete'");
        }
        
        const { status: apiStatus, message, data } = await updateBackendStatus(taskId, status);
        return apiStatus ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to update QA status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateQaStatusController(req, res) {
    try {
        const { taskId } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return badRequest(res, "Status is required");
        }
        
        if (!['pending', 'inprogress', 'complete'].includes(status)) {
            return badRequest(res, "Invalid status value. Must be 'pending', 'inprogress', or 'complete'");
        }
        
        const { status: apiStatus, message, data } = await updateQaStatus(taskId, status);
        return apiStatus ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to update live status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateLiveStatusController(req, res) {
    try {
        const { taskId } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return badRequest(res, "Status is required");
        }
        
        if (!['underDevelopment', 'stage', 'live'].includes(status)) {
            return badRequest(res, "Invalid live status value. Must be 'underDevelopment', 'stage', or 'live'");
        }
        
        const { status: apiStatus, message, data } = await updateLiveStatus(taskId, status);
        return apiStatus ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to assign frontend employee
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function assignFrontendEmployeeController(req, res) {
    try {
        const { taskId } = req.params;
        const { employeeId } = req.body;
        
        if (!employeeId) {
            return badRequest(res, "Employee ID is required");
        }
        
        const { status: status, message, data } = await assignFrontendEmployee(taskId, employeeId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to assign backend employee
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function assignBackendEmployeeController(req, res) {
    try {
        const { taskId } = req.params;
        const { employeeId } = req.body;
        
        if (!employeeId) {
            return badRequest(res, "Employee ID is required");
        }
        
        const { status: status, message, data } = await assignBackendEmployee(taskId, employeeId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to assign QA employee
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function assignQaEmployeeController(req, res) {
    try {
        const { taskId } = req.params;
        const { employeeId } = req.body;
        
        if (!employeeId) {
            return badRequest(res, "Employee ID is required");
        }
        
        const { status: status, message, data } = await assignQaEmployee(taskId, employeeId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// DELETE CONTROLLERS

/**
 * Controller to delete task
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function deleteTaskController(req, res) {
    try {
        const { taskId } = req.params;
        const { status: status, message, data } = await deleteTask(taskId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to delete tasks by project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function deleteTasksByProjectController(req, res) {
    try {
        const { projectId } = req.params;
        const { status: status, message, data } = await deleteTasksByProject(projectId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// AGGREGATE/STATS CONTROLLERS

/**
 * Controller to get task stats
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getTaskStatsController(req, res) {
    try {
        const { projectId } = req.query;
        const { status: status, message, data } = await getTaskStats(projectId || null);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to get employee task stats
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getEmployeeTaskStatsController(req, res) {
    try {
        const { status: status, message, data } = await getEmployeeTaskStats();
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to get tasks timeline
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getTasksTimelineController(req, res) {
    try {
        const { year } = req.params;
        const yearValue = year ? parseInt(year) : null;
        
        const { status: status, message, data } = await getTasksTimeline(yearValue);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to get task status summary by project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getTaskStatusSummaryByProjectController(req, res) {
    try {
        const { status: status, message, data } = await getTaskStatusSummaryByProject();
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Export all controllers
module.exports = {
    // Create
    createProjectTaskController,
    
    // Read
    getAllProjectTasksController,
    getTaskByIdController,
    getTasksByProjectController,
    getTasksByEmployeeController,
    getTasksByStatusController,
    getTasksByLiveStatusController,
    getActiveTasksController,
    getUpcomingTasksController,
    getOverdueTasksController,
    getCompletedTasksController,
    searchTasksController,
    
    // Update
    updateTaskController,
    updateFrontendStatusController,
    updateBackendStatusController,
    updateQaStatusController,
    updateLiveStatusController,
    assignFrontendEmployeeController,
    assignBackendEmployeeController,
    assignQaEmployeeController,
    
    // Delete
    deleteTaskController,
    deleteTasksByProjectController,
    
    // Aggregate/Stats
    getTaskStatsController,
    getEmployeeTaskStatsController,
    getTasksTimelineController,
    getTaskStatusSummaryByProjectController
};