const express = require("express");
const router = express.Router();

const { getAIResponse } = require("../../controller/gemini/gemini.controller");
const {generateAIWithImageUrl} = require("../../controller/gemini/samagraDoc.controller")
const {electricityBillDocAi , shopIncomeAi , udhyamDocAi ,propertyPaperDocAi , verifyAadharAndPan, coOwnershipDeedDocAi, propertyDetailDocAi , extractCibilDataFromPdf } = require("../../controller/gemini/electricityBill.controller")

router.get("/getAIResponse", getAIResponse);
router.post("/generateAIWithImageUrl", generateAIWithImageUrl);
router.post("/electricityBillDocAi",electricityBillDocAi)
router.post("/shopIncomeAi",shopIncomeAi)
router.post("/udhyamDocAi",udhyamDocAi)
router.post('/propertyPaperDocAi',propertyPaperDocAi)
router.post('/verifyAadharAndPan',verifyAadharAndPan)
router.post("/extractCibilDataFromPdf", extractCibilDataFromPdf)

// property paper 
router.post('/coOwnershipDeedDocAi',coOwnershipDeedDocAi)
router.post('/propertyDetailDocAi',propertyDetailDocAi)
module.exports = router;
