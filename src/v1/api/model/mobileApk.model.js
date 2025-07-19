const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const mobileApkSchema = new Schema({
    version:      { type: String, default: "" },
    apkUrl:         { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },
}, {
  timestamps: true
});

const mobileApkModel = mongoose.model("mobileApk", mobileApkSchema);

module.exports = mobileApkModel;
