const {
    success,
    unknownError,
    serverValidation,
    badRequest,
  } = require("../../../../../globalHelper/response.globalHelper");
  
  const { validationResult } = require("express-validator");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
  const bankNameModel = require("../../model/adminMaster/bank.model");

  // ------------------Admin Master Bank Name Add---------------------------------------
  async function bankNameAdd(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      if (req.body.title) {
        req.body.title = req.body.title;
      }
      const bank = await bankNameModel.findOne({title:req.body.title})
      if(bank){
         return badRequest(res, "Title Already Present") 
      }
      const bankDetail = await bankNameModel.create(req.body);
     
      success(res, "Bank Name Added Successful", bankDetail);

    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  
  // ------------------Admin Master Bank Name  "active" to  "inactive"(DELETE)---------------------------------------
  async function bankNameDelete(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            serverValidation(res, { errorName: "serverValidation", errors: errors.array() });
        } else {
          // const status = req.body.status
          const { bankNameId } = req.body;
          if (!bankNameId || bankNameId.trim() === "") {
              return badRequest(res , "BankName Id is required and cannot be empty");
          }
          if (!mongoose.Types.ObjectId.isValid(bankNameId)) {
            return badRequest(res , "Invalid ID");
          }
          const bankNameDetail = await bankNameModel.findById({ _id: new ObjectId(bankNameId) });
          if (!bankNameDetail) {
            return badRequest(res, "bankNameId  Not Found");
          }

           const bankStatusUpdate =  await bankNameModel.findByIdAndUpdate({ _id:bankNameId}, { status: "inactive"},{new:true})
            success(res, "Bank Inactive" ,bankStatusUpdate);
          //  else if (status == "inactive") {
          // const bankStatusUpdate =  await bankNameModel.findByIdAndUpdate({ _id:bankNameId}, { status:"inactive"},{new:true})
          //   success(res, "Bank inactive" ,bankStatusUpdate);
          //   }
          //   else{
          //       return badRequest(res,"Status must be 'active' or 'inactive'");
          //   }
        }
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
  }
  
  // ------------------Admin Master Update  bank Name ---------------------------------------
  async function updateBankName(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      let { bankNameId, ...updateFields } = req.body;
      if (typeof updateFields.bankName === 'string') {
        updateFields.bankName = updateFields.bankName.trim().toLowerCase();
      }

      if (!bankNameId || bankNameId.trim() === "") {
        return badRequest(res, "Please Select bankNameId");
      }
  
      const bankNameDetail = await bankNameModel.findById({ _id: new ObjectId(bankNameId) });
      if (!bankNameDetail) {
        return badRequest(res, "bankNameId  Not Found");
      }

      const updateData = await bankNameModel.findByIdAndUpdate(bankNameId, updateFields, {new :true});
      success(res, "Updated Bank Name",updateData);

    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  

  // ------------------Admin Master Get All Bank Name---------------------------------------
  async function getAllBankName(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      let  bankNameDetail = await bankNameModel.find({status:"active"});
      bankNameDetail = bankNameDetail.map((bank)=>{
        return {...bank.toObject() , bankName:bank.title.toUpperCase() }
      })
      success(res, "All Bank Name",bankNameDetail);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  



  

  module.exports = {
    bankNameAdd,
    bankNameDelete,
    updateBankName,
    getAllBankName,
  };
  