const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const scrollingTextModelSchema = new Schema(
  {
    employeeId:        { type: ObjectId, default: null },
    title:             { type: String,   default:""},
    status:            { type: String, enum: ["active", "inactive"], default: "active" },
  },
  {
    timestamps: true,
  }
);

const scrollingTextModel = mongoose.model("scrollingText", scrollingTextModelSchema);

module.exports = scrollingTextModel;
