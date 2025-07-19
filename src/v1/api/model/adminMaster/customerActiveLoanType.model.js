const mongoose = require('mongoose');
const { Schema } = mongoose;

// Loan Schema
const loanSchema = new Schema({
    loanType: {
        type: String,
        required: true
    },
    loanAmount: { type: Number, default: 0 },
    currentOutstanding: { type: Number, default: 0 },
    ownership: {
        type: String,
        required: true,
    },
    monthlyEMI: { type: Number, default: 0 },
    loanStatus: {
        type: String,
        required: true,
    },
    obligated: {
        type: String,
        required: true,
        enum: ["yes", "no"]
    },
    obligationConsidered: { type: Number, default: 0 }
}, 
// { timestamps: true }
);

// Virtual Field for EMI Annual Calculation
loanSchema.virtual('emiAnnual').get(function () {
    return this.monthlyEMI * 12;
});

// Pre-save Hook for Individual Loan
loanSchema.pre('save', function (next) {
    if (this.obligated === "yes") {
        this.obligationConsidered = this.monthlyEMI;
    } else {
        this.obligationConsidered = 0;
    }
    next();
});

// Co-Applicant Schema
const coApplicantSchema = new Schema({
    coApplicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
    loans: [loanSchema] // Each Co-Applicant Can Have Multiple Loans
},
//  { timestamps: true }
);

// Main Active Loan Schema
const activeloanTypeSchema = new Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },

    applicant: [loanSchema], // Applicant's Loans
    coApplicants: [coApplicantSchema], // Array of Co-Applicants with Their Loans
},
 { timestamps: true }
);

// Pre-save Hook to Calculate Total Obligation
activeloanTypeSchema.pre('save', function (next) {
    // Calculate Applicant Obligation
    this.applicant.forEach((loan) => {
        loan.obligationConsidered = loan.obligated === "yes" ? loan.monthlyEMI : 0;
    });

    // Calculate Co-Applicant Obligation
    this.coApplicants.forEach((coApplicant) => {
        coApplicant.loans.forEach((loan) => {
            loan.obligationConsidered = loan.obligated === "yes" ? loan.monthlyEMI : 0;
        });
    });

    next();
});

const activeloanTypeModel = mongoose.model('customeractiveloanType', activeloanTypeSchema);

module.exports = activeloanTypeModel;
