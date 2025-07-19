const crypto = require('crypto');
const axios = require('axios');
const {encrypt , decrypt} = require("./crypto.services")
const {
    success,
    unknownError,
    serverValidation,
    badRequest,
  } = require("../../../../globalHelper/response.globalHelper");
  require('dotenv').config('../.env');

  const bankStatementModel = require("../model/branchPendency/bankStatementKyc.model");
  const customerModel = require("../model/customer.model")
  const productModel = require("../model/adminMaster/product.model")
  const applicantModel = require("../model/applicant.model")
  const {eNachEmail} = require("../controller/functions.Controller")
  const processModel = require("../model/process.model.js");

const moment = require('moment');
// constant //

// const merchantId = "884938";
// const subbillerId = "661863";
// const encryptionKey = 'MTav/UkKf2z/WMiq'; 

const merchantId = process.env.E_NACH_MERCHANT_ID;
const subbillerId = process.env.E_NACH_SUBBILLER_ID;
const encryptionKey = process.env.E_NACH_ENCRYPTION_KEY;





// Register eNach //

// const registerNach = async (req, res) => {
//     try {
//         const requiredFields = [
//             'trxnno', 'enach_amount', 'frequencydeduction', 'mandatestartdate', 'mandateenddate',
//             'accountholdername', 'authenticationmode', 'accountnumber', 'accounttype', 'mobileno', 'emailid',
//             'responseurl', 'redirecturl', 'bankcode', 'debittype', 'mandatecategory', 'enach_payment',
//             'product_name',  'aadharNo'
//         ];

//         const missingFields = requiredFields.filter((field) => !req.body[field]);
//         if (missingFields.length > 0) {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Missing required fields',
//                 data: missingFields
//             });
//         }

//         const {
//             trxnno, enach_amount, frequencydeduction, mandatestartdate, mandateenddate,
//             accountholdername, authenticationmode, accountnumber, accounttype, mobileno, emailid,
//             responseurl, redirecturl, bankcode, debittype, mandatecategory, product_name, aadharNo,
//             enach_payment, payername, untilcancelled, pan
//         } = req.body;

//         const payload = {
//             accountholdername, accounttype, authenticationmode, bankcode, debittype, emailid, mandatecategory,
//             accountnumber, enach_amount, enach_payment, mandatestartdate, mandateenddate, frequencydeduction,
//             product_name, mobileno, redirecturl, responseurl, trxnno, merchantid:merchantId, subbillerid:subbillerId,
//             aadharNo, payername, untilcancelled, pan
//         };

//         // console.log('Payload:', payload);
//         const encryptedPayload = encrypt(JSON.stringify(payload), encryptionKey);
//         const requestData = {
//             param: `${encryptedPayload}`,
//         };
       


//         const response = await axios.post('https://uat.camspay.com/api/v1/instanach', requestData);
//         if (!response) {
//             return badRequest(res, 'No valid response data from NPCI');
//         }

//         const responseData = {
//             ResposeUrl: response?.request?.res?.responseUrl || '',
//             // CurrentUrl: response?.request?._redirectable?._currentUrl,
//             RedirectUrl: response?.request?.res?.redirects || '',
//             data: response.data
             
//         };

        
//         try {

//            if(!responseData){
//                return badRequest(res, 'Transaction Failed.', responseData)
//               }

//              return success(res, 'Transaction Success.', responseData) 

//             // console.log("Parsed Response", npcResponse);

//             // if (npcResponse.status === 'FAILURE') {
//             //     return badRequest(res, 'Transaction Failed.', npcResponse);
//             // }

//             // if (npcResponse.status === 'PENDING') {
//             //     return success(res, 'Awaiting Response from NPCI/Bank', npcResponse);
//             // }

//             // if (npcResponse.status === 'LODGED') {
//             //     return badRequest(res, 'Lodged at NSDL', npcResponse);
//             // }

//             // if (npcResponse.status === 'SUCCESS') {
//             //     return success(res, 'Transaction Success.', npcResponse);
//             // }
//         } catch (err) {
//             // If parsing fails, handle it as a non-JSON response
//             console.error("Error parsing response data", err);
//             return badRequest(res, 'Invalid response format from NPCI');
//         }

//     } catch (err) {
//         console.log(err);
//         return unknownError(res, err.message);
//     }
// };

