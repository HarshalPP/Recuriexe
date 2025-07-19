const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const crypto =require("crypto");
const  bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")


const candidateSchema = new Schema(
  {

    name: {
      type: String,
    },

    email: {
      type: String,
    },

    password: {
      type: String,
    },

    mobileNumber: {
      type: String,
    },

    profilePicture: {
      type: String,
      default: null,
    },

    resume: {
      type: String, // Resume file URL or path
    },

    resumeDetails: {
      originalFileName: String,
      uploadedAt: Date,
      parsedKeywords: [String],
    },

    profile_Info: {
      gender: String,
      dob: Date,
      address1: String,
      address2: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
      socialAccounts: [String],
    },

    professional_Experience: [
      {
        title: String,
        currentEmployer: String,
        startDate: { type: Date, default: null },
        endDate: { type: Date, default: null },
        country: String,
        state: String,
        city: String,
        description: String,
      },
    ],

    education: [
      {
        educationType: String,
        degree: String,
        university: String,
        startDate: { type: Date, default: null },
        endDate: { type: Date, default: null },
        numberOfYears: String,
        finalScore: String,
        country: String,
        state: String,
        city: String,
        yearOfPassing: String,
      },
    ],
    jobAlerts: {
      type: [String], // Example: ["Frontend Developer", "UI Designer"]
      default: []
    },

    skills: [String],

    languagesKnown: [String],

    jobPreferences: {
      preferredLocations: [String],
      jobType: {
        type: String,
        enum: ["Full-Time", "Part-Time", "Remote", "Internship"],
      },
      noticePeriodInDays: Number,
    },

    expectedSalary: {
      type: Number,
    },

    currentCTC: {
      type: Number,
    },

    // Auth / Access
    role: {
      type: String,
      enum: ["Candidate", "Recruiter", "Admin"],
      default: "Candidate",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isProfileCompleted: {
      type: Boolean,
      default: false,
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



module.exports = mongoose.model("NewCandidate", candidateSchema);
