const {
  success,
  unknownError,
  serverValidation,
  badRequest,
  notFound,
  parseJwt,
  badRequestwitherror
} = require("../../../../globalHelper/response.globalHelper");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const moment = require("moment-timezone");
const { PDFDocument } = require("pdf-lib");
const employeModel = require("../model/adminMaster/employe.model.js");
const coApplicantModel = require("../model/co-Applicant.model");
const applicantModel = require("../model/applicant.model.js");
const guarantorModel = require("../model/guarantorDetail.model");
const customerModel = require("../model/customer.model");
const processModel = require("../model/process.model.js");
const cibilModel = require("../model/cibilDetail.model.js");
// const branchModel = require("../model/adminMaster/branch.model.js");
const newBranchModel = require("../model/adminMaster/newBranch.model.js");
const creditPdModel = require("../model/credit.Pd.model.js");
const { paginationData } = require("../helper/pagination.helper.js");
const udyamModel = require("../model/branchPendency/udhyamKyc.model.js");
const gtrPdcModel = require("../model/branchPendency/gtrPdc.model.js");
const appPdcModel = require("../model/branchPendency/appPdc.model.js");
const approverFormModel = require("../model/branchPendency/approverTechnicalFormModel.js");
const bankStatementModel = require("../model/branchPendency/bankStatementKyc.model.js");
const salaryAndOtherIncomeModel = require("../model/branchPendency/salaryAndOtherIncomeModel.js");
const milkIncomeModel = require("../model/branchPendency/milkIncomeModel.js");
const agricultureModel = require("../model/branchPendency/agricultureIncomeModel.js");
const externalVendorFormModel = require("../model/externalManager/externalVendorDynamic.model.js");
const technicalApproveFormModel = require("../model/branchPendency/approverTechnicalFormModel.js");
const tvrModel = require("../model/fileProcess/tvr.model.js");
// const finalSanctionModel = require("../model/fileProcess/finalSanction.model.js");
const finalModel = require("../model/finalSanction/finalSnction.model.js");
const internalLegalModel = require("../model/finalApproval/internalLegal.model.js");
const { google } = require("googleapis");
const credentials = require("../../../../liveSheet.json");
const loanDocumentModel = require("../model/finalApproval/allDocument.model.js");
const lenderModel = require("../model/lender.model.js");
const ExcelJS = require("exceljs");
// const {finalApprovalSheet} = require("../controller/googleSheet.controller.js");
require('dotenv').config();
const axios = require("axios");


