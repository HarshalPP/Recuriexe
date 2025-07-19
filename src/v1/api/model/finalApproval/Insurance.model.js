const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MemberSchema = new Schema({
 customerId: { type: String, default: "" },
 employeeId: { type: String, default: "" },
  member: {
    salutation: { type: String, default: "" },
    fullName: { type: String, default: "" },
    ageDob: { type: String, default: ""},
    gender: { type: String, default: "" },
    nationality: { type: String, default: "" },
    statePinCode: { type: String, default: "" },
    relationshipWithMember: { type: String ,  default: "" },
    occupation: { type: String, default: "" },
    shareOfNominee: { type: String, default: "" },
  },
  nominees: [
    {
      salutation: { type: String, default: "" },
      fullName: { type: String, default: "" },
      ageDob: { type: String, default: "" },
      gender: { type: String, default: "" },
      nationality: { type: String, default: "" },
      statePinCode: { type: String, default: "" },
      relationshipWithMember: { type: String, default:"" }, // Relation with main member
      occupation: { type: String, default: "" },
      shareOfNominee: { type: String, default: "" },
    },
  ],
  benefits: {
    amountSumAssured: { type: String, default: "" },
    termOfCoverYears: { type: String, default: "" },
    premiumAmount: { type: String, default: "" },
  },
  isApplicable:{ type: Boolean, default: true },

});

const InsuranceModel = mongoose.model("Insurance", MemberSchema);
module.exports = InsuranceModel;
