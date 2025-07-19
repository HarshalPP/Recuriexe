const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const finalDropdownModelSchema = new Schema({
    // titleType: { type: String,  default:"" },
    title:     { type: String,  default:"" },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
      },
}, {
    timestamps: true
});

const finalDropdownModel = mongoose.model("titleMaster", finalDropdownModelSchema);

module.exports = finalDropdownModel;

