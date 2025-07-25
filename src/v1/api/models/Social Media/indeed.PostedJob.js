import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    // Basic Job Information
    title: { 
      type: String, 
      required: true,
      trim: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    companyName: { 
      type: String, 
      required: true 
    },
    
    // Location Information
    location: {
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, default: "US" },
      zipCode: { type: String },
      remote: { type: Boolean, default: false },
      address: { type: String }
    },

    // Job Details
    jobType: {
      type: String,
      enum: ["FULL_TIME", "PART_TIME", "CONTRACT", "TEMPORARY", "INTERNSHIP"],
      default: "FULL_TIME"
    },
    category: {
      type: String,
      enum: ["UGC", "promotion", "news", "update", "job_posting"],
      default: "job_posting"
    },
    
    // Salary Information
    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: "USD" },
      period: { 
        type: String, 
        enum: ["HOUR", "DAY", "WEEK", "MONTH", "YEAR"], 
        default: "YEAR" 
      },
      negotiable: { type: Boolean, default: false }
    },

    // Job Requirements
    requirements: [String],
    qualifications: [String],
    responsibilities: [String],
    benefits: [String],
    skills: [String],
    
    // Experience Level
    experienceLevel: {
      type: String,
      enum: ["entry", "mid", "senior", "executive"],
      default: "mid"
    },
    yearsOfExperience: {
      min: { type: Number, default: 0 },
      max: { type: Number }
    },

    // Education Requirements
    education: {
      level: {
        type: String,
        enum: ["high_school", "associate", "bachelor", "master", "phd", "none"],
        default: "none"
      },
      required: { type: Boolean, default: false },
      preferred: { type: String }
    },

    // Application Information
    applicationMethod: {
      type: String,
      enum: ["email", "website", "phone", "indeed"],
      default: "indeed"
    },
    applyUrl: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    
    // Job Status
    status: {
      type: String,
      enum: ["draft", "active", "paused", "expired", "filled", "closed"],
      default: "draft"
    },
    
    // Dates
    datePosted: { type: Date, default: Date.now },
    dateExpires: { type: Date },
    lastModified: { type: Date, default: Date.now },
    
    // Indeed Integration Fields
    indeedIntegration: {
      employerJobId: { type: String, unique: true, sparse: true },
      sourcedPostingId: { type: String },
      jobPostingId: { type: String },
      sourceName: { type: String, default: "your-ats-name" },
      isPostedToIndeed: { type: Boolean, default: false },
      indeedStatus: {
        type: String,
        enum: ["not_posted", "posted", "expired", "failed"],
        default: "not_posted"
      },
      datePostedToIndeed: { type: Date },
      dateExpiredOnIndeed: { type: Date },
      lastSyncedWithIndeed: { type: Date },
      indeedErrors: [String]
    },

    // Multi-platform posting support (from your existing PostedContent schema)
    platforms: {
      type: [String],
      enum: ["indeed", "linkedin", "glassdoor", "monster", "ziprecruiter"],
      default: ["indeed"]
    },
    
    // Platform-specific IDs
    platformIds: {
      indeed: {
        employerJobId: { type: String },
        sourcedPostingId: { type: String },
        jobPostingId: { type: String }
      },
      linkedin: {
        jobId: { type: String },
        postingId: { type: String }
      },
      glassdoor: {
        jobId: { type: String }
      }
    },

    // Media and attachments
    attachments: [
      {
        filename: { type: String },
        path: { type: String },
        mimetype: { type: String },
        size: { type: Number },
        type: { 
          type: String, 
          enum: ["job_description", "company_logo", "benefit_image", "other"],
          default: "other"
        }
      }
    ],

    // SEO and Marketing
    seoKeywords: [String],
    tags: [String],
    featured: { type: Boolean, default: false },
    urgent: { type: Boolean, default: false },
    
    // Analytics
    analytics: {
      views: { type: Number, default: 0 },
      applications: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      impressions: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 }
    },

    // User and Organization (from your existing schema)
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true
    },
    
    // Department and Team
    department: { type: String },
    team: { type: String },
    reportingTo: { type: String },
    
    // Additional Job Details
    workSchedule: {
      type: String,
      enum: ["standard", "flexible", "shift", "rotating", "on_call"],
      default: "standard"
    },
    travelRequired: {
      type: String,
      enum: ["none", "minimal", "occasional", "frequent", "extensive"],
      default: "none"
    },
    securityClearance: {
      required: { type: Boolean, default: false },
      level: { type: String }
    },
    
    // Diversity and Inclusion
    diversityInitiative: { type: Boolean, default: false },
    equalOpportunity: { type: Boolean, default: true },
    
    // Internal Notes (not visible to candidates)
    internalNotes: { type: String },
    recruiterNotes: { type: String },
    
    // Approval Workflow
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "revision_needed"],
      default: "pending"
    },
    approvedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
    approvedAt: { type: Date },
    
    // Version Control
    version: { type: Number, default: 1 },
    previousVersions: [{
      version: { type: Number },
      data: { type: mongoose.Schema.Types.Mixed },
      modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      modifiedAt: { type: Date, default: Date.now }
    }]
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes for better performance
jobSchema.index({ userId: 1, organizationId: 1 });
jobSchema.index({ "indeedIntegration.employerJobId": 1 });
jobSchema.index({ "indeedIntegration.sourcedPostingId": 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ datePosted: -1 });
jobSchema.index({ "location.city": 1, "location.state": 1 });
jobSchema.index({ title: "text", description: "text", companyName: "text" });

