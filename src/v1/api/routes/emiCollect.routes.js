
const express = require("express");
const router = express.Router();
const { upload } = require('../../../../Middelware/multer')
// const multer = require('multer');
// const storage = multer.memoryStorage();
// const upload1 = multer({ storage: storage });
const { getAllocationMobileDashboard , getAllocationGoogleSheet, getAllocationCase1Case2 ,getAllCustomerLatLong,
     getAllEmployeesLatLog, visitFormAdd ,getVisitDetail,visitUpdate,getVisitDetailByLD, empVisitCollectionByLD ,visitCollectionEmployeId,
     collectionEmiFormAdd,getEmiCollectionDetail,getEmiCollection ,  emiStatusUpdate, emiEmailUpdate,
     getCollectionDetailByLD, getLegalNoticeByLD,collectionGalleryAPi, newCollectionGalleryAPi , collectionGalleryManagerAPi , 
     getVisitDetailsByCustomerId, getEmployeesNotInVisitOrCollection , LegalNotice ,
     collectionEmiOkCreditAdd ,emiEmiOkCreditUpdate, getAllocationDetailsAndSendEmail,googleSheetCustomerLatLong ,
     googleSheetLatLongWithoutPagination , tableViewData ,googleSheetCustomerSave ,getEmployeesForMap ,
     getAllGoogleCustomer,  allCustomerDashboard ,piChartDashboardApi, branchWiseVisitAndCollTable ,
     managerWiseVisitAndCollTable , employeeWiseVisitAndCollTable, customerListNotVisitOrCollection , reportingDashBoardVisit , 
     zeroVisitOrCollection } = require("../controller/collection/emiCollect.Controller")

const { visitAndCollectionMailSend, sendTargetNotCompletedMails ,zeroVisitZeroEmiWarningMail, 
     sendRevisitReminderMails ,sendPartnerWiseCollectionSummary} = require("../controller/collection/collectionMailSetup.controller")    

const { getCrmPersonGoogleSheet,getCrmBranchGoogleSheet, crmFormAdd, crmBranchFormAdd, getCrmDetail, getCallDoneByLD,} = require("../controller/collection/emiCallTracking.controller")

const {posCloserApi , getCloserDetailByLD ,getposCloserDetail , posCloserUpdate} = require("../controller/collection/posCloser.controller")

// router.post("/emailSend",         emailSend)
router.get("/getAllocationDashboard",  getAllocationMobileDashboard)
router.get("/overAllEmiData",         getAllocationGoogleSheet)
router.get("/getAllocation",          getAllocationCase1Case2)
router.get("/getAllLatLong",          getAllCustomerLatLong)
router.get("/getAllEmployees",          getAllEmployeesLatLog)
router.get("/getMapEmployees",          getEmployeesForMap)

router.post("/visitFormAdd",          visitFormAdd)
router.get("/getVisitDetail",         getVisitDetail)
router.post("/visitUpdate",           visitUpdate)
router.get("/visitDetail",            getVisitDetailByLD)
router.get("/empVisitCollectionByLD",    empVisitCollectionByLD)
router.get("/visitCollectionEmployeId",visitCollectionEmployeId)
router.post("/collectionEmiFormAdd",  collectionEmiFormAdd)
router.get("/getEmiCollectionDetail", getEmiCollectionDetail)
router.get("/getEmiCollection",       getEmiCollection)
router.post("/emiStatusUpdate",       emiStatusUpdate)
router.post("/emailUpdate",           emiEmailUpdate)
router.get("/collectionDetail",       getCollectionDetailByLD)
router.get("/getCrmPersonGoogleSheet",getCrmPersonGoogleSheet)
router.get("/getCrmBranch",           getCrmBranchGoogleSheet)
router.post("/crmFormAdd",            crmFormAdd)
router.post("/crmBranchFormAdd",      crmBranchFormAdd)
router.get("/getCrmDetail",           getCrmDetail)
router.get("/callDoneBy",             getCallDoneByLD)
router.get("/getLegalNoticeBy",       getLegalNoticeByLD)
router.get("/getTodayEmiAndVisitImage",collectionGalleryAPi) , 
router.get("/collectionGalleryAPi",newCollectionGalleryAPi)
router.get("/collectionGalleryManagerAPi",collectionGalleryManagerAPi) , 
router.get("/getVisitDetailsBy",getVisitDetailsByCustomerId)
router.get("/noVisitAndNoCollection",  getEmployeesNotInVisitOrCollection)
router.get("/LegalNotice",             LegalNotice)
router.post("/collectionEmiOkCreditAdd",collectionEmiOkCreditAdd)
router.post("/emiEmiOkCreditUpdate",    emiEmiOkCreditUpdate)
router.get("/getAllocationDetailsAndSendEmail",    getAllocationDetailsAndSendEmail)
router.get('/googleSheetCustomerLatLong',googleSheetCustomerLatLong)
router.get('/latLongWithoutPagination',googleSheetLatLongWithoutPagination)
router.get('/tableViewData',tableViewData)
router.get("/googleSheetCustomerSave",googleSheetCustomerSave)
router.get("/getAllGoogleCustomer",getAllGoogleCustomer)
router.get("/allCustomerData",allCustomerDashboard)
router.get("/reportingDashBoardVisit",reportingDashBoardVisit)
router.get("/piChartDashboardApi",piChartDashboardApi)
router.get("/branchCustomerTableDasboard",branchWiseVisitAndCollTable)
router.get("/managerWiseVisitAndCollTable",managerWiseVisitAndCollTable)
router.get("/empVisitAndCollectionTableView",employeeWiseVisitAndCollTable)
router.get("/customerListNotVisitOrCollection",customerListNotVisitOrCollection)
router.get("/zeroVisitOrCollection",zeroVisitOrCollection)

router.get("/visitAndCollectionMailSend",visitAndCollectionMailSend)
router.get("/sendTargetNotCompletedMails",sendTargetNotCompletedMails)
router.get("/zeroVisitZeroEmiWarningMail",zeroVisitZeroEmiWarningMail)
router.get("/sendRevisitReminderMails", sendRevisitReminderMails)
router.get("/sendPartnerWiseCollectionSummary",sendPartnerWiseCollectionSummary)


router.post("/posCloserForm",     posCloserApi)
router.get("/getCloserDetailBy" , getCloserDetailByLD)
router.get("/getposCloserDetail", getposCloserDetail)
router.post("/posCloserUpdate" ,  posCloserUpdate)

 module.exports = router;
 

    
