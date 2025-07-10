import { model, Schema } from 'mongoose';

const templateSchema = new Schema({
    templateId: {
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
    templateType: {
        type: String,
        enum: ['Form', 'Workflow', 'ExpenseType'],
        required: true
    },
    category: {
        type: String,
        default: ""
    },
    templateData: {
        type: Schema.Types.Mixed,
        required: true
    },
    tags: [{
        type: String
    }],
    isPublic: {
        type: Boolean,
        default: false
    },
    usageCount: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    reviews: [{
        userId: String,
        rating: Number,
        comment: String,
        reviewDate: {
            type: Date,
            default: Date.now
        }
    }],
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

// Compound indexes
templateSchema.index({ organizationId: 1, templateType: 1 });
templateSchema.index({ templateType: 1, isPublic: 1, isActive: 1 });
templateSchema.index({ tags: 1, isActive: 1 });

const templateModel = model("template", templateSchema);
export default templateModel;
