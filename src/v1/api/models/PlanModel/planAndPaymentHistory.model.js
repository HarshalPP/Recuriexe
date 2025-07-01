import mongoose from "mongoose";
const { Schema, model } = mongoose;

const planSchema = new Schema(
    {
        organizationId: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            required: [true, "Organization ID is required"],
        },
        planType: {
            type: String,
            enum :['AIPlan','Plan'],
            required: [true, "Plan Name is required"],
        },
        planId: {
            type: Schema.Types.ObjectId,
            ref: "Plan",
            default: null,
        },
        aiCreditPlanId: {
            type: Schema.Types.ObjectId,
            ref: "AICreditPlan",
            default: null,
        },
        status: {
            type: String,
            enum : ['pending','active','inactive'],
            default: 'pending',
        },
        createBy: {
            type: Schema.Types.ObjectId,
            ref: 'employee',
            default: null
        },
        paymentStatus: {
            type: String,
            default: "",
        },
        paymentDate: {
            type: Date,
            default: null,
        },
        paymentMethod: {
            type: String,
            default: "",
        },
        orderId: {
            type: String,
            default: "",
        },
        transactionId: {
            type: String,
            default: "",
        },

        numberOfCredits:{
            type:Number,
            default:0
        },

        Amount:{
            type:Number,
            default:0
        }
    },
    { timestamps: true }
);

const PlanModel = model("planAndPaymentHistory", planSchema);

export default PlanModel;
