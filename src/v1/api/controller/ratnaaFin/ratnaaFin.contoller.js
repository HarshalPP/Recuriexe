const {
  success,
  unknownError,
  serverValidation,
  badRequest,
  notFound,
} = require("../../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const path = require('path');
const ObjectId = mongoose.Types.ObjectId;
const lmsModel = require("../../model/ratnaaFin/ratnaaFin.model")
const bcrypt = require('bcrypt')
const { loanCreateGoogleSheet } = require('./ratnaaFinGoogleSheet.controller')
const { generateApplicantPdf, generateLoanAggrementPdf } = require('./pdfGenerate.controller')
const apiService = require('../../services/ratnafin.services')
const {getApplicantData,getCoapplicantData, getPDData, formatteLoanData, 
  getFinalSectionData, getGtrData, uploadDocument , getCustomerDocuments , getSenctionLetter , 
  CustomerData , getCibilData , getCamData , getBankStatementData} = require('../../helper/losGlobal.helper')
const moment = require("moment")
const customerModel = require("../../model/customer.model")

// ------------------------ add LMS---------------------------------------
// async function addLMS(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }
//     const lmsDetail = new lmsModel(req.body);
//     const lmsData = await lmsDetail.save()
//     success(res, "lms Added Successful", lmsDetail);

//     console.log('data',        lmsDetail.aadharNo,
//       lmsDetail.accountMode,
//       lmsDetail.annualIncome,
//       lmsDetail.areaName,
//       lmsDetail.birthDate,
//       lmsDetail._id,)

//     await loanCreateGoogleSheet(lmsDetail)
//   } catch (error) {
//     console.log(error);
//     unknownError(res, error);
//   }
// };


async function addLMS(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const applicantDataPdf = {

      "applicationDetails": {
        "date": "23/09/2024",
        "applicationNumber": "GEN261"
      },

      "logoImgae": '/uploads/file_1727502837029.whatsappimage2024-09-24at20.49.30.jpeg',
      "loanDetails": {
        "loanAmountRequested": 240000,
        "loanTenureRequestedMonths": 46,
        "loanPurpose": "Increasing Milk Business",
        "loanType": "Secured"
      },
      "sourcingDetails": {
        "sourceType": "NA",
        "groPartnerName": "NA",
        "sourcingAgentName": "NA",
        "sourcingAgentCode": "NA",
        "sourceAgentLocation": "NA",
        "sourcingRmName": "NA",
        "sourcingRmCode": "NA"
      },
    }
    const pdfPath = await generateLoanAggrementPdf(applicantDataPdf);
    console.log('pdfPath', pdfPath)
    success(res, "PDF Generate ");
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
};

async function createCase(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const payload = {
      "ACTION": "DE-DUPE",
      "REQUEST_DATA": req.body
    }
    let resData = await apiService.deduplication(payload)
    success(res, "PDF Generate ", resData);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
};

async function createLoanCase(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const {
      externalRefNo,
      prefix,
      referenceNumber,
      customerType,
      firstName,
      middleName,
      lastName,
      fatherOrSpouse,
      fatherPrefix,
      fatherFirstName,
      fatherMiddleName,
      fatherLastName,
      motherPrefix,
      motherFirstName,
      motherMiddleName,
      motherLastName,
      birthDate,
      caste,
      religion,
      gender,
      maritalStatus,
      mobileNo,
      pan,
      gstNo,
      aadharNo,
      drivingLicNo,
      drivingLicIssueDate,
      drivingLicExpiryDate,
      drivingLicAuhority,
      electionIdNo,
      emailId,
      education,
      occupation,
      annualIncome,
      turnOver,
      employment,
      typeOfAccount,
      residenceStatus,
      proofOfAddress,
      permanentAddress1,
      permanentAddress2,
      permanentAddress3,
      areaName,
      cityName,
      districtName,
      stateName,
      countryName,
      pincode,
      inceptionDate,
      placeOfIncorporation,
      accountMode,
      riskCateg,
      reqProductCode,
      loanPurpose,
      loanApplicationDate,
      loanAppliedAmount,
      noofInstallment,
      roi,
      loanInstallmentType,
      reqBranchCd,
      makerUser,
      reqCallerNm,
      jointHolder,
      customerId,
      cibilScore
    } = req.body;
    
    
    const bodyDataLegal = {
      prefix,
      externalRefNo,
      referenceNumber,
      customerType,
      firstName,
      middleName,
      lastName,
      fatherOrSpouse,
      fatherPrefix,
      fatherFirstName,
      fatherMiddleName,
      fatherLastName,
      motherPrefix,
      motherFirstName,
      motherMiddleName,
      motherLastName,
      birthDate,
      caste,
      religion,
      gender,
      maritalStatus,
      mobileNo,
      pan,
      gstNo,
      aadharNo,
      drivingLicNo,
      drivingLicIssueDate,
      drivingLicExpiryDate,
      drivingLicAuhority,
      electionIdNo,
      emailId,
      education,
      occupation,
      annualIncome,
      turnOver,
      employment,
      typeOfAccount,
      residenceStatus,
      proofOfAddress,
      permanentAddress1,
      permanentAddress2,
      permanentAddress3,
      areaName,
      cityName,
      districtName,
      stateName,
      countryName,
      pincode,
      inceptionDate,
      placeOfIncorporation,
      accountMode,
      riskCateg,
      reqProductCode,
      loanPurpose,
      loanApplicationDate,
      loanAppliedAmount,
      noofInstallment,
      roi,
      loanInstallmentType,
      reqBranchCd,
      makerUser,
      reqCallerNm,
      jointHolder,
      customerId,
      cibilScore
    };

    // console.log("body data" , bodyDataLegal)
    
    // bodyDataLegal = {
    //   externalRefNo: "fin1234",
    //   referenceNumber: "finlc0001",
    //   customerType: "I",
    //   firstName: "RAM",
    //   middleName: "",
    //   lastName: "RUHELA",
    //   fatherOrSpouse: "",
    //   fatherPrefix: "",
    //   fatherFirstName: "",
    //   fatherMiddleName: "",
    //   fatherLastName: "",
    //   motherPrefix: "",
    //   motherFirstName: "",
    //   motherMiddleName: "",
    //   motherLastName: "",
    //   birthDate: "",
    //   caste: "",
    //   religion: "",
    //   gender: "",
    //   maritalStatus: "",
    //   mobileNo: "8460764919",
    //   pan: "CJHTR4444T",
    //   gstNo: "",
    //   aadharNo: "",
    //   drivingLicNo: "",
    //   drivingLicIssueDate: "",
    //   drivingLicExpiryDate: "",
    //   drivingLicAuhority: "",
    //   electionIdNo: "",
    //   emailId: "legalrequest@gmail.com",
    //   education: "",
    //   occupation: "SELF EMPLOYED PROFESSIONAL",
    //   annualIncome: "500000",
    //   turnOver: "500000",
    //   employment: "",
    //   typeOfAccount: "Resident Individual",
    //   residenceStatus: "Resident Individual",
    //   proofOfAddress: "Electricity Bill",
    //   permanentAddress1: "Legal address 1",
    //   permanentAddress2: "Legal address 2",
    //   permanentAddress3: null,
    //   areaName: "VADSAR",
    //   cityName: "VADODARA",
    //   districtName: "VADODARA",
    //   stateName: "GUJARAT",
    //   countryName: "INDIA",
    //   pincode: "390013",
    //   inceptionDate: "01-01-1980",
    //   placeOfIncorporation: "AHMEDABAD",
    //   accountMode: "RTGS/NEFT",
    //   riskCateg: "HIGH RISK",
    //   reqProductCode: "EDUCATION FEE - FSF INTEREST",
    //   loanPurpose: "11",
    //   loanApplicationDate: "09-08-2024",
    //   loanAppliedAmount: "950000",
    //   noofInstallment: "120",
    //   roi: "10",
    //   loanInstallmentType: "Monthly",
    //   reqBranchCd: "999",
    //   makerUser: "ravi",
    //   reqCallerNm: "ravi",
    //   jointHolder: [
    //     {
    //       referenceNumber: "C8808-1",
    //       isRelatedPerson: "Y",
    //       type: "J",
    //       relatedPersonType: "",
    //       customerId: "",
    //       prefix: "Mr",
    //       firstName: "Chimanbhai",
    //       middleName: "C",
    //       lastName: "Jethva",
    //       fatherOrSpouse: "Father",
    //       fatherPrefix: "Mr",
    //       fatherFirstName: "C",
    //       fatherMiddleName: "A",
    //       fatherLastName: "Jethva",
    //       motherPrefix: "Mrs",
    //       motherFirstName: "A",
    //       motherMiddleName: "C",
    //       motherLastName: "Jethva",
    //       birthDate: "01-01-1975",
    //       caste: "General Category",
    //       religion: "Hindu",
    //       gender: "Male",
    //       maritalStatus: "Married",
    //       mobileNo: "8460764919",
    //       pan: "CJHPR4444A",
    //       aadharNo: "516401153940",
    //       drivingLicNo: null,
    //       drivingLicIssueDate: "01-01-1990",
    //       drivingLicExpiryDate: "01-01-2050",
    //       drivingLicAuhority: "",
    //       electionIdNo: null,
    //       emailId: "mehtahinal94@gmail.com",
    //       education: "Graduate",
    //       occupation: "SELF EMPLOYED BUSINESS",
    //       annualIncome: "450000",
    //       turnOver: "500000",
    //       employment: "Self Employed",
    //       typeOfAccount: "Resident Individual",
    //       residenceStatus: "Person of Indian Origin",
    //       proofOfAddress: "Aadhar Card",
    //       permanentAddress2: "Chimanbhai address line 2",
    //       permanentAddress3: null,
    //       permanentAddress1: "Chimanbhai address line 1",
    //       areaName: "VADSAR",
    //       cityCode: "0",
    //       cityName: "VADODARA",
    //       districtName: "VADODARA",
    //       stateName: "GUJARAT",
    //       countryName: "INDIA",
    //       pincode: "390013",
    //     },
    //   ],
    // };
    const payload = {
      ACTION: "LOAN-CREATE",
      REQUEST_DATA: bodyDataLegal,
    };
    let resData = await apiService.createNewLoan(payload)
    success(res, "PDF Generate ", resData);

  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
};

async function uploadLoanFile(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    let resData = await apiService.uploadLoanDocument(req.files)
    success(res, "PDF Generate ", resData);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
};


const uploadLoanFileWithBody = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    console.log("Received Loan Upload Data:", req.body);

    const payload = req.body;


    let resData = await apiService.uploadLoanDocumentWITHPayload(payload);

    success(res, "Loan Documents Uploaded Successfully", resData);
  } catch (error) {
    console.error("Error in uploadLoanFile:", error);
    unknownError(res, error);
  }
};




