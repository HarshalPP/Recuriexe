const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const creditPdModel = new Schema(
  {
    customerId: { type: ObjectId, default: null , required: true, },
    pdId: { type: ObjectId , default: null, ref:'employee' },
    hoId: { type: ObjectId, default: null, ref:'employee' },
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    pdType: { type: String, default: "" },
    pdFormDelete : {type :Boolean , default :false},  // handle when pd again assign 
    videoUpload: { type: String, default: "" },
    rejectReason: { type: String, default: "" },
    pendingReason: { type: String, default: "" },


    applicantImage: { type: String, default: "" },
    guarantorImage: { type: String, default: "" },
    coApplicantImage: { type: [String], default: [] },

    applicant: {
      applicantType: { type: String, default: "" },
      businessType: { type: String, default: "" },
      occupation: { type: String, default: "" },
      DOB: { type: String, default: "" },
      email: { type: String, default: "" },
      houseLandMark: { type: String, default: "" },  //landmark
      alternateMobileNo: { type: String, default: "" },
      noOfyearsAtCurrentAddress: { type: String, default: "" },
      gender: { type: String, default: "" },
      religion: { type: String, default: "" },
      nationality: { type: String, default: "" },
      category: { type: String, default: "" },
      caste: { type: String, default: "" },
      maritalStatus: { type: String, default: "" },
      noOfDependentWithCustomer: { type: String, default: "" },
      educationalDetails: { type: String, default: "" },
      residenceType: { type: String, default: "" }
    },
    co_Applicant: [{
      coApplcantId : { type: ObjectId, default: null},
      coApplicantType: { type: String, default: "" },
      businessType: { type: String, default: "" },
      occupation: { type: String, default: "" },
      DOB: { type: String, default: "" },
      emailId: { type: String, default: "" },
      houseLandMark: { type: String, default: "" },
      alternateMobileNo: { type: String, default: "" },
      noOfyearsAtCurrentAddress: { type: String, default: "" },
      gender: { type: String, default: "" },
      religion: { type: String, default: "" },
      nationality: { type: String, default: "" },
      category: { type: String, default: "" },
      caste: { type: String, default: "" },
      maritalStatus: { type: String, default: "" },
      educationalDetails: { type: String, default: "" },
      residenceType: { type: String, default: "" },
    }],
    guarantor: {
      guarantorType: { type: String, default: "" },
      businessType: { type: String, default: "" },
      occupation: { type: String, default: "" },
      DOB: { type: String, default: "" },
      emailId: { type: String, default: "" },
      houseLandMark: { type: String, default: "" },
      alternateMobileNo: { type: String, default: "" },
      noOfyearsAtCurrentAddress: { type: String, default: "" },
      gender: { type: String, default: "" },
      religion: { type: String, default: "" },
      nationality: { type: String, default: "" },
      category: { type: String, default: "" },
      caste: { type: String, default: "" },
      maritalStatus: { type: String, default: "" },
      educationalDetails: { type: String, default: "" },
      residenceType: { type: String, default: "" },
    },
    policeStation: {
      staionName: { type: String, default: "" },
      stationAdress: { type: String, default: "" },
    },
    familyDetailType: {type: String,enum: ["samagraId", "rasanCard" ,""], default:""},

  rasanCardDetail: {
      cardNumber:         { type: String , default: ""},
      cardHolder:         { type: String , default: "" },
      address:            { type: String , default: "" },
      shopCodeAndLocation:{ type: String , default: "" },
      shopkeeper:         { type: String , default: "" },
      gasAgency:          { type: String , default: "" },
      gasConnectionNo:    { type: String , default: "" },
      connectionType:     { type: String , default: "" },
      rasanCardDoc:       { type: String , default: "" },
      familyMembers: [{
          memberName:   { type: String , default: "" },
          relationship: { type: String , default: "" },
          age:          { type: Number ,default:null },
          dob:          { type: String ,  default: "" }  // Changed to Date type
      }]
  },

  samagraIdDetail: {
      samagraFamilyId: { type: String , default: "" },
      headOfFamily:    { type: String , default: "" },
      samagraIdDoc:    { type: String , default: "" },
      address: {
          currentAddress:      { type: String , default: "" },
          addressAsPerAadhaar: { type: String , default: "" }
      },
      familyMembers: [{
          samagraId:     { type: String , default: "" },
          aadhaarStatus: { type: String , default: "", },
          memberName:    { type: String , default: "" },
          relationship:  { type: String , default: "" },
          age:           { type: Number , default: null},
          gender:        { type: String , default: "", },
          registrationAuthority: { type: String , default: "" },
          registrationDate:      { type: String , default: "", }  // Changed to Date type
      }],
      familyMembersCount: { type: Number  , default: null}
  },

    // familyMember: [
    //   {
    //     name: { type: String, default: "" },
    //     samagraMemberId: { type: String, default: "" },
    //     age: { type: Number, default: 0 },
    //     gender: { type: String , default :"" },
    //     relation: { type: String, default: "" },
    //     dependent: { type: String, default: "" },
    //     occupationType: { type: String },
    //     occupationTypeDetails: {
    //       institutionName: { type: String, default: "" },
    //       nameOfOrganization: { type: String, default: "" },
    //       designation: { type: String, default: "" },
    //       dateOfJoining: { type: String, default: "" },
    //     },
    //   },
    // ],

    department_info: [
      {
        dependent_Name: { type: String, default: "" },
        age: { type: String, default: "" },
        Relationship: { type: String, default: "" },
        Annual_Income: { type: String, default: "" },
        Occupation: { type: String, default: "" },
        Institution_of_studen: { type: String, default: "" },
        Name_of_Organization: { type: String, default: "" },
        Designation: { type: String, default: "" },
        Date_of_joining: { type: String, default: "" },
        samagraDoc: { type: String, default: "" },

      },
    ],


    cibilAnalysis: {
      TotalLoans: { type: String, default: "" },
      detailsOfCurrentLoans: { type: String, default: "" },
      reasonforDPD: { type: String, default: "" },
      // totalEmiAmount: { type: String  , default : ""},
    },
    incomeSource: [
      {
        incomeSourceType: {
          type: String,
          enum: ["agricultureBusiness", "milkBusiness", "salaryIncome", "other", ""],
          default: ""
        },
        agricultureBusiness: {
          haveYouFaced: { type: String, default: "" },
          nameOfAgriOwner: { type: [String], default: [] },
          relationOfApplicant: { type: String, default: "" },
          // kasraSurveyNo: { type: String, default: "" },
          agriLandInBigha: { type: String, default: "" },
          otherName: { type: String, default: "" },
          otherRelation: { type: String, default: "" },
          otherRemark: { type: String, default: "" },
          villageName: { type: String, default: "" },
          detailOfLastCorp: { type: String, default: "" },
          howmuchcorpsoldInAmt: { type: String, default: "" },
          agriculturePhotos: { type: [String], default: [] },
          agricultureLandImage: { type: [String], default: [] },

          //add new fields
          whichCropIsPlanted: { type: [String], default: [] },  // string to array update
          agriDoingFromNoOfYears: { type: String, default: "" },
          addressAsPerPawti: { type: String, default: "" },
          districtName: { type: String, default: "" },
          agriLandSurveyNo: { type: String, default: "" },
          fertilizerShopOwnerName: { type: String, default: "" },
          fertilizerShopOwnerContactNumber: { type: String, default: "" },
          WhatTypeOfIrrigationMethod: { type: String, default: "" },
          significantChallengesThisSeason: { type: String, default: "" },
          agriIncomeYearly: { type: String, default: "" },
          ifCropDestroyedHowToPayEMI: { type: String, default: "" },
        },
        milkBusiness: {
          numberOfCattrels: { type: String, default: "" },
          noOfMilkGivingCattles: { type: String, default: "" },
          doingFromNoOfYears: { type: String, default: "" },
          totalMilkSupplyPerDay: { type: String, default: "" },
          nameOfDairy: { type: String, default: "" },
          dairyOwnerMobNo: { type: String, default: "" },
          dairyAddress: { type: String, default: "" },
          milkprovideFromSinceYear: { type: String, default: "" },
          expensesOfMilkBusiness: { type: String, default: "" },
          monthlyIncomeMilkBusiness: { type: String, default: "" },
          milkPhotos: { type: [String], default: [] },
          animalPhotos: { type: [String], default: [] },
          // add new fields
          currentMilkUtilization: { type: String, default: "" },
          breedOfCattles: { type: [String], default: [] }, //String to array
          ifCropDestroyedHowToPayEMI: { type: String, default: "" },
          observedDesignatedCattleTyingArea: { type: String, default: "" },
        },
        salaryIncome: {
          numberOfCattrels: { type: String, default: "" },
          companyName: { type: String, default: "" },
          addressOfSalaryProvider: { type: String, default: "" },
          MobNoOfSalaryProvider: { type: String, default: "" },
          doingFromNoYears: { type: String, default: "" },
          salaryPaidThrouch: { type: String, default: "" },
          monthlyNetSalary: { type: String, default: "" },
          salaryCredited6Month: { type: String, default: "" },
          last3MonthSalarySlipPhotos: { type: [String], default: [] },
          bankStatementPhoto: { type: String, default: "" },
          salaryPhotos: { type: [String], default: [] },
        },
        other: {
          bussinessFromSinceYear: { type: String, default: "" },
          natureOfBusiness: { type: String, default: "" },
          monthlyIncome: { type: Number, default: 0 },
          yearlyIncome: { type: Number, default: 0 },
          discriptionOfBusiness: { type: String, default: "" },
          incomeOtherImages: { type: [String], default: [] }
        }
      },
    ],
    property: {
      collateralsDetails: {
        nameOfTheDocumentHolder: { type: String, default: "" },
        documentsProvided: { type: String, default: "" },
        propertyAddress: { type: String, default: "" },
        landmark: { type: String, default: "" },
        locationZone: { type: String, default: "" },
        availabilityOfLocalTransport: { type: String, default: "" },
        classOfLocality: { type: String, default: "" },
        typeOfLocality: { type: String, default: "" },
        asPerSite: { type: String, default: "" },
        boundariesMatching: { type: String, default: "" },
        statusOfTheLandFlat: { type: String, default: "" },
        typeOfProperty: { type: String, default: "" },

        boundariesEast: { type: String, default: "" },
        boundariesWest: { type: String, default: "" },
        boundariesNorth: { type: String, default: "" },
        boundariesSouth: { type: String, default: "" },
      },
      accommodationDetails: {
        groundFloor: { type: String, default: "" },
        firstFloor: { type: String, default: "" },
        actualUsageOfProperty: { type: String, default: "" },
        typeOfStructure: { type: String, default: "" },
        locationOfPlot: { type: String, default: "" },
        builtUpAreaSft: { type: String, default: "" },
        occupancy: { type: String, default: "" },
        electricityAndGasConnection: { type: String, default: "" },
        developmentOfSurroundingArea: { type: String, default: "" },
      },

      propertyOwnerName: { type: String, default: "" },
      relationWithApplicant: { type: String, default: "" },
      documentType: { type: String, default: "" },
      villageName: { type: String, default: "" },
      gramPanchayat: { type: String, default: "" },
      patwariHalkaNo: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
      TotalLandArea: { type: String, default: "" },
      howManyFloors: { type: String, default: "" },
      district: { type: String, default: "" },
      tehsil: { type: String, default: "" },
      houseNo: { type: String, default: "" },
      wardNo: { type: String, default: "" },
      surveyNo: { type: String, default: "" },
      TotalBuilUpArea: { type: String, default: "" },
      qualityOfConstruction: { type: String, default: "" },
      ageOfProperty: { type: String, default: "" },
      MaintenanceOfTheProperty: { type: String, default: "" },
      ProjectedLifeYear: { type: String, default: "" },
      typeOfContruction: { type: String, default: "" },
      landRatePerSQFT: { type: String, default: "" },
      totalConstruction: { type: String, default: "" },

      // add new fields
      fatherName: { type: String, default: "" },
      latitudeOfTheProrty: { type: String, default: "" },
      longitudeOfTheProrty: { type: String, default: "" },
      doorsAndWindowsAreAvailable: { type: String, default: "" },
      kitchenAndLatBathAvailable: { type: String, default: "" },
      assetSeenAtResidence: { type: [String], default: [] },
    },

    bankDetail: {
      nameOfBank: { type: String, default: "" },
      branchName: { type: String, default: "" },
      accountNo: { type: String, default: "" },
      accountType: { type: String, default: "" },
      IFSCCode: { type: String, default: "" },
      accountHolderName: { type: String, default: "" },
    },

    referenceDetails: [{
      name: { type: String, default: "" },
      address: { type: String, default: "" },
      relation: { type: String, default: "" },
      mobileNumber: { type: String, default: "" },
    }],

    landmarkPhoto: { type: String, default: "" },
    latLongPhoto: { type: String, default: "" },
    fourBoundaryPhotos: { type: [String], default: [] },
    workPhotos: { type: [String], default: [] },
    houseInsidePhoto: { type: [String], default: [] },

    propertyOtherPhotos: { type: [String], default: [] },
    selfiWithCustomer: { type: String, default: "" },
    photoWithLatLong: { type: String, default: "" },
    front: { type: String, default: "" },
    leftSide: { type: String, default: "" },
    rightSide: { type: String, default: "" },
    approachRoad: { type: String, default: "" },
    mainRoad: { type: String, default: "" },
    interiorRoad: { type: String, default: "" },
    selfieWithProperty: { type: String, default: "" },
    propertyPhoto: { type: String, default: "" },

    assetDetails: [
      {
        name: { type: String, default: "" },
        purchaseValue: { type: String, default: "" },
        marketValue: { type: String, default: "" },
      },
    ],

    total: {
      totalPurchaseValue: { type: Number, default: 0 },
      totalMarketValue: { type: Number, default: 0 },
    },

    totalIncomeDetails: {
      totalYearlyIncome: { type: String, default: "" },
      totalMonthlyIncome: { type: String, default: "" },
      totalExpensesYearly: { type: String, default: "" },
      totalExpensesMonthly: { type: String, default: "" },
    },

    approveLoanDetails: {
      loanType: { type: String, default:""},
      approvedAmount: { type: Number, default: 0 },
      ROI: { type: Number, default: 0 },
      Tenure: { type: Number, default: 0 },
      EMI: { type: Number, default: 0 },
      demandLoanAmountByCustomer: { type: String, default: "" },
      finalDecision: { type: String, default: "" },
      endUseOfLoan: { type: String, default: "" }
    },

    samagraDetail: {
      samagraFamilyIdNo: { type: String, default: "" },
      samagraIdHeadName: { type: String, default: "" },
    },

    gasDiaryPhoto: { type: String, default: "" },
    meterPhoto: { type: String, default: "" },
    electricityBillPhoto: { type: String, default: "" },
    customerNameAsPerElectricityBill:{ type: String, default: "" }, 
    customerBillId: { type: String, default: "" },
    addressAsPerElectricityBill: { type: String, default: "" }, 
    SSSMPhoto: { type: String, default: "" },
    udyamCertificate: { type: String, default: "" },
    familyMemberPhotos: { type: [String], default: [] },
    otherDocUpload: { type: String, default: "" },
    billType: { type: String, default: "" },
    personType: { type: String, default: "" },
    personName: { type: String, default: "" },

    residentType: { type: String, default: "" },
    residentCurrentSince: { type: Number, default: 0 },
    remarkByPd: { type: String, default: "" },
    status: {
      type: String, default: "pending",
      enum: ["complete", "pending", "reject", "incomplete", "notAssign", "approve", "rejectByApprover" , "rejectByHo", "WIP"],
    },

    branchStatus:{
      type: String, default: "pending",
      enum: ["complete","reject","pending"],
    },

    fileProcessStatus:{ type: String, default: true }, // for (newfilels) file process status
    hoRemark: { type: String, default: "" },
    approvalRemarkCreditPd: { type: String, default: "" },
    pdfLink: { type: String, default: "" },
    pdfWithoutImage: { type: String, default: "" },
    pdfWithAllData: { type: String, default: "" },
    reasonForReject: { type: String, default: "" },
    remarkMessage: { type: String, default: "" },
    bdCompleteDate: { type: String, default: "" },
    hoUpdateDate :{ type: String, default: "" },
    pdReplyToCibilRemarks:{ type: String, default: "" },
    workPhotosZip :{ type: String, default: "" },
    housePhotosZip:{ type: String, default: "" },
    PDdocuments: {type :Boolean , default :false},
    correctionRemark :{ type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

const creditPdSchema = mongoose.model("pdFormData", creditPdModel);

module.exports = creditPdSchema;
