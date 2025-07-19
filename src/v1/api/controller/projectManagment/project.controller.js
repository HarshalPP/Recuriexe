const { badRequest, success, unknownError } = require("../../../../../globalHelper/response.globalHelper");

const {
 addProjectFile,addTeamMember,changeProjectManager,createProject,deleteProject,deleteProjectsByManager,getActiveProjects,getAllProjects,getCompletedProjects,getProjectById,getProjectStatsByManager,getProjectsByCreationDateRange,getProjectsByManager,getProjectsByRole,getProjectsByTeamMember,getProjectsTimeline,getTeamCompositionStats,getUpcomingProjects,removeProjectFile,removeTeamMember,searchProjects,updateProject,updateTeamMemberRole
} = require("../../helper/projectManagment/project.helper");


const {getFullEmployeeHierarchy } = require("../../helper/employee.helper");




// CREATE CONTROLLERS

/**
 * Controller to create a new project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function createProjectController(req, res) {
    try {
        const { status, message, data } = await createProject(req.body);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// READ CONTROLLERS

/**
 * Controller to get all projects
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getAllProjectsController(req, res) {
    try {
        const employeeId = req.Id
        console.log("d",employeeId);
        
        const { status:employeeStatus, message:employeeMessage, data:employeeData } = await getFullEmployeeHierarchy(employeeId);
        const { status, message, data } = await getAllProjects(employeeData);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to get project by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getProjectByIdController(req, res) {
    try {
        const { projectId } = req.params;
        const { status, message, data } = await getProjectById(projectId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to get projects by manager
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getProjectsByManagerController(req, res) {
    try {
        const { managerId } = req.params;
        const { status, message, data } = await getProjectsByManager(managerId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to get projects by team member
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getProjectsByTeamMemberController(req, res) {
    try {
        const { userId } = req.params;
        const { status, message, data } = await getProjectsByTeamMember(userId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to get projects by role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getProjectsByRoleController(req, res) {
    try {
        const { role } = req.params;
        const { status, message, data } = await getProjectsByRole(role);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to get active projects
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getActiveProjectsController(req, res) {
    try {
        const { status, message, data } = await getActiveProjects();
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to get upcoming projects
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getUpcomingProjectsController(req, res) {
    try {
        const { status, message, data } = await getUpcomingProjects();
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to get completed projects
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getCompletedProjectsController(req, res) {
    try {
        const { status, message, data } = await getCompletedProjects();
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to get projects by creation date range
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getProjectsByCreationDateRangeController(req, res) {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return badRequest(res, "Both startDate and endDate are required");
        }
        
        const { status, message, data } = await getProjectsByCreationDateRange(startDate, endDate);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to search projects
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function searchProjectsController(req, res) {
    try {
        const { searchTerm } = req.query;
        
        if (!searchTerm) {
            return badRequest(res, "Search term is required");
        }
        
        const { status, message, data } = await searchProjects(searchTerm);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// UPDATE CONTROLLERS

/**
 * Controller to update project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateProjectController(req, res) {
    try {
        const { projectId } = req.params;
        const { status, message, data } = await updateProject(projectId, req.body);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to add team member to project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function addTeamMemberController(req, res) {
    try {
        const { projectId } = req.params;
        const { userId, role } = req.body;
        
        if (!userId || !role) {
            return badRequest(res, "Both userId and role are required");
        }
        
        const { status, message, data } = await addTeamMember(projectId, userId, role);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to remove team member from project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function removeTeamMemberController(req, res) {
    try {
        const { projectId, userId } = req.params;
        const { status, message, data } = await removeTeamMember(projectId, userId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to update team member role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateTeamMemberRoleController(req, res) {
    try {
        const { projectId, userId } = req.params;
        const { role } = req.body;
        
        if (!role) {
            return badRequest(res, "Role is required");
        }
        
        const { status, message, data } = await updateTeamMemberRole(projectId, userId, role);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to add file to project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function addProjectFileController(req, res) {
    try {
        const { projectId } = req.params;
        const { filePath } = req.body;
        
        if (!filePath) {
            return badRequest(res, "File path is required");
        }
        
        const { status, message, data } = await addProjectFile(projectId, filePath);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to remove file from project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function removeProjectFileController(req, res) {
    try {
        const { projectId } = req.params;
        const { filePath } = req.body;
        
        if (!filePath) {
            return badRequest(res, "File path is required");
        }
        
        const { status, message, data } = await removeProjectFile(projectId, filePath);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to change project manager
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function changeProjectManagerController(req, res) {
    try {
        const { projectId } = req.params;
        const { managerId } = req.body;
        
        if (!managerId) {
            return badRequest(res, "Manager ID is required");
        }
        
        const { status, message, data } = await changeProjectManager(projectId, managerId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// DELETE CONTROLLERS

/**
 * Controller to delete project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function deleteProjectController(req, res) {
    try {
        const { projectId } = req.params;
        const { status, message, data } = await deleteProject(projectId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to delete projects by manager
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function deleteProjectsByManagerController(req, res) {
    try {
        const { managerId } = req.params;
        const { status, message, data } = await deleteProjectsByManager(managerId);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// AGGREGATE/STATS CONTROLLERS

/**
 * Controller to get project stats by manager
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getProjectStatsByManagerController(req, res) {
    try {
        const { status, message, data } = await getProjectStatsByManager();
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to get team composition stats
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getTeamCompositionStatsController(req, res) {
    try {
        const { status, message, data } = await getTeamCompositionStats();
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Controller to get projects timeline
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getProjectsTimelineController(req, res) {
    try {
        const { year } = req.params;
        
        if (!year) {
            return badRequest(res, "Year is required");
        }
        
        const { status, message, data } = await getProjectsTimeline(parseInt(year));
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// Export all controllers
module.exports = {
    // Create
    createProjectController,
    
    // Read
    getAllProjectsController,
    getProjectByIdController,
    getProjectsByManagerController,
    getProjectsByTeamMemberController,
    getProjectsByRoleController,
    getActiveProjectsController,
    getUpcomingProjectsController,
    getCompletedProjectsController,
    getProjectsByCreationDateRangeController,
    searchProjectsController,
    
    // Update
    updateProjectController,
    addTeamMemberController,
    removeTeamMemberController,
    updateTeamMemberRoleController,
    addProjectFileController,
    removeProjectFileController,
    changeProjectManagerController,
    
    // Delete
    deleteProjectController,
    deleteProjectsByManagerController,
    
    // Aggregate/Stats
    getProjectStatsByManagerController,
    getTeamCompositionStatsController,
    getProjectsTimelineController
};
