const Project = require("../../model/projectManagment/project.model.js");
const { returnFormatter } = require("../../formatter/common.formatter");
const { default: mongoose } = require("mongoose");


// CREATE FUNCTIONS

/**
 * Create a new project
 * @param {Object} projectData - Project data
 * @returns {Object} Response with created project
 */
async function createProject(projectData) {
    try {
        const project = new Project(projectData);
        await project.save();
        return returnFormatter(true, "Project created successfully", project);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// READ FUNCTIONS

/**
 * Get all projects
 * @returns {Object} Response with array of all projects
 */
async function getAllProjects(employeeIdList) {
    try {
        
        const objectIdList = employeeIdList.map(id => 
            mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
        );
        
        // Find projects where either:
        // 1. The manager is in the employee ID list, OR
        // 2. Any team member is in the employee ID list
        const projects = await Project.find(
            {
            $or: [
                { manager: { $in: objectIdList } },
                { "team.user": { $in: objectIdList } }
            ]
        }
    )
        .populate("manager", "employeName email position") 
        .populate("team.user", "employeName email position");
        return returnFormatter(true, "Projects retrieved successfully", projects);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Get project by ID
 * @param {String} projectId - Project's ObjectId
 * @returns {Object} Response with project data
 */
async function getProjectById(projectId) {
    try {
        const project = await Project.findById(projectId)
            .populate("manager", "employeName email position")
            .populate("team.user", "employeName email position");
        
        if (!project) {
            return returnFormatter(false, "Project not found");
        }
        
        return returnFormatter(true, "Project found", project);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Get projects by manager
 * @param {String} managerId - Manager's ObjectId
 * @returns {Object} Response with projects data
 */
async function getProjectsByManager(managerId) {
    try {
        const projects = await Project.find({ manager: managerId })
            .populate("manager", "employeName email position")
            .populate("team.user", "employeName email position");
        
        return returnFormatter(true, "Projects retrieved successfully", projects);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Get projects by team member
 * @param {String} userId - Team member's ObjectId
 * @returns {Object} Response with projects data
 */
async function getProjectsByTeamMember(userId) {
    try {
        const projects = await Project.find({ "team.user": userId })
            .populate("manager", "employeName email position")
            .populate("team.user", "employeName email position");
        
        return returnFormatter(true, "Projects retrieved successfully", projects);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Get projects by role
 * @param {String} role - Role (frontend, backend, qa)
 * @returns {Object} Response with projects data
 */
async function getProjectsByRole(role) {
    try {
        const projects = await Project.find({ "team.role": role })
            .populate("manager", "employeName email position")
            .populate("team.user", "employeName email position");
        
        return returnFormatter(true, "Projects retrieved successfully", projects);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Get active projects (current date between start and end date)
 * @returns {Object} Response with active projects
 */
async function getActiveProjects() {
    try {
        const currentDate = new Date();
        const projects = await Project.find({
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate }
        })
            .populate("manager", "employeName email position")
            .populate("team.user", "employeName email position");
        
        return returnFormatter(true, "Active projects retrieved successfully", projects);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Get upcoming projects (start date in the future)
 * @returns {Object} Response with upcoming projects
 */
async function getUpcomingProjects() {
    try {
        const currentDate = new Date();
        const projects = await Project.find({
            startDate: { $gt: currentDate }
        })
            .populate("manager", "employeName email position")
            .populate("team.user", "employeName email position");
        
        return returnFormatter(true, "Upcoming projects retrieved successfully", projects);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Get completed projects (end date in the past)
 * @returns {Object} Response with completed projects
 */
async function getCompletedProjects() {
    try {
        const currentDate = new Date();
        const projects = await Project.find({
            endDate: { $lt: currentDate }
        })
            .populate("manager", "employeName email position")
            .populate("team.user", "employeName email position");
        
        return returnFormatter(true, "Completed projects retrieved successfully", projects);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Get projects created in a date range
 * @param {Date} startDate - Range start date
 * @param {Date} endDate - Range end date
 * @returns {Object} Response with projects data
 */
async function getProjectsByCreationDateRange(startDate, endDate) {
    try {
        const projects = await Project.find({
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        })
            .populate("manager", "employeName email position")
            .populate("team.user", "employeName email position");
        
        return returnFormatter(true, "Projects retrieved successfully", projects);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Search projects by title or details
 * @param {String} searchTerm - Search term
 * @returns {Object} Response with projects data
 */
async function searchProjects(searchTerm) {
    try {
        const projects = await Project.find({
            $or: [
                { title: { $regex: searchTerm, $options: 'i' } },
                { detail: { $regex: searchTerm, $options: 'i' } }
            ]
        })
            .populate("manager", "employeName email position")
            .populate("team.user", "employeName email position");
        
        return returnFormatter(true, "Search results retrieved successfully", projects);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// UPDATE FUNCTIONS

/**
 * Update project by ID
 * @param {String} projectId - Project's ObjectId
 * @param {Object} updateData - Data to update
 * @returns {Object} Response with updated project
 */
async function updateProject(projectId, updateData) {
    try {
        const project = await Project.findByIdAndUpdate(
            projectId,
            updateData,
            { new: true, runValidators: true }
        )
            .populate("manager", "employeName email position")
            .populate("team.user", "employeName email position");
        
        if (!project) {
            return returnFormatter(false, "Project not found");
        }
        
        return returnFormatter(true, "Project updated successfully", project);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Add team member to project
 * @param {String} projectId - Project's ObjectId
 * @param {String} userId - User's ObjectId
 * @param {String} role - Role (frontend, backend, qa)
 * @returns {Object} Response with updated project
 */
async function addTeamMember(projectId, userId, role) {
    try {
        // Check if user already exists in team
        const existingProject = await Project.findById(projectId);
        
        if (!existingProject) {
            return returnFormatter(false, "Project not found");
        }
        
        const memberExists = existingProject.team.some(member => 
            member.user.toString() === userId
        );
        
        if (memberExists) {
            return returnFormatter(false, "User is already a team member");
        }
        
        const project = await Project.findByIdAndUpdate(
            projectId,
            { $push: { team: { user: userId, role } } },
            { new: true, runValidators: true }
        )
            .populate("manager", "employeName email position")
            .populate("team.user", "employeName email position");
        
        return returnFormatter(true, "Team member added successfully", project);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Remove team member from project
 * @param {String} projectId - Project's ObjectId
 * @param {String} userId - User's ObjectId
 * @returns {Object} Response with updated project
 */
async function removeTeamMember(projectId, userId) {
    try {
        const project = await Project.findByIdAndUpdate(
            projectId,
            { $pull: { team: { user: userId } } },
            { new: true }
        )
            .populate("manager", "employeName email position")
            .populate("team.user", "employeName email position");
        
        if (!project) {
            return returnFormatter(false, "Project not found");
        }
        
        return returnFormatter(true, "Team member removed successfully", project);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Update team member role
 * @param {String} projectId - Project's ObjectId
 * @param {String} userId - User's ObjectId
 * @param {String} newRole - New role (frontend, backend, qa)
 * @returns {Object} Response with updated project
 */
async function updateTeamMemberRole(projectId, userId, newRole) {
    try {
        const project = await Project.findOneAndUpdate(
            { 
                _id: projectId,
                "team.user": userId 
            },
            { 
                $set: { "team.$.role": newRole } 
            },
            { new: true, runValidators: true }
        )
            .populate("manager", "employeName email position")
            .populate("team.user", "employeName email position");
        
        if (!project) {
            return returnFormatter(false, "Project or team member not found");
        }
        
        return returnFormatter(true, "Team member role updated successfully", project);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Add file to project
 * @param {String} projectId - Project's ObjectId
 * @param {String} filePath - File path
 * @returns {Object} Response with updated project
 */
async function addProjectFile(projectId, filePath) {
    try {
        const project = await Project.findByIdAndUpdate(
            projectId,
            { $push: { file: filePath } },
            { new: true }
        );
        
        if (!project) {
            return returnFormatter(false, "Project not found");
        }
        
        return returnFormatter(true, "File added successfully", project);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Remove file from project
 * @param {String} projectId - Project's ObjectId
 * @param {String} filePath - File path to remove
 * @returns {Object} Response with updated project
 */
async function removeProjectFile(projectId, filePath) {
    try {
        const project = await Project.findByIdAndUpdate(
            projectId,
            { $pull: { file: filePath } },
            { new: true }
        );
        
        if (!project) {
            return returnFormatter(false, "Project not found");
        }
        
        return returnFormatter(true, "File removed successfully", project);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Change project manager
 * @param {String} projectId - Project's ObjectId
 * @param {String} managerId - New manager's ObjectId
 * @returns {Object} Response with updated project
 */
async function changeProjectManager(projectId, managerId) {
    try {
        const project = await Project.findByIdAndUpdate(
            projectId,
            { manager: managerId },
            { new: true, runValidators: true }
        )
            .populate("manager", "employeName email position")
            .populate("team.user", "employeName email position");
        
        if (!project) {
            return returnFormatter(false, "Project not found");
        }
        
        return returnFormatter(true, "Project manager updated successfully", project);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// DELETE FUNCTIONS

/**
 * Delete project by ID
 * @param {String} projectId - Project's ObjectId
 * @returns {Object} Response with deleted project
 */
async function deleteProject(projectId) {
    try {
        const project = await Project.findByIdAndDelete(projectId);
        
        if (!project) {
            return returnFormatter(false, "Project not found");
        }
        
        return returnFormatter(true, "Project deleted successfully", project);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Delete all projects by manager
 * @param {String} managerId - Manager's ObjectId
 * @returns {Object} Response with deletion count
 */
async function deleteProjectsByManager(managerId) {
    try {
        const result = await Project.deleteMany({ manager: managerId });
        
        return returnFormatter(
            true, 
            `${result.deletedCount} projects deleted successfully`, 
            { deletedCount: result.deletedCount }
        );
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// AGGREGATE FUNCTIONS

/**
 * Get project stats by manager
 * @returns {Object} Response with project statistics
 */
async function getProjectStatsByManager() {
    try {
        const stats = await Project.aggregate([
            {
                $group: {
                    _id: "$manager",
                    projectCount: { $sum: 1 },
                    averageDuration: {
                        $avg: {
                            $subtract: ["$endDate", "$startDate"]
                        }
                    },
                    activeProjects: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $lte: ["$startDate", new Date()] },
                                        { $gte: ["$endDate", new Date()] }
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
                    as: "managerInfo"
                }
            },
            {
                $unwind: "$managerInfo"
            },
            {
                $project: {
                    _id: 0,
                    managerId: "$_id",
                    managerName: "$managerInfo.name",
                    projectCount: 1,
                    activeProjects: 1,
                    averageDurationInDays: { $divide: ["$averageDuration", 1000 * 60 * 60 * 24] }
                }
            }
        ]);
        
        return returnFormatter(true, "Project statistics retrieved successfully", stats);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Get team composition statistics
 * @returns {Object} Response with team statistics
 */
async function getTeamCompositionStats() {
    try {
        const stats = await Project.aggregate([
            {
                $unwind: "$team"
            },
            {
                $group: {
                    _id: "$team.role",
                    count: { $sum: 1 },
                    projects: { $addToSet: "$_id" }
                }
            },
            {
                $project: {
                    _id: 0,
                    role: "$_id",
                    memberCount: "$count",
                    projectCount: { $size: "$projects" }
                }
            }
        ]);
        
        return returnFormatter(true, "Team composition statistics retrieved successfully", stats);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Get projects timeline (projects grouped by month)
 * @param {Number} year - Year to filter by
 * @returns {Object} Response with timeline data
 */
async function getProjectsTimeline(year) {
    try {
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31);
        
        const timeline = await Project.aggregate([
            {
                $match: {
                    $or: [
                        { startDate: { $gte: startOfYear, $lte: endOfYear } },
                        { endDate: { $gte: startOfYear, $lte: endOfYear } }
                    ]
                }
            },
            {
                $project: {
                    title: 1,
                    startMonth: { $month: "$startDate" },
                    endMonth: { $month: "$endDate" },
                    startYear: { $year: "$startDate" },
                    endYear: { $year: "$endDate" },
                    duration: {
                        $divide: [
                            { $subtract: ["$endDate", "$startDate"] },
                            1000 * 60 * 60 * 24 * 30
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
                    projects: {
                        $push: {
                            id: "$_id",
                            title: "$title",
                            durationMonths: { $ceil: "$duration" }
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
            }
        ]);
        
        return returnFormatter(true, "Projects timeline retrieved successfully", timeline);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// Export all functions
module.exports = {
    // Create
    createProject,
    
    // Read
    getAllProjects,
    getProjectById,
    getProjectsByManager,
    getProjectsByTeamMember,
    getProjectsByRole,
    getActiveProjects,
    getUpcomingProjects,
    getCompletedProjects,
    getProjectsByCreationDateRange,
    searchProjects,
    
    // Update
    updateProject,
    addTeamMember,
    removeTeamMember,
    updateTeamMemberRole,
    addProjectFile,
    removeProjectFile,
    changeProjectManager,
    
    // Delete
    deleteProject,
    deleteProjectsByManager,
    
    // Aggregate/Stats
    getProjectStatsByManager,
    getTeamCompositionStats,
    getProjectsTimeline
};