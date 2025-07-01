import { success, badRequest, notFound, unknownError } from "../../formatters/globalResponse.js"
import crypto from "crypto"
import https from 'https';
import ICICI from 'icici-dev';
import planAndPaymentHistoryModel from "../../models/PlanModel/planAndPaymentHistory.model.js"
import planModel from "../../models/PlanModel/Plan.model.js"
import aiPlanModel from "../../models/PlanModel/AiCreditPlan.js"
import organizationModel from "../../models/organizationModel/organization.model.js"
import { assignAICreditsInternally } from "../../controllers/PlanController/AiPlan.controller.js"
import { upgradenewOrgPlan } from "../../controllers/PlanController/planController.js"
import mongoose from "mongoose";
const icici = new ICICI()
import sdk from "../../middleware/icici/icici.js";

export async function initiatePayment(req, res) {
    try {
        const organizationId = req.employee.organizationId
        const employeeId = req.employee.id
        const { returnURL, aiCreditPlanId, planId, Amount, numberOfCredits } = req.body;

        let organizationExist;
        if (organizationId) {
            organizationExist = await organizationModel.findById(organizationId)
            if (!organizationExist) {
                return notFound(res, "Organization Not Found")
            }
        } else {
            return notFound(res, "Invalid Token Organization Id Not Found")
        }

        const email = organizationExist.contactEmail
        const phone = organizationExist.contactNumber

        if (!phone && !email) {
            return badRequest(res, "Email and Phone Not Found On Organization");
        }

        if (!Amount) {
            return badRequest(res, "Amount Is Required");
        }

        if (!returnURL) {
            return badRequest(res, "returnURL Is Required");
        }
        let planType = null;
        if (planId) planType = "Plan";
        else if (aiCreditPlanId) planType = "AIPlan"
        else return badRequest(res, "Please Provide Either Plan OR AI Credit Plan");
        if (aiCreditPlanId) {
            const aiPlanExist = await aiPlanModel.findById(aiCreditPlanId)
            if (!aiPlanExist) {
                return notFound(res, "AI Plan Not Found")
            }
        }
        if (planId) {
            const planExist = await planModel.findById(planId)
            if (!planExist) {
                return notFound(res, "Plan Not Found")
            }
        }

        const txnRefNo = `TXNNOICICI${Date.now()}`;
        const response = sdk.initiate({
            // encKey: process.env.ICICI_ENC_KEY,
            // saltKey: process.env.ICICI_SALT_KEY,
            // merchantId: process.env.ICICI_MERCHANT_ID,
            // terminalId: process.env.ICICI_TERMINAL_ID,
            // bankId: process.env.ICICI_BANK_ID,
            // passCode: process.env.ICICI_PASS_CODE,
            // mcc: process.env.ICICI_MCC,
            // currency: process.env.ICICI_CURRENCY,
            returnURL: returnURL,
            encKey: "6E23CEB56F12090C97431756476E51A0",
            saltKey: "7C767E40261E7871E7AA063B396B244E",
            merchantId: "100000000182377",
            terminalId: "EG004404",
            bankId: "24520",
            passCode: "RQFN9710",
            mcc: "5734",
            currency: "356",
            amount: String(Amount),
            email,
            phone,
            orderInfo: txnRefNo,
            txnRefNo,
        });

        const payload = {
            organizationId,
            orderId: txnRefNo,
            paymentMethod: "ICICI",
            paymentStatus: "Initiated",
            status: 'pending',
            planType: planType,
            createBy: employeeId,
            numberOfCredits: numberOfCredits,
            Amount: Amount
        };

        if (planType === "AIPlan" && aiCreditPlanId) {
            payload.aiCreditPlanId = aiCreditPlanId;
        } else if (planType === "Plan" && planId) {
            payload.planId = planId;
        } else {
            return badRequest(res, "Missing or invalid planId/aiCreditPlanId");
        }

        const planAndPaymentHistory = await planAndPaymentHistoryModel.create(payload);

        if (!response.status) {
            return badRequest(res, response.message || 'Payment initiation failed', response);
        }
        const paymentUrl = `https://paypg.icicibank.com/payment-capture` +
            `?EncData=${response.data.EncData}&TerminalId=${response.data.data.TerminalId}` +
            `&MerchantId=${response.data.data.MerchantId}&BankId=${response.data.data.BankId}`;

        //   const paymentUrl = `${process.env.ICICI_PAYMENR_URL}/payment-capture` +
        // `?EncData=${response.data.EncData}&TerminalId=${response.data.data.TerminalId}` +
        // `&MerchantId=${response.data.data.MerchantId}&BankId=${response.data.data.BankId}`;


        const modifiedResponse = {
            ...response,
            paymentUrl,
        };

        return success(res, "payment initiate ", modifiedResponse);

    } catch (error) {
        return unknownError(res, error || 'Payment initiation failed');
    }
}


