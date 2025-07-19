const applicantModel = require("../model/applicant.model")
const customerModel = require("../model/customer.model")
const processModel = require("../model/process.model")
const productModel = require("../model/adminMaster/product.model")
const webCustomerPaymentModel = require("../model/webCustomerPayment.model")
const crypto = require("crypto")
const https = require('https');
const {
  success,
  unknownError,
  serverValidation,
  badRequest,
  notFound,
} = require("../../../../globalHelper/response.globalHelper");


const ICICI = require('icici-dev');
const { json } = require("stream/consumers");

const SDK  = require('../../../../Middelware/icici/icici.js')
const iciciInstance = new SDK();
// const icici = new ICICI()

async function initiatePayment(req, res) {
  try {

    const {phone , email, customerId ,customerName , apiUse ,amount , returnURL } = req.body;
    const txnRefNo = `ORDICICI${Date.now()}`;

    let response;
    if(apiUse === "loginModel") {
    if (!customerId) {
      return badRequest(res, 'Customer ID is required');
    }
    const customerDetails = await customerModel.findById(customerId);
    if (!customerDetails) {
      return notFound(res, 'Customer not found');
    }

    response = iciciInstance.initiate({
      encKey: process.env.ICICI_ENC_KEY,
      saltKey: process.env.ICICI_SALT_KEY,
      merchantId: process.env.ICICI_MERCHANT_ID,
      terminalId: process.env.ICICI_TERMINAL_ID,
      bankId: process.env.ICICI_BANK_ID,
      passCode: process.env.ICICI_PASS_CODE,
      mcc: process.env.ICICI_MCC,
      currency: process.env.ICICI_CURRENCY,
      returnURL: returnURL,
      amount: String(customerDetails.loginFees),
      email,
      phone , 
      orderInfo: txnRefNo,
      txnRefNo,
    });

    //   response = iciciInstance.initiate({
    //   encKey: "6E23CEB56F12090C97431756476E51A0",
    //   saltKey: "7C767E40261E7871E7AA063B396B244E",
    //   merchantId: "100000000182377",
    //   terminalId: "EG004404",
    //   bankId: "24520",
    //   passCode: "RQFN9710",
    //   mcc: "5734",
    //   currency: "356",
    //   returnURL: returnURL,
    //   amount: String(customerDetails.loginFees),
    //   email,
    //   phone , 
    //   orderInfo: txnRefNo,
    //   txnRefNo,
    // });

    await customerModel.findByIdAndUpdate(customerId, { orderId: txnRefNo, PaymentGateway: "ICICI", paymentStatus: "Initiated" }, { new: true });

    if (!response.status) {
      return badRequest(res, response.message || 'Payment initiation failed', response);
    }
  }else if(apiUse === "pdModel"){

      if (!customerId) {
      return badRequest(res, 'Customer ID is required');
    }
    const customerDetails = await customerModel.findById(customerId);
    if (!customerDetails) {
      return notFound(res, 'Customer not found');
    }

    const productDetail = await productModel.findById(customerDetails.productId);
    if (!productDetail) {
      return notFound(res, 'Product not found');
    }

    response = iciciInstance.initiate({
      encKey: process.env.ICICI_ENC_KEY,
      saltKey: process.env.ICICI_SALT_KEY,
      merchantId: process.env.ICICI_MERCHANT_ID,
      terminalId: process.env.ICICI_TERMINAL_ID,
      bankId: process.env.ICICI_BANK_ID,
      passCode: process.env.ICICI_PASS_CODE,
      mcc: process.env.ICICI_MCC,
      currency: process.env.ICICI_CURRENCY,
      returnURL: returnURL,
      amount: String(productDetail.pdPaymentFees),
      email :email,
      phone :phone , 
      orderInfo: txnRefNo,
      txnRefNo,
    });

        await customerModel.findByIdAndUpdate(customerId, { pdOrderId: txnRefNo, pdPaymentGateway: "ICICI", pdPaymentStatus: "Initiated" }, { new: true });

    if (!response.status) {
      return badRequest(res, response.message || 'Payment initiation failed', response);
    }
  }else{
    return badRequest(res, "apiUse is required");
  }

//   const baseUrl =
//   apiUse === "loginModel"
//     ? "https://paypg.icicibank.com"
//     : process.env.ICICI_PAYMENR_URL;

// const paymentUrl = `${baseUrl}/payment-capture` +
//       `?EncData=${response.data.EncData}&TerminalId=${response.data.data.TerminalId}` +
//       `&MerchantId=${response.data.data.MerchantId}&BankId=${response.data.data.BankId}`;
      

      const paymentUrl = `${process.env.ICICI_PAYMENR_URL}/payment-capture` +
      `?EncData=${response.data.EncData}&TerminalId=${response.data.data.TerminalId}` +
      `&MerchantId=${response.data.data.MerchantId}&BankId=${response.data.data.BankId}`;
      
    const modifiedResponse = {
      ...response,
      paymentUrl,
      ICICI_ENC_KEY: process.env.ICICI_ENC_KEY,
      ICICI_SALT_KEY:process.env.ICICI_SALT_KEY,
    };

//     const modifiedResponse = {
//   ...response,
//   paymentUrl,
//   ICICI_ENC_KEY: apiUse === "loginModel"
//     ? "6E23CEB56F12090C97431756476E51A0"
//     : process.env.ICICI_ENC_KEY,
//   ICICI_SALT_KEY: apiUse === "loginModel"
//     ? "7C767E40261E7871E7AA063B396B244E"
//     : process.env.ICICI_SALT_KEY,
// };

    return success(res, modifiedResponse, 200);

  } catch (error) {
    return unknownError(res, error.message || 'Payment initiation failed');
  }
}


