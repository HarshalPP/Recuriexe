import { model, Schema } from 'mongoose';

const templateSchema = new Schema({
   organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization ID is required"],
    },
    templateName: {
        type: String,
        required: true,
    },
    userProductId:{
        type: Schema.Types.ObjectId, 
        ref: "userProductId",
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

const templateModel = model("vendor-template", templateSchema);
export default templateModel;
