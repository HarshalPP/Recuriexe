const express = require("express");
const router = express.Router();

const { initiatePayment  ,checkResponse , checkPaymentStatus ,initiateRefund , checkRefundStatus} = require("../../services/iciciPaymentGateway")

router.post("/paymentInitiate",initiatePayment)
router.post("/checkResponse",checkResponse)
router.post("/checkPaymentStatus",checkPaymentStatus)
router.post("/initiateRefund",initiateRefund)
router.post("/checkRefundStatus",checkRefundStatus)

module.exports = router;
