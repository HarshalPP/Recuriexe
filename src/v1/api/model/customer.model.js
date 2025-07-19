const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const customerSchema = new Schema({
  employeId:          { type: ObjectId, ref: "employee" ,  default:null },
  productId:          { type: ObjectId, default:null , ref :"product" },
  customerFinId:      { type: String, default: "" },
  loginFees:          {type:Number, default:0},
  orderId:            { type: String, default: "" },
  mobileNo:           { type: Number, required: [true, "Mobile Number Is Required"] },
  executiveName:      { type: String,default: "" },
  branch:             { type: ObjectId, ref:"newbranch" , default:null  },
  nearestBranchId:    { type: ObjectId, ref: "newbranch", default: null },
  loanTypeId :        { type: ObjectId, ref: "loanType", default: null },
  incomeCatagoryId :  { type: [ObjectId], ref: "incomeCatagory", default: null },
  propertyTypeId :    { type: ObjectId, ref: "propertyType", default: null },
  loanAmount:         { type: Number, required: [true, "Number is Required"] },
  roi:                { type: Number, required: [true, "ROI is Required"] },
  tenure:             { type: Number, required: [true, "Tenure is Required"] },
  emi:                { type: Number, default: 0 },
  paymentImage:       {type:String, default:"" },
  transactionId :     {type:String, default:""},
  paymentStatus :     { type:String , default:""},
  // paymentType:        { type: String, enum: ["cash", "online"], default:"online" },
  // cashPersonId:       { type: String, default: null },
  paymentDate:        { type: Date, default: null },
  status:             { type: String ,enum: ["active", "inactive"] , default:"active"},
  PaymentGateway:     { type: String, default: "" },
  deleteFile:         { type: Boolean, default: false },
  //add new filed
  fullName:           { type: String, default: "" },
  leadId:             { type: ObjectId,  default:null  },
  location: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  pdPaymentStatus: { type: String, default: "" },
  pdOrderId: { type: String, default: "" },
  pdPaymentGateway: { type: String, default: "" },
  pdPaymentDate: { type: Date, default: null },
  pdTransactionId : { type: String, default: "" },
},
{
  timestamps: true,
}
);

const customerModel = mongoose.model("customerdetail", customerSchema);

module.exports = customerModel;
