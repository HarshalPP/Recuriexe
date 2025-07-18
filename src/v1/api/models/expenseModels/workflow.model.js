import { mongoose,model, Schema } from 'mongoose';

const conditionSchema = new Schema({
    field: {
        type: String,
        required: true
    },
    operator: {
        type: String,
        // required: true
    },
    value: {
        type: Schema.Types.Mixed,
        // required: true
    },
    nextStageId: {
        type: String,
        default: ""
    },
    action: {
        type: String,
        enum: ['approve_auto', 'require_approval', 'skip', 'notify']
    }
}, { _id: false });

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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'role',
        // enum: ['Employee', 'Manager', 'Finance', 'Admin', 'CFO', 'CEO', 'Department_Head', 'Project_Manager'],
        required: true
    },
    conditions: {
        type: [conditionSchema],
        default: []
    },
        // conditions: {

    //    field: {
    //         type: String,
    //         default: ""
    //     }, 
    //     operator: {
    //         type: String,
    //         enum: ["",'equals', 'not_equals', 'greater_than', 'less_than', 'greater_equal', 'less_equal'],
    //         default: ""
    //     },
    //     value: {
    //         type: Schema.Types.Mixed,
    //         default: null
    //     },
    //     nextStageId: {
    //         type: String,
    //         default: ""
    //     }
    // },
    conditionLogic: {
        type: String,
        enum: ['AND', 'OR'],
        default: 'AND'
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
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
