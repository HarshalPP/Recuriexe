const express = require("express");
const router = express.Router();
const {
  updateCustomerDetails,
  updateCustomerApplicantDetail,
  updateGuarantorDetails,
  customerUpdateReferenceDetail,
  riskReportPd,
  approverpropertyDetailsForm,
  technicalVendorFormSubmit,
  technicalVendorGetForm,
  financeDetailsForm,
  dealDSummary,
  updateCustomerCoApplicantDetail,
  updateCustomerCoApplicantDetailtwo,
  updateProfile,
  finacialDetails,
  updateChargeDetails,
  uploadStempDocuments,
  updatePostDisbustment,
  updateDisbursementApplicant,
  updateDisbursementGuarantor,
  deleteStempDocuments,
  pincodedelete,
  fetchPincodeData,
  updateCoApplianMultiple,
} = require("../controller/finalApproval.update.controller");
const { upload } = require("../../../../Middelware/multer");

router.post("/riskReportdetail", riskReportPd);

router.post("/updatecustomerList", updateCustomerDetails);
router.post("/updateApplicantDetails", updateCustomerApplicantDetail);
router.post("/updateGuarantorDetails", updateGuarantorDetails);
router.post("/updateReferenceDetail", customerUpdateReferenceDetail);
router.post("/updateFinanceDetail", financeDetailsForm);
//asset/collateral
router.post("/propertyDetailsForm", approverpropertyDetailsForm);
router.post("/technicalVendorFormSubmit", technicalVendorFormSubmit);
router.get("/technicalVendorGetForm", technicalVendorGetForm);

router.post("/dealSummary", dealDSummary);
router.post("/coApplicant", updateCustomerCoApplicantDetail);
router.post("/coApplicanttwo", updateCustomerCoApplicantDetailtwo);

router.post("/updateCoApplianMultiple", updateCoApplianMultiple);

//update profile picture
router.post(
  "/updateProfile",
  // upload.fields([
  //   { name: "applicantProfile", maxCount: 1 },
  //   { name: "guarantorProfile", maxCount: 1 },
  //   { name: "coApplicantProfile", maxCount: 1 },
  //   { name: "coApplicantProfileTwo", maxCount: 1 },
  // ]),
  updateProfile
);

//update finacial details
router.post('/finacialDetails',finacialDetails)

//
//updateCharges
router.post('/updateCharges',updateChargeDetails)

//update post disbustment api
router.post('/updatePostDisbursement',updatePostDisbustment)

//applicantion form
router.post('/disbursementApplicant',updateDisbursementApplicant)

//applicantion form
router.post('/disbursementGuarantor',updateDisbursementGuarantor)

//update stemp pdf
router.post('/uploadStemp',
  upload.single('stampPdf'),
  uploadStempDocuments)

// delete stemp pdf
//update stemp paper
router.get('/deleteStemp',
  deleteStempDocuments)


  // delete pincode
router.get('/deletePincode', pincodedelete)
router.get('/fetchPincode', fetchPincodeData)

module.exports = router;
