import { model, Schema } from 'mongoose';
const ObjectId = Schema.Types.ObjectId;

const userExpenesSchema = new Schema({
    expenseId: {
        type: ObjectId,
        ref: "expenesType",
        default: null,
    },
    createdBy: {
        type: ObjectId,
        ref: "employee",
        default: null,
    },
    minValue: {
        type: Number,
        default: 0,
    },
    maxValue: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
      organizationId: {
        type: ObjectId,
        ref: "Organization",
        // required: true,
        default: null,
    },
}, { timestamps: true });

const userExpenesModel = model("userExpenes", userExpenesSchema);

export default userExpenesModel;
