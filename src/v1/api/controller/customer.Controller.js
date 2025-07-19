const {
  success,
  unknownError,
  serverValidation,
  badRequest,
  notFound,
  parseJwt
} = require("../../../../globalHelper/response.globalHelper");
const axios = require("axios");
const cron = require("node-cron");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const moment = require("moment-timezone");
const ObjectId = mongoose.Types.ObjectId;
const taskModel = require("../model/taskManagement/task.model");
const bodEodModel = require("../model/bodEod.model");
const customerModel = require("../model/customer.model");
const applicantModel = require("../model/applicant.model.js");
const coApplicantModel = require("../model/co-Applicant.model");
const guarantorModel = require("../model/guarantorDetail.model");
const cibilModel = require("../model/cibilDetail.model.js");
const pdModel = require("../model/credit.Pd.model.js")
const externalManagerModel = require("../model/externalManager/externalVendorDynamic.model.js")
const collectionModel = require("../model/collection/collectionSheet.model.js")
const cashTrnserModel = require('../model/collection/cashTransfer.model.js')
const employeModel = require('../model/adminMaster/employe.model.js')
const leadGenerateModel = require('../model/leadGenerate.model.js')
const directJoiningModel = require('../model/hrms/directJoining.model.js')
const roleModel = require("../model/adminMaster/role.model.js")
const referenceModel = require("../model/reference.model");
const loanTypeModel = require("../model/adminMaster/loanType.model.js")
const incomeCatagoryModel = require("../model/adminMaster/incomeCatagory.model.js")
const propertyTypeModel = require("../model/adminMaster/propertyType.model.js")
const bankAccountModel = require("../model/banking.model");
const bankModel = require('../model/bankAccount.model.js')
const productModel = require("../model/adminMaster/product.model");
const processModel = require("../model/process.model.js");
const { createOrder, getAllPayments, OrderDetails } = require("../services/razorpay.js");
const salesCaseModel = require("../model/salesCase.model.js");
const { updateFileFields } = require('./functions.Controller.js')
const aadharModel = require('../model/aadhaar.model.js')
const okCreditModel = require("../model/adminMaster/okCredit.model.js")
const aadharOcrModel = require('../model/aadhaarOcr.model.js')
const panFatherModel = require('../model/panFather.model.js')
const panComprehensiveModel = require('../model/panComprehensive.model.js')
const permissionModel = require('../model/adminMaster/permissionForm.model.js')
const employeeModel = require('../model/adminMaster/employe.model.js')
const newBranchModel = require('../model/adminMaster/newBranch.model.js')
const vendorModel = require('../model/adminMaster/vendor.model.js')
const { downloadImage } = require('./downloadImages.js')
const { customerGoogleSheetList, applicantGoogleSheet, coApplicantGoogleSheet,
  customerGoogleSheet,
  guarantorGoogleSheet, referenceGoogleSheet,
  bankDetailGoogleSheet, salesCaseDetailGoogleSheet, leadGenerateGoogleSheet, salesToPdAllFilesDataGoogleSheet } = require("../controller/googleSheet.controller.js")
const { CashFreePaymentRequest, CashFreePaymentLinkRequest } = require('../services/cashfree.services.js')
require("dotenv").config(path = "../../.env");
const fs = require('fs');
const { fileCreateMailSend } = require('../controller/MailFunction/salesMail')
const X_CLIENT_ID = process.env.X_CLIENT_ID;
const X_CLIENT_SECRET = process.env.X_CLIENT_CLIENT_SECRET;
const { addAutoTask, completeAutoTask } = require("../helper/autoTask.helper.js")

function capitalizeWords(str) {
  return str.replace(/\b\w/g, function (char) {
    return char.toUpperCase();
  });
}

function toUpperCase(str) {
  return str.toUpperCase();
}

// make a function for download images //

// Controller function
// async function Images(req, res) {
//   try {
//     const { urls } = req.query;
//     const urlList = Array.isArray(urls) ? urls : [urls];

//     if (urlList.length == 20) {
//       // Single image download
//       const stream = await downloadImage(urlList[0]);
//       res.setHeader('Content-Disposition', 'attachment; filename="image.jpg"');
//       return stream.pipe(res); // Stream the file to the browser
//     } else {
//       // Multiple images
//       const zip = require('adm-zip'); // Install with `npm install adm-zip`
//       const zipFile = new zip();

//       for (let i = 0; i < urlList.length; i++) {
//         const stream = await downloadImage(urlList[i]);
//         const chunks = [];
//         stream.on('data', (chunk) => chunks.push(chunk));
//         await new Promise((resolve, reject) => {
//           stream.on('end', () => {
//             zipFile.addFile(`image_${i + 1}.jpg`, Buffer.concat(chunks));
//             resolve();
//           });
//           stream.on('error', reject);
//         });
//       }

//       const zipBuffer = zipFile.toBuffer();
//       res.setHeader('Content-Disposition', 'attachment; filename="images.zip"');
//       res.setHeader('Content-Type', 'application/zip');
//       return res.end(zipBuffer); // Send the ZIP file to the browser
//     }
//   } catch (error) {
//     console.error('Error in downloadImages:', error);
//     return res.status(500).json({ status: false, message: error.message });
//   }
// }

// Function to handle the downloading and streaming of multiple images
async function Images(req, res) {
  try {
    const { urls } = req.query;
    const urlList = Array.isArray(urls) ? urls : [urls];
    console.log('urlList', urlList)
    if (urlList.length === 1) {
      const stream = await downloadImage(urlList[0]);
      res.setHeader('Content-Disposition', 'attachment; filename="image.jpg"');
      return stream.pipe(res);
    } else {
      const zip = require('adm-zip');
      const zipFile = new zip();

      for (let i = 0; i < urlList.length; i++) {
        const stream = await downloadImage(urlList[i]);
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        await new Promise((resolve, reject) => {
          stream.on('end', () => {
            zipFile.addFile(`image_${i + 1}.jpg`, Buffer.concat(chunks));
            resolve();
          });
          stream.on('error', reject);
        });
      }

      const zipBuffer = zipFile.toBuffer();
      res.setHeader('Content-Disposition', 'attachment; filename="images.zip"');
      res.setHeader('Content-Type', 'application/zip');
      return res.end(zipBuffer); // Send the ZIP file to the browser
    }
  } catch (error) {
    console.error('Error in downloadImages:', error);
    return res.status(500).json({ status: false, message: error.message });
  }
}



async function generateUniqueCustomerFinId(productFinId) {
  try {
    // Find the latest customer with this productFinId pattern
    const exactMatchPattern = new RegExp(`^${productFinId}\\d{4}$`);

    const latestCustomer = await customerModel.findOne({
      customerFinId: exactMatchPattern
    })
      .sort({ customerFinId: -1 }) // Sort in descending order to get the latest
      .select('customerFinId');

    // console.log('latestCustomer',latestCustomer)
    if (latestCustomer) {
      // Extract the numeric part from the existing customerFinId
      const currentNumber = parseInt(latestCustomer.customerFinId.replace(productFinId, ''));
      // Generate the next number
      const nextNumber = currentNumber + 1;
      // Pad with zeros to maintain consistent length (4 digits)
      return `${productFinId}${nextNumber.toString().padStart(4, '0')}`;
    } else {
      // If no existing customer, start with 1001
      return `${productFinId}1001`;
    }
  } catch (error) {
    console.error('Error generating unique customer ID:', error);
    throw error;
  }
}

async function createDraftLoginFees(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { mobileNo, productId, latitude, longitude } = req.body;
    const formCreateDate = new Date().toString().split(' ').slice(0, 5).join(' ');
    const currentTime = moment().tz('Asia/Kolkata');
    const approvalDate = currentTime.format("YYYY-MM-DD");
    const approvalTime = currentTime.format("hh:mm A");

    if (!mobileNo || mobileNo == '') {
      return badRequest(res, 'mobile Number required');
    }

    if (!productId || productId.trim() === "") {
      return badRequest(res, "Please Select Product");
    }

    // Get employee and product details
    const [employeDetail, productDetail] = await Promise.all([
      employeModel.findById(new ObjectId(req.Id)),
      productModel.findById(productId)
    ]);


    if (!employeDetail) {
      return badRequest(res, "Invalid employe Details");
    }

    if (!productDetail) {
      return badRequest(res, "Product Not Found");
    }

    const branchDetail = await newBranchModel.findById({
      _id: new ObjectId(employeDetail.branchId),
    }).select('name PaymentGateway');

    const employeeBranchCheck = await newBranchModel.findById(employeDetail.branchId)
    if (!employeeBranchCheck) {
      return badRequest(res, "Employee Branch Not Find")
    }
    // console.log('branchDetail',branchDetail)    


    const nearestBranchDetails = await newBranchModel.findById({
      _id: new ObjectId(req.body.nearestBranchId),
    }).select('name');

    // Check for existing mobile number for specific product type
    if (productDetail.productName == 'Secured LAP - BT NEW') {
      const mobileNoExist = await customerModel.findOne({ mobileNo });
      if (mobileNoExist) {
        return badRequest(res, 'mobile Number Already Exist');
      }
    }


    // Generate unique customer ID
    const newCustomerFinId = await generateUniqueCustomerFinId(productDetail.productFinId);
    // console.log('newCustomerFinId---',newCustomerFinId)
    // Determine login fees and form status
    const loginFeesConfig = {
      loginFees: productDetail.loginFees > 0 ? productDetail.loginFees : 0,
      paymentStatus: productDetail.loginFees > 0 ? "pending" : "noLoginFees",
      startForm: true,
      endForm: productDetail.loginFees > 0 ? false : true
    };

    const lat = latitude ? parseFloat(latitude) : 0;
    const lng = longitude ? parseFloat(longitude) : 0;

    location = {
      type: "Point",
      coordinates: [lng, lat],
    }
    // Create customer record
    const customerDetail = new customerModel({
      ...req.body,
      employeId: employeDetail._id,
      customerFinId: newCustomerFinId,
      executiveName: employeDetail.userName,
      branch: employeDetail.branchId,
      paymentStatus: loginFeesConfig.paymentStatus,
      loginFees: loginFeesConfig.loginFees,
      PaymentGateway: branchDetail.PaymentGateway || '',
      location
    });
    // console.log('customerDetail',customerDetail)
    // return 
    const detail = await customerDetail.save();

    if (employeDetail && employeDetail.reportingManagerId) {
      const employeeManagerDetail = await employeModel.findById(new ObjectId(employeDetail.reportingManagerId));
      detail.employeeManagerNameStr = employeeManagerDetail ? employeeManagerDetail.employeName : "";

      if (employeeManagerDetail && employeeManagerDetail.reportingManagerId) {
        const clusterManagerDetail = await employeModel.findById(new ObjectId(employeeManagerDetail.reportingManagerId));
        detail.clusterManagerNameStr = clusterManagerDetail ? clusterManagerDetail.employeName : "";
      } else {
        detail.clusterManagerNameStr = "";
      }
    } else {
      detail.employeeManagerNameStr = "";
      detail.clusterManagerNameStr = "";
    }

    //add auto task  
    const startDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");

    const parameters = {
      employeeId: employeDetail._id,
      assignBy: employeDetail._id,
      title: `Customer Login`,
      task: `Customer login is successfull and customerFinID: ${detail?.customerFinId}`,
      dueDate: "",
      description: "",
      startDate,
      redirectUrl: `/salesonboaring/${detail?._id}/?formStep=0`,
      taskType: "login",
      customerId: detail?._id
    }
    await addAutoTask(parameters)

    // console.log(data,"data<<>><>>bodeod")
    // Create process record
    const newFormProcess = new processModel({
      employeId: req.Id,
      customerId: customerDetail._id,
      customerFormStart: loginFeesConfig.startForm,
      customerFormComplete: loginFeesConfig.endForm
    });

    await newFormProcess.save();

    // Rest of your existing code for manager details, Google Sheets updates, etc.
    // ...

    success(res, "Customer and process created successfully", detail);


    const salesToPdSheet = {
      customerFinIdStr: customerDetail.customerFinId,
      productNameStr: productDetail.productName ? productDetail.productName : '',
      leadGenedateDateStr: approvalDate,
      leadGenedateTimeStr: approvalTime,
      customerBranchNameStr: branchDetail?.name,
      employeUniqueIdStr: employeDetail?.employeUniqueId,
      employeeUserNameStr: employeDetail?.userName,
      employeNameStr: employeDetail?.employeName,
      customerMobileNoStr: detail.mobileNo,
      employeeManagerNameStr: detail.employeeManagerNameStr,
      clusterManagerNameStr: detail.clusterManagerNameStr,
    }

    await salesToPdAllFilesDataGoogleSheet(salesToPdSheet)
  } catch (error) {
    console.error('Error in createDraftLoginFees:', error);
    return unknownError(res, error.message);
  }
}


// async function newcreateDraftLoginFees(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return serverValidation(res, {
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }

//     const { mobileNo, productId, propertyTypeId, incomeCatagoryId, loanTypeId } = req.body;
//     const formCreateDate = new Date().toString().split(' ').slice(0, 5).join(' ');
//     const currentTime = moment().tz('Asia/Kolkata');
//     const approvalDate = currentTime.format("YYYY-MM-DD");
//     const approvalTime = currentTime.format("hh:mm A");

//     if (!mobileNo || mobileNo == '') {
//       return badRequest(res, 'mobile Number required');
//     }

//     if (!productId || productId.trim() === "") {
//       return badRequest(res, "Please Select Product");
//     }

//     // Get employee and product details
//     const [employeDetail, productDetail] = await Promise.all([
//       employeModel.findById(new ObjectId(req.Id)),
//       productModel.findById(productId)
//     ]);


//     if (!employeDetail) {
//       return badRequest(res, "Invalid employe Details");
//     }

//     if (!productDetail) {
//       return badRequest(res, "Product Not Found");
//     }

//     const branchDetail = await newBranchModel.findById({
//       _id: new ObjectId(employeDetail.branchId),
//     }).select('name PaymentGateway');

//     const employeeBranchCheck = await newBranchModel.findById(employeDetail.branchId)
//     if (!employeeBranchCheck) {
//       return badRequest(res, "Employee Branch Not Find")
//     }

//     if (!employeeBranchCheck.guarantorRequired) {
//       return badRequest(res, "Please configure whether a guarantor is required for this branch before processing loans.")

//     }

//     if (!employeeBranchCheck.loginFees) {
//       return badRequest(res, "Please set the login fees for this branch before processing loans.")
//     }


//     const nearestBranchDetails = await newBranchModel.findById({
//       _id: new ObjectId(req.body.nearestBranchId),
//     }).select('name');

//     // Check for existing mobile number for specific product type
//     if (productDetail.productName == 'Secured LAP - BT NEW') {
//       const mobileNoExist = await customerModel.findOne({ mobileNo });
//       if (mobileNoExist) {
//         return badRequest(res, 'mobile Number Already Exist');
//       }
//     }

//     if (propertyTypeId) {
//       const propertyTypeDetail = await propertyTypeModel.findById(propertyTypeId)
//       if (!propertyTypeDetail) {
//         return badRequest(res, "property Type Not Found")
//       }
//     } else {
//       return badRequest(res, "property Type Required")
//     }

//     if (incomeCatagoryId) {
//       const incomeCatagoryDetail = await incomeCatagoryModel.findById(incomeCatagoryId)
//       if (!incomeCatagoryDetail) {
//         return badRequest(res, "Income Category Type Not Found")
//       }
//     } else {
//       return badRequest(res, "Income Category Type Required")
//     }

//     if (loanTypeId) {
//       const loanTypeDetail = await loanTypeModel.findById(loanTypeId)
//       if (!loanTypeDetail) {
//         return badRequest(res, "Loan Type Not Found")
//       }
//     } else {
//       return badRequest(res, "Loan Type Required")
//     }


//     // Generate unique customer ID
//     const newCustomerFinId = await generateUniqueCustomerFinId(productDetail.productFinId);
//     // console.log('newCustomerFinId---',newCustomerFinId)
//     // Determine login fees and form status
//     const loginFeesConfig = {
//       loginFees: employeeBranchCheck.loginFees > 0 ? employeeBranchCheck.loginFees : 0,
//       paymentStatus: employeeBranchCheck.loginFees > 0 ? "pending" : "noLoginFees",
//       startForm: true,
//       endForm: employeeBranchCheck.loginFees > 0 ? false : true
//     };

//     // Create customer record
//     const customerDetail = new customerModel({
//       ...req.body,
//       employeId: employeDetail._id,
//       customerFinId: newCustomerFinId,
//       executiveName: employeDetail.userName,
//       branch: employeDetail.branchId,
//       paymentStatus: loginFeesConfig.paymentStatus,
//       loginFees: loginFeesConfig.loginFees,
//       PaymentGateway: branchDetail.PaymentGateway || ''
//     });
//     // console.log('customerDetail',customerDetail)
//     // return 
//     const detail = await customerDetail.save();

//     if (employeDetail && employeDetail.reportingManagerId) {
//       const employeeManagerDetail = await employeModel.findById(new ObjectId(employeDetail.reportingManagerId));
//       detail.employeeManagerNameStr = employeeManagerDetail ? employeeManagerDetail.employeName : "";

//       if (employeeManagerDetail && employeeManagerDetail.reportingManagerId) {
//         const clusterManagerDetail = await employeModel.findById(new ObjectId(employeeManagerDetail.reportingManagerId));
//         detail.clusterManagerNameStr = clusterManagerDetail ? clusterManagerDetail.employeName : "";
//       } else {
//         detail.clusterManagerNameStr = "";
//       }
//     } else {
//       detail.employeeManagerNameStr = "";
//       detail.clusterManagerNameStr = "";
//     }

//     // Create process record
//     const newFormProcess = new processModel({
//       employeId: req.Id,
//       customerId: customerDetail._id,
//       customerFormStart: loginFeesConfig.startForm,
//       customerFormComplete: loginFeesConfig.endForm
//     });

//     await newFormProcess.save();

//     // Rest of your existing code for manager details, Google Sheets updates, etc.
//     // ...

//     success(res, "Customer and process created successfully", detail);


//     const salesToPdSheet = {
//       customerFinIdStr: customerDetail.customerFinId,
//       productNameStr: productDetail.productName ? productDetail.productName : '',
//       leadGenedateDateStr: approvalDate,
//       leadGenedateTimeStr: approvalTime,
//       customerBranchNameStr: branchDetail?.name,
//       employeUniqueIdStr: employeDetail?.employeUniqueId,
//       employeeUserNameStr: employeDetail?.userName,
//       employeNameStr: employeDetail?.employeName,
//       customerMobileNoStr: detail.mobileNo,
//       employeeManagerNameStr: detail.employeeManagerNameStr,
//       clusterManagerNameStr: detail.clusterManagerNameStr,
//     }

//     await salesToPdAllFilesDataGoogleSheet(salesToPdSheet)
//   } catch (error) {
//     console.error('Error in createDraftLoginFees:', error);
//     return unknownError(res, error.message);
//   }
// }



async function newcreateDraftLoginFees(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const {
      mobileNo,
      productId,
      propertyTypeId,
      incomeCatagoryId,
      loanTypeId,
      customerFinId
    } = req.body;

    const formCreateDate = new Date().toString().split(' ').slice(0, 5).join(' ');
    const currentTime = moment().tz('Asia/Kolkata');
    const approvalDate = currentTime.format("YYYY-MM-DD");
    const approvalTime = currentTime.format("hh:mm A");

    if (!mobileNo || mobileNo == '') {
      return badRequest(res, 'mobile Number required');
    }

    if (!productId || productId.trim() === "") {
      return badRequest(res, "Please Select Product");
    }

    const [employeDetail, productDetail] = await Promise.all([
      employeModel.findById(new ObjectId(req.Id)),
      productModel.findById(productId)
    ]);

    if (!employeDetail) {
      return badRequest(res, "Invalid employe Details");
    }

    if (!productDetail) {
      return badRequest(res, "Product Not Found");
    }

    const branchDetail = await newBranchModel.findById({
      _id: new ObjectId(employeDetail.branchId),
    }).select('name PaymentGateway');

    const employeeBranchCheck = await newBranchModel.findById(employeDetail.branchId);
    if (!employeeBranchCheck) {
      return badRequest(res, "Employee Branch Not Find");
    }

    if (!employeeBranchCheck.guarantorRequired) {
      return badRequest(res, "Please configure whether a guarantor is required for this branch before processing loans.");
    }

    if (!employeeBranchCheck.loginFees) {
      return badRequest(res, "Please set the login fees for this branch before processing loans.");
    }

    if (productDetail.productName === 'Secured LAP - BT NEW') {
      const mobileNoExist = await customerModel.findOne({ mobileNo });
      if (mobileNoExist) {
        return badRequest(res, 'mobile Number Already Exist');
      }
    }

    if (propertyTypeId) {
      const propertyTypeDetail = await propertyTypeModel.findById(propertyTypeId);
      if (!propertyTypeDetail) {
        return badRequest(res, "Property Type Not Found");
      }
    } else {
      return badRequest(res, "Property Type Required");
    }

    if (incomeCatagoryId) {
      const incomeCatagoryDetail = await incomeCatagoryModel.findById(incomeCatagoryId);
      if (!incomeCatagoryDetail) {
        return badRequest(res, "Income Category Type Not Found");
      }
    } else {
      return badRequest(res, "Income Category Type Required");
    }

    if (loanTypeId) {
      const loanTypeDetail = await loanTypeModel.findById(loanTypeId);
      if (!loanTypeDetail) {
        return badRequest(res, "Loan Type Not Found");
      }
    } else {
      return badRequest(res, "Loan Type Required");
    }

    // Login fees logic
    const loginFeesConfig = {
      loginFees: employeeBranchCheck.loginFees > 0 ? employeeBranchCheck.loginFees : 0,
      paymentStatus: employeeBranchCheck.loginFees > 0 ? "pending" : "noLoginFees",
      startForm: true,
      endForm: employeeBranchCheck.loginFees > 0 ? false : true
    };

    // Check if customer with given customerFinId exists
    let customerDetail = null;
    if (customerFinId) {
      customerDetail = await customerModel.findOne({ customerFinId });

      if (customerDetail) {
        await customerModel.updateOne(
          { _id: customerDetail._id },
          {
            $set: {
              ...req.body,
              employeId: employeDetail._id,
              executiveName: employeDetail.userName,
              branch: employeDetail.branchId,
              paymentStatus: loginFeesConfig.paymentStatus,
              loginFees: loginFeesConfig.loginFees,
              PaymentGateway: branchDetail.PaymentGateway || ''
            }
          }
        );

        const updatedCustomer = await customerModel.findById(customerDetail._id);

        success(res, "Customer updated successfully", updatedCustomer);
        return;
      }
    }

    // Create new customer if not found
    const newCustomerFinId = await generateUniqueCustomerFinId(productDetail.productFinId);

    customerDetail = new customerModel({
      ...req.body,
      employeId: employeDetail._id,
      customerFinId: newCustomerFinId,
      executiveName: employeDetail.userName,
      branch: employeDetail.branchId,
      paymentStatus: loginFeesConfig.paymentStatus,
      loginFees: loginFeesConfig.loginFees,
      PaymentGateway: branchDetail.PaymentGateway || ''
    });

    const detail = await customerDetail.save();

    // Manager names logic
    if (employeDetail && employeDetail.reportingManagerId) {
      const employeeManagerDetail = await employeModel.findById(new ObjectId(employeDetail.reportingManagerId));
      detail.employeeManagerNameStr = employeeManagerDetail ? employeeManagerDetail.employeName : "";

      if (employeeManagerDetail && employeeManagerDetail.reportingManagerId) {
        const clusterManagerDetail = await employeModel.findById(new ObjectId(employeeManagerDetail.reportingManagerId));
        detail.clusterManagerNameStr = clusterManagerDetail ? clusterManagerDetail.employeName : "";
      } else {
        detail.clusterManagerNameStr = "";
      }
    } else {
      detail.employeeManagerNameStr = "";
      detail.clusterManagerNameStr = "";
    }

    // Create process
    const newFormProcess = new processModel({
      employeId: req.Id,
      customerId: customerDetail._id,
      customerFormStart: loginFeesConfig.startForm,
      customerFormComplete: loginFeesConfig.endForm
    });

    await newFormProcess.save();

    success(res, "Customer and process created successfully", detail);

    // Sheet integration
    const salesToPdSheet = {
      customerFinIdStr: customerDetail.customerFinId,
      productNameStr: productDetail.productName ? productDetail.productName : '',
      leadGenedateDateStr: approvalDate,
      leadGenedateTimeStr: approvalTime,
      customerBranchNameStr: branchDetail?.name,
      employeUniqueIdStr: employeDetail?.employeUniqueId,
      employeeUserNameStr: employeDetail?.userName,
      employeNameStr: employeDetail?.employeName,
      customerMobileNoStr: detail.mobileNo,
      employeeManagerNameStr: detail.employeeManagerNameStr,
      clusterManagerNameStr: detail.clusterManagerNameStr,
    };

    await salesToPdAllFilesDataGoogleSheet(salesToPdSheet);
  } catch (error) {
    console.error('Error in createDraftLoginFees:', error);
    return unknownError(res, error.message);
  }
}



async function newCustomerDetail(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const customerId = req.params.customerId;
    if (!customerId) {
      return badRequest(res, "Customer Id Required")
    }

    let customerDetail = await customerModel.findById(customerId).populate([
      { path: "nearestBranchId", select: "name" },
      { path: "loanTypeId", select: "name" },
      { path: "incomeCatagoryId", select: "name" },
      { path: "propertyTypeId", select: "name" },
      { path: "productId", select: "productName" }
    ]);

    if (!customerDetail) {
      return notFound(res, "customer Form Not Found");
    }
    return success(res, "customer Detail", customerDetail);
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}

async function loginFeesDetail(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { customerId } = req.query
    if (!customerId) {
      return badRequest(res, "customerId required");
    }
    const customerDetail = await customerModel.findById(customerId).populate({ path: 'productId', select: 'productName _id' }).populate({ path: 'branch', select: 'name _id' }).populate({ path: 'nearestBranchId', select: 'name _id' })

    return success(res, "Customer Detail ", customerDetail);

  } catch (error) {
    console.error(error);
    return unknownError(res, error.message);
  }
}


const customerBranchUpdate = async (req, res) => {
  try {
    const { _id, branchId } = req.query;

    if (!_id) {
      return badRequest(res, "Customer Id Required");
    }
    const customer = await customerModel.findById(_id);
    if (!customer) {
      return notFound(req, "Customer not found");
    }
    if (!branchId) {
      return badRequest(res, "Branch Id Required");
    }
    const branchDetail = await newBranchModel.findById(branchId)
    if (!branchDetail) {
      return notFound(res, "Branch Not Found");
    }
    customer.branch = branchId;
    await customer.save();
    return success(res, "Branch updated successfully");
  } catch (error) {
    console.error(error);
    return unknownError(res, error.message);
  }
};



async function PaymentAll(req, res) {
  const Count = req.query.count;
  const Skip = req.query.skip;
  try {
    const result = await getAllPayments(Count, Skip);
    if (!result?.items) {
      return unknownError(res, "No payment items found.");
    }

    console.log("result data is", result.items);



    // Extract and map payment summaries
    const paymentSummaries = result.items.map(payment => ({
      orderId: payment.order_id,
      paymentId: payment.id,
      status: payment.status,
      createdAt: moment.unix(payment.created_at).format("YYYY-MM-DD HH:mm:ss"),
      customerId: payment.notes.customer_id,
      customer_Mobile: payment.notes.customer_Mobile,
    }));


    const updatePromises = paymentSummaries.map(async payment => {
      const updates = [];
      const customer = await customerModel.findOne({ orderId: payment.orderId });
      if (customer) {
        if (payment.status === "captured") {
          updates.push(
            customerModel.findByIdAndUpdate(
              customer._id,
              {
                paymentStatus: "success",
                paymentDate: payment.createdAt,
              },
              { new: true }
            )
          );
        }




        const process = await processModel.findOne({ customerId: customer._id });
        if (process) {
          updates.push(
            processModel.findByIdAndUpdate(
              process._id,
              { customerFormComplete: true },
              { new: true }
            )
          );
        }
      }


      return Promise.all(updates);
    });

    await Promise.all(updatePromises);

    return success(
      res,
      "Payments retrieved and statuses updated successfully",
      paymentSummaries
    );
  } catch (error) {
    console.error("Error in PaymentAll:", error.message);
    return unknownError(res, error.message);
  }
}


// Make a function to view the Paymentall data //

async function viewPaymentAll(req, res) {
  try {
    const Count = req.query.count;
    const Skip = req.query.skip;
    const result = await getAllPayments(Count, Skip);
    if (!result?.items) {
      return unknownError(res, "No payment items found.");
    }
    return success(res, "Payment All Data", result.items);



  } catch (error) {
    console.log(error)
    return unknownError(res, error.message);
  }
}


async function paymentInitiate(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { customerId } = req.body;
    const employeDetail = await employeModel.findById({ _id: new ObjectId(req.Id) });
    if (!employeDetail) {
      return badRequest(res, "Invalid employee details");
    }
    const branchDetail = await newBranchModel.findById({
      _id: new ObjectId(employeDetail.branchId),
    }).select('name');

    const customerDetail = await customerModel.findById({ _id: new ObjectId(customerId) });
    if (!customerDetail) {
      return badRequest(res, "Invalid customer details");
    }
    const customer = await customerModel.findById({ _id: new ObjectId(customerId) });
    if (customer.paymentStatus === "success") {
      return badRequest(res, "Customer Already Paid Payment");
    }

    const productDetail = await productModel.findById({ _id: customerDetail.productId });
    if (!productDetail) {
      return badRequest(res, "Product not found");
    }
    const loginFees = productDetail.loginFees;
    if (loginFees > 0) {
      const amount = loginFees * 100;
      const razorpayOrder = await createOrder(
        customerDetail.employeId,
        customerDetail.productId,
        amount,
        employeDetail.userName,
        customerDetail.mobileNo,
        customerDetail.branch,
        customerDetail.loanAmount,
        customerDetail.roi,
        customerDetail.tenure,
        customerDetail.emi,
        customerDetail._id,

      );

      if (razorpayOrder) {
        // console.log("razor", razorpayOrder);

        customerDetail.orderId = razorpayOrder.id;
        customerDetail.paymentStatus = "pending";
        await customerDetail.save();

        // Send success response with order details
        success(res, "Order created and payment initiated successfully", {
          customerDetail,
          payment: razorpayOrder
        });
        console.log('customerDetail', customerDetail)

        // await customerGoogleSheet(customerDetail , employeDetail?.employeUniqueId?employeDetail?.employeUniqueId:"" ,branchDetail?.branch?branchDetail?.branch:"" )
        await customerGoogleSheet(customerDetail, employeDetail?.employeUniqueId ? employeDetail?.employeUniqueId : "", employeDetail?.employeName ? employeDetail?.employeName : "", branchDetail?.nam ? branchDetail?.name : "")

      } else {
        return badRequest(res, "Failed to create Razorpay order");
      }
    } else {
      customerDetail.paymentStatus = "noLoginFees";
      await customerDetail.save();

      success(res, "No login fees, no payment required", { customerDetail, payment: null });
      // await customerGoogleSheet(customerDetail , employeDetail?.employeUniqueId?employeDetail?.employeUniqueId:"" ,branchDetail?.branch?branchDetail?.branch:"" )
      await customerGoogleSheet(customerDetail, employeDetail?.employeUniqueId ? employeDetail?.employeUniqueId : "", employeDetail?.employeName ? employeDetail?.employeName : "", branchDetail?.name ? branchDetail?.name : "")
    }
  } catch (error) {
    console.error(error);
    return unknownError(res, error.message);
  }
}


