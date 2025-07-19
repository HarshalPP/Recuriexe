const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const referenceModel = new Schema({
  employeId: { type: ObjectId },
  customerId: { type: ObjectId },
  reference1: {
    referenceName: { type: String, default:"" },
    relationWithApplicant: { type: String, default:"" },
    address: { type: String, default:"" },
    mobileNo: { type: Number },
  },
  reference2: {
    referenceName: { type: String, default:"" },
    relationWithApplicant: { type: String, default:"" },
    address: { type: String, default:"" },
    mobileNo: { type: Number },
  },
  status: { type: String, enum: ['approved', 'pending', 'reject'], default: 'pending' },
  remarkMessage: { type: String, default:"" },
},
{
  timestamps: true,
}
);

const referenceDetail = mongoose.model("Reference", referenceModel);

module.exports = referenceDetail;
