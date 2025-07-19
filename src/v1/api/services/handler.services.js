const axios = require("axios");
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { uploadFileToSpaces } = require("../../../../globalHelper/uploadfileSpace")



const ClientId = process.env.MONEY_CLIENT_ID
const client_secret = process.env.MONEY_CLIENT_SECRET
const organisationId = process.env.MONEY_ORGANISATION_ID
const appIdentifier = process.env.MONEY_APPIDENTIFIER

const headers = {
  'Content-Type': 'application/json',
  'client_id': ClientId,
  'client_secret': client_secret,
  'organisationId': organisationId,
  'appIdentifier': appIdentifier,
};

const ONE_MONEY_BASE_URL = process.env.MONEY_BASE_URL;



const uploadToSpaces = require('../services/spaces.service');




// Consent Request
async function ConsentRequest(requestBody) {
  try {
    const config = {
      method: 'post',
      url: `${ONE_MONEY_BASE_URL}/v2/requestconsent`,
      headers,
      data: requestBody,
    };


    const response = await axios(config);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Consent List
async function ConsentList(requestBody) {
  try {
    const config = {
      method: 'post',
      url: `${ONE_MONEY_BASE_URL}/getconsentslist`,
      headers,
      data: requestBody,
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('Error in ConsentList:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Consent List Fetch Failed');
  }
}

// Get FI Data
/**
 * 
 Use this API to get the Transactions, for a date-range allowed by your customer in her consent, for one or more accounts included in her consent.

The API currently supports transactions of the following account types: Current, Savings, Fixed Deposit, Recurring Deposit.

If you are building a Spend Analysis feature, this may be the best API to use to just get transactions periodically.
 */

// get all fi data of transactions //
async function getFiData(requestBody) {
  try {
    const data = JSON.stringify({
      linkReferenceNumber: requestBody.linkRefNumber[0],
      consentID: requestBody.consentID,
    });

    const config = {
      method: 'post',
      maxContentLength: Infinity,
      url: `${ONE_MONEY_BASE_URL}/getfidata`,
      headers,
      data,
    };
    const response = await axios(config);
    return response.data;
  } 
  catch (error) {
   throw error;
}
}


function saveXmlAndGetUrl(rawXmlData) {
  try {
    const baseDir = path.join(__dirname, '../../../../', 'uploads/');
    const outputDir = path.join(baseDir, 'xml/');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const fileName = `document_${Date.now()}.xml`;
    const filePath = path.join(outputDir, fileName);

    fs.writeFileSync(filePath, rawXmlData, 'utf8');

    console.log(`XML saved successfully at: ${filePath}`);
    const fileUrl = `http://localhost:5500/uploads/xml/${fileName}`;
    return fileUrl;
  } catch (error) {
    console.error('Error saving XML:', error);
    throw new Error('Failed to save XML file');
  }
}


// Get XML FI Data of Transactions
// async function getXmlFI(requestBody) {
//   try {
//     const data = JSON.stringify({
//       linkReferenceNumber: requestBody.linkRefNumber[0],
//       consentID: requestBody.consentID,
//     });

//     console.log('Request Body:', data);

//     // const config = {
//     //   method: 'post',
//     //   url: 'https://fincoopers-uat.moneyone.in/xml/getfidata',
//     //   headers,
//     //   data,
//     // };
    

//     const response = await axios.post('https://fincoopers-uat.moneyone.in/xml/getfidata', data, {headers});
//     if (!response.data) {
//       throw new Error('No data returned from the API');
//     }

//     const XMLdata = saveXmlAndGetUrl(!response.data[0].xmlData);
//     // console.log('PDF Response:', XMLdata);
//     return XMLdata;
//   } catch (error) {
//     throw error;
//   }
// }


async function getXmlFI(requestBody) {
  try {
    const data = JSON.stringify({
      linkReferenceNumber: requestBody.linkRefNumber[0],
      consentID: requestBody.consentID,
    });

    // const config = {
    //   method: 'post',
    //   maxContentLength: Infinity,
    //   url: 'https://fincoopers-uat.moneyone.in/xml/getfidata',
    //   headers,
    //   data,
    // };

    // Make the API request and get the XML data
    const response = await axios.post(`${ONE_MONEY_BASE_URL}/xml/getfidata`, data, {headers});


    const xmlBuffer = response.data.data[0].xmlData

    // console.log('XML Response:', xmlBuffer);
    // const buffer = Buffer.from(xmlBuffer, 'base64');
    const filePathInBucket = `${process.env.PATH_BUCKET}/LOS/XML/${Date.now()}_transactions.xml`;
    const contentType = 'application/xml';
    const bucketName = 'finexe'; // Replace with your actual bucket name


    const NewData = await uploadToSpaces(
      bucketName,
      filePathInBucket,
      xmlBuffer,
      'public-read',
      contentType
    )

    const fileUrl = `https://cdn.fincooper.in/${filePathInBucket}`;
    console.log('XML uploaded successfully:', fileUrl);
    return fileUrl;
  } catch (error) {
    console.error('Error while processing XML:', error);
    throw error;
  }
}



function savePdfAndGetUrl(rawPdfData, req) {
  try {
    const baseDir = path.join(__dirname, '../../../../', 'uploads/');
    const outputDir = path.join(baseDir, 'pdf/');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const fileName = `document_${Date.now()}.pdf`;
    const filePath = path.join(outputDir, fileName);

    fs.writeFileSync(filePath, Buffer.from(rawPdfData, 'binary'));

    console.log(`PDF saved successfully at: ${filePath}`);

    const fileUrl = `https://stageapi.fincooper.in/uploads/pdf/${fileName}`;
    return fileUrl;
  } catch (error) {
    console.error('Error saving PDF:', error);
    throw new Error('Failed to save PDF file');
  }
}





// Get PDF Data of Transactions
// async function getPdf(requestBody) {
//   try {
//     const config = {
//       method: 'post',
//       maxContentLength: Infinity,
//       url: 'https://fincoopers-uat.moneyone.in/getallfidataPdf',
//       headers,
//       data: requestBody,
//     };

//     const response = await axios(config);
//     const pdfUrl = savePdfAndGetUrl(response.data);
//     console.log('PDF Response:', pdfUrl);
//     return pdfUrl;
//   } catch (error) {
//     throw error;
//   }
// }


async function getPdf(requestBody) {
  try {
    const config = {
      method: 'post',
      maxContentLength: Infinity,
      url: `${ONE_MONEY_BASE_URL}/getallfidataPdf`,
      headers,
      data: requestBody,
    };


    // Make the API request and get the PDF buffer
    const response = await axios(config);



    const pdfBuffer = response.data;
     // Assuming the response is in Buffer format

    // Define the upload path in your Space
    const filePathInBucket = `${process.env.PATH_BUCKET}/LOS/PDF/${Date.now()}_transactions.pdf`;
    const contentType = 'application/pdf';
    const bucketName = 'finexe'; // Replace with your actual bucket name

    const data = await uploadToSpaces(
      bucketName,
      filePathInBucket,
      pdfBuffer,
      'public-read',
      contentType
    );

    // Return the uploaded file's URL
    const fileUrl = `https://cdn.fincooper.in/${filePathInBucket}`;
    console.log('PDF uploaded successfully:', fileUrl);
    return fileUrl;
  } catch (error) {
    // console.error('Error while processing PDF:', error);
    throw error;
  }
}

// Check Balance
async function checkBalance(requestBody) {
  try {
    const data = JSON.stringify({
      linkReferenceNumber: requestBody.linkRefNumber[0],
      consentID: requestBody.consentID,
    });

    const config = {
      method: 'post',
      maxContentLength: Infinity,
      url: `${ONE_MONEY_BASE_URL}/getfibalance`,
      headers,
      data,
    };

    const response = await axios(config);
    console.log('Balance Response:', response);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Get Account Statement
async function getAccountStatement(requestBody) {
  try {
    const config = {
      method: 'post',
      maxContentLength: Infinity,
      url: `${ONE_MONEY_BASE_URL}/getallfidata`,
      headers,
      data: JSON.stringify(requestBody),
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Get Latest Account Statement
async function getLatestAccountStatement(requestBody) {
  try {
    const config = {
      method: 'post',
      maxContentLength: Infinity,
      url: `${ONE_MONEY_BASE_URL}/getalllatestfidata`,
      headers,
      data: JSON.stringify(requestBody),
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Account Aggregator List //

async function AccountAggregatorList() {
  try {
    const config = {
      method: 'post',
      url: `${ONE_MONEY_BASE_URL}/accountaggregatorlist`,
      headers
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Product List //

async function ProductList(requestBody) {
  try {
    const config = {
      method: 'post',
      url: `${ONE_MONEY_BASE_URL}/productslist`,
      headers,
      data: JSON.stringify(requestBody),
    };
  
    const response = await axios(config);
    return response.data;
  } catch (error) {
    throw error;
  }

}

// webredireaction //
async function webredirection(requestBody){
  try{
    const config = {
      method: 'post',
      url: `${ONE_MONEY_BASE_URL}/webRedirection/getEncryptedUrl`,
      headers,
      data: JSON.stringify(requestBody),
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    throw error;
  }
}



const uploadFile = async (req, res, fileFromParams = null) => {
  try {
 
    const file =  req.file || fileFromParams ;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }



    const fileBuffer = file.buffer;
    const originalFileName = file.originalname;
    const mimeType = file.mimetype;

    console.log("File uploaded:", originalFileName, mimeType);


    const folderPath = mimeType.includes("image") ? "uploads/images" : "uploads/pdfs";


    const fileUrl = await uploadFileToSpaces(fileBuffer, originalFileName, folderPath, mimeType);

    return res.status(200).json({
      message: "File uploaded successfully",
      fileUrl,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return res.status(500).json({ message: "File upload failed", error: error.message });
  }
};


//Analytics
//POST Data Analytics//










module.exports = {
  ConsentRequest,
  ConsentList,
  getFiData,
  getXmlFI,
  getPdf,
  checkBalance,
  getAccountStatement,
  getLatestAccountStatement,
  AccountAggregatorList,
  ProductList,
  webredirection,
  savePdfAndGetUrl,
  uploadFile
};
