
const express = require("express");
const router = express.Router();

const {growPgDeedPdf } = require("../../controller/growMoneyPdf/pdDeed.contorller")
const { rcplLoanAgreement } = require("../../controller/growMoneyPdf/rcplLoanAggrement")
const {growSanctionLetterPdf} = require("../../controller/growMoneyPdf/sanctionLetter.controller")
const {pdDeedLatter } = require("../../controller/growMoneyPdf/pdDeed.contorller")
const {growpdf,growpdff}=require("../../controller/growMoneyPdf/aplication.controller")
// const { sectionLatter } = require("../../controller/ratnaaFin/sectionLatter.controller")
// const {applicantLatter} = require("../../controller/ratnaaFin/applicant.controller")

router.post("/pgDeed", growPgDeedPdf)
router.post("/sectionLatter", growSanctionLetterPdf)
// router.post("/rcplLoanAgreement",rcplLoanAgreement)
// router.post("/growpdf",growpdf)
// router.get("/growpdff",growpdff)


 module.exports = router;

 /**
  * const express = require("express");
const router = express.Router();

const {generatePgDeedSangitaPdf } = require("../../controller/growMoneyPdf/pdDeed.contorller")
const { rcplLoanAgreement } = require("../../controller/growMoneyPdf/rcplLoanAggrement")
const {generateSanctionLetterPdf} = require("../../controller/growMoneyPdf/sanctionLetter.controller")

router.post("/pgDeed", generatePgDeedSangitaPdf)
router.post("/sectionLatter", generateSanctionLetterPdf)
router.post("/rcplLoanAgreement",rcplLoanAgreement)


 module.exports = router;
 



  */
 


