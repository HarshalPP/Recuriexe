const leaveTypeModel = require("../../model/hrms/leavetype.model");
const {
    success,
    unknownError,
    serverValidation,
    badRequest,
    parseJwt,
  } = require("../../../../../globalHelper/response.globalHelper");


// Add Leave Type

const addLeaveType = async (req, res) => {
    try {
      const { leaveTypeName } = req.body;
      if (!leaveTypeName) {
        return serverValidation(res, "Leave Type is required");
      }
        const leaveTypeExist = await leaveTypeModel.findOne({ leaveTypeName });
        if (leaveTypeExist) {
            return badRequest(res, "Leave Type Already Exist");
        }
      const leaveTypeData = new leaveTypeModel({
        leaveTypeName,
      });
      await leaveTypeData.save();
      return success(res, "Leave Type Added Successfully" , leaveTypeData);
    } catch (error) {
      return unknownError(res, error.message);
    }
  };


const getAllLeaveType = async (req, res) => {
    try {
      const leaveTypeData = await leaveTypeModel.find().sort({ createdAt: -1 });
      return success(res, "Leave Type Data", leaveTypeData);
    } catch (error) {
      return unknownError(res, error.message);
    }
  };
  
  
    module.exports = {
    addLeaveType,
    getAllLeaveType
    }
  