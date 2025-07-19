
const {
  success,
  unknownError,
  serverValidation,
  badRequest,
} = require("../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");
const panComModel = require("../model/panComprehensive.model");
const panFatherModel = require("../model/panFather.model");


const applicantModel = require("../model/applicant.model");
const coApplicantModel = require("../model/co-Applicant.model");
const guarantorModel = require("../model/guarantorDetail.model");

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const axios = require("axios");

// ------------PAN Detail Fetching Api Using 3rd Party Api---------------------
async function PanComprehensive(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const { PanNumber, transID, docType , formName } = req.body;


    
    const aadharExistInApp = await applicantModel.find({ panNo: PanNumber });
    const aadharExistInCoApp = await coApplicantModel.findOne({ docNo: PanNumber });
    const aadharExistInGuarantor = await guarantorModel.find({ docNo: PanNumber });

    if (formName === "applicant") {
      if (aadharExistInCoApp) {
        return badRequest(res, "PAN Number is already used as Co-Applicant");
      }
      if (aadharExistInApp && aadharExistInApp.length > 0) {
        return badRequest(res, "PAN Number is already used as an Applicant");
      }
    }

    if (formName === "guarantor") {
      if (aadharExistInCoApp) {
        return badRequest(res, "PAN Number used in Co-Applicant ");
      }
      if (aadharExistInGuarantor && aadharExistInGuarantor.length > 0) {
        return badRequest(res, "PAN Number is already in Guarantor");
      }
    }


    if (formName === "coApplicant") {
      if (aadharExistInApp && aadharExistInApp.length > 0) {
        return badRequest(res, "PAN Number is already used In Applicant ");
      }
      if (aadharExistInGuarantor && aadharExistInGuarantor.length > 0) {
        return badRequest(res, "PAN Number is already used In Guarantor");
      }
      if (aadharExistInCoApp) {
        return badRequest(res, "PAN Number is already used as Co-Applicant.");
      }
    }

    // const panNumberFind = await panComModel.findOne({ PanNumber: PanNumber }).select("-createdAt -_id -__v -updatedAt")
    // if (!panNumberFind) {
    
      // Step 1: Encrypt
      const encryptResponse = await axios.post(
        "https://www.truthscreen.com/v1/apicall/encrypt",
        {
          PanNumber,
          transID,
          docType,
        },
        {
          headers: {
            username: "production@fincoopers.in",
          },
        }
      );
      const requestData = encryptResponse.data;

      const PanResponse = await axios.post(
        "https://www.truthscreen.com/v1/apicall/nid/panComprehensive",
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

      // // Step 3: Decrypt
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
      
      success(res, "Get User Details using PAN.", decryptResponse.data);
      const panCardData = decryptResponse.data.data;
      const panComData = new panComModel(req.body);
      panComData.panNumber = PanNumber;
      panComData.aadhaar_linked = panCardData.aadhaar_linked;
      panComData.address.city = panCardData.address.city;
      panComData.address.country = panCardData.address.country;
      panComData.address.full = panCardData.address.full;
      panComData.address.line_1 = panCardData.address.line_1;
      panComData.address.line_2 = panCardData.address.line_2;
      panComData.address.street_name = panCardData.address.street_name;
      panComData.address.zip = panCardData.address.zip;
      panComData.category = panCardData.category;
      panComData.client_id = panCardData.client_id;
      panComData.dob = panCardData.dob;
      panComData.dob_check = panCardData.dob_check;
      panComData.dob_verified = panCardData.dob_verified;
      panComData.email = panCardData.email;
      panComData.full_name = panCardData.full_name;
      panComData.full_name_split = panCardData.full_name_split;
      panComData.gender = panCardData.gender;
      panComData.input_dob = panCardData.input_dob;
      panComData.less_info = panCardData.less_info;
      panComData.masked_aadhaar = panCardData.masked_aadhaar;
      panComData.pan_number = panCardData.pan_number;
      panComData.phone_number = panCardData.phone_number;
      panComData.formName = formName
      const result = await panComData.save();
      // badRequest(res, "Pan Not  Exist");
    // } else {
      // console.log('Get User Details using PAN',panNumberFind)
      // badRequest(res, "Pan Already Exist");
      // success(res, "Get User Details using PAN.", panNumberFind);
    // }
  } catch (error) {
      console.log(error);
      // unknownError(res, error);
      if (axios.isAxiosError(error)) {
        const { response } = error;
        if (response) {
          if (response.status === 402) {
            return badRequest(res, "Pan comprehensive credit plan has expired. Recharge now to continue access.");
          }
        } else {
          return unknownError(res, error.message);
        }
      }
    }
  }

