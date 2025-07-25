import mongoose, { Schema, model } from 'mongoose';

const formSchema = new Schema({
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization ID is required"],
    },
   reportId : {
      type: Schema.Types.ObjectId,
      ref: "reportType",
      required: [true, "Report type ID is required"],
    },
    title :String,
    fields: [
        {
            type: Schema.Types.ObjectId,
            ref: "inputField",
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

const reportFormModel = model("reportForm", formSchema);
export default reportFormModel;
