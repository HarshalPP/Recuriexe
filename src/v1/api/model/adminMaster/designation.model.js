const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const designationSchema = new Schema({
  designationName: { type: String },
  companyId:       { type: ObjectId ,required: [true, "companyId is required"] },
  branchId:        { type: ObjectId ,required: [true, "branchId is required"]},
  workLocationId:  { type: ObjectId ,required: [true, "workLocationId is required"]},
  departmentId:    { type: ObjectId ,required: [true, "departmentId is required"]},
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
},{
  timestamps:true
});


const designationModel = mongoose.model("designation", designationSchema);

module.exports = designationModel;
