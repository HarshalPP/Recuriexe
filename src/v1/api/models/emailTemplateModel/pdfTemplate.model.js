import { model, Schema } from 'mongoose';

const templateSchema = new Schema({
    serviceId: {
        type: Schema.Types.ObjectId, 
        ref: "users",
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

const emailTemplateModel = model("emailtemplate", templateSchema);
export default emailTemplateModel;
