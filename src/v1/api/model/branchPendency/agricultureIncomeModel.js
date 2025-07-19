const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const ageicultureSchema = new Schema({
    employeeId:              [{ type: ObjectId , default :null }],
    
    customerId:              { type: ObjectId , default :null },
    approvalEmployeeId:       { type: ObjectId , default :null },
    agricultureDocument:     {type:[String] , default : []},
    LD:                      { type: String , default :"" },
    incomeType:                { type: String ,  default:"" },
    agriDoingFromOfYears:            { type: String , default :"" },
    agriIncome:           { type: String , default :"" },//monthly
    availableLandInAcre:                { type: String , default :"" },
    agriLandAddressAsPerPavati:              { type: String , default :"" },
    agriLandSurveyNo:             { type: String , default :"" },
    LandOwnerName:       { type: String , default :"" },
    relationWithApplicant:         { type: String , default :"" },
    cropCultivated:         { type: String , default :"" },
    monthlyExpence:         { type: String , default :"" },
    NoOfAgricultureOwner: { type: String , default :"" },
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

const agricultureModel = mongoose.model('agricultureIncome', ageicultureSchema);

module.exports = agricultureModel;