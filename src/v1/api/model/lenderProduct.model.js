const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const lenderProductSchema = new Schema(
  {
    name: { type: String, default: "" },
    lenderId:   { type: ObjectId, default: null },
  },
  {
    timestamps: true,
  }
);

const lenderProductModel = mongoose.model("lenderProduct", lenderProductSchema);

module.exports = lenderProductModel;

