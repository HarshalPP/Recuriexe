const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const incomeDocumentSchema = new Schema({
  employeeId:              { type: ObjectId , default :null },
  LD:                      { type: String , default :"" },
  customerName:            { type: String , default :"" },
  incomeType1AgriDetailsDoingFromYears:    { type: String, default: "" },
  agriIncomeYearly:                        { type: String, default: "" },
  availableLandInBigha:                    { type: String, default: "" },
  agriLandAddressAsPerPavati:              { type: String, default: "" },
  agriLandSurveyNoAll:                     { type: String, default: "" },
  landOwner:                               { type: String, default: "" },
  cropCultivated:                          { type: String, default: "" },
  incomeType2MilkBusinessDoingFromYears:   { type: String, default: "" },
  noOfCattles:                             { type: String, default: "" },
  noOfMilkGivingCattles:                   { type: String, default: "" },
  averageDailyMilkQuantityInLiters:        { type: String, default: "" },
  milkDistributionNameOfDairy:             { type: String, default: "" },
  addressOfDairy:                          { type: String, default: "" },
  contactDetailsOfDairyOwner:              { type: String, default: "" },
  milkProvidingToAboveDairyNoOfYears:      { type: String, default: "" },
  expensesOfMilkBusiness:                  { type: String, default: "" },
  monthlyIncomeMilkBusiness:               { type: String, default: "" },
  incomeType3SalaryOtherIncomeSource:      { type: String, default: "" },
  companyName:                             { type: String, default: "" },
  addressOfSalaryProvider:                 { type: String, default: "" },
  mobNoOfSalaryProvider:                   { type: String, default: "" },
  doingFromNoYears:                        { type: String, default: "" },
  monthlyIncomeEarnedInAmount:             { type: String, default: "" },
  incomeType4DoingFromNoYears:             { type: String, default: "" },
  natureOfBusiness:                        { type: String, default: "" },
  nameOfBusiness:                          { type: String, default: "" },
  monthlyIncomeEarnedBusiness:             { type: String, default: "" },
  mobileNo :             { type: String, default: "" }
},
{
    timestamps: true,
  }
);

const incomeDocumentModel = mongoose.model('incomeDocumentKyc', incomeDocumentSchema);

module.exports = incomeDocumentModel;
