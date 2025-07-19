const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const workLocationSchema = new Schema({
  companyId: { type: ObjectId ,required: [true, "companyId is required"]},
  branchId: { type: ObjectId ,required: [true, "branchId is required"]},
  title: { type: String,required: [true, "Title is required"]},
  address: { type: String, default: "" },
  area: { type: String, default: "" },
  city: { type: String, default: "" },
  State: { type: String, default: "" },
  country: { type: String, default: "" },
  pincode: { type: String, default: "" },
  // location: {
  //   type: { type: String , default: "Point" },
  //   coordinates: { type: [Number], required: true }
  // },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
}, {
  timestamps: true
});

// workLocationSchema.index({ location: "2dsphere" });

const workLocationModel = mongoose.model("workLocation", workLocationSchema);

module.exports = workLocationModel;
