const {
    success,
    unknownError,
    serverValidation,
    badRequest,
  } = require("../../../../globalHelper/response.globalHelper");
  
  const { validationResult } = require("express-validator");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
  const lmsModel = require("../model/ratnaaFin.model")
  const bcrypt = require('bcrypt')
  
  // ------------------------ add LMS---------------------------------------
  async function addLMS(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      const lmsDetail = new lmsModel(req.body);
      const lmsData = await lmsDetail.save()
      success(res, "lms Added Successful", lmsDetail);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
    
  module.exports = {
    addLMS,
  };
  