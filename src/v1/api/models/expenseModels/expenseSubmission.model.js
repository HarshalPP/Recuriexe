import { mongoose,model, Schema } from 'mongoose';

const stageHistorySchema = new Schema({
    stageId: {
        type: String,
        required: true
    },
    stageName: {
        type: String,
        required: true
    },
    assignedTo: {
        type: String,
        required: true
    },
    action: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Returned', 'Forwarded'],
        default: 'Pending'
    },
    comments: {
        type: String,
        default: ""
    },
    actionDate: {
        type: Date,
        default: null
    },
    timeSpent: {
        type: Number, // in hours
        default: 0
    }
}, { _id: false });

const attachmentSchema = new Schema({
    attachmentId: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    uploadedBy: {
        type: String,
        required: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const expenseSubmissionSchema = new Schema({
    submissionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    expenseTypeId: {
        type: String,
        ref: 'expenseType',
        required: true
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Organization'
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'employee'
    },
    submittedByName: {
        type: String,
        required: true
    },
    department: {
        type: String,
        default: ""
    },
    project: {
        type: String,
        default: ""
    },
    formData: {
        type: Schema.Types.Mixed,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    workflowInstance: {
        workflowId: {
            type: String,
            ref: 'workflow',
            required: true
        },
        currentStageId: {
            type: String,
            required: true
        },
        currentStageName: {
            type: String,
            required: true
        },
        currentAssignee: {
            type: String,
            required: true
        },
        stageHistory: [stageHistorySchema]
    },
    status: {
        type: String,
        enum: ['Draft', 'Submitted', 'In_Review', 'Approved', 'Rejected', 'Returned', 'Withdrawn'],
        default: 'Draft'
    },
    priority: {
        type: String,
        enum: ['Low', 'Normal', 'High', 'Urgent'],
        default: 'Normal'
    },
    attachments: [attachmentSchema],
    approvedAmount: {
        type: Number,
        default: null
    },
    approvedBy: {
        type: String,
        default: ""
    },
    approvedAt: {
        type: Date,
        default: null
    },
    rejectionReason: {
        type: String,
        default: ""
    },
    internalNotes: {
        type: String,
        default: ""
    },
    isDraft: {
        type: Boolean,
        default: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    schemaVersion: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Compound indexes for efficient queries
expenseSubmissionSchema.index({ organizationId: 1, status: 1 });
expenseSubmissionSchema.index({ submittedBy: 1, status: 1 });
expenseSubmissionSchema.index({ 'workflowInstance.currentAssignee': 1, status: 1 });
expenseSubmissionSchema.index({ expenseTypeId: 1, createdAt: -1 });
expenseSubmissionSchema.index({ department: 1, createdAt: -1 });

const expenseSubmissionModel = model("expenseSubmission", expenseSubmissionSchema);
export default expenseSubmissionModel;
