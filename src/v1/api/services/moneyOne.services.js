const {
    success,
    unknownError,
    serverValidation,
    badRequest,
    notFound
  } = require("../../../../globalHelper/response.globalHelper")

  const {ConsentRequest,
    ConsentList,
    getFiData,
    getXmlFI,
    getPdf,
    checkBalance,
    getAccountStatement,
    getLatestAccountStatement , AccountAggregatorList, ProductList , webredirection , savePdfAndGetUrl,uploadFile} = require("./handler.services")
    const customerModel = require("../model/customer.model")
    const productModel = require("../model/adminMaster/product.model.js")
    const bankkyc = require("../model/branchPendency/bankStatementKyc.model.js")

   /// Function to call the ConsentReq  //
          // Working Fine //
   async function ParentFunction(req, res) {
    try {
      const { mobileNumber, productID, accountID  } = req.body;
      const {customerId} = req.query;
      // Validate required fields
      if (!mobileNumber || !productID || !accountID) {
        return res.status(400).json({ message: 'Missing required fields: mobileNumber, productID, or accountID' });
      }
  
      // Build dynamic request body
      const dynamicRequestBody = {
        partyIdentifierType: 'MOBILE',
        partyIdentifierValue: mobileNumber,
        productID,
        accountID,
        vua: `${mobileNumber}@onemoney`,
      };
  
      // console.log('Request Body:', dynamicRequestBody);
  
      const consentResponse = await ConsentRequest(dynamicRequestBody);
      if(consentResponse.status =='success'){
        const payload = {
          consentHandle: consentResponse.data.consent_handle,
          userid: `${mobileNumber}@onemoney`,
          // redirectUrl: "https://finexe.fincooper.in/",
          // redirectUrl: `${process.env.MONEY_ONE_BASE_URL}/${customerId}`,
          redirectUrl: `${process.env.MONEY_ONE_BASE_URL}/newFileManagement/redirectPage/`
        }
       const webredireactiondata =  await webredirection(payload);

      //  console.log("Webredirection Response" , webredireactiondata)
       return success(res, 'Consent Request Successful', webredireactiondata);
      }
      return success(res, 'Consent Request Successful', consentResponse);

      
    } 
    catch (error) {
      if(error?.response?.data){
        return badRequest(res , error?.response?.data)
      }
      return unknownError(res, error.message);
  }
}

// async function ParentFunction(req, res) {
//   try {
//     // const { mobileNumber, productID, accountID } = req.body;
//     const {CustomerId} = req.query;
//     if(!CustomerId){
//       return badRequest(res , "Missing required fields: CustomerId")
//     }
//     const CustomerData = await customerModel.findById(CustomerId);
//     if(!CustomerData){
//       return notFound(res , "Customer not found")
//     }

//     const Product = await productModel.findById(CustomerData.productId);
//     if(!Product){
//       return notFound(res , "Product not found")
//     }

//     // Build dynamic request body
//     const dynamicRequestBody = {
//       partyIdentifierType: 'MOBILE',
//       partyIdentifierValue: String(CustomerData.mobileNo || ''),
//       productID: Product.productName,
//       accountID: CustomerData.customerFinId,
//       vua: `${CustomerData.mobileNo}@onemoney`,
//     };

//     console.log('Request Body:', dynamicRequestBody);

//     const consentResponse = await ConsentRequest(dynamicRequestBody);
//     if(consentResponse.status =='success'){
//       const payload = {
//         consentHandle: consentResponse.data.consent_handle,
//         userid: `${CustomerData.mobileNo}@onemoney`,
//         redirectUrl: "https://finexe.fincooper.in/",
//       }

//      const webredireactiondata =  await webredirection(payload);

//     //  console.log("Webredirection Response" , webredireactiondata)
//      return success(res, 'Consent Request Successful', webredireactiondata);
//     }
//     return success(res, 'Consent Request Successful', consentResponse);

    
//   } 
//   catch (error) {
//     if(error?.response?.data){
//       return badRequest(res , error?.response?.data)
//     }
//     return unknownError(res, error.message);
// }
// }
  



// ParentFunction of Consent List  //
// working //
// async function PrepareConsentList(req, res) {
//     try {
//         const { mobileNumber, productID, accountID, status } = req.body;

//         if (!mobileNumber) {
//          return badRequest(res , "Missing required fields: mobileNumber")
//         }

//         const requestBody = {
//             mobileNumber,
//             productID,
//             accountID,
//             status
//         };
 
//         const consentResponse = await ConsentList(requestBody);
//         if(consentResponse){
//             return success(res , "Consent list retrieved successfully" , consentResponse)
//         }     
//     } catch (error) {
//         console.error("Error in PrepareConsentListRequest:", error.message);
//         return unknownError(res , error.message)
//     }
// }

