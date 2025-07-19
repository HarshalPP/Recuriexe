
const express = require("express");
const router = express.Router();

const {getCibilReportFileProcess,
     applicantKycForm,coApplicantKycForm ,gtrKycForm ,
     samagraIdForm , electricityBillKycForm,
     bankStatementKycForm , udhyamKycForm , applicantPdcForm ,gtrPdcForm ,
     propertyPapersKycForm ,nachRegistrationKycForm ,physicalFileCourierForm,
     addCibilReportKycController, addTechnicalReportKycController ,addTaggingKycFormController,
     addRcuKycFormController , addJainamKycFormController , addPdReportKycFormController ,
     addSentForSanctionController , addPostDisbursementController ,addSentForDisbursementController } = require("../../controller/fileProccess/allKycForm.controller.js")

router.get("/getDetail",getCibilReportFileProcess)
router.post("/applicantKyc",applicantKycForm)
router.post("/coApplicantKyc",coApplicantKycForm)
router.post("/gtrKycForm",gtrKycForm)
router.post("/samagraIdForm",samagraIdForm)
router.post("/electricityBillKyc",electricityBillKycForm)
router.post("/bankStatementKyc",bankStatementKycForm)
router.post("/udhyamKycForm",udhyamKycForm)
router.post("/applicantPdc",applicantPdcForm)
router.post("/gtrPdc",gtrPdcForm)
router.post("/propertyPapersKyc",propertyPapersKycForm)
router.post("/nachRegistrationKyc",nachRegistrationKycForm)
// router.post("/physicalFileCourier",physicalFileCourierForm)
router.post("/cibilReportKyc",addCibilReportKycController)
router.post("/technicalReportKyc",addTechnicalReportKycController)
router.post("/taggingKyc",addTaggingKycFormController)
router.post("/rcuKycForm",addRcuKycFormController)
router.post("/jainamKycForm",addJainamKycFormController)
router.post("/pdReportKycForm",addPdReportKycFormController)
router.post("/sentForSanctionKyc",addSentForSanctionController)
router.post("/postDisbursementKyc",addPostDisbursementController)
router.post("/sentForDisbursementKyc",addSentForDisbursementController)

 module.exports = router;
 

    
