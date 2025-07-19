const {
    success,
    unknownError,
    serverValidation,
    badRequest,
  } = require("../../../../../globalHelper/response.globalHelper");
  
  const { validationResult } = require("express-validator");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
  const permissionFormModel = require("../../model/adminMaster/permissionForm.model");
  
  // ------------------Admin Master Add Permission Form---------------------------------------
  async function permissionFormAdd(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }

      const permissionDetail = await permissionFormModel.create(req.body);
      success(res, "Permission Form Added Successful", permissionDetail);

    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  // ------------------Admin Master PermissionForm "active" or "inactive" updated---------------------------------------
  async function permissionActiveOrInactive(req, res) {
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
                const roleUpdateStatus =  await permissionFormModel.findByIdAndUpdate({ _id:id}, { status: "active"},{new:true})
            success(res, "Role Active" ,roleUpdateStatus);
            }
           else if (status == "inactive") {
            const roleUpdateStatus =  await permissionFormModel.findByIdAndUpdate({ _id:id}, { status:"inactive"},{new:true})
            success(res, "Role inactive" ,roleUpdateStatus);
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
  
  // ------------------Admin Master Update Permission Form---------------------------------------
  async function updatePermissionForm(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      let { permissionFormId, ...updateFields } = req.body;

      const updateData = await permissionFormModel.findByIdAndUpdate(permissionFormId, updateFields, {new :true});
      success(res, "Updated Permission Form",updateData);

    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  // ------------------Admin Master Get All Permission Form---------------------------------------
  async function getAllPermissionForm(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      } 
      const permissionFormDetail = await permissionFormModel.find({status:"active"});
      success(res, "All Permission Form Detail",permissionFormDetail);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  module.exports = {
    permissionFormAdd,
    permissionActiveOrInactive,
    updatePermissionForm,
    getAllPermissionForm
  };
  