//createNewCamReport
const createNewCamReport = async (req, res) => {
  try {
    const { customerId } = req.query;

    const partnerNameData = await finalModel
      .findOne({ customerId })
      .populate("partnerId");
    // console.log(partnerNameData, "partnerDatapartnerDatapartnerData");
    if (
      partnerNameData?.partnerId?.fullName == "ratnaafin capital pvt ltd" ||
      partnerNameData?.partnerId?.fullName == "RATNAAFIN CAPITAL PVT LTD" ||
      partnerNameData?.partnerId?.fullName == "fin coopers capital pvt ltd" ||
      partnerNameData?.partnerId?.fullName == "FIN COOPERS CAPITAL PVT LTD" ||
      partnerNameData?.partnerId?.fullName == "UNITY CAPITAL PVT LTD" ||
      partnerNameData?.partnerId?.fullName == "UNITY SMALL FINANCE BANK"
    ) {
      // console.log("partner sle")
      const spreadsheetId = "19wYa2onnAXj2Nryu6hsnHRlflydxEEMdv1Lh5vDWkyI"//"1K9EnCErm-NfZCg7--TJtkfOqzPyGc-c5eLrWELS3kMA"; // Your spreadsheet ID
      const sheetName = "Sheet1"; // Your sheet name

      const auth = new google.auth.GoogleAuth({
        credentials, // Your credentials object or JSON key file
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      const authClient = await auth.getClient();
      const sheets = google.sheets({ version: "v4", auth: authClient });

      // Fetch data from the sheet
      const responses = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:Z`, // Fetch entire sheet or range you want
      });

      const rows = responses.data.values;
      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: "No data found in the sheet" });
      }

      // Field mappings
      const fieldMappings = {
        partnerHeadingName: { row: 0, col: 1 },
        loanTypeName: { row: 3, col: 1 },
        branchState: { row: 5, col: 3 },
        branchName: { row: 6, col: 3 },
        partnerName: { row: 7, col: 3 },
        employeeName: { row: 8, col: 3 },
        employeeCode: { row: 9, col: 3 },

        fullName: { row: 12, col: 3 },
        CoappFullName1: { row: 12, col: 4 }, //name
        CoappFullName2: { row: 12, col: 5 },
        gtrFullName: { row: 12, col: 6 },
        dob: { row: 13, col: 3 }, //dob
        CoappDob1: { row: 13, col: 4 },
        CoappDob2: { row: 13, col: 5 },
        gtrDob: { row: 13, col: 6 },
        age: { row: 14, col: 3 }, //age
        CoappAge1: { row: 14, col: 4 },
        CoappAge2: { row: 14, col: 5 },
        profileOfCustomer: { row: 16, col: 3 },
        sector: { row: 17, col: 3 },
        industry: { row: 18, col: 3 },
        gtrAge: { row: 14, col: 6 },
        gender: { row: 19, col: 3 }, //gender
        CoappGender: { row: 19, col: 4 },
        CoappGender2: { row: 19, col: 5 },
        gtrGender: { row: 19, col: 6 },
        relationship: { row: 20, col: 3 }, //relationShip
        Coapprelationship: { row: 20, col: 4 },
        Coapprelationship2: { row: 20, col: 5 },
        gtrrelationship: { row: 20, col: 6 },
        mobileNo: { row: 21, col: 3 }, //contact number
        CoappMobileNo: { row: 21, col: 4 },
        CoappMobileNo2: { row: 21, col: 5 },
        gtrMobileNo: { row: 21, col: 6 },
        email: { row: 22, col: 3 }, //email
        CoappEmail: { row: 22, col: 4 },
        CoappEmail2: { row: 22, col: 5 },
        gtrEmail: { row: 22, col: 6 },
        workAddress: { row: 24, col: 3 },
        address: { row: 23, col: 3 }, //address
        CoappAddress: { row: 23, col: 4 },
        CoappAddress2: { row: 23, col: 5 },
        gtrAddress: { row: 23, col: 6 },
        cibil: { row: 25, col: 3 }, //cibil score
        CoappCibil: { row: 25, col: 4 },
        CoappCibil2: { row: 25, col: 5 },
        gtrCibil: { row: 25, col: 6 },
        loanAmount: { row: 26, col: 3 }, //loan ammount
        tenure: { row: 27, col: 3 },
        roi: { row: 28, col: 3 },
        emi: { row: 29, col: 3 },
        endUseOfLoans: { row: 30, col: 3 },
        geoLimit: { row: 31, col: 3 },
        propertyType: { row: 33, col: 3 }, //collateral
        geographicArea: { row: 34, col: 3 }, //collateral
        PropertyAddress: { row: 35, col: 3 },
        PropertyOwnersName: { row: 36, col: 3 },
        PropertyownerAge: { row: 37, col: 3 },
        ConstructionArea: { row: 38, col: 3 },
        legal: { row: 39, col: 3 },
        technical: { row: 40, col: 3 },
        PropertyMarketValue: { row: 41, col: 3 },
        LTV: { row: 42, col: 3 },
        agricultureExperience: { row: 45, col: 5 },
        milkBusinessExperience: { row: 46, col: 5 },
        otherBusinessExperience: { row: 47, col: 5 },
        residenceStability: { row: 48, col: 3 },
        agricultureLand: { row: 49, col: 3 },
        noOfCattles: { row: 50, col: 3 },

        agriIncome: { row: 51, col: 5 },
        milkIncome: { row: 52, col: 5 },
        incomeFormOtherSource: { row: 53, col: 5 },
        totalAnnualIncomeconsider: { row: 54, col: 5 },

        bankNameOne: { row: 68, col: 3 }, // bank details
        bankBranchOne: { row: 69, col: 3 },
        nameAsPerBankOne: { row: 70, col: 3 },
        AccountNumOne: { row: 71, col: 3 },
        ifscCodeOne: { row: 72, col: 3 },
        MicrCodeOne: { row: 73, col: 3 },
        bankNameTwo: { row: 75, col: 3 }, // bank details
        bankBranchTwo: { row: 76, col: 3 },
        nameAsPerBankTwo: { row: 77, col: 3 },
        AccountNumTwo: { row: 78, col: 3 },
        ifscCodeTwo: { row: 79, col: 3 },
        MicrCodeTwo: { row: 80, col: 3 },
        // annualIncomeOfMilk: { row: 82, col: 3 },
        GrossIncomeFromagriculture: { row: 82, col: 3 }, // aggreculture
        noOfAcreAgriculture: { row: 83, col: 3 },
        nameOfAgricultureOwner: { row: 84, col: 3 },
        noOfAgricultureOwner: { row: 85, col: 3 },
        yearOfDoingAgriculture: { row: 86, col: 3 },
        lastCropDetails: { row: 87, col: 3 },
        lastCropSaleDetails: { row: 88, col: 3 },
        serveyNoAgriculture: { row: 89, col: 3 },
        lastCropSalesInCase: { row: 90, col: 3 },
        LastCropSalesAmount: { row: 91, col: 3 },

        //agriland
        districtOne: { row: 94, col: 1 },
        seasonOne: { row: 94, col: 2 },
        AreaCultivationAcresOne: { row: 94, col: 3 },
        cropOne: { row: 94, col: 4 },
        netIncomeOne: { row: 94, col: 5 },

        districtTwo: { row: 95, col: 1 },
        seasonTwo: { row: 95, col: 2 },
        AreaCultivationAcresTwo: { row: 95, col: 3 },
        cropTwo: { row: 95, col: 4 },
        netIncomeTwo: { row: 95, col: 5 },

        districtThree: { row: 96, col: 1 },
        seasonThree: { row: 96, col: 2 },
        AreaCultivationAcresThree: { row: 96, col: 3 },
        cropThree: { row: 96, col: 4 },
        netIncomeThree: { row: 96, col: 5 },

        agreeTotal: { row: 97, col: 5 },

        GrossIncomeFromMilk: { row: 99, col: 3 }, // cattle details
        totalCatelOfMilk: { row: 100, col: 3 },
        totalBirds: { row: 101, col: 3 },
        dailyMilkOfMilk: { row: 102, col: 3 },
        nameOfDairyOfMilk: { row: 103, col: 3 },
        adressOfDailyOfMilk: { row: 104, col: 3 },
        conctactNumberOfMilk: { row: 105, col: 3 },
        yearOfDoingMilkBussinessOfMilk: { row: 106, col: 3 },
        yearOfMilkProvideAtAboveOfMilk: { row: 107, col: 3 },
        annualIncomeFromMilk: { row: 108, col: 3 },

        GrossIncomeFromOtherIncome: { row: 110, col: 3 },
        incomeReciveForm: { row: 111, col: 3 },
        yearlyIncome: { row: 112, col: 3 },
        totalAnnualIncomes: { row: 115, col: 3 },

        grossExpensesFromAgriculture: { row: 117, col: 3 },
        grossExpensesFromMilk: { row: 118, col: 3 },
        grossExpensesFromExisting: { row: 119, col: 3 },

        nameOne: { row: 140, col: 3 }, //referance
        relationOne: { row: 141, col: 3 },
        addressOne: { row: 142, col: 3 },
        mobileOne: { row: 143, col: 3 },
        nameTwo: { row: 147, col: 3 },
        relationTwo: { row: 148, col: 3 },
        addressTwo: { row: 149, col: 3 },
        mobileTwo: { row: 150, col: 3 },

        institutionOne: { row: 123, col: 1 },
        loanAmountOne: { row: 123, col: 2 },
        emiMonthlyOne: { row: 123, col: 3 },
        currentOsOne: { row: 123, col: 4 },
        emiYearlyOne: { row: 123, col: 5 },

        institutionTwo: { row: 124, col: 1 },
        loanAmountTwo: { row: 124, col: 2 },
        emiMonthlyTwo: { row: 124, col: 3 },
        currentOsTwo: { row: 124, col: 4 },
        emiYearlyTwo: { row: 124, col: 5 },

        institutionThree: { row: 125, col: 1 },
        loanAmountThree: { row: 125, col: 2 },
        emiMonthlyThree: { row: 125, col: 3 },
        currentOsThree: { row: 125, col: 4 },
        emiYearlyThree: { row: 125, col: 5 },

        institutionFour: { row: 126, col: 1 },
        loanAmountFour: { row: 126, col: 2 },
        emiMonthlyFour: { row: 126, col: 3 },
        currentOsFour: { row: 126, col: 4 },
        emiYearlyFour: { row: 126, col: 5 },

        institutionFive: { row: 127, col: 1 },
        loanAmountFive: { row: 127, col: 2 },
        emiMonthlyFive: { row: 127, col: 3 },
        currentOsFive: { row: 127, col: 4 },
        emiYearlyFive: { row: 127, col: 5 },

        institutionSix: { row: 128, col: 1 },
        loanAmountSix: { row: 128, col: 2 },
        emiMonthlySix: { row: 128, col: 3 },
        currentOsSix: { row: 128, col: 4 },
        emiYearlySix: { row: 128, col: 5 },

        institutionSeven: { row: 129, col: 1 },
        loanAmountSeven: { row: 129, col: 2 },
        emiMonthlySeven: { row: 129, col: 3 },
        currentOsSeven: { row: 129, col: 4 },
        emiYearlySeven: { row: 129, col: 5 },

        institutionEight: { row: 130, col: 1 },
        loanAmountEight: { row: 130, col: 2 },
        emiMonthlyEight: { row: 130, col: 3 },
        currentOsEight: { row: 130, col: 4 },
        emiYearlyEight: { row: 130, col: 5 },

        institutionNine: { row: 131, col: 1 },
        loanAmountNine: { row: 131, col: 2 },
        emiMonthlyNine: { row: 131, col: 3 },
        currentOsNine: { row: 131, col: 4 },
        emiYearlyNine: { row: 131, col: 5 },

        institutionTen: { row: 132, col: 1 },
        loanAmountTen: { row: 132, col: 2 },
        emiMonthlyTen: { row: 132, col: 3 },
        currentOsTen: { row: 132, col: 4 },
        emiYearlyTen: { row: 132, col: 5 },

        netAnnualIncome: { row: 134, col: 3 },
        netAnnualExpenses: { row: 135, col: 3 },
        netMonthlyIncomess: { row: 136, col: 3 },

        totalEmiMonthly: { row: 133, col: 5 },
        foir: { row: 138, col: 5 },
      };

      // Function to update cells
      const updateCell = (fieldName, value) => {
        const mapping = fieldMappings[fieldName];
        if (mapping) {
          const updateRange = `${sheetName}!${String.fromCharCode(
            65 + mapping.col
          )}${mapping.row + 1}`;
          return {
            range: updateRange,
            values: [[value || ""]],
          };
        }
        return null;
      };

      // Fetch applicant, co-applicant, and guarantor data
      const appData = await applicantModel.findOne({ customerId });
      const CoappData = await coApplicantModel.find({ customerId });
      const gtrData = await guarantorModel.findOne({ customerId });
      const cibilData = await cibilModel.findOne({ customerId });
      const customerData = await customerModel
        .findOne({ _id: customerId })
        .populate("employeId");
      // console.log(customerData,"customerDatacustomerDatacustomerData")
      const approverData = await approverFormModel.findOne({ customerId });
      const appPdcData = await appPdcModel.findOne({ customerId });
      const milkIncomeDetails = await milkIncomeModel.findOne({ customerId });
      const agricultureDetails = await agricultureModel.findOne({ customerId });

      const partnerData = await finalModel
        .findOne({ customerId })
        .populate("partnerId")
        .populate("EndUseOfLoan")
      // console.log(partnerData,"partnerData")
      const employeeData = await employeModel
        .findOne({ _id: customerData?.employeId._id })
        .populate("branchId");
      const creditPdData = await creditPdModel.findOne({ customerId });
      const udyamDetail = await udyamModel.findOne({ customerId });
      const bankStatementDetails = await bankStatementModel.findOne({
        customerId,
      });

      
    //  console.log(applicantLoanDetails,"applicantLoanDetails")
      let agriData;
      let milkData;
      let salaryData;
      let otherData;
      if (
        creditPdData?.incomeSource?.some(
          (src) => src?.incomeSourceType === "agricultureBusiness"
        )
      ) {
        agriData =
          creditPdData?.incomeSource?.find(
            (src) => src?.incomeSourceType === "agricultureBusiness"
          )?.agricultureBusiness ?? {};
        // console.log("Agriculture Business Data:", agriData);
      }

      if (
        creditPdData?.incomeSource?.some(
          (src) => src?.incomeSourceType === "milkBusiness"
        )
      ) {
        milkData =
          creditPdData?.incomeSource?.find(
            (src) => src?.incomeSourceType === "milkBusiness"
          )?.milkBusiness ?? {};
        // console.log("Milk Business Data:", milkData);
      }

      if (
        creditPdData?.incomeSource?.some(
          (src) => src?.incomeSourceType === "salaryIncome"
        )
      ) {
        salaryData =
          creditPdData?.incomeSource?.find(
            (src) => src?.incomeSourceType === "salaryIncome"
          )?.salaryIncome ?? {};
        // console.log("Salary Income Data:", salaryData);
      }

      if (
        creditPdData?.incomeSource?.some(
          (src) => src?.incomeSourceType === "other"
        )
      ) {
        otherData =
          creditPdData?.incomeSource?.find(
            (src) => src?.incomeSourceType === "other"
          )?.other ?? {};
        // console.log("Other Income Data:", otherData);
      }

      // console.log(approverData,"approverData<><><><><><><><>",employeeData?.location)
      const legalData = await internalLegalModel.findOne({ customerId });
      let loanType
      if(legalData?.LoanType == 'CONSTRUCTION'){
        loanType = `${legalData?.LoanType} - Credit Appraisal Memo`
      }else{
        loanType = `Micro LAP - Credit Appraisal Memo`
      }
      // console.log(legalData,"loanTypeloanTypeloanType")

      function formatDate(dob) {
        if (!dob) return "";
        const date = new Date(dob);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      }
      // for cibil
      function getCibilScore(score) {
        if (score === undefined || score === null) return ""; // Return empty string if no score is provided
        return score < 300 ? -1 : score; // Return -1 if score is less than 300, otherwise the actual score
      }
      //for emi
      function getRoundedEMI(emi) {
        if (emi === undefined || emi === null) return ""; // Return empty string for null or undefined
        return Math.round(emi); // Round off the EMI value to the nearest integer
      }
      // for distance
      const haversineDistance = (coords1, coords2) => {
        const toRadians = (degrees) => (degrees * Math.PI) / 180;

        const [lat1, lon1] = coords1;
        const [lat2, lon2] = coords2;

        const R = 6371; // Earth's radius in kilometers

        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);

        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = R * c; // Distance in kilometers
        return distance;
      };

      const calculatePropertyToBranchDistance = async (
        approverData,
        employeeData
      ) => {
        try {
          const propertyCoords = [
            approverData.latitude,
            approverData.longitude,
          ];
          const branchCoords = employeeData?.branchId?.location?.coordinates;

          // Check if coordinates are available
          if (
            !propertyCoords ||
            !branchCoords ||
            propertyCoords.length < 2 ||
            branchCoords.length < 2
          ) {
            console.warn(
              "Coordinates are missing; skipping distance calculation."
            );
            return null; // Return null if coordinates are not available
          }

          const distance = haversineDistance(propertyCoords, branchCoords);

          // Return formatted distance
          if (distance) {
            return `${distance.toFixed(2)} KM from branch`;
          }

          return null; // Return null if distance couldn't be calculated
        } catch (error) {
          console.error("Error calculating distance:", error);
          return null; // Return null in case of an error
        }
      };

      //  let formattedDistance
      const formattedDistance = await calculatePropertyToBranchDistance(
        approverData,
        employeeData
      );

      // const applicantLoanDetails = cibilData?.applicantCibilDetail[0]?.creditData[0]?.accounts || []

      const applicantLoanDetails =  Array.isArray(cibilData?.applicantCibilDetail) && cibilData.applicantCibilDetail.length > 0 &&
  Array.isArray(cibilData.applicantCibilDetail[0]?.creditData) &&
  cibilData.applicantCibilDetail[0].creditData.length > 0 &&
  Array.isArray(cibilData.applicantCibilDetail[0].creditData[0]?.accounts)
    ? cibilData.applicantCibilDetail[0].creditData[0].accounts
    : [];


    const ownershipMap = {
      '1': 'INDIVIDUAL',
      '2': 'AUTHORISED USER',
      '3': 'GUARANTOR',
      '4': 'JOINT',
      '5': 'DECEASED'
    };

    const accountTypeMap = {
      '01': 'Auto Loan (Personal)',
      '02': 'HOUSING LOAN',
      '03': 'PROPERTY LOAN',
      '04': 'LOAN AGAINST SHARES/SECURITIES',
      '05': 'PERSONAL LOAN',
      '06': 'CONSUMER LOAN',
      '07': 'GOLD LOAN',
      '08': 'EDUCATION LOAN',
      '09': 'LOAN TO PROFESSIONAL',
      '10': 'CREDIT CARD',
      '11': 'LEASING',
      '12': 'OVERDRAFT',
      '13': 'TWO-WHEELER LOAN',
      '14': 'NON-FUNDED CREDIT FACILITY',
      '15': 'LOAN AGAINST BANK DEPOSITS',
      '16': 'FLEET CARD',
      '17': 'COMMERCIAL VEHICLE LOAN',
      '18': 'TELCO – WIRELESS',
      '19': 'TELCO – BROADBAND',
      '20': 'TELCO – LANDLINE',
      '21': 'SELLER FINANCING',
      '22': 'SELLER FINANCING SOFT',
      '23': 'GECL LOAN SECURED',
      '24': 'GECL LOAN UNSECURED',
      '31': 'SECURED CREDIT CARD',
      '32': 'USED CAR LOAN',
      '33': 'CONSTRUCTION EQUIPMENT LOAN',
      '34': 'TRACTOR LOAN',
      '35': 'CORPORATE CREDIT CARD',
      '36': 'KISAN CREDIT CARD',
      '37': 'LOAN ON CREDIT CARD',
      '38': 'PRIME MINISTER JAAN DHAN YOJANA - OVERDRAFT',
      '39': 'MUDRA LOANS – SHISHU / KISHOR / TARUN',
      '40': 'MICROFINANCE – BUSINESS LOAN',
      '41': 'MICROFINANCE – PERSONAL LOAN',
      '42': 'MICROFINANCE – HOUSING LOAN',
      '43': 'MICROFINANCE – OTHER',
      '44': 'PRADHAN MANTRI AWAS YOJANA - CREDIT LINK SUBSIDY SCHEME MAY CLSS',
      '50': 'BUSINESS LOAN – SECURED',
      '51': 'BUSINESS LOAN – GENERAL',
      '52': 'BUSINESS LOAN – PRIORITY SECTOR – SMALL BUSINESS',
      '53': 'BUSINESS LOAN – PRIORITY SECTOR – AGRICULTURE',
      '54': 'BUSINESS LOAN – PRIORITY SECTOR – OTHERS',
      '55': 'BUSINESS NON-FUNDED CREDIT FACILITY – GENERAL',
      '56': 'BUSINESS NON-FUNDED CREDIT FACILITY – PRIORITY SECTOR – SMALL BUSINESS',
      '57': 'BUSINESS NON-FUNDED CREDIT FACILITY – PRIORITY SECTOR – AGRICULTURE',
      '58': 'BUSINESS NON-FUNDED CREDIT FACILITY – PRIORITY SECTOR-OTHERS',
      '59': 'BUSINESS LOAN AGAINST BANK DEPOSITS',
      '61': 'BUSINESS LOAN - UNSECURED',
      '80': 'MICROFINANCE DETAILED REPORT (APPLICABLE TO ENQUIRY PURPOSE ONLY)',
      '81': 'SUMMARY REPORT (APPLICABLE TO ENQUIRY PURPOSE ONLY)',
      '88': 'LOCATE PLUS FOR INSURANCE (APPLICABLE TO ENQUIRY PURPOSE ONLY)',
      '90': 'ACCOUNT REVIEW (APPLICABLE TO ENQUIRY PURPOSE ONLY)',
      '91': 'RETRO ENQUIRY (APPLICABLE TO ENQUIRY PURPOSE ONLY)',
      '92': 'LOCATE PLUS (APPLICABLE TO ENQUIRY PURPOSE ONLY)',
      '97': 'ADVISER LIABILITY (APPLICABLE TO ENQUIRY PURPOSE ONLY)',
      '00': 'OTHER',
      '98': 'SECURED (ACCOUNT GROUP FOR PORTFOLIO REVIEW RESPONSE)',
      '99': 'UNSECURED (ACCOUNT GROUP FOR PORTFOLIO REVIEW RESPONSE)',
      '45': 'P2P PERSONAL LOAN',
      '46': 'P2P AUTO LOAN',
      '47': 'P2P EDUCATION LOAN',
      '66': 'EXPRESS MATCH - NEW LOAN APPLICATION',
      '69': 'SHORT TERM PERSONAL LOAN',
      '70': 'PRIORITY SECTOR - GOLD LOAN',
      '71': 'TEMPORARY OVERDRAFT',
      '67': 'Buy Now Pay Later'
    };


    function mapCreditData(data) {
      return data?.filter(item => item.actionStatus !== "inactive").map(item=> ({
        index: item.index || "",
        loanType: accountTypeMap[item.accountType] || '',
        ownership: ownershipMap[item.ownershipIndicator] || '',
        loanAmount: item.highCreditAmount || 0,
        currentOutstanding: item.currentBalance || 0,
        monthlyEMI: item.emiAmount || 0,
        loanStatus: item.loanStatus || "",
        obligated: item.obligated || "",
        actionStatus: item.actionStatus || "active",
        obligationConsidered: ["yes", "YES", "Yes"].includes(item.obligated) ? item.emiAmount : 0
      })) || [];
    }
    // console.log()

    const applicantActiveLoanDetail = cibilData?.applicantCibilDetail?.[0]?.creditData?.[0]?.accounts || [];
    const applicantLoans = mapCreditData(applicantActiveLoanDetail);
    // console.log(applicantLoans,"applicantLoans............")
    const coApplicantLoans = cibilData?.coApplicantData?.flatMap(coApplicant =>
        coApplicant.coApplicantCibilDetail.flatMap(detail =>
            mapCreditData(detail?.creditData?.[0]?.accounts || [])
        )
    ) || [];
    
    // ✅ Combine applicant and co-applicant loans
    const mappedLoans = [...applicantLoans, ...coApplicantLoans];
  // console.log(mappedLoans,"mappedLoans")
      // Log the formattedDistance after awaiting the result
      // console.log(formattedDistance, "formattedDistance",approverData,"approverData",employeeData);
      // console.log(applicantLoanDetails,"applicantLoanDetails applicantLoanDetails")
      // console.log(applicantLoanDetails[2]?.emiAmount,"applicantLoanDetails[2]?.emiAmount")

      const missingFields = [];
      if (!employeeData?.employeName) missingFields.push("EmployeeName is required");
      if (!employeeData?.employeUniqueId) missingFields.push("EmployeeUniqueID is required");
      if (!employeeData?.branchId?.name) missingFields.push("BranchName is required");
      if (!employeeData?.branchId?.state) missingFields.push("State is required");
      if (!partnerNameData?.partnerId?.fullName) missingFields.push("PartnerFullName is required");

      if (!appData?.fullName) missingFields.push("AppFullName is required");
      if (!appData?.dob) missingFields.push("AppBod is required");
      if (!appData?.age) missingFields.push("AppAge is required");
      if (!appData?.businessType) missingFields.push("AppBusinessType is required");
      if (!appData?.gender) missingFields.push("AppGender is required");
      if (!appData?.mobileNo) missingFields.push("AppMobileNo is required");
      if (!appData?.email) missingFields.push("appEmail is required");
      if (!appData?.permanentAddress.addressLine1) missingFields.push("appAddress is required");
      if (!cibilData?.applicantCibilScore) missingFields.push("appCibilScore is required");

      if (!CoappData[0]?.fullName) missingFields.push("CoAppOneFullName is required");
      if (!CoappData[0]?.dob) missingFields.push("CoAppOneDob is required");
      if (!CoappData[0]?.age) missingFields.push("coAppOneAge is required");
      if (!CoappData[0]?.businessType) missingFields.push("coAppBusinessType is required");
      if (!CoappData[0]?.gender) missingFields.push("coAppGender is required");
      if (!CoappData[0]?.relationWithApplicant) missingFields.push("coAppOneRelationWithApplicant is required");
      if (!CoappData[0]?.mobileNo) missingFields.push("coAppMobileNo is required");
      if (!CoappData[0]?.email) missingFields.push("coAppOneEmail required");
      if (!CoappData[0]?.permanentAddress?.addressLine1) missingFields.push("coAppOneAddress is required");
      if (!cibilData?.coApplicantData[0]?.coApplicantCibilScore) missingFields.push("coAppOneCibilScore is required");
      
      if(Array.isArray(partnerData?.pdfSelection) && ["acc", "accg", "acccg","accc"].includes(partnerData?.pdfSelection)){
      if (!CoappData[1]?.fullName) missingFields.push("CoAppTwoFullName is required");
      if (!CoappData[1]?.dob) missingFields.push("CoAppTwoDob is required");
      if (!CoappData[1]?.age) missingFields.push("coAppTwoAge is required");
      if (!CoappData[1]?.businessType) missingFields.push("coAppTwoBusinessType is required");
      if (!CoappData[1]?.gender) missingFields.push("coAppGender is required");
      if (!CoappData[1]?.relationWithApplicant) missingFields.push("coAppTwoRelationWithApplicant is required");
      if (!CoappData[1]?.email) missingFields.push("coAppTwoEail is required");
      if (!CoappData[1]?.permanentAddress?.addressLine1) missingFields.push("coAppTwoAddress is required");
      if (!cibilData?.coApplicantData[1]?.coApplicantCibilScore) missingFields.push("coAppTwoCibilScore is required");

    }else if (Array.isArray(partnerData?.pdfSelection) && ["acg", "accg", "acccg"].includes(partnerData?.pdfSelection)){
      if (!gtrData?.fullName) missingFields.push("GtrFullName is required");
      if (!gtrData?.dob) missingFields.push("GtrDob is required");
      if (!gtrData?.age) missingFields.push("GtrAge is required");
      if (!gtrData?.gender) missingFields.push("GtrGender is required");
      if (!gtrData?.businessType) missingFields.push("GtrBusinessType is required");
      if (!gtrData?.relationWithApplicant) missingFields.push("gtrRelationWithApplicant is required");
      if (!gtrData?.mobileNo) missingFields.push("GtrMobileNo is required");
      if (!gtrData?.email) missingFields.push("gtrEmail is required");
      if (!gtrData?.permanentAddress?.addressLine1) missingFields.push("gtrAddress is required");
      if (!cibilData?.guarantorCibilScore) missingFields.push("gtrCibilScore is required");
    }
    // console.log(approverData?.sellerName?.trim(),"approverData",approverData?.nameOfDocumentHolder?.trim())
      if (!udyamDetail?.AddressOfFirm?.fullAddress) missingFields.push("WorkedAddress is required");
      if (!partnerData?.finalLoanAmount) missingFields.push("loanAmount is required");
      if (!partnerData?.tenureInMonth) missingFields.push("tenure is required");
      if (!partnerData?.roi) missingFields.push("roi is required");
      if (!partnerData?.emiAmount) missingFields.push("emi is required");
      if (!approverData?.distanceOfMap) missingFields.push("geo limit is required");
      if (!approverData?.propertyType) missingFields.push("propertyType is required");
      // if (!creditPdData?.property?.collateralsDetails?.classOfLocality) missingFields.push("geographicArea required");
      if (!approverData?.fullAddressOfProperty) missingFields.push("PropertyAddress is required");
      // if (!approverData?.nameOfDocumentHolder?.trim() || !approverData?.sellerName?.trim()) missingFields.push("PropertyOwnersName is required");
      if (!appData?.age) missingFields.push("PropertyownerAge is required");
      if (!approverData?.totalBuiltUpArea) missingFields.push("ConstructionArea is required");

      // if (!approverData?.fairMarketValueOfLand) missingFields.push("PropertyMarketValue is required");
      // if (!approverData?.Ltv) missingFields.push("ltv is required");
      // if (!milkData?.doingFromNoOfYears) missingFields.push("milkBusinessExperience is required");
      // if (!salaryData?.doingFromNoYears) missingFields.push("otherBusinessExperience is required");
      if (!appData?.noOfyearsAtCurrentAddress) missingFields.push("residenceStability is required");
      // if (!partnerData?.agricultureIncomeNew?.details[0]?.AreaInAcres) missingFields.push("agriculture  AreaInAcres is required");

      if (!bankStatementDetails?.bankDetails[0]?.bankName) missingFields.push("bankNameOne is required");
      if (!bankStatementDetails?.bankDetails[0]?.branchName) missingFields.push("branch is required");
      if (!bankStatementDetails?.bankDetails[0]?.acHolderName) missingFields.push("acHolderName is required");
      if (!bankStatementDetails?.bankDetails[0]?.accountNumber) missingFields.push("AccountNumOne is required");
      if (!bankStatementDetails?.bankDetails[0]?.ifscCode) missingFields.push("ifscCodeOne is required");
      if (!bankStatementDetails?.bankDetails[0]?.bankName) missingFields.push("bankNameSecond is required");
      if (!bankStatementDetails?.bankDetails[0]?.branchName) missingFields.push("branchNameSecond is required");
      if (!bankStatementDetails?.bankDetails[0]?.acHolderName) missingFields.push("acHolderNameSecond is required");
      if (!bankStatementDetails?.bankDetails[0]?.accountNumber) missingFields.push("AccountNumTwo is required");
      if (!bankStatementDetails?.bankDetails[0]?.ifscCode) missingFields.push("ifscCodeSecond is required");
      // if (!partnerData?.agricultureIncomeNew?.totalNetAnnualIncome) missingFields.push("totalNetAnnualncome is required");
      if (!partnerData?.agricultureIncomeNew?.details[0]?.AreaInAcres) missingFields.push("AreaInAcres is required");
      // if (!agriData?.nameOfAgriOwner[0]) missingFields.push("nameOfAgricultureOwner is required");
      if (!partnerData?.agricultureIncomeNew?.details[0]?.crop) missingFields.push("lastCropDetails is required");
      if (!creditPdData?.referenceDetails[0]?.name) missingFields.push("referenceOneName is required");
      if (!creditPdData?.referenceDetails[0]?.address) missingFields.push("referenceOneAddressOne is required");
      if (!creditPdData?.referenceDetails[0]?.relation) missingFields.push("referenceOneRelationOne is required");
      if (!creditPdData?.referenceDetails[0]?.mobileNumber) missingFields.push("referenceOneMobileNumberOne is required");
      if (!creditPdData?.referenceDetails[1]?.name) missingFields.push("referenceSecondName is required");
      if (!creditPdData?.referenceDetails[1]?.address) missingFields.push("referenceSecondAddressOne is required");
      if (!creditPdData?.referenceDetails[1]?.relation) missingFields.push("referenceSecondRelation  is required");
      if (!creditPdData?.referenceDetails[1]?.mobileNumber) missingFields.push("referenceSecondMobileNumber is required");
      if (!partnerData?.agricultureIncomeNew?.details[0]?.district) missingFields.push("districtOne is required");
      if (!partnerData?.agricultureIncomeNew?.details[0]?.season) missingFields.push("seasonOne is required");
      if (!partnerData?.agricultureIncomeNew?.details[0]?.AreaInAcres) missingFields.push("AreaInAcresOne is required");
      if (!partnerData?.agricultureIncomeNew?.details[0]?.crop) missingFields.push("cropOne is required");
      if (!partnerData?.agricultureIncomeNew?.details[0]?.netIncome) missingFields.push("netIncomeOne is required");
      if (!partnerData?.agricultureIncomeNew?.details[1]?.season) missingFields.push("seasonSecond is required");
      if (!partnerData?.agricultureIncomeNew?.details[1]?.AreaInAcres) missingFields.push("AreaInAcresSecond is required");
      if (!partnerData?.agricultureIncomeNew?.details[1]?.crop) missingFields.push("cropSecond is required");
      if (!partnerData?.agricultureIncomeNew?.details[1]?.netIncome) missingFields.push("netIncomeSecond is required");
      // if (!partnerData?.agricultureIncomeNew?.totalNetAnnualncome) missingFields.push("agriculture annual income is required");
      if (!partnerData?.agricultureIncomeNew?.details[1]?.crop) missingFields.push("cropSecond is required");

 

      // console.log(missingFields,"missingFields")
      if (missingFields.length > 0) {
        console.log("Missing fields detected:", missingFields);
        return badRequest(res, `Missing fields: ${missingFields.join(", ")}`)
        // throw { status: 400, message: `Missing fields: ${missingFields.join(", ")}` };
      }
      
      // This code will only execute if there are no missing fields
      // console.log("sjfroihiodfghoirhgofh");
      let updates = [];
      updates.push(updateCell("employeeName", employeeData?.employeName));
      updates.push(updateCell("employeeCode", employeeData?.employeUniqueId));
      updates.push(updateCell("branchName", employeeData?.branchId?.name));
      updates.push(updateCell("branchState", employeeData?.branchId?.state));
      updates.push(updateCell("loanTypeName", loanType));
      updates.push(
        updateCell(
          "partnerName",
          partnerNameData?.partnerId?.fullName?.toUpperCase()
        )
      );
      updates.push(
        updateCell(
          "partnerHeadingName",
          partnerNameData?.partnerId?.fullName?.toUpperCase()
        )
      );
      updates.push(updateCell("fullName", appData?.fullName));
      updates.push(updateCell("CoappFullName1", CoappData[0]?.fullName));
      updates.push(updateCell("CoappFullName2", CoappData[1]?.fullName));
      updates.push(updateCell("gtrFullName", gtrData?.fullName));
      updates.push(updateCell("dob", formatDate(appData?.dob) || ""));
      updates.push(
        updateCell("CoappDob1", formatDate(CoappData[0]?.dob) || "")
      );
      updates.push(
        updateCell("CoappDob2", formatDate(CoappData[1]?.dob) || "")
      );
      updates.push(updateCell("gtrDob", formatDate(gtrData?.dob) || ""));
      updates.push(updateCell("gtrAge", gtrData?.age || ""));
      updates.push(updateCell("age", appData?.age));
      updates.push(updateCell("CoappAge1", CoappData[0]?.age));
      updates.push(updateCell("CoappAge2", CoappData[1]?.age));
      updates.push(
        updateCell("profileOfCustomer", partnerData?.customerProfile)
      ); //
      updates.push(updateCell("sector", "AGRICULTURE"));
      updates.push(updateCell("industry", "FARMING"));
      updates.push(updateCell("gender", appData?.gender));
      updates.push(updateCell("CoappGender", CoappData[0]?.gender));
      updates.push(updateCell("CoappGender2", CoappData[1]?.gender));
      updates.push(updateCell("gtrGender", gtrData?.gender));
      updates.push(updateCell("relationship", "self"));
      updates.push(
        updateCell("Coapprelationship", CoappData[0]?.relationWithApplicant)
      );
      updates.push(
        updateCell("Coapprelationship2", CoappData[1]?.relationWithApplicant)
      );
      updates.push(
        updateCell("gtrrelationship", gtrData?.relationWithApplicant)
      );
      updates.push(updateCell("mobileNo", appData?.mobileNo));
      updates.push(updateCell("CoappMobileNo", CoappData[0]?.mobileNo));
      updates.push(updateCell("CoappMobileNo2", CoappData[1]?.mobileNo));
      updates.push(updateCell("gtrMobileNo", gtrData?.mobileNo));
      updates.push(updateCell("email", appData?.email));
      updates.push(updateCell("CoappEmail", CoappData[0]?.email));
      updates.push(updateCell("CoappEmail2", CoappData[1]?.email));
      updates.push(updateCell("gtrEmail", gtrData?.email));
      updates.push(
        updateCell("address", appData?.permanentAddress.addressLine1)
      );
      updates.push(
        updateCell("CoappAddress", CoappData[0]?.permanentAddress?.addressLine1)
      );
      updates.push(
        updateCell(
          "CoappAddress2",
          CoappData[1]?.permanentAddress?.addressLine1
        )
      );
      updates.push(
        updateCell("gtrAddress", gtrData?.permanentAddress?.addressLine1)
      );
      updates.push(
        updateCell(
          "workAddress",
          udyamDetail?.AddressOfFirm?.fullAddress
        )
      );
      updates.push(
        updateCell("cibil", getCibilScore(cibilData?.applicantCibilScore))
      );
      updates.push(
        updateCell(
          "CoappCibil",
          getCibilScore(cibilData?.coApplicantData[0]?.coApplicantCibilScore)
        )
      );
      updates.push(
        updateCell(
          "CoappCibil2",
          getCibilScore(cibilData?.coApplicantData[1]?.coApplicantCibilScore)
        )
      );
      updates.push(updateCell("gtrCibil", cibilData?.guarantorCibilScore));
      updates.push(updateCell("loanAmount", partnerData?.finalLoanAmount));
      updates.push(updateCell("tenure", partnerData?.tenureInMonth));
      updates.push(updateCell("roi", `${partnerData?.roi}%`));
      updates.push(updateCell("emi", `Rs.${getRoundedEMI(partnerData?.emiAmount)}`));
      updates.push(updateCell("endUseOfLoans", partnerData?.EndUseOfLoan?.name));
      updates.push(updateCell("geoLimit", `${approverData?.distanceOfMap}KM. from branch`));
      updates.push(updateCell("propertyType", approverData?.propertyType)); //collateral
      updates.push(
        updateCell(
          "geographicArea",
          creditPdData?.property?.collateralsDetails?.classOfLocality
        )
      );
      updates.push(
        updateCell("PropertyAddress", approverData?.fullAddressOfProperty)
      );
      updates.push(
        updateCell("PropertyOwnersName", approverData?.nameOfDocumentHolder || approverData?.sellerName)
      );
      updates.push(updateCell("PropertyownerAge", appData?.age));
      updates.push(
        updateCell("ConstructionArea", `${approverData?.totalBuiltUpArea} SQ FT`)
      );
      updates.push(updateCell("legal", "Yes"));
      updates.push(updateCell("technical", "Yes"));
      updates.push(
        updateCell("PropertyMarketValue", approverData?.fairMarketValueOfLand)
      );
      updates.push(updateCell("LTV", approverData?.Ltv));
      updates.push(
        updateCell(
          "agricultureExperience",
          agriData?.agriDoingFromNoOfYears || ""
        )
      );
      updates.push(
        updateCell("milkBusinessExperience", milkData?.doingFromNoOfYears || "")
      );
      updates.push(
        updateCell(
          "otherBusinessExperience",
          salaryData?.doingFromNoYears || ""
        )
      );
      updates.push(
        updateCell(
          "residenceStability",
          appData?.noOfyearsAtCurrentAddress
        )
      );
      updates.push(
        updateCell(
          "agricultureLand",
          Number(partnerData?.agricultureIncomeNew?.details[0]?.AreaInAcres)?.toFixed(2) || ""
        )
      );
      updates.push(
        updateCell("noOfCattles", milkData?.noOfMilkGivingCattles || "")
      );
      //income consider
      updates.push(
        updateCell(
          "agriIncome",
          Number(partnerData?.agricultureIncomeNew?.totalNetAnnualIncome)?.toFixed(2) || ""
        )
      );
      updates.push(
        updateCell(
          "milkIncome",
          Number(partnerData?.milkIncomeCalculationNew?.totalNetAnnualIncomeAsPerCattle)?.toFixed(2) || ""
        )
      );
      updates.push(
        updateCell(
          "incomeFormOtherSource",
          Number(partnerData?.otherIncomeNew?.totalNetAnnualIncomeFromOther)?.toFixed(2) || ""
        )
      );
      updates.push(
        updateCell(
            "totalAnnualIncomeconsider",
            getRoundedEMI(
                Number(partnerData?.agricultureIncomeNew?.totalNetAnnualIncome ?? 0) +
                Number(partnerData?.milkIncomeCalculationNew?.totalNetAnnualIncomeAsPerCattle ?? 0) +
                Number(partnerData?.otherIncomeNew?.totalNetAnnualIncomeFromOther ?? 0)
            ) || "0"
        )
    );
    
      // updates.push(updateCell('noConsideredForEligibility', ""));
      updates.push(
        updateCell(
          "bankNameOne",
          bankStatementDetails?.bankDetails[0]?.bankName
        )
      );
      updates.push(
        updateCell(
          "bankBranchOne",
          bankStatementDetails?.bankDetails[0]?.branchName
        )
      );
      updates.push(
        updateCell(
          "nameAsPerBankOne",
          bankStatementDetails?.bankDetails[0]?.acHolderName
        )
      );
      updates.push(
        updateCell(
          "AccountNumOne",
          bankStatementDetails?.bankDetails[0]?.accountNumber
        )
      );
      updates.push(
        updateCell(
          "ifscCodeOne",
          bankStatementDetails?.bankDetails[0]?.ifscCode
        )
      );
      updates.push(updateCell("MicrCodeOne", ""));
      updates.push(
        updateCell(
          "bankNameTwo",
          bankStatementDetails?.bankDetails[0]?.bankName
        )
      );
      updates.push(
        updateCell(
          "bankBranchTwo",
          bankStatementDetails?.bankDetails[0]?.branchName
        )
      );
      updates.push(
        updateCell(
          "nameAsPerBankTwo",
          bankStatementDetails?.bankDetails[0]?.acHolderName
        )
      );
      updates.push(
        updateCell(
          "AccountNumTwo",
          bankStatementDetails?.bankDetails[0]?.accountNumber
        )
      );
      updates.push(
        updateCell(
          "ifscCodeTwo",
          bankStatementDetails?.bankDetails[0]?.ifscCode
        )
      );
      updates.push(updateCell("MicrCodeTwo", ""));
      updates.push(
        updateCell(
          "GrossIncomeFromagriculture",
          Number(partnerData?.agricultureIncomeNew?.totalNetAnnualIncome)?.toFixed(2)
        )
      ); // aggree business
      updates.push(
        updateCell(
          "noOfAcreAgriculture",
          Number(partnerData?.agricultureIncomeNew?.details[0]?.AreaInAcres)?.toFixed(2)|| ""
        )
      );
      updates.push(
        updateCell(
          "nameOfAgricultureOwner",
          agriData?.nameOfAgriOwner[0] || ""
        )
      );
      updates.push(updateCell("noOfAgricultureOwner", partnerData?.agricultureIncomeNew?.noOfAgricultureOwner || ""));
      updates.push(
        updateCell(
          "yearOfDoingAgriculture",
          agriData?.agriDoingFromNoOfYears || ""
        )
      );

      updates.push(
        updateCell(
            "lastCropDetails", 
            Array.isArray(partnerData?.agricultureIncomeNew?.lastCropDetail) 
                ? partnerData.agricultureIncomeNew.lastCropDetail.join(", ") 
                : ""
        )
    );

    updates.push(
      updateCell(
          "lastCropSaleDetails", 
          `${partnerData?.agricultureIncomeNew?.details?.[0]?.crop || ""},${partnerData?.agricultureIncomeNew?.details?.[1]?.crop || ""}, ${partnerData?.agricultureIncomeNew?.details?.[2]?.crop || ""}`.replace(/,\s*$/, "").trim()
      )
  );

      updates.push(
        updateCell("serveyNoAgriculture", agriData?.agriLandSurveyNo || "")
      );
      updates.push(updateCell("lastCropSalesInCase", ""));
      updates.push(updateCell("LastCropSalesAmount", ""));

      updates.push(
        updateCell(
          "GrossIncomeFromMilk",
          partnerData?.milkIncomeCalculationNew?.totalNetAnnualIncomeAsPerCattle
        )
      ); // milk business
      updates.push(
        updateCell("totalCatelOfMilk", milkData?.noOfMilkGivingCattles || "")
      );
      updates.push(updateCell("totalBirds", "0"));
      updates.push(
        updateCell("dailyMilkOfMilk", milkData?.totalMilkSupplyPerDay || "")
      );
      updates.push(
        updateCell("nameOfDairyOfMilk", milkData?.nameOfDairy || "")
      );
      updates.push(
        updateCell("adressOfDailyOfMilk", milkData?.dairyAddress || "")
      );
      updates.push(
        updateCell("conctactNumberOfMilk", milkData?.dairyOwnerMobNo || "")
      );
      updates.push(
        updateCell(
          "yearOfDoingMilkBussinessOfMilk",
          milkData?.doingFromNoOfYears || ""
        )
      );
      updates.push(
        updateCell(
          "yearOfMilkProvideAtAboveOfMilk",
          milkData?.milkprovideFromSinceYear || ""
        )
      );
      updates.push(
        updateCell(
          "annualIncomeFromMilk",
          partnerData?.milkIncomeCalculationNew?.totalNetAnnualIncomeAsPerCattle
        )
      ); //income

      updates.push(
        updateCell(
          "GrossIncomeFromOtherIncome",
          partnerData?.otherIncomeNew?.totalNetAnnualIncomeFromOther
        )
      ); //income
      updates.push(
        updateCell("incomeReciveForm", otherData?.discriptionOfBusiness)
      );
      updates.push(
        updateCell(
          "yearlyIncome",
          partnerData?.otherIncomeNew?.OverallTotalNetAnnualExpence
        )
      );
      updates.push(
        updateCell(
          "totalAnnualIncomes",
          partnerData?.netCalculationNew?.OverallTotalNetAnnualIncome
        )
      );

      updates.push(
        updateCell(
          "grossExpensesFromAgriculture",
          partnerData?.expensesDetails?.OverallTotalNetAnnualExpence
        )
      );
      updates.push(
        updateCell(
          "grossExpensesFromMilk",
          partnerData?.expensesDetails?.grossExpensesFromMilk
        )
      );
      updates.push(
        updateCell(
          "grossExpensesFromExisting",
          partnerData?.expensesDetails?.grossExpensesFromExisting
        )
      );

      updates.push(
        updateCell("nameOne", creditPdData?.referenceDetails[0]?.name)
      ); //referance
      updates.push(
        updateCell("relationOne", creditPdData?.referenceDetails[0]?.address)
      );
      updates.push(
        updateCell("addressOne", creditPdData?.referenceDetails[0]?.relation)
      );
      updates.push(
        updateCell("mobileOne", creditPdData?.referenceDetails[0]?.mobileNumber)
      );
      updates.push(
        updateCell("nameTwo", creditPdData?.referenceDetails[1]?.name)
      ); //referance
      updates.push(
        updateCell("relationTwo", creditPdData?.referenceDetails[1]?.address)
      );
      updates.push(
        updateCell("addressTwo", creditPdData?.referenceDetails[1]?.relation)
      );
      updates.push(
        updateCell("mobileTwo", creditPdData?.referenceDetails[1]?.mobileNumber)
      );

      //cibil details
      updates.push(
        updateCell(
          "institutionOne",
          mappedLoans[0]?.loanType || "0"
        )
      ); //dependent Three
      updates.push(
        updateCell(
          "loanAmountOne",
          mappedLoans[0]?.loanAmount || "0"
        )
      );
      updates.push(
        updateCell(
          "emiMonthlyOne",
          mappedLoans[0]?.monthlyEMI || "0"
        )
      );
      updates.push(
        updateCell(
          "currentOsOne",
          mappedLoans[0]?.currentOutstanding || "0"
        )
      );
      updates.push(
        updateCell(
            "emiYearlyOne",
            Number(mappedLoans[0]?.monthlyEMI ?? 0) * 12 || "0"
        )
    );

      updates.push(
        updateCell(
          "institutionTwo",
          mappedLoans[1]?.loanType || "0"
        )
      ); //dependent Three
      updates.push(
        updateCell(
          "loanAmountTwo",
          mappedLoans[1]?.loanAmount || "0"
        )
      );
      updates.push(
        updateCell(
          "emiMonthlyTwo",
          mappedLoans[1]?.monthlyEMI || "0"
        )
      );
      updates.push(
        updateCell(
          "currentOsTwo",
          mappedLoans[1]?.currentOutstanding || "0"
        )
      );
      updates.push(
        updateCell(
          "emiYearlyTwo",
          Number(mappedLoans[1]?.monthlyEMI ?? 0) * 12 || "0"
        )
      );

      updates.push(
        updateCell(
          "institutionThree",
          mappedLoans[2]?.loanType || "0"
        )
      ); //dependent Three
      updates.push(
        updateCell(
          "loanAmountThree",
          mappedLoans[2]?.loanAmount || "0"
        )
      );
      updates.push(
        updateCell(
          "emiMonthlyThree",
          mappedLoans[2]?.monthlyEMI || "0"
        )
      );
      updates.push(
        updateCell(
          "currentOsThree",
          mappedLoans[2]?.currentOutstanding || "0"
        )
      );
      updates.push(
        updateCell(
          "emiYearlyThree",
          Number(mappedLoans[2]?.monthlyEMI ?? 0) * 12 || "0"
        )
      );

      updates.push(
        updateCell(
          "institutionFour",
          mappedLoans[3]?.loanType || "0"
        )
      ); //dependent Three
      updates.push(
        updateCell(
          "loanAmountFour",
          mappedLoans[3]?.loanAmount || "0"
        )
      );
      updates.push(
        updateCell(
          "emiMonthlyFour",
          mappedLoans[3]?.monthlyEMI || "0"
        )
      );
      updates.push(
        updateCell(
          "currentOsFour",
          mappedLoans[3]?.currentOutstanding || "0"
        )
      );
      updates.push(
        updateCell(
          "emiYearlyFour",
          Number(mappedLoans[3]?.monthlyEMI ?? 0) * 12 || "0"
        )
      );
//five
      updates.push(
        updateCell(
          "institutionFive",
          mappedLoans[4]?.loanType || "0"
        )
      ); //dependent Three
      updates.push(
        updateCell(
          "loanAmountFive",
          mappedLoans[4]?.loanAmount || "0"
        )
      );
      updates.push(
        updateCell(
          "emiMonthlyFive",
          mappedLoans[4]?.monthlyEMI || "0"
        )
      );
      updates.push(
        updateCell(
          "currentOsFive",
          mappedLoans[4]?.currentOutstanding || "0"
        )
      );
      updates.push(
        updateCell(
          "emiYearlyFive",
          Number(mappedLoans[4]?.monthlyEMI ?? 0) * 12 || "0"
        )
      );

      //six
      updates.push(
        updateCell(
          "institutionSix",
          mappedLoans[5]?.loanType || "0"
        )
      ); //dependent Three
      updates.push(
        updateCell(
          "loanAmountSix",
          mappedLoans[5]?.loanAmount || "0"
        )
      );
      updates.push(
        updateCell(
          "emiMonthlySix",
          mappedLoans[5]?.monthlyEMI || "0"
        )
      );
      updates.push(
        updateCell(
          "currentOsSix",
          mappedLoans[5]?.currentOutstanding || "0"
        )
      );
      updates.push(
        updateCell(
          "emiYearlySix",
          Number(mappedLoans[5]?.monthlyEMI ?? 0) * 12 || "0"
        )
      );

      //seven
      updates.push(
        updateCell(
          "institutionSeven",
          mappedLoans[6]?.loanType || "0"
        )
      ); //dependent Three
      updates.push(
        updateCell(
          "loanAmountSeven",
          mappedLoans[6]?.loanAmount || "0"
        )
      );
      updates.push(
        updateCell(
          "emiMonthlySeven",
          mappedLoans[6]?.monthlyEMI || "0"
        )
      );
      updates.push(
        updateCell(
          "currentOsSeven",
          mappedLoans[6]?.currentOutstanding || "0"
        )
      );
      updates.push(
        updateCell(
          "emiYearlySeven",
          Number(mappedLoans[6]?.monthlyEMI ?? 0) * 12 || "0"
        )
      );

      //eight
      updates.push(
        updateCell(
          "institutionEight",
          mappedLoans[7]?.loanType || "0"
        )
      ); //dependent Three
      updates.push(
        updateCell(
          "loanAmountEight",
          mappedLoans[7]?.loanAmount || "0"
        )
      );
      updates.push(
        updateCell(
          "emiMonthlyEight",
          mappedLoans[7]?.monthlyEMI || "0"
        )
      );
      updates.push(
        updateCell(
          "currentOsEight",
          mappedLoans[7]?.currentOutstanding || "0"
        )
      );
      updates.push(
        updateCell(
          "emiYearlyEight",
          Number(mappedLoans[7]?.monthlyEMI ?? 0) * 12 || "0"
        )
      );

//nine

        updates.push(
          updateCell(
            "institutionNine",
            mappedLoans[8]?.loanType || "0"
          )
        ); //dependent Three
        updates.push(
          updateCell(
            "loanAmountNine",
            mappedLoans[8]?.loanAmount || "0"
          )
        );
        updates.push(
          updateCell(
            "emiMonthlyNine",
            mappedLoans[8]?.monthlyEMI || "0"
          )
        );
        updates.push(
          updateCell(
            "currentOsNine",
            mappedLoans[8]?.currentOutstanding || "0"
          )
        );
        updates.push(
          updateCell(
            "emiYearlyNine",
            Number(mappedLoans[8]?.monthlyEMI ?? 0) * 12 || "0"
          )
        );
//ten

          updates.push(
            updateCell(
              "institutionTen",
              mappedLoans[9]?.loanType || "0"
            )
          ); //dependent Three
          updates.push(
            updateCell(
              "loanAmountTen",
              mappedLoans[9]?.loanAmount || "0"
            )
          );
          updates.push(
            updateCell(
              "emiMonthlyTen",
              mappedLoans[9]?.monthlyEMI || "0"
            )
          );
          updates.push(
            updateCell(
              "currentOsTen",
              mappedLoans[9]?.currentOutstanding || "0"
            )
          );
          updates.push(
            updateCell(
              "emiYearlyTen",
              Number(mappedLoans[9]?.monthlyEMI ?? 0) * 12 || "0"
            )
          );

          const totalEMI = mappedLoans
          .filter(loan => loan.obligated === 'Yes') // Sirf obligated 'Yes' wale loans filter karna
          .reduce((sum, loan) => sum + (Number(loan.monthlyEMI) || 0) * 12, 0);
          
          // console.log("Raw Total EMI Before Rounding:", totalEMI);
          
          const roundedMonthlyEMI = getRoundedEMI(totalEMI / 12);

      updates.push(
        updateCell(
          "totalEmiMonthly",
          roundedMonthlyEMI  || "0"
        )
      )      
    
      updates.push(
        updateCell(
          "netAnnualIncome",
          partnerData?.netCalculationNew?.OverallTotalNetAnnualIncome || "0"
        )
      );
    
    // console.log("Rounded EMI After Function:", roundedEMI);
    
    updates.push(updateCell("netAnnualExpenses", totalEMI));

    updates.push(
      updateCell(
        "grossExpensesFromExisting",
        totalEMI
      )
    );

      updates.push(
        updateCell(
          "netMonthlyIncomess",
          partnerData?.netCalculationNew?.overAllTotalNetMonthlyIncome || "0"
        )
      );

      updates.push(updateCell("foir", `${(partnerData?.netCalculationNew?.foir)}%`));

      updates.push(
        updateCell(
          "districtOne",
          partnerData?.agricultureIncomeNew?.details[0]?.district
        )
      );
      updates.push(
        updateCell(
          "seasonOne",
          partnerData?.agricultureIncomeNew?.details[0]?.season
        )
      );
      updates.push(
        updateCell(
          "AreaCultivationAcresOne",
          Number(partnerData?.agricultureIncomeNew?.details[0]?.AreaInAcres)?.toFixed(2)
        )
      );
      updates.push(
        updateCell(
          "cropOne",
          partnerData?.agricultureIncomeNew?.details[0]?.crop
        )
      );
      updates.push(
        updateCell(
          "netIncomeOne",
          Number(partnerData?.agricultureIncomeNew?.details[0]?.netIncome)?.toFixed(2)
        )
      );

      updates.push(
        updateCell(
          "districtTwo",
          partnerData?.agricultureIncomeNew?.details[1]?.district
        )
      );
      updates.push(
        updateCell(
          "seasonTwo",
          partnerData?.agricultureIncomeNew?.details[1]?.season
        )
      );
      updates.push(
        updateCell(
          "AreaCultivationAcresTwo",
          Number(partnerData?.agricultureIncomeNew?.details[1]?.AreaInAcres)?.toFixed(2)
        )
      );
      updates.push(
        updateCell(
          "cropTwo",
          partnerData?.agricultureIncomeNew?.details[1]?.crop
        )
      );
      updates.push(
        updateCell(
          "netIncomeTwo",
          Number(partnerData?.agricultureIncomeNew?.details[1]?.netIncome)?.toFixed(2)
        )
      );

      updates.push(
        updateCell(
          "districtThree",
          partnerData?.agricultureIncomeNew?.details[2]?.district
        )
      );
      updates.push(
        updateCell(
          "seasonThree",
          partnerData?.agricultureIncomeNew?.details[2]?.season
        )
      );
      updates.push(
        updateCell(
          "AreaCultivationAcresThree",
          Number(partnerData?.agricultureIncomeNew?.details[2]?.AreaInAcres)?.toFixed(2)
        )
      );
      updates.push(
        updateCell(
          "cropThree",
          partnerData?.agricultureIncomeNew?.details[2]?.crop
        )
      );
      updates.push(
        updateCell(
          "netIncomeThree",
          Number(partnerData?.agricultureIncomeNew?.details[2]?.netIncome)?.toFixed(2)
        )
      );

      updates.push(
        updateCell(
          "agreeTotal",
         Number(partnerData?.agricultureIncomeNew?.totalNetAnnualIncome)?.toFixed(2)
        )
      );

      // Remove null updates (in case there are any invalid field mappings)
      const validUpdates = updates.filter((update) => update !== null);

      // Update the spreadsheet
      if (validUpdates.length > 0) {
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId,
          requestBody: {
            data: validUpdates,
            valueInputOption: "RAW",
          },
        });
      }

      // Prepare data for appending a new row
      const nextRowIndex = rows.length + 1; // 0-indexed, appending to the last row
      const newRow = [""];

      // Append the new row
      const appendUpdate = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A${nextRowIndex + 1}`,
        valueInputOption: "RAW",
        requestBody: {
          values: [newRow],
        },
      });

      // Construct the export URL for the specified spreadsheet
      const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx&sheet=${sheetName}`;

      // Get the access token
      const token = await authClient.getAccessToken();

      // Download the file using Axios with the access token
      const response = await axios.get(exportUrl, {
        responseType: "stream",
        headers: {
          Authorization: `Bearer ${token.token}`,
        },
      });

      // Set response headers for file download
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${sheetName}.xlsx"`
      );

      // Pipe the file stream to the response
      response.data.pipe(res);
    }
   //grow money
   else if (
    partnerNameData?.partnerId?.fullName == "grow money capital pvt ltd" ||
    partnerNameData?.partnerId?.fullName == "GROW MONEY CAPITAL PVT LTD"
  ) {
    console.log("in grow block")
    const spreadsheetId = "1CcQnS4UExHM_gYERefoc6lYBY4xC36Ps3Oh2f6wbq3A"; // Your spreadsheet ID
    const sheetName = "Sheet1"; // Your sheet name
    const sheet2Name = "Sheet2";  

    const auth = new google.auth.GoogleAuth({
      credentials, // Your credentials object or JSON key file
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.readonly",
      ],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    // Fetch data from the sheet
    const responses = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:Z`, // Fetch entire sheet or range you want
    });

    const rows = responses.data.values;
    // console.log(rows, "rowsrowsrowsrows");
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "No data found in the sheet" });
    }

    // Field mappings
    const fieldMappings = {
      borrowerName: { row: 4, col: 1 }, // A5 (row index starts from 0)
      appOccupation: { row: 4, col: 4 }, // D5
      dob: { row: 4, col: 5 }, // E5
      age: { row: 4, col: 6 },
      sex: { row: 4, col: 7 },
      caste: { row: 4, col: 8 },
      religion: { row: 4, col: 9 },
      maritalStatus: { row: 4, col: 10 },
      telephoneNo: { row: 4, col: 11 },
      relationshipWithCustomer: { row: 4, col: 12 },
      cibil: { row: 4, col: 13 },

      coBorrowerName: { row: 5, col: 1 }, //co-app
      coOccupation: { row: 5, col: 4 },
      coDob: { row: 5, col: 5 },
      coAge: { row: 5, col: 6 },
      coSex: { row: 5, col: 7 },
      coCaste: { row: 5, col: 8 },
      coReligion: { row: 5, col: 9 },
      coMaritalStatus: { row: 5, col: 10 },
      coTelephoneNo: { row: 5, col: 11 },
      coRelationshipWithCustomer: { row: 5, col: 12 },
      coCibil: { row: 5, col: 13 },

      coTwoBorrowerName: { row: 6, col: 1 }, //co-app two
      coTwoOccupation: { row: 6, col: 4 },
      coTwoDob: { row: 6, col: 5 },
      coTwoAge: { row: 6, col: 6 },
      coTwoSex: { row: 6, col: 7 },
      coTwoCaste: { row: 6, col: 8 },
      coTwoReligion: { row: 6, col: 9 },
      coTwoMaritalStatus: { row: 6, col: 10 },
      coTwoTelephoneNo: { row: 6, col: 11 },
      coTwoRelationshipWithCustomer: { row: 6, col: 12 },
      coTwoCibil: { row: 6, col: 13 },

      guarantorBorrowerName: { row: 9, col: 1 }, //Guarantor
      guarantorOccupation: { row: 9, col: 4 },
      guarantorDob: { row: 9, col: 5 },
      guarantorAge: { row: 9, col: 6 },
      guarantorSex: { row: 9, col: 9 },
      guarantorCaste: { row: 9, col: 8 },
      guarantorReligion: { row: 9, col: 9 },
      guarantorMaritalStatus: { row: 9, col: 10 },
      guarantorTelephoneNo: { row: 9, col: 11 },
      guarantorRelationshipWithCustomer: { row: 9, col: 12 },
      guarantorCibil: { row: 9, col: 13 },

      currentResidance: { row: 10, col: 1 }, //Guarantor
      appPropertyAddress: { row: 10, col: 5 },
      business: { row: 10, col: 8 },
      occupations: { row: 10, col: 11 },
      officeContact: { row: 10, col: 13 },

      loanAmount: { row: 11, col: 1 },
      roi: { row: 11, col: 3 },
      profile: { row: 11, col: 5 },
      product: { row: 11, col: 7 },
      typeOfProperty: { row: 11, col: 9 },
      purposeOfLoan: { row: 11, col: 11 },
      presentOwner: { row: 11, col: 13 },

      emiAmount: { row: 12, col: 1 },
      foirAmount: { row: 12, col: 3 },
      tenureMonthDetails: { row: 12, col: 5 },
      ltvDetails: { row: 12, col: 7 },
      moratoriumPeriodMonth: { row: 12, col: 9 },
      proposedOwner: { row: 12, col: 13 },

      natureOfBusiness: { row: 13, col: 1 },
      branch: { row: 13, col: 3 },
      totalIncomeDetails: { row: 13, col: 5 },
      natureOfIncome: { row: 13, col: 7 },
      averageBankingBalance: { row: 13, col: 9 },

      personalInfo: { row: 14, col: 2 },
      businessIncDetails: { row: 15, col: 2 },
      endUse: { row: 16, col: 2 },
      personMetDuringPd: { row: 17, col: 2 },
      propertyDetails: { row: 18, col: 2 },

      //depended
      dependentNameOne: { row: 20, col: 1 },
      dependentAgeOne: { row: 20, col: 3 },
      dependentRelationOne: { row: 20, col: 4 },
      dependentAnnualOne: { row: 20, col: 5 },
      dependentOccupationOne: { row: 20, col: 6 },
      dependentinstitutionOfStudentOne: { row: 20, col: 7 },
      dependentnameOfTheOrganisationOne: { row: 20, col: 11 },
      dependentdesignationOne: { row: 20, col: 12 },
      dependentdateOfJoiningOne: { row: 20, col: 13 },

      dependentNameTwo: { row: 21, col: 1 },
      AgeTwo: { row: 21, col: 3 },
      RelationTwo: { row: 21, col: 4 },
      AnnualTwo: { row: 21, col: 5 },
      OccupationTwo: { row: 21, col: 6 },
      institutionOfStudentTwo: { row: 21, col: 7 },
      nameOfTheOrganisationTwo: { row: 21, col: 11 },
      designationTwo: { row: 21, col: 12 },
      dateOfJoiningTwo: { row: 21, col: 13 },

      dependentNameThree: { row: 22, col: 1 },
      AgeThree: { row: 22, col: 3 },
      RelationThree: { row: 22, col: 4 },
      AnnualThree: { row: 22, col: 5 },
      OccupationThree: { row: 22, col: 6 },
      institutionOfStudentThree: { row: 22, col: 7 },
      nameOfTheOrganisationThree: { row: 22, col: 11 },
      designationThree: { row: 22, col: 12 },
      dateOfJoiningThree: { row: 22, col: 13 },

      dependentNameFour: { row: 23, col: 1 },
      AgeFour: { row: 23, col: 3 },
      RelationFour: { row: 23, col: 4 },
      AnnualFour: { row: 23, col: 5 },
      OccupationFour: { row: 23, col: 6 },
      institutionOfStudentFour: { row: 23, col: 7 },
      nameOfTheOrganisationFour: { row: 23, col: 11 },
      designationFour: { row: 23, col: 12 },
      dateOfJoiningFour: { row: 23, col: 13 },

      dependentNameFive: { row: 24, col: 1 },
      AgeFive: { row: 24, col: 3 },
      RelationFive: { row: 24, col: 4 },
      AnnualFive: { row: 24, col: 5 },
      OccupationFive: { row: 24, col: 6 },
      institutionOfStudentFive: { row: 24, col: 7 },
      nameOfTheOrganisationFive: { row: 24, col: 11 },
      designationFive: { row: 24, col: 12 },
      dateOfJoiningFive: { row: 24, col: 13 },
      //cibil

      institutionOne: { row: 27, col: 0 },
      loanTypeOne: { row: 27, col: 1 },
      loanAmountOne: { row: 27, col: 2 },
      currentOsOne: { row: 27, col: 3 },
      roiOne: { row: 27, col: 4 },
      ownershipOne: { row: 27, col: 5 },
      emiMonthlyOne: { row: 27, col: 6 },
      totalTenureOne: { row: 27, col: 7 },
      balanceTenureOne: { row: 27, col: 8 },
      loanStatusOne: { row: 27, col: 9 },
      ObligatedOne: { row: 27, col: 10 },
      ObligationConsideredOne: { row: 27, col: 11 },

      institutionTwo: { row: 28, col: 0 },
      loanTypeTwo: { row: 28, col: 1 },
      loanAmountTwo: { row: 28, col: 2 },
      currentOsTwo: { row: 28, col: 3 },
      roiTwo: { row: 28, col: 4 },
      ownershipTwo: { row: 28, col: 5 },
      emiMonthlyTwo: { row: 28, col: 6 },
      totalTenureTwo: { row: 28, col: 7 },
      balanceTenureTwo: { row: 28, col: 8 },
      loanStatusTwo: { row: 28, col: 9 },
      ObligatedTwo: { row: 28, col: 10 },
      ObligationConsideredTwo: { row: 28, col: 11 },

      institutionThree: { row: 29, col: 0 },
      loanTypeThree: { row: 29, col: 1 },
      loanAmountThree: { row: 29, col: 2 },
      currentOsThree: { row: 29, col: 3 },
      roiThree: { row: 29, col: 4 },
      ownershipThree: { row: 29, col: 5 },
      emiMonthlyThree: { row: 29, col: 6 },
      totalTenureThree: { row: 29, col: 7 },
      balanceTenureThree: { row: 29, col: 8 },
      loanStatusThree: { row: 29, col: 9 },
      ObligatedThree: { row: 29, col: 10 },
      ObligationConsideredThree: { row: 29, col: 11 },

      institutionFour: { row: 30, col: 0 },
      loanTypeFour: { row: 30, col: 1 },
      loanAmountFour: { row: 30, col: 2 },
      currentOsFour: { row: 30, col: 3 },
      roiFour: { row: 30, col: 4 },
      ownershipFour: { row: 30, col: 5 },
      emiMonthlyFour: { row: 30, col: 6 },
      totalTenureFour: { row: 30, col: 7 },
      balanceTenureFour: { row: 30, col: 8 },
      loanStatusFour: { row: 30, col: 9 },
      ObligatedFour: { row: 30, col: 10 },
      ObligationConsideredFour: { row: 30, col: 11 },

      applicantTotalObligation: { row: 33, col: 11 },

      totalIncome: { row: 37, col: 1 },
      obligation: { row: 37, col: 4 },
      emi: { row: 37, col: 8 },
      foir: { row: 37, col: 12 },
      ltv: { row: 49, col: 1 },

      institutionFive: { row: 31, col: 0 },
      loanTypeFive: { row: 31, col: 1 },
      loanAmountFive: { row: 31, col: 2 },
      currentOsFive: { row: 31, col: 3 },
      roiFive: { row: 31, col: 4 },
      ownershipFive: { row: 31, col: 5 },
      emiMonthlyFive: { row: 31, col: 6 },
      totalTenureFive: { row: 31, col: 7 },
      balanceTenureFive: { row: 31, col: 8 },
      loanStatusFive: { row: 31, col: 9 },
      ObligatedFive: { row: 31, col: 10 },
      ObligationConsideredFive: { row: 31, col: 11 },

      institutionSix: { row: 32, col: 0 },
      loanTypeSix: { row: 32, col: 1 },
      loanAmountSix: { row: 32, col: 2 },
      currentOsSix: { row: 32, col: 3 },
      roiSix: { row: 32, col: 4 },
      ownershipSix: { row: 32, col: 5 },
      emiMonthlySix: { row: 32, col: 6 },
      totalTenureSix: { row: 32, col: 7 },
      balanceTenureSix: { row: 32, col: 8 },
      loanStatusSix: { row: 32, col: 9 },
      ObligatedSix: { row: 32, col: 10 },
      ObligationConsideredSix: { row: 32, col: 11 },

      institutionSeven: { row: 33, col: 0 },
      loanTypeSeven: { row: 33, col: 1 },
      loanAmountSeven: { row: 33, col: 2 },
      currentOsSeven: { row: 33, col: 3 },
      roiSeven: { row: 33, col: 4 },
      ownershipSeven: { row: 33, col: 5 },
      emiMonthlySeven: { row: 33, col: 6 },
      totalTenureSeven: { row: 33, col: 7 },
      balanceTenureSeven: { row: 33, col: 8 },
      loanStatusSeven: { row: 33, col: 9 },
      ObligatedSeven: { row: 33, col: 10 },
      ObligationConsideredSeven: { row: 33, col: 11 },

      institutionEight: { row: 34, col: 0 },
      loanTypeEight: { row: 34, col: 1 },
      loanAmountEight: { row: 34, col: 2 },
      currentOsEight: { row: 34, col: 3 },
      roiEight: { row: 34, col: 4 },
      ownershipEight: { row: 34, col: 5 },
      emiMonthlyEight: { row: 34, col: 6 },
      totalTenureEight: { row: 34, col: 7 },
      balanceTenureEight: { row: 34, col: 8 },
      loanStatusEight: { row: 34, col: 9 },
      ObligatedEight: { row: 34, col: 10 },
      ObligationConsideredEight: { row: 34, col: 11 },

      institutionNine: { row: 35, col: 0 },
      loanTypeNine: { row: 35, col: 1 },
      loanAmountNine: { row: 35, col: 2 },
      currentOsNine: { row: 35, col: 3 },
      roiNine: { row: 35, col: 4 },
      ownershipNine: { row: 35, col: 5 },
      emiMonthlyNine: { row: 35, col: 6 },
      totalTenureNine: { row: 35, col: 7 },
      balanceTenureNine: { row: 35, col: 8 },
      loanStatusNine: { row: 35, col: 9 },
      ObligatedNine: { row: 35, col: 10 },
      ObligationConsideredNine: { row: 35, col: 11 },

      institutionTen: { row: 36, col: 0 },
      loanTypeTen: { row: 36, col: 1 },
      loanAmountTen: { row: 36, col: 2 },
      currentOsTen: { row: 36, col: 3 },
      roiTen: { row: 36, col: 4 },
      ownershipTen: { row: 36, col: 5 },
      emiMonthlyTen: { row: 36, col: 6 },
      totalTenureTen: { row: 36, col: 7 },
      balanceTenureTen: { row: 36, col: 8 },
      loanStatusTen: { row: 36, col: 9 },
      ObligatedTen: { row: 36, col: 10 },
      ObligationConsideredTen: { row: 36, col: 11 },

      valuationValueOne: { row: 39, col: 1 },
      valuationDoneBy: { row: 39, col: 3 },
      propertyAddress: { row: 40, col: 1 },
      propertySize: { row: 41, col: 1 },
      marketLandValue: { row: 43, col: 1 },
      marketConstructionValue: { row: 43, col: 2 },
      marketAmenitiesValue: { row: 43, col: 3 },
      marketTotalValuesss: { row: 43, col: 4 },
      realizableLandValue: { row: 44, col: 1 },
      valuationOne: { row: 18, col: 9 },
      ltv: { row: 49, col: 1 },
      valuationValuethree: { row: 47, col: 4 },

      bankAccountNoApp: { row: 40, col: 9 },
      typeOfAccApp: { row: 41, col: 9 },
      nameOfBankApp: { row: 42, col: 9 },
      avgBankBalanceApp: { row: 43, col: 9 },
      remarkApp: { row: 44, col: 9 },

      nameOneReferance: { row: 52, col: 0 },
      relationOne: { row: 52, col: 1 },
      telephoneNoOne: { row: 52, col: 2 },
      nativeOfOne: { row: 52, col: 4 },

      nameTwoReferance: { row: 53, col: 0 },
      relationTwo: { row: 53, col: 1 },
      telephoneNoTwo: { row: 53, col: 2 },
      nativeOfTwo: { row: 53, col: 4 },
      // nativeOfOne: { row: 42, col: 9 },

      name: { row: 52, col: 7 },
      occupation: { row: 52, col: 8 },
      contactNo: { row: 52, col: 9 },
      Remarks: { row: 52, col: 10 },

      deviationsOne: { row: 56, col: 1 },
      deviationsTwo: { row: 57, col: 1 },
      deviationsThree: { row: 58, col: 1 },
      // deviationsFour: { row: 57, col: 1 },

      mitigateOne: { row: 56, col: 11 },
      mitigateTwo: { row: 57, col: 11 },
      mitigateThree: { row: 58, col: 11 },
      // mitigateFour: { row: 57, col: 1 },

      sanctionConditionOne: { row: 60, col: 1 },
      sanctionConditionTwo: { row: 61, col: 1 },
      sanctionConditionThree: { row: 62, col: 1 },
      sanctionConditionFour: { row: 63, col: 1 },

      pdDoneBy: { row: 66, col: 1 },
      dateOfLog: { row: 66, col: 2 },
      CamPrepared: { row: 67, col: 1 },
      salesManager: { row: 68, col: 1 },

     
    };

    const fieldMappingsSheet2 = {
       // income details
       districtOne: { row: 5, col: 0 },
       seasonOne: { row: 5, col: 1 },
       AreaCultivationAcresOne: { row: 5, col: 2 },
       cropOne: { row: 5, col: 3 },
       netIncomeOne: { row: 5, col: 4 },
 
       districtTwo: { row: 6, col: 0 },
       seasonTwo: { row: 6, col: 1 },
       AreaCultivationAcresTwo: { row: 6, col: 2 },
       cropTwo: { row: 6, col: 3 },
       netIncomeTwo: { row: 6, col: 4 },
 
       districtThree: { row: 7, col: 0 },
       seasonThree: { row: 7, col: 1 },
       AreaCultivationAcresThree: { row: 7, col: 2 },
       cropThree: { row: 7, col: 3 },
       netIncomeThree: { row: 7, col: 4 },
 
 
       totalFormula: { row: 9, col: 4 },
       //milk details
 
       monthsOne: { row: 13, col: 0 },
       saleOfMilkOne: { row: 13, col: 1 },
 
       monthsTwo: { row: 14, col: 0 },
       saleOfMilkTwo: { row: 14, col: 1 },
 
       monthsThree: { row: 15, col: 0 },
       saleOfMilkThree: { row: 15, col: 1 },
 
       monthsFour: { row: 16, col: 0 },
       saleOfMilkFour: { row: 16, col: 1 },
 
       averageSaleOfMilk: { row: 17, col: 1 },
       ConsiderableMilkIncomePercentage: { row: 18, col: 1 },
 
       // total income
 
       amountOne: { row: 23, col: 2 },
       amountTwo: { row: 24, col: 2 },
       amountThree: { row: 25, col: 2 },
 
       IncomeTotalFormula: { row: 26, col: 2 },
    };
    // console.log(fieldMappings, "fieldMappingsfieldMappings");
    // Function to update cells
    // const updateCell = (fieldName, value) => {
    //   const mapping = fieldMappings[fieldName];
    //   if (mapping) {
    //     const updateRange = `${sheetName}!${String.fromCharCode(
    //       65 + mapping.col
    //     )}${mapping.row + 1}`;
    //     return {
    //       range: updateRange,
    //       values: [[value || ""]],
    //     };
    //   }
    //   return null;
    // };

    const updateCell = (sheet, fieldName, value) => {
      const mapping = sheet === sheetName ? fieldMappings[fieldName] : fieldMappingsSheet2[fieldName];
    
      if (mapping) {
        const updateRange = `${sheet}!${String.fromCharCode(65 + mapping.col)}${mapping.row + 1}`;
        return {
          range: updateRange,
          values: [[value || ""]],
        };
      }
      return null;
    };
    

    // Fetch applicant, co-applicant, and guarantor data
    const appData = await applicantModel.findOne({ customerId });
    const CoappData = await coApplicantModel.find({ customerId });
    const gtrData = await guarantorModel.findOne({ customerId });
    const cibilData = await cibilModel.findOne({ customerId });
    const customerData = await customerModel
      .findOne({ _id: customerId })
      .populate({
        path: "employeId",
        populate: {
          path: "branchId",
          model: "newbranch", // Ensure the model name matches your Branch schema
        },
      })
      .populate({
        path: "productId",
      });
    // console.log(customerData, "customerDatacustomerDatacustomerData");
    const approverData = await approverFormModel
      .findOne({ customerId })
      .populate("vendorId");
    const appPdcData = await appPdcModel.findOne({ customerId });
    const milkIncomeDetails = await milkIncomeModel.findOne({ customerId });
    const agricultureDetails = await agricultureModel.findOne({ customerId });
    const partnerData = await finalModel
      .findOne({ customerId })
      .populate("partnerId")
      .populate("employeeId")
      .populate("EndUseOfLoan")
    const employeeData = await employeModel
      .findOne({ _id: customerData?.employeId._id })
      .populate("branchId");
    const reportingManagerData = await employeModel.findOne({
      _id: customerData?.employeId.reportingManagerId,
    });
    const creditPdData = await creditPdModel
      .findOne({ customerId })
      .populate("pdId");
    const udyamDetail = await udyamModel.findOne({ customerId });
    const internalLegalDetails = await internalLegalModel.findOne({
      customerId,
    });
    const bankStatementDetails = await bankStatementModel.findOne({
      customerId,
    });
    // console.log(udyamDetail, "udyamDetail",udyamDetail?.udyamDetails?.officialAddressOfEnterprise?.VillageTown);
    // console.log(approverData,"agricultureDetails")
    // Prepare updates
    function formatDate(dob) {
      if (!dob) return "";
      const date = new Date(dob);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    }

    function formatDBDate(dateString) {
      if (!dateString) return ""; // Return empty string if no date is provided

      // Handle specific format parsing
      const sanitizedDateString = dateString
        .replace(" PM", "")
        .replace(" AM", ""); // Remove AM/PM for compatibility
      const date = new Date(sanitizedDateString);

      if (isNaN(date)) {
        console.error("Invalid date format:", dateString);
        return ""; // Return empty string if the date is invalid
      }

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
      const year = String(date.getFullYear()); // Use the full year
      return `${day}-${month}-${year}`;
    }

    // for cibil
    function getCibilScore(score) {
      if (score === undefined || score === null) return ""; // Return empty string if no score is provided
      return score < 300 ? -1 : score; // Return -1 if score is less than 300, otherwise the actual score
    }
    //for emi
    function getRoundedEMI(emi) {
      if (emi === undefined || emi === null) return ""; // Return empty string for null or undefined
      return Math.round(emi); // Round off the EMI value to the nearest integer
    }

    let agriData;
    let milkData;
    let salaryData;
    let otherData;
    if (
      creditPdData?.incomeSource?.some(
        (src) => src?.incomeSourceType === "agricultureBusiness"
      )
    ) {
      agriData =
        creditPdData?.incomeSource?.find(
          (src) => src?.incomeSourceType === "agricultureBusiness"
        )?.agricultureBusiness ?? {};
      //  console.log("Agriculture Business Data:", agriData);
    }

    if (
      creditPdData?.incomeSource?.some(
        (src) => src?.incomeSourceType === "milkBusiness"
      )
    ) {
      milkData =
        creditPdData?.incomeSource?.find(
          (src) => src?.incomeSourceType === "milkBusiness"
        )?.milkBusiness ?? {};
      //  console.log("Milk Business Data:", milkData);
    }

    if (
      creditPdData?.incomeSource?.some(
        (src) => src?.incomeSourceType === "salaryIncome"
      )
    ) {
      salaryData =
        creditPdData?.incomeSource?.find(
          (src) => src?.incomeSourceType === "salaryIncome"
        )?.salaryIncome ?? {};
      //  console.log("Salary Income Data:", salaryData);
    }

    if (
      creditPdData?.incomeSource?.some(
        (src) => src?.incomeSourceType === "other"
      )
    ) {
      otherData =
        creditPdData?.incomeSource?.find(
          (src) => src?.incomeSourceType === "other"
        )?.other ?? {};
      //  console.log("Other Income Data:", otherData);
    }

    // console.log(appData,CoappData,cibilData,"appDataappCoappData.....")

    const missingFields = [];
    if (!appData?.fullName) missingFields.push("borrowerName is required");
    if (!appData?.occupation) missingFields.push("applicantOccupation is required");
    if (!appData?.dob) missingFields.push("applicantDob is required");
    if (!appData?.age) missingFields.push("applicantAge is required");
    if (!appData?.gender) missingFields.push("applicantGender is required");
    if (!appData?.caste) missingFields.push("applicantCaste is required");
    if (!appData?.religion) missingFields.push("applicantReligion is required");
    if (!appData?.maritalStatus) missingFields.push("applicantMaritalStatus is required");
    if (!appData?.mobileNo) missingFields.push("applicantMobileNo is required");
    if (!cibilData?.applicantCibilScore) missingFields.push("applicantCibilScore is required");

    if (!CoappData[0]?.fullName) missingFields.push("coApplicantullName is required");
    if (!CoappData[0]?.occupation) missingFields.push("coApplicantOccupation is required");
    if (!CoappData[0]?.dob) missingFields.push("coApplicantDob is required");
    if (!CoappData[0]?.age) missingFields.push("coApplicantAge is required");
    if (!CoappData[0]?.gender) missingFields.push("coApplicantGender is required");
    if (!CoappData[0]?.caste) missingFields.push("coApplicantCaste is required");
    if (!CoappData[0]?.religion) missingFields.push("coApplicantReligion is required");
    if (!CoappData[0]?.maritalStatus) missingFields.push("coApplicantMaritalStatus is required");
    if (!CoappData[0]?.mobileNo) missingFields.push("coApplicantMobileNo is required");
    if (!CoappData[0]?.relationWithApplicant) missingFields.push("coApplicantRelationWithApplicant is required");
    if (!cibilData?.coApplicantData[0]?.coApplicantCibilScore) missingFields.push("coApplicantCibilScore is required");


    if(Array.isArray(partnerData?.pdfSelection) && ["acc", "accg", "acccg","accc"].includes(partnerData?.pdfSelection)){
      if (!CoappData[1]?.fullName) missingFields.push("coApplicantSecondFullName is required");
      if (!CoappData[1]?.occupation) missingFields.push("coApplicantSecondOccupation is required");
      if (!CoappData[1]?.dob) missingFields.push("coApplicantSecondDob is required");
      if (!CoappData[1]?.age) missingFields.push("coApplicantSecondAge is required");
      if (!CoappData[1]?.gender) missingFields.push("coApplicantSecondGender is required");
      if (!CoappData[1]?.caste) missingFields.push("coApplicantSecondCaste is required");
      if (!CoappData[1]?.religion) missingFields.push("coApplicantSecondReligion is required");
      if (!CoappData[1]?.maritalStatus) missingFields.push("coApplicantSecondMaritalStatus is required");
      if (!CoappData[1]?.mobileNo) missingFields.push("coApplicantSecondMobileNo is required");
      if (!CoappData[1]?.relationWithApplicant) missingFields.push("coApplicantSecondRelationWithApplicant is required");
      if (!cibilData?.coApplicantData[1]?.coApplicantCibilScore) missingFields.push("coApplicantSecondCibilScore is required");

    }else if (Array.isArray(partnerData?.pdfSelection) && ["acg", "accg", "acccg"].includes(partnerData?.pdfSelection)){
      if (!gtrData?.fullName) missingFields.push("GtrFullName is required");
      if (!gtrData?.occupation) missingFields.push("GtrOccupation is required");
      if (!gtrData?.dob) missingFields.push("GtrDob is required");
      if (!gtrData?.age) missingFields.push("GtrAge is required");
      if (!gtrData?.gender) missingFields.push("GtrGender is required");
      if (!gtrData?.gtrData?.caste) missingFields.push("GtrCaste is required");
      if (!gtrData?.religion) missingFields.push("gtreligion is required");
      if (!gtrData?.maritalStatus) missingFields.push("gtrMaritalStatus is required");
      if (!gtrData?.mobileNo) missingFields.push("Gtr mobileNo is required");
      if (!gtrData?.relationWithApplicant) missingFields.push("gtrRelationWithApplicant is required");
      if (!cibilData?.guarantorCibilScore) missingFields.push("gtrGuarantorCibilScore is required")
    }

    if (!appData?.localAddress?.addressLine1) missingFields.push("appCurrentResidance is required");
    if (!approverData?.fullAddressOfProperty) missingFields.push("appFullAddressOfProperty is required");
    // if (!udyamDetail?.udyamDetails?.officialAddressOfEnterprise?.VillageTown) missingFields.push("app VillageTown is required");
    if (!appData?.occupation) missingFields.push("appOccupation is required");
    // if (!udyamDetail?.udyamDetails?.officialAddressOfEnterprise?.mobile) missingFields.push("app officeContact is required");
    if (!partnerData?.finalLoanAmount) missingFields.push("finalLoanAmount is required");
    if (!partnerData?.roi) missingFields.push("roi is required");
    if (!partnerData?.customerProfile) missingFields.push("customerProfile is required");
    if (!customerData?.productId?.productName) missingFields.push("productName is required");
    if (!approverData?.propertyType) missingFields.push("propertyType is required");
    // if (!approverData?.nameOfDocumentHolder || !approverData?.sellerName) missingFields.push("nameOfDocumentHolder is required");
    if (!partnerData?.emiAmount) missingFields.push("emiAmount is required");
    if (!partnerData?.netCalculationNew?.foir) missingFields.push("Foir is required");
    if (!partnerData?.tenureInMonth) missingFields.push("tenureInMonth is required");
    // if (!approverData?.Ltv) missingFields.push("Ltv is required");
    // if (!approverData?.nameOfDocumentHolder) missingFields.push("nameOfDocumentHolder is required");
    if (!appData?.businessType) missingFields.push("businessType is required");

    //income details
    if (!partnerData?.agricultureIncomeNew?.details[0]?.district) missingFields.push("districtName is required");
    if (!partnerData?.agricultureIncomeNew?.details[0]?.season) missingFields.push("season is required");
    if (!partnerData?.agricultureIncomeNew?.details[0]?.AreaInAcres) missingFields.push("AreaInAcres is required");
    if (!partnerData?.agricultureIncomeNew?.details[0]?.crop) missingFields.push("crop is required");
    if (!partnerData?.agricultureIncomeNew?.details[0]?.netIncome) missingFields.push("netIncome is required");
    if (!partnerData?.agricultureIncomeNew?.details[1]?.district) missingFields.push("districtTwo is required");
    if (!partnerData?.agricultureIncomeNew?.details[1]?.season) missingFields.push("seasonTwo is required");
    if (!partnerData?.agricultureIncomeNew?.details[1]?.AreaInAcres) missingFields.push("AreaInAcresTwo is required");
    if (!partnerData?.agricultureIncomeNew?.details[1]?.crop) missingFields.push("cropTwo is required");
    if (!partnerData?.agricultureIncomeNew?.details[1]?.netIncome) missingFields.push("netIncomeTwo is required");
    if (!partnerData?.agricultureIncomeNew?.details[2]?.district) missingFields.push("districtThree is required");
    if (!partnerData?.agricultureIncomeNew?.details[2]?.season) missingFields.push("seasonThree is required");
    if (!partnerData?.agricultureIncomeNew?.details[2]?.AreaInAcres) missingFields.push("AreaInAcresThree is required");
    if (!partnerData?.agricultureIncomeNew?.details[2]?.netIncome) missingFields.push("netIncomeThree is required");
    if (!partnerData?.agricultureIncomeNew?.totalNetAnnualIncome) missingFields.push("agriTotalNetAnnualIncome is required");



       // console.log(missingFields,"missingFields")
    if (missingFields.length > 0) {
        console.log("Missing fields detected:", missingFields);
        return badRequest(res, `Missing fields: ${missingFields.join(", ")}`)
        // throw { status: 400, message: `Missing fields: ${missingFields.join(", ")}` };
      }

      const ownershipMap = {
        '1': 'INDIVIDUAL',
        '2': 'AUTHORISED USER',
        '3': 'GUARANTOR',
        '4': 'JOINT',
        '5': 'DECEASED'
      };
  
      const accountTypeMap = {
        '01': 'Auto Loan (Personal)',
        '02': 'HOUSING LOAN',
        '03': 'PROPERTY LOAN',
        '04': 'LOAN AGAINST SHARES/SECURITIES',
        '05': 'PERSONAL LOAN',
        '06': 'CONSUMER LOAN',
        '07': 'GOLD LOAN',
        '08': 'EDUCATION LOAN',
        '09': 'LOAN TO PROFESSIONAL',
        '10': 'CREDIT CARD',
        '11': 'LEASING',
        '12': 'OVERDRAFT',
        '13': 'TWO-WHEELER LOAN',
        '14': 'NON-FUNDED CREDIT FACILITY',
        '15': 'LOAN AGAINST BANK DEPOSITS',
        '16': 'FLEET CARD',
        '17': 'COMMERCIAL VEHICLE LOAN',
        '18': 'TELCO – WIRELESS',
        '19': 'TELCO – BROADBAND',
        '20': 'TELCO – LANDLINE',
        '21': 'SELLER FINANCING',
        '22': 'SELLER FINANCING SOFT',
        '23': 'GECL LOAN SECURED',
        '24': 'GECL LOAN UNSECURED',
        '31': 'SECURED CREDIT CARD',
        '32': 'USED CAR LOAN',
        '33': 'CONSTRUCTION EQUIPMENT LOAN',
        '34': 'TRACTOR LOAN',
        '35': 'CORPORATE CREDIT CARD',
        '36': 'KISAN CREDIT CARD',
        '37': 'LOAN ON CREDIT CARD',
        '38': 'PRIME MINISTER JAAN DHAN YOJANA - OVERDRAFT',
        '39': 'MUDRA LOANS – SHISHU / KISHOR / TARUN',
        '40': 'MICROFINANCE – BUSINESS LOAN',
        '41': 'MICROFINANCE – PERSONAL LOAN',
        '42': 'MICROFINANCE – HOUSING LOAN',
        '43': 'MICROFINANCE – OTHER',
        '44': 'PRADHAN MANTRI AWAS YOJANA - CREDIT LINK SUBSIDY SCHEME MAY CLSS',
        '50': 'BUSINESS LOAN – SECURED',
        '51': 'BUSINESS LOAN – GENERAL',
        '52': 'BUSINESS LOAN – PRIORITY SECTOR – SMALL BUSINESS',
        '53': 'BUSINESS LOAN – PRIORITY SECTOR – AGRICULTURE',
        '54': 'BUSINESS LOAN – PRIORITY SECTOR – OTHERS',
        '55': 'BUSINESS NON-FUNDED CREDIT FACILITY – GENERAL',
        '56': 'BUSINESS NON-FUNDED CREDIT FACILITY – PRIORITY SECTOR – SMALL BUSINESS',
        '57': 'BUSINESS NON-FUNDED CREDIT FACILITY – PRIORITY SECTOR – AGRICULTURE',
        '58': 'BUSINESS NON-FUNDED CREDIT FACILITY – PRIORITY SECTOR-OTHERS',
        '59': 'BUSINESS LOAN AGAINST BANK DEPOSITS',
        '61': 'BUSINESS LOAN - UNSECURED',
        '80': 'MICROFINANCE DETAILED REPORT (APPLICABLE TO ENQUIRY PURPOSE ONLY)',
        '81': 'SUMMARY REPORT (APPLICABLE TO ENQUIRY PURPOSE ONLY)',
        '88': 'LOCATE PLUS FOR INSURANCE (APPLICABLE TO ENQUIRY PURPOSE ONLY)',
        '90': 'ACCOUNT REVIEW (APPLICABLE TO ENQUIRY PURPOSE ONLY)',
        '91': 'RETRO ENQUIRY (APPLICABLE TO ENQUIRY PURPOSE ONLY)',
        '92': 'LOCATE PLUS (APPLICABLE TO ENQUIRY PURPOSE ONLY)',
        '97': 'ADVISER LIABILITY (APPLICABLE TO ENQUIRY PURPOSE ONLY)',
        '00': 'OTHER',
        '98': 'SECURED (ACCOUNT GROUP FOR PORTFOLIO REVIEW RESPONSE)',
        '99': 'UNSECURED (ACCOUNT GROUP FOR PORTFOLIO REVIEW RESPONSE)',
        '45': 'P2P PERSONAL LOAN',
        '46': 'P2P AUTO LOAN',
        '47': 'P2P EDUCATION LOAN',
        '66': 'EXPRESS MATCH - NEW LOAN APPLICATION',
        '69': 'SHORT TERM PERSONAL LOAN',
        '70': 'PRIORITY SECTOR - GOLD LOAN',
        '71': 'TEMPORARY OVERDRAFT',
        '67': 'Buy Now Pay Later'
      };
  
  
      function mapCreditData(data) {
        return data?.filter(item => item.actionStatus !== "inactive").map(item=> ({
          index: item.index || "",
          loanType: accountTypeMap[item.accountType] || '',
          ownership: ownershipMap[item.ownershipIndicator] || '',
          loanAmount: item.highCreditAmount || 0,
          currentOutstanding: item.currentBalance || 0,
          monthlyEMI: item.emiAmount || 0,
          loanStatus: item.loanStatus || "",
          obligated: item.obligated || "",
          actionStatus: item.actionStatus || "active",
          obligationConsidered: ["yes", "YES", "Yes"].includes(item.obligated) ? item.emiAmount : 0
        })) || [];
      }
      // console.log()
  
      const applicantActiveLoanDetail = cibilData?.applicantCibilDetail?.[0]?.creditData?.[0]?.accounts || [];
      const applicantLoans = mapCreditData(applicantActiveLoanDetail);

    const coApplicantLoans = cibilData?.coApplicantData?.flatMap(coApplicant =>
        coApplicant.coApplicantCibilDetail.flatMap(detail =>
            mapCreditData(detail?.creditData?.[0]?.accounts || [])
        )
    ) || [];
    
    // ✅ Combine applicant and co-applicant loans
    const mappedLoans = [...applicantLoans, ...coApplicantLoans];
    // console.log(mappedLoans,"mappedLoans<<>>><<>><<>>")
   
    const updates = [];
    updates.push(updateCell(sheetName,"borrowerName", appData?.fullName)); //applicant
    updates.push(
      updateCell(sheetName,"appOccupation", appData?.occupation)
    );
    updates.push(updateCell(sheetName,"dob", formatDate(appData?.dob)));
    updates.push(updateCell(sheetName,"age", appData?.age));
    updates.push(updateCell(sheetName,"sex", appData?.gender));
    updates.push(updateCell(sheetName,"caste", appData?.caste));
    updates.push(updateCell(sheetName,"religion", appData?.religion));
    updates.push(
      updateCell("maritalStatus", appData?.maritalStatus)
    );
    updates.push(updateCell(sheetName,"telephoneNo", appData?.mobileNo));
    updates.push(updateCell(sheetName,"relationshipWithCustomer", "Self"));
    updates.push(updateCell(sheetName,"cibil", cibilData?.applicantCibilScore));

    updates.push(updateCell(sheetName,"coBorrowerName", CoappData[0]?.fullName)); //co-applicant
    updates.push(
      updateCell("coOccupation", CoappData[0]?.occupation)
    );
    updates.push(updateCell(sheetName,"coDob", formatDate(CoappData[0]?.dob)));
    updates.push(updateCell(sheetName,"coAge", CoappData[0]?.age));
    updates.push(updateCell(sheetName,"coSex", CoappData[0]?.gender));
    updates.push(updateCell(sheetName,"coCaste", CoappData[0]?.caste));
    updates.push(updateCell(sheetName,"coReligion", CoappData[0]?.religion));
    updates.push(
      updateCell(
        sheetName,"coMaritalStatus",
        CoappData[0]?.maritalStatus
      )
    );
    updates.push(updateCell(sheetName,"coTelephoneNo", CoappData[0]?.mobileNo));
    updates.push(
      updateCell(
        sheetName,"coRelationshipWithCustomer",
        CoappData[0]?.relationWithApplicant
      )
    );
    updates.push(
      updateCell(
        sheetName,"coCibil",
        cibilData?.coApplicantData[0]?.coApplicantCibilScore
      )
    );

    updates.push(updateCell(sheetName,"coTwoBorrowerName", CoappData[1]?.fullName)); //co-applicant-two
    updates.push(
      updateCell(sheetName,"coTwoOccupation", CoappData[1]?.occupation)
    );
    updates.push(updateCell(sheetName,"coTwoDob", formatDate(CoappData[1]?.dob)));
    updates.push(updateCell(sheetName,"coTwoAge", CoappData[1]?.age));
    updates.push(updateCell(sheetName,"coTwoSex", CoappData[1]?.gender));
    updates.push(
      updateCell(sheetName,"coTwoCaste", CoappData[1]?.caste)
    );
    updates.push(updateCell(sheetName,"coTwoReligion", CoappData[1]?.religion));
    updates.push(
      updateCell(
        sheetName,"coTwoMaritalStatus",
        CoappData[1]?.maritalStatus
      )
    );
    updates.push(updateCell(sheetName,"coTwoTelephoneNo", CoappData[1]?.mobileNo));
    updates.push(
      updateCell(
        sheetName,"coTwoRelationshipWithCustomer",
        CoappData[1]?.relationWithApplicant
      )
    );
    updates.push(
      updateCell(
        sheetName,"coTwoCibil",
        cibilData?.coApplicantData[1]?.coApplicantCibilScore
      )
    );

    updates.push(updateCell(sheetName,"guarantorBorrowerName", gtrData?.fullName)); //gurantor details
    updates.push(
      updateCell(sheetName,"guarantorOccupation", gtrData?.occupation)
    );
    updates.push(updateCell(sheetName,"guarantorDob", formatDate(gtrData?.dob)));
    updates.push(updateCell(sheetName,"guarantorAge", gtrData?.age));
    updates.push(updateCell(sheetName,"guarantorSex", gtrData?.gender));
    updates.push(
      updateCell(sheetName,"guarantorCaste", gtrData?.caste)
    );
    updates.push(updateCell(sheetName,"guarantorReligion", gtrData?.religion));
    updates.push(
      updateCell(
        sheetName,"guarantorMaritalStatus",
        gtrData?.maritalStatus
      )
    );
    updates.push(updateCell(sheetName,"guarantorTelephoneNo", gtrData?.mobileNo));
    updates.push(
      updateCell(
        sheetName,"guarantorRelationshipWithCustomer",
        gtrData?.relationWithApplicant
      )
    );
    updates.push(
      updateCell(sheetName,"guarantorCibil", cibilData?.guarantorCibilScore)
    );

    updates.push(
      updateCell(sheetName,"currentResidance", appData?.localAddress?.addressLine1)
    );
    updates.push(
      updateCell(sheetName,"appPropertyAddress", approverData?.fullAddressOfProperty)
    );
    updates.push(
      updateCell(
        sheetName,"business",
        appData?.localAddress?.addressLine1
      )
    );
    updates.push(
      updateCell(sheetName,"occupations", appData?.occupation)
    );
    updates.push(
      updateCell(
        sheetName,"officeContact",
        appData?.mobileNo
      )
    );

    updates.push(updateCell(sheetName,"loanAmount", partnerData?.finalLoanAmount));
    updates.push(updateCell(sheetName,"roi", partnerData?.roi));
    updates.push(updateCell(sheetName,"profile", partnerData?.customerProfile));
    updates.push(updateCell(sheetName,"product", customerData?.productId?.productName));
    updates.push(updateCell(sheetName,"typeOfProperty", approverData?.propertyType));
    // sheetName,updates.push(updateCell("purposeOfLoan", partnerData?.EndUseOfLoan));
    updates.push(
      updateCell(sheetName,"presentOwner", approverData?.nameOfDocumentHolder || approverData?.sellerName)
    );

    updates.push(updateCell(sheetName,"emiAmount", Math.round(partnerData?.emiAmount || 0)));
    updates.push(
      updateCell(sheetName,"foirAmount", `${getRoundedEMI(partnerData?.netCalculationNew?.foir)}%`)
    );
    updates.push(
      updateCell(sheetName,"tenureMonthDetails", partnerData?.tenureInMonth)
    );
    updates.push(updateCell(sheetName,"ltvDetails", approverData?.Ltv));
    updates.push(updateCell(sheetName,"moratoriumPeriodMonth", " "));
    updates.push(
      updateCell(sheetName,"proposedOwner", approverData?.nameOfDocumentHolder || approverData?.sellerName)
    );

    updates.push(
      updateCell(sheetName,"natureOfBusiness", appData?.businessType)
    );
    updates.push(
      updateCell(sheetName,"branch", customerData?.employeId?.branchId?.name)
    );
    updates.push(
      updateCell(
        sheetName,"totalIncomeDetails",
        getRoundedEMI(
          partnerData?.netCalculationNew?.overAllTotalNetMonthlyIncome
        )
      )
    );
    updates.push(updateCell(sheetName,"natureOfIncome", "With income proof "));
    updates.push(updateCell(sheetName,"averageBankingBalance", "0.00"));

    updates.push(
      updateCell(
        sheetName,"personalInfo",
        `(Applicant, Co-applicant & Assets Base -- family, residence, stability, assets seen etc) 

Applicant Mr. ${appData?.fullName ?? ""} & Co-applicant ${
          CoappData[0]?.fullName ?? ""
        }  in the proposed deal are residing at ${
          appData?.permanentAddress?.city ?? ""
        } Currently the customer is residing in the above mentioned address. Applicant is living with his spouse.

Asset Base – ${creditPdData?.assetDetails[0]?.name ?? ""}, ${
          creditPdData?.assetDetails[1]?.name ?? ""
        }, ${creditPdData?.assetDetails[2]?.name ?? ""}, ${
          creditPdData?.assetDetails[3]?.name ?? ""
        } etc. Living standard is good. Resi Reference check done and found positive.
      `
      )
    );
    // console.log(agriData,"agriData<><><><><><>")
    updates.push(
      updateCell(
        sheetName,"businessIncDetails",
        `APPLICANT ${appData?.fullName ?? ""} IS ${
          partnerData?.customerProfile ?? ""
        } INVOLVE IN AGRICULTURE AND MILK SUPPLY BUSSINESS FROM PAST ${
          agriData?.agriDoingFromNoOfYears ?? ""
        } YEARS, APPLICANT IS HAVING ${
          Math.round(partnerData?.agricultureIncomeNew?.details[0]?.AreaInAcres || 0) ?? ""
        } ACRE OF PRODUCTIVE AGRICULTURE LAND WHICH IS IN THE NAME OF ${
          agriData?.nameOfAgriOwner[0] ?? ""
        }

APPLICANT GENERALLY CULTIVATE ${
          agriData?.whichCropIsPlanted ?? ""
        }, APPLICANT IS NET EARNING AROUND RS. ${
          Math.round(partnerData?.agricultureIncomeNew?.totalNetAnnualIncome ||0 ) ?? ""
        } PER ANNUM ,NET MONTHLY INCOME FROM THIS BUSINESS IS AROUND ${
          Math.round(partnerData?.agricultureIncomeNew?.totalNetMonthlyIncome || 0 ) ?? ""
        }.
        
APPLICANT IS ALSO INVOLVE IN MILK BUSINESS HAVING CATTLES ${
          milkData?.noOfMilkGivingCattles ?? ""
        } LTR PER DAY WHICH IS SOLD TO NEARBY DAIRY , DAIRY NAME IS ${
          milkData?.nameOfDairy ?? ""
        } FROM THIS BUSINESS APPLICANT IS EARNING AROUND ${
          Math.round(partnerData?.milkIncomeCalculationNew?.totalNetAnnualIncomeAsPerSales || 0) ?? ""
        } PER MONTH AND NET EARNING FROM THIS BUSINESS IS RS ${
          Math.round(partnerData?.milkIncomeCalculationNew?.totalNetMonthlyIncomeAsPerSales || 0) ?? ""
        }.
      `
      )
    );
    updates.push(
      updateCell(
        sheetName,"endUse",
        `Loan required for ${
          partnerData?.EndUseOfLoan?.name ?? ""
        }. Customer EMI comforts ${Math.round(partnerData?.emiAmount || 0)} per month.`
      )
    );
    updates.push(
      updateCell(sheetName,"personMetDuringPd", `Applicant and Co-applicant.`)
    );

    const date = new Date(internalLegalDetails?.gramPanchayat?.date ?? "");
const formattedDate = date
  ? `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getFullYear()).slice(-2)}`
  : "";
  console.log(formattedDate,"formattedDateformattedDate")
    updates.push(
      updateCell(
        sheetName,"propertyDetails",
        `Property Address - ${approverData?.fullAddressOfProperty ?? ""},
Patta No.- ${internalLegalDetails?.gramPanchayat?.no ?? ""}
Area of property –  ${approverData?.totalLandArea ?? ""}
Property owner – ${approverData?.nameOfDocumentHolder ?? ""}  ${approverData?.sellerName ?? ""}
Approx. Property Value - ${approverData?.constructionValue ?? ""}
Property Type - ${approverData?.propertyType ?? ""}
Area Development - ${approverData?.developmentPercentage ?? ""}
Property Title - ${approverData?.propertyType ?? ""}
Patta Date - ${formattedDate ?? ""} `
      )
    ); //dpeepnd
    updates.push(
      updateCell(
        sheetName,"dependentNameOne",
        creditPdData?.samagraIdDetail?.familyMembers[0]?.memberName
      )
    ); //dependent
    updates.push(
      updateCell(sheetName,"dependentAgeOne", creditPdData?.samagraIdDetail?.familyMembers[0]?.age)
    );
    updates.push(
      updateCell(
        sheetName,"dependentRelationOne",
        creditPdData?.samagraIdDetail?.familyMembers[0]?.relationship
      )
    );
    updates.push(
      updateCell(
        sheetName,"dependentAnnualOne",
        creditPdData?.department_info[0]?.Annual_Income
      )
    );
    updates.push(
      updateCell(
        sheetName,"dependentOccupationOne",
        creditPdData?.department_info[0]?.Occupation
      )
    );
    updates.push(
      updateCell(
        sheetName,"dependentinstitutionOfStudentOne",
        creditPdData?.department_info[0]?.Institution_of_studen
      )
    );
    updates.push(
      updateCell(
        sheetName,"dependentnameOfTheOrganisationOne",
        creditPdData?.department_info[0]?.Name_of_Organization
      )
    );
    updates.push(
      updateCell(
        sheetName,"dependentdesignationOne",
        creditPdData?.department_info[0]?.Designation
      )
    );
    updates.push(
      updateCell(
        sheetName,"dependentdateOfJoiningOne",
        creditPdData?.department_info[0]?.Date_of_joining
      )
    );

    updates.push(
      updateCell(
        sheetName,"dependentNameTwo",
        creditPdData?.samagraIdDetail?.familyMembers[1]?.memberName
      )
    ); //dependent two
    updates.push(updateCell(sheetName,"AgeTwo", creditPdData?.samagraIdDetail?.familyMembers[1]?.age));
    updates.push(
      updateCell(
        sheetName,"RelationTwo",
        creditPdData?.samagraIdDetail?.familyMembers[1]?.relationship
      )
    );
    updates.push(
      updateCell(sheetName,"AnnualTwo", creditPdData?.department_info[1]?.Annual_Income)
    );
    updates.push(
      updateCell(
        sheetName,"OccupationTwo",
        creditPdData?.department_info[1]?.Occupation
      )
    );
    updates.push(
      updateCell(
        sheetName,"institutionOfStudentTwo",
        creditPdData?.department_info[1]?.Institution_of_studen
      )
    );
    updates.push(
      updateCell(
        sheetName,"nameOfTheOrganisationTwo",
        creditPdData?.department_info[1]?.Name_of_Organization
      )
    );
    updates.push(
      updateCell(
        sheetName,"designationTwo",
        creditPdData?.department_info[1]?.Designation
      )
    );
    updates.push(
      updateCell(
        sheetName,"dateOfJoiningTwo",
        creditPdData?.department_info[1]?.Date_of_joining
      )
    );

    updates.push(
      updateCell(
        sheetName,"dependentNameThree",
        creditPdData?.samagraIdDetail?.familyMembers[2]?.memberName
      )
    ); //dependent Three
    updates.push(
      updateCell(sheetName,"AgeThree", creditPdData?.samagraIdDetail?.familyMembers[2]?.age)
    );
    updates.push(
      updateCell(
        sheetName,"RelationThree",
        creditPdData?.samagraIdDetail?.familyMembers[2]?.relationship
      )
    );
    updates.push(
      updateCell(
        sheetName,"AnnualThree",
        creditPdData?.department_info[2]?.Annual_Income
      )
    );
    updates.push(
      updateCell(
        sheetName,"OccupationThree",
        creditPdData?.department_info[2]?.Occupation
      )
    );
    updates.push(
      updateCell(
        sheetName,"institutionOfStudentThree",
        creditPdData?.department_info[2]?.Institution_of_studen
      )
    );
    updates.push(
      updateCell(
        sheetName,"nameOfTheOrganisationThree",
        creditPdData?.department_info[2]?.Name_of_Organization
      )
    );
    updates.push(
      updateCell(
        sheetName,"designationThree",
        creditPdData?.department_info[2]?.Designation
      )
    );
    updates.push(
      updateCell(
        sheetName,"dateOfJoiningThree",
        creditPdData?.department_info[2]?.Date_of_joining
      )
    );

    updates.push(
      updateCell(
        sheetName,"dependentNameFour",
        creditPdData?.samagraIdDetail?.familyMembers[3]?.memberName
      )
    ); //dependent Four
    updates.push(
      updateCell(sheetName,"AgeFour", creditPdData?.samagraIdDetail?.familyMembers[3]?.age)
    );
    updates.push(
      updateCell(
        sheetName,"RelationFour",
        creditPdData?.samagraIdDetail?.familyMembers[3]?.relationship
      )
    );

    updates.push(
      updateCell(
        sheetName,"dependentNameFive",
        creditPdData?.samagraIdDetail?.familyMembers[4]?.memberName
      )
    ); //dependent Five
    updates.push(
      updateCell(sheetName,"AgeFive", creditPdData?.samagraIdDetail?.familyMembers[4]?.age)
    );
    updates.push(
      updateCell(
        sheetName,"RelationFive",
        creditPdData?.samagraIdDetail?.familyMembers[4]?.relationship
      )
    );

    updates.push(
      updateCell(
        sheetName,"institutionOne",
        ""
      )
    ); //dependent Three
    updates.push(
      updateCell(sheetName,"loanTypeOne", mappedLoans[0]?.loanType || "")
    );
    updates.push(
      updateCell(
        sheetName,"loanAmountOne",
        mappedLoans[0]?.loanAmount || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"currentOsOne",
        mappedLoans[0]?.currentOutstanding || ""
      )
    );
    updates.push(
      updateCell(sheetName,"roiOne", "")
    );
    updates.push(
      updateCell(
        sheetName,"ownershipOne",
        mappedLoans[0]?.ownership || ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"emiMonthlyOne",
        mappedLoans[0]?.monthlyEMI || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"totalTenureOne" || "0",
        ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"balanceTenureOne",
        ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"loanStatusOne",
        mappedLoans[0]?.actionStatus || ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"ObligatedOne",
        mappedLoans[0]?.obligated || ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"ObligationConsideredOne",
         mappedLoans[0]?.obligationConsidered || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"emiYearlyOne",
         Number(mappedLoans[0]?.monthlyEMI ?? 0) * 12 || "0"
      )
    );

    updates.push(
      updateCell(
        sheetName,"institutionTwo",
        ""
      )
    ); 
    updates.push(
      updateCell(sheetName,"loanTypeTwo", mappedLoans[1]?.loanType)
    );
    updates.push(
      updateCell(
        sheetName,"loanAmountTwo",
        mappedLoans[1]?.loanAmount || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"currentOsTwo",
        mappedLoans[1]?.currentOutstanding || ""
      )
    );
    updates.push(
      updateCell(sheetName,"roiTwo", "")
    );
    updates.push(
      updateCell(
        sheetName,"ownershipTwo",
        mappedLoans[1]?.ownership || ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"emiMonthlyTwo",
        mappedLoans[1]?.monthlyEMI || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"emiYearlyTwo",
       Number(mappedLoans[1]?.monthlyEMI ?? 0) * 12 || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"totalTenureTwo",
        ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"balanceTenureTwo",
        ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"loanStatusTwo",
        mappedLoans[1]?.actionStatus || ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"ObligatedTwo",
        mappedLoans[1]?.obligated || ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"ObligationConsideredTwo",
        mappedLoans[1]?.obligationConsidered || "0"
      )
    );

    updates.push(
      updateCell(
        sheetName,"institutionThree",
        ""
      )
    ); //dependent Three
    updates.push(
      updateCell(
        sheetName,"loanTypeThree",
        mappedLoans[2]?.loanType || ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"loanAmountThree",
        mappedLoans[2]?.loanAmount || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"currentOsThree",
        mappedLoans[2]?.currentOutstanding || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"roiThree",
        ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"ownershipThree",
        mappedLoans[2]?.ownership || ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"emiMonthlyThree",
        mappedLoans[2]?.monthlyEMI || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"emiYearlyThree",
        Number(mappedLoans[2]?.monthlyEMI ?? 0) * 12 || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"totalTenureThree",
        ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"balanceTenureThree",
        ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"loanStatusThree",
        mappedLoans[2]?.actionStatus || ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"ObligatedThree",
        mappedLoans[2]?.obligated || ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"ObligationConsideredThree",
        mappedLoans[2]?.obligationConsidered || "0"
      )
    );

    updates.push(
      updateCell(
        sheetName,"institutionFour",
       ""
      )
    ); //dependent Three
    updates.push(
      updateCell(sheetName,"loanTypeFour", mappedLoans[3]?.loanType)
    );
    updates.push(
      updateCell(
        sheetName,"loanAmountFour",
        mappedLoans[3]?.loanAmount | "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"currentOsFour",
        mappedLoans[3]?.currentOutstanding || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"roiFour",
        ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"ownershipFour",
        mappedLoans[3]?.ownership || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"emiMonthlyFour",
        mappedLoans[3]?.monthlyEMI || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"emiYearlyFour",
         Number(mappedLoans[3]?.monthlyEMI ?? 0) * 12 || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"totalTenureFour",
        ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"balanceTenureFour",
        ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"loanStatusFour",
        mappedLoans[3]?.actionStatus
      )
    );
    updates.push(
      updateCell(
        sheetName,"ObligatedFour",
        mappedLoans[3]?.obligated || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"ObligationConsideredFour",
        mappedLoans[3]?.obligationConsidered || "0"
      )
    );

    updates.push(
      updateCell(
        sheetName,"institutionFive",
        ""
      )
    ); //dependent Three
    updates.push(
      updateCell(sheetName,"loanTypeFive", mappedLoans[4]?.loanType || "")
    );
    updates.push(
      updateCell(
        sheetName,"loanAmountFive",
        mappedLoans[4]?.loanAmount || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"currentOsFive",
        mappedLoans[4]?.outstandingAmount || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"roiFive",
        ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"ownershipFive",
        mappedLoans[4]?.ownership || ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"emiMonthlyFive",
        mappedLoans[4]?.monthlyEMI || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"emiYearlyFive",
        Number(mappedLoans[4]?.monthlyEMI ?? 0) * 12 || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"totalTenureFive",
        ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"balanceTenureFive",
        ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"loanStatusFive",
        mappedLoans[4]?.actionStatus || ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"ObligatedFive",
        mappedLoans[4]?.obligated || ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"ObligationConsideredFive",
        mappedLoans[4]?.obligationConsidered || "0"
      )
    );


    updates.push(
      updateCell(
        sheetName,"institutionSix",
        ""
      )
    ); //dependent Three
    updates.push(
      updateCell(sheetName,"loanTypeSix", mappedLoans[5]?.loanType || "")
    );
    updates.push(
      updateCell(
        sheetName,"loanAmountSix",
        mappedLoans[5]?.loanAmount || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"currentOsSix",
        mappedLoans[5]?.outstandingAmount || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"roiSix",
        ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"ownershipSix",
        mappedLoans[5]?.ownership || ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"emiMonthlySix",
        mappedLoans[5]?.monthlyEMI || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"emiYearlySix",
        Number(mappedLoans[5]?.monthlyEMI ?? 0) * 12 || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"totalTenureSix",
        ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"balanceTenureSix",
        ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"loanStatusSix",
        mappedLoans[5]?.actionStatus || ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"ObligatedSix",
        mappedLoans[5]?.obligated || ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"ObligationConsideredSix",
        mappedLoans[5]?.obligationConsidered || "0"
      )
    );


    updates.push(
      updateCell(
        sheetName,"institutionSeven",
        ""
      )
    ); //dependent Three

    updates.push(
      updateCell(sheetName,"loanTypeSeven", mappedLoans[6]?.loanType || "")
    );

    updates.push(
      updateCell(
        sheetName,"loanAmountSeven",
        mappedLoans[6]?.loanAmount || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"currentOsSeven",
        mappedLoans[6]?.outstandingAmount || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"roiSeven",
        ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"ownershipSeven",
        mappedLoans[6]?.ownership || ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"emiMonthlySeven",
        mappedLoans[6]?.monthlyEMI || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"emiYearlySeven",
        Number(mappedLoans[6]?.monthlyEMI ?? 0) * 12 || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"totalTenureSeven",
        ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"balanceTenureSeven",
        ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"loanStatusSeven",
        mappedLoans[6]?.actionStatus || ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"ObligatedSeven",
        mappedLoans[6]?.obligated || ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"ObligationConsideredSeven",
        mappedLoans[6]?.obligationConsidered || "0"
      )
    );


    updates.push(
      updateCell(
        sheetName,"institutionEight",
        ""
      )
    ); //dependent Three
    updates.push(
      updateCell(sheetName,"loanTypeEight", mappedLoans[7]?.loanType || "")
    );
    updates.push(
      updateCell(
        sheetName,"loanAmountEight",
        mappedLoans[7]?.loanAmount || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"currentOsEight",
        mappedLoans[7]?.outstandingAmount || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"roiEight",
        ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"ownershipEight",
        mappedLoans[7]?.ownership || ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"emiMonthlyEight",
        mappedLoans[7]?.monthlyEMI || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"emiYearlyEight",
        Number(mappedLoans[7]?.monthlyEMI ?? 0) * 12 || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"totalTenureEight",
        ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"balanceTenureEight",
        ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"loanStatusEight",
        mappedLoans[7]?.actionStatus || ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"ObligatedEight",
        mappedLoans[7]?.obligated || ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"ObligationConsideredEight",
        mappedLoans[7]?.obligationConsidered || "0"
      )
    );

    updates.push(
      updateCell(
        sheetName,"institutionNine",
        ""
      )
    ); //dependent Three
    updates.push(
      updateCell(sheetName,"loanTypeNine", mappedLoans[8]?.loanType || "")
    );
    updates.push(
      updateCell(
        sheetName,"loanAmountNine",
        mappedLoans[8]?.loanAmount || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"currentOsNine",
        mappedLoans[8]?.outstandingAmount || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"roiNine",
        ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"ownershipNine",
        mappedLoans[8]?.ownership || ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"emiMonthlyNine",
        mappedLoans[8]?.monthlyEMI || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"emiYearlyNine",
        Number(mappedLoans[8]?.monthlyEMI ?? 0) * 12 || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"totalTenureNine",
        ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"balanceTenureNine",
        ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"loanStatusNine",
        mappedLoans[8]?.actionStatus || ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"ObligatedNine",
        mappedLoans[8]?.obligated || ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"ObligationConsideredNine",
        mappedLoans[8]?.obligationConsidered || "0"
      )
    );


    updates.push(
      updateCell(
        sheetName,"institutionTen",
        ""
      )
    ); //dependent Three
    updates.push(
      updateCell(sheetName,"loanTypeTen", mappedLoans[8]?.loanType || "")
    );
    updates.push(
      updateCell(
        sheetName,"loanAmountTen",
        mappedLoans[9]?.loanAmount || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"currentOsTen",
        mappedLoans[9]?.outstandingAmount || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"roiTen",
        ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"ownershipTen",
        mappedLoans[9]?.ownership || ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"emiMonthlyTen",
        mappedLoans[9]?.monthlyEMI || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"emiYearlyTen",
        Number(mappedLoans[9]?.monthlyEMI ?? 0) * 12 || "0"
      )
    );
    updates.push(
      updateCell(
        sheetName,"totalTenureTen",
        ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"balanceTenureTen",
        ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"loanStatusTen",
        mappedLoans[9]?.actionStatus || ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"ObligatedTen",
        mappedLoans[9]?.obligated || ""
      )
    );
    updates.push(
      updateCell(
        sheetName,"ObligationConsideredTen",
        mappedLoans[9]?.obligationConsidered || "0"
      )
    );


    updates.push(
      updateCell(
        sheetName,"applicantTotalObligation",
        ""
      )
    );

    updates.push(
      updateCell(
        sheetName,"totalIncome",
        getRoundedEMI(
          partnerData?.netCalculationNew?.overAllTotalNetMonthlyIncome
        )
      )
    );

    const totalEMI = mappedLoans
  .filter(loan => loan.obligated === 'Yes') // Sirf obligated 'Yes' wale loans filter karna
  .reduce((sum, loan) => sum + (Number(loan.monthlyEMI) || 0) * 12, 0);

    updates.push(
      updateCell(sheetName, "obligation",totalEMI )
  );

    updates.push(updateCell(sheetName,"emi", partnerData?.emiAmount));
    updates.push(updateCell(sheetName,"foir", `${getRoundedEMI(partnerData?.foir)}%`));
    updates.push(updateCell(sheetName,"ltv", approverData?.Ltv));
    // sheetName,updates.push(updateCell('ObligationConsidered', partnerData?.totalIncome));

    //property
    updates.push(
      updateCell(sheetName,"propertyAddress", approverData?.fullAddressOfProperty)
    );
    updates.push(updateCell(sheetName,"propertySize", approverData?.totalLandArea));
    updates.push(
      updateCell(sheetName,"valuationValueOne", approverData?.fairMarketValueOfLand)
    );
    updates.push(
      updateCell(sheetName,"valuationDoneBy", approverData?.vendorId?.fullName)
    );
    updates.push(updateCell(sheetName,"marketLandValue", approverData?.landValue));
    updates.push(
      updateCell(sheetName,"marketConstructionValue", approverData?.constructionValue)
    );
    updates.push(updateCell(sheetName,"marketAmenitiesValue", ""));
    updates.push(
      updateCell(sheetName,"marketTotalValuesss", approverData?.fairMarketValueOfLand)
    );
    updates.push(
      updateCell(sheetName,"realizableLandValue", approverData?.realizableValue)
    );
    updates.push(
      updateCell(sheetName,"valuationValuethree", approverData?.fairMarketValueOfLand)
    );
    updates.push(updateCell(sheetName,"ltv", approverData?.Ltv));

    // //bank details
    updates.push(
      updateCell(
        sheetName,"bankAccountNoApp",
        bankStatementDetails?.bankDetails[0]?.accountNumber
      )
    );
    updates.push(
      updateCell(
        sheetName,"typeOfAccApp",
        bankStatementDetails?.bankDetails[0]?.accountType
      )
    );
    updates.push(
      updateCell(
        sheetName,"nameOfBankApp",
        bankStatementDetails?.bankDetails[0]?.bankName || "na"
      )
    );
    updates.push(updateCell(sheetName,"avgBankBalanceApp", "0.0"));
    updates.push(updateCell(sheetName,"remarkApp", "Average Banking"));

    updates.push(updateCell(sheetName,"bankAccountCoApp", ""));
    updates.push(updateCell(sheetName,"typeOfAccCoApp", ""));
    updates.push(updateCell(sheetName,"nameOfBankCoApp", ""));
    updates.push(updateCell(sheetName,"avgBankBalanceCoApp", "0.0"));
    updates.push(updateCell(sheetName,"remarkCoApp", "Average Banking"));

    // referance
    updates.push(
      updateCell(sheetName,"nameOneReferance", creditPdData?.referenceDetails[0]?.name)
    );
    updates.push(
      updateCell(sheetName,"relationOne", creditPdData?.referenceDetails[0]?.relation)
    );
    updates.push(
      updateCell(
        sheetName,"telephoneNoOne",
        creditPdData?.referenceDetails[0]?.mobileNumber
      )
    );
    updates.push(
      updateCell(sheetName,"nativeOfOne", creditPdData?.referenceDetails[0]?.address)
    );

    updates.push(
      updateCell(sheetName,"nameTwoReferance", creditPdData?.referenceDetails[1]?.name)
    );
    updates.push(
      updateCell(sheetName,"relationTwo", creditPdData?.referenceDetails[1]?.relation)
    );
    updates.push(
      updateCell(
        sheetName,"telephoneNoTwo",
        creditPdData?.referenceDetails[1]?.mobileNumber
      )
    );
    updates.push(
      updateCell(sheetName,"nativeOfTwo", creditPdData?.referenceDetails[1]?.address)
    );

    //business  Reference
    updates.push(updateCell(sheetName,"name", creditPdData?.referenceDetails[0]?.name));
    updates.push(updateCell(sheetName,"occupation", ""));
    updates.push(
      updateCell(sheetName,"contactNo", creditPdData?.referenceDetails[0]?.mobileNumber)
    );
    updates.push(updateCell(sheetName,"Remarks", ""));

    //deviations
    updates.push(
      updateCell(sheetName,"deviationsOne", partnerData?.deviation?.query[0])
    );
    updates.push(
      updateCell(sheetName,"deviationsTwo", partnerData?.deviation?.query[1])
    );
    updates.push(
      updateCell(sheetName,"deviationsThree", partnerData?.deviation?.query[2])
    );
    // sheetName,updates.push(updateCell('deviationsFour',  partnerData?.deviation[3]?.query));

    // mitigate
    // updates.push(updateCell(sheetName,"mitigateOne", partnerData?.mitigate?.query[0]));
    // updates.push(updateCell(sheetName,"mitigateTwo", partnerData?.mitigate?.query[1]));
    // updates.push(
    //   updateCell(sheetName,"mitigateThree", partnerData?.mitigate?.query[2])
    // );
    // sheetName,updates.push(updateCell('mitigateFour',  partnerData?.mitigate[3]?.query));

    // sanction Condition
    updates.push(
      updateCell(
        sheetName,"sanctionConditionOne",
        partnerData?.sanctionConditionQuery?.query[0]
      )
    );
    updates.push(
      updateCell(
        sheetName,"sanctionConditionTwo",
        partnerData?.sanctionConditionQuery?.query[1]
      )
    );
    updates.push(
      updateCell(
        sheetName,"sanctionConditionThree",
        partnerData?.sanctionConditionQuery?.query[2]
      )
    );
    // sheetName,updates.push(updateCell('sanctionConditionFour',  partnerData?.sanctionConditionQuery[3]?.query));

    // //deviations of any
    // console.log(reportingManagerData?.employeName,"creditPdData?.pdId?.employeNamecreditPdData?.pdId?.employeName")
   
    updates.push(updateCell(sheetName,"pdDoneBy", creditPdData?.pdId?.employeName));
    updates.push(
      updateCell(sheetName,"CamPrepared", partnerData?.employeeId?.employeName)
    );
    updates.push(
      updateCell(sheetName,"dateOfLog", formatDBDate(creditPdData?.bdCompleteDate))
    );
    updates.push(
      updateCell(sheetName,"salesManager", reportingManagerData?.employeName)
    );

   //update fields for the second sheet data
    // //income details agriculture
    updates.push(
      updateCell(
        sheet2Name,"districtOne",
        partnerData?.agricultureIncomeNew?.details[0]?.district
      )
    );
    updates.push(
      updateCell(
        sheet2Name,"seasonOne",
        partnerData?.agricultureIncomeNew?.details[0]?.season
      )
    );
    updates.push(
      updateCell(
        sheet2Name,"AreaCultivationAcresOne",
        Number(partnerData?.agricultureIncomeNew?.details[0]?.AreaInAcres)?.toFixed(2)
      )
    );
    updates.push(
      updateCell(sheet2Name,"cropOne", partnerData?.agricultureIncomeNew?.details[0]?.crop)
    );
    updates.push(
      updateCell(
        sheet2Name,"netIncomeOne",
        Number(partnerData?.agricultureIncomeNew?.details[0]?.netIncome)?.toFixed(2)
      )
    );

    updates.push(
      updateCell(
        sheet2Name,"districtTwo",
        partnerData?.agricultureIncomeNew?.details[1]?.district
      )
    );
    updates.push(
      updateCell(
        sheet2Name,"seasonTwo",
        partnerData?.agricultureIncomeNew?.details[1]?.season
      )
    );
    updates.push(
      updateCell(
        sheet2Name,"AreaCultivationAcresTwo",
        Number(partnerData?.agricultureIncomeNew?.details[1]?.AreaInAcres)?.toFixed(2)
      )
    );
    updates.push(
      updateCell(sheet2Name,"cropTwo", partnerData?.agricultureIncomeNew?.details[1]?.crop)
    );
    updates.push(
      updateCell(
        sheet2Name,"netIncomeTwo",
        Number(partnerData?.agricultureIncomeNew?.details[1]?.netIncome)?.toFixed(2)
      )
    );

    updates.push(
      updateCell(
        sheet2Name,"districtThree",
        partnerData?.agricultureIncomeNew?.details[2]?.district
      )
    );
    updates.push(
      updateCell(
        sheet2Name,"seasonThree",
        partnerData?.agricultureIncomeNew?.details[2]?.season
      )
    );
    updates.push(
      updateCell(
        sheet2Name,"AreaCultivationAcresThree",
        Number(partnerData?.agricultureIncomeNew?.details[2]?.AreaInAcres)?.toFixed(2)
      )
    );
    updates.push(
      updateCell(
        sheet2Name,"cropThree",
        partnerData?.agricultureIncomeNew?.details[2]?.crop
      )
    );
    updates.push(
      updateCell(
        sheet2Name,"netIncomeThree",
        Number(partnerData?.agricultureIncomeNew?.details[2]?.netIncome)?.toFixed(2)
      )
    );

  

    updates.push(
      updateCell(
        sheet2Name,"totalFormula",
        Number(partnerData?.agricultureIncomeNew?.totalNetAnnualIncome)?.toFixed(2) || ""
      )
    );

    // //milk income
    updates.push(
      updateCell(
        sheet2Name,"monthsOne",
        partnerData?.milkIncomeCalculationNew?.details[0]?.months
      )
    );
    updates.push(
      updateCell(
        sheet2Name,"saleOfMilkOne",
        partnerData?.milkIncomeCalculationNew?.details[0]?.saleOfMilk
      )
    );

    updates.push(
      updateCell(
        sheet2Name,"monthsTwo",
        partnerData?.milkIncomeCalculationNew?.details[1]?.months
      )
    );
    updates.push(
      updateCell(
        sheet2Name,"saleOfMilkTwo",
        partnerData?.milkIncomeCalculationNew?.details[1]?.saleOfMilk
      )
    );

    updates.push(
      updateCell(
        sheet2Name,"monthsThree",
        partnerData?.milkIncomeCalculationNew?.details[2]?.months
      )
    );
    updates.push(
      updateCell(
        sheet2Name,"saleOfMilkThree",
        partnerData?.milkIncomeCalculationNew?.details[2]?.saleOfMilk
      )
    );

    updates.push(
      updateCell(
        sheet2Name,"monthsFour",
        partnerData?.milkIncomeCalculationNew?.details[3]?.months
      )
    );
    updates.push(
      updateCell(
        sheet2Name,"saleOfMilkFour",
        partnerData?.milkIncomeCalculationNew?.details[3]?.saleOfMilk
      )
    );

    updates.push(
      updateCell(
        sheet2Name,"averageSaleOfMilk",
        partnerData?.milkIncomeCalculationNew?.averageSaleOfMilk
      )
    );
    updates.push(
      updateCell(
        sheet2Name,"ConsiderableMilkIncomePercentage",
        partnerData?.milkIncomeCalculationNew?.totalNetMonthlyIncomeAsPerSales
      )
    );

    // //total income calculation

    updates.push(
      updateCell(
        sheet2Name,"amountOne",
        Number(partnerData?.agricultureIncomeNew?.totalNetMonthlyIncome)?.toFixed(2)
      )
    );
    updates.push(
      updateCell(
        sheet2Name,"amountTwo",
        Number(partnerData?.milkIncomeCalculationNew?.totalNetMonthlyIncomeAsPerSales)?.toFixed(2)
      )
    );
    updates.push(
      updateCell(
        sheet2Name,"amountThree",
        getRoundedEMI(
         Number(partnerData?.otherIncomeNew?.OverallTotalNetAnnualIncome)?.toFixed(2)
        )
      )
    );

    const agricultureIncome = Number(partnerData?.agricultureIncomeNew?.totalNetAnnualIncome) || 0;
    const milkIncome = Number(partnerData?.milkIncomeCalculationNew?.totalNetMonthlyIncomeAsPerSales) || 0;
    const otherIncome = Number(partnerData?.otherIncomeNew?.OverallTotalNetAnnualIncome) || 0;
    const totalIncome = partnerData?.netCalculationNew?.OverallTotalNetAnnualIncome;

    updates.push(
      updateCell(
        sheet2Name,
        "IncomeTotalFormula",
        totalIncome
      )
    );
    

    // Remove null updates (in case there are any invalid field mappings)
    const validUpdates = updates.filter((update) => update !== null);

    // Update the spreadsheet
    if (validUpdates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          data: validUpdates,
          valueInputOption: "RAW",
        },
      });
    }

    // Prepare data for appending a new row
    const nextRowIndex = rows.length + 1; // 0-indexed, appending to the last row
    const newRow = [""];

    // Append the new row
    const appendUpdate = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A${nextRowIndex + 1}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [newRow],
      },
    });

    // return res.status(200).json({ message: "ok" });
    // Construct the export URL for the specified spreadsheet
    const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx&sheet=${sheetName}`;

    // Get the access token
    const token = await authClient.getAccessToken();
    // console.log("===========================",token)
    

    // Download the file using Axios with the access token
    const response = await axios.get(exportUrl, {
      responseType: "stream",
      headers: {
        Authorization: `Bearer ${token.token}`,
      },
    });

    // Set response headers for file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${sheetName}.xlsx"`
    );

    // Pipe the file stream to the response
    response.data.pipe(res);
    await processModel.findOneAndUpdate(
      { customerId },
      { $set: {
        camReport:true
      } },
      { new: true }
  ); 
    // await fileProcessSheet(customerId)
  } else {
    return badRequest(res, "plese select ratnafin or grow  money partner");
  }

  } catch (error) {
    console.error("Error in createCamReport API >>>>>>", error);
    return res.status(500).json({
      error: "An unknown error occurred",
      details: error.message,
    });
  }
};


