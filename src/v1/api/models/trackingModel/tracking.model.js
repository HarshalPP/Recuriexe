import { ObjectId } from 'bson';
import mongoose, { model, Schema } from 'mongoose';

const trackingSchema = new Schema({
    employeeId: { type: ObjectId, required: true, default: null },
    location: {
        type: { type: String, default: "Point" },
        coordinates: { type: [Number], required: true },
    },
},
    {
        timestamps: true,
    });

const trackingModel = model("tracking", trackingSchema);

export default trackingModel;
