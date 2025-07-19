const {
  success,
  unknownError,
  serverValidation,
  badRequest,
} = require("../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");
const applicantModel = require("../model/applicant.model");
const coApplicantModel = require("../model/co-Applicant.model");
const aadhaarModel = require("../model/aadhaar.model");
const aadhaarOcrModel = require("../model/aadhaarOcr.model");
const guarantorModel = require("../model/guarantorDetail.model");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const directory = path.join(__dirname, "../../../../uploads");

// ------------Aadhaar OTP Send On Mobile Api Using 3rd Party Api---------------------
// async function aadhaarSendOtp(req, res) {
//   try {
//     const { aadharNo, transId, docType } = req.body;
//     const aadharNoFind = await aadhaarModel.findOne({aadharNo:aadharNo})
//     console.log(aadharNoFind,'data')
//     // const aadharExistInApp = await applicantModel.findOne({
//     //   aadharNo: aadharNo,
//     // });
//     // const aadharExistInCoApp = await coApplicantModel.findOne({
//     //   aadharNo: aadharNo,
//     // });
//     // if (aadharExistInApp) {
//     //   console.log("This is aadhar already Applicat Form");
//     //   // return badRequest("Aadhaar Already Applicat");
//     // }
//     // if (aadharExistInCoApp) {
//     //   console.log("This is aadhar already co-Applicat Form");
//     //   // return badRequest("Aadhaar Already Co-Applicat");
//     // }

//     // Step 1: Encrypt
//     // const encryptResponse = await axios.post(
//     //   "https://www.truthscreen.com/v1/apicall/encrypt",
//     //   {
//     //     aadharNo,
//     //     transId,
//     //     docType,
//     //   },
//     //   {
//     //     headers: {
//     //       username: "production@fincoopers.in",
//     //     },
//     //   }
//     // );

//     // const requestData = encryptResponse.data;
//     // // Step 2: Get OTP
//     // const otpResponse = await axios.post(
//     //   "https://www.truthscreen.com/v1/apicall/nid/aadhar_get_otp",
//     //   {
//     //     requestData,
//     //   },
//     //   {
//     //     headers: {
//     //       username: "production@fincoopers.in",
//     //     },
//     //   }
//     // );
//     // const responseData = otpResponse.data.responseData;
//     // // Step 3: Decrypt
//     // const decryptResponse = await axios.post(
//     //   "https://www.truthscreen.com/v1/apicall/decrypt",
//     //   {
//     //     responseData,
//     //   },
//     //   {
//     //     headers: {
//     //       username: "production@fincoopers.in",
//     //     },
//     //   }
//     // );
//     // const tsTransID = decryptResponse.data.tsTransId
//     // const newAadhaarData = new aadhaarModel({transId: tsTransID, aadharNo: aadharNo});
//     // console.log('data',newAadhaarData)
//     // const result = await newAadhaarData.save();
//     // success(res, "success,otp generated", decryptResponse.data);
// const saveOtp = {otp: aadharNoFind.otp , msg: "success,otp generated",
//   status: 1, tsTransId:aadharNoFind.transId}
//     success(res, "success,otp generated", saveOtp);
//   } catch (error) {
//     console.log(error);
//     unknownError(res, error);
//   }
// }

