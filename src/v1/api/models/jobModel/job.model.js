import mongoose, { Schema, model } from "mongoose";

const jobSchema = new Schema(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    partnerId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    isAccepted:{
      type : Boolean,
      default : false
    },
    allocationId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      // required: true,
    },
    reportType: {
      type: String,
      enum: ["separated", "merged"],
      required: true,
    },
    stageId: {
      type: Number,
      default: 2,
    },
    invoiceGenerated:{
      type : Boolean,
      default :false
    },
    jobStatus: {
      type: String,
      enum: ["postive", "negetive", ],
    },
    finalReport: {
      type: String,
    },
  },
  { timestamps: true }
);

const Job = model("Job", jobSchema);
export default Job;
