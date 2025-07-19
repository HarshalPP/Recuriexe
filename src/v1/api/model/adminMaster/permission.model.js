const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const accessRightModelSchema = new Schema(
  {
    assignedBy: { type: ObjectId, default: null },
    employeeId: { type: ObjectId, default: null },
    visitRight: {   
                   visitApproval : { type: Boolean,  default:false},
                   branchIDs : [{ type: ObjectId, default: null }]},
    emiRight:   {   
                    emiApproval : { type: Boolean,  default:false},
                    branchIDs : [{ type: ObjectId, default: null }]},
    status:            { type: String, enum: ["active", "inactive"], default: "active" },
  },
  {
    timestamps: true,
  }
);

const accessRightModel = mongoose.model("accessRight", accessRightModelSchema);

module.exports = accessRightModel;
