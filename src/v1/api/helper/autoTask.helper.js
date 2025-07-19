  const { validationResult } = require("express-validator");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
  const taskModel = require("../model/taskManagement/task.model"); 
  const groupTaskModel = require("../model/taskManagement/groupTask.model")
  const employeModel = require("../model/adminMaster/employe.model")
  const attendanceModel = require("../model/adminMaster/attendance.model")
  const moment = require("moment-timezone");


async function addAutoTask(arguments) {
    try {
      const {  
            employeeId,
            assignBy,
            title,
            task,
            dueDate,
            description,
            startDate,
            redirectUrl,
            taskType,
            customerId
        } = arguments
    
      // Prepare taskEntries entries for each employee
        const taskEntries = {
            employeeId,
            assignBy,
            title,
            task,
            dueDate,
            description,
            startDate,
            redirectUrl,
            taskType,
            customerId
          }
  
      // Insert all entries
     const data =  await taskModel.findOne({employeeId,customerId,taskType})
     
     if(data){
      return "success"
     }
       await taskModel.create(taskEntries);
        return "success"
    } catch (error) {
      console.log(error);
      return unknownError(res, error);
    }
  }

  async function deleteAutoTask(arguments) {
    try {
      const { 
            taskType, 
            employeeId,
            customerId
        } = arguments

      // Prepare taskEntries entries for each employee
        const taskEntries = {
            taskType,
            employeeId,
            customerId
          }
  
      // Insert all entries
      await taskModel.deleteOne(taskEntries);

  
      return "success"
    } catch (error) {
      console.log(error);
      return unknownError(res, error);
    }
  }  

  async function completeAutoTask(arguments) {
    try {
      const { 
            taskType, 
            customerId,
            status,
            endDate
        } = arguments
  
      // Insert all entries
      await taskModel.findOneAndUpdate(
        { 
         taskType,
         customerId
        },
        {
            $set:{
                status,
                endDate  
            }
        }
    );
      return "success"
    } catch (error) {
      console.log(error);
      return unknownError(res, error);
    }
  }  

module.exports = {
    addAutoTask,
    deleteAutoTask,
    completeAutoTask
}  