async function checkResponse(req, res) {
  try {
    const { paymentResponse } = req.query;

    if (!paymentResponse) {
      return badRequest(res, "PaymentResponse is Required");
    }

    const response = iciciInstance.checkResponse({
      encKey: process.env.ICICI_ENC_KEY,
      saltKey: process.env.ICICI_SALT_KEY,
      // encKey: "6E23CEB56F12090C97431756476E51A0",
      // saltKey: "7C767E40261E7871E7AA063B396B244E",
      paymentResponse
    });

    const txnRefNo = response?.data?.TxnRefNo;

    if (!txnRefNo) {
      return badRequest(res, 'Transaction reference not found in response');
    }

    // 1. Try to find in customerModel (main and pd payment)
    let customer = await customerModel.findOne({
      $or: [{ orderId: txnRefNo }, { pdOrderId: txnRefNo }]
    });

    if (customer) {
      if (response?.data?.ResponseCode === '00') {
        // ✅ Payment Successful
        if (customer.orderId === txnRefNo) {
          await customerModel.updateOne(
            { _id: customer._id },
            {
              $set: {
                paymentStatus: 'success',
                paymentDate: new Date(),
                transactionId :response?.data?.RetRefNo,
              }
            }
          );

          await processModel.findOneAndUpdate(
            { customerId: customer._id },
            { $set: { customerFormComplete: true, customerFormStart: true } }
          );
        } else if (customer.pdOrderId === txnRefNo) {
          await customerModel.updateOne(
            { _id: customer._id },
            {
              $set: {
                pdPaymentStatus: 'success',
                pdPaymentDate: new Date(),
                pdTransactionId : response?.data?.RetRefNo,
              }
            }
          );
        }

        return success(res, { data: response });

      } else if (response?.data?.ResponseCode === '03') {
        // ❌ Payment Cancelled
        if (customer.orderId === txnRefNo) {
          await customerModel.updateOne(
            { _id: customer._id },
            { $set: { paymentStatus: 'Cancel' } }
          );
        } else if (customer.pdOrderId === txnRefNo) {
          await customerModel.updateOne(
            { _id: customer._id },
            { $set: { pdPaymentStatus: 'Cancel' } }
          );
        }

        return badRequest(res, 'Payment cancelled');
      } else {
        return badRequest(res, 'Payment Failed');
      }
    }
    // 2. If not found in customerModel, check webCustomerPaymentModel

    const webCustomer = await webCustomerPaymentModel.findOne({txnRefNo});
    
    if (webCustomer) {
      if (response?.data?.ResponseCode === '00') {
        await webCustomerPaymentModel.updateOne(
          { _id: webCustomer._id },
          {
            $set: {
              paymentStatus: 'success',
              paymentDate: new Date()
            }
          }
        );
        return success(res, { data: response });
      } else if (response?.data?.ResponseCode === '03') {
        await webCustomerPaymentModel.updateOne(
          { _id: webCustomer._id },
          { $set: { paymentStatus: 'Cancel' } }
        );
        return badRequest(res, 'Payment cancelled');
      } else {
        return badRequest(res, 'Payment not successful');
      }
    }

    // 3. If no matching record in either model
    return notFound(res, 'Customer not found for the given TxnRefNo');

  } catch (error) {
    return unknownError(res, error.message || 'Failed to process payment response');
  }
}


