const {
    success,
    unknownError,
    serverValidation,
    notFound,
    badRequest,
  } = require("../../../../../globalHelper/response.globalHelper");
  
  const { validationResult } = require("express-validator");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
  const finalDropdownModel = require("../../model/adminMaster/titleDropdown.model");
  
  // ------------------Admin Master Add Final Dropdown Title---------------------------------------
  async function  addFinalDropdown(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      const {title} = req.body
      if(!title){
        return badRequest(res , "title Required")
      }
      const targetExist = await finalDropdownModel.findOne({title:title})
      if(targetExist){
        return badRequest(res , "Final dropdown title already exist")
      }
      const finalDropdownDetail = await finalDropdownModel.create(req.body);
      success(res, "Final Dropdown Added Successful", finalDropdownDetail);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  // ------------------Admin Master Final Dropdown "active" or "inactive" updated---------------------------------------
  async function activeOrInactiveFinalDropdown(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            serverValidation(res, { errorName: "serverValidation", errors: errors.array() });
        } else {
          const  titleId = req.body.titleId;
          const status = req.body.status
          if (!titleId || titleId.trim() === "") {
            return badRequest(res , "ID is required and cannot be empty");
        }
        const titleForm = await finalDropdownModel.findById({_id:new ObjectId(req.body.titleId)})
        if(!titleForm){
          return notFound(res , "Not Found titleId")
        }
      
            if (status == "active") {
                const targetFormStatus =  await finalDropdownModel.findByIdAndUpdate({ _id:new ObjectId(titleId)}, { status: "active"},{new:true})
            success(res, "Final Dropdown Active" ,targetFormStatus);
            }
           else if (status == "inactive") {
            const targetFormStatus =  await finalDropdownModel.findByIdAndUpdate({ _id:new ObjectId(titleId)}, { status:"inactive"},{new:true})
            success(res, "Final Dropdown inactive" ,targetFormStatus);
            }
            else{
                return badRequest(res , "Status must be 'active' or 'inactive'");
            }
           
        }
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
  }
  
  // ------------------Admin Master Update Final Dropdown Title ---------------------------------------
  async function updateFinalDropdown(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      let { titleId , title } = req.body;
      if (!titleId || titleId.trim() === "") {
        return badRequest(res, "ID is required and cannot be empty");
      }

  
      const titleForm = await finalDropdownModel.findById({_id:new ObjectId(req.body.titleId)})
      if(!titleForm){
        return notFound(res , "Not Found formTitleId")
      }

      const updateData = await finalDropdownModel.findByIdAndUpdate(titleId, req.body, {new :true});
      success(res, "Updated Final Dropdown",updateData);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  // ------------------Admin Master Get All Final Dropdown List---------------------------------------
  async function getAllFinalDropdown(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
        
      const finalDropdownDetail = await finalDropdownModel.find({status:"active"}).sort({ createdAt: -1 });
      success(res, "All Final Dropdown List",finalDropdownDetail);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  

  
  module.exports = {
    addFinalDropdown ,
    getAllFinalDropdown,
    updateFinalDropdown , 
    activeOrInactiveFinalDropdown 
};
  
