import { mongoose,model, Schema } from 'mongoose';

const auditLogSchema = new Schema({
    auditId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
     organizationId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Organization'
        },
    entityType: {
        type: String,
        enum: ['ExpenseSubmission', 'ExpenseType', 'Workflow', 'DynamicForm', 'Subcategory', 'Budget', 'UserRole'],
        required: true
    },
    entityId: {
        type: String,
        required: true
    },
    action: {
        type: String,
        enum: ['Created', 'Updated', 'Deleted', 'Approved', 'Rejected', 'Submitted', 'Withdrawn', 'Returned'],
        required: true
    },
    performedBy: {
        // type: String,
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    performedByName: {
        type: String,
        required: true
    },
    performedByRole: {
        type: String,
        required: true
    },
    oldValues: {
        type: Schema.Types.Mixed,
        default: {}
    },
    newValues: {
        type: Schema.Types.Mixed,
        default: {}
    },
    changes: [{
        field: String,
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed
    }],
    comments: {
        type: String,
        default: ""
    },
    ipAddress: {
        type: String,
        default: ""
    },
    userAgent: {
        type: String,
        default: ""
    },
    metadata: {
        type: Schema.Types.Mixed,
        default: {}
    },
    schemaVersion: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Compound indexes for efficient querying
auditLogSchema.index({ organizationId: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ performedBy: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

const auditLogModel = model("auditLog", auditLogSchema);
export default auditLogModel;
