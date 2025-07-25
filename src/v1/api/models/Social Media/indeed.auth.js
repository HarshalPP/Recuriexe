import mongoose from "mongoose";
import crypto from "crypto";

const indeedCredentialsSchema = new mongoose.Schema(
  {

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true
    },

    // Indeed Authentication
    accessToken: {
      type: String,
      required: true,
      // Encrypt sensitive data
      set: function(value) {
        return encrypt(value);
      },
      get: function(value) {
        return decrypt(value);
      }
    },
    refreshToken: {
      type: String,
      required: true,
      set: function(value) {
        return encrypt(value);
      },
      get: function(value) {
        return decrypt(value);
      }
    },
    
    // Token expiration
    tokenExpiresAt: {
      type: Date,
      required: true
    },
    
    // Employer Information
    employerId: {
      type: String,
      required: true
    },
    employerName: {
      type: String,
      required: true
    },
    
    // Account Status
    isActive: {
      type: Boolean,
      default: true
    },
    isConnected: {
      type: Boolean,
      default: true
    },
    
    // Integration Settings
    settings: {
      autoPost: {
        type: Boolean,
        default: false
      },
      autoSync: {
        type: Boolean,
        default: true
      },
      syncInterval: {
        type: Number,
        default: 24 // hours
      },
      defaultSourceName: {
        type: String,
        default: "your-ats-name"
      },
      defaultJobType: {
        type: String,
        enum: ["FULL_TIME", "PART_TIME", "CONTRACT", "TEMPORARY", "INTERNSHIP"],
        default: "FULL_TIME"
      },
      defaultValidityPeriod: {
        type: Number,
        default: 30 // days
      }
    },
    
    // Sync Status
    lastSyncAt: {
      type: Date
    },
    nextSyncAt: {
      type: Date
    },
    syncStatus: {
      type: String,
      enum: ["idle", "syncing", "error", "success"],
      default: "idle"
    },
    
    // Statistics
    stats: {
      totalJobsPosted: {
        type: Number,
        default: 0
      },
      totalJobsUpdated: {
        type: Number,
        default: 0
      },
      totalJobsExpired: {
        type: Number,
        default: 0
      },
      totalSyncErrors: {
        type: Number,
        default: 0
      },
      lastJobPostedAt: {
        type: Date
      }
    },
    
    // Error Tracking
    errors: [{
      timestamp: {
        type: Date,
        default: Date.now
      },
      type: {
        type: String,
        enum: ["auth", "api", "sync", "validation", "network"],
        required: true
      },
      message: {
        type: String,
        required: true
      },
      details: {
        type: mongoose.Schema.Types.Mixed
      },
      resolved: {
        type: Boolean,
        default: false
      }
    }],
    
    // Rate Limiting
    rateLimiting: {
      dailyPostLimit: {
        type: Number,
        default: 100
      },
      currentDailyPosts: {
        type: Number,
        default: 0
      },
      lastResetDate: {
        type: Date,
        default: Date.now
      },
      isRateLimited: {
        type: Boolean,
        default: false
      }
    },
    
    // Webhook Configuration
    webhooks: {
      enabled: {
        type: Boolean,
        default: false
      },
      endpoints: [{
        url: String,
        events: [String],
        secret: String,
        active: {
          type: Boolean,
          default: true
        }
      }]
    },
    
    // Compliance and Terms
    termsAccepted: {
      type: Boolean,
      default: false
    },
    termsAcceptedAt: {
      type: Date
    },
    termsVersion: {
      type: String
    },
    
    // Metadata
    connectionSource: {
      type: String,
      enum: ["web", "api", "mobile"],
      default: "web"
    },
    userAgent: {
      type: String
    },
    ipAddress: {
      type: String
    }
  },
  {
    timestamps: true,
    versionKey: false,
    // Enable getters for encrypted fields
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);

// Indexes
indeedCredentialsSchema.index({ userId: 1, organizationId: 1 });
indeedCredentialsSchema.index({ employerId: 1 });
indeedCredentialsSchema.index({ isActive: 1, isConnected: 1 });
indeedCredentialsSchema.index({ tokenExpiresAt: 1 });
indeedCredentialsSchema.index({ nextSyncAt: 1 });

