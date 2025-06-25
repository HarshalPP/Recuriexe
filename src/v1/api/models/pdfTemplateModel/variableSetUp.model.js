import mongoose, { model, Schema } from 'mongoose';
 
const variableSchema = new Schema({
 variableName: {
 type: String
 },
 organizationId: {
 type: Schema.Types.ObjectId,
 ref: "Organization",
 required: true,
 },
 schemaVersion: {
 type: Number,
 default: 0
 }
}, { timestamps: true });
 
const variableModel = model("variable", variableSchema);
export default variableModel;