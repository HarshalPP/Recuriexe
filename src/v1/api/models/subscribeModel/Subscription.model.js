import mongoose from "mongoose";
const { Schema, model } = mongoose;

const subscriptionSchema = new Schema({
  superAdminId: { type: Schema.Types.ObjectId, ref: "SuperAdmin", default:null },
  planId: { type: Schema.Types.ObjectId, ref: "SubscriptionPlan", default:null },

  apiKey: { type: String, required: false },
  isActive: { type: Boolean, default: true },

  subscribedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: false },

  creditsUsed: { type: Number, default: 0 }
}, { timestamps: true });

const Subscription = model("Subscription", subscriptionSchema);
export default Subscription;
