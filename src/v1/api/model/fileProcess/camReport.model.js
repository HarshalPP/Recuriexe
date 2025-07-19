const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const camReportModelSchema = new Schema(
  {

      employeeId:  { type: ObjectId , default :null },
      customerId:  { type: ObjectId , default :null },
      LD:          { type: String , default :"" },

    applicationInformation: {
      name: { type: String, default: "" },
      occupation: { type: String, default: "" },
      dob: { type: String, default: "" },
      age: { type: String, default: "" },
      gender: { type: String, default: "" },
      caste: { type: String, default: "" },
      religion: { type: String, default: "" },
      maritalStatus: { type: String, default: "" },
      telephoneNo: { type: String, default: "" },
      cibilCrifScore: { type: String, default: "" },
      monthlyIncome:{ type: String, default: ""},
      otherMonthlyIncome:{ type: String, default: ""},
      sourceOfOtherIncome:{ type: String, default: ""},
      annualIncome:{ type: String, default: ""},
      totalHouseHoldExpenses:{ type: String, default: ""},
      bankDetail: {
        bankAccountNo: { type: String, default: "" },
        accountType: { type: String, default: "" },
        nameOfBank: { type: String, default: "" },
        averageBankBalance: { type: String, default: "" },
        remark: { type: String, default: "" },
      },
    },

    coApplicationInformation: [
      {
        coAppType :{type:String,default:""},
        name: { type: String, default: "" },
        occupation: { type: String, default: "" },
        dob: { type: String, default: "" },
        age: { type: String, default: "" },
        gender: { type: String, default: "" },
        caste: { type: String, default: "" },
        religion: { type: String, default: "" },
        maritalStatus: { type: String, default: "" },
        telephoneNo: { type: String, default: null },
        relationWithCustomer: { type: String, default: "" },
        cibilCrifScore: { type: String, default: null },
        monthlyIncome:{ type: String, default: ""},
        otherMonthlyIncome:{ type: String, default: ""},
        sourceOfOtherIncome:{ type: String, default: ""},
        annualIncome:{ type: String, default: ""},
        totalHouseHoldExpenses:{ type: String, default: ""},

        bankDetail: {
          bankAccountNo: { type: String, default: "" },
          accountType: { type: String, default: "" },
          nameOfBank: { type: String, default: "" },
          averageBankBalance: { type: String, default: "" },
          remark: { type: String, default: "" },
        },
      },
    ],
    guarantorInformation: [
      {
        guarantorType :{type:String,default:""},
        name: { type: String, default: "" },
        occupation: { type: String, default: "" },
        dob: { type: String, default: "" },
        age: { type: String, default: "" },
        gender: { type: String, default: "" },
        caste: { type: String, default: "" },
        religion: { type: String, default: "" },
        maritalStatus: { type: String, default: "" },
        telephoneNo: { type: String, default: null },
        relationWithCustomer: { type: String, default: "" },
        cibilCrifScore: { type: String, default: null },
        monthlyIncome:{ type: String, default: ""},
        otherMonthlyIncome:{ type: String, default: ""},
        sourceOfOtherIncome:{ type: String, default: ""},
        annualIncome:{ type: String, default: ""},
        totalHouseHoldExpenses:{ type: String, default: ""},

        bankDetail: {
          bankAccountNo: { type: String, default: "" },
          accountType: { type: String, default: "" },
          nameOfBank: { type: String, default: "" },
          averageBankBalance: { type: String, default: "" },
          remark: { type: String, default: "" },
        },
      },
    ],

    adressInformation: {
      currentResidentalAdress: { type: String, default: "" },
      propertyAdress: { type: String, default: "" },
      buisnessWorkAdress: { type: String, default: "" },
    },

    loanDetails: [
      {
        loanType: { type: String, default: "" },
        loanAmount: { type: Number, default: 0 },
        interstRate: { type: Number, default: 0 }, // in %
        tenure: { type: Number, default: 0 }, // in months
        monthlyEmi: { type: Number, default: 0 },
      },
    ],

    otherLiablities: [
      {
        institution: { type: String, default: "" },
        loanType: { type: String, default: "" },
        currentOS: { type: String, default: "" },
        roi: { type: Number, default: 0 },
        ownership: { type: String, default: "" },
        emi: { type: Number, default: 0 },
        totalTenure: { type: Number, default: 0 },
        balanceTenure: { type: Number, default: 0 },
        obligated: { type: String, default: "" },
        obligatedConsidered: { type: String, default: "" },
        loanStatus: { type: String, default: "" },
      },
    ],

    propertyDetails: [
      {
        propertyType: { type: String, default: "" },
        propertyValue: { type: String, default: "" },
        propertyLocation: { type: String, default: "" },
        valuationDoneBy: { type: String, default: "" },
        propertySize: { type: String, default: "" },

        marketValue: {
          landValue: { type: Number, default: 0 },
          constructionValue: { type: Number, default: 0 },
          amenities: { type: String, default: "" },
        },

        realizableValue: {
          landValue: { type: Number, default: 0 },
          constructionValue: { type: Number, default: 0 },
          amenities: { type: String, default: "" },
        },

        valuationConsidered: {
          landValue: { type: Number, default: 0 },
          constructionValue: { type: Number, default: 0 },
          amenities: { type: String, default: "" },
        },
      },
    ],

    referenceCheck: [
      {
        name: { type: String, default: "" },
        relation: { type: String, default: "" },
        telephoneNo: { type: String, default: null },
        vintage: { type: String, default: "" },
        nativeOf: { type: String, default: "" },
        feedback: { type: String, default: "" },
      },
    ],

    buisnessReferences: [
      {
        name: { type: String, default: "" },
        ocuupation: { type: String, default: "" },
        contactNo: { type: String, default: null },
        remarks: { type: String, default: "" },
      },
    ],

    deviationsAndSanction: [
      {
        deviation: { type: String, default: "" },
        sanctionCondition: { type: String, default: "" },
      },
    ],

    formSubmissionDetails: [
      {
        pdDoneBy: { type: String, default: "" },
        pdDoneByDate: { type: String, default: "" },
        campreParedBy: { type: String, default: "" },
        campreParedByDate: { type: String, default: "" },
        salesManager: { type: String, default: "" },
        salesManagerDate: { type: String, default: "" },
      },
    ],
    
    completeDate:        { type: String , default :"" },
    status :             { type: String, enum: ["incomplete","complete","reject", "approve", "pending"], default: "pending" }
  },
  {
    timestamps: true,
  }
);

