const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const targetFormModelSchema = new Schema({
    title: { type: String,  default:"" },
    code: { type: String,  default:"" },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
      },
}, {
    timestamps: true
});

const targetFormModel = mongoose.model("targetForm", targetFormModelSchema);

module.exports = targetFormModel;

