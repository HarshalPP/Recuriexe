const express = require("express")
const router = express.Router()
const {fetchBill , getBillDetails, CustomBillFeatch , CustomPayment , fetchGoogleSheetData , fetchLoanDetailsFromGoogleSheet , CustomPaymentNew , getBbpsDashboard} = require("../../services/AxisApi.services")

// Define the upload route
router.post("/fetchBill", fetchBill)
router.post("/getBillDetails", getBillDetails)
// router.post("/CustomerloanFeatch", CustomBillFeatch)
router.post("/CustomerloanFeatch", fetchLoanDetailsFromGoogleSheet)
router.post("/CustomerPayment", CustomPaymentNew)
// router.post("/CustomerPayment", CustomPayment)
router.get("/getEmi" , fetchGoogleSheetData)
router.get("/getBbpsDashboard" , getBbpsDashboard)
// router.post("/CustomPaymentNew" , CustomPaymentNew)

// router.get("/fetchLoanDetails" , fetchLoanDetailsFromGoogleSheet)

module.exports = router;