export async function checkResponse(req, res) {
    try {
        const { paymentResponse } = req.query;

        if (!paymentResponse) {
            return badRequest(res, "Payment Response Is required");
        }

        const response = sdk.checkResponse({
            // encKey: process.env.ICICI_ENC_KEY,
            // saltKey: process.env.ICICI_SALT_KEY,
            encKey: "6E23CEB56F12090C97431756476E51A0",
            saltKey: "7C767E40261E7871E7AA063B396B244E",
            paymentResponse
        });

        const txnRefNo = response?.data?.TxnRefNo;

        if (!txnRefNo) {
            return badRequest(res, 'Transaction reference not found in response');
        }

        // 1. Try to find in planAndPaymentHistoryModel (main and pd payment)
        let PaymentDetail = await planAndPaymentHistoryModel.findOne({ orderId: txnRefNo });

        if (PaymentDetail) {

            const organizationId = PaymentDetail.organizationId;

            // ✅ Payment Successful
            if (response?.data?.ResponseCode == "00") {
                await planAndPaymentHistoryModel.updateOne(
                    { _id: PaymentDetail._id },
                    {
                        $set: {
                            paymentStatus: "success",
                            status: "active",
                            paymentDate: new Date(),
                            transactionId: response?.data?.RetRefNo,
                        },
                    }
                );

                // 🎯 Only handle AI Plan assignments
                if (PaymentDetail.planType == "AIPlan") {
                    const finalPlanId = PaymentDetail.aiCreditPlanId;
                    const finalNumberOfCredits = PaymentDetail.numberOfCredits || 0;
                    const finalPrice = PaymentDetail.Amount || 0;

                    if (!finalPlanId || !finalNumberOfCredits || !finalPrice) {
                        return badRequest(res, "Missing planId, numberOfCredits, or Price in stored payment details.");
                    }

                    await assignAICreditsInternally({
                        planId: finalPlanId,
                        numberOfCredits: finalNumberOfCredits,
                        Price: finalPrice,
                        organizationId,
                    });
                }

                else if (PaymentDetail.planType == "Plan") {
                    const finalPlanId = PaymentDetail.planId;
                    const price = PaymentDetail.Amount || 0;

                    if (!finalPlanId || !price) {
                        return badRequest(res, "Missing planId or price in payment details");
                    }

                    await upgradenewOrgPlan({
                        PlanId: finalPlanId,
                        organizationId,
                        Amount: price,
                    });
                }



                return success(res, "Payment Process Completed", { data: response });
            }

            // ❌ Payment Cancelled
            if (response?.data?.ResponseCode === "03") {
                await planAndPaymentHistoryModel.updateOne(
                    { _id: PaymentDetail._id },
                    { $set: { paymentStatus: "Cancel" } }
                );
                return badRequest(res, "Payment cancelled");
            }

            return badRequest(res, 'Payment cancelled');
        } else {
            return badRequest(res, 'Payment Failed');
        }
    }
    catch (error) {
        return unknownError(res, error.message || 'Failed to process payment response');
    }
}


