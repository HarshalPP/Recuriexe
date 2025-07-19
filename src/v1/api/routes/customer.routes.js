const express = require("express");
const router = express.Router();
const { upload } = require("../../../../Middelware/multer");
const {addLoanSathiController,changeLoanSathiPasswordController,deactivateLoanSathiController,
  getLoanSathiByIdController,getLoanSathiBySalesPersonController,loginLoanSathiController,
  updateLoanSathiController  } = require('../controller/loanSathi.controller')
const salesLogin = require("./salesLogin.router");
const path = require("path");

function generateMulterFields(numFields) {
  const fields = [];
  for (let i = 0; i < numFields; i++) {
    fields.push({ name: `bankDetails[${i}][bankStatement]`, maxCount: 10 });
  }
  return fields;
}

const numFields = 10;
const cpUpload = upload.fields(generateMulterFields(numFields));

const applicantUploads = upload.fields([
  { name: "applicantPhoto", maxCount: 1 },
  { name: "aadharFrontImage", maxCount: 1 },
  { name: "aadharBackImage", maxCount: 1 },
  { name: "panFrontImage", maxCount: 1 },
  { name: "ocrAadharFrontImage", maxCount: 1 },
  { name: "ocrAadharBackImage", maxCount: 1 },
  { name: "drivingLicenceImage", maxCount: 1 },
  { name: "voterIdImage", maxCount: 1 },
  // { name: "testingFile", maxCount: 1 },
]);

const coApplicantUploads = upload.fields([
  { name: "coApplicantPhoto", maxCount: 1 },
  { name: "aadharFrontImage", maxCount: 1 },
  { name: "aadharBackImage", maxCount: 1 },
  { name: "docImage", maxCount: 1 },
  { name: "ocrAadharFrontImage", maxCount: 1 },
  { name: "ocrAadharBackImage", maxCount: 1 },
]);

const guarantorUploads = upload.fields([
  { name: "guarantorPhoto", maxCount: 1 },
  { name: "coApplicantPhoto", maxCount: 1 },
  { name: "aadharFrontImage", maxCount: 1 },
  { name: "aadharBackImage", maxCount: 1 },
  { name: "docImage", maxCount: 1 },
  { name: "ocrAadharFrontImage", maxCount: 1 },
  { name: "ocrAadharBackImage", maxCount: 1 },
]);

const salesUplodas = upload.fields([
  { name: "milkPhotos", maxCount: 10 },
  { name: "incomePhotos", maxCount: 20 },
  { name: "animalPhotos", maxCount: 10 },
  { name: "last3MonthSalarySlipPhotos", maxCount: 3 },
  { name: "bankStatementPhoto", maxCount: 1 },
  { name: "salaryPhotos", maxCount: 5 },
  { name: "agriculturePhotos", maxCount: 20 },
  { name: "selfiWithCustomer", maxCount: 1 },
  { name: "photoWithLatLong", maxCount: 1 },
  { name: "front", maxCount: 1 },
  { name: "leftSide", maxCount: 1 },
  { name: "rightSide", maxCount: 1 },
  { name: "approachRoad", maxCount: 1 },
  { name: "mainRoad", maxCount: 1 },
  { name: "interiorRoad", maxCount: 1 },
  { name: "propertyPhotos", maxCount: 10 },
  { name: "propertyOtherPhotos", maxCount: 10 },
  { name: "propetyDocuments", maxCount: 10 },
  { name: "incomeDocuments", maxCount: 10 },
  {name:"incomeOtherImages",maxCount:5}

])

const {  createDraftLoginFees , newcreateDraftLoginFees , loginFeesDetail ,  createDraftLoginFeesList , paymentInitiate, paymentWebhookCall , paymentVerify ,getPermissionFormByCustomerId, getCustomerDetail , allCustomers , allFormsCount,
  // applicantAddDetail , coApplicantAddDetail , guarantorAddDetail ,
   applicantAddDetailJson , coApplicantAddDetailJson , guarantorAddDetailJson , updateSalesCompleteDate ,   addReferenceDetail , bankAddDetail , addSalesCaseDetail ,
  applicantDetail , coApplicantDetail , guarantorDetail , referenceDetail , bankDetail , salesDetail ,
  multipleDataDeleteById,getNameAppAndCoApp,
  getLeadCustomer,allKYCDataGet,customerGetAllDocument,deleteApplicantForm,deleteCoApplicantForm ,
   deleteguarantorForm , deletereferenceForm , deletebankForm , deleteSalesCaseForm,
   salesAllFormCount , customerDetail,ProductLoginList, saleManagerProductList, allProductLoginlist, saleManagerAllProductList,allProductLoginlistWithoutFilter ,findStatus , findEmployeeNameByFinId, PaymentAll, viewPaymentAll , CashFreePaymentInitiate, processCashfreePayment , CashFreePaymentVerify,cashfreeWebhook,handleCashFreePaymentSuccess,Images
   ,updateCustomerBranch , fetchAllOrders , checkAndSetInactiveStatus , getAppCoAppAndGTR , fileReportTracking , fileReportingDelete ,  upDateFunction , aplicantModelDateUpdate , CashFreePaymentLink , customerBranchUpdate , updateAllCustomerBranches , updateApplicantDatafromPdModel , updateCoApplicantDatafromPdModel , aplicantModelGenderGetUnique,newCustomerDetail,
   addApplicant,addCoApplicant,addGuarantor  , getPdRejectFilesData  } = require("../controller/customer.Controller");

  //  const {onBoardingValidation} = require('../validation/onBoardingApiValidation')
