const express = require("express");
const { getCibilScore } = require("../../controller/cibilController");
const {cibilGetDataTest} = require("../../services/kyc.services")
const router = express.Router();



router.post("/getCibilScore",getCibilScore)
router.post("/cibilGetDataTest",cibilGetDataTest)

 module.exports = router;