// Encryption functions (you should use environment variables for these keys)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here';
const ALGORITHM = 'aes-256-cbc';

function encrypt(text) {
  if (!text) return text;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
  if (!text || !text.includes(':')) return text;
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Virtual for checking if token is expired
indeedCredentialsSchema.virtual('isTokenExpired').get(function() {
  return this.tokenExpiresAt && this.tokenExpiresAt < new Date();
});

// Method to check if token needs refresh (refresh 1 hour before expiry)
indeedCredentialsSchema.methods.needsTokenRefresh = function() {
  if (!this.tokenExpiresAt) return true;
  const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
  return this.tokenExpiresAt < oneHourFromNow;
};

// Method to update token information
indeedCredentialsSchema.methods.updateTokens = function(tokenData) {
  this.accessToken = tokenData.access_token;
  if (tokenData.refresh_token) {
    this.refreshToken = tokenData.refresh_token;
  }
  
  // Calculate expiration (default 1 hour if not provided)
  const expiresIn = tokenData.expires_in || 3600;
  this.tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
  
  this.isConnected = true;
  this.syncStatus = "success";
  
  return this.save();
};


// Method to update job posting stats
indeedCredentialsSchema.methods.updateJobStats = function(action) {
  switch (action) {
    case 'posted':
      this.stats.totalJobsPosted++;
      this.stats.lastJobPostedAt = new Date();
      break;
    case 'updated':
      this.stats.totalJobsUpdated++;
      break;
    case 'expired':
      this.stats.totalJobsExpired++;
      break;
  }
  
  return this.save();
};

// Method to check rate limiting
indeedCredentialsSchema.methods.checkRateLimit = function() {
  const today = new Date();
  const lastReset = this.rateLimiting.lastResetDate;
  
  // Reset daily count if it's a new day
  if (!lastReset || today.toDateString() !== lastReset.toDateString()) {
    this.rateLimiting.currentDailyPosts = 0;
    this.rateLimiting.lastResetDate = today;
    this.rateLimiting.isRateLimited = false;
  }
  
  // Check if rate limited
  if (this.rateLimiting.currentDailyPosts >= this.rateLimiting.dailyPostLimit) {
    this.rateLimiting.isRateLimited = true;
    return false;
  }
  
  return true;
};

// Method to increment post count
indeedCredentialsSchema.methods.incrementPostCount = function() {
  this.rateLimiting.currentDailyPosts++;
  
  if (this.rateLimiting.currentDailyPosts >= this.rateLimiting.dailyPostLimit) {
    this.rateLimiting.isRateLimited = true;
  }
  
  return this.save();
};

// Method to disconnect Indeed integration
indeedCredentialsSchema.methods.disconnect = function() {
  this.isActive = false;
  this.isConnected = false;
  this.syncStatus = "idle";
  
  return this.save();
};

// Static method to find credentials that need token refresh
indeedCredentialsSchema.statics.findCredentialsNeedingRefresh = function() {
  const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
  return this.find({
    isActive: true,
    isConnected: true,
    tokenExpiresAt: { $lt: oneHourFromNow }
  });
};

// Static method to find credentials that need sync
indeedCredentialsSchema.statics.findCredentialsNeedingSync = function() {
  return this.find({
    isActive: true,
    isConnected: true,
    'settings.autoSync': true,
    $or: [
      { nextSyncAt: { $exists: false } },
      { nextSyncAt: { $lt: new Date() } }
    ]
  });
};

// Pre-save middleware to calculate next sync time
indeedCredentialsSchema.pre('save', function(next) {
  if (this.settings.autoSync && this.isConnected) {
    const syncIntervalMs = this.settings.syncInterval * 60 * 60 * 1000; // Convert hours to milliseconds
    this.nextSyncAt = new Date(Date.now() + syncIntervalMs);
  }
  next();
});

export default mongoose.model("IndeedCredentials", indeedCredentialsSchema);