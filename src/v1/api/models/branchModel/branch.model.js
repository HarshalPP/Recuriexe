import mongoose from "mongoose";

const { Schema, model } = mongoose;
const { ObjectId } = Schema;

const branchModelSchema = new Schema(
  {
    companyId: { type: ObjectId },
    organizationId: { type: ObjectId, ref: "Organization"  , default: null },
    name: { type: String, required: [true, "Branch is required"] },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },
    type: { type: String, default: "" },
    // regional: { type: Boolean, default: false },
    regionalBranchId: { type: ObjectId, ref: "newbranch", default: null },
    createdBy: { type: ObjectId, ref: "employee" },
    updatedBy: { type: ObjectId, ref: "employee", default: null },
    // punchInTime: { type: String, default: "" },
    // punchOutTime: { type: String, default: "" },
    branchType : {type :ObjectId, ref: "subDropDown", default: null},
    branchMaping : [{type :ObjectId, ref: "newbranch", default: null}],
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], required: false },
    },
    isActive: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ["aproove", "pending", "reject"],
      default: "pending",
    },
    budget: {
      type: Number,
      default: 0
    },
    vendorList: [{
      type: ObjectId,
      ref: "vendor"
    }],
    PaymentGateway: {
      type: String,
      default: ""
    },
    loginFees: { type: Number },
    guarantorRequired: { type: Boolean },
  },
  { timestamps: true }
);

branchModelSchema.index({ location: "2dsphere" });

const BranchModel = model("newbranch", branchModelSchema);

export default BranchModel;
