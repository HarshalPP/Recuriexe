

const express = require("express");
const router = express.Router();
const { upload } = require("../../../../../Middelware/multer");

const { getCollectionEmployees , getDashboardApi , getBranchCustomerTableView , getEmployeVisitAndCollectionTableView ,
     getAllDisbursedCustomer, getAllocationCustomerByToken,
    newVisitEntry, visitDetailUpdate, getAllVisitDetail,
    newEmiCollectionEntry, updateEmiStatus , getAllEmiCollection , 
    emiStatusUpdateByCashPerson , getcashEmiPerson , getCollectionGalleryApi ,getCollectionGalleryEmployeeId ,
    importAllData,
    depositCashToBank, getDepositCashDetail , getAllLedgerEntries
    } = require("../../controller/collection/newCollection.controller")


router.get("/getEmployees" ,getCollectionEmployees)
router.get("/getDashboardApi" , getDashboardApi)   
router.get("/getBranchCustomerTableView",getBranchCustomerTableView) 
router.get("/getEmployeVisitAndCollectionTableView" , getEmployeVisitAndCollectionTableView)
router.get("/allocation/AllCustomer",getAllDisbursedCustomer)
router.get("/getAllocationCustomerByToken",getAllocationCustomerByToken)
router.post("/saveVisitDetails",newVisitEntry)
router.post("/visitDetailUpdate",visitDetailUpdate)
router.get("/getAllVisit",getAllVisitDetail)
router.post("/saveEmiCollection",newEmiCollectionEntry)
router.post("/updateEmiStatus",updateEmiStatus)
router.get("/listAllEmiCollections",getAllEmiCollection)
router.post("/emiUpdateByCashPerson", emiStatusUpdateByCashPerson)
router.get("/allCashEmiByToken",getcashEmiPerson)
router.get("/getCollectionGalleryApi",getCollectionGalleryApi)
router.get("/getCollectionGalleryEmployeeId",getCollectionGalleryEmployeeId)
router.post("/importAllData",upload.single('sheet'), importAllData)

// Cash Trasfer Route
router.post("/depositCashToBank", depositCashToBank)
router.get("/getDepositCashDetail",getDepositCashDetail)
router.get("/getAllLedgerEntries", getAllLedgerEntries)


 module.exports = router;
 

    
