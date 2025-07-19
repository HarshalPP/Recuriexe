const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const vendorSchema = new Schema(
  {
    customerId: { type: ObjectId, default: null },
    externalVendorId: { type: ObjectId, default: null },
    partnerNameId: { type: String,default :null },
    branchNameId: { type: String, default : null },
    vendors: [{
      vendorType: { type: String, required: true },
      vendorId: { type: ObjectId, ref: "vendor", default: null },
      assignDocuments: { type: [String], default: null },
      uploadProperty: { type: [String], default: null },
      resson: { type: String },
      statusByVendor: { type: String },
      sendMail: { type: Boolean, default: false },
      processStatus: {
        type: String,
        enum: ["pending", "WIP", "complete"],
        default: "pending",
      },
      reason: { type: String, default: "" },
      requirement: { type: [String], default: [] },
      numberOfCattle:{ type: Number},
      cattlesBreed :{ type: String},
      milkLitPerDay :{ type: String},
      areaOfLand:{ type: String},
      areaOfConstruction:{ type: String},
      fairMarketValue:{ type: String},
      // latitude,longitude
    }],
    status: {
      type: String,
      enum: ["incomplete", "approved", "pending", "reject"],
      default: "incomplete",
    },
  },
  {
    timestamps: true,
  }
);

const externalVendorFormModel = mongoose.model("externalVendorDynamic", vendorSchema);

module.exports = externalVendorFormModel;
