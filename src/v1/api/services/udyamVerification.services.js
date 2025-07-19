const {
  success,
  unknownError,
  serverValidation,
  badRequest,
} = require("../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const udyamDataModel = require("../model/udyam.model");
const axios = require("axios");

// ------------Udyam Verificationr Fetching Api Using 3rd Party Api---------------------
async function getUdyamVerification(req, res) {
  try {
    const { udyamNumber } = req.body;
    const udyamNumberFind = await udyamDataModel.findOne({
      udyamNumber: udyamNumber,
    });
    const udyamDataDb = { msg: { udyamdata: udyamNumberFind } };
    // console.log(udyamNumberFind,'nuber')
    if (!udyamNumberFind) {
      // Step 1: Encrypt
      const encryptResponse = await axios.post(
        "https://www.truthscreen.com/InstantSearch/encrypted_string",
        {
          transID: 1234577,
          docType: 435,
          udyamNumber,
        },
        {
          headers: {
            username: "production@fincoopers.in",
          },
        }
      );
      const requestData = encryptResponse.data;
      // console.log("data", requestData);
      const udyamResponse = await axios.post(
        "https://www.truthscreen.com/UdyamApi/idsearch",
        {
          requestData,
        },
        {
          headers: {
            username: "production@fincoopers.in",
          },
        }
      );
      const responseData = udyamResponse.data.responseData;
      console.log("responseData------1 ", responseData);
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

      const getUdyamData = decryptResponse.data.msg.udyamdata;
      // console.log('decryptResponse.data   --- 2- ',decryptResponse.data)

      // console.log('getUdyamData-----2 ',getUdyamData)

      const udyamDataSave = new udyamDataModel(req.body);
      udyamDataSave.udyamNumber = udyamNumber;
      udyamDataSave["DIC Name"] = getUdyamData["DIC Name"];
      udyamDataSave["Date of Commencement of Production/Business"] =
        getUdyamData["Date of Commencement of Production/Business"];
      udyamDataSave["Date of Incorporation"] =
        getUdyamData["Date of Incorporation"];
      udyamDataSave["Enterprise Type"] = getUdyamData["Enterprise Type"];
      udyamDataSave["MSME-DFO"] = getUdyamData["MSME-DFO"];
      udyamDataSave["Major Activity"] = getUdyamData["Major Activity"];
      udyamDataSave["Name of Enterprise"] = getUdyamData["Name of Enterprise"];
      udyamDataSave["National Industry Classification Code(S)"] =
        getUdyamData["National Industry Classification Code(S)"];
      udyamDataSave["Official address of Enterprise"] =
        getUdyamData["Official address of Enterprise"];
      udyamDataSave["Organisation Type"] = getUdyamData["Organisation Type"];
      udyamDataSave["Social Category"] = getUdyamData["Social Category"];
      udyamDataSave["Type of Enterprise"] = getUdyamData["Type of Enterprise"];
      udyamDataSave["Unit(s) Details"] = getUdyamData["Unit(s) Details"];
      udyamDataSave.save();

      // console.log('decryptResponse.data------ -3-  ',decryptResponse.data)

      success(res, "Get User Udyam Verification Detail ", decryptResponse.data);
    } else {
      success(res, "Get User Udyam Verification Detail .", udyamDataDb);
    }
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
        // console.log('error check ', error.message)
        return unknownError(res, error.message);
      }
    }
  }
}

module.exports = {
  getUdyamVerification,
};
