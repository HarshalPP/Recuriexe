const { returnFormatter } = require("../formatter/common.formatter");

const applicantDetail = require("../model/applicant.model");
const customerDetail = require("../model/customer.model.js")
const coApplicantDetail = require("../model/co-Applicant.model");
const gtrDetail = require("../model/guarantorDetail.model");
const pdDetail = require("../model/credit.Pd.model");
const finalSectionDetail = require("../model/finalSanction/finalSnction.model");
const customerDocumentModel = require("../model/customerPropertyDetail.model.js")
const senctionletter = require("../model/finalSanction/finalSnction.model.js")
const finalModel = require("../model/finalSanction/finalSnction.model");
const udhyamKycModel = require("../model/branchPendency/udhyamKyc.model.js")
const bankStatementKycModel = require("../model/branchPendency/bankStatementKyc.model.js")
const InsuranceModel = require("../model/finalApproval/Insurance.model.js");
const cibilDetail = require("../model/cibilDetail.model.js");
const loanDocumentModel = require("../model/finalApproval/allDocument.model.js");
const PropertyDetails = require("../model/branchPendency/approverTechnicalFormModel")
const disbursementModel = require("../model/fileProcess/disbursement.model.js");


const moment = require("moment")
const fs = require("fs");
const path = require("path");
const BASE_URL ="https://prod.fincooper.in"
const axios = require("axios");



// Convert file to Base64
// Convert a file from a URL to Base64
async function convertFileToBase64(url) {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const base64 = Buffer.from(response.data, "binary").toString("base64");
    return base64;
  } catch (error) {
    console.error("Error fetching file from URL:", error.message);
    return null;
  }
}




