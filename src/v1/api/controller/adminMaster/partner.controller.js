const {
    success,
    unknownError,
    serverValidation,
    badRequest,
  } = require("../../../../../globalHelper/response.globalHelper");
  
  const { validationResult } = require("express-validator");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
  const { partnerNameGoogleSheet } = require("../adminMaster/masterGoogleSheet.controller");
  const partnerModel = require("../../model/adminMaster/partnerName.model");

  // ------------------Admin Master Add partner---------------------------------------
  async function partnerAdd(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      if (req.body.name) {
        req.body.name = req.body.name.toLowerCase().trim();
      }
      const partner = await partnerModel.findOne({name:req.body.name})
      if(partner){
         return badRequest(res, "partner Name Already Register") 
      }
      const partnerDetail = await partnerModel.create(req.body);
     
      success(res, "partner Added Successful", partnerDetail);
      await partnerNameGoogleSheet(partnerDetail)

    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  // ------------------Admin Master partner "active" or "inactive" updated---------------------------------------
  async function partnerActiveOrInactive(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            serverValidation(res, { errorName: "serverValidation", errors: errors.array() });
        } else {
          const status = req.body.status
          const { id } = req.body;
          if (!id || id.trim() === "") {
              return badRequest(res , "ID is required and cannot be empty");
          }
          if (!mongoose.Types.ObjectId.isValid(id)) {
            return badRequest(res , "Invalid ID");
          }
            if (status == "active") {
           const partnerStatusUpdate =  await partnerModel.findByIdAndUpdate({ _id:id}, { status: "active"},{new:true})
            success(res, "partner Active" ,partnerStatusUpdate);
            }
           else if (status == "inactive") {
          const partnerStatusUpdate =  await partnerModel.findByIdAndUpdate({ _id:id}, { status:"inactive"},{new:true})
            success(res, "partner inactive" ,partnerStatusUpdate);
            }
            else{
                return badRequest(res,"Status must be 'active' or 'inactive'");
            }
        }
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
  }
  
  // ------------------Admin Master Update  partner Title ---------------------------------------
  async function updatepartner(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      let { partnerId, ...updateFields } = req.body;
      if (typeof updateFields.name === 'string') {
        updateFields.name = updateFields.name.trim().toLowerCase();
      }
      const updateData = await partnerModel.findByIdAndUpdate(partnerId, updateFields, {new :true});
      success(res, "Updated partner",updateData);
      await partnerNameGoogleSheet(updateData)
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  // ------------------Admin Master Get All partner---------------------------------------
  async function getAllpartner(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      console.log('---hh---')
      let  partnerDetail = await partnerModel.find({status:"active"});
      partnerDetail = partnerDetail.map((partner)=>{
        return {...partner.toObject() , name:partner.name.toUpperCase() }
      })
      success(res, "All partner",partnerDetail);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  async function deletepartner(req, res) {
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
      const partnerData = await partnerModel.findByIdAndDelete(id);
      if (!partnerData) {
        return notFound(res, "partner not found");
      }
      success(res, "partner deleted successfully");
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  }

  module.exports = {
    partnerAdd,
    partnerActiveOrInactive,
    updatepartner,
    getAllpartner,
    deletepartner
  };
  