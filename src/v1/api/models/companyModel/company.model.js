import mongoose from 'mongoose';

const { Schema } = mongoose;

const companyModelSchema = new Schema({

  organizationId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Organization',
    default:null
  },

  companyName: {
    type: String,
    required: [true, "Company Name is required"],
  },

  companyLogo: {
    type: String,
    default: '',
  },
  timezone: {
    type: String,
    default: 'IST',
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
 gstin: {
        type: String,
    },
    pan: String,
    email: {
        type: String,
    },
    phone: String,
    websiteUrl: String,
    country: String,
    defaultCurrency: String,
    domain: String,
    address: String,
    taxId: String,
  workWeekStart: {
    type: Number,
    default: 1, // Monday
    min: 0,
    max: 6,
  },

  defaultShiftDuration: {
    type: Number,
    default: 480, // 8 hours in minutes
  },

  maxConsecutiveWorkDays: {
    type: Number,
    default: 6,
  },

  minBreakBetweenShifts: {
    type: Number,
    default: 720, // 12 hours in minutes
  },

  enableNotifications: {
    type: Boolean,
    default: false,
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'employee',
  },
  reportingCommunication :{
     communicationTo : String,
    communicationCC : [String]
   },
   invoiceCommunication : {
     communicationTo : String,
    communicationCC : [String],
   },
   physicalReportCommunication:{
     communicationTo : String,
    communicationCC : [String],
   },
    enach : {
        type : String,
        default : "physical",
        // enum : ["physical","esign","upload"]
    },
    sign :{
        type : String
    },
     abbreviation: String,
    companyType: String,
    dateOfIncorporation: String,
    cinNumber: String,
    registeredAddress: String,
    corporateAddress: String,
    invoiceCycle:String,
     invoiceRaise:String,
     invoiceStartDate : Date,
     invoiceEndDate : Date,
}, {
  timestamps: true,
});

const CompanyModel = mongoose.model("company", companyModelSchema);

export default CompanyModel;