async function handleFullLoanProcess(req, res) {
  try {
    // 1. Validate the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const {status:applicantStatus,message:applicantMessage,data:applicantDetail} = await getApplicantData(req.body.customerId)
    const {status:pdStatus,message:pdMessage,data:pdDetail} = await getPDData(req.body.customerId)
    
    
    // 2. Perform the de-duplication (similar to createCase)
    const dedupPayload = {
      ACTION: "DE-DUPE",
      REQUEST_DATA: {
        "aadharNo": "558171739070",
        // "aadharNo": applicantDetail.aadharNo,
        "birthDate": applicantDetail.dob,
        "customerType": pdDetail.applicant.applicantType == 'Individual'?"I":"L",
        "externalRefNo": "00398_17042024",
        "mobileNo": applicantDetail.mobileNo,
        "pan": "FLZPR5994B"
        // "pan": applicantDetail.panNo
      },
    };
    const dedupResponse = await apiService.deduplication(dedupPayload);
    return success(res, "Loan process completed successfully",dedupResponse)

    // 3. Create a new loan case (similar to createLoanCase)
    const bodyDataLegal = {
      externalRefNo: "fin1234",
      referenceNumber: "finlc0001",
      customerType: "L",
      firstName: "RAM",
      middleName: "",
      lastName: "RUHELA",
      fatherOrSpouse: "",
      fatherPrefix: "",
      fatherFirstName: "",
      fatherMiddleName: "",
      fatherLastName: "",
      motherPrefix: "",
      motherFirstName: "",
      motherMiddleName: "",
      motherLastName: "",
      birthDate: "",
      caste: "",
      religion: "",
      gender: "",
      maritalStatus: "",
      mobileNo: "8460764919",
      pan: "CJHTR4444T",
      gstNo: "",
      aadharNo: "",
      drivingLicNo: "",
      drivingLicIssueDate: "",
      drivingLicExpiryDate: "",
      drivingLicAuhority: "",
      electionIdNo: "",
      emailId: "legalrequest@gmail.com",
      education: "",
      occupation: "SELF EMPLOYED PROFESSIONAL",
      annualIncome: "500000",
      turnOver: "500000",
      employment: "",
      typeOfAccount: "Resident Individual",
      residenceStatus: "Resident Individual",
      proofOfAddress: "Electricity Bill",
      permanentAddress1: "Legal address 1",
      permanentAddress2: "Legal address 2",
      permanentAddress3: null,
      areaName: "VADSAR",
      cityName: "VADODARA",
      districtName: "VADODARA",
      stateName: "GUJARAT",
      countryName: "INDIA",
      pincode: "390013",
      inceptionDate: "01-01-1980",
      placeOfIncorporation: "AHMEDABAD",
      accountMode: "RTGS/NEFT",
      riskCateg: "HIGH RISK",
      reqProductCode: "EDUCATION FEE - FSF INTEREST",
      loanPurpose: "11",
      loanApplicationDate: "09-08-2024",
      loanAppliedAmount: "950000",
      noofInstallment: "120",
      roi: "10",
      loanInstallmentType: "Monthly",
      reqBranchCd: "999",
      makerUser: "ravi",
      reqCallerNm: "ravi",
      jointHolder: [
        {
          referenceNumber: "C8808-1",
          isRelatedPerson: "Y",
          type: "J",
          relatedPersonType: "",
          customerId: "",
          prefix: "Mr",
          firstName: "Chimanbhai",
          middleName: "C",
          lastName: "Jethva",
          fatherOrSpouse: "Father",
          fatherPrefix: "Mr",
          fatherFirstName: "C",
          fatherMiddleName: "A",
          fatherLastName: "Jethva",
          motherPrefix: "Mrs",
          motherFirstName: "A",
          motherMiddleName: "C",
          motherLastName: "Jethva",
          birthDate: "01-01-1975",
          caste: "General Category",
          religion: "Hindu",
          gender: "Male",
          maritalStatus: "Married",
          mobileNo: "8460764919",
          pan: "CJHPR4444A",
          aadharNo: "516401153940",
          drivingLicNo: null,
          drivingLicIssueDate: "01-01-1990",
          drivingLicExpiryDate: "01-01-2050",
          drivingLicAuhority: "",
          electionIdNo: null,
          emailId: "mehtahinal94@gmail.com",
          education: "Graduate",
          occupation: "SELF EMPLOYED BUSINESS",
          annualIncome: "450000",
          turnOver: "500000",
          employment: "Self Employed",
          typeOfAccount: "Resident Individual",
          residenceStatus: "Person of Indian Origin",
          proofOfAddress: "Aadhar Card",
          permanentAddress2: "Chimanbhai address line 2",
          permanentAddress3: null,
          permanentAddress1: "Chimanbhai address line 1",
          areaName: "VADSAR",
          cityCode: "0",
          cityName: "VADODARA",
          districtName: "VADODARA",
          stateName: "GUJARAT",
          countryName: "INDIA",
          pincode: "390013",
        },
      ],
    };

    const loanPayload = {
      ACTION: "LOAN-CREATE",
      REQUEST_DATA: bodyDataLegal,
    };
    const loanResponse = await apiService.createNewLoan(loanPayload);

    // 4. Upload the loan file(s) (similar to uploadLoanFile)
    const uploadResponse = await apiService.uploadLoanDocument(req.files);

    // 5. Return a combined success response
    success(res, "Loan process completed successfully", {
      dedupResult: dedupResponse,
      loanResult: loanResponse,
      uploadResult: uploadResponse,
    });
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

async function getCustomerData(req,res){
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    if(!req.body.customerId){
      return badRequest(res,"customerId is required")
    }

    const customerExit = await customerModel.findById(req.body.customerId);
        if (!customerExit) {
          return notFound(res, "Customer Not Found");
        }

    const {status:applicantStatus,message:applicantMessage,data:applicantDetail} = await getApplicantData(req.body.customerId)
    const {status:coApplicantStatus,message:coApplicantMessage,data:coApplicantDetail} = await getCoapplicantData(req.body.customerId)
    const {status:gtrStatus,message:gtrMessage,data:gtrDetail} = await getGtrData(req.body.customerId)
    const {status:pdStatus,message:pdMessage,data:pdDetail} = await getPDData(req.body.customerId)
    const {status:finalSectionStatus,message:finalSectionMessage,data:finalSectionDetail} = await getFinalSectionData(req.body.customerId)
    const {status:getCustomerDocumentStatus,message:getCustomerDocumentMessage,data:getCustomerDocument} = await getCustomerDocuments(req.body.customerId)
    const {status:getSenctionLetterStatus,message:getSenctionLetterMessage,data:getSenctionLetters} = await getSenctionLetter(req.body.customerId)
    const {status:customerStatus,message:message,data:customerMessage} = await CustomerData(req.body.customerId)
    const {status:cibilStatus,message:cibilMessage,data:cibilData} = await getCibilData(req.body.customerId)
    const {status:camStatus,message:camMessage,data:camData} = await getCamData(req.body.customerId)
    const {status:bankStatementStatus,message:bankStatementMessage,data:bankStatementData} = await getBankStatementData(req.body.customerId)



    


    
    const dedupeData = {
      "aadharNo": applicantDetail.aadharNo || "",
      "referenceNumber": applicantDetail._id || "",
      "birthDate": moment(applicantDetail.dob).format("DD-MM-YYYY") || "",
      "customerType": pdDetail.applicant.applicantType == 'Individual'?"I":"L" || "",
      "externalRefNo": customerMessage.customerFinId || "",
      "mobileNo": applicantDetail.mobileNo || "",
      "pan": applicantDetail.panNo || ""
    };


    // console.log('documentdata',documentdata)


    const loanData = formatteLoanData(applicantDetail,coApplicantDetail,gtrDetail,pdDetail,finalSectionDetail,dedupeData,customerMessage,cibilData, bankStatementData)
    const uploadDoc = await uploadDocument(applicantDetail,coApplicantDetail,gtrDetail,pdDetail,finalSectionDetail,dedupeData , getCustomerDocument , getSenctionLetters , camData , customerMessage)
    
    success(res, "Customer Details", {dedupeData,loanData,uploadDoc});
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}


async function applicantPdf(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const applicantDataPdf = {

      "applicationDetails": {
        "date": "23/09/2024",
        "applicationNumber": "GEN261"
      },

      "logoImgae": '/uploads/file_1727502837029.whatsappimage2024-09-24at20.49.30.jpeg',
      "loanDetails": {
        "loanAmountRequested": 240000,
        "loanTenureRequestedMonths": 46,
        "loanPurpose": "Increasing Milk Business",
        "loanType": "Secured"
      },
      "sourcingDetails": {
        "sourceType": "NA",
        "groPartnerName": "NA",
        "sourcingAgentName": "NA",
        "sourcingAgentCode": "NA",
        "sourceAgentLocation": "NA",
        "sourcingRmName": "NA",
        "sourcingRmCode": "NA"
      },
    }
    const pdfPath = await generateApplicantPdf(applicantDataPdf);
    console.log('pdfPath', pdfPath)
    success(res, "PDF Generate ");
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
};


module.exports = {
  addLMS,
  applicantPdf,
  createCase,
  createLoanCase,
  uploadLoanFile,
  handleFullLoanProcess,
  getCustomerData,
  uploadLoanFileWithBody
};
