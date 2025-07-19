const {
    success,
    unknownError,
    serverValidation,
    badRequest,
  } = require("../../../../../globalHelper/response.globalHelper");
  
  const { validationResult } = require("express-validator");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
  const companyModel = require("../../model/adminMaster/company.model");
  const {companyGoogleSheet} = require("../adminMaster/masterGoogleSheet.controller");
const { ideahub_v1beta } = require("googleapis");

  // ------------------Admin Master Add Company---------------------------------------
  async function companyAdd(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      if (req.body.companyName) {
        req.body.companyName = req.body.companyName;
      }
      const company = await companyModel.findOne({companyName:req.body.companyName})
      if(company){
         return badRequest(res, "Company Name Already Register") 
      }
      const companyDetail = await companyModel.create(req.body);
     
      success(res, "Company Added Successful", companyDetail);
      await companyGoogleSheet(companyDetail)

    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  // ------------------Admin Master Company "active" or "inactive" updated---------------------------------------
  async function companyActiveOrInactive(req, res) {
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
           const companyStatusUpdate =  await companyModel.findByIdAndUpdate({ _id:id}, { status: "active"},{new:true})
            success(res, "Company Active" ,companyStatusUpdate);
            }
           else if (status == "inactive") {
          const companyStatusUpdate =  await companyModel.findByIdAndUpdate({ _id:id}, { status:"inactive"},{new:true})
            success(res, "Company inactive" ,companyStatusUpdate);
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
  
  // ------------------Admin Master Update  Company Title ---------------------------------------
  async function updateCompany(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      let { companyId, ...updateFields } = req.body;
      if (typeof updateFields.companyName === 'string') {
        updateFields.companyName = updateFields.companyName.trim().toLowerCase();
      }
      const updateData = await companyModel.findByIdAndUpdate(companyId, updateFields, {new :true});
      success(res, "Updated Company",updateData);
      await companyGoogleSheet(updateData)
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  

  // ------------------Admin Master Get All Company---------------------------------------
  async function getAllCompany(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      let  companyDetail = await companyModel.find({status:"active"});
      companyDetail = companyDetail.map((company)=>{
        return {...company.toObject() , companyName:company.companyName.toUpperCase() }
      })
      success(res, "All Company",companyDetail);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  async function deleteCompany(req, res) {
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
      const companyData = await companyModel.findByIdAndDelete(id);
      if (!companyData) {
        return notFound(res, "Company not found");
      }
      success(res, "Company deleted successfully");
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  }


  

  module.exports = {
    companyAdd,
    companyActiveOrInactive,
    updateCompany,
    getAllCompany,
    deleteCompany
  };
  