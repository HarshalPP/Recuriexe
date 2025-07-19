const {
  success,
  unknownError,
  serverValidation,
  badRequest,
  notFound,
  parseJwt,
  badRequestwitherror
} = require("../../../../../globalHelper/response.globalHelper");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const moment = require("moment-timezone");
const lendersModel = require("../../model/lender.model.js");
const finalModel = require("../../model/finalSanction/finalSnction.model.js");
const {
  GmRmDeedPdf,
} = require("../../controller/growMoneyPdf/rmDeed.controller.js");
const {
  GmemDeedPdf,
} = require("../../controller/growMoneyPdf/emDeed.controller.js");

const { ratnaEmDeedPdf } = require('../../controller/ratnaaFin/emDeed.controller')
const axios = require('axios');

const getRatnaEmDeedpdfs = async (req, res) => {
  try {
    let { customerId, conditions } = req.query;
    const partnerData = await finalModel.findOne({ customerId });
    if (!partnerData) {
      return badRequest(res, "partner's is required.");
    }
    const partnerModel = await lendersModel.findOne({
      _id: partnerData.partnerId,
    });
    if (!partnerModel) {
      return badRequest(res, "Partner not found.");
    }

    const normalizedPartnerName = (partnerModel.fullName || "")
      .trim()
      .toLowerCase();

    if (conditions === "rmDeed" && normalizedPartnerName === "ratnaafin capital pvt ltd") {
      const rmDeedData = await ratnaEmDeedPdf(customerId);

      // const uploadUrl = `${process.env.BASE_URL}v1/formData/ImageUpload`;

      // const processFile = async (filePath) => {
      //   let resolvedPath = path
      //     .resolve(__dirname, `../../../..${filePath}`)
      //     .replace(/\\/g, "/");
      //   const formData = new FormData();
      //   formData.append("image", fs.createReadStream(resolvedPath));
      //   const response = await axios.post(uploadUrl, formData, {
      //     headers: { ...formData.getHeaders() },
      //   });

      //   return response.data?.items;
      // };

      // const uploadedincomeSectionUrl = await processFile(uploadResponse.url);

      // const rmDeedPdfUrl = `${process.env.BASE_URL}${uploadedincomeSectionUrl.image}`;


      return success(res, "PDF generated  successfully.",rmDeedData);
      //   {
      //   rmDeedPdf: rmDeedData.uploadResponse,
      // });
    }
    else if (conditions === "emDeed"&&normalizedPartnerName === "grow money capital pvt ltd") {
      const rmDeedData = await GmemDeedPdf(customerId);

     


      return success(res, "PDF generated  successfully.",rmDeedData);
     
    }  if (conditions === "rmDeed" &&normalizedPartnerName === "fin coopers capital pvt ltd") {
      const rmDeedData = await fcplRmDeedPdf(customerId);
      return success(res, "PDF generated  successfully.",rmDeedData);
      //   {
      //   rmDeedPdf: rmDeedData.uploadResponse,
      // });
    }
     else {
      return badRequest(
        res,
        `Unsupported  partner (${partnerModel.fullName}) or Types:please send correct partner.`
      );
    }
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
};


const convertUrlToBase64 = async (fileUrl) => {
  try {
    const response = await axios.get(fileUrl, {
      responseType: 'arraybuffer', // Important for binary data
    });

    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    return base64;
  } catch (error) {
    console.error('Error converting URL to Base64:', error);
    throw error;
  }
};

const generateSignzy = async (req, res) => {
  try {
    const url = 'https://api-preproduction.signzy.app/api/v3/template/save';
    const headers = {
      'Authorization': '3Ghi2XGNEhlMMq69dSnnLLRFHu4AD8G3', // Replace with actual token
      'Content-Type': 'application/json',
    };
 
    const templateDocUrl = "https://cdn.fincooper.in/STAGE/LOS/PDF/6263449299-FIN1107-1740474890169.pdf";
 
    const templateDataBase64 = await convertUrlToBase64(templateDocUrl);
    const fullBase64 = `data:application/pdf;base64,${templateDataBase64}`;
    console.log(templateDataBase64,"templateDataBase64templateDataBase64")
    
    const data = {
      templateName: "pdPDF",
      templateType: "editablePdf", // Use only one of these if required
      templateData: 'https://cdn.fincooper.in/STAGE/LOS/PDF/6263449299-FIN1107-1740474890169.pdf', // Replace with actual base64 string or public file URL
      templateRequiredVariables: {
          "textField1":{
            "type":"TEXTFIELD",
            "value":"data for text field 1"
            }
      }
    };
 
    const response = await axios.post(url, data, { headers });
    console.log('Response:', response.data);
    return success(res, "PDF generated successfully.", response.data); // Use response.data instead of rmDeedData
  } catch (error) {
    // Handle any errors from the API call
    console.error('Error:', error);
 
    // Send appropriate error response back to the client
    return unknownError(res, error);
  }
};

const generateContract = async (req, res) => {
  try {
    const url = 'https://api-preproduction.signzy.app/api/v3/contract/generate';

    const headers = {
      'Authorization': '3Ghi2XGNEhlMMq69dSnnLLRFHu4AD8G3', // Replace with actual token
      'Content-Type': 'application/json',
    };

    const data = {
      templateId: "67f63ab2a2625bb63e79f866",
      urlType: "url",
      jsonData: {
      }
    };

    const response = await axios.post(url, data, { headers });
    console.log("Contract generated successfully:", response.data);
    return success(res, "PDF generated successfully.", response.data); // Use response.data instead of rmDeedData

  } catch (error) {
    // Handle any errors from the API call
    console.error('Error:', error);
 
    // Send appropriate error response back to the client
    return unknownError(res, error);
  }
};

//initiateContract

const https = require("https");
const { v4: uuidv4 } = require('uuid');
const { signzyFunction } = require("../../services/signzy.service.js")


const initiateContract = async (req, res) => {
  try {

      const { customerId, links } = req.body;
      console.log(req.body)
        
        if (!customerId || !links) {
          return res.status(400).json({ success: false, message: "customerId and links are required" });
        }
    
        const selectionData = await finalModel.findOne({ customerId });
        console.log(selectionData.pdfSelection, "selectionData<<>><<>>, selectionData");
        
        if (!selectionData || !selectionData.pdfSelection) {
          return badRequest(res, "Please select selection first");
        }
   
        const sectionEsign = await signzyFunction(req,res,links,customerId);

  } catch (error) {
    console.error('Error:', error);
    return unknownError(res, error);
  }
};


const initiateContractDetails = async (req, res) => {
  try {
     const { customerId,templateId } = req.query;
     console.log(req.query,"<<>><<>><<>>+")
     if (!customerId) {
       return res.status(400).json({ success: false, message: "customerId are required" });
     }

     const selectionData = await finalModel.findOne({ customerId });
     console.log(selectionData.pdfSelection, "selectionData<<>><<>>, selectionData");
     
     if (!selectionData || !selectionData.esignLinks) {
       return badRequest(res, "generate esign link first");
     }
    //  console.log(selectionData.esignLinks.contractId,"selectionData.esignLinks.contractIdselectionData.esignLinks.contractId")
     axios({
       method: 'post',  // <-- change to POST
       url: 'https://api-preproduction.signzy.app/api/v3/contract/pullData',  // <-- updated URL
       headers: {
         'Authorization': '3Ghi2XGNEhlMMq69dSnnLLRFHu4AD8G3',  // <-- put your actual token
         'Content-Type': 'application/json'
       },
       data: {
         contractId: selectionData.esignLinks.contractId  // <-- pass contractId in body
       }
     })
     .then(response => {
       console.log("Response:", response.data);
       return success(res, "contract details successfully.", response?.data?.finalSignedContract);
     })
     .catch(error => {
       console.error("Error:", error.response ? error.response.data : error.message);
       return unknownError(res, error);
     });

     } catch (error) {
       console.error('Error:', error);
       return unknownError(res, error);
     }
};


//initiateContractDetails
module.exports = {
    getRatnaEmDeedpdfs,
    generateSignzy,
    generateContract,
    initiateContract,
    initiateContractDetails
}