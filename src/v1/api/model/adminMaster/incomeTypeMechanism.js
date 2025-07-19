const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const incomeTypeModelSchema = new Schema({
  // adminId: { type: ObjectId },
  workType: { type: String, required: [true, "WorkType is required"]},
  incomeType: { type: [String] },
},
{ timestamps: true }
);


const incomeTypeModel = mongoose.model("workType", incomeTypeModelSchema);

module.exports = incomeTypeModel;
 