async function aadhaarSendOtp(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const { aadharNo, transId, docType, formName } = req.body;

    if(!formName){
      return 
    }
    const aadharExistInApp = await applicantModel.find({ aadharNo: aadharNo });
    const aadharExistInCoApp = await coApplicantModel.findOne({ aadharNo: aadharNo });
    const aadharExistInGuarantor = await guarantorModel.find({ aadharNo: aadharNo });

    if (formName === "applicant") {
      if (aadharExistInCoApp) {
        return badRequest(res, "Aadhaar is already used as Co-Applicant");
      }
      if (aadharExistInApp && aadharExistInApp.length > 0) {
        return badRequest(res, "Aadhaar is already used as an Applicant");
      }
    }

    if (formName === "guarantor") {
      if (aadharExistInCoApp) {
        return badRequest(res, "Aadhaar used in Co-Applicant ");
      }
      if (aadharExistInGuarantor && aadharExistInGuarantor.length > 0) {
        return badRequest(res, "Aadhaar is already in Guarantor");
      }
    }


    if (formName === "coApplicant") {
      if (aadharExistInApp && aadharExistInApp.length > 0) {
        return badRequest(res, "Aadhaar is already used In Applicant ");
      }
      if (aadharExistInGuarantor && aadharExistInGuarantor.length > 0) {
        return badRequest(res, "Aadhaar is already used In Guarantor");
      }
      if (aadharExistInCoApp) {
        return badRequest(res, "Aadhaar is already used as Co-Applicant.");
      }
    }

    // Step 1: Encrypt
    console.log("detail")
    const encryptResponse = await axios.post(
      "https://www.truthscreen.com/v1/apicall/encrypt",
      {
        aadharNo,
        transId,
        docType,
      },
      {
        headers: {
          username: "production@fincoopers.in",
        },
      }
    );
    const requestData = encryptResponse.data;
    // Step 2: Get OTP
    const otpResponse = await axios.post(
      "https://www.truthscreen.com/v1/apicall/nid/aadhar_get_otp",
      {
        requestData,
      },
      {
        headers: {
          username: "production@fincoopers.in",
        },
      }
    );
    const responseData = otpResponse.data.responseData;
    // Step 3: Decrypt
    const decryptResponse = await axios.post(
      "https://www.truthscreen.com/v1/apicall/decrypt",
      {
        responseData,
      },
      {
        headers: {
          username: "production@fincoopers.in",
        },
      }
    );
    const tsTransID = decryptResponse.data.tsTransId
    const newAadhaarData = new aadhaarModel({ transId: tsTransID, aadharNo: aadharNo });
    const result = await newAadhaarData.save();
    success(res, "success,otp generated", decryptResponse.data);
  } catch (error) {
    console.log(error);
    // unknownError(res, error);
    if (axios.isAxiosError(error)) {
      const { response } = error;
      if (response) {
        if (response.status === 402) {
          return badRequest(res, "Aadhaar-linked credit plan has expired. Recharge now to continue access.");
        }
      } else {
        return unknownError(res, error.message);
      }
    }
  }
}

// ------------Aadhaar OTP Submit Api Using 3rd Party Api---------------------
async function aadhaarSubmitOtp(req, res) {
  try {
    const { transId, otp, formName } = req.body;
    const aadhaarData = await aadhaarModel.findOne({
      transId: transId,
      otp: otp
    });
    // Step 1: Encrypt
    const encryptResponse = await axios.post(
      "https://www.truthscreen.com/v1/apicall/encrypt",
      {
        transId,
        otp,
      },
      {
        headers: {
          username: "production@fincoopers.in",
        },
      }
    );

    const requestData = encryptResponse.data;

    // Step 2: OTP Submit
    const otpResponse = await axios.post(
      "https://www.truthscreen.com/v1/apicall/nid/aadhar_submit_otp",
      {
        requestData,
      },
      {
        headers: {
          username: "production@fincoopers.in",
        },
      }
    );
    const responseData = otpResponse.data.responseData;

    // Step 3: Decrypt
    const decryptResponse = await axios.post(
      "https://www.truthscreen.com/v1/apicall/decrypt",
      {
        responseData,
      },
      {
        headers: {
          username: "production@fincoopers.in",
        },
      }
    );
    success(res, "otp Submitted Sucessfully", decryptResponse.data);
    const getAadhaarData = await decryptResponse.data.msg
    const existingRecord = await aadhaarModel.findOne({ transId });
    if (!existingRecord) {
      return badRequest(res, "transId not found");
    }
    existingRecord["Aadhar No"] = getAadhaarData["Aadhar No"];
    existingRecord.Address = getAadhaarData.Address;
    existingRecord.Careof = getAadhaarData.Careof;
    existingRecord.Country = getAadhaarData.Country;
    existingRecord.DOB = getAadhaarData.DOB;
    existingRecord.District = getAadhaarData.District;
    existingRecord.Gender = getAadhaarData.Gender;
    existingRecord.House = getAadhaarData.House;
    existingRecord.Image = getAadhaarData.Image;
    existingRecord.Landmark = getAadhaarData.Landmark;
    existingRecord.Locality = getAadhaarData.Locality;
    existingRecord.Name = getAadhaarData.Name;
    existingRecord.Pincode = getAadhaarData.Pincode;
    existingRecord["Post Office"] = getAadhaarData["Post Office"];
    existingRecord["Document Link"] = getAadhaarData["Document Link"];
    existingRecord["Relatationship type"] = getAadhaarData["Relatationship type"];
    existingRecord["Relative Name"] = getAadhaarData["Relative Name"];
    existingRecord["Share Code"] = getAadhaarData["Share Code"];
    existingRecord.State = getAadhaarData.State;
    existingRecord.Street = getAadhaarData.Street;
    existingRecord["Sub District"] = getAadhaarData["Sub District"];
    existingRecord.formName = formName;
    const getResult = await existingRecord.save();
    // console.log("Sasa",aadhaarData);
    // if(!aadhaarData){
    // success(res, "otp Submitted Sucessfully", {msg:aadhaarData});
    // }
    // success(res, "otp Submitted Sucessfully", {msg:aadhaarData});
  } catch (error) {
    console.log(error);
    // unknownError(res, error);
    if (axios.isAxiosError(error)) {
      const { response } = error;
      if (response) {
        if (response.status === 422) {
          return badRequest(res, "Invalid OTP");
        }
      } else {
        return unknownError(res, error.message);
      }
    }
  }
}

