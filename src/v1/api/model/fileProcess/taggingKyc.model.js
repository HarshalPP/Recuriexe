const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const taggingKycSchema = new Schema(
  {
    employeeId: { type: ObjectId, default: null },
    LD: { type: String, default: "" },
    customerName: { type: String, default: "" },
    fatherName: { type: String, default: "" },
    addressOfApplicant: { type: String, default: "" },
    contactNumber: { type: String, default: "" },
    date: { type: String, default: "" },
    place: { type: String, default: "" },
    taggingDetail: [
      {
        tagNo: { type: String, default: "" },
        animalNo: { type: String, default: "" },
        breedNo: { type: String, default: "" },
        genderNo: { type: String, default: "" },
        colourNo: { type: String, default: "" },
        ageNo: { type: Number, default: 0 },
        milkInLiterPerDay: { type: Number, default: 0 },
      }
    ]
  },
  {
    timestamps: true, 
  }
);

const taggingKycModel = mongoose.model("taggingKyc" , taggingKycSchema);

module.exports = taggingKycModel;
