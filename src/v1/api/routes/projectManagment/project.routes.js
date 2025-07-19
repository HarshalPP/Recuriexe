const express = require("express");
const router = express.Router();

const {
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
} = require("../../controller/projectManagment/project.controller");

// Create Routes
router.post("/create", createProjectController);

// Read Routes
router.get("/all", getAllProjectsController);
router.get("/getById/:projectId", getProjectByIdController);
router.get("/byManager/:managerId", getProjectsByManagerController);
router.get("/byTeamMember/:userId", getProjectsByTeamMemberController);
router.get("/byRole/:role", getProjectsByRoleController);
router.get("/active", getActiveProjectsController);
router.get("/upcoming", getUpcomingProjectsController);
router.get("/completed", getCompletedProjectsController);
router.get("/byDateRange", getProjectsByCreationDateRangeController); // Accepts query params: startDate, endDate
router.get("/search", searchProjectsController); // Accepts query param: searchTerm

// Update Routes
router.post("/update/:projectId", updateProjectController);
router.post("/team/add/:projectId", addTeamMemberController);
router.post("/team/remove/:projectId/:userId", removeTeamMemberController);
router.post("/team/updateRole/:projectId/:userId", updateTeamMemberRoleController);
router.post("/file/add/:projectId", addProjectFileController);
router.post("/file/remove/:projectId", removeProjectFileController);
router.post("/manager/change/:projectId", changeProjectManagerController);

// Delete Routes
router.delete("/delete/:projectId", deleteProjectController);
router.delete("/deleteByManager/:managerId", deleteProjectsByManagerController);

// Aggregate/Stats Routes
router.get("/stats/byManager", getProjectStatsByManagerController);
router.get("/stats/teamComposition", getTeamCompositionStatsController);
router.get("/timeline/:year", getProjectsTimelineController);

module.exports = router;