//old cam report

const createCamReport = async (req, res) => {
  try {
    const { customerId } = req.query;

    const partnerNameData = await finalModel
      .findOne({ customerId })
      .populate("partnerId");
    // console.log(partnerNameData, "partnerDatapartnerDatapartnerData");
    if (
      partnerNameData?.partnerId?.fullName == "ratnaafin capital pvt ltd" ||
      partnerNameData?.partnerId?.fullName == "RATNAAFIN CAPITAL PVT LTD" ||
      partnerNameData?.partnerId?.fullName == "fin coopers capital pvt ltd" ||
      partnerNameData?.partnerId?.fullName == "FIN COOPERS CAPITAL PVT LTD" ||
      partnerNameData?.partnerId?.fullName == "UNITY CAPITAL PVT LTD"
    ) {
      const spreadsheetId = "1K9EnCErm-NfZCg7--TJtkfOqzPyGc-c5eLrWELS3kMA"; // Your spreadsheet ID
      const sheetName = "Sheet2"; // Your sheet name

      const auth = new google.auth.GoogleAuth({
        credentials, // Your credentials object or JSON key file
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      const authClient = await auth.getClient();
      const sheets = google.sheets({ version: "v4", auth: authClient });

      // Fetch data from the sheet
      const responses = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:Z`, // Fetch entire sheet or range you want
      });

      const rows = responses.data.values;
      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: "No data found in the sheet" });
      }

      // Field mappings
      const fieldMappings = {
        partnerHeadingName: { row: 0, col: 1 },
        branchState: { row: 5, col: 3 },
        branchName: { row: 6, col: 3 },
        partnerName: { row: 7, col: 3 },
        employeeName: { row: 8, col: 3 },
        employeeCode: { row: 9, col: 3 },

        fullName: { row: 12, col: 3 },
        CoappFullName1: { row: 12, col: 4 }, //name
        CoappFullName2: { row: 12, col: 5 },
        gtrFullName: { row: 12, col: 6 },
        dob: { row: 13, col: 3 }, //dob
        CoappDob1: { row: 13, col: 4 },
        CoappDob2: { row: 13, col: 5 },
        gtrDob: { row: 13, col: 6 },
        age: { row: 14, col: 3 }, //age
        CoappAge1: { row: 14, col: 4 },
        CoappAge2: { row: 14, col: 5 },
        profileOfCustomer: { row: 16, col: 3 },
        sector: { row: 17, col: 3 },
        industry: { row: 18, col: 3 },
        gtrAge: { row: 14, col: 6 },
        gender: { row: 19, col: 3 }, //gender
        CoappGender: { row: 19, col: 4 },
        CoappGender2: { row: 19, col: 5 },
        gtrGender: { row: 19, col: 6 },
        relationship: { row: 20, col: 3 }, //relationShip
        Coapprelationship: { row: 20, col: 4 },
        Coapprelationship2: { row: 20, col: 5 },
        gtrrelationship: { row: 20, col: 6 },
        mobileNo: { row: 21, col: 3 }, //contact number
        CoappMobileNo: { row: 21, col: 4 },
        CoappMobileNo2: { row: 21, col: 5 },
        gtrMobileNo: { row: 21, col: 6 },
        email: { row: 22, col: 3 }, //email
        CoappEmail: { row: 22, col: 4 },
        CoappEmail2: { row: 22, col: 5 },
        gtrEmail: { row: 22, col: 6 },
        workAddress: { row: 24, col: 3 },
        address: { row: 23, col: 3 }, //address
        CoappAddress: { row: 23, col: 4 },
        CoappAddress2: { row: 23, col: 5 },
        gtrAddress: { row: 23, col: 6 },
        cibil: { row: 25, col: 3 }, //cibil score
        CoappCibil: { row: 25, col: 4 },
        CoappCibil2: { row: 25, col: 5 },
        gtrCibil: { row: 25, col: 6 },
        loanAmount: { row: 26, col: 3 }, //loan ammount
        tenure: { row: 27, col: 3 },
        roi: { row: 28, col: 3 },
        emi: { row: 29, col: 3 },
        endUseOfLoan: { row: 30, col: 3 },
        geoLimit: { row: 31, col: 3 },
        propertyType: { row: 33, col: 3 }, //collateral
        geographicArea: { row: 34, col: 3 }, //collateral
        PropertyAddress: { row: 35, col: 3 },
        PropertyOwnersName: { row: 36, col: 3 },
        PropertyownerAge: { row: 37, col: 3 },
        ConstructionArea: { row: 38, col: 3 },
        legal: { row: 39, col: 3 },
        technical: { row: 40, col: 3 },
        PropertyMarketValue: { row: 41, col: 3 },
        LTV: { row: 42, col: 3 },
        agricultureExperience: { row: 45, col: 5 },
        milkBusinessExperience: { row: 46, col: 5 },
        otherBusinessExperience: { row: 47, col: 5 },
        residenceStability: { row: 48, col: 3 },
        agricultureLand: { row: 49, col: 3 },
        noOfCattles: { row: 50, col: 3 },

        agriIncome: { row: 51, col: 5 },
        milkIncome: { row: 52, col: 5 },
        incomeFormOtherSource: { row: 53, col: 5 },
        totalAnnualIncomeconsider: { row: 54, col: 5 },

        bankNameOne: { row: 68, col: 3 }, // bank details
        bankBranchOne: { row: 69, col: 3 },
        nameAsPerBankOne: { row: 70, col: 3 },
        AccountNumOne: { row: 71, col: 3 },
        ifscCodeOne: { row: 72, col: 3 },
        MicrCodeOne: { row: 73, col: 3 },
        bankNameTwo: { row: 75, col: 3 }, // bank details
        bankBranchTwo: { row: 76, col: 3 },
        nameAsPerBankTwo: { row: 77, col: 3 },
        AccountNumTwo: { row: 78, col: 3 },
        ifscCodeTwo: { row: 79, col: 3 },
        MicrCodeTwo: { row: 80, col: 3 },
        // annualIncomeOfMilk: { row: 82, col: 3 },
        GrossIncomeFromagriculture: { row: 82, col: 3 }, // aggreculture
        noOfAcreAgriculture: { row: 83, col: 3 },
        nameOfAgricultureOwner: { row: 84, col: 3 },
        noOfAgricultureOwner: { row: 85, col: 3 },
        yearOfDoingAgriculture: { row: 86, col: 3 },
        lastCropDetails: { row: 87, col: 3 },
        lastCropSaleDetails: { row: 88, col: 3 },
        serveyNoAgriculture: { row: 89, col: 3 },
        lastCropSalesInCase: { row: 90, col: 3 },
        LastCropSalesAmount: { row: 91, col: 3 },

        //agriland
        districtOne: { row: 94, col: 1 },
        seasonOne: { row: 94, col: 2 },
        AreaCultivationAcresOne: { row: 94, col: 3 },
        cropOne: { row: 94, col: 4 },
        netIncomeOne: { row: 94, col: 5 },

        districtTwo: { row: 95, col: 1 },
        seasonTwo: { row: 95, col: 2 },
        AreaCultivationAcresTwo: { row: 95, col: 3 },
        cropTwo: { row: 95, col: 4 },
        netIncomeTwo: { row: 95, col: 5 },

        districtThree: { row: 96, col: 1 },
        seasonThree: { row: 96, col: 2 },
        AreaCultivationAcresThree: { row: 96, col: 3 },
        cropThree: { row: 96, col: 4 },
        netIncomeThree: { row: 96, col: 5 },

        agreeTotal: { row: 97, col: 5 },

        GrossIncomeFromMilk: { row: 99, col: 3 }, // cattle details
        totalCatelOfMilk: { row: 100, col: 3 },
        totalBirds: { row: 101, col: 3 },
        dailyMilkOfMilk: { row: 102, col: 3 },
        nameOfDairyOfMilk: { row: 103, col: 3 },
        adressOfDailyOfMilk: { row: 104, col: 3 },
        conctactNumberOfMilk: { row: 105, col: 3 },
        yearOfDoingMilkBussinessOfMilk: { row: 106, col: 3 },
        yearOfMilkProvideAtAboveOfMilk: { row: 107, col: 3 },
        annualIncomeFromMilk: { row: 108, col: 3 },

        GrossIncomeFromOtherIncome: { row: 110, col: 3 },
        incomeReciveForm: { row: 111, col: 3 },
        yearlyIncome: { row: 112, col: 3 },
        totalAnnualIncome: { row: 115, col: 3 },

        grossExpensesFromAgriculture: { row: 117, col: 3 },
        grossExpensesFromMilk: { row: 118, col: 3 },
        grossExpensesFromExisting: { row: 119, col: 3 },

        nameOne: { row: 135, col: 3 }, //referance
        relationOne: { row: 136, col: 3 },
        addressOne: { row: 137, col: 3 },
        mobileOne: { row: 138, col: 3 },
        nameTwo: { row: 142, col: 3 },
        relationTwo: { row: 143, col: 3 },
        addressTwo: { row: 144, col: 3 },
        mobileTwo: { row: 145, col: 3 },

        institutionOne: { row: 123, col: 1 },
        loanAmountOne: { row: 123, col: 2 },
        emiMonthlyOne: { row: 123, col: 3 },
        currentOsOne: { row: 123, col: 4 },
        emiYearlyOne: { row: 123, col: 5 },

        institutionTwo: { row: 124, col: 1 },
        loanAmountTwo: { row: 124, col: 2 },
        emiMonthlyTwo: { row: 124, col: 3 },
        currentOsTwo: { row: 124, col: 4 },
        emiYearlyTwo: { row: 124, col: 5 },

        institutionThree: { row: 125, col: 1 },
        loanAmountThree: { row: 125, col: 2 },
        emiMonthlyThree: { row: 125, col: 3 },
        currentOsThree: { row: 125, col: 4 },
        emiYearlyThree: { row: 125, col: 5 },

        institutionFour: { row: 126, col: 1 },
        loanAmountFour: { row: 126, col: 2 },
        emiMonthlyFour: { row: 126, col: 3 },
        currentOsFour: { row: 126, col: 4 },
        emiYearlyFour: { row: 126, col: 5 },

        netAnnualIncome: { row: 129, col: 3 },
        netAnnualExpenses: { row: 130, col: 3 },
        netMonthlyIncome: { row: 131, col: 3 },

        totalEmiMonthly: { row: 128, col: 5 },
        foir: { row: 133, col: 5 },
      };

      // Function to update cells
      const updateCell = (fieldName, value) => {
        const mapping = fieldMappings[fieldName];
        if (mapping) {
          const updateRange = `${sheetName}!${String.fromCharCode(
            65 + mapping.col
          )}${mapping.row + 1}`;
          return {
            range: updateRange,
            values: [[value || ""]],
          };
        }
        return null;
      };

      // Fetch applicant, co-applicant, and guarantor data
      const appData = await applicantModel.findOne({ customerId });
      const CoappData = await coApplicantModel.find({ customerId });
      const gtrData = await guarantorModel.findOne({ customerId });
      const cibilData = await cibilModel.findOne({ customerId });
      const customerData = await customerModel
        .findOne({ _id: customerId })
        .populate("employeId");
      // console.log(customerData,"customerDatacustomerDatacustomerData")
      const approverData = await approverFormModel.findOne({ customerId });
      const appPdcData = await appPdcModel.findOne({ customerId });
      const milkIncomeDetails = await milkIncomeModel.findOne({ customerId });
      const agricultureDetails = await agricultureModel.findOne({ customerId });
      const partnerData = await finalModel
        .findOne({ customerId })
        .populate("partnerId");
      const employeeData = await employeModel
        .findOne({ _id: customerData?.employeId._id })
        .populate("branchId");
      const creditPdData = await creditPdModel.findOne({ customerId });
      const udyamDetail = await udyamModel.findOne({ customerId });
      const bankStatementDetails = await bankStatementModel.findOne({
        customerId,
      });
      let agriData;
      let milkData;
      let salaryData;
      let otherData;
      if (
        creditPdData?.incomeSource?.some(
          (src) => src?.incomeSourceType === "agricultureBusiness"
        )
      ) {
        agriData =
          creditPdData?.incomeSource?.find(
            (src) => src?.incomeSourceType === "agricultureBusiness"
          )?.agricultureBusiness ?? {};
        // console.log("Agriculture Business Data:", agriData);
      }

      if (
        creditPdData?.incomeSource?.some(
          (src) => src?.incomeSourceType === "milkBusiness"
        )
      ) {
        milkData =
          creditPdData?.incomeSource?.find(
            (src) => src?.incomeSourceType === "milkBusiness"
          )?.milkBusiness ?? {};
        // console.log("Milk Business Data:", milkData);
      }

      if (
        creditPdData?.incomeSource?.some(
          (src) => src?.incomeSourceType === "salaryIncome"
        )
      ) {
        salaryData =
          creditPdData?.incomeSource?.find(
            (src) => src?.incomeSourceType === "salaryIncome"
          )?.salaryIncome ?? {};
        // console.log("Salary Income Data:", salaryData);
      }

      if (
        creditPdData?.incomeSource?.some(
          (src) => src?.incomeSourceType === "other"
        )
      ) {
        otherData =
          creditPdData?.incomeSource?.find(
            (src) => src?.incomeSourceType === "other"
          )?.other ?? {};
        // console.log("Other Income Data:", otherData);
      }

      // console.log(approverData,"approverData<><><><><><><><>",employeeData?.location)
      function formatDate(dob) {
        if (!dob) return "";
        const date = new Date(dob);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      }
      // for cibil
      function getCibilScore(score) {
        if (score === undefined || score === null) return ""; // Return empty string if no score is provided
        return score < 300 ? -1 : score; // Return -1 if score is less than 300, otherwise the actual score
      }
      //for emi
      function getRoundedEMI(emi) {
        if (emi === undefined || emi === null) return ""; // Return empty string for null or undefined
        return Math.round(emi); // Round off the EMI value to the nearest integer
      }
      // for distance
      const haversineDistance = (coords1, coords2) => {
        const toRadians = (degrees) => (degrees * Math.PI) / 180;

        const [lat1, lon1] = coords1;
        const [lat2, lon2] = coords2;

        const R = 6371; // Earth's radius in kilometers

        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);

        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = R * c; // Distance in kilometers
        return distance;
      };

      const calculatePropertyToBranchDistance = async (
        approverData,
        employeeData
      ) => {
        try {
          const propertyCoords = [
            approverData.latitude,
            approverData.longitude,
          ];
          const branchCoords = employeeData?.branchId?.location?.coordinates;

          // Check if coordinates are available
          if (
            !propertyCoords ||
            !branchCoords ||
            propertyCoords.length < 2 ||
            branchCoords.length < 2
          ) {
            console.warn(
              "Coordinates are missing; skipping distance calculation."
            );
            return null; // Return null if coordinates are not available
          }

          const distance = haversineDistance(propertyCoords, branchCoords);

          // Return formatted distance
          if (distance) {
            return `${distance.toFixed(2)} KM from branch`;
          }

          return null; // Return null if distance couldn't be calculated
        } catch (error) {
          console.error("Error calculating distance:", error);
          return null; // Return null in case of an error
        }
      };

      //  let formattedDistance
      const formattedDistance = await calculatePropertyToBranchDistance(
        approverData,
        employeeData
      );

      // Log the formattedDistance after awaiting the result
      // console.log(formattedDistance, "formattedDistance",approverData,"approverData",employeeData);

      // console.log(formattedDistance,"formattedDistance")
      let updates = [];
      updates.push(updateCell("employeeName", employeeData?.employeName));
      updates.push(updateCell("employeeCode", employeeData?.employeUniqueId));
      updates.push(updateCell("branchName", employeeData?.branchId?.name));
      updates.push(updateCell("branchState", employeeData?.branchId?.state));
      updates.push(
        updateCell(
          "partnerName",
          partnerNameData?.partnerId?.fullName?.toUpperCase()
        )
      );
      updates.push(
        updateCell(
          "partnerHeadingName",
          partnerNameData?.partnerId?.fullName?.toUpperCase()
        )
      );
      updates.push(updateCell("fullName", appData?.fullName));
      updates.push(updateCell("CoappFullName1", CoappData[0]?.fullName));
      updates.push(updateCell("CoappFullName2", CoappData[1]?.fullName));
      updates.push(updateCell("gtrFullName", gtrData?.fullName));
      updates.push(updateCell("dob", formatDate(appData?.dob) || ""));
      updates.push(
        updateCell("CoappDob1", formatDate(CoappData[0]?.dob) || "")
      );
      updates.push(
        updateCell("CoappDob2", formatDate(CoappData[1]?.dob) || "")
      );
      updates.push(updateCell("gtrDob", formatDate(gtrData?.dob) || ""));
      updates.push(updateCell("gtrAge", gtrData?.age || ""));
      updates.push(updateCell("age", appData?.age));
      updates.push(updateCell("CoappAge1", CoappData[0]?.age));
      updates.push(updateCell("CoappAge2", CoappData[1]?.age));
      updates.push(
        updateCell("profileOfCustomer", partnerData?.customerProfile)
      ); //
      updates.push(updateCell("sector", "AGRICULTURE"));
      updates.push(updateCell("industry", "FARMING"));
      updates.push(updateCell("gender", appData?.gender));
      updates.push(updateCell("CoappGender", CoappData[0]?.gender));
      updates.push(updateCell("CoappGender2", CoappData[1]?.gender));
      updates.push(updateCell("gtrGender", gtrData?.gender));
      updates.push(updateCell("relationship", "self"));
      updates.push(
        updateCell("Coapprelationship", CoappData[0]?.relationWithApplicant)
      );
      updates.push(
        updateCell("Coapprelationship2", CoappData[1]?.relationWithApplicant)
      );
      updates.push(
        updateCell("gtrrelationship", gtrData?.relationWithApplicant)
      );
      updates.push(updateCell("mobileNo", appData?.mobileNo));
      updates.push(updateCell("CoappMobileNo", CoappData[0]?.mobileNo));
      updates.push(updateCell("CoappMobileNo2", CoappData[1]?.mobileNo));
      updates.push(updateCell("gtrMobileNo", gtrData?.mobileNo));
      updates.push(updateCell("email", appData?.email));
      updates.push(updateCell("CoappEmail", CoappData[0]?.email));
      updates.push(updateCell("CoappEmail2", CoappData[1]?.email));
      updates.push(updateCell("gtrEmail", gtrData?.email));
      updates.push(
        updateCell("address", appData?.permanentAddress.addressLine1)
      );
      updates.push(
        updateCell("CoappAddress", CoappData[0]?.permanentAddress?.addressLine1)
      );
      updates.push(
        updateCell(
          "CoappAddress2",
          CoappData[1]?.permanentAddress?.addressLine1
        )
      );
      updates.push(
        updateCell("gtrAddress", gtrData?.permanentAddress?.addressLine1)
      );
      updates.push(
        updateCell(
          "workAddress",
          udyamDetail?.udyamDetails?.officialAddressOfEnterprise?.VillageTown
        )
      );
      updates.push(
        updateCell("cibil", getCibilScore(cibilData?.applicantCibilScore))
      );
      updates.push(
        updateCell(
          "CoappCibil",
          getCibilScore(cibilData?.coApplicantData[0]?.coApplicantCibilScore)
        )
      );
      updates.push(
        updateCell(
          "CoappCibil2",
          getCibilScore(cibilData?.coApplicantData[1]?.coApplicantCibilScore)
        )
      );
      updates.push(updateCell("gtrCibil", cibilData?.guarantorCibilScore));
      updates.push(updateCell("loanAmount", partnerData?.finalLoanAmount));
      updates.push(updateCell("tenure", partnerData?.tenureInMonth));
      updates.push(updateCell("roi", `${partnerData?.roi}%`));
      updates.push(updateCell("emi", `${getRoundedEMI(partnerData?.emiAmount)}Rs.`));
      // updates.push(updateCell("endUseOfLoan", partnerData?.EndUseOfLoan));
      updates.push(updateCell("geoLimit", formattedDistance));
      updates.push(updateCell("propertyType", approverData?.propertyType)); //collateral
      updates.push(
        updateCell(
          "geographicArea",
          creditPdData?.property?.collateralsDetails?.classOfLocality
        )
      );
      updates.push(
        updateCell("PropertyAddress", approverData?.fullAddressOfProperty)
      );
      updates.push(
        updateCell("PropertyOwnersName", approverData?.nameOfDocumentHolder || approverData?.sellerName)
      );
      updates.push(updateCell("PropertyownerAge", appData?.age));
      updates.push(
        updateCell("ConstructionArea", approverData?.totalBuiltUpArea)
      );
      updates.push(updateCell("legal", "Yes"));
      updates.push(updateCell("technical", "Yes"));
      updates.push(
        updateCell("PropertyMarketValue", approverData?.fairMarketValueOfLand)
      );
      updates.push(updateCell("LTV", approverData?.Ltv));
      updates.push(
        updateCell(
          "agricultureExperience",
          agriData?.agriDoingFromNoOfYears || ""
        )
      );
      updates.push(
        updateCell("milkBusinessExperience", milkData?.doingFromNoOfYears || "")
      );
      updates.push(
        updateCell(
          "otherBusinessExperience",
          salaryData?.doingFromNoYears || ""
        )
      );
      updates.push(
        updateCell(
          "residenceStability",
          appData?.noOfyearsAtCurrentAddress
        )
      );
      updates.push(
        updateCell(
          "agricultureLand",
          partnerData?.agricultureRatnaIncome?.details[0]
            ?.AreaCultivationAcres || ""
        )
      );
      updates.push(
        updateCell("noOfCattles", partnerData?.milkRatnaIncomeCalculation?.totalNoOfMilkGivingCatel || "")
      );
      //income consider
      updates.push(
        updateCell(
          "agriIncome",
          getRoundedEMI(partnerData?.grossCalculation?.agricultureIncome) || ""
        )
      );
      updates.push(
        updateCell(
          "milkIncome",
          partnerData?.grossCalculation?.incomeFromMilk || ""
        )
      );
      updates.push(
        updateCell(
          "incomeFormOtherSource",
          partnerData?.grossCalculation?.incomeFromOtherSource || ""
        )
      );
      updates.push(
        updateCell(
          "totalAnnualIncomeconsider",
          getRoundedEMI(partnerData?.grossCalculation?.totalAnnualIncome) || ""
        )
      );
      // updates.push(updateCell('noConsideredForEligibility', ""));
      updates.push(
        updateCell(
          "bankNameOne",
          bankStatementDetails?.bankDetails[0]?.bankName
        )
      );
      updates.push(
        updateCell(
          "bankBranchOne",
          bankStatementDetails?.bankDetails[0]?.branchName
        )
      );
      updates.push(
        updateCell(
          "nameAsPerBankOne",
          bankStatementDetails?.bankDetails[0]?.acHolderName
        )
      );
      updates.push(
        updateCell(
          "AccountNumOne",
          bankStatementDetails?.bankDetails[0]?.accountNumber
        )
      );
      updates.push(
        updateCell(
          "ifscCodeOne",
          bankStatementDetails?.bankDetails[0]?.ifscCode
        )
      );
      updates.push(updateCell("MicrCodeOne", ""));
      updates.push(
        updateCell(
          "bankNameTwo",
          bankStatementDetails?.bankDetails[0]?.bankName
        )
      );
      updates.push(
        updateCell(
          "bankBranchTwo",
          bankStatementDetails?.bankDetails[0]?.branchName
        )
      );
      updates.push(
        updateCell(
          "nameAsPerBankTwo",
          bankStatementDetails?.bankDetails[0]?.acHolderName
        )
      );
      updates.push(
        updateCell(
          "AccountNumTwo",
          bankStatementDetails?.bankDetails[0]?.accountNumber
        )
      );
      updates.push(
        updateCell(
          "ifscCodeTwo",
          bankStatementDetails?.bankDetails[0]?.ifscCode
        )
      );
      updates.push(updateCell("MicrCodeTwo", ""));
      updates.push(
        updateCell(
          "GrossIncomeFromagriculture",
          getRoundedEMI(partnerData?.grossCalculation?.agricultureIncome)
        )
      ); // aggree business
      updates.push(
        updateCell(
          "noOfAcreAgriculture",
          partnerData?.agricultureRatnaIncome?.details[0]
            ?.AreaCultivationAcres || ""
        )
      );
      updates.push(
        updateCell(
          "nameOfAgricultureOwner",
          creditPdData?.incomeSource[0]?.agricultureBusiness
            ?.nameOfAgriOwner[0] || ""
        )
      );
      updates.push(updateCell("noOfAgricultureOwner", ""));
      updates.push(
        updateCell(
          "yearOfDoingAgriculture",
          agriData?.agriDoingFromNoOfYears || ""
        )
      );
      updates.push(
        updateCell("lastCropDetails", partnerData?.agricultureRatnaIncome?.details[0]?.crop || "")
      );
      updates.push(
        updateCell("lastCropSaleDetails", agriData?.detailOfLastCorp || "")
      );
      updates.push(
        updateCell("serveyNoAgriculture", agriData?.agriLandSurveyNo || "")
      );
      updates.push(updateCell("lastCropSalesInCase", ""));
      updates.push(updateCell("LastCropSalesAmount", ""));

      updates.push(
        updateCell(
          "GrossIncomeFromMilk",
          partnerData?.grossCalculation?.incomeFromMilk
        )
      ); // milk business
      updates.push(
        updateCell("totalCatelOfMilk", partnerData?.milkRatnaIncomeCalculation?.totalNoOfMilkGivingCatel || "")
      );
      updates.push(updateCell("totalBirds", "0"));
      updates.push(
        updateCell("dailyMilkOfMilk", milkData?.noOfMilkGivingCattles || "")
      );
      updates.push(
        updateCell("nameOfDairyOfMilk", milkData?.nameOfDairy || "")
      );
      updates.push(
        updateCell("adressOfDailyOfMilk", milkData?.dairyAddress || "")
      );
      updates.push(
        updateCell("conctactNumberOfMilk", milkData?.dairyOwnerMobNo || "")
      );
      updates.push(
        updateCell(
          "yearOfDoingMilkBussinessOfMilk",
          milkData?.doingFromNoOfYears || ""
        )
      );
      updates.push(
        updateCell(
          "yearOfMilkProvideAtAboveOfMilk",
          milkData?.milkprovideFromSinceYear || ""
        )
      );
      updates.push(
        updateCell(
          "annualIncomeFromMilk",
          partnerData?.grossCalculation?.incomeFromMilk
        )
      ); //income

      updates.push(
        updateCell(
          "GrossIncomeFromOtherIncome",
          partnerData?.otherBusinessIncomeCalculation?.grossBusinessYearlyIncome
        )
      ); //income
      updates.push(
        updateCell("incomeReciveForm", otherData?.discriptionOfBusiness)
      );
      updates.push(
        updateCell(
          "yearlyIncome",
          partnerData?.otherBusinessIncomeCalculation?.grossBusinessYearlyIncome
        )
      );
      updates.push(
        updateCell(
          "totalAnnualIncome",
          partnerData?.grossCalculation?.totalAnnualIncome
        )
      );

      updates.push(
        updateCell(
          "grossExpensesFromAgriculture",
          partnerData?.expensesDetails?.grossExpensesFromAgriculture
        )
      );
      updates.push(
        updateCell(
          "grossExpensesFromMilk",
          partnerData?.expensesDetails?.grossExpensesFromMilk
        )
      );
      updates.push(
        updateCell(
          "grossExpensesFromExisting",
          partnerData?.expensesDetails?.grossExpensesFromExisting
        )
      );

      updates.push(
        updateCell("nameOne", creditPdData?.referenceDetails[0]?.name)
      ); //referance
      updates.push(
        updateCell("relationOne", creditPdData?.referenceDetails[0]?.relation)
      );
      updates.push(
        updateCell("addressOne", creditPdData?.referenceDetails[0]?.address)
      );
      updates.push(
        updateCell("mobileOne", creditPdData?.referenceDetails[0]?.mobileNumber)
      );
      updates.push(
        updateCell("nameTwo", creditPdData?.referenceDetails[1]?.name)
      ); //referance
      updates.push(
        updateCell("relationTwo", creditPdData?.referenceDetails[1]?.relation)
      );
      updates.push(
        updateCell("addressTwo", creditPdData?.referenceDetails[1]?.address)
      );
      updates.push(
        updateCell("mobileTwo", creditPdData?.referenceDetails[1]?.mobileNumber)
      );

      //cibil details
      updates.push(
        updateCell(
          "institutionOne",
          cibilData?.applicantCibilDetail[0]?.loanType
        )
      ); //dependent Three
      updates.push(
        updateCell(
          "loanAmountOne",
          cibilData?.applicantCibilDetail[0]?.loanAmount
        )
      );
      updates.push(
        updateCell(
          "emiMonthlyOne",
          cibilData?.applicantCibilDetail[0]?.emiMonthly
        )
      );
      updates.push(
        updateCell(
          "currentOsOne",
          cibilData?.applicantCibilDetail[0]?.outstandingAmount
        )
      );
      updates.push(
        updateCell(
          "emiYearlyOne",
          cibilData?.applicantCibilDetail[0]?.emiAnnual
        )
      );

      updates.push(
        updateCell(
          "institutionTwo",
          cibilData?.applicantCibilDetail[1]?.loanType
        )
      ); //dependent Three
      updates.push(
        updateCell(
          "loanAmountTwo",
          cibilData?.applicantCibilDetail[1]?.loanAmount
        )
      );
      updates.push(
        updateCell(
          "emiMonthlyTwo",
          cibilData?.applicantCibilDetail[1]?.emiMonthly
        )
      );
      updates.push(
        updateCell(
          "currentOsTwo",
          cibilData?.applicantCibilDetail[1]?.outstandingAmount
        )
      );
      updates.push(
        updateCell(
          "emiYearlyTwo",
          cibilData?.applicantCibilDetail[1]?.emiAnnual
        )
      );

      updates.push(
        updateCell(
          "institutionThree",
          cibilData?.applicantCibilDetail[2]?.loanType
        )
      ); //dependent Three
      updates.push(
        updateCell(
          "loanAmountThree",
          cibilData?.applicantCibilDetail[2]?.loanAmount
        )
      );
      updates.push(
        updateCell(
          "emiMonthlyThree",
          cibilData?.applicantCibilDetail[2]?.emiMonthly
        )
      );
      updates.push(
        updateCell(
          "currentOsThree",
          cibilData?.applicantCibilDetail[2]?.outstandingAmount
        )
      );
      updates.push(
        updateCell(
          "emiYearlyThree",
          cibilData?.applicantCibilDetail[2]?.emiAnnual
        )
      );

      updates.push(
        updateCell(
          "institutionFour",
          cibilData?.applicantCibilDetail[3]?.loanType
        )
      ); //dependent Three
      updates.push(
        updateCell(
          "loanAmountFour",
          cibilData?.applicantCibilDetail[3]?.loanAmount
        )
      );
      updates.push(
        updateCell(
          "emiMonthlyFour",
          cibilData?.applicantCibilDetail[3]?.emiMonthly
        )
      );
      updates.push(
        updateCell(
          "currentOsFour",
          cibilData?.applicantCibilDetail[3]?.outstandingAmount
        )
      );
      updates.push(
        updateCell(
          "emiYearlyFour",
          cibilData?.applicantCibilDetail[3]?.emiAnnual
        )
      );

      updates.push(
        updateCell(
          "totalEmiMonthly",
         
           0
        )
      );

      updates.push(
        updateCell(
          "netAnnualIncome",
          Math.round(partnerData?.netCalculation?.totalNetAnnualIncome)
        )
      );
      updates.push(
        updateCell(
          "netAnnualExpenses",
          Math.round(partnerData?.netCalculation?.totalNetAnnualExpenses)
        )
      );
      updates.push(
        updateCell(
          "netMonthlyIncome",
          Math.round(partnerData?.netCalculation?.totalNetMonthlyIncome)
        )
      );

      updates.push(updateCell("foir", `${getRoundedEMI(partnerData?.foir)}%`));

      updates.push(
        updateCell(
          "districtOne",
          partnerData?.agricultureRatnaIncome?.details[0]?.district
        )
      );
      updates.push(
        updateCell(
          "seasonOne",
          partnerData?.agricultureRatnaIncome?.details[0]?.season
        )
      );
      updates.push(
        updateCell(
          "AreaCultivationAcresOne",
          partnerData?.agricultureRatnaIncome?.details[0]?.AreaCultivationAcres
        )
      );
      updates.push(
        updateCell(
          "cropOne",
          partnerData?.agricultureRatnaIncome?.details[0]?.crop
        )
      );
      updates.push(
        updateCell(
          "netIncomeOne",
          partnerData?.agricultureRatnaIncome?.details[0]?.netIncome
        )
      );

      updates.push(
        updateCell(
          "districtTwo",
          partnerData?.agricultureRatnaIncome?.details[1]?.district
        )
      );
      updates.push(
        updateCell(
          "seasonTwo",
          partnerData?.agricultureRatnaIncome?.details[1]?.season
        )
      );
      updates.push(
        updateCell(
          "AreaCultivationAcresTwo",
          partnerData?.agricultureRatnaIncome?.details[1]?.AreaCultivationAcres
        )
      );
      updates.push(
        updateCell(
          "cropTwo",
          partnerData?.agricultureRatnaIncome?.details[1]?.crop
        )
      );
      updates.push(
        updateCell(
          "netIncomeTwo",
          partnerData?.agricultureRatnaIncome?.details[1]?.netIncome
        )
      );

      updates.push(
        updateCell(
          "districtThree",
          partnerData?.agricultureRatnaIncome?.details[2]?.district
        )
      );
      updates.push(
        updateCell(
          "seasonThree",
          partnerData?.agricultureRatnaIncome?.details[2]?.season
        )
      );
      updates.push(
        updateCell(
          "AreaCultivationAcresThree",
          partnerData?.agricultureRatnaIncome?.details[2]?.AreaCultivationAcres
        )
      );
      updates.push(
        updateCell(
          "cropThree",
          partnerData?.agricultureRatnaIncome?.details[2]?.crop
        )
      );
      updates.push(
        updateCell(
          "netIncomeThree",
          partnerData?.agricultureRatnaIncome?.details[2]?.netIncome
        )
      );

      updates.push(
        updateCell(
          "agreeTotal",
          partnerData?.agricultureRatnaIncome?.grossYearlyIncome
        )
      );

      // Remove null updates (in case there are any invalid field mappings)
      const validUpdates = updates.filter((update) => update !== null);

      // Update the spreadsheet
      if (validUpdates.length > 0) {
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId,
          requestBody: {
            data: validUpdates,
            valueInputOption: "RAW",
          },
        });
      }

      // Prepare data for appending a new row
      const nextRowIndex = rows.length + 1; // 0-indexed, appending to the last row
      const newRow = [""];

      // Append the new row
      const appendUpdate = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A${nextRowIndex + 1}`,
        valueInputOption: "RAW",
        requestBody: {
          values: [newRow],
        },
      });

      // Construct the export URL for the specified spreadsheet
      const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx&sheet=${sheetName}`;

      // Get the access token
      const token = await authClient.getAccessToken();

      // Download the file using Axios with the access token
      const response = await axios.get(exportUrl, {
        responseType: "stream",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Set response headers for file download
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${sheetName}.xlsx"`
      );

      // Pipe the file stream to the response
      response.data.pipe(res);
    }

    //grow money
    else if (
      partnerNameData?.partnerId?.fullName == "grow money capital pvt ltd" ||
      partnerNameData?.partnerId?.fullName == "GROW MONEY CAPITAL PVT LTD"
    ) {
      // console.log("in grow block")
      const spreadsheetId = "1mW19iyKObvfgRT33kc3o13aiiU-5iFwpmFTFj5gZBFQ"; // Your spreadsheet ID
      const sheetName = "Sheet1"; // Your sheet name

      const auth = new google.auth.GoogleAuth({
        credentials, // Your credentials object or JSON key file
        scopes: [
          "https://www.googleapis.com/auth/spreadsheets",
          "https://www.googleapis.com/auth/drive.readonly",
        ],
      });

      const authClient = await auth.getClient();
      const sheets = google.sheets({ version: "v4", auth: authClient });

      // Fetch data from the sheet
      const responses = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:Z`, // Fetch entire sheet or range you want
      });

      const rows = responses.data.values;
      console.log(rows, "rowsrowsrowsrows");
      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: "No data found in the sheet" });
      }

      // Field mappings
      const fieldMappings = {
        borrowerName: { row: 4, col: 1 }, // A5 (row index starts from 0)
        occupation: { row: 4, col: 4 }, // D5
        dob: { row: 4, col: 5 }, // E5
        age: { row: 4, col: 6 },
        sex: { row: 4, col: 7 },
        caste: { row: 4, col: 8 },
        religion: { row: 4, col: 9 },
        maritalStatus: { row: 4, col: 10 },
        telephoneNo: { row: 4, col: 11 },
        relationshipWithCustomer: { row: 4, col: 12 },
        cibil: { row: 4, col: 13 },

        coBorrowerName: { row: 5, col: 1 }, //co-app
        coOccupation: { row: 5, col: 4 },
        coDob: { row: 5, col: 5 },
        coAge: { row: 5, col: 6 },
        coSex: { row: 5, col: 7 },
        coCaste: { row: 5, col: 8 },
        coReligion: { row: 5, col: 9 },
        coMaritalStatus: { row: 5, col: 10 },
        coTelephoneNo: { row: 5, col: 11 },
        coRelationshipWithCustomer: { row: 5, col: 12 },
        coCibil: { row: 5, col: 13 },

        coTwoBorrowerName: { row: 6, col: 1 }, //co-app two
        coTwoOccupation: { row: 6, col: 4 },
        coTwoDob: { row: 6, col: 5 },
        coTwoAge: { row: 6, col: 6 },
        coTwoSex: { row: 6, col: 7 },
        coTwoCaste: { row: 6, col: 8 },
        coTwoReligion: { row: 6, col: 9 },
        coTwoMaritalStatus: { row: 6, col: 10 },
        coTwoTelephoneNo: { row: 6, col: 11 },
        coTwoRelationshipWithCustomer: { row: 6, col: 12 },
        coTwoCibil: { row: 6, col: 13 },

        guarantorBorrowerName: { row: 9, col: 1 }, //Guarantor
        guarantorOccupation: { row: 9, col: 4 },
        guarantorDob: { row: 9, col: 5 },
        guarantorAge: { row: 9, col: 6 },
        guarantorSex: { row: 9, col: 9 },
        guarantorCaste: { row: 9, col: 8 },
        guarantorReligion: { row: 9, col: 9 },
        guarantorMaritalStatus: { row: 9, col: 10 },
        guarantorTelephoneNo: { row: 9, col: 11 },
        guarantorRelationshipWithCustomer: { row: 9, col: 12 },
        guarantorCibil: { row: 9, col: 13 },

        currentResidance: { row: 10, col: 1 }, //Guarantor
        propertyAddress: { row: 10, col: 5 },
        business: { row: 10, col: 8 },
        occupation: { row: 10, col: 11 },
        officeContact: { row: 10, col: 13 },

        loanAmount: { row: 11, col: 1 },
        roi: { row: 11, col: 3 },
        profile: { row: 11, col: 5 },
        product: { row: 11, col: 7 },
        typeOfProperty: { row: 11, col: 9 },
        purposeOfLoan: { row: 11, col: 11 },
        presentOwner: { row: 11, col: 13 },

        emiAmount: { row: 12, col: 1 },
        foirAmount: { row: 12, col: 3 },
        tenureMonthDetails: { row: 12, col: 5 },
        ltvDetails: { row: 12, col: 7 },
        moratoriumPeriodMonth: { row: 12, col: 9 },
        proposedOwner: { row: 12, col: 13 },

        natureOfBusiness: { row: 13, col: 1 },
        branch: { row: 13, col: 3 },
        totalIncomeDetails: { row: 13, col: 5 },
        natureOfIncome: { row: 13, col: 7 },
        averageBankingBalance: { row: 13, col: 9 },

        personalInfo: { row: 14, col: 2 },
        businessIncDetails: { row: 15, col: 2 },
        endUse: { row: 16, col: 2 },
        personMetDuringPd: { row: 17, col: 2 },
        propertyDetails: { row: 18, col: 2 },

        //depended
        dependentNameOne: { row: 20, col: 1 },
        dependentAgeOne: { row: 20, col: 3 },
        dependentRelationOne: { row: 20, col: 4 },
        dependentAnnualOne: { row: 20, col: 5 },
        dependentOccupationOne: { row: 20, col: 6 },
        dependentinstitutionOfStudentOne: { row: 20, col: 7 },
        dependentnameOfTheOrganisationOne: { row: 20, col: 11 },
        dependentdesignationOne: { row: 20, col: 12 },
        dependentdateOfJoiningOne: { row: 20, col: 13 },

        dependentNameTwo: { row: 21, col: 1 },
        AgeTwo: { row: 21, col: 3 },
        RelationTwo: { row: 21, col: 4 },
        AnnualTwo: { row: 21, col: 5 },
        OccupationTwo: { row: 21, col: 6 },
        institutionOfStudentTwo: { row: 21, col: 7 },
        nameOfTheOrganisationTwo: { row: 21, col: 11 },
        designationTwo: { row: 21, col: 12 },
        dateOfJoiningTwo: { row: 21, col: 13 },

        dependentNameThree: { row: 22, col: 1 },
        AgeThree: { row: 22, col: 3 },
        RelationThree: { row: 22, col: 4 },
        AnnualThree: { row: 22, col: 5 },
        OccupationThree: { row: 22, col: 6 },
        institutionOfStudentThree: { row: 22, col: 7 },
        nameOfTheOrganisationThree: { row: 22, col: 11 },
        designationThree: { row: 22, col: 12 },
        dateOfJoiningThree: { row: 22, col: 13 },
        //cibil

        institutionOne: { row: 27, col: 0 },
        loanTypeOne: { row: 27, col: 1 },
        loanAmountOne: { row: 27, col: 2 },
        currentOsOne: { row: 27, col: 3 },
        roiOne: { row: 27, col: 4 },
        ownershipOne: { row: 27, col: 5 },
        emiMonthlyOne: { row: 27, col: 6 },
        totalTenureOne: { row: 27, col: 7 },
        balanceTenureOne: { row: 27, col: 8 },
        loanStatusOne: { row: 27, col: 9 },
        ObligatedOne: { row: 27, col: 10 },
        ObligationConsideredOne: { row: 27, col: 11 },

        institutionTwo: { row: 28, col: 0 },
        loanTypeTwo: { row: 28, col: 1 },
        loanAmountTwo: { row: 28, col: 2 },
        currentOsTwo: { row: 28, col: 3 },
        roiTwo: { row: 28, col: 4 },
        ownershipTwo: { row: 28, col: 5 },
        emiMonthlyTwo: { row: 28, col: 6 },
        totalTenureTwo: { row: 28, col: 7 },
        balanceTenureTwo: { row: 28, col: 8 },
        loanStatusTwo: { row: 28, col: 9 },
        ObligatedTwo: { row: 28, col: 10 },
        ObligationConsideredTwo: { row: 28, col: 11 },

        institutionThree: { row: 29, col: 0 },
        loanTypeThree: { row: 29, col: 1 },
        loanAmountThree: { row: 29, col: 2 },
        currentOsThree: { row: 29, col: 3 },
        roiThree: { row: 29, col: 4 },
        ownershipThree: { row: 29, col: 5 },
        emiMonthlyThree: { row: 29, col: 6 },
        totalTenureThree: { row: 29, col: 7 },
        balanceTenureThree: { row: 29, col: 8 },
        loanStatusThree: { row: 29, col: 9 },
        ObligatedThree: { row: 29, col: 10 },
        ObligationConsideredThree: { row: 29, col: 11 },

        institutionFour: { row: 30, col: 0 },
        loanTypeFour: { row: 30, col: 1 },
        loanAmountFour: { row: 30, col: 2 },
        currentOsFour: { row: 30, col: 3 },
        roiFour: { row: 30, col: 4 },
        ownershipFour: { row: 30, col: 5 },
        emiMonthlyFour: { row: 30, col: 6 },
        totalTenureFour: { row: 30, col: 7 },
        balanceTenureFour: { row: 30, col: 8 },
        loanStatusFour: { row: 30, col: 9 },
        ObligatedFour: { row: 30, col: 10 },
        ObligationConsideredFour: { row: 30, col: 11 },

        applicantTotalObligation: { row: 33, col: 11 },

        totalIncome: { row: 35, col: 1 },
        obligation: { row: 35, col: 4 },
        emi: { row: 35, col: 8 },
        foir: { row: 35, col: 12 },
        ltv: { row: 47, col: 1 },

        institutionFive: { row: 31, col: 0 },
        loanTypeFive: { row: 31, col: 1 },
        loanAmountFive: { row: 31, col: 2 },
        currentOsFive: { row: 31, col: 3 },
        roiFive: { row: 31, col: 4 },
        ownershipFive: { row: 31, col: 5 },
        emiMonthlyFive: { row: 31, col: 6 },
        totalTenureFive: { row: 31, col: 7 },
        balanceTenureFive: { row: 31, col: 8 },
        loanStatusFive: { row: 31, col: 9 },
        ObligatedFive: { row: 31, col: 10 },
        ObligationConsideredFive: { row: 31, col: 11 },

        valuationValueOne: { row: 37, col: 1 },
        valuationDoneBy: { row: 37, col: 3 },
        propertyAddress: { row: 38, col: 1 },
        propertySize: { row: 39, col: 1 },
        marketLandValue: { row: 41, col: 1 },
        marketConstructionValue: { row: 41, col: 2 },
        marketAmenitiesValue: { row: 41, col: 3 },
        marketTotalValuesss: { row: 41, col: 4 },
        realizableLandValue: { row: 42, col: 1 },
        valuationOne: { row: 18, col: 9 },
        ltv: { row: 47, col: 1 },
        valuationValuethree: { row: 45, col: 4 },

        bankAccountNoApp: { row: 38, col: 9 },
        typeOfAccApp: { row: 39, col: 9 },
        nameOfBankApp: { row: 40, col: 9 },
        avgBankBalanceApp: { row: 41, col: 9 },
        remarkApp: { row: 42, col: 9 },

        nameOneReferance: { row: 50, col: 0 },
        relationOne: { row: 50, col: 1 },
        telephoneNoOne: { row: 50, col: 2 },
        nativeOfOne: { row: 50, col: 4 },

        nameTwoReferance: { row: 51, col: 0 },
        relationTwo: { row: 51, col: 1 },
        telephoneNoTwo: { row: 51, col: 2 },
        nativeOfTwo: { row: 51, col: 4 },
        // nativeOfOne: { row: 42, col: 9 },

        name: { row: 50, col: 7 },
        occupation: { row: 50, col: 8 },
        contactNo: { row: 50, col: 9 },
        Remarks: { row: 50, col: 10 },

        deviationsOne: { row: 54, col: 1 },
        deviationsTwo: { row: 55, col: 1 },
        deviationsThree: { row: 56, col: 1 },
        // deviationsFour: { row: 57, col: 1 },

        mitigateOne: { row: 54, col: 11 },
        mitigateTwo: { row: 55, col: 11 },
        mitigateThree: { row: 56, col: 11 },
        // mitigateFour: { row: 57, col: 1 },

        sanctionConditionOne: { row: 58, col: 1 },
        sanctionConditionTwo: { row: 59, col: 1 },
        sanctionConditionThree: { row: 60, col: 1 },
        sanctionConditionFour: { row: 70, col: 1 },

        pdDoneBy: { row: 64, col: 1 },
        dateOfLog: { row: 64, col: 2 },
        CamPrepared: { row: 65, col: 1 },
        salesManager: { row: 66, col: 1 },

        // income details
        districtOne: { row: 74, col: 0 },
        seasonOne: { row: 74, col: 1 },
        AreaCultivationAcresOne: { row: 74, col: 2 },
        cropOne: { row: 74, col: 3 },
        netIncomeOne: { row: 74, col: 4 },

        districtTwo: { row: 75, col: 0 },
        seasonTwo: { row: 75, col: 1 },
        AreaCultivationAcresTwo: { row: 75, col: 2 },
        cropTwo: { row: 75, col: 3 },
        netIncomeTwo: { row: 75, col: 4 },

        districtThree: { row: 76, col: 0 },
        seasonThree: { row: 76, col: 1 },
        AreaCultivationAcresThree: { row: 76, col: 2 },
        cropThree: { row: 76, col: 3 },
        netIncomeThree: { row: 76, col: 4 },

        districtFour: { row: 77, col: 0 },
        seasonFour: { row: 77, col: 1 },
        AreaCultivationAcresFour: { row: 77, col: 2 },
        cropFour: { row: 77, col: 3 },
        netIncomeFour: { row: 77, col: 4 },

        // totalFormula: { row: 78, col: 4 },
        //milk details

        monthsOne: { row: 82, col: 0 },
        saleOfMilkOne: { row: 82, col: 1 },

        monthsTwo: { row: 83, col: 0 },
        saleOfMilkTwo: { row: 83, col: 1 },

        monthsThree: { row: 84, col: 0 },
        saleOfMilkThree: { row: 84, col: 1 },

        monthsFour: { row: 85, col: 0 },
        saleOfMilkFour: { row: 85, col: 1 },

        averageSaleOfMilk: { row: 86, col: 1 },
        ConsiderableMilkIncomePercentage: { row: 87, col: 1 },

        // total income

        nameOne: { row: 92, col: 0 },
        sourceOne: { row: 92, col: 1 },
        amountOne: { row: 92, col: 2 },

        nameTwo: { row: 93, col: 0 },
        sourceTwo: { row: 93, col: 1 },
        amountTwo: { row: 93, col: 2 },

        IncomeTotalFormula: { row: 94, col: 2 },
      };
      // console.log(fieldMappings, "fieldMappingsfieldMappings");
      // Function to update cells
      const updateCell = (fieldName, value) => {
        const mapping = fieldMappings[fieldName];
        if (mapping) {
          const updateRange = `${sheetName}!${String.fromCharCode(
            65 + mapping.col
          )}${mapping.row + 1}`;
          return {
            range: updateRange,
            values: [[value || ""]],
          };
        }
        return null;
      };

      // Fetch applicant, co-applicant, and guarantor data
      const appData = await applicantModel.findOne({ customerId });
      const CoappData = await coApplicantModel.find({ customerId });
      const gtrData = await guarantorModel.findOne({ customerId });
      const cibilData = await cibilModel.findOne({ customerId });
      const customerData = await customerModel
        .findOne({ _id: customerId })
        .populate({
          path: "employeId",
          populate: {
            path: "branchId",
            model: "newbranch", // Ensure the model name matches your Branch schema
          },
        })
        .populate({
          path: "productId",
        });
      // console.log(customerData, "customerDatacustomerDatacustomerData");
      const approverData = await approverFormModel
        .findOne({ customerId })
        .populate("vendorId");
      const appPdcData = await appPdcModel.findOne({ customerId });
      const milkIncomeDetails = await milkIncomeModel.findOne({ customerId });
      const agricultureDetails = await agricultureModel.findOne({ customerId });
      const partnerData = await finalModel
        .findOne({ customerId })
        .populate("partnerId")
        .populate("employeeId");
      const employeeData = await employeModel
        .findOne({ _id: customerData?.employeId._id })
        .populate("branchId");
      const reportingManagerData = await employeModel.findOne({
        _id: customerData?.employeId.reportingManagerId,
      });
      const creditPdData = await creditPdModel
        .findOne({ customerId })
        .populate("pdId");
      const udyamDetail = await udyamModel.findOne({ customerId });
      const internalLegalDetails = await internalLegalModel.findOne({
        customerId,
      });
      const bankStatementDetails = await bankStatementModel.findOne({
        customerId,
      });
      // console.log(udyamDetail, "udyamDetail",udyamDetail?.udyamDetails?.officialAddressOfEnterprise?.VillageTown);
      // console.log(approverData,"agricultureDetails")
      // Prepare updates
      function formatDate(dob) {
        if (!dob) return "";
        const date = new Date(dob);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      }

      function formatDBDate(dateString) {
        if (!dateString) return ""; // Return empty string if no date is provided

        // Handle specific format parsing
        const sanitizedDateString = dateString
          .replace(" PM", "")
          .replace(" AM", ""); // Remove AM/PM for compatibility
        const date = new Date(sanitizedDateString);

        if (isNaN(date)) {
          console.error("Invalid date format:", dateString);
          return ""; // Return empty string if the date is invalid
        }

        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
        const year = String(date.getFullYear()); // Use the full year
        return `${day}-${month}-${year}`;
      }

      // for cibil
      function getCibilScore(score) {
        if (score === undefined || score === null) return ""; // Return empty string if no score is provided
        return score < 300 ? -1 : score; // Return -1 if score is less than 300, otherwise the actual score
      }
      //for emi
      function getRoundedEMI(emi) {
        if (emi === undefined || emi === null) return ""; // Return empty string for null or undefined
        return Math.round(emi).toFixed(2); // Round off the EMI value to the nearest integer
      }

      let agriData;
      let milkData;
      let salaryData;
      let otherData;
      if (
        creditPdData?.incomeSource?.some(
          (src) => src?.incomeSourceType === "agricultureBusiness"
        )
      ) {
        agriData =
          creditPdData?.incomeSource?.find(
            (src) => src?.incomeSourceType === "agricultureBusiness"
          )?.agricultureBusiness ?? {};
        //  console.log("Agriculture Business Data:", agriData);
      }

      if (
        creditPdData?.incomeSource?.some(
          (src) => src?.incomeSourceType === "milkBusiness"
        )
      ) {
        milkData =
          creditPdData?.incomeSource?.find(
            (src) => src?.incomeSourceType === "milkBusiness"
          )?.milkBusiness ?? {};
        //  console.log("Milk Business Data:", milkData);
      }

      if (
        creditPdData?.incomeSource?.some(
          (src) => src?.incomeSourceType === "salaryIncome"
        )
      ) {
        salaryData =
          creditPdData?.incomeSource?.find(
            (src) => src?.incomeSourceType === "salaryIncome"
          )?.salaryIncome ?? {};
        //  console.log("Salary Income Data:", salaryData);
      }

      if (
        creditPdData?.incomeSource?.some(
          (src) => src?.incomeSourceType === "other"
        )
      ) {
        otherData =
          creditPdData?.incomeSource?.find(
            (src) => src?.incomeSourceType === "other"
          )?.other ?? {};
        //  console.log("Other Income Data:", otherData);
      }
      const updates = [];
      updates.push(updateCell("borrowerName", appData?.fullName)); //applicant
      updates.push(
        updateCell("occupation", appData?.occupation)
      );
      updates.push(updateCell("dob", formatDate(appData?.dob)));
      updates.push(updateCell("age", appData?.age));
      updates.push(updateCell("sex", appData?.gender));
      updates.push(updateCell("caste", appData?.caste));
      updates.push(updateCell("religion", appData?.religion));
      updates.push(
        updateCell("maritalStatus", appData?.maritalStatus)
      );
      updates.push(updateCell("telephoneNo", appData?.mobileNo));
      updates.push(updateCell("relationshipWithCustomer", ""));
      updates.push(updateCell("cibil", cibilData?.applicantCibilScore));

      updates.push(updateCell("coBorrowerName", CoappData[0]?.fullName)); //co-applicant
      updates.push(
        updateCell("coOccupation", CoappData[0]?.occupation)
      );
      updates.push(updateCell("coDob", formatDate(CoappData[0]?.dob)));
      updates.push(updateCell("coAge", CoappData[0]?.age));
      updates.push(updateCell("coSex", CoappData[0]?.gender));
      updates.push(updateCell("coCaste", CoappData[0]?.caste));
      updates.push(updateCell("coReligion", CoappData[0]?.religion));
      updates.push(
        updateCell(
          "coMaritalStatus",
          CoappData[0]?.maritalStatus
        )
      );
      updates.push(updateCell("coTelephoneNo", CoappData[0]?.mobileNo));
      updates.push(
        updateCell(
          "coRelationshipWithCustomer",
          CoappData[0]?.relationWithApplicant
        )
      );
      updates.push(
        updateCell(
          "coCibil",
          cibilData?.coApplicantData[0]?.coApplicantCibilScore
        )
      );

      updates.push(updateCell("coTwoBorrowerName", CoappData[1]?.fullName)); //co-applicant-two
      updates.push(
        updateCell("coTwoOccupation", CoappData[1]?.occupation)
      );
      updates.push(updateCell("coTwoDob", formatDate(CoappData[1]?.dob)));
      updates.push(updateCell("coTwoAge", CoappData[1]?.age));
      updates.push(updateCell("coTwoSex", CoappData[1]?.gender));
      updates.push(
        updateCell("coTwoCaste", CoappData[1]?.caste)
      );
      updates.push(updateCell("coTwoReligion", CoappData[1]?.religion));
      updates.push(
        updateCell(
          "coTwoMaritalStatus",
          CoappData[1]?.maritalStatus
        )
      );
      updates.push(updateCell("coTwoTelephoneNo", CoappData[1]?.mobileNo));
      updates.push(
        updateCell(
          "coTwoRelationshipWithCustomer",
          CoappData[1]?.relationWithApplicant
        )
      );
      updates.push(
        updateCell(
          "coTwoCibil",
          cibilData?.coApplicantData[1]?.coApplicantCibilScore
        )
      );

      updates.push(updateCell("guarantorBorrowerName", gtrData?.fullName)); //gurantor details
      updates.push(
        updateCell("guarantorOccupation", gtrData?.occupation)
      );
      updates.push(updateCell("guarantorDob", formatDate(gtrData?.dob)));
      updates.push(updateCell("guarantorAge", gtrData?.age));
      updates.push(updateCell("guarantorSex", gtrData?.gender));
      updates.push(
        updateCell("guarantorCaste", gtrData?.caste)
      );
      updates.push(updateCell("guarantorReligion", gtrData?.religion));
      updates.push(
        updateCell(
          "guarantorMaritalStatus",
          gtrData?.maritalStatus
        )
      );
      updates.push(updateCell("guarantorTelephoneNo", gtrData?.mobileNo));
      updates.push(
        updateCell(
          "guarantorRelationshipWithCustomer",
          gtrData?.relationWithApplicant
        )
      );
      updates.push(
        updateCell("guarantorCibil", cibilData?.guarantorCibilScore)
      );

      updates.push(
        updateCell("currentResidance", appData?.permanentAddress?.addressLine1)
      );
      updates.push(
        updateCell("propertyAddress", approverData?.fullAddressOfProperty)
      );
      updates.push(
        updateCell(
          "business",
          udyamDetail?.udyamDetails?.officialAddressOfEnterprise?.VillageTown
        )
      );
      updates.push(
        updateCell("occupation", appData?.occupation)
      );
      updates.push(
        updateCell(
          "officeContact",
          udyamDetail?.udyamDetails?.officialAddressOfEnterprise?.mobile
        )
      );

      updates.push(updateCell("loanAmount", partnerData?.finalLoanAmount));
      updates.push(updateCell("roi", partnerData?.roi));
      updates.push(updateCell("profile", partnerData?.customerProfile));
      updates.push(updateCell("product", customerData?.productId?.productName));
      updates.push(updateCell("typeOfProperty", approverData?.propertyType));
      // updates.push(updateCell("purposeOfLoan", partnerData?.EndUseOfLoan));
      updates.push(
        updateCell("presentOwner", approverData?.nameOfDocumentHolder || approverData?.sellerName)
      );

      updates.push(updateCell("emiAmount", partnerData?.emiAmount));
      updates.push(
        updateCell("foirAmount", `${getRoundedEMI(partnerData?.foir)}%`)
      );
      updates.push(
        updateCell("tenureMonthDetails", partnerData?.tenureInMonth)
      );
      updates.push(updateCell("ltvDetails", approverData?.Ltv));
      updates.push(updateCell("moratoriumPeriodMonth", " "));
      updates.push(
        updateCell("proposedOwner", approverData?.nameOfDocumentHolder || approverData?.sellerName)
      );

      updates.push(
        updateCell("natureOfBusiness", appData?.businessType)
      );
      updates.push(
        updateCell("branch", customerData?.employeId?.branchId?.name)
      );
      updates.push(
        updateCell(
          "totalIncomeDetails",
          getRoundedEMI(
            partnerData?.totalIncomeMonthlyCalculation?.totalFormula
          )
        )
      );
      updates.push(updateCell("natureOfIncome", "With income proof "));
      updates.push(updateCell("averageBankingBalance", "0.00"));

      updates.push(
        updateCell(
          "personalInfo",
          `(Applicant, Co-applicant & Assets Base -- family, residence, stability, assets seen etc) 
Applicant Mr. ${appData?.fullName ?? ""} S/O ${
            appData?.fatherName ?? ""
          } & Co-applicant ${
            CoappData[0]?.fullName ?? ""
          }  in the proposed deal are residing at ${
            appData?.permanentAddress?.addressLine1 ?? ""
          } Currently the customer is residing in the above mentioned address. Applicant is living with his spouse, .
Asset Base – ${creditPdData?.assetDetails[0]?.name ?? ""}, ${
            creditPdData?.assetDetails[1]?.name ?? ""
          }, ${creditPdData?.assetDetails[2]?.name ?? ""}, ${
            creditPdData?.assetDetails[3]?.name ?? ""
          } etc. Living standard is good. Resi Reference check done and found positive.
        `
        )
      );
      updates.push(
        updateCell(
          "businessIncDetails",
          `APPLICANT ${appData?.fullName ?? ""} IS ${
            partnerData?.customerProfile ?? ""
          } INVOLVE IN AGRICULTURE AND MILK SUPPLY BUSSINESS FROM PAST ${
            agriData?.agriDoingFromNoOfYears ?? ""
          } YEARS, APPLICANT IS HAVING ${
            agriData?.agriLandInBigha ?? ""
          } ACRE OF PRODUCTIVE AGRICULTURE LAND WHICH IS IN THE NAME OF ${
            agriData?.nameOfAgriOwner ?? ""
          }
APPLICANT GENERALLY CULTIVATE ${
            agriData?.whichCropIsPlanted ?? ""
          }, APPLICANT IS NET EARNING AROUND ${
            agriData?.agriIncomeYearly ?? ""
          } PER ANNUM , APPLICANT IS NET EARNING AROUND RS. ${
            partnerData?.agricultureIncome?.totalFormula ?? ""
          } PER ANNUM ,NET MONTHLY INCOME FROM THIS BUSINESS IS AROUND ${
            partnerData?.agricultureIncome?.totalFormula ?? ""
          }.
APPLICANT IS ALSO INVOLVE IN MILK BUSINESS HAVING CATTLES ${
            milkData?.noOfMilkGivingCattles ?? ""
          } LTR PER DAY WHICH IS SOLD TO NEARBY DAIRY , DAIRY NAME IS ${
            milkData?.nameOfDairy ?? ""
          } FROM THIS BUSINESS APPLICANT IS EARNING AROUND ${
            milkData?.monthlyIncomeMilkBusiness ?? ""
          } PER MONTH AND NET EARNING FROM THIS BUSINESS IS RS ${
            partnerData?.milkIncomeCalculation?.calculation
              ?.averageSaleOfMilk ?? ""
          }.
        `
        )
      );
      updates.push(
        updateCell(
          "endUse",
          `Loan required for ${
            partnerData?.EndUseOfLoan ?? ""
          }. Customer EMI comforts ${partnerData?.emiAmount ?? ""} per month.`
        )
      );
      updates.push(
        updateCell("personMetDuringPd", `Applicant and Co-applicant.`)
      );
      updates.push(
        updateCell(
          "propertyDetails",
          `Property Address - ${approverData?.fullAddressOfProperty ?? ""},
Patta No.- ${internalLegalDetails?.gramPanchayat?.no ?? ""}
Area of property –  ${approverData?.totalLandArea ?? ""}
Property owner – ${approverData?.nameOfDocumentHolder ?? ""} ${approverData?.sellerName ?? ""}
Approx. Property Value - ${approverData?.constructionValue ?? ""}
Property Type - ${approverData?.propertyType ?? ""}
Area Development - ${approverData?.developmentPercentage ?? ""}
Property Title - ${approverData?.propertyType ?? ""}
Patta Date - ${internalLegalDetails?.gramPanchayat?.date ?? ""} `
        )
      ); //dpeepnd
      updates.push(
        updateCell(
          "dependentNameOne",
          creditPdData?.department_info[0]?.dependent_Name
        )
      ); //dependent
      updates.push(
        updateCell("dependentAgeOne", creditPdData?.department_info[0]?.age)
      );
      updates.push(
        updateCell(
          "dependentRelationOne",
          creditPdData?.department_info[0]?.Relationship
        )
      );
      updates.push(
        updateCell(
          "dependentAnnualOne",
          creditPdData?.department_info[0]?.Annual_Income
        )
      );
      updates.push(
        updateCell(
          "dependentOccupationOne",
          creditPdData?.department_info[0]?.Occupation
        )
      );
      updates.push(
        updateCell(
          "dependentinstitutionOfStudentOne",
          creditPdData?.department_info[0]?.Institution_of_studen
        )
      );
      updates.push(
        updateCell(
          "dependentnameOfTheOrganisationOne",
          creditPdData?.department_info[0]?.Name_of_Organization
        )
      );
      updates.push(
        updateCell(
          "dependentdesignationOne",
          creditPdData?.department_info[0]?.Designation
        )
      );
      updates.push(
        updateCell(
          "dependentdateOfJoiningOne",
          creditPdData?.department_info[0]?.Date_of_joining
        )
      );

      updates.push(
        updateCell(
          "dependentNameTwo",
          creditPdData?.department_info[1]?.dependent_Name
        )
      ); //dependent two
      updates.push(updateCell("AgeTwo", creditPdData?.department_info[1]?.age));
      updates.push(
        updateCell(
          "RelationTwo",
          creditPdData?.department_info[1]?.Relationship
        )
      );
      updates.push(
        updateCell("AnnualTwo", creditPdData?.department_info[1]?.Annual_Income)
      );
      updates.push(
        updateCell(
          "OccupationTwo",
          creditPdData?.department_info[1]?.Occupation
        )
      );
      updates.push(
        updateCell(
          "institutionOfStudentTwo",
          creditPdData?.department_info[1]?.Institution_of_studen
        )
      );
      updates.push(
        updateCell(
          "nameOfTheOrganisationTwo",
          creditPdData?.department_info[1]?.Name_of_Organization
        )
      );
      updates.push(
        updateCell(
          "designationTwo",
          creditPdData?.department_info[1]?.Designation
        )
      );
      updates.push(
        updateCell(
          "dateOfJoiningTwo",
          creditPdData?.department_info[1]?.Date_of_joining
        )
      );

      updates.push(
        updateCell(
          "dependentNameThree",
          creditPdData?.department_info[2]?.dependent_Name
        )
      ); //dependent Three
      updates.push(
        updateCell("AgeThree", creditPdData?.department_info[2]?.age)
      );
      updates.push(
        updateCell(
          "RelationThree",
          creditPdData?.department_info[2]?.Relationship
        )
      );
      updates.push(
        updateCell(
          "AnnualThree",
          creditPdData?.department_info[2]?.Annual_Income
        )
      );
      updates.push(
        updateCell(
          "OccupationThree",
          creditPdData?.department_info[2]?.Occupation
        )
      );
      updates.push(
        updateCell(
          "institutionOfStudentThree",
          creditPdData?.department_info[2]?.Institution_of_studen
        )
      );
      updates.push(
        updateCell(
          "nameOfTheOrganisationThree",
          creditPdData?.department_info[2]?.Name_of_Organization
        )
      );
      updates.push(
        updateCell(
          "designationThree",
          creditPdData?.department_info[2]?.Designation
        )
      );
      updates.push(
        updateCell(
          "dateOfJoiningThree",
          creditPdData?.department_info[2]?.Date_of_joining
        )
      );

      updates.push(
        updateCell(
          "institutionOne",
          cibilData?.applicantCibilDetail[0]?.Institution
        )
      ); //dependent Three
      updates.push(
        updateCell("loanTypeOne", cibilData?.applicantCibilDetail[0]?.loanType)
      );
      updates.push(
        updateCell(
          "loanAmountOne",
          cibilData?.applicantCibilDetail[0]?.loanAmount
        )
      );
      updates.push(
        updateCell(
          "currentOsOne",
          cibilData?.applicantCibilDetail[0]?.outstandingAmount
        )
      );
      updates.push(
        updateCell("roiOne", cibilData?.applicantCibilDetail[0]?.RateOfInterest)
      );
      updates.push(
        updateCell(
          "ownershipOne",
          cibilData?.applicantCibilDetail[0]?.ownership
        )
      );
      updates.push(
        updateCell(
          "emiMonthlyOne",
          cibilData?.applicantCibilDetail[0]?.emiMonthly
        )
      );
      updates.push(
        updateCell(
          "totalTenureOne",
          cibilData?.applicantCibilDetail[0]?.TotalTenure
        )
      );
      updates.push(
        updateCell(
          "balanceTenureOne",
          cibilData?.applicantCibilDetail[0]?.BalanceTenure
        )
      );
      updates.push(
        updateCell(
          "loanStatusOne",
          cibilData?.applicantCibilDetail[0]?.LoanStatus
        )
      );
      updates.push(
        updateCell(
          "ObligatedOne",
          cibilData?.applicantCibilDetail[0]?.LoanObligated
        )
      );
      updates.push(
        updateCell(
          "ObligationConsideredOne",
          cibilData?.applicantCibilDetail[0]?.ObligationConsidered
        )
      );
      updates.push(
        updateCell(
          "emiYearlyOne",
          cibilData?.applicantCibilDetail[0]?.emiAnnual
        )
      );

      updates.push(
        updateCell(
          "institutionTwo",
          cibilData?.applicantCibilDetail[1]?.Institution
        )
      ); //dependent Three
      updates.push(
        updateCell("loanTypeTwo", cibilData?.applicantCibilDetail[1]?.loanType)
      );
      updates.push(
        updateCell(
          "loanAmountTwo",
          cibilData?.applicantCibilDetail[1]?.loanAmount
        )
      );
      updates.push(
        updateCell(
          "currentOsTwo",
          cibilData?.applicantCibilDetail[1]?.outstandingAmount
        )
      );
      updates.push(
        updateCell("roiTwo", cibilData?.applicantCibilDetail[1]?.RateOfInterest)
      );
      updates.push(
        updateCell(
          "ownershipTwo",
          cibilData?.applicantCibilDetail[1]?.ownership
        )
      );
      updates.push(
        updateCell(
          "emiMonthlyTwo",
          cibilData?.applicantCibilDetail[1]?.emiMonthly
        )
      );
      updates.push(
        updateCell(
          "emiYearlyTwo",
          cibilData?.applicantCibilDetail[1]?.emiAnnual
        )
      );
      updates.push(
        updateCell(
          "totalTenureTwo",
          cibilData?.applicantCibilDetail[1]?.TotalTenure
        )
      );
      updates.push(
        updateCell(
          "balanceTenureTwo",
          cibilData?.applicantCibilDetail[1]?.BalanceTenure
        )
      );
      updates.push(
        updateCell(
          "loanStatusTwo",
          cibilData?.applicantCibilDetail[1]?.LoanStatus
        )
      );
      updates.push(
        updateCell(
          "ObligatedTwo",
          cibilData?.applicantCibilDetail[1]?.LoanObligated
        )
      );
      updates.push(
        updateCell(
          "ObligationConsideredTwo",
          cibilData?.applicantCibilDetail[1]?.ObligationConsidered
        )
      );

      updates.push(
        updateCell(
          "institutionThree",
          cibilData?.applicantCibilDetail[2]?.Institution
        )
      ); //dependent Three
      updates.push(
        updateCell(
          "loanTypeThree",
          cibilData?.applicantCibilDetail[2]?.loanType
        )
      );
      updates.push(
        updateCell(
          "loanAmountThree",
          cibilData?.applicantCibilDetail[2]?.loanAmount
        )
      );
      updates.push(
        updateCell(
          "currentOsThree",
          cibilData?.applicantCibilDetail[2]?.outstandingAmount
        )
      );
      updates.push(
        updateCell(
          "roiThree",
          cibilData?.applicantCibilDetail[2]?.RateOfInterest
        )
      );
      updates.push(
        updateCell(
          "ownershipThree",
          cibilData?.applicantCibilDetail[2]?.ownership
        )
      );
      updates.push(
        updateCell(
          "emiMonthlyThree",
          cibilData?.applicantCibilDetail[2]?.emiMonthly
        )
      );
      updates.push(
        updateCell(
          "emiYearlyThree",
          cibilData?.applicantCibilDetail[2]?.emiAnnual
        )
      );
      updates.push(
        updateCell(
          "totalTenureThree",
          cibilData?.applicantCibilDetail[2]?.TotalTenure
        )
      );
      updates.push(
        updateCell(
          "balanceTenureThree",
          cibilData?.applicantCibilDetail[2]?.BalanceTenure
        )
      );
      updates.push(
        updateCell(
          "loanStatusThree",
          cibilData?.applicantCibilDetail[2]?.LoanStatus
        )
      );
      updates.push(
        updateCell(
          "ObligatedThree",
          cibilData?.applicantCibilDetail[2]?.LoanObligated
        )
      );
      updates.push(
        updateCell(
          "ObligationConsideredThree",
          cibilData?.applicantCibilDetail[2]?.ObligationConsidered
        )
      );

      updates.push(
        updateCell(
          "institutionFour",
          cibilData?.applicantCibilDetail[3]?.Institution
        )
      ); //dependent Three
      updates.push(
        updateCell("loanTypeFour", cibilData?.applicantCibilDetail[3]?.loanType)
      );
      updates.push(
        updateCell(
          "loanAmountFour",
          cibilData?.applicantCibilDetail[3]?.loanAmount
        )
      );
      updates.push(
        updateCell(
          "currentOsFour",
          cibilData?.applicantCibilDetail[3]?.outstandingAmount
        )
      );
      updates.push(
        updateCell(
          "roiFour",
          cibilData?.applicantCibilDetail[3]?.RateOfInterest
        )
      );
      updates.push(
        updateCell(
          "ownershipFour",
          cibilData?.applicantCibilDetail[3]?.ownership
        )
      );
      updates.push(
        updateCell(
          "emiMonthlyFour",
          cibilData?.applicantCibilDetail[3]?.emiMonthly
        )
      );
      updates.push(
        updateCell(
          "emiYearlyFour",
          cibilData?.applicantCibilDetail[3]?.emiAnnual
        )
      );
      updates.push(
        updateCell(
          "totalTenureFour",
          cibilData?.applicantCibilDetail[3]?.TotalTenure
        )
      );
      updates.push(
        updateCell(
          "balanceTenureFour",
          cibilData?.applicantCibilDetail[3]?.BalanceTenure
        )
      );
      updates.push(
        updateCell(
          "loanStatusFour",
          cibilData?.applicantCibilDetail[3]?.LoanStatus
        )
      );
      updates.push(
        updateCell(
          "ObligatedFour",
          cibilData?.applicantCibilDetail[3]?.LoanObligated
        )
      );
      updates.push(
        updateCell(
          "ObligationConsideredFour",
          cibilData?.applicantCibilDetail[3]?.ObligationConsidered
        )
      );

      updates.push(
        updateCell(
          "institutionFive",
          cibilData?.applicantCibilDetail[4]?.Institution
        )
      ); //dependent Three
      updates.push(
        updateCell("loanTypeFive", cibilData?.applicantCibilDetail[4]?.loanType)
      );
      updates.push(
        updateCell(
          "loanAmountFive",
          cibilData?.applicantCibilDetail[4]?.loanAmount
        )
      );
      updates.push(
        updateCell(
          "currentOsFive",
          cibilData?.applicantCibilDetail[4]?.outstandingAmount
        )
      );
      updates.push(
        updateCell(
          "roiFive",
          cibilData?.applicantCibilDetail[4]?.RateOfInterest
        )
      );
      updates.push(
        updateCell(
          "ownershipFive",
          cibilData?.applicantCibilDetail[4]?.ownership
        )
      );
      updates.push(
        updateCell(
          "emiMonthlyFive",
          cibilData?.applicantCibilDetail[4]?.emiMonthly
        )
      );
      updates.push(
        updateCell(
          "emiYearlyFive",
          cibilData?.applicantCibilDetail[4]?.emiAnnual
        )
      );
      updates.push(
        updateCell(
          "totalTenureFive",
          cibilData?.applicantCibilDetail[4]?.TotalTenure
        )
      );
      updates.push(
        updateCell(
          "balanceTenureFive",
          cibilData?.applicantCibilDetail[4]?.BalanceTenure
        )
      );
      updates.push(
        updateCell(
          "loanStatusFive",
          cibilData?.applicantCibilDetail[4]?.LoanStatus
        )
      );
      updates.push(
        updateCell(
          "ObligatedFive",
          cibilData?.applicantCibilDetail[4]?.LoanObligated
        )
      );
      updates.push(
        updateCell(
          "ObligationConsideredFive",
          cibilData?.applicantCibilDetail[4]?.ObligationConsidered
        )
      );

      updates.push(
        updateCell(
          "applicantTotalObligation",
          cibilData?.applicantTotalObligation || ""
        )
      );

      updates.push(
        updateCell(
          "totalIncome",
          getRoundedEMI(
            partnerData?.totalIncomeMonthlyCalculation?.totalFormula
          )
        )
      );
      updates.push(
        updateCell("obligation", cibilData?.applicantTotalObligation)
      );
      updates.push(updateCell("emi", partnerData?.emiAmount));
      updates.push(updateCell("foir", `${getRoundedEMI(partnerData?.foir)}%`));
      updates.push(updateCell("ltv", approverData?.Ltv));
      // updates.push(updateCell('ObligationConsidered', partnerData?.totalIncome));

      //property
      updates.push(
        updateCell("propertyAddress", approverData?.fullAddressOfProperty)
      );
      updates.push(updateCell("propertySize", approverData?.totalLandArea));
      updates.push(
        updateCell("valuationValueOne", approverData?.fairMarketValueOfLand)
      );
      updates.push(
        updateCell("valuationDoneBy", approverData?.vendorId?.fullName)
      );
      updates.push(updateCell("marketLandValue", approverData?.landValue));
      updates.push(
        updateCell("marketConstructionValue", approverData?.constructionValue)
      );
      updates.push(updateCell("marketAmenitiesValue", ""));
      updates.push(
        updateCell("marketTotalValuesss", approverData?.fairMarketValueOfLand)
      );
      updates.push(
        updateCell("realizableLandValue", approverData?.realizableValue)
      );
      updates.push(
        updateCell("valuationValuethree", approverData?.fairMarketValueOfLand)
      );
      updates.push(updateCell("ltv", approverData?.Ltv));

      // //bank details
      updates.push(
        updateCell(
          "bankAccountNoApp",
          bankStatementDetails?.bankDetails[0]?.accountNumber
        )
      );
      updates.push(
        updateCell(
          "typeOfAccApp",
          bankStatementDetails?.bankDetails[0]?.accountType
        )
      );
      updates.push(
        updateCell(
          "nameOfBankApp",
          bankStatementDetails?.bankDetails[0]?.bankName || "na"
        )
      );
      updates.push(updateCell("avgBankBalanceApp", "0.0"));
      updates.push(updateCell("remarkApp", "Average Banking"));

      updates.push(updateCell("bankAccountCoApp", ""));
      updates.push(updateCell("typeOfAccCoApp", ""));
      updates.push(updateCell("nameOfBankCoApp", ""));
      updates.push(updateCell("avgBankBalanceCoApp", "0.0"));
      updates.push(updateCell("remarkCoApp", "Average Banking"));

      // referance
      updates.push(
        updateCell("nameOneReferance", creditPdData?.referenceDetails[0]?.name)
      );
      updates.push(
        updateCell("relationOne", creditPdData?.referenceDetails[0]?.relation)
      );
      updates.push(
        updateCell(
          "telephoneNoOne",
          creditPdData?.referenceDetails[0]?.mobileNumber
        )
      );
      updates.push(
        updateCell("nativeOfOne", creditPdData?.referenceDetails[0]?.address)
      );

      updates.push(
        updateCell("nameTwoReferance", creditPdData?.referenceDetails[1]?.name)
      );
      updates.push(
        updateCell("relationTwo", creditPdData?.referenceDetails[1]?.relation)
      );
      updates.push(
        updateCell(
          "telephoneNoTwo",
          creditPdData?.referenceDetails[1]?.mobileNumber
        )
      );
      updates.push(
        updateCell("nativeOfTwo", creditPdData?.referenceDetails[1]?.address)
      );

      //business  Reference
      updates.push(updateCell("name", creditPdData?.referenceDetails[0]?.name));
      updates.push(updateCell("occupation", ""));
      updates.push(
        updateCell("contactNo", creditPdData?.referenceDetails[0]?.mobileNumber)
      );
      updates.push(updateCell("Remarks", ""));

      //deviations
      updates.push(
        updateCell("deviationsOne", partnerData?.deviation?.query[0])
      );
      updates.push(
        updateCell("deviationsTwo", partnerData?.deviation?.query[1])
      );
      updates.push(
        updateCell("deviationsThree", partnerData?.deviation?.query[2])
      );
      // updates.push(updateCell('deviationsFour',  partnerData?.deviation[3]?.query));

      // mitigate
      updates.push(updateCell("mitigateOne", partnerData?.mitigate?.query[0]));
      updates.push(updateCell("mitigateTwo", partnerData?.mitigate?.query[1]));
      updates.push(
        updateCell("mitigateThree", partnerData?.mitigate?.query[2])
      );
      // updates.push(updateCell('mitigateFour',  partnerData?.mitigate[3]?.query));

      // sanction Condition
      updates.push(
        updateCell(
          "sanctionConditionOne",
          partnerData?.sanctionConditionQuery?.query[0]
        )
      );
      updates.push(
        updateCell(
          "sanctionConditionTwo",
          partnerData?.sanctionConditionQuery?.query[1]
        )
      );
      updates.push(
        updateCell(
          "sanctionConditionThree",
          partnerData?.sanctionConditionQuery?.query[2]
        )
      );
      // updates.push(updateCell('sanctionConditionFour',  partnerData?.sanctionConditionQuery[3]?.query));

      // //deviations of any

      updates.push(updateCell("pdDoneBy", creditPdData?.pdId?.employeName));
      updates.push(
        updateCell("CamPrepared", partnerData?.employeeId?.employeName)
      );
      updates.push(
        updateCell("dateOfLog", formatDBDate(creditPdData?.bdCompleteDate))
      );
      updates.push(
        updateCell("salesManager", reportingManagerData?.employeName)
      );

      // //income details agriculture
      updates.push(
        updateCell(
          "districtOne",
          partnerData?.agricultureIncome?.details[0]?.district
        )
      );
      updates.push(
        updateCell(
          "seasonOne",
          partnerData?.agricultureIncome?.details[0]?.season
        )
      );
      updates.push(
        updateCell(
          "AreaCultivationAcresOne",
          partnerData?.agricultureIncome?.details[0]?.AreaCultivationAcres
        )
      );
      updates.push(
        updateCell("cropOne", partnerData?.agricultureIncome?.details[0]?.crop)
      );
      updates.push(
        updateCell(
          "netIncomeOne",
          partnerData?.agricultureIncome?.details[0]?.netIncome
        )
      );

      updates.push(
        updateCell(
          "districtTwo",
          partnerData?.agricultureIncome?.details[1]?.district
        )
      );
      updates.push(
        updateCell(
          "seasonTwo",
          partnerData?.agricultureIncome?.details[1]?.season
        )
      );
      updates.push(
        updateCell(
          "AreaCultivationAcresTwo",
          partnerData?.agricultureIncome?.details[1]?.AreaCultivationAcres
        )
      );
      updates.push(
        updateCell("cropTwo", partnerData?.agricultureIncome?.details[1]?.crop)
      );
      updates.push(
        updateCell(
          "netIncomeTwo",
          partnerData?.agricultureIncome?.details[1]?.netIncome
        )
      );

      updates.push(
        updateCell(
          "districtThree",
          partnerData?.agricultureIncome?.details[2]?.district
        )
      );
      updates.push(
        updateCell(
          "seasonThree",
          partnerData?.agricultureIncome?.details[2]?.season
        )
      );
      updates.push(
        updateCell(
          "AreaCultivationAcresThree",
          partnerData?.agricultureIncome?.details[2]?.AreaCultivationAcres
        )
      );
      updates.push(
        updateCell(
          "cropThree",
          partnerData?.agricultureIncome?.details[2]?.crop
        )
      );
      updates.push(
        updateCell(
          "netIncomeThree",
          partnerData?.agricultureIncome?.details[2]?.netIncome
        )
      );

      updates.push(
        updateCell(
          "districtFour",
          partnerData?.agricultureIncome?.details[3]?.district
        )
      );
      updates.push(
        updateCell(
          "seasonFour",
          partnerData?.agricultureIncome?.details[3]?.season
        )
      );
      updates.push(
        updateCell(
          "AreaCultivationAcresFour",
          partnerData?.agricultureIncome.details[3]?.AreaCultivationAcres
        )
      );
      updates.push(
        updateCell("cropFour", partnerData?.agricultureIncome?.details[3]?.crop)
      );
      updates.push(
        updateCell(
          "netIncomeFour",
          partnerData?.agricultureIncome?.details[3]?.netIncome
        )
      );

      updates.push(
        updateCell(
          "totalFormula",
          partnerData?.agricultureIncome?.totalFormula || ""
        )
      );

      // //milk income
      updates.push(
        updateCell(
          "monthsOne",
          partnerData?.milkIncomeCalculation?.details[0]?.months
        )
      );
      updates.push(
        updateCell(
          "saleOfMilkOne",
          partnerData?.milkIncomeCalculation?.details[0]?.saleOfMilk
        )
      );

      updates.push(
        updateCell(
          "monthsTwo",
          partnerData?.milkIncomeCalculation?.details[1]?.months
        )
      );
      updates.push(
        updateCell(
          "saleOfMilkTwo",
          partnerData?.milkIncomeCalculation?.details[1]?.saleOfMilk
        )
      );

      updates.push(
        updateCell(
          "monthsThree",
          partnerData?.milkIncomeCalculation?.details[2]?.months
        )
      );
      updates.push(
        updateCell(
          "saleOfMilkThree",
          partnerData?.milkIncomeCalculation?.details[2]?.saleOfMilk
        )
      );

      updates.push(
        updateCell(
          "monthsFour",
          partnerData?.milkIncomeCalculation?.details[3]?.months
        )
      );
      updates.push(
        updateCell(
          "saleOfMilkFour",
          partnerData?.milkIncomeCalculation?.details[3]?.saleOfMilk
        )
      );

      updates.push(
        updateCell(
          "averageSaleOfMilk",
          partnerData?.milkIncomeCalculation?.calculation?.averageSaleOfMilk
        )
      );
      updates.push(
        updateCell(
          "ConsiderableMilkIncomePercentage",
          partnerData?.milkIncomeCalculation?.calculation
            ?.ConsiderableMilkIncomePercentage
        )
      );

      // //total income calculation

      updates.push(
        updateCell(
          "nameOne",
          partnerData?.totalIncomeMonthlyCalculation?.details[0]?.name
        )
      );
      updates.push(
        updateCell(
          "sourceOne",
          partnerData?.totalIncomeMonthlyCalculation?.details[0]?.source
        )
      );
      updates.push(
        updateCell(
          "amountOne",
          getRoundedEMI(
            partnerData?.totalIncomeMonthlyCalculation?.details[0]?.amount
          )
        )
      );

      updates.push(
        updateCell(
          "nameTwo",
          partnerData?.totalIncomeMonthlyCalculation?.details[1]?.name
        )
      );
      updates.push(
        updateCell(
          "sourceTwo",
          partnerData?.totalIncomeMonthlyCalculation?.details[1]?.source
        )
      );
      updates.push(
        updateCell(
          "amountTwo",
          getRoundedEMI(
            partnerData?.totalIncomeMonthlyCalculation?.details[1]?.amount
          )
        )
      );

      updates.push(
        updateCell(
          "IncomeTotalFormula",
          getRoundedEMI(
            partnerData?.totalIncomeMonthlyCalculation?.totalFormula
          )
        )
      );

      // Remove null updates (in case there are any invalid field mappings)
      const validUpdates = updates.filter((update) => update !== null);

      // Update the spreadsheet
      if (validUpdates.length > 0) {
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId,
          requestBody: {
            data: validUpdates,
            valueInputOption: "RAW",
          },
        });
      }

      // Prepare data for appending a new row
      const nextRowIndex = rows.length + 1; // 0-indexed, appending to the last row
      const newRow = [""];

      // Append the new row
      const appendUpdate = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A${nextRowIndex + 1}`,
        valueInputOption: "RAW",
        requestBody: {
          values: [newRow],
        },
      });
      // return res.status(200).json({ message: "ok" });
      // Construct the export URL for the specified spreadsheet
      const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx&sheet=${sheetName}`;

      // Get the access token
      const token = await authClient.getAccessToken();

      // Download the file using Axios with the access token
      const response = await axios.get(exportUrl, {
        responseType: "stream",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Set response headers for file download
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${sheetName}.xlsx"`
      );

      // Pipe the file stream to the response
      response.data.pipe(res);
      await processModel.findOneAndUpdate(
        { customerId },
        { $set: {
          camReport:true
        } },
        { new: true }
    ); 
    //   await fileProcessSheet(customerId)
    } else {
      return badRequest(res, "plese select ratnafin or grow  money partner");
    }
  } catch (error) {
    console.error("Error in createCamReport API >>>>>>", error);
    return res.status(500).json({
      error: "An unknown error occurred",
      details: error.message,
    });
  }
};






module.exports = {
    createNewCamReport,
    createCamReport
}