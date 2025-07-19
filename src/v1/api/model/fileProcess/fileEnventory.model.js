const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const fileEnventorySchema = new Schema(
  {
    employeeId: { type: ObjectId, default: null },
    customerId: { type: ObjectId, default: null, ref: "customerdetail" },

      customerName: { type: String, default: "" },
      fatherName: { type: String, default: "" },
      loanNumber: { type: String, default: "" },
      sanction:{
        allPhysicalSanctionDocument: { type: [String], default: "" },
        sanctionRemarks: { type: String, default: "" },
      },
      disbursement:{
        allPhysicalDisbursementDocument: { type: [String], default: 0 },
        disbursementRemarks: { type: String, default: 0 },
      },
      fileNo: { type: String, default: 0 },

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

const fileEnventoryModel = mongoose.model("fileEnventory", fileEnventorySchema);
module.exports = fileEnventoryModel;
