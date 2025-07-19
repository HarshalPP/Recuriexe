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
  const dropdownModel = require("../../model/adminMaster/dropdown.model");

  // ------------------Admin Master Add Dropdown Master---------------------------------------
  async function dropDownAdd(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      // const {title ,modelName } = req.body
      if (req.body.title) {
        req.body.title = req.body.title;
      }
      const dropdown = await dropdownModel.create(req.body);
      success(res, "Dropdown  Added Successful", dropdown);

    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  // ------------------Admin Master Dropdown Master "active" or "inactive" updated---------------------------------------
  async function dropdownActiveOrInactive(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            serverValidation(res, { errorName: "serverValidation", errors: errors.array() });
        } else {
          const { dropdownId } = req.body;
          if (!dropdownId || dropdownId.trim() === "") {
              return badRequest(res , "ID is required and cannot be empty");
          }
          if (!mongoose.Types.ObjectId.isValid(dropdownId)) {
            return badRequest(res , "Invalid ID");
          }
            const status = req.body.status
            if (status == "active") {
                const dropdownUpdateStatus =  await dropdownModel.findByIdAndUpdate({ _id:dropdownId}, { status: "active"},{new:true})
            success(res, "dropdown Active" ,dropdownUpdateStatus);
            }
           else if (status == "inactive") {
            const dropdownUpdateStatus =  await dropdownModel.findByIdAndUpdate({ _id:dropdownId}, { status:"inactive"},{new:true})
            success(res, "dropdown inactive" ,dropdownUpdateStatus);
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
  
  // ------------------Admin Master Update Role Dropdown Master ---------------------------------------
  async function updateDropdown(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      let { dropdownId , ...updateFields } = req.body;
      if (typeof updateFields.title === 'string') {
        updateFields.title = updateFields.title.trim().toLowerCase();
      }
      const updateData = await dropdownModel.findByIdAndUpdate(dropdownId, updateFields, {new :true});
      success(res, "Updated Dropdown",updateData);

    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  

  // ------------------Admin Master Get All Dropdown Master---------------------------------------
  async function getAllDropdown(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
        
      let dropdownDetail = await dropdownModel.find({status:"active"});
      dropdownDetail = dropdownDetail.map((dropdown)=>{
        return { ...dropdown.toObject() , title: dropdown.title.toUpperCase()}
      })
      success(res, "Get All dropdownDetail",dropdownDetail);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  

//   -----------------Static Api Get For Dropdown  "modelName"-------------------------------------
async function getAllModelName(req, res) {
    try {
      const modeDetail = [
        {
          modelName: "modeOfCollection",
        },
        {
          modelName: "okCreditAssign",
        },
        {
          modelName: "bankName",
        },
        {
            modelName: "partner",
          }
      ];

      success(res, "Get All Model Name", modeDetail);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  }
  

  
  module.exports = {
    dropDownAdd,
    dropdownActiveOrInactive,
    updateDropdown,
    getAllDropdown,
    getAllModelName

  };
  
