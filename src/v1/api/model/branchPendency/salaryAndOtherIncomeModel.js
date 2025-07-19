const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const salaryAndOtherIncomeSchema = new Schema({//milk income
    employeeId:              [{ type: ObjectId , default :null }],
    customerId:              { type: ObjectId , default :null },
    approvalEmployeeId:       { type: ObjectId , default :null },
    otherIncomeDocument:     {type:[String]},
    LD:                      { type: String , default :"" },
    
    incomeType3:            { type: String , default :"" },
    salaryOtherIncomeSource:           { type: String , default :"" },
    companyName:                { type: String , default :"" },
    adressOfSalaryProvider:              { type: String , default :"" },
    mobNoOfSalaryProvider:             { type: String , default :"" },
    doingFromNoYears:       { type: String , default :"" },
    monthlyIncomeEarned:            { type: String , default :"" },
    monthlyExpences:{ type: String , default :"" },
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

const salaryAndOtherIncomeModel = mongoose.model('salaryAndOtherIncome', salaryAndOtherIncomeSchema);

module.exports = salaryAndOtherIncomeModel;