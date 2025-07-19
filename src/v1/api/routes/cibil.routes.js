const express = require("express");
const router = express.Router();
const {
  cibilAddDetail,
  // addCreditPdReport,
  // allSalesByForms,
  getCibilDetail,
  deleteCibilForm,
  getGenderDistribution,
   cibilByApproveFileOnExtrenalManager , approvedBTFileDelete 
  //  ,checkCibilPendingFileMailSend 
   , updateCibilFetchDates
 ,getCibilDetailSetData ,  updateCibilData , cibilFilesManDashBoard ,newcibilAddDetail,updateCibilRecords  ,
  cibilDashBoardProductTable , cibilDashBoardBranchTable , getCibilDetailsLoanDetailsData ,getCibilDetailsLoanDetailsUpdate, getCibilMultipleScore, updateLastCibilEntry, dashboardMonthlyCount } = require("../controller/cibilController");
const { upload } = require("../../../../Middelware/multer");

// sales signup by admin/manegare/supManegare
router.post(
  "/detail/add",
  upload.fields([
    { name: "applicantCibilReport", maxCount: 1 },
    { name: "coApplicantCibilReport", maxCount: 1 },
    { name: "guarantorCibilReport", maxCount: 1 },
  ]),
  cibilAddDetail
);

router.post("/newcibilAddDetail" , newcibilAddDetail)


router.get("/getCibilDetail/:customerId",getCibilDetail)
router.get("/getCibilDateDetail",getCibilDetailSetData)
router.get("/getCibilMultipleScore" , getCibilMultipleScore)

router.get("/updateCibilData",updateCibilData)


router.post('/deleteCibil',deleteCibilForm)
router.get('/getGenderDistribution',getGenderDistribution)

router.get('/cibilByApproveFileOnExtrenalManager', cibilByApproveFileOnExtrenalManager)
router.get('/approvedBTFileTEST', approvedBTFileDelete)

// router.get("/checkCibilPendingFileMailSend" , checkCibilPendingFileMailSend)

router.get("/updateCibilFetchDates" , updateCibilFetchDates)

router.get("/admin/dashboard" , cibilFilesManDashBoard)

// monthly count
router.get("/admin/dashboardMonthlyCount", dashboardMonthlyCount)

router.get("/admin/productTable" , cibilDashBoardProductTable)
router.get("/admin/branchTable" , cibilDashBoardBranchTable)

router.get("/updateCibilRecords",updateCibilRecords)

router.get("/getCibilDetailsLoanDetailsData",getCibilDetailsLoanDetailsData)
router.post("/getCibilDetailsLoanDetailsUpdate",getCibilDetailsLoanDetailsUpdate)
router.get("/updateLastCibilEntry",updateLastCibilEntry)

module.exports = router;
