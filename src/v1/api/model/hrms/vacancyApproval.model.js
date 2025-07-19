const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const vacancyApprovalSchema = new Schema({
  branchId: { type: ObjectId, ref: "newbranch", default: null },
  departmentId: { type: ObjectId, ref: "newdepartment", default: null },
  budget: { type: String, required: [true, "Budget Is Required"] },
  approverId: { type: ObjectId, ref: "employee", default: null }, //employe id
  createdById: { type: ObjectId, ref: "employee", default: null }, //employe id
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
},{
  timestamps:true
});



const vacancyApprovalModel = mongoose.model("vacancyApproval", vacancyApprovalSchema);

module.exports = vacancyApprovalModel;
