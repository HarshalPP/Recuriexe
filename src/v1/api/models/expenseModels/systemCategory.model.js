import {mongoose, Schema, model } from 'mongoose';

const systemCategorySchema = new Schema({
  systemCategoryId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Organization'
    },
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  description: {
    type: String,
    default: ""
  },
  logicConfig: {
    autoCreate: { type: Boolean },
    maxAmount: { type: Number}, // used in most cards
    requiresApproval: { type: Boolean},
    autoApproveLimit: { type: Number },
    allowRecurring: { type: Boolean},

    // UI Specific Fields
    defaultFrequency: { type: String },                        // Monthly, Weekly, etc.
    requireVendorSelection: { type: Boolean },              // Recurring
    requireAutoApproval: { type: Boolean },                 // Recurring
    requireReceipt: { type: Boolean },                      // Common
    requireManagerApproval: { type: Boolean },              // Expense Claim
    interestRate: { type: Number },                         // Advance Payment
    adjustmentPeriod: { type: Number },                     // Advance Payment
    autoDeductFromSalary: { type: Boolean },                // Advance Payment
    requireGuarantor: { type: Boolean },                    // Advance Payment

    mileageRate: { type: Number },                          // Expense Claim
    claimPeriodDays: { type: Number },                      // Expense Claim

    requireBankDetails: { type: Boolean },                  // Reimbursement
    reimbursementMethod: { type: String },                  // Reimbursement

    replenishmentThreshold: { type: Number },               // Imprest Fund
    replenishmentFrequency: { type: String },               // Petty Cash
    Custodian: { type: String },                            //  Petty


    maxDays: { type: Number },                              // Travel Advance
    accommodationLimit: { type: Number },                   // Travel Advance
    perDiemRate: { type: Number },                          // Travel Advance
    transportLimit: { type: Number },                       // Travel Advance
    requireHotelItinerary: { type: Boolean },               // Travel Advance

    fundLimit: { type: Number },                        // imprest+
    fundCustodian: { type: String },                        // Imprest, Travel, Petty
    accountingCode: { type: String },                       // Imprest, Expense, Travel

    durationInDays: { type: Number },                       // Project Expense
    projectCodeReq: { type: Boolean },               // Travel Advance
    linkBudget: { type: Boolean },               // Travel Advance

    // Advanced/Optional
    mandatoryFields: [{ type: String }],                    // Custom required fields
    additionalRules: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  isSeeded: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  schemaVersion: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const systemCategoryModel = model("systemCategory", systemCategorySchema);
export default systemCategoryModel;
