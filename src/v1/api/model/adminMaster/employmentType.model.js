const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const employmentTypeModelSchema = new Schema({
  title: { type: String,required: [true, "Title is required"]},
  punchOutsideBranch: { type: String,enum: ["allowed", "notAllowed"],required: [true, "Punch Outside Branch is required"]},
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },
}, {
  timestamps: true
});


const employmentTypeModel = mongoose.model("employmentType", employmentTypeModelSchema);

module.exports = employmentTypeModel;
 