const { success, badRequest, unknownError } = require("../../../../../globalHelper/response.globalHelper");
const { deleteSheetShareById, updateSheetShareById, getSheetShareById, getAllSheetShares, createSheetShare, getSheetShareOfUser, getSharedSheetWithUser } = require("../../helper/sheetSharing/sheetSharing.helper");

async function createSheetShareController(req, res) {
    try {
      // Typically, req.body holds the data needed to create the record
      req.body.creator = req.Id;
      const {  status, message, data } = await createSheetShare(req.body);
      return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {

      return unknownError(res, error.message);
    }
  }

  async function getAllSheetSharesController(req, res) {
    try {
      const {  status, message, data } = await getAllSheetShares();
      return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  }
  
  async function getSheetShareByIdController(req, res) {
    try {
      // Assuming the ID is passed as a URL param
      const { id } = req.params;
      const {  status, message, data } = await getSheetShareById(id);
      return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  }

  async function getSheetShareOfUserController(req, res) {
    try {
      const {  status, message, data } = await getSheetShareOfUser(req.Id);
      return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  }

  async function getSharedSheetWithUserController(req, res) {
    try {
      const {  status, message, data } = await getSharedSheetWithUser(req.Id);
      return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  }
  

  async function updateSheetShareByIdController(req, res) {
    try {
      // Assuming the ID is passed as a URL param
      const { id } = req.params;
      // req.body contains the fields to be updated
      const {  status, message, data } = await updateSheetShareById(id, req.body);
      return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  }
  

  async function deleteSheetShareByIdController(req, res) {
    try {
      const { id } = req.params;
      const {  status, message, data } = await deleteSheetShareById(id);
      return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  }
  
  module.exports = {
    createSheetShareController,
    getAllSheetSharesController,
    getSheetShareByIdController,
    updateSheetShareByIdController,
    deleteSheetShareByIdController,
    getSheetShareOfUserController,
    getSharedSheetWithUserController
  };