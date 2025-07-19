const {
    success,
    unknownError,
    serverValidation,
    badRequest,
  } = require("../../../../../globalHelper/response.globalHelper");
  
  const { validationResult } = require("express-validator");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
  const transferBankNameModel = require("../../model/adminMaster/transferBankName.model");

  // ------------------Admin Master Transfer Bank Name Add-------------------------------
  async function transferBankNameAdd(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      if (req.body.bankName) {
        req.body.bankName = req.body.bankName;
      }
      const bank = await transferBankNameModel.findOne({bankName:req.body.bankName})
      if(bank){
         return badRequest(res, "Bank Name Already Present") 
      }
      const bankDetail = await transferBankNameModel.create(req.body);
      success(res, "Transfer Bank Name Added Successful", bankDetail);

    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  // ------------------Admin Master Bank Name  "active" to  "inactive"(DELETE)---------------
  async function transferBankNameDelete(req, res) {
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
          const bankNameDetail = await transferBankNameModel.findById({ _id: new ObjectId(bankNameId) });
          if (!bankNameDetail) {
            return badRequest(res, "bankNameId  Not Found");
          }

           const bankStatusUpdate =  await transferBankNameModel.findByIdAndUpdate({ _id:bankNameId}, { status: "inactive"},{new:true})
            success(res, "Bank Inactive" ,bankStatusUpdate);
          //  else if (status == "inactive") {
          // const bankStatusUpdate =  await transferBankNameModel.findByIdAndUpdate({ _id:bankNameId}, { status:"inactive"},{new:true})
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
  async function updateTransferBankName(req, res) {
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
  
      const bankNameDetail = await transferBankNameModel.findById({ _id: new ObjectId(bankNameId) });
      if (!bankNameDetail) {
        return badRequest(res, "bankNameId  Not Found");
      }

      const updateData = await transferBankNameModel.findByIdAndUpdate(bankNameId, updateFields, {new :true});
      success(res, "Updated Bank Name",updateData);

    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  

  // ------------------Admin Master Get All Bank Name---------------------------------------
  async function getAllTransferBankName(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      let  bankNameDetail = await transferBankNameModel.find({status:"active"});
      bankNameDetail = bankNameDetail.map((bank)=>{
        return {...bank.toObject() , bankName:bank.bankName.toUpperCase() }
      })
      success(res, "Get All Transfer Bank Name",bankNameDetail);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  


  module.exports = {
    transferBankNameAdd,
    transferBankNameDelete,
    updateTransferBankName,
    getAllTransferBankName,
  };
  