const { leadGenerateSalesMan ,newLeadGenerateSalesMan , leadGenerateWebsite ,  leadGenerateApproveByAdmin , leadGenerateList , leadGenerateListForAdmin , getLeadGenerateDetails  , leadGenerateDashboardList , leadGenerateMonthlyStats , allFilesLeadGenerateDashBoard ,   leadDashBoardProductTable,
  leadDashBoardEmployeeTable,  leadDashBoardBranchTable , getEmployeeLeadsWithLocation ,  leadConvertToCustomerBySalesPerson, leadGenerateMonthlyDashbord, leadProductPercentageDashbord } = require('../controller/leadGenerate')
const { applicantList , coApplicantList , guarantorList , referenceList , bankList , SalesCaseList, } = require('../controller/googleSheetSet')

const {getAllCustomersSalesToPdGoogleSheet} = require('../controller/googleSheet.controller')

const {mailFunctionTestMail} = require("../controller/MailFunction/salesMail")
router.use("/", salesLogin);
router.post("/leadGenerate" , leadGenerateSalesMan);
router.post("/newleadGenerate" , newLeadGenerateSalesMan);
router.post("/leadGenerateWebsite" , leadGenerateWebsite);
router.post("/leadGenerateApproveByAdmin" , leadGenerateApproveByAdmin);
router.get("/leadGenerateMonthly" , leadGenerateMonthlyStats)
router.get("/leadGenerateDetails" , getLeadGenerateDetails);
router.get("/leadGenerateList" , leadGenerateList);
router.get("/leadGenerateListAdmin" , leadGenerateListForAdmin);
router.get("/leadGenerateDashboardList" , leadGenerateDashboardList);
router.get("/leadGenerateDashBoard" , allFilesLeadGenerateDashBoard);
// monthly dashbord api
router.get("/leadGenerateMonthlyDashbord" , leadGenerateMonthlyDashbord);

//product count for lead
router.get("/leadProductPercentage" , leadProductPercentageDashbord);

router.get("/employeeLeadsWithLocation" , getEmployeeLeadsWithLocation);
router.post("/leadFinalDicions",leadConvertToCustomerBySalesPerson)

router.get("/admin/lead/branchTable" , leadDashBoardBranchTable);
router.get("/admin/lead/employeeTable" , leadDashBoardEmployeeTable);
router.get("/admin/lead/productTable" , leadDashBoardProductTable);


router.post("/createDraftLoginFees", upload.single("paymentImage"), createDraftLoginFees);
router.get("/customerLoginDetail" , loginFeesDetail)
router.get("/createDraftLoginFeesList", createDraftLoginFeesList)
router.post("/paymentInitiate--test", paymentInitiate);
router.post("/paymentWebhookCall", paymentWebhookCall);
router.post("/paymentVerify", paymentVerify);
router.get("/getPermissionForm/:customerId", getPermissionFormByCustomerId);
router.get("/getCustomerDetail/:customerId", getCustomerDetail);
router.get("/all/customer", allCustomers);
router.get("/getcustomerdetails/:customerId", getLeadCustomer);
router.get("/getNameAppAndCoApp/:customerId", getNameAppAndCoApp);

// router.post("/paymentDone", upload.single("paymentPhoto"), paymentDone);
// router.post("/incomeDetail", upload.single("photoUpload"), incomeDetail);
// onBoardingValidation('applicantApi'),
// onBoardingValidation('coApplicantApi'),
// onBoardingValidation('guarantorApi'),
 //-------------------- all sales add forms  -------------------------------------------------------//


// router.post("/applicantAddDetail" , applicantUploads,  applicantAddDetail);
// router.post("/coApplicantAddDetail", coApplicantUploads,  coApplicantAddDetail);
// router.post("/guarantorAddDetail", guarantorUploads, guarantorAddDetail);

router.post("/applicantAddDetail" ,  applicantAddDetailJson);
router.post("/coApplicantAddDetail",  coApplicantAddDetailJson);
router.post("/guarantorAddDetail", guarantorAddDetailJson);

router.post("/addApplicant" ,  addApplicant);
router.post("/addCoApplicant",  addCoApplicant);
router.post("/addGuarantor",  addGuarantor);



