import mongoose, { model, Schema } from 'mongoose';

const serviceSchema = new Schema({
      organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization ID is required"],
    },
    serviceName: {
        type: String,
        required: true,
        trim: true
    },
    schemaVersion: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const reportServiceModel = model("reortService", serviceSchema); 
export default reportServiceModel;
