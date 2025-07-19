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
  const tvrFormQuestionModel = require("../../model/adminMaster/tvrFormQuestion.model");
  
  // ------------------Admin Master Add TVR Form Question Title---------------------------------------
  async function  addTvrFormQuestion(req, res) {
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
      const tvrFormQuestionDetail = await tvrFormQuestionModel.findOne({title:title})
      if(tvrFormQuestionDetail){
        return badRequest(res , "TVR Form Question title already exist")
      }
      const TvrFormQuestionDetail = await tvrFormQuestionModel.create(req.body);
      success(res, "TVR Form Question Added Successful", TvrFormQuestionDetail);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  // ------------------Admin Master TVR Form Question "active" or "inactive" updated---------------------------------------
  async function activeOrInactiveTvrFormQuestion(req, res) {
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
        const titleForm = await tvrFormQuestionModel.findById({_id:new ObjectId(req.body.titleId)})
        if(!titleForm){
          return notFound(res , "Not Found titleId")
        }
      
            if (status == "active") {
                const tvrFormStatus =  await tvrFormQuestionModel.findByIdAndUpdate({ _id:new ObjectId(titleId)}, { status: "active"},{new:true})
            success(res, "TVR Form Question Active" ,tvrFormStatus);
            }
           else if (status == "inactive") {
            const tvrFormStatus =  await tvrFormQuestionModel.findByIdAndUpdate({ _id:new ObjectId(titleId)}, { status:"inactive"},{new:true})
            success(res, "TVR Form Question inactive" ,tvrFormStatus);
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
  
  // ------------------Admin Master Update TVR Form Question Title ---------------------------------------
  async function updateTvrFormQuestion(req, res) {
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

  
      const titleForm = await tvrFormQuestionModel.findById({_id:new ObjectId(req.body.titleId)})
      if(!titleForm){
        return notFound(res , "Not Found formTitleId")
      }

      const updateData = await tvrFormQuestionModel.findByIdAndUpdate(titleId, req.body, {new :true});
      success(res, "Updated TVR Form Question",updateData);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  // ------------------Admin Master Get All TVR Form Question List---------------------------------------
  async function getAllTvrFormQuestion(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
        
      const TvrFormQuestionDetail = await tvrFormQuestionModel.find({status:"active"}).sort({ createdAt: -1 });
      success(res, "All TVR Form Question List",TvrFormQuestionDetail);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  

  
  module.exports = {
    addTvrFormQuestion ,
    getAllTvrFormQuestion,
    updateTvrFormQuestion , 
    activeOrInactiveTvrFormQuestion 
};
  