// async function createDraftLoginFeesList(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     } 
//     // const createDraft = await customerModel.find();
//     const createDraft = await customerModel.find()
//       .populate({
//         path: 'employeId', // Populate employee data in place of employeId
//         select: 'employeName employeUniqueId branchId', // Select only employeeName and branchId from employee
//         populate: {
//           path: 'branchId', // Populate branchId data
//           select: 'branch', // Select only branchName from branch
//         },
//       })
//       .lean();
//     success(res, "create Draft List", createDraft);
//     await customerGoogleSheetList(createDraft)
//   } catch (error) {
//     console.log(error);
//     unknownError(res, error);
//   }
// };




async function createDraftLoginFeesList(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    let { page = 1, limit = 100, searchQuery = '', fileStatus } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    const skip = (page - 1) * limit;

    const searchCondition = {
      $or: [
        { 'applicantDetails.fullName': { $regex: searchQuery, $options: 'i' } },
        { 'applicantDetails.mobileNo': { $regex: searchQuery, $options: 'i' } },
        { customerFinId: { $regex: searchQuery, $options: 'i' } },
        { orderId: { $regex: searchQuery, $options: 'i' } },
      ],
    };

    if (fileStatus && fileStatus !== 'all') {
      searchCondition.status = fileStatus; // Match status based on user input
    }

    const createDraft = await customerModel
      .find(searchCondition)
      .select('_id applicantDetails employeId customerFinId orderId') // Fetch only necessary fields
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'employeId',
        select: 'employeName employeUniqueId branchId',
        populate: {
          path: 'branchId',
          select: '_id name',
        },
      })
      .lean();

    // Fetch all applicant details in one query
    const customerIds = createDraft.map(item => item._id);
    const applicantDetailsMap = await applicantModel
      .find({ customerId: { $in: customerIds } })
      .select('customerId fullName mobileNo')
      .lean()
      .then(applicants =>
        applicants.reduce((acc, applicant) => {
          acc[applicant.customerId] = applicant;
          return acc;
        }, {})
      );

    // Enrich draft data
    const enrichedDraft = createDraft.map(item => ({
      ...item,
      applicantDetails: applicantDetailsMap[item._id] || {},
    }));

    // Total count for pagination
    const totalCount = await customerModel.countDocuments(searchCondition);

    success(res, "Create Draft List", {
      data: enrichedDraft,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        limit,
      },
    });

    // Optional function call
    // await customerGoogleSheetList(enrichedDraft);
  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
}


// --------------  CashFree Payment Initiate ----------------- //

// cashfree payment request //
async function CashFreePaymentInitiate(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { customerId } = req.body;

    // check customerId is valid objectId or not //4

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return badRequest(res, "Invalid customer ID");
    }

    // Fetch customer details
    const customer = await customerModel.findById(customerId);
    if (!customer) {
      return badRequest(res, "Invalid customer details");
    }

    if (customer.paymentStatus === "success") {
      return badRequest(res, "Customer Already Paid Payment");
    }

    // Fetch employee details
    const employeDetail = await employeModel.findById(req.Id);
    if (!employeDetail) {
      return badRequest(res, "Invalid employee details");
    }


    // Fetch branch details
    const branchDetail = await newBranchModel
      .findById(employeDetail.branchId)
      .select("name");

    // Fetch product details
    const productDetail = await productModel.findById(customer.productId);
    if (!productDetail) {
      return badRequest(res, "Product not found");
    }

    const { loginFees } = productDetail;
    console.log("Login Fees:", loginFees);
    if (loginFees > 0) {
      const amount = loginFees;

      // Initiate Cashfree payment
      const CashfreeOrder = await CashFreePaymentRequest(
        customer.employeId,
        customer.productId,
        amount,
        employeDetail.userName,
        customer.mobileNo,
        customer.branch,
        customer.loanAmount,
        customer.roi,
        customer.tenure,
        customer.emi,
        customer._id,
        customer.customerFinId
      );


      if (CashfreeOrder) {
        // Update customer details
        customer.orderId = CashfreeOrder.orderId;
        customer.paymentStatus = "pending";
        await customer.save();

        // Return success response
        return success(res, "Order created and payment initiated successfully", {
          payment_url: CashfreeOrder.paymentUrl,
          session_id: CashfreeOrder.sessionId,
          orderId: CashfreeOrder.orderId,
          amount: CashfreeOrder.amount
        });


      } else {
        return badRequest(res, "Failed to create Cashfree order");
      }
    } else {
      // No login fees
      customer.paymentStatus = "noLoginFees";
      await customer.save();

      return success(res, "No login fees, no payment required", {
        customerDetail: customer,
        payment: null,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return unknownError(res, error.message);
  }
}


async function CashFreePaymentLink(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { customerId } = req.body;

    // check customerId is valid objectId or not //4

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return badRequest(res, "Invalid customer ID");
    }

    // Fetch customer details
    const customer = await customerModel.findById(customerId);
    if (!customer) {
      return badRequest(res, "Invalid customer details");
    }

    if (customer.paymentStatus === "success") {
      return badRequest(res, "Customer Already Paid Payment");
    }

    // Fetch employee details
    const employeDetail = await employeModel.findById(req.Id);
    if (!employeDetail) {
      return badRequest(res, "Invalid employee details");
    }


    // Fetch branch details
    const branchDetail = await newBranchModel
      .findById(employeDetail.branchId)
      .select("name");

    // Fetch product details
    const productDetail = await productModel.findById(customer.productId);
    if (!productDetail) {
      return badRequest(res, "Product not found");
    }

    const { loginFees } = productDetail;
    console.log("Login Fees:", loginFees);
    if (loginFees > 0) {
      const amount = loginFees;

      // Initiate Cashfree payment
      const CashfreeOrder = await CashFreePaymentLinkRequest(
        customer.employeId,
        customer.productId,
        amount,
        employeDetail.userName,
        customer.mobileNo,
        customer.branch,
        customer.loanAmount,
        customer.roi,
        customer.tenure,
        customer.emi,
        customer._id,
        customer.customerFinId
      );

      console.log("Cashfree Order:", CashfreeOrder);


      if (CashfreeOrder) {
        // Update customer details
        customer.orderId = CashfreeOrder.linkId;
        customer.paymentStatus = "pending";
        await customer.save();

        // Return success response
        return success(res, "Order created and payment initiated successfully", {
          payment_url: CashfreeOrder.paymentLink,
          orderId: CashfreeOrder.linkId,
          amount: CashfreeOrder.amount
        });


      } else {
        return badRequest(res, "Failed to create Cashfree order");
      }
    } else {
      // No login fees
      customer.paymentStatus = "noLoginFees";
      await customer.save();

      return success(res, "No login fees, no payment required", {
        customerDetail: customer,
        payment: null,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return unknownError(res, error.message);
  }
}



// cash cash free payment verify //


async function CashFreePaymentVerify(req, res) {

  try {
    const orderId = req.params.orderId;
    if (!orderId) {
      return badRequest(res, "Order ID is required");
    }
    const orderUrl = `https://api.cashfree.com/pg/orders/${orderId}`;
    // const orderUrl = `https://sandbox.cashfree.com/pg/orders/${orderId}`;
    const option = {
      method: 'GET',
      url: orderUrl,
      headers: {
        'x-api-version': '2022-09-01',
        'content-type': 'application/json',
        'x-client-id': X_CLIENT_ID,
        'x-client-secret': X_CLIENT_SECRET,
      },
    }

    const response = await axios(option);
    console.log('Order Details:', response.data);
    if (response.data && response.data.order_status === 'PAID') {

      return success(res, "Payment Success", response.data);
      // return res.redirect('http://localhost:3000/success')

    } else if (response.data && response.data.order_status === 'ACTIVE') {
      // return res.redirect(`http://localhost:3000/${response.data.payment_session_id}`)
      return success(res, "Payment Pending", response.data);
    }
    else {
      // return res.redirect('http://localhost:3000/failure')
      return success(res, "Payment Failed", response.data);
    }

  } catch (error) {
    console.error('Error in CashFreePaymentVerify:', error.message);
    return unknownError(res, error.message);

  }

}


// featch all orders //

// async function fetchAllOrders(req, res) {
//   try {
//     // Define the base URL for fetching orders
//     const baseUrl = 'https://api.cashfree.com/pg/orders';
//     // For sandbox environment, use: 'https://sandbox.cashfree.com/pg/orders'

//     const page = req.query.page || 1; // Use query parameters for pagination
//     const limit = req.query.limit || 10; // Define how many orders to fetch per page

//     const options = {
//       method: 'GET',
//       url: `${baseUrl}?page=${page}&limit=${limit}`,
//       headers: {
//         'x-api-version': '2022-09-01',
//         'content-type': 'application/json',
//         'x-client-id': X_CLIENT_ID, // Replace with your client ID
//         'x-client-secret': X_CLIENT_SECRET, // Replace with your client secret
//       },
//     };

//     const response = await axios(options);

//     // Log or process the response
//     console.log('Fetched Orders:', response.data);

//     if (response.data && response.data.orders) {
//       return success(res, 'Orders fetched successfully', response.data.orders);
//     } else {
//       return success(res, 'No orders found', []);
//     }
//   } catch (error) {
//     console.error('Error in fetchAllOrders:', error);
//     return unknownError(res, error.message);
//   }
// }

// async function fetchAllOrders(req, res) {
//   try {
//     const { startDate, endDate, maxReturn = 50, lastReturnId = 0 } = req.query;

//     if (!startDate || !endDate) {
//       return res.status(400).json({ message: "startDate and endDate are required" });
//     }

//     const getToken = async () => {
//       const url = "https://api.cashfree.com/gc/authorize";
//       const headers = {
//         "x-client-id": "8225067a6d6bbaababc98cf1d3605228",
//         "x-client-secret": "cfsk_ma_prod_327a63c490144fcca36b8d079e4f777b_631d0abf",
//         "x-api-version":"2023-03-01",
//       };



//       try {
//         const response = await axios.post(url, {}, { headers, timeout: 10000 });
//         if (response.data) {
//           return response.data.cftoken; 
//         } else {
//           throw new Error("Failed to fetch token");
//         }
//       } catch (error) {
//         throw new Error("Failed to fetch token: " + error.message);
//       }
//     };

//     console.log("Headers" , headers)

//     const token = await getToken();

//     const transactionsUrl = "https://api.cashfree.com/gc/transactions";
//     console.log('token',token)
//     const headers = {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     };

//     const options = {
//       method: "GET",
//       url: transactionsUrl,
//       headers: headers,
//       params: {
//         startDate, 
//         endDate,
//         maxReturn,
//         lastReturnId,
//       },
//     };

//     const response = await axios(options);

//     return success(res, "Transactions fetched successfully", response.data);

//   } catch (error) {
//     console.error("Error fetching transactions:", error);

//     if (error.response) {
//       if (error.response.status === 520) {
//         return BadRequest(res, "Invalid request parameters");
//       }
//       return unknownError(res, error.response.data);
//     }

//    return unknownError(res, error.message);
//   }
// }


// cashfree webhook //
async function cashfreeWebhook(req, res) {
  try {
    const { type: event, data } = req.body;

    // console.log("Cashfree Webhook Event:", event);
    // console.log("Cashfree Webhook Data:", JSON.stringify(data, null, 2));

    switch (event) {
      case "PAYMENT_SUCCESS_WEBHOOK":
        await handlePaymentSuccess(data);
        break;

      case "PAYMENT_FAILED_WEBHOOK":
        await handlePaymentFailure(data);
        break;

      case "PAYMENT_USER_DROPPED_WEBHOOK":
        await handlePaymentdropped(data);
        break;

      default:
        console.log("Unhandled event type:", event);
    }

    // Respond to Cashfree
    return success(res, "Webhook received successfully");
  } catch (error) {
    console.error("Cashfree Webhook Error:", error);
    return unknownError(res, error.message);
  }
}

// Handle Payment Success
async function handlePaymentSuccess(data) {
  const currentTime = moment().tz('Asia/Kolkata');
  const paymentDate = currentTime.format("YYYY-MM-DD");
  const paymentTime = currentTime.format("hh:mm A");
  const {
    order: { order_id, order_amount },
    payment: { payment_status, payment_method, payment_time },
    customer_details: { customer_id },
    payment_gateway_details: { gateway_payment_id }
  } = data;

  console.log("Payment Success Event");
  console.log("Order ID:", order_id);
  console.log("Amount Paid:", order_amount);
  console.log("Payment Method:", JSON.stringify(payment_method));

  try {
    const customer = await customerModel.findOne({ orderId: order_id });

    if (customer && customer.paymentStatus !== "success") {
      const updatedCustomer = await customerModel.findByIdAndUpdate(
        { _id: new ObjectId(customer._id) },
        { loginFees: order_amount, paymentStatus: 'success', paymentDate: payment_time, transactionId: gateway_payment_id },
        { new: true }
      );
      await processModel.findOneAndUpdate(
        { customerId: new ObjectId(customer._id) },
        { customerFormComplete: true },
        { new: true }
      );
      console.log("Customer updated successfully:", updatedCustomer);
      const salesToPdSheet = {
        customerFinIdStr: customer.customerFinId,
        PaymentGatewayStr: "cashfree",
        paymentDateStr: paymentDate,
        paymentTimeStr: paymentTime,
        paymentDetailStr: customer.orderId,
        paymentStatusStr: "success"
      }


      console.log('salesToPdSheet', salesToPdSheet)

      await salesToPdAllFilesDataGoogleSheet(salesToPdSheet)
    } else {
      console.log("Customer not found for Order ID:", order_id);
    }



  } catch (error) {
    console.error("Error updating customer for Payment Success:", error);
  }
}

// Handle Payment Pending

async function handlePaymentdropped(data) {
  const currentTime = moment().tz('Asia/Kolkata');
  const paymentDate = currentTime.format("YYYY-MM-DD");
  const paymentTime = currentTime.format("hh:mm A");

  const {
    order: { order_id, order_amount },
    payment: { payment_status, payment_message },
    customer_details: { customer_id }
  } = data;

  console.log("Payment Pending Event");
  console.log("Order ID:", order_id);
  console.log("Amount Attempted:", order_amount);
  console.log("Pending Reason:", payment_message);

  try {
    const customer = await customerModel.findOne({ orderId: order_id });
    if (customer && customer.paymentStatus !== "success") {
      const updatedCustomer = await customerModel.findByIdAndUpdate(
        { _id: new ObjectId(customer._id) },
        { loginFees: order_amount, paymentStatus: 'pending' },
        { new: true }
      );
      console.log("Customer updated for Payment Pending:", updatedCustomer);
      const salesToPdSheet = {
        customerFinIdStr: customer.customerFinId,
        PaymentGatewayStr: "cashfree",
        paymentDateStr: paymentDate,
        paymentTimeStr: paymentTime,
        paymentDetailStr: customer.orderId,
        paymentStatusStr: "Pending"
      }

      await salesToPdAllFilesDataGoogleSheet(salesToPdSheet)
    } else {
      console.log("Customer not found for Order ID:", order_id);
    }




  } catch (error) {
    console.error("Error updating customer for Payment Pending:", error);
  }
}


// Handle Payment Failure
async function handlePaymentFailure(data) {
  const currentTime = moment().tz('Asia/Kolkata');
  const paymentDate = currentTime.format("YYYY-MM-DD");
  const paymentTime = currentTime.format("hh:mm A");
  const {
    order: { order_id, order_amount },
    payment: { payment_status, payment_message },
    customer_details: { customer_id }
  } = data;

  console.log("Payment Failed Event");
  console.log("Order ID:", order_id);
  console.log("Amount Attempted:", order_amount);
  console.log("Failure Reason:", payment_message);

  try {
    const customer = await customerModel.findOne({ orderId: order_id });
    if (customer && customer.paymentStatus !== "success") {
      const updatedCustomer = await customerModel.findByIdAndUpdate(
        { _id: new ObjectId(customer._id) },
        { loginFees: order_amount, paymentStatus: 'failed' },
        { new: true }
      );
      console.log("Customer updated for Payment Failure:", updatedCustomer);
      const salesToPdSheet = {
        customerFinIdStr: customer.customerFinId,
        PaymentGatewayStr: "cashfree",
        paymentDateStr: paymentDate,
        paymentTimeStr: paymentTime,
        paymentDetailStr: customer.orderId,
        paymentStatusStr: "failed"
      }
      await salesToPdAllFilesDataGoogleSheet(salesToPdSheet)

    } else {
      console.log("Customer not found for Order ID:", order_id);
    }



  } catch (error) {
    console.error("Error updating customer for Payment Failure:", error);
  }
}


// Handle Payment Success from cashfree sdk // 


async function handleCashFreePaymentSuccess(req, res) {
  try {




    const CustomerId = req.query.customerId;
    const orderId = req.query.orderId;


    if (!CustomerId || !orderId) {
      return badRequest(res, "Missing required parameters");
    }

    if (!mongoose.Types.ObjectId.isValid(CustomerId)) {
      return badRequest(res, "Invalid Customer ID");
    }


    console.log("Customer ID:", CustomerId);
    console.log("Order ID:", orderId);



    const customer = await customerModel.findById(CustomerId);
    if (!customer) {
      return badRequest(res, "Invalid customer details");
    }

    if (customer.paymentStatus === "success") {
      return badRequest(res, "Customer has already made the payment");
    }

    const employeeDetail = await employeModel.findById(req.Id);
    if (!employeeDetail) {
      return badRequest(res, "Invalid employee details");
    }


    // const branchDetail = await newBranchModel.findById(employeeDetail.branchId).select("name");
    // if (!branchDetail) {
    //   return badRequest(res, "Branch details not found");
    // }


    const productDetail = await productModel.findById(customer.productId);
    if (!productDetail) {
      return badRequest(res, "Product not found");
    }

    if (customer) {
      customer.orderId = orderId;
      await customer.save();
    }

    return success(res, "Payment status updated successfully", customer);

  } catch (error) {
    console.error("Error in handleCashFreePaymentSuccess:", error);
    return unknownError(res, error.message);
  }
}


//---------------------Webhook Url Call on RazorPay Dashboard------------
async function paymentWebhookCall(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const orderDetailsData = req.body.payload;
    const currentTime = moment().tz('Asia/Kolkata');
    const paymentDate = currentTime.format("YYYY-MM-DD");
    const paymentTime = currentTime.format("hh:mm A");

    // console.log("orderDetailsData", orderDetailsData);
    const event = req.body.event;
    if (event === 'payment.downtime') {
      // console.log("Downtime", orderDetailsData['payment.downtime']);
      const downtimeDetails = orderDetailsData['payment.downtime'].entity;
      // console.log("Details", downtimeDetails);
      return success(res, "Downtime");
    }
    const entity = orderDetailsData.payment.entity;
    const customerData = entity.notes;
    // console.log("event", event);
    // console.log("entity", entity);
    // console.log("OrderId", entity.order_id);
    // console.log("customerData", customerData);
    // console.log("entity", customerData.customer_id);
    // console.log('event outside ---',event)
    if (customerData.customer_id && (event === "order.paid" || event === "payment.captured")) {
      // console.log('event inside--- ', event )
      const customerOrderIdExist = await customerModel.findOne({ orderId: entity.order_id, });
      if (customerOrderIdExist) {
        const loginFeesAmount = entity.amount / 100
        const newCustomer = await customerModel.findByIdAndUpdate({ _id: new ObjectId(customerData.customer_id) }, { loginFees: loginFeesAmount, paymentStatus: "success", paymentDate: paymentDate }, { new: true });
        if (newCustomer) {
          success(res, "Customer Login Fees Done Successful.");
          const customerCheck = await processModel.findOne({ customerId: newCustomer._id })
          if (customerCheck) {
            await processModel.findOneAndUpdate({ customerId: newCustomer._id },
              { customerFormStart: true, customerFormComplete: true },
              { new: true }
            );
          }
        }
        // await customerGoogleSheet(newCustomer)

        const salesToPdSheet = {
          customerFinIdStr: customerOrderIdExist.customerFinId,
          PaymentGatewayStr: "RazerPay",
          paymentDateStr: paymentDate,
          paymentTimeStr: paymentTime,
          paymentDetailStr: customerOrderIdExist.orderId,
          paymentStatusStr: "success"
        }
        const endDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");

        const parameters = {
          taskType: "login",
          customerId: customerOrderIdExist?._id || null,
          status: "completed",
          endDate
        }
        await completeAutoTask(parameters)

        await salesToPdAllFilesDataGoogleSheet(salesToPdSheet)

      } else {
        return success(res, "Invalid Details! Please try Again.");
      }
    } else {
      return success(res, "Invalid Details! Please try Again");
    }
  } catch (error) {
    console.error(error);
    return success(res, "Something Went Wrong");
  }
}

async function paymentVerify(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    if (!req.body.customerId || req.body.customerId.trim() === "") {
      return badRequest(res, "Please Select customerId");
    }
    const customerDetail = await customerModel.findById({ _id: new ObjectId(req.body.customerId) });
    if (!customerDetail) {
      return badRequest(res, "customerId Not Found");
    }
    const orderIdExist = await customerModel.findOne({ _id: req.body.customerId, orderId: req.body.orderId, paymentStatus: "success" });
    if (orderIdExist) {
      return success(res, 'Payment Done', { orderIdExist: true });
    } else {
      return success(res, 'Payment Not Received', { orderIdExist: false });
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error.message);
  }
}

// ------------------ Get Permission Form List By customerId---------------------------------------
// async function getPermissionFormByCustomerId(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }
//     const customerDetail = await customerModel.findById({ _id: new ObjectId(req.params.customerId) });
//     if (!customerDetail) {
//       return badRequest(res, "customerId Not Found");
//     }
//     console.log("Customer Detail", customerDetail.PaymentGateway);

//     const formDetail = await customerModel.aggregate([
//       { $match: { _id: new ObjectId(req.params.customerId) } },
//       {
//         $lookup: {
//           from: "products",
//           localField: "productId",
//           foreignField: "_id",
//           as: "productDetail"
//         }
//       },
//       { $unwind: "$productDetail" },

//       {
//         $lookup: {
//           from: "permissionforms",
//           localField: "productDetail.permissionFormId",
//           foreignField: "_id",
//           as: "permissionFormDetail"
//         }
//       },
//       { $unwind: "$permissionFormDetail" },
//       {
//         $project: {
//           _id: 0,
//           permissionFormDetail: 1,
//         },
//       },
//     ]);
//     success(res, "Get Permission Form Detail", formDetail[0].permissionFormDetail);
//   } catch (error) {
//     console.log(error);
//     unknownError(res, error);
//   }
// }


async function getPermissionFormByCustomerId(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const customerDetail = await customerModel.findById({ _id: new ObjectId(req.params.customerId) });
    if (!customerDetail) {
      return badRequest(res, "customerId Not Found");
    }
    console.log("Customer Detail", customerDetail.PaymentGateway);

    const formDetail = await customerModel.aggregate([
      { $match: { _id: new ObjectId(req.params.customerId) } },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productDetail"
        }
      },
      { $unwind: "$productDetail" },

      {
        $lookup: {
          from: "permissionforms",
          localField: "productDetail.permissionFormId",
          foreignField: "_id",
          as: "permissionFormDetail"
        }
      },
      { $unwind: "$permissionFormDetail" },
      {
        $project: {
          _id: 0,
          permissionFormDetail: 1,
        },
      },
    ]);
    success(res, "Get Permission Form Detail", formDetail[0].permissionFormDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

async function getPermissionFormByCustomerId(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    // Fetch the customer details
    const customerDetail = await customerModel.findById({
      _id: new ObjectId(req.params.customerId),
    });

    if (!customerDetail) {
      return badRequest(res, "customerId Not Found");
    }

    console.log("Customer Detail", customerDetail.PaymentGateway);

    // Perform the aggregation
    const formDetail = await customerModel.aggregate([
      { $match: { _id: new ObjectId(req.params.customerId) } },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productDetail",
        },
      },
      { $unwind: "$productDetail" },
      {
        $lookup: {
          from: "permissionforms",
          localField: "productDetail.permissionFormId",
          foreignField: "_id",
          as: "permissionFormDetail",
        },
      },
      { $unwind: "$permissionFormDetail" },
      {
        $addFields: {
          "permissionFormDetail.PaymentGateway": customerDetail.PaymentGateway,
        },
      },
      {
        $project: {
          _id: 0,
          permissionFormDetail: 1,
        },
      },
    ]);

    success(res, "Get Permission Form Detail", formDetail[0]?.permissionFormDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}


// ------------------ Get Get Customer Detail---------------------------------------
async function getCustomerDetail(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    let customerReports = {};
    let customerDocument = await cibilModel.findOne({ customerId: new ObjectId(req.params.customerId) })
    // if (!customerDocument) {
    //   customerReports.applicantCibilReport = ""
    //   customerReports.coApplicantCibilReport = ""
    //   customerReports.guarantorCibilReport = ""
    // } else {
    //   customerReports.applicantCibilReport = customerDocument.applicantCibilReport;
    //   customerReports.coApplicantCibilReport = customerDocument.coApplicantCibilReport;
    //   customerReports.guarantorCibilReport = customerDocument.guarantorCibilReport;

    //   if (customerReports.coApplicantCibilReport === "") {
    //     customerDocument.coApplicantData.map((coApplicant) => {
    //       console.log(coApplicant, "-----coApplicant")
    //       customerReports.coApplicantCibilReport = coApplicant.coApplicantCibilReport
    //     })
    //   }
    //   // console.log('customerReports.coApplicantCibilReport',customerReports.coApplicantCibilReport)
    // }

    if (customerDocument) {
      // Get the latest applicant report
      // customerReports.applicantCibilReport =
      //   customerDocument.applicantCibilReport.slice(-1)[0] || "";

      // // Map the latest co-applicant reports
      // if (customerDocument.coApplicantData.length > 0) {
      //   customerReports.coApplicantCibilReport = customerDocument.coApplicantData
      //     .map((coApp) => coApp.coApplicantCibilReport.slice(-1)[0])
      //     .filter(Boolean); // Ensure valid reports
      // }

      // // Get the latest guarantor report
      // customerReports.guarantorCibilReport =
      //   customerDocument.guarantorCibilReport.slice(-1)[0] || "";


      customerReports.applicantCibilReport = customerDocument.applicantFetchHistory?.slice(-1)[0]?.cibilReport || "";

      customerReports.guarantorCibilReport = customerDocument.guarantorFetchHistory?.slice(-1)[0]?.cibilReport || "";

      customerReports.coApplicantCibilReport = customerDocument.coApplicantData.map(coApplicant =>
        coApplicant?.coApplicantFetchHistory.slice(-1)[0]?.cibilReport
      );
    }

    const formDetail = await customerModel.aggregate([
      { $match: { _id: new ObjectId(req.params.customerId) } },
      {
        $lookup: {
          from: "customerdetails",
          localField: "_id",
          foreignField: "_id",
          as: "customerdetail"
        }
      },
      {
        $lookup: {
          from: "employees",
          localField: "employeId",
          foreignField: "_id",
          as: "employeeDetail"
        }
      },
      {
        $lookup: {
          from: "newbranches",
          localField: "customerdetail.branch",
          foreignField: "_id",
          as: "branchDetail"
        }
      },
      {
        $project: {
          "customerdetail.__v": 0,
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productDetail"
        }
      },
      {
        $project: {
          "productDetail.__v": 0,
        },
      },
      {
        $lookup: {
          from: "applicantdetails",
          localField: "_id",
          foreignField: "customerId",
          as: "applicantDetail"
        }
      },
      {
        $project: {
          "applicantDetail.__v": 0
        }
      },
      {
        $lookup: {
          from: "coapplicantdetails",
          localField: "applicantDetail.customerId",
          foreignField: "customerId",
          as: "co-ApplicantDetail"
        }
      },
      {
        $project: {
          "co-ApplicantDetail.__v": 0
        }
      },
      {
        $lookup: {
          from: "guarantordetails",
          localField: "applicantDetail.customerId",
          foreignField: "customerId",
          as: "guarantorDetails"
        }
      },
      {
        $project: {
          "guarantorDetails.__v": 0
        }
      },
      {
        $lookup: {
          from: "processes",
          localField: "_id",
          foreignField: "customerId",
          as: "pdfDetail"
        }
      },
      {
        $lookup: {
          from: "finalsanctiondetaails",
          let: { customerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$customerId", "$$customerId"] }
              }
            },
            {
              $lookup: {
                from: "lenders",
                localField: "partnerId",
                foreignField: "_id",
                as: "lenderInfo"
              }
            },
            { $unwind: "$lenderInfo" },
            {
              $project: {
                partnerId: 1,
                partnerName: "$lenderInfo.fullName",  // assuming name field exists in lender collection
                // add other fields you need from finalsanctiondetaails
              }
            }
          ],
          as: "finalSanctionPartnerDetails"
        }
      },
      {
        $unwind: {
          path: "$finalSanctionPartnerDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          "customerdetail": 1,
          "employeeDetail._id": 1,
          "employeeDetail.employeName": 1,
          "employeeDetail.userName": 1,
          "branchDetail._id": 1,
          "branchDetail.companyId": 1,
          "branchDetail.name": 1,
          "branchDetail.state": 1,
          "productDetail": 1,
          "applicantDetail": 1,
          "co-ApplicantDetail": 1,
          "guarantorDetails": 1,
          "pdfDetail.pdfCreateByPd": 1,
          "applicantCibilReport": customerReports.applicantCibilReport,
          "coApplicantCibilReport": customerReports.coApplicantCibilReport,
          "guarantorCibilReport": customerReports.guarantorCibilReport,
          finalSanctionPartnerDetails: {
            $ifNull: ["$finalSanctionPartnerDetails", {}]
          }
        },
      },
    ]);

    success(res, "Get Customer Detail", formDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
};

