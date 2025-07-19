const {
    success,
    unknownError,
    serverValidation,
    notFound,
    badRequest,
  } = require("../../../../globalHelper/response.globalHelper");
  
  const { validationResult } = require("express-validator");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;

  const customerModel = require("../model/customer.model")
  const okCreditPersonModel = require("../model/adminMaster/okCredit.model")

//   ----------------GET METHOD CASH LOGIN PAYMENT REQUEST----------------
async function getLoginListByToken(req, res) {
    try{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      const tokenId = new ObjectId(req.Id)
     const customerDetail = await customerModel.findById({cashPersonId:tokenId})
    
    } catch (error) {
      console.error(error);
      unknownError(res, error.message);
    }
  }