async function PanFatherName(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const { docNumber, trans_id, docType , formName } = req.body;

    // const aadharExistInApp = await applicantModel.findOne({
    //   panNo: docNumber,
    // });
    // const aadharExistInCoApp = await coApplicantModel.findOne({
    //   docNo: docNumber,
    // });
    // const aadharExistInGuarantor = await guarantorModel.findOne({
    //   docNo: docNumber,
    // });
    // if (aadharExistInApp) {
    //   console.log("This is pan Number already Applicat Form");
    //   return badRequest(res,"PAN Number Already In Applicant");
    // }
    // if (aadharExistInCoApp) {
    //   console.log("This is pan Number co-Applicat Form");
    //   return badRequest(res,"PAN Number Already In Co-Applicant");
    // }
    // if (aadharExistInGuarantor) {
    //   console.log("This is pan Number guarantor Form");
    //   return badRequest(res,"PAN Number Already In Guarantor");
    // }

    const aadharExistInApp = await applicantModel.find({ panNo: docNumber });
    const aadharExistInCoApp = await coApplicantModel.findOne({ docNo: docNumber });
    const aadharExistInGuarantor = await guarantorModel.find({ docNo: docNumber });

    if (formName === "applicant") {
      if (aadharExistInCoApp) {
        return badRequest(res, "PAN Number is already used as Co-Applicant");
      }
      if (aadharExistInApp && aadharExistInApp.length > 0) {
        return badRequest(res, "PAN Number is already used as an Applicant");
      }
    }

    if (formName === "guarantor") {
      if (aadharExistInCoApp) {
        return badRequest(res, "PAN Number used in Co-Applicant ");
      }
      if (aadharExistInGuarantor && aadharExistInGuarantor.length > 0) {
        return badRequest(res, "PAN Number is already in Guarantor");
      }
    }


    if (formName === "coApplicant") {
      if (aadharExistInApp && aadharExistInApp.length > 0) {
        return badRequest(res, "PAN Number is already used In Applicant ");
      }
      if (aadharExistInGuarantor && aadharExistInGuarantor.length > 0) {
        return badRequest(res, "PAN Number is already used In Guarantor");
      }
      if (aadharExistInCoApp) {
        return badRequest(res, "PAN Number is already used as Co-Applicant.");
      }
    }

    // const PanFatherFind = await panFatherModel.findOne({
      // panNumber: docNumber,
    // }).select("-createdAt -_id -__v -updatedAt");
    // if (!PanFatherFind) {
      // Step 1: Encrypt
      const encryptResponse = await axios.post(
        "https://www.truthscreen.com/v1/apicall/encrypt",
        {
          docNumber,
          trans_id,
          docType,
        },
        {
          headers: {
            username: "production@fincoopers.in",
          },
        }
      );
      const requestData = encryptResponse.data;
      // console.log(requestData, 'requestData')

      // Step 2: Get OTP
      const PanResponse = await axios.post(
        "https://www.truthscreen.com/v1/apicall/nid/pan_father_name",
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

      // // Step 3: Decrypt
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
      success(res, "Get Father's Details using PAN.", decryptResponse.data);
      const panData = decryptResponse.data.msg.data;
      const panFatherData = new panFatherModel(req.body);
      panFatherData.panNumber = docNumber;
      panFatherData.additional_check = panData.additional_check;
      panFatherData.category = panData.category;
      panFatherData.client_id = panData.client_id;
      panFatherData.dob = panData.dob;
      panFatherData.dob_check = panData.dob_check;
      panFatherData.dob_verified = panData.dob_verified;
      panFatherData.father_name = panData.father_name;
      panFatherData.full_name = panData.full_name;
      panFatherData.less_info = panData.less_info;
      panFatherData.pan_number = panData.pan_number;
      panFatherData.formName = formName
      const panFatherResult = await panFatherData.save();
      // } else {
        // success(res, "PAN Service Not Available ", );
      // const  panDatA = {msg: {data:PanFatherFind}}
      // success(res, "Get Father's Details using PAN", panDatA);
      // success(res, "Get Pan Father's Details", PanFatherFind);
    // }
    // console.log(panFatherResult, "final data");
  }  catch (error) {
      console.log(error);
      // unknownError(res, error);
      if (axios.isAxiosError(error)) {
        const { response } = error;
        if (response) {
          if (response.status === 402) {
            return badRequest(res, "Pan father api credit plan has expired. Recharge now to continue access.");
          }
        } else {
          return unknownError(res, error.message);
        }
      }
    }
  }

module.exports = {
  PanComprehensive,
  PanFatherName,
};
