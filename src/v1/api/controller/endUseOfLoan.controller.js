const {
    success,
    unknownError,
    serverValidation,
    badRequest,
    notFound,
    parseJwt,
  } = require("../../../../globalHelper/response.globalHelper");
const  endUseOfLoanModel  = require("../model/endUseOfLoan.model");  
  
async function endUseOfLoanAdd(req, res) {
    try {
      const { name } = req.body  
      const userData = await endUseOfLoanModel.create({name});
      return  success(res, "created successfully", userData) 
    } catch (error) {
      console.error(error);
      return unknownError(res, error.message);
    }
  }

async function endUseOfLoanList(req, res) {
    try {
      const loanData = await endUseOfLoanModel.find();
      return  success(res, "list of end use of loan", loanData) 
    } catch (error) {
      console.error(error);
      return unknownError(res, error.message);
    }
  }  

  async function endUseOfLoanDelete(req, res) {
    try {
      const { _id } = req.body  
      await endUseOfLoanModel.deleteOne({_id});
      return  success(res, "deleted successfully") 
    } catch (error) {
      console.error(error);
      return unknownError(res, error.message);
    }
  }  
  
  module.exports = {
    endUseOfLoanAdd,
    endUseOfLoanList,
    endUseOfLoanDelete
  };
  