const {
    success,
    unknownError,
    serverValidation,
    badRequest,
    notFound,
  } = require("../../../../../globalHelper/response.globalHelper");
  
  const { validationResult } = require("express-validator");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
 const noticeTypeModel = require("../../model/adminMaster/noticeType.model");
  
  // ------------------Admin Master NOtice Add---------------------------------------
  async function noticeTypeAdd(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }

      const noticeDetail = await noticeTypeModel.findOne({title:req.body.title})
      if(noticeDetail){
         return badRequest(res,"Given Notice Already Added." ) 
      }
      const notice = await noticeTypeModel.create(req.body);
     
      success(res, "Notice  Added Successful", notice);

    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  
  // ------------------Admin Master Get All Notice Detail----------------------------
  async function getAllNoticeType(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
        const noticeDetail = await noticeTypeModel.find({status:'active'});
        success(res, "Get All Notice Detail",noticeDetail);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  

  // ----------------Admin Notice Type Inactive -------------------------------------
  async function inactiveNoticeType(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return serverValidation(res, {
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
  
      const noticeTypeId = req.body.noticeTypeId;
      if (!noticeTypeId || noticeTypeId.trim() === "") {
        return badRequest(res, "ID is required and cannot be empty");
      }
  
      if (!mongoose.Types.ObjectId.isValid(noticeTypeId)) {
        return badRequest(res, "Invalid ID");
      }
      const data = await noticeTypeModel.findByIdAndUpdate(noticeTypeId, { status: "inactive" },{ new: true });
      if (!data) {
        return notFound(res, "Notice Type Not Found");
      }
  
      return success(res, "Notice Type Inactive",data);
    } catch (error) {
      console.log(error);
      return unknownError(res, error);
    }
  }

  // ---------------Admin Update Notice Type-----------------------------------------
  async function updateNoticeTpye(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      let { noticeTypeId, ...updateFields } = req.body;
      if (!noticeTypeId || noticeTypeId.trim() === "") {
        return badRequest(res, "Please Select noticeTypeId");
      }
  
      const noticeDetail = await noticeTypeModel.findById({ _id: new ObjectId(noticeTypeId) });
      if (!noticeDetail) {
        return badRequest(res, "noticeTypeId Not Found");
      }
      const updateData = await noticeTypeModel.findByIdAndUpdate(noticeTypeId, updateFields, {new :true});
      success(res, "Updated Notice Type",updateData);
      // await modeOfCollectionGoogleSheet(updateData)
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };

  module.exports = {
    noticeTypeAdd,
    getAllNoticeType,
    inactiveNoticeType,
    updateNoticeTpye
  };
  