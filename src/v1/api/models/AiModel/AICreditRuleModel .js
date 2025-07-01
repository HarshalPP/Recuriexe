import mongoose from "mongoose";
const { Schema, model } = mongoose;

const aiCreditRuleSchema = new Schema(
  {
    actionType: {
      type: String,
    },

    creditsRequired: {
      type: Number
    },
    description: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

const AICreditRuleModel = model("AICreditRule", aiCreditRuleSchema);
export default AICreditRuleModel;
