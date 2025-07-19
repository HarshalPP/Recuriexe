const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;


const documentQuerySchema = new Schema({
    customerId: { type: ObjectId, default: null },
    employeeId: { type: ObjectId, default: null },
    Reject: { type: String, enum: ["pending", "completed", "rejected"], default: "pending" },
    SendtoPatner: { type: String, enum: ["pending", "completed", "rejected"], default: "pending" },
    finalSanction: { type: String, enum: ["pending", "completed", "rejected"], default: "pending" },
    IncomeSanction: { type: String, enum: ["pending", "completed", "rejected"], default: "pending" },
    preDisbusment: { type: String, enum: ["pending", "completed", "rejected"], default: "pending" },
    postDisbusment: { type: String, enum: ["pending", "completed", "rejected"], default: "pending" },
    isActive: { type: Boolean, default: true },
  },

  {
    timestamps: true,
  }

);


const documentQueryModel = mongoose.model(
    "Dission",
    documentQuerySchema
);

module.exports = documentQueryModel;