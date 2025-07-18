import { Router } from 'express';
import { 
    createNewSubmission, 
    getAllSubmissions, 
    getSubmissionById, 
    updateSubmission, 
    deleteSubmission, 
    submitForApproval, 
    approveSubmission, 
    rejectSubmission, 
    returnSubmission, 
    withdrawSubmission, 
    getUserSubmissions, 
    getApprovalQueue, 
    getHistory, 
    bulkApprove, 
    exportData 
} from '../../controllers/expenseControllers/expenseSubmission.controller.js';
import { authenticateEmployeeAdmin, verifyEmployeeToken  } from "../../middleware/authicationmiddleware.js";
// import { uploadFields } from '../../middleware/multer.js';

const expenseSubmissionRouter = Router();

// Basic CRUD operations
expenseSubmissionRouter.get("/", authenticateEmployeeAdmin, getAllSubmissions);
expenseSubmissionRouter.post("/", authenticateEmployeeAdmin, createNewSubmission);
expenseSubmissionRouter.get("/:submissionId", authenticateEmployeeAdmin, getSubmissionById);
expenseSubmissionRouter.put("/:submissionId", authenticateEmployeeAdmin, updateSubmission);
expenseSubmissionRouter.delete("/:submissionId", authenticateEmployeeAdmin, deleteSubmission);

// Workflow operations
expenseSubmissionRouter.post("/:submissionId/submit", authenticateEmployeeAdmin, submitForApproval);
expenseSubmissionRouter.post("/:submissionId/approve", authenticateEmployeeAdmin, approveSubmission);
expenseSubmissionRouter.post("/:submissionId/reject", authenticateEmployeeAdmin, rejectSubmission);
expenseSubmissionRouter.post("/:submissionId/return", authenticateEmployeeAdmin, returnSubmission);
expenseSubmissionRouter.post("/:submissionId/withdraw", authenticateEmployeeAdmin, withdrawSubmission);

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