export async function checkPaymentStatus(req, res) {
    try {
        const { TxnRefNo } = req.body;

        if (!TxnRefNo) {
            return badRequest(res, "TxnRefNo, is required.");
        }

        const response = await sdk.getPaymentStatus({
            encKey: process.env.ICICI_ENC_KEY,
            saltKey: process.env.ICICI_SALT_KEY,
            bankId: process.env.ICICI_BANK_ID,
            passCode: process.env.ICICI_PASS_CODE,
            merchantId: process.env.ICICI_MERCHANT_ID,
            terminalId: process.env.ICICI_TERMINAL_ID,
            txnRefNo: TxnRefNo,
        });

        // console.log('response--', response)
        if (response?.status === true) {
            return success(res, { data: response.data });
        } else {
            return badRequest(res, response?.message);
        }

    } catch (error) {
        console.error("Error fetching payment status:", error);
        return unknownError(res, error.message, "Internal server error while checking payment status.");
    }
}


export async function initiateRefund(req, res) {
    try {
        const { txnRefNo, retRefNo, refundAmount } = req.body
        // Validate required parameters
        if (!txnRefNo || !retRefNo || !refundAmount) {
            return badRequest(res, 'Missing required refund parameters')
        }

        // Initiate refund - use the method name as per the SDK documentation
        const response = await sdk.initiateRefund({
            encKey: process.env.ICICI_ENC_KEY,
            saltKey: process.env.ICICI_SALT_KEY,
            bankId: process.env.ICICI_BANK_ID,
            passCode: process.env.ICICI_PASS_CODE,
            merchantId: process.env.ICICI_MERCHANT_ID,
            terminalId: process.env.ICICI_TERMINAL_ID,
            txnRefNo: txnRefNo,
            retRefNo: retRefNo,
            refundAmount: refundAmount,
            refCancelId: `REF${Date.now()}`
        });

        return success(res, "re found check ", response);
    } catch (error) {
        console.error('Error initiating refund:', error);
        return unknownError(res, error, "Internal server error")
    }
}


export async function checkRefundStatus(req, res) {
    try {
        const { txnRefNo, refCancelId } = req.body
        // Validate required parameters
        if (!txnRefNo || !refCancelId) {
            return badRequest(res, 'Transaction reference number and refund cancellation ID are required')
        }
        // Check refund status - use the method name as per the SDK documentation
        const response = await sdk.getRefundStatus({
            encKey: process.env.ICICI_ENC_KEY,
            saltKey: process.env.ICICI_SALT_KEY,
            bankId: process.env.ICICI_BANK_ID,
            passCode: process.env.ICICI_PASS_CODE,
            merchantId: process.env.ICICI_MERCHANT_ID,
            terminalId: process.env.ICICI_TERMINAL_ID,
            txnRefNo: txnRefNo,
            refCancelId: refCancelId
        });
        return success(res, "re found check ", response);
    } catch (error) {
        console.error('Error initiating refund:', error);
        return unknownError(res, error, "Internal server error")
    }
}



export const getFullPaymentHistory = async (req, res) => {
    try {
        const { planType } = req.query;
        const organizationId = req.employee.organizationId;
        // Validate organizationId
        if (!organizationId || !mongoose.Types.ObjectId.isValid(organizationId)) {
            return badRequest(res, "Valid organizationId is required");
        }

        const filter = {
            organizationId: new mongoose.Types.ObjectId(organizationId),
        };

        if (planType) {
            if (!["AIPlan", "Plan"].includes(planType)) {
                return badRequest(res, "Invalid planType. Must be 'AIPlan' or 'Plan'");
            }
            filter.planType = planType;
        }

        const results = await planAndPaymentHistoryModel
            .find(filter)
            .populate({
                path: "organizationId",
                select: 'name'
            })
            .populate("aiCreditPlanId")
            .populate({
                path: "createBy",
                select: 'userName'
            }) // optionally: who initiated
            .sort({ createdAt: -1 }); // newest first

        return success(res, "All payment history fetched successfully", results);
    } catch (error) {
        console.error("Error in getFullPaymentHistory:", error);
        return unknownError(res, error.message);
    }
};
