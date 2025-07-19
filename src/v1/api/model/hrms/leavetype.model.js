const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const leaveTypeModelSchema = new Schema({
    leaveTypeName: { type: String },
    }, { timestamps: true }
);

const leaveTypeModel = mongoose.model("leaveType", leaveTypeModelSchema);
module.exports = leaveTypeModel;