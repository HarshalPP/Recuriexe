const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const sanctionPendencySchema = new Schema(
  {
    customerId: { type: ObjectId, default: null },
    queryDetails: [{
      query: {
        type: String,
      },
      resolve: {
        type: String,
      },
    }],
    sanctionDate: {
      type: String,
    },
    partnerLoanNo: {
      type: String,
    },
    loanAgreementDate:{
      type: String,
    },
    partnerCustomerId:{
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const sanctionPendencyModel = mongoose.model(
  "sanctionPendency",
  sanctionPendencySchema
);
module.exports = sanctionPendencyModel;
