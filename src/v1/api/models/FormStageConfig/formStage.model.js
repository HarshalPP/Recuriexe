
import mongoose from "mongoose";
const Schema = mongoose.Schema;

const fieldSchema = new Schema({
  label: { type: String, required: true },
  fieldPath: { type: String, required: true }, // e.g. "Basic_Info.Name"
  required: { type: Boolean, default: false },
  type: { type: String, default: "text" }, // e.g., text, date, select
  enabled: { type: Boolean, default: true } // 🔸 show/hide field
});

const formStageSchema = new Schema(

  {  
    OrganizatioId:{type:mongoose.Schema.Types.ObjectId , ref:'Organization' , default:null },
    stageName: { type: String, required: true },
    stageKey: { type: String, required: true },
    order: { type: Number, required: true },
    isActive: { type: Boolean, default: true }, 
    Required:{type: Boolean, default: false},
    fields: [fieldSchema]
  },
  { timestamps: true }
);

export default mongoose.model("FormStageConfig", formStageSchema);
