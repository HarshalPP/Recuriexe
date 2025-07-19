const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const coApplicantModel = new Schema({
  employeId: { type: ObjectId , default :null },
  formUpdatedEmployeeId: { type: ObjectId , default :null},
  customerId: { type: ObjectId , default :null},
  aadharNo: { type: String, default:"" },
  // panNo: { type: String, default:"" },
  docType : {type :String, enum: ["panCard", "drivingLicence", "voterId"] , required : true},
  docNo : {type :String, default:""},
  coApplicantPhoto: { type: String, default:""},
  ocrAadharFrontImage: { type: String, default:"" },
  ocrAadharBackImage:  { type: String, default:"" },
  fullName: { type: String, default: "" },
  fatherName: { type: String, default:"" },
  motherPrefix:  { type: String, default: "" },
  motherName: { type: String, default:"" },
  spouseName: { type: String, default:"" },
  maritalStatus: { type: String, default:"" },
  relationWithApplicant: { type: String, default:"" },
  email: { type: String, default:"" },
  dob: { type: String, default:"" },
  religion: { type: String, default:"" },
  caste: { type: String, default:"" },
  category: { type: String, default: "" },// key update caste to category
  education: { type: String, default:"" },
  age: { type: String, default:"" },
  gender:{type :String, default:""},
  mobileNo: { type: Number },
  permanentAddress: {
    addressLine1: { type: String, default:"" },
    addressLine2: { type: String, default:"" },
    city: { type: String, default:"" },
    state: { type: String, default:"" },
    district: { type: String, default:"" },
    pinCode: { type: String, default:"" },
  },
  localAddress: {
    addressLine1: { type: String, default:"" },
    addressLine2: { type: String, default:"" },
    city: { type: String, default:"" },
    state: { type: String, default:"" },
    district: { type: String, default:"" },
    pinCode: { type: String, default:"" },
  },
  kycUpload:{
    aadharFrontImage: { type: String, default:""},
    aadharBackImage:  { type: String, default:""},
    docImage:    { type: String, default:""},
  },
  status: {
    type: String,
    enum: ["approved", "pending", "reject"],
    default: "pending",
  },
  remarkMessage: { type: String, default:"" },
  fileStatus: { type: String , default:"active"},
  formCompleteDate: { type: String , default:""},

    coApplicantType: { type: String, default: "" },
    businessType: { type: String, default: "" },
    occupation: { type: String, default: "" },
    houseLandMark: { type: String, default: "" },
    alternateMobileNo: { type: String, default: "" },
    noOfyearsAtCurrentAddress: { type: String, default: "" },
    nationality: { type: String, default: "" },
    educationalDetails: { type: String, default: "" },
    residenceType: { type: String, default: "" },

    coApplicantPrefix: { type: String, default: "" },
    firstName: { type: String, default: "" },
    middleName: { type: String, default: "" },
    lastName: { type: String, default: "" },

    fatherPrefix:  { type: String, default: "" },
    fatherFirstName: { type: String, default: "" },
    fatherMiddleName: { type: String, default: "" },
    fatherlastName: { type: String, default: "" },
  
},
{
  timestamps: true,
}
);

const coApplicantDetail = mongoose.model("coApplicantDetail", coApplicantModel);

module.exports = coApplicantDetail;
