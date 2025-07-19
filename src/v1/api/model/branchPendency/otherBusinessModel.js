const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const otherBuisnessSchema = new Schema({
    employeeId:              [{ type: ObjectId , default :null }],
    customerId:              { type: ObjectId , default :null },
    approvalEmployeeId:       { type: ObjectId , default :null },

    otherBusinessDocument:     {type:[String]},
    LD:                      { type: String , default :"" },

   incomeType4:           { type: String , default :"" },
   doingFromNoOfYears:                { type: String , default :"" },
    natureOfBuisness:              { type: String , default :"" },
    nameOfBuisness:             { type: String , default :"" },
    monthlyIncomeEarned:       { type: String , default :"" },
    monthlyexpences:         { type: String , default :"" },
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

const otherBuisnessModel = mongoose.model('otherBuisness', otherBuisnessSchema);

module.exports = otherBuisnessModel;