// Virtual for full location string
jobSchema.virtual('fullLocation').get(function() {
  if (this.location.remote) {
    return 'Remote';
  }
  return `${this.location.city}, ${this.location.state}`;
});

// Pre-save middleware to generate employerJobId if not provided
jobSchema.pre('save', function(next) {
  if (!this.indeedIntegration.employerJobId) {
    this.indeedIntegration.employerJobId = `${this.organizationId}-${this._id}`;
  }
  
  // Update lastModified
  this.lastModified = new Date();
  
  // Generate expiration date if not provided (default 30 days)
  if (!this.dateExpires) {
    this.dateExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  
  next();
});

// Method to check if job is expired
jobSchema.methods.isExpired = function() {
  return this.dateExpires && this.dateExpires < new Date();
};

// Method to format job for Indeed API
jobSchema.methods.formatForIndeed = function() {
  return {
    employerJobId: this.indeedIntegration.employerJobId,
    sourceName: this.indeedIntegration.sourceName,
    title: this.title,
    description: this.description,
    company: {
      name: this.companyName
    },
    location: {
      city: this.location.city,
      state: this.location.state,
      country: this.location.country
    },
    datePublished: this.datePosted.toISOString(),
    validThrough: this.dateExpires.toISOString(),
    jobType: this.jobType,
    ...(this.salary.min && this.salary.max && {
      salary: {
        min: this.salary.min,
        max: this.salary.max,
        currency: this.salary.currency,
        period: this.salary.period
      }
    }),
    ...(this.benefits.length > 0 && { benefits: this.benefits }),
    ...(this.qualifications.length > 0 && { qualifications: this.qualifications }),
    ...(this.requirements.length > 0 && { requirements: this.requirements }),
    ...(this.responsibilities.length > 0 && { responsibilities: this.responsibilities }),
    ...(this.applyUrl && {
      howToApply: {
        applyUrl: this.applyUrl
      }
    })
  };
};

// Method to update Indeed sync status
jobSchema.methods.updateIndeedStatus = function(status, data = {}) {
  this.indeedIntegration.indeedStatus = status;
  this.indeedIntegration.lastSyncedWithIndeed = new Date();
  
  if (data.sourcedPostingId) {
    this.indeedIntegration.sourcedPostingId = data.sourcedPostingId;
  }
  
  if (data.jobPostingId) {
    this.indeedIntegration.jobPostingId = data.jobPostingId;
  }
  
  if (status === 'posted' && !this.indeedIntegration.datePostedToIndeed) {
    this.indeedIntegration.datePostedToIndeed = new Date();
    this.indeedIntegration.isPostedToIndeed = true;
  }
  
  if (status === 'expired') {
    this.indeedIntegration.dateExpiredOnIndeed = new Date();
  }
  
  return this.save();
};

// Static method to find jobs that need sync with Indeed
jobSchema.statics.findJobsNeedingSync = function() {
  return this.find({
    'indeedIntegration.isPostedToIndeed': true,
    'indeedIntegration.indeedStatus': { $ne: 'expired' },
    $or: [
      { 'indeedIntegration.lastSyncedWithIndeed': { $exists: false } },
      { 'indeedIntegration.lastSyncedWithIndeed': { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
    ]
  });
};

export default mongoose.model("Job", jobSchema);