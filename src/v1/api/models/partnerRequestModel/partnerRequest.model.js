import mongoose, { Schema } from "mongoose";

// Define the schema
const requestSchema = new mongoose.Schema(
  {
    senderId: {
        type: Schema.Types.ObjectId,
        ref: "Organization",
        default: null,
    },
    receiverId: {
        type: Schema.Types.ObjectId,
        ref: "Organization",
        default: null,
    },
    allocationId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "employees",
        required: true,
      },
    ],
    productForm: [
      {
        userProductId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "userProducts",
        },
        productName: { type: String },
        initFields: {
          fields: {
            type: [{ type: Schema.Types.ObjectId, ref: "forms" }],
            // default: [],
          },
          isActive: { type: Boolean, default: true },
        },
        allocationFields: {
          fields: {
            type: [{ type: Schema.Types.ObjectId, ref: "forms" }],
            // default: [],
          },
          isActive: { type: Boolean, default: false },
        },
        agentFields: {
          fields: {
            type: [{ type: Schema.Types.ObjectId, ref: "forms" }],
            // default: [],
          },
          isActive: { type: Boolean, default: false },
        },
       submitFields: {
  fields: [
    {
      fieldId: { type: Schema.Types.ObjectId, ref: "forms" },
      supportingDoc: { type: String, default: "" },
    },
  ],
  isActive: { type: Boolean, default: false },
},

       // NEW: Dynamic Submit Stages
        // submitStages: [
        //   {
        //     stageNumber: { type: Number, required: true },
        //     stageName: { type: String }, // Optional name for each stage
        //     isActive: { type: Boolean, default: false },
        //     fields: [
        //       {
        //         fieldId: { type: Schema.Types.ObjectId, ref: "forms" },
        //         supportingDoc: { type: String, default: "" },
        //       },
        //     ],
        //   },
        // ],

        charge: { type: Number },
        // additionalCharge: { type: Number, default: 0 },
        isChecked: {
          type: Boolean,
          default: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      default: "pending",
    },
    sendByClient: {
      type: Boolean,
      default: false,
    },
    schemaVersion: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const partnerRequestModel = mongoose.model("partner_request", requestSchema);

export default partnerRequestModel;
