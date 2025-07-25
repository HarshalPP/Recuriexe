

import mongoose, { Schema, model } from "mongoose";

const initSchema = new Schema(
  {
     organizationId: { type: mongoose.Types.ObjectId, default: null, ref:"Organization" },
     reportTypeId: {
      type: Schema.Types.ObjectId,
      ref: "reportTypes",
      required: true,

    },
    doneBy: {
      type: Schema.Types.ObjectId,
      ref: "employees",
      required: true,
    },
    sign : String,
    paymentStatus : {
      type : String,
      default : "unpaid"
    },
    workStatus: {
      type: String,
      default: "wip",
    },
    reportUrl : [String],
    reportStatus : {
      type : String,
      default : "pending"
    },
    reportDate : Date,
     formValues: [
        {
            fieldId: {
                type: mongoose.Types.ObjectId,
                ref: "inputFields"
            },
            value: [String]
        }
    ],
  },
  { timestamps: true }
);

const reportCaseModel = model("reportCase", initSchema);
export default reportCaseModel;
