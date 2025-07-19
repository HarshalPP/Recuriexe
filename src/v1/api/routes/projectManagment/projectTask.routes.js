const express = require("express");
const router = express.Router();

const {
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
} = require("../../controller/projectManagment/projectTask.controller");

// Create Routes
router.post("/create", createProjectTaskController);

// Read Routes
router.get("/all", getAllProjectTasksController);
router.get("/getById/:taskId", getTaskByIdController);
router.get("/byProject/:projectId", getTasksByProjectController);
router.get("/byEmployee/:employeeId", getTasksByEmployeeController);
router.get("/byStatus/:status", getTasksByStatusController);
router.get("/byLiveStatus/:liveStatus", getTasksByLiveStatusController);
router.get("/active", getActiveTasksController);
router.get("/upcoming", getUpcomingTasksController);
router.get("/overdue", getOverdueTasksController);
router.get("/completed", getCompletedTasksController);
router.get("/search", searchTasksController); // Accepts query param: searchTerm

// Update Routes
router.post("/update/:taskId", updateTaskController);
router.post("/frontend/status/:taskId", updateFrontendStatusController);
router.post("/backend/status/:taskId", updateBackendStatusController);
router.post("/qa/status/:taskId", updateQaStatusController);
router.post("/live/status/:taskId", updateLiveStatusController);
router.post("/frontend/assign/:taskId", assignFrontendEmployeeController);
router.post("/backend/assign/:taskId", assignBackendEmployeeController);
router.post("/qa/assign/:taskId", assignQaEmployeeController);

// Delete Routes
router.delete("/delete/:taskId", deleteTaskController);
router.delete("/deleteByProject/:projectId", deleteTasksByProjectController);

// Aggregate/Stats Routes
router.get("/stats", getTaskStatsController); // Accepts query param: projectId (optional)
router.get("/stats/employees", getEmployeeTaskStatsController);
router.get("/timeline/:year?", getTasksTimelineController);
router.get("/stats/summary", getTaskStatusSummaryByProjectController);

module.exports = router;