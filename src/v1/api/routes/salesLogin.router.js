const express = require("express");
const router = express.Router();
const { upload } = require("../../../../Middelware/multer");
const {handleUrlUpload , salesLoginPropertyForm, getSalesLoginProperty, customerChargesForm, getCustomerCharges, 
     chargesDecisionByApprover, getAllCharges , getAllPhysicalFileCouriers , physicalFileDecisionByApprover ,
      cibilByRivertDocuments , allSalesFilesDashBoard  , salesDashBoardBranchTable , salesDashBoardProductTable ,
       salesDashBoardEmployeeTable , branchWiseTotalLogIn , salespersonWithZeroLogin , getActiveSalespersonsPerformance ,
        reasonalBranchWiseLogin  , salespersonWithZeroLoginStateWiseCheck , coapplicantDeleteByCustomerId , customerIdByCoapplicantDeleteList , 
        addDeleteCoapplicantData , finIdByEmployeeDetail , countAvgForMasterDashboard,dashboardMonthlyCount } = require('../controller/salesLogin.controller')

     const {getApprovedCibilReports} = require('../controller/MailFunction/salesMail')
     const {updateApplicantStorage , getDetailAllFiles } = require('../controller/imageConvert')
router.post("/customerDocumentForm", salesLoginPropertyForm);
router.get("/getCustomerDocument", getSalesLoginProperty);

router.post("/cibilDocumentDecision", cibilByRivertDocuments);

router.post("/charges/add", customerChargesForm);
router.get("/charges/get", getCustomerCharges);

router.get("/charges/getList", getAllCharges);
router.post("/charges/approverDecision", chargesDecisionByApprover);

router.get("/physicalFileCourier/getlist" , getAllPhysicalFileCouriers)
router.post("/physicalFileCourier/approverDecision" , physicalFileDecisionByApprover)


router.get("/admin/dashBoard" , allSalesFilesDashBoard)

router.get("/admin/monthly-count" , dashboardMonthlyCount)
// dashbord api for monthly count

router.get("/admin/branchTable" , salesDashBoardBranchTable)
router.get("/admin/productTable" , salesDashBoardProductTable)
router.get("/admin/employeeTable" , salesDashBoardEmployeeTable)
router.get("/admin/master-dashbaord", countAvgForMasterDashboard)

router.get("/getApprovedCibilReports" , getApprovedCibilReports)

router.get("/handleUrlUpload" , handleUrlUpload)

router.get("/branchWiseTotalLogIn",branchWiseTotalLogIn)
router.get("/salespersonWithZeroLogin", salespersonWithZeroLogin)
router.get("/salespersonsPerformance",getActiveSalespersonsPerformance)
router.get("/reasonalBranchWiseLogin" , reasonalBranchWiseLogin)
router.get("/salespersonWithZeroLoginStateWiseCheck",salespersonWithZeroLoginStateWiseCheck)

router.post("/coapplicantDeleteByCustomerId",coapplicantDeleteByCustomerId)
router.get("/deleteCoApplicantList",customerIdByCoapplicantDeleteList)
router.post("/addDeleteCoapplicant",addDeleteCoapplicantData)

router.get("/finIdByEmployeeDetail",finIdByEmployeeDetail)

router.get("/updateApplicantStorage",updateApplicantStorage)
router.get('/getDetailAllFiles',getDetailAllFiles)

module.exports = router;
