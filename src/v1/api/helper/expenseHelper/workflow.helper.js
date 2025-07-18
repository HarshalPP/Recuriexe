import workflowModel from "../../models/expenseModels/workflow.model.js";
import { returnFormatter, generateUniqueId } from "../../formatters/common.formatter.js";
import { formatWorkflow, formatWorkflowForUpdate } from "../../formatters/expenseFormatter/workflow.formatter.js";
import { createAuditLog } from "./auditLog.helper.js";

export async function createWorkflow(workflowData, organizationId, Id) {
    try {
        console.log("Id",Id)
        const createdBy =Id;
        console.log("createdBy",createdBy)
        const formattedData = formatWorkflow(workflowData, organizationId, createdBy);
        const newWorkflow = new workflowModel(formattedData);

        const savedWorkflow = await newWorkflow.save();

        // Step 2: Populate role name after save
            
        // Create audit log
        await createAuditLog({
            organizationId,
            entityType: 'Workflow',
            entityId: savedWorkflow.workflowId,
            action: 'Created',
            performedBy: createdBy,
            performedByName: 'System User',
            performedByRole: 'Admin',
            newValues: savedWorkflow
        });

         const populatedWorkflow = await workflowModel.findById(savedWorkflow._id)
            .populate('stages.roleRequired', 'roleName roleCode');   
        
        return returnFormatter(true, "Workflow created successfully", populatedWorkflow);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function getAllWorkflows(organizationId, filters) {
    try {
        const { page, limit, type } = filters;
        const skip = (page - 1) * limit;
        
        let query = { organizationId, isActive: true };
        if (type) query.type = type;
        
        const workflows = await workflowModel
            .find(query)
            .select('-__v')
            .populate('stages.roleRequired', 'roleName roleCode')
            .sort({ name: 1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await workflowModel.countDocuments(query);
        
        const result = {
            workflows,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        };
        
        return returnFormatter(true, "Workflows retrieved successfully", result);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function getWorkflowById(workflowId, organizationId) {
    try {
        const workflow = await workflowModel.findOne({ 
            workflowId, 
            organizationId,
            isActive: true 
        }).select('-__v');
        
        if (!workflow) {
            return returnFormatter(false, "Workflow not found");
        }
        
        return returnFormatter(true, "Workflow retrieved successfully", workflow);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function updateWorkflowData(workflowId, updateData, organizationId, updatedBy) {
    try {
        const existingWorkflow = await workflowModel.findOne({ 
            workflowId, 
            organizationId,
            isActive: true 
        });
        
        if (!existingWorkflow) {
            return returnFormatter(false, "Workflow not found");
        }
        
        const formattedData = formatWorkflowForUpdate(updateData);
        const updatedWorkflow = await workflowModel.findOneAndUpdate(
            { workflowId },
            formattedData,
            { new: true }
        ).select('-__v');
        
        // Create audit log
        await createAuditLog({
            organizationId,
            entityType: 'Workflow',
            entityId: workflowId,
            action: 'Updated',
            performedBy: updatedBy,
            performedByName: 'System User',
            performedByRole: 'Admin',
            oldValues: existingWorkflow,
            newValues: updatedWorkflow
        });
        
        return returnFormatter(true, "Workflow updated successfully", updatedWorkflow);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function deleteWorkflowData(workflowId, organizationId, deletedBy) {
    try {
        const workflow = await workflowModel.findOne({ 
            workflowId, 
            organizationId,
            isActive: true 
        });
        
        if (!workflow) {
            return returnFormatter(false, "Workflow not found");
        }
        
        // Soft delete
        await workflowModel.findOneAndUpdate(
            { workflowId },
            { isActive: false }
        );
        
        // Create audit log
        await createAuditLog({
            organizationId,
            entityType: 'Workflow',
            entityId: workflowId,
            action: 'Deleted',
            performedBy: deletedBy,
            performedByName: 'System User',
            performedByRole: 'Admin',
            oldValues: workflow
        });
        
        return returnFormatter(true, "Workflow deleted successfully");
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function getWorkflowTemplates() {
    try {
        const templates = [
            {
                templateId: "TMPL_BASIC",
                name: "Basic Approval",
                description: "Simple single-stage approval workflow",
                stages: [
                    {
                        stageId: "STAGE_1",
                        name: "Manager Approval",
                        assignedRole: "Manager",
                        conditions: {}
                    }
                ]
            },
            {
                templateId: "TMPL_STANDARD",
                name: "Standard Approval",
                description: "Two-stage approval workflow",
                stages: [
                    {
                        stageId: "STAGE_1",
                        name: "Manager Review",
                        assignedRole: "Manager",
                        conditions: { amountLimit: 25000 }
                    },
                    {
                        stageId: "STAGE_2",
                        name: "Finance Approval",
                        assignedRole: "Finance",
                        conditions: {}
                    }
                ]
            },
            {
                templateId: "TMPL_COMPLEX",
                name: "Complex Approval",
                description: "Multi-stage approval with conditional routing",
                stages: [
                    {
                        stageId: "STAGE_1",
                        name: "Manager Review",
                        assignedRole: "Manager",
                        conditions: { amountLimit: 10000 }
                    },
                    {
                        stageId: "STAGE_2",
                        name: "Finance Review",
                        assignedRole: "Finance",
                        conditions: { amountLimit: 50000 }
                    },
                    {
                        stageId: "STAGE_3",
                        name: "Admin Approval",
                        assignedRole: "Admin",
                        conditions: {}
                    }
                ]
            }
        ];
        
        return returnFormatter(true, "Workflow templates retrieved successfully", templates);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function validateWorkflowStages(stages) {
    try {
        const validationErrors = [];
        
        if (!stages || stages.length === 0) {
            validationErrors.push("Workflow must have at least one stage");
        }
        
        stages.forEach((stage, index) => {
            if (!stage.name) {
                validationErrors.push(`Stage ${index + 1} must have a name`);
            }
            if (!stage.assignedRole) {
                validationErrors.push(`Stage ${index + 1} must have an assigned role`);
            }
        });
        
        if (validationErrors.length > 0) {
            return returnFormatter(false, "Workflow validation failed", { errors: validationErrors });
        }
        
        return returnFormatter(true, "Workflow validation passed");
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}
