const express = require("express");
const router = express.Router();

const {
  addFinalEligibility,
  finalEligibilityList,
  checkCreditPolicy,
  getDynamipolicyData,
  partnerPolicyCheck
} = require("../../controller/finalApproval/finalEligibility.controller");

const {getBtDetailsByCustomerId , createOrUpdateBtDetails } = require("../../controller/finalApproval/btDetails.controller")

router.post("/add", addFinalEligibility);
router.get("/list", finalEligibilityList);
router.get("/checkCreditPolicy", checkCreditPolicy);
// router.get("/getDynamipolicyData",getDynamipolicyData)
  
// // partner policy check
router.get('/partnerPolicyCheck' , partnerPolicyCheck)

router.post('/createOrUpdateBtDetails' , createOrUpdateBtDetails)
router.get('/btDetailsByCustomerId' , getBtDetailsByCustomerId)

module.exports = router;
