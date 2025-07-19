const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const titleUsageTrackerSchema = new Schema({
    formTitleId: { type: ObjectId, require: [true, "formTitleId Is Required"] },
    title:       { type: String,  require: [true, "Title Is Required"]},
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
      },
}, {
    timestamps: true
});

const titleUsageTrackerModel = mongoose.model("titleUsageTracker", titleUsageTrackerSchema);

module.exports = titleUsageTrackerModel;

