const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const directJoiningModelSchema = new Schema(
  {
    name: { type: String, default: "" },
    gender: { type: String, default: "" },
    maritalStatus: { type: String, default: "" },
    mobileNumber: { type: Number, default: null },
    emailId: { type: String, default: "" },
    identityMark: { type: String, default: "" },
    dateOfBirth: { type: Date },
    currentAddress: { type: String, default: "" },
    currentAddressCity: { type: String, default: "" },
    currentAddressState: { type: String, default: "" },
    currentAddressPincode: { type: Number, default: null },
    permanentAddress: { type: String, default: "" },
    permanentAddressCity: { type: String, default: "" },
    permanentAddressState: { type: String, default: "" },
    permanentAddressPincode: { type: Number, default: null },
    permanentAddressLocation: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number] },
    },
    fatherName: { type: String, default: "" },
    motherName: { type: String, default: "" },
    fathersOccupation: { type: String, default: "" },
    fathersMobileNo: { type: Number, default: null },
    mothersMobileNo: { type: Number, default: null },
    familyDetails: [
      {
        name: { type: String, default: "" },
        relation: { type: String, default: "" },
        dateOfBirth: { type: Date },
        dependent: { type: String, default: "" },
        whetherEmployeed: { type: String, default: "" },
        mobileNo: { type: Number, default: null },
        occupation: { type: String, default: "" },
        department: { type: String, default: "" },
        companyName: { type: String, default: "" },
        _id: false, // Disable automatic _id creation
      },
    ],

    nameAsPerBank: { type: String, default: "" },
    bankName: { type: String, default: "" },
    bankAccount: { type: Number, default: null },
    ifscCode: { type: String, default: "" },
    uanNo: { type: Number, default: null },
    esicNumber: { type: Number, default: null },
    height: { type: Number, default: null },
    caste: { type: String, default: "" },
    category: { type: String, default: "" },
    religion: { type: String, default: "" },
    bloodGroup: { type: String, default: "" },
    homeDistrict: { type: String, default: "" },
    homeState: { type: String, default: "" },
    nearestRailwaySt: { type: String, default: "" },
    university: { type: String, default: "" },
    educationDetails: [
      {
        education: { type: String, default: "" },
        nameOfBoard: { type: String, default: "" },
        marksObtained: { type: String, default: "" },
        passingYear: { type: String, default: "" },
        stream: { type: String, default: "" },
        grade: { type: String, default: "" },
        _id: false, // Disable automatic _id creation
      },
    ],
    // currentDesignation: { type: String, default: "" },
    // lastOrganization: { type: String, default: "" },
    // startDate: { type: Date },
    // endDate: { type: Date },
    // totalExperience: { type: Number, default: null },
    // currentCTC: { type: Number, default: null },
    employeementHistory: [
      {
        currentDesignation: { type: String, default: "" },
        lastOrganization: { type: String, default: "" },
        startDate: { type: Date, default: "" },
        endDate: { type: Date, default: "" },
        totalExperience: { type: Number, default: null },
        currentCTC: { type: Number, default: null },
        _id: false, // Disable automatic _id creation
      },
    ],
    nominee: [
     {
        nomineeName: { type: String, default: null },
        relationWithEmployee: { type: String, default: null },
        nominationType: { type: String, default: null },
        nominationAge: { type: String, default: null },
        nomineeAddress: { type: String, default: null },
        nomineeState: { type: String, default: null },
        nomineeDistrict: { type: String, default: null },
        nomineeblock: { type: String, default: null },
        nomineePanchayat: { type: String, default: null },
        nomineePincode: { type: Number, default: null },
        nomineePhoneNumber: { type: Number, default: null }, 
     }
    ],

    familyIncome: { type: Number, default: null },
    employeePhoto: { type: String, default: null },
    resume: { type: String, default: "" },
    bankDetails: { type: String, default: "" },
    aadhar: { type: String, default: "" },
    panCard: { type: String, default: "" },
    educationCertification: { type: String, default: "" },
    experienceLetter: { type: String, default: "" },
    employmentProof: { type: String, default: "" },
    bankAccountProof: { type: String, default: "" },
    aadhaarNo: { type: Number, default: null },
    panNo: { type: String, default: "" },
    // salary: { type: Number, default: null },
    // joiningDate: { type: Date, default: null },
    updatedDate : {type:String , default :""},
    onboardingStatus: {
      type: String,
      enum: ["onboarded", "notOnboarded"],
      default: "notOnboarded",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const directJoiningModel = mongoose.model("directJoining", directJoiningModelSchema);

module.exports = directJoiningModel;