//----------------------------get all branch ---------------------------------------
async function getApplicantData(customerId) {
  try {
    // console.log(req.Id);
    const applicantData = await applicantDetail.findOne({customerId})
    return returnFormatter(true, "applicant found", applicantData);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}


//   --------- Property Details -------------- //

async function getPropertyDetails(customerId){
  try{
    const propertyDetails = await PropertyDetails.findOne({customerId})
    return returnFormatter(true, "Property Details found", propertyDetails);

  }catch(error){
    return returnFormatter(false, error.message);
  }
}

// cibil model data //

async function getCibilData(customerId) {
  try{
    const cibilData = await cibilDetail.findOne({customerId
    })
    return returnFormatter(true, "cibil found", cibilData);
  }
  catch(error){
    return returnFormatter(false, error.message);
  }
}

// get Cam data // 

const getCamData = async (customerId) => {
  try{

    const camReport = await loanDocumentModel.findOne({customerId})
    return returnFormatter(true, "Cam Report found", camReport);

  }catch(error){
    return returnFormatter(false, error.message);
  }
}


async function CustomerData(customerId) {
  try {
    // console.log(req.Id);
    const applicantData = await customerDetail.findById(customerId)
    return returnFormatter(true, "customer found", applicantData);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}


async function getCoapplicantData(customerId) {
  try {
    // console.log(req.Id);
    const coApplicantData = await coApplicantDetail.find({customerId})
    return returnFormatter(true, "Co applicant found", coApplicantData);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

async function getGtrData(customerId) {
  try {
    // console.log(req.Id);
    const gtrData = await gtrDetail.findOne({customerId})
    return returnFormatter(true, "Gtr found", gtrData);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

async function getPDData(customerId) {
  try {
    // console.log(req.Id);
    const pdData = await pdDetail.findOne({customerId})
    return returnFormatter(true, "pd found", pdData);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

async function getFinalSectionData(customerId) {
  try {
    // console.log(req.Id);
    const finalSectionData = await finalSectionDetail.findOne({customerId})
    return returnFormatter(true, "Final Section found", finalSectionData);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}


// GET FINAL SANCTION DATA //
async function getFinalSanctionData(customerId) {
  try{
    const finalSectionData = await finalModel.findOne({customerId})
    return returnFormatter(true, "Final Section found", finalSectionData);

  }catch(error){
    return returnFormatter(false, error.message);
  }
}


// FIND Disbusment Information // 


async function getDisbursementData(customerId) {

  console.log('Customer-------- >>>>>>>>> ' , customerId)
  try{
    const disbursementData = await disbursementModel.findOne({customerId});
    return returnFormatter(true, "Disbursement Data found", disbursementData);
  }
  catch(error){
    return returnFormatter(false, error.message);
  }
}


// Upload Document to the LOS //

async function Udhyamdata(customerId){
  console.log('Customer' , customerId)
  try{
    const udhyamData = await udhyamKycModel.findOne({customerId})
    return returnFormatter(true, "Udhyam Data found", udhyamData);
  }
  catch(error){
    return returnFormatter(false, error.message);
  }
}

// Nominese Data //

async function getInsuranceData(customerId){
  try{
    const insuranceData = await InsuranceModel.findOne({customerId})
    return returnFormatter(true, "Insurance Data found", insuranceData);
  }
  catch(error){
    return returnFormatter(false, error.message);
  }
}

// Upload Bank Statement to the LOS //

async function getBankStatementData(customerId){
  console.log('Customer' , customerId)
  try{
    const bankStatementData = await bankStatementKycModel.findOne({
      customerId })
    return returnFormatter(true, "Bank Statement Data found", bankStatementData);

  }catch(error){
    return returnFormatter(false, error.message);
  }
}

// Fetch All Document of Customer 
// Find the Document of the customer //

async function getCustomerDocuments(customerId){
  try{
    const customerDocument = await customerDocumentModel.findOne({customerId})
    return returnFormatter(true, "Customer Document found", customerDocument);
  }
  catch(error){
    return returnFormatter(false, error.message);
  }
}


async function getSenctionLetter(customerId){
  try{
    const senctionLetter = await senctionletter.findOne({customerId})
    return returnFormatter(true, "Senction Letter found", senctionLetter);
  }
  catch(error){
    return returnFormatter(false, error.message);
  }
}



// Set the format here //
// Cast managment // 
function getCategoryDescription(category) {
  const categoryMap = {
      General: "General Category",
      OBC: "Other Backward Class",
      SC: "Scheduled Caste",
      ST: "Scheduled Tribe",
      SBC: "Other Backward Class",
  };

  return categoryMap[category] || "Other Backward Class";
}

// Eduction Managment //

function getEduction(eduction) {
  const eductionMap = {
    "Primary": "ILLITERATE",
    "High School": "ILLITERATE",
    "Higher Secondary": "ILLITERATE",
    "Graducation": "GRADUATION",
    "Post Graducation":"POST GRADUATION",
    "illiterate":"ILLITERATE"
  };
  return eductionMap[eduction] || "ILLITERATE";
}

// Occupation managment //

// function Occupation(data) {
//   return "OTHER";
// }


function Occupation(data) {
  const occupationMap = {
    "SALARIED": "SALARIED",
    "SELF EMPLOYED BUSINESS": "SELF EMPLOYED BUSINESS",
    "SELF EMPLOYED PROFESSIONAL": "SELF EMPLOYED PROFESSIONAL",
    "HOUSEWIFE": "HOUSEWIFE",
    "STUDENT": "STUDENT",
    "RETIRED": "RETIRED",
    "OTHER": "OTHER"
  };
  
  return occupationMap[data.toUpperCase()] || "OTHER";
}

// Gender Managment //


function getGender(data) {
  const genderMap = {
    "MALE": "MALE",
    "FEMALE": "FEMALE",
    "OTHER": "OTHER"
  };
  return genderMap[data.toUpperCase()] || "OTHER";
}


// Marriage Managment //

function marriage(data){
  const marriageMap={

    "Married":"Married",
    "Unmarried":"Unmarried",
    "Divorced":"Others",
    "Widow":"Others"

  }
  return marriageMap[data] || "Others"
}


// Religien Manangemt //

function Religien(data){
  const ReligienMap={

    "Hindu":"Hindu",
    "Muslim":"Muslim",
    "Jain":"Jain",
    "Christian":"Christian",
    "Other":"Others"

  }
  return ReligienMap[data] || "Others"
}





//

  function formatteLoanData(applicant,coApplicants,gtr,pd,finalSection,dedupeData,customerMessage,cibilData,bankStatementData) {
    let jointHolderCoapplicant = coApplicants.map((data , index) => {return formatteJointHolder(data,"J",customerMessage,cibilData,index,pd )})
    let jointHolderGtr = gtr?[formatteJointHolder(gtr,"G",customerMessage,cibilData)]:[]
    
     // Filter bankDetails where E_Nach_Remarks is "true"
     const filteredBankDetails = bankStatementData.bankDetails
     .filter(bank => bank.E_Nach_Remarks == "true" || "false")
     .map(bank => ({
       bankName: bank.bankName,
       accountNumber: bank.accountNumber,
       ifscCode: bank.ifscCode,
       branchName: bank.branchName,
       accountType: bank.accountType,
       acHolderName: bank.acHolderName,
       statementFromDate: bank.statementFromDate,
       statementToDate: bank.statementToDate,
       Remarks: bank.Remarks,
       e_Nachamount: bank.e_Nachamount,
       mandate_start_date: bank.mandate_start_date,
       mandate_end_date: bank.mandate_end_date,
       uploadpdf: bank.uploadpdf,
       repaymentBank: bank.repaymentBank,
     }));





    try {
      const returnData = {
        referenceNumber:applicant._id|| "" ,
        externalRefNo:  customerMessage.customerFinId ,
        aadharNo: applicant.aadharNo,
        accountMode: 'NACH',
        annualIncome: '',
        areaName: applicant.permanentAddress.district,
        cityCode: '',
        caste: getCategoryDescription(applicant.caste),
        cityName:  applicant.permanentAddress.city,
        countryName: 'India',
        customerId: '',
        customerType: pd.applicant.applicantType == 'Individual'?"I":"L",
        inceptionDate: '',
        districtName: applicant.permanentAddress.district,
        birthDate: moment(applicant.dob).format("DD-MM-YYYY"),
        drivingLicNo: applicant.drivingLicenceNo,
        education: getEduction(applicant.education),
        electionIdNo: applicant.voterIdNo,
        emailId: applicant.email,
        employment: Occupation(pd.applicant.occupation),
        fatherFullName: applicant.fatherName,
        fatherFirstName: '',
        fatherLastName: '',
        fatherMiddleName: '',
        fatherPrefix: '',
        fatherOrSpouse: '',
        prefix: '',
        fullName:applicant.fullName,
        firstName: '',
        middleName: '',
        lastName: '',
        gender: getGender(applicant.gender),
        loanApplicationDate: '',
        loanAppliedAmount: finalSection.finalLoanAmount,
        loanInstallmentType: 'Monthly',
        loanPurpose: '',
        // makerUser: "Fincoopers_API-RF_FinCoopers",
        makerUser: "Fincoopers",
        maritalStatus: marriage(applicant.maritalStatus),
        mobileNo: applicant.mobileNo,
        motherFullName: applicant.motherName,
        motherFirstName: '',
        motherLastName: '',
        motherMiddleName: '',
        motherPrefix: '',
        noofInstallment: finalSection.tenureInMonth,
        occupation: Occupation(pd.applicant.occupation),
        pan: applicant.panNo,
        permanentAddress1: applicant.permanentAddress.addressLine1,
        permanentAddress2: applicant.permanentAddress.addressLine2,
        permanentAddress3: '',
        pincode: applicant.permanentAddress.pinCode || "",
        placeOfIncorporation: '',
        proofOfAddress: 'Aadhar Card',
        religion: Religien(applicant.religion),
        reqBranchCd: '023',
        reqCallerNm: 'Fincoopers _LOS',
        reqProductCode: 'LAP MICRO AGRI',
        residenceStatus: 'Resident Individual',
        roi: finalSection.roi,
        stateName: applicant.permanentAddress.state,
        typeOfAccount: pd.bankDetail.accountType,
        relatedPersonType: '',
        riskCateg: 'HIGH RISK',
        cibilScore: cibilData.applicantCibilScore,
        benfAcctType: filteredBankDetails[0]?.accountType == "Savings" ? "SB" : "CA",
        benfAcctNo:filteredBankDetails[0]?.accountNumber || '',
        benfAcctName:filteredBankDetails[0]?.acHolderName || '',
        benfIfscCode:filteredBankDetails[0]?.ifscCode || '',
        benfAcctAddress:filteredBankDetails[0]?.branchName || '',
        jointHolder: [...jointHolderCoapplicant,...jointHolderGtr]
      }

      return returnData
    } catch (error) {
      console.log(error);
      
      return returnFormatter(false, error.message);
    }
  }



  async function uploadDocument(
    applicant,
    coApplicants,
    gtrDetail,
    pdDetail,
    finalSectionDetail,
    dedupeData,
    getCustomerDocument,
    getSenctionLetter,
    camData,
    customerMessage
  ) {
    try {
      const sectionLetter = [
        {
          docName: "CAM",
          docImg: camData?.camReport?.[0] ? await convertFileToBase64(camData.camReport[0]) : null,
          validUptoDate: "",
          docPassword: "",
          docNo: "",
          customerId: applicant?.customerId || "",
        },
        {
          docName: "SANCTION LETTER",
          docImg: getSenctionLetter?.incomesectionLatterUrl
            ? await convertFileToBase64(getSenctionLetter.incomesectionLatterUrl)
            : null,
          validUptoDate: "",
          docPassword: "",
          docNo: "",
          customerId: applicant?.customerId || "",
        },
      ];
  
      // Prepare documents for co-applicants
      const coApplicantDocuments = await Promise.all(
        coApplicants.map(async (coApplicant, index) => {
          let docImg = null;
  
          if (index === 0 && getCustomerDocument?.signCoApplicantKyc?.[0]) {
            docImg = await convertFileToBase64(getCustomerDocument.signCoApplicantKyc[0]);
          } else if (index === 1 && getCustomerDocument?.signCoTwoApplicantKyc?.[0]) {
            docImg = await convertFileToBase64(getCustomerDocument.signCoTwoApplicantKyc[0]);
          }
  
          return {
            docName: "Aadhar Card",
            docImg: docImg,
            validUptoDate: "",
            docPassword: null,
            docNo: "",
            customerId: coApplicant?.customerId || "",
          };
        })
      );
  
      // Prepare documents for the guarantor
      const guarantorDocuments = [
        {
          docName: "Aadhar Card",
          docImg: getCustomerDocument?.signGurantorKyc?.[0]
            ? await convertFileToBase64(getCustomerDocument.signGurantorKyc[0]):'',
          validUptoDate: "",
          docPassword: "",
          docNo: applicant?.aadharNo || "",
          customerId: applicant?.customerId || "",
        },
      ];


      const ApplicantDocuments = [
        {
          docName: "Aadhar Card",
          docImg: getCustomerDocument?.signApplicantKyc?.[0]
            ? await convertFileToBase64(getCustomerDocument.signApplicantKyc[0]):'',
          validUptoDate: "",
          docPassword: "",
          docNo: gtrDetail?.aadharNo || "",
          customerId: gtrDetail?.customerId || "",
        },
      ];
  
      // Construct the return data
      const returnData = {
        ACTION: "UPLOADDOC",
        REQUEST_DATA: {
          cbsAccountNo: "",
          externalRefNo: customerMessage?.customerFinId || "",
          loanWiseDoc: {
            document: sectionLetter,
          },
          entityWiseDoc: [
           
            {
              applicantType:"A",
              referenceNumber:applicant._id,
              document:ApplicantDocuments,
              customerId:applicant.customerId


            },

            ...(await Promise.all(
              coApplicants.map(async (coApplicant, index) => ({
                applicantType: "C",
                referenceNumber: coApplicant?._id || `Ref-${index + 1}`,
                // referenceNumber: applicant?._id || '',
                document: [coApplicantDocuments[index]],
              }))
            )),
            {
              applicantType: "G",
              referenceNumber: gtrDetail?._id || "",
              document: guarantorDocuments,
              customerId: gtrDetail?.customerId || "",
            },
          ],
        }
      };
  
      return returnData;
    } catch (error) {
      console.error("Error in uploadDocument:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  }
  



function formatteJointHolder(data,type,Fin , cibilData , index , pd) {


  let cibilScore = '';
  let jointOccupation = ''

    // Ensure coApplicantData exists and has an entry at the given index
    if (Array.isArray(cibilData?.coApplicantData) && cibilData.coApplicantData.length > index) {
      cibilScore = cibilData.coApplicantData[index]?.coApplicantCibilScore || '';
    }

  if (Array.isArray(pd?.co_Applicant) && pd.co_Applicant.length > index) {
    jointOccupation = pd.co_Applicant[index]?.occupation || '';
  }


  try {
    const returnData = {
      cbsCategCode: '',
      cibilScore: cibilScore,
      type: type,
      placeOfIncorporation: '',
      fatherPrefix: '',
      fatherFullName: data.fatherName,
      fatherFirstName: '',
      fatherMiddleName: '',
      fatherLastName: '',
      fatherOrSpouse: 'Father',
      
      motherPrefix: '',
      motherFullName: data.motherName,
      motherFirstName: '',
      motherMiddleName: '',
      motherLastName: '',
      
      prefix: '',
      name: '',
      fullName: data.fullName,
      firstName: '',
      middleName: '',
      lastName: '',
      mobileNo: data.mobileNo,
      occupation: Occupation(jointOccupation),
      emailId: data.email,
      pan: '',
      drivingLicNo: '',
      proofOfAddress: 'Aadhar Card',
      aadharNo: data.aadharNo,
      birthDate: moment(data.dob).format("DD-MM-YYYY"),
      religion: Religien(data.religion),
      electionIdNo: '',
      maritalStatus: marriage(data.maritalStatus),
      gender: getGender(data.gender),
      education: getEduction(data.education),
      caste: getCategoryDescription(data.caste),

      referenceNumber: data._id || "",

      stateName: data.permanentAddress.state,
      areaName: data.permanentAddress.district,
      cityName: data.permanentAddress.city,
      districtName: data.permanentAddress.district,
      pincode: data.permanentAddress.pinCode,
      permanentAddress1: data.permanentAddress.addressLine1 || "",
      permanentAddress2: data.permanentAddress.addressLine2 || "",
      permanentAddress3: data.permanentAddress.addressLine2 || '',
      cityCode: '',
      countryName: 'India',
      inceptionDate: '',
      customerId: '',
      refCustomerId: '',
      employment: '',
      annualIncome: '',
      residenceStatus: 'Resident Individual',
      relatedPersonType: data.relationWithApplicant,
    }

    return returnData
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}






module.exports = {
    getApplicantData,
    getPDData,
    getCoapplicantData,
    formatteLoanData,
    getFinalSectionData,
    getGtrData,
    uploadDocument,
    getSenctionLetter,
    getCustomerDocuments,
    getFinalSanctionData,
    Udhyamdata,
    getBankStatementData,
    getInsuranceData,
    CustomerData,
    getCibilData,
    getCamData,
    getPropertyDetails,
    getDisbursementData
};
