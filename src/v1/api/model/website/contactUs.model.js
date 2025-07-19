const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const contactUsSchema = new Schema(
  {
    name: { type: String, default: "" },
    emailId: { type: String, default: "" },
    mobileNo: { type: Number, default: null },
    hearAboutUs: { type: String, default: "" },
    message: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },

  { timestamps: true }
);

const contactUs = mongoose.model("contactUs", contactUsSchema);

module.exports = contactUs;
