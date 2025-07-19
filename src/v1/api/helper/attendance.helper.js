const { returnFormatter } = require("../formatter/common.formatter");
const attendanceModel = require("../model/adminMaster/attendance.model");
const employeeModel = require("../model/adminMaster/employe.model");




async function checkIfPunchIn(employeeId) {
  try {
    
    const today = new Date();
    const startOfToday = new Date(today);
    
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);
    const employeeData = await employeeModel.findOne({_id:employeeId,onboardingStatus:"enrolled"})
    if (!employeeData) {
      return returnFormatter(
        true,
        "Not an employee",
        true
      )
    }
    const attendanceCheck = await attendanceModel.findOne(
      {
        employeeId,
        date: 
        { 
          $gt: startOfToday, 
          $lt: endOfToday 
        },
      }
    );

    return attendanceCheck || process.env.PLATFORM == 'stage' ? returnFormatter(
      true,
      "Punched In",
      true
    ):returnFormatter(
      true,
      "Not Punched In",
      false
    )
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

async function changePunchInType(employeeId)  {
  try {
    
    const today = new Date();
    const startOfToday = new Date(today);
    
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);
  
    const attendanceCheck = await attendanceModel.findOneAndUpdate(
      {
        employeeId,
        date: 
        { 
          $gt: startOfToday, 
          $lt: endOfToday 
        },
      },
      {
        punchInFrom:"outsideBranch"
      }
    );

    return true
  } catch (error) {
    return false
  }
}

// Export the CRUD methods (and returnFormatter if needed)
module.exports = {
  checkIfPunchIn,
  changePunchInType
};
