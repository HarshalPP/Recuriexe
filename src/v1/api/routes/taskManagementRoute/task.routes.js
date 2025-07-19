
const express = require("express");
const router = express.Router();

const { addGroupTask ,getGroupTaskByToken }= require("../../controller/taskManagement/groupTask.controller")
const { taskAdd , selfTaskDelete,selfTaskUpdate , getTaskByEmployeeId , getTaskById ,getAllTask,
    getTaskByParticularId,getTaskEmployeeName,getTaskByManagerId, replyOnTaskByTaskId,
    getbodEodVerify, taskUpdateByManager,reAssignTask , getGroupTaskByTaskId, 
    seenAndUnseenMessageByMessageId,getGroupUnseenMessageCount,countTaskStatusApi, 
    getManagerEmployeeHierarchy ,getTaskCalenderApi, getAutoTaskList, getAutoTaskListByEmpId, autoTaskListApi } = require("../../controller/taskManagement/task.controller")

router.post("/add",             taskAdd)
router.get("/selfTaskDelete",   selfTaskDelete)
router.post("/selfTaskUpdate",  selfTaskUpdate)
router.post("/addGroupTask",    addGroupTask)
router.get("/getBy",            getTaskByEmployeeId)
router.get("/taskBy",           getTaskById)
router.get("/selfAndReceivedTask",           getAllTask)
router.get("/getTaskByParticularId",getTaskByParticularId)
router.get("/getTaskEmployeeName",  getTaskEmployeeName)
router.post("/reassign",            reAssignTask)
router.get("/bodEodByManagerId",    getTaskByManagerId)
router.post("/replyOnTask",         replyOnTaskByTaskId)
router.get("/Verify",               getbodEodVerify)
router.post("/updateByManager",     taskUpdateByManager)
router.get("/getGroupTaskByToken",  getGroupTaskByToken)
router.get("/groupTask",            getGroupTaskByTaskId)
router.get("/seenAndUnseenBy",      seenAndUnseenMessageByMessageId)
router.get("/getGroupUnseenMessageCount", getGroupUnseenMessageCount)
router.get("/countTaskStatusApi",         countTaskStatusApi)
router.get("/managerEmployeeHierarchy",   getManagerEmployeeHierarchy)
router.get("/getTaskCalenderApi",getTaskCalenderApi)

//auto task listing api base on token
router.get("/getAutoTaskList",getAutoTaskList)

//auto task listing api base on empId
router.get("/getAutoTaskListByEmpId",getAutoTaskListByEmpId)

//all task listing api
router.get("/autoTaskListApi",autoTaskListApi)


 module.exports = router;
 

    