async function getLeadCustomer(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array(),
      });
    }
    const customerId = req.params.customerId;
    const customerDetails = await customerModel.findById(customerId);
    const applicantDetail = await applicantModel.findOne({ customerId })

    if (!customerDetails) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }
    const dealDetail = { customerDetails, applicantDetail }
    res.status(200).json({
      success: true,
      message: 'Customer details fetched successfully',
      dealDetail: dealDetail,
    });
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}

async function getNameAppAndCoApp(req, res) {
  try {
    const getDetail = await customerModel.aggregate([
      { $match: { _id: new ObjectId(req.params.customerId) } },
      {
        $lookup: {
          from: "applicantdetails",
          localField: "_id",
          foreignField: "customerId",
          as: "applicantDetail"
        }
      },
      {
        $lookup: {
          from: "coapplicantdetails",
          localField: "applicantDetail.customerId",
          foreignField: "customerId",
          as: "coApplicantDetail"
        }
      },
      {
        $project: {
          "applicantDetail.fullName": 1,
          "coApplicantDetail.fullName": 1,
        }
      }
    ]);

    const result = getDetail.map(detail => {
      return {
        _id: detail._id,
        data: [
          ...detail.applicantDetail.map(applicant => ({
            fullName: applicant.fullName,
          })),
          ...detail.coApplicantDetail.map(coApplicant => ({
            fullName: coApplicant.fullName,
          })),
        ]
      };
    });
    success(res, "Applicant And CoApplicant Name", result);
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}

async function customerDetail(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const customerId = req.params.customerId;
    if (!customerId) {
      return badRequest(res, "Customer Id Required")
    }
    let customerDetail = await customerModel.findById(customerId)
    if (!customerDetail) {
      return notFound(res, "customer Form Not Found");
    }
    return success(res, "customer Detail", customerDetail);
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}

async function applicantDetail(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    let { customerId } = req.params;
    if (!customerId) {
      return badRequest(res, "Customer Id Required")
    }

    if (!ObjectId.isValid(customerId)) {
      // find data by customerFinId 
      const customerData = await customerModel.findOne({ customerFinId: customerId }).lean();
      if (!customerData) {
        return notFound(res, "Applicant Form Not Found");
      }
      customerId = customerData._id; // Use the found customer's _id for further queries
    } else {
      customerId = new ObjectId(customerId); // Convert to ObjectId if it's a valid format
    }

    // const customerId = req.params.customerId;
    let applicantDetail = await applicantModel.findOne({ customerId: new ObjectId(customerId) }).lean();

    if (applicantDetail) {
      const fieldsToCapitalize = [
        'fullName', 'fatherName', 'motherName', 'middleName', 'spouseName',
        'religion', 'caste', 'education', 'gender', 'maritalStatus',
        'permanentAddress.addressLine1', 'permanentAddress.addressLine2', 'permanentAddress.city',
        'permanentAddress.state', 'permanentAddress.district', 'permanentAddress.pinCode',
        'localAddress.addressLine1', 'localAddress.addressLine2', 'localAddress.city',
        'localAddress.state', 'localAddress.district', 'localAddress.pinCode'
      ];
      const fieldsToUpperCase = ['email', 'panNo'];

      function processNestedFields(obj, fields, processFunc) {
        for (const field of fields) {
          const keys = field.split('.');
          let current = obj;
          for (let i = 0; i < keys.length - 1; i++) {
            if (current[keys[i]]) {
              current = current[keys[i]];
            } else {
              break;
            }
          }
          const lastKey = keys[keys.length - 1];
          if (current[lastKey] && typeof current[lastKey] === 'string') {
            current[lastKey] = processFunc(current[lastKey]);
          }
        }
      }
      processNestedFields(applicantDetail, fieldsToCapitalize, capitalizeWords);
      processNestedFields(applicantDetail, fieldsToUpperCase, toUpperCase);
      let applicantDocument = await cibilModel.findOne({ customerId })
      // console.log('applicantDocument', applicantDocument,)
      if (!applicantDocument) {
        applicantDetail.applicantCibilReport = ""
      } else {
        // applicantDetail.applicantCibilReport = applicantDocument.applicantCibilReport ? `${applicantDocument.applicantCibilReport.slice(-1)[0]}` : " "
        applicantDetail.applicantCibilReport = applicantDocument.applicantFetchHistory?.slice(-1)[0]?.cibilReport || "";
      }
      return success(res, "Applicant Detail", applicantDetail);
    } else {
      return notFound(res, "Applicant Form Not Found");
    }
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}

async function coApplicantDetail(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    let { customerId } = req.params;

    if (!customerId) {
      return badRequest(res, "Customer Id Required")
    }
    // console.log('api test get applicant details')
    if (!ObjectId.isValid(customerId)) {
      // find data by customerFinId 
      const customerData = await customerModel.findOne({ customerFinId: customerId }).lean();
      if (!customerData) {
        return notFound(res, "co-Applicant Form Not Found");
      }
      customerId = customerData._id; // Use the found customer's _id for further queries
    } else {
      customerId = new ObjectId(customerId); // Convert to ObjectId if it's a valid format
    }

    // const customerId = req.params.customerId
    const coApplicantDetail = await coApplicantModel.find({ customerId }).lean()
    if (coApplicantDetail) {

      const fieldsToCapitalize = ['fullName', 'fatherName', 'motherName', 'middleName', 'spouseName', 'religion', 'caste', 'education', 'gender', 'maritalStatus', 'relationWithApplicant',
        'permanentAddress.addressLine1', 'permanentAddress.addressLine2', 'permanentAddress.city', 'permanentAddress.state',
        'permanentAddress.district', 'localAddress.addressLine1', 'localAddress.addressLine2', 'localAddress.city', 'localAddress.state',
        'localAddress.district'];
      const fieldsToUpperCase = ['email', 'docNo'];

      function processNestedFields(obj, fields, processFunc) {
        for (const field of fields) {
          const keys = field.split('.');
          let current = obj;
          for (let i = 0; i < keys.length - 1; i++) {
            if (current[keys[i]]) {
              current = current[keys[i]];
            } else {
              break;
            }
          }
          const lastKey = keys[keys.length - 1];
          if (current[lastKey] && typeof current[lastKey] === 'string') {
            current[lastKey] = processFunc(current[lastKey]);
          }
        }
      }
      processNestedFields(coApplicantDetail, fieldsToCapitalize, capitalizeWords);
      processNestedFields(coApplicantDetail, fieldsToUpperCase, toUpperCase);

      const coApplicantDocument = await cibilModel.findOne({ customerId })

      if (!coApplicantDocument) {
        //   coApplicantDetail[0].coApplicantCibilReport = [];
        // } else {
        coApplicantDocument?.coApplicantData?.forEach((coApplicantReport, index) => {
          if (coApplicantDetail[index]) {
            coApplicantDetail[index].coApplicantCibilReport =
              coApplicantReport?.coApplicantFetchHistory?.slice(-1)[0]?.cibilReport || ""
          }
        });

      }

      return success(res, "coApplicant Detail", coApplicantDetail);
    } else {
      return notFound(res, "coApplicant Form Not Found");
    }
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}

async function guarantorDetail(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    let { customerId } = req.params;
    if (!customerId) {
      return badRequest(res, "Customer Id Required")
    }

    if (!ObjectId.isValid(customerId)) {
      // find data by customerFinId 
      const customerData = await customerModel.findOne({ customerFinId: customerId }).lean();
      if (!customerData) {
        return notFound(res, "co-Applicant Form Not Found");
      }
      customerId = customerData._id; // Use the found customer's _id for further queries
    } else {
      customerId = new ObjectId(customerId); // Convert to ObjectId if it's a valid format
    }
    // const customerId = req.params.customerId
    const guarantorDetail = await guarantorModel.findOne({ customerId }).lean()
    if (guarantorDetail) {

      const fieldsToCapitalize = ['fullName', 'fatherName', 'motherName', 'spouseName', 'religion', 'caste', 'education', 'gender', 'maritalStatus', 'relationWithApplicant',
        'permanentAddress.addressLine1', 'permanentAddress.addressLine2', 'permanentAddress.city', 'permanentAddress.state',
        'permanentAddress.district', 'localAddress.addressLine1', 'localAddress.addressLine2', 'localAddress.city', 'localAddress.state',
        'localAddress.district',];
      const fieldsToUpperCase = ['email', 'docNo'];
      function processNestedFields(obj, fields, processFunc) {
        for (const field of fields) {
          const keys = field.split('.');
          let current = obj;
          for (let i = 0; i < keys.length - 1; i++) {
            if (current[keys[i]]) {
              current = current[keys[i]];
            } else {
              break;
            }
          }
          const lastKey = keys[keys.length - 1];
          if (current[lastKey] && typeof current[lastKey] === 'string') {
            current[lastKey] = processFunc(current[lastKey]);
          }
        }
      }
      processNestedFields(guarantorDetail, fieldsToCapitalize, capitalizeWords);
      processNestedFields(guarantorDetail, fieldsToUpperCase, toUpperCase);

      const guarantorDocument = await cibilModel.findOne({ customerId })
      if (!guarantorDocument) {
        guarantorDetail.guarantorCibilReport = ""
      } else {
        // guarantorDetail.guarantorCibilReport = guarantorDocument.guarantorCibilReport ? `${guarantorDocument.guarantorCibilReport.slice(-1)[0]}` : " "
        guarantorDetail.guarantorCibilReport = guarantorDocument.guarantorFetchHistory?.slice(-1)[0]?.cibilReport || null;
      }
      return success(res, "guarantor Detail", guarantorDetail);
    } else {
      return notFound(res, "guarantor Form Not Found");
    }
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}

async function referenceDetail(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const customerId = req.params.customerId
    const referenceDetail = await referenceModel.findOne({ customerId })
    if (referenceDetail) {
      return success(res, "reference Detail", referenceDetail);
    } else {
      return notFound(res, "reference Form Not Found");
    }
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}
async function bankDetail(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const customerId = req.params.customerId
    const bankDetail = await bankAccountModel.findOne({ customerId })
    if (bankDetail) {
      return success(res, "Get bank Detail", bankDetail);
    } else {
      return notFound(res, "bank Form Not Found");
    }
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}
// this function used in salesCase ge detail api for capital fields value 
function capitalizeFields(obj, parentKey = '') {
  for (const key in obj) {
    const currentKey = parentKey ? `${parentKey}.${key}` : key;
    if (typeof obj[key] === 'string' && currentKey !== 'incomeSource.incomeSourceType') {
      obj[key] = capitalizeWords(obj[key]);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (currentKey === 'incomeSource') {
        // Skip capitalization for incomeSourceType field
        obj[key] = obj[key];
      } else {
        capitalizeFields(obj[key], currentKey);
      }
    }
  }
}

async function salesDetail(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        subCode: 400,
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const customerId = req.query.customerId;

        if (!customerId) {
      return badRequest(res, "customerId is required");
    }
    const customerExit = await customerModel.findById(customerId)
    if (!customerExit) {
      return notFound(res, "Customer Not Found")
    }
    
    const salesDetails = await salesCaseModel.findOne({customerId})
    if (salesDetails) {
      return success(res, "Sales Case Detail", salesDetails);
    } else {
      return badRequest(res, "Sales Case Form Not Found");
    }
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}


// async function applicantAddDetail(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return serverValidation(res, {
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }
//     const tokenId = new ObjectId(req.Id);
//     let { customerId, ...otherFields } = req.body;
//     const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");

//        const aadharExistInApp = await applicantModel.find({ aadharNo: otherFields.aadharNo });
//         const aadharExistInCoApp = await coApplicantModel.findOne({ aadharNo: otherFields.aadharNo });
//         const panExistInApp = await applicantModel.find({ panNo: otherFields.panNo });
//         const panExistInCoApp = await coApplicantModel.findOne({ docNo: otherFields.panNo });

//           if (aadharExistInCoApp) {
//             return badRequest(res, "Aadhaar is already used as Co-Applicant");
//           }
//           if (aadharExistInApp && aadharExistInApp.length > 0) {
//             return badRequest(res, "Aadhaar is already used as an Applicant");
//           }


//       if (panExistInCoApp) {
//         return badRequest(res, "PAN Number is already used as Co-Applicant");
//       }
//       if (panExistInApp && panExistInApp.length > 0) {
//         return badRequest(res, "PAN Number is already used as an Applicant");
//       }

//     const customerExit = await customerModel.findById(customerId)
//     if (!customerExit) {
//       return notFound(res, "customer Id Not Found")
//     }
//     const customerFinId = customerExit.customerFinId

//     if (otherFields.mobileNo && !isNaN(otherFields.mobileNo)) {
//       otherFields.mobileNo = parseInt(otherFields.mobileNo)
//     } else {
//       otherFields.mobileNo = undefined
//     }

//     const existingApplicant = await applicantModel.findOne({ customerId: customerId });

//     // const immutableFields = ['fullName', 'aadharNo', 'panNo', 'fatherName', 'motherName', 'gender', 'mobileNo', 'email', 'dob','drivingLicenceNo','voterIdNo',
//     //         'permanentAddress.addressLine1', 'permanentAddress.addressLine2', 'permanentAddress.city', 'permanentAddress.state',
//     //         'permanentAddress.district', 'permanentAddress.pinCode',  ];

//     const immutableFields = [];
//     let updateObject = {
//       employeId: tokenId,
//       applicantFormStart: true,
//     };

//     for (const [key, value] of Object.entries(otherFields)) {
//       if (value !== undefined && (!existingApplicant || !immutableFields.includes(key))) {
//         updateObject[key] = value;
//       }
//     }

//     const files = [
//       { field: "ocrAadharFrontImage", path: "ocrAadharFrontImage" },
//       { field: "ocrAadharBackImage", path: "ocrAadharBackImage" },
//       { field: "applicantPhoto", path: "applicantPhoto" },
//       { field: "aadharBackImage", path: "kycUpload.aadharBackImage" },
//       { field: "aadharFrontImage", path: "kycUpload.aadharFrontImage" },
//       { field: "panFrontImage", path: "kycUpload.panFrontImage" },
//       { field: "drivingLicenceImage", path: "kycUpload.drivingLicenceImage" },
//       { field: "voterIdImage", path: "kycUpload.voterIdImage" },
//     ];

//     files.forEach(({ field, path }) => {
//       if (req.files && req.files[field]) {
//         const filePath = `/uploads/${req.files[field][0].filename}`;
//         updateObject[path] = filePath;
//       }
//     });


//     // files.forEach(({ field, path }) => {
//     //   // Check if the field exists in req.files (file upload)
//     //   if (req.files && req.files[field]) {
//     //     const filePath = `/uploads/${req.files[field][0].filename}`;

//     //     // Handle nested paths (e.g., kycUpload.aadharBackImage)
//     //     if (path.includes('.')) {
//     //       const [parent, child] = path.split('.');
//     //       if (!updateObject[parent]) updateObject[parent] = {};
//     //       updateObject[parent][child] = filePath;
//     //     } else {
//     //       updateObject[path] = filePath;
//     //     }
//     //   } else if (req.body[field]) {
//     //     if (path.includes('.')) {
//     //       const [parent, child] = path.split('.');
//     //       if (!updateObject[parent]) updateObject[parent] = {};
//     //       updateObject[parent][child] = req.body[field];
//     //     } else {
//     //       updateObject[path] = req.body[field];
//     //     }
//     //   }
//     // });

//     const requiredFields = [];
//     // const requiredFields = [
//     //   'fullName', 'aadharNo', 'panNo', 'fatherName', 'motherName', 'gender', 'mobileNo', 'maritalStatus',
//     //   'email', 'dob', 'religion', 'caste', 'education', 'age', 
//     //   'localAddress.addressLine1', 'localAddress.addressLine2', 'localAddress.city', 'localAddress.state',
//     //   'localAddress.district', 'localAddress.pinCode'
//     // ];

//     let allFieldsFilled;
//     if (existingApplicant) {
//       const mergedFields = { ...existingApplicant.toObject(), ...updateObject };
//       allFieldsFilled = requiredFields.every(field => {
//         let [outsideKey, insideKey] = field.split(".")
//         const value = insideKey && existingApplicant[outsideKey][insideKey] ? mergedFields[outsideKey][insideKey] : mergedFields[field];
//         return value !== undefined && value !== null && value !== "";
//       });
//     } else {
//       allFieldsFilled = requiredFields.every(field => {
//         const value = updateObject[field];
//         return value !== undefined && value !== null && value !== "";
//       });
//     }
//     updateObject.applicantFormComplete = allFieldsFilled;
//     updateObject.formCompleteDate = todayDate
//     let updatedApplicant;
//     if (existingApplicant) {
//       updatedApplicant = await applicantModel.findOneAndUpdate(
//         { customerId: customerId },
//         { $set: updateObject },
//         { new: true, runValidators: true }
//       );
//     } else {
//       updateObject.customerId = customerId;
//       updatedApplicant = await applicantModel.create(updateObject);
//     }

//     await processModel.findOneAndUpdate(
//       { customerId },
//       { applicantFormStart: true, applicantFormComplete: allFieldsFilled, salesCompleteDate: todayDate },
//       { new: true }
//     );

//     if (updatedApplicant.aadharNo !== "") {
//       const aadharModelCheck = await aadharModel.findOne({ aadharNo: updatedApplicant.aadharNo, formName: "applicant" })
//       if (aadharModelCheck) {
//         await aadharModel.findOneAndUpdate({ aadharNo: updatedApplicant.aadharNo, formName: "applicant" }, { formId: updatedApplicant._id, customerId: updatedApplicant.customerId }, { new: true })
//         // console.log('aadhar model save applicant data')
//       }
//       const aadharOcrCheck = await aadharOcrModel.findOne({ doc_id: updatedApplicant.aadharNo, formName: "applicant" })
//       if (aadharOcrCheck) {
//         await aadharOcrModel.findOneAndUpdate({ doc_id: updatedApplicant.aadharNo, formName: "applicant" }, { formId: updatedApplicant._id, customerId: updatedApplicant.customerId }, { new: true })
//         // console.log('aadhar OCR model save applicant data')
//       }
//     }

//     if (updatedApplicant.panNo !== "") {
//       const panComprehensiveCheck = await panComprehensiveModel.findOne({ panNumber: updatedApplicant.panNo, formName: "applicant" })
//       if (panComprehensiveCheck) {
//         await panComprehensiveModel.findOneAndUpdate({ panNumber: updatedApplicant.panNo, formName: "applicant" }, { formId: updatedApplicant._id, customerId: updatedApplicant.customerId }, { new: true })
//         // console.log('pan comprehensive model save applicant data')
//       }
//       const panFatherCheck = await panFatherModel.findOne({ panNumber: updatedApplicant.panNo, formName: "applicant" })
//       if (panFatherCheck) {
//         await panFatherModel.findOneAndUpdate({ panNumber: updatedApplicant.panNo, formName: "applicant" }, { formId: updatedApplicant._id, customerId: updatedApplicant.customerId }, { new: true })
//         // console.log('pan father model save applicant data')
//       }
//     }

//     if (existingApplicant) {
//       success(res, "Applicant updated Successfully", updatedApplicant);
//       await applicantGoogleSheet(updatedApplicant, customerFinId)
//       // await applicantGoogleSheet(updatedApplicant)
//     } else {
//       success(res, "Applicant Created Successfully", updatedApplicant);
//       await applicantGoogleSheet(updatedApplicant, customerFinId)
//     }

//     const salesToPdSheet = {
//       customerFinIdStr: customerFinId,
//       customerFullNameStr: updatedApplicant?.fullName,
//       customerFatherNameStr: updatedApplicant?.fatherName
//     }

//     await salesToPdAllFilesDataGoogleSheet(salesToPdSheet)


//   } catch (error) {
//     console.log(error);
//     return unknownError(res, error);
//   }
// }

// async function coApplicantAddDetail(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return serverValidation(res, {
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }

//     const tokenId = new ObjectId(req.Id);
//     const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");
//     // console.log("e", tokenId);
//     const { customerId, _id, ...otherFields } = req.body;
//     const customerExit = await customerModel.findById(customerId)
//     if (!customerExit) {
//       return notFound(res, "customer Id Not Found")
//     }
//     const customerFinId = customerExit.customerFinId

//     if (otherFields.mobileNo && !isNaN(otherFields.mobileNo)) {
//       otherFields.mobileNo = parseInt(otherFields.mobileNo)
//     } else {
//       otherFields.mobileNo = undefined
//     }
//     // console.log("Dd", customerId, _id);
//     let existingCoApplicant;
//     if (_id && _id != "null") {
//       existingCoApplicant = await coApplicantModel.findById(_id);
//     }
//     // console.log("dsqwq*-*-*-*-0", existingCoApplicant);
//     // const immutableFields = [
//     //   'fullName', 'aadharNo', 'docNo', 'docType', 'fatherName', 'motherName', 'gender', 'mobileNo', 'email', 'dob',
//     //   'permanentAddress.addressLine1', 'permanentAddress.addressLine2', 'permanentAddress.city', 'permanentAddress.state',
//     //   'permanentAddress.district', 'permanentAddress.pinCode'
//     // ];
//     const immutableFields = [];

//     let updateObject = {
//       employeId: tokenId,
//       coApplicantFormStart: true,
//     };

//     const fieldsToCapitalize = ['fullName', 'fatherName', 'motherName', 'middleName', 'spouseName', 'religion', 'caste', 'education', 'gender', 'maritalStatus',
//       'permanentAddress.addressLine1', 'permanentAddress.addressLine2', 'permanentAddress.city', 'permanentAddress.state',
//       'permanentAddress.district', 'localAddress.addressLine1', 'localAddress.addressLine2', 'localAddress.city', 'localAddress.state',
//       'localAddress.district'];

//     const fieldsToUpperCase = ['email', 'docNo'];

//     for (const [key, value] of Object.entries(otherFields)) {
//       if (value !== undefined && (!existingCoApplicant || !immutableFields.includes(key))) {
//         updateObject[key] = value;
//       }
//     }

//     const files = [
//       { field: "ocrAadharFrontImage", path: "ocrAadharFrontImage" },
//       { field: "ocrAadharBackImage", path: "ocrAadharBackImage" },
//       { field: "coApplicantPhoto", path: "coApplicantPhoto" },
//       { field: "aadharBackImage", path: "kycUpload.aadharBackImage" },
//       { field: "aadharFrontImage", path: "kycUpload.aadharFrontImage" },
//       { field: "docImage", path: "kycUpload.docImage" },
//     ];

//     files.forEach(({ field, path }) => {
//       if (req.files && req.files[field]) {
//         const filePath = `/uploads/${req.files[field][0].filename}`;
//         updateObject[path] = filePath;
//       }
//     });


//     // files.forEach(({ field, path }) => {
//     //   // Check if the field exists in req.files (file upload)
//     //   if (req.files && req.files[field]) {
//     //     const filePath = `/uploads/${req.files[field][0].filename}`;

//     //     // Handle nested paths (e.g., kycUpload.aadharBackImage)
//     //     if (path.includes('.')) {
//     //       const [parent, child] = path.split('.');
//     //       if (!updateObject[parent]) updateObject[parent] = {};
//     //       updateObject[parent][child] = filePath;
//     //     } else {
//     //       updateObject[path] = filePath;
//     //     }
//     //   }
//     //   // Check if the field exists in req.body (direct string path)
//     //   else if (req.body[field]) {
//     //     if (path.includes('.')) {
//     //       const [parent, child] = path.split('.');
//     //       if (!updateObject[parent]) updateObject[parent] = {};
//     //       updateObject[parent][child] = req.body[field];
//     //     } else {
//     //       updateObject[path] = req.body[field];
//     //     }
//     //   }
//     // });

//     const requiredFields = [];
//     // const requiredFields = [
//     //   'docNo', 'aadharNo', 'fullName', 'fatherName', 'motherName', 'gender', 'mobileNo', 'maritalStatus',
//     //   'email', 'dob', 'religion', 'caste', 'education', 'age',
//     //   'localAddress.addressLine1', 'localAddress.addressLine2', 'localAddress.city', 'localAddress.state',
//     //   'localAddress.district', 'localAddress.pinCode'
//     // ];

//     let allFieldsFilled;
//     if (existingCoApplicant) {
//       const mergedFields = { ...existingCoApplicant.toObject(), ...updateObject };
//       allFieldsFilled = requiredFields.every(field => {
//         let [outsideKey, insideKey] = field.split(".")
//         const value = insideKey && existingCoApplicant[outsideKey][insideKey] ? mergedFields[outsideKey][insideKey] : mergedFields[field];
//         return value !== undefined && value !== null && value !== "";
//       });
//     } else {
//       allFieldsFilled = requiredFields.every(field => {
//         const value = updateObject[field];
//         return value !== undefined && value !== null && value !== "";
//       });
//     }
//     // console.log('allFieldsFilled', allFieldsFilled)
//     updateObject.coApplicantFormComplete = allFieldsFilled;
//     updateObject.formCompleteDate = todayDate
//     let updatedCoApplicant;
//     if (existingCoApplicant) {
//       updatedCoApplicant = await coApplicantModel.findByIdAndUpdate(
//         _id,
//         { $set: updateObject },
//         { new: true, runValidators: true }
//       );
//     } else {
//       updateObject.customerId = customerId;
//       updatedCoApplicant = await coApplicantModel.create(updateObject);
//     }
//     // console.log("allFieldsFilled", allFieldsFilled)
//     await processModel.findOneAndUpdate(
//       { customerId },
//       { coApplicantFormStart: true, coApplicantFormComplete: allFieldsFilled, salesCompleteDate: todayDate },
//       { new: true }
//     );

//     if (updatedCoApplicant.aadharNo !== "") {
//       const aadharModelCheck = await aadharModel.findOne({ aadharNo: updatedCoApplicant.aadharNo, formName: "coApplicant" })
//       if (aadharModelCheck) {
//         await aadharModel.findOneAndUpdate({ aadharNo: updatedCoApplicant.aadharNo, formName: "coApplicant" }, { formId: updatedCoApplicant._id, customerId: updatedCoApplicant.customerId }, { new: true })
//         console.log('aadhar model id Save coApplicant')
//       }
//       const aadharOcrCheck = await aadharOcrModel.findOne({ doc_id: updatedCoApplicant.aadharNo, formName: "coApplicant" })
//       if (aadharOcrCheck) {
//         await aadharOcrModel.findOneAndUpdate({ doc_id: updatedCoApplicant.aadharNo, formName: "coApplicant" }, { formId: updatedCoApplicant._id, customerId: updatedCoApplicant.customerId }, { new: true })
//         console.log('aadhar ocr model id Save coApplicant')
//       }
//     }

//     if (updatedCoApplicant.docType === "panCard" && updatedCoApplicant.docNo !== "") {
//       const panComprehensiveCheck = await panComprehensiveModel.findOne({ panNumber: updatedCoApplicant.docNo, formName: "coApplicant" })
//       if (panComprehensiveCheck) {
//         await panComprehensiveModel.findOneAndUpdate({ panNumber: updatedCoApplicant.docNo, formName: "coApplicant" }, { formId: updatedCoApplicant._id, customerId: updatedCoApplicant.customerId }, { new: true })
//         console.log('pan comprensi id Save coApplicant')
//       }
//       const panFatherCheck = await panFatherModel.findOne({ panNumber: updatedCoApplicant.docNo, formName: "coApplicant" })
//       if (panFatherCheck) {
//         await panFatherModel.findOneAndUpdate({ panNumber: updatedCoApplicant.docNo, formName: "coApplicant" }, { formId: updatedCoApplicant._id, customerId: updatedCoApplicant.customerId }, { new: true })
//         console.log('pan father id Save coApplicant')
//       }
//     }

//     if (existingCoApplicant) {
//       success(res, "Co-Applicant updated Successfully", updatedCoApplicant);
//       await coApplicantGoogleSheet(updatedCoApplicant, customerFinId)
//     } else {
//       success(res, "Co-Applicant registered Successfully", updatedCoApplicant);
//       await coApplicantGoogleSheet(updatedCoApplicant, customerFinId)
//     }


//   } catch (error) {
//     console.error(error);
//     unknownError(res, error);
//   }
// }

// async function guarantorAddDetail(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return serverValidation(res, {
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }

//     const tokenId = new ObjectId(req.Id);
//     const { customerId, ...otherFields } = req.body;
//     const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");
//     const customerExit = await customerModel.findById(customerId)
//     if (!customerExit) {
//       return notFound(res, "customer Id Not Found")
//     }
//     const customerFinId = customerExit.customerFinId

//     if (otherFields.mobileNo && !isNaN(otherFields.mobileNo)) {
//       otherFields.mobileNo = parseInt(otherFields.mobileNo)
//     } else {
//       otherFields.mobileNo = undefined
//     }
//     const existingGuarantor = await guarantorModel.findOne({ customerId: customerId });

//     // const immutableFields = [
//     //   'fullName', 'aadharNo', 'docNo', 'docType', 'fatherName', 'motherName', 'gender', 'mobileNo', 'email', 'dob',
//     //   'permanentAddress.addressLine1', 'permanentAddress.addressLine2', 'permanentAddress.city', 'permanentAddress.state',
//     //   'permanentAddress.district', 'permanentAddress.pinCode'
//     // ];
//     const immutableFields = [];

//     let updateObject = {
//       employeId: tokenId,
//       guarantorFormStart: true,
//     };


//     for (const [key, value] of Object.entries(otherFields)) {
//       if (value !== undefined && (!existingGuarantor || !immutableFields.includes(key))) {
//         updateObject[key] = value;
//       }
//     }

//     // const fieldsToCapitalize = ['fullName','fatherName', 'motherName','spouseName', 'religion', 'caste', 'education','gender','maritalStatus',
//     //   'permanentAddress.addressLine1', 'permanentAddress.addressLine2', 'permanentAddress.city', 'permanentAddress.state',
//     //         'permanentAddress.district','localAddress.addressLine1', 'localAddress.addressLine2', 'localAddress.city', 'localAddress.state',
//     //         'localAddress.district',];
//     // const fieldsToUpperCase = ['email', 'docNo'];

//     // for (const [key, value] of Object.entries(otherFields)) {
//     //   if (value !== undefined && (!existingGuarantor || !immutableFields.includes(key))) {
//     //     // updateObject[key] = value;
//     //     if (fieldsToCapitalize.includes(key)) {
//     //       updateObject[key] = capitalizeWords(value);
//     //     } else if (fieldsToUpperCase.includes(key)) {
//     //         updateObject[key] = toUpperCase(value);
//     //       } else{
//     //       updateObject[key] = value;
//     //     }
//     //   }
//     // }

//     const files = [
//       { field: "ocrAadharFrontImage", path: "ocrAadharFrontImage" },
//       { field: "ocrAadharBackImage", path: "ocrAadharBackImage" },
//       { field: "aadharFrontImage", path: "kycUpload.aadharFrontImage" },
//       { field: "aadharBackImage", path: "kycUpload.aadharBackImage" },
//       { field: "docImage", path: "kycUpload.docImage" },
//       { field: "guarantorPhoto", path: "guarantorPhoto" },
//     ];

