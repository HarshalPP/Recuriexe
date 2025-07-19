const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const employeeTypeModelSchema = new Schema({
  title: { type: String,required: [true, "Title is required"]},
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },
}, {
  timestamps: true
});


const employeeTypeModel = mongoose.model("employeeType", employeeTypeModelSchema);

module.exports = employeeTypeModel;
 