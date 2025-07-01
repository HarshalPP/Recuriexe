import express from 'express'
const router = express.Router();
import {verifyEmployeeToken} from "../../middleware/authicationmiddleware.js"
import { initiatePayment  ,checkResponse , getFullPaymentHistory  ,checkPaymentStatus ,initiateRefund , checkRefundStatus} from "../../controllers/serviceController/iciciPayment.controller.js"

router.post("/paymentInitiate", verifyEmployeeToken , initiatePayment)
router.post("/checkResponse", verifyEmployeeToken , checkResponse)
router.get("/payment-history", verifyEmployeeToken , getFullPaymentHistory)
router.post("/checkPaymentStatus" , verifyEmployeeToken , checkPaymentStatus)
router.post("/initiateRefund",verifyEmployeeToken , initiateRefund)
router.post("/checkRefundStatus",verifyEmployeeToken , checkRefundStatus)

export default router;;
