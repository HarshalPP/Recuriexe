const {
    success,
    unknownError,
    serverValidation,
    badRequest,
  } = require("../../../../../globalHelper/response.globalHelper");
  
  const axios = require("axios")
  const { validationResult } = require("express-validator");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
  const countryModel = require("../../model/adminMaster/country.model");
  const stateModel = require("../../model/adminMaster/state.model")

  // ------------------Admin Master Add Country---------------------------------------
  async function countryAdd(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
  
      // Fetch country data
      const response = await axios.get("https://restcountries.com/v3.1/all");
      if (!response.data || response.data.length === 0) {
        return res.status(404).json({ message: "No countries found" });
      }
  
      // Process and save each country
      const savedCountries = [];
      for (const country of response.data) {
        try {
          // Extract country data, including numeric code
          const countryData = {
            countryName: country.name.common,
            countryCode: country.cca2,
            countryNumericCode: country.ccn3, 
          };
  
          // Check if the country already exists
          const existingCountry = await countryModel.findOne({
            countryName: countryData.countryName,
          });
  
          if (!existingCountry) {
            // Save new country
            const countryDetail = await countryModel.create(countryData);
            savedCountries.push(countryDetail);
          }
        } catch (innerError) {
          console.error("Error saving country:", innerError.message);
          // Log the error but continue processing other countries
        }
      }
  
      // Prepare and send response
      const responseData = {
        savedCount: savedCountries.length,
        savedCountries,
      };
    return success(res, "Countries Added Successfully", responseData);


    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  
  // ------------------Admin Master Get All Country---------------------------------------
  async function getAllcountry(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }

      let  countryDetail = await countryModel.find({status:"active"});
      success(res, "All County",countryDetail);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };

//--------------------Admin Master Add State-----------------------------------------------
async function stateAdd(req, res) {
    try {
      // Replace this URL or file with the appropriate data source for states
      const response = await axios.get("https://countriesnow.space/api/v0.1/countries/states"); 
      if (!response.data || !response.data.data || response.data.data.length === 0) {
        return res.status(404).json({ message: "No states found in the response" });
      }
  
      const savedStates = [];
        // console.log("ds",response.data.data)
      for (const country of response.data.data) {
        const countryName = country.iso2;
        const states = country.states;

        for (const state of states) {
          try {
            const stateData = {
              stateName: state.name,
              stateCode: state.state_code || "",
              countryCode: countryName,
            };
  
            // Check if state already exists in the database
            const existingState = await stateModel.findOne({
              stateName: stateData.stateName,
              countryCode: stateData.countryName,
            });
  
            if (!existingState) {
              // Save the state if it doesn't exist
              const stateDetail = await stateModel.create(stateData);
              savedStates.push(stateDetail);
            }
          } catch (innerError) {
            console.error("Error saving state:", innerError.message);
          }
        }
      }
  
      // Respond with the saved states
      res.status(200).json({
        message: "States added successfully",
        savedCount: savedStates.length,
        savedStates,
      });
  
    //   return res.status(200).json({ message: "States added successfully", data: responseData });
    } catch (error) {
      console.error("Error in stateAdd:", error.message);
      return res.status(500).json({ error: error });
    }
  }

    async function getAllCountryState(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      

      const {countryCode} = req.query

      let  stateDetail = await stateModel.find({status:"active",countryCode:countryCode});
    
      success(res, "All State",stateDetail);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };

  

  module.exports = {
    countryAdd,
    getAllcountry,
    getAllCountryState,
    stateAdd,
  };
  