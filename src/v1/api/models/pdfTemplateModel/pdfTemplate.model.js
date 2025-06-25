import { model, Schema } from 'mongoose';
 
const templateSchema = new Schema({
 organizationId: {
 type: Schema.Types.ObjectId,
 ref: "Organization",
 required: true,
 },
 templateName: {
 type: String,
 required: true,
 },
 
 htmlContent: {
 type: String,
 required: true,
 },
 schemaVersion: {
 type: Number,
 default: 0,
 }
}, { timestamps: true });
 
const templateModel = model("template", templateSchema);
export default templateModel;