// ------------Aadhaar OCR TO Get Aadhar Detail3rd Party Api---------------------
async function aadhaarOCR(req, res) {
  try {
    const frontImagePath = req.files.front_image[0].path; // Get file path
    const backImagePath = req.files.back_image[0].path;
    const formName = req.body.formName

      if(!formName){
        return badRequest(res , "formName Is required")
    }

    const tokenResponse = await axios.post(
      "https://www.truthscreen.com/api/v2.2/idocr/token",
      {
        transID: 213124,
        docType: 1,
      },
      {
        headers: {
          "Content-Type": "multipart/form-data",
          username: "production@fincoopers.in",
        },
      }
    );

    const responseData = tokenResponse.data.responseData;
    // console.log("ss", responseData);
    // Step 2: Get OTP
    const tokengenrate = await axios.post(
      "https://www.truthscreen.com/InstantSearch/decrypt_encrypted_string",
      {
        responseData,
      },
      {
        headers: {
          "Content-Type": "application/json",
          username: "production@fincoopers.in",
        },
      }
    );
    const tokenDetail = tokengenrate.data;
    const transId = tokenDetail.msg.tsTransID;
    const token = tokenDetail.msg.secretToken;
    // console.log("ddddd", transId);
    // Step 3: Decrypt
    const encryptResponse = await axios.post(
      "https://www.truthscreen.com/api/v2.2/idocr/tokenEncrypt",
      {
        token: token,
      },
      {
        headers: {
          "Content-Type": "multipart/form-data",
          username: "production@fincoopers.in",
        },
      }
    );
    const encryptDetail = encryptResponse.data;

    const formData = new FormData();
    formData.append("tsTransID", transId);
    formData.append("secretToken", encryptDetail);
    formData.append("front_image", fs.createReadStream(frontImagePath)); // Use createReadStream
    formData.append("back_image", fs.createReadStream(backImagePath));

    const verifyAadhar = await axios.post(
      "https://www.truthscreen.com/api/v2.2/idocr/verify",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          username: "production@fincoopers.in",
        },
      }
    );
    const verifyAadharEncrypt = verifyAadhar.data.responseData;
    // console.log("dataaaaaaaa", verifyAadharEncrypt);
    // Step 3: Decrypt
    const decryptResponse = await axios.post(
      "https://www.truthscreen.com/InstantSearch/decrypt_encrypted_string",
      {
        responseData: verifyAadharEncrypt,
      },
      {
        headers: {
          username: "production@fincoopers.in",
        },
      }
    );
    const decryptDetail = decryptResponse.data;
    const ocrData = decryptResponse.data.msg
  
    if (decryptDetail.status === 1 && (!ocrData.doc_id || ocrData.doc_id.trim() === "")) {
      return badRequest(res, "Upload clear photos of Aadhaar.");
    }
    const aadhaarOcrData = new aadhaarOcrModel(req.body);
    if (req.files && req.files["front_image"]) {
      const filePath = `/uploads/${req.files["front_image"][0].filename}`;
      aadhaarOcrData.aadhaarOrcFrontImage = filePath;
    }
    if (req.files && req.files["back_image"]) {
      const filePath = `/uploads/${req.files["back_image"][0].filename}`;
      aadhaarOcrData.aadhaarOrcBackImage = filePath;
    }
    aadhaarOcrData.address = ocrData.address;
    aadhaarOcrData.age = ocrData.age
    aadhaarOcrData.district = ocrData.district;
    aadhaarOcrData.dob = ocrData.dob;
    aadhaarOcrData.doc_id = ocrData.doc_id.replace(/\s/g, '');
    aadhaarOcrData.doi = ocrData.doi;
    aadhaarOcrData.gender = ocrData.gender;
    aadhaarOcrData.is_scanned = ocrData.is_scanned;
    aadhaarOcrData.minor = ocrData.minor;
    aadhaarOcrData.name = ocrData.name;
    aadhaarOcrData.pincode = ocrData.pincode;
    aadhaarOcrData.relation_name = ocrData.relation_name;
    aadhaarOcrData.relation_type = ocrData.relation_type;
    aadhaarOcrData.scan_type = ocrData.scan_type;
    aadhaarOcrData.state = ocrData.state;
    aadhaarOcrData.street_address = ocrData.street_address;
    aadhaarOcrData.yob = ocrData.yob;
    aadhaarOcrData.formName = formName
    const dataSave = await aadhaarOcrData.save();


