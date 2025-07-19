const fileEnventoryModel = require("../../model/fileProcess/fileEnventory.model");
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

const jinamManagement = async (req, res) => {
  try {
    const Id = req.Id;
    const {
      customerId,
      customerName,
      fatherName,
      loanNumber,
      sanctionRemarks,
      disbursementRemarks,
      fileNo,
    } = req.body;
    const fileData = req.files;

    console.log(fileData, "fileData<><>");
    const allPhysicalSanctionDocument = (
      req.files["allPhysicalSanctionDocument"] || []
    ).map((file) => file.filename);
    const allPhysicalDisbursementDocument = (
      req.files["allPhysicalDisbursementDocument"] || []
    ).map((file) => file.filename);

    const data = await fileEnventoryModel.create({
      customerId,
      employeeId: Id,
      customerName,
      fatherName,
      loanNumber,
      sanction: {
        allPhysicalSanctionDocument,
        sanctionRemarks,
      },
      disbursement: {
        allPhysicalDisbursementDocument,
        disbursementRemarks,
        fileNo,
      },
    });
    return success(res, "inventory management created successfully", data);
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
};

const fileEnventroyDetails = async (req, res) => {
  try {
    const { customerId } = req.params;
    const data = await fileEnventoryModel.findOne({ customerId });
    return success(res, "inventory management details ", data);
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
};

module.exports = {
  jinamManagement,
  fileEnventroyDetails,
};
