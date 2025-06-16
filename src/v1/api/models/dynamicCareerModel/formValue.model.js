import mongoose, { Schema, model } from 'mongoose';
const { ObjectId } = Schema;

const valueSchema = new Schema({
    // serviceId: {
    //     type: Schema.Types.ObjectId,
    //     ref: "users",
    //     required: true,
    // },
       organizationId: { type: ObjectId, ref: "Organization", default :null },
       formId: {
        type: Schema.Types.ObjectId,
        ref: "form",
        required: true,
    },

    doneBy: {
        type: Schema.Types.ObjectId,
        ref: "employees",
    },
    // productId: {
    //     type: Schema.Types.ObjectId,
    //     ref: "products",
    //     required: true,
    // },
    isApproved:{
        type : Boolean,
        default : false
    },
    approvedBy:{
        type: Schema.Types.ObjectId,
        ref: "employees",
    },
    latitude: { type: Number, index: false },
    longitude: { type: Number, index: false },
    formValues: [
        {
            fieldId: {
                type: mongoose.Types.ObjectId,
                ref: "form"
            },
            value: [String]
        }
    ],
    status: {
        type: String,
        default: "active"
    },
    schemaVersion: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });

const valueModel = model("value", valueSchema);
export default valueModel;
