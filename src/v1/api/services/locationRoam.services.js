const {
    success,
    unknownError,
    serverValidation,
    badRequest,
  } = require("../../../../globalHelper/response.globalHelper");
  
  const { validationResult } = require("express-validator");
  const axios = require("axios");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
  

  async function roamIdCreate(req) {
    try {
      // Set up the data for the POST request
      const { employeeId ,employeName ,employeUniqueId } = req.body;
      console.log(employeeId ,employeName ,employeUniqueId);
      
      const postData = {
        app_type: 1,
        device_token: "your-device-token", 
        description: `${employeName} - ${employeUniqueId}`,  
        metadata: {
            employeeId: employeeId,
        },
      };
  
      const headers = {
        'Api-key': '4528c80d5ca9449a8e6717154e5c4756', 
        'Content-Type': 'application/json',
      };

      const response = await axios.post('https://api.roam.ai/v1/api/user/', postData, { headers });
      const  RoamDetail = response.data.data
     
      return RoamDetail; // console.log("ds",data)
      // success(res, 'Roam ID created successfully', RoamDetail)

    } catch (error) {
      console.log(error.message);
      
      return false
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
        } 
      }
    }
  }

  
  async function getRoamUsers(req,res) {
    try {
      // Set up the data for the POST request
  
  
      const headers = {
        'Api-Key': '4528c80d5ca9449a8e6717154e5c4756', 
        'Content-Type': 'application/json',
      };

      const response = await axios.get('https://api.roam.ai/v1/api/user/?page_number=3', { headers });
      const  RoamDetail = response.data.data
      
     return success(res,"roam user",RoamDetail)
      // return RoamDetail; // console.log("ds",data)
      // success(res, 'Roam ID created successfully', RoamDetail)

    } catch (error) {
      return badRequest(res,error.message)
     
    }
  }


  module.exports = {
    roamIdCreate,
    getRoamUsers
  };
  