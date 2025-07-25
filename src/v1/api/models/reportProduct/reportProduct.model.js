import mongoose, { model, Schema } from 'mongoose';


const productSchema = new Schema({
      reportName: {
        type: String
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization ID is required"],
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "reortService",
      required: [true, "Service ID is required"],
    },
    isActive : {
        type : Boolean,
        default : true
    },
    schemaVersion: { type: Number, default: 0 },
}, { timestamps: true });

const reportTypeModel = model("reportType", productSchema);
export default reportTypeModel;
