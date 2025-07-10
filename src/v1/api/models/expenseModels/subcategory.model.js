import { mongoose,model, Schema } from 'mongoose';

const subcategorySchema = new Schema({
    subcategoryId: {
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
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Organization'
      },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    displayOrder: {
        type: Number,
        default: 0
    },
    icon: {
        type: String,
        default: ""
    },
    color: {
        type: String,
        default: ""
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    schemaVersion: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Compound index for organization and system category
subcategorySchema.index({ organizationId: 1, systemCategoryId: 1 });

const subcategoryModel = model("subcategory", subcategorySchema);
export default subcategoryModel;
