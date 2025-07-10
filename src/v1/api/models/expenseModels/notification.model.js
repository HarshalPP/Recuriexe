import { model, Schema } from 'mongoose';

const notificationSchema = new Schema({
    notificationId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    organizationId: {
        type: String,
        ref: 'organization',
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['ExpenseSubmitted', 'ExpenseApproved', 'ExpenseRejected', 'ExpenseReturned', 'BudgetWarning', 'BudgetExceeded', 'Reminder', 'System'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    relatedEntityType: {
        type: String,
        enum: ['ExpenseSubmission', 'Budget', 'ExpenseType', 'Workflow'],
        default: ""
    },
    relatedEntityId: {
        type: String,
        default: ""
    },
    priority: {
        type: String,
        enum: ['Low', 'Normal', 'High', 'Urgent'],
        default: 'Normal'
    },
    channels: {
        email: {
            type: Boolean,
            default: false
        },
        sms: {
            type: Boolean,
            default: false
        },
        push: {
            type: Boolean,
            default: true
        },
        slack: {
            type: Boolean,
            default: false
        }
    },
    deliveryStatus: {
        email: {
            sent: { type: Boolean, default: false },
            sentAt: { type: Date, default: null },
            delivered: { type: Boolean, default: false },
            deliveredAt: { type: Date, default: null }
        },
        sms: {
            sent: { type: Boolean, default: false },
            sentAt: { type: Date, default: null },
            delivered: { type: Boolean, default: false },
            deliveredAt: { type: Date, default: null }
        },
        push: {
            sent: { type: Boolean, default: false },
            sentAt: { type: Date, default: null },
            delivered: { type: Boolean, default: false },
            deliveredAt: { type: Date, default: null }
        },
        slack: {
            sent: { type: Boolean, default: false },
            sentAt: { type: Date, default: null },
            delivered: { type: Boolean, default: false },
            deliveredAt: { type: Date, default: null }
        }
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date,
        default: null
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

// Compound indexes
notificationSchema.index({ organizationId: 1, userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ relatedEntityType: 1, relatedEntityId: 1 });

const notificationModel = model("notification", notificationSchema);
export default notificationModel;
