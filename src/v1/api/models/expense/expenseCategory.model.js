import mongoose, { model, Schema } from 'mongoose';
const ObjectId = Schema.Types.ObjectId;

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: '',
    },
    accountCode: {
        // this is the unique code for the category
        type: String,
        default: '',
    },
    isSubCategory: {
        type: Boolean,
        default: false,
    },
    expenseTypeId: {
        type: ObjectId,
        ref: 'expenesType',
        required: false,
    },
    parentCategoryId: {
        // For sub-categories, reference to parent category
        type: ObjectId,
        ref: 'category',
        default: null
    },
    createdById: {
        type: ObjectId,
        ref: "employee",
        // required: true,
        default: null,
    },
    organizationId: {
        type: ObjectId,
        ref: "Organization",
        // required: true,
        default: null,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
     isDefault: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

const categoryModel = model("category", categorySchema);

export default categoryModel;