//     console.log('formName',formName)
// console.log('formName match ',formName === "applicant")
    // console.log('adhar nu come ', ocrData.doc_id.replace(/\s/g, ''))
    const aadharExistInApp = await applicantModel.find({ aadharNo: ocrData.doc_id.replace(/\s/g, '') });
    const aadharExistInCoApp = await coApplicantModel.findOne({ aadharNo: ocrData.doc_id.replace(/\s/g, '') });
    const aadharExistInGuarantor = await guarantorModel.find({ aadharNo: ocrData.doc_id.replace(/\s/g, '') });

    console.log('aadharExistInApp',aadharExistInApp)

    if (formName === "applicant") {
      console.log('Applicant Check')
      if (aadharExistInCoApp) {
        return badRequest(res, "Aadhaar is already used as Co-Applicant");
      }
      if (aadharExistInApp && aadharExistInApp.length > 0) {
        return badRequest(res, "Aadhaar is already used as an Applicant");
      }
    }

    if (formName === "guarantor") {
      console.log('guarantor Check')
      if (aadharExistInCoApp) {
        return badRequest(res, "Aadhaar used in Co-Applicant ");
      }
      if (aadharExistInGuarantor && aadharExistInGuarantor.length > 0) {
        return badRequest(res, "Aadhaar is already in Guarantor");
      }
    }

    if (formName === "coApplicant") {
      console.log('coApplicant Check')
      if (aadharExistInApp && aadharExistInApp.length > 0) {
        return badRequest(res, "Aadhaar is already used In Applicant ");
      }
      if (aadharExistInGuarantor && aadharExistInGuarantor.length > 0) {
        return badRequest(res, "Aadhaar is already used In Guarantor");
      }
      if (aadharExistInCoApp) {
        return badRequest(res, "Aadhaar is already used as Co-Applicant.");
      }
    }

    success(res, "Aadhar Detail Get Sucessful", decryptDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}




// async function verifyFunction(responseData) {


//   // Check for missing responseData
//   if (!responseData) {
//     throw new Error("Missing required parameter: responseData");
//   }

//   const apiUrl = "https://www.truthscreen.com/InstantSearch/decrypt_encrypted_string";

//   // Headers
//   const headers = {
//     "username": "test@rjcorp.in",
//     "Content-Type": "application/json",
//   };

//   const payload = {
//     "responseData": responseData,
//   };

//   try {
//     const response = await axios.post(apiUrl, payload, { headers, responseType: 'arraybuffer' });
//     if (response.data) {
//       const imageBuffer = Buffer.from(response.data);
//       const saveDirectory = path.join(__dirname, '../../../../uploads');
//       if (!fs.existsSync(saveDirectory)) {
//         fs.mkdirSync(saveDirectory, { recursive: true });
//       }
//       const fileName = `image_${Date.now()}.jpg`;
//       const filePath = path.join(saveDirectory, fileName);
//       fs.writeFileSync(filePath, imageBuffer);
//          const imageUrl = `http://localhost:5500/uploads/${fileName}`;
//       return imageUrl;
//     } else {
//       throw new Error("No image data received.");
//     }
//   } catch (error) {
//     console.error("Error in verifyFunction:", error.message);
//     throw new Error(error.response?.data || "Failed to process the request.");
//   }
// }




// async function aadhaarMarkAsVerified(req, res) {


//   try {
//     const frontImagePath = req.files?.front_image?.[0]?.path;
//     console.log('frontImagePath',frontImagePath)
//     const backImagePath = req.files?.back_image?.[0]?.path;
    
//     // Validate if the required images are present
//     // if (!frontImagePath || !backImagePath) {
//     //   return badRequest(res, 'Front and back images are required');
//     // }

//     let tsTransID;
//     let secretToken;

//     const formData = new FormData();
//     formData.append('transID', '123444');
//     formData.append('docType', '9');

