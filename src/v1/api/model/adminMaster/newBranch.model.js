const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const branchModelSchema = new Schema(
  {
    companyId: { type: ObjectId },
    name: { type: String, required: [true, "Branch is required"] },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },
    type: { type: String, default: "" },
    regional: { type: Boolean, default: false },
    regionalBranchId: { type: ObjectId, ref: "newbranch", default: null },
    createdBy: { type: ObjectId, ref: "employee" },
    updatedBy: { type: ObjectId, ref: "employee", default: null  },
    punchInTime: { type: String , default : ""},
    punchOutTime: { type: String , default : ""},
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    isActive: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ["aproove","reject","active", "inactive"],
      default: "active",
    },
    budget:{
      type:Number,
      default:0
    },
    vendorList:[{
      type:ObjectId,
      ref:"vendor"
    }],

    PaymentGateway:{
      type:String,
      default:"cashfree"
    },

    loginFees:{ type:Number },
    guarantorRequired:{ type:Boolean },
  },

  { timestamps: true }
);

branchModelSchema.index({ location: "2dsphere" });

const branchModel = mongoose.model("newbranch", branchModelSchema);

module.exports = branchModel;