//     files.forEach(({ field, path }) => {
//       if (req.files && req.files[field]) {
//         const filePath = `/uploads/${req.files[field][0].filename}`;
//         updateObject[path] = filePath;
//       }
//     });


//     // files.forEach(({ field, path }) => {
//     //   // Check if the field exists in req.files (file upload)
//     //   if (req.files && req.files[field]) {
//     //     const filePath = `/uploads/${req.files[field][0].filename}`;

//     //     // Handle nested paths (e.g., kycUpload.aadharBackImage)
//     //     if (path.includes('.')) {
//     //       const [parent, child] = path.split('.');
//     //       if (!updateObject[parent]) updateObject[parent] = {};
//     //       updateObject[parent][child] = filePath;
//     //     } else {
//     //       updateObject[path] = filePath;
//     //     }
//     //   }
//     //   // Check if the field exists in req.body (direct string path)
//     //   else if (req.body[field]) {
//     //     if (path.includes('.')) {
//     //       const [parent, child] = path.split('.');
//     //       if (!updateObject[parent]) updateObject[parent] = {};
//     //       updateObject[parent][child] = req.body[field];
//     //     } else {
//     //       updateObject[path] = req.body[field];
//     //     }
//     //   }
//     // });


//     const requiredFields = [];
//     // const requiredFields = [
//     //   'docNo', 'aadharNo', 'fullName', 'fatherName', 'motherName', 'gender', 'mobileNo', 'maritalStatus',
//     //   'email', 'dob', 'religion', 'caste', 'education', 'age',
//     //   'localAddress.addressLine1', 'localAddress.addressLine2', 'localAddress.city', 'localAddress.state',
//     //   'localAddress.district', 'localAddress.pinCode'
//     // ];

//     let allFieldsFilled;
//     if (existingGuarantor) {
//       const mergedFields = { ...existingGuarantor.toObject(), ...updateObject };
//       allFieldsFilled = requiredFields.every(field => {
//         let [outsideKey, insideKey] = field.split(".")
//         const value = insideKey && existingGuarantor[outsideKey][insideKey] ? mergedFields[outsideKey][insideKey] : mergedFields[field];
//         return value !== undefined && value !== null && value !== "";
//       });
//     } else {
//       allFieldsFilled = requiredFields.every(field => {
//         const value = updateObject[field];
//         return value !== undefined && value !== null && value !== "";
//       });
//     }

//     updateObject.guarantorFormComplete = allFieldsFilled;
//     updateObject.formCompleteDate = todayDate
//     let updatedGuarantor;
//     if (existingGuarantor) {
//       updatedGuarantor = await guarantorModel.findOneAndUpdate(
//         { customerId },
//         {
//           $set: updateObject,
//           // $setOnInsert: { createdAt: new Date() }
//         },
//         { new: true, runValidators: true }
//       );

//     } else {
//       updateObject.customerId = customerId;
//       updatedGuarantor = await guarantorModel.create(updateObject);
//     }
//     await processModel.findOneAndUpdate(
//       { customerId },
//       { guarantorFormStart: true, guarantorFormComplete: allFieldsFilled, salesCompleteDate: todayDate },
//       { new: true }
//     );

//     if (updatedGuarantor.aadharNo !== "") {
//       const aadharModelCheck = await aadharModel.findOne({ aadharNo: updatedGuarantor.aadharNo, formName: "guarantor" })
//       if (aadharModelCheck) {
//         await aadharModel.findOneAndUpdate({ aadharNo: updatedGuarantor.aadharNo, formName: "guarantor" }, { formId: updatedGuarantor._id, customerId: updatedGuarantor.customerId }, { new: true })
//         // console.log('aadhar model id Save Guarantor')
//       }
//       const aadharOcrCheck = await aadharOcrModel.findOne({ doc_id: updatedGuarantor.aadharNo, formName: "guarantor" })
//       if (aadharOcrCheck) {
//         await aadharOcrModel.findOneAndUpdate({ doc_id: updatedGuarantor.aadharNo, formName: "guarantor" }, { formId: updatedGuarantor._id, customerId: updatedGuarantor.customerId }, { new: true })
//         // console.log('aadhar ocr model id Save Guarantor')
//       }
//     }

//     if (updatedGuarantor.docType === "panCard" && updatedGuarantor.docNo !== "") {
//       const panComprehensiveCheck = await panComprehensiveModel.findOne({ panNumber: updatedGuarantor.docNo, formName: "guarantor" })
//       if (panComprehensiveCheck) {
//         await panComprehensiveModel.findOneAndUpdate({ panNumber: updatedGuarantor.docNo, formName: "guarantor" }, { formId: updatedGuarantor._id, customerId: updatedGuarantor.customerId }, { new: true })
//         // console.log('pan comprensi id Save Guarantor')
//       }
//       const panFatherCheck = await panFatherModel.findOne({ panNumber: updatedGuarantor.docNo, formName: "guarantor" })
//       if (panFatherCheck) {
//         await panFatherModel.findOneAndUpdate({ panNumber: updatedGuarantor.docNo, formName: "guarantor" }, { formId: updatedGuarantor._id, customerId: updatedGuarantor.customerId }, { new: true })
//         // console.log('pan father id Save Guarantor')
//       }
//     }

//     if (existingGuarantor) {
//       success(res, "Guarantor updated Successfully", updatedGuarantor);
//       await guarantorGoogleSheet(updatedGuarantor, customerFinId)
//     } else {
//       success(res, "Guarantor Created Successfully", updatedGuarantor);
//       await guarantorGoogleSheet(updatedGuarantor, customerFinId)
//     }
//   } catch (error) {
//     console.error(error);
//     unknownError(res, error);
//   }
// }


async function applicantAddDetailJson(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const tokenId = new ObjectId(req.Id);
    let { customerId, ...otherFields } = req.body;
    const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");

    const customerExit = await customerModel.findById(customerId)
    if (!customerExit) {
      return notFound(res, "customer Id Not Found")
    }
    const customerFinId = customerExit.customerFinId

    const aadharExistInApp = await applicantModel.find({ aadharNo: otherFields.aadharNo, customerId: { $ne: customerId }, });
    const panExistInApp = await applicantModel.find({ panNo: otherFields.panNo, customerId: { $ne: customerId }, });
    const aadharExistInCoApp = await coApplicantModel.findOne({ aadharNo: otherFields.aadharNo });
    const panExistInCoApp = await coApplicantModel.findOne({ docNo: otherFields.panNo });

    if (aadharExistInCoApp) {
      return badRequest(res, "Aadhaar is already used as Co-Applicant");
    }
    if (aadharExistInApp && aadharExistInApp.length > 0) {
      return badRequest(res, "Aadhaar is already used as an Applicant");
    }

    if (panExistInCoApp) {
      return badRequest(res, "PAN Number is already used as Co-Applicant");
    }
    if (panExistInApp && panExistInApp.length > 0) {
      return badRequest(res, "PAN Number is already used as an Applicant");
    }

    if (otherFields.mobileNo && !isNaN(otherFields.mobileNo)) {
      otherFields.mobileNo = parseInt(otherFields.mobileNo)
    } else {
      otherFields.mobileNo = undefined
    }

    const existingApplicant = await applicantModel.findOne({ customerId: customerId });

    // const immutableFields = ['fullName', 'aadharNo', 'panNo', 'fatherName', 'motherName', 'gender', 'mobileNo', 'email', 'dob','drivingLicenceNo','voterIdNo',
    //         'permanentAddress.addressLine1', 'permanentAddress.addressLine2', 'permanentAddress.city', 'permanentAddress.state',
    //         'permanentAddress.district', 'permanentAddress.pinCode',  ];

    const immutableFields = [];
    let updateObject = {
      employeId: tokenId,
      applicantFormStart: true,
    };

    for (const [key, value] of Object.entries(otherFields)) {
      if (value !== undefined && (!existingApplicant || !immutableFields.includes(key))) {
        updateObject[key] = value;
      }
    }


    const requiredFields = [];
    // const requiredFields = [
    //   'fullName', 'aadharNo', 'panNo', 'fatherName', 'motherName', 'gender', 'mobileNo', 'maritalStatus',
    //   'email', 'dob', 'religion', 'caste', 'education', 'age', 
    //   'localAddress.addressLine1', 'localAddress.addressLine2', 'localAddress.city', 'localAddress.state',
    //   'localAddress.district', 'localAddress.pinCode'
    // ];

    let allFieldsFilled;
    if (existingApplicant) {
      const mergedFields = { ...existingApplicant.toObject(), ...updateObject };
      allFieldsFilled = requiredFields.every(field => {
        let [outsideKey, insideKey] = field.split(".")
        const value = insideKey && existingApplicant[outsideKey][insideKey] ? mergedFields[outsideKey][insideKey] : mergedFields[field];
        return value !== undefined && value !== null && value !== "";
      });
    } else {
      allFieldsFilled = requiredFields.every(field => {
        const value = updateObject[field];
        return value !== undefined && value !== null && value !== "";
      });
    }
    updateObject.applicantFormComplete = allFieldsFilled;
    updateObject.formCompleteDate = todayDate
    // updateObject.fullName = `${req.body.applicantPrefix} ${req.body.firstName} ${req.body.middleName} ${req.body.lastName}`
    // updateObject.fatherName = `${req.body.fatherPrefix} ${req.body.fatherFirstName} ${req.body.fatherMiddleName} ${req.body.fatherlastName} `
    let updatedApplicant;
    if (existingApplicant) {
      updatedApplicant = await applicantModel.findOneAndUpdate(
        { customerId: customerId },
        { $set: updateObject },
        { new: true, runValidators: true }
      );
    } else {
      updateObject.customerId = customerId;
      updatedApplicant = await applicantModel.create(updateObject);
    }

    await processModel.findOneAndUpdate(
      { customerId },
      { applicantFormStart: true, applicantFormComplete: allFieldsFilled, salesCompleteDate: todayDate },
      { new: true }
    );

    if (updatedApplicant.aadharNo !== "") {
      const aadharModelCheck = await aadharModel.findOne({ aadharNo: updatedApplicant.aadharNo, formName: "applicant" })
      if (aadharModelCheck) {
        await aadharModel.findOneAndUpdate({ aadharNo: updatedApplicant.aadharNo, formName: "applicant" }, { formId: updatedApplicant._id, customerId: updatedApplicant.customerId }, { new: true })
        // console.log('aadhar model save applicant data')
      }
      const aadharOcrCheck = await aadharOcrModel.findOne({ doc_id: updatedApplicant.aadharNo, formName: "applicant" })
      if (aadharOcrCheck) {
        await aadharOcrModel.findOneAndUpdate({ doc_id: updatedApplicant.aadharNo, formName: "applicant" }, { formId: updatedApplicant._id, customerId: updatedApplicant.customerId }, { new: true })
        // console.log('aadhar OCR model save applicant data')
      }
    }

    if (updatedApplicant.panNo !== "") {
      const panComprehensiveCheck = await panComprehensiveModel.findOne({ panNumber: updatedApplicant.panNo, formName: "applicant" })
      if (panComprehensiveCheck) {
        await panComprehensiveModel.findOneAndUpdate({ panNumber: updatedApplicant.panNo, formName: "applicant" }, { formId: updatedApplicant._id, customerId: updatedApplicant.customerId }, { new: true })
        // console.log('pan comprehensive model save applicant data')
      }
      const panFatherCheck = await panFatherModel.findOne({ panNumber: updatedApplicant.panNo, formName: "applicant" })
      if (panFatherCheck) {
        await panFatherModel.findOneAndUpdate({ panNumber: updatedApplicant.panNo, formName: "applicant" }, { formId: updatedApplicant._id, customerId: updatedApplicant.customerId }, { new: true })
        // console.log('pan father model save applicant data')
      }
    }

    if (existingApplicant) {
      success(res, "Applicant updated Successfully", updatedApplicant);
      await applicantGoogleSheet(updatedApplicant, customerFinId)
      // await applicantGoogleSheet(updatedApplicant)
    } else {
      success(res, "Applicant Created Successfully", updatedApplicant);
      await applicantGoogleSheet(updatedApplicant, customerFinId)
    }

    const salesToPdSheet = {
      customerFinIdStr: customerFinId,
      customerFullNameStr: updatedApplicant?.fullName,
      customerFatherNameStr: updatedApplicant?.fatherName
    }

    await salesToPdAllFilesDataGoogleSheet(salesToPdSheet)


  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}


async function addApplicant(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const tokenId = new ObjectId(req.Id);
    let { customerId, ...otherFields } = req.body;
    const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");

    const customerExit = await customerModel.findById(customerId)
    if (!customerExit) {
      return notFound(res, "customer Id Not Found")
    }
    const customerFinId = customerExit.customerFinId

    const aadharExistInApp = await applicantModel.find({ aadharNo: otherFields.aadharNo, customerId: { $ne: customerId }, });
    const panExistInApp = await applicantModel.find({ panNo: otherFields.panNo, customerId: { $ne: customerId }, });
    const aadharExistInCoApp = await coApplicantModel.findOne({ aadharNo: otherFields.aadharNo });
    const panExistInCoApp = await coApplicantModel.findOne({ docNo: otherFields.panNo });

    if (aadharExistInCoApp) {
      return badRequest(res, "Aadhaar is already used as Co-Applicant");
    }
    if (aadharExistInApp && aadharExistInApp.length > 0) {
      return badRequest(res, "Aadhaar is already used as an Applicant");
    }

    if (panExistInCoApp) {
      return badRequest(res, "PAN Number is already used as Co-Applicant");
    }
    if (panExistInApp && panExistInApp.length > 0) {
      return badRequest(res, "PAN Number is already used as an Applicant");
    }

    if (otherFields.mobileNo && !isNaN(otherFields.mobileNo)) {
      otherFields.mobileNo = parseInt(otherFields.mobileNo)
    } else {
      otherFields.mobileNo = undefined
    }

    const existingApplicant = await applicantModel.findOne({ customerId: customerId });

    // const immutableFields = ['fullName', 'aadharNo', 'panNo', 'fatherName', 'motherName', 'gender', 'mobileNo', 'email', 'dob','drivingLicenceNo','voterIdNo',
    //         'permanentAddress.addressLine1', 'permanentAddress.addressLine2', 'permanentAddress.city', 'permanentAddress.state',
    //         'permanentAddress.district', 'permanentAddress.pinCode',  ];

    const immutableFields = [];
    let updateObject = {
      employeId: tokenId,
      applicantFormStart: true,
    };

    for (const [key, value] of Object.entries(otherFields)) {
      if (value !== undefined && (!existingApplicant || !immutableFields.includes(key))) {
        updateObject[key] = value;
      }
    }


    const requiredFields = [];
    // const requiredFields = [
    //   'fullName', 'aadharNo', 'panNo', 'fatherName', 'motherName', 'gender', 'mobileNo', 'maritalStatus',
    //   'email', 'dob', 'religion', 'caste', 'education', 'age', 
    //   'localAddress.addressLine1', 'localAddress.addressLine2', 'localAddress.city', 'localAddress.state',
    //   'localAddress.district', 'localAddress.pinCode'
    // ];

    let allFieldsFilled;
    if (existingApplicant) {
      const mergedFields = { ...existingApplicant.toObject(), ...updateObject };
      allFieldsFilled = requiredFields.every(field => {
        let [outsideKey, insideKey] = field.split(".")
        const value = insideKey && existingApplicant[outsideKey][insideKey] ? mergedFields[outsideKey][insideKey] : mergedFields[field];
        return value !== undefined && value !== null && value !== "";
      });
    } else {
      allFieldsFilled = requiredFields.every(field => {
        const value = updateObject[field];
        return value !== undefined && value !== null && value !== "";
      });
    }
    updateObject.applicantFormComplete = allFieldsFilled;
    updateObject.formCompleteDate = todayDate
    updateObject.fullName = `${req.body.applicantPrefix} ${req.body.firstName} ${req.body.middleName} ${req.body.lastName}`
    updateObject.fatherName = `${req.body.fatherPrefix} ${req.body.fatherFirstName} ${req.body.fatherMiddleName} ${req.body.fatherlastName} `
    let updatedApplicant;
    if (existingApplicant) {
      updatedApplicant = await applicantModel.findOneAndUpdate(
        { customerId: customerId },
        { $set: updateObject },
        { new: true, runValidators: true }
      );
    } else {
      updateObject.customerId = customerId;
      updatedApplicant = await applicantModel.create(updateObject);
    }

    await processModel.findOneAndUpdate(
      { customerId },
      { applicantFormStart: true, applicantFormComplete: allFieldsFilled, salesCompleteDate: todayDate },
      { new: true }
    );

    if (updatedApplicant.aadharNo !== "") {
      const aadharModelCheck = await aadharModel.findOne({ aadharNo: updatedApplicant.aadharNo, formName: "applicant" })
      if (aadharModelCheck) {
        await aadharModel.findOneAndUpdate({ aadharNo: updatedApplicant.aadharNo, formName: "applicant" }, { formId: updatedApplicant._id, customerId: updatedApplicant.customerId }, { new: true })
        // console.log('aadhar model save applicant data')
      }
      const aadharOcrCheck = await aadharOcrModel.findOne({ doc_id: updatedApplicant.aadharNo, formName: "applicant" })
      if (aadharOcrCheck) {
        await aadharOcrModel.findOneAndUpdate({ doc_id: updatedApplicant.aadharNo, formName: "applicant" }, { formId: updatedApplicant._id, customerId: updatedApplicant.customerId }, { new: true })
        // console.log('aadhar OCR model save applicant data')
      }
    }

    if (updatedApplicant.panNo !== "") {
      const panComprehensiveCheck = await panComprehensiveModel.findOne({ panNumber: updatedApplicant.panNo, formName: "applicant" })
      if (panComprehensiveCheck) {
        await panComprehensiveModel.findOneAndUpdate({ panNumber: updatedApplicant.panNo, formName: "applicant" }, { formId: updatedApplicant._id, customerId: updatedApplicant.customerId }, { new: true })
        // console.log('pan comprehensive model save applicant data')
      }
      const panFatherCheck = await panFatherModel.findOne({ panNumber: updatedApplicant.panNo, formName: "applicant" })
      if (panFatherCheck) {
        await panFatherModel.findOneAndUpdate({ panNumber: updatedApplicant.panNo, formName: "applicant" }, { formId: updatedApplicant._id, customerId: updatedApplicant.customerId }, { new: true })
        // console.log('pan father model save applicant data')
      }
    }

    if (existingApplicant) {
      success(res, "Applicant updated Successfully", updatedApplicant);
      await applicantGoogleSheet(updatedApplicant, customerFinId)
      // await applicantGoogleSheet(updatedApplicant)
    } else {
      success(res, "Applicant Created Successfully", updatedApplicant);
      await applicantGoogleSheet(updatedApplicant, customerFinId)
    }

    const salesToPdSheet = {
      customerFinIdStr: customerFinId,
      customerFullNameStr: updatedApplicant?.fullName,
      customerFatherNameStr: updatedApplicant?.fatherName
    }

    await salesToPdAllFilesDataGoogleSheet(salesToPdSheet)


  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}

async function coApplicantAddDetailJson(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const tokenId = new ObjectId(req.Id);
    const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");
    // console.log("e", tokenId);
    const { customerId, _id, ...otherFields } = req.body;
    const customerExit = await customerModel.findById(customerId)
    if (!customerExit) {
      return notFound(res, "customer Id Not Found")
    }
    const customerFinId = customerExit.customerFinId

    const aadharExistInApp = await applicantModel.find({ aadharNo: otherFields.aadharNo });
    const aadharExistInCoApp = await coApplicantModel.findOne({ aadharNo: otherFields.aadharNo, customerId: { $ne: customerId }, });
    const panExistInApp = await applicantModel.find({ panNo: otherFields.docNo });
    const panExistInCoApp = await coApplicantModel.findOne({ docNo: otherFields.docNo, customerId: { $ne: customerId }, });

    if (aadharExistInCoApp) {
      return badRequest(res, "Aadhaar is already used as Co-Applicant");
    }
    if (aadharExistInApp && aadharExistInApp.length > 0) {
      return badRequest(res, "Aadhaar is already used as an Applicant");
    }


    if (panExistInCoApp) {
      return badRequest(res, "PAN Number is already used as Co-Applicant");
    }

    if (panExistInApp && panExistInApp.length > 0) {
      return badRequest(res, "PAN Number is already used as an Applicant");
    }

    if (otherFields.mobileNo && !isNaN(otherFields.mobileNo)) {
      otherFields.mobileNo = parseInt(otherFields.mobileNo)
    } else {
      otherFields.mobileNo = undefined
    }
    // console.log("Dd", customerId, _id);
    let existingCoApplicant;
    if (_id && _id != "null") {
      existingCoApplicant = await coApplicantModel.findById(_id);
    }
    // console.log("dsqwq*-*-*-*-0", existingCoApplicant);
    // const immutableFields = [
    //   'fullName', 'aadharNo', 'docNo', 'docType', 'fatherName', 'motherName', 'gender', 'mobileNo', 'email', 'dob',
    //   'permanentAddress.addressLine1', 'permanentAddress.addressLine2', 'permanentAddress.city', 'permanentAddress.state',
    //   'permanentAddress.district', 'permanentAddress.pinCode'
    // ];
    const immutableFields = [];

    let updateObject = {
      employeId: tokenId,
      coApplicantFormStart: true,
    };

    const fieldsToCapitalize = ['fullName', 'fatherName', 'motherName', 'middleName', 'spouseName', 'religion', 'caste', 'education', 'gender', 'maritalStatus',
      'permanentAddress.addressLine1', 'permanentAddress.addressLine2', 'permanentAddress.city', 'permanentAddress.state',
      'permanentAddress.district', 'localAddress.addressLine1', 'localAddress.addressLine2', 'localAddress.city', 'localAddress.state',
      'localAddress.district'];

    const fieldsToUpperCase = ['email', 'docNo'];

    for (const [key, value] of Object.entries(otherFields)) {
      if (value !== undefined && (!existingCoApplicant || !immutableFields.includes(key))) {
        updateObject[key] = value;
      }
    }

    const requiredFields = [];
    // const requiredFields = [
    //   'docNo', 'aadharNo', 'fullName', 'fatherName', 'motherName', 'gender', 'mobileNo', 'maritalStatus',
    //   'email', 'dob', 'religion', 'caste', 'education', 'age',
    //   'localAddress.addressLine1', 'localAddress.addressLine2', 'localAddress.city', 'localAddress.state',
    //   'localAddress.district', 'localAddress.pinCode'
    // ];

    let allFieldsFilled;
    if (existingCoApplicant) {
      const mergedFields = { ...existingCoApplicant.toObject(), ...updateObject };
      allFieldsFilled = requiredFields.every(field => {
        let [outsideKey, insideKey] = field.split(".")
        const value = insideKey && existingCoApplicant[outsideKey][insideKey] ? mergedFields[outsideKey][insideKey] : mergedFields[field];
        return value !== undefined && value !== null && value !== "";
      });
    } else {
      allFieldsFilled = requiredFields.every(field => {
        const value = updateObject[field];
        return value !== undefined && value !== null && value !== "";
      });
    }
    // console.log('allFieldsFilled', allFieldsFilled)
    updateObject.coApplicantFormComplete = allFieldsFilled;
    updateObject.formCompleteDate = todayDate
    // updateObject.fullName = `${req.body.coApplicantPrefix} ${req.body.firstName} ${req.body.middleName} ${req.body.lastName}`
    // updateObject.fatherName = `${req.body.fatherPrefix} ${req.body.fatherFirstName} ${req.body.fatherMiddleName} ${req.body.fatherlastName}`
    let updatedCoApplicant;
    if (existingCoApplicant) {
      updatedCoApplicant = await coApplicantModel.findByIdAndUpdate(
        _id,
        { $set: updateObject },
        { new: true, runValidators: true }
      );
    } else {
      updateObject.customerId = customerId;
      updatedCoApplicant = await coApplicantModel.create(updateObject);
    }
    // console.log("allFieldsFilled", allFieldsFilled)
    await processModel.findOneAndUpdate(
      { customerId },
      { coApplicantFormStart: true, coApplicantFormComplete: allFieldsFilled, salesCompleteDate: todayDate },
      { new: true }
    );

    if (updatedCoApplicant.aadharNo !== "") {
      const aadharModelCheck = await aadharModel.findOne({ aadharNo: updatedCoApplicant.aadharNo, formName: "coApplicant" })
      if (aadharModelCheck) {
        await aadharModel.findOneAndUpdate({ aadharNo: updatedCoApplicant.aadharNo, formName: "coApplicant" }, { formId: updatedCoApplicant._id, customerId: updatedCoApplicant.customerId }, { new: true })
        console.log('aadhar model id Save coApplicant')
      }
      const aadharOcrCheck = await aadharOcrModel.findOne({ doc_id: updatedCoApplicant.aadharNo, formName: "coApplicant" })
      if (aadharOcrCheck) {
        await aadharOcrModel.findOneAndUpdate({ doc_id: updatedCoApplicant.aadharNo, formName: "coApplicant" }, { formId: updatedCoApplicant._id, customerId: updatedCoApplicant.customerId }, { new: true })
        console.log('aadhar ocr model id Save coApplicant')
      }
    }

    if (updatedCoApplicant.docType === "panCard" && updatedCoApplicant.docNo !== "") {
      const panComprehensiveCheck = await panComprehensiveModel.findOne({ panNumber: updatedCoApplicant.docNo, formName: "coApplicant" })
      if (panComprehensiveCheck) {
        await panComprehensiveModel.findOneAndUpdate({ panNumber: updatedCoApplicant.docNo, formName: "coApplicant" }, { formId: updatedCoApplicant._id, customerId: updatedCoApplicant.customerId }, { new: true })
        console.log('pan comprensi id Save coApplicant')
      }
      const panFatherCheck = await panFatherModel.findOne({ panNumber: updatedCoApplicant.docNo, formName: "coApplicant" })
      if (panFatherCheck) {
        await panFatherModel.findOneAndUpdate({ panNumber: updatedCoApplicant.docNo, formName: "coApplicant" }, { formId: updatedCoApplicant._id, customerId: updatedCoApplicant.customerId }, { new: true })
        console.log('pan father id Save coApplicant')
      }
    }

    if (existingCoApplicant) {
      success(res, "Co-Applicant updated Successfully", updatedCoApplicant);
      await coApplicantGoogleSheet(updatedCoApplicant, customerFinId)
    } else {
      success(res, "Co-Applicant registered Successfully", updatedCoApplicant);
      await coApplicantGoogleSheet(updatedCoApplicant, customerFinId)
    }


  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
}

//addCoApplicant

async function addCoApplicant(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const tokenId = new ObjectId(req.Id);
    const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");
    // console.log("e", tokenId);
    const { customerId, _id, ...otherFields } = req.body;
    const customerExit = await customerModel.findById(customerId)
    if (!customerExit) {
      return notFound(res, "customer Id Not Found")
    }
    const customerFinId = customerExit.customerFinId

    const aadharExistInApp = await applicantModel.find({ aadharNo: otherFields.aadharNo });
    const aadharExistInCoApp = await coApplicantModel.findOne({ aadharNo: otherFields.aadharNo, customerId: { $ne: customerId }, });
    const panExistInApp = await applicantModel.find({ panNo: otherFields.docNo });
    const panExistInCoApp = await coApplicantModel.findOne({ docNo: otherFields.docNo, customerId: { $ne: customerId }, });

    if (aadharExistInCoApp) {
      return badRequest(res, "Aadhaar is already used as Co-Applicant");
    }
    if (aadharExistInApp && aadharExistInApp.length > 0) {
      return badRequest(res, "Aadhaar is already used as an Applicant");
    }


    if (panExistInCoApp) {
      return badRequest(res, "PAN Number is already used as Co-Applicant");
    }

    if (panExistInApp && panExistInApp.length > 0) {
      return badRequest(res, "PAN Number is already used as an Applicant");
    }

    if (otherFields.mobileNo && !isNaN(otherFields.mobileNo)) {
      otherFields.mobileNo = parseInt(otherFields.mobileNo)
    } else {
      otherFields.mobileNo = undefined
    }
    // console.log("Dd", customerId, _id);
    let existingCoApplicant;
    if (_id && _id != "null") {
      existingCoApplicant = await coApplicantModel.findById(_id);
    }
    // console.log("dsqwq*-*-*-*-0", existingCoApplicant);
    // const immutableFields = [
    //   'fullName', 'aadharNo', 'docNo', 'docType', 'fatherName', 'motherName', 'gender', 'mobileNo', 'email', 'dob',
    //   'permanentAddress.addressLine1', 'permanentAddress.addressLine2', 'permanentAddress.city', 'permanentAddress.state',
    //   'permanentAddress.district', 'permanentAddress.pinCode'
    // ];
    const immutableFields = [];

    let updateObject = {
      employeId: tokenId,
      coApplicantFormStart: true,
    };

    const fieldsToCapitalize = ['fullName', 'fatherName', 'motherName', 'middleName', 'spouseName', 'religion', 'caste', 'education', 'gender', 'maritalStatus',
      'permanentAddress.addressLine1', 'permanentAddress.addressLine2', 'permanentAddress.city', 'permanentAddress.state',
      'permanentAddress.district', 'localAddress.addressLine1', 'localAddress.addressLine2', 'localAddress.city', 'localAddress.state',
      'localAddress.district'];

    const fieldsToUpperCase = ['email', 'docNo'];

    for (const [key, value] of Object.entries(otherFields)) {
      if (value !== undefined && (!existingCoApplicant || !immutableFields.includes(key))) {
        updateObject[key] = value;
      }
    }

    const requiredFields = [];
    // const requiredFields = [
    //   'docNo', 'aadharNo', 'fullName', 'fatherName', 'motherName', 'gender', 'mobileNo', 'maritalStatus',
    //   'email', 'dob', 'religion', 'caste', 'education', 'age',
    //   'localAddress.addressLine1', 'localAddress.addressLine2', 'localAddress.city', 'localAddress.state',
    //   'localAddress.district', 'localAddress.pinCode'
    // ];

    let allFieldsFilled;
    if (existingCoApplicant) {
      const mergedFields = { ...existingCoApplicant.toObject(), ...updateObject };
      allFieldsFilled = requiredFields.every(field => {
        let [outsideKey, insideKey] = field.split(".")
        const value = insideKey && existingCoApplicant[outsideKey][insideKey] ? mergedFields[outsideKey][insideKey] : mergedFields[field];
        return value !== undefined && value !== null && value !== "";
      });
    } else {
      allFieldsFilled = requiredFields.every(field => {
        const value = updateObject[field];
        return value !== undefined && value !== null && value !== "";
      });
    }
    // console.log('allFieldsFilled', allFieldsFilled)
    updateObject.coApplicantFormComplete = allFieldsFilled;
    updateObject.formCompleteDate = todayDate
    updateObject.fullName = `${req.body.coApplicantPrefix} ${req.body.firstName} ${req.body.middleName} ${req.body.lastName}`
    updateObject.fatherName = `${req.body.fatherPrefix} ${req.body.fatherFirstName} ${req.body.fatherMiddleName} ${req.body.fatherlastName}`
    let updatedCoApplicant;
    if (existingCoApplicant) {
      updatedCoApplicant = await coApplicantModel.findByIdAndUpdate(
        _id,
        { $set: updateObject },
        { new: true, runValidators: true }
      );
    } else {
      updateObject.customerId = customerId;
      updatedCoApplicant = await coApplicantModel.create(updateObject);
    }
    // console.log("allFieldsFilled", allFieldsFilled)
    await processModel.findOneAndUpdate(
      { customerId },
      { coApplicantFormStart: true, coApplicantFormComplete: allFieldsFilled, salesCompleteDate: todayDate },
      { new: true }
    );

    if (updatedCoApplicant.aadharNo !== "") {
      const aadharModelCheck = await aadharModel.findOne({ aadharNo: updatedCoApplicant.aadharNo, formName: "coApplicant" })
      if (aadharModelCheck) {
        await aadharModel.findOneAndUpdate({ aadharNo: updatedCoApplicant.aadharNo, formName: "coApplicant" }, { formId: updatedCoApplicant._id, customerId: updatedCoApplicant.customerId }, { new: true })
        console.log('aadhar model id Save coApplicant')
      }
      const aadharOcrCheck = await aadharOcrModel.findOne({ doc_id: updatedCoApplicant.aadharNo, formName: "coApplicant" })
      if (aadharOcrCheck) {
        await aadharOcrModel.findOneAndUpdate({ doc_id: updatedCoApplicant.aadharNo, formName: "coApplicant" }, { formId: updatedCoApplicant._id, customerId: updatedCoApplicant.customerId }, { new: true })
        console.log('aadhar ocr model id Save coApplicant')
      }
    }

    if (updatedCoApplicant.docType === "panCard" && updatedCoApplicant.docNo !== "") {
      const panComprehensiveCheck = await panComprehensiveModel.findOne({ panNumber: updatedCoApplicant.docNo, formName: "coApplicant" })
      if (panComprehensiveCheck) {
        await panComprehensiveModel.findOneAndUpdate({ panNumber: updatedCoApplicant.docNo, formName: "coApplicant" }, { formId: updatedCoApplicant._id, customerId: updatedCoApplicant.customerId }, { new: true })
        console.log('pan comprensi id Save coApplicant')
      }
      const panFatherCheck = await panFatherModel.findOne({ panNumber: updatedCoApplicant.docNo, formName: "coApplicant" })
      if (panFatherCheck) {
        await panFatherModel.findOneAndUpdate({ panNumber: updatedCoApplicant.docNo, formName: "coApplicant" }, { formId: updatedCoApplicant._id, customerId: updatedCoApplicant.customerId }, { new: true })
        console.log('pan father id Save coApplicant')
      }
    }

    if (existingCoApplicant) {
      success(res, "Co-Applicant updated Successfully", updatedCoApplicant);
      await coApplicantGoogleSheet(updatedCoApplicant, customerFinId)
    } else {
      success(res, "Co-Applicant registered Successfully", updatedCoApplicant);
      await coApplicantGoogleSheet(updatedCoApplicant, customerFinId)
    }


  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
}


