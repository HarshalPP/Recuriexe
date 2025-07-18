import { generateUniqueId } from '../common.formatter.js';

export function formatWorkflow(workflowData, organizationId, createdBy) {
    const {
        name,
        description,
        type,
        stages,
        conditions,
    } = workflowData;
    
    return {
        workflowId: generateUniqueId('WF_'),
        organizationId,
        name, 
        description: description || "",
        type: type || 'approval',
        stages: stages.map((stage, index) => formatWorkflowStage(stage, index)),
        conditions: conditions || {},
        isActive: true,
        createdBy
    };
}

export function formatWorkflowForUpdate(updateData) {
    const allowedFields = [
        'name', 'description', 'type', 'stages', 'conditions'
    ];
    
    const formattedData = {};
    
    Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
            if (key === 'stages') {
                formattedData[key] = updateData[key].map((stage, index) => formatWorkflowStage(stage, index));
            } else {
                formattedData[key] = updateData[key];
            }
        }
    });
    
    return formattedData;
}

export function formatWorkflowStage(stageData, order) {
    return {
        stageId: stageData.stageId || generateUniqueId('STAGE_'),
        stageName: stageData.stageName,
        description: stageData.description || "",
        roleRequired: stageData.assignedRoles,
        assignedUsers: stageData.assignedUsers || [],
        stageOrder: order,
        conditionLogic: stageData.conditionLogic || "AND",

        // conditions: stageData.conditions || {},
        // conditions: {
        //     field: stageData.conditions?.[0]?.field || "",
        //     operator: convertOperator(stageData.conditions?.[0]?.operator) || "",
        //     value: stageData.conditions?.[0]?.value || null,
        //     nextStageId:stageData.conditions?.[0]?.nextStageId || "",
        // },
        conditions: (stageData.conditions || []).map(cond => ({
            field: cond.field,
            operator: cond.operator,
            value: cond.value,
            nextStageId: cond.nextStageId || ""
        })),
        actions: stageData.actions || ['approve', 'reject', 'return'],
        timeoutHours: stageData.timeLimit || null, // in hours
        escalationRules: stageData.escalationRules || null
    };
}

function convertOperator(op) {
    const map = {
        '==': 'equals',
        '!=': 'not_equals',
        '>': 'greater_than',
        '<': 'less_than',
        '>=': 'greater_equal',
        '<=': 'less_equal'
    };
    return map[op] || op;
}

export function formatWorkflowConditions(conditions) {
    return {
        amountLimit: conditions.amountLimit || null,
        departmentRules: conditions.departmentRules || {},
        categoryRules: conditions.categoryRules || {},
        customRules: conditions.customRules || {}
    };
}

export function formatWorkflowInstance(workflowId, submissionData) {
    return {
        workflowId,
        currentStageId: null,
        currentStageName: "",
        currentAssignee: "",
        stageHistory: [],
        startedAt: new Date(),
        completedAt: null,
        status: 'pending'
    };
}
