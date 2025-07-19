const {
    success,
    unknownError,
    serverValidation,
    badRequest,
  } = require("../../../../../globalHelper/response.globalHelper");
  
  const { validationResult } = require("express-validator");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
  const vendorTypeModel = require("../../model/adminMaster/vendorType.model");
  const {vendorTypeGoogleSheet} = require('./masterGoogleSheet.controller')
  
  // ------------------------Admin Master Add Vendor Type---------------------------------------
  async function vendorTypeAdd(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      if (req.body.vendorType) {
        req.body.vendorType = req.body.vendorType.toLowerCase().trim();
      }
      const vendor = await vendorTypeModel.findOne({vendorType: req.body.vendorType})
      if(vendor){
        return badRequest(res,"Vendor Type Already Added") 
    }
      const vendorDetail = await vendorTypeModel.create(req.body);
      
      success(res, "Vendor Type Added Successful", vendorDetail);
      await vendorTypeGoogleSheet(vendorDetail)
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  // ------------------Admin Master vendor "active" or "inactive" updated---------------------------------------
  async function vendorTypeActiveOrInactive(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            serverValidation(res, { errorName: "serverValidation", errors: errors.array() });
        } else {
          const  id = req.body.id;
          const status = req.body.status
          if (!id || id.trim() === "") {
            return badRequest(res , "ID is required and cannot be empty");
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return badRequest(res , "Invalid ID");
        }
            if (status == "active") {
                const vendorTypeStatusUpdate =  await vendorTypeModel.findByIdAndUpdate({ _id:id}, { status: "active"},{new:true})
            success(res, "vendorType Active" ,vendorTypeStatusUpdate);
            }
           else if (status == "inactive") {
            const vendorTypeStatusUpdate =  await vendorTypeModel.findByIdAndUpdate({ _id:id}, { status:"inactive"},{new:true})
            success(res, "vendorType inactive" ,vendorTypeStatusUpdate);
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
  
  // ------------------Admin Master Update  vendor ---------------------------------------
  async function updateVendorType(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      let { vendorTypeId, ...updateFields } = req.body;
      if (typeof updateFields.vendorType === 'string') {
        updateFields.vendorType = updateFields.vendorType.trim().toLowerCase();
      }
      const updateData = await vendorTypeModel.findByIdAndUpdate(vendorTypeId, updateFields, {new :true});
      success(res, "Updated Vendor Type",updateData);
      await vendorTypeGoogleSheet(updateData)
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  // ------------------Admin Master Get Vendor Type Id---------------------------------------
  async function vendorTypeById(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      const vendorTypeDetail = await vendorTypeModel.findById({_id:new ObjectId(req.params.vendorTypeId)})
       if(!vendorTypeDetail){
           return badRequest(res,"Vendor Type Not Found")
       }
      success(res, "Get Vendor Type Detail",vendorTypeDetail);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };

  // ------------------Admin Master Get All Vendor Type---------------------------------------
    async function getAllVendorType(req, res) {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            errorName: "serverValidation",
            errors: errors.array(),
          });
        }
        const { vendorType } = req.query;

        if (vendorType === 'internalVendor') {
          // For internalVendor, return specific types
          vendorTypeDetail = await vendorTypeModel.find({
            status: "active",
            vendorType: { $in: ["hoProccess", "creditPd", "branchPendency"] },
          });
        } else if (vendorType === 'externalVendor') {
          // For externalVendor, return specific types
          vendorTypeDetail = await vendorTypeModel.find({
            status: "active",
            // vendorType: { $in: ["rcu", "legal", "technical", "rm", "tagging", "other", "branch",] },
          });
        } else {
          return badRequest(res, "Invalid vendorType. It must be either 'internalVendor' or 'externalVendor'.");
        }

        // const vendorTypeDetail = await vendorTypeModel.find({status:"active"})
      success(res, "Get All Vendor Type Detail",vendorTypeDetail);

      } catch (error) {
        console.log(error);
        unknownError(res, error);
      }
    };
  
  module.exports = {
    vendorTypeAdd,
    vendorTypeActiveOrInactive,
    updateVendorType,
    vendorTypeById,
    getAllVendorType
  };
  