const {
    success,
    unknownError,
    serverValidation,
    unauthorized,
    badRequest,
  } = require("../../../../globalHelper/response.globalHelper");
  
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const questionModel = require('../model/questions.model')
const ObjectId = mongoose.Types.ObjectId;
  
  
  // ---------------------qustions Add------------------------
async function addQuestion(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return serverValidation(res, {
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      const tokenId = new ObjectId(req.Id);
      const { question_Answer } = req.body;
      const addQuestions = new questionModel({
        userId:tokenId,
        question_Answer,
      });
      await addQuestions.save();
      return success(res, "Questions added successfully", addQuestions);
    } catch (error) {
      console.error(error);
      unknownError(res, error);
    }
}
  
  // ---------------------qustions detail------------------------
async function detailQuestion(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return serverValidation(res, {
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      const questionsdetail =  await questionModel.findById({id:req.params.id})
      return success(res, "Questions Detail", questionsdetail);
    } catch (error) {
      console.error(error);
      unknownError(res, error);
    }
}

  // ---------------------qustions update------------------------
async function updateQuestion(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const {id} = req.params
    const questionsUpdate = await questionModel.findByIdAndUpdate(id, req.body, {new:true})
    return success(res, "Questions Update successfully", questionsUpdate);
  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
}
 
  // ---------------------qustions list------------------------
async function questionsAllList(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    let questionsList = await questionModel.find({status:'active'})
    questionsList = questionsList.map((data) => {
    const filteredQuestionAnswers = data.question_Answer.filter(
      (qa) => qa.status === "active"
    );
    return {
      ...data._doc, 
      question_Answer: filteredQuestionAnswers,
    };
    })
  
    console.log('questionsList',questionsList)
    return success(res, "Questions All List", questionsList);
  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
}

async function userQuestionsList(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const tokenId = req.Id;
    let questionsList = await questionModel.findOne({userId:tokenId})
    return success(res, "Questions List", questionsList);
  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
}

module.exports = { addQuestion , detailQuestion , updateQuestion , questionsAllList , userQuestionsList}
  