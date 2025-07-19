const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const physicalFileCourierModel = new Schema({
  employeeId:         [{ type: ObjectId , default :null }],
  customerId:              { type: ObjectId , default :null },
  approvalEmployeeId:       { type: ObjectId , default :null },
  physicalFileCourierDocument : { type: [String]},
    LD:            { type: String , default :"" },
    // customerName:  { type: String , default :"" },
    branchName:    { type: String , default :"" },
    courierBy:     { type: String , default :"" },
    courierTo:     { type: String , default :"" },
    podNo:         { type: String , default :"" },
    courierDate:   { type: String , default :"" },

    remarkByBranchVendor:  { type: String , default :"" },
    remarkByApproval:        { type: String , default :"" },
    approvalDate :           { type: String , default :"" },
    completeDate:        { type: String , default :"" },
    status :             { type: String, enum: ["incomplete","complete","reject", "approve", "pending"], default: "pending" },
    fileStatus :  {type: String, enum:["active", "inactive"], default: "active"},

},
{
    timestamps: true,
  }
);

const physicalFileCourierDetail = mongoose.model('branchphysicalFileCourier', physicalFileCourierModel);

module.exports = physicalFileCourierDetail;
