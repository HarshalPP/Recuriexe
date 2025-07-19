const express = require("express");
const router = express.Router();

const { PanComprehensive, PanFatherName} = require("../../services/pan.services");
// const { thirdPartyApiValidation } = require("../../validation/thirdPartyApiValidation")
// thirdPartyApiValidation('validatePanFatherName'),
// thirdPartyApiValidation('validatePanComprehensive'),
router.post("/PanComprehensive",PanComprehensive)
router.post("/PanFatherName",PanFatherName)


 module.exports = router;
