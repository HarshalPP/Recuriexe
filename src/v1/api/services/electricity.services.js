const {
  success,
  unknownError,
  serverValidation,
  badRequest,
} = require("../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const electricityModel = require("../model/electricity.models");
const ObjectId = mongoose.Types.ObjectId;
const axios = require("axios");

// ------------Electricity BIll  Fetching Api Using from save on db ---------------------
// async function getElectricityBill(req, res) {
//   try {
//     const { docNumber, state } = req.body;
//     const ExistDocNumber = await electricityModel.findOne({
//       docNumber: docNumber,
//     }).select("-createdAt -updatedAt -_id -__v");
//     if (!ExistDocNumber) {
//       // Step 1: Encrypt
//       //   const encryptResponse = await axios.post(
//       //     "https://www.truthscreen.com/InstantSearch/encrypted_string",
//       //     {
//       //       transID: "12345678",
//       //       docType: 5,
//       //       docNumber,
//       //       state,
//       //     },
//       //     {
//       //       headers: {
//       //         username: "production@fincoopers.in",
//       //       },
//       //     }
//       //   );
//       //   const requestData = encryptResponse.data;
//       //   // console.log("data", requestData);
//       //   const PanResponse = await axios.post(
//       //     "https://www.truthscreen.com/api/v2.2/utilitysearch",
//       //     {
//       //       requestData,
//       //     },
//       //     {
//       //       headers: {
//       //         username: "production@fincoopers.in",
//       //       },
//       //     }
//       //   );
//       //   const responseData = PanResponse.data.responseData;
//       //   // console.log("responseData", responseData);
//       //   // // Step 3: Decrypt
//       //   const decryptResponse = await axios.post(
//       //     "https://www.truthscreen.com/InstantSearch/decrypt_encrypted_string",
//       //     {
//       //       responseData,
//       //     },
//       //     {
//       //       headers: {
//       //         username: "production@fincoopers.in",
//       //       },
//       //     }
//       //   );
//       //   // console.log("sda", decryptResponse);
//       //   success(res, "Get User Electricity Bill Detail.", decryptResponse.data);
//       // const electricityData = decryptResponse.data.msg;
//       // const newElectricityData = new electricityModel({
//       //   docNumber: req.body.docNumber,
//        //  // customerId: req.body.customerId,
//       //   "Address Of Consumer": electricityData["Address Of Consumer"],
//       //   "Bill Amount": electricityData["Bill Amount"],
//       //   "Cash Due Date": electricityData["Cash Due Date"],
//       //   "Cheque Due Date": electricityData["Cheque Due Date"],
//       //   "Current Surcharge": electricityData["Current Surcharge"],
//       //   "Ivrs No": electricityData["Ivrs No"],
//       //   "Name Of Consumer": electricityData["Name Of Consumer"],
//       //   "Service No": electricityData["Service No"],
//       //   "Consumer No": electricityData["Consumer No"]
//       // });
//       //   const result = await newElectricityData.save();
//       //   console.log('Electricity data saved successfully:', result);
//     } else {
//       const electricityData = { mgs: ExistDocNumber };
//       success(res, "Get User Electricity Bill Detail ", electricityData);
//     }
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const { response } = error;
//       if (response) {
//         if (response.status === 422) {
//           return badRequest(res, "Invalid Detail");
//         }
//         return res.status(response.status).json({
//           status: false,
//           message: response.statusText,
//           details: response.data,
//         });
//       } else {
//         return unknownError(res, error.message);
//       }
//     }
//   }
// }


// ------------Electricity BIll  Fetching Api Using 3rd Party Api---------------------
async function getElectricityBill(req, res) {
  try {
    const { docNumber, state } = req.body;
    // Step 1: Encrypt
    const encryptResponse = await axios.post(
      "https://www.truthscreen.com/InstantSearch/encrypted_string",
      {
        transID: "12345678",
        docType: 5,
        docNumber,
        state,
      },
      {
        headers: {
          username: "production@fincoopers.in",
        },
      }
    );
    const requestData = encryptResponse.data;
    // console.log("data", requestData);
    const PanResponse = await axios.post(
      "https://www.truthscreen.com/api/v2.2/utilitysearch",
      {
        requestData,
      },
      {
        headers: {
          username: "production@fincoopers.in",
        },
      }
    );
    const responseData = PanResponse.data.responseData;
    // console.log("responseData", responseData);
    // // Step 3: Decrypt
    const decryptResponse = await axios.post(
      "https://www.truthscreen.com/InstantSearch/decrypt_encrypted_string",
      {
        responseData,
      },
      {
        headers: {
          username: "production@fincoopers.in",
        },
      }
    );
    // console.log("sda", decryptResponse);
    success(res, "Get User Electricity Bill Detail.", decryptResponse.data);
    const electricityData = decryptResponse.data.msg;
    const newElectricityData = new electricityModel({
      docNumber: req.body.docNumber,
      // customerId: req.body.customerId,
      "Address Of Consumer": electricityData["Address Of Consumer"],
      "Bill Amount": electricityData["Bill Amount"],
      "Cash Due Date": electricityData["Cash Due Date"],
      "Cheque Due Date": electricityData["Cheque Due Date"],
      "Current Surcharge": electricityData["Current Surcharge"],
      "Ivrs No": electricityData["Ivrs No"],
      "Name Of Consumer": electricityData["Name Of Consumer"],
      "Service No": electricityData["Service No"],
      "Consumer No": electricityData["Consumer No"]
    });
    const result = await newElectricityData.save();
    // console.log('Electricity data saved successfully:', result);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const { response } = error;
      if (response) {
        if (response.status === 422) {
          return badRequest(res, "Invalid Detail");
        }
        return res.status(response.status).json({
          status: false,
          message: response.statusText,
          details: response.data,
        });
      } else {
        return unknownError(res, error.message);
      }
    }
  }
}

module.exports = {
  getElectricityBill,
};
