const disbursementModel = require("../../model/fileProcess/disbursement.model");
const applicantModel =  require("../../model/applicant.model.js")
const customerModel = require("../../model/customer.model.js")

const employeeModel = require('../../model/adminMaster/employe.model')
const mongoose = require("mongoose");

const ObjectId = mongoose.Types.ObjectId;

const {
  success,
  unknownError,
  serverValidation,
  unauthorized,
  badRequest,
  notFound,
} = require("../../../../../globalHelper/response.globalHelper");
const { validationResult } = require("express-validator");

// const createDisbursement = async (req, res) => {
//   try {
//     const Id = req.Id;
//     const {
//       customerId,
//       // applicantName,
//       dateOfSanction,
//       sanctionLetterNumber,
//       dateOfTheAgreement,
//       placeOfExecution,
//       processingFees,
//       documentsCharges,
//       insuranceCharges,
//       cersaiCharges,
//       preEmiInterest,
//       benchmarkInterestRate,
//       SpreadInterestRate,
//       annualPercentageRateAprPercentage,
//       epi,
//       noOfEpi,
//       // fatherName,
//       loanNumber,
//       actualPreEmi,
//       dateOfDisbursement,
//       dateOfFirstEmi,
//       utrNumberOne,
//       utrNumberTwo,
//       disbursementDoneBy,
//       partnerCustomerID,
//     } = req.body;

//     const completeDate = new Date().toString().split(" ").slice(0, 5).join(" ");
//     const applicantFind = await applicantModel.findOne({ customerId:new mongoose.Types.ObjectId(customerId) });
//         if (!applicantFind) {
//             return badRequest(res, "Applicant not found");
//         }

//         const disbursmentFind = await disbursementModel.findOne({ customerId:new mongoose.Types.ObjectId(customerId) });
        
        

//     const data = await disbursementModel.create({
//       customerId,
//       employeeId: Id,
//       preDisbursementForm: {
//         // applicantName,
//           applicantName: applicantFind.fullName ,// Directly populate applicantName with fullName from customerModel
//         dateOfSanction,
//         loanNumber,
//         partnerCustomerID,
//         // sanctionLetterNumber,
//         dateOfTheAgreement,
//         placeOfExecution,
//       },
//       kfsDetails: {
//         processingFees,
//         documentsCharges,
//         insuranceCharges,
//         cersaiCharges,
//         preEmiInterest,
//         benchmarkInterestRate,
//         SpreadInterestRate,
//         annualPercentageRateAprPercentage,
//         epi,
//         noOfEpi,
//       },
//       postDisbursementDetails: {
//         applicantName: applicantFind.fullName ,
//         fatherName:applicantFind.fatherName,
//         loanNumber:loanNumber ||disbursmentFind.loanNumber,
//         actualPreEmi,
//         dateOfDisbursement,
//         dateOfFirstEmi,
//         utrNumberOne,
//         utrNumberTwo,
//         disbursementDoneBy,
//       },
//       completeDate: completeDate,
//     });
//     return success(res, "disbursement created successfully", data);
//   } catch (error) {
//     console.log(error);
//     return unknownError(res, error);
//   }
// };


async function createDisbursement(req, res) {
  try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({
              errorName: "serverValidation",
              errors: errors.array(),
          });
      }

      const tokenId = new ObjectId(req.Id);
      const completeDate = new Date().toString().split(' ').slice(0, 5).join(' ');
      const vendorData = await employeeModel.findOne({ _id: tokenId, status: "active" });
      if (!vendorData) {
          return badRequest(res, "employee not found");
      }
      const { customerId, formStatus } = req.body;
      if (!customerId || customerId.trim() === "") {
          return badRequest(res, "customerId is required");
      }

      const customerFind = await customerModel.findById(customerId);
      if (!customerFind) {
          return badRequest(res, "Customer Not Found");
      }
      const applicantFind = await applicantModel.findOne({ customerId:new mongoose.Types.ObjectId(customerId) });
      if (!applicantFind) {
          return badRequest(res, "Applicant not found");
      }

        const disbursmentFind = await disbursementModel.findOne({ customerId:new mongoose.Types.ObjectId(customerId) });


      const existingdisbursmentDetail = await disbursementModel.findOne({ customerId });
      let disbursmentDetail;
      const LoanNumber = disbursmentFind?.preDisbursementForm?.loanNumber || '';


      const disbursmentData = {
          ...req.body,
          employeeId: vendorData._id,
          customerName: customerFind.fullName || '',
          // LD: customerFind.customerFinId || '',
          // status: formStatus || 'pending',
          completeDate: completeDate,
          preDisbursementForm: {
              ...(req.body.preDisbursementForm || {}),
              applicantName: applicantFind.fullName // Directly populate applicantName with fullName from customerModel
          },
          
                  
                  postDisbursementDetails: {
                    ...(req.body.postDisbursementDetails || {}),

                    applicantName: applicantFind.fullName ,
                    fatherName:applicantFind.fatherName,
                    loanNumber:req.body.preDisbursementForm?.loanNumber,
                    
                  },
      };

      if (existingdisbursmentDetail) {
        disbursmentDetail = await disbursementModel.findByIdAndUpdate(
              existingdisbursmentDetail._id,
              disbursmentData,
              { new: true }
          );
          return success(res, "disbursment updated Successfully", disbursmentDetail);
      } else {
        disbursmentDetail = await disbursementModel.create(disbursmentData);
          return success(res, "disbursment Created Successfully", disbursmentDetail);
      }
  } catch (error) {
      console.error(error);
      return unknownError(res, error);
  }
}
const finalSactionDetails = async (req, res) => {
  try {
    const { customerId } = req.query;
    const data = await disbursementModel.findOne({
      customerId,
      status: "active",
    });
    return success(res, "disbursement detsils", data);
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
};

const finalSactionList = async (req, res) => {
  try {
    const data = await disbursementModel.find({ status: "active" });
    return success(res, "disbursement list", { datalength: data.length, data });
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
};

module.exports = {
  createDisbursement,
  finalSactionDetails,
  finalSactionList,
};
