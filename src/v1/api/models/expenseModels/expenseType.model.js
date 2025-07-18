import { mongoose,model, Schema } from 'mongoose';

const expenseTypeSchema = new Schema({
    expenseTypeId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    systemCategoryId: {
        type: String,
        ref: 'systemCategory',
        required: true
    },
    subcategoryId: {
        type: String,
        ref: 'subcategory',
        required: true
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
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
    autoApproveConfig:{ type: Boolean,default:false},

    config: 
    {
        // additionalConfig: {
            type: Schema.Types.Mixed,
            default: {}
        // }
    },
    
    formId: {
        type: String,
        ref: 'dynamicForm',
        default: null
    },
    workflowId: {
        type: String,
        ref: 'workflow',
        required: true
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    publishedBy: {
        type: String,
        default: ""
    },
    publishedAt: {
        type: Date,
        default: null
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
expenseTypeSchema.index({ organizationId: 1, isPublished: 1, isActive: 1 });
expenseTypeSchema.index({ subcategoryId: 1, isActive: 1 });

const expenseTypeModel = model("expenseType", expenseTypeSchema);
export default expenseTypeModel;
