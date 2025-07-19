const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const jainamEntryDetailsSchema = new Schema(
  {
    employeeId: { type: ObjectId, default: null },
    customerId: { type: ObjectId, default: null, ref: "customerdetail" },
    customerName: { type: String, default: "" },
    partnerName: { type: String, default: "" },
    branchName: { type: String, default: "" },
    applicantJainamProfileNo: { type: String, default: "" },
    coApplicantName: { type: String, default: "" },
    coApplicantJainamProfileNo: { type: String, default: "" },
    coApplicantTwoName: { type: String, default: "" },
    coApplicantTwoJainamProfileNo: { type: String, default: "" },
    guarantorName: { type: String, default: "" },
    guarantorJainamProfileNo: { type: String, default: "" },
    jainamLoanNumber: { type: String, default: "" },
    caseDisbursedInjainam: { type: String, default: "" },
    remarkMessage: { type: String, default: "" },
    completeDate: { type: String, default: "" },
    formStatus: {
      type: String,
      enum: ["incomplete", "complete", "reject", "approve", "pending"],
      default: "pending",
    },
    status: { type: String, enum: ["inActive", "active"], default: "active" },
  },

  {
    timestamps: true,
  }
);

const jainamEntryDetailsModel = mongoose.model(
  "jainamEntryDetails",
  jainamEntryDetailsSchema
);
module.exports = jainamEntryDetailsModel;
