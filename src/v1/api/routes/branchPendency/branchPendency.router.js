
const express = require("express");
const router = express.Router();

const { branchVendorFormAssignList, getAllFormFilesStatus, bankStatementKycForm, applicantPdcForm, guarantorPdcForm, propertyPapersKycForm,
    nachRegistrationKycForm, agricultureForm, milkIncomeForm, salaryAndOtherIncomeForm, otherBuisnessModelForm,
    physicalFileCourierForm, rmPaymentUpdateForm, udhyamKycForm,
    samagraIdForm, esignPhotoForm,
    electricityBillKycForm, formNotRequired, getBankStatementKycForm,
    getAppPdcForm,
    getGtrPdcForm,
    getPropertyPapersKycForm,
    getNachRegistrationForm,
    getPhysicalFileCourierForm , getUdhyamKycDetailForm, getSamagraIdDetailForm, getSalaryAndOtherIncomeDetailForm, getRmPaymentDetailForm, getMilkIncomeDetailForm, getESignDetailForm, getElectricityDetailForm, getAgricultureIncomDetailForm , getOtherBusinessDetailForm , branchPendencyFileAccept,OtherDocumentForm , getOthersForm , getKycForm , SignKycForm ,
    getIncomeDetailForm , incomeDetailForm ,addOrUpdateGuarantorDetails,getGuarantorDetails,updateImagePathsInApplicants,addNachLinkApplicant,addTypeKey,addInventryDetails,inventryDetailsList
} = require("../../controller/branchPendency/branchPendency.controller")
getMilkIncomeDetailForm

router.get("/formAssignList", branchVendorFormAssignList)

router.get("/allFormFilesStatus", getAllFormFilesStatus)

router.post("/physicalFileCourier", physicalFileCourierForm)

router.post("/bankStatementKyc", bankStatementKycForm)
router.post("/addOrUpdateGuarantorDetails", addOrUpdateGuarantorDetails)

router.post("/addTypeKey", addTypeKey)
router.get("/getGuarantorDetails", getGuarantorDetails)

router.post("/applicantPdc", applicantPdcForm)
router.post("/guarantorPdc", guarantorPdcForm)
router.post("/propertyPapersKyc", propertyPapersKycForm)
router.post("/nachRegistrationKyc", nachRegistrationKycForm)
router.post("/agriculture", agricultureForm)
router.post("/milkIncome", milkIncomeForm)

router.post("/salaryAndOtherIncome", salaryAndOtherIncomeForm)
router.post("/otherBuisness", otherBuisnessModelForm)
router.post("/udhyamKyc", udhyamKycForm)
router.post("/samagraId", samagraIdForm)
router.post("/electricityBillKyc", electricityBillKycForm)

router.post("/esignPhoto", esignPhotoForm)
router.post("/formupdate", formNotRequired)
router.post("/rmPaymentUpdate", rmPaymentUpdateForm)
router.post("/otherDocumentForm", OtherDocumentForm)
router.post("/kycForm", SignKycForm)
router.post("/incomeDetailForm", incomeDetailForm)


// branch form get 
router.get("/agricultureIncomDetail", getAgricultureIncomDetailForm)
router.get("/applicantPdcDetail", getAppPdcForm)
router.get("/bankStatementKycDetail", getBankStatementKycForm)

router.post("/addNachLinkApplicant", addNachLinkApplicant)

router.get("/electricityDetail", getElectricityDetailForm)
router.get("/eSignDetail", getESignDetailForm)
router.get("/guarantorPdcDetail", getGtrPdcForm)

router.get("/milkIncomeDetail", getMilkIncomeDetailForm)
router.get("/nachRegistrationDetail", getNachRegistrationForm)
router.get("/otherBusinessDetail", getOtherBusinessDetailForm)


router.get("/physicalFileCourierDetail", getPhysicalFileCourierForm)
router.get("/propertyPapersKycDetail", getPropertyPapersKycForm)
router.get("/rmPaymentDetail", getRmPaymentDetailForm)

router.get("/salaryAndOtherIncomeDetail", getSalaryAndOtherIncomeDetailForm)
router.get("/samagraIdDetail", getSamagraIdDetailForm)
router.get("/udhyamKycDetail", getUdhyamKycDetailForm)

router.post("/branchPendencyFileAccept", branchPendencyFileAccept)

router.get("/getOthersForm", getOthersForm)
router.get("/getKycForm", getKycForm)
router.get("/getIncomeDetailForm", getIncomeDetailForm)

//inventry api
router.post("/addInventryDetails", addInventryDetails)
router.get("/inventryDetailsList", inventryDetailsList)

// router //

router.post("/updateImagePathsInApplicants", updateImagePathsInApplicants)  

module.exports = router;
