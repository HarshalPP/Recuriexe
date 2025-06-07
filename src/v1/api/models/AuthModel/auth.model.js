import mongoose from "mongoose";
const Schema = mongoose.Schema;
import crypto from "crypto";
import  bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { type } from "os";


const candidateSchema = new Schema(
  {

    userName: {
      type: String,
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
          /^\w+([\.+-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
          "Please enter a valid email address",
        ],
      },
      

    password: {
      type: String,
    },

    // LinkedIn setUp //
    linkedinId: {
      type: String,
    },
    
    linkedinAccessToken: {
      type: String,
      select: false // Don't return token by default
    },
    linkedinRefreshToken: {
      type: String,
      select: false // Don't return token by default
    },

      linkedinTokenExpiry: {
    type: Date,
    select: false // Don't return token expiry by default
     },


     // Google Login //
     googleId:{
     type:String
     },

    mobileNumber: {
      type: String,
    },

    coverPhoto : {
      type :String
    },
    profilePicture: {
      type: String,
      default: null,
    },

    status:{
        type:String,
        default:false
    },

    resume: {
      type: String, // Resume file URL or path
    },

    summary:{
        type:String
    },


    aboutUs:{
        type:String
    },

    resumeDetails: {
      originalFileName: String,
      uploadedAt: Date,
      parsedKeywords: [String],
    },


    Basic_Info:{
      Name:String,
      email:String,
      gender: String,
      dob: Date,
      fatherName:String,
      MotherName:String,
      maritalStatus:String,
      EmergencyNumber:String,
      EmergencyContact:String,
      RelationwihContact:String,
      Nationality:String,
     identityMark:String,
     height:String,
     caste:String,
     landmark:String,
     category:String,
     religion:String,
     bloodGroup:String,
     homeDistrict:String,
     homeState:String,
     nearestRailwaySt:String,
     Reference:String,
     socialAccounts: [String],
     ResumeAddress:{
      type: String,
      default: null,
     },
      CurrentAddress:{
      address1: String,
      address2: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
      },
      PermentAddress:{
      address1: String,
      address2: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
      },

    },

    Family_Info:{
    fatherName:String,
    motherName:String,
    fathersOccupation:String,
    fathersMobileNo:String,
    mothersMobileNo:String,
    familyIncome:String,
    familymember:String,
    },


    professional_Experience: [
      {
        title: String,
        employementType:String,
        currentEmployer: String,
        organization:String,
        startDate: { type: Date, default: null },
        endDate: { type: Date, default: null },
        country: String,
        state: String,
        city: String,
        location:String,
        totalExpirnece:String,
        description: String,
        NoticePeriod:String,
        isFresher: { type: Boolean, default: false },
        isCurrentJob: { type: Boolean, default: false },


      },
    ],


    // KYC details //


    KYC_Details:{
      pancardNo:String,
      aadharcardNo:String,
      passportNo:String,
      uanNumber:String,
      VoterId:String,
      
        Aadhaar_front:{
        type:String,

      },

      Aadhar_Back:{
        type:String
      },


      pancard:{
        type:String
      },

      voterId:{
        type:String
      },

    },



    education: [
      {
        educationType: String,
        university: String,
        Institute:String,
        currentlyStudent:{
          type:String,
          default:"false"
        },
        startDate: { type: Date, default: null },
        endDate: { type: Date, default: null },
        numberOfYears: String,
        finalScore: String,
        country: String,
        state: String,
        city: String,
        yearOfPassing: String,
        description:String,
        masterdegree:String,
        graduationdegress:String,
        certificate:String
        
      },
    ],


    // personal details //
    Personal_Documents:{

      Aadhaar_front:{
        type:String,
        default:null

      },

      Aadhar_Back:{
        type:String,
        default:null
      },
      


      pancard:{
        type:String,
        default:null
      },

      voterId:{
        type:String,
        default:null
      },

      DrivingLicence:{
        type:String,
        default:null
      },

     passportsizephoto:{
      type:String,
      default:null
     },

     Address_proof:[{
      
      ElectricityBill:{
        type:String,
        default:null
      },

      RentAgreement:{
        type:String,
        default:null
      },
      BGV_Documents:{
        type:String,
        default:null
      }
     }],

    salarysleep:[
      {
      type:String,
      default:null
      }
     ],

     appointmentletter:{
      type:String,
      default:null
     },

     Relievingletter:{
      type:String,
      default:null
     },

     experinceletter:{
      type:String,
      default:null
     },

     Incrementletter:{
      type:String,
      default:null
     },

     Others:[{
      type:String,
      default:null
     }]

    },

// bank details
    Bank_verification:{

      account_number:{
        type:String
      },

      ifsc:{
        type:String
      },


      bank_name:{
        type:String
      },

      name:{
        type:String
      },

      city:{
        type:String
      },

      branch:{
        type:String
      },

      uan:{
        type:String
      },

      EsicNumber:{
        type:String
      },
      converUnderpf:{
        type:String,
        default:"false"
      },
      BankStatment:{type:String}
    },

    // Nominee //
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
        dob:{type:String},
        Aadhar_card:{type:String}
      },
    ],


    // Others Document //
   OtherDocument:[{
    name:String,
    filed:String
   }],
    
    jobAlerts: {
      type: [String], // Example: ["Frontend Developer", "UI Designer"]
      default: []
    },


// Skil and Language Information //
    SkillInfo: {
     skills: [String],
    languagesKnown: [String]
    },

    // Other Information //

    OtherInformation: {
  EmergencyNumber: { type: String, default: null },
  EmergencyContact: { type: String, default: null },
  RelationwihContact: { type: String, default: null },
  gender: { type: String, default: null },
  maritalStatus: { type: String, default: null },
  Nationality: { type: String, default: null },
  identityMark: { type: String, default: null },
  category: { type: String, default: null },
  religion: { type: String, default: null },
  bloodGroup: { type: String, default: null },
  aboutUs: { type: String, default: null }
},



    expectedSalary: {
      type: String,
    },

    currentCTC: {
      type: String,
    },

    // Auth / Access
    role: {
      type: String,
      enum: ["User", "Admin"],
      default: "User",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerifiedDate:{
      type:Date,
      default:null
    },

    isProfileCompleted: {
      type: Boolean,
      default: false,
    },

    Reasonforleaving:{
      type:String
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    otp: {
      code: String,
      expiresAt: Date,
    },

    tempPassword: {
      type: Boolean,
      default: false,
    },

    socialAuth: {
      googleId: String,
      linkedinId: String,
      githubId: String,
    },

    lastLogin: {
      type: Date,
    },

    
    activeToken: {
      type: String,
      required: false,
    },

        // Date when the password was last changed
        passwordChangedAt: {
          type: Date,
          select: false, // Password change date won't be included in query results by default
        },
        // Token for resetting the password
        passwordResetToken: {
          type: String,
        },
        // Expiry date/time for the password reset token
        passwordResetExpires: {
          type: Date,
        },

        profileCompletionPercentage: {
          type: Number,
          default: 0,
        },

        Resume_Analizer:{
          type:String
        },

       others: [
          {
           key: { type: String, required: false },        // Name of the field
           value: { type: Schema.Types.Mixed },          // Value can be string, number, date, etc.
          }
       ]



  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);






// Middleware to hash the password before saving
candidateSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});



candidateSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Method to generate and set reset password token
candidateSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Set reset token and expiry time
  this.passwordResetToken = resetToken;
  this.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 10 minutes

  return resetToken;
};


// Method to generate and sign JWT token for user authentication
candidateSchema.methods.getSignedToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
  };


  // Check if LinkedIn token is expired
candidateSchema.methods.isLinkedInTokenExpired = function() {
  if (!this.linkedinTokenExpiry) return true;
  return Date.now() > this.linkedinTokenExpiry;
};



// Method to get safe user data (without sensitive fields)
candidateSchema.methods.getSafeData = function() {
  const userData = this.toObject();
  delete userData.password;
  delete userData.linkedinAccessToken;
  delete userData.linkedinRefreshToken;
  delete userData.linkedinTokenExpiry;
  return userData;
};


export default mongoose.model("User", candidateSchema);
