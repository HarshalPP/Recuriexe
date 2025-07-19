
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const customerLmsSchema = new Schema(
  {
    branchId:     { type: ObjectId, default: null },
    salesId:      { type: ObjectId, default: null },
    pdDoneById:   { type: ObjectId, default: null},
    customerId:   { type: ObjectId, default: null},
    LD:           { type: String, default: "" },
    loanNo:       { type: String, default: "" },
    customerDetail:{
    applicantId:  {type: ObjectId, default: null},
    customerPhoto:{ type: String, default: "" },
    customerName: { type: String, default: "" },
    fatherName:   { type: String, default: "" },
    mobile:       { type: Number, default: null },
    email:        { type: String, default: "" },
    village:      { type: String, default: "" },
    address:      { type: String, default: "" },
    state:        { type: String, default: "" },
    gender:       { type: String, default: "" },
    dob:          { type: String, default: "" },
    age:          { type: String, default: "" },
    // customerKycUpload: {
      aadharFrontImage: { type: String, default: "" },
      aadharBackImage: { type: String, default: "" },
      panFrontImage: { type: String, default: "" },
      drivingLicenceImage: { type: String, default: "" },
      voterIdImage: { type: String, default: "" },
    // },
    cibilScore:   { type: Number, default: null },
  },

    coApplicant: [
      {
        coAppId:  { type: ObjectId, default :null  },
        name:     { type: String, default: "" },
        mobile:   { type: Number, default: null },
        email:    { type: String, default: "" },
        address:  { type: String, default: "" },
        state:    { type: String, default: "" },
        gender:   { type: String, default: "" },
        dob:      { type: String, default: "" },
        age:      { type: String, default: "" },
        // kycUpload: {
          aadharFrontImage: { type: String, default: "" },
          aadharBackImage: { type: String, default: "" },
          panFrontImage: { type: String, default: "" },
          drivingLicenceImage: { type: String, default: "" },
          voterIdImage: { type: String, default: "" },
        // },
        cibilScore: { type: Number, default: null },
      },
    ],
   gurantorDetail :{
    gtrName:       { type: String, default: "" },
    gtrFatherName: { type: String, default: "" },
    gtrMobNo:      { type: Number, default: null },
    gtrAddress:    { type: String, default: "" },
    gtrState:      { type: String, default: "" },
    gtrGender:     { type: String, default: "" },
    gtrDob:        { type: String, default: "" },
    gtrAge:        { type: String, default: "" },
    gtrCibilScore: { type: Number, default: null },
    // gtrKycUpload: {
      aadharFrontImage:{ type: String, default: "" },
      aadharBackImage: { type: String, default: "" },
      docImage:   { type: String, default: "" },
    // },
  },
   gtrBankDetail:{
    gtrBankName:          { type: String, default: "" },
    gtrBankBranch:        { type: String, default: "" },
    gtrAcHolderName:      { type: String, default: "" },
    gtrAcNumber:          { type: String, default: "" },
    gtrIfscCode:          { type: String, default: "" },
    gtrAcType:            { type: String, default: "" },
  },

  loanDetail:{
  productId:   { type: ObjectId, default: null },
  caseType:    { type: String, default: "" },
  partnerId: { type: String, default: "" },
  loanAmount:  { type: Number, default: null },
  tenure:      { type: Number, default: null },
  roi:         { type: Number, default: null }, // Rate of Interest
  emi:         { type: Number, default: null },
  pfCharges:   { type: Number, default: null }, // Processing Fee Charges
  documentCharges:   { type: Number, default: null },
  cersaiCharges:     { type: Number, default: null },
  insuranceCharges:  { type: Number, default: null },
  actualPreEmi:      { type: Number, default: null },
  netDisbursementAmount: { type: Number, default: null },
  sanctionDate:      { type: String, default: "" }, // Use Date type if needed
  disbursementDate:  { type: String, default: "" },
  disbursementMonth: { type: String, default: "" },
},

    incomeDetail :{
    monthlyIncome:     { type: Number,default:0 },
    monthlyObligations:{ type: Number ,default:0},
    foir:              { type: String,default:"" }, 
    customerProfile:   { type: String ,default:""},
    customerSegment:   { type: String ,default:""},
  },

    repaymentDetail:{
    repaymentBankName: { type: String, default :"" },  
    bankBranch:    { type: String, default :""  },
    accountHolder: { type: String, default :""  },
    accountNumber: { type: String, default :""  },
    ifscCode:      { type: String, default :""  },
    accountType:   { type: String, default :""  },
    nachDoneBy:    { type: String, default :""  },
    nachTokenId:   { type: String, default :""  },
  },

    propertDetail:{
    propertyPaperType: { type: String, default :"" },
    propertyType:      { type: String, default :"" },
    marketValue:       { type: Number, default : 0},
    ltv:               { type: String, default : ''},
    lat:               { type: Number, default : 0}, 
    long:              { type: Number, default : 0},
  },
  emiDetail :{
    emiCycle:       { type: String,default:"" },
    firstEmiDate:   { type: String ,default:""},
    firstEmiMonth:  { type: String,default:"" }, 
  },

    status: { type: String, enum: ["pending","active", "inactive"], default: "active" },
  },
  {
    timestamps: true,
  }
);

const customerLmsModel = mongoose.model("disbursedcustomer", customerLmsSchema);

module.exports = customerLmsModel;