async function PrepareConsentList(req, res) {
  try {
      const { mobileNumber, productID, accountID, status } = req.body;

      if (!mobileNumber) {
          return badRequest(res, "Missing required fields: mobileNumber");
      }

      const requestBody = { mobileNumber, productID, accountID, status };

      const consentResponse = await ConsentList(requestBody);

      // if (consentResponse?.data) {
      //   console.log("Consent Response", consentResponse.data);
      //   // Filter out records where consentID is null and status is PENDING
      //   const filteredData = consentResponse.data.filter(
      //     (item) => !(item.consentID == null)
      // );


      let filteredData = consentResponse.data;
      
    
        // Sort by consentCreationData in descending order to get the latest data first
        const sortedData = filteredData.sort(
            (a, b) => new Date(b.consentCreationData) - new Date(a.consentCreationData)
        );
    
        // Format response
        const responseData = {
            ver: "1.21.0",
            status: "success",
            data: sortedData.length > 0 ? [sortedData[0]] : [], // Return only the latest item
        };
    
        return success(res, "Latest consent retrieved successfully", responseData);
  } catch (error) {
      console.error("Error in PrepareConsentListRequest:", error.message);
      return unknownError(res, error.message);
  }
}



// make a function to call above three function // ----------------------- ///////////// 


async function fetchDataBasedOnType(req, res) {
    try {
      const { dataType , customerId} = req.query;
      const Uploaddata = req.body;

      if (!Uploaddata || Object.keys(Uploaddata).length == 0) {
        return badRequest(res, 'Missing required data in request body.');
      }


      if (!dataType) {
        return badRequest(res, 'Missing required query parameter: dataType');
      }
 

      let result;
      switch (dataType.toLowerCase()) {
        case "json":
          result=await getFiData(Uploaddata);
          break;
  
        case "xml":
          result=await getXmlFI(Uploaddata);
          break;
  
        case "pdf":
          console.log("PDF")
          result=await getPdf(Uploaddata);
          break;

        case "balance":
          result=await checkBalance(Uploaddata);
          break;
  
        default:
         return badRequest(res , "Invalid dataType. Must be 'fi', 'xml', or 'pdf'" )
      }

      // if(result){
      //   return success(res , "Respose" , result)
      // }

      if (result && customerId) {
        await bankkyc.findOneAndUpdate(
          { customerId },
          { $set: { Account_Aggregator_Link: result } },
          { new: true }
        );
      }

      return success(res , "Data fetched successfully" , result)


      
    } catch (error) {
      if(error?.response?.data){
        return badRequest(res , error?.response?.data)
      }
      return unknownError(res , error)
      
    }
  }

async function getAccStatement(req, res) {
  try {
   const {dataType} = req.query;
   const Uploaddata = req.body;

    if (!Uploaddata || Object.keys(Uploaddata).length == 0) {
      return badRequest(res, 'Missing required data in request body.');
    }

    if (!dataType) {
      return badRequest(res, 'Missing required query parameter: dataType');
    }

    let result;
    switch (dataType) {
      case "AccountStatement":
        result= await getAccountStatement(Uploaddata);
        break;

      case "LatestAccountStatement":
        console.log("LatestAccountStatement")
        result= await getLatestAccountStatement(Uploaddata);
        break;

      default:
        return badRequest(res , "Invalid dataType. Must be 'AccountStatement' or 'LatestAccountStatement'")
    }


    return success(res , "Data fetched successfully" , result)

}
catch (error) {
  if(error?.response?.data){
    return badRequest(res , error?.response?.data)
  }
  return unknownError(res , error)
  
}

}


// Get Account Aggregator List // 
async function AggregatorList(req,res){
  try{
    const calledFunction = await AccountAggregatorList();
    return success(res , "Account Aggregator List" , calledFunction)
  }catch(error){
    return unknownError(res , error.message)
  }
}

// Get Product List //

async function Productdata(req,res){
  try{

    const {productid}=req.body;
    if(!productid){
      return badRequest(res , "Missing required fields: productid")
    }
   const Response = await ProductList(req.body);
    return success(res , "Product List" , Response.data)

  }
  catch(error){
    return unknownError(res , error.message)
  }
}





// webHook connection // 

async function handleWebhook(req,res){

  try{

    const { eventType, eventStatus, consentId, eventMessage, timestamp } = req.body;
    console.log("Webhook received:", {
      eventType,
      eventStatus,
      consentId,
      eventMessage,
      timestamp,
    });


    if (eventType === "CONSENT") {
      if (eventStatus === "CONSENT_APPROVED") {
        console.log(`Consent Approved for Consent ID: ${consentId}`);
        return success(res , "Consent Approved for Consent ID" , req.body)
      } 
      else if (eventStatus === "CONSENT_REJECTED") {
        console.log(`Consent Rejected for Consent Handle ID: ${req.body.consentHandle}`);
        return success(res , "Consent Rejected for Consent Handle ID" , req.body)
      }
    } 
    else if (eventType === "DATA") {
      if (eventStatus === "DATA_READY") {
        console.log(`Data is ready for Consent ID: ${consentId}`);
        return success(res , "Data is ready for Consent ID" , req.body)
      } 
      else if (eventStatus === "DATA_DENIED") {
        console.log(`Data denied for Consent ID: ${consentId}`);
        return success(res , "Data denied for Consent ID" , req.body) 
      }
    } 
    else {
      console.warn("Unknown event type received");
      return badRequest(res , "Unknown event type received")
    }

    return success(res , "Webhook received successfully" , req.body)

  }
  catch(error){
    return unknownError(res , error.message)
  }

}
  
module.exports = { ParentFunction  , PrepareConsentList , fetchDataBasedOnType  , getAccStatement , AggregatorList , Productdata , uploadFile };
  