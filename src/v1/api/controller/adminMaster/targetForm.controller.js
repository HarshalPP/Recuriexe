const {
    success,
    unknownError,
    serverValidation,
    badRequest,
  } = require("../../../../../globalHelper/response.globalHelper");
  
  const { validationResult } = require("express-validator");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
  const targetFormModel = require("../../model/adminMaster/targetForm.model");
  const employeeModel = require("../../model/adminMaster/employe.model")
  const crypto = require('crypto'); // For generating random strings
  const  {updateOrAppendEmployeeTargetToSheet} = require("../../controller/adminMaster/masterGoogleSheet.controller")
  
  // ------------------Admin Master Add titleAdd---------------------------------------

  async function newTargetAdd(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
  
      const { title } = req.body;
      if (!title) {
        return badRequest(res, "title Required");
      }
  
      const targetExist = await targetFormModel.findOne({ title: title });
      if (targetExist) {
        return badRequest(res, "target title already exists");
      }
  
      // Generate a unique code
      const generateUniqueCode = (title) => {
        const prefix = title.slice(0, 2).toUpperCase(); 
        const randomString = crypto.randomBytes(3).toString('hex'); 
        return `${prefix}${randomString}`.slice(0, 5); 
      };
  
      const uniqueCode = generateUniqueCode(title);
  
      // Add the unique code to the request body
      req.body.code = uniqueCode;
  
      const targetDetail = await targetFormModel.create(req.body);
      success(res, "Target Added Successfully", targetDetail);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  }
  
  
  // ------------------Admin Master Role "active" or "inactive" updated---------------------------------------
  async function targetActiveOrInactive(req, res) {
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
                const targetFormStatus =  await targetFormModel.findByIdAndUpdate({ _id:id}, { status: "active"},{new:true})
            success(res, "Target Active" ,targetFormStatus);
            }
           else if (status == "inactive") {
            const targetFormStatus =  await targetFormModel.findByIdAndUpdate({ _id:id}, { status:"inactive"},{new:true})
            success(res, "target inactive" ,targetFormStatus);
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
  
  // ------------------Admin Master Update Role Name Role ---------------------------------------
  async function updateTarget(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      let { id , title } = req.body;
      if(!id){
        return badRequest(res , "Target Id Required")
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return badRequest(res , "Invalid ID");
      }

      // const existTitle = await targetFormModel.findOne({title:title})
      // if(existTitle){
      //   return badRequest(res , "Title Already exist");
      // }
      const updateData = await targetFormModel.findByIdAndUpdate(id, req.body, {new :true});
      success(res, "Updated Target",updateData);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  // ------------------Admin Master Get All Role---------------------------------------
  async function getAllTarget(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
        
      const targetDetail = await targetFormModel.find({status:"active"});
      success(res, "All Target",targetDetail);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };

    // ------------------Admin Master add employee target for all Role---------------------------------------
    async function addEmployeeTarget(req, res) {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            errorName: "serverValidation",
            errors: errors.array(),
          });
        }
    
        const { employeeId, employeeTarget } = req.body;
        console.log(req.body, "<>");
    
        // Update employee target in MongoDB
        const targetDetail = await employeeModel.findOneAndUpdate(
          { _id: employeeId },
          { $set: { employeeTarget } },
          { new: true }
        );
    
        // ✅ No need to use Object.entries() because employeeTarget is already an array
        success(res, "Emp All Target", targetDetail?.employeeTarget);
    
        // Update Google Sheets
        await updateOrAppendEmployeeTargetToSheet(employeeId, employeeTarget);
      } catch (error) {
        console.log(error);
        unknownError(res, error);
      }
    }
    
  


  // ------------------Admin Master add employee target details ---------------------------------------
  async function empTargetDetails(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      const { employeeId } = req.query
      const targetDetail = await employeeModel.findOne({ _id : employeeId});
      if(!targetDetail){
        return badRequest(res,"employee is not found")
      }
      success(res, "Emp All Target",targetDetail?.employeeTarget);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  module.exports = {
    newTargetAdd ,getAllTarget,
    updateTarget ,
    targetActiveOrInactive,
    addEmployeeTarget,
    empTargetDetails
  };
  
