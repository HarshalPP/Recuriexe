import workflowModel from '../../src/api/v1/models/expense/workflow.model.js';

export async function seedWorkflows() {
    // Check if already seeded
    const existingCount = await workflowModel.countDocuments();
    if (existingCount > 0) {
        console.log('   📝 Workflows already exist, skipping...');
        return;
    }
    
    const workflows = [
        {
            workflowId: "WF_STANDARD_001",
            organizationId: "ORG_TECHCORP_001",
            name: "Standard Approval Workflow",
            description: "Standard 3-stage approval workflow for most expenses",
            stages: [
                {
                    stageId: "STAGE_001",
                    stageName: "Manager Approval",
                    stageOrder: 1,
                    assignedRoles: ["Manager"],
                    assignedUsers: [],
                    isOptional: false,
                    conditions: [
                        {
                            field: "amount",
                            operator: "<=",
                            value: 50000,
                            action: "approve_auto"
                        }
                    ],
                    slaHours: 24,
                    escalationRules: {
                        escalateAfterHours: 48,
                        escalateTo: ["Admin"]
                    }
                },
                {
                    stageId: "STAGE_002",
                    stageName: "Finance Review",
                    stageOrder: 2,
                    assignedRoles: ["Finance"],
                    assignedUsers: [],
                    isOptional: false,
                    conditions: [
                        {
                            field: "amount",
                            operator: ">",
                            value: 10000,
                            action: "require_approval"
                        }
                    ],
                    slaHours: 48,
                    escalationRules: {
                        escalateAfterHours: 72,
                        escalateTo: ["Admin"]
                    }
                },
                {
                    stageId: "STAGE_003",
                    stageName: "Final Approval",
                    stageOrder: 3,
                    assignedRoles: ["Admin"],
                    assignedUsers: [],
                    isOptional: true,
                    conditions: [
                        {
                            field: "amount",
                            operator: ">",
                            value: 100000,
                            action: "require_approval"
                        }
                    ],
                    slaHours: 72,
                    escalationRules: {}
                }
            ],
            isActive: true,
            createdBy: "SYSTEM"
        },
        {
            workflowId: "WF_TRAVEL_001",
            organizationId: "ORG_TECHCORP_001",
            name: "Travel Approval Workflow",
            description: "Specialized workflow for travel expenses with pre-approval requirements",
            stages: [
                {
                    stageId: "STAGE_001",
                    stageName: "Travel Pre-Approval",
                    stageOrder: 1,
                    assignedRoles: ["Manager"],
                    assignedUsers: [],
                    isOptional: false,
                    conditions: [
                        {
                            field: "travelType",
                            operator: "==",
                            value: "International",
                            action: "require_documents"
                        }
                    ],
                    slaHours: 24,
                    escalationRules: {
                        escalateAfterHours: 48,
                        escalateTo: ["Finance"]
                    }
                },
                {
                    stageId: "STAGE_002",
                    stageName: "Finance Verification",
                    stageOrder: 2,
                    assignedRoles: ["Finance"],
                    assignedUsers: [],
                    isOptional: false,
                    conditions: [],
                    slaHours: 48,
                    escalationRules: {
                        escalateAfterHours: 72,
                        escalateTo: ["Admin"]
                    }
                }
            ],
            isActive: true,
            createdBy: "SYSTEM"
        },
        {
            workflowId: "WF_CAPITAL_001",
            organizationId: "ORG_TECHCORP_001",
            name: "Capital Expense Workflow",
            description: "Multi-level approval workflow for capital expenditures",
            stages: [
                {
                    stageId: "STAGE_001",
                    stageName: "Department Head Approval",
                    stageOrder: 1,
                    assignedRoles: ["Manager"],
                    assignedUsers: [],
                    isOptional: false,
                    conditions: [],
                    slaHours: 48,
                    escalationRules: {
                        escalateAfterHours: 72,
                        escalateTo: ["Finance"]
                    }
                },
                {
                    stageId: "STAGE_002",
                    stageName: "Finance Review & Budget Check",
                    stageOrder: 2,
                    assignedRoles: ["Finance"],
                    assignedUsers: [],
                    isOptional: false,
                    conditions: [
                        {
                            field: "amount",
                            operator: ">",
                            value: 200000,
                            action: "require_business_case"
                        }
                    ],
                    slaHours: 72,
                    escalationRules: {
                        escalateAfterHours: 120,
                        escalateTo: ["Admin"]
                    }
                },
                {
                    stageId: "STAGE_003",
                    stageName: "Executive Approval",
                    stageOrder: 3,
                    assignedRoles: ["Admin"],
                    assignedUsers: [],
                    isOptional: false,
                    conditions: [
                        {
                            field: "amount",
                            operator: ">",
                            value: 500000,
                            action: "require_board_approval"
                        }
                    ],
                    slaHours: 120,
                    escalationRules: {}
                }
            ],
            isActive: true,
            createdBy: "SYSTEM"
        }
    ];
    
    await workflowModel.insertMany(workflows);
    console.log(`   ✅ Inserted ${workflows.length} workflows`);
}
