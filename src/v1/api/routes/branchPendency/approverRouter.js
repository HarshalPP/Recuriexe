
const express = require("express");
const router = express.Router();

const {  approverTechnicalForm, approverTechnicalFormGet ,approverBranchFormsList , getSpecificBranchForms,
     specificBranchFormsApprove , legalreport , approverLegalFormGet , approverTaggingFormGet , approverRmFormGet , approverTaggingFormPost , approverRmFormPost } = require("../../controller/branchPendency/approverController")

router.post("/technicalForm", approverTechnicalForm)
router.get("/technicalFormGet", approverTechnicalFormGet)

router.post("/legalReport", legalreport)
router.get("/legalReportGet", approverLegalFormGet)

router.get('/branchFormsList',approverBranchFormsList)
router.get('/specificFormDetail',getSpecificBranchForms)
router.post('/formUpdate',specificBranchFormsApprove)


router.post("/rmFormPost", approverRmFormPost)
router.post("/taggingFormPost", approverTaggingFormPost)

router.get("/rmFormGet", approverRmFormGet)
router.get("/taggingFormGet", approverTaggingFormGet)

module.exports = router;
