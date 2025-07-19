const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const rcuSchema = new Schema(
  {
    employeeId: { type: ObjectId, default: null },
    LD: { type: String, default: "" },
    customerName: { type: String, default: "" },
    applicantResidentialAddress: { type: String, default: "" },
    appContactNo: { type: Number, default: null },
    coAppName1: { type: String, default: "" },
    coAppResidentialAddress1: { type: String, default: "" },
    coAppContactNo1: { type: Number, default: null },
    coAppName2: { type: String, default: "" },
    coAppResidentialAddress2: { type: String, default: "" },
    coAppContactNo2: { type: Number, default: null },
    guarantorName: { type: String, default: "" },
    guarantorResidentialAddress: { type: String, default: "" },
    guarantorContactNo: { type: Number, default: null },
    reportReceivedDate: { type: String, default: null },
    reportStatus: { type: String, default: "" },
  },
  {
    timestamps: true, 
  }
);

const rcuKycModel = mongoose.model('rcuKyc', rcuSchema);

module.exports = rcuKycModel;
