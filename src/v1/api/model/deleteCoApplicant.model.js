const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const deleteCoApplicantModelSchema = new Schema(
  {
    customerId: { type: ObjectId, ref: "customerdetail", default: null, unique: true },
    coApplicant: [
      {
        coApplicantId: { type: ObjectId, }, 
        coApplicantDetail: { type: Object, }, 
        coApplicantCibilDetail: { type: Object, } 
      }
    ]
  },
  {
    timestamps: true
  }
);

const deleteCoApplicantModel = mongoose.model("deleteCoApplicant", deleteCoApplicantModelSchema);

module.exports = deleteCoApplicantModel;
