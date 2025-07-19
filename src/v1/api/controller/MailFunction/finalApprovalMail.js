const customerModel = require("../../model/customer.model");
const vendorModel = require("../../model/adminMaster/vendor.model");
const externalVendorFormModel = require("../../model/externalManager/externalVendorDynamic.model");
const approverFormModel = require("../../model/branchPendency/approverTechnicalFormModel.js");
const { finalApprovalSendPartnerSanction } = require("../functions.Controller");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const cron = require("node-cron");
const processModel = require("../../model/process.model");
const cibilModel = require("../../model/cibilDetail.model");
const creditPdModel = require("../../model/credit.Pd.model.js");
const employeModel = require("../../model/adminMaster/employe.model.js");
const coApplicantModel = require("../../model/co-Applicant.model");
const applicantModel = require("../../model/applicant.model.js");
const guarantorModel = require("../../model/guarantorDetail.model");
const gtrPdcModel = require("../../model/branchPendency/gtrPdc.model.js");
const appPdcModel = require("../../model/branchPendency/appPdc.model.js");
const finalModel = require("../../model/finalSanction/finalSnction.model.js");
const lenderDocumentModel = require("../../model/lenderDocument.model.js");
const PartnerModel = require("../../model/externalManager/createPartner.model.js");
const internalLegalModel = require("../../model/finalApproval/internalLegal.model.js");
// const btDetailsModel = require("../../model/finalApproval/btBankDetail.model");
const lendersModel = require("../../model/lender.model.js");
const {
  success,
  unknownError,
  serverValidation,
  badRequest,
  notFound,
  parseJwt,
} = require("../../../../../globalHelper/response.globalHelper");
const btDetailsModel = require("../../model/finalApproval/btBankDetail.model");