//     const headers = {
//       ...formData.getHeaders(),
//       username: 'test@rjcorp.in',
//     };

//     // Request to get the token
//     const tokenResponse = await axios.post(
//       'https://www.truthscreen.com/api/v2.2/idocr/token',
//       formData,
//       { headers }
//     );

//     if (!tokenResponse?.data?.responseData) {
//       return badRequest(res, 'Failed to get token');
//     }

//     // console.log('Token API Response:', tokenResponse.data);

//     const payload = {
//       responseData: tokenResponse.data.responseData,
//     };

//     const decryptHeaders = {
//       username: 'test@rjcorp.in',
//       contentType: 'application/json',
//     };

//     // Request to decrypt the token
//     const decryptResponse = await axios.post(
//       'https://www.truthscreen.com/InstantSearch/decrypt_encrypted_string',
//       payload,
//       { headers: decryptHeaders }
//     );

//     if (!decryptResponse?.data) {
//       return badRequest(res, 'Failed to decrypt token');
//     }

//     // console.log('Decrypt API Response:', decryptResponse.data);

//     if (decryptResponse.data.status === 0) {
//       return res.status(400).json({
//         success: false,
//         message: decryptResponse.data.msg || 'Decryption failed',
//       });
//     }

//     if (decryptResponse.data.msg) {
//       tsTransID = decryptResponse.data.msg.tsTransID;
//       secretToken = decryptResponse.data.msg.secretToken;
//     }

//     // If decryption is successful, proceed with encryption and verification
//     if (decryptResponse.data.status === 1) {
//       const finalFormData = new FormData();
//       finalFormData.append('token', secretToken);

//       const tokenEncryptResponse = await axios.post(
//         'https://www.truthscreen.com/api/v2.2/idocr/tokenEncrypt',
//         finalFormData,
//         { headers: decryptHeaders }
//       );

//       if (!tokenEncryptResponse?.data) {
//         return badRequest(res, 'Failed to encrypt token');
//       }

//       const verifyFormData = new FormData();
//       verifyFormData.append('tsTransID', tsTransID);
//       verifyFormData.append('secretToken', tokenEncryptResponse.data);
//       verifyFormData.append('front_image', fs.createReadStream(frontImagePath));
//       // verifyFormData.append('back_image', fs.createReadStream(backImagePath));

//       const verifyencryption = await axios.post(
//         'https://www.truthscreen.com/api/v2.2/idocr/verify',
//         verifyFormData,
//         { headers: decryptHeaders }
//       );

//       if (!verifyencryption?.data) {
//         return badRequest(res, 'Failed to verify Aadhaar');
//       }

//       if (verifyencryption?.data?.responseData) {
        
//         const payload = {
//           responseData: verifyencryption.data.responseData,
//         }
        
//         const decryptVerifyResponse = await axios.post(
//           'https://www.truthscreen.com/InstantSearch/decrypt_encrypted_string',
//           payload,
//           { headers: decryptHeaders }
//         );
        
        
//         if(decryptVerifyResponse.data.status === 0) {
//           return badRequest(res, 'Failed to decrypt verification response');
//         }
//         const data = await verifyFunction(verifyencryption.data.responseData);
//         return success(res, 'Aadhaar verified successfully', data);
//       }
//     }
//   } catch (error) {
//     console.error('Error:', error.response?.data || error.message);

