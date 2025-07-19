const jinamEntryModel = require("../../model/fileProcess/jinamEntry.model");
const {
  success,
  unknownError,
  serverValidation,
  unauthorized,
  badRequest,
  notFound,
} = require("../../../../../globalHelper/response.globalHelper");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const CreatejinamEntry = async (req,res) =>{
    try {
        const Id = req.Id;
        const {
          customerId,
          customerName,
          partnerName,
          branchName,
          applicantJainamProfileNo,
          coApplicantName,
          coApplicantJainamProfileNo,
          coApplicantTwoName,
          coApplicantTwoJainamProfileNo,
          guarantorName,
          guarantorJainamProfileNo,
          jainamLoanNumber,
          caseDisbursedInjainam,
        } = req.body;

        const data = await jinamEntryModel.create({
          customerId,
          employeeId: Id,
            customerName,
            partnerName,
            branchName,
            applicantJainamProfileNo,
            coApplicantName,
            coApplicantJainamProfileNo,
            coApplicantTwoName,
            coApplicantTwoJainamProfileNo,
            guarantorName,
            guarantorJainamProfileNo,
            jainamLoanNumber,
            caseDisbursedInjainam
        });
        return success(res, "inventory management created successfully", data);
      } catch (error) {
        console.log(error);
        return unknownError(res, error);
      }
}

const jinamEntryDetails = async (req,res) =>{
  try {
      const {customerId} = req.params;
      const data = await jinamEntryModel.findOne({customerId})
      return success(res, "inventory management details", data);
    } catch (error) {
      console.log(error);
      return unknownError(res, error);
    }
}
module.exports = {
  CreatejinamEntry,
  jinamEntryDetails
}