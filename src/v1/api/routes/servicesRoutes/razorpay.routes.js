const express = require("express");
const router = express.Router();

const { getPaymentHistory} = require("../../services/razorpay")


router.get("/getPaymentHistory",getPaymentHistory)


 module.exports = router;