router.post("/addReference", addReferenceDetail);
router.post("/bankAddDetail", cpUpload, bankAddDetail);
// router.post("/addSalesCase",salesUplodas , addSalesCaseDetail);
router.post("/addSalesCase", addSalesCaseDetail);


//----------------------- all sales form get by customerID ------------------------------------------//
router.get("/customerDetail/:customerId", customerDetail);
router.get("/applicantDetail/:customerId", applicantDetail);
router.get("/coApplicantDetail/:customerId", coApplicantDetail);
router.get("/guarantorDetail/:customerId", guarantorDetail);
router.get("/reference/:customerId", referenceDetail);
router.get("/bankDetail/:customerId", bankDetail);
router.get("/salesCaseDetail", salesDetail);
router.get("/findStatus", findStatus);
router.post("/fetchAllOrders", fetchAllOrders);
router.get("/Images", Images);

router.get("/allFormsCount", allFormsCount);
router.get("/updateApplicantDatafromPdModel", updateApplicantDatafromPdModel);
router.get("/updateCoApplicantDatafromPdModel",updateCoApplicantDatafromPdModel)
router.get("/customerGetAllDocument", customerGetAllDocument);


// ----------------------- All sales form ----------------------------------------//
router.post("/deleteApplicant", deleteApplicantForm)
router.post("/deleteCoApplicant", deleteCoApplicantForm);
router.post("/deleteGuarantor", deleteguarantorForm);
router.post("/deleteReference", deletereferenceForm);
router.post("/deleteBank", deletebankForm);
router.post("/deleteSalesCase", deleteSalesCaseForm);
router.post("/findEmployeeNameByFinId" , findEmployeeNameByFinId)
router.post("/PaymentAll", PaymentAll);
router.get("/viewPaymentAll", viewPaymentAll);
router.post("/CashFreePaymentInitiate", CashFreePaymentInitiate);
router.post("/processCashfreePayment", processCashfreePayment);
router.post("/CashFreePaymentLink", CashFreePaymentLink);
router.post("/CashFreePaymentVerify/:orderId", CashFreePaymentVerify);
router.post("/cashfreeWebhook", cashfreeWebhook);
router.post("/handleCashFreePaymentSuccess", handleCashFreePaymentSuccess);

router.get("/kycdata", allKYCDataGet);
router.get("/salesAllForm", salesAllFormCount);



// ----------------------------Loan Sathi-----------------------------------------//


router.post("/loanSathi/add",addLoanSathiController)
router.get("/loanSathi/get/:loanSathiId",getLoanSathiByIdController)
router.post("/loanSathi/update/:loanSathiId",updateLoanSathiController)
router.post("/loanSathi/password",changeLoanSathiPasswordController)
router.post("/loanSathi/delete/:loanSathiId",deactivateLoanSathiController)
router.get("/loanSathi/get/sales/:salesPersonId",getLoanSathiBySalesPersonController)
router.post("/loanSathi/login",loginLoanSathiController)

// google sheet
router.get("/applicantList", applicantList);
router.get("/coApplicantList", coApplicantList);
router.get("/guarantorList", guarantorList);
router.get("/reference", referenceList);
router.get("/bankList", bankList);
router.get("/salesCase", SalesCaseList);

// onbording
// fee and free login list for self
router.get("/productLoginList", ProductLoginList);
// fee and free all login list for self with filter(month,day)
router.get("/allProductLoginList", allProductLoginlist);
//fee and free all login list for self without filter
router.get("/listAllProductLogin", allProductLoginlistWithoutFilter);

// fee and free login list for sales manager
router.get("/salesManagerProductList", saleManagerProductList);
// fee and free all login list for sales manager with filter(month,day)
router.get("/salesManagerAllProductList", saleManagerAllProductList);


router.get("/getAllCustomersSalesToPdGoogleSheet", getAllCustomersSalesToPdGoogleSheet)
router.get("/updateCustomerBranch", updateCustomerBranch)

router.get('/checkAndSetInactiveStatus', checkAndSetInactiveStatus)
router.get('/getAppCoAppAndGTR', getAppCoAppAndGTR)

router.get('/getFileReportTracking', fileReportTracking)
router.get('/fileDelete', fileReportingDelete)
router.get('/upDateFunction',upDateFunction)

router.post("/newcreateDraftLoginFees" , newcreateDraftLoginFees)
router.get("/newCustomerDetail/:customerId", newCustomerDetail);

router.post("/customerBranchUpdate",customerBranchUpdate)
router.get('/aplicantModelDateUpdate',aplicantModelDateUpdate)
router.get('/updateAllCustomerBranches',updateAllCustomerBranches)
router.get('/updateSalesCompleteDate',updateSalesCompleteDate)

router.get("/aplicantModelGenderGetUnique",aplicantModelGenderGetUnique)

router.get("/getPdRejectFilesData",getPdRejectFilesData )

router.get('/mailFunctionTestMail',mailFunctionTestMail)

module.exports = router;
