import mongoose, { model, Schema, } from 'mongoose';

const initSchema = new Schema({

  organizationId: { type: mongoose.Types.ObjectId, default: null, ref:"Organization" },
    fields: [{
        type: Schema.Types.ObjectId,
        ref: "forms",
    }]
    ,
    schemaVersion: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const initFieldModel = model("initField", initSchema);
export default initFieldModel;
