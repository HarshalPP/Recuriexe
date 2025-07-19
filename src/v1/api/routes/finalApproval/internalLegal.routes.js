const express = require("express");
const router = express.Router();

const {
  addInternalLegalDetails,
  internalLegalDetails,nameDropDown,nameDropDownDetailed,createOrUpdateInsurance,getInsuranceDetails,getAllInsuranceDetails
} = require("../../controller/finalApproval/internalLegal.controller");

router.post("/add", addInternalLegalDetails);
router.get("/details", internalLegalDetails)
router.get("/dropDown", nameDropDown)
router.get("/dropDownDetailed", nameDropDownDetailed)
router.post("/createOrUpdateInsurance", createOrUpdateInsurance)
router.get("/getInsuranceDetails", getInsuranceDetails)
router.get("/getAllInsuranceDetails", getAllInsuranceDetails)

module.exports = router;
