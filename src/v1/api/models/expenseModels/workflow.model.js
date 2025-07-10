import { model, Schema } from 'mongoose';

const stageSchema = new Schema({
    stageId: {
        type: String,
        required: true
    },
    stageName: {
        type: String,
        required: true
    },
    stageOrder: {
        type: Number,
        required: true
    },
    roleRequired: {
        type: String,
        enum: ['Employee', 'Manager', 'Finance', 'Admin', 'CFO', 'CEO', 'Department_Head', 'Project_Manager'],
        required: true
    },
    conditions: {
        field: {
            type: String,
            default: ""
        },
        operator: {
            type: String,
            enum: ["",'equals', 'not_equals', 'greater_than', 'less_than', 'greater_equal', 'less_equal'],
            default: ""
        },
        value: {
            type: Schema.Types.Mixed,
            default: null
        },
        nextStageId: {
            type: String,
            default: ""
        }
    },
    isParallel: {
        type: Boolean,
        default: false
    },
    timeoutHours: {
        type: Number,
        default: 72
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { _id: false });

const workflowSchema = new Schema({
    workflowId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    organizationId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    stages: [stageSchema],
    workflowType: {
        type: String,
        enum: ['Sequential', 'Conditional', 'Parallel'],
        default: 'Sequential'
    },
    isTemplate: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: String,
        required: true
    },
    version: {
        type: Number,
        default: 1
    },
    schemaVersion: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

workflowSchema.index({ organizationId: 1, isActive: 1 });
workflowSchema.index({ isTemplate: 1, isActive: 1 });

const workflowModel = model("workflow", workflowSchema);
export default workflowModel;