const camReportDetail = mongoose.model("camReport", camReportModelSchema);
module.exports = camReportDetail;

/*   
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const camReportModelSchema = new Schema(
  {

      employeeId:  { type: ObjectId , default :null },
      customerId:  { type: ObjectId , default :null },
      LD:          { type: String , default :"" },

    applicationInformation: {

      basicInformation:{
      name: { type: String, default: "" },
      occupation: { type: String, default: "" },
      dob: { type: String, default: "" },
      age: { type: String, default: "" },
      gender: { type: String, default: "" },
      },
      demographics:{
        caste: { type: String, default: "" },
      religion: { type: String, default: "" },
      maritalStatus: { type: String, default: "" },
      },
      contactAndRelationShip:{
        mobileNo: { type: String, default: "" },
      },
      creditInformation:{
        cibilCrifScore: { type: String, default: "" },
      },
      
    //   monthlyIncome:{ type: String, default: ""},
    //   otherMonthlyIncome:{ type: String, default: ""},
    //   sourceOfOtherIncome:{ type: String, default: ""},
    //   annualIncome:{ type: String, default: ""},
    //   totalHouseHoldExpenses:{ type: String, default: ""},
    //   bankDetail: {
    //     bankAccountNo: { type: String, default: "" },
    //     accountType: { type: String, default: "" },
    //     nameOfBank: { type: String, default: "" },
    //     averageBankBalance: { type: String, default: "" },
    //     remark: { type: String, default: "" },
    //   },
    // },

    coApplicationInformation: [
      {
        coAppType :{type:String,default:""},

        basicInformation:{
          name: { type: String, default: "" },
          occupation: { type: String, default: "" },
          dob: { type: String, default: "" },// format is dd-mm-yy
          age: { type: String, default: "" },
          gender: { type: String, default: "" },
        },
        demographics:{
          caste: { type: String, default: "" },
        religion: { type: String, default: "" },
        maritalStatus: { type: String, default: "" },
        },
        contactAndRelationShip:{
          mobileNo: { type: Number, default: null },
          relationWithApplicant: { type: String, default: "" },
        },
        creditInformation:{
          cibilCrifScore: { type: String, default: null },
        },
       
        
        // monthlyIncome:{ type: String, default: ""},
        // otherMonthlyIncome:{ type: String, default: ""},
        // sourceOfOtherIncome:{ type: String, default: ""},
        // annualIncome:{ type: String, default: ""},
        // totalHouseHoldExpenses:{ type: String, default: ""},

        // bankDetail: {
        //   bankAccountNo: { type: String, default: "" },
        //   accountType: { type: String, default: "" },
        //   nameOfBank: { type: String, default: "" },
        //   averageBankBalance: { type: String, default: "" },
        //   remark: { type: String, default: "" },
        // },
      },
    ],
    guarantorDetails: 
      {
        // guarantorType :{type:String,default:""},
        basicInformation:{
          name: { type: String, default: "" },
          occupation: { type: String, default: "" },
          dob: { type: String, default: "" },
          age: { type: String, default: "" },
          gender: { type: String, default: "" },
        },
        demographics:{
          caste: { type: String, default: "" },
        religion: { type: String, default: "" },
        maritalStatus: { type: String, default: "" },
        },
        contactAndRelationShip:{
          mobileNo: { type: Number, default: null },
        relationWithApplicant: { type: String, default: "" },
        },
        creditInformation:{
          cibilCrifScore: { type: String, default: null },
        },

        // monthlyIncome:{ type: String, default: ""},
        // otherMonthlyIncome:{ type: String, default: ""},
        // sourceOfOtherIncome:{ type: String, default: ""},
        // annualIncome:{ type: String, default: ""},
        // totalHouseHoldExpenses:{ type: String, default: ""},

        // bankDetail: {
        //   bankAccountNo: { type: String, default: "" },
        //   accountType: { type: String, default: "" },
        //   nameOfBank: { type: String, default: "" },
        //   averageBankBalance: { type: String, default: "" },
        //   remark: { type: String, default: "" },
        // },
      },


      loanRelated:{
        applicantInformation:{
          currentResidentalAdressApplicant:{type:String,default:""},
          occupation:{type:String,default:"", },
          profile: { type: String, default: "" },
      natureOfBuisness: { type: String, default: "" },
      natureOfIncomeProofSubmitted: { type: String, default: "" },
      averageBankingBalance: { type: String, default: "" },
      },

      propertyAndLoanDetails:{
        propertyAddress:{type:String,default:""},
        typeOfProperty:{type:String,default:"", },
        presentOwner: { type: String, default: "" },
    proposedOwner: { type: String, default: "" },
    purposeOfLoan: { type: String, default: "" },
    loanAmount: { type: Number, default: null },  
    emi:{type:Number,default:null}  ,
    tenureMonth:{type:String,default:""} ,
    moratoriumPeriodMonths:{type:String,default:""} ,
   },

   financialAndBuisnessDetails:{
    roi:{type:String,default:""},//rate of interest
    foir:{type:String,default:"", },//Fixed Obligation to Income Ratio
    ltv: { type: String, default: "" },//Loan-to-Value Ratio
   branch: { type: String, default: "" },
   totalIncome: { type: String, default: "" },
   officeContactNo: { type: Number, default: null },  
   product:{type:Strong,default:""}  ,
   }



    },
    incomeCalculation:{
      agricultureIncome: {
        type: [{ type: Number, default: null }],
        validate: {
          validator: function (array) {
            return array.length >= 3; // minimum length of 3
          },
          message: "The agricultureIncome  must have at least 3 entries.",
        },
      },
      district:{
        type:String,default:"",
      },
      season:{
        type:String,default:"",

      },
      areaCultivationAcres:{
        type:String,
        default:null
      },
      
      
    },
   
    
    completeDate:        { type: String , default :"" },
    status :             { type: String, enum: ["incomplete","complete","reject", "approve", "pending"], default: "pending" }
  }
  {
    timestamps: true,
  }
);

const camReportDetail = mongoose.model("camReport", camReportModelSchema);
module.exports = camReportDetail;


     */
