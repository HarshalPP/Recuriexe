import { Router } from 'express';
import { 
    createNewSubmission, 
    getAllSubmissions, 
    getSubmissionById, 
    updateSubmission, 
    deleteSubmission, 
    approveSubmission, 
    withdrawSubmission, 
    getUserSubmissions, 
    getApprovalQueue, 
    getHistory, 
    bulkApprove, 
    exportData,
    getFinalDashBoard,
    getAllemployeeSubmissions
} from '../../controllers/expenseControllers/expenseSubmission.controller.js';
import { authenticateEmployeeAdmin, verifyEmployeeToken  } from "../../middleware/authicationmiddleware.js";
// import { uploadFields } from '../../middleware/multer.js';

const expenseSubmissionRouter = Router();

// Basic CRUD operations
expenseSubmissionRouter.get("/", authenticateEmployeeAdmin, getAllSubmissions);
expenseSubmissionRouter.get("/employee", authenticateEmployeeAdmin, getAllemployeeSubmissions);
expenseSubmissionRouter.post("/", authenticateEmployeeAdmin, createNewSubmission);
expenseSubmissionRouter.get("/dashBoard", authenticateEmployeeAdmin, getFinalDashBoard);

expenseSubmissionRouter.get("/:submissionId", authenticateEmployeeAdmin, getSubmissionById);

expenseSubmissionRouter.put("/:submissionId", authenticateEmployeeAdmin, updateSubmission);
expenseSubmissionRouter.delete("/:submissionId", authenticateEmployeeAdmin, deleteSubmission);

// Workflow operations
expenseSubmissionRouter.post("/status/:submissionId", authenticateEmployeeAdmin, approveSubmission);
expenseSubmissionRouter.post("/withdrawn/:submissionId", authenticateEmployeeAdmin, withdrawSubmission);

// User-specific operations
expenseSubmissionRouter.get("/user/my-submissions", authenticateEmployeeAdmin, getUserSubmissions);
expenseSubmissionRouter.get("/user/approval-queue", authenticateEmployeeAdmin, getApprovalQueue);
// History and analytics
expenseSubmissionRouter.get("/:submissionId/history", authenticateEmployeeAdmin, getHistory);
// Bulk operations
expenseSubmissionRouter.post("/bulk/approve", authenticateEmployeeAdmin, bulkApprove);
// Export operations
expenseSubmissionRouter.get("/export/data", authenticateEmployeeAdmin, exportData);
export default expenseSubmissionRouter;
