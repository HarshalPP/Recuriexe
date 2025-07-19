const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const tvrModelSchema = new Schema(
  {
    employeeId: { type: ObjectId, default: null },
    customerId: { type: ObjectId, default: null },
    LD: { type: String, default: "" },

    applicantInformation: {
      applicantName: { type: String, default: "" },
      applicationNumber: { type: String, default: "" },
      dateOfVerification: { type: String, default: "" },
      timeOfCall: { type: String, default: "" },
    },

    contactVerification: {
      primaryContactNumberOfApplicant: { type: String, default: "" },
      alternativeContactNumber: { type: String, default: "" },
    },

    personalAndFamilyInformation: {
      applicantDateOfBirth: { type: String, default: "" },
      numberOfDependentsInHousehold: { type: Number, default: 0 },
      relationshipStatus: { type: String, enum: ["Single", "Married", "Divorced"], default: "Single" },
      areThereAnyOtherFamilyMembersInvolvedInPayingTheEMI: { type: String, enum: ["Yes", "No"], default: "No" },

      familyDetails: {
        name: { type: String, default: "" },
        relation: { type: String, default: "" },
      },
    },

    employmentAndIncomeDetails: {
      agriLand: { type: String, default: "" },
      numberOfCattles: { type: Number, default: 0 },
      dairyNameWhereMilkSupplied: { type: String, default: "" },
      phoneNumberOfDairyOwner: { type: String, default: "" },
      monthlyIncome: { type: Number, default: 0 },
      additionalSourcesOfIncome: [
        {
          source: { type: String, default: "" },
          amount: { type: Number, default: 0 },
        },
      ],
      totalMonthlyIncome: { type: Number, default: 0 },
    },

    
    loanDetails: {
      loanAmountRequested: { type: Number, default: 0 },
      purposeOfLoan: { type: String, default: "" },
      tenureRequestedInMonths: { type: Number, default: 0 },
      confortableEmiAmountForCustomer: { type: Number, default: 0 },
      justificationOnNeedForFundsWithBifurcation: { type: String, default: "" },
    },

    financialSatisfactionDetails: {
      kyaAapLoanAmountSeSantustHai: { type: String, enum: ["Yes", "No"], default: "No" },
      KyaAapROISeSantustHai: { type: String, enum: ["Yes", "No"], default: "No" },
      KyaAapTenureSeSantustHai: { type: String, enum: ["Yes", "No"], default: "No" },
      KyaAapMonthlyEMISeSantustHai: { type: String, enum: ["Yes", "No"], default: "No" },
      fasalkharabHogiTabkaiseEMIBharenge: { type: String, enum: ["Yes", "No"], default: "No" },
      panchTarikhKiEMIDateHaiAapkoChaarTareekSeBalanceMaintainKarnaPdegaKrPaenge: { type: String, enum: ["Yes", "No"], default: "No" },
      coOwnershipAlterKarniHogiKarwaPaenge: { type: String, enum: ["Yes", "No"], default: "No" },
      branchJakarLDSignKarniHogiKrPaenge: { type: String, enum: ["Yes", "No"], default: "No" },
      aapkoRMPaymentJamaKarnaPadegakrPaenge: { type: String, enum: ["Yes", "No"], default: "No" },
    },

    propertyOwnershipDetails: {
      propertyAddress: { type: String, default: "" },
      typeOfProperty: { type: String, default: "" },
      estimatedMarketValueOfProperty: { type: Number, default: 0 },
      isThePropertyOwnedSolelyByTheApplicant: { type: String, enum: ["Yes", "No"], default: "Yes" },

      coOwnerDetails: {
        name: { type: String, default: "" },
        relationship: { type: String, default: "" },
      },
    },

    verificationOfDetails: {
      confirmTheApplicantFullName: { type: String, enum: ["Yes", "No"], default: "No" },
      confirmIncomeDetails: { type: String, enum: ["Yes", "No"], default: "No" },
      confirmPropertyOwnership: { type: String, enum: ["Yes", "No"], default: "No" },
      confirmLoanAmountAndPurpose: { type: String, enum: ["Yes", "No"], default: "No" },
    },

    additionalVerificationQuestions: {
      areYouAwareOfTheEMIObligationsForTheLoan: { type: String, enum: ["Yes", "No"], default: "No" },
      doYouHaveAnyAdditionalLoansOrDebtsAtPresent: { type: String, enum: ["Yes", "No"], default: "No" },
      ifYesPleaseSpecifyTypeAndAmount: { type: String, default: "" },
      isYourMonthlyIncomeSufficientToCoverTheEMIs: { type: String, enum: ["Yes", "No"], default: "No" },
      haveYouFacedAnyFinancialDifficultiesInThePastTwelveMonths: { type: String, enum: ["Yes", "No"], default: "No" },
      ifYesPleaseDescribe: { type: String, default: "" },
    },

    communicationAndFeedbackFromApplicant: {
      howDidYouFindOutAboutOurServices: { type: String, default: "" },
      whatMotivatedYouToApplyForOurLoan: { type: String, default: "" },
      areYouSatisfiedWithTheLoanTermsSDiscussedDuringTheApplicationProcess: { type: String, enum: ["Yes", "No"], default: "No" },
      ifNoPleaseExplainYourConcernsOrIssues: { type: String, default: "" },
    },

    remarksFromCreditManager: {
      additionalObservations: { type: String, default: "" },
      recommendationsBasedOnVerification: { type: String, default: "" },
      creditManagerName: { type: String, default: "" },
      dateOfRemark: { type: String, default: "" },

    },

    verificationStatus: {
      verificationCompletedByNameOfCreditManager: { type: String, default: "" },
      overallVerificationStatus: { type: String, enum: ["Approved", "Rejected", "Pending"], default: "Pending" },
      ifRejectedReasonForRejection: { type: String, default: "" },
    },
    audio: { type: String, default: "" }, 
    verificationDate: { type: String, default: "" },
    verificationtime: { type: String, default: "" },
    
    completeDate: { type: String, default: "" },
    status: { type: String, enum: ["incomplete", "complete", "reject", "approve", "pending"], default: "pending" },
  },
  {
    timestamps: true,
  }
);


const tvrtDetail = mongoose.model("tvr", tvrModelSchema);
module.exports = tvrtDetail;
