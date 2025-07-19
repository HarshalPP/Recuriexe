const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const patnersDetailSchema = new Schema(
  {
    patnerCatalog: { type: String, default: "" },
    patnerName: { type: String, default: "" },
    image: { type: String, default: "" },
    url: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },

  { timestamps: true }
);

const patnersDetail = mongoose.model("patnersDetail", patnersDetailSchema);

module.exports = patnersDetail;
