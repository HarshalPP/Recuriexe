// Expense submission helper functions
import expenseSubmissionModel from "../../models/expenseModels/expenseSubmission.model.js";
import { returnFormatter, generateUniqueId } from "../../formatters/common.formatter.js";
import { formatExpenseSubmission, formatSubmissionForUpdate } from "../../formatters/expenseFormatter/expenseSubmission.formatter.js";
import { createAuditLog } from "./auditLog.helper.js";

export async function createExpenseSubmission(submissionData) {
    try {
        const formattedData = formatExpenseSubmission(
      submissionData,
      submissionData.organizationId,
      submissionData.submittedBy
    );

        // const formattedData = formatExpenseSubmission(formattedData);
        console.log("Formatted data for submission:", formattedData);
        const newSubmission = new expenseSubmissionModel(formattedData);
        const savedSubmission = await newSubmission.save();
        
        // Create audit log
        await createAuditLog({
            organizationId: submissionData.organizationId,
            entityType: 'ExpenseSubmission',
            entityId: savedSubmission.submissionId,
            action: 'Created',
            performedBy: submissionData.submittedBy,
            performedByName: 'Employee',
            performedByRole: 'Employee',
            newValues: savedSubmission
        });
        
        return returnFormatter(true, "Expense submission created successfully", savedSubmission);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function getAllExpenseSubmissions(organizationId, filters) {
    try {
        const { page, limit, status, expenseTypeId, submittedBy, startDate, endDate } = filters;
        const skip = (page - 1) * limit;
        
        let query = { organizationId };
        
        if (status) query.status = status;
        if (expenseTypeId) query.expenseTypeId = expenseTypeId;
        if (submittedBy) query.submittedBy = submittedBy;
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }
        
        const submissions = await expenseSubmissionModel
            .find(query)
            .select('-__v')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await expenseSubmissionModel.countDocuments(query);
        
        const result = {
            submissions,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        };
        
        return returnFormatter(true, "Expense submissions retrieved successfully", result);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function getExpenseSubmissionById(submissionId, organizationId) {
    try {
        const submission = await expenseSubmissionModel.findOne({ 
            submissionId, 
            organizationId 
        }).select('-__v');
        
        if (!submission) {
            return returnFormatter(false, "Expense submission not found");
        }
        
        return returnFormatter(true, "Expense submission retrieved successfully", submission);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function updateExpenseSubmissionData(submissionId, updateData, organizationId, updatedBy) {
    try {
        const existingSubmission = await expenseSubmissionModel.findOne({ 
            submissionId, 
            organizationId 
        });
        
        if (!existingSubmission) {
            return returnFormatter(false, "Expense submission not found");
        }
        
        // Only allow updates if submission is in draft status
        if (existingSubmission.status !== 'Draft') {
            return returnFormatter(false, "Cannot update submission in current status");
        }
        
        const formattedData = formatSubmissionForUpdate(updateData);
        const updatedSubmission = await expenseSubmissionModel.findOneAndUpdate(
            { submissionId },
            formattedData,
            { new: true }
        ).select('-__v');
        
        // Create audit log
        await createAuditLog({
            organizationId,
            entityType: 'ExpenseSubmission',
            entityId: submissionId,
            action: 'Updated',
            performedBy: updatedBy,
            performedByName: 'Employee',
            performedByRole: 'Employee',
            oldValues: existingSubmission,
            newValues: updatedSubmission
        });
        
        return returnFormatter(true, "Expense submission updated successfully", updatedSubmission);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function deleteExpenseSubmissionData(submissionId, organizationId, deletedBy) {
    try {
        const submission = await expenseSubmissionModel.findOne({ 
            submissionId, 
            organizationId 
        });
        
        if (!submission) {
            return returnFormatter(false, "Expense submission not found");
        }
        
        // Only allow deletion if submission is in draft status
        if (submission.status !== 'Draft') {
            return returnFormatter(false, "Cannot delete submission in current status");
        }
        
        await expenseSubmissionModel.findOneAndDelete({ submissionId });
        
        // Create audit log
        await createAuditLog({
            organizationId,
            entityType: 'ExpenseSubmission',
            entityId: submissionId,
            action: 'Deleted',
            performedBy: deletedBy,
            performedByName: 'Employee',
            performedByRole: 'Employee',
            oldValues: submission
        });
        
        return returnFormatter(true, "Expense submission deleted successfully");
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function submitExpenseForApproval(submissionId, organizationId, submittedBy) {
    try {
        const submission = await expenseSubmissionModel.findOne({ 
            submissionId, 
            organizationId 
        });
        
        if (!submission) {
            return returnFormatter(false, "Expense submission not found");
        }
        
        if (submission.status !== 'Draft') {
            return returnFormatter(false, "Submission is not in draft status");
        }
        
        const updatedSubmission = await expenseSubmissionModel.findOneAndUpdate(
            { submissionId },
            { 
                status: 'Submitted',
                isDraft: false,
                $push: {
                    'workflowInstance.stageHistory': {
                        stageId: submission.workflowInstance.currentStageId,
                        stageName: submission.workflowInstance.currentStageName,
                        assignedTo: submission.workflowInstance.currentAssignee,
                        action: 'Pending',
                        comments: 'Submitted for approval',
                        actionDate: new Date()
                    }
                }
            },
            { new: true }
        );
        
        // Create audit log
        await createAuditLog({
            organizationId,
            entityType: 'ExpenseSubmission',
            entityId: submissionId,
            action: 'Submitted',
            performedBy: submittedBy,
            performedByName: 'Employee',
            performedByRole: 'Employee',
            newValues: updatedSubmission,
            comments: 'Submitted for approval'
        });
        
        return returnFormatter(true, "Expense submission submitted for approval", updatedSubmission);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function approveExpenseSubmission(submissionId, comments, approvedAmount, organizationId, approvedBy) {
    try {
        const submission = await expenseSubmissionModel.findOne({ 
            submissionId, 
            organizationId 
        });
        
        if (!submission) {
            return returnFormatter(false, "Expense submission not found");
        }
        
        if (submission.status !== 'Submitted' && submission.status !== 'In_Review') {
            return returnFormatter(false, "Invalid submission status for approval");
        }
        
        const updatedSubmission = await expenseSubmissionModel.findOneAndUpdate(
            { submissionId },
            { 
                status: 'Approved',
                approvedAt: new Date(),
                approvedBy,
                approvedAmount: approvedAmount || submission.totalAmount,
                $push: {
                    'workflowInstance.stageHistory': {
                        stageId: submission.workflowInstance.currentStageId,
                        stageName: submission.workflowInstance.currentStageName,
                        assignedTo: submission.workflowInstance.currentAssignee,
                        action: 'Approved',
                        comments: comments || 'Approved',
                        actionDate: new Date()
                    }
                }
            },
            { new: true }
        );
        
        // Create audit log
        await createAuditLog({
            organizationId,
            entityType: 'ExpenseSubmission',
            entityId: submissionId,
            action: 'Approved',
            performedBy: approvedBy,
            performedByName: 'Manager',
            performedByRole: 'Manager',
            newValues: updatedSubmission,
            comments: comments || 'Approved'
        });
        
        return returnFormatter(true, "Expense submission approved", updatedSubmission);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function rejectExpenseSubmission(submissionId, comments, rejectionReason, organizationId, rejectedBy) {
    try {
        const submission = await expenseSubmissionModel.findOne({ 
            submissionId, 
            organizationId 
        });
        
        if (!submission) {
            return returnFormatter(false, "Expense submission not found");
        }
        
        if (submission.status !== 'Submitted' && submission.status !== 'In_Review') {
            return returnFormatter(false, "Invalid submission status for rejection");
        }
        
        const updatedSubmission = await expenseSubmissionModel.findOneAndUpdate(
            { submissionId },
            { 
                status: 'Rejected',
                rejectionReason: rejectionReason || 'Not specified',
                $push: {
                    'workflowInstance.stageHistory': {
                        stageId: submission.workflowInstance.currentStageId,
                        stageName: submission.workflowInstance.currentStageName,
                        assignedTo: submission.workflowInstance.currentAssignee,
                        action: 'Rejected',
                        comments: comments || 'Rejected',
                        actionDate: new Date()
                    }
                }
            },
            { new: true }
        );
        
        // Create audit log
        await createAuditLog({
            organizationId,
            entityType: 'ExpenseSubmission',
            entityId: submissionId,
            action: 'Rejected',
            performedBy: rejectedBy,
            performedByName: 'Manager',
            performedByRole: 'Manager',
            newValues: updatedSubmission,
            comments: comments || 'Rejected'
        });
        
        return returnFormatter(true, "Expense submission rejected", updatedSubmission);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function returnExpenseSubmission(submissionId, comments, organizationId, returnedBy) {
    try {
        const submission = await expenseSubmissionModel.findOne({ 
            submissionId, 
            organizationId 
        });
        
        if (!submission) {
            return returnFormatter(false, "Expense submission not found");
        }
        
        if (submission.status !== 'Submitted' && submission.status !== 'In_Review') {
            return returnFormatter(false, "Invalid submission status for return");
        }
        
        const updatedSubmission = await expenseSubmissionModel.findOneAndUpdate(
            { submissionId },
            { 
                status: 'Returned',
                $push: {
                    'workflowInstance.stageHistory': {
                        stageId: submission.workflowInstance.currentStageId,
                        stageName: submission.workflowInstance.currentStageName,
                        assignedTo: submission.workflowInstance.currentAssignee,
                        action: 'Returned',
                        comments: comments || 'Returned for corrections',
                        actionDate: new Date()
                    }
                }
            },
            { new: true }
        );
        
        // Create audit log
        await createAuditLog({
            organizationId,
            entityType: 'ExpenseSubmission',
            entityId: submissionId,
            action: 'Returned',
            performedBy: returnedBy,
            performedByName: 'Manager',
            performedByRole: 'Manager',
            newValues: updatedSubmission,
            comments: comments || 'Returned for corrections'
        });
        
        return returnFormatter(true, "Expense submission returned", updatedSubmission);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function withdrawExpenseSubmission(submissionId, organizationId, withdrawnBy) {
    try {
        const submission = await expenseSubmissionModel.findOne({ 
            submissionId, 
            organizationId 
        });
        
        if (!submission) {
            return returnFormatter(false, "Expense submission not found");
        }
        
        if (submission.submittedBy !== withdrawnBy) {
            return returnFormatter(false, "You can only withdraw your own submissions");
        }
        
        if (submission.status === 'Approved' || submission.status === 'Rejected') {
            return returnFormatter(false, "Cannot withdraw processed submission");
        }
        
        const updatedSubmission = await expenseSubmissionModel.findOneAndUpdate(
            { submissionId },
            { 
                status: 'Withdrawn',
                $push: {
                    'workflowInstance.stageHistory': {
                        stageId: submission.workflowInstance.currentStageId,
                        stageName: submission.workflowInstance.currentStageName,
                        assignedTo: submission.workflowInstance.currentAssignee,
                        action: 'Returned',
                        comments: 'Withdrawn by submitter',
                        actionDate: new Date()
                    }
                }
            },
            { new: true }
        );
        
        // Create audit log
        await createAuditLog({
            organizationId,
            entityType: 'ExpenseSubmission',
            entityId: submissionId,
            action: 'Withdrawn',
            performedBy: withdrawnBy,
            performedByName: 'Employee',
            performedByRole: 'Employee',
            newValues: updatedSubmission,
            comments: 'Withdrawn by submitter'
        });
        
        return returnFormatter(true, "Expense submission withdrawn", updatedSubmission);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function getSubmissionsByUser(userId, organizationId, filters) {
    try {
        const { page, limit, status } = filters;
        const skip = (page - 1) * limit;
        
        let query = { submittedBy: userId, organizationId };
        
        if (status) query.status = status;
        
        const submissions = await expenseSubmissionModel
            .find(query)
            .select('-__v')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await expenseSubmissionModel.countDocuments(query);
        
        const result = {
            submissions,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        };
        
        return returnFormatter(true, "User submissions retrieved successfully", result);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function getSubmissionsForApproval(userId, organizationId, filters) {
    try {
        const { page, limit, priority } = filters;
        const skip = (page - 1) * limit;
        
        let query = {
            organizationId,
            status: { $in: ['Submitted', 'In_Review'] },
            'workflowInstance.currentAssignee': userId
        };
        
        if (priority) {
            query.priority = priority;
        }
        
        const submissions = await expenseSubmissionModel
            .find(query)
            .select('-__v')
            .sort({ 
                priority: -1, 
                createdAt: 1 
            })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await expenseSubmissionModel.countDocuments(query);
        
        const result = {
            submissions,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        };
        
        return returnFormatter(true, "Approval queue retrieved successfully", result);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function getSubmissionHistory(submissionId, organizationId) {
    try {
        const submission = await expenseSubmissionModel.findOne({ 
            submissionId, 
            organizationId 
        }).select('workflowInstance.stageHistory submissionId');
        
        if (!submission) {
            return returnFormatter(false, "Expense submission not found");
        }
        
        return returnFormatter(true, "Submission history retrieved successfully", submission.workflowInstance.stageHistory);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function bulkApproveSubmissions(submissionIds, comments, organizationId, approvedBy) {
    try {
        const results = [];
        
        for (const submissionId of submissionIds) {
            const result = await approveExpenseSubmission(
                submissionId, 
                comments, 
                null, // Use original amount
                organizationId, 
                approvedBy
            );
            results.push({
                submissionId,
                success: result.status,
                message: result.message
            });
        }
        
        const successCount = results.filter(r => r.success).length;
        const totalCount = results.length;
        
        return returnFormatter(
            true, 
            `Bulk approval completed: ${successCount}/${totalCount} successful`, 
            results
        );
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function exportSubmissions(organizationId, filters) {
    try {
        const { format, startDate, endDate, status } = filters;
        
        let query = { organizationId };
        
        if (status) query.status = status;
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }
        
        const submissions = await expenseSubmissionModel
            .find(query)
            .select('-__v -workflowInstance.stageHistory')
            .sort({ createdAt: -1 });
        
        if (format === 'csv') {
            // Convert to CSV format
            const csvHeader = 'Submission ID,Expense Type,Amount,Status,Submitted By,Created At,Description\n';
            const csvData = submissions.map(sub => 
                `${sub.submissionId},${sub.expenseTypeId},${sub.totalAmount},${sub.status},${sub.submittedBy},${sub.createdAt},"${sub.formData?.description || ''}"`
            ).join('\n');
            
            return returnFormatter(true, "CSV export generated", csvHeader + csvData);
        } else {
            return returnFormatter(true, "JSON export generated", submissions);
        }
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function validateSubmissionData(formData, expenseTypeId) {
    try {
        const validationErrors = [];
        
        // Basic validations
        if (!formData.description) {
            validationErrors.push("Description is required");
        }
        
        if (!formData.amount || formData.amount <= 0) {
            validationErrors.push("Valid amount is required");
        }
        
        if (validationErrors.length > 0) {
            return returnFormatter(false, "Validation failed", { errors: validationErrors });
        }
        
        return returnFormatter(true, "Validation successful", { isValid: true });
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function calculateTotalAmount(formData) {
    try {
        let total = 0;
        
        // Calculate based on form data structure
        if (formData.amount) {
            total += parseFloat(formData.amount);
        }
        
        // Add any additional amounts from line items
        if (formData.lineItems && Array.isArray(formData.lineItems)) {
            total += formData.lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        }
        
        return returnFormatter(true, "Amount calculated successfully", { total });
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}
