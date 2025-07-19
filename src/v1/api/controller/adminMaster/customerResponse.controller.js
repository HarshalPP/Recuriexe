const {
    success,
    unknownError,
    serverValidation,
    badRequest,
    notFound
  } = require("../../../../../globalHelper/response.globalHelper");
  
  const { validationResult } = require("express-validator");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
  const customerResponseModel = require("../../model/adminMaster/customerResponse.model");
  const { customerResponseGoogleSheet } = require('./masterGoogleSheet.controller')  

  // ------------------Admin Master Add Customer Response---------------------------------------
  async function customerResponseAdd(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      if (req.body.title) {
        req.body.title = req.body.title
      }
      const customerResponse = await customerResponseModel.create(req.body);
      success(res, "Customer Response Added Successful", customerResponse);
      await customerResponseGoogleSheet(customerResponse)
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  // ------------------Admin Master Customer Response "active" or "inactive" updated---------------------------------------
  async function customerResponseActiveOrInactive(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            serverValidation(res, { errorName: "serverValidation", errors: errors.array() });
        } else {
          const { id } = req.body;
          if (!id || id.trim() === "") {
              return badRequest(res , "ID is required and cannot be empty");
          }
          if (!mongoose.Types.ObjectId.isValid(id)) {
            return badRequest(res , "Invalid ID");
          }
            const status = req.body.status
            if (status == "active") {
                const costCenterUpdateStatus =  await customerResponseModel.findByIdAndUpdate({ _id:id}, { status: "active"},{new:true})
            success(res, "costCenter Active" ,costCenterUpdateStatus);
            }
           else if (status == "inactive") {
            const costCenterUpdateStatus =  await customerResponseModel.findByIdAndUpdate({ _id:id}, { status:"inactive"},{new:true})
            success(res, "costCenter inactive" ,costCenterUpdateStatus);
            }
            else{
                return badRequest(res, "Status must be 'active' or 'inactive'");
            }
           
        }
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
  }
  
  // ------------------Admin Master Update Role Customer Response ---------------------------------------
  async function updateCustomerResponse(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      let { customerResponseId , ...updateFields } = req.body;
      if (typeof updateFields.title === 'string') {
        updateFields.title = updateFields.title.trim().toLowerCase();
      }
      const updateData = await customerResponseModel.findByIdAndUpdate(customerResponseId, updateFields, {new :true});
      success(res, "Updated EmploymentType",updateData);
      await customerResponseGoogleSheet(updateData)
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  

  // ------------------Admin Master Get All CUstomer Response---------------------------------------
  async function getAllCustomerResponse(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
        
      let customerResponse = await customerResponseModel.find({status:"active"});
      customerResponse = customerResponse.map((customerRes)=>{
        return { ...customerRes.toObject() , title: customerRes.title.toUpperCase()}
      })
      success(res, "Get All customerResponse",customerResponse);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  async function deleteCustomerResponse(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }  
      const { id } = req.query;
      if (!id) {
        return badRequest(res , "ID is required");
      }
      if (!mongoose.isValidObjectId(id)) {
        return badRequest(res , "Invalid ID");
      }
      const customerResponse = await customerResponseModel.findByIdAndDelete(id);
      if (!customerResponse) {
        return notFound(res, "Customer response not found");
      }
      success(res, "Customer response deleted successfully");
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  }

  
  module.exports = {
    customerResponseAdd,
    customerResponseActiveOrInactive,
    updateCustomerResponse,
    getAllCustomerResponse,
    deleteCustomerResponse
  };
  
