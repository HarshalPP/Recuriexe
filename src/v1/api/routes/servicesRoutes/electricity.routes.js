const express = require("express");
const router = express.Router();

const { getElectricityBill} = require("../../services/electricity.services")
const {cibilScore , fetchIDVEfficiency} = require("../../services/cibilScore.services")

router.post("/getElectricityBill",getElectricityBill)
router.post("/cibilScore",cibilScore)
router.post("/fetchIDVEfficiency",fetchIDVEfficiency)

 module.exports = router;
