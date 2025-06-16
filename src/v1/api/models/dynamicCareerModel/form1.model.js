import mongoose, { Schema, model } from 'mongoose';
const { ObjectId } = Schema;

const formSchema = new Schema({
    // serviceId: {
    //     type: Schema.Types.ObjectId,
    //     ref: "users",
    //     required: true,
    // },
       organizationId: { type: ObjectId, ref: "Organization", default :null },

    title :String,
    fields: [
        {
            type: Schema.Types.ObjectId,
            ref: "inputs",
        }
    ],
    status:{
        type :String,
        default : "active"
    },
    schemaVersion: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });

const formModel = model("form", formSchema);
export default formModel;