function validateCancellationInput(req) {
    const { consumer_ref_no, umrn, amount, rejected_by,reason_desc } = req.body;
    const errors = [];
  
    if (consumer_ref_no && !/^[a-zA-Z0-9]{1,35}$/.test(consumer_ref_no)) {
      errors.push('consumer_ref_no must be alphanumeric and up to 35 characters. Example: NEC3225633');
    }
  
    if (umrn && !/^[a-zA-Z0-9]{1,20}$/.test(umrn)) {
      errors.push('trxn_no must be alphanumeric and up to 50 characters. Example: HDFC701XXXX01006');
    }
  
   if (amount && !/^[0-9]{1,10}$/.test(amount)) {
      errors.push('amount must be numeric and up to 10 characters. Example: 100');
    }

    if (rejected_by && !/^[a-zA-Z\s']{1,100}$/.test(rejected_by)) {
      errors.push('rejected_by must be character and up to 50 characters. Example: ADMIN');
    }

    if (reason_desc && !/^[a-zA-Z\s']{1,100}$/.test(reason_desc)) {
        errors.push("reason_desc must contain only alphabetic characters, spaces, and apostrophes, and be up to 100 characters. Example: Customer's Request");
    }
  
    return errors;
  }

  function validateInput(req) {
    const { consumer_ref_no, created_date, trxn_no, merchantid, subbillerid, status } = req.body;
    const errors = [];
  
    if (consumer_ref_no && !/^[a-zA-Z0-9]{1,35}$/.test(consumer_ref_no)) {
      errors.push('consumer_ref_no must be alphanumeric and up to 35 characters.');
    }
  
    if (created_date && !/^\d{2}-[A-Za-z]{3}-\d{4}$/.test(created_date)) {
      errors.push('created_date must be in DD-MMM-YYYY format (e.g., 09-Feb-2021).');
    }
  
    if (trxn_no && !/^[a-zA-Z0-9]{1,50}$/.test(trxn_no)) {
      errors.push('trxn_no must be alphanumeric and up to 50 characters.');
    }
  
    // if (!merchantid || !/^[a-zA-Z0-9]{1,10}$/.test(merchantid)) {
    //   errors.push('merchantid is required and must be alphanumeric and up to 10 characters.');
    // }
  
    // if (!subbillerid || !/^[a-zA-Z0-9]{1,10}$/.test(subbillerid)) {
    //   errors.push('subbillerid is required and must be alphanumeric and up to 10 characters.');
    // }
  
    if (status && !['F', 'S'].includes(status)) {
      errors.push('status must be either "F" (Failure) or "S" (Success).');
    }
  
    return errors;
  }



// const registerNach = async (req, res) => {
//     try {
//       const requiredFields = [
//         'trxnno',
//         'enach_amount',
//         'frequencydeduction',
//         'mandatestartdate',
//         'mandateenddate',
//         'accountholdername',
//         'authenticationmode',
//         'accountnumber',
//         'accounttype',
//         'mobileno',
//         'emailid',
//         'responseurl',
//         'redirecturl',
//         'bankcode',
//         'debittype',
//         'mandatecategory',
//         'enach_payment',
//         'product_name',
//       ];
  
//       const missingFields = requiredFields.filter((field) => !req.body[field]);
//       if (missingFields.length > 0) {
//         return badRequest(res, missingFields);
//       }
//       const {
//         trxnno,
//         enach_amount,
//         frequencydeduction,
//         mandatestartdate,
//         mandateenddate,
//         accountholdername,
//         authenticationmode,
//         accountnumber,
//         accounttype,
//         mobileno,
//         emailid,
//         responseurl,
//         redirecturl,
//         bankcode,
//         debittype,
//         mandatecategory,
//         product_name,
//         aadharNo,
//         enach_payment,
//         payername,
//         untilcancelled,
//         pan,
//       } = req.body;
  
//       const payload = {
//         accountholdername,
//         accounttype,
//         authenticationmode,
//         bankcode,
//         debittype,
//         emailid,
//         mandatecategory,
//         accountnumber,
//         enach_amount,
//         enach_payment,
//         mandatestartdate,
//         mandateenddate,
//         frequencydeduction,
//         product_name,
//         mobileno,
//         redirecturl,
//         responseurl,
//         trxnno,
//         merchantid: merchantId,
//         subbillerid: subbillerId,
//         aadharNo,
//         payername,
//         untilcancelled,
//         pan,
//       };
  
//       const encryptedPayload = encrypt(JSON.stringify(payload), encryptionKey);
//       const requestData = { param: `${encryptedPayload}` };
  
//       // const response = await axios.post('https://uat.camspay.com/api/v1/instanach', requestData);
//       const response = await axios.post('https://cppro1.camspay.com/api/v1/instanach', requestData);
  
//       if (!response) {
//         return badRequest(res, 'No valid response data from NPCI');
//       }
//       console.log('Response:', response);
  
//       const responseData = response.data;
  

//       if (responseData && responseData.res) {
//         const encryptedResponseParts = responseData?.res?.split('.');
//         const iv = encryptedResponseParts[0];
//         const encryptedData = encryptedResponseParts[1];
  
//         const decryptedResponse = decrypt(encryptedData, encryptionKey, iv);
//         const parsedResponse = JSON.parse(decryptedResponse);

    
  
//         if (
//           parsedResponse.status === 'FAILURE' &&
//           (parsedResponse.errCode === 'RC000' || parsedResponse.errCode === '0000')
//         ) {
//           return badRequest(res, parsedResponse);
//         } else if (parsedResponse.status === 'PENDING') {
//           return success(res, 'Awaiting Response from NPCI/Bank', parsedResponse);
//         } 

   

//       }

//       else {
//         if(response?.request?.res?.responseUrl){
//             return success(res, 'Transaction Proceed.', {responseUrl: response?.request?.res?.responseUrl});
//         }
//         else{
//             return badRequest(res, 'Transaction Failed.', response);
//         }
//     }
//     } catch (err) {
//       console.error('Error processing eNach:', err);
//       return unknownError(res, err.message);
//     }
//   };

function formatMandateStartDate(ddmmyyyy) {
  // Extract day, month, and year from DDMMYYYY
  const day = ddmmyyyy.slice(0, 2);
  const month = ddmmyyyy.slice(2, 4) - 1; // Subtract 1 because months are 0-indexed
  const year = ddmmyyyy.slice(4, 8);

  // Create a new Date object
  const date = new Date(year, month, day);

  // Format the date as DD-MMM-YYYY
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  return new Intl.DateTimeFormat('en-GB', options)
    .format(date)
    .replace(/ /g, '-'); // Replace all spaces with hyphens
}


const registerNach = async (req, res) => {
  try {
    const {authenticationmode} = req.body;
    if(!authenticationmode){
        return badRequest(res, 'Authentication Mode is required');
    }
    const customerId = req.query.customerId;

    if (!customerId) {
      return badRequest(res, 'Invalid Request: Missing Customer ID');
    }

    const bankDetails = await bankStatementModel.findOne({ customerId });

    if (!bankDetails || !Array.isArray(bankDetails.bankDetails) || bankDetails.bankDetails.length === 0) {
      return badRequest(res, 'No valid bank details found for the given customer ID.');
    }

    const filteredBankDetails = bankDetails.bankDetails.filter(
      item => item.E_Nach_Remarks == 'true'
    );

    if (filteredBankDetails.length === 0) {
      return badRequest(res, 'No bank details found with E_Nach_Remarks set to true.');
    }


    const customerData = await customerModel.findById(bankDetails.customerId).select('productId customerFinId');
    if (!customerData) {
      return badRequest(res, 'Customer not found');
    }

    const applicantData = await applicantModel
      .findOne({ customerId: bankDetails.customerId })
      .select('aadharNo panNo email mobileNo');
    if (!applicantData) {
      return badRequest(res, 'Applicant not found');
    }

    let productData = null;
    if (customerData.productId) {
      productData = await productModel.findById(customerData.productId).select('productName');
      if (!productData) {
        return badRequest(res, 'Product not found');
      }
    }


    // Prepare new payload for further processing
    const newPayload = {
      trxnno:customerData.customerFinId,
      mobileNo: applicantData.mobileNo,
      email: applicantData.email,
      pan: applicantData.panNo,
      product_name: productData?.productName,
      accountholdername: filteredBankDetails[0].acHolderName,
      accounttype: filteredBankDetails[0].accountType,
      accountnumber: filteredBankDetails[0].accountNumber,
      bankcode: filteredBankDetails[0]?.ifscCode?.substring(0, 4),
      enach_amount: filteredBankDetails[0].e_Nachamount,
      aadharNo: applicantData.aadharNo,
      
    };

    const date = new Date();
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Kolkata' };
    const formattedDate = new Intl.DateTimeFormat('en-GB', options).format(date).replace(/\//g, '');


  let mandateEndDate = filteredBankDetails[0].mandate_end_date;
  mandateEndDate = moment(mandateEndDate).format('DDMMYYYY');
   console.log('Mandate End Date:', mandateEndDate);


    // Define payload for encryption
    const payload = {
      trxnno: newPayload.trxnno,
      enach_amount: filteredBankDetails[0].e_Nachamount,
      frequencydeduction: 'MNTH',
      mandatestartdate: formattedDate,
      mandateenddate: mandateEndDate,
      accountholdername: newPayload.accountholdername,
      authenticationmode:authenticationmode,
      accountnumber: newPayload.accountnumber,
      accounttype: newPayload.accounttype=="Savings"?"SA":"CA",
      mobileno: String(newPayload.mobileNo),
      emailid: newPayload.email,
      responseurl: `${process.env.BASE_URL}/finalapprovalform/${customerId}/?tab=6?bank`,
      redirecturl: `${process.env.BASE_URL}/finalapprovalform/${customerId}/?tab=6?bank`,
      bankcode: newPayload.bankcode,
      debittype: 'M',
      mandatecategory: 'L001',
      product_name: newPayload.product_name,
      pan: newPayload.pan,
      enach_amount: filteredBankDetails[0].e_Nachamount,
      aadharNo: newPayload.aadharNo,
      enach_payment:"EN",
      merchantid:merchantId, 
      subbillerid:subbillerId,
      
    };

    console.log('Payload:', payload);

    // Encrypt payload
    const encryptedPayload = encrypt(JSON.stringify(payload), encryptionKey);
    const requestData = { param: `${encryptedPayload}` };

    // Send request to eNach API
    const response = await axios.post('https://cppro1.camspay.com/api/v1/instanach', requestData);
    if (!response) {
      return badRequest(res, 'No valid response data from NPCI');
    }



    // Process encrypted response
    const responseData = response.data;
    if (responseData && responseData.res) {
      const [iv, encryptedData] = responseData.res.split('.');
      const decryptedResponse = decrypt(encryptedData, encryptionKey, iv);
      const parsedResponse = JSON.parse(decryptedResponse);


      if (parsedResponse.status === 'FAILURE' && ['RC000', '0000'].includes(parsedResponse.errCode)) {
        return badRequest(res, parsedResponse);
      } else if (parsedResponse.status === 'PENDING') {
        return success(res, 'Awaiting Response from NPCI/Bank', parsedResponse);
      } else {
        return success(res, 'Transaction Proceeded Successfully', parsedResponse);
      }
    }


    // Fallback for unexpected response
    if(response?.request?.res?.responseUrl) {
      const updateBankDetails = await bankStatementModel.findOneAndUpdate(
        { customerId },
        {
          $set: {
            "bankDetails.$[elem].mandate_start_date": formatMandateStartDate(payload.mandatestartdate)
          },
        },
        {
          arrayFilters: [{ "elem.E_Nach_Remarks": true }], 
          new: true, 
        }
      );

      const addUrl = await bankStatementModel.findOneAndUpdate(
        { customerId },
        {
          $set:{
            Nachlink: response.request.res.responseUrl
          }
        }
      )

    //   const html = `
    //   <p>Dear ${payload.accountholdername},</p>
    //   <p>Your eNach registration has been initiated successfully. Please check your email for further instructions.</p>
    //   <p>Click the button below to proceed:</p>
    //   <p><a href="${response?.request?.res?.responseUrl}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Click Here</a></p>
    //   <p>Thank you.</p>
    // `;
    //   await eNachEmail(newPayload.email, "harshalpawar013@gmail.com", 'eNach Registration Initiated', html);
    //   console.log("Email sent successfully");

       success(res, 'Transaction Proceeded.', {
        responseUrl: response.request.res.responseUrl,
      });
      await processModel.findOneAndUpdate(
        { customerId },
        { $set: {
          enachLink:true
        } },
        { new: true }
    );
    await finalApprovalSheet(customerId)
    } else {
      return badRequest(res, 'Transaction Failed.', response.data);
    }
  } catch (err) {
    console.error('Error processing eNach:', err);
    return unknownError(res, err.message);
  }
};

  

const handlecallback = async (req, res) => {
    try {
        let { encryptedResponse} = req.body;

        if (!encryptedResponse) {
            return badRequest(res, 'Invalid Request');
        }

        // split by . to get the id, iv and encrypted data

        encryptedResponse = encryptedResponse.split('.');
        let iv = encryptedResponse[0];
        let  encryptedData = encryptedResponse[1];

        console.log('IV:', iv);
        
 
        const decryptedResponse = decrypt(encryptedData, encryptionKey, iv);

        const response = JSON.parse(decryptedResponse);
        return success(res, 'eNach Response', response);
    } catch (err) {
        console.log(err);
        return unknownError(res, err.message);
    }
};

// Validate Input //




  async function enachStatusCheck(req, res) {
    try {
      const validationErrors = validateInput(req);
      if (validationErrors.length > 0) {
        return badRequest(res,  validationErrors);
      }
  
      const { consumer_ref_no, created_date, trxn_no, status } = req.body;
  
      const payload = {
        consumer_ref_no,
        created_date,
        trxn_no,
        merchantid: merchantId,
        subbillerid: subbillerId,
        status,
      };

      const encryptedPayload = encrypt(JSON.stringify(payload), encryptionKey);

      const requestData = { param: `${encryptedPayload}` };
  
      // const response = await axios.post('https://uat.camspay.com/api/v1/enachStatusCheck', requestData);
      const response = await axios.post('https://cppro1.camspay.com/api/v1/enachStatusCheck', requestData);
      if (!response) {
        return badRequest(res, 'No valid response data from NPCI');
      }

  
      const responseData = response.data;
      if (responseData && responseData.res) {
        const encryptedResponseParts = responseData?.res?.split('.');
        const iv = encryptedResponseParts[0];
        const encryptedData = encryptedResponseParts[1];
  
        const decryptedResponse = decrypt(encryptedData, encryptionKey, iv);
        const parsedResponse = JSON.parse(decryptedResponse);
        console.log('Parsed Response:', parsedResponse);
  
        if (
          parsedResponse.status === 'FAILURE' || parsedResponse.status === 'FAIELD' &&
          (parsedResponse.errCode === 'RC000' || parsedResponse.errCode === '0000')
        ) {
          return badRequest(res, parsedResponse);
        } else if (parsedResponse.status === 'PENDING') {
          return success(res, 'Awaiting Response from NPCI/Bank', parsedResponse);
        } else if (parsedResponse.status === 'SUCCESS') {
          return success(res, 'Checked Status', parsedResponse);
        }
      }
  
      return badRequest(res, 'Invalid Response', responseData);
    } catch (err) {
      console.error('Error processing eNach status check:', err);
      return unknownError(res, err.message);
    }
  }


  // Handle eNach Cancellation // 

  async function cancelNach(req, res) {
    try {
      const validationErrors = validateCancellationInput(req);
      if (validationErrors.length > 0) {
        return badRequest(res, validationErrors);
      }
  
      const { consumer_ref_no, umrn, amount, rejected_by , reason_desc } = req.body;
  
      const payload = {
        merchantid: merchantId,
        subbillerid: subbillerId,
        consumer_ref_no,
        umrn,
        amount,
        rejected_by,
        reason_desc
      };
  
      const encryptedPayload = encrypt(JSON.stringify(payload), encryptionKey);
      const requestData = { param: `${encryptedPayload}` };
      console.log('Payload:', requestData);
  
      // const response = await axios.post('https://uat.camspay.com/api/v1/enachCancellation', requestData);
      const response = await axios.post('https://cppro1.camspay.com/api/v1/enachCancellation', requestData);
      if (!response) {
        return badRequest(res, 'No valid response data from NPCI');
      }
  
      const responseData = response.data;
      console.log('Response:', responseData);
      if (responseData && responseData.res) {
        const encryptedResponseParts = responseData?.res?.split('.');
        const iv = encryptedResponseParts[0];
        const encryptedData = encryptedResponseParts[1];
  
        const decryptedResponse = decrypt(encryptedData, encryptionKey, iv);
        const parsedResponse = JSON.parse(decryptedResponse);
        console.log('Parsed Response:', parsedResponse);
        if(parsedResponse.status == 'FAILED'){
            return badRequest(res, parsedResponse);
        }
        else if(parsedResponse.MandateResList[0].REFERENCENO == '0000'){
           return badRequest(res,  parsedResponse);
        }
      //  const mandateRes = parsedResponse.MandateResList[0];
    
      //  if(mandateRes.REMARKS == 'No Record found' || mandateRes.REFERENCENO == '0000'){
      //   return success(res, 'No Record Found.', parsedResponse);
      //  }
      //  switch (mandateRes.STATUS) {
      //    case 'X':
      //      return success(res, 'Cancellation is Successful.', parsedResponse);
      //    case 'XR':
      //      return success(res, 'Cancellation is Rejected – (Rejected Reason will be in REASONDESC parameter)', parsedResponse);
      //    case 'C':
      //      return success(res, 'Cancellation Received via API.', parsedResponse);
      //    case 'CG':
      //      return success(res, 'Cancellation Feed Generation in progress.', parsedResponse);
      //    case 'CP':
      //      return success(res, 'Cancellation Feed Submitted to NPCI.', parsedResponse);
      //    default:
      //      return badRequest(res, 'Invalid Status', parsedResponse);
      //  }
     }
         
    } catch (err) {
      console.error('Error processing eNach cancellation:', err);
      return unknownError(res, err.message);
    }
  }

  // 1.	UPI AutoPay Valid VPA API //
  //This is used to make transaction request from merchant to CAMS Pay for checking the Payer VPA valid or not for the UPI Mandate creation. //

  function validateMandateInput(req) {
    const { vpa } = req.body;
    const errors = [];
  
    // Validate vpa (payer VPA)
    if (!vpa || typeof vpa !== 'string' || vpa.length > 100) {
      errors.push('vpa is required and must be a string with a maximum length of 100 characters.');
    }
  
    return errors;
  }
  

  async function upiAutoPayValidVpa(req, res) {
    try {
      const validationErrors = validateMandateInput(req);
      if (validationErrors.length > 0) {
        return badRequest(res, validationErrors);
      }
  
      const { vpa } = req.body;
  
      const payload = {
        vpa,
        merchantid: merchantId,
        subbillerid: subbillerId,
        
      };

      console.log('Payload:', payload);

  
      const encryptedPayload = encrypt(JSON.stringify(payload), encryptionKey);
      const requestData = { param: `${encryptedPayload}` };


  
      const response = await axios.post('https://uat.camspay.com/api/v1/validvpa', requestData);
      if (!response) {
        return badRequest(res, 'No valid response data from NPCI');
      }

      console.log('Response:', response);

    
      const responseData = response.data;
      if (responseData && responseData.res) {
        const encryptedResponseParts = responseData?.res?.split('.');
        const iv = encryptedResponseParts[0];
        const encryptedData = encryptedResponseParts[1];
  
        const decryptedResponse = decrypt(encryptedData, encryptionKey, iv);
        const parsedResponse = JSON.parse(decryptedResponse);

        console.log('Parsed Response:', parsedResponse);
  
        if (
          (parsedResponse.status == 'FAILURE' || parsedResponse.status == 'FAILED') &&
          (parsedResponse.errCode === 'RC000' || parsedResponse.errCode === '0000')
        ) 
        {
          return badRequest(res, parsedResponse);
        } 
        else if (parsedResponse.status === 'SUCCESS') {
          return success(res, 'Valid VPA', parsedResponse);
        }
      }
  
      return badRequest(res, 'Invalid Response', responseData);
    } catch (err) {
      console.error('Error processing UPI AutoPay Valid VPA:', err);
      return unknownError(res, err.message);
    }
  }



  // UPI AutoPay Revoke API // 
    async function upiAutoPayRevoke(req, res) {
        try{
            
            const {refno} = req.body;
            if(!refno){
                return badRequest(res, 'Invalid Request');
            }

            const payload = {
                refno
            };


            const encryptedPayload = encrypt(JSON.stringify(payload), encryptionKey);
            const requestData = { param: `${encryptedPayload}` };
            const response = await axios.post('https://uat.camspay.com/api/v1/mandaterevoke', requestData);
            console.log('Response:', response);
            if (!response) {
                return badRequest(res, 'No valid response data from NPCI');
            }
            const responseData = response.data;
            if (responseData && responseData.res) {
              const encryptedResponseParts = responseData?.res?.split('.');
              const iv = encryptedResponseParts[0];
              const encryptedData = encryptedResponseParts[1];
      
              const decryptedResponse = decrypt(encryptedData, encryptionKey, iv);
              const parsedResponse = JSON.parse(decryptedResponse);
      
              if (parsedResponse.status == 'REVOKED')
               {
                return success(res, 'UPI AutoPay Revoked', parsedResponse);
              } 
              else if (parsedResponse.status == 'FAILURE') {
                return badRequest(res,  parsedResponse);
              }

            }   
        }
        catch(err){
            console.error('Error processing UPI AutoPay Revoke:', err);
            return unknownError(res, err.message);
        }
    }







module.exports = {registerNach, handlecallback , enachStatusCheck , cancelNach , upiAutoPayValidVpa , upiAutoPayRevoke};