import mongoose from "mongoose";

const verificationDocumentSchema = new mongoose.Schema({
  name: {
    type: String
  },
  label: {
    type: String,
    required: true // e.g., "Aadhar Card"
  },

  status:{
   type:String,
   default:"true"
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    default:null
  }
}, { timestamps: true });

export default mongoose.model("DocumentsetUp", verificationDocumentSchema);
