
const express = require("express");
const router = express.Router();
const {getFileProcessAllocation ,addFileProcessForm ,getFileProcessDetail,checkStatusDetail,customerListFileProcess,
    addSelfAssign,selfAssignList,fileProcessStatus,updateStatus,allFinalSanctionDashboard,fileProcessDashbord,fileProcessBranchList,List, getDashboardData,
    getDashboardDataByProduct,newFileProcessDashbord
} = require("../controller/fileProccess/fileProcess.controller")

router.get("/allocationList",getFileProcessAllocation)
router.post("/addFileProcessForm",addFileProcessForm)
router.get("/getDetail",getFileProcessDetail)

// update fileprocess status check
router.get("/checkStatus",checkStatusDetail)

// update fileprocess status send for sanction
router.get('/sendToHo',updateStatus)

//fileProcess dashbord api
// fileprocess status check
router.get("/customerListFileProcess",customerListFileProcess)

router.get('/selfAssign',addSelfAssign)

// self assign list api
router.get('/selfAssignList',selfAssignList)

// file process status list
router.get('/fileProcessStatus',fileProcessStatus)

// file process dashbord api
router.get('/fileProcessStatus',fileProcessStatus)

router.get('/allFinalSanctionDashboard',allFinalSanctionDashboard)

router.get('/fileProcessDashbord',fileProcessDashbord)

router.get('/newFileProcessDashbord',newFileProcessDashbord)

//fileProcess status by branch
router.get('/fileProcessBranchList',fileProcessBranchList)

//fileProcess status by branch
router.get('/list',List)

router.get('/getDashboardData',getDashboardData)  

router.get('/getDashboardDataByProduct',getDashboardDataByProduct)  

 module.exports = router;