async function guarantorAddDetailJson(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const tokenId = new ObjectId(req.Id);
    const { customerId, ...otherFields } = req.body;
    const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");
    const customerExit = await customerModel.findById(customerId)
    if (!customerExit) {
      return notFound(res, "customer Id Not Found")
    }
    const customerFinId = customerExit.customerFinId

    const aadharExistInGuarantor = await guarantorModel.find({ aadharNo: otherFields.aadharNo, customerId: { $ne: customerId }, });
    const panExistInGuarantor = await guarantorModel.find({ docNo: otherFields.docNo, customerId: { $ne: customerId }, });

    const aadharExistInCoApp = await coApplicantModel.findOne({ aadharNo: otherFields.aadharNo });
    const panExistInCoApp = await coApplicantModel.findOne({ docNo: otherFields.docNo });
    if (aadharExistInCoApp) {
      return badRequest(res, "Aadhaar used in Co-Applicant ");
    }
    if (aadharExistInGuarantor && aadharExistInGuarantor.length > 0) {
      return badRequest(res, "Aadhaar is already in Guarantor");
    }

    if (panExistInCoApp) {
      return badRequest(res, "PAN Number used in Co-Applicant ");
    }
    if (panExistInGuarantor && panExistInGuarantor.length > 0) {
      return badRequest(res, "PAN Number is already in Guarantor");
    }


    // const currentFileApplicant = await applicantModel.findOne({ customerId: customerId });

    // const existAadharApplicant = await applicantModel
    //   .findOne({ aadharNo: otherFields.aadharNo })
    //   .populate('customerId');

    // const existPanApplicant = await applicantModel
    //   .findOne({ panNo: otherFields.docNo })
    //   .populate('customerId');

    // if (existAadharApplicant || existPanApplicant) {
    //   const oldPanGurantoCheck = existPanApplicant
    //   ? await guarantorModel.findOne({ customerId: existPanApplicant.customerId })
    //   : null;

    //   const oldAadharGuarantorCheck = existAadharApplicant
    //   ? await guarantorModel.findOne({ customerId: existAadharApplicant.customerId })
    //   : null;

    //   if (
    //     (oldPanGurantoCheck && oldPanGurantoCheck.aadharNo === currentFileApplicant.aadharNo) ||
    //     (oldAadharGuarantorCheck && oldAadharGuarantorCheck.docNo === currentFileApplicant.panNo)
    //   ) {
    //     return badRequest(res, "Applicant and Guarantor switch not allowed with same PAN or Aadhaar.");
    //   }
    // }



    if (otherFields.mobileNo && !isNaN(otherFields.mobileNo)) {
      otherFields.mobileNo = parseInt(otherFields.mobileNo)
    } else {
      otherFields.mobileNo = undefined
    }
    const existingGuarantor = await guarantorModel.findOne({ customerId: customerId });

    // const immutableFields = [
    //   'fullName', 'aadharNo', 'docNo', 'docType', 'fatherName', 'motherName', 'gender', 'mobileNo', 'email', 'dob',
    //   'permanentAddress.addressLine1', 'permanentAddress.addressLine2', 'permanentAddress.city', 'permanentAddress.state',
    //   'permanentAddress.district', 'permanentAddress.pinCode'
    // ];
    const immutableFields = [];

    let updateObject = {
      employeId: tokenId,
      guarantorFormStart: true,
    };


    for (const [key, value] of Object.entries(otherFields)) {
      if (value !== undefined && (!existingGuarantor || !immutableFields.includes(key))) {
        updateObject[key] = value;
      }
    }

    // const fieldsToCapitalize = ['fullName','fatherName', 'motherName','spouseName', 'religion', 'caste', 'education','gender','maritalStatus',
    //   'permanentAddress.addressLine1', 'permanentAddress.addressLine2', 'permanentAddress.city', 'permanentAddress.state',
    //         'permanentAddress.district','localAddress.addressLine1', 'localAddress.addressLine2', 'localAddress.city', 'localAddress.state',
    //         'localAddress.district',];
    // const fieldsToUpperCase = ['email', 'docNo'];

    // for (const [key, value] of Object.entries(otherFields)) {
    //   if (value !== undefined && (!existingGuarantor || !immutableFields.includes(key))) {
    //     // updateObject[key] = value;
    //     if (fieldsToCapitalize.includes(key)) {
    //       updateObject[key] = capitalizeWords(value);
    //     } else if (fieldsToUpperCase.includes(key)) {
    //         updateObject[key] = toUpperCase(value);
    //       } else{
    //       updateObject[key] = value;
    //     }
    //   }
    // }

    const requiredFields = [];
    // const requiredFields = [
    //   'docNo', 'aadharNo', 'fullName', 'fatherName', 'motherName', 'gender', 'mobileNo', 'maritalStatus',
    //   'email', 'dob', 'religion', 'caste', 'education', 'age',
    //   'localAddress.addressLine1', 'localAddress.addressLine2', 'localAddress.city', 'localAddress.state',
    //   'localAddress.district', 'localAddress.pinCode'
    // ];

    let allFieldsFilled;
    if (existingGuarantor) {
      const mergedFields = { ...existingGuarantor.toObject(), ...updateObject };
      allFieldsFilled = requiredFields.every(field => {
        let [outsideKey, insideKey] = field.split(".")
        const value = insideKey && existingGuarantor[outsideKey][insideKey] ? mergedFields[outsideKey][insideKey] : mergedFields[field];
        return value !== undefined && value !== null && value !== "";
      });
    } else {
      allFieldsFilled = requiredFields.every(field => {
        const value = updateObject[field];
        return value !== undefined && value !== null && value !== "";
      });
    }

    updateObject.guarantorFormComplete = allFieldsFilled;
    updateObject.formCompleteDate = todayDate;
    // updateObject.fullName = `${req.body.guarantorPrefix} ${req.body.firstName} ${req.body.middleName} ${req.body.lastName}`
    // updateObject.fatherName = `${req.body.fatherPrefix} ${req.body.fatherFirstName} ${req.body.fatherMiddleName} ${req.body.fatherlastName}`
    // console.log(' updateObject.formCompleteDate = todayDate;', updateObject.formCompleteDate)
    let updatedGuarantor;
    if (existingGuarantor) {
      updatedGuarantor = await guarantorModel.findOneAndUpdate(
        { customerId },
        {
          $set: updateObject,
          // $setOnInsert: { createdAt: new Date() }
        },
        { new: true, runValidators: true }
      );

    } else {
      updateObject.customerId = customerId;
      updateObject.formCompleteDate = todayDate;
      updatedGuarantor = await guarantorModel.create(updateObject);
    }
    await processModel.findOneAndUpdate(
      { customerId },
      { guarantorFormStart: true, guarantorFormComplete: allFieldsFilled, salesCompleteDate: todayDate },
      { new: true }
    );

    if (updatedGuarantor.aadharNo !== "") {
      const aadharModelCheck = await aadharModel.findOne({ aadharNo: updatedGuarantor.aadharNo, formName: "guarantor" })
      if (aadharModelCheck) {
        await aadharModel.findOneAndUpdate({ aadharNo: updatedGuarantor.aadharNo, formName: "guarantor" }, { formId: updatedGuarantor._id, customerId: updatedGuarantor.customerId }, { new: true })
        // console.log('aadhar model id Save Guarantor')
      }
      const aadharOcrCheck = await aadharOcrModel.findOne({ doc_id: updatedGuarantor.aadharNo, formName: "guarantor" })
      if (aadharOcrCheck) {
        await aadharOcrModel.findOneAndUpdate({ doc_id: updatedGuarantor.aadharNo, formName: "guarantor" }, { formId: updatedGuarantor._id, customerId: updatedGuarantor.customerId }, { new: true })
        // console.log('aadhar ocr model id Save Guarantor')
      }
    }

    if (updatedGuarantor.docType === "panCard" && updatedGuarantor.docNo !== "") {
      const panComprehensiveCheck = await panComprehensiveModel.findOne({ panNumber: updatedGuarantor.docNo, formName: "guarantor" })
      if (panComprehensiveCheck) {
        await panComprehensiveModel.findOneAndUpdate({ panNumber: updatedGuarantor.docNo, formName: "guarantor" }, { formId: updatedGuarantor._id, customerId: updatedGuarantor.customerId }, { new: true })
        // console.log('pan comprensi id Save Guarantor')
      }
      const panFatherCheck = await panFatherModel.findOne({ panNumber: updatedGuarantor.docNo, formName: "guarantor" })
      if (panFatherCheck) {
        await panFatherModel.findOneAndUpdate({ panNumber: updatedGuarantor.docNo, formName: "guarantor" }, { formId: updatedGuarantor._id, customerId: updatedGuarantor.customerId }, { new: true })
        // console.log('pan father id Save Guarantor')
      }
    }

    if (existingGuarantor) {
      success(res, "Guarantor updated Successfully", updatedGuarantor);
      await guarantorGoogleSheet(updatedGuarantor, customerFinId)
    } else {
      success(res, "Guarantor Created Successfully", updatedGuarantor);
      await guarantorGoogleSheet(updatedGuarantor, customerFinId)
    }
  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
}

async function addGuarantor(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const tokenId = new ObjectId(req.Id);
    const { customerId, ...otherFields } = req.body;
    const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");
    const customerExit = await customerModel.findById(customerId)
    if (!customerExit) {
      return notFound(res, "customer Id Not Found")
    }
    const customerFinId = customerExit.customerFinId

    const aadharExistInGuarantor = await guarantorModel.find({ aadharNo: otherFields.aadharNo, customerId: { $ne: customerId }, });
    const panExistInGuarantor = await guarantorModel.find({ docNo: otherFields.docNo, customerId: { $ne: customerId }, });

    const aadharExistInCoApp = await coApplicantModel.findOne({ aadharNo: otherFields.aadharNo });
    const panExistInCoApp = await coApplicantModel.findOne({ docNo: otherFields.docNo });
    if (aadharExistInCoApp) {
      return badRequest(res, "Aadhaar used in Co-Applicant ");
    }
    if (aadharExistInGuarantor && aadharExistInGuarantor.length > 0) {
      return badRequest(res, "Aadhaar is already in Guarantor");
    }

    if (panExistInCoApp) {
      return badRequest(res, "PAN Number used in Co-Applicant ");
    }
    if (panExistInGuarantor && panExistInGuarantor.length > 0) {
      return badRequest(res, "PAN Number is already in Guarantor");
    }


    const currentFileApplicant = await applicantModel.findOne({ customerId: customerId });

    const existAadharApplicant = await applicantModel
      .findOne({ aadharNo: otherFields.aadharNo })
      .populate('customerId');

    const existPanApplicant = await applicantModel
      .findOne({ panNo: otherFields.docNo })
      .populate('customerId');

    if (existAadharApplicant || existPanApplicant) {
      const oldPanGurantoCheck = existPanApplicant
        ? await guarantorModel.findOne({ customerId: existPanApplicant.customerId })
        : null;

      const oldAadharGuarantorCheck = existAadharApplicant
        ? await guarantorModel.findOne({ customerId: existAadharApplicant.customerId })
        : null;

      if (
        (oldPanGurantoCheck && oldPanGurantoCheck.aadharNo === currentFileApplicant.aadharNo) ||
        (oldAadharGuarantorCheck && oldAadharGuarantorCheck.docNo === currentFileApplicant.panNo)
      ) {
        return badRequest(res, "Applicant and Guarantor switch not allowed with same PAN or Aadhaar.");
      }
    }

    if (otherFields.mobileNo && !isNaN(otherFields.mobileNo)) {
      otherFields.mobileNo = parseInt(otherFields.mobileNo)
    } else {
      otherFields.mobileNo = undefined
    }
    const existingGuarantor = await guarantorModel.findOne({ customerId: customerId });

    // const immutableFields = [
    //   'fullName', 'aadharNo', 'docNo', 'docType', 'fatherName', 'motherName', 'gender', 'mobileNo', 'email', 'dob',
    //   'permanentAddress.addressLine1', 'permanentAddress.addressLine2', 'permanentAddress.city', 'permanentAddress.state',
    //   'permanentAddress.district', 'permanentAddress.pinCode'
    // ];
    const immutableFields = [];

    let updateObject = {
      employeId: tokenId,
      guarantorFormStart: true,
    };


    for (const [key, value] of Object.entries(otherFields)) {
      if (value !== undefined && (!existingGuarantor || !immutableFields.includes(key))) {
        updateObject[key] = value;
      }
    }

    // const fieldsToCapitalize = ['fullName','fatherName', 'motherName','spouseName', 'religion', 'caste', 'education','gender','maritalStatus',
    //   'permanentAddress.addressLine1', 'permanentAddress.addressLine2', 'permanentAddress.city', 'permanentAddress.state',
    //         'permanentAddress.district','localAddress.addressLine1', 'localAddress.addressLine2', 'localAddress.city', 'localAddress.state',
    //         'localAddress.district',];
    // const fieldsToUpperCase = ['email', 'docNo'];

    // for (const [key, value] of Object.entries(otherFields)) {
    //   if (value !== undefined && (!existingGuarantor || !immutableFields.includes(key))) {
    //     // updateObject[key] = value;
    //     if (fieldsToCapitalize.includes(key)) {
    //       updateObject[key] = capitalizeWords(value);
    //     } else if (fieldsToUpperCase.includes(key)) {
    //         updateObject[key] = toUpperCase(value);
    //       } else{
    //       updateObject[key] = value;
    //     }
    //   }
    // }

    const requiredFields = [];
    // const requiredFields = [
    //   'docNo', 'aadharNo', 'fullName', 'fatherName', 'motherName', 'gender', 'mobileNo', 'maritalStatus',
    //   'email', 'dob', 'religion', 'caste', 'education', 'age',
    //   'localAddress.addressLine1', 'localAddress.addressLine2', 'localAddress.city', 'localAddress.state',
    //   'localAddress.district', 'localAddress.pinCode'
    // ];

    let allFieldsFilled;
    if (existingGuarantor) {
      const mergedFields = { ...existingGuarantor.toObject(), ...updateObject };
      allFieldsFilled = requiredFields.every(field => {
        let [outsideKey, insideKey] = field.split(".")
        const value = insideKey && existingGuarantor[outsideKey][insideKey] ? mergedFields[outsideKey][insideKey] : mergedFields[field];
        return value !== undefined && value !== null && value !== "";
      });
    } else {
      allFieldsFilled = requiredFields.every(field => {
        const value = updateObject[field];
        return value !== undefined && value !== null && value !== "";
      });
    }

    updateObject.guarantorFormComplete = allFieldsFilled;
    updateObject.formCompleteDate = todayDate;
    updateObject.fullName = `${req.body.guarantorPrefix} ${req.body.firstName} ${req.body.middleName} ${req.body.lastName}`
    updateObject.fatherName = `${req.body.fatherPrefix} ${req.body.fatherFirstName} ${req.body.fatherMiddleName} ${req.body.fatherlastName}`
    // console.log(' updateObject.formCompleteDate = todayDate;', updateObject.formCompleteDate)
    let updatedGuarantor;
    if (existingGuarantor) {
      updatedGuarantor = await guarantorModel.findOneAndUpdate(
        { customerId },
        {
          $set: updateObject,
          // $setOnInsert: { createdAt: new Date() }
        },
        { new: true, runValidators: true }
      );

    } else {
      updateObject.customerId = customerId;
      updateObject.formCompleteDate = todayDate;
      updatedGuarantor = await guarantorModel.create(updateObject);
    }
    await processModel.findOneAndUpdate(
      { customerId },
      { guarantorFormStart: true, guarantorFormComplete: allFieldsFilled, salesCompleteDate: todayDate },
      { new: true }
    );

    if (updatedGuarantor.aadharNo !== "") {
      const aadharModelCheck = await aadharModel.findOne({ aadharNo: updatedGuarantor.aadharNo, formName: "guarantor" })
      if (aadharModelCheck) {
        await aadharModel.findOneAndUpdate({ aadharNo: updatedGuarantor.aadharNo, formName: "guarantor" }, { formId: updatedGuarantor._id, customerId: updatedGuarantor.customerId }, { new: true })
        // console.log('aadhar model id Save Guarantor')
      }
      const aadharOcrCheck = await aadharOcrModel.findOne({ doc_id: updatedGuarantor.aadharNo, formName: "guarantor" })
      if (aadharOcrCheck) {
        await aadharOcrModel.findOneAndUpdate({ doc_id: updatedGuarantor.aadharNo, formName: "guarantor" }, { formId: updatedGuarantor._id, customerId: updatedGuarantor.customerId }, { new: true })
        // console.log('aadhar ocr model id Save Guarantor')
      }
    }

    if (updatedGuarantor.docType === "panCard" && updatedGuarantor.docNo !== "") {
      const panComprehensiveCheck = await panComprehensiveModel.findOne({ panNumber: updatedGuarantor.docNo, formName: "guarantor" })
      if (panComprehensiveCheck) {
        await panComprehensiveModel.findOneAndUpdate({ panNumber: updatedGuarantor.docNo, formName: "guarantor" }, { formId: updatedGuarantor._id, customerId: updatedGuarantor.customerId }, { new: true })
        // console.log('pan comprensi id Save Guarantor')
      }
      const panFatherCheck = await panFatherModel.findOne({ panNumber: updatedGuarantor.docNo, formName: "guarantor" })
      if (panFatherCheck) {
        await panFatherModel.findOneAndUpdate({ panNumber: updatedGuarantor.docNo, formName: "guarantor" }, { formId: updatedGuarantor._id, customerId: updatedGuarantor.customerId }, { new: true })
        // console.log('pan father id Save Guarantor')
      }
    }

    if (existingGuarantor) {
      success(res, "Guarantor updated Successfully", updatedGuarantor);
      await guarantorGoogleSheet(updatedGuarantor, customerFinId)
    } else {
      success(res, "Guarantor Created Successfully", updatedGuarantor);
      await guarantorGoogleSheet(updatedGuarantor, customerFinId)
    }
  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
}


async function addReferenceDetail(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const tokenId = new ObjectId(req.Id);
    const { customerId, ...otherFields } = req.body;

    const customerExit = await customerModel.findById(customerId)
    if (!customerExit) {
      return notFound(res, "customer Id Not Found")
    }
    const customerFinId = customerExit.customerFinId

    const customerIdExist = await customerModel.findOne({ _id: new ObjectId(customerId) });
    if (!customerIdExist) {
      return notFound(res, "Customer Not Found");
    }
    const existingReference = await referenceModel.findOne({ customerId });
    const immutableFields = []
    const fieldsToCapitalize = [
      'reference1.referenceName', 'reference1.relationWithApplicant', 'reference1.address',
      'reference2.referenceName', 'reference2.relationWithApplicant', 'reference2.address',
    ];
    let updateObject = {
      employeId: tokenId,
      referenceFormStart: true,
    };
    for (const [refKey, refValue] of Object.entries(otherFields)) {
      if (typeof refValue === 'object' && refValue !== null) {
        for (const [subKey, value] of Object.entries(refValue)) {
          const fullKey = `${refKey}.${subKey}`;
          if (value !== undefined && (!existingReference || !immutableFields.includes(subKey))) {
            if (fieldsToCapitalize.includes(fullKey)) {
              if (!updateObject[refKey]) updateObject[refKey] = {};
              updateObject[refKey][subKey] = capitalizeWords(value);
            } else {
              if (!updateObject[refKey]) updateObject[refKey] = {};
              updateObject[refKey][subKey] = value;
            }
          }
        }
      }
    }

    const requiredFields = [
      'reference1.referenceName', 'reference1.relationWithApplicant', 'reference1.address', 'reference1.mobileNo',
      'reference2.referenceName', 'reference2.relationWithApplicant', 'reference2.address', 'reference2.mobileNo'
    ];

    let allFieldsFilled;
    if (existingReference) {
      const mergedFields = { ...existingReference.toObject(), ...updateObject };
      allFieldsFilled = requiredFields.every(field => {
        const value = field.split('.').reduce((obj, key) => obj && obj[key], mergedFields);
        return value !== undefined && value !== null && value !== "";
      });
    } else {
      allFieldsFilled = requiredFields.every(field => {
        const value = field.split('.').reduce((obj, key) => obj && obj[key], updateObject);
        return value !== undefined && value !== null && value !== "";
      });
    }

    updateObject.referenceFormComplete = allFieldsFilled;

    const updatedReference = await referenceModel.findOneAndUpdate(
      { customerId },
      {
        $set: updateObject,
        $setOnInsert: { createdAt: new Date() }
      },
      { new: true, upsert: true, runValidators: true }
    );

    await processModel.findOneAndUpdate(
      { customerId },
      { referenceFormStart: true, referenceFormComplete: allFieldsFilled },
      { new: true }
    );

    if (existingReference) {
      success(res, "Reference updated Successfully", updatedReference);
      // console.log('updatedReference', updatedReference)
      await referenceGoogleSheet(updatedReference, customerFinId);
    } else {
      success(res, "Reference added Successfully", updatedReference);
      await referenceGoogleSheet(updatedReference, customerFinId);
    }

  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
}

async function bankAddDetail(req, res) {
  try {
    const tokenId = new ObjectId(req.Id);
    const { customerId } = req.body;

    const customerExit = await customerModel.findById(customerId)
    if (!customerExit) {
      return notFound(res, "customer Id Not Found")
    }
    const customerFinId = customerExit.customerFinId

    let bankDetails = typeof req.body.bankDetails === "string" ? JSON.parse(req.body.bankDetails) : req.body.bankDetails;
    let existingBankAccount = await bankAccountModel.findOne({ customerId });

    const fieldsToCapitalize = ['branchAddress', 'branchName', 'accountHolderName'];
    const fieldsToUpperCase = ['bankIFSCNumber'];
    bankDetails = bankDetails.map(account => {
      const modifiedAccount = { ...account };
      fieldsToCapitalize.forEach(field => {
        if (modifiedAccount[field]) {
          modifiedAccount[field] = capitalizeWords(modifiedAccount[field]);
        }
      });
      fieldsToUpperCase.forEach(field => {
        if (modifiedAccount[field]) {
          modifiedAccount[field] = modifiedAccount[field].toUpperCase();
        }
      });
      return modifiedAccount;
    });

    const hasEmptyField = (obj) => {
      return Object.values(obj).some(value => value === "");
    };

    const noneEmptyFields = (arr) => {
      return arr.every(obj => !hasEmptyField(obj));
    };

    const bankDetailsFieldsFilled = noneEmptyFields(bankDetails);

    const files = req.files;
    for (let i = 0; i < bankDetails.length; i++) {
      const fileKey = `bankDetails[${i}][bankStatement]`;
      if (files[fileKey]) {
        const filePaths = files[fileKey].map((file) => `/uploads/${file.filename}`);
        bankDetails[i].bankStatement = filePaths;
      }
    }


    let data;
    if (existingBankAccount) {
      // Update existing bank account
      existingBankAccount.bankDetails = bankDetails;
      existingBankAccount.employeId = tokenId;
      data = await existingBankAccount.save();
    } else {
      // Create new bank account
      const bankDetailsToSave = new bankAccountModel({ customerId, bankDetails, employeId: tokenId });
      data = await bankDetailsToSave.save();
    }

    if (bankDetailsFieldsFilled) {
      await processModel.findOneAndUpdate(
        { customerId },
        { bankDetailFormStart: true, bankDetailFormComplete: bankDetailsFieldsFilled },
        { new: true }
      );
    } else {
      await processModel.findOneAndUpdate(
        { customerId },
        { bankDetailFormStart: true, bankDetailFormComplete: bankDetailsFieldsFilled },
        { new: true }
      );
    }
    data.bankDetails.map(async (bankData) => {
      const accountNumberCheck = await bankModel.findOne({ accountNumber: bankData.bankACNumber })
      if (accountNumberCheck) {
        await bankModel.findOneAndUpdate({ accountNumber: bankData.bankACNumber }, { customerId: customerId, formId: data._id }, { new: true })
      }
    }
    )

    success(res, "Bank Details Submited", data);
    await bankDetailGoogleSheet(data, customerFinId);
  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
}


function isObjectFieldsFilled(obj) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        // Recursively check nested objects
        if (!isObjectFieldsFilled(obj[key])) {
          return false;
        }
      } else {
        // Check if the field is empty or null
        if (obj[key] === null || obj[key] === '' || obj[key] === undefined) {
          return false;
        }
      }
    }
  }
  return true;
}


async function addSalesCaseDetail(req, res) {
  try {
    const { customerId, workPhoto, propertyPhoto, dronePatta , samagraIdCard , udyam , bankStatement , incomeDocument , electricityBill } = req.body;
    if (!customerId) {
      return badRequest(res, "customerId is required");
    }
    const customerExit = await customerModel.findById(customerId)
    if (!customerExit) {
      return notFound(res, "Customer Not Found")
    }
    const updateData = {};
    updateData.employeId = req.Id;
    if (dronePatta) {
      updateData.dronePatta = dronePatta;
    }
 if (samagraIdCard) {
      updateData.samagraIdCard = samagraIdCard;
    }
     if (udyam) {
      updateData.udyam = udyam;
    }
     if (bankStatement) {
      updateData.bankStatement = bankStatement;
    }
     if (incomeDocument) {
      updateData.incomeDocument = incomeDocument;
    }
    if (propertyPhoto) {
      updateData.propertyPhoto = propertyPhoto;
    }
    if (workPhoto) {
      updateData.workPhoto = workPhoto;
    }
  if (electricityBill) {
      updateData.electricityBill = electricityBill;
    }
    const salesDetail = await salesCaseModel.findOneAndUpdate(
      { customerId },
      { $set: updateData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return success(res, "Sales Form Complete", salesDetail)
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
};



// async function addSalesCaseDetail(req, res) {
//   try {
//     const {
//       milkPhotos,
//       incomePhotos,
//       animalPhotos,
//       last3MonthSalarySlipPhotos,
//       bankStatementPhoto,
//       salaryPhotos,
//       propertyOtherPhotos,
//       agriculturePhotos,
//       propetyDocuments,
//       incomeDocuments,
//       incomeOtherImages
//     } = req.files;
//     const tokenId = new ObjectId(req.Id);
//     const { customerId } = req.body;
//     const customerIdExist = await customerModel.findOne({ _id: customerId });

//     if (!customerIdExist) {
//       return notFound(res, "Customer Not Found");
//     }

//     // const incomeSource = typeof req.body.incomeSource == "string" ? JSON.parse(req.body.incomeSource) : req.body.incomeSource;
//     const property = typeof req.body.property == "string" ? JSON.parse(req.body.property) : req.body.property;

//     function checkAllFields(obj) {
//       for (let key in obj) {
//         if (obj[key] === '' || obj[key] === null || obj[key] === undefined) {
//           return false;
//         }
//         if (typeof obj[key] === 'object') {
//           if (!checkAllFields(obj[key])) {
//             return false;
//           }
//         }
//       }
//       return true;
//     }

//     // let allFieldsFilledOverall = true;
//     // for (let i = 0; i < incomeSource.length; i++) {
//     //   const findValue = incomeSource[i].incomeSourceType;
//     //   let incomeData = incomeSource[i].data
//     //   incomeSource[i][findValue] = incomeData
//     //   const allObj = incomeSource[i][findValue];
//     //   let allFieldsFilled = checkAllFields(allObj);

//     //   console.log(allFieldsFilled ? `${findValue}: All fields are filled` : `${findValue}: Some fields are empty`);

//     //   if (!allFieldsFilled) {
//     //     allFieldsFilledOverall = false;
//     //   }
//     // }

//     let propertyDocumentrequire;
//     let isPropertyValid;

//     // Fetch the customer and populate the related fields
//     const checkFiledsAllowed = await customerModel.findById(customerId)
//       .populate({
//         path: 'productId',
//         populate: {
//           path: 'permissionFormId',
//           model: 'permissionForm'
//         }
//       });
//     propertyDocumentrequire = checkFiledsAllowed?.productId?.permissionFormId?.salescaseProperty;
//     if (propertyDocumentrequire == "true") {
//       isPropertyValid = isObjectFieldsFilled(property);
//     } else {
//       isPropertyValid = true;
//     }

//     // console.log('isPropertyValid',isPropertyValid)


//     let processdetail;
//     // if (allFieldsFilledOverall) {
//     processdetail = await processModel.findOneAndUpdate(
//       { customerId },
//       { salesCaseDetailFormStart: true, salesCaseDetailFormComplete: isPropertyValid },
//       { new: true }
//     );
//     // } else if (allFieldsFilledOverall) {
//     //   processdetail = await processModel.findOneAndUpdate(
//     //     { customerId },
//     //     { salesCaseDetailFormStart: true, salesCaseDetailFormComplete: isPropertyValid },
//     //     { new: true }
//     //   );
//     // }


//     //  return  success(res, "Process model", processdetail);
//     // Check if a sales case already exists for the customer
//     let salesCaseData = await salesCaseModel.findOne({ customerId });

//     if (!salesCaseData) {
//       // If no existing sales case, create a new one
//       salesCaseData = new salesCaseModel({ property });
//       // salesCaseData = new salesCaseModel({ incomeSource , property });
//     } else {
//       // If sales case exists, update its fields
//       // salesCaseData.incomeSource = incomeSource; 
//       salesCaseData.property = property;
//     }

//     salesCaseData.agriculturePhotos = updateFileFields(
//       salesCaseData.agriculturePhotos, // existing agriculture photos in the salesCaseData
//       agriculturePhotos,               // new files (if uploaded)
//       req.body.agriculturePhotos       // incoming data from the body, if available
//     );
//     salesCaseData.incomeOtherImages = updateFileFields(
//       incomeOtherImages,
//       incomeOtherImages,
//       req.body.incomeOtherImages
//     );
//     salesCaseData.incomePhotos = updateFileFields(
//       incomePhotos,
//       incomePhotos,
//       req.body.incomePhotos
//     );
//     salesCaseData.milkPhotos = updateFileFields(
//       milkPhotos,
//       milkPhotos,
//       req.body.milkPhotos
//     );
//     salesCaseData.animalPhotos = updateFileFields(
//       animalPhotos,
//       animalPhotos,
//       req.body.animalPhotos
//     );
//     salesCaseData.salaryPhotos = updateFileFields(
//       salaryPhotos,
//       salaryPhotos,
//       req.body.salaryPhotos
//     );

//     salesCaseData.last3MonthSalarySlipPhotos = updateFileFields(
//       last3MonthSalarySlipPhotos,
//       last3MonthSalarySlipPhotos,
//       req.body.last3MonthSalarySlipPhotos
//     );

//     salesCaseData.last3MonthSalarySlipPhotos = updateFileFields(
//       last3MonthSalarySlipPhotos,
//       last3MonthSalarySlipPhotos,
//       req.body.last3MonthSalarySlipPhotos
//     );

//     if (bankStatementPhoto) {
//       const filePath = `/uploads/${bankStatementPhoto[0].filename}`;
//       salesCaseData.bankStatementPhoto = filePath;
//     }

//     salesCaseData.propetyDocuments = updateFileFields(
//       salesCaseData.propetyDocuments,
//       propetyDocuments,
//       req.body.propetyDocuments
//     );

//     salesCaseData.propertyOtherPhotos = updateFileFields(
//       salesCaseData.propertyOtherPhotos,
//       propertyOtherPhotos,
//       req.body.propertyOtherPhotos
//     );

//     const propertyPhotos = [
//       'selfiWithCustomer',
//       'photoWithLatLong',
//       'front',
//       'leftSide',
//       'rightSide',
//       'approachRoad',
//       'mainRoad',
//       'interiorRoad'
//     ];

//     propertyPhotos.forEach(photo => {
//       if (req.files && req.files[photo]) {
//         salesCaseData[photo] = `/uploads/${req.files[photo][0].filename}`;
//       } else if (req.body[photo] === null || req.body[photo] === 'null') {
//         salesCaseData[photo] = null;
//       }
//     });


//     salesCaseData.incomeDocuments = updateFileFields(
//       salesCaseData.incomeDocuments,
//       incomeDocuments,
//       req.body.incomeDocuments
//     );

//     salesCaseData.customerId = customerId;
//     salesCaseData.employeId = tokenId;
//     const result = await salesCaseData.save();
//     success(res, "Sales Case Successfully", result);
//     // await salesCaseDetailGoogleSheet(result);
//   } catch (error) {
//     console.error(error);
//     unknownError(res, error);
//   }
// }



// Utility function to safely parse JSON strings


async function deleteApplicantForm(req, res) {
  try {
    const { _id } = req.body;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return badRequest(res, "Invalid ID format");
    }
    const applicantDelete = await applicantModel.findByIdAndDelete(_id);
    if (!applicantDelete) {
      return badRequest(res, "Applicant Form not found");
    }
    return success(res, "Applicant deleted successfully");
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
async function deleteCoApplicantForm(req, res) {
  try {
    const { _id } = req.body;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return badRequest(res, "Invalid ID format");
    }
    const coApplicantDelete = await coApplicantModel.findByIdAndDelete(_id);
    if (!coApplicantDelete) {
      return badRequest(res, "CoApplicant Form not found");
    }
    return success(res, "CoApplicant deleted successfully");
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
async function deleteguarantorForm(req, res) {
  try {
    const { _id } = req.body;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return badRequest(res, "Invalid ID format");
    }
    const guarantorDelete = await guarantorModel.findByIdAndDelete(_id);
    if (!guarantorDelete) {
      return badRequest(res, "guarantor Form not found");
    }
    return success(res, "guarantor deleted successfully");
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
async function deletereferenceForm(req, res) {
  try {
    const { _id } = req.body;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return badRequest(res, "Invalid ID format");
    }
    const referencetDelete = await referenceModel.findByIdAndDelete(_id);
    if (!referencetDelete) {
      return badRequest(res, "reference Form not found");
    }
    return success(res, "reference deleted successfully");
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
async function deletebankForm(req, res) {
  try {
    const { _id } = req.body;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return badRequest(res, "Invalid ID format");
    }
    const bankDelete = await bankAccountModel.findByIdAndDelete(_id);
    if (!bankDelete) {
      return badRequest(res, "Bank Form not found");
    }
    return success(res, "Bank deleted successfully");
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
async function deleteSalesCaseForm(req, res) {
  try {
    const { _id } = req.body;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return badRequest(res, "Invalid ID format");
    }
    const salesCaseDelete = await salesCaseModel.findByIdAndDelete(_id);
    if (!salesCaseDelete) {
      return badRequest(res, "SalesCase Form not found");
    }
    return success(res, "salesCase deleted successfully");
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

async function allCustomers(req, res) {
  try {
    const costumersData = await customerModel.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productDetail"
        }
      },
      {
        $project: {
          "applicantDetail.__v": 0
        }
      },
      {
        $lookup: {
          from: "applicantdetails",
          localField: "_id",
          foreignField: "customerId",
          as: "applicantDetails"
        }
      },
      {
        $project: {
          "applicantDetails.__v": 0
        }
      },
    ])
    success(res, "get all customer", costumersData)
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

async function allFormsCount(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const [applicantCount, coApplicantCount, guarantorCount, referenceCount, bankAccountCount, salesCaseCount] = await Promise.all([
      applicantModel.countDocuments(),
      coApplicantModel.countDocuments(),
      guarantorModel.countDocuments(),
      referenceModel.countDocuments(),
      bankAccountModel.countDocuments(),
      salesCaseModel.countDocuments()
    ]);

    const statusCounts = await processModel.aggregate([
      {
        $facet: {
          statusByPd: [
            {
              $match: {
                statusByPd: { $in: ["pending", "approved", "rejected"] }
              }
            },
            {
              $group: {
                _id: "$statusByPd",
                count: { $sum: 1 }
              }
            }
          ],
          statusByCibil: [
            {
              $match: {
                statusByCibil: { $in: ["pending", "approved", "rejected"] }
              }
            },
            {
              $group: {
                _id: "$statusByCibil",
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    // console.log('statusCounts', JSON.stringify(statusCounts, null, 2)); // Debugging log

    const statusByPdCounts = statusCounts[0].statusByPd.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, { pending: 0, approved: 0, rejected: 0 });

    const statusByCibilCounts = statusCounts[0].statusByCibil.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, { pending: 0, approved: 0, rejected: 0 });

    const allFormsCount = applicantCount + coApplicantCount + guarantorCount + referenceCount + bankAccountCount + salesCaseCount;

    const count = {
      AllFormCount: allFormsCount,
      applicantCount: applicantCount,
      coApplicantCount: coApplicantCount,
      guarantorCount: guarantorCount,
      referenceCount: referenceCount,
      bankAccountCount: bankAccountCount,
      salesCaseCount: salesCaseCount,
      statusByPd: statusByPdCounts,
      statusByCibil: statusByCibilCounts
    };

    success(res, "All Forms Count", count);
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}

async function multipleDataDeleteById(req, res) {
  try {
    const { customerId } = req.body;
    if (!customerId) {
      return badRequest(res, "Customer ID is required");
    }
    // Delete all bank records associated with the customerId
    const deleteResult = await applicantModel.deleteMany({ customerId });

    return success(res, `Deleted ${deleteResult.deletedCount} records associated with ID ${customerId}`);
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}

async function allKYCDataGet(req, res) {
  try {
    const { customerId } = req.query;
    const kycData = await customerModel.aggregate([
      {
        $match: { _id: new ObjectId(customerId) }
      },
      {
        $lookup: {
          from: "aadharocrs",
          let: { customerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$customerId", "$$customerId"] },
                formName: "applicant"
              }
            }
          ],
          as: "applicant.aadharocr"
        },
      },
      {
        $lookup: {
          from: "aadhaardetails",
          let: { customerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$customerId", "$$customerId"] },
                formName: "applicant"
              }
            }
          ],
          as: "applicant.aadhaarDetail"
        }
      },
      {
        $lookup: {
          from: "pancomprehensivedetails",
          let: { customerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$customerId", "$$customerId"] },
                formName: "applicant"
              }
            }
          ],
          as: "applicant.panComprehensiveDetail"
        }
      },
      {
        $lookup: {
          from: "panfatherdetails",
          let: { customerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$customerId", "$$customerId"] },
                formName: "applicant"
              }
            }
          ],
          as: "applicant.panFatherDetail"
        }
      },
      {
        $lookup: {
          from: "aadharocrs",
          let: { customerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$customerId", "$$customerId"] },
                formName: "coApplicant"
              }
            }
          ],
          as: "coApplicant.aadharocr"
        }
      },
      {
        $lookup: {
          from: "aadhaardetails",
          let: { customerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$customerId", "$$customerId"] },
                formName: "coApplicant"
              }
            }
          ],
          as: "coApplicant.aadhaarDetail"
        }
      },
      {
        $lookup: {
          from: "pancomprehensivedetails",
          let: { customerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$customerId", "$$customerId"] },
                formName: "coApplicant"
              }
            }
          ],
          as: "coApplicant.panComprehensiveDetail"
        }
      },
      {
        $lookup: {
          from: "panfatherdetails",
          let: { customerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$customerId", "$$customerId"] },
                formName: "coApplicant"
              }
            }
          ],
          as: "coApplicant.panFatherDetail"
        }
      },
      {
        $lookup: {
          from: "aadharocrs",
          let: { customerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$customerId", "$$customerId"] },
                formName: "guarantor"
              }
            }
          ],
          as: "guarantor.aadharocr"
        },

      },
      {
        $lookup: {
          from: "aadhaardetails",
          let: { customerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$customerId", "$$customerId"] },
                formName: "guarantor"
              }
            }
          ],
          as: "guarantor.aadhaarDetail"
        }
      },
      {
        $lookup: {
          from: "pancomprehensivedetails",
          let: { customerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$customerId", "$$customerId"] },
                formName: "guarantor"
              }
            }
          ],
          as: "guarantor.panComprehensiveDetail"
        }
      },
      {
        $lookup: {
          from: "panfatherdetails",
          let: { customerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$customerId", "$$customerId"] },
                formName: "guarantor"
              }
            }
          ],
          as: "guarantor.panFatherDetail"
        }
      },
      {
        $lookup: {
          from: "accounts",
          localField: "_id",
          foreignField: "customerId",
          as: "account"
        }
      },
      {
        $project: {
          "account.__v": 0
        }
      },
      {
        $lookup: {
          from: "electricitydetails",
          localField: "_id",
          foreignField: "customerId",
          as: "electricityDetail"
        }
      },
      {
        $project: {
          "electricityDetail.__v": 0
        }
      },
      {
        $lookup: {
          from: "udyams",
          localField: "_id",
          foreignField: "customerId",
          as: "udyamData"
        }
      },
      {
        $project: {
          "udyamData.__v": 0
        }
      },
    ])
    success(res, "Customer Aadhaar And PanCard Details", kycData);
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}

async function customerGetAllDocument(req, res) {
  try {
    const customerDocument = await customerModel.aggregate([
      { $match: { _id: new ObjectId(req.query.customerId) } },
      {
        $lookup: {
          from: "applicantdetails",
          localField: "_id",
          foreignField: "customerId",
          as: "applicantDetail"
        }
      },
      {
        $lookup: {
          from: "coapplicantdetails",
          localField: "_id",
          foreignField: "customerId",
          as: "coapplicantDetail"
        }
      },
      {
        $lookup: {
          from: "guarantordetails",
          localField: "_id",
          foreignField: "customerId",
          as: "guarantorDetail"
        }
      },
      {
        $lookup: {
          from: "bankaccountdetails",
          localField: "_id",
          foreignField: "customerId",
          as: "bankaccountdetails"
        }
      },
      {
        $lookup: {
          from: "salescases",
          localField: "_id",
          foreignField: "customerId",
          as: "salescase"
        }
      },
      {
        $lookup: {
          from: "cibildetails",
          localField: "_id",
          foreignField: "customerId",
          as: "cibilDetail"
        }
      },
      {
        $lookup: {
          from: "pdformdatas",
          localField: "_id",
          foreignField: "customerId",
          as: "pdDetail"
        }
      },
      {
        $project: {
          "executiveName": 1,
          "customerFinId": 1,
          "applicantDetail.applicantPhoto": 1,
          "applicantDetail.ocrAadharBackImage": 1,
          "applicantDetail.ocrAadharFrontImage": 1,
          "applicantDetail.kycUpload.aadharFrontImage": 1,
          "applicantDetail.kycUpload.aadharBackImage": 1,
          "applicantDetail.kycUpload.panFrontImage": 1,
          "applicantDetail.kycUpload.drivingLicenceImage": 1,
          "applicantDetail.kycUpload.voterIdImage": 1,
          "coapplicantDetail.coApplicantPhoto": 1,
          "coapplicantDetail.ocrAadharBackImage": 1,
          "coapplicantDetail.ocrAadharFrontImage": 1,
          "coapplicantDetail.kycUpload.aadharFrontImage": 1,
          "coapplicantDetail.kycUpload.aadharBackImage": 1,
          "coapplicantDetail.kycUpload.docImage": 1,
          "guarantorDetail.coApplicantPhoto": 1,
          "guarantorDetail.ocrAadharBackImage": 1,
          "guarantorDetail.ocrAadharFrontImage": 1,
          "guarantorDetail.kycUpload.aadharFrontImage": 1,
          "guarantorDetail.kycUpload.aadharBackImage": 1,
          "guarantorDetail.kycUpload.docImage": 1,
          "bankaccountdetails.bankDetails.bankStatement": 1,
          "salescase.selfiWithCustomer": 1,
          "salescase.photoWithLatLong": 1,
          "salescase.front": 1,
          "salescase.leftSide": 1,
          "salescase.rightSide": 1,
          "salescase.selfiWithCustomer": 1,
          "salescase.approachRoad": 1,
          "salescase.mainRoad": 1,
          "salescase.interiorRoad": 1,
          "salescase.incomeDocuments": 1,
          "salescase.propetyDocuments": 1,
          "salescase.propertyOtherPhotos": 1,
          "salescase.incomeSource.incomeSourceType": 1,
          "salescase.incomeSource.milkBusiness.milkPhotos": 1,
          "salescase.incomeSource.salaryIncome.salaryPhotos": 1,
          "salescase.incomeSource.milkBusiness.animalPhotos": 1,
          "salescase.incomeSource.salaryIncome.bankStatementPhoto": 1,
          "salescase.incomeSource.agricultureBusiness.agriculturePhotos": 1,
          "salescase.incomeSource.salaryIncome.last3MonthSalarySlipPhotos": 1,
          "cibilDetail.applicantCibilReport": 1,
          "cibilDetail.coApplicantCibilReport": 1,
          "cibilDetail.guarantorCibilReport": 1,
          "pdDetail.SSSMPhoto": 1,
          "pdDetail.gasDiaryPhoto": 1,
          "pdDetail.electricityBill.meterPhoto": 1,
          "pdDetail.electricityBill.electricityBillUpload": 1,
          "pdDetail.incomeSource.incomeSourceType": 1,
          "pdDetail.incomeSource.agricultureBusiness.agriculturePhotos": 1,
          "pdDetail.incomeSource.milkBusiness.animalPhotos": 1,
          "pdDetail.incomeSource.milkBusiness.milkPhotos": 1,
          "pdDetail.incomeSource.salaryIncome.salaryPhotos": 1,
          "pdDetail.incomeSource.salaryIncome.bankStatementPhoto": 1,
          "pdDetail.incomeSource.salaryIncome.last3MonthSalarySlipPhotos": 1,
          "pdDetail.other.incomeOtherImages": 1,
          "pdDetail.selfiWithCustomer": 1,
          "pdDetail.photoWithLatLong": 1,
          "pdDetail.front": 1,
          "pdDetail.leftSide": 1,
          "pdDetail.rightSide": 1,
          "pdDetail.selfiWithCustomer": 1,
          "pdDetail.approachRoad": 1,
          "pdDetail.mainRoad": 1,
          "pdDetail.interiorRoad": 1,
          "pdDetail.propertyPhoto": 1,
          "pdDetail.selfieWithProperty": 1,
          "pdDetail.udyamAadharUpload": 1,
          "pdDetail.propertyOtherPhotos": 1
        }
      }
    ]);
    return success(res, "All Customer Documents", customerDocument);
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}

async function salesAllFormCount(req, res) {
  try {
    const role = req.roleName;
    const ID = req.Id;
    let matchField;
    switch (role) {
      case "sales":
      case "salesAndCollection":
      case "salesPdAndCollection":
      case "salesPdCollectionAndFileProcess":
        matchField = "employeId";
        break;
      case "cibil":
      case "cibilExternalManagerAndFileProcess":
        matchField = "cibilId";
        break;
      case "pd":
        matchField = "pdId";
        break;
      default:
        return unknownError(res, "Invalid role");
    }
    const statusCounts = await processModel.aggregate([
      {
        $match: { [matchField]: new ObjectId(ID) }
      },
      {
        $facet: {
          all: [{ $count: "count" }],
          pending: [
            { $match: { statusByPd: "pending" } },
            { $count: "count" }
          ],
          approved: [
            { $match: { statusByPd: "approved" } },
            { $count: "count" }
          ],
          incomplete: [
            { $match: { statusByPd: "incomplete" } },
            { $count: "count" }
          ],
          rejected: [
            { $match: { statusByPd: "rejected" } },
            { $count: "count" }
          ]
        }
      },
      {
        $project: {
          all: { $arrayElemAt: ["$all.count", 0] },
          pending: { $arrayElemAt: ["$pending.count", 0] },
          approved: { $arrayElemAt: ["$approved.count", 0] },
          incomplete: { $arrayElemAt: ["$incomplete.count", 0] },
          rejected: { $arrayElemAt: ["$rejected.count", 0] }
        }
      }
    ]);

    const counts = {
      all: statusCounts[0].all || 0,
      pending: statusCounts[0].pending || 0,
      approved: statusCounts[0].approved || 0,
      incomplete: statusCounts[0].incomplete || 0,
      rejected: statusCounts[0].rejected || 0
    };

    return success(res, "Form data successfully", counts);
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}

const ProductLoginList = async (req, res) => {
  try {
    const _id = req.Id;
    const data = await processModel.find({
      employeId: new mongoose.Types.ObjectId(_id),
    });

    let totalLogin = 0;
    let totalPending = 0;
    let cibilOk = 0;
    let cibilRejected = 0;
    let totalfreeLoginCount = 0;

    for (const process of data) {
      totalLogin++;

      const details = await customerModel.findOne({
        employeId: process.employeId,
      });

      if (details) {
        const productDetails = await productModel.findOne({
          _id: details.productId,
        });

        if (productDetails && productDetails.loginFees === 0) {
          totalfreeLoginCount++;
          if (process.statusByCibil === "complete") {
            cibilOk++;
          } else if (process.statusByCibil === "rejected") {
            cibilRejected++;
          }
        }
      } else {
        console.log(
          `No customer details found for employeId: ${process.employeId}`
        );
      }
    }
    let count = cibilOk + cibilRejected
    totalPending = totalLogin - count
    const freeLoginFee = {
      totalLogin,
      totalPending,
      cibilOk,
      cibilRejected,
      totalfreeLoginCount,
    };

    const dataAmount = await processModel.find({
      employeId: new mongoose.Types.ObjectId(_id),
    });

    let LoginAmountTotal = 0;
    let cibilOkTotal = 0;
    let cibilRejectedTotal = 0;

    // Initialize the LoginWithFeeDetails calculations
    let totalLoginAmountCount = 0;
    let pendingLoginAmount = 0;
    let loginWithAmountCount = 0;

    for (const process of dataAmount) {
      LoginAmountTotal++;

      const details = await customerModel.findOne({
        employeId: process.employeId,
      });

      if (details) {
        const productDetails = await productModel.findOne({
          _id: details.productId,
        });

        if (productDetails) {
          if (process.customerFormComplete && productDetails.loginFees > 0) {
            totalLoginAmountCount += productDetails.loginFees;
            loginWithAmountCount++;
            if (process.statusByCibil === "complete") {
              cibilOkTotal++;
            } else if (process.statusByCibil === "rejected") {
              cibilRejectedTotal++;
            }
          } else if (!process.customerFormComplete) {
            pendingLoginAmount += productDetails.loginFees;
          }
        }
      } else {
        console.log(
          `No customer details found for employeId: ${process.employeId}`
        );
      }
    }

    totalPending = LoginAmountTotal - (cibilOkTotal + cibilRejectedTotal)
    const LoginWithFeeDetails = {
      totalLogin: LoginAmountTotal,
      totalPending: totalPending,
      cibilOk: cibilOkTotal,
      cibilRejected: cibilRejectedTotal,
      totalLoginAmountCount,
      pendingLoginAmount,
      loginWithAmountCount,
    };
    // console.log(LoginWithFeeDetails, "LoginWithFeeDetails");

    return success(res, "All product login List", {
      freeLoginFee,
      LoginWithFeeDetails,
    });
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
};

const allProductLoginlist = async (req, res) => {
  try {
    const _id = req.Id;
    const { filter = "monthly" } = req.query;
    const currentYear = new Date().getFullYear();
    const today = new Date();

    let startDate, endDate, groupByField;

    if (filter === "weekly") {
      // Set startDate to the start of the current week (Sunday) and endDate to the end of the week (Saturday)
      const currentWeekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      startDate = currentWeekStart;
      endDate = new Date(today.setDate(today.getDate() + 6));
      groupByField = { dayOfWeek: { $dayOfWeek: "$createdAt" } };
    } else {
      // For monthly filter, group by month and set startDate/endDate for the current year
      startDate = new Date(currentYear, 0, 1);
      endDate = new Date(currentYear + 1, 0, 1);
      groupByField = { month: { $month: "$createdAt" } };
    }

    const data = await processModel.aggregate([
      {
        $match: {
          employeId: new mongoose.Types.ObjectId(_id),
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $lookup: {
          from: 'customerdetails',
          localField: 'employeId',
          foreignField: 'employeId',
          as: 'customerDetails',
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: 'customerDetails.productId',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      {
        $group: {
          _id: groupByField,
          totalLogin: { $sum: 1 },
          cibilOk: {
            $sum: {
              $cond: [{ $eq: ['$statusByCibil', 'complete'] }, 1, 0],
            },
          },
          cibilRejected: {
            $sum: {
              $cond: [{ $eq: ['$statusByCibil', 'rejected'] }, 1, 0],
            },
          },
          totalPending: {
            $sum: {
              $subtract: [
                1,
                {
                  $add: [
                    {
                      $cond: [{ $eq: ['$statusByCibil', 'complete'] }, 1, 0],
                    },
                    {
                      $cond: [{ $eq: ['$statusByCibil', 'rejected'] }, 1, 0],
                    },
                  ],
                },
              ],
            },
          },
          totalfreeLoginCount: { $sum: 1 },
        },
      },
      {
        $sort: filter === "weekly" ? { "_id.dayOfWeek": 1 } : { "_id.month": 1 },
      },
    ]);

    const allData = (filter === "weekly")
      ? Array.from({ length: 7 }, (_, index) => {
        const dayOfWeek = index + 1;
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayData = data.find(item => item._id.dayOfWeek === dayOfWeek);
        return {
          day: dayNames[index], // Get the day name
          totalLogin: dayData ? dayData.totalLogin : 0,
          totalPending: dayData ? dayData.totalPending : 0,
          cibilOk: dayData ? dayData.cibilOk : 0,
          cibilRejected: dayData ? dayData.cibilRejected : 0,
          // totalfreeLoginCount: dayData ? dayData.totalfreeLoginCount : 0,
        };
      })
      : Array.from({ length: 12 }, (_, index) => {
        const month = index + 1; // Month starts from 1 (January)
        const monthData = data.find(item => item._id.month === month);
        return {
          month,
          totalLogin: monthData ? monthData.totalLogin : 0,
          totalPending: monthData ? monthData.totalPending : 0,
          cibilOk: monthData ? monthData.cibilOk : 0,
          cibilRejected: monthData ? monthData.cibilRejected : 0,
          // totalfreeLoginCount: monthData ? monthData.totalfreeLoginCount : 0,
        };
      });

    return success(res, `All product login List (${filter})`, allData);
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
};

const saleManagerProductList = async (req, res) => {
  try {
    const _id = req.Id
    // const _id = new mongoose.Types.ObjectId('6685103c374425e93711418c'); //66f7c6d689c56158af75450d
    // console.log(_id, "_id<<>>");

    const employData = await employeModel.findOne({ _id: _id }).populate('roleId');
    if (employData.roleId.roleName !== "sales manager") {
      return success(res, "Role is not matched");
    }

    const employList = await employeModel.find({ reportingManagerId: _id });

    let totalLogin = 0;
    let totalPending = 0;
    let cibilOk = 0;
    let cibilRejected = 0;
    let totalfreeLoginCount = 0;

    for (const process of employList) {
      const processList = await processModel.find({ employeId: process._id });

      for (const processItem of processList) {
        totalLogin++;
        console.log(processItem, "processItem")
        const customerDetails = await customerModel.findOne({ employeId: processItem.employeId });
        console.log(customerDetails, "customerDetails")
        if (customerDetails) {
          const productDetails = await productModel.findOne({ _id: customerDetails.productId, });
          console.log(productDetails, "productDetails")
          if (productDetails && productDetails.loginFees === 0) {
            totalfreeLoginCount++;
            if (processItem.statusByCibil === "complete") {
              cibilOk++;
            } else if (processItem.statusByCibil === "rejected") {
              cibilRejected++;
            }
          }
        } else {
          console.log(`No customer details found for employeId: ${process.employeId}`);
        }
      }
    }
    const freeLoginFee = {
      totalLogin,
      totalPending: totalLogin - (cibilOk + cibilRejected),
      cibilOk,
      cibilRejected,
      totalfreeLoginCount,
    };

    let LoginAmountTotal = 0;
    let cibilOkTotal = 0;
    let cibilRejectedTotal = 0;

    // Initialize the LoginWithFeeDetails calculations
    let totalLoginAmountCount = 0;
    let pendingLoginAmount = 0;
    let loginWithAmountCount = 0;

    for (const process of employList) {
      const processList = await processModel.find({ employeId: process._id });
      for (const processItem of processList) {
        LoginAmountTotal++;
        const customerDetails = await customerModel.findOne({ employeId: processItem.employeId });
        if (customerDetails) {
          const productDetails = await productModel.findOne({ _id: customerDetails.productId });
          if (productDetails && productDetails.loginFees > 0) {
            totalLoginAmountCount += productDetails.loginFees;
            loginWithAmountCount++;
            if (processItem.statusByCibil === "complete") {
              cibilOkTotal++;
            } else if (processItem.statusByCibil === "rejected") {
              cibilRejectedTotal++;
            }
          }
        } else {
          console.log(`No customer details found for employeId: ${process.employeId}`);
        }
      }
    }

    totalPending = LoginAmountTotal - (cibilOkTotal + cibilRejectedTotal)

    const LoginWithFeeDetails = {
      totalLogin: LoginAmountTotal,
      totalPending: totalPending,
      cibilOk: cibilOkTotal,
      cibilRejected: cibilRejectedTotal,
      totalLoginAmountCount,
      pendingLoginAmount,
      loginWithAmountCount,
    };
    return success(res, "Sales manager product login list", { freeLoginFee, LoginWithFeeDetails });
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
};

const saleManagerAllProductList = async (req, res) => {
  try {
    const _id = req.Id
    const { filter = "monthly" } = req.query;

    // const _id = new mongoose.Types.ObjectId('6685103c374425e93711418c');
    // console.log(_id, "_id<<>>");

    const employData = await employeModel.findOne({ _id: _id }).populate('roleId');
    if (employData.roleId.roleName !== "sales manager") {
      return success(res, "Role is not matched");
    }

    const employList = await employeModel.find({ reportingManagerId: _id });

    let matchCriteria = {};
    let groupBy = {};

    if (filter === "weekly") {
      // Group by day of the week
      matchCriteria = {
        $group: {
          _id: { $dayOfWeek: "$createdAt" }, // Group by day of the week
          totalLogin: { $sum: 1 },
          cibilOk: { $sum: { $cond: [{ $eq: ["$statusByCibil", "complete"] }, 1, 0] } },
          cibilRejected: { $sum: { $cond: [{ $eq: ["$statusByCibil", "rejected"] }, 1, 0] } }
        }
      };
      groupBy = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    } else {
      // Group by month
      matchCriteria = {
        $group: {
          _id: { $month: "$createdAt" }, // Group by month
          totalLogin: { $sum: 1 },
          cibilOk: { $sum: { $cond: [{ $eq: ["$statusByCibil", "complete"] }, 1, 0] } },
          cibilRejected: { $sum: { $cond: [{ $eq: ["$statusByCibil", "rejected"] }, 1, 0] } }
        }
      };
      groupBy = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // Month numbers
    }

    // Aggregation query to fetch data based on filter
    const aggregatedData = await processModel.aggregate([
      { $match: { employeId: { $in: employList.map(emp => emp._id) } } },
      matchCriteria
    ]);

    let result = [];

    if (filter === "weekly") {
      result = groupBy.map((day, index) => {
        const dayData = aggregatedData.find(data => data._id === index + 1);
        return {
          day: day,
          totalLogin: dayData?.totalLogin || 0,
          totalPending: (dayData?.totalLogin || 0) - (dayData?.cibilOk || 0) - (dayData?.cibilRejected || 0),
          cibilOk: dayData?.cibilOk || 0,
          cibilRejected: dayData?.cibilRejected || 0
        };
      });
    } else {
      result = groupBy.map((month) => {
        const monthData = aggregatedData.find(data => data._id === month);
        return {
          month: month,
          totalLogin: monthData?.totalLogin || 0,
          totalPending: (monthData?.totalLogin || 0) - (monthData?.cibilOk || 0) - (monthData?.cibilRejected || 0),
          cibilOk: monthData?.cibilOk || 0,
          cibilRejected: monthData?.cibilRejected || 0
        };
      });
    }
    const freeLoginFee = {
      items: result
    };
    return success(res, "Sales manager all product login list", { freeLoginFee });
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}

// const allProductLoginlistWithoutFilter = async (req, res) => {
//   try {
//     const _id = req.Id;
//     const currentYear = new Date().getFullYear();

//     // Set date range to cover the entire current year
//     const startDate = new Date(currentYear, 0, 1);
//     const endDate = new Date(currentYear + 1, 0, 1);

//     const data = await processModel.aggregate([
//       {
//         $match: {
//           employeId: new mongoose.Types.ObjectId(_id),
//           createdAt: { $gte: startDate, $lt: endDate },
//         },
//       },
//       {
//         $lookup: {
//           from: 'customerdetails',
//           localField: 'employeId',
//           foreignField: 'employeId',
//           as: 'customerDetails',
//         },
//       },
//       {
//         $lookup: {
//           from: 'products',
//           localField: 'customerDetails.productId',
//           foreignField: '_id',
//           as: 'productDetails',
//         },
//       },
//       {
//         $group: {
//           _id: null, // Remove grouping by week or month
//           totalLogin: { $sum: 1 },
//           cibilOk: {
//             $sum: {
//               $cond: [{ $eq: ['$statusByCibil', 'complete'] }, 1, 0],
//             },
//           },
//           cibilRejected: {
//             $sum: {
//               $cond: [{ $eq: ['$statusByCibil', 'rejected'] }, 1, 0],
//             },
//           },
//           totalPending: {
//             $sum: {
//               $subtract: [
//                 1,
//                 {
//                   $add: [
//                     {
//                       $cond: [{ $eq: ['$statusByCibil', 'complete'] }, 1, 0],
//                     },
//                     {
//                       $cond: [{ $eq: ['$statusByCibil', 'rejected'] }, 1, 0],
//                     },
//                   ],
//                 },
//               ],
//             },
//           },
//         },
//       },
//     ]);

//     // Since we're only computing total counts, we can directly return the aggregate results
//     const totals = data.length > 0 ? data[0] : {
//       totalLogin: 0,
//       totalPending: 0,
//       cibilOk: 0,
//       cibilRejected: 0,
//       // totalfreeLoginCount: 0,
//     };

//     return success(res, "All product login List (total counts only)", totals);
//   } catch (error) {
//     console.log(error);
//     return unknownError(res, error);
//   }
// };



//  Find the process moles data and with coustumerId //



const allProductLoginlistWithoutFilter = async (req, res) => {
  try {
    const tokenId = req.Id;
    const { employeeId } = req.query;
    let _id;
    if (employeeId) {
      _id = employeeId;
    } else {
      _id = tokenId;
    }

    const employeData = await employeModel.findOne({ _id: _id })
    if (!employeData) {
      return notFound(res, "Employee not found");
    }
    const { startDate, endDate } = req.query;

    const from = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const to = endDate ? new Date(endDate) : new Date(new Date().getFullYear() + 1, 0, 1);

    // const loginData = await processModel.aggregate([
    //   {
    //     $match: {
    //       employeId: new mongoose.Types.ObjectId(_id),
    //       createdAt: { $gte: from, $lt: to },
    //     },
    //   },
    //   {
    //     $addFields: {
    //       loginDone: {
    //         $cond: [
    //           {
    //             $and: [
    //               "$customerFormStart",
    //               "$customerFormComplete",
    //               "$applicantFormStart",
    //               "$applicantFormComplete",
    //               "$coApplicantFormStart",
    //               "$coApplicantFormComplete",
    //               "$guarantorFormStart",
    //               "$guarantorFormComplete",
    //             ],
    //           },
    //           1,
    //           0,
    //         ],
    //       },
    //     },
    //   },
    //   {
    //     $addFields: {
    //       loginPending: { $subtract: [1, "$loginDone"] }
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: null,
    //       totalLogin: { $sum: 1 },
    //       loginDone: { $sum: "$loginDone" },
    //       loginPending: { $sum: "$loginPending" },
    //     },
    //   },
    // ]);


    const loginData = await processModel.aggregate([
      {
        $match: {
          employeId: new mongoose.Types.ObjectId(_id),
          createdAt: { $gte: from, $lt: to },
        },
      },
      {
        $addFields: {
          loginDone: {
            $cond: [
              {
                $and: [
                  "$customerFormStart",
                  "$customerFormComplete",
                  "$applicantFormStart",
                  "$applicantFormComplete",
                  "$coApplicantFormStart",
                  "$coApplicantFormComplete",
                  "$guarantorFormStart",
                  "$guarantorFormComplete",
                ],
              },
              1,
              0,
            ],
          },
        },
      },
      {
        $addFields: {
          loginPending: { $subtract: [1, "$loginDone"] },
        },
      },
      {
        $facet: {
          stats: [
            {
              $group: {
                _id: null,
                totalLogin: { $sum: 1 },
                loginDone: { $sum: "$loginDone" },
                loginPending: { $sum: "$loginPending" },
              },
            },
          ],
          loginFees: [
            {
              $match: {
                $expr: { $eq: ["$loginDone", 1] }
              },
            },
            {
              $lookup: {
                from: "customerdetails", // collection name of customerModel
                localField: "customerId",
                foreignField: "_id",
                as: "customerData",
              },
            },
            {
              $unwind: "$customerData",
            },
            {
              $group: {
                _id: null,
                totalLoginFees: { $sum: "$customerData.loginFees" },
              },
            },
          ],
        },
      },
      {
        $project: {
          totalLogin: { $arrayElemAt: ["$stats.totalLogin", 0] },
          loginDone: { $arrayElemAt: ["$stats.loginDone", 0] },
          loginPending: { $arrayElemAt: ["$stats.loginPending", 0] },
          totalLoginFees: {
            $ifNull: [{ $arrayElemAt: ["$loginFees.totalLoginFees", 0] }, 0],
          },
        },
      },
    ]);


    const cibilOk = await externalManagerModel.countDocuments({
      employeeId: new mongoose.Types.ObjectId(_id),
      createdAt: { $gte: from, $lt: to },
    });

    const cibilRejected = await processModel.countDocuments({
      employeId: new mongoose.Types.ObjectId(_id),
      updatedAt: { $gte: from, $lt: to },
      statusByCibil: "rejected",
    });

    const leadData = await leadGenerateModel.aggregate([
      {
        $match: {
          employeeGenerateId: new mongoose.Types.ObjectId(_id),
          createdAt: { $gte: from, $lt: to },
        },
      },
      {
        $group: {
          _id: null,
          totalLeadComplet: { $sum: 1 },
          approveLead: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          convertLead: {
            $sum: { $cond: [{ $eq: ["$status", "leadConvert"] }, 1, 0] },
          },
          rejectLead: {
            $sum: { $cond: [{ $in: ["$status", ["reject", "rejectBySales"]] }, 1, 0] },
          },
        },
      },
    ]);

    return success(res, "All product login List (total counts only)", {
      totalLogin: loginData[0]?.totalLogin || 0,
      loginDone: loginData[0]?.loginDone || 0,
      loginPending: loginData[0]?.loginPending || 0,
      totalLoginFees: loginData[0]?.totalLoginFees || 0,
      cibilOk: cibilOk || 0,
      cibilRejected: cibilRejected || 0,
      totalLeadComplet: leadData[0]?.totalLeadComplet || 0,
      approveLead: leadData[0]?.approveLead || 0,
      convertLead: leadData[0]?.convertLead || 0,
      rejectLead: leadData[0]?.rejectLead || 0,
      underSnaction: 0,
      underDisbursement: 0,
      disbursementAmount: 0,
    });
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
};


const findStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { customerId } = req.query;
    if (!customerId || !customerId.trim()) {
      return notFound(res, "CustomerId is required");
    }

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return badRequest(res, "Invalid customerId");
    }

    // Fetch customer data
    const customer = await customerModel.findOne({ _id: customerId });
    if (!customer) {
      return notFound(res, "CustomerId is not found in customerModel");
    }

    const productDetail = await productModel.findOne({ _id: customer.productId })
    // Fetch employee data or set default values
    const employee = await employeModel.findOne({ _id: customer.employeId }).select("employeName userName employeUniqueId");
    const employeeData = employee ? {
      employeeName: employee.employeName,
      employeeUserName: employee.userName,
      employeeUniqueId: employee.employeUniqueId,
    } : {
      employeeName: "notAssign",
      employeeUserName: "notAssign",
      employeeUniqueId: "notAssign",
    };


    // Fetch process data or set default values
    const process = await processModel.findOne({ customerId });
    const Sales = process ? {
      paymentAmount: productDetail.loginFees,
      cutomerNumber: customer.mobileNo,
      customerStatus: (process.customerFormStart && process.customerFormComplete) ? "completed" : "pending",
      applicationStatus: (process.applicantFormStart && process.applicantFormComplete) ? "completed" : "pending",
      coApplicantStatus: (process.coApplicantFormStart && process.coApplicantFormComplete) ? "completed" : "pending",
      guarantorStatus: (process.guarantorFormStart && process.guarantorFormComplete) ? "completed" : "pending",
      salesCaseStatus: (process.salesCaseDetailFormComplete && process.salesCaseDetailFormStart) ? "completed" : "pending",
      AllStatus: (
        process.customerFormStart && process.customerFormComplete &&
        process.applicantFormStart && process.applicantFormComplete &&
        process.coApplicantFormStart && process.coApplicantFormComplete &&
        process.guarantorFormStart && process.guarantorFormComplete &&
        process.salesCaseDetailFormComplete && process.salesCaseDetailFormStart
      ) ? "completed" : "pending",
      paymentStatus: (process.customerFormStart && process.customerFormComplete) ? "completed" : "pending",
      Date: process.updatedAt,
    } : {
      customerStatus: "pending",
      applicationStatus: "pending",
      coApplicantStatus: "pending",
      guarantorStatus: "pending",
      salesCaseStatus: "pending",
      AllStatus: "pending",
      paymentStatus: "pending",
      Date: "notAssign",
    };

    Object.assign(Sales, employeeData);

    // Fetch cibil data or set default values
    const cibilData = await cibilModel.findOne({ customerId });
    const cibil = cibilData ? {
      applicantCibilStatus: ["approved", "rejected"].includes(cibilData.applicantCibilStatus) ? cibilData.applicantCibilStatus : "pending",
      coApplicantCibilStatus: cibilData.coApplicantData.every(item => item.coApplicantCibilStatus === "approved") ? "approved" :
        cibilData.coApplicantData.some(item => item.coApplicantCibilStatus === "rejected") ? "rejected" : "pending",
      guarantorCibilStatus: ["approved", "rejected"].includes(cibilData.guarantorCibilStatus) ? cibilData.guarantorCibilStatus : "pending",
      allCibilStatus: (cibilData.applicantCibilStatus === "approved" &&
        cibilData.coApplicantData.every(item => item.coApplicantCibilStatus === "approved") &&
        cibilData.guarantorCibilStatus === "approved") ? "approved" : "rejected",
      Date: cibilData.updatedAt,
      cibilName: cibilData.cibilId ? (await employeModel.findOne({ _id: cibilData.cibilId }).select("employeName")).employeName : "notAssign",
      cibilUserName: cibilData.cibilId ? (await employeModel.findOne({ _id: cibilData.cibilId }).select("userName")).userName : "notAssign",
    } : {
      applicantCibilStatus: "pending",
      coApplicantCibilStatus: "pending",
      guarantorCibilStatus: "pending",
      allCibilStatus: "pending",
      Date: "notAssign",
      cibilName: "notAssign",
      cibilUserName: "notAssign",
    };

    // Fetch external data or set default values
    const externalData = await externalManagerModel.findOne({ customerId });


    const branchpendency = externalData ? {
      branchStatus: externalData.branchStatus || "notAssign",
      branchByremark: externalData.branchByremark || "notAssign",
      branchCompleteDate: externalData.branchCompleteDate || "notAssign",
    } : {
      branchStatus: "notAssign",
      branchByremark: "notAssign",
      branchCompleteDate: "notAssign",
    };

    const pd = externalData ? {
      creaditPdId: externalData.creditPdId || "notAssing",
      creditPdAssignDate: externalData.creditPdAssignDate || "notAssign",
      remarkForCreditPd: externalData.remarkForCreditPd || "notAssing",
      approvalRemarkCreditPd: externalData.approvalRemarkCreditPd || "notAssing",
      creditPdSendMail: externalData.creditPdSendMail || "notAssing",
      statusByCreditPd: externalData.statusByCreditPd || "notAssing",
      statusByTlPd: externalData.statusByTlPd || "notAssing",
    } : {
      creaditPdId: "notAssing",
      creditPdAssignDate: "notAssign",
      remarkForCreditPd: "notAssing",
      approvalRemarkCreditPd: "notAssing",
      creditPdSendMail: "notAssing",
      statusByCreditPd: "notAssing",
      statusByTlPd: "notAssing",
    };

    // Populate vendor details with default values if not found
    let vendorDetails = {};
    if (externalData) {
      const validVendorTypes = ['rcu', 'technical', 'legal', 'rm'];
      await Promise.all(
        externalData.vendors.map(async (vendor) => {
          if (validVendorTypes.includes(vendor.vendorType)) {
            const vendorData = await vendorModel.findOne({ _id: vendor.vendorId }) || {};
            vendorDetails[vendor.vendorType] = {
              approverRemark: vendor.approverRemark || "notAssign",
              vendorStatus: vendor.vendorStatus || "notAssign",
              statusByVendor: vendor.statusByVendor || "notAssign",
              vendorUploadDate: vendor.vendorUploadDate || "notAssign",
              approverDate: vendor.approverDate || "notAssign",
              vendorId: vendor.vendorId,
              vendorName: vendorData.fullName || "notAssign",
              vendorUserName: vendorData.userName || "notAssign",
            };
          }
        })
      );
    }

    return success(res, 'Process status', { Sales, cibil, branchpendency, vendorDetails, pd });
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
};



const deleteByCustomerFinId = async (req, res) => {
  try {
    const { customerFi } = req.query
    const customer = await customerModel.findOne({ customerFinId });

    if (!customer) {
      return badRequest(res, "Customer not found!");
    }

    const customerId = customer._id; // Extract the customer's _id

    // Delete related data from all other models
    const deletePromises = [
      applicantModel.deleteMany({ customerId }),
      coApplicantModel.deleteMany({ customerId }),
      guarantorModel.deleteMany({ customerId }),
      referenceModel.deleteMany({ customerId }),
      bankAccountModel.deleteMany({ customerId }),
      processModel.deleteMany({ customerId }),
      cibilModel.deleteMany({ customerId }),

    ];

    await Promise.all(deletePromises);

    await customerModel.deleteOne({ _id: customerId });

    return success(res, "delete  Data")
    console.log(`Customer data and related documents deleted successfully for customerFinId: ${customerFinId}`);
  } catch (error) {
    console.error("Error deleting customer data:", error);
  }
};



// change the Employee Name using FinId with UserName //

async function findEmployeeNameByFinId(req, res) {
  try {
    const { UserName, finId } = req.body;

    if (!finId) {
      return badRequest(res, "Fin ID is required");
    }

    if (!UserName) {
      return badRequest(res, "UserName is required");
    }

    // Find customer by finId
    const customer = await customerModel.findOne({ customerFinId: finId }).select("_id");
    if (!customer) {
      return notFound(res, "Customer not found");
    }

    // Find employee by userName
    const employee = await employeModel.findOne({ userName: UserName });
    if (!employee) {
      return badRequest(res, "Employee not found");
    }

    // Update all instances of customerId in each model
    await Promise.all([
      applicantModel.updateMany({ customerId: customer._id }, { employeId: employee._id }),
      coApplicantModel.updateMany({ customerId: customer._id }, { employeId: employee._id }),
      guarantorModel.updateMany({ customerId: customer._id }, { employeId: employee._id }),
      processModel.updateMany({ customerId: customer._id }, { employeId: employee._id }),
      customerModel.updateMany({ _id: customer._id }, { employeId: employee._id })
    ]);

    console.log("Updated employeeId for all relevant models:", employee._id);
    return success(res, "Employee updated successfully", { customerId: customer._id, employeeId: employee._id });
  } catch (error) {
    console.error("Error updating customer and related models:", error);
    return unknownError(res, error);
  }
}



const updateCustomerBranch = async (req, res) => {
  try {
    // Fetch all customers with an existing employeId
    const customers = await customerModel.find({ employeId: { $ne: null } });

    console.log(`Found ${customers.length} customer records.`);

    // Update branch for each customer based on employeId
    const updatedCustomers = [];
    for (const customer of customers) {
      // Fetch the corresponding employee document
      const employee = await employeeModel.findById(customer.employeId);

      if (employee && employee.branchId) {
        // Update the branch field in customerModel
        const updatedCustomer = await customerModel.findByIdAndUpdate(
          customer._id,
          { $set: { branch: employee.branchId } },
          { new: true } // Return the updated document
        );

        updatedCustomers.push(updatedCustomer);
        console.log(
          `Updated customer ${customer._id} with branchId ${employee.branchId}`
        );
      } else {
        console.log(
          `No branchId found for employee ${customer.employeId}, skipping customer ${customer._id}`
        );
      }
    }

    success(res, "Customer branch fields updated successfully!", { data: updatedCustomers });
  } catch (error) {
    console.error("Error while updating customer branches:", error);
    return unknownError(res, error);
  }
};


async function fetchAllOrders(req, res) {
  try {
    //

    const { startDate, endDate, maxReturn = 50, lastReturnId = 0 } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "startDate and endDate are required" });
    }

    const client_id = "8225067a6d6bbaababc98cf1d3605228////////////"
    const client_secret = "cfsk_ma_prod_327a63c490144fcca36b8d079e4f777b_631d0abf/////////////"



    const getToken = async () => {
      const url = "https://cac-api.cashfree.com/cac/v1/authorize";
      const headers = {
        "X-Client-Id": client_id,
        "X-Client-Secret": client_secret

      };

      try {
        const response = await axios.post(url, {}, { headers });
        console.log("Response", response);

        if (response.data && response.data.cftoken) {
          return response.data.cftoken; // Return the token
        } else {
          throw new Error("Failed to fetch token: No token returned");
        }
      } catch (error) {
        throw new Error("Failed to fetch token: " + error.message);
      }
    };

    const token = await getToken(); // Fetch token

    const transactionsUrl = "https://api.cashfree.com/gc/transactions"; // Use the live transactions URL
    console.log('Token:', token);

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const options = {
      method: "GET",
      url: transactionsUrl,
      headers: headers,
      params: {
        startDate,
        endDate,
        maxReturn,
        lastReturnId,
      },
    };

    const response = await axios(options); // Fetch transactions

    return res.status(200).json({
      message: "Transactions fetched successfully",
      data: response.data,
    });

  } catch (error) {
    console.error("Error fetching transactions:", error);

    if (error.response) {
      if (error.response.status === 520) {
        return res.status(400).json({ message: "Invalid request parameters" });
      }
      return res.status(error.response.status || 500).json(error.response.data);
    }

    return res.status(500).json({ message: error.message });
  }
}



async function checkAndSetInactiveStatus(value, time, codeLevel) {
  try {

    const now = new Date();
    const threshold = new Date(now.getTime() - time * 60 * 60 * 1000);
    // const targetDate = new Date("2024-12-16T08:55:53.280+00:00");
    const customersToCheck = await customerModel.find({
      createdAt: { $lte: threshold },
      status: "active",
    });

    let inactiveCount = 0;
    const fileCreateEmployeeDetails = []

    for (const customer of customersToCheck) {
      const customerId = customer._id;
      const employeeDetail = await employeeModel.findById(customer.employeId).select('userName employeName employeUniqueId')
      const branchDetail = await newBranchModel.findById(customer.branch).select('name')

      const isCustomerInApplicant = await applicantModel.exists({ customerId });
      const isCustomerInCoApplicant = await coApplicantModel.exists({ customerId });
      const isCustomerInGuarantor = await guarantorModel.exists({ customerId });

      if (!isCustomerInApplicant && !isCustomerInCoApplicant && !isCustomerInGuarantor) {
        if (value && codeLevel === 'production') {
          // await customerModel.findByIdAndUpdate(customerId, { status: "inactive" ,deleteFile : true });
          // await processModel.updateMany({ customerId }, { fileStatus: "inactive",deleteFile : true });

          await customerModel.findByIdAndUpdate(
            customerId,
            { status: "inactive", deleteFile: true },
            { strict: false } // Allows fields not defined in the schema
          );

          await processModel.updateMany(
            { customerId },
            { fileStatus: "inactive", deleteFile: true },
            { strict: false } // Allows fields not defined in the schema
          );

        }

        inactiveCount++;
        fileCreateEmployeeDetails.push({
          customerFinId: customer?.customerFinId,
          mobileNo: customer?.mobileNo,
          userName: employeeDetail?.userName,
          employeeName: employeeDetail?.employeName,
          employeeUniqueId: employeeDetail?.employeUniqueId,
          branchName: branchDetail?.name,
          createdAt: customer?.createdAt,
        });
      }
    }
    const fileDetail = {
      inactiveCount, fileCreateEmployeeDetails
    }
    if (inactiveCount.lenght > 0) {
      fileCreateMailSend(fileDetail, value, codeLevel)
    }
    console.log("Cron job completed.");
  } catch (error) {
    console.error("Error in cron job:", error);
  }
}


async function getAppCoAppAndGTR(req, res) {
  try {
    const customerId = req.query.customerId;

    if (!customerId) {
      return badRequest(res, "Customer ID is required");
    }

    const getDetail = await customerModel.aggregate([
      { $match: { _id: new ObjectId(customerId) } },
      {
        $lookup: {
          from: "applicantdetails",
          localField: "_id",
          foreignField: "customerId",
          as: "applicantDetail"
        }
      },
      {
        $lookup: {
          from: "coapplicantdetails",
          localField: "_id",
          foreignField: "customerId",
          as: "coApplicantDetail"
        }
      },
      {
        $lookup: {
          from: "guarantordetails",
          localField: "_id",
          foreignField: "customerId",
          as: "guarantorDetail"
        }
      },
      {
        $project: {
          applicantDetail: {
            fullName: 1,
            dob: 1
          },
          coApplicantDetail: {
            fullName: 1,
            dob: 1
          },
          guarantorDetail: {
            fullName: 1,
            dob: 1
          }
        }
      }
    ]);

    // Check if data is empty
    if (!getDetail || getDetail.length === 0) {
      return notFound(res, "No details found for the given Customer ID");
    }

    success(res, "Applicant, CoApplicant, and Guarantor Details Retrieved", getDetail);
  } catch (error) {
    console.error("Error fetching details:", error.message);
    return unknownError(res, "An error occurred while fetching the details");
  }
}



// cron.schedule("00 00 * * *", async() => {
//   // prodution user name "9713296920" ketav sir
//   const employeeCheck  = await employeeModel.findOne({userName:'9713296920'})
//   if(employeeCheck){
//     checkAndSetInactiveStatus(false , 24);
//   }
// });

cron.schedule("00 00 * * *", async () => {
  if (process.env.BASE_URL === "https://prod.fincooper.in/") {
    await checkAndSetInactiveStatus(false, 24, 'production');
  } else if (process.env.BASE_URL === "https://stageapi.fincooper.in/") {
    await checkAndSetInactiveStatus(false, 24, 'stage');
  }
});


// cron.schedule("18 15 * * *", async() => {
//   const employeeCheck  = await employeeModel.findOne({userName:'9713296920'})
//   if(employeeCheck){
//     checkAndSetInactiveStatus(true , 48);
//   }
// });


async function fileReportTracking(req, res) {
  try {

    const { status } = req.query

    if (!status) {
      return badRequest(res, "Status is required.");
    } else if (status !== "active" && status !== "inactive") {
      return badRequest(res, "Status must be either 'active' or 'inactive'.");
    }

    const allFiles = await customerModel.aggregate([
      {
        $match: {
          status: status,
          deleteFile: status === "active" ? false : true
        }
      },
      {
        $lookup: {
          from: "applicantdetails",
          localField: "_id",
          foreignField: "customerId",
          as: "applicantDetails",
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "employeId",
          foreignField: "_id",
          as: "employeeDetails",
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "employeeDetails.reportingManagerId",
          foreignField: "_id",
          as: "reportingManagerDetails",
        },
      },
      {
        $lookup: {
          from: "newbranches",
          localField: "employees.branchId",
          foreignField: "_id",
          as: "branchDetails",
        },
      },
      {
        $lookup: {
          from: "processes",
          localField: "_id",
          foreignField: "customerId",
          as: "processDetails",
        },
      },
      {
        $lookup: {
          from: "externalvendordynamics",
          localField: "_id",
          foreignField: "customerId",
          as: "externalvendordyDetail",
        },
      },
      {
        $lookup: {
          from: "cibildetails",
          localField: "_id",
          foreignField: "customerId",
          as: "cibilDetails",
        },
      },
      {
        $project: {
          finNo: "$customerFinId",
          loginDate: "$createdAt",
          month: { $month: "$createdAt" },
          branch: { $arrayElemAt: ["$branchDetails.name", 0] },
          applicantName: { $arrayElemAt: ["$applicantDetails.fullName", 0] },
          applicantFatherName: { $arrayElemAt: ["$applicantDetails.fatherName", 0] },
          applicantMobileNo: { $arrayElemAt: ["$applicantDetails.mobileNo", 0] },
          mobileNo: "$mobileNo",
          salesPersonName: { $arrayElemAt: ["$employeeDetails.employeName", 0] },
          reportingPersonName: { $arrayElemAt: ["$reportingManagerDetails.employeName", 0] },
          orderId: "$orderId",
          paymentDate: {
            $ifNull: ["$paymentDate", "$updatedAt"],
          },
          paymentStatus: "$paymentStatus",
          fileStatus: {
            $switch: {
              branches: [
                // PAYMENT PENDING
                {
                  case: { $ne: ["$paymentStatus", "success"] },
                  then: "PAYMENT PENDING"
                },
                // SALES PENDING
                {
                  case: {
                    $and: [
                      { $eq: ["$paymentStatus", "success"] },
                      {
                        $or: [
                          { $ne: [{ $arrayElemAt: ["$processDetails.applicantFormComplete", 0] }, true] },
                          { $ne: [{ $arrayElemAt: ["$processDetails.coApplicantFormComplete", 0] }, true] },
                          { $ne: [{ $arrayElemAt: ["$processDetails.guarantorFormComplete", 0] }, true] }
                        ]
                      }
                    ]
                  },
                  then: "SALES PENDING"
                },
                // LOGIN DONE
                {
                  case: {
                    $and: [
                      { $eq: ["$paymentStatus", "success"] },
                      { $eq: [{ $arrayElemAt: ["$processDetails.customerFormComplete", 0] }, true] },
                      { $eq: [{ $arrayElemAt: ["$processDetails.applicantFormComplete", 0] }, true] },
                      { $eq: [{ $arrayElemAt: ["$processDetails.coApplicantFormComplete", 0] }, true] },
                      { $eq: [{ $arrayElemAt: ["$processDetails.guarantorFormComplete", 0] }, true] },
                      { $eq: [{ $arrayElemAt: ["$processDetails.applicantFormStart", 0] }, true] },
                      { $eq: [{ $arrayElemAt: ["$processDetails.coApplicantFormStart", 0] }, true] },
                      { $eq: [{ $arrayElemAt: ["$processDetails.guarantorFormStart", 0] }, true] },
                      {
                        $in: [
                          { $arrayElemAt: ["$processDetails.statusByCibil", 0] },
                          ["incomplete", "pending"]
                        ]
                      }
                    ]
                  },
                  then: "LOGIN DONE"
                },
                // LOGIN PENDENCY
                {
                  case: {
                    $and: [
                      { $eq: ["$paymentStatus", "success"] },
                      {
                        $or: [
                          { $eq: [{ $arrayElemAt: ["$processDetails.applicantFormStart", 0] }, false] },
                          { $eq: [{ $arrayElemAt: ["$processDetails.coApplicantFormStart", 0] }, false] },
                          { $eq: [{ $arrayElemAt: ["$processDetails.guarantorFormStart", 0] }, false] }
                        ]
                      },
                      { $eq: [{ $arrayElemAt: ["$processDetails.statusByCibil", 0] }, "pending"] }
                    ]
                  },
                  then: "LOGIN PENDENCY"
                },

                // CIBIL REJECTED

                {
                  case: {
                    $and: [{ $eq: [{ $arrayElemAt: ["$processDetails.statusByCibil", 0] }, "rejected"] }
                    ]
                  },
                  then: "CIBIL REJECTED"
                },

                // CIBIL DONE
                //  {
                //   case: {
                //     $and: [{ $eq: [{ $arrayElemAt: ["$processDetails.statusByCibil", 0] }, "complete"] }
                //     ]
                //   },
                //   then: "CIBIL DONE"
                // },

                // PD WIP

                {
                  case: {
                    $and: [
                      { $eq: [{ $arrayElemAt: ["$externalvendordyDetail.fileStatus", 0] }, "active"] },
                      { $eq: [{ $arrayElemAt: ["$externalvendordyDetail.creditPdId", 0] }, null] }
                    ]
                  },
                  then: "PD PENDING"
                },


                {
                  case: {
                    $and: [
                      { $eq: [{ $arrayElemAt: ["$externalvendordyDetail.fileStatus", 0] }, "active"] },
                      { $ne: [{ $arrayElemAt: ["$externalvendordyDetail.creditPdId", 0] }, null] },
                      {
                        $in: [
                          { $arrayElemAt: ["$externalvendordyDetail.statusByCreditPd", 0] },
                          ["WIP", "accept", "incomplete", "pending", "rivert"]
                        ]
                      }
                    ]
                  },
                  then: "PD WIP"
                },

                //PD DONE
                {
                  case: {
                    $and: [
                      { $eq: [{ $arrayElemAt: ["$externalvendordyDetail.fileStatus", 0] }, "active"] },
                      { $ne: [{ $arrayElemAt: ["$externalvendordyDetail.creditPdId", 0] }, null] },
                      {
                        $in: [
                          { $arrayElemAt: ["$externalvendordyDetail.statusByCreditPd", 0] },
                          ["complete", "approve"]
                        ]
                      }
                    ]
                  },
                  then: "PD DONE"
                },

                // PD REJECTED
                {
                  case: {
                    $and: [
                      { $ne: [{ $arrayElemAt: ["$externalvendordyDetail.creditPdId", 0] }, null] },
                      {
                        $in: [
                          { $arrayElemAt: ["$externalvendordyDetail.statusByCreditPd", 0] },
                          ["reject", "rejectByApprover"]
                        ]
                      }
                    ]
                  },
                  then: "PD REJECTED"
                },
              ],
              default: "SATGE NOT FIND"
            },
          },
          assignIn: {
            $cond: {
              if: { $gt: [{ $size: "$processDetails" }, 0] },
              then: { $arrayElemAt: ["$processEmployeeDetails.employeName", 0] },
              else: { $arrayElemAt: ["$employeeDetails.employeName", 0] }
            }
          }
        },
        //   fileStatus: {
        //     $switch: {
        //       branches: [
        //         // PAYMENT PENDING
        //         {
        //           case: { $ne: ["$paymentStatus", "success"] },
        //           then: "PAYMENT PENDING"
        //         },

        //         // Check SALES PENDING
        //         {
        //           case: { $eq: ["$paymentStatus", "success"] },
        //           then: "SALES PENDING",
        //         },

        //       ],
        //     },
        //   },
        //   assignIn : "$employeeDetails.employeName"
        // },
      },
    ]);

    success(res, "Files List", { count: allFiles.length, data: allFiles });
  } catch (error) {
    console.error("Error fetching details:", error.message);
    return unknownError(res, "An error occurred while fetching the details", error);
  }
}


async function fileReportingDelete(req, res) {
  try {
    const { status, customerId } = req.query;


    const employee = await employeeModel.findById(req.Id, { status: "active" }).populate("roleId");

    if (!employee) {
      return badRequest(res, "Employee Nof Found");
    }

    // console.log('employee.roleId---', employee.roleId)

    const allowedRoles = ["admin", "ceo"];
    const hasPermission = employee.roleId.some(role => allowedRoles.includes(role.roleName));

    if (!hasPermission) {
      return badRequest(res, "Unauthorized Access");
    }

    if (!status) {
      return badRequest(res, "Status Is Required");
    }

    if (status !== "active" && status !== "inactive") {
      return badRequest(res, "Status Must Be Either 'active' or 'inactive'.");
    }

    if (!customerId) {
      return badRequest(res, "Customer ID Is Required.");
    }

    // Update customerModel
    await customerModel.findByIdAndUpdate(
      customerId,
      {
        status: status === "inactive" ? "inactive" : "active",
        deleteFile: status === "inactive" ? true : false
      },
      { new: true }
    );

    // Update processModel by customerId
    await processModel.updateMany(
      { customerId },
      { status, deleteFile: status === "inactive" ? true : false },
      { new: true }
    );

    // Update externalManagerModel if customer has an external fid reference
    await externalManagerModel.updateMany(
      { customerId },
      { fileStatus: status === "inactive" ? "inactive" : "active" },
      { new: true }
    );

    success(res, `File ${status === "inactive" ? "deleted" : "active again"}.`);

  } catch (error) {
    console.error("Error fetching details:", error.message);
    return unknownError(res, "error", error);
  }
}



async function upDateFunction(req, res) {
  try {
    // Find all documents
    console.log("Starting URL update process...")
    const documents = await salesCaseModel.find();

    if (documents.length === 0) {
      return success(res, "No documents found to update.");
    }

    let totalModified = 0;
    let totalDocuments = documents.length;

    // Process each document individually for better error handling
    for (const doc of documents) {
      try {
        const updates = {};
        const docObject = doc.toObject(); // Convert to plain object for easier manipulation

        // Special handling for propertyPhotos array which is in the example but not in the schema
        if (Array.isArray(docObject.propertyPhotos)) {
          const updatedArray = docObject.propertyPhotos.map(item => {
            if (typeof item === 'string' && item.startsWith('/uploads')) {
              return item.replace('/uploads', 'https://prod.fincooper.in/uploads');
            }
            return item;
          });

          if (JSON.stringify(updatedArray) !== JSON.stringify(docObject.propertyPhotos)) {
            updates.propertyPhotos = updatedArray;
          }
        }

        // Handle image fields that might contain URLs
        const imageFields = [
          'selfiWithCustomer', 'photoWithLatLong', 'front', 'leftSide',
          'rightSide', 'approachRoad', 'mainRoad', 'interiorRoad',
          'property.bankStatementPhoto'
        ];

        // Handle array fields that might contain URLs
        const topLevelArrayImageFields = [
          'agriculturePhotos', 'milkPhotos', 'animalPhotos',
          'last3MonthSalarySlipPhotos', 'salaryPhotos',
          'incomeOtherImages', 'incomePhotos', 'propertyOtherPhotos',
          'incomeDocuments', 'propetyDocuments'
        ];

        // Process single image fields
        for (const field of imageFields) {
          const paths = field.split('.');

          // Handle nested fields
          if (paths.length > 1) {
            if (docObject[paths[0]] && docObject[paths[0]][paths[1]] &&
              typeof docObject[paths[0]][paths[1]] === 'string' &&
              docObject[paths[0]][paths[1]].startsWith('/uploads')) {
              updates[`${paths[0]}.${paths[1]}`] = docObject[paths[0]][paths[1]].replace(
                '/uploads', 'https://prod.fincooper.in/uploads'
              );
            }
          } else {
            // Handle top-level fields
            if (docObject[field] && typeof docObject[field] === 'string' &&
              docObject[field].startsWith('/uploads')) {
              updates[field] = docObject[field].replace('/uploads', 'https://prod.fincooper.in/uploads');
            }
          }
        }

        // Process top-level array image fields
        for (const field of topLevelArrayImageFields) {
          if (Array.isArray(docObject[field])) {
            const updatedArray = docObject[field].map(item => {
              if (typeof item === 'string' && item.startsWith('/uploads')) {
                return item.replace('/uploads', 'https://prod.fincooper.in/uploads');
              }
              return item;
            });

            if (JSON.stringify(updatedArray) !== JSON.stringify(docObject[field])) {
              updates[field] = updatedArray;
            }
          }
        }

        // Special handling for incomeSource array with nested photo arrays
        if (Array.isArray(docObject.incomeSource)) {
          const incomeSourceUpdates = [];
          let hasIncomeSourceUpdates = false;

          docObject.incomeSource.forEach((source, sourceIndex) => {
            const updatedSource = { ...source };

            // Handle agricultureBusiness
            if (source.agricultureBusiness &&
              Array.isArray(source.agricultureBusiness.agriculturePhotos)) {
              const updatedPhotos = source.agricultureBusiness.agriculturePhotos.map(photo => {
                if (typeof photo === 'string' && photo.startsWith('/uploads')) {
                  return photo.replace('/uploads', 'https://prod.fincooper.in/uploads');
                }
                return photo;
              });

              if (JSON.stringify(updatedPhotos) !==
                JSON.stringify(source.agricultureBusiness.agriculturePhotos)) {
                if (!updatedSource.agricultureBusiness) {
                  updatedSource.agricultureBusiness = {};
                }
                updatedSource.agricultureBusiness.agriculturePhotos = updatedPhotos;
                hasIncomeSourceUpdates = true;
              }
            }

            // Handle milkBusiness
            if (source.milkBusiness) {
              // Handle milkPhotos
              if (Array.isArray(source.milkBusiness.milkPhotos)) {
                const updatedPhotos = source.milkBusiness.milkPhotos.map(photo => {
                  if (typeof photo === 'string' && photo.startsWith('/uploads')) {
                    return photo.replace('/uploads', 'https://prod.fincooper.in/uploads');
                  }
                  return photo;
                });

                if (JSON.stringify(updatedPhotos) !==
                  JSON.stringify(source.milkBusiness.milkPhotos)) {
                  if (!updatedSource.milkBusiness) {
                    updatedSource.milkBusiness = {};
                  }
                  updatedSource.milkBusiness.milkPhotos = updatedPhotos;
                  hasIncomeSourceUpdates = true;
                }
              }

              // Handle animalPhotos
              if (Array.isArray(source.milkBusiness.animalPhotos)) {
                const updatedPhotos = source.milkBusiness.animalPhotos.map(photo => {
                  if (typeof photo === 'string' && photo.startsWith('/uploads')) {
                    return photo.replace('/uploads', 'https://prod.fincooper.in/uploads');
                  }
                  return photo;
                });

                if (JSON.stringify(updatedPhotos) !==
                  JSON.stringify(source.milkBusiness.animalPhotos)) {
                  if (!updatedSource.milkBusiness) {
                    updatedSource.milkBusiness = {};
                  }
                  updatedSource.milkBusiness.animalPhotos = updatedPhotos;
                  hasIncomeSourceUpdates = true;
                }
              }
            }

            // Handle salaryIncome
            if (source.salaryIncome) {
              // Handle last3MonthSalarySlipPhotos
              if (Array.isArray(source.salaryIncome.last3MonthSalarySlipPhotos)) {
                const updatedPhotos = source.salaryIncome.last3MonthSalarySlipPhotos.map(photo => {
                  if (typeof photo === 'string' && photo.startsWith('/uploads')) {
                    return photo.replace('/uploads', 'https://prod.fincooper.in/uploads');
                  }
                  return photo;
                });

                if (JSON.stringify(updatedPhotos) !==
                  JSON.stringify(source.salaryIncome.last3MonthSalarySlipPhotos)) {
                  if (!updatedSource.salaryIncome) {
                    updatedSource.salaryIncome = {};
                  }
                  updatedSource.salaryIncome.last3MonthSalarySlipPhotos = updatedPhotos;
                  hasIncomeSourceUpdates = true;
                }
              }

              // Handle bankStatementPhoto
              if (source.salaryIncome.bankStatementPhoto &&
                typeof source.salaryIncome.bankStatementPhoto === 'string' &&
                source.salaryIncome.bankStatementPhoto.startsWith('/uploads')) {
                if (!updatedSource.salaryIncome) {
                  updatedSource.salaryIncome = {};
                }
                updatedSource.salaryIncome.bankStatementPhoto = source.salaryIncome.bankStatementPhoto
                  .replace('/uploads', 'https://prod.fincooper.in/uploads');
                hasIncomeSourceUpdates = true;
              }

              // Handle salaryPhotos
              if (Array.isArray(source.salaryIncome.salaryPhotos)) {
                const updatedPhotos = source.salaryIncome.salaryPhotos.map(photo => {
                  if (typeof photo === 'string' && photo.startsWith('/uploads')) {
                    return photo.replace('/uploads', 'https://prod.fincooper.in/uploads');
                  }
                  return photo;
                });

                if (JSON.stringify(updatedPhotos) !==
                  JSON.stringify(source.salaryIncome.salaryPhotos)) {
                  if (!updatedSource.salaryIncome) {
                    updatedSource.salaryIncome = {};
                  }
                  updatedSource.salaryIncome.salaryPhotos = updatedPhotos;
                  hasIncomeSourceUpdates = true;
                }
              }
            }

            // Handle other
            if (source.other) {
              // Handle incomeOtherImages
              if (Array.isArray(source.other.incomeOtherImages)) {
                const updatedPhotos = source.other.incomeOtherImages.map(photo => {
                  if (typeof photo === 'string' && photo.startsWith('/uploads')) {
                    return photo.replace('/uploads', 'https://prod.fincooper.in/uploads');
                  }
                  return photo;
                });

                if (JSON.stringify(updatedPhotos) !==
                  JSON.stringify(source.other.incomeOtherImages)) {
                  if (!updatedSource.other) {
                    updatedSource.other = {};
                  }
                  updatedSource.other.incomeOtherImages = updatedPhotos;
                  hasIncomeSourceUpdates = true;
                }
              }

              // Handle incomePhotos
              if (Array.isArray(source.other.incomePhotos)) {
                const updatedPhotos = source.other.incomePhotos.map(photo => {
                  if (typeof photo === 'string' && photo.startsWith('/uploads')) {
                    return photo.replace('/uploads', 'https://prod.fincooper.in/uploads');
                  }
                  return photo;
                });

                if (JSON.stringify(updatedPhotos) !==
                  JSON.stringify(source.other.incomePhotos)) {
                  if (!updatedSource.other) {
                    updatedSource.other = {};
                  }
                  updatedSource.other.incomePhotos = updatedPhotos;
                  hasIncomeSourceUpdates = true;
                }
              }
            }

            // If this source was updated, add it to our updates
            incomeSourceUpdates.push(updatedSource);
          });

          // If any income source was updated, update the whole array
          if (hasIncomeSourceUpdates) {
            updates['incomeSource'] = incomeSourceUpdates;
          }
        }

        // Deep scan for any other fields that might contain image URLs
        // This recursively checks all object properties for any we might have missed
        const processedPaths = new Set([
          ...imageFields,
          ...topLevelArrayImageFields,
          'incomeSource', // Skip because we handled it specially
          'propertyPhotos' // Skip because we handled it specially
        ]);

        const scanObjectForUrls = (obj, currentPath = '') => {
          if (!obj || typeof obj !== 'object') return;

          for (const [key, value] of Object.entries(obj)) {
            const newPath = currentPath ? `${currentPath}.${key}` : key;

            // Skip fields we've already processed
            if (processedPaths.has(newPath)) {
              continue;
            }

            if (typeof value === 'string' && value.startsWith('/uploads')) {
              updates[newPath] = value.replace('/uploads', 'https://prod.fincooper.in/uploads');
              processedPaths.add(newPath);
            } else if (Array.isArray(value)) {
              const updatedArray = value.map(item => {
                if (typeof item === 'string' && item.startsWith('/uploads')) {
                  return item.replace('/uploads', 'https://prod.fincooper.in/uploads');
                }
                return item;
              });

              if (JSON.stringify(updatedArray) !== JSON.stringify(value)) {
                updates[newPath] = updatedArray;
                processedPaths.add(newPath);
              }
            } else if (value && typeof value === 'object') {
              scanObjectForUrls(value, newPath);
            }
          }
        };

        scanObjectForUrls(docObject);

        // Perform update if needed
        if (Object.keys(updates).length > 0) {
          await salesCaseModel.updateOne({ _id: doc._id }, { $set: updates });
          totalModified++;
          console.log(`Updated document ${doc._id} with fields:`, Object.keys(updates));
        }
      } catch (err) {
        console.error(`Error updating document ${doc._id}:`, err.message);
        // Continue with other documents
      }
    }

    return success(res, "Data updated successfully.", {
      totalDocuments,
      modifiedDocuments: totalModified
    });
  } catch (error) {
    console.error("Error details:", error.message);
    return unknownError(res, error.message);
  }
}


async function aplicantModelDateUpdate(req, res) {
  try {
    const applicantDetail = await directJoiningModel.find({
      $or: [{ updatedDate: null }, { updatedDate: "" }],
    });;

    // Map through applicants and update them in parallel
    const updatePromises = applicantDetail.map((applicant) => {
      const _id = applicant._id;
      const formattedDate = moment(applicant.updatedAt).format("YYYY-MM-DDTHH:mm:ss A");

      return directJoiningModel.findByIdAndUpdate(
        _id,
        { updatedDate: formattedDate },
        { new: true }
      );
    });

    // Wait for all updates to complete
    const updatedApplicants = await Promise.all(updatePromises);

    // Return the list of updated applicants
    return success(res, "Updated coApplicantModel' dates", updatedApplicants);
  } catch (error) {
    console.error("Error fetching details:", error.message);
    return unknownError(res, "Error updating applicants", error);
  }
}




async function updateSalesCompleteDate(req, res) {
  try {
    // Define date format
    const dateFormat = "YYYY-MM-DDTHH:mm:ss A";

    // Today's start and end time in required format
    const todayStart = moment().startOf("day").format(dateFormat);
    const todayEnd = moment().endOf("day").format(dateFormat);

    const matchQuery = {
      statusByCreditPd: "reject",
      fileStatus: "active",
      creditPdCompleteDate: {
        $gte: todayStart,
        $lte: todayEnd,
      },
    };


    const rejectFileToday = await externalManagerModel.aggregate([
      {
        $match: matchQuery,
      },
      {
        $lookup: {
          from: "pdformdatas",
          localField: "customerId",
          foreignField: "customerId",
          as: "pdModelDetails",
        },
      },
      { $unwind: { path: "$pdModelDetails", preserveNullAndEmptyArrays: true } },

      { $sort: { "pdModelDetails._id": -1 } },

      {
        $lookup: {
          from: "customerdetails",
          localField: "customerId",
          foreignField: "_id",
          as: "customerdetailData",
        },
      },
      { $unwind: { path: "$customerdetailData", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "applicantdetails",
          localField: "customerId",
          foreignField: "customerId",
          as: "applicantdetailsData",
        },
      },
      { $unwind: { path: "$applicantdetailsData", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "employees",
          localField: "customerdetailData.employeId",
          foreignField: "_id",
          as: "employeeDetails",
        },
      },
      { $unwind: { path: "$employeeDetails", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "newbranches",
          localField: "customerdetailData.branch",
          foreignField: "_id",
          as: "newbrancheDetails",
        },
      },
      { $unwind: { path: "$newbrancheDetails", preserveNullAndEmptyArrays: true } },

      {
        $group: {
          _id: "$customerdetailData._id",
          branchName: { $first: "$newbrancheDetails.name" },
          customerName: { $first: "$applicantdetailsData.fullName" },
          customerFinId: { $first: "$customerdetailData.customerFinId" },
          pdrejectRemark: { $first: "$pdModelDetails.reasonForReject" },
          creditPdCompleteDate: { $first: "$creditPdCompleteDate" },
        },
      },

      {
        $project: {
          _id: 0,
          branchName: 1,
          customerFinId: 1,
          customerName: 1,
          pdrejectRemark: 1,
          creditPdCompleteDate: 1,
        },
      },

      { $sort: { branchName: -1 } },
    ]);

    console.log("match data ----", matchQuery);

    return success(res, "rejectFileToday", rejectFileToday);
  } catch (error) {
    console.error("Error updating all :", error.message);
    return unknownError(res, "Error updating ", error);
  }
}



async function updateAllCustomerBranches(req, res) {
  try {
    const customers = await customerModel.find({});

    for (let customer of customers) {
      if (customer.employeId) {
        const employee = await employeeModel.findOne({ _id: customer.employeId });

        if (employee && employee.branchId) {
          if (String(customer.branch) !== String(employee.branchId)) {
            customer.branch = employee.branchId;
            await customer.save();
            console.log(`Customer ${customer._id} branch updated successfully.`);
          }
        }
      }
    }

    res.status(200).json({ message: "All customer branches updated successfully" });
  } catch (error) {
    console.error("Error updating customer branches:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}


async function updateApplicantDatafromPdModel(req, res) {
  try {
    // Fetch all applicants from applicantModel
    const applicants = await applicantModel.find();

    if (!applicants || applicants.length === 0) {
      return res.status(404).json({ message: "No applicants found to update." });
    }

    for (let applicant of applicants) {
      const customerId = applicant.customerId;

      // Fetch PD data for the current customerId
      const pdData = await pdModel.findOne({ customerId });

      // Extract applicant and guarantor data (or set empty values if not found)
      const applicantData = pdData?.applicant || {};
      const guarantorData = pdData?.guarantor || {};

      // Update applicantModel
      const updatedApplicant = await applicantModel.updateOne(
        { customerId },
        {
          $set: {
            applicantType: applicantData?.applicantType || "",
            businessType: applicantData?.businessType || "",
            occupation: applicantData?.occupation || "",
            houseLandMark: applicantData?.houseLandMark || "",
            alternateMobileNo: applicantData?.alternateMobileNo || "",
            noOfyearsAtCurrentAddress: applicantData?.noOfyearsAtCurrentAddress || "",
            nationality: applicantData?.nationality || "",
            noOfDependentWithCustomer: applicantData?.noOfDependentWithCustomer || "",
            educationalDetails: applicantData?.educationalDetails || "",
            residenceType: applicantData?.residenceType || ""
          }
        }
      );

      if (updatedApplicant.modifiedCount > 0) {
        console.log(`Updated applicant for customerId: ${customerId}`);
      } else {
        console.log(`No update needed for applicant with customerId: ${customerId}`);
      }

      // Update guarantorModel
      const updatedGuarantor = await guarantorModel.updateOne(
        { customerId },
        {
          $set: {
            guarantorType: guarantorData?.guarantorType || "",
            businessType: guarantorData?.businessType || "",
            occupation: guarantorData?.occupation || "",
            houseLandMark: guarantorData?.houseLandMark || "",
            alternateMobileNo: guarantorData?.alternateMobileNo || "",
            noOfyearsAtCurrentAddress: guarantorData?.noOfyearsAtCurrentAddress || "",
            nationality: guarantorData?.nationality || "",
            educationalDetails: guarantorData?.educationalDetails || "",
            residenceType: guarantorData?.residenceType || ""
          }
        }
      );

      if (updatedGuarantor.modifiedCount > 0) {
        console.log(`Updated guarantor for customerId: ${customerId}`);
      } else {
        console.log(`No update needed for guarantor with customerId: ${customerId}`);
      }
    }

    return res.status(200).json({ message: "Applicants and Guarantor data updated successfully." });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating applicant and guarantor data", error: err });
  }
}

async function updateCoApplicantDatafromPdModel(req, res) {
  try {
    // Fetch all coApplicants from coApplicantModel
    const coApplicants = await coApplicantModel.find();

    if (!coApplicants || coApplicants.length === 0) {
      return res.status(404).json({ message: "No coApplicants found to update." });
    }

    // Group coApplicants by customerId
    const customerCoApplicantsMap = {};
    coApplicants.forEach(coApplicant => {
      if (!customerCoApplicantsMap[coApplicant.customerId]) {
        customerCoApplicantsMap[coApplicant.customerId] = [];
      }
      customerCoApplicantsMap[coApplicant.customerId].push(coApplicant);
    });

    for (const customerId of Object.keys(customerCoApplicantsMap)) {
      // Fetch PD data for the current customerId
      const pdData = await pdModel.findOne({ customerId });

      // Get coApplicants from pdModel (or empty array if not found)
      const pdCoApplicants = pdData?.co_Applicant || [];

      const updates = customerCoApplicantsMap[customerId].map((coApplicant, index) => {
        // Fetch the corresponding coApplicant data from pdModel by index
        const coApplicantData = pdCoApplicants[index] || {};

        return {
          updateOne: {
            filter: { _id: coApplicant._id }, // Match the specific coApplicant
            update: {
              $set: {
                coApplicantType: coApplicantData?.coApplicantType || "",
                businessType: coApplicantData?.businessType || "",
                occupation: coApplicantData?.occupation || "",
                houseLandMark: coApplicantData?.houseLandMark || "",
                alternateMobileNo: coApplicantData?.alternateMobileNo || "",
                noOfyearsAtCurrentAddress: coApplicantData?.noOfyearsAtCurrentAddress || "",
                educationalDetails: coApplicantData?.educationalDetails || "",
                residenceType: coApplicantData?.residenceType || ""
              }
            }
          }
        };
      });

      // Perform bulk update
      if (updates.length > 0) {
        await coApplicantModel.bulkWrite(updates);
        console.log(`Updated coApplicants for customerId: ${customerId}`);
      } else {
        console.log(`No coApplicants updated for customerId: ${customerId}`);
      }
    }

    return res.status(200).json({ message: "Co-Applicant data updated successfully." });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating co-Applicant data", error: err });
  }
}



async function aplicantModelGenderGetUnique(req, res) {
  try {
    const getGenderCounts = async (model) => {
      return await model.aggregate([
        {
          $group: {
            _id: "$gender", // Group by gender
            count: { $sum: 1 } // Count occurrences
          }
        },
        {
          $sort: { count: -1 } // Sort by count in descending order
        },
        {
          $group: {
            _id: null,
            variations: {
              $push: {
                gender: "$_id",
                count: "$count"
              }
            }
          }
        }
      ]);
    };

    const getrelationWithApplicantCounts = async (model) => {
      return await model.aggregate([
        {
          $group: {
            _id: "$relationWithApplicant", // Group by relation with applicant
            count: { $sum: 1 } // Count occurrences
          }
        },
        {
          $sort: { count: -1 } // Sort by count in descending order
        },
        {
          $group: {
            _id: null,
            variations: {
              $push: {
                relationWithApplicant: "$_id",
                count: "$count"
              }
            }
          }
        }
      ]);
    };

    // Fetch gender variations and counts for each model
    const applicantGenders = await getGenderCounts(applicantModel);
    const coApplicantGenders = await getGenderCounts(coApplicantModel);
    const guarantorGenders = await getGenderCounts(guarantorModel);

    const coApplicantrelationWithApplicantCounts = await getrelationWithApplicantCounts(coApplicantModel);
    const guarantorrelationWithApplicantCounts = await getrelationWithApplicantCounts(guarantorModel);

    // Structure response data properly
    const resAllData = {
      applicant: applicantGenders.length > 0 ? applicantGenders[0].variations : [],
      coApplicant: coApplicantGenders.length > 0 ? coApplicantGenders[0].variations : [],
      guarantor: guarantorGenders.length > 0 ? guarantorGenders[0].variations : [],
      coApplicantrelationWithApplicant: coApplicantrelationWithApplicantCounts.length > 0 ? coApplicantrelationWithApplicantCounts[0].variations : [],
      guarantorrelationWithApplicant: guarantorrelationWithApplicantCounts.length > 0 ? guarantorrelationWithApplicantCounts[0].variations : [],
    };

    return success(res, "Gender variations with count", { data: resAllData });

  } catch (error) {
    console.error("Error fetching gender details:", error.message);
    return unknownError(res, "Error fetching gender details", error);
  }
}



async function processCashfreePayment(req, res) {
  try {
    const headers = {
      "Content-Type": "application/json",
      "x-api-version": "2023-08-01",
    };

    const data = {
      payment_session_id: req.body.payment_session_id,
      payment_method: {
        upi: {
          channel: "link",
          upi_redirect_url: false,
          upi_expiry_minutes: req.body.upi_expiry_minutes || 5
        }
      }
    };

    const response = await axios.post("https://api.cashfree.com/pg/orders/sessions", data, { headers });

    return success(res, response.data);
  } catch (error) {
    console.error("Error processing Cashfree payment:", error.response?.data || error.message);
    return unknownError(res, error.response?.data?.message || "Error processing Cashfree payment");
  }
}


const getPdRejectFilesData = async (req, res) => {
  try {
    const results = await externalManagerModel.aggregate([
      {
        $match: {
          statusByCreditPd: 'reject'
        }
      },
      {
        $lookup: {
          from: 'applicantdetails', // collection name for applicantModel
          localField: 'customerId',
          foreignField: 'customerId',
          as: 'applicant'
        }
      },
      {
        $unwind: '$applicant'
      },
      {
        $lookup: {
          from: 'customerdetails', // collection name for customerModel
          localField: 'customerId',
          foreignField: '_id',
          as: 'customer'
        }
      },
      {
        $unwind: '$customer'
      },
      {
        $project: {
          _id: 0,
          customerId: 1,
          customerFinId: '$customer.customerFinId',
          fullName: '$applicant.fullName',
          panNo: '$applicant.panNo',
          aadharNo: '$applicant.aadharNo',
          pinCode: '$applicant.permanentAddress.pinCode',
          addressLine1: '$applicant.permanentAddress.addressLine1',
          addressLine2: '$applicant.permanentAddress.addressLine2',
        }
      }
    ]);

    res.status(200).json(results);
  } catch (error) {
    console.error('Aggregation error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getPdRejectFilesData,
  loginFeesDetail,
  createDraftLoginFees,
  newcreateDraftLoginFees,
  createDraftLoginFeesList,
  paymentInitiate,
  paymentWebhookCall,
  paymentVerify,
  getPermissionFormByCustomerId,
  getCustomerDetail,
  customerDetail,
  // applicantAddDetail,
  // coApplicantAddDetail,
  // guarantorAddDetail,
  applicantDetail,
  coApplicantDetail,
  guarantorDetail,
  addReferenceDetail,
  referenceDetail,
  bankAddDetail,
  bankDetail,
  addSalesCaseDetail,
  salesDetail,
  allCustomers,
  allFormsCount,
  multipleDataDeleteById,
  getLeadCustomer,
  getNameAppAndCoApp,
  allKYCDataGet,
  customerGetAllDocument,
  deleteApplicantForm,
  deleteCoApplicantForm,
  deleteguarantorForm,
  deletereferenceForm,
  deletebankForm,
  deleteSalesCaseForm,
  salesAllFormCount,
  ProductLoginList,
  saleManagerProductList,
  allProductLoginlist,
  saleManagerAllProductList,
  allProductLoginlistWithoutFilter,
  deleteByCustomerFinId,
  findStatus,
  findEmployeeNameByFinId,
  PaymentAll,
  viewPaymentAll,
  CashFreePaymentInitiate,
  CashFreePaymentVerify,
  cashfreeWebhook,
  handleCashFreePaymentSuccess,
  updateCustomerBranch,
  fetchAllOrders,
  checkAndSetInactiveStatus,
  getAppCoAppAndGTR,
  Images,
  fileReportTracking,
  fileReportingDelete,
  upDateFunction,
  applicantAddDetailJson,
  coApplicantAddDetailJson,
  guarantorAddDetailJson,
  aplicantModelDateUpdate,
  updateSalesCompleteDate,
  CashFreePaymentLink,
  updateAllCustomerBranches,
  customerBranchUpdate,
  updateApplicantDatafromPdModel,
  updateCoApplicantDatafromPdModel,
  aplicantModelGenderGetUnique,
  processCashfreePayment,
  newCustomerDetail,
  addApplicant,
  addCoApplicant,
  addGuarantor,
  generateUniqueCustomerFinId,
};
