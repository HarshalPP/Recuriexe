const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const bodEodModelSchema = new Schema({
    employeeId:    { type: ObjectId,default:null},
    assignBy:      { type: ObjectId,default:null},
    task:          { type: String,default:""},
    description:   { type: String,default:""},
    remark:        { type: String,default:""},
    startDate:     { type: String,default:""},
    endDate:       { type: String,default:""},
    updateBy:      { type: ObjectId,default:null},
    remarkBodByManager: { type: String,default:""},
    managerBodStatus:   { type: String, enum :["pending","accept","reject"], default:"pending" },
    remarkEodByManager: { type: String,default:""},
    managerEodStatus:   { type: String, enum :["pending","accept","incomplete","reject"], default:"pending" },
    status:             { type: String, enum :["pending","processing","completed"], default:"pending" },

},
{
  timestamps: true,
}
);

const bodEodModel = mongoose.model("bodEod", bodEodModelSchema);

module.exports = bodEodModel;
