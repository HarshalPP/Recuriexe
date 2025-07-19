const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

// applicant model
const applicantModelSchema = new Schema(
  {
    employeId: { type: ObjectId , default :null},
    formUpdatedEmployeeId: { type: ObjectId , default :null},
    customerId: { type: ObjectId , ref : "customerdetail"},
    aadharNo: { type: String, default: "" },
    isPanApiHit :{type: Boolean,  default:false},
    panNo: { type: String, default: "" },
    ocrAadharFrontImage: { type: String, default: "" },
    ocrAadharBackImage: { type: String, default: "" },
    applicantPhoto: { type: String, default: "" },
    fullName: { type: String, default: "" },
    fatherName: { type: String, default: "" },
    motherPrefix:  { type: String, default: "" },
    motherName: { type: String, default: "" },
    spouseName: { type: String, default: "" },
    gender: { type: String, default: "" },
    mobileNo: { type: Number },
    maritalStatus: { type: String, default: "" },
    email: { type: String, default: "" },
    dob: { type: String, default: "" },
    age: { type: String, default: "" },
    religion: { type: String, default: "" },
    education: { type: String, default: "" },
    caste: { type: String, default: "" },
    category: { type: String, default: "" },  // not key update caste to category but 
    voterIdNo: { type: String, default: "" },
    drivingLicenceNo: { type: String, default: "" },
    permanentAddress: {
      addressLine1: { type: String, default: "" },
      addressLine2: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      district: { type: String, default: "" },
      pinCode: { type: String, default: "" },
    },
    localAddress: {
      addressLine1: { type: String, default: "" },
      addressLine2: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      district: { type: String, default: "" },
      pinCode: { type: String, default: "" },
    },
    kycUpload: {
      aadharFrontImage: { type: String, default: "" },
      aadharBackImage: { type: String, default: "" },
      panFrontImage: { type: String, default: "" },
      drivingLicenceImage: { type: String, default: "" },
      voterIdImage: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["approved", "pending", "reject"],
      default: "pending",
    },
    remarkMessage: { type: String, default: "" },
    fileStatus: { type: String , default:"active"},
    formCompleteDate : {type : String , default : ""},
    
    applicantType: { type: String, default: "" },
    businessType: { type: String, default: "" },
    occupation: { type: String, default: "" },
    houseLandMark: { type: String, default: "" },
    alternateMobileNo: { type: String, default: "" },
    noOfyearsAtCurrentAddress: { type: String, default: "" },
    nationality: { type: String, default: "" },
    noOfDependentWithCustomer: { type: String, default: "" },
    educationalDetails: { type: String, default: "" },
    residenceType: { type: String, default: "" },

    applicantPrefix:  { type: String, default: "" },
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

const applicantDetail = mongoose.model("applicantDetail", applicantModelSchema);

module.exports = applicantDetail;
