import mongoose from "mongoose";
const { Schema, model } = mongoose;

const subscriptionPlanSchema = new Schema({
  name: {
    type: String,
    required: true
  },

  description: String,

  price: {
    type: Number,
  },

  durationInDays: {
    type: Number
  },

  creditLimit: {
    type: Number
  },

  isActive: {
    type: String,
    default: "true"
  }
}, { timestamps: true });

const SubscriptionPlan = model("SubscriptionPlan", subscriptionPlanSchema);
export default SubscriptionPlan;
 