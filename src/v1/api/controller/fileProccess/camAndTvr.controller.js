const {
    success,
    unknownError,
    serverValidation,
    unauthorized,
    badRequest,
    notFound,
  } = require("../../../../../globalHelper/response.globalHelper");
  
  const { validationResult } = require("express-validator");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
  const upload = require("../../../../../Middelware/multerAudio.js"); 
  const camReportDetails = require("../../model/fileProcess/camReport.model");
  const tvrDetails = require("../../model/fileProcess/tvr.model");

  const vendorModel = require('../../model/adminMaster/vendor.model.js')

const customerModel = require("../../model/customer.model.js")

const employeeModel = require('../../model/adminMaster/employe.model')
const applicantModel =  require("../../model/applicant.model.js")

// try {
//     const camReports = await camReportDetail.find();
//     res.status(200).json(camReports);
//   } catch (error) {

  // async function camReport (req, res){
  //   try {
        
  //     const camReportData = req.body; 
  //     const newCamReport = new camReportDetails(camReportData); 
  //     await newCamReport.save(); 
    
  //   success(res, "CAM Report created successfully!", newCamReport);

  //   } catch (error) {
  //       console.error(error);
  //       unknownError(res, error);
  //   }
  // };

  async function camReport(req, res) {
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

        const existingcamDetail = await camReportDetails.findOne({ customerId });
        let camDetail;

        if (existingcamDetail) {
          camDetail = await camReportDetails.findByIdAndUpdate(
              existingcamDetail._id,
                {
                    ...req.body,
                    employeeId: vendorData._id,
                    customerName: customerFind.fullName || '',
                    LD: customerFind.customerFinId || '',
                    status: formStatus || 'pending',
                    completeDate: completeDate
                },
                { new: true }
            );
            success(res, "CAM Report Form updated Successfully", camDetail);

        } else {
          camDetail = await camReportDetails.create({
                employeeId: vendorData._id,
                customerName: customerFind.fullName || '',
                LD: customerFind.customerFinId || '',
                ...req.body,
                status: formStatus || 'pending',
                completeDate: completeDate
            });
            success(res, "CAM Report Form Created Successfully", camDetail);

        }
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}

async function camReportGET(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        const tokenId = new ObjectId(req.Id);
        const vendorData = await employeeModel.findOne({ _id: tokenId, status: "active" });
        if (!vendorData) {
            return badRequest(res, "employee not found");

        }

        const { customerId } = req.query;
        if (!customerId .trim() === "") {
            return badRequest(res, "customerId is required");

        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return badRequest(res, "Customer Not Found");

        }

        const existingcamDetail = await camReportDetails.findOne({ customerId });
        success(res, "CAM Report Form get Successfully", existingcamDetail);

        

        }
    catch(error) {
        console.error(error);
        unknownError(res, error);
    }
}


// async function tvrFunCTION(req, res) {
//     try {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({
//                 errorName: "serverValidation",
//                 errors: errors.array(),
//             });
//         }

//         const tokenId = new ObjectId(req.Id);
//         const completeDate = new Date().toString().split(' ').slice(0, 5).join(' ');
//         const vendorData = await employeeModel.findOne({ _id: tokenId, status: "active" });
//         if (!vendorData) {
//             return badRequest(res, "employee not found");
//         }
//         const { customerId, formStatus } = req.body;
//         if (!customerId || customerId.trim() === "") {
//             return badRequest(res, "customerId is required");
//         }

//         const customerFind = await customerModel.findById(customerId);
//         if (!customerFind) {
//             return badRequest(res, "Customer Not Found");
//         }
//         const applicantFind = await applicantModel.findOne({ customerId:new mongoose.Types.ObjectId(customerId) });
//         if (!applicantFind) {
//             return badRequest(res, "Applicant not found");
//         }


//         const existingtvrDetail = await tvrDetails.findOne({ customerId });
//         let tvrDetail;

//         const tvrData = {
//             ...req.body,
//             employeeId: vendorData._id,
//             customerName: customerFind.fullName || '',
//             LD: customerFind.customerFinId || '',
//             status: formStatus || 'pending',
//             completeDate: completeDate,
//             applicantInformation: {
//                 ...(req.body.applicantInformation || {}),
//                 applicantName: applicantFind.fullName // Directly populate applicantName with fullName from customerModel
//             }
//         };

//         if (existingtvrDetail) {
//             tvrDetail = await tvrDetails.findByIdAndUpdate(
//                 existingtvrDetail._id,
//                 tvrData,
//                 { new: true }
//             );
//             return success(res, "Tvr Form updated Successfully", tvrDetail);
//         } else {
//             tvrDetail = await tvrDetails.create(tvrData);
//             return success(res, "Tvr Form Created Successfully", tvrDetail);
//         }
//     } catch (error) {
//         console.error(error);
//         return unknownError(res, error);
//     }
// }


async function tvrFunCTION(req, res) {
  try {
    // Use upload middleware to process file upload
    upload.single("audio")(req, res, async function (err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }

      const tokenId = new ObjectId(req.Id);
      const completeDate = new Date().toString().split(" ").slice(0, 5).join(" ");
      const vendorData = await employeeModel.findOne({ _id: tokenId, status: "active" });
      if (!vendorData) return badRequest(res, "Employee not found");

      const { customerId, formStatus } = req.body;
      if (!customerId || customerId.trim() === "") return badRequest(res, "customerId is required");

      const customerFind = await customerModel.findById(customerId);
      if (!customerFind) return badRequest(res, "Customer Not Found");

      const applicantFind = await applicantModel.findOne({ customerId: new mongoose.Types.ObjectId(customerId) });
      if (!applicantFind) return badRequest(res, "Applicant not found");

      const existingtvrDetail = await tvrDetails.findOne({ customerId });

      let tvrData = {
        ...req.body,
        employeeId: vendorData._id,
        customerName: customerFind.fullName || "",
        LD: customerFind.customerFinId || "",
        status: formStatus || "pending",
        completeDate: completeDate,
        audio: req.file ? req.file.path : "", 
        applicantInformation: {
          ...(req.body.applicantInformation || {}),
          applicantName: applicantFind.fullName,
        },
      };

      let tvrDetail;
      if (existingtvrDetail) {
        tvrDetail = await tvrDetails.findByIdAndUpdate(existingtvrDetail._id, tvrData, { new: true });
        return success(res, "Tvr Form updated Successfully", tvrDetail);
      } else {
        tvrDetail = await tvrDetails.create(tvrData);
        return success(res, "Tvr Form Created Successfully", tvrDetail);
      }
    });
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}



async function tvrGET(req, res) {
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

        const { customerId } = req.query;
        if (!customerId .trim() === "") {
            return badRequest(res, "customerId is required");

        }

        const customerFind = await customerModel.findById(customerId);
        if (!customerFind) {
            return badRequest(res, "Customer Not Found");

        }

        const existingtvrDetail = await tvrDetails.findOne({ customerId });
        
        success(res, "Tvr Form get Successfully", existingtvrDetail);

        

        }
    catch(error) {
        console.error(error);
        unknownError(res, error);
    }
}




  module.exports={
    camReport,
    tvrFunCTION,
    camReportGET,
    tvrGET
         
} 