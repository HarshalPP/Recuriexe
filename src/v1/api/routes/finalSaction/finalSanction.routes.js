
const express = require("express");
const router = express.Router();
const {finalSanctionCreate,finalSanctionGET,addBranchPendencyQuery,addBranchConditionQuery,branchQueryList,addBranchDeviation,addMitigates , departmentInfo , deleteDepartmentInfo,
    incomeDetailsUpdate,partnerPolicyList,deleteBranchDeviation,deleteMitigates,queryCheckForSanction,addSanctionQuery,disbursementQuery,partnerDisbursementQuery,addCamDetails,deleteBranchConditionQuery
} = require("../../controller/finalSanction/finalSanction.controller")


router.post("/finalSanction", finalSanctionCreate)

router.get("/finalSanction", finalSanctionGET)

// add branch pendency query
router.post("/branchPendencyQuery", addBranchPendencyQuery)

// add branch condition  query
router.post("/branchConditionQuery", addBranchConditionQuery)

// delete branch condition  query
router.post("/deleteBranchConditionQuery", deleteBranchConditionQuery)

// add branch Deviation  query
router.post("/branchDeviation", addBranchDeviation)

// delete branch condition  query
router.get("/branchDeviation", deleteBranchDeviation)

// add mitigatcs condition  query
router.post("/branchMitigates", addMitigates)

// delete mitigatcs condition  query
router.post("/deleteMitigates", deleteMitigates)

// get branch condition and pendency query
router.get("/branchQuery", branchQueryList)

// add department info

router.post("/departmentInfo", departmentInfo)

// delete department info

router.post("/deleteDepartmentInfo", deleteDepartmentInfo)

// income api
router.post('/incomeDetails',incomeDetailsUpdate)

// partner selection check policy  api
router.get('/partnerPolicyList',partnerPolicyList)

//partner query check for santion
router.get('/queryCheckForSanction',queryCheckForSanction)

//partner santion query 
router.get('/sanctionQuery',queryCheckForSanction)

//update partner sanction query
router.post('/partnerSanctionQuery',addSanctionQuery)

//partner Disbursement query 
router.get('/disbursementQuery',disbursementQuery)

//update partner Disbursement query
router.post('/partnerDisbursementQuery',partnerDisbursementQuery)

// income details for the rantafin,fcpl cam
router.post('/addCamDetails',addCamDetails)


 module.exports = router;
 


