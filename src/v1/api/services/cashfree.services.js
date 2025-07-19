const {
    success,
    unknownError,
    serverValidation,
    badRequest,
} = require("../../../../globalHelper/response.globalHelper");

const axios = require("axios");
require("dotenv").config(path = "../../.env");

const X_CLIENT_ID = process.env.X_CLIENT_ID;
const X_CLIENT_SECRET = process.env.X_CLIENT_CLIENT_SECRET;




async function CashFreePaymentRequest(employeId, productId, amount, userName, mobileNo, branch, loanAmount, roi, tenure, emi, customerDetail , FinId) {
    const orderId = `order_${new Date().getTime()}_${Math.floor(Math.random() * 1000)}`;

    const paymentData = {
        order_id: orderId,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
            customer_id:String(employeId),
            customer_phone: String(mobileNo),
            customer_name: String(userName)


        },
        order_meta: {
            return_url: "https://finexe.fincooper.in/on-boarding/",
            payment_methods: 'cc,dc,upi',
        },

        order_note: "Fin-Cooper",
        order_type: {
            customer_ProductId: String(productId),
            company_Branch: String(branch),
            customer_LoanAmount: String(loanAmount),
            customer_roi: String(roi),
            customer_tenure: String(tenure),
            customer_emi: String(emi),

        }

    };


    const paymentUrl = 'https://api.cashfree.com/pg/orders';
    // const paymentUrl = 'https://sandbox.cashfree.com/pg/orders';

    try {
        const response = await axios.post(paymentUrl, paymentData, {
            headers: {
                'x-api-version': '2022-09-01',
                'content-type': 'application/json',
                'x-client-id': X_CLIENT_ID,
                'x-client-secret': X_CLIENT_SECRET,
            },
        });


        if (response.data && response.data.payments && response.data.payments.url) {
            // Return the actual payment URL for the frontend to redirect users
            return {
                success: true,
                paymentUrl: response.data.payments.url, // Correct URL for payment
                sessionId: response.data.payment_session_id,
                orderId,
                amount
            };
        } else {
            throw new Error('Payment Request Failed: Invalid response structure');
        }
    } catch (error) {
        console.error('Error in CashFreePaymentRequest:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Payment Request Failed');  // Throw specific error message
    }
}



// CashFree Payment Link Request //
async function CashFreePaymentLinkRequest(employeId, productId, amount, userName, mobileNo, branch, loanAmount, roi, tenure, emi, customerDetail, FinId) {
    const linkId = `order_${new Date().getTime()}_${Math.floor(Math.random() * 1000)}`;

    const paymentData = {
        link_id: linkId,
        link_amount: amount,
        link_currency: 'INR',
        link_purpose: "Fin-Cooper Payment",
        customer_details: {
            customer_id: String(employeId),
            customer_phone: String(mobileNo),
            customer_name: String(userName),
            customer_email: customerDetail.email || ""
        },
        link_meta: {
            return_url: "https://finexe.fincooper.in/on-boarding/",
        
            payment_methods: 'cc,dc,upi',
        },

        link_notify: {

            "send_email": true,
        },
        link_notes: {
            customer_ProductId: String(productId),
            company_Branch: String(branch),
            customer_LoanAmount: String(loanAmount),
            customer_roi: String(roi),
            customer_tenure: String(tenure)
        }
    };

    const paymentUrl = 'https://api.cashfree.com/pg/links';
    // const paymentUrl = 'https://sandbox.cashfree.com/pg/links';

    try {
        const response = await axios.post(paymentUrl, paymentData, {
            headers: {
                'x-api-version': '2022-09-01',
                'x-client-id': X_CLIENT_ID,
                'x-client-secret': X_CLIENT_SECRET,
                'Content-Type': 'application/json',
            },
        });


        if (response.data && response.data.link_url) {
            return {
                success: true,
                paymentLink: response.data.link_url,
                linkId,
                amount
            };
        } else {
            throw new Error('Payment Link Request Failed: Invalid response structure');
        }
    } catch (error) {
        console.error('Error in CashFreePaymentLinkRequest:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Payment Link Request Failed');
    }
}



//Order Pay //










module.exports = {CashFreePaymentRequest , CashFreePaymentLinkRequest};
