const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const employeSchema = new Schema(
  {
    employeUniqueId: { type: String, default: "" },
    employeName: { type: String },
    userName: { type: String },
    email: { type: String , default: "" },
    workEmail: { type: String, default: "" },
    mobileNo: { type: Number, default: null },
    emergencyNumber: { type: Number, default: null },
    password: { type: String, required: [true, "Password is required"] },
    identityMark: { type: String, default: "" },
    height: { type: Number, default: null },
    caste: { type: String, default: "" },
    category: { type: String, default: "" },
    religion: { type: String, default: "" },
    bloodGroup: { type: String, default: "" },
    homeDistrict: { type: String, default: "" },
    homeState: { type: String, default: "" },
    nearestRailwaySt: { type: String, default: "" },
    joiningDate: { type: Date },
    dateOfBirth: { type: Date },
    fatherName: { type: String, default: "" },
    motherName: { type: String, default: "" },
    fathersOccupation: { type: String, default: "" },
    fathersMobileNo: { type: Number, default: null },
    mothersMobileNo: { type: Number, default: null },
    familyIncome: { type: Number, default: null },
    gender: { type: String, default: "" },
    salutation: { type: String, default: "" },
    maritalStatus: { type: String, default: "" },
    package: { type: String, default: "" },
    nameAsPerBank: { type: String, default: "" },
    bankName: { type: String, default: "" },
    bankAccount: { type: Number, default: null },
    ifscCode: { type: String, default: "" },
    highestQualification: { type: String, default: "" },
    //
    // employeementHistory: [
    //   {
    //     totalExperience: { type: Number, default: null },
    //     address: { type: String, default: "" },
    //     startDate: { type: Date, default: "" },
    //     endDate: { type: Date, default: "" },
    //     currentDesignation: { type: String, default: "" },
    //     lastOrganization: { type: String, default: "" },
    //     currentCTC: { type: String, default: "" },
    //     grossSalary: { type: String, default: "" },
    //     _id: false, // Disable automatic _id creation
    //   },
    // ],
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
    lastOrganization: { type: String, default: "" },
    currentDesignation: { type: String, default: "" },
    startDate: { type: Date, default: "" },
    endDate: { type: Date, default: "" },
    totalExperience: { type: Number, default: null },
    currentCTC: { type: String, default: "" },
    //
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
    employeePhoto: { type: String, default: null },
    resume: { type: String, default: "" },
    bankDetails: { type: String, default: "" },
    aadhaarNo: { type: Number, default: null },
    panNo: { type: String, default: "" },
    aadhar: { type: String, default: "" },
    panCard: { type: String, default: "" },
    educationCertification: { type: String, default: "" },
    experienceLetter: { type: String, default: "" },
    employmentProof: { type: String, default: "" },
    bankAccountProof: { type: String, default: "" },
    offerLetter: { type: String, default: "" },
    relievingLetterFincooper: { type: String, default: "" },
    experienceLetterFincooper: { type: String, default: "" },
    currentAddress: { type: String, default: "" },
    currentAddressCity: { type: String, default: "" },
    currentAddressState: { type: String, default: "" },
    currentAddressPincode: { type: Number, default: null },
    permanentAddress: { type: String, default: "" },
    permanentAddressCity: { type: String, default: "" },
    permanentAddressState: { type: String, default: "" },
    permanentAddressPincode: { type: String, default: null },
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
    description: { type: String, default: "" },
    branchId: { type: ObjectId, ref: "newbranch", default: null },
    // companyId: { type: ObjectId, ref: "company", default: null },
    company: { type: String},
    //  roleId: { type: ObjectId, ref: "role", default: null },
    roleId: [{ type: ObjectId, ref: 'role' }],
    reportingManagerId: { type: ObjectId, ref: "employee", default: null }, //employe id
    departmentId: { type: ObjectId, ref: "newdepartment", default: null },
    subDepartmentId: { type: ObjectId, ref: "newdepartment", default: null },
    secondaryDepartmentId: { type: ObjectId, ref: "newdepartment", default: null },
    seconSubDepartmentId: { type: ObjectId, ref: "newdepartment", default: null },
    designationId: { type: ObjectId, ref: "newdesignation", default: null },
    workLocationId: { type: ObjectId, ref: "newworklocation", default: null },
    constCenterId: { type: ObjectId, ref: "costCenter", default: null },
    employementTypeId: { type: ObjectId, ref: "employmentType", default: null },
    employeeTypeId: { type: ObjectId, ref: "employeeType", default: null },
    referedById: { type: String, ref: "employee", default: null }, //employe id for reference
    // referedById: { type: ObjectId, ref: "employees", default: null }, //employe unique id
    uanNumber: { type: Number, default: null },
    esicNumber: { type: String, default: '' },
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    locationRoamId : { type: ObjectId, default: null },
    updatedFrom: {
      type: String,
      enum: ["sheet", "finexe"],
    },
    websiteListing: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    onboardingStatus: {
      type: String,
      enum: ["joining", "onboarded","enrolled"],
    },
    activeInactiveReason: [
      {
        actionTakenBy: { type: ObjectId, ref: "employee" },
        date: { type: Date , default: "" },
        reason: { type: String, default: "" }, 
        _id: false, // Disable automatic _id creation
      },
    ],
    employeeTarget:[
      {
        title: { type: String,  default: "" },
        value: { type: String, default: "" },
      },
    ],
   

    letter:{
      type: String,
      default: "",
    },

    appoinmentLetter:{
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    shouldTrack:{
      type:Boolean,
      default:true
    },
    trackingInterval:{
      type:Number,
      default:1
    },

      passwordChangedAt:{
        type: Date,
      }
    
  },
  
  {
    timestamps: true,
  }
);

employeSchema.index({ location: "2dsphere" });

const employeModel = mongoose.model("employee", employeSchema);

employeSchema.pre('save', function(next) {
  if (!this.isModified('password')) return next();

  this.passwordChangedAt = new Date(); // or Date.now()
  next();
});


module.exports = employeModel;