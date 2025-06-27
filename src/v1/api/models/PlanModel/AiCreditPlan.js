import mongoose from "mongoose";
const { Schema, model } = mongoose;

const aiCreditPlanSchema = new Schema(
  {
    name: {
      type: String,
      required: [false, "Name is required"],
    },
    description: {
      type: String,
      default: "",
    },
    NumberofCredit: {
      type: Number,
      required: [false, "Number of credit is required"],
    },
    PriceofCredit: {
      type: Number,
      required: [false, "Price of credit is required"],
    },
    pricePerCredit: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);


const AICreditPlanModel = model("AICreditPlan", aiCreditPlanSchema);
export default AICreditPlanModel;
