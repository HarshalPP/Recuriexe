const express = require("express");
const router = express.Router();
const { upload } = require("../../../../../Middelware/multer");
const {aadhaarSendOtp, aadhaarSubmitOtp,aadhaarOCR} = require("../../services/aadhar.services")
const { thirdPartyApiValidation } = require("../../validation/thirdPartyApiValidation")

router.post("/aadhaarSendOtp",thirdPartyApiValidation('validateAadharNo'), aadhaarSendOtp)
router.post("/aadhaarSubmitOtp",aadhaarSubmitOtp)
router.post("/aadhaarOCR",upload.fields([{name: 'front_image'},{ name: 'back_image'}]),aadhaarOCR)
// router.post("/aadhaarMarkAsVerified", upload.fields([{name: 'front_image'},{ name: 'back_image'}]) ,aadhaarMarkAsVerified)

 module.exports = router;
