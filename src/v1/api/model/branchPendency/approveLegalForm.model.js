const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const legalReportDocuments = new Schema({
  employeeId: { type: ObjectId, default: null },
  customerId: { type: ObjectId, default: null , unique: true},
  LD: { type: String, default: "" },

    // documentDetails:{ type: [String], default: "" },
    documentDetails: { type: Object, default: {} },

  documentType: { type: String, default: "" },
  nameOfApplicant: { type: String, default: "" },
  nameOfCoApplicant: { type: String, default: "" },
  nameOfDocumentHolder: { type: String, default: "" },
  relationWithApplicant: { type: String, default: "" },
  fullAddressOfTheProperty: { type: String, default: "" },
  descriptionOfListOfDocuments: { type: String, default: "" },
  documentDetails: {
    document1: { type: String, default: "" },
    document2: { type: String, default: "" },
    document3: { type: String, default: "" },
    document4: { type: String, default: "" },
    document5: { type: String, default: "" },
    document6: { type: String, default: "" },
    document7: { type: String, default: "" }
  },
  receivedDate: { type: String, default: "" },
  statusOfReport: { type: String, default: "" },
  completeDate: { type: String, default: "" },
  status: { type: String, enum: ["incomplete", "complete", "reject", "approve", "pending"], default: "pending" }
},
  {
    timestamps: true,
  }
);

const legalReportDetails = mongoose.model(
  "approveLegalReport",
  legalReportDocuments
);

module.exports = legalReportDetails;