const mailSendPartnerToSanction = async (customerId, req, empId) => {
  try {
    // console.log("excution start ------");
    const customerData = await customerModel.findOne({ _id: customerId }).populate("branch");
    const employeeData = await employeModel
      .findOne({ _id: customerData?.employeId._id })
      .populate("branchId");
    const employeeDetails = await employeModel
      .findOne({ _id: empId })
      .populate("branchId");
    const creditPdData = await creditPdModel.findOne({ customerId });
    const gtrPdcData = await gtrPdcModel.findOne({ customerId });
    const appPdcData = await appPdcModel.findOne({ customerId });
    const coApplicantData = await coApplicantModel.find({ customerId });
    const applicantData = await applicantModel.findOne({ customerId });
    const guarantorData = await guarantorModel.findOne({ customerId });
    const cibilData = await cibilModel.findOne({ customerId });
    const approverData = await approverFormModel.findOne({ customerId });
    const finalData = await finalModel
      .findOne({ customerId })
      .populate("partnerId")
      .populate("employeeId");
    // console.log(finalData, "finalData<><><><><><><>")
    const venderData = await lendersModel.findOne({ _id: finalData.partnerId })
    // console.log(venderData, "venderDatavenderData")
    const internalLegalData = await internalLegalModel.findOne({ customerId });
    let btDetailsData;
    if (internalLegalData?.LoanType === 'BT' || internalLegalData?.LoanType === 'CONSTRUCTION') {
      try {
        btDetailsData = await btDetailsModel.findOne({ customerId });
        if (!btDetailsData) {
          console.warn('BT details not found for customer:', customerId);
        }
      } catch (error) {
        console.error('Error fetching BT details:', error);
      }
    }

    // let agricultureIncome
    // let incomeFromMilk
    // let incomeFromOtherSource
    // let totalAnnualIncome
    // if (finalData?.partnerId?.fullName == "ratnaafin capital pvt ltd" || finalData?.partnerId?.fullName == "RATNAAFIN CAPITAL PVT LTD" || finalData?.partnerId?.fullName == "fin coopers capital pvt ltd" || finalData?.partnerId?.fullName == "FIN COOPERS CAPITAL PVT LTD") {
    //   agricultureIncome = finalData?.agricultureRatnaIncome?.grossYearlyIncome
    //   incomeFromMilk = finalData?.milkRatnaIncomeCalculation?.grossYearlyIncome
    //   incomeFromOtherSource = finalData?.otherBusinessIncomeCalculation?.grossBusinessYearlyIncome
    //   totalAnnualIncome = finalData?.grossCalculation?.totalAnnualIncome
    // } else {
    //   agricultureIncome = finalData?.agricultureIncome?.totalFormula
    //   incomeFromMilk = finalData?.milkIncomeCalculation?.calculation?.ConsiderableMilkIncomePercentage
    //   incomeFromOtherSource = finalData?.otherIncomeCalculation?.grossIncome
    //   totalAnnualIncome = finalData?.totalIncomeMonthlyCalculation?.totalFormula
    // }

    let toEmails
    let ccmails
    if (finalData?.partnerId?.fullName == "ratnaafin capital pvt ltd" || finalData?.partnerId?.fullName == "RATNAAFIN CAPITAL PVT LTD" || finalData?.partnerId?.fullName == "fin coopers capital pvt ltd" || finalData?.partnerId?.fullName == "FIN COOPERS CAPITAL PVT LTD") {
      toEmails = venderData.sanctionEmailTo //"Sheetal@fincoopers.com"//"";
      ccmails = venderData.sanctionEmailCc //"Sheetal@fincoopers.com";
      //  toEmails = "roshniraikwar@fincoopers.in"
      //  ccmails =  "roshniraikwar@fincoopers.in";
      // //  toEmails = "Sheetal@fincoopers.com"
    }

    // console.log(toEmails,ccmails,"ccmailsccmailsccmailsccmails")
    if (finalData?.partnerId?.fullName == "GROW MONEY CAPITAL PVT LTD" || finalData?.partnerId?.fullName == "grow money capital pvt ltd") {
      toEmails = venderData.sanctionEmailTo //"Sheetal@fincoopers.com"//"";
      ccmails = venderData.sanctionEmailCc //"Sheetal@fincoopers.com";
      // toEmails = "roshniraikwar@fincoopers.in"//"";
      // ccmails = "roshniraikwar@fincoopers.in";
    }
    // if (req.hostname === "stageapi.fincooper.in" || req.hostname === "localhost") {
    //   toEmails = "roshniraikwar@fincoopers.in"
    //   toEmails = ""
    // } else if (req.hostname === "prod.fincooper.in") {
    //   toEmails = "Sheetal@fincoopers.com"
    // }

    let title = "This caption is for final approval sanction";
    // if (status === "complete" || status === "approve") {
    //   title = "This Caption PD is approve ... Please check It..."
    // } else {
    //   title = "This Caption PD is rejected ... Please find Reject Reason ...."
    // }
    // let agriData;
    // let milkData;
    // let salaryData;
    // let otherData;
    // if (
    //   creditPdData?.incomeSource?.some(
    //     (src) => src?.incomeSourceType === "agricultureBusiness"
    //   )
    // ) {
    //   agriData =
    //     creditPdData?.incomeSource?.find(
    //       (src) => src?.incomeSourceType === "agricultureBusiness"
    //     )?.agricultureBusiness ?? {};
    //   //  console.log("Agriculture Business Data:", agriData);
    // }

    // if (
    //   creditPdData?.incomeSource?.some(
    //     (src) => src?.incomeSourceType === "milkBusiness"
    //   )
    // ) {
    //   milkData =
    //     creditPdData?.incomeSource?.find(
    //       (src) => src?.incomeSourceType === "milkBusiness"
    //     )?.milkBusiness ?? {};
    //   //  console.log("Milk Business Data:", milkData);
    // }

    // if (
    //   creditPdData?.incomeSource?.some(
    //     (src) => src?.incomeSourceType === "salaryIncome"
    //   )
    // ) {
    //   salaryData =
    //     creditPdData?.incomeSource?.find(
    //       (src) => src?.incomeSourceType === "salaryIncome"
    //     )?.salaryIncome ?? {};
    //   //  console.log("Salary Income Data:", salaryData);
    // }

    // if (
    //   creditPdData?.incomeSource?.some(
    //     (src) => src?.incomeSourceType === "other"
    //   )
    // ) {
    //   otherData =
    //     creditPdData?.incomeSource?.find(
    //       (src) => src?.incomeSourceType === "other"
    //     )?.other ?? {};
    //   //  console.log("Other Income Data:", otherData);
    // }



    // const calculatePropertyToBranchDistance = async (
    //   approverData,
    //   customerData
    // ) => {
    //   try {
    //     const propertyCoords = [approverData.latitude, approverData.longitude];
    //     const branchCoords = customerData?.branch?.location?.coordinates;

    //     // Check if coordinates are available
    //     if (
    //       !propertyCoords ||
    //       !branchCoords ||
    //       propertyCoords.length < 2 ||
    //       branchCoords.length < 2
    //     ) {
    //       console.warn(
    //         "Coordinates are missing; skipping distance calculation."
    //       );
    //       return null; // Return null if coordinates are not available
    //     }

    //     const distance = haversineDistance(propertyCoords, branchCoords);

    //     // Return formatted distance
    //     if (distance) {
    //       return `${distance.toFixed(2)} KM from branch`;
    //     }

    //     return null; // Return null if distance couldn't be calculated
    //   } catch (error) {
    //     console.error("Error calculating distance:", error);
    //     return null; // Return null in case of an error
    //   }
    // };

    // //  let formattedDistance
    // const formattedDistance = await calculatePropertyToBranchDistance(
    //   approverData,
    //   customerData
    // );  

const btTableHtml = (btDetailsData) =>
  `<thead>
    <tr>
        <th colspan="2" style="text-align: center; padding: 5px;">BT DETAILS</th>
    </tr>
</thead>
<tbody>
     <tr>
        <td style="font-weight: bold; padding: 3px; width: 50%;">BT BANK NAME</td>
        <td style="padding: 3px; width: 50%;">${btDetailsData?.bankName}</td>
    </tr>
    <tr>
        <td style="font-weight: bold; padding: 3px;">BT AMOUNT</td>
        <td style="padding: 3px;">${btDetailsData?.amount}</td>
    </tr>
    <tr>
        <td style="font-weight: bold; padding: 3px;">BT TOPUP AMOUNT</td>
        <td style="padding: 3px;">${btDetailsData?.topUpAmount}</td>
    </tr>
</tbody>`;

const constructionHtml = (btDetailsData) =>
  `<thead>
   <tr>
       <th colspan="2" style="text-align: center; padding: 5px;">TRANCH DETAILS</th>
   </tr>
</thead>
<tbody>
   <tr>
       <td style="font-weight: bold; padding: 3px; width: 50%;">CASE TYPE</td>
       <td style="padding: 3px; width: 50%;">COSTRUCTION</td>
   </tr>
   <tr>
       <td style="font-weight: bold; padding: 3px;">1ST TRANCH</td>
       <td style="padding: 3px;">${btDetailsData?.first_Trance_Amount}</td>
   </tr>
   <tr>
       <td style="font-weight: bold; padding: 3px;">2ND TRANCH</td>
       <td style="padding: 3px;">${btDetailsData?.second_Trance_Amount}</td>
   </tr>
</tbody>`;

const html = `
  <html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; }
       h2 { color: #4CAF50; }
      p { font-size: 14px; color: #333; }
       table { 
    width: 60%;
    border-collapse: collapse; 
    margin: 20px auto;
    font-size: 12px;
  }
  table, th, td { 
    border: 1px solid #ddd; 
    padding: 6px;
     margin: 15px 0;
    text-align: left;
  }
  th { 
    background-color: rgb(19, 79, 92);
    text-align: left;
    color: white;
  }
  td[style*="font-weight: bold"] {
    background-color: #f8f8f8;
  }
      .footer { margin-top: 20px; font-size: 12px; color: #888; }
    </style>
  </head>
  <body>
    <p>Dear Team,\n</p>
    <p>We are writing to recommend the sanction of a loan application . After a thorough review of the applicant's profile and financial details, We believe this case meets our lending criteria and presents a favorable risk profile.\n</p>
     <p>Please find the Profile details :-\n</p>
     
   <table>
  <thead>
      <tr>
          <th colspan="2" style="text-align: center; padding: 5px;">Recommendation Profile</th>
      </tr>
  </thead>
  <tbody>
      <tr>
          <td style="font-weight: bold; padding: 3px; width: 50%;">BRANCH NAME</td>
          <td style="padding: 3px; width: 50%;">${customerData?.branch?.name
  }</td>
      </tr>
      <tr>
          <td style="font-weight: bold; padding: 3px;">CUSTOMER NAME</td>
          <td style="padding: 3px;">${applicantData?.fullName}</td>
      </tr>
      <tr>
          <td style="font-weight: bold; padding: 3px;">CONTACT NO</td>
          <td style="padding: 3px;">${applicantData?.mobileNo}</td>
      </tr>
       <tr>
          <td style="font-weight: bold; padding: 3px;">LOAN AMOUNT</td>
          <td style="padding: 3px;">Rs.${finalData?.finalLoanAmount}</td>
      </tr>
       <tr>
          <td style="font-weight: bold; padding: 3px;">TENURE</td>
          <td style="padding: 3px;">${finalData?.tenureInMonth} months</td>
      </tr>
      <tr>
          <td style="font-weight: bold; padding: 3px;">IRR</td>
          <td style="padding: 3px;">${finalData?.roi}%</td>
      </tr>
      <tr>
          <td style="font-weight: bold; padding: 3px;">EMI</td>
          <td style="padding: 3px;">Rs.${Math.round(finalData?.emiAmount)}</td>
      </tr>
  </tbody>
</table>

<table>
  ${internalLegalData?.LoanType === 'BT' || internalLegalData?.LoanType === 'BT-TOPUP' ? btTableHtml(btDetailsData) : ''}
</table>

<table>
  ${internalLegalData?.LoanType === 'CONSTRUCTION' && btDetailsData ? constructionHtml(btDetailsData) : ''}
</table>

<p>Please review the attached detailed analysis and let us know if you need any additional information to proceed with the sanction.</p>
    <div class="footer">
      <p style="font-weight: bold">Best Regards</p>
      <p style="font-weight: bold">${employeeDetails?.employeName || ""}</p>

      <p style="font-weight: bold">Fin Coopers Capital Pvt Ltd</p>
    </div>

  </body>
  </html>`;



    const attachment = finalData?.sanctionZipUrl
    // console.log(attachment,"attachmentattachment<><>")
    // Send Email

    const loanTypeText = 
    internalLegalData?.LoanType === "BT-TOPUP" ? " BT-TOPUP" :
    internalLegalData?.LoanType === "BT" ? " BT" : ""; 

    await finalApprovalSendPartnerSanction(
      toEmails,
      ccmails,
      `Case is Recommended for Approval//${venderData?.shortName}//Refrence No.${customerData?.customerFinId} //${applicantData?.fullName} S/o ${applicantData?.fatherName}//Loan Amount ${finalData?.finalLoanAmount} For ${finalData?.tenureInMonth} Months //${loanTypeText}`,
      html,
      attachment
    );

    console.log("Email sent successfully.");
  } catch (error) {
    console.error("Error in EmailsendPd:", error);
  }
};
// mailSendPartnerToSanction()

module.exports = { mailSendPartnerToSanction };
//
