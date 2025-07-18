import { generateUniqueId } from '../common.formatter.js';

export function formatExpenseSubmission(submissionData,organizationId,submittedBy) {
    const {
        submittedByName,
        expenseTypeId,
        workflowId,
        formData,
        totalAmount,
        currency,
        department,
        project,
        attachments,
        priority
    } = submissionData;
    
    return {
        submissionId: generateUniqueId('SUB_'),
        organizationId,
        submittedBy,
        submittedByName: submittedByName || 'Unknown User',
        expenseTypeId,
        department: department || "",
        project: project || "",
        formData: formData || {},
        totalAmount: parseFloat(totalAmount) || 0,
        currency: currency || 'INR',
        workflowInstance: {
            workflowId: workflowId || 'WF_DEFAULT',
            currentStageId: 'STAGE_1',
            currentStageName: 'Initial Review',
            currentAssignee: 'MANAGER_001',
            stageHistory: []
        },
        status: 'Draft',
        priority: priority || 'Normal',
        attachments: attachments || [],
        approvedAmount: null,
        approvedBy: "",
        approvedAt: null,
        rejectionReason: "",
        internalNotes: "",
        isDraft: true,
        isActive: true
    };
}

export function formatSubmissionForUpdate(updateData) {
    const allowedFields = [
        'formData', 'totalAmount', 'currency', 'department', 'project', 
        'attachments', 'priority', 'internalNotes'
    ];
    
    const formattedData = {};
    
    Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
            if (key === 'totalAmount') {
                formattedData[key] = parseFloat(updateData[key]) || 0;
            } else {
                formattedData[key] = updateData[key];
            }
        }
    });
    
    return formattedData;
}

export function formatWorkflowStage(stageData) {
    return {
        stage: stageData.stage || 0,
        action: stageData.action,
        performedBy: stageData.performedBy,
        performedAt: stageData.performedAt || new Date(),
        comments: stageData.comments || '',
        rejectionReason: stageData.rejectionReason || null
    };
}

export function formatSubmissionFilters(filters) {
    const formattedFilters = {};
    
    if (filters.status) {
        formattedFilters.status = filters.status;
    }
    
    if (filters.expenseTypeId) {
        formattedFilters.expenseTypeId = filters.expenseTypeId;
    }
    
    if (filters.submittedBy) {
        formattedFilters.submittedBy = filters.submittedBy;
    }
    
    if (filters.startDate) {
        formattedFilters.startDate = new Date(filters.startDate);
    }
    
    if (filters.endDate) {
        formattedFilters.endDate = new Date(filters.endDate);
    }
    
    return formattedFilters;
}