async function checkPaymentStatus(req, res) {
  try {
    const { TxnRefNo } = req.body;

    if (!TxnRefNo) {
      return badRequest(res, "TxnRefNo, is required.");
    }

    const response = await iciciInstance.getPaymentStatus({
      encKey: process.env.ICICI_ENC_KEY,
      saltKey: process.env.ICICI_SALT_KEY,
      bankId: process.env.ICICI_BANK_ID,
      passCode: process.env.ICICI_PASS_CODE,
      merchantId: process.env.ICICI_MERCHANT_ID,
      terminalId: process.env.ICICI_TERMINAL_ID,
      txnRefNo: TxnRefNo,
    });

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


async function initiateRefund(req ,res ) {
  try {
    // Validate required parameters
    const { txnRefNo,retRefNo,refundAmount} = req.body


    if (!txnRefNo || !retRefNo || !refundAmount) {
      return badRequest(res , 'Missing required refund parameters')
    }
    // Initiate refund - use the method name as per the SDK documentation
    const response = await iciciInstance.initiateRefund({
      txnRefNo: txnRefNo,
       encKey: process.env.ICICI_ENC_KEY,
      saltKey: process.env.ICICI_SALT_KEY,
      merchantId: process.env.ICICI_MERCHANT_ID,
      terminalId: process.env.ICICI_TERMINAL_ID,
      bankId: process.env.ICICI_BANK_ID,
      passCode: process.env.ICICI_PASS_CODE,
      retRefNo: retRefNo,
      refundAmount: refundAmount,
      refCancelId: `REF${Date.now()}`
    });

    return success(res, "run api",response)
  } catch (error) {
    console.error('Error initiating refund:', error);
    return unknownError(res, error, "Internal server .");
  }
}

/**
 * Check status of a refund
 * @param {Object} statusDetails - Refund status check details
 * @returns {Promise} Refund status
 */

async function checkRefundStatus(req , res) {
  try {
    const {txnRefNo , refCancelId } = req.body
    // Validate required parameters
    if (!txnRefNo || !refCancelId) {
       return badRequest(res , 'Transaction reference number and refund cancellation ID are required')
    }
    // Check refund status - use the method name as per the SDK documentation
    const response = await iciciInstance.getRefundStatus({
         encKey: process.env.ICICI_ENC_KEY,
      saltKey: process.env.ICICI_SALT_KEY,
      merchantId: process.env.ICICI_MERCHANT_ID,
      terminalId: process.env.ICICI_TERMINAL_ID,
      bankId: process.env.ICICI_BANK_ID,
      passCode: process.env.ICICI_PASS_CODE,
      txnRefNo: txnRefNo,
      refCancelId: refCancelId
    });
  return success(res, "run api",response)
  } catch (error) {
    console.error('Error checking refund status:', error);
    return unknownError(res, error, "Internal server .");
}
}

module.exports = {
  initiatePayment,
  checkResponse,
  checkPaymentStatus,
  initiateRefund,
  checkRefundStatus
};