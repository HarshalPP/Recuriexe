const {
    success,
    unknownError,
    serverValidation,
    badRequest,
  } = require("../../../../globalHelper/response.globalHelper");
  
  const { validationResult } = require("express-validator");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
  const backAccountModel = require('../model/bankAccount.model')
  const axios = require("axios");

// ------------Bank Account Detail Fetching Api Using 3rd Party Api---------------------
async function bankAccountDetail(req, res) {
    try {
        const { accountNumber, ifscCode } = req.body;
        const existAccountNumber = await backAccountModel.findOne({"Bank Account Number":accountNumber , "IFSC Code":ifscCode})
        // console.log('data',existAccountNumber)
        if(!existAccountNumber){
        // Step 1: Encrypt
        const encryptResponse = await axios.post(
            "https://www.truthscreen.com/InstantSearch/encrypted_string",
            {
                transID: "123456",
                accountNumber,
                ifscCode,   
                docType:"430"
            },
            {
                headers: {
                    username: "production@fincoopers.in",
                },
            }
        );
        const requestData = encryptResponse.data;

  
      const bankAccountResponse = await axios.post(
        "https://www.truthscreen.com/BankIfscVerification/idsearch",
        {
          requestData,
        },
        {
          headers: {
            username: "production@fincoopers.in",
          },
        }
      );
      const responseData = bankAccountResponse.data.responseData;


        // // Step 3: Decrypt
        const decryptResponse = await axios.post(
            "https://www.truthscreen.com/InstantSearch/decrypt_encrypted_string",
            {
                responseData,
            },
            {
                headers: {
                    username: "production@fincoopers.in",
                },
            }
        );
        if(decryptResponse.data.result && decryptResponse.data.result.status == 0 ){
          badRequest(res,decryptResponse.data.result.msg.status)
        }else{
          const bankDetails = decryptResponse.data.msg;

          const newBankAccount = new backAccountModel({
            accountNumber: accountNumber, // Replace with the appropriate value from req.body or user input
            "Account Holder Name": bankDetails["Account Holder Name"],
            "Bank Account Number": bankDetails["Bank Account Number"],
            "Bank Branch - Address": {
              Address: bankDetails["Bank Branch - Address"].Address,
              Branch: bankDetails["Bank Branch - Address"].Branch,
              City: bankDetails["Bank Branch - Address"].City,
              Contact: bankDetails["Bank Branch - Address"].Contact,
              District: bankDetails["Bank Branch - Address"].District,
              State: bankDetails["Bank Branch - Address"].State
            },
            "Bank Name": bankDetails["Bank Name"],
            "IFSC Code": bankDetails["IFSC Code"]
          });
          // console.log('data save')
          const result = await newBankAccount.save();
          // console.log('Bank account data saved successfully:');
          success(res, "Get Account Detail",bankDetails);
        }


      }else{
      //   // console.log('data already saved')
        success(res, "Get Account Detail..",existAccountNumber);
      }
      } catch (error) {
          console.log(error);
          // unknownError(res, error);
          if (axios.isAxiosError(error)) {
            const { response } = error;
            if (response) {
              if (response.status === 402) {
                return badRequest(res, "Bank credit plan has expired. Recharge now to continue access.");
              }
            } else {
              return unknownError(res, error.message);
            }
          }
        }
      }



module.exports = { bankAccountDetail }