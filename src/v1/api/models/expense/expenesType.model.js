import { model, Schema } from 'mongoose';
const ObjectId = Schema.Types.ObjectId;
const expenesTypeSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    categoriesIds: {
        type: [ObjectId],
        ref: "category",
        // required: true,
        default: [],
    },
    defaultCategoryId: {
        type: ObjectId,
        ref: "category",
        // required: true,
        default: null,
    },
    description: {
        type: String,
        // required: true,
    },
    createdBy: {
        type: ObjectId,
        ref: "employee",
        // required: true,
        default: null,
    },
    // level:{
    //     type: [String],
    //     default: ['L1','L2','L3']
    // },
    // remitter:{
    //     type: [String],
    //     default: ['R1','R2','R3']
    // },
    isActive: {
        type: Boolean,
        default: true,
    },
     isDefault: {
        type: Boolean,
        default: false,
    },
    organizationId: {
        type: ObjectId,
        ref: "Organization",
        // required: true,
        default: null,
    },
}, { timestamps: true });

const expenesTypeModel = model("expenesType", expenesTypeSchema);

export default expenesTypeModel;
