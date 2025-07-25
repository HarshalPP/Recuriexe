import mongoose, { model, Schema } from 'mongoose';

const variableSchema = new Schema({
    variableName: {
        type: String
    },
    organizationId: { type: Schema.Types.ObjectId, default: null, ref: "Organization" },
    isActive: {
        type: Boolean,
        default: true
    },
    schemaVersion: { 
        type: Number, 
        default: 0 
    }
}, { timestamps: true });

const reportVariableModel = model("reportVariable", variableSchema);
export default reportVariableModel;
