
import express from "express";
const router = express.Router();

import { taskAdd , selfTaskDelete,selfTaskUpdate ,addGroupTask,getGroupTaskByToken, getTaskByEmployeeId , getTaskById ,getAllTask,
    getTaskByParticularId,getTaskEmployeeName,getTaskByManagerId, replyOnTaskByTaskId,
    getbodEodVerify, taskUpdateByManager,reAssignTask , getGroupTaskByTaskId, 
    seenAndUnseenMessageByMessageId,getGroupUnseenMessageCount,countTaskStatusApi, 
    getManagerEmployeeHierarchy ,getTaskCalenderApi, getAutoTaskList, getAutoTaskListByEmpId, 
    autoTaskListApi }  from "../../controllers/taskManagementController/task.controller.js"
    
import {verifyEmployeeToken} from "../../middleware/authicationmiddleware.js"


router.post("/add",             verifyEmployeeToken ,    taskAdd)
router.get("/selfTaskDelete",   verifyEmployeeToken ,    selfTaskDelete)
router.post("/selfTaskUpdate",  verifyEmployeeToken ,    selfTaskUpdate)
router.post("/addGroupTask",    verifyEmployeeToken ,    addGroupTask)
router.get("/getBy",            verifyEmployeeToken ,    getTaskByEmployeeId)
router.get("/taskBy",           verifyEmployeeToken ,    getTaskById)
router.get("/selfAndReceivedTask", verifyEmployeeToken,  getAllTask)
router.get("/getTaskByParticularId",verifyEmployeeToken, getTaskByParticularId)
router.get("/getTaskEmployeeName",  verifyEmployeeToken, getTaskEmployeeName)
router.post("/reassign",            verifyEmployeeToken, reAssignTask)
router.get("/bodEodByManagerId",    verifyEmployeeToken, getTaskByManagerId)
router.post("/replyOnTask",         verifyEmployeeToken, replyOnTaskByTaskId)
router.get("/Verify",               verifyEmployeeToken, getbodEodVerify)
router.post("/updateByManager",     verifyEmployeeToken, taskUpdateByManager)
router.get("/getGroupTaskByToken",  verifyEmployeeToken, getGroupTaskByToken)
router.get("/groupTask",            verifyEmployeeToken, getGroupTaskByTaskId)
router.get("/seenAndUnseenBy",      verifyEmployeeToken, seenAndUnseenMessageByMessageId)
router.get("/getGroupUnseenMessageCount",   verifyEmployeeToken , getGroupUnseenMessageCount)
router.get("/countTaskStatusApi",           verifyEmployeeToken , countTaskStatusApi)
router.get("/managerEmployeeHierarchy",     verifyEmployeeToken , getManagerEmployeeHierarchy)
router.get("/getTaskCalenderApi",           verifyEmployeeToken , getTaskCalenderApi)

//auto task listing api base on token
router.get("/getAutoTaskList",   verifyEmployeeToken , getAutoTaskList)

//auto task listing api base on empId
router.get("/getAutoTaskListByEmpId",   verifyEmployeeToken , getAutoTaskListByEmpId)

//all task listing api
router.get("/autoTaskListApi",   verifyEmployeeToken , autoTaskListApi)


export default router;
 

    