//     return res.status(error.response?.status || 500).json({
//       success: false,
//       message: error.response?.data?.message || 'Unknown Error',
//       error: error.response?.data || error.message,
//     });
//   }
// }


  // Function to handle Aadhaar verification
  
  
    // Helper function to verify the Aadhaar response
    
    
    async function verifyFunction(responseData) {
      try {
        const apiUrl = "https://www.truthscreen.com/InstantSearch/decrypt_encrypted_string";
        const headers = {
          username: "test@rjcorp.in",
          "Content-Type": "application/json",
        };
    
        const payload = {
          responseData: responseData,
        };
    
        const response = await axios.post(apiUrl, payload, { headers, responseType: "arraybuffer" });
    
        if (response.data) {
          const imageBuffer = Buffer.from(response.data);
          const saveDirectory = path.join(__dirname, "../../../../uploads");
    
          if (!fs.existsSync(saveDirectory)) {
            fs.mkdirSync(saveDirectory, { recursive: true });
          }
    
          const fileName = `image_AadharMask${Date.now()}.jpg`;
          const filePath = path.join(saveDirectory, fileName);
          fs.writeFileSync(filePath, imageBuffer);
    
          const imageUrl = `/uploads/${fileName}`;
          return imageUrl;
        } else {
          throw new Error("No image data received.");
        }
      } catch (error) {
        throw new Error(error.response?.data || "Failed to process the request.");
      }
    }

  
  async function aadhaarMarkAsVerified(req, res) {
    try {
      const frontImagePath = req.file?.path; // Correct reference to the uploaded file  
      if (!frontImagePath) {
        return badRequest(res, "Front and back images are required for Aadhaar verification.");
      }
  
      let tsTransID;
      let secretToken;
  
      const formData = new FormData();
      formData.append("transID", "123444");
      formData.append("docType", "9");
  
      const headers = {
        ...formData.getHeaders(),
        username: "test@rjcorp.in",
      };
  
      const tokenResponse = await axios.post(
        "https://www.truthscreen.com/api/v2.2/idocr/token",
        formData,
        { headers }
      );
  
      if (!tokenResponse?.data?.responseData) {
        return badRequest(res, "Failed to get token");
      }
  
      const payload = {
        responseData: tokenResponse.data.responseData,
      };
  
      const decryptHeaders = {
        username: "test@rjcorp.in",
        contentType: "application/json",
      };
  
      // Request to decrypt the token
      const decryptResponse = await axios.post(
        "https://www.truthscreen.com/InstantSearch/decrypt_encrypted_string",
        payload,
        { headers: decryptHeaders }
      );
  
      if (!decryptResponse?.data) {
        return badRequest(res, "Failed to decrypt token");
      }
  
      if (decryptResponse.data.status === 0) {
        return res.status(400).json({
          success: false,
          message: decryptResponse.data.msg || "Decryption failed",
        });
      }
  
      if (decryptResponse.data.msg) {
        tsTransID = decryptResponse.data.msg.tsTransID;
        secretToken = decryptResponse.data.msg.secretToken;
      }
  
      // If decryption is successful, proceed with encryption and verification
      if (decryptResponse.data.status === 1) {
        const finalFormData = new FormData();
        finalFormData.append("token", secretToken);
  
        const tokenEncryptResponse = await axios.post(
          "https://www.truthscreen.com/api/v2.2/idocr/tokenEncrypt",
          finalFormData,
          { headers: decryptHeaders }
        );
  
        if (!tokenEncryptResponse?.data) {
          return badRequest(res, "Failed to encrypt token");
        }
  
        const verifyFormData = new FormData();
        verifyFormData.append("tsTransID", tsTransID);
        verifyFormData.append("secretToken", tokenEncryptResponse.data);
        verifyFormData.append("front_image", fs.createReadStream(frontImagePath));
        // verifyFormData.append("back_image", fs.createReadStream(backImagePath));
  
        const verifyencryption = await axios.post(
          "https://www.truthscreen.com/api/v2.2/idocr/verify",
          verifyFormData,
          { headers: decryptHeaders }
        );
  
        if (!verifyencryption?.data) {
          return badRequest(res, "Failed to verify Aadhaar");
        }
  
        if (verifyencryption?.data?.responseData) {
          const payload = {
            responseData: verifyencryption.data.responseData,
          };

  
          const decryptVerifyResponse = await axios.post(
            "https://www.truthscreen.com/InstantSearch/decrypt_encrypted_string",
            payload,
            { headers: decryptHeaders }
          );
  
          if (decryptVerifyResponse.data.status === 0) {
            return badRequest(res, "Failed to decrypt verification response");
          }
  
          const data = await verifyFunction(verifyencryption.data.responseData);
          return success(res, "Upload an image and receive the URL.", {image:data});
        }
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      return unknownError(res, error.response?.data || error.message);
    }
  }
  








// function b64toBlob(b64Data, contentType, sliceSize) {
//   contentType = contentType || '';
//   sliceSize = sliceSize || 512;

//   var byteCharacters = atob(b64Data);
//   var byteArrays = [];

//   for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
//       var slice = byteCharacters.slice(offset, offset + sliceSize);

//       var byteNumbers = new Array(slice.length);
//       for (var i = 0; i < slice.length; i++) {
//           byteNumbers[i] = slice.charCodeAt(i);
//       }

//       var byteArray = new Uint8Array(byteNumbers);

//       byteArrays.push(byteArray);
//   }

// var blob = new Blob(byteArrays, {type: contentType});
// return blob;
// }



module.exports = {
  aadhaarSendOtp,
  aadhaarSubmitOtp,
  aadhaarOCR,
  aadhaarMarkAsVerified
};
