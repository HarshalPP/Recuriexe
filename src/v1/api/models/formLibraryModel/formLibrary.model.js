import mongoose, { model, Schema } from 'mongoose';

const formSchema = new Schema({
    fieldName: { type: String, trim: true },
    dataType: {
      type: String,
      trim: true,
      enum: ["file", "string","textarea","multiUpload","date"], 
    },
    isRequired : {
        type : Boolean,
        default : true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    schemaVersion: { 
        type: Number, 
        default: 0 
    }
}, { timestamps: true });

const formModel = model("form-library", formSchema);
export default formModel;
