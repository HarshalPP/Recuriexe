import { model, Schema } from 'mongoose';

const reportConfigSchema = new Schema({
    reportConfigId: {
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
    reportType: {
        type: String,
        enum: ['ExpenseVolume', 'ApprovalSLA', 'BudgetUtilization', 'UserActivity', 'AuditTrail', 'Custom'],
        required: true
    },
    filters: {
        dateRange: {
            startDate: Date,
            endDate: Date
        },
        departments: [String],
        expenseTypes: [String],
        users: [String],
        status: [String],
        amountRange: {
            min: Number,
            max: Number
        },
        customFilters: {
            type: Schema.Types.Mixed,
            default: {}
        }
    },
    groupBy: [{
        type: String,
        enum: ['Department', 'ExpenseType', 'User', 'Month', 'Quarter', 'Year', 'Status']
    }],
    metrics: [{
        name: String,
        aggregation: {
            type: String,
            enum: ['Sum', 'Count', 'Average', 'Min', 'Max']
        },
        field: String
    }],
    visualization: {
        chartType: {
            type: String,
            enum: ['Table', 'Bar', 'Line', 'Pie', 'Donut', 'Area'],
            default: 'Table'
        },
        showTotal: {
            type: Boolean,
            default: true
        },
        showPercentage: {
            type: Boolean,
            default: false
        }
    },
    schedule: {
        isScheduled: {
            type: Boolean,
            default: false
        },
        frequency: {
            type: String,
            enum: ['Daily', 'Weekly', 'Monthly', 'Quarterly'],
            default: 'Monthly'
        },
        recipients: [String],
        nextRun: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: String,
        required: true
    },
    lastRunAt: {
        type: Date,
        default: null
    },
    schemaVersion: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Compound indexes
reportConfigSchema.index({ organizationId: 1, reportType: 1 });
reportConfigSchema.index({ createdBy: 1, isActive: 1 });
reportConfigSchema.index({ 'schedule.isScheduled': 1, 'schedule.nextRun': 1 });

const reportConfigModel = model("reportConfig", reportConfigSchema);
export default reportConfigModel;
