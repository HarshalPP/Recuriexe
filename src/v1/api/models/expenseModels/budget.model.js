import { model, Schema } from 'mongoose';

const budgetSchema = new Schema({
    budgetId: {
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
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    budgetType: {
        type: String,
        enum: ['Department', 'Project', 'ExpenseType', 'User'],
        required: true
    },
    allocatedTo: {
        type: String,
        required: true // departmentId, projectId, expenseTypeId, or userId
    },
    allocatedToName: {
        type: String,
        required: true
    },
    totalBudget: {
        type: Number,
        required: true
    },
    utilizedBudget: {
        type: Number,
        default: 0
    },
    remainingBudget: {
        type: Number,
        default: function() {
            return this.totalBudget - this.utilizedBudget;
        }
    },
    currency: {
        type: String,
        default: 'INR'
    },
    period: {
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        fiscalYear: {
            type: String,
            required: true
        }
    },
    warningThreshold: {
        type: Number,
        default: 80 // percentage
    },
    isExceeded: {
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
    schemaVersion: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Compound indexes
budgetSchema.index({ organizationId: 1, budgetType: 1 });
budgetSchema.index({ organizationId: 1, allocatedTo: 1 });
budgetSchema.index({ 'period.fiscalYear': 1, isActive: 1 });

const budgetModel = model("budget", budgetSchema);
export default budgetModel;
