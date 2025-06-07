import mongoose, { Schema, model } from "mongoose";


const merchantSchema = new Schema(
  {
    merchantName: {
      type: String,
      default: "",
    },
    merchantCode: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "employee",
      default: null,
    }
  },
  { timestamps: true }
);

const merchantModel = model("merchant", merchantSchema);
export default merchantModel;
