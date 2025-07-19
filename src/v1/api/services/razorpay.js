const {
  success,
  unknownError,
  serverValidation,
  badRequest,
} = require("../../../../globalHelper/response.globalHelper");

const axios = require("axios");
const Razorpay = require('razorpay');

const razorpay_Api_key = process.env.RAZOR_PAY_API_KEY
const razorpay_Secret_key = process.env.RAZOR_PAY_SECRET_KEY
 var instance = new Razorpay({ key_id: razorpay_Api_key, key_secret: razorpay_Secret_key });

 async function createOrder(employeId, productId, amount, userName, mobileNo,branch,loanAmount,roi,tenure,emi, customerDetail) {
  try {
    const data = await instance.orders.create({
      amount: amount, // Amount in paise (multiply by 100 to convert to paise)
      currency: "INR",
      receipt: "Fin-Cooper",
      notes: {
        employeId: String(employeId),
        productId: String(productId),
        executive_Name: String(userName),
        customer_Mobile: String(mobileNo),
        company_Branch: String(branch), 
        customer_LoanAmount: String(loanAmount), 
        customer_roi: String(roi),
        customer_tenure: String(tenure), 
        customer_emi: String(emi), 
        customer_id: String(customerDetail) 
      }
    });
    console.log("data",data);
    return data; 
  } catch (e) {
    console.log(e);
    return false; 
  }
}


// Route to get all payment history
async function getPaymentHistory(req, res) {
  try {
    const account_number = req.query.accountNumber;
    
    // Create a base64 encoded string of the API key and secret
    const auth = Buffer.from(`${razorpay_Api_key}:${razorpay_Secret_key}`).toString('base64');
    
    const response = await axios.get(`https://api.razorpay.com/v1/transactions?account_number=924020036958406`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    return success(res, "Payment History Retrieved From Razorpay", response.data);
  } catch (error) {
    console.error('Error fetching payment history:', error.response ? error.response.data : error.message);
    return unknownError(res, error.response ? error.response.data : error.message);
  }
}


async function getAllPayments(count=Count || 100, skip = Skip || 0) {
  try {

    // console.log("count",count);
    // console.log("skip",skip); 
 
    const params = {
      count,
      skip   
    }

    const url = 'https://api.razorpay.com/v1/payments';
    const response = await axios.get(url, {
      auth: {
        username: razorpay_Api_key, 
        password: razorpay_Secret_key
      },
      params
    });
    return response.data; 
  } catch (error) {
      console.error("Error retrieving payments:", error.message);
       throw new Error("Failed to retrieve payments from Razorpay API.");
  }
}



module.exports = {
    createOrder,
    getPaymentHistory,
    getAllPayments
}


//  async function createOrder(employeId,productId, amount,executiveName,branch,loanAmount,roi,tenure, emi, mobileNo,customerDetail) {
//   try {

//     const data = await instance.orders.create({
//       amount: amount,
//       currency: "INR",
//       receipt: "Fin-Cooper",
//       notes: {
//         "employeId": String(employeId),
//         "productId": String(productId),
//         "executive_Name": String(executiveName),
//         "customer_Mobile": String(mobileNo),
//         "company_Branch": String(branch),
//         "customer_LoanAmount": String(loanAmount),
//         "customer_roi": String(roi),
//         "customer_tenure": String(tenure),
//         "customer_emi": String(emi),
//         "customer_id": String(customerDetail)
//       }
//     });
//     return data;
//   } catch (e) {
//     console.log(e);
//     return